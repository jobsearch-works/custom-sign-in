import { test, expect, Page } from "@playwright/test";
import { CustomFirestoreService } from "../../src/services/CustomFirestoreService";
import { CommandTemplate, DomainConfig } from "../../src/common/types";
import * as fs from "fs";
import * as path from "path";

// Generic interface for form fillers
interface FormFiller {
  fillField(selector: string, value: string): Promise<void>;
  selectOption(selector: string, value: string): Promise<void>;
  checkBox(selector: string, value: boolean): Promise<void>;
  waitForElement(selector: string, timeout?: number): Promise<any>;
}

// Generic form filler implementation that works with Playwright
class GenericFormFiller implements FormFiller {
  constructor(private page: Page) {}

  async fillField(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.selectOption(selector, { label: value });
  }

  async checkBox(selector: string, value: boolean): Promise<void> {
    if (value) {
      await this.page.check(selector);
    } else {
      await this.page.uncheck(selector);
    }
  }

  async waitForElement(selector: string, timeout = 5000): Promise<any> {
    return await this.page.waitForSelector(selector, { timeout });
  }
}

// Factory function to get the form filler
function getFormFiller(page: Page): FormFiller {
  return new GenericFormFiller(page);
}

/**
 * A generic test function that can be used to test form filling on any job application page
 * It extracts the domain from the URL, fetches appropriate commands, and executes them
 */
async function testPageWithDomainCommands({
  page,
  url,
  mockCommands = null,
  reportPath = "./test-reports",
}: {
  page: Page;
  url: string;
  mockCommands?: any | null;
  reportPath?: string;
}): Promise<{ success: boolean; report: string }> {
  // Create report directory if it doesn't exist
  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(reportPath, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportFile = path.join(reportPath, `form-fill-report-${timestamp}.txt`);
  let report = `Form Fill Test Report\n`;
  report += `URL: ${url}\n`;
  report += `Timestamp: ${new Date().toISOString()}\n\n`;

  /**
   * Parse a command from either string format or object format
   */
  function parseCommand(cmdStr: any): {
    type: string;
    selector: string;
    value: any;
  } {
    if (!cmdStr) {
      logAndReport(`Invalid command: ${cmdStr}`);
      return { type: "unknown", selector: "", value: "" };
    }

    // Handle object-format commands (preferred)
    if (typeof cmdStr === "object" && !Array.isArray(cmdStr)) {
      // Direct structured format from Firestore
      if (cmdStr.type && cmdStr.field !== undefined) {
        return {
          type: cmdStr.type,
          selector: cmdStr.field, // Use field as selector key
          value: cmdStr.value,
        };
      }

      // Legacy format
      if (cmdStr.type && cmdStr.selector !== undefined) {
        return {
          type: cmdStr.type,
          selector: cmdStr.selector,
          value: cmdStr.value,
        };
      }
    }

    // Handle string-format commands (legacy)
    if (typeof cmdStr === "string") {
      // Format: "fill:email -> value=user@example.com"
      if (cmdStr.includes(" -> ")) {
        const [actionSelector, valueStr] = cmdStr.split(" -> ");
        const [type, selector] = actionSelector.split(":");
        const value = valueStr.split("=")[1];
        return { type, selector, value };
      }

      // Format: "fill:email=user@example.com"
      else if (cmdStr.includes(":") && cmdStr.includes("=")) {
        const [typeSelector, value] = cmdStr.split("=");
        const [type, selector] = typeSelector.split(":");
        return { type, selector, value };
      }
    }

    // Couldn't parse command
    logAndReport(`Unknown command format: ${JSON.stringify(cmdStr)}`);
    return { type: "unknown", selector: "", value: "" };
  }

  // Helper to log and add to report
  function logAndReport(message: string) {
    console.log(message);
    report += message + "\n";
  }

  try {
    // Navigate to the page
    logAndReport(`Navigating to ${url}`);
    await page.goto(url);

    // Take a screenshot of the initial page
    const screenshotPath = path.join(
      reportPath,
      `initial-page-${timestamp}.png`
    );
    await page.screenshot({ path: screenshotPath });
    logAndReport(`Initial page screenshot saved to ${screenshotPath}`);

    // Extract domain from URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    logAndReport(`Extracted domain: ${domain}`);

    // Initialize FirestoreService to fetch commands
    const firestoreService = new CustomFirestoreService();
    let domainConfig: DomainConfig | null = null;

    // Use mock commands if provided, otherwise fetch from Firestore
    if (mockCommands) {
      logAndReport("Using mock commands");
      domainConfig = {
        domain,
        selectors: {},
        commands: mockCommands.commands as CommandTemplate[],
        lastUpdated: new Date(),
        createdAt: new Date(),
      };
    } else {
      logAndReport(`Fetching commands for domain: ${domain}`);
      try {
        domainConfig = await firestoreService.getDomainConfig(domain);
      } catch (error) {
        logAndReport(`Error fetching domain config: ${error.message}`);
      }
    }

    if (!domainConfig) {
      logAndReport(
        "No domain configuration found. Skipping command execution."
      );
      return { success: false, report };
    }

    logAndReport(
      `Found domain configuration with ${domainConfig.commands.length} command templates`
    );

    // Try to find the apply button and click it if needed
    try {
      const applySelectors = [
        "text=Apply Now",
        'a:has-text("Apply")',
        'button:has-text("Apply")',
        ".jobs-apply-button",
        ".apply-button",
        "[data-automation='job-apply-button']",
      ];

      for (const applySelector of applySelectors) {
        const applyButton = page.locator(applySelector).first();
        if (await applyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          logAndReport(`Found Apply button with selector: ${applySelector}`);
          await applyButton.click();
          await page.waitForTimeout(2000);
          break;
        }
      }
    } catch (error) {
      logAndReport(
        `No Apply button found or error clicking it: ${error.message}`
      );
    }

    // Detecting form fields
    logAndReport("Detecting form fields...");

    // Create dynamic fieldSelectors object from Firestore
    const fieldSelectors: Record<string, string> = {};

    // Gather all form elements for reporting
    const inputs = await page.$$("input:visible");
    const textareas = await page.$$("textarea:visible");
    const selects = await page.$$("select:visible");
    logAndReport(
      `Found ${inputs.length} inputs, ${textareas.length} textareas, and ${selects.length} selects`
    );

    // Take screenshot of the form before filling
    const beforeFillFile = `test-reports/before-fill-${timestamp}.png`;
    await page.screenshot({ path: beforeFillFile });
    logAndReport(`Form screenshot saved to ${beforeFillFile}`);

    // Check if we have selectors in the domain config
    if (
      domainConfig.selectors &&
      Object.keys(domainConfig.selectors).length > 0
    ) {
      logAndReport(
        `Found ${
          Object.keys(domainConfig.selectors).length
        } selectors in domain config`
      );

      // Extract selectors for this domain
      for (const [field, selectorDef] of Object.entries(
        domainConfig.selectors
      )) {
        if (typeof selectorDef === "string") {
          fieldSelectors[field] = selectorDef;
        } else if (selectorDef && typeof selectorDef === "object") {
          // Use the selector with the appropriate type prefix if needed
          if (selectorDef.type === "css") {
            fieldSelectors[field] = selectorDef.selector;
          } else if (selectorDef.type === "xpath") {
            fieldSelectors[field] = `xpath=${selectorDef.selector}`;
          } else if (selectorDef.type === "text") {
            fieldSelectors[field] = `text=${selectorDef.selector}`;
          }
        }
      }

      logAndReport(`Using selectors: ${JSON.stringify(fieldSelectors)}`);
    } else {
      logAndReport(
        "No selectors found in domain config. Commands will use their own selectors."
      );
    }

    // Find form elements for potential custom mapping
    const formElements: Record<string, string[]> = {
      inputs: [],
      textareas: [],
      selects: [],
      checkboxes: [],
    };

    // Execute the first command list found instead of looking for specific names
    const commandList = domainConfig.commands[0];

    if (
      !commandList ||
      !commandList.commands ||
      commandList.commands.length === 0
    ) {
      logAndReport("No command list found or command list is empty.");
      return { success: false, report };
    }

    logAndReport(
      `Using command list: ${commandList.name} with ${commandList.commands.length} commands`
    );
    logAndReport(
      `Command list format: ${
        typeof commandList.commands[0] === "string" ? "string" : "object"
      }`
    );

    // Create appropriate form filler based on the platform
    const formFiller = getFormFiller(page);

    // Execute commands one by one
    let executedCommands = 0;
    let failedCommands = 0;

    for (const cmdStr of commandList.commands) {
      // Parse the command string
      const command = parseCommand(cmdStr);

      if (command.type === "unknown") {
        logAndReport(
          `Skipping unknown command format: ${JSON.stringify(cmdStr)}`
        );
        failedCommands++;
        continue;
      }

      logAndReport(`\nExecuting command: ${command.type.toUpperCase()}`);
      logAndReport(`Field: ${command.selector}`);
      logAndReport(`Value: ${command.value}`);

      // Get the selector from our field selectors map or use the command's selector directly
      const selector = fieldSelectors[command.selector] || command.selector;

      if (selector !== command.selector) {
        logAndReport(`Resolved selector: ${selector} (from field mapping)`);
      } else {
        logAndReport(`Using direct selector: ${selector}`);
      }

      try {
        // Wait briefly to allow the page to settle
        await page.waitForTimeout(500);

        if (command.type === "fill") {
          try {
            // First check if the element exists
            const element = await page.$(selector);
            if (!element) {
              logAndReport(`⚠️ Element not found: ${selector}`);
              failedCommands++;
              continue;
            }

            await formFiller.fillField(selector, command.value);
            logAndReport(`✅ Filled ${selector} with "${command.value}"`);
            executedCommands++;
          } catch (error) {
            logAndReport(
              `❌ Error filling field ${selector}: ${error.message}`
            );
            failedCommands++;
          }
        } else if (command.type === "select") {
          try {
            const element = await page.$(selector);
            if (!element) {
              logAndReport(`⚠️ Element not found: ${selector}`);
              failedCommands++;
              continue;
            }

            await formFiller.selectOption(selector, command.value);
            logAndReport(
              `✅ Selected option "${command.value}" from ${selector}`
            );
            executedCommands++;
          } catch (error) {
            logAndReport(
              `❌ Error selecting ${command.value} from ${selector}: ${error.message}`
            );
            failedCommands++;
          }
        } else if (command.type === "check") {
          try {
            const element = await page.$(selector);
            if (!element) {
              logAndReport(`⚠️ Element not found: ${selector}`);
              failedCommands++;
              continue;
            }

            await formFiller.checkBox(
              selector,
              command.value === true || command.value === "true"
            );
            logAndReport(`✅ Set checkbox ${selector} to ${command.value}`);
            executedCommands++;
          } catch (error) {
            logAndReport(
              `❌ Error setting checkbox ${selector}: ${error.message}`
            );
            failedCommands++;
          }
        } else {
          logAndReport(`⚠️ Unsupported command type: ${command.type}`);
          failedCommands++;
        }
      } catch (error) {
        logAndReport(`❌ Failed to execute command: ${error.message}`);
        failedCommands++;
      }
    }

    // Take a screenshot after filling the form
    const afterFillScreenshot = path.join(
      reportPath,
      `after-fill-${timestamp}.png`
    );
    await page.screenshot({ path: afterFillScreenshot });
    logAndReport(
      `Form after filling screenshot saved to ${afterFillScreenshot}`
    );

    // Summary
    logAndReport(`\nExecution Summary:`);
    logAndReport(`Total commands: ${commandList.commands.length}`);
    logAndReport(`Successfully executed: ${executedCommands}`);
    logAndReport(`Failed: ${failedCommands}`);

    // Write report to file
    fs.writeFileSync(reportFile, report);
    logAndReport(`Report saved to ${reportFile}`);

    return {
      success: failedCommands === 0,
      report,
    };
  } catch (error) {
    logAndReport(`Test failed with error: ${error.message}`);
    // Write report to file even when failed
    fs.writeFileSync(reportFile, report);
    return {
      success: false,
      report,
    };
  }
}

// Test cases that use the generic test function
test.describe("Generic Form Automation Test", () => {
  // Set a longer timeout for all tests in this file - form filling can take time
  test.setTimeout(120000);

  test("Execute domain form commands from Firestore", async ({ page }) => {
    // Get URL from environment variable only, with no fallback
    const url = process.env.FORM_URL;
    if (!url) {
      console.log("No FORM_URL environment variable set, skipping test");
      test.skip();
      return;
    }

    console.log(`Testing URL: ${url}`);

    const result = await testPageWithDomainCommands({
      page,
      url,
      // No mockCommands - will use only Firestore
    });

    // Log the complete report
    console.log(result.report);

    // If no commands were found, extract domain and suggest creating a schema
    if (result.report.includes("No domain configuration found")) {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      console.log(
        `No commands found in Firestore for ${domain} - please initialize the domain first using the save-schema command`
      );

      // Suggest how to initialize the domain
      console.log("\nTo save a schema for this domain, run:");
      console.log(
        `npm run save-schema -- -f ./schemas/${domain.replace(/\./g, "_")}.json`
      );
    }
  });

  test("Custom URL test from environment variable", async ({ page }) => {
    // This test can be used with any URL passed as a parameter
    const url = process.env.TEST_URL;
    if (!url) {
      console.log("No TEST_URL environment variable set, skipping test");
      test.skip();
      return;
    }

    console.log(`Testing URL from environment: ${url}`);
    const result = await testPageWithDomainCommands({
      page,
      url,
      // No mockCommands - will use only Firestore
    });

    console.log(result.report);

    // Extract domain for suggestion
    const urlObj = new URL(url);
    const extractedDomain = urlObj.hostname;

    if (result.report.includes("No domain configuration found")) {
      console.log(
        `No commands found in Firestore for ${extractedDomain} - please initialize the domain first using the save-schema command`
      );

      // Suggest how to initialize the domain
      console.log("\nTo save a schema for this domain, run:");
      console.log(
        `npm run save-schema -- -f ./schemas/${extractedDomain.replace(
          /\./g,
          "_"
        )}.json`
      );
    }
  });

  test("Initialize a domain if needed", async ({ page }) => {
    test.skip(
      !process.env.INITIALIZE_DOMAIN,
      "Skipping domain initialization. Set INITIALIZE_DOMAIN=true to run"
    );

    // This test can be used to initialize a domain in Firestore
    const url = process.env.TEST_URL;
    if (!url) {
      console.log("No TEST_URL environment variable set, skipping test");
      test.skip();
      return;
    }

    // Extract domain from URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    console.log(`Checking domain configuration for: ${domain}`);

    // Initialize the FirestoreService
    const firestoreService = new CustomFirestoreService();

    // Check if domain exists
    const existingDomain = await firestoreService.getDomainConfig(domain);
    if (existingDomain) {
      console.log(`Domain ${domain} already exists`);

      // Print existing command templates
      console.log("Current command templates:");
      for (const template of existingDomain.commands) {
        console.log(`- ${template.name}: ${template.commands.length} commands`);
      }
    } else {
      try {
        // Initialize the domain as generic
        await firestoreService.initializeDomain(domain);
        console.log(`Successfully initialized domain ${domain}`);
        console.log("Domain initialized with no command templates");
        console.log("Use the save-schema command to add command templates:");
        console.log(
          `npm run save-schema -- -f ./schemas/${domain.replace(
            /\./g,
            "_"
          )}.json`
        );
      } catch (error) {
        console.error(`Error initializing domain: ${error.message}`);
      }
    }

    // Test the domain
    const result = await testPageWithDomainCommands({
      page,
      url,
    });

    console.log(result.report);
  });
});
