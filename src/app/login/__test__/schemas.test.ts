import { loginSchema, forgotPasswordSchema } from "../schemas";

describe("loginSchema", () => {
  it("valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "pass",
      userTypeId: "3",
    });
    expect(result.success).toBe(true);
  });

  it("invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-email",
      password: "pass",
      userTypeId: "3",
    });
    expect(result.success).toBe(false);
  });

  it("missing password", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "",
      userTypeId: "3",
    });
    expect(result.success).toBe(false);
  });

  it("missing userTypeId", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "pass",
      userTypeId: "",
    });
    expect(result.success).toBe(false);
  });

  it("captcha is optional", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "pass",
      userTypeId: "3",
    });
    expect(result.success).toBe(true);
  });
});

describe("forgotPasswordSchema", () => {
  it("valid data", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "a@b.com",
      userTypeId: "3",
    });
    expect(result.success).toBe(true);
  });

  it("invalid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "bad",
      userTypeId: "3",
    });
    expect(result.success).toBe(false);
  });

  it("missing userTypeId", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "a@b.com",
      userTypeId: "",
    });
    expect(result.success).toBe(false);
  });
});
