import { endSession } from "@/lib/server/auth";
import { json, requireDb } from "@/lib/server/http";

export async function POST() {
  const off = requireDb();
  if (off) return off;
  await endSession();
  return json({ ok: true });
}
