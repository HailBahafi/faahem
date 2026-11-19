import type { Cell, Lesson, Scene } from "@/lib/types";

/** A label in the checker's table: the type it wrote on a drawer before anything runs. */
const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });

const labels = [label("latte", "Drink"), label("d", "Drink"), label("cups", "number"), label("total()", "number")];

/** A hand-written answer scene: the checker reads the TypeScript and stops at the bad line. */
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

export const typescript: Lesson = {
  slug: "typescript",
  stage: 6,
  number: "6.8",
  title: "TypeScript",
  subtitle: "مدقّق يقرأ كودك قبل أن يعمل، ويكتب على كل درج نوعه",
  minutes: 20,
  problem: {
    title: "الخطأ الذي لا يصرخ",
    body: "سعر لاتيه زائد رسوم التوصيل. اضغط على القيم الملوّنة لتغييرها وأدخل خطأً صغيراً: سعراً كنص، أو اسم خاصية مكتوباً خطأ. انظر ماذا يقول المدقّق قبل التشغيل، وماذا كانت JavaScript ستطبع بدونه.",
    demo: "typescript",
  },
  singleLanguage: true,
  scene: {
    steps: [
      {
        line: null,
        say: "على اليمين TypeScript، وعلى اليسار ما يبقى منها حين تعمل. قبل أي تشغيل يقرأ المدقّق الملف كله، ولا يعطي أي درج قيمة.",
        memory: [],
      },
      {
        line: 1,
        say: "interface لا تصنع شيئاً في الذاكرة. هي شكل يحفظه المدقّق: أي Drink له name نص و price رقم.",
        memory: [label("Drink", "{ name: string; price: number }")],
      },
      {
        line: 5,
        say: "المدقّق يكتب على درج latte النوع Drink، ويتأكد أن الكائن مطابق للشكل: name نص ✓ و price رقم ✓.",
        memory: [label("latte", "Drink")],
        changed: ["latte"],
      },
      {
        line: 6,
        say: "معاملات total لها أنواع: d من نوع Drink و cups رقم، وما ترجعه رقم.",
        memory: labels,
        changed: ["d", "cups", "total()"],
      },
      {
        line: 7,
        say: "d.price: هل في Drink خاصية اسمها price؟ نعم، وهي رقم. رقم × رقم = رقم، يطابق ما وعدت به الدالة.",
        memory: labels,
        read: ["d", "cups"],
      },
      {
        line: 9,
        say: "total(latte, 2): الأول Drink ✓ والثاني رقم ✓. لو كتبت \"2\" أو lattee لظهر هنا خط أحمر، ولم يصل الكود إلى التشغيل.",
        memory: labels,
        read: ["latte", "total()"],
      },
      {
        line: null,
        say: "لا أخطاء. الآن تُمحى الأنواع كلها: الأسطر 1 إلى 4 تختفي، و ‎: Drink و ‎: number تُحذف. ما يعمل هو JavaScript عادية.",
        memory: [],
      },
      {
        line: 5,
        say: "التشغيل الحقيقي يبدأ: درج latte يحمل الكائن. لا أثر للنوع في الذاكرة.",
        memory: [s("latte.name", "latte"), n("latte.price", 15)],
        changed: ["latte.name", "latte.price"],
      },
      {
        line: 7,
        say: "استدعاء total ينسخ القيم إلى d و cups، و d.price * cups تساوي 15 × 2 = 30.",
        memory: [s("latte.name", "latte"), n("latte.price", 15), n("cups", 2)],
        read: ["latte.price", "cups"],
      },
      {
        line: 9,
        say: "يُطبع 30. المدقّق عمل قبل التشغيل فقط، وأثناء التشغيل لا يوجد إلا JavaScript.",
        memory: [s("latte.name", "latte"), n("latte.price", 15), n("cups", 2)],
        output: ["30"],
      },
    ],
    code: {
      ts: `interface Drink {
  name: string;
  price: number;
}
const latte: Drink = { name: "latte", price: 15 };
function total(d: Drink, cups: number): number {
  return d.price * cups;
}
console.log(total(latte, 2));`,
      js: `



const latte = { name: "latte", price: 15 };
function total(d, cups) {
  return d.price * cups;
}
console.log(total(latte, 2));`,
    },
    notes: {
      ts: "الأنواع تُكتب بعد الاسم ونقطتين: ‎cups: number. و interface تصف شكل كائن. كل هذا يُقرأ قبل التشغيل ثم يُمحى.",
      js: "الملف نفسه بعد محو الأنواع: هذا ما يشغّله المتصفح أو Node فعلاً. الأسطر الفارغة كانت interface.",
    },
  },
  playground: {
    kind: "trace",
    intro: "هذا كود JavaScript بلا مدقّق، وفيه خطآن من النوع الذي يمسكه TypeScript. شغّله وراقب: لا شيء يتوقف، والنتيجة خاطئة بهدوء.",
    starter: `let drink = { name: "latte", price: 15 };
let delivery = "5";
let bill = drink.price + delivery;
console.log(bill);
let discount = drink.prise * 0.1;
console.log(discount);`,
    challenges: [
      "قبل التشغيل: ماذا سيطبع السطر الرابع؟ ولماذا ليس 20؟",
      "لو كان الكود TypeScript وكتبت let delivery: number = \"5\"، أي سطر سيظهر عليه الخط الأحمر؟",
      "أصلح السطر الثاني إلى 5 بلا علامتي تنصيص. ماذا يُطبع الآن؟",
      "السطر الخامس يطبع NaN. ما الخطأ الإملائي؟ TypeScript كان سيقول: Property 'prise' does not exist. أصلحه.",
    ],
  },
  predict: [
    {
      question: "أي سطر سيرفضه TypeScript قبل التشغيل؟",
      code: `let price: number = 15;
price = 20;
price = "free";
console.log(price);`,
      options: ["السطر 3", "السطر 2", "لا شيء، كله صحيح"],
      answer: 0,
      why: "المدقّق كتب على درج price أنه number. وضع 20 فيه مقبول، أما \"free\" فنص، فيرسم خطاً أحمر تحت السطر 3: Type 'string' is not assignable to type 'number'.",
      scene: check(
        `let price: number = 15;
price = 20;
price = "free";
console.log(price);`,
        [
          { line: 1, say: "المدقّق يكتب على درج price: number.", memory: [label("price", "number")] },
          { line: 2, say: "20 رقم، يطابق الملصق ✓.", memory: [label("price", "number")], read: ["price"] },
          { line: 3, say: "\"free\" نص والملصق يقول number. خط أحمر، والكود لا يُشغَّل حتى تصلحه.", memory: [label("price", "number")], read: ["price"], error: "Type 'string' is not assignable to type 'number'." },
        ],
      ),
    },
    {
      question: "لم نكتب أي نوع هنا. هل يرفض TypeScript السطر 2؟",
      code: `let count = 3;
count = "three";`,
      options: ["نعم: count صار number من أول قيمة", "لا: لم نكتب نوعاً فكل شيء مسموح", "لا، لكنه يعطي تحذيراً عند التشغيل"],
      answer: 0,
      why: "الاستنتاج: المدقّق يرى 3 فيكتب على الدرج number بنفسه. لذلك لا تحتاج أن تكتب الأنواع في كل مكان، ومع ذلك يُرفض وضع نص فيه.",
      scene: check(
        `let count = 3;
count = "three";`,
        [
          { line: 1, say: "لا نوع مكتوب، لكن القيمة 3 رقم، فيستنتج المدقّق: count من نوع number.", memory: [label("count", "number")], changed: ["count"] },
          { line: 2, say: "نص في درج number: خط أحمر.", memory: [label("count", "number")], error: "Type 'string' is not assignable to type 'number'." },
        ],
      ),
    },
    {
      question: "status نوعه \"ok\" | \"error\". أي سطر يُرفض؟",
      code: `type Status = "ok" | "error";
let a: Status = "ok";
let b: Status = "eror";
let c: Status = "error";`,
      options: ["السطر 3", "السطر 4", "السطر 2"],
      answer: 0,
      why: "النوع المتحد يقبل هاتين القيمتين بالضبط ولا غيرهما. \"eror\" ينقصها حرف، فهي نص ليس من القائمة. هذا خطأ إملائي كانت JavaScript ستقبله بصمت.",
      scene: check(
        `type Status = "ok" | "error";
let a: Status = "ok";
let b: Status = "eror";
let c: Status = "error";`,
        [
          { line: 1, say: "Status ليس أي نص: فقط \"ok\" أو \"error\".", memory: [label("Status", "\"ok\" | \"error\"")] },
          { line: 2, say: "\"ok\" من القائمة ✓.", memory: [label("Status", "\"ok\" | \"error\""), label("a", "Status")] },
          { line: 3, say: "\"eror\" ليست في القائمة: خط أحمر.", memory: [label("Status", "\"ok\" | \"error\""), label("a", "Status"), label("b", "Status")], error: "Type '\"eror\"' is not assignable to type 'Status'." },
        ],
      ),
    },
  ],
  code: {
    intro: "هنا يعمل TypeScript فعلاً، لكن بعد محو أنواعه بلا تدقيق، فجرّب السلوك: ‎?‎ بعد اسم الخاصية تجعلها اختيارية، وقيمتها undefined إن غابت. وفي محررك الحقيقي (VS Code) سيظهر الخط الأحمر وأنت تكتب.",
    runnerLang: "ts",
    runnerStarter: `interface Order {
  drink: string;
  cups: number;
  note?: string;
}
type Status = "ok" | "error";
function check(order: Order): Status {
  if (order.cups > 0) {
    return "ok";
  }
  return "error";
}
const first: Order = { drink: "latte", cups: 2 };
const second: Order = { drink: "tea", cups: 0, note: "no sugar" };
console.log(check(first), first.note);
console.log(check(second), second.note);
// try: add a third order with a note, and print its status
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "شكل الكائن أولاً",
      prompt: "رتّب الأسطر: عرّف الشكل Drink، ثم كائناً منه، ثم اطبع اسمه وسعره: tea 8",
      lines: ["interface Drink {", "  name: string;", "  price: number;", "}", 'const tea: Drink = { name: "tea", price: 8 };', "console.log(tea.name, tea.price);"],
      expected: "tea 8",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "النوع المتحد",
      prompt: "أي قيمة تجعل الدالة تطبع the order is ready؟",
      template: `type Status = "ok" | "error";
function message(s: Status): string {
  if (s === "ok") {
    return "the order is ready";
  }
  return "something went wrong";
}
console.log(message(___));`,
      options: ['"ok"', '"error"', '"OK"'],
      expected: "the order is ready",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "الفاتورة الملتصقة",
      prompt: "الفاتورة تطبع 155 بدل 20، لأن delivery نص. TypeScript كان سيرفض السطر الثاني. أصلحه ليطبع 20.",
      code: `const price: number = 15;
const delivery: any = "5";
console.log(price + delivery);`,
      expected: "20",
      hint: "any يطفئ المدقّق. اجعل النوع number والقيمة 5 بلا علامتي تنصيص.",
      solution: `const price: number = 15;
const delivery: number = 5;
console.log(price + delivery);`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "خاصية اختيارية",
      prompt: "اكتب interface اسمها Cup فيها size نص و sugar رقم اختياري (sugar?: number). اكتب دالة describe(c: Cup): string ترجع size ثم \" with \" ثم sugar، أو size ثم \" plain\" إن غاب sugar. اطبع: large with 2 ثم small plain",
      starter: "// write interface Cup and function describe here\n",
      expected: "large with 2\nsmall plain",
      hint: "داخل الدالة: if (c.sugar === undefined) { return c.size + \" plain\"; } ثم return c.size + \" with \" + c.sugar;",
      solution: `interface Cup {
  size: string;
  sugar?: number;
}
function describe(c: Cup): string {
  if (c.sugar === undefined) {
    return c.size + " plain";
  }
  return c.size + " with " + c.sugar;
}
console.log(describe({ size: "large", sugar: 2 }));
console.log(describe({ size: "small" }));`,
    },
  ],
  quiz: [
    {
      question: "أي سطر يرفضه TypeScript؟",
      code: 'interface User {\n  name: string;\n  age: number;\n}\nconst u: User = { name: "Sara", age: 20 };\nconsole.log(u.nmae);',
      options: ["السطر 6", "السطر 5", "لا شيء"],
      answer: 0,
      why: "المدقّق يعرف شكل User: name و age فقط. u.nmae ليست فيه، فيقول: Property 'nmae' does not exist on type 'User'. Did you mean 'name'?‎ بدون TypeScript كانت ستطبع undefined بصمت.",
    },
    {
      question: "ما نوع total كما يستنتجه TypeScript؟",
      code: "const a = 4;\nconst b = 6;\nconst total = a * b;",
      options: ["number", "any (لم نكتب نوعاً)", "string"],
      answer: 0,
      why: "a و b رقمان من قيمتيهما، ورقم × رقم = رقم. المدقّق يتتبّع الأنواع من القيم كما تتتبّع أنت القيم، فلا داعي لكتابة ‎: number هنا.",
    },
    {
      question: "ماذا يحدث لهذا الكود عند التشغيل بعد محو الأنواع؟",
      code: "function half(n: number): number {\n  return n / 2;\n}\nconsole.log(half(10));",
      options: ["يطبع 5", "يطبع 5 ثم يتحقق من النوع", "خطأ: المتصفح لا يفهم ‎: number"],
      answer: 0,
      why: "‎: number تُمحى قبل التشغيل، فيبقى function half(n) { return n / 2; }‎. ما يعمل JavaScript عادية تطبع 5، ولا تحقق من الأنواع أثناء التشغيل.",
    },
    {
      question: "أي استدعاء يرفضه TypeScript؟",
      code: 'interface Order {\n  drink: string;\n  note?: string;\n}\nfunction place(o: Order) {}\nplace({ drink: "tea" });            // 1\nplace({ drink: "tea", note: "hot" }); // 2\nplace({ note: "hot" });             // 3',
      options: ["3", "1", "2"],
      answer: 0,
      why: "note عليها ؟ فهي اختيارية: غيابها مقبول (1) ووجودها مقبول (2). أما drink فإلزامية، و 3 ينقصه drink: Property 'drink' is missing.",
    },
    {
      question: "هذا الكود يمر من المدقّق بلا أي خط أحمر. ماذا يطبع؟",
      code: "function area(w: number, h: number): number {\n  return w + h;\n}\nconsole.log(area(3, 4));",
      options: ["7", "12", "لن يمر: المدقّق يكتشف الخطأ"],
      answer: 0,
      why: "المدقّق يتحقق من الأنواع لا من المعنى: w + h رقم، والدالة وعدت برقم، فكل شيء سليم عنده. يُطبع 7 والصحيح 12. الأنواع تمنع صنفاً من الأخطاء، لا كلها.",
    },
  ],
  next: "react",
};
