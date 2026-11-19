"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

const START_CAP = 8;
const MAX = 16;
const SIZE = 4;

type Item = { id: number; value: number };

const initial = (): Item[] => [12, 7, 30, 5].map((value, id) => ({ id, value }));

/** Consecutive cells: insert at index 0 shifts everyone, push writes one cell, a full block is copied. */
export default function ArrayDsProblem() {
  const [items, setItems] = useState<Item[]>(initial);
  const [cap, setCap] = useState(START_CAP);
  const [base, setBase] = useState(1000);
  const [moves, setMoves] = useState(0);
  const [last, setLast] = useState<{ text: string; bad: boolean } | null>(null);
  const nextId = useRef(4);
  const full = items.length >= MAX;

  const grow = (len: number) => {
    if (len < cap) return 0;
    setCap((c) => c * 2);
    setBase((b) => b + 400);
    return len;
  };

  const add = (front: boolean) => {
    if (full) return;
    const value = 1 + Math.floor(Math.random() * 99);
    const item = { id: nextId.current++, value };
    const copied = grow(items.length);
    const shifted = front ? items.length : 0;
    setItems(front ? [item, ...items] : [...items, item]);
    setMoves((m) => m + copied + shifted);
    if (copied) setLast({ text: `الكتلة امتلأت: نُسخت ${copied} خانات إلى كتلة جديدة أكبر`, bad: true });
    else if (front) setLast({ text: `تحرّكت ${shifted} خانات لتفرغ الخانة 0`, bad: true });
    else setLast({ text: "كُتب في الخانة الفارغة التالية: لم يتحرك أحد", bad: false });
  };

  const reset = () => {
    setItems(initial());
    setCap(START_CAP);
    setBase(1000);
    setMoves(0);
    setLast(null);
    nextId.current = 4;
  };

  return (
    <div>
      <div className="overflow-x-auto pb-2" dir="ltr">
        <div className="code mb-1 text-xs text-muted">
          block @ <span className="text-num">{base}</span> · capacity {cap}
        </div>
        <motion.div
          key={base}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          className="relative inline-flex rounded-xl border-2 border-accent"
        >
          {Array.from({ length: cap }, (_, k) => (
            <div key={k} className={`flex w-12 shrink-0 flex-col items-center ${k > 0 ? "border-l border-line" : ""}`}>
              <div className="flex h-10 items-center justify-center">
                {k >= items.length && <span className="h-6 w-8 rounded border border-dashed border-line" />}
              </div>
              <span className="code text-[10px] text-muted">{k}</span>
              <span className="code text-[10px] text-muted">{base + k * SIZE}</span>
            </div>
          ))}
          <div className="pointer-events-none absolute left-0 top-0 flex">
            <AnimatePresence initial={false}>
              {items.map((it, k) => (
                <motion.div
                  key={it.id}
                  layout
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ layout: { delay: (items.length - k) * 0.04 } }}
                  className="code flex h-10 w-12 shrink-0 items-center justify-center font-bold text-num"
                >
                  {it.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={full}
          onClick={() => add(true)}
          className="rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          أدخل في الأول
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={full}
          onClick={() => add(false)}
          className="rounded-2xl border border-accent px-5 py-3 font-bold disabled:opacity-40"
        >
          أضف في الآخر
        </motion.button>
        <div className="rounded-2xl bg-surface px-4 py-2 text-center">
          <div className="text-xs text-muted">حركات</div>
          <motion.div key={moves} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="code text-xl font-bold text-num">
            {moves}
          </motion.div>
        </div>
        {moves > 0 && (
          <button onClick={reset} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {!last && <p className="text-muted">الخانة i عنوانها: البداية + i × {SIZE}. قراءتها قفزة واحدة.</p>}
        {last && (
          <motion.p key={moves + last.text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={last.bad ? "text-err" : "text-ok"}>
            {last.text}
          </motion.p>
        )}
        {full && <p className="text-muted">الصف امتلأ لهذا العرض. ابدأ من جديد وجرّب ترتيباً آخر.</p>}
      </div>
    </div>
  );
}
