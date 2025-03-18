import { CustomSignIn } from "./myworkdayjobs/CustomSignIn";

document.addEventListener("DOMContentLoaded", () => {
  const signIn = new CustomSignIn();
  const form = document.querySelector(".sign-in-form");
  const resultDiv = document.getElementById("result");

  if (form && resultDiv) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = (document.getElementById("username") as HTMLInputElement)
        .value;
      const password = (document.getElementById("password") as HTMLInputElement)
        .value;

      try {
        const result = await signIn.signIn(username, password);
        resultDiv.textContent = result.message;
        resultDiv.className = result.success ? "success" : "error";
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        resultDiv.textContent = `Sign in failed: ${errorMessage}`;
        resultDiv.className = "error";
      }
    });
  }
});
