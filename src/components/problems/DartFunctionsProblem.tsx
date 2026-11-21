"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** The call as a colleague wrote it, and what each bare value really means. */
const ARGS = [
  { value: '"latte"', name: "drink", meaning: "اسم المشروب" },
  { value: "2", name: "qty", meaning: "عدد الأكواب" },
  { value: "true", name: "takeaway", meaning: "سفري" },
  { value: "false", name: "extraShot", meaning: "جرعة إضافية" },
];
const GUESSES = ["سفري", "جرعة إضافية", "مدفوع مسبقاً", "بلا سكر"];

/** Guess what bare positional arguments mean, then see the same call with Dart's named parameters. */
export default function DartFunctionsProblem() {
  const [guess, setGuess] = useState<Record<number, string>>({});
  const [named, setNamed] = useState(false);
  const right = [2, 3].filter((i) => guess[i] === ARGS[i].meaning).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-code p-4 text-lg" dir="ltr">
        <span className="code">orderCoffee(</span>
        {ARGS.map((a, i) => (
          <span key={i} className="code">
            {named && i > 0 && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent">{a.name}: </motion.span>}
            <span className={i >= 2 ? "rounded bg-accent/15 px-1 text-bool" : i === 1 ? "text-num" : "text-str"}>{a.value}</span>
            {i < ARGS.length - 1 && ", "}
          </span>
        ))}
        <span className="code">);</span>
      </div>

      {!named && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-line bg-surface p-3">
              <div className="mb-2 text-sm">
                ماذا تعني <span className="code text-bool">{ARGS[i].value}</span> في الموضع {i + 1}؟
              </div>
              <div className="flex flex-wrap gap-1">
                {GUESSES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGuess({ ...guess, [i]: g })}
                    className={`rounded-lg px-2 py-1 text-xs ${guess[i] === g ? "bg-accent text-accent-fg" : "bg-code"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setNamed(!named)}
          className="rounded-2xl bg-accent px-6 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20"
        >
          {named ? "عُد إلى القيم المجرّدة" : "اكشف: كيف يكتبها Dart بأسماء"}
        </motion.button>
        {named && Object.keys(guess).length > 0 && (
          <span className={right === 2 ? "font-bold text-ok" : "font-bold text-err"}>خمّنت {right} من 2</span>
        )}
      </div>

      <AnimatePresence>
        {named && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
            <div className="code rounded-xl border border-line bg-surface p-3 text-xs" dir="ltr">
              void orderCoffee(String drink, {"{"}int qty = 1, bool takeaway = false, bool extraShot = false{"}"})
            </div>
            <p className="text-sm text-muted">
              المعاملات بين {"{ }"} تُمرَّر بأسمائها، فيُقرأ الاستدعاء كجملة، ولا يهم ترتيبها، ولكل واحد قيمة افتراضية. لم تعد تحتاج أن تخمّن، ولا أن تفتح تعريف الدالة.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
