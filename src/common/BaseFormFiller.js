/**
 * Base class for form filling functionality
 */
export class BaseFormFiller {
  /**
   * Fills an input element with the given value
   * @param {string} selector - CSS selector for the input element
   * @param {string} value - Value to fill
   */
  async fillInput(selector, value) {
    const element = await this.findElement(selector);
    if (element) {
      await this.clearInput(element);
      element.value = value;
      // Trigger input and change events
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      throw new Error(`Input element not found: ${selector}`);
    }
  }

  /**
   * Clears an input element
   * @param {HTMLInputElement|HTMLTextAreaElement} element - Input element to clear
   */
  async clearInput(element) {
    element.focus();
    element.select();
    element.value = "";
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /**
   * Uploads a file to a file input element
   * @param {string} selector - CSS selector for the file input
   * @param {File} file - File to upload
   */
  async uploadFile(selector, file) {
    const input = await this.findElement(selector);
    if (input) {
      // Create a DataTransfer object and add the file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;

      // Dispatch change event
      const event = new Event("change", { bubbles: true });
      input.dispatchEvent(event);
    } else {
      throw new Error(`File input not found: ${selector}`);
    }
  }

  /**
   * Finds a single element in the document
   * @param {string} selector - CSS selector
   * @returns {Promise<Element|null>}
   */
  async findElement(selector) {
    return document.querySelector(selector);
  }

  /**
   * Finds all elements matching the selector
   * @param {string} selector - CSS selector
   * @returns {Promise<Element[]>}
   */
  async findElements(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  /**
   * Checks if an element exists in the document
   * @param {string} selector - CSS selector
   * @returns {Promise<boolean>}
   */
  async elementExists(selector) {
    return !!(await this.findElement(selector));
  }

  /**
   * Selects an option in a select element
   * @param {string} selector - CSS selector for the select element
   * @param {string} value - Value to select
   */
  async selectOption(selector, value) {
    const select = await this.findElement(selector);
    if (select) {
      select.value = value;
      const event = new Event("change", { bubbles: true });
      select.dispatchEvent(event);
    } else {
      throw new Error(`Select element not found: ${selector}`);
    }
  }

  /**
   * Waits for an element to appear in the document
   * @param {string} selector - CSS selector
   * @param {number} timeout - Maximum time to wait in milliseconds
   * @returns {Promise<Element>}
   */
  async waitForElement(selector, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = await this.findElement(selector);
      if (element) return element;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Element not found after ${timeout}ms: ${selector}`);
  }
}
