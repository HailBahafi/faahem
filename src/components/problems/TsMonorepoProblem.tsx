"use client";

import { motion } from "motion/react";
import { useState } from "react";

/** Four packages; tsc -b rebuilds a package when its own files changed or a dependency's .d.ts changed. */
const PKGS = ["shared", "ui", "api", "web"] as const; // already in build order
type Pkg = (typeof PKGS)[number];
const DEPS: Record<Pkg, Pkg[]> = { shared: [], ui: ["shared"], api: ["shared"], web: ["ui", "shared"] };
type Edit = { pkg: Pkg; kind: "body" | "signature" };
type Result = "rebuilt" | "timestamps" | "up to date";

const EDITS: { label: string; edit: Edit }[] = [
  { label: "shared: function body", edit: { pkg: "shared", kind: "body" } },
  { label: "shared: exported signature", edit: { pkg: "shared", kind: "signature" } },
  { label: "ui: exported signature", edit: { pkg: "ui", kind: "signature" } },
  { label: "web: any file", edit: { pkg: "web", kind: "body" } },
];

function plan(edit: Edit): Record<Pkg, Result> {
  const out = {} as Record<Pkg, Result>;
  const dtsChanged = new Set<Pkg>();
  const rebuilt = new Set<Pkg>();
  for (const p of PKGS) {
    if (p === edit.pkg) {
      out[p] = "rebuilt";
      rebuilt.add(p);
      if (edit.kind === "signature") dtsChanged.add(p);
    } else if (DEPS[p].some((d) => dtsChanged.has(d))) {
      out[p] = "rebuilt";
      rebuilt.add(p);
    } else if (DEPS[p].some((d) => rebuilt.has(d))) {
      out[p] = "timestamps";
    } else {
      out[p] = "up to date";
    }
  }
  return out;
}

const TONE: Record<Result, string> = {
  rebuilt: "border-err bg-err/10 text-err",
  timestamps: "border-accent bg-accent/10",
  "up to date": "border-ok bg-ok/10 text-ok",
};

export default function TsMonorepoProblem() {
  const [e, setE] = useState(0);
  const [built, setBuilt] = useState(0); // bump to replay the animation
  const result = plan(EDITS[e].edit);
  const count = PKGS.filter((p) => result[p] === "rebuilt").length;

  return (
    <div>
      <div className="mb-1 text-xs text-muted">ماذا عدّلت؟</div>
      <div className="flex flex-wrap gap-1.5" dir="ltr">
        {EDITS.map((x, i) => (
          <button
            key={x.label}
            onClick={() => {
              setE(i);
              setBuilt(0);
            }}
            className={`code rounded-lg px-2 py-1 text-sm ring-1 ${i === e ? "bg-accent/20 ring-accent" : "ring-line hover:bg-accent/10"}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => setBuilt((b) => b + 1)}
        className="code mt-3 rounded-2xl bg-accent px-5 py-2 font-bold text-accent-fg"
      >
        $ tsc -b
      </motion.button>

      <div dir="ltr" className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        {PKGS.map((p, i) => (
          <motion.div
            key={`${p}-${e}-${built}`}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ delay: built ? i * 0.35 : 0 }}
            className={`code rounded-2xl border p-3 text-sm ${built ? TONE[result[p]] : "border-line bg-surface"}`}
          >
            <div className="font-bold">
              {i + 1}. {p}
            </div>
            <div className="text-xs text-muted">refs: {DEPS[p].length ? DEPS[p].join(", ") : "none"}</div>
            {built > 0 && (
              <div className="mt-1 text-xs">
                {result[p] === "timestamps" ? "same .d.ts upstream: timestamps only" : result[p]}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {built > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-3 text-sm">
          أُعيد بناء <b className="text-err">{count}</b> من 4. مشروع واحد بلا references كان سيفحص الأربعة في كل مرة.
        </motion.p>
      )}
    </div>
  );
}
