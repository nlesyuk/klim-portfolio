import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { env } from "../env.js";
import type { Database } from "./schema.js";

const { Pool } = pg;

// Single shared connection pool over the existing pg driver.
export const pool = new Pool({ connectionString: env.DATABASE_URL });

// Type-safe query builder over the same pool. No ORM — same SQL semantics.
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});
