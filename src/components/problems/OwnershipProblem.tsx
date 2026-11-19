"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

type Holder = { box: number } | "moved";
interface Box {
  id: number;
  value: string;
  copy: boolean;
}

const VARS = ["a", "b", "c", "d"];

/**
 * One key per box: every heap value has exactly one key (its owner). Assigning moves the key,
 * clone makes a new box with its own key, and using a variable without a key is a compile error.
 */
export default function OwnershipProblem() {
  const [vars, setVars] = useState<Record<string, Holder>>({ a: { box: 1 } });
  const [boxes, setBoxes] = useState<Box[]>([{ id: 1, value: '"Sara"', copy: false }]);
  const [code, setCode] = useState<string[]>(['let a = String::from("Sara");']);
  const [error, setError] = useState<string | null>(null);
  const [printed, setPrinted] = useState<string | null>(null);
  const [freed, setFreed] = useState<string[] | null>(null);
  const [m, setM] = useState(false);

  const nextFree = VARS.find((v) => vars[v] === undefined);
  const ended = freed !== null;

  const reset = () => {
    setVars({ a: { box: 1 } });
    setBoxes([{ id: 1, value: '"Sara"', copy: false }]);
    setCode(['let a = String::from("Sara");']);
    setError(null);
    setPrinted(null);
    setFreed(null);
    setM(false);
  };

  const write = (line: string) => {
    setCode((c) => [...c, line]);
    setError(null);
    setPrinted(null);
  };

  const move = (from: string) => {
    const h = vars[from];
    if (!nextFree || h === undefined) return;
    if (h === "moved") return print(from, `let ${nextFree} = ${from};`);
    setVars({ ...vars, [from]: "moved", [nextFree]: h });
    write(`let ${nextFree} = ${from};`);
  };

  const clone = (from: string) => {
    const h = vars[from];
    if (!nextFree || h === undefined) return;
    if (h === "moved") return print(from, `let ${nextFree} = ${from}.clone();`);
    const id = Math.max(...boxes.map((b) => b.id)) + 1;
    const src = boxes.find((b) => b.id === h.box)!;
    setBoxes([...boxes, { id, value: src.value, copy: true }]);
    setVars({ ...vars, [nextFree]: { box: id } });
    write(`let ${nextFree} = ${from}.clone();`);
  };

  const print = (name: string, line = `println!("{}", ${name});`) => {
    const h = vars[name];
    if (h === "moved") {
      setCode((c) => [...c, line]);
      setPrinted(null);
      setError(`error[E0382]: borrow of moved value: \`${name}\``);
      return;
    }
    if (h === undefined) return;
    write(line);
    setPrinted(boxes.find((b) => b.id === h.box)!.value.replace(/"/g, ""));
  };

  const end = () => {
    const lines = VARS.filter((v) => vars[v] !== undefined).map((v) => {
      const h = vars[v];
      return h === "moved" ? `${v}: لا يملك شيئاً، لا يحرّر شيئاً` : `${v}: يحرّر الصندوق #${h.box}`;
    });
    setFreed(lines);
    setError(null);
    setPrinted(null);
    setCode((c) => [...c, "}"]);
  };

  // The broken line stays in the code until the learner removes it, like a compiler error would.
  const undo = () => {
    setCode((c) => c.slice(0, -1));
    setError(null);
  };

  const locked = ended || error !== null;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* The program so far */}
        <motion.div
          animate={error ? { x: [0, -8, 8, -4, 4, 0] } : { x: 0 }}
          className={`rounded-2xl border p-3 ${error ? "border-err" : "border-line"} bg-code`}
          dir="ltr"
        >
          <div className="code text-xs text-muted">fn main() {"{"}</div>
          {code.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className={`code pl-4 text-sm ${error && i === code.length - 1 ? "text-err underline decoration-wavy" : ""}`}
            >
              {l === "}" ? <span className="-ml-4">{"}"}</span> : l}
            </motion.div>
          ))}
        </motion.div>

        {/* Variables and boxes */}
        <div className="flex flex-col gap-2" dir="ltr">
          {VARS.filter((v) => vars[v] !== undefined).map((v) => {
            const h = vars[v];
            const box = h !== "moved" ? boxes.find((b) => b.id === h.box) : undefined;
            return (
              <motion.div
                key={v}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-wrap items-center gap-2 rounded-xl border p-2 ${box ? "border-accent bg-surface" : "border-dashed border-line"}`}
              >
                <span className="code w-5 text-lg font-bold">{v}</span>
                <AnimatePresence mode="popLayout">
                  {box ? (
                    <motion.span
                      key={"k" + box.id}
                      layoutId={"key" + box.id}
                      className="rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-accent-fg"
                    >
                      key #{box.id}
                    </motion.span>
                  ) : (
                    <motion.span key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="code text-xs text-muted">
                      moved
                    </motion.span>
                  )}
                </AnimatePresence>
                {box && (
                  <span className={`code rounded-lg border-2 px-2 py-0.5 text-sm font-bold text-str ${box.copy ? "border-num" : "border-line"}`}>
                    #{box.id} {box.value}
                  </span>
                )}
                <span className="ml-auto flex gap-1">
                  <Small onClick={() => print(v)} disabled={locked}>print</Small>
                  <Small onClick={() => move(v)} disabled={locked || !nextFree}>
                    let {nextFree ?? "_"} = {v}
                  </Small>
                  <Small onClick={() => clone(v)} disabled={locked || !nextFree}>
                    {v}.clone()
                  </Small>
                </span>
              </motion.div>
            );
          })}

          {/* A number lives in the drawer itself: copied, never moved. */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line p-2">
            <span className="code text-sm">
              n = <b className="text-num">5</b>
            </span>
            {m && (
              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="code text-sm">
                m = <b className="text-num">5</b> <span className="text-xs text-ok">Copy</span>
              </motion.span>
            )}
            <span className="ml-auto">
              <Small onClick={() => setM(true)} disabled={m || locked}>let m = n</Small>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!ended && (
          <motion.button whileTap={{ scale: 0.92 }} onClick={end} disabled={error !== null} className="code rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg disabled:opacity-40">
            {"}"} end of main
          </motion.button>
        )}
        <button onClick={reset} className="text-sm text-muted hover:text-fg">
          ابدأ من جديد
        </button>
      </div>

      <div className="mt-3 min-h-14">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div key="err" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <p className="code font-bold text-err" dir="ltr">{error}</p>
              <p className="text-sm text-muted">
                المترجم رفض البرنامج قبل أن يعمل: هذا المتغير أعطى مفتاحه لغيره. لو سُمح له لقرأ صندوقاً قد يُحرَّر.{" "}
                <button onClick={undo} className="font-bold text-accent">احذف السطر</button>
              </p>
            </motion.div>
          ) : freed ? (
            <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {freed.map((l) => (
                <p key={l} className="code text-sm" dir="rtl">{l}</p>
              ))}
              <p className="mt-1 text-ok">كل صندوق حُرِّر مرة واحدة بالضبط، بيد مالكه. لا تسرّب، ولا تحرير مزدوج، ولا جامع قمامة.</p>
            </motion.div>
          ) : printed !== null ? (
            <motion.p key={"p" + code.length} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="code text-ok" dir="ltr">
              {printed}
            </motion.p>
          ) : (
            <p className="text-muted">انقل المفتاح من a إلى متغير آخر، ثم اضغط print على a.</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Small({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      className="code rounded-lg border border-line bg-surface px-2 py-1 text-xs font-bold disabled:opacity-40"
    >
      {children}
    </motion.button>
  );
}
