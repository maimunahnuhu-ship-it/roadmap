import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NativeSelectProps = React.ComponentProps<"select"> & {
  // field : champ de formulaire creusé ; chip : pilule de filtre en relief
  variant?: "field" | "chip";
  // active : met la pilule en couleur quand un filtre est choisi
  active?: boolean;
  wrapperClassName?: string;
};

// Liste déroulante native du navigateur : simple, accessible au clavier
// et utilisable dans un formulaire sans JavaScript.
function NativeSelect({
  className,
  wrapperClassName,
  variant = "field",
  active = false,
  ...props
}: NativeSelectProps) {
  return (
    <div className={cn("relative", variant === "field" && "w-full", wrapperClassName)}>
      <select
        data-slot="native-select"
        className={cn(
          "w-full cursor-pointer appearance-none text-ink transition outline-none focus-visible:shadow-glow disabled:cursor-not-allowed disabled:opacity-55",
          variant === "field" &&
            "h-12 rounded-md bg-surface-sunken pr-10 pl-4 text-body shadow-sunken hover:bg-surface-hover focus-visible:bg-surface aria-invalid:ring-2 aria-invalid:ring-danger",
          variant === "chip" &&
            "h-10 rounded-full bg-surface pr-9 pl-4 text-small font-bold text-ink-soft shadow-clay-sm hover:shadow-clay-hover",
          variant === "chip" && active && "bg-accent-soft text-accent",
          className,
        )}
        {...props}
      />
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-soft"
      />
    </div>
  );
}

export { NativeSelect };
