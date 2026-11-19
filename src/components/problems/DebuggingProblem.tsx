"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// A buggy program: line 5 reads `qty` where it should read `discount`.
const LINES = [
  "let price = 40;",
  "let qty = 3;",
  "let subtotal = price * qty;",
  "let discount = 20;",
  "let afterDiscount = subtotal - qty;",
  "let shipping = 15;",
  "let total = afterDiscount + shipping;",
  "console.log(total);",
];
const FIXED_LINE = "let afterDiscount = subtotal - discount;";
const BUG = 4; // zero-based index of line 5

type Var = [name: string, actual: number, expected: number];

/** The drawers after each line: what the program holds, and what we expected it to hold. */
function snapshot(line: number, fixed: boolean): Var[] {
  const price = 40, qty = 3, subtotal = price * qty, discount = 20, shipping = 15;
  const after = fixed ? subtotal - discount : subtotal - qty;
  const all: Var[] = [
    ["price", price, 40],
    ["qty", qty, 3],
    ["subtotal", subtotal, 120],
    ["discount", discount, 20],
    ["afterDiscount", after, 100],
    ["shipping", shipping, 15],
    ["total", after + shipping, 115],
  ];
  return all.slice(0, Math.min(line + 1, all.length));
}

/** Drop a probe on a line, read the drawers there, and corner the first line where reality leaves expectation. */
export default function DebuggingProblem() {
  const [probe, setProbe] = useState<number | null>(null);
  const [seen, setSeen] = useState<Record<number, boolean>>({}); // line -> was it correct
  const [fixed, setFixed] = useState(false);
  const [over, setOver] = useState<number | null>(null);

  const place = (k: number) => {
    if (fixed) return;
    setProbe(k);
    const ok = snapshot(k, false).every(([, a, e]) => a === e);
    setSeen((s) => ({ ...s, [k]: ok }));
  };

  const found = seen[BUG] === false && seen[BUG - 1] === true;
  const printed = fixed ? 115 : 132;
  const vars = probe === null ? [] : snapshot(probe, fixed);
  const reset = () => {
    setProbe(null);
    setSeen({});
    setFixed(false);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-lg border border-line bg-surface px-3 py-1">
          المتوقع <b className="code text-ok">115</b>
        </span>
        <span className="rounded-lg border border-line bg-surface px-3 py-1">
          المطبوع <b className={`code ${fixed ? "text-ok" : "text-err"}`}>{printed}</b>
        </span>
        {!fixed && (
          <span
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", "probe")}
            className="cursor-grab rounded-lg bg-accent px-3 py-1 font-bold text-accent-fg shadow"
          >
            ◎ اسحب المسبار إلى سطر
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
        <div className="rounded-2xl border border-line bg-code p-2" dir="ltr">
          {LINES.map((text, k) => {
            const mark = seen[k];
            const isProbe = probe === k;
            return (
              <button
                key={k}
                onClick={() => place(k)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(k);
                }}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setOver(null);
                  place(k);
                }}
                className={`code flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                  isProbe ? "bg-accent/20" : over === k ? "bg-accent/10" : "hover:bg-surface"
                }`}
              >
                <span className="w-4 text-right text-muted">{k + 1}</span>
                <span className="flex-1">{fixed && k === BUG ? <span className="text-ok">{FIXED_LINE}</span> : text}</span>
                <span className="w-5 text-center">
                  {isProbe && "◎"}
                  {!isProbe && mark === true && <span className="text-ok">✓</span>}
                  {!isProbe && mark === false && <span className="text-err">✗</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-3">
          {probe === null ? (
            <p className="text-sm text-muted">ضع المسبار على سطر لترى الأدراج بعده.</p>
          ) : (
            <>
              <p className="mb-2 text-sm text-muted">بعد السطر {probe + 1}:</p>
              <div className="flex flex-col gap-1" dir="ltr">
                <AnimatePresence initial={false}>
                  {vars.map(([name, actual, expected]) => {
                    const ok = actual === expected;
                    return (
                      <motion.div
                        key={name + probe}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`code flex items-center justify-between rounded-lg border px-2 py-1 text-sm ${
                          ok ? "border-line" : "border-err bg-err/10"
                        }`}
                      >
                        <span>{name}</span>
                        <span>
                          <b className={ok ? "text-num" : "text-err"}>{actual}</b>
                          {!ok && <span className="text-muted"> (expected {expected})</span>}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 min-h-16">
        {!fixed && !found && Object.keys(seen).length >= 2 && (
          <p className="text-muted">
            ابحث بين آخر ✓ وأول ✗. مسبار في المنتصف يقسم الشك إلى النصف.
          </p>
        )}
        {!fixed && found && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-3">
            <p className="text-err">
              وجدته: بعد السطر 4 كل شيء صحيح، وبعد السطر 5 لا. السطر 5 يطرح <span className="code">qty</span> بدل{" "}
              <span className="code">discount</span>.
            </p>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setFixed(true);
                setProbe(LINES.length - 1);
              }}
              className="rounded-2xl bg-accent px-5 py-2 font-bold text-accent-fg shadow-lg shadow-accent/20"
            >
              أصلح السطر 5 وأعد التشغيل
            </motion.button>
          </motion.div>
        )}
        {fixed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-3">
            <p className="text-ok">
              115 ✓. سبب واحد أصلحناه فاختفت كل القيم الخاطئة بعده. الخطأ ظهر في الطباعة، لكنه وُلد في السطر 5.
            </p>
            <button onClick={reset} className="text-sm text-muted hover:text-fg">
              من جديد
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
