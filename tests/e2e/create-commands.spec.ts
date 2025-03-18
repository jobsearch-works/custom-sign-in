import { test, Page } from "@playwright/test";
import { CustomFirestoreService } from "../../src/services/CustomFirestoreService";
import { CommandTemplate, DomainConfig } from "../../src/common/types";

/**
 * This test file helps generate structured command templates for domains
 * It can be used to update existing domains to use the new structured command format
 */

interface InputCommand {
  type: "fill" | "select" | "check";
  field: string;
  value: string;
  required?: boolean;
  description?: string;
}

test.describe("Command Template Generator", () => {
  test("Generate structured command template", async ({ page }) => {
    // Configuration
    const domain = "greenhouse.io"; // Change this to the domain you want to update
    const templateName = "sign-in"; // Template to update

    // Initialize FirestoreService
    const firestoreService = new CustomFirestoreService();

    // Get the domain config
    const domainConfig = await firestoreService.getDomainConfig(domain);
    if (!domainConfig) {
      console.log(`Domain ${domain} not found. Please initialize it first.`);
      console.log(`Run: ts-node cli.ts initialize-domain ${domain}`);
      return;
    }

    console.log(`Found domain: ${domain}`);

    // Find the command template to update
    const templateIndex = domainConfig.commands.findIndex(
      (cmd) => cmd.name.toLowerCase() === templateName.toLowerCase()
    );

    if (templateIndex === -1) {
      console.log(`Template '${templateName}' not found for domain ${domain}`);
      console.log(
        `Available templates: ${domainConfig.commands
          .map((c) => c.name)
          .join(", ")}`
      );
      return;
    }

    const template = domainConfig.commands[templateIndex];
    console.log(
      `Found template: ${template.name} with ${template.commands.length} commands`
    );

    // Convert legacy commands to structured format
    const structuredCommands: InputCommand[] = [];

    for (const cmd of template.commands) {
      // Parse the legacy command
      let parsedCommand: { type: string; selector: string; value: any } = {
        type: "",
        selector: "",
        value: "",
      };

      if (typeof cmd === "object" && !Array.isArray(cmd) && cmd !== null) {
        // Already in object format
        const cmdObj = cmd as any; // Cast to any to access properties
        if (cmdObj.type && (cmdObj.selector || cmdObj.field)) {
          parsedCommand = {
            type: cmdObj.type,
            selector: cmdObj.field || cmdObj.selector,
            value: cmdObj.value,
          };
        }
      } else if (typeof cmd === "string") {
        // Parse from string format
        if (cmd.includes(" -> ")) {
          // Format: "fill:email -> value=user@example.com"
          const [actionSelector, valueStr] = cmd.split(" -> ");
          const [type, selector] = actionSelector.split(":");
          const value = valueStr.split("=")[1];
          parsedCommand = { type, selector, value };
        } else if (cmd.includes(":") && cmd.includes("=")) {
          // Format: "fill:email=user@example.com"
          const [typeSelector, value] = cmd.split("=");
          const [type, selector] = typeSelector.split(":");
          parsedCommand = { type, selector, value };
        }
      }

      // Create structured command
      if (parsedCommand.type && parsedCommand.selector) {
        structuredCommands.push({
          type: parsedCommand.type as "fill" | "select" | "check",
          field: parsedCommand.selector,
          value: parsedCommand.value,
          required: true, // Default to required
          description: `${
            parsedCommand.type.charAt(0).toUpperCase() +
            parsedCommand.type.slice(1)
          } the ${parsedCommand.selector} field`,
        });
      }
    }

    console.log("Generated structured commands:");
    console.log(JSON.stringify(structuredCommands, null, 2));

    // Update the template with structured commands
    const updatedTemplate: CommandTemplate = {
      name: template.name,
      description: template.description,
      commands: structuredCommands as any,
    };

    // Update the domain config
    domainConfig.commands[templateIndex] = updatedTemplate;

    // Save to Firestore if confirmed
    const shouldSave = process.env.SAVE_COMMANDS === "true";
    if (shouldSave) {
      try {
        await firestoreService.saveDomainConfig(domainConfig);
        console.log(
          `Successfully updated template '${templateName}' for domain ${domain}`
        );
      } catch (error) {
        console.error(`Error updating domain config: ${error.message}`);
      }
    } else {
      console.log("Preview mode - changes not saved.");
      console.log("To save changes, run with:");
      console.log(
        "SAVE_COMMANDS=true npx playwright test tests/e2e/create-commands.spec.ts"
      );
    }
  });
});
