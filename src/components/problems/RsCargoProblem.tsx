"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

/**
 * A tiny cargo: create a project, run it, break main.rs and run again. The binary in target/
 * appears only when the compiler accepts the whole file, and an unchanged file is not rebuilt.
 */
export default function RsCargoProblem() {
  const [created, setCreated] = useState(false);
  const [broken, setBroken] = useState(false);
  const [version, setVersion] = useState(0);
  const [builtVersion, setBuiltVersion] = useState<number | null>(null);
  const [release, setRelease] = useState(false);
  const [failed, setFailed] = useState(false);
  const [term, setTerm] = useState<{ text: string; err?: boolean }[]>([]);

  const say = (lines: { text: string; err?: boolean }[]) => setTerm((t) => [...t, ...lines].slice(-9));

  const run = () => {
    say([{ text: "$ cargo run" }]);
    if (builtVersion === version) {
      say([{ text: "Finished (nothing changed)" }, { text: "Hello, world!" }]);
      return;
    }
    if (broken) {
      setFailed(true);
      say([
        { text: "Compiling hello v0.1.0" },
        { text: "error[E0308]: mismatched types", err: true },
        { text: "error: could not compile `hello`", err: true },
      ]);
      return;
    }
    setBuiltVersion(version);
    setFailed(false);
    say([{ text: "Compiling hello v0.1.0" }, { text: "Running `target/debug/hello`" }, { text: "Hello, world!" }]);
  };

  const toggleBug = () => {
    setBroken((b) => !b);
    setVersion((v) => v + 1);
  };

  const files = created
    ? [
        { name: "Cargo.toml", on: true },
        { name: broken ? "src/main.rs  (فيه خطأ)" : "src/main.rs", on: true, bad: broken },
        { name: "target/debug/hello", on: builtVersion !== null },
        { name: "target/release/hello", on: release },
      ]
    : [];

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-2 text-sm text-muted">مجلد المشروع</div>
        <div className="code space-y-1 text-sm" dir="ltr">
          {!created && <div className="text-muted">(فارغ)</div>}
          <AnimatePresence>
            {files
              .filter((f) => f.on)
              .map((f) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={f.bad ? "text-err" : f.name.startsWith("target") ? "text-ok" : ""}
                >
                  {f.name}
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {!created ? (
            <Btn onClick={() => { setCreated(true); say([{ text: "$ cargo new hello" }, { text: "Creating binary (application) `hello` package" }]); }}>cargo new hello</Btn>
          ) : (
            <>
              <Btn onClick={run}>cargo run</Btn>
              <Btn onClick={() => { if (!broken) { setRelease(true); say([{ text: "$ cargo build --release" }, { text: "Finished `release` profile [optimized]" }]); } else say([{ text: "$ cargo build --release" }, { text: "error: could not compile `hello`", err: true }]); }}>cargo build --release</Btn>
              <button onClick={toggleBug} className="rounded-xl border border-line px-3 py-2 text-sm hover:border-accent">
                {broken ? "أصلح main.rs" : "اكسر سطراً في main.rs"}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="code min-h-48 rounded-2xl bg-code p-4 text-sm" dir="ltr">
        {term.map((l, i) => (
          <motion.div key={i + l.text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={l.err ? "text-err" : l.text.startsWith("$") ? "text-muted" : ""}>
            {l.text}
          </motion.div>
        ))}
        {broken && failed && (
          <p className="mt-3 text-muted" dir="rtl">
            لاحظ: المترجم رفض main.rs الجديد كله، فلم يعمل منه ولا سطر واحد. لم يُكتب برنامج جديد في target.
          </p>
        )}
      </div>
    </div>
  );
}

function Btn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <motion.button whileTap={{ scale: 0.94 }} onClick={onClick} className="code rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-fg" dir="ltr">
      {children}
    </motion.button>
  );
}
