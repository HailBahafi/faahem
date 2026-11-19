"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

type Kind = "read" | "write";
type Borrow = { name: string; kind: Kind; start: number; end: number | null };
type Line = { code: string; ok: boolean; msg?: string };

const READ_ERR = "error[E0502]: cannot borrow `book` as immutable because it is also borrowed as mutable";
const WRITE_AFTER_READ = "error[E0502]: cannot borrow `book` as mutable because it is also borrowed as immutable";
const TWO_WRITERS = "error[E0499]: cannot borrow `book` as mutable more than once at a time";
const DROP_ERR = "error[E0505]: cannot move out of `book` because it is borrowed";

const START: Line[] = [{ code: 'let mut book = String::from("Dune");', ok: true }];

/** A library book lent to readers or to one writer with a pen; the borrow checker judges every request. */
export default function BorrowingProblem() {
  const [lines, setLines] = useState<Line[]>(START);
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [rejects, setRejects] = useState<number[]>([]);
  const [dropped, setDropped] = useState(false);
  const [counts, setCounts] = useState({ r: 0, w: 0 });

  const tick = lines.length; // the next line's index
  const active = borrows.filter((b) => b.end === null);
  const readers = active.filter((b) => b.kind === "read");
  const writer = active.find((b) => b.kind === "write");
  const last = lines[lines.length - 1];

  const push = (line: Line) => {
    setLines((l) => [...l, line]);
    if (!line.ok) setRejects((r) => [...r, tick]);
  };

  const lendRead = () => {
    const name = `r${counts.r + 1}`;
    const code = `let ${name} = &book;`;
    if (writer) return push({ code, ok: false, msg: READ_ERR });
    setCounts((c) => ({ ...c, r: c.r + 1 }));
    setBorrows((b) => [...b, { name, kind: "read", start: tick, end: null }]);
    push({ code, ok: true });
  };

  const lendWrite = () => {
    const name = `w${counts.w + 1}`;
    const code = `let ${name} = &mut book;`;
    if (writer) return push({ code, ok: false, msg: TWO_WRITERS });
    if (readers.length) return push({ code, ok: false, msg: WRITE_AFTER_READ });
    setCounts((c) => ({ ...c, w: c.w + 1 }));
    setBorrows((b) => [...b, { name, kind: "write", start: tick, end: null }]);
    push({ code, ok: true });
  };

  const finish = (name: string) => {
    const b = borrows.find((x) => x.name === name)!;
    setBorrows((all) => all.map((x) => (x.name === name ? { ...x, end: tick } : x)));
    push({ code: b.kind === "read" ? `println!("{}", ${name}); // last use` : `${name}.push_str("!"); // last use`, ok: true });
  };

  const drop = () => {
    const code = "drop(book);";
    if (active.length) return push({ code, ok: false, msg: DROP_ERR });
    setDropped(true);
    push({ code, ok: true });
  };

  const reset = () => {
    setLines(START);
    setBorrows([]);
    setRejects([]);
    setDropped(false);
    setCounts({ r: 0, w: 0 });
  };

  const cols = Math.max(tick, 6);
  const pct = (i: number) => `${(i / cols) * 100}%`;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
        {/* The book and who holds it */}
        <div className="flex flex-col gap-3">
          <div className="relative flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface p-4">
            <motion.div
              animate={{ opacity: dropped ? 0.25 : 1, rotate: writer ? -3 : 0, scale: writer ? 1.05 : 1 }}
              className={`code flex h-24 w-20 flex-col items-center justify-center rounded-lg border-2 text-sm font-bold ${
                writer ? "border-bool bg-bool/10 text-bool" : "border-str bg-str/10 text-str"
              }`}
            >
              <span>book</span>
              <span className="text-xs opacity-80">{dropped ? "freed" : '"Dune"'}</span>
            </motion.div>
            <div className="flex min-h-9 flex-wrap justify-center gap-2" dir="ltr">
              <AnimatePresence>
                {active.map((b) => (
                  <motion.button
                    key={b.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={() => finish(b.name)}
                    title="آخر استعمال: أعِد الكتاب"
                    className={`code rounded-lg px-2.5 py-1 text-xs font-bold ${b.kind === "write" ? "bg-bool text-white" : "bg-accent text-accent-fg"}`}
                  >
                    {b.kind === "write" ? `${b.name}: &mut (pen)` : `${b.name}: & (read)`} ✓
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
            <p className="text-center text-xs text-muted">
              {dropped
                ? "حُرّر الكتاب، ولم يبقَ سهم يشير إليه."
                : active.length
                  ? "اضغط على مستعير لتنهي استعارته (آخر استعمال له)."
                  : "الكتاب على الرف. لا أحد يستعيره."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <motion.button whileTap={{ scale: 0.94 }} disabled={dropped} onClick={lendRead} className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg disabled:opacity-40">
              أعِر قارئاً <span className="code">&amp;book</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.94 }} disabled={dropped} onClick={lendWrite} className="rounded-xl bg-bool px-4 py-2 text-sm font-bold text-white disabled:opacity-40">
              أعِر كاتباً بقلم <span className="code">&amp;mut book</span>
            </motion.button>
            <button disabled={dropped} onClick={drop} className="rounded-xl border border-err/60 px-4 py-2 text-sm font-bold text-err disabled:opacity-40">
              حرّر الكتاب <span className="code">drop</span>
            </button>
            <button onClick={reset} className="ms-auto rounded-xl border border-line px-4 py-2 text-sm">
              من جديد
            </button>
          </div>
        </div>

        {/* The program the learner is writing, judged line by line */}
        <div className="code flex max-h-80 flex-col overflow-y-auto rounded-2xl bg-code p-3 text-xs leading-6 text-white" dir="ltr">
          <div className="text-white/40">fn main() {"{"}</div>
          {lines.map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="ps-4">
              <div className={`flex gap-2 ${l.ok ? "" : "text-err line-through decoration-err/60"}`}>
                <span className="w-4 shrink-0 text-right text-white/30">{i + 1}</span>
                <span className="whitespace-pre">{l.code}</span>
                <span className={`ms-auto ${l.ok ? "text-ok" : "text-err"}`}>{l.ok ? "✓" : "✗"}</span>
              </div>
              {l.msg && <div className="ps-6 text-[11px] leading-5 text-err no-underline">{l.msg}</div>}
            </motion.div>
          ))}
          <div className="text-white/40">{"}"}</div>
        </div>
      </div>

      {/* Timeline: when each borrow starts and ends */}
      <div className="mt-4 rounded-2xl border border-line bg-surface p-3" dir="ltr">
        <div className="mb-2 flex justify-between text-xs text-muted">
          <span>line 1</span>
          <span dir="rtl">الخط الزمني: متى تبدأ كل استعارة ومتى تنتهي</span>
          <span>line {cols}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <Row label="book">
            <div className="absolute inset-y-1 rounded bg-str/40" style={{ left: 0, width: pct(dropped ? tick : cols) }} />
          </Row>
          {borrows.map((b) => (
            <Row key={b.name} label={b.name}>
              <motion.div
                layout
                className={`absolute inset-y-1 rounded ${b.kind === "write" ? "bg-bool" : "bg-accent"} ${b.end === null ? "opacity-90" : "opacity-50"}`}
                style={{ left: pct(b.start), width: pct((b.end ?? tick - 1) - b.start + 1) }}
              />
            </Row>
          ))}
          {rejects.length > 0 && (
            <Row label="✗">
              {rejects.map((r) => (
                <span key={r} className="absolute top-0 text-sm font-bold text-err" style={{ left: pct(r + 0.35) }}>
                  ✗
                </span>
              ))}
            </Row>
          )}
        </div>
      </div>

      <div className="mt-3 min-h-12 text-sm">
        {!last.ok ? (
          <p className="text-err">
            رُفض السطر قبل أن يعمل البرنامج. {last.msg === DROP_ERR ? "ما زال أحد يحمل سهماً إلى الكتاب: تحريره الآن يترك سهماً معلّقاً." : "قرّاء كثيرون أو كاتب واحد، لا الاثنان معاً."}
          </p>
        ) : readers.length >= 2 ? (
          <p className="text-ok">{readers.length} قرّاء في اللحظة نفسها: مقبول، فالقراءة لا تغيّر شيئاً. جرّب الآن أن تعطي أحداً القلم.</p>
        ) : writer ? (
          <p className="text-bool">القلم مع {writer.name} وحده. جرّب أن تُعير قارئاً أو كاتباً آخر.</p>
        ) : (
          <p className="text-muted">أعِر قارئين، ثم حاول إعارة كاتب. ثم أنهِ القراءة وحاول مرة أخرى. وجرّب أن تحرر الكتاب وهو مستعار.</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="code w-10 shrink-0 text-right text-xs text-muted">{label}</span>
      <div className="relative h-6 flex-1 rounded bg-surface-2">{children}</div>
    </div>
  );
}
