"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** A typed drawer: it is born holding its zero value and only accepts values of its own type. */

type GoType = "int" | "float64" | "string" | "bool";
interface Val {
  text: string;
  kind: "int" | "float" | "string" | "bool";
}

const ZERO: Record<GoType, string> = { int: "0", float64: "0", string: '""', bool: "false" };
const VALUES: Val[] = [
  { text: "42", kind: "int" },
  { text: "3.5", kind: "float" },
  { text: '"Sara"', kind: "string" },
  { text: "true", kind: "bool" },
];
const COLOR: Record<GoType, string> = { int: "text-num", float64: "text-num", string: "text-str", bool: "text-bool" };

function accepts(t: GoType, v: Val): boolean {
  if (t === "int") return v.kind === "int";
  if (t === "float64") return v.kind === "int" || v.kind === "float";
  if (t === "string") return v.kind === "string";
  return v.kind === "bool";
}

function message(t: GoType, v: Val): string {
  const what = v.kind === "float" ? "untyped float constant" : `untyped ${v.kind} constant`;
  return `cannot use ${v.text} (${what}) as ${t} value in assignment${t === "int" && v.kind === "float" ? " (truncated)" : ""}`;
}

export default function GoVariablesProblem() {
  const [type, setType] = useState<GoType | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tries, setTries] = useState(0);

  const open = (t: GoType) => {
    setType(t);
    setValue(ZERO[t]);
    setError(null);
  };
  const put = (v: Val) => {
    if (!type) return;
    setTries((n) => n + 1);
    if (accepts(type, v)) {
      setValue(v.text);
      setError(null);
    } else setError(message(type, v));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2" dir="ltr">
        <span className="code text-muted">var box</span>
        {(Object.keys(ZERO) as GoType[]).map((t) => (
          <motion.button
            key={t}
            whileTap={{ scale: 0.92 }}
            onClick={() => open(t)}
            className={`code rounded-xl border px-4 py-2 text-sm font-bold ${type === t ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"}`}
          >
            {t}
          </motion.button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="text-sm text-muted">الدرج box</div>
          <div className="relative mt-3 flex h-28 items-center justify-center overflow-hidden rounded-xl bg-code">
            <AnimatePresence mode="popLayout">
              {type ? (
                <motion.span
                  key={type + value}
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 30, opacity: 0 }}
                  className={`code text-4xl font-bold ${COLOR[type]}`}
                  dir="ltr"
                >
                  {value}
                </motion.span>
              ) : (
                <span className="text-muted">اختر نوعاً</span>
              )}
            </AnimatePresence>
            {type && <span className="code absolute bottom-2 left-3 text-xs text-muted" dir="ltr">{type}</span>}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="text-sm text-muted">ضع فيه قيمة</div>
          <div className="mt-3 flex flex-wrap gap-2" dir="ltr">
            {VALUES.map((v) => (
              <motion.button
                key={v.text}
                whileTap={{ scale: 0.9 }}
                disabled={!type}
                onClick={() => put(v)}
                className="code rounded-xl border border-line bg-code px-4 py-2 font-bold disabled:opacity-40"
              >
                box = {v.text}
              </motion.button>
            ))}
          </div>
          <AnimatePresence>
            {error && (
              <motion.div
                key={error}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: [8, -8, 4, 0] }}
                exit={{ opacity: 0 }}
                className="code mt-3 rounded-lg bg-err/10 p-2 text-xs text-err"
                dir="ltr"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {tries >= 3 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          لاحظت؟ الدرج لا يولد فارغاً أبداً: فيه <b className="text-fg">القيمة الصفرية</b> لنوعه. ونوعه ثابت، فالقيمة الغريبة يرفضها المترجم قبل أن يعمل البرنامج.
        </motion.p>
      )}
    </div>
  );
}
