"use client";

import Link from "next/link";
import { useState } from "react";
import { lessons } from "@/content/lessons";
import { useProgress } from "@/lib/progress";
import { afterReview, inDays, INTERVAL_DAYS } from "@/lib/review";
import { PASS_RATIO } from "./stations/Quiz";
import Quiz from "./stations/Quiz";

export default function ReviewSession() {
  const { progress, update } = useProgress();
  const [active, setActive] = useState<string | null>(null);
  const now = Date.now();
  const entries = Object.entries(progress.review)
    .filter(([slug]) => lessons[slug])
    .sort((a, b) => a[1].due - b[1].due);

  if (active) {
    const lesson = lessons[active];
    return (
      <div className="rounded-3xl border border-line bg-surface/60 p-5 md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">مراجعة: {lesson.title}</h2>
          <button onClick={() => setActive(null)} className="text-sm text-muted hover:text-fg">رجوع للقائمة</button>
        </div>
        <Quiz
          key={active}
          items={lesson.quiz}
          passNote="ثبّتّ الدرس في ذاكرتك. ستعود المراجعة التالية بعد مدة أطول."
          onFinish={(score) => update((p) => afterReview(p, active, score / lesson.quiz.length >= PASS_RATIO))}
        />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
        لا يوجد ما تراجعه بعد. أكمل درساً وسيظهر هنا بعد يوم.
        <div className="mt-4">
          <Link href="/roadmap" className="rounded-xl bg-accent px-4 py-2 font-semibold text-accent-fg">خارطة الطريق</Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map(([slug, r]) => {
        const due = r.due <= now;
        return (
          <li key={slug} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${due ? "border-bool/50 bg-bool/5" : "border-line bg-surface"}`}>
            <div>
              <div className="font-bold">{lessons[slug].title}</div>
              <div className="text-sm text-muted">
                {due ? "حان وقت مراجعته" : `المراجعة ${inDays(r.due, now)}`} · المستوى {r.level + 1} من {INTERVAL_DAYS.length}
              </div>
            </div>
            <button
              onClick={() => setActive(slug)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${due ? "bg-accent text-accent-fg" : "border border-line"}`}
            >
              {due ? "راجع الآن" : "راجع مبكراً"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
