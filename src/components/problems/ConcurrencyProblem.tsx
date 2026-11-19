"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const N = 1000;
const NAMES = ["A", "B"];
type Phase = "read" | "add" | "write";
type Worker = { done: number; phase: Phase; local: number; readVersion: number; waiting: boolean };
type Sim = { counter: number; writes: number; workers: Worker[]; holder: number; current: number; lock: boolean; lost: { v: number; who: number } | null };

const fresh = (lock: boolean): Sim => ({
  counter: 0,
  writes: 0,
  workers: [0, 1].map(() => ({ done: 0, phase: "read" as Phase, local: 0, readVersion: 0, waiting: false })),
  holder: -1,
  current: 0,
  lock,
  lost: null,
});

/** One CPU step: the scheduler keeps the current worker or switches, then that worker does read, add or write. */
function microStep(s: Sim) {
  const alive = [0, 1].filter((i) => s.workers[i].done < N);
  if (!alive.length) return;
  let i = alive.includes(s.current) && Math.random() < 0.85 ? s.current : alive[Math.floor(Math.random() * alive.length)];
  // With the lock on, a worker that wants to read while the other holds the lock waits; the other runs.
  if (s.lock && s.workers[i].phase === "read" && s.holder !== -1 && s.holder !== i) {
    s.workers[i].waiting = true;
    i = s.holder;
  }
  s.current = i;
  const w = s.workers[i];
  w.waiting = false;
  if (w.phase === "read") {
    if (s.lock) s.holder = i;
    w.local = s.counter;
    w.readVersion = s.writes;
    w.phase = "add";
  } else if (w.phase === "add") {
    w.local += 1;
    w.phase = "write";
  } else {
    // Someone wrote since we read: our write erases their increment.
    if (s.writes !== w.readVersion && !s.lost) s.lost = { v: w.local - 1, who: i };
    s.counter = w.local;
    s.writes += 1;
    w.done += 1;
    w.phase = "read";
    if (s.lock) s.holder = -1;
  }
}

type Frame = { say: string; reg: (number | null)[]; counter: number; active: number | null };

function replayFrames(v: number, x: number): Frame[] {
  const y = 1 - x;
  const X = NAMES[x];
  const Y = NAMES[y];
  const reg = (a: number | null, b: number | null) => (x === 0 ? [a, b] : [b, a]);
  return [
    { say: `العدّاد ${v}. العامل ${X} يقرأه إلى سجلّه داخل نواته.`, reg: reg(v, null), counter: v, active: x },
    { say: `قبل أن يكتب ${X}، ينتقل التنفيذ إلى ${Y} على النواة الأخرى، فيقرأ ${v} أيضاً.`, reg: reg(v, v), counter: v, active: y },
    { say: `${X} يضيف 1 في سجلّه: ${v + 1}. العدّاد المشترك لم يتغير بعد.`, reg: reg(v + 1, v), counter: v, active: x },
    { say: `${Y} يضيف 1 في سجلّه: ${v + 1} أيضاً، لأنه بدأ من ${v}.`, reg: reg(v + 1, v + 1), counter: v, active: y },
    { say: `${X} يكتب ${v + 1}.`, reg: reg(v + 1, v + 1), counter: v + 1, active: x },
    { say: `${Y} يكتب ${v + 1} فوقها. زيادتان، والعدّاد زاد واحداً فقط: ضاعت زيادة ${X}.`, reg: reg(v + 1, v + 1), counter: v + 1, active: y },
  ];
}

/** Two workers increment one shared counter 1000 times each; with and without a mutex, plus a slow replay of one lost update. */
export default function ConcurrencyProblem() {
  const [lock, setLock] = useState(false);
  const [snap, setSnap] = useState<Sim>(() => fresh(false));
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<{ value: number; lock: boolean }[]>([]);
  const [replay, setReplay] = useState<number | null>(null);
  const sim = useRef<Sim>(fresh(false));

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const s = sim.current;
      for (let k = 0; k < 50; k++) microStep(s);
      const finished = s.workers.every((w) => w.done >= N);
      setSnap({ ...s, workers: s.workers.map((w) => ({ ...w })) });
      if (finished) {
        setRunning(false);
        setHistory((h) => [...h.slice(-7), { value: s.counter, lock: s.lock }]);
      }
    }, 16);
    return () => clearInterval(t);
  }, [running]);

  const frames = snap.lost ? replayFrames(snap.lost.v, snap.lost.who) : [];
  useEffect(() => {
    if (replay === null || replay >= frames.length - 1) return;
    const t = setTimeout(() => setReplay(replay + 1), 1800);
    return () => clearTimeout(t);
  }, [replay, frames.length]);

  const start = () => {
    sim.current = fresh(lock);
    setSnap(fresh(lock));
    setReplay(null);
    setRunning(true);
  };

  const finished = snap.workers.every((w) => w.done >= N);
  const lostCount = 2 * N - snap.counter;
  const frame = replay !== null ? frames[replay] : null;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]" dir="ltr">
        {snap.workers.map((w, i) => (
          <div
            key={i}
            className={`rounded-2xl border bg-surface p-3 transition-colors ${i === 1 ? "sm:order-3" : ""} ${
              running && snap.current === i ? "border-accent" : "border-line"
            }`}
          >
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>worker {NAMES[i]}</span>
              <span className="code text-xs text-muted">
                {w.done >= N ? "done" : w.waiting ? "waiting for lock" : running ? w.phase : "ready"}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full bg-accent transition-[width]" style={{ width: `${(w.done / N) * 100}%` }} />
            </div>
            <div className="code mt-2 flex justify-between text-xs">
              <span className="text-muted">+1 × {w.done}</span>
              <span>
                local = <b className="text-num">{w.local}</b>
              </span>
            </div>
          </div>
        ))}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-3 sm:order-2">
          <div className="text-xs text-muted">counter</div>
          <motion.div key={finished ? "end" : "run"} animate={finished && lostCount > 0 ? { scale: [1, 1.15, 1] } : {}} className={`code text-4xl font-bold ${finished ? (lostCount ? "text-err" : "text-ok") : "text-num"}`}>
            {snap.counter}
          </motion.div>
          <div className="code text-xs text-muted">expected 2000</div>
          {snap.lock && <div className="code mt-1 text-xs text-bool">lock: {snap.holder === -1 ? "free" : NAMES[snap.holder]}</div>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <motion.button whileTap={{ scale: 0.94 }} onClick={start} disabled={running} className="rounded-xl bg-accent px-5 py-2 font-bold text-accent-fg disabled:opacity-40">
          شغّل العاملين
        </motion.button>
        <button
          onClick={() => setLock(!lock)}
          disabled={running}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40 ${lock ? "border-bool bg-bool/10 text-bool" : "border-line text-muted"}`}
        >
          <span className={`relative h-5 w-9 rounded-full transition-colors ${lock ? "bg-bool" : "bg-surface-2"}`}>
            <motion.span layout className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow ${lock ? "right-0.5" : "left-0.5"}`} />
          </span>
          <span className="code">Mutex</span>
        </button>
        {finished && snap.lost && !snap.lock && (
          <button onClick={() => setReplay(0)} className="rounded-xl border border-err/60 px-4 py-2 text-sm font-bold text-err">
            أعد خسارة واحدة ببطء
          </button>
        )}
        <div className="ms-auto flex flex-wrap gap-1.5" dir="ltr">
          <AnimatePresence initial={false}>
            {history.map((h, k) => (
              <motion.span
                key={history.length - k + "-" + h.value}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`code rounded-lg px-2 py-0.5 text-xs font-bold ${h.value === 2 * N ? "bg-ok/15 text-ok" : "bg-err/15 text-err"}`}
                title={h.lock ? "with Mutex" : "no lock"}
              >
                {h.lock ? "M " : ""}
                {h.value}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {frame && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl border border-err/40 bg-err/5 p-3">
            <div className="grid grid-cols-3 gap-2 text-center" dir="ltr">
              {[0, 2, 1].map((slot) =>
                slot === 2 ? (
                  <div key="c" className="rounded-xl border border-line bg-surface p-2">
                    <div className="text-xs text-muted">counter (shared RAM)</div>
                    <motion.div key={frame.counter} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="code text-2xl font-bold text-num">
                      {frame.counter}
                    </motion.div>
                  </div>
                ) : (
                  <div key={slot} className={`rounded-xl border p-2 ${frame.active === slot ? "border-accent bg-accent/10" : "border-line bg-surface"}`}>
                    <div className="text-xs text-muted">core {slot + 1}: {NAMES[slot]}.local</div>
                    <div className="code text-2xl font-bold text-str">{frame.reg[slot] ?? "—"}</div>
                  </div>
                ),
              )}
            </div>
            <p className="mt-2 text-sm leading-6">{frame.say}</p>
            <div className="mt-1 text-xs text-muted">
              {replay! + 1} / {frames.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 min-h-12 text-sm">
        {running ? (
          <p className="text-muted">العاملان يتناوبان على النواتين: يقرأ، يضيف، يكتب. أحياناً يقرأ أحدهما قبل أن يكتب الآخر.</p>
        ) : finished && lostCount > 0 ? (
          <p className="text-err">ضاعت {lostCount} زيادة. كل واحدة: قرأ العاملان الرقم نفسه، فكتب أحدهما فوق الآخر. شغّل مرة أخرى: الرقم يتغير.</p>
        ) : finished ? (
          <p className="text-ok">2000 بالضبط. {snap.lock ? "القفل يجعل «اقرأ، أضف، اكتب» قطعة واحدة: لا يقرأ أحد حتى يكتب حامل القفل." : "هذه المرة لم يتداخل أحد. لكن هل تضمن ذلك؟ شغّل مرة أخرى."}</p>
        ) : (
          <p className="text-muted">كل عامل يزيد العدّاد 1000 مرة. المتوقع 2000. اضغط «شغّل» عدة مرات، ثم شغّل Mutex.</p>
        )}
      </div>
    </div>
  );
}
