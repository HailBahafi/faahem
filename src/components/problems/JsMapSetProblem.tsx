"use client";

import { motion } from "motion/react";
import { useState } from "react";

const USERS = ["Sara", "Omar"] as const;
type Name = (typeof USERS)[number];

/** Counting visits keyed by user objects: a plain object turns both keys into "[object Object]", a Map keeps them apart. */
export default function JsMapSetProblem() {
  const [visits, setVisits] = useState<Record<Name, number>>({ Sara: 0, Omar: 0 });
  const total = visits.Sara + visits.Omar;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-muted">زيارة من:</span>
        {USERS.map((u) => (
          <motion.button
            key={u}
            whileTap={{ scale: 0.9 }}
            onClick={() => setVisits((v) => ({ ...v, [u]: v[u] + 1 }))}
            className="code rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg"
          >
            {`{ name: "${u}" }`}
          </motion.button>
        ))}
        {total > 0 && (
          <button onClick={() => setVisits({ Sara: 0, Omar: 0 })} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2" dir="ltr">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="code mb-3 text-sm">plain[user] = (plain[user] ?? 0) + 1</div>
          {total === 0 ? (
            <div className="code text-sm text-muted">{"{}"}</div>
          ) : (
            <Row k={'"[object Object]"'} v={total} bad />
          )}
        </div>
        <div className="rounded-2xl border border-accent/50 bg-accent-soft/20 p-4">
          <div className="code mb-3 text-sm">visits.set(user, (visits.get(user) ?? 0) + 1)</div>
          <div className="space-y-2">
            {USERS.filter((u) => visits[u] > 0).map((u) => (
              <Row key={u} k={`{ name: "${u}" }`} v={visits[u]} />
            ))}
            {total === 0 && <div className="code text-sm text-muted">Map(0) {"{}"}</div>}
          </div>
        </div>
      </div>

      <div className="mt-4 min-h-12 text-center">
        {visits.Sara > 0 && visits.Omar > 0 ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            الكائن العادي حوّل كل مستخدم إلى النص نفسه <span className="code">&quot;[object Object]&quot;</span>، فخلط الاثنين. أما Map فتحفظ الكائن نفسه مفتاحاً.
          </motion.p>
        ) : (
          <p className="text-muted">زُر بالمستخدمين الاثنين.</p>
        )}
      </div>
    </div>
  );
}

function Row({ k, v, bad }: { k: string; v: number; bad?: boolean }) {
  return (
    <div className="code flex items-center justify-between rounded-lg bg-code px-3 py-2 text-sm">
      <span className={bad ? "text-err" : "text-str"}>{k}</span>
      <motion.span key={v} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-lg font-bold text-num">
        {v}
      </motion.span>
    </div>
  );
}
