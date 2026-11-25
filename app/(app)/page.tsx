import Link from "next/link";
import { FilterIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FEATURE_WITH_RELATIONS, getCurrentProfile, getFormOptions } from "@/lib/queries";
import {
  FEATURE_STATUSES,
  FEATURE_STATUS_LABELS,
  IMPACT_RANK,
  PRIORITIES,
  PRIORITY_LABELS,
  PRIORITY_RANK,
  toImpact,
  toPriority,
} from "@/lib/constants";
import { fullName, sprintName } from "@/lib/format";
import {
  FEED_PAGE_SIZE,
  getKanbanColumns,
  KANBAN_GROUPS,
  KANBAN_GROUP_LABELS,
  toKanbanGroup,
  toView,
  type View,
} from "@/lib/views";
import { isAdmin } from "@/lib/permissions";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { FeatureFormDialog } from "@/components/feature-form-dialog";
import { FeatureGallery } from "@/components/feature-gallery";
import { FeatureList } from "@/components/feature-list";
import { FeaturePost } from "@/components/feed/feature-post";
import { SprintBanner } from "@/components/sprint-banner";
import { SprintStories } from "@/components/feed/sprint-stories";
import { KanbanBoard } from "@/components/kanban-board";
import { ViewSwitcher } from "@/components/view-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Un paramètre d'adresse peut être absent, unique ou répété : on garde le premier.
function firstValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// Colonnes chargées : la feature, puis ses commentaires avec leur auteur (utiles au Fil).
const FEATURE_WITH_COMMENTS = `${FEATURE_WITH_RELATIONS}, comments(id, content, created_at, author_id, author:profiles(id, firstname, lastname, email, avatar_url))`;

// Écran 1 — Backlog : toutes les features, avec filtres, recherche et tri,
// affichées en Liste, Kanban, Galerie ou Fil. Filtres et vue sont dans l'adresse
// (ex. /?vue=kanban&groupe=statut&module=3) : on les retrouve en rechargeant.
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
  const view = toView(firstValue(params.vue));
  const group = toKanbanGroup(firstValue(params.groupe));
  // Vue Fil : nombre de posts affichés (« Charger plus » l'augmente).
  const feedLimit = Math.max(FEED_PAGE_SIZE, Number(firstValue(params.limite)) || FEED_PAGE_SIZE);

  // Construit une adresse du Backlog avec les filtres actuels (sans les valeurs vides).
  function backlogHref(changes: Record<string, string>) {
    const values: Record<string, string> = {
      ...filters,
      sort: filters.sort === "recent" ? "" : filters.sort,
      vue: view === "liste" ? "" : view,
      groupe: view === "kanban" ? group : "",
      ...changes,
    };
    const query = new URLSearchParams(Object.entries(values).filter(([, value]) => value !== ""));
    return query.size > 0 ? `/?${query}` : "/";
  }

  const hrefForView = (target: View) =>
    backlogHref({ vue: target === "liste" ? "" : target, groupe: target === "kanban" ? group : "" });

  const supabase = await createClient();
  // count: "exact" : Supabase renvoie aussi le nombre total de features qui correspondent.
  let query = supabase
    .from("features")
    .select(FEATURE_WITH_COMMENTS, { count: "exact" })
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
  // Le Fil ne charge que les premiers posts (les plus récents).
  if (view === "fil") query = query.limit(feedLimit);

  const [{ data, error, count }, options, viewer] = await Promise.all([query, getFormOptions(), getCurrentProfile()]);
  // Policy « Admins can insert features » : seul un admin voit les boutons de création.
  const canCreate = isAdmin(viewer);
  const features = data ?? [];
  const total = count ?? features.length;

  // La base stocke priorité et impact en texte : un tri alphabétique serait faux,
  // on trie donc ici avec un rang (1 = le plus important). Le Fil reste chronologique.
  // Tri par module : ordre alphabétique du nom. Tri par sprint : du plus ancien
  // au plus récent, les features sans sprint (backlog) à la fin.
  // sort() garde l'ordre « plus récentes » à égalité.
  if (view !== "fil" && filters.sort === "priority") {
    features.sort((a, b) => PRIORITY_RANK[toPriority(a.priority)] - PRIORITY_RANK[toPriority(b.priority)]);
  } else if (view !== "fil" && filters.sort === "impact") {
    features.sort((a, b) => IMPACT_RANK[toImpact(a.impact)] - IMPACT_RANK[toImpact(b.impact)]);
  } else if (view !== "fil" && filters.sort === "module") {
    features.sort((a, b) => (a.module?.name ?? "").localeCompare(b.module?.name ?? "", "fr"));
  } else if (view !== "fil" && filters.sort === "sprint") {
    features.sort((a, b) => (a.sprint_id ?? Infinity) - (b.sprint_id ?? Infinity));
  }

  const hasFilters = Boolean(
    filters.module || filters.status || filters.priority || filters.sprint || filters.assignee || filters.q,
  );

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-title text-h1">Backlog</h1>
          <p className="text-ink-soft">
            <span className="font-data text-data text-ink">{total}</span> feature
            {total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}
          </p>
        </div>
        {canCreate && (
          <FeatureFormDialog
            options={options}
            trigger={
              <Button>
                <PlusIcon aria-hidden="true" />
                Nouvelle feature
              </Button>
            }
          />
        )}
      </div>

      {/* Le sprint en cours : compte à rebours, avancement, équipe */}
      <SprintBanner />

      {/* Barre d'outils : en haut l'affichage (vue, regroupement, tri), en bas les filtres.
          C'est un seul formulaire GET, envoyé à chaque changement. */}
      <form
        action="/"
        role="search"
        className="mb-8 flex flex-col gap-4 rounded-xl bg-surface/70 p-4 shadow-clay-sm sm:p-5"
      >
        {/* La vue choisie est renvoyée avec les filtres pour ne pas la perdre */}
        {view !== "liste" && <input type="hidden" name="vue" value={view} />}

        {/* Ligne 1 : comment afficher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ViewSwitcher current={view} hrefFor={hrefForView} />

          <div className="flex flex-wrap items-center gap-3">
            {view === "kanban" && (
              <AutoSubmitSelect variant="chip" name="groupe" defaultValue={group} active aria-label="Grouper par">
                {KANBAN_GROUPS.map((value) => (
                  <option key={value} value={value}>
                    Grouper par : {KANBAN_GROUP_LABELS[value].toLowerCase()}
                  </option>
                ))}
              </AutoSubmitSelect>
            )}

            {/* Le Fil est toujours chronologique : pas de tri */}
            {view !== "fil" && (
              <AutoSubmitSelect variant="chip" name="sort" defaultValue={filters.sort} active={filters.sort !== "recent"} aria-label="Trier">
                <option value="recent">Tri : plus récentes</option>
                <option value="priority">Tri : priorité</option>
                <option value="impact">Tri : impact</option>
                <option value="module">Tri : module</option>
                <option value="sprint">Tri : sprint</option>
              </AutoSubmitSelect>
            )}
          </div>
        </div>

        <hr className="border-border" />

        {/* Ligne 2 : quoi afficher (recherche et filtres) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full lg:w-80">
            <SearchIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-ink-muted" />
            <label htmlFor="q" className="sr-only">
              Rechercher par titre
            </label>
            <Input id="q" name="q" type="search" defaultValue={filters.q} placeholder="Rechercher une feature…" className="h-10 rounded-full pl-10" />
            <button type="submit" className="sr-only">
              Rechercher
            </button>
          </div>

          <span className="inline-flex items-center gap-1.5 text-label uppercase text-ink-soft max-sm:hidden">
            <FilterIcon aria-hidden="true" className="size-4" />
            Filtres
          </span>

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

          {hasFilters && (
            <Button asChild variant="ghost" size="sm" className="ml-auto">
              <Link href={backlogHref({ module: "", status: "", priority: "", sprint: "", assignee: "", q: "" })}>
                <XIcon aria-hidden="true" />
                Effacer les filtres
              </Link>
            </Button>
          )}
        </div>
      </form>

      {error && (
        <p role="alert" className="mb-6 rounded-md bg-danger-soft p-4 text-danger">
          Les features n&apos;ont pas pu être chargées : {error.message}
        </p>
      )}

      {view === "fil" && <FeedStories />}

      {features.length === 0 ? (
        <div className="py-12 text-center text-ink-soft">
          <h2 className="font-title text-h3 text-ink">Aucune feature ne correspond</h2>
          <p>Essaie d&apos;enlever un filtre ou de changer ta recherche.</p>
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard features={features} viewer={viewer} columns={getKanbanColumns(group, options)} group={group} />
      ) : view === "galerie" ? (
        <FeatureGallery features={features} />
      ) : view === "fil" ? (
        <Feed
          features={features}
          moreHref={features.length < total ? backlogHref({ limite: String(feedLimit + FEED_PAGE_SIZE) }) : null}
        />
      ) : (
        <FeatureList features={features} />
      )}

      {/* Bouton flottant de capture rapide (admin seulement) */}
      {canCreate && (
        <div className="fixed right-8 bottom-8 z-30 max-sm:right-4 max-sm:bottom-4">
          <FeatureFormDialog
            options={options}
            trigger={
              <Button variant="aurora" size="fab" aria-label="Nouvelle feature">
                <PlusIcon aria-hidden="true" />
              </Button>
            }
          />
        </div>
      )}
    </>
  );
}

// Stories du Fil : un rond par sprint, le sprint actif en premier.
async function FeedStories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sprints")
    .select(`id, status, goal, features(${FEATURE_WITH_RELATIONS})`)
    .order("id")
    .order("created_at", { referencedTable: "features", ascending: false });

  // Ordre des ronds : actif, puis planifiés, puis terminés.
  const order: Record<string, number> = { active: 0, planned: 1, completed: 2 };
  const sprints = [...(data ?? [])].sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3) || a.id - b.id);

  return (
    <section aria-label="Stories" className="mb-6">
      <SprintStories sprints={sprints} />
    </section>
  );
}

// Le fil de posts, avec « Charger plus » en bas.
async function Feed({
  features,
  moreHref,
}: {
  features: React.ComponentProps<typeof FeaturePost>["feature"][];
  moreHref: string | null;
}) {
  const currentUser = await getCurrentProfile();
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      {features.map((feature) => (
        <FeaturePost key={feature.id} feature={feature} currentUser={currentUser} />
      ))}
      {moreHref ? (
        <Button asChild variant="secondary" size="lg" className="self-center">
          {/* scroll={false} : on reste au même endroit, les nouveaux posts s'ajoutent en dessous */}
          <Link href={moreHref} scroll={false}>
            Charger plus
          </Link>
        </Button>
      ) : (
        <p className="text-center text-small text-ink-soft">Tu as tout vu ✦</p>
      )}
    </div>
  );
}
