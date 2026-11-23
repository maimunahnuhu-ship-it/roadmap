import * as React from "react";
import { cn } from "@/lib/utils";

// Champ creusé dans la surface au repos, qui « remonte » avec un halo au focus.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-md bg-surface-sunken px-4 text-body text-ink shadow-sunken transition outline-none placeholder:text-ink-muted hover:bg-surface-hover focus-visible:bg-surface focus-visible:shadow-glow disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:ring-2 aria-invalid:ring-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
