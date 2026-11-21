"use client";

import { motion } from "motion/react";
import { useState } from "react";

const TOTAL = 17;
const SIZES = [2, 3, 4, 5, 6, 7, 8];

/** Python prints a float with ".0" when it has no fraction. */
const pyFloat = (v: number) => (Number.isInteger(v) ? `${v}.0` : String(v));

/** 17 sweets into boxes of n: // counts full boxes, % counts what is left, / gives the exact share. */
export default function PyOperatorsProblem() {
  const [size, setSize] = useState(5);
  const [tries, setTries] = useState(0);
  const full = Math.floor(TOTAL / size);
  const left = TOTAL % size;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-muted">حجم العلبة:</span>
        {SIZES.map((n) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setSize(n);
              setTries((t) => t + 1);
            }}
            className={`code h-10 w-10 rounded-xl font-bold ${size === n ? "bg-accent text-accent-fg" : "bg-code text-num"}`}
          >
            {n}
          </motion.button>
        ))}
      </div>

      <div className="flex min-h-28 flex-wrap items-end justify-center gap-3 rounded-2xl border border-line bg-surface p-4" dir="ltr">
        {Array.from({ length: full }, (_, b) => (
          <motion.div
            key={`${size}-${b}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: b * 0.05 }}
            className="flex flex-wrap justify-center gap-1 rounded-lg border-2 border-accent/60 bg-accent-soft/20 p-1.5"
            style={{ width: Math.min(size, 4) * 18 + 14 }}
          >
            {Array.from({ length: size }, (_, k) => (
              <span key={k} className="h-3.5 w-3.5 rounded-full bg-[var(--accent)]" />
            ))}
          </motion.div>
        ))}
        {left > 0 && (
          <div className="flex gap-1 rounded-lg border-2 border-dashed border-err/60 p-1.5">
            {Array.from({ length: left }, (_, k) => (
              <span key={k} className="h-3.5 w-3.5 rounded-full bg-err" />
            ))}
          </div>
        )}
      </div>

      <div className="code mt-4 grid gap-2 sm:grid-cols-3" dir="ltr">
        <Result expr={`17 // ${size}`} value={String(full)} note="علب ممتلئة" />
        <Result expr={`17 % ${size}`} value={String(left)} note="باقٍ خارج العلب" />
        <Result expr={`17 / ${size}`} value={pyFloat(TOTAL / size)} note="القسمة الدقيقة (float)" />
      </div>

      <div className="mt-4 min-h-10 text-center">
        {tries >= 3 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            ثلاثة أسئلة عن القسمة نفسها، ولكل سؤال عملية: <b className="text-accent">{"//"}</b> كم علبة كاملة، و <b className="text-accent">%</b> كم يبقى، و{" "}
            <b className="text-accent">/</b> الحصة الدقيقة.
          </motion.p>
        )}
      </div>
    </div>
  );
}

function Result({ expr, value, note }: { expr: string; value: string; note: string }) {
  return (
    <div className="rounded-xl bg-code px-3 py-2 text-center">
      <div className="text-sm text-muted">{expr}</div>
      <motion.div key={value} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-num">
        {value}
      </motion.div>
      <div className="text-[11px] text-muted" dir="rtl">
        {note}
      </div>
    </div>
  );
}
