import { apiNewClient } from "@/lib/axios/client";
import { handler } from "../handler";
jest.mock("@/lib/axios/client", () => ({
  apiNewClient: {
    post: jest.fn(),
  },
}));

const mockedPost = apiNewClient.post as jest.Mock;

describe("handler.login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("posts to /auth/login with email and password", async () => {
    mockedPost.mockResolvedValue({
      data: { user_email: "a@b.com" },
      headers: {},
    });

    const result = await handler.login({
      email: "a@b.com",
      password: "pass",
    });

    expect(mockedPost).toHaveBeenCalledWith("/auth/login", {
      email: "a@b.com",
      password: "pass",
    });
    expect(result).toEqual({ user_email: "a@b.com" });
  });

  it("includes perm_version from headers", async () => {
    mockedPost.mockResolvedValue({
      data: { user_email: "a@b.com" },
      headers: { "x-perm-version": "v1" },
    });

    const result = await handler.login({
      email: "a@b.com",
      password: "pass",
    });

    expect(result.perm_version).toBe("v1");
  });

  it("perm_version undefined when header missing", async () => {
    mockedPost.mockResolvedValue({
      data: { user_email: "a@b.com" },
      headers: {},
    });

    const result = await handler.login({
      email: "a@b.com",
      password: "pass",
    });

    expect(result.perm_version).toBeUndefined();
  });
});
