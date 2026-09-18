import { renderHook, act, waitFor } from "@testing-library/react";
import { useValidToken } from "@/hooks/use-token-validation";
import { apiNewClient } from "@/lib/axios/client";
import { decrypt, encrypt } from "@/lib/crypto";
import { createWrapper } from "../test-utils";

jest.mock("@/lib/axios/client", () => ({
  apiNewClient: {
    post: jest.fn(),
  },
}));

jest.mock("@/lib/crypto", () => ({
  decrypt: jest.fn(),
  encrypt: jest.fn(),
}));

const mockedPost = apiNewClient.post as jest.Mock;
const mockedDecrypt = decrypt as jest.Mock;
const mockedEncrypt = encrypt as jest.Mock;

describe("useValidToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("decrypts token, builds payload with action, encrypts, and posts", async () => {
    const encryptedToken = "encrypted-token-abc";
    const decryptedData = { email: "user@test.com", token: "raw-token" };
    const encryptedPayload = "encrypted-body-xyz";
    const action = "VERIFY_EMAIL";

    mockedDecrypt.mockReturnValue(decryptedData);
    mockedEncrypt.mockReturnValue(encryptedPayload);
    mockedPost.mockResolvedValue({ data: { valid: true } });

    const { result } = renderHook(() => useValidToken(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        token: encryptedToken,
        action,
      });
    });

    expect(mockedDecrypt).toHaveBeenCalledWith(encryptedToken);
    expect(mockedEncrypt).toHaveBeenCalledWith({
      email: "user@test.com",
      token: "raw-token",
      action,
    });
    expect(mockedPost).toHaveBeenCalledWith("/user/valid-token", {
      data: encryptedPayload,
    });
  });

  it("returns unwrapped response data on success", async () => {
    const serverResponse = { data: { valid: true, message: "ok" } };

    mockedDecrypt.mockReturnValue({ email: "a@b.com", token: "t" });
    mockedEncrypt.mockReturnValue("enc");
    mockedPost.mockResolvedValue(serverResponse);

    const { result } = renderHook(() => useValidToken(), {
      wrapper: createWrapper(),
    });

    let response: unknown;
    await act(async () => {
      response = await result.current.mutateAsync({
        token: "tok",
        action: "ACT",
      });
    });

    expect(response).toEqual(serverResponse.data);
  });

  it("posts to /user/valid-token endpoint", async () => {
    mockedDecrypt.mockReturnValue({ email: "x@y.com", token: "v" });
    mockedEncrypt.mockReturnValue("e");
    mockedPost.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useValidToken(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ token: "tok", action: "A" });
    });

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost.mock.calls[0][0]).toBe("/user/valid-token");
  });

  it("propagates errors from the API", async () => {
    mockedDecrypt.mockReturnValue({ email: "a@b.com", token: "t" });
    mockedEncrypt.mockReturnValue("enc");
    mockedPost.mockRejectedValue(new Error("Request failed"));

    const { result } = renderHook(() => useValidToken(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          token: "tok",
          action: "ACT",
        });
      } catch (e) {
        expect((e as Error).message).toBe("Request failed");
      }
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("uses the correct action from the payload", async () => {
    const action = "RESET_PASSWORD";

    mockedDecrypt.mockReturnValue({ email: "u@u.com", token: "tk" });
    mockedEncrypt.mockReturnValue("enc");
    mockedPost.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useValidToken(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ token: "tok", action });
    });

    expect(mockedEncrypt).toHaveBeenCalledWith(
      expect.objectContaining({ action }),
    );
  });

  it("sets isSuccess to true after mutation completes", async () => {
    mockedDecrypt.mockReturnValue({ email: "a@b.com", token: "t" });
    mockedEncrypt.mockReturnValue("e");
    mockedPost.mockResolvedValue({ data: { valid: true } });

    const { result } = renderHook(() => useValidToken(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ token: "tok", action: "A" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual({ valid: true });
  });
});
