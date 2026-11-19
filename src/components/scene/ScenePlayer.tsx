"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { Lang, Scene } from "@/lib/types";
import { LANGS, sceneLangs } from "@/lib/types";
import { Back, Next, Pause, Play, Reset } from "../icons";
import CodePanel from "./CodePanel";
import MachineView from "./MachineView";
import MemoryView from "./MemoryView";

interface Props {
  scene: Scene;
  lang?: Lang;
  /** Milliseconds per step at 1x. */
  interval?: number;
  autoPlay?: boolean;
  loop?: boolean;
  /** Hide controls and narration (used for the landing-page demo). */
  bare?: boolean;
  onEnd?: () => void;
}

export default function ScenePlayer({ scene, lang = "js", interval = 2200, autoPlay, loop, bare, onEnd }: Props) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(!!autoPlay);
  const [speed, setSpeed] = useState(1);
  const last = scene.steps.length - 1;
  const step = scene.steps[i];
  const shownLang = scene.code[lang] !== undefined ? lang : (sceneLangs(scene)[0] ?? "js");
  const code = scene.code[shownLang] ?? "";

  const go = useCallback((n: number) => setI(Math.max(0, Math.min(last, n))), [last]);
  const stepBy = useCallback((d: number) => setI((x) => Math.max(0, Math.min(last, x + d))), [last]);

  useEffect(() => {
    if (!playing) return;
    if (i >= last) {
      if (loop) {
        const t = setTimeout(() => setI(0), 2600 / speed);
        return () => clearTimeout(t);
      }
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((x) => x + 1), interval / speed);
    return () => clearTimeout(t);
  }, [playing, i, last, loop, speed, interval]);

  useEffect(() => {
    if (i === last && !playing) onEnd?.();
  }, [i, last, playing, onEnd]);

  let output: string[] | undefined;
  for (let k = i; k >= 0; k--) if (scene.steps[k].output) { output = scene.steps[k].output; break; }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") stepBy(1);
    else if (e.key === "ArrowRight") stepBy(-1);
    else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
  };

  return (
    <div tabIndex={bare ? -1 : 0} onKeyDown={onKey} className="outline-none">
      <div className={`grid gap-4 ${step.frames ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]" : "md:grid-cols-2"}`}>
        <CodePanel code={code} line={step.line} output={output} title={LANGS.find((l) => l.id === shownLang)?.label} />
        <div className="rounded-2xl border border-line bg-surface/70 p-4">
          {step.frames ? (
            <MachineView step={step} />
          ) : (
            <MemoryView cells={step.memory} changed={step.changed} read={step.read} copy={step.copy} error={step.error} />
          )}
        </div>
      </div>

      {!bare && (
        <>
          <div className="mt-4 min-h-[76px] rounded-2xl border border-line bg-surface p-4">
            <div className="mb-1 text-xs font-semibold text-accent">
              الخطوة {i + 1} من {last + 1}
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-[17px] leading-8"
              >
                {step.say}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
              <button aria-label="إعادة" onClick={() => { setI(0); setPlaying(false); }} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg"><Reset /></button>
              <button aria-label="السابق" onClick={() => stepBy(-1)} disabled={i === 0} className="rounded-lg p-2 hover:bg-surface-2 disabled:opacity-30"><Back /></button>
              <button
                aria-label={playing ? "إيقاف" : "تشغيل"}
                onClick={() => { if (i === last) setI(0); setPlaying((p) => !p); }}
                className="rounded-lg bg-accent p-2 px-4 text-accent-fg hover:opacity-90"
              >
                {playing ? <Pause /> : <Play />}
              </button>
              <button aria-label="التالي" onClick={() => stepBy(1)} disabled={i === last} className="rounded-lg p-2 hover:bg-surface-2 disabled:opacity-30"><Next /></button>
            </div>
            {last < 30 ? (
              <div className="flex flex-1 items-center gap-1.5">
                {scene.steps.map((_, k) => (
                  <button
                    key={k}
                    aria-label={`الخطوة ${k + 1}`}
                    onClick={() => go(k)}
                    className={`h-2 flex-1 rounded-full transition-colors ${k <= i ? "bg-accent" : "bg-line"}`}
                  />
                ))}
              </div>
            ) : (
              <input
                type="range"
                min={0}
                max={last}
                value={i}
                onChange={(e) => { setPlaying(false); go(Number(e.target.value)); }}
                aria-label="اختر الخطوة"
                className="flex-1 accent-[var(--accent)]"
              />
            )}
            <button
              onClick={() => setSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 0.6 : 1))}
              className="code rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-muted hover:text-fg"
            >
              {speed}x
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">لوحة المفاتيح: ← التالي، → السابق، المسافة تشغيل/إيقاف</p>
        </>
      )}
    </div>
  );
}
