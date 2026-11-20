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
  const url = process.env.DATABASE_URL;
  // On Vercel each function instance is short-lived: keep its pool small. A pooled (PgBouncer)
  // URL, such as Neon's "-pooler" host, can't use prepared statements.
  const serverless = !!process.env.VERCEL;
  globalThis.__faahemSql ??= postgres(url, {
    max: Number(process.env.DB_POOL_MAX ?? (serverless ? 1 : 10)),
    idle_timeout: serverless ? 5 : 30,
    prepare: !/pooler|pgbouncer/i.test(url),
  });
  return globalThis.__faahemSql;
}
