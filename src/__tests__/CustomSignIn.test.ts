import { CustomSignIn } from "../myworkdayjobs/CustomSignIn";

describe("CustomSignIn", () => {
  let signIn: CustomSignIn;

  beforeEach(() => {
    signIn = new CustomSignIn();
  });

  test("should initialize with default values", () => {
    expect(signIn).toBeDefined();
  });

  test("should handle sign in attempt", async () => {
    const result = await signIn.signIn("testuser", "testpass");
    expect(result).toBeDefined();
  });
});
