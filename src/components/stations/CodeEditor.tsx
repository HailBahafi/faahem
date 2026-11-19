"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import type { Lang } from "@/lib/types";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => <div className="h-40 animate-pulse bg-code" />,
});

function extensionsFor(lang: Lang) {
  if (lang === "py") return [python()];
  if (lang === "html" || lang === "css") return [html()];
  if (lang === "ts") return [javascript({ typescript: true })];
  if (lang === "js") return [javascript()];
  return [];
}

export default function CodeEditor({
  value,
  onChange,
  minHeight = "140px",
  lang = "js",
}: {
  value: string;
  onChange: (v: string) => void;
  minHeight?: string;
  lang?: Lang;
}) {
  const extensions = useMemo(() => extensionsFor(lang), [lang]);
  return (
    <div dir="ltr" className="overflow-hidden rounded-xl">
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={oneDark}
        extensions={extensions}
        minHeight={minHeight}
        basicSetup={{ foldGutter: false, highlightActiveLine: true, autocompletion: true }}
      />
    </div>
  );
}
