/**
 * Jest replacement for `src/lib/config.ts`.
 *
 * The real config reads `import.meta.env`, which cannot be executed by Jest's
 * CommonJS runtime — so every test gets this deterministic mock instead.
 * Keep the values in sync with the Vite defaults.
 */
export enum ApiEndpoint {
  GENESIS = "genesis",
  NEW = "new",
}

export const appConfig = {
  sessionCookieName: "internal_session",
  apiBaseUrl: "http://localhost:4000/",
  apiBaseUrls: {
    [ApiEndpoint.GENESIS]: "http://localhost:4000/",
    [ApiEndpoint.NEW]: "http://localhost:4000/",
  } as Record<ApiEndpoint, string>,
} as const;

export const resolveApiBaseUrl = (
  endpoint: ApiEndpoint = ApiEndpoint.GENESIS,
): string => appConfig.apiBaseUrls[endpoint] ?? appConfig.apiBaseUrl;
