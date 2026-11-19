"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** A small slice of the real npm registry: each package's version and what it needs. */
const REGISTRY: Record<string, { v: string; deps: string[] }> = {
  express: { v: "4.19.2", deps: ["accepts", "body-parser", "cookie", "debug", "send", "qs"] },
  accepts: { v: "1.3.8", deps: ["mime-types", "negotiator"] },
  "mime-types": { v: "2.1.35", deps: ["mime-db"] },
  "mime-db": { v: "1.52.0", deps: [] },
  negotiator: { v: "0.6.3", deps: [] },
  "body-parser": { v: "1.20.2", deps: ["bytes", "debug", "qs", "raw-body"] },
  "raw-body": { v: "2.5.2", deps: ["bytes", "iconv-lite"] },
  "iconv-lite": { v: "0.4.24", deps: ["safer-buffer"] },
  "safer-buffer": { v: "2.1.2", deps: [] },
  bytes: { v: "3.1.2", deps: [] },
  cookie: { v: "0.6.0", deps: [] },
  debug: { v: "2.6.9", deps: ["ms"] },
  ms: { v: "2.0.0", deps: [] },
  send: { v: "0.18.0", deps: ["debug", "mime-types", "ms", "etag"] },
  etag: { v: "1.8.1", deps: [] },
  qs: { v: "6.11.0", deps: ["side-channel"] },
  "side-channel": { v: "1.0.6", deps: ["object-inspect"] },
  "object-inspect": { v: "1.13.1", deps: [] },
  axios: { v: "1.7.2", deps: ["follow-redirects", "form-data", "proxy-from-env"] },
  "follow-redirects": { v: "1.15.6", deps: ["debug"] },
  "form-data": { v: "4.0.0", deps: ["asynckit", "combined-stream", "mime-types"] },
  asynckit: { v: "0.4.0", deps: [] },
  "combined-stream": { v: "1.0.8", deps: ["delayed-stream"] },
  "delayed-stream": { v: "1.0.0", deps: [] },
  "proxy-from-env": { v: "1.1.0", deps: [] },
  react: { v: "18.3.1", deps: ["loose-envify"] },
  "loose-envify": { v: "1.4.0", deps: ["js-tokens"] },
  "js-tokens": { v: "4.0.0", deps: [] },
  lodash: { v: "4.17.21", deps: [] },
};
const TOP = ["express", "axios", "react", "lodash"];

/** One row of the tree being installed: depth, and whether it was already in node_modules. */
interface Row {
  name: string;
  depth: number;
  dup: boolean;
}

/** Walks the dependency tree depth-first; a package already seen is shown once more, dimmed, and not opened again. */
function walk(name: string, have: Set<string>): Row[] {
  const seen = new Set(have);
  const rows: Row[] = [];
  const go = (n: string, depth: number) => {
    if (seen.has(n)) { rows.push({ name: n, depth, dup: true }); return; }
    seen.add(n);
    rows.push({ name: n, depth, dup: false });
    for (const d of REGISTRY[n].deps) go(d, depth + 1);
  };
  go(name, 0);
  return rows;
}

/** Install a package and watch its dependency tree unfold into node_modules. */
export default function PackagesProblem() {
  const [direct, setDirect] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [shown, setShown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const busy = shown < rows.length;
  const stop = () => { if (timer.current) clearInterval(timer.current); timer.current = null; };
  useEffect(() => stop, []);

  // Each revealed new row lands in node_modules.
  useEffect(() => {
    if (!shown) return;
    const r = rows[shown - 1];
    if (r && !r.dup) setModules((m) => (m.includes(r.name) ? m : [...m, r.name]));
    if (shown >= rows.length) stop();
  }, [shown, rows]);

  function install(name: string) {
    if (busy || direct.includes(name)) return;
    const tree = walk(name, new Set(modules));
    stop();
    setDirect((d) => [...d, name]);
    setRows(tree);
    setShown(0);
    timer.current = setInterval(() => setShown((k) => k + 1), 260);
  }
  function reset() { stop(); setDirect([]); setModules([]); setRows([]); setShown(0); }

  const added = rows.slice(0, shown).filter((r) => !r.dup).length;
  const last = direct[direct.length - 1];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" dir="ltr">
        {TOP.map((p) => {
          const done = direct.includes(p);
          return (
            <motion.button
              key={p}
              whileTap={{ scale: 0.92 }}
              onClick={() => install(p)}
              disabled={busy || done}
              className={`code rounded-2xl px-4 py-2.5 font-bold ${done ? "border border-ok/50 bg-ok/10 text-ok" : "bg-accent text-accent-fg shadow-lg shadow-accent/20"} disabled:cursor-not-allowed ${busy && !done ? "opacity-50" : ""}`}
            >
              {done ? "✓ " : "npm install "}{p}
            </motion.button>
          );
        })}
        {direct.length > 0 && (
          <button onClick={reset} className="ms-auto text-sm text-muted hover:text-fg" dir="rtl">ابدأ من جديد</button>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* Tree being installed */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">شجرة الاعتماديات</span>
            {last && <span className="text-sm text-muted">طلبت <b className="code text-fg">{last}</b>، فنزلت <b className="code text-accent">{added}</b> حزمة</span>}
          </div>
          <div className="code mt-3 h-72 overflow-y-auto text-sm" dir="ltr">
            {!rows.length && <div className="text-muted" dir="rtl">اضغط زراً من الأعلى لتثبيت حزمة.</div>}
            <AnimatePresence initial={false}>
              {rows.slice(0, shown).map((r, k) => (
                <motion.div
                  key={`${last}-${k}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-2 py-0.5 ${r.dup ? "text-muted" : ""}`}
                  style={{ paddingLeft: r.depth * 18 }}
                >
                  <span className="text-muted">{r.depth ? "└─" : "■"}</span>
                  <span className={r.depth === 0 ? "font-bold text-accent" : r.dup ? "" : "text-fg"}>{r.name}</span>
                  <span className="text-xs text-num">{REGISTRY[r.name].v}</span>
                  {r.dup && <span className="text-[11px]" dir="rtl">موجودة، لا تُنزَّل مرة أخرى</span>}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Project files */}
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl bg-code p-3" dir="ltr">
            <div className="code text-xs text-code-fg/50">package.json <span dir="rtl">(ما طلبته أنت)</span></div>
            <pre className="code mt-1 text-sm text-code-fg">
              {`"dependencies": {\n`}
              {direct.map((d, k) => (
                <span key={d}>{`  "${d}": `}<span className="text-str">{`"^${REGISTRY[d].v}"`}</span>{k < direct.length - 1 ? ",\n" : "\n"}</span>
              ))}
              {"}"}
            </pre>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-3">
            <div className="flex items-baseline justify-between text-sm">
              <span className="code font-semibold">node_modules/</span>
              <span className="text-muted"><b className="code text-2xl text-fg">{modules.length}</b> حزمة</span>
            </div>
            <div className="mt-2 flex max-h-32 flex-wrap gap-1 overflow-y-auto" dir="ltr">
              <AnimatePresence>
                {modules.map((m) => (
                  <motion.span key={m} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`code rounded-md px-1.5 py-0.5 text-[11px] ${direct.includes(m) ? "bg-accent text-accent-fg" : "bg-surface-2"}`}>
                    {m}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-3 text-sm">
            <span className="code font-semibold">package-lock.json</span>{" "}
            <span className="text-muted">يثبّت النسخة الدقيقة لكل واحدة من الـ <b className="code text-fg">{modules.length}</b></span>
          </div>
        </div>
      </div>

      {!busy && direct.length >= 2 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          لاحظت؟ طلبت <b className="text-fg">{direct.length}</b> حزم، وفي مشروعك الآن <b className="text-fg">{modules.length}</b>. الحزم المشتركة نزلت مرة واحدة فقط. وكل واحدة منها <b className="text-fg">كود كتبه غرباء ويعمل على جهازك</b>، لذلك اعرف ما تثبّته.
        </motion.p>
      )}
    </div>
  );
}
