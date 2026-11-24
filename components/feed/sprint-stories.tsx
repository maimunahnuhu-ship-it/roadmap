// Composant client : les stories s'ouvrent en plein écran et se parcourent
// au clic et au clavier, ce qui demande un état local et des événements.
"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { toSprintStatus, type SprintStatus } from "@/lib/constants";
import { fullName, sprintName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ModuleDot, PriorityBadge, SprintStatusBadge, StatusBadge } from "@/components/badges";
import type { CardFeature } from "@/components/feature-card";
import { NobodyAvatar, PersonAvatar } from "@/components/person-avatar";
import { Button } from "@/components/ui/button";

export type StorySprint = {
  id: number;
  status: string;
  goal: string | null;
  features: CardFeature[];
};

// Contour du rond selon le statut du sprint (le sprint actif porte l'aurora).
const RING_CLASSES: Record<SprintStatus, string> = {
  active: "bg-aurora shadow-glow",
  planned: "bg-sprint-planned",
  completed: "bg-sprint-completed",
};

// Position dans les stories : quel sprint, et quelle feature de ce sprint.
type Position = { sprint: number; feature: number };

export function SprintStories({ sprints }: { sprints: StorySprint[] }) {
  const [position, setPosition] = useState<Position | null>(null);

  // Suivante : la feature d'après, puis le sprint d'après ; à la fin, on ferme.
  function next() {
    if (!position) return;
    if (position.feature < sprints[position.sprint].features.length - 1) {
      setPosition({ sprint: position.sprint, feature: position.feature + 1 });
    } else if (position.sprint < sprints.length - 1) {
      setPosition({ sprint: position.sprint + 1, feature: 0 });
    } else {
      setPosition(null);
    }
  }

  // Précédente : la feature d'avant, ou la dernière du sprint d'avant.
  function previous() {
    if (!position) return;
    if (position.feature > 0) {
      setPosition({ sprint: position.sprint, feature: position.feature - 1 });
    } else if (position.sprint > 0) {
      const sprint = position.sprint - 1;
      setPosition({ sprint, feature: Math.max(0, sprints[sprint].features.length - 1) });
    }
  }

  const sprint = position ? sprints[position.sprint] : null;
  const feature = sprint && position ? sprint.features[position.feature] : undefined;

  return (
    <>
      {/* La rangée de ronds, un par sprint */}
      <ul aria-label="Stories des sprints" className="-mx-2 flex gap-4 overflow-x-auto px-2 pt-2 pb-4">
        {sprints.map((item, index) => {
          const status = toSprintStatus(item.status);
          return (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setPosition({ sprint: index, feature: 0 })}
                className="group flex w-24 cursor-pointer flex-col items-center gap-2 rounded-lg outline-none focus-visible:shadow-glow"
              >
                <span
                  className={cn(
                    "rounded-full p-1 transition duration-150 ease-bounce group-hover:scale-105",
                    RING_CLASSES[status],
                  )}
                >
                  <span className="flex size-18 flex-col items-center justify-center rounded-full border-4 border-surface bg-surface-tint shadow-clay-sm">
                    <span className="font-data text-h2 leading-none">S{item.id}</span>
                    <span className="font-data text-label text-ink-soft">{item.features.length}</span>
                  </span>
                </span>
                <span className="sr-only">
                  {sprintName(item.id)}, {item.features.length} features :
                </span>
                <span className="line-clamp-2 text-center text-small">{item.goal || sprintName(item.id)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* La story en plein écran */}
      <DialogPrimitive.Root open={position !== null} onOpenChange={(open) => !open && setPosition(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm data-open:animate-in data-open:fade-in-0" />
          <DialogPrimitive.Content
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") next();
              if (event.key === "ArrowLeft") previous();
            }}
            className="fixed inset-0 z-50 flex items-center justify-center outline-none sm:p-8 data-open:animate-in data-open:zoom-in-95 data-open:fade-in-0"
          >
            {sprint && position && (
              <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-surface shadow-clay sm:h-auto sm:min-h-160 sm:rounded-xl">
                {/* Les petites barres de progression : une par feature du sprint */}
                <div className="flex gap-1 px-4 pt-4" aria-hidden="true">
                  {(sprint.features.length > 0 ? sprint.features : [null]).map((item, index) => (
                    <span
                      key={item?.id ?? "vide"}
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        index <= position.feature ? "bg-aurora" : "bg-surface-sunken shadow-sunken",
                        index === position.feature && "shadow-glow",
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3 px-5 pt-4">
                  <span className={cn("rounded-full p-0.5", RING_CLASSES[toSprintStatus(sprint.status)])}>
                    <span className="flex size-9 items-center justify-center rounded-full border-2 border-surface bg-surface-tint font-data text-data">
                      S{sprint.id}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <DialogPrimitive.Title className="font-title text-h3">{sprintName(sprint.id)}</DialogPrimitive.Title>
                    <DialogPrimitive.Description className="truncate text-small text-ink-soft">
                      {sprint.goal || "Pas d'objectif."}
                    </DialogPrimitive.Description>
                  </div>
                  <span className="font-data text-data text-ink-soft">
                    {sprint.features.length > 0 ? `${position.feature + 1} / ${sprint.features.length}` : "0 / 0"}
                  </span>
                  <DialogPrimitive.Close className="flex size-10 cursor-pointer items-center justify-center rounded-full text-ink-soft transition outline-none hover:bg-accent-soft hover:text-ink focus-visible:shadow-glow">
                    <XIcon className="size-5" aria-hidden="true" />
                    <span className="sr-only">Fermer</span>
                  </DialogPrimitive.Close>
                </div>

                {/* Le contenu de la story ; les deux moitiés servent de zones de clic */}
                <div className="relative flex flex-1 flex-col justify-center px-8 py-10">
                  <button
                    type="button"
                    onClick={previous}
                    className="absolute inset-y-0 left-0 z-10 flex w-1/3 cursor-pointer items-center justify-start pl-2 text-ink-muted opacity-0 transition outline-none hover:opacity-100 focus-visible:opacity-100"
                  >
                    <ChevronLeftIcon aria-hidden="true" className="size-6" />
                    <span className="sr-only">Feature précédente</span>
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="absolute inset-y-0 right-0 z-10 flex w-2/3 cursor-pointer items-center justify-end pr-2 text-ink-muted opacity-0 transition outline-none hover:opacity-100 focus-visible:opacity-100"
                  >
                    <ChevronRightIcon aria-hidden="true" className="size-6" />
                    <span className="sr-only">Feature suivante</span>
                  </button>

                  {feature ? (
                    <StoryContent key={feature.id} feature={feature} sprintStatus={sprint.status} />
                  ) : (
                    <p className="text-center text-body-lg text-ink-soft">Aucune feature dans ce sprint.</p>
                  )}
                </div>

                {feature && (
                  <div className="relative z-20 px-5 pb-6">
                    <Button asChild size="lg" className="w-full">
                      <Link href={`/features/${feature.id}`}>
                        Voir la feature
                        <ArrowRightIcon aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}

// Une feature affichée en grand dans la story.
function StoryContent({ feature, sprintStatus }: { feature: CardFeature; sprintStatus: string }) {
  const color = feature.module?.color ?? "#B9A8FF";
  return (
    <div className="relative flex flex-col items-start gap-6 animate-in fade-in-0 slide-in-from-right-4">
      {/* Grosse bille à la couleur du module (donnée de la base : style inline autorisé) */}
      <span aria-hidden="true" className="bille size-20" style={{ backgroundColor: color }} />
      <span className="inline-flex items-center gap-2 font-bold">
        <ModuleDot color={color} />
        {feature.module?.name}
      </span>
      <p className={cn("font-title text-display max-sm:text-h1", feature.status === "cancelled" && "text-ink-muted line-through")}>
        {feature.title}
      </p>
      <span className="flex flex-wrap gap-2">
        <StatusBadge status={feature.status} />
        <PriorityBadge priority={feature.priority} />
        {sprintStatus === "active" && <SprintStatusBadge status={sprintStatus} />}
      </span>
      <span className="inline-flex items-center gap-3">
        {feature.assignee ? (
          <PersonAvatar person={feature.assignee} className="size-10" />
        ) : (
          <NobodyAvatar className="size-10" />
        )}
        <span className="font-bold">{feature.assignee ? fullName(feature.assignee) : "Non assignée"}</span>
      </span>
    </div>
  );
}
