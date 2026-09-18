import { describe, it, expect, beforeEach } from "@jest/globals";
import { roleHandler } from "../handler";
import { apiNewClient } from "@/lib/axios/client";

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

describe("roleHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getRoles", () => {
    it("should fetch roles with pagination", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                value: "1",
                user_type_name: "Admin",
                user_type_show_on_register: true,
              },
              {
                value: "2",
                user_type_name: "User",
                user_type_show_on_register: false,
              },
            ],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const params = {
        page: 1,
        limit: 10,
        name: undefined,
        category: undefined,
      };

      const result = await roleHandler.getRoles(params);

      expect(mockedApiNewClient.get).toHaveBeenCalledWith("/user-type", {
        params: {
          type: "list",
          page: 1,
          limit: 10,
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "1",
        name: "Admin",
        category: true,
      });
      expect(result[1]).toEqual({
        id: "2",
        name: "User",
        category: false,
      });
    });

    it("should handle name filter", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                value: "1",
                user_type_name: "Admin",
                user_type_show_on_register: true,
              },
            ],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const params = {
        page: 1,
        limit: 10,
        name: "Admin",
        category: undefined,
      };

      const result = await roleHandler.getRoles(params);

      expect(mockedApiNewClient.get).toHaveBeenCalledWith("/user-type", {
        params: {
          type: "list",
          page: 1,
          limit: 10,
          user_type_name: "Admin",
        },
      });

      expect(result).toHaveLength(1);
    });

    it("should handle category filter", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                value: "1",
                user_type_name: "Admin",
                user_type_show_on_register: true,
              },
            ],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const params = {
        page: 1,
        limit: 10,
        name: undefined,
        category: 1,
      };

      const result = await roleHandler.getRoles(params);

      expect(mockedApiNewClient.get).toHaveBeenCalledWith("/user-type", {
        params: {
          type: "list",
          page: 1,
          limit: 10,
          user_type_show_on_register: true,
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe(true);
    });

    it("should handle category filter with value 0", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                value: "2",
                user_type_name: "User",
                user_type_show_on_register: false,
              },
            ],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const params = {
        page: 1,
        limit: 10,
        name: undefined,
        category: 0,
      };

      const result = await roleHandler.getRoles(params);

      // category === 0 is falsy, so the handler omits user_type_show_on_register
      expect(mockedApiNewClient.get).toHaveBeenCalledWith("/user-type", {
        params: {
          type: "list",
          page: 1,
          limit: 10,
          user_type_name: undefined,
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe(false);
    });

    it("should handle missing id field and use value", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                value: "1",
                user_type_name: "Admin",
                user_type_show_on_register: true,
              },
            ],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await roleHandler.getRoles({
        page: 1,
        limit: 10,
      });

      expect(result[0].id).toBe("1");
    });

    it("should handle missing data and records", async () => {
      mockedApiNewClient.get.mockResolvedValue({ data: {} });

      const result = await roleHandler.getRoles({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual([]);
    });

    it("should handle API errors gracefully", async () => {
      (mockedApiNewClient.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      const result = await roleHandler.getRoles({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual([]);
    });

    it("should handle null/undefined fields with default values", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                id: null,
                user_type_name: null,
                user_type_show_on_register: null,
              },
            ],
          },
        },
      };

      (mockedApiNewClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await roleHandler.getRoles({
        page: 1,
        limit: 10,
      });

      expect(result[0]).toEqual({
        id: "null",
        name: "",
        category: false,
      });
    });
  });

  describe("createRole", () => {
    it("should create a new role", async () => {
      const mockPayload = {
        id: "ADMIN",
        label: "Administrator",
        user_type_show_on_register: false,
      };

      const mockResponse = {
        data: {
          data: {
            id: "1",
            ...mockPayload,
          },
        },
      };

      (mockedApiNewClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await roleHandler.createRole(mockPayload);

      expect(mockedApiNewClient.post).toHaveBeenCalledWith("/roles", mockPayload);
      expect(result).toEqual(mockResponse.data.data);
    });

    it("should return data directly if data.data is missing", async () => {
      const mockPayload = {
        id: "USER",
        label: "User",
        user_type_show_on_register: true,
      };

      const mockResponse = {
        data: {
          id: "1",
          ...mockPayload,
        },
      };

      (mockedApiNewClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await roleHandler.createRole(mockPayload);

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("updateRole", () => {
    it("should update an existing role", async () => {
      const mockPayload = {
        label: "Updated Admin",
        user_type_show_on_register: false,
      };

      const mockResponse = {
        data: {
          data: {
            id: "1",
            ...mockPayload,
          },
        },
      };

      (mockedApiNewClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await roleHandler.updateRole("1", mockPayload);

      expect(mockedApiNewClient.put).toHaveBeenCalledWith("/roles/1", mockPayload);
      expect(result).toEqual(mockResponse.data.data);
    });

    it("should return data directly if data.data is missing", async () => {
      const mockPayload = {
        label: "Updated",
        user_type_show_on_register: true,
      };

      const mockResponse = {
        data: {
          id: "1",
          ...mockPayload,
        },
      };

      (mockedApiNewClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await roleHandler.updateRole("1", mockPayload);

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("deleteRole", () => {
    it("should delete a role", async () => {
      const mockResponse = {
        data: {
          data: {
            id: "1",
            deleted: true,
          },
        },
      };

      (mockedApiNewClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await roleHandler.deleteRole("1");

      expect(mockedApiNewClient.delete).toHaveBeenCalledWith("/roles/1");
      expect(result).toEqual(mockResponse.data.data);
    });

    it("should return data directly if data.data is missing", async () => {
      const mockResponse = {
        data: {
          id: "1",
          deleted: true,
        },
      };

      (mockedApiNewClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await roleHandler.deleteRole("1");

      expect(result).toEqual(mockResponse.data);
    });
  });
});
