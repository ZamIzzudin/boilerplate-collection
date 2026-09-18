import type {
  AuthUser,
  Permissions,
  LoginPayload,
  LoginAction,
  LoginResponse,
  RolesMapped,
  RolesExport,
} from "../auth";

describe("auth types", () => {
  it("exports AuthUser type", () => {
    const user: AuthUser = {
      id: "1", name: "Test", email: "t@t.com", userTypeId: "2", userTypeName: "Admin",
    };
    expect(user.id).toBe("1");
  });

  it("exports Permissions type", () => {
    const perms: Permissions = { read: true, write: false };
    expect(perms.read).toBe(true);
  });

  it("exports LoginPayload type", () => {
    const payload: LoginPayload = { email: "t@t.com", password: "123", userTypeId: "1" };
    expect(payload.email).toBe("t@t.com");
  });

  it("exports LoginAction type", () => {
    const action: LoginAction = {
      id: 1, action_name: "read", action_key: "read", modules_module_id: 1,
    };
    expect(action.action_name).toBe("read");
  });

  it("exports LoginResponse type", () => {
    const resp: LoginResponse = {
      status: 200, message: "ok",
      data: {
        id: "1", user_email: "t@t.com", user_status: "active",
        user_type_user_type_id: "2", user_type_name: "Admin",
        access_token: "abc", refresh_token: "def",
        actions: [], menus: [],
      },
    };
    expect(resp.status).toBe(200);
  });

  it("exports RolesMapped type", () => {
    const role: RolesMapped = { id: "1", code: "ADM", name: "Admin" };
    expect(role.code).toBe("ADM");
  });

  it("exports RolesExport type", () => {
    const roles: RolesExport = { all: [], external: [] };
    expect(roles.all).toHaveLength(0);
  });
});
