import type { Cell, Lesson, Scene } from "@/lib/types";

/** A type the checker holds: its name and what it has built so far. */
const ty = (name: string, expr: string): Cell => ({ name, value: expr, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const USER = ty("User", "{ id: number; name: string; email?: string }");
const KEYS = ty("keyof User", '"id" | "name" | "email"');

export const tsMapped: Lesson = {
  slug: "ts-mapped",
  stage: 0,
  number: "3.2",
  title: "mapped types",
  subtitle: "حلقة for على المفاتيح، تبني نوع كائن جديداً حقلاً بعد حقل",
  minutes: 25,
  problem: {
    title: "عشرة أنواع تكرّر نوعاً واحداً",
    body: "عندك User. تحتاج نسخة كل حقولها اختيارية، ونسخة للقراءة فقط، ونسخة قيمها boolean. اضبط القاعدة بالأزرار وراقب النوع الجديد يُبنى مفتاحاً بعد مفتاح، دون أن تكتب حقلاً واحداً بيدك.",
    demo: "tsMapped",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `interface User { id: number; name: string; email?: string }
type Keys = keyof User;
type Flags<T> = { [K in keyof T]: boolean };
type F = Flags<User>;
type Frozen<T> = { readonly [K in keyof T]-?: T[K] };
type Z = Frozen<User>;
const flags: F = { id: true, name: false };
console.log(Object.keys(flags).length);`,
    },
    steps: [
      {
        line: null,
        say: "mapped type حلقة يشغّلها المدقّق: تمر على مفاتيح نوع، وتكتب لكل مفتاح حقلاً في نوع جديد. سنراها تدور.",
        memory: [],
      },
      {
        line: 1,
        say: "User فيه ثلاثة حقول. email اختياري: قد يغيب.",
        memory: [USER],
        changed: ["User"],
      },
      {
        line: 2,
        say: "keyof يأخذ أسماء المفاتيح ويجعلها اتحاداً من نصوص حرفية. هذا الاتحاد هو ما ستمر عليه الحلقة.",
        memory: [USER, KEYS],
        changed: ["keyof User"],
      },
      {
        line: 3,
        say: "[K in keyof T] تعني: لكل K في اتحاد المفاتيح. ما بعد النقطتين نوع قيمة الحقل. القاعدة هنا: كل حقل يصير boolean.",
        memory: [USER, KEYS, ty("Flags<T>", "{ [K in keyof T]: boolean }")],
        changed: ["Flags<T>"],
      },
      {
        line: 4,
        say: "الدورة الأولى: K = \"id\". يُكتب حقل id قيمته boolean.",
        memory: [USER, KEYS, ty("K", '"id"'), ty("F", "{ id: boolean }")],
        changed: ["K", "F"],
        read: ["keyof User"],
      },
      {
        line: 4,
        say: "الدورة الثانية: K = \"name\".",
        memory: [USER, KEYS, ty("K", '"name"'), ty("F", "{ id: boolean; name: boolean }")],
        changed: ["K", "F"],
      },
      {
        line: 4,
        say: "الدورة الثالثة: K = \"email\". الحلقة على keyof T تنسخ علامات الحقل الأصلي، فيبقى email اختيارياً.",
        memory: [USER, KEYS, ty("K", '"email"'), ty("F", "{ id: boolean; name: boolean; email?: boolean }")],
        changed: ["K", "F"],
      },
      {
        line: 5,
        say: "Frozen يغيّر العلامات: readonly يضيف \"للقراءة فقط\"، و -? يحذف علامة الاختياري. و T[K] يقرأ نوع الحقل الأصلي: User[\"id\"] هو number.",
        memory: [USER, ty("Frozen<T>", "{ readonly [K in keyof T]-?: T[K] }")],
        changed: ["Frozen<T>"],
      },
      {
        line: 6,
        say: "بعد ثلاث دورات: كل حقل readonly، و email صار مطلوباً ونوعه string. حذف ? حذف معه undefined.",
        memory: [USER, ty("Z", "{ readonly id: number; readonly name: string; readonly email: string }")],
        changed: ["Z"],
      },
      {
        line: 7,
        say: "الآن وقت التشغيل. flags كائن عادي بمفتاحين. حذف email مسموح لأن F يقول إنه اختياري.",
        memory: [{ name: "flags", value: "{ id: true, name: false }", type: "none" }],
        changed: ["flags"],
      },
      {
        line: 8,
        say: "يُطبع 2. لا F ولا Frozen في الذاكرة: الحلقة دارت في المدقّق فقط، ولم يبقَ منها إلا ما كتبته أنت من قيم.",
        memory: [{ name: "flags", value: "{ id: true, name: false }", type: "none" }],
        read: ["flags"],
        output: ["2"],
      },
    ],
    notes: {
      ts: "{ [K in keyof T]: ... } يبني نوعاً جديداً من مفاتيح T. أضف أو احذف readonly و ? بـ + و -، واقرأ نوع الحقل بـ T[K]. هكذا تُكتب Partial و Required و Readonly و Pick و Record في مكتبة TypeScript نفسها.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة للحلقة التي يشغّلها المدقّق: النوع هنا مصفوفة حقول (اسم ونوع)، والحلقة تبني منها نوعاً جديداً بأسماء جديدة. شغّل وراقب كل دورة.",
    starter: `const User = [
  { key: "id", type: "number" },
  { key: "name", type: "string" },
  { key: "email", type: "string" },
];
const Getters = [];
for (const field of User) {
  const newKey = "get" + field.key[0].toUpperCase() + field.key.slice(1);
  Getters.push(newKey + ": () => " + field.type);
  console.log("K = " + field.key + "  ->  " + newKey);
}
console.log("{ " + Getters.join("; ") + " }");`,
    challenges: [
      "اجعل كل قيمة \"boolean\" بدل \"() => ...\": هذا Flags. ماذا تغيّر في الأسماء؟",
      "تخطَّ المفاتيح التي نوعها ليس \"string\" (استعمل continue). في TypeScript يُكتب هذا as ... ? K : never، و never يحذف المفتاح.",
      "أضف حقلاً رابعاً إلى User. كم سطراً كتبت في النوع الجديد؟ لا شيء: الحلقة تتبع الأصل.",
    ],
  },
  predict: [
    {
      question: "هل يقبل tsc السطر 2؟",
      code: `type Opt<T> = { [K in keyof T]?: T[K] };
const x: Opt<{ a: number; b: string }> = {};`,
      options: ["نعم، لا خطأ", "لا: Property 'a' is missing", "لا: Property 'b' is missing"],
      answer: 0,
      why: "الحلقة تضع ? على كل حقل، فكل حقل اختياري والكائن الفارغ يكفي. هذه هي Partial<T> حرفياً.",
      scene: check(
        `type Opt<T> = { [K in keyof T]?: T[K] };
const x: Opt<{ a: number; b: string }> = {};`,
        [
          { line: 2, say: "الحلقة تمر على a ثم b، وتضع ? على كل منهما.", memory: [ty("Opt<...>", "{ a?: number; b?: string }")], changed: ["Opt<...>"] },
          { line: 2, say: "{} لا ينقصه حقل مطلوب. لا خطأ.", memory: [ty("Opt<...>", "{ a?: number; b?: string }"), { name: "x", value: "{}", type: "none" }], changed: ["x"] },
        ],
      ),
    },
    {
      question: "ما النوع R؟",
      code: `type OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };
type R = OnlyStrings<{ id: number; name: string; city: string }>;`,
      options: ["{ name: string; city: string }", "{ id: never; name: string; city: string }", "{ id: number; name: string; city: string }"],
      answer: 0,
      why: "as يعيد تسمية المفتاح في كل دورة. للمفتاح id الشرط يعطي never، والمفتاح الذي اسمه never لا يُكتب أصلاً. فيبقى name و city.",
      scene: check(
        `type OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };
type R = OnlyStrings<{ id: number; name: string; city: string }>;`,
        [
          { line: 2, say: "K = \"id\": نوعه number، ليس نصاً، فالاسم الجديد never. يُتخطّى.", memory: [ty("K", '"id" as never'), ty("R", "{ }")], changed: ["K"] },
          { line: 2, say: "K = \"name\": نص، فالاسم يبقى name.", memory: [ty("K", '"name"'), ty("R", "{ name: string }")], changed: ["K", "R"] },
          { line: 2, say: "K = \"city\": نص أيضاً.", memory: [ty("K", '"city"'), ty("R", "{ name: string; city: string }")], changed: ["K", "R"] },
        ],
      ),
    },
    {
      question: "يمر من tsc (as أسكته). ماذا يُطبع؟",
      code: `const cfg: Readonly<{ port: number }> = { port: 80 };
(cfg as { port: number }).port = 8080;
console.log(cfg.port);`,
      options: ["8080", "80", "TypeError"],
      answer: 0,
      why: "readonly علامة في المدقّق فقط. وقت التشغيل cfg كائن عادي يقبل التعديل. إن أردت منعاً حقيقياً فاستعمل Object.freeze، وأعطه النوع Readonly ليعرف المدقّق ذلك أيضاً.",
      scene: check(
        `const cfg: Readonly<{ port: number }> = { port: 80 };
(cfg as { port: number }).port = 8080;
console.log(cfg.port);`,
        [
          { line: 1, say: "المدقّق يرى port للقراءة فقط. في الذاكرة كائن عادي.", memory: [ty("tsc sees cfg as", "{ readonly port: number }"), { name: "cfg.port", value: "80", type: "number" }] },
          { line: 2, say: "as يخفي readonly عن المدقّق. والتعديل يحدث فعلاً، فلا شيء وقت التشغيل يمنعه.", memory: [{ name: "cfg.port", value: "8080", type: "number" }], changed: ["cfg.port"] },
          { line: 3, say: "يُطبع 8080.", memory: [{ name: "cfg.port", value: "8080", type: "number" }], read: ["cfg.port"], output: ["8080"] },
        ],
      ),
    },
  ],
  code: {
    intro: "دالة يكتبها المحترفون كثيراً: mapValues تحوّل كل قيمة في كائن، ونوع ما ترجعه mapped type يحفظ المفاتيح نفسها. ثم Pick التي تبنيها المكتبة بحلقة على مفاتيح تختارها أنت. لاحظ أن الحلقة وقت التشغيل يجب أن تمر على المفاتيح نفسها التي يمر عليها النوع.",
    runnerLang: "ts",
    runnerStarter: `function mapValues<T extends object, R>(obj: T, fn: (value: T[keyof T]) => R): { [K in keyof T]: R } {
  const out = {} as { [K in keyof T]: R };
  for (const key of Object.keys(obj) as (keyof T)[]) {
    out[key] = fn(obj[key]);
  }
  return out;
}
const prices = { tea: 800, cake: 1550 };
const labels = mapValues(prices, (p) => (p / 100).toFixed(2) + " SAR"); // tsc: { tea: string; cake: string }
console.log(labels.tea, "|", labels.cake);

function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const key of keys) {
    out[key] = obj[key];
  }
  return out;
}
const card = pick({ name: "Sara", age: 20, city: "Riyadh" }, ["name", "city"]); // tsc: { name: string; city: string }
console.log(JSON.stringify(card));

// Readonly is a promise to the checker; Object.freeze is the run-time lock.
const config: Readonly<{ port: number }> = Object.freeze({ port: 80 });
console.log(Object.isFrozen(config));
// try: add "coffee: 1200" to prices. labels gets the key, and its type does too.
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "حوّل كل القيم",
      prompt: "رتّب mapValues ثم استعملها. الناتج: 8.00 SAR 15.50 SAR",
      lines: [
        "function mapValues<T extends object, R>(obj: T, fn: (value: T[keyof T]) => R): { [K in keyof T]: R } {",
        "  const out = {} as { [K in keyof T]: R };",
        "  for (const key of Object.keys(obj) as (keyof T)[]) {",
        "    out[key] = fn(obj[key]);",
        "  }",
        "  return out;",
        "}",
        'const labels = mapValues({ tea: 800, cake: 1550 }, (p) => (p / 100).toFixed(2) + " SAR");',
        "console.log(labels.tea, labels.cake);",
      ],
      expected: "8.00 SAR 15.50 SAR",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "قفل حقيقي",
      prompt: "Readonly تمنع التعديل في المدقّق فقط. أي دالة تقفل الكائن وقت التشغيل أيضاً؟ الناتج: true",
      template: `const config: Readonly<{ port: number }> = ___({ port: 80 });
console.log(Object.isFrozen(config));`,
      options: ["Object.freeze", "Object.seal", "Object.preventExtensions"],
      expected: "true",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "النوع يقول شيئاً والكائن شيئاً آخر",
      prompt: "النوع Pick<T, K> يعد بمفتاحين فقط، لكن الحلقة تنسخ كل المفاتيح. tsc لا يرى المشكلة بسبب as. أصلح الحلقة ليُطبع: {\"name\":\"Sara\",\"city\":\"Riyadh\"}",
      code: `function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const key of Object.keys(obj) as K[]) {
    out[key] = obj[key];
  }
  return out;
}
console.log(JSON.stringify(pick({ name: "Sara", age: 20, city: "Riyadh" }, ["name", "city"])));`,
      expected: '{"name":"Sara","city":"Riyadh"}',
      hint: "الحلقة يجب أن تمر على المفاتيح التي يمر عليها النوع: keys، لا Object.keys(obj).",
      solution: `function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const key of keys) {
    out[key] = obj[key];
  }
  return out;
}
console.log(JSON.stringify(pick({ name: "Sara", age: 20, city: "Riyadh" }, ["name", "city"])));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "أعلام لكل حقل",
      prompt: "اكتب flagsOf<T extends object>(obj: T): { [K in keyof T]: boolean } ترجع كائناً بالمفاتيح نفسها، وقيمة كل مفتاح Boolean(القيمة الأصلية). ثم اطبع JSON.stringify(flagsOf({ name: \"Sara\", phone: \"\", age: 0 })): {\"name\":true,\"phone\":false,\"age\":false}",
      starter: "// write flagsOf here, then print JSON.stringify(flagsOf({ name: \"Sara\", phone: \"\", age: 0 }))\n",
      expected: '{"name":true,"phone":false,"age":false}',
      hint: "مثل mapValues: const out = {} as { [K in keyof T]: boolean }، ثم حلقة على Object.keys(obj) as (keyof T)[].",
      solution: `function flagsOf<T extends object>(obj: T): { [K in keyof T]: boolean } {
  const out = {} as { [K in keyof T]: boolean };
  for (const key of Object.keys(obj) as (keyof T)[]) {
    out[key] = Boolean(obj[key]);
  }
  return out;
}
console.log(JSON.stringify(flagsOf({ name: "Sara", phone: "", age: 0 })));`,
    },
  ],
  quiz: [
    {
      question: "ما النوع R؟",
      code: "type R = keyof { a: 1; b: 2 };",
      options: ['"a" | "b"', "1 | 2", '["a", "b"]'],
      answer: 0,
      why: "keyof يعطي أسماء المفاتيح، لا قيمها، في اتحاد من نصوص حرفية. هذا الاتحاد هو ما تمر عليه [K in keyof T].",
    },
    {
      question: "ما النوع R؟",
      code: "type M<T> = { -readonly [K in keyof T]: T[K] };\ntype R = M<{ readonly id: number }>;",
      options: ["{ id: number }", "{ readonly id: number }", "{ -readonly id: number }"],
      answer: 0,
      why: "علامة - تحذف المعدِّل في كل دورة. الحقل id يُنسخ بنوعه number، بلا readonly.",
    },
    {
      question: "Record<K, V> حلقة على K نفسه: { [P in K]: V }. ما النوع R؟",
      code: 'type R = Record<"x" | "y", number>;',
      options: ["{ x: number; y: number }", '{ "x" | "y": number }', "number[]"],
      answer: 0,
      why: "الحلقة تمر على \"x\" ثم \"y\"، وتكتب لكل منهما حقلاً نوعه number.",
    },
    {
      question: "أي رسالة يكتبها tsc عن السطر 2؟",
      code: "type Req = Required<{ a?: string }>;\nconst r: Req = {};",
      options: ["Property 'a' is missing in type '{}' but required in type ...", "لا خطأ: a كان اختيارياً", "Type 'string' is not assignable to type 'undefined'."],
      answer: 0,
      why: "Required حلقة بـ -?: تحذف علامة الاختياري من كل حقل. فصار a مطلوباً، و {} ينقصه.",
    },
    {
      question: "ما النوع R؟",
      code: 'type Safe<T> = { [K in keyof T as K extends "password" ? never : K]: T[K] };\ntype R = Safe<{ name: string; password: string }>;',
      options: ["{ name: string }", "{ name: string; password: never }", "{ name: string; password: string }"],
      answer: 0,
      why: "الدورة على password تعيد تسميته never، والمفتاح never لا يُكتب. هكذا تبني نوعاً لما يُرسل إلى المتصفح بلا الحقول السرية.",
    },
  ],
  next: "ts-template-literal",
};
