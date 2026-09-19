import type {
  LoginAction,
  LoginPayload,
  LoginResponse,
} from "../types";

describe("login types", () => {
  it("exports LoginPayload type", () => {
    const p: LoginPayload = { email: "a@b.com", password: "123" };
    expect(p.email).toBe("a@b.com");
  });

  it("exports LoginAction type", () => {
    const a: LoginAction = { id: 1, action_name: "read", action_key: "read", modules_module_id: 1 };
    expect(a.action_name).toBe("read");
  });

  it("exports LoginResponse type", () => {
    const r: LoginResponse = {
      status: 200, message: "ok",
      data: {
        id: "1", user_email: "a@b.com", user_status: "active",
        user_type_user_type_id: "2", user_type_name: "Admin",
        access_token: "abc", refresh_token: "def", actions: [], menus: [],
      },
    };
    expect(r.status).toBe(200);
  });
});
