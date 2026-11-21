import { runJsAsync } from "./jsrun.mjs";
// Validates lesson content: node scripts/check-lessons.mjs [slug ...]
// Runs every exercise and example the way the browser would (JS in a VM, TypeScript after
// stripping types, Python with the local interpreter, HTML in jsdom), and checks that each
// scene's language versions line up with its steps.
import { compileNative, NATIVE, runNative, SKIP_NATIVE } from "./native.mjs";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { JSDOM, VirtualConsole } from "jsdom";
import { transform } from "sucrase";
import { trace } from "../src/lib/tracer/tracer.ts";
import { PGlite } from "@electric-sql/pglite";
import { runSqlWith } from "../src/lib/sql.ts";
import { runPython, tracePython } from "./python.mjs";

const dir = "src/content/lessons";
const wanted = process.argv.slice(2);
const files = readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts" && (!wanted.length || wanted.includes(f.replace(".ts", ""))));
const registry = readFileSync("src/components/problems/index.tsx", "utf8");
const PROGRAMMING = ["js", "ts", "py", "go", "dart", "rust"];

const fmt = (v) => (typeof v === "string" ? v : v === undefined ? "undefined" : JSON.stringify(v));
const strip = (code) => transform(code, { transforms: ["typescript"], disableESTransforms: true }).code;

async function runJs(code) {
  const r = await runJsAsync(code);
  return { out: r.out.join("\n").trim(), error: r.error };
}

async function runHtml(html, check = "__logs.join('\\n')") {
  const logs = [];
  const vc = new VirtualConsole();
  for (const m of ["log", "info", "warn", "error"]) vc.on(m, (...a) => logs.push(a.map(fmt).join(" ")));
  vc.on("jsdomError", (e) => logs.push(String(e.message)));
  try {
    const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable", virtualConsole: vc, pretendToBeVisual: true });
    // Wait for external scripts (e.g. React from a CDN) and load handlers, like the browser check does.
    await new Promise((r) => {
      const t = setTimeout(r, 10000);
      dom.window.addEventListener("load", () => { clearTimeout(t); setTimeout(r, 200); });
    });
    dom.window.__logs = logs;
    const r = String(dom.window.eval(check));
    dom.window.close();
    return { out: r.trim() };
  } catch (e) {
    return { out: "", error: `${e.name}: ${e.message}` };
  }
}

async function run(lang, code, check, setup) {
  if (NATIVE.includes(lang)) return runNative(lang, code);
  if (lang === "sql") {
    const r = await runSqlWith(PGlite, code, setup);
    return { out: r.out.join("\n").trim(), error: r.error ? r.error.message : undefined };
  }
  if (lang === "py") {
    const r = runPython(code);
    return { out: r.out.join("\n").trim(), error: r.error ? `${r.error.name}: ${r.error.message}` : undefined };
  }
  if (lang === "html") return runHtml(code, check);
  if (lang === "ts") {
    try {
      return runJs(strip(code));
    } catch (e) {
      return { out: "", error: `SyntaxError: ${e.message}` };
    }
  }
  return runJs(code);
}

const traceIn = (lang, code) => (lang === "py" ? tracePython(code) : trace(lang === "ts" ? strip(code) : code));

let failures = 0;
for (const f of files) {
  const mod = await import("../" + join(dir, f).replace(/\\/g, "/"));
  const lesson = Object.values(mod).find((v) => v && typeof v === "object" && v.slug);
  const errs = [];
  const warn = [];
  const bad = (m) => errs.push(m);
  if (!lesson) { console.log(`✖ ${f}: no exported lesson`); failures++; continue; }

  if (!new RegExp(`\\b${lesson.problem.demo}\\s*:`).test(registry)) warn.push(`problem demo "${lesson.problem.demo}" is not in problems/index.ts yet`);

  // Scene
  const sc = lesson.scene;
  const langs = Object.keys(sc.code);
  if (!langs.length) bad("scene has no code");
  const n = sc.code[langs[0]]?.split("\n").length ?? 0;
  for (const [lang, code] of Object.entries(sc.code)) {
    if (code.split("\n").length !== n) bad(`scene.code.${lang} has ${code.split("\n").length} lines, ${langs[0]} has ${n}`);
  }
  const prog = langs.filter((l) => PROGRAMMING.includes(l));
  if (prog.length && prog.length < 6 && !lesson.singleLanguage) warn.push(`scene shows ${prog.length} of the 6 programming languages`);
  if (sc.trace) {
    const tl = sc.trace === "py" ? "py" : "js";
    if (!sc.code[tl]) bad(`scene.trace is "${sc.trace}" but scene.code.${tl} is missing`);
    else {
      const t = traceIn(tl, sc.code[tl]);
      if (t.error) bad(`scene trace error: ${t.error}`);
      if (t.steps.length > 60) warn.push(`traced scene has ${t.steps.length} steps (long)`);
    }
  } else {
    if (sc.steps.length < 4) bad("scene has fewer than 4 steps");
    sc.steps.forEach((s, k) => { if (s.line !== null && (s.line < 1 || s.line > n)) bad(`scene step ${k} line ${s.line} out of range`); });
    const lastOut = [...sc.steps].reverse().find((s) => s.output)?.output;
    const runLang = ["js", "py", "ts"].find((l) => sc.code[l]);
    if (lastOut && runLang) {
      const r = await run(runLang, sc.code[runLang]);
      if (r.out !== lastOut.join("\n")) bad(`scene output says ${JSON.stringify(lastOut)} but ${runLang} prints ${JSON.stringify(r.out)}`);
    }
  }

  // Playground
  const pg = lesson.playground;
  if (pg.kind === "trace") {
    const t = traceIn(pg.lang ?? "js", pg.starter);
    if (t.error) bad(`playground starter trace error: ${t.error}`);
  } else if (pg.kind === "sql") {
    const r = await run("sql", pg.starter, undefined, pg.setup);
    if (r.error) bad(`playground sql throws: ${r.error}`);
  } else if (pg.kind === "html") {
    const r = await runHtml(pg.starter);
    if (r.error) bad(`playground html throws: ${r.error}`);
  }

  // Predict
  lesson.predict.forEach((p, k) => {
    if (p.answer < 0 || p.answer >= p.options.length) bad(`predict ${k} answer out of range`);
    if (!p.scene) {
      const t = traceIn(p.lang ?? "js", p.code);
      if (!t.steps.length) bad(`predict ${k} does not run: ${t.error}`);
    }
  });

  // Code station
  const rl = lesson.code.runnerLang ?? "js";
  if (SKIP_NATIVE.includes(rl)) {
    const ce = compileNative(rl, lesson.code.runnerStarter);
    if (ce) bad(`runnerStarter (${rl}) does not compile: ${ce}`);
  } else if (rl !== "text") {
    const rs = await run(rl, lesson.code.runnerStarter, undefined, lesson.code.runnerSetup);
    if (rs.error) bad(`runnerStarter (${rl}) throws: ${rs.error}`);
  }

  // Exercises
  for (const [k, e] of lesson.exercises.entries()) {
    const tag = `exercise ${k + 1} (${e.kind}, ${e.lang ?? "js"})`;
    const lang = e.lang ?? "js";
    if (SKIP_NATIVE.includes(lang)) {
      // Windows: compile the correct program only; CI runs it and compares the output.
      const good = e.kind === "order" ? e.lines.join("\n") : e.kind === "fill" ? e.template.replace("___", e.answer ?? e.options[0]) : e.solution;
      const ce = compileNative(lang, good);
      if (ce) bad(`${tag}: correct program does not compile: ${ce}`);
      if (e.kind === "fill" && !e.options.includes(e.answer)) bad(`${tag}: ${lang} fill needs answer (one of the options)`);
      continue;
    }
    if (lang === "text") {
      if (e.kind === "fill" && !e.options.includes(e.answer)) bad(`${tag}: answer "${e.answer}" is not one of the options`);
      if (e.kind === "fix" || e.kind === "write") bad(`${tag}: text exercises can only be order or fill`);
      continue;
    }
    if (lang === "html" && !e.check) bad(`${tag}: html exercises need a \`check\` expression`);
    if (e.kind === "order") {
      const r = await run(lang, e.lines.join("\n"), e.check, e.setup);
      if (r.out !== e.expected) bad(`${tag}: correct order gives ${JSON.stringify(r.out)} ${r.error ?? ""}, expected ${JSON.stringify(e.expected)}`);
    } else if (e.kind === "fill") {
      const good = [];
      for (const o of e.options) {
        const r = await run(lang, e.template.replace("___", o), e.check, e.setup);
        if (!r.error && r.out === e.expected) good.push(o);
      }
      if (good.length !== 1) bad(`${tag}: ${good.length} options produce the expected output (${good.join(", ")})`);
      // Go/Rust/Dart fill exercises are checked against `answer` when the run server is off.
      if (NATIVE.includes(lang) && good.length === 1 && e.answer !== good[0]) bad(`${tag}: ${lang} fill needs answer: "${good[0]}"`);
    } else {
      const s = await run(lang, e.solution, e.check, e.setup);
      if (s.error || s.out !== e.expected) bad(`${tag}: solution gives ${JSON.stringify(s.out)} ${s.error ?? ""}, expected ${JSON.stringify(e.expected)}`);
      const start = await run(lang, e.kind === "fix" ? e.code : e.starter, e.check, e.setup);
      if (!start.error && start.out === e.expected) bad(`${tag}: the starting code already passes`);
    }
  }
  if (lesson.exercises.length !== 4) warn.push(`${lesson.exercises.length} exercises (template has 4)`);

  // Quiz
  if (lesson.quiz.length !== 5) bad(`quiz has ${lesson.quiz.length} questions, expected 5`);
  lesson.quiz.forEach((q, k) => { if (q.answer < 0 || q.answer >= q.options.length) bad(`quiz ${k} answer out of range`); });

  if (errs.length) failures++;
  console.log(`${errs.length ? "✖" : "✔"} ${lesson.slug}${errs.map((e) => "\n    ✖ " + e).join("")}${warn.map((w) => "\n    ! " + w).join("")}`);
}
process.exit(failures ? 1 : 0);
