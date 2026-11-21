import type { Cell, Lesson, Scene } from "@/lib/types";

/** A drawer as the checker sees it: its label (the type) is part of its name. */
const num = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const str = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const bool = (name: string, value: boolean): Cell => ({ name, value: String(value), type: "boolean" });
/** A label only: the checker's table before anything runs. */
const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });

const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const afterLine3 = [num("price: number", 25), str("item: string", "coffee"), bool("paid: boolean", false)];
const afterLine4 = [num("price: number", 50), str("item: string", "coffee"), bool("paid: boolean", false)];
const afterLine5 = [...afterLine4, str("input: unknown", "3")];
const afterLine6 = [...afterLine5, num("cups: number", 3)];

export const tsAnnotations: Lesson = {
  slug: "ts-annotations",
  stage: 0,
  number: "1.2",
  title: "التعليقات النوعية",
  subtitle: "ملصق على كل درج: تكتبه أنت أو يستنتجه المدقّق",
  minutes: 18,
  problem: {
    title: "درج بلا ملصق يقبل أي شيء",
    body: "درج اسمه price والبرنامج يطبع price + 5. اختر ملصق الدرج، ثم ضع فيه قيمة مختلفة كل مرة. متى يوقفك المدقّق؟ ومتى تمر قيمة خاطئة بصمت؟",
    demo: "tsAnnotations",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `let price: number = 25;
let item = "coffee";
let paid = false;
price = price * 2;
let input: unknown = "3";
let cups = Number(input);
console.log(item, price, paid, cups);`,
      js: `let price = 25;
let item = "coffee";
let paid = false;
price = price * 2;
let input = "3";
let cups = Number(input);
console.log(item, price, paid, cups);`,
    },
    steps: [
      {
        line: null,
        say: "كل درج هنا له ملصق: نوعه، مكتوب بجانب اسمه. المدقّق يكتب الملصقات قبل التشغيل، ثم تعمل القيم كما في JavaScript.",
        memory: [],
      },
      {
        line: 1,
        say: "‎: number تعليق نوعي كتبته أنت: الدرج price لا يقبل إلا أرقاماً. والقيمة 25 رقم، فتدخل.",
        memory: [num("price: number", 25)],
        changed: ["price: number"],
      },
      {
        line: 2,
        say: "لا تعليق هنا. المدقّق يرى \"coffee\" فيستنتج الملصق string بنفسه. الاستنتاج يوفّر عليك الكتابة، والحماية هي نفسها.",
        memory: [num("price: number", 25), str("item: string", "coffee")],
        changed: ["item: string"],
      },
      {
        line: 3,
        say: "false قيمة منطقية، فيُكتب على الدرج boolean.",
        memory: afterLine3,
        changed: ["paid: boolean"],
      },
      {
        line: 4,
        say: "المدقّق يسأل: رقم × رقم = رقم، وهل يطابق ملصق price؟ نعم. ثم يُحسب الطرف الأيمن 50 ويُكتب في الدرج.",
        memory: afterLine4,
        read: ["price: number"],
        changed: ["price: number"],
      },
      {
        line: 5,
        say: "unknown ملصق صادق لقيمة لا نعرفها بعد، كنص قادم من نموذج. يقبل أي شيء، ولا يسمح باستعماله قبل أن تتحقق منه أو تحوّله.",
        memory: afterLine5,
        changed: ["input: unknown"],
      },
      {
        line: 6,
        say: "Number(input) يحوّل النص \"3\" إلى الرقم 3، والمدقّق يعرف أن Number يرجع number فيكتبه على cups.",
        memory: afterLine6,
        read: ["input: unknown"],
        changed: ["cups: number"],
      },
      {
        line: 7,
        say: "يُطبع coffee 50 false 3.",
        memory: afterLine6,
        read: ["item: string", "price: number", "paid: boolean", "cups: number"],
        output: ["coffee 50 false 3"],
      },
      {
        line: null,
        say: "انظر إلى النسخة JavaScript: الملصقات اختفت، والقيم نفسها في الأدراج نفسها. التعليق النوعي لا يحوّل ولا يحجز ذاكرة: هو وعد يفحصه المدقّق قبل التشغيل.",
        memory: afterLine6,
      },
    ],
    notes: {
      ts: "التعليق يأتي بعد الاسم ونقطتين: ‎let price: number. اكتبه حين لا تكفي القيمة الأولى لتصف ما تريد، واترك الباقي للاستنتاج.",
      js: "الملف نفسه بعد محو الأنواع: هذا ما يشغّله Node أو المتصفح. كل ‎: number و ‎: unknown حُذفت.",
    },
  },
  playground: {
    kind: "trace",
    intro: "هذا JavaScript بلا ملصقات. درجان يبدوان متشابهين: أحدهما فيه الرقم 25 والآخر فيه النص \"25\". شغّل وراقب كيف تعامل JavaScript كلاً منهما.",
    starter: `let price = 25;
let fromForm = "25";
console.log(price * 2);
console.log(fromForm * 2);
console.log(price + 5);
console.log(fromForm + 5);
let flag = true;
console.log(flag + 1);`,
    challenges: [
      "قبل التشغيل: ماذا يطبع السطر السادس؟ لماذا يختلف عن الخامس مع أن السطر الرابع أعطى النتيجة نفسها؟",
      "لو كتبت let fromForm: number = \"25\" في TypeScript، أي سطر سيظهر عليه الخط الأحمر؟",
      "أصلح السطر الثاني إلى Number(\"25\") وشغّل. ماذا تغيّر في السطر السادس؟",
      "flag + 1 يطبع 2. ما الذي كان سيقوله TypeScript عن جمع boolean مع رقم؟",
    ],
  },
  predict: [
    {
      question: "data نوعه any. هل يرفض tsc السطر 2؟ وماذا يُطبع؟",
      code: `let data: any = "5";
let n: number = data;
console.log(n * 2, n + 1);`,
      options: ["لا خطأ، ويُطبع 10 51", "خطأ في السطر 2: نص في درج number", "لا خطأ، ويُطبع 10 6"],
      answer: 0,
      why: "any يطفئ المدقّق: قيمة any تدخل أي درج بلا سؤال. الملصق number على n صار كذبة، لأن التعليق لا يحوّل القيمة. عند التشغيل \"5\" * 2 = 10، أما \"5\" + 1 فلصق نصين: 51.",
      scene: check(
        `let data: any = "5";
let n: number = data;
console.log(n * 2, n + 1);`,
        [
          { line: 1, say: "الملصق any: المدقّق لن يسأل عن هذا الدرج أبداً.", memory: [str("data: any", "5")], changed: ["data: any"] },
          { line: 2, say: "any تمر إلى درج number بلا فحص. لكن ما بداخله ما زال النص \"5\".", memory: [str("data: any", "5"), str("n: number", "5")], copy: { from: "data: any", to: "n: number" } },
          { line: 3, say: "\"5\" * 2 تحوّل إلى رقم: 10. و \"5\" + 1 تلصق: 51. خطأ صامت.", memory: [str("data: any", "5"), str("n: number", "5")], read: ["n: number"], output: ["10 51"] },
        ],
      ),
    },
    {
      question: "الآن data نوعه unknown. هل يقبل tsc السطر 2؟",
      code: `let data: unknown = "5";
let n: number = data;`,
      options: ["لا: Type 'unknown' is not assignable to type 'number'", "نعم: unknown مثل any", "نعم، لكنه يحوّل \"5\" إلى 5"],
      answer: 0,
      why: "unknown يقبل أي قيمة تدخل إليه، لكنه لا يسمح لها بالخروج إلى درج له نوع أضيق قبل أن تتحقق منها أو تحوّلها (Number(data)). لهذا يفضّله المحترفون على any لكل قيمة قادمة من الخارج.",
      scene: check(
        `let data: unknown = "5";
let n: number = data;`,
        [
          { line: 1, say: "unknown: \"لا أعرف ما هذا بعد\". الدخول مسموح.", memory: [label("data", "unknown")] },
          { line: 2, say: "الخروج إلى درج number ممنوع: المدقّق لا يعرف أنها رقم.", memory: [label("data", "unknown"), label("n", "number")], error: "Type 'unknown' is not assignable to type 'number'." },
        ],
      ),
    },
    {
      question: "مع strict (الإعداد المعتاد)، ماذا يقول tsc عن هذه الدالة؟",
      code: `function double(n) {
  return n * 2;
}`,
      options: ["خطأ في السطر 1: n نوعه any ضمنياً", "لا خطأ: يستنتج number من n * 2", "خطأ في السطر 2: لا يمكن ضرب any"],
      answer: 0,
      why: "المدقّق يستنتج نوع المتغير من قيمته الأولى، لكن المعامل ليست له قيمة بعد: قيمته تأتي من المستدعي. لذلك المعاملات هي المكان الذي يجب أن تكتب فيه التعليق: function double(n: number).",
      scene: check(
        `function double(n) {
  return n * 2;
}`,
        [
          { line: 1, say: "n بلا تعليق ولا قيمة. لا شيء يستنتج منه المدقّق، فيصير any ضمنياً، و strict يرفض ذلك.", memory: [label("n", "any (implicit)")], error: "Parameter 'n' implicitly has an 'any' type." },
        ],
      ),
    },
  ],
  code: {
    intro: "هنا يعمل TypeScript بعد محو أنواعه. لاحظ أمرين: typeof يكشف ما في الدرج فعلاً وقت التشغيل، والتعليق النوعي لا يحوّل شيئاً: الدرج qty عليه number وبداخله نص.",
    runnerLang: "ts",
    runnerStarter: `let price: number = 25;
let item: string = "coffee";
let inStock: boolean = true;
console.log(typeof price, typeof item, typeof inStock);

const fromForm: any = "2";
const qty: number = fromForm;
console.log(typeof qty, qty + 1);

const safeQty: number = Number(fromForm);
console.log(typeof safeQty, safeQty + 1);
// try: change "2" to "two" and see what Number() gives
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "الفاتورة بملصقات",
      prompt: "رتّب الأسطر: السعر ثم عدد الأكواب ثم المجموع، ثم اطبع: tea 24",
      lines: ['const item: string = "tea";', "const price: number = 8;", "const cups: number = 3;", "const total: number = price * cups;", "console.log(item, total);"],
      expected: "tea 24",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "القيمة المطابقة للملصق",
      prompt: "أي قيمة تطابق الملصق number فعلاً، فيُطبع 4؟",
      template: `const qty: number = ___;
console.log(qty + 1);`,
      options: ["3", '"3"', "true"],
      expected: "4",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "الملصق الكاذب",
      prompt: "any سمح بنص في درج number، فيُطبع 205 بدل 25. أصلح السطر الثاني ليحوّل القيمة فعلاً.",
      code: `const fromForm: any = "20";
const price: number = fromForm;
console.log(price + 5);`,
      expected: "25",
      hint: "التعليق النوعي لا يحوّل. استعمل Number(fromForm).",
      solution: `const fromForm: any = "20";
const price: number = Number(fromForm);
console.log(price + 5);`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "من unknown إلى رقم",
      prompt: "input نوعه unknown وفيه \"7\". أنشئ cups: number بتحويله بـ Number، ثم اطبع cups * 3 و typeof cups في سطر واحد: 21 number",
      starter: `const input: unknown = "7";
// create cups: number from input, then print cups * 3 and typeof cups
`,
      expected: "21 number",
      hint: "const cups: number = Number(input); ثم console.log(cups * 3, typeof cups);",
      solution: `const input: unknown = "7";
const cups: number = Number(input);
console.log(cups * 3, typeof cups);`,
    },
  ],
  quiz: [
    {
      question: "ما النوع الذي يستنتجه TypeScript للمتغير city؟",
      code: 'let city = "Riyadh";',
      options: ["string", "any (لم نكتب نوعاً)", "unknown"],
      answer: 0,
      why: "القيمة الأولى نص، فيكتب المدقّق على الدرج string. ولأن let يسمح بالتغيير، الملصق واسع: أي نص لاحقاً مقبول، والرقم مرفوض.",
    },
    {
      question: "ماذا يطبع هذا الكود؟ (يمر من tsc بلا خطأ)",
      code: 'const a: number = 10;\nconst b: any = "2";\nconsole.log(a * b, a + b);',
      options: ["20 102", "20 12", "خطأ عند التشغيل"],
      answer: 0,
      why: "b عليه any فلم يُفحص. عند التشغيل * تحوّل \"2\" إلى رقم فتعطي 20، و + مع نص تلصق: \"102\". any يعيدك إلى JavaScript بلا حماية.",
    },
    {
      question: "أي سطر يرفضه tsc؟",
      code: 'let ok = true;\nok = false;\nok = "yes";',
      options: ["السطر 3", "السطر 2", "لا شيء: لم نكتب نوعاً"],
      answer: 0,
      why: "استنتج المدقّق boolean من true في السطر 1. false منطقية فتدخل، أما \"yes\" فنص: Type 'string' is not assignable to type 'boolean'.",
    },
    {
      question: "مع strict، ماذا يقول tsc؟",
      code: "let name: string = null;",
      options: ["Type 'null' is not assignable to type 'string'", "لا شيء: null تناسب أي نوع", "يحوّل null إلى \"null\""],
      answer: 0,
      why: "في الوضع الصارم null ليست نصاً، فالملصق string يعني \"نص دائماً\". إن كان الاسم قد يغيب فقل ذلك صراحة في النوع، وهذا موضوع درس الاتحادات.",
    },
    {
      question: "أي سطر يرفضه tsc؟",
      code: 'const a: any = "hi";\nconst b: unknown = "hi";\nconsole.log(a.toUpperCase());\nconsole.log(b.toUpperCase());',
      options: ["السطر 4", "السطر 3", "السطران 3 و 4"],
      answer: 0,
      why: "any يسمح بكل شيء بلا سؤال. unknown يمنع استعمال القيمة قبل التحقق منها: 'b' is of type 'unknown'. الفرق كله في السطر 4: المدقّق يجبرك على السؤال أولاً.",
    },
  ],
  next: "ts-objects",
};
