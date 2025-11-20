// Run with:
// PLAYWRIGHT_BASE_URL=https://<preview-or-local-url> npm run test:ios

import { test, expect } from "@playwright/test";

test.describe("iOS WebKit smoke", () => {
  test("renders app shell and avoids blank screen", async ({ page }) => {
    const errors: Error[] = [];

    page.on("pageerror", (error) => {
      errors.push(error);
    });

    await page.goto("/");

    const appShell = page.locator('[data-test="app-shell"]');
    await expect(appShell).toBeVisible();

    const bodyContent = (await page.textContent("body"))?.trim() || "";
    expect(bodyContent.length).toBeGreaterThan(0);

    expect(errors).toHaveLength(0);
  });
});
