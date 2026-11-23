import {
  FEATURE_STATUS_CLASSES,
  FEATURE_STATUS_LABELS,
  PRIORITY_BARS,
  PRIORITY_CLASSES,
  PRIORITY_LABELS,
  SPRINT_STATUS_CLASSES,
  SPRINT_STATUS_LABELS,
  toFeatureStatus,
  toPriority,
  toSprintStatus,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

// Badges du design system. La base stocke les valeurs en texte ;
// les fonctions to...() garantissent qu'on affiche une valeur connue.

// Point lumineux devant le libellé d'un statut (il pulse quand c'est « en cours »).
function StatusDot({ pulse }: { pulse: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-2 shrink-0 rounded-full bg-current shadow-dot", pulse && "animate-pulse-dot")}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  const value = toFeatureStatus(status);
  return (
    <span
      className={cn(
        "inline-flex h-6.5 items-center gap-1.5 rounded-full px-2.5 text-small leading-none whitespace-nowrap",
        FEATURE_STATUS_CLASSES[value],
      )}
    >
      <StatusDot pulse={value === "in_progress"} />
      {FEATURE_STATUS_LABELS[value]}
    </span>
  );
}

export function SprintStatusBadge({ status }: { status: string }) {
  const value = toSprintStatus(status);
  const badge = (
    <span
      className={cn(
        "inline-flex h-6.5 items-center gap-1.5 rounded-full px-2.5 text-small leading-none whitespace-nowrap",
        SPRINT_STATUS_CLASSES[value],
      )}
    >
      <StatusDot pulse={value === "active"} />
      {SPRINT_STATUS_LABELS[value]}
    </span>
  );

  // Le sprint actif est entouré du dégradé « aurora ».
  if (value !== "active") return badge;
  return <span className="inline-flex rounded-full bg-aurora p-0.5">{badge}</span>;
}

export function PriorityBadge({ priority, compact = false }: { priority: string; compact?: boolean }) {
  const value = toPriority(priority);
  const filledBars = PRIORITY_BARS[value];

  return (
    <span
      title={compact ? `Priorité ${PRIORITY_LABELS[value]}` : undefined}
      className={cn(
        "inline-flex h-6.5 items-center gap-1.5 rounded-sm px-2 text-small leading-none whitespace-nowrap",
        PRIORITY_CLASSES[value],
      )}
    >
      {filledBars === 0 ? (
        <span aria-hidden="true">✦</span>
      ) : (
        <span aria-hidden="true" className="flex h-2.5 items-end gap-0.5">
          {[1, 2, 3, 4].map((bar) => (
            <span
              key={bar}
              className={cn("h-2.5 w-0.75 rounded-full bg-current", bar > filledBars && "opacity-25")}
            />
          ))}
        </span>
      )}
      <span className={cn(compact && "sr-only")}>{PRIORITY_LABELS[value]}</span>
    </span>
  );
}

export function EffortChip({ effort }: { effort: string | null }) {
  return (
    <span
      title="Effort"
      className="inline-flex h-6 min-w-8 items-center justify-center rounded-sm bg-surface-sunken px-1.5 font-data text-data text-ink shadow-sunken"
    >
      {effort ? effort.toUpperCase() : "—"}
    </span>
  );
}

// Pastille de couleur d'un module : la couleur vient de la base,
// c'est donc une valeur dynamique (le seul cas où un style inline est permis).
export function ModuleDot({ color, className }: { color: string; className?: string }) {
  return <span aria-hidden="true" className={cn("bille size-3 shrink-0", className)} style={{ backgroundColor: color }} />;
}

export function CountPill({ count }: { count: number }) {
  return (
    <span className="inline-flex h-6 min-w-7 items-center justify-center rounded-full bg-surface px-2 font-data text-data shadow-clay-sm">
      {count}
    </span>
  );
}

export function ProgressBar({ done, total, label }: { done: number; total: number; label: string }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="h-3 flex-1 overflow-hidden rounded-full bg-surface-sunken shadow-sunken"
      >
        {/* La largeur dépend des données : style inline autorisé (valeur dynamique) */}
        <div className="h-full rounded-full bg-aurora" style={{ width: `${percent}%` }} />
      </div>
      <span className="font-data text-data whitespace-nowrap">
        {done} / {total}
      </span>
    </div>
  );
}
