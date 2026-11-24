// Vues du Backlog (façon Notion) et regroupements du Kanban.
// Les valeurs sont celles écrites dans l'adresse : /?vue=kanban&groupe=statut

import {
  FEATURE_STATUSES,
  FEATURE_STATUS_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  toFeatureStatus,
  toPriority,
} from "@/lib/constants";
import { sprintName } from "@/lib/format";

export const VIEWS = ["liste", "kanban", "galerie", "fil"] as const;
export type View = (typeof VIEWS)[number];

export const VIEW_LABELS: Record<View, string> = {
  liste: "Liste",
  kanban: "Kanban",
  galerie: "Galerie",
  fil: "Fil",
};

export const KANBAN_GROUPS = ["statut", "priorite", "module", "sprint"] as const;
export type KanbanGroup = (typeof KANBAN_GROUPS)[number];

export const KANBAN_GROUP_LABELS: Record<KanbanGroup, string> = {
  statut: "Statut",
  priorite: "Priorité",
  module: "Module",
  sprint: "Sprint",
};

// Une valeur inconnue dans l'adresse retombe sur la valeur par défaut.
export function toView(value: string): View {
  return VIEWS.find((view) => view === value) ?? "liste";
}

export function toKanbanGroup(value: string): KanbanGroup {
  return KANBAN_GROUPS.find((group) => group === value) ?? "statut";
}

// Identifiant de la colonne « Sans sprint » (= backlog) quand on groupe par sprint.
export const NO_SPRINT = "none";

// Vue Fil : nombre de posts affichés au départ, puis ajoutés par « Charger plus ».
export const FEED_PAGE_SIZE = 5;

// Une colonne du Kanban. « id » est la valeur écrite dans la base quand on y dépose une carte.
export type KanbanColumn = {
  id: string;
  label: string;
  color?: string; // couleur du module
  sprintStatus?: string; // statut du sprint
};

// Liste des colonnes selon le regroupement choisi.
export function getKanbanColumns(
  group: KanbanGroup,
  options: {
    modules: { id: number; name: string; color: string }[];
    sprints: { id: number; status: string }[];
  },
): KanbanColumn[] {
  if (group === "statut") {
    return FEATURE_STATUSES.map((status) => ({ id: status, label: FEATURE_STATUS_LABELS[status] }));
  }
  if (group === "priorite") {
    return PRIORITIES.map((priority) => ({ id: priority, label: PRIORITY_LABELS[priority] }));
  }
  if (group === "module") {
    return options.modules.map((module) => ({ id: String(module.id), label: module.name, color: module.color }));
  }
  return [
    { id: NO_SPRINT, label: "Sans sprint" },
    ...options.sprints.map((sprint) => ({
      id: String(sprint.id),
      label: sprintName(sprint.id),
      sprintStatus: sprint.status,
    })),
  ];
}

// Colonne dans laquelle se trouve une feature.
export function columnOf(
  feature: { status: string; priority: string; module_id: number; sprint_id: number | null },
  group: KanbanGroup,
): string {
  if (group === "statut") return toFeatureStatus(feature.status);
  if (group === "priorite") return toPriority(feature.priority);
  if (group === "module") return String(feature.module_id);
  return feature.sprint_id ? String(feature.sprint_id) : NO_SPRINT;
}
