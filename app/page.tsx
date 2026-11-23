// Page de test temporaire : elle affiche les tokens du design system
// (app/globals.css) pour vérifier qu'ils fonctionnent. Elle sera remplacée
// par le vrai Backlog.

// Les classes Tailwind sont écrites en entier (ex. "bg-accent") :
// Tailwind ne repère que les noms complets présents dans le code.
const colorGroups = [
  {
    title: "Fonds et texte",
    colors: [
      { name: "background", value: "#F4F1FF", className: "bg-background" },
      { name: "surface", value: "#FFFFFF", className: "bg-surface" },
      { name: "surface-sunken", value: "#ECE8FB", className: "bg-surface-sunken" },
      { name: "border", value: "#E3DEF7", className: "bg-border" },
      { name: "ink", value: "#1F1A3D", className: "bg-ink" },
      { name: "ink-soft", value: "#5B557A", className: "bg-ink-soft" },
      { name: "ink-muted", value: "#8A84A8", className: "bg-ink-muted" },
    ],
  },
  {
    title: "Accent et sémantique",
    colors: [
      { name: "accent", value: "#6C5CF5", className: "bg-accent" },
      { name: "accent-hover", value: "#5E4DEB", className: "bg-accent-hover" },
      { name: "accent-edge", value: "#4A3BC9", className: "bg-accent-edge" },
      { name: "accent-soft", value: "#E9E5FF", className: "bg-accent-soft" },
      { name: "aurora", value: "dégradé", className: "bg-aurora" },
      { name: "danger", value: "#D92D55", className: "bg-danger" },
      { name: "danger-soft", value: "#FFE4EA", className: "bg-danger-soft" },
    ],
  },
  {
    title: "Modules",
    colors: [
      { name: "module-lilas", value: "#B9A8FF", className: "bg-module-lilas" },
      { name: "module-menthe", value: "#8FE3C0", className: "bg-module-menthe" },
      { name: "module-peche", value: "#FFC29E", className: "bg-module-peche" },
      { name: "module-beurre", value: "#FFE07A", className: "bg-module-beurre" },
      { name: "module-ciel", value: "#9CD3FF", className: "bg-module-ciel" },
      { name: "module-rose", value: "#FFA8C5", className: "bg-module-rose" },
      { name: "module-sauge", value: "#B5D99C", className: "bg-module-sauge" },
      { name: "module-corail", value: "#FF9C8A", className: "bg-module-corail" },
    ],
  },
];

const featureStatuses = [
  { label: "Backlog", className: "bg-status-backlog-soft text-status-backlog" },
  { label: "À faire", className: "bg-status-todo-soft text-status-todo" },
  { label: "En cours", className: "bg-status-in-progress-soft text-status-in-progress", pulse: true },
  { label: "Terminé", className: "bg-status-done-soft text-status-done" },
  { label: "Annulé", className: "bg-status-cancelled-soft text-status-cancelled" },
];

const sprintStatuses = [
  { label: "Planifié", className: "bg-sprint-planned-soft text-sprint-planned" },
  { label: "Actif", className: "bg-sprint-active-soft text-sprint-active", pulse: true },
  { label: "Terminé", className: "bg-sprint-completed-soft text-sprint-completed" },
];

// filledBars : nombre de barres pleines sur 4 (0 = « Bonus », affiché avec une étincelle)
const priorities = [
  { label: "Critique", filledBars: 4, className: "bg-priority-critical-soft text-priority-critical shadow-critical" },
  { label: "Haute", filledBars: 3, className: "bg-priority-high-soft text-priority-high" },
  { label: "Moyenne", filledBars: 2, className: "bg-priority-medium-soft text-priority-medium" },
  { label: "Basse", filledBars: 1, className: "bg-priority-low-soft text-priority-low" },
  { label: "Bonus", filledBars: 0, className: "bg-priority-nice-to-have-soft text-priority-nice-to-have" },
];

const typeScale = [
  { name: "display", className: "font-title text-display", sample: "Roadmap" },
  { name: "h1", className: "font-title text-h1", sample: "Backlog" },
  { name: "h2", className: "font-title text-h2", sample: "Checklist de démarrage guidée" },
  { name: "h3", className: "font-title text-h3", sample: "Commentaires" },
  { name: "body-lg", className: "text-body-lg", sample: "Réduire l'abandon pendant l'onboarding." },
  { name: "body", className: "text-body", sample: "Texte courant, commentaires et descriptions." },
  { name: "small", className: "text-small", sample: "Métadonnées et badges" },
  { name: "label", className: "text-label uppercase text-ink-soft", sample: "Libellé de champ" },
  { name: "data-xl", className: "font-data text-data-xl", sample: "12" },
  { name: "data", className: "font-data text-data", sample: "16 nov. → 27 nov. 2026" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 font-title text-h2">{children}</h2>;
}

export default function TokensTestPage() {
  return (
    <main className="mx-auto flex w-full max-w-page flex-col gap-12 px-8 py-10">
      <header>
        <h1 className="font-title text-display">Design system</h1>
        <p className="text-body-lg text-ink-soft">
          Page de test des tokens de app/globals.css.
        </p>
      </header>

      {/* Couleurs */}
      <section>
        <SectionTitle>Couleurs</SectionTitle>
        <div className="flex flex-col gap-8">
          {colorGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 font-title text-h3">{group.title}</h3>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
                {group.colors.map((color) => (
                  <li key={color.name} className="flex flex-col gap-2">
                    <span className={`h-16 rounded-lg shadow-clay-sm ${color.className}`} />
                    <span className="text-small">{color.name}</span>
                    <span className="font-data text-data text-ink-soft">{color.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Typographie */}
      <section>
        <SectionTitle>Typographie</SectionTitle>
        <div className="flex flex-col gap-4 rounded-xl bg-surface p-8 shadow-clay">
          {typeScale.map((type) => (
            <div key={type.name} className="flex items-baseline gap-6">
              <span className="w-20 shrink-0 font-data text-data text-ink-soft">{type.name}</span>
              <span className={type.className}>{type.sample}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Boutons */}
      <section>
        <SectionTitle>Boutons</SectionTitle>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-md bg-accent px-5 font-extrabold text-on-accent shadow-edge-accent transition duration-150 ease-bounce hover:-translate-y-px hover:bg-accent-hover hover:shadow-edge-accent-hover focus-visible:shadow-glow focus-visible:outline-none active:translate-y-0.75 active:shadow-edge-accent-pressed"
          >
            Enregistrer
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-md border border-border bg-surface px-5 font-bold text-accent shadow-clay-sm transition duration-150 ease-bounce hover:-translate-y-px hover:shadow-clay-hover focus-visible:shadow-glow focus-visible:outline-none"
          >
            Modifier
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-md px-5 font-bold text-ink-soft transition duration-150 hover:bg-accent-soft hover:text-ink focus-visible:shadow-glow focus-visible:outline-none"
          >
            Annuler
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-md bg-danger px-5 font-extrabold text-on-accent shadow-edge-danger transition duration-150 ease-bounce focus-visible:shadow-glow focus-visible:outline-none active:translate-y-0.75 active:shadow-edge-danger-pressed"
          >
            Supprimer
          </button>
          <button
            type="button"
            aria-label="Nouvelle feature"
            className="inline-flex size-15 items-center justify-center rounded-full bg-aurora text-h2 font-extrabold text-on-accent shadow-edge-accent transition duration-150 ease-bounce hover:-translate-y-0.5 focus-visible:shadow-glow focus-visible:outline-none active:translate-y-0.75 active:shadow-edge-accent-pressed"
          >
            +
          </button>
        </div>
      </section>

      {/* Badges */}
      <section>
        <SectionTitle>Badges</SectionTitle>
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="mb-3 text-label uppercase text-ink-soft">Statuts de feature</h3>
            <div className="flex flex-wrap gap-2">
              {featureStatuses.map((status) => (
                <span
                  key={status.label}
                  className={`inline-flex h-6.5 items-center gap-1.5 rounded-full px-2.5 text-small leading-none ${status.className}`}
                >
                  <span
                    className={`size-2 rounded-full bg-current shadow-dot ${status.pulse ? "animate-pulse-dot" : ""}`}
                  />
                  {status.label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-label uppercase text-ink-soft">Statuts de sprint</h3>
            <div className="flex flex-wrap items-center gap-2">
              {sprintStatuses.map((status) => (
                <span
                  key={status.label}
                  className={`inline-flex h-6.5 items-center gap-1.5 rounded-full px-2.5 text-small leading-none ${status.className}`}
                >
                  <span
                    className={`size-2 rounded-full bg-current shadow-dot ${status.pulse ? "animate-pulse-dot" : ""}`}
                  />
                  {status.label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-label uppercase text-ink-soft">Priorités</h3>
            <div className="flex flex-wrap gap-2">
              {priorities.map((priority) => (
                <span
                  key={priority.label}
                  className={`inline-flex h-6.5 items-center gap-1.5 rounded-sm px-2 text-small leading-none ${priority.className}`}
                >
                  {priority.filledBars === 0 ? (
                    <span aria-hidden="true">✦</span>
                  ) : (
                    <span aria-hidden="true" className="flex h-2.5 items-end gap-0.5">
                      {[1, 2, 3, 4].map((bar) => (
                        <span
                          key={bar}
                          className={`h-2.5 w-0.75 rounded-full bg-current ${bar <= priority.filledBars ? "" : "opacity-25"}`}
                        />
                      ))}
                    </span>
                  )}
                  {priority.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Carte */}
      <section>
        <SectionTitle>Carte</SectionTitle>
        <article className="relative flex max-w-sm flex-col gap-4 overflow-hidden rounded-xl bg-surface p-6 shadow-clay transition duration-150 ease-bounce hover:-translate-y-0.5 hover:shadow-clay-hover">
          <span className="absolute inset-x-0 top-0 h-1.5 bg-aurora" />
          <div className="flex items-center justify-between">
            <h3 className="font-title text-h3">Sprint 2</h3>
            <span className="rounded-full bg-aurora p-0.5">
              <span className="inline-flex h-5.5 items-center gap-1.5 rounded-full bg-sprint-active-soft px-2.5 text-small leading-none text-sprint-active">
                <span className="size-2 animate-pulse-dot rounded-full bg-current shadow-dot" />
                Actif
              </span>
            </span>
          </div>
          <p className="text-body-lg">Réduire l&apos;abandon pendant l&apos;onboarding.</p>
          <p className="font-data text-data text-ink-soft">16 nov. → 27 nov. 2026</p>
          <div className="flex items-baseline gap-2">
            <span className="font-data text-data-xl">5</span>
            <span className="text-label uppercase text-ink-soft">features</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="h-3 flex-1 overflow-hidden rounded-full bg-surface-sunken shadow-sunken"
              role="progressbar"
              aria-valuenow={1}
              aria-valuemin={0}
              aria-valuemax={5}
              aria-label="Features terminées"
            >
              <div className="h-full w-1/5 rounded-full bg-aurora" />
            </div>
            <span className="font-data text-data">1 / 5</span>
          </div>
        </article>
      </section>
    </main>
  );
}
