"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

type Branch = "filter" | "sum" | "count" | "divide" | "root";
type Node = { text: string; branch: Branch; children?: string[]; code?: string };

/** "Average of the passing grades", split until every card is one line a computer can run. */
const TREE: Record<string, Node> = {
  root: { text: "احسب متوسط الدرجات الناجحة", branch: "root", children: ["filter", "sum", "count", "divide"] },
  filter: { text: "اختر الدرجات الناجحة", branch: "filter", children: ["loop", "check"] },
  loop: { text: "مرّ على كل درجة", branch: "filter", code: "for (let g of grades)" },
  check: { text: "أبقِ ما كان 60 أو أكثر", branch: "filter", code: "if (g >= 60)" },
  sum: { text: "اجمعها", branch: "sum", children: ["sum0", "sumAdd"] },
  sum0: { text: "ابدأ المجموع من صفر", branch: "sum", code: "let total = 0;" },
  sumAdd: { text: "أضف كل درجة ناجحة", branch: "sum", code: "total = total + g;" },
  count: { text: "عُدّها", branch: "count", children: ["count0", "countAdd"] },
  count0: { text: "ابدأ العدّاد من صفر", branch: "count", code: "let count = 0;" },
  countAdd: { text: "زِد العدّاد لكل ناجحة", branch: "count", code: "count = count + 1;" },
  divide: { text: "اقسم المجموع على العدد", branch: "divide", code: "let avg = total / count;" },
};

const COLOR: Record<Branch, string> = {
  root: "text-fg",
  filter: "text-bool",
  sum: "text-num",
  count: "text-str",
  divide: "text-ok",
};

/** The finished program; each line names the card it came from. */
const PROGRAM: { id: string; indent: number; close?: boolean }[] = [
  { id: "sum0", indent: 0 },
  { id: "count0", indent: 0 },
  { id: "loop", indent: 0 },
  { id: "check", indent: 1 },
  { id: "sumAdd", indent: 2 },
  { id: "countAdd", indent: 2 },
  { id: "check", indent: 1, close: true },
  { id: "loop", indent: 0, close: true },
  { id: "divide", indent: 0 },
];

export default function DecomposeProblem() {
  const [cards, setCards] = useState<string[]>(["root"]);
  const [shake, setShake] = useState<string | null>(null);
  const zone = useRef<HTMLDivElement>(null);

  const big = (id: string) => !!TREE[id].children;
  const done = cards.every((id) => !big(id));
  const splits = cards.length;

  const split = (id: string) => {
    const node = TREE[id];
    if (!node.children) {
      setShake(id);
      setTimeout(() => setShake(null), 900);
      return;
    }
    setCards((c) => c.flatMap((x) => (x === id ? node.children! : [x])));
  };

  const onDrop = (id: string, point: { x: number; y: number }) => {
    const r = zone.current?.getBoundingClientRect();
    if (!r) return;
    const x = point.x - window.scrollX;
    const y = point.y - window.scrollY;
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) split(id);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm" dir="rtl">
        <span className="rounded-lg border border-line px-2 py-1">
          الدخل: <span className="code text-num" dir="ltr">[72, 45, 90, 58, 81]</span>
        </span>
        <span className="text-muted">←</span>
        <span className="rounded-lg border border-line px-2 py-1">خطوات؟</span>
        <span className="text-muted">←</span>
        <span className="rounded-lg border border-line px-2 py-1">
          الخرج: <span className="code text-num">{done ? "81" : "?"}</span>
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="flex min-h-48 flex-wrap content-start gap-3 rounded-2xl border border-line bg-surface p-4">
          <AnimatePresence mode="popLayout">
            {cards.map((id) => {
              const node = TREE[id];
              const isBig = big(id);
              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={shake === id ? { x: [0, -8, 8, -6, 6, 0], opacity: 1, scale: 1 } : { opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  drag={!done}
                  dragSnapToOrigin
                  onDragEnd={(_, info) => onDrop(id, info.point)}
                  onDoubleClick={() => split(id)}
                  whileDrag={{ scale: 1.08, zIndex: 10 }}
                  className={`cursor-grab touch-none select-none rounded-xl border-2 px-3 py-2 ${
                    isBig ? (id === "root" ? "border-accent px-6 py-5 text-lg" : "border-err") : "border-ok"
                  }`}
                >
                  <div className={`font-bold ${COLOR[node.branch]}`}>{node.text}</div>
                  {isBig ? (
                    <div className="mt-1 text-xs text-err">كبيرة على سطر واحد</div>
                  ) : (
                    <div className="code mt-1 rounded bg-code px-2 py-0.5 text-xs" dir="ltr">
                      {node.code}
                    </div>
                  )}
                  <AnimatePresence>
                    {shake === id && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1 text-xs text-ok">
                        سطر واحد بالفعل
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div
          ref={zone}
          className={`flex min-h-24 min-w-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center ${
            done ? "border-ok" : "border-accent"
          }`}
        >
          <div className="text-3xl">✂</div>
          <div className="mt-1 text-sm text-muted">{done ? "كل بطاقة سطر واحد" : "اسحب بطاقة إلى هنا لتقسيمها"}</div>
          <div className="mt-2 text-xs text-muted">
            بطاقات: <b className="code text-num">{splits}</b>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <div className="code rounded-2xl bg-code p-5 text-sm leading-7" dir="ltr">
              {PROGRAM.map((l, k) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: k * 0.12 }}
                  className={COLOR[TREE[l.id].branch]}
                  style={{ paddingLeft: `${l.indent * 1.5}rem` }}
                >
                  {l.close ? "}" : TREE[l.id].code + (TREE[l.id].code!.endsWith(")") ? " {" : "")}
                </motion.div>
              ))}
            </div>
            <p className="mt-3 text-ok">
              مهمة لا تعرف كيف تبدأها صارت سبع بطاقات، كل واحدة سطر. اكتب الخطوات بالكلمات أولاً، ثم حوّل كل بطاقة إلى سطرها.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 flex min-h-8 items-center gap-3">
        {!done && cards.length === 1 && <p className="text-muted">هذه المهمة أكبر من سطر واحد. اسحبها إلى المقص (أو انقرها مرتين).</p>}
        {!done && cards.length > 1 && <p className="text-muted">الحمراء ما زالت كبيرة. قسّمها حتى تصير كل البطاقات خضراء.</p>}
        {cards.length > 1 && (
          <button onClick={() => setCards(["root"])} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>
    </div>
  );
}
