"use client";

import Link from "next/link";
import { useState } from "react";
import { accountChanged, postJson, useAccount } from "@/lib/account";
import { useProgress } from "@/lib/progress";

export default function AccountPanel() {
  const account = useAccount();
  const { progress } = useProgress();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!account) return <div className="h-40 animate-pulse rounded-2xl bg-surface" />;

  if (!account.enabled) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 leading-8">
        الحسابات غير مفعّلة في هذه النسخة من فاهم. تقدّمك محفوظ في هذا المتصفح فقط.
      </div>
    );
  }

  if (account.user) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <div className="text-2xl font-bold">{account.user.name}</div>
          <div className="text-muted" dir="ltr">{account.user.email}</div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-surface-2 p-3">
              <div className="text-2xl font-bold text-accent">{progress.completed.length}</div>
              <div className="text-sm text-muted">درس مكتمل</div>
            </div>
            <div className="rounded-xl bg-surface-2 p-3">
              <div className="text-2xl font-bold text-accent">{Object.keys(progress.review).length}</div>
              <div className="text-sm text-muted">درس في المراجعة</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">تقدّمك يُحفظ في حسابك تلقائياً، ويظهر على أي جهاز تسجّل الدخول منه.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/roadmap" className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-fg">أكمل التعلّم</Link>
          <button
            onClick={async () => { await postJson("/api/auth/logout"); accountChanged(); }}
            className="rounded-xl border border-line px-5 py-2.5"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await postJson(`/api/auth/${mode}`, mode === "login" ? { email: form.email, password: form.password } : form);
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "حدث خطأ، حاول مرة أخرى.");
    accountChanged();
  }

  const field = "w-full rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none focus:border-accent";
  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-surface p-6">
      <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            type="button"
            key={m}
            onClick={() => { setMode(m); setError(null); }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold ${mode === m ? "bg-accent text-accent-fg" : "text-muted"}`}
          >
            {m === "login" ? "تسجيل الدخول" : "حساب جديد"}
          </button>
        ))}
      </div>
      {mode === "register" && (
        <label className="block">
          <span className="mb-1 block text-sm text-muted">الاسم</span>
          <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required />
        </label>
      )}
      <label className="block">
        <span className="mb-1 block text-sm text-muted">البريد الإلكتروني</span>
        <input className={field} dir="ltr" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-muted">كلمة المرور {mode === "register" && "(8 أحرف على الأقل)"}</span>
        <input
          className={field}
          dir="ltr"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={mode === "register" ? 8 : undefined}
          required
        />
      </label>
      {error && <div className="rounded-lg border border-err/40 bg-err/10 px-3 py-2 text-sm text-err">{error}</div>}
      <button disabled={busy} className="w-full rounded-xl bg-accent py-3 font-bold text-accent-fg disabled:opacity-60">
        {busy ? "..." : mode === "login" ? "دخول" : "أنشئ حسابي"}
      </button>
      <p className="text-center text-xs text-muted">تقدّمك الحالي في هذا المتصفح يُضاف إلى حسابك ولا يضيع.</p>
    </form>
  );
}
