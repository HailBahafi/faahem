"use client";

import { transform } from "sucrase";
import { runPy, tracePy } from "./python/pyClient";
import { explainError, runJs, type RunResult } from "./runJs";
import { runSql } from "./sql";
import { trace } from "./tracer/tracer.ts";
import type { RunLang, Step } from "./types";

/** TypeScript → JavaScript by removing the types (what tsc does at runtime, minus checking). */
export function stripTypes(code: string): string {
  return transform(code, { transforms: ["typescript"], disableESTransforms: true }).code;
}

/** Explains Python errors in Arabic; JS errors go through explainError. */
function explainPy(r: RunResult): string | null {
  if (!r.error) return null;
  if (r.error.name === "SQLError") return `خطأ في SQL: ${r.error.message}`;
  const { name, message } = r.error;
  let x: RegExpMatchArray | null;
  if (name === "NameError" && (x = message.match(/name '(\w+)' is not defined/))) return `المتغير ${x[1]} غير موجود. هل أنشأته قبل استخدامه؟`;
  if (name === "IndentationError") return "المسافات في بداية السطر غير صحيحة. بايثون تعتمد على المسافات لتعرف ما داخل الكتلة.";
  if (name === "SyntaxError") return `خطأ في كتابة الكود: ${message}`;
  if (name === "ZeroDivisionError") return "قسمة على صفر.";
  if (name === "IndexError") return "رقم الخانة خارج حدود القائمة.";
  if (name === "KeyError") return `المفتاح ${message} غير موجود في القاموس.`;
  if (name === "TypeError") return `نوع غير مناسب للعملية: ${message}`;
  return `${name}: ${message}`;
}

export function explain(lang: RunLang, r: RunResult) {
  return lang === "py" || lang === "sql" ? explainPy(r) : explainError(r);
}

/**
 * Renders HTML in a sandboxed frame (scripts allowed, no access to this page), then
 * evaluates `check` inside it. `__logs` holds what console.log printed.
 */
export function runHtml(html: string, check = "__logs.join('\\n')", timeoutMs = 10000): Promise<RunResult> {
  return new Promise((resolve) => {
    const id = Math.random().toString(36).slice(2);
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-scripts");
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:800px;height:600px;border:0";
    const head = `<script>window.__logs=[];const __l=(...a)=>__logs.push(a.map(v=>typeof v==="string"?v:JSON.stringify(v)).join(" "));console.log=__l;console.info=__l;console.warn=__l;console.error=__l;window.onerror=(m)=>{__logs.push(String(m))};</script>`;
    const tail = `<script>window.addEventListener("load",()=>setTimeout(()=>{let r,e=null;try{r=String(eval(${JSON.stringify(check)}))}catch(x){e={name:x.name,message:x.message}}parent.postMessage({faahem:${JSON.stringify(id)},r,e,logs:__logs},"*")},200));</script>`;
    const done = (r: RunResult) => {
      clearTimeout(timer);
      window.removeEventListener("message", onMsg);
      frame.remove();
      resolve(r);
    };
    const onMsg = (e: MessageEvent) => {
      if (e.data?.faahem !== id) return;
      done(e.data.e ? { out: [], error: e.data.e } : { out: String(e.data.r).split("\n") });
    };
    const timer = setTimeout(() => done({ out: [], timedOut: true }), timeoutMs);
    window.addEventListener("message", onMsg);
    frame.srcdoc = head + html + tail;
    document.body.appendChild(frame);
  });
}

/** Runs code in any runnable language and returns what it printed. */
export async function runCode(lang: RunLang, code: string, check?: string, setup?: string): Promise<RunResult> {
  if (lang === "py") return runPy(code);
  if (lang === "sql") return runSql(code, setup);
  if (lang === "html") return runHtml(code, check);
  if (lang === "ts") {
    try {
      return runJs(stripTypes(code));
    } catch (e) {
      return { out: [], error: { name: "SyntaxError", message: (e as Error).message } };
    }
  }
  return runJs(code);
}

/** Traces code for the animation player. JS and TS are synchronous; Python runs in Pyodide. */
export async function traceCode(lang: "js" | "ts" | "py", code: string): Promise<{ steps: Step[]; error?: string }> {
  if (lang === "py") return tracePy(code);
  try {
    return trace(lang === "ts" ? stripTypes(code) : code);
  } catch (e) {
    return { steps: [], error: (e as Error).message };
  }
}
