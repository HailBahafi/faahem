"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Order = { item: string; price: number };

const ORDERS: Order[] = [
  { item: "tea", price: 12 },
  { item: "pen", price: 8 },
  { item: "cake", price: 30 },
  { item: "mug", price: 45 },
  { item: "gum", price: 4 },
];

const STAGES = [
  { key: "filter", code: ".filter((o) => o.price >= 10)", label: "اختر" },
  { key: "map", code: ".map((o) => o.price * 2)", label: "حوّل" },
  { key: "reduce", code: ".reduce((sum, p) => sum + p, 0)", label: "اجمع" },
] as const;

/** A pipeline of three array methods: each press runs one more loop and shows the new array it built. */
export default function JsArrayMethodsProblem() {
  const [done, setDone] = useState(0);

  const kept = ORDERS.filter((o) => o.price >= 10);
  const doubled = kept.map((o) => o.price * 2);
  const total = doubled.reduce((sum, p) => sum + p, 0);

  const rows: { code: string; cells: string[] }[] = [{ code: "orders", cells: ORDERS.map((o) => `${o.item} ${o.price}`) }];
  if (done >= 1) rows.push({ code: STAGES[0].code, cells: kept.map((o) => `${o.item} ${o.price}`) });
  if (done >= 2) rows.push({ code: STAGES[1].code, cells: doubled.map(String) });
  if (done >= 3) rows.push({ code: STAGES[2].code, cells: [String(total)] });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STAGES.map((s, i) => (
          <motion.button
            key={s.key}
            whileTap={{ scale: 0.92 }}
            disabled={done !== i}
            onClick={() => setDone(i + 1)}
            className={`rounded-xl px-4 py-2 font-bold ${done === i ? "bg-accent text-accent-fg" : "border border-line bg-surface text-muted"}`}
          >
            {s.label} <span className="code text-xs">{s.key}</span>
          </motion.button>
        ))}
        {done > 0 && (
          <button onClick={() => setDone(0)} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="space-y-3" dir="ltr">
        <AnimatePresence initial={false}>
          {rows.map((r, k) => (
            <motion.div
              key={r.code}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-3 ${k === 0 ? "border-line bg-surface" : "border-accent/50 bg-accent-soft/20"}`}
            >
              <div className="code mb-2 text-xs text-muted">{r.code}</div>
              <div className="flex flex-wrap gap-1.5">
                {r.cells.map((c, i) => (
                  <motion.span
                    key={c + i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.12 }}
                    className={`code rounded-lg bg-code px-2 py-1 text-sm ${k === 3 ? "text-lg font-bold text-num" : "text-str"}`}
                  >
                    {c}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 min-h-12 text-center">
        {done === 0 && <p className="text-muted">اضغط «اختر» لتبدأ.</p>}
        {done === 3 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            ثلاث حلقات كاملة، ولم تكتب <b className="text-fg">for</b> واحدة. وكل مرحلة بنت مصفوفة جديدة، والطلبات الأصلية في الصف الأول بقيت كما هي.
          </motion.p>
        )}
      </div>
    </div>
  );
}
