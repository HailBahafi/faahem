"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Obj = { id: number; text: string; via: string };
const METHODS: { label: string; run: (s: string) => string }[] = [
  { label: "upper()", run: (s) => s.toUpperCase() },
  { label: "title()", run: (s) => s.replace(/\b\w/g, (c) => c.toUpperCase()) },
  { label: 'replace("a", "@")', run: (s) => s.split("a").join("@") },
];

/** Methods on a str build new strings; the label `name` stays on the original until you rebind it. */
export default function PyStringsProblem() {
  const [objs, setObjs] = useState<Obj[]>([{ id: 0, text: "sara ali", via: "" }]);
  const [bound, setBound] = useState(0);
  const [rebinds, setRebinds] = useState(0);
  const current = objs.find((o) => o.id === bound)!;
  const latest = objs[objs.length - 1];

  const call = (m: (typeof METHODS)[number]) => {
    setObjs((o) => [
      ...o.filter((x, i) => x.id === bound || i >= o.length - 2),
      { id: o[o.length - 1].id + 1, text: m.run(current.text), via: `name.${m.label}` },
    ]);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" dir="ltr">
        {METHODS.map((m) => (
          <motion.button
            key={m.label}
            whileTap={{ scale: 0.92 }}
            onClick={() => call(m)}
            className="code rounded-xl border border-line px-3 py-2 text-sm font-bold"
          >
            name.{m.label}
          </motion.button>
        ))}
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={latest.id === bound}
          onClick={() => {
            setBound(latest.id);
            setRebinds((r) => r + 1);
          }}
          className="code rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-fg disabled:opacity-40"
        >
          name = result
        </motion.button>
      </div>

      <div className="flex min-h-36 flex-wrap items-end justify-center gap-4" dir="ltr">
        <AnimatePresence initial={false}>
          {objs.map((o) => (
            <motion.div
              key={o.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: o.id === bound || o.id === latest.id ? 1 : 0.4, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="h-6">
                {o.id === bound && (
                  <motion.span layoutId="name-tag" className="code rounded-md bg-accent px-2 py-0.5 text-sm font-bold text-accent-fg">
                    name ↓
                  </motion.span>
                )}
              </div>
              <div className="code rounded-xl border border-line bg-code px-4 py-3 text-lg text-str">&quot;{o.text}&quot;</div>
              <div className="code text-xs text-muted">{o.via || "original"}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 min-h-12 text-center">
        {objs.length === 1 && <p className="text-muted">اضغط upper()‎ وانظر: هل تغيّر النص الذي يشير إليه name؟</p>}
        {objs.length > 1 && rebinds === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            كل دالة بنت نصاً جديداً بجانبه، والأصل لم يتغير حرفاً. name ما زال على &quot;{current.text}&quot;.
          </motion.p>
        )}
        {rebinds > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            الآن انتقل الاسم name إلى النص الجديد. النص لم يتغير، الذي تغيّر هو أين يشير الاسم.
          </motion.p>
        )}
      </div>
    </div>
  );
}
