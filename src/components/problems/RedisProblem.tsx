"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Product { id: number; name: string; price: number }
interface Entry { price: number; expires: number }
interface Req { n: number; id: number; ms: number; from: "redis" | "postgres"; price: number; stale: boolean }

const TTL = 20;
const MAX_MS = 160;
const START: Product[] = [
  { id: 7, name: "Lamp", price: 120 },
  { id: 8, name: "Desk", price: 450 },
  { id: 9, name: "Chair", price: 210 },
];

/** A product page served straight from Postgres or through a Redis cache with a TTL and manual invalidation. */
export default function RedisProblem() {
  const [cacheOn, setCacheOn] = useState(false);
  const [db, setDb] = useState<Product[]>(START);
  const [redis, setRedis] = useState<Record<string, Entry>>({});
  const [now, setNow] = useState(0);
  const [log, setLog] = useState<Req[]>([]);
  const [count, setCount] = useState({ hit: 0, miss: 0, db: 0 });
  const [loading, setLoading] = useState<number | null>(null);
  const [changed, setChanged] = useState<number | null>(null);
  const nowRef = useRef(0);
  const seq = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      nowRef.current += 1;
      setNow(nowRef.current);
      setRedis((r) => {
        const live = Object.entries(r).filter(([, e]) => e.expires > nowRef.current);
        return live.length === Object.keys(r).length ? r : Object.fromEntries(live);
      });
    }, 1000);
    return () => { clearInterval(t); if (timer.current) clearTimeout(timer.current); };
  }, []);

  function request(id: number) {
    if (loading !== null) return;
    const key = `product:${id}`;
    const truth = db.find((p) => p.id === id)!;
    const e = redis[key];
    seq.current += 1;
    const n = seq.current;
    if (cacheOn && e && e.expires > nowRef.current) {
      const ms = 0.3 + Math.round(Math.random() * 6) / 10;
      setLog((l) => [{ n, id, ms, from: "redis" as const, price: e.price, stale: e.price !== truth.price }, ...l].slice(0, 8));
      setCount((c) => ({ ...c, hit: c.hit + 1 }));
      return;
    }
    const ms = 90 + Math.floor(Math.random() * 60);
    setLoading(id);
    timer.current = setTimeout(() => {
      setLoading(null);
      if (cacheOn) setRedis((r) => ({ ...r, [key]: { price: truth.price, expires: nowRef.current + TTL } }));
      setLog((l) => [{ n, id, ms, from: "postgres" as const, price: truth.price, stale: false }, ...l].slice(0, 8));
      setCount((c) => ({ hit: c.hit, miss: c.miss + (cacheOn ? 1 : 0), db: c.db + 1 }));
    }, ms * 5);
  }

  function updatePrice(id: number) {
    setDb((d) => d.map((p) => (p.id === id ? { ...p, price: p.price - 10 * (1 + Math.floor(Math.random() * 3)) } : p)));
    setChanged(id);
    setTimeout(() => setChanged((c) => (c === id ? null : c)), 900);
  }

  function del(key: string) {
    setRedis((r) => {
      const next = { ...r };
      delete next[key];
      return next;
    });
  }

  const last = log[0];
  const lastProduct = last && db.find((p) => p.id === last.id);
  const sawStale = log.some((r) => r.stale);
  const cmpFast = log.some((r) => r.from === "redis") && log.some((r) => r.from === "postgres");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => { setCacheOn((c) => !c); if (cacheOn) setRedis({}); }}
          className={`rounded-xl px-4 py-2 font-bold ${cacheOn ? "bg-accent text-accent-fg" : "border border-line bg-surface"}`}
        >
          Redis: {cacheOn ? "يعمل" : "متوقف"}
        </motion.button>
        <div className="flex gap-3 text-sm">
          <span className="text-ok">hit {count.hit}</span>
          <span className="text-str">miss {count.miss}</span>
          <span className="text-muted">قراءات Postgres {count.db}</span>
        </div>
        <span className="code ms-auto text-xs text-muted" dir="ltr">t = {now}s</span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {/* App server */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm font-semibold">الخادم: صفحة المنتج</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {db.map((p) => (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.92 }}
                disabled={loading !== null}
                onClick={() => request(p.id)}
                className="rounded-xl border border-line bg-surface-2 px-2 py-2 text-sm disabled:opacity-40"
              >
                <div className="code" dir="ltr">/product/{p.id}</div>
              </motion.button>
            ))}
          </div>
          <div className="mt-3 min-h-[5.5rem] rounded-xl bg-code p-3 text-sm">
            {loading !== null ? (
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-muted">
                ينتظر Postgres...
              </motion.div>
            ) : last && lastProduct ? (
              <motion.div key={last.n} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                <div className="code font-semibold" dir="ltr">{lastProduct.name}</div>
                <div className="mt-1">
                  السعر المعروض: <b className={`code ${last.stale ? "text-err" : "text-num"}`}>{last.price}</b>
                </div>
                <div className="mt-1 text-xs text-muted">
                  من {last.from === "redis" ? "Redis" : "Postgres"} في <span className="code" dir="ltr">{last.ms}ms</span>
                </div>
                {last.stale && <div className="mt-1 text-xs font-semibold text-err">قديم! السعر الحقيقي {lastProduct.price}</div>}
              </motion.div>
            ) : (
              <div className="text-muted">اطلب صفحة منتج.</div>
            )}
          </div>
        </div>

        {/* Redis */}
        <motion.div
          animate={{ opacity: cacheOn ? 1 : 0.45 }}
          className={`rounded-2xl border p-4 ${cacheOn ? "border-accent/60 bg-accent-soft/20" : "border-line bg-surface"}`}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold">Redis (RAM)</span>
            <span className="text-xs text-muted">مفتاح ← قيمة، بعمر {TTL}s</span>
          </div>
          <div className="mt-3 space-y-2" dir="ltr">
            {!cacheOn && <div className="text-sm text-muted" dir="rtl">متوقف: كل طلب يذهب إلى Postgres.</div>}
            {cacheOn && Object.keys(redis).length === 0 && <div className="text-sm text-muted" dir="rtl">فارغ.</div>}
            <AnimatePresence>
              {Object.entries(redis).map(([k, e]) => {
                const left = Math.max(0, e.expires - now);
                const id = Number(k.split(":")[1]);
                const stale = db.find((p) => p.id === id)?.price !== e.price;
                return (
                  <motion.div
                    key={k}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: 30 }}
                    className={`rounded-lg px-2 py-1 text-xs ${stale ? "bg-err/15" : "bg-surface"}`}
                  >
                    <div className="code flex items-center justify-between gap-2">
                      <span>{k}</span>
                      <span className={stale ? "text-err" : "text-num"}>{e.price}</span>
                      <span className="text-muted">TTL {left}s</span>
                      <button onClick={() => del(k)} className="rounded bg-err/20 px-1.5 text-err hover:bg-err/30">DEL</button>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded bg-line">
                      <motion.div className="h-full bg-accent" animate={{ width: `${(left / TTL) * 100}%` }} transition={{ duration: 1, ease: "linear" }} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Postgres */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold">Postgres (قرص)</span>
            <span className="text-xs text-muted">الحقيقة</span>
          </div>
          <div className="mt-3 space-y-2">
            {db.map((p) => (
              <motion.div
                key={p.id}
                animate={{ scale: changed === p.id ? [1.05, 1] : 1 }}
                className="flex items-center justify-between gap-2 rounded-lg bg-surface-2 px-2 py-1 text-sm"
              >
                <span className="code" dir="ltr">{p.id} · {p.name}</span>
                <b className="code text-num">{p.price}</b>
                <button onClick={() => updatePrice(p.id)} className="rounded bg-accent/20 px-2 text-xs hover:bg-accent/30">
                  خفّض السعر
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Response times */}
      <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <div className="text-sm font-semibold">زمن الرد لكل طلب</div>
        <div className="mt-2 space-y-1.5">
          {log.length === 0 && <div className="text-sm text-muted">لا طلبات بعد.</div>}
          {log.map((r) => (
            <motion.div key={r.n} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs">
              <span className="code w-20 shrink-0" dir="ltr">product:{r.id}</span>
              <div className="h-3 flex-1 overflow-hidden rounded bg-surface-2" dir="ltr">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(1.5, (r.ms / MAX_MS) * 100)}%` }}
                  className={`h-full rounded ${r.from === "redis" ? "bg-ok" : "bg-str"}`}
                />
              </div>
              <span className="code w-16 shrink-0 text-muted" dir="ltr">{r.ms}ms</span>
              <span className={`w-14 shrink-0 ${r.from === "redis" ? "text-ok" : "text-str"}`}>{r.from === "redis" ? "hit" : cacheOn ? "miss" : "قاعدة"}</span>
              {r.stale && <span className="text-err">قديم</span>}
            </motion.div>
          ))}
        </div>
        {(cmpFast || sawStale) && (
          <p className="mt-3 text-sm text-muted">
            {sawStale
              ? "Redis لا يعرف أن Postgres تغيّر: يقدّم نسخته القديمة حتى ينتهي عمرها أو تحذفها بـ DEL. هذا هو الجزء الصعب في الكاش."
              : "الـ hit يأتي من RAM في أقل من مللي ثانية، والـ miss يمر بالقرص والاستعلام. جرّب الآن: خفّض سعر منتج محفوظ في Redis ثم اطلب صفحته."}
          </p>
        )}
      </div>
    </div>
  );
}
