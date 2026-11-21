"use client";

import { motion } from "motion/react";
import { useState } from "react";

const TEXT = "hello world";

/** Pick a window over the bytes of a String: the slice is only (start, len). Then try to change the String while the window is in use. */
export default function RsSlicesProblem() {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(5);
  const [error, setError] = useState(false);

  const setRange = (s: number, e: number) => {
    setStart(Math.min(s, e));
    setEnd(Math.max(s, e));
    setError(false);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-1" dir="ltr">
        {TEXT.split("").map((c, i) => {
          const inside = i >= start && i < end;
          return (
            <div key={i} className="flex flex-col items-center">
              <motion.div
                animate={{ y: inside ? -6 : 0 }}
                className={`code flex h-11 w-9 items-center justify-center rounded-lg text-lg font-bold ${inside ? "bg-accent text-accent-fg" : "bg-code text-muted"}`}
              >
                {c === " " ? "␣" : c}
              </motion.div>
              <span className="code mt-1 text-xs text-muted">{i}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2" dir="ltr">
        <label className="code text-sm text-muted">
          start {start}
          <input type="range" min={0} max={TEXT.length} value={start} onChange={(e) => setRange(Number(e.target.value), end)} className="w-full accent-[var(--accent)]" />
        </label>
        <label className="code text-sm text-muted">
          end {end}
          <input type="range" min={0} max={TEXT.length} value={end} onChange={(e) => setRange(start, Number(e.target.value))} className="w-full accent-[var(--accent)]" />
        </label>
      </div>
      <div className="code mt-4 rounded-xl bg-code p-3 text-sm leading-7" dir="ltr">
        <div>let window = &amp;text[{start}..{end}];</div>
        <div className="text-muted">
          {"// "}window = (ptr: text + {start}, len: {end - start}) → <span className="text-str">&quot;{TEXT.slice(start, end)}&quot;</span>
        </div>
        <div>text.clear();</div>
        <div>println!(&quot;{"{}"}&quot;, window);</div>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-err">
            error[E0502]: cannot borrow `text` as mutable because it is also borrowed as immutable
          </motion.div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.94 }} onClick={() => setError(true)} className="code rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg" dir="ltr">
          cargo run
        </motion.button>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
            النافذة لا تملك الحروف، بل تشير إلى حروف text. لو مُسح text ثم طُبعت النافذة، لقرأت ذاكرة ممسوحة. المترجم يمنع ذلك قبل التشغيل.
          </motion.p>
        )}
      </div>
    </div>
  );
}
