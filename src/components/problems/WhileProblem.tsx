"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const TOTAL = 100;

/** Stamp 1..100: by hand, one press per number, versus one while loop that repeats the press. */
export default function WhileProblem() {
  const [manual, setManual] = useState(0);
  const [loop, setLoop] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function runLoop() {
    if (running) return;
    setLoop(0);
    setRunning(true);
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setLoop(i);
      if (i >= TOTAL) {
        if (timer.current) clearInterval(timer.current);
        setRunning(false);
      }
    }, 18);
  }

  function reset() {
    if (timer.current) clearInterval(timer.current);
    setRunning(false);
    setManual(0);
    setLoop(0);
  }

  const showInsight = manual >= 10 || loop >= TOTAL;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="بيدك" note={`ضغطت ${manual} من ${TOTAL}`} filled={manual} bad>
          <motion.button
            whileTap={{ scale: 0.92 }}
            disabled={manual >= TOTAL}
            onClick={() => setManual((m) => Math.min(TOTAL, m + 1))}
            className="rounded-2xl border border-line bg-surface px-5 py-2.5 font-bold disabled:opacity-40"
          >
            اختم {Math.min(manual + 1, TOTAL)}
          </motion.button>
        </Panel>
        <Panel title="بحلقة واحدة" note={`i = ${loop === 0 ? 1 : Math.min(loop + 1, TOTAL + 1)}`} filled={loop} code>
          <pre dir="ltr" className="code mb-3 rounded-xl bg-code p-3 text-xs leading-5 text-[var(--code-fg)]">
            {`let i = 1;\nwhile (i <= 100) {\n  stamp(i);\n  i = i + 1;\n}`}
          </pre>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={runLoop}
            disabled={running}
            className="rounded-2xl bg-accent px-5 py-2.5 font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-60"
          >
            شغّل الحلقة
          </motion.button>
        </Panel>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {(manual > 0 || loop > 0) && (
          <button onClick={reset} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
        {showInsight && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
            العمل نفسه يتكرر، وما يتغير هو الرقم فقط. الحلقة تكتب العمل <b className="text-fg">مرة واحدة</b> وتعيده ما دام الشرط صحيحاً.
          </motion.p>
        )}
      </div>
    </div>
  );
}

function Panel({
  title,
  note,
  filled,
  bad,
  code,
  children,
}: {
  title: string;
  note: string;
  filled: number;
  bad?: boolean;
  code?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${bad ? "border-line bg-surface" : "border-accent/50 bg-accent-soft/20"}`}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-semibold">{title}</div>
        <div className={`text-xs text-muted ${code ? "code" : ""}`} dir={code ? "ltr" : "rtl"}>{note}</div>
      </div>
      <div dir="ltr" className="my-4 grid grid-cols-10 gap-1">
        {Array.from({ length: TOTAL }, (_, k) => (
          <motion.div
            key={k}
            animate={k < filled ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0.35 }}
            transition={{ duration: 0.15 }}
            className={`code flex aspect-square items-center justify-center rounded text-[9px] font-bold ${
              k < filled ? (bad ? "bg-[#ff8a8a]/25 text-err" : "bg-accent text-accent-fg") : "bg-code text-transparent"
            }`}
          >
            {k + 1}
          </motion.div>
        ))}
      </div>
      {children}
    </div>
  );
}
