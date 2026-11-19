"use client";

import { useTrace } from "@/lib/useTrace";
import type { Lang } from "@/lib/types";
import ScenePlayer from "./scene/ScenePlayer";

/** Runs a program through the tracer (JS, TS or Python) and plays it as an animation. */
export default function TracePlayer({ code, lang = "js", autoPlay = true }: { code: string; lang?: "js" | "ts" | "py"; autoPlay?: boolean }) {
  const result = useTrace(lang, code);

  if (result.status === "loading") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-6 text-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        {lang === "py" ? "يجهّز Python في متصفحك (المرة الأولى تستغرق ثواني)..." : "يتتبّع التنفيذ..."}
      </div>
    );
  }
  if (result.steps.length === 0) {
    return <div className="rounded-xl border border-err/40 bg-err/10 p-4 text-sm text-err">✕ {result.error}</div>;
  }
  return (
    <div>
      <ScenePlayer key={code} scene={{ code: { [lang]: code } as Partial<Record<Lang, string>>, steps: result.steps }} lang={lang} autoPlay={autoPlay} interval={1300} />
      {result.error && <p className="mt-2 text-sm text-muted">توقّف التشغيل عند خطأ. شاهد آخر خطوة لترى أين ولماذا.</p>}
    </div>
  );
}
