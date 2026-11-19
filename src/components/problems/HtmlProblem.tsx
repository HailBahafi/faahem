"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Mode = "divs" | "semantic";
type Node = { tag: string; attr?: string; text?: string; kids?: Node[] };

const TREES: Record<Mode, Node> = {
  divs: {
    tag: "div",
    kids: [
      { tag: "div", attr: 'class="top"', kids: [{ tag: "div", attr: 'class="title"', text: "متجر فاهم" }] },
      { tag: "div", attr: 'class="menu"', kids: [{ tag: "div", text: "الرئيسية" }, { tag: "div", text: "السلة" }] },
      {
        tag: "div",
        attr: 'class="content"',
        kids: [
          { tag: "div", attr: 'class="pic"' },
          { tag: "div", attr: 'class="name"', text: "قلم أزرق" },
          { tag: "div", attr: 'class="btn"', text: "اشترِ" },
        ],
      },
    ],
  },
  semantic: {
    tag: "body",
    kids: [
      { tag: "header", kids: [{ tag: "h1", text: "متجر فاهم" }] },
      {
        tag: "nav",
        kids: [{ tag: "ul", kids: [{ tag: "li", kids: [{ tag: "a", attr: 'href="/"', text: "الرئيسية" }] }, { tag: "li", kids: [{ tag: "a", attr: 'href="/cart"', text: "السلة" }] }] }],
      },
      {
        tag: "main",
        kids: [
          {
            tag: "article",
            kids: [
              { tag: "img", attr: 'alt="قلم أزرق"' },
              { tag: "h2", text: "قلم أزرق" },
              { tag: "button", text: "اشترِ" },
            ],
          },
        ],
      },
    ],
  },
};

/** What a screen reader announces, line by line. `null` marks something it skips in silence. */
const READER: Record<Mode, (string | null)[]> = {
  divs: ["متجر فاهم", "الرئيسية", "السلة", null, "قلم أزرق", "اشترِ"],
  semantic: ["ترويسة. عنوان 1: متجر فاهم", "تنقّل. قائمة من عنصرين. رابط: الرئيسية", "رابط: السلة", "المحتوى الرئيسي. صورة: قلم أزرق", "عنوان 2: قلم أزرق", "زر: اشترِ"],
};
const TABS: Record<Mode, number> = { divs: 0, semantic: 3 };

function Tree({ node, depth = 0 }: { node: Node; depth?: number }) {
  const meaningful = node.tag !== "div";
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.06 }}
        style={{ paddingInlineStart: depth * 14 }}
        className="whitespace-nowrap"
      >
        <span className={meaningful ? "text-accent font-bold" : "text-muted"}>&lt;{node.tag}</span>
        {node.attr && <span className="text-num"> {node.attr}</span>}
        <span className={meaningful ? "text-accent font-bold" : "text-muted"}>&gt;</span>
        {node.text && <span className="text-str"> {node.text}</span>}
      </motion.div>
      {node.kids?.map((k, i) => <Tree key={i} node={k} depth={depth + 1} />)}
    </>
  );
}

/** Two pages that look identical; only the semantic one tells a screen reader what each part is. */
export default function HtmlProblem() {
  const [mode, setMode] = useState<Mode>("divs");
  const [heard, setHeard] = useState(-1);
  const [seen, setSeen] = useState<Record<Mode, boolean>>({ divs: false, semantic: false });
  const lines = READER[mode];
  const playing = heard >= 0 && heard < lines.length - 1;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setHeard((h) => h + 1), 900);
    return () => clearTimeout(t);
  }, [playing, heard]);

  useEffect(() => {
    if (heard === lines.length - 1) setSeen((s) => ({ ...s, [mode]: true }));
  }, [heard, lines.length, mode]);

  const pick = (m: Mode) => {
    setMode(m);
    setHeard(-1);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["divs", "semantic"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => pick(m)}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${mode === m ? "bg-accent text-accent-fg" : "border border-line"}`}
          >
            {m === "divs" ? "مبنية من div فقط" : "مبنية بوسوم لها معنى"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* What the eye sees: identical in both modes. */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-2 text-xs text-muted">ما تراه العين</div>
          <div className="rounded-lg bg-surface-2 p-3">
            <div className="text-lg font-bold">متجر فاهم</div>
            <div className="mt-1 flex gap-3 text-sm text-accent underline">
              <span>الرئيسية</span>
              <span>السلة</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-accent/20 text-2xl">🖊️</div>
              <div>
                <div className="font-bold">قلم أزرق</div>
                <div className="mt-1 inline-block rounded-lg bg-accent px-3 py-1 text-sm text-accent-fg">اشترِ</div>
              </div>
            </div>
          </div>
        </div>

        {/* The tree the browser builds. */}
        <div className="code overflow-x-auto rounded-2xl bg-code p-4 text-xs leading-6" dir="ltr">
          <div className="mb-2 text-muted" dir="rtl">الشجرة التي يبنيها المتصفح</div>
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Tree node={TREES[mode]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* What a screen reader announces. */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs text-muted">ما يسمعه الكفيف</span>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setHeard(0)}
              disabled={playing}
              className="rounded-xl bg-accent px-3 py-1.5 text-sm font-bold text-accent-fg disabled:opacity-50"
            >
              🔊 شغّل القارئ
            </motion.button>
          </div>
          <div className="flex min-h-40 flex-col gap-1.5 text-sm">
            {lines.slice(0, heard + 1).map((l, i) => (
              <motion.div
                key={`${mode}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={l === null ? "text-err" : mode === "semantic" ? "text-ok" : "text-fg"}
              >
                {l ?? "(صورة بلا وصف: صمت)"}
              </motion.div>
            ))}
          </div>
          {heard === lines.length - 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 border-t border-line pt-2 text-sm">
              <span className="text-muted">محطات زر Tab: </span>
              <b className={TABS[mode] ? "text-ok" : "text-err"}>{TABS[mode]}</b>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-3 min-h-12">
        {heard < 0 && <p className="text-muted">اضغط «شغّل القارئ»، ثم بدّل الصفحة وشغّله مرة أخرى.</p>}
        {heard === lines.length - 1 && mode === "divs" && !seen.semantic && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            كلمات متتابعة بلا معنى: لا عنوان، لا رابط، لا زر، والصورة صامتة. جرّب الصفحة الأخرى.
          </motion.p>
        )}
        {heard === lines.length - 1 && mode === "semantic" && !seen.divs && (
          <p className="text-muted">كل جزء أعلن ما هو. الآن شغّل القارئ على صفحة div وقارن.</p>
        )}
        {seen.divs && seen.semantic && heard === lines.length - 1 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            الشكل واحد، والمعنى مختلف تماماً. اسم الوسم يقول للمتصفح والقارئ ومحرك البحث ما هو كل جزء. هذا هو <b className="text-fg">HTML</b>.
          </motion.p>
        )}
      </div>
    </div>
  );
}
