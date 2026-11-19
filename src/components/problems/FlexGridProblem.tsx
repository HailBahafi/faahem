"use client";

import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";

type Display = "block" | "flex" | "grid";
type Justify = "flex-start" | "center" | "flex-end" | "space-between";
type Align = "stretch" | "flex-start" | "center" | "flex-end";
type Layout = { display: Display; justify: Justify; align: Align; gap: number; grow: boolean; cols: number; span: boolean };

const START: Layout = { display: "block", justify: "flex-start", align: "stretch", gap: 0, grow: false, cols: 3, span: false };

const TARGETS: { title: string; want: Partial<Layout> }[] = [
  { title: "صف في المنتصف بفراغات", want: { display: "flex", justify: "center", gap: 16 } },
  { title: "على الطرفين، وفي منتصف الارتفاع", want: { display: "flex", justify: "space-between", align: "center" } },
  { title: "الصندوق 2 يأخذ كل الباقي", want: { display: "flex", grow: true } },
  { title: "شبكة: 3 أعمدة، والأول يأخذ خليتين", want: { display: "grid", cols: 3, span: true } },
];

const BOXES = [
  { n: 1, h: 40, color: "bg-accent text-accent-fg" },
  { n: 2, h: 64, color: "bg-num text-bg" },
  { n: 3, h: 52, color: "bg-str text-bg" },
  { n: 4, h: 44, color: "bg-bool text-bg" },
];

const matches = (l: Layout, want: Partial<Layout>) =>
  (Object.keys(want) as (keyof Layout)[]).every((k) => l[k] === want[k]);

/** The real CSS this layout applies to the parent and its children. */
function styles(l: Layout) {
  const parent: CSSProperties = { display: l.display, gap: l.display === "block" ? undefined : l.gap };
  if (l.display === "flex") Object.assign(parent, { justifyContent: l.justify, alignItems: l.align });
  if (l.display === "grid") parent.gridTemplateColumns = `repeat(${l.cols}, 1fr)`;
  const child = (n: number): CSSProperties => ({
    flexGrow: l.display === "flex" && l.grow && n === 2 ? 1 : undefined,
    gridColumn: l.display === "grid" && l.span && n === 1 ? "span 2" : undefined,
    marginBottom: l.display === "block" ? 6 : undefined,
  });
  return { parent, child };
}

function cssText(l: Layout) {
  const lines = [".row {", `  display: ${l.display};`];
  if (l.display !== "block") lines.push(`  gap: ${l.gap}px;`);
  if (l.display === "flex") lines.push(`  justify-content: ${l.justify};`, `  align-items: ${l.align};`);
  if (l.display === "grid") lines.push(`  grid-template-columns: repeat(${l.cols}, 1fr);`);
  lines.push("}");
  if (l.display === "flex" && l.grow) lines.push(".b2 { flex-grow: 1; }");
  if (l.display === "grid" && l.span) lines.push(".b1 { grid-column: span 2; }");
  return lines.join("\n");
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="code w-36 shrink-0 text-xs text-muted" dir="ltr">{label}</span>
      {children}
    </div>
  );
}

function Stage({ l, small }: { l: Layout; small?: boolean }) {
  const { parent, child } = styles(l);
  return (
    <div dir="rtl" className={`rounded-xl border border-dashed border-line bg-surface ${small ? "p-1.5" : "p-2"}`} style={{ ...parent, minHeight: small ? 60 : 112 }}>
      {BOXES.map((b) => (
        <motion.div
          key={b.n}
          layout
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className={`code flex items-center justify-center rounded-lg font-bold ${b.color} ${small ? "text-[10px]" : "text-sm"}`}
          style={{ ...child(b.n), height: small ? b.h / 2.4 : b.h, minWidth: small ? 18 : 44, padding: small ? "0 4px" : "0 10px" }}
        >
          {b.n}
        </motion.div>
      ))}
    </div>
  );
}

/** Press properties on the parent and watch the children rearrange until they match a target picture. */
export default function FlexGridProblem() {
  const [l, setL] = useState<Layout>(START);
  const [t, setT] = useState(0);
  const target = TARGETS[t];
  const solved = target ? matches(l, target.want) : false;
  const set = (p: Partial<Layout>) => setL((x) => ({ ...x, ...p }));

  const btn = (on: boolean) =>
    `code rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${on ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface hover:border-accent"}`;
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div>
          <Stage l={l} />
          <pre className="code mt-3 rounded-xl bg-code p-3 text-xs text-code-fg" dir="ltr">{cssText(l)}</pre>
        </div>
        {target && (
          <div className={`w-full rounded-xl border p-3 md:w-56 ${solved ? "border-ok bg-ok/10" : "border-line"}`}>
            <div className="mb-1 text-xs text-muted">الهدف {t + 1} من {TARGETS.length}</div>
            <div className="mb-2 text-sm font-bold">{target.title}</div>
            <Stage l={{ ...START, ...target.want }} small />
            {solved && (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setT(t + 1)}
                className="mt-3 w-full rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-fg"
              >
                {t + 1 < TARGETS.length ? "الهدف التالي" : "انتهيت"}
              </motion.button>
            )}
          </div>
        )}
        {!target && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok md:w-56">
            لم تلمس صندوقاً واحداً. كل شيء كان خصائص على <b className="text-fg">الأب</b>: flex لخط واحد، و grid لشبكة.
          </motion.p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <Row label="display">
          {(["block", "flex", "grid"] as Display[]).map((v) => (
            <button key={v} className={btn(l.display === v)} onClick={() => set({ display: v })}>{v}</button>
          ))}
        </Row>
        {l.display !== "block" && (
          <Row label="gap">
            {[0, 8, 16].map((v) => (
              <button key={v} className={btn(l.gap === v)} onClick={() => set({ gap: v })}>{v}px</button>
            ))}
          </Row>
        )}
        {l.display === "flex" && (
          <>
            <Row label="justify-content">
              {(["flex-start", "center", "flex-end", "space-between"] as Justify[]).map((v) => (
                <button key={v} className={btn(l.justify === v)} onClick={() => set({ justify: v })}>{v}</button>
              ))}
            </Row>
            <Row label="align-items">
              {(["stretch", "flex-start", "center", "flex-end"] as Align[]).map((v) => (
                <button key={v} className={btn(l.align === v)} onClick={() => set({ align: v })}>{v}</button>
              ))}
            </Row>
            <Row label=".b2 flex-grow">
              <button className={btn(l.grow)} onClick={() => set({ grow: !l.grow })}>{l.grow ? "1" : "0"}</button>
            </Row>
          </>
        )}
        {l.display === "grid" && (
          <>
            <Row label="columns">
              {[1, 2, 3].map((v) => (
                <button key={v} className={btn(l.cols === v)} onClick={() => set({ cols: v })}>repeat({v}, 1fr)</button>
              ))}
            </Row>
            <Row label=".b1 grid-column">
              <button className={btn(l.span)} onClick={() => set({ span: !l.span })}>{l.span ? "span 2" : "auto"}</button>
            </Row>
          </>
        )}
        <button onClick={() => setL(START)} className="text-sm text-muted hover:text-fg">ابدأ من جديد</button>
      </div>
    </div>
  );
}
