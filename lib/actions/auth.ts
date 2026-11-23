"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, type LoginValues } from "@/lib/schemas";

// Connexion par email et mot de passe (Supabase Auth).
// En cas de succès, Supabase enregistre la session dans les cookies.
export async function login(values: LoginValues) {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Email ou mot de passe invalide." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
