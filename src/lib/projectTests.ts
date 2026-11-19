"use client";

import { runCode } from "./runners";
import type { Project } from "./types";

export interface TestResult {
  name: string;
  pass: boolean;
  detail?: string;
}

/** Runs every test of a project against the learner's code, one fresh run per test. */
export async function runProjectTests(project: Project, code: string): Promise<TestResult[]> {
  if (project.lang === "text") return [];
  const lang = project.lang;
  const results: TestResult[] = [];
  for (const t of project.tests) {
    const r =
      lang === "html"
        ? await runCode("html", code, t.code)
        : await runCode(lang, `${code}\n${t.code}`, undefined, project.setup);
    const last = r.out.filter((l) => l.trim() !== "").pop()?.trim();
    const pass = !r.error && !r.timedOut && last?.toLowerCase() === "true";
    results.push({
      name: t.name,
      pass,
      detail: r.timedOut ? "انتهى الوقت" : r.error ? `${r.error.name}: ${r.error.message}` : pass ? undefined : `النتيجة: ${last ?? "(لا شيء)"}`,
    });
  }
  return results;
}
