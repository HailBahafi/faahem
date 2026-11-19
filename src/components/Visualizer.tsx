"use client";

import { useState } from "react";
import { EXAMPLES, PY_EXAMPLES } from "@/content/examples";
import { Play } from "./icons";
import CodeEditor from "./stations/CodeEditor";
import TracePlayer from "./TracePlayer";

type VLang = "js" | "py";

export default function Visualizer() {
  const [lang, setLang] = useState<VLang>("js");
  const list = lang === "py" ? PY_EXAMPLES : EXAMPLES;
  const [pick, setPick] = useState(0);
  const [code, setCode] = useState(EXAMPLES[0].code);
  const [traced, setTraced] = useState<string | null>(EXAMPLES[0].code);

  const switchLang = (l: VLang) => {
    const first = (l === "py" ? PY_EXAMPLES : EXAMPLES)[0];
    setLang(l);
    setPick(0);
    setCode(first.code);
    setTraced(first.code);
  };

  return (
    <div className="space-y-6">
      <div className="flex w-fit gap-1 rounded-xl border border-line bg-surface p-1" dir="ltr">
        {(["js", "py"] as const).map((l) => (
          <button
            key={l}
            onClick={() => switchLang(l)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium ${lang === l ? "bg-accent text-accent-fg" : "text-muted hover:text-fg"}`}
          >
            {l === "js" ? "JavaScript" : "Python"}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((ex, k) => (
          <button
            key={ex.title}
            onClick={() => { setPick(k); setCode(ex.code); setTraced(ex.code); }}
            className={`rounded-xl border px-3 py-1.5 text-sm ${pick === k ? "border-accent bg-accent-soft/40 font-semibold" : "border-line bg-surface hover:border-accent"}`}
          >
            {ex.title}
          </button>
        ))}
      </div>
      {pick >= 0 && <p className="rounded-xl border-s-4 border-accent bg-accent-soft/30 p-3 leading-7">{list[pick].idea}</p>}

      <div className="overflow-hidden rounded-2xl bg-code ring-1 ring-white/5">
        <CodeEditor value={code} onChange={(c) => { setCode(c); setPick(-1); }} minHeight="120px" lang={lang} />
        <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
          <span className="text-xs text-white/40">اكتب أي كود {lang === "py" ? "Python" : "JavaScript"}، أو عدّل المثال</span>
          <button onClick={() => setTraced(code)} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-accent-fg">
            <Play className="h-4 w-4" /> شاهد التنفيذ
          </button>
        </div>
      </div>

      {traced !== null && <TracePlayer key={lang} code={traced} lang={lang} />}
    </div>
  );
}
