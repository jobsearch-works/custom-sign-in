import { Command } from "./types";
import { BaseFormFiller } from "../common/BaseFormFiller";

/**
 * Executes parsed commands on the page
 */
export class CommandInterpreter {
  private formFillers: Map<string, BaseFormFiller>;

  constructor(formFillers: Map<string, BaseFormFiller>) {
    this.formFillers = formFillers;
  }

  /**
   * Execute a single command
   */
  async execute(command: Command): Promise<void> {
    const formFiller = this.formFillers.get(command.platform || "default");
    if (!formFiller) {
      throw new Error(
        `No form filler registered for platform: ${
          command.platform || "default"
        }`
      );
    }

    switch (command.type) {
      case "fill":
        await formFiller.fillInput(command.selector, command.value);
        break;

      case "click":
        const element = await formFiller.findElement(command.selector);
        if (element) {
          (element as HTMLElement).click();
        }
        break;

      case "select":
        await formFiller.selectOption(command.selector, command.value);
        break;

      case "check":
        const checkbox = (await formFiller.findElement(
          command.selector
        )) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = command.value;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
        break;

      case "upload":
        await formFiller.uploadFile(command.selector, command.file);
        break;

      case "wait":
        await formFiller.waitForElement(command.selector, command.timeout);
        break;

      case "verify":
        const targetElement = await formFiller.findElement(command.selector);
        if (!targetElement) {
          throw new Error(`Element not found: ${command.selector}`);
        }

        switch (command.state) {
          case "visible":
            if (getComputedStyle(targetElement).display === "none") {
              throw new Error(`Element is not visible: ${command.selector}`);
            }
            break;

          case "hidden":
            if (getComputedStyle(targetElement).display !== "none") {
              throw new Error(`Element is visible: ${command.selector}`);
            }
            break;

          case "enabled":
            if ((targetElement as HTMLInputElement).disabled) {
              throw new Error(`Element is disabled: ${command.selector}`);
            }
            break;

          case "disabled":
            if (!(targetElement as HTMLInputElement).disabled) {
              throw new Error(`Element is enabled: ${command.selector}`);
            }
            break;

          case "checked":
            if (!(targetElement as HTMLInputElement).checked) {
              throw new Error(`Element is not checked: ${command.selector}`);
            }
            break;
        }
        break;

      default:
        throw new Error(`Unknown command type: ${(command as Command).type}`);
    }
  }

  /**
   * Execute multiple commands in sequence
   */
  async executeMultiple(commands: Command[]): Promise<void> {
    for (const command of commands) {
      await this.execute(command);
    }
  }
}
