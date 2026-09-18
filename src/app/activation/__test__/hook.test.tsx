import { renderHookWithQuery, waitFor } from "@/hooks/test-utils";
import { act } from "@testing-library/react";
import { handler } from "../handler";
import { useUserActivation } from "../hook";

jest.mock("../handler", () => ({
  handler: {
    userActivation: jest.fn(),
  },
}));

const mockedUserActivation = handler.userActivation as jest.Mock;

describe("useUserActivation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("return mutateAsync yang memanggil handler.userActivation", async () => {
    mockedUserActivation.mockResolvedValue({ data: { success: true } });

    const { result } = renderHookWithQuery(() => useUserActivation());

    let res: unknown;
    await act(async () => {
      res = await result.current.mutateAsync({
        token: "tok",
        password: "pass",
        confirmPassword: "pass",
      });
    });

    expect(mockedUserActivation).toHaveBeenCalledWith({
      token: "tok",
      password: "pass",
      confirmPassword: "pass",
    });
    expect(res).toEqual({ data: { success: true } });
  });

  it("error dari handler dilempar ke caller", async () => {
    mockedUserActivation.mockRejectedValue(new Error("fail"));

    const { result } = renderHookWithQuery(() => useUserActivation());

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
    mockedUserActivation.mockImplementation(
      () => new Promise((r) => { resolve = r; }),
    );

    const { result } = renderHookWithQuery(() => useUserActivation());

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
    mockedUserActivation.mockRejectedValueOnce(new Error("fail"));
    mockedUserActivation.mockResolvedValueOnce({ data: { ok: true } });

    const { result } = renderHookWithQuery(() => useUserActivation());

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
