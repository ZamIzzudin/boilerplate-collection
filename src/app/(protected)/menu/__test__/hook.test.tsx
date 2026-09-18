import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useMenus,
  useAllMenus,
  useMenuActions,
  useCreateMenu,
  useUpdateMenu,
  useDeleteMenu,
} from "../hook";
import * as menuHandler from "../handler";

// Mock the menu handler
jest.mock("../handler", () => ({
  menuHandler: {
    getMenus: jest.fn(),
    getAllMenus: jest.fn(),
    getActions: jest.fn(),
    createMenu: jest.fn(),
    updateMenu: jest.fn(),
    deleteMenu: jest.fn(),
  },
}));

// Mock auth store
jest.mock("@/store/auth-store", () => ({
  useAuthStore: () => ({
    permissionVersion: "1",
    setPermissionVersion: jest.fn(),
  }),
}));

describe("Menu Hooks", () => {
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

  describe("useMenus", () => {
    it("should fetch menus with given parameters", async () => {
      const mockData = {
        items: [
          {
            id: "1",
            menu_code: "MENU1",
            menu_name: "Menu 1",
            parent_code: null,
            icon: "icon1",
            slug: "/menu1",
            order: 1,
            actions: [],
          },
        ],
        total: 1,
        page: 1,
        perPage: 10,
        totalPages: 1,
      };

      (menuHandler.menuHandler.getMenus as jest.Mock).mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useMenus({ limit: 10, page: 1, menu_name: "Test" }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(menuHandler.menuHandler.getMenus).toHaveBeenCalledWith({
        limit: 10,
        page: 1,
        menu_name: "Test",
      });

      expect(result.current.data).toEqual(mockData);
    });

    it("should use correct query key based on parameters", () => {
      renderHook(
        () => useMenus({ limit: 15, page: 2, menu_name: "Search" }),
        { wrapper: createWrapper() }
      );

      const queries = queryClient.getQueryCache().getAll();
      const menuQuery = queries.find((q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === "menus"
      );

      expect(menuQuery).toBeDefined();
      expect(menuQuery?.queryKey).toContain(15);
      expect(menuQuery?.queryKey).toContain(2);
      expect(menuQuery?.queryKey).toContain("Search");
    });
  });

  describe("useAllMenus", () => {
    it("should fetch all menus", async () => {
      const mockData = [
        {
          id: "1",
          menu_code: "MENU1",
          menu_name: "Menu 1",
          parent_code: null,
          icon: "icon1",
          slug: "/menu1",
          order: 1,
          actions: [],
        },
        {
          id: "2",
          menu_code: "MENU2",
          menu_name: "Menu 2",
          parent_code: "MENU1",
          icon: "icon2",
          slug: "/menu2",
          order: 2,
          actions: [],
        },
      ];

      (menuHandler.menuHandler.getAllMenus as jest.Mock).mockResolvedValue(
        mockData
      );

      const { result } = renderHook(() => useAllMenus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(menuHandler.menuHandler.getAllMenus).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockData);
    });

    it("should use correct query key", () => {
      renderHook(() => useAllMenus(), { wrapper: createWrapper() });

      const queries = queryClient.getQueryCache().getAll();
      const allMenusQuery = queries.find(
        (q) => Array.isArray(q.queryKey) && q.queryKey.includes("all")
      );

      expect(allMenusQuery).toBeDefined();
    });
  });

  describe("useMenuActions", () => {
    it("should fetch menu actions", async () => {
      const mockData = {
        data: {
          records: [
            { action_code: "view", action_name: "View" },
            { action_code: "edit", action_name: "Edit" },
          ],
        },
      };

      (menuHandler.menuHandler.getActions as jest.Mock).mockResolvedValue(
        mockData
      );

      const { result } = renderHook(() => useMenuActions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(menuHandler.menuHandler.getActions).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockData);
    });

    it("should use correct query key", () => {
      renderHook(() => useMenuActions(), { wrapper: createWrapper() });

      const queries = queryClient.getQueryCache().getAll();
      const actionsQuery = queries.find(
        (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "menu-actions"
      );

      expect(actionsQuery).toBeDefined();
    });
  });

  describe("useCreateMenu", () => {
    it("should create menu and invalidate queries", async () => {
      const mockPayload = {
        menu_name: "New Menu",
        parent_code: null,
        icon: "new-icon",
        slug: "/new-menu",
        order: 1,
        action: [],
        is_group: false,
      };

      (menuHandler.menuHandler.createMenu as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useCreateMenu(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(mockPayload);

      expect(menuHandler.menuHandler.createMenu).toHaveBeenCalledWith(
        mockPayload
      );
    });

    it("should set loading state during mutation", async () => {
      (menuHandler.menuHandler.createMenu as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const { result } = renderHook(() => useCreateMenu(), {
        wrapper: createWrapper(),
      });

      const mutationPromise = result.current.mutateAsync({
        menu_name: "Test",
      } as any);

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await mutationPromise;

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });

  describe("useUpdateMenu", () => {
    it("should update menu and invalidate queries", async () => {
      const mockPayload = {
        payload: {
          menu_code: "MENU1",
          menu_name: "Updated Menu",
          parent_code: null,
          icon: "updated-icon",
          slug: "/updated-menu",
          order: 2,
          action: [],
          is_group: false,
        },
      };

      (menuHandler.menuHandler.updateMenu as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useUpdateMenu(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(mockPayload);

      expect(menuHandler.menuHandler.updateMenu).toHaveBeenCalledWith(
        mockPayload.payload
      );
    });

    it("should set loading state during mutation", async () => {
      (menuHandler.menuHandler.updateMenu as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const { result } = renderHook(() => useUpdateMenu(), {
        wrapper: createWrapper(),
      });

      const mutationPromise = result.current.mutateAsync({
        payload: { menu_code: "MENU1" } as any,
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

  describe("useDeleteMenu", () => {
    it("should delete menu and invalidate queries", async () => {
      const mockPayload = {
        menu_code: "MENU1",
      };

      (menuHandler.menuHandler.deleteMenu as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useDeleteMenu(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(mockPayload);

      expect(menuHandler.menuHandler.deleteMenu).toHaveBeenCalledWith(
        mockPayload
      );
    });

    it("should set loading state during mutation", async () => {
      (menuHandler.menuHandler.deleteMenu as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const { result } = renderHook(() => useDeleteMenu(), {
        wrapper: createWrapper(),
      });

      const mutationPromise = result.current.mutateAsync({
        menu_code: "MENU1",
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
});
