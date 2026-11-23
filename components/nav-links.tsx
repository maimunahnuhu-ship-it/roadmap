// Composant client : il lit l'adresse actuelle (usePathname) pour
// mettre en valeur la rubrique où l'on se trouve.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Backlog" },
  { href: "/sprints", label: "Sprints" },
  { href: "/modules", label: "Modules" },
  { href: "/equipe", label: "Équipe" },
];

export function NavLinks() {
  const pathname = usePathname();

  // Le détail d'une feature fait partie de la rubrique Backlog.
  function isActive(href: string) {
    if (href === "/") return pathname === "/" || pathname.startsWith("/features");
    return pathname.startsWith(href);
  }

  return (
    <nav aria-label="Navigation principale" className="flex gap-1">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive(link.href) ? "page" : undefined}
          className={cn(
            "rounded-full px-4 py-2 font-bold whitespace-nowrap text-ink-soft transition outline-none hover:bg-accent-soft hover:text-ink focus-visible:shadow-glow",
            isActive(link.href) && "bg-surface text-accent shadow-clay-sm hover:bg-surface hover:text-accent",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
