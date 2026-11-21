"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Mode = "async" | "sync";

const JOBS = 8;
const JOB_TICKS = 10; // one hash = 10 ticks of work
const PING_EVERY = 2; // a small request arrives every 2 ticks
const POOL = 4;

interface Sim {
  tick: number;
  queue: number; // hashes waiting for a pool thread
  threads: number[]; // remaining ticks per pool thread (0 = idle)
  mainBusy: number; // ticks the main thread is still blocked
  done: number;
  answered: number;
  waiting: number; // pings that arrived while the main thread was blocked
  maxWait: number;
}

const fresh = (): Sim => ({ tick: 0, queue: 0, threads: Array(POOL).fill(0), mainBusy: 0, done: 0, answered: 0, waiting: 0, maxWait: 0 });

/** A Node server answering pings while it hashes 8 passwords: on libuv's pool, or with the *Sync call. */
export default function JsNodeInternalsProblem() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [view, setView] = useState<Sim>(fresh);
  const sim = useRef<Sim>(fresh());

  useEffect(() => {
    const id = setInterval(() => {
      const s = sim.current;
      s.tick++;
      // pool threads pick up queued work and make progress
      s.threads = s.threads.map((left) => {
        if (left === 0 && s.queue > 0) {
          s.queue--;
          left = JOB_TICKS;
        }
        if (left > 0) {
          left--;
          if (left === 0) s.done++;
        }
        return left;
      });
      // the main thread: blocked by synchronous hashing, or free to answer
      if (s.mainBusy > 0) {
        s.mainBusy--;
        if (s.mainBusy % JOB_TICKS === 0) s.done++;
      }
      if (s.tick % PING_EVERY === 0) s.waiting++;
      if (s.mainBusy === 0) {
        s.answered += s.waiting;
        s.waiting = 0;
      }
      s.maxWait = Math.max(s.maxWait, s.waiting);
      setView({ ...s, threads: [...s.threads] });
    }, 120);
    return () => clearInterval(id);
  }, []);

  const start = (m: Mode) => {
    const s = sim.current;
    if (m === "async") s.queue += JOBS;
    else s.mainBusy += JOBS * JOB_TICKS;
    s.done = 0;
    s.maxWait = 0;
    setMode(m);
  };

  const blocked = view.mainBusy > 0;

  return (
    <div>
      <div className="flex flex-wrap gap-2" dir="ltr">
        <motion.button whileTap={{ scale: 0.94 }} onClick={() => start("async")} className="code rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-fg">
          8 × crypto.pbkdf2(…, cb)
        </motion.button>
        <motion.button whileTap={{ scale: 0.94 }} onClick={() => start("sync")} className="code rounded-xl border border-line bg-surface px-3 py-2 text-xs font-bold">
          8 × crypto.pbkdf2Sync(…)
        </motion.button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className={`rounded-2xl border p-4 ${blocked ? "border-err bg-surface" : "border-line bg-surface"}`}>
          <div className="text-sm font-semibold">الخيط الرئيسي (V8 وحلقة الأحداث)</div>
          <div className="code mt-3 rounded-xl bg-code p-3 text-xs" dir="ltr">
            {blocked ? <span className="text-err">busy: pbkdf2Sync… ({view.mainBusy} ticks left)</span> : <span className="text-ok">idle: answering pings</span>}
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span>طلبات ping أُجيبت</span>
            <span className="code text-num">{view.answered}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>طلبات تنتظر الآن</span>
            <motion.span key={view.waiting} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className={`code ${view.waiting > 0 ? "text-err" : "text-muted"}`}>
              {view.waiting}
            </motion.span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm font-semibold">مجموعة خيوط libuv</div>
          <div className="mt-3 space-y-2" dir="ltr">
            {view.threads.map((left, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="code w-16 text-xs text-muted">thread {i}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-code">
                  <motion.div animate={{ width: `${left === 0 ? 0 : ((JOB_TICKS - left) / JOB_TICKS) * 100}%` }} className="h-full rounded-full bg-accent" />
                </div>
              </div>
            ))}
          </div>
          <div className="code mt-3 flex justify-between text-xs text-muted" dir="ltr">
            <span>queued: {view.queue}</span>
            <span>hashes done: {view.done}</span>
          </div>
        </div>
      </div>

      {mode === "sync" && !blocked && view.maxWait > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          النسخة المتزامنة شغلت الخيط الوحيد الذي يشغّل JavaScript، فوقف الرد على الجميع: تراكم {view.maxWait} طلباً.
        </motion.p>
      )}
      {mode === "async" && view.queue === 0 && view.threads.every((t) => t === 0) && view.done > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          التشفير عمل على أربعة خيوط في الخلفية، أربعة ثم أربعة، والخيط الرئيسي لم يتوقف عن الرد لحظة.
        </motion.p>
      )}
    </div>
  );
}
