# Brief for a track-lesson writer

You are writing lessons for Faahem (فاهم), an Arabic interactive programming course (Next.js app in
`C:\Users\dhail\Desktop\Projects\faahem`). The owner wants each language taught from the basics to
professional level in a language track (`src/content/tracks.ts`, plan in `docs/TRACKS_PLAN.md`).

Before writing anything, read:
1. `docs/LESSON_GUIDE.md` (whole file; the sections "Lessons beyond JavaScript", "SQL, Go, Rust, Dart and
   Flutter" and the "Language tracks" bullet apply directly).
2. `src/lib/types.ts` (the `Lesson`, `Exercise`, `Project` types).
3. A model lesson in your language if one exists, and `src/content/lessons/variables.ts` for tone and length:
   - Python: `src/content/lessons/decompose.ts` or `queue.ts`; TypeScript: `typescript.ts`;
     Rust: `ownership.ts`, `borrowing.ts`; Dart: `dart.ts`; Go: `go-server.ts`.
4. A model demo: `src/components/problems/ScoreProblem.tsx` and one more in `src/components/problems/`.
5. Your track's entry in `src/content/tracks.ts`: lesson slugs and Arabic titles are fixed there; use them
   exactly. `number` is "<level>.<position in the level>" (count the level's lessons in tracks.ts, including
   lessons that already exist). `next` is the next slug in the track (the last lesson of a level points to
   the next level's first lesson; keep `next` unset only at the track's very end).

What to produce for each lesson you own:
- `src/content/lessons/<slug>.ts` exporting `<camelSlug>: Lesson` (only `import type` from `@/lib/types`).
- `src/components/problems/<Pascal>Problem.tsx`, the station-1 demo, with `problem.demo` = the camelCase slug.
- All seven stations in the lesson's own language (`singleLanguage: true`, `stage: 0`).

The level's project, if you own it: `src/content/projects/<slug>.ts` exporting a `Project` with
`stage: 0, track: "<track id>", level: <n>`, a real small program in the language with 6-10 tests, a
`solution` that passes all tests and a `starter` that fails at least one. Model: `src/content/projects/problem-set.ts`.

Standards:
- Arabic text (MSA, short warm sentences). Code, identifiers and comments in English.
- These are the BASICS of a real path to professional level: correct, precise, idiomatic code as a
  professional writes it in that language (Go: gofmt style; Rust: rustfmt, 2021 edition; Python: PEP 8;
  TS: strict-mode style; Dart: dart format, sound null safety). Explain the machine-level picture
  (memory, values, references) the way the existing lessons do.
- Never tell the learner "don't memorize"; frame things positively.
- Do not edit shared files (registries `index.ts`, `published.ts`, `tracks.ts`, components outside your
  demos, types, scripts). Do not run `npm run registry`, `gen-registry`, `next build` or the dev server:
  other writers are working in parallel and the maintainer registers everything at the end.

Check before you finish, for every lesson and project you wrote:
```bash
cd /c/Users/dhail/Desktop/Projects/faahem
node scripts/check-lessons.mjs <slug> [<slug> ...]
node scripts/check-projects.mjs        # if you wrote a project (it checks all projects)
npx tsc --noEmit -p .
```
`check-lessons` must print `✔ <slug>` for each (a warning that the demo is not registered yet is expected).
Go/Rust compile slowly the first time; that is normal. Fix every `✖` and every tsc error in your files.

Report back in under 150 words: the files you wrote, the check results, and anything you could not do.
