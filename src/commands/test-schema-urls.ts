#!/usr/bin/env node

import { Command } from "commander";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { CustomFirestoreService } from "../services/CustomFirestoreService";
import { TestHistoryRecord, TestUrl } from "../common/types";

const program = new Command();

program
  .name("test-schema-urls")
  .description("Test URLs specified in a domain schema")
  .version("1.0.0")
  .argument("[domain]", "Domain name to test (e.g., boards.greenhouse.io)")
  .option("-u, --url <url>", "Test a specific URL from the schema")
  .option("-f, --failed-only", "Only run tests that previously failed", false)
  .option("-h, --headless", "Run in headless mode", false)
  .option("-p, --parallel <number>", "Number of parallel tests to run", "1")
  .option("--no-history", "Do not update test history", false)
  .action(async (domain, options) => {
    console.log("Schema URL Testing Tool");
    console.log("======================");

    if (!domain) {
      console.log("No domain specified. Listing available domains...");
      await listAvailableDomains();
      return;
    }

    console.log(`Testing for domain: ${domain}`);

    try {
      // Get domain configuration from Firestore
      const firestoreService = new CustomFirestoreService();
      const domainConfig = await firestoreService.getDomainConfig(domain);

      if (!domainConfig) {
        console.error(`Error: No configuration found for domain ${domain}`);
        process.exit(1);
      }

      if (!domainConfig.testUrls || domainConfig.testUrls.length === 0) {
        console.error(
          `Error: No test URLs defined in schema for domain ${domain}`
        );
        process.exit(1);
      }

      console.log(`Found ${domainConfig.testUrls.length} test URLs in schema`);

      // Filter URLs based on options
      let urlsToTest = [...domainConfig.testUrls];

      if (options.url) {
        urlsToTest = urlsToTest.filter(
          (testUrl) => testUrl.url === options.url
        );
        if (urlsToTest.length === 0) {
          console.error(
            `Error: URL ${options.url} not found in schema test URLs`
          );
          process.exit(1);
        }
      }

      if (options.failedOnly) {
        if (
          !domainConfig.testHistory ||
          domainConfig.testHistory.length === 0
        ) {
          console.log("No test history found. Running all tests.");
        } else {
          // Get the most recent test result for each URL
          const latestResults = new Map<string, TestHistoryRecord>();
          domainConfig.testHistory.forEach((record) => {
            const existing = latestResults.get(record.url);
            if (!existing || record.timestamp > existing.timestamp) {
              latestResults.set(record.url, record);
            }
          });

          // Filter URLs that failed in their most recent test
          const failedUrls = new Set<string>();
          latestResults.forEach((record, url) => {
            if (record.status === "failed") {
              failedUrls.add(url);
            }
          });

          if (failedUrls.size === 0) {
            console.log("No failed tests found in history. Exiting.");
            return;
          }

          urlsToTest = urlsToTest.filter((testUrl) =>
            failedUrls.has(testUrl.url)
          );
          console.log(`Running ${urlsToTest.length} previously failed tests`);
        }
      }

      // Prepare parallel execution
      const parallelCount = parseInt(options.parallel, 10);
      const chunks = chunkArray(urlsToTest, parallelCount);

      // Execute tests in chunks
      for (const chunk of chunks) {
        await Promise.all(
          chunk.map((testUrl) => runTest(testUrl, domainConfig.domain, options))
        );
      }

      console.log("All tests completed");
    } catch (error) {
      console.error("Error running tests:", error);
      process.exit(1);
    }
  });

async function listAvailableDomains() {
  const firestoreService = new CustomFirestoreService();
  const domains = await firestoreService.getRecentDomains(20);

  console.log("\nAvailable domains with test URLs:");
  console.log("================================");

  for (const domain of domains) {
    // Type guard for domain.testUrls
    const testUrls = domain.testUrls || [];
    const hasTestUrls = testUrls.length > 0;

    console.log(
      `- ${domain.domain}${
        hasTestUrls ? ` (${testUrls.length} test URLs)` : " (no test URLs)"
      }`
    );

    if (hasTestUrls) {
      testUrls.forEach((testUrl, index) => {
        console.log(`  ${index + 1}. ${testUrl.description}`);
        console.log(`     ${testUrl.url}`);
      });
    }
  }

  console.log("\nTo run tests for a domain:");
  console.log("  test-schema-urls <domain>");
}

async function runTest(
  testUrl: TestUrl,
  domain: string,
  options: any
): Promise<TestHistoryRecord> {
  console.log(`Testing: ${testUrl.description}`);
  console.log(`URL: ${testUrl.url}`);

  const timestamp = new Date();
  const reportFileName = `form-fill-report-${domain.replace(
    /\./g,
    "-"
  )}-${timestamp.toISOString().replace(/[:.]/g, "-")}.txt`;

  // Set up environment variables
  const env = {
    ...process.env,
    FORM_URL: testUrl.url,
    REPORT_FILE: reportFileName,
  };

  // Build test command args
  const args = ["test", "-g", "Execute domain form commands from Firestore"];

  if (!options.headless) {
    args.push("--headed");
  }

  return new Promise((resolve) => {
    // Use Playwright to run the test
    const playwrightProcess = spawn("npx", ["playwright"].concat(args), {
      env,
      stdio: "inherit",
      shell: true,
    });

    playwrightProcess.on("close", async (code) => {
      const success = code === 0;
      const status = success ? "success" : "failed";

      console.log(`Test completed with status: ${status} (exit code: ${code})`);

      // Create history record
      const historyRecord: TestHistoryRecord = {
        url: testUrl.url,
        timestamp,
        status,
        executedCommands: 0, // These should be parsed from the test report
        failedCommands: 0,
        reportFile: reportFileName,
      };

      // Try to parse the report file to get command execution counts
      try {
        const reportPath = path.join(
          process.cwd(),
          "test-reports",
          reportFileName
        );
        if (fs.existsSync(reportPath)) {
          const report = fs.readFileSync(reportPath, "utf8");

          // Extract executed and failed command counts
          const executedMatch = report.match(/Successfully executed: (\d+)/);
          const failedMatch = report.match(/Failed: (\d+)/);

          if (executedMatch) {
            historyRecord.executedCommands = parseInt(executedMatch[1], 10);
          }

          if (failedMatch) {
            historyRecord.failedCommands = parseInt(failedMatch[1], 10);
          }
        }
      } catch (error) {
        console.warn("Could not parse test report:", error);
      }

      // Update test history if requested
      if (options.history !== false) {
        try {
          const firestoreService = new CustomFirestoreService();
          const domainConfig = await firestoreService.getDomainConfig(domain);

          if (domainConfig) {
            if (!domainConfig.testHistory) {
              domainConfig.testHistory = [];
            }

            domainConfig.testHistory.push(historyRecord);

            // Update the testUrls array with latest status
            if (domainConfig.testUrls) {
              domainConfig.testUrls = domainConfig.testUrls.map((tu) => {
                if (tu.url === testUrl.url) {
                  return { ...tu, status };
                }
                return tu;
              });
            }

            await firestoreService.saveDomainConfig(domainConfig);
            console.log("Test history updated");
          }
        } catch (error) {
          console.error("Error updating test history:", error);
        }
      }

      resolve(historyRecord);
    });
  });
}

function chunkArray<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [array];

  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

program.parse(process.argv);
