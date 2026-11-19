"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

type Move = "rename" | "constants" | "early" | "extract" | "why" | "rush";

const MOVES: { id: Move; label: string; saves: number }[] = [
  { id: "rename", label: "أسماء تقول ما القيمة", saves: 30 },
  { id: "constants", label: "أسماء للأرقام السحرية", saves: 15 },
  { id: "early", label: "شروط حارسة بدل التداخل", saves: 20 },
  { id: "extract", label: "استخرج دالة صغيرة", saves: 10 },
  { id: "why", label: "تعليق يشرح لماذا", saves: 5 },
  { id: "rush", label: "«أوضح»: غيّر > إلى >=", saves: 0 },
];
const START_SECONDS = 90;

/** Builds the function's source from the refactorings applied so far. */
function build(on: Set<Move>) {
  const R = on.has("rename"), C = on.has("constants"), E = on.has("early"), X = on.has("extract");
  const fn = R ? "loyaltyPoints" : "f", u = R ? "user" : "u", d = R ? "now" : "d", p = R ? "points" : "p";
  const orders = R ? "orders" : "o";
  const month = C ? "MONTH_MS" : "2592000000", per = C ? "POINTS_PER_ORDER" : "5";
  const loyal = C ? "LOYAL_ORDERS" : "10", bonus = C ? "LOYAL_BONUS" : "50";
  const cmp = on.has("rush") ? ">=" : ">";
  const lines: string[] = [];
  if (C) lines.push("const MONTH_MS = 30 * 24 * 60 * 60 * 1000;", "const POINTS_PER_ORDER = 5;", "const LOYAL_ORDERS = 10;", "const LOYAL_BONUS = 50;", "");
  if (X) {
    lines.push(`function ${R ? "pointsFor" : "g"}(${orders}) {`, `  let ${p} = ${orders} * ${per};`, `  if (${orders} ${cmp} ${loyal}) ${p} = ${p} + ${bonus};`, `  return ${p};`, "}", "");
  }
  const body = (pad: string) =>
    X
      ? [`${pad}return ${R ? "pointsFor" : "g"}(${u}.orders);`]
      : [`${pad}let ${p} = ${u}.orders * ${per};`, `${pad}if (${u}.orders ${cmp} ${loyal}) {`, `${pad}  ${p} = ${p} + ${bonus};`, `${pad}}`, `${pad}return ${p};`];
  lines.push(`function ${fn}(${u}, ${d}) {`);
  const why = on.has("why") ? ["// New members earn nothing in their first month: it stops sign-up abuse."] : [];
  if (E) {
    lines.push(`  if (!${u} || !${u}.active) return 0;`);
    lines.push(...why.map((w) => "  " + w), `  if (${d} - ${u}.joined <= ${month}) return 0;`, ...body("  "));
  } else {
    lines.push(`  if (${u}) {`, `    if (${u}.active) {`, ...why.map((w) => "      " + w), `      if (${d} - ${u}.joined > ${month}) {`, ...body("        "));
    lines.push("      } else {", "        return 0;", "      }", "    }", "  }", "  return 0;");
  }
  lines.push("}");
  return { lines, fn };
}

const DAY = 86400000, NOW = 400 * DAY;
const TESTS: { name: string; args: [unknown, number]; expected: number }[] = [
  { name: "no user → 0", args: [null, NOW], expected: 0 },
  { name: "inactive → 0", args: [{ active: false, joined: 0, orders: 4 }, NOW], expected: 0 },
  { name: "first month → 0", args: [{ active: true, joined: NOW - 10 * DAY, orders: 4 }, NOW], expected: 0 },
  { name: "4 orders → 20", args: [{ active: true, joined: 0, orders: 4 }, NOW], expected: 20 },
  { name: "10 orders → 50", args: [{ active: true, joined: 0, orders: 10 }, NOW], expected: 50 },
  { name: "12 orders → 110", args: [{ active: true, joined: 0, orders: 12 }, NOW], expected: 110 },
];

/** Run the generated source for real against the tests. */
function runTests(lines: string[], fn: string) {
  try {
    const f = new Function(`${lines.join("\n")}\nreturn ${fn};`)() as (...a: unknown[]) => number;
    return TESTS.map((t) => f(...t.args) === t.expected);
  } catch {
    return TESTS.map(() => false);
  }
}

/** Clean a messy function with refactorings from a menu while the tests stay green and reading time drops. */
export default function CleanCodeProblem() {
  const [on, setOn] = useState<Set<Move>>(new Set());
  const { lines, fn } = useMemo(() => build(on), [on]);
  const results = useMemo(() => runTests(lines, fn), [lines, fn]);
  const green = results.every(Boolean);
  const seconds = Math.max(10, START_SECONDS - MOVES.filter((m) => on.has(m.id)).reduce((s, m) => s + m.saves, 0));
  const cleanDone = MOVES.filter((m) => m.id !== "rush").every((m) => on.has(m.id));

  const toggle = (m: Move) =>
    setOn((s) => {
      const next = new Set(s);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {MOVES.map((m) => {
          const active = on.has(m.id);
          return (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => toggle(m.id)}
              className={`rounded-xl border px-3 py-1.5 text-sm transition-colors ${
                active ? (m.id === "rush" ? "border-err bg-err/10 text-err" : "border-accent bg-accent text-accent-fg") : "border-line bg-surface hover:bg-code"
              }`}
            >
              {active ? "✓ " : ""}
              {m.label}
            </motion.button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
        <div className="max-h-[26rem] overflow-auto rounded-2xl border border-line bg-code p-3" dir="ltr">
          <AnimatePresence initial={false} mode="popLayout">
            {lines.map((text, k) => (
              <motion.pre
                key={text + "|" + lines.slice(0, k).filter((l) => l === text).length}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`code whitespace-pre text-[13px] leading-6 ${text.trim().startsWith("//") ? "text-muted" : ""} ${
                  /^const /.test(text) ? "text-num" : ""
                }`}
              >
                {text || " "}
              </motion.pre>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-line bg-surface p-3">
            <p className="mb-2 text-sm text-muted">كم يحتاج قارئ جديد ليفهمها؟</p>
            <div className="h-3 overflow-hidden rounded-full bg-code">
              <motion.div
                className={`h-full rounded-full ${seconds > 50 ? "bg-err" : seconds > 25 ? "bg-accent" : "bg-ok"}`}
                animate={{ width: `${(seconds / START_SECONDS) * 100}%` }}
              />
            </div>
            <p className="code mt-1 text-lg font-bold" dir="ltr">
              ~{seconds}s
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-3">
            <p className="mb-2 text-sm text-muted">الاختبارات (تعمل على الكود الظاهر)</p>
            <div className="flex flex-col gap-1" dir="ltr">
              {TESTS.map((t, k) => (
                <motion.div
                  key={t.name}
                  animate={{ x: results[k] ? 0 : [0, -4, 4, 0] }}
                  className={`code flex justify-between rounded-md px-2 py-0.5 text-xs ${results[k] ? "text-ok" : "bg-err/10 text-err"}`}
                >
                  <span>{t.name}</span>
                  <span>{results[k] ? "PASS" : "FAIL"}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 min-h-12">
        {!green && (
          <p className="text-err">
            اختبار احمرّ: هذا التغيير لم يغيّر الشكل فقط، بل غيّر السلوك عند 10 طلبات. ألغه. التنظيف الآمن يبقي كل شيء أخضر.
          </p>
        )}
        {green && cleanDone && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            السلوك نفسه تماماً (كل الاختبارات خضراء)، والفهم صار من 90 ثانية إلى {seconds}. الكود يُكتب مرة ويُقرأ مئات المرات.
          </motion.p>
        )}
        {green && !cleanDone && on.size > 0 && <p className="text-muted">ما زالت خضراء. تابع: كل خطوة تغيّر الشكل، لا السلوك.</p>}
      </div>
    </div>
  );
}
