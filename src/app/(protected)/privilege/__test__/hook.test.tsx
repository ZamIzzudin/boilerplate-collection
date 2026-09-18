import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  usePrivilegeRoles,
  usePrivilegeRoleMatrix,
  useUpdateRoleMappings,
} from "../hook";
import * as privilegeHandler from "../handler";

// Mock the privilege handler
jest.mock("../handler", () => ({
  privilegeHandler: {
    getRoles: jest.fn(),
    buildMatrix: jest.fn(),
    updateRoleMappings: jest.fn(),
  },
}));

describe("Privilege Hooks", () => {
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

  describe("usePrivilegeRoles", () => {
    it("should fetch privilege roles", async () => {
      const mockData = [
        {
          id: "1",
          user_type_name: "Admin",
        },
        {
          id: "2",
          user_type_name: "User",
        },
      ];

      (privilegeHandler.privilegeHandler.getRoles as jest.Mock).mockResolvedValue(
        mockData
      );

      const { result } = renderHook(() => usePrivilegeRoles(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(privilegeHandler.privilegeHandler.getRoles).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockData);
    });

    it("should use correct query key", () => {
      renderHook(() => usePrivilegeRoles(), { wrapper: createWrapper() });

      const queries = queryClient.getQueryCache().getAll();
      const rolesQuery = queries.find(
        (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "privilege-roles"
      );

      expect(rolesQuery).toBeDefined();
    });
  });

  describe("usePrivilegeRoleMatrix", () => {
    it("should fetch role matrix when roleCode is provided", async () => {
      const mockData = {
        role: {
          id: "1",
          code: "1",
          name: "Admin",
        },
        actions: [
          {
            action_code: "view",
            action_name: "View",
            status_code: "ACTIVE",
          },
        ],
        rows: [
          {
            menuId: "1",
            menuCode: "MENU1",
            menuName: "Menu 1",
            parentMenuId: null,
            isGroup: false,
            sortOrder: 1,
            availableActionCodes: ["view"],
            checkedActionCodes: ["view"],
            privilegeMap: {
              view: {
                privilege_code: "PRIV1",
                status_code: "ACTIVE",
              },
            },
          },
        ],
      };

      (privilegeHandler.privilegeHandler.buildMatrix as jest.Mock).mockResolvedValue(
        mockData
      );

      const { result } = renderHook(() => usePrivilegeRoleMatrix("1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(privilegeHandler.privilegeHandler.buildMatrix).toHaveBeenCalledWith(
        "1"
      );
      expect(result.current.data).toEqual(mockData);
    });

    it("should not fetch when roleCode is empty", () => {
      const { result } = renderHook(() => usePrivilegeRoleMatrix(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(privilegeHandler.privilegeHandler.buildMatrix).not.toHaveBeenCalled();
    });

    it("should not fetch when roleCode is null", () => {
      const { result } = renderHook(() => usePrivilegeRoleMatrix(null as any), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(privilegeHandler.privilegeHandler.buildMatrix).not.toHaveBeenCalled();
    });

    it("should use correct query key based on roleCode", () => {
      renderHook(() => usePrivilegeRoleMatrix("ROLE_1"), {
        wrapper: createWrapper(),
      });

      const queries = queryClient.getQueryCache().getAll();
      const matrixQuery = queries.find(
        (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === "privilege-matrix" &&
          q.queryKey[1] === "ROLE_1"
      );

      expect(matrixQuery).toBeDefined();
    });
  });

  describe("useUpdateRoleMappings", () => {
    it("should update role mappings and invalidate queries", async () => {
      const mockPayload = {
        user_type_id: "1",
        privileges: [
          {
            menu_code: "MENU1",
            action_code: "view",
            status_code: "ACTIVE",
          },
        ],
      };

      jest.mocked(privilegeHandler.privilegeHandler.updateRoleMappings).mockResolvedValue(
        {
          success: true,
        }
      );

      // Pre-seed the matrix query in the cache so invalidation has a target.
      // `invalidateQueries` only marks existing queries as invalid; it does not
      // create them, so without seeding there is nothing to observe.
      queryClient.setQueryData(["privilege-matrix", "1"], { seeded: true });

      const { result } = renderHook(() => useUpdateRoleMappings(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(mockPayload);

      expect(privilegeHandler.privilegeHandler.updateRoleMappings).toHaveBeenCalledWith(
        mockPayload
      );

      // After invalidation the seeded query should be marked invalid.
      await waitFor(() => {
        const matrixQuery = queryClient
          .getQueryCache()
          .getAll()
          .find(
            (q) =>
              Array.isArray(q.queryKey) &&
              q.queryKey[0] === "privilege-matrix" &&
              q.queryKey[1] === "1"
          );
        expect(matrixQuery).toBeDefined();
        expect(matrixQuery!.state.isInvalidated).toBe(true);
      });
    });

    it("should set loading state during mutation", async () => {
      let resolveMutation: ((value: { success: boolean }) => void) | undefined;
      (privilegeHandler.privilegeHandler.updateRoleMappings as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveMutation = resolve;
          })
      );

      const { result } = renderHook(() => useUpdateRoleMappings(), {
        wrapper: createWrapper(),
      });

      const mutationPromise = result.current.mutateAsync({
        user_type_id: "1",
        privileges: [],
      });

      // Wait for the loading state to be set
      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      // Resolve the mutation
      if (resolveMutation) {
        resolveMutation({ success: true });
      }

      await mutationPromise;

      // react-query batches state updates, so the pending -> settled transition
      // is not reflected on `result.current` until the next render. Wrap the
      // assertion in waitFor to observe the post-settlement state.
      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });

    it("should invalidate the correct query key", async () => {
      jest.mocked(privilegeHandler.privilegeHandler.updateRoleMappings).mockResolvedValue(
        {
          success: true,
        }
      );

      // Pre-seed the target query AND an unrelated query so we can assert that
      // only the matching key is invalidated.
      queryClient.setQueryData(["privilege-matrix", "USER_TYPE_123"], {
        seeded: true,
      });
      queryClient.setQueryData(["privilege-matrix", "OTHER_ROLE"], {
        seeded: true,
      });

      const { result } = renderHook(() => useUpdateRoleMappings(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        user_type_id: "USER_TYPE_123",
        privileges: [],
      });

      await waitFor(() => {
        const queries = queryClient.getQueryCache().getAll();
        const matrixQuery = queries.find(
          (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === "privilege-matrix" &&
            q.queryKey[1] === "USER_TYPE_123"
        );
        expect(matrixQuery).toBeDefined();
        expect(matrixQuery!.state.isInvalidated).toBe(true);

        // The unrelated query should NOT be invalidated.
        const otherQuery = queries.find(
          (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === "privilege-matrix" &&
            q.queryKey[1] === "OTHER_ROLE"
        );
        expect(otherQuery?.state.isInvalidated).toBe(false);
      });
    });
  });
});
