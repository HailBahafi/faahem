"use client";

import { motion } from "motion/react";
import { useEffect, useId, useRef } from "react";

const KEYWORDS = new Set([
  "let", "const", "var", "mut", "fn", "func", "int", "String", "double", "bool", "final", "if", "else",
  "for", "while", "return", "switch", "case", "number", "string", "boolean", "print", "println", "def", "true", "false",
]);

/** Tiny tokenizer: enough colour to read code, without a full grammar per language. */
export function highlight(line: string) {
  const parts = line.split(/("[^"]*"|'[^']*'|\/\/.*$|#.*$|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/);
  return parts.map((p, i) => {
    if (!p) return null;
    let color: string | undefined;
    if (/^["']/.test(p)) color = "#f6c177";
    else if (/^(\/\/|#)/.test(p)) color = "#6b7a90";
    else if (/^\d/.test(p)) color = "#7cc4fa";
    else if (KEYWORDS.has(p)) color = "#c792ea";
    else if (/^(console|log|fmt|Println)$/.test(p)) color = "#82e3d0";
    return (
      <span key={i} style={color ? { color } : undefined}>
        {p}
      </span>
    );
  });
}

interface Props {
  code: string;
  line: number | null;
  output?: string[];
  title?: string;
}

export default function CodePanel({ code, line, output, title }: Props) {
  const id = useId();
  const lines = code.split("\n");
  const scroller = useRef<HTMLDivElement>(null);

  // Keep the running line visible in long programs without scrolling the page.
  useEffect(() => {
    const box = scroller.current;
    if (!box || !line) return;
    const row = box.children[line - 1] as HTMLElement | undefined;
    if (!row) return;
    if (row.offsetTop < box.scrollTop + 8 || row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight - 8) {
      box.scrollTo({ top: row.offsetTop - box.clientHeight / 3, behavior: "smooth" });
    }
  }, [line]);
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-code text-code-fg ring-1 ring-white/5">
      <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5" dir="ltr">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        {title && <span className="code ms-3 text-xs text-white/40">{title}</span>}
      </div>
      <div ref={scroller} className="code relative max-h-[560px] flex-1 overflow-auto py-3 text-[13px] leading-8 md:text-[14px]">
        {lines.map((l, i) => {
          const active = line === i + 1;
          return (
            <div key={i} className="relative flex px-4">
              {active && (
                <motion.div
                  layoutId={id + "hl"}
                  className="absolute inset-0 border-l-[3px] border-[var(--accent)] bg-[var(--code-hl)]"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <span className={`relative w-7 shrink-0 select-none text-right ${active ? "text-white" : "text-white/25"}`}>{i + 1}</span>
              <span className="relative ps-4 whitespace-pre">{highlight(l)}</span>
            </div>
          );
        })}
      </div>
      {output && output.length > 0 && (
        <div className="code max-h-32 overflow-auto border-t border-white/5 bg-black/30 px-4 py-2 text-sm">
          {output.map((l, k) => (
            <div key={k} className="whitespace-pre-wrap">
              <span className="text-white/30">{"> "}</span>
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
