import { Command, CommandType } from "./types";
import { SelectorRegistry } from "./SelectorRegistry";

/**
 * Parser for the selector DSL commands
 */
export class CommandParser {
  constructor(private registry: SelectorRegistry) {}

  /**
   * Parse a DSL command string into a Command object
   * Example commands:
   * - fill:email@myworkday -> value="test@example.com"
   * - click:submit@myworkday
   * - check:terms@greenhouse -> value=true
   * - select:location@workday -> value="Asia"
   */
  parse(commandStr: string): Command {
    const [actionSelector, value] = commandStr.split("->").map((s) => s.trim());
    const [action, selectorKey, platform] =
      this.parseActionSelector(actionSelector);

    if (!this.registry.has(selectorKey)) {
      throw new Error(`Unknown selector key: ${selectorKey}`);
    }

    const selectorDef = this.registry.get(selectorKey)!;

    // Validate platform matches
    if (selectorDef.platform !== platform) {
      throw new Error(`Platform mismatch for selector ${selectorKey}`);
    }

    const baseCommand = {
      type: action as CommandType,
      selector: selectorDef.selector,
      platform: platform as string,
    };

    // Parse command-specific parameters
    switch (action) {
      case "fill":
        if (!value) throw new Error("Fill command requires a value");
        return {
          ...baseCommand,
          type: "fill",
          value: this.parseValue(value),
        };

      case "click":
        return {
          ...baseCommand,
          type: "click",
        };

      case "select":
        if (!value) throw new Error("Select command requires a value");
        return {
          ...baseCommand,
          type: "select",
          value: this.parseValue(value),
        };

      case "check":
        return {
          ...baseCommand,
          type: "check",
          value: value ? this.parseBoolean(value) : true,
        };

      case "upload":
        if (!value) throw new Error("Upload command requires a file path");
        return {
          ...baseCommand,
          type: "upload",
          file: this.parseValue(value) as unknown as File,
        };

      case "wait":
        return {
          ...baseCommand,
          type: "wait",
          timeout: value ? parseInt(this.parseValue(value)) : undefined,
        };

      case "verify":
        if (!value) throw new Error("Verify command requires a state");
        return {
          ...baseCommand,
          type: "verify",
          state: this.parseValue(value) as any,
        };

      default:
        throw new Error(`Unknown command type: ${action}`);
    }
  }

  /**
   * Parse multiple commands in sequence
   */
  parseMultiple(commands: string[]): Command[] {
    return commands.map((cmd) => this.parse(cmd));
  }

  private parseActionSelector(
    actionSelector: string
  ): [string, string, string] {
    const parts = actionSelector.split("@");
    if (parts.length !== 2) {
      throw new Error(
        "Invalid command format. Expected: action:selector@platform"
      );
    }

    const [actionAndSelector, platform] = parts;
    const [action, selector] = actionAndSelector.split(":");

    if (!action || !selector || !platform) {
      throw new Error(
        "Invalid command format. Expected: action:selector@platform"
      );
    }

    return [action, selector, platform];
  }

  private parseValue(valueStr: string): string {
    const match =
      valueStr.match(/value="([^"]*)"/) || valueStr.match(/value=(\S+)/);
    if (!match) {
      throw new Error(`Invalid value format: ${valueStr}`);
    }
    return match[1];
  }

  private parseBoolean(valueStr: string): boolean {
    const value = this.parseValue(valueStr).toLowerCase();
    if (value !== "true" && value !== "false") {
      throw new Error(`Invalid boolean value: ${value}`);
    }
    return value === "true";
  }
}
