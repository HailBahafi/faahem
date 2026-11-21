"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";

/** What the server sends, what `as User` lets through, and what a parser says at the door. */
const BODIES: { json: string; asResult: string; asBad: boolean; parsed: string; parsedOk: boolean }[] = [
  { json: '{"name":"Sara","age":20}', asResult: "21", asBad: false, parsed: "ok, age + 1 = 21", parsedOk: true },
  { json: '{"name":"Omar","age":"20"}', asResult: '"201"  (string concat)', asBad: true, parsed: "rejected: age: expected number", parsedOk: false },
  { json: '{"name":"Lina"}', asResult: "NaN", asBad: true, parsed: "rejected: age: expected number", parsedOk: false },
  {
    json: "null",
    asResult: "TypeError: Cannot read properties of null (reading 'age')",
    asBad: true,
    parsed: "rejected: value: expected object",
    parsedOk: false,
  },
];

export default function TsRuntimeValidationProblem() {
  const [b, setB] = useState(1);
  const [parse, setParse] = useState(false);
  const body = BODIES[b];

  return (
    <div>
      <div className="mb-1 text-xs text-muted">ما يرسله الخادم</div>
      <div className="flex flex-wrap gap-1.5" dir="ltr">
        {BODIES.map((x, i) => (
          <button
            key={x.json}
            onClick={() => setB(i)}
            className={`code rounded-lg px-2 py-1 text-sm ring-1 ${i === b ? "bg-accent/20 ring-accent" : "ring-line hover:bg-accent/10"}`}
          >
            {x.json}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        {[false, true].map((p) => (
          <button
            key={String(p)}
            onClick={() => setParse(p)}
            className={`code rounded-xl px-3 py-1.5 text-sm ${parse === p ? "bg-accent text-accent-fg" : "bg-surface ring-1 ring-line"}`}
          >
            {p ? "parseUser(raw)" : "raw as User"}
          </button>
        ))}
      </div>

      <div dir="ltr" className="code mt-3 grid gap-2 rounded-2xl border border-line bg-code p-4 text-sm md:grid-cols-3">
        <Box title="network">{body.json}</Box>
        <AnimatePresence mode="wait">
          <motion.div key={`${b}-${parse}-door`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <Box title="the door" tone={parse ? (body.parsedOk ? "ok" : "err") : undefined}>
              {parse ? body.parsed : "as User: stamped, nothing checked"}
            </Box>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${b}-${parse}-app`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            exit={{ opacity: 0 }}
          >
            <Box title="app: user.age + 1" tone={parse ? (body.parsedOk ? "ok" : undefined) : body.asBad ? "err" : "ok"}>
              {parse ? (body.parsedOk ? "21" : "never reached") : body.asResult}
            </Box>
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mt-3 text-sm text-muted">
        tsc صامت في الحالتين: الأنواع تُمحى قبل التشغيل. الفرق أن المحلّل كود يعمل فعلاً، فيوقف القيمة الخاطئة على الباب مع اسم الحقل.
      </p>
    </div>
  );
}

function Box({ title, tone, children }: { title: string; tone?: "ok" | "err"; children: ReactNode }) {
  return (
    <div className={`h-full rounded-xl border p-2 ${tone === "err" ? "border-err text-err" : tone === "ok" ? "border-ok text-ok" : "border-line"}`}>
      <div className="mb-1 text-xs text-muted">{title}</div>
      <div className="break-words">{children}</div>
    </div>
  );
}
