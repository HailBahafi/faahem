import type { Cell, Lesson, Scene } from "@/lib/types";

const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const str = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const num = (name: string, value: number, constant = false): Cell => ({ name, value: String(value), type: "number", constant });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const STATUS = label("Status", '"pending" | "paid" | "shipped"');
const SIZE = { name: "Size", value: '{ Small: "S", Large: "L" }', type: "none" as const, constant: true };

export const tsLiterals: Lesson = {
  slug: "ts-literals",
  stage: 0,
  number: "1.7",
  title: "الأنواع الحرفية و enum",
  subtitle: "ملصق لا يقبل إلا قيماً بعينها: قائمة مغلقة يعرفها المدقّق",
  minutes: 18,
  problem: {
    title: "حالة مكتوبة خطأً",
    body: "طلب يمر بثلاث حالات: pending ثم paid ثم shipped. اكتب الحالة التالية بنفسك، وجرّب خطأً إملائياً صغيراً. قارن بين الملصق string والملصق الذي يعدّد الحالات.",
    demo: "tsLiterals",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `type Status = "pending" | "paid" | "shipped";
let order: Status = "pending";
const max = 3;
let tries = 3;
enum Size { Small = "S", Large = "L" }
order = "paid";
console.log(order, max, tries, Size.Large);`,
      js: `
let order = "pending";
const max = 3;
let tries = 3;
const Size = { Small: "S", Large: "L" };
order = "paid";
console.log(order, max, tries, Size.Large);`,
    },
    steps: [
      {
        line: null,
        say: "\"paid\" ليس نصاً فقط: يمكن أن يكون نوعاً، ملصقاً لا يقبل إلا هذه القيمة. ومن عدة قيم كهذه نصنع قائمة مغلقة.",
        memory: [],
      },
      {
        line: 1,
        say: "Status قائمة من ثلاث قيم بالضبط. أي نص آخر، ولو اختلف بحرف، مرفوض.",
        memory: [STATUS],
      },
      {
        line: 2,
        say: "\"pending\" من القائمة ✓. الدرج order عليه Status.",
        memory: [STATUS, str("order: Status", "pending")],
        changed: ["order: Status"],
      },
      {
        line: 3,
        say: "const بلا تعليق: القيمة لن تتغيّر أبداً، فيكتب المدقّق على الدرج النوع الحرفي 3، لا number.",
        memory: [STATUS, str("order: Status", "pending"), num("max: 3", 3, true)],
        changed: ["max: 3"],
      },
      {
        line: 4,
        say: "let مع القيمة نفسها: الدرج سيتغيّر لاحقاً، فيوسّع المدقّق الملصق إلى number. هذا اسمه التوسيع.",
        memory: [STATUS, str("order: Status", "pending"), num("max: 3", 3, true), num("tries: number", 3)],
        changed: ["tries: number"],
      },
      {
        line: 5,
        say: "enum مختلف عن كل ما رأيت: ليس ملصقاً فقط، بل يصنع كائناً حقيقياً في الذاكرة. انظر إلى سطره في نسخة JavaScript.",
        memory: [STATUS, str("order: Status", "pending"), num("max: 3", 3, true), num("tries: number", 3), SIZE],
        changed: ["Size"],
      },
      {
        line: 6,
        say: "\"paid\" من القائمة ✓، فيُكتب في الدرج.",
        memory: [STATUS, str("order: Status", "paid"), num("max: 3", 3, true), num("tries: number", 3), SIZE],
        changed: ["order: Status"],
      },
      {
        line: 7,
        say: "Size.Large يُقرأ من الكائن: \"L\". يُطبع paid 3 3 L.",
        memory: [STATUS, str("order: Status", "paid"), num("max: 3", 3, true), num("tries: number", 3), SIZE],
        read: ["order: Status", "Size"],
        output: ["paid 3 3 L"],
      },
      {
        line: null,
        say: "بعد المحو: Status اختفى (السطر 1 فارغ)، لكن enum بقي كائناً في السطر 5. لهذا يفضّل كثير من الفرق اتحاد النصوص: الحماية نفسها، بلا كود زائد.",
        memory: [str("order", "paid"), num("max", 3, true), num("tries", 3), SIZE],
      },
    ],
    notes: {
      ts: "\"a\" | \"b\" قائمة مغلقة من القيم. const يحفظ القيمة الحرفية و let يوسّعها. و enum الوحيد هنا الذي يترك كائناً وقت التشغيل.",
      js: "ما يبقى بعد محو الأنواع. السطر 1 اختفى، وسطر enum صار كائناً عادياً (المترجم الحقيقي يكتبه بصيغة أطول، والمعنى نفسه).",
    },
  },
  playground: {
    kind: "trace",
    intro: "حالات الطلب نصوص عادية في JavaScript. شغّل، ثم انظر ماذا يفعل خطأ إملائي واحد في السطر 13.",
    starter: `let status = "pending";
function next(s) {
  if (s === "pending") {
    return "paid";
  }
  if (s === "paid") {
    return "shipped";
  }
  return "unknown";
}
status = next(status);
console.log(status);
status = "shiped";
console.log(next(status));`,
    challenges: [
      "قبل التشغيل: ماذا يطبع السطر الأخير؟ هل توقف البرنامج عند الخطأ الإملائي؟",
      "مع let status: \"pending\" | \"paid\" | \"shipped\"، أي سطر كان TypeScript سيرفضه؟",
      "أصلح الإملاء في السطر 13. ماذا يُطبع الآن؟",
      "\"unknown\" ليست من الحالات الثلاث. لو كتبت نوع إرجاع next على أنه الحالات الثلاث، ماذا كان سيقول المدقّق عن السطر 9؟",
    ],
  },
  predict: [
    {
      question: "ما النوع الذي يكتبه المدقّق على كل درج؟",
      code: `const a = "tea";
let b = "tea";`,
      options: ["a: \"tea\" و b: string", "كلاهما string", "كلاهما \"tea\""],
      answer: 0,
      why: "const لن يتغيّر، فنوعه أدق ما يمكن: القيمة نفسها. let قد يتغيّر إلى أي نص، فيوسّعه المدقّق إلى string. القيمة في الذاكرة واحدة؛ الملصق مختلف.",
      scene: check(
        `const a = "tea";
let b = "tea";`,
        [
          { line: 1, say: "const: القيمة ثابتة، فالنوع \"tea\" بالضبط.", memory: [label("a", '"tea"')] },
          { line: 2, say: "let: قد يتغيّر، فالنوع string.", memory: [label("a", '"tea"'), label("b", "string")] },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc عن السطر 4؟",
      code: `type Size = "S" | "M" | "L";
function cup(size: Size) {}
let mine = "M";
cup(mine);`,
      options: ["Argument of type 'string' is not assignable to parameter of type 'Size'", "لا خطأ: \"M\" من القائمة", "لا خطأ، لكن cup لا تفعل شيئاً"],
      answer: 0,
      why: "let وسّع mine إلى string، فقد يحمل لاحقاً \"XL\". المدقّق لا يقبل أي نص في مكان يطلب Size. الحل: const mine = \"M\"، أو let mine: Size = \"M\".",
      scene: check(
        `type Size = "S" | "M" | "L";
function cup(size: Size) {}
let mine = "M";
cup(mine);`,
        [
          { line: 1, say: "Size: ثلاث قيم فقط.", memory: [label("Size", '"S" | "M" | "L"')] },
          { line: 3, say: "let مع \"M\": يتوسّع إلى string.", memory: [label("Size", '"S" | "M" | "L"'), label("mine", "string")] },
          { line: 4, say: "string أوسع من Size: قد تكون أي نص. خط أحمر، مع أن القيمة الآن \"M\".", memory: [label("Size", '"S" | "M" | "L"'), label("mine", "string")], error: "Argument of type 'string' is not assignable to parameter of type 'Size'." },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc عن هذه الدالة؟",
      code: `type Status = "pending" | "paid" | "shipped";
function label(s: Status): string {
  switch (s) {
    case "pending":
      return "waiting";
    case "paid":
      return "on its way soon";
  }
}`,
      options: ["خطأ: حالة shipped تصل إلى النهاية بلا return", "لا خطأ: switch يغطي الحالات", "لا خطأ، و shipped ترجع \"\""],
      answer: 0,
      why: "المدقّق يعرف القائمة كاملة، فيعرف أن \"shipped\" لا case لها وستخرج بلا return. أضفت حالة جديدة إلى Status؟ يريك المدقّق كل switch نسيها.",
      scene: check(
        `type Status = "pending" | "paid" | "shipped";
function label(s: Status): string {
  switch (s) {
    case "pending":
      return "waiting";
    case "paid":
      return "on its way soon";
  }
}`,
        [
          { line: 3, say: "s قد يكون أياً من الثلاث.", memory: [label("s", '"pending" | "paid" | "shipped"')] },
          { line: 4, say: "case \"pending\" يشطب واحدة.", memory: [label("s", '"paid" | "shipped"')] },
          { line: 6, say: "case \"paid\" يشطب الثانية.", memory: [label("s", '"shipped"')] },
          { line: 8, say: "بقي \"shipped\" بلا return. الوعد string لم يتحقق.", memory: [label("s", '"shipped"')], error: "Function lacks ending return statement and return type does not include 'undefined'." },
        ],
      ),
    },
  ],
  code: {
    intro: "الطريقة الشائعة اليوم: مصفوفة as const تُستعمل وقت التشغيل، ويُشتق منها النوع وقت التدقيق، فلا تكتب القائمة مرتين. وتحتها enum، لترى أنه كائن حقيقي يمكن طباعته.",
    runnerLang: "ts",
    runnerStarter: `const SIZES = ["S", "M", "L"] as const;
type Size = (typeof SIZES)[number]; // "S" | "M" | "L"

function price(size: Size): number {
  switch (size) {
    case "S":
      return 8;
    case "M":
      return 10;
    case "L":
      return 12;
  }
}
for (const s of SIZES) {
  console.log(s, price(s));
}

enum Direction {
  Up,
  Down,
}
enum Color {
  Red = "RED",
}
console.log(Direction.Down, Direction[0], Color.Red);
console.log(Object.keys(Direction), Object.keys(Color));
// try: add "XL" to SIZES. The checker would now flag price(): which case is missing?
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "سعر لكل حجم",
      prompt: "رتّب الأسطر: نوع الأحجام، ثم الدالة، ثم اطبع سعر M و L: 10 12",
      lines: ['type Size = "S" | "M" | "L";', "function price(size: Size): number {", '  if (size === "S") return 8;', '  if (size === "M") return 10;', "  return 12;", "}", 'console.log(price("M"), price("L"));'],
      expected: "10 12",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "قيمة enum",
      prompt: "أي تعبير يطبع PAID؟",
      template: `enum Status {
  Pending = "PENDING",
  Paid = "PAID",
}
const s: Status = Status.Paid;
console.log(___);`,
      options: ["s", "Status[1]", '"Paid"'],
      expected: "PAID",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "الحالة المكتوبة خطأً",
      prompt: "الطلب المدفوع لا ينتقل إلى shipped. tsc كان سيقول: This comparison appears to be unintentional because the types have no overlap. أصلح الخطأ ليُطبع: paid shipped shipped",
      code: `type Status = "pending" | "paid" | "shipped";
function next(s: Status): Status {
  if (s === "pending") return "paid";
  if (s === "piad") return "shipped";
  return s;
}
console.log(next("pending"), next("paid"), next("shipped"));`,
      expected: "paid shipped shipped",
      hint: "انظر إلى السطر 4: \"piad\" ليست من القائمة.",
      solution: `type Status = "pending" | "paid" | "shipped";
function next(s: Status): Status {
  if (s === "pending") return "paid";
  if (s === "paid") return "shipped";
  return s;
}
console.log(next("pending"), next("paid"), next("shipped"));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "إشارة المرور",
      prompt: "اكتب type Light = \"red\" | \"yellow\" | \"green\"، ودالة nextLight(l: Light): Light: الأحمر يصير أخضر، والأخضر أصفر، والأصفر أحمر. اطبع nextLight(\"red\") و nextLight(\"green\") و nextLight(\"yellow\") في سطر واحد: green yellow red",
      starter: "// write type Light and function nextLight here\n",
      expected: "green yellow red",
      hint: "switch (l) مع case لكل لون، و return للون التالي.",
      solution: `type Light = "red" | "yellow" | "green";
function nextLight(l: Light): Light {
  switch (l) {
    case "red":
      return "green";
    case "green":
      return "yellow";
    case "yellow":
      return "red";
  }
}
console.log(nextLight("red"), nextLight("green"), nextLight("yellow"));`,
    },
  ],
  quiz: [
    {
      question: "ماذا يقول tsc عن السطر 2؟",
      code: 'const SIZES = ["S", "M"] as const;\nSIZES.push("L");',
      options: ["Property 'push' does not exist on type 'readonly [\"S\", \"M\"]'", "لا خطأ: \"L\" نص", "لا خطأ، والمصفوفة تصير ثلاثة"],
      answer: 0,
      why: "as const يجمّد كل شيء في النوع: tuple للقراءة فقط، وكل خانة نوعها قيمتها الحرفية. لهذا نستطيع أن نشتق منها قائمة مغلقة.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: "enum Dir {\n  Up,\n  Down,\n  Left,\n}\nconsole.log(Dir.Left, Dir[0]);",
      options: ["2 Up", "Left Up", "2 0"],
      answer: 0,
      why: "enum بلا قيم يرقّم من 0: Up = 0 و Down = 1 و Left = 2. والـ enum الرقمي يبني كائناً في الاتجاهين، فـ Dir[0] يرجع الاسم \"Up\".",
    },
    {
      question: "أي هذه يبقى أثره في JavaScript بعد محو الأنواع؟",
      code: 'type A = "x" | "y";\ninterface B { v: number }\nenum C { X, Y }',
      options: ["enum C", "type A", "interface B"],
      answer: 0,
      why: "type و interface ملصقات للمدقّق فقط وتختفي كلها. enum يصنع كائناً حقيقياً يمكن قراءته وطباعته وقت التشغيل.",
    },
    {
      question: "أي سطر يرفضه tsc؟",
      code: 'let mode: "on" | "off" = "on";\nmode = "off";\nmode = "On";',
      options: ["السطر 3", "السطر 2", "لا شيء"],
      answer: 0,
      why: "الأنواع الحرفية تطابق القيمة حرفاً بحرف، والحروف الكبيرة تختلف عن الصغيرة. \"On\" ليست \"on\".",
    },
    {
      question: "ما نوع copy عند المدقّق؟",
      code: 'const status = "paid";\nlet copy = status;',
      options: ["string", "\"paid\"", "any"],
      answer: 0,
      why: "status نوعه \"paid\" لأنه const. لكن copy درج let قد يتغيّر، فيوسّعه المدقّق إلى string. إن أردت أن يبقى ضمن القائمة فاكتب له النوع: let copy: Status = status.",
    },
  ],
  next: "ts-config",
};
