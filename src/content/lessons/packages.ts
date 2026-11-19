import type { Cell, Lesson, Scene } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
/** The three drawers a project keeps: the manifest, the lock file, and the downloaded code. */
const proj = (deps: string, lock: string, modules: string): Cell[] => [s("package.json", deps), s("package-lock.json", lock), s("node_modules", modules)];

const mini = (code: string, steps: Scene["steps"]): Scene => ({ code: { shell: code }, steps });

export const packages: Lesson = {
  slug: "packages",
  stage: 4,
  number: "4.3",
  title: "مدير الحزم",
  subtitle: "لا أحد يكتب كل شيء: كيف تستعمل كود غيرك بأمان وبالنسخة نفسها على كل جهاز",
  minutes: 14,
  singleLanguage: true,
  problem: {
    title: "حزمة واحدة... كم تجرّ خلفها؟",
    body: "اضغط «ثبّت» على حزمة، وراقب شجرة الاعتماديات وهي تتفتّح: كل حزمة تحتاج حزماً أخرى. قارن ما طلبته بما نزل فعلاً إلى مشروعك.",
    demo: "packages",
  },
  scene: {
    code: {
      shell: `$ npm init -y
Wrote to /home/sara/shop/package.json
$ npm install express
added 65 packages in 3s
$ cat package.json
{ "dependencies": { "express": "^4.19.2" } }
$ ls
node_modules  package.json  package-lock.json`,
    },
    notes: {
      shell: "كل لغة لها مدير حزم بالفكرة نفسها: pip install requests مع requirements.txt في Python، و cargo add serde مع Cargo.toml و Cargo.lock في Rust، و go get مع go.mod و go.sum في Go، و dart pub add http مع pubspec.yaml و pubspec.lock في Dart.",
    },
    steps: [
      {
        line: null,
        say: "نريد متجراً على الويب. كتابة خادم HTTP من الصفر تأخذ شهوراً، وقد كتبه غيرنا ونشره باسم express. الحزمة كود منشور في سجلّ عام (npmjs.com)، ومدير الحزم npm هو من يجلبه.",
        memory: proj("(not yet)", "(not yet)", "(empty)"),
      },
      {
        line: 1,
        say: "npm init يكتب ملف البيان package.json: بطاقة المشروع، فيها اسمه وقائمة ما يعتمد عليه. القائمة فارغة الآن.",
        memory: proj("{}", "(not yet)", "(empty)"),
        changed: ["package.json"],
        output: ["Wrote to /home/sara/shop/package.json"],
      },
      {
        line: 3,
        say: "npm install express: يسأل npm السجلّ عن express، فيجد أحدث نسخة 4.19.2 وينزّل كودها إلى مجلد node_modules داخل مشروعك.",
        memory: proj("{}", "(not yet)", "express"),
        changed: ["node_modules"],
        output: ["Wrote to /home/sara/shop/package.json"],
      },
      {
        line: 3,
        say: "لكن express نفسه يعتمد على حزم أخرى (body-parser و debug و cookie...)، وهي تعتمد على غيرها. npm يمشي في هذه الشجرة كلها، وينزّل كل حزمة مرة واحدة فقط ولو طلبها أكثر من فرع.",
        memory: proj("{}", "(not yet)", "express + 64 more"),
        changed: ["node_modules"],
        output: ["Wrote to /home/sara/shop/package.json"],
      },
      {
        line: 3,
        say: "ثم يسجّل في البيان ما طلبته أنت فقط: express بالنسخة ^4.19.2. العلامة ^ تعني: أقبل أي نسخة 4.x أحدث، ولا أقبل 5.",
        memory: proj("express ^4.19.2", "(not yet)", "express + 64 more"),
        changed: ["package.json"],
        output: ["Wrote to /home/sara/shop/package.json"],
      },
      {
        line: 4,
        say: "وأخيراً يكتب ملف القفل package-lock.json: النسخة الدقيقة لكل حزمة من الـ 65 ومن أين جاءت. هذا ما يجعل جهاز زميلك ينزّل الكود نفسه حرفاً بحرف.",
        memory: proj("express ^4.19.2", "65 exact versions", "express + 64 more"),
        changed: ["package-lock.json"],
        output: ["Wrote to /home/sara/shop/package.json", "added 65 packages in 3s"],
      },
      {
        line: 6,
        say: "البيان قصير: سطر واحد طلبته. أما الـ 64 الأخرى فتابعة لـ express، ويعرفها ملف القفل.",
        memory: proj("express ^4.19.2", "65 exact versions", "express + 64 more"),
        read: ["package.json"],
        output: ["Wrote to /home/sara/shop/package.json", "added 65 packages in 3s", '{ "dependencies": { "express": "^4.19.2" } }'],
      },
      {
        line: 8,
        say: "ثلاثة أشياء في المشروع. ترفع إلى Git البيان والقفل فقط. أما node_modules فثقيل، ويعيد بناءه أي جهاز بأمر npm install من القفل.",
        memory: proj("express ^4.19.2", "65 exact versions", "express + 64 more"),
        read: ["package-lock.json"],
        output: ["Wrote to /home/sara/shop/package.json", "added 65 packages in 3s", '{ "dependencies": { "express": "^4.19.2" } }', "node_modules  package.json  package-lock.json"],
      },
      {
        line: 8,
        say: "رقم النسخة 4.19.2 ثلاثة أجزاء: major.minor.patch. الأخير إصلاح أخطاء، والأوسط ميزة جديدة لا تكسر شيئاً، والأول تغيير قد يكسر كودك. وتذكّر: كل حزمة من الـ 65 كود كتبه غرباء ويعمل على جهازك.",
        memory: proj("express ^4.19.2", "65 exact versions", "express + 64 more"),
        output: ["Wrote to /home/sara/shop/package.json", "added 65 packages in 3s", '{ "dependencies": { "express": "^4.19.2" } }', "node_modules  package.json  package-lock.json"],
      },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذا مدير حزم صغير: السجلّ كائن يقول لكل حزمة ما تحتاجه، والدالة install تنزّل الحزمة ثم تنادي نفسها لكل اعتمادية (العودية من المرحلة الأولى). الكائن installed يمنع تنزيل الحزمة نفسها مرتين.",
    starter: `let registry = {
  express: ["parser", "cookie", "debug"],
  parser: ["bytes", "debug"],
  cookie: [],
  debug: ["ms"],
  bytes: [],
  ms: []
};
let installed = {};
let count = 0;
function install(name) {
  if (installed[name]) {
    return;
  }
  installed[name] = true;
  count = count + 1;
  console.log("download " + name);
  for (let dep of registry[name]) {
    install(dep);
  }
}
install("express");
console.log(count + " packages");`,
    challenges: [
      "قبل أن تشغّل: debug مطلوبة من express ومن parser. كم مرة ستُطبع download debug؟",
      "احذف الشرط if (installed[name]) وأسطره الثلاثة. كم حزمة تُعدّ الآن؟ هذا هو التكرار الذي يمنعه npm.",
      "أضف إلى ms اعتمادية جديدة اسمها tiny (وأضف tiny: [] إلى السجلّ). كم حزمة نزلت بسبب سطر install واحد؟",
      "نادِ install(\"debug\") مرة ثانية في آخر البرنامج. هل يتغيّر العدد؟ لماذا؟",
    ],
  },
  predict: [
    {
      question: "A و B كلاهما يحتاج C. كم مرة تُنزَّل C؟",
      code: `let registry = { app: ["A", "B"], A: ["C"], B: ["C"], C: [] };
let installed = {};
function install(name) {
  if (installed[name]) {
    return;
  }
  installed[name] = true;
  console.log("download " + name);
  for (let dep of registry[name]) {
    install(dep);
  }
}
install("app");`,
      options: ["مرة واحدة", "مرتين", "ثلاث مرات"],
      answer: 0,
      why: "عندما يصل B إلى C يجدها في installed فيعود فوراً. مدير الحزم يحفظ ما نزّله، فتعيش في node_modules نسخة واحدة يشترك فيها الجميع.",
    },
    {
      question: "package.json يقول ^4.17.0، ولا يوجد ملف قفل. السجلّ فيه 4.17.0 و 4.19.2 و 5.0.0. أي نسخة ينزّلها npm install؟",
      code: `$ cat package.json
{ "dependencies": { "express": "^4.17.0" } }
$ ls
package.json
$ npm install`,
      scene: mini(
        `$ cat package.json
{ "dependencies": { "express": "^4.17.0" } }
$ ls
package.json
$ npm install
added express 4.19.2`,
        [
          { line: 1, say: "البيان يطلب ^4.17.0: أي 4.x من 4.17.0 فصاعداً.", memory: proj("express ^4.17.0", "(none)", "(empty)"), read: ["package.json"], output: ['{ "dependencies": { "express": "^4.17.0" } }'] },
          { line: 3, say: "لا ملف قفل يثبّت نسخة بعينها.", memory: proj("express ^4.17.0", "(none)", "(empty)"), read: ["package-lock.json"], output: ['{ "dependencies": { "express": "^4.17.0" } }', "package.json"] },
          { line: 5, say: "npm يختار أحدث نسخة يسمح بها النطاق: 4.19.2. أما 5.0.0 فرقمها الأول تغيّر، و ^ لا تقبله.", memory: proj("express ^4.17.0", "express 4.19.2", "express 4.19.2"), changed: ["package-lock.json", "node_modules"], output: ['{ "dependencies": { "express": "^4.17.0" } }', "package.json", "added express 4.19.2"] },
        ],
      ),
      options: ["4.17.0", "4.19.2", "5.0.0"],
      answer: 1,
      why: "^ تعني «متوافق مع 4»: أي minor أو patch أحدث. فيأخذ أحدث 4.x. و 5.0.0 تغيير major قد يكسر الكود، فلا يُقبل تلقائياً.",
    },
    {
      question: "ملف القفل يثبّت express على 4.18.0، وصدرت 4.19.2. زميلك نسخ المشروع وكتب npm ci. ماذا ينزل عنده؟",
      code: `$ cat package-lock.json
"express": { "version": "4.18.0" }
$ npm ci`,
      scene: mini(
        `$ cat package-lock.json
"express": { "version": "4.18.0" }
$ npm ci
added express 4.18.0`,
        [
          { line: 1, say: "القفل مكتوب فيه رقم دقيق: 4.18.0.", memory: proj("express ^4.18.0", "express 4.18.0", "(empty)"), read: ["package-lock.json"], output: ['"express": { "version": "4.18.0" }'] },
          { line: 3, say: "npm ci يقرأ القفل لا النطاق، وينزّل النسخ المكتوبة فيه حرفياً.", memory: proj("express ^4.18.0", "express 4.18.0", "express 4.18.0"), changed: ["node_modules"], output: ['"express": { "version": "4.18.0" }', "added express 4.18.0"] },
          { line: 4, say: "الجهازان الآن يشغّلان الكود نفسه بالضبط. التحديث يحدث فقط عندما يقرره أحدكم ويرفع قفلاً جديداً.", memory: proj("express ^4.18.0", "express 4.18.0", "express 4.18.0"), output: ['"express": { "version": "4.18.0" }', "added express 4.18.0"] },
        ],
      ),
      options: ["4.19.2 لأنها الأحدث", "4.18.0 كما في القفل", "يرفض لأن هناك نسخة أحدث"],
      answer: 1,
      why: "وظيفة القفل أن يكون كل جهاز نسخة طبق الأصل. بدونه قد يأخذ زميلك 4.19.2 وأنت 4.18.0، فيعمل البرنامج عندك ويتعطّل عنده.",
    },
  ],
  code: {
    intro: "لا شيء يُشغَّل هنا: مدير الحزم يعمل في طرفيتك. في مجلد جديد جرّب: npm init -y ثم npm install dayjs، ثم افتح package.json و package-lock.json وانظر إلى node_modules. وفي Python: pip install requests.",
    runnerStarter: "",
    runnerLang: "text",
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "مشروع يستعمل حزمة",
      prompt: "في مجلد فارغ: رتّب الأوامر لتنشئ ملف البيان، ثم تثبّت express، ثم تشغّل برنامجك app.js الذي يستعملها.",
      lines: ["npm init -y", "npm install express", "node app.js"],
      expected: "app.js يعمل باستعمال express",
    },
    {
      kind: "fill",
      lang: "text",
      title: "ما الذي يُرفع؟",
      prompt: "تريد أن يحصل زميلك على النسخ نفسها بالضبط. أي ملف ترفعه مع package.json؟",
      template: "git add package.json ___",
      options: ["package-lock.json", "node_modules", "app.log"],
      answer: "package-lock.json",
      expected: "git add package.json package-lock.json",
    },
    {
      kind: "order",
      lang: "text",
      title: "Rust بالفكرة نفسها",
      prompt: "مدير حزم Rust اسمه cargo. رتّب الأوامر: أنشئ مشروعاً، ادخل مجلده، أضف الحزمة serde، ثم ابنِ المشروع.",
      lines: ["cargo new shop", "cd shop", "cargo add serde", "cargo build"],
      expected: "Cargo.toml فيه serde، و Cargo.lock يثبّت النسخ",
    },
    {
      kind: "fill",
      lang: "text",
      title: "رقم النسخة التالية",
      prompt: "النسخة 2.4.1 فيها خطأ، وأصلحه المؤلف دون أن يغيّر أي شيء آخر. ما رقم النسخة الجديدة؟",
      template: "2.4.1  ->  ___",
      options: ["2.4.2", "2.5.0", "3.0.0"],
      answer: "2.4.2",
      expected: "2.4.2",
    },
  ],
  quiz: [
    {
      question: "طلبت app. كم حزمة تنزل؟",
      code: "app needs A, B\nA needs C\nB needs C, D\nC needs nothing\nD needs nothing",
      options: ["5", "6", "3"],
      answer: 0,
      why: "app و A و B و C و D: خمس. C مطلوبة من فرعين لكنها تنزل مرة واحدة، لأن مدير الحزم يتذكّر ما نزّله.",
    },
    {
      question: "حزمة انتقلت من 1.9.3 إلى 2.0.0. ماذا يخبرك هذا؟",
      options: ["إصلاح خطأ صغير", "ميزة جديدة لا تكسر شيئاً", "تغيير قد يكسر كودك الذي يستعملها"],
      answer: 2,
      why: "الرقم الأول major: يتغيّر عندما يتغيّر شيء يعتمد عليه المستخدمون. لهذا لا تقبله ^ تلقائياً.",
    },
    {
      question: "package.json يقول \"lodash\": \"^4.17.0\". أي نسخة لا يقبلها؟",
      options: ["4.17.21", "4.18.0", "5.0.0"],
      answer: 2,
      why: "^4.17.0 تقبل كل 4.x من 4.17.0 فصاعداً، وتتوقف قبل 5.0.0 لأنها major جديدة.",
    },
    {
      question: "هل ترفع مجلد node_modules إلى Git؟",
      options: ["نعم، وإلا لن يعمل المشروع عند زميلك", "لا: البيان والقفل يكفيان لإعادة بنائه بالنسخ نفسها", "نعم، بدلاً من package.json"],
      answer: 1,
      why: "node_modules يُبنى من الملفين: البيان يقول ماذا، والقفل يقول أي نسخة بالضبط. npm install يعيده كما كان.",
    },
    {
      question: "أخطأت في الكتابة: npm install expresss (ثلاث s)، ووُجدت حزمة بهذا الاسم. ما الخطر؟",
      code: "$ npm install expresss",
      options: ["لا خطر، npm يتحقق من كل الحزم", "كودها، وقد يكون خبيثاً، ينزل ويعمل على جهازك بصلاحياتك", "لن تُثبَّت لأن الاسم خاطئ"],
      answer: 1,
      why: "التثبيت يعني تشغيل كود غرباء، وبعض الحزم تشغّل سكربتاً لحظة تثبيتها. المهاجمون ينشرون أسماء قريبة من المشهورة. تأكّد من الاسم والمؤلف وعدد التنزيلات قبل أن تثبّت.",
    },
  ],
  next: "internet",
};
