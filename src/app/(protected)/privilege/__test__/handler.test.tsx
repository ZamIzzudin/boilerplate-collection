import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { privilegeHandler } from "../handler";
import { apiNewClient } from "@/lib/axios/client";

// Mock the axios client with a factory function
jest.mock("@/lib/axios/client", () => {
  const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
  };
  return {
    apiNewClient: mockClient,
  };
});

const mockedApiNewClient = apiNewClient as jest.Mocked<typeof apiNewClient>;

// Mock auth store
jest.mock("@/store/auth-store", () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      permissionVersion: null,
      setPermissionVersion: jest.fn(),
    })),
  },
}));

// Mock utils
jest.mock("@/lib/utils", () => ({
  mapRoles: (data: any[]) => data,
}));

describe("privilegeHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getRoles", () => {
    it("should fetch roles list", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                value: "1",
                user_type_name: "Admin",
              },
              {
                value: "2",
                user_type_name: "User",
              },
            ],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await privilegeHandler.getRoles();

      expect(mockedApiNewClient.get).toHaveBeenCalledWith("/user-type", {
        params: { page: 1, limit: 999, type: "list" },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "1",
        user_type_name: "Admin",
      });
    });

    it("should handle empty response", async () => {
      mockedApiNewClient.get.mockResolvedValue({
        data: { data: { records: [] } },
      });

      const result = await privilegeHandler.getRoles();

      expect(result).toEqual([]);
    });

    it("should handle API errors gracefully", async () => {
      (mockedApiNewClient.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await privilegeHandler.getRoles();

      expect(result).toEqual([]);
    });

    it("should handle missing records field", async () => {
      mockedApiNewClient.get.mockResolvedValue({
        data: { data: [] },
      });

      const result = await privilegeHandler.getRoles();

      expect(result).toEqual([]);
    });

    it("should handle direct data array", async () => {
      mockedApiNewClient.get.mockResolvedValue({
        data: {
          data: {
            records: [
              { value: "1", user_type_name: "Admin" },
              { value: "2", user_type_name: "User" },
            ],
          },
        },
      });

      const result = await privilegeHandler.getRoles();

      expect(result).toHaveLength(2);
    });
  });

  describe("getMenus", () => {
    it("should fetch menus list", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                id: "1",
                menu_code: "MENU1",
                menu_name: "Menu 1",
                status_code: "ACTIVE",
                parent_code: null,
                order: 1,
                isGroup: false,
                actions: [{ code: "view" }],
              },
            ],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await privilegeHandler.getMenus();

      expect(mockedApiNewClient.get).toHaveBeenCalledWith("/menu", {
        params: { type: "list", page: 1, limit: 999 },
      });

      expect(result).toHaveLength(1);
      expect(result[0].menu_code).toBe("MENU1");
    });

    it("should handle API errors gracefully", async () => {
      mockedApiNewClient.get.mockRejectedValue(new Error("API Error"));

      const result = await privilegeHandler.getMenus();

      expect(result).toEqual([]);
    });

    it("should handle direct data array", async () => {
      mockedApiNewClient.get.mockResolvedValue({
        data: {
          data: [{ id: "1", menu_code: "MENU1", status_code: "ACTIVE" }],
        },
      });

      const result = await privilegeHandler.getMenus();

      expect(result).toHaveLength(1);
    });
  });

  describe("getActions", () => {
    it("should fetch actions list", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                action_code: "view",
                action_name: "View",
                status_code: "ACTIVE",
              },
              {
                action_code: "edit",
                action_name: "Edit",
                status_code: "ACTIVE",
              },
            ],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await privilegeHandler.getActions();

      expect(mockedApiNewClient.get).toHaveBeenCalledWith("/action", {
        params: { type: "list", page: 1, limit: 999 },
      });

      expect(result).toHaveLength(2);
    });

    it("should handle API errors gracefully", async () => {
      mockedApiNewClient.get.mockRejectedValue(new Error("API Error"));

      const result = await privilegeHandler.getActions();

      expect(result).toEqual([]);
    });
  });

  describe("getPrivileges", () => {
    it("should fetch privileges for a user type", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                privilege_code: "PRIV1",
                menu_code: "MENU1",
                action_code: "view",
                status_code: "ACTIVE",
              },
              {
                privilege_code: "PRIV2",
                menu_code: "MENU1",
                action_code: "edit",
                status_code: "DELETE",
              },
            ],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await privilegeHandler.getPrivileges("USER_TYPE_1");

      expect(mockedApiNewClient.get).toHaveBeenCalledWith(
        "/privilege/by-user-type/USER_TYPE_1"
      );

      expect(result).toHaveLength(2);
      expect(result[0].status_code).toBe("ACTIVE");
      expect(result[1].status_code).toBe("DELETE");
    });

    it("should handle API errors gracefully", async () => {
      mockedApiNewClient.get.mockRejectedValue(new Error("API Error"));

      const result = await privilegeHandler.getPrivileges("USER_TYPE_1");

      expect(result).toEqual([]);
    });
  });

  describe("buildMatrix", () => {
    it("should build privilege matrix correctly", async () => {
      // Mock getMenus
      mockedApiNewClient.get
        .mockResolvedValueOnce({
          data: {
            data: {
              records: [
                {
                  id: "1",
                  menu_code: "MENU1",
                  menu_name: "Menu 1",
                  status_code: "ACTIVE",
                  parent_code: null,
                  order: 1,
                  isGroup: false,
                  actions: [{ code: "view" }, { code: "edit" }],
                },
              ],
            },
          },
        })
        // Mock getPrivileges
        .mockResolvedValueOnce({
          data: {
            data: {
              records: [
                {
                  privilege_code: "PRIV1",
                  menu_code: "MENU1",
                  action_code: "view",
                  status_code: "ACTIVE",
                },
              ],
            },
          },
        })
        // Mock getRoles
        .mockResolvedValueOnce({
          data: {
            data: {
              records: [{ value: "1", user_type_name: "Admin" }],
            },
          },
        })
        // Mock getActions
        .mockResolvedValueOnce({
          data: {
            data: {
              records: [
                {
                  action_code: "view",
                  action_name: "View",
                  status_code: "ACTIVE",
                },
                {
                  action_code: "edit",
                  action_name: "Edit",
                  status_code: "ACTIVE",
                },
              ],
            },
          },
        });

      const result = await privilegeHandler.buildMatrix("1");

      expect(result.role).toEqual({
        id: "1",
        user_type_name: "Admin",
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].menuCode).toBe("MENU1");
      expect(result.rows[0].checkedActionCodes).toContain("view");

      expect(result.actions).toHaveLength(2);
      expect(result.actions[0].action_code).toBe("view");
    });

    it("should filter only ACTIVE menus", async () => {
      mockedApiNewClient.get
        .mockResolvedValueOnce({
          data: {
            data: {
              records: [
                {
                  id: "1",
                  menu_code: "MENU1",
                  status_code: "ACTIVE",
                  actions: [],
                },
                {
                  id: "2",
                  menu_code: "MENU2",
                  status_code: "INACTIVE",
                  actions: [],
                },
              ],
            },
          },
        })
        .mockResolvedValueOnce({
          data: { data: { records: [] } },
        })
        .mockResolvedValueOnce({
          data: { data: { records: [{ value: "1", user_type_name: "Admin" }] } },
        })
        .mockResolvedValueOnce({
          data: { data: { records: [] } },
        });

      const result = await privilegeHandler.buildMatrix("1");

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].menuCode).toBe("MENU1");
    });

    it("should filter only ACTIVE actions", async () => {
      mockedApiNewClient.get
        .mockResolvedValueOnce({
          data: { data: { records: [{ id: "1", menu_code: "MENU1", status_code: "ACTIVE", actions: [] }] } },
        })
        .mockResolvedValueOnce({
          data: { data: { records: [] } },
        })
        .mockResolvedValueOnce({
          data: { data: { records: [{ value: "1", user_type_name: "Admin" }] } },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              records: [
                { action_code: "view", status_code: "ACTIVE" },
                { action_code: "delete", status_code: "INACTIVE" },
              ],
            },
          },
        });

      const result = await privilegeHandler.buildMatrix("1");

      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].action_code).toBe("view");
    });

    it("should track both ACTIVE and DELETE privilege entries", async () => {
      mockedApiNewClient.get
        .mockResolvedValueOnce({
          data: {
            data: {
              records: [
                {
                  id: "1",
                  menu_code: "MENU1",
                  status_code: "ACTIVE",
                  actions: [{ code: "view" }],
                },
              ],
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              records: [
                {
                  privilege_code: "PRIV1",
                  menu_code: "MENU1",
                  action_code: "view",
                  status_code: "ACTIVE",
                },
                {
                  privilege_code: "PRIV2",
                  menu_code: "MENU1",
                  action_code: "edit",
                  status_code: "DELETE",
                },
              ],
            },
          },
        })
        .mockResolvedValueOnce({
          data: { data: { records: [{ value: "1", user_type_name: "Admin" }] } },
        })
        .mockResolvedValueOnce({
          data: { data: { records: [{ action_code: "view", status_code: "ACTIVE" }] } },
        });

      const result = await privilegeHandler.buildMatrix("1");

      const row = result.rows[0];
      expect(row.checkedActionCodes).toContain("view");
      expect(row.checkedActionCodes).not.toContain("edit");
      expect(row.privilegeMap?.["view"]).toBeDefined();
      expect(row.privilegeMap?.["edit"]).toBeDefined();
      expect(row.privilegeMap?.["view"]?.status_code).toBe("ACTIVE");
      expect(row.privilegeMap?.["edit"]?.status_code).toBe("DELETE");
    });

    it("should handle unknown role", async () => {
      mockedApiNewClient.get
        .mockResolvedValueOnce({ data: { data: { records: [] } } })
        .mockResolvedValueOnce({ data: { data: { records: [] } } })
        .mockResolvedValueOnce({
          data: { data: { records: [] } },
        })
        .mockResolvedValueOnce({ data: { data: { records: [] } } });

      const result = await privilegeHandler.buildMatrix("UNKNOWN_ID");

      expect(result.role).toEqual({
        id: "UNKNOWN_ID",
        code: "UNKNOWN_ID",
        name: "Unknown",
      });
    });
  });

  describe("updateRoleMappings", () => {
    it("should update role mappings", async () => {
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

      const mockResponse = {
        data: {
          success: true,
          perm_version: "2",
        },
      };

      (mockedApiNewClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await privilegeHandler.updateRoleMappings(mockPayload);

      expect(mockedApiNewClient.post).toHaveBeenCalledWith(
        "/privilege",
        mockPayload
      );

      expect(result).toEqual(mockResponse.data);
    });

    it("should update permission version from response", async () => {
      const { useAuthStore } = await import("@/store/auth-store");
      const mockSetPermissionVersion = jest.fn();
      // Override getState to return null permissionVersion so handler will update
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        permissionVersion: null,
        setPermissionVersion: mockSetPermissionVersion,
      });

      mockedApiNewClient.post.mockResolvedValue({
        data: { perm_version: "3" },
      });

      await privilegeHandler.updateRoleMappings({
        user_type_id: "1",
        privileges: [],
      });

      // Handler should call setPermissionVersion with the new perm_version
      expect(mockSetPermissionVersion).toHaveBeenCalledWith("3");
    });
  });
});
