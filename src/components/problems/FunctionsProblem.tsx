"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Mode = "copy" | "recipe";
type Cup = { ok: boolean };

const RECIPE = ["boilWater();", "addTea();", "addSugar();"];
// The third hand-made copy carries a typo, as copies do.
const COPY_WITH_TYPO = ["boilWater();", "addTea();", "addSalt();"];

function CupIcon({ ok }: { ok: boolean }) {
  return (
    <motion.div initial={{ scale: 0, y: -10 }} animate={{ scale: 1, y: 0 }} className="flex flex-col items-center gap-1">
      <div className="relative h-10 w-9 overflow-hidden rounded-b-xl border-2 border-line">
        <div className={`absolute inset-x-0 bottom-0 h-3/4 ${ok ? "bg-str" : "bg-err"}`} />
      </div>
      <span className={`text-xs font-bold ${ok ? "text-ok" : "text-err"}`}>{ok ? "تمام" : "مالح"}</span>
    </motion.div>
  );
}

/** Three cups of tea: copying the steps three times versus one named recipe called three times. */
export default function FunctionsProblem() {
  const [mode, setMode] = useState<Mode>("copy");
  const [copies, setCopies] = useState(0);
  const [calls, setCalls] = useState(0);
  const [cups, setCups] = useState<Cup[]>([]);
  const [frame, setFrame] = useState<{ id: number; line: number } | null>(null);

  // A running call: walk the recipe one line at a time, then pop the frame and hand back a cup.
  useEffect(() => {
    if (!frame) return;
    const t = setTimeout(() => {
      if (frame.line < RECIPE.length - 1) return setFrame({ ...frame, line: frame.line + 1 });
      setFrame(null);
      setCups((c) => [...c, { ok: true }]);
    }, 420);
    return () => clearTimeout(t);
  }, [frame]);

  const copy = () => {
    if (copies >= 3) return;
    setCopies(copies + 1);
    setCups((c) => [...c, { ok: copies !== 2 }]);
  };
  const call = () => {
    if (frame || calls >= 3) return;
    setCalls(calls + 1);
    setFrame({ id: calls + 1, line: 0 });
  };
  const toRecipe = () => {
    setMode("recipe");
    setCups([]);
    setCalls(0);
  };
  const reset = () => {
    setMode("copy");
    setCopies(0);
    setCalls(0);
    setCups([]);
    setFrame(null);
  };

  const lineCount = mode === "copy" ? copies * 3 : 5 + calls;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="code min-h-48 rounded-2xl bg-code p-5 text-sm leading-7" dir="ltr">
          {mode === "copy" ? (
            <AnimatePresence initial={false}>
              {Array.from({ length: copies }, (_, k) => (
                <motion.div key={k} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="mb-2">
                  <div className="text-muted">{`// cup ${k + 1}`}</div>
                  {(k === 2 ? COPY_WITH_TYPO : RECIPE).map((l, j) => (
                    <div key={j} className={k === 2 && j === 2 ? "font-bold text-err" : ""}>
                      {l}
                    </div>
                  ))}
                </motion.div>
              ))}
              {copies === 0 && <div className="text-muted">{"// empty"}</div>}
            </AnimatePresence>
          ) : (
            <>
              <div>
                <span className="text-bool">function</span> makeTea() {"{"}
              </div>
              {RECIPE.map((l, j) => (
                <div key={j} className={`pl-6 transition-colors ${frame?.line === j ? "rounded bg-accent/25 font-bold" : ""}`}>
                  {l}
                </div>
              ))}
              <div>{"}"}</div>
              <AnimatePresence initial={false}>
                {Array.from({ length: calls }, (_, k) => (
                  <motion.div key={k} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="text-num">
                    makeTea();
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          )}
        </div>

        <div className="flex min-w-44 flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
          {mode === "recipe" && (
            <div>
              <div className="mb-1 text-sm text-muted">المكدّس</div>
              <div className="flex flex-col-reverse gap-1" dir="ltr">
                <div className="code rounded-lg border border-line px-2 py-1 text-xs text-muted">global</div>
                <AnimatePresence>
                  {frame && (
                    <motion.div
                      key={frame.id}
                      initial={{ opacity: 0, y: -24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -24 }}
                      className="code rounded-lg bg-accent px-2 py-1 text-xs font-bold text-accent-fg"
                    >
                      makeTea #{frame.id}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          <div className="flex min-h-16 flex-wrap gap-3">
            {cups.map((c, k) => (
              <CupIcon key={`${mode}-${k}`} ok={c.ok} />
            ))}
          </div>
          <div className="text-sm text-muted">
            أسطر مكتوبة: <b className="code text-num">{lineCount}</b>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {mode === "copy" ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            disabled={copies >= 3}
            onClick={copy}
            className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
          >
            انسخ التعليمات لكوب جديد
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.92 }}
            disabled={!!frame || calls >= 3}
            onClick={call}
            className="code rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
            dir="ltr"
          >
            makeTea()
          </motion.button>
        )}
        {mode === "copy" && copies === 3 && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={toRecipe} className="rounded-2xl border border-accent px-4 py-3 font-bold">
            اكتب الوصفة مرة واحدة باسم
          </motion.button>
        )}
        {(copies > 0 || mode === "recipe") && (
          <button onClick={reset} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {mode === "copy" && copies < 3 && <p className="text-muted">اصنع ثلاثة أكواب.</p>}
        {mode === "copy" && copies === 3 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            9 أسطر لثلاثة أكواب، وخطأ في نسخة واحدة أفسد كوباً. ولو أردت تغيير الوصفة، فعليك تعديل كل النسخ.
          </motion.p>
        )}
        {mode === "recipe" && calls < 3 && !frame && (
          <p className="text-muted">اضغط makeTea() وراقب: إطار جديد يُوضع فوق المكدّس، ينفّذ الوصفة، ثم يُزال ويسلّمك كوباً.</p>
        )}
        {mode === "recipe" && calls === 3 && !frame && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            الوصفة مكتوبة مرة واحدة، وكل كوب سطر واحد. أصلحها في مكان واحد فتصلح كل الأكواب. هذه هي <b>الدالة</b>.
          </motion.p>
        )}
      </div>
    </div>
  );
}
