import Link from "next/link";
import { IMPACT_LABELS, toImpact } from "@/lib/constants";
import { sprintName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EffortChip, ModuleDot, PriorityBadge, StatusBlock } from "@/components/badges";
import type { CardFeature } from "@/components/feature-card";
import { NobodyAvatar, PersonAvatar } from "@/components/person-avatar";

// La liste a besoin de l'impact en plus des champs d'une carte.
type ListFeature = CardFeature & { impact: string };

// Vue Liste : une ligne par feature, avec toutes ses colonnes.
export function FeatureList({ features }: { features: ListFeature[] }) {
  return (
    <>
      {/* En-têtes de colonnes (mêmes largeurs que les lignes) */}
      <div aria-hidden="true" className="mb-2 flex items-center gap-3 px-4 text-label uppercase text-ink-soft max-md:hidden">
        <span className="min-w-0 flex-1">Feature</span>
        <span className="w-36 max-lg:hidden">Module</span>
        <span className="w-28 text-center">Statut</span>
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
              className="flex min-h-15 items-center gap-3 rounded-lg bg-surface px-4 py-3 shadow-clay-sm transition duration-150 ease-bounce outline-none hover:-translate-y-0.5 hover:scale-101 hover:shadow-clay-hover focus-visible:shadow-glow"
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
              {/* Statut en bloc de couleur pleine, façon tableau */}
              <span className="w-28">
                <StatusBlock status={feature.status} />
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
  );
}
