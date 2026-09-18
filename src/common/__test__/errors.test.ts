import { AppError } from "@/common/errors";

describe("AppError", () => {
  it("sets status fields and message", () => {
    const error = new AppError("boom", 418);
    expect(error.message).toBe("boom");
    expect(error.statusCode).toBe(418);
    expect(error.status).toBe(418);
  });

  it("creates unauthorized errors", () => {
    const error = AppError.unauthorized();
    expect(error.statusCode).toBe(401);
  });

  it("carries field errors for validation failures", () => {
    const error = AppError.unprocessable("Validation error", {
      email: "Email tidak valid",
    });
    expect(error.statusCode).toBe(422);
    expect(error.errors).toEqual({ email: "Email tidak valid" });
  });
});
