import { z } from "zod";
import { EFFORTS, FEATURE_STATUSES, IMPACTS, PRIORITIES, SPRINT_STATUSES } from "@/lib/constants";

// Schémas de validation zod, utilisés deux fois :
// - dans le navigateur par react-hook-form, pour afficher les erreurs tout de suite ;
// - dans les Server Actions, car on ne fait jamais confiance aux données reçues.
// Les listes déroulantes renvoient du texte : "" veut dire « aucune valeur ».

export const loginSchema = z.object({
  email: z.email("Saisis une adresse email valide"),
  password: z.string().min(1, "Saisis ton mot de passe"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const featureSchema = z.object({
  title: z.string().trim().min(1, "Le titre est obligatoire"),
  module_id: z.string().min(1, "Choisis un module"),
  description: z.string(),
  status: z.enum(FEATURE_STATUSES),
  priority: z.enum(PRIORITIES),
  impact: z.enum(IMPACTS),
  effort: z.enum(["", ...EFFORTS]),
  sprint_id: z.string(),
  assigned_to: z.string(),
});
export type FeatureValues = z.infer<typeof featureSchema>;

export const commentSchema = z.object({
  content: z.string().trim().min(1, "Écris un commentaire avant d'envoyer"),
});
export type CommentValues = z.infer<typeof commentSchema>;

export const sprintSchema = z
  .object({
    start_date: z.string().min(1, "La date de début est obligatoire"),
    end_date: z.string().min(1, "La date de fin est obligatoire"),
    goal: z.string().trim(),
  })
  // Les dates au format AAAA-MM-JJ se comparent comme du texte.
  .refine((values) => values.end_date >= values.start_date, {
    message: "La date de fin doit être après la date de début",
    path: ["end_date"],
  });
export type SprintValues = z.infer<typeof sprintSchema>;

export const sprintStatusSchema = z.enum(SPRINT_STATUSES);

export const moduleSchema = z.object({
  name: z.string().trim().min(1, "Le nom est obligatoire"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choisis une couleur"),
  description: z.string().trim(),
});
export type ModuleValues = z.infer<typeof moduleSchema>;

// Page « Mon profil » : seuls le prénom et le nom sont modifiables
// (le rôle n'est jamais envoyé par le formulaire).
export const profileSchema = z.object({
  firstname: z.string().trim().min(1, "Le prénom est obligatoire").max(50, "50 caractères au maximum"),
  lastname: z.string().trim().min(1, "Le nom est obligatoire").max(50, "50 caractères au maximum"),
});
export type ProfileValues = z.infer<typeof profileSchema>;
