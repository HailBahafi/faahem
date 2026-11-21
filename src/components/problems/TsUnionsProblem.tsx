"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Kind = "string" | "number" | "null";
const ALL: Kind[] = ["string", "number", "null"];

const GUARDS: { src: string; keeps: Kind[] }[] = [
  { src: "", keeps: ALL },
  { src: "if (id !== null)", keeps: ["string", "number"] },
  { src: 'if (typeof id === "string")', keeps: ["string"] },
  { src: 'if (typeof id === "number")', keeps: ["number"] },
];

const OPS: { src: string; works: Kind[] }[] = [
  { src: "id.toUpperCase()", works: ["string"] },
  { src: "id.toFixed(2)", works: ["number"] },
  { src: "String(id)", works: ["string", "number", "null"] },
];

/** Union cards: a guard crosses some out; an operation is allowed only if every remaining card supports it. */
export default function TsUnionsProblem() {
  const [g, setG] = useState(0);
  const [o, setO] = useState(0);
  const keeps = GUARDS[g].keeps;
  const op = OPS[o];
  const blocking = keeps.filter((k) => !op.works.includes(k));
  const sees = keeps.join(" | ");
  // tsc reports a possible null and, separately, a method missing on the non-null part.
  const nonNull = keeps.filter((k) => k !== "null");
  const messages: string[] = [];
  if (blocking.includes("null")) messages.push("'id' is possibly 'null'.");
  if (blocking.some((k) => k !== "null"))
    messages.push(`Property '${op.src.slice(3, op.src.indexOf("("))}' does not exist on type '${nonNull.join(" | ")}'.`);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3" dir="ltr">
        {ALL.map((k) => {
          const alive = keeps.includes(k);
          const bad = blocking.includes(k);
          return (
            <motion.div
              key={k}
              animate={{ opacity: alive ? 1 : 0.3, scale: alive ? 1 : 0.9 }}
              className={`code relative w-28 rounded-2xl border p-4 text-center text-lg ${bad ? "border-err bg-err/10" : alive ? "border-accent/60 bg-accent/10" : "border-line bg-surface"}`}
            >
              {k}
              {!alive && <div className="absolute inset-x-3 top-1/2 h-0.5 -rotate-12 bg-err" />}
            </motion.div>
          );
        })}
      </div>

      <div dir="ltr" className="code mt-4 rounded-2xl border border-line bg-code p-4 text-sm leading-8">
        <div><span className="text-muted">1 </span>function show(id: string | number | null) {"{"}</div>
        <div className="flex flex-wrap items-center gap-1 pl-4">
          <span className="text-muted">2 </span>
          {GUARDS.map((x, i) => (
            <button key={i} onClick={() => setG(i)} className={`rounded px-1.5 ring-1 ${i === g ? "bg-accent/20 ring-accent" : "ring-line hover:bg-accent/10"}`}>
              {x.src || "// no check"}
            </button>
          ))}
        </div>
        <div className={`flex flex-wrap items-center gap-1 pl-8 ${blocking.length ? "bg-err/10" : ""}`}>
          <span className="text-muted">3 </span>return{" "}
          {OPS.map((x, i) => (
            <button
              key={x.src}
              onClick={() => setO(i)}
              className={`rounded px-1.5 ring-1 ${i === o ? "bg-accent/20 ring-accent" : "ring-line hover:bg-accent/10"} ${i === o && blocking.length ? "underline decoration-err decoration-wavy underline-offset-4" : ""}`}
            >
              {x.src}
            </button>
          ))}
          ;
        </div>
        <div><span className="text-muted">4 </span>{"}"}</div>
      </div>

      <div className="mt-3 min-h-[56px] rounded-2xl border border-line bg-surface p-3 text-sm">
        <div className="text-muted">
          المدقّق يرى id في السطر 3 على أنه: <b dir="ltr" className="code text-fg">{sees}</b>
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          {blocking.length ? (
            <motion.div key={`e${g}${o}`} dir="ltr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="code text-err">
              {messages.map((m) => (
                <div key={m}>{m}</div>
              ))}
            </motion.div>
          ) : (
            <motion.div key={`ok${g}${o}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ok">
              ✓ مسموح: كل احتمال باقٍ يدعم هذه العملية.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
