"use client";

import { useEffect, useState } from "react";
import { trace } from "./tracer/tracer.ts";
import { stripTypes, traceCode } from "./runners";
import type { Step } from "./types";

export type TraceState = { status: "loading" } | { status: "done"; steps: Step[]; error?: string };

/** Traced steps for a program; JS/TS resolve on the first render, Python after Pyodide answers. */
export function useTrace(lang: "js" | "ts" | "py", code: string | null): TraceState {
  const sync = (): TraceState | null => {
    if (code === null || lang === "py") return null;
    try {
      const r = trace(lang === "ts" ? stripTypes(code) : code);
      return { status: "done", steps: r.steps, error: r.error };
    } catch (e) {
      return { status: "done", steps: [], error: (e as Error).message };
    }
  };
  const [state, setState] = useState<TraceState>(() => sync() ?? { status: "loading" });

  useEffect(() => {
    if (code === null) return;
    if (lang !== "py") {
      setState(sync()!);
      return;
    }
    let live = true;
    setState({ status: "loading" });
    traceCode("py", code).then((r) => live && setState({ status: "done", steps: r.steps, error: r.error }));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, code]);

  return state;
}
