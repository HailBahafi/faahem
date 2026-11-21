"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Arg = { src: string; js: unknown; kind: "number" | "string" | "boolean" } | null;

const SLOTS: Arg[][] = [
  [{ src: "200", js: 200, kind: "number" }, { src: '"200"', js: "200", kind: "string" }, null],
  [null, { src: "10", js: 10, kind: "number" }, { src: '"10%"', js: "10%", kind: "string" }],
  [null, { src: "true", js: true, kind: "boolean" }],
];

/** What tsc says about applyDiscount(price: number, percent?: number) called with the sent arguments. */
function verdict(sent: NonNullable<Arg>[]): string | null {
  if (sent.length < 1 || sent.length > 2) return `Expected 1-2 arguments, but got ${sent.length}.`;
  for (const a of sent) if (a.kind !== "number") return `Argument of type '${a.kind}' is not assignable to parameter of type 'number'.`;
  return null;
}

/** The function as plain JavaScript runs it: percent defaults to 0. */
function run(sent: NonNullable<Arg>[]): string {
  const price = sent[0]?.js as number;
  const percent = (sent[1]?.js ?? 0) as number;
  return String(price - (price * percent) / 100);
}

/** A function signature as a door: choose the arguments, the checker lets them in or stops them. */
export default function TsFunctionsProblem() {
  const [pick, setPick] = useState([0, 1, 0]);
  const args = SLOTS.map((options, i) => options[pick[i]]);
  // Empty slots are simply not written, so the call sends the remaining arguments in order.
  const sent = args.filter((a): a is NonNullable<Arg> => a !== null);
  const err = verdict(sent);
  const out = run(sent);
  const cycle = (i: number) => setPick((p) => p.map((x, j) => (j === i ? (x + 1) % SLOTS[i].length : x)));

  return (
    <div>
      <div dir="ltr" className="code rounded-2xl border border-line bg-code p-4 text-sm leading-8 md:text-base">
        <div className="text-muted">{"// the contract"}</div>
        <div>
          function applyDiscount(price: <span className="text-accent">number</span>, percent?: <span className="text-accent">number</span>): number
        </div>
        <div className="mt-3 text-muted">{"// the call: click each slot"}</div>
        <div className="flex flex-wrap items-center gap-1">
          applyDiscount(
          {SLOTS.map((_, i) => (
            <button
              key={i}
              onClick={() => cycle(i)}
              className={`min-w-10 rounded px-1.5 ring-1 ring-accent/40 hover:bg-accent/15 ${args[i] ? "" : "text-muted"}`}
            >
              {args[i]?.src ?? "—"}
            </button>
          ))}
          )
        </div>
        <div className="text-xs text-muted">sent: applyDiscount({sent.map((a) => a.src).join(", ")})</div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="min-h-[72px] rounded-2xl border border-line bg-surface p-3 text-sm">
          <div className="mb-1 text-muted">باب الدالة (المدقّق)</div>
          <AnimatePresence mode="popLayout" initial={false}>
            {err ? (
              <motion.div key={err} dir="ltr" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }} className="code text-err">
                ✖ {err}
              </motion.div>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ok">
                ✓ الوسائط تطابق العقد، فيُفتح الباب.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="min-h-[72px] rounded-2xl border border-line bg-surface p-3 text-sm">
          <div className="mb-1 text-muted">JavaScript بلا باب كانت ستُرجع</div>
          <motion.b key={out} initial={{ scale: 0.8 }} animate={{ scale: 1 }} dir="ltr" className={`code inline-block text-2xl ${err ? "text-err" : "text-ok"}`}>
            {out}
          </motion.b>
        </div>
      </div>
    </div>
  );
}
