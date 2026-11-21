import type { Cell, Lesson, Scene } from "@/lib/types";

/** A type the checker holds for a name. */
const ty = (name: string, expr: string): Cell => ({ name, value: expr, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const DTS = ty("dist/index.d.ts", "pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>");

export const tsLibraryTypes: Lesson = {
  slug: "ts-library-types",
  stage: 0,
  number: "4.2",
  title: "أنواع لمكتبة",
  subtitle: "مستخدم مكتبتك لا يرى كودها: يرى توقيعاتها في ملف d.ts، والمدقّق عنده يعمل بها وحدها",
  minutes: 30,
  problem: {
    title: "التوقيع هو المنتج",
    body: "ثلاث مكتبات تقدّم الدالة نفسها get(obj, key)، بثلاثة توقيعات مختلفة. اختر توقيعاً، ثم جرّب ثلاثة استدعاءات من كود المستخدم: ماذا يرى في محرره؟ ومن يكتشف الخطأ المطبعي؟",
    demo: "tsLibraryTypes",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = obj[k];
  return out;
}
const user = { id: 7, name: "Sara", email: "s@x.co" };
const card = pick(user, ["id", "name"]);
console.log(card.id, card.name);
// dist/index.d.ts: export declare function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;`,
    },
    steps: [
      {
        line: null,
        say: "الأسطر 1 إلى 5 كود مكتبة، والأسطر 6 إلى 8 كود مستخدمها في مشروع آخر. بينهما جدار: المستخدم يحمّل JavaScript وملف d.ts، ولا يرى سطراً من النوع الداخلي.",
        memory: [],
      },
      {
        line: 1,
        say: "التوقيع فيه فراغان. K مربوط بـ T: لا يقبل إلا مفاتيح T. والناتج Pick<T, K> يقول بدقة ما سيخرج. التوقيع يصف علاقة بين المدخل والمخرج، لا أنواعاً ثابتة.",
        memory: [ty("T", "?"), ty("K", "? (must be keyof T)")],
      },
      {
        line: 9,
        say: "عند البناء، tsc --declaration يكتب هذا السطر وحده في dist/index.d.ts. الجسم يذهب إلى ملف js بلا أنواع. هذا السطر هو كل ما يعرفه مدقّق المستخدم.",
        memory: [DTS],
        changed: ["dist/index.d.ts"],
      },
      {
        line: 7,
        say: "عند المستخدم: المدقّق يملأ T من الوسيط الأول، ويملأ K من المصفوفة: \"id\" | \"name\". لم يكتب المستخدم أي نوع، والاستنتاج فعل كل شيء.",
        memory: [DTS, ty("T", "{ id: number; name: string; email: string }"), ty("K", '"id" | "name"')],
        changed: ["T", "K"],
      },
      {
        line: 7,
        say: "لو كتب المستخدم \"nmae\"، لرفضه tsc عنده فوراً: ليس من مفاتيح T. خطأه المطبعي اكتُشف بتوقيع مكتبتك.",
        memory: [DTS, ty("K", '"id" | "name"')],
        error: "Type '\"nmae\"' is not assignable to type '\"id\" | \"name\" | \"email\"'.",
      },
      {
        line: 7,
        say: "نوع card: Pick<T, K>، أي { id: number; name: string }. لو قرأ card.email لقال tsc: Property 'email' does not exist.",
        memory: [DTS, ty("tsc sees card as", "{ id: number; name: string }")],
        changed: ["tsc sees card as"],
      },
      {
        line: 3,
        say: "وقت التشغيل لا T ولا K: حلقة عادية تنسخ مفتاحين إلى كائن جديد. السطر 2 فيه as واحدة، داخل المكتبة، خلف توقيع محكم. هذا ثمن مقبول.",
        memory: [{ name: "card (heap)", value: '{ id: 7, name: "Sara" }', type: "none" }],
        changed: ["card (heap)"],
      },
      {
        line: 8,
        say: "يُطبع 7 Sara.",
        memory: [{ name: "card (heap)", value: '{ id: 7, name: "Sara" }', type: "none" }],
        read: ["card (heap)"],
        output: ["7 Sara"],
      },
    ],
    notes: {
      ts: "التوقيع الجيد لمكتبة: معاملات نوع تظهر في المعاملات ليستنتجها المدقّق، وعلاقة بينها وبين نوع الرجوع، وأنواع رجوع مكتوبة صراحة على كل ما يُصدَّر حتى لا يتغير d.ts بتغير الجسم.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة لما يفعله tsc عند المستخدم: ملف d.ts هنا كائن يصف الدوال، والمدقّق يقرأه وحده ليحكم على كل استدعاء. لاحظ أنه لا ينظر أبداً إلى الجسم.",
    starter: `const dts = {
  pick: { keysOf: ["id", "name", "email"] },
};
function checkCall(fn, keys) {
  const allowed = dts[fn].keysOf;
  for (const k of keys) {
    if (allowed.indexOf(k) === -1) {
      return "error: '" + k + "' is not one of " + allowed.join(" | ");
    }
  }
  return "ok: Pick<User, " + keys.join(" | ") + ">";
}
console.log(checkCall("pick", ["id", "name"]));
console.log(checkCall("pick", ["id", "nmae"]));`,
    challenges: [
      "أضف \"phone\" إلى keysOf، كأن المكتبة أضافت حقلاً في إصدار جديد. هل انكسر أي استدعاء قديم؟",
      "احذف \"email\" من keysOf، كأن المكتبة حذفت حقلاً. جرّب checkCall(\"pick\", [\"email\"]). هذا تغيير يكسر كود المستخدمين: أي رقم إصدار يستحق؟",
      "جرّب checkCall(\"pick\", []). ماذا يرجع؟ هل Pick<User, never> نوع مفيد؟",
    ],
  },
  predict: [
    {
      question: "ماذا يقول tsc عن السطر 5؟",
      code: `function len(x: string): number;
function len(x: unknown[]): number;
function len(x: string | unknown[]) { return x.length; }
declare const v: string | number[];
len(v);`,
      options: ["No overload matches this call.", "لا خطأ: التنفيذ يقبل string | unknown[]", "لا خطأ: يُختار التوقيع الأول"],
      answer: 0,
      why: "التوقيعات الزائدة (overloads) يجرّبها المدقّق واحداً واحداً، من الأعلى. v ليس string وحده ولا مصفوفة وحدها، فلا يطابق أياً منهما. توقيع التنفيذ في السطر 3 مخفي عن المستخدم تماماً. الحل: توقيع واحد يقبل الاتحاد، أو generic.",
      scene: check(
        `function len(x: string): number;
function len(x: unknown[]): number;
function len(x: string | unknown[]) { return x.length; }
declare const v: string | number[];
len(v);`,
        [
          { line: 1, say: "هذان التوقيعان هما ما يراه المستخدم. السطر 3 لا يظهر في d.ts.", memory: [ty("visible", "len(x: string) | len(x: unknown[])")], changed: ["visible"] },
          { line: 5, say: "التوقيع الأول: هل string | number[] يصلح string؟ لا. الثاني: هل يصلح unknown[]؟ لا.", memory: [ty("v", "string | number[]")], read: ["v"] },
          { line: 5, say: "لم يطابق أي توقيع وحده.", memory: [ty("v", "string | number[]")], error: "TS2769: No overload matches this call." },
        ],
      ),
    },
    {
      question: "ما النوع r؟",
      code: `function routes<T extends readonly string[]>(list: T): T {
  return list;
}
const r = routes(["home", "cart"]);`,
      options: ["string[]", 'readonly ["home", "cart"]', '("home" | "cart")[]'],
      answer: 0,
      why: "المصفوفة الحرفية تتسع إلى string[] عند الاستنتاج. ليحفظ المستخدم الحروف كان عليه أن يكتب as const. مصمم المكتبة يستطيع أن يعفيه: <const T extends readonly string[]> فيصبح r من نوع readonly [\"home\", \"cart\"] بلا أي جهد منه.",
      scene: check(
        `function routes<T extends readonly string[]>(list: T): T {
  return list;
}
const r = routes(["home", "cart"]);`,
        [
          { line: 4, say: "المدقّق يملأ T من المصفوفة. الحروف تتسع إلى string كالعادة.", memory: [ty("T", "string[]")], changed: ["T"] },
          { line: 4, say: "مع <const T ...> في التوقيع، كانت T ستكون readonly [\"home\", \"cart\"].", memory: [ty("r", "string[]")], changed: ["r"] },
        ],
      ),
    },
    {
      question: "ماذا يكتب tsc --declaration في lib.d.ts؟",
      code: `export function connect(url: string) {
  return { url, ok: true };
}`,
      options: [
        "export declare function connect(url: string): { url: string; ok: boolean };",
        "export declare function connect(url: string): any;",
        "الدالة كاملة مع جسمها",
      ],
      answer: 0,
      why: "d.ts يحمل الأنواع وحدها، فيكتب نوع الرجوع الذي استنتجه. معناها أن تعديل الجسم قد يغيّر النوع المنشور دون أن تلاحظ، فيكسر كود المستخدمين. لذلك يكتب المحترفون نوع الرجوع صراحة على كل ما يُصدَّر.",
      scene: check(
        `export function connect(url: string) {
  return { url, ok: true };
}`,
        [
          { line: 2, say: "المدقّق يستنتج نوع الكائن: ok قابل للتعديل فيتسع true إلى boolean.", memory: [ty("return", "{ url: string; ok: boolean }")], changed: ["return"] },
          { line: 1, say: "الجسم لا يدخل d.ts. يُكتب التوقيع مع النوع المستنتج.", memory: [ty("lib.d.ts", "connect(url: string): { url: string; ok: boolean }")], changed: ["lib.d.ts"] },
        ],
      ),
    },
  ],
  code: {
    intro: "نمط تراه في مكتبات حقيقية كثيرة: معامل نوع واحد (خريطة الأحداث) يقود كل التوقيعات. المستخدم يكتب نوعاً واحداً، والاستنتاج يعطيه نوع payload في كل معالج، ويرفض اسم حدث خاطئ. وفي الأسفل: كيف تُعلن المكتبة ملفات أنواعها في package.json.",
    runnerLang: "ts",
    runnerStarter: `// The library: one type parameter drives on() and emit().
function createEmitter<Events extends Record<string, unknown>>() {
  const handlers: { [K in keyof Events]?: Array<(payload: Events[K]) => void> } = {};
  return {
    on<K extends keyof Events>(name: K, fn: (payload: Events[K]) => void): () => void {
      (handlers[name] ??= []).push(fn);
      return () => {
        handlers[name] = handlers[name]?.filter((h) => h !== fn);
      };
    },
    emit<K extends keyof Events>(name: K, payload: Events[K]): void {
      for (const fn of handlers[name] ?? []) fn(payload);
    },
  };
}

// The user's code: one type, and inference does the rest.
type AppEvents = { login: { user: string }; cart: { items: number } };
const bus = createEmitter<AppEvents>();
const off = bus.on("login", (p) => console.log("hello " + p.user)); // p: { user: string }
bus.on("cart", (p) => console.log(p.items + " items")); // p: { items: number }
bus.emit("login", { user: "Sara" });
bus.emit("cart", { items: 3 });
off();
bus.emit("login", { user: "Omar" }); // nobody listens now
// In your editor, both are tsc errors: bus.emit("login", { usr: "x" }) and bus.on("logn", ...).

// package.json of the published library:
// "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } }
// Only "." is public: an import of "my-lib/dist/internal" fails to resolve.
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "groupBy عامة",
      prompt: "رتّب groupBy: تقبل أي عناصر ودالة تستخرج المفتاح، وترجع خريطة من المفتاح إلى عناصره. الناتج: 2 1",
      lines: [
        "function groupBy<T, K extends string>(items: T[], keyOf: (item: T) => K): Partial<Record<K, T[]>> {",
        "  const out: Partial<Record<K, T[]>> = {};",
        "  for (const item of items) {",
        "    (out[keyOf(item)] ??= []).push(item);",
        "  }",
        "  return out;",
        "}",
        'const menu = [{ name: "tea", kind: "drink" }, { name: "cake", kind: "food" }, { name: "coffee", kind: "drink" }];',
        "const groups = groupBy(menu, (x) => x.kind);",
        "console.log(groups.drink?.length, groups.food?.length);",
      ],
      expected: "2 1",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "تنفيذ يخدم توقيعين",
      prompt: "للدالة توقيعان يراهما المستخدم: نص أو مصفوفة. التنفيذ الواحد يجب أن يخدم الاثنين. أي تعبير؟ الناتج: 1 3",
      template: `function toArray(x: string): string[];
function toArray<T>(x: T[]): T[];
function toArray(x: string | unknown[]): unknown[] {
  return ___;
}
console.log(toArray("ab").length, toArray([1, 2, 3]).length);`,
      options: ["Array.isArray(x) ? x : [x]", "[x]", "Array.from(x)"],
      expected: "1 3",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "توقيع وعد بما لم ينفّذ",
      prompt: "التوقيعان يعدان المستخدم بقبول رقم. التنفيذ يعامل كل شيء كنص بـ as، فينهار pad(7, 3). أصلح التنفيذ ليُطبع: 007 ثم 0ab",
      code: `function pad(value: string, width: number): string;
function pad(value: number, width: number): string;
function pad(value: string | number, width: number): string {
  return (value as string).padStart(width, "0");
}
console.log(pad(7, 3));
console.log(pad("ab", 3));`,
      expected: "007\n0ab",
      hint: "حوّل القيمة إلى نص فعلاً بدل أن تكذب على المدقّق: String(value).padStart(width, \"0\").",
      solution: `function pad(value: string, width: number): string;
function pad(value: number, width: number): string;
function pad(value: string | number, width: number): string {
  return String(value).padStart(width, "0");
}
console.log(pad(7, 3));
console.log(pad("ab", 3));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "mapValues تحفظ المفاتيح",
      prompt: "اكتب mapValues<K extends string, V, U>(obj: Record<K, V>, fn: (value: V, key: K) => U): Record<K, U>: ترجع كائناً بالمفاتيح نفسها وقيم fn. ثم حوّل prices إلى نصوص \"tea: 5.00\" واطبع labels.tea ثم labels.coffee. الناتج: tea: 5.00 ثم coffee: 8.00",
      starter: `const prices = { tea: 5, coffee: 8 };
// write mapValues here, then: const labels = mapValues(prices, (p, name) => ...)
`,
      expected: "tea: 5.00\ncoffee: 8.00",
      hint: "const out = {} as Record<K, U>; for (const key of Object.keys(obj) as K[]) out[key] = fn(obj[key], key); return out;",
      solution: `const prices = { tea: 5, coffee: 8 };
function mapValues<K extends string, V, U>(obj: Record<K, V>, fn: (value: V, key: K) => U): Record<K, U> {
  const out = {} as Record<K, U>;
  for (const key of Object.keys(obj) as K[]) out[key] = fn(obj[key], key);
  return out;
}
const labels = mapValues(prices, (p, name) => name + ": " + p.toFixed(2));
console.log(labels.tea);
console.log(labels.coffee);`,
    },
  ],
  quiz: [
    {
      question: "مكتبتك في الإصدار 2.3.0. أي تغيير في d.ts يكسر بناء مستخدمين يعملون بـ strict، فيستحق 3.0.0؟",
      code: `// 2.3.0
export declare function getUser(id: string): User;`,
      options: [
        "getUser(id: string): User | undefined",
        "getUser(id: string | number): User",
        "إضافة دالة جديدة getUsers(): User[]",
      ],
      answer: 0,
      why: "كود المستخدم يكتب getUser(id).name. بعد توسيع نوع الرجوع يقول tsc عنده: Object is possibly 'undefined'. توسيع المعامل يقبل كل ما كان مقبولاً، وإضافة دالة لا تمس القديم. القاعدة: ضيّق ما تقبله أو وسّع ما ترجعه، فهذا تغيير كاسر.",
    },
    {
      question: "package.json للمكتبة tiny-lib فيه exports بمدخل واحد \".\". ماذا يقول tsc (moduleResolution: bundler) عند المستخدم؟",
      code: `// tiny-lib/package.json
// "exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } }
import { secret } from "tiny-lib/dist/internal/x";`,
      options: [
        "Cannot find module 'tiny-lib/dist/internal/x' or its corresponding type declarations.",
        "لا خطأ: الملف موجود في node_modules",
        "تحذير فقط، ويعمل الاستيراد",
      ],
      answer: 0,
      why: "exports هو باب المكتبة الرسمي: ما لم يُذكر فيه لا وجود له عند المستخدم، حتى لو كان الملف على القرص. هكذا تبقى الملفات الداخلية حرة التغيير بلا إصدار كاسر.",
    },
    {
      question: "مكتبة تكتب first(arr: any[]): any. ماذا يحدث في كود المستخدم؟",
      code: `const top = first([10, 20]);
top.toUpperCase();`,
      options: ["tsc صامت، والسطر 2 ينهار: toUpperCase is not a function", "tsc: Property 'toUpperCase' does not exist on type 'number'.", "tsc: top is possibly undefined"],
      answer: 0,
      why: "any في توقيع مكتبة يُطفئ الفحص عند كل مستخدميها. مع first<T>(arr: T[]): T | undefined يعرف المدقّق أن top رقم أو undefined، فيرفض السطر 2 قبل التشغيل.",
    },
    {
      question: "ما النوع a؟",
      code: `function make<T>(): T[] {
  return [];
}
const a = make();`,
      options: ["unknown[]", "any[]", "never[]"],
      answer: 0,
      why: "T لا يظهر في أي معامل، فلا شيء يستنتجه منه المدقّق، فيأخذ أوسع ما يسمح به القيد: unknown. معامل النوع المفيد يظهر في المعاملات ليُستنتج، ويربط بين المدخل والمخرج.",
    },
    {
      question: "مكتبة تستعمل interface Options في دالة مُصدَّرة، دون أن تصدّر Options. ماذا يقول tsc عند المستخدم؟",
      code: `// lib.d.ts (emitted)
interface Options { retries: number }
export declare function connect(url: string, opts: Options): void;
// user's code
import type { Options } from "lib";`,
      options: [
        "Module declares 'Options' locally, but it is not exported.",
        "لا خطأ: الأنواع تُصدَّر تلقائياً",
        "خطأ عند بناء المكتبة نفسها",
      ],
      answer: 0,
      why: "المكتبة تُبنى بلا خطأ، والمستخدم يستطيع استدعاء connect بكائن حرفي. لكنه لا يستطيع تسمية النوع ليكتب دالة تبني الإعدادات. كل نوع يظهر في توقيع عام يجب أن يُصدَّر.",
    },
  ],
  next: "ts-runtime-validation",
};
