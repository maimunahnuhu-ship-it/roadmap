import Link from "next/link";
import { GalleryVerticalEndIcon, KanbanIcon, LayoutGridIcon, ListIcon } from "lucide-react";
import { VIEW_LABELS, VIEWS, type View } from "@/lib/views";
import { cn } from "@/lib/utils";

const VIEW_ICONS: Record<View, typeof ListIcon> = {
  liste: ListIcon,
  kanban: KanbanIcon,
  galerie: LayoutGridIcon,
  fil: GalleryVerticalEndIcon,
};

// Sélecteur de vue : de simples liens qui changent « vue » dans l'adresse
// en gardant les filtres déjà choisis.
export function ViewSwitcher({ current, hrefFor }: { current: View; hrefFor: (view: View) => string }) {
  return (
    <nav aria-label="Vue du backlog" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface-sunken p-1 shadow-sunken">
      {VIEWS.map((view) => {
        const Icon = VIEW_ICONS[view];
        const active = view === current;
        return (
          <Link
            key={view}
            href={hrefFor(view)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 max-sm:px-3 font-bold transition duration-150 ease-bounce outline-none focus-visible:shadow-glow",
              active ? "bg-surface text-ink shadow-clay-sm" : "text-ink-soft hover:text-ink",
            )}
          >
            <Icon aria-hidden="true" className="size-4.5" />
            {VIEW_LABELS[view]}
          </Link>
        );
      })}
    </nav>
  );
}
