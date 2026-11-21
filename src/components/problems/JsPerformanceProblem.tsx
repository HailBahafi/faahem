"use client";

import { motion } from "motion/react";
import { useState } from "react";

const STAGES = [
  { id: "parse", label: "parseRows()", ms: 40 },
  { id: "dedupe", label: "findDuplicates()", ms: 820 },
  { id: "format", label: "formatOutput()", ms: 90 },
  { id: "render", label: "renderTable()", ms: 50 },
];
const TOTAL = STAGES.reduce((t, s) => t + s.ms, 0);

/** One request through four stages: guess which to make 10x faster, then let the profiler show where time goes. */
export default function JsPerformanceProblem() {
  const [picked, setPicked] = useState<string | null>(null);
  const [profiled, setProfiled] = useState(false);

  const time = (id: string, ms: number) => (picked === id ? ms / 10 : ms);
  const total = STAGES.reduce((t, s) => t + time(s.id, s.ms), 0);
  const saved = TOTAL - total;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted">زمن الطلب</span>
        <motion.span key={total} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="code text-3xl font-bold text-num" dir="ltr">
          {Math.round(total)}ms
        </motion.span>
      </div>

      <div className="mt-3 space-y-2" dir="ltr">
        {STAGES.map((s) => {
          const ms = time(s.id, s.ms);
          return (
            <div key={s.id} className="flex items-center gap-3">
              <button
                onClick={() => setPicked(s.id)}
                className={`code w-40 shrink-0 rounded-xl px-3 py-2 text-start text-xs ${picked === s.id ? "bg-accent font-bold text-accent-fg" : "border border-line bg-surface"}`}
              >
                {s.label}
              </button>
              <div className="h-5 flex-1 overflow-hidden rounded-md bg-code">
                {profiled && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(ms / TOTAL) * 100}%` }}
                    transition={{ type: "spring", stiffness: 160, damping: 26 }}
                    className={`h-full ${s.id === "dedupe" && picked !== "dedupe" ? "bg-err" : "bg-accent"}`}
                  />
                )}
              </div>
              <span className="code w-16 text-end text-xs text-muted">{profiled ? `${Math.round(ms)}ms` : "?"}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.94 }} onClick={() => setProfiled(true)} className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg">
          شغّل المحلّل
        </motion.button>
        <span className="text-xs text-muted">اضغط اسم مرحلة لتجعلها أسرع 10 مرات</span>
      </div>

      {picked && (
        <motion.p key={picked + String(profiled)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          {picked === "dedupe"
            ? `وفّرت ${Math.round(saved)}ms من ${TOTAL}. الوقت كله كان هنا: حلقة داخل حلقة تبحث عن المكرر.`
            : profiled
              ? `وفّرت ${Math.round(saved)}ms فقط. المرحلة التي اخترتها كانت صغيرة أصلاً، فتسريعها لا يوفّر أكثر من حصتها.`
              : `وفّرت ${Math.round(saved)}ms. هل كان هذا أفضل اختيار؟ شغّل المحلّل وانظر.`}
        </motion.p>
      )}
    </div>
  );
}
