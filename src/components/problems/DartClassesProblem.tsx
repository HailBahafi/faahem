"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Log = { text: string; ok: boolean };

/** The same three actions on an open Map and on an Account object that guards its balance. */
export default function DartClassesProblem() {
  const [mapBalance, setMapBalance] = useState(100);
  const [objBalance, setObjBalance] = useState(100);
  const [mapLog, setMapLog] = useState<Log | null>(null);
  const [objLog, setObjLog] = useState<Log | null>(null);

  const actions = [
    {
      label: "أودع 50",
      map: () => {
        setMapBalance((b) => b + 50);
        setMapLog({ text: 'account["balance"] += 50', ok: true });
      },
      obj: () => {
        setObjBalance((b) => b + 50);
        setObjLog({ text: "account.deposit(50)", ok: true });
      },
    },
    {
      label: "اسحب 400",
      map: () => {
        setMapBalance((b) => b - 400);
        setMapLog({ text: 'account["balance"] -= 400', ok: true });
      },
      obj: () => setObjLog({ text: "withdraw(400) → false: not enough balance", ok: false }),
    },
    {
      label: "اكتب الرصيد -999 مباشرة",
      map: () => {
        setMapBalance(-999);
        setMapLog({ text: 'account["balance"] = -999', ok: true });
      },
      obj: () => setObjLog({ text: "error: The setter '_balance' isn't defined (private to account.dart)", ok: false }),
    },
  ];

  const reset = () => {
    setMapBalance(100);
    setObjBalance(100);
    setMapLog(null);
    setObjLog(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <motion.button
            key={a.label}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              a.map();
              a.obj();
            }}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg"
          >
            {a.label}
          </motion.button>
        ))}
        <button onClick={reset} className="text-sm text-muted hover:text-fg">
          ابدأ من جديد
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="خريطة مفتوحة" code={'final account = {"owner": "Sara", "balance": 100};'} balance={mapBalance} log={mapLog} />
        <Panel title="كائن من صنف Account" code={'final account = Account("Sara", initial: 100);'} balance={objBalance} log={objLog} guarded />
      </div>

      {mapBalance < 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted">
          الخريطة قبلت كل شيء، فصار الرصيد {mapBalance}. الصنف يضع البيانات خلف دوال يكتبها هو (deposit و withdraw)، والحقل الخاص _balance لا يكتبه أحد من خارجه. القواعد تعيش مع البيانات، في مكان واحد.
        </motion.p>
      )}
    </div>
  );
}

function Panel({ title, code, balance, log, guarded }: { title: string; code: string; balance: number; log: Log | null; guarded?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${guarded ? "border-accent/50 bg-accent-soft/20" : "border-line bg-surface"}`}>
      <div className="font-semibold">{title}</div>
      <div className="code text-xs text-muted" dir="ltr">
        {code}
      </div>
      <div className="mt-3 flex h-20 items-center justify-center rounded-xl bg-code">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={balance}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className={`code text-4xl font-bold ${balance < 0 ? "text-err" : "text-[var(--accent)]"}`}
          >
            {balance}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className={`code mt-2 min-h-5 text-xs ${log ? (log.ok ? "text-ok" : "text-err") : ""}`} dir="ltr">
        {log?.text}
      </div>
    </div>
  );
}
