// Runs learner JavaScript in a throwaway Web Worker so a bad loop can't freeze the page.

// The program may use top-level await, setTimeout and promises: the worker reports once the program
// has finished and no timer is pending (a 0ms tick lets queued promise callbacks run first).
// scripts/jsrun.mjs does the same for the validators.
const WORKER_SRC = `
self.onmessage = (e) => {
  const out = [];
  const fmt = (v) => typeof v === "string" ? v : v === undefined ? "undefined" : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
  const log = (...a) => out.push(a.map(fmt).join(" "));
  const c = { log, info: log, warn: log, error: log };
  const timers = new Set();
  let mainDone = false, sent = false;
  const send = (err) => {
    if (sent) return;
    sent = true;
    self.postMessage(err ? { out, error: { name: err.name, message: err.message } } : { out });
  };
  const checkIdle = () => setTimeout(() => { if (mainDone && timers.size === 0) send(); }, 0);
  const setT = (f, ms, ...a) => { const id = setTimeout(() => { timers.delete(id); try { f(...a); } catch (err) { return send(err); } checkIdle(); }, ms); timers.add(id); return id; };
  const clearT = (id) => { timers.delete(id); clearTimeout(id); checkIdle(); };
  const setI = (f, ms, ...a) => { const id = setInterval(() => { try { f(...a); } catch (err) { send(err); } }, ms); timers.add(id); return id; };
  const clearI = (id) => { timers.delete(id); clearInterval(id); checkIdle(); };
  const AsyncFunction = (async () => {}).constructor;
  let run;
  try {
    run = new AsyncFunction("console", "setTimeout", "clearTimeout", "setInterval", "clearInterval", e.data);
  } catch (err) {
    return send(err);
  }
  run(c, setT, clearT, setI, clearI).then(() => { mainDone = true; checkIdle(); }, send);
};`;

export interface RunResult {
  out: string[];
  error?: { name: string; message: string };
  timedOut?: boolean;
}

export function runJs(code: string, timeoutMs = 4000): Promise<RunResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
    const worker = new Worker(url);
    const done = (r: RunResult) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(r);
    };
    const timer = setTimeout(() => done({ out: [], timedOut: true }), timeoutMs);
    worker.onmessage = (e) => done(e.data as RunResult);
    worker.onerror = (e) => {
      e.preventDefault();
      done({ out: [], error: { name: "SyntaxError", message: e.message } });
    };
    worker.postMessage(code);
  });
}

/** Explains common JavaScript errors in plain Arabic. */
export function explainError(r: RunResult): string | null {
  if (r.timedOut) return "استغرق الكود وقتاً طويلاً. هل توجد حلقة لا تنتهي؟";
  if (!r.error) return null;
  const m = r.error.message;
  let x: RegExpMatchArray | null;
  if (/Assignment to constant variable/.test(m)) return "لا يمكن تغيير قيمة متغير أُنشئ بـ const. استخدم let إذا كانت القيمة ستتغير.";
  if ((x = m.match(/(\w+) is not defined/))) return `المتغير ${x[1]} غير موجود. هل أنشأته قبل استخدامه؟`;
  if ((x = m.match(/Cannot access '(\w+)' before initialization/))) return `استخدمت ${x[1]} قبل السطر الذي يُنشئه. الكود يُنفَّذ من الأعلى إلى الأسفل.`;
  if ((x = m.match(/Identifier '(\w+)' has already been declared/))) return `المتغير ${x[1]} موجود مسبقاً. لتغييره اكتب ${x[1]} = ... بدون let.`;
  if (r.error.name === "SyntaxError") return "يوجد خطأ في كتابة الكود (قوس أو علامة ناقصة).";
  return `${r.error.name}: ${m}`;
}
