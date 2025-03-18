/**
 * Interface for selector definitions
 */
export interface SelectorDefinition {
  selector: string;
  description: string;
  platform: string;
  type: "css" | "xpath" | "text";
  optional?: boolean;
}

/**
 * Registry for managing selectors across different platforms
 */
export class SelectorRegistry {
  private selectors: Map<string, SelectorDefinition>;

  constructor() {
    this.selectors = new Map();
  }

  /**
   * Register a new selector
   */
  register(key: string, definition: SelectorDefinition): void {
    this.selectors.set(key, definition);
  }

  /**
   * Get a selector by its key
   */
  get(key: string): SelectorDefinition | undefined {
    return this.selectors.get(key);
  }

  /**
   * Get all selectors for a specific platform
   */
  getPlatformSelectors(platform: string): Map<string, SelectorDefinition> {
    const result = new Map();
    for (const [key, def] of this.selectors.entries()) {
      if (def.platform === platform) {
        result.set(key, def);
      }
    }
    return result;
  }

  /**
   * Remove a selector
   */
  remove(key: string): boolean {
    return this.selectors.delete(key);
  }

  /**
   * Clear all selectors
   */
  clear(): void {
    this.selectors.clear();
  }

  /**
   * Check if a selector exists
   */
  has(key: string): boolean {
    return this.selectors.has(key);
  }

  /**
   * Update an existing selector
   */
  update(key: string, definition: Partial<SelectorDefinition>): boolean {
    const existing = this.selectors.get(key);
    if (!existing) return false;

    this.selectors.set(key, { ...existing, ...definition });
    return true;
  }
}
