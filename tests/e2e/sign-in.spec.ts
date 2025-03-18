import { test, expect, type Page } from "@playwright/test";
import { CustomSignIn } from "../../src/myworkdayjobs/CustomSignIn";
import * as fs from "fs";
import * as path from "path";

test.describe("Sign In Tests", () => {
  // Load mock HTML content
  const mockHtmlPath = path.join(
    __dirname,
    "../../src/__tests__/__mocks__/workday-signin-page.html"
  );
  const mockHtml = fs.readFileSync(mockHtmlPath, "utf8");

  test.describe("Mock Environment Tests", () => {
    test.beforeEach(async ({ page }) => {
      // Set up the mock environment
      await page.setContent(mockHtml);
    });

    test("should handle sign in flow", async ({ page }) => {
      // Click the sign in link to switch to sign in mode
      await page.click('[data-automation-id="signInLink"]');

      // Verify we're in sign in mode
      await expect(page.locator("#authViewTitle")).toHaveText("Sign In");

      // Fill in credentials
      await page.fill('[data-automation-id="email"]', "testuser");
      await page.fill('[data-automation-id="password"]', "testpass123");

      // Submit the form
      await page.click('[data-automation-id="createAccountSubmitButton"]');

      // Verify success message
      await expect(
        page.locator('[data-automation-id="message-success"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-automation-id="message-success"]')
      ).toHaveText("Sign in successful");
    });

    test("should handle account creation flow", async ({ page }) => {
      // Fill in account creation form
      await page.fill('[data-automation-id="email"]', "newuser@example.com");
      await page.fill('[data-automation-id="password"]', "Password123");
      await page.fill('[data-automation-id="verifyPassword"]', "Password123");
      await page.check('[data-automation-id="createAccountCheckbox"]');

      // Submit the form
      await page.click('[data-automation-id="createAccountSubmitButton"]');

      // Verify success message
      await expect(
        page.locator('[data-automation-id="message-success"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-automation-id="message-success"]')
      ).toHaveText("Account created successfully");
    });

    test("should handle invalid credentials", async ({ page }) => {
      // Click the sign in link to switch to sign in mode
      await page.click('[data-automation-id="signInLink"]');

      // Fill in invalid credentials
      await page.fill('[data-automation-id="email"]', "wrong@example.com");
      await page.fill('[data-automation-id="password"]', "wrongpass");

      // Submit the form
      await page.click('[data-automation-id="createAccountSubmitButton"]');

      // Verify error message
      await expect(
        page.locator('[data-automation-id="message-error"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-automation-id="message-error"]')
      ).toHaveText("Invalid credentials");
    });

    test("should handle password mismatch in account creation", async ({
      page,
    }) => {
      // Fill in account creation form with mismatched passwords
      await page.fill('[data-automation-id="email"]', "newuser@example.com");
      await page.fill('[data-automation-id="password"]', "Password123");
      await page.fill(
        '[data-automation-id="verifyPassword"]',
        "DifferentPass123"
      );
      await page.check('[data-automation-id="createAccountCheckbox"]');

      // Submit the form
      await page.click('[data-automation-id="createAccountSubmitButton"]');

      // Verify error message
      await expect(
        page.locator('[data-automation-id="message-error"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-automation-id="message-error"]')
      ).toHaveText("Passwords do not match");
    });

    test("should handle forgot password flow", async ({ page }) => {
      // Click forgot password link
      await page.click('[data-automation-id="forgotPasswordLink"]');

      // Verify message about empty email
      await expect(
        page.locator('[data-automation-id="message-error"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-automation-id="message-error"]')
      ).toHaveText("Please enter your email address");

      // Fill in email and try again
      await page.fill('[data-automation-id="email"]', "user@example.com");
      await page.click('[data-automation-id="forgotPasswordLink"]');

      // Verify success message
      await expect(
        page.locator('[data-automation-id="message-success"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-automation-id="message-success"]')
      ).toHaveText("Password reset instructions have been sent to your email");
    });
  });

  // Only run live site tests if LIVE_TESTS environment variable is set
  test.describe.skip("Live Site Tests", () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to the job application page
      await page.goto(
        "https://cba.wd3.myworkdayjobs.com/en-US/CommBank_Careers/job/Sydney-CBD-Area/Director-AI-Risk_REQ231240/apply/applyManually"
      );
      // Wait for the sign-in form to be visible
      await page.waitForSelector('[data-automation-id="signInFormo"]');
    });

    test("should handle sign in on live site", async ({ page }) => {
      // Click the sign in link
      await page.click('[data-automation-id="signInLink"]');

      // Fill in credentials (use environment variables in real tests)
      await page.fill(
        '[data-automation-id="email"]',
        process.env.TEST_EMAIL || "test@example.com"
      );
      await page.fill(
        '[data-automation-id="password"]',
        process.env.TEST_PASSWORD || "testpass"
      );

      // Submit the form
      await page.click('[data-automation-id="createAccountSubmitButton"]');

      // Verify we're logged in by checking for the next step
      await expect(
        page.locator('[data-automation-id="progressBarActiveStep"]')
      ).toContainText("My Information");
    });
  });
});
