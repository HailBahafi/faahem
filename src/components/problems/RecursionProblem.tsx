"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const TOP = 4; // the outer doll
const OVERFLOW = 9; // frames before the broken version blows the stack

type Phase = "down" | "up" | "done" | "overflow";
type Frame = { n: number; answer: number | null };

function Doll({ n, open }: { n: number; open: boolean }) {
  const size = 26 + n * 10;
  return (
    <motion.div
      layout
      animate={{ opacity: open ? 0.35 : 1, y: open ? -6 : 0 }}
      className="flex flex-col items-center gap-1"
    >
      <div
        className={`flex items-center justify-center rounded-t-full rounded-b-2xl border-2 ${open ? "border-dashed border-line" : "border-accent bg-accent/20"}`}
        style={{ width: size * 0.75, height: size }}
      >
        <span className="code text-xs font-bold text-num">{n}</span>
      </div>
    </motion.div>
  );
}

/** Nesting dolls: open each doll until the smallest (the base case), then close back up carrying the count. */
export default function RecursionProblem() {
  const [broken, setBroken] = useState(false);
  const [stack, setStack] = useState<Frame[]>([]);
  const [phase, setPhase] = useState<Phase>("down");
  const [carry, setCarry] = useState<number | null>(null);

  const reset = (b = broken) => {
    setBroken(b);
    setStack([]);
    setPhase("down");
    setCarry(null);
  };

  const step = () => {
    if (phase === "down") {
      const top = stack[stack.length - 1];
      if (top && top.n === 1 && !broken) {
        // The base case: no doll inside, answer 1 and return.
        setCarry(1);
        setStack(stack.slice(0, -1));
        setPhase(stack.length === 1 ? "done" : "up");
        return;
      }
      const next = top ? top.n - 1 : TOP;
      const grown = [...stack, { n: next, answer: null }];
      setStack(grown);
      if (grown.length >= OVERFLOW) setPhase("overflow");
      return;
    }
    if (phase === "up" && carry !== null) {
      const answer = carry + 1;
      setCarry(answer);
      setStack(stack.slice(0, -1));
      if (stack.length === 1) setPhase("done");
    }
  };

  const top = stack[stack.length - 1];
  // A doll stays open while its frame is on the stack; returning closes it again.
  const opened = (n: number) => stack.some((f) => f.n === n);
  const atBase = phase === "down" && !broken && top?.n === 1;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-4">
          <div className="code rounded-2xl bg-code p-5 text-sm leading-7" dir="ltr">
            <div>
              <span className="text-bool">function</span> count(n) {"{"}
            </div>
            <div className={`pl-6 ${broken ? "text-muted line-through" : top?.n === 1 ? "rounded bg-accent/25 font-bold" : ""}`}>
              if (n === 1) return 1;
            </div>
            <div className={`pl-6 ${top && !(top.n === 1 && !broken) ? "rounded bg-accent/25 font-bold" : ""}`}>
              return 1 + count(n - 1);
            </div>
            <div>{"}"}</div>
          </div>

          <div className="flex min-h-24 items-end justify-center gap-3 rounded-2xl border border-line bg-surface p-4" dir="ltr">
            {Array.from({ length: TOP }, (_, k) => TOP - k).map((n) => (
              <Doll key={n} n={n} open={opened(n)} />
            ))}
          </div>
        </div>

        <div className="flex min-w-44 flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm text-muted">المكدّس</div>
          <motion.div
            animate={phase === "overflow" ? { x: [0, -4, 4, -4, 0] } : { x: 0 }}
            transition={{ repeat: phase === "overflow" ? Infinity : 0, duration: 0.4 }}
            className="flex flex-col-reverse gap-1"
            dir="ltr"
          >
            <div className="code rounded-lg border border-line px-2 py-1 text-xs text-muted">global</div>
            <AnimatePresence>
              {stack.map((f, k) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`code flex justify-between gap-3 rounded-lg px-2 py-1 text-xs font-bold ${
                    phase === "overflow" ? "bg-err/20 text-err" : k === stack.length - 1 ? "bg-accent text-accent-fg" : "border border-line"
                  }`}
                >
                  <span>count({f.n})</span>
                  <span className="opacity-70">{f.n === 1 && !broken ? "1" : "1 + ?"}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence>
            {carry !== null && (
              <motion.div key={carry} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className="code mt-2 text-center text-2xl font-bold text-num">
                ↓ {carry}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={phase === "done" || phase === "overflow"}
          onClick={step}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          {phase === "up" ? "أغلق وارجع بالعدد" : atBase ? "القاع: ارجع بـ 1" : "افتح الدمية التالية"}
        </motion.button>
        {!broken && phase === "done" && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => reset(true)} className="rounded-2xl border border-err px-4 py-3 font-bold text-err">
            احذف سطر القاع وجرّب
          </motion.button>
        )}
        {(stack.length > 0 || phase !== "down" || broken) && (
          <button onClick={() => reset(false)} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {phase === "down" && !broken && (
          <p className="text-muted">
            {top?.n === 1 ? "أصغر دمية: لا شيء في داخلها. هذا هو القاع، وجوابه 1." : "كل دمية تسأل التي في داخلها. البرج يكبر إطاراً فوق إطار."}
          </p>
        )}
        {phase === "up" && <p className="text-muted">كل إطار ينتظر جواباً من فوقه، يضيف 1 لنفسه، ثم يُزال ويسلّم العدد لمن تحته.</p>}
        {phase === "done" && !broken && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            {carry} دمى. لا أحد عدّها كلها: كل دمية حلّت مسألة أصغر بدمية واحدة، والقاع أوقف النزول. هذه هي <b>العودية</b>.
          </motion.p>
        )}
        {phase === "down" && broken && <p className="text-err">بلا سطر القاع، لا شيء يقول للدمية الصغرى: توقّفي. استمر بالضغط.</p>}
        {phase === "overflow" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="code text-err" dir="ltr">
            RangeError: Maximum call stack size exceeded
          </motion.p>
        )}
      </div>
    </div>
  );
}
