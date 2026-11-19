"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Customer = { id: number; name: string; phone: string };
type Order = { id: number; customerId: number; item: string };
type Phase = "messy" | "split";

const CUSTOMERS: Customer[] = [
  { id: 1, name: "Sara", phone: "0551" },
  { id: 2, name: "Omar", phone: "0552" },
];
const ORDERS: Order[] = [
  { id: 10, customerId: 1, item: "Pen" },
  { id: 11, customerId: 1, item: "Cup" },
  { id: 12, customerId: 2, item: "Bag" },
  { id: 13, customerId: 1, item: "Lamp" },
  { id: 14, customerId: 2, item: "Mug" },
];
const NEW_PHONE = "0559";

// Fixed row geometry so the JOIN lines can be drawn between the two tables.
const HEAD = 32;
const ROW = 40;
const GAP = 72;
const mid = (i: number) => HEAD + i * ROW + ROW / 2;
const LINE_COLORS = ["var(--accent)", "var(--num)"];

/** A copied name goes stale; split into two tables, the name lives once and JOIN follows the ids. */
export default function RelationsProblem() {
  const [phase, setPhase] = useState<Phase>("messy");
  // messy table: each order carries its own copy of the customer's phone
  const [copies, setCopies] = useState(ORDERS.map((o) => CUSTOMERS.find((c) => c.id === o.customerId)!.phone));
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [changed, setChanged] = useState(false);
  const [joined, setJoined] = useState(-1); // -1: not joining; n: first n orders followed

  useEffect(() => {
    if (joined < 0 || joined >= ORDERS.length) return;
    const t = setTimeout(() => setJoined((j) => j + 1), 700);
    return () => clearTimeout(t);
  }, [joined]);

  const changePhone = () => {
    setChanged(true);
    if (phase === "messy") setCopies((cs) => cs.map((p, i) => (i === 0 ? NEW_PHONE : p))); // fixed one copy, missed the rest
    else setCustomers((cs) => cs.map((c) => (c.id === 1 ? { ...c, phone: NEW_PHONE } : c)));
  };
  const split = () => {
    setPhase("split");
    setCustomers(CUSTOMERS);
    setChanged(false);
    setJoined(-1);
  };
  const reset = () => {
    setPhase("messy");
    setCopies(ORDERS.map((o) => CUSTOMERS.find((c) => c.id === o.customerId)!.phone));
    setCustomers(CUSTOMERS);
    setChanged(false);
    setJoined(-1);
  };

  const custOf = (o: Order) => customers.find((c) => c.id === o.customerId)!;
  const custIndex = (o: Order) => customers.findIndex((c) => c.id === o.customerId);
  const staleCount = ORDERS.filter((o, i) => o.customerId === 1 && copies[i] !== NEW_PHONE).length;
  const cell = "flex h-10 items-center gap-3 border-b border-line px-2";

  return (
    <div>
      <div className="code overflow-x-auto rounded-2xl bg-code p-4 text-sm" dir="ltr">
        {phase === "messy" ? (
          <div className="min-w-72">
            <div className="grid h-8 grid-cols-4 items-center px-2 text-muted">
              <span>order</span>
              <span>customer</span>
              <span>phone</span>
              <span>item</span>
            </div>
            {ORDERS.map((o, i) => {
              const c = CUSTOMERS.find((x) => x.id === o.customerId)!;
              const stale = changed && o.customerId === 1 && copies[i] !== NEW_PHONE;
              return (
                <div key={o.id} className="grid h-10 grid-cols-4 items-center border-b border-line px-2">
                  <span className="text-num">{o.id}</span>
                  <span className="text-str">{c.name}</span>
                  <motion.span key={copies[i]} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className={stale ? "font-bold text-err" : copies[i] === NEW_PHONE ? "text-ok" : "text-num"}>
                    {copies[i]}
                  </motion.span>
                  <span className="text-str">{o.item}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid min-w-72" style={{ gridTemplateColumns: `1fr ${GAP}px 1fr` }}>
              <div>
                <div className="flex h-8 items-center gap-3 px-2 text-muted">
                  <span className="w-8">id</span>
                  <span className="w-20">customer_id</span>
                  <span>item</span>
                </div>
                {ORDERS.map((o, i) => (
                  <div key={o.id} className={`${cell} ${joined > i ? "bg-surface" : ""}`}>
                    <span className="w-8 text-num">{o.id}</span>
                    <span className="w-20 font-bold" style={{ color: LINE_COLORS[o.customerId - 1] }}>
                      → {o.customerId}
                    </span>
                    <span className="text-str">{o.item}</span>
                  </div>
                ))}
              </div>
              <svg width={GAP} height={HEAD + ORDERS.length * ROW} className="block">
                {joined >= 0 &&
                  ORDERS.slice(0, joined).map((o, i) => (
                    <motion.path
                      key={o.id}
                      d={`M 0 ${mid(i)} C ${GAP / 2} ${mid(i)}, ${GAP / 2} ${mid(custIndex(o))}, ${GAP} ${mid(custIndex(o))}`}
                      fill="none"
                      stroke={LINE_COLORS[o.customerId - 1]}
                      strokeWidth={2}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  ))}
              </svg>
              <div>
                <div className="flex h-8 items-center gap-3 px-2 text-muted">
                  <span className="w-6">id</span>
                  <span className="w-12">name</span>
                  <span>phone</span>
                </div>
                {customers.map((c) => (
                  <div key={c.id} className={cell}>
                    <span className="w-6 font-bold" style={{ color: LINE_COLORS[c.id - 1] }}>
                      {c.id}
                    </span>
                    <span className="w-12 text-str">{c.name}</span>
                    <motion.span key={c.phone} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className={c.phone === NEW_PHONE ? "text-ok" : "text-num"}>
                      {c.phone}
                    </motion.span>
                  </div>
                ))}
              </div>
            </div>

            {joined > 0 && (
              <div className="mt-4 border-t border-line pt-3">
                <div className="text-muted">item | name | phone</div>
                <AnimatePresence>
                  {ORDERS.slice(0, joined).map((o) => (
                    <motion.div key={o.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                      <span className="text-str">{o.item}</span> | <span className="text-str">{custOf(o).name}</span> |{" "}
                      <span className={custOf(o).phone === NEW_PHONE ? "text-ok" : "text-num"}>{custOf(o).phone}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={changePhone} disabled={changed} className="rounded-2xl border border-line px-5 py-3 font-bold disabled:opacity-40">
          Sara غيّرت رقمها إلى {NEW_PHONE}
        </motion.button>
        {phase === "messy" && changed && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.92 }} onClick={split} className="rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20">
            قسّم إلى جدولين
          </motion.button>
        )}
        {phase === "split" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setJoined(0)}
            disabled={joined >= 0 && joined < ORDERS.length}
            className="code rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
          >
            JOIN
          </motion.button>
        )}
        {(changed || phase === "split") && (
          <button onClick={reset} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {phase === "messy" && !changed && <p className="text-muted">رقم Sara مكتوب في ثلاثة صفوف. غيّره.</p>}
        {phase === "messy" && changed && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            عدّلنا صفاً واحداً، وبقي الرقم القديم في {staleCount} صفوف أخرى. أي الرقمين هو الصحيح؟
          </motion.p>
        )}
        {phase === "split" && joined < 0 && (
          <p className="text-muted">
            {changed ? "تغيّر الرقم في مكان واحد. الآن اضغط JOIN." : "كل عميل مكتوب مرة واحدة، والطلب يحمل رقمه فقط. غيّر الهاتف ثم اضغط JOIN."}
          </p>
        )}
        {phase === "split" && joined >= ORDERS.length && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            كل طلب تبع سهمه إلى صاحبه، فظهر الرقم {changed ? "الجديد" : "نفسه"} مع كل طلباته. هذه هي <b className="text-fg">العلاقات</b>.
          </motion.p>
        )}
      </div>
    </div>
  );
}
