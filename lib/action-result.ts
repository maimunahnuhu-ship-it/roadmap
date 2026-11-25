// Résultat renvoyé par les Server Actions : error vaut null si tout s'est bien passé.
export type ActionResult = { error: string | null };

export const OK: ActionResult = { error: null };

// Avec la RLS, une modification refusée ne déclenche pas toujours d'erreur :
// la base ne touche simplement aucune ligne. On vérifie donc les deux cas,
// grâce au .select("id") ajouté après update() ou delete().
export function checkWrite(
  result: { error: unknown; data: unknown[] | null },
  refusedMessage: string,
): ActionResult {
  if (result.error || !result.data || result.data.length === 0) return { error: refusedMessage };
  return OK;
}
