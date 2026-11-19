import type { Progress } from "./progress";

/**
 * Combines two copies of a learner's progress (this browser and the server) without
 * losing anything: completed lessons are unioned, scores and stations take the best,
 * and each review keeps the copy that is furthest along.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const max = (x: Record<string, number>, y: Record<string, number>) => {
    const out = { ...x };
    for (const [k, v] of Object.entries(y)) out[k] = Math.max(v, out[k] ?? -Infinity);
    return out;
  };
  const review = { ...a.review };
  for (const [k, r] of Object.entries(b.review ?? {})) {
    const cur = review[k];
    if (!cur || r.level > cur.level || (r.level === cur.level && r.due > cur.due)) review[k] = r;
  }
  return {
    completed: [...new Set([...(a.completed ?? []), ...(b.completed ?? [])])],
    quiz: max(a.quiz ?? {}, b.quiz ?? {}),
    station: max(a.station ?? {}, b.station ?? {}),
    review,
  };
}

export function sameProgress(a: Progress, b: Progress) {
  const norm = (p: Progress) =>
    JSON.stringify({ ...p, completed: [...p.completed].sort() }, (_k, v) =>
      v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort()) : v,
    );
  return norm(a) === norm(b);
}
