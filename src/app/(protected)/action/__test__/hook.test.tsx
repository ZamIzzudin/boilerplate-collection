/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useActions,
  useCreateAction,
  useUpdateAction,
  useDeleteAction,
} from "../hook";
import { actionHandler } from "../handler";

// Mock the handler
jest.mock("../handler", () => ({
  actionHandler: {
    getActions: jest.fn(),
    createAction: jest.fn(),
    updateAction: jest.fn(),
    deleteAction: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("action hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useActions", () => {
    it("should fetch actions successfully", async () => {
      const mockData = {
        items: [
          {
            id: "1",
            action_code: "ACT001",
            action_name: "Test Action",
            status_code: "ACTIVE",
          },
        ],
        total: 1,
        page: 1,
        perPage: 15,
        totalPages: 1,
      };

      jest.mocked(actionHandler.getActions).mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useActions({ page: 1, perPage: 15, action_name: "test" }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });
    });

    it("should handle loading state", () => {
      jest.mocked(actionHandler.getActions).mockReturnValue(
        new Promise(() => {}),
      );

      const { result } = renderHook(
        () => useActions({ page: 1, perPage: 15, action_name: "test" }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isLoading).toBe(true);
    });

    it("should handle errors", async () => {
      jest
        .mocked(actionHandler.getActions)
        .mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(
        () => useActions({ page: 1, perPage: 15, action_name: "test" }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe("useCreateAction", () => {
    it("should create action successfully", async () => {
      const mockResult = { success: true };
      jest.mocked(actionHandler.createAction).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useCreateAction(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        return result.current.mutateAsync({ action_name: "New Action" });
      });

      expect(actionHandler.createAction).toHaveBeenCalledWith({
        action_name: "New Action",
      });
    });

    it("should invalidate queries on success", async () => {
      const mockResult = { success: true };
      jest.mocked(actionHandler.createAction).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useCreateAction(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        return result.current.mutateAsync({ action_name: "New Action" });
      });

      expect(actionHandler.createAction).toHaveBeenCalled();
    });

    it("should handle creation error", async () => {
      jest
        .mocked(actionHandler.createAction)
        .mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useCreateAction(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({ action_name: "New Action" }),
      ).rejects.toThrow("Network error");
    });
  });

  describe("useUpdateAction", () => {
    it("should update action successfully", async () => {
      const mockResult = { success: true };
      jest.mocked(actionHandler.updateAction).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useUpdateAction(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        return result.current.mutateAsync({
          action_code: "ACT001",
          action_name: "Updated Action",
        });
      });

      expect(actionHandler.updateAction).toHaveBeenCalledWith({
        action_code: "ACT001",
        action_name: "Updated Action",
      });
    });

    it("should handle update error", async () => {
      jest
        .mocked(actionHandler.updateAction)
        .mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useUpdateAction(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({
          action_code: "ACT001",
          action_name: "Updated Action",
        }),
      ).rejects.toThrow("Network error");
    });
  });

  describe("useDeleteAction", () => {
    it("should delete action successfully", async () => {
      const mockResult = { success: true };
      jest.mocked(actionHandler.deleteAction).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useDeleteAction(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        return result.current.mutateAsync({ action_code: "ACT001" });
      });

      expect(actionHandler.deleteAction).toHaveBeenCalledWith({
        action_code: "ACT001",
      });
    });

    it("should handle deletion error", async () => {
      jest
        .mocked(actionHandler.deleteAction)
        .mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useDeleteAction(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({ action_code: "ACT001" }),
      ).rejects.toThrow("Network error");
    });
  });
});
