"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Lock = "private" | "#";
type From = "ts" | "js";

/** Two safes: `private balance` is a label tsc checks; `#balance` is a lock JavaScript itself enforces. */
export default function TsClassesProblem() {
  const [balances, setBalances] = useState<Record<Lock, number>>({ private: 100, "#": 100 });
  const [tries, setTries] = useState<{ lock: Lock; from: From; msg: string; ok: boolean }[]>([]);

  const attack = (lock: Lock, from: From) => {
    let msg: string;
    let ok = false;
    if (from === "ts") {
      msg =
        lock === "private"
          ? "tsc: Property 'balance' is private and only accessible within class 'Account'."
          : "tsc: Property '#balance' is not accessible outside class 'Account' because it has a private identifier.";
    } else if (lock === "private") {
      setBalances((b) => ({ ...b, private: 1000000 }));
      msg = "JS: balance = 1000000 ✓ (the label was gone at run time)";
      ok = true;
    } else {
      msg = "JS: acc['#balance'] = 1000000 adds a new field; #balance is untouched";
    }
    setTries((t) => [{ lock, from, msg, ok }, ...t].slice(0, 4));
  };

  const safe = (lock: Lock) => {
    const broken = balances[lock] !== 100;
    return (
      <div className={`rounded-2xl border p-4 ${broken ? "border-err bg-err/10" : "border-accent/50 bg-accent/5"}`}>
        <div dir="ltr" className="code text-sm text-muted">
          class Account {"{"} {lock === "private" ? "private balance" : "#balance"} = 100; {"}"}
        </div>
        <motion.div key={balances[lock]} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className={`code mt-3 text-center text-4xl font-bold ${broken ? "text-err" : "text-num"}`}>
          {balances[lock].toLocaleString("en")}
        </motion.div>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm">
          <button onClick={() => attack(lock, "ts")} className="rounded-xl border border-line bg-surface px-3 py-1.5 hover:bg-accent/10">
            غيّره من كود TypeScript
          </button>
          <button onClick={() => attack(lock, "js")} className="rounded-xl border border-line bg-surface px-3 py-1.5 hover:bg-accent/10">
            غيّره من JavaScript بعد البناء
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {safe("private")}
        {safe("#")}
      </div>
      <div className="mt-3 min-h-[48px] space-y-1">
        <AnimatePresence initial={false}>
          {tries.map((t, i) => (
            <motion.div
              key={`${tries.length - i}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              dir="ltr"
              className={`code text-xs ${t.ok ? "text-err" : "text-ok"}`}
            >
              [{t.lock}] {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {balances.private !== 100 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-muted">
          private قفل يراه المدقّق فقط، ويختفي مع الأنواع. <b className="text-fg">#</b> قفل في JavaScript نفسها.{" "}
          <button onClick={() => { setBalances({ private: 100, "#": 100 }); setTries([]); }} className="underline">
            أعد المحاولة
          </button>
        </motion.p>
      )}
    </div>
  );
}
