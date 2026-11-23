// Valeurs autorisées par la base (contraintes CHECK de docs/modele.md),
// avec leur libellé français et les classes Tailwind de leur badge.
// Les classes sont écrites en entier pour que Tailwind les repère.

export const FEATURE_STATUSES = ["backlog", "todo", "in_progress", "done", "cancelled"] as const;
export type FeatureStatus = (typeof FEATURE_STATUSES)[number];

export const FEATURE_STATUS_LABELS: Record<FeatureStatus, string> = {
  backlog: "Backlog",
  todo: "À faire",
  in_progress: "En cours",
  done: "Terminé",
  cancelled: "Annulé",
};

export const FEATURE_STATUS_CLASSES: Record<FeatureStatus, string> = {
  backlog: "bg-status-backlog-soft text-status-backlog",
  todo: "bg-status-todo-soft text-status-todo",
  in_progress: "bg-status-in-progress-soft text-status-in-progress",
  done: "bg-status-done-soft text-status-done",
  cancelled: "bg-status-cancelled-soft text-status-cancelled",
};

export const PRIORITIES = ["critical", "high", "medium", "low", "nice_to_have"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: "Critique",
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
  nice_to_have: "Bonus",
};

export const PRIORITY_CLASSES: Record<Priority, string> = {
  critical: "bg-priority-critical-soft text-priority-critical shadow-critical",
  high: "bg-priority-high-soft text-priority-high",
  medium: "bg-priority-medium-soft text-priority-medium",
  low: "bg-priority-low-soft text-priority-low",
  nice_to_have: "bg-priority-nice-to-have-soft text-priority-nice-to-have",
};

// Nombre de barres pleines (sur 4) dans le badge de priorité
export const PRIORITY_BARS: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  nice_to_have: 0,
};

export const IMPACTS = ["low", "medium", "high"] as const;
export type Impact = (typeof IMPACTS)[number];

export const IMPACT_LABELS: Record<Impact, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
};

export const EFFORTS = ["xs", "s", "m", "l", "xl"] as const;
export type Effort = (typeof EFFORTS)[number];

export const SPRINT_STATUSES = ["planned", "active", "completed"] as const;
export type SprintStatus = (typeof SPRINT_STATUSES)[number];

export const SPRINT_STATUS_LABELS: Record<SprintStatus, string> = {
  planned: "Planifié",
  active: "Actif",
  completed: "Terminé",
};

export const SPRINT_STATUS_CLASSES: Record<SprintStatus, string> = {
  planned: "bg-sprint-planned-soft text-sprint-planned",
  active: "bg-sprint-active-soft text-sprint-active",
  completed: "bg-sprint-completed-soft text-sprint-completed",
};

// Palette proposée pour la couleur d'un module (docs/design-system.md)
export const MODULE_COLORS = [
  { name: "Lilas", value: "#B9A8FF" },
  { name: "Menthe", value: "#8FE3C0" },
  { name: "Pêche", value: "#FFC29E" },
  { name: "Beurre", value: "#FFE07A" },
  { name: "Ciel", value: "#9CD3FF" },
  { name: "Rose", value: "#FFA8C5" },
  { name: "Sauge", value: "#B5D99C" },
  { name: "Corail", value: "#FF9C8A" },
] as const;

// La base stocke ces champs en texte : ces fonctions vérifient qu'une valeur
// fait bien partie de la liste avant de l'utiliser (sinon on prend un défaut).
export function toFeatureStatus(value: string): FeatureStatus {
  return FEATURE_STATUSES.find((status) => status === value) ?? "backlog";
}

export function toPriority(value: string): Priority {
  return PRIORITIES.find((priority) => priority === value) ?? "medium";
}

export function toImpact(value: string): Impact {
  return IMPACTS.find((impact) => impact === value) ?? "medium";
}

export function toSprintStatus(value: string): SprintStatus {
  return SPRINT_STATUSES.find((status) => status === value) ?? "planned";
}

// Ordres de tri : la priorité la plus haute et l'impact le plus fort d'abord
export const PRIORITY_RANK: Record<Priority, number> = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
  nice_to_have: 5,
};

export const IMPACT_RANK: Record<Impact, number> = { high: 1, medium: 2, low: 3 };
