"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type St = "wait" | "run" | "ok" | "fail" | "skip";
interface Preset { id: string; msg: string; label: string; failAt: number | null; log: string; bug?: boolean }
interface Run { n: number; id: string; msg: string; failAt: number | null; log: string; bug?: boolean; rollback?: boolean; st: St[]; done: boolean }

const STAGES = ["checkout", "npm ci", "lint", "test", "build", "deploy"];
const PRESETS: Preset[] = [
  { id: "c9d", msg: "cart total", label: "يكسر اختباراً", failAt: 3, log: "✗ cart.test.js: expected 60, received 30" },
  { id: "e21", msg: "quick fix", label: "يكسر lint", failAt: 2, log: "✗ app.js:14  'price' is not defined  (no-undef)" },
  { id: "f40", msg: "fix cart total", label: "سليم", failAt: null, log: "✓ 38 tests passed · image shop:f40 built" },
  { id: "h52", msg: "new checkout", label: "خطأ تفوته الاختبارات", failAt: null, log: "✓ 38 tests passed · image shop:h52 built", bug: true },
];

const DOT: Record<St, string> = {
  wait: "border-line bg-surface text-muted",
  run: "border-accent bg-accent/15 text-fg",
  ok: "border-ok bg-ok/20 text-ok",
  fail: "border-err bg-err/20 text-err",
  skip: "border-line bg-surface-2 text-muted opacity-50",
};
const ICON: Record<St, string> = { wait: "·", run: "…", ok: "✓", fail: "✗", skip: "–" };

/** Advance a run by one tick: a waiting stage starts, a running stage finishes green or red. */
function advance(r: Run): Run {
  const i = r.st.findIndex((s) => s === "wait" || s === "run");
  if (i < 0) return { ...r, done: true };
  const st = [...r.st];
  if (st[i] === "wait") st[i] = "run";
  else if (i === r.failAt) {
    st[i] = "fail";
    for (let k = i + 1; k < st.length; k++) st[k] = "skip";
    return { ...r, st, done: true };
  } else st[i] = "ok";
  return { ...r, st, done: st.every((s) => s === "ok" || s === "skip") };
}

/** A pipeline board: every push runs the stages in order; only a fully green run deploys, and rollback redeploys the previous image. */
export default function CiCdProblem() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [live, setLive] = useState<{ id: string; bug?: boolean }>({ id: "b7c" });
  const [history, setHistory] = useState<string[]>(["a1f", "b7c"]);
  const [note, setNote] = useState("الخادم يشغّل shop:b7c. ادفع تعديلاً إلى main وراقب الخط.");
  const busy = runs.some((r) => !r.done);

  useEffect(() => {
    const active = runs.find((r) => !r.done);
    if (!active) return;
    const t = setTimeout(() => {
      const next = advance(active);
      setRuns((rs) => rs.map((r) => (r.n === active.n ? next : r)));
      if (!next.done) return;
      const failed = next.st.indexOf("fail");
      if (failed >= 0) {
        setNote(`فشلت مرحلة ${STAGES[failed]}، فتوقف الخط وبقيت المراحل التالية رمادية. ${next.id} لن تصل إلى المستخدمين، والخادم ما زال على ${live.id}.`);
        return;
      }
      setLive({ id: next.id, bug: next.bug });
      setHistory((h) => [...h, next.id]);
      if (next.rollback) setNote(`تراجع: أُعيد نشر shop:${next.id} الجاهزة دون بناء ولا انتظار. الأخطاء توقفت، والآن أصلح بهدوء.`);
      else if (next.bug) setNote(`كل المراحل خضراء فنُشرت ${next.id}… لكن المستخدمين يرون أخطاء لم يكتب لها أحد اختباراً. اضغط التراجع.`);
      else setNote(`كل المراحل خضراء، فبُنيت الصورة shop:${next.id} ونُشرت تلقائياً. لم يلمس أحد الخادم.`);
    }, 520);
    return () => clearTimeout(t);
  }, [runs, live.id]);

  const pushCommit = (p: Preset) => {
    if (busy) return;
    setNote(`push ${p.id} → main: الروبوت استيقظ وبدأ على حاسوب فارغ.`);
    setRuns((rs) => [{ n: rs.length, id: p.id, msg: p.msg, failAt: p.failAt, log: p.log, bug: p.bug, st: STAGES.map(() => "wait" as St), done: false }, ...rs].slice(0, 5));
  };

  const rollback = () => {
    if (busy) return;
    const prev = [...history].reverse().find((v) => v !== live.id && !PRESETS.some((p) => p.id === v && p.bug));
    if (!prev) return;
    setRuns((rs) => [{ n: rs.length, id: prev, msg: `rollback → ${prev}`, failAt: null, log: `↺ redeploy existing image shop:${prev}`, rollback: true, st: STAGES.map((_, k) => (k < STAGES.length - 1 ? "skip" : "wait") as St), done: false }, ...rs].slice(0, 5));
  };

  const btn = "rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold disabled:opacity-40";
  return (
    <div>
      <div className="grid gap-3 md:grid-cols-[1fr_200px]">
        <div className="min-h-[13rem] space-y-2 rounded-2xl bg-code p-3" dir="ltr">
          {!runs.length && <p className="p-6 text-center text-sm text-muted" dir="rtl">لا تشغيلات بعد. ادفع commit من الأزرار بالأسفل.</p>}
          <AnimatePresence initial={false}>
            {runs.map((r) => {
              const failed = r.st.includes("fail");
              const green = r.done && !failed;
              return (
                <motion.div key={r.n} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border p-2 ${failed ? "border-err/60" : green ? "border-ok/60" : "border-line"}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="code font-bold">{r.id} <span className="font-normal text-muted">{r.msg}</span></span>
                    <span className={`code font-bold ${failed ? "text-err" : green ? "text-ok" : "text-muted"}`}>
                      {failed ? "merge blocked" : green ? (r.rollback ? "rolled back" : "deployed") : "running"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    {STAGES.map((s, k) => (
                      <div key={s} className="flex items-center gap-1">
                        <motion.div animate={r.st[k] === "run" ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={{ repeat: r.st[k] === "run" ? Infinity : 0, duration: 0.6 }} className={`code rounded-lg border px-2 py-1 text-[11px] ${DOT[r.st[k]]}`}>
                          {ICON[r.st[k]]} {s}
                        </motion.div>
                        {k < STAGES.length - 1 && <span className="text-muted">›</span>}
                      </div>
                    ))}
                  </div>
                  {r.done && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`code mt-1.5 text-[11px] ${failed ? "text-err" : "text-muted"}`}>
                      {r.log}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-3">
          <div className="text-xs font-semibold text-muted">الخادم (المستخدمون يرون هذا)</div>
          <motion.div key={live.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`code mt-2 rounded-xl border-2 p-3 text-center text-lg font-bold ${live.bug ? "border-err text-err" : "border-ok text-ok"}`} dir="ltr">
            shop:{live.id}
          </motion.div>
          <div className={`mt-2 text-center text-xs ${live.bug ? "text-err" : "text-ok"}`}>{live.bug ? "أخطاء 500 عند الدفع" : "يعمل بسلام"}</div>
          <div className="code mt-3 text-[11px] text-muted" dir="ltr">images: {history.filter((v, k) => history.indexOf(v) === k).join(" · ")}</div>
          <motion.button whileTap={{ scale: 0.92 }} onClick={rollback} disabled={busy || history.length < 2} className={`${btn} mt-3 w-full ${live.bug ? "border-err text-err ring-2 ring-err/40" : ""}`}>
            ↺ تراجع
          </motion.button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <motion.button key={p.id} whileTap={{ scale: 0.92 }} onClick={() => pushCommit(p)} disabled={busy} className={btn}>
            <span className="code" dir="ltr">push {p.id}</span> <span className="text-xs font-normal text-muted">({p.label})</span>
          </motion.button>
        ))}
        <button onClick={() => { setRuns([]); setLive({ id: "b7c" }); setHistory(["a1f", "b7c"]); setNote("الخادم يشغّل shop:b7c. ادفع تعديلاً إلى main وراقب الخط."); }} className="px-2 text-sm text-muted hover:text-fg">
          ابدأ من جديد
        </button>
      </div>

      <div className="mt-3 min-h-[3rem] text-sm">
        <AnimatePresence mode="wait">
          <motion.p key={note} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {note}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
