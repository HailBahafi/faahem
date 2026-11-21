# دليل كتابة درس في فاهم

Read this whole file before writing a lesson. Lesson text is Arabic (Modern Standard, simple, warm, short
sentences). Code, identifiers and comments inside code are English; string values in code may be Latin
(e.g. "Sara"), never Arabic, because code is shown left-to-right.

## The goal

The learner must leave with a *mental picture of the machine*, not a memorized definition. Before writing,
decide in one sentence what picture this lesson installs (for variables: "a variable is a named drawer at
an address; assignment computes the right side first, then overwrites the drawer; copying copies the value").
Every station serves that picture. Prefer showing over telling: if a sentence can be replaced by a step in
the animation, replace it.

## Files

- `src/content/lessons/<slug>.ts`: `export const <camelSlug>: Lesson = {...}`. Only `import type` from
  `@/lib/types` (the validator runs this file in plain Node). Use the reference lesson
  `src/content/lessons/variables.ts` as the model for tone, length and structure.
- `src/components/problems/<Pascal>Problem.tsx`: the interactive demo for station 1 (`"use client"`,
  default export, no props). Model: `src/components/problems/ScoreProblem.tsx`. Use the design tokens
  (`bg-surface`, `border-line`, `text-muted`, `bg-accent`, `text-accent-fg`, `bg-code`, `text-num`,
  `text-str`, `text-bool`, `text-ok`, `text-err`) and `motion/react`. It must make the learner *feel* the
  problem the concept solves by doing something (press, drag, choose), in under a minute, with almost no text.
- Do not edit shared files (`index.ts` registries, components, types). The maintainer registers your lesson.

## The seven stations (type `Lesson` in `src/lib/types.ts`)

1. `problem` `{ title, body, demo }`: `demo` is your demo's registry key (the slug in camelCase).
2. `scene`: the core animation. Same program in six languages, `code.js/ts/py/go/dart/rust`. **Every language
   version has exactly the same number of lines, and line N means the same statement in all six** (pad with
   blank lines or a closing brace line where a language needs fewer lines; Python's `else:` sits on the
   line where JS has `} else {`). 5 to 9 lines. Then 6 to 12 hand-written `steps`, each:
   `{ line, say, memory, changed?, read?, copy?, error?, output? }`. `memory` is the full list of drawers
   after the step (`{ name, value, type: "number"|"string"|"boolean"|"none", constant? }`; string values
   include their quotes, e.g. `'"Sara"'`). `output` is the cumulative printed lines. The first step has
   `line: null` and sets the scene. A step that evaluates a condition should say what the condition
   evaluated to and where execution goes next. `say` is one or two short sentences.
   Add `notes` per language: one sentence on how this language writes the idea differently.
   (Alternative: `trace: true` with `steps: []` generates the steps from `code.js` with the stack/heap
   view. Use it only when frames or arrays matter, from the functions lesson on.)
3. `playground`: `{ kind: "trace", intro, starter, challenges }`. `starter` is a short JS program the learner
   edits and watches run in the tracer; 3 or 4 `challenges` like "change 3 to 10 and predict the output
   before you press".
4. `predict`: 3 questions `{ question, code, options, answer, why }`. `code` is JS; after answering, the
   learner watches it traced. Each targets a common misconception about this concept.
5. `code`: `{ intro, runnerStarter }`. `runnerStarter` is runnable JS with a comment inviting a change.
6. `exercises`: exactly 4, in this order: `order` (lines in correct order; the validator runs them),
   `fill` (one `___` in `template`, 2-3 `options`, exactly one must produce `expected`), `fix` (buggy `code`
   + `solution`), `write` (`starter` comment + `solution`). All are checked by running JS and comparing
   printed output to `expected` (multiple lines joined by `\n`).
7. `quiz`: exactly 5 tracing questions `{ question, code?, options, answer, why }`. Ask what the program
   does, not what a word means. `why` explains through the mental picture.

Also: `slug`, `stage`, `number` ("1.4"), `title`, `subtitle`, `minutes`, `next` (slug of the next lesson).

## What the tracer supports (for predict, playground and traced scenes)

Variables, if/else, switch, while, do-while, for, for-of, break/continue, functions, arrows, recursion,
arrays, objects, template literals, `console.log`, `Math.*`, common string/array methods. Not supported:
classes, spread/destructuring, async, regex (try/catch/finally, throw and new Error are supported). Keep these programs inside that subset.

## Lessons beyond JavaScript (stage 2 onward)

Not every topic is a six-language program. The template adapts:

- **Scene languages.** `scene.code` may hold any of `js ts py go dart rust html css sql shell text`. Programming
  concepts keep the six-language comparison. A topic that only exists in one language (HTML, CSS, SQL, a
  terminal session, Git, Python-only, Rust-only) sets `singleLanguage: true` and shows just that language (or
  e.g. `html` + `css` side by side, same line count). The language switcher only shows what the scene has.
- **Python is fully runnable.** `scene.trace: "py"` traces `code.py` with the stack/heap view (Python tracer,
  Pyodide in the browser); `playground: { kind: "trace", lang: "py", ... }`; `predict[i].lang: "py"`;
  `code.runnerLang: "py"`; exercises with `lang: "py"`. Python lists/dicts/objects appear on the heap.
- **TypeScript runs** after its types are stripped: `runnerLang: "ts"`, exercises `lang: "ts"` (no type
  checking happens, so test behaviour, and teach type errors through predict/quiz).
- **HTML/CSS run** in a sandboxed frame: `playground: { kind: "html", intro, starter, challenges }` shows a
  live preview; `runnerLang: "html"` too. HTML exercises set `lang: "html"` and `check`, a JS expression
  evaluated inside the page after it loads (e.g. `document.querySelector("h1").textContent`,
  `getComputedStyle(document.querySelector(".box")).display`, or `__logs.join("\n")` for console output);
  `expected` is compared with `String(result)`. The validator uses jsdom, which has no layout engine:
  check computed property values, never sizes or positions.
- **Concept topics with nothing to run** (terminal, Git, DNS, HTTP, how browsers render): set
  `code.runnerLang: "text"` (no runner shown) and make exercises `lang: "text"`, which allows only `order`
  (correct = `lines` as given) and `fill` (correct = `answer`, one of `options`). Use `kind: "trace"` JS
  playgrounds that *simulate* the idea (a DNS cache as an object, an HTTP request as an object, a Git
  commit graph as linked objects), and let the interactive demo carry the real experience (a simulated
  terminal, a packet travelling between routers).
- Async JS (Promise, async/await, setTimeout ordering) is not in the JS tracer: show it with hand-written
  scene steps and an interactive demo; HTML exercises can check `__logs` after timers (the check runs ~200ms
  after load).

## SQL, Go, Rust, Dart and Flutter (stages 7 to 12)

- **SQL runs** in a fresh in-browser Postgres (PGlite) per run: `code.runnerLang: "sql"` with
  `code.runnerSetup` (CREATE TABLE / INSERT statements the learner starts with),
  `playground: { kind: "sql", intro, starter, setup, challenges }`, and exercises `lang: "sql"` with
  `setup`. Output is a text table: a header line `col | col`, then one line per row (NULL for nulls), so
  `expected` is e.g. `"name | age\nSara | 20"`. Statements without rows print nothing. Use ORDER BY so rows
  come out in a fixed order.
- **Go, Rust and Dart run** (since 2026-11-21) on the run server (`/api/run`, Piston); the validator
  runs them with the local toolchains (`scripts/native.mjs`). Use `code.runnerLang: "go" | "rust" | "dart"`
  and exercises `lang: "go" | "rust" | "dart"`. Every runnable snippet is a **complete program** (Go:
  `package main`, imports, `func main()`; Rust: `fn main()`; Dart: `void main()`), and Go code must compile
  (no unused imports or variables). Their `fill` exercises must also set `answer` (the one correct option):
  until the run server is live, the site checks order/fill against the answer and shows fix/write
  solutions. Scenes in these languages are hand-written steps (no tracer), the playground is a JS or Python
  `kind: "trace"` simulation of the idea, and predict/quiz show real code in the language.
  Flutter widget code cannot run (it needs a device): Flutter lessons use Dart-only runnable parts
  (models, state logic) and show widget code in scenes.
- **Language tracks** (`src/content/tracks.ts`, `docs/TRACKS_PLAN.md`): a track lesson is about one
  language: `singleLanguage: true`, slug with the track prefix (`py-`, `go-`, `rs-`, `ts-`, `dart-`, `js-`),
  `stage: 0`, `number` "<level>.<n>" (e.g. "2.3"), `next` = the following lesson in the track. Every
  station uses that language (JS/TS/Python: their tracer and runner; Go/Rust/Dart: see above). Higher levels
  teach what professionals actually do and why, with real-world programs, not toy syntax. A track level's
  project is `src/content/projects/<slug>.ts` with `stage: 0, track: "py", level: 1`. For Go/Rust/Dart
  projects the learner writes functions/types **without `main`**; each test's `code` is a complete `main`
  that calls them and prints `true` (Go: the learner's code starts with `package main` and its imports, and
  the test may only use packages the learner imported, so the starter imports `fmt`).
- **Backend lessons** (Node, Go, Python servers): simulate a server as a plain function
  `handle(request) → response` over objects, which traces well; Express/Flask/net/http code itself is
  shown in scenes, not run.

## Check before you finish

```bash
node scripts/check-lessons.mjs <slug>
npx tsc --noEmit
```

The first must print `✔ <slug>` (a warning that the demo is not registered yet is expected). Fix every `✖`.
Then reread your lesson as a confused beginner: is there a step where they would ask "why?" without the
animation answering it? Fix that step.
