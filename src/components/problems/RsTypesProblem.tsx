"use client";

import { motion } from "motion/react";
import { useState } from "react";

/** A u8 drawer drawn as its 8 bits. Count past 255 and choose what should happen: panic (debug) or wrap (release). */
export default function RsTypesProblem() {
  const [value, setValue] = useState(250);
  const [mode, setMode] = useState<"debug" | "release">("debug");
  const [panic, setPanic] = useState(false);
  const [wrapped, setWrapped] = useState(false);

  const add = () => {
    if (panic) return;
    if (value === 255) {
      if (mode === "debug") setPanic(true);
      else {
        setValue(0);
        setWrapped(true);
      }
      return;
    }
    setValue((v) => v + 1);
  };
  const reset = () => {
    setValue(250);
    setPanic(false);
    setWrapped(false);
  };

  const bits = value.toString(2).padStart(8, "0").split("");

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="code text-sm text-muted" dir="ltr">let mut level: u8 = {value};</div>
        <div className="mt-4 flex justify-center gap-2" dir="ltr">
          {bits.map((b, i) => (
            <motion.div
              key={i}
              animate={{ scale: b === "1" ? 1 : 0.9 }}
              className={`code flex h-12 w-9 items-center justify-center rounded-lg text-lg font-bold ${b === "1" ? "bg-accent text-accent-fg" : "bg-code text-muted"}`}
            >
              {b}
            </motion.div>
          ))}
        </div>
        <motion.div key={value} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="code mt-3 text-center text-4xl font-bold text-num">
          {value}
        </motion.div>
        {panic && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="code mt-3 rounded-lg bg-code p-2 text-center text-sm text-err" dir="ltr">
            thread &apos;main&apos; panicked: attempt to add with overflow
          </motion.div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={add} className="code rounded-2xl bg-accent px-5 py-2 font-bold text-accent-fg" dir="ltr">
          level += 1
        </motion.button>
        <div className="flex overflow-hidden rounded-xl border border-line text-sm">
          {(["debug", "release"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); reset(); }} className={`code px-3 py-2 ${mode === m ? "bg-accent text-accent-fg" : "text-muted"}`}>
              {m}
            </button>
          ))}
        </div>
        <button onClick={reset} className="text-sm text-muted hover:text-fg">ابدأ من 250</button>
      </div>
      {(panic || wrapped) && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          {panic
            ? "256 تحتاج بتاً تاسعاً غير موجود. في debug توقف Rust البرنامج بدل أن تعطيك رقماً خاطئاً."
            : "في release حُذف الفحص للسرعة، فالتفّ العدّاد إلى 0 كعدّاد سيارة قديم. الحل الحقيقي: نوع يتسع لقيمك."}
        </motion.p>
      )}
    </div>
  );
}
