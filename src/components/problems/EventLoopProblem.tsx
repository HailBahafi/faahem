"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const CODE = [
  "function greet() {",
  '  console.log("hi");',
  "}",
  'console.log("start");',
  'setTimeout(() => console.log("timer"), 0);',
  'Promise.resolve().then(() => console.log("promise"));',
  "greet();",
  'console.log("end");',
];

const CHIP: Record<string, string> = { main: "main()", greet: "greet()", timer: "timer cb", promise: "then cb" };

type State = { line: number | null; stack: string[]; web: string[]; micro: string[]; tasks: string[]; out: string[]; loop?: boolean; say: string };

const S = (line: number | null, stack: string[], web: string[], micro: string[], tasks: string[], out: string[], say: string, loop = false): State => ({
  line,
  stack,
  web,
  micro,
  tasks,
  out,
  say,
  loop,
});

const STEPS: State[] = [
  S(null, [], [], [], [], [], "اضغط «التالي» وتابع كل دالة: أين تذهب، ومتى تعمل."),
  S(4, ["main"], [], [], [], ["start"], "السكربت كله يعمل داخل main. سطر عادي: يطبع فوراً."),
  S(5, ["main"], ["timer"], [], [], ["start"], "setTimeout تسلّم المؤقت للمتصفح وتعود فوراً. JavaScript لا ينتظر."),
  S(5, ["main"], [], [], ["timer"], ["start"], "انتهى مؤقت الصفر. دالته تنزل إلى طابور المهام، والمكدّس ما زال مشغولاً."),
  S(6, ["main"], [], ["promise"], ["timer"], ["start"], "الوعد محلول، فدالة then تنتظر في طابور المهام الصغيرة."),
  S(7, ["main", "greet"], [], ["promise"], ["timer"], ["start"], "استدعاء عادي: greet يُكدّس فوق main."),
  S(2, ["main", "greet"], [], ["promise"], ["timer"], ["start", "hi"], "greet تطبع hi ثم تخرج من المكدّس."),
  S(8, ["main"], [], ["promise"], ["timer"], ["start", "hi", "end"], "آخر سطر في السكربت."),
  S(null, [], [], ["promise"], ["timer"], ["start", "hi", "end"], "المكدّس فارغ! حلقة الأحداث تتحرك الآن: microtasks أولاً.", true),
  S(6, ["promise"], [], [], ["timer"], ["start", "hi", "end", "promise"], "دالة then تعمل."),
  S(null, [], [], [], ["timer"], ["start", "hi", "end", "promise"], "فارغ مرة أخرى، وmicrotasks فارغ: خذ مهمة واحدة من tasks.", true),
  S(5, ["timer"], [], [], [], ["start", "hi", "end", "promise", "timer"], "دالة المؤقت تعمل أخيراً، مع أن مؤقتها كان صفراً."),
  S(null, [], [], [], [], ["start", "hi", "end", "promise", "timer"], "لا شيء ينتظر. الحلقة تدور حتى يصل حدث جديد.", true),
];

function Area({ title, items, tone, reverse }: { title: string; items: string[]; tone: string; reverse?: boolean }) {
  return (
    <div className="flex min-h-36 flex-col rounded-2xl border border-line bg-surface p-2">
      <div className="mb-2 text-center text-xs font-semibold text-muted">{title}</div>
      <div className={`flex flex-1 gap-1.5 ${reverse ? "flex-col-reverse" : "flex-col"}`}>
        {items.map((id) => (
          <motion.div
            key={id}
            layoutId={id}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className={`code rounded-lg px-2 py-1 text-center text-xs font-bold ${tone}`}
          >
            {CHIP[id] ?? id}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LoopIcon({ spinning }: { spinning: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={`h-7 w-7 ${spinning ? "text-accent" : "text-muted"}`}
      animate={{ rotate: spinning ? 360 : 0 }}
      transition={spinning ? { repeat: Infinity, duration: 1.2, ease: "linear" } : { duration: 0.3 }}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
    >
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v4h-4" />
    </motion.svg>
  );
}

function Visualiser() {
  const [k, setK] = useState(0);
  const [auto, setAuto] = useState(false);
  const s = STEPS[k];

  useEffect(() => {
    if (!auto) return;
    if (k >= STEPS.length - 1) return setAuto(false);
    const t = setTimeout(() => setK(k + 1), 1300);
    return () => clearTimeout(t);
  }, [auto, k]);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1fr_1.15fr]" dir="ltr">
        <div className="code rounded-2xl bg-code p-4 text-sm leading-7 text-white">
          {CODE.map((l, i) => (
            <div key={i} className={`flex gap-3 rounded px-1 transition-colors ${s.line === i + 1 ? "bg-accent/30 font-bold" : ""}`}>
              <span className="w-4 shrink-0 text-right text-white/30">{i + 1}</span>
              <span className="whitespace-pre">{l}</span>
            </div>
          ))}
          <div className="mt-3 border-t border-white/10 pt-2 text-xs text-white/50">console</div>
          <div className="min-h-6">
            {s.out.map((o, i) => (
              <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="me-3 text-str">
                {o}
              </motion.span>
            ))}
          </div>
        </div>

        <LayoutGroup>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Area title="Call stack" items={s.stack} tone="bg-accent text-accent-fg" reverse />
            <Area title="Web APIs" items={s.web} tone="bg-surface-2 text-num" />
            <Area title="Microtasks" items={s.micro} tone="bg-surface-2 text-bool" />
            <Area title="Tasks" items={s.tasks} tone="bg-surface-2 text-str" />
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-surface p-3" dir="rtl">
            <LoopIcon spinning={!!s.loop} />
            <p className="text-sm leading-6">{s.say}</p>
          </div>
        </LayoutGroup>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={() => setK(Math.max(0, k - 1))} disabled={k === 0} className="rounded-xl border border-line px-4 py-2 text-sm disabled:opacity-40">
          السابق
        </button>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => setK(Math.min(STEPS.length - 1, k + 1))}
          disabled={k === STEPS.length - 1}
          className="rounded-xl bg-accent px-5 py-2 font-bold text-accent-fg disabled:opacity-40"
        >
          التالي
        </motion.button>
        <button
          onClick={() => {
            if (k === STEPS.length - 1) setK(0);
            setAuto(!auto);
          }}
          className="rounded-xl border border-line px-4 py-2 text-sm"
        >
          {auto ? "إيقاف" : "تشغيل تلقائي"}
        </button>
        <span className="ms-auto text-sm text-muted">
          {k} / {STEPS.length - 1}
        </span>
      </div>
    </div>
  );
}

const FREEZE_MS = 3500;

function Freezer() {
  const [frozenAt, setFrozenAt] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [queue, setQueue] = useState<number[]>([]);
  const [running, setRunning] = useState<number | null>(null);
  const [handled, setHandled] = useState(0);
  const nextId = useRef(1);

  // The long loop owns the stack until it finishes.
  useEffect(() => {
    if (frozenAt === null) return;
    const t = setInterval(() => {
      const p = (Date.now() - frozenAt) / FREEZE_MS;
      if (p >= 1) {
        setFrozenAt(null);
        setProgress(0);
      } else setProgress(p);
    }, 50);
    return () => clearInterval(t);
  }, [frozenAt]);

  // Event loop: when the stack is empty, take one waiting click handler.
  useEffect(() => {
    if (frozenAt !== null || running !== null || !queue.length) return;
    const t = setTimeout(() => {
      setRunning(queue[0]);
      setQueue((q) => q.slice(1));
    }, 120);
    return () => clearTimeout(t);
  }, [frozenAt, running, queue]);

  useEffect(() => {
    if (running === null) return;
    const t = setTimeout(() => {
      setHandled((h) => h + 1);
      setRunning(null);
    }, 380);
    return () => clearTimeout(t);
  }, [running]);

  const clickMe = () => setQueue((q) => [...q, nextId.current++]);
  const freeze = () => {
    if (frozenAt === null) setFrozenAt(Date.now());
  };
  const frozen = frozenAt !== null;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1fr_1.15fr]">
        <div className={`flex flex-col items-center justify-center gap-4 rounded-2xl border p-5 transition-colors ${frozen ? "border-err/50 bg-err/10" : "border-line bg-surface"}`}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={clickMe}
            className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20"
          >
            انقرني
          </motion.button>
          <div className="text-sm text-muted">
            نقرات خُدمت: <b className="code text-2xl text-num">{handled}</b>
          </div>
          <button
            onClick={freeze}
            disabled={frozen}
            className="rounded-xl border border-err/60 px-4 py-2 text-sm font-bold text-err disabled:opacity-40"
          >
            جمّد الصفحة (حلقة طويلة)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2" dir="ltr">
          <div className="flex min-h-40 flex-col rounded-2xl border border-line bg-surface p-2">
            <div className="mb-2 text-center text-xs font-semibold text-muted">Call stack</div>
            <div className="flex flex-1 flex-col-reverse gap-1.5">
              {frozen && (
                <div className="code overflow-hidden rounded-lg bg-err/20 text-xs font-bold text-err">
                  <div className="px-2 py-1">while (busy) {"{}"}</div>
                  <div className="h-1 bg-err" style={{ width: `${progress * 100}%` }} />
                </div>
              )}
              <AnimatePresence>
                {running !== null && (
                  <motion.div
                    key={running}
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="code rounded-lg bg-accent px-2 py-1 text-center text-xs font-bold text-accent-fg"
                  >
                    onClick #{running}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex min-h-40 flex-col rounded-2xl border border-line bg-surface p-2">
            <div className="mb-2 text-center text-xs font-semibold text-muted">Tasks ({queue.length})</div>
            <div className="flex flex-1 flex-col gap-1.5">
              <AnimatePresence initial={false}>
                {queue.map((id) => (
                  <motion.div
                    key={id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    className="code rounded-lg bg-surface-2 px-2 py-1 text-center text-xs font-bold text-str"
                  >
                    click #{id}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 min-h-12">
        {frozen ? (
          <p className="text-err">الحلقة تحتل المكدّس. صفحة حقيقية الآن لا ترسم ولا تستجيب، لكن نقراتك لا تضيع: كل واحدة تنتظر في الطابور.</p>
        ) : queue.length || running !== null ? (
          <p className="text-muted">فرغ المكدّس، فحلقة الأحداث تأخذ النقرات واحدة واحدة بترتيب وصولها.</p>
        ) : handled > 0 ? (
          <p className="text-ok">كل نقرة خُدمت، لكن فقط حين فرغ المكدّس. مكدّس واحد، شيء واحد في كل لحظة.</p>
        ) : (
          <p className="text-muted">انقر الزر مرتين، ثم جمّد الصفحة وانقر عدة مرات أثناء التجميد.</p>
        )}
      </div>
    </div>
  );
}

/** The event loop made visible: step a program through stack, Web APIs and both queues, then freeze the stack and watch clicks pile up. */
export default function EventLoopProblem() {
  const [tab, setTab] = useState<"steps" | "freeze">("steps");
  return (
    <div>
      <div className="mb-4 inline-flex rounded-xl border border-line bg-surface p-1">
        {(
          [
            ["steps", "خطوة خطوة"],
            ["freeze", "جمّد الصفحة"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${tab === id ? "bg-accent text-accent-fg" : "text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "steps" ? <Visualiser /> : <Freezer />}
    </div>
  );
}
