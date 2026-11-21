"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface PyObj {
  src: string;
  type: string;
  plus: string;
  times: string;
  color: string;
}

// What real Python prints for x + 1 and x * 2 with each object.
const OBJECTS: PyObj[] = [
  { src: "42", type: "int", plus: "43", times: "84", color: "text-num" },
  { src: '"42"', type: "str", plus: 'TypeError: can only concatenate str (not "int") to str', times: "'4242'", color: "text-str" },
  { src: "4.2", type: "float", plus: "5.2", times: "8.4", color: "text-num" },
  { src: "True", type: "bool", plus: "2", times: "2", color: "text-bool" },
  { src: "None", type: "NoneType", plus: "TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'", times: "TypeError: unsupported operand type(s) for *: 'NoneType' and 'int'", color: "text-muted" },
  { src: "[4, 2]", type: "list", plus: 'TypeError: can only concatenate list (not "int") to list', times: "[4, 2, 4, 2]", color: "text-fg" },
];

/** One label x, six objects: type(x), x + 1 and x * 2 change with the object x is bound to. */
export default function PyTypesProblem() {
  const [pick, setPick] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const o = pick === null ? null : OBJECTS[pick];

  const choose = (i: number) => {
    setPick(i);
    setSeen((s) => new Set(s).add(i));
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3" dir="ltr">
        {OBJECTS.map((obj, i) => (
          <motion.button
            key={obj.src}
            whileTap={{ scale: 0.9 }}
            onClick={() => choose(i)}
            className={`relative flex flex-col items-center rounded-xl border-2 bg-code px-4 pb-2 pt-6 ${pick === i ? "border-accent" : "border-line"}`}
          >
            {pick === i && (
              <motion.span layoutId="x-tag" className="code absolute -top-3 rounded-md bg-accent px-2 py-0.5 text-sm font-bold text-accent-fg">
                x ↓
              </motion.span>
            )}
            <span className={`code text-xl font-bold ${obj.color}`}>{obj.src}</span>
            <span className="code mt-1 text-[11px] text-muted">{obj.type}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface p-4" dir="ltr">
        {o === null ? (
          <p className="text-center text-muted" dir="rtl">
            اضغط كائناً لتلصق عليه البطاقة x.
          </p>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div key={pick} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="code space-y-2 text-sm">
              <Row expr="type(x)" result={`<class '${o.type}'>`} />
              <Row expr="x + 1" result={o.plus} />
              <Row expr="x * 2" result={o.times} />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <div className="mt-4 min-h-12 text-center">
        {seen.size >= 3 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            الاسم x واحد، لكن معنى + و * تغيّر مع كل كائن. <b className="text-accent">النوع يسكن في الكائن</b>، وهو الذي يقرّر ما تعنيه العملية، أو يرفضها
            بخطأ.
          </motion.p>
        )}
      </div>
    </div>
  );
}

function Row({ expr, result }: { expr: string; result: string }) {
  const err = result.startsWith("TypeError");
  return (
    <div className="flex flex-wrap items-baseline gap-x-3">
      <span className="w-20 shrink-0 text-muted">{expr}</span>
      <span className={`font-bold ${err ? "text-err" : "text-ok"}`}>{result}</span>
    </div>
  );
}
