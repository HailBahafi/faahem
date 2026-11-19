"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const ITEMS = ["Water", "Juice", "Chips", "Cake", "Nuts", "Gum"];
const ICONS = ["💧", "🧃", "🥔", "🍰", "🥜", "🍬"];
const TICK = 550;

/** A vending machine: an if/else-if chain tests every code in turn, a switch jumps straight to the match. */
export default function SwitchProblem() {
  const [pick, setPick] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [landed, setLanded] = useState(false);
  const [run, setRun] = useState(0);

  // The chain tests one condition per tick until it reaches the picked one.
  useEffect(() => {
    if (pick === null || step >= pick) return;
    const t = setTimeout(() => setStep((s) => s + 1), TICK);
    return () => clearTimeout(t);
  }, [pick, step, run]);

  // The switch reads the value once, then lands on the case in one move.
  useEffect(() => {
    if (pick === null) return;
    const t = setTimeout(() => setLanded(true), TICK);
    return () => clearTimeout(t);
  }, [pick, run]);

  const choose = (i: number) => {
    setPick(i);
    setStep(0);
    setLanded(false);
    setRun((r) => r + 1);
  };

  const chainDone = pick !== null && step === pick;

  const chainLines = [
    ...ITEMS.map((it, i) => `${i === 0 ? "if" : "else if"} (choice === ${i + 1}) give("${it}");`),
    `else give("Nothing");`,
  ];
  const switchLines = [
    "switch (choice) {",
    ...ITEMS.map((it, i) => `  case ${i + 1}: give("${it}"); break;`),
    "}",
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {ITEMS.map((it, i) => (
          <motion.button
            key={it}
            whileTap={{ scale: 0.9 }}
            onClick={() => choose(i)}
            className={`flex flex-col items-center rounded-2xl border px-4 py-2 ${
              pick === i ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"
            }`}
          >
            <span className="text-2xl">{ICONS[i]}</span>
            <span className="code text-sm font-bold">{i + 1}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Panel
          title="سلسلة if / else-if"
          stat={pick === null ? "" : `${step + 1} فحص`}
          lines={chainLines}
          lineState={(k) => {
            if (pick === null) return "idle";
            if (k < step) return "no";
            if (k === step) return chainDone ? "yes" : "now";
            return "idle";
          }}
          hl={pick === null ? null : step}
          id={`chain-${run}`}
        />
        <Panel
          title="switch"
          good
          stat={pick === null ? "" : landed ? "قراءة واحدة، قفزة واحدة" : "قراءة القيمة"}
          lines={switchLines}
          lineState={(k) => {
            if (pick === null) return "idle";
            if (!landed) return k === 0 ? "now" : "idle";
            return k === pick + 1 ? "yes" : "idle";
          }}
          hl={pick === null ? null : landed ? pick + 1 : 0}
          id={`switch-${run}`}
        />
      </div>

      {chainDone && landed && pick !== null && pick >= 3 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          السلسلة سألت {pick + 1} أسئلة واحداً بعد الآخر. switch قرأت الرقم مرة و<b className="text-fg">قفزت إلى الحالة مباشرة</b>، مثل مصعد يذهب إلى الطابق دون أن يقف عند كل طابق.
        </motion.p>
      )}
      {pick === null && <p className="mt-4 text-sm text-muted">اختر منتجاً. جرّب الأخير 6.</p>}
    </div>
  );
}

type LineState = "idle" | "now" | "no" | "yes";

function Panel({
  title,
  stat,
  lines,
  lineState,
  hl,
  id,
  good,
}: {
  title: string;
  stat: string;
  lines: string[];
  lineState: (k: number) => LineState;
  hl: number | null;
  id: string;
  good?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${good ? "border-accent/50 bg-accent-soft/20" : "border-line bg-surface"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{title}</span>
        <span className="text-sm text-muted">{stat}</span>
      </div>
      <div dir="ltr" className="code mt-3 overflow-x-auto rounded-xl bg-code p-3 text-xs leading-6">
        {lines.map((line, k) => {
          const st = lineState(k);
          return (
            <div key={k} className="relative flex items-center gap-2 rounded px-2">
              {hl === k && (
                <motion.div
                  layoutId={id}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 rounded bg-accent/20"
                />
              )}
              <span className="relative w-3 shrink-0 text-center">
                {st === "no" && <span className="text-err">✗</span>}
                {st === "yes" && <span className="text-ok">✓</span>}
              </span>
              <span className={`relative whitespace-pre ${st === "no" ? "text-muted line-through" : ""}`}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
