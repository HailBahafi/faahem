"use client";

import { motion } from "motion/react";
import { useState, type ReactNode } from "react";

type Kind = "Column" | "Row" | "Padding" | "Center" | "Expanded" | "Text" | "ElevatedButton" | "Icon";
type Node = { id: number; kind: Kind; text?: string; children: Node[] };

/** How many children each widget takes: a list, exactly one (child), or none (a leaf). */
const SLOTS: Record<Kind, "many" | "one" | "none"> = {
  Column: "many",
  Row: "many",
  Padding: "one",
  Center: "one",
  Expanded: "one",
  Text: "none",
  ElevatedButton: "none",
  Icon: "none",
};
const ADDABLE: Kind[] = ["Column", "Row", "Padding", "Center", "Expanded", "Text", "ElevatedButton", "Icon"];
const WORDS = ["Tea", "Coffee", "15 SAR", "Menu", "Dates"];

let seq = 100;
const make = (kind: Kind, text?: string, children: Node[] = []): Node => ({ id: seq++, kind, text, children });

const START: Node = {
  id: 0,
  kind: "Column",
  children: [
    { id: 1, kind: "Text", text: "My Shop", children: [] },
    { id: 2, kind: "Text", text: "Tea", children: [] },
    { id: 3, kind: "ElevatedButton", text: "Add", children: [] },
  ],
};

function find(n: Node, id: number): Node | null {
  if (n.id === id) return n;
  for (const c of n.children) {
    const f = find(c, id);
    if (f) return f;
  }
  return null;
}
const update = (n: Node, id: number, f: (n: Node) => Node): Node =>
  n.id === id ? f(n) : { ...n, children: n.children.map((c) => update(c, id, f)) };
const remove = (n: Node, id: number): Node => ({ ...n, children: n.children.filter((c) => c.id !== id).map((c) => remove(c, id)) });
const count = (n: Node): number => 1 + n.children.reduce((s, c) => s + count(c), 0);

/** The Dart that would build this tree. */
function toDart(n: Node, pad = ""): string {
  const inner = pad + "  ";
  if (n.kind === "Text") return `${pad}Text("${n.text}")`;
  if (n.kind === "Icon") return `${pad}Icon(Icons.star)`;
  if (n.kind === "ElevatedButton") return `${pad}ElevatedButton(onPressed: () {}, child: Text("${n.text}"))`;
  if (SLOTS[n.kind] === "one") {
    const arg = n.kind === "Padding" ? `padding: EdgeInsets.all(16), ` : "";
    if (!n.children.length) return `${pad}${n.kind}(${arg})`;
    return `${pad}${n.kind}(${arg}\n${inner}child: ${toDart(n.children[0], inner).trimStart()},\n${pad})`;
  }
  if (!n.children.length) return `${pad}${n.kind}(children: [])`;
  return `${pad}${n.kind}(children: [\n${n.children.map((c) => toDart(c, inner) + ",").join("\n")}\n${pad}])`;
}

/** The phone: each widget becomes a flex box, the way Flutter lays out the tree. */
function Paint({ n, selected, inRow }: { n: Node; selected: number; inRow: boolean }) {
  const ring = n.id === selected ? "outline outline-2 outline-dashed outline-accent outline-offset-1" : "";
  const kids = n.children.map((c) => <Paint key={c.id} n={c} selected={selected} inRow={n.kind === "Row" || (inRow && SLOTS[n.kind] === "one")} />);
  const box = (cls: string, body: ReactNode) => (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${cls} ${ring} rounded`}>
      {body}
    </motion.div>
  );
  switch (n.kind) {
    case "Text":
      return box("px-0.5 text-sm text-neutral-900", n.text);
    case "Icon":
      return box("text-lg leading-none text-sky-600", "★");
    case "ElevatedButton":
      return box("rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 shadow", n.text);
    case "Column":
      return box("flex min-h-6 flex-col items-start gap-1", kids);
    case "Row":
      return box("flex min-h-6 w-full flex-row items-center gap-2", kids);
    case "Padding":
      return box("bg-sky-100/60 p-4", kids);
    case "Center":
      return box("flex w-full flex-1 items-center justify-center self-stretch", kids);
    case "Expanded":
      return box(inRow ? "flex-1 bg-amber-100/60" : "w-full flex-1 bg-amber-100/60", kids);
  }
}

export default function WidgetsProblem() {
  const [tree, setTree] = useState<Node>(START);
  const [selected, setSelected] = useState(0);
  const [msg, setMsg] = useState("");
  const sel = find(tree, selected) ?? tree;
  const slot = SLOTS[sel.kind];
  const full = slot === "none" || (slot === "one" && sel.children.length >= 1);

  const add = (kind: Kind) => {
    if (slot === "none") return setMsg(`${sel.kind} ورقة في الشجرة: لا أبناء لها.`);
    if (full) return setMsg(`${sel.kind} يأخذ ابناً واحداً فقط (child). لفّ أكثر من ابن في Column أو Row.`);
    if (count(tree) >= 18) return setMsg("الشجرة كبيرة بما يكفي. احذف شيئاً أولاً.");
    const leafText = kind === "ElevatedButton" ? "Buy" : WORDS[seq % WORDS.length];
    const node = make(kind, SLOTS[kind] === "none" && kind !== "Icon" ? leafText : undefined);
    setTree(update(tree, sel.id, (n) => ({ ...n, children: [...n.children, node] })));
    setSelected(node.id);
    setMsg("");
  };

  const del = () => {
    if (sel.id === tree.id) return setMsg("الجذر يبقى. احذف أبناءه بدلاً منه.");
    setTree(remove(tree, sel.id));
    setSelected(tree.id);
    setMsg("");
  };

  const wrap = (kind: Kind) => {
    if (sel.id === tree.id) return setMsg("الجذر لا يُلفّ هنا. اختر عقدة تحته.");
    const wrapper = make(kind, undefined, [sel]);
    setTree(update(tree, sel.id, () => wrapper));
    setSelected(wrapper.id);
    setMsg("");
  };

  const rows: { n: Node; depth: number }[] = [];
  const walk = (n: Node, depth: number) => {
    rows.push({ n, depth });
    n.children.forEach((c) => walk(c, depth + 1));
  };
  walk(tree, 0);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold">شجرة الـ widgets: اختر عقدة</div>
          <div className="rounded-xl bg-code p-2 text-xs" dir="ltr">
            {rows.map(({ n, depth }) => (
              <motion.button
                key={n.id}
                layout
                onClick={() => setSelected(n.id)}
                className={`code flex w-full items-center gap-1 rounded px-2 py-1 text-left ${n.id === selected ? "bg-accent/20 ring-1 ring-accent" : "hover:bg-surface"}`}
                style={{ paddingLeft: 8 + depth * 18 }}
              >
                <span className="text-muted">{depth ? "└ " : ""}</span>
                <span className={SLOTS[n.kind] === "none" ? "text-str" : "text-num"}>{n.kind}</span>
                {n.text && <span className="text-muted">&quot;{n.text}&quot;</span>}
              </motion.button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1 text-xs" dir="ltr">
            <span className="text-muted">add child:</span>
            {ADDABLE.map((k) => (
              <motion.button
                key={k}
                whileTap={{ scale: 0.9 }}
                onClick={() => add(k)}
                disabled={full}
                className="code rounded-lg border border-line px-2 py-1 hover:border-accent disabled:opacity-30"
              >
                + {k}
              </motion.button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1 text-xs" dir="ltr">
            <span className="text-muted">wrap in:</span>
            {(["Padding", "Center", "Expanded", "Row", "Column"] as Kind[]).map((k) => (
              <motion.button key={k} whileTap={{ scale: 0.9 }} onClick={() => wrap(k)} className="code rounded-lg border border-line px-2 py-1 hover:border-accent">
                {k}(…)
              </motion.button>
            ))}
            <motion.button whileTap={{ scale: 0.9 }} onClick={del} className="code rounded-lg border border-line px-2 py-1 text-err hover:border-err">
              delete
            </motion.button>
            <button
              onClick={() => {
                setTree(START);
                setSelected(0);
                setMsg("");
              }}
              className="px-2 py-1 text-muted hover:text-fg"
            >
              reset
            </button>
          </div>
          <div className="min-h-5 text-sm text-err">{msg}</div>

          <details className="text-xs">
            <summary className="cursor-pointer text-muted">كود Dart لهذه الشجرة ({count(tree)} widgets)</summary>
            <pre className="code mt-1 overflow-x-auto rounded-xl bg-code p-3 leading-5" dir="ltr">
              {toDart(tree)}
            </pre>
          </details>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="text-sm font-bold">الهاتف</div>
          <div className="w-[220px] rounded-[2rem] border-4 border-neutral-800 bg-neutral-800 p-1.5 shadow-xl">
            <div className="flex h-[400px] flex-col overflow-hidden rounded-[1.5rem] bg-white" dir="ltr">
              <div className="bg-violet-600 px-3 py-2 text-sm font-medium text-white">My App</div>
              <div className="flex flex-1 flex-col overflow-auto p-2">
                <Paint n={tree} selected={selected} inRow={false} />
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-muted">كل تغيير في الشجرة = الشاشة تُرسم من جديد منها</p>
        </div>
      </div>
    </div>
  );
}
