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
  });

  test("renders all form elements", () => {
    expect(documentBody.querySelector("#login-form")).toBeInTheDocument();
    expect(documentBody.querySelector("#email")).toBeInTheDocument();
    expect(documentBody.querySelector("#password")).toBeInTheDocument();
    expect(
      documentBody.querySelector("button[type='submit']")
    ).toBeInTheDocument();
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
