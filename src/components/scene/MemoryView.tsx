"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Cell, ValType } from "@/lib/types";
import { Lock } from "../icons";

export const TYPE_INFO: Record<ValType, { label: string; color: string }> = {
  number: { label: "رقم", color: "var(--num)" },
  string: { label: "نص", color: "var(--str)" },
  boolean: { label: "منطقي", color: "var(--bool)" },
  none: { label: "فارغ", color: "var(--muted)" },
};

const addr = (i: number) => "0x" + (0x1000 + i * 4).toString(16).toUpperCase();

interface Props {
  cells: Cell[];
  changed?: string[];
  read?: string[];
  copy?: { from: string; to: string };
  error?: string;
  minSlots?: number;
}

export default function MemoryView({ cells, changed = [], read = [], copy, error, minSlots = 6 }: Props) {
  const slots = Math.max(minSlots, cells.length);
  return (
    <motion.div
      key={error ?? "ok"}
      animate={error ? { x: [0, -10, 10, -6, 6, 0] } : {}}
      transition={{ duration: 0.45 }}
      className="relative"
    >
      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span className="font-semibold tracking-wide">الذاكرة (RAM)</span>
        <span className="flex gap-3">
          {(["number", "string", "boolean"] as ValType[]).map((t) => (
            <span key={t} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: TYPE_INFO[t].color }} />
              {TYPE_INFO[t].label}
            </span>
          ))}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: slots }, (_, i) => {
          const c = cells[i];
          if (!c) {
            return (
              <div key={"empty" + i} className="rounded-xl border border-dashed border-line p-2 opacity-60">
                <div className="code text-[10px] text-muted">{addr(i)}</div>
                <div className="mt-1 h-14 rounded-lg bg-surface-2" />
                <div className="mt-1.5 h-5" />
              </div>
            );
          }
          const info = TYPE_INFO[c.type];
          const isChanged = changed.includes(c.name);
          const isRead = read.includes(c.name);
          const isCopyTarget = copy?.to === c.name;
          return (
            <motion.div
              key={c.name}
              layout
              initial={{ opacity: 0, y: 18, scale: 0.9 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isChanged ? [1, 1.07, 1] : 1,
                boxShadow: isChanged ? `0 0 0 2px var(--accent), 0 8px 28px -8px var(--accent)` : isRead ? `0 0 0 2px var(--num)` : "0 0 0 1px var(--border)",
              }}
              transition={{ duration: 0.45 }}
              className="relative rounded-xl bg-surface p-2"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="code text-[10px] text-muted">{addr(i)}</span>
                <span className="flex items-center gap-1 text-[10px]" style={{ color: info.color }}>
                  {c.constant && (
                    <span className="text-muted" title="const: لا يتغير">
                      <Lock />
                    </span>
                  )}
                  {info.label}
                </span>
              </div>
              <div
                className="relative mt-1 flex h-14 items-center justify-center overflow-hidden rounded-lg bg-surface-2"
                style={{ borderBottom: `3px solid ${info.color}` }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={c.value}
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 30, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="code text-lg font-bold"
                    style={{ color: info.color }}
                  >
                    {c.value}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="code mt-1.5 rounded-md bg-fg px-1.5 py-0.5 text-center text-xs font-semibold break-all text-bg">{c.name}</div>
              <AnimatePresence>
                {isRead && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-2.5 left-2 rounded-full bg-num px-2 text-[10px] font-semibold text-white"
                  >
                    يُقرأ
                  </motion.span>
                )}
                {isCopyTarget && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-2.5 left-2 rounded-full bg-accent px-2 text-[10px] font-semibold text-accent-fg"
                  >
                    نسخة من {copy!.from}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-lg border border-err/40 bg-err/10 px-3 py-2 text-sm font-medium text-err"
          >
            ✕ {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
