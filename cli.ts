#!/usr/bin/env node

import { Command } from "commander";
import { CustomFirestoreService } from "./dist/services/CustomFirestoreService";
import { FirestoreService as FirestoreClientService } from "@serge-ivo/firestore-client";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

// In-memory storage for command lists
const commandStorage: Map<string, string[]> = new Map();

// Initialize CustomFirestoreService with your Firebase config from .env
FirestoreClientService.initialize({
  apiKey: process.env.FIREBASE_API_KEY!,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.FIREBASE_APP_ID!,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID!,
});

// Function to execute stored commands
async function executeStoredCommands(commandKey: string): Promise<void> {
  console.log(`Executing commands for key: ${commandKey}`);
  // Add your command execution logic here
}

// Function to store commands in Firestore
async function storeCommands(
  commandKey: string,
  commands: string[]
): Promise<void> {
  try {
    await FirestoreClientService.setDocument(`commands/${commandKey}`, {
      commands,
    });
    console.log(`Commands stored in Firestore for key: ${commandKey}`);
  } catch (error) {
    console.error("Error storing commands in Firestore:", error);
  }
}

// Function to store a command list in Firestore
async function storeCommandList(
  domain: string,
  listName: string,
  commands: any[]
): Promise<void> {
  try {
    const firestoreService = new CustomFirestoreService();
    // This method needs to be implemented in CustomFirestoreService
    await firestoreService.addCommandTemplate(domain, {
      name: listName,
      description: `Command list for ${listName} on ${domain}`,
      commands,
    });
    console.log(`Command list '${listName}' saved for domain: ${domain}`);
  } catch (error) {
    console.error("Error storing command list in Firestore:", error);
  }
}

const program = new Command();

program.version("1.0.0").description("Command List Executor");

program
  .command("execute <commandKey>")
  .description("Execute a stored command list")
  .action((commandKey: string) => {
    executeStoredCommands(commandKey);
  });

program
  .command("store <commandKey>")
  .description("Store a command list")
  .action(async (commandKey: string) => {
    const greenhouseCommands = [
      `fill:email@greenhouse -> value="user@greenhouse.com"`,
      `fill:password@greenhouse -> value="SecurePassword!"`,
      `check:terms@greenhouse -> value=true`,
    ];
    await storeCommands(commandKey, greenhouseCommands);
  });

program
  .command("initialize-domain <domain>")
  .description("Initialize a domain configuration")
  .action(async (domain: string) => {
    try {
      const firestoreService = new CustomFirestoreService();
      await firestoreService.initializeDomain(domain);
      console.log(`Domain configuration initialized for: ${domain}`);
    } catch (error) {
      console.error("Error initializing domain configuration:", error);
    }
  });

program
  .command("store-list <domain> <listName>")
  .description("Store a command list for a specific domain")
  .action(async (domain: string, listName: string) => {
    const commandList = [
      { type: "fill", selector: "email", value: "user@example.com" },
      { type: "fill", selector: "password", value: "SecurePassword!" },
      { type: "check", selector: "terms", value: true },
    ];
    await storeCommandList(domain, listName, commandList);
  });

const [, , command, domain, commands] = process.argv;
if (command === "store-commands") {
  storeCommands(domain, commands.split(","));
}

program.parse(process.argv);
