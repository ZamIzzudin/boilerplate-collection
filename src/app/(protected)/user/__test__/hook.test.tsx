import { renderHookWithQuery, waitFor } from "@/hooks/test-utils";
import { act } from "@testing-library/react";
import { userHandler } from "../handler";
import {
  useUsers,
  useRoleOptions,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../hook";

jest.mock("../handler", () => ({
  userHandler: {
    getUsers: jest.fn(),
    getRoleOptions: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

const h = userHandler as jest.Mocked<typeof userHandler>;

describe("useUsers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls userHandler.getUsers and returns data", async () => {
    h.getUsers.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      perPage: 15,
      totalPages: 1,
    } as any);

    const { result } = renderHookWithQuery(() =>
      useUsers({ page: 1, perPage: 15, q: "test" }),
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(h.getUsers).toHaveBeenCalledWith({ page: 1, perPage: 15, q: "test" });
  });
});

describe("useRoleOptions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls userHandler.getRoleOptions", async () => {
    h.getRoleOptions.mockResolvedValue([{ id: "1", name: "Admin" }] as any);

    const { result } = renderHookWithQuery(() => useRoleOptions());

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(h.getRoleOptions).toHaveBeenCalled();
  });
});

describe("useCreateUser", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls userHandler.createUser on mutateAsync", async () => {
    h.createUser.mockResolvedValue({ success: true });
    h.getUsers.mockResolvedValue({ items: [], total: 0 } as any);

    const { result } = renderHookWithQuery(() => useCreateUser());

    await act(async () => {
      await result.current.mutateAsync({
        username: "new",
        email: "new@test.com",
        password: "pass",
        user_type_id: "3",
      });
    });

    expect(h.createUser).toHaveBeenCalled();
  });
});

describe("useUpdateUser", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls userHandler.updateUser on mutateAsync", async () => {
    h.updateUser.mockResolvedValue({ success: true });
    h.getUsers.mockResolvedValue({ items: [], total: 0 } as any);

    const { result } = renderHookWithQuery(() => useUpdateUser());

    await act(async () => {
      await result.current.mutateAsync({
        id: "42",
        payload: { username: "updated" },
      });
    });

    expect(h.updateUser).toHaveBeenCalledWith("42", { username: "updated" });
  });
});

describe("useDeleteUser", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls userHandler.deleteUser on mutateAsync", async () => {
    h.deleteUser.mockResolvedValue({ deleted: true });
    h.getUsers.mockResolvedValue({ items: [], total: 0 } as any);

    const { result } = renderHookWithQuery(() => useDeleteUser());

    await act(async () => {
      await result.current.mutateAsync("42");
    });

    expect(h.deleteUser).toHaveBeenCalledWith("42");
  });

  it("propagates errors", async () => {
    h.deleteUser.mockRejectedValue(new Error("fail"));
    h.getUsers.mockResolvedValue({ items: [], total: 0 } as any);

    const { result } = renderHookWithQuery(() => useDeleteUser());

    await expect(
      act(async () => {
        await result.current.mutateAsync("42");
      }),
    ).rejects.toThrow("fail");
  });
});
