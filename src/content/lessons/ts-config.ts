import type { Cell, Lesson, Scene } from "@/lib/types";

const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const on = (name: string): Cell => ({ name, value: "true", type: "boolean" });
const opt = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const include = opt("include", "src/**");
const strict = [on("noImplicitAny"), on("strictNullChecks"), on("strictFunctionTypes"), label("…", "strict family")];
const withIndex = [include, ...strict, on("noUncheckedIndexedAccess")];

export const tsConfig: Lesson = {
  slug: "ts-config",
  stage: 0,
  number: "1.8",
  title: "tsconfig",
  subtitle: "ملف إعدادات المدقّق: ماذا يفحص، وبأي صرامة، وأي JavaScript يكتب",
  minutes: 18,
  problem: {
    title: "الكود نفسه، حكم مختلف",
    body: "هذا الملف لم يتغيّر فيه حرف. شغّل وأطفئ مفاتيح الإعدادات، وراقب الخطوط الحمراء تظهر وتختفي، ثم اضغط «شغّل» لترى ما يحدث فعلاً.",
    demo: "tsConfig",
  },
  singleLanguage: true,
  scene: {
    code: {
      text: `{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "target": "ES2022",
    "module": "NodeNext",
    "outDir": "dist",
    "skipLibCheck": true
  },
  "include": ["src"]
}`,
    },
    steps: [
      {
        line: null,
        say: "tsconfig.json أول ما يقرؤه tsc. هو لوحة مفاتيح المدقّق: أي الملفات يقرأ، وبأي صرامة، وأي JavaScript يكتب. سنملأ جدول المفاتيح سطراً سطراً.",
        memory: [],
      },
      {
        line: 10,
        say: "include: كل ملفات ‎.ts داخل src. المدقّق يقرأ المشروع كله معاً، فالنوع المعرّف في ملف يُفحص استعماله في ملف آخر.",
        memory: [include],
        changed: ["include"],
      },
      {
        line: 3,
        say: "strict ليس مفتاحاً واحداً، بل عائلة تُشعل معاً. أهمها noImplicitAny: كل معامل بلا نوع خطأ، بدل أن يصير any بصمت.",
        memory: [include, ...strict],
        changed: ["noImplicitAny", "strictNullChecks", "strictFunctionTypes"],
      },
      {
        line: 3,
        say: "و strictNullChecks: null و undefined ليستا من string ولا number. بدونه يمر let name: string = null، وينهار البرنامج لاحقاً عند name.length.",
        memory: [include, ...strict],
        read: ["strictNullChecks"],
      },
      {
        line: 4,
        say: "noUncheckedIndexedAccess خارج عائلة strict، ويضيفه كثير من المحترفين: prices[0] نوعه number | undefined، لأن المصفوفة قد تكون فارغة.",
        memory: withIndex,
        changed: ["noUncheckedIndexedAccess"],
      },
      {
        line: 5,
        say: "target: أي نسخة JavaScript تُكتب. ES2022 تُبقي الصيغ الحديثة كما هي؛ هدف أقدم يعيد كتابة ?? و ?. بصيغ قديمة. ولا يضيف دوالاً ناقصة في المتصفحات القديمة.",
        memory: [...withIndex, opt("target", "ES2022")],
        changed: ["target"],
      },
      {
        line: 6,
        say: "module: كيف تُكتب import و export وكيف يبحث عن الملفات. NodeNext يطابق قواعد Node نفسها.",
        memory: [...withIndex, opt("target", "ES2022"), opt("module", "NodeNext")],
        changed: ["module"],
      },
      {
        line: 7,
        say: "outDir: أين تُكتب ملفات JavaScript. src/cart.ts يصير dist/cart.js، والمصدر يبقى نظيفاً.",
        memory: [...withIndex, opt("target", "ES2022"), opt("module", "NodeNext"), opt("outDir", "dist")],
        changed: ["outDir"],
      },
      {
        line: 8,
        say: "skipLibCheck: لا تعِد فحص ملفات الأنواع ‎.d.ts داخل node_modules. يوفّر وقتاً كبيراً، وكودك نفسه يبقى مفحوصاً كاملاً.",
        memory: [...withIndex, opt("target", "ES2022"), opt("module", "NodeNext"), opt("outDir", "dist"), on("skipLibCheck")],
        changed: ["skipLibCheck"],
      },
      {
        line: null,
        say: "تذكّر أن هناك عملين منفصلين: الفحص (tsc --noEmit) والمحو (tsc أو esbuild أو Node أو هذا الموقع). أدوات المحو لا تفحص شيئاً، لذلك يُشغَّل tsc --noEmit في المحرر وفي CI قبل كل دمج.",
        memory: [...withIndex, opt("target", "ES2022"), opt("module", "NodeNext"), opt("outDir", "dist"), on("skipLibCheck")],
      },
    ],
    notes: {
      text: "ابدأ كل مشروع جديد بـ npx tsc --init، ثم تأكد أن strict: true. إطفاؤه لاحقاً سهل؛ إشعاله في مشروع كبير يكشف مئات الأخطاء دفعة واحدة.",
    },
  },
  playground: {
    kind: "trace",
    intro: "JavaScript بلا أي مدقّق. القائمة فيها اسمان، ونقرأ خانة برقمها i. شغّل، ثم اجعل i خانة غير موجودة وانظر أين ينهار البرنامج.",
    starter: `let users = ["sara", "omar"];
let i = 1;
let name = users[i];
console.log(name);
let shout = name.toUpperCase();
console.log(shout);`,
    challenges: [
      "شغّل كما هو: ماذا يُطبع؟",
      "غيّر i إلى 2. قبل التشغيل: ما قيمة name؟ وأي سطر سينهار؟",
      "مع noUncheckedIndexedAccess كان tsc سيقول في السطر 5: 'name' is possibly 'undefined'. وبدونه؟ كان سيرى name على أنه string ويسكت.",
      "اجعل السطر 5 آمناً مهما كان i: let shout = name === undefined ? \"?\" : name.toUpperCase();",
    ],
  },
  predict: [
    {
      question: "الإعداد \"strict\": false. هل يبلّغ tsc عن أي خطأ؟ وماذا يحدث عند التشغيل؟",
      code: `function label(name) {
  return name.toUpperCase();
}
label(42);`,
      options: ["لا أخطاء، وينهار عند التشغيل", "خطأ: name نوعه any ضمنياً", "لا أخطاء، ويُطبع 42"],
      answer: 0,
      why: "بلا strict يصير name من نوع any بصمت، و any يطفئ كل فحص بعده، فيمر label(42). وعند التشغيل: name.toUpperCase is not a function. مع strict كان السطر 1 أحمر.",
      scene: check(
        `function label(name) {
  return name.toUpperCase();
}
label(42);`,
        [
          { line: 1, say: "strict مطفأ: name بلا نوع يصير any ولا أحد يعترض.", memory: [label("name", "any")] },
          { line: 4, say: "any يقبل 42. tsc لا يجد شيئاً.", memory: [label("name", "any")] },
          { line: 2, say: "عند التشغيل: الرقم ليس فيه toUpperCase.", memory: [{ name: "name", value: "42", type: "number" }], error: "TypeError: name.toUpperCase is not a function" },
        ],
      ),
    },
    {
      question: "الإعداد \"noUncheckedIndexedAccess\": true. ماذا يقول tsc عن السطر 3؟",
      code: `const prices: number[] = [12, 30];
const first = prices[0];
console.log(first.toFixed(2));`,
      options: ["'first' is possibly 'undefined'", "لا خطأ: الخانة 0 موجودة", "لا خطأ: first نوعه number"],
      answer: 0,
      why: "المدقّق لا يعدّ الخانات، فهو لا يعرف أن المصفوفة ليست فارغة. مع هذا الإعداد كل قراءة بالفهرس قد تكون undefined، فيطلب منك أن تقرّر ماذا تفعل حينها.",
      scene: check(
        `const prices: number[] = [12, 30];
const first = prices[0];
console.log(first.toFixed(2));`,
        [
          { line: 1, say: "number[]: عدد الخانات غير معروف للمدقّق.", memory: [label("prices", "number[]")] },
          { line: 2, say: "مع الإعداد: القراءة بالفهرس تعطي number | undefined.", memory: [label("prices", "number[]"), label("first", "number | undefined")] },
          { line: 3, say: "toFixed على ما قد يكون undefined: خط أحمر.", memory: [label("prices", "number[]"), label("first", "number | undefined")], error: "'first' is possibly 'undefined'." },
        ],
      ),
    },
    {
      question: "تشغّل هذا الملف بأداة تمحو الأنواع فقط (مثل node app.ts في Node الحديث، أو هذا الموقع). ماذا يحدث؟",
      code: `const price: number = "free";
console.log(price);`,
      options: ["يُطبع free", "يرفض التشغيل بخطأ نوع", "يُطبع NaN"],
      answer: 0,
      why: "المحو يحذف ‎: number ولا يفحص شيئاً، فيبقى const price = \"free\". الفحص عمل tsc وحده، ولهذا يُشغَّل tsc --noEmit في CI: وإلا وصلت أخطاء الأنواع إلى الإنتاج.",
      scene: check(
        `const price: number = "free";
console.log(price);`,
        [
          { line: 1, say: "أداة المحو تحذف ‎: number وتمضي. لا أحد يقارن النص بالملصق.", memory: [{ name: "price", value: '"free"', type: "string" }] },
          { line: 2, say: "يُطبع free. لو شغّلت tsc --noEmit لظهر: Type 'string' is not assignable to type 'number'.", memory: [{ name: "price", value: '"free"', type: "string" }], output: ["free"] },
        ],
      ),
    },
  ],
  code: {
    intro: "هكذا يبدو الكود حين يعمل تحت strict و noUncheckedIndexedAccess: كل قيمة قد تغيب لها خطة. هنا يُمحى النوع ويعمل الكود، فجرّب أن تبحث عن منتج غير موجود.",
    runnerLang: "ts",
    runnerStarter: `interface Product {
  id: number;
  name: string;
  price: number;
}
const products: Product[] = [
  { id: 1, name: "tea", price: 8 },
  { id: 2, name: "cake", price: 15 },
];
function findProduct(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}
const p = findProduct(2);
console.log(p?.name ?? "not found");

const first = products[0];
if (first !== undefined) {
  console.log(first.price.toFixed(2));
}
// try: findProduct(9). What prints? Which line would crash without ?. and ???
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "خطة للغياب",
      prompt: "رتّب الأسطر: ابحث عن اسم يبدأ بـ o، واطبعه بحروف كبيرة فقط إن وُجد: OMAR",
      lines: ['const names: string[] = ["sara", "omar"];', 'const found = names.find((n) => n.startsWith("o"));', "if (found !== undefined) {", "  console.log(found.toUpperCase());", "}"],
      expected: "OMAR",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "مصفوفة فارغة",
      prompt: "مع noUncheckedIndexedAccess، first نوعه number | undefined. أي تعبير يطبع 0.00 بأمان؟",
      template: `const prices: number[] = [];
const first = prices[0];
console.log(___);`,
      options: ["(first ?? 0).toFixed(2)", "first.toFixed(2)", "String(first)"],
      expected: "0.00",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "معامل بلا نوع",
      prompt: "items بلا نوع، فهو any، ولم يُمسك خطأ إملائي في البيانات: prise بدل price. المجموع يطبع NaN. أعط items نوعاً (strict كان سيطلبه) وأصلح الخطأ ليُطبع 23.",
      code: `function total(items) {
  let sum = 0;
  for (const item of items) {
    sum += item.price;
  }
  return sum;
}
console.log(total([{ name: "tea", price: 8 }, { name: "cake", prise: 15 }]));`,
      expected: "23",
      hint: "عرّف interface Item { name: string; price: number } واكتب items: Item[]. عندها يشير tsc إلى prise، فصحّحها.",
      solution: `interface Item {
  name: string;
  price: number;
}
function total(items: Item[]): number {
  let sum = 0;
  for (const item of items) {
    sum += item.price;
  }
  return sum;
}
console.log(total([{ name: "tea", price: 8 }, { name: "cake", price: 15 }]));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "قسمة آمنة",
      prompt: "اكتب safeDivide(a: number, b: number): number | undefined ترجع undefined حين يكون b صفراً، وإلا a / b. اطبع safeDivide(10, 4) ?? \"n/a\" ثم safeDivide(1, 0) ?? \"n/a\": 2.5 ثم n/a",
      starter: "// write safeDivide here, then print the two calls with ?? \"n/a\"\n",
      expected: "2.5\nn/a",
      hint: "if (b === 0) { return undefined; } return a / b;",
      solution: `function safeDivide(a: number, b: number): number | undefined {
  if (b === 0) {
    return undefined;
  }
  return a / b;
}
console.log(safeDivide(10, 4) ?? "n/a");
console.log(safeDivide(1, 0) ?? "n/a");`,
    },
  ],
  quiz: [
    {
      question: "مع \"strict\": true، أي سطر يرفضه tsc؟",
      code: "let a: number = undefined;\nlet b: number | undefined = undefined;",
      options: ["السطر 1", "السطر 2", "كلاهما"],
      answer: 0,
      why: "strictNullChecks (من عائلة strict) يجعل undefined نوعاً مستقلاً. number وحده لا يقبله؛ إن كانت القيمة قد تغيب فاكتب ذلك في النوع كما في السطر 2.",
    },
    {
      question: "الإعداد \"target\": \"ES5\"، والكود فيه const x = a ?? 0. ماذا يفعل tsc؟",
      code: "const a: number | null = null;\nconst x = a ?? 0;\nconsole.log(x);",
      options: ["يكتب السطر بصيغة قديمة تعطي النتيجة نفسها: 0", "يرفض: ?? غير موجودة في ES5", "يحذف السطر"],
      answer: 0,
      why: "target يقرّر شكل JavaScript الناتجة لا معناها. ES5 لا تعرف ??، فيكتبها tsc كشرط يفحص null و undefined. والسلوك نفسه: يُطبع 0.",
    },
    {
      question: "rootDir هو src و outDir هو dist. أين يكتب tsc ناتج src/shop/cart.ts؟",
      options: ["dist/shop/cart.js", "src/shop/cart.js", "dist/cart.ts"],
      answer: 0,
      why: "tsc يحافظ على شكل المجلدات تحت rootDir وينقله إلى outDir، ويغيّر الامتداد إلى ‎.js. ملفات ‎.ts تبقى في src كما هي.",
    },
    {
      question: "زميلك يشغّل المشروع بـ esbuild وكل شيء يعمل، لكن CI يفشل بـ TS2322. ماذا شغّل CI على الأرجح؟",
      options: ["tsc --noEmit", "esbuild نفسه", "node dist/app.js"],
      answer: 0,
      why: "esbuild يمحو الأنواع ولا يفحصها، فيعمل الكود وفيه خطأ نوع. tsc --noEmit يفحص المشروع كله بإعدادات tsconfig ولا يكتب ملفات: هذا الحارس في CI.",
    },
    {
      question: "مع \"noUncheckedIndexedAccess\": true، ما نوع x؟",
      code: 'const xs: string[] = ["a"];\nconst x = xs[0];',
      options: ["string | undefined", "string", "\"a\""],
      answer: 0,
      why: "string[] لا يحفظ الطول، فالإعداد يفترض أن أي خانة قد لا تكون موجودة. بدونه كان x نوعه string حتى لو كانت المصفوفة فارغة.",
    },
  ],
  next: "ts-generics",
};
