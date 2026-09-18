import "dotenv/config";

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: requireEnv("DATABASE_URL"),

  /** Cookie name for the httpOnly session (must match frontend SESSION_COOKIE_NAME). */
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "internal_session",
  /** Cookie name for the short-lived access token. */
  accessCookieName: process.env.ACCESS_COOKIE_NAME ?? "access_token",
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  cookieSecure:
    process.env.COOKIE_SECURE === undefined
      ? (process.env.NODE_ENV ?? "development") === "production"
      : process.env.COOKIE_SECURE === "true",

  /** Access token TTL in seconds (default 30 minutes). */
  accessTokenTtl: Number(process.env.ACCESS_TOKEN_TTL ?? 60 * 30),
  /** Refresh token TTL in seconds (default 7 days). */
  refreshTokenTtl: Number(process.env.REFRESH_TOKEN_TTL ?? 60 * 60 * 24 * 7),
  jwtSecret: requireEnv("JWT_SECRET", "change-me-in-production"),

  /** AES key shared with the frontend (`VITE_APP_KEY`). Supports "base64:" prefix. */
  appKey: requireEnv("APP_KEY", "base64:c3VwZXJzZWNyZXRrZXlib2lsZXJwbGF0ZTEyMzQ1Njc4OQ=="),
  appCipher: (process.env.APP_CIPHER ?? "aes-256-cbc").toLowerCase(),

  /** CORS origins allowed to send credentials (comma separated). */
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  /** Public base URL of the frontend, used to build reset/activation links in emails. */
  appUrl: process.env.APP_URL ?? "http://localhost:5173",
} as const;

export const isProduction = env.nodeEnv === "production";
