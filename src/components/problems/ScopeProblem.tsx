"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

type Room = { level: number; label: string; drawers: { name: string; value: string; color: string }[] };

const ROOMS: Room[] = [
  { level: 0, label: "الصالة", drawers: [{ name: "city", value: '"Riyadh"', color: "text-str" }] },
  { level: 1, label: "غرفة trip", drawers: [{ name: "count", value: "3", color: "text-num" }] },
  { level: 2, label: "خزانة if", drawers: [{ name: "note", value: '"go"', color: "text-str" }] },
];

/** level: the room the line stands in (null = not clickable). reads: drawers the line asks for. */
const LINES: { code: string; indent: number; level: number | null; reads: string[] }[] = [
  { code: 'let city = "Riyadh";', indent: 0, level: 0, reads: [] },
  { code: "function trip() {", indent: 0, level: null, reads: [] },
  { code: "let count = 3;", indent: 1, level: 1, reads: [] },
  { code: "if (count > 0) {", indent: 1, level: 1, reads: ["count"] },
  { code: 'let note = "go";', indent: 2, level: 2, reads: [] },
  { code: "console.log(city, count, note);", indent: 2, level: 2, reads: ["city", "count", "note"] },
  { code: "}", indent: 1, level: null, reads: [] },
  { code: "console.log(note);", indent: 1, level: 1, reads: ["note"] },
  { code: "}", indent: 0, level: null, reads: [] },
  { code: "trip();", indent: 0, level: 0, reads: [] },
  { code: "console.log(count);", indent: 0, level: 0, reads: ["count"] },
];

const roomOf = (name: string) => ROOMS.find((r) => r.drawers.some((d) => d.name === name))!.level;

/** A house of nested rooms with one-way windows: a line sees its own room and every room around it, never inside. */
export default function ScopeProblem() {
  const [sel, setSel] = useState<number | null>(null);
  const [tried, setTried] = useState<Set<number>>(new Set());
  const line = sel === null ? null : LINES[sel];
  const here = line?.level ?? null;
  const missing = line ? line.reads.filter((n) => roomOf(n) > line.level!) : [];
  const sawError = [...tried].some((k) => LINES[k].reads.some((n) => roomOf(n) > LINES[k].level!));
  const sawInner = [...tried].some((k) => LINES[k].level === 2);

  const pick = (k: number) => {
    setSel(k);
    setTried((t) => new Set(t).add(k));
  };

  const room = (lvl: number): ReactNode => {
    const r = ROOMS[lvl];
    const visible = here === null || lvl <= here;
    return (
      <motion.div
        animate={{ opacity: visible ? 1 : 0.3 }}
        className={`rounded-2xl border-2 p-3 transition-colors ${
          here !== null && visible ? "border-accent" : "border-line"
        } ${here !== null && !visible ? "bg-code" : "bg-surface"}`}
      >
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          <span className="font-bold">{r.label}</span>
          {here === lvl && (
            <motion.span layoutId="you" className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-fg">
              أنت هنا
            </motion.span>
          )}
          {here !== null && !visible && <span className="text-xs text-muted">لا تُرى من هنا</span>}
        </div>
        <div className="mb-2 flex flex-wrap gap-2" dir="ltr">
          {r.drawers.map((d) => {
            const asked = line?.reads.includes(d.name);
            return (
              <motion.div
                key={d.name}
                animate={{ scale: asked && visible ? 1.08 : 1 }}
                className={`code rounded-lg border px-2 py-1 text-sm ${
                  asked ? (visible ? "border-ok" : "border-err") : "border-line"
                }`}
              >
                <span className="text-muted">{d.name}</span> <span className={`font-bold ${d.color}`}>{visible ? d.value : "?"}</span>
              </motion.div>
            );
          })}
        </div>
        {lvl < ROOMS.length - 1 && room(lvl + 1)}
      </motion.div>
    );
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="code rounded-2xl bg-code p-4 text-sm leading-8" dir="ltr">
          {LINES.map((l, k) => (
            <div
              key={k}
              onClick={l.level === null ? undefined : () => pick(k)}
              style={{ paddingLeft: `${l.indent * 1.25 + 0.5}rem` }}
              className={`rounded-md ${l.level === null ? "text-muted" : "cursor-pointer hover:bg-surface"} ${
                sel === k ? "bg-surface font-bold" : ""
              } ${tried.has(k) && sel !== k ? "opacity-70" : ""}`}
            >
              {l.code}
            </div>
          ))}
        </div>
        <div>{room(0)}</div>
      </div>

      <div className="mt-3 min-h-16">
        <AnimatePresence mode="wait">
          {line === null ? (
            <motion.p key="hint" exit={{ opacity: 0 }} className="text-muted">
              اضغط على أي سطر في الكود.
            </motion.p>
          ) : missing.length ? (
            <motion.p key={`e${sel}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-err" dir="ltr">
              ReferenceError: {missing[0]} is not defined
            </motion.p>
          ) : (
            <motion.p key={`ok${sel}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ok">
              هذا السطر يرى {here === 0 ? "الصالة فقط" : here === 1 ? "غرفته والصالة" : "الخزانة والغرفة والصالة"}.
            </motion.p>
          )}
        </AnimatePresence>
        {sawError && sawInner && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-muted">
            النوافذ في اتجاه واحد: من الداخل ترى <b className="text-fg">الخارج</b>، ومن الخارج لا ترى <b className="text-fg">الداخل</b>.
          </motion.p>
        )}
      </div>
    </div>
  );
}
