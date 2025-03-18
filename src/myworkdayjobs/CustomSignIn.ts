export interface SignInResult {
  success: boolean;
  message: string;
}

export class CustomSignIn {
  private form: HTMLFormElement | null;
  private authTitle: HTMLElement | null;
  private verifyPasswordField: HTMLElement | null;
  private privacyField: HTMLElement | null;
  private submitButton: HTMLElement | null;

  constructor() {
    this.form = document.querySelector('[data-automation-id="signInFormo"]');
    this.authTitle = document.getElementById("authViewTitle");
    this.verifyPasswordField = document.querySelector(
      '[data-automation-id="formField-verifyPassword"]'
    );
    this.privacyField = document.querySelector(
      '[data-automation-id="formField-"]'
    );
    this.submitButton = document.querySelector(
      '[data-automation-id="createAccountSubmitButton"]'
    );

    // Set up event listeners
    const signInLink = document.querySelector(
      '[data-automation-id="signInLink"]'
    );
    if (signInLink) {
      signInLink.addEventListener("click", () => this.switchToSignIn());
    }
  }

  private switchToSignIn() {
    if (this.authTitle) {
      this.authTitle.textContent = "Sign In";
    }
    if (this.verifyPasswordField) {
      (this.verifyPasswordField as HTMLElement).style.display = "none";
    }
    if (this.privacyField) {
      (this.privacyField as HTMLElement).style.display = "none";
    }
    if (this.submitButton) {
      this.submitButton.textContent = "Sign In";
    }
  }

  private showMessage(message: string, isError: boolean) {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll(
      '[data-automation-id^="message-"]'
    );
    existingMessages.forEach((msg) => msg.remove());

    // Create new message element
    const messageDiv = document.createElement("div");
    messageDiv.setAttribute(
      "data-automation-id",
      isError ? "message-error" : "message-success"
    );
    messageDiv.textContent = message;

    // Insert message at the top of the form
    if (this.form) {
      this.form.insertBefore(messageDiv, this.form.firstChild);
    }
  }

  async signIn(
    username: string,
    password: string,
    verifyPassword?: string
  ): Promise<SignInResult> {
    // Basic validation
    if (!username || !password) {
      this.showMessage("Email and password are required", true);
      throw new Error("Email and password are required");
    }

    // If verifyPassword is provided, we're in account creation mode
    if (verifyPassword !== undefined) {
      return this.handleAccountCreation(username, password, verifyPassword);
    }

    // Otherwise, we're in sign-in mode
    return this.handleSignIn(username, password);
  }

  private async handleAccountCreation(
    email: string,
    password: string,
    verifyPassword: string
  ): Promise<SignInResult> {
    // Validate email format
    if (!this.isValidEmail(email)) {
      const result = {
        success: false,
        message: "Please enter a valid email address",
      };
      this.showMessage(result.message, true);
      return result;
    }

    // Validate password match
    if (password !== verifyPassword) {
      const result = {
        success: false,
        message: "Passwords do not match",
      };
      this.showMessage(result.message, true);
      return result;
    }

    // Validate password strength
    if (!this.isValidPassword(password)) {
      const result = {
        success: false,
        message:
          "Password must be at least 8 characters long and contain at least one number and one letter",
      };
      this.showMessage(result.message, true);
      return result;
    }

    // Check privacy checkbox
    const privacyCheckbox = document.querySelector(
      '[data-automation-id="createAccountCheckbox"]'
    ) as HTMLInputElement;
    if (!privacyCheckbox?.checked) {
      const result = {
        success: false,
        message: "Please accept the Privacy Statement",
      };
      this.showMessage(result.message, true);
      return result;
    }

    // Simulate API call to create account
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = {
          success: true,
          message: "Account created successfully",
        };
        this.showMessage(result.message, false);
        resolve(result);
      }, 50);
    });
  }

  private async handleSignIn(
    email: string,
    password: string
  ): Promise<SignInResult> {
    // Validate email format
    if (!this.isValidEmail(email)) {
      const result = {
        success: false,
        message: "Please enter a valid email address",
      };
      this.showMessage(result.message, true);
      return result;
    }

    // Simulate API call to sign in
    return new Promise((resolve) => {
      setTimeout(() => {
        // For testing purposes, accept specific credentials
        if (email === "testuser" && password === "testpass123") {
          const result = {
            success: true,
            message: "Sign in successful",
          };
          this.showMessage(result.message, false);
          resolve(result);
        } else {
          const result = {
            success: false,
            message: "Invalid credentials",
          };
          this.showMessage(result.message, true);
          resolve(result);
        }
      }, 50);
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    // Password must be at least 8 characters long and contain at least one number and one letter
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  }
}
