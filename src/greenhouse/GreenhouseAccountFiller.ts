import { BaseFormFiller } from "../common/BaseFormFiller";

/**
 * Form filler specifically for Greenhouse job application forms
 */
export class GreenhouseAccountFiller extends BaseFormFiller {
  constructor() {
    super();
  }

  /**
   * Override the base findElement method to handle Greenhouse-specific selectors
   */
  async findElement(selector: string): Promise<Element | null> {
    // Handle text-based selectors for Greenhouse
    if (selector.startsWith("text=")) {
      const text = selector.substring(5);
      return this.findElementByText(text);
    }

    // Default to standard CSS selector
    return document.querySelector(selector);
  }

  /**
   * Find an element by its text content
   */
  private async findElementByText(text: string): Promise<Element | null> {
    const xpath = `//*[contains(text(),"${text}")]`;
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue as Element;
  }

  /**
   * Override the base waitForElement method to handle Greenhouse-specific timing
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
   * Handle file upload for Greenhouse
   * Greenhouse uses a specific file upload mechanism
   */
  async uploadFile(selector: string, file: File): Promise<void> {
    const input = (await this.findElement(selector)) as HTMLInputElement;
    if (!input) {
      throw new Error(`File input not found: ${selector}`);
    }

    // Create a DataTransfer object and add the file
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;

    // Dispatch change event to trigger Greenhouse's file upload handlers
    const event = new Event("change", { bubbles: true });
    input.dispatchEvent(event);
  }

  /**
   * Handle custom questions that might be present in the form
   */
  async fillCustomQuestion(
    questionText: string,
    answer: string
  ): Promise<void> {
    // Find the question container by text
    const questionElement = await this.findElementByText(questionText);
    if (!questionElement) {
      throw new Error(`Custom question not found: ${questionText}`);
    }

    // Find the closest input or textarea
    const input = questionElement
      .closest(".field-container")
      ?.querySelector("input, textarea");
    if (!input) {
      throw new Error(`Answer input not found for question: ${questionText}`);
    }

    // Fill the answer
    if (
      input instanceof HTMLInputElement ||
      input instanceof HTMLTextAreaElement
    ) {
      input.value = answer;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  /**
   * Submit the application form
   */
  async submitApplication(): Promise<void> {
    const submitButton = await this.findElement(
      'input[type="submit"], button[type="submit"]'
    );
    if (submitButton) {
      (submitButton as HTMLElement).click();
    } else {
      throw new Error("Submit button not found");
    }
  }
}
