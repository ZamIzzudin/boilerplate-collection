/**
 * @jest-environment jsdom
 */

import { actionHandler } from "../handler";

// Mock the axios client
jest.mock("@/lib/axios/client", () => ({
  apiNewClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const { apiNewClient } = require("@/lib/axios/client");

describe("actionHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getActions", () => {
    it("should fetch actions successfully", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                id: "1",
                action_code: "ACT001",
                action_name: "Test Action",
                status_code: "ACTIVE",
              },
            ],
            records_total: 1,
            page_total: 1,
          },
        },
      };

      jest.mocked(apiNewClient.get).mockResolvedValue(mockResponse);

      const result = await actionHandler.getActions({
        page: 1,
        perPage: 15,
        action_name: "test",
      });

      expect(apiNewClient.get).toHaveBeenCalledWith("/action", {
        params: {
          limit: 15,
          page: 1,
          action_name: "test",
          type: "page",
        },
      });

      expect(result).toEqual({
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
      });
    });

    it("should handle empty action_name", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [],
            records_total: 0,
            page_total: 0,
          },
        },
      };

      jest.mocked(apiNewClient.get).mockResolvedValue(mockResponse);

      await actionHandler.getActions({
        page: 1,
        perPage: 15,
        action_name: "",
      });

      expect(apiNewClient.get).toHaveBeenCalledWith("/action", {
        params: {
          limit: 15,
          page: 1,
          action_name: undefined,
          type: "page",
        },
      });
    });

    it("should handle missing data structure", async () => {
      const mockResponse = { data: null };

      jest.mocked(apiNewClient.get).mockResolvedValue(mockResponse);

      const result = await actionHandler.getActions({
        page: 1,
        perPage: 15,
        action_name: "test",
      });

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        perPage: 15,
        totalPages: undefined,
      });
    });

    it("should trim action_name", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [],
            records_total: 0,
            page_total: 0,
          },
        },
      };

      jest.mocked(apiNewClient.get).mockResolvedValue(mockResponse);

      await actionHandler.getActions({
        page: 1,
        perPage: 15,
        action_name: "  test  ",
      });

      expect(apiNewClient.get).toHaveBeenCalledWith("/action", {
        params: {
          limit: 15,
          page: 1,
          action_name: "test",
          type: "page",
        },
      });
    });

    it("should handle missing fields in records", async () => {
      const mockResponse = {
        data: {
          data: {
            records: [
              {
                id: "1",
              },
            ],
            records_total: 1,
            page_total: 1,
          },
        },
      };

      jest.mocked(apiNewClient.get).mockResolvedValue(mockResponse);

      const result = await actionHandler.getActions({
        page: 1,
        perPage: 15,
        action_name: "test",
      });

      expect(result.items[0]).toEqual({
        id: "1",
        action_code: "",
        action_name: "",
        status_code: "ACTIVE",
      });
    });
  });

  describe("createAction", () => {
    it("should create action successfully", async () => {
      const mockPayload = { action_name: "New Action" };
      const mockResponse = { data: { success: true } };

      jest.mocked(apiNewClient.post).mockResolvedValue(mockResponse);

      const result = await actionHandler.createAction(mockPayload);

      expect(apiNewClient.post).toHaveBeenCalledWith("/action", mockPayload);
      expect(result).toEqual({ success: true });
    });

    it("should handle creation error", async () => {
      const mockPayload = { action_name: "New Action" };

      jest
        .mocked(apiNewClient.post)
        .mockRejectedValue(new Error("Network error"));

      await expect(
        actionHandler.createAction(mockPayload),
      ).rejects.toThrow("Network error");
    });
  });

  describe("updateAction", () => {
    it("should update action successfully", async () => {
      const mockPayload = {
        action_code: "ACT001",
        action_name: "Updated Action",
      };
      const mockResponse = { data: { success: true } };

      jest.mocked(apiNewClient.put).mockResolvedValue(mockResponse);

      const result = await actionHandler.updateAction(mockPayload);

      expect(apiNewClient.put).toHaveBeenCalledWith("/action/ACT001", {
        action_name: "Updated Action",
      });
      expect(result).toEqual({ success: true });
    });

    it("should handle update error", async () => {
      const mockPayload = {
        action_code: "ACT001",
        action_name: "Updated Action",
      };

      jest
        .mocked(apiNewClient.put)
        .mockRejectedValue(new Error("Network error"));

      await expect(
        actionHandler.updateAction(mockPayload),
      ).rejects.toThrow("Network error");
    });
  });

  describe("deleteAction", () => {
    it("should delete action successfully", async () => {
      const mockPayload = { action_code: "ACT001" };
      const mockResponse = { data: { success: true } };

      jest.mocked(apiNewClient.delete).mockResolvedValue(mockResponse);

      const result = await actionHandler.deleteAction(mockPayload);

      expect(apiNewClient.delete).toHaveBeenCalledWith("/action/ACT001");
      expect(result).toEqual({ success: true });
    });

    it("should handle deletion error", async () => {
      const mockPayload = { action_code: "ACT001" };

      jest
        .mocked(apiNewClient.delete)
        .mockRejectedValue(new Error("Network error"));

      await expect(
        actionHandler.deleteAction(mockPayload),
      ).rejects.toThrow("Network error");
    });
  });
});
