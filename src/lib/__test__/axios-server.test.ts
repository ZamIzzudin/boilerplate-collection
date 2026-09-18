jest.mock("axios", () => ({
  create: jest.fn().mockReturnValue({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }),
}));

jest.mock("@/lib/config", () => ({
  ApiEndpoint: { GENESIS: "genesis", NEW: "new" },
  resolveApiBaseUrl: jest.fn().mockReturnValue("http://localhost:4000/"),
}));

import { createServerAxios } from "../axios/server";
import { ApiEndpoint } from "@/lib/config";

describe("server axios", () => {
  it("createServerAxios returns an axios instance", async () => {
    const instance = await createServerAxios();
    expect(instance).toBeDefined();
    expect(typeof instance.get).toBe("function");
    expect(typeof instance.post).toBe("function");
  });

  it("createServerAxios with specific endpoint", async () => {
    const instance = await createServerAxios(ApiEndpoint.NEW);
    expect(instance).toBeDefined();
  });
});
