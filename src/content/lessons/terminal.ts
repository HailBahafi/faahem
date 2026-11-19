import type { Cell, Lesson, Scene } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const at = (cwd: string, here: string): Cell[] => [s("cwd", cwd), s("here", here)];

/** A tiny shell scene for a predict answer: same drawers as the main scene. */
const mini = (code: string, steps: Scene["steps"]): Scene => ({ code: { shell: code }, steps });

export const terminal: Lesson = {
  slug: "terminal",
  stage: 4,
  number: "4.1",
  title: "الطرفية",
  subtitle: "محادثة مكتوبة مع الحاسوب: تكتب أمراً، فيشغّل برنامجاً في المجلد الذي تقف فيه",
  minutes: 14,
  singleLanguage: true,
  problem: {
    title: "أين أنت الآن؟",
    body: "هذه طرفية حقيقية الشكل، وخلفها شجرة مجلدات. اكتب أمراً واضغط Enter، وراقب النقطة المضيئة في الشجرة: هي المكان الذي تقف فيه. حاول إنجاز المهام.",
    demo: "terminal",
  },
  scene: {
    code: {
      shell: `$ pwd
/home/sara
$ ls
notes.txt
$ mkdir project
$ cd project
$ touch app.js
$ ls
app.js
$ cd ..
$ pwd
/home/sara`,
    },
    notes: {
      shell: "السطر الذي يبدأ بـ $ هو ما تكتبه أنت، والسطر بعده هو ما يردّ به البرنامج. على ويندوز تعمل pwd و ls و cd و mkdir في PowerShell أيضاً، وبديل touch هو ni app.js.",
    },
    steps: [
      {
        line: null,
        say: "الطرفية محادثة مكتوبة: تكتب أمراً، فيشغّل الـ shell برنامجاً بهذا الاسم، ويطبع ردّه. والأهم: أنت تقف دائماً داخل مجلد واحد من شجرة المجلدات، اسمه المجلد الحالي cwd.",
        memory: at("/home/sara", "notes.txt"),
      },
      {
        line: 1,
        say: "pwd برنامج صغير يجيب عن سؤال واحد: أين أقف؟ الجواب مسار كامل من الجذر / نزولاً في الشجرة: home ثم sara.",
        memory: at("/home/sara", "notes.txt"),
        read: ["cwd"],
        output: ["/home/sara"],
      },
      {
        line: 3,
        say: "ls تعرض ما في المجلد الحالي فقط، لا ما في الجهاز كله. هنا ملف واحد: notes.txt.",
        memory: at("/home/sara", "notes.txt"),
        read: ["here"],
        output: ["/home/sara", "notes.txt"],
      },
      {
        line: 5,
        say: "mkdir هو اسم البرنامج، و project هو الوسيط: ماذا يصنع. نشأ فرع جديد في الشجرة تحت المكان الذي تقف فيه. لم يُطبع شيء: الصمت في الطرفية يعني النجاح.",
        memory: at("/home/sara", "notes.txt project"),
        changed: ["here"],
        output: ["/home/sara", "notes.txt"],
      },
      {
        line: 6,
        say: "لاحظ أن mkdir لم ينقلك. cd هو الذي ينقلك: project مسار نسبي، أي «المجلد project الموجود حيث أقف». الآن تقف داخله، وهو فارغ.",
        memory: at("/home/sara/project", ""),
        changed: ["cwd", "here"],
        output: ["/home/sara", "notes.txt"],
      },
      {
        line: 7,
        say: "touch تنشئ ملفاً فارغاً. أين؟ في المجلد الحالي، لأن كل أمر يعمل حيث تقف. فصار app.js داخل project.",
        memory: at("/home/sara/project", "app.js"),
        changed: ["here"],
        output: ["/home/sara", "notes.txt"],
      },
      {
        line: 8,
        say: "ls مرة أخرى، لكن المجلد الحالي تغيّر، فالجواب تغيّر: app.js فقط. ملف notes.txt ما زال موجوداً، لكنه في مجلد آخر.",
        memory: at("/home/sara/project", "app.js"),
        read: ["here"],
        output: ["/home/sara", "notes.txt", "app.js"],
      },
      {
        line: 10,
        say: "النقطتان .. تعنيان دائماً «المجلد الأب»: خطوة واحدة صعوداً في الشجرة. عدنا إلى sara، وما زال فيها notes.txt و project.",
        memory: at("/home/sara", "notes.txt project"),
        changed: ["cwd", "here"],
        output: ["/home/sara", "notes.txt", "app.js"],
      },
      {
        line: 11,
        say: "pwd تؤكد: نقف في /home/sara. هذا ما تفعله كلما ضعت في الطرفية.",
        memory: at("/home/sara", "notes.txt project"),
        read: ["cwd"],
        output: ["/home/sara", "notes.txt", "app.js", "/home/sara"],
      },
      {
        line: 12,
        say: "مساران لنفس المكان: /home/sara/project مطلق، يبدأ بـ / من الجذر ويعمل من أي مكان. و project نسبي، يبدأ من حيث تقف ويعمل من /home/sara فقط.",
        memory: at("/home/sara", "notes.txt project"),
        output: ["/home/sara", "notes.txt", "app.js", "/home/sara"],
      },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذه محاكاة للطرفية بلغة تعرفها: الشجرة كائن داخل كائن، و cwd مصفوفة بأسماء المجلدات من الجذر. الدالة here تنزل في الشجرة اسماً اسماً حتى تصل إلى حيث تقف، تماماً كما يقرأ النظام المسار.",
    starter: `let fs = { home: { sara: { notes: "hi" } } };
let cwd = ["home", "sara"];
function here() {
  let node = fs;
  for (let name of cwd) {
    node = node[name];
  }
  return node;
}
let folder = here();
folder.project = {};
cwd.push("project");
here().app = "";
console.log("/" + cwd.join("/"));
cwd.pop();
console.log("/" + cwd.join("/"));`,
    challenges: [
      "السطر cwd.push يقابل cd project، و cwd.pop يقابل cd ... توقّع المسارين المطبوعين قبل أن تشغّل.",
      "احذف السطر cwd.push(\"project\") وشغّل. أين أُنشئ الملف app الآن؟ هذا ما يحدث حين تنسى cd.",
      "أضف cwd.push(\"ghost\") قبل here().app. ماذا يحدث؟ هذا هو خطأ no such file or directory.",
      "اكتب سطراً يحاكي cd / : اجعل cwd مصفوفة فارغة، ثم اطبع المسار.",
    ],
  },
  predict: [
    {
      question: "تقف في /home/sara/project/src وتكتب cd .. مرتين. ماذا يطبع pwd؟",
      code: `$ pwd
/home/sara/project/src
$ cd ..
$ cd ..
$ pwd`,
      scene: mini(
        `$ pwd
/home/sara/project/src
$ cd ..
$ cd ..
$ pwd
/home/sara`,
        [
          { line: 1, say: "نقف في src، في أعمق فرع.", memory: at("/home/sara/project/src", ""), read: ["cwd"], output: ["/home/sara/project/src"] },
          { line: 3, say: ".. خطوة واحدة إلى الأب: من src إلى project.", memory: at("/home/sara/project", "src"), changed: ["cwd", "here"], output: ["/home/sara/project/src"] },
          { line: 4, say: "خطوة أخرى إلى الأب: من project إلى sara.", memory: at("/home/sara", "project"), changed: ["cwd", "here"], output: ["/home/sara/project/src"] },
          { line: 5, say: "pwd تقرأ المكان الحالي.", memory: at("/home/sara", "project"), read: ["cwd"], output: ["/home/sara/project/src", "/home/sara"] },
        ],
      ),
      options: ["/home/sara", "/home/sara/project", "/"],
      answer: 0,
      why: ".. ليست «ارجع للبداية» ولا «تراجع عن آخر أمر»: هي الأب المباشر في الشجرة. مرتان تعنيان صعود فرعين: src ثم project.",
    },
    {
      question: "أنشأنا مجلداً ثم ملفاً. ماذا يطبع ls project؟",
      code: `$ pwd
/home/sara
$ mkdir project
$ touch app.js
$ ls project`,
      scene: mini(
        `$ pwd
/home/sara
$ mkdir project
$ touch app.js
$ ls project
`,
        [
          { line: 1, say: "نقف في sara.", memory: at("/home/sara", ""), read: ["cwd"], output: ["/home/sara"] },
          { line: 3, say: "نشأ project تحت sara، لكننا لم ننتقل إليه.", memory: at("/home/sara", "project"), changed: ["here"], output: ["/home/sara"] },
          { line: 4, say: "touch تعمل حيث نقف: في sara، لا في project.", memory: at("/home/sara", "app.js project"), changed: ["here"], output: ["/home/sara"] },
          { line: 5, say: "ls project تعرض محتوى project: لا شيء. فلا يُطبع أي سطر.", memory: at("/home/sara", "app.js project"), output: ["/home/sara"] },
        ],
      ),
      options: ["app.js", "لا شيء: المجلد فارغ", "خطأ: project غير موجود"],
      answer: 1,
      why: "mkdir تنشئ المجلد ولا تنقلك إليه. كل أمر يعمل في المجلد الحالي، فنزل app.js بجانب project، لا داخله.",
    },
    {
      question: "app.js موجود داخل project، وأنت تقف في sara. ماذا يحدث؟",
      code: `$ pwd
/home/sara
$ ls project
app.js
$ node app.js`,
      scene: mini(
        `$ pwd
/home/sara
$ ls project
app.js
$ node app.js
Error: Cannot find module '/home/sara/app.js'`,
        [
          { line: 1, say: "نقف في sara.", memory: at("/home/sara", "project"), read: ["cwd"], output: ["/home/sara"] },
          { line: 3, say: "app.js موجود، لكن داخل project.", memory: at("/home/sara", "project"), output: ["/home/sara", "app.js"] },
          { line: 5, say: "node يبحث عن app.js في المجلد الحالي فقط: /home/sara/app.js. لا يجده، فيتوقف بخطأ.", memory: at("/home/sara", "project"), read: ["cwd"], error: "Cannot find module '/home/sara/app.js'", output: ["/home/sara", "app.js"] },
        ],
      ),
      options: ["يشغّل app.js", "خطأ: لا يجد /home/sara/app.js", "يبحث في الجهاز كله حتى يجده"],
      answer: 1,
      why: "node برنامج يُشغَّل في المجلد الحالي، والاسم app.js مسار نسبي منه. الحل: cd project ثم node app.js، أو node project/app.js.",
    },
  ],
  code: {
    intro: "لا شيء يُشغَّل هنا: الطرفية الحقيقية على جهازك. افتح Terminal (أو PowerShell على ويندوز) وجرّب: pwd ثم ls ثم mkdir test ثم cd test ثم pwd. ولتشغيل برامجك من الدروس السابقة: node app.js أو python app.py، وأنت واقف في مجلد الملف.",
    runnerStarter: "",
    runnerLang: "text",
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "مشروع جديد",
      prompt: "تقف في /home/sara. رتّب الأوامر حتى يصير عندك الملف /home/sara/project/src/index.js.",
      lines: ["mkdir project", "cd project", "mkdir src", "cd src", "touch index.js"],
      expected: "/home/sara/project/src/index.js",
    },
    {
      kind: "fill",
      lang: "text",
      title: "خطوة إلى الأعلى",
      prompt: "أي مسار يأخذك من src إلى المجلد الذي فوقه مباشرة؟",
      template: "$ pwd\n/home/sara/project/src\n$ cd ___\n$ pwd\n/home/sara/project",
      options: ["..", "/", "project"],
      answer: "..",
      expected: "/home/sara/project",
    },
    {
      kind: "order",
      lang: "text",
      title: "اقرأ قبل أن تحذف",
      prompt: "تقف في /home/sara، والملف old.txt داخل project. ادخل، اقرأ الملف لتتأكد أنه هو، احذفه، ثم تأكّد أنه اختفى.",
      lines: ["cd project", "cat old.txt", "rm old.txt", "ls"],
      expected: "old.txt حُذف نهائياً",
    },
    {
      kind: "fill",
      lang: "text",
      title: "من أي مكان",
      prompt: "لا تعرف أين تقف الآن. أي مسار يوصلك إلى مجلد project مهما كان مكانك؟",
      template: "$ cd ___\n$ pwd\n/home/sara/project",
      options: ["/home/sara/project", "project", "../project"],
      answer: "/home/sara/project",
      expected: "/home/sara/project",
    },
  ],
  quiz: [
    {
      question: "أين تقف بعد هذه الأوامر؟",
      code: "$ cd /home/sara\n$ cd project/src\n$ cd ..",
      options: ["/home/sara/project", "/home/sara", "/home/sara/project/src"],
      answer: 0,
      why: "الأول مسار مطلق يضعك في sara. الثاني نسبي ينزل فرعين إلى src. و .. يصعد فرعاً واحداً إلى project.",
    },
    {
      question: "كتبت rm notes.txt. أين ذهب الملف؟",
      code: "$ rm notes.txt\n$ ls",
      options: ["إلى سلة المحذوفات", "حُذف نهائياً، لا سلة في الطرفية", "إلى مجلد مخفي يمكن استعادته منه"],
      answer: 1,
      why: "rm تزيل الورقة من الشجرة مباشرة، والسلة ميزة في واجهة الرسوم لا في الطرفية. لهذا اقرأ قبل أن تحذف، واحذر rm -r لأنها تحذف فرعاً كاملاً بما فيه.",
    },
    {
      question: "في الأمر ls -l docs، ما دور كل جزء؟",
      code: "$ ls -l docs",
      options: ["ls البرنامج، و -l خيار يغيّر طريقة العرض، و docs الوسيط: أي مجلد", "ls المجلد، و -l البرنامج، و docs الخيار", "الثلاثة أسماء ملفات"],
      answer: 0,
      why: "كل أمر يبدأ باسم البرنامج. الخيارات تبدأ بشَرطة وتغيّر طريقة عمله، والوسطاء يقولون له على ماذا يعمل.",
    },
    {
      question: "أي هذه المسارات مطلق؟",
      options: ["../notes.txt", "project/app.js", "/home/sara/notes.txt"],
      answer: 2,
      why: "المسار المطلق يبدأ بـ / أي من جذر الشجرة، فيعني المكان نفسه أينما كنت. الآخران يبدآن من المجلد الحالي.",
    },
    {
      question: "تقف في /home/sara، والملف app.py داخل project. أي أمر يشغّله؟",
      code: "$ pwd\n/home/sara\n$ ls project\napp.py",
      options: ["python app.py", "python project/app.py", "cd app.py"],
      answer: 1,
      why: "python يبحث عن الملف انطلاقاً من المجلد الحالي. project/app.py مسار نسبي صحيح منه: انزل إلى project ثم خذ app.py. و cd تنقلك إلى مجلدات لا إلى ملفات.",
    },
  ],
  next: "git",
};
