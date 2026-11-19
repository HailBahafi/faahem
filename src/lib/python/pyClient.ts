"use client";

import type { Step } from "../types";
import { PY_TRACER } from "./tracerSource";

// Pyodide (CPython compiled to WebAssembly) in one long-lived Web Worker. The first call
// downloads it (~10 MB, cached by the browser); later calls start instantly. A run that
// takes too long terminates the worker, and the next call starts a fresh one.
const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/";

const WORKER_SRC = `
importScripts(${JSON.stringify(PYODIDE + "pyodide.js")});
const ready = loadPyodide({ indexURL: ${JSON.stringify(PYODIDE)} }).then(async (py) => {
  py.runPython(${JSON.stringify(PY_TRACER)});
  return py;
});
self.onmessage = async (e) => {
  const { id, fn, code } = e.data;
  try {
    const py = await ready;
    if (fn === "ping") return self.postMessage({ id, result: "ok" });
    const result = JSON.parse(py.globals.get(fn)(code));
    self.postMessage({ id, result });
  } catch (err) {
    self.postMessage({ id, error: String(err && err.message || err) });
  }
};`;

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let seq = 0;
const pending = new Map<number, (m: { result?: unknown; error?: string }) => void>();

function boot() {
  if (worker) return;
  const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
  worker = new Worker(url);
  worker.onmessage = (e) => {
    const cb = pending.get(e.data.id);
    pending.delete(e.data.id);
    cb?.(e.data);
  };
  ready = send("ping", "", 120_000).then(() => undefined);
}

function reset() {
  worker?.terminate();
  worker = null;
  ready = null;
  for (const cb of pending.values()) cb({ error: "stopped" });
  pending.clear();
}

function send(fn: string, code: string, timeout: number) {
  return new Promise<{ result?: unknown; error?: string }>((resolve) => {
    const id = ++seq;
    const timer = setTimeout(() => {
      pending.delete(id);
      reset();
      resolve({ error: "timeout" });
    }, timeout);
    pending.set(id, (m) => {
      clearTimeout(timer);
      resolve(m);
    });
    worker!.postMessage({ id, fn, code });
  });
}

/** Starts downloading Python in the background (call when a Python lesson opens). */
export function warmPython() {
  if (typeof window !== "undefined") boot();
}

async function call<T>(fn: string, code: string): Promise<T | { failed: string }> {
  boot();
  try {
    await ready;
  } catch {
    reset();
    return { failed: "تعذّر تحميل Python. تحقق من اتصال الإنترنت." };
  }
  const m = await send(fn, code, 8000);
  if (m.error === "timeout") return { failed: "استغرق الكود وقتاً طويلاً. هل توجد حلقة لا تنتهي؟" };
  if (m.error) return { failed: m.error };
  return m.result as T;
}

export async function runPy(code: string) {
  const r = await call<{ out: string[]; error: { name: string; message: string } | null }>("__faahem_run", code);
  if ("failed" in r) return { out: [], error: { name: "Error", message: r.failed } };
  return { out: r.out, error: r.error ?? undefined };
}

export async function tracePy(code: string): Promise<{ steps: Step[]; output: string[]; error?: string }> {
  const r = await call<{ steps: Step[]; output: string[]; error: string | null }>("__faahem_trace", code);
  if ("failed" in r) return { steps: [], output: [], error: r.failed };
  return { steps: r.steps, output: r.output, error: r.error ?? undefined };
}
