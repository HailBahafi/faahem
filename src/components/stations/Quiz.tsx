"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { QuizQ } from "@/lib/types";
import CodePanel from "../scene/CodePanel";

export const PASS_RATIO = 0.8;

export default function Quiz({ items, onFinish, passNote }: { items: QuizQ[]; onFinish: (score: number) => void; passNote?: string }) {
  const [q, setQ] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const item = items[q];

  function pick(k: number) {
    if (picked !== null) return;
    setPicked(k);
    if (k === item.answer) setScore((s) => s + 1);
  }

  function next() {
    if (q === items.length - 1) {
      setFinished(true);
      onFinish(score);
    } else {
      setQ(q + 1);
      setPicked(null);
    }
  }

  if (finished) {
    const pass = score / items.length >= PASS_RATIO;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
        <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full text-3xl font-bold ${pass ? "bg-ok/15 text-ok" : "bg-err/15 text-err"}`}>
          {score}/{items.length}
        </div>
        <h3 className="mt-4 text-2xl font-bold">{pass ? "فهمت الدرس!" : "تحتاج مراجعة بسيطة"}</h3>
        <p className="mt-2 text-muted">
          {pass ? passNote ?? "اجتزت اختبار الفهم، وفُتح الدرس التالي." : `تحتاج ${Math.ceil(items.length * PASS_RATIO)} إجابات صحيحة. أعد مشاهدة الأنميشن ثم حاول.`}
        </p>
        {!pass && (
          <button onClick={() => { setQ(0); setPicked(null); setScore(0); setFinished(false); }} className="mt-5 rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-fg">
            أعد الاختبار
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-1.5">
        {items.map((_, k) => (
          <span key={k} className={`h-1.5 flex-1 rounded-full ${k < q ? "bg-accent" : k === q ? "bg-accent/50" : "bg-line"}`} />
        ))}
      </div>
        <motion.div key={q} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h3 className="mb-3 text-xl font-bold">{item.question}</h3>
          {item.code && <div className="mb-4"><CodePanel code={item.code} line={null} /></div>}
          <div className="grid gap-2 md:grid-cols-2">
            {item.options.map((o, k) => {
              const state = picked === null ? "" : k === item.answer ? "border-ok bg-ok/10" : k === picked ? "border-err bg-err/10" : "opacity-50";
              return (
                <button key={k} onClick={() => pick(k)} className={`rounded-xl border border-line bg-surface p-4 text-start ${state}`} dir="auto">
                  {o}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-line bg-surface p-4">
              <div className={`font-bold ${picked === item.answer ? "text-ok" : "text-err"}`}>{picked === item.answer ? "صحيح" : "خطأ"}</div>
              <p className="mt-1 leading-7">{item.why}</p>
              <button onClick={next} className="mt-3 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-fg">
                {q === items.length - 1 ? "النتيجة" : "التالي"}
              </button>
            </motion.div>
          )}
        </motion.div>
    </div>
  );
}
