// Minimal env so `src/env.ts` validates at import time. These tests exercise
// only paths that short-circuit before any DB access (validation, tenant, 404).
process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://test:test@localhost:5432/test";
process.env.SECRET = process.env.SECRET ?? "test-secret-key";
process.env.CORS_ALLOWED_ORIGINS = "https://klimstepan.com";
