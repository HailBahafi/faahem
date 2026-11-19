"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Instr =
  | { op: "LOAD"; r: number; addr: number }
  | { op: "ADD"; r: number; r2: number }
  | { op: "STORE"; r: number; addr: number }
  | { op: "JUMPIF"; r: number; r2: number; to: number }
  | { op: "HALT" };

/** Boxes 0-6 hold the program, 8-11 hold data. The loop adds b to R1 until it reaches the limit. */
const PROGRAM: Instr[] = [
  { op: "LOAD", r: 0, addr: 8 },
  { op: "LOAD", r: 1, addr: 9 },
  { op: "LOAD", r: 2, addr: 10 },
  { op: "ADD", r: 0, r2: 1 },
  { op: "STORE", r: 0, addr: 11 },
  { op: "JUMPIF", r: 0, r2: 2, to: 3 },
  { op: "HALT" },
];
const DATA: Record<number, { label: string; value: number }> = {
  8: { label: "a", value: 2 },
  9: { label: "b", value: 3 },
  10: { label: "حد", value: 12 },
  11: { label: "c", value: 0 },
};
const BOXES = 12;
const STAGES = ["جلب", "فهم", "تنفيذ"] as const;
const SPEEDS = [
  { label: "1 في الثانية", perSec: 1 },
  { label: "5 في الثانية", perSec: 5 },
  { label: "20 في الثانية", perSec: 20 },
  { label: "معالج حقيقي: 3 مليارات في الثانية", perSec: 3e9 },
];

const R = (r: number) => `R${r + 1}`;
function text(i: Instr) {
  switch (i.op) {
    case "LOAD": return `LOAD ${R(i.r)}, [${i.addr}]`;
    case "ADD": return `ADD ${R(i.r)}, ${R(i.r2)}`;
    case "STORE": return `STORE ${R(i.r)}, [${i.addr}]`;
    case "JUMPIF": return `JUMP ${i.to} if ${R(i.r)}<${R(i.r2)}`;
    case "HALT": return "HALT";
  }
}
function meaning(i: Instr) {
  switch (i.op) {
    case "LOAD": return `انسخ ما في الصندوق ${i.addr} إلى ${R(i.r)}`;
    case "ADD": return `اجمع ${R(i.r)} + ${R(i.r2)} وضع الناتج في ${R(i.r)}`;
    case "STORE": return `اكتب ما في ${R(i.r)} في الصندوق ${i.addr}`;
    case "JUMPIF": return `قارن: هل ${R(i.r)} أصغر من ${R(i.r2)}؟ إن كان نعم اقفز إلى ${i.to}`;
    case "HALT": return "انتهى البرنامج: توقّف";
  }
}

interface Machine {
  ip: number;
  stage: 0 | 1 | 2; // the stage that runs on the next tick
  ir: Instr | null;
  regs: number[];
  ram: number[];
  note: string;
  touched: number[]; // boxes read or written on the last tick
  halted: boolean;
  done: number; // instructions completed
}

function fresh(): Machine {
  const ram = Array.from({ length: BOXES }, (_, k) => DATA[k]?.value ?? 0);
  return { ip: 0, stage: 0, ir: null, regs: [0, 0, 0], ram, note: "", touched: [], halted: false, done: 0 };
}

function tick(m: Machine): Machine {
  if (m.halted) return m;
  if (m.stage === 0) {
    const ir = PROGRAM[m.ip];
    return { ...m, ir, stage: 1, touched: [m.ip], note: `جلب التعليمة من الصندوق ${m.ip}` };
  }
  const ir = m.ir!;
  if (m.stage === 1) return { ...m, stage: 2, touched: [], note: meaning(ir) };
  const regs = [...m.regs];
  const ram = [...m.ram];
  let ip = m.ip + 1;
  let note = "";
  let touched: number[] = [];
  switch (ir.op) {
    case "LOAD": regs[ir.r] = ram[ir.addr]; touched = [ir.addr]; note = `${R(ir.r)} = ${regs[ir.r]}`; break;
    case "ADD": regs[ir.r] = regs[ir.r] + regs[ir.r2]; note = `${R(ir.r)} = ${regs[ir.r]}`; break;
    case "STORE": ram[ir.addr] = regs[ir.r]; touched = [ir.addr]; note = `الصندوق ${ir.addr} = ${regs[ir.r]}`; break;
    case "JUMPIF": {
      const yes = regs[ir.r] < regs[ir.r2];
      if (yes) ip = ir.to;
      note = `${regs[ir.r]} < ${regs[ir.r2]}؟ ${yes ? `نعم، قفز إلى ${ir.to}` : `لا، أكمل إلى ${ip}`}`;
      break;
    }
    case "HALT":
      return { ...m, stage: 0, halted: true, done: m.done + 1, note: "انتهى البرنامج", touched: [] };
  }
  return { ...m, regs, ram, ip, stage: 0, note, touched, done: m.done + 1 };
}

function runToEnd(m: Machine) {
  let x = m;
  while (!x.halted) x = tick(x);
  return x;
}

/** A toy CPU: three registers, a program in numbered RAM boxes, one fetch-decode-execute stage per press. */
export default function CpuProblem() {
  const [m, setM] = useState<Machine>(fresh);
  const [speed, setSpeed] = useState(0);
  const [running, setRunning] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRunning(false);
  };
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  useEffect(() => { if (m.halted) stop(); }, [m.halted]);

  function step() { stop(); setM((x) => tick(x)); }
  function whole() {
    stop();
    setM((x) => { let y = tick(x); while (!y.halted && y.stage !== 0) y = tick(y); return y; });
  }
  function reset() { stop(); setFlash(null); setM(fresh()); }
  function run() {
    if (running) return stop();
    const s = SPEEDS[speed];
    const start = m.halted ? fresh() : m;
    if (s.perSec > 1000) {
      const end = runToEnd(start);
      const ns = ((end.done - start.done) / s.perSec) * 1e9;
      setM(end);
      setFlash(`${end.done - start.done} تعليمة في ${ns.toFixed(1)} نانوثانية فقط (النانوثانية جزء من مليار من الثانية).`);
      return;
    }
    setFlash(null);
    setM(start);
    setRunning(true);
    timer.current = setInterval(() => setM((x) => tick(x)), 1000 / (s.perSec * 3));
  }


  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        {/* CPU */}
        <div className="rounded-2xl border border-accent/50 bg-accent-soft/20 p-4">
          <div className="font-semibold">المعالج</div>
          <div className="mt-3 flex gap-2">
            {STAGES.map((s, k) => {
              const active = !m.halted && m.stage === ((k + 1) % 3) && m.ir !== null;
              return (
                <motion.div
                  key={s}
                  animate={{ scale: active ? 1.06 : 1 }}
                  className={`flex-1 rounded-xl border px-2 py-1.5 text-center text-sm ${active ? "border-accent bg-accent font-bold text-accent-fg" : "border-line bg-surface text-muted"}`}
                >
                  {k + 1}. {s}
                </motion.div>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2" dir="ltr">
            {m.regs.map((v, k) => (
              <div key={k} className="rounded-xl bg-code p-2 text-center">
                <div className="code text-xs text-code-fg/60">{R(k)}</div>
                <AnimatePresence mode="popLayout">
                  <motion.div key={v} initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 14, opacity: 0 }} className="code text-2xl font-bold text-[var(--accent)]">
                    {v}
                  </motion.div>
                </AnimatePresence>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="rounded-lg bg-surface px-2 py-1 code" dir="ltr">IP = {m.ip}</span>
            <span className="code rounded-lg bg-code px-2 py-1 text-code-fg" dir="ltr">{m.ir ? text(m.ir) : "—"}</span>
          </div>
          <div className="mt-3 min-h-[3rem] text-sm">
            <AnimatePresence mode="wait">
              <motion.p key={m.note + m.done + m.stage} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {m.note || "اضغط «خطوة» ليجلب المعالج أول تعليمة."}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* RAM */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="font-semibold">الذاكرة RAM <span className="text-sm font-normal text-muted">(صناديق مرقّمة)</span></div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4" dir="ltr">
            {Array.from({ length: BOXES }, (_, k) => {
              const isCode = k < PROGRAM.length;
              const pointed = !m.halted && k === m.ip;
              const touched = m.touched.includes(k);
              return (
                <motion.div
                  key={k}
                  animate={{ scale: touched ? 1.05 : 1 }}
                  className={`relative rounded-xl border p-2 ${pointed ? "border-accent ring-2 ring-accent/50" : "border-line"} ${touched ? "bg-accent-soft/40" : "bg-surface-2"}`}
                >
                  <div className="flex justify-between text-[10px] text-muted">
                    <span className="code">{k}</span>
                    {DATA[k] && <span>{DATA[k].label}</span>}
                    {pointed && <span className="font-bold text-accent">IP</span>}
                  </div>
                  <div className={`code truncate ${isCode ? "text-[11px]" : "text-lg font-bold text-num"}`}>
                    {isCode ? text(PROGRAM[k]) : DATA[k] ? m.ram[k] : ""}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={step} disabled={m.halted} className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40">
          خطوة
        </motion.button>
        <button onClick={whole} disabled={m.halted} className="rounded-2xl border border-line bg-surface px-4 py-3 font-semibold disabled:opacity-40">
          تعليمة كاملة
        </button>
        <button onClick={reset} className="text-sm text-muted hover:text-fg">ابدأ من جديد</button>
        <span className="text-sm text-muted">تعليمات منفّذة: <b className="code text-fg">{m.done}</b></span>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold">السرعة:</span>
          <input type="range" min={0} max={SPEEDS.length - 1} value={speed} onChange={(e) => { stop(); setSpeed(Number(e.target.value)); }} className="w-40 accent-[var(--accent)]" />
          <span className="text-sm">{SPEEDS[speed].label}</span>
          <button onClick={run} className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg">{running ? "أوقف" : "شغّل"}</button>
        </div>
        {flash && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 font-semibold text-ok">{flash}</motion.p>
        )}
      </div>

      {m.halted && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          لاحظت؟ المعالج لا يفعل إلا خطوات صغيرة جداً: <b className="text-fg">جلب، فهم، تنفيذ</b>، ثم التعليمة التالية. والقفز إلى الخلف هو ما صنع التكرار: الصندوق c صار <b className="code text-fg">{m.ram[11]}</b>.
        </motion.p>
      )}
    </div>
  );
}
