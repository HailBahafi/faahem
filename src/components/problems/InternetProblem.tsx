"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const NODES: Record<string, { x: number; y: number; label: string }> = {
  you: { x: 40, y: 150, label: "جهازك" },
  R1: { x: 150, y: 70, label: "R1" },
  R2: { x: 150, y: 230, label: "R2" },
  R3: { x: 290, y: 40, label: "R3" },
  R4: { x: 290, y: 150, label: "R4" },
  R5: { x: 290, y: 260, label: "R5" },
  R6: { x: 430, y: 90, label: "R6" },
  R7: { x: 430, y: 210, label: "R7" },
  server: { x: 560, y: 150, label: "الخادم" },
};
const LINKS: [string, string][] = [
  ["you", "R1"], ["you", "R2"], ["R1", "R3"], ["R1", "R4"], ["R2", "R4"], ["R2", "R5"],
  ["R3", "R6"], ["R4", "R6"], ["R4", "R7"], ["R5", "R7"], ["R6", "R7"], ["R6", "server"], ["R7", "server"],
];
const key = (a: string, b: string) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const NEIGHBOURS: Record<string, string[]> = {};
for (const id of Object.keys(NODES)) NEIGHBOURS[id] = [];
for (const [a, b] of LINKS) { NEIGHBOURS[a].push(b); NEIGHBOURS[b].push(a); }

const MESSAGE = "HELLO WORLD";
const CHUNKS = ["HELL", "O WO", "RLD"];
const COLORS = ["var(--num)", "var(--str)", "var(--bool)"];

/** Every simple path from you to the server over links that are still up. */
function allPaths(cut: Set<string>): string[][] {
  const out: string[][] = [];
  const walk = (at: string, path: string[]) => {
    if (at === "server") { out.push(path); return; }
    for (const nb of NEIGHBOURS[at]) {
      if (!path.includes(nb) && !cut.has(key(at, nb))) walk(nb, [...path, nb]);
    }
  };
  walk("you", ["you"]);
  return out.filter((p) => p.length <= 6);
}
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

interface Packet {
  id: number; // unique per copy
  n: number; // packet number 1..3
  path: string[];
  pos: number; // index in path
  state: "flying" | "arrived" | "lost";
  lostAt?: [string, string];
  resend?: boolean;
}

/** A router map: a message is cut into numbered packets that hop to the server by their own routes. */
export default function InternetProblem() {
  const [cut, setCut] = useState<Set<string>>(new Set());
  const [packets, setPackets] = useState<Packet[]>([]);
  const [arrivals, setArrivals] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [ticks, setTicks] = useState(0);
  const [running, setRunning] = useState(false);
  const plan = useRef<{ cutAt: number | null; lostTick: Record<number, number> }>({ cutAt: null, lostTick: {} });
  const cutRef = useRef(cut);
  useEffect(() => { cutRef.current = cut; }, [cut]);

  const slots = [1, 2, 3].map((n) => packets.some((p) => p.n === n && p.state === "arrived"));
  const complete = slots.every(Boolean);

  function send(withCut: boolean) {
    const paths = allPaths(cutRef.current);
    if (!paths.length) { setNote("لا يوجد أي طريق إلى الخادم: كل الطرق مقطوعة. أصلح الروابط."); return; }
    const used = new Set<string>();
    const ps: Packet[] = CHUNKS.map((_, k) => {
      const fresh = paths.filter((p) => !used.has(p.join()));
      const path = pick(fresh.length ? fresh : paths);
      used.add(path.join());
      return { id: k, n: k + 1, path, pos: 0, state: "flying" };
    });
    plan.current = { cutAt: withCut ? 2 : null, lostTick: {} };
    setPackets(ps);
    setArrivals([]);
    setTicks(0);
    setRunning(true);
    setNote(`الرسالة "${MESSAGE}" قُطّعت إلى 3 حزم مرقّمة، وكل حزمة اختارت طريقها.`);
  }

  function reset() {
    setRunning(false);
    setPackets([]);
    setArrivals([]);
    setCut(new Set());
    setNote("");
  }

  function toggleLink(a: string, b: string) {
    const k = key(a, b);
    setCut((c) => {
      const next = new Set(c);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      const tick = ticks + 1;
      let c = cutRef.current;
      // Scripted cut: break the next link of the packet that is furthest from the server.
      if (plan.current.cutAt === tick) {
        const victim = packets.filter((p) => p.state === "flying" && p.pos < p.path.length - 1).sort((x, y) => x.pos - y.pos)[0];
        if (victim) {
          const k = key(victim.path[victim.pos], victim.path[victim.pos + 1]);
          c = new Set(c).add(k);
          setCut(c);
          setNote(`انقطع الرابط ${victim.path[victim.pos]} ↔ ${victim.path[victim.pos + 1]} والحزمة #${victim.n} على وشك عبوره!`);
        }
      }
      const newArrivals: number[] = [];
      let next = packets.map((p) => {
        if (p.state !== "flying") return p;
        if (Math.random() < 0.3) return p; // this router is busy: the packet waits a tick
        const a = p.path[p.pos];
        const b = p.path[p.pos + 1];
        if (c.has(key(a, b))) {
          plan.current.lostTick[p.n] = tick;
          return { ...p, state: "lost" as const, lostAt: [a, b] as [string, string] };
        }
        const pos = p.pos + 1;
        if (pos === p.path.length - 1) { newArrivals.push(p.n); return { ...p, pos, state: "arrived" as const }; }
        return { ...p, pos };
      });
      // TCP: after a short wait with no receipt, the sender sends a lost packet again by a route that is up.
      const handled = new Set<number>();
      for (const p of next) {
        const lostTick = plan.current.lostTick[p.n];
        const alive = next.some((q) => q.n === p.n && q.state !== "lost");
        if (p.state === "lost" && !handled.has(p.n) && lostTick !== undefined && tick - lostTick >= 3 && !alive) {
          handled.add(p.n);
          const paths = allPaths(c);
          if (!paths.length) { setNote("الحزمة ضاعت ولا يوجد طريق بديل. أصلح رابطاً لتصل."); continue; }
          next = [...next, { id: 100 + tick * 10 + p.n, n: p.n, path: pick(paths), pos: 0, state: "flying", resend: true }];
          setNote(`الخادم لاحظ أن الخانة #${p.n} فارغة ولم يرسل إيصالها، فأعاد جهازك إرسال #${p.n} من طريق سليم.`);
        }
      }
      if (newArrivals.length) setArrivals((x) => [...x, ...newArrivals]);
      setPackets(next);
      setTicks(tick);
      const anyMoving = next.some((p) => p.state === "flying");
      const allIn = [1, 2, 3].every((n) => next.some((p) => p.n === n && p.state === "arrived"));
      const waitingResend = next.some((p) => p.state === "lost" && !next.some((q) => q.n === p.n && q.state !== "lost"));
      if (allIn || (!anyMoving && !waitingResend) || tick > 40) setRunning(false);
    }, 650);
    return () => clearTimeout(t);
  }, [running, ticks, packets]);

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface p-2">
        <svg viewBox="0 0 600 300" className="w-full" style={{ direction: "ltr" }}>
          {LINKS.map(([a, b]) => {
            const k = key(a, b);
            const down = cut.has(k);
            const A = NODES[a], B = NODES[b];
            return (
              <g key={k} onClick={() => toggleLink(a, b)} className="cursor-pointer">
                <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="transparent" strokeWidth={16} />
                <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={down ? "var(--err)" : "var(--border)"} strokeWidth={down ? 2.5 : 3} strokeDasharray={down ? "6 6" : undefined} />
                {down && <text x={(A.x + B.x) / 2} y={(A.y + B.y) / 2 + 5} textAnchor="middle" fontSize={16} fill="var(--err)" fontWeight={700}>✕</text>}
              </g>
            );
          })}
          {Object.entries(NODES).map(([id, nd]) => {
            const end = id === "you" || id === "server";
            return (
              <g key={id}>
                <rect x={nd.x - (end ? 30 : 18)} y={nd.y - 14} width={end ? 60 : 36} height={28} rx={8} fill={end ? "var(--accent)" : "var(--surface-2)"} stroke={end ? "var(--accent)" : "var(--border)"} />
                <text x={nd.x} y={nd.y + 5} textAnchor="middle" fontSize={12} fontWeight={700} fill={end ? "var(--accent-fg)" : "var(--fg)"}>{nd.label}</text>
              </g>
            );
          })}
          <text x={40} y={185} textAnchor="middle" fontSize={9} fill="var(--muted)">192.168.1.5</text>
          <text x={560} y={185} textAnchor="middle" fontSize={9} fill="var(--muted)">93.184.216.34:443</text>
          {packets.map((p) => {
            if (p.state === "lost" && p.lostAt) {
              const A = NODES[p.lostAt[0]], B = NODES[p.lostAt[1]];
              return (
                <motion.g key={p.id} initial={{ opacity: 1 }} animate={{ opacity: 0.35 }}>
                  <circle cx={(A.x + B.x) / 2} cy={(A.y + B.y) / 2 - 14} r={10} fill="var(--err)" />
                  <text x={(A.x + B.x) / 2} y={(A.y + B.y) / 2 - 10} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">{p.n}</text>
                </motion.g>
              );
            }
            if (p.state === "arrived") return null;
            const nd = NODES[p.path[p.pos]];
            const off = (p.n - 2) * 7;
            return (
              <motion.g key={p.id} initial={false} animate={{ x: nd.x + off, y: nd.y - 22 + off }} transition={{ duration: 0.55, ease: "easeInOut" }}>
                <circle r={11} fill={COLORS[p.n - 1]} stroke={p.resend ? "var(--fg)" : "none"} strokeWidth={2} />
                <text y={4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">{p.n}</text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => send(false)} disabled={running} className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40">
          أرسل
        </motion.button>
        <button onClick={() => send(true)} disabled={running} className="rounded-2xl border border-line bg-surface px-4 py-3 font-semibold disabled:opacity-40">
          أرسل واقطع رابطاً في الطريق
        </button>
        <button onClick={reset} className="text-sm text-muted hover:text-fg">ابدأ من جديد</button>
        <span className="text-sm text-muted">اضغط على أي خط لتقطعه أو تصلحه</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm font-semibold">خانات الخادم (TCP)</div>
          <div className="mt-2 grid grid-cols-3 gap-2" dir="ltr">
            {CHUNKS.map((c, k) => (
              <motion.div key={k} animate={{ scale: slots[k] ? [1.1, 1] : 1 }} className={`rounded-xl border p-2 text-center ${slots[k] ? "border-ok bg-surface-2" : "border-dashed border-line"}`}>
                <div className="text-[10px] text-muted">#{k + 1}</div>
                <div className="code font-bold text-str">{slots[k] ? `"${c}"` : "?"}</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-2 text-sm text-muted" dir="rtl">
            ترتيب الوصول: <span className="code font-bold text-fg" dir="ltr">{arrivals.length ? arrivals.map((n) => `#${n}`).join("  ") : "—"}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 text-sm">
          <AnimatePresence mode="wait">
            <motion.p key={note + complete} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {complete ? (
                <>
                  وصلت كل الخانات، فرتّبها TCP بأرقامها وسلّم البرنامج على المنفذ 443: <b className="code text-ok" dir="ltr">&quot;{MESSAGE}&quot;</b>
                </>
              ) : (
                note || "اضغط «أرسل» وراقب الحزم الثلاث."
              )}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {complete && arrivals.join() !== "1,2,3" && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          لاحظت؟ الحزم وصلت بترتيب مختلف عن إرسالها، والرسالة خرجت سليمة لأن كل حزمة تحمل رقمها.
        </motion.p>
      )}
    </div>
  );
}
