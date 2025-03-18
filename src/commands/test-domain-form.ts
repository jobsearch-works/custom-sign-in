#!/usr/bin/env node

import { Command } from "commander";
import { spawn } from "child_process";
import * as path from "path";

const program = new Command();

program
  .name("test-domain-form")
  .description("Test form automation for a specific domain")
  .version("1.0.0")
  .argument("<url>", "Form URL to test")
  .option("-h, --headless", "Run in headless mode", false)
  .option("-d, --debug", "Output additional debugging information", false)
  .action((url, options) => {
    console.log(`Testing form at URL: ${url}`);

    const args = ["test", "-g", "Execute domain form commands from Firestore"];

    if (!options.headless) {
      args.push("--headed");
    }

    if (options.debug) {
      args.push("--debug");
    }

    // Set up environment variables
    const env = {
      ...process.env,
      FORM_URL: url,
    };

    // Use Playwright to run the test
    const playwrightProcess = spawn("npx", ["playwright"].concat(args), {
      env,
      stdio: "inherit",
      shell: true,
    });

    playwrightProcess.on("close", (code) => {
      console.log(`Test exited with code ${code}`);
    });
  });

program.parse(process.argv);
