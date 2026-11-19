"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Stage = { tokens: string[]; hot: [number, number] | null };

/** Each expression as the stages it folds through; `hot` marks the piece computed next. */
const PLAIN: Stage[] = [
  { tokens: ["2", "+", "3", "×", "4"], hot: [2, 4] },
  { tokens: ["2", "+", "12"], hot: [0, 2] },
  { tokens: ["14"], hot: null },
];
const PARENS: Stage[] = [
  { tokens: ["(", "2", "+", "3", ")", "×", "4"], hot: [0, 4] },
  { tokens: ["5", "×", "4"], hot: [0, 2] },
  { tokens: ["20"], hot: null },
];

/** Guess 2 + 3 × 4, then watch the expression fold piece by piece into one value. */
export default function OperatorsProblem() {
  const [parens, setParens] = useState(false);
  const [guess, setGuess] = useState<number | null>(null);
  const [stage, setStage] = useState(0);
  const stages = parens ? PARENS : PLAIN;
  const answer = parens ? 20 : 14;
  const done = stage === stages.length - 1;

  useEffect(() => {
    if (guess === null || done) return;
    const t = setTimeout(() => setStage((s) => s + 1), 1300);
    return () => clearTimeout(t);
  }, [guess, stage, done]);

  const reset = (p: boolean) => {
    setParens(p);
    setGuess(null);
    setStage(0);
  };

  const cur = stages[stage];
  const showHot = guess !== null && cur.hot;

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="text-sm text-muted">كم الناتج؟</div>
        <div className="mt-4 flex h-24 items-center justify-center rounded-xl bg-code" dir="ltr">
          <AnimatePresence mode="popLayout">
            {cur.tokens.map((tok, i) => {
              const hot = showHot && i >= cur.hot![0] && i <= cur.hot![1];
              const isNum = /\d/.test(tok);
              return (
                <motion.span
                  key={`${parens}-${stage}-${i}`}
                  layout
                  initial={{ opacity: 0, y: -16, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className={`code mx-1 rounded-lg px-1.5 text-4xl font-bold ${isNum ? "text-num" : "text-muted"} ${hot ? "bg-accent/25 ring-2 ring-accent" : ""}`}
                >
                  {tok}
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>

        {guess === null ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {[20, 14].map((g) => (
              <motion.button
                key={g}
                whileTap={{ scale: 0.92 }}
                onClick={() => setGuess(g)}
                className="code rounded-2xl bg-accent px-7 py-3 text-2xl font-bold text-accent-fg shadow-lg shadow-accent/20"
              >
                {g}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="mt-4 min-h-[3rem]">
            {done ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={guess === answer ? "text-ok" : "text-err"}>
                {guess === answer ? "صحيح!" : `ليس ${guess}.`} الناتج {answer}:{" "}
                {parens ? "الأقواس تُحسب أولاً." : "الضرب يُحسب قبل الجمع، لا من اليسار إلى اليمين."}
              </motion.p>
            ) : (
              <p className="text-muted">الجهاز يحسب القطعة المضيئة أولاً...</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {done && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => reset(!parens)}
            className="code rounded-xl border border-accent/60 px-4 py-2 font-semibold"
          >
            {parens ? "بدون أقواس" : "جرّب: (2 + 3) × 4"}
          </motion.button>
        )}
        {guess !== null && (
          <button onClick={() => reset(parens)} className="text-sm text-muted hover:text-fg">
            أعد المحاولة
          </button>
        )}
      </div>
      {done && parens && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          نفس الأرقام، ناتج مختلف. التعبير <b className="text-fg">يُطوى قطعة قطعة حتى يصير قيمة واحدة</b>، والأولوية تحدد أي قطعة تبدأ.
        </motion.p>
      )}
    </div>
  );
}
