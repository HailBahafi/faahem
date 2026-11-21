"use client";

import { motion } from "motion/react";
import { useState } from "react";

const PRICES = [100, 40, 60];

/** A tax rate copied into three lines needs three fixes; inside one function it needs one. */
export default function PyFunctionsProblem() {
  const [rate, setRate] = useState(15);
  const [fixed, setFixed] = useState<boolean[]>([true, true, true]);
  const changed = rate !== 15;
  const stale = fixed.filter((f) => !f).length;

  const change = () => {
    setRate(5);
    setFixed([false, false, false]);
  };
  const reset = () => {
    setRate(15);
    setFixed([true, true, true]);
  };
  const total = (p: number, r: number) => Math.round(p * (1 + r / 100));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={changed}
          onClick={change}
          className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg disabled:opacity-50"
        >
          الضريبة صارت 5٪
        </motion.button>
        {changed && (
          <button onClick={reset} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-2 flex justify-between font-semibold">
            <span>الحساب منسوخ</span>
            {changed && <span className={stale ? "text-err" : "text-ok"}>{stale ? `${stale} نسخ قديمة` : "أصلحتها كلها"}</span>}
          </div>
          <div className="code space-y-1.5 text-sm" dir="ltr">
            {PRICES.map((p, i) => {
              const r = fixed[i] ? rate : 15;
              return (
                <button
                  key={p}
                  disabled={!changed || fixed[i]}
                  onClick={() => setFixed((f) => f.map((x, k) => (k === i ? true : x)))}
                  className={`flex w-full items-center justify-between rounded-lg bg-code px-3 py-2 text-start ${changed && !fixed[i] ? "ring-2 ring-err/60" : ""}`}
                >
                  <span>
                    print(round({p} * {(1 + r / 100).toFixed(2)}))
                  </span>
                  <span className={changed && !fixed[i] ? "text-err" : "text-num"}>{total(p, r)}</span>
                </button>
              );
            })}
          </div>
          {changed && stale > 0 && (
            <p className="mt-2 text-xs text-muted">اضغط كل سطر قديم لتصلحه بيدك.</p>
          )}
        </div>

        <div className="rounded-2xl border border-accent/50 bg-accent-soft/20 p-4">
          <div className="mb-2 flex justify-between font-semibold">
            <span>دالة واحدة</span>
            {changed && <span className="text-ok">تعديل واحد</span>}
          </div>
          <pre className="code rounded-lg bg-code p-3 text-sm" dir="ltr">
            {"def with_tax(price):\n    return round(price * "}
            <motion.span key={rate} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-num">
              {(1 + rate / 100).toFixed(2)}
            </motion.span>
            {")"}
          </pre>
          <div className="code mt-2 space-y-1 text-sm" dir="ltr">
            {PRICES.map((p) => (
              <div key={p} className="flex justify-between rounded-lg bg-code px-3 py-1.5">
                <span>print(with_tax({p}))</span>
                <span className="text-num">{total(p, rate)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 min-h-10 text-center">
        {changed && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {stale
              ? "في البرامج الحقيقية تكون النسخ في ملفات متفرقة، وتنسى واحدة بسهولة. "
              : "أصلحتها، لكن بثلاثة تعديلات. "}
            الدالة تعطي الحساب <b className="text-accent">اسماً ومكاناً واحداً</b>: تعدّله مرة، فيتغيّر في كل استدعاء.
          </motion.p>
        )}
      </div>
    </div>
  );
}
