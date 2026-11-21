"use client";

import { motion } from "motion/react";
import { useState } from "react";

type File = "money.js" | "dates.js";

const BODY: Record<File, string> = {
  "money.js": "function format(halalas) {\n  return (halalas / 100).toFixed(2) + \" SAR\";\n}",
  "dates.js": "function format(date) {\n  return date.toISOString().slice(0, 10);\n}",
};

/** Two classic scripts share one global scope, so the last `format` wins; modules keep each file's names apart. */
export default function JsModulesProblem() {
  const [order, setOrder] = useState<File[]>(["money.js", "dates.js"]);
  const [modules, setModules] = useState(false);
  const [swaps, setSwaps] = useState(0);
  const winner = order[1];

  const price = modules || winner === "money.js" ? "12.50 SAR" : "TypeError: date.toISOString is not a function";
  const date = modules || winner === "dates.js" ? "2026-11-21" : "17952192000.00 SAR";
  const priceOk = price === "12.50 SAR";
  const dateOk = date === "2026-11-21";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setOrder(([a, b]) => [b, a]);
            setSwaps((s) => s + 1);
          }}
          className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg"
        >
          بدّل ترتيب التحميل
        </motion.button>
        <div className="flex overflow-hidden rounded-xl border border-line text-sm">
          <button onClick={() => setModules(false)} className={`px-3 py-2 ${!modules ? "bg-accent-soft/40 font-bold" : ""}`}>
            سكربتات عادية
          </button>
          <button onClick={() => setModules(true)} className={`px-3 py-2 ${modules ? "bg-accent-soft/40 font-bold" : ""}`}>
            وحدات ESM
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {order.map((f, i) => (
          <motion.div key={f} layout className="rounded-2xl border border-line bg-surface p-3">
            <div className="mb-1 flex justify-between text-sm">
              <span className="code font-semibold" dir="ltr">{f}</span>
              <span className="text-muted">يُحمَّل {i === 0 ? "أولاً" : "ثانياً"}</span>
            </div>
            <pre className="code rounded-lg bg-code p-2 text-xs" dir="ltr">
              {modules ? "export " : ""}
              {BODY[f]}
            </pre>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 rounded-2xl border border-line bg-surface p-3">
        <div className="code mb-2 text-xs text-muted" dir="ltr">
          {modules
            ? 'import { format as money } from "./money.js";\nimport { format as day } from "./dates.js";'
            : "// page.js: both files already ran in the same global scope"}
        </div>
        <div className="code space-y-1 text-sm" dir="ltr">
          <div>
            {modules ? "money(1250)" : "format(1250)"} → <span className={priceOk ? "text-ok" : "text-err"}>{price}</span>
          </div>
          <div>
            {modules ? "day(new Date())" : "format(new Date())"} → <span className={dateOk ? "text-ok" : "text-err"}>{date}</span>
          </div>
        </div>
      </div>

      {swaps >= 2 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          {modules ? (
            <>
              مع الوحدات لا يهم الترتيب: لكل ملف <b className="text-fg">نطاقه الخاص</b>، ولا يصل إلى ملف آخر إلا ما يُصدَّر ويُستورد صراحة.
            </>
          ) : (
            <>السكربتات العادية تكتب في نطاق عام واحد، فآخر format تُحمَّل تمحو الأولى. جرّب الآن «وحدات ESM».</>
          )}
        </motion.p>
      )}
    </div>
  );
}
