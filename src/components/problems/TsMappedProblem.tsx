"use client";

import { motion } from "motion/react";
import { useState } from "react";

const FIELDS = [
  { key: "id", type: "number", optional: false },
  { key: "name", type: "string", optional: false },
  { key: "email", type: "string", optional: true },
];

const RO = ["", "readonly ", "-readonly "];
const OPT = ["", "?", "-?"];
const VALS = ["T[K]", "boolean", "() => T[K]"];
const KEYS = ["K", "`get${Capitalize<K>}`", "T[K] extends string ? K : never"];

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/** Mapped types as a loop over keys: pick the modifiers, then watch the new type built key by key. */
export default function TsMappedProblem() {
  const [ro, setRo] = useState(0);
  const [opt, setOpt] = useState(0);
  const [val, setVal] = useState(0);
  const [key, setKey] = useState(0);
  const runKey = `${ro}${opt}${val}${key}`;

  const rows = FIELDS.map((f) => {
    const name = key === 1 ? `get${cap(f.key)}` : key === 2 && f.type !== "string" ? null : f.key;
    const optional = opt === 1 ? true : opt === 2 ? false : f.optional;
    const value = val === 0 ? f.type : val === 1 ? "boolean" : `() => ${f.type}`;
    return { from: f.key, name, line: name && `${ro === 1 ? "readonly " : ""}${name}${optional ? "?" : ""}: ${value};` };
  });

  const asPart = key === 0 ? "" : ` as ${KEYS[key]}`;
  const src = `{ ${RO[ro]}[K in keyof User${asPart}]${OPT[opt]}: ${VALS[val]} }`;

  return (
    <div>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <Picker label="المعدِّل" items={["بلا", "readonly", "-readonly"]} value={ro} set={setRo} />
        <Picker label="الاختياري" items={["كما هو", "?", "-?"]} value={opt} set={setOpt} />
        <Picker label="القيمة" items={VALS} value={val} set={setVal} />
        <Picker label="اسم المفتاح" items={["K", "getK", "النصوص فقط"]} value={key} set={setKey} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2" dir="ltr">
        <div className="code rounded-2xl border border-line bg-code p-4 text-sm leading-7">
          <div className="text-muted">interface User {"{"}</div>
          {FIELDS.map((f) => (
            <div key={f.key} className="pl-4">
              {f.key}
              {f.optional ? "?" : ""}: <span className="text-num">{f.type}</span>;
            </div>
          ))}
          <div className="text-muted">{"}"}</div>
          <div className="mt-2 break-all text-accent">type New = {src};</div>
        </div>

        <div className="code rounded-2xl border border-accent/50 bg-accent/5 p-4 text-sm leading-7">
          <div className="text-muted">type New = {"{"}</div>
          {rows.map((r, i) => (
            <motion.div
              key={runKey + r.from}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.35 }}
              className="flex gap-2 pl-4"
            >
              <span className="text-muted">K = &quot;{r.from}&quot; →</span>
              {r.line ? <span className="text-ok">{r.line}</span> : <span className="text-err line-through">never</span>}
            </motion.div>
          ))}
          <div className="text-muted">{"}"}</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">
        كل سطر على اليمين كُتب في دورة من الحلقة. أضف حقلاً إلى User في رأسك: كم سطراً تحتاج أن تغيّر؟ لا شيء.
      </p>
    </div>
  );
}

function Picker({ label, items, value, set }: { label: string; items: string[]; value: number; set: (n: number) => void }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-2">
      <div className="mb-1 text-xs text-muted">{label}</div>
      <div className="flex flex-wrap gap-1" dir="ltr">
        {items.map((x, i) => (
          <button
            key={x}
            onClick={() => set(i)}
            className={`code rounded px-2 py-0.5 text-xs ring-1 ${i === value ? "bg-accent/20 ring-accent" : "ring-line hover:bg-accent/10"}`}
          >
            {x}
          </button>
        ))}
      </div>
    </div>
  );
}
