# Save Domain Schema Command

This command-line tool allows you to save domain automation schema to Firestore for use with the ATS Form Filler.

## Usage

```bash
npm run save-domain-schema -- -f <path-to-schema-file> [options]
```

Or globally (if installed globally):

```bash
save-domain-schema -f <path-to-schema-file> [options]
```

## Options

- `-f, --file <path>` - Path to the JSON schema file (required)
- `-d, --domain <domain>` - Override the domain in the schema file
- `--dry-run` - Print the schema without saving to Firestore

## Schema Format

The schema file should be a JSON file with the following structure:

```json
{
  "domain": "boards.greenhouse.io",
  "selectors": {
    "field_name": {
      "selector": "#field_id",
      "description": "Field description",
      "type": "css",
      "optional": false
    },
    ...
  },
  "commands": [
    {
      "name": "command-list-name",
      "description": "Command list description",
      "commands": [
        {
          "type": "fill",
          "field": "field_name",
          "value": "field_value",
          "required": true,
          "description": "Command description"
        },
        ...
      ]
    }
  ],
  "lastUpdated": "2023-03-18T13:24:31Z",
  "createdAt": "2023-03-18T07:04:35Z"
}
```

## Examples

### Save a schema to Firestore

```bash
npm run save-domain-schema -- -f ./schemas/greenhouse.json
```

### Dry run to verify schema before saving

```bash
npm run save-domain-schema -- -f ./schemas/greenhouse.json --dry-run
```

### Override domain in the schema

```bash
npm run save-domain-schema -- -f ./schemas/greenhouse.json -d my-custom-greenhouse.io
```
