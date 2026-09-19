// `src/lib/config.ts` reads `import.meta.env`, which cannot run under Jest's
// CommonJS runtime, so Jest maps `@/lib/config` to `__mocks__/lib-config.ts`
// (see moduleNameMapper in jest.config.mjs). These tests pin the contract of
// that mock — the values every other test relies on.
import { ApiEndpoint, appConfig, resolveApiBaseUrl } from "@/lib/config";

describe("config (jest mock)", () => {
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
    expect(resolveApiBaseUrl(ApiEndpoint.GENESIS)).toBe(
      "http://localhost:4000/",
    );
  });

  it("resolveApiBaseUrl returns url for new", () => {
    expect(resolveApiBaseUrl(ApiEndpoint.NEW)).toBe("http://localhost:4000/");
  });

  it("resolveApiBaseUrl defaults to genesis", () => {
    expect(resolveApiBaseUrl()).toBe("http://localhost:4000/");
  });
});
