"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const TOTAL = 1_000_000;
const STEP = 20_000;
const COLUMNS = ["email", "name", "city", "phone", "age"];
const LEVELS = ["الجذر", "عقدة وسطى", "ورقة"];

const fmt = (n: number) => n.toLocaleString("en-US");

/** Full scan vs B-tree descent over a million cards. */
function Search() {
  const [target, setTarget] = useState<number | null>(null);
  const [scanned, setScanned] = useState(0);
  const [hops, setHops] = useState(0);
  const running = target !== null && (scanned < TOTAL || hops < LEVELS.length);

  useEffect(() => {
    if (target === null || scanned >= TOTAL) return;
    const t = setTimeout(() => setScanned((s) => Math.min(TOTAL, s + STEP)), 40);
    return () => clearTimeout(t);
  }, [target, scanned]);

  useEffect(() => {
    if (target === null || hops >= LEVELS.length) return;
    const t = setTimeout(() => setHops((h) => h + 1), 450);
    return () => clearTimeout(t);
  }, [target, hops]);

  const start = () => {
    setTarget(Math.floor(Math.random() * TOTAL) + 1);
    setScanned(0);
    setHops(0);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={start}
          disabled={running}
          className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          ابحث عن بطاقة
        </motion.button>
        {target !== null && (
          <span className="code text-sm text-muted" dir="ltr">
            WHERE card = <b className="text-num">{fmt(target)}</b>
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="font-semibold">بلا فهرس: بطاقة بطاقة</div>
          <div className="mt-3 h-4 overflow-hidden rounded-full bg-code" dir="ltr">
            <motion.div className="h-full bg-err/60" animate={{ width: `${(scanned / TOTAL) * 100}%` }} transition={{ duration: 0.04 }} />
          </div>
          <div className="code mt-3 text-sm">
            <span className="text-num text-xl font-bold">{fmt(scanned)}</span> <span className="text-muted">بطاقة مقروءة</span>
          </div>
        </div>

        <div className="rounded-2xl border border-accent/50 bg-surface p-4">
          <div className="font-semibold">مع فهرس: نزول في الشجرة</div>
          <div className="mt-3 grid gap-1.5">
            {LEVELS.map((l, k) => (
              <motion.div
                key={l}
                animate={{ opacity: k < hops ? 1 : 0.3, x: k < hops ? 0 : 6 }}
                className={`code rounded-lg border px-3 py-1 text-sm ${k < hops ? "border-accent bg-accent/10" : "border-line bg-code"}`}
                style={{ marginInlineStart: k * 24 }}
              >
                {l}
              </motion.div>
            ))}
          </div>
          <div className="code mt-3 text-sm">
            <span className="text-num text-xl font-bold">{hops}</span> <span className="text-muted">قفزات</span>
          </div>
        </div>
      </div>

      {target !== null && !running && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
          ثلاث قفزات مقابل مليون قراءة. وبلا فهرس لا يتوقف حتى بعد أن يجدها: قد تكون هناك بطاقة أخرى بالرقم نفسه.
        </motion.p>
      )}
    </div>
  );
}

/** Every index is one more sorted structure each write must update. */
function Writes() {
  const [on, setOn] = useState<string[]>([]);
  const [flash, setFlash] = useState(0);
  const structures = ["الجدول", "id (المفتاح)", ...on];
  const speed = Math.round(1000 / structures.length);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2" dir="ltr">
        {COLUMNS.map((c) => {
          const active = on.includes(c);
          return (
            <button
              key={c}
              onClick={() => setOn(active ? on.filter((x) => x !== c) : [...on, c])}
              className={`code rounded-xl px-3 py-1.5 text-sm ${active ? "bg-accent text-accent-fg" : "border border-line"}`}
            >
              {active ? "✓ " : "+ "}INDEX ({c})
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {structures.map((s) => (
          <motion.div
            key={`${s}-${flash}`}
            initial={flash ? { scale: 1.15, borderColor: "var(--accent)" } : false}
            animate={{ scale: 1 }}
            className="code rounded-lg border border-line bg-code px-3 py-2 text-sm"
          >
            {s}
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => setFlash((f) => f + 1)} className="rounded-2xl border border-accent px-4 py-2 font-bold">
          أضف بطاقة (INSERT)
        </motion.button>
        <span className="code text-sm">
          <span className="text-num font-bold">{structures.length}</span> <span className="text-muted">كتابات لكل بطاقة</span>
        </span>
      </div>

      <div>
        <div className="mb-1 text-sm text-muted">سرعة الكتابة</div>
        <div className="h-4 overflow-hidden rounded-full bg-code" dir="ltr">
          <motion.div className={`h-full ${speed < 300 ? "bg-err/70" : "bg-ok/70"}`} animate={{ width: `${(speed / 500) * 100}%` }} />
        </div>
        <div className="code mt-1 text-sm">
          <span className="text-num font-bold">{speed}</span> <span className="text-muted">بطاقة في الثانية</span>
        </div>
      </div>

      {on.length >= 3 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
          كل فهرس يسرّع البحث بعموده، لكن كل بطاقة جديدة يجب أن تدخل في مكانها المرتب في كل شجرة. فهرس ما تبحث به فعلاً، لا كل شيء.
        </motion.p>
      )}
    </div>
  );
}

export default function IndexesProblem() {
  const [tab, setTab] = useState<"search" | "write">("search");
  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["search", "write"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 font-bold ${tab === t ? "bg-accent text-accent-fg" : "border border-line"}`}
          >
            {t === "search" ? "البحث" : "ثمن الكتابة"}
          </button>
        ))}
      </div>
      {tab === "search" ? <Search /> : <Writes />}
    </div>
  );
}
