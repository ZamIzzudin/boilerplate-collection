import { renderHookWithQuery, waitFor } from "@/hooks/test-utils";
import { act } from "@testing-library/react";
import { handler } from "../handler";
import { useLogin, useForgotPassword } from "../hook";

jest.mock("../handler", () => ({
  handler: {
    login: jest.fn(),
    forgotPassword: jest.fn(),
  },
}));

const h = handler as jest.Mocked<typeof handler>;

describe("useLogin", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls handler.login and returns data", async () => {
    h.login.mockResolvedValue({ data: { user_email: "a@b.com" } } as any);

    const { result } = renderHookWithQuery(() => useLogin());

    await act(async () => {
      await result.current.mutateAsync({
        email: "a@b.com",
        password: "p",
      });
    });

    expect(h.login).toHaveBeenCalled();
  });

  it("propagates errors", async () => {
    h.login.mockRejectedValue(new Error("fail"));

    const { result } = renderHookWithQuery(() => useLogin());

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          email: "a@b.com",
          password: "p",
        });
      }),
    ).rejects.toThrow("fail");
  });
});

describe("useForgotPassword", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls handler.forgotPassword", async () => {
    h.forgotPassword.mockResolvedValue({ status: 0 } as any);

    const { result } = renderHookWithQuery(() => useForgotPassword());

    await act(async () => {
      await result.current.mutateAsync({
        email: "a@b.com",
      });
    });

    expect(h.forgotPassword).toHaveBeenCalled();
  });

  it("propagates errors", async () => {
    h.forgotPassword.mockRejectedValue(new Error("Network error"));

    const { result } = renderHookWithQuery(() => useForgotPassword());

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          email: "a@b.com",
        });
      }),
    ).rejects.toThrow("Network error");
  });
});
