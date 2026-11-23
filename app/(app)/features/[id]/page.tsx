import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon, PencilIcon, Undo2Icon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FEATURE_WITH_RELATIONS, getCurrentProfile, getFormOptions } from "@/lib/queries";
import { updateFeatureAssignee, updateFeatureSprint, updateFeatureStatus } from "@/lib/actions/features";
import {
  EFFORTS,
  FEATURE_STATUSES,
  IMPACT_LABELS,
  SPRINT_STATUS_LABELS,
  toFeatureStatus,
  toImpact,
  toPriority,
  toSprintStatus,
} from "@/lib/constants";
import { formatDateTime, fullName, sprintName } from "@/lib/format";
import type { FeatureValues } from "@/lib/schemas";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { CountPill, EffortChip, ModuleDot, PriorityBadge, StatusBadge } from "@/components/badges";
import { CommentForm } from "@/components/comment-form";
import { FeatureFormDialog } from "@/components/feature-form-dialog";
import { PersonAvatar } from "@/components/person-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Feature · Roadmap" };

// Écran 3 — Détail d'une feature : ses champs, ses commentaires,
// et les changements rapides (statut, assignation, sprint).
export default async function FeaturePage({ params }: PageProps<"/features/[id]">) {
  const { id } = await params;
  const featureId = Number(id);
  if (!Number.isInteger(featureId)) notFound();

  const supabase = await createClient();
  const [{ data: feature }, options, currentProfile] = await Promise.all([
    supabase
      .from("features")
      .select(
        `${FEATURE_WITH_RELATIONS}, comments(id, content, created_at, author:profiles(id, firstname, lastname, email, avatar_url))`,
      )
      .eq("id", featureId)
      // Commentaires du plus ancien au plus récent
      .order("created_at", { referencedTable: "comments", ascending: true })
      // À date égale, l'ordre d'ajout (id) départage les commentaires
      .order("id", { referencedTable: "comments", ascending: true })
      .maybeSingle(),
    getFormOptions(),
    getCurrentProfile(),
  ]);

  if (!feature) notFound();

  const currentStatus = toFeatureStatus(feature.status);

  // Valeurs pré-remplies du formulaire « Modifier » (tout en texte, comme les listes).
  const formValues: FeatureValues = {
    title: feature.title,
    module_id: String(feature.module_id),
    description: feature.description ?? "",
    status: currentStatus,
    priority: toPriority(feature.priority),
    impact: toImpact(feature.impact),
    effort: EFFORTS.find((effort) => effort === feature.effort) ?? "",
    sprint_id: feature.sprint_id ? String(feature.sprint_id) : "",
    assigned_to: feature.assigned_to ?? "",
  };

  return (
    <>
      <Link href="/" className="mb-4 inline-flex items-center gap-1 self-start rounded-full font-bold text-ink-soft outline-none hover:text-accent focus-visible:shadow-glow">
        <ChevronLeftIcon className="size-4.5" aria-hidden="true" />
        Backlog
      </Link>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Link
            href={`/?module=${feature.module_id}`}
            className="inline-flex items-center gap-2 text-small hover:text-accent"
          >
            <ModuleDot color={feature.module?.color ?? "#B9A8FF"} className="size-3.5" />
            {feature.module?.name}
          </Link>
          <h1 className={cn("mt-2 font-title text-h1", currentStatus === "cancelled" && "text-ink-muted line-through")}>
            {feature.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          {feature.sprint_id && (
            <form action={updateFeatureSprint.bind(null, feature.id)}>
              <input type="hidden" name="sprint_id" value="" />
              <Button type="submit" variant="ghost">
                <Undo2Icon aria-hidden="true" />
                Renvoyer au backlog
              </Button>
            </form>
          )}
          <FeatureFormDialog
            options={options}
            feature={{ id: feature.id, values: formValues }}
            trigger={
              <Button variant="secondary">
                <PencilIcon aria-hidden="true" />
                Modifier
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-3">
        {/* Description et commentaires */}
        <section className="rounded-xl bg-surface p-8 shadow-clay lg:col-span-2">
          <h2 className="mb-2 text-label uppercase text-ink-soft">Description</h2>
          <p className="text-body-lg whitespace-pre-line">
            {feature.description || <span className="text-ink-soft">Pas encore de description.</span>}
          </p>

          <hr className="my-8 border-border" />

          <div className="mb-6 flex items-center gap-2">
            <h2 className="font-title text-h3">Commentaires</h2>
            <CountPill count={feature.comments.length} />
          </div>

          {feature.comments.length === 0 ? (
            <p className="text-ink-soft">Aucun commentaire pour l&apos;instant.</p>
          ) : (
            <ol className="flex flex-col gap-5">
              {feature.comments.map((comment) => (
                <li key={comment.id} className="flex gap-3">
                  {comment.author && <PersonAvatar person={comment.author} className="size-10" />}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-baseline gap-2">
                      <strong className="font-bold">{comment.author ? fullName(comment.author) : "Membre"}</strong>
                      <time dateTime={comment.created_at} className="font-data text-small text-ink-soft">
                        {formatDateTime(comment.created_at)}
                      </time>
                    </div>
                    <p className="rounded-lg rounded-tl-sm bg-surface-tint px-4 py-3 whitespace-pre-line">
                      {comment.content}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-6 flex gap-3">
            {currentProfile && <PersonAvatar person={currentProfile} className="size-10" />}
            <CommentForm featureId={feature.id} />
          </div>
        </section>

        {/* Champs de la feature et changements rapides */}
        <aside className="flex flex-col gap-6 rounded-xl bg-surface p-6 shadow-clay">
          <div className="flex flex-col gap-2">
            <h2 className="text-label uppercase text-ink-soft">Statut</h2>
            {/* Chaque statut est un bouton qui envoie sa valeur à la Server Action */}
            <form action={updateFeatureStatus.bind(null, feature.id)} className="flex flex-wrap gap-2">
              {FEATURE_STATUSES.map((status) => (
                <button
                  key={status}
                  type="submit"
                  name="status"
                  value={status}
                  aria-pressed={status === currentStatus}
                  className={cn(
                    "cursor-pointer rounded-full transition duration-150 ease-bounce outline-none hover:-translate-y-px focus-visible:shadow-glow",
                    status === currentStatus ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : "opacity-60 hover:opacity-100",
                  )}
                >
                  <StatusBadge status={status} />
                </button>
              ))}
            </form>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-label uppercase text-ink-soft">Priorité</h2>
            <span>
              <PriorityBadge priority={feature.priority} />
            </span>
          </div>

          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-label uppercase text-ink-soft">Effort</h2>
              <span>
                <EffortChip effort={feature.effort} />
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-label uppercase text-ink-soft">Impact</h2>
              <span className="font-bold">{IMPACT_LABELS[toImpact(feature.impact)]}</span>
            </div>
          </div>

          {/* key : recrée le formulaire quand la valeur change, pour que la liste affiche la valeur enregistrée */}
          <form key={feature.sprint_id ?? "none"} action={updateFeatureSprint.bind(null, feature.id)} className="flex flex-col gap-2">
            <label htmlFor="sprint_id" className="text-label uppercase text-ink-soft">
              Sprint
            </label>
            <AutoSubmitSelect id="sprint_id" name="sprint_id" defaultValue={feature.sprint_id ? String(feature.sprint_id) : ""}>
              <option value="">Sans sprint (backlog)</option>
              {options.sprints.map((sprint) => (
                <option key={sprint.id} value={String(sprint.id)}>
                  {sprintName(sprint.id)} · {SPRINT_STATUS_LABELS[toSprintStatus(sprint.status)].toLowerCase()}
                </option>
              ))}
            </AutoSubmitSelect>
            {feature.sprint_id && (
              <Link href={`/sprints/${feature.sprint_id}`} className="text-small text-accent hover:underline">
                Voir le {sprintName(feature.sprint_id).toLowerCase()} →
              </Link>
            )}
          </form>

          <form key={feature.assigned_to ?? "none"} action={updateFeatureAssignee.bind(null, feature.id)} className="flex flex-col gap-2">
            <label htmlFor="assigned_to" className="text-label uppercase text-ink-soft">
              Assignée à
            </label>
            <AutoSubmitSelect id="assigned_to" name="assigned_to" defaultValue={feature.assigned_to ?? ""}>
              <option value="">Personne</option>
              {options.profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {fullName(profile)}
                </option>
              ))}
            </AutoSubmitSelect>
          </form>

          <div className="flex flex-col gap-1">
            <h2 className="text-label uppercase text-ink-soft">Créée le</h2>
            <time dateTime={feature.created_at} className="font-data text-data">
              {formatDateTime(feature.created_at)}
            </time>
          </div>
        </aside>
      </div>
    </>
  );
}
