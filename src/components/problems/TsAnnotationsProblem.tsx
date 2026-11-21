"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const LABELS = ["number", "any", "unknown"] as const;
type Label = (typeof LABELS)[number];

/** Values the learner can put in the drawer: how they are written and what JavaScript holds. */
const VALUES = [
  { src: "25", js: 25 as unknown, kind: "number" },
  { src: '"25"', js: "25" as unknown, kind: "string" },
  { src: "true", js: true as unknown, kind: "boolean" },
  { src: "null", js: null as unknown, kind: "null" },
];

/** What tsc says about `let price: <label> = <value>; console.log(price + 5);` */
function verdict(label: Label, v: number): { line: number; msg: string; ar: string } | null {
  const kind = VALUES[v].kind;
  if (label === "number" && kind !== "number")
    return { line: 1, msg: `Type '${kind}' is not assignable to type 'number'.`, ar: "الملصق يقول رقم، والقيمة ليست رقماً." };
  if (label === "unknown") return { line: 2, msg: "'price' is of type 'unknown'.", ar: "unknown يقبل أي قيمة، ولا يسمح باستعمالها قبل التحقق منها." };
  return null;
}

/** Drawer with a label: pick the label, pick a value, see what the checker and the runtime do. */
export default function TsAnnotationsProblem() {
  const [label, setLabel] = useState<Label>("number");
  const [v, setV] = useState(0);
  const err = verdict(label, v);
  // Plain JavaScript: 25 + 5 = 30, "25" + 5 glues, true + 5 = 6, null + 5 = 5.
  const out = String((VALUES[v].js as number) + 5);
  const right = out === "30";

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {LABELS.map((l) => (
          <button
            key={l}
            onClick={() => setLabel(l)}
            className={`code rounded-xl border px-3 py-1.5 text-sm ${label === l ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"}`}
          >
            : {l}
          </button>
        ))}
      </div>

      <div dir="ltr" className="code rounded-2xl border border-line bg-code p-4 text-sm leading-8 md:text-base">
        <div className={err?.line === 1 ? "bg-err/10" : ""}>
          <span className="text-muted">1 </span>let price: <span className="text-accent">{label}</span> ={" "}
          {VALUES.map((x, i) => (
            <button
              key={x.src}
              onClick={() => setV(i)}
              className={`mx-0.5 rounded px-1.5 ring-1 ${i === v ? "bg-accent/20 ring-accent" : "ring-line hover:bg-accent/10"} ${
                x.kind === "number" ? "text-num" : x.kind === "string" ? "text-str" : "text-bool"
              } ${i === v && err?.line === 1 ? "underline decoration-err decoration-wavy underline-offset-4" : ""}`}
            >
              {x.src}
            </button>
          ))}
          ;
        </div>
        <div className={err?.line === 2 ? "bg-err/10" : ""}>
          <span className="text-muted">2 </span>console.log(
          <span className={err?.line === 2 ? "underline decoration-err decoration-wavy underline-offset-4" : ""}>price</span> + 5);
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="min-h-[72px] rounded-2xl border border-line bg-surface p-3 text-sm">
          <div className="mb-1 text-muted">المدقّق قبل التشغيل</div>
          <AnimatePresence mode="popLayout" initial={false}>
            {err ? (
              <motion.div key={err.msg} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div dir="ltr" className="code text-err">line {err.line}: {err.msg}</div>
                <div className="text-muted">{err.ar}</div>
              </motion.div>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ok">
                ✓ لا أخطاء
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="min-h-[72px] rounded-2xl border border-line bg-surface p-3 text-sm">
          <div className="mb-1 text-muted">ما تطبعه JavaScript لو عمل الكود</div>
          <motion.b key={out} initial={{ scale: 0.8 }} animate={{ scale: 1 }} dir="ltr" className={`code inline-block text-2xl ${right ? "text-ok" : "text-err"}`}>
            {out}
          </motion.b>
          {!err && !right && <div className="mt-1 text-err">مرّ من المدقّق وأعطى نتيجة خاطئة بصمت.</div>}
        </div>
      </div>
    </div>
  );
}
