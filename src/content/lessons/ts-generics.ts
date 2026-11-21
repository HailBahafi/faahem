import type { Cell, Lesson, Scene } from "@/lib/types";

const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

export const tsGenerics: Lesson = {
  slug: "ts-generics",
  stage: 0,
  number: "2.1",
  title: "Generics",
  subtitle: "ملصق فيه فراغ اسمه T، يملؤه المدقّق عند كل استدعاء",
  minutes: 22,
  problem: {
    title: "دالة واحدة لكل الأنواع، بلا أن تنسى النوع",
    body: "الدالة نفسها تستقبل رقماً أو نصاً أو كائناً وترجعه. اختر ما تمرّره، ثم بدّل بين النسختين: any و <T>. ماذا يعرف المدقّق عن الناتج في كل نسخة؟ ومن ينهار عند التشغيل؟",
    demo: "tsGenerics",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `function first<T>(items: T[]): T | undefined {
  return items[0];
}
const n = first([10, 20]);
const s = first(["sara", "omar"]);
const x = first<boolean>([]);
console.log(n, s, x);`,
    },
    steps: [
      {
        line: null,
        say: "نريد دالة ترجع أول عنصر من أي مصفوفة. لو كتبنا number[] لعملت مع الأرقام فقط، ولو كتبنا any لنسي المدقّق ما رجع. الحل: فراغ في الملصق.",
        memory: [],
      },
      {
        line: 1,
        say: "<T> يعلن معامل نوع: فراغ اسمه T. التوقيع يقول: تأخذ مصفوفة من T، وترجع T أو undefined. لا أحد يعرف T بعد.",
        memory: [label("T", "?"), label("first", "<T>(items: T[]) => T | undefined")],
      },
      {
        line: 4,
        say: "الاستدعاء first([10, 20]): المدقّق ينظر إلى الوسيط، يرى number[]، فيملأ الفراغ: T = number لهذا الاستدعاء وحده.",
        memory: [label("T", "number"), { name: "items", value: "[10, 20]", type: "none" }],
        changed: ["T"],
      },
      {
        line: 2,
        say: "عند التشغيل لا يوجد T أصلاً: items[0] تقرأ 10. والمدقّق كتب على n الملصق number | undefined، من التوقيع لا من القيمة.",
        memory: [label("tsc sees n as", "number | undefined"), { name: "n", value: "10", type: "number" }],
        changed: ["n"],
      },
      {
        line: 5,
        say: "استدعاء جديد، فراغ جديد: الوسيط string[]، إذن T = string هذه المرة. الدالة نفسها، والملصق مختلف.",
        memory: [
          label("tsc sees n as", "number | undefined"),
          { name: "n", value: "10", type: "number" },
          label("tsc sees s as", "string | undefined"),
          { name: "s", value: '"sara"', type: "string" },
        ],
        changed: ["s"],
      },
      {
        line: 6,
        say: "المصفوفة الفارغة لا تكشف شيئاً، فنملأ الفراغ بيدنا: first<boolean>. الدرج x يحمل undefined، والملصق boolean | undefined.",
        memory: [
          { name: "n", value: "10", type: "number" },
          { name: "s", value: '"sara"', type: "string" },
          label("tsc sees x as", "boolean | undefined"),
          { name: "x", value: "undefined", type: "none" },
        ],
        changed: ["x"],
      },
      {
        line: 7,
        say: "يُطبع 10 sara undefined.",
        memory: [
          { name: "n", value: "10", type: "number" },
          { name: "s", value: '"sara"', type: "string" },
          { name: "x", value: "undefined", type: "none" },
        ],
        read: ["n", "s", "x"],
        output: ["10 sara undefined"],
      },
      {
        line: null,
        say: "بعد حذف الأنواع يبقى function first(items) { return items[0]; }: دالة واحدة في الذاكرة. T كان ورقة عمل للمدقّق فقط، يملؤها من جديد عند كل استدعاء.",
        memory: [],
      },
    ],
    notes: {
      ts: "Generics لا تنشئ نسخة لكل نوع ولا تفحص شيئاً وقت التشغيل: هي متغيرات على مستوى الأنواع، يربط بها المدقّق ما يدخل بما يخرج.",
    },
  },
  playground: {
    kind: "trace",
    intro: "هذه الدوال كما تبقى بعد حذف الأنواع: JavaScript عادية تعمل مع أي قيمة. شغّل، وفكّر في كل سطر: بماذا كان المدقّق سيملأ T؟",
    starter: `function first(items) {
  return items[0];
}
function last(items) {
  return items[items.length - 1];
}
function pair(a, b) {
  return [a, b];
}
console.log(first([10, 20]));
console.log(last(["tea", "cake"]));
console.log(pair("sara", 20));`,
    challenges: [
      "في TypeScript نكتب last<T>(items: T[]): T | undefined. ما نوع last([\"tea\", \"cake\"]) عند المدقّق؟",
      "pair له فراغان: pair<A, B>(a: A, b: B): [A, B]. ما الذي يملأ A و B في pair(\"sara\", 20)؟",
      "جرّب last([]). ماذا يطبع؟ ولماذا يكتب التوقيع T | undefined لا T وحده؟",
      "اكتب دالة middle(items) ترجع العنصر الأوسط، ثم اكتب توقيعها في رأسك بـ <T>.",
    ],
  },
  predict: [
    {
      question: "ماذا يقول tsc عن السطر 5؟",
      code: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
console.log(longest("tea", "cake"));
longest(10, 20);`,
      options: [
        "Argument of type 'number' is not assignable to parameter of type '{ length: number; }'",
        "لا خطأ: T يقبل أي شيء",
        "لا خطأ، ويرجع undefined",
      ],
      answer: 0,
      why: "extends قيد على الفراغ: T يجب أن يكون شيئاً له length. النص له length فالسطر 4 مقبول، والرقم ليس له، فيُرفض عند الباب قبل أن يعمل شيء.",
      scene: check(
        `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
console.log(longest("tea", "cake"));
longest(10, 20);`,
        [
          { line: 1, say: "T فراغ مقيّد: أي نوع، بشرط أن يملك length من نوع number.", memory: [label("T must have", "{ length: number }")] },
          { line: 4, say: "نصان: لكل منهما length. الشرط متحقق، و T نص.", memory: [label("T", "string")] },
          { line: 5, say: "10 لا length له. الشرط لم يتحقق: خط أحمر عند الوسيط الأول.", memory: [label("T must have", "{ length: number }")], error: "Argument of type 'number' is not assignable to parameter of type '{ length: number; }'." },
        ],
      ),
    },
    {
      question: "يمر هذا الكود من tsc بلا أي خطأ. ماذا يحدث عند تشغيله؟",
      code: `function keep(value: any): any {
  return value;
}
const price = keep(42);
console.log(price.toUpperCase());`,
      options: ["ينهار: price.toUpperCase is not a function", "يطبع 42", "يطبع \"42\""],
      answer: 0,
      why: "any يطفئ المدقّق: ما يخرج من keep لا ملصق له، فيسمح بأي شيء. لو كتبنا keep<T>(value: T): T لعرف أن price رقم، ولرفض toUpperCase قبل التشغيل.",
      scene: check(
        `function keep(value: any): any {
  return value;
}
const price = keep(42);
console.log(price.toUpperCase());`,
        [
          { line: 4, say: "keep ترجع any: المدقّق نسي أن الداخل كان رقماً.", memory: [label("tsc sees price as", "any"), { name: "price", value: "42", type: "number" }] },
          { line: 5, say: "على any كل شيء مسموح، فلا خط أحمر. لكن الدرج يحمل رقماً، ولا toUpperCase للأرقام.", memory: [{ name: "price", value: "42", type: "number" }], error: "TypeError: price.toUpperCase is not a function" },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc عن السطر 5؟",
      code: `function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: "Sara", age: 20 };
get(user, "email");`,
      options: [
        "Argument of type '\"email\"' is not assignable to parameter of type '\"name\" | \"age\"'",
        "لا خطأ، ويرجع undefined",
        "Property 'email' is missing",
      ],
      answer: 0,
      why: "keyof T قائمة أسماء حقول T: \"name\" | \"age\". فالفراغ K مقيّد بها، و \"email\" ليس منها. و T[K] يعني: نوع ذلك الحقل بالذات، فـ get(user, \"age\") ملصقها number.",
      scene: check(
        `function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: "Sara", age: 20 };
get(user, "email");`,
        [
          { line: 4, say: "نوع user: { name: string; age: number }.", memory: [label("user", "{ name: string; age: number }")] },
          { line: 5, say: "T = نوع user، إذن keyof T = \"name\" | \"age\". و K يجب أن يكون واحداً منها.", memory: [label("keyof T", "\"name\" | \"age\"")] },
          { line: 5, say: "\"email\" ليس في القائمة: خط أحمر قبل التشغيل.", memory: [label("keyof T", "\"name\" | \"age\"")], error: "Argument of type '\"email\"' is not assignable to parameter of type '\"name\" | \"age\"'." },
        ],
      ),
    },
  ],
  code: {
    intro: "Generics في كود حقيقي: دالة تجمع العناصر حسب مفتاح (يستعملها كل تقرير)، و interface عام Page<T> لنتيجة API مقسّمة إلى صفحات، وقيمة افتراضية للفراغ. غيّر البيانات وراقب أن الدوال لا تتغيّر.",
    runnerLang: "ts",
    runnerStarter: `function groupBy<T, K extends string>(items: T[], keyOf: (item: T) => K): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyOf(item);
    (groups[key] ??= []).push(item);
  }
  return groups;
}

interface Order {
  id: number;
  status: "paid" | "pending";
  total: number;
}
const orders: Order[] = [
  { id: 1, status: "paid", total: 120 },
  { id: 2, status: "pending", total: 80 },
  { id: 3, status: "paid", total: 45 },
];
const byStatus = groupBy(orders, (o) => o.status);
console.log(byStatus.paid.length, byStatus.pending.length);

// A generic interface: one shape for every paged API answer.
interface Page<T, Cursor = number> {
  items: T[];
  next: Cursor | null;
}
const page: Page<string> = { items: ["tea", "cake"], next: 2 };
console.log(page.items.join(", "), page.next);

// try: group the words below by their first letter.
const words = ["apple", "avocado", "banana"];
console.log(groupBy(words, (w) => w[0]));
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "آخر عنصر من أي مصفوفة",
      prompt: "رتّب دالة last<T> ثم استدعها مرتين. الناتج: cake ثم 3",
      lines: [
        "function last<T>(items: T[]): T | undefined {",
        "  return items[items.length - 1];",
        "}",
        'console.log(last(["tea", "cake"]));',
        "console.log(last([1, 2, 3]));",
      ],
      expected: "cake\n3",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "اقطف حقلاً",
      prompt: "pluck تأخذ مصفوفة كائنات واسم حقل، وترجع قيم ذلك الحقل. أي تعبير يطبع Sara,Omar؟",
      template: `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => ___);
}
const users = [{ name: "Sara", age: 20 }, { name: "Omar", age: 31 }];
console.log(pluck(users, "name").join(","));`,
      options: ["item[key]", "item.key", "key"],
      expected: "Sara,Omar",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "الصفر ليس غياباً",
      prompt: "firstOr ترجع أول عنصر، أو البديل إن كانت المصفوفة فارغة. لكنها ترجع البديل للمصفوفة [0, 5] أيضاً. أصلحها ليُطبع 0 ثم 9",
      code: `function firstOr<T>(items: T[], fallback: T): T {
  return items[0] || fallback;
}
console.log(firstOr([0, 5], 9));
console.log(firstOr([], 9));`,
      expected: "0\n9",
      hint: "|| يستبدل كل قيمة كاذبة، و 0 منها. اسأل عن الطول: items.length > 0 ? items[0] : fallback",
      solution: `function firstOr<T>(items: T[], fallback: T): T {
  return items.length > 0 ? items[0] : fallback;
}
console.log(firstOr([0, 5], 9));
console.log(firstOr([], 9));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "zip بفراغين",
      prompt: "اكتب zip<A, B>(as: A[], bs: B[]): [A, B][] التي تقرن العناصر بالترتيب وتتوقف عند أقصر المصفوفتين. ثم اطبع JSON.stringify(zip([1, 2, 3], [\"a\", \"b\"])): [[1,\"a\"],[2,\"b\"]]",
      starter: "// write zip<A, B> here, then print JSON.stringify(zip([1, 2, 3], [\"a\", \"b\"]))\n",
      expected: '[[1,"a"],[2,"b"]]',
      hint: "const n = Math.min(as.length, bs.length); ثم حلقة تدفع [as[i], bs[i]] إلى مصفوفة جديدة.",
      solution: `function zip<A, B>(as: A[], bs: B[]): [A, B][] {
  const n = Math.min(as.length, bs.length);
  const out: [A, B][] = [];
  for (let i = 0; i < n; i++) {
    out.push([as[i], bs[i]]);
  }
  return out;
}
console.log(JSON.stringify(zip([1, 2, 3], ["a", "b"])));`,
    },
  ],
  quiz: [
    {
      question: "ما نوع v عند المدقّق؟",
      code: 'function first<T>(items: T[]): T | undefined {\n  return items[0];\n}\nconst v = first([1, "a"]);',
      options: ["string | number | undefined", "number | undefined", "any"],
      answer: 0,
      why: "المصفوفة [1, \"a\"] نوعها (string | number)[]، فيملأ المدقّق T = string | number. ثم يضيف التوقيع undefined، لأن المصفوفة قد تكون فارغة.",
    },
    {
      question: "ماذا يقول tsc عن السطر 4؟",
      code: 'function wrap<T>(value: T) {\n  return { value };\n}\nwrap("hi").value.toFixed(1);',
      options: ["Property 'toFixed' does not exist on type 'string'", "لا خطأ: value من نوع T", "لا خطأ، وينهار عند التشغيل"],
      answer: 0,
      why: "T امتلأ بـ string من \"hi\"، والدالة ترجع { value: T }، فالمدقّق يعرف أن value نص، و toFixed للأرقام. الفراغ لا يضيّع النوع؛ هذا كل فضله على any.",
    },
    {
      question: "ماذا يقول tsc؟",
      code: 'interface Box<T> {\n  content: T;\n}\nconst b: Box<number> = { content: "5" };',
      options: ["Type 'string' is not assignable to type 'number'", "لا خطأ: \"5\" يمكن تحويله إلى رقم", "Box is not generic"],
      answer: 0,
      why: "Box<number> يملأ الفراغ في الـ interface، فيصير content: number. و \"5\" نص، والمدقّق لا يحوّل الأنواع من تلقاء نفسه.",
    },
    {
      question: "ماذا يبقى من هذه الدالة بعد أن يحذف tsc الأنواع؟",
      code: "function pair<A, B>(a: A, b: B): [A, B] {\n  return [a, b];\n}",
      options: ["function pair(a, b) { return [a, b]; }", "دالتان: واحدة لـ A وواحدة لـ B", "دالة تفحص نوع a و b عند كل استدعاء"],
      answer: 0,
      why: "A و B موجودان عند المدقّق فقط. لا نسخ لكل نوع ولا فحص وقت التشغيل: الذي يعمل دالة JavaScript واحدة.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: "function count<T>(items: T[], test: (item: T) => boolean): number {\n  let n = 0;\n  for (const item of items) {\n    if (test(item)) n++;\n  }\n  return n;\n}\nconsole.log(count([3, 8, 10, 1], (x) => x > 5));",
      options: ["2", "4", "18"],
      answer: 0,
      why: "T امتلأ بـ number، فعرف المدقّق أن x رقم دون أن نكتب ذلك. عند التشغيل: 8 و 10 أكبر من 5، فالعدد 2.",
    },
  ],
  next: "ts-utility",
};
