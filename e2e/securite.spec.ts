import { test, expect } from "@playwright/test";

// Garde de sécurité : un visiteur non connecté ne peut ouvrir aucune page réservée.
// Chaque test démarre avec un navigateur neuf, donc sans cookie de session.
test("un visiteur non connecté est renvoyé vers /login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/login");
  await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();

  await page.goto("/sprints");
  await expect(page).toHaveURL("/login");
  await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
});
