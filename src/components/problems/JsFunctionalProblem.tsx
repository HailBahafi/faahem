"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

type Cart = { items: string[] };
const ITEMS = ["tea", "cake", "juice", "cookie"];

/** An undo history of carts: mutating one shared cart breaks it, new values keep it. */
export default function JsFunctionalProblem() {
  const [pure, setPure] = useState(false);
  const cart = useRef<Cart>({ items: [] });
  const [history, setHistory] = useState<Cart[]>([]);
  const [, tick] = useState(0);

  const add = () => {
    const item = ITEMS[history.length % ITEMS.length];
    if (pure) {
      cart.current = { items: [...cart.current.items, item] };
    } else {
      cart.current.items.push(item);
    }
    setHistory((h) => [...h, cart.current]);
    tick((t) => t + 1);
  };

  const reset = (mode: boolean) => {
    setPure(mode);
    cart.current = { items: [] };
    setHistory([]);
  };

  const broken = !pure && history.length >= 2;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <ModeBtn on={!pure} onClick={() => reset(false)}>
          cart.items.push(item)
        </ModeBtn>
        <ModeBtn on={pure} onClick={() => reset(true)}>
          {"{ items: [...cart.items, item] }"}
        </ModeBtn>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.94 }} onClick={add} className="rounded-xl bg-accent px-5 py-2 font-bold text-accent-fg">
          أضف صنفاً
        </motion.button>
        <span className="text-sm text-muted">كل ضغطة تحفظ السلة في سجل التراجع</span>
      </div>
      <div className="mt-4 rounded-2xl border border-line bg-surface p-4" dir="ltr">
        <div className="text-xs font-semibold text-muted">history (undo)</div>
        <div className="mt-2 flex flex-col gap-1.5">
          <AnimatePresence>
            {history.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`code rounded-lg px-3 py-1.5 text-sm ${broken ? "bg-err/10 text-err" : "bg-code text-white"}`}
              >
                <span className="text-muted">#{i + 1}</span> [{c.items.map((x) => `"${x}"`).join(", ")}]
              </motion.div>
            ))}
          </AnimatePresence>
          {!history.length && <div className="text-sm text-muted">empty</div>}
        </div>
      </div>
      {broken && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          كل حالات السجل متطابقة! السجل حفظ <b className="text-fg">السهم نفسه</b> عدة مرات، و push عدّلت الكائن الوحيد الذي تشير إليه كلها. جرّب الطريقة الثانية.
        </motion.p>
      )}
      {pure && history.length >= 2 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          كل إضافة صنعت سلة جديدة وتركت القديمة كما هي، فكل حالة في السجل صحيحة. هذا ما تعتمد عليه Redux و React.
        </motion.p>
      )}
    </div>
  );
}

function ModeBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      dir="ltr"
      className={`code rounded-xl px-3 py-2 text-xs font-bold ${on ? "bg-accent text-accent-fg" : "border border-line bg-surface"}`}
    >
      {children}
    </button>
  );
}
