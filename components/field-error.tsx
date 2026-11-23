import { CircleAlertIcon } from "lucide-react";

// Message d'erreur sous un champ (rien n'est affiché s'il n'y a pas d'erreur).
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1.5 text-small text-danger">
      <CircleAlertIcon className="size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
