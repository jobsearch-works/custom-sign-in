// import { SelectorRegistry } from "../common/SelectorRegistry";
// import { CommandParser } from "../common/CommandParser";
// import { CommandInterpreter } from "../common/CommandInterpreter";
// import { MyWorkdayJobsAccountFiller } from "../myworkdayjobs/MyWorkdayJobsAccountFiller";

// // Create instances of our core services
// const registry = new SelectorRegistry();
// const parser = new CommandParser(registry);

// // Register MyWorkday selectors
// registry.register("email", {
//   selector: "#input-4",
//   description: "Email/Username input field",
//   platform: "myworkday",
//   type: "css",
// });

// registry.register("password", {
//   selector: "#input-5",
//   description: "Password input field",
//   platform: "myworkday",
//   type: "css",
// });

// registry.register("verifyPassword", {
//   selector: "#input-6",
//   description: "Verify password input field",
//   platform: "myworkday",
//   type: "css",
// });

// registry.register("terms", {
//   selector: "#input-8",
//   description: "Terms and conditions checkbox",
//   platform: "myworkday",
//   type: "css",
// });

// registry.register("signInLink", {
//   selector: "text=Sign In",
//   description: "Sign in mode switch link",
//   platform: "myworkday",
//   type: "text",
// });

// // Create form fillers map
// const formFillers = new Map();
// formFillers.set("myworkday", new MyWorkdayJobsAccountFiller());

// // Create the interpreter
// const interpreter = new CommandInterpreter(formFillers);

// // Example usage
// async function createAccount(email: string, password: string) {
//   // Define the sequence of commands to create an account
//   const commands = [
//     `fill:email@myworkday -> value="${email}"`,
//     `fill:password@myworkday -> value="${password}"`,
//     `fill:verifyPassword@myworkday -> value="${password}"`,
//     `check:terms@myworkday -> value=true`,
//     `verify:email@myworkday -> value="visible"`,
//     `verify:password@myworkday -> value="visible"`,
//     `verify:verifyPassword@myworkday -> value="visible"`,
//     `verify:terms@myworkday -> value="visible"`,
//   ];

//   try {
//     // Parse and execute the commands
//     const parsedCommands = parser.parseMultiple(commands);
//     await interpreter.executeMultiple(parsedCommands);
//     console.log("Account creation form filled successfully");
//   } catch (error) {
//     console.error("Error filling account creation form:", error);
//     throw error;
//   }
// }

// // Example: Create an account
// createAccount("test@example.com", "SecurePassword123!");
