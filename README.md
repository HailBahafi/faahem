# فاهم — افهم البرمجة، لا تحفظها

منصة تعليم فل ستاك تفاعلية بالعربي: كل مفهوم تراه متحركاً داخل الذاكرة قبل أن تكتبه، ثم تكتبه بست لغات
(JavaScript، TypeScript، Python، Go، Dart، Rust)، ثم تطبّقه وتُختبر فيه.

## التشغيل

```bash
npm install
npm run dev
```

ثم افتح http://localhost:3000

للحسابات ومزامنة التقدّم: `npm run db:lite` (أو `npm run db:up` مع Docker)، ثم `npm run db:migrate`. التفاصيل والنشر في [docs/DEPLOY.md](docs/DEPLOY.md).

## شكل كل درس: 7 محطات

| # | المحطة | المكوّن |
|---|---|---|
| 1 | المشكلة | `stations/ProblemDemo.tsx` (خاص بكل درس) |
| 2 | شاهد | `scene/ScenePlayer.tsx` مع `CodePanel` و `MemoryView` |
| 3 | العب | `stations/Sandbox.tsx`: سطر بسطر إلى الذاكرة |
| 4 | توقّع | `stations/Predict.tsx`: سؤال ثم أنميشن الجواب |
| 5 | الكود | زر تبديل اللغات + `stations/CodeRunner.tsx` (JS في Web Worker) |
| 6 | طبّق | `stations/Exercises.tsx`: رتّب، أكمل، أصلح، اكتب |
| 7 | اختبر | `stations/Quiz.tsx`: النجاح من 80% يُكمل الدرس |

## المتتبّع والمراجعة

- `/visualize`: اكتب أي JavaScript وشاهد كل خطوة: السطر الحالي، المكدّس وإطاراته، الكومة بمصفوفاتها وكائناتها، والأسهم.
  المفسّر في `src/lib/tracer/tracer.ts`، واختباراته: `npm test`.
- محرّر كل درس فيه زر "شاهد التنفيذ" يمرّر كود المتعلم إلى المتتبّع.
- `/review`: كل درس مكتمل يعود للمراجعة بعد 1، 3، 7، 16، 35 يوماً. الخطأ يعيده إلى الغد (`src/lib/review.ts`).

## المحتوى

- 75 درساً في 13 مرحلة (من كيف يعمل الحاسوب إلى تصميم الأنظمة)، لكل درس ديمو تفاعلي ومحطاته السبع.
- 11 مشروعاً للمراحل في `/project/<slug>` تُختبر تلقائياً (JS/Python/HTML/SQL)، أو بخطوات على جهازك (Git، Flutter، Rust، النشر).
- شهادة قابلة للطباعة لكل مرحلة تكملها في `/certificate/<رقم المرحلة>`.
- اللغات التي تعمل في المتصفح: JavaScript، TypeScript، Python (Pyodide)، HTML/CSS، SQL (PGlite). Go و Rust و Dart تُعرض فقط.

## السكربتات

| الأمر | ما يفعله |
|---|---|
| `npm run registry` | يولّد فهارس الدروس والديموهات والمشاريع من الملفات (شغّله بعد إضافة درس أو مشروع) |
| `npm run check:lessons` | يشغّل كل تمرين وحلّه ويتحقق من كل درس |
| `node scripts/check-projects.mjs` | يتحقق أن حل كل مشروع ينجح في كل اختباراته |
| `npm test` | اختبارات المتتبّعَين (JS و Python) ودمج التقدّم |

## إضافة درس

1. أنشئ `src/content/lessons/<slug>.ts` بنوع `Lesson` (`src/lib/types.ts`). انسخ `variables.ts` كقالب.
2. المشهد (`scene`) كود بكل لغة بنفس عدد الأسطر، وقائمة خطوات. كل خطوة تقول: أي سطر يعمل، ماذا يُقال،
   وكيف تبدو الذاكرة بعده (`memory`، `changed`، `read`، `copy`، `error`، `output`).
3. التمارين تُصحَّح بتشغيل JavaScript ومقارنة ما يُطبع بـ `expected`.
4. شغّل `npm run registry` ثم `npm run check:lessons`. الخارطة (`src/content/roadmap.ts`) تفتحه تلقائياً.

الدليل الكامل لكتابة الدروس (كل اللغات): [docs/LESSON_GUIDE.md](docs/LESSON_GUIDE.md).

قبل كتابة أي درس: ما الصورة الذهنية التي يجب أن يخرج بها المتعلم؟ ارسمها أولاً، ثم اكتب الخطوات.

## البنية

```
src/
  app/                 الصفحات: الرئيسية، /roadmap، /learn/[slug]
  components/scene/    محرّك الأنميشن: المشغّل، لوحة الكود، الذاكرة
  components/stations/ المحطات السبع
  components/lesson/   صفحة الدرس
  content/             الدروس وخارطة الطريق
  lib/                 الأنواع، تشغيل JS، المتتبّع، المراجعة، حفظ التقدّم (localStorage)
tests/                 اختبارات المتتبّع
```

الخطة الكاملة: [docs/PLAN.md](docs/PLAN.md).
