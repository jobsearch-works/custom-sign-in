import { SelectorRegistry } from "../common/SelectorRegistry";
import { CommandParser } from "../common/CommandParser";
import { CommandInterpreter } from "../common/CommandInterpreter";
import { GreenhouseAccountFiller } from "../greenhouse/GreenhouseAccountFiller";

// Create instances of our core services
const registry = new SelectorRegistry();
const parser = new CommandParser(registry);

// Register Greenhouse selectors based on the Auros job application page
registry.register("firstName", {
  selector: 'input[name="first_name"]',
  description: "First name input field",
  platform: "greenhouse",
  type: "css",
});

registry.register("lastName", {
  selector: 'input[name="last_name"]',
  description: "Last name input field",
  platform: "greenhouse",
  type: "css",
});

registry.register("email", {
  selector: 'input[name="email"]',
  description: "Email input field",
  platform: "greenhouse",
  type: "css",
});

registry.register("phone", {
  selector: 'input[name="phone"]',
  description: "Phone number input field",
  platform: "greenhouse",
  type: "css",
  optional: true,
});

registry.register("resume", {
  selector: 'input[type="file"][name="resume"]',
  description: "Resume upload field",
  platform: "greenhouse",
  type: "css",
});

registry.register("coverLetter", {
  selector: 'input[type="file"][name="cover_letter"]',
  description: "Cover letter upload field",
  platform: "greenhouse",
  type: "css",
  optional: true,
});

registry.register("location", {
  selector: 'select[name="job_application[location]"]',
  description: "Location selection dropdown",
  platform: "greenhouse",
  type: "css",
});

registry.register("pythonExperience", {
  selector: 'textarea[data-question*="Python"]',
  description: "Python experience question field",
  platform: "greenhouse",
  type: "css",
});

registry.register("verificationCode", {
  selector: 'input[name="security_code"]',
  description: "Security verification code field",
  platform: "greenhouse",
  type: "css",
});

// Create form fillers map
const formFillers = new Map();
formFillers.set("greenhouse", new GreenhouseAccountFiller());

// Create the interpreter
const interpreter = new CommandInterpreter(formFillers);

// Example usage: Apply for the DeFi Strategy Developer position
async function applyForPosition(applicationData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resume: File;
  coverLetter?: File;
  location: string;
  pythonExperience: string;
  verificationCode: string;
}) {
  // Define the sequence of commands to fill the application
  const commands = [
    // Fill personal information
    `fill:firstName@greenhouse -> value="${applicationData.firstName}"`,
    `fill:lastName@greenhouse -> value="${applicationData.lastName}"`,
    `fill:email@greenhouse -> value="${applicationData.email}"`,

    // Fill optional phone if provided
    ...(applicationData.phone
      ? [`fill:phone@greenhouse -> value="${applicationData.phone}"`]
      : []),

    // Upload required resume
    `upload:resume@greenhouse -> value="${applicationData.resume.name}"`,

    // Upload optional cover letter if provided
    ...(applicationData.coverLetter
      ? [
          `upload:coverLetter@greenhouse -> value="${applicationData.coverLetter.name}"`,
        ]
      : []),

    // Select location
    `select:location@greenhouse -> value="${applicationData.location}"`,

    // Fill Python experience question
    `fill:pythonExperience@greenhouse -> value="${applicationData.pythonExperience}"`,

    // Fill verification code
    `fill:verificationCode@greenhouse -> value="${applicationData.verificationCode}"`,

    // Verify all required fields are visible and filled
    `verify:firstName@greenhouse -> value="visible"`,
    `verify:lastName@greenhouse -> value="visible"`,
    `verify:email@greenhouse -> value="visible"`,
    `verify:resume@greenhouse -> value="visible"`,
    `verify:location@greenhouse -> value="visible"`,
    `verify:pythonExperience@greenhouse -> value="visible"`,
  ];

  try {
    // Parse and execute the commands
    const parsedCommands = parser.parseMultiple(commands);
    await interpreter.executeMultiple(parsedCommands);
    console.log("Job application form filled successfully");
  } catch (error) {
    console.error("Error filling job application form:", error);
    throw error;
  }
}

// Example: Apply for the position
const sampleResume = new File(["resume content"], "resume.pdf", {
  type: "application/pdf",
});
const sampleCoverLetter = new File(
  ["cover letter content"],
  "cover_letter.pdf",
  { type: "application/pdf" }
);

applyForPosition({
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  resume: sampleResume,
  coverLetter: sampleCoverLetter,
  location: "Asia",
  pythonExperience: `I have 7+ years of experience using Python for developing trading systems, including:
- Developed high-frequency trading algorithms using Python and NumPy/Pandas
- Built DeFi order management tools and blockchain connectivity systems
- Implemented automated trading strategies for multiple cryptocurrency exchanges
- Experience with smart contract interaction and blockchain data analysis`,
  verificationCode: "123456",
});
