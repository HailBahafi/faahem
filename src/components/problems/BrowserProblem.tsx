"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const SOURCE = [
  "<html>",
  "  <body>",
  "    <h1>Shop</h1>",
  '    <p class="note">Open <b>now</b></p>',
  "    <button>Buy</button>",
  "  </body>",
  "</html>",
];

interface Node { id: string; tag: string; depth: number; text?: string; color?: string; line: number }
const NODES: Node[] = [
  { id: "html", tag: "html", depth: 0, line: 0 },
  { id: "body", tag: "body", depth: 1, line: 1 },
  { id: "h1", tag: "h1", depth: 2, text: "Shop", color: "#14b8a6", line: 2 },
  { id: "p", tag: "p", depth: 2, text: "Open", color: "#9ca3af", line: 3 },
  { id: "b", tag: "b", depth: 3, text: "now", color: "#9ca3af", line: 3 },
  { id: "button", tag: "button", depth: 2, text: "Buy", color: "#e5e7eb", line: 4 },
];

const STAGES = ["تنزيل", "تحليل → DOM", "الأنماط", "التخطيط", "الرسم"];
const SHORT = "Shop";
const LONG = "Big Summer Sale on everything!";

/** One press = one step of the pipeline. Steps 1-6 parse one tag each; then style, layout, paint. */
const STEPS = 10; // 0 text, 1-6 parse, 7 style, 8 layout, 9 paint

function stageOf(step: number) {
  if (step === 0) return 0;
  if (step <= 6) return 1;
  return step - 5; // 7 → 2, 8 → 3, 9 → 4
}

function say(step: number, jsRan: boolean) {
  if (jsRan) return "JavaScript غيّر نص h1 في الشجرة، فتغيّر ارتفاع صندوقه. أعاد المتصفح الأنماط ثم التخطيط (تحرّك كل ما تحته) ثم الرسم.";
  switch (step) {
    case 0: return "وصل جسم ردّ HTTP: حروف فقط. الشاشة لا تعرف ما معنى <h1>.";
    case 7: return "الأنماط: طابق المتصفح قواعد CSS مع العقد. h1 أخضر مزرق، p رمادي، و b ورث لون أبيه.";
    case 8: return "التخطيط: لكل صندوق عرض وارتفاع ومكان. الصناديق تُرصّ تحت بعضها، كل واحد بعد ما فوقه.";
    case 9: return "الرسم: تلوين البكسلات صندوقاً صندوقاً. الآن فقط ظهرت الصفحة.";
    default: {
      const n = NODES[step - 1];
      return `المحلّل قرأ <${n.tag}> فصنع عقدة ${n.depth === 0 ? "هي جذر الشجرة" : `ابنة لـ ${parentOf(n).tag}`}.`;
    }
  }
}

function parentOf(n: Node) {
  const k = NODES.indexOf(n);
  for (let i = k - 1; i >= 0; i--) if (NODES[i].depth === n.depth - 1) return NODES[i];
  return NODES[0];
}

export default function BrowserProblem() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(SHORT);
  const [jsRan, setJsRan] = useState(false);
  const stage = stageOf(step);
  const built = NODES.slice(0, Math.min(step, 6));
  const styled = step >= 7;
  const laid = step >= 8;
  const painted = step >= 9;
  const line = step >= 1 && step <= 6 ? NODES[step - 1].line : -1;

  // Layout: block boxes stacked in a 220px-wide body. A long h1 wraps to two lines.
  const h1H = title === LONG ? 56 : 30;
  const boxes = [
    { id: "h1", y: 0, h: h1H },
    { id: "p", y: h1H + 10, h: 22 },
    { id: "button", y: h1H + 42, h: 30 },
  ];

  function next() { setJsRan(false); setStep((s) => Math.min(s + 1, STEPS - 1)); }
  function reset() { setStep(0); setTitle(SHORT); setJsRan(false); }
  function runJs() {
    setTitle((t) => (t === SHORT ? LONG : SHORT));
    setJsRan(true);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STAGES.map((s, k) => (
          <motion.div key={s} animate={{ scale: k === stage ? 1.06 : 1 }} className={`rounded-xl border px-3 py-1.5 text-sm ${k === stage ? "border-accent bg-accent font-bold text-accent-fg" : k < stage ? "border-accent/40 bg-accent-soft/20" : "border-line bg-surface text-muted"}`}>
            {k + 1}. {s}
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3" dir="ltr">
        {/* Source text */}
        <div className="rounded-2xl bg-code p-3">
          <div dir="rtl" className="mb-2 text-xs text-code-fg/60">نص HTML</div>
          <pre className="code text-xs leading-6 text-code-fg">
            {SOURCE.map((l, k) => (
              <div key={k} className={k === line ? "rounded bg-[var(--accent)]/25 font-bold text-[var(--accent)]" : line !== -1 && k > line ? "opacity-50" : ""}>
                {k === 2 ? l.replace(SHORT, title === LONG ? "Big Summer Sale…" : SHORT) : l}
              </div>
            ))}
          </pre>
        </div>

        {/* DOM tree */}
        <div className="rounded-2xl border border-line bg-surface p-3">
          <div dir="rtl" className="mb-2 text-xs text-muted">شجرة DOM</div>
          <div className="space-y-1">
            <AnimatePresence>
              {built.map((n) => (
                <motion.div key={n.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} style={{ marginLeft: n.depth * 18 }} className="flex items-center gap-2">
                  {n.depth > 0 && <span className="text-muted">└</span>}
                  <span className={`code rounded-md border px-2 py-0.5 text-xs font-bold ${jsRan && n.id === "h1" ? "border-accent ring-2 ring-accent/50" : "border-line"} bg-surface-2`}>
                    {n.tag}
                  </span>
                  {n.text && <span className="code truncate text-xs text-str">&quot;{n.id === "h1" ? title : n.text}&quot;</span>}
                  {styled && n.color && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-3 w-3 shrink-0 rounded-full border border-line" style={{ background: n.color }} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {!built.length && <div dir="rtl" className="text-sm text-muted">لا شجرة بعد</div>}
          </div>
        </div>

        {/* Viewport */}
        <div className="rounded-2xl border border-line bg-surface p-3">
          <div dir="rtl" className="mb-2 text-xs text-muted">الشاشة</div>
          <div className="relative h-44 overflow-hidden rounded-xl border border-line bg-[#0f172a]">
            {laid && (
              <div className="absolute inset-x-4 top-4">
                {boxes.map((b) => {
                  const n = NODES.find((x) => x.id === b.id)!;
                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, top: b.y, height: b.h }}
                      transition={{ type: "spring", stiffness: 200, damping: 24 }}
                      className={`absolute inset-x-0 overflow-hidden rounded ${painted ? "" : "border border-dashed border-[var(--accent)]"}`}
                    >
                      {!painted && <span className="absolute right-1 top-0 text-[10px] text-[var(--accent)]">{b.id} · y={b.y} h={b.h}</span>}
                      {painted && b.id === "h1" && <div className="text-lg font-bold leading-7" style={{ color: n.color }}>{title}</div>}
                      {painted && b.id === "p" && <div className="text-sm" style={{ color: n.color }}>Open <b>now</b></div>}
                      {painted && b.id === "button" && <div className="inline-block rounded-md bg-[#e5e7eb] px-3 py-1 text-sm text-[#111827]">Buy</div>}
                    </motion.div>
                  );
                })}
              </div>
            )}
            {!laid && <div dir="rtl" className="flex h-full items-center justify-center text-sm text-white/40">{step >= 7 ? "لا مكان لأي صندوق بعد" : "شاشة فارغة"}</div>}
          </div>
        </div>
      </div>

      <div className="mt-3 min-h-[3rem] text-sm">
        <AnimatePresence mode="wait">
          <motion.p key={step + String(jsRan) + title} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {say(step, jsRan)}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={next} disabled={step >= STEPS - 1} className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40">
          الخطوة التالية
        </motion.button>
        {painted && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.92 }} onClick={runJs} className="code rounded-2xl border border-accent bg-surface px-4 py-3 text-sm font-semibold" dir="ltr">
            h1.textContent = &quot;{title === SHORT ? "Big Summer Sale…" : SHORT}&quot;
          </motion.button>
        )}
        <button onClick={reset} className="text-sm text-muted hover:text-fg">ابدأ من جديد</button>
      </div>

      {painted && jsRan && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          لاحظت؟ لم يُحمَّل شيء من جديد. تغيّرت <b className="text-fg">عقدة في الشجرة</b>، فأعاد المتصفح ما بعدها من المحطات، ونزل الزر لأن مكانه يُحسب مما فوقه.
        </motion.p>
      )}
    </div>
  );
}
