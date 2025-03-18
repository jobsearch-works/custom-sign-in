/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { CustomSignIn } from "../myworkdayjobs/CustomSignIn";
import * as fs from "fs";
import * as path from "path";

describe("Sign In Form", () => {
  let documentBody: Document;
  let signIn: CustomSignIn;

  beforeEach(() => {
    // Load the mock HTML file
    const mockHtmlPath = path.join(
      __dirname,
      "__mocks__/workday-signin-page.html"
    );
    const mockHtml = fs.readFileSync(mockHtmlPath, "utf8");
    document.documentElement.innerHTML = mockHtml;
    documentBody = document;
    signIn = new CustomSignIn();

    // Add form submission handler
    const form = documentBody.querySelector(
      '[data-automation-id="signInFormo"]'
    ) as HTMLFormElement;
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const emailInput = documentBody.querySelector(
          '[data-automation-id="email"]'
        ) as HTMLInputElement;
        const passwordInput = documentBody.querySelector(
          '[data-automation-id="password"]'
        ) as HTMLInputElement;
        const verifyPasswordInput = documentBody.querySelector(
          '[data-automation-id="verifyPassword"]'
        ) as HTMLInputElement;
        const privacyCheckbox = documentBody.querySelector(
          '[data-automation-id="createAccountCheckbox"]'
        ) as HTMLInputElement;

        try {
          const result = await signIn.signIn(
            emailInput.value,
            passwordInput.value,
            verifyPasswordInput?.value
          );
          if (!result.success) {
            const errorDiv = document.createElement("div");
            errorDiv.setAttribute("data-automation-id", "error-message");
            errorDiv.textContent = result.message;
            form.insertBefore(errorDiv, form.firstChild);
          } else {
            // Remove any existing error message
            const existingError = documentBody.querySelector(
              '[data-automation-id="error-message"]'
            );
            if (existingError) {
              existingError.remove();
            }
            // Create welcome message
            const welcomeDiv = document.createElement("div");
            welcomeDiv.setAttribute("data-automation-id", "welcome-message");
            welcomeDiv.textContent = result.message;
            form.insertBefore(welcomeDiv, form.firstChild);
          }
        } catch (error) {
          const errorDiv = document.createElement("div");
          errorDiv.setAttribute("data-automation-id", "error-message");
          errorDiv.textContent =
            error instanceof Error ? error.message : "An error occurred";
          form.insertBefore(errorDiv, form.firstChild);
        }
      });
    }
  });

  test("renders all form elements", () => {
    const form = documentBody.querySelector(
      '[data-automation-id="signInFormo"]'
    );
    const email = documentBody.querySelector('[data-automation-id="email"]');
    const password = documentBody.querySelector(
      '[data-automation-id="password"]'
    );
    const verifyPassword = documentBody.querySelector(
      '[data-automation-id="verifyPassword"]'
    );
    const privacyCheckbox = documentBody.querySelector(
      '[data-automation-id="createAccountCheckbox"]'
    );
    const createAccountButton = documentBody.querySelector(
      '[data-automation-id="createAccountSubmitButton"]'
    );

    expect(form).not.toBeNull();
    expect(email).not.toBeNull();
    expect(password).not.toBeNull();
    expect(verifyPassword).not.toBeNull();
    expect(privacyCheckbox).not.toBeNull();
    expect(createAccountButton).not.toBeNull();
  });

  test("handles account creation with invalid data", async () => {
    const form = documentBody.querySelector(
      '[data-automation-id="signInFormo"]'
    ) as HTMLFormElement;

    if (form) {
      const emailInput = documentBody.querySelector(
        '[data-automation-id="email"]'
      ) as HTMLInputElement;
      const passwordInput = documentBody.querySelector(
        '[data-automation-id="password"]'
      ) as HTMLInputElement;
      const verifyPasswordInput = documentBody.querySelector(
        '[data-automation-id="verifyPassword"]'
      ) as HTMLInputElement;

      emailInput.value = "invalid@example.com";
      passwordInput.value = "password123";
      verifyPasswordInput.value = "password456"; // Mismatched passwords
      form.dispatchEvent(new Event("submit"));

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const errorMessage = documentBody.querySelector(
        '[data-automation-id="error-message"]'
      );
      expect(errorMessage).not.toBeNull();
      expect(errorMessage?.textContent).toBe("Passwords do not match");
    }
  });

  test("handles successful account creation", async () => {
    const form = documentBody.querySelector(
      '[data-automation-id="signInFormo"]'
    ) as HTMLFormElement;

    if (form) {
      const emailInput = documentBody.querySelector(
        '[data-automation-id="email"]'
      ) as HTMLInputElement;
      const passwordInput = documentBody.querySelector(
        '[data-automation-id="password"]'
      ) as HTMLInputElement;
      const verifyPasswordInput = documentBody.querySelector(
        '[data-automation-id="verifyPassword"]'
      ) as HTMLInputElement;
      const privacyCheckbox = documentBody.querySelector(
        '[data-automation-id="createAccountCheckbox"]'
      ) as HTMLInputElement;

      emailInput.value = "test@example.com";
      passwordInput.value = "password123";
      verifyPasswordInput.value = "password123";
      privacyCheckbox.checked = true;
      form.dispatchEvent(new Event("submit"));

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const welcomeMessage = documentBody.querySelector(
        '[data-automation-id="welcome-message"]'
      );
      expect(welcomeMessage).not.toBeNull();
      expect(welcomeMessage?.textContent).toBe("Account created successfully");
    }
  });
});
