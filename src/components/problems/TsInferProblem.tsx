"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Pattern = { pre: string; hole: string; post: string };
const PATTERNS: Pattern[] = [
  { pre: "(", hole: "infer E", post: ")[]" },
  { pre: "(...args: any[]) => ", hole: "infer R", post: "" },
  { pre: "Promise<", hole: "infer V", post: ">" },
  { pre: "`user-${", hole: "infer N", post: "}`" },
];

/** For each type: which pattern it matches, and the pieces around the captured part. */
const TYPES: { src: string; match: number; pre: string; cap: string; post: string }[] = [
  { src: "string[]", match: 0, pre: "", cap: "string", post: "[]" },
  { src: "() => boolean", match: 1, pre: "() => ", cap: "boolean", post: "" },
  { src: "Promise<Date>", match: 2, pre: "Promise<", cap: "Date", post: ">" },
  { src: '"user-42"', match: 3, pre: '"user-', cap: "42", post: '"' },
  { src: "number", match: -1, pre: "number", cap: "", post: "" },
];

/** infer as pattern matching: lay a type over a pattern; whatever fills the hole gets a name. */
export default function TsInferProblem() {
  const [t, setT] = useState(0);
  const [p, setP] = useState(0);
  const type = TYPES[t];
  const pat = PATTERNS[p];
  const ok = type.match === p;
  const name = pat.hole.split(" ")[1];
  const captured = p === 3 ? `"${type.cap}"` : type.cap;

  return (
    <div>
      <Row label="النوع" items={TYPES.map((x) => x.src)} value={t} set={setT} />
      <Row label="القالب" items={PATTERNS.map((x) => x.pre + x.hole + x.post)} value={p} set={setP} />

      <div dir="ltr" className="code mt-3 space-y-3 rounded-2xl border border-line bg-code p-4 text-base">
        <div className="flex flex-wrap items-center">
          <span className="w-20 text-xs text-muted">pattern</span>
          <span>{pat.pre}</span>
          <span className="rounded border border-dashed border-accent px-2 text-accent">{pat.hole}</span>
          <span>{pat.post}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${t}-${p}`}
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap items-center"
          >
            <span className="w-20 text-xs text-muted">type</span>
            {ok ? (
              <>
                <span>{type.pre}</span>
                <motion.span
                  initial={{ backgroundColor: "rgba(0,0,0,0)" }}
                  animate={{ backgroundColor: "rgba(52,211,153,0.25)" }}
                  transition={{ delay: 0.4 }}
                  className="rounded px-2 text-ok"
                >
                  {type.cap}
                </motion.span>
                <span>{type.post}</span>
              </>
            ) : (
              <span className="text-err">{type.src}</span>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="border-t border-line pt-2 text-sm">
          {ok ? (
            <span className="text-ok">
              match: {name} = {captured}
            </span>
          ) : (
            <span className="text-err">no match: {name} never exists, the false branch gives never</span>
          )}
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">
        القالب يقول «شكل ما فيه ثقب». إن طابق النوع الشكل، أخذ ما في الثقب اسماً تستعمله بعد ذلك.
      </p>
    </div>
  );
}

function Row({ label, items, value, set }: { label: string; items: string[]; value: number; set: (n: number) => void }) {
  return (
    <div className="mt-2">
      <div className="mb-1 text-xs text-muted">{label}</div>
      <div className="flex flex-wrap gap-1.5" dir="ltr">
        {items.map((x, i) => (
          <button
            key={x}
            onClick={() => set(i)}
            className={`code rounded-lg px-2 py-1 text-sm ring-1 ${i === value ? "bg-accent/20 ring-accent" : "ring-line hover:bg-accent/10"}`}
          >
            {x}
          </button>
        ))}
      </div>
    </div>
  );
}
