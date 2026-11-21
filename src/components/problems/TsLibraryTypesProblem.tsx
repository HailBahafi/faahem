"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** Three published signatures for the same get(obj, key); the user's editor sees only the signature. */
const DESIGNS: { name: string; sig: string }[] = [
  { name: "any", sig: "function get(obj: any, key: string): any;" },
  {
    name: "overloads",
    sig: 'function get(obj: Config, key: "port"): number;\nfunction get(obj: Config, key: "host"): string;',
  },
  { name: "generic", sig: "function get<T, K extends keyof T>(obj: T, key: K): T[K];" },
];

const CALLS = ['get(config, "port")', 'get(config, "prot")', 'get(user, "name")'];

/** RESULTS[design][call]: what tsc shows the user, and whether it is an error. */
const RESULTS: { text: string; err?: boolean; quiet?: boolean }[][] = [
  [
    { text: "any", quiet: true },
    { text: "any (at run time: undefined, nobody warned you)", quiet: true },
    { text: "any", quiet: true },
  ],
  [
    { text: "number" },
    { text: "No overload matches this call.", err: true },
    { text: "No overload matches this call. (overloads only know Config)", err: true },
  ],
  [
    { text: "number" },
    { text: `Argument of type '"prot"' is not assignable to parameter of type '"port" | "host"'.`, err: true },
    { text: "string" },
  ],
];

export default function TsLibraryTypesProblem() {
  const [d, setD] = useState(0);
  const [c, setC] = useState(0);
  const r = RESULTS[d][c];

  return (
    <div>
      <div className="mb-1 text-xs text-muted">توقيع المكتبة (dist/index.d.ts)</div>
      <div className="flex flex-wrap gap-1.5" dir="ltr">
        {DESIGNS.map((x, i) => (
          <button
            key={x.name}
            onClick={() => setD(i)}
            className={`code rounded-lg px-2 py-1 text-sm ring-1 ${i === d ? "bg-accent/20 ring-accent" : "ring-line hover:bg-accent/10"}`}
          >
            {x.name}
          </button>
        ))}
      </div>
      <pre dir="ltr" className="code mt-2 whitespace-pre-wrap rounded-xl border border-line bg-code p-3 text-sm">
        {DESIGNS[d].sig}
      </pre>

      <div className="mb-1 mt-3 text-xs text-muted">كود المستخدم</div>
      <div className="flex flex-wrap gap-1.5" dir="ltr">
        {CALLS.map((x, i) => (
          <button
            key={x}
            onClick={() => setC(i)}
            className={`code rounded-lg px-2 py-1 text-sm ring-1 ${i === c ? "bg-accent/20 ring-accent" : "ring-line hover:bg-accent/10"}`}
          >
            {x}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${d}-${c}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          dir="ltr"
          className="code mt-3 rounded-2xl border border-line bg-code p-4 text-sm"
        >
          <span className="text-muted">const v = {CALLS[c]};</span>
          <div className={`mt-2 ${r.err ? "text-err" : r.quiet ? "text-muted" : "text-ok"}`}>
            {r.err ? "tsc error: " : "tsc sees v as: "}
            {r.text}
          </div>
        </motion.div>
      </AnimatePresence>
      <p className="mt-3 text-sm text-muted">
        الكود الداخلي واحد في الثلاث. ما يتغير هو التوقيع، وهو وحده ما يصل إلى محرر المستخدم.
      </p>
    </div>
  );
}
