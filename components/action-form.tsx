// Composant client : useActionState garde la réponse de la Server Action
// pour afficher son message d'erreur sous le formulaire.
"use client";

import { useActionState } from "react";
import { OK, type ActionResult } from "@/lib/action-result";
import { FieldError } from "@/components/field-error";

type ActionFormProps = {
  // Server Action qui reçoit l'état précédent et le FormData, et renvoie { error }
  action: (previous: ActionResult, formData: FormData) => Promise<ActionResult>;
  className?: string;
  children: React.ReactNode;
};

// Formulaire branché sur une Server Action, qui affiche le refus éventuel de la base.
export function ActionForm({ action, className, children }: ActionFormProps) {
  const [state, formAction] = useActionState(action, OK);

  return (
    <form action={formAction} className={className}>
      {children}
      <FieldError message={state.error ?? undefined} />
    </form>
  );
}
