"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const INPUTS: { src: string; value: unknown; type: string }[] = [
  { src: "42", value: 42, type: "number" },
  { src: '"sara"', value: "sara", type: "string" },
  { src: '{ name: "Omar" }', value: { name: "Omar" }, type: "{ name: string; }" },
];

/** keep(value) with `any` versus `<T>`: the same run time, but only the generic keeps the label on the result. */
export default function TsGenericsProblem() {
  const [input, setInput] = useState(0);
  const [generic, setGeneric] = useState(false);
  const [ran, setRan] = useState(false);
  const it = INPUTS[input];
  const isString = typeof it.value === "string";
  const sees = generic ? it.type : "any";
  const tscError = generic && !isString ? `Property 'toUpperCase' does not exist on type '${it.type}'.` : null;
  const runResult = isString ? `"${(it.value as string).toUpperCase()}"` : "TypeError: result.toUpperCase is not a function";

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {[false, true].map((g) => (
          <button
            key={String(g)}
            onClick={() => {
              setGeneric(g);
              setRan(false);
            }}
            className={`code rounded-xl border px-3 py-1.5 text-sm ${generic === g ? "border-accent bg-accent/15" : "border-line bg-surface"}`}
            dir="ltr"
          >
            {g ? "keep<T>(value: T): T" : "keep(value: any): any"}
          </button>
        ))}
      </div>

      <div dir="ltr" className="code rounded-2xl border border-line bg-code p-4 text-sm leading-8">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-muted">1 </span>const result = keep(
          {INPUTS.map((x, i) => (
            <button
              key={x.src}
              onClick={() => {
                setInput(i);
                setRan(false);
              }}
              className={`rounded px-1.5 ring-1 ${i === input ? "bg-accent/20 ring-accent" : "ring-line hover:bg-accent/10"}`}
            >
              {x.src}
            </button>
          ))}
          );
        </div>
        <div className={tscError ? "bg-err/10" : ""}>
          <span className="text-muted">2 </span>
          <span className={tscError ? "underline decoration-err decoration-wavy underline-offset-4" : ""}>console.log(result.toUpperCase());</span>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-3 text-sm">
          <div className="text-muted">المدقّق قبل التشغيل</div>
          <div className="mt-1">
            ملصق result: <b dir="ltr" className="code text-fg">{sees}</b>
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={`${input}${generic}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} dir="ltr" className={`code mt-1 ${tscError ? "text-err" : "text-ok"}`}>
              {tscError ?? (generic ? "✓ OK" : "✓ OK (any allows everything)")}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">عند التشغيل</span>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => setRan(true)} className="rounded-xl bg-accent px-3 py-1 text-sm font-bold text-accent-fg">
              شغّل
            </motion.button>
          </div>
          {ran && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} dir="ltr" className={`code mt-2 ${isString ? "text-ok" : "text-err"}`}>
              {runResult}
            </motion.div>
          )}
        </div>
      </div>

      {ran && !isString && !generic && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          any نسي أن الداخل لم يكن نصاً، فمرّ الخطأ إلى المستخدم. جرّب <b className="text-fg">&lt;T&gt;</b>: الملصق يخرج كما دخل.
        </motion.p>
      )}
    </div>
  );
}
