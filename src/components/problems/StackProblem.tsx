"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const WORDS = ["Hello", "dear", "world", "!"];

function Pile({ title, items, hot }: { title: string; items: string[]; hot: boolean }) {
  return (
    <div className="flex min-w-32 flex-1 flex-col gap-2 rounded-2xl border border-line bg-surface p-3">
      <div className="text-sm text-muted">{title}</div>
      <div className="flex min-h-40 flex-col-reverse items-center gap-1" dir="ltr">
        <div className="h-1 w-24 rounded-full bg-line" />
        <AnimatePresence initial={false}>
          {items.map((w, k) => (
            <motion.div
              key={`${w}-${k}`}
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24, x: 20 }}
              className={`code w-24 rounded-full px-2 py-1 text-center text-xs font-bold ${
                hot && k === items.length - 1 ? "bg-accent text-accent-fg" : "border border-line"
              }`}
            >
              {w}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** A tiny editor: every typed word is a plate on the undo pile; undo takes the top plate onto the redo pile. */
export default function StackProblem() {
  const [undo, setUndo] = useState<string[]>([]);
  const [redo, setRedo] = useState<string[]>([]);
  const [last, setLast] = useState<string | null>(null);

  const type = (w: string) => {
    setUndo([...undo, w]);
    setRedo([]);
    setLast(null);
  };
  const doUndo = () => {
    const w = undo[undo.length - 1];
    setUndo(undo.slice(0, -1));
    setRedo([...redo, w]);
    setLast(w);
  };
  const doRedo = () => {
    const w = redo[redo.length - 1];
    setRedo(redo.slice(0, -1));
    setUndo([...undo, w]);
    setLast(null);
  };

  return (
    <div>
      <div className="code min-h-14 rounded-2xl bg-code p-4 text-lg" dir="ltr">
        {undo.length ? undo.join(" ") : <span className="text-muted">…</span>}
        <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-accent">
          |
        </motion.span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" dir="ltr">
        {WORDS.map((w) => (
          <motion.button
            key={w}
            whileTap={{ scale: 0.9 }}
            onClick={() => type(w)}
            className="code rounded-xl border border-line bg-surface px-3 py-2 font-bold text-str"
          >
            + {w}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <Pile title="كومة التراجع" items={undo} hot />
        <Pile title="كومة الإعادة" items={redo} hot={false} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={!undo.length}
          onClick={doUndo}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          ↶ تراجع
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={!redo.length}
          onClick={doRedo}
          className="rounded-2xl border border-line px-5 py-3 font-bold disabled:opacity-40"
        >
          ↷ إعادة
        </motion.button>
      </div>

      <div className="mt-3 min-h-12">
        {!undo.length && !redo.length && <p className="text-muted">اكتب ثلاث كلمات على الأقل، ثم تراجع.</p>}
        {last && (
          <motion.p key={redo.length} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            أُلغيت <b dir="ltr">{last}</b>: آخر ما كتبته، لأنه الصحن الذي فوق الكومة. آخر الداخلين أول الخارجين، وهذا هو <b>المكدّس</b>.
          </motion.p>
        )}
        {!last && redo.length === 0 && undo.length > 0 && <p className="text-muted">كل كلمة صحن جديد فوق الكومة.</p>}
      </div>
    </div>
  );
}
