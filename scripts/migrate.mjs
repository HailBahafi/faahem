// Applies db/schema.sql to DATABASE_URL. Safe to run repeatedly.
import { readFileSync } from "node:fs";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (see .env.example).");
  process.exit(1);
}
const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  await sql.unsafe(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  console.log("schema applied");
} finally {
  await sql.end();
}
