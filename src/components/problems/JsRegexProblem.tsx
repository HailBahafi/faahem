"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";

const TEXT = `Sara: call me on 0551234567 tonight
Omar: my number is 0569876543, not 0123
Huda: order #5512 ships 2026-11-21
Ali: +966501112233 or 055 123 4567`;

const PRESETS = [
  { label: "indexOf", pattern: "0551234567" },
  { label: "05 + 8 digits", pattern: "05\\d{8}" },
  { label: "+966 too", pattern: "(?:\\+966|0)5\\d{8}" },
  { label: "dates", pattern: "\\d{4}-\\d{2}-\\d{2}" },
];

/** Live pattern matching over a few messages: a fixed string finds one number, a pattern finds the shape. */
export default function JsRegexProblem() {
  const [pattern, setPattern] = useState(PRESETS[0].pattern);

  const { parts, count, error } = useMemo(() => {
    try {
      const re = new RegExp(pattern, "g");
      const out: { text: string; hit: boolean }[] = [];
      let last = 0;
      let n = 0;
      if (pattern) {
        for (const m of TEXT.matchAll(re)) {
          if (m[0] === "") continue;
          out.push({ text: TEXT.slice(last, m.index), hit: false }, { text: m[0], hit: true });
          last = (m.index ?? 0) + m[0].length;
          n++;
        }
      }
      out.push({ text: TEXT.slice(last), hit: false });
      return { parts: out, count: n, error: "" };
    } catch (e) {
      return { parts: [{ text: TEXT, hit: false }], count: 0, error: (e as Error).message };
    }
  }, [pattern]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <motion.button
            key={p.label}
            whileTap={{ scale: 0.92 }}
            onClick={() => setPattern(p.pattern)}
            className={`code rounded-xl px-3 py-1.5 text-sm ${pattern === p.pattern ? "bg-accent font-bold text-accent-fg" : "border border-line bg-surface"}`}
          >
            {p.label}
          </motion.button>
        ))}
      </div>

      <div className="code mb-3 flex items-center gap-1 rounded-xl border border-line bg-code px-3 py-2" dir="ltr">
        <span className="text-muted">/</span>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-str outline-none"
          aria-label="pattern"
        />
        <span className="text-muted">/g</span>
        <motion.span key={count} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="ml-2 font-bold text-num">
          {count}
        </motion.span>
      </div>

      <pre className="code whitespace-pre-wrap rounded-2xl border border-line bg-surface p-4 text-sm leading-7" dir="ltr">
        {parts.map((p, i) =>
          p.hit ? (
            <motion.mark key={`${pattern}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded bg-accent px-0.5 text-accent-fg">
              {p.text}
            </motion.mark>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
      </pre>

      <div className="mt-3 min-h-10 text-center">
        {error ? (
          <p className="code text-sm text-err" dir="ltr">{error}</p>
        ) : pattern !== PRESETS[0].pattern && count > 0 ? (
          <p>النمط لا يصف نصاً بعينه بل <b className="text-fg">شكلاً</b>، والمحرّك يجرّبه عند كل موضع في النص من اليسار.</p>
        ) : (
          <p className="text-muted">indexOf تجد الرقم الذي تعرفه فقط. جرّب نمطاً.</p>
        )}
      </div>
    </div>
  );
}
