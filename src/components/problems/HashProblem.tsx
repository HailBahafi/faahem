"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const SIZE = 5;
const START = ["Sara", "Omar", "Huda", "Ali"];
const MORE = ["Mona", "Fahad", "Lina", "Khalid", "Noura", "Yousef", "Reem", "Saad", "Dana", "Majed", "Hind", "Turki", "Abeer", "Nasser", "Jood", "Rakan", "Lama", "Ziad", "Ruba", "Bader"];

const codes = (name: string) => [...name].map((c) => c.charCodeAt(0));
const hashOf = (name: string) => codes(name).reduce((a, b) => a + b, 0) % SIZE;

type Search = { name: string; listChecks: number; bucket: number; bucketChecks: number; found: boolean };

/** Names drop into buckets by the sum of their letter codes; a lookup jumps to one bucket instead of scanning the list. */
export default function HashProblem() {
  const [names, setNames] = useState<string[]>(START);
  const [text, setText] = useState("");
  const [last, setLast] = useState<string | null>(null);
  const [search, setSearch] = useState<Search | null>(null);

  const clean = text.trim();
  const add = () => {
    if (!clean || names.includes(clean)) return;
    setNames((ns) => [...ns, clean]);
    setLast(clean);
    setSearch(null);
    setText("");
  };
  const addMany = () => {
    setNames((ns) => [...ns, ...MORE.filter((m) => !ns.includes(m))]);
    setLast(null);
    setSearch(null);
  };
  const find = () => {
    if (!clean) return;
    const at = names.indexOf(clean);
    const bucket = hashOf(clean);
    const inBucket = names.filter((n) => hashOf(n) === bucket);
    const bAt = inBucket.indexOf(clean);
    setSearch({
      name: clean,
      listChecks: at === -1 ? names.length : at + 1,
      bucket,
      bucketChecks: bAt === -1 ? inBucket.length : bAt + 1,
      found: at !== -1,
    });
    setLast(null);
  };
  const reset = () => {
    setNames(START);
    setLast(null);
    setSearch(null);
    setText("");
  };

  const lc = last ? codes(last) : [];

  return (
    <div>
      <div className="code rounded-2xl bg-code p-4 text-sm" dir="ltr">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: SIZE }, (_, b) => {
            const lit = search?.bucket === b || (last !== null && hashOf(last) === b);
            return (
              <div key={b} className={`flex min-h-32 flex-col gap-1 rounded-xl border p-1.5 ${lit ? "border-accent bg-accent/10" : "border-line"}`}>
                <div className="text-center text-muted">[{b}]</div>
                <AnimatePresence>
                  {names
                    .filter((n) => hashOf(n) === b)
                    .map((n) => {
                      const hit = search?.found && search.name === n;
                      return (
                        <motion.div
                          key={n}
                          layout
                          initial={{ opacity: 0, y: -24 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`truncate rounded-md border px-1 py-0.5 text-center text-xs ${hit ? "border-ok text-ok" : "border-line bg-surface text-str"}`}
                        >
                          {n}
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        <div className="mt-3 min-h-6 text-xs text-muted">
          {last && (
            <motion.div key={last} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="text-str">&quot;{last}&quot;</span> → {lc.join(" + ")} = <span className="text-num">{lc.reduce((a, b) => a + b, 0)}</span> → % {SIZE} = <span className="text-num">{hashOf(last)}</span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Name"
          dir="ltr"
          maxLength={12}
          className="code w-36 rounded-2xl border border-line bg-surface px-4 py-3"
        />
        <motion.button whileTap={{ scale: 0.92 }} onClick={add} className="rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20">
          أضف
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={find} className="rounded-2xl border border-line px-5 py-3 font-bold">
          ابحث
        </motion.button>
        <button onClick={addMany} className="text-sm text-muted hover:text-fg">
          أضف 20 اسماً
        </button>
        <button onClick={reset} className="text-sm text-muted hover:text-fg">
          ابدأ من جديد
        </button>
      </div>

      <div className="mt-3 min-h-16">
        {!search && <p className="text-muted">اكتب اسماً واضغط «أضف» لترى دلوه، أو اكتب اسماً موجوداً واضغط «ابحث». ({names.length} اسماً)</p>}
        {search && (
          <motion.div key={search.name + search.listChecks} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-3">
              <div className="text-sm text-muted">قائمة عادية، اسماً اسماً</div>
              <div className="text-2xl font-bold text-err">{search.listChecks} <span className="text-base font-normal">مقارنة</span></div>
            </div>
            <div className="rounded-xl border border-accent p-3">
              <div className="text-sm text-muted">قفزة إلى الدلو [{search.bucket}] ثم ما فيه فقط</div>
              <div className="text-2xl font-bold text-ok">{search.bucketChecks} <span className="text-base font-normal">مقارنة</span></div>
            </div>
            {!search.found && <p className="text-muted sm:col-span-2">الاسم غير موجود: القائمة فحصت كل شيء لتتأكد، والدلو فحص جيرانه فقط.</p>}
          </motion.div>
        )}
      </div>
    </div>
  );
}
