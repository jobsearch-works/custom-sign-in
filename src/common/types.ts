/**
 * Types of selectors supported
 */
export type SelectorType = "css" | "xpath" | "text";

/**
 * Base selector definition
 */
export interface SelectorDefinition {
  selector: string;
  description: string;
  type: SelectorType;
  optional?: boolean;
}

/**
 * Structured command format for modern commands
 */
export interface StructuredCommand {
  type: "fill" | "select" | "check";
  field: string;
  value: string | boolean;
  required?: boolean;
  description?: string;
}

/**
 * Command template for storing reusable commands
 */
export interface CommandTemplate {
  name: string;
  description: string;
  commands: string[] | StructuredCommand[];
}

/**
 * Test URL definition for domain testing
 */
export interface TestUrl {
  url: string;
  description: string;
  commandList?: string;
  status?: "pending" | "success" | "failed";
}

/**
 * Test history record
 */
export interface TestHistoryRecord {
  url: string;
  timestamp: Date;
  status: "success" | "failed";
  executedCommands: number;
  failedCommands: number;
  reportFile?: string;
}

/**
 * Domain configuration stored in Firestore
 */
export interface DomainConfig {
  domain: string;
  selectors: Record<string, SelectorDefinition>;
  commands: CommandTemplate[];
  testUrls?: TestUrl[];
  testHistory?: TestHistoryRecord[];
  lastUpdated?: Date;
  createdAt?: Date;
}

/**
 * Chrome extension message types
 */
export type MessageType =
  | "EXECUTE_TEMPLATE"
  | "ADD_TEMPLATE"
  | "ADD_SELECTOR"
  | "INITIALIZE_DOMAIN"
  | "GET_DOMAIN_CONFIG";

/**
 * Base message interface
 */
export interface ExtensionMessage {
  type: MessageType;
}

/**
 * Execute template message
 */
export interface ExecuteTemplateMessage extends ExtensionMessage {
  type: "EXECUTE_TEMPLATE";
  templateName: string;
}

/**
 * Add template message
 */
export interface AddTemplateMessage extends ExtensionMessage {
  type: "ADD_TEMPLATE";
  name: string;
  description: string;
  commands: string[];
}

/**
 * Add selector message
 */
export interface AddSelectorMessage extends ExtensionMessage {
  type: "ADD_SELECTOR";
  key: string;
  definition: SelectorDefinition;
}

/**
 * Initialize domain message
 */
export interface InitializeDomainMessage extends ExtensionMessage {
  type: "INITIALIZE_DOMAIN";
}

/**
 * Get domain config message
 */
export interface GetDomainConfigMessage extends ExtensionMessage {
  type: "GET_DOMAIN_CONFIG";
}

/**
 * Union type of all possible extension messages
 */
export type ExtensionMessageTypes =
  | ExecuteTemplateMessage
  | AddTemplateMessage
  | AddSelectorMessage
  | InitializeDomainMessage
  | GetDomainConfigMessage;

/**
 * Response from extension messages
 */
export interface ExtensionResponse {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Command types for the selector DSL
 */
export type CommandType =
  | "fill" // Fill an input field
  | "click" // Click an element
  | "select" // Select an option
  | "check" // Check/uncheck a checkbox
  | "upload" // Upload a file
  | "wait" // Wait for an element
  | "verify"; // Verify element state

/**
 * Base interface for all commands
 */
export interface BaseCommand {
  type: CommandType;
  selector: string;
  platform?: string; // Optional platform property for backward compatibility
}

/**
 * Fill command for input fields
 */
export interface FillCommand extends BaseCommand {
  type: "fill";
  value: string;
}

/**
 * Click command for buttons and links
 */
export interface ClickCommand extends BaseCommand {
  type: "click";
}

/**
 * Select command for dropdowns
 */
export interface SelectCommand extends BaseCommand {
  type: "select";
  value: string;
}

/**
 * Check command for checkboxes
 */
export interface CheckCommand extends BaseCommand {
  type: "check";
  value: boolean;
}

/**
 * Upload command for file inputs
 */
export interface UploadCommand extends BaseCommand {
  type: "upload";
  file: File;
}

/**
 * Wait command for elements
 */
export interface WaitCommand extends BaseCommand {
  type: "wait";
  timeout?: number;
}

/**
 * Verify command for element state
 */
export interface VerifyCommand extends BaseCommand {
  type: "verify";
  state: "visible" | "hidden" | "enabled" | "disabled" | "checked";
}

/**
 * Union type of all possible commands
 */
export type Command =
  | FillCommand
  | ClickCommand
  | SelectCommand
  | CheckCommand
  | UploadCommand
  | WaitCommand
  | VerifyCommand;

// Export DomainConfigClass
export class DomainConfigClass implements DomainConfig {
  domain: string;
  selectors: Record<string, SelectorDefinition>;
  commands: CommandTemplate[];
  createdAt?: Date;
  lastUpdated?: Date;

  constructor(data: DomainConfig) {
    this.domain = data.domain;
    this.selectors = data.selectors;
    this.commands = data.commands;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
    this.lastUpdated = data.lastUpdated
      ? new Date(data.lastUpdated)
      : undefined;
  }
}
