import { apiNewClient } from "@/lib/axios/client";
import { decrypt, encrypt } from "@/lib/crypto";
import { handler } from "../handler";

jest.mock("@/lib/axios/client", () => ({
  apiNewClient: {
    post: jest.fn(),
  },
}));

jest.mock("@/lib/crypto", () => ({
  decrypt: jest.fn(),
  encrypt: jest.fn((v) => `encrypted:${JSON.stringify(v)}`),
}));

const mockedPost = apiNewClient.post as jest.Mock;
const mockedDecrypt = decrypt as jest.Mock;
const mockedEncrypt = encrypt as jest.Mock;

describe("handler.userActivation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedDecrypt.mockReturnValue({
      email: "user@test.com",
      token: "abc123",
    });
  });

  it("decrypt token, build payload, encrypt, dan post ke /user/activation", async () => {
    const mockResponse = { data: { success: true } };
    mockedPost.mockResolvedValue(mockResponse);

    const payload = {
      token: "encrypted-token",
      password: "newPass123",
      confirmPassword: "newPass123",
    };

    const result = await handler.userActivation(payload);

    expect(mockedDecrypt).toHaveBeenCalledWith("encrypted-token");
    expect(mockedEncrypt).toHaveBeenCalledWith({
      email: "user@test.com",
      token: "abc123",
      new_password: "newPass123",
      confirm_password: "newPass123",
    });
    expect(mockedPost).toHaveBeenCalledWith("/user/activation", {
      data: "encrypted:{\"email\":\"user@test.com\",\"token\":\"abc123\",\"new_password\":\"newPass123\",\"confirm_password\":\"newPass123\"}",
    });
    expect(result).toEqual({ success: true });
  });

  it("melempar error jika API request gagal", async () => {
    mockedPost.mockRejectedValue(new Error("Network error"));

    await expect(
      handler.userActivation({
        token: "bad-token",
        password: "pass",
        confirmPassword: "pass",
      }),
    ).rejects.toThrow("Network error");
  });

  it("menggunakan email dan token dari hasil decrypt", async () => {
    mockedDecrypt.mockReturnValue({
      email: "other@test.com",
      token: "xyz789",
    });
    mockedPost.mockResolvedValue({ data: {} });

    await handler.userActivation({
      token: "enc",
      password: "p",
      confirmPassword: "p",
    });

    expect(mockedEncrypt).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "other@test.com",
        token: "xyz789",
      }),
    );
  });
});

describe("handler.validToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedDecrypt.mockReturnValue({
      email: "user@test.com",
      token: "abc123",
    });
  });

  it("decrypt token, build payload, encrypt, dan post ke /user/valid-token", async () => {
    const mockResponse = { data: { valid: true } };
    mockedPost.mockResolvedValue(mockResponse);

    const result = await handler.validToken({ token: "encrypted-token" });

    expect(mockedDecrypt).toHaveBeenCalledWith("encrypted-token");
    expect(mockedEncrypt).toHaveBeenCalledWith({
      email: "user@test.com",
      token: "abc123",
      action: "activation",
    });
    expect(mockedPost).toHaveBeenCalledWith("/user/valid-token", {
      data: "encrypted:{\"email\":\"user@test.com\",\"token\":\"abc123\",\"action\":\"activation\"}",
    });
    expect(result).toEqual({ valid: true });
  });

  it("melempar error jika API request gagal", async () => {
    mockedPost.mockRejectedValue(new Error("Token expired"));

    await expect(
      handler.validToken({ token: "expired-token" }),
    ).rejects.toThrow("Token expired");
  });

  it("selalu mengirim action 'activation'", async () => {
    mockedPost.mockResolvedValue({ data: {} });

    await handler.validToken({ token: "tok" });

    expect(mockedEncrypt).toHaveBeenCalledWith(
      expect.objectContaining({ action: "activation" }),
    );
  });
});
