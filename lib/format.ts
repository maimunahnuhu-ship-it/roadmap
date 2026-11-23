// Petites fonctions d'affichage partagées par toutes les pages.

// Les sprints n'ont pas de nom dans la base : on les nomme par leur numéro.
export function sprintName(sprintId: number) {
  return `Sprint ${sprintId}`;
}

type PersonName = { firstname: string | null; lastname: string | null; email: string };

export function fullName(person: PersonName) {
  const name = [person.firstname, person.lastname].filter(Boolean).join(" ");
  return name || person.email;
}

export function initials(person: PersonName) {
  const letters = `${person.firstname?.[0] ?? ""}${person.lastname?.[0] ?? ""}`;
  return (letters || person.email[0]).toUpperCase();
}

// Une date "2026-02-09" (colonne date) devient « 9 févr. 2026 ».
// On ajoute midi pour éviter un décalage de jour dû au fuseau horaire.
export function formatDay(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${date}T12:00:00`),
  );
}

// Un horodatage (colonne timestamptz) devient « 17 nov. 2026 · 10:12 ».
export function formatDateTime(timestamp: string) {
  const date = new Date(timestamp);
  const day = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(date);
  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(date);
  return `${day} · ${time}`;
}
