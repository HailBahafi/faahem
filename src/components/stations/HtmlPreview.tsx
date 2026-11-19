"use client";

import { useEffect, useState } from "react";

/** Live, sandboxed rendering of learner HTML (scripts run, but cannot touch this page). */
export default function HtmlPreview({ html, height = 260 }: { html: string; height?: number }) {
  const [doc, setDoc] = useState(html);
  useEffect(() => {
    const t = setTimeout(() => setDoc(html), 300);
    return () => clearTimeout(t);
  }, [html]);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-black/10 bg-[#f1f3f5] px-3 py-1.5 text-xs text-black/50" dir="ltr">
        <span className="h-2 w-2 rounded-full bg-black/20" />
        <span className="rounded bg-white px-2 py-0.5">preview</span>
      </div>
      <iframe title="preview" sandbox="allow-scripts" srcDoc={doc} className="block w-full bg-white" style={{ height }} />
    </div>
  );
}
