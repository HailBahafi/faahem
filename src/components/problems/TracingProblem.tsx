"use client";

import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { trace } from "@/lib/tracer/tracer";

const CODE = `let i = 1;
let total = 0;
while (i <= 3) {
  total = total + i;
  i = i + 1;
}
console.log(total);`;
const LINES = CODE.split("\n");

type Col = "i" | "total" | "cond" | "out";
type Row = { line: number; i: string; total: string; cond: string; out: string; ask: Col };

/** The real run, turned into trace-table rows: one row per executed line, the cell it wrote is the one to fill. */
function realRows(): Row[] {
  const rows: Row[] = [];
  for (const s of trace(CODE).steps) {
    if (s.line === null) continue;
    const vars = s.frames?.[0]?.vars ?? [];
    const get = (n: string) => vars.find((v) => v.name === n)?.value ?? "";
    const i = get("i");
    const total = get("total");
    const cond = s.line === 3 ? String(Number(i) <= 3) : "";
    const out = s.line === 7 ? (s.output ?? []).at(-1) ?? "" : "";
    const ask: Col = s.line === 3 ? "cond" : s.line === 7 ? "out" : s.changed?.includes("i") ? "i" : "total";
    rows.push({ line: s.line, i, total, cond, out, ask });
  }
  return rows;
}

const COLS: { id: Col; label: string }[] = [
  { id: "i", label: "i" },
  { id: "total", label: "total" },
  { id: "cond", label: "i <= 3" },
  { id: "out", label: "output" },
];

/** Be the computer: fill the trace table of a short loop, one cell per executed line, checked against the real run. */
export default function TracingProblem() {
  const rows = useMemo(realRows, []);
  const PREFILLED = 2;
  const [at, setAt] = useState(PREFILLED);
  const [draft, setDraft] = useState("");
  const [wrong, setWrong] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const finished = at >= rows.length;
  const row = rows[at];

  const submit = (value: string) => {
    if (!row) return;
    if (value.trim() === row[row.ask]) {
      setAt(at + 1);
      setDraft("");
      setWrong(0);
    } else {
      setWrong((w) => w + 1);
    }
    setTimeout(() => input.current?.focus(), 0);
  };

  const shown = (r: Row, k: number, c: Col) => {
    if (k < at) return r[c];
    // Rows not reached yet stay empty; the current row shows the values carried from the row above.
    if (k === at && c !== r.ask && (c === "i" || c === "total")) return r[c];
    return "";
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="code rounded-2xl bg-code p-5 text-sm leading-7" dir="ltr">
          {LINES.map((l, k) => (
            <div key={k} className={`rounded px-1 transition-colors ${row?.line === k + 1 ? "bg-accent/25 font-bold" : ""}`}>
              <span className="mr-3 text-muted">{k + 1}</span>
              <span className="whitespace-pre">{l}</span>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-line bg-surface p-3">
          <table className="code w-full text-center text-sm" dir="ltr">
            <thead>
              <tr className="text-muted">
                <th className="px-2 py-1">line</th>
                {COLS.map((c) => (
                  <th key={c.id} className="px-2 py-1">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, Math.min(at + 1, rows.length)).map((r, k) => (
                <motion.tr key={k} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="border-t border-line">
                  <td className="px-2 py-1 text-muted">{r.line}</td>
                  {COLS.map((c) => {
                    const asking = k === at && c.id === r.ask;
                    if (asking) {
                      return (
                        <td key={c.id} className="px-1 py-1">
                          {c.id === "cond" ? (
                            <div className="flex justify-center gap-1">
                              {["true", "false"].map((b) => (
                                <button key={b} onClick={() => submit(b)} className="rounded-lg border border-accent px-2 py-0.5 text-bool">
                                  {b}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <motion.input
                              key={`${k}-${wrong}`}
                              ref={input}
                              autoFocus
                              animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && submit(draft)}
                              inputMode="numeric"
                              className={`w-14 rounded-lg border-2 bg-code px-1 text-center outline-none ${wrong ? "border-err" : "border-accent"}`}
                              placeholder="?"
                            />
                          )}
                        </td>
                      );
                    }
                    const v = shown(r, k, c.id);
                    const fresh = k < at && c.id === r.ask;
                    const color = c.id === "cond" ? "text-bool" : "text-num";
                    return (
                      <td key={c.id} className={`px-2 py-1 ${fresh ? `font-bold ${color}` : "text-muted"}`}>
                        {v}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 min-h-12">
        {!finished && wrong === 0 && (
          <p className="text-muted">
            أنت الجهاز. السطر <b className="code text-num">{row.line}</b> يعمل الآن: ماذا يكتب في الخانة الفارغة؟ (Enter للتحقق)
          </p>
        )}
        {!finished && wrong > 0 && (
          <p className="text-err">
            ليست هذه. اقرأ القيم من الصف الذي فوقه، ثم نفّذ السطر <b className="code">{row.line}</b> بها.
          </p>
        )}
        {finished && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            جدولك يطابق التشغيل الحقيقي خانة بخانة. عرفت أن البرنامج يطبع 6 قبل أن تشغّله: هذا هو <b>التتبّع</b>.
          </motion.p>
        )}
        {at > PREFILLED && (
          <button
            onClick={() => {
              setAt(PREFILLED);
              setDraft("");
              setWrong(0);
            }}
            className="mt-2 text-sm text-muted hover:text-fg"
          >
            ابدأ من جديد
          </button>
        )}
      </div>
    </div>
  );
}
