import { useId } from "react";
import { cn } from "@/lib/utils";

// Logo de Roadmap, « l'escalier bonbon » : trois marches arrondies qui montent
// (comme une progression) et une bille qui saute vers la dernière.
// Les couleurs viennent des tokens du design system (classes fill-*).
export function Logo({ className, title }: { className?: string; title?: string }) {
  // Identifiant unique du reflet : la page peut afficher le logo plusieurs fois.
  const shineId = useId();
  const shine = `url(#${shineId})`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        {/* Reflet clair en haut à gauche : l'effet « pâte à modeler » */}
        <radialGradient id={shineId} cx="0.32" cy="0.3" r="0.6">
          <stop offset="0" stopColor="white" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="2" y="2" width="60" height="60" rx="20" className="fill-accent" />

      {/* Les trois marches */}
      <rect x="11" y="38" width="13" height="15" rx="6.5" className="fill-module-rose" />
      <rect x="25.5" y="28" width="13" height="25" rx="6.5" className="fill-module-beurre" />
      <rect x="40" y="18" width="13" height="35" rx="6.5" className="fill-module-menthe" />
      <rect x="11" y="38" width="13" height="15" rx="6.5" fill={shine} />
      <rect x="25.5" y="28" width="13" height="25" rx="6.5" fill={shine} />
      <rect x="40" y="18" width="13" height="35" rx="6.5" fill={shine} />

      {/* La trajectoire en pointillés et la bille qui saute */}
      <path
        d="M17.5 30 Q 24 20 32 21"
        fill="none"
        className="stroke-surface"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="0.1 4.5"
      />
      <circle cx="46.5" cy="11" r="5" className="fill-surface" />
      <circle cx="46.5" cy="11" r="5" className="fill-aurora-middle" opacity="0.5" />
    </svg>
  );
}
