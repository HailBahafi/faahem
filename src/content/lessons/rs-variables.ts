import type { Cell, Lesson, Scene, Step } from "@/lib/types";

/** `let` without mut: a locked drawer. */
const lock = (name: string, value: number | string): Cell =>
  typeof value === "number" ? { name, value: String(value), type: "number", constant: true } : { name, value: `"${value}"`, type: "string", constant: true };
const open = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const hidden = (name: string, value: number): Cell => ({ name: `${name} (hidden)`, value: String(value), type: "none" });
const check = (rust: string, steps: Step[]): Scene => ({ code: { rust }, steps });

export const rsVariables: Lesson = {
  slug: "rs-variables",
  stage: 0,
  number: "1.2",
  title: "المتغيرات والتغيّر",
  subtitle: "الدرج مقفل إلا إذا قلت mut، والاسم نفسه قد يصير درجاً جديداً",
  minutes: 16,
  singleLanguage: true,
  problem: {
    title: "درج مقفل ودرج مفتوح",
    body: "أمامك درجان: واحد بـ let وواحد بـ let mut. حاول أن تغيّر كلاً منهما، ثم جرّب أن تكتب let بالاسم نفسه من جديد. ماذا يقبل المترجم، وماذا يرفض؟",
    demo: "rsVariables",
  },
  scene: {
    code: {
      rust: `fn main() {
    let price = 100;
    let mut total = price;
    total = total + 50;
    let price = price * 2;
    let price = format!("{} SAR", price);
    println!("{} {}", total, price);
}`,
    },
    steps: [
      {
        line: null,
        say: "في Rust، let تحجز درجاً على المكدّس وتلصق عليه اسماً، كما في أي لغة. الفرق: الدرج مقفل افتراضياً. لن يتغيّر ما فيه إلا إذا طلبت ذلك صراحة.",
        memory: [],
      },
      {
        line: 2,
        say: "درج اسمه price فيه 100، ونوعه i32 استنتجه المترجم. القفل يعني: لا إسناد جديد إلى هذا الدرج أبداً.",
        memory: [lock("price", 100)],
        changed: ["price"],
      },
      {
        line: 3,
        say: "let mut يحجز درجاً مفتوحاً. تُنسخ إليه 100 من price: الأرقام تُنسخ نسخاً كاملاً، فالدرجان مستقلان.",
        memory: [lock("price", 100), open("total", 100)],
        changed: ["total"],
        read: ["price"],
        copy: { from: "price", to: "total" },
      },
      {
        line: 4,
        say: "الطرف الأيمن يُحسب أولاً: 100 + 50 = 150.",
        memory: [lock("price", 100), open("total", 100)],
        read: ["total"],
      },
      {
        line: 4,
        say: "ثم يُكتب الناتج في total نفسه. مسموح، لأن total مفتوح بـ mut. لو كتبنا price = 150 لرفض المترجم البرنامج كله.",
        memory: [lock("price", 100), open("total", 150)],
        changed: ["total"],
      },
      {
        line: 5,
        say: "هذا ليس تغييراً لـ price: let جديدة تحجز درجاً جديداً بالاسم نفسه وفيه 200. الدرج القديم ما زال موجوداً، لكن الاسم صار يشير إلى الجديد. هذا اسمه shadowing (التظليل).",
        memory: [hidden("price", 100), open("total", 150), lock("price", 200)],
        changed: ["price"],
        read: ["price (hidden)"],
      },
      {
        line: 6,
        say: "تظليل مرة ثانية، وهذه المرة بنوع مختلف: String بدل i32. هذا مستحيل مع mut (درج i32 لا يحمل نصاً)، لكنه ممكن هنا لأنه درج جديد كلياً.",
        memory: [hidden("price", 100), open("total", 150), hidden("price", 200), lock("price", "200 SAR")],
        changed: ["price"],
      },
      {
        line: 7,
        say: "الطباعة تقرأ total، وتقرأ price الأحدث: الاسم يشير دائماً إلى آخر let بهذا الاسم.",
        memory: [hidden("price", 100), open("total", 150), hidden("price", 200), lock("price", "200 SAR")],
        read: ["total", "price"],
        output: ["150 200 SAR"],
      },
      {
        line: 8,
        say: "عند } تنتهي main وتُزال أدراجها كلها، المخفية والظاهرة، دفعة واحدة مع إطارها.",
        memory: [],
        output: ["150 200 SAR"],
      },
    ],
    notes: {
      rust: "القاعدة: let للقيم التي لا تتغيّر (وهي أغلب القيم)، let mut للعدّادات والمجاميع، والتظليل حين تحوّل قيمة إلى شكل جديد (نص ← رقم، نص ← نص منظّف) ولا تحتاج الشكل القديم.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة بـ JavaScript لأدراج Rust: كل let تضيف درجاً جديداً إلى drawers، والاسم يشير إلى آخر درج بهذا الاسم. assign يرفض الدرج المقفل كما يرفضه المترجم.",
    starter: `const drawers = [];
function letBind(name, value, mutable) {
  drawers.push({ name: name, value: value, mutable: mutable });
}
function find(name) {
  for (let i = drawers.length - 1; i >= 0; i--) {
    if (drawers[i].name === name) return drawers[i];
  }
  return null;
}
function assign(name, value) {
  const d = find(name);
  if (!d.mutable) {
    console.log("error[E0384]: cannot assign twice to immutable variable " + name);
    return;
  }
  d.value = value;
}
letBind("x", 5, false);
assign("x", 6);
letBind("x", find("x").value + 1, false);
console.log("x = " + find("x").value + ", drawers: " + drawers.length);`,
    challenges: [
      "قبل التشغيل: كم درجاً في drawers في النهاية؟ وما قيمة x؟",
      "غيّر أول سطر إلى letBind(\"x\", 5, true);  هل يختفي الخطأ؟ ما قيمة x الآن؟",
      "أضف letBind(\"x\", \"text\", false); قبل السطر الأخير. لماذا لا يشتكي شيء رغم تغيّر النوع؟",
      "اطبع drawers[0].value في النهاية. هل تغيّر الدرج الأول بالتظليل؟",
    ],
  },
  predict: [
    {
      question: "هل يترجم Rust هذا البرنامج؟",
      code: `fn main() {
    let count = 0;
    count += 1;
    println!("{}", count);
}`,
      options: ["نعم، ويطبع 1", "لا: count مقفل لأنه بلا mut", "نعم، ويطبع 0"],
      answer: 1,
      why: "let بلا mut درج مقفل. += إسناد جديد إلى الدرج نفسه، فيرفضه المترجم قبل التشغيل. الإصلاح: let mut count = 0;",
      scene: check(
        `fn main() {
    let count = 0;
    count += 1;
    println!("{}", count);
}`,
        [
          { line: 2, say: "درج count مقفل فيه 0.", memory: [lock("count", 0)], changed: ["count"] },
          {
            line: 3,
            say: "محاولة كتابة في درج مقفل. المترجم يتوقف هنا ولا يعمل شيء.",
            memory: [lock("count", 0)],
            read: ["count"],
            error: "error[E0384]: cannot assign twice to immutable variable `count`",
          },
        ],
      ),
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: `fn main() {
    let x = 5;
    {
        let x = x * 10;
        println!("{}", x);
    }
    println!("{}", x);
}`,
      options: ["50 ثم 50", "50 ثم 5", "خطأ: x مقفل"],
      answer: 1,
      why: "let داخل القوسين يصنع درجاً جديداً يعيش حتى } الداخلية فقط، ويظلّل x الخارجي هناك. حين ينتهي القوسان يُزال الدرج الجديد، فيعود الاسم إلى الدرج الأول، وفيه 5 لم يمسّه أحد.",
      scene: check(
        `fn main() {
    let x = 5;
    {
        let x = x * 10;
        println!("{}", x);
    }
    println!("{}", x);
}`,
        [
          { line: 2, say: "x = 5.", memory: [lock("x", 5)], changed: ["x"] },
          { line: 4, say: "درج جديد بالاسم نفسه فيه 50، يظلّل القديم داخل القوسين.", memory: [hidden("x", 5), lock("x", 50)], changed: ["x"], read: ["x (hidden)"] },
          { line: 5, say: "x هنا هو الأحدث: 50.", memory: [hidden("x", 5), lock("x", 50)], read: ["x"], output: ["50"] },
          { line: 6, say: "نهاية النطاق: الدرج الداخلي يُزال، ويظهر القديم من جديد.", memory: [lock("x", 5)], output: ["50"] },
          { line: 7, say: "x هو الأول: 5.", memory: [lock("x", 5)], read: ["x"], output: ["50", "5"] },
        ],
      ),
    },
    {
      question: "mut يسمح بالتغيير. فهل يترجم هذا؟",
      code: `fn main() {
    let mut age = 20;
    age = "twenty";
    println!("{}", age);
}`,
      options: ["نعم، ويطبع twenty", "لا: درج age للأعداد ولا يحمل نصاً", "نعم، ويطبع 20"],
      answer: 1,
      why: "mut يفتح الدرج للقيم الجديدة، لكن حجمه ونوعه ثابتان منذ حجزه: i32. النص لا يدخل فيه. لو أردت اسماً بنوع جديد فالطريق هو التظليل: let age = \"twenty\";",
      scene: check(
        `fn main() {
    let mut age = 20;
    age = "twenty";
    println!("{}", age);
}`,
        [
          { line: 2, say: "درج مفتوح نوعه i32.", memory: [open("age", 20)], changed: ["age"] },
          {
            line: 3,
            say: "الدرج مفتوح، لكن النوع لا يطابق. المترجم يرفض.",
            memory: [open("age", 20)],
            error: "error[E0308]: mismatched types: expected integer, found `&str`",
          },
        ],
      ),
    },
  ],
  code: {
    intro: "شغّل البرنامج، ثم احذف mut من سطر total وشغّل مرة أخرى: اقرأ رسالة E0384 كاملة، فالمترجم يقترح عليك الإصلاح بنفسه.",
    runnerLang: "rust",
    runnerStarter: `const MAX_LIVES: u32 = 3; // a constant: known when compiling, always typed

fn main() {
    let mut total = 0;
    total += 40;
    total += 2;

    let input = "  Sara  ";
    let input = input.trim(); // shadowing: same name, a new cleaned value
    let input = input.len(); // and now a different type (usize)

    println!("total = {}", total);
    println!("letters = {}", input);
    println!("lives = {}", MAX_LIVES);
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "rust",
      title: "درج مفتوح",
      prompt: "رتّب الأسطر حتى يطبع البرنامج lives: 2.",
      lines: ["fn main() {", "    let mut lives = 3;", "    lives = lives - 1;", '    println!("lives: {}", lives);', "}"],
      expected: "lives: 2",
    },
    {
      kind: "fill",
      lang: "rust",
      title: "افتح الدرج",
      prompt: "ما الكلمة التي تجعل البرنامج يترجم ويطبع 2؟",
      template: 'fn main() {\n    let ___ count = 0;\n    count += 1;\n    count += 1;\n    println!("{}", count);\n}',
      options: ["mut", "const", "ref"],
      answer: "mut",
      expected: "2",
    },
    {
      kind: "fix",
      lang: "rust",
      title: "الضعف",
      prompt: "المترجم يرفض هذا البرنامج بـ E0384. أصلحه ليطبع 20.",
      code: 'fn main() {\n    let score = 10;\n    score = score * 2;\n    println!("{}", score);\n}',
      expected: "20",
      hint: "إما let mut score، وإما ظلّل الاسم: let score = score * 2;",
      solution: 'fn main() {\n    let mut score = 10;\n    score = score * 2;\n    println!("{}", score);\n}',
    },
    {
      kind: "write",
      lang: "rust",
      title: "نظّف ثم عُدّ",
      prompt: 'ابدأ بـ let word = "  rust  "; ثم ظلّل word مرتين: مرة بـ word.trim() ومرة بـ word.len(). اطبع word في النهاية (يجب أن يطبع 4).',
      starter: 'fn main() {\n    let word = "  rust  ";\n    // shadow word twice\n}\n',
      expected: "4",
      hint: "let word = word.trim(); ثم let word = word.len(); ثم println!.",
      solution: 'fn main() {\n    let word = "  rust  ";\n    let word = word.trim();\n    let word = word.len();\n    println!("{}", word);\n}',
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let a = 1;\nlet a = a + 1;\nlet a = a * 10;\nprintln!("{}", a);',
      options: ["20", "10", "خطأ: a مقفل"],
      answer: 0,
      why: "ثلاثة أدراج بالاسم نفسه. كل let تقرأ الدرج السابق وتصنع جديداً: 1، ثم 2، ثم 20. لم يُكتب في أي درج مرتين، فلا خطأ.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let mut x = 3;\nlet y = x;\nx = 8;\nprintln!("{} {}", x, y);',
      options: ["8 3", "8 8", "3 3"],
      answer: 0,
      why: "let y = x نسخت 3 إلى درج y المستقل. تغيير x بعدها يكتب في درج x وحده. الأرقام في Rust تُنسخ دائماً (من نوع Copy).",
    },
    {
      question: "أي سطر يرفضه المترجم؟",
      code: "let n = 5;\nlet mut m = n;\nm += 1;\nn += 1;",
      options: ["السطر 4", "السطر 3", "السطر 2"],
      answer: 0,
      why: "m مفتوح بـ mut فالسطر 3 سليم. n مقفل، والسطر 4 يحاول الكتابة فيه: error[E0384].",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'const STEP: u32 = 3;\nfn main() {\n    let mut tries = 0;\n    tries += STEP;\n    tries += STEP;\n    println!("{}", tries);\n}',
      options: ["6", "3", "خطأ: لا يمكن جمع ثابت"],
      answer: 0,
      why: "const قيمة يعرفها المترجم أثناء الترجمة، ويضعها في كل مكان تُستعمل فيه، ونوعها مكتوب دائماً. tries درج مفتوح: 0 ثم 3 ثم 6.",
    },
    {
      question: "ماذا يحدث مع هذا البرنامج؟",
      code: 'fn main() {\n    let mut name = "Sara";\n    println!("{}", name);\n}',
      options: [
        "يترجم ويطبع Sara، مع تحذير: name لا يحتاج mut",
        "يرفضه المترجم لأن name لم يتغيّر",
        "يطبع Sara دون أي ملاحظة",
      ],
      answer: 0,
      why: "mut زائدة ليست خطأ، لكن المترجم ينبّهك: warning: variable does not need to be mutable. فتح درج لا يتغيّر يجعل قارئ الكود يبحث عن تغيير لن يجده.",
    },
  ],
  next: "rs-types",
};
