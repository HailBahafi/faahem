"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { lessonTitle } from "@/content/roadmap";
import { useLang, useProgress } from "@/lib/progress";
import { nextDue } from "@/lib/review";
import { sceneLangs, type Lesson } from "@/lib/types";
import { useTrace } from "@/lib/useTrace";
import { warmPython } from "@/lib/python/pyClient";
import { Back, Check, Next } from "../icons";
import LangSwitch from "../LangSwitch";
import ScenePlayer from "../scene/ScenePlayer";
import CodeRunner from "../stations/CodeRunner";
import Exercises from "../stations/Exercises";
import Predict from "../stations/Predict";
import Quiz, { PASS_RATIO } from "../stations/Quiz";
import Sandbox from "../stations/Sandbox";
import TracePlayground from "../stations/TracePlayground";
import { PROBLEMS } from "../problems";
import { PUBLISHED_LESSONS } from "@/content/published";

const STATIONS = [
  { id: "problem", label: "المشكلة", hint: "لماذا نحتاج هذا؟" },
  { id: "watch", label: "شاهد", hint: "الأنميشن خطوة بخطوة" },
  { id: "play", label: "العب", hint: "تحكّم في الذاكرة بنفسك" },
  { id: "predict", label: "توقّع", hint: "ماذا سيحدث؟" },
  { id: "code", label: "الكود", hint: "نفس الفكرة بست لغات" },
  { id: "practice", label: "طبّق", hint: "4 تمارين متدرّجة" },
  { id: "quiz", label: "اختبر", hint: "اختبار الفهم" },
] as const;

export default function LessonView({ lesson }: { lesson: Lesson }) {
  const { progress, update } = useProgress();
  const [preferred, setLang] = useLang();
  const [s, setS] = useState(0);
  // Languages this lesson's scene is written in; the learner's preferred one if present.
  const langs = sceneLangs(lesson.scene);
  const lang = langs.includes(preferred) ? preferred : langs[0];
  const traceLang = lesson.scene.trace === "py" ? "py" : lesson.scene.trace ? "js" : null;
  const traced = useTrace(traceLang ?? "js", traceLang ? (lesson.scene.code[traceLang] ?? "") : null);
  const scene = traceLang ? { ...lesson.scene, steps: traced.status === "done" ? traced.steps : [] } : lesson.scene;
  const sceneReady = scene.steps.length > 0;
  const usesPython =
    traceLang === "py" ||
    (lesson.playground.kind === "trace" && lesson.playground.lang === "py") ||
    lesson.code.runnerLang === "py" ||
    lesson.predict.some((q) => q.lang === "py") ||
    lesson.exercises.some((e) => e.lang === "py");
  useEffect(() => {
    if (usesPython) warmPython();
  }, [usesPython]);
  const Demo = PROBLEMS[lesson.problem.demo];

  // A lesson always opens at station 1; a returning learner gets a button to jump back.
  const saved = progress.station[lesson.slug] ?? 0;
  const [resumeDismissed, setResumeDismissed] = useState(false);

  const go = (k: number) => {
    setS(k);
    update((p) => ({ ...p, station: { ...p.station, [lesson.slug]: Math.max(k, p.station[lesson.slug] ?? 0) } }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const completed = progress.completed.includes(lesson.slug);
  const reached = Math.max(progress.station[lesson.slug] ?? 0, s);

  function finishQuiz(score: number) {
    const pass = score / lesson.quiz.length >= PASS_RATIO;
    update((p) => ({
      ...p,
      quiz: { ...p.quiz, [lesson.slug]: Math.max(score, p.quiz[lesson.slug] ?? 0) },
      completed: pass && !p.completed.includes(lesson.slug) ? [...p.completed, lesson.slug] : p.completed,
      review: pass && !p.review[lesson.slug] ? { ...p.review, [lesson.slug]: { level: 0, due: nextDue(0) } } : p.review,
    }));
  }

  const station = STATIONS[s];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/roadmap" className="text-sm text-muted hover:text-accent">
            المرحلة {lesson.stage} · الدرس {lesson.number}
          </Link>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">{lesson.title}</h1>
          <p className="mt-1 text-muted">{lesson.subtitle} · {lesson.minutes} دقيقة</p>
        </div>
        {completed && (
          <span className="flex items-center gap-1.5 rounded-full bg-ok/15 px-3 py-1.5 text-sm font-semibold text-ok">
            <Check className="h-4 w-4" /> أكملت الدرس
          </span>
        )}
      </div>

      {s === 0 && saved > 0 && !resumeDismissed && !progress.completed.includes(lesson.slug) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent-soft/30 px-4 py-3">
          <span>وصلت سابقاً إلى المحطة {saved + 1} ({STATIONS[saved].label}).</span>
          <span className="flex gap-2">
            <button onClick={() => go(saved)} className="rounded-xl bg-accent px-4 py-1.5 text-sm font-semibold text-accent-fg">
              تابع من هناك
            </button>
            <button onClick={() => setResumeDismissed(true)} className="rounded-xl px-3 py-1.5 text-sm text-muted hover:text-fg">
              ابدأ من البداية
            </button>
          </span>
        </div>
      )}

      {/* Station rail */}
      <ol className="mb-8 grid grid-cols-7 gap-1.5">
        {STATIONS.map((st, k) => {
          const state = k === s ? "current" : k <= reached ? "visited" : "ahead";
          return (
            <li key={st.id}>
              <button onClick={() => go(k)} className="group w-full text-start">
                <div className={`h-1.5 rounded-full transition-colors ${state === "ahead" ? "bg-line" : "bg-accent"} ${state === "current" ? "" : "opacity-60 group-hover:opacity-100"}`} />
                <div className={`mt-2 text-xs font-semibold md:text-sm ${state === "current" ? "text-accent" : "text-muted"}`}>
                  <span className="code me-1 opacity-60">{k + 1}</span>
                  <span className="hidden sm:inline">{st.label}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <motion.section
          key={s}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-line bg-surface/60 p-5 shadow-sm backdrop-blur md:p-8"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-accent">المحطة {s + 1} · {station.label}</div>
              <h2 className="text-2xl font-bold">{s === 0 ? lesson.problem.title : station.id === "code" && langs.length < 2 ? "اكتبه وشغّله بنفسك" : station.hint}</h2>
            </div>
            {(station.id === "watch" || station.id === "code") && langs.length > 1 && <LangSwitch value={lang} onChange={setLang} langs={langs} />}
          </div>

          {station.id === "problem" && (
            <>
              <p className="mb-5 text-lg leading-8 text-muted">{lesson.problem.body}</p>
              {Demo && <Demo />}
            </>
          )}

          {station.id === "watch" && (
            <>
              {sceneReady ? (
                <ScenePlayer scene={scene} lang={lang} interval={scene.steps[0]?.frames ? 1400 : 2200} />
              ) : (
                <div className="rounded-2xl border border-line bg-surface p-6 text-muted">يجهّز الأنميشن...</div>
              )}
              {lesson.scene.notes?.[lang] && (
                <div className="mt-4 rounded-xl border-s-4 border-accent bg-accent-soft/30 p-4 leading-7">{lesson.scene.notes[lang]}</div>
              )}
            </>
          )}

          {station.id === "play" &&
            (lesson.playground.kind === "sql" ? (
              <div className="space-y-4">
                <p className="leading-8 text-muted">{lesson.playground.intro}</p>
                <CodeRunner starter={lesson.playground.starter} lang="sql" setup={lesson.playground.setup} />
                <ul className="list-disc space-y-1 ps-5 text-sm leading-7">
                  {lesson.playground.challenges.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </div>
            ) : lesson.playground.kind === "sandbox" ? (
              <Sandbox intro={lesson.playground.intro} examples={lesson.playground.examples} />
            ) : (
              <TracePlayground
                intro={lesson.playground.intro}
                starter={lesson.playground.starter}
                challenges={lesson.playground.challenges}
                lang={lesson.playground.kind === "html" ? "html" : lesson.playground.kind === "trace" ? lesson.playground.lang : "js"}
              />
            ))}

          {station.id === "predict" && <Predict items={lesson.predict} />}

          {station.id === "code" && (
            <div className="space-y-5">
              <p className="leading-8 text-muted">{lesson.code.intro}</p>
              {sceneReady && <ScenePlayer key={"c" + lang} scene={scene} lang={lang} bare autoPlay loop interval={scene.steps[0]?.frames ? 1200 : 2200} />}
              {lesson.scene.notes?.[lang] && <p className="rounded-xl bg-surface-2 p-4 leading-7">{lesson.scene.notes[lang]}</p>}
              {lesson.code.runnerLang !== "text" && (
                <div>
                  <h3 className="mb-2 font-bold">جرّب بنفسك</h3>
                  <CodeRunner starter={lesson.code.runnerStarter} lang={lesson.code.runnerLang} setup={lesson.code.runnerSetup} />
                </div>
              )}
            </div>
          )}

          {station.id === "practice" && <Exercises items={lesson.exercises} />}

          {station.id === "quiz" && (
            <>
              <Quiz items={lesson.quiz} onFinish={finishQuiz} />
              {completed && (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/roadmap" className="rounded-xl border border-line px-5 py-2.5 font-semibold">
                    خارطة الطريق
                  </Link>
                  {lesson.next && (
                    <Link href={PUBLISHED_LESSONS.has(lesson.next) ? `/learn/${lesson.next}` : "/roadmap"} className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-fg">
                      التالي: {lessonTitle(lesson.next)}
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </motion.section>

      <div className="mt-6 flex justify-between">
        <button onClick={() => go(s - 1)} disabled={s === 0} className="flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2.5 disabled:opacity-30">
          <Back /> السابق
        </button>
        {s < STATIONS.length - 1 && (
          <button onClick={() => go(s + 1)} className="flex items-center gap-1 rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-fg">
            {STATIONS[s + 1].label} <Next />
          </button>
        )}
      </div>
    </main>
  );
}
