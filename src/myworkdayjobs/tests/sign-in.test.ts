/**
 * @jest-environment jsdom
 */

import { fireEvent, getByLabelText, getByRole } from "@testing-library/dom";
import fs from "fs";
import path from "path";

describe("Login Form", () => {
  let documentBody;

  beforeEach(() => {
    // Load the HTML file
    const html = fs.readFileSync(path.resolve(__dirname, "login.html"), "utf8");
    documentBody = document.implementation.createHTMLDocument();
    documentBody.documentElement.innerHTML = html;
  });

  test("renders the login form", () => {
    expect(documentBody.querySelector("#login-form")).toBeInTheDocument();
    expect(documentBody.querySelector("#email")).toBeInTheDocument();
    expect(documentBody.querySelector("#password")).toBeInTheDocument();
    expect(
      documentBody.querySelector("button[type='submit']")
    ).toBeInTheDocument();
  });

  test("displays an error when submitting empty fields", () => {
    const form = documentBody.querySelector("#login-form");
    const errorMessage = documentBody.querySelector("#error-message");

    fireEvent.submit(form);

    expect(errorMessage.style.display).toBe("block");
    expect(errorMessage.textContent).toBe(
      "Please enter both email and password."
    );
  });

  test("hides error when valid credentials are provided", () => {
    const emailInput = getByLabelText(documentBody, "Email Address");
    const passwordInput = getByLabelText(documentBody, "Password");
    const form = documentBody.querySelector("#login-form");
    const errorMessage = documentBody.querySelector("#error-message");

    fireEvent.input(emailInput, { target: { value: "test@example.com" } });
    fireEvent.input(passwordInput, { target: { value: "password123" } });

    fireEvent.submit(form);

    expect(errorMessage.style.display).toBe("none");
  });
});
