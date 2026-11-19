"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Mode = "queue" | "stack";
type Customer = { id: number; waited: number };

/** A bank counter: customers join at the back; the clerk serves either the front (queue) or the newest (stack). */
export default function QueueProblem() {
  const [mode, setMode] = useState<Mode>("queue");
  const [line, setLine] = useState<Customer[]>([]);
  const [nextId, setNextId] = useState(1);
  const [served, setServed] = useState<number[]>([]);

  // Every action is one tick: everyone still in line waits one more turn.
  const tick = (l: Customer[]) => l.map((c) => ({ ...c, waited: c.waited + 1 }));

  const arrive = () => {
    setLine([...tick(line), { id: nextId, waited: 0 }]);
    setNextId(nextId + 1);
  };
  const serve = () => {
    if (!line.length) return;
    const k = mode === "queue" ? 0 : line.length - 1;
    setServed([...served, line[k].id]);
    setLine(tick(line.filter((_, i) => i !== k)));
  };
  const reset = (m: Mode) => {
    setMode(m);
    setLine([]);
    setNextId(1);
    setServed([]);
  };

  const oldest = line.length ? Math.max(...line.map((c) => c.waited)) : 0;
  const unfair = mode === "stack" && line.length > 0 && line[0].waited >= 5;

  return (
    <div>
      <div className="flex gap-2">
        {(["queue", "stack"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => reset(m)}
            className={`rounded-xl px-4 py-2 font-bold ${mode === m ? "bg-accent text-accent-fg" : "border border-line text-muted"}`}
          >
            {m === "queue" ? "اخدم الأقدم (طابور)" : "اخدم الأحدث (مكدّس)"}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4" dir="ltr">
        <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-code text-xs text-muted">
          <span className="font-bold">الشبّاك</span>
        </div>
        <div className="flex min-h-16 flex-1 items-center gap-2 overflow-hidden">
          <AnimatePresence initial={false}>
            {line.map((c, k) => {
              const next = mode === "queue" ? k === 0 : k === line.length - 1;
              const angry = c.waited >= 5;
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className={`flex w-12 shrink-0 flex-col items-center gap-1 rounded-xl py-1 ${next ? "ring-2 ring-accent" : ""}`}
                >
                  <div
                    className={`code flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                      angry ? "bg-err/25 text-err" : "bg-accent/20 text-num"
                    }`}
                  >
                    {c.id}
                  </div>
                  <span className={`code text-[10px] ${angry ? "text-err" : "text-muted"}`}>⏱{c.waited}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <span className="text-xs text-muted">الخلف</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={arrive} className="rounded-2xl border border-line px-5 py-3 font-bold">
          + عميل يصل
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={!line.length}
          onClick={serve}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          اخدم التالي
        </motion.button>
        {served.length > 0 && (
          <span className="code text-sm text-muted" dir="ltr">
            served: {served.join(", ")}
          </span>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {!line.length && !served.length && <p className="text-muted">أدخل أربعة عملاء، ثم بدّل بين الخدمة والوصول.</p>}
        {mode === "queue" && served.length >= 3 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            خُدموا بترتيب وصولهم، وأطول انتظار الآن {oldest}. أول الواصلين أول المخدومين: هذا هو <b>الطابور</b>. جرّب الآن المكدّس.
          </motion.p>
        )}
        {unfair && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            العميل {line[0].id} وصل أولاً، وينتظر منذ {line[0].waited} أدوار، وكل واصل جديد يتقدّم عليه. المكدّس ظالم في الشبّاك.
          </motion.p>
        )}
      </div>
    </div>
  );
}
