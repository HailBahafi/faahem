"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

type Id = "page" | "card" | "button";
type Run = { n: number; path: Id[]; on: Record<Id, boolean>; at: number };

const PARENT: Record<Id, Id | null> = { button: "card", card: "page", page: null };
const TAG: Record<Id, string> = { page: "section#page", card: "div#card", button: "button#buy" };

function pathFrom(id: Id): Id[] {
  const path: Id[] = [];
  for (let cur: Id | null = id; cur; cur = PARENT[cur]) path.push(cur);
  return path;
}

type BoxProps = {
  id: Id;
  className: string;
  children?: ReactNode;
  listening: boolean;
  isCurrent: boolean;
  fires: boolean;
  visited: boolean;
  onPick: (id: Id) => void;
  onToggle: (id: Id) => void;
};

function Box({ id, className, children, listening, isCurrent, fires, visited, onPick, onToggle }: BoxProps) {
  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        onPick(id);
      }}
      animate={{
        boxShadow: isCurrent ? "0 0 0 3px var(--accent), 0 10px 30px -10px var(--accent)" : "0 0 0 1px var(--border)",
        scale: fires ? [1, 1.03, 1] : 1,
      }}
      transition={{ duration: 0.35 }}
      className={`relative cursor-pointer rounded-2xl p-4 ${visited ? "bg-accent-soft/40" : "bg-surface"} ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2" dir="ltr">
        <span className="code text-sm font-bold">{TAG[id]}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(id);
          }}
          className={`code rounded-full px-2.5 py-0.5 text-xs font-semibold ${listening ? "bg-accent text-accent-fg" : "border border-line text-muted line-through"}`}
        >
          click listener
        </button>
      </div>
      {children}
      <AnimatePresence>
        {fires && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-3 left-4 rounded-full bg-ok px-2.5 py-0.5 text-xs font-bold text-white"
          >
            يعمل!
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Nested boxes: a click starts at the deepest box and bubbles outward, calling every listener on the way. */
export default function EventsProblem() {
  const [on, setOn] = useState<Record<Id, boolean>>({ page: true, card: true, button: true });
  const [runs, setRuns] = useState<Run[]>([]);
  const run = runs.length ? runs[runs.length - 1] : undefined;
  const busy = !!run && run.at < run.path.length;

  // Walk the current event one box outward at a time; at === path.length means it left the page.
  useEffect(() => {
    if (!run || run.at >= run.path.length) return;
    const t = setTimeout(() => setRuns((rs) => rs.map((r, k) => (k === rs.length - 1 ? { ...r, at: r.at + 1 } : r))), 650);
    return () => clearTimeout(t);
  }, [run]);

  const click = (id: Id) => {
    if (busy) return;
    setRuns((rs) => [...rs.slice(-3), { n: (rs.length ? rs[rs.length - 1].n : 0) + 1, path: pathFrom(id), on: { ...on }, at: 0 }]);
  };
  const toggle = (id: Id) => setOn((o) => ({ ...o, [id]: !o[id] }));

  const current = busy ? run.path[run.at] : null;
  const visited = (id: Id) => !!run && run.path.slice(0, run.at + 1).includes(id);
  const box = (id: Id) => ({
    id,
    listening: on[id],
    isCurrent: current === id,
    fires: current === id && !!run?.on[id],
    visited: visited(id),
    onPick: click,
    onToggle: toggle,
  });

  const lines = runs.flatMap((r) =>
    r.path.slice(0, Math.min(r.at + 1, r.path.length)).map((id) => ({
      key: `${r.n}-${id}`,
      n: r.n,
      text: r.on[id] ? `${TAG[id]} listener ran, e.target = ${TAG[r.path[0]]}` : `${TAG[id]}: no listener, keep bubbling`,
      ran: r.on[id],
    })),
  );

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <Box {...box("page")} className="min-h-64">
          <Box {...box("card")} className="min-h-40">
            <Box {...box("button")} className="min-h-16" />
          </Box>
        </Box>

        <div className="flex flex-col gap-3">
          <div className="code rounded-2xl bg-code p-4 text-sm leading-7 text-white" dir="ltr">
            <div className="text-white/50">{"// the event object e"}</div>
            {run ? (
              <>
                <div>
                  type: <span className="text-str">&quot;click&quot;</span>
                </div>
                <div>
                  target: <span className="text-num">{TAG[run.path[0]]}</span>
                </div>
                <div>
                  currentTarget: <span className="text-bool">{current ? TAG[current] : "null"}</span>
                </div>
              </>
            ) : (
              <div className="text-white/50">{"// nothing happened yet"}</div>
            )}
          </div>
          <div className="code min-h-40 flex-1 rounded-2xl border border-line bg-surface p-3 text-xs leading-6" dir="ltr">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <motion.div key={l.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={l.ran ? "text-ok" : "text-muted"}>
                  <span className="text-muted">#{l.n} </span>
                  {l.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {!lines.length && <div className="text-muted">{"// listeners that ran"}</div>}
          </div>
        </div>
      </div>

      <div className="mt-4 flex min-h-12 flex-wrap items-center gap-3">
        {!run && <p className="text-muted">انقر الصندوق الأعمق: button#buy.</p>}
        {busy && <p className="text-muted">الحدث يصعد من صندوق إلى أبيه... لم تستدعِ أنت أي دالة.</p>}
        {run && !busy && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 text-ok">
            نقرة واحدة صعدت من {TAG[run.path[0]]} حتى الخارج، والمتصفح نادى كل مستمع على الطريق. e.target بقي من نُقر أولاً.
          </motion.p>
        )}
        {runs.length > 0 && !busy && (
          <button onClick={() => setRuns([])} className="text-sm text-muted hover:text-fg">
            امسح السجل
          </button>
        )}
      </div>
    </div>
  );
}
