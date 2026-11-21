"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const PLAIN = ["function count() {", "  let n = 3;", "  return n;", "}"];
const GEN = ["function* count() {", "  let n = 3;", "  while (n > 0) {", "    yield n;", "    n--;", "  }", "}"];

/** A normal function starts over on every call; a generator resumes from the yield where it paused. */
export default function JsIteratorsProblem() {
  const [plain, setPlain] = useState<number[]>([]);
  const [gen, setGen] = useState<string[]>([]);
  const n = 3 - gen.length;
  const localN = gen.length === 0 ? 3 : gen.length <= 3 ? 4 - gen.length : 0;

  const nextGen = () => {
    if (gen.length >= 4) return;
    setGen((g) => [...g, n > 0 ? `{ value: ${n}, done: false }` : "{ value: undefined, done: true }"]);
  };
  const pausedLine = gen.length === 0 ? 1 : gen.length >= 4 ? -1 : 3;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2" dir="ltr">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <Code lines={PLAIN} active={-1} />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setPlain((p) => [...p, 3].slice(-5))}
            className="code mt-3 rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg"
          >
            count()
          </motion.button>
          <Results items={plain.map(String)} />
        </div>

        <div className="rounded-2xl border border-accent/50 bg-accent-soft/20 p-4">
          <Code lines={GEN} active={pausedLine} />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={nextGen}
            className="code mt-3 rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg"
          >
            it.next()
          </motion.button>
          <span className="code mr-3 ml-3 text-sm text-muted">n = {localN}</span>
          <Results items={gen} />
        </div>
      </div>

      <div className="mt-4 min-h-12 text-center">
        {plain.length + gen.length === 0 && <p className="text-muted">اضغط الزرين عدة مرات.</p>}
        {gen.length >= 2 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            count() ترجع 3 كل مرة لأنها تبدأ من أول سطر. أما المولّد فإطاره <b className="text-fg">يتجمّد</b> عند yield ومعه n، ويكمل من هناك.
          </motion.p>
        )}
        {(plain.length > 0 || gen.length > 0) && (
          <button
            onClick={() => {
              setPlain([]);
              setGen([]);
            }}
            className="mt-2 text-sm text-muted hover:text-fg"
          >
            ابدأ من جديد
          </button>
        )}
      </div>
    </div>
  );
}

function Code({ lines, active }: { lines: string[]; active: number }) {
  return (
    <pre className="code rounded-xl bg-code p-3 text-xs leading-6">
      {lines.map((l, i) => (
        <div key={i} className={i === active ? "rounded bg-accent/25" : ""}>
          {l}
          {i === active && <span className="text-muted"> {"  // paused"}</span>}
        </div>
      ))}
    </pre>
  );
}

function Results({ items }: { items: string[] }) {
  return (
    <div className="mt-3 flex min-h-10 flex-wrap gap-1.5">
      <AnimatePresence initial={false}>
        {items.map((x, i) => (
          <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="code rounded-lg bg-code px-2 py-1 text-xs text-num">
            {x}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
