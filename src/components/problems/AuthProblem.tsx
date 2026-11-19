"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** A toy hash: same input, same output; no way back. NOT secure (real servers use scrypt or bcrypt). */
function toyHash(text: string) {
  let h = 7;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 1000003;
  h = (h * h + 12345) % 1000003;
  return h.toString(16).padStart(5, "0");
}

interface User { name: string; password: string; salt: string; role: "member" | "admin" }
const USERS: User[] = [
  { name: "sara", password: "pass1", salt: "q4", role: "member" },
  { name: "omar", password: "123456", salt: "z9", role: "member" },
  { name: "huda", password: "123456", salt: "m2", role: "admin" },
];
const LIMIT = 3;
const STAGES = ["الملح", "الفرم", "المقارنة"];

type View = "plain" | "nosalt" | "salt";

export default function AuthProblem() {
  const [name, setName] = useState("sara");
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<null | "ok" | "fail" | "locked">(null);
  const [fails, setFails] = useState<Record<string, number>>({});
  const [ticket, setTicket] = useState<{ token: string; name: string } | null>(null);
  const [later, setLater] = useState<{ path: string; status: number; text: string } | null>(null);
  const [view, setView] = useState<View>("salt");

  const user = USERS.find((u) => u.name === name)!;
  const salted = user.salt + password;
  const computed = toyHash(salted);
  const stored = toyHash(user.salt + user.password);
  const busy = stage >= 0 && result === null;

  function login() {
    if (busy) return;
    setResult(null);
    setLater(null);
    if ((fails[name] ?? 0) >= LIMIT) { setStage(-1); setResult("locked"); return; }
    setStage(0);
    setTimeout(() => setStage(1), 700);
    setTimeout(() => setStage(2), 1400);
    setTimeout(() => {
      if (computed === stored) {
        setResult("ok");
        setFails((f) => ({ ...f, [name]: 0 }));
        setTicket({ token: Math.random().toString(36).slice(2, 8), name });
      } else {
        setResult("fail");
        setFails((f) => ({ ...f, [name]: (f[name] ?? 0) + 1 }));
      }
    }, 2100);
  }

  function request(path: string) {
    if (!ticket) return setLater({ path, status: 401, text: "من أنت؟ لا تذكرة معك." });
    const who = USERS.find((u) => u.name === ticket.name)!;
    if (path === "/admin" && who.role !== "admin") return setLater({ path, status: 403, text: `أعرفك يا ${who.name}، لكن هذا ممنوع عليك.` });
    setLater({ path, status: 200, text: `أهلاً ${who.name}، هذه صفحتك.` });
  }

  const tone = (c: number) => (c < 300 ? "text-ok" : "text-err");
  const leaked = USERS.map((u) => (view === "plain" ? u.password : view === "nosalt" ? toyHash(u.password) : toyHash(u.salt + u.password)));
  const dup = (v: string) => leaked.filter((x) => x === v).length > 1;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Login */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap gap-2" dir="ltr">
          {USERS.map((u) => (
            <button key={u.name} onClick={() => { setName(u.name); setStage(-1); setResult(null); }} className={`code rounded-xl px-3 py-1.5 text-sm font-bold ${u.name === name ? "bg-accent text-accent-fg" : "border border-line bg-surface-2"}`}>
              {u.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input value={password} onChange={(e) => { setPassword(e.target.value); setStage(-1); setResult(null); }} placeholder="password" dir="ltr" className="code w-36 rounded-lg border border-line bg-surface-2 px-2 py-1.5" />
          <span className="text-xs text-muted" dir="ltr">({user.name}: {user.password})</span>
          <motion.button whileTap={{ scale: 0.92 }} onClick={login} disabled={busy} className="rounded-xl bg-accent px-4 py-1.5 font-bold text-accent-fg disabled:opacity-40">
            ادخل
          </motion.button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs" dir="ltr">
          {STAGES.map((label, k) => (
            <motion.div key={label} animate={{ opacity: stage >= k ? 1 : 0.3, scale: stage === k && !result ? 1.05 : 1 }} className="rounded-xl bg-code p-2 text-code-fg">
              <div dir="rtl" className="mb-1 font-semibold">{label}</div>
              <div className="code break-all">
                {k === 0 && <><span className="text-bool">{user.salt}</span><span className="text-str">{password || "…"}</span></>}
                {k === 1 && <span className="text-num">{stage >= 1 ? computed : "?????"}</span>}
                {k === 2 && (
                  <span className={stage >= 2 ? (computed === stored ? "text-ok" : "text-err") : ""}>
                    {stage >= 2 ? `${computed} ${computed === stored ? "=" : "≠"} ${stored}` : "?"}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div key={result + (fails[name] ?? 0)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-sm">
              {result === "ok" && <p><b className="code text-ok">200</b> — وصلتك تذكرة: <code className="code rounded bg-code px-1.5 py-0.5 text-code-fg" dir="ltr">Set-Cookie: session={ticket?.token}; HttpOnly</code></p>}
              {result === "fail" && <p><b className="code text-err">401</b> — اسم أو كلمة مرور خطأ. ({fails[name] ?? 0}/{LIMIT})</p>}
              {result === "locked" && <p><b className="code text-err">429</b> — محاولات كثيرة. الخادم لا يفحص كلمتك أصلاً الآن.</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Later requests */}
        <div className="mt-4 border-t border-line pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {["/orders", "/admin"].map((p) => (
              <button key={p} onClick={() => request(p)} className="code rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-sm" dir="ltr">GET {p}</button>
            ))}
            {ticket && <button onClick={() => { setTicket(null); setLater(null); }} className="rounded-lg px-2 py-1 text-xs text-muted underline">اخرج</button>}
          </div>
          <pre dir="ltr" className="code mt-2 rounded-xl bg-code p-2 text-xs leading-5 text-code-fg">
            {`GET ${later?.path ?? "/orders"} HTTP/1.1\n`}
            <span className={ticket ? "font-bold text-[var(--accent)]" : "text-code-fg/40"}>{ticket ? `Cookie: session=${ticket.token}` : "(no cookie)"}</span>
          </pre>
          {later && (
            <motion.p key={later.path + later.status + (ticket?.token ?? "")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm">
              <b className={`code ${tone(later.status)}`}>{later.status}</b> — {later.text}
            </motion.p>
          )}
        </div>
      </div>

      {/* Leaked database */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-3 font-semibold">قاعدة بيانات مسرّبة</div>
        <div className="flex flex-wrap gap-2 text-sm">
          {([["plain", "كلمات كما هي"], ["nosalt", "فرم بلا ملح"], ["salt", "فرم + ملح"]] as [View, string][]).map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} className={`rounded-lg px-2.5 py-1 ${v === view ? "bg-accent text-accent-fg font-bold" : "bg-surface-2 text-muted"}`}>{l}</button>
          ))}
        </div>
        <table className="code mt-3 w-full text-sm" dir="ltr">
          <thead>
            <tr className="text-muted"><th className="p-1 text-left">name</th>{view === "salt" && <th className="p-1 text-left">salt</th>}<th className="p-1 text-left">{view === "plain" ? "password" : "password_hash"}</th></tr>
          </thead>
          <tbody>
            {USERS.map((u, k) => (
              <tr key={u.name} className="border-t border-line">
                <td className="p-1">{u.name}</td>
                {view === "salt" && <td className="p-1 text-bool">{u.salt}</td>}
                <td className="p-1">
                  <motion.span key={view + leaked[k]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={view === "plain" || dup(leaked[k]) ? "font-bold text-err" : "text-num"}>
                    {leaked[k]}
                  </motion.span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm text-muted">
          {view === "plain" && "السارق قرأ كل كلمات المرور. انتهى الأمر."}
          {view === "nosalt" && "لا يرى الكلمات، لكن omar و huda متطابقان: كلمة واحدة. يكسر واحدة فيأخذ الاثنين."}
          {view === "salt" && "الكلمة نفسها، والفرم مختلف. ولا طريق من الفرم رجوعاً إلى الكلمة."}
        </p>
        <p className="mt-2 text-xs text-muted">فرم لعبة للتوضيح فقط، ليس آمناً.</p>
      </div>
    </div>
  );
}
