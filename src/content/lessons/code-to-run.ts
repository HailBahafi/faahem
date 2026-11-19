import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

export const codeToRun: Lesson = {
  slug: "code-to-run",
  stage: 0,
  number: "0.4",
  title: "من الكود إلى التنفيذ",
  subtitle: "من يترجم كلامنا إلى لغة المعالج؟",
  minutes: 12,
  problem: {
    title: "المعالج لا يقرأ ما نكتبه",
    body: "نحن نكتب price * 2، والمعالج لا يفهم إلا تعليمات من بتات. شغّل البرنامج بالمترجم ثم بالمفسّر وقارن الترتيب، ثم أدخل خطأً صغيراً وشاهد من يرفض ومتى.",
    demo: "codeToRun",
  },
  scene: {
    code: {
      js: `let price = 20;
let total = price * 2;
console.log(total);
total = total + 5;
console.log(total);`,
      ts: `let price: number = 20;
let total: number = price * 2;
console.log(total);
total = total + 5;
console.log(total);`,
      py: `price = 20
total = price * 2
print(total)
total = total + 5
print(total)`,
      go: `price := 20
total := price * 2
fmt.Println(total)
total = total + 5
fmt.Println(total)`,
      dart: `int price = 20;
int total = price * 2;
print(total);
total = total + 5;
print(total);`,
      rust: `let price = 20;
let mut total = price * 2;
println!("{}", total);
total = total + 5;
println!("{}", total);`,
    },
    notes: {
      js: "JavaScript يشغّلها محرّك (مثل V8 في المتصفح): يبدأ التنفيذ فوراً، ويترجم الأجزاء التي تتكرر كثيراً إلى تعليمات آلة أثناء التشغيل.",
      ts: "TypeScript تُترجم أولاً إلى JavaScript، ويُفحص فيها نوع كل درج قبل التشغيل، ثم يشغّلها محرّك JavaScript.",
      py: "بايثون يشغّلها مفسّر: يحوّل الملف إلى تعليمات وسيطة، ثم ينفّذها واحدة بعد الأخرى وهو يقرؤها.",
      go: "Go لغة مُترجَمة: الأمر go build يحوّل الملف كله إلى ملف تعليمات آلة جاهز، ثم تشغّله بسرعة دون مترجم.",
      dart: "Dart تُترجم مسبقاً إلى تعليمات آلة عند بناء تطبيق Flutter، وتُشغَّل بترجمة فورية أثناء التطوير لتجرّب بسرعة.",
      rust: "Rust يترجمها المترجم rustc مسبقاً، وهو صارم جداً: يرفض الملف إذا وجد أي خطأ قبل أن يعمل سطر واحد.",
    },
    steps: [
      { line: null, say: "للمعالج هذا النص مجرد حروف؛ هو لا يفهم إلا تعليمات من بتات. لذلك يمرّ الكود أولاً على مترجم يقرأ الملف كله، يتأكد أن قواعد الكتابة سليمة، ويحوّله إلى تعليمات آلة.", memory: [] },
      { line: 1, say: "السطر 1 يصير تعليمة واحدة: اكتب 20 في درج اسمه price. المعالج ينفّذها.", memory: [n("price", 20)], changed: ["price"] },
      { line: 2, say: "السطر 2 يصير ثلاث تعليمات: LOAD تنسخ 20 من price إلى سجلّ، MUL تضربه في 2، STORE تكتب 40 في درج total.", memory: [n("price", 20), n("total", 40)], changed: ["total"], read: ["price"] },
      { line: 3, say: "console.log تصير: انسخ ما في total وأرسله إلى الشاشة. يظهر 40.", memory: [n("price", 20), n("total", 40)], read: ["total"], output: ["40"] },
      { line: 4, say: "LOAD ثم ADD 5 ثم STORE: القيمة 40 تُمحى ويحل محلها 45. الأسطر ليست معادلات؛ كل سطر ينفَّذ مرة واحدة في دوره.", memory: [n("price", 20), n("total", 45)], changed: ["total"], read: ["total"], output: ["40"] },
      { line: 5, say: "الطباعة الثانية تقرأ total الآن فتجد 45. السطر 3 طبع 40 لأنه نُفّذ قبل السطر 4.", memory: [n("price", 20), n("total", 45)], read: ["total"], output: ["40", "45"] },
      { line: 5, say: "سواء تُرجم الملف كله أولاً (Go و Rust و Dart) أو تُرجم أثناء التشغيل (Python و JavaScript)، النتيجة واحدة: تعليمات آلة تُنفَّذ من الأعلى إلى الأسفل. لهذا ترى الفكرة نفسها بست لغات.", memory: [n("price", 20), n("total", 45)], output: ["40", "45"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذا البرنامج نفسه. شغّله ثم أفسده عمداً، وراقب متى يتوقف: قبل أي شيء، أم في منتصف الطريق؟",
    starter: `let price = 20;
let total = price * 2;
console.log(total);
total = total + 5;
console.log(total);`,
    challenges: [
      "احذف القوس ) الأخير من السطر 3 وشغّل. هل طُبع أي شيء قبل الخطأ؟ لماذا؟",
      "أعد القوس، ثم اكتب totl بدلاً من total في السطر 5. ماذا يُطبع قبل أن يتوقف البرنامج؟",
      "بدّل السطرين 3 و 4. توقّع ما يُطبع قبل أن تشغّل.",
      "غيّر 2 إلى 3 في السطر 2. كم سيطبع السطر 3؟",
    ],
  },
  predict: [
    {
      question: "price تغيّر بعد حساب total. ماذا يطبع البرنامج؟",
      code: `let price = 20;
let total = price * 2;
price = 100;
console.log(total);`,
      options: ["40", "200", "100"],
      answer: 0,
      why: "الكود ليس جدول حسابات يعيد الحساب وحده. السطر 2 تُرجم إلى «اضرب ثم اكتب 40» ونُفّذ مرة واحدة. السطر 3 يغيّر price فقط.",
    },
    {
      question: "في السطر الأخير خطأ إملائي: totl بدلاً من total. ماذا يحدث في JavaScript؟",
      code: `console.log("start");
let total = 20 * 2;
console.log(totl);`,
      options: ["يطبع start ثم يتوقف بخطأ", "لا يطبع شيئاً أبداً", "يطبع start ثم 40"],
      answer: 0,
      why: "قواعد الكتابة سليمة، فيبدأ التشغيل. المحرّك لا يكتشف أن totl غير موجود إلا عندما يصل إلى السطر 3، بعد أن طبع start. في Go أو Rust كان المترجم سيرفض الملف قبل أن يطبع أي شيء. والمترجم لا يخمّن ما قصدته.",
    },
    {
      question: "ما الذي يطبعه البرنامج؟",
      code: `let x = 3;
x = x + 1;
x = x * 2;
console.log(x);`,
      options: ["7", "8", "6"],
      answer: 1,
      why: "التعليمات تُنفَّذ بترتيب الأسطر: 3، ثم 3 + 1 = 4، ثم 4 × 2 = 8. ترتيب الأسطر هو ترتيب التنفيذ.",
    },
  ],
  code: {
    intro: "عندما تضغط تشغيل هنا، يأخذ محرّك JavaScript الكود، يتأكد من قواعده، ويحوّله إلى تعليمات ينفّذها المعالج. جرّب أن تكسر قاعدة وشاهد من يرفض.",
    runnerStarter: `let price = 20;
let total = price * 2;
console.log("total =", total);
// جرّب: احذف القوس ) من السطر السابق وشغّل
`,
  },
  exercises: [
    {
      kind: "order",
      title: "من الأعلى إلى الأسفل",
      prompt: "التنفيذ يسير من الأعلى إلى الأسفل. رتّب الأسطر حتى يطبع البرنامج 30.",
      lines: ["let price = 10;", "let total = price * 3;", "console.log(total);"],
      expected: "30",
    },
    {
      kind: "fill",
      title: "ضعف السعر",
      prompt: "أي علامة تجعل البرنامج يطبع 30؟",
      template: "let price = 15;\nlet total = price ___ 2;\nconsole.log(total);",
      options: ["*", "+"],
      expected: "30",
    },
    {
      kind: "fix",
      title: "المترجم يرفض",
      prompt: "هذا البرنامج لا يعمل أبداً: فيه خطأ في قواعد الكتابة. أصلحه حتى يطبع 40.",
      code: "let price = 20;\nlet total = price * 2;\nconsole.log(total;",
      expected: "40",
      hint: "كل قوس يُفتح يجب أن يُغلق. انظر إلى السطر الأخير.",
      solution: "let price = 20;\nlet total = price * 2;\nconsole.log(total);",
    },
    {
      kind: "write",
      title: "ثلاث قطع",
      prompt: "اكتب برنامجاً: درج price فيه 25، ودرج total فيه price * 3، ثم اطبع total (يجب أن يظهر 75).",
      starter: "// اكتب الكود هنا\n",
      expected: "75",
      hint: "ثلاثة أسطر: let price = 25;  ثم let total = price * 3;  ثم console.log(total);",
      solution: "let price = 25;\nlet total = price * 3;\nconsole.log(total);",
    },
  ],
  quiz: [
    {
      question: "في السطر الثاني قوس ناقص. ماذا يطبع البرنامج؟",
      code: 'console.log("one");\nconsole.log("two";',
      options: ["one ثم خطأ", "لا شيء، فقط خطأ", "one و two"],
      answer: 1,
      why: "قبل أن يعمل أي سطر، يُقرأ الملف كله ليتأكد المترجم من قواعد الكتابة. القوس الناقص يوقف الترجمة، فلا يصل إلى المعالج شيء ليُنفَّذ.",
    },
    {
      question: "قواعد الكتابة هنا سليمة، لكن x غير موجود. ماذا يطبع في JavaScript؟",
      code: 'console.log("one");\nconsole.log(x);\nconsole.log("three");',
      options: ["one ثم يتوقف بخطأ", "لا شيء", "one ثم three"],
      answer: 0,
      why: "الملف يُقبل فيبدأ التنفيذ سطراً سطراً. السطر 1 يطبع one، ثم يصل المحرّك إلى السطر 2 فلا يجد درجاً اسمه x فيتوقف هناك، ولا يصل إلى السطر 3.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: "let t = 2;\nconsole.log(t);\nt = t * 10;\nconsole.log(t);",
      options: ["20 ثم 20", "2 ثم 20", "2 ثم 2"],
      answer: 1,
      why: "كل سطر ينفَّذ في دوره. أول طباعة جاءت قبل الضرب فوجدت 2، والثانية جاءت بعده فوجدت 20.",
    },
    {
      question: "برنامج Go من 100 سطر، وفي السطر 50 خطأ في قواعد الكتابة. ماذا يحدث عند go build؟",
      options: ["تعمل الأسطر 1 إلى 49 ثم يتوقف", "يرفض المترجم الملف، ولا يعمل أي سطر", "يتخطى السطر 50 ويكمل"],
      answer: 1,
      why: "المترجم يحوّل الملف كله إلى تعليمات آلة قبل التشغيل. إذا لم يستطع ترجمة سطر واحد، لا يخرج ملف جاهز، فلا شيء يعمل.",
    },
    {
      question: "كتبنا هذا البرنامج نفسه بلغة Python وبلغة Rust. ماذا يطبع كل منهما؟",
      code: "let price = 20;\nlet total = price * 2;\nconsole.log(total);",
      options: ["40 في الاثنين", "40 في Python فقط", "يختلف حسب سرعة الجهاز"],
      answer: 0,
      why: "الفكرة واحدة والمترجم مختلف: Python تترجم أثناء التشغيل و Rust تترجم مسبقاً، لكن كلتيهما تنتهي بتعليمات «اضرب ثم اكتب ثم اطبع»، فتطبعان 40.",
    },
  ],
  next: "variables",
};
