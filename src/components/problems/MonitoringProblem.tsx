"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Level = "INFO" | "WARN" | "ERROR";
type Cause = "traffic" | "db" | "bug" | "leak";
interface Point { rps: number; err: number; p95: number; mem: number; up: boolean }
interface Log { n: number; time: string; level: Level; text: string }
interface Sim {
  t: number;
  hist: Point[];
  logs: Log[];
  mem: number;
  down: number;
  streak: { err: number; p95: number; health: number };
  firing: string[];
  mystery: Cause | null;
  since: number;
  guess: Cause | null;
  wasDown: boolean;
}

const CAP = 250;
const KEEP = 32;
const CAUSES: { id: Cause; label: string; why: string }[] = [
  { id: "traffic", label: "ازدحام زوار", why: "rps قفز فوق طاقة الخادم، فامتلأ الطابور: البطء أولاً ثم 503 overloaded." },
  { id: "db", label: "قاعدة بيانات بطيئة", why: "rps ثابت لكن p95 قفز، والسجل يقول slow query ثم db timeout." },
  { id: "bug", label: "خطأ في آخر نشر", why: "سطر deploy ثم ERROR TypeError في cart.js:42 على /checkout فقط، و p95 طبيعي." },
  { id: "leak", label: "تسرّب ذاكرة", why: "الذاكرة تصعد بلا توقف، ثم heap out of memory وإعادة تشغيل، ثم تعود تصعد." },
];

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clock = (t: number) => `${String(10 + Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

function fresh(): Sim {
  return { t: 0, hist: [], logs: [], mem: 38, down: 0, streak: { err: 0, p95: 0, health: 0 }, firing: [], mystery: null, since: 0, guess: null, wasDown: false };
}

/** One simulated minute: compute the metrics from the knobs and the hidden cause, write log lines, evaluate the alert rules. */
function tick(s: Sim, traffic: number, dbMs: number, crashed: boolean): Sim {
  const t = s.t + 1;
  const time = clock(t);
  const m = s.mystery;
  const lines: [Level, string][] = [];
  let n = s.logs.length ? s.logs[s.logs.length - 1].n : 0;

  const rpsIn = Math.round((m === "traffic" ? 430 : traffic) + rnd(-8, 8));
  const db = m === "db" ? 2200 : dbMs;
  let mem = s.mem + (m === "leak" ? rnd(5, 8) : rnd(-1.5, 1.5));
  if (m !== "leak") mem += (38 + rpsIn / 25 - mem) * 0.3;
  let down = Math.max(0, s.down - 1);
  if (mem >= 100) {
    lines.push(["ERROR", "FATAL ERROR: JavaScript heap out of memory"], ["ERROR", "process exited (code 134)"], ["INFO", "systemd: shop.service restarting"]);
    mem = 36;
    down = 2;
  }
  const isDown = crashed || down > 0;

  let p: Point;
  if (isDown) {
    p = { rps: 0, err: 100, p95: 0, mem: crashed ? 0 : mem, up: false };
    if (crashed && !s.wasDown) lines.push(["ERROR", "process exited (code 1): Error: listen EADDRINUSE"]);
    lines.push(["WARN", "monitor: GET /api/health failed: connection refused"]);
  } else {
    const over = Math.max(0, rpsIn - CAP) / rpsIn;
    const p95 = Math.round(160 + rnd(-15, 25) + db + (over > 0 ? 500 + over * 3000 : 0));
    let err = 0.4 + rnd(0, 0.5) + over * 55 + (db > 1500 ? ((db - 1500) / 1500) * 30 : 0) + (m === "bug" ? rnd(10, 14) : 0);
    err = Math.min(100, Math.round(err * 10) / 10);
    p = { rps: Math.min(rpsIn, CAP + 20), err, p95, mem, up: true };
    const path = ["GET /products", "POST /cart", "GET /products/42", "POST /checkout"][Math.floor(rnd(0, 4))];
    lines.push(["INFO", `${path} 200 ${Math.round(rnd(60, 160) + db * 0.8)}ms`]);
    if (over > 0) {
      lines.push(["WARN", `request queue ${Math.round(rpsIn - CAP)} waiting, all workers busy`]);
      if (Math.random() < 0.8) lines.push(["ERROR", "GET /products 503 Service Unavailable (overloaded)"]);
    }
    if (db > 600) lines.push(["WARN", `slow query ${Math.round(db + rnd(-80, 80))}ms: SELECT * FROM orders WHERE user_id = $1`]);
    if (db > 1500) lines.push(["ERROR", "POST /checkout 500 db timeout after 2000ms"]);
    if (m === "bug") lines.push(["ERROR", "POST /checkout 500 TypeError: Cannot read properties of undefined (reading 'price') at cart.js:42"]);
    if (m === "leak" && mem > 70) lines.push(["WARN", `heap used ${(mem * 0.02).toFixed(1)}GB of 2.0GB`]);
    if (Math.random() < 0.3) lines.push(["INFO", `GET /api/health 200 {ok: true, db: up}`]);
  }

  const streak = {
    err: p.err > 5 ? s.streak.err + 1 : 0,
    p95: p.p95 > 1000 ? s.streak.p95 + 1 : 0,
    health: p.up ? 0 : s.streak.health + 1,
  };
  const firing = [
    ...(streak.health >= 2 ? ["HealthCheckFailing: /api/health لا يجيب منذ دقيقتين"] : []),
    ...(streak.err >= 3 ? [`HighErrorRate: ${p.err}% > 5% منذ 3 دقائق`] : []),
    ...(streak.p95 >= 3 ? [`SlowResponses: p95 ${p.p95}ms > 1000ms منذ 3 دقائق`] : []),
  ];
  const logs = [...s.logs, ...lines.map(([level, text]) => ({ n: ++n, time, level, text }))].slice(-60);
  return { ...s, t, mem, down, hist: [...s.hist, p].slice(-KEEP), logs, streak, firing, wasDown: isDown };
}

function Chart({ label, unit, values, max, limit }: { label: string; unit: string; values: number[]; max: number; limit?: number }) {
  const W = 120;
  const H = 40;
  const x = (k: number) => (k / (KEEP - 1)) * W;
  const y = (v: number) => H - Math.min(1, v / max) * (H - 2) - 1;
  const pts = values.map((v, k) => `${x(k + KEEP - values.length)},${y(v)}`).join(" ");
  const cur = values[values.length - 1] ?? 0;
  const bad = limit !== undefined && cur > limit;
  return (
    <div className={`rounded-xl border bg-surface p-2 ${bad ? "border-err/70" : "border-line"}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="code text-[11px] text-muted" dir="ltr">{label}</span>
        <span className={`code text-sm font-bold ${bad ? "text-err" : "text-fg"}`} dir="ltr">{Math.round(cur * 10) / 10}{unit}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-1 h-12 w-full">
        {limit !== undefined && <line x1={0} x2={W} y1={y(limit)} y2={y(limit)} stroke="var(--err)" strokeWidth={0.6} strokeDasharray="3 2" vectorEffect="non-scaling-stroke" />}
        <polyline points={pts} fill="none" stroke={bad ? "var(--err)" : "var(--accent)"} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

const LEVEL: Record<Level, string> = { INFO: "text-muted", WARN: "text-num", ERROR: "text-err" };

/** A live dashboard of a fake shop: knobs inject trouble, charts and alerts react, and a hidden incident must be traced in the logs. */
export default function MonitoringProblem() {
  const [sim, setSim] = useState<Sim>(fresh);
  const [traffic, setTraffic] = useState(60);
  const [dbMs, setDbMs] = useState(0);
  const [crashed, setCrashed] = useState(false);
  const [filter, setFilter] = useState<Level | "ALL">("ALL");

  useEffect(() => {
    const id = setInterval(() => setSim((s) => tick(s, traffic, dbMs, crashed)), 700);
    return () => clearInterval(id);
  }, [traffic, dbMs, crashed]);

  const last = sim.hist[sim.hist.length - 1];
  const col = (k: keyof Omit<Point, "up">) => sim.hist.map((p) => p[k]);
  const shown = sim.logs.filter((l) => filter === "ALL" || l.level === filter || (filter === "WARN" && l.level === "ERROR")).slice(-14);
  const canGuess = sim.mystery && (sim.firing.length > 0 || sim.t - sim.since > 7);

  const startMystery = () => {
    setTraffic(60);
    setDbMs(0);
    setCrashed(false);
    const cause = CAUSES[Math.floor(Math.random() * CAUSES.length)].id;
    setSim((s) => ({
      ...s,
      mystery: cause,
      since: s.t,
      guess: null,
      logs: cause === "bug" ? [...s.logs, { n: (s.logs[s.logs.length - 1]?.n ?? 0) + 1, time: clock(s.t), level: "INFO" as Level, text: "deploy shop:c9d started (3 files changed)" }] : s.logs,
    }));
  };
  const fix = () => setSim((s) => ({ ...s, mystery: null, guess: null, mem: 40 }));

  const slider = "w-full accent-[var(--accent)]";
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="code text-muted" dir="ltr">shop.example · {clock(sim.t)} · 1 tick = 1 min</span>
        <span className={`code rounded-lg px-2 py-0.5 text-xs font-bold ${last && !last.up ? "bg-err/20 text-err" : "bg-ok/15 text-ok"}`} dir="ltr">
          /api/health {last && !last.up ? "DOWN" : "200 ok"}
        </span>
      </div>

      <AnimatePresence>
        {sim.firing.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0, x: [0, -3, 3, -2, 0] }} exit={{ opacity: 0 }} className="mt-2 rounded-xl border border-err bg-err/15 p-2 text-sm text-err">
            <b>تنبيه على هاتفك:</b>
            {sim.firing.map((f) => <div key={f} className="code text-xs" dir="ltr">{f}</div>)}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Chart label="requests/s" unit="" values={col("rps")} max={300} />
        <Chart label="error rate" unit="%" values={col("err")} max={40} limit={5} />
        <Chart label="latency p95" unit="ms" values={col("p95")} max={3000} limit={1000} />
        <Chart label="memory" unit="%" values={col("mem")} max={100} limit={90} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[220px_1fr]">
        <div className="space-y-3 rounded-2xl border border-line bg-surface p-3 text-sm">
          <label className="block">
            <span className="text-xs text-muted">الزوار: <b className="code text-fg">{traffic}</b> طلب/ث (الطاقة {CAP})</span>
            <input type="range" min={20} max={500} step={10} value={traffic} onChange={(e) => setTraffic(+e.target.value)} disabled={!!sim.mystery} className={slider} />
          </label>
          <label className="block">
            <span className="text-xs text-muted">بطء قاعدة البيانات: <b className="code text-fg">{dbMs}ms</b></span>
            <input type="range" min={0} max={3000} step={100} value={dbMs} onChange={(e) => setDbMs(+e.target.value)} disabled={!!sim.mystery} className={slider} />
          </label>
          <button onClick={() => setCrashed((c) => !c)} disabled={!!sim.mystery} className={`w-full rounded-xl border px-3 py-2 font-semibold disabled:opacity-40 ${crashed ? "border-ok text-ok" : "border-err text-err"}`}>
            {crashed ? "أعد تشغيل العملية" : "أسقط العملية"}
          </button>
          <motion.button whileTap={{ scale: 0.94 }} onClick={sim.mystery ? fix : startMystery} className="w-full rounded-xl bg-accent px-3 py-2 font-bold text-accent-fg">
            {sim.mystery ? "أوقف الحادث" : "حادث غامض"}
          </motion.button>
        </div>

        <div className="rounded-2xl bg-code p-2">
          <div className="flex gap-1 text-xs" dir="ltr">
            {(["ALL", "WARN", "ERROR"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`code rounded-md px-2 py-0.5 ${filter === f ? "bg-accent text-accent-fg" : "text-muted"}`}>
                {f === "ALL" ? "all" : f === "WARN" ? "warn+" : "error"}
              </button>
            ))}
            <span className="ml-auto text-muted">logs</span>
          </div>
          <div className="code mt-1 h-56 space-y-0.5 overflow-hidden text-[11px] leading-snug" dir="ltr">
            {shown.map((l) => (
              <motion.div key={l.n} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="truncate">
                <span className="text-muted">{l.time}</span> <span className={`font-bold ${LEVEL[l.level]}`}>{l.level.padEnd(5)}</span> <span className={l.level === "ERROR" ? "text-err" : ""}>{l.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 min-h-[3rem] text-sm">
        {sim.mystery && !canGuess && <p className="text-muted">شيء ما يحدث، والسبب مخفي. راقب الرسوم وانتظر التنبيه، ثم اقرأ السجلات.</p>}
        {canGuess && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-semibold">ما السبب؟ ابدأ من التنبيه، ثم الرسم، ثم السجلات (جرّب تصفية error).</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CAUSES.map((c) => (
                <button key={c.id} onClick={() => setSim((s) => ({ ...s, guess: c.id }))} className={`rounded-xl border px-3 py-1.5 text-sm ${sim.guess === c.id ? (c.id === sim.mystery ? "border-ok bg-ok/15 text-ok" : "border-err bg-err/10 text-err") : "border-line bg-surface"}`}>
                  {c.label}
                </button>
              ))}
            </div>
            {sim.guess && (
              <p className={`mt-2 ${sim.guess === sim.mystery ? "text-ok" : "text-err"}`}>
                {sim.guess === sim.mystery
                  ? `صحيح. ${CAUSES.find((c) => c.id === sim.mystery)!.why} اضغط «أوقف الحادث».`
                  : `ليس هذا. ${CAUSES.find((c) => c.id === sim.guess)!.why} هل ترى هذا في الرسوم والسجلات الآن؟`}
              </p>
            )}
          </motion.div>
        )}
        {!sim.mystery && <p className="text-muted">حرّك الزوار فوق {CAP}، أو أبطئ قاعدة البيانات فوق 1500ms، أو أسقط العملية: أي رسم يتحرك أولاً، ومتى يرنّ التنبيه؟</p>}
      </div>
    </div>
  );
}
