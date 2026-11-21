"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const IDEAS = ["buy milk", "call Sara", "gym 6pm", "pay rent", "read ch. 3"];

/** A notes app that keeps notes only in memory versus one that appends them to a file and reads it at startup. */
export default function PyFilesProblem() {
  const [memory, setMemory] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<string[]>([]);
  const [disk, setDisk] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [restarts, setRestarts] = useState(0);
  const [off, setOff] = useState(false);

  const add = () => {
    const note = IDEAS[count % IDEAS.length];
    setMemory((m) => [...m, note]);
    setLoaded((m) => [...m, note]);
    setDisk((d) => [...d, note]);
    setCount((c) => c + 1);
  };
  const restart = () => {
    setOff(true);
    setMemory([]);
    setLoaded([]);
    setTimeout(() => {
      setLoaded(disk);
      setOff(false);
      setRestarts((r) => r + 1);
    }, 900);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={add}
          disabled={off}
          className="rounded-2xl bg-accent px-5 py-2 font-bold text-accent-fg disabled:opacity-40"
        >
          أضف ملاحظة
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={restart}
          disabled={off || count === 0}
          className="rounded-2xl border border-line px-5 py-2 font-bold disabled:opacity-40"
        >
          أغلق البرنامج وأعد تشغيله
        </motion.button>
      </div>

      <div className="grid gap-4 md:grid-cols-3" dir="ltr">
        <Box title="App 1: notes = []" sub="memory only" items={memory} off={off} />
        <Box title='App 2: open(..., "a")' sub="memory, loaded from the file" items={loaded} off={off} good />
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="code mb-1 text-sm font-bold">notes.txt</div>
          <div className="mb-3 text-xs text-muted">on disk, outside the program</div>
          <div className="code min-h-24 rounded-xl bg-code p-2 text-xs">
            {disk.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-str">
                {d}
                <span className="text-muted">\n</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 min-h-12 text-center">
        {restarts === 0 && <p className="text-muted">أضف ملاحظتين، ثم أعد تشغيل البرنامج.</p>}
        {restarts > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-err">ذاكرة البرنامج تُمحى حين ينتهي.</span>{" "}
            <span className="text-ok">الملف على القرص بقي، فقرأه التطبيق الثاني عند بدايته.</span>
          </motion.p>
        )}
      </div>
    </div>
  );
}

function Box({ title, sub, items, off, good }: { title: string; sub: string; items: string[]; off: boolean; good?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${good ? "border-accent/50 bg-accent-soft/20" : "border-line bg-surface"}`}>
      <div className="code mb-1 text-sm font-bold">{title}</div>
      <div className="mb-3 text-xs text-muted">{off ? "restarting..." : sub}</div>
      <div className="min-h-24 rounded-xl bg-code p-2">
        <AnimatePresence>
          {items.map((n, i) => (
            <motion.div
              key={`${i}-${n}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="code mb-1 rounded-md bg-surface px-2 py-1 text-xs"
            >
              {n}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
