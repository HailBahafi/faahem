import { currentUser } from "@/lib/server/auth";
import { hasDb } from "@/lib/server/db";
import { json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** `enabled: false` tells the browser to stay in local-only mode and hide account UI. */
export async function GET() {
  if (!hasDb) return json({ enabled: false, user: null });
  return json({ enabled: true, user: await currentUser() });
}
