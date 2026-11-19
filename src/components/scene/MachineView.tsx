"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useLayoutEffect, useRef, useState } from "react";
import type { HeapObj, Slot, Step } from "@/lib/types";
import { Lock } from "../icons";
import { TYPE_INFO } from "./MemoryView";

const slotColor = (s: Slot) =>
  s.type === "ref" ? "var(--accent)" : s.type === "function" ? "#a78bfa" : TYPE_INFO[s.type].color;

interface Arrow {
  key: string;
  d: string;
  hot: boolean;
}

/**
 * The machine as it really is: a call stack of frames (newest on top) and a heap
 * of arrays/objects, with an arrow from every reference to what it points at.
 */
export default function MachineView({ step }: { step: Step }) {
  const box = useRef<HTMLDivElement>(null);
  const markerId = useId().replace(/:/g, "");
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const frames = [...(step.frames ?? [])].reverse();
  const heap = step.heap ?? [];
  const changed = new Set(step.changed);
  const read = new Set(step.read);
  const changedHeap = new Set(step.changedHeap);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    let raf = 0;
    const until = performance.now() + 800;
    const measure = () => {
      const base = el.getBoundingClientRect();
      const out: Arrow[] = [];
      el.querySelectorAll<HTMLElement>("[data-ref]").forEach((src) => {
        const target = el.querySelector<HTMLElement>(`[data-heap="${src.dataset.ref}"]`);
        if (!target) return;
        const a = src.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        const x1 = a.left + a.width / 2 - base.left;
        const y1 = a.top + a.height / 2 - base.top;
        let d: string;
        const below = b.top > a.bottom + 8 && a.left + a.width / 2 > b.left - 40 && a.left + a.width / 2 < b.right + 40;
        if (below) {
          // Stacked layout (phones): enter the object from its top edge.
          const x2 = Math.min(Math.max(x1, b.left + 16), b.right - 16) - base.left;
          const y2 = b.top - base.top - 2;
          const my = (y1 + y2) / 2;
          d = `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
        } else {
          const toLeft = b.left + b.width / 2 < a.left;
          const x2 = (toLeft ? b.right + 2 : b.left - 2) - base.left;
          const y2 = Math.min(Math.max(y1 + base.top, b.top + 14), b.bottom - 14) - base.top;
          const dx = (x2 - x1) * 0.5;
          d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
        }
        out.push({ key: src.dataset.key!, d, hot: src.dataset.hot === "1" });
      });
      setArrows(out);
      if (performance.now() < until) raf = requestAnimationFrame(measure);
    };
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [step]);

  return (
    <div ref={box} className="relative">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stack */}
        <div>
          <ColumnTitle title="المكدّس" en="Stack" note="كل استدعاء دالة إطار جديد" />
          <div className="flex flex-col gap-2.5">
            <AnimatePresence initial={false} mode="popLayout">
              {frames.map((f, k) => {
                const top = k === 0;
                return (
                  <motion.div
                    key={f.id}
                    layout
                    initial={{ opacity: 0, y: -26, scale: 0.95 }}
                    animate={{ opacity: top ? 1 : 0.62, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className={`rounded-xl border bg-surface p-2.5 ${top ? "border-accent shadow-lg shadow-accent/10" : "border-line"}`}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="code text-sm font-bold">{f.name}{k < frames.length - 1 ? "()" : ""}</span>
                      {top && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-fg">يعمل الآن</span>}
                    </div>
                    {f.vars.length === 0 && <div className="py-1 text-xs text-muted">لا متغيرات بعد</div>}
                    <div className="space-y-1">
                      {f.vars.map((v) => (
                        <VarRow
                          key={v.name}
                          slot={v}
                          dataKey={`f${f.id}:${v.name}`}
                          hot={top && changed.has(v.name)}
                          reading={top && read.has(v.name)}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Heap */}
        <div>
          <ColumnTitle title="الكومة" en="Heap" note="المصفوفات والكائنات تعيش هنا" />
          {heap.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-muted">
              فارغة الآن. عندما تُنشئ مصفوفة أو كائناً سيظهر هنا، ويشير إليه المتغير بسهم.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {heap.map((h) => (
                  <HeapCard key={h.id} obj={h} hot={changedHeap.has(h.id)} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible">
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
          </marker>
        </defs>
        {arrows.map((a) => (
          <motion.path
            key={a.key}
            d={a.d}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={a.hot ? 2.6 : 1.8}
            strokeOpacity={a.hot ? 1 : 0.75}
            markerEnd={`url(#${markerId})`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </svg>

      <AnimatePresence>
        {step.error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, x: [0, -8, 8, -4, 4, 0] }}
            className="mt-4 rounded-lg border border-err/40 bg-err/10 px-3 py-2 text-sm font-medium text-err"
          >
            ✕ {step.error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ColumnTitle({ title, en, note }: { title: string; en: string; note: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <span className="text-sm font-bold">
        {title} <span className="code text-xs font-normal text-muted">{en}</span>
      </span>
      <span className="hidden truncate text-[11px] text-muted xl:inline">{note}</span>
    </div>
  );
}

function Value({ slot, dataKey, hot }: { slot: Slot; dataKey: string; hot: boolean }) {
  if (slot.type === "ref") {
    return (
      <span className="flex items-center gap-1 text-[11px] text-muted">
        مرجع
        <span
          data-ref={slot.ref}
          data-key={dataKey}
          data-hot={hot ? "1" : "0"}
          className="inline-block h-3 w-3 rounded-full border-2 border-accent bg-accent/30"
        />
      </span>
    );
  }
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={slot.value}
        initial={{ y: -14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 14, opacity: 0 }}
        className="code text-sm font-bold"
        style={{ color: slotColor(slot) }}
      >
        {slot.value}
      </motion.span>
    </AnimatePresence>
  );
}

function VarRow({ slot, dataKey, hot, reading }: { slot: Slot; dataKey: string; hot: boolean; reading: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{
        opacity: 1,
        x: 0,
        backgroundColor: hot ? "var(--accent-soft)" : "rgba(0,0,0,0)",
        boxShadow: reading ? "inset 0 0 0 1.5px var(--num)" : "inset 0 0 0 0px transparent",
      }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between gap-3 overflow-hidden rounded-lg px-2 py-1"
    >
      <span className="code flex items-center gap-1 text-sm">
        {slot.constant && <Lock className="text-muted" />}
        {slot.name}
      </span>
      <span className="flex h-7 min-w-14 items-center justify-end" dir="ltr">
        <Value slot={slot} dataKey={dataKey} hot={hot} />
      </span>
    </motion.div>
  );
}

function HeapCard({ obj, hot }: { obj: HeapObj; hot: boolean }) {
  return (
    <motion.div
      layout
      data-heap={obj.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: hot ? [1, 1.04, 1] : 1, boxShadow: hot ? "0 0 0 2px var(--accent)" : "0 0 0 1px var(--border)" }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl bg-surface p-2.5"
    >
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold">{obj.kind === "array" ? `مصفوفة · ${obj.items.length} عناصر` : "كائن"}</span>
        <span className="code text-muted">#{obj.id}</span>
      </div>
      {obj.kind === "array" ? (
        <div className="flex flex-wrap gap-1" dir="ltr">
          {obj.items.length === 0 && <span className="code text-xs text-muted">[ ]</span>}
          {obj.items.map((it) => (
            <motion.div layout key={it.name} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex min-w-11 flex-col items-center">
              <span className="flex h-9 w-full items-center justify-center rounded-md bg-surface-2 px-1.5" style={{ borderBottom: `2px solid ${slotColor(it)}` }}>
                <Value slot={it} dataKey={`h${obj.id}:${it.name}`} hot={hot} />
              </span>
              <span className="code mt-0.5 text-[10px] text-muted">{it.name}</span>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {obj.items.map((it) => (
            <div key={it.name} className="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-2 py-1">
              <span className="code text-sm">{it.name}</span>
              <span dir="ltr"><Value slot={it} dataKey={`h${obj.id}:${it.name}`} hot={hot} /></span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
