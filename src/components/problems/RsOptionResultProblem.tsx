"use client";

import { motion } from "motion/react";
import { useState } from "react";

const USERS: Record<number, string> = { 1: "Sara", 2: "Omar", 3: "Lina" };

/** Looking up a missing user: JavaScript crashes at run time, Rust's Option makes the missing case part of the type. */
export default function RsOptionResultProblem() {
  const [id, setId] = useState<number | null>(null);
  const [forgetNone, setForgetNone] = useState(false);

  const found = id !== null ? USERS[id] : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted">ابحث عن المستخدم رقم:</span>
        {[1, 2, 3, 7].map((n) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.9 }}
            onClick={() => setId(n)}
            className={`code h-10 w-10 rounded-xl font-bold ${id === n ? "bg-accent text-accent-fg" : "border border-line"}`}
          >
            {n}
          </motion.button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="font-semibold">JavaScript</div>
          <pre className="code mt-2 rounded-lg bg-code p-3 text-xs" dir="ltr">{`const user = users.find(u => u.id === ${id ?? "id"});
console.log(user.name);`}</pre>
          {id !== null && (
            <motion.div key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`code mt-2 text-sm ${found ? "" : "text-err"}`} dir="ltr">
              {found ?? "TypeError: Cannot read properties of undefined (reading 'name')"}
            </motion.div>
          )}
          {id !== null && !found && <p className="mt-2 text-sm text-muted">انهار عند التشغيل، أمام المستخدم.</p>}
        </div>
        <div className="rounded-2xl border border-accent/50 bg-accent-soft/20 p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Rust</span>
            <label className="flex items-center gap-1 text-xs text-muted">
              <input type="checkbox" checked={forgetNone} onChange={(e) => setForgetNone(e.target.checked)} />
              انسَ فرع None
            </label>
          </div>
          <pre className="code mt-2 rounded-lg bg-code p-3 text-xs" dir="ltr">{`match find_user(${id ?? "id"}) {
    Some(name) => println!("{}", name),${forgetNone ? "" : `
    None => println!("not found"),`}
}`}</pre>
          {forgetNone ? (
            <div className="code mt-2 text-sm text-err" dir="ltr">
              error[E0004]: non-exhaustive patterns: `None` not covered
            </div>
          ) : (
            id !== null && (
              <motion.div key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="code mt-2 text-sm" dir="ltr">
                {found ?? "not found"}
              </motion.div>
            )
          )}
          {forgetNone && <p className="mt-2 text-sm text-muted">find_user ترجع Option، فالمترجم لا يقبل برنامجاً ينسى حالة «غير موجود».</p>}
        </div>
      </div>
    </div>
  );
}
