import { test, expect, Page } from "@playwright/test";

async function loginAs(page: Page, email: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill("password123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

async function navigateToTasks(page: Page) {
  await page.getByText("Collabrix Team").first().click();
  await page.waitForTimeout(3000);
  await page.getByText("Tasks").first().click();
  await page.waitForTimeout(3000);
}

test.describe("Tasks", () => {
  test("view kanban board with columns", async ({ page }) => {
    await loginAs(page, "admin@collabrix.dev");
    await navigateToTasks(page);

    await expect(page.getByText("Backlog")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Todo")).toBeVisible();
    await expect(page.getByText("In Progress")).toBeVisible();
    await expect(page.getByText("Done")).toBeVisible();
  });

  test("seeded tasks are visible", async ({ page }) => {
    await loginAs(page, "admin@collabrix.dev");
    await navigateToTasks(page);

    await expect(page.getByText("Set up CI/CD pipeline")).toBeVisible({ timeout: 10000 });
  });

  test("create a new task", async ({ page }) => {
    await loginAs(page, "admin@collabrix.dev");
    await navigateToTasks(page);

    await page.getByRole("button", { name: /new task/i }).click();
    await page.waitForTimeout(1000);

    const titleInput = page.locator("input").first();
    const taskName = `E2E Task ${Date.now()}`;
    await titleInput.fill(taskName);

    const createBtn = page.getByRole("button", { name: "Create", exact: true });
    await createBtn.click();
    await page.waitForTimeout(5000);

    const pageContent = await page.textContent("body") || "";
    expect(pageContent).toContain("E2E Task");
  });

  test("tasks show priority indicators", async ({ page }) => {
    await loginAs(page, "admin@collabrix.dev");
    await navigateToTasks(page);
    await page.waitForTimeout(3000);

    const pageText = await page.textContent("body") || "";
    const hasPriority = pageText.includes("urgent") || pageText.includes("high")
      || pageText.includes("Urgent") || pageText.includes("High");
    expect(hasPriority).toBeTruthy();
  });
});
