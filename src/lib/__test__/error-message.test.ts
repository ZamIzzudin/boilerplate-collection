import { getErrorMessage } from "../error-message";
import axios from "axios";

function createAxiosError(
  message: string,
  responseData?: unknown,
  status = 500,
) {
  const error = new Error(message) as any;
  error.isAxiosError = true;
  error.response = {
    data: responseData,
    status,
    statusText: "Error",
    headers: {},
    config: {} as any,
  };
  return error;
}

describe("getErrorMessage", () => {
  const fallback = "Terjadi kesalahan";

  it("returns fallback for unknown error", () => {
    expect(getErrorMessage("string error", fallback)).toBe(fallback);
  });

  it("returns fallback for null", () => {
    expect(getErrorMessage(null, fallback)).toBe(fallback);
  });

  it("returns fallback for undefined", () => {
    expect(getErrorMessage(undefined, fallback)).toBe(fallback);
  });

  it("returns message from Error instance", () => {
    expect(getErrorMessage(new Error("test error"), fallback)).toBe(
      "test error",
    );
  });

  it("returns message from AxiosError with string data", () => {
    const error = createAxiosError("test", "Server error message");
    expect(getErrorMessage(error, fallback)).toBe("Server error message");
  });

  it("returns message from AxiosError with object data", () => {
    const error = createAxiosError("test", { message: "Not found" });
    expect(getErrorMessage(error, fallback)).toBe("Not found");
  });

  it("returns error field from AxiosError data", () => {
    const error = createAxiosError("test", { error: "Unauthorized" });
    expect(getErrorMessage(error, fallback)).toBe("Unauthorized");
  });

  it("collects multiple errors from array", () => {
    const error = createAxiosError("test", {
      errors: ["Error 1", "Error 2"],
    });
    expect(getErrorMessage(error, fallback)).toBe("Error 1\nError 2");
  });

  it("collects errors from object values", () => {
    const error = createAxiosError("test", {
      errors: { email: "Email taken", name: "Name required" },
    });
    const result = getErrorMessage(error, fallback);
    expect(result).toContain("Email taken");
    expect(result).toContain("Name required");
  });

  it("returns data.data.message when available", () => {
    const error = createAxiosError("test", {
      data: { message: "Nested message" },
    });
    expect(getErrorMessage(error, fallback)).toBe("Nested message");
  });

  it("returns axios error message as last resort", () => {
    const error = createAxiosError("Network Error", undefined);
    expect(getErrorMessage(error, fallback)).toBe("Network Error");
  });

  it("returns fallback when axios error has no message", () => {
    const error = createAxiosError("", undefined);
    error.message = "";
    expect(getErrorMessage(error, fallback)).toBe(fallback);
  });
});
