#!/usr/bin/env node

/**
 * Greenhouse Form Parser
 *
 * This script parses the provided HTML form from Greenhouse.io and generates
 * CLI commands to add the field selectors to Firestore.
 */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

// Configuration
const DOMAIN = "greenhouse.io";
const HTML_FILE_PATH = path.resolve(process.cwd(), "greenhouse-form.html");

// Read the HTML file
let html;
try {
  html = fs.readFileSync(HTML_FILE_PATH, "utf8");
} catch (error) {
  console.error(`Error reading file: ${error.message}`);
  process.exit(1);
}

// Parse the HTML using JSDOM
const dom = new JSDOM(html);
const document = dom.window.document;

// Function to extract selectors from the form
function extractSelectors() {
  const selectors = {};

  // Extract basic field selectors
  const basicFields = [
    { id: "first_name", key: "first_name" },
    { id: "last_name", key: "last_name" },
    { id: "email", key: "email" },
    { id: "phone", key: "phone" },
    { id: "resume_text", key: "resume" },
    { id: "cover_letter_text", key: "cover_letter" },
    { id: "security_code", key: "security_code" },
    { id: "submit_app", key: "submit" },
  ];

  basicFields.forEach((field) => {
    const element = document.getElementById(field.id);
    if (element) {
      selectors[field.key] = {
        type: "css",
        value: `#${field.id}`,
      };
    }
  });

  // Extract custom questions
  const customFieldsDiv = document.getElementById("custom_fields");
  if (customFieldsDiv) {
    const customFields = customFieldsDiv.querySelectorAll(".field");
    customFields.forEach((field, index) => {
      const textareaElement = field.querySelector("textarea");
      const inputElement = field.querySelector('input[type="text"]');
      const selectElement = field.querySelector("select");

      // Get the question text
      const labelElement = field.querySelector("label");
      if (!labelElement) return;

      // Extract the question text, removing asterisk if present
      const questionText = labelElement.textContent
        .trim()
        .replace(/\s*\*\s*$/, "");

      // Create a readable key from the question
      const key = `custom_question_${index + 1}`;

      // Find the appropriate element to create a selector for
      let elementToSelect = textareaElement || inputElement || selectElement;
      if (!elementToSelect) return;

      // Get id for the selector
      const id = elementToSelect.id;
      if (!id) return;

      selectors[key] = {
        type: "css",
        value: `#${id}`,
        question: questionText,
      };
    });
  }

  return selectors;
}

// Function to generate CLI commands for the selectors
function generateCommands(selectors) {
  const commands = [];

  // Generate command for domain initialization if needed
  commands.push(`npx jsw-cli domain:init --domain=${DOMAIN}`);

  // Generate a selector command for each field
  Object.entries(selectors).forEach(([key, selector]) => {
    let command = `npx jsw-cli selector:set --domain=${DOMAIN} --key=${key} --type=${selector.type} --value="${selector.value}"`;
    if (selector.question) {
      command += ` --label="${selector.question}"`;
    }
    commands.push(command);
  });

  // Generate sign-in command template
  const signInCommands = [
    {
      action: "fill",
      target: "email",
      value: "{{email}}",
    },
    {
      action: "fill",
      target: "first_name",
      value: "{{firstName}}",
    },
    {
      action: "fill",
      target: "last_name",
      value: "{{lastName}}",
    },
    {
      action: "fill",
      target: "phone",
      value: "{{phone}}",
    },
    {
      action: "click",
      target: "submit",
    },
  ];

  // Create command for adding the sign-in command template
  const signInCommandTemplate = {
    name: "sign-in",
    description: "Fill in the Greenhouse application form",
    commands: signInCommands,
  };

  commands.push(
    `npx jsw-cli command:set --domain=${DOMAIN} --commandTemplate='${JSON.stringify(
      signInCommandTemplate
    )}'`
  );

  return commands;
}

// Main execution
function main() {
  console.log("Parsing Greenhouse.io form HTML...");
  const selectors = extractSelectors();

  console.log(`Found ${Object.keys(selectors).length} field selectors.`);
  console.log("Generating CLI commands...");

  const commands = generateCommands(selectors);

  console.log("\n=== CLI Commands ===\n");
  commands.forEach((cmd) => console.log(cmd));

  // Write commands to a file for easy execution
  const outputFilePath = path.resolve(process.cwd(), "greenhouse-commands.sh");

  // Create shell script with commands
  const shellScript = `#!/bin/bash
# Commands generated for Greenhouse.io domain
# Run this script to initialize the domain and add selectors to Firestore

${commands.join("\n")}
`;

  fs.writeFileSync(outputFilePath, shellScript);
  fs.chmodSync(outputFilePath, "755"); // Make executable

  console.log(`\nCommands have been written to: ${outputFilePath}`);
  console.log(`Run 'bash ${outputFilePath}' to execute all commands.`);
}

// Execute main function
main();
