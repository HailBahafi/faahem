import type { Cell, Lesson, Scene } from "@/lib/types";

const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const data = { name: "data", value: '{ name: "tea", price: 8 }', type: "none" as const };

export const tsGuards: Lesson = {
  slug: "ts-guards",
  stage: 0,
  number: "2.4",
  title: "حراس الأنواع",
  subtitle: "فحص حقيقي وقت التشغيل، ووعد للمدقّق بما يعنيه نجاحه",
  minutes: 22,
  problem: {
    title: "بيانات من الخارج لا تحمل ملصقاً",
    body: "طرود تصل من API: بعضها سليم وبعضها لا. المدقّق لا يرى ما في الطرد، فاختر كيف تتعامل معه: أن تثق به بـ as، أو أن تفحصه بحارس. ثم عالج الطرود وراقب ما ينهار.",
    demo: "tsGuards",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `interface Product { name: string; price: number }
function isProduct(x: unknown): x is Product {
  if (typeof x !== "object" || x === null) return false;
  return "name" in x && typeof x.name === "string" && "price" in x && typeof x.price === "number";
}
const data: unknown = JSON.parse('{"name":"tea","price":8}');
if (isProduct(data)) {
  console.log(data.name.toUpperCase(), data.price * 2);
}`,
    },
    steps: [
      {
        line: null,
        say: "المدقّق يعرف ما كتبته أنت، لا ما يصل من الشبكة أو الملفات. عند الحدود نحتاج فحصاً يعمل وقت التشغيل، ويخبر المدقّق بالنتيجة.",
        memory: [],
      },
      {
        line: 6,
        say: "JSON.parse يرجع any، ونحن نكتب unknown عمداً: unknown تعني \"لا أعرف\"، فلا يُسمح بأي عملية عليها حتى نفحصها.",
        memory: [label("tsc sees data as", "unknown"), data],
        changed: ["data"],
      },
      {
        line: 7,
        say: "نستدعي الحارس isProduct. نوع إرجاعه ليس boolean فقط: x is Product، أي \"إن رجعتُ true فـ x منتج\".",
        memory: [label("tsc sees data as", "unknown"), data],
        read: ["data"],
      },
      {
        line: 3,
        say: "الفحص الأول: هل هو كائن وليس null؟ نعم. (typeof null يعطي \"object\" في JavaScript، لهذا نفحص null بأنفسنا.)",
        memory: [label("tsc sees x as", "object"), data],
        read: ["data"],
      },
      {
        line: 4,
        say: "ثم كل حقل: موجود؟ ونوعه صحيح؟ name نص، و price رقم. كلها صحيحة، فيرجع true.",
        memory: [label("tsc sees x as", "object"), data, { name: "result", value: "true", type: "boolean" }],
        read: ["data"],
        changed: ["result"],
      },
      {
        line: 7,
        say: "رجع true، فيقرأ المدقّق الوعد x is Product: داخل هذا الـ if صار data منتجاً.",
        memory: [label("tsc sees data as", "Product"), data],
        changed: ["tsc sees data as"],
      },
      {
        line: 8,
        say: "الآن toUpperCase و * 2 مسموحتان. يُطبع TEA 16.",
        memory: [label("tsc sees data as", "Product"), data],
        read: ["data"],
        output: ["TEA 16"],
      },
      {
        line: null,
        say: "انتبه: المدقّق يصدّق الوعد ولا يراجع جسم الدالة. لو فحص الحارس price وحده لصدّقه المدقّق أيضاً. الحارس صادق بقدر ما تكتبه صادقاً.",
        memory: [],
      },
    ],
    notes: {
      ts: "أدوات التضييق: typeof و instanceof و in و Array.isArray و ===، والحراس المخصّصة x is T، ودوال التأكيد asserts x is T التي ترمي خطأ بدل أن ترجع false.",
    },
  },
  playground: {
    kind: "trace",
    intro: "الحارس بعد حذف الأنواع دالة JavaScript عادية ترجع true أو false. شغّلها على طرود مختلفة، وراقب أي فحص يوقف كل طرد.",
    starter: `function isProduct(x) {
  if (typeof x !== "object" || x === null) {
    return false;
  }
  return typeof x.name === "string" && typeof x.price === "number";
}
const parcels = [{ name: "tea", price: 8 }, null, { name: "cake", price: "15" }, { title: "mug" }];
for (const p of parcels) {
  console.log(isProduct(p));
}`,
    challenges: [
      "أي طرد يتوقف عند السطر 2؟ وأيها يصل إلى السطر 5؟",
      "احذف x === null من السطر 2. ماذا يحدث للطرد null؟ ولماذا؟",
      "أضف طرداً [1, 2] (مصفوفة). ماذا يعطي typeof لها؟ هل يمر من الحارس؟",
      "أضف شرطاً: price يجب أن يكون أكبر من 0. أي طرد إضافي ستجربه؟",
    ],
  },
  predict: [
    {
      question: "يمر من tsc بلا خطأ. ماذا يحدث عند التشغيل؟",
      code: `function isString(x: unknown): x is string {
  return true;
}
const v: unknown = 5;
if (isString(v)) {
  console.log(v.toUpperCase());
}`,
      options: ["ينهار: v.toUpperCase is not a function", "لا يدخل الـ if", "يطبع 5"],
      answer: 0,
      why: "المدقّق يثق بالوعد x is string ولا يقرأ return true. الحارس الكاذب أخطر من غياب الحارس: يُسكت المدقّق ويترك الخطأ للتشغيل.",
      scene: check(
        `function isString(x: unknown): x is string {
  return true;
}
const v: unknown = 5;
if (isString(v)) {
  console.log(v.toUpperCase());
}`,
        [
          { line: 4, say: "v يحمل 5، والمدقّق يراه unknown.", memory: [label("tsc sees v as", "unknown"), { name: "v", value: "5", type: "number" }] },
          { line: 5, say: "الحارس يرجع true دائماً. ندخل، والمدقّق يصدّق: v نص.", memory: [label("tsc sees v as", "string"), { name: "v", value: "5", type: "number" }] },
          { line: 6, say: "الدرج يحمل رقماً، ولا toUpperCase للأرقام.", memory: [{ name: "v", value: "5", type: "number" }], error: "TypeError: v.toUpperCase is not a function" },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc عن السطر 2؟",
      code: `const v: unknown = JSON.parse("5");
console.log(v.toFixed(1));`,
      options: ["'v' is of type 'unknown'", "لا خطأ: القيمة رقم", "لا خطأ: unknown مثل any"],
      answer: 0,
      why: "unknown عكس any: كل قيمة تدخلها، ولا عملية تخرج منها قبل الفحص. لو أضفت if (typeof v === \"number\") لصار السطر مقبولاً. لهذا unknown هي الملصق الصحيح لما يأتي من الخارج.",
      scene: check(
        `const v: unknown = JSON.parse("5");
console.log(v.toFixed(1));`,
        [
          { line: 1, say: "الدرج يحمل 5، والملصق unknown.", memory: [label("tsc sees v as", "unknown"), { name: "v", value: "5", type: "number" }] },
          { line: 2, say: "لا فحص قبل الاستعمال: خط أحمر.", memory: [label("tsc sees v as", "unknown")], error: "'v' is of type 'unknown'." },
        ],
      ),
    },
    {
      question: "ماذا يحدث عند التشغيل؟",
      code: `function assertNumber(x: unknown): asserts x is number {
  if (typeof x !== "number") {
    throw new Error("not a number: " + x);
  }
}
const input: unknown = "7";
assertNumber(input);
console.log(input + 1);`,
      options: ["Error: not a number: 7", "يطبع 71", "يطبع 8"],
      answer: 0,
      why: "دالة التأكيد لا ترجع true أو false: إما أن تمر بصمت فيعرف المدقّق أن input رقم في كل ما بعدها، وإما أن ترمي. \"7\" نص، فترمي قبل السطر 8.",
      scene: check(
        `function assertNumber(x: unknown): asserts x is number {
  if (typeof x !== "number") {
    throw new Error("not a number: " + x);
  }
}
const input: unknown = "7";
assertNumber(input);
console.log(input + 1);`,
        [
          { line: 6, say: "input يحمل النص \"7\".", memory: [label("tsc sees input as", "unknown"), { name: "input", value: '"7"', type: "string" }] },
          { line: 2, say: "typeof \"7\" هو \"string\"، لا \"number\". الشرط صحيح.", memory: [{ name: "input", value: '"7"', type: "string" }], read: ["input"] },
          { line: 3, say: "يُرمى الخطأ، ولا يصل التنفيذ إلى السطر 8 أبداً.", memory: [{ name: "input", value: '"7"', type: "string" }], error: "Error: not a number: 7" },
        ],
      ),
    },
  ],
  code: {
    intro: "الحراس عند حدود البرنامج: تصفية مصفوفة مختلطة بحارس يجعل الناتج number[]، و instanceof للأصناف، و in لاتحاد كائنات، ودالة تأكيد للإعدادات التي يجب أن توجد.",
    runnerLang: "ts",
    runnerStarter: `function isNumber(x: unknown): x is number {
  return typeof x === "number" && !Number.isNaN(x);
}
const raw: unknown[] = [3, "4", null, 5, NaN];
const nums: number[] = raw.filter(isNumber);
console.log(nums, nums.reduce((a, b) => a + b, 0));

function describe(d: Date | string): string {
  if (d instanceof Date) {
    return "date " + d.toISOString().slice(0, 10);
  }
  return "text " + d.length;
}
console.log(describe(new Date(Date.UTC(2026, 0, 15))), describe("hello"));

type Card = { number: string };
type Cash = { amount: number };
function pay(p: Card | Cash): string {
  return "number" in p ? "card ending " + p.number.slice(-4) : "cash " + p.amount;
}
console.log(pay({ number: "4111222233334444" }), pay({ amount: 50 }));

function assertDefined<T>(value: T | undefined, name: string): asserts value is T {
  if (value === undefined) throw new Error(name + " is missing");
}
const env: Record<string, string | undefined> = { PORT: "8080" };
const port = env.PORT;
assertDefined(port, "PORT");
console.log(Number(port) + 1);
// try: change env to {} and run again.
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "حارس للنص غير الفارغ",
      prompt: "رتّب الحارس ثم استعمله. الناتج: true false false",
      lines: [
        "function isFilled(x: unknown): x is string {",
        '  return typeof x === "string" && x.trim().length > 0;',
        "}",
        'console.log(isFilled("Sara"), isFilled("  "), isFilled(42));',
      ],
      expected: "true false false",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "صفِّ الأرقام فقط",
      prompt: "المصفوفة خليط. أي فحص في الحارس يجعل المجموع 4؟",
      template: `const values: unknown[] = [1, "2", null, 0, 3];
const nums = values.filter((v): v is number => ___);
console.log(nums.reduce((a, b) => a + b, 0));`,
      options: ['typeof v === "number"', "v !== null", "!!v"],
      expected: "4",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "null يكسر الحارس",
      prompt: "الحارس ينهار حين يصل null: \"name\" in null خطأ عند التشغيل. وكان tsc سيقول: 'x' is possibly 'null'. أصلحه ليُطبع true false false",
      code: `function hasName(x: unknown): x is { name: string } {
  return typeof x === "object" && "name" in x && typeof x.name === "string";
}
console.log(hasName({ name: "Sara" }));
console.log(hasName({ title: "mug" }));
console.log(hasName(null));`,
      expected: "true\nfalse\nfalse",
      hint: "typeof null يساوي \"object\". أضف x !== null بعد الفحص الأول.",
      solution: `function hasName(x: unknown): x is { name: string } {
  return typeof x === "object" && x !== null && "name" in x && typeof x.name === "string";
}
console.log(hasName({ name: "Sara" }));
console.log(hasName({ title: "mug" }));
console.log(hasName(null));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "مصفوفة نصوص؟",
      prompt: "اكتب isStringArray(x: unknown): x is string[] التي ترجع true فقط لمصفوفة كل عناصرها نصوص. ثم اطبع isStringArray([\"a\", \"b\"]) و isStringArray([\"a\", 1]) و isStringArray(\"ab\"): true false false",
      starter: "// write isStringArray here\n",
      expected: "true false false",
      hint: "Array.isArray(x) && x.every((item) => typeof item === \"string\")",
      solution: `function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((item) => typeof item === "string");
}
console.log(isStringArray(["a", "b"]), isStringArray(["a", 1]), isStringArray("ab"));`,
    },
  ],
  quiz: [
    {
      question: "ما نوع a عند المدقّق في السطر 7؟",
      code: 'type Cat = { meow(): string };\ntype Dog = { bark(): string };\nfunction speak(a: Cat | Dog): string {\n  if ("meow" in a) {\n    return a.meow();\n  }\n  return a.bark();\n}',
      options: ["Dog", "Cat | Dog", "Cat"],
      answer: 0,
      why: "\"meow\" in a فحص وقت تشغيل: هل في الكائن حقل اسمه meow؟ من دخل الـ if رجع. فمن وصل إلى السطر 7 لا meow فيه، فبقي Dog، و bark مسموحة.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: 'function isObject(x: unknown): x is object {\n  return typeof x === "object";\n}\nconsole.log(isObject(null), isObject([1]));',
      options: ["true true", "false true", "false false"],
      answer: 0,
      why: "خطأ قديم في JavaScript: typeof null يعطي \"object\"، وكذلك المصفوفة. فالحارس يكذب على null، والمدقّق يصدّقه. لهذا يكتب المحترفون x !== null دائماً بجانبه.",
    },
    {
      question: "tsc لا يعترض على هذا الكود. ماذا يحدث عند تشغيله؟",
      code: 'interface Product { name: string; price: number }\nconst p = JSON.parse(\'{"name":"tea"}\') as Product;\nconsole.log(p.price.toFixed(2));',
      options: ["ينهار: Cannot read properties of undefined", "يطبع 0.00", "يطبع undefined"],
      answer: 0,
      why: "as ليست فحصاً: هي أمر للمدقّق \"صدّقني\". لا كود يعمل عند التشغيل، و price غائب، فـ p.price هو undefined. الحارس يفحص فعلاً؛ as يكتب ملصقاً فقط.",
    },
    {
      question: "ماذا يقول tsc عن السطر 4؟",
      code: 'try {\n  JSON.parse("oops");\n} catch (e) {\n  console.log(e.message);\n}',
      options: ["'e' is of type 'unknown'", "لا خطأ: e من نوع Error", "لا خطأ: e من نوع any"],
      answer: 0,
      why: "في وضع strict يكون متغير catch من نوع unknown، لأن JavaScript تسمح برمي أي شيء: throw 5 أو throw \"x\". ضيّقه أولاً: if (e instanceof Error) console.log(e.message).",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: 'function size(x: string | string[]): number {\n  if (Array.isArray(x)) {\n    return x.length;\n  }\n  return x.trim().length;\n}\nconsole.log(size(["a", "b"]), size("  hi  "));',
      options: ["2 2", "2 6", "1 2"],
      answer: 0,
      why: "Array.isArray حارس مبني في اللغة: داخل الـ if صار x مصفوفة، فطولها 2. ما بعده نص، و trim يحذف المسافات من الطرفين فيبقى \"hi\": طوله 2.",
    },
  ],
  next: "ts-discriminated",
};
