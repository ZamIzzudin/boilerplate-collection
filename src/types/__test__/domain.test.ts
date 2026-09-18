import type {
  UserItem,
  CreateUserPayload,
  UpdateUserPayload,
} from "../domain";

describe("Domain Types", () => {
  describe("User Types", () => {
    it("should define UserItem type", () => {
      const user: UserItem = {
        id: "1",
        username: "testuser",
        email: "test@example.com",
        role: {
          id: "role1",
          code: "ADMIN",
          name: "Administrator",
        },
      };
      expect(user.username).toBe("testuser");
      expect(user.role.name).toBe("Administrator");
    });

    it("should define CreateUserPayload type", () => {
      const payload: CreateUserPayload = {
        username: "newuser",
        email: "new@example.com",
        password: "secret",
        user_type_id: "1",
      };
      expect(payload.user_type_id).toBe("1");
    });

    it("should define UpdateUserPayload type", () => {
      const payload: UpdateUserPayload = {
        username: "existing",
        email: "existing@example.com",
        user_type_id: "2",
      };
      expect(payload.email).toBe("existing@example.com");
    });

    it("should allow UpdateUserPayload without password", () => {
      const payload: UpdateUserPayload = {
        username: "existing",
        email: "existing@example.com",
        user_type_id: "2",
      };
      expect(payload.password).toBeUndefined();
    });
  });
});
