"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Layer = "logged" | "positive" | "rounded";
const ALL: Layer[] = ["logged", "positive", "rounded"];
const INPUTS = [800, 12.6, -5];

/** Simulates a call through the decorator layers, outermost first, and returns the log lines. */
function simulate(layers: Layer[], x: number): { log: string[]; failed: boolean } {
  const log: string[] = [];
  let total = 0;
  const call = (i: number, v: number): number => {
    if (i === layers.length) {
      total += v;
      log.push(`add: total = ${total}`);
      return total;
    }
    const layer = layers[i];
    if (layer === "logged") {
      log.push(`@logged: add(${v})`);
      const r = call(i + 1, v);
      log.push(`@logged: returned ${r}`);
      return r;
    }
    if (layer === "positive") {
      if (v <= 0) {
        log.push(`@positive: throws RangeError (${v})`);
        throw new RangeError();
      }
      log.push(`@positive: ${v} ok`);
      return call(i + 1, v);
    }
    log.push(`@rounded: ${v} → ${Math.round(v)}`);
    return call(i + 1, Math.round(v));
  };
  try {
    call(0, x);
    return { log, failed: false };
  } catch {
    return { log, failed: true };
  }
}

/** Decorators as layers of an onion: toggle and reorder them, then call add and watch the path. */
export default function TsDecoratorsProblem() {
  const [layers, setLayers] = useState<Layer[]>(["logged", "positive"]);
  const [input, setInput] = useState<number | null>(null);

  const toggle = (l: Layer) => {
    setLayers((xs) => (xs.includes(l) ? xs.filter((x) => x !== l) : [...xs, l]));
    setInput(null);
  };
  const up = (i: number) => {
    if (i === 0) return;
    setLayers((xs) => {
      const ys = [...xs];
      [ys[i - 1], ys[i]] = [ys[i], ys[i - 1]];
      return ys;
    });
    setInput(null);
  };
  const result = input === null ? null : simulate(layers, input);

  return (
    <div>
      <div className="flex flex-wrap gap-2" dir="ltr">
        {ALL.map((l) => (
          <button
            key={l}
            onClick={() => toggle(l)}
            className={`code rounded-xl px-3 py-1.5 text-sm ring-1 ${layers.includes(l) ? "bg-accent/20 ring-accent" : "text-muted ring-line"}`}
          >
            @{l}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div dir="ltr" className="code rounded-2xl border border-line bg-code p-4 text-sm">
          <div className="text-muted">class Cart {"{"}</div>
          {layers.map((l, i) => (
            <motion.div key={l} layout className="flex items-center gap-2 pl-4">
              <span className="text-accent">@{l}</span>
              {i > 0 && (
                <button onClick={() => up(i)} className="text-xs text-muted hover:text-fg" aria-label="move up">
                  ↑
                </button>
              )}
            </motion.div>
          ))}
          <div className="pl-4">add(price: number) {"{ ... }"}</div>
          <div className="text-muted">{"}"}</div>
          <div className="mt-2 text-xs text-muted">
            add = {layers.map((l) => `${l}(`).join("")}add{")".repeat(layers.length)}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          {layers.map((l, i) => (
            <motion.div
              key={l}
              layout
              className="rounded-2xl border border-accent/50 bg-accent/5 p-2 text-center"
              style={{ width: `${100 - i * 14}%` }}
            >
              <span className="code text-xs text-accent">@{l}</span>
            </motion.div>
          ))}
          <div className="code mt-1 rounded-xl bg-surface px-4 py-2 text-sm">add</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2" dir="ltr">
        {INPUTS.map((x) => (
          <motion.button
            key={x}
            whileTap={{ scale: 0.94 }}
            onClick={() => setInput(x)}
            className="code rounded-xl bg-accent px-3 py-1.5 text-sm font-bold text-accent-fg"
          >
            cart.add({x})
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div key={`${input}-${layers.join()}`} dir="ltr" className="code mt-3 rounded-xl border border-line bg-surface p-3 text-sm">
            {result.log.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.3 }}
                className={line.includes("throws") ? "text-err" : line.startsWith("add") ? "text-ok" : ""}
              >
                {line}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-3 text-sm text-muted">
        الطبقة المكتوبة أعلى هي الخارجية: الاستدعاء يدخلها أولاً. حرّك @positive فوق @logged واستدعِ add(-5): هل يُسجَّل شيء؟
      </p>
    </div>
  );
}
