import type { Cell, Frame, HeapObj, Lesson, Scene } from "@/lib/types";

const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const PRODUCT = "{ id: number; name: string; price: number }";
const shapes = [label("Product", PRODUCT), label("Line", "{ product: Product; qty: number }")];

/** The tea object on the heap, with the price it has at that step. */
const teaObj = (price: number): HeapObj => ({
  id: 1,
  kind: "object",
  items: [
    { name: "id", value: "1", type: "number" },
    { name: "name", value: '"tea"', type: "string" },
    { name: "price", value: String(price), type: "number" },
  ],
});
const lineObj: HeapObj = {
  id: 2,
  kind: "object",
  items: [
    { name: "product", value: "", type: "ref", ref: 1 },
    { name: "qty", value: "3", type: "number" },
  ],
};
const globals = (withLine: boolean): Frame[] => [
  {
    id: 0,
    name: "global",
    vars: [
      { name: "tea", value: "", type: "ref", ref: 1 },
      ...(withLine ? [{ name: "line", value: "", type: "ref" as const, ref: 2 }] : []),
    ],
  },
];

export const tsObjects: Lesson = {
  slug: "ts-objects",
  stage: 0,
  number: "1.3",
  title: "interface و type",
  subtitle: "قالب يقارن به المدقّق كل كائن: بالشكل، لا بالاسم",
  minutes: 20,
  problem: {
    title: "كائن ينقصه شيء",
    body: "هذا قالب منتج: id رقم، name نص، price رقم. ابنِ كائناً بالضغط على قيمه: احذف حقلاً، غيّر نوع آخر، أضف حقلاً زائداً. متى يقبله المدقّق؟",
    demo: "tsObjects",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `interface Product {
  id: number;
  name: string;
  price: number;
}
type Line = { product: Product; qty: number };
const tea: Product = { id: 1, name: "tea", price: 8 };
const line: Line = { product: tea, qty: 3 };
tea.price = 9;
console.log(line.product.price * line.qty);`,
    },
    steps: [
      {
        line: null,
        say: "interface و type قوالب يحفظها المدقّق. لا تصنع شيئاً في الذاكرة. الكائنات نفسها كائنات JavaScript عادية تعيش في الكومة.",
        memory: [],
      },
      {
        line: 1,
        say: "interface Product: قالب له ثلاثة حقول وأنواعها. أي كائن يُكتب عليه Product يجب أن يطابقه.",
        memory: [label("Product", PRODUCT)],
      },
      {
        line: 6,
        say: "type Line قالب آخر بصيغة ثانية. حقل product فيه نوعه Product: القوالب تُبنى من قوالب.",
        memory: shapes,
      },
      {
        line: 7,
        say: "المدقّق يضع الكائن على القالب: id رقم ✓، name نص ✓، price رقم ✓، ولا حقل زائد. وعند التشغيل يُبنى الكائن في الكومة (#1)، و tea يحمل عنوانه.",
        memory: [],
        frames: globals(false),
        heap: [teaObj(8)],
        changedHeap: [1],
      },
      {
        line: 8,
        say: "product: tea لا ينسخ المنتج: يضع في الكائن الجديد العنوان نفسه #1. المدقّق راضٍ: tea من نوع Product كما يطلب Line.",
        memory: [],
        frames: globals(true),
        heap: [teaObj(8), lineObj],
        changedHeap: [2],
      },
      {
        line: 9,
        say: "المدقّق: هل في Product حقل price؟ نعم، رقم، وليس readonly. فيتغيّر السعر في الكائن #1 نفسه.",
        memory: [],
        frames: globals(true),
        heap: [teaObj(9), lineObj],
        changedHeap: [1],
      },
      {
        line: 10,
        say: "line.product يتبع السهم إلى #1، فيجد السعر الجديد 9. و 9 × 3 = 27.",
        memory: [],
        frames: globals(true),
        heap: [teaObj(9), lineObj],
        output: ["27"],
      },
      {
        line: null,
        say: "القالب وصف الكائنات للمدقّق ثم مُحي. ما بقي كائنان في الكومة وأسهم بينهما، تماماً كما في JavaScript.",
        memory: [],
        frames: globals(true),
        heap: [teaObj(9), lineObj],
      },
    ],
    notes: {
      ts: "interface و type يصفان شكل كائن. interface يمكن توسيعه بـ extends، و type يصف أيضاً ما ليس كائناً (اتحادات، أنواع حرفية). كلاهما يُمحى قبل التشغيل.",
    },
  },
  playground: {
    kind: "trace",
    intro: "JavaScript لا تعرف القوالب. هذه الدالة fits تفعل وقت التشغيل ما يفعله المدقّق قبل التشغيل: تسأل عن كل حقل ونوعه. شغّل وانظر ماذا يحدث للمسودة الناقصة.",
    starter: `let product = { id: 1, name: "tea", price: 8 };
let draft = { id: 2, name: "cake" };
function fits(p) {
  return typeof p.id === "number" && typeof p.name === "string" && typeof p.price === "number";
}
console.log(fits(product));
console.log(fits(draft));
console.log(draft.price * 2);`,
    challenges: [
      "قبل التشغيل: ماذا يطبع السطر الأخير؟ ولماذا لا تتوقف JavaScript؟",
      "أضف price: 20 إلى draft. ماذا تطبع fits الآن؟",
      "غيّر id في product إلى \"1\" بعلامتي تنصيص. أي سطر تغيّرت نتيجته؟",
      "fits تعمل كل مرة يعمل البرنامج. المدقّق يفحص مرة واحدة قبل التشغيل ولا يكلّف شيئاً وقت التشغيل. أيهما تفضّل لكود كتبته أنت؟",
    ],
  },
  predict: [
    {
      question: "هل يقبل tsc السطر 6؟",
      code: `interface Product {
  id: number;
  name: string;
  price: number;
}
const cake: Product = { id: 2, name: "cake" };`,
      options: ["لا: الحقل price ناقص", "نعم: الحقول الناقصة تصبح undefined", "نعم، لكن price تصبح 0"],
      answer: 0,
      why: "كل حقل في القالب بلا ؟ إلزامي. الكائن ينقصه price، والمدقّق يذكر الاسم بالضبط: Property 'price' is missing. لو أردته اختيارياً لكتبت price?: number.",
      scene: check(
        `interface Product {
  id: number;
  name: string;
  price: number;
}
const cake: Product = { id: 2, name: "cake" };`,
        [
          { line: 1, say: "القالب: ثلاثة حقول إلزامية.", memory: [label("Product", PRODUCT)] },
          { line: 6, say: "id ✓ و name ✓ و price… غير موجود. خط أحمر.", memory: [label("Product", PRODUCT), label("cake", "Product")], error: "Property 'price' is missing in type '{ id: number; name: string; }' but required in type 'Product'." },
        ],
      ),
    },
    {
      question: "الكائن فيه كل الحقول وحقل زائد. هل يقبله tsc؟",
      code: `interface Product {
  id: number;
  name: string;
  price: number;
}
const tea: Product = { id: 1, name: "tea", price: 8, colour: "green" };`,
      options: ["لا: colour ليس في Product", "نعم: الحقل الزائد يُتجاهل", "نعم، ويُحذف colour عند التشغيل"],
      answer: 0,
      why: "حين تكتب الكائن مباشرة بعد القالب، يعدّ المدقّق كل حقل لا يعرفه خطأً إملائياً محتملاً: Object literal may only specify known properties. هذا يمسك أخطاء مثل pirce بدل price.",
      scene: check(
        `interface Product {
  id: number;
  name: string;
  price: number;
}
const tea: Product = { id: 1, name: "tea", price: 8, colour: "green" };`,
        [
          { line: 1, say: "القالب لا يعرف إلا id و name و price.", memory: [label("Product", PRODUCT)] },
          { line: 6, say: "الحقول الثلاثة ✓، لكن colour غير معروف في كائن مكتوب مباشرة. خط أحمر.", memory: [label("Product", PRODUCT), label("tea", "Product")], error: "Object literal may only specify known properties, and 'colour' does not exist in type 'Product'." },
        ],
      ),
    },
    {
      question: "tea لم يُكتب عليه Named أبداً. هل يقبل tsc السطر 3؟ وماذا يُطبع؟",
      code: `interface Named { name: string }
const tea = { id: 1, name: "tea", price: 8 };
const n: Named = tea;
console.log(n.name);`,
      options: ["يقبل ويطبع tea", "يرفض: tea ليس من نوع Named", "يرفض: tea فيه حقول زائدة"],
      answer: 0,
      why: "TypeScript يقارن بالشكل لا بالاسم: يكفي أن في tea حقلاً name نصاً. والحقول الزائدة لا تُرفض هنا لأن الكائن جاء من متغير لا من كتابة مباشرة. و n و tea يشيران إلى الكائن نفسه.",
      scene: check(
        `interface Named { name: string }
const tea = { id: 1, name: "tea", price: 8 };
const n: Named = tea;
console.log(n.name);`,
        [
          { line: 1, say: "Named يطلب حقلاً واحداً: name نص.", memory: [label("Named", "{ name: string }")] },
          { line: 2, say: "tea بلا تعليق، فيستنتج المدقّق شكله من القيمة.", memory: [label("Named", "{ name: string }"), label("tea", "{ id: number; name: string; price: number }")] },
          { line: 3, say: "هل في شكل tea حقل name نص؟ نعم ✓. الشكل يكفي، والاسم لا يهم.", memory: [label("Named", "{ name: string }"), label("tea", "{ id: number; name: string; price: number }"), label("n", "Named")] },
          { line: 4, say: "n يشير إلى الكائن نفسه، فيُطبع tea.", memory: [label("tea", "{ id: number; name: string; price: number }"), label("n", "Named")], output: ["tea"] },
        ],
      ),
    },
  ],
  code: {
    intro: "قالب حقيقي كما يكتبه المحترفون: id للقراءة فقط (readonly)، و discount اختياري (?)، و DigitalProduct يوسّع Product بـ extends. شغّل، ثم جرّب أن تضيف discount لمنتج آخر.",
    runnerLang: "ts",
    runnerStarter: `interface Product {
  readonly id: number;
  name: string;
  price: number;
  discount?: number;
}
interface DigitalProduct extends Product {
  downloadUrl: string;
}
function finalPrice(p: Product): number {
  return p.price - (p.discount ?? 0);
}
const mug: Product = { id: 1, name: "mug", price: 30 };
const ebook: DigitalProduct = { id: 2, name: "ebook", price: 45, discount: 10, downloadUrl: "/files/ebook.pdf" };
console.log(mug.name, finalPrice(mug));
console.log(ebook.name, finalPrice(ebook), ebook.downloadUrl);
// try: give mug a discount of 5
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "القالب ثم الكائن",
      prompt: "رتّب الأسطر: عرّف القالب Product، ثم كائناً منه، ثم اطبع: pen 8",
      lines: ["interface Product {", "  name: string;", "  price: number;", "}", 'const pen: Product = { name: "pen", price: 4 };', "console.log(pen.name, pen.price * 2);"],
      expected: "pen 8",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "نسخة أم السهم نفسه؟",
      prompt: "نريد نسخة مستقلة: تغيير سعر copy لا يغيّر سعر tea، فيُطبع 8. ماذا نضع؟",
      template: `type Product = { name: string; price: number };
const tea: Product = { name: "tea", price: 8 };
const copy: Product = ___;
copy.price = 10;
console.log(tea.price);`,
      options: ["tea", "{ name: tea.name, price: tea.price }", "tea as Product"],
      expected: "8",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "الحقل الاختياري",
      prompt: "discount اختياري. حين يغيب تطبع الدالة NaN. tsc في الوضع الصارم كان سيقول: 'p.discount' is possibly 'undefined'. أصلح الدالة لتطبع 8 ثم 15.",
      code: `interface Product {
  name: string;
  price: number;
  discount?: number;
}
function finalPrice(p: Product): number {
  return p.price - p.discount;
}
console.log(finalPrice({ name: "tea", price: 8 }));
console.log(finalPrice({ name: "cake", price: 20, discount: 5 }));`,
      expected: "8\n15",
      hint: "حين يغيب discount قيمته undefined. استعمل (p.discount ?? 0).",
      solution: `interface Product {
  name: string;
  price: number;
  discount?: number;
}
function finalPrice(p: Product): number {
  return p.price - (p.discount ?? 0);
}
console.log(finalPrice({ name: "tea", price: 8 }));
console.log(finalPrice({ name: "cake", price: 20, discount: 5 }));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "قالب العميل",
      prompt: "اكتب interface اسمها Customer فيها name نص و vip منطقي اختياري. واكتب greet(c: Customer): string ترجع \"Welcome back, \" + name إن كان vip صحيحاً، وإلا \"Hello, \" + name. اطبع: Welcome back, Sara ثم Hello, Omar",
      starter: "// write interface Customer and function greet here\n",
      expected: "Welcome back, Sara\nHello, Omar",
      hint: "interface Customer { name: string; vip?: boolean } ثم داخل الدالة: if (c.vip) { ... }",
      solution: `interface Customer {
  name: string;
  vip?: boolean;
}
function greet(c: Customer): string {
  if (c.vip) {
    return "Welcome back, " + c.name;
  }
  return "Hello, " + c.name;
}
console.log(greet({ name: "Sara", vip: true }));
console.log(greet({ name: "Omar" }));`,
    },
  ],
  quiz: [
    {
      question: "أي سطر يرفضه tsc؟",
      code: 'interface Item {\n  readonly id: number;\n  name: string;\n}\nconst it: Item = { id: 1, name: "cup" };\nit.name = "mug";\nit.id = 2;',
      options: ["السطر 7", "السطر 6", "السطران 6 و 7"],
      answer: 0,
      why: "readonly يقول للمدقّق: هذا الحقل يُكتب مرة عند الإنشاء فقط. تغيير name مسموح، أما id فيُرفض: Cannot assign to 'id' because it is a read-only property.",
    },
    {
      question: "ماذا يطبع هذا الكود؟ (يمر من tsc)",
      code: "const box: { n: number } = { n: 1 };\nbox.n = 2;\nconsole.log(box.n);",
      options: ["2", "1", "خطأ: box ثابت const"],
      answer: 0,
      why: "const يثبّت الدرج box: لا يمكن أن يشير إلى كائن آخر. أما الكائن في الكومة فحقوله تتغيّر. لتثبيت الحقل نفسه تحتاج readonly في النوع.",
    },
    {
      question: "type و interface بالشكل نفسه. هل يقبل tsc السطر 4؟",
      code: "type A = { x: number };\ninterface B { x: number }\nconst a: A = { x: 1 };\nconst b: B = a;",
      options: ["نعم: الشكل واحد", "لا: A و B اسمان مختلفان", "لا: لا يُخلط type مع interface"],
      answer: 0,
      why: "المدقّق لا يقارن الأسماء، بل الحقول وأنواعها. A و B يصفان الشكل نفسه { x: number }، فكل كائن يطابق أحدهما يطابق الآخر.",
    },
    {
      question: "ماذا يقول tsc عن السطر 3؟",
      code: 'interface Animal { name: string }\ninterface Dog extends Animal { breed: string }\nconst d: Dog = { breed: "saluki" };',
      options: ["Property 'name' is missing", "لا خطأ: Dog فيه breed فقط", "Property 'breed' is missing"],
      answer: 0,
      why: "extends ينسخ حقول Animal إلى Dog، فقالب Dog فيه name و breed معاً. الكائن ينقصه name.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: "type Line = { qty: number };\nconst a: Line = { qty: 1 };\nconst b: Line = a;\nb.qty = 5;\nconsole.log(a.qty);",
      options: ["5", "1", "خطأ: b من نوع Line آخر"],
      answer: 0,
      why: "السطر 3 لا يصنع كائناً جديداً: b يأخذ العنوان نفسه الذي في a. النوع لا يغيّر شيئاً من هذا: a و b سهمان إلى كائن واحد، فتغييره من b يظهر من a.",
    },
  ],
  next: "ts-unions",
};
