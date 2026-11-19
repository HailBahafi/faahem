"use client";

import { AnimatePresence, motion } from "motion/react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

const HOME = "/home/sara";

/** A fake in-memory file system: every folder path, and every file path with its text. */
interface Fs {
  dirs: string[];
  files: Record<string, string>;
}

const START: Fs = {
  dirs: ["/", "/home", HOME, `${HOME}/hello`],
  files: {
    [`${HOME}/notes.txt`]: "buy milk\ncall Ali",
    [`${HOME}/hello/app.js`]: 'console.log("Hello from app.js");',
  },
};

interface Line {
  kind: "cmd" | "out" | "err";
  text: string;
  cwd?: string;
}

interface State {
  fs: Fs;
  cwd: string;
  lines: Line[];
  ranPwd: boolean;
  ranApp: boolean;
}

const fresh = (): State => ({ fs: START, cwd: HOME, lines: [], ranPwd: false, ranApp: false });

const parent = (p: string) => (p === "/" ? "/" : p.slice(0, p.lastIndexOf("/")) || "/");
const base = (p: string) => p.slice(p.lastIndexOf("/") + 1);
const join = (a: string, b: string) => (a === "/" ? `/${b}` : `${a}/${b}`);
const short = (p: string) => (p === HOME ? "~" : p.startsWith(HOME + "/") ? "~" + p.slice(HOME.length) : p);

/** Turns a typed path into an absolute one: "/" starts at the root, "~" at home, anything else at cwd. */
function resolve(cwd: string, path: string) {
  let parts: string[];
  let at: string;
  if (path.startsWith("/")) { at = "/"; parts = path.split("/"); }
  else if (path === "~" || path.startsWith("~/")) { at = HOME; parts = path.slice(1).split("/"); }
  else { at = cwd; parts = path.split("/"); }
  for (const p of parts) {
    if (!p || p === ".") continue;
    at = p === ".." ? parent(at) : join(at, p);
  }
  return at;
}

const children = (fs: Fs, dir: string) => {
  const kids = [...fs.dirs.filter((d) => d !== "/" && parent(d) === dir), ...Object.keys(fs.files).filter((f) => parent(f) === dir)];
  return kids.map(base).sort();
};

/** Runs one command line against the state. Returns the new state (with its printed lines added). */
function exec(st: State, input: string): State {
  const words = input.trim().split(/\s+/).filter(Boolean);
  const lines: Line[] = [...st.lines, { kind: "cmd", text: input.trim(), cwd: st.cwd }];
  const out = (text: string) => lines.push({ kind: "out", text });
  const err = (text: string) => lines.push({ kind: "err", text });
  if (!words.length) return { ...st, lines };
  const [prog, ...rest] = words;
  const opts = rest.filter((w) => w.startsWith("-"));
  const args = rest.filter((w) => !w.startsWith("-"));
  const fs: Fs = { dirs: [...st.fs.dirs], files: { ...st.fs.files } };
  const isDir = (p: string) => fs.dirs.includes(p);
  const isFile = (p: string) => p in fs.files;
  let cwd = st.cwd;
  let { ranPwd, ranApp } = st;

  switch (prog) {
    case "pwd":
      out(cwd);
      ranPwd = true;
      break;
    case "ls": {
      const target = resolve(cwd, args[0] ?? ".");
      if (isFile(target)) out(base(target));
      else if (!isDir(target)) err(`ls: ${args[0]}: No such file or directory`);
      else {
        const kids = children(fs, target).map((k) => (isDir(join(target, k)) ? k + "/" : k));
        if (kids.length) out(kids.join("  "));
      }
      break;
    }
    case "cd": {
      const target = resolve(cwd, args[0] ?? "~");
      if (isDir(target)) cwd = target;
      else if (isFile(target)) err(`cd: not a directory: ${args[0]}`);
      else err(`cd: no such file or directory: ${args[0]}`);
      break;
    }
    case "mkdir":
      if (!args.length) { err("mkdir: missing operand"); break; }
      for (const a of args) {
        const p = resolve(cwd, a);
        if (isDir(p) || isFile(p)) err(`mkdir: ${a}: File exists`);
        else if (!isDir(parent(p))) {
          if (!opts.includes("-p")) { err(`mkdir: ${a}: No such file or directory`); continue; }
          let q = p;
          const chain: string[] = [];
          while (!isDir(q)) { chain.unshift(q); q = parent(q); }
          fs.dirs.push(...chain);
        } else fs.dirs.push(p);
      }
      break;
    case "touch":
      if (!args.length) { err("touch: missing file operand"); break; }
      for (const a of args) {
        const p = resolve(cwd, a);
        if (!isDir(parent(p))) err(`touch: ${a}: No such file or directory`);
        else if (!isFile(p) && !isDir(p)) fs.files[p] = "";
      }
      break;
    case "cat":
      for (const a of args) {
        const p = resolve(cwd, a);
        if (isDir(p)) err(`cat: ${a}: Is a directory`);
        else if (!isFile(p)) err(`cat: ${a}: No such file or directory`);
        else if (fs.files[p]) fs.files[p].split("\n").forEach(out);
      }
      break;
    case "rm":
      for (const a of args) {
        const p = resolve(cwd, a);
        if (isFile(p)) delete fs.files[p];
        else if (isDir(p)) {
          if (!opts.some((o) => o.includes("r"))) { err(`rm: ${a}: is a directory`); continue; }
          if (p === "/" || cwd === p || cwd.startsWith(p + "/")) { err(`rm: refusing to remove ${a}`); continue; }
          fs.dirs = fs.dirs.filter((d) => d !== p && !d.startsWith(p + "/"));
          for (const f of Object.keys(fs.files)) if (f.startsWith(p + "/")) delete fs.files[f];
        } else err(`rm: ${a}: No such file or directory`);
      }
      break;
    case "echo":
      out(args.join(" "));
      break;
    case "clear":
      return { ...st, lines: [] };
    case "node":
    case "python":
    case "python3": {
      if (!args[0]) { err(`${prog}: give it a file to run, e.g. ${prog} app.js`); break; }
      const p = resolve(cwd, args[0]);
      if (!isFile(p)) {
        err(prog === "node" ? `Error: Cannot find module '${p}'` : `${prog}: can't open file '${p}': No such file or directory`);
        break;
      }
      const printed = [...fs.files[p].matchAll(/(?:console\.log|print)\(\s*["'`](.*?)["'`]\s*\)/g)].map((m) => m[1]);
      printed.forEach(out);
      if (p === `${HOME}/hello/app.js`) ranApp = true;
      break;
    }
    case "help":
      out("pwd  ls  cd  mkdir [-p]  touch  cat  rm [-r]  echo  node  python  clear");
      break;
    default:
      err(`${prog}: command not found`);
  }
  return { fs, cwd, lines, ranPwd, ranApp };
}

const TASKS: { label: string; done: (s: State) => boolean }[] = [
  { label: "اعرف أين تقف", done: (s) => s.ranPwd },
  { label: "أنشئ المجلد project وداخله src", done: (s) => s.fs.dirs.includes(`${HOME}/project/src`) },
  { label: "أنشئ الملف index.js داخل src", done: (s) => `${HOME}/project/src/index.js` in s.fs.files },
  { label: "شغّل البرنامج app.js الموجود في hello", done: (s) => s.ranApp },
];

const CHIPS = ["pwd", "ls", "cd hello", "cd ..", "mkdir project", "cat notes.txt", "node app.js"];

/** A fake terminal over an in-memory folder tree; the tree highlights the folder you stand in. */
export default function TerminalProblem() {
  const [st, setSt] = useState<State>(fresh);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight }); }, [st.lines]);

  function submit() {
    setSt((s) => exec(s, input));
    if (input.trim()) setHist((h) => [...h, input.trim()]);
    setInput("");
    setHi(-1);
  }
  function key(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
    else if (e.key === "ArrowUp" && hist.length) {
      e.preventDefault();
      const k = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1);
      setHi(k);
      setInput(hist[k]);
    } else if (e.key === "ArrowDown" && hi >= 0) {
      e.preventDefault();
      const k = hi + 1;
      if (k >= hist.length) { setHi(-1); setInput(""); } else { setHi(k); setInput(hist[k]); }
    }
  }

  const doneCount = TASKS.filter((t) => t.done(st)).length;

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Terminal */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-code" dir="ltr" onClick={() => field.current?.focus()}>
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-err/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-num/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-ok/70" />
            <span className="code ms-2 text-xs text-code-fg/50">sara@laptop: {short(st.cwd)}</span>
          </div>
          <div ref={box} className="code h-72 overflow-y-auto p-3 text-sm leading-6 text-code-fg">
            {st.lines.length === 0 && <div className="text-code-fg/40">type a command, e.g. pwd, then press Enter (help lists them all)</div>}
            {st.lines.map((l, k) => (
              <div key={k} className={l.kind === "err" ? "text-err" : l.kind === "out" ? "text-code-fg/80" : ""}>
                {l.kind === "cmd" ? (
                  <>
                    <span className="text-ok">{short(l.cwd!)}</span> <span className="text-[var(--accent)]">$</span> {l.text}
                  </>
                ) : (
                  <span className="whitespace-pre-wrap">{l.text}</span>
                )}
              </div>
            ))}
            <div className="flex">
              <span className="text-ok">{short(st.cwd)}</span>&nbsp;<span className="text-[var(--accent)]">$</span>&nbsp;
              <input
                ref={field}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={key}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                aria-label="command"
                className="flex-1 bg-transparent text-code-fg outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tree */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="font-semibold">شجرة المجلدات <span className="text-sm font-normal text-muted">(أنت تقف عند النقطة المضيئة)</span></div>
          <div className="code mt-3 text-sm" dir="ltr">
            <Node fs={st.fs} path="/" cwd={st.cwd} depth={0} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" dir="ltr">
        {CHIPS.map((c) => (
          <button key={c} onClick={() => { setInput(c); field.current?.focus(); }} className="code rounded-lg border border-line bg-surface px-2.5 py-1 text-xs hover:border-accent">
            {c}
          </button>
        ))}
        <button onClick={() => { setSt(fresh()); setHist([]); }} className="ms-auto text-sm text-muted hover:text-fg" dir="rtl">ابدأ من جديد</button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {TASKS.map((t, k) => {
          const ok = t.done(st);
          return (
            <motion.div key={k} animate={{ scale: ok ? [1, 1.04, 1] : 1 }} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${ok ? "border-ok/50 bg-ok/10" : "border-line bg-surface"}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${ok ? "bg-ok text-white" : "bg-surface-2 text-muted"}`}>{ok ? "✓" : k + 1}</span>
              {t.label}
            </motion.div>
          );
        })}
      </div>

      {doneCount === TASKS.length && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          لاحظت؟ كل أمر هو <b className="text-fg">اسم برنامج ثم ما يعمل عليه</b>، وكل أمر يعمل <b className="text-fg">في المجلد الذي تقف فيه</b>. لهذا لم يجد node الملف app.js حتى دخلت إلى hello.
        </motion.p>
      )}
    </div>
  );
}

function Node({ fs, path, cwd, depth }: { fs: Fs; path: string; cwd: string; depth: number }) {
  const here = path === cwd;
  const onWay = path === "/" || cwd === path || cwd.startsWith(path + "/");
  const kids = children(fs, path);
  return (
    <div>
      <motion.div
        layout
        className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 ${here ? "bg-accent font-bold text-accent-fg" : onWay ? "text-fg" : "text-muted"}`}
        style={{ marginLeft: depth * 16 }}
      >
        {here ? <motion.span layoutId="you" className="h-2 w-2 rounded-full bg-accent-fg" /> : <span className="h-2 w-2" />}
        <span>{path === "/" ? "/" : base(path) + "/"}</span>
      </motion.div>
      <AnimatePresence initial={false}>
        {kids.map((k) => {
          const p = join(path, k);
          if (fs.dirs.includes(p)) return <Node key={p} fs={fs} path={p} cwd={cwd} depth={depth + 1} />;
          return (
            <motion.div key={p} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} className="px-1.5 py-0.5 text-num" style={{ marginLeft: (depth + 1) * 16 + 14 }}>
              {k}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
