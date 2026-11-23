import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

// Client Supabase côté SERVEUR : à utiliser dans les Server Components
// et les Server Actions. Il lit les cookies de la requête, ce qui lui
// permettra de reconnaître l'utilisateur connecté.
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Variables Supabase manquantes : vérifie NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env",
    );
  }

  // Depuis Next.js 15, cookies() est asynchrone.
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Un Server Component n'a pas le droit d'écrire des cookies :
          // on ignore l'erreur, la session sera rafraîchie ailleurs
          // (Server Action ou proxy, à ajouter avec la connexion).
        }
      },
    },
  });
}
