"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sprintSchema, sprintStatusSchema, type SprintValues } from "@/lib/schemas";

type ActionResult = { error: string | null };

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
  const { error } = await supabase.from("sprints").insert(toSprintRow(parsed.data));
  if (error) return { error: "Le sprint n'a pas pu être créé." };

  revalidatePath("/", "layout");
  return { error: null };
}

export async function updateSprint(sprintId: number, values: SprintValues): Promise<ActionResult> {
  const parsed = sprintSchema.safeParse(values);
  if (!parsed.success) return { error: "Vérifie les dates du sprint." };

  const supabase = await createClient();
  const { error } = await supabase.from("sprints").update(toSprintRow(parsed.data)).eq("id", sprintId);
  if (error) return { error: "Le sprint n'a pas pu être modifié." };

  revalidatePath("/", "layout");
  return { error: null };
}

export async function updateSprintStatus(sprintId: number, formData: FormData) {
  const status = sprintStatusSchema.parse(formData.get("status"));
  const supabase = await createClient();
  await supabase.from("sprints").update({ status }).eq("id", sprintId);
  revalidatePath("/", "layout");
}

// Ajoute au sprint les features cochées dans la fenêtre « Ajouter depuis le backlog ».
export async function addFeaturesToSprint(sprintId: number, formData: FormData) {
  const featureIds = z
    .array(z.coerce.number().int().positive())
    .parse(formData.getAll("feature_ids"));
  if (featureIds.length === 0) return;

  const supabase = await createClient();
  await supabase.from("features").update({ sprint_id: sprintId }).in("id", featureIds);
  revalidatePath("/", "layout");
}
