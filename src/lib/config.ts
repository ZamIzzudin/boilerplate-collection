export enum ApiEndpoint {
  GENESIS = "genesis",
  NEW = "new",
}

const defaultApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/";

const isDev = import.meta.env.DEV;

export const appConfig = {
  sessionCookieName: import.meta.env.VITE_SESSION_COOKIE_NAME ?? "internal_session",
  apiBaseUrl: defaultApiBaseUrl,
  apiBaseUrls: {
    [ApiEndpoint.GENESIS]: defaultApiBaseUrl,
    [ApiEndpoint.NEW]: isDev
      ? "/api"
      : (import.meta.env.VITE_API_BASE_URL_NEW ?? defaultApiBaseUrl),
  },
} as const;

export const resolveApiBaseUrl = (endpoint: ApiEndpoint = ApiEndpoint.GENESIS) => {
  return appConfig.apiBaseUrls[endpoint] ?? appConfig.apiBaseUrl;
};
