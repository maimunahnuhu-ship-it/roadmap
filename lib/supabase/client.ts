import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

// Client Supabase côté NAVIGATEUR : à utiliser uniquement dans un
// composant "use client" qui en a vraiment besoin. Par défaut, on lit
// et on écrit les données côté serveur (voir lib/supabase/server.ts).
export function createClient() {
  // Les variables NEXT_PUBLIC_ sont écrites en entier pour que Next.js
  // puisse les intégrer dans le code envoyé au navigateur.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Variables Supabase manquantes : vérifie NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env",
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
