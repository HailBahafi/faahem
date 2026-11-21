"use client";

import { motion } from "motion/react";
import { useState } from "react";

interface Branch {
  test: string;
  min: number | null;
  label: string;
}

const RIGHT: Branch[] = [
  { test: "if grade >= 90:", min: 90, label: "A" },
  { test: "elif grade >= 70:", min: 70, label: "B" },
  { test: "elif grade >= 50:", min: 50, label: "C" },
  { test: "else:", min: null, label: "F" },
];
const FLIPPED: Branch[] = [RIGHT[2], RIGHT[1], RIGHT[0], RIGHT[3]].map((b, i) => ({ ...b, test: i === 0 ? b.test.replace("elif", "if") : b.test.replace(/^if/, "elif") }));

/** A grade walks down an if/elif/else chain: the first true test wins and the rest are skipped. */
export default function PyIfProblem() {
  const [grade, setGrade] = useState(72);
  const [flipped, setFlipped] = useState(false);
  const chain = flipped ? FLIPPED : RIGHT;
  const winner = chain.findIndex((b) => b.min === null || grade >= b.min);
  const wrong = flipped && grade >= 70;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="code text-lg font-bold" dir="ltr">
          grade = <span className="text-num">{grade}</span>
        </span>
        <input type="range" min={0} max={100} value={grade} onChange={(e) => setGrade(Number(e.target.value))} className="flex-1 accent-[var(--accent)]" />
      </div>
      <div className="mb-4 flex gap-2">
        {[false, true].map((f) => (
          <button
            key={String(f)}
            onClick={() => setFlipped(f)}
            className={`rounded-xl border px-3 py-1.5 text-sm font-semibold ${flipped === f ? "border-accent bg-surface" : "border-line text-muted"}`}
          >
            {f ? "الترتيب المقلوب" : "الترتيب الصحيح"}
          </button>
        ))}
      </div>

      <div className="code space-y-1 rounded-2xl bg-code p-4 text-sm" dir="ltr">
        {chain.map((b, i) => {
          const state = i < winner ? "false" : i === winner ? "win" : "skip";
          return (
            <motion.div key={b.test} layout className={state === "skip" ? "opacity-35" : ""}>
              <div className="flex items-center gap-3">
                <span>{b.test}</span>
                {b.min !== null && state !== "skip" && (
                  <span className={`text-xs font-bold ${state === "win" ? "text-ok" : "text-err"}`}>
                    {grade} &gt;= {b.min} → {state === "win" ? "True" : "False"}
                  </span>
                )}
                {state === "skip" && <span className="text-xs text-muted">skipped</span>}
              </div>
              <div className={`ps-8 ${state === "win" ? "font-bold text-ok" : ""}`}>
                label = <span className="text-str">&quot;{b.label}&quot;</span>
                {state === "win" && <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}> ◀</motion.span>}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 min-h-12 text-center">
        {wrong ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            الطالب حصل على {grade} وأخذ {chain[winner].label}! أول شرط صادق يفوز، و grade &gt;= 50 صادق لكل درجة عالية. الأضيق يأتي أولاً.
          </motion.p>
        ) : (
          <p className="text-muted">يُفحص كل شرط من الأعلى. أول شرط صادق ينفَّذ فرعه، وبقية السلسلة تُتخطّى دون فحص.</p>
        )}
      </div>
    </div>
  );
}
