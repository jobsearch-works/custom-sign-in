/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { CustomSignIn } from "../CustomSignIn";

describe("Sign In Form", () => {
  let documentBody: Document;
  let signIn: CustomSignIn;

  beforeEach(() => {
    // Create a new document for each test
    documentBody = document.implementation.createHTMLDocument();
    documentBody.body.innerHTML = `
      <form id="login-form">
        <div>
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit">Sign In</button>
        <div id="error-message"></div>
      </form>
    `;
    signIn = new CustomSignIn();

    // Add form submission handler
    const form = documentBody.querySelector("#login-form") as HTMLFormElement;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = documentBody.querySelector(
        "#email"
      ) as HTMLInputElement;
      const passwordInput = documentBody.querySelector(
        "#password"
      ) as HTMLInputElement;
      const errorMessage = documentBody.querySelector("#error-message");

      try {
        const result = await signIn.signIn(
          emailInput.value,
          passwordInput.value
        );
        if (errorMessage) {
          errorMessage.textContent = result.message;
        }
      } catch (error) {
        if (errorMessage) {
          errorMessage.textContent =
            error instanceof Error ? error.message : "An error occurred";
        }
      }
    });
  });

  test("renders all form elements", () => {
    const form = documentBody.querySelector("#login-form");
    const email = documentBody.querySelector("#email");
    const password = documentBody.querySelector("#password");
    const button = documentBody.querySelector("button[type='submit']");

    expect(form).not.toBeNull();
    expect(email).not.toBeNull();
    expect(password).not.toBeNull();
    expect(button).not.toBeNull();
  });

  test("shows error message for invalid credentials", async () => {
    const form = documentBody.querySelector("#login-form") as HTMLFormElement;
    const errorMessage = documentBody.querySelector("#error-message");

    if (form && errorMessage) {
      const emailInput = documentBody.querySelector(
        "#email"
      ) as HTMLInputElement;
      const passwordInput = documentBody.querySelector(
        "#password"
      ) as HTMLInputElement;
      const submitButton = form.querySelector(
        "button[type='submit']"
      ) as HTMLButtonElement;

      emailInput.value = "wrong@example.com";
      passwordInput.value = "wrongpass";
      submitButton.click();

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(errorMessage.textContent).toBe("Invalid credentials");
    }
  });

  test("handles successful sign in", async () => {
    const form = documentBody.querySelector("#login-form") as HTMLFormElement;
    const errorMessage = documentBody.querySelector("#error-message");

    if (form && errorMessage) {
      const emailInput = documentBody.querySelector(
        "#email"
      ) as HTMLInputElement;
      const passwordInput = documentBody.querySelector(
        "#password"
      ) as HTMLInputElement;
      const submitButton = form.querySelector(
        "button[type='submit']"
      ) as HTMLButtonElement;

      emailInput.value = "testuser";
      passwordInput.value = "testpass";
      submitButton.click();

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(errorMessage.textContent).toBe("Sign in successful");
    }
  });
});
