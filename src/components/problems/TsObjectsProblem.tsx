"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** Each field cycles through these spellings; null means the field is left out. */
const FIELDS = [
  { key: "id", want: "number", options: ["1", '"1"', null] },
  { key: "name", want: "string", options: ['"tea"', "8", null] },
  { key: "price", want: "number", options: ["8", '"8"', null] },
  { key: "colour", want: null, options: [null, '"green"'] },
] as const;

const kindOf = (src: string) => (src.startsWith('"') ? "string" : "number");

/** Builds the object literal from the chips and lists what tsc would say about it. */
export default function TsObjectsProblem() {
  const [pick, setPick] = useState([0, 0, 0, 0]);
  const [viaVariable, setViaVariable] = useState(false);

  const errors: string[] = [];
  FIELDS.forEach((f, i) => {
    const src = f.options[pick[i]];
    if (f.want === null) {
      if (src !== null && !viaVariable) errors.push(`Object literal may only specify known properties, and '${f.key}' does not exist in type 'Product'.`);
      return;
    }
    if (src === null) errors.push(`Property '${f.key}' is missing in type ... but required in type 'Product'.`);
    else if (kindOf(src) !== f.want) errors.push(`Type '${kindOf(src)}' is not assignable to type '${f.want}'. (${f.key})`);
  });

  const cycle = (i: number) => setPick((p) => p.map((x, j) => (j === i ? (x + 1) % FIELDS[i].options.length : x)));
  const parts = FIELDS.map((f, i) => ({ f, i, src: f.options[pick[i]] }));
  const shown = parts.filter((p) => p.src !== null);

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2">
        <div dir="ltr" className="code rounded-2xl border border-line bg-code p-4 text-sm leading-7">
          <div className="mb-1 text-muted">{"// the stencil"}</div>
          interface Product {"{"}
          <div className="pl-4">id: number;</div>
          <div className="pl-4">name: string;</div>
          <div className="pl-4">price: number;</div>
          {"}"}
        </div>
        <div dir="ltr" className="code rounded-2xl border border-line bg-code p-4 text-sm leading-7">
          <div className="mb-1 text-muted">{"// click a value to change it"}</div>
          {viaVariable ? "const raw = {" : "const tea: Product = {"}
          {parts.map(({ f, i, src }) => (
            <div key={f.key} className={`pl-4 ${src === null ? "opacity-40" : ""}`}>
              <button onClick={() => cycle(i)} className="rounded px-1 ring-1 ring-accent/40 hover:bg-accent/15">
                {src === null ? <span className="line-through">{f.key}</span> : <>{f.key}: <span className={kindOf(src) === "number" ? "text-num" : "text-str"}>{src}</span>,</>}
              </button>
            </div>
          ))}
          {"};"}
          {viaVariable && <div>const tea: Product = raw;</div>}
          {shown.length === 0 && <div className="text-muted">{"// empty object"}</div>}
        </div>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={viaVariable} onChange={(e) => setViaVariable(e.target.checked)} />
        مرّر الكائن عبر متغير بدل كتابته مباشرة بعد القالب
      </label>

      <div className="mt-3 min-h-[64px] rounded-2xl border border-line bg-surface p-3 text-sm">
        <AnimatePresence mode="popLayout" initial={false}>
          {errors.length === 0 ? (
            <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ok">
              ✓ الكائن يطابق القالب Product.
            </motion.div>
          ) : (
            errors.map((e) => (
              <motion.div key={e} dir="ltr" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="code mb-1 text-err">
                {e}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
