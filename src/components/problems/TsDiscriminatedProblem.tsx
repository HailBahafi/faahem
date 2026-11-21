"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Status = "loading" | "done" | "failed";

/** Three independent optional flags allow eight states, most of them nonsense; one tag allows exactly the real ones. */
export default function TsDiscriminatedProblem() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(false);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [seen, setSeen] = useState<Set<string>>(new Set(["100"]));

  const key = `${+loading}${+data}${+error}`;
  const valid = key === "100" || key === "010" || key === "001";
  const flip = (v: boolean, set: (b: boolean) => void, which: number) => {
    set(!v);
    const k = key.split("");
    k[which] = v ? "0" : "1";
    setSeen((s) => new Set(s).add(k.join("")));
  };
  const bad = [...seen].filter((k) => k !== "100" && k !== "010" && k !== "001").length;

  const flag = (name: string, on: boolean, set: (b: boolean) => void, i: number) => (
    <button
      onClick={() => flip(on, set, i)}
      className={`code flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm ${on ? "border-accent bg-accent/15" : "border-line bg-surface"}`}
    >
      <span className={`inline-block h-4 w-7 rounded-full p-0.5 ${on ? "bg-accent" : "bg-line"}`}>
        <motion.span layout className={`block h-3 w-3 rounded-full bg-white ${on ? "ml-auto" : ""}`} />
      </span>
      {name}
    </button>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className={`rounded-2xl border p-4 ${valid ? "border-line bg-surface" : "border-err bg-err/10"}`}>
        <div dir="ltr" className="code text-xs text-muted">
          {"{ loading: boolean; data?: Order; error?: string }"}
        </div>
        <div className="mt-3 flex flex-wrap gap-2" dir="ltr">
          {flag("loading", loading, setLoading, 0)}
          {flag("data", data, setData, 1)}
          {flag("error", error, setError, 2)}
        </div>
        <Screen loading={loading} data={data} error={error} />
        <div className="mt-2 text-sm text-muted">
          حالات بلا معنى جرّبتها: <b className={bad ? "text-err" : "text-fg"}>{bad}</b> من 5 (المدقّق يقبلها كلها)
        </div>
      </div>

      <div className="rounded-2xl border border-accent/50 bg-accent/5 p-4">
        <div dir="ltr" className="code text-xs text-muted">
          {'{ status: "loading" } | { status: "done"; data } | { status: "failed"; error }'}
        </div>
        <div className="mt-3 flex flex-wrap gap-2" dir="ltr">
          {(["loading", "done", "failed"] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`code rounded-xl border px-3 py-1.5 text-sm ${status === s ? "border-accent bg-accent/15" : "border-line bg-surface"}`}
            >
              status: &quot;{s}&quot;
            </button>
          ))}
        </div>
        <Screen loading={status === "loading"} data={status === "done"} error={status === "failed"} />
        <div className="mt-2 text-sm text-muted">ثلاث حالات فقط، وكل واحدة تحمل حقولها. لا مفتاح يصنع حالة مستحيلة.</div>
      </div>
    </div>
  );
}

function Screen({ loading, data, error }: { loading: boolean; data: boolean; error: boolean }) {
  const parts = [loading && "spinner", data && "order #42", error && "error: timeout"].filter(Boolean) as string[];
  const confused = parts.length !== 1;
  return (
    <div className={`code mt-3 flex min-h-[64px] flex-wrap items-center justify-center gap-2 rounded-xl bg-code p-3 text-sm ${confused ? "ring-1 ring-err" : ""}`} dir="ltr">
      <AnimatePresence mode="popLayout" initial={false}>
        {parts.length === 0 ? (
          <motion.span key="blank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            (blank screen?)
          </motion.span>
        ) : (
          parts.map((p) => (
            <motion.span
              key={p}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`rounded-lg px-2 py-1 ${p.startsWith("error") ? "bg-err/15 text-err" : p === "spinner" ? "bg-accent/15" : "bg-ok/15 text-ok"}`}
            >
              {p}
            </motion.span>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
