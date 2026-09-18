import request from "supertest";
import { createApp } from "@/app";
import { signAccessToken } from "@/lib/jwt";

jest.mock("@/lib/password", () => ({
  hashPassword: jest.fn(async (plain: string) => `hashed:${plain}`),
  comparePassword: jest.fn(async (plain: string) => plain === "Secret123!"),
  isStrongPassword: jest.fn(() => true),
  PASSWORD_REGEX: /.*/,
}));

jest.mock("@/lib/prisma", () => {
  const user = {
    id: "user-1",
    username: "admin",
    email: "admin@boilerplate.local",
    password: "$2a$10$abcdefghijklmnopqrstuv", // not used in these tests
    statusCode: "ACTIVE",
    userTypeId: 1,
    userType: { id: 1, name: "Superadmin" },
  };

  return {
    prisma: {
      user: { findUnique: jest.fn().mockResolvedValue(user) },
      menu: { findMany: jest.fn().mockResolvedValue([]) },
      menuAction: { findMany: jest.fn().mockResolvedValue([]) },
      action: { findMany: jest.fn().mockResolvedValue([]) },
      privilege: { findMany: jest.fn().mockResolvedValue([]) },
      setting: {
        findUnique: jest.fn().mockResolvedValue({ key: "perm_version", value: "1" }),
        upsert: jest.fn(),
      },
    },
  };
});

describe("auth routes", () => {
  const app = createApp();

  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(1);
  });

  it("GET /auth/me returns 401 without a session cookie", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /auth/me returns the current user with a valid access cookie", async () => {
    const token = signAccessToken({
      sub: "user-1",
      email: "admin@boilerplate.local",
      userTypeId: 1,
    });

    const res = await request(app)
      .get("/auth/me")
      .set("Cookie", [`access_token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.user_email).toBe("admin@boilerplate.local");
    expect(res.headers["x-perm-version"]).toBeDefined();
  });

  it("POST /auth/login authenticates with email and password only", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "admin@boilerplate.local",
      password: "Secret123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(1);
    expect(res.body.data.user_type_name).toBe("Superadmin");
    expect(res.body.data.user_type_user_type_id).toBe("1");
    expect(res.headers["x-perm-version"]).toBeDefined();
  });

  it("POST /auth/login rejects a wrong password without a user_type_id", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "admin@boilerplate.local",
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
  });

  it("POST /auth/login ignores a stray user_type_id", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "admin@boilerplate.local",
      password: "Secret123!",
      user_type_id: "999",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.user_type_user_type_id).toBe("1");
  });

  it("GET /auth/refresh without a refresh cookie returns 401", async () => {
    const res = await request(app).get("/auth/refresh");
    expect(res.status).toBe(401);
  });

  it("POST /auth/login with unknown fields returns 422", async () => {
    const res = await request(app).post("/auth/login").send({ email: "x" });
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it("unknown route returns 404", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
  });
});
