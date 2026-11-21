"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const POOL = ["Sara", "Omar", "Lina", "Faisal", "Noura", "Yousef", "Huda", "Khalid"];

/** Greeting every student by hand grows a line per name; a for loop stays two lines and moves one label along the list. */
export default function PyLoopsProblem() {
  const [count, setCount] = useState(3);
  const [at, setAt] = useState<number | null>(null);
  const [ran, setRan] = useState(false);
  const names = POOL.slice(0, count);

  useEffect(() => {
    if (at === null) return;
    const t = setTimeout(() => setAt(at + 1 < count ? at + 1 : null), 650);
    return () => clearTimeout(t);
  }, [at, count]);

  const run = () => {
    setAt(0);
    setRan(true);
  };
  const greeted = at === null ? (ran ? count : 0) : at + 1;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={count >= POOL.length || at !== null}
          onClick={() => setCount((c) => c + 1)}
          className="rounded-xl border border-line bg-surface px-4 py-2 font-semibold disabled:opacity-40"
        >
          أضف طالباً
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={at !== null}
          onClick={run}
          className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg disabled:opacity-60"
        >
          شغّل الحلقة
        </motion.button>
      </div>

      <div className="mb-6 flex min-h-20 flex-wrap items-end gap-2" dir="ltr">
        <span className="code self-center text-sm text-muted">names →</span>
        {names.map((n, i) => (
          <div key={n} className="flex flex-col items-center gap-1">
            <div className="h-6">
              {at === i && (
                <motion.span layoutId="loop-name" className="code rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-accent-fg">
                  name ↓
                </motion.span>
              )}
            </div>
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`code rounded-lg border-2 bg-code px-2.5 py-1.5 text-sm text-str ${i < greeted ? "border-ok" : "border-line"}`}
            >
              &quot;{n}&quot;
            </motion.span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-2 flex justify-between font-semibold">
            <span>بلا حلقة</span>
            <span className="text-err">{count} أسطر</span>
          </div>
          <pre className="code max-h-48 overflow-auto rounded-lg bg-code p-3 text-sm" dir="ltr">
            {names.map((n) => `print("hello", "${n}")`).join("\n")}
          </pre>
        </div>
        <div className="rounded-2xl border border-accent/50 bg-accent-soft/20 p-4">
          <div className="mb-2 flex justify-between font-semibold">
            <span>بحلقة for</span>
            <span className="text-ok">سطران دائماً</span>
          </div>
          <pre className="code rounded-lg bg-code p-3 text-sm" dir="ltr">
            {"for name in names:\n    print(\"hello\", name)"}
          </pre>
          <div className="code mt-2 min-h-6 text-sm text-muted" dir="ltr">
            {greeted > 0 && names.slice(0, greeted).map((n) => `hello ${n}`).join(" · ")}
          </div>
        </div>
      </div>

      <div className="mt-4 min-h-10 text-center">
        {ran && at === null && count >= 5 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            الكود اليدوي يطول مع كل طالب، والحلقة لا تتغيّر. و name <b className="text-accent">بطاقة واحدة تنتقل</b> من عنصر إلى الذي يليه.
          </motion.p>
        )}
        {!(ran && at === null && count >= 5) && <p className="text-muted">أضف طلاباً حتى يصبحوا خمسة على الأقل، ثم شغّل الحلقة.</p>}
      </div>
    </div>
  );
}
