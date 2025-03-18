/**
 * Base class for form filling functionality
 * Provides common methods that can be used or overridden by platform-specific fillers
 */
export abstract class BaseFormFiller {
  /**
   * Find an element in the document using a selector
   */
  async findElement(selector: string): Promise<Element | null> {
    return document.querySelector(selector);
  }

  /**
   * Find all elements matching the selector
   */
  async findElements(selector: string): Promise<Element[]> {
    return Array.from(document.querySelectorAll(selector));
  }

  /**
   * Fill an input element with a value
   */
  async fillInput(selector: string, value: string): Promise<void> {
    const element = await this.findElement(selector);
    if (!element) {
      throw new Error(`Input element not found: ${selector}`);
    }

    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      // Clear the input first
      element.value = "";
      element.dispatchEvent(new Event("input", { bubbles: true }));

      // Set the new value
      element.value = value;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      throw new Error(`Element is not an input: ${selector}`);
    }
  }

  /**
   * Select an option in a select element
   */
  async selectOption(selector: string, value: string): Promise<void> {
    const element = await this.findElement(selector);
    if (!element) {
      throw new Error(`Select element not found: ${selector}`);
    }

    if (element instanceof HTMLSelectElement) {
      element.value = value;
      element.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      throw new Error(`Element is not a select: ${selector}`);
    }
  }

  /**
   * Upload a file to a file input
   */
  async uploadFile(selector: string, file: File): Promise<void> {
    const element = await this.findElement(selector);
    if (!element) {
      throw new Error(`File input not found: ${selector}`);
    }

    if (element instanceof HTMLInputElement && element.type === "file") {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      element.files = dataTransfer.files;
      element.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      throw new Error(`Element is not a file input: ${selector}`);
    }
  }

  /**
   * Wait for an element to appear in the document
   */
  async waitForElement(selector: string, timeout = 5000): Promise<Element> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const element = await this.findElement(selector);
      if (element) return element;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Element not found after ${timeout}ms: ${selector}`);
  }

  /**
   * Check if an element exists in the document
   */
  async elementExists(selector: string): Promise<boolean> {
    return !!(await this.findElement(selector));
  }

  /**
   * Get the text content of an element
   */
  async getElementText(selector: string): Promise<string | null> {
    const element = await this.findElement(selector);
    return element?.textContent || null;
  }

  /**
   * Get the value of an input element
   */
  async getInputValue(selector: string): Promise<string | null> {
    const element = await this.findElement(selector);
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      return element.value;
    }
    return null;
  }

  /**
   * Check if an element is visible
   */
  async isElementVisible(selector: string): Promise<boolean> {
    const element = await this.findElement(selector);
    if (!element) return false;

    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  }
}
