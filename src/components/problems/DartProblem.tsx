"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** One line you already wrote, and its Dart version. Text inside [[...]] is what changed. */
type Pair = { js: string; dart: string; why: string };

const PAIRS: Pair[] = [
  { js: "[[let]] count = 3;", dart: "[[var]] count = 3;", why: "var يستنتج النوع int من القيمة، مثل TypeScript" },
  { js: "const name[[: string]] = \"Sara\";", dart: "[[final String]] name = \"Sara\";", why: "النوع قبل الاسم، و final بدل const" },
  { js: "let price[[: number]] = 7.5;", dart: "[[double]] price = 7.5;", why: "number صار نوعين: int للصحيح و double للكسور" },
  { js: "const items[[: string[] ]]= [\"tea\"];", dart: "final [[List<String>]] items = [\"tea\"];", why: "القائمة تحمل نوع عناصرها بين < >" },
  { js: "const ages[[: Record<string, number>]] = { [[Sara]]: 20 };", dart: "final [[Map<String, int>]] ages = {[[\"Sara\"]]: 20};", why: "الكائن-القاموس صار Map، والمفاتيح نصوص بعلامات تنصيص" },
  { js: "let note[[: string | null = null]];", dart: "[[String?]] note;", why: "؟ بعد النوع تعني: قد يكون null، ويبدأ null" },
  { js: "const twice = (n[[: number]]) => n * 2;", dart: "[[int]] twice([[int]] n) => n * 2;", why: "السهم نفسه، ونوع ما ترجعه الدالة يُكتب أولاً" },
  { js: "[[console.log(`]]hi [[${name}`]]);", dart: "[[print(\"]]hi [[$name\"]]);", why: "print بدل console.log، و $ داخل علامتي تنصيص عاديتين" },
  { js: "const user = [[new ]]User(\"Sara\");", dart: "final user = User(\"Sara\");", why: "لا حاجة لـ new" },
  { js: "const data = await fetchUser();[[ // Promise]]", dart: "final data = await fetchUser();[[ // Future]]", why: "Promise اسمه Future، و async/await كما هي" },
];

/** Split "a [[b]] c" into segments, marking the bracketed parts as changed. */
function segments(line: string) {
  return line.split(/\[\[|\]\]/).map((text, i) => ({ text, changed: i % 2 === 1 }));
}

function Code({ line, tone }: { line: string; tone: "err" | "ok" }) {
  return (
    <span className="code" dir="ltr">
      {segments(line).map((s, i) =>
        s.changed ? (
          <span key={i} className={`rounded px-0.5 font-bold ${tone === "ok" ? "bg-accent/20 text-ok" : "bg-err/15 text-err line-through decoration-1"}`}>
            {s.text}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </span>
  );
}

/** The null-safety game: which lines does the Dart compiler reject before the program runs? */
const LINES: { code: string; bad: boolean; why: string }[] = [
  { code: 'String name = "Sara";', bad: false, why: "نص في درج نص" },
  { code: "String city = null;", bad: true, why: "String بلا ؟ لا يقبل null" },
  { code: "String? note = null;", bad: false, why: "؟ تسمح بـ null" },
  { code: "int len = note.length;", bad: true, why: "note قد تكون null، فلا تُقرأ length مباشرة" },
  { code: "int len = note?.length ?? 0;", bad: false, why: "?. و ?? يعالجان null" },
  { code: 'int age = "20";', bad: true, why: "نص في درج int" },
  { code: 'String title = note ?? "none";', bad: false, why: "?? يضمن نصاً دائماً" },
];

export default function DartProblem() {
  const [picked, setPicked] = useState(0);
  const [marks, setMarks] = useState<boolean[]>(LINES.map(() => false));
  const [checked, setChecked] = useState(false);
  const pair = PAIRS[picked];
  const score = LINES.filter((l, i) => l.bad === marks[i]).length;

  const toggle = (i: number) => {
    if (checked) return;
    setMarks(marks.map((m, k) => (k === i ? !m : m)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-bold">JavaScript / TypeScript: اضغط سطراً</div>
          <div className="flex flex-col gap-1 rounded-xl bg-code p-2 text-xs">
            {PAIRS.map((p, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPicked(i)}
                className={`rounded-lg px-2 py-1.5 text-left ${i === picked ? "bg-accent/15 ring-1 ring-accent" : "hover:bg-surface"}`}
                dir="ltr"
              >
                <span className="code">{segments(p.js).map((s) => s.text).join("")}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-sm font-bold">Dart</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={picked}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4"
            >
              <div className="text-xs text-muted">ما كتبته:</div>
              <div className="text-sm">
                <Code line={pair.js} tone="err" />
              </div>
              <div className="text-xs text-muted">في Dart:</div>
              <div className="text-base">
                <Code line={pair.dart} tone="ok" />
              </div>
              <p className="text-sm">{pair.why}</p>
            </motion.div>
          </AnimatePresence>
          <p className="mt-2 text-xs text-muted">الملوّن هو الفرق فقط. الباقي كتبته من قبل.</p>
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-bold">لعبة null: اضغط كل سطر سيرفضه مترجم Dart قبل التشغيل</div>
        <div className="flex flex-col gap-1">
          {LINES.map((l, i) => {
            const right = l.bad === marks[i];
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggle(i)}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${
                  marks[i] ? "border-err bg-err/10" : "border-line bg-surface"
                }`}
              >
                <span className="code" dir="ltr">
                  {marks[i] ? "✗ " : "  "}
                  {l.code}
                </span>
                {checked && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-xs ${right ? "text-ok" : "text-err"}`}>
                    {right ? "✓" : "✗"} {l.bad ? "مرفوض" : "مقبول"}: {l.why}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-3">
          {!checked ? (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setChecked(true)}
              className="rounded-2xl bg-accent px-6 py-3 font-bold text-accent-fg shadow-lg shadow-accent/20"
            >
              شغّل المترجم
            </motion.button>
          ) : (
            <>
              <span className={score === LINES.length ? "font-bold text-ok" : "font-bold"}>
                {score} من {LINES.length}
              </span>
              <button
                onClick={() => {
                  setMarks(LINES.map(() => false));
                  setChecked(false);
                }}
                className="text-sm text-muted hover:text-fg"
              >
                حاول من جديد
              </button>
            </>
          )}
        </div>
        {checked && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-muted">
            في JavaScript كانت هذه الأسطر كلها ستعمل، والخطأ يظهر لاحقاً عند المستخدم. Dart يرفضها وأنت تكتب.
          </motion.p>
        )}
      </div>
    </div>
  );
}
