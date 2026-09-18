process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/boilerplate_test?schema=public";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";
process.env.APP_KEY =
  process.env.APP_KEY ??
  "base64:c3VwZXJzZWNyZXRrZXlib2lsZXJwbGF0ZTEyMzQ1Njc4OQ==";
process.env.APP_CIPHER = process.env.APP_CIPHER ?? "aes-256-cbc";
