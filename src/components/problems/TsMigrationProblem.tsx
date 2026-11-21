"use client";

import { motion } from "motion/react";
import { useState } from "react";

/** Four files and what each imports. Converting a file whose imports are still .js leaks `any` into it. */
const FILES = ["utils", "api", "cart", "app"] as const;
type File = (typeof FILES)[number];
const IMPORTS: Record<File, File[]> = { utils: [], api: ["utils"], cart: ["utils", "api"], app: ["cart", "api"] };

export default function TsMigrationProblem() {
  const [order, setOrder] = useState<File[]>([]);
  const isTs = (f: File) => order.includes(f);

  // An import edge is typed when, at the moment the importer was converted, the imported file was already .ts.
  const edges = order.flatMap((f, i) => IMPORTS[f].map((dep) => ({ from: f, dep, typed: order.slice(0, i).includes(dep) })));
  const leaks = edges.filter((e) => !e.typed).length;
  const total = FILES.reduce((n, f) => n + IMPORTS[f].length, 0);
  const finished = order.length === FILES.length;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4" dir="ltr">
        {FILES.map((f) => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.95 }}
            disabled={isTs(f)}
            onClick={() => setOrder((o) => [...o, f])}
            className={`code rounded-2xl border p-3 text-start text-sm ${isTs(f) ? "border-accent bg-accent/15" : "border-line bg-surface hover:bg-accent/10"}`}
          >
            <div className="font-bold">
              {f}
              <span className={isTs(f) ? "text-accent" : "text-muted"}>{isTs(f) ? ".ts" : ".js"}</span>
              {isTs(f) && <span className="ms-2 text-xs text-muted">#{order.indexOf(f) + 1}</span>}
            </div>
            <div className="mt-1 text-xs text-muted">imports: {IMPORTS[f].length ? IMPORTS[f].join(", ") : "nothing"}</div>
          </motion.button>
        ))}
      </div>

      <div dir="ltr" className="code mt-3 min-h-[5rem] space-y-1 rounded-2xl border border-line bg-code p-4 text-sm">
        {edges.length === 0 && <span className="text-muted">click a file to rename it to .ts (allowJs keeps the build green)</span>}
        {edges.map((e) => (
          <motion.div key={`${e.from}-${e.dep}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={e.typed ? "text-ok" : "text-err"}>
            {e.from}.ts imports {e.dep}: {e.typed ? "real types" : "any (still .js when converted)"}
          </motion.div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <span>
          استيرادات وصلها النوع: <b className="text-ok">{edges.length - leaks}</b> / {total}
        </span>
        {order.length > 0 && (
          <button onClick={() => setOrder([])} className="text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>
      {finished && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-muted">
          {leaks === 0
            ? "بدأت بالأوراق: كل ملف تحوّل بعد كل ما يستورده، فلم يتسرّب any إلى أي ملف جديد."
            : `تسرّب any في ${leaks} استيراد. جرّب أن تبدأ بالملف الذي لا يستورد شيئاً.`}
        </motion.p>
      )}
    </div>
  );
}
