import { isStrongPassword } from "@/lib/password";

describe("password policy", () => {
  it("accepts a strong password", () => {
    expect(isStrongPassword("Admin123!")).toBe(true);
  });

  it("rejects a password without uppercase", () => {
    expect(isStrongPassword("admin123!")).toBe(false);
  });

  it("rejects a password without special character", () => {
    expect(isStrongPassword("Admin123")).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(isStrongPassword("Ad1!")).toBe(false);
  });
});
