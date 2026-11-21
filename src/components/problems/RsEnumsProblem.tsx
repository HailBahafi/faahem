"use client";

import { motion } from "motion/react";
import { useState } from "react";

type Flags = { paid: boolean; shipped: boolean; cancelled: boolean };
const LABELS: Record<keyof Flags, string> = { paid: "is_paid", shipped: "is_shipped", cancelled: "is_cancelled" };

const STATES = [
  { tag: "Pending", data: "" },
  { tag: "Paid", data: "(amount: 120)" },
  { tag: "Shipped", data: '(tracking: "SA123")' },
  { tag: "Cancelled", data: '(reason: "late")' },
];

/** Three booleans allow 8 combinations, several of them meaningless; an enum allows exactly the 4 real states, each with its own data. */
export default function RsEnumsProblem() {
  const [flags, setFlags] = useState<Flags>({ paid: false, shipped: false, cancelled: false });
  const [state, setState] = useState(0);

  const impossible = (flags.shipped && !flags.paid) || (flags.cancelled && flags.shipped);
  const reason = flags.cancelled && flags.shipped ? "شُحن وأُلغي معاً؟" : flags.shipped && !flags.paid ? "شُحن قبل أن يُدفع؟" : "";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className={`rounded-2xl border p-4 ${impossible ? "border-err/70" : "border-line"} bg-surface`}>
        <div className="font-semibold">ثلاثة bool: 8 تركيبات</div>
        <div className="mt-3 space-y-2" dir="ltr">
          {(Object.keys(LABELS) as (keyof Flags)[]).map((k) => (
            <button
              key={k}
              onClick={() => setFlags((f) => ({ ...f, [k]: !f[k] }))}
              className="code flex w-full justify-between rounded-lg bg-code px-3 py-2 text-sm"
            >
              <span>{LABELS[k]}</span>
              <span className="text-bool">{String(flags[k])}</span>
            </button>
          ))}
        </div>
        <motion.div key={reason} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-3 text-sm ${impossible ? "text-err" : "text-muted"}`}>
          {impossible ? `حالة مستحيلة: ${reason} ولا أحد يمنعك.` : "اضغط القيم لتغيّرها."}
        </motion.div>
      </div>
      <div className="rounded-2xl border border-accent/50 bg-accent-soft/20 p-4">
        <div className="font-semibold">enum OrderState: 4 حالات فقط</div>
        <div className="mt-3 space-y-2" dir="ltr">
          {STATES.map((s, i) => (
            <motion.button
              key={s.tag}
              whileTap={{ scale: 0.97 }}
              onClick={() => setState(i)}
              className={`code flex w-full justify-between rounded-lg px-3 py-2 text-sm ${state === i ? "bg-accent text-accent-fg" : "bg-code"}`}
            >
              <span>{s.tag}</span>
              <span className={state === i ? "" : "text-muted"}>{s.data}</span>
            </motion.button>
          ))}
        </div>
        <div className="mt-3 text-sm text-muted">
          القيمة واحدة من هذه فقط، وكل حالة تحمل بياناتها: رقم التتبّع لا يوجد إلا مع Shipped.
        </div>
      </div>
    </div>
  );
}
