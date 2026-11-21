"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Log = { text: string; ok: boolean };

/** The same deposit/withdraw rules on a plain object and on a class with a private #balance. */
export default function JsClassesProblem() {
  const [plain, setPlain] = useState(100);
  const [priv, setPriv] = useState(100);
  const [logs, setLogs] = useState<[Log, Log] | null>(null);
  const [hacked, setHacked] = useState(false);

  const deposit = () => {
    setPlain((b) => b + 50);
    setPriv((b) => b + 50);
    setLogs([{ text: "+50", ok: true }, { text: "+50", ok: true }]);
  };
  const withdraw = () => {
    const one = (b: number): [number, Log] => (b >= 300 ? [b - 300, { text: "-300", ok: true }] : [b, { text: "RangeError: insufficient funds", ok: false }]);
    const [p, lp] = one(plain);
    const [q, lq] = one(priv);
    setPlain(p);
    setPriv(q);
    setLogs([lp, lq]);
  };
  const hack = () => {
    setPlain(-1000);
    setHacked(true);
    setLogs([{ text: "balance = -1000 ✓", ok: false }, { text: "#balance unchanged", ok: true }]);
  };
  const reset = () => {
    setPlain(100);
    setPriv(100);
    setLogs(null);
    setHacked(false);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={deposit} className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg">
          deposit(50)
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={withdraw} className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg">
          withdraw(300)
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={hack} className="code rounded-xl border border-err/50 px-4 py-2 text-sm text-err" dir="ltr">
          acc.balance = -1000 // other code
        </motion.button>
        <button onClick={reset} className="text-sm text-muted hover:text-fg">
          ابدأ من جديد
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="كائن عادي" code="{ balance: 100, withdraw(n) {...} }" value={plain} log={logs?.[0]} bad />
        <Card title="صنف بحقل خاص" code="class Account { #balance = 100; ... }" value={priv} log={logs?.[1]} />
      </div>

      {hacked && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          withdraw تحرس الرصيد في الحسابين، لكن الحارس لا ينفع إذا استطاع أي سطر الكتابة في balance مباشرة. الصنف يجمع البيانات
          والطرق التي تحرسها، و <b className="text-fg">#balance</b> لا يصل إليه إلا كود داخل الصنف.
        </motion.p>
      )}
    </div>
  );
}

function Card({ title, code, value, log, bad }: { title: string; code: string; value: number; log?: Log; bad?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${bad ? "border-line bg-surface" : "border-accent/50 bg-accent-soft/20"}`}>
      <div className="font-semibold">{title}</div>
      <div className="code text-xs text-muted" dir="ltr">{code}</div>
      <div className="mt-3 flex h-20 items-center justify-center overflow-hidden rounded-xl bg-code">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className={`code text-4xl font-bold ${value < 0 ? "text-err" : "text-num"}`}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="code mt-2 h-5 text-xs" dir="ltr">
        {log && <span className={log.ok ? "text-ok" : "text-err"}>{log.text}</span>}
      </div>
    </div>
  );
}
