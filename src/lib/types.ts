/** Every language a lesson can show. The first six are the programming languages compared side by side. */
export type Lang = "js" | "ts" | "py" | "go" | "dart" | "rust" | "html" | "css" | "sql" | "shell" | "text";

/** Languages the browser can run and check: JavaScript, TypeScript, Python (Pyodide) and HTML/CSS. */
/** go, rust and dart run on the run server (`/api/run`); the rest run in the browser. */
export type RunLang = "js" | "ts" | "py" | "html" | "sql" | "go" | "rust" | "dart";
export const NATIVE_LANGS = ["go", "rust", "dart"] as const;
export const isNative = (l: string): l is "go" | "rust" | "dart" => (NATIVE_LANGS as readonly string[]).includes(l);

export const LANGS: { id: Lang; label: string }[] = [
  { id: "js", label: "JavaScript" },
  { id: "ts", label: "TypeScript" },
  { id: "py", label: "Python" },
  { id: "go", label: "Go" },
  { id: "dart", label: "Dart" },
  { id: "rust", label: "Rust" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "sql", label: "SQL" },
  { id: "shell", label: "Terminal" },
  { id: "text", label: "نص" },
];

/** The languages a scene was written in, in display order. */
export function sceneLangs(scene: { code: Partial<Record<Lang, string>> }): Lang[] {
  return LANGS.map((l) => l.id).filter((id) => scene.code[id] !== undefined);
}

export type ValType = "number" | "string" | "boolean" | "none";

/** One drawer in memory: a named box at an address holding a value. */
export interface Cell {
  name: string;
  value: string;
  type: ValType;
  constant?: boolean;
}

/** A variable or element as the machine view draws it. `ref` points at a heap object. */
export interface Slot {
  name: string;
  value: string;
  type: ValType | "ref" | "function";
  ref?: number;
  constant?: boolean;
}

/** One call-stack frame: a function call and its own variables. */
export interface Frame {
  id: number;
  name: string;
  vars: Slot[];
}

/** An array or object living on the heap; variables reach it by reference. */
export interface HeapObj {
  id: number;
  kind: "array" | "object";
  items: Slot[];
}

/** One frame of a scene: which line runs, what memory looks like after it. */
export interface Step {
  line: number | null;
  say: string;
  memory: Cell[];
  /** Call stack, bottom (global) first. When present the machine view is drawn instead of the drawers. */
  frames?: Frame[];
  heap?: HeapObj[];
  changedHeap?: number[];
  /** Cells whose value was just written. */
  changed?: string[];
  /** Cells being read on this step. */
  read?: string[];
  copy?: { from: string; to: string };
  error?: string;
  output?: string[];
}

export interface Scene {
  code: Partial<Record<Lang, string>>;
  /** Hand-written steps. Leave empty and set `trace` to generate them. */
  steps: Step[];
  /** Generate the steps with the tracer: `true` traces `code.js`, `"py"` traces `code.py` (stack + heap view). */
  trace?: boolean | "py";
  notes?: Partial<Record<Lang, string>>;
}

export interface PredictQ {
  question: string;
  /** The program to predict. Its answer animation is traced from this code unless `scene` is given. */
  code: string;
  /** Language of `code` (default js); js and py are traced for the answer animation. */
  lang?: "js" | "py";
  scene?: Scene;
  options: string[];
  answer: number;
  why: string;
}

/**
 * How an exercise is checked:
 * - js / ts / py (default js): run the code, compare printed output with `expected`.
 * - html: render the page in a sandboxed frame, evaluate the JS expression `check` inside it
 *   (`__logs` holds console.log lines), compare String(result) with `expected`.
 * - text: nothing runs (shell, git, SQL concepts...): `order` must match `lines`, `fill` must pick `answer`.
 * - go / rust / dart: run on the run server like js. `fill` must also give `answer`, so the exercise
 *   can still be checked when the run server is off.
 */
export interface ExerciseCheck {
  lang?: RunLang | "text";
  check?: string;
  answer?: string;
  /** sql: statements run before the learner's SQL (CREATE TABLE, INSERT...), in a fresh database. */
  setup?: string;
}

export type Exercise = ExerciseCheck &
  (
    | { kind: "order"; title: string; prompt: string; lines: string[]; expected: string }
    | { kind: "fill"; title: string; prompt: string; template: string; options: string[]; expected: string }
    | { kind: "fix"; title: string; prompt: string; code: string; expected: string; hint: string; solution: string }
    | { kind: "write"; title: string; prompt: string; starter: string; expected: string; hint: string; solution: string }
  );

export interface QuizQ {
  question: string;
  code?: string;
  options: string[];
  answer: number;
  why: string;
}

export interface Lesson {
  slug: string;
  stage: number;
  number: string;
  title: string;
  subtitle: string;
  minutes: number;
  /** `demo` names an interactive component in `src/components/problems`. */
  problem: { title: string; body: string; demo: string };
  scene: Scene;
  /** sandbox: one-line memory sandbox (variables only). trace: edit code and watch it run. */
  playground:
    | { kind: "sandbox"; intro: string; examples: string[] }
    | { kind: "trace"; intro: string; starter: string; challenges: string[]; lang?: "js" | "py" }
    | { kind: "html"; intro: string; starter: string; challenges: string[] }
    | { kind: "sql"; intro: string; starter: string; setup: string; challenges: string[] };
  predict: PredictQ[];
  /** `runnerLang` "text" shows no runner (concept lessons); default js. */
  code: { intro: string; runnerStarter: string; runnerLang?: RunLang | "text"; runnerSetup?: string };
  exercises: Exercise[];
  quiz: QuizQ[];
  next?: string;
  /** The lesson is about one language (e.g. Python, SQL, Rust): no six-language comparison expected. */
  singleLanguage?: boolean;
}

/**
 * A stage project: a bigger task than an exercise, built step by step and checked by tests.
 * Each test's `code` runs right after the learner's program (js/ts/py: appended source; sql:
 * appended query; html: a JS expression evaluated in the page) and passes when the last thing
 * it prints (or returns) is exactly `true`. `text` projects (Git, deploying, Flutter, Rust) have no
 * tests: the learner works on their own machine and ticks the steps.
 */
export interface ProjectTest {
  name: string;
  code: string;
}

export interface Project {
  slug: string;
  stage: number;
  /** A language track's level project (e.g. track "py", level 2) instead of a roadmap stage's. */
  track?: string;
  level?: number;
  title: string;
  brief: string;
  lang: RunLang | "text";
  starter: string;
  /** A working answer; the validator checks it passes every test and the starter does not. */
  solution: string;
  setup?: string;
  steps: string[];
  tests: ProjectTest[];
}
