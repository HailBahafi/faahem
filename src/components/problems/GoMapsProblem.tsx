"use client";

import { motion } from "motion/react";
import { useState } from "react";

const ITEMS: [string, number][] = [
  ["pen", 3], ["book", 25], ["cup", 8], ["lamp", 40], ["desk", 300], ["chair", 150], ["bag", 60], ["clock", 45],
  ["phone", 900], ["mouse", 70], ["cable", 15], ["glass", 12], ["plate", 20], ["shirt", 80], ["shoe", 210], ["watch", 500],
];
const BUCKETS = 8;
const hash = (k: string) => [...k].reduce((h, c) => h + c.charCodeAt(0) - 96, 0) % BUCKETS;
const table = Array.from({ length: BUCKETS }, (_, b) => ITEMS.filter(([k]) => hash(k) === b));

/** Finding a price: a list is scanned item by item; a hash table computes the bucket from the key. */
export default function GoMapsProblem() {
  const [pick, setPick] = useState<string | null>(null);
  const idx = pick ? ITEMS.findIndex(([k]) => k === pick) : -1;
  const bucket = pick ? hash(pick) : -1;
  const inBucket = pick ? table[bucket].findIndex(([k]) => k === pick) + 1 : 0;

  return (
    <div dir="ltr">
      <div className="flex flex-wrap gap-1.5">
        {ITEMS.map(([k]) => (
          <motion.button
            key={k}
            whileTap={{ scale: 0.9 }}
            onClick={() => setPick(k)}
            className={`code rounded-lg border px-3 py-1.5 text-sm ${pick === k ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"}`}
          >
            {k}
          </motion.button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="font-semibold" dir="rtl">قائمة: قارن واحداً واحداً</div>
          <div className="mt-3 grid grid-cols-4 gap-1">
            {ITEMS.map(([k, v], i) => (
              <motion.div
                key={`${pick}-${k}`}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: i <= idx ? 1 : 0.4 }}
                transition={{ delay: i <= idx ? i * 0.08 : 0 }}
                className={`code rounded-md border px-1 py-1 text-center text-xs ${i === idx ? "border-accent text-accent" : i < idx ? "border-err/50 text-err" : "border-line text-muted"}`}
              >
                {k} {i === idx ? v : ""}
              </motion.div>
            ))}
          </div>
          <div className="code mt-3 text-sm">
            comparisons: <span className="text-num text-lg font-bold">{pick ? idx + 1 : "-"}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-accent/50 bg-accent-soft/20 p-4">
          <div className="font-semibold" dir="rtl">map: احسب مكان المفتاح</div>
          <div className="code mt-2 min-h-6 text-sm text-muted">{pick && `hash("${pick}") % ${BUCKETS} = ${bucket}`}</div>
          <div className="mt-2 grid gap-1">
            {table.map((row, b) => (
              <div key={b} className={`code flex items-center gap-2 rounded-md px-2 py-0.5 text-xs ${b === bucket ? "bg-accent/20" : ""}`}>
                <span className="w-4 text-muted">{b}</span>
                {row.map(([k, v]) => (
                  <span key={k} className={k === pick ? "font-bold text-accent" : b === bucket ? "text-fg" : "text-muted/60"}>
                    {k}
                    {k === pick ? `=${v}` : ""}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="code mt-3 text-sm">
            comparisons: <span className="text-num text-lg font-bold">{pick ? inBucket : "-"}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 min-h-12" dir="rtl">
        {pick && idx >= 8 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
            القائمة احتاجت {idx + 1} مقارنة، والجدول ذهب إلى دلو واحد مباشرة. مع مليون منتج تبقى مقارنات الجدول قليلة: <b className="text-fg">هذا هو map</b>.
          </motion.p>
        )}
        {!pick && <p className="text-muted">اختر منتجاً، وجرّب واحداً من آخر القائمة.</p>}
      </div>
    </div>
  );
}
