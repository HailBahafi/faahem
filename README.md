# Faahem (فاهم): watch code run, and understand why

An interactive, animated full-stack course in Arabic. Every concept is first shown moving through the
machine's memory, then written and run, then practised and tested. Alongside the general roadmap, each
language has its own track from the basics to professional level.

Live: https://faahem-rho.vercel.app

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

For accounts and progress sync, start a database with `npm run db:lite` (or `npm run db:up` with
Docker), then run `npm run db:migrate`. Details and deployment: [docs/DEPLOY.md](docs/DEPLOY.md).

## Content

- **General roadmap:** 75 lessons in 13 stages, from how a computer works to system design, with
  a project per stage.
- **Language tracks** (`/tracks`): four levels per language (basics, intermediate, advanced,
  professional), each with a project and a certificate.

  | Track | Basics | Intermediate | Advanced | Professional |
  |---|---|---|---|---|
  | JavaScript | ✅ | ✅ | ✅ | ✅ |
  | TypeScript | ✅ | ✅ | ✅ | ✅ |
  | Python, Go, Rust, Dart | ✅ | planned | planned | planned |

  Plan and curriculum: [docs/TRACKS_PLAN.md](docs/TRACKS_PLAN.md).
- **Totals:** 158 lessons and 22 projects. Projects are tested automatically against the learner's
  code. Each completed stage or level gets a printable certificate.

## Every lesson: 7 stations

| # | Station | What happens |
|---|---|---|
| 1 | Problem | An interactive demo of the problem the concept solves |
| 2 | Watch | An animated scene: current line, memory, stack frames and heap |
| 3 | Play | A playground: edit code and watch it traced step by step |
| 4 | Predict | Guess the output, then watch the answer run |
| 5 | Code | Real code in an editor with a Run button |
| 6 | Practise | Order, fill in, fix, write; each answer is run and checked |
| 7 | Quiz | Tracing questions; 80% completes the lesson |

Completed lessons come back for spaced review after 1, 3, 7, 16 and 35 days (`/review`).

## Where code runs

| Language | Runs in | Animated by |
|---|---|---|
| JavaScript, TypeScript | a Web Worker in the browser (TS after type stripping) | the JS tracer (`src/lib/tracer`) |
| Python | Pyodide in the browser | the Python tracer (`src/lib/python`) |
| HTML/CSS | a sandboxed frame | — |
| SQL | PGlite (Postgres in the browser) | — |
| Go, Rust, Dart | the run server (`/api/run`, a Piston instance at `RUN_SERVICE_URL`) | hand-written scenes |

Until the run server is hosted, Go/Rust/Dart order and fill exercises are checked against their
answer, and fix/write exercises show the solution.

## Scripts

| Command | What it does |
|---|---|
| `npm run registry` | Regenerates the lesson, demo and project indexes from the files (run after adding one) |
| `npm run check:lessons` | Runs every exercise and solution in its language and validates every lesson |
| `node scripts/check-projects.mjs` | Checks each project's solution passes every test and its starter fails |
| `npm test` | Tests for the JS and Python tracers and progress merging |

On Windows, Smart App Control blocks freshly compiled Go/Rust programs, so local checks only compile
them. GitHub Actions (`.github/workflows/check.yml`, Linux) runs everything on every push.
`FAAHEM_NATIVE=1` forces local runs.

## Adding a lesson

1. Read [docs/LESSON_GUIDE.md](docs/LESSON_GUIDE.md) (and [docs/TRACK_WRITER_BRIEF.md](docs/TRACK_WRITER_BRIEF.md)
   for track lessons).
2. Create `src/content/lessons/<slug>.ts` with the `Lesson` type (`src/lib/types.ts`) and its demo in
   `src/components/problems/<Name>Problem.tsx`.
3. Add the slug to `src/content/roadmap.ts` or `src/content/tracks.ts`.
4. Run `npm run registry`, then `node scripts/check-lessons.mjs <slug>`.

Before writing a lesson, decide the mental picture the learner should leave with, then build every
station around it.

## Layout

```
src/
  app/                 pages: home, /roadmap, /tracks, /learn/[slug], /project/[slug], certificates, API routes
  components/scene/    animation engine: player, code panel, memory view
  components/stations/ the seven stations
  components/problems/ one interactive demo per lesson
  content/             lessons, projects, roadmap, tracks
  lib/                 types, runners, tracers, review, progress, accounts
scripts/               registry generator and validators
tests/                 unit tests
db/                    Postgres schema
```

The original project plan: [docs/PLAN.md](docs/PLAN.md).
