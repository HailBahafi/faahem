"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const MAX = 100;
const SHELF = 16;

const rand = (n: number) => Math.floor(Math.random() * n);

function shelfBooks() {
  const pool = Array.from({ length: 98 }, (_, k) => k + 1);
  for (let k = pool.length - 1; k > 0; k--) {
    const r = rand(k + 1);
    [pool[k], pool[r]] = [pool[r], pool[k]];
  }
  const books = pool.slice(0, SHELF);
  return { books, target: books[rand(SHELF)] };
}

/** The remaining range 1..100 as a strip: what is still possible stays lit. */
function Range({ low, high, mark }: { low: number; high: number; mark?: number }) {
  return (
    <div className="relative h-6 overflow-hidden rounded-full bg-code" dir="ltr">
      <motion.div
        className="absolute inset-y-0 bg-accent/40"
        animate={{ left: `${((low - 1) / MAX) * 100}%`, width: `${(Math.max(0, high - low + 1) / MAX) * 100}%` }}
      />
      {mark !== undefined && (
        <motion.div className="absolute inset-y-0 w-0.5 bg-accent" animate={{ left: `${((mark - 0.5) / MAX) * 100}%` }} />
      )}
      <span className="code absolute left-2 top-0.5 text-xs text-muted">{low}</span>
      <span className="code absolute right-2 top-0.5 text-xs text-muted">{high}</span>
    </div>
  );
}

function Game() {
  const [secret, setSecret] = useState(() => rand(MAX) + 1);
  const [low, setLow] = useState(1);
  const [high, setHigh] = useState(MAX);
  const [input, setInput] = useState("");
  const [guesses, setGuesses] = useState<{ n: number; hint: string }[]>([]);
  const won = guesses.length > 0 && guesses[guesses.length - 1].n === secret;

  // The computer's turn: the learner keeps a number in mind and answers.
  const [cpu, setCpu] = useState<{ low: number; high: number; tries: number; done: boolean } | null>(null);
  const cpuGuess = cpu ? Math.floor((cpu.low + cpu.high) / 2) : 0;

  const guess = () => {
    const n = Number(input);
    if (!Number.isInteger(n) || n < 1 || n > MAX || won) return;
    const hint = n === secret ? "✓" : n < secret ? "أكبر ↑" : "أصغر ↓";
    if (n < secret) setLow((l) => Math.max(l, n + 1));
    if (n > secret) setHigh((h) => Math.min(h, n - 1));
    setGuesses((g) => [...g, { n, hint }]);
    setInput("");
  };

  const answer = (a: "up" | "down" | "yes") => {
    if (!cpu || cpu.done) return;
    if (a === "yes") return setCpu({ ...cpu, tries: cpu.tries + 1, done: true });
    const next = a === "up" ? { ...cpu, low: cpuGuess + 1 } : { ...cpu, high: cpuGuess - 1 };
    if (next.low > next.high) return setCpu({ ...next, tries: cpu.tries + 1, done: true });
    setCpu({ ...next, tries: cpu.tries + 1 });
  };

  const restart = () => {
    setSecret(rand(MAX) + 1);
    setLow(1);
    setHigh(MAX);
    setGuesses([]);
    setCpu(null);
  };

  if (cpu) {
    return (
      <div className="grid gap-4">
        <p className="text-muted">فكّر في رقم من 1 إلى 100 ولا تقله. سأخمّن منتصف ما بقي في كل مرة.</p>
        <Range low={cpu.low} high={cpu.high} mark={cpu.done ? undefined : cpuGuess} />
        <div className="flex flex-wrap items-center gap-3">
          <div className="code rounded-2xl bg-code px-5 py-3 text-2xl font-bold text-num">{cpu.done ? "✓" : cpuGuess}</div>
          {!cpu.done && (
            <>
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => answer("up")} className="rounded-2xl border border-line px-4 py-3 font-bold">
                أكبر ↑
              </motion.button>
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => answer("down")} className="rounded-2xl border border-line px-4 py-3 font-bold">
                أصغر ↓
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => answer("yes")}
                className="rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg"
              >
                صحيح
              </motion.button>
            </>
          )}
        </div>
        <div className="code text-sm">
          <span className="text-num font-bold">{cpu.tries}</span> <span className="text-muted">تخمين</span>
        </div>
        {cpu.done && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            {cpu.tries} تخمينات. كل جواب رمى نصف الباقي، فلن أحتاج أكثر من 7 أبداً.
          </motion.p>
        )}
        <button onClick={restart} className="w-fit text-sm text-muted hover:text-fg">
          ابدأ من جديد
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <Range low={low} high={high} mark={guesses.length ? guesses[guesses.length - 1].n : undefined} />
      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          guess();
        }}
      >
        <input
          type="number"
          min={1}
          max={MAX}
          value={input}
          disabled={won}
          onChange={(e) => setInput(e.target.value)}
          className="code w-28 rounded-2xl border border-line bg-surface px-4 py-3 text-lg"
          dir="ltr"
          placeholder="1-100"
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="submit"
          disabled={won}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          خمّن
        </motion.button>
        <div className="code text-sm">
          <span className="text-num font-bold">{guesses.length}</span> <span className="text-muted">تخمين</span>
        </div>
      </form>
      <div className="flex min-h-10 flex-wrap gap-1.5" dir="ltr">
        <AnimatePresence initial={false}>
          {guesses.map((g, k) => (
            <motion.span
              key={k}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`code rounded-lg border px-2 py-1 text-sm ${g.n === secret ? "border-ok text-ok" : "border-line"}`}
            >
              {g.n} <span dir="rtl">{g.hint}</span>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      {won && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-3">
          <p className="text-ok">وجدته في {guesses.length} تخمينات. هل خمّنت منتصف الباقي كل مرة؟</p>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setCpu({ low: 1, high: MAX, tries: 0, done: false })}
            className="rounded-2xl border border-accent px-4 py-2 font-bold"
          >
            دوري أنا أخمّن
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

function Shelf() {
  const [{ books, target }, setShelf] = useState(shelfBooks);
  const [sortedMode, setSortedMode] = useState(false);
  const [open, setOpen] = useState<number[]>([]);
  const [score, setScore] = useState<{ mixed?: number; sorted?: number }>({});
  const row = sortedMode ? books.slice().sort((a, b) => a - b) : books;
  const found = open.some((k) => row[k] === target);

  // On a sorted shelf every opened book rules out one whole side.
  let lo = 0;
  let hi = row.length - 1;
  if (sortedMode) {
    for (const k of open) {
      if (row[k] < target) lo = Math.max(lo, k + 1);
      if (row[k] > target) hi = Math.min(hi, k - 1);
    }
  }

  const reveal = (k: number) => {
    if (found || open.includes(k)) return;
    const next = [...open, k];
    setOpen(next);
    if (row[k] === target) setScore((s) => ({ ...s, [sortedMode ? "sorted" : "mixed"]: next.length }));
  };

  const switchMode = (s: boolean) => {
    setSortedMode(s);
    setOpen([]);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {[false, true].map((s) => (
          <button
            key={String(s)}
            onClick={() => switchMode(s)}
            className={`rounded-xl px-4 py-2 font-bold ${sortedMode === s ? "bg-accent text-accent-fg" : "border border-line"}`}
          >
            {s ? "رف مرتب" : "رف مبعثر"}
          </button>
        ))}
        <span className="ms-auto">
          ابحث عن <b className="code text-num text-lg">{target}</b>
        </span>
      </div>

      <div className="grid grid-cols-8 gap-1.5" dir="ltr">
        {row.map((b, k) => {
          const isOpen = open.includes(k);
          const out = sortedMode && !isOpen && (k < lo || k > hi);
          return (
            <motion.button
              key={`${sortedMode}-${k}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => reveal(k)}
              animate={{ opacity: out ? 0.25 : 1, scale: isOpen ? 1.05 : 1 }}
              className={`code flex h-16 items-center justify-center rounded-lg border text-sm font-bold ${
                isOpen ? (b === target ? "border-ok bg-surface text-ok" : "border-line bg-surface") : "border-line bg-code text-muted"
              }`}
            >
              {isOpen ? b : "?"}
            </motion.button>
          );
        })}
      </div>

      <div className="code flex flex-wrap gap-4 text-sm">
        <span>
          <span className="text-muted">الآن: </span>
          <span className="text-num font-bold">{open.length}</span> <span className="text-muted">فحص</span>
        </span>
        {score.mixed !== undefined && <span className="text-muted">مبعثر: {score.mixed}</span>}
        {score.sorted !== undefined && <span className="text-muted">مرتب: {score.sorted}</span>}
      </div>

      <div className="min-h-12">
        {!found && !sortedMode && <p className="text-muted">لا ترتيب يساعدك: كل كتاب مغلق قد يكون هو.</p>}
        {!found && sortedMode && <p className="text-muted">ابدأ من المنتصف. كل كتاب تفتحه يُطفئ جهة كاملة.</p>}
        {found && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-3">
            <p className="text-ok">وجدته بعد {open.length} فحص.</p>
            <button onClick={() => switchMode(!sortedMode)} className="rounded-xl border border-accent px-3 py-1.5 font-bold">
              جرّب {sortedMode ? "المبعثر" : "المرتب"}
            </button>
            <button
              onClick={() => {
                setShelf(shelfBooks());
                setOpen([]);
                setScore({});
              }}
              className="text-sm text-muted hover:text-fg"
            >
              رف جديد
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/** Guess a number by halving, then search a shelf with and without sorted order. */
export default function SearchingProblem() {
  const [tab, setTab] = useState<"game" | "shelf">("game");
  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("game")}
          className={`rounded-xl px-4 py-2 font-bold ${tab === "game" ? "bg-accent text-accent-fg" : "border border-line"}`}
        >
          أكبر أم أصغر
        </button>
        <button
          onClick={() => setTab("shelf")}
          className={`rounded-xl px-4 py-2 font-bold ${tab === "shelf" ? "bg-accent text-accent-fg" : "border border-line"}`}
        >
          رف الكتب
        </button>
      </div>
      {tab === "game" ? <Game /> : <Shelf />}
    </div>
  );
}
