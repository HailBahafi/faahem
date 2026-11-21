"use client";

import { motion } from "motion/react";
import { useState } from "react";

type Node = { id: string; label: string; mb: number; x: number; y: number; root?: boolean };
type Edge = { id: string; from: string; to: string; code: string };

const NODES: Node[] = [
  { id: "global", label: "global", mb: 0, x: 50, y: 20, root: true },
  { id: "user", label: "user", mb: 1, x: 18, y: 50 },
  { id: "profile", label: "profile", mb: 2, x: 18, y: 82 },
  { id: "avatar", label: "avatar (big)", mb: 40, x: 50, y: 82 },
  { id: "cache", label: "cache", mb: 1, x: 82, y: 50 },
  { id: "listener", label: "onScroll", mb: 1, x: 82, y: 82 },
];

const EDGES: Edge[] = [
  { id: "e1", from: "global", to: "user", code: "user = null" },
  { id: "e2", from: "user", to: "profile", code: "user.profile = null" },
  { id: "e3", from: "profile", to: "avatar", code: "profile.avatar = null" },
  { id: "e4", from: "global", to: "cache", code: "cache = null" },
  { id: "e5", from: "cache", to: "avatar", code: "cache.delete(id)" },
  { id: "e6", from: "global", to: "listener", code: "removeEventListener(...)" },
  { id: "e7", from: "listener", to: "profile", code: "(closure keeps profile)" },
];

const at = (id: string) => NODES.find((n) => n.id === id)!;

function reachable(cut: Set<string>): Set<string> {
  const seen = new Set<string>(["global"]);
  const stack = ["global"];
  while (stack.length) {
    const n = stack.pop()!;
    for (const e of EDGES) if (e.from === n && !cut.has(e.id) && !seen.has(e.to)) {
      seen.add(e.to);
      stack.push(e.to);
    }
  }
  return seen;
}

/** A small heap graph: cut references, run the collector, see what survives and why. */
export default function JsMemoryProblem() {
  const [cut, setCut] = useState<Set<string>>(new Set());
  const [freed, setFreed] = useState<Set<string>>(new Set());
  const [ran, setRan] = useState(false);

  const toggle = (id: string) => {
    if (id === "e7") return;
    const next = new Set(cut);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCut(next);
    setRan(false);
  };

  const collect = () => {
    const live = reachable(cut);
    setFreed(new Set([...freed, ...NODES.filter((n) => !live.has(n.id)).map((n) => n.id)]));
    setRan(true);
  };

  const reset = () => {
    setCut(new Set());
    setFreed(new Set());
    setRan(false);
  };

  const used = NODES.filter((n) => !freed.has(n.id)).reduce((s, n) => s + n.mb, 0);
  const userGone = cut.has("e1");
  const avatarAlive = !freed.has("avatar");

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="relative h-72 rounded-2xl border border-line bg-surface" dir="ltr">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {EDGES.map((e) => {
              const a = at(e.from);
              const b = at(e.to);
              const gone = cut.has(e.id) || freed.has(e.from);
              return (
                <line
                  key={e.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="currentColor"
                  className={gone ? "text-line" : "text-accent"}
                  strokeWidth={0.8}
                  strokeDasharray={gone ? "2 2" : undefined}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
          {NODES.map((n) => (
            <motion.div
              key={n.id}
              animate={{ opacity: freed.has(n.id) ? 0.15 : 1, scale: freed.has(n.id) ? 0.85 : 1 }}
              className={`code absolute -translate-x-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-xs font-bold ${
                n.root ? "bg-accent text-accent-fg" : "border border-line bg-code text-white"
              }`}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              {n.label}
              {n.mb > 0 && <span className="ms-1 text-num">{n.mb}MB</span>}
            </motion.div>
          ))}
        </div>
        <div>
          <div className="text-sm font-semibold">اقطع سهماً:</div>
          <div className="mt-2 flex flex-col gap-1.5" dir="ltr">
            {EDGES.filter((e) => e.id !== "e7").map((e) => (
              <button
                key={e.id}
                onClick={() => toggle(e.id)}
                className={`code rounded-lg border px-3 py-1.5 text-start text-xs ${
                  cut.has(e.id) ? "border-err/60 text-err line-through" : "border-line bg-surface"
                }`}
              >
                {e.code}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.94 }} onClick={collect} className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg">
              شغّل جامع القمامة
            </motion.button>
            <button onClick={reset} className="text-sm text-muted hover:text-fg">
              من جديد
            </button>
          </div>
          <div className="mt-3 text-sm">
            الذاكرة المستعملة: <b className="code text-num">{used}MB</b>
          </div>
        </div>
      </div>
      {ran && userGone && avatarAlive && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          قطعت user، لكن avatar الكبير بقي: <b className="text-fg">ما زال سهم آخر يصل إليه</b> (cache أو المستمع). الجامع لا يسأل «هل انتهيت منه؟» بل «هل يمكن الوصول إليه؟».
        </motion.p>
      )}
      {ran && !avatarAlive && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          تحرّر avatar لأن كل طريق إليه من global انقطع. التسريب في JavaScript هو سهم نسيته.
        </motion.p>
      )}
    </div>
  );
}
