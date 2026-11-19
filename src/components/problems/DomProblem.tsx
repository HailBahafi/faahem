"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useState } from "react";

type Dom = {
  h1Text: string;
  h1Big: boolean;
  h1Color: string | null;
  li: null | { text: string; attached: boolean };
  ad: boolean;
};

const FILE: Dom = { h1Text: "Hello", h1Big: false, h1Color: null, li: null, ad: true };

type Cmd = { code: string; node: string; ok: (d: Dom) => boolean; run: (d: Dom) => Dom };

const CMDS: Cmd[] = [
  { code: 'document.querySelector("h1").textContent = "Welcome"', node: "h1", ok: (d) => d.h1Text !== "Welcome", run: (d) => ({ ...d, h1Text: "Welcome" }) },
  { code: 'document.querySelector("h1").classList.add("big")', node: "h1", ok: (d) => !d.h1Big, run: (d) => ({ ...d, h1Big: true }) },
  { code: 'document.querySelector("h1").style.color = "teal"', node: "h1", ok: (d) => !d.h1Color, run: (d) => ({ ...d, h1Color: "teal" }) },
  { code: 'const li = document.createElement("li")', node: "li2", ok: (d) => !d.li, run: (d) => ({ ...d, li: { text: "", attached: false } }) },
  { code: 'li.textContent = "Milk"', node: "li2", ok: (d) => !!d.li && !d.li.text, run: (d) => ({ ...d, li: { ...d.li!, text: "Milk" } }) },
  { code: 'document.querySelector("ul").append(li)', node: "li2", ok: (d) => !!d.li && !d.li.attached, run: (d) => ({ ...d, li: { ...d.li!, attached: true } }) },
  { code: 'document.querySelector(".ad").remove()', node: "p", ok: (d) => d.ad, run: (d) => ({ ...d, ad: false }) },
];

/** One line of the tree view. */
function Node({ depth, id, flash, children }: { depth: number; id: string; flash: string | null; children: ReactNode }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0, backgroundColor: flash === id ? "var(--accent-soft)" : "rgba(0,0,0,0)" }}
      exit={{ opacity: 0, x: 10 }}
      className="rounded-md px-2 py-0.5"
      style={{ paddingLeft: 8 + depth * 18 }}
    >
      {children}
    </motion.div>
  );
}

const Tag = ({ t }: { t: string }) => <span className="text-accent">{t}</span>;
const Str = ({ s }: { s: string }) => <span className="text-str">&quot;{s}&quot;</span>;

/** A page and its DOM tree side by side: each command changes one node, and both views follow. */
export default function DomProblem() {
  const [d, setD] = useState<Dom>(FILE);
  const [flash, setFlash] = useState<string | null>(null);
  const [ran, setRan] = useState<string[]>([]);

  const exec = (c: Cmd) => {
    setD(c.run(d));
    setFlash(c.node);
    setRan((r) => [...r, c.code]);
  };
  const reload = () => {
    setD(FILE);
    setFlash(null);
    setRan([]);
  };
  const lit = (id: string) => (flash === id ? "ring-2 ring-accent" : "");

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {/* DOM tree */}
        <div className="code rounded-2xl bg-code p-3 text-sm text-code-fg" dir="ltr">
          <div className="mb-2 text-xs text-muted">DOM (tree in memory)</div>
          <AnimatePresence initial={false}>
            <Node key="body" id="body" depth={0} flash={flash}><Tag t="body" /></Node>
            <Node key="h1" id="h1" depth={1} flash={flash}>
              <Tag t="h1" />
              {d.h1Big && <span className="text-num">.big</span>}
              {d.h1Color && <span className="text-bool"> style=&quot;color: {d.h1Color}&quot;</span>} <Str s={d.h1Text} />
            </Node>
            <Node key="ul" id="ul" depth={1} flash={flash}><Tag t="ul" /></Node>
            <Node key="li1" id="li1" depth={2} flash={flash}><Tag t="li" /> <Str s="Bread" /></Node>
            {d.li?.attached && (
              <Node key="li2" id="li2" depth={2} flash={flash}><Tag t="li" /> <Str s={d.li.text} /></Node>
            )}
            {d.ad && (
              <Node key="p" id="p" depth={1} flash={flash}><Tag t="p" /><span className="text-num">.ad</span> <Str s="Sale!" /></Node>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {d.li && !d.li.attached && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-3 rounded-lg border border-dashed border-line px-2 py-1 ${lit("li2")}`}
              >
                <span className="text-xs text-muted">outside the tree: </span>
                <Tag t="li" /> <Str s={d.li.text} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The page on screen */}
        <div className="rounded-2xl border border-line bg-surface p-4" dir="ltr">
          <div className="mb-2 text-xs text-muted">الصفحة على الشاشة</div>
          <motion.h1
            layout
            className={`rounded font-bold transition-all ${d.h1Big ? "text-4xl" : "text-2xl"} ${lit("h1")}`}
            style={{ color: d.h1Color ?? undefined }}
          >
            {d.h1Text}
          </motion.h1>
          <ul className="mt-2 list-disc ps-6">
            <li>Bread</li>
            <AnimatePresence>
              {d.li?.attached && (
                <motion.li key="milk" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`rounded ${lit("li2")}`}>
                  {d.li.text}
                </motion.li>
              )}
            </AnimatePresence>
          </ul>
          <AnimatePresence>
            {d.ad && (
              <motion.p key="ad" exit={{ opacity: 0, scale: 0.9 }} className="mt-2 inline-block rounded bg-err/15 px-2 py-1 text-err">
                Sale!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5" dir="ltr">
        {CMDS.map((c) => {
          const can = c.ok(d);
          return (
            <motion.button
              key={c.code}
              whileTap={can ? { scale: 0.97 } : undefined}
              disabled={!can}
              onClick={() => exec(c)}
              className={`code rounded-xl border px-3 py-2 text-start text-xs md:text-sm ${can ? "border-line bg-surface hover:border-accent" : "border-line/50 text-muted opacity-50"}`}
            >
              <span className="text-muted">{"> "}</span>
              {c.code}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button onClick={reload} className="rounded-2xl border border-line px-4 py-2 text-sm font-bold">
          أعد تحميل الصفحة
        </button>
        <span className="text-sm text-muted">
          {ran.length === 0
            ? "ملف HTML يقول Hello و Bread و Sale!. اضغط أمراً."
            : d.li && !d.li.attached
              ? "العقدة الجديدة موجودة في الذاكرة، لكنها ليست في الشجرة، فلا تظهر في الصفحة."
              : "الملف لم يتغيّر؛ تغيّرت الشجرة، والصفحة ترسم الشجرة. أعد التحميل لتعود إلى الملف."}
        </span>
      </div>
    </div>
  );
}
