import type { Cell, Lesson, Scene } from "@/lib/types";

/** What the checker believes about a name. */
const ty = (name: string, expr: string): Cell => ({ name, value: expr, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

export const tsMigration: Lesson = {
  slug: "ts-migration",
  stage: 0,
  number: "4.4",
  title: "ترحيل مشروع JS",
  subtitle: "الترحيل قرص يُدار درجة درجة، لا مفتاح يُقلب: والبناء أخضر بعد كل خطوة",
  minutes: 30,
  problem: {
    title: "من أين تبدأ؟",
    body: "مشروع من أربعة ملفات JavaScript، كل ملف يستورد من غيره. حوّلها إلى TypeScript واحداً واحداً بالترتيب الذي تختاره. راقب الاستيرادات: متى يصل النوع، ومتى يتسرّب any؟",
    demo: "tsMigration",
  },
  singleLanguage: true,
  scene: {
    code: {
      js: `// @ts-check
/** @typedef {{ price: number, qty: number }} Item */
/** @param {Item[]} items @param {number} shipping */
function total(items, shipping) {
  return items.reduce((sum, it) => sum + it.price * it.qty, 0) + shipping;
}
const shippingInput = "15"; // from an <input>, always a string
console.log(total([{ price: 5, qty: 2 }], shippingInput));
console.log(total([{ price: 5, qty: 2 }], Number(shippingInput)));`,
    },
    steps: [
      {
        line: null,
        say: "مشروع حقيقي فيه مئات الملفات، ولا يتوقف العمل شهراً لإعادة كتابته. الخبر الجيد: tsc يقرأ JavaScript نفسها. الخطوة الأولى لا تغيّر سطراً واحداً يعمل.",
        memory: [ty("tsconfig", '"allowJs": true')],
      },
      {
        line: 1,
        say: "// @ts-check يطلب من tsc فحص هذا الملف وحده. (checkJs: true في tsconfig تفعلها لكل الملفات.) الملف ما زال .js، ويعمل كما كان تماماً.",
        memory: [ty("tsconfig", '"allowJs": true'), ty("cart.js", "checked")],
        changed: ["cart.js"],
      },
      {
        line: 2,
        say: "الأنواع تُكتب في تعليقات JSDoc. @typedef تعليق يقرؤه tsc كأنه type Item. المتصفح يتجاهله: هو مجرد تعليق.",
        memory: [ty("Item", "{ price: number; qty: number }")],
        changed: ["Item"],
      },
      {
        line: 4,
        say: "@param يعطي المعاملين ملصقين: items مصفوفة Item، و shipping رقم. هذا عقد الدالة، مكتوب بلا تغيير في الكود.",
        memory: [ty("Item", "{ price: number; qty: number }"), ty("total", "(items: Item[], shipping: number) => number")],
        changed: ["total"],
      },
      {
        line: 7,
        say: "قيمة من حقل إدخال في الصفحة. value في عنصر input نص دائماً، حتى لو كتب المستخدم أرقاماً.",
        memory: [{ name: "shippingInput", value: '"15"', type: "string" }],
        changed: ["shippingInput"],
      },
      {
        line: 8,
        say: "tsc يرى نصاً يدخل مكان رقم، فيضع خطاً أحمر في ملف JavaScript نفسه. هذا الخطأ كان يعيش في الإنتاج منذ زمن.",
        memory: [{ name: "shippingInput", value: '"15"', type: "string" }],
        error: "TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.",
      },
      {
        line: 8,
        say: "وقت التشغيل: المجموع 10، ثم 10 + \"15\" دمج نصوص. يُطبع 1015 بدل 25. لا انهيار ولا رسالة: فاتورة خاطئة بصمت.",
        memory: [{ name: "sum", value: "10", type: "number" }, { name: "shipping", value: '"15"', type: "string" }],
        read: ["shipping"],
        output: ["1015"],
      },
      {
        line: 9,
        say: "الإصلاح عند الحد: Number(shippingInput). الآن shipping رقم فعلاً، و tsc راضٍ، ويُطبع 25.",
        memory: [{ name: "shipping", value: "15", type: "number" }],
        changed: ["shipping"],
        output: ["1015", "25"],
      },
      {
        line: null,
        say: "الخطوات التالية: يصبح الملف cart.ts وتتحوّل JSDoc إلى أنواع عادية، ثم تُشغَّل أعلام strict علَماً علَماً. والبناء أخضر بعد كل خطوة.",
        memory: [ty("cart.js", "checked"), ty("next", "rename to cart.ts")],
      },
    ],
    notes: {
      js: "هذا ملف JavaScript يفحصه tsc. الترتيب المعتاد: allowJs، ثم @ts-check أو checkJs مع JSDoc، ثم إعادة تسمية الملفات إلى .ts من الأوراق صعوداً، ثم strict علَماً علَماً.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة لخطة الترحيل: لكل ملف ما يستورده. الدالة تختار ترتيباً يحوّل الملف بعد أن تتحوّل كل ملفاته المستوردة أولاً، فلا يستورد ملف .ts جديد any من ملف .js.",
    starter: `const imports = {
  "app.js": ["cart.js", "api.js"],
  "cart.js": ["utils.js", "api.js"],
  "api.js": ["utils.js"],
  "utils.js": [],
};
const done = {};
const order = [];
function convert(file) {
  if (done[file]) return;
  for (const dep of imports[file]) convert(dep);
  done[file] = true;
  order.push(file.slice(0, file.length - 3) + ".ts");
}
convert("app.js");
console.log(order.join(" -> "));`,
    challenges: [
      "قبل التشغيل: أي ملف سيُحوَّل أولاً؟ ولماذا لا يمكن أن يكون app.js؟",
      "أضف ملفاً \"format.js\" يستورده utils.js. توقّع أين يظهر في الترتيب.",
      "احذف السطر if (done[file]) return. كم مرة يظهر utils.ts؟ هذا ما يمنعه done.",
    ],
  },
  predict: [
    {
      question: "مع allowJs (بلا checkJs)، ما نوع r في app.ts؟",
      code: `// math.js
export function add(a, b) { return a + b; }

// app.ts
import { add } from "./math.js";
const r = add(1, "2");`,
      options: ["any", "number", "string"],
      answer: 0,
      why: "tsc يقرأ math.js ليعرف ما يُصدّره، لكن المعاملين بلا JSDoc فهما any، و any + any يعطي any. لا خطأ على add(1, \"2\")، و r يحمل \"12\". لهذا يُحوَّل math.js قبل من يستورده: وإلا تسرّب any إلى الملفات الجديدة.",
      scene: check(
        `// math.js
export function add(a, b) { return a + b; }

// app.ts
import { add } from "./math.js";
const r = add(1, "2");`,
        [
          { line: 2, say: "ملف JS بلا JSDoc: المعاملان بلا ملصق، فيأخذان any.", memory: [ty("add", "(a: any, b: any) => any")], changed: ["add"] },
          { line: 6, say: "any يقبل كل شيء ويرجع any. tsc صامت.", memory: [ty("tsc sees r as", "any"), { name: "r", value: '"12"', type: "string" }], changed: ["r"] },
        ],
      ),
    },
    {
      question: "أصلح زميلك الخطأ الذي فوق هذا السطر. ماذا يقول tsc الآن؟",
      code: `// @ts-expect-error -- legacy: price may be a string here
const total: number = 5;`,
      options: ["Unused '@ts-expect-error' directive.", "لا شيء: التعليق بلا أثر حين لا يوجد خطأ", "Type 'number' is not assignable"],
      answer: 0,
      why: "@ts-expect-error يقول «أتوقع خطأً في السطر التالي». حين يختفي الخطأ يصبح التعليق نفسه خطأً، فيُحذف ولا يبقى ليخفي خطأً جديداً لاحقاً. @ts-ignore يسكت إلى الأبد. في الترحيل استعمل expect-error دائماً.",
      scene: check(
        `// @ts-expect-error -- legacy: price may be a string here
const total: number = 5;`,
        [
          { line: 2, say: "السطر سليم: لا خطأ ليُتوقّع.", memory: [ty("total", "number")] },
          { line: 1, say: "التوقّع لم يتحقق، فالتعليق هو الخطأ.", memory: [ty("total", "number")], error: "TS2578: Unused '@ts-expect-error' directive." },
        ],
      ),
    },
    {
      question: "هذا الملف مرّ بلا أخطاء وهو config.js مع // @ts-check. أعدنا تسميته config.ts. ماذا يقول tsc؟",
      code: `const config = {};
config.port = 3000;
console.log(config.port);`,
      options: ["Property 'port' does not exist on type '{}'. (مرتين)", "لا خطأ، كما في .js", "خطأ واحد في السطر 1"],
      answer: 0,
      why: "في ملفات JS يسمح tsc بإضافة خصائص إلى كائن فارغ بعد إنشائه، لأن هذا أسلوب JavaScript شائع. في .ts نوع {} مغلق. الحل: اكتب الشكل كاملاً من البداية: const config = { port: 3000 }، أو أعلن له interface.",
      scene: check(
        `const config = {};
config.port = 3000;
console.log(config.port);`,
        [
          { line: 1, say: "في .ts نوع الكائن الفارغ {}: بلا خصائص، ولا يُضاف إليه شيء.", memory: [ty("config", "{}")], changed: ["config"] },
          { line: 2, say: "كتابة خاصية لا يعرفها النوع.", memory: [ty("config", "{}")], error: "TS2339: Property 'port' does not exist on type '{}'." },
          { line: 3, say: "والقراءة كذلك.", memory: [ty("config", "{}")], error: "TS2339: Property 'port' does not exist on type '{}'." },
        ],
      ),
    },
  ],
  code: {
    intro: "الفرق التي تُرحّل مشروعاً كبيراً تضع في CI قاعدة واحدة: عدد أخطاء tsc لا يرتفع أبداً. يُحفظ العدد الحالي لكل ملف (baseline)، وكل طلب دمج يُقارن به. الأخطاء تنزل شيئاً فشيئاً، ولا يدخل خطأ جديد. هذا هو السكربت.",
    runnerLang: "ts",
    runnerStarter: `// CI step during a migration: the tsc error count may only go down.
const tscOutput = \`src/cart.ts(12,5): error TS18048: 'item' is possibly 'undefined'.
src/cart.ts(30,9): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
src/api.ts(8,3): error TS7006: Parameter 'res' implicitly has an 'any' type.
src/app.ts(4,1): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/app.ts(9,1): error TS18048: 'user' is possibly 'undefined'.\`;

const baseline: Record<string, number> = { "src/cart.ts": 3, "src/api.ts": 1, "src/app.ts": 1 };

function countBy(output: string, part: "file" | "code"): Map<string, number> {
  const counts = new Map<string, number>();
  for (const line of output.split("\\n")) {
    const m = /^(.+?)\\(\\d+,\\d+\\): error (TS\\d+)/.exec(line);
    if (!m) continue;
    const key = part === "file" ? m[1] : m[2];
    if (key === undefined) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

let failed = false;
for (const [file, count] of countBy(tscOutput, "file")) {
  const before = baseline[file] ?? 0; // a new file starts at 0: it must be clean
  if (count > before) failed = true;
  const note = count > before ? " (worse: fix before merging)" : count < before ? " (better: lower the baseline)" : "";
  console.log(\`\${file}: \${before} -> \${count}\${note}\`);
}
console.log(failed ? "CI: fail" : "CI: pass");
console.log("by code:", [...countBy(tscOutput, "code")].map(([c, n]) => c + "=" + n).join(" "));
// try: add a line for a new file src/ui.ts. Does CI pass?
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "من JSDoc إلى أنواع",
      prompt: "هذه total نفسها بعد إعادة تسمية الملف إلى .ts: صار @typedef واجهة و @param أنواعاً. رتّبها. الناتج: 25",
      lines: [
        "interface Item {",
        "  price: number;",
        "  qty: number;",
        "}",
        "function total(items: Item[], shipping: number): number {",
        "  return items.reduce((sum, it) => sum + it.price * it.qty, 0) + shipping;",
        "}",
        'const shippingInput = "15";',
        "console.log(total([{ price: 5, qty: 2 }], Number(shippingInput)));",
      ],
      expected: "25",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "أول خطأ يكشفه strictNullChecks",
      prompt: "بعد تشغيل strictNullChecks قال tsc: Object is possibly 'undefined'. find قد لا تجد شيئاً. أي نهاية تحفظ نوع الرجوع string وتطبع: Sara guest",
      template: `const users = [{ id: 1, name: "Sara" }];
function nameOf(id: number): string {
  return users.find((u) => u.id === id)___;
}
console.log(nameOf(1), nameOf(2));`,
      options: ['?.name ?? "guest"', ".name", "?.name"],
      expected: "Sara guest",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "any من ملف لم يُرحّل",
      prompt: "row يأتي من وحدة قديمة بنوع any، فلم يرَ tsc أن الوسيطين معكوسان. أعطِ row نوعه الحقيقي (فيظهر الخطأ في محررك) وصحّح الترتيب. الناتج: 10.00 SAR",
      code: `function formatPrice(amount: number, currency: string): string {
  return amount.toFixed(2) + " " + currency;
}
const row: any = JSON.parse('{"currency":"SAR","amount":10}');
console.log(formatPrice(row.currency, row.amount));`,
      expected: "10.00 SAR",
      hint: "const row: { currency: string; amount: number } = ... ثم formatPrice(row.amount, row.currency).",
      solution: `function formatPrice(amount: number, currency: string): string {
  return amount.toFixed(2) + " " + currency;
}
const row: { currency: string; amount: number } = JSON.parse('{"currency":"SAR","amount":10}');
console.log(formatPrice(row.amount, row.currency));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "سطر CSV إلى نوع",
      prompt: "الكود القديم يقرأ \"tea,5,2\" ويستعمل القطع نصوصاً. اكتب interface Item { name; price; qty } و parseItem(line: string): Item: تقسم بالفاصلة، وتحوّل price و qty بـ Number، وترمي Error(\"bad line: \" + line) إن غاب الاسم أو لم يكن السعر عدداً أو لم تكن الكمية عدداً صحيحاً. اطبع مجموع price * qty لـ \"tea,5,2\" و \"cake,12,1\"، ثم رسالة الخطأ لـ \"cup,x,1\". الناتج: 22 ثم bad line: cup,x,1",
      starter: `// write interface Item and parseItem here
`,
      expected: "22\nbad line: cup,x,1",
      hint: "const [name, price, qty] = line.split(\",\"); ثم Number.isFinite(p) و Number.isInteger(q). مع noUncheckedIndexedAccess تكون القطع string | undefined، فافحص name.",
      solution: `interface Item {
  name: string;
  price: number;
  qty: number;
}
function parseItem(line: string): Item {
  const [name, price, qty] = line.split(",");
  const p = Number(price);
  const q = Number(qty);
  if (!name || !Number.isFinite(p) || !Number.isInteger(q)) throw new Error("bad line: " + line);
  return { name, price: p, qty: q };
}
const items = ["tea,5,2", "cake,12,1"].map(parseItem);
console.log(items.reduce((sum, it) => sum + it.price * it.qty, 0));
try {
  parseItem("cup,x,1");
} catch (e) {
  console.log(e instanceof Error ? e.message : e);
}`,
    },
  ],
  quiz: [
    {
      question: "بأي ملف تبدأ إعادة التسمية إلى .ts؟",
      code: `// app.js   imports cart.js
// cart.js  imports utils.js
// utils.js imports nothing`,
      options: ["utils.js", "app.js", "لا فرق في الترتيب"],
      answer: 0,
      why: "ابدأ بالأوراق: الملف الذي لا يستورد شيئاً. حين يصبح utils.ts مكتوب الأنواع، يستورد cart.ts بعده أنواعاً حقيقية لا any. لو بدأت بـ app.ts لاستورد any من كل شيء، ولما فحص شيئاً تقريباً.",
    },
    {
      question: "مع هذا الإعداد، هل يحمرّ السطر؟",
      code: `// tsconfig: "strict": true, "strictNullChecks": false
let n: number = null;`,
      options: ["لا: العلَم المكتوب صراحة يغلب strict", "نعم: strict تشغّل strictNullChecks", "نعم، لكن كتحذير"],
      answer: 0,
      why: "strict اختصار يشغّل العائلة كلها، وأي علَم تكتبه بنفسك يغلبه. هكذا ترحّل: strict: true مع إطفاء الأعلام الصعبة مؤقتاً، ثم تشغّل كل علَم حين ينزل عدد أخطائه إلى صفر.",
    },
    {
      question: "allowJs: true و checkJs: false، وفي الملف لا يوجد // @ts-check. هل يبلّغ tsc عن خطأ؟",
      code: `// legacy.js
let n = 5;
n = "five";`,
      options: ["لا: يقرأ الملف ليعرف ما يصدّره، ولا يبلّغ عن أخطائه", "نعم: Type 'string' is not assignable to type 'number'.", "نعم، ويوقف البناء"],
      answer: 0,
      why: "allowJs وحده يُدخل ملفات JS في البرنامج دون فحصها. هذا يسمح ببدء الترحيل بلا آلاف الأخطاء دفعة واحدة. ثم تفتح الفحص ملفاً ملفاً بـ // @ts-check.",
    },
    {
      question: "في ملف JS مع // @ts-check، ماذا يقول tsc عن السطر 3؟",
      code: `// @ts-check
let n = 5;
n = "five";`,
      options: ["Type 'string' is not assignable to type 'number'.", "لا خطأ: ملفات JS بلا أنواع", "لا خطأ: let يقبل أي قيمة في JS"],
      answer: 0,
      why: "tsc يستنتج الأنواع في JS كما في TS: n بدأ رقماً فملصقه number. الفحص يعمل حتى قبل أن تكتب سطر JSDoc واحداً، ولهذا يكشف @ts-check أخطاء حقيقية من اليوم الأول.",
    },
    {
      question: "ما الذي يُطبع؟ (الوحدة القديمة data.js ترجع any)",
      code: `const settings: { retries: number } = loadSettings(); // returns any
console.log(settings.retries + 1);
// loadSettings() actually returns { retries: "3" }`,
      options: ["31", "4", "TypeError"],
      answer: 0,
      why: "ملصق على any لا يفحص شيئاً: هو as مخفي. tsc يرى number + 1، والواقع \"3\" + 1. أثناء الترحيل تبقى حدود الوحدات القديمة أماكن any، فإما أن تُرحّل، أو تُفحص قيمها بمحلّل.",
    },
  ],
  next: "ts-monorepo",
};
