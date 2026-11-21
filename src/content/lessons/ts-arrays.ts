import type { Cell, Frame, HeapObj, Lesson, Scene, Slot } from "@/lib/types";

const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const n = (name: string, value: number): Slot => ({ name, value: String(value), type: "number" });
const s = (name: string, value: string): Slot => ({ name, value: `"${value}"`, type: "string" });
const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
const arr = (id: number, items: Slot[]): HeapObj => ({ id, kind: "array", items });
const nums = (id: number, values: number[]): HeapObj => arr(id, values.map((v, i) => n(String(i), v)));
const frame = (vars: Slot[]): Frame[] => [{ id: 0, name: "global", vars }];

const tuple = arr(2, [s("0", "tea"), n("1", 12)]);

export const tsArrays: Lesson = {
  slug: "ts-arrays",
  stage: 0,
  number: "1.6",
  title: "المصفوفات و tuples",
  subtitle: "ملصق واحد لكل الخانات، أو ملصق لكل موضع",
  minutes: 18,
  problem: {
    title: "خانة دخيلة",
    body: "مصفوفة أسعار، ومجموعها يُحسب تحتها. أضف عناصر بأنواع مختلفة، مرة بلا ملصق ومرة بالملصق number[]. ماذا يحدث للمجموع حين يدخل نص؟",
    demo: "tsArrays",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `const prices: number[] = [12, 30];
prices.push(8);
const entry: [string, number] = ["tea", 12];
const [name, price] = entry;
const totals = prices.map((p) => p * 2);
const fixed: readonly number[] = prices;
console.log(prices.length, name, price, totals[2]);`,
    },
    steps: [
      {
        line: null,
        say: "المصفوفات في TypeScript مصفوفات JavaScript نفسها، في الكومة. الجديد ملصقات: ملصق لكل الخانات، أو ملصق لكل موضع.",
        memory: [],
      },
      {
        line: 1,
        say: "number[] تعني: كل خانة، الآن وفيما بعد، رقم. المصفوفة تُبنى في الكومة (#1)، و prices يحمل عنوانها.",
        memory: [],
        frames: frame([ref("prices", 1)]),
        heap: [nums(1, [12, 30])],
        changedHeap: [1],
      },
      {
        line: 2,
        say: "push تقبل هنا number فقط، لأن الملصق number[]. و 8 رقم ✓، فتكبر المصفوفة نفسها خانة. (const يمنع تغيير السهم، لا محتوى المصفوفة.)",
        memory: [],
        frames: frame([ref("prices", 1)]),
        heap: [nums(1, [12, 30, 8])],
        changedHeap: [1],
      },
      {
        line: 3,
        say: "tuple: الموضع 0 نص، والموضع 1 رقم، والطول 2 بالضبط. مفيد لزوج من قيم مختلفة، مثل اسم وسعر.",
        memory: [],
        frames: frame([ref("prices", 1), ref("entry", 2)]),
        heap: [nums(1, [12, 30, 8]), tuple],
        changedHeap: [2],
      },
      {
        line: 4,
        say: "التفكيك ينسخ الموضعين إلى درجين. والمدقّق يعرف لكل واحد نوعه من موضعه: name نص و price رقم.",
        memory: [],
        frames: frame([ref("prices", 1), ref("entry", 2), s("name", "tea"), n("price", 12)]),
        heap: [nums(1, [12, 30, 8]), tuple],
      },
      {
        line: 5,
        say: "map تبني مصفوفة جديدة (#3). p رقم من السياق، و p * 2 رقم، فيستنتج المدقّق totals: number[].",
        memory: [],
        frames: frame([ref("prices", 1), ref("entry", 2), s("name", "tea"), n("price", 12), ref("totals", 3)]),
        heap: [nums(1, [12, 30, 8]), tuple, nums(3, [24, 60, 16])],
        changedHeap: [3],
      },
      {
        line: 6,
        say: "readonly لا ينسخ شيئاً: fixed سهم آخر إلى المصفوفة #1 نفسها. الفرق في الملصق فقط: من خلال fixed لا push ولا تغيير خانة.",
        memory: [],
        frames: frame([ref("prices", 1), ref("entry", 2), s("name", "tea"), n("price", 12), ref("totals", 3), ref("fixed", 1)]),
        heap: [nums(1, [12, 30, 8]), tuple, nums(3, [24, 60, 16])],
      },
      {
        line: 7,
        say: "يُطبع 3 tea 12 16: ثلاث خانات، والاسم والسعر، والخانة 2 من totals.",
        memory: [],
        frames: frame([ref("prices", 1), ref("entry", 2), s("name", "tea"), n("price", 12), ref("totals", 3), ref("fixed", 1)]),
        heap: [nums(1, [12, 30, 8]), tuple, nums(3, [24, 60, 16])],
        output: ["3 tea 12 16"],
      },
      {
        line: null,
        say: "بعد محو الأنواع: tuple مصفوفة عادية طولها 2، و readonly اختفت. الملصقات حمتك قبل التشغيل، والكومة بقيت كما في JavaScript.",
        memory: [],
        frames: frame([ref("prices", 1), ref("entry", 2), ref("totals", 3), ref("fixed", 1)]),
        heap: [nums(1, [12, 30, 8]), tuple, nums(3, [24, 60, 16])],
      },
    ],
    notes: {
      ts: "number[] و Array<number> الشيء نفسه. و [string, number] نوع tuple: طول ثابت ونوع لكل موضع. و readonly يمنع التغيير من خلال هذا الاسم فقط.",
    },
  },
  playground: {
    kind: "trace",
    intro: "مصفوفة JavaScript بلا ملصق تقبل أي شيء. هنا يدخل سعر كنص من نموذج. شغّل وراقب المجموع خانة بخانة.",
    starter: `let prices = [12, 30];
prices.push("8");
let total = 0;
for (let i = 0; i < prices.length; i++) {
  total = total + prices[i];
}
console.log(total);
let entry = ["tea", 12];
console.log(entry[2]);`,
    challenges: [
      "قبل التشغيل: ماذا سيكون total بعد الخانة الثالثة؟ لماذا ليس 50؟",
      "مع const prices: number[]، أي سطر كان TypeScript سيرفضه؟",
      "أصلح السطر الثاني إلى prices.push(Number(\"8\")) وشغّل.",
      "entry[2] يطبع undefined. مع [string, number] كان tsc سيقول: Tuple type of length '2' has no element at index '2'.",
    ],
  },
  predict: [
    {
      question: "ماذا يقول tsc عن السطر 2؟",
      code: `const prices: number[] = [1, 2];
prices.push("3");`,
      options: ["Argument of type 'string' is not assignable to parameter of type 'number'", "لا خطأ: push تقبل أي شيء", "لا خطأ، و \"3\" تتحوّل إلى 3"],
      answer: 0,
      why: "push في مصفوفة number[] تقبل number فقط: الملصق يحرس كل خانة ستُضاف، لا الموجودة فقط.",
      scene: check(
        `const prices: number[] = [1, 2];
prices.push("3");`,
        [
          { line: 1, say: "كل خانة رقم.", memory: [label("prices", "number[]")] },
          { line: 2, say: "push(\"3\") تحاول إدخال نص. خط أحمر.", memory: [label("prices", "number[]")], error: "Argument of type 'string' is not assignable to parameter of type 'number'." },
        ],
      ),
    },
    {
      question: "لم نكتب نوعاً. هل يقبل tsc السطر 2؟",
      code: `const items = [1, "two"];
items.push(true);`,
      options: ["لا: items نوعها (string | number)[]", "نعم: لم نكتب نوعاً فكل شيء مسموح", "لا: items نوعها [number, string]"],
      answer: 0,
      why: "من القيم الأولى يستنتج المدقّق مصفوفة كل خانة فيها نص أو رقم، لا tuple. و true ليست من الاثنين.",
      scene: check(
        `const items = [1, "two"];
items.push(true);`,
        [
          { line: 1, say: "رقم ونص، فالملصق: (string | number)[].", memory: [label("items", "(string | number)[]")] },
          { line: 2, say: "true منطقية، ليست في القائمة.", memory: [label("items", "(string | number)[]")], error: "Argument of type 'boolean' is not assignable to parameter of type 'string | number'." },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc عن السطر 2؟",
      code: `const point: [number, number] = [3, 4];
console.log(point[2]);`,
      options: ["لا يوجد عنصر في الموضع 2", "لا خطأ، ويُطبع undefined", "لا خطأ، ويُطبع 0"],
      answer: 0,
      why: "tuple يحفظ طوله في النوع: [number, number] موضعان فقط، 0 و 1. القراءة من الموضع 2 خطأ يعرفه المدقّق قبل التشغيل.",
      scene: check(
        `const point: [number, number] = [3, 4];
console.log(point[2]);`,
        [
          { line: 1, say: "tuple طوله 2: موضع 0 رقم، وموضع 1 رقم.", memory: [label("point", "[number, number]")] },
          { line: 2, say: "الموضع 2 غير موجود في النوع.", memory: [label("point", "[number, number]")], error: "Tuple type '[number, number]' of length '2' has no element at index '2'." },
        ],
      ),
    },
  ],
  code: {
    intro: "سلة كما تُكتب في مشروع حقيقي: مصفوفة من tuples بأسماء للمواضع، وقراءتها بـ map و reduce، وفرز نسخة منها حتى لا تتغيّر الأصلية، وقائمة readonly.",
    runnerLang: "ts",
    runnerStarter: `type Entry = [name: string, qty: number];
const cart: Entry[] = [
  ["tea", 2],
  ["cake", 1],
  ["mug", 3],
];
const names: string[] = cart.map((e) => e[0]);
const count = cart.reduce((sum, e) => sum + e[1], 0);
const byQty = [...cart].sort((a, b) => b[1] - a[1]);
const menu: readonly string[] = ["tea", "coffee"];
console.log(names.join(", "), count);
console.log(byQty[0], cart[0]);
console.log(menu.includes("tea"), menu.length);
// try: add ["water", 5] to cart. Which item is first in byQty now?
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "مصفوفة أرقام ومجموعها",
      prompt: "رتّب الأسطر: مصفوفة، ثم إضافة، ثم مجموع بحلقة. الناتج: 3 30",
      lines: ["const prices: number[] = [5, 10];", "prices.push(15);", "let total = 0;", "for (const p of prices) {", "  total += p;", "}", "console.log(prices.length, total);"],
      expected: "3 30",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "الموضع يحدد المعنى",
      prompt: "entry زوج [اسم، سعر]. أي تعبير يطبع: tea costs 4",
      template: `const entry: [string, number] = ["tea", 4];
console.log(___);`,
      options: ['entry[0] + " costs " + entry[1]', 'entry[1] + " costs " + entry[0]', '"tea costs " + entry.length'],
      expected: "tea costs 4",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "أسعار من نموذج",
      prompt: "الأسعار وصلت نصوصاً، و any[] سمح بها في number[]، فالمجموع يطبع 012308. حوّلها إلى أرقام فعلاً ليُطبع 50.",
      code: `const fromForm: any[] = ["12", "30", "8"];
const prices: number[] = fromForm;
let total = 0;
for (const p of prices) {
  total += p;
}
console.log(total);`,
      expected: "50",
      hint: "حوّل كل خانة: fromForm.map((x) => Number(x)).",
      solution: `const fromForm: any[] = ["12", "30", "8"];
const prices: number[] = fromForm.map((x) => Number(x));
let total = 0;
for (const p of prices) {
  total += p;
}
console.log(total);`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "الأرخص",
      prompt: "اكتب cheapest(items: [string, number][]): string ترجع اسم العنصر الأقل سعراً. اطبع cheapest([[\"tea\", 8], [\"cake\", 15], [\"water\", 3]]): water",
      starter: "// write cheapest here, then print the call\n",
      expected: "water",
      hint: "ابدأ بـ let best = items[0]; ثم مرّ على العناصر، وإذا كان item[1] < best[1] فاجعل best = item. وأرجع best[0].",
      solution: `function cheapest(items: [string, number][]): string {
  let best = items[0];
  for (const item of items) {
    if (item[1] < best[1]) {
      best = item;
    }
  }
  return best[0];
}
console.log(cheapest([["tea", 8], ["cake", 15], ["water", 3]]));`,
    },
  ],
  quiz: [
    {
      question: "ما نوع names كما يستنتجه tsc؟",
      code: "const ids = [1, 2, 3];\nconst names = ids.map((id) => \"user\" + id);",
      options: ["string[]", "number[]", "any[]"],
      answer: 0,
      why: "map تبني مصفوفة من نتائج الدالة، والدالة ترجع \"user\" + رقم، أي نصاً. فالنتيجة string[]، والأصلية تبقى number[].",
    },
    {
      question: "يمر من tsc بلا خطأ. ماذا يُطبع؟",
      code: "const xs: number[] = [1, 2];\nconst x: number = xs[5];\nconsole.log(x);",
      options: ["undefined", "0", "خطأ عند التشغيل"],
      answer: 0,
      why: "number[] لا تحفظ الطول، فالمدقّق يفترض أن أي خانة رقم. عند التشغيل لا خانة 5، فيُطبع undefined. الإعداد noUncheckedIndexedAccess يجعل نوعها number | undefined ويمسك هذا.",
    },
    {
      question: "ماذا يقول tsc عن السطر 2؟",
      code: 'const menu: readonly string[] = ["tea"];\nmenu.push("coffee");',
      options: ["Property 'push' does not exist on type 'readonly string[]'", "لا خطأ: const يسمح بتغيير المحتوى", "لا خطأ، لكن push لا تفعل شيئاً"],
      answer: 0,
      why: "readonly string[] ملصق بلا أي دالة تغيّر المصفوفة: لا push ولا pop ولا sort، ولا كتابة في خانة. القراءة مسموحة كلها.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: "const a: number[] = [1];\nconst b: readonly number[] = a;\na.push(2);\nconsole.log(b.length);",
      options: ["2", "1", "خطأ: b للقراءة فقط"],
      answer: 0,
      why: "b ليس نسخة: هو سهم ثانٍ إلى المصفوفة نفسها في الكومة. readonly يمنع التغيير من خلال b فقط، و a ما زال يستطيع. فطولها 2 من أي سهم قرأته.",
    },
    {
      question: "ماذا يقول tsc عن هذا السطر؟",
      code: 'const e: [string, number] = [12, "tea"];',
      options: ["Type 'number' is not assignable to type 'string'", "لا خطأ: فيها نص ورقم", "لا خطأ، والترتيب لا يهم"],
      answer: 0,
      why: "في tuple لكل موضع نوعه. الموضع 0 يجب أن يكون نصاً و 12 رقم. الترتيب جزء من النوع، وهذا ما يجعل [name, price] آمناً.",
    },
  ],
  next: "ts-literals",
};
