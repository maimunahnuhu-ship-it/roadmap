import * as React from "react";
import { cn } from "@/lib/utils";

// Zone de texte : même apparence que les champs, s'agrandit avec le contenu.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content min-h-30 w-full rounded-md bg-surface-sunken px-4 py-3 text-body text-ink shadow-sunken transition outline-none placeholder:text-ink-muted hover:bg-surface-hover focus-visible:bg-surface focus-visible:shadow-glow disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:ring-2 aria-invalid:ring-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
