// Règles de la photo de profil, partagées par le navigateur (message immédiat)
// et la Server Action (vérification qui fait foi).

// Types d'image acceptés, avec l'extension utilisée pour le nom du fichier
export const AVATAR_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 Mo

// Renvoie un message d'erreur, ou null si le fichier convient.
export function checkAvatarFile(file: File): string | null {
  if (file.size === 0) return "Choisis une image.";
  if (!AVATAR_TYPES[file.type]) return "Format refusé : choisis une image JPG, PNG ou WebP.";
  if (file.size > AVATAR_MAX_BYTES) {
    const sizeMb = (file.size / 1024 / 1024).toFixed(1).replace(".", ",");
    return `Image trop lourde (${sizeMb} Mo) : la limite est de 2 Mo.`;
  }
  return null;
}
