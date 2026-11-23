"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { moduleSchema, type ModuleValues } from "@/lib/schemas";

type ActionResult = { error: string | null };

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
  const { error } =
    moduleId === null
      ? await supabase.from("modules").insert(row)
      : await supabase.from("modules").update(row).eq("id", moduleId);

  if (error) {
    // 23505 : code PostgreSQL d'une valeur unique déjà utilisée (ici le nom)
    if (error.code === "23505") return { error: "Un module porte déjà ce nom." };
    return { error: "Le module n'a pas pu être enregistré." };
  }

  revalidatePath("/", "layout");
  return { error: null };
}
