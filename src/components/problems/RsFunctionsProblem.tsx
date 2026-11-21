"use client";

import { motion } from "motion/react";
import { useState } from "react";

/** One semicolon decides whether the last line of a function is its return value or a thrown-away statement. */
export default function RsFunctionsProblem() {
  const [semi, setSemi] = useState(false);
  const [n, setN] = useState(4);

  return (
    <div>
      <div className="code rounded-2xl bg-code p-5 text-lg leading-9" dir="ltr">
        <div>
          <span className="text-bool">fn</span> double(n: i32) -&gt; i32 {"{"}
        </div>
        <div className="pl-8">
          n * 2
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setSemi((s) => !s)}
            className={`mx-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 border-dashed align-middle ${semi ? "border-err text-err" : "border-accent/60 text-muted"}`}
            title="toggle ;"
          >
            {semi ? ";" : ""}
          </motion.button>
        </div>
        <div>{"}"}</div>
        <div className="mt-3 text-muted">
          double(
          <input type="range" min={0} max={9} value={n} onChange={(e) => setN(Number(e.target.value))} className="mx-2 w-24 align-middle accent-[var(--accent)]" />
          <span className="text-num">{n}</span>)
        </div>
      </div>
      <motion.div
        key={String(semi) + n}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-4 rounded-2xl border p-4 ${semi ? "border-err/60" : "border-accent/50 bg-accent-soft/20"}`}
      >
        {semi ? (
          <div className="code text-sm text-err" dir="ltr">
            <div>error[E0308]: mismatched types</div>
            <div className="text-muted">expected `i32`, found `()`</div>
            <div className="text-muted">help: remove this semicolon to return this value</div>
          </div>
        ) : (
          <div className="code text-2xl font-bold" dir="ltr">
            double({n}) = <span className="text-num">{n * 2}</span>
          </div>
        )}
      </motion.div>
      <p className="mt-3 text-muted">
        {semi
          ? "مع الفاصلة صار n * 2 جملة تُحسب ثم تُرمى، والدالة لم تعد ترجع شيئاً. المترجم يكتشف ذلك قبل التشغيل."
          : "اضغط المربّع المنقّط بعد n * 2 لتضيف فاصلة منقوطة."}
      </p>
    </div>
  );
}
