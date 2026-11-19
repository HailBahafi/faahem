"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Part = "init" | "check" | "update";
type Status = "idle" | "running" | "stuck" | "done";

const PARTS: { id: Part; code: string; color: string }[] = [
  { id: "init", code: "let i = 1", color: "text-num" },
  { id: "check", code: "i <= 5", color: "text-bool" },
  { id: "update", code: "i++", color: "text-str" },
];

/** A while loop built from three scattered parts; the update at the bottom is the one that gets forgotten. */
export default function ForProblem() {
  const [placed, setPlaced] = useState<Part[]>([]);
  const [out, setOut] = useState<string[]>([]);
  const [i, setI] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [packed, setPacked] = useState(false);
  const hasUpdate = placed.includes("update");

  useEffect(() => {
    if (status !== "running" || i === null) return;
    const t = setTimeout(() => {
      if (i > 5) return setStatus("done");
      if (out.length >= 10) return setStatus("stuck");
      setOut((o) => [...o, String(i)]);
      if (hasUpdate) setI(i + 1); // without the update, i stays 1 and the loop never moves
    }, 320);
    return () => clearTimeout(t);
  }, [status, i, out, hasUpdate]);

  const place = (p: Part) => {
    if (status === "running" || placed.includes(p)) return;
    setPlaced((ps) => [...ps, p]);
    setStatus("idle");
    setOut([]);
    setI(null);
  };
  const run = () => {
    setOut([]);
    setI(1);
    setStatus("running");
  };
  const reset = () => {
    setPlaced([]);
    setOut([]);
    setI(null);
    setStatus("idle");
    setPacked(false);
  };
  const canRun = placed.includes("init") && placed.includes("check") && status !== "running";

  const slot = (p: Part) => {
    const part = PARTS.find((x) => x.id === p)!;
    return placed.includes(p) ? (
      <motion.span layoutId={p} className={`inline-block rounded-md bg-surface px-1.5 font-bold ${part.color}`}>
        {part.code}
      </motion.span>
    ) : (
      <span className="inline-block min-w-16 rounded-md border border-dashed border-line px-1.5 text-muted">&nbsp;?&nbsp;</span>
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" dir="ltr">
        {PARTS.filter((p) => !placed.includes(p.id)).map((p) => (
          <motion.button
            key={p.id}
            layoutId={p.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => place(p.id)}
            className={`code rounded-xl border border-line bg-surface px-3 py-2 font-bold ${p.color}`}
          >
            {p.code}
          </motion.button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="code rounded-2xl bg-code p-5 text-base leading-9" dir="ltr">
          {packed ? (
            <>
              <div>
                for ({slot("init")}; {slot("check")}; {slot("update")}) {"{"}
              </div>
              <div className="pl-6">console.log(i);</div>
              <div>{"}"}</div>
            </>
          ) : (
            <>
              <div>{slot("init")};</div>
              <div>while ({slot("check")}) {"{"}</div>
              <div className="pl-6">console.log(i);</div>
              <div className="pl-6">{slot("update")};</div>
              <div>{"}"}</div>
            </>
          )}
        </div>

        <div className="flex min-w-40 flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm text-muted">i</div>
          <div className={`code text-3xl font-bold ${status === "stuck" ? "text-err" : "text-num"}`}>{i ?? "-"}</div>
          <div className="code flex h-28 flex-col-reverse overflow-hidden text-sm" dir="ltr">
            <AnimatePresence initial={false}>
              {[...out].reverse().map((line, k) => (
                <motion.div key={out.length - k} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={!canRun}
          onClick={run}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          شغّل
        </motion.button>
        {status === "done" && !packed && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setPacked(true)}
            className="rounded-2xl border border-accent px-4 py-3 font-bold"
          >
            اجمع الأجزاء في سطر واحد
          </motion.button>
        )}
        {placed.length > 0 && (
          <button onClick={reset} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {placed.length === 0 && <p className="text-muted">ضع القطع في أماكنها ثم شغّل. يكفي قطعتان ليعمل الزر.</p>}
        {status === "stuck" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            الحلقة لا تتوقف: i بقي 1 لأن i++ في أسفل الجسم، بعيداً عن الشرط، وسهل أن يُنسى.
          </motion.p>
        )}
        {status === "done" && !packed && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            تعمل. لكن الأجزاء الثلاثة متفرقة في ثلاثة أماكن.
          </motion.p>
        )}
        {packed && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
            هذه هي <b className="text-fg">for</b>: البداية والشرط والتغيير في سطر واحد، فلا تنسى أحدها.
          </motion.p>
        )}
      </div>
    </div>
  );
}
