"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Mode = "seq" | "all";

const DRINKS = [
  { name: "latte", label: "لاتيه", ms: 2000, color: "#c08457" },
  { name: "tea", label: "شاي", ms: 1000, color: "#4ade80" },
  { name: "juice", label: "عصير", ms: 1500, color: "#fb923c" },
];
const SEQ_TOTAL = DRINKS.reduce((t, d) => t + d.ms, 0);
const ALL_TOTAL = Math.max(...DRINKS.map((d) => d.ms));

const CODE: Record<Mode, string> = {
  seq: `const a = await make("latte");
const b = await make("tea");
const c = await make("juice");`,
  all: `const [a, b, c] = await Promise.all([
  make("latte"), make("tea"), make("juice"),
]);`,
};

/** When each drink starts brewing in each mode (ms from the order). */
function startOf(mode: Mode, k: number) {
  return mode === "all" ? 0 : DRINKS.slice(0, k).reduce((t, d) => t + d.ms, 0);
}

/** A coffee shop: three drinks awaited one after another versus all at once with Promise.all. */
export default function AsyncProblem() {
  const [mode, setMode] = useState<Mode>("seq");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<Partial<Record<Mode, number>>>({});
  const t0 = useRef(0);

  useEffect(() => {
    if (!running) return;
    const total = mode === "seq" ? SEQ_TOTAL : ALL_TOTAL;
    let raf = 0;
    const tick = () => {
      const e = Math.min(performance.now() - t0.current, total);
      setElapsed(e);
      if (e >= total) {
        setRunning(false);
        setDone((d) => ({ ...d, [mode]: total }));
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, mode]);

  const start = (m: Mode) => {
    if (running) return;
    setMode(m);
    setElapsed(0);
    t0.current = performance.now();
    setRunning(true);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <motion.button
          whileTap={{ scale: 0.94 }}
          disabled={running}
          onClick={() => start("seq")}
          className={`rounded-2xl px-5 py-3 font-bold disabled:opacity-50 ${mode === "seq" ? "bg-accent text-accent-fg shadow-lg shadow-accent/20" : "border border-line bg-surface"}`}
        >
          واحداً بعد الآخر
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.94 }}
          disabled={running}
          onClick={() => start("all")}
          className={`rounded-2xl px-5 py-3 font-bold disabled:opacity-50 ${mode === "all" ? "bg-accent text-accent-fg shadow-lg shadow-accent/20" : "border border-line bg-surface"}`}
        >
          كلها معاً
        </motion.button>
      </div>

      <pre dir="ltr" className="code mt-4 overflow-x-auto rounded-xl bg-code p-3 text-sm">{CODE[mode]}</pre>

      <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <div dir="ltr" className="space-y-3">
          {DRINKS.map((d, k) => {
            const s = startOf(mode, k);
            const progress = Math.max(0, Math.min(elapsed - s, d.ms));
            const ready = progress >= d.ms;
            const brewing = progress > 0 && !ready;
            return (
              <div key={d.name} className="flex items-center gap-3">
                <div className="code w-14 shrink-0 text-sm">{d.name}</div>
                <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-code">
                  <div
                    className="absolute inset-y-0 rounded-lg opacity-25"
                    style={{ left: `${(s / SEQ_TOTAL) * 100}%`, width: `${(d.ms / SEQ_TOTAL) * 100}%`, background: d.color }}
                  />
                  <div
                    className="absolute inset-y-0 rounded-lg"
                    style={{ left: `${(s / SEQ_TOTAL) * 100}%`, width: `${(progress / SEQ_TOTAL) * 100}%`, background: d.color }}
                  />
                </div>
                <div dir="rtl" className={`w-20 shrink-0 text-sm ${ready ? "text-ok" : brewing ? "text-fg" : "text-muted"}`}>
                  {ready ? `${d.label} ✓` : brewing ? "يُحضَّر…" : "ينتظر"}
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-3">
            <div className="w-14 shrink-0" />
            <div className="relative h-5 flex-1">
              <div className="absolute inset-y-0 w-0.5 bg-accent" style={{ left: `${(elapsed / SEQ_TOTAL) * 100}%` }} />
            </div>
            <div className="code w-20 shrink-0 text-sm">{(elapsed / 1000).toFixed(1)}s</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {(["seq", "all"] as Mode[]).map((m) =>
          done[m] !== undefined ? (
            <motion.div
              key={m}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-line bg-surface px-4 py-2"
            >
              <span className="text-muted">{m === "seq" ? "واحداً بعد الآخر:" : "كلها معاً:"}</span>{" "}
              <b className="code text-num">{(done[m]! / 1000).toFixed(1)}s</b>
            </motion.div>
          ) : null,
        )}
      </div>
      {done.seq !== undefined && done.all !== undefined && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          المشروبات نفسها والوقت مختلف. مع <b className="code text-fg">await</b> المتتالية لا يبدأ الطلب الثاني قبل أن ينتهي الأول.
          مع <b className="code text-fg">Promise.all</b> تبدأ كلها معاً، والانتظار بطول أبطئها فقط.
        </motion.p>
      )}
    </div>
  );
}
