import { clearFailures, noteFailure, startSession, tooManyAttempts, verifyPassword } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { clientKey, fail, json, readJson, requireDb } from "@/lib/server/http";

export async function POST(req: Request) {
  const off = requireDb();
  if (off) return off;
  const body = await readJson<{ email?: string; password?: string }>(req);
  const email = body?.email?.trim().toLowerCase() ?? "";
  const key = `${clientKey(req)}|${email}`;
  if (tooManyAttempts(key)) return fail("محاولات كثيرة. انتظر 15 دقيقة ثم حاول.", 429);

  const rows = await db()<{ id: string; name: string; password_hash: string }[]>`
    SELECT id, name, password_hash FROM users WHERE lower(email) = ${email}`;
  const u = rows[0];
  if (!u || !(await verifyPassword(body?.password ?? "", u.password_hash))) {
    noteFailure(key);
    return fail("البريد أو كلمة المرور غير صحيحة.", 401);
  }
  clearFailures(key);
  await startSession(u.id);
  return json({ user: { id: u.id, email, name: u.name } });
}
