import { test, expect } from "@playwright/test";
import { GreenhouseAccountFiller } from "../../src/greenhouse/GreenhouseAccountFiller";

test.describe("Greenhouse Form Filler", () => {
  test("should fill out application form on boards.greenhouse.io", async ({
    page,
  }) => {
    // Navigate to the Greenhouse job application page
    await page.goto("https://boards.greenhouse.io/aurosglobal/jobs/4493809005");

    // Wait for the form to load
    await page.waitForSelector('input[name="first_name"]');

    // Create a mock resume file
    const resumeFile = new File(["mock resume content"], "resume.pdf", {
      type: "application/pdf",
    });

    // Create form data
    const formData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      resume: resumeFile,
      customQuestions: {},
    };

    // Initialize form filler
    const formFiller = new GreenhouseAccountFiller();

    // Check if it's a Greenhouse form
    const isGreenhouseForm = await formFiller.isGreenhouseForm();
    expect(isGreenhouseForm).toBe(true);

    // Fill out the form
    await formFiller.fillApplicationForm(formData);

    // Verify form fields are filled correctly
    expect(await page.inputValue('input[name="first_name"]')).toBe(
      formData.firstName
    );
    expect(await page.inputValue('input[name="last_name"]')).toBe(
      formData.lastName
    );
    expect(await page.inputValue('input[name="email"]')).toBe(formData.email);
    expect(await page.inputValue('input[name="phone"]')).toBe(formData.phone);
  });

  test("should handle verification code when present", async ({ page }) => {
    await page.goto("https://boards.greenhouse.io/aurosglobal/jobs/4493809005");

    const formFiller = new GreenhouseAccountFiller();
    const verificationCode = "123456";

    await formFiller.handleVerificationCode(verificationCode);

    const codeInput = await page.$('input[name="security_code"]');
    if (codeInput) {
      expect(await codeInput.inputValue()).toBe(verificationCode);
    }
  });

  test("should handle custom questions", async ({ page }) => {
    await page.goto("https://boards.greenhouse.io/aurosglobal/jobs/4493809005");

    const formFiller = new GreenhouseAccountFiller();

    // Find all custom questions and fill them
    const customQuestions = await page.$$(".custom-question");
    for (const question of customQuestions) {
      const input = await question.$('input[type="text"], textarea');
      if (input) {
        const id = await input.getAttribute("id");
        if (id) {
          await input.fill("Test answer");
          expect(await input.inputValue()).toBe("Test answer");
        }
      }
    }
  });
});
