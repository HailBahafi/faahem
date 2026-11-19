"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Seg = { kind: "cpu" | "wait"; d: number };
type Run = { state: string; start: number; end: number };

const PROFILES: { id: string; label: string; segs: Seg[] }[] = [
  { id: "wait", label: "طلبات تنتظر قاعدة البيانات", segs: [{ kind: "cpu", d: 10 }, { kind: "wait", d: 80 }, { kind: "cpu", d: 10 }] },
  { id: "cpu", label: "طلبات تحسب كثيراً (تصغير صورة)", segs: [{ kind: "cpu", d: 60 }] },
];
const N = 6;
const GO_CORES = 4;

/** Ticks 1ms at a time: cores take ready requests FIFO; waiting does not hold a core. */
function simulate(profile: Seg[], cores: number) {
  const reqs = Array.from({ length: N }, () => ({ seg: 0, left: profile[0].d, done: -1 }));
  const queue: number[] = profile[0].kind === "cpu" ? reqs.map((_, i) => i) : [];
  const running: (number | null)[] = Array(cores).fill(null);
  const states: string[][] = reqs.map(() => []);
  let t = 0;
  while (reqs.some((r) => r.done < 0) && t < 5000) {
    for (let c = 0; c < cores; c++) if (running[c] === null && queue.length) running[c] = queue.shift()!;
    reqs.forEach((r, i) => {
      if (r.done >= 0) return;
      const core = running.indexOf(i);
      if (profile[r.seg].kind === "wait") { states[i].push("w"); r.left--; }
      else if (core >= 0) { states[i].push("c"); r.left--; }
      else states[i].push("q");
    });
    t++;
    reqs.forEach((r, i) => {
      if (r.done >= 0 || r.left > 0) return;
      const c = running.indexOf(i);
      if (c >= 0) running[c] = null;
      r.seg++;
      if (r.seg >= profile.length) { r.done = t; return; }
      r.left = profile[r.seg].d;
      if (profile[r.seg].kind === "cpu") queue.push(i);
    });
  }
  const rows: Run[][] = states.map((st) => {
    const runs: Run[] = [];
    st.forEach((s, k) => {
      const last = runs[runs.length - 1];
      if (last && last.state === s && last.end === k) last.end = k + 1;
      else runs.push({ state: s, start: k, end: k + 1 });
    });
    return runs;
  });
  return { rows, done: reqs.map((r) => r.done), total: t };
}

const COLOR: Record<string, string> = { c: "bg-accent", w: "bg-line", q: "bg-err/25" };

/** The same burst of requests on Node's one thread and on Go's goroutines over 4 cores. */
export default function GoServerProblem() {
  const [pid, setPid] = useState("cpu");
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const raf = useRef(0);
  const profile = PROFILES.find((p) => p.id === pid)!;
  const node = simulate(profile.segs, 1);
  const go = simulate(profile.segs, GO_CORES);
  const max = Math.max(node.total, go.total);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  function send() {
    cancelAnimationFrame(raf.current);
    setRunning(true);
    const t0 = performance.now();
    const dur = 2600;
    const tick = (now: number) => {
      const f = Math.min(1, (now - t0) / dur);
      setT(f * max);
      if (f < 1) raf.current = requestAnimationFrame(tick);
      else setRunning(false);
    };
    raf.current = requestAnimationFrame(tick);
  }
  function pick(id: string) {
    cancelAnimationFrame(raf.current);
    setRunning(false);
    setT(0);
    setPid(id);
  }

  const finished = t >= max && max > 0;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PROFILES.map((p) => (
          <button key={p.id} onClick={() => pick(p.id)} className={`rounded-xl px-3 py-1.5 text-sm font-bold ${p.id === pid ? "bg-accent text-accent-fg" : "border border-line bg-surface-2"}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Lane title="Node: خيط واحد" sub="حلقة أحداث واحدة تتنقل بين الطلبات" sim={node} t={t} max={max} />
        <Lane title={`Go: goroutine لكل طلب`} sub={`${GO_CORES} أنوية تعمل معاً`} sim={go} t={t} max={max} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-5 rounded bg-accent" /> يعمل على المعالج</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-5 rounded bg-line" /> ينتظر (قاعدة البيانات)</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-5 rounded bg-err/25" /> جاهز لكن ينتظر دوره</span>
      </div>

      <div className="mt-5">
        <motion.button whileTap={{ scale: 0.92 }} onClick={send} disabled={running} className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40">
          أرسل {N} طلبات معاً
        </motion.button>
      </div>

      {finished && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          {pid === "cpu" ? (
            <>الحساب يشغل المعالج نفسه: خيط Node الوحيد يحسب طلباً بعد طلب (<b className="text-fg">{node.total}ms</b>)، و Go يوزّع الطلبات على الأنوية (<b className="text-fg">{go.total}ms</b>). جرّب الآن طلبات تنتظر.</>
          ) : (
            <>حين يكون أغلب الوقت انتظاراً، يتقارب الاثنان (<b className="text-fg">{node.total}ms</b> مقابل <b className="text-fg">{go.total}ms</b>): Node يرسل الاستعلام ويخدم غيره أثناء الانتظار. الفرق الكبير يظهر في الحساب.</>
          )}
        </motion.p>
      )}
    </div>
  );
}

function Lane({ title, sub, sim, t, max }: { title: string; sub: string; sim: ReturnType<typeof simulate>; t: number; max: number }) {
  const lastDone = Math.max(...sim.done);
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-bold">{title}</div>
        <div className="code text-sm" dir="ltr">{t >= lastDone ? <span className="text-ok">{lastDone}ms</span> : <span className="text-muted">{Math.round(t)}ms</span>}</div>
      </div>
      <div className="mb-3 text-xs text-muted">{sub}</div>
      <div className="space-y-1.5" dir="ltr">
        {sim.rows.map((runs, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="code w-6 text-xs text-muted">#{i + 1}</span>
            <div className="relative h-4 flex-1 overflow-hidden rounded bg-surface-2">
              {runs.filter((r) => r.start < t).map((r, k) => (
                <div key={k} className={`absolute top-0 h-full ${COLOR[r.state]}`} style={{ left: `${(r.start / max) * 100}%`, width: `${((Math.min(r.end, t) - r.start) / max) * 100}%` }} />
              ))}
            </div>
            <span className={`code w-12 text-end text-xs ${t >= sim.done[i] ? "text-ok" : "text-muted/40"}`}>{t >= sim.done[i] ? `${sim.done[i]}` : "…"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
