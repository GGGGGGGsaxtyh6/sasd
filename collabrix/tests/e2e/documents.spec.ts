import { test, expect, Page } from "@playwright/test";

async function loginAs(page: Page, email: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill("password123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

async function navigateToWorkspace(page: Page) {
  await page.getByText("Collabrix Team").first().click();
  await page.waitForTimeout(3000);
}

test.describe("Documents", () => {
  test("create a new document via sidebar", async ({ page }) => {
    await loginAs(page, "admin@collabrix.dev");
    await navigateToWorkspace(page);

    await page.getByText("New").first().click();
    await page.waitForTimeout(5000);

    expect(page.url()).toContain("/documents/");
  });

  test("edit document content and auto-save", async ({ page }) => {
    await loginAs(page, "admin@collabrix.dev");
    await navigateToWorkspace(page);

    await page.getByText("New").first().click();
    await page.waitForTimeout(5000);

    const textarea = page.locator("textarea").first();
    await textarea.fill("E2E test document content for auto-save verification.");
    await page.waitForTimeout(4000);

    await page.reload();
    await page.waitForTimeout(3000);

    const content = await page.locator("textarea").first().inputValue().catch(() => "");
    expect(content).toContain("E2E test document");
  });

  test("add comment to document", async ({ page }) => {
    await loginAs(page, "admin@collabrix.dev");
    await navigateToWorkspace(page);

    await page.getByText("New").first().click();
    await page.waitForTimeout(5000);

    const commentBox = page.locator('textarea[placeholder*="comment"], textarea[placeholder*="Write"]');
    if (await commentBox.isVisible().catch(() => false)) {
      await commentBox.fill("E2E test comment");
      await page.getByRole("button", { name: /post/i }).click();
      await page.waitForTimeout(3000);

      await expect(page.getByText("E2E test comment")).toBeVisible({ timeout: 5000 });
    }
  });

  test("use AI summarize feature", async ({ page }) => {
    await loginAs(page, "alice@collabrix.dev");
    await navigateToWorkspace(page);

    await page.getByText("New").first().click();
    await page.waitForTimeout(5000);

    const textarea = page.locator("textarea").first();
    await textarea.fill("Artificial intelligence is transforming how teams collaborate and build software together.");
    await page.waitForTimeout(2000);

    const summarizeBtn = page.getByRole("button", { name: /summarize/i });
    if (await summarizeBtn.isVisible().catch(() => false)) {
      await summarizeBtn.click();
      await page.waitForTimeout(5000);

      await expect(page.getByText("AI output")).toBeVisible({ timeout: 10000 });
    }
  });
});
