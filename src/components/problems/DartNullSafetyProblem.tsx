"use client";

import { motion } from "motion/react";
import { useState } from "react";

const PEOPLE: { name: string; middle: string | null }[] = [
  { name: "Sara", middle: "Noor" },
  { name: "Omar", middle: null },
  { name: "Lina", middle: "Amal" },
];

type Fix = "none" | "safe" | "bang" | "check";

const FIXES: { id: Exclude<Fix, "none">; code: string; note: string }[] = [
  { id: "safe", code: "middle?.length ?? 0", note: "‎?.‎ تتوقف عند null، و ‎??‎ تعطي 0" },
  { id: "check", code: "if (middle != null) middle.length", note: "الفحص يرقّي String?‎ إلى String" },
  { id: "bang", code: "middle!.length", note: "! وعد بأنها ليست null" },
];

/** Run the program over every person: returns the printed lines and the index where it crashed, if any. */
function run(fix: Fix): { lines: string[]; crashAt: number | null; crash?: string } {
  const lines: string[] = [];
  for (let i = 0; i < PEOPLE.length; i++) {
    const p = PEOPLE[i];
    if (p.middle === null) {
      if (fix === "none") return { lines, crashAt: i, crash: "TypeError: Cannot read properties of null (reading 'length')" };
      if (fix === "bang") return { lines, crashAt: i, crash: "Null check operator used on a null value" };
      lines.push(fix === "check" ? `${p.name}: no middle name` : `${p.name}: 0`);
    } else {
      lines.push(`${p.name}: ${p.middle.length}`);
    }
  }
  return { lines, crashAt: null };
}

/** The null crash: an app reads .length of a missing middle name. Without null safety it fails on a user's phone; Dart flags the line first. */
export default function DartNullSafetyProblem() {
  const [mode, setMode] = useState<"js" | "dart">("js");
  const [fix, setFix] = useState<Fix>("none");
  const [ran, setRan] = useState(false);
  const result = run(mode === "js" ? "none" : fix);
  const blocked = mode === "dart" && fix === "none";

  const pick = (m: "js" | "dart") => {
    setMode(m);
    setFix("none");
    setRan(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        {(["js", "dart"] as const).map((m) => (
          <button
            key={m}
            onClick={() => pick(m)}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${mode === m ? "bg-accent text-accent-fg" : "border border-line bg-surface"}`}
          >
            {m === "js" ? "بلا حماية من null" : "بعين مترجم Dart"}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-code p-4 text-sm" dir="ltr">
        <div className="code text-muted">{mode === "dart" ? "String? middle = person.middle;" : "let middle = person.middle;"}</div>
        <div className="code">
          print(
          <span className={blocked ? "rounded bg-err/15 text-err underline decoration-wavy" : "text-ok"}>
            {fix === "none" ? "middle.length" : FIXES.find((f) => f.id === fix)!.code}
          </span>
          );
        </div>
        {blocked && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="code mt-2 text-xs text-err">
            error: The property &apos;length&apos; can&apos;t be unconditionally accessed because the receiver can be &apos;null&apos;.
          </motion.div>
        )}
      </div>

      {mode === "dart" && (
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold">المترجم يرفض البرنامج قبل أن يعمل. اختر إصلاحاً:</div>
          <div className="flex flex-wrap gap-2">
            {FIXES.map((f) => (
              <motion.button
                key={f.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFix(f.id);
                  setRan(false);
                }}
                className={`rounded-lg border px-3 py-2 text-left text-xs ${fix === f.id ? "border-accent bg-accent/10" : "border-line bg-surface"}`}
              >
                <div className="code" dir="ltr">{f.code}</div>
                <div className="text-muted">{f.note}</div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={blocked}
          onClick={() => setRan(true)}
          className="rounded-2xl bg-accent px-6 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
        >
          شغّل على الهاتف
        </motion.button>
        {blocked && <span className="text-sm text-muted">لا يعمل البرنامج حتى تختار إصلاحاً.</span>}
      </div>

      {ran && (
        <div className="grid gap-2 sm:grid-cols-3">
          {PEOPLE.map((p, i) => {
            const crashed = result.crashAt === i;
            const skipped = result.crashAt !== null && i > result.crashAt;
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: skipped ? 0.35 : 1, y: 0 }}
                transition={{ delay: i * 0.35 }}
                className={`rounded-xl border p-3 text-sm ${crashed ? "border-err bg-err/10" : "border-line bg-surface"}`}
              >
                <div className="font-bold">{p.name}</div>
                <div className="code text-xs text-muted" dir="ltr">middle = {p.middle === null ? "null" : `"${p.middle}"`}</div>
                <div className={`code mt-1 text-xs ${crashed ? "text-err" : "text-ok"}`} dir="ltr">
                  {crashed ? result.crash : skipped ? "never ran" : result.lines[i]}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {ran && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-sm text-muted">
          {result.crashAt === null
            ? "البرنامج نجا لأنك قررت مسبقاً ماذا يحدث حين يكون الدرج فارغاً. هذا ما يجبرك عليه Dart."
            : mode === "js"
              ? "انهار التطبيق عند المستخدم، لا عندك. جرّب الآن «بعين مترجم Dart»."
              : "! أسكتت المترجم، لكن الوعد كان كاذباً فانهار البرنامج. ! تُستعمل فقط حين تكون متأكداً."}
        </motion.p>
      )}
    </div>
  );
}
