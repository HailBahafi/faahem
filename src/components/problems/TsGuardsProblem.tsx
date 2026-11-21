"use client";

import { motion } from "motion/react";
import { useState } from "react";

const PARCELS: { src: string; value: unknown }[] = [
  { src: '{"name":"tea","price":8}', value: { name: "tea", price: 8 } },
  { src: '{"name":"cake","price":"15"}', value: { name: "cake", price: "15" } },
  { src: "null", value: null },
  { src: '{"title":"mug"}', value: { title: "mug" } },
];

type Mode = "as" | "shallow" | "guard";
const MODES: { id: Mode; src: string }[] = [
  { id: "as", src: "data as Product" },
  { id: "shallow", src: '"price" in data' },
  { id: "guard", src: "isProduct(data)" },
];

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null;
const passes = (mode: Mode, x: unknown) =>
  mode === "as" ? true : mode === "shallow" ? isObj(x) && "price" in x : isObj(x) && typeof x.name === "string" && typeof x.price === "number";

/** Run each parcel through `p.name.toUpperCase() + p.price.toFixed(2)` behind the chosen check. */
function process(mode: Mode, x: unknown): { kind: "ok" | "skip" | "crash"; text: string } {
  if (!passes(mode, x)) return { kind: "skip", text: "rejected by the check" };
  try {
    const p = x as { name: string; price: number };
    return { kind: "ok", text: `${p.name.toUpperCase()} ${p.price.toFixed(2)}` };
  } catch (e) {
    return { kind: "crash", text: `TypeError: ${(e as Error).message}` };
  }
}

/** Parcels from an API: trusting them with `as` crashes at run time; a real guard rejects the bad ones. */
export default function TsGuardsProblem() {
  const [mode, setMode] = useState<Mode>("as");
  const [ran, setRan] = useState(false);
  const results = PARCELS.map((p) => process(mode, p.value));
  const crashes = results.filter((r) => r.kind === "crash").length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" dir="ltr">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id);
              setRan(false);
            }}
            className={`code rounded-xl border px-3 py-1.5 text-sm ${mode === m.id ? "border-accent bg-accent/15" : "border-line bg-surface hover:bg-accent/10"}`}
          >
            {m.src}
          </button>
        ))}
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => setRan(true)} className="rounded-xl bg-accent px-4 py-1.5 text-sm font-bold text-accent-fg">
          عالج الطرود
        </motion.button>
      </div>

      <div className="space-y-2" dir="ltr">
        {PARCELS.map((p, i) => {
          const r = results[i];
          const color = !ran ? "border-line bg-surface" : r.kind === "ok" ? "border-ok/60 bg-ok/10" : r.kind === "skip" ? "border-line bg-surface opacity-70" : "border-err bg-err/10";
          return (
            <motion.div
              key={p.src}
              initial={false}
              animate={ran && r.kind === "crash" ? { x: [0, -6, 6, -3, 0] } : { x: 0 }}
              transition={{ delay: i * 0.12 }}
              className={`code flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${color}`}
            >
              <span>{p.src}</span>
              {ran && <span className={r.kind === "ok" ? "text-ok" : r.kind === "crash" ? "text-err" : "text-muted"}>{r.text}</span>}
            </motion.div>
          );
        })}
      </div>

      {ran && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          {crashes > 0
            ? `${crashes} انهيار، والمدقّق لم يعترض على شيء: as و الفحص الناقص يكتبان ملصقاً لا يطابق الطرد. جرّب الحارس الكامل.`
            : "لا انهيار: الحارس فحص كل حقل فعلاً قبل أن يعد المدقّق بأن الطرد منتج."}
        </motion.p>
      )}
    </div>
  );
}
