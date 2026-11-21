"use client";

import { motion } from "motion/react";
import { useState } from "react";

/** A spread copy: changing a top-level field stays in the copy; changing a nested field reaches the original. */
export default function JsDestructuringProblem() {
  const [copyName, setCopyName] = useState("Sara");
  const [city, setCity] = useState("Riyadh");
  const [last, setLast] = useState<"name" | "city" | null>(null);

  const reset = () => {
    setCopyName("Sara");
    setCity("Riyadh");
    setLast(null);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setCopyName("Omar");
            setLast("name");
          }}
          className="code rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg"
        >
          copy.name = &quot;Omar&quot;
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setCity("Jeddah");
            setLast("city");
          }}
          className="code rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg"
        >
          copy.address.city = &quot;Jeddah&quot;
        </motion.button>
        {last && (
          <button onClick={reset} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2" dir="ltr">
        <Card title="user" name="Sara" city={city} flashCity={last === "city"} />
        <Card title="copy = { ...user }" name={copyName} city={city} flashName={last === "name"} flashCity={last === "city"} />
      </div>

      <div className="mt-4 min-h-12 text-center">
        {last === null && <p className="text-muted">غيّر شيئاً في النسخة، وراقب user.</p>}
        {last === "name" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            الاسم تغيّر في النسخة وحدها. حتى الآن تبدو نسخة حقيقية.
          </motion.p>
        )}
        {last === "city" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            المدينة تغيّرت في <b className="text-err">الاثنين</b>. النشر نسخ الطبقة الأولى فقط، و address في الاثنين يشير إلى الكائن نفسه.
          </motion.p>
        )}
      </div>
    </div>
  );
}

function Card({ title, name, city, flashName, flashCity }: { title: string; name: string; city: string; flashName?: boolean; flashCity?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="code mb-3 text-sm text-muted">{title}</div>
      <div className="code space-y-2 text-sm">
        <motion.div key={`n${name}`} initial={flashName ? { scale: 1.15 } : false} animate={{ scale: 1 }} className="rounded-lg bg-code px-3 py-2">
          name: <span className="text-str">&quot;{name}&quot;</span>
        </motion.div>
        <motion.div
          key={`c${city}`}
          initial={flashCity ? { scale: 1.15 } : false}
          animate={{ scale: 1 }}
          className={`rounded-lg border border-dashed px-3 py-2 ${flashCity ? "border-err" : "border-line"}`}
        >
          address: → <span className="text-muted">{"{"}</span> city: <span className="text-str">&quot;{city}&quot;</span> <span className="text-muted">{"}"}</span>
        </motion.div>
      </div>
    </div>
  );
}
