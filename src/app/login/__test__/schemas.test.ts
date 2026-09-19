import { loginSchema } from "../schemas";

describe("loginSchema", () => {
  it("valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "pass",
    });
    expect(result.success).toBe(true);
  });

  it("invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-email",
      password: "pass",
    });
    expect(result.success).toBe(false);
  });

  it("missing password", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("captcha is optional", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "pass",
    });
    expect(result.success).toBe(true);
  });
});
