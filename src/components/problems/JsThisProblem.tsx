"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Who = "sara" | "omar" | null;

const WAYS: { code: string; who: Who; note: string }[] = [
  { code: "sara.greet()", who: "sara", note: "الكائن قبل النقطة" },
  { code: "omar.greet = sara.greet;\nomar.greet()", who: "omar", note: "دالة sara، لكن النقطة بعد omar" },
  { code: "const g = sara.greet;\ng()", who: null, note: "لا نقطة: لا أحد" },
  { code: "button.onclick = sara.greet", who: null, note: "المتصفح يستدعيها وحدها" },
  { code: "g.call(omar)", who: "omar", note: "call تختار this صراحة" },
  { code: "const b = g.bind(sara);\nb()", who: "sara", note: "bind تثبّته إلى الأبد" },
];

/** One function, six ways to call it: the object `this` points at changes with the call, not the code. */
export default function JsThisProblem() {
  const [pick, setPick] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const way = pick === null ? null : WAYS[pick];

  const choose = (i: number) => {
    setPick(i);
    setSeen((s) => new Set(s).add(i));
  };

  return (
    <div>
      <pre className="code mb-4 rounded-xl bg-code p-3 text-sm" dir="ltr">
        {"function greet() {\n  return \"hi \" + this.name;\n}"}
      </pre>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {WAYS.map((w, i) => (
          <motion.button
            key={w.code}
            whileTap={{ scale: 0.95 }}
            onClick={() => choose(i)}
            className={`code whitespace-pre rounded-xl border px-3 py-2 text-start text-xs ${pick === i ? "border-accent bg-accent-soft/30" : "border-line bg-surface"}`}
            dir="ltr"
          >
            {w.code}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {(["sara", "omar"] as const).map((name) => (
          <motion.div
            key={name}
            animate={{ scale: way?.who === name ? 1.04 : 1, boxShadow: way?.who === name ? "0 0 0 2px var(--accent)" : "0 0 0 1px var(--border)" }}
            className="rounded-xl bg-surface p-3"
          >
            <div className="code text-sm" dir="ltr">
              {name} = {"{"} name: <span className="text-str">&quot;{name === "sara" ? "Sara" : "Omar"}&quot;</span> {"}"}
            </div>
            {way?.who === name && <div className="mt-1 text-xs font-bold text-accent">← this</div>}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {way && (
          <motion.div
            key={pick}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-3 rounded-xl px-4 py-3 ${way.who ? "bg-ok/10" : "bg-err/10"}`}
          >
            <span className={`code font-bold ${way.who ? "text-ok" : "text-err"}`} dir="ltr">
              {way.who ? `"hi ${way.who === "sara" ? "Sara" : "Omar"}"` : "TypeError: this is undefined"}
            </span>
            <span className="ms-3 text-sm text-muted">{way.note}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {seen.size >= 4 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          الكود لم يتغير أبداً. ما تغيّر هو <b className="text-fg">طريقة الاستدعاء</b>، وهي وحدها التي تحدد من يكون this.
        </motion.p>
      )}
    </div>
  );
}
