"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Mode = "alias" | "copy";
const START = ["Intro", "Rain"];
const POOL = ["Echo", "Dune", "Night", "Gold", "Sky"];

/** A playlist shared as `friend = mine` (one list, two labels) or `friend = mine.copy()` (two lists). */
export default function PyListsProblem() {
  const [mode, setMode] = useState<Mode>("alias");
  const [mine, setMine] = useState<string[]>(START);
  const [theirs, setTheirs] = useState<string[]>(START);
  const [added, setAdded] = useState(0);

  const choose = (m: Mode) => {
    setMode(m);
    setMine(START);
    setTheirs(START);
    setAdded(0);
  };
  const append = () => {
    const song = POOL[added % POOL.length];
    if (mode === "alias") setMine((l) => [...l, song]);
    else setTheirs((l) => [...l, song]);
    setAdded((n) => n + 1);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" dir="ltr">
        {(["alias", "copy"] as Mode[]).map((m) => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.92 }}
            onClick={() => choose(m)}
            className={`code rounded-xl border px-3 py-2 font-bold ${mode === m ? "border-accent bg-surface" : "border-line text-muted"}`}
          >
            {m === "alias" ? "friend = mine" : "friend = mine.copy()"}
          </motion.button>
        ))}
      </div>

      <div className="flex min-h-48 flex-wrap justify-center gap-6" dir="ltr">
        {mode === "alias" ? (
          <ListBox labels={["mine", "friend"]} items={mine} />
        ) : (
          <>
            <ListBox labels={["mine"]} items={mine} />
            <ListBox labels={["friend"]} items={theirs} />
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={append}
          className="code rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20"
          dir="ltr"
        >
          friend.append(&quot;{POOL[added % POOL.length]}&quot;)
        </motion.button>
      </div>

      <div className="mt-4 min-h-12 text-center">
        {added === 0 && <p className="text-muted">دع صديقك يضيف أغنية، وانظر إلى قائمتك mine.</p>}
        {added > 0 && mode === "alias" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            صديقك أضاف، فتغيّرت قائمتك أنت أيضاً: لا توجد إلا قائمة واحدة، عليها اسمان.
          </motion.p>
        )}
        {added > 0 && mode === "copy" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            copy بنت قائمة ثانية. صديقك يغيّر قائمته، وقائمتك كما هي.
          </motion.p>
        )}
      </div>
    </div>
  );
}

function ListBox({ labels, items }: { labels: string[]; items: string[] }) {
  return (
    <motion.div layout className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        {labels.map((l) => (
          <motion.span
            key={l}
            layoutId={`label-${l}`}
            className={`code rounded-md px-2 py-0.5 text-sm font-bold ${l === "mine" ? "bg-accent text-accent-fg" : "bg-code text-num"}`}
          >
            {l} ↓
          </motion.span>
        ))}
      </div>
      <div className="min-w-40 rounded-2xl border border-line bg-surface p-3">
        <div className="mb-2 text-xs text-muted">list</div>
        <AnimatePresence initial={false}>
          {items.map((song, i) => (
            <motion.div
              key={`${i}-${song}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="code mb-1 flex items-center gap-2 rounded-lg bg-code px-2 py-1 text-sm"
            >
              <span className="text-muted">{i}</span>
              <span className="text-str">&quot;{song}&quot;</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
