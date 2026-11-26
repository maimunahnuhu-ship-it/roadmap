import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon, PencilIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FEATURE_WITH_RELATIONS, getCurrentProfile } from "@/lib/queries";
import { canEditFeature, isAdmin } from "@/lib/permissions";
import { updateSprintStatus } from "@/lib/actions/sprints";
import { SPRINT_STATUSES, SPRINT_STATUS_LABELS } from "@/lib/constants";
import { getKanbanColumns } from "@/lib/views";
import { formatDay, sprintName } from "@/lib/format";
import { ActionForm } from "@/components/action-form";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { AddFeaturesDialog } from "@/components/add-features-dialog";
import { ProgressBar, SprintStatusBadge } from "@/components/badges";
import { KanbanBoard } from "@/components/kanban-board";
import { SprintFormDialog } from "@/components/sprint-form-dialog";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sprint · Roadmap" };

// Écran 5 — Détail d'un sprint : ses features regroupées par statut.
export default async function SprintPage({ params }: PageProps<"/sprints/[id]">) {
  const { id } = await params;
  const sprintId = Number(id);
  if (!Number.isInteger(sprintId)) notFound();

  const supabase = await createClient();
  const [{ data: sprint }, { data: sprintFeatures }, { data: backlog }, viewer] = await Promise.all([
    supabase.from("sprints").select("*").eq("id", sprintId).maybeSingle(),
    supabase.from("features").select(FEATURE_WITH_RELATIONS).eq("sprint_id", sprintId).order("created_at"),
    // Features sans sprint, proposées dans « Ajouter depuis le backlog »
    supabase
      .from("features")
      .select("id, title, priority, assigned_to, module:modules(color)")
      .is("sprint_id", null)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false }),
    getCurrentProfile(),
  ]);

  if (!sprint) notFound();

  const features = sprintFeatures ?? [];
  const name = sprintName(sprint.id);
  const doneCount = features.filter((feature) => feature.status === "done").length;

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
          {/* Policy « Admins can update sprints » : seul un admin change le statut ou les dates */}
          {isAdmin(viewer) && (
            <>
              {/* key : recrée le formulaire après un changement, pour afficher le statut enregistré */}
              <ActionForm key={sprint.status} action={updateSprintStatus.bind(null, sprint.id)}>
                <AutoSubmitSelect variant="chip" name="status" defaultValue={sprint.status} aria-label="Statut du sprint">
                  {SPRINT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      Statut : {SPRINT_STATUS_LABELS[status].toLowerCase()}
                    </option>
                  ))}
                </AutoSubmitSelect>
              </ActionForm>
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
            </>
          )}
          {/* On ne propose que les features que la RLS autorise à déplacer */}
          <AddFeaturesDialog
            sprintId={sprint.id}
            sprintLabel={name}
            backlog={(backlog ?? []).filter((feature) => canEditFeature(viewer, feature))}
          />
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

      {/* Features regroupées par statut : on les glisse d'une colonne à l'autre */}
      <KanbanBoard
        features={features}
        viewer={viewer}
        columns={getKanbanColumns("statut", { modules: [], sprints: [] })}
        group="statut"
        removableFromSprint
      />
    </>
  );
}
