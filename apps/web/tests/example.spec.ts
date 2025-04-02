import { test, expect } from "@playwright/test";

test("homepage loads successfully", async ({ page }) => {
  await page.goto("/");

  // Verify the page loaded
  await expect(page).toHaveURL("/");

  // Check that the page has content (replace with actual elements from your application)
  await expect(page.locator("body")).not.toBeEmpty();
});

test("navigation works", async ({ page }) => {
  // Start at the homepage
  await page.goto("/");

  // Check for navigation elements and click one if available
  // Note: Update these selectors based on your actual application structure
  const navLinks = page.getByRole("link");
  if ((await navLinks.count()) > 0) {
    // Click the first link and verify navigation
    await navLinks.first().click();

    // Verify URL changed
    await expect(page).not.toHaveURL("/");
  } else {
    // Skip this test if no navigation links are found
    test.skip();
  }
});
