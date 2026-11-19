import { hashPassword, startSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { fail, json, readJson, requireDb } from "@/lib/server/http";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const off = requireDb();
  if (off) return off;
  const body = await readJson<{ name?: string; email?: string; password?: string }>(req);
  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  if (name.length < 2 || name.length > 60) return fail("الاسم بين 2 و 60 حرفاً.");
  if (!EMAIL.test(email) || email.length > 200) return fail("البريد الإلكتروني غير صحيح.");
  if (password.length < 8 || password.length > 200) return fail("كلمة المرور 8 أحرف على الأقل.");

  const hash = await hashPassword(password);
  const rows = await db()<{ id: string }[]>`
    INSERT INTO users (email, name, password_hash) VALUES (${email}, ${name}, ${hash})
    ON CONFLICT (lower(email)) DO NOTHING RETURNING id`;
  if (!rows[0]) return fail("هذا البريد مسجّل مسبقاً. سجّل الدخول بدلاً من ذلك.", 409);
  await startSession(rows[0].id);
  return json({ user: { id: rows[0].id, email, name } }, 201);
}
