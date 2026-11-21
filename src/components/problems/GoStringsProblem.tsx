"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const WORDS = ["cat", "café", "مرحبا", "go🚀"];
const enc = new TextEncoder();
const hex = (b: number) => b.toString(16).toUpperCase().padStart(2, "0");

/** A word's real bytes: len counts bytes, a letter can take several; reversing bytes breaks letters. */
export default function GoStringsProblem() {
  const [word, setWord] = useState(WORDS[1]);
  const [rev, setRev] = useState<"none" | "bytes" | "runes">("none");
  const runes = [...word];
  const groups = runes.map((r) => Array.from(enc.encode(r)));
  const total = groups.reduce((n, g) => n + g.length, 0);
  const shown =
    rev === "bytes"
      ? new TextDecoder().decode(Uint8Array.from(Array.from(enc.encode(word)).reverse()))
      : rev === "runes"
        ? [...runes].reverse().join("")
        : word;

  const choose = (w: string) => {
    setWord(w);
    setRev("none");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2" dir="ltr">
        {WORDS.map((w) => (
          <button
            key={w}
            onClick={() => choose(w)}
            className={`code rounded-xl border px-4 py-2 ${w === word ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"}`}
          >
            &quot;{w}&quot;
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2" dir="ltr">
        {groups.map((g, k) => (
          <motion.div
            key={`${word}-${k}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: k * 0.06 }}
            className={`flex flex-col items-center rounded-xl border p-1.5 ${g.length > 1 ? "border-accent/60" : "border-line"}`}
          >
            <span className="text-lg font-bold">{runes[k]}</span>
            <div className="flex gap-0.5">
              {g.map((b, i) => (
                <span key={i} className="code rounded bg-code px-1.5 py-0.5 text-xs text-num">
                  {hex(b)}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="code mt-4 grid gap-1 text-sm" dir="ltr">
        <div>
          len(s) = <span className="text-num font-bold">{total}</span> <span className="text-muted">{"// bytes"}</span>
        </div>
        <div>
          utf8.RuneCountInString(s) = <span className="text-num font-bold">{runes.length}</span> <span className="text-muted">{"// letters"}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3" dir="ltr">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => setRev("bytes")} className="code rounded-2xl border border-line px-4 py-3 font-bold">
          reverse []byte
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setRev("runes")}
          className="code rounded-2xl bg-accent px-4 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20"
        >
          reverse []rune
        </motion.button>
        <AnimatePresence mode="wait">
          <motion.span
            key={shown + rev}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`code rounded-xl bg-code px-4 py-2 text-xl font-bold ${rev === "bytes" && total > runes.length ? "text-err" : "text-str"}`}
          >
            &quot;{shown}&quot;
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="mt-3 min-h-12">
        {rev === "bytes" && total > runes.length && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            قلب البايتات فرّق بايتات الحرف الواحد، فصارت رموزاً مكسورة. الحرف هنا <b>rune</b> وليس بايتاً.
          </motion.p>
        )}
        {rev === "none" && <p className="text-muted">كل مربع حرف، والأرقام تحته بايتاته في الذاكرة.</p>}
      </div>
    </div>
  );
}
