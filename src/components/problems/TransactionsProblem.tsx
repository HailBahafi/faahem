"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const START = { sara: 100, ali: 50 };
type Bal = typeof START;
type Op = { label: string; apply?: (b: Bal) => Bal; commit?: boolean };

const ops = (tx: boolean): Op[] => [
  ...(tx ? [{ label: "BEGIN;" }] : []),
  { label: "UPDATE ... - 30 WHERE name = 'Sara';", apply: (b) => ({ ...b, sara: b.sara - 30 }) },
  { label: "UPDATE ... + 30 WHERE name = 'Ali';", apply: (b) => ({ ...b, ali: b.ali + 30 }) },
  ...(tx ? [{ label: "COMMIT;", commit: true }] : []),
];

/** A transfer run step by step; pulling the plug keeps only what was saved. */
export default function TransactionsProblem() {
  const [tx, setTx] = useState(false);
  const [pc, setPc] = useState(0);
  const [live, setLive] = useState<Bal>(START);
  const [saved, setSaved] = useState<Bal>(START);
  const [crashed, setCrashed] = useState(false);
  const list = ops(tx);
  const done = pc >= list.length;
  const shown = crashed ? saved : live;
  const total = shown.sara + shown.ali;

  const reset = (t = tx) => {
    setTx(t);
    setPc(0);
    setLive(START);
    setSaved(START);
    setCrashed(false);
  };

  const step = () => {
    if (done || crashed) return;
    const op = list[pc];
    const next = op.apply ? op.apply(live) : live;
    setLive(next);
    // Without a transaction every statement is saved on its own; with one, only COMMIT saves.
    if (!tx || op.commit) setSaved(next);
    setPc(pc + 1);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {[false, true].map((t) => (
          <button
            key={String(t)}
            onClick={() => reset(t)}
            className={`rounded-xl px-4 py-2 font-bold ${tx === t ? "bg-accent text-accent-fg" : "border border-line"}`}
          >
            {t ? "مع معاملة" : "بلا معاملة"}
          </button>
        ))}
      </div>

      <div className="code grid gap-1 rounded-2xl bg-code p-3 text-sm" dir="ltr">
        {list.map((op, k) => (
          <div key={op.label} className={`rounded px-2 py-1 ${k === pc && !crashed ? "bg-accent/20" : k < pc ? "text-muted" : ""}`}>
            {k < pc ? "✓ " : k === pc && !crashed ? "▶ " : "  "}
            {op.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ["Sara", shown.sara],
          ["Ali", shown.ali],
        ].map(([n, v]) => (
          <div key={n} className="rounded-2xl border border-line bg-surface p-3 text-center">
            <div className="code text-sm text-muted">{n}</div>
            <AnimatePresence mode="popLayout">
              <motion.div key={String(v)} initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="code text-3xl font-bold text-num">
                {v}
              </motion.div>
            </AnimatePresence>
          </div>
        ))}
        <div className={`rounded-2xl border p-3 text-center ${total === 150 ? "border-ok/50" : "border-err/60 bg-err/10"}`}>
          <div className="text-sm text-muted">المجموع</div>
          <div className={`code text-3xl font-bold ${total === 150 ? "text-ok" : "text-err"}`}>{total}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={step}
          disabled={done || crashed}
          className="rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg disabled:opacity-40"
        >
          الخطوة التالية
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setCrashed(true)}
          disabled={crashed}
          className="rounded-2xl border border-err px-5 py-3 font-bold text-err disabled:opacity-40"
        >
          ⚡ اسحب القابس
        </motion.button>
        <button onClick={() => reset()} className="text-sm text-muted hover:text-fg">
          ابدأ من جديد
        </button>
      </div>

      <div className="min-h-12">
        {crashed && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={total === 150 ? "text-ok" : "text-err"}>
            {total === 150
              ? tx && pc > 0 && pc < list.length
                ? "أُعيد التشغيل: المسودة غير المثبّتة رُميت كلها. لا مال ضائع."
                : "أُعيد التشغيل: المجموع سليم."
              : "أُعيد التشغيل: الخصم حُفظ وحده، والإضافة لم تحدث. 30 ريالاً اختفت. جرّب مع معاملة."}
          </motion.p>
        )}
        {!crashed && done && <p className="text-muted">اكتمل التحويل. ابدأ من جديد واقطع الكهرباء في منتصفه.</p>}
      </div>
    </div>
  );
}
