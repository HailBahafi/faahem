"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Key = "title" | "color";
type Files = Record<Key, string>;
interface Commit { id: string; msg: string; parents: string[]; files: Files; lane: number; n: number }
interface Repo {
  commits: Commit[];
  branches: Record<string, string>;
  head: string;
  work: Files;
  index: Files;
  origin: Record<string, string>;
  merging: null | { from: string; conflicts: Key[]; theirs: Files; ours: Files };
  note: string;
  ok: boolean;
}

const KEYS: Key[] = ["title", "color"];
const VALUES: Record<Key, string[]> = { title: ["Hello", "Welcome", "Hi Sara", "Salam"], color: ["blue", "green", "dark", "gold"] };
const IDS = ["a1f", "b7c", "d4e", "e92", "f3a", "c58", "9be", "7d1", "4ac", "2f6", "8e3", "6b0"];
const CONFLICT = "<<<";
const same = (a: Files, b: Files) => KEYS.every((k) => a[k] === b[k]);

function fresh(): Repo {
  const files = { title: "Hello", color: "blue" };
  return {
    commits: [{ id: IDS[0], msg: "start", parents: [], files, lane: 0, n: 0 }],
    branches: { main: IDS[0] },
    head: "main",
    work: { ...files },
    index: { ...files },
    origin: {},
    merging: null,
    note: "هذه أول صورة a1f، واللافتة main عليها. عدّل سطراً في app.js.",
    ok: true,
  };
}

const byId = (r: Repo, id: string) => r.commits.find((c) => c.id === id)!;
const headCommit = (r: Repo) => byId(r, r.branches[r.head]);

/** Every commit reachable from `id` by following parent arrows. */
function ancestors(r: Repo, id: string) {
  const seen = new Set<string>();
  const todo = [id];
  while (todo.length) {
    const c = todo.pop()!;
    if (seen.has(c)) continue;
    seen.add(c);
    todo.push(...byId(r, c).parents);
  }
  return seen;
}

function mergeBase(r: Repo, a: string, b: string) {
  const mine = ancestors(r, a);
  const queue = [b];
  while (queue.length) {
    const c = queue.shift()!;
    if (mine.has(c)) return c;
    queue.push(...byId(r, c).parents);
  }
  return a;
}

function newCommit(r: Repo, msg: string, parents: string[], files: Files): Commit {
  const n = r.commits.length;
  return { id: IDS[n] ?? n.toString(16).padStart(3, "0"), msg, parents, files: { ...files }, lane: r.head === "main" ? 0 : 1, n };
}

const say = (r: Repo, note: string, ok = true): Repo => ({ ...r, note, ok });

function edit(r: Repo, k: Key): Repo {
  if (r.merging?.conflicts.includes(k)) return say(r, "هذا السطر في تعارض: اختر نسخته من الزرّين في الأسفل.", false);
  const list = VALUES[k];
  const next = list[(list.indexOf(r.work[k]) + 1) % list.length];
  return say({ ...r, work: { ...r.work, [k]: next } }, `غيّرت السطر في المجلد فقط. التاريخ لم يعرف بعد. اختر ما يدخل الصورة: git add.`);
}

function add(r: Repo): Repo {
  if (KEYS.some((k) => r.work[k] === CONFLICT)) return say(r, "ما زال في الملف تعارض لم تختر له نسخة.", false);
  if (same(r.work, r.index)) return say(r, "منطقة التجهيز تطابق المجلد أصلاً: لا جديد لتضيفه.", false);
  return say({ ...r, index: { ...r.work } }, "app.js الآن في منطقة التجهيز: هذا ما ستلتقطه الصورة القادمة.");
}

function commit(r: Repo): Repo {
  const h = headCommit(r);
  if (r.merging) {
    if (KEYS.some((k) => r.index[k] === CONFLICT) || !same(r.work, r.index)) return say(r, "اختر نسخة كل سطر متعارض، ثم git add، ثم commit.", false);
    const c = newCommit(r, `merge ${r.merging.from}`, [h.id, r.branches[r.merging.from]], r.index);
    return say({ ...r, commits: [...r.commits, c], branches: { ...r.branches, [r.head]: c.id }, merging: null }, `صورة دمج ${c.id} لها سهمان: إلى ${h.id} وإلى ${r.branches["feature"]}. التاريخ اجتمع.`);
  }
  if (same(r.index, h.files)) return say(r, "منطقة التجهيز فارغة: لا شيء جديد تلتقطه. عدّل ثم git add.", false);
  const changed = KEYS.filter((k) => r.index[k] !== h.files[k]).map((k) => `${k}: ${r.index[k]}`).join(", ");
  const c = newCommit(r, changed, [h.id], r.index);
  return say(
    { ...r, commits: [...r.commits, c], branches: { ...r.branches, [r.head]: c.id } },
    `صورة كاملة جديدة ${c.id}، سهمها إلى ${h.id}. تحركت اللافتة ${r.head} وحدها، لأن HEAD عليها.`,
  );
}

function switchTo(r: Repo, target: string): Repo {
  if (r.merging) return say(r, "أنت في منتصف دمج: أنهِ التعارض أولاً.", false);
  const h = headCommit(r);
  if (!same(r.work, h.files) || !same(r.index, h.files)) return say(r, "عندك تعديل لم يدخل صورة. التقطه أولاً (add ثم commit) قبل أن تنتقل.", false);
  if (target === r.head) return say(r, `أنت على ${target} أصلاً.`, false);
  const created = !r.branches[target];
  const branches = created ? { ...r.branches, [target]: h.id } : r.branches;
  const files = byId(r, branches[target]).files;
  return say(
    { ...r, branches, head: target, work: { ...files }, index: { ...files } },
    created
      ? `لافتة جديدة ${target} على ${h.id} نفسها، و HEAD انتقل إليها. لم يُنسخ أي ملف.`
      : `HEAD الآن على ${target}، والمجلد صار كما في صورتها ${branches[target]}.`,
  );
}

function merge(r: Repo): Repo {
  if (r.merging) return say(r, "أنهِ هذا الدمج أولاً.", false);
  if (r.head !== "main" || !r.branches.feature) return say(r, "انتقل إلى main وادمج فيها feature.", false);
  const h = headCommit(r);
  if (!same(r.work, h.files) || !same(r.index, h.files)) return say(r, "التقط تعديلك أولاً قبل الدمج.", false);
  const m = r.branches.main;
  const f = r.branches.feature;
  if (ancestors(r, m).has(f)) return say(r, "Already up to date: كل صور feature موجودة في تاريخ main.", false);
  if (ancestors(r, f).has(m)) {
    const files = byId(r, f).files;
    return say({ ...r, branches: { ...r.branches, main: f }, work: { ...files }, index: { ...files } }, `Fast-forward: main لم يتحرك منذ الافتراق، فانزلقت لافتته إلى ${f}. لا صورة جديدة.`);
  }
  const base = byId(r, mergeBase(r, m, f)).files;
  const ours = byId(r, m).files;
  const theirs = byId(r, f).files;
  const out = { ...ours };
  const conflicts: Key[] = [];
  for (const k of KEYS) {
    if (ours[k] === theirs[k] || theirs[k] === base[k]) out[k] = ours[k];
    else if (ours[k] === base[k]) out[k] = theirs[k];
    else { out[k] = CONFLICT; conflicts.push(k); }
  }
  if (!conflicts.length) {
    const c = newCommit(r, "merge feature", [m, f], out);
    return say({ ...r, commits: [...r.commits, c], branches: { ...r.branches, main: c.id }, work: { ...out }, index: { ...out } }, `كل فرع غيّر سطراً مختلفاً، فجمعهما Git وحده في صورة دمج ${c.id} لها سهمان.`);
  }
  return say(
    { ...r, work: out, index: { ...ours }, merging: { from: "feature", conflicts, ours, theirs } },
    `تعارض! الفرعان غيّرا ${conflicts.join(" و ")} بطريقتين مختلفتين. Git لا يخمّن: اختر أنت.`,
    false,
  );
}

function pick(r: Repo, k: Key, v: string): Repo {
  return say({ ...r, work: { ...r.work, [k]: v } }, `اخترت ${v}. حين تنتهي: git add ثم git commit لصورة الدمج.`);
}

function push(r: Repo): Repo {
  if (r.origin[r.head] === r.branches[r.head]) return say(r, "GitHub عنده هذه الصور أصلاً: Everything up-to-date.", false);
  const id = r.branches[r.head];
  return say({ ...r, origin: { ...r.origin, [r.head]: id } }, `أُرسلت إلى GitHub الصور التي لا يملكها، وتحركت origin/${r.head} إلى ${id}.`);
}

const X = (n: number) => 36 + n * 78;
const Y = (lane: number) => (lane ? 150 : 80);

function Graph({ r, sel, onSel }: { r: Repo; sel: string; onSel: (id: string) => void }) {
  const width = Math.max(420, X(r.commits.length) + 30);
  const labels = Object.entries(r.branches);
  return (
    <div className="overflow-x-auto rounded-2xl bg-code p-2" dir="ltr">
      <svg width={width} height={205} className="block">
        {r.commits.flatMap((c) =>
          c.parents.map((p) => {
            const pc = byId(r, p);
            const [x1, y1, x2, y2] = [X(c.n), Y(c.lane), X(pc.n), Y(pc.lane)];
            const d = y1 === y2 ? `M${x1},${y1} L${x2},${y2}` : `M${x1},${y1} C${x1 - 40},${y1} ${x2 + 30},${y2} ${x2},${y2}`;
            return <motion.path key={c.id + p} d={d} fill="none" stroke="var(--accent)" strokeWidth={2.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} markerEnd="url(#arr)" />;
          }),
        )}
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
          </marker>
        </defs>
        {r.commits.map((c) => (
          <motion.g key={c.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ originX: `${X(c.n)}px`, originY: `${Y(c.lane)}px` }} onClick={() => onSel(c.id)} className="cursor-pointer">
            <circle cx={X(c.n)} cy={Y(c.lane)} r={15} fill={c.parents.length > 1 ? "var(--accent)" : "var(--surface)"} stroke="var(--accent)" strokeWidth={sel === c.id ? 4 : 2} />
            <text x={X(c.n)} y={Y(c.lane) + 4} textAnchor="middle" fontSize={10} className="code" fill={c.parents.length > 1 ? "var(--accent-fg)" : "var(--fg)"}>{c.id}</text>
          </motion.g>
        ))}
        {labels.map(([name, id]) => {
          const c = byId(r, id);
          const up = name === "main";
          const isHead = r.head === name;
          return (
            <motion.g key={name} initial={false} animate={{ x: X(c.n), y: Y(c.lane) + (up ? -38 : 38) }} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
              <rect x={-34} y={-11} width={68} height={22} rx={8} fill={isHead ? "var(--accent)" : "var(--surface-2)"} stroke="var(--accent)" />
              <text y={4} textAnchor="middle" fontSize={11} fontWeight={700} fill={isHead ? "var(--accent-fg)" : "var(--fg)"} className="code">{isHead ? `HEAD→${name}` : name}</text>
            </motion.g>
          );
        })}
        {Object.entries(r.origin).map(([name, id]) => {
          const c = byId(r, id);
          return (
            <motion.text key={"o" + name} initial={false} animate={{ x: X(c.n), y: Y(c.lane) + (name === "main" ? -60 : 62) }} textAnchor="middle" fontSize={10} fill="var(--ok)" className="code">
              GitHub: origin/{name}
            </motion.text>
          );
        })}
      </svg>
    </div>
  );
}

function Box({ title, files, diff, children }: { title: string; files: Files; diff?: Files; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="text-xs font-semibold text-muted">{title}</div>
      <div className="code mt-2 space-y-1 text-sm" dir="ltr">
        {KEYS.map((k) => {
          const changed = diff && files[k] !== diff[k];
          return (
            <motion.div key={k + files[k]} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} className={`rounded px-1.5 py-0.5 ${files[k] === CONFLICT ? "bg-err/20 text-err" : changed ? "bg-accent-soft/40 font-bold" : ""}`}>
              {k}: {files[k] === CONFLICT ? "<<< conflict >>>" : <span className="text-str">&quot;{files[k]}&quot;</span>}
            </motion.div>
          );
        })}
      </div>
      {children}
    </div>
  );
}

/** A tiny repository: edit, stage, snapshot, branch, merge and push, with the commit graph drawn live. */
export default function GitProblem() {
  const [r, setR] = useState<Repo>(fresh);
  const [sel, setSel] = useState<string | null>(null);
  const act = (f: (x: Repo) => Repo) => { setSel(null); setR((x) => f(x)); };
  const h = headCommit(r);
  const shown = byId(r, sel ?? h.id);
  const hasFeature = !!r.branches.feature;
  const forked = hasFeature && !ancestors(r, r.branches.main).has(r.branches.feature) && !ancestors(r, r.branches.feature).has(r.branches.main);

  const btn = "rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold code disabled:opacity-40";
  return (
    <div>
      <Graph r={r} sel={shown.id} onSel={setSel} />

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Box title="المجلد (ما تعدّله الآن)" files={r.work} diff={r.index}>
          <div className="mt-2 flex gap-2">
            {KEYS.map((k) => (
              <button key={k} onClick={() => act((x) => edit(x, k))} className="rounded-lg bg-surface-2 px-2 py-1 text-xs">عدّل {k}</button>
            ))}
          </div>
        </Box>
        <Box title="منطقة التجهيز (git add)" files={r.index} diff={h.files} />
        <Box title={`الصورة ${shown.id}${shown.id === h.id ? " (تحت HEAD)" : ""}`} files={shown.files}>
          <div className="code mt-2 text-xs text-muted" dir="ltr">
            parent: {shown.parents.length ? shown.parents.join(" + ") : "null"}
          </div>
        </Box>
      </div>

      {r.merging && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl border border-err/50 bg-err/10 p-3">
          {r.merging.conflicts.map((k) => (
            <div key={k} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="code font-bold" dir="ltr">{k}:</span>
              <button onClick={() => act((x) => pick(x, k, x.merging!.ours[k]))} className={`${btn} ${r.work[k] === r.merging!.ours[k] ? "ring-2 ring-accent" : ""}`}>main: {r.merging!.ours[k]}</button>
              <button onClick={() => act((x) => pick(x, k, x.merging!.theirs[k]))} className={`${btn} ${r.work[k] === r.merging!.theirs[k] ? "ring-2 ring-accent" : ""}`}>feature: {r.merging!.theirs[k]}</button>
            </div>
          ))}
        </motion.div>
      )}

      <div className="mt-4 flex flex-wrap gap-2" dir="ltr">
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => act(add)} className={btn}>git add</motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => act(commit)} className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg code shadow-lg shadow-accent/20">git commit</motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => act((x) => switchTo(x, "feature"))} className={btn}>{hasFeature ? "git switch feature" : "git switch -c feature"}</motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => act((x) => switchTo(x, "main"))} className={btn}>git switch main</motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => act(merge)} disabled={!hasFeature} className={btn}>git merge feature</motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => act(push)} className={btn}>git push</motion.button>
        <button onClick={() => { setSel(null); setR(fresh()); }} className="px-2 text-sm text-muted hover:text-fg">ابدأ من جديد</button>
      </div>

      <div className="mt-3 min-h-[3rem] text-sm">
        <AnimatePresence mode="wait">
          <motion.p key={r.note} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={r.ok ? "" : "text-err"}>
            {r.note}
          </motion.p>
        </AnimatePresence>
      </div>

      {forked && !r.merging && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-sm text-muted">
          التاريخ تفرّع: لكل لافتة خط. جرّب أن تغيّر <b className="code text-fg">title</b> في الفرعين بقيمتين مختلفتين، ثم ادمج من main.
        </motion.p>
      )}
      <p className="mt-2 text-xs text-muted">اضغط أي دائرة لترى صورتها: كل صورة تحمل الملف كاملاً، لا الفرق فقط.</p>
    </div>
  );
}
