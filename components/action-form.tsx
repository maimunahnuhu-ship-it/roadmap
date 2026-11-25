// Composant client : useActionState garde la réponse de la Server Action
// pour afficher le refus éventuel de la base dans une notification.
"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { OK, type ActionResult } from "@/lib/action-result";

type ActionFormProps = {
  // Server Action qui reçoit l'état précédent et le FormData, et renvoie { error }
  action: (previous: ActionResult, formData: FormData) => Promise<ActionResult>;
  className?: string;
  children: React.ReactNode;
};

// Formulaire branché sur une Server Action : en cas de refus, une notification l'explique.
export function ActionForm({ action, className, children }: ActionFormProps) {
  const [state, formAction] = useActionState(action, OK);

  // Chaque réponse est un nouvel objet : l'effet se relance à chaque envoi.
  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}
