"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Field = "name" | "email" | "age";
type Body = Record<Field, string | number>;
interface Row { body: Body; bad: Field[] }

const CHIPS: Record<Field, string[]> = {
  name: ["Sara", "", "<script>alert(1)</script>", "x' OR '1'='1"],
  email: ["sara@mail.com", "sara"],
  age: ["25", "-5", "abc", "999"],
};

/** The same rules run in the browser (when on) and on the server (when on). */
function validate(b: Body): { field: Field; msg: string }[] {
  const e: { field: Field; msg: string }[] = [];
  const name = b.name;
  if (typeof name !== "string" || name.trim() === "") e.push({ field: "name", msg: "name is required" });
  else if (name.length > 20 || /[<>'"]/.test(name)) e.push({ field: "name", msg: "name: letters only, max 20" });
  if (typeof b.email !== "string" || !b.email.includes("@")) e.push({ field: "email", msg: "email must contain @" });
  if (typeof b.age !== "number" || b.age < 13 || b.age > 120) e.push({ field: "age", msg: "age must be a number 13-120" });
  return e;
}

/** JSON as the request carries it: numeric text becomes a number, anything else stays text. */
function toBody(form: Record<Field, string>): Body {
  const age = form.age.trim() !== "" && !isNaN(Number(form.age)) ? Number(form.age) : form.age;
  return { name: form.name, email: form.email, age };
}

export default function ValidationProblem() {
  const [form, setForm] = useState<Record<Field, string>>({ name: "", email: "sara", age: "abc" });
  const [browserOn, setBrowserOn] = useState(true);
  const [serverOn, setServerOn] = useState(false);
  const [blocked, setBlocked] = useState<{ field: Field; msg: string }[]>([]);
  const [flying, setFlying] = useState<null | "form" | "direct">(null);
  const [reply, setReply] = useState<{ status: number; lines: string[] } | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [shot, setShot] = useState(0);

  const body = toBody(form);
  const badRows = rows.filter((r) => r.bad.length > 0).length;

  function send(how: "form" | "direct") {
    if (flying) return;
    setReply(null);
    if (how === "form" && browserOn) {
      const e = validate(body);
      setBlocked(e);
      if (e.length) return;
    } else setBlocked([]);
    setFlying(how);
    setShot((k) => k + 1);
    setTimeout(() => {
      setFlying(null);
      const e = validate(body);
      if (serverOn && e.length) {
        setReply({ status: 400, lines: e.map((x) => x.msg) });
        return;
      }
      setRows((r) => [...r, { body, bad: e.map((x) => x.field) }]);
      setReply({ status: 201, lines: ["saved"] });
    }, 800);
  }

  const set = (f: Field, v: string) => { setForm((x) => ({ ...x, [f]: v })); setBlocked([]); };
  const show = (v: string | number) => (typeof v === "number" ? String(v) : JSON.stringify(v));

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        {/* Browser */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold">
            <span>المتصفح: نموذج التسجيل</span>
            <Toggle on={browserOn} set={setBrowserOn} label="فحص المتصفح" />
          </div>
          {(["name", "email", "age"] as Field[]).map((f) => {
            const err = blocked.find((b) => b.field === f);
            return (
              <div key={f} className="mb-2">
                <div className="flex items-center gap-2" dir="ltr">
                  <span className="code w-12 text-sm text-muted">{f}</span>
                  <input value={form[f]} onChange={(e) => set(f, e.target.value)} className={`code min-w-0 flex-1 rounded-lg border bg-surface-2 px-2 py-1 text-sm ${err ? "border-err" : "border-line"}`} />
                </div>
                <div className="mt-1 flex flex-wrap gap-1" dir="ltr">
                  {CHIPS[f].map((c) => (
                    <button key={c} onClick={() => set(f, c)} className="code max-w-[11rem] truncate rounded bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">{c === "" ? '""' : c}</button>
                  ))}
                </div>
                {err && <p className="code mt-1 text-xs text-err" dir="ltr">{err.msg}</p>}
              </div>
            );
          })}
          <div className="mt-3 flex flex-wrap gap-2">
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => send("form")} className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg">سجّل عبر النموذج</motion.button>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => send("direct")} className="rounded-xl border border-err px-4 py-2 font-bold text-err">أرسل مباشرة</motion.button>
          </div>
          {blocked.length > 0 && <p className="mt-2 text-xs text-muted">أوقفه المتصفح، ولم يخرج طلب. لكن «أرسل مباشرة» لا تمرّ بالنموذج.</p>}
        </div>

        {/* Wire */}
        <div className="relative flex h-10 items-center self-center md:w-20">
          <div className="h-0.5 w-full rounded bg-line" />
          <AnimatePresence>
            {flying && (
              <motion.div key={shot} initial={{ left: "0%", opacity: 0 }} animate={{ left: "85%", opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full ${flying === "direct" ? "bg-err" : "bg-accent"}`} />
            )}
          </AnimatePresence>
        </div>

        {/* Server */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold">
            <span>الخادم</span>
            <Toggle on={serverOn} set={setServerOn} label="تحقق الخادم" />
          </div>
          <pre dir="ltr" className="code overflow-x-auto rounded-xl bg-code p-2 text-xs leading-5 text-code-fg">
            {`POST /users\n{ "name": ${show(body.name)}, "email": ${show(body.email)}, "age": ${show(body.age)} }`}
          </pre>
          <div className="mt-2 min-h-[3rem] text-sm">
            {reply ? (
              <motion.div key={shot} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} dir="ltr">
                <b className={`code ${reply.status === 400 ? "text-bool" : "text-ok"}`}>{reply.status}</b>{" "}
                <span className="code text-xs">{reply.lines.join(" · ")}</span>
              </motion.div>
            ) : (
              <span className="text-muted">{flying ? "الطلب في الطريق…" : "ينتظر طلباً"}</span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-sm font-semibold">
            <span>قاعدة البيانات</span>
            {rows.length > 0 && <button onClick={() => { setRows([]); setReply(null); }} className="text-xs text-muted underline">فرّغ</button>}
          </div>
          <table className="code mt-1 w-full table-fixed text-xs" dir="ltr">
            <thead><tr className="text-muted"><th className="p-1 text-left">name</th><th className="p-1 text-left">email</th><th className="w-12 p-1 text-left">age</th></tr></thead>
            <tbody>
              {rows.map((r, k) => (
                <motion.tr key={k} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`border-t border-line ${r.bad.length ? "bg-err/10" : ""}`}>
                  {(["name", "email", "age"] as Field[]).map((f) => (
                    <td key={f} className={`truncate p-1 ${r.bad.includes(f) ? "font-bold text-err" : ""}`}>{show(r.body[f])}</td>
                  ))}
                </motion.tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={3} className="p-2 text-center text-muted">فارغة</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {badRows > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          {serverOn
            ? "التحقق يعمل الآن عند الباب: أي طلب، من النموذج أو مباشرة، يُفحص قبل أن يدخل."
            : <>في القاعدة <b className="text-err">{badRows}</b> صف فاسد. فحص المتصفح لا يحمي الخادم: من يرسل مباشرة لا يمرّ به. شغّل «تحقق الخادم» وأعد المحاولة.</>}
        </motion.p>
      )}
    </div>
  );
}

function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => set(!on)} className="flex items-center gap-2 text-xs font-normal">
      {label}
      <span className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-ok" : "bg-line"}`}>
        <motion.span animate={{ x: on ? 16 : 2 }} className="absolute top-0.5 h-4 w-4 rounded-full bg-surface shadow" style={{ left: 0 }} />
      </span>
    </button>
  );
}
