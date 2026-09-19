import { renderHookWithQuery, waitFor } from "@/hooks/test-utils";
import { act } from "@testing-library/react";
import { handler } from "../handler";
import { useLogin } from "../hook";

jest.mock("../handler", () => ({
  handler: {
    login: jest.fn(),
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
