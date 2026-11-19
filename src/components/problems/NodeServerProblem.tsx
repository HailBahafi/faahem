"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Method = "GET" | "POST" | "DELETE";
interface Route { method: Method; path: string; ms: number }
interface Req { id: number; user: string; method: Method; path: string }
interface Done extends Req { status: number; body: string }

const ROUTES: Route[] = [
  { method: "GET", path: "/products", ms: 600 },
  { method: "GET", path: "/products/:id", ms: 600 },
  { method: "POST", path: "/products", ms: 700 },
  { method: "GET", path: "/report", ms: 3500 },
];
const USERS = ["Sara", "Omar", "Lina", "Ali"];
const PRESETS: { method: Method; path: string }[] = [
  { method: "GET", path: "/products" },
  { method: "GET", path: "/products/2" },
  { method: "GET", path: "/products/9" },
  { method: "POST", path: "/products" },
  { method: "DELETE", path: "/products/1" },
  { method: "GET", path: "/report" },
];

/** Same matching the lesson's playground does: segments must line up, ":name" captures anything. */
function match(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split("/");
  const b = path.split("/");
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(":")) params[a[i].slice(1)] = b[i];
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

function route(req: Req) {
  const idx = ROUTES.findIndex((r) => r.method === req.method && match(r.path, req.path));
  return { idx, params: idx >= 0 ? match(ROUTES[idx].path, req.path)! : {} };
}

/** One server process, several users: requests queue, the router lights the matching row, one handler runs at a time. */
export default function NodeServerProblem() {
  const [queue, setQueue] = useState<Req[]>([]);
  const [current, setCurrent] = useState<Req | null>(null);
  const [done, setDone] = useState<Done[]>([]);
  const products = useRef(["Pen", "Book"]);
  const seq = useRef(0);

  function send(method: Method, path: string, user?: string) {
    const id = ++seq.current;
    setQueue((q) => [...q, { id, user: user ?? USERS[(id - 1) % USERS.length], method, path }]);
  }
  function rush() {
    USERS.forEach((u, k) => setTimeout(() => send("GET",k % 2 ? "/products/2" : "/products", u), k * 250));
  }

  // The event loop: when idle, take the next request; the handler "runs" for its route's time, then responds.
  useEffect(() => {
    if (current || queue.length === 0) return;
    const next = queue[0];
    setQueue((q) => q.slice(1));
    setCurrent(next);
  }, [current, queue]);

  useEffect(() => {
    if (!current) return;
    const { idx, params } = route(current);
    const ms = idx >= 0 ? ROUTES[idx].ms : 400;
    const t = setTimeout(() => {
      let status = 404;
      let body = `Cannot ${current.method} ${current.path}`;
      if (idx === 0) { status = 200; body = JSON.stringify(products.current); }
      if (idx === 1) {
        const p = products.current[Number(params.id) - 1];
        status = p ? 200 : 404;
        body = p ? JSON.stringify({ id: Number(params.id), name: p }) : '{"error":"not found"}';
      }
      if (idx === 2) { products.current.push("Bag"); status = 201; body = JSON.stringify({ id: products.current.length, name: "Bag" }); }
      if (idx === 3) { status = 200; body = '{"total":1234}'; }
      setDone((d) => [{ ...current, status, body }, ...d].slice(0, 6));
      setCurrent(null);
    }, ms);
    return () => clearTimeout(t);
  }, [current]);

  const active = current ? route(current) : null;
  const tone = (c: number) => (c < 300 ? "text-ok" : "text-str");
  const lastFor = (u: string) => done.find((d) => d.user === u);
  const waiting = (u: string) => queue.some((q) => q.user === u) || current?.user === u;
  const blocked = current?.path === "/report" && queue.length > 0;

  return (
    <div>
      <div className="flex flex-wrap gap-2" dir="ltr">
        {PRESETS.map((p) => (
          <motion.button key={p.method + p.path} whileTap={{ scale: 0.92 }} onClick={() => send(p.method, p.path)} className={`code rounded-xl border border-line px-3 py-1.5 text-sm ${p.path === "/report" ? "bg-surface-2 text-err" : "bg-surface"}`}>
            <b>{p.method}</b> {p.path}
          </motion.button>
        ))}
        <motion.button whileTap={{ scale: 0.92 }} onClick={rush} className="rounded-xl bg-accent px-4 py-1.5 text-sm font-bold text-accent-fg">
          4 users at once
        </motion.button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[10rem_1fr]">
        {/* Users */}
        <div className="flex flex-row flex-wrap gap-2 md:flex-col" dir="ltr">
          {USERS.map((u) => {
            const l = lastFor(u);
            return (
              <div key={u} className={`min-w-[8rem] rounded-xl border px-3 py-2 text-sm ${waiting(u) ? "border-accent" : "border-line"} bg-surface`}>
                <div className="font-bold">{u}</div>
                <div className="code text-xs text-muted">
                  {waiting(u) ? "waiting…" : l ? <span className={tone(l.status)}>{l.status}</span> : "—"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Server process */}
        <div className="rounded-2xl border border-line bg-surface p-4" dir="ltr">
          <div className="flex items-center justify-between text-sm">
            <span className="code font-bold">node server.js · :3000</span>
            <span className={`code text-xs ${current ? "text-bool" : "text-muted"}`}>{current ? `handling ${current.user}` : "waiting for requests"}</span>
          </div>

          <div className="mt-3 flex min-h-[2.5rem] flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted">queue:</span>
            <AnimatePresence>
              {queue.map((q) => (
                <motion.span key={q.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.5 }} className="code rounded-lg bg-surface-2 px-2 py-1 text-xs">
                  {q.user}: {q.method} {q.path}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-3 space-y-1.5">
            {ROUTES.map((r, k) => {
              const on = active?.idx === k;
              return (
                <motion.div key={k} animate={{ scale: on ? 1.02 : 1 }} className={`code flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${on ? "bg-accent text-accent-fg" : "bg-surface-2"}`}>
                  <span>{`app.${r.method.toLowerCase()}("${r.path}", handler)`}</span>
                  {on && Object.keys(active!.params).length > 0 && <span className="text-xs">params = {JSON.stringify(active!.params)}</span>}
                </motion.div>
              );
            })}
            {current && active?.idx === -1 && <div className="code text-xs text-str">no route matches → Express answers 404</div>}
          </div>

          <div className="mt-3">
            <div className="text-xs text-muted">responses:</div>
            <AnimatePresence initial={false}>
              {done.map((d) => (
                <motion.div key={d.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="code truncate text-xs leading-6">
                  <span className={`font-bold ${tone(d.status)}`}>{d.status}</span> → {d.user} <span className="text-muted">({d.method} {d.path})</span> {d.body}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {blocked && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-err">
          دالة /report بطيئة، والعملية واحدة: كل من خلفها ينتظر حتى تنتهي.
        </motion.p>
      )}
      {done.length >= 4 && !blocked && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          برنامج واحد لا ينتهي خدم الجميع: لكل طلب يطابق <b className="text-fg">الطريقة والمسار</b> بسطر في الجدول، يشغّل دالته، يرسل ردّاً واحداً، ثم يعود لينتظر.
        </motion.p>
      )}
    </div>
  );
}
