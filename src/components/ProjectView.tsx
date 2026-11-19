"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import { stages } from "@/content/roadmap";
import { useProgress } from "@/lib/progress";
import { runProjectTests, type TestResult } from "@/lib/projectTests";
import type { Project } from "@/lib/types";
import { Check, Cross, Play } from "./icons";
import CodeEditor from "./stations/CodeEditor";
import HtmlPreview from "./stations/HtmlPreview";

export const projectKey = (slug: string) => `project:${slug}`;

export default function ProjectView({ project }: { project: Project }) {
  const { progress, update } = useProgress();
  const [code, setCode] = useState(project.starter);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [ticked, setTicked] = useState<boolean[]>(project.steps.map(() => false));
  const stage = stages.find((s) => s.id === project.stage);
  const done = progress.completed.includes(projectKey(project.slug));

  const markDone = () =>
    update((p) => (p.completed.includes(projectKey(project.slug)) ? p : { ...p, completed: [...p.completed, projectKey(project.slug)] }));

  async function test() {
    setBusy(true);
    const r = await runProjectTests(project, code);
    setResults(r);
    setBusy(false);
    if (r.length && r.every((x) => x.pass)) markDone();
  }

  const passed = results?.filter((r) => r.pass).length ?? 0;
  const isText = project.lang === "text";

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-8">
      <Link href="/roadmap" className="text-sm text-muted hover:text-accent">
        مشروع المرحلة {project.stage} · {stage?.title}
      </Link>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold md:text-4xl">{project.title}</h1>
        {done && (
          <span className="flex items-center gap-1.5 rounded-full bg-ok/15 px-3 py-1.5 text-sm font-semibold text-ok">
            <Check className="h-4 w-4" /> أنجزت المشروع
          </span>
        )}
      </div>
      <p className="mt-3 max-w-3xl leading-8 text-muted">{project.brief}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-3 font-bold">الخطوات</h2>
          <ol className="space-y-2">
            {project.steps.map((s, k) => (
              <li key={k}>
                <label className="flex cursor-pointer items-start gap-3 leading-7">
                  <input
                    type="checkbox"
                    checked={ticked[k]}
                    onChange={() => setTicked((t) => t.map((v, j) => (j === k ? !v : v)))}
                    className="mt-1.5 accent-[var(--accent)]"
                  />
                  <span className={ticked[k] ? "text-muted line-through" : ""}>
                    <span className="code me-1 text-accent">{k + 1}.</span>
                    {s}
                  </span>
                </label>
              </li>
            ))}
          </ol>
          {isText && (
            <button
              disabled={!ticked.every(Boolean) || done}
              onClick={markDone}
              className="mt-5 w-full rounded-xl bg-accent py-2.5 font-semibold text-accent-fg disabled:opacity-40"
            >
              {done ? "أُنجز" : "أنهيت كل الخطوات"}
            </button>
          )}
        </section>

        {!isText && (
          <section className="space-y-4">
            <div className="overflow-hidden rounded-2xl bg-code ring-1 ring-white/5">
              <CodeEditor value={code} onChange={setCode} lang={project.lang} minHeight="320px" />
              <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
                <button onClick={() => setCode(project.starter)} className="text-xs text-white/50 hover:text-white">
                  ابدأ من جديد
                </button>
                <button onClick={test} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-accent-fg disabled:opacity-60">
                  <Play className="h-4 w-4" /> {busy ? "يختبر..." : "شغّل الاختبارات"}
                </button>
              </div>
            </div>
            {project.lang === "html" && <HtmlPreview html={code} height={320} />}
            {results && (
              <div className="rounded-2xl border border-line bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-bold">الاختبارات</span>
                  <span className={`code text-sm ${passed === results.length ? "text-ok" : "text-muted"}`}>
                    {passed}/{results.length}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {results.map((r, k) => (
                    <motion.li
                      key={r.name}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: k * 0.05 }}
                      className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${r.pass ? "bg-ok/10" : "bg-err/10"}`}
                    >
                      {r.pass ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" /> : <Cross className="mt-0.5 h-4 w-4 shrink-0 text-err" />}
                      <span>
                        {r.name}
                        {r.detail && <span className="block text-xs text-muted" dir="auto">{r.detail}</span>}
                      </span>
                    </motion.li>
                  ))}
                </ul>
                {passed === results.length && (
                  <p className="mt-3 font-semibold text-ok">كل الاختبارات نجحت. أنجزت مشروع المرحلة!</p>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
