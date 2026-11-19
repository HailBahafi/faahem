"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Hop = "root" | "tld" | "auth";
interface Trip { hop: Hop; ask: string; answer: string; ms: number }
interface Entry { ip: string; expires: number }

const TTL = 300;
const KNOWN: Record<string, string> = { "example.com": "93.184.216.34" };

/** A made-up but stable IP for any name: the same name always gives the same number. */
function ipOf(name: string) {
  if (KNOWN[name]) return KNOWN[name];
  let h = 7;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return [h >>> 24, (h >>> 16) & 255, (h >>> 8) & 255, h & 255].map((b, k) => (k === 0 ? 20 + (b % 200) : b)).join(".");
}

function clean(raw: string) {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

function tripsFor(name: string): Trip[] {
  const labels = name.split(".");
  const tld = labels[labels.length - 1];
  const site = labels.slice(-2).join(".");
  const ns = `ns1.${site}`;
  const ms = () => 20 + Math.floor(Math.random() * 60);
  return [
    { hop: "root", ask: `من يدير .${tld}؟`, answer: `اسأل خوادم .${tld}`, ms: ms() },
    { hop: "tld", ask: `من يدير ${site}؟`, answer: `اسأل ${ns}`, ms: ms() },
    { hop: "auth", ask: `ما رقم ${name}؟`, answer: ipOf(name), ms: ms() },
  ];
}

const SERVERS: { hop: Hop; title: (tld: string, site: string) => string; sub: string }[] = [
  { hop: "root", title: () => "خادم الجذر  .", sub: "يعرف النهايات فقط" },
  { hop: "tld", title: (tld) => `خوادم .${tld}`, sub: "تعرف من يدير كل اسم تحتها" },
  { hop: "auth", title: (_, site) => `ns1.${site}`, sub: "صاحب الجواب الأكيد" },
];

/** A resolver walks root → TLD → authoritative for a typed name, then answers the same name from its cache. */
export default function DnsProblem() {
  const [input, setInput] = useState("example.com");
  const [name, setName] = useState("");
  const [cache, setCache] = useState<Record<string, Entry>>({});
  const [clock, setClock] = useState(0);
  const [plan, setPlan] = useState<Trip[]>([]);
  const [shown, setShown] = useState(0);
  const [hit, setHit] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<{ name: string; trips: number; ms: number }[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const busy = plan.length > 0 && shown < plan.length;
  const labels = (name || "example.com").split(".");
  const tld = labels[labels.length - 1];
  const site = labels.slice(-2).join(".");
  const active = busy ? plan[shown]?.hop : null;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  useEffect(() => {
    if (!plan.length || shown > plan.length) return;
    if (shown === plan.length) {
      const ip = plan[plan.length - 1].answer;
      setCache((c) => ({ ...c, [name]: { ip, expires: clock + TTL } }));
      setHistory((h) => [{ name, trips: plan.length, ms: plan.reduce((s, t) => s + t.ms, 0) }, ...h].slice(0, 5));
      setShown(plan.length + 1);
      return;
    }
    timer.current = setTimeout(() => setShown((k) => k + 1), 1100);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [plan, shown, name, clock]);

  function lookup() {
    if (busy) return;
    const n = clean(input);
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(n)) { setError("اكتب اسماً فيه نقطة، مثل example.com أو faahem.sa"); return; }
    setError("");
    setName(n);
    const entry = cache[n];
    if (entry && clock < entry.expires) {
      setPlan([]);
      setShown(0);
      setHit(n);
      setHistory((h) => [{ name: n, trips: 0, ms: 1 }, ...h].slice(0, 5));
      return;
    }
    setHit(null);
    setPlan(tripsFor(n));
    setShown(0);
  }

  const done = plan.length > 0 && shown > plan.length;
  const answer = hit ? cache[hit]?.ip : done ? plan[plan.length - 1].answer : null;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Browser + resolver */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="text-sm font-semibold">المتصفح</div>
            <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); lookup(); }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                dir="ltr"
                spellCheck={false}
                className="code min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3 py-2"
              />
              <motion.button whileTap={{ scale: 0.92 }} disabled={busy} className="rounded-xl bg-accent px-5 py-2 font-bold text-accent-fg disabled:opacity-40">
                ابحث
              </motion.button>
            </form>
            {error && <p className="mt-2 text-sm text-err">{error}</p>}
            <div className="mt-2 min-h-[1.75rem] text-sm">
              {answer && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  <span className="code" dir="ltr">{name}</span> ← <b className="code text-num" dir="ltr">{answer}</b>
                  <span className="text-muted"> {hit ? "(من الذاكرة، 0 رحلات)" : `(${plan.length} رحلات)`}</span>
                </motion.div>
              )}
            </div>
          </div>

          <motion.div
            animate={{ scale: hit ? [1.03, 1] : 1 }}
            className={`rounded-2xl border p-4 ${busy ? "border-accent ring-2 ring-accent/40" : "border-accent/50"} bg-accent-soft/20`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">الـ resolver وذاكرته المؤقتة</div>
              <span className="code text-xs text-muted" dir="ltr">t = {clock}s</span>
            </div>
            <div className="mt-2 space-y-1" dir="ltr">
              {Object.keys(cache).length === 0 && <div className="text-sm text-muted" dir="rtl">الذاكرة فارغة.</div>}
              {Object.entries(cache).map(([k, e]) => {
                const left = e.expires - clock;
                const alive = left > 0;
                return (
                  <motion.div
                    key={k}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: alive ? 1 : 0.4 }}
                    className={`code flex justify-between gap-2 rounded-lg px-2 py-1 text-xs ${hit === k ? "bg-accent text-accent-fg" : "bg-surface"}`}
                  >
                    <span className="truncate">{k}</span>
                    <span>{e.ip}</span>
                    <span>{alive ? `TTL ${left}s` : "expired"}</span>
                  </motion.div>
                );
              })}
            </div>
            <button onClick={() => { setClock((c) => c + TTL); setHit(null); }} disabled={busy} className="mt-3 text-sm text-muted hover:text-fg disabled:opacity-40">
              قدّم الساعة 5 دقائق ⏩
            </button>
          </motion.div>
        </div>

        {/* The hierarchy */}
        <div className="space-y-3">
          {SERVERS.map((s, k) => {
            const trip = plan[k];
            const asked = trip && shown >= k && !hit;
            const answered = trip && shown > k && !hit;
            const on = active === s.hop;
            return (
              <motion.div
                key={s.hop}
                animate={{ scale: on ? 1.03 : 1, opacity: hit ? 0.4 : 1 }}
                className={`rounded-2xl border p-4 ${on ? "border-accent ring-2 ring-accent/40 bg-surface" : "border-line bg-surface"}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="code font-semibold" dir="ltr">{s.title(tld, site)}</span>
                  <span className="text-xs text-muted">{s.sub}</span>
                </div>
                <div className="mt-2 min-h-[2.75rem] text-sm">
                  <AnimatePresence>
                    {asked && (
                      <motion.div key={`q${k}${name}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="text-muted">
                        الـ resolver يسأل: {trip.ask}
                      </motion.div>
                    )}
                    {answered && (
                      <motion.div key={`a${k}${name}`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="font-semibold">
                        يرد: <span className={k === 2 ? "code text-num" : ""}>{trip.answer}</span>
                        <span className="text-xs font-normal text-muted"> ({trip.ms}ms)</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm font-semibold">آخر عمليات البحث</div>
          <div className="mt-2 space-y-1 text-sm">
            {history.map((h, k) => (
              <motion.div key={history.length - k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <span className="code w-36 truncate" dir="ltr">{h.name}</span>
                <span className={h.trips ? "text-str" : "text-ok"}>{h.trips ? `${h.trips} رحلات` : "من الذاكرة"}</span>
                <span className="code text-muted" dir="ltr">~{h.ms}ms</span>
              </motion.div>
            ))}
          </div>
          {history.length >= 2 && history.some((h) => h.trips === 0) && (
            <p className="mt-3 text-muted">
              لاحظت؟ البحث الثاني لم يسأل أحداً: الاسم مفتاح في جدول الـ resolver، فيقفز إليه مباشرة. جرّب أن تقدّم الساعة ثم تبحث مرة أخرى.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
