# Schema-Based Form Testing

This document describes how to use the schema-based testing features to efficiently test form automation against multiple URLs.

## Overview

Schema-based testing allows you to:

1. Define test URLs directly in your domain schema
2. Track test history and status
3. Run tests selectively (e.g., only previously failed tests)
4. Run tests in parallel
5. Generate reports for each test run

## Schema Structure

Domain schemas now include two new properties:

```json
{
  "domain": "boards.greenhouse.io",
  "selectors": { ... },
  "commands": [ ... ],
  "testUrls": [
    {
      "url": "https://boards.greenhouse.io/company/jobs/123456",
      "description": "Software Engineer position",
      "commandList": "fill-application"
    },
    ...
  ],
  "testHistory": [
    {
      "url": "https://boards.greenhouse.io/company/jobs/123456",
      "timestamp": "2025-03-18T13:24:31Z",
      "status": "success",
      "executedCommands": 10,
      "failedCommands": 0,
      "reportFile": "form-fill-report-2025-03-18T13-24-31Z.txt"
    },
    ...
  ]
}
```

## Adding Test URLs to a Schema

You can add test URLs to a schema in two ways:

1. **Directly edit the JSON file**:

   ```bash
   # Edit the schema file
   vim ./schemas/boards_greenhouse_io.json

   # Save it to Firestore
   npm run save-schema -- -f ./schemas/boards_greenhouse_io.json
   ```

2. **Update via API** (coming soon):
   ```javascript
   await firestoreService.addTestUrl("boards.greenhouse.io", {
     url: "https://boards.greenhouse.io/company/jobs/123456",
     description: "Software Engineer position",
     commandList: "fill-application",
   });
   ```

## Running Tests

### List Available Domains

```bash
npx test-schema-urls
```

This will list all domains with test URLs defined in their schemas.

### Run All Tests for a Domain

```bash
# Using the CLI command
npx test-schema-urls boards.greenhouse.io

# Using npm script
npm run test:greenhouse:schema
```

### Run a Specific Test URL

```bash
npx test-schema-urls boards.greenhouse.io -u https://boards.greenhouse.io/company/jobs/123456
```

### Run Only Previously Failed Tests

```bash
npx test-schema-urls boards.greenhouse.io --failed-only
```

### Run Tests in Parallel

```bash
npx test-schema-urls boards.greenhouse.io --parallel 3
```

### Show Browser UI During Tests

```bash
npx test-schema-urls boards.greenhouse.io --headed
```

### Don't Update Test History

```bash
npx test-schema-urls boards.greenhouse.io --no-history
```

## Test History

Test history is automatically tracked in the schema. Each test run creates a record with:

- URL
- Timestamp
- Status (success/failed)
- Number of executed commands
- Number of failed commands
- Reference to the report file

You can use this history to:

- Track test reliability over time
- Run only tests that failed previously
- Generate statistics about form automation

## Test Reports

Each test run generates a report file in the `test-reports` directory. The report includes:

- URL tested
- Timestamp
- Detailed execution log for each command
- Success/failure status for each command
- Summary of passed/failed commands

## Best Practices

1. **Group related forms**: Add multiple test URLs for similar forms to ensure comprehensive coverage
2. **Use descriptive names**: Make the descriptions clear so you can identify tests easily
3. **Use the `--failed-only` flag**: After fixing issues, run only previously failed tests
4. **Run in parallel**: Use the `--parallel` option for large test suites
5. **Review test history**: Regularly check test history to identify patterns in failures

## Troubleshooting

If tests are failing consistently:

1. Check if the form structure has changed
2. Verify that selectors are still valid
3. Check the test report for specific error messages
4. Try running with the `--headed` flag to see the browser during execution
