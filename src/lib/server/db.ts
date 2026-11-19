import "server-only";
import postgres from "postgres";

declare global {
  var __faahemSql: ReturnType<typeof postgres> | undefined;
}

/** True when a database is configured; without one the site runs in local-only mode. */
export const hasDb = !!process.env.DATABASE_URL;

/** One connection pool per process (kept across dev hot reloads). */
export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  globalThis.__faahemSql ??= postgres(process.env.DATABASE_URL, { max: Number(process.env.DB_POOL_MAX ?? 10), idle_timeout: 30 });
  return globalThis.__faahemSql;
}
