"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface Drawer {
  id: number;
  name: string;
  value: number;
  mutable: boolean;
}

const START: Drawer[] = [
  { id: 1, name: "score", value: 10, mutable: false },
  { id: 2, name: "lives", value: 3, mutable: true },
];

/** A locked drawer (let), an open one (let mut), and shadowing, which adds a new drawer with the same name. */
export default function RsVariablesProblem() {
  const [drawers, setDrawers] = useState<Drawer[]>(START);
  const [lines, setLines] = useState<string[]>(["let score = 10;", "let mut lives = 3;"]);
  const [error, setError] = useState<string | null>(null);

  const current = (name: string) => [...drawers].reverse().find((d) => d.name === name)!;
  const write = (line: string) => {
    setLines((l) => [...l, line]);
    setError(null);
  };

  const assign = (name: string, delta: number) => {
    const d = current(name);
    const line = `${name} = ${name} ${delta < 0 ? "-" : "+"} ${Math.abs(delta)};`;
    if (!d.mutable) {
      setLines((l) => [...l, line]);
      setError(`error[E0384]: cannot assign twice to immutable variable \`${name}\``);
      return;
    }
    setDrawers((ds) => ds.map((x) => (x.id === d.id ? { ...x, value: x.value + delta } : x)));
    write(line);
  };

  const shadow = () => {
    const d = current("score");
    setDrawers((ds) => [...ds, { id: ds.length + 1, name: "score", value: d.value + 5, mutable: false }]);
    write("let score = score + 5;");
  };

  const reset = () => {
    setDrawers(START);
    setLines(["let score = 10;", "let mut lives = 3;"]);
    setError(null);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {drawers.map((d) => {
            const hidden = current(d.name).id !== d.id;
            return (
              <motion.div
                key={d.id}
                layout
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: hidden ? 0.35 : 1, y: 0 }}
                className={`w-32 rounded-2xl border p-3 ${d.mutable ? "border-accent/60 bg-accent-soft/20" : "border-line bg-surface"}`}
              >
                <div className="code flex items-center justify-between text-sm" dir="ltr">
                  <span>{d.name}</span>
                  <span title={d.mutable ? "mut" : "locked"}>{d.mutable ? "🔓" : "🔒"}</span>
                </div>
                <motion.div key={d.value} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="code mt-2 text-center text-3xl font-bold text-num">
                  {d.value}
                </motion.div>
                {hidden && <div className="mt-1 text-center text-xs text-muted">مخفي بالتظليل</div>}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Btn onClick={() => assign("score", 10)}>score = score + 10;</Btn>
        <Btn onClick={() => assign("lives", -1)}>lives = lives - 1;</Btn>
        <Btn onClick={shadow}>let score = score + 5;</Btn>
        <button onClick={reset} className="text-sm text-muted hover:text-fg">ابدأ من جديد</button>
      </div>
      <div className="code mt-4 rounded-xl bg-code p-3 text-sm" dir="ltr">
        {lines.slice(-6).map((l, i) => (
          <div key={i}>{l}</div>
        ))}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-err">
            {error}
          </motion.div>
        )}
      </div>
      {error && (
        <p className="mt-3 text-muted">
          المترجم رفض البرنامج كله قبل أن يعمل. الدرج المقفل لا يتغيّر أبداً، أما <b className="text-fg">let من جديد</b> فتصنع درجاً آخر بالاسم نفسه.
        </p>
      )}
    </div>
  );
}

function Btn({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <motion.button whileTap={{ scale: 0.94 }} onClick={onClick} className="code rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-fg" dir="ltr">
      {children}
    </motion.button>
  );
}
