import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/queries";
import { isAdmin } from "@/lib/permissions";
import { formatDay, sprintName } from "@/lib/format";
import { ProgressBar, SprintStatusBadge } from "@/components/badges";
import { SprintFormDialog } from "@/components/sprint-form-dialog";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sprints · Roadmap" };

// Écran 4 — Liste des sprints, avec le nombre de features de chacun.
export default async function SprintsPage() {
  const supabase = await createClient();
  // features(status) : on charge le statut des features de chaque sprint
  // pour les compter ici (le nombre n'est pas stocké dans la base).
  const [{ data: sprints }, viewer] = await Promise.all([
    supabase.from("sprints").select("*, features(status)").order("start_date", { ascending: true }),
    getCurrentProfile(),
  ]);

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-title text-h1">Sprints</h1>
          <p className="text-ink-soft">Des périodes de travail d&apos;une à deux semaines.</p>
        </div>
        {/* Policy « Admins can insert sprints » : seul un admin crée un sprint */}
        {isAdmin(viewer) && (
          <SprintFormDialog
            trigger={
              <Button>
                <PlusIcon aria-hidden="true" />
                Créer un sprint
              </Button>
            }
          />
        )}
      </div>

      {!sprints || sprints.length === 0 ? (
        <p className="text-ink-soft">Aucun sprint pour l&apos;instant.</p>
      ) : (
        <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {sprints.map((sprint) => {
            const total = sprint.features.length;
            const done = sprint.features.filter((feature) => feature.status === "done").length;
            return (
              <li key={sprint.id}>
                <Link
                  href={`/sprints/${sprint.id}`}
                  className="relative flex h-full flex-col gap-4 overflow-hidden rounded-xl bg-surface p-6 shadow-clay transition duration-150 ease-bounce outline-none hover:-translate-y-0.5 hover:shadow-clay-hover focus-visible:shadow-glow"
                >
                  {sprint.status === "active" && (
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-aurora" />
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-title text-h3">{sprintName(sprint.id)}</h2>
                    <SprintStatusBadge status={sprint.status} />
                  </div>
                  <p className="text-body-lg">{sprint.goal || <span className="text-ink-soft">Pas d&apos;objectif.</span>}</p>
                  <p className="font-data text-data text-ink-soft">
                    {formatDay(sprint.start_date)} → {formatDay(sprint.end_date)}
                  </p>
                  <div className="mt-auto flex items-baseline gap-2">
                    <span className="font-data text-data-xl">{total}</span>
                    <span className="text-label uppercase text-ink-soft">feature{total > 1 ? "s" : ""}</span>
                  </div>
                  <ProgressBar done={done} total={total} label="Features terminées" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
