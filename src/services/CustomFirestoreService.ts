import { FirestoreService as FirestoreClientService } from "@serge-ivo/firestore-client";
import {
  DomainConfig,
  CommandTemplate,
  SelectorDefinition,
  DomainConfigClass,
  StructuredCommand,
} from "../common/types";

require("dotenv").config(); // Load environment variables from .env

// Initialize the FirestoreClientService with your Firebase config
FirestoreClientService.initialize({
  projectId: process.env.FIREBASE_PROJECT_ID,
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Define FilterOperator locally
type FilterOperator =
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "array-contains"
  | "in"
  | "array-contains-any"
  | "not-in";

// Define QueryOptions locally
interface QueryOptions {
  where?: Array<{
    field: string;
    op: FilterOperator;
    value: any;
  }>;
  orderBy?: Array<{
    field: string;
    direction?: "asc" | "desc";
  }>;
  limit?: number;
}

/**
 * Service for managing selectors and commands in Firestore
 */
export class CustomFirestoreService {
  /**
   * Save or update a domain configuration
   */
  async saveDomainConfig(config: DomainConfig): Promise<void> {
    const domainRef = `domains/${this.normalizeDomain(config.domain)}`;
    const now = new Date();

    if (!config.createdAt) {
      config.createdAt = now;
    }
    config.lastUpdated = now;

    await FirestoreClientService.setDocument(domainRef, config, {
      merge: true,
    });
  }

  /**
   * Get configuration for a specific domain
   */
  async getDomainConfig(domain: string): Promise<DomainConfig | null> {
    const domainRef = `domains/${this.normalizeDomain(domain)}`;
    const docSnap = await FirestoreClientService.getDocument(domainRef);
    if (!docSnap) return null;

    const data = docSnap as DomainConfig;
    data.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
    data.lastUpdated = data.lastUpdated
      ? new Date(data.lastUpdated)
      : undefined;
    return data;
  }

  /**
   * Get domains by platform
   * @deprecated Platform is no longer used in the generic approach
   */
  async getDomainsByPlatform(platform: string): Promise<DomainConfig[]> {
    const queryOptions: QueryOptions = {
      where: [
        {
          field: "platform",
          op: "==",
          value: platform,
        },
      ],
      orderBy: [{ field: "lastUpdated", direction: "desc" }],
    };
    const querySnapshot = await FirestoreClientService.queryCollection(
      DomainConfigClass,
      "domains",
      queryOptions
    );
    return querySnapshot;
  }

  /**
   * Get recently updated domains
   */
  async getRecentDomains(limit_count: number = 10): Promise<DomainConfig[]> {
    const queryOptions: QueryOptions = {
      orderBy: [{ field: "lastUpdated", direction: "desc" }],
      limit: limit_count,
    };
    const querySnapshot = await FirestoreClientService.queryCollection(
      DomainConfigClass,
      "domains",
      queryOptions
    );

    return querySnapshot.map((doc: any) => {
      const data = doc as DomainConfig;
      data.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
      data.lastUpdated = data.lastUpdated
        ? new Date(data.lastUpdated)
        : undefined;
      return data;
    });
  }

  /**
   * Add a new selector to a domain configuration
   */
  async addSelector(
    domain: string,
    key: string,
    definition: SelectorDefinition
  ): Promise<void> {
    const config = await this.getDomainConfig(domain);
    if (!config) {
      throw new Error(`No configuration found for domain: ${domain}`);
    }

    config.selectors[key] = definition;
    await this.saveDomainConfig(config);
  }

  /**
   * Update an existing selector
   */
  async updateSelector(
    domain: string,
    key: string,
    definition: Partial<SelectorDefinition>
  ): Promise<void> {
    const config = await this.getDomainConfig(domain);
    if (!config) {
      throw new Error(`No configuration found for domain: ${domain}`);
    }

    if (!config.selectors[key]) {
      throw new Error(`Selector not found: ${key}`);
    }

    config.selectors[key] = { ...config.selectors[key], ...definition };
    await this.saveDomainConfig(config);
  }

  /**
   * Delete a selector
   */
  async deleteSelector(domain: string, key: string): Promise<void> {
    const config = await this.getDomainConfig(domain);
    if (!config) {
      throw new Error(`No configuration found for domain: ${domain}`);
    }

    delete config.selectors[key];
    await this.saveDomainConfig(config);
  }

  /**
   * Add a new command template to a domain configuration
   */
  async addCommandTemplate(
    domain: string,
    template: CommandTemplate
  ): Promise<void> {
    const config = await this.getDomainConfig(domain);
    if (!config) {
      throw new Error(`No configuration found for domain: ${domain}`);
    }

    // Make sure template.commands is compatible with both string[] and StructuredCommand[]
    config.commands.push(template);
    await this.saveDomainConfig(config);
  }

  /**
   * Update an existing command template
   */
  async updateCommandTemplate(
    domain: string,
    templateName: string,
    updates: Partial<CommandTemplate>
  ): Promise<void> {
    const config = await this.getDomainConfig(domain);
    if (!config) {
      throw new Error(`No configuration found for domain: ${domain}`);
    }

    const templateIndex = config.commands.findIndex(
      (t) => t.name === templateName
    );
    if (templateIndex === -1) {
      throw new Error(`Template not found: ${templateName}`);
    }

    config.commands[templateIndex] = {
      ...config.commands[templateIndex],
      ...updates,
    };
    await this.saveDomainConfig(config);
  }

  /**
   * Delete a command template
   */
  async deleteCommandTemplate(
    domain: string,
    templateName: string
  ): Promise<void> {
    const config = await this.getDomainConfig(domain);
    if (!config) {
      throw new Error(`No configuration found for domain: ${domain}`);
    }

    config.commands = config.commands.filter((t) => t.name !== templateName);
    await this.saveDomainConfig(config);
  }

  /**
   * Initialize a new domain configuration
   */
  async initializeDomain(domain: string): Promise<void> {
    const config: DomainConfig = {
      domain: this.normalizeDomain(domain),
      selectors: {},
      commands: [],
    };
    await this.saveDomainConfig(config);
  }

  /**
   * Delete a domain configuration
   */
  async deleteDomain(domain: string): Promise<void> {
    const domainRef = `domains/${this.normalizeDomain(domain)}`;
    await FirestoreClientService.deleteDocument(domainRef);
  }

  /**
   * Normalize a domain name for consistent storage
   */
  private normalizeDomain(domain: string): string {
    return domain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
  }
}
