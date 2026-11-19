"use client";

import { motion } from "motion/react";
import { useState } from "react";

type Id = "n10" | "n20" | "n30" | "n40" | "n50";
type Node = { id: Id; value: number; x: number; y: number };

const W = 96;
const H = 44;
const NODES: Node[] = [
  { id: "n10", value: 10, x: 100, y: 24 },
  { id: "n30", value: 30, x: 290, y: 196 },
  { id: "n40", value: 40, x: 470, y: 30 },
  { id: "n50", value: 50, x: 520, y: 200 },
  { id: "n20", value: 20, x: 250, y: 64 },
];
const START: Record<Id, Id | null> = { n10: "n30", n30: "n40", n40: "n50", n50: null, n20: null };
const HEAD = { x: 8, y: 110, w: 60 };
const GOAL = "10,20,30,40,50";

const byId = (id: Id) => NODES.find((n) => n.id === id)!;

/** Where the segment from p toward the centre of rect r crosses r's border. */
function edge(px: number, py: number, r: Node) {
  const cx = r.x + W / 2;
  const cy = r.y + H / 2;
  const dx = px - cx;
  const dy = py - cy;
  const s = Math.min(dx ? W / 2 / Math.abs(dx) : Infinity, dy ? H / 2 / Math.abs(dy) : Infinity);
  return { x: cx + dx * s, y: cy + dy * s };
}

function walk(next: Record<Id, Id | null>) {
  const seen: Id[] = [];
  let cur: Id | null = "n10";
  while (cur && !seen.includes(cur)) {
    seen.push(cur);
    cur = next[cur];
  }
  return { seen, loop: cur !== null };
}

/** Scattered nodes joined by arrows: insert 20 by rewiring two arrows, no node moves. */
export default function LinkedListProblem() {
  const [next, setNext] = useState(START);
  const [picked, setPicked] = useState<Id | null>(null);
  const [changes, setChanges] = useState(0);

  const { seen, loop } = walk(next);
  const values = seen.map((id) => byId(id).value).join(",");
  const done = values === GOAL && !loop;
  const lost = NODES.filter((n) => n.id !== "n20" && !seen.includes(n.id));

  const pointTo = (target: Id | null) => {
    if (!picked) return;
    if (next[picked] !== target) {
      setNext({ ...next, [picked]: target });
      setChanges((c) => c + 1);
    }
    setPicked(null);
  };

  const reset = () => {
    setNext(START);
    setPicked(null);
    setChanges(0);
  };

  return (
    <div>
      <div dir="ltr">
      <svg viewBox="0 0 640 270" className="w-full rounded-2xl bg-code">
        <defs>
          <marker id="ll-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
          </marker>
        </defs>

        <g className="text-accent">
          <rect x={HEAD.x} y={HEAD.y} width={HEAD.w} height={H} rx={8} className="fill-surface stroke-current" strokeWidth={2} />
          <text x={HEAD.x + HEAD.w / 2} y={HEAD.y + 27} textAnchor="middle" className="code fill-current text-sm font-bold">
            head
          </text>
          {(() => {
            const e = edge(HEAD.x + HEAD.w, HEAD.y + H / 2, byId("n10"));
            return <line x1={HEAD.x + HEAD.w} y1={HEAD.y + H / 2} x2={e.x} y2={e.y} stroke="currentColor" strokeWidth={2} markerEnd="url(#ll-arrow)" />;
          })()}
        </g>

        {NODES.map((n) => {
          const t = next[n.id];
          if (!t) return null;
          const sx = n.x + W - 18;
          const sy = n.y + H / 2;
          const e = edge(sx, sy, byId(t));
          const bad = lost.some((l) => l.id === n.id);
          return (
            <motion.line
              key={`${n.id}-${t}`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              x1={sx}
              y1={sy}
              x2={e.x}
              y2={e.y}
              strokeWidth={2}
              markerEnd="url(#ll-arrow)"
              className={bad ? "text-err" : "text-accent"}
              stroke="currentColor"
            />
          );
        })}

        {NODES.map((n) => {
          const isLost = lost.some((l) => l.id === n.id);
          const isNew = n.id === "n20";
          const target = picked !== null && picked !== n.id;
          return (
            <g key={n.id}>
              {isNew && (
                <text x={n.x + W / 2} y={n.y - 8} textAnchor="middle" className="fill-current text-xs text-muted">
                  عقدة جديدة
                </text>
              )}
              <rect
                x={n.x}
                y={n.y}
                width={W}
                height={H}
                rx={8}
                onClick={() => target && pointTo(n.id)}
                className={`fill-surface ${isLost ? "stroke-err" : target ? "stroke-accent" : "stroke-line"} ${target ? "cursor-pointer" : ""}`}
                strokeWidth={target ? 3 : 2}
                strokeDasharray={isNew && !seen.includes(n.id) ? "5 4" : undefined}
              />
              <text
                x={n.x + 30}
                y={n.y + 28}
                textAnchor="middle"
                onClick={() => target && pointTo(n.id)}
                className={`code text-base font-bold ${isLost ? "fill-err" : "fill-num"} ${target ? "cursor-pointer" : ""}`}
              >
                {n.value}
              </text>
              <g onClick={() => setPicked(picked === n.id ? null : n.id)} className="cursor-pointer">
                <rect
                  x={n.x + W - 36}
                  y={n.y + 4}
                  width={32}
                  height={H - 8}
                  rx={6}
                  className={picked === n.id ? "fill-accent" : "fill-code"}
                />
                <text x={n.x + W - 20} y={n.y + 27} textAnchor="middle" className={`code text-xs ${picked === n.id ? "fill-accent-fg" : "fill-muted"}`}>
                  {next[n.id] ? "●" : "∅"}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {picked && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => pointTo(null)}
            className="code rounded-2xl border border-line px-4 py-2 font-bold"
          >
            next = null
          </motion.button>
        )}
        <div className="rounded-2xl bg-surface px-4 py-2 text-center">
          <div className="text-xs text-muted">أسهم غيّرتها</div>
          <motion.div key={changes} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="code text-xl font-bold text-num">
            {changes}
          </motion.div>
        </div>
        <div className="code rounded-2xl bg-surface px-4 py-2 text-sm" dir="ltr">
          head → {seen.map((id) => byId(id).value).join(" → ")}
          {loop ? " → ↺" : " → null"}
        </div>
        {changes > 0 && (
          <button onClick={reset} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {!picked && !done && lost.length === 0 && !loop && (
          <p className="text-muted">اضغط مربّع السهم في عقدة، ثم اضغط العقدة التي تريد أن يشير إليها.</p>
        )}
        {picked && <p className="text-muted">إلى أين يشير سهم {byId(picked).value}؟ اضغط عقدة.</p>}
        {!picked && lost.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            ضاعت {lost.map((l) => l.value).join(" و ")}: لا سهم من head يصل إليها. في البرنامج الحقيقي لن تجدها بعد الآن. اربط الجديدة أولاً.
          </motion.p>
        )}
        {!picked && loop && lost.length === 0 && (
          <p className="text-err">السلسلة تدور على نفسها ولا تصل إلى null.</p>
        )}
        {done && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            {changes} أسهم فقط، ولم تتحرك أي عقدة من مكانها. في مصفوفة [10, 30, 40, 50] كانت 3 خانات ستتحرك لتفسح مكاناً لـ 20، وكلما طال الصف زادت.
          </motion.p>
        )}
      </div>
    </div>
  );
}
