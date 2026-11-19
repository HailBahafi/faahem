import type { Cell, Lesson } from "@/lib/types";

type St = "wait" | "run" | "ok" | "fail" | "skip";
const WORD: Record<St, string> = { wait: "ينتظر", run: "يعمل…", ok: "✓ نجح", fail: "✗ فشل", skip: "تُخطّي" };
const st = (name: string, s: St): Cell => ({ name, value: WORD[s], type: s === "ok" ? "boolean" : "none" });
const live = (v: string): Cell => ({ name: "live", value: `"shop:${v}"`, type: "string" });
const push = (id: string): Cell => ({ name: "push", value: `"${id} → main"`, type: "string" });

const board = (c: St, i: St, l: St, t: St, d: St, v = "a1f", id = "b7c"): Cell[] => [
  push(id),
  st("checkout", c),
  st("install", i),
  st("lint", l),
  st("test", t),
  st("deploy", d),
  live(v),
];

const LOG = ["✓ checkout b7c", "✓ npm ci (214 packages)", "✓ lint: 0 problems", "✓ test: 38 passed"];

export const ciCd: Lesson = {
  slug: "ci-cd",
  stage: 11,
  number: "11.3",
  title: "CI/CD",
  subtitle: "روبوت يقرأ ملف YAML عند كل push: يختبر كل تغيير، وينشر الناجح وحده",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "من يحرس الباب بين جهازك والمستخدمين؟",
    body: "ادفع ثلاثة تعديلات: واحد يكسر اختباراً، وواحد يكسر قواعد الكتابة، وواحد سليم. راقب المراحل تخضرّ أو تحمرّ: أيها يصل إلى الخادم؟ ثم ادفع تعديلاً تفوته الاختبارات، واضغط التراجع.",
    demo: "ciCd",
  },
  scene: {
    code: {
      text: `on: push
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm test
  deploy:
    needs: ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./deploy.sh  # docker build + compose up`,
    },
    notes: {
      text: "هذا الملف يعيش في المستودع نفسه: .github/workflows/ci.yml. فهو يتغيّر بـ commit مثل أي كود، ويُراجَع مثله، وكل فرع يحمل نسخته منه.",
    },
    steps: [
      {
        line: null,
        say: "الخادم يشغّل الآن الصورة shop:a1f. دفعت للتو commit رقمه b7c إلى main. لم يفتح أحد طرفية على الخادم، ومع ذلك سيصل التعديل إلى المستخدمين بعد دقائق، أو لن يصل أبداً.",
        memory: board("wait", "wait", "wait", "wait", "wait"),
      },
      {
        line: 1,
        say: "GitHub يقرأ هذا الملف عند كل push. السطر الأول هو الزناد: حدث push يوقظ الروبوت (GitHub Actions) ويعطيه رقم الصورة b7c.",
        memory: board("wait", "wait", "wait", "wait", "wait"),
        read: ["push"],
      },
      {
        line: 4,
        say: "الوظيفة ci تبدأ على حاسوب جديد فارغ تماماً، يُستأجر لدقائق ثم يُرمى. لا شيء من جهازك هنا: لا node_modules، ولا ملف نسيت أن تضيفه إلى Git.",
        memory: board("run", "wait", "wait", "wait", "wait"),
        changed: ["checkout"],
      },
      {
        line: 6,
        say: "checkout ينسخ المستودع كما هو في الصورة b7c بالضبط. ما لم يدخل commit لا يراه الروبوت، وهذا ما يكشف عبارة «يعمل على جهازي».",
        memory: board("ok", "run", "wait", "wait", "wait"),
        changed: ["checkout", "install"],
        output: LOG.slice(0, 1),
      },
      {
        line: 7,
        say: "npm ci يثبّت الحزم بالإصدارات المسجّلة في package-lock.json حرفياً. كل تشغيل يبدأ من الحالة نفسها، فالنتيجة لا تعتمد على حظ الجهاز.",
        memory: board("ok", "ok", "run", "wait", "wait"),
        changed: ["install", "lint"],
        output: LOG.slice(0, 2),
      },
      {
        line: 8,
        say: "lint يقرأ الكود دون أن يشغّله: متغير غير معرّف، استيراد منسي، تنسيق مخالف. لو فشل لتوقفت الوظيفة هنا، وبقيت المراحل التالية رمادية.",
        memory: board("ok", "ok", "ok", "run", "wait"),
        changed: ["lint", "test"],
        output: LOG.slice(0, 3),
      },
      {
        line: 9,
        say: "npm test يشغّل الاختبارات. نجحت كلها، فصارت الوظيفة ci خضراء. هذا هو التكامل المستمر (CI): كل تغيير يُختبر بعد دقائق من كتابته، لا بعد أسابيع.",
        memory: board("ok", "ok", "ok", "ok", "wait"),
        changed: ["test"],
        output: LOG,
      },
      {
        line: 11,
        say: "needs: ci يعني: لا تبدأ قبل أن تنتهي ci خضراء. لو احمرّت مرحلة واحدة هناك لما بدأ النشر أصلاً، ولبقي الخادم على a1f.",
        memory: board("ok", "ok", "ok", "ok", "wait"),
        read: ["test"],
        output: LOG,
      },
      {
        line: 12,
        say: "الشرط يُقيَّم: الدفع كان إلى main، فالشرط صحيح وننتقل إلى خطوات النشر. دفعة إلى فرع آخر كانت ستُختبر فقط، ولا تُنشر.",
        memory: board("ok", "ok", "ok", "ok", "run"),
        changed: ["deploy"],
        read: ["push"],
        output: LOG,
      },
      {
        line: 16,
        say: "deploy.sh يبني الصورة shop:b7c (درس Docker) ويشغّل حاويتها بدل القديمة. هذا هو النشر المستمر (CD): ما ينجح على main يصل إلى المستخدمين دون يد بشرية.",
        memory: board("ok", "ok", "ok", "ok", "ok", "b7c"),
        changed: ["deploy", "live"],
        output: [...LOG, "✓ deploy: shop:b7c is live"],
      },
      {
        line: null,
        say: "الصورة القديمة shop:a1f ما زالت محفوظة. لو ظهر خطأ لم تلتقطه الاختبارات، فالتراجع هو نشر a1f من جديد: ثوانٍ، لا إصلاح متعجّل في منتصف الليل.",
        memory: [...board("ok", "ok", "ok", "ok", "ok", "b7c").slice(0, 6), live("b7c"), { name: "previous", value: '"shop:a1f"', type: "string" }],
        read: ["previous"],
        output: [...LOG, "✓ deploy: shop:b7c is live"],
      },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذا خط إنتاج مصغّر بكائنات JavaScript: المراحل قائمة، والـ commit كائن يقول أي مرحلة ستنجح. الحلقة تتوقف عند أول فشل، والنشر يحدث فقط إن بقي كل شيء أخضر وكان الفرع main.",
    starter: `let stages = ["checkout", "install", "lint", "test"];
let commit = { id: "c9d", branch: "main", lintOk: true, testsOk: false };
let live = "b7c";
let green = true;
for (let i = 0; i < stages.length; i++) {
  let ok = true;
  if (stages[i] === "lint") ok = commit.lintOk;
  if (stages[i] === "test") ok = commit.testsOk;
  if (!ok) {
    console.log("fail", stages[i]);
    green = false;
    break;
  }
  console.log("ok", stages[i]);
}
if (green && commit.branch === "main") {
  live = commit.id;
  console.log("deployed", live);
} else {
  console.log("blocked, live stays", live);
}`,
    challenges: [
      "اجعل testsOk = true وتوقّع قبل أن تضغط: أي سطر يُطبع في الآخر، وما قيمة live؟",
      "أبقِ الاختبارات ناجحة، واجعل branch = \"feature\". لماذا لا يتغيّر live مع أن كل شيء أخضر؟",
      "اجعل lintOk = false. كم مرحلة تعمل الآن؟ هل وصلت الحلقة إلى test أصلاً؟",
      "احذف سطر break وشغّل مع testsOk = false. ماذا تغيّر في المطبوع؟ وهل كان سيُنشر؟",
    ],
  },
  predict: [
    {
      question: "فشل lint. ماذا يطبع الخط؟",
      code: `let stages = ["checkout", "install", "lint", "test"];
let failAt = "lint";
for (let i = 0; i < stages.length; i++) {
  if (stages[i] === failAt) {
    console.log("fail", stages[i]);
    break;
  }
  console.log("ok", stages[i]);
}`,
      options: ["ok checkout، ok install، fail lint", "ok checkout، ok install، fail lint، ok test", "fail lint فقط"],
      answer: 0,
      why: "المراحل تعمل بالترتيب، وأول فشل يوقف الوظيفة. المراحل قبله نجحت فعلاً، و test لم تعمل أصلاً: لا معنى لاختبار كود لا يجتاز حتى الفحص الأول.",
    },
    {
      question: "كل الاختبارات نجحت على الفرع feature. ما الذي يعمل الآن على الخادم؟",
      code: `let live = "b7c";
let run = { id: "d4e", branch: "feature", green: true };
if (run.green && run.branch === "main") {
  live = run.id;
}
console.log(live);`,
      options: ["d4e", "b7c", "لا شيء: الخادم توقف"],
      answer: 1,
      why: "الأخضر شرط لازم لا كافٍ. الشرط يطلب الفرع main أيضاً، فالفرع feature يُختبر ليطمئنك قبل الدمج، والخادم يبقى على b7c.",
    },
    {
      question: "نُشرت c9d فظهر خطأ لا تلتقطه الاختبارات. التراجع يعيد نشر النسخة السابقة. ماذا يُطبع؟",
      code: `let deploys = ["a1f", "b7c", "c9d"];
let previous = deploys[deploys.length - 2];
deploys.push(previous);
console.log(deploys[deploys.length - 1], deploys.length);`,
      options: ["b7c 3", "b7c 4", "a1f 4"],
      answer: 1,
      why: "التراجع ليس محواً للتاريخ: هو نشر جديد لصورة قديمة جاهزة. السجل يكبر إلى 4، وآخر ما يعمل هو b7c، ثم تصلح c9d بهدوء وتدفع إصلاحاً يمرّ بالخط كاملاً.",
    },
  ],
  code: {
    intro: "هذا ملف workflow كامل لمشروع Node. ضعه في .github/workflows/ci.yml وادفعه، ثم افتح تبويب Actions في مستودعك على GitHub وراقب المراحل. وفي إعدادات الفرع main فعّل «Require status checks» حتى يمنع الخط الأحمر الدمج.",
    runnerLang: "text",
    runnerStarter: `# .github/workflows/ci.yml
name: ci
on:
  push:                     # every push to any branch
  pull_request:             # and every pull request
jobs:
  ci:
    runs-on: ubuntu-latest  # a fresh machine each time
    steps:
      - uses: actions/checkout@v4      # the repo at this commit
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci                    # exact versions from the lock file
      - run: npm run lint              # read the code without running it
      - run: npm test                  # run the tests: any failure = red
  deploy:
    needs: ci                          # only after ci is green
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t shop:\${{ github.sha }} .
      - run: ./deploy.sh shop:\${{ github.sha }}   # keep the old image for rollback
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "خطوات الوظيفة ci",
      prompt: "رتّب خطوات الوظيفة كما يجب أن ينفّذها الروبوت على الحاسوب الفارغ.",
      lines: ["- uses: actions/checkout@v4", "- run: npm ci", "- run: npm run lint", "- run: npm test"],
      expected: "✓ test: 38 passed",
    },
    {
      kind: "fill",
      lang: "text",
      title: "لا نشر قبل الأخضر",
      prompt: "أي كلمة تجعل وظيفة النشر تنتظر نجاح الاختبارات، ولا تبدأ إن فشلت؟",
      template: "deploy:\n  ___: ci\n  runs-on: ubuntu-latest",
      options: ["needs", "on", "uses"],
      answer: "needs",
      expected: "deploy waits for ci",
    },
    {
      kind: "fix",
      title: "حارس لا يحرس",
      prompt: "هذا الخط ينشر c9d مع أن اختباراتها فشلت. أصلح الشرط حتى لا يُنشر إلا الأخضر على main، فيبقى الخادم على b7c.",
      code: `let results = { lint: true, test: false };
let branch = "main";
let live = "b7c";
let candidate = "c9d";
if (branch === "main") {
  live = candidate;
}
console.log("live:", live);`,
      expected: "live: b7c",
      hint: "الشرط ينظر إلى الفرع فقط. أضف إليه نتيجتي lint و test بـ &&.",
      solution: `let results = { lint: true, test: false };
let branch = "main";
let live = "b7c";
let candidate = "c9d";
if (results.lint && results.test && branch === "main") {
  live = candidate;
}
console.log("live:", live);`,
    },
    {
      kind: "write",
      title: "زر التراجع",
      prompt: "deploys سجل النشرات بالترتيب، وآخرها c9d معطوبة. أضف إلى آخر السجل النسخة التي قبلها (التراجع نشر جديد)، ثم اطبع ما يعمل الآن وعدد النشرات بهذا الشكل: live: b7c ثم deploys: 4",
      starter: `let deploys = ["a1f", "b7c", "c9d"];
// انشر النسخة السابقة من جديد، ثم اطبع live وعدد النشرات
`,
      expected: "live: b7c\ndeploys: 4",
      hint: "النسخة السابقة في deploys[deploys.length - 2]. أضفها بـ push، ثم آخر عنصر هو ما يعمل.",
      solution: `let deploys = ["a1f", "b7c", "c9d"];
let previous = deploys[deploys.length - 2];
deploys.push(previous);
console.log("live:", deploys[deploys.length - 1]);
console.log("deploys:", deploys.length);`,
    },
  ],
  quiz: [
    {
      question: "الخط فيه checkout ثم npm ci ثم lint ثم test. فشل npm ci لأن حزمة غير موجودة. ماذا يحدث لـ test؟",
      options: ["تعمل وتفشل", "لا تعمل أصلاً، وتظهر رمادية", "تعمل وتنجح لأنها لا تحتاج الحزم"],
      answer: 1,
      why: "الوظيفة تمشي خطوة خطوة وتتوقف عند أول فشل. ما بعد الخطوة الحمراء يُتخطّى، فالخط كله أحمر والسبب في سطر واحد تقرؤه في سجل تلك الخطوة.",
    },
    {
      question: "الاختبارات تنجح على جهازك، وتفشل في الخط: Cannot find module 'dayjs'. ما السبب الأرجح؟",
      options: [
        "GitHub معطّل",
        "ثبّتت dayjs على جهازك ولم تُسجَّل في package.json، والحاسوب الفارغ لا يملكها",
        "الاختبارات عشوائية",
      ],
      answer: 1,
      why: "الروبوت يبدأ من حاسوب فارغ ولا يرى إلا ما في الـ commit. node_modules عندك فيها الحزمة، والمستودع لا يذكرها. هذه بالضبط فائدة CI: يكشف الفرق بين جهازك والحقيقة قبل المستخدمين.",
    },
    {
      question: "فتحت pull request إلى main، والفحص ci أحمر، والفرع محميّ بـ «Require status checks». ماذا يحدث عند محاولة الدمج؟",
      options: ["يُدمج ويُنشر", "زر الدمج معطّل حتى يخضرّ الفحص", "يُدمج ولا يُنشر"],
      answer: 1,
      why: "الحماية تجعل نتيجة الخط شرطاً للدمج. الكود الأحمر لا يدخل main، فلا يصل إلى وظيفة النشر أبداً. أصلح، وادفع إلى الفرع نفسه، فيعمل الخط من جديد.",
    },
    {
      question: "فريق ينشر مرة كل شهرين بـ 80 تعديلاً، وفريق ينشر كل يوم بتعديلين. ظهر خطأ بعد النشر عند الاثنين. أين يُعثر على السبب أسرع؟",
      options: ["عند الفريق الشهري، لأن نشره مختبر أكثر", "عند الفريق اليومي: السبب أحد تعديلين", "لا فرق"],
      answer: 1,
      why: "كل نشر صغير يضيّق دائرة الشك. تعديلان يعني مشتبهين اثنين، والتراجع عنهما لا يُسقط عمل شهرين. النشر الصغير المتكرر أقل خطراً، لا أكثر.",
    },
    {
      question: "نُشرت c9d قبل دقيقتين، والمستخدمون يرون أخطاء لم تلتقطها الاختبارات. ما أسرع طريق لإيقاف الضرر؟",
      code: "images: shop:a1f  shop:b7c  shop:c9d (live)",
      options: ["إصلاح الكود ودفعه فوراً", "إعادة نشر shop:b7c الجاهزة", "حذف c9d من Git"],
      answer: 1,
      why: "الصورة b7c مبنية ومختبرة ونجحت في الإنتاج، فنشرها ثوانٍ. الإصلاح المتعجّل يمرّ بالخط كاملاً وقد يحمل خطأ جديداً. أوقف الضرر أولاً، ثم أصلح بهدوء.",
    },
  ],
  next: "monitoring",
};
