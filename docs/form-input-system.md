# Generic Form Input System

This document describes the generic form input system used for automating form filling across different websites.

## Firestore Data Structure

The system stores form input configurations in Firestore with the following structure:

```typescript
interface DomainConfig {
  domain: string; // Domain identifier (e.g., "boards.greenhouse.io")
  selectors: Record<string, SelectorDefinition>; // Field selectors map
  commands: CommandTemplate[]; // Command templates
  lastUpdated?: Date;
  createdAt?: Date;
}
```

### Selectors

Selectors define how to locate form elements on a page:

```typescript
interface SelectorDefinition {
  selector: string; // CSS/XPath/text selector
  description: string; // Description of the field
  type: SelectorType; // "css", "xpath", or "text"
  optional?: boolean; // Whether this field is optional
}
```

Example selector:

```json
{
  "email": {
    "selector": "#email-field",
    "description": "Email input field",
    "type": "css",
    "optional": false
  }
}
```

### Commands

Commands define the actions to perform on form elements:

#### Structured Command Format (Preferred)

Commands should be stored as objects:

```typescript
interface InputCommand {
  type: "fill" | "select" | "check"; // Input types
  field: string; // Field identifier (matches selector keys)
  value: string; // Value to enter
  required?: boolean; // Whether this input is required
  description?: string; // Human-readable description
}
```

Example command list:

```json
{
  "name": "sign-in",
  "description": "Commands to fill in the sign-in form",
  "commands": [
    {
      "type": "fill",
      "field": "email",
      "value": "user@example.com",
      "required": true,
      "description": "Enter email address"
    },
    {
      "type": "fill",
      "field": "password",
      "value": "securepassword",
      "required": true,
      "description": "Enter password"
    },
    {
      "type": "check",
      "field": "terms",
      "value": true,
      "required": true,
      "description": "Accept terms and conditions"
    }
  ]
}
```

#### Legacy Format Support

For backward compatibility, the system still supports string-based commands in these formats:

- `"fill:email=user@example.com"`
- `"fill:email -> value=user@example.com"`

## Command Execution

Commands are executed in sequence. For each command:

1. The system looks up the selector for the field from the domain configuration
2. If no selector is found, it uses the field identifier as the selector
3. The appropriate action is performed based on command type:
   - `fill`: Fill in a text field
   - `select`: Select an option from a dropdown
   - `check`: Check or uncheck a checkbox

## Implementation

The test framework uses a `FormFiller` interface to handle form interactions:

```typescript
interface FormFiller {
  fillField(selector: string, value: string): Promise<void>;
  selectOption(selector: string, value: string): Promise<void>;
  checkBox(selector: string, value: boolean): Promise<void>;
  waitForElement(selector: string, timeout?: number): Promise<any>;
}
```

The `GenericFormFiller` implementation uses Playwright to interact with form elements.

## Key Features

- **Fully Generic**: No platform-specific code or hardcoded selectors
- **Configuration-Driven**: All selectors and commands are stored in Firestore
- **Type Safety**: Structured command format ensures type safety
- **Easy to Extend**: New form types can be supported without code changes

## Usage

1. Initialize a domain:

   ```
   ts-node cli.ts initialize-domain example.com
   ```

2. Store selectors for the domain:

   ```
   ts-node cli.ts add-selector example.com email "#email-field" "Email input field" css
   ```

3. Store command lists for the domain:

   ```
   ts-node cli.ts store-list example.com sign-in
   ```

4. Run tests with the configured domain:

   ```
   npx playwright test tests/e2e/generic-domain-commands.spec.ts
   ```

5. Convert legacy command formats to structured format:
   ```
   SAVE_COMMANDS=true npx playwright test tests/e2e/create-commands.spec.ts
   ```

## Future Enhancements

- Support for more complex form interactions
- Better error handling and recovery mechanisms
- Validation of form submissions
- Support for multi-page forms
