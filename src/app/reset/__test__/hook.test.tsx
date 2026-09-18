import { renderHookWithQuery, waitFor } from "@/hooks/test-utils";
import { act } from "@testing-library/react";
import { handler } from "../handler";
import { useResetPassword } from "../hook";

jest.mock("../handler", () => ({
  handler: {
    resetPassword: jest.fn(),
  },
}));

const mockedResetPassword = handler.resetPassword as jest.Mock;

describe("useResetPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("return mutateAsync yang memanggil handler.resetPassword", async () => {
    mockedResetPassword.mockResolvedValue({ data: { success: true } });

    const { result } = renderHookWithQuery(() => useResetPassword());

    let res: unknown;
    await act(async () => {
      res = await result.current.mutateAsync({
        token: "tok",
        password: "pass",
        confirmPassword: "pass",
      });
    });

    expect(mockedResetPassword).toHaveBeenCalledWith({
      token: "tok",
      password: "pass",
      confirmPassword: "pass",
    });
    expect(res).toEqual({ data: { success: true } });
  });

  it("error dari handler dilempar ke caller", async () => {
    mockedResetPassword.mockRejectedValue(new Error("fail"));

    const { result } = renderHookWithQuery(() => useResetPassword());

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          token: "tok",
          password: "pass",
          confirmPassword: "pass",
        });
      }),
    ).rejects.toThrow("fail");
  });

  it("status loading berubah saat mutate selesai", async () => {
    let resolve!: (v: unknown) => void;
    mockedResetPassword.mockImplementation(
      () => new Promise((r) => { resolve = r; }),
    );

    const { result } = renderHookWithQuery(() => useResetPassword());

    act(() => {
      result.current.mutateAsync({
        token: "tok",
        password: "pass",
        confirmPassword: "pass",
      });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    await act(async () => {
      resolve({ data: { ok: true } });
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("reset mutate setelah error", async () => {
    mockedResetPassword.mockRejectedValueOnce(new Error("fail"));
    mockedResetPassword.mockResolvedValueOnce({ data: { ok: true } });

    const { result } = renderHookWithQuery(() => useResetPassword());

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          token: "tok",
          password: "pass",
          confirmPassword: "pass",
        });
      }),
    ).rejects.toThrow("fail");

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    await act(async () => {
      await result.current.mutateAsync({
        token: "tok",
        password: "pass",
        confirmPassword: "pass",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
