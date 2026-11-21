"use client";

import { motion } from "motion/react";
import { useState } from "react";

type Arch = "tangled" | "layered";
type Change = "db" | "discount" | "cli";

const FILES: Record<Arch, { path: string; group: string }[]> = {
  tangled: [
    { path: "routes/orders.js", group: "routes" },
    { path: "routes/users.js", group: "routes" },
    { path: "routes/admin.js", group: "routes" },
    { path: "jobs/invoices.js", group: "jobs" },
    { path: "lib/utils.js", group: "lib" },
    { path: "lib/db.js", group: "lib" },
    { path: "cli.js", group: "new" },
  ],
  layered: [
    { path: "domain/pricing.js", group: "domain" },
    { path: "domain/order.js", group: "domain" },
    { path: "app/placeOrder.js", group: "app" },
    { path: "app/refund.js", group: "app" },
    { path: "adapters/http.js", group: "adapters" },
    { path: "adapters/postgresOrders.js", group: "adapters" },
    { path: "adapters/sqliteOrders.js", group: "new" },
    { path: "adapters/cli.js", group: "new" },
    { path: "main.js", group: "root" },
  ],
};

/** Which files each business change touches, in a tangled codebase and in a layered one. */
const TOUCHED: Record<Change, Record<Arch, string[]>> = {
  db: {
    tangled: ["routes/orders.js", "routes/users.js", "routes/admin.js", "jobs/invoices.js", "lib/db.js"],
    layered: ["adapters/sqliteOrders.js", "main.js"],
  },
  discount: {
    tangled: ["routes/orders.js", "routes/admin.js", "jobs/invoices.js", "lib/utils.js"],
    layered: ["domain/pricing.js"],
  },
  cli: {
    tangled: ["cli.js", "routes/orders.js", "lib/utils.js", "lib/db.js"],
    layered: ["adapters/cli.js", "main.js"],
  },
};

const CHANGES: { id: Change; label: string }[] = [
  { id: "db", label: "انقل الطلبات من Postgres إلى SQLite" },
  { id: "discount", label: "قاعدة خصم جديدة" },
  { id: "cli", label: "أداة سطر أوامر تنشئ طلباً" },
];

export default function JsArchitectureProblem() {
  const [change, setChange] = useState<Change | null>(null);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CHANGES.map((c) => (
          <button
            key={c.id}
            onClick={() => setChange(c.id)}
            className={`rounded-xl px-3 py-2 text-sm ${change === c.id ? "bg-accent font-bold text-accent-fg" : "border border-line bg-surface"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {(["tangled", "layered"] as Arch[]).map((arch) => {
          const touched = change ? TOUCHED[change][arch] : [];
          return (
            <div key={arch} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">{arch === "tangled" ? "كل ملف يستورد كل شيء" : "طبقات: الأسهم إلى الداخل"}</span>
                {change && (
                  <motion.span key={change + arch} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className={`code text-xl font-bold ${arch === "tangled" ? "text-err" : "text-ok"}`}>
                    {touched.length}
                  </motion.span>
                )}
              </div>
              <ul className="code mt-3 space-y-1 text-xs" dir="ltr">
                {FILES[arch]
                  .filter((f) => f.group !== "new" || touched.includes(f.path))
                  .map((f) => {
                    const hit = touched.includes(f.path);
                    return (
                      <motion.li
                        key={f.path}
                        layout
                        animate={{ opacity: hit || !change ? 1 : 0.45 }}
                        className={`flex justify-between rounded-lg px-2 py-1 ${hit ? (arch === "tangled" ? "bg-err/15 text-err" : "bg-accent/15 text-fg") : ""}`}
                      >
                        <span>{f.path}</span>
                        <span className="text-muted">{f.group === "new" ? "new" : f.group}</span>
                      </motion.li>
                    );
                  })}
              </ul>
            </div>
          );
        })}
      </div>

      {change && (
        <motion.p key={change} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          {change === "discount"
            ? "قاعدة السعر في الطرف الأول منسوخة في كل مكان يحسب سعراً. في الطبقات لها بيت واحد: domain."
            : "في الطرف الأول SQL وتفاصيل الواجهة مبعثرة في كل ملف. في الطبقات تعيش التفاصيل على الحافة، والجذر main.js يختار أي قطعة توصل."}
        </motion.p>
      )}
    </div>
  );
}
