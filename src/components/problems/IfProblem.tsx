"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

const LIMIT = 20;

/** A weather adviser that says the same thing at every temperature until the learner adds a fork. */
export default function IfProblem() {
  const [temp, setTemp] = useState(10);
  const [forked, setForked] = useState(false);
  const [maxTemp, setMaxTemp] = useState(10);
  const [roads, setRoads] = useState<{ cold: boolean; hot: boolean }>({ cold: false, hot: false });

  const cold = temp < LIMIT;

  function move(t: number) {
    setTemp(t);
    setMaxTemp((m) => Math.max(m, t));
    if (forked) setRoads((r) => ({ cold: r.cold || t < LIMIT, hot: r.hot || t >= LIMIT }));
  }

  function addFork() {
    setForked(true);
    setRoads({ cold: cold, hot: !cold });
  }

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <span className="font-semibold">الحرارة</span>
          <span className={`code text-3xl font-bold ${cold ? "text-bool" : "text-err"}`} dir="ltr">
            {temp}°C
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={45}
          value={temp}
          onChange={(e) => move(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--accent)]"
          dir="ltr"
          aria-label="temperature"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel title="برنامج بلا شرط" bad>
          <pre className="code rounded-xl bg-code p-3 text-sm" dir="ltr">
            <span className="text-fg">advice = </span>
            <span className="text-str">&quot;Take a coat&quot;</span>
          </pre>
          <Advice text="خذ معطفاً" tick={0} wrong={!cold} />
        </Panel>

        <Panel title="برنامج فيه مفترق if">
          {forked ? (
            <>
              <pre className="code rounded-xl bg-code p-3 text-sm leading-7" dir="ltr">
                <div>
                  <span className="text-fg">if (temp &lt; {LIMIT})</span>{" "}
                  <span className={cold ? "text-ok" : "text-err"}>{"→ " + String(cold)}</span>
                </div>
                <Road active={cold}>
                  advice = <span className="text-str">&quot;Take a coat&quot;</span>
                </Road>
                <div className="text-fg">else</div>
                <Road active={!cold}>
                  advice = <span className="text-str">&quot;Drink water&quot;</span>
                </Road>
              </pre>
              <Advice text={cold ? "خذ معطفاً" : "اشرب ماءً وابقَ في الظل"} tick={cold ? 1 : 2} />
            </>
          ) : (
            <div className="flex h-full min-h-32 items-center justify-center">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={addFork}
                disabled={maxTemp < 30}
                className="rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
              >
                أضف مفترق طرق
              </motion.button>
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-4 min-h-12 text-muted">
        {!forked && maxTemp < 30 && <p>حرّك المؤشر نحو الحر.</p>}
        {!forked && maxTemp >= 30 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {temp}°C ومعطف؟ البرنامج يمشي في طريق واحد مهما حدث. أضف له مفترقاً.
          </motion.p>
        )}
        {forked && !(roads.cold && roads.hot) && <p>الآن حرّك المؤشر إلى الجهة الأخرى من {LIMIT}°C.</p>}
        {forked && roads.cold && roads.hot && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            الشرط يصبح <b className="text-bool">true</b> أو <b className="text-bool">false</b> أولاً، ثم يمشي البرنامج في{" "}
            <b className="text-fg">طريق واحد فقط</b>. الطريق الآخر لا يعمل أبداً. هذا هو <b className="text-fg">if</b>.
          </motion.p>
        )}
      </div>
    </div>
  );
}

function Panel({ title, bad, children }: { title: string; bad?: boolean; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-3 rounded-2xl border p-5 ${bad ? "border-line bg-surface" : "border-accent/50 bg-accent-soft/20"}`}>
      <div className="font-semibold">{title}</div>
      {children}
    </div>
  );
}

function Road({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.3, x: active ? 0 : 8 }}
      className={`rounded-md ps-4 ${active ? "bg-accent/15 text-fg" : "text-muted line-through"}`}
    >
      {children}
    </motion.div>
  );
}

function Advice({ text, tick, wrong }: { text: string; tick: number; wrong?: boolean }) {
  return (
    <div className="relative flex h-20 items-center justify-center overflow-hidden rounded-xl bg-code">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={tick}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1, x: wrong ? [0, -6, 6, -4, 4, 0] : 0 }}
          exit={{ y: 30, opacity: 0 }}
          className={`text-2xl font-bold ${wrong ? "text-err" : "text-ok"}`}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
