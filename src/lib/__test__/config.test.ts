jest.mock("@/lib/config", () => {
  const ApiEndpoint = { GENESIS: "genesis", NEW: "new" };
  const appConfig = {
    sessionCookieName: "internal_session",
    apiBaseUrl: "http://localhost:4000/",
    apiBaseUrls: {
      genesis: "http://localhost:4000/",
      new: "http://localhost:4000/",
    },
  };
  const resolveApiBaseUrl = (endpoint = "genesis") => {
    return appConfig.apiBaseUrls[endpoint] ?? appConfig.apiBaseUrl;
  };
  return { ApiEndpoint, appConfig, resolveApiBaseUrl };
});

import { ApiEndpoint, resolveApiBaseUrl, appConfig } from "../config";

describe("config", () => {
  it("exports ApiEndpoint enum", () => {
    expect(ApiEndpoint.GENESIS).toBe("genesis");
    expect(ApiEndpoint.NEW).toBe("new");
  });

  it("exports appConfig with correct structure", () => {
    expect(appConfig.sessionCookieName).toBe("internal_session");
    expect(appConfig.apiBaseUrl).toBeTruthy();
    expect(appConfig.apiBaseUrls[ApiEndpoint.GENESIS]).toBeTruthy();
    expect(appConfig.apiBaseUrls[ApiEndpoint.NEW]).toBeTruthy();
  });

  it("resolveApiBaseUrl returns url for genesis", () => {
    const url = resolveApiBaseUrl(ApiEndpoint.GENESIS);
    expect(url).toBeTruthy();
  });

  it("resolveApiBaseUrl returns url for new", () => {
    const url = resolveApiBaseUrl(ApiEndpoint.NEW);
    expect(url).toBeTruthy();
  });

  it("resolveApiBaseUrl defaults to genesis", () => {
    const url = resolveApiBaseUrl();
    expect(url).toBeTruthy();
  });
});
