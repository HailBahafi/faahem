"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Product = { id: number; name: string; price: number; category: string };

const START: Product[] = [
  { id: 1, name: "Pen", price: 5, category: "office" },
  { id: 2, name: "Bag", price: 80, category: "travel" },
  { id: 3, name: "Cup", price: 15, category: "kitchen" },
  { id: 4, name: "Lamp", price: 45, category: "home" },
  { id: 5, name: "Mug", price: 12, category: "kitchen" },
  { id: 6, name: "Book", price: 30, category: "office" },
];

type Where = { label: string; test: (p: Product) => boolean } | null;
type Order = { label: string; cmp: (a: Product, b: Product) => number } | null;

const WHERES: Where[] = [
  null,
  { label: "price > 20", test: (p) => p.price > 20 },
  { label: "category = 'kitchen'", test: (p) => p.category === "kitchen" },
];
const ORDERS: Order[] = [
  null,
  { label: "price", cmp: (a, b) => a.price - b.price },
  { label: "price DESC", cmp: (a, b) => b.price - a.price },
  { label: "name", cmp: (a, b) => a.name.localeCompare(b.name) },
];
const LIMITS: (number | null)[] = [null, 2];

/** Build a query from clauses and watch the database filter and sort; then an UPDATE with no WHERE. */
export default function SqlProblem() {
  const [rows, setRows] = useState(START);
  const [backup, setBackup] = useState<Product[] | null>(null);
  const [w, setW] = useState(0);
  const [ord, setOrd] = useState(0);
  const [lim, setLim] = useState(0);

  const where = WHERES[w];
  const order = ORDERS[ord];
  const limit = LIMITS[lim];

  let result = rows.filter((p) => !where || where.test(p));
  if (order) result = [...result].sort(order.cmp);
  if (limit) result = result.slice(0, limit);
  const shown = new Set(result.map((p) => p.id));
  const visible = [...result, ...rows.filter((p) => !shown.has(p.id))];

  const disaster = () => {
    setBackup(rows);
    setRows(rows.map((p) => ({ ...p, price: 0 })));
  };
  const undo = () => {
    if (backup) setRows(backup);
    setBackup(null);
  };

  const chip = (on: boolean) =>
    `code rounded-xl border px-3 py-1.5 text-sm ${on ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"}`;

  return (
    <div>
      <div className="code rounded-2xl bg-code p-4 text-sm leading-7" dir="ltr">
        <div>
          <span className="text-bool">SELECT</span> * <span className="text-bool">FROM</span> products
        </div>
        {where && (
          <div>
            <span className="text-bool">WHERE</span> <span className="text-str">{where.label}</span>
          </div>
        )}
        {order && (
          <div>
            <span className="text-bool">ORDER BY</span> <span className="text-str">{order.label}</span>
          </div>
        )}
        {limit && (
          <div>
            <span className="text-bool">LIMIT</span> <span className="text-num">{limit}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2" dir="ltr">
        {[
          { name: "WHERE", items: WHERES.map((x) => x?.label ?? "—"), cur: w, set: setW },
          { name: "ORDER BY", items: ORDERS.map((x) => x?.label ?? "—"), cur: ord, set: setOrd },
          { name: "LIMIT", items: LIMITS.map((x) => (x ? String(x) : "—")), cur: lim, set: setLim },
        ].map((g) => (
          <div key={g.name} className="flex flex-wrap items-center gap-2">
            <span className="code w-20 text-xs text-muted">{g.name}</span>
            {g.items.map((label, i) => (
              <motion.button key={label} whileTap={{ scale: 0.92 }} onClick={() => g.set(i)} className={chip(g.cur === i)}>
                {label}
              </motion.button>
            ))}
          </div>
        ))}
      </div>

      <div className="code mt-4 rounded-2xl border border-line p-3 text-sm" dir="ltr">
        <div className="grid grid-cols-4 gap-2 px-2 pb-2 text-muted">
          <span>id</span>
          <span>name</span>
          <span>price</span>
          <span>category</span>
        </div>
        <AnimatePresence initial={false}>
          {visible.map((p) => {
            const on = shown.has(p.id);
            return (
              <motion.div
                key={p.id}
                layout
                animate={{ opacity: on ? 1 : 0.25 }}
                className={`grid grid-cols-4 gap-2 rounded-lg px-2 py-1.5 ${on ? "bg-surface" : ""}`}
              >
                <span className="text-num">{p.id}</span>
                <span className="text-str">{p.name}</span>
                <motion.span key={p.price} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className={backup ? "text-err" : "text-num"}>
                  {p.price}
                </motion.span>
                <span className="text-str">{p.category}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!backup ? (
          <motion.button whileTap={{ scale: 0.92 }} onClick={disaster} className="code rounded-2xl border border-err px-4 py-3 text-sm font-bold text-err" dir="ltr">
            UPDATE products SET price = 0;
          </motion.button>
        ) : (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.92 }} onClick={undo} className="rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20">
            تراجع
          </motion.button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {backup ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            لا WHERE، فكل الصفوف طابقت: {rows.length} منتجات صار سعرها 0. القاعدة الحقيقية لا زر تراجع فيها.
          </motion.p>
        ) : (
          <p className="text-muted">
            {result.length} من {rows.length} صفوف. أنت وصفت النتيجة، والقاعدة وجدت الصفوف ورتّبتها.
          </p>
        )}
      </div>
    </div>
  );
}
