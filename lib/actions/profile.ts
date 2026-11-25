"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkWrite, type ActionResult } from "@/lib/action-result";
import { AVATAR_TYPES, checkAvatarFile } from "@/lib/avatar";
import { profileSchema, type ProfileValues } from "@/lib/schemas";

// Remplace la photo de profil du membre connecté :
// 1. envoi de l'image dans le bucket « avatars », dans le dossier du membre ;
// 2. enregistrement de son adresse publique dans profiles.avatar_url.
export async function uploadAvatar(formData: FormData): Promise<ActionResult> {
  const file = formData.get("avatar");
  if (!(file instanceof File)) return { error: "Choisis une image." };
  const invalid = checkAvatarFile(file);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu dois être connecté pour changer ta photo." };

  // avatars/<mon uuid>/profile.<extension> : la policy du bucket n'autorise
  // chaque membre qu'à écrire dans le dossier qui porte son propre id.
  // upsert: true remplace la photo si le fichier existe déjà.
  const path = `${user.id}/profile.${AVATAR_TYPES[file.type]}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) return { error: "L'envoi de l'image a été refusé." };

  // Le nom du fichier ne change pas d'une photo à l'autre : on ajoute ?v=<date>
  // à l'adresse pour que les navigateurs n'affichent pas l'ancienne image gardée en cache.
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;

  const result = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id).select("id");
  const checked = checkWrite(result, "L'image est envoyée, mais la base a refusé de l'enregistrer dans ton profil.");
  if (!checked.error) revalidatePath("/", "layout");
  return checked;
}

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
