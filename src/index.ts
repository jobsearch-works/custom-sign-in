import { CustomSignIn } from "./myworkdayjobs/CustomSignIn";

document.addEventListener("DOMContentLoaded", () => {
  const signIn = new CustomSignIn();
  const form = document.querySelector('[data-automation-id="signInFormo"]');
  const signInLink = document.querySelector(
    '[data-automation-id="signInLink"]'
  );
  const forgotPasswordLink = document.querySelector(
    '[data-automation-id="forgotPasswordLink"]'
  );
  const createAccountCheckbox = document.querySelector(
    '[data-automation-id="createAccountCheckbox"]'
  ) as HTMLInputElement;

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = (
        document.querySelector(
          '[data-automation-id="email"]'
        ) as HTMLInputElement
      )?.value;
      const password = (
        document.querySelector(
          '[data-automation-id="password"]'
        ) as HTMLInputElement
      )?.value;
      const verifyPassword = (
        document.querySelector(
          '[data-automation-id="verifyPassword"]'
        ) as HTMLInputElement
      )?.value;

      try {
        // Remove any existing messages
        const existingMessages = document.querySelectorAll(
          '[data-automation-id^="message-"]'
        );
        existingMessages.forEach((msg) => msg.remove());

        // Validate privacy checkbox for account creation
        if (verifyPassword && !createAccountCheckbox?.checked) {
          const errorDiv = document.createElement("div");
          errorDiv.setAttribute("data-automation-id", "message-error");
          errorDiv.textContent = "Please accept the Privacy Statement";
          form.insertBefore(errorDiv, form.firstChild);
          return;
        }

        const result = await signIn.signIn(
          email,
          password,
          verifyPassword // This will be undefined for sign-in flow
        );

        const messageDiv = document.createElement("div");
        messageDiv.setAttribute(
          "data-automation-id",
          result.success ? "message-success" : "message-error"
        );
        messageDiv.textContent = result.message;
        form.insertBefore(messageDiv, form.firstChild);

        if (result.success) {
          // Redirect or update UI as needed
          setTimeout(() => {
            window.location.href = "/my-information"; // Next step in the application process
          }, 50); // Reduced from 1000ms to 50ms for faster testing
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        const errorDiv = document.createElement("div");
        errorDiv.setAttribute("data-automation-id", "message-error");
        errorDiv.textContent = errorMessage;
        form.insertBefore(errorDiv, form.firstChild);
      }
    });
  }

  // Handle sign in link click
  if (signInLink) {
    signInLink.addEventListener("click", () => {
      const verifyPasswordField = document.querySelector(
        '[data-automation-id="formField-verifyPassword"]'
      );
      const privacyField = document.querySelector(
        '[data-automation-id="formField-"]'
      );
      const submitButton = document.querySelector(
        '[data-automation-id="createAccountSubmitButton"]'
      );
      const authTitle = document.getElementById("authViewTitle");

      if (verifyPasswordField) {
        (verifyPasswordField as HTMLElement).style.display = "none";
      }
      if (privacyField) {
        (privacyField as HTMLElement).style.display = "none";
      }
      if (submitButton) {
        (submitButton as HTMLElement).textContent = "Sign In";
      }
      if (authTitle) {
        authTitle.textContent = "Sign In";
      }
    });
  }

  // Handle forgot password link click
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", () => {
      const email = (
        document.querySelector(
          '[data-automation-id="email"]'
        ) as HTMLInputElement
      )?.value;
      if (!email) {
        const errorDiv = document.createElement("div");
        errorDiv.setAttribute("data-automation-id", "message-error");
        errorDiv.textContent = "Please enter your email address";
        form?.insertBefore(errorDiv, form.firstChild);
        return;
      }

      // Simulate password reset email
      const messageDiv = document.createElement("div");
      messageDiv.setAttribute("data-automation-id", "message-success");
      messageDiv.textContent =
        "Password reset instructions have been sent to your email";
      form?.insertBefore(messageDiv, form.firstChild);
    });
  }
});
