import http from "node:http";
import type { AddressInfo } from "node:net";
import { createApp } from "@/app";
import { signRefreshToken } from "@/lib/jwt";
import { bumpPermissionVersion } from "@/common/middleware/permission-version";

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
    password: "$2a$10$abcdefghijklmnopqrstuv",
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

type SseMessage = { event?: string; data?: string };

const parseMessages = (): { messages: SseMessage[]; onChunk: (chunk: string) => void } => {
  const messages: SseMessage[] = [];
  let buffer = "";

  const onChunk = (chunk: string): void => {
    buffer += chunk;
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const raw = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const event = /^event: (.+)$/m.exec(raw)?.[1];
      const data = /^data: (.+)$/m.exec(raw)?.[1];
      if (event !== undefined || data !== undefined) {
        messages.push({ event, data });
      }
      boundary = buffer.indexOf("\n\n");
    }
  };

  return { messages, onChunk };
};

const waitFor = (predicate: () => boolean): Promise<void> =>
  new Promise((resolve, reject) => {
    const poll = setInterval(() => {
      if (predicate()) {
        clearInterval(poll);
        resolve();
      }
    }, 10);
    setTimeout(() => {
      clearInterval(poll);
      reject(new Error("Timed out waiting for SSE message"));
    }, 3000).unref();
  });

describe("GET /auth/events (permission-version SSE)", () => {
  const app = createApp();
  let server: http.Server;
  let baseUrl: string;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${address.port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(() => done());
  });

  const refreshToken = signRefreshToken({
    sub: "user-1",
    email: "admin@boilerplate.local",
    userTypeId: 1,
  });

  const openStream = (
    cookie?: string,
  ): Promise<{ res: http.IncomingMessage; close: () => void }> =>
    new Promise((resolve, reject) => {
      const req = http.get(
        `${baseUrl}/auth/events`,
        cookie ? { headers: { Cookie: cookie } } : {},
        (res) => {
          resolve({
            res,
            close: () => req.destroy(),
          });
        },
      );
      req.on("error", reject);
    });

  it("rejects unauthenticated connections", async () => {
    const { res, close } = await openStream();
    try {
      expect(res.statusCode).toBe(401);
    } finally {
      close();
    }
  });

  it("rejects a bogus refresh token", async () => {
    const { res, close } = await openStream("internal_session=not-a-jwt");
    try {
      expect(res.statusCode).toBe(401);
    } finally {
      close();
    }
  });

  it("streams the current version on connect and pushes bumps", async () => {
    const { res, close } = await openStream(`internal_session=${refreshToken}`);

    try {
      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toContain("text/event-stream");

      const { messages, onChunk } = parseMessages();
      res.setEncoding("utf8");
      res.on("data", onChunk);

      await waitFor(
        () => messages.some((m) => m.event === "perm-version" && m.data === "1"),
      );

      const newVersion = await bumpPermissionVersion();

      await waitFor(
        () =>
          messages.some(
            (m) => m.event === "perm-version" && m.data === newVersion,
          ),
      );

      expect(newVersion).not.toBe("1");
    } finally {
      close();
    }
  });
});
