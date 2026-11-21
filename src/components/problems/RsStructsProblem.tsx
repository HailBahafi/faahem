"use client";

import { motion } from "motion/react";
import { useState } from "react";

const NAMES = ["Sara", "Omar", "Lina"];
const SCORES = [40, 90, 70];

/** Parallel lists drift apart when one is sorted; a struct keeps a player's name and score in one block. */
export default function RsStructsProblem() {
  const [sorted, setSorted] = useState(false);

  const looseScores = sorted ? [...SCORES].sort((a, b) => b - a) : SCORES;
  const players = NAMES.map((name, i) => ({ name, score: SCORES[i] }));
  const ranked = sorted ? [...players].sort((a, b) => b.score - a.score) : players;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="font-semibold">قائمتان منفصلتان</div>
          <div className="code text-xs text-muted" dir="ltr">names: Vec&lt;String&gt;, scores: Vec&lt;u32&gt;</div>
          <div className="mt-3 space-y-2" dir="ltr">
            {NAMES.map((name, i) => {
              const wrong = looseScores[i] !== SCORES[i];
              return (
                <motion.div key={name} layout className={`code flex justify-between rounded-lg px-3 py-2 ${wrong ? "bg-code text-err" : "bg-code"}`}>
                  <span>{name}</span>
                  <motion.span key={looseScores[i]} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={wrong ? "" : "text-num"}>
                    {looseScores[i]}
                  </motion.span>
                </motion.div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-accent/50 bg-accent-soft/20 p-4">
          <div className="font-semibold">struct لكل لاعب</div>
          <div className="code text-xs text-muted" dir="ltr">players: Vec&lt;Player {"{ name, score }"}&gt;</div>
          <div className="mt-3 space-y-2" dir="ltr">
            {ranked.map((p) => (
              <motion.div key={p.name} layout className="code flex justify-between rounded-lg bg-code px-3 py-2">
                <span>{p.name}</span>
                <span className="text-num">{p.score}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => setSorted((s) => !s)}
          className="rounded-2xl bg-accent px-5 py-2 font-bold text-accent-fg"
        >
          {sorted ? "أرجع الترتيب" : "رتّب حسب النتيجة"}
        </motion.button>
        {sorted && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
            في اليسار رُتّبت النتائج وحدها، فصارت Sara صاحبة 90. لا شيء يربط الاسم بنتيجته إلا الفهرس. في اليمين الاسم والنتيجة <b className="text-fg">كتلة واحدة</b> تتحرك معاً.
          </motion.p>
        )}
      </div>
    </div>
  );
}
