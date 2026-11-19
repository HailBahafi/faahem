"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const START = "  SaRa ";
const GOAL = "sara";

const METHODS: { id: string; run: (t: string) => string }[] = [
  { id: "trim", run: (t) => t.trim() },
  { id: "toLowerCase", run: (t) => t.toLowerCase() },
  { id: "toUpperCase", run: (t) => t.toUpperCase() },
];

/** A row of letter tiles with their indices. Spaces are drawn as a faint dot so they can be counted. */
function Tiles({ text, tone }: { text: string; tone: "str" | "muted" }) {
  return (
    <div dir="ltr" className="flex flex-wrap gap-1">
      {[...text].map((ch, i) => (
        <motion.div
          key={`${i}-${ch}`}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.03 }}
          className="flex flex-col items-center"
        >
          <span
            className={`code flex h-10 w-9 items-center justify-center rounded-lg border border-line bg-code text-xl font-bold ${
              tone === "str" ? "text-str" : "text-muted"
            }`}
          >
            {ch === " " ? <span className="opacity-40">·</span> : ch}
          </span>
          <span className="code mt-1 text-[10px] text-muted">{i}</span>
        </motion.div>
      ))}
    </div>
  );
}

/** A username cleaner: calling a method builds a new string; unless it is stored, the drawer keeps the old name. */
export default function StringsProblem() {
  const [name, setName] = useState(START);
  const [store, setStore] = useState(false);
  const [made, setMade] = useState<{ key: number; method: string; text: string; stored: boolean } | null>(null);
  const [lost, setLost] = useState(0);

  const ok = name === GOAL;

  const apply = (m: (typeof METHODS)[number]) => {
    const text = m.run(name);
    setMade({ key: Date.now(), method: m.id, text, stored: store });
    if (store) setName(text);
    else setLost((n) => n + 1);
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="code font-semibold" dir="ltr">name</span>
            <span className="code text-xs text-muted" dir="ltr">length {name.length}</span>
          </div>
          <div className="mt-3">
            <Tiles text={name} tone="str" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2" dir="ltr">
            {METHODS.map((m) => (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => apply(m)}
                className="code rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-fg"
              >
                {store ? "name = " : ""}name.{m.id}()
              </motion.button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setStore((v) => !v)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                store ? "border-accent bg-accent-soft/30" : "border-line"
              }`}
            >
              {store ? "✓ " : ""}احفظ الناتج في name
            </button>
            <button
              onClick={() => {
                setName(START);
                setMade(null);
              }}
              className="text-sm text-muted underline"
            >
              ابدأ من جديد
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="min-h-32 rounded-2xl border border-line bg-surface p-5">
            <div className="text-sm text-muted">ما بنته الدالة:</div>
            <AnimatePresence mode="popLayout">
              {made && (
                <motion.div
                  key={made.key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: made.stored ? 1 : 0.45, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-3"
                >
                  <Tiles text={made.text} tone={made.stored ? "str" : "muted"} />
                  <p className={`mt-2 text-sm font-semibold ${made.stored ? "text-ok" : "text-err"}`}>
                    {made.stored ? "نص جديد، ووُضع في الدرج name." : "نص جديد، لكن لا درج يستقبله. ضاع، و name كما هو."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            className={`rounded-2xl border p-5 text-center text-lg font-bold ${
              ok ? "border-accent/50 bg-accent-soft/20 text-ok" : "border-line bg-surface text-err"
            }`}
          >
            {ok ? "تم الدخول ✓" : <>لا يوجد مستخدم باسم <span className="code" dir="ltr">&quot;{name}&quot;</span></>}
          </div>
        </div>
      </div>

      {lost >= 2 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          الدالة لا تغيّر النص الأصلي أبداً: <b className="text-fg">تبني نصاً جديداً</b> وتعيده. إن لم تضعه في درج بـ{" "}
          <b className="code text-fg">=</b> يضيع.
        </motion.p>
      )}
    </div>
  );
}
