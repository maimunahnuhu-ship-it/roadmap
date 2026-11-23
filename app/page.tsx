import { createClient } from "@/lib/supabase/server";

// Page de test temporaire : vérifie que l'app lit bien la base Supabase.
// C'est un Server Component : la requête part du serveur, pas du navigateur.
// Elle sera remplacée par le vrai Backlog.
export default async function SupabaseTestPage() {
  const supabase = await createClient();

  // count: "exact" demande aussi le nombre total de lignes,
  // même si on ne récupère que les 5 premières.
  const { data: features, count, error } = await supabase
    .from("features")
    .select("id, title", { count: "exact" })
    .order("id")
    .limit(5);

  return (
    <main className="mx-auto flex w-full max-w-page flex-col gap-8 px-8 py-10">
      <header>
        <h1 className="font-title text-h1">Test de connexion Supabase</h1>
        <p className="text-body-lg text-ink-soft">
          Données lues en direct dans la table features.
        </p>
      </header>

      {error ? (
        <p role="alert" className="rounded-md bg-danger-soft p-4 text-danger">
          Erreur Supabase : {error.message}
        </p>
      ) : (
        <section className="flex max-w-xl flex-col gap-6 rounded-xl bg-surface p-8 shadow-clay">
          <div className="flex items-baseline gap-2">
            <span className="font-data text-data-xl">{count ?? 0}</span>
            <span className="text-label uppercase text-ink-soft">features dans la base</span>
          </div>

          <div>
            <h2 className="mb-3 text-label uppercase text-ink-soft">Les 5 premières</h2>
            <ol className="flex flex-col gap-2">
              {features.map((feature) => (
                <li
                  key={feature.id}
                  className="flex items-center gap-3 rounded-lg bg-surface-tint px-4 py-3"
                >
                  <span className="font-data text-data text-ink-soft">#{feature.id}</span>
                  <span className="font-bold">{feature.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </main>
  );
}
