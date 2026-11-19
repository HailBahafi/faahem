"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const GRADES = [70, 85, 90, 60, 95, 75, 88, 66, 92, 81, 77, 99];
const START = 3;
const OVERFLOW = 8;

/** A grade book: one variable per student overflows; one row of numbered cells does not. */
export default function ArraysProblem() {
  const [count, setCount] = useState(START);
  const [row, setRow] = useState(false);
  const grades = GRADES.slice(0, count);
  const full = count >= GRADES.length;

  const add = () => {
    if (!full) setCount((c) => c + 1);
  };
  const reset = () => {
    setCount(START);
    setRow(false);
  };

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        {!row ? (
          <motion.div key="vars" exit={{ opacity: 0 }} className="grid gap-3">
            <div
              className={`code h-56 overflow-y-auto rounded-2xl bg-code p-5 text-sm leading-7 ${count >= OVERFLOW ? "ring-2 ring-err" : ""}`}
              dir="ltr"
            >
              <AnimatePresence initial={false}>
                {grades.map((g, k) => (
                  <motion.div key={k} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    let score{k + 1} = <span className="text-num">{g}</span>;
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="mt-2 break-words">
                let total = {grades.map((_, k) => `score${k + 1}`).join(" + ")};
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {grades.map((g, k) => (
                <motion.div
                  key={k}
                  layout
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="code flex w-14 flex-col items-center rounded-lg border border-line bg-surface py-1 text-xs"
                >
                  <span className="text-muted">score{k + 1}</span>
                  <span className="text-num font-bold">{g}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2" dir="ltr">
              <div className="code shrink-0 rounded-xl border border-line bg-surface px-3 py-2 font-bold">scores</div>
              <span className="shrink-0 text-2xl text-accent">→</span>
              <div className="flex shrink-0 rounded-xl border-2 border-accent">
                <AnimatePresence initial={false}>
                  {grades.map((g, k) => (
                    <motion.div
                      key={k}
                      layout
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 48 }}
                      exit={{ opacity: 0, width: 0 }}
                      className={`code flex flex-col items-center py-1 ${k > 0 ? "border-l border-line" : ""}`}
                    >
                      <span className="text-num font-bold">{g}</span>
                      <span className={`text-xs ${k === count - 1 ? "text-accent font-bold" : "text-muted"}`}>{k}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <div className="code rounded-2xl bg-code p-5 text-sm leading-7" dir="ltr">
              <div>
                let scores = [{grades.join(", ")}];
              </div>
              <div className="mt-2">for (let i = 0; i &lt; scores.length; i++) {"{"}</div>
              <div className="pl-6">total = total + scores[i];</div>
              <div>{"}"}</div>
            </div>
            <div className="code text-sm text-muted" dir="ltr">
              scores.length = <span className="text-num">{count}</span> · last index ={" "}
              <span className="text-accent font-bold">{count - 1}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={full}
          onClick={add}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          {row ? "scores.push" : "طالب جديد"}
        </motion.button>
        {row && count > 1 && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setCount((c) => c - 1)}
            className="code rounded-2xl border border-line px-4 py-3 font-bold"
          >
            scores.pop
          </motion.button>
        )}
        {!row && count >= OVERFLOW && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setRow(true)}
            className="rounded-2xl border border-accent px-4 py-3 font-bold"
          >
            ضعهم في صفّ واحد
          </motion.button>
        )}
        {(row || count > START) && (
          <button onClick={reset} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {!row && count < OVERFLOW && <p className="text-muted">كل طالب يحتاج متغيراً جديداً، وسطر الجمع يطول معه.</p>}
        {!row && count >= OVERFLOW && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            {count} طلاب فقط والكود لا يتسع. الفصل الحقيقي فيه 30، والمدرسة فيها 1000.
          </motion.p>
        )}
        {row && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
            متغير واحد يشير إلى <b className="text-fg">صفّ واحد</b> من خانات مرقّمة تبدأ من 0. أضف أو احذف من آخره، والحلقة لا تتغير.
          </motion.p>
        )}
      </div>
    </div>
  );
}
