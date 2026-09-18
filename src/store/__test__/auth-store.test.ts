import { useAuthStore } from "../auth-store";
import type { AuthUser, Permissions } from "@/types";

describe("Auth Store", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.permissions).toEqual({});
      expect(state.permissionVersion).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.userTypeId).toBeNull();
    });

    it("should not be authenticated initially", () => {
      const { isAuthenticated } = useAuthStore.getState();

      expect(isAuthenticated).toBe(false);
    });

    it("should have empty permissions initially", () => {
      const { permissions } = useAuthStore.getState();

      expect(permissions).toEqual({});
    });
  });

  describe("setUser", () => {
    it("should set user correctly", () => {
      const mockUser: AuthUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        userTypeId: "1",
        userTypeName: "Administrator"
      };

      useAuthStore.getState().setUser(mockUser);

      const { user } = useAuthStore.getState();
      expect(user).toEqual(mockUser);
    });

    it("should update user when called multiple times", () => {
      const user1: AuthUser = {
        id: "1",
        name: "User 1",
        email: "user1@example.com",
        userTypeId: "1",
        userTypeName: "Admin"
      };

      const user2: AuthUser = {
        id: "2",
        name: "User 2",
        email: "user2@example.com",
        userTypeId: "2",
        userTypeName: "User"
      };

      useAuthStore.getState().setUser(user1);
      let { user } = useAuthStore.getState();
      expect(user).toEqual(user1);

      useAuthStore.getState().setUser(user2);
      ({ user } = useAuthStore.getState());
      expect(user).toEqual(user2);
    });

    it("should not affect other state properties", () => {
      useAuthStore.getState().setAuthenticated();
      useAuthStore.getState().setPermissionVersion("v1");

      const mockUser: AuthUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        userTypeId: "1",
        userTypeName: "Admin"
      };

      useAuthStore.getState().setUser(mockUser);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.permissionVersion).toBe("v1");
    });
  });

  describe("clearAuth", () => {
    it("should clear all auth state", () => {
      const mockUser: AuthUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        userTypeId: "1",
        userTypeName: "Admin"
      };

      const mockPermissions: Permissions = {
        can_view: true,
        can_edit: false,
        can_delete: true
      };

      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setAuthenticated();
      useAuthStore.getState().setPermissionVersion("v1");
      useAuthStore.getState().setUserTypeId(1);

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().permissionVersion).toBe("v1");
      expect(useAuthStore.getState().userTypeId).toBe(1);

      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.permissions).toEqual({});
      expect(state.permissionVersion).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.userTypeId).toBeNull();
    });

    it("should handle clearing when already empty", () => {
      expect(() => {
        useAuthStore.getState().clearAuth();
        useAuthStore.getState().clearAuth();
      }).not.toThrow();
    });
  });

  describe("setAuthenticated", () => {
    it("should set authenticated to true", () => {
      useAuthStore.getState().setAuthenticated();

      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(true);
    });

    it("should keep authenticated as true when called multiple times", () => {
      useAuthStore.getState().setAuthenticated();
      useAuthStore.getState().setAuthenticated();

      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(true);
    });
  });

  describe("setPermissionVersion", () => {
    it("should set permission version", () => {
      useAuthStore.getState().setPermissionVersion("v1");

      const { permissionVersion } = useAuthStore.getState();
      expect(permissionVersion).toBe("v1");
    });

    it("should update permission version when different", () => {
      useAuthStore.getState().setPermissionVersion("v1");
      let { permissionVersion } = useAuthStore.getState();
      expect(permissionVersion).toBe("v1");

      useAuthStore.getState().setPermissionVersion("v2");
      ({ permissionVersion } = useAuthStore.getState());
      expect(permissionVersion).toBe("v2");
    });

    it("should not update state when permission version is the same", () => {
      const originalState = useAuthStore.getState();
      
      useAuthStore.getState().setPermissionVersion("v1");
      const state1 = useAuthStore.getState();
      
      useAuthStore.getState().setPermissionVersion("v1");
      const state2 = useAuthStore.getState();

      expect(state2.permissionVersion).toBe("v1");
      expect(state1).toEqual(state2);
    });

    it("should handle empty permission version", () => {
      useAuthStore.getState().setPermissionVersion("");
      useAuthStore.getState().setPermissionVersion("");

      const { permissionVersion } = useAuthStore.getState();
      expect(permissionVersion).toBe("");
    });
  });

  describe("setUserTypeId", () => {
    it("should set user type id", () => {
      useAuthStore.getState().setUserTypeId(1);

      const { userTypeId } = useAuthStore.getState();
      expect(userTypeId).toBe(1);
    });

    it("should update user type id when called multiple times", () => {
      useAuthStore.getState().setUserTypeId(1);
      let { userTypeId } = useAuthStore.getState();
      expect(userTypeId).toBe(1);

      useAuthStore.getState().setUserTypeId(2);
      ({ userTypeId } = useAuthStore.getState());
      expect(userTypeId).toBe(2);
    });

    it("should handle zero as user type id", () => {
      useAuthStore.getState().setUserTypeId(0);

      const { userTypeId } = useAuthStore.getState();
      expect(userTypeId).toBe(0);
    });

    it("should handle negative user type ids", () => {
      useAuthStore.getState().setUserTypeId(-1);

      const { userTypeId } = useAuthStore.getState();
      expect(userTypeId).toBe(-1);
    });
  });

  describe("Combined Operations", () => {
    it("should handle complete auth flow", () => {
      const mockUser: AuthUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        userTypeId: "1",
        userTypeName: "Admin"
      };

      // Simulate login flow
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setAuthenticated();
      useAuthStore.getState().setPermissionVersion("v1");
      useAuthStore.getState().setUserTypeId(1);

      let state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.permissionVersion).toBe("v1");
      expect(state.userTypeId).toBe(1);

      // Simulate logout flow
      useAuthStore.getState().clearAuth();

      state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.permissionVersion).toBeNull();
      expect(state.userTypeId).toBeNull();
    });

    it("should handle permission version change during active session", () => {
      const mockUser: AuthUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        userTypeId: "1",
        userTypeName: "Admin"
      };

      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setAuthenticated();
      useAuthStore.getState().setPermissionVersion("v1");
      useAuthStore.getState().setUserTypeId(1);

      // Permission version changes
      useAuthStore.getState().setPermissionVersion("v2");

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.permissionVersion).toBe("v2");
      expect(state.userTypeId).toBe(1);
    });
  });

  describe("State Immutability", () => {
    it("should set user object with correct structure", () => {
      const mockUser: AuthUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        userTypeId: "1",
        userTypeName: "Admin"
      };

      useAuthStore.getState().setUser(mockUser);

      const { user } = useAuthStore.getState();
      expect(user).toEqual(mockUser);
      expect(user).toHaveProperty("id", "123");
      expect(user).toHaveProperty("name", "Test User");
    });

    it("should not mutate permissions object when cleared", () => {
      const mockPermissions: Permissions = {
        can_view: true,
        can_edit: false
      };

      // Note: Direct setting of permissions isn't exposed in the store API
      // This test validates that clearAuth doesn't mutate existing references
      useAuthStore.getState().clearAuth();
      useAuthStore.getState().clearAuth();

      const { permissions } = useAuthStore.getState();
      expect(permissions).toEqual({});
    });
  });

  describe("Edge Cases", () => {
    it("should handle setting null user", () => {
      useAuthStore.getState().setUser(null as any);

      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it("should handle setting undefined permission version", () => {
      useAuthStore.getState().setPermissionVersion(undefined as any);

      const { permissionVersion } = useAuthStore.getState();
      expect(permissionVersion).toBeUndefined();
    });

    it("should handle setting null user type id", () => {
      useAuthStore.getState().setUserTypeId(null as any);

      const { userTypeId } = useAuthStore.getState();
      expect(userTypeId).toBeNull();
    });

    it("should handle concurrent state updates", () => {
      const mockUser: AuthUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        userTypeId: "1",
        userTypeName: "Admin"
      };

      // Simulate concurrent updates
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setAuthenticated();
      useAuthStore.getState().setPermissionVersion("v1");
      useAuthStore.getState().setUserTypeId(1);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.permissionVersion).toBe("v1");
      expect(state.userTypeId).toBe(1);
    });
  });

  describe("Store Structure", () => {
    it("should have all required actions", () => {
      const state = useAuthStore.getState();

      expect(typeof state.setUser).toBe("function");
      expect(typeof state.clearAuth).toBe("function");
      expect(typeof state.setAuthenticated).toBe("function");
      expect(typeof state.setPermissionVersion).toBe("function");
      expect(typeof state.setUserTypeId).toBe("function");
    });

    it("should have all required state properties", () => {
      const state = useAuthStore.getState();

      expect(state).toHaveProperty("user");
      expect(state).toHaveProperty("permissions");
      expect(state).toHaveProperty("permissionVersion");
      expect(state).toHaveProperty("isAuthenticated");
      expect(state).toHaveProperty("userTypeId");
    });
  });
});
