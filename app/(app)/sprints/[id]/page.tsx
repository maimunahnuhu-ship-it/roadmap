import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon, PencilIcon, Undo2Icon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FEATURE_WITH_RELATIONS } from "@/lib/queries";
import { updateFeatureSprint } from "@/lib/actions/features";
import { updateSprintStatus } from "@/lib/actions/sprints";
import { FEATURE_STATUSES, FEATURE_STATUS_LABELS, SPRINT_STATUSES, SPRINT_STATUS_LABELS, toFeatureStatus } from "@/lib/constants";
import { formatDay, sprintName } from "@/lib/format";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { AddFeaturesDialog } from "@/components/add-features-dialog";
import { CountPill, EffortChip, ModuleDot, PriorityBadge, ProgressBar, SprintStatusBadge, StatusBadge } from "@/components/badges";
import { NobodyAvatar, PersonAvatar } from "@/components/person-avatar";
import { SprintFormDialog } from "@/components/sprint-form-dialog";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sprint · Roadmap" };

// Écran 5 — Détail d'un sprint : ses features regroupées par statut.
export default async function SprintPage({ params }: PageProps<"/sprints/[id]">) {
  const { id } = await params;
  const sprintId = Number(id);
  if (!Number.isInteger(sprintId)) notFound();

  const supabase = await createClient();
  const [{ data: sprint }, { data: sprintFeatures }, { data: backlog }] = await Promise.all([
    supabase.from("sprints").select("*").eq("id", sprintId).maybeSingle(),
    supabase.from("features").select(FEATURE_WITH_RELATIONS).eq("sprint_id", sprintId).order("created_at"),
    // Features sans sprint, proposées dans « Ajouter depuis le backlog »
    supabase
      .from("features")
      .select("id, title, priority, module:modules(color)")
      .is("sprint_id", null)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false }),
  ]);

  if (!sprint) notFound();

  const features = sprintFeatures ?? [];
  const name = sprintName(sprint.id);
  const doneCount = features.filter((feature) => feature.status === "done").length;

  // Une colonne par statut ; « Backlog » et « Annulé » n'apparaissent que s'ils contiennent des features.
  const columns = FEATURE_STATUSES.map((status) => ({
    status,
    items: features.filter((feature) => toFeatureStatus(feature.status) === status),
  })).filter(
    (column) => column.items.length > 0 || ["todo", "in_progress", "done"].includes(column.status),
  );

  return (
    <>
      <Link href="/sprints" className="mb-4 inline-flex items-center gap-1 self-start rounded-full font-bold text-ink-soft outline-none hover:text-accent focus-visible:shadow-glow">
        <ChevronLeftIcon className="size-4.5" aria-hidden="true" />
        Sprints
      </Link>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-title text-h1">{name}</h1>
            <SprintStatusBadge status={sprint.status} />
          </div>
          <p className="mt-2 text-body-lg">{sprint.goal || <span className="text-ink-soft">Pas d&apos;objectif.</span>}</p>
          <p className="mt-1 font-data text-data text-ink-soft">
            {formatDay(sprint.start_date)} → {formatDay(sprint.end_date)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* key : recrée le formulaire après un changement, pour afficher le statut enregistré */}
          <form key={sprint.status} action={updateSprintStatus.bind(null, sprint.id)}>
            <AutoSubmitSelect variant="chip" name="status" defaultValue={sprint.status} aria-label="Statut du sprint">
              {SPRINT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  Statut : {SPRINT_STATUS_LABELS[status].toLowerCase()}
                </option>
              ))}
            </AutoSubmitSelect>
          </form>
          <SprintFormDialog
            sprint={{
              id: sprint.id,
              name,
              values: { start_date: sprint.start_date, end_date: sprint.end_date, goal: sprint.goal ?? "" },
            }}
            trigger={
              <Button variant="secondary">
                <PencilIcon aria-hidden="true" />
                Modifier
              </Button>
            }
          />
          <AddFeaturesDialog sprintId={sprint.id} sprintLabel={name} backlog={backlog ?? []} />
        </div>
      </div>

      {/* Avancement */}
      <section className="relative mb-8 flex flex-col gap-4 overflow-hidden rounded-xl bg-surface p-6 shadow-clay">
        {sprint.status === "active" && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-aurora" />}
        <div className="flex items-baseline gap-2">
          <span className="font-data text-data-xl">{doneCount}</span>
          <span className="text-label uppercase text-ink-soft">
            terminée{doneCount > 1 ? "s" : ""} sur {features.length}
          </span>
        </div>
        <ProgressBar done={doneCount} total={features.length} label="Features terminées" />
      </section>

      {/* Features regroupées par statut */}
      <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
        {columns.map((column) => (
          <section
            key={column.status}
            aria-label={`Colonne ${FEATURE_STATUS_LABELS[column.status]}`}
            className="rounded-xl bg-surface/55 p-4 shadow-clay-sm"
          >
            <div className="flex items-center justify-between px-2 pt-2 pb-4">
              <StatusBadge status={column.status} />
              <CountPill count={column.items.length} />
            </div>

            {column.items.length === 0 ? (
              <p className="px-2 pb-2 text-small text-ink-soft">Aucune feature.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {column.items.map((feature) => (
                  <li key={feature.id} className="flex flex-col gap-3 rounded-lg bg-surface p-4 shadow-clay-sm">
                    <Link href={`/features/${feature.id}`} className="font-bold hover:text-accent">
                      {feature.title}
                    </Link>
                    <span className="inline-flex items-center gap-2 text-small">
                      <ModuleDot color={feature.module?.color ?? "#B9A8FF"} />
                      {feature.module?.name}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={feature.priority} />
                        <EffortChip effort={feature.effort} />
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Retirer = remettre sprint_id à vide : la feature retourne au backlog */}
                        <form action={updateFeatureSprint.bind(null, feature.id)}>
                          <input type="hidden" name="sprint_id" value="" />
                          <Button type="submit" variant="ghost" size="sm" title="Retirer du sprint (retour au backlog)">
                            <Undo2Icon aria-hidden="true" />
                            Retirer
                          </Button>
                        </form>
                        {feature.assignee ? (
                          <PersonAvatar person={feature.assignee} className="size-7" />
                        ) : (
                          <NobodyAvatar />
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
