"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Call = { mode: "value" | "pointer"; before: number } | null;

/** Calling with a value changes only the function's copy; calling with an address changes the caller's drawer. */
export default function GoPointersProblem() {
  const [score, setScore] = useState(50);
  const [call, setCall] = useState<Call>(null);
  const [tries, setTries] = useState(0);

  const byValue = () => {
    setCall({ mode: "value", before: score });
    setTries((t) => t + 1);
  };
  const byPointer = () => {
    setCall({ mode: "pointer", before: score });
    setScore((s) => s + 10);
    setTries((t) => t + 1);
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2" dir="ltr">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="code text-sm text-muted">main</div>
          <div className="mt-3 flex items-center gap-3">
            <span className="code text-sm">score</span>
            <div className="code relative flex h-16 w-24 items-center justify-center overflow-hidden rounded-xl border-2 border-accent bg-code">
              <AnimatePresence mode="popLayout">
                <motion.span key={score} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="text-3xl font-bold text-num">
                  {score}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="code text-xs text-muted">@0xc010</span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="code text-sm text-muted">
            {call?.mode === "pointer" ? "func addPoints(p *int) { *p += 10 }" : "func addPoints(n int) { n += 10 }"}
          </div>
          <AnimatePresence mode="wait">
            {call && (
              <motion.div key={tries} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mt-3 flex items-center gap-3">
                <span className="code text-sm">{call.mode === "pointer" ? "p" : "n"}</span>
                <div className="code flex h-16 min-w-24 items-center justify-center rounded-xl border border-line bg-code px-3">
                  {call.mode === "pointer" ? (
                    <span className="text-lg font-bold text-accent">0xc010 → score</span>
                  ) : (
                    <motion.span initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-err">
                      {call.before + 10}
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3" dir="ltr">
        <motion.button whileTap={{ scale: 0.92 }} onClick={byValue} className="code rounded-2xl border border-line px-4 py-3 font-bold">
          addPoints(score)
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={byPointer}
          className="code rounded-2xl bg-accent px-4 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20"
        >
          addPoints(&amp;score)
        </motion.button>
        {tries > 0 && (
          <button
            onClick={() => {
              setScore(50);
              setCall(null);
              setTries(0);
            }}
            className="text-sm text-muted hover:text-fg"
          >
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {call?.mode === "value" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            الدالة أخذت نسخة من {call.before} وزادتها إلى {call.before + 10}، ثم اختفت النسخة. score في main لم يتغير.
          </motion.p>
        )}
        {call?.mode === "pointer" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
            الدالة أخذت <b className="text-fg">عنوان الدرج</b> لا قيمته، فكتبت في درج score نفسه. هذا هو المؤشر.
          </motion.p>
        )}
      </div>
    </div>
  );
}
