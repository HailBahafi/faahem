"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { PredictQ } from "@/lib/types";
import ScenePlayer from "../scene/ScenePlayer";
import TracePlayer from "../TracePlayer";
import CodePanel from "../scene/CodePanel";

export default function Predict({ items }: { items: PredictQ[] }) {
  const [q, setQ] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const item = items[q];
  const right = picked === item.answer;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        {items.map((_, k) => (
          <span key={k} className={`h-1.5 w-10 rounded-full ${k < q ? "bg-accent" : k === q ? "bg-accent/60" : "bg-line"}`} />
        ))}
        <span className="ms-2 text-sm text-muted">سؤال {q + 1} من {items.length}</span>
      </div>

      <h3 className="mb-3 text-xl font-bold">{item.question}</h3>

      {picked === null ? (
        <div className="grid gap-4 md:grid-cols-2">
          <CodePanel code={item.code} line={null} title={item.lang === "py" ? "Python: توقّع قبل التشغيل" : "توقّع قبل التشغيل"} />
          <div className="flex flex-col gap-2">
            {item.options.map((o, k) => (
              <motion.button
                key={k}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPicked(k)}
                className="code rounded-xl border border-line bg-surface p-4 text-start text-base hover:border-accent"
                dir="auto"
              >
                {o}
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 rounded-xl border p-4 ${right ? "border-ok/40 bg-ok/10" : "border-err/40 bg-err/10"}`}
          >
            <div className={`font-bold ${right ? "text-ok" : "text-err"}`}>
              {right ? "توقّع صحيح!" : `ليس تماماً. الجواب: ${item.options[item.answer]}`}
            </div>
            <p className="mt-1 leading-7">{item.why}</p>
            <p className="mt-1 text-sm text-muted">شاهد الآن ما يحدث فعلاً داخل الذاكرة:</p>
          </motion.div>
          {item.scene ? (
            <ScenePlayer key={q} scene={item.scene} lang={item.lang} autoPlay />
          ) : (
            <TracePlayer key={q} code={item.code} lang={item.lang ?? "js"} />
          )}
          <div className="mt-4 flex gap-2">
            {!right && (
              <button onClick={() => setPicked(null)} className="rounded-xl border border-line px-4 py-2 text-sm">
                حاول مرة أخرى
              </button>
            )}
            {q < items.length - 1 && (
              <button onClick={() => { setQ(q + 1); setPicked(null); }} className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-fg">
                السؤال التالي
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
