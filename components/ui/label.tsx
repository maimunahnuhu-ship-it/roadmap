// Composant client car le Label de Radix réagit aux clics pour donner
// le focus au champ associé.
"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Label({
  className,
  required = false,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  // required : affiche le petit point violet des champs obligatoires
  required?: boolean;
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "inline-flex items-center gap-1.5 text-label uppercase text-ink-soft select-none",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <>
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
          <span className="sr-only">(obligatoire)</span>
        </>
      )}
    </LabelPrimitive.Root>
  );
}

export { Label };
