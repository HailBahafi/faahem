import type { Cell, Lesson } from "@/lib/types";

const label = (name: string, to: string): Cell => ({ name, value: `→ ${to}`, type: "none" });
const snap = (id: string, msg: string, parent: string): Cell => ({ name: id, value: `"${msg}" ← ${parent}`, type: "string" });
const staged = (what: string): Cell => ({ name: "staging", value: what ? `"${what}"` : "فارغة", type: what ? "string" : "none" });

const A = snap("a1f", "start", "null");
const B = snap("b7c", "dark mode", "a1f");

export const git: Lesson = {
  slug: "git",
  stage: 4,
  number: "4.2",
  title: "Git من الداخل",
  subtitle: "صور كاملة للمشروع، كل صورة بسهم إلى التي قبلها، وفروع هي مجرد لافتات",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "التقط صوراً، ثم افترق، ثم اجتمع",
    body: "عدّل الملف، اختر ما يدخل الصورة بـ add، والتقطها بـ commit. افتح فرعاً، التقط فيه صورة، ثم عد إلى main وادمج. وجرّب أن تغيّر السطر نفسه في الفرعين: من يقرّر؟",
    demo: "git",
  },
  scene: {
    code: {
      shell: `git add app.js
git commit -m "start"
git switch -c feature
git add style.css
git commit -m "dark mode"
git switch main
git merge feature
git push origin main`,
    },
    notes: {
      shell: "كل أمر هنا يحرّك شيئاً في مجلد مخفي اسمه .git داخل مشروعك: فيه الصور، والأسهم بينها، واللافتات. احذف .git فيبقى المجلد عادياً بلا تاريخ.",
    },
    steps: [
      {
        line: null,
        say: "مجلد مشروع فيه app.js، وأمر git init صنع داخله مستودعاً فارغاً. لا صور بعد، واللافتة main لا تشير إلى شيء. HEAD يقول: أنت على main.",
        memory: [label("HEAD", "main"), { name: "main", value: "null", type: "none" }, staged("")],
      },
      {
        line: 1,
        say: "git add لا يحفظ شيئاً في التاريخ. هو يضع app.js في منطقة التجهيز: هذا ما ستلتقطه الصورة القادمة.",
        memory: [label("HEAD", "main"), { name: "main", value: "null", type: "none" }, staged("app.js")],
        changed: ["staging"],
      },
      {
        line: 2,
        say: "git commit يلتقط صورة كاملة للمشروع كما في منطقة التجهيز، ويعطيها رقماً: a1f. لا صورة قبلها، فسهمها إلى null. ثم تتحرك اللافتة main إليها.",
        memory: [label("HEAD", "main"), label("main", "a1f"), staged(""), A],
        changed: ["a1f", "main", "staging"],
        output: ["[main a1f] start"],
      },
      {
        line: 3,
        say: "switch -c feature يصنع لافتة جديدة على الصورة نفسها a1f، وينقل HEAD إليها. لم يُنسخ أي ملف ولا أي صورة: الفرع مجرد لافتة.",
        memory: [label("HEAD", "feature"), label("main", "a1f"), label("feature", "a1f"), staged(""), A],
        changed: ["feature", "HEAD"],
        read: ["main"],
        output: ["[main a1f] start", "Switched to a new branch 'feature'"],
      },
      {
        line: 4,
        say: "أضفنا ملف ألوان جديداً style.css، ثم وضعناه في منطقة التجهيز.",
        memory: [label("HEAD", "feature"), label("main", "a1f"), label("feature", "a1f"), staged("style.css"), A],
        changed: ["staging"],
        output: ["[main a1f] start", "Switched to a new branch 'feature'"],
      },
      {
        line: 5,
        say: "صورة جديدة b7c للمشروع كله: app.js و style.css. سهمها إلى الصورة التي كانت تحت HEAD: a1f. تتحرك اللافتة التي عليها HEAD فقط، أي feature. اللافتة main بقيت على a1f.",
        memory: [label("HEAD", "feature"), label("main", "a1f"), label("feature", "b7c"), staged(""), A, B],
        changed: ["b7c", "feature", "staging"],
        read: ["HEAD"],
        output: ["[main a1f] start", "Switched to a new branch 'feature'", "[feature b7c] dark mode"],
      },
      {
        line: 6,
        say: "نعود إلى main: ينتقل HEAD إلى لافتة main، ويعيد Git ملفات المجلد كما في صورتها a1f. ملف style.css يختفي من المجلد، لكنه محفوظ في الصورة b7c.",
        memory: [label("HEAD", "main"), label("main", "a1f"), label("feature", "b7c"), staged(""), A, B],
        changed: ["HEAD"],
        read: ["main"],
        output: ["[main a1f] start", "Switched to a new branch 'feature'", "[feature b7c] dark mode", "Switched to branch 'main'"],
      },
      {
        line: 7,
        say: "الدمج يجمع خطّي التاريخ. هنا main لم يتحرك منذ افترقنا، و b7c تتبع a1f بسهمها. فيكفي أن تنزلق لافتة main إلى b7c دون صورة جديدة. هذا اسمه fast-forward.",
        memory: [label("HEAD", "main"), label("main", "b7c"), label("feature", "b7c"), staged(""), A, B],
        changed: ["main"],
        read: ["feature"],
        output: ["[main a1f] start", "Switched to a new branch 'feature'", "[feature b7c] dark mode", "Switched to branch 'main'", "Fast-forward"],
      },
      {
        line: 8,
        say: "كل ما سبق حدث على جهازك فقط. git push يرسل إلى GitHub الصور التي لا يملكها (a1f و b7c) ويحرّك لافتة main هناك إلى b7c.",
        memory: [label("HEAD", "main"), label("main", "b7c"), label("feature", "b7c"), staged(""), A, B, label("origin/main", "b7c")],
        changed: ["origin/main"],
        read: ["main"],
        output: ["[main a1f] start", "Switched to a new branch 'feature'", "[feature b7c] dark mode", "Switched to branch 'main'", "Fast-forward", "main -> main"],
      },
      {
        line: 8,
        say: "التاريخ إذن قائمة مترابطة: كل صورة تشير إلى التي قبلها، واللافتات مثل head في درس القائمة: أسهم إلى عقدة. git log يمشي على الأسهم إلى الخلف حتى null.",
        memory: [label("HEAD", "main"), label("main", "b7c"), label("feature", "b7c"), staged(""), A, B, label("origin/main", "b7c")],
        read: ["b7c", "a1f"],
        output: ["[main a1f] start", "Switched to a new branch 'feature'", "[feature b7c] dark mode", "Switched to branch 'main'", "Fast-forward", "main -> main"],
      },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذا Git مصغّر بكائنات JavaScript: كل صورة كائن { id, message, parent }، والفرع مجرد متغير يشير إلى صورة. شغّل وراقب الأسهم في الكومة، والحلقة في الآخر تعمل عمل git log.",
    starter: `let c1 = { id: "a1f", message: "start", parent: null };
let c2 = { id: "b7c", message: "add title", parent: c1 };
let main = c2;
let feature = main;
let c3 = { id: "d4e", message: "dark mode", parent: feature };
feature = c3;
let cur = feature;
while (cur !== null) {
  console.log(cur.id, cur.message);
  cur = cur.parent;
}`,
    challenges: [
      "اجعل cur = main بدلاً من feature. كم صورة يطبع git log الآن، ولماذا لا يرى d4e؟",
      "أضف صورة على main قبل الحلقة: let c4 = { id: \"e92\", message: \"fix\", parent: main }; ثم main = c4; ارسم في رأسك الشكل: هل تفرّع التاريخ؟",
      "دمج fast-forward بسطر واحد: main = feature; قبل الحلقة واجعل cur = main. ماذا تغيّر في الكومة؟ هل نُسخت أي صورة؟",
      "أضف صورة دمج لها أبوان: let m = { id: \"f3a\", message: \"merge\", parent: main, parent2: feature }; وراقب سهميها.",
    ],
  },
  predict: [
    {
      question: "صنعنا فرعاً من main ثم التقطنا عليه صورة. إلى أين تشير main؟",
      code: `let c1 = { id: "a1f", parent: null };
let main = c1;
let feature = main;
let c2 = { id: "b7c", parent: feature };
feature = c2;
console.log(main.id, feature.id);`,
      options: ["a1f b7c", "b7c b7c", "a1f a1f"],
      answer: 0,
      why: "الفرع لافتة، لا نسخة. feature = main جعلت اللافتتين على a1f، ثم تحركت feature وحدها إلى الصورة الجديدة. main بقيت حيث هي.",
    },
    {
      question: "الصورة الثانية غيّرت app فقط. ماذا تحمل عن css؟",
      code: `let c1 = { id: "a1f", files: { app: "v1", css: "v1" }, parent: null };
let c2 = { id: "b7c", files: { app: "v2", css: "v1" }, parent: c1 };
console.log(c2.files.app, c2.files.css);`,
      options: ["v2 v1", "v2 undefined", "v1 v1"],
      answer: 0,
      why: "كل صورة تحمل المشروع كله، لا الفرق فقط. css لم يتغيّر فبقي في الصورة الجديدة كما هو (و Git لا يخزّنه مرتين: الصورتان تشيران إلى المحتوى نفسه).",
    },
    {
      question: "افترق الفرعان: صورة على feature وصورة على main. كم صورة يرى git log من feature؟",
      code: `let c1 = { id: "a1f", parent: null };
let main = c1;
let feature = main;
feature = { id: "b7c", parent: feature };
main = { id: "d4e", parent: main };
let count = 0;
let cur = feature;
while (cur !== null) {
  count = count + 1;
  cur = cur.parent;
}
console.log(count);`,
      options: ["2", "3", "1"],
      answer: 0,
      why: "السجل يمشي على الأسهم إلى الخلف: b7c ثم a1f ثم null. الصورة d4e سهمها إلى a1f، لكن لا سهم من feature يصل إليها، فهي ليست في تاريخه حتى ندمج.",
    },
  ],
  code: {
    intro: "Git يعمل في الطرفية التي تعلّمتها. هذه الأوامر التي ستكتبها كل يوم، بالترتيب الذي تحدث به. افتح طرفية في مجلد مشروعك وجرّبها بعد git init.",
    runnerLang: "text",
    runnerStarter: `git init                  # make .git: an empty history
git status                # what changed, what is staged
git add app.js            # put app.js in the next snapshot
git commit -m "message"   # take the snapshot, move the branch label
git log --oneline         # walk the arrows back: newest first
git switch -c feature     # new label here, HEAD moves to it
git switch main           # HEAD back to main, files follow
git merge feature         # join feature's history into main
git push origin main      # send snapshots and the label to GitHub
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "من التعديل إلى GitHub",
      prompt: "عدّلت app.js. رتّب الأوامر حتى يصل التعديل إلى GitHub.",
      lines: ["git status", "git add app.js", 'git commit -m "fix title"', "git push origin main"],
      expected: "main -> main",
    },
    {
      kind: "fill",
      lang: "text",
      title: "ماذا يدخل الصورة؟",
      prompt: "أي أمر يضع الملف في منطقة التجهيز حتى تلتقطه الصورة القادمة؟",
      template: 'git ___ style.css\ngit commit -m "colors"',
      options: ["add", "push", "switch"],
      answer: "add",
      expected: "[main c58] colors",
    },
    {
      kind: "order",
      lang: "text",
      title: "فرع ثم دمج",
      prompt: "رتّب الأوامر: افتح فرعاً login، التقط فيه صورة، ثم ادمجه في main.",
      lines: ["git switch -c login", "git add login.js", 'git commit -m "login page"', "git switch main", "git merge login"],
      expected: "Fast-forward",
    },
    {
      kind: "fill",
      lang: "text",
      title: "لافتة جديدة",
      prompt: "أي خيار يصنع لافتة جديدة اسمها dark على الصورة الحالية وينقل HEAD إليها؟",
      template: "git switch ___ dark",
      options: ["-c", "main", "merge"],
      answer: "-c",
      expected: "Switched to a new branch 'dark'",
    },
  ],
  quiz: [
    {
      question: "بعد هذه الأوامر، على أي صورة تقف اللافتة main؟",
      code: 'git commit -m "start"      # a1f on main\ngit switch -c feature\ngit commit -m "menu"       # b7c\ngit commit -m "icons"      # d4e',
      options: ["a1f", "d4e", "b7c"],
      answer: 0,
      why: "commit يحرّك اللافتة التي عليها HEAD فقط. بعد switch -c صار HEAD على feature، فتحركت feature إلى b7c ثم d4e، وبقيت main على a1f.",
    },
    {
      question: "عدّلت app.js و style.css، لكنك نفّذت git add app.js فقط ثم commit. ماذا في الصورة الجديدة؟",
      options: [
        "app.js وحده، والمشروع بلا style.css",
        "المشروع كله: app.js الجديد، و style.css كما كان في الصورة السابقة",
        "الملفان بتعديلاتهما",
      ],
      answer: 1,
      why: "الصورة تلتقط منطقة التجهيز، وهي نسخة من المشروع كله. app.js دخلها بتعديله، و style.css فيها بنسخته القديمة. تعديله ما زال في المجلد فقط، ينتظر add.",
    },
    {
      question: "main لم يتغيّر منذ أن فتحت feature، و feature فيه صورتان جديدتان. ماذا يفعل git merge feature وأنت على main؟",
      options: ["يصنع صورة دمج جديدة لها أبوان", "تنزلق لافتة main إلى آخر صورة في feature", "ينسخ الصورتين إلى main"],
      answer: 1,
      why: "صور feature تتبع آخر صورة في main بأسهمها مباشرة، فلا شيء يحتاج إلى جمع. يكفي تحريك اللافتة: fast-forward. لا نسخ ولا صورة جديدة.",
    },
    {
      question: "في main غيّرنا السطر 1 من app.js إلى Hello، وفي feature غيّرنا السطر 1 نفسه إلى Welcome. ماذا يحدث عند الدمج؟",
      code: "git switch main\ngit merge feature",
      options: ["يأخذ Git الأحدث تلقائياً", "يتوقف Git ويطلب منك أن تختار: تعارض", "يدمج السطرين معاً HelloWelcome"],
      answer: 1,
      why: "Git يقارن كل فرع بالصورة التي افترقا عندها. لو غيّر فرع واحد السطر لأخذه وحده. هنا غيّره الاثنان بطريقتين، ولا يعرف Git أيهما تريد، فيتركك تقرّر ثم تلتقط صورة الدمج.",
    },
    {
      question: "التقطت ثلاث صور اليوم ولم تنفّذ git push. ماذا يرى زميلك على GitHub؟",
      options: ["الصور الثلاث", "لا شيء منها: هي في .git على جهازك فقط", "آخر صورة فقط"],
      answer: 1,
      why: "commit يكتب في المجلد المخفي .git على جهازك. GitHub نسخة أخرى من التاريخ لا تتغيّر حتى ترسل إليها الصور بـ push.",
    },
  ],
  next: "packages",
};
