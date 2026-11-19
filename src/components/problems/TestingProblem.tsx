"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// The rule: free shipping from 100 up, otherwise 15. The shipped code checks `> 100` (the hidden bug).
const rule = (total: number) => (total >= 100 ? 0 : 15);
const VERSIONS = {
  buggy: { code: "return total > 100 ? 0 : 15;", run: (t: number) => (t > 100 ? 0 : 15) },
  fixed: { code: "return total >= 100 ? 0 : 15;", run: rule },
  // A teammate "simplifies" the code and brings the old bug back.
  refactored: { code: "return total <= 100 ? 15 : 0;", run: (t: number) => (t <= 100 ? 15 : 0) },
};
type Version = keyof typeof VERSIONS;
type Row = { id: number; input: string; expected: string };
type Result = "pass" | "bug" | "wrongTest";

/** A test bench: write input / expected rows, run them against a function with a hidden bug, then refactor. */
export default function TestingProblem() {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, input: "50", expected: "15" },
    { id: 2, input: "200", expected: "0" },
  ]);
  const [version, setVersion] = useState<Version>("buggy");
  const [results, setResults] = useState<Record<number, { r: Result; actual: number }>>({});
  const [runs, setRuns] = useState(0);
  const [nextId, setNextId] = useState(3);

  const run = (v: Version = version) => {
    const out: Record<number, { r: Result; actual: number }> = {};
    for (const row of rows) {
      const input = Number(row.input), expected = Number(row.expected);
      if (row.input.trim() === "" || row.expected.trim() === "" || Number.isNaN(input) || Number.isNaN(expected)) continue;
      const actual = VERSIONS[v].run(input);
      out[row.id] = { actual, r: actual === expected ? "pass" : expected === rule(input) ? "bug" : "wrongTest" };
    }
    setResults(out);
    setRuns((r) => r + 1);
  };

  const values = Object.values(results);
  const caught = values.some((x) => x.r === "bug");
  const wrongTest = values.some((x) => x.r === "wrongTest");
  const allGreen = values.length > 0 && values.every((x) => x.r === "pass");

  const edit = (id: number, key: "input" | "expected", value: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
    setResults({});
  };
  const add = () => {
    setRows((rs) => [...rs, { id: nextId, input: "", expected: "" }]);
    setNextId((k) => k + 1);
  };
  const switchTo = (v: Version) => {
    setVersion(v);
    run(v);
  };
  const reset = () => {
    setRows([{ id: 1, input: "50", expected: "15" }, { id: 2, input: "200", expected: "0" }]);
    setVersion("buggy");
    setResults({});
    setRuns(0);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-lg border border-line bg-surface px-3 py-1">
          القاعدة: من <b className="code text-num">100</b> فأكثر الشحن <b className="code text-num">0</b>، وإلا{" "}
          <b className="code text-num">15</b>
        </span>
        <span className="code rounded-lg border border-line bg-code px-3 py-1" dir="ltr">
          shippingCost(total) {"{ "}
          {version === "buggy" ? <span className="text-muted">{"/* hidden */"}</span> : (
            <span className={version === "refactored" ? "text-err" : "text-ok"}>{VERSIONS[version].code}</span>
          )}
          {" }"}
        </span>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-3">
        <div className="mb-2 grid grid-cols-[1fr_1fr_1fr_2rem] gap-2 text-xs text-muted">
          <span>المدخل total</span>
          <span>أتوقع</span>
          <span>الفعلي</span>
          <span />
        </div>
        <AnimatePresence initial={false}>
          {rows.map((row) => {
            const res = results[row.id];
            const tone = !res ? "border-line" : res.r === "pass" ? "border-ok bg-ok/10" : "border-err bg-err/10";
            return (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0, x: res && res.r !== "pass" ? [0, -5, 5, 0] : 0 }}
                className={`mb-1.5 grid grid-cols-[1fr_1fr_1fr_2rem] items-center gap-2 rounded-lg border px-2 py-1 ${tone}`}
              >
                <input
                  dir="ltr"
                  inputMode="numeric"
                  value={row.input}
                  onChange={(e) => edit(row.id, "input", e.target.value)}
                  className="code w-full rounded-md border border-line bg-code px-2 py-1 text-sm"
                />
                <input
                  dir="ltr"
                  inputMode="numeric"
                  value={row.expected}
                  onChange={(e) => edit(row.id, "expected", e.target.value)}
                  className="code w-full rounded-md border border-line bg-code px-2 py-1 text-sm"
                />
                <span className="code text-sm" dir="ltr">
                  {res ? <b className={res.r === "pass" ? "text-ok" : "text-err"}>{res.actual}</b> : <span className="text-muted">?</span>}
                </span>
                <span className="text-center">{res && (res.r === "pass" ? <span className="text-ok">✓</span> : <span className="text-err">✗</span>)}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button onClick={add} className="rounded-lg border border-line px-3 py-1 text-sm hover:bg-code">
            + صف
          </button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => run()}
            className="rounded-2xl bg-accent px-5 py-2 font-bold text-accent-fg shadow-lg shadow-accent/20"
          >
            ▶ شغّل الاختبارات
          </motion.button>
          {runs > 0 && (
            <span className="text-sm text-muted">
              {values.filter((x) => x.r === "pass").length} / {values.length} أخضر
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 min-h-16">
        {version === "buggy" && runs > 0 && allGreen && (
          <p className="text-muted">كلها خضراء، لكن الخطأ ما زال مختبئاً. جرّب الحالات الطرفية: الحد نفسه، الصفر، السالب.</p>
        )}
        {wrongTest && !caught && (
          <p className="text-err">صف أحمر، لكن توقّعك يخالف القاعدة نفسها. الخطأ هنا في الاختبار، لا في الدالة.</p>
        )}
        {version === "buggy" && caught && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-3">
            <p className="text-ok">
              أمسكته! عند الحد نفسه الدالة تخالف القاعدة. الكود كان <span className="code">total &gt; 100</span>. هذا الصف يبقى في
              المشروع حارساً.
            </p>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => switchTo("fixed")} className="rounded-2xl bg-accent px-5 py-2 font-bold text-accent-fg">
              أصلح الدالة
            </motion.button>
          </motion.div>
        )}
        {version === "fixed" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-3">
            <p className={allGreen ? "text-ok" : "text-muted"}>
              {allGreen ? "كلها خضراء. الآن زميل «يبسّط» الكود بعد شهر..." : "شغّل الاختبارات على النسخة المصلحة."}
            </p>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => switchTo("refactored")} className="rounded-2xl border border-line px-5 py-2 font-bold hover:bg-code">
              أعد كتابة الدالة
            </motion.button>
          </motion.div>
        )}
        {version === "refactored" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-3">
            <p className={caught ? "text-err" : "text-muted"}>
              {caught
                ? "احمرّ صف الحد فوراً: إعادة الكتابة أعادت الخطأ القديم، والاختبار سمّاه قبل أن يصل إلى أي عميل."
                : "لا شيء احمرّ: ليس عندك صف عند الحد 100، فعاد الخطأ ولم يلاحظه أحد. أضف صف 100 ← 0 وشغّل."}
            </p>
            <button onClick={reset} className="text-sm text-muted hover:text-fg">
              من جديد
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
