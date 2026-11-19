// A Postgres for development without Docker: PGlite (Postgres compiled to WebAssembly) served
// on the normal Postgres port protocol. Data persists in ./.pglite. Run: npm run db:lite
// It serves one connection at a time, so .env.local sets DB_POOL_MAX=1 when using it.
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const port = Number(process.env.PGLITE_PORT ?? 5544);
const db = await PGlite.create("./.pglite");
const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1" });
await server.start();
console.log(`PGlite listening on 127.0.0.1:${port} (data in ./.pglite)`);

const stop = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
