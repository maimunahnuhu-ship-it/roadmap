"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkWrite, type ActionResult } from "@/lib/action-result";
import { profileSchema, type ProfileValues } from "@/lib/schemas";

// Modifie le prénom et le nom du membre connecté.
// On n'écrit que ces deux colonnes : le rôle n'est jamais touché
// (la policy « Users can update own profile without changing role » l'interdit de toute façon).
export async function updateMyProfile(values: ProfileValues): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { error: "Vérifie les champs du formulaire." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu dois être connecté pour modifier ton profil." };

  const result = await supabase
    .from("profiles")
    .update({ firstname: parsed.data.firstname, lastname: parsed.data.lastname })
    .eq("id", user.id)
    .select("id");
  const checked = checkWrite(result, "La base a refusé la modification de ton profil.");
  if (!checked.error) revalidatePath("/", "layout");
  return checked;
}
