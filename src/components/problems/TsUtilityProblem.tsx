"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Field = { name: string; type: string; optional: boolean; readonly: boolean };

const USER: Field[] = [
  { name: "id", type: "number", optional: false, readonly: false },
  { name: "name", type: "string", optional: false, readonly: false },
  { name: "email", type: "string", optional: false, readonly: false },
  { name: "phone", type: "string", optional: true, readonly: false },
];

const TOOLS: { src: string; use: string; apply: (f: Field[]) => Field[] }[] = [
  { src: "User", use: "النوع الأصل", apply: (f) => f },
  { src: "Partial<User>", use: "نموذج تعديل: كل شيء اختياري", apply: (f) => f.map((x) => ({ ...x, optional: true })) },
  { src: "Required<User>", use: "كل شيء مطلوب", apply: (f) => f.map((x) => ({ ...x, optional: false })) },
  { src: "Readonly<User>", use: "للقراءة فقط", apply: (f) => f.map((x) => ({ ...x, readonly: true })) },
  { src: 'Pick<User, "id" | "name">', use: "بطاقة عامة", apply: (f) => f.filter((x) => x.name === "id" || x.name === "name") },
  { src: 'Omit<User, "id">', use: "إنشاء: لا id بعد", apply: (f) => f.filter((x) => x.name !== "id") },
];

/** One base type; each utility builds a new type from it, field by field. */
export default function TsUtilityProblem() {
  const [tool, setTool] = useState(0);
  const [phone, setPhone] = useState(false);
  const base = phone ? USER : USER.slice(0, 3);
  const result = TOOLS[tool].apply(base);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" dir="ltr">
        {TOOLS.map((t, i) => (
          <button
            key={t.src}
            onClick={() => setTool(i)}
            className={`code rounded-xl border px-3 py-1.5 text-sm ${i === tool ? "border-accent bg-accent/15" : "border-line bg-surface hover:bg-accent/10"}`}
          >
            {t.src}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-code p-4" dir="ltr">
          <div className="code text-sm text-muted">interface User {"{"}</div>
          {base.map((f) => (
            <div key={f.name} className="code pl-4 text-sm">
              {f.name}
              {f.optional ? "?" : ""}: <span className="text-str">{f.type}</span>;
            </div>
          ))}
          <div className="code text-sm text-muted">{"}"}</div>
        </div>

        <div className="rounded-2xl border border-accent/50 bg-accent/5 p-4" dir="ltr">
          <div className="code text-sm text-muted">{TOOLS[tool].src} = {"{"}</div>
          <AnimatePresence initial={false}>
            {result.map((f) => (
              <motion.div
                key={f.name}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="code pl-4 text-sm"
              >
                {f.readonly && <span className="text-bool">readonly </span>}
                {f.name}
                {f.optional && <span className="text-num">?</span>}: <span className="text-str">{f.type}</span>;
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="code text-sm text-muted">{"}"}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">{TOOLS[tool].use}</span>
        <button onClick={() => setPhone(!phone)} className="rounded-xl border border-line bg-surface px-3 py-1.5 hover:bg-accent/10">
          {phone ? "احذف phone من User" : "أضف phone? إلى User"}
        </button>
      </div>
      {phone && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-muted">
          غيّرت الأصل مرة واحدة، فتغيّر كل نوع مشتق منه وحده. <b className="text-fg">مصدر واحد للحقيقة</b>.
        </motion.p>
      )}
    </div>
  );
}
