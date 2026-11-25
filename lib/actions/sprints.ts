"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkWrite, OK, type ActionResult } from "@/lib/action-result";
import { sprintSchema, sprintStatusSchema, type SprintValues } from "@/lib/schemas";

// Message quand la RLS refuse d'écrire dans la table sprints.
const SPRINT_REFUSED = "La base a refusé cette modification du sprint (droits insuffisants).";

function toSprintRow(values: SprintValues) {
  return {
    start_date: values.start_date,
    end_date: values.end_date,
    goal: values.goal || null,
  };
}

// Un nouveau sprint prend le statut par défaut de la base (« planned »).
export async function createSprint(values: SprintValues): Promise<ActionResult> {
  const parsed = sprintSchema.safeParse(values);
  if (!parsed.success) return { error: "Vérifie les dates du sprint." };

  const supabase = await createClient();
  const result = await supabase.from("sprints").insert(toSprintRow(parsed.data)).select("id");
  const checked = checkWrite(result, "La base a refusé la création du sprint (droits insuffisants).");
  if (!checked.error) revalidatePath("/", "layout");
  return checked;
}

export async function updateSprint(sprintId: number, values: SprintValues): Promise<ActionResult> {
  const parsed = sprintSchema.safeParse(values);
  if (!parsed.success) return { error: "Vérifie les dates du sprint." };

  const supabase = await createClient();
  const result = await supabase.from("sprints").update(toSprintRow(parsed.data)).eq("id", sprintId).select("id");
  const checked = checkWrite(result, SPRINT_REFUSED);
  if (!checked.error) revalidatePath("/", "layout");
  return checked;
}

// Branchée sur un formulaire via useActionState (état précédent + FormData).
export async function updateSprintStatus(
  sprintId: number,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const status = sprintStatusSchema.safeParse(formData.get("status"));
  if (!status.success) return { error: "Statut inconnu." };

  const supabase = await createClient();
  const result = await supabase.from("sprints").update({ status: status.data }).eq("id", sprintId).select("id");
  const checked = checkWrite(result, SPRINT_REFUSED);
  if (!checked.error) revalidatePath("/", "layout");
  return checked;
}

// Ajoute au sprint les features cochées dans la fenêtre « Ajouter depuis le backlog ».
export async function addFeaturesToSprint(sprintId: number, formData: FormData): Promise<ActionResult> {
  const featureIds = z.array(z.coerce.number().int().positive()).safeParse(formData.getAll("feature_ids"));
  if (!featureIds.success) return { error: "Sélection invalide." };
  if (featureIds.data.length === 0) return OK;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("features")
    .update({ sprint_id: sprintId })
    .in("id", featureIds.data)
    .select("id");
  if (error) return { error: "La base a refusé l'ajout au sprint." };

  revalidatePath("/", "layout");
  // La RLS peut refuser une partie des features seulement : on le signale.
  const refused = featureIds.data.length - (data?.length ?? 0);
  if (refused > 0) {
    return {
      error: `${refused} feature${refused > 1 ? "s n'ont" : " n'a"} pas pu être ajoutée${refused > 1 ? "s" : ""} : seuls un admin ou la personne assignée peuvent la déplacer.`,
    };
  }
  return OK;
}
