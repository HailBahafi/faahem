"use client";

import { motion } from "motion/react";
import { useState } from "react";

type Mw = { id: string; label: string };
const ALL: Mw[] = [
  { id: "logger", label: "logger" },
  { id: "auth", label: "auth" },
  { id: "cache", label: "cache" },
  { id: "handler", label: "handler" },
];

/** A request travelling through a middleware chain; each link decides whether to call next(). */
export default function JsPatternsProblem() {
  const [on, setOn] = useState<Record<string, boolean>>({ logger: true, auth: false, cache: false, handler: true });
  const [loggedIn, setLoggedIn] = useState(false);
  const [cached, setCached] = useState(false);
  const [pos, setPos] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [sent, setSent] = useState(0);

  const chain = ALL.filter((m) => on[m.id]);

  const send = () => {
    const lines: string[] = [];
    let stop = chain.length - 1;
    for (let i = 0; i < chain.length; i++) {
      const id = chain[i].id;
      if (id === "logger") lines.push("logger: GET /orders → next()");
      if (id === "auth") {
        if (!loggedIn) {
          lines.push("auth: no user → 401, no next()");
          stop = i;
          break;
        }
        lines.push("auth: ok → next()");
      }
      if (id === "cache") {
        if (cached) {
          lines.push("cache: hit → 200 from cache, no next()");
          stop = i;
          break;
        }
        lines.push("cache: miss → next(), then remember the reply");
      }
      if (id === "handler") {
        lines.push("handler: 200 orders");
        if (on.cache) setCached(true);
      }
    }
    setPos(stop);
    setLog(lines);
    setSent((s) => s + 1);
  };

  const toggle = (id: string) => {
    if (id === "handler") return;
    setOn((o) => ({ ...o, [id]: !o[id] }));
    setCached(false);
    setPos(null);
    setLog([]);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" dir="ltr">
        <span className="code rounded-lg bg-code px-3 py-2 text-xs text-white">request</span>
        {ALL.map((m) => {
          const idx = chain.findIndex((c) => c.id === m.id);
          const reached = pos !== null && idx !== -1 && idx <= pos;
          const stopped = pos !== null && idx === pos && m.id !== "handler";
          return (
            <div key={m.id} className="flex items-center gap-2">
              <span className="text-muted">→</span>
              <motion.button
                onClick={() => toggle(m.id)}
                animate={{ scale: reached ? 1.06 : 1, opacity: on[m.id] ? 1 : 0.35 }}
                className={`code rounded-xl px-3 py-2 text-sm font-bold ${
                  stopped ? "bg-err/20 text-err" : reached ? "bg-accent text-accent-fg" : "border border-line bg-surface"
                } ${on[m.id] ? "" : "line-through"}`}
              >
                {m.label}
              </motion.button>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-muted">اضغط على حلقة لتشغيلها أو إطفائها (المعالج ثابت).</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={loggedIn} onChange={(e) => setLoggedIn(e.target.checked)} />
          المستخدم مسجّل الدخول
        </label>
        <motion.button whileTap={{ scale: 0.94 }} onClick={send} className="rounded-xl bg-accent px-5 py-2 font-bold text-accent-fg">
          أرسل الطلب
        </motion.button>
      </div>
      <div className="code mt-3 min-h-20 rounded-2xl bg-code p-3 text-xs text-white" dir="ltr">
        {log.map((l, i) => (
          <motion.div key={`${sent}-${i}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}>
            {l}
          </motion.div>
        ))}
      </div>
      {sent >= 2 && (on.auth || on.cache) && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          أضفت حماية وذاكرة مؤقتة دون أن تلمس سطراً في المعالج: كل ميزة <b className="text-fg">دالة مستقلة في سلسلة</b>، تقرر وحدها هل تمرّر الطلب.
        </motion.p>
      )}
    </div>
  );
}
