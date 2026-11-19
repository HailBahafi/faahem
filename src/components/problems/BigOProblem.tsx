"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const CLASSES: { id: string; label: string; example: string; color: string; f: (n: number) => number }[] = [
  { id: "1", label: "O(1)", example: "خانة في مصفوفة، مفتاح في جدول تجزئة", color: "var(--ok)", f: () => 1 },
  { id: "log", label: "O(log n)", example: "بحث ثنائي، شجرة بحث", color: "var(--num)", f: (n) => Math.max(1, Math.ceil(Math.log2(n))) },
  { id: "n", label: "O(n)", example: "بحث خطي، جمع قائمة", color: "var(--str)", f: (n) => n },
  { id: "nlog", label: "O(n log n)", example: "ترتيب جيد", color: "var(--bool)", f: (n) => n * Math.max(1, Math.ceil(Math.log2(n))) },
  { id: "n2", label: "O(n²)", example: "ترتيب الفقاعة، كل الأزواج", color: "var(--err)", f: (n) => n * n },
];

const MAX_N = 1000;
const W = 320;
const H = 180;
const fmt = (x: number) => x.toLocaleString("en-US");

/** Slide n and watch each algorithm's step counter; the curves show the shape of growth. */
export default function BigOProblem() {
  const [n, setN] = useState(10);
  const [racing, setRacing] = useState(false);

  useEffect(() => {
    if (!racing) return;
    if (n >= MAX_N) return setRacing(false);
    const t = setTimeout(() => setN((v) => Math.min(MAX_N, Math.ceil(v * 1.15) + 1)), 60);
    return () => clearTimeout(t);
  }, [racing, n]);

  // The chart's height is fixed at the O(n log n) value for the largest n, so O(n²) leaves the frame early.
  const yMax = CLASSES[3].f(MAX_N);
  const path = (f: (n: number) => number) => {
    const pts: string[] = [];
    for (let k = 1; k <= n; k += Math.max(1, Math.floor(n / 80))) {
      const y = Math.min(f(k) / yMax, 1.05);
      pts.push(`${((k / MAX_N) * W).toFixed(1)},${(H - y * H).toFixed(1)}`);
    }
    const y = Math.min(f(n) / yMax, 1.05);
    pts.push(`${((n / MAX_N) * W).toFixed(1)},${(H - y * H).toFixed(1)}`);
    return "M" + pts.join(" L");
  };
  const top = CLASSES[4].f(n);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted">عدد العناصر</span>
        <span className="code text-2xl font-bold text-num" dir="ltr">n = {fmt(n)}</span>
        <input
          type="range"
          min={1}
          max={MAX_N}
          value={n}
          onChange={(e) => {
            setRacing(false);
            setN(Number(e.target.value));
          }}
          className="min-w-40 flex-1 accent-[var(--accent)]"
          dir="ltr"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2.5">
          {CLASSES.map((c) => {
            const v = c.f(n);
            return (
              <div key={c.id}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="code font-bold" dir="ltr" style={{ color: c.color }}>{c.label}</span>
                  <span className="text-xs text-muted">{c.example}</span>
                  <span className="code font-bold" dir="ltr">{fmt(v)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface" dir="ltr">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: c.color }}
                    animate={{ width: `${Math.max(1, (v / top) * 100)}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <svg viewBox={`-6 -14 ${W + 12} ${H + 28}`} className="w-full rounded-2xl bg-code">
          <line x1={0} y1={H} x2={W} y2={H} stroke="var(--border)" />
          <line x1={0} y1={0} x2={0} y2={H} stroke="var(--border)" />
          {CLASSES.map((c) => (
            <path key={c.id} d={path(c.f)} fill="none" stroke={c.color} strokeWidth={2.5} strokeLinejoin="round" />
          ))}
          <line x1={(n / MAX_N) * W} y1={0} x2={(n / MAX_N) * W} y2={H} stroke="var(--muted)" strokeDasharray="3 3" />
          <text x={W} y={H + 12} textAnchor="end" fontSize={10} fill="var(--muted)">n →</text>
          <text x={4} y={-4} fontSize={10} fill="var(--muted)">steps</text>
        </svg>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={racing}
          onClick={() => {
            setN(1);
            setRacing(true);
          }}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          سباق من 1 إلى 1000
        </motion.button>
      </div>

      <div className="mt-3 min-h-12">
        {n <= 10 && <p className="text-muted">عند n صغير تبدو كلها متقاربة. حرّك المؤشر إلى اليمين.</p>}
        {n > 10 && n < 500 && (
          <p className="text-muted">
            ضاعف n: خط O(n) يتضاعف، وخط O(n²) يتضاعف أربع مرات، و O(log n) يزيد خطوة واحدة فقط.
          </p>
        )}
        {n >= 500 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            {fmt(CLASSES[4].f(n))} خطوة مقابل {fmt(CLASSES[1].f(n))}. الفرق لا يصنعه جهاز أسرع؛ يصنعه شكل الخوارزمية.
          </motion.p>
        )}
      </div>
    </div>
  );
}
