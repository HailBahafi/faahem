"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import type { Cell, ValType } from "@/lib/types";
import MemoryView from "../scene/MemoryView";
import { highlight } from "../scene/CodePanel";

type Var = { value: unknown; constant: boolean };

const typeOf = (v: unknown): ValType =>
  typeof v === "number" ? "number" : typeof v === "string" ? "string" : typeof v === "boolean" ? "boolean" : "none";
const show = (v: unknown) => (typeof v === "string" ? `"${v}"` : String(v));

/**
 * A one-line-at-a-time JavaScript memory sandbox: declarations and assignments
 * animate straight into the memory drawers.
 */
export default function Sandbox({ intro, examples }: { intro: string; examples: string[] }) {
  const [vars, setVarsState] = useState<Map<string, Var>>(new Map());
  // The ref keeps the latest memory so quick consecutive commands never read a stale copy.
  const varsRef = useRef(vars);
  const setVars = (m: Map<string, Var>) => {
    varsRef.current = m;
    setVarsState(m);
  };
  const [history, setHistory] = useState<{ line: string; ok: boolean; msg?: string }[]>([]);
  const [input, setInput] = useState("");
  const [changed, setChanged] = useState<string[]>([]);
  const [read, setRead] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();

  function evaluate(expr: string, scope: Map<string, Var>) {
    const names = [...scope.keys()];
    const used = names.filter((n) => new RegExp(`\\b${n}\\b`).test(expr));
    const value = new Function(...names, `"use strict"; return (${expr});`)(...names.map((n) => scope.get(n)!.value));
    return { value, used };
  }

  function run(raw: string) {
    const line = raw.trim().replace(/;$/, "");
    if (!line) return;
    const next = new Map(varsRef.current);
    let msg: string | undefined;
    let ok = true;
    let ch: string[] = [];
    let rd: string[] = [];
    try {
      let m: RegExpMatchArray | null;
      if ((m = line.match(/^(let|const|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(.+)$/))) {
        const [, kw, name, expr] = m;
        if (next.has(name)) throw new Error(`المتغير ${name} موجود مسبقاً. لتغييره اكتب ${name} = ... بدون ${kw}.`);
        const { value, used } = evaluate(expr, next);
        next.set(name, { value, constant: kw === "const" });
        ch = [name];
        rd = used;
        msg = `أُنشئ درج جديد اسمه ${name} وفيه ${show(value)}`;
      } else if ((m = line.match(/^([A-Za-z_$][\w$]*)\s*=\s*(.+)$/))) {
        const [, name, expr] = m;
        const cur = next.get(name);
        if (!cur) throw new Error(`لا يوجد درج اسمه ${name}. أنشئه أولاً بـ let ${name} = ...`);
        if (cur.constant) throw new Error(`${name} أُنشئ بـ const، لذلك لا يمكن تغييره.`);
        const { value, used } = evaluate(expr, next);
        next.set(name, { ...cur, value });
        ch = [name];
        rd = used.filter((u) => u !== name || expr.includes(name));
        msg = `تغيّرت قيمة ${name}: ${show(cur.value)} ← ${show(value)}`;
      } else if ((m = line.match(/^console\.log\((.*)\)$/))) {
        const { value, used } = evaluate(m[1], next);
        rd = used;
        msg = `الشاشة تعرض: ${String(value)}`;
      } else {
        throw new Error("جرّب سطراً مثل: let x = 5 أو x = x + 1");
      }
      setError(undefined);
    } catch (e) {
      ok = false;
      const text = (e as Error).message;
      const undef = text.match(/(\w+) is not defined/);
      msg = undef ? `المتغير ${undef[1]} غير موجود في الذاكرة.` : text;
      setError(msg);
    }
    setVars(next);
    setChanged(ch);
    setRead(rd);
    setHistory((h) => [...h, { line, ok, msg }]);
    setInput("");
  }

  const cells: Cell[] = [...vars.entries()].map(([name, v]) => ({
    name,
    value: show(v.value),
    type: typeOf(v.value),
    constant: v.constant,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <p className="leading-8 text-muted">{intro}</p>
        <div className="flex flex-col overflow-hidden rounded-2xl bg-code text-code-fg ring-1 ring-white/5">
          <div className="code max-h-64 min-h-40 flex-1 space-y-1 overflow-y-auto p-4 text-sm">
            {history.length === 0 && <div className="text-white/30">{"// اكتب سطراً بالأسفل أو اضغط مثالاً"}</div>}
            <AnimatePresence initial={false}>
              {history.map((h, k) => (
                <motion.div key={k} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                  <div>
                    <span className={h.ok ? "text-[var(--accent)]" : "text-[#ff6b6b]"}>{h.ok ? "✓ " : "✕ "}</span>
                    {highlight(h.line)}
                  </div>
                  {h.msg && <div dir="rtl" className={`font-sans text-xs ${h.ok ? "text-white/45" : "text-[#ff8a8a]"}`}>{h.msg}</div>}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); run(input); }}
            className="flex items-center gap-2 border-t border-white/10 p-2"
            dir="ltr"
          >
            <span className="code ps-2 text-[var(--accent)]">{">"}</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="let score = 10"
              className="code flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/25"
              spellCheck={false}
              autoComplete="off"
            />
            <button className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-fg" dir="rtl">نفّذ</button>
          </form>
        </div>
        <div className="flex flex-wrap gap-2" dir="ltr">
          {examples.map((ex) => (
            <button key={ex} onClick={() => run(ex)} className="code rounded-lg border border-line bg-surface px-2.5 py-1 text-xs hover:border-accent">
              {ex}
            </button>
          ))}
          <button
            onClick={() => { setVars(new Map()); setHistory([]); setError(undefined); setChanged([]); setRead([]); }}
            className="rounded-lg px-2.5 py-1 text-xs text-muted hover:text-fg"
          >
            مسح الذاكرة
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-line bg-surface/70 p-4">
        <MemoryView cells={cells} changed={changed} read={read} error={error} />
      </div>
    </div>
  );
}
