import type { Progress } from "./progress";

/** Days until the next review, by how many reviews in a row were passed. */
export const INTERVAL_DAYS = [1, 3, 7, 16, 35];
const DAY = 24 * 60 * 60 * 1000;

export function nextDue(level: number, now = Date.now()) {
  return now + INTERVAL_DAYS[Math.min(level, INTERVAL_DAYS.length - 1)] * DAY;
}

export function dueSlugs(p: Progress, now = Date.now()) {
  return Object.entries(p.review)
    .filter(([, r]) => r.due <= now)
    .map(([slug]) => slug);
}

/** Passing moves a lesson to a longer interval; failing brings it back to tomorrow. */
export function afterReview(p: Progress, slug: string, passed: boolean, now = Date.now()): Progress {
  const cur = p.review[slug] ?? { level: 0, due: now };
  const level = passed ? cur.level + 1 : 0;
  return { ...p, review: { ...p.review, [slug]: { level, due: nextDue(passed ? level : 0, now) } } };
}

export function inDays(due: number, now = Date.now()) {
  const d = Math.ceil((due - now) / DAY);
  return d <= 0 ? "اليوم" : d === 1 ? "غداً" : `بعد ${d} أيام`;
}
