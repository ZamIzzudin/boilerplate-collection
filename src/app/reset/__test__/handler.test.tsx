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

describe("handler.resetPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedDecrypt.mockReturnValue({
      email: "user@test.com",
      token: "abc123",
    });
  });

  it("decrypt token, build payload, encrypt, dan post ke /user/reset-password", async () => {
    const mockResponse = { data: { success: true } };
    mockedPost.mockResolvedValue(mockResponse);

    const payload = {
      token: "encrypted-token",
      password: "newPass123",
      confirmPassword: "newPass123",
    };

    const result = await handler.resetPassword(payload);

    expect(mockedDecrypt).toHaveBeenCalledWith("encrypted-token");
    expect(mockedEncrypt).toHaveBeenCalledWith({
      email: "user@test.com",
      token: "abc123",
      new_password: "newPass123",
      confirm_password: "newPass123",
    });
    expect(mockedPost).toHaveBeenCalledWith("/user/reset-password", {
      data: "encrypted:{\"email\":\"user@test.com\",\"token\":\"abc123\",\"new_password\":\"newPass123\",\"confirm_password\":\"newPass123\"}",
    });
    expect(result).toEqual({ success: true });
  });

  it("melempar error jika API request gagal", async () => {
    mockedPost.mockRejectedValue(new Error("Network error"));

    await expect(
      handler.resetPassword({
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

    await handler.resetPassword({
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
