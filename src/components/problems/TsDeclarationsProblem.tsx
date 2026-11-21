"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Sheet = "none" | "true" | "lying";

const SHEETS: { id: Sheet; title: string; dts: string | null }[] = [
  { id: "none", title: "بلا ورقة", dts: null },
  { id: "true", title: "ورقة صادقة", dts: 'declare module "tiny-slug" {\n  export default function slug(text: string): string;\n}' },
  { id: "lying", title: "ورقة كاذبة", dts: 'declare module "tiny-slug" {\n  export default function slug(text: string): number;\n}' },
];

const CALLS = ['slug("Hello World").toUpperCase()', "slug(42)", 'slug("Hello World").toFixed(2)'];

/** What the checker says (from the sheet) versus what really runs (the hidden JS) for one untyped library. */
function judge(sheet: Sheet, call: number): { tsc: string | null; run: string; runOk: boolean } {
  const run = [
    { run: '"HELLO-WORLD"', runOk: true },
    { run: "TypeError: s.toLowerCase is not a function", runOk: false },
    { run: "TypeError: slug(...).toFixed is not a function", runOk: false },
  ][call];
  if (sheet === "none") return { tsc: "TS7016: Could not find a declaration file for module 'tiny-slug'.", ...run };
  if (sheet === "true") {
    const tsc = [null, "Argument of type 'number' is not assignable to parameter of type 'string'.", "Property 'toFixed' does not exist on type 'string'. Did you mean 'fixed'?"][call];
    return { tsc, ...run };
  }
  const tsc = ["Property 'toUpperCase' does not exist on type 'number'.", "Argument of type 'number' is not assignable to parameter of type 'string'.", null][call];
  return { tsc, ...run };
}

export default function TsDeclarationsProblem() {
  const [sheet, setSheet] = useState<Sheet>("none");
  const [call, setCall] = useState(0);
  const r = judge(sheet, call);
  const s = SHEETS.find((x) => x.id === sheet)!;
  const fooled = r.tsc === null && !r.runOk;

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-3">
          <div className="text-sm text-muted">node_modules/tiny-slug/index.js (المدقّق لا يفتحه)</div>
          <pre dir="ltr" className="code mt-2 rounded-xl bg-code p-3 text-xs blur-[1.5px] hover:blur-none">
            {"module.exports = (s) =>\n  s.toLowerCase().split(\" \").join(\"-\");"}
          </pre>
        </div>
        <div className="rounded-2xl border border-accent/50 bg-accent/5 p-3">
          <div className="flex flex-wrap gap-2">
            {SHEETS.map((x) => (
              <button
                key={x.id}
                onClick={() => setSheet(x.id)}
                className={`rounded-xl border px-3 py-1 text-sm ${sheet === x.id ? "border-accent bg-accent/15" : "border-line bg-surface"}`}
              >
                {x.title}
              </button>
            ))}
          </div>
          <pre dir="ltr" className="code mt-2 min-h-[64px] rounded-xl bg-code p-3 text-xs">
            {s.dts ?? "// no tiny-slug.d.ts, no @types/tiny-slug"}
          </pre>
        </div>
      </div>

      <div dir="ltr" className="mt-3 flex flex-wrap gap-2">
        {CALLS.map((c, i) => (
          <button key={c} onClick={() => setCall(i)} className={`code rounded-lg px-2 py-1 text-sm ring-1 ${i === call ? "bg-accent/20 ring-accent" : "ring-line"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Verdict title="tsc يقول (من الورقة)" ok={r.tsc === null} text={r.tsc ?? "✓ no errors"} k={`t${sheet}${call}`} />
        <Verdict title="التشغيل يقول (من الكود)" ok={r.runOk} text={r.run} k={`r${sheet}${call}`} />
      </div>
      {fooled && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          المدقّق راضٍ والبرنامج ينهار: <b className="text-fg">صدّق الورقة الكاذبة</b>. الورقة تحكم المدقّق، والكود يحكم التشغيل.
        </motion.p>
      )}
    </div>
  );
}

function Verdict({ title, ok, text, k }: { title: string; ok: boolean; text: string; k: string }) {
  return (
    <div className={`rounded-2xl border p-3 text-sm ${ok ? "border-ok/50 bg-ok/5" : "border-err/60 bg-err/10"}`}>
      <div className="text-muted">{title}</div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={k} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} dir="ltr" className={`code mt-1 ${ok ? "text-ok" : "text-err"}`}>
          {text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
