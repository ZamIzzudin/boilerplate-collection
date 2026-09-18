import { passwordSchema } from "../schemas/password";

describe("passwordSchema", () => {
  it("validates strong password with matching confirm", () => {
    const result = passwordSchema.safeParse({
      password: "Strong1!",
      confirmPassword: "Strong1!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = passwordSchema.safeParse({
      password: "S1!",
      confirmPassword: "S1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without digit", () => {
    const result = passwordSchema.safeParse({
      password: "Strong!",
      confirmPassword: "Strong!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = passwordSchema.safeParse({
      password: "strong1!",
      confirmPassword: "strong1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without lowercase", () => {
    const result = passwordSchema.safeParse({
      password: "STRONG1!",
      confirmPassword: "STRONG1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without special char", () => {
    const result = passwordSchema.safeParse({
      password: "Strong1",
      confirmPassword: "Strong1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = passwordSchema.safeParse({
      password: "Strong1!",
      confirmPassword: "Different1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path[0] === "confirmPassword",
      );
      expect(confirmError).toBeDefined();
    }
  });

  it("rejects empty confirmPassword", () => {
    const result = passwordSchema.safeParse({
      password: "Strong1!",
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
  });
});
