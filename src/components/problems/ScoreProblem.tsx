"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** Two scoreboards: one forgets every tap, one keeps the score in a variable. */
export default function ScoreProblem() {
  const [taps, setTaps] = useState(0);
  const remembered = taps * 10;
  const forgetful = taps > 0 ? 10 : 0;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <Board title="جهاز بلا ذاكرة" note="ينسى ما حدث قبل لحظة" value={forgetful} bad tick={taps} />
        <Board title="جهاز يحفظ النتيجة في متغير" note="score = score + 10" value={remembered} tick={taps} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setTaps((t) => t + 1)}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20"
        >
          اجمع 10 نقاط
        </motion.button>
        {taps > 0 && (
          <button onClick={() => setTaps(0)} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
        {taps >= 3 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
            لاحظت؟ لكي يتذكّر البرنامج شيئاً، يجب أن يضعه في <b className="text-fg">درج في الذاكرة له اسم</b>. هذا هو المتغير.
          </motion.p>
        )}
      </div>
    </div>
  );
}

function Board({ title, note, value, bad, tick }: { title: string; note: string; value: number; bad?: boolean; tick: number }) {
  return (
    <div className={`rounded-2xl border p-5 ${bad ? "border-line bg-surface" : "border-accent/50 bg-accent-soft/20"}`}>
      <div className="font-semibold">{title}</div>
      <div className="code text-xs text-muted" dir={bad ? "rtl" : "ltr"}>{note}</div>
      <div className="relative mt-4 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-code">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={tick}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className={`code text-5xl font-bold ${bad ? "text-[#ff8a8a]" : "text-[var(--accent)]"}`}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
