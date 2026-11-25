import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Lectures réutilisées par plusieurs pages (toujours côté serveur).

// Colonnes à charger pour afficher une feature avec son module et la personne assignée.
// « module:modules(...) » renomme la relation pour lire feature.module.name.
export const FEATURE_WITH_RELATIONS =
  "*, module:modules(id, name, color), assignee:profiles(id, firstname, lastname, email, avatar_url)";

// Profil du membre connecté, lu côté serveur : sa photo pour le menu
// et son rôle (profiles.role) pour savoir quels boutons afficher.
// cache() : plusieurs composants peuvent l'appeler, la lecture n'a lieu qu'une fois par page.
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, firstname, lastname, email, avatar_url, role")
    .eq("id", user.id)
    .single();

  return profile;
});

// Listes nécessaires aux formulaires de feature (modules, sprints, membres).
export async function getFormOptions() {
  const supabase = await createClient();

  // Les trois requêtes partent en même temps grâce à Promise.all.
  const [modules, sprints, profiles] = await Promise.all([
    supabase.from("modules").select("id, name, color").order("name"),
    supabase.from("sprints").select("id, status").order("id"),
    supabase.from("profiles").select("id, firstname, lastname, email, avatar_url").order("firstname"),
  ]);

  return {
    modules: modules.data ?? [],
    sprints: sprints.data ?? [],
    profiles: profiles.data ?? [],
  };
}

export type FormOptions = Awaited<ReturnType<typeof getFormOptions>>;
