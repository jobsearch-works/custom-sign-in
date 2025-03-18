/**
 * MyWorkdayJobsAccountFiller class
 * Specifically designed for filling out the create account and sign-in forms
 * on MyWorkdayJobs.com career portal pages (e.g., cba.wd3.myworkdayjobs.com)
 *
 * Form structure expected:
 * - Email/Username field (#input-4)
 * - Password field (#input-5)
 * - Verify Password field (#input-6) - visible in create account mode
 * - Terms checkbox (#input-8) - visible in create account mode
 * - Mode switch links ("Sign In" / "Create Account" text elements)
 */
class MyWorkdayJobsAccountFiller {
  constructor() {
    // Field selectors specific to MyWorkdayJobs.com account creation form
    this.selectors = {
      emailUsername: "#input-4",
      password: "#input-5",
      verifyPassword: "#input-6",
      termsCheckbox: "#input-8",
      signInLink: "text=Sign In",
      createAccountLink: "text=Create Account",
    };

    // Initialize in create account mode (default state of MyWorkdayJobs forms)
    this.currentMode = "createAccount";
  }

  /**
   * Fill in the sign-in form fields on MyWorkdayJobs.com
   * @param {Object} data - The sign-in form data
   * @param {string} data.username - The username or email
   * @param {string} data.password - The password
   */
  async fillSignInFields({ username, password }) {
    const emailField = document.querySelector(this.selectors.emailUsername);
    const passwordField = document.querySelector(this.selectors.password);

    if (!emailField || !passwordField) {
      throw new Error("Required MyWorkdayJobs sign-in fields not found");
    }

    emailField.value = username;
    passwordField.value = password;
  }

  /**
   * Fill in the account creation form fields on MyWorkdayJobs.com
   * @param {Object} data - The account creation form data
   * @param {string} data.email - The email address
   * @param {string} data.password - The password
   * @param {string} data.verifyPassword - The verification password
   * @param {boolean} data.acceptTerms - Whether to check the terms checkbox
   */
  async fillAccountCreationFields({
    email,
    password,
    verifyPassword,
    acceptTerms,
  }) {
    const emailField = document.querySelector(this.selectors.emailUsername);
    const passwordField = document.querySelector(this.selectors.password);
    const verifyPasswordField = document.querySelector(
      this.selectors.verifyPassword
    );
    const termsCheckbox = document.querySelector(this.selectors.termsCheckbox);

    if (
      !emailField ||
      !passwordField ||
      !verifyPasswordField ||
      !termsCheckbox
    ) {
      throw new Error(
        "Required MyWorkdayJobs account creation fields not found"
      );
    }

    emailField.value = email;
    passwordField.value = password;
    verifyPasswordField.value = verifyPassword;
    termsCheckbox.checked = acceptTerms;
  }

  /**
   * Switch between sign-in and account creation modes on MyWorkdayJobs.com form
   * @param {"signIn" | "createAccount"} mode - The mode to switch to
   */
  async switchMode(mode) {
    if (mode === this.currentMode) return;

    const linkSelector =
      mode === "signIn"
        ? this.selectors.signInLink
        : this.selectors.createAccountLink;

    const link = document.evaluate(
      `//*[text()="${mode === "signIn" ? "Sign In" : "Create Account"}"]`,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;

    if (!link) {
      throw new Error(`MyWorkdayJobs mode switch link for ${mode} not found`);
    }

    link.click();
    this.currentMode = mode;
  }

  /**
   * Get the current form mode on MyWorkdayJobs.com
   * @returns {"signIn" | "createAccount"} The current form mode
   */
  async getCurrentMode() {
    return this.currentMode;
  }
}

// For compatibility with both browser and Node.js environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = MyWorkdayJobsAccountFiller;
}
