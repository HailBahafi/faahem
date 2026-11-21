"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { PUBLISHED_LESSONS } from "@/content/published";
import { LEVEL_NAMES, tracks } from "@/content/tracks";
import { useProgress } from "@/lib/progress";

/** One card per language track: its four levels as a bar, and how far the learner is. */
export default function TrackCards() {
  const { progress } = useProgress();
  const done = new Set(progress.completed);

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {tracks.map((t, i) => {
        const all = t.levels.flatMap((l) => l.lessons);
        const finished = all.filter((l) => done.has(l.slug)).length;
        const ready = all.filter((l) => PUBLISHED_LESSONS.has(l.slug)).length;
        return (
          <motion.div key={t.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link
              href={`/tracks/${t.id}`}
              className="group block h-full rounded-3xl border border-line bg-surface p-6 transition hover:-translate-y-1 hover:border-accent"
            >
              <div className="flex items-center justify-between">
                <h2 className="code text-2xl font-bold" style={{ color: t.color }}>{t.name}</h2>
                <span className="text-sm text-muted">{all.length} درساً</span>
              </div>
              <p className="mt-2 min-h-14 leading-7 text-muted">{t.tagline}</p>
              <div className="mt-4 grid grid-cols-4 gap-1.5">
                {t.levels.map((lv) => {
                  const n = lv.lessons.length;
                  const d = lv.lessons.filter((l) => done.has(l.slug)).length;
                  return (
                    <div key={lv.id}>
                      <div className="h-2 overflow-hidden rounded-full bg-line">
                        <div className="h-full rounded-full" style={{ width: `${(d / n) * 100}%`, background: t.color }} />
                      </div>
                      <div className="mt-1 text-[11px] text-muted">{LEVEL_NAMES[lv.id]}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-between text-xs text-muted">
                <span>أكملت {finished}</span>
                <span>{ready < all.length ? `جاهز ${ready} من ${all.length}` : "كل الدروس جاهزة"}</span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
