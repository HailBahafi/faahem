"use client";

import { motion } from "motion/react";
import { useState } from "react";

const METHODS = 3;
const DOTS = 40;

/** Methods copied into every object, against one shared prototype every object links to. */
export default function JsPrototypesProblem() {
  const [users, setUsers] = useState(10);
  const [added, setAdded] = useState(false);
  const methods = METHODS + (added ? 1 : 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3">
          <span className="text-sm">عدد المستخدمين</span>
          <input type="range" min={1} max={1000} value={users} onChange={(e) => setUsers(Number(e.target.value))} className="accent-[var(--accent)]" />
          <span className="code w-12 text-num">{users}</span>
        </label>
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={added}
          onClick={() => setAdded(true)}
          className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg disabled:opacity-50"
        >
          أضف طريقة rename للجميع
        </motion.button>
        {added && (
          <button onClick={() => setAdded(false)} className="text-sm text-muted hover:text-fg">
            ابدأ من جديد
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel
          title="كل كائن يحمل نسخه"
          code={"{ name, greet() {...}, save() {...}, ... }"}
          functions={users * METHODS}
          max={1000 * (METHODS + 1)}
          bad
          users={users}
          hasNew={false}
          note={added ? `الطريقة الجديدة لم تصل إلى ${users} كائن موجود: كل كائن يحمل نسخة قديمة. ستحتاج تعديل كل واحد.` : "كل مستخدم جديد يجلب نسخاً جديدة من الدوال نفسها."}
        />
        <Panel
          title="نموذج أولي واحد مشترك"
          code={"Object.create(userProto)"}
          functions={methods}
          max={1000 * (METHODS + 1)}
          users={users}
          hasNew={added}
          note={added ? "سطر واحد في userProto، وكل الكائنات تجدها فوراً عبر رابطها." : "الكائنات تحمل بياناتها فقط، وتصل إلى الطرق عبر رابط مخفي."}
        />
      </div>

      {added && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          هذا هو <b className="text-fg">النموذج الأولي</b>: الطرق تعيش مرة واحدة في كائن مشترك، وكل كائن يبحث فيه حين لا يجد الخاصية عنده.
        </motion.p>
      )}
    </div>
  );
}

function Panel(p: { title: string; code: string; functions: number; max: number; bad?: boolean; users: number; hasNew: boolean; note: string }) {
  const shown = Math.min(p.users, DOTS);
  return (
    <div className={`rounded-2xl border p-4 ${p.bad ? "border-line bg-surface" : "border-accent/50 bg-accent-soft/20"}`}>
      <div className="font-semibold">{p.title}</div>
      <div className="code text-xs text-muted" dir="ltr">{p.code}</div>
      <div className="mt-3 flex flex-wrap gap-1" dir="ltr">
        {Array.from({ length: shown }, (_, i) => (
          <motion.span
            key={i}
            animate={{ backgroundColor: p.hasNew ? "var(--ok)" : "var(--border)" }}
            transition={{ delay: p.hasNew ? i * 0.01 : 0 }}
            className="h-3 w-3 rounded-full"
          />
        ))}
        {p.users > DOTS && <span className="text-xs text-muted">+{p.users - DOTS}</span>}
      </div>
      <div className="mt-3 text-sm">
        دوال في الذاكرة: <span className={`code font-bold ${p.bad ? "text-err" : "text-ok"}`}>{p.functions}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-code">
        <motion.div animate={{ width: `${Math.max(1, (p.functions / p.max) * 100)}%` }} className={`h-full ${p.bad ? "bg-err" : "bg-ok"}`} />
      </div>
      <p className="mt-2 text-xs text-muted">{p.note}</p>
    </div>
  );
}
