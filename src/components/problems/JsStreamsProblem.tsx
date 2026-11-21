"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Mode = "readFile" | "ignore" | "backpressure";

const FILE_MB = 2048;
const LIMIT_MB = 512;
const CHUNK = 64; // MB per tick read (scaled for the demo)
const DISK = 32; // MB per tick written: the writer is slower than the reader
const HWM = 16;

/** Copying a 2GB file on a 512MB server: read it all, stream it carelessly, or stream with backpressure. */
export default function JsStreamsProblem() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [read, setRead] = useState(0);
  const [written, setWritten] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [peak, setPeak] = useState(0);
  const [crashed, setCrashed] = useState(false);
  const [pauses, setPauses] = useState(0);
  const [run, setRun] = useState(0);
  const sim = useRef({ read: 0, written: 0, buffer: 0, paused: false, peak: 0, pauses: 0 });

  useEffect(() => {
    if (mode === null || mode === "readFile") return;
    const id = setInterval(() => {
      const s = sim.current;
      if (!s.paused && s.read < FILE_MB) {
        s.read += CHUNK;
        s.buffer += CHUNK;
        if (mode === "backpressure" && s.buffer >= HWM) {
          s.paused = true;
          s.pauses++;
        }
      }
      const w = Math.min(DISK, s.buffer);
      s.buffer -= w;
      s.written += w;
      if (s.paused && s.buffer === 0) s.paused = false; // drain → resume
      s.peak = Math.max(s.peak, s.buffer);
      setRead(s.read);
      setWritten(s.written);
      setBuffer(s.buffer);
      setPeak(s.peak);
      setPauses(s.pauses);
      if (s.buffer > LIMIT_MB) {
        setCrashed(true);
        clearInterval(id);
      }
      if (s.written >= FILE_MB) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [mode, run]);

  const start = (m: Mode) => {
    sim.current = { read: 0, written: 0, buffer: 0, paused: false, peak: 0, pauses: 0 };
    setRead(0);
    setWritten(0);
    setBuffer(m === "readFile" ? FILE_MB : 0);
    setPeak(m === "readFile" ? FILE_MB : 0);
    setPauses(0);
    setCrashed(m === "readFile");
    setMode(m);
    setRun((r) => r + 1);
  };

  const shown = mode === "readFile" ? FILE_MB : buffer;
  const done = written >= FILE_MB;

  return (
    <div>
      <div className="flex flex-wrap gap-2" dir="ltr">
        <ModeBtn on={mode === "readFile"} onClick={() => start("readFile")}>
          fs.readFile()
        </ModeBtn>
        <ModeBtn on={mode === "ignore"} onClick={() => start("ignore")}>
          stream, ignore write() → false
        </ModeBtn>
        <ModeBtn on={mode === "backpressure"} onClick={() => start("backpressure")}>
          stream + pause / drain
        </ModeBtn>
      </div>

      <div className="mt-4 space-y-3">
        <Bar label="الذاكرة المستعملة" value={shown} max={LIMIT_MB} bad={crashed} unit={`${Math.round(shown)}MB / ${LIMIT_MB}MB`} />
        <Bar label="ما نُسخ إلى القرص" value={written} max={FILE_MB} unit={`${written}MB / ${FILE_MB}MB`} />
      </div>

      <div className="code mt-3 flex flex-wrap gap-4 text-xs text-muted" dir="ltr">
        <span>read: {mode === "readFile" ? FILE_MB : read}MB</span>
        <span>peak buffer: {Math.round(peak)}MB</span>
        <span>pauses: {pauses}</span>
      </div>

      {crashed && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 font-bold text-err" dir="ltr">
          FATAL ERROR: JavaScript heap out of memory
        </motion.p>
      )}
      {crashed && mode === "ignore" && (
        <p className="mt-1 text-muted">القراءة أسرع من الكتابة، والقطع التي لم تُكتب بعد تتراكم في الذاكرة. الـ stream وحده لا يكفي: يجب أن يسمع القارئ «توقف».</p>
      )}
      {mode === "backpressure" && done && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-muted">
          نُسخ الملف كله والذاكرة لم تتجاوز قطعة واحدة تقريباً. القارئ توقف {pauses} مرة وانتظر الكاتب: هذا هو <b className="text-fg">الضغط العكسي</b>.
        </motion.p>
      )}
    </div>
  );
}

function Bar({ label, value, max, unit, bad }: { label: string; value: number; max: number; unit: string; bad?: boolean }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="code text-xs text-muted" dir="ltr">
          {unit}
        </span>
      </div>
      <div className="mt-1 h-4 overflow-hidden rounded-full bg-code">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
          className={`h-full rounded-full ${bad ? "bg-err" : "bg-accent"}`}
        />
      </div>
    </div>
  );
}

function ModeBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className={`code rounded-xl px-3 py-2 text-xs font-bold ${on ? "bg-accent text-accent-fg" : "border border-line bg-surface"}`}
    >
      {children}
    </button>
  );
}
