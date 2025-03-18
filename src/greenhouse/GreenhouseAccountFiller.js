import { BaseFormFiller } from "../common/BaseFormFiller";

/**
 * Form filler for Greenhouse job application forms
 * @extends BaseFormFiller
 */
export class GreenhouseAccountFiller extends BaseFormFiller {
  constructor() {
    super();
    this.SELECTORS = {
      firstName: 'input[name="first_name"]',
      lastName: 'input[name="last_name"]',
      email: 'input[name="email"]',
      phone: 'input[name="phone"]',
      resume: 'input[type="file"][name="resume"]',
      coverLetter: 'input[type="file"][name="cover_letter"]',
      submitButton: 'input[type="submit"], button[type="submit"]',
      customQuestions:
        '.custom-question textarea, .custom-question input[type="text"]',
      locationSelect: 'select[name="job_application[location]"]',
      verificationCode: 'input[name="security_code"]',
    };
  }

  /**
   * Fills out a Greenhouse application form with the provided data
   * @param {Object} formData - The data to fill the form with
   * @param {string} formData.firstName - First name
   * @param {string} formData.lastName - Last name
   * @param {string} formData.email - Email address
   * @param {string} [formData.phone] - Phone number
   * @param {File} formData.resume - Resume file
   * @param {File} [formData.coverLetter] - Cover letter file
   * @param {Object.<string, string>} formData.customQuestions - Custom question answers
   */
  async fillApplicationForm(formData) {
    try {
      // Fill basic information
      await this.fillInput(this.SELECTORS.firstName, formData.firstName);
      await this.fillInput(this.SELECTORS.lastName, formData.lastName);
      await this.fillInput(this.SELECTORS.email, formData.email);

      if (formData.phone) {
        await this.fillInput(this.SELECTORS.phone, formData.phone);
      }

      // Handle file uploads
      await this.uploadFile(this.SELECTORS.resume, formData.resume);
      if (formData.coverLetter) {
        await this.uploadFile(this.SELECTORS.coverLetter, formData.coverLetter);
      }

      // Handle custom questions
      const customQuestionElements = await this.findElements(
        this.SELECTORS.customQuestions
      );
      for (const element of customQuestionElements) {
        const questionId = await element.getAttribute("id");
        if (questionId && formData.customQuestions[questionId]) {
          await this.fillInput(
            `#${questionId}`,
            formData.customQuestions[questionId]
          );
        }
      }

      // Handle location selection if present
      const locationSelect = await this.findElement(
        this.SELECTORS.locationSelect
      );
      if (locationSelect) {
        // Default to first option if not specified
        await this.selectOption(this.SELECTORS.locationSelect, "Asia");
      }
    } catch (error) {
      console.error("Error filling Greenhouse application form:", error);
      throw error;
    }
  }

  /**
   * Checks if the current page is a Greenhouse application form
   * @returns {Promise<boolean>}
   */
  async isGreenhouseForm() {
    try {
      const url = window.location.href;
      return (
        url.includes("boards.greenhouse.io") &&
        (await this.elementExists(this.SELECTORS.firstName)) &&
        (await this.elementExists(this.SELECTORS.lastName))
      );
    } catch {
      return false;
    }
  }

  /**
   * Handles the verification code if present
   * @param {string} code - The verification code to enter
   */
  async handleVerificationCode(code) {
    const verificationInput = await this.findElement(
      this.SELECTORS.verificationCode
    );
    if (verificationInput) {
      await this.fillInput(this.SELECTORS.verificationCode, code);
    }
  }

  /**
   * Submits the application form
   */
  async submitApplication() {
    const submitButton = await this.findElement(this.SELECTORS.submitButton);
    if (submitButton) {
      await submitButton.click();
    } else {
      throw new Error("Submit button not found");
    }
  }
}
