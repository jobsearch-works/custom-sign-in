# Domain Schema Management

This document describes how to use the domain schema management tools to save and manage automation configurations in Firestore.

## Saving Domain Schemas

The `save-schema` command allows you to save domain automation schema to Firestore for use with the form automation system.

### Basic Usage

```bash
npm run save-schema -- -f <path-to-schema-file>
```

### Command Options

- `-f, --file <path>` - Path to the JSON schema file (required)
- `-d, --domain <domain>` - Override the domain in the schema file
- `--dry-run` - Print the schema without saving to Firestore

### Examples

#### Save a domain schema to Firestore

```bash
npm run save-schema -- -f ./schemas/greenhouse.json
```

#### Test a schema before saving (dry run)

```bash
npm run save-schema -- -f ./schemas/greenhouse.json --dry-run
```

#### Override the domain in the schema

```bash
npm run save-schema -- -f ./schemas/greenhouse.json -d careers.example.com
```

## Schema Format

The schema file should be a JSON file with the following structure:

```json
{
  "domain": "boards.greenhouse.io",
  "selectors": {
    "email": {
      "selector": "#email",
      "description": "Email input field",
      "type": "css",
      "optional": false
    }
    // additional selectors...
  },
  "commands": [
    {
      "name": "fill-application",
      "description": "Commands to fill out the job application form",
      "commands": [
        {
          "type": "fill",
          "field": "email",
          "value": "john.doe@example.com",
          "required": true,
          "description": "Enter email address"
        }
        // additional commands...
      ]
    }
  ]
}
```

### Selector Properties

Each selector has the following properties:

| Property    | Type    | Description                                        |
| ----------- | ------- | -------------------------------------------------- |
| selector    | string  | CSS selector, XPath, or text to locate the element |
| description | string  | Human-readable description of the field            |
| type        | string  | Type of selector: "css", "xpath", or "text"        |
| optional    | boolean | Whether the field is optional or required          |

### Command Properties

Each structured command has the following properties:

| Property    | Type           | Description                                |
| ----------- | -------------- | ------------------------------------------ |
| type        | string         | Command type: "fill", "select", or "check" |
| field       | string         | Field identifier (matches selector keys)   |
| value       | string/boolean | Value to enter or select                   |
| required    | boolean        | Whether this input is required             |
| description | string         | Human-readable description of the command  |

## Creating New Schemas

1. Create a JSON file with the domain configuration
2. Add selectors for all form elements
3. Add command templates for common form operations
4. Save the schema to Firestore using the `save-schema` command

## Best Practices

- Use descriptive selector and command names
- Group related selectors together
- Include detailed descriptions for each selector and command
- Test schemas with the `--dry-run` option before saving
- Use domain-specific command lists for different form workflows
