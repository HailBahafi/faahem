"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** Five lines, five bugs, five flags: each flag turns one silent run-time crash into a tsc error. */
const LINES: { code: string; flag: string; error: string; crash: string }[] = [
  {
    code: 'const user = users.find((u) => u.id === 9);\nconsole.log(user.name);',
    flag: "strictNullChecks",
    error: "'user' is possibly 'undefined'.",
    crash: "Cannot read properties of undefined (reading 'name')",
  },
  {
    code: "function total(items) { return items.reduce((s, n) => s + n, 0); }",
    flag: "noImplicitAny",
    error: "Parameter 'items' implicitly has an 'any' type.",
    crash: 'total("12") returns "012", silently',
  },
  {
    code: "const h: (e: string | number) => void = (e: string) => e.trim();",
    flag: "strictFunctionTypes",
    error: "Type '(e: string) => string' is not assignable to type '(e: string | number) => void'.",
    crash: "h(42): e.trim is not a function",
  },
  {
    code: 'const p = prices["cake"];\np.toFixed(2);',
    flag: "noUncheckedIndexedAccess",
    error: "'p' is possibly 'undefined'.",
    crash: "Cannot read properties of undefined (reading 'toFixed')",
  },
  {
    code: "const opts: Options = { timeout: undefined };\nconst cfg = { ...defaults, ...opts };",
    flag: "exactOptionalPropertyTypes",
    error: "Type '{ timeout: undefined; }' is not assignable to type 'Options'.",
    crash: "cfg.timeout is undefined: requests never time out",
  },
];

export default function TsStrictProblem() {
  const [on, setOn] = useState<boolean[]>(LINES.map(() => false));
  const [ran, setRan] = useState(false);
  const caught = on.filter(Boolean).length;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5" dir="ltr">
        {LINES.map((l, i) => (
          <button
            key={l.flag}
            onClick={() => {
              setOn((o) => o.map((v, k) => (k === i ? !v : v)));
              setRan(false);
            }}
            className={`code rounded-lg px-2 py-1 text-sm ring-1 ${on[i] ? "bg-accent text-accent-fg ring-accent" : "ring-line hover:bg-accent/10"}`}
          >
            {on[i] ? "✓ " : ""}
            {l.flag}
          </button>
        ))}
      </div>

      <div dir="ltr" className="code mt-3 space-y-2 rounded-2xl border border-line bg-code p-4 text-sm">
        {LINES.map((l, i) => (
          <div key={l.flag} className="border-b border-line/50 pb-2 last:border-0">
            <pre className={`whitespace-pre-wrap ${on[i] ? "underline decoration-wavy decoration-err underline-offset-4" : ""}`}>{l.code}</pre>
            <AnimatePresence>
              {on[i] && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-err">
                  tsc: {l.error}
                </motion.div>
              )}
              {!on[i] && ran && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="text-err">
                  runtime crash: {l.crash}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setRan(true)}
          className="rounded-2xl bg-accent px-5 py-2 font-bold text-accent-fg"
        >
          شغّل عند المستخدم
        </motion.button>
        <span className="text-sm">
          <b className="text-ok">{caught}</b> اكتُشفت وقت الكتابة، <b className="text-err">{LINES.length - caught}</b> تصل إلى المستخدم
        </span>
      </div>
      {caught === LINES.length && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-muted">
          كل علَم سدّ ثقباً واحداً. strict تشغّل الثلاثة الأولى فقط؛ الأخيران تشغّلهما بيدك.
        </motion.p>
      )}
    </div>
  );
}
