// Règles d'accès de l'interface. Elles reprennent les policies RLS de Supabase :
// la base reste le vrai garde-fou, l'interface évite juste de proposer
// un bouton qui serait refusé.

type Viewer = { id: string; role: string } | null;

// Policy « Admins can insert features » : seul un admin crée des features.
export function isAdmin(viewer: Viewer) {
  return viewer?.role === "admin";
}

// Policies « Admins or assignees can update / delete features » :
// un admin, ou la personne assignée à la feature.
export function canEditFeature(viewer: Viewer, feature: { assigned_to: string | null }) {
  return isAdmin(viewer) || (viewer !== null && feature.assigned_to === viewer.id);
}

// Policy « Authors can update their own comments » : seul l'auteur.
export function canEditComment(viewer: Viewer, comment: { author_id: string }) {
  return viewer !== null && comment.author_id === viewer.id;
}
