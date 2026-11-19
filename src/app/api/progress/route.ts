import { currentUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { fail, json, readJson, requireDb } from "@/lib/server/http";
import { mergeProgress } from "@/lib/mergeProgress";
import type { Progress } from "@/lib/progress";

export const dynamic = "force-dynamic";

const EMPTY: Progress = { completed: [], quiz: {}, station: {}, review: {} };

function clean(p: unknown): Progress | null {
  if (!p || typeof p !== "object") return null;
  const x = p as Partial<Progress>;
  if (!Array.isArray(x.completed) || x.completed.length > 2000) return null;
  return {
    completed: x.completed.filter((s): s is string => typeof s === "string" && s.length < 80),
    quiz: x.quiz && typeof x.quiz === "object" ? x.quiz : {},
    station: x.station && typeof x.station === "object" ? x.station : {},
    review: x.review && typeof x.review === "object" ? x.review : {},
  };
}

export async function GET() {
  const off = requireDb();
  if (off) return off;
  const user = await currentUser();
  if (!user) return fail("unauthorized", 401);
  const rows = await db()<{ data: Progress }[]>`SELECT data FROM progress WHERE user_id = ${user.id}`;
  return json({ progress: rows[0]?.data ?? EMPTY });
}

/** Merges the browser's copy into the stored one (never loses progress) and returns the result. */
export async function PUT(req: Request) {
  const off = requireDb();
  if (off) return off;
  const user = await currentUser();
  if (!user) return fail("unauthorized", 401);
  const body = await readJson<{ progress?: unknown }>(req);
  if (JSON.stringify(body ?? "").length > 200_000) return fail("too large", 413);
  const incoming = clean(body?.progress);
  if (!incoming) return fail("invalid progress");

  const sql = db();
  const merged = await sql.begin(async (tx) => {
    const rows = await tx<{ data: Progress }[]>`SELECT data FROM progress WHERE user_id = ${user.id} FOR UPDATE`;
    const next = mergeProgress(rows[0]?.data ?? EMPTY, incoming);
    await tx`
      INSERT INTO progress (user_id, data, updated_at) VALUES (${user.id}, ${tx.json(next as never)}, now())
      ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
    return next;
  });
  return json({ progress: merged });
}
