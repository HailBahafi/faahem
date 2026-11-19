"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const SIZE = 16;
const empty = () => Array<number | null>(SIZE).fill(null);

/** A street of numbered boxes: jump to any address, write, then cut the power. RAM forgets; the disk keeps. */
export default function RamProblem() {
  const [ram, setRam] = useState<(number | null)[]>(empty);
  const [disk, setDisk] = useState<(number | null)[] | null>(null);
  const [power, setPower] = useState(true);
  const [addr, setAddr] = useState("5");
  const [val, setVal] = useState("42");
  const [cursor, setCursor] = useState<number | null>(null);
  const [cycles, setCycles] = useState(0);

  const a = Number(addr);
  const v = Number(val);
  const validAddr = addr !== "" && Number.isInteger(a) && a >= 0 && a < SIZE;
  const validVal = val !== "" && Number.isInteger(v) && v >= 0 && v <= 255;
  const used = ram.some((x) => x !== null);

  const write = () => {
    if (!power || !validAddr || !validVal) return;
    setCursor(a);
    setRam((r) => r.map((x, i) => (i === a ? v : x)));
  };

  const togglePower = () => {
    if (power) {
      setRam(empty());
      setCursor(null);
      setCycles((c) => c + 1);
    }
    setPower((p) => !p);
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className={`rounded-2xl border p-4 transition-colors ${power ? "border-accent/50 bg-surface" : "border-line bg-surface opacity-60"}`}>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold">الذاكرة RAM</span>
            <span className="text-xs text-muted">سريعة، وتنسى بلا كهرباء</span>
          </div>
          <div dir="ltr" className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {ram.map((x, i) => (
              <motion.div
                key={i}
                animate={{
                  boxShadow: cursor === i ? "0 0 0 2px var(--accent), 0 8px 24px -8px var(--accent)" : "0 0 0 1px var(--border)",
                  scale: cursor === i ? [1, 1.08, 1] : 1,
                }}
                transition={{ duration: 0.35 }}
                className="relative rounded-lg bg-surface-2 p-1.5 text-center"
              >
                <div className="code text-[10px] text-muted">{i}</div>
                <div className="flex h-8 items-center justify-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={`${x}-${cycles}`}
                      initial={{ y: -16, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 16, opacity: 0 }}
                      className={`code text-base font-bold ${x === null ? "text-muted/40" : "text-num"}`}
                    >
                      {x === null ? "·" : x}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted">
              العنوان (0 - 15)
              <input
                dir="ltr"
                inputMode="numeric"
                value={addr}
                onChange={(e) => setAddr(e.target.value.replace(/\D/g, "").slice(0, 2))}
                className={`code w-20 rounded-lg border bg-code px-2 py-1.5 text-center text-base text-fg ${validAddr ? "border-line" : "border-err"}`}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              القيمة (0 - 255)
              <input
                dir="ltr"
                inputMode="numeric"
                value={val}
                onChange={(e) => setVal(e.target.value.replace(/\D/g, "").slice(0, 3))}
                className={`code w-20 rounded-lg border bg-code px-2 py-1.5 text-center text-base text-fg ${validVal ? "border-line" : "border-err"}`}
              />
            </label>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={write}
              disabled={!power || !validAddr || !validVal}
              className="rounded-2xl bg-accent px-5 py-2 font-bold text-accent-fg shadow-lg shadow-accent/20 disabled:opacity-40"
            >
              اقفز واكتب
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:w-48">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="text-sm font-semibold">القرص SSD</div>
            <div className="text-xs text-muted">أبطأ، ولا ينسى</div>
            <div className="mt-3 rounded-lg bg-code p-2">
              {disk ? (
                <>
                  <div className="code text-xs text-str">notes.dat</div>
                  <div dir="ltr" className="code mt-1 text-[11px] break-all text-muted">
                    {disk.map((x) => (x === null ? "·" : x)).join(" ")}
                  </div>
                </>
              ) : (
                <div className="text-xs text-muted">فارغ</div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setDisk([...ram])}
                disabled={!power || !used}
                className="rounded-lg border border-line px-3 py-1 text-xs hover:border-accent disabled:opacity-40"
              >
                احفظ على القرص
              </button>
              {disk && power && !used && (
                <button onClick={() => setRam([...disk])} className="rounded-lg border border-line px-3 py-1 text-xs hover:border-accent">
                  حمّل إلى RAM
                </button>
              )}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={togglePower}
            className={`rounded-2xl px-5 py-3 font-bold ${power ? "border border-err/50 bg-err/10 text-err" : "bg-accent text-accent-fg"}`}
          >
            {power ? "اقطع الكهرباء" : "أعد الكهرباء"}
          </motion.button>
        </div>
      </div>

      {cycles > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-muted">
          لاحظت؟ <b className="text-fg">RAM</b> صناديق مرقّمة يقفز المعالج إلى أيّها مباشرة، لكنها تُمسح عند انقطاع الكهرباء. ما يبقى هو ما حُفظ على <b className="text-fg">القرص</b>، ومنه يُنسخ كل برنامج إلى RAM عند تشغيله.
        </motion.p>
      )}
    </div>
  );
}
