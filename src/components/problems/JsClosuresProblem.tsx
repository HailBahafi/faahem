"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const BUTTONS = ["A", "B", "C"];

/** One shared global counter that any code can reset, against a private counter per button. */
export default function JsClosuresProblem() {
  const [shared, setShared] = useState(0);
  const [own, setOwn] = useState([0, 0, 0]);
  const [resets, setResets] = useState(0);

  const press = (i: number) => {
    setShared((s) => s + 1);
    setOwn((o) => o.map((v, k) => (k === i ? v + 1 : v)));
  };
  const reset = () => {
    setShared(0);
    setOwn([0, 0, 0]);
    setResets(0);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {BUTTONS.map((b, i) => (
          <motion.button
            key={b}
            whileTap={{ scale: 0.9 }}
            onClick={() => press(i)}
            className="rounded-xl bg-accent px-5 py-2 text-lg font-bold text-accent-fg"
          >
            زر {b}
          </motion.button>
        ))}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setShared(0);
            setResets((r) => r + 1);
          }}
          className="code rounded-xl border border-err/50 px-4 py-2 text-sm text-err"
          dir="ltr"
        >
          count = 0 // other script
        </motion.button>
        <button onClick={reset} className="text-sm text-muted hover:text-fg">
          ابدأ من جديد
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="font-semibold">متغير عام واحد</div>
          <div className="code text-xs text-muted" dir="ltr">let count = 0; // global</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {BUTTONS.map((b) => (
              <Box key={b} label={b} value={shared} bad />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            كل الأزرار تقرأ الدرج نفسه، وأي سطر في أي ملف يستطيع تغييره.
          </p>
        </div>

        <div className="rounded-2xl border border-accent/50 bg-accent-soft/20 p-4">
          <div className="font-semibold">عدّاد مخفي لكل زر</div>
          <div className="code text-xs text-muted" dir="ltr">const counter = makeCounter();</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {BUTTONS.map((b, i) => (
              <Box key={b} label={b} value={own[i]} />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">لكل زر count خاص داخل إغلاقه، لا يصل إليه أحد غيره.</p>
        </div>
      </div>

      {resets > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          الكود الآخر صفّر المتغير العام {resets} {resets === 1 ? "مرة" : "مرات"}، ولم يستطع لمس العدّادات المخفية. هذه هي{" "}
          <b className="text-fg">الإغلاقات</b>: دالة تحمل معها متغيرات خاصة بها، تبقى حيّة بعد انتهاء الدالة التي صنعتها.
        </motion.p>
      )}
    </div>
  );
}

function Box({ label, value, bad }: { label: string; value: number; bad?: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-code p-2">
      <span className="text-xs text-muted">زر {label}</span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          className={`code text-3xl font-bold ${bad ? "text-[#ff8a8a]" : "text-num"}`}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
