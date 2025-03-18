#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { Command } from "commander";
import { CustomFirestoreService } from "../services/CustomFirestoreService";
import { DomainConfig } from "../common/types";

const program = new Command();

program
  .name("save-domain-schema")
  .description("Save domain automation schema to Firestore")
  .version("1.0.0")
  .requiredOption("-f, --file <path>", "Path to the JSON schema file")
  .option("-d, --domain <domain>", "Override the domain in the schema file")
  .option("--dry-run", "Print the schema without saving to Firestore")
  .parse(process.argv);

async function main() {
  const options = program.opts();

  try {
    // Read and parse the schema file
    const filePath = path.resolve(process.cwd(), options.file);
    console.log(`Reading schema from: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at ${filePath}`);
      process.exit(1);
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const schema = JSON.parse(fileContents) as DomainConfig;

    // Override domain if provided
    if (options.domain) {
      console.log(`Overriding domain with: ${options.domain}`);
      schema.domain = options.domain;
    }

    // Validate schema
    if (!schema.domain) {
      console.error("Error: Schema is missing domain property");
      process.exit(1);
    }

    if (!schema.selectors || typeof schema.selectors !== "object") {
      console.error(
        "Error: Schema is missing selectors or selectors is not an object"
      );
      process.exit(1);
    }

    if (!Array.isArray(schema.commands)) {
      console.error(
        "Error: Schema is missing commands or commands is not an array"
      );
      process.exit(1);
    }

    // Handle date fields
    if (schema.lastUpdated && typeof schema.lastUpdated === "string") {
      schema.lastUpdated = new Date(schema.lastUpdated);
    }

    if (schema.createdAt && typeof schema.createdAt === "string") {
      schema.createdAt = new Date(schema.createdAt);
    }

    // Print schema in dry-run mode
    if (options.dryRun) {
      console.log("Dry run mode - schema to be saved:");
      console.log(JSON.stringify(schema, null, 2));
      console.log("No changes saved to Firestore.");
      return;
    }

    // Save to Firestore
    console.log(`Saving schema for domain: ${schema.domain}`);
    const firestoreService = new CustomFirestoreService();
    await firestoreService.saveDomainConfig(schema);

    console.log(
      `Schema successfully saved to Firestore for domain: ${schema.domain}`
    );
  } catch (error) {
    console.error("Error saving schema to Firestore:", error);
    process.exit(1);
  }
}

// Execute the main function
main();
