import { test, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * Test suite for the MyWorkdayJobsAccountFiller component
 * Validates the component's ability to fill MyWorkdayJobs.com account forms
 */
test.describe("MyWorkdayJobsAccountFiller Tests", () => {
  // Load MyWorkdayJobsAccountFiller implementation
  const formFillerPath = path.join(
    __dirname,
    "../../src/myworkdayjobs/MyWorkdayJobsAccountFiller.js"
  );
  const formFillerContent = fs.readFileSync(formFillerPath, "utf8");

  // Configuration for different environments
  const environments = {
    mock: {
      name: "Mock Environment",
      setup: async (page: Page) => {
        const mockHtmlPath = path.join(
          __dirname,
          "../../src/__tests__/__mocks__/workday-signin-page.html"
        );
        const mockHtml = fs.readFileSync(mockHtmlPath, "utf8");
        await page.setContent(mockHtml);
      },
    },
    live: {
      name: "Live Environment",
      setup: async (page: Page) => {
        await page.goto(
          "https://cba.wd3.myworkdayjobs.com/en-US/CommBank_Careers/job/Sydney-CBD-Area/Director-AI-Risk_REQ231240/apply/applyManually"
        );

        // Wait for the form to be present
        await page.waitForSelector("form.css-w0sgi8", { timeout: 10000 });

        // Wait for all required input fields
        await Promise.all([
          page.waitForSelector("#input-4"), // Email/username field
          page.waitForSelector("#input-5"), // Password field
          page.waitForSelector("#input-6"), // Verify password field
          page.waitForSelector("#input-8"), // Checkbox
        ]);
      },
    },
  };

  // Test factory function that creates test cases for each environment
  const createTestSuite = (
    environment: typeof environments.mock | typeof environments.live
  ) => {
    test.describe(environment.name, () => {
      test.beforeEach(async ({ page }) => {
        // Set up the environment
        await environment.setup(page);

        // Inject the MyWorkdayJobsAccountFiller class and create instance
        await page.addScriptTag({
          content: `${formFillerContent}
                   window.formFiller = new MyWorkdayJobsAccountFiller();`,
        });
      });

      /**
       * Validates filling the sign-in form fields on MyWorkdayJobs.com
       */
      test("should fill sign-in form fields", async ({ page }) => {
        // Fill sign-in form fields
        await page.evaluate(async () => {
          await window.formFiller.fillSignInFields({
            username: "testuser",
            password: "testpass123",
          });
        });

        // Verify fields were filled
        const username = await page.$eval(
          "#input-4",
          (el) => (el as HTMLInputElement).value
        );
        const password = await page.$eval(
          "#input-5",
          (el) => (el as HTMLInputElement).value
        );

        expect(username).toBe("testuser");
        expect(password).toBe("testpass123");
      });

      /**
       * Validates filling the account creation form fields on MyWorkdayJobs.com
       */
      test("should fill account creation form fields", async ({ page }) => {
        // Fill account creation form fields
        await page.evaluate(async () => {
          await window.formFiller.fillAccountCreationFields({
            email: "newuser@example.com",
            password: "Password123",
            verifyPassword: "Password123",
            acceptTerms: true,
          });
        });

        // Verify fields were filled
        const email = await page.$eval(
          "#input-4",
          (el) => (el as HTMLInputElement).value
        );
        const password = await page.$eval(
          "#input-5",
          (el) => (el as HTMLInputElement).value
        );
        const verifyPassword = await page.$eval(
          "#input-6",
          (el) => (el as HTMLInputElement).value
        );
        const checkbox = await page.$eval(
          "#input-8",
          (el) => (el as HTMLInputElement).checked
        );

        expect(email).toBe("newuser@example.com");
        expect(password).toBe("Password123");
        expect(verifyPassword).toBe("Password123");
        expect(checkbox).toBe(true);
      });

      /**
       * Validates the form mode switching on MyWorkdayJobs.com
       */
      test("should switch between form modes", async ({ page }) => {
        // Get initial form mode
        const initialMode = await page.evaluate(async () => {
          return await window.formFiller.getCurrentMode();
        });
        expect(initialMode).toBe("createAccount");

        // Switch to sign-in mode
        await page.evaluate(async () => {
          await window.formFiller.switchMode("signIn");
        });

        // Verify mode switched
        const newMode = await page.evaluate(async () => {
          return await window.formFiller.getCurrentMode();
        });
        expect(newMode).toBe("signIn");

        // Verify field visibility changed appropriately
        const verifyPasswordVisible = await page.$eval(
          "#input-6",
          (el) => window.getComputedStyle(el).display !== "none"
        );
        const checkboxVisible = await page.$eval(
          "#input-8",
          (el) => window.getComputedStyle(el).display !== "none"
        );

        expect(verifyPasswordVisible).toBe(false);
        expect(checkboxVisible).toBe(false);
      });
    });
  };

  // Create test suites for both environments
  createTestSuite(environments.mock);
  createTestSuite(environments.live);
});

// Add type declarations for window extensions
declare global {
  interface Window {
    formFiller: {
      fillSignInFields(data: {
        username: string;
        password: string;
      }): Promise<void>;
      fillAccountCreationFields(data: {
        email: string;
        password: string;
        verifyPassword: string;
        acceptTerms: boolean;
      }): Promise<void>;
      switchMode(mode: "signIn" | "createAccount"): Promise<void>;
      getCurrentMode(): Promise<"signIn" | "createAccount">;
    };
  }
}
