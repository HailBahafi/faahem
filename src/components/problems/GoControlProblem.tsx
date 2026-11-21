"use client";

import { motion } from "motion/react";
import { useState } from "react";

/** Three loops, one keyword: step through each form of Go's for and watch which part runs. */

type Part = "init" | "cond" | "body" | "post" | "done";
interface Tick {
  part: Part;
  v: number;
  ok?: boolean;
  out?: string;
}
interface Form {
  label: string;
  name: string;
  segs: { part: Part | "text"; text: string }[];
  ticks: Tick[];
}

function counter(): Tick[] {
  const t: Tick[] = [{ part: "init", v: 0 }];
  for (let i = 0; ; i++) {
    t.push({ part: "cond", v: i, ok: i < 3 });
    if (i >= 3) break;
    t.push({ part: "body", v: i, out: String(i) });
    t.push({ part: "post", v: i + 1 });
  }
  return [...t, { part: "done", v: 3 }];
}
function whileLike(): Tick[] {
  const t: Tick[] = [];
  let n = 10;
  for (;;) {
    t.push({ part: "cond", v: n, ok: n > 1 });
    if (n <= 1) break;
    n = Math.floor(n / 2);
    t.push({ part: "body", v: n });
  }
  return [...t, { part: "done", v: n }];
}
function forever(): Tick[] {
  const t: Tick[] = [];
  for (let n = 1; n <= 3; n++) t.push({ part: "body", v: n, out: n === 3 ? "break" : undefined });
  return [...t, { part: "done", v: 3 }];
}

const FORMS: Form[] = [
  {
    label: "عدّاد",
    name: "i",
    segs: [{ part: "text", text: "for " }, { part: "init", text: "i := 0" }, { part: "text", text: "; " }, { part: "cond", text: "i < 3" }, { part: "text", text: "; " }, { part: "post", text: "i++" }, { part: "text", text: " {\n" }, { part: "body", text: "\tfmt.Println(i)" }, { part: "text", text: "\n}" }],
    ticks: counter(),
  },
  {
    label: "شرط فقط",
    name: "n",
    segs: [{ part: "text", text: "for " }, { part: "cond", text: "n > 1" }, { part: "text", text: " {\n" }, { part: "body", text: "\tn /= 2" }, { part: "text", text: "\n}" }],
    ticks: whileLike(),
  },
  {
    label: "بلا نهاية",
    name: "n",
    segs: [{ part: "text", text: "for {\n" }, { part: "body", text: "\tn++\n\tif n == 3 {\n\t\tbreak\n\t}" }, { part: "text", text: "\n}" }],
    ticks: forever(),
  },
];

const PART_NAME: Record<Part, string> = { init: "البداية: مرة واحدة", cond: "الشرط", body: "الجسم", post: "الخطوة بعد كل دورة", done: "خرجنا من الحلقة" };

export default function GoControlProblem() {
  const [f, setF] = useState(0);
  const [k, setK] = useState(-1);
  const [seen, setSeen] = useState(new Set<number>());
  const form = FORMS[f];
  const tick = k >= 0 ? form.ticks[k] : null;
  const out = form.ticks.slice(0, k + 1).filter((t) => t.out && t.out !== "break").map((t) => t.out);

  const choose = (i: number) => {
    setF(i);
    setK(-1);
  };
  const step = () => {
    if (k >= form.ticks.length - 1) {
      setK(-1);
      return;
    }
    setK(k + 1);
    if (k + 1 === form.ticks.length - 1) setSeen((s) => new Set(s).add(f));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FORMS.map((fm, i) => (
          <button
            key={fm.label}
            onClick={() => choose(i)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold ${f === i ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"}`}
          >
            {fm.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <pre dir="ltr" className="code whitespace-pre-wrap rounded-2xl bg-code p-5 text-base leading-8">
          {form.segs.map((s, i) => (
            <motion.span
              key={f + "-" + i}
              animate={{ backgroundColor: tick && s.part === tick.part ? "var(--accent)" : "rgba(0,0,0,0)" }}
              className={`rounded px-0.5 ${tick && s.part === tick.part ? "text-accent-fg" : ""}`}
            >
              {s.text}
            </motion.span>
          ))}
        </pre>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="text-sm text-muted">{tick ? PART_NAME[tick.part] : "اضغط «خطوة»"}</div>
          {tick?.part === "cond" && (
            <div className={`mt-1 font-bold ${tick.ok ? "text-ok" : "text-err"}`}>{tick.ok ? "true: ندخل الجسم" : "false: نخرج"}</div>
          )}
          {tick?.out === "break" && <div className="mt-1 font-bold text-err">break: نخرج</div>}
          <div className="code mt-3 text-3xl font-bold text-num" dir="ltr">
            {form.name} = {tick ? tick.v : f === 1 ? 10 : f === 2 ? 0 : "?"}
          </div>
          <div className="code mt-3 min-h-6 text-sm text-ok" dir="ltr">{out.join("  ")}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={step} className="rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg">
          {k >= form.ticks.length - 1 ? "من جديد" : "خطوة"}
        </motion.button>
        {seen.size >= 2 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
            الأشكال الثلاثة كلمة واحدة: <b className="text-fg">for</b>. احذف أجزاءها فتصير while، واحذفها كلها فتصير حلقة لا تنتهي إلا بـ break.
          </motion.p>
        )}
      </div>
    </div>
  );
}
