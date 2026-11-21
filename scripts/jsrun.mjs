// Runs learner JavaScript in a Node vm the way the browser runner (src/lib/runJs.ts) does: top-level
// await is allowed, and output printed later (setTimeout, promises) is collected until no timer is
// pending. Used by check-lessons and check-projects.
import vm from "node:vm";

const fmt = (v) => (typeof v === "string" ? v : v === undefined ? "undefined" : (() => { try { return JSON.stringify(v); } catch { return String(v); } })());

export function runJsAsync(code, { timeoutMs = 3000 } = {}) {
  return new Promise((resolve) => {
    const out = [];
    const log = (...a) => out.push(a.map(fmt).join(" "));
    const timers = new Set();
    let settled = false, mainDone = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      for (const t of timers) clearTimeout(t);
      resolve({ out, error: error ? `${error.name}: ${error.message}` : undefined });
    };
    // Idle = the program finished and no timer is pending; a 0ms tick lets queued promise callbacks run first.
    const checkIdle = () => setTimeout(() => { if (mainDone && timers.size === 0) finish(); }, 0);
    const setT = (f, ms, ...args) => {
      const id = setTimeout(() => {
        timers.delete(id);
        try { f(...args); } catch (e) { return finish(e); }
        checkIdle();
      }, ms);
      timers.add(id);
      return id;
    };
    const clearT = (id) => { timers.delete(id); clearTimeout(id); checkIdle(); };
    const setI = (f, ms, ...args) => {
      const id = setInterval(() => { try { f(...args); } catch (e) { finish(e); } }, ms);
      timers.add(id);
      return id;
    };
    const clearI = (id) => { timers.delete(id); clearInterval(id); checkIdle(); };
    const guard = setTimeout(() => finish({ name: "TimeoutError", message: "the program did not finish" }), timeoutMs);
    const ctx = { console: { log, info: log, warn: log, error: log }, setTimeout: setT, clearTimeout: clearT, setInterval: setI, clearInterval: clearI, queueMicrotask, structuredClone };
    try {
      vm.runInNewContext(`(async function(){${code}\n})()`, ctx, { timeout: 1000 }).then(
        () => { mainDone = true; checkIdle(); },
        (e) => finish(e),
      );
    } catch (e) {
      finish(e);
    }
  });
}
