import { menuHandler } from "../handler";
import { apiNewClient } from "@/lib/axios/client";

// Mock the axios client with a factory function
jest.mock("@/lib/axios/client", () => {
  const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  return {
    apiNewClient: mockClient,
  };
});

const mockedApiNewClient = apiNewClient as jest.Mocked<typeof apiNewClient>;

describe("menuHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllMenus", () => {
    it("should fetch and return all menus with list type", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                id: "1",
                menu_code: "MENU1",
                menu_name: "Menu 1",
                parent_code: null,
                icon: "icon1",
                slug: "/menu1",
                order: 1,
                actions: [{ code: "view" }],
              },
              {
                id: "2",
                menu_code: "MENU2",
                menu_name: "Menu 2",
                parent_code: "MENU1",
                icon: "icon2",
                slug: "/menu2",
                order: 2,
                actions: [{ code: "edit" }],
              },
            ],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await menuHandler.getAllMenus();

      expect(mockedApiNewClient.get).toHaveBeenCalledWith("/menu", {
        params: { limit: 9999, page: 1, type: "list" },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "1",
        menu_code: "MENU1",
        menu_name: "Menu 1",
        parent_code: null,
        icon: "icon1",
        slug: "/menu1",
        order: 1,
        actions: [{ code: "view" }],
      });
      expect(result[1]).toEqual({
        id: "2",
        menu_code: "MENU2",
        menu_name: "Menu 2",
        parent_code: "MENU1",
        icon: "icon2",
        slug: "/menu2",
        order: 2,
        actions: [{ code: "edit" }],
      });
    });

    it("should handle empty records array", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await menuHandler.getAllMenus();

      expect(result).toEqual([]);
    });

    it("should handle missing data and records", async () => {
      const mockResponse = {
        data: {},
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await menuHandler.getAllMenus();

      expect(result).toEqual([]);
    });

    it("should handle null/undefined fields with default values", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                id: "1",
                menu_code: null,
                menu_name: null,
                parent_code: null,
                icon: null,
                slug: null,
                order: null,
                actions: null,
              },
            ],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await menuHandler.getAllMenus();

      expect(result[0]).toEqual({
        id: "1",
        menu_code: "",
        menu_name: "",
        parent_code: null,
        icon: "",
        slug: "",
        order: 0,
        actions: [],
      });
    });
  });

  describe("getMenus", () => {
    it("should fetch paginated menus with filters", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                id: "1",
                menu_code: "MENU1",
                menu_name: "Test Menu",
                parent_code: null,
                icon: "icon1",
                slug: "/menu1",
                order: 1,
                actions: [],
              },
            ],
            records_total: 1,
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const params = {
        limit: 10,
        page: 1,
        menu_name: "Test",
      };

      const result = await menuHandler.getMenus(params);

      expect(mockedApiNewClient.get).toHaveBeenCalledWith("/menu", {
        params: {
          limit: 10,
          page: 1,
          menu_name: "Test",
          type: "page",
        },
      });

      expect(result).toEqual({
        items: [
          {
            id: "1",
            menu_code: "MENU1",
            menu_name: "Test Menu",
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
      });
    });

    it("should handle empty menu name (undefined params)", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [],
            records_total: 0,
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const params = {
        limit: 10,
        page: 1,
        menu_name: "  ", // whitespace only
      };

      const result = await menuHandler.getMenus(params);

      expect(mockedApiNewClient.get).toHaveBeenCalledWith("/menu", {
        params: {
          limit: 10,
          page: 1,
          menu_name: undefined, // trimmed whitespace becomes undefined
          type: "page",
        },
      });

      expect(result.totalPages).toBe(1); // Math.max(1, Math.ceil(0/10))
    });

    it("should calculate totalPages correctly", async () => {
      const mockResponse = {
        data: {
          data: {
            records: Array(25).fill({ id: "1", menu_code: "MENU1" }),
            records_total: 25,
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const params = {
        limit: 10,
        page: 1,
        menu_name: "",
      };

      const result = await menuHandler.getMenus(params);

      expect(result.totalPages).toBe(3); // Math.ceil(25/10) = 3
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
              },
              {
                action_code: "edit",
                action_name: "Edit",
              },
            ],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await menuHandler.getActions();

      expect(mockedApiNewClient.get).toHaveBeenCalledWith("/action", {
        params: { type: "list", page: 1, limit: 999 },
      });

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("createMenu", () => {
    it("should create a new menu", async () => {
      const mockPayload = {
        menu_name: "New Menu",
        parent_code: null,
        icon: "new-icon",
        slug: "/new-menu",
        order: 1,
        action: [],
        is_group: false,
      };

      const mockResponse = {
        data: {
          success: true,
        },
      };

      mockedApiNewClient.post.mockResolvedValue(mockResponse);

      const result = await menuHandler.createMenu(mockPayload);

      expect(mockedApiNewClient.post).toHaveBeenCalledWith("/menu", mockPayload);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("updateMenu", () => {
    it("should update an existing menu", async () => {
      const mockPayload = {
        menu_code: "MENU1",
        menu_name: "Updated Menu",
        parent_code: null,
        icon: "updated-icon",
        slug: "/updated-menu",
        order: 2,
        action: [],
        is_group: false,
      };

      const mockResponse = {
        data: {
          success: true,
        },
      };

      mockedApiNewClient.put.mockResolvedValue(mockResponse);

      const result = await menuHandler.updateMenu(mockPayload);

      expect(mockedApiNewClient.put).toHaveBeenCalledWith(
        "/menu/MENU1",
        {
          menu_name: "Updated Menu",
          parent_code: null,
          icon: "updated-icon",
          slug: "/updated-menu",
          order: 2,
          action: [],
          is_group: false,
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should extract menu_code from payload for URL", async () => {
      const mockPayload = {
        menu_code: "TEST123",
        menu_name: "Test",
      };

      const mockResponse = { data: {} };
      mockedApiNewClient.put.mockResolvedValue(mockResponse);

      await menuHandler.updateMenu(mockPayload);

      expect(mockedApiNewClient.put).toHaveBeenCalledWith(
        "/menu/TEST123",
        expect.any(Object)
      );
    });
  });

  describe("deleteMenu", () => {
    it("should delete a menu", async () => {
      const mockPayload = {
        menu_code: "MENU1",
      };

      const mockResponse = {
        data: {
          success: true,
        },
      };

      mockedApiNewClient.delete.mockResolvedValue(mockResponse);

      const result = await menuHandler.deleteMenu(mockPayload);

      expect(mockedApiNewClient.delete).toHaveBeenCalledWith(
        "/menu/MENU1",
        {
          data: mockPayload,
        }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});
