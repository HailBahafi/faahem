// Validates stage projects: node scripts/check-projects.mjs
// The solution must pass every test; the starter must fail at least one (or the project teaches nothing).
import { NATIVE, runNative, SKIP_NATIVE } from "./native.mjs";
import { readdirSync } from "node:fs";
import vm from "node:vm";
import { PGlite } from "@electric-sql/pglite";
import { JSDOM, VirtualConsole } from "jsdom";
import { transform } from "sucrase";
import { runSqlWith } from "../src/lib/sql.ts";
import { runPython } from "./python.mjs";

const fmt = (v) => (typeof v === "string" ? v : v === undefined ? "undefined" : JSON.stringify(v));

function runJs(code) {
  const out = [];
  const log = (...a) => out.push(a.map(fmt).join(" "));
  try {
    vm.runInNewContext(`(function(){${code}\n})()`, { console: { log, info: log, warn: log, error: log } }, { timeout: 2000 });
    return { out };
  } catch (e) {
    return { out, error: `${e.name}: ${e.message}` };
  }
}

async function runHtml(html, check) {
  const vc = new VirtualConsole();
  try {
    const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable", virtualConsole: vc, pretendToBeVisual: true });
    await new Promise((r) => {
      const t = setTimeout(r, 10000);
      dom.window.addEventListener("load", () => { clearTimeout(t); setTimeout(r, 200); });
    });
    dom.window.__logs = [];
    const r = String(dom.window.eval(check));
    dom.window.close();
    return { out: [r] };
  } catch (e) {
    return { out: [], error: `${e.name}: ${e.message}` };
  }
}

async function runTest(p, code, test) {
  let r;
  if (p.lang === "html") r = await runHtml(code, test.code);
  else if (p.lang === "py") r = runPython(`${code}\n${test.code}`);
  else if (NATIVE.includes(p.lang)) {
    const x = runNative(p.lang, `${code}\n${test.code}`);
    r = { out: x.out.split("\n"), error: x.error };
  }
  else if (p.lang === "sql") r = await runSqlWith(PGlite, `${code}\n${test.code}`, p.setup);
  else r = runJs(p.lang === "ts" ? transform(`${code}\n${test.code}`, { transforms: ["typescript"], disableESTransforms: true }).code : `${code}\n${test.code}`);
  const last = r.out.filter((l) => String(l).trim() !== "").pop();
  return { pass: !r.error && String(last).trim().toLowerCase() === "true", detail: r.error ? (r.error.message ?? r.error) : `last=${last}` };
}

let failures = 0;
for (const f of readdirSync("src/content/projects").filter((f) => f.endsWith(".ts") && f !== "index.ts")) {
  const mod = await import(`../src/content/projects/${f}`);
  const p = Object.values(mod).find((v) => v && typeof v === "object" && v.slug && v.tests);
  const errs = [];
  if (!p) { console.log(`✖ ${f}: no exported Project`); failures++; continue; }
  if (SKIP_NATIVE.includes(p.lang)) {
    console.log(`- ${p.slug} (${p.lang}: runs in CI)`);
    continue;
  }
  if (p.lang === "text") {
    if (p.tests.length) errs.push("text projects have no tests (the learner ticks steps)");
  } else {
    if (!p.tests.length) errs.push("no tests");
    let starterFails = false;
    for (const t of p.tests) {
      const s = await runTest(p, p.solution, t);
      if (!s.pass) errs.push(`solution fails "${t.name}" (${s.detail})`);
      if (!(await runTest(p, p.starter, t)).pass) starterFails = true;
    }
    if (!starterFails) errs.push("the starter already passes every test");
  }
  if (errs.length) failures++;
  console.log(`${errs.length ? "✖" : "✔"} ${p.slug} (${p.tests.length} tests)${errs.map((e) => "\n    ✖ " + e).join("")}`);
}
process.exit(failures ? 1 : 0);
