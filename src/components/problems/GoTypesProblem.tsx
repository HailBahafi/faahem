"use client";

import { motion } from "motion/react";
import { useState } from "react";

/** A fixed-size integer drawer: its bits, its value, and what happens past the last value it can hold. */

type IntType = "int8" | "uint8" | "int16";
const SPEC: Record<IntType, { bits: number; signed: boolean; start: number }> = {
  int8: { bits: 8, signed: true, start: 125 },
  uint8: { bits: 8, signed: false, start: 253 },
  int16: { bits: 16, signed: true, start: 32765 },
};

function range(t: IntType) {
  const { bits, signed } = SPEC[t];
  return signed ? { min: -(2 ** (bits - 1)), max: 2 ** (bits - 1) - 1 } : { min: 0, max: 2 ** bits - 1 };
}

function wrap(t: IntType, v: number) {
  const { min, max } = range(t);
  const size = max - min + 1;
  return ((((v - min) % size) + size) % size) + min;
}

function bitsOf(t: IntType, v: number): string {
  const { bits } = SPEC[t];
  const raw = v < 0 ? 2 ** bits + v : v;
  return raw.toString(2).padStart(bits, "0");
}

export default function GoTypesProblem() {
  const [type, setType] = useState<IntType>("int8");
  const [value, setValue] = useState(SPEC.int8.start);
  const [wrapped, setWrapped] = useState(false);
  const [presses, setPresses] = useState(0);

  const pick = (t: IntType) => {
    setType(t);
    setValue(SPEC[t].start);
    setWrapped(false);
  };
  const add = (d: number) => {
    const next = wrap(type, value + d);
    setWrapped(next !== value + d);
    setValue(next);
    setPresses((p) => p + 1);
  };
  const { min, max } = range(type);
  const bits = bitsOf(type, value);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" dir="ltr">
        {(Object.keys(SPEC) as IntType[]).map((t) => (
          <button
            key={t}
            onClick={() => pick(t)}
            className={`code rounded-xl border px-4 py-2 text-sm font-bold ${type === t ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"}`}
          >
            var x {t}
          </button>
        ))}
      </div>

      <div className={`rounded-2xl border p-5 ${wrapped ? "border-err/50 bg-err/5" : "border-line bg-surface"}`}>
        <div className="flex flex-wrap justify-center gap-1" dir="ltr">
          {bits.split("").map((b, k) => (
            <motion.span
              key={k}
              animate={{ scale: b === "1" ? 1 : 0.92 }}
              className={`code flex h-9 w-7 items-center justify-center rounded-md text-sm font-bold ${
                b === "1" ? "bg-accent text-accent-fg" : "bg-code text-muted"
              } ${k === 0 && SPEC[type].signed ? "ring-2 ring-err/50" : ""}`}
            >
              {b}
            </motion.span>
          ))}
        </div>
        <motion.div
          key={type + value}
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`code mt-4 text-center text-5xl font-bold ${wrapped ? "text-err" : "text-num"}`}
          dir="ltr"
        >
          {value}
        </motion.div>
        <div className="code mt-2 text-center text-xs text-muted" dir="ltr">
          {SPEC[type].bits} bits · {min} … {max}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => add(1)} className="code rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg">
          x++
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => add(-1)} className="code rounded-2xl border border-line px-6 py-3 text-lg font-bold">
          x--
        </motion.button>
        {wrapped && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            التفّ العدد إلى الطرف الآخر، بلا أي رسالة خطأ.
          </motion.span>
        )}
      </div>
      {presses >= 5 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          النوع ليس اسماً فقط: هو <b className="text-fg">عدد البتات</b> وطريقة قراءتها. في الأنواع ذات الإشارة يعني البت الأيسر أن العدد سالب.
        </motion.p>
      )}
    </div>
  );
}
