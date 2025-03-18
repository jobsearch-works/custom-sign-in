# custom-sign-in

A specialized automation package designed to be used within the JSW (Job Search Workflow) browser extension. This package provides automated sign-in and account creation functionality for various career and job application websites, with initial support for Workday-based career portals.

## Purpose

This package is intended to be used as part of the JSW browser extension to automate the authentication process across different job application platforms. It handles:

- Automatic detection of sign-in forms
- Smart form filling based on saved credentials
- Account creation when needed
- Validation and error handling specific to career portals
- Consistent automation across different Workday instances

## Browser Extension Integration

This package is specifically designed to run within the JSW browser extension environment. It:

- Uses data-automation-id selectors for reliable element targeting
- Handles various Workday sign-in page variations
- Provides consistent behavior across different company career portals
- Maintains session state for automated job applications

## Important Notes

### Browser Extension Context

This package must be run within a browser extension context. It will not work as a standalone application because:

- It requires DOM access permissions provided by the extension
- It needs to interact with the extension's storage for credentials
- It relies on the extension's content script injection
- It uses extension-specific messaging for cross-domain communication

### Supported Platforms

Currently supports:

- Workday-based career portals
- Company-specific Workday instances
- Standard Workday authentication flows

Future releases will add support for:

- Other major ATS (Applicant Tracking System) platforms
- Custom company career portals
- OAuth-based authentication systems

### Security Considerations

- Credentials are handled securely through the browser extension's storage
- No sensitive data is stored in plain text
- All form interactions follow secure input practices
- Automation respects the site's security policies

## Installation

```bash
yarn add custom-sign-in
```

## Usage

### In Browser Extension Content Script

```typescript
import { CustomSignIn } from "custom-sign-in";

// Initialize the sign-in handler with the current page context
const signIn = new CustomSignIn();

// Example: Automatic sign-in when extension detects a login page
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "HANDLE_LOGIN_PAGE") {
    try {
      // Get stored credentials from extension storage
      const { email, password } = await chrome.storage.local.get([
        "email",
        "password",
      ]);

      // Attempt to sign in
      const signInResult = await signIn.signIn(email, password);

      if (signInResult.success) {
        // Notify extension of successful login
        chrome.runtime.sendMessage({ type: "LOGIN_SUCCESS" });
      } else {
        // Handle failed login
        chrome.runtime.sendMessage({
          type: "LOGIN_FAILED",
          error: signInResult.message,
        });
      }
    } catch (error) {
      console.error("Login automation failed:", error);
    }
  }
});

// Example: Handle account creation when needed
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "CREATE_ACCOUNT") {
    try {
      const { email, password } = message.data;

      // Create new account with verification
      const createAccountResult = await signIn.signIn(
        email,
        password,
        password // Verify password parameter indicates account creation
      );

      if (createAccountResult.success) {
        // Store credentials in extension storage
        await chrome.storage.local.set({ email, password });
        chrome.runtime.sendMessage({ type: "ACCOUNT_CREATED" });
      } else {
        chrome.runtime.sendMessage({
          type: "ACCOUNT_CREATION_FAILED",
          error: createAccountResult.message,
        });
      }
    } catch (error) {
      console.error("Account creation automation failed:", error);
    }
  }
});
```

### Extension Manifest Permissions

```json
{
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["*://*.myworkdayjobs.com/*", "*://*.workday.com/*"],
  "content_scripts": [
    {
      "matches": ["*://*.myworkdayjobs.com/*", "*://*.workday.com/*"],
      "js": ["content-script.js"]
    }
  ]
}
```

## Features

- Sign in with email and password
- Create new account with email verification
- Password strength validation
- Email format validation
- Privacy statement acceptance
- Forgot password functionality
- Automated testing suite

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Build the package:
   ```bash
   yarn build
   ```

## Testing

The package includes a comprehensive test suite that verifies both the core functionality and the UI interactions.

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage
```

### Test Suite Overview

The test suite consists of two main test files:

#### 1. CustomSignIn.test.ts

Tests the core functionality of the `CustomSignIn` class:

- Basic initialization
- Sign-in attempt handling

#### 2. sign-in.test.ts

Tests the UI interactions and form handling:

- Form element rendering
- Account creation with invalid data
  - Password mismatch validation
  - Email format validation
  - Password strength requirements
- Successful account creation flow
  - Form submission
  - Privacy statement checkbox
  - Success message display

### Test Environment

- Uses Jest as the test runner
- Implements jsdom for DOM manipulation testing
- Uses @testing-library/jest-dom for enhanced DOM assertions
- Mock HTML templates for consistent testing environment

### Test Coverage

The tests verify:

- Input validation
  - Required fields
  - Email format
  - Password strength
  - Password matching
- UI State Management
  - Error message display
  - Success message display
  - Form field visibility
- User Interactions
  - Form submission
  - Sign in/Create account toggle
  - Forgot password flow

## Scripts

- `yarn build` - Build the package
- `yarn test` - Run tests
- `yarn test:e2e` - Run end-to-end tests with Playwright
- `yarn test:e2e:ui` - Run end-to-end tests with UI
- `yarn test:all` - Run all test suites
- `yarn lint` - Run ESLint

## License

MIT
