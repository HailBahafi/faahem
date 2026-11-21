"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** A tiny Go project in a simulated terminal: the compiler reads the whole file before anything runs. */

interface Line {
  kind: "cmd" | "out" | "err";
  text: string;
}

const GOOD = ["package main", "", 'import "fmt"', "", "func main() {", '\tfmt.Println("start")', '\tfmt.Println("Hello, Go")', "}"];
const BAD = ["package main", "", 'import "fmt"', "", "func main() {", '\tfmt.Println("start")', '\tcity := "Riyadh"', '\tfmt.Println("Hello, Go")', "}"];

export default function GoToolProblem() {
  const [bug, setBug] = useState(false);
  const [binary, setBinary] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [runs, setRuns] = useState(0);

  const compile = (): Line[] | null => (bug ? [{ kind: "err", text: "./main.go:7:2: declared and not used: city" }] : null);
  const push = (cmd: string, out: Line[]) => {
    setLines((l) => [...l, { kind: "cmd" as const, text: cmd }, ...out].slice(-12));
    setRuns((r) => r + 1);
  };

  const goRun = () => push("go run .", compile() ?? [{ kind: "out", text: "start" }, { kind: "out", text: "Hello, Go" }]);
  const goBuild = () => {
    const err = compile();
    if (!err) setBinary("ok");
    push("go build", err ?? []);
  };
  const exec = () =>
    push("./hello", binary ? [{ kind: "out", text: "start" }, { kind: "out", text: "Hello, Go" }] : [{ kind: "err", text: "./hello: no such file or directory" }]);

  const code = bug ? BAD : GOOD;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">main.go</span>
            <button
              onClick={() => setBug((b) => !b)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${bug ? "bg-ok/20 text-ok" : "bg-err/15 text-err"}`}
            >
              {bug ? "أصلح الخطأ" : "أضف متغيراً لا يُستعمل"}
            </button>
          </div>
          <pre dir="ltr" className="code overflow-x-auto rounded-xl bg-code p-3 text-sm leading-6">
            {code.map((l, k) => (
              <motion.div
                key={l + k}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={bug && k === 6 ? "rounded bg-err/15 text-err" : ""}
              >
                {l || " "}
              </motion.div>
            ))}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {["go.mod", "main.go"].map((f) => (
              <span key={f} className="code rounded-lg border border-line px-2 py-1">{f}</span>
            ))}
            <AnimatePresence>
              {binary && (
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="code rounded-lg bg-accent px-2 py-1 font-bold text-accent-fg"
                >
                  hello.exe
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-line bg-code p-4">
          <div dir="ltr" className="code min-h-48 flex-1 space-y-1 text-sm">
            {lines.length === 0 && <div className="text-muted">$ _</div>}
            {lines.map((l, k) => (
              <motion.div
                key={runs + "-" + k}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: l.kind === "cmd" ? 0 : 0.25 }}
                className={l.kind === "cmd" ? "text-muted" : l.kind === "err" ? "text-err" : "text-ok"}
              >
                {l.kind === "cmd" ? "$ " + l.text : l.text}
              </motion.div>
            ))}
          </div>
          <div dir="ltr" className="mt-3 flex flex-wrap gap-2">
            {[
              ["go run .", goRun],
              ["go build", goBuild],
              ["./hello", exec],
            ].map(([label, fn]) => (
              <motion.button
                key={label as string}
                whileTap={{ scale: 0.92 }}
                onClick={fn as () => void}
                className="code rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg"
              >
                {label as string}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      {runs >= 3 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          لاحظت؟ مع الخطأ لا تُطبع حتى <b className="text-fg">start</b> في السطر الأول: المترجم يقرأ الملف كله قبل أن يعمل أي سطر. و <b className="text-fg">hello.exe</b> يبقى كما بُني آخر مرة.
        </motion.p>
      )}
    </div>
  );
}
