import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Compose des classes Tailwind : clsx gère les conditions,
// tailwind-merge garde la dernière classe en cas de conflit (ex. p-2 puis p-4).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
