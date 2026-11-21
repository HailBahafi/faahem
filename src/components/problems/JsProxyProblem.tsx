"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Val = string | number;
type Write = { label: string; key: string; value: Val };

const WRITES: Write[] = [
  { label: "user.age = 21", key: "age", value: 21 },
  { label: "user.age = -5", key: "age", value: -5 },
  { label: 'user.age = "old"', key: "age", value: "old" },
  { label: 'user.emial = "s@x.io"', key: "emial", value: "s@x.io" },
];

const START: Record<string, Val> = { name: "Sara", age: 20 };

function check(key: string, value: Val): string | null {
  if (key !== "name" && key !== "age") return `TypeError: unknown field "${key}"`;
  if (key === "age" && (typeof value !== "number" || value < 0)) return `RangeError: age must be a number >= 0`;
  return null;
}

/** The same writes, with and without a Proxy standing in front of the object. */
export default function JsProxyProblem() {
  const [guarded, setGuarded] = useState(false);
  const [obj, setObj] = useState<Record<string, Val>>(START);
  const [log, setLog] = useState<{ id: number; text: string; bad: boolean }[]>([]);
  const [seq, setSeq] = useState(0);

  const write = (w: Write) => {
    const id = seq + 1;
    setSeq(id);
    if (guarded) {
      const err = check(w.key, w.value);
      if (err) {
        setLog((l) => [{ id, text: `set trap → ${err}`, bad: true }, ...l].slice(0, 5));
        return;
      }
      setLog((l) => [{ id, text: `set trap → Reflect.set(${w.key}) ✓`, bad: false }, ...l].slice(0, 5));
    } else {
      setLog((l) => [{ id, text: `${w.label} (stored, no questions asked)`, bad: false }, ...l].slice(0, 5));
    }
    setObj((o) => ({ ...o, [w.key]: w.value }));
  };

  const broken = Object.entries(obj).some(([k, v]) => check(k, v) !== null);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setGuarded(!guarded);
            setObj(START);
            setLog([]);
          }}
          className={`rounded-xl px-4 py-2 font-bold ${guarded ? "bg-accent text-accent-fg" : "border border-line bg-surface"}`}
        >
          {guarded ? "الحارس مفعّل (Proxy)" : "بلا حارس"}
        </button>
        <span className="text-sm text-muted">اضغط للتبديل (يبدأ الكائن من جديد)</span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr]" dir="ltr">
        <div className="flex flex-col gap-2">
          {WRITES.map((w) => (
            <motion.button
              key={w.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => write(w)}
              className="code rounded-lg border border-line bg-surface px-3 py-2 text-start text-sm"
            >
              {w.label}
            </motion.button>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ opacity: guarded ? 1 : 0.15, scale: guarded ? 1 : 0.8 }}
            className="code rounded-xl bg-accent px-3 py-6 text-center text-xs font-bold text-accent-fg"
          >
            Proxy
            <br />
            set()
          </motion.div>
        </div>
        <div className={`code rounded-2xl p-4 text-sm ${broken ? "border border-err/60 bg-code" : "bg-code"} text-white`}>
          <div className="text-xs text-white/50">user</div>
          {"{"}
          {Object.entries(obj).map(([k, v]) => (
            <motion.div key={k} layout className={`ps-4 ${check(k, v) ? "text-err" : ""}`}>
              {k}: <span className={typeof v === "number" ? "text-num" : "text-str"}>{typeof v === "number" ? v : `"${v}"`}</span>,
            </motion.div>
          ))}
          {"}"}
        </div>
      </div>
      <div className="code mt-3 min-h-24 text-xs" dir="ltr">
        <AnimatePresence initial={false}>
          {log.map((l) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={l.bad ? "text-err" : "text-muted"}>
              {l.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {broken && !guarded && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-muted">
          الكائن قَبِل كل قيمة دون أن يسأل، والخطأ سيظهر لاحقاً في مكان بعيد. ماذا لو مرّت كل كتابة على <b className="text-fg">حارس</b> أولاً؟
        </motion.p>
      )}
    </div>
  );
}
