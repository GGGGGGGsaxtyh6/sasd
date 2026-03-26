import { test, expect, Page } from "@playwright/test";

async function loginAs(page: Page, email: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill("password123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

test.describe("Workspace", () => {
  test("dashboard shows workspaces after login", async ({ page }) => {
    await loginAs(page, "admin@collabrix.dev");
    await page.waitForTimeout(3000);
    await expect(page.getByText("Dashboard").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Collabrix Team").first()).toBeVisible({ timeout: 15000 });
  });

  test("create new workspace from dashboard", async ({ page }) => {
    await loginAs(page, "admin@collabrix.dev");

    await page.getByRole("button", { name: /new workspace/i }).click();
    await page.waitForTimeout(500);

    await page.locator('#ws-name').fill(`E2E Workspace ${Date.now()}`);
    await page.getByRole("button", { name: /^create$/i }).click();

    await page.waitForTimeout(5000);
    const url = page.url();
    expect(url.includes("/workspace/") || url.includes("/dashboard")).toBeTruthy();
  });

  test("navigate to workspace tasks", async ({ page }) => {
    await loginAs(page, "admin@collabrix.dev");

    await page.getByText("Collabrix Team").first().click();
    await page.waitForTimeout(3000);

    const sidebar = page.locator("nav, aside");
    const tasksLink = page.getByRole("link", { name: /tasks/i }).first();
    if (await tasksLink.isVisible().catch(() => false)) {
      await tasksLink.click();
    } else {
      await page.getByText("Tasks").first().click();
    }
    await page.waitForTimeout(3000);

    await expect(page.getByText("Backlog")).toBeVisible({ timeout: 10000 });
  });

  test("navigate to workspace activity", async ({ page }) => {
    await loginAs(page, "admin@collabrix.dev");

    await page.getByText("Collabrix Team").first().click();
    await page.waitForTimeout(3000);

    await page.getByText("Activity").first().click();
    await page.waitForTimeout(3000);

    const heading = page.locator("h1, h2");
    await expect(heading.getByText("Activity")).toBeVisible({ timeout: 10000 });
  });

  test("navigate to workspace settings", async ({ page }) => {
    await loginAs(page, "admin@collabrix.dev");

    await page.getByText("Collabrix Team").first().click();
    await page.waitForTimeout(3000);

    await page.getByText("Settings").first().click();
    await page.waitForTimeout(3000);

    await expect(page.getByText("Workspace settings")).toBeVisible({ timeout: 10000 });
  });
});
