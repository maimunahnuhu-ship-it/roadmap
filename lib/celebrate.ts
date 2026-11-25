// Déclenche une pluie de confettis (affichée par le composant <Confetti />
// présent dans la mise en page). Un simple événement du navigateur suffit :
// n'importe quel composant client peut l'appeler.
export const CONFETTI_EVENT = "roadmap:confetti";

export function celebrate() {
  window.dispatchEvent(new Event(CONFETTI_EVENT));
}
