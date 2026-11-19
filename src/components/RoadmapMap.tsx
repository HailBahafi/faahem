"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { PUBLISHED_LESSONS, STAGE_PROJECTS } from "@/content/published";
import { stageComplete } from "./CertificateView";
import { projectKey } from "./ProjectView";
import { stages } from "@/content/roadmap";
import { useProgress } from "@/lib/progress";
import { Check } from "./icons";

/** A metro-style map: each stage is a line, each lesson a station on it. */
export default function RoadmapMap() {
  const { progress } = useProgress();
  const done = new Set(progress.completed);
  const nextSlug = stages.flatMap((s) => s.lessons).find((l) => PUBLISHED_LESSONS.has(l.slug) && !done.has(l.slug))?.slug;
  const total = stages.reduce((n, s) => n + s.lessons.length, 0);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-6 rounded-2xl border border-line bg-surface p-5">
        <div>
          <div className="text-3xl font-bold">{done.size}<span className="text-lg text-muted"> / {total}</span></div>
          <div className="text-sm text-muted">درس مكتمل</div>
        </div>
        <div className="h-2 min-w-40 flex-1 overflow-hidden rounded-full bg-line">
          <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${(done.size / total) * 100}%` }} />
        </div>
        <div className="flex gap-4 text-xs text-muted">
          <Legend className="bg-ok" label="مكتمل" />
          <Legend className="bg-accent ring-4 ring-accent/25" label="متاح الآن" />
          <Legend className="border-2 border-line bg-surface" label="قريباً" />
        </div>
      </div>

      <div className="relative">
        {stages.map((st, si) => (
          <motion.section
            key={st.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="relative ps-14 pb-10"
          >
            {/* The line */}
            {si < stages.length - 1 && (
              <span className="absolute start-[22px] top-10 bottom-0 w-1.5 rounded-full" style={{ background: st.color, opacity: 0.35 }} />
            )}
            <span
              className="absolute start-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-black"
              style={{ background: st.color }}
            >
              {st.id}
            </span>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h2 className="text-xl font-bold">{st.title}</h2>
              <span className="code text-xs text-muted">{st.langs}</span>
            </div>
            <p className="text-sm text-muted">{st.goal}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {st.lessons.map((l) => {
                const ready = PUBLISHED_LESSONS.has(l.slug);
                const isDone = done.has(l.slug);
                const isNext = l.slug === nextSlug;
                const inner = (
                  <span
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                      isDone ? "border-ok/40 bg-ok/10" : isNext ? "border-accent bg-accent-soft/40 font-semibold shadow-lg shadow-accent/10" : ready ? "border-line bg-surface hover:border-accent" : "border-dashed border-line text-muted"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${isDone ? "bg-ok text-white" : isNext ? "bg-accent" : ready ? "bg-surface-2" : "border-2 border-line"}`}
                    >
                      {isDone && <Check className="h-3 w-3" />}
                      {isNext && <motion.span className="h-2 w-2 rounded-full bg-accent-fg" animate={{ scale: [1, 1.6, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} />}
                    </span>
                    {l.title}
                    {!ready && <span className="text-[10px]">قريباً</span>}
                  </span>
                );
                return ready ? (
                  <Link key={l.slug} href={`/learn/${l.slug}`}>{inner}</Link>
                ) : (
                  <span key={l.slug}>{inner}</span>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {st.project &&
                (() => {
                  const p = STAGE_PROJECTS[st.id];
                  const inner = (
                    <>
                      <span style={{ color: st.color }}>◆</span> مشروع المرحلة: {p ? p.title : st.project}
                      {p && done.has(projectKey(p.slug)) && <Check className="h-4 w-4 text-ok" />}
                      {!p && <span className="text-[10px] text-muted">قريباً</span>}
                    </>
                  );
                  return p ? (
                    <Link href={`/project/${p.slug}`} className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm hover:border-accent">
                      {inner}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-1.5 text-sm">{inner}</span>
                  );
                })()}
              {stageComplete(st, progress.completed) && (
                <Link href={`/certificate/${st.id}`} className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-fg">
                  🎓 شهادة المرحلة
                </Link>
              )}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-full ${className}`} />
      {label}
    </span>
  );
}
