"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** Prices as a form field gives them: always text. */
const PRODUCTS = [
  { name: "tea", price: "7.5" },
  { name: "cake", price: "12" },
  { name: "juice", price: "3" },
];

/** A cart whose prices arrive as text: JavaScript glues them together, Dart refuses until you convert. */
export default function DartTypesProblem() {
  const [cart, setCart] = useState<string[]>([]);
  const [parsed, setParsed] = useState(false);

  // JavaScript: total = total + price, where price is text, so + joins strings.
  const jsTotal = cart.reduce<number | string>((t, p) => (t as string) + p, 0);
  const dartTotal = cart.reduce((t, p) => t + Number(p), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {PRODUCTS.map((p) => (
          <motion.button
            key={p.name}
            whileTap={{ scale: 0.92 }}
            onClick={() => setCart([...cart, p.price])}
            className="rounded-xl border border-line bg-surface px-4 py-2 text-sm"
          >
            أضف {p.name} <span className="code text-str" dir="ltr">&quot;{p.price}&quot;</span>
          </motion.button>
        ))}
        {cart.length > 0 && (
          <button onClick={() => setCart([])} className="text-sm text-muted hover:text-fg">
            أفرغ السلة
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="font-semibold">JavaScript</div>
          <div className="code text-xs text-muted" dir="ltr">total = total + price;</div>
          <div className="mt-3 flex h-20 items-center justify-center overflow-hidden rounded-xl bg-code">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={String(jsTotal)}
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`code text-2xl font-bold ${cart.length > 0 ? "text-err" : ""}`}
                dir="ltr"
              >
                {cart.length > 0 ? `"${jsTotal}"` : "0"}
              </motion.span>
            </AnimatePresence>
          </div>
          {cart.length > 1 && <p className="mt-2 text-xs text-muted">النصوص التصقت ببعضها بلا أي تحذير.</p>}
        </div>

        <div className={`rounded-2xl border p-4 ${parsed ? "border-accent/50 bg-accent-soft/20" : "border-line bg-surface"}`}>
          <div className="font-semibold">Dart</div>
          <div className="code text-xs" dir="ltr">
            <span className="text-muted">double total = 0; </span>
            total += <span className={parsed ? "text-ok" : "rounded bg-err/15 text-err underline decoration-wavy"}>{parsed ? "double.parse(price)" : "price"}</span>;
          </div>
          <div className="mt-3 flex h-20 items-center justify-center overflow-hidden rounded-xl bg-code px-2">
            {parsed ? (
              <motion.span key={dartTotal} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="code text-2xl font-bold text-[var(--accent)]" dir="ltr">
                {dartTotal.toFixed(1)}
              </motion.span>
            ) : (
              <span className="code text-center text-xs text-err" dir="ltr">
                error: A value of type &apos;String&apos; can&apos;t be assigned to a variable of type &apos;double&apos;.
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setParsed(!parsed)}
            className="mt-3 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg"
          >
            {parsed ? "احذف التحويل" : "حوّل النص إلى عدد"}
          </motion.button>
        </div>
      </div>

      {cart.length > 1 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted">
          في JavaScript ظهر الخطأ للزبون في الفاتورة. في Dart لكل درج نوع، فلا يدخل نص في درج عدد حتى تحوّله أنت بسطر صريح.
        </motion.p>
      )}
    </div>
  );
}
