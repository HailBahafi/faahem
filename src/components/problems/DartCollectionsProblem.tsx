"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

const VISITORS = ["Sara", "Omar", "Sara", "Lina", "Omar", "Sara", "Nora"];

/** Visitors arrive one by one; a List, a Set and a Map each keep them their own way. */
export default function DartCollectionsProblem() {
  const [count, setCount] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const arrived = VISITORS.slice(0, count);
  const unique = [...new Set(arrived)];
  const visits = unique.map((name) => [name, arrived.filter((v) => v === name).length] as const);
  const done = count === VISITORS.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={done}
          onClick={() => setCount(count + 1)}
          className="rounded-2xl bg-accent px-6 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          {done ? "دخل الجميع" : `أدخل الزائر التالي: ${VISITORS[count]}`}
        </motion.button>
        {count > 0 && (
          <button
            onClick={() => {
              setCount(0);
              setAnswer(null);
            }}
            className="text-sm text-muted hover:text-fg"
          >
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Box title="List<String>" note="كل دخول بترتيبه، والمكرر يبقى">
          {arrived.map((v, i) => (
            <Chip key={i} text={`[${i}] ${v}`} />
          ))}
        </Box>
        <Box title="Set<String>" note="كل اسم مرة واحدة">
          {unique.map((v) => (
            <Chip key={v} text={v} />
          ))}
        </Box>
        <Box title="Map<String, int>" note="الاسم مفتاح، والقيمة عدد الزيارات">
          {visits.map(([k, n]) => (
            <Chip key={k} text={`${k}: ${n}`} />
          ))}
        </Box>
      </div>

      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
          <div className="text-sm font-bold">كم زائراً مختلفاً جاء؟</div>
          <div className="flex gap-2">
            {[7, 5, 4].map((n) => (
              <button
                key={n}
                onClick={() => setAnswer(n)}
                className={`rounded-lg px-4 py-2 ${answer === n ? (n === 4 ? "bg-accent text-accent-fg" : "bg-err/20 text-err") : "border border-line bg-surface"}`}
              >
                {n}
              </button>
            ))}
          </div>
          {answer !== null && (
            <p className="text-sm text-muted">
              {answer === 4 ? "صحيح. " : "ليس هذا. "}
              الجواب عند Set مباشرة: <span className="code" dir="ltr">visitors.length == 4</span>. والسؤال «كم مرة جاءت Sara؟» تجيبه Map بقفزة واحدة إلى المفتاح. اختيار الصندوق الصحيح يجعل السؤال سطراً واحداً.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

function Box({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3">
      <div className="code font-semibold" dir="ltr">{title}</div>
      <div className="text-xs text-muted">{note}</div>
      <div className="mt-2 flex min-h-24 flex-wrap content-start gap-1 rounded-xl bg-code p-2" dir="ltr">
        <AnimatePresence>{children}</AnimatePresence>
      </div>
    </div>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <motion.span layout initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="code rounded-md bg-accent/15 px-2 py-0.5 text-xs">
      {text}
    </motion.span>
  );
}
