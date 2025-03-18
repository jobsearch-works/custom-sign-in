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

- BambooHR (bamboohr.com)
- Greenhouse (greenhouse.io)
- Workable (workable.com)
- Zoho Recruit (zoho.com/recruit)
- Bullhorn (bullhorn.com)
- Recruitee (recruitee.com)
- Breezy HR (breezy.hr)
- iCIMS Talent Cloud (icims.com)
- JazzHR (jazzhr.com)
- Manatal (manatal.com)
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

## CLI Commands

The package includes a command-line interface (CLI) for managing command lists in Firestore. These command lists are used to automate sign-in and form filling processes.

### Installation

Ensure you've set up the correct Firebase configuration in your `.env` file:

```
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Available Commands

#### Initialize a Domain Configuration

Before storing command lists for a domain, you need to initialize its configuration:

```bash
ts-node cli.ts initialize-domain <domain>
```

For example:

```bash
ts-node cli.ts initialize-domain greenhouse.io
```

#### Store a Command List for a Domain

Add a set of commands for a specific domain:

```bash
ts-node cli.ts store-list <domain> <listName>
```

Example:

```bash
ts-node cli.ts store-list greenhouse.io sign-in
```

#### Store Generic Commands

Store generic commands that aren't tied to a specific domain:

```bash
ts-node cli.ts store <commandKey>
```

Example:

```bash
ts-node cli.ts store test-commands
```

#### Execute Stored Commands

Execute a previously stored command list:

```bash
ts-node cli.ts execute <commandKey>
```

Example:

```bash
ts-node cli.ts execute test-commands
```

### Command Format

Commands are defined with the following format:

- For fill operations: `fill:selector@domain -> value="value"`
- For check operations: `check:selector@domain -> value=true/false`

In domain-specific command lists, the commands are stored as objects:

```json
[
  { "type": "fill", "selector": "email", "value": "user@example.com" },
  { "type": "fill", "selector": "password", "value": "SecurePassword!" },
  { "type": "check", "selector": "terms", "value": true }
]
```

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

The package includes end-to-end tests using Playwright to verify both the core functionality and the UI interactions.

### Running Tests

```bash
# Run all tests
yarn test

# Run tests with UI
yarn test:e2e:ui
```

### Test Environment

- Uses Playwright for end-to-end testing
- Tests run in real browser environments
- Comprehensive UI interaction testing
- Cross-browser compatibility testing

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
- `yarn test` - Run Playwright tests
- `yarn test:e2e` - Run end-to-end tests with Playwright
- `yarn test:e2e:ui` - Run end-to-end tests with UI
- `yarn lint` - Run ESLint

## License

MIT

# MyWorkdayJobs Account Form Filler

A specialized utility for filling out account creation and sign-in forms on MyWorkdayJobs.com career portal pages (e.g., cba.wd3.myworkdayjobs.com).

## Purpose

This utility is specifically designed to automate form filling on MyWorkdayJobs.com career portal pages. It handles:

- Account creation form fields
- Sign-in form fields
- Switching between create account and sign-in modes

## Form Structure Requirements

The utility expects the following HTML structure:

- Email/Username field (`#input-4`)
- Password field (`#input-5`)
- Verify Password field (`#input-6`) - visible in create account mode
- Terms checkbox (`#input-8`) - visible in create account mode
- Mode switch links (elements containing exact text "Sign In" or "Create Account")

## Usage

```javascript
// Create an instance
const formFiller = new MyWorkdayJobsAccountFiller();

// Fill sign-in form
await formFiller.fillSignInFields({
  username: "user@example.com",
  password: "password123",
});

// Fill account creation form
await formFiller.fillAccountCreationFields({
  email: "newuser@example.com",
  password: "password123",
  verifyPassword: "password123",
  acceptTerms: true,
});

// Switch between modes
await formFiller.switchMode("signIn"); // or "createAccount"

// Get current mode
const mode = await formFiller.getCurrentMode(); // "signIn" or "createAccount"
```

## Important Notes

1. This utility is specifically designed for MyWorkdayJobs.com career portal pages and may not work on other websites
2. It only handles form filling and does not submit forms or handle responses
3. The form structure must match exactly what's expected (specific IDs and text content)
4. The utility starts in "createAccount" mode by default (matching MyWorkdayJobs.com's default state)

## Testing

Tests are provided for both mock and live environments:

```bash
npx playwright test tests/e2e/sign-in.spec.ts
```

# ATS Form Filler

Automated form filling for various Applicant Tracking Systems (ATS) including Greenhouse, Workday, and more.

## Features

- Domain-specific form automation
- Configuration-driven (no hardcoded selectors)
- Support for various input types (text, select, checkbox)
- Extensible architecture

## Installation

```bash
npm install
```

## Usage

### Save domain schema to Firestore

The save-schema command allows you to save domain automation configuration to Firestore.

```bash
# Using npm script
npm run save-schema -- -f <path-to-schema-file> [options]

# Options:
# -f, --file <path>     Path to the JSON schema file (required)
# -d, --domain <domain> Override the domain in the schema file
# --dry-run             Print the schema without saving to Firestore
```

Example:

```bash
# Save a schema to Firestore
npm run save-schema -- -f ./schemas/greenhouse.json

# Test a schema without saving (dry run)
npm run save-schema -- -f ./schemas/greenhouse.json --dry-run
```

For more details, see [Domain Schema Usage](./docs/domain-schema-usage.md).

## Development

### Build the project

```bash
npm run build
```

### Run tests

```bash
npm test
```

## License

MIT
