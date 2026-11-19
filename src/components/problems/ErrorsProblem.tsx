"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

// Floors of the call stack, top (where the error is thrown) first.
const FLOORS = ["checkAge(-3)", "register(\"Sara\", -3)", "global"];
const GROUND = FLOORS.length;

type Phase = "idle" | "falling" | "caught" | "crashed";

/** An error (a parcel) drops floor by floor down the call stack until a net (catch) stops it. */
export default function ErrorsProblem() {
  const [net, setNet] = useState<number | null>(null);
  const [pos, setPos] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (phase !== "falling") return;
    const t = setTimeout(() => {
      if (pos === net) return setPhase("caught");
      if (pos + 1 >= GROUND) {
        setPos(GROUND);
        return setPhase("crashed");
      }
      setPos(pos + 1);
    }, 650);
    return () => clearTimeout(t);
  }, [phase, pos, net]);

  const drop = () => {
    setPos(0);
    setPhase("falling");
  };
  const reset = () => {
    setPos(0);
    setPhase("idle");
  };
  const toggleNet = (k: number) => {
    if (phase === "falling") return;
    setNet(net === k ? null : k);
    reset();
  };

  const parcel = (
    <motion.div
      layoutId="parcel"
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="code rounded-lg bg-err px-2 py-1 text-xs font-bold text-white shadow"
      dir="ltr"
    >
      Error: age cannot be negative
    </motion.div>
  );

  return (
    <div>
      <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
        {FLOORS.map((f, k) => {
          const gone = phase !== "idle" && pos > k;
          return (
            <div key={f} className="relative">
              <motion.div
                animate={{ opacity: gone ? 0.3 : 1 }}
                className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-line bg-code px-4 py-2"
              >
                <span className={`code text-sm ${gone ? "line-through text-muted" : ""}`} dir="ltr">
                  {f}
                </span>
                {pos === k && phase !== "idle" && phase !== "crashed" && parcel}
                {phase === "idle" && k === 0 && parcel}
              </motion.div>
              <button
                onClick={() => toggleNet(k)}
                className={`mt-1 w-full rounded-lg border-2 border-dashed py-1 text-xs font-bold transition-colors ${
                  net === k ? "border-ok bg-ok/15 text-ok" : "border-line text-muted hover:border-accent"
                }`}
              >
                {net === k ? "catch ✓ شبكة هنا" : "ضع شبكة هنا"}
              </button>
            </div>
          );
        })}
        <div className="flex min-h-12 items-center justify-center rounded-xl border-2 border-err/40 px-4 py-2">
          {phase === "crashed" ? parcel : <span className="text-sm text-muted">الأرض: البرنامج يتوقف</span>}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={phase === "falling"}
          onClick={drop}
          className="code rounded-2xl bg-accent px-6 py-3 text-lg font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
          dir="ltr"
        >
          throw
        </motion.button>
        {phase !== "idle" && phase !== "falling" && (
          <button onClick={reset} className="text-sm text-muted hover:text-fg">
            أعد الطرد
          </button>
        )}
      </div>

      <div className="mt-3 min-h-12">
        {phase === "idle" && <p className="text-muted">اختر طابقاً للشبكة (أو لا شيء)، ثم اضغط throw.</p>}
        {phase === "crashed" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-err">
            لا شبكة في أي طابق: سقط الخطأ حتى الأرض فتوقف البرنامج كله. لكن الرسالة تخبرك بالضبط ماذا حدث.
          </motion.p>
        )}
        {phase === "caught" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            التقطته الشبكة في الطابق{" "}
            <span className="code" dir="ltr">
              {FLOORS[net ?? 0]}
            </span>
            . الطوابق التي فوقها أُزيلت، والبرنامج يكمل من هنا. هذا هو <b>try/catch</b>.
          </motion.p>
        )}
      </div>
    </div>
  );
}
