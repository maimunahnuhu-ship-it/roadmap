import { test, expect } from "@playwright/test";

// Parcours qui marche : un membre se connecte et voit le Backlog rempli.
// Le compte de test vient de .env (E2E_EMAIL, E2E_PASSWORD), jamais du code.
test("un membre se connecte et voit les features du Backlog", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) throw new Error("Renseigne E2E_EMAIL et E2E_PASSWORD dans .env (compte de PRÉPROD).");

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();

  // Au premier lancement, le serveur de dev compile l'accueil : on lui laisse 45 s au lieu de 5.
  await expect(page).toHaveURL("/", { timeout: 45_000 });
  await expect(page.getByRole("heading", { level: 1, name: "Backlog" })).toBeVisible();
  await expect(page.getByText(/^[1-9]\d* features? trouvées?$/)).toBeVisible();
  await expect(page.getByRole("main").getByRole("listitem").getByRole("link").first()).toBeVisible();
});
