jest.mock("@/lib/config", () => ({
  ApiEndpoint: { GENESIS: "genesis", NEW: "new" },
  resolveApiBaseUrl: jest.fn().mockReturnValue("http://localhost:4000/"),
}));

jest.mock("@/store/auth-store", () => ({
  useAuthStore: {
    getState: jest.fn().mockReturnValue({
      clearAuth: jest.fn(),
    }),
  },
}));

jest.mock("@/store/privilege-store", () => ({
  usePrivilegeStore: {
    getState: jest.fn().mockReturnValue({
      resetPrivilege: jest.fn(),
    }),
  },
}));

import { apiClient, apiNewClient } from "../axios/client";

describe("axios client", () => {
  it("creates apiClient with correct structure", () => {
    expect(apiClient).toBeDefined();
    expect(typeof apiClient.get).toBe("function");
    expect(typeof apiClient.post).toBe("function");
    expect(typeof apiClient.put).toBe("function");
    expect(typeof apiClient.delete).toBe("function");
  });

  it("creates apiNewClient with correct structure", () => {
    expect(apiNewClient).toBeDefined();
    expect(typeof apiNewClient.get).toBe("function");
    expect(typeof apiNewClient.post).toBe("function");
    expect(typeof apiNewClient.put).toBe("function");
    expect(typeof apiNewClient.delete).toBe("function");
  });

  it("apiClient and apiNewClient are different instances", () => {
    expect(apiClient).not.toBe(apiNewClient);
  });
});
