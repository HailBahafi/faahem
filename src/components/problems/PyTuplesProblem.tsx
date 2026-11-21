"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

const HOME: [number, number] = [24.7, 46.7];

/** A buggy function writes loc[0] = 0: the list copy of a location is silently corrupted, the tuple refuses. */
export default function PyTuplesProblem() {
  const [list, setList] = useState<[number, number]>(HOME);
  const [listHit, setListHit] = useState(false);
  const [tupleHit, setTupleHit] = useState(false);
  const [moves, setMoves] = useState(0);

  const reset = () => {
    setList(HOME);
    setListHit(false);
    setTupleHit(false);
    setMoves(0);
  };
  const tuple: [number, number] = [+(HOME[0] + moves * 0.1).toFixed(1), HOME[1]];

  return (
    <div>
      <div className="code mb-4 rounded-xl bg-code p-3 text-sm" dir="ltr">
        <span className="text-bool">def</span> buggy_update(loc):
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;loc[0] = <span className="text-num">0</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="في قائمة" code={`[${list[0]}, ${list[1]}]`} bad={listHit}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setList([0, list[1]]);
              setListHit(true);
            }}
            className="code rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-fg"
            dir="ltr"
          >
            buggy_update(shop_list)
          </motion.button>
          {listHit && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-err">
              تغيّر الموقع بصمت. المتجر الآن في المحيط، ولم يخبرك أحد.
            </motion.p>
          )}
        </Panel>

        <Panel title="في tuple" code={`(${tuple[0]}, ${tuple[1]})`} fresh={moves}>
          <div className="flex flex-wrap gap-2" dir="ltr">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setTupleHit(true)}
              className="code rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-fg"
            >
              buggy_update(shop)
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setMoves((m) => m + 1)}
              className="code rounded-xl border border-line px-3 py-2 text-sm"
            >
              shop = (shop[0] + 0.1, shop[1])
            </motion.button>
          </div>
          {tupleHit && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-ok">
              <span className="code" dir="ltr">TypeError</span>: الخطأ ظهر فوراً، والموقع لم يتغير.
            </motion.p>
          )}
          {moves > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-muted">
              تغيير مقصود؟ يُبنى tuple جديد، وينتقل إليه الاسم shop.
            </motion.p>
          )}
        </Panel>
      </div>

      {(listHit || tupleHit || moves > 0) && (
        <button onClick={reset} className="mt-4 text-sm text-muted hover:text-fg">
          ابدأ من جديد
        </button>
      )}
    </div>
  );
}

function Panel({ title, code, bad, fresh, children }: { title: string; code: string; bad?: boolean; fresh?: number; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border p-4 ${bad ? "border-line bg-surface" : "border-accent/50 bg-accent-soft/20"}`}>
      <div className="mb-3 font-semibold">{title}</div>
      <div className="mb-3 flex h-16 items-center justify-center overflow-hidden rounded-xl bg-code">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={code + (fresh ?? "")}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={`code text-2xl font-bold ${bad ? "text-err" : "text-num"}`}
            dir="ltr"
          >
            {code}
          </motion.span>
        </AnimatePresence>
      </div>
      {children}
    </div>
  );
}
