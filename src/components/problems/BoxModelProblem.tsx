"use client";

import { motion } from "motion/react";
import { useState } from "react";

type Rule = { sel: string; color: string };
type Puzzle = { rules: Rule[]; win: number; why: string };

/** Every puzzle targets <p class="note" id="tip">. */
const PUZZLES: Puzzle[] = [
  { rules: [{ sel: "p", color: "gray" }, { sel: ".note", color: "green" }, { sel: "p", color: "red" }], win: 1, why: "الكلاس أدق من الوسم، فيفوز رغم أن p جاءت بعده." },
  { rules: [{ sel: ".note", color: "green" }, { sel: ".note", color: "royalblue" }], win: 1, why: "دقة متساوية، فيُحكم بالترتيب: الأخيرة تفوز." },
  { rules: [{ sel: "#tip", color: "purple" }, { sel: "p.note", color: "red" }, { sel: ".note", color: "green" }], win: 0, why: "id أدق من أي وسم وكلاس، فيفوز وهو الأول." },
];

const LAYERS = [
  { key: "m", label: "margin", cls: "text-bool" },
  { key: "b", label: "border", cls: "text-num" },
  { key: "p", label: "padding", cls: "text-ok" },
  { key: "w", label: "width", cls: "text-accent" },
] as const;

/** Sliders grow each of the four layers; the total width shows why width: 200px is rarely 200 on screen. */
export default function BoxModelProblem() {
  const [v, setV] = useState({ w: 120, p: 20, b: 6, m: 16 });
  const [borderBox, setBorderBox] = useState(false);
  const [q, setQ] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const visible = borderBox ? v.w : v.w + 2 * v.p + 2 * v.b;
  const content = borderBox ? Math.max(0, v.w - 2 * v.p - 2 * v.b) : v.w;
  const total = visible + 2 * v.m;
  const max = { w: 160, p: 30, b: 12, m: 30 };
  const pz = PUZZLES[q];

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          {LAYERS.map((l) => (
            <label key={l.key} className="flex items-center gap-3 text-sm">
              <span className={`code w-16 ${l.cls}`} dir="ltr">{l.label}</span>
              <input
                type="range"
                min={l.key === "w" ? 40 : 0}
                max={max[l.key]}
                value={v[l.key]}
                onChange={(e) => setV({ ...v, [l.key]: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="code w-12 text-end" dir="ltr">{v[l.key]}px</span>
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={borderBox} onChange={(e) => setBorderBox(e.target.checked)} />
            <span className="code" dir="ltr">box-sizing: border-box</span>
          </label>
          <div className="code rounded-xl bg-code p-3 text-sm leading-7" dir="ltr">
            <div>
              <span className="text-muted">visible = </span>
              {borderBox ? (
                <span className="text-accent">{v.w}</span>
              ) : (
                <>
                  <span className="text-accent">{v.w}</span> + <span className="text-ok">2×{v.p}</span> + <span className="text-num">2×{v.b}</span>
                </>
              )}
              <span> = </span>
              <b className={visible !== v.w ? "text-err" : "text-ok"}>{visible}px</b>
            </div>
            <div>
              <span className="text-muted">content = </span>
              <span className="text-accent">{content}px</span>
            </div>
            <div>
              <span className="text-muted">occupies = </span>
              {visible} + <span className="text-bool">2×{v.m}</span> = <b>{total}px</b>
            </div>
          </div>
        </div>

        <div className="grid place-items-center overflow-x-auto rounded-2xl bg-code p-4" dir="ltr">
          {/* margin layer: drawn dashed, it is transparent space in a real page */}
          <motion.div layout className="rounded-md border border-dashed border-bool bg-bool/10" style={{ padding: v.m }}>
            <motion.div layout style={{ border: `${v.b}px solid var(--num)` }}>
              <motion.div layout className="bg-ok/25" style={{ padding: v.p }}>
                <motion.div
                  layout
                  className="code grid h-12 place-items-center overflow-hidden bg-accent/30 text-xs"
                  style={{ width: content }}
                >
                  {content >= 50 ? "content" : ""}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-bold">لغز: بأي لون تظهر الفقرة؟</span>
          <span className="text-xs text-muted">{q + 1} / {PUZZLES.length}</span>
        </div>
        <div className="code rounded-xl bg-code p-3 text-sm leading-7" dir="ltr">
          <div className="text-muted">{'<p class="note" id="tip">Hello</p>'}</div>
          {pz.rules.map((r, i) => (
            <div key={i} className={picked !== null && i === pz.win ? "font-bold text-ok" : ""}>
              {r.sel} {"{"} color: {r.color}; {"}"}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {pz.rules.map((r, i) =>
            pz.rules.findIndex((x) => x.color === r.color) === i ? (
              <motion.button
                key={i}
                whileTap={{ scale: 0.92 }}
                disabled={picked !== null}
                onClick={() => setPicked(i)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${picked === i ? (i === pz.win ? "border-ok" : "border-err") : "border-line"}`}
              >
                <span className="h-4 w-4 rounded-full" style={{ background: r.color }} />
                <span className="code" dir="ltr">{r.color}</span>
              </motion.button>
            ) : null,
          )}
        </div>
        {picked !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <p className="text-lg font-bold" style={{ color: pz.rules[pz.win].color }} dir="ltr">Hello</p>
            <p className={picked === pz.win ? "text-ok" : "text-err"}>
              {picked === pz.win ? "صحيح. " : "ليس هذا. "}
              {pz.why}
            </p>
            {q < PUZZLES.length - 1 && (
              <button onClick={() => { setQ(q + 1); setPicked(null); }} className="mt-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg">
                اللغز التالي
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
