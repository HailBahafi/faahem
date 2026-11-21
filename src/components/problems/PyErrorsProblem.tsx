"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

type Mode = "bare" | "try";
const CHOICES = ["4", "abc", "0", "5", "20", "-2"];

function evaluate(x: string): { ok: true; value: string } | { ok: false; error: string } {
  if (!/^-?\d+$/.test(x)) return { ok: false, error: `ValueError: invalid literal for int() with base 10: '${x}'` };
  const n = parseInt(x, 10);
  if (n === 0) return { ok: false, error: "ZeroDivisionError: division by zero" };
  return { ok: true, value: String(Number((100 / n).toFixed(4))) };
}

/** 100 / int(x) over several inputs: without try one bad input ends the program, with try it is skipped. */
export default function PyErrorsProblem() {
  const [mode, setMode] = useState<Mode>("bare");
  const [inputs, setInputs] = useState(["4", "abc", "0", "5"]);
  const [ran, setRan] = useState(-1);
  const [runs, setRuns] = useState(0);

  useEffect(() => {
    if (ran < 0 || ran >= inputs.length) return;
    const r = evaluate(inputs[ran]);
    if (!r.ok && mode === "bare") return;
    const t = setTimeout(() => setRan((i) => i + 1), 450);
    return () => clearTimeout(t);
  }, [ran, inputs, mode]);

  const crashedAt = mode === "bare" && ran >= 0 ? inputs.findIndex((x, i) => i <= ran && !evaluate(x).ok) : -1;
  const cycle = (i: number) => {
    setInputs((xs) => xs.map((x, k) => (k === i ? CHOICES[(CHOICES.indexOf(x) + 1) % CHOICES.length] : x)));
    setRan(-1);
  };
  const run = () => {
    setRan(0);
    setRuns((r) => r + 1);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" dir="ltr">
        {(["bare", "try"] as Mode[]).map((m) => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setMode(m);
              setRan(-1);
            }}
            className={`code rounded-xl border px-3 py-2 text-sm font-bold ${mode === m ? "border-accent bg-surface" : "border-line text-muted"}`}
          >
            {m === "bare" ? "print(100 / int(x))" : "try: … except (ValueError, ZeroDivisionError)"}
          </motion.button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-muted">المدخلات (اضغط لتغييرها):</span>
        <div className="flex gap-2" dir="ltr">
          {inputs.map((x, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => cycle(i)}
              className={`code rounded-lg border border-line bg-code px-3 py-1 text-str ${crashedAt >= 0 && i > crashedAt ? "opacity-30" : ""}`}
            >
              &quot;{x}&quot;
            </motion.button>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.92 }} onClick={run} className="rounded-2xl bg-accent px-5 py-2 font-bold text-accent-fg">
          شغّل
        </motion.button>
      </div>

      <div className="code min-h-40 rounded-2xl bg-code p-4 text-sm" dir="ltr">
        {ran < 0 && <span className="text-muted">$ python divide.py</span>}
        {inputs.slice(0, Math.max(0, Math.min(ran + 1, inputs.length))).map((x, i) => {
          const r = evaluate(x);
          if (crashedAt >= 0 && i > crashedAt) return null;
          if (r.ok) return <motion.div key={`${runs}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-num">{r.value}</motion.div>;
          if (mode === "try")
            return <motion.div key={`${runs}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">skipped &quot;{x}&quot;: {r.error.split(": ").slice(1).join(": ")}</motion.div>;
          return (
            <motion.div key={`${runs}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
              Traceback (most recent call last):
              <br />
              &nbsp;&nbsp;File &quot;divide.py&quot;, line 2, in &lt;module&gt;
              <br />
              {r.error}
            </motion.div>
          );
        })}
        {ran >= inputs.length && <div className="text-ok">done</div>}
      </div>

      <div className="mt-4 min-h-12 text-center">
        {crashedAt >= 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            مدخل واحد سيّئ أوقف البرنامج كله، والمدخلات بعده لم تُعالج أبداً.
          </motion.p>
        )}
        {mode === "try" && ran >= inputs.length && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            الخطأ التُقط، فتخطّى البرنامج المدخل السيّئ وأكمل حتى النهاية.
          </motion.p>
        )}
      </div>
    </div>
  );
}
