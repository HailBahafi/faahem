"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

/** b = a, then change a: an int makes a new object and moves label a; a list changes the one object both labels see. */
export default function PyNamesProblem() {
  const [aInt, setAInt] = useState<number | null>(null);
  const [list, setList] = useState<number[]>([1, 2]);
  const [tried, setTried] = useState({ int: false, list: false });

  const reset = () => {
    setAInt(null);
    setList([1, 2]);
    setTried({ int: false, list: false });
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel
          title="أعداد"
          setup={"a = 5\nb = a"}
          action="a = a + 1"
          onAct={() => {
            setAInt((v) => (v ?? 5) + 1);
            setTried((t) => ({ ...t, int: true }));
          }}
        >
          <div className="flex min-h-36 items-end justify-center gap-5" dir="ltr">
            <AnimatePresence initial={false}>
              <ObjCard key="five" value="5" tags={aInt === null ? ["a", "b"] : ["b"]} group="int" />
              {aInt !== null && <ObjCard key={`n${aInt}`} value={String(aInt)} tags={["a"]} group="int" fresh />}
            </AnimatePresence>
          </div>
        </Panel>
        <Panel
          title="قوائم"
          setup={"a = [1, 2]\nb = a"}
          action={`a.append(${list.length + 1})`}
          onAct={() => {
            setList((l) => [...l, l.length + 1]);
            setTried((t) => ({ ...t, list: true }));
          }}
        >
          <div className="flex min-h-36 items-end justify-center" dir="ltr">
            <ObjCard value={`[${list.join(", ")}]`} tags={["a", "b"]} group="list" pulse={list.length} />
          </div>
        </Panel>
      </div>

      <div className="mt-4 min-h-14 text-center">
        {!tried.int && !tried.list && <p className="text-muted">توقّع أولاً: بعد أن تتغيّر a، ماذا سيرى b في كل لوحة؟</p>}
        {tried.int !== tried.list && (
          <p className="text-muted">{tried.int ? "b لم يتحرّك. الآن جرّب القائمة." : "b تغيّر معها! الآن جرّب الأعداد."}</p>
        )}
        {tried.int && tried.list && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            الاسم ليس درجاً فيه قيمة، بل <b className="text-accent">بطاقة على كائن</b>. a + 1 صنعت كائناً جديداً وانتقلت إليه a وحدها؛ أما append فغيّرت
            الكائن الذي عليه البطاقتان.{" "}
            <button onClick={reset} className="text-sm text-muted underline hover:text-fg">
              ابدأ من جديد
            </button>
          </motion.p>
        )}
      </div>
    </div>
  );
}

function Panel({ title, setup, action, onAct, children }: { title: string; setup: string; action: string; onAct: () => void; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-2 font-semibold">{title}</div>
      <pre className="code rounded-lg bg-code px-3 py-2 text-sm" dir="ltr">
        {setup}
      </pre>
      {children}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onAct}
        className="code mt-3 w-full rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg"
        dir="ltr"
      >
        {action}
      </motion.button>
    </div>
  );
}

function ObjCard({ value, tags, group, fresh, pulse }: { value: string; tags: string[]; group: string; fresh?: boolean; pulse?: number }) {
  return (
    <motion.div
      layout
      initial={fresh ? { opacity: 0, scale: 0.6 } : false}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="flex h-7 gap-1.5">
        {tags.map((t) => (
          <motion.span
            key={t}
            layoutId={`${group}-${t}`}
            className={`code rounded-md px-2 py-0.5 text-sm font-bold ${t === "a" ? "bg-accent text-accent-fg" : "bg-code text-num"}`}
          >
            {t} ↓
          </motion.span>
        ))}
      </div>
      <motion.div
        key={pulse}
        initial={pulse ? { scale: 1.08 } : false}
        animate={{ scale: 1 }}
        className="code min-w-20 rounded-xl border-2 border-line bg-code px-4 py-3 text-center text-2xl font-bold text-num"
      >
        {value}
      </motion.div>
    </motion.div>
  );
}
