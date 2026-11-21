"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";

/** Two division machines: one output slot has to fake an answer, two slots can say "no result, here is why". */

export default function GoFunctionsProblem() {
  const [a, setA] = useState(12);
  const [b, setB] = useState(3);
  const [runs, setRuns] = useState(0);
  const [shown, setShown] = useState<{ a: number; b: number } | null>(null);
  const [zeroSeen, setZeroSeen] = useState(false);

  const run = () => {
    setShown({ a, b });
    setRuns((r) => r + 1);
    if (b === 0) setZeroSeen(true);
  };

  const one = shown ? (shown.b === 0 ? "0" : String(Math.trunc(shown.a / shown.b))) : "";
  const two = shown ? (shown.b === 0 ? { q: "0", err: 'error("divide by zero")' } : { q: String(Math.trunc(shown.a / shown.b)), err: "nil" }) : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4" dir="ltr">
        <Picker label="a" value={a} set={setA} options={[12, 17, 7]} />
        <Picker label="b" value={b} set={setB} options={[3, 5, 0]} />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={run}
          className="code rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg"
        >
          divide({a}, {b})
        </motion.button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Machine title="مخرج واحد" sig="func divide(a, b int) int" bad={shown?.b === 0}>
          <Slot label="result" value={one} tick={runs} warn={shown?.b === 0} />
          {shown?.b === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-err">
              0 نتيجة حقيقية أم علامة فشل؟ لا أحد يعرف.
            </motion.p>
          )}
        </Machine>
        <Machine title="مخرجان: النتيجة والخطأ" sig="func divide(a, b int) (int, error)">
          <div className="grid grid-cols-2 gap-2">
            <Slot label="q" value={two?.q ?? ""} tick={runs} />
            <Slot label="err" value={two?.err ?? ""} tick={runs} err={two?.err !== "nil"} />
          </div>
        </Machine>
      </div>

      {zeroSeen && runs >= 2 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          لاحظت؟ بمخرج واحد تضطر الدالة إلى قيمة مزيفة. في Go ترجع الدالة <b className="text-fg">قيمتين</b>: النتيجة، والخطأ أو nil. ومن استدعاها يفحص err أولاً.
        </motion.p>
      )}
    </div>
  );
}

function Picker({ label, value, set, options }: { label: string; value: number; set: (n: number) => void; options: number[] }) {
  return (
    <div className="flex items-center gap-1">
      <span className="code text-muted">{label} =</span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => set(o)}
          className={`code rounded-lg border px-3 py-1 font-bold ${value === o ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Machine({ title, sig, bad, children }: { title: string; sig: string; bad?: boolean; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border p-5 ${bad ? "border-err/50 bg-err/5" : "border-line bg-surface"}`}>
      <div className="font-semibold">{title}</div>
      <div className="code mb-3 text-xs text-muted" dir="ltr">{sig}</div>
      {children}
    </div>
  );
}

function Slot({ label, value, tick, warn, err }: { label: string; value: string; tick: number; warn?: boolean; err?: boolean }) {
  return (
    <div className="rounded-xl bg-code p-3" dir="ltr">
      <div className="code text-xs text-muted">{label}</div>
      <div className="relative flex h-12 items-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={tick + value}
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className={`code text-lg font-bold ${warn ? "text-err" : err && value ? "text-err" : value === "nil" ? "text-muted" : "text-num"}`}
          >
            {value || "·"}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
