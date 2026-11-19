"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Todo = { id: number; text: string };
type View = { count: string; empty: boolean; items: Todo[] };

const POOL = ["milk", "bread", "eggs", "tea", "rice", "dates"];
const countText = (n: number) => `${n} tasks`;

/** React's way: the whole screen is a function of the state. */
const render = (todos: Todo[]): View => ({ count: countText(todos.length), empty: todos.length === 0, items: todos });

/** Compare two descriptions and list the DOM nodes that must change, like React's reconciliation. */
function diff(prev: View, next: View): string[] {
  const touched: string[] = [];
  if (prev.count !== next.count) touched.push(`h3 text → "${next.count}"`);
  if (prev.empty !== next.empty) touched.push(next.empty ? "p.empty added" : "p.empty removed");
  const before = new Set(prev.items.map((t) => t.id));
  const after = new Set(next.items.map((t) => t.id));
  for (const t of next.items) if (!before.has(t.id)) touched.push(`li "${t.text}" added`);
  for (const t of prev.items) if (!after.has(t.id)) touched.push(`li "${t.text}" removed`);
  return touched;
}

const ADD_LINES = ["ul.append(li);", "count.textContent = n + ' tasks';", "empty.hidden = true;"];
const REMOVE_LINES = ["li.remove();", "if (n === 0) empty.hidden = false;"];

function Page({ view, flash, stale }: { view: View; flash: string[]; stale?: boolean }) {
  const hot = (key: string) => flash.some((f) => f.startsWith(key));
  return (
    <div className="min-h-44 rounded-xl border border-line bg-surface p-3 text-sm" dir="ltr">
      <motion.h3
        key={`h3-${view.count}-${hot("h3")}`}
        initial={hot("h3") ? { backgroundColor: "rgba(250,204,21,0.5)" } : false}
        animate={{ backgroundColor: "rgba(250,204,21,0)" }}
        transition={{ duration: 1.2 }}
        className={`mb-2 rounded px-1 font-bold ${stale ? "text-err line-through decoration-2" : ""}`}
      >
        {view.count}
      </motion.h3>
      {view.empty && <p className="px-1 text-muted">No tasks</p>}
      <ul className="flex flex-col gap-1">
        <AnimatePresence initial={false}>
          {view.items.map((t) => (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, x: -10, backgroundColor: "rgba(250,204,21,0.5)" }}
              animate={{ opacity: 1, x: 0, backgroundColor: "rgba(250,204,21,0)" }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.6 }}
              className="code rounded px-2 py-1"
            >
              • {t.text}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/** One todo list built twice: imperative DOM updates by hand versus a view recomputed from state. */
export default function ReactProblem() {
  const [nextId, setNextId] = useState(0);
  // Imperative side: three separate "DOM" spots, each updated by its own line.
  const [manual, setManual] = useState<View>({ count: countText(0), empty: true, items: [] });
  const [ran, setRan] = useState<{ lines: string[]; forgot: boolean } | null>(null);
  // React side: only the state; the screen is render(todos).
  const [todos, setTodos] = useState<Todo[]>([]);
  const [touched, setTouched] = useState<string[]>([]);

  const commit = (next: Todo[]) => {
    setTouched(diff(render(todos), render(next)));
    setTodos(next);
  };

  const add = () => {
    const t = { id: nextId, text: POOL[nextId % POOL.length] };
    setNextId(nextId + 1);
    const items = [...manual.items, t];
    setManual({ count: countText(items.length), empty: false, items });
    setRan({ lines: ADD_LINES, forgot: false });
    commit([...todos, t]);
  };

  const remove = (id: number) => {
    const items = manual.items.filter((t) => t.id !== id);
    // The bug: the remove handler never updates the count.
    setManual({ count: manual.count, empty: items.length === 0, items });
    setRan({ lines: REMOVE_LINES, forgot: true });
    commit(todos.filter((t) => t.id !== id));
  };

  const reset = () => {
    setNextId(0);
    setManual({ count: countText(0), empty: true, items: [] });
    setRan(null);
    setTodos([]);
    setTouched([]);
  };

  const stale = manual.count !== countText(manual.items.length);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold">بيدك: DOM خطوة خطوة</div>
          <Page view={manual} flash={[]} stale={stale} />
          <div className="code min-h-24 rounded-xl bg-code p-3 text-xs leading-6" dir="ltr">
            {ran ? (
              <>
                {ran.lines.map((l) => (
                  <motion.div key={l} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {l}
                  </motion.div>
                ))}
                {ran.forgot && <div className="font-bold text-err">{"// forgot: count.textContent = ..."}</div>}
              </>
            ) : (
              <span className="text-muted">{"// each change = update 3 places"}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold">React: الشاشة = render(state)</div>
          <Page view={render(todos)} flash={touched} />
          <div className="code min-h-24 rounded-xl bg-code p-3 text-xs leading-6" dir="ltr">
            <div>
              <span className="text-muted">state:</span> todos = [
              <span className="text-str">{todos.map((t) => `"${t.text}"`).join(", ")}</span>]
            </div>
            <div className="text-muted">React touched:</div>
            {touched.length ? (
              touched.map((t) => (
                <motion.div key={t} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="text-num">
                  {t}
                </motion.div>
              ))
            ) : (
              <div className="text-muted">nothing yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={add}
          disabled={todos.length >= 5}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          أضف مهمة
        </motion.button>
        {todos.map((t) => (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => remove(t.id)}
            className="code rounded-xl border border-line px-3 py-2 text-sm hover:border-err"
            dir="ltr"
          >
            ✕ {t.text}
          </motion.button>
        ))}
        {(todos.length > 0 || ran) && (
          <button onClick={reset} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {!ran && <p className="text-muted">أضف مهمتين أو ثلاثاً، ثم احذف واحدة.</p>}
        {ran && !stale && <p className="text-muted">الجهتان متطابقتان... حتى الآن. جرّب الحذف.</p>}
        {stale && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            اليمين يقول {manual.count} والقائمة فيها {manual.items.length}: نسينا مكاناً واحداً. أما React فلم نكتب له أي سطر تحديث، حسب الشاشة من الحالة ولمس فقط ما اختلف.
          </motion.p>
        )}
      </div>
    </div>
  );
}
