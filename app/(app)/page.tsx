import Link from "next/link";
import { PlusIcon, SearchIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FEATURE_WITH_RELATIONS, getFormOptions } from "@/lib/queries";
import {
  FEATURE_STATUSES,
  FEATURE_STATUS_LABELS,
  IMPACT_LABELS,
  IMPACT_RANK,
  PRIORITIES,
  PRIORITY_LABELS,
  PRIORITY_RANK,
  toImpact,
  toPriority,
} from "@/lib/constants";
import { fullName, sprintName } from "@/lib/format";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { EffortChip, ModuleDot, PriorityBadge, StatusBadge } from "@/components/badges";
import { FeatureFormDialog } from "@/components/feature-form-dialog";
import { NobodyAvatar, PersonAvatar } from "@/components/person-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Un paramètre d'adresse peut être absent, unique ou répété : on garde le premier.
function firstValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// Écran 1 — Backlog : toutes les features, avec filtres, recherche et tri.
// Les filtres sont dans l'adresse (ex. /?module=3&sprint=none) : un simple
// formulaire GET les met à jour, et on peut partager le lien.
export default async function BacklogPage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const filters = {
    module: firstValue(params.module),
    status: firstValue(params.status),
    priority: firstValue(params.priority),
    sprint: firstValue(params.sprint),
    assignee: firstValue(params.assignee),
    q: firstValue(params.q).trim(),
    sort: firstValue(params.sort) || "recent",
  };

  const supabase = await createClient();
  let query = supabase
    .from("features")
    .select(FEATURE_WITH_RELATIONS)
    .order("created_at", { ascending: false });

  // On n'ajoute à la requête que les filtres choisis.
  if (filters.module) query = query.eq("module_id", Number(filters.module));
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.sprint === "none") query = query.is("sprint_id", null);
  else if (filters.sprint) query = query.eq("sprint_id", Number(filters.sprint));
  if (filters.assignee === "none") query = query.is("assigned_to", null);
  else if (filters.assignee) query = query.eq("assigned_to", filters.assignee);
  if (filters.q) query = query.ilike("title", `%${filters.q}%`);

  const [{ data, error }, options] = await Promise.all([query, getFormOptions()]);
  const features = data ?? [];

  // La base stocke priorité et impact en texte : un tri alphabétique serait faux,
  // on trie donc ici avec un rang (1 = le plus important).
  if (filters.sort === "priority") {
    features.sort(
      (a, b) => PRIORITY_RANK[toPriority(a.priority)] - PRIORITY_RANK[toPriority(b.priority)],
    );
  } else if (filters.sort === "impact") {
    features.sort((a, b) => IMPACT_RANK[toImpact(a.impact)] - IMPACT_RANK[toImpact(b.impact)]);
  }

  const hasFilters = Boolean(
    filters.module || filters.status || filters.priority || filters.sprint || filters.assignee || filters.q,
  );

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-title text-h1">Backlog</h1>
          <p className="text-ink-soft">
            <span className="font-data text-data text-ink">{features.length}</span> feature
            {features.length > 1 ? "s" : ""} affichée{features.length > 1 ? "s" : ""}
          </p>
        </div>
        <FeatureFormDialog
          options={options}
          trigger={
            <Button>
              <PlusIcon aria-hidden="true" />
              Nouvelle feature
            </Button>
          }
        />
      </div>

      {/* Recherche, filtres et tri : formulaire GET, envoyé à chaque changement */}
      <form action="/" className="mb-6 flex flex-wrap items-center gap-3" role="search">
        <div className="relative w-full max-w-80 sm:w-auto sm:flex-1">
          <SearchIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-ink-muted" />
          <label htmlFor="q" className="sr-only">
            Rechercher par titre
          </label>
          <Input id="q" name="q" type="search" defaultValue={filters.q} placeholder="Rechercher une feature…" className="h-10 rounded-full pl-10" />
          <button type="submit" className="sr-only">
            Rechercher
          </button>
        </div>

        <AutoSubmitSelect variant="chip" name="module" defaultValue={filters.module} active={Boolean(filters.module)} aria-label="Filtrer par module">
          <option value="">Module</option>
          {options.modules.map((module) => (
            <option key={module.id} value={String(module.id)}>
              {module.name}
            </option>
          ))}
        </AutoSubmitSelect>

        <AutoSubmitSelect variant="chip" name="status" defaultValue={filters.status} active={Boolean(filters.status)} aria-label="Filtrer par statut">
          <option value="">Statut</option>
          {FEATURE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {FEATURE_STATUS_LABELS[status]}
            </option>
          ))}
        </AutoSubmitSelect>

        <AutoSubmitSelect variant="chip" name="priority" defaultValue={filters.priority} active={Boolean(filters.priority)} aria-label="Filtrer par priorité">
          <option value="">Priorité</option>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </AutoSubmitSelect>

        <AutoSubmitSelect variant="chip" name="sprint" defaultValue={filters.sprint} active={Boolean(filters.sprint)} aria-label="Filtrer par sprint">
          <option value="">Sprint</option>
          <option value="none">Sans sprint</option>
          {options.sprints.map((sprint) => (
            <option key={sprint.id} value={String(sprint.id)}>
              {sprintName(sprint.id)}
            </option>
          ))}
        </AutoSubmitSelect>

        <AutoSubmitSelect variant="chip" name="assignee" defaultValue={filters.assignee} active={Boolean(filters.assignee)} aria-label="Filtrer par personne assignée">
          <option value="">Assignée à</option>
          {options.profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {fullName(profile)}
            </option>
          ))}
          <option value="none">Personne</option>
        </AutoSubmitSelect>

        <AutoSubmitSelect
          variant="chip"
          name="sort"
          defaultValue={filters.sort}
          active={filters.sort !== "recent"}
          aria-label="Trier"
          wrapperClassName="sm:ml-auto"
        >
          <option value="recent">Tri : plus récentes</option>
          <option value="priority">Tri : priorité</option>
          <option value="impact">Tri : impact</option>
        </AutoSubmitSelect>

        {hasFilters && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Effacer les filtres</Link>
          </Button>
        )}
      </form>

      {error && (
        <p role="alert" className="mb-6 rounded-md bg-danger-soft p-4 text-danger">
          Les features n&apos;ont pas pu être chargées : {error.message}
        </p>
      )}

      {features.length === 0 ? (
        <div className="py-12 text-center text-ink-soft">
          <h2 className="font-title text-h3 text-ink">Aucune feature ne correspond</h2>
          <p>Essaie d&apos;enlever un filtre ou de changer ta recherche.</p>
        </div>
      ) : (
        <>
          {/* En-têtes de colonnes (mêmes largeurs que les lignes) */}
          <div aria-hidden="true" className="mb-2 flex items-center gap-3 px-4 text-label uppercase text-ink-soft max-md:hidden">
            <span className="min-w-0 flex-1">Feature</span>
            <span className="w-36 max-lg:hidden">Module</span>
            <span className="w-26">Statut</span>
            <span className="w-26">Priorité</span>
            <span className="w-13 max-lg:hidden">Effort</span>
            <span className="w-16 max-lg:hidden">Impact</span>
            <span className="w-22">Sprint</span>
            <span className="w-9" />
          </div>

          <ul className="flex flex-col gap-2">
            {features.map((feature) => (
              <li key={feature.id}>
                <Link
                  href={`/features/${feature.id}`}
                  className="flex min-h-15 items-center gap-3 rounded-lg bg-surface px-4 py-3 shadow-clay-sm transition duration-150 ease-bounce outline-none hover:-translate-y-0.5 hover:shadow-clay-hover focus-visible:shadow-glow"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <ModuleDot color={feature.module?.color ?? "#B9A8FF"} />
                    <span
                      className={cn(
                        "truncate font-bold",
                        feature.status === "cancelled" && "text-ink-muted line-through",
                      )}
                    >
                      {feature.title}
                    </span>
                  </span>
                  <span className="w-36 truncate text-small text-ink-soft max-lg:hidden">{feature.module?.name}</span>
                  <span className="w-26">
                    <StatusBadge status={feature.status} />
                  </span>
                  <span className="w-26 max-md:hidden">
                    <PriorityBadge priority={feature.priority} />
                  </span>
                  <span className="w-13 max-lg:hidden">
                    <EffortChip effort={feature.effort} />
                  </span>
                  <span className="w-16 text-small text-ink-soft max-lg:hidden">
                    {IMPACT_LABELS[toImpact(feature.impact)]}
                  </span>
                  <span className="w-22 truncate text-small text-ink-soft max-md:hidden">
                    {feature.sprint_id ? sprintName(feature.sprint_id) : "Sans sprint"}
                  </span>
                  <span className="flex w-9 justify-end">
                    {feature.assignee ? (
                      <PersonAvatar person={feature.assignee} className="size-7" />
                    ) : (
                      <NobodyAvatar />
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Bouton flottant de capture rapide */}
      <div className="fixed right-8 bottom-8 z-30">
        <FeatureFormDialog
          options={options}
          trigger={
            <Button variant="aurora" size="fab" aria-label="Nouvelle feature">
              <PlusIcon aria-hidden="true" />
            </Button>
          }
        />
      </div>
    </>
  );
}
