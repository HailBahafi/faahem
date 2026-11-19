"use client";

import { useCallback, useEffect, useState } from "react";
import type { Lang } from "./types";

export interface Progress {
  completed: string[];
  quiz: Record<string, number>;
  station: Record<string, number>;
  /** Spaced review per completed lesson: interval level and next due time (ms). */
  review: Record<string, { level: number; due: number }>;
}

const KEY = "faahem:progress:v1";
const EVENT = "faahem:progress";
const EMPTY: Progress = { completed: [], quiz: {}, station: {}, review: {} };

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export const PROGRESS_EVENT = EVENT;

export function readProgress(): Progress {
  return readJSON(KEY, EMPTY);
}

/** Replaces the stored progress (used by cloud sync) and tells every reader to reload. */
export function writeProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  useEffect(() => {
    const load = () => {
      const p = readJSON(KEY, EMPTY);
      // Lessons finished before review existed start due today.
      const review = { ...p.review };
      for (const slug of p.completed) review[slug] ??= { level: 0, due: Date.now() };
      setProgress({ ...p, review });
    };
    load();
    // Other components on the page (the header badge) re-read after every save.
    window.addEventListener(EVENT, load);
    return () => window.removeEventListener(EVENT, load);
  }, []);
  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      setTimeout(() => window.dispatchEvent(new Event(EVENT)), 0);
      return next;
    });
  }, []);
  return { progress, update };
}

const LANG_KEY = "faahem:lang";

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("js");
  useEffect(() => {
    try {
      const l = localStorage.getItem(LANG_KEY) as Lang | null;
      if (l) setLang(l);
    } catch {}
  }, []);
  const choose = useCallback((l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {}
  }, []);
  return [lang, choose];
}
