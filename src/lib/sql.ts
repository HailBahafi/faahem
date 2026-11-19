// SQL for lessons: a fresh in-memory Postgres (PGlite, WebAssembly) per run, in the browser
// and in the validator alike. Results print as a simple table so exercises compare text.
import type { PGlite as PGliteT } from "@electric-sql/pglite";

type Row = Record<string, unknown>;
type Result = { rows: Row[]; fields: { name: string }[]; affectedRows?: number };

const cell = (v: unknown) =>
  v === null || v === undefined ? "NULL" : v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === "object" ? JSON.stringify(v) : String(v);

/** "name | age" header then one line per row; non-SELECT statements print "OK (n rows)". */
export function formatResults(results: Result[]): string[] {
  const out: string[] = [];
  for (const r of results) {
    if (r.fields.length) {
      const cols = r.fields.map((f) => f.name);
      out.push(cols.join(" | "));
      for (const row of r.rows) out.push(cols.map((c) => cell(row[c])).join(" | "));
    }
  }
  return out;
}

export interface SqlRun {
  out: string[];
  error?: { name: string; message: string };
}

/** Runs `setup` (tables and rows the exercise starts with), then the learner's SQL. */
export async function runSqlWith(PGlite: typeof PGliteT, sql: string, setup = ""): Promise<SqlRun> {
  const db = await PGlite.create();
  try {
    if (setup) await db.exec(setup);
    const results = (await db.exec(sql)) as Result[];
    return { out: formatResults(results) };
  } catch (e) {
    return { out: [], error: { name: "SQLError", message: (e as Error).message } };
  } finally {
    await db.close();
  }
}

// PGlite's Node code paths cannot be bundled by webpack, so the browser loads the same
// version straight from the CDN on first use (like Pyodide), and it is cached after that.
const PGLITE_URL = "https://cdn.jsdelivr.net/npm/@electric-sql/pglite@0.5.15/dist/index.js";
let loaded: Promise<typeof PGliteT> | null = null;

/** Browser entry: loads PGlite on first use. */
export async function runSql(sql: string, setup = ""): Promise<SqlRun> {
  loaded ??= import(/* webpackIgnore: true */ PGLITE_URL).then((m: { PGlite: typeof PGliteT }) => m.PGlite);
  try {
    return runSqlWith(await loaded, sql, setup);
  } catch (e) {
    loaded = null;
    return { out: [], error: { name: "SQLError", message: `تعذّر تحميل قاعدة البيانات: ${(e as Error).message}` } };
  }
}
