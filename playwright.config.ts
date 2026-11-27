import { defineConfig, devices } from "@playwright/test";

// Charge les variables de .env (E2E_EMAIL, E2E_PASSWORD, Supabase…) dans process.env.
// Ce fichier n'est jamais commité : les identifiants restent hors du code.
// Attention : .env doit pointer vers la base de PRÉPROD, jamais vers la prod.
try {
  process.loadEnvFile(".env");
} catch {
  // Pas de .env (ex. sur une autre machine) : les tests qui en ont besoin le signaleront.
}

// Configuration des tests de bout en bout (E2E) avec Playwright.
export default defineConfig({
  // Les tests sont rangés dans le dossier e2e/.
  testDir: "./e2e",
  // Un test qui dépasse 60 secondes est considéré comme échoué
  // (le premier affichage d'une page en dev peut être lent, le temps de compiler).
  timeout: 60_000,
  // Liste lisible des résultats dans le terminal.
  reporter: "list",
  use: {
    // Adresse de l'app : page.goto("/") ouvre http://localhost:3000/.
    baseURL: "http://localhost:3000",
    // Garde une trace (captures, réseau) seulement quand un test échoue, pour comprendre pourquoi.
    trace: "retain-on-failure",
  },
  // On teste dans Chromium (le moteur de Chrome).
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Lance le serveur de dev tout seul avant les tests, et l'arrête à la fin.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/login",
    // Si le serveur tourne déjà (npm run dev dans un terminal), on le réutilise.
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
