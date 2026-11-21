"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const SIZES = ["sm", "md", "lg"];
const COLORS = ["red", "blue", "green"];

/** Every size meets every color: the checker knows all class names, so a typo is caught before the browser. */
export default function TsTemplateLiteralProblem() {
  const [sizes, setSizes] = useState(["sm", "lg"]);
  const [colors, setColors] = useState(["red", "blue"]);
  const [typed, setTyped] = useState("btn-lg-rde");

  const all = sizes.flatMap((s) => colors.map((c) => `btn-${s}-${c}`));
  const ok = all.includes(typed);
  const near = all.find((x) => x.slice(0, 7) === typed.slice(0, 7)) ?? all[0];
  const toggle = (xs: string[], set: (v: string[]) => void, x: string) =>
    set(xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2" dir="ltr">
        <Chips label="Size" items={SIZES} on={sizes} toggle={(x) => toggle(sizes, setSizes, x)} />
        <Chips label="Color" items={COLORS} on={colors} toggle={(x) => toggle(colors, setColors, x)} />
      </div>

      <div dir="ltr" className="code mt-3 rounded-2xl border border-line bg-code p-4 text-sm">
        <div className="text-muted">type ClassName = `btn-${"{"}Size{"}"}-${"{"}Color{"}"}`;</div>
        <div className="mt-2 text-xs text-muted">
          {sizes.length} × {colors.length} = {all.length}
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <AnimatePresence>
            {all.map((x) => (
              <motion.span
                key={x}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`rounded px-2 py-0.5 ${x === typed ? "bg-ok/20 text-ok" : "bg-surface text-str"}`}
              >
                &quot;{x}&quot;
              </motion.span>
            ))}
          </AnimatePresence>
          {all.length === 0 && <span className="text-err">never</span>}
        </div>
      </div>

      <div dir="ltr" className="code mt-3 rounded-2xl border border-line bg-surface p-3 text-sm">
        <label className="flex flex-wrap items-center gap-2">
          <span>const cls: ClassName = &quot;</span>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className={`w-40 rounded bg-code px-2 py-1 outline-none ring-1 ${ok ? "ring-ok" : "ring-err underline decoration-err decoration-wavy"}`}
          />
          <span>&quot;;</span>
        </label>
        <div className={`mt-2 ${ok ? "text-ok" : "text-err"}`}>
          {ok
            ? "✓ one of the allowed names"
            : all.length
              ? `Type '"${typed}"' is not assignable to type '${all.map((x) => `"${x}"`).join(" | ")}'. Did you mean '"${near}"'?`
              : `Type '"${typed}"' is not assignable to type 'never'.`}
        </div>
      </div>
    </div>
  );
}

function Chips({ label, items, on, toggle }: { label: string; items: string[]; on: string[]; toggle: (x: string) => void }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-2">
      <div className="code mb-1 text-xs text-muted">type {label} =</div>
      <div className="flex flex-wrap gap-1">
        {items.map((x) => (
          <button
            key={x}
            onClick={() => toggle(x)}
            className={`code rounded-lg px-2 py-1 text-sm ring-1 ${on.includes(x) ? "bg-accent/20 ring-accent" : "text-muted ring-line"}`}
          >
            &quot;{x}&quot;
          </button>
        ))}
      </div>
    </div>
  );
}
