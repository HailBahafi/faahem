"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const CHOICES = [
  { src: "8", js: 8 as unknown, kind: "number" },
  { src: '"8"', js: "8" as unknown, kind: "string" },
  { src: "true", js: true as unknown, kind: "boolean" },
];
const START: unknown[] = [12, 30];

const color = (v: unknown) => (typeof v === "number" ? "text-num" : typeof v === "string" ? "text-str" : "text-bool");
const show = (v: unknown) => (typeof v === "string" ? `"${v}"` : String(v));

/** Push values into an array with and without the number[] label; watch the running total. */
export default function TsArraysProblem() {
  const [typed, setTyped] = useState(false);
  const [items, setItems] = useState<unknown[]>(START);
  const [err, setErr] = useState<string | null>(null);

  const push = (c: (typeof CHOICES)[number]) => {
    if (typed && c.kind !== "number") {
      setErr(`Argument of type '${c.kind}' is not assignable to parameter of type 'number'.`);
      return;
    }
    setErr(null);
    setItems((xs) => [...xs, c.js]);
  };
  // What JavaScript computes with total = total + item, starting from 0.
  const total = items.reduce<unknown>((t, x) => (t as number) + (x as number), 0);
  const right = items.every((x) => typeof x === "number");

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {[false, true].map((t) => (
          <button
            key={String(t)}
            onClick={() => {
              setTyped(t);
              setItems(START);
              setErr(null);
            }}
            className={`code rounded-xl border px-3 py-1.5 text-sm ${typed === t ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"}`}
          >
            {t ? "const prices: number[]" : "const prices"}
          </button>
        ))}
      </div>

      <div className="flex min-h-[64px] flex-wrap gap-2 rounded-2xl border border-line bg-code p-3" dir="ltr">
        <AnimatePresence initial={false}>
          {items.map((x, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="code flex flex-col items-center rounded-xl border border-line bg-surface px-3 py-1"
            >
              <span className="text-xs text-muted">{i}</span>
              <span className={color(x)}>{show(x)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2" dir="ltr">
        {CHOICES.map((c) => (
          <motion.button
            key={c.src}
            whileTap={{ scale: 0.92 }}
            onClick={() => push(c)}
            className="code rounded-xl bg-accent px-3 py-1.5 font-bold text-accent-fg"
          >
            prices.push({c.src})
          </motion.button>
        ))}
        <button onClick={() => { setItems(START); setErr(null); }} className="text-sm text-muted hover:text-fg">
          ابدأ من جديد
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="min-h-[56px] rounded-2xl border border-line bg-surface p-3 text-sm">
          <div className="mb-1 text-muted">المدقّق</div>
          {err ? (
            <motion.div key={err + items.length} initial={{ x: -8 }} animate={{ x: 0 }} dir="ltr" className="code text-err">✖ {err}</motion.div>
          ) : (
            <div className="text-ok">{typed ? "✓ كل خانة رقم" : "لا ملصق: كل شيء يدخل"}</div>
          )}
        </div>
        <div className="min-h-[56px] rounded-2xl border border-line bg-surface p-3 text-sm">
          <div className="mb-1 text-muted">المجموع بحلقة total = total + x</div>
          <b dir="ltr" className={`code text-2xl ${right ? "text-ok" : "text-err"}`}>{show(total)}</b>
        </div>
      </div>
    </div>
  );
}
