"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Mode = "compiler" | "interpreter";
type Bug = "none" | "syntax" | "name";

const LINES: Record<Bug, string[]> = {
  none: ["let price = 20;", "let total = price * 2;", "console.log(total);"],
  syntax: ["let price = 20;", "let total = price * 2;", "console.log(total;"],
  name: ["let price = 20;", "let total = price * 2;", "console.log(totl);"],
};

/** What each line becomes for the CPU: toy instructions and their (made-up) bits. */
const MACHINE: { op: string; bits: string }[][] = [
  [{ op: "STORE 20 → price", bits: "0011 0001 0001 0100" }],
  [
    { op: "LOAD R1 ← price", bits: "0001 0001 0000 0001" },
    { op: "MUL R1 ← R1 × 2", bits: "0101 0001 0000 0010" },
    { op: "STORE R1 → total", bits: "0010 0001 0000 0010" },
  ],
  [
    { op: "LOAD R1 ← total", bits: "0001 0001 0000 0010" },
    { op: "OUT R1", bits: "1110 0001 0000 0000" },
  ],
];

type Ev =
  | { k: "scan" }
  | { k: "tr"; line: number }
  | { k: "ready" }
  | { k: "run"; line: number }
  | { k: "refuse"; line: number; why: string }
  | { k: "crash"; line: number; why: string }
  | { k: "end" };

const SYNTAX = "قوس ناقص في السطر 3";
const NAME = "لا يوجد درج اسمه totl";

function events(mode: Mode, bug: Bug): Ev[] {
  if (mode === "compiler") {
    if (bug === "syntax") return [{ k: "tr", line: 0 }, { k: "tr", line: 1 }, { k: "refuse", line: 2, why: SYNTAX }];
    if (bug === "name") return [{ k: "tr", line: 0 }, { k: "tr", line: 1 }, { k: "refuse", line: 2, why: NAME }];
    return [{ k: "tr", line: 0 }, { k: "tr", line: 1 }, { k: "tr", line: 2 }, { k: "ready" }, { k: "run", line: 0 }, { k: "run", line: 1 }, { k: "run", line: 2 }, { k: "end" }];
  }
  if (bug === "syntax") return [{ k: "scan" }, { k: "refuse", line: 2, why: SYNTAX }];
  const body: Ev[] = [{ k: "scan" }, { k: "tr", line: 0 }, { k: "run", line: 0 }, { k: "tr", line: 1 }, { k: "run", line: 1 }, { k: "tr", line: 2 }];
  return bug === "name" ? [...body, { k: "crash", line: 2, why: NAME }] : [...body, { k: "run", line: 2 }, { k: "end" }];
}

function label(e: Ev) {
  switch (e.k) {
    case "scan": return "قراءة القواعد";
    case "tr": return `ترجمة ${e.line + 1}`;
    case "ready": return "الملف جاهز";
    case "run": return `تشغيل ${e.line + 1}`;
    case "refuse": return "رفض";
    case "crash": return `توقّف عند ${e.line + 1}`;
    case "end": return "انتهى";
  }
}

function message(e: Ev | undefined, mode: Mode) {
  if (!e) return mode === "compiler" ? "المترجم يحوّل الملف كله أولاً، ثم يعمل البرنامج." : "المفسّر يترجم سطراً ثم ينفّذه، ثم السطر التالي.";
  switch (e.k) {
    case "scan": return "يقرأ الملف كله بسرعة ليتأكد أن قواعد الكتابة سليمة.";
    case "tr": return `يحوّل السطر ${e.line + 1} إلى تعليمات يفهمها المعالج.`;
    case "ready": return "انتهت الترجمة: ملف تعليمات آلة جاهز. الآن يعمل بسرعة.";
    case "run": return `المعالج ينفّذ تعليمات السطر ${e.line + 1}.`;
    case "refuse": return `يرفض: ${e.why}. لم يعمل أي سطر.`;
    case "crash": return `${e.why}. السطران 1 و 2 عملا قبل أن يكتشف الخطأ.`;
    case "end": return "انتهى البرنامج.";
  }
}

/** The same three lines translated by a compiler (all first, then run) or an interpreter (line by line). */
export default function CodeToRunProblem() {
  const [mode, setMode] = useState<Mode>("compiler");
  const [bug, setBug] = useState<Bug>("none");
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const evs = events(mode, bug);
  const past = evs.slice(0, shown);
  const last = past[past.length - 1];
  const translated = new Set(past.filter((e) => e.k === "tr").map((e) => (e as { line: number }).line));
  const ran = new Set(past.filter((e) => e.k === "run").map((e) => (e as { line: number }).line));
  const bad = past.find((e) => e.k === "refuse" || e.k === "crash") as { k: string; line: number } | undefined;
  const scanning = last?.k === "scan";
  const active = last && "line" in last ? last.line : -1;

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
  };
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  useEffect(() => { if (shown >= evs.length) stop(); }, [shown, evs.length]);

  function play() {
    stop();
    setShown(0);
    setPlaying(true);
    let i = 0;
    timer.current = setInterval(() => { i += 1; setShown(i); }, 750);
  }
  function choose(m: Mode, b: Bug) { stop(); setShown(0); setMode(m); setBug(b); }

  const memory: [string, number][] = [];
  if (ran.has(0)) memory.push(["price", 20]);
  if (ran.has(1)) memory.push(["total", 40]);
  const output = ran.has(2) ? "40" : "";
  const finished = shown >= evs.length && shown > 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {(["compiler", "interpreter"] as Mode[]).map((m) => (
          <button key={m} onClick={() => choose(m, bug)} className={`rounded-xl px-4 py-2 font-semibold ${mode === m ? "bg-accent text-accent-fg" : "border border-line bg-surface"}`}>
            {m === "compiler" ? "مترجم (Go، Rust)" : "مفسّر (Python، JS)"}
          </button>
        ))}
        <span className="mx-2 h-6 w-px bg-line" />
        {([["none", "بلا خطأ"], ["syntax", "قوس ناقص"], ["name", "اسم خاطئ"]] as [Bug, string][]).map(([b, t]) => (
          <button key={b} onClick={() => choose(mode, b)} className={`rounded-full px-3 py-1 text-sm ${bug === b ? (b === "none" ? "bg-ok/20 font-bold text-ok" : "bg-err/15 font-bold text-err") : "border border-line text-muted"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.2fr_0.8fr]">
        {/* Source */}
        <div className="rounded-2xl border border-line bg-surface p-3">
          <div className="mb-2 text-sm font-semibold">الكود الذي كتبناه</div>
          <div className="rounded-xl bg-code p-2" dir="ltr">
            {LINES[bug].map((l, k) => {
              const isBad = bad && bad.line === k;
              const on = active === k || scanning;
              return (
                <motion.div
                  key={k}
                  animate={{ backgroundColor: isBad ? "rgba(248,113,113,0.25)" : on ? "rgba(45,212,191,0.22)" : "rgba(0,0,0,0)" }}
                  className="code flex gap-2 rounded px-1 text-sm text-code-fg"
                >
                  <span className="opacity-40">{k + 1}</span>
                  <span>{l}</span>
                  {ran.has(k) && <span className="ms-auto text-ok">✓</span>}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Machine code */}
        <div className="rounded-2xl border border-line bg-surface p-3">
          <div className="mb-2 text-sm font-semibold">ما يفهمه المعالج</div>
          <div className={`min-h-[8rem] space-y-1 ${past.some((e) => e.k === "refuse") ? "opacity-40 line-through" : ""}`} dir="ltr">
            <AnimatePresence>
              {MACHINE.map((ins, k) =>
                translated.has(k)
                  ? ins.map((x, j) => (
                      <motion.div
                        key={`${k}-${j}`}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`code flex justify-between gap-2 rounded-lg px-2 py-0.5 text-xs ${ran.has(k) ? "bg-accent-soft/40" : "bg-surface-2"}`}
                      >
                        <span><span className="text-muted">{k + 1}:</span> {x.op}</span>
                        <span className="text-muted">{x.bits}</span>
                      </motion.div>
                    ))
                  : null,
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Memory and screen */}
        <div className="rounded-2xl border border-line bg-surface p-3">
          <div className="mb-2 text-sm font-semibold">الذاكرة والشاشة</div>
          <div className="space-y-1" dir="ltr">
            {memory.map(([nm, v]) => (
              <motion.div key={nm} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="code flex justify-between rounded-lg bg-surface-2 px-2 py-1 text-sm">
                <span>{nm}</span><b className="text-num">{v}</b>
              </motion.div>
            ))}
          </div>
          <div className="code mt-2 min-h-[2.25rem] rounded-lg bg-code px-2 py-1.5 text-code-fg" dir="ltr">{output && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{output}</motion.span>}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={play} disabled={playing} className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-50">
          شغّل
        </motion.button>
        <AnimatePresence mode="wait">
          <motion.p key={shown + mode + bug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`text-sm ${bad ? "font-semibold text-err" : "text-muted"}`}>
            {message(last, mode)}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {past.map((e, k) => (
          <motion.span
            key={k}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-full px-2.5 py-0.5 text-xs ${e.k === "run" ? "bg-accent text-accent-fg" : e.k === "refuse" || e.k === "crash" ? "bg-err/15 text-err" : "bg-surface-2 text-muted"}`}
          >
            {label(e)}
          </motion.span>
        ))}
      </div>

      {finished && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          لاحظ ترتيب الشارات: المترجم يترجم <b className="text-fg">كل شيء أولاً</b> ثم يشغّل، والمفسّر <b className="text-fg">يترجم ويشغّل سطراً سطراً</b>. وفي الحالتين، خطأ في قواعد الكتابة يوقف كل شيء قبل أن يعمل أي سطر.
        </motion.p>
      )}
    </div>
  );
}
