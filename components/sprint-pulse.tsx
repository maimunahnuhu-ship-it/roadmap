// Composant client : le compte à rebours, la barre du temps écoulé et le message
// d'encouragement dépendent de l'heure actuelle, qui change chaque seconde.
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type SprintPulseProps = {
  startDate: string; // "2026-11-16"
  endDate: string;
  done: number;
  total: number;
};

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Le sprint commence au début de start_date et finit à la fin de end_date (heure locale).
function sprintBounds(startDate: string, endDate: string) {
  return {
    start: new Date(`${startDate}T00:00:00`).getTime(),
    end: new Date(`${endDate}T23:59:59`).getTime(),
  };
}

// Message selon le rythme : on compare la part de features terminées
// à la part du temps écoulé.
function paceMessage(done: number, total: number, timeRatio: number) {
  const remaining = total - done;
  const features = `${remaining} feature${remaining > 1 ? "s" : ""}`;
  if (total === 0) return { tone: "calm", text: "Ajoute des features à ce sprint pour lancer la course !" };
  if (remaining === 0) return { tone: "ahead", text: "Tout est terminé, bravo l'équipe ! ✦" };

  const progressRatio = done / total;
  if (progressRatio >= timeRatio + 0.1) return { tone: "ahead", text: `En avance ! Encore ${features} et c'est gagné !` };
  if (progressRatio >= timeRatio - 0.1) return { tone: "calm", text: `Dans les temps : encore ${features} et c'est gagné !` };
  return { tone: "late", text: `Un peu en retard : ${features} à boucler, on accélère ?` };
}

const TONE_CLASSES: Record<string, string> = {
  ahead: "bg-status-done-soft text-status-done",
  calm: "bg-status-todo-soft text-status-todo",
  late: "bg-status-in-progress-soft text-status-in-progress",
};

export function SprintPulse({ startDate, endDate, done, total }: SprintPulseProps) {
  // null tant que la page n'est pas affichée dans le navigateur : le serveur
  // et le navigateur n'ont pas la même heure, on attend donc d'être côté client.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const { start, end } = sprintBounds(startDate, endDate);
  const elapsed = now === null ? 0 : Math.min(Math.max(now - start, 0), end - start);
  const timeRatio = end > start ? elapsed / (end - start) : 1;
  const left = now === null ? 0 : Math.max(end - now, 0);
  const overdue = now !== null && now > end;
  const daysOver = overdue ? Math.floor((now - end) / DAY) + 1 : 0;
  const message = paceMessage(done, total, timeRatio);
  const progressPercent = total === 0 ? 0 : Math.round((done / total) * 100);

  const units = [
    { label: "jours", value: Math.floor(left / DAY) },
    { label: "heures", value: Math.floor((left % DAY) / HOUR) },
    { label: "min", value: Math.floor((left % HOUR) / MINUTE) },
    { label: "s", value: Math.floor((left % MINUTE) / 1000) },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Compte à rebours, ou sprint dépassé */}
      {overdue ? (
        <p className="inline-flex items-center gap-2 self-start rounded-full bg-danger-soft px-4 py-2 font-bold text-danger">
          Sprint terminé depuis {daysOver} jour{daysOver > 1 ? "s" : ""}
          {total - done > 0 && ` · ${total - done} feature${total - done > 1 ? "s" : ""} pas terminée${total - done > 1 ? "s" : ""}`}
        </p>
      ) : (
        <div role="timer" aria-label="Temps restant avant la fin du sprint" className="flex flex-wrap gap-3">
          {units.map((unit) => (
            <div
              key={unit.label}
              className="flex min-w-18 flex-col items-center rounded-lg bg-surface-sunken px-3 py-2 shadow-sunken"
            >
              {/* key = valeur : le chiffre « tombe » à chaque changement */}
              <span key={unit.value} className="font-data text-h1 tabular-nums animate-in fade-in-0 slide-in-from-top-1">
                {now === null ? "–" : String(unit.value).padStart(2, "0")}
              </span>
              <span className="text-label uppercase text-ink-soft">{unit.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Les deux barres : temps écoulé et avancement */}
      <div className="grid gap-4 md:grid-cols-2">
        <Bar label="Temps écoulé" percent={Math.round(timeRatio * 100)} tone="time" />
        <Bar label={`Avancement · ${done} / ${total} terminées`} percent={progressPercent} tone="progress" />
      </div>

      {now !== null && (
        <p className={cn("self-start rounded-full px-4 py-2 font-bold", TONE_CLASSES[message.tone])}>{message.text}</p>
      )}
    </div>
  );
}

function Bar({ label, percent, tone }: { label: string; percent: number; tone: "time" | "progress" }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-small">
        <span>{label}</span>
        <span className="font-data text-data">{percent} %</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-3 overflow-hidden rounded-full bg-surface-sunken shadow-sunken"
      >
        {/* La largeur dépend des données : style inline autorisé (valeur dynamique) */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-bounce",
            tone === "progress" ? "bg-aurora" : "bg-accent",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
