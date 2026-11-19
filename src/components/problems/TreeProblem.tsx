"use client";

import { motion } from "motion/react";
import { useState } from "react";

type Node = { value: number; left: Node | null; right: Node | null };
type Placed = { value: number; x: number; y: number; px: number | null; py: number | null };

const START = [50, 30, 70, 20, 40, 60, 80, 10, 35, 65, 90, 42];
const MAX_NODES = 31;

function build(values: number[]): Node | null {
  let root: Node | null = null;
  for (const v of values) {
    const fresh: Node = { value: v, left: null, right: null };
    if (!root) { root = fresh; continue; }
    let n: Node = root;
    for (;;) {
      if (v < n.value) { if (n.left) n = n.left; else { n.left = fresh; break; } }
      else { if (n.right) n = n.right; else { n.right = fresh; break; } }
    }
  }
  return root;
}

/** x = in-order rank, y = depth, so the drawing keeps smaller values left of bigger ones. */
function place(root: Node | null): Placed[] {
  const out: Placed[] = [];
  let rank = 0;
  const visit = (n: Node | null, depth: number, parent: Placed | null): void => {
    if (!n) return;
    const me: Placed = { value: n.value, x: 0, y: depth, px: parent?.x ?? null, py: parent?.y ?? null };
    visit(n.left, depth + 1, me);
    me.x = rank++;
    out.push(me);
    visit(n.right, depth + 1, me);
  };
  visit(root, 0, null);
  // parents get their x after their left subtree, so read parent positions afterwards
  const byValue = new Map(out.map((p) => [p.value, p]));
  const fix = (n: Node | null, parent: Node | null) => {
    if (!n) return;
    const me = byValue.get(n.value)!;
    if (parent) { const p = byValue.get(parent.value)!; me.px = p.x; me.py = p.y; }
    fix(n.left, n);
    fix(n.right, n);
  };
  fix(root, null);
  return out;
}

function pathTo(root: Node | null, v: number): number[] {
  const path: number[] = [];
  let n = root;
  while (n) {
    path.push(n.value);
    if (v === n.value) break;
    n = v < n.value ? n.left : n.right;
  }
  return path;
}

type Race = { target: number; tree: number; list: number; found: boolean };

/** Insert numbers into a binary search tree and watch each one's path; then race a lookup against a plain list. */
export default function TreeProblem() {
  const [values, setValues] = useState<number[]>(START);
  const [text, setText] = useState("42");
  const [path, setPath] = useState<number[]>([]);
  const [race, setRace] = useState<Race | null>(null);
  const [pulse, setPulse] = useState(0);

  const root = build(values);
  const nodes = place(root);
  const depth = Math.max(0, ...nodes.map((p) => p.y));
  const W = Math.max(nodes.length, 1) * 44 + 20;
  const H = (depth + 1) * 56 + 10;
  const X = (x: number) => 32 + x * 44;
  const Y = (y: number) => 26 + y * 56;

  const num = Number(text);
  const valid = text.trim() !== "" && Number.isInteger(num) && num >= 0 && num <= 999;

  const insert = () => {
    if (!valid || values.includes(num) || values.length >= MAX_NODES) return;
    const next = [...values, num];
    setValues(next);
    setPath(pathTo(build(next), num));
    setRace(null);
    setPulse((p) => p + 1);
  };
  const find = () => {
    if (!valid) return;
    const p = pathTo(root, num);
    const at = values.indexOf(num);
    setPath(p);
    setRace({ target: num, tree: p.length, list: at === -1 ? values.length : at + 1, found: at !== -1 });
    setPulse((q) => q + 1);
  };
  const sorted = () => {
    setValues([10, 20, 30, 40, 50, 60]);
    setPath([]);
    setRace(null);
  };
  const reset = () => {
    setValues(START);
    setPath([]);
    setRace(null);
  };

  const step = (v: number) => path.indexOf(v);

  return (
    <div>
      <div className="code overflow-x-auto rounded-2xl bg-code p-3" dir="ltr">
        <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full" style={{ maxHeight: 360, minWidth: Math.min(W, 520) }}>
          {nodes.map((p) =>
            p.px === null || p.py === null ? null : (
              <line
                key={"e" + p.value}
                x1={X(p.px)}
                y1={Y(p.py)}
                x2={X(p.x)}
                y2={Y(p.y)}
                className={step(p.value) > 0 ? "stroke-accent" : "stroke-line"}
                strokeWidth={step(p.value) > 0 ? 3 : 1.5}
              />
            ),
          )}
          {nodes.map((p) => {
            const k = step(p.value);
            const end = k === path.length - 1 && k >= 0;
            return (
              <motion.g key={p.value} initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: `${X(p.x)}px ${Y(p.y)}px` }}>
                <motion.circle
                  key={`${p.value}-${pulse}`}
                  cx={X(p.x)}
                  cy={Y(p.y)}
                  r={17}
                  initial={false}
                  animate={k >= 0 ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                  transition={{ delay: k * 0.35, duration: 0.35 }}
                  style={{ transformOrigin: `${X(p.x)}px ${Y(p.y)}px` }}
                  className={k >= 0 ? (end ? "fill-accent stroke-accent" : "fill-accent-soft stroke-accent") : "fill-surface stroke-line"}
                  strokeWidth={2}
                />
                <text x={X(p.x)} y={Y(p.y) + 4} textAnchor="middle" fontSize={12} fontWeight={700} className={end ? "fill-accent-fg" : "fill-num"}>
                  {p.value}
                </text>
              </motion.g>
            );
          })}
        </svg>
        <div className="mt-2 flex flex-wrap gap-1 text-xs">
          <span className="text-muted">list:</span>
          {values.map((v, i) => (
            <span key={v} className={`rounded px-1 ${race && i < race.list ? "bg-err/20 text-err" : "text-muted"}`}>
              {v}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && insert()}
          inputMode="numeric"
          dir="ltr"
          maxLength={3}
          className="code w-24 rounded-2xl border border-line bg-surface px-4 py-3 text-center"
        />
        <motion.button whileTap={{ scale: 0.92 }} onClick={insert} className="rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20">
          أدخل
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={find} className="rounded-2xl border border-line px-5 py-3 font-bold">
          ابحث
        </motion.button>
        <button onClick={sorted} className="text-sm text-muted hover:text-fg">
          أرقام مرتّبة
        </button>
        <button onClick={reset} className="text-sm text-muted hover:text-fg">
          ابدأ من جديد
        </button>
      </div>

      <div className="mt-3 min-h-16">
        {!race && path.length === 0 && <p className="text-muted">اضغط «ابحث» لتجد 42، أو اكتب رقماً جديداً واضغط «أدخل».</p>}
        {!race && path.length > 0 && (
          <motion.p key={pulse} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="code text-muted" dir="ltr">
            {path.join(" → ")}
          </motion.p>
        )}
        {race && (
          <motion.div key={pulse} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-accent p-3">
              <div className="text-sm text-muted">الشجرة: أصغر يساراً، أكبر يميناً</div>
              <div className="text-2xl font-bold text-ok">{race.tree} <span className="text-base font-normal">مقارنة</span></div>
            </div>
            <div className="rounded-xl border border-line p-3">
              <div className="text-sm text-muted">القائمة: رقماً رقماً</div>
              <div className="text-2xl font-bold text-err">{race.list} <span className="text-base font-normal">مقارنة</span></div>
            </div>
            {!race.found && <p className="text-muted sm:col-span-2">{race.target} غير موجود. الشجرة عرفت ذلك حين وصلت إلى مكان فارغ.</p>}
          </motion.div>
        )}
      </div>
    </div>
  );
}
