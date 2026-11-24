"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { FEATURE_STATUSES, PRIORITIES } from "@/lib/constants";
import { NO_SPRINT, type KanbanGroup } from "@/lib/views";
import { commentSchema, featureSchema, type CommentValues, type FeatureValues } from "@/lib/schemas";

// Server Actions des features : elles s'exécutent sur le serveur,
// valident les données avec zod puis écrivent dans Supabase.

type ActionResult = { error: string | null };

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

export async function createFeature(values: FeatureValues): Promise<ActionResult> {
  const parsed = featureSchema.safeParse(values);
  if (!parsed.success) return { error: "Vérifie les champs du formulaire." };

  const supabase = await createClient();
  const { error } = await supabase.from("features").insert(toFeatureRow(parsed.data));
  if (error) return { error: "La feature n'a pas pu être créée." };

  revalidatePath("/", "layout");
  return { error: null };
}

export async function updateFeature(featureId: number, values: FeatureValues): Promise<ActionResult> {
  const parsed = featureSchema.safeParse(values);
  if (!parsed.success) return { error: "Vérifie les champs du formulaire." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("features")
    .update(toFeatureRow(parsed.data))
    .eq("id", featureId);
  if (error) return { error: "La feature n'a pas pu être modifiée." };

  revalidatePath("/", "layout");
  return { error: null };
}

// Les actions suivantes reçoivent un FormData : elles sont branchées
// directement sur un <form action={...}>, sans JavaScript côté navigateur.

export async function updateFeatureStatus(featureId: number, formData: FormData) {
  const status = z.enum(FEATURE_STATUSES).parse(formData.get("status"));
  const supabase = await createClient();
  await supabase.from("features").update({ status }).eq("id", featureId);
  revalidatePath("/", "layout");
}

export async function updateFeatureAssignee(featureId: number, formData: FormData) {
  // "" = personne ; sinon l'identifiant (uuid) d'un membre
  const assignee = z.union([z.literal(""), z.uuid()]).parse(formData.get("assigned_to"));
  const supabase = await createClient();
  await supabase
    .from("features")
    .update({ assigned_to: assignee || null })
    .eq("id", featureId);
  revalidatePath("/", "layout");
}

// Place la feature dans un sprint, ou la renvoie au backlog quand sprint_id est vide.
export async function updateFeatureSprint(featureId: number, formData: FormData) {
  const sprintId = z.union([z.literal(""), z.coerce.number().int().positive()]).parse(
    formData.get("sprint_id"),
  );
  const supabase = await createClient();
  await supabase
    .from("features")
    .update({ sprint_id: sprintId === "" ? null : sprintId })
    .eq("id", featureId);
  revalidatePath("/", "layout");
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

  const supabase = await createClient();
  const { error } = await supabase.from("features").update(change).eq("id", featureId);
  if (error) return { error: "Le déplacement n'a pas pu être enregistré." };

  revalidatePath("/", "layout");
  return { error: null };
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

  const { error } = await supabase.from("comments").insert({
    content: parsed.data.content,
    feature_id: featureId,
    author_id: user.id,
  });
  if (error) return { error: "Le commentaire n'a pas pu être envoyé." };

  revalidatePath("/", "layout");
  return { error: null };
}
