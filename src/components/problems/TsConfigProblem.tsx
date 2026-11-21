"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const CODE = [
  "function label(name) {",
  "  return name.toUpperCase();",
  "}",
  "let note: string = null;",
  "const prices: number[] = [];",
  "const first = prices[0];",
  "console.log(first.toFixed(2));",
];

/** The same file under different tsconfig switches: errors appear and vanish, the runtime never changes. */
export default function TsConfigProblem() {
  const [strict, setStrict] = useState(false);
  const [indexed, setIndexed] = useState(false);
  const [ran, setRan] = useState(false);

  const errors: { line: number; msg: string }[] = [];
  if (strict) {
    errors.push({ line: 1, msg: "Parameter 'name' implicitly has an 'any' type." });
    errors.push({ line: 4, msg: "Type 'null' is not assignable to type 'string'." });
  }
  // Without strictNullChecks, undefined is part of every type, so the index setting finds nothing.
  if (strict && indexed) errors.push({ line: 7, msg: "'first' is possibly 'undefined'." });
  const bad = (n: number) => errors.some((e) => e.line === n);

  const toggle = (name: string, value: boolean, set: (v: boolean) => void) => (
    <button
      onClick={() => {
        set(!value);
        setRan(false);
      }}
      className={`code flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm ${value ? "border-accent bg-accent/15" : "border-line bg-surface"}`}
    >
      <span className={`inline-block h-4 w-7 rounded-full p-0.5 ${value ? "bg-accent" : "bg-line"}`}>
        <motion.span layout className={`block h-3 w-3 rounded-full bg-white ${value ? "ml-auto" : ""}`} />
      </span>
      &quot;{name}&quot;: {String(value)}
    </button>
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" dir="ltr">
        {toggle("strict", strict, setStrict)}
        {toggle("noUncheckedIndexedAccess", indexed, setIndexed)}
      </div>

      <div dir="ltr" className="code rounded-2xl border border-line bg-code p-4 text-sm leading-7">
        {CODE.map((line, i) => (
          <div key={i} className={bad(i + 1) ? "bg-err/10" : ""}>
            <span className="text-muted">{i + 1} </span>
            <span className={bad(i + 1) ? "underline decoration-err decoration-wavy underline-offset-4" : ""}>{line}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 min-h-[64px] rounded-2xl border border-line bg-surface p-3 text-sm">
        <div className="mb-1 text-muted">npx tsc --noEmit</div>
        <AnimatePresence mode="popLayout" initial={false}>
          {errors.length === 0 ? (
            <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ok">
              ✓ Found 0 errors.
            </motion.div>
          ) : (
            errors.map((e) => (
              <motion.div key={e.line} dir="ltr" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="code text-err">
                app.ts({e.line}): {e.msg}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setRan(true)}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20"
        >
          شغّل
        </motion.button>
        {ran && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm">
            <span dir="ltr" className="code text-err">TypeError: Cannot read properties of undefined (reading &apos;toFixed&apos;)</span>
            <div className="text-muted">
              {errors.length ? "المدقّق حذّرك قبل هذا الانهيار." : "لا تحذير واحد، ومع ذلك انهار. الإعدادات قررت ما رآه المدقّق."}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
