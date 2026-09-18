import { apiNewClient } from "@/lib/axios/client";
import { userHandler } from "../handler";

jest.mock("@/lib/axios/client", () => ({
  apiNewClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedGet = apiNewClient.get as jest.Mock;
const mockedPost = apiNewClient.post as jest.Mock;
const mockedPut = apiNewClient.put as jest.Mock;
const mockedDelete = apiNewClient.delete as jest.Mock;

describe("userHandler", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getUsers", () => {
    it("calls apiNewClient.get with /users and params", async () => {
      const mockData = { items: [], total: 0 };
      mockedGet.mockResolvedValue({ data: mockData });

      const result = await userHandler.getUsers({
        page: 1,
        perPage: 15,
        q: "test",
      });

      expect(mockedGet).toHaveBeenCalledWith("/users", {
        params: { page: 1, perPage: 15, q: "test" },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe("getRoleOptions", () => {
    it("calls apiNewClient.get with /users/role-options", async () => {
      const mockRoles = [{ id: "1", name: "Admin", code: "ADM" }];
      mockedGet.mockResolvedValue({ data: mockRoles });

      const result = await userHandler.getRoleOptions();

      expect(mockedGet).toHaveBeenCalledWith("/users/role-options");
      expect(result).toEqual(mockRoles);
    });
  });

  describe("createUser", () => {
    it("calls apiNewClient.post with /users and payload", async () => {
      const payload = {
        username: "newuser",
        email: "new@example.com",
        password: "pass123",
        user_type_id: "3",
      };
      mockedPost.mockResolvedValue({ data: { success: true } });

      const result = await userHandler.createUser(payload);

      expect(mockedPost).toHaveBeenCalledWith("/users", payload);
      expect(result).toEqual({ success: true });
    });
  });

  describe("updateUser", () => {
    it("calls apiNewClient.put with /users/:id and payload", async () => {
      const payload = { username: "updated" };
      mockedPut.mockResolvedValue({ data: { success: true } });

      const result = await userHandler.updateUser("42", payload);

      expect(mockedPut).toHaveBeenCalledWith("/users/42", payload);
      expect(result).toEqual({ success: true });
    });
  });

  describe("deleteUser", () => {
    it("calls apiNewClient.delete with /users/:id", async () => {
      mockedDelete.mockResolvedValue({ data: { deleted: true } });

      const result = await userHandler.deleteUser("42");

      expect(mockedDelete).toHaveBeenCalledWith("/users/42");
      expect(result).toEqual({ deleted: true });
    });
  });
});
