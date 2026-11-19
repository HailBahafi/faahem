"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const PLACES = [128, 64, 32, 16, 8, 4, 2, 1];

const GOALS: { label: string; target: number }[] = [
  { label: "اصنع الرقم 13", target: 13 },
  { label: "اصنع الحرف A", target: 65 },
  { label: "أكبر رقم ممكن", target: 255 },
];

/** Eight light switches: their pattern is a number, and the same number is a letter. */
export default function BitsProblem() {
  const [on, setOn] = useState<boolean[]>(Array(8).fill(false));
  const [goal, setGoal] = useState(0);

  const value = PLACES.reduce((sum, p, i) => sum + (on[i] ? p : 0), 0);
  const letter = value >= 33 && value <= 126 ? String.fromCharCode(value) : "·";
  const lit = PLACES.filter((_, i) => on[i]);
  const current = GOALS[goal];
  const solved = current !== undefined && value === current.target;

  const toggle = (i: number) => setOn((o) => o.map((b, k) => (k === i ? !b : b)));

  return (
    <div>
      <div dir="ltr" className="grid grid-cols-8 gap-1.5 sm:gap-3">
        {PLACES.map((p, i) => (
          <div key={p} className="flex flex-col items-center gap-1.5">
            <motion.div
              animate={{ opacity: on[i] ? 1 : 0.2, scale: on[i] ? 1 : 0.8 }}
              className="h-3 w-3 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggle(i)}
              aria-label={`switch ${p}`}
              className={`relative h-16 w-full max-w-12 rounded-xl border ${on[i] ? "border-accent bg-accent-soft/30" : "border-line bg-surface"}`}
            >
              <motion.span
                animate={{ y: on[i] ? -14 : 14 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`absolute inset-x-2 top-1/2 -mt-2.5 h-5 rounded-md ${on[i] ? "bg-accent" : "bg-muted/50"}`}
              />
            </motion.button>
            <span className={`code text-lg font-bold ${on[i] ? "text-fg" : "text-muted"}`}>{on[i] ? 1 : 0}</span>
            <span className="code text-[10px] text-muted sm:text-xs">{p}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-code p-4 text-center">
          <div className="text-xs text-muted">رقم</div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={value} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="code text-4xl font-bold text-num">
              {value}
            </motion.div>
          </AnimatePresence>
          <div dir="ltr" className="code mt-1 min-h-4 text-xs text-muted">
            {lit.length ? lit.join(" + ") : "0"}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-code p-4 text-center">
          <div className="text-xs text-muted">حرف</div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={letter} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="code text-4xl font-bold text-str">
              {letter}
            </motion.div>
          </AnimatePresence>
          <div className="mt-1 min-h-4 text-xs text-muted">المفاتيح نفسها، تُقرأ بطريقة أخرى</div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {current ? (
          <>
            <span className={`rounded-full px-4 py-2 font-semibold ${solved ? "bg-accent text-accent-fg" : "border border-line bg-surface"}`}>
              {solved ? "✓ " : ""}
              {current.label}
            </span>
            {solved && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setGoal((g) => g + 1)}
                className="rounded-2xl bg-accent px-5 py-2 font-bold text-accent-fg shadow-lg shadow-accent/20"
              >
                التالي
              </motion.button>
            )}
          </>
        ) : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
            ثمانية مفاتيح تسمّى <b className="text-fg">بايت</b>، وكل مفتاح <b className="text-fg">بت</b>. كل موقع ضعف الذي على يمينه، فتصنع 256 نمطاً من 0 إلى 255. والرقم نفسه قد يكون حرفاً: الحاسوب لا يرى إلا مفاتيح.
          </motion.p>
        )}
        {on.some(Boolean) && (
          <button onClick={() => setOn(Array(8).fill(false))} className="text-sm text-muted hover:text-fg">
            أطفئ الكل
          </button>
        )}
      </div>
    </div>
  );
}
