# Local Form Testing Commands

This document describes various ways to run form automation tests locally.

## Using Shell Scripts

The simplest way to test a form is using the provided shell script:

```bash
# Test any URL
./scripts/test-form-fill.sh https://example.com/form-url

# Make the script executable if needed
chmod +x ./scripts/test-form-fill.sh
```

## Using NPM Scripts

Several NPM scripts are available for common testing scenarios:

```bash
# Test a specific URL (provide the URL as an argument)
npm run test:form -- https://example.com/form-url

# Test specifically against Greenhouse
npm run test:greenhouse

# Run the test with a custom URL via environment variable
FORM_URL=https://example.com/form-url npm run test:domain
```

## Using the CLI Tool

A dedicated CLI tool is also available for more advanced options:

```bash
# Install the package globally to make the command available
npm install -g .

# Basic usage
test-domain-form https://example.com/form-url

# With options
test-domain-form https://example.com/form-url --headed --debug
```

Or without global installation:

```bash
# Run the CLI directly
node ./dist/commands/test-domain-form.js https://example.com/form-url

# Using npx
npx test-domain-form https://example.com/form-url
```

## Custom Local Testing

You can also run the test directly using Playwright:

```bash
# Set the URL environment variable and run the test
FORM_URL=https://example.com/form-url npx playwright test -g "Execute domain form commands from Firestore"

# Run in headed mode (to see the browser)
FORM_URL=https://example.com/form-url npx playwright test -g "Execute domain form commands from Firestore" --headed

# Run with debug mode
FORM_URL=https://example.com/form-url npx playwright test -g "Execute domain form commands from Firestore" --debug
```

## Debugging Failed Tests

If a test fails, you can:

1. Check the HTML report with `npx playwright show-report`
2. Examine the screenshots in the `test-reports` directory
3. Read the detailed test log in the `test-reports/form-fill-report-*.txt` files
