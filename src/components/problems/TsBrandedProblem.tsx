"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** Two string ids, swapped by mistake: only brands let the checker tell them apart. */
export default function TsBrandedProblem() {
  const [swapped, setSwapped] = useState(true);
  const [brands, setBrands] = useState(false);
  const [ran, setRan] = useState(false);

  const args = swapped ? ["order", "user"] : ["user", "order"];
  const blocked = brands && swapped;
  const userType = brands ? "UserId" : "string";
  const orderType = brands ? "OrderId" : "string";
  const vals: Record<string, string> = { user: '"u_7"', order: '"o_9"' };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setSwapped((s) => !s); setRan(false); }}
          className="rounded-xl border border-line bg-surface px-3 py-1.5 text-sm hover:bg-accent/10"
        >
          بدّل ترتيب المعاملين
        </button>
        <button
          onClick={() => { setBrands((b) => !b); setRan(false); }}
          className={`rounded-xl px-3 py-1.5 text-sm ring-1 ${brands ? "bg-accent/20 ring-accent" : "ring-line"}`}
        >
          الوسوم: {brands ? "مفعّلة" : "مطفأة"}
        </button>
      </div>

      <div dir="ltr" className="code mt-3 rounded-2xl border border-line bg-code p-4 text-sm leading-7">
        <div className="text-muted">
          function charge(user: <span className="text-accent">{userType}</span>, order: <span className="text-accent">{orderType}</span>)
        </div>
        <div>
          const user: {userType} = <span className="text-str">{vals.user}</span>;
        </div>
        <div>
          const order: {orderType} = <span className="text-str">{vals.order}</span>;
        </div>
        <div className={blocked ? "bg-err/10" : ""}>
          charge(
          {args.map((a, i) => (
            <motion.span key={a} layout className={`inline-block ${blocked ? "text-err underline decoration-wavy" : ""}`}>
              {a}
              {i === 0 ? ", " : ""}
            </motion.span>
          ))}
          );
        </div>
        <AnimatePresence>
          {blocked && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-err">
              Argument of type &apos;OrderId&apos; is not assignable to parameter of type &apos;UserId&apos;.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.94 }}
          disabled={blocked}
          onClick={() => setRan(true)}
          className="rounded-2xl bg-accent px-5 py-2.5 font-bold text-accent-fg disabled:opacity-40"
        >
          شغّل
        </motion.button>
        {blocked && <span className="text-sm text-muted">المدقّق أوقف الخطأ قبل التشغيل.</span>}
      </div>

      <AnimatePresence>
        {ran && !blocked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            dir="ltr"
            className={`code mt-3 rounded-xl border p-3 text-sm ${swapped ? "border-err bg-err/10 text-err" : "border-ok bg-ok/10 text-ok"}`}
          >
            charged user {swapped ? vals.order : vals.user} for order {swapped ? vals.user : vals.order}
            {swapped && <div className="mt-1 font-sans" dir="rtl">خُصم المبلغ من حساب غير موجود، ولم يعترض أحد: كلاهما string.</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
