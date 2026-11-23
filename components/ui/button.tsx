import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

// Bouton du design system : relief « Bonbon » pour les boutons pleins,
// qui s'enfoncent quand on clique.
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-bold transition duration-150 ease-bounce outline-none focus-visible:shadow-glow disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5",
  {
    variants: {
      variant: {
        primary:
          "bg-accent font-extrabold text-on-accent shadow-edge-accent hover:-translate-y-px hover:bg-accent-hover hover:shadow-edge-accent-hover active:translate-y-0.75 active:shadow-edge-accent-pressed",
        secondary:
          "border border-border bg-surface text-accent shadow-clay-sm hover:-translate-y-px hover:shadow-clay-hover",
        ghost: "text-ink-soft hover:bg-accent-soft hover:text-ink",
        danger:
          "bg-danger font-extrabold text-on-accent shadow-edge-danger active:translate-y-0.75 active:shadow-edge-danger-pressed",
        aurora:
          "bg-aurora font-extrabold text-on-accent shadow-edge-accent hover:-translate-y-0.5 active:translate-y-0.75 active:shadow-edge-accent-pressed",
      },
      size: {
        sm: "h-8 rounded-md px-3 text-small",
        md: "h-11 px-5 text-body",
        lg: "h-13 px-6 text-body-lg",
        icon: "size-10 rounded-full",
        fab: "size-15 rounded-full [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    // asChild : applique le style du bouton à l'enfant (ex. un <Link>)
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
