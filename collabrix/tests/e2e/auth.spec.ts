import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("landing page loads correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("link", { name: /get started/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("h1")).toBeVisible();
  });

  test("register new user", async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@test.com`;

    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page.locator('input[type="text"]').first().fill("E2E Test User");
    await page.locator('input[type="email"]').fill(uniqueEmail);
    await page.locator('input[type="password"]').fill("password123");

    await page.getByRole("button", { name: /create account/i }).click();

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    expect(page.url()).toContain("dashboard");
  });

  test("login with existing user", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.locator('input[type="email"]').fill("alice@collabrix.dev");
    await page.locator('input[type="password"]').fill("password123");

    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    expect(page.url()).toContain("dashboard");
  });

  test("login with wrong password stays on login", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.locator('input[type="email"]').fill("admin@collabrix.dev");
    await page.locator('input[type="password"]').fill("wrongpassword");

    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForTimeout(3000);

    expect(page.url()).toContain("login");
  });

  test("protected routes redirect to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login**", { timeout: 10000 });
    expect(page.url()).toContain("login");
  });

  test("register with existing email shows error", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page.locator('input[type="text"]').first().fill("Duplicate");
    await page.locator('input[type="email"]').fill("admin@collabrix.dev");
    await page.locator('input[type="password"]').fill("password123");

    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForTimeout(3000);

    expect(page.url()).toContain("register");
  });
});
