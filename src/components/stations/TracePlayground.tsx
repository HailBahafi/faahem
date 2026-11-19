"use client";

import { useState } from "react";
import { Play } from "../icons";
import TracePlayer from "../TracePlayer";
import CodeEditor from "./CodeEditor";
import HtmlPreview from "./HtmlPreview";

/**
 * Edit a program, then watch it run (JS / Python), or edit a page and see it live (HTML).
 * Challenges suggest what to change.
 */
export default function TracePlayground({
  intro,
  starter,
  challenges,
  lang = "js",
}: {
  intro: string;
  starter: string;
  challenges: string[];
  lang?: "js" | "py" | "html";
}) {
  const [code, setCode] = useState(starter);
  const [traced, setTraced] = useState(starter);
  const [done, setDone] = useState<boolean[]>(challenges.map(() => false));

  const list = (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-2 text-sm font-bold">جرّب أن:</div>
      <ul className="space-y-2">
        {challenges.map((c, k) => (
          <li key={k}>
            <label className="flex cursor-pointer items-start gap-2 text-sm leading-6">
              <input
                type="checkbox"
                checked={done[k]}
                onChange={() => setDone((d) => d.map((v, j) => (j === k ? !v : v)))}
                className="mt-1 accent-[var(--accent)]"
              />
              <span className={done[k] ? "text-muted line-through" : ""}>{c}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );

  if (lang === "html") {
    return (
      <div className="space-y-5">
        <p className="leading-8 text-muted">{intro}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-code ring-1 ring-white/5">
            <CodeEditor value={code} onChange={setCode} lang="html" minHeight="280px" />
          </div>
          <HtmlPreview html={code} height={320} />
        </div>
        {list}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="leading-8 text-muted">{intro}</p>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl bg-code ring-1 ring-white/5">
          <CodeEditor value={code} onChange={setCode} lang={lang} minHeight="160px" />
          <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
            <button onClick={() => { setCode(starter); setTraced(starter); }} className="text-xs text-white/50 hover:text-white">
              أعد الكود الأصلي
            </button>
            <button onClick={() => setTraced(code)} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-accent-fg">
              <Play className="h-4 w-4" /> شاهد التنفيذ
            </button>
          </div>
        </div>
        {list}
      </div>
      <TracePlayer code={traced} lang={lang} />
    </div>
  );
}
