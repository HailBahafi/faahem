"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

type State = "pending" | "fulfilled";

/** One promise as an object: state, value, waiting callbacks, plus the microtask queue that runs them. */
export default function JsPromisesInsideProblem() {
  const [state, setState] = useState<State>("pending");
  const [value, setValue] = useState<number | null>(null);
  const [waiting, setWaiting] = useState<number[]>([]);
  const [queue, setQueue] = useState<number[]>([]);
  const [out, setOut] = useState<string[]>([]);
  const [note, setNote] = useState("سجّل then أولاً، أو ابدأ بـ resolve. كلا الترتيبين يعمل.");
  const [seq, setSeq] = useState(1);

  const addThen = () => {
    const id = seq;
    setSeq(id + 1);
    if (state === "pending") {
      setWaiting((w) => [...w, id]);
      setNote("الوعد pending: الدالة تنتظر في قائمة الوعد نفسه.");
    } else {
      setQueue((q) => [...q, id]);
      setNote("الوعد مستقر: الدالة لا تعمل الآن، بل تدخل طابور microtasks.");
    }
  };

  const resolve = (v: number) => {
    if (state !== "pending") {
      setNote(`resolve(${v}) تجاهلها الوعد: الحالة ليست pending. الوعد يستقر مرة واحدة.`);
      return;
    }
    setState("fulfilled");
    setValue(v);
    setQueue((q) => [...q, ...waiting]);
    setWaiting([]);
    setNote(waiting.length ? "استقر الوعد، فانتقلت المنتظرات إلى الطابور. لم تعمل بعد!" : "استقر الوعد، ولا أحد ينتظره بعد.");
  };

  const drain = () => {
    if (!queue.length) {
      setNote("الطابور فارغ.");
      return;
    }
    setOut((o) => [...o, ...queue.map((id) => `then #${id} → ${value}`)]);
    setQueue([]);
    setNote("المكدّس فرغ، ففرّغ المحرّك الطابور كله. هذا هو الوقت الوحيد الذي تعمل فيه دوال then.");
  };

  const reset = () => {
    setState("pending");
    setValue(null);
    setWaiting([]);
    setQueue([]);
    setOut([]);
    setSeq(1);
    setNote("سجّل then أولاً، أو ابدأ بـ resolve. كلا الترتيبين يعمل.");
  };

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-3" dir="ltr">
        <motion.div
          layout
          className={`rounded-2xl border p-4 ${state === "pending" ? "border-line bg-surface" : "border-accent/60 bg-accent-soft/20"}`}
        >
          <div className="text-xs font-semibold text-muted">promise p</div>
          <div className="code mt-2 text-sm">
            state: <span className={state === "pending" ? "text-str" : "text-ok"}>&quot;{state}&quot;</span>
          </div>
          <div className="code text-sm">
            value: <span className="text-num">{value ?? "undefined"}</span>
          </div>
          <div className="code mt-2 text-xs text-muted">waiting:</div>
          <Chips items={waiting} tone="bg-code text-white" />
        </motion.div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-xs font-semibold text-muted">microtask queue</div>
          <Chips items={queue} tone="bg-accent text-accent-fg" />
        </div>
        <div className="code rounded-2xl bg-code p-4 text-sm text-white">
          <div className="text-xs text-white/50">console</div>
          {out.map((o, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-str">
              {o}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" dir="ltr">
        <Btn onClick={addThen}>p.then(print)</Btn>
        <Btn onClick={() => resolve(5)}>resolve(5)</Btn>
        <Btn onClick={() => resolve(9)}>resolve(9)</Btn>
        <Btn onClick={drain} primary>
          run microtasks
        </Btn>
        <button onClick={reset} className="text-sm text-muted hover:text-fg">
          reset
        </button>
      </div>
      <motion.p key={note} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
        {note}
      </motion.p>
    </div>
  );
}

function Chips({ items, tone }: { items: number[]; tone: string }) {
  return (
    <div className="mt-1 flex min-h-8 flex-wrap gap-1.5">
      <AnimatePresence>
        {items.map((id) => (
          <motion.span
            key={id}
            layoutId={`cb-${id}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`code rounded-lg px-2 py-1 text-xs font-bold ${tone}`}
          >
            then #{id}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Btn({ children, onClick, primary }: { children: ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`code rounded-xl px-4 py-2 text-sm font-bold ${primary ? "bg-accent text-accent-fg" : "border border-line bg-surface"}`}
    >
      {children}
    </motion.button>
  );
}
