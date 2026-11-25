// Composant client : le glisser-déposer (souris et clavier) a besoin d'événements
// du navigateur et d'un état local pour déplacer la carte tout de suite.
"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type KeyboardCoordinateGetter,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { Undo2Icon, XIcon } from "lucide-react";
import { moveFeature, updateFeatureSprint } from "@/lib/actions/features";
import { canEditFeature } from "@/lib/permissions";
import { columnOf, type KanbanColumn, type KanbanGroup } from "@/lib/views";
import { cn } from "@/lib/utils";
import { CountPill, ModuleDot, PriorityBadge, SprintStatusBadge, StatusBadge } from "@/components/badges";
import { ActionForm } from "@/components/action-form";
import { featureCardClasses, FeatureCardContent, type CardFeature } from "@/components/feature-card";
import { Button } from "@/components/ui/button";

// Une carte a besoin de connaître la personne assignée pour savoir si on peut la déplacer.
type KanbanFeature = CardFeature & { assigned_to: string | null };

type KanbanBoardProps = {
  features: KanbanFeature[];
  // Membre connecté (id et rôle lus côté serveur dans profiles)
  viewer: { id: string; role: string } | null;
  columns: KanbanColumn[];
  group: KanbanGroup;
  // Dans le détail d'un sprint : un bouton sur chaque carte la renvoie au backlog.
  removableFromSprint?: boolean;
};

// Clavier : les flèches gauche / droite font sauter la carte d'une colonne à l'autre.
const moveBetweenColumns: KeyboardCoordinateGetter = (event, { context, currentCoordinates }) => {
  if (event.code !== "ArrowRight" && event.code !== "ArrowLeft") return;
  event.preventDefault();

  const { collisionRect, droppableRects } = context;
  if (!collisionRect) return;

  // Les colonnes, de gauche à droite
  const columns = [...droppableRects.values()].sort((a, b) => a.left - b.left);
  // La colonne actuelle est celle dont le bord gauche est le plus proche de la carte
  const distances = columns.map((column) => Math.abs(column.left - collisionRect.left));
  const currentIndex = distances.indexOf(Math.min(...distances));
  const target = columns[currentIndex + (event.code === "ArrowRight" ? 1 : -1)];
  if (!target) return;

  // On décale la carte de l'écart entre les deux colonnes, sans changer sa hauteur.
  return { x: currentCoordinates.x + (target.left - columns[currentIndex].left), y: currentCoordinates.y };
};

// Souris : la colonne sous le pointeur ; clavier : la colonne que la carte recouvre le plus.
const detectColumn: CollisionDetection = (args) => {
  const underPointer = pointerWithin(args);
  return underPointer.length > 0 ? underPointer : rectIntersection(args);
};

export function KanbanBoard({ features, viewer, columns, group, removableFromSprint = false }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Chaque feature avec sa colonne. Pendant l'enregistrement, useOptimistic affiche
  // déjà la carte dans sa nouvelle colonne ; si l'enregistrement échoue, elle revient seule.
  const [placed, placeOptimistic] = useOptimistic(
    features.map((feature) => ({ feature, column: columnOf(feature, group) })),
    (current, move: { id: number; column: string }) =>
      current.map((item) => (item.feature.id === move.id ? { ...item, column: move.column } : item)),
  );

  const sensors = useSensors(
    // La carte ne part qu'après 6 px de déplacement : un simple clic ouvre donc le détail.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // Espace saisit et dépose la carte ; Entrée reste libre pour ouvrir le détail.
    useSensor(KeyboardSensor, {
      coordinateGetter: moveBetweenColumns,
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space", "Enter"] },
    }),
  );

  // Le message d'erreur disparaît tout seul après quelques secondes.
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 6000);
    return () => clearTimeout(timer);
  }, [message]);

  const titleOf = (id: UniqueIdentifier) => placed.find((item) => item.feature.id === id)?.feature.title ?? "";
  const labelOf = (id: UniqueIdentifier) => columns.find((column) => column.id === id)?.label ?? "";

  // Phrases lues par les lecteurs d'écran pendant le glisser-déposer
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Carte « ${titleOf(active.id)} » saisie.`,
    onDragOver: ({ over }) => (over ? `Au-dessus de la colonne ${labelOf(over.id)}.` : "Hors des colonnes."),
    onDragEnd: ({ active, over }) =>
      over
        ? `Carte « ${titleOf(active.id)} » déposée dans la colonne ${labelOf(over.id)}.`
        : `Carte « ${titleOf(active.id)} » relâchée hors des colonnes.`,
    onDragCancel: ({ active }) => `Déplacement annulé : « ${titleOf(active.id)} » reste à sa place.`,
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;

    const item = placed.find((placedItem) => placedItem.feature.id === active.id);
    const targetColumn = String(over.id);
    if (!item || item.column === targetColumn) return;

    setMessage(null);
    startTransition(async () => {
      placeOptimistic({ id: item.feature.id, column: targetColumn });
      let error: string | null;
      try {
        ({ error } = await moveFeature(item.feature.id, group, targetColumn));
      } catch {
        error = "Le serveur ne répond pas.";
      }
      if (error) setMessage(`« ${item.feature.title} » est revenue à sa place. ${error}`);
    });
  }

  const activeFeature = placed.find((item) => item.feature.id === activeId)?.feature;

  return (
    <>
      <DndContext
        id="kanban"
        sensors={sensors}
        collisionDetection={detectColumn}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable:
              "Pour déplacer cette carte : Espace pour la saisir, flèches gauche et droite pour changer de colonne, Espace pour la déposer, Échap pour annuler. Entrée ouvre le détail.",
          },
        }}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        {/* Les colonnes défilent horizontalement quand elles sont nombreuses */}
        <div className="-mx-2 flex gap-6 overflow-x-auto px-2 pt-2 pb-6">
          {columns.map((column) => {
            const items = placed.filter((item) => item.column === column.id);
            return (
              <Column key={column.id} column={column} group={group} count={items.length}>
                {items.map(({ feature }) => (
                  <KanbanCard
                    key={feature.id}
                    feature={feature}
                    showStatus={group !== "statut"}
                    removableFromSprint={removableFromSprint}
                    // Même règle que la RLS : un admin, ou la personne assignée.
                    canMove={canEditFeature(viewer, feature)}
                  />
                ))}
              </Column>
            );
          })}
        </div>

        {/* Copie de la carte qui suit la souris pendant le déplacement */}
        <DragOverlay dropAnimation={null}>
          {activeFeature && (
            <div className={cn(featureCardClasses, "w-64 -rotate-2 cursor-grabbing shadow-clay-hover")}>
              <FeatureCardContent feature={activeFeature} showStatus={group !== "statut"} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {message && (
        <div
          role="alert"
          className="fixed inset-x-4 bottom-8 z-40 mx-auto flex w-fit items-center gap-3 rounded-lg bg-danger-soft py-3 pr-3 pl-5 font-bold text-danger shadow-clay"
        >
          {message}
          <Button variant="ghost" size="icon" aria-label="Fermer le message" onClick={() => setMessage(null)}>
            <XIcon aria-hidden="true" />
          </Button>
        </div>
      )}
    </>
  );
}

// Une colonne : on peut y déposer une carte.
function Column({
  column,
  group,
  count,
  children,
}: {
  column: KanbanColumn;
  group: KanbanGroup;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section
      ref={setNodeRef}
      aria-label={`Colonne ${column.label}`}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl bg-surface/55 p-4 shadow-clay-sm transition duration-150",
        isOver && "bg-surface-tint ring-2 ring-accent",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-2 pt-2 pb-4">
        <ColumnHeader column={column} group={group} />
        <CountPill count={count} />
      </div>
      {count === 0 ? (
        <p className="rounded-lg border-2 border-dashed border-border px-4 py-6 text-center text-small text-ink-soft">
          Dépose une carte ici
        </p>
      ) : (
        <ul className="flex flex-col gap-3">{children}</ul>
      )}
    </section>
  );
}

// Titre d'une colonne, avec le badge qui correspond au regroupement.
function ColumnHeader({ column, group }: { column: KanbanColumn; group: KanbanGroup }) {
  if (group === "statut") return <StatusBadge status={column.id} />;
  if (group === "priorite") return <PriorityBadge priority={column.id} />;
  return (
    <span className="flex min-w-0 items-center gap-2">
      {column.color && <ModuleDot color={column.color} className="size-3.5" />}
      <span className="truncate font-bold">{column.label}</span>
      {column.sprintStatus && <SprintStatusBadge status={column.sprintStatus} />}
    </span>
  );
}

// Une carte déplaçable. Un clic (ou Entrée) ouvre le détail de la feature.
function KanbanCard({
  feature,
  showStatus,
  removableFromSprint,
  canMove,
}: {
  feature: CardFeature;
  showStatus: boolean;
  removableFromSprint: boolean;
  canMove: boolean;
}) {
  const router = useRouter();
  // disabled : la carte reste cliquable mais ne peut plus être déplacée.
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: feature.id,
    disabled: !canMove,
    attributes: { roleDescription: canMove ? "carte déplaçable" : "carte" },
  });
  const openDetail = () => router.push(`/features/${feature.id}`);

  return (
    <li className="relative">
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={openDetail}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !isDragging) openDetail();
          else listeners?.onKeyDown?.(event);
        }}
        title={canMove ? undefined : "Seuls un admin ou la personne assignée peuvent déplacer cette carte"}
        className={cn(featureCardClasses, canMove ? "cursor-grab" : "cursor-pointer", isDragging && "opacity-40")}
      >
        <FeatureCardContent
          feature={feature}
          showStatus={showStatus}
          titleClassName={removableFromSprint && canMove ? "pr-9" : undefined}
        />
      </div>

      {/* Retirer = remettre sprint_id à vide : la feature retourne au backlog */}
      {removableFromSprint && canMove && (
        <ActionForm action={updateFeatureSprint.bind(null, feature.id)} className="absolute top-2 right-2 flex flex-col items-end">
          <input type="hidden" name="sprint_id" value="" />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="size-8"
            title="Retirer du sprint (retour au backlog)"
            aria-label={`Retirer « ${feature.title} » du sprint`}
          >
            <Undo2Icon aria-hidden="true" />
          </Button>
        </ActionForm>
      )}
    </li>
  );
}
