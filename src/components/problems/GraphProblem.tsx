"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Mode = "bfs" | "dfs";

const PLACES: { id: string; label: string; x: number; y: number }[] = [
  { id: "home", label: "البيت", x: 50, y: 60 },
  { id: "mosque", label: "المسجد", x: 160, y: 30 },
  { id: "park", label: "الحديقة", x: 60, y: 170 },
  { id: "market", label: "السوق", x: 270, y: 50 },
  { id: "school", label: "المدرسة", x: 170, y: 130 },
  { id: "clinic", label: "المستوصف", x: 170, y: 225 },
  { id: "library", label: "المكتبة", x: 310, y: 150 },
  { id: "stadium", label: "الملعب", x: 300, y: 235 },
];

const ROADS: [string, string][] = [
  ["home", "mosque"],
  ["home", "park"],
  ["mosque", "market"],
  ["mosque", "school"],
  ["park", "school"],
  ["park", "clinic"],
  ["market", "library"],
  ["school", "library"],
  ["clinic", "stadium"],
  ["library", "stadium"],
];

// Adjacency list built from the roads: each place maps to its neighbours.
const GRAPH: Record<string, string[]> = {};
for (const p of PLACES) GRAPH[p.id] = [];
for (const [a, b] of ROADS) {
  GRAPH[a].push(b);
  GRAPH[b].push(a);
}
const pos = (id: string) => PLACES.find((p) => p.id === id)!;
const name = (id: string) => pos(id).label;

const RING = ["var(--accent)", "var(--num)", "var(--str)", "var(--bool)", "var(--ok)", "var(--err)"];
const ringColor = (d: number) => RING[Math.min(d, RING.length - 1)];

/** A city map: pick a start, then watch BFS spread ring by ring with its queue (or DFS dive with a stack). */
export default function GraphProblem() {
  const [mode, setMode] = useState<Mode>("bfs");
  const [start, setStart] = useState("home");
  const [dist, setDist] = useState<Record<string, number>>({ home: 0 });
  const [line, setLine] = useState<string[]>(["home"]);
  const [current, setCurrent] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [auto, setAuto] = useState(false);
  const finished = line.length === 0;

  const reset = (s: string, m: Mode = mode) => {
    setMode(m);
    setStart(s);
    setDist({ [s]: 0 });
    setLine([s]);
    setCurrent(null);
    setDone([]);
    setAuto(false);
  };

  const step = () => {
    if (finished) return;
    const rest = [...line];
    const node = mode === "bfs" ? rest.shift()! : rest.pop()!; // queue: take the oldest; stack: take the newest
    const d = { ...dist };
    for (const nb of GRAPH[node]) {
      if (d[nb] === undefined) {
        d[nb] = d[node] + 1;
        rest.push(nb);
      }
    }
    setCurrent(node);
    setDone((x) => [...x, node]);
    setDist(d);
    setLine(rest);
  };

  useEffect(() => {
    if (!auto) return;
    if (finished) return setAuto(false);
    const t = setTimeout(step, 700);
    return () => clearTimeout(t);
  });

  const shown = mode === "bfs" ? line : [...line].reverse();

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["bfs", "dfs"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => reset(start, m)}
            className={`rounded-xl border px-3 py-1.5 text-sm font-bold ${mode === m ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"}`}
          >
            {m === "bfs" ? "بالعرض: طابور" : "بالعمق: مكدّس"}
          </button>
        ))}
        <span className="text-sm text-muted">اضغط مكاناً لتبدأ منه.</span>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <svg viewBox="0 0 360 260" className="w-full rounded-2xl bg-code">
          {ROADS.map(([a, b]) => {
            const A = pos(a), B = pos(b);
            const lit = dist[a] !== undefined && dist[b] !== undefined;
            return (
              <line
                key={a + b}
                x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                stroke={lit ? "var(--muted)" : "var(--border)"}
                strokeWidth={lit ? 3 : 2}
              />
            );
          })}
          {PLACES.map((p) => {
            const d = dist[p.id];
            const seen = d !== undefined;
            const waiting = line.includes(p.id);
            const isCur = current === p.id;
            return (
              <g key={p.id} onClick={() => reset(p.id)} className="cursor-pointer">
                {waiting && (
                  <motion.circle
                    cx={p.x} cy={p.y} r={22}
                    fill="none" stroke={ringColor(d)} strokeWidth={2}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: [1, 1.25, 1], opacity: 1 }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                  />
                )}
                <motion.circle
                  cx={p.x} cy={p.y}
                  animate={{ r: isCur ? 19 : 16 }}
                  fill={seen ? ringColor(d) : "var(--surface)"}
                  stroke={isCur ? "var(--fg)" : "var(--border)"}
                  strokeWidth={isCur ? 3 : 1.5}
                />
                <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={seen ? "var(--bg)" : "var(--muted)"}>
                  {seen ? d : ""}
                </text>
                <text x={p.x} y={p.y + 34} textAnchor="middle" fontSize={12} fill="var(--fg)">
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex min-w-44 flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm text-muted">{mode === "bfs" ? "الطابور (يخرج من الأعلى)" : "المكدّس (يخرج من الأعلى)"}</div>
          <div className="flex min-h-40 flex-col gap-1.5">
            <AnimatePresence initial={false}>
              {shown.map((id) => (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="rounded-lg border border-line px-2 py-1 text-sm font-bold"
                  style={{ color: ringColor(dist[id]) }}
                >
                  {name(id)} · {dist[id]}
                </motion.div>
              ))}
            </AnimatePresence>
            {finished && <div className="text-sm text-muted">فارغ</div>}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={finished || auto}
          onClick={step}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          خطوة
        </motion.button>
        <button
          disabled={finished || auto}
          onClick={() => setAuto(true)}
          className="rounded-2xl border border-accent px-4 py-3 font-bold disabled:opacity-40"
        >
          شغّل حتى النهاية
        </button>
        {done.length > 0 && (
          <button onClick={() => reset(start)} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {done.length === 0 && (
          <p className="text-muted">الرقم على كل مكان: كم طريقاً قطعنا للوصول إليه من {name(start)}.</p>
        )}
        {done.length > 0 && !finished && current && (
          <p className="text-muted">
            أخذنا <b className="text-fg">{name(current)}</b> من {mode === "bfs" ? "أول الطابور" : "أعلى المكدّس"}، وأضفنا جيرانه الذين لم نرهم بعد.
          </p>
        )}
        {finished && mode === "bfs" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            انتشر البحث حلقة بعد حلقة، فكل رقم هو أقل عدد طرق ممكن. جرّب الآن المكدّس وقارن الأرقام.
          </motion.p>
        )}
        {finished && mode === "dfs" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            المكدّس غاص في طريق واحد إلى آخره، فبعض الأرقام أكبر من أقصر طريق. وصل كل مكان، لكن ليس بأقصر طريق.
          </motion.p>
        )}
      </div>
    </div>
  );
}
