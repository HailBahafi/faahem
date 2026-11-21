"use client";

import { motion } from "motion/react";
import { useState } from "react";

type Member = { src: string; text: boolean; nullish: boolean };
const MEMBERS: Member[] = [
  { src: "string", text: true, nullish: false },
  { src: '"hi"', text: true, nullish: false },
  { src: "number", text: false, nullish: false },
  { src: "null", text: false, nullish: true },
  { src: "undefined", text: false, nullish: true },
];

type Rule = { name: string; src: string; one: (m: Member) => string; whole?: (ms: Member[]) => string };
const RULES: Rule[] = [
  { name: "NoNull<T>", src: "T extends null | undefined ? never : T", one: (m) => (m.nullish ? "never" : m.src) },
  { name: "IsText<T>", src: 'T extends string ? "text" : "other"', one: (m) => (m.text ? '"text"' : '"other"') },
  { name: "IsStr<T>", src: '[T] extends [string] ? "yes" : "no"', one: () => "", whole: (ms) => (ms.every((m) => m.text) ? '"yes"' : '"no"') },
];

/** The checker as a machine: a naked T sends each union member through the condition alone. */
export default function TsConditionalProblem() {
  const [on, setOn] = useState<string[]>(["string", "number", "null"]);
  const [r, setR] = useState(0);
  const [run, setRun] = useState(0);
  const rule = RULES[r];
  const chosen = MEMBERS.filter((m) => on.includes(m.src));
  const union = chosen.map((m) => m.src).join(" | ") || "never";

  const rows = rule.whole ? [{ input: union, out: rule.whole(chosen) }] : chosen.map((m) => ({ input: m.src, out: rule.one(m) }));
  const kept = [...new Set(rows.map((x) => x.out).filter((x) => x !== "never" && x !== ""))];
  const result = kept.join(" | ") || "never";

  const toggle = (src: string) => {
    setOn((xs) => (xs.includes(src) ? xs.filter((x) => x !== src) : [...xs, src]));
    setRun(0);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2" dir="ltr">
        {MEMBERS.map((m) => (
          <button
            key={m.src}
            onClick={() => toggle(m.src)}
            className={`code rounded-xl border px-3 py-1.5 ${on.includes(m.src) ? "border-accent bg-accent/15" : "border-line bg-surface text-muted"}`}
          >
            {m.src}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2" dir="ltr">
        {RULES.map((x, i) => (
          <button
            key={x.name}
            onClick={() => { setR(i); setRun(0); }}
            className={`code rounded-xl px-3 py-1.5 text-sm ring-1 ${i === r ? "bg-accent/20 ring-accent" : "ring-line hover:bg-accent/10"}`}
          >
            {x.name}
          </button>
        ))}
      </div>

      <div dir="ltr" className="code mt-3 rounded-2xl border border-line bg-code p-4 text-sm">
        <div className="text-muted">
          type {rule.name} = {rule.src};
        </div>
        <div>
          type R = {rule.name.replace("<T>", "")}&lt;<span className="text-str">{union}</span>&gt;;
        </div>

        {run > 0 && (
          <div key={run} className="mt-3 space-y-1">
            {rows.map((x, i) => (
              <motion.div
                key={x.input + i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.45 }}
                className="flex items-center gap-2"
              >
                <span className="rounded bg-surface px-2">{x.input}</span>
                <span className="text-muted">→</span>
                <span className={x.out === "never" ? "text-err line-through" : "text-ok"}>{x.out}</span>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: rows.length * 0.45 + 0.2 }}
              className="mt-2 border-t border-line pt-2"
            >
              R = <b className="text-num">{result}</b>
            </motion.div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => setRun((n) => n + 1)}
          className="rounded-2xl bg-accent px-5 py-2.5 font-bold text-accent-fg"
        >
          قيّم
        </motion.button>
        {run > 0 && (
          <p className="text-sm text-muted">
            {rule.whole
              ? "القوسان [T] يمنعان التوزيع: الاتحاد كله يدخل السؤال مرة واحدة."
              : "كل عضو يدخل السؤال وحده، ثم تُجمع النتائج. و never لا يترك أثراً في الاتحاد."}
          </p>
        )}
      </div>
    </div>
  );
}
