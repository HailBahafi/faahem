import { db, hasDb } from "@/lib/server/db";
import { json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDb) return json({ ok: true, db: "disabled" });
  try {
    await db()`SELECT 1`;
    return json({ ok: true, db: "up" });
  } catch {
    return json({ ok: false, db: "down" }, 503);
  }
}
