"use client";

import { motion } from "motion/react";
import { useState } from "react";

const WORD = 5; // letters per word

/** Building a long String: `s = s + w` copies every earlier letter again each time; a StringBuffer writes each letter once. */
export default function DartStringsProblem() {
  const [words, setWords] = useState(4);
  const [built, setBuilt] = useState(false);

  const plusCopies = (WORD * words * (words + 1)) / 2;
  const plusStrings = words;
  const bufferCopies = WORD * words * 2; // written once into the buffer, copied once by toString()
  const max = Math.max(plusCopies, bufferCopies);

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-wrap items-center gap-3 text-sm">
        عدد الكلمات (كل كلمة {WORD} حروف):
        <input
          type="range"
          min={1}
          max={40}
          value={words}
          onChange={(e) => {
            setWords(Number(e.target.value));
            setBuilt(false);
          }}
          className="w-48 accent-[var(--accent)]"
        />
        <b className="code text-num">{words}</b>
      </label>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setBuilt(true)}
        className="self-start rounded-2xl bg-accent px-6 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20"
      >
        ابنِ النص بالطريقتين
      </motion.button>

      <div className="flex flex-col gap-4">
        <Row
          title="s = s + word;"
          note={`كل دورة تصنع نصاً جديداً وتنسخ إليه كل الحروف السابقة. نصوص مؤقتة: ${plusStrings}`}
          value={plusCopies}
          max={max}
          show={built}
          bad
        />
        <Row
          title="buf.write(word);"
          note="StringBuffer يكتب كل حرف مرة واحدة، ثم toString()‎ تصنع نصاً واحداً في النهاية."
          value={bufferCopies}
          max={max}
          show={built}
        />
      </div>

      {built && words >= 20 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted">
          النص لا يتغير بعد أن يُصنع، لذلك كل + تبني نصاً كاملاً جديداً. مع {words} كلمة نسخت الطريقة الأولى {plusCopies} حرفاً مقابل {bufferCopies}. ضاعف عدد الكلمات فتتضاعف الثانية، أما الأولى فتصير أربعة أضعاف.
        </motion.p>
      )}
      {built && words < 20 && <p className="text-sm text-muted">حرّك العدد إلى 40 وابنِ من جديد.</p>}
    </div>
  );
}

function Row({ title, note, value, max, show, bad }: { title: string; note: string; value: number; max: number; show: boolean; bad?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="code text-sm" dir="ltr">{title}</span>
        <span className={`code font-bold ${bad ? "text-err" : "text-ok"}`}>{show ? `${value} حرفاً منسوخاً` : "?"}</span>
      </div>
      <div className="mt-2 h-4 overflow-hidden rounded-full bg-code">
        <motion.div
          initial={false}
          animate={{ width: show ? `${(value / max) * 100}%` : "0%" }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${bad ? "bg-err" : "bg-accent"}`}
        />
      </div>
      <div className="mt-1 text-xs text-muted">{note}</div>
    </div>
  );
}
