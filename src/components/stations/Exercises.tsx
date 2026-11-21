"use client";

import { motion, Reorder } from "motion/react";
import { useEffect, useState } from "react";
import { explain, runCode } from "@/lib/runners";
import type { Exercise } from "@/lib/types";
import { Check } from "../icons";
import { highlight } from "../scene/CodePanel";
import CodeEditor from "./CodeEditor";

type Verdict = { ok: boolean; got: string; err: string | null } | null;

/** Runs the learner's answer in the exercise's language, or compares it directly for "text" exercises. */
async function check(ex: Exercise, code: string, raw: { order?: string[]; pick?: string } = {}): Promise<Verdict> {
  const lang = ex.lang ?? "js";
  if (lang === "text") {
    const ok = raw.order ? raw.order.join("\n") === (ex as { lines: string[] }).lines.join("\n") : raw.pick === ex.answer;
    return { ok, got: "", err: ok ? null : raw.order ? "الترتيب غير صحيح بعد." : "ليس هذا الخيار. فكّر في ما يحدث فعلاً." };
  }
  const r = await runCode(lang, code, ex.check, ex.setup);
  if (r.error?.name === "Unavailable") {
    // No run server yet (Go, Rust, Dart): order and fill can still be checked against their answer.
    if (raw.order) {
      const ok = raw.order.join("\n") === (ex as { lines: string[] }).lines.join("\n");
      return { ok, got: "", err: ok ? null : "الترتيب غير صحيح بعد." };
    }
    if (raw.pick !== undefined && ex.answer !== undefined) {
      const ok = raw.pick === ex.answer;
      return { ok, got: "", err: ok ? null : "ليس هذا الخيار. فكّر في ما يحدث فعلاً." };
    }
    return { ok: false, got: "", err: `${r.error.message} قارن حلّك بالحل، أو شغّله على جهازك.` };
  }
  const got = r.out.join("\n").trim();
  return { ok: !r.error && !r.timedOut && got === ex.expected.trim(), got, err: explain(lang, r) };
}

const KIND_LABEL = { order: "رتّب", fill: "أكمل", fix: "أصلح", write: "اكتب" };

export default function Exercises({ items }: { items: Exercise[] }) {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<boolean[]>(items.map(() => false));
  const ex = items[active];

  const markDone = () => setDone((d) => d.map((v, k) => (k === active ? true : v)));

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4">
        {items.map((it, k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`flex items-center gap-2 rounded-xl border p-3 text-start text-sm ${k === active ? "border-accent bg-accent-soft/40" : "border-line bg-surface"}`}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${done[k] ? "bg-ok text-white" : "bg-surface-2 text-muted"}`}>
              {done[k] ? <Check className="h-4 w-4" /> : k + 1}
            </span>
            <span>
              <span className="block text-xs text-muted">{KIND_LABEL[it.kind]}</span>
              <span className="font-semibold">{it.title}</span>
            </span>
          </button>
        ))}
      </div>

        <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-4 text-lg leading-8">{ex.prompt}</p>
          {ex.kind === "order" && <OrderEx ex={ex} onDone={markDone} />}
          {ex.kind === "fill" && <FillEx ex={ex} onDone={markDone} />}
          {(ex.kind === "fix" || ex.kind === "write") && <EditEx ex={ex} onDone={markDone} />}
          {done[active] && active < items.length - 1 && (
            <button onClick={() => setActive(active + 1)} className="mt-4 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-fg">
              التمرين التالي
            </button>
          )}
        </motion.div>
    </div>
  );
}

function Feedback({ v, expected, hint }: { v: Verdict; expected: string; hint?: string }) {
  if (!v) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mt-4 rounded-xl border p-4 text-sm leading-7 ${v.ok ? "border-ok/40 bg-ok/10" : "border-err/40 bg-err/10"}`}
    >
      {v.ok ? (
        <span className="font-bold text-ok">أحسنت! البرنامج طبع النتيجة الصحيحة.</span>
      ) : (
        <>
          <div className="font-bold text-err">لم ينجح بعد.</div>
          {v.err ? <div>{v.err}</div> : (
            <div>
              المتوقع أن يُطبع <code className="code rounded bg-surface-2 px-1">{expected}</code>
              {" "}لكن طُبع <code className="code rounded bg-surface-2 px-1">{v.got || "(لا شيء)"}</code>
            </div>
          )}
          {hint && <div className="mt-1 text-muted">تلميح: {hint}</div>}
        </>
      )}
    </motion.div>
  );
}

function CheckBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="mt-4 rounded-xl bg-fg px-5 py-2.5 text-sm font-semibold text-bg hover:opacity-90">
      تحقّق
    </button>
  );
}

function OrderEx({ ex, onDone }: { ex: Extract<Exercise, { kind: "order" }>; onDone: () => void }) {
  const [order, setOrder] = useState<string[]>(ex.lines);
  const [v, setV] = useState<Verdict>(null);
  // Shuffle after mount so server and client render the same first frame.
  useEffect(() => {
    const a = [...ex.lines];
    do {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
    } while (a.join() === ex.lines.join());
    setOrder(a);
  }, [ex.lines]);

  return (
    <div>
      <p className="mb-2 text-sm text-muted">اسحب الأسطر لترتيبها:</p>
      <Reorder.Group axis="y" values={order} onReorder={(o) => { setOrder(o); setV(null); }} className="space-y-2" dir="ltr">
        {order.map((l) => (
          <Reorder.Item
            key={l}
            value={l}
            className="code flex cursor-grab items-center gap-3 rounded-xl bg-code px-4 py-3 text-sm text-code-fg ring-1 ring-white/5 active:cursor-grabbing"
            whileDrag={{ scale: 1.03, boxShadow: "0 12px 30px -10px var(--accent)" }}
          >
            <span className="text-white/30">⋮⋮</span>
            <span>{highlight(l)}</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <CheckBtn onClick={async () => { const r = await check(ex, order.join("\n"), { order }); setV(r); if (r?.ok) onDone(); }} />
      <Feedback v={v} expected={ex.expected} hint="أنشئ الأدراج أولاً، ثم احسب، ثم اطبع." />
    </div>
  );
}

function FillEx({ ex, onDone }: { ex: Extract<Exercise, { kind: "fill" }>; onDone: () => void }) {
  const [pick, setPick] = useState<string | null>(null);
  const [v, setV] = useState<Verdict>(null);
  const [before, after] = ex.template.split("___");
  return (
    <div>
      <div className="code whitespace-pre rounded-2xl bg-code p-5 text-[15px] leading-8 text-code-fg" dir="ltr">
        {highlight(before)}
        <motion.span
          key={pick}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          className={`inline-block min-w-16 rounded-md border-2 border-dashed px-2 text-center ${pick ? "border-[var(--accent)] text-[var(--accent)]" : "border-white/30 text-white/30"}`}
        >
          {pick ?? "?"}
        </motion.span>
        {after.split("\n").map((l, k) => (<span key={k}>{k > 0 && "\n"}{highlight(l)}</span>))}
      </div>
      <div className="mt-3 flex gap-2" dir="ltr">
        {ex.options.map((o) => (
          <button key={o} onClick={() => { setPick(o); setV(null); }} className={`code rounded-xl border px-4 py-2 ${pick === o ? "border-accent bg-accent-soft/40" : "border-line bg-surface"}`}>
            {o}
          </button>
        ))}
      </div>
      {pick && <CheckBtn onClick={async () => { const r = await check(ex, before + pick + after, { pick }); setV(r); if (r?.ok) onDone(); }} />}
      <Feedback v={v} expected={ex.expected} />
    </div>
  );
}

function EditEx({ ex, onDone }: { ex: Extract<Exercise, { kind: "fix" | "write" }>; onDone: () => void }) {
  const [code, setCode] = useState(ex.kind === "fix" ? ex.code : ex.starter);
  const [v, setV] = useState<Verdict>(null);
  return (
    <div>
      <div className="overflow-hidden rounded-2xl bg-code ring-1 ring-white/5">
        <CodeEditor value={code} onChange={(c) => { setCode(c); setV(null); }} lang={ex.lang && ex.lang !== "text" ? ex.lang : "js"} />
      </div>
      <CheckBtn onClick={async () => { const r = await check(ex, code); setV(r); if (r?.ok) onDone(); }} />
      <Feedback v={v} expected={ex.expected} hint={v && !v.ok ? ex.hint : undefined} />
    </div>
  );
}
