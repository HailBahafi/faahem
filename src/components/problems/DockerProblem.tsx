"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** One Dockerfile line: its text, how long it takes to build (simulated seconds), and which files it reads. */
interface Recipe {
  text: string;
  cost: number;
  reads: ("pkg" | "code")[];
}

const GOOD: Recipe[] = [
  { text: "FROM node:22-alpine", cost: 8, reads: [] },
  { text: "WORKDIR /app", cost: 0.1, reads: [] },
  { text: "COPY package*.json ./", cost: 0.2, reads: ["pkg"] },
  { text: "RUN npm ci", cost: 35, reads: [] },
  { text: "COPY . .", cost: 0.4, reads: ["pkg", "code"] },
  { text: 'CMD ["node", "server.js"]', cost: 0, reads: [] },
];
const BAD: Recipe[] = [GOOD[0], GOOD[1], GOOD[4], GOOD[3], GOOD[5]];

type Status = "idle" | "building" | "cached" | "built";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const hex = () => Math.random().toString(16).slice(2, 10);

export default function DockerProblem() {
  const [bad, setBad] = useState(false);
  const [ver, setVer] = useState({ pkg: 1, code: 1 });
  const [cache, setCache] = useState<string[]>([]);
  const [status, setStatus] = useState<Status[]>([]);
  const [busy, setBusy] = useState(false);
  const [secs, setSecs] = useState<number | null>(null);
  const [built, setBuilt] = useState(false);
  const [sawCache, setSawCache] = useState(false);

  const [ctrs, setCtrs] = useState<string[]>([]);
  const [maxCtrs, setMaxCtrs] = useState(0);
  const [killed, setKilled] = useState(false);

  const [useVol, setUseVol] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ctrRows, setCtrRows] = useState(0);
  const [volRows, setVolRows] = useState(0);
  const [dbId, setDbId] = useState("db-1");
  const [survived, setSurvived] = useState(false);
  const [lost, setLost] = useState(false);

  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const recipe = bad ? BAD : GOOD;
  /** A layer's identity: its own line, the files it reads, and everything beneath it. */
  const prints = recipe.map((r, i) => recipe.slice(0, i + 1).map((x) => x.text + x.reads.map((k) => `${k}${ver[k]}`).join("")).join("|"));

  async function build() {
    if (busy) return;
    setBusy(true);
    setSecs(null);
    const st: Status[] = recipe.map(() => "idle");
    setStatus([...st]);
    let total = 0;
    let anyCached = false;
    let anyBuilt = false;
    for (let i = 0; i < recipe.length; i++) {
      const hit = cache.includes(prints[i]);
      st[i] = "building";
      setStatus([...st]);
      await sleep(hit ? 140 : Math.max(260, recipe[i].cost * 45));
      if (!alive.current) return;
      st[i] = hit ? "cached" : "built";
      if (hit) anyCached = true; else { anyBuilt = true; total += recipe[i].cost; }
      setStatus([...st]);
    }
    setCache((c) => [...c, ...prints]);
    setSecs(Math.round(total * 10) / 10);
    setBuilt(true);
    if (anyCached && anyBuilt) setSawCache(true);
    setBusy(false);
  }
  const change = (k: "pkg" | "code") => { setVer((v) => ({ ...v, [k]: v[k] + 1 })); setStatus([]); setSecs(null); };

  function run() {
    if (!built || ctrs.length >= 4) return;
    const next = [...ctrs, hex()];
    setCtrs(next);
    setMaxCtrs((m) => Math.max(m, next.length));
  }
  function kill(id: string) {
    const next = ctrs.filter((c) => c !== id);
    setCtrs(next);
    if (next.length >= 1 && maxCtrs >= 3) setKilled(true);
  }

  const rows = mounted ? volRows : ctrRows;
  const addUser = () => (mounted ? setVolRows((r) => r + 1) : setCtrRows((r) => r + 1));
  function replaceDb() {
    if (rows > 0 && mounted && useVol) setSurvived(true);
    if (rows > 0 && !(mounted && useVol)) setLost(true);
    setCtrRows(0);
    setMounted(useVol);
    setDbId(`db-${hex().slice(0, 4)}`);
  }

  const tasks = [
    { label: "ابنِ الصورة", done: built },
    { label: "غيّر شيئاً وابنِ ثانية: ما الذي أُخذ من الذاكرة؟", done: sawCache },
    { label: "شغّل 3 حاويات، ثم اقتل واحدة", done: killed },
    { label: "استبدل حاوية القاعدة ولا تفقد المستخدمين", done: survived },
  ];

  return (
    <div className="space-y-4">
      {/* Build */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-code p-3" dir="ltr">
          <div className="code mb-2 text-xs text-code-fg/50">Dockerfile</div>
          {recipe.map((r, i) => {
            const s = status[i] ?? "idle";
            return (
              <motion.div key={r.text} layout className={`code flex items-center gap-2 rounded px-2 py-1 text-sm ${s === "building" ? "bg-accent/30" : ""} text-code-fg`}>
                <span className="w-4 text-code-fg/40">{i + 1}</span>
                <span className="flex-1">{r.text}</span>
                {r.reads.map((k) => <span key={k} className="rounded bg-white/10 px-1 text-[10px] text-code-fg/60">{k === "pkg" ? `package.json v${ver.pkg}` : `server.js v${ver.code}`}</span>)}
              </motion.div>
            );
          })}
          <div className="mt-3 flex flex-wrap gap-2" dir="rtl">
            <button onClick={build} disabled={busy} className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-fg disabled:opacity-50">ابنِ <span className="code" dir="ltr">docker build</span></button>
            <button onClick={() => change("code")} disabled={busy} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg disabled:opacity-50">عدّل server.js</button>
            <button onClick={() => change("pkg")} disabled={busy} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg disabled:opacity-50">أضف حزمة</button>
            <label className="flex items-center gap-1.5 text-sm text-code-fg/70">
              <input type="checkbox" checked={bad} disabled={busy} onChange={(e) => { setBad(e.target.checked); setStatus([]); setSecs(null); }} />
              انسخ الكود قبل npm ci
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <div className="font-semibold">الصورة shop <span className="text-sm font-normal text-muted">(طبقات فوق بعضها)</span></div>
            {secs !== null && <motion.div initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="code text-num" dir="ltr">{secs}s</motion.div>}
          </div>
          <div className="mt-3 flex flex-col-reverse gap-1" dir="ltr">
            <AnimatePresence initial={false}>
              {recipe.map((r, i) => {
                const s = status[i] ?? "idle";
                if (s === "idle") return null;
                return (
                  <motion.div key={r.text + i} initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`code flex items-center justify-between rounded-md border px-2 py-1 text-xs ${s === "cached" ? "border-ok/40 bg-ok/10" : s === "built" ? "border-num/40 bg-num/10" : "border-accent bg-accent/10"}`}>
                    <span>{r.text}</span>
                    <span className={s === "cached" ? "text-ok" : s === "built" ? "text-num" : "text-accent"}>{s === "cached" ? "CACHED" : s === "built" ? `${r.cost}s` : "..."}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {status.length === 0 && <div className="py-6 text-center text-sm text-muted" dir="rtl">اضغط «ابنِ»</div>}
          </div>
        </div>
      </div>

      {/* Containers */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`rounded-2xl border border-line bg-surface p-4 ${built ? "" : "opacity-50"}`}>
          <div className="flex items-center justify-between">
            <div className="font-semibold">حاويات من صورة واحدة</div>
            <button onClick={run} disabled={!built || ctrs.length >= 4} className="code rounded-lg bg-accent px-3 py-1 text-xs text-accent-fg disabled:opacity-50" dir="ltr">docker run shop</button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2" dir="ltr">
            <AnimatePresence>
              {ctrs.map((c) => (
                <motion.div key={c} layout initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0, rotate: -8 }} className="code flex items-center justify-between rounded-lg border border-ok/40 bg-ok/10 px-2 py-1.5 text-xs">
                  <span><span className="me-1 inline-block h-2 w-2 rounded-full bg-ok" />{c}</span>
                  <button onClick={() => kill(c)} aria-label="kill" className="rounded px-1 text-err hover:bg-err/20">✕</button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {ctrs.length === 0 && <div className="mt-2 text-sm text-muted">{built ? "لا حاويات تعمل. الصورة وحدها لا تفعل شيئاً." : "ابنِ الصورة أولاً."}</div>}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">قاعدة البيانات</div>
            <label className="code flex items-center gap-1.5 text-xs" dir="ltr">
              <input type="checkbox" checked={useVol} onChange={(e) => setUseVol(e.target.checked)} />
              -v pgdata:/var/lib/postgresql/data
            </label>
          </div>
          <div className="mt-3 flex items-stretch gap-3" dir="ltr">
            <motion.div key={dbId} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 rounded-lg border border-line bg-surface-2 p-2">
              <div className="code text-xs text-muted">{dbId}</div>
              <div className="mt-1 flex min-h-6 flex-wrap gap-1">
                {!mounted && Array.from({ length: ctrRows }, (_, k) => <motion.span key={k} initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-3 w-3 rounded-sm bg-num" />)}
                {mounted && <span className="code text-xs text-accent">→ pgdata</span>}
              </div>
            </motion.div>
            <div className={`w-28 rounded-lg border-2 border-dashed p-2 ${mounted ? "border-accent" : "border-line opacity-60"}`}>
              <div className="code text-xs text-muted">volume pgdata</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {Array.from({ length: volRows }, (_, k) => <motion.span key={k} initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-3 w-3 rounded-sm bg-accent" />)}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={addUser} className="rounded-lg border border-line px-3 py-1 text-sm hover:border-accent">أضف مستخدماً</button>
            <button onClick={replaceDb} className="code rounded-lg border border-err/50 px-3 py-1 text-xs text-err hover:bg-err/10" dir="ltr">docker rm -f db && docker run db</button>
            <span className="text-sm text-muted">المستخدمون: <b className="text-fg">{rows}</b></span>
          </div>
          {lost && !survived && <p className="mt-2 text-xs text-err">ضاع المستخدمون مع الحاوية. فعّل الـ volume، وأعد التشغيل مرة ليُركَّب، ثم أضف واستبدل.</p>}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {tasks.map((t, k) => (
          <motion.div key={k} animate={{ scale: t.done ? [1, 1.04, 1] : 1 }} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${t.done ? "border-ok/50 bg-ok/10" : "border-line bg-surface"}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${t.done ? "bg-ok text-white" : "bg-surface-2 text-muted"}`}>{t.done ? "✓" : k + 1}</span>
            {t.label}
          </motion.div>
        ))}
      </div>

      {tasks.every((t) => t.done) && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted">
          الصورة <b className="text-fg">مجمّدة</b> وتُبنى طبقة فوق طبقة، فما لم يتغيّر يُؤخذ جاهزاً. الحاوية <b className="text-fg">نسخة تعمل منها تُرمى بلا ثمن</b>، والبيانات التي يجب أن تبقى تعيش في volume خارجها.
        </motion.p>
      )}
    </div>
  );
}
