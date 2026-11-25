"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkWrite, type ActionResult } from "@/lib/action-result";
import { moduleSchema, type ModuleValues } from "@/lib/schemas";

// Crée un module (moduleId = null) ou modifie un module existant.
export async function saveModule(moduleId: number | null, values: ModuleValues): Promise<ActionResult> {
  const parsed = moduleSchema.safeParse(values);
  if (!parsed.success) return { error: "Vérifie les champs du formulaire." };

  const row = {
    name: parsed.data.name,
    color: parsed.data.color,
    description: parsed.data.description || null,
  };

  const supabase = await createClient();
  // .select("id") : on récupère les lignes écrites, pour repérer un refus silencieux de la RLS.
  const result =
    moduleId === null
      ? await supabase.from("modules").insert(row).select("id")
      : await supabase.from("modules").update(row).eq("id", moduleId).select("id");

  // 23505 : code PostgreSQL d'une valeur unique déjà utilisée (ici le nom)
  if (result.error?.code === "23505") return { error: "Un module porte déjà ce nom." };

  const checked = checkWrite(result, "La base a refusé d'enregistrer le module (droits insuffisants).");
  if (!checked.error) revalidatePath("/", "layout");
  return checked;
}
