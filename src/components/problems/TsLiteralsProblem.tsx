"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const STATES = ["pending", "paid", "shipped"];
const CANDIDATES = ["paid", "shipped", "piad", "Shipped", "pending"];

/** An order card moves between status columns; a typo is either stopped by the checker or lost forever. */
export default function TsLiteralsProblem() {
  const [strict, setStrict] = useState(false);
  const [status, setStatus] = useState("pending");
  const [err, setErr] = useState<string | null>(null);

  const assign = (v: string) => {
    if (strict && !STATES.includes(v)) {
      setErr(`Type '"${v}"' is not assignable to type '"pending" | "paid" | "shipped"'.`);
      return;
    }
    setErr(null);
    setStatus(v);
  };
  const lost = !STATES.includes(status);
  const columns = [...STATES, "?"];

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" dir="ltr">
        {[false, true].map((s) => (
          <button
            key={String(s)}
            onClick={() => {
              setStrict(s);
              setStatus("pending");
              setErr(null);
            }}
            className={`code rounded-xl border px-3 py-1.5 text-sm ${strict === s ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"}`}
          >
            {s ? 'let status: "pending" | "paid" | "shipped"' : "let status: string"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2" dir="ltr">
        {columns.map((c) => (
          <div key={c} className={`min-h-[96px] rounded-2xl border p-2 ${c === "?" ? "border-dashed border-err/50" : "border-line bg-surface"}`}>
            <div className="code mb-2 text-center text-xs text-muted">{c === "?" ? "no handler" : c}</div>
            <AnimatePresence>
              {(c === status || (c === "?" && lost)) && (
                <motion.div
                  layoutId="order"
                  className={`code rounded-xl px-2 py-3 text-center text-sm font-bold ${lost ? "bg-err/20 text-err" : "bg-accent text-accent-fg"}`}
                >
                  #1042
                  {lost && <div className="text-xs font-normal">&quot;{status}&quot;</div>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2" dir="ltr">
        {CANDIDATES.map((v) => (
          <motion.button key={v} whileTap={{ scale: 0.92 }} onClick={() => assign(v)} className="code rounded-xl border border-line bg-code px-3 py-1.5 text-sm hover:border-accent">
            status = <span className="text-str">&quot;{v}&quot;</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-3 min-h-[48px] rounded-2xl border border-line bg-surface p-3 text-sm">
        {err ? (
          <motion.div key={err} initial={{ x: -8 }} animate={{ x: 0 }} dir="ltr" className="code text-err">✖ {err}</motion.div>
        ) : lost ? (
          <span className="text-err">قُبلت الحالة، لكن لا كود يعرفها: الطلب ضاع بصمت.</span>
        ) : (
          <span className="text-muted">الطلب في حالة معروفة.</span>
        )}
      </div>
    </div>
  );
}
