import { expect, test } from "@playwright/test";

test("registro y dashboard", async ({ page }) => {
  const email = `pw-${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Nombre").fill("Playwright Demo");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("Admin123456!");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.waitForLoadState("networkidle");
  const onboardingHeading = page.getByRole("heading", { name: "Crea tu primer workspace" });
  const openWorkspaceLink = page.getByRole("link", { name: "Abrir" });
  const isOnboarding = await onboardingHeading.isVisible().catch(() => false);
  if (isOnboarding) {
    await expect(onboardingHeading).toBeVisible();
  } else {
    await expect(openWorkspaceLink).toBeVisible();
  }
});

test("login y vistas del workspace demo", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("Admin123456!");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.goto("/workspaces/ws_40afde12e7f34356a7ff");
  await expect(page.getByRole("heading", { name: "Nebula Studio" })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText("Actividad reciente")).toBeVisible();

  await page.goto("/workspaces/ws_40afde12e7f34356a7ff/tasks");
  await expect(page.getByText("Tareas y proyectos")).toBeVisible();

  await page.goto("/workspaces/ws_40afde12e7f34356a7ff/search?q=Estrategia");
  await expect(page.getByText("Explora el contexto del workspace")).toBeVisible();
});
