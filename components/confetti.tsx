// Composant client : il écoute l'événement « confettis » du navigateur
// et affiche des morceaux de couleur qui tombent pendant quelques secondes.
"use client";

import { useEffect, useRef, useState } from "react";
import { celebrate, CONFETTI_EVENT } from "@/lib/celebrate";

// Couleurs du design system (modules et aurora)
const COLORS = [
  "var(--color-module-lilas)",
  "var(--color-module-menthe)",
  "var(--color-module-peche)",
  "var(--color-module-beurre)",
  "var(--color-module-ciel)",
  "var(--color-module-rose)",
  "var(--color-aurora-middle)",
  "var(--color-accent)",
];

type Piece = { id: number; left: number; drift: number; spin: number; delay: number; color: string; round: boolean };

function makePieces(): Piece[] {
  return Array.from({ length: 70 }, (_, index) => ({
    id: index,
    left: Math.random() * 100,
    drift: (Math.random() - 0.5) * 240,
    spin: (Math.random() - 0.5) * 1080,
    delay: Math.random() * 0.4,
    color: COLORS[index % COLORS.length],
    round: Math.random() > 0.5,
  }));
}

export function Confetti() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function launch() {
      // Réglage « réduire les animations » : pas de confettis.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setPieces(makePieces());
      clearTimeout(timer);
      timer = setTimeout(() => setPieces([]), 3200);
    }
    window.addEventListener(CONFETTI_EVENT, launch);
    return () => {
      window.removeEventListener(CONFETTI_EVENT, launch);
      clearTimeout(timer);
    };
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={piece.round ? "absolute top-0 size-2.5 animate-confetti rounded-full" : "absolute top-0 h-3.5 w-2 animate-confetti"}
          // Position, couleur et trajectoire tirées au hasard : valeurs dynamiques (style inline autorisé)
          style={
            {
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              "--drift": `${piece.drift}px`,
              "--spin": `${piece.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

// Lance les confettis quand la feature affichée passe à « Terminé »
// (après un clic sur le statut ou un enregistrement du formulaire).
export function CelebrateWhenDone({ status }: { status: string }) {
  // useRef retient le statut précédent sans provoquer de nouvel affichage.
  const previous = useRef(status);

  useEffect(() => {
    if (previous.current !== "done" && status === "done") celebrate();
    previous.current = status;
  }, [status]);

  return null;
}
