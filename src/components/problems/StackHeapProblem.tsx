"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

type Mode = "gc" | "manual";
interface Var {
  name: string;
  box: number;
}
interface Frame {
  id: number;
  name: string;
  vars: Var[];
}
interface Box {
  id: number;
  value: string;
  freed: boolean;
}

const VALUES = ["[1, 2]", '"Sara"', "[7, 8, 9]", '"hi"', "[0]", '"Omar"'];
const NAMES = ["main", "load", "parse", "draw", "save"];

/**
 * A tiny stack and heap: call functions, allocate boxes from the top frame, return, and see who
 * cleans the heap: a garbage collector that pauses to sweep, or you by hand (leaks and use-after-free).
 */
export default function StackHeapProblem() {
  const [mode, setMode] = useState<Mode>("gc");
  const [frames, setFrames] = useState<Frame[]>([{ id: 0, name: "main", vars: [] }]);
  const [heap, setHeap] = useState<Box[]>([]);
  const [nextId, setNextId] = useState(1);
  const [msg, setMsg] = useState<{ text: string; tone: "ok" | "err" | "muted" } | null>(null);
  const [crash, setCrash] = useState(false);
  const [sweeping, setSweeping] = useState(false);

  const reachable = new Set(frames.flatMap((f) => f.vars.map((v) => v.box)));
  const garbage = heap.filter((b) => !b.freed && !reachable.has(b.id));
  const top = frames[frames.length - 1];
  const locked = crash || sweeping;

  const reset = (m: Mode = mode) => {
    setMode(m);
    setFrames([{ id: 0, name: "main", vars: [] }]);
    setHeap([]);
    setNextId(1);
    setMsg(null);
    setCrash(false);
    setSweeping(false);
  };

  const call = () => {
    if (frames.length >= NAMES.length) return;
    setFrames([...frames, { id: Date.now(), name: NAMES[frames.length], vars: [] }]);
    setMsg({ text: "إطار جديد فوق المكدّس. الدفع سريع: مؤشر القمة يتحرك فقط.", tone: "muted" });
  };

  const alloc = () => {
    if (top.vars.length >= 3 || heap.length >= 9) return;
    const id = nextId;
    const name = ["a", "b", "c"][top.vars.length];
    setHeap([...heap, { id, value: VALUES[(id - 1) % VALUES.length], freed: false }]);
    setFrames(frames.map((f, i) => (i === frames.length - 1 ? { ...f, vars: [...f.vars, { name, box: id }] } : f)));
    setNextId(id + 1);
    setMsg({ text: `صندوق #${id} في الكومة، و ${name} في الإطار يحمل سهماً إليه.`, tone: "muted" });
  };

  const ret = () => {
    if (frames.length <= 1) return;
    const popped = top.vars.map((v) => v.box);
    const rest = frames.slice(0, -1);
    const still = new Set(rest.flatMap((f) => f.vars.map((v) => v.box)));
    const lost = heap.filter((b) => !b.freed && popped.includes(b.id) && !still.has(b.id));
    setFrames(rest);
    if (!lost.length) setMsg({ text: "الإطار اختفى، ولم يترك شيئاً في الكومة.", tone: "ok" });
    else if (mode === "gc")
      setMsg({ text: `الإطار اختفى، والصندوق ${lost.map((b) => "#" + b.id).join(" ")} بقي بلا سهم: قمامة تنتظر الجامع.`, tone: "muted" });
    else setMsg({ text: `تسرّب! ${lost.map((b) => "#" + b.id).join(" ")} بلا سهم ولم تحرّره. لن يستطيع أحد تحريره بعد الآن.`, tone: "err" });
  };

  const collect = () => {
    if (!garbage.length) return;
    setSweeping(true);
    setMsg({ text: "البرنامج متوقف... الجامع يتتبّع كل سهم من المكدّس ليعرف ما زال حياً.", tone: "muted" });
    setTimeout(() => {
      const dead = new Set(garbage.map((b) => b.id));
      setHeap((h) => h.filter((b) => !dead.has(b.id)));
      setSweeping(false);
      setMsg({ text: `حُذف ${dead.size} صندوق بلا سهم، ثم عاد البرنامج يعمل. الثمن: توقّف لم تختر موعده.`, tone: "ok" });
    }, 1300);
  };

  const free = (box: number) => {
    const b = heap.find((x) => x.id === box);
    if (!b) return;
    if (b.freed) {
      setCrash(true);
      setMsg({ text: `انهيار: double free. الصندوق #${box} حُرِّر من قبل. في C هذا يفسد الكومة كلها.`, tone: "err" });
      return;
    }
    setHeap(heap.map((x) => (x.id === box ? { ...x, freed: true } : x)));
    setMsg({ text: `حرّرت #${box}. لكن السهم ما زال في المتغير ويشير إلى مكان فارغ. جرّب أن تستعمله.`, tone: "muted" });
  };

  const use = (v: Var) => {
    const b = heap.find((x) => x.id === v.box);
    if (b?.freed) {
      setCrash(true);
      setMsg({ text: `انهيار: use after free. ${v.name} يقرأ صندوقاً حُرِّر، وقد يملكه شيء آخر الآن. ثغرة أمنية مشهورة.`, tone: "err" });
      return;
    }
    setMsg({ text: `${v.name} → #${v.box} = ${b?.value}`, tone: "ok" });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["gc", "manual"] as Mode[]).map((m) => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.92 }}
            onClick={() => reset(m)}
            className={`rounded-xl border px-3 py-2 text-sm font-bold ${mode === m ? "border-accent bg-surface" : "border-line text-muted"}`}
          >
            {m === "gc" ? "جامع القمامة (JS, Python)" : "يدوي (C: free)"}
          </motion.button>
        ))}
        <button onClick={() => reset()} className="text-sm text-muted hover:text-fg">
          ابدأ من جديد
        </button>
      </div>

      <motion.div
        animate={crash ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
        className={`grid gap-4 md:grid-cols-2 ${sweeping ? "opacity-80" : ""}`}
      >
        {/* Stack */}
        <div className="rounded-2xl border border-line bg-surface p-3">
          <div className="mb-2 text-sm font-bold">
            المكدّس <span className="code text-xs font-normal text-muted">Stack</span>
          </div>
          <div className="flex min-h-40 flex-col-reverse gap-2">
            <AnimatePresence initial={false}>
              {frames.map((f, i) => (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`rounded-xl border p-2 ${i === frames.length - 1 ? "border-accent" : "border-line opacity-70"}`}
                >
                  <div className="code mb-1 text-sm font-bold" dir="ltr">{f.name}()</div>
                  {f.vars.length === 0 && <div className="text-xs text-muted">لا متغيرات</div>}
                  <div className="flex flex-wrap gap-1.5" dir="ltr">
                    {f.vars.map((v) => {
                      const b = heap.find((x) => x.id === v.box);
                      return (
                        <div key={v.name} className="flex items-center gap-1 rounded-lg bg-code px-2 py-1">
                          <button onClick={() => !locked && use(v)} className="code text-sm font-bold" title="use">
                            {v.name} <span className={b?.freed ? "text-err" : "text-[var(--accent)]"}>→ #{v.box}</span>
                          </button>
                          {mode === "manual" && (
                            <button
                              onClick={() => !locked && free(v.box)}
                              className="code rounded bg-surface px-1.5 text-[11px] text-muted hover:text-err"
                            >
                              free
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Heap */}
        <div className="rounded-2xl border border-line bg-surface p-3">
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span>
              الكومة <span className="code text-xs font-normal text-muted">Heap</span>
            </span>
            {sweeping && <span className="text-xs text-muted">⏸ متوقف للجمع</span>}
          </div>
          <div className="flex min-h-40 flex-wrap content-start gap-2" dir="ltr">
            {heap.length === 0 && <div className="w-full text-center text-xs text-muted" dir="rtl">فارغة</div>}
            <AnimatePresence>
              {heap.map((b) => {
                const lost = !b.freed && !reachable.has(b.id);
                return (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: b.freed ? 0.45 : 1, scale: sweeping && lost ? [1, 1.1, 1] : 1 }}
                    exit={{ opacity: 0, scale: 0.3, rotate: -10 }}
                    transition={{ duration: 0.4 }}
                    className={`rounded-xl border-2 px-3 py-2 ${
                      b.freed ? "border-dashed border-line" : lost ? (mode === "manual" ? "border-err" : "border-dashed border-muted") : "border-accent"
                    }`}
                  >
                    <div className="code text-[10px] text-muted">#{b.id}</div>
                    <div className={`code text-sm font-bold ${b.freed ? "text-muted line-through" : "text-num"}`}>{b.value}</div>
                    {lost && <div className={`text-[10px] ${mode === "manual" ? "text-err" : "text-muted"}`} dir="rtl">{mode === "manual" ? "تسرّب" : "بلا سهم"}</div>}
                    {b.freed && <div className="text-[10px] text-muted" dir="rtl">محرّر</div>}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="mt-4 flex flex-wrap gap-2" dir="ltr">
        <Btn onClick={call} disabled={locked || frames.length >= NAMES.length}>call {NAMES[frames.length] ?? ""}()</Btn>
        <Btn onClick={alloc} disabled={locked || top.vars.length >= 3 || heap.length >= 9} primary>
          let {["a", "b", "c"][top.vars.length] ?? "x"} = new box
        </Btn>
        <Btn onClick={ret} disabled={locked || frames.length <= 1}>return</Btn>
        {mode === "gc" && (
          <Btn onClick={collect} disabled={locked || garbage.length === 0}>run GC ({garbage.length})</Btn>
        )}
      </div>

      <div className="mt-3 min-h-12">
        <AnimatePresence mode="wait">
          {msg ? (
            <motion.p
              key={msg.text}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={msg.tone === "err" ? "font-medium text-err" : msg.tone === "ok" ? "text-ok" : "text-muted"}
            >
              {msg.text}
            </motion.p>
          ) : (
            <p className="text-muted">استدعِ دالة، احجز فيها صندوقاً، ثم ارجع منها.</p>
          )}
        </AnimatePresence>
        {crash && (
          <button onClick={() => reset()} className="mt-1 text-sm font-bold text-accent">
            أعد تشغيل البرنامج
          </button>
        )}
      </div>
    </div>
  );
}

function Btn({ children, onClick, disabled, primary }: { children: ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      disabled={disabled}
      className={`code rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-40 ${primary ? "bg-accent text-accent-fg" : "border border-line bg-surface"}`}
    >
      {children}
    </motion.button>
  );
}
