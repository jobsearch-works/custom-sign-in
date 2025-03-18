import { test, expect } from "@playwright/test";
import { GreenhouseAccountFiller } from "../../src/greenhouse/GreenhouseAccountFiller";
import { CustomFirestoreService } from "../../src/services/CustomFirestoreService";
import { CommandTemplate, Platform } from "../../src/common/types";

test("should fetch and execute commands for greenhouse.io domain", async ({
  page,
}) => {
  // Define our test data with string commands to match the CommandTemplate interface
  const mockCommands = {
    commands: [
      {
        name: "sign-in",
        description: "Command list for sign-in on greenhouse.io",
        commands: [
          "fill:first_name -> value=John",
          "fill:last_name -> value=Doe",
          "fill:email -> value=user@example.com",
          "fill:phone -> value=+1234567890",
          "fill:python_experience -> value=I have 5 years of experience with Python and C++ in algorithmic trading.",
          "select:location -> value=Asia",
          "fill:visa -> value=No visa sponsorship required.",
          "fill:residential_location -> value=Yes, I will work from my current location.",
        ],
      },
    ],
  };

  // Helper to parse command strings
  function parseCommand(cmdStr: string): {
    type: string;
    selector: string;
    value: any;
  } {
    const [actionPart, valuePart] = cmdStr.split(" -> ");
    const [type, selector] = actionPart.split(":");
    const value = valuePart.split("=")[1];
    return {
      type,
      selector,
      value: type === "check" ? value === "true" : value,
    };
  }

  // Mock the getDomainConfig method with correct Platform type
  const firestoreService = new CustomFirestoreService();
  const getDomainConfigOriginal = firestoreService.getDomainConfig;
  firestoreService.getDomainConfig = async (domain: string) => {
    return {
      domain: "greenhouse.io",
      platform: "greenhouse" as Platform,
      selectors: {},
      commands: mockCommands.commands as CommandTemplate[],
      lastUpdated: new Date(),
      createdAt: new Date(),
    };
  };

  try {
    // Navigate to the Greenhouse job application page
    await page.goto("https://boards.greenhouse.io/aurosglobal/jobs/4493809005");

    // Take a screenshot to debug what's on the page
    await page.screenshot({ path: "greenhouse-initial-page.png" });

    console.log("Current URL:", page.url());
    console.log("Page title:", await page.title());

    // Check if we need to click Apply button
    try {
      const applyButton = page.getByRole("link", { name: "Apply Now" });
      if (await applyButton.isVisible({ timeout: 5000 })) {
        console.log("Found Apply Now button, clicking it");
        await applyButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log("Apply button not found or not needed, proceeding to form");
    }

    // Wait for the form to be visible
    await page.waitForSelector("form#application_form", { timeout: 10000 });

    // Map field identifiers to actual selectors based on the HTML structure
    const fieldSelectors = {
      first_name: '#first_name, input[name="job_application[first_name]"]',
      last_name: '#last_name, input[name="job_application[last_name]"]',
      email: '#email, input[name="job_application[email]"]',
      phone: '#phone, input[name="job_application[phone]"]',
      python_experience: "#job_application_answers_attributes_0_text_value",
      location:
        "#job_application_answers_attributes_1_answer_selected_options_attributes_1_question_option_id",
      visa: "#job_application_answers_attributes_2_text_value",
      residential_location: "#job_application_answers_attributes_3_text_value",
    };

    // Fetch domain configuration from Firestore
    const domainConfig = await firestoreService.getDomainConfig(
      "greenhouse.io"
    );
    expect(domainConfig).not.toBeNull();

    // Find the sign-in command list
    const signInCommands = domainConfig?.commands.find(
      (cmd) => cmd.name === "sign-in"
    );
    expect(signInCommands).toBeDefined();

    // Initialize the Greenhouse form filler
    const formFiller = new GreenhouseAccountFiller();

    // Execute commands one by one
    if (signInCommands) {
      for (const cmdStr of signInCommands.commands) {
        // Parse the command string
        const command = parseCommand(cmdStr);
        console.log(
          `Executing command: ${command.type} - ${command.selector} - ${command.value}`
        );

        const selector = fieldSelectors[command.selector] || command.selector;

        if (command.type === "fill") {
          // Handle fill command
          try {
            await page.fill(selector, command.value);
            console.log(`Filled ${selector} with "${command.value}"`);
          } catch (error) {
            console.error(`Error filling ${selector}:`, error);
          }
        } else if (command.type === "select") {
          // Handle dropdown selection
          try {
            // First click to open the dropdown
            await page.click(".select2-choice");
            // Then select the option by visible text
            await page.click(`.select2-results li:text-is("${command.value}")`);
            console.log(`Selected ${command.value} from dropdown`);
          } catch (error) {
            console.error(`Error selecting ${command.value}:`, error);
          }
        } else if (command.type === "check") {
          // Handle checkbox command
          try {
            if (command.value) {
              await page.check(selector);
            } else {
              await page.uncheck(selector);
            }
            console.log(`Set checkbox ${selector} to ${command.value}`);
          } catch (error) {
            console.error(`Error setting checkbox ${selector}:`, error);
          }
        }
      }
    }

    // Take a screenshot of the filled form
    await page.screenshot({ path: "greenhouse-form-filled.png" });
  } finally {
    // Always restore original method
    firestoreService.getDomainConfig = getDomainConfigOriginal;
  }
});
