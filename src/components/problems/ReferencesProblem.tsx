"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Mode = "same" | "copy";
type Remote = "a" | "b";

/** Two remotes for one TV (b = a) versus two TVs (b = a.slice()): pressing b shows whether a sees it. */
export default function ReferencesProblem() {
  const [mode, setMode] = useState<Mode>("same");
  const [tvs, setTvs] = useState<number[]>([5]);
  const [last, setLast] = useState<Remote | null>(null);
  const target: Record<Remote, number> = { a: 0, b: mode === "same" ? 0 : 1 };

  const choose = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    setTvs(m === "same" ? [5] : [5, 5]);
    setLast(null);
  };
  const press = (r: Remote, d: number) => {
    setTvs((t) => t.map((ch, i) => (i === target[r] ? ch + d : ch)));
    setLast(r);
  };

  const tag = (r: Remote) => (
    <motion.span
      layoutId={`tag-${r}`}
      className={`code rounded-md px-2 py-0.5 text-sm font-bold ${r === "a" ? "bg-accent text-accent-fg" : "bg-code text-num"}`}
    >
      {r} ↓
    </motion.span>
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" dir="ltr">
        {(["same", "copy"] as Mode[]).map((m) => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.92 }}
            onClick={() => choose(m)}
            className={`code rounded-xl border px-3 py-2 font-bold ${mode === m ? "border-accent bg-surface" : "border-line text-muted"}`}
          >
            {m === "same" ? "let b = a;" : "let b = a.slice();"}
          </motion.button>
        ))}
      </div>

      <div className="flex min-h-44 flex-wrap justify-center gap-6" dir="ltr">
        <AnimatePresence initial={false}>
          {tvs.map((ch, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-7 gap-2">
                {target.a === i && tag("a")}
                {target.b === i && tag("b")}
              </div>
              <div className="rounded-2xl border-4 border-line bg-code p-2">
                <div className="flex h-24 w-36 items-center justify-center rounded-lg bg-surface">
                  <motion.span key={ch} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="code text-4xl font-bold text-num">
                    {ch}
                  </motion.span>
                </div>
              </div>
              <div className="h-2 w-12 rounded-b-lg bg-line" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-4" dir="ltr">
        {(["a", "b"] as Remote[]).map((r) => (
          <div key={r} className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2">
            <span className="code w-5 text-center text-lg font-bold">{r}</span>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => press(r, -1)} className="code h-10 w-10 rounded-xl bg-code text-xl font-bold">
              −
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => press(r, 1)}
              className="code h-10 w-10 rounded-xl bg-accent text-xl font-bold text-accent-fg"
            >
              +
            </motion.button>
          </div>
        ))}
      </div>

      <div className="mt-4 min-h-12 text-center">
        {last === null && <p className="text-muted">اضغط + على جهاز b.</p>}
        {last === "b" && mode === "same" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            ضغطت على b فتغيّر ما يراه a أيضاً: جهازان، وتلفاز واحد.
          </motion.p>
        )}
        {last === "b" && mode === "copy" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            الآن تلفازان: b يغيّر تلفازه وحده، وتلفاز a لم يتحرك.
          </motion.p>
        )}
        {last === "a" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
            {mode === "same" ? "a و b يشيران إلى التلفاز نفسه." : "كل جهاز يشير إلى تلفازه."}
          </motion.p>
        )}
      </div>
    </div>
  );
}
