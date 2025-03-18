declare module "../myworkdayjobs/MyWorkdayJobsAccountFiller" {
  export class MyWorkdayJobsAccountFiller {
    constructor();
    fillSignInFields(data: {
      username: string;
      password: string;
    }): Promise<void>;
    fillAccountCreationFields(data: {
      email: string;
      password: string;
      verifyPassword: string;
      acceptTerms: boolean;
    }): Promise<void>;
    switchMode(mode: "signIn" | "createAccount"): Promise<void>;
    getCurrentMode(): Promise<"signIn" | "createAccount">;
    fillInput(selector: string, value: any): Promise<void>;
    findElement(selector: string): Promise<Element | null>;
    selectOption(selector: string, value: any): Promise<void>;
    uploadFile(selector: string, file: File): Promise<void>;
    waitForElement(selector: string, timeout: number): Promise<void>;
  }
}
