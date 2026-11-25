import Link from "next/link";
import { ArrowRightIcon, RocketIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDay, fullName, sprintName } from "@/lib/format";
import { SprintStatusBadge } from "@/components/badges";
import { PersonAvatar } from "@/components/person-avatar";
import { SprintPulse } from "@/components/sprint-pulse";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Bannière du sprint en cours, en haut du Backlog.
// Les nombres (terminées, en cours…) sont calculés ici, rien n'est stocké.
export async function SprintBanner() {
  const supabase = await createClient();
  const { data: sprint } = await supabase
    .from("sprints")
    .select("id, goal, start_date, end_date, features(id, status, assignee:profiles(id, firstname, lastname, email, avatar_url))")
    .eq("status", "active")
    .order("start_date")
    .limit(1)
    .maybeSingle();

  // Pas de sprint actif : on invite à en lancer un.
  if (!sprint) {
    return (
      <section className="mb-10 flex flex-wrap items-center gap-6 rounded-xl border-2 border-dashed border-border bg-surface/60 p-6">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent shadow-clay-sm">
          <RocketIcon aria-hidden="true" className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-title text-h3">Aucun sprint en cours</h2>
          <p className="text-ink-soft">Choisis quelques features du backlog et lance un sprint pour donner le rythme à l&apos;équipe.</p>
        </div>
        <Button asChild>
          <Link href="/sprints">
            Lancer un sprint
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </Button>
      </section>
    );
  }

  const features = sprint.features;
  const count = (status: string) => features.filter((feature) => feature.status === status).length;
  const counters = [
    { label: "À faire", value: count("todo") + count("backlog"), classes: "bg-status-todo" },
    { label: "En cours", value: count("in_progress"), classes: "bg-status-in-progress" },
    { label: "Terminées", value: count("done"), classes: "bg-status-done" },
  ];
  // Une feature annulée ne compte pas dans l'objectif du sprint.
  const total = features.filter((feature) => feature.status !== "cancelled").length;

  // Les personnes qui ont au moins une feature dans le sprint (sans doublon).
  const people = new Map<string, NonNullable<(typeof features)[number]["assignee"]>>();
  for (const feature of features) {
    if (feature.assignee) people.set(feature.assignee.id, feature.assignee);
  }

  return (
    <section
      aria-labelledby="sprint-banner-title"
      className="relative mb-10 flex flex-col gap-6 overflow-hidden rounded-xl bg-surface p-8 shadow-clay max-sm:p-5"
    >
      {/* Le sprint actif porte le bandeau aurora */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-aurora" />

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="sprint-banner-title" className="font-title text-h2">
              <Link href={`/sprints/${sprint.id}`} className="hover:text-accent">
                {sprintName(sprint.id)}
              </Link>
            </h2>
            <SprintStatusBadge status="active" />
          </div>
          <p className="mt-1 text-body-lg">{sprint.goal || <span className="text-ink-soft">Pas d&apos;objectif.</span>}</p>
          <p className="font-data text-data text-ink-soft">
            {formatDay(sprint.start_date)} → {formatDay(sprint.end_date)}
          </p>
        </div>

        {/* L'équipe du sprint : avatars qui se chevauchent */}
        {people.size > 0 && (
          <div className="flex flex-col items-end gap-2">
            <ul aria-label="Personnes du sprint" className="flex -space-x-3">
              {[...people.values()].map((person) => (
                <li key={person.id} className="transition duration-150 ease-bounce hover:z-10 hover:-translate-y-1">
                  <PersonAvatar person={person} className="size-11 border-3" />
                  <span className="sr-only">{fullName(person)}</span>
                </li>
              ))}
            </ul>
            <span className="text-small text-ink-soft">
              {people.size} personne{people.size > 1 ? "s" : ""} dans la course
            </span>
          </div>
        )}
      </div>

      {/* Mini-compteurs en blocs de couleur pleine */}
      <ul className="flex flex-wrap gap-3">
        {counters.map((counter) => (
          <li
            key={counter.label}
            className={cn(
              "flex items-baseline gap-2 rounded-lg px-4 py-2 text-on-accent shadow-clay-sm",
              counter.classes,
            )}
          >
            <span className="font-data text-h2">{counter.value}</span>
            <span className="text-small">{counter.label}</span>
          </li>
        ))}
      </ul>

      <SprintPulse startDate={sprint.start_date} endDate={sprint.end_date} done={count("done")} total={total} />
    </section>
  );
}
