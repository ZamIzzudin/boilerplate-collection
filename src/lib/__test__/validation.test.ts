import {
  requiredString,
  noSpace,
  safeString,
  numericString,
  passwordField,
  SAFE_CHAR_REGEX,
  getValidationErrors,
  createChangeHandler,
} from "../validation";
import { z } from "zod";

describe("SAFE_CHAR_REGEX", () => {
  it("allows safe characters", () => {
    expect(SAFE_CHAR_REGEX.test("Hello World 123")).toBe(true);
    expect(SAFE_CHAR_REGEX.test("test@email.com")).toBe(true);
    expect(SAFE_CHAR_REGEX.test("abc-123_def")).toBe(true);
  });

  it("rejects unsafe characters", () => {
    expect(SAFE_CHAR_REGEX.test("script<script>")).toBe(false);
    expect(SAFE_CHAR_REGEX.test("test|pipe")).toBe(false);
  });
});

describe("requiredString", () => {
  it("validates non-empty string", () => {
    const schema = requiredString("Name");
    expect(schema.safeParse("hello").success).toBe(true);
  });

  it("rejects empty string", () => {
    const schema = requiredString("Name");
    const result = schema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("uses label in error message", () => {
    const schema = requiredString("Email");
    const result = schema.safeParse("");
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Email");
    }
  });
});

describe("noSpace", () => {
  it("strips spaces and validates", () => {
    const schema = noSpace("Code");
    expect(schema.safeParse("abc").success).toBe(true);
    expect(schema.safeParse("a b c").success).toBe(true);
  });

  it("rejects string with only spaces", () => {
    const schema = noSpace("Code");
    expect(schema.safeParse("   ").success).toBe(false);
  });
});

describe("safeString", () => {
  it("allows safe characters", () => {
    const schema = safeString("Name");
    expect(schema.safeParse("John Doe").success).toBe(true);
  });

  it("rejects unsafe characters", () => {
    const schema = safeString("Name");
    expect(schema.safeParse("John|Doe").success).toBe(false);
  });
});

describe("numericString", () => {
  it("allows numeric strings", () => {
    const schema = numericString("Amount");
    expect(schema.safeParse("123").success).toBe(true);
    expect(schema.safeParse("0").success).toBe(true);
  });

  it("rejects non-numeric strings", () => {
    const schema = numericString("Amount");
    expect(schema.safeParse("abc").success).toBe(false);
  });
});

describe("passwordField", () => {
  const schema = passwordField("Password");

  it("validates strong password", () => {
    expect(schema.safeParse("Strong1!").success).toBe(true);
  });

  it("rejects short password", () => {
    expect(schema.safeParse("S1!").success).toBe(false);
  });

  it("rejects password without digit", () => {
    expect(schema.safeParse("Strong!").success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    expect(schema.safeParse("strong1!").success).toBe(false);
  });

  it("rejects password without lowercase", () => {
    expect(schema.safeParse("STRONG1!").success).toBe(false);
  });

  it("rejects password without special char", () => {
    expect(schema.safeParse("Strong1").success).toBe(false);
  });
});

describe("getValidationErrors", () => {
  it("converts ZodError to field-error map", () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    });
    const result = schema.safeParse({ name: "", email: "bad" });
    if (!result.success) {
      const errors = getValidationErrors(result.error);
      expect(errors).toHaveProperty("name");
      expect(errors).toHaveProperty("email");
    }
  });

  it("handles nested paths", () => {
    const schema = z.object({
      user: z.object({ name: z.string().min(1) }),
    });
    const result = schema.safeParse({ user: { name: "" } });
    if (!result.success) {
      const errors = getValidationErrors(result.error);
      expect(errors["user.name"]).toBeDefined();
    }
  });
});

describe("createChangeHandler", () => {
  it("calls setForm with updated value", () => {
    const setForm = jest.fn();
    const setErrors = jest.fn();
    const handler = createChangeHandler(setForm, setErrors);

    handler("name", "John");
    expect(setForm).toHaveBeenCalledWith(expect.any(Function));
  });

  it("clears error for the field if it exists", () => {
    const setForm = jest.fn();
    const setErrors = jest.fn((fn: any) => fn({ name: "error", email: "err" }));
    const handler = createChangeHandler(setForm, setErrors);

    handler("name", "John");
    expect(setErrors).toHaveBeenCalled();
  });

  it("does not modify errors if field has no error", () => {
    const setForm = jest.fn();
    const setErrors = jest.fn((fn: any) => fn({ email: "err" }));
    const handler = createChangeHandler(setForm, setErrors);

    handler("name", "John");
    const result = setErrors.mock.calls[0][0]({ email: "err" });
    expect(result).toEqual({ email: "err" });
  });
});
