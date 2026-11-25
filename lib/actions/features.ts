"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { FEATURE_STATUSES, PRIORITIES } from "@/lib/constants";
import { NO_SPRINT, type KanbanGroup } from "@/lib/views";
import { checkWrite, type ActionResult } from "@/lib/action-result";
import { commentSchema, featureSchema, type CommentValues, type FeatureValues } from "@/lib/schemas";

// Server Actions des features : elles s'exécutent sur le serveur,
// valident les données avec zod puis écrivent dans Supabase.
// La RLS décide qui a le droit d'écrire : chaque action renvoie
// un message clair quand la base refuse.

// Message commun quand la RLS refuse de modifier une feature.
const FEATURE_REFUSED =
  "Modification refusée : seuls un admin ou la personne assignée peuvent modifier cette feature.";

// Convertit les valeurs du formulaire (du texte) en ligne de la table features.
function toFeatureRow(values: FeatureValues) {
  return {
    title: values.title,
    module_id: Number(values.module_id),
    description: values.description.trim() || null,
    status: values.status,
    priority: values.priority,
    impact: values.impact,
    effort: values.effort || null,
    sprint_id: values.sprint_id ? Number(values.sprint_id) : null,
    assigned_to: values.assigned_to || null,
  };
}

// Écrit un changement sur une feature et vérifie qu'une ligne a bien été modifiée.
async function updateOneFeature(
  featureId: number,
  change: Partial<ReturnType<typeof toFeatureRow>>,
): Promise<ActionResult> {
  const supabase = await createClient();
  const result = await supabase.from("features").update(change).eq("id", featureId).select("id");
  const checked = checkWrite(result, FEATURE_REFUSED);
  if (!checked.error) revalidatePath("/", "layout");
  return checked;
}

export async function createFeature(values: FeatureValues): Promise<ActionResult> {
  const parsed = featureSchema.safeParse(values);
  if (!parsed.success) return { error: "Vérifie les champs du formulaire." };

  const supabase = await createClient();
  const result = await supabase.from("features").insert(toFeatureRow(parsed.data)).select("id");
  const checked = checkWrite(result, "Création refusée : seul un admin peut créer une feature.");
  if (!checked.error) revalidatePath("/", "layout");
  return checked;
}

export async function updateFeature(featureId: number, values: FeatureValues): Promise<ActionResult> {
  const parsed = featureSchema.safeParse(values);
  if (!parsed.success) return { error: "Vérifie les champs du formulaire." };
  return updateOneFeature(featureId, toFeatureRow(parsed.data));
}

// Suppression : ses commentaires partent avec elle (ON DELETE CASCADE).
// Le retour au Backlog est fait par le navigateur, qui affiche aussi une notification.
export async function deleteFeature(featureId: number): Promise<ActionResult> {
  const supabase = await createClient();
  const result = await supabase.from("features").delete().eq("id", featureId).select("id");
  const checked = checkWrite(
    result,
    "Suppression refusée : seuls un admin ou la personne assignée peuvent supprimer cette feature.",
  );
  // Pas de revalidatePath ici : il recalculerait tout de suite la page de la feature
  // supprimée (page 404). Le navigateur part vers le Backlog, chargé à neuf.
  return checked;
}

// Les actions suivantes sont branchées sur un formulaire (FormData) via
// useActionState : elles reçoivent l'état précédent et renvoient le nouveau,
// ce qui permet d'afficher le message d'erreur sous le formulaire.

export async function updateFeatureStatus(
  featureId: number,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const status = z.enum(FEATURE_STATUSES).safeParse(formData.get("status"));
  if (!status.success) return { error: "Statut inconnu." };
  return updateOneFeature(featureId, { status: status.data });
}

export async function updateFeatureAssignee(
  featureId: number,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  // "" = personne ; sinon l'identifiant (uuid) d'un membre
  const assignee = z.union([z.literal(""), z.uuid()]).safeParse(formData.get("assigned_to"));
  if (!assignee.success) return { error: "Membre inconnu." };
  return updateOneFeature(featureId, { assigned_to: assignee.data || null });
}

// Place la feature dans un sprint, ou la renvoie au backlog quand sprint_id est vide.
export async function updateFeatureSprint(
  featureId: number,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const sprintId = z
    .union([z.literal(""), z.coerce.number().int().positive()])
    .safeParse(formData.get("sprint_id"));
  if (!sprintId.success) return { error: "Sprint inconnu." };
  return updateOneFeature(featureId, { sprint_id: sprintId.data === "" ? null : sprintId.data });
}

// Traduit « colonne d'arrivée » en changement à écrire dans la table features.
// Renvoie null si la valeur reçue n'est pas valide.
function toColumnChange(group: KanbanGroup, value: string) {
  const id = z.coerce.number().int().positive().safeParse(value);

  if (group === "statut") {
    const status = z.enum(FEATURE_STATUSES).safeParse(value);
    return status.success ? { status: status.data } : null;
  }
  if (group === "priorite") {
    const priority = z.enum(PRIORITIES).safeParse(value);
    return priority.success ? { priority: priority.data } : null;
  }
  if (group === "module") {
    return id.success ? { module_id: id.data } : null;
  }
  // Groupe « sprint » : la colonne « Sans sprint » renvoie la feature au backlog.
  if (value === NO_SPRINT) return { sprint_id: null };
  return id.success ? { sprint_id: id.data } : null;
}

// Appelée par le Kanban quand on dépose une carte dans une autre colonne :
// on met à jour le champ qui correspond au regroupement choisi.
export async function moveFeature(featureId: number, group: KanbanGroup, value: string): Promise<ActionResult> {
  const change = toColumnChange(group, value);
  if (!change) return { error: "Cette colonne est inconnue." };
  return updateOneFeature(featureId, change);
}

export async function addComment(featureId: number, values: CommentValues): Promise<ActionResult> {
  const parsed = commentSchema.safeParse(values);
  if (!parsed.success) return { error: "Le commentaire est vide." };

  const supabase = await createClient();
  // L'auteur est toujours le membre connecté : on ne le reçoit pas du formulaire.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu dois être connecté pour commenter." };

  const result = await supabase
    .from("comments")
    .insert({ content: parsed.data.content, feature_id: featureId, author_id: user.id })
    .select("id");
  const checked = checkWrite(result, "Le commentaire a été refusé par la base.");
  if (!checked.error) revalidatePath("/", "layout");
  return checked;
}

// Modifie le texte d'un commentaire (la RLS n'autorise que son auteur).
export async function updateComment(commentId: number, values: CommentValues): Promise<ActionResult> {
  const parsed = commentSchema.safeParse(values);
  if (!parsed.success) return { error: "Le commentaire est vide." };

  const supabase = await createClient();
  const result = await supabase
    .from("comments")
    .update({ content: parsed.data.content })
    .eq("id", commentId)
    .select("id");
  const checked = checkWrite(result, "Modification refusée : seul l'auteur peut modifier ce commentaire.");
  if (!checked.error) revalidatePath("/", "layout");
  return checked;
}
