"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const GUESTS = ["Sara", "Omar", "Huda", "Ali"];

/** Guests enter (some twice): a list records every entry, a set keeps each guest once. */
export default function PySetsProblem() {
  const [entries, setEntries] = useState<string[]>([]);
  const [bump, setBump] = useState<{ name: string; n: number } | null>(null);
  const unique = GUESTS.filter((g) => entries.includes(g));

  const enter = (name: string) => {
    if (entries.includes(name)) setBump({ name, n: entries.length });
    setEntries((e) => [...e, name]);
  };
  const repeats = entries.length - unique.length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-muted">دخل من الباب:</span>
        {GUESTS.map((g) => (
          <motion.button
            key={g}
            whileTap={{ scale: 0.9 }}
            onClick={() => enter(g)}
            className="code rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg"
          >
            {g}
          </motion.button>
        ))}
        {entries.length > 0 && (
          <button
            onClick={() => {
              setEntries([]);
              setBump(null);
            }}
            className="text-sm text-muted hover:text-fg"
          >
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2" dir="ltr">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="code mb-1 text-sm">visits.append(name)</div>
          <div className="mb-3 text-3xl font-bold text-err">{entries.length}</div>
          <div className="flex min-h-10 flex-wrap gap-1">
            <AnimatePresence initial={false}>
              {entries.map((e, i) => (
                <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="code rounded-lg bg-code px-2 py-1 text-xs text-str">
                  {e}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="rounded-2xl border border-accent/50 bg-accent-soft/20 p-4">
          <div className="code mb-1 text-sm">guests.add(name)</div>
          <div className="mb-3 text-3xl font-bold text-ok">{unique.length}</div>
          <div className="flex min-h-10 flex-wrap gap-1">
            {unique.map((g) => (
              <motion.span
                key={g + (bump?.name === g ? bump.n : "")}
                initial={bump?.name === g ? { scale: 1.3 } : { scale: 0 }}
                animate={{ scale: 1 }}
                className="code rounded-lg bg-code px-2 py-1 text-xs text-str"
              >
                {g}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 min-h-12 text-center">
        {repeats === 0 && <p className="text-muted">أدخل الضيوف، ثم أدخل أحدهم مرة ثانية.</p>}
        {repeats > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            القائمة سجّلت {entries.length} دخولاً، لكن الحاضرين فعلاً {unique.length}. المجموعة وجدت الاسم المكرر في خانته فلم تضفه مرة ثانية.
          </motion.p>
        )}
      </div>
    </div>
  );
}
