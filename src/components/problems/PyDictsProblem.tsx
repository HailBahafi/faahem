"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const NAMES = ["Ali", "Sara", "Huda", "Zaid", "Lina", "Fahd", "Reem", "Nora", "Majd", "Yara", "Adel", "Omar"];
const PHONE = (i: number) => `05${(31 + i * 7).toString().padStart(2, "0")}`;
const PICKS = ["Sara", "Reem", "Omar"];
// A fixed "hash" so each name always lands in the same bucket.
const bucketOf = (name: string) => [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 97, 7) % NAMES.length;

/** Find a phone number by scanning a list of pairs versus jumping straight to a dict bucket. */
export default function PyDictsProblem() {
  const [target, setTarget] = useState<string | null>(null);
  const [scan, setScan] = useState(-1);
  const found = target ? NAMES.indexOf(target) : -1;

  useEffect(() => {
    if (!target || scan >= found) return;
    const t = setTimeout(() => setScan((s) => s + 1), 220);
    return () => clearTimeout(t);
  }, [target, scan, found]);

  const pick = (name: string) => {
    setTarget(name);
    setScan(0);
  };
  const done = target !== null && scan >= found;

  // Dict buckets: each name sits in the slot its hash gives (collisions shown side by side).
  const buckets: string[][] = Array.from({ length: NAMES.length }, () => []);
  NAMES.forEach((n) => buckets[bucketOf(n)].push(n));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-muted">ابحث عن رقم:</span>
        {PICKS.map((n) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.92 }}
            onClick={() => pick(n)}
            className={`code rounded-xl px-4 py-2 font-bold ${target === n ? "bg-accent text-accent-fg" : "border border-line"}`}
          >
            {n}
          </motion.button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2" dir="ltr">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-1 font-semibold" dir="rtl">قائمة أزواج: تقارن واحداً واحداً</div>
          <div className="code mb-3 text-sm text-muted">steps: {target ? Math.min(scan, found) + 1 : 0}</div>
          <div className="grid grid-cols-3 gap-1">
            {NAMES.map((n, i) => (
              <motion.div
                key={n}
                animate={{ scale: i === scan && target ? 1.08 : 1 }}
                className={`code rounded-lg px-2 py-1 text-xs ${
                  done && i === found ? "bg-accent text-accent-fg" : target && i <= scan ? "bg-code text-err" : "bg-code text-muted"
                }`}
              >
                {n}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-accent/50 bg-accent-soft/20 p-4">
          <div className="mb-1 font-semibold" dir="rtl">قاموس: hash الاسم يدلّ على خانته</div>
          <div className="code mb-3 text-sm text-muted">
            steps: {target ? 1 : 0}
            {target && <span className="text-num"> · hash(&quot;{target}&quot;) → slot {bucketOf(target)}</span>}
          </div>
          <div className="grid grid-cols-3 gap-1">
            {buckets.map((b, i) => (
              <div
                key={i}
                className={`code min-h-6 rounded-lg px-2 py-1 text-xs ${target && bucketOf(target) === i ? "bg-accent text-accent-fg" : "bg-code text-muted"}`}
              >
                {i}: {b.join(", ")}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 min-h-12 text-center">
        {!target && <p className="text-muted">اختر اسماً وراقب كم خطوة يحتاج كل دفتر.</p>}
        {done && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            رقم {target}: <span className="code text-num">{PHONE(found)}</span>. القائمة احتاجت {found + 1} خطوة، والقاموس خطوة واحدة. مع مليون اسم يبقى القاموس خطوة واحدة.
          </motion.p>
        )}
      </div>
    </div>
  );
}
