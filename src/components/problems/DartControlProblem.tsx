"use client";

import { motion } from "motion/react";
import { useState } from "react";

const WEIGHTS = [120, 900, 4000, 300, 75, 1500, 640, 210];
const SIZES = ["small", "medium", "large"] as const;
type Size = (typeof SIZES)[number];

const rule = (g: number): Size => (g < 250 ? "small" : g < 1000 ? "medium" : "large");

/** Label eight parcels by hand, then write the decision once and let a loop apply it to all of them. */
export default function DartControlProblem() {
  const [hand, setHand] = useState<(Size | null)[]>(WEIGHTS.map(() => null));
  const [clicks, setClicks] = useState(0);
  const [looped, setLooped] = useState(-1);

  const setOne = (i: number, size: Size) => {
    setHand(hand.map((h, k) => (k === i ? size : h)));
    setClicks((c) => c + 1);
  };

  const runLoop = () => {
    setLooped(-1);
    WEIGHTS.forEach((_, i) => setTimeout(() => setLooped(i), 150 * (i + 1)));
  };

  const wrong = hand.filter((h, i) => h !== null && h !== rule(WEIGHTS[i])).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 text-sm font-bold">بيدك: اختر تصنيف كل طرد (أقل من 250 غ صغير، أقل من 1000 متوسط، والباقي كبير)</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {WEIGHTS.map((g, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface p-2 text-center text-xs">
              <div className="code text-num" dir="ltr">{g} g</div>
              <div className="mt-1 flex justify-center gap-1">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setOne(i, s)}
                    className={`rounded px-1.5 py-0.5 ${hand[i] === s ? (s === rule(g) ? "bg-accent text-accent-fg" : "bg-err/20 text-err") : "bg-code"}`}
                  >
                    {s[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-sm text-muted">
          ضغطات: <b className="text-fg">{clicks}</b>
          {wrong > 0 && <span className="text-err"> · أخطاء: {wrong}</span>}
        </div>
      </div>

      <div className="rounded-2xl border border-accent/50 bg-accent-soft/20 p-4">
        <div className="code rounded-xl bg-code p-3 text-xs" dir="ltr">
          <div>for (final g in parcels) {"{"}</div>
          <div className="ps-4">final size = switch (g) {"{"} &lt; 250 =&gt; &quot;small&quot;, &lt; 1000 =&gt; &quot;medium&quot;, _ =&gt; &quot;large&quot; {"}"};</div>
          <div>{"}"}</div>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={runLoop}
          className="mt-3 rounded-2xl bg-accent px-6 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20"
        >
          اكتب القاعدة مرة واحدة وشغّلها
        </motion.button>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {WEIGHTS.map((g, i) => (
            <motion.div
              key={i}
              animate={{ scale: looped === i ? 1.12 : 1, opacity: i <= looped ? 1 : 0.3 }}
              className="rounded-lg bg-code p-1 text-center text-xs"
            >
              <div className="code text-num" dir="ltr">{g}</div>
              <div className="code text-ok">{i <= looped ? rule(g) : "?"}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {looped === WEIGHTS.length - 1 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted">
          ضغطة واحدة وصفر أخطاء. الشرط يكتب القرار مرة واحدة، والحلقة تعيد المعالج إليه لكل طرد. لو صار عندك مليون طرد، يبقى الكود ثلاثة أسطر.
        </motion.p>
      )}
    </div>
  );
}
