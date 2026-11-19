"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const HAND = [5, 2, 6, 1, 4, 3];
const RACE_SIZE = 32;

/** One snapshot of a sort: the row after a comparison, which two cells were compared, and the running count. */
interface Frame {
  arr: number[];
  pair: [number, number];
  count: number;
}

function bubbleFrames(start: number[]): Frame[] {
  const a = start.slice();
  const out: Frame[] = [];
  let count = 0;
  for (let end = a.length - 1; end > 0; end--) {
    for (let i = 0; i < end; i++) {
      count++;
      if (a[i] > a[i + 1]) [a[i], a[i + 1]] = [a[i + 1], a[i]];
      out.push({ arr: a.slice(), pair: [i, i + 1], count });
    }
  }
  return out;
}

function mergeFrames(start: number[]): Frame[] {
  const a = start.slice();
  const out: Frame[] = [];
  let count = 0;
  const sort = (lo: number, hi: number) => {
    if (hi - lo < 2) return;
    const mid = (lo + hi) >> 1;
    sort(lo, mid);
    sort(mid, hi);
    const left = a.slice(lo, mid);
    const right = a.slice(mid, hi);
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      count++;
      const pair: [number, number] = [lo + i, mid + j];
      a[k++] = left[i] <= right[j] ? left[i++] : right[j++];
      out.push({ arr: a.slice(), pair, count });
    }
    while (i < left.length) a[k++] = left[i++];
    while (j < right.length) a[k++] = right[j++];
    out.push({ arr: a.slice(), pair: [-1, -1], count });
  };
  sort(0, a.length);
  return out;
}

function shuffled(n: number) {
  const a = Array.from({ length: n }, (_, k) => k + 1);
  for (let k = n - 1; k > 0; k--) {
    const r = Math.floor(Math.random() * (k + 1));
    [a[k], a[r]] = [a[r], a[k]];
  }
  return a;
}

const isSorted = (a: number[]) => a.every((v, k) => k === 0 || a[k - 1] <= v);

function Bars({ arr, pair, max, small }: { arr: number[]; pair?: [number, number]; max: number; small?: boolean }) {
  return (
    <div className={`flex items-end gap-0.5 ${small ? "h-28" : "h-40"}`} dir="ltr">
      {arr.map((v, k) => (
        <motion.div
          key={small ? k : v}
          layout={!small}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className={`flex-1 rounded-t ${pair && pair.includes(k) ? "bg-accent" : "bg-line"}`}
          style={{ height: `${(v / max) * 100}%` }}
        >
          {!small && <span className="code block pt-1 text-center text-xs font-bold text-muted">{v}</span>}
        </motion.div>
      ))}
    </div>
  );
}

function Race({ name, frames, tick, max }: { name: string; frames: Frame[]; tick: number; max: number }) {
  const f = frames[Math.min(tick, frames.length - 1)];
  const done = tick >= frames.length - 1;
  return (
    <div className={`rounded-2xl border bg-surface p-3 ${done ? "border-ok" : "border-line"}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="code font-bold">{name}</span>
        <span className="code text-sm">
          <span className="text-num font-bold">{f.count}</span> <span className="text-muted">مقارنة</span>
          {done && <span className="text-ok"> ✓</span>}
        </span>
      </div>
      <Bars arr={f.arr} pair={done ? undefined : f.pair} max={max} small />
    </div>
  );
}

/** Sorting by hand is many neighbour comparisons; then bubble sort and merge sort race on a bigger row. */
export default function SortingProblem() {
  const [row, setRow] = useState(HAND);
  const [count, setCount] = useState(0);
  const [last, setLast] = useState<[number, number] | null>(null);
  const [race, setRace] = useState<{ bubble: Frame[]; merge: Frame[] } | null>(null);
  const [tick, setTick] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const sorted = isSorted(row);

  const compare = (i: number) => {
    if (sorted) return;
    setCount((c) => c + 1);
    setLast([i, i + 1]);
    if (row[i] > row[i + 1]) {
      const next = row.slice();
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      setRow(next);
    }
  };

  const startRace = () => {
    const start = shuffled(RACE_SIZE);
    setRace({ bubble: bubbleFrames(start), merge: mergeFrames(start) });
    setTick(0);
  };

  useEffect(() => {
    if (!race) return;
    const total = Math.max(race.bubble.length, race.merge.length);
    timer.current = setInterval(() => {
      setTick((t) => {
        if (t >= total - 1) {
          if (timer.current) clearInterval(timer.current);
          return t;
        }
        return t + 1;
      });
    }, 25);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [race]);

  const reset = () => {
    setRow(HAND);
    setCount(0);
    setLast(null);
    setRace(null);
    setTick(0);
  };

  if (race) {
    return (
      <div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Race name="bubble sort" frames={race.bubble} tick={tick} max={RACE_SIZE} />
          <Race name="merge sort" frames={race.merge} tick={tick} max={RACE_SIZE} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={startRace}
            className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20"
          >
            سباق جديد
          </motion.button>
          <button onClick={reset} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        </div>
        <p className="mt-3 min-h-12 text-muted">
          {RACE_SIZE} عموداً. الفقاعي يقارن الجيران مرة بعد مرة؛ الدمج يرتب نصفين صغيرين ثم يدمج كومتين مرتبتين.
          ضاعف العدد، وتصير مقارنات الفقاعي أربعة أضعاف تقريباً.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface p-4">
        <Bars arr={row} pair={last ?? undefined} max={Math.max(...HAND)} />
        <div className="mt-2 flex gap-0.5" dir="ltr">
          {row.slice(0, -1).map((_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.85 }}
              disabled={sorted}
              onClick={() => compare(i)}
              className="code flex-1 translate-x-1/2 rounded-lg border border-line py-1 text-sm font-bold hover:border-accent disabled:opacity-30"
              aria-label={`compare ${i} and ${i + 1}`}
            >
              ⇄
            </motion.button>
          ))}
          <div className="flex-1" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="code text-lg">
          <span className="text-num font-bold">{count}</span> <span className="text-sm text-muted">مقارنة</span>
        </div>
        {sorted && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.92 }}
            onClick={startRace}
            className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20"
          >
            شاهد السباق
          </motion.button>
        )}
        {count > 0 && (
          <button onClick={reset} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {!sorted && <p className="text-muted">اضغط ⇄ بين عمودين: إن كان الأيسر أطول تبادلا، وإلا بقيا مكانهما.</p>}
        {sorted && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            مرتبة بعد {count} مقارنة. 6 أعمدة فقط. فماذا عن 32؟
          </motion.p>
        )}
      </div>
    </div>
  );
}
