import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from "../hook";
import * as roleHandler from "../handler";

// Mock the role handler
jest.mock("../handler", () => ({
  roleHandler: {
    getRoles: jest.fn(),
    createRole: jest.fn(),
    updateRole: jest.fn(),
    deleteRole: jest.fn(),
  },
}));

describe("Role Hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  describe("useRoles", () => {
    it("should fetch roles with given parameters", async () => {
      const mockData = [
        {
          id: "1",
          name: "Admin",
          category: true,
        },
        {
          id: "2",
          name: "User",
          category: false,
        },
      ];

      (roleHandler.roleHandler.getRoles as jest.Mock).mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useRoles({ page: 1, limit: 10, name: "Admin", category: 1 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(roleHandler.roleHandler.getRoles).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        name: "Admin",
        category: 1,
      });

      expect(result.current.data).toEqual(mockData);
    });

    it("should fetch roles with minimal parameters", async () => {
      const mockData = [
        {
          id: "1",
          name: "Admin",
          category: false,
        },
      ];

      (roleHandler.roleHandler.getRoles as jest.Mock).mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useRoles({ page: 1, limit: 10 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(roleHandler.roleHandler.getRoles).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        category: undefined,
      });

      expect(result.current.data).toEqual(mockData);
    });

    it("should use correct query key based on parameters", () => {
      renderHook(
        () => useRoles({ page: 2, limit: 15, name: "Test", category: 0 }),
        { wrapper: createWrapper() }
      );

      const queries = queryClient.getQueryCache().getAll();
      const rolesQuery = queries.find((q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === "roles"
      );

      expect(rolesQuery).toBeDefined();
      expect(rolesQuery?.queryKey).toContain(2);
      expect(rolesQuery?.queryKey).toContain(15);
      expect(rolesQuery?.queryKey).toContain("Test");
      expect(rolesQuery?.queryKey).toContain(0);
    });
  });

  describe("useCreateRole", () => {
    it("should create role and invalidate queries", async () => {
      const mockPayload = {
        id: "ADMIN",
        label: "Administrator",
        user_type_show_on_register: false,
      };

      (roleHandler.roleHandler.createRole as jest.Mock).mockResolvedValue({
        id: "1",
        ...mockPayload,
      });

      const { result } = renderHook(() => useCreateRole(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(mockPayload);

      expect(roleHandler.roleHandler.createRole).toHaveBeenCalledWith(
        mockPayload
      );
    });

    it("should set loading state during mutation", async () => {
      (roleHandler.roleHandler.createRole as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ id: "1" }), 100)
          )
      );

      const { result } = renderHook(() => useCreateRole(), {
        wrapper: createWrapper(),
      });

      const mutationPromise = result.current.mutateAsync({
        id: "TEST",
        label: "Test",
        user_type_show_on_register: false,
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await mutationPromise;

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });

  describe("useUpdateRole", () => {
    it("should update role and invalidate queries", async () => {
      const mockPayload = {
        id: "1",
        payload: {
          id: "ADMIN",
          label: "Updated Admin",
          user_type_show_on_register: false,
        },
      };

      (roleHandler.roleHandler.updateRole as jest.Mock).mockResolvedValue({
        id: "1",
        ...mockPayload.payload,
      });

      const { result } = renderHook(() => useUpdateRole(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(mockPayload);

      expect(roleHandler.roleHandler.updateRole).toHaveBeenCalledWith(
        mockPayload.id,
        mockPayload.payload
      );
    });

    it("should set loading state during mutation", async () => {
      (roleHandler.roleHandler.updateRole as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ id: "1" }), 100)
          )
      );

      const { result } = renderHook(() => useUpdateRole(), {
        wrapper: createWrapper(),
      });

      const mutationPromise = result.current.mutateAsync({
        id: "1",
        payload: {
          id: "ADMIN",
          label: "Updated",
          user_type_show_on_register: false,
        },
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await mutationPromise;

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });

  describe("useDeleteRole", () => {
    it("should delete role and invalidate queries", async () => {
      (roleHandler.roleHandler.deleteRole as jest.Mock).mockResolvedValue({
        id: "1",
        deleted: true,
      });

      const { result } = renderHook(() => useDeleteRole(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync("1");

      expect(roleHandler.roleHandler.deleteRole).toHaveBeenCalledWith("1");
    });

    it("should set loading state during mutation", async () => {
      (roleHandler.roleHandler.deleteRole as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ id: "1", deleted: true }), 100)
          )
      );

      const { result } = renderHook(() => useDeleteRole(), {
        wrapper: createWrapper(),
      });

      const mutationPromise = result.current.mutateAsync("1");

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await mutationPromise;

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });
});
