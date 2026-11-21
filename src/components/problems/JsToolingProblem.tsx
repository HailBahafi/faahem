"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Range = "^4.17.0" | "~4.17.0" | "4.17.0";

/** Versions the package author publishes over time; 4.18.0 carries a regression. */
const FUTURE = [
  { v: "4.17.1", note: "bug fix" },
  { v: "4.18.0", note: "new feature (and a new bug)" },
  { v: "5.0.0", note: "breaking change" },
];
const BROKEN = "4.18.0";
const TESTED = "4.17.0";

const parse = (v: string) => v.split(".").map(Number);

function satisfies(v: string, range: Range): boolean {
  const [ma, mi, pa] = parse(v);
  if (range === "4.17.0") return v === range;
  const [bma, bmi, bpa] = parse(range.slice(1));
  if (ma !== bma) return false;
  if (range.startsWith("~") && mi !== bmi) return false;
  if (mi !== bmi) return mi > bmi;
  return pa >= bpa;
}

/** The same package.json installed on two machines a few weeks apart: ranges, lockfile, drift. */
export default function JsToolingProblem() {
  const [range, setRange] = useState<Range>("^4.17.0");
  const [lock, setLock] = useState(false);
  const [published, setPublished] = useState<string[]>([TESTED]);
  const [server, setServer] = useState<string | null>(null);

  const next = FUTURE.find((f) => !published.includes(f.v));
  const pick = () => {
    if (lock) return setServer(TESTED);
    const ok = published.filter((v) => satisfies(v, range));
    setServer(ok[ok.length - 1] ?? null);
  };
  const reset = () => {
    setPublished([TESTED]);
    setServer(null);
  };

  const broken = server === BROKEN;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" dir="ltr">
        <span className="code text-xs text-muted">&quot;csv-kit&quot;:</span>
        {(["^4.17.0", "~4.17.0", "4.17.0"] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => {
              setRange(r);
              setServer(null);
            }}
            className={`code rounded-xl px-3 py-2 text-xs font-bold ${range === r ? "bg-accent text-accent-fg" : "border border-line bg-surface"}`}
          >
            &quot;{r}&quot;
          </button>
        ))}
        <button
          onClick={() => {
            setLock(!lock);
            setServer(null);
          }}
          className={`code rounded-xl px-3 py-2 text-xs font-bold ${lock ? "bg-accent text-accent-fg" : "border border-line bg-surface"}`}
        >
          package-lock.json {lock ? "✓" : "✗"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm font-semibold">السجل (npm registry)</div>
          <ul className="code mt-2 space-y-1 text-xs" dir="ltr">
            <AnimatePresence>
              {published.map((v) => (
                <motion.li key={v} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between">
                  <span className={v === BROKEN ? "text-err" : "text-num"}>csv-kit@{v}</span>
                  <span className="text-muted">{v === TESTED ? "you tested this" : FUTURE.find((f) => f.v === v)?.note}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <button
            disabled={!next}
            onClick={() => {
              if (next) setPublished([...published, next.v]);
              setServer(null);
            }}
            className="mt-3 rounded-xl border border-line px-3 py-1.5 text-xs disabled:opacity-40"
          >
            الكاتب ينشر نسخة جديدة
          </button>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm font-semibold">خادم الإنتاج</div>
          <div className="mt-3 flex h-20 items-center justify-center rounded-xl bg-code">
            <AnimatePresence mode="popLayout">
              <motion.div key={String(server) + range + lock} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="code text-center text-sm" dir="ltr">
                {server === null ? (
                  <span className="text-muted">—</span>
                ) : (
                  <>
                    <div className={broken ? "text-err" : "text-ok"}>installed csv-kit@{server}</div>
                    <div className={`text-xs ${broken ? "text-err" : "text-ok"}`}>{broken ? "TypeError: rows.map is not a function" : "app OK"}</div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-3 flex gap-2">
            <motion.button whileTap={{ scale: 0.94 }} onClick={pick} className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg">
              npm install على الخادم
            </motion.button>
            <button onClick={reset} className="text-xs text-muted hover:text-fg">
              من جديد
            </button>
          </div>
        </div>
      </div>

      {broken && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          جرّبت 4.17.0 على جهازك، والخادم أخذ 4.18.0 لأن النطاق يسمح بها. الكود لم يتغيّر، والحزمة تحته تغيّرت. فعّل <b className="text-fg">ملف القفل</b> وثبّت من جديد.
        </motion.p>
      )}
      {lock && server === TESTED && published.length > 1 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          الخادم أخذ ما جرّبته بالضبط، مهما نُشر بعده. التحديث صار قراراً تتخذه أنت، لا مفاجأة.
        </motion.p>
      )}
    </div>
  );
}
