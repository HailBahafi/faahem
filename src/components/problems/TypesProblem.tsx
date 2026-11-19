"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** An age form: the input arrives as text, so age + 1 glues instead of adding until it is converted. */
export default function TypesProblem() {
  const [raw, setRaw] = useState("20");
  const [convert, setConvert] = useState(false);
  const [tries, setTries] = useState(0);

  const value: string | number = convert ? Number(raw) : raw;
  const result: string | number = convert ? Number(raw) + 1 : raw + 1;
  const isNum = typeof value === "number";
  const wrong = !convert && raw.trim() !== "";

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <label className="font-semibold" htmlFor="types-age">كم عمرك؟</label>
          <input
            id="types-age"
            dir="ltr"
            inputMode="numeric"
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value.slice(0, 3));
              setTries((t) => t + 1);
            }}
            className="code mt-3 w-full rounded-xl border border-line bg-code px-4 py-3 text-2xl"
          />
          <div className="mt-4 text-sm text-muted">ما وصل إلى الدرج age:</div>
          <div dir="ltr" className="code mt-1 flex items-center justify-between rounded-xl bg-code px-4 py-3">
            <span className={`text-xl font-bold ${isNum ? "text-num" : "text-str"}`}>
              {isNum ? String(value) : `"${value}"`}
            </span>
            <span className="text-xs text-muted">{typeof value}</span>
          </div>
        </div>

        <div className={`rounded-2xl border p-5 ${wrong ? "border-line bg-surface" : "border-accent/50 bg-accent-soft/20"}`}>
          <div className="font-semibold">عمرك بعد سنة</div>
          <div dir="ltr" className="code text-xs text-muted">{convert ? "Number(age) + 1" : "age + 1"}</div>
          <div className="relative mt-4 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-code">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={`${raw}-${convert}`}
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                className={`code text-5xl font-bold ${wrong ? "text-err" : "text-ok"}`}
              >
                {String(result)}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setConvert((c) => !c);
            setTries((t) => t + 1);
          }}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20"
        >
          {convert ? "ألغِ التحويل" : "حوّل النص إلى رقم"}
        </motion.button>
        {tries >= 2 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
            نفس العلامة <b className="code text-fg">+</b>: مع النص <b className="text-fg">تُلصق</b>، ومع الرقم <b className="text-fg">تجمع</b>.
            ما يكتبه المستخدم يصل دائماً نصاً، حتى لو بدا رقماً.
          </motion.p>
        )}
      </div>
    </div>
  );
}
