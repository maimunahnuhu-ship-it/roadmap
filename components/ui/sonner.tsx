// Composant client : sonner affiche les notifications animées en bas de l'écran
// (elles glissent, s'empilent et disparaissent toutes seules).
"use client";

import { Toaster as Sonner } from "sonner";
import { CircleAlertIcon, PartyPopperIcon } from "lucide-react";

// Version restylée du composant « sonner » de shadcn/ui, avec nos tokens.
// unstyled : sonner garde ses animations, mais on fournit toutes les couleurs.
export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      gap={12}
      icons={{
        success: <PartyPopperIcon aria-hidden="true" className="size-5" />,
        error: <CircleAlertIcon aria-hidden="true" className="size-5" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-3 rounded-lg bg-surface px-5 py-4 font-bold text-ink shadow-clay-hover sm:min-w-80",
          success: "[&_[data-icon]]:text-status-done",
          error: "bg-danger-soft text-danger",
          description: "text-small font-normal text-ink-soft",
        },
      }}
    />
  );
}
