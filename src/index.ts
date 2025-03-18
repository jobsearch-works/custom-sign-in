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
        resultDiv.textContent = "Sign in successful!";
        resultDiv.className = "success";
      } catch (error) {
        resultDiv.textContent = `Sign in failed: ${error.message}`;
        resultDiv.className = "error";
      }
    });
  }
});
