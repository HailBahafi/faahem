"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Header = { arr: number; off: number; len: number; cap: number };
type State = { arrays: number[][]; a: Header; b: Header; next: number; moved: boolean; shared: boolean };

const NEXT = [7, 8, 9, 11, 12, 13, 14, 15, 16];
const start = (): State => ({
  arrays: [[10, 20, 30, 40]],
  a: { arr: 0, off: 0, len: 2, cap: 4 },
  b: { arr: 0, off: 1, len: 2, cap: 3 },
  next: 0,
  moved: false,
  shared: false,
});

function view(arrays: number[][], s: Header) {
  return arrays[s.arr].slice(s.off, s.off + s.len);
}

/** Two slices over one array: append writes in place while there is capacity, then moves a to a new array. */
export default function GoSlicesProblem() {
  const [st, setSt] = useState<State>(start);
  const done = st.next >= NEXT.length;

  const append = () => {
    if (done) return;
    setSt((s) => {
      const v = NEXT[s.next];
      const arrays = s.arrays.map((r) => [...r]);
      const a = s.a;
      if (a.len < a.cap) {
        arrays[a.arr][a.off + a.len] = v;
        const bArr = s.b.arr === a.arr && a.off + a.len >= s.b.off && a.off + a.len < s.b.off + s.b.len;
        return { ...s, arrays, a: { ...a, len: a.len + 1 }, next: s.next + 1, moved: false, shared: bArr };
      }
      const cap = a.cap * 2;
      const bigger = Array(cap).fill(0);
      view(s.arrays, a).forEach((x, i) => (bigger[i] = x));
      bigger[a.len] = v;
      arrays.push(bigger);
      return { ...s, arrays, a: { arr: arrays.length - 1, off: 0, len: a.len + 1, cap }, next: s.next + 1, moved: true, shared: false };
    });
  };

  const writeB = () =>
    setSt((s) => {
      const arrays = s.arrays.map((r) => [...r]);
      arrays[s.b.arr][s.b.off] = 99;
      return { ...s, arrays, moved: false, shared: false };
    });

  return (
    <div dir="ltr">
      <div className="grid gap-4">
        {st.arrays.map((arr, id) => (
          <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-1">
            <div className="code text-xs text-muted">{id === 0 ? "arr [4]int" : `new array (cap ${arr.length})`}</div>
            <div className="flex flex-wrap">
              {arr.map((v, i) => {
                const inA = st.a.arr === id && i >= st.a.off && i < st.a.off + st.a.len;
                const inB = st.b.arr === id && i >= st.b.off && i < st.b.off + st.b.len;
                const capA = st.a.arr === id && i >= st.a.off + st.a.len && i < st.a.off + st.a.cap;
                return (
                  <div key={i} className="flex w-14 flex-col items-center">
                    <div className={`h-1.5 w-full ${inA ? "bg-accent" : capA ? "bg-accent/25" : ""}`} />
                    <motion.div
                      key={v}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className={`code m-0.5 flex h-12 w-12 items-center justify-center rounded-lg border bg-code font-bold ${inA || inB ? "border-accent/60 text-num" : "border-line text-muted"}`}
                    >
                      {v}
                    </motion.div>
                    <div className={`h-1.5 w-full ${inB ? "bg-[#c084fc]" : ""}`} />
                    <span className="code text-[10px] text-muted">{i}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <HeaderCard name="a" color="bg-accent" s={st.a} vals={view(st.arrays, st.a)} arrName={st.a.arr === 0 ? "arr" : "new"} />
        <HeaderCard name="b" color="bg-[#c084fc]" s={st.b} vals={view(st.arrays, st.b)} arrName="arr" />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={done}
          onClick={append}
          className="code rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          a = append(a, {done ? "…" : NEXT[st.next]})
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={writeB} className="code rounded-2xl border border-line px-4 py-3 font-bold">
          b[0] = 99
        </motion.button>
        {st.next > 0 && (
          <button onClick={() => setSt(start())} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12" dir="rtl">
        <AnimatePresence mode="wait">
          {st.shared && (
            <motion.p key="shared" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-err">
              أضفت إلى a، فتغيّر b! كانت هناك سعة، فكتب append في خانة يراها b أيضاً.
            </motion.p>
          )}
          {st.moved && (
            <motion.p key="moved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-muted">
              امتلأت السعة: حُجزت <b className="text-fg">مصفوفة جديدة بضعف الحجم</b> ونُسخت إليها القيم، وصار مؤشر a يدل عليها. جرّب b[0] = 99 الآن: هل يراه a؟
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HeaderCard({ name, color, s, vals, arrName }: { name: string; color: string; s: Header; vals: number[]; arrName: string }) {
  return (
    <div className="code flex items-center gap-2 rounded-xl border border-line bg-surface p-3 text-sm">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <b>{name}</b>
      <span className="text-muted">
        {"{"}ptr: &amp;{arrName}[{s.off}], len: <span className="text-num">{s.len}</span>, cap: <span className="text-num">{s.cap}</span>
        {"}"}
      </span>
      <span>→ [{vals.join(" ")}]</span>
    </div>
  );
}
