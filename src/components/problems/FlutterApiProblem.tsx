"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "waiting" | "error" | "data";

const NETS = [
  { label: "سريعة", ms: 500, ok: true },
  { label: "بطيئة", ms: 3500, ok: true },
  { label: "مقطوعة", ms: 2000, ok: false },
];

const PRODUCTS = [
  { name: "Tea", price: 5 },
  { name: "Coffee", price: 12 },
  { name: "Cake", price: 18 },
  { name: "Juice", price: 9 },
];

const BRANCHES: { phase: Phase; code: string }[] = [
  { phase: "error", code: "if (snap.hasError) return ErrorView(onRetry: retry);" },
  { phase: "waiting", code: "if (!snap.hasData) return CircularProgressIndicator();" },
  { phase: "data", code: "return ListView(children: [for (final p in snap.data!) ProductTile(p)]);" },
];

/** A phone fetching products from a fake API, with a network-quality slider: spinner, error with retry, list. */
export default function FlutterApiProblem() {
  const [net, setNet] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [log, setLog] = useState<{ text: string; ok: boolean }[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t0 = useRef(0);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  useEffect(() => {
    if (phase !== "waiting") return;
    const id = setInterval(() => setElapsed(performance.now() - t0.current), 100);
    return () => clearInterval(id);
  }, [phase]);

  const load = () => {
    if (timer.current) clearTimeout(timer.current);
    const n = NETS[net];
    t0.current = performance.now();
    setElapsed(0);
    setPhase("waiting");
    setLog((l) => [...l.slice(-3), { text: "GET /products ...", ok: true }]);
    timer.current = setTimeout(() => {
      const s = (n.ms / 1000).toFixed(1);
      setElapsed(n.ms);
      setPhase(n.ok ? "data" : "error");
      setLog((l) => [
        ...l.slice(0, -1),
        n.ok ? { text: `GET /products → 200 OK, ${PRODUCTS.length} products (${s}s)`, ok: true } : { text: `GET /products → SocketException: no network (${s}s)`, ok: false },
      ]);
    }, n.ms);
  };

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="mb-2 text-sm text-muted">جودة الشبكة</div>
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={net}
          onChange={(e) => setNet(Number(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
          aria-label="network quality"
        />
        <div className="mt-1 flex justify-between text-sm">
          {NETS.map((n, k) => (
            <button key={n.label} onClick={() => setNet(k)} className={k === net ? (n.ok ? "font-bold text-ok" : "font-bold text-err") : "text-muted"}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-center gap-6">
        <div className="w-64 shrink-0 rounded-[2rem] border-4 border-line bg-bg p-3 shadow-lg">
          <div dir="ltr" className="flex items-center justify-between rounded-xl bg-surface px-3 py-2">
            <b>Shop</b>
            <span className="code text-xs text-muted">{phase === "waiting" ? `${(elapsed / 1000).toFixed(1)}s` : ""}</span>
          </div>
          <div className="mt-2 flex h-64 flex-col rounded-xl bg-surface p-2">
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="m-auto">
                  <motion.button whileTap={{ scale: 0.94 }} onClick={load} className="rounded-2xl bg-accent px-5 py-3 font-bold text-accent-fg">
                    افتح التطبيق
                  </motion.button>
                </motion.div>
              )}
              {phase === "waiting" && (
                <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="m-auto flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                    className="h-10 w-10 rounded-full border-4 border-line border-t-accent"
                  />
                  <span className="text-sm text-muted">جارٍ التحميل…</span>
                </motion.div>
              )}
              {phase === "error" && (
                <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="m-auto flex flex-col items-center gap-3 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-err text-xl font-bold text-white">!</div>
                  <span className="text-sm">تعذّر تحميل المنتجات.<br />تحقق من اتصالك.</span>
                  <motion.button whileTap={{ scale: 0.94 }} onClick={load} className="rounded-xl bg-accent px-4 py-2 font-bold text-accent-fg">
                    أعد المحاولة
                  </motion.button>
                </motion.div>
              )}
              {phase === "data" && (
                <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
                  {PRODUCTS.map((p, k) => (
                    <motion.div
                      key={p.name}
                      dir="ltr"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: k * 0.07 }}
                      className="flex justify-between rounded-lg bg-bg px-3 py-2 text-sm"
                    >
                      <span>{p.name}</span>
                      <span className="code text-num">{p.price} SAR</span>
                    </motion.div>
                  ))}
                  <button onClick={load} className="w-full pt-1 text-center text-xs text-muted underline">
                    حدّث
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="min-w-0 flex-1 basis-72 space-y-3">
          <div>
            <div className="mb-1 text-sm text-muted">الفرع الذي يرسمه builder الآن</div>
            <div dir="ltr" className="code overflow-x-auto rounded-xl bg-code p-2 text-xs">
              {BRANCHES.map((b) => (
                <div
                  key={b.phase}
                  className={`whitespace-pre rounded px-2 py-1 transition-colors ${phase === b.phase ? "bg-accent text-accent-fg" : "opacity-60"}`}
                >
                  {b.code}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-muted">الشبكة</div>
            <div dir="ltr" className="code min-h-16 rounded-xl bg-code p-2 text-xs">
              {log.length === 0 && <div className="opacity-50">(no requests yet)</div>}
              {log.map((l, k) => (
                <div key={k} className={l.ok ? "" : "text-err"}>{l.text}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {log.length >= 2 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          الطلب نفسه، والشاشة مختلفة حسب المرحلة. على الهاتف الانتظار والفشل يحدثان كل يوم، لذلك تصمّم{" "}
          <b className="code text-fg">FutureBuilder</b> ثلاث شاشات: انتظار، وخطأ مع إعادة المحاولة، وبيانات.
        </motion.p>
      )}
    </div>
  );
}
