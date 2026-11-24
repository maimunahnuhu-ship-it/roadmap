import { cn } from "@/lib/utils";
import { EffortChip, ModuleDot, PriorityBadge, StatusBadge } from "@/components/badges";
import { NobodyAvatar, PersonAvatar } from "@/components/person-avatar";

// Ce qu'il faut savoir d'une feature pour afficher sa carte
// (même forme que le résultat de FEATURE_WITH_RELATIONS).
export type CardFeature = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  effort: string | null;
  module_id: number;
  sprint_id: number | null;
  module: { id: number; name: string; color: string } | null;
  assignee: {
    firstname: string | null;
    lastname: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
};

// Classes de la carte, partagées par la Galerie (un lien) et le Kanban (une carte déplaçable).
export const featureCardClasses =
  "flex flex-col gap-3 rounded-lg bg-surface p-4 text-left shadow-clay-sm transition duration-150 ease-bounce outline-none hover:-translate-y-0.5 hover:shadow-clay-hover focus-visible:shadow-glow";

type FeatureCardContentProps = {
  feature: CardFeature;
  showDescription?: boolean;
  showStatus?: boolean;
  // Laisse de la place à droite du titre (pour un bouton posé sur la carte)
  titleClassName?: string;
};

// Contenu d'une carte de feature, réutilisé dans la Galerie et le Kanban.
export function FeatureCardContent({
  feature,
  showDescription = false,
  showStatus = true,
  titleClassName,
}: FeatureCardContentProps) {
  const cancelled = feature.status === "cancelled";

  return (
    <>
      <span className={cn("font-bold", cancelled && "text-ink-muted line-through", titleClassName)}>
        {feature.title}
      </span>

      {showDescription && (
        <span className="line-clamp-2 text-small text-ink-soft">
          {feature.description || "Pas encore de description."}
        </span>
      )}

      <span className="inline-flex items-center gap-2 text-small">
        <ModuleDot color={feature.module?.color ?? "#B9A8FF"} />
        <span className="truncate">{feature.module?.name}</span>
      </span>

      <span className="mt-auto flex items-center justify-between gap-2">
        <span className="flex flex-wrap items-center gap-2">
          {showStatus && <StatusBadge status={feature.status} />}
          <PriorityBadge priority={feature.priority} />
          <EffortChip effort={feature.effort} />
        </span>
        {feature.assignee ? (
          <PersonAvatar person={feature.assignee} className="size-7" />
        ) : (
          <NobodyAvatar />
        )}
      </span>
    </>
  );
}
