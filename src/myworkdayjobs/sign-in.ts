function loginToPage(email: string, password: string): void {
  // Select the email input field
  const emailInput = document.querySelector<HTMLInputElement>(
    'input[data-automation-id="email"]'
  );
  if (emailInput) {
    emailInput.value = email;
    emailInput.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    console.error("Email input field not found");
    return;
  }

  // Select the password input field
  const passwordInput = document.querySelector<HTMLInputElement>(
    'input[data-automation-id="password"]'
  );
  if (passwordInput) {
    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    console.error("Password input field not found");
    return;
  }

  // Select the sign-in button and click it
  const signInButton = document.querySelector<HTMLButtonElement>(
    'button[data-automation-id="signInLink"]'
  );
  if (signInButton) {
    signInButton.click();
  } else {
    console.error("Sign-in button not found");
  }
}

// Example usage:
loginToPage("your-email@example.com", "your-password");
