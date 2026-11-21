"use client";

import { useState } from "react";
import type { RunResult } from "@/lib/runJs";
import { explain, runCode } from "@/lib/runners";
import type { RunLang } from "@/lib/types";
import { Play } from "../icons";
import TracePlayer from "../TracePlayer";
import CodeEditor from "./CodeEditor";
import HtmlPreview from "./HtmlPreview";

const LABEL: Record<RunLang, string> = {
  js: "JavaScript يعمل في متصفحك",
  ts: "TypeScript يعمل في متصفحك",
  py: "Python يعمل في متصفحك",
  html: "الصفحة تُعرض مباشرة",
  sql: "قاعدة بيانات Postgres تعمل في متصفحك",
  go: "Go يُترجم ويعمل على خادم التشغيل",
  rust: "Rust يُترجم ويعمل على خادم التشغيل",
  dart: "Dart يعمل على خادم التشغيل",
};

/** Editable code with Run (and "watch it run" for JS/TS/Python); HTML gets a live preview. */
export default function CodeRunner({ starter, lang = "js", setup }: { starter: string; lang?: RunLang; setup?: string }) {
  const [code, setCode] = useState(starter);
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [traced, setTraced] = useState<string | null>(null);

  if (lang === "html") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-code ring-1 ring-white/5">
          <CodeEditor value={code} onChange={setCode} lang="html" minHeight="260px" />
        </div>
        <HtmlPreview html={code} height={300} />
      </div>
    );
  }

  async function run() {
    setBusy(true);
    setResult(await runCode(lang, code, undefined, setup));
    setBusy(false);
  }

  const err = result && explain(lang, result);
  return (
    <div className="overflow-hidden rounded-2xl bg-code ring-1 ring-white/5">
      <CodeEditor value={code} onChange={setCode} lang={lang} />
      <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
        <span className="text-xs text-white/40">{busy && lang === "py" ? "يجهّز Python..." : LABEL[lang]}</span>
        <div className="flex gap-2">
          {lang !== "sql" && (
            <button onClick={() => setTraced(code)} className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white hover:border-[var(--accent)]">
              شاهد التنفيذ
            </button>
          )}
          <button onClick={run} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-fg disabled:opacity-60">
            <Play className="h-4 w-4" /> شغّل
          </button>
        </div>
      </div>
      {result && (
        <div className="code border-t border-white/10 bg-black/30 px-4 py-3 text-sm text-code-fg">
          {result.out.map((l, k) => <div key={k} className="whitespace-pre-wrap">{l}</div>)}
          {result.out.length === 0 && !err && <div className="text-white/30">(لم يُطبع شيء)</div>}
          {err && <div dir="rtl" className="font-sans text-[#ff8a8a]">✕ {err}</div>}
        </div>
      )}
      {traced !== null && (
        <div className="border-t border-white/10 bg-bg p-4 text-fg">
          <TracePlayer code={traced} lang={lang === "ts" || lang === "py" ? lang : "js"} />
        </div>
      )}
    </div>
  );
}
