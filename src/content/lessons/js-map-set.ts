import type { Cell, Lesson } from "@/lib/types";

const c = (name: string, value: string): Cell => ({ name, value, type: "none" });
const num = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

const people = [c("sara", '#1 { name: "Sara" }'), c("omar", '#2 { name: "Omar" }')];
const visits1 = c("visits", "Map(2) { #1 → 1, #2 → 1 }");
const visits2 = c("visits", "Map(2) { #1 → 2, #2 → 1 }");
const plain = c("plain", '{ "[object Object]": 1 }');

export const jsMapSet: Lesson = {
  slug: "js-map-set",
  stage: 0,
  number: "2.8",
  title: "Map و Set",
  subtitle: "جداول تعرف مفاتيحها بهويتها لا باسمها",
  minutes: 22,
  problem: {
    title: "زائران بمفتاح واحد",
    body: "نعدّ زيارات كل مستخدم، والمستخدم كائن. اضغط على Sara ثم Omar عدة مرات، وقارن العدّاد في الكائن العادي بالعدّاد في Map.",
    demo: "jsMapSet",
  },
  singleLanguage: true,
  scene: {
    code: {
      js: `const sara = { name: "Sara" };
const omar = { name: "Omar" };
const visits = new Map();
visits.set(sara, 1).set(omar, 1);
visits.set(sara, visits.get(sara) + 1);
const plain = {};
plain[sara] = 1; plain[omar] = 1;
const ids = new Set([1, 2, 2, "2"]);
console.log(visits.get(sara), visits.size, Object.keys(plain).length, ids.size);`,
    },
    steps: [
      {
        line: null,
        say: "الكائن العادي جدول مفاتيحه نصوص فقط. Map جدول مفاتيحه أي قيمة، حتى كائن أو دالة. و Set جدول مفاتيح بلا قيم.",
        memory: [],
      },
      {
        line: 1,
        say: "كائنان في الكومة، #1 و #2. الدرج sara يحمل عنوان #1، وهذا العنوان هو هوية الكائن.",
        memory: people,
        changed: ["sara", "omar"],
      },
      {
        line: 3,
        say: "Map فارغة. هي داخلياً جدول تجزئة: من المفتاح يُحسب موضعه، فالإضافة والبحث سريعان مهما كبرت.",
        memory: [...people, c("visits", "Map(0) {}")],
        changed: ["visits"],
      },
      {
        line: 4,
        say: "المفتاح هو الكائن نفسه (#1)، لا نصّ منه. و set ترجع الـ Map نفسها، فيمكن تسلسل set ثانية: #2 → 1.",
        memory: [...people, visits1],
        changed: ["visits"],
      },
      {
        line: 5,
        say: "get(sara) تبحث عن المفتاح #1 بالمقارنة ===: نفس العنوان، فتجد 1. ثم set على مفتاح موجود تستبدل قيمته: 2. الحجم يبقى 2.",
        memory: [...people, visits2],
        changed: ["visits"],
        read: ["sara"],
      },
      {
        line: 7,
        say: "الكائن العادي يحوّل المفتاح إلى نص قبل الحفظ. String(sara) هو \"[object Object]\"، فالمفتاح نص لا هوية.",
        memory: [...people, visits2, plain],
        changed: ["plain"],
      },
      {
        line: 7,
        say: "omar يتحوّل إلى النص نفسه \"[object Object]\"، فيكتب فوق خانة sara. شخصان صارا مفتاحاً واحداً.",
        memory: [...people, visits2, plain],
        changed: ["plain"],
      },
      {
        line: 8,
        say: "Set تمرّ على المصفوفة وتضيف كل قيمة لم تجدها: 1، ثم 2، ثم 2 موجودة فتُتجاهل، ثم \"2\" نص، و \"2\" === 2 خطأ، فتدخل.",
        memory: [...people, visits2, plain, c("ids", 'Set(3) { 1, 2, "2" }')],
        changed: ["ids"],
      },
      {
        line: 9,
        say: "يُطبع 2 2 1 3: زيارتان لـ sara، ومفتاحان في Map، ومفتاح واحد ضائع في الكائن، وثلاث قيم مختلفة في Set.",
        memory: [...people, visits2, plain, c("ids", 'Set(3) { 1, 2, "2" }')],
        read: ["visits", "plain", "ids"],
        output: ["2 2 1 3"],
      },
      {
        line: null,
        say: "الصورة: Map و Set تقارنان المفاتيح كما تقارن ===: الأرقام والنصوص بقيمتها، والكائنات بعنوانها. وتحفظان ترتيب الإضافة، وتعرفان حجمهما بـ size.",
        memory: [...people, visits2, plain, c("ids", 'Set(3) { 1, 2, "2" }')],
      },
    ],
    notes: {
      js: "استعمل الكائن العادي لسجلّ بخاصيات معروفة (user.name)، و Map لجدول تُضاف إليه مفاتيح وتُحذف أثناء التشغيل. و Set لسؤال واحد سريع: هل رأيت هذه القيمة؟",
    },
  },
  playground: {
    kind: "trace",
    intro: "Map مبسّطة بيدك: مصفوفة أزواج { key, value } والمقارنة بـ ===. شغّل وراقب: twin يشبه sara تماماً، لكنه كائن آخر في عنوان آخر. (Map الحقيقية جدول تجزئة لا يمرّ على كل الأزواج، لكن قاعدة المقارنة نفسها.)",
    starter: `const pairs = [];
function mapSet(key, value) {
  for (const p of pairs) {
    if (p.key === key) {
      p.value = value;
      return;
    }
  }
  pairs.push({ key: key, value: value });
}
function mapGet(key) {
  for (const p of pairs) {
    if (p.key === key) {
      return p.value;
    }
  }
  return undefined;
}
const sara = { name: "Sara" };
const twin = { name: "Sara" };
mapSet(sara, 1);
mapSet(sara, 2);
mapSet(twin, 5);
console.log(pairs.length, mapGet(sara), mapGet(twin));`,
    challenges: [
      "قبل التشغيل: كم زوجاً في pairs في النهاية، ولماذا ليس 1؟",
      "اجعل twin = sara بدل كائن جديد. كم زوجاً الآن، وماذا تعيد mapGet(sara)؟",
      "استعمل نصوصاً مفاتيح: mapSet(\"a\", 1) ثم mapSet(\"a\", 2). النصوص تُقارن بقيمتها.",
      "اكتب setAdd(value) بالفكرة نفسها: مصفوفة قيم، وأضف فقط إذا لم تجد القيمة بـ ===.",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع؟",
      code: `const s = new Set([{ id: 1 }, { id: 1 }]);
console.log(s.size);`,
      options: ["2", "1", "0"],
      answer: 0,
      why: "كل { } تبني كائناً جديداً بعنوان جديد. الكائنان متشابهان في المحتوى، مختلفان في الهوية، و Set تقارن بالهوية.",
      scene: {
        code: { js: "const s = new Set([{ id: 1 }, { id: 1 }]);\nconsole.log(s.size);" },
        steps: [
          { line: 1, say: "كائنان: #1 و #2. يدخل #1.", memory: [c("s", "Set(1) { #1 }")] },
          { line: 1, say: "#2 === #1؟ لا، عنوانان مختلفان، فيدخل.", memory: [c("s", "Set(2) { #1, #2 }")], changed: ["s"] },
          { line: 2, say: "الحجم 2.", memory: [c("s", "Set(2) { #1, #2 }")], output: ["2"] },
        ],
      },
    },
    {
      question: "ماذا يطبع؟",
      code: `const m = new Map();
m.set("1", "text");
m.set(1, "number");
console.log(m.size);`,
      options: ["2", "1"],
      answer: 0,
      why: "Map لا تحوّل المفاتيح: \"1\" نص و 1 رقم، و \"1\" === 1 خطأ، فهما مفتاحان. في كائن عادي كانا سيصيران نصاً واحداً \"1\".",
      scene: {
        code: { js: "const m = new Map();\nm.set(\"1\", \"text\");\nm.set(1, \"number\");\nconsole.log(m.size);" },
        steps: [
          { line: 2, say: "المفتاح النص \"1\".", memory: [c("m", 'Map(1) { "1" → "text" }')], changed: ["m"] },
          { line: 3, say: "المفتاح الرقم 1 مختلف عنه، فخانة جديدة.", memory: [c("m", 'Map(2) { "1" → "text", 1 → "number" }')], changed: ["m"] },
          { line: 4, say: "الحجم 2.", memory: [c("m", 'Map(2) { "1" → "text", 1 → "number" }')], output: ["2"] },
        ],
      },
    },
    {
      question: "ماذا يطبع؟",
      code: `const m = new Map();
m["x"] = 5;
console.log(m.size, m.get("x"));`,
      options: ["0 undefined", "1 5", "0 5"],
      answer: 0,
      why: "m[\"x\"] = 5 تضع خاصية على كائن Map نفسه كأي كائن، ولا تمرّ بجدوله. الجدول لا يُقرأ ويُكتب إلا بـ get و set.",
      scene: {
        code: { js: "const m = new Map();\nm[\"x\"] = 5;\nconsole.log(m.size, m.get(\"x\"));" },
        steps: [
          { line: 1, say: "Map فارغة.", memory: [c("m", "Map(0) {}"), c("m.x", "—")] },
          { line: 2, say: "خاصية عادية x على الكائن. الجدول ما زال فارغاً.", memory: [c("m", "Map(0) {}"), c("m.x", "5")], changed: ["m.x"] },
          { line: 3, say: "size = 0، و get تبحث في الجدول فلا تجد.", memory: [c("m", "Map(0) {}"), c("m.x", "5")], output: ["0 undefined"] },
        ],
      },
    },
  ],
  code: {
    intro: "أعمال يومية حقيقية: إزالة التكرار بـ Set، وعدّ الكلمات وتجميع الطلبات بـ Map، والتقاطع بين مجموعتين، وتحويل Map إلى كائن قبل JSON. شغّل ثم جرّب.",
    runnerStarter: `const emails = ["a@x.com", "b@x.com", "a@x.com", "c@x.com", "b@x.com"];
const unique = [...new Set(emails)];
console.log(unique.length, unique);

const text = "the cat and the dog and the bird";
const counts = new Map();
for (const word of text.split(" ")) {
  counts.set(word, (counts.get(word) ?? 0) + 1);
}
console.log(counts.get("the"), counts.size);
const top = [...counts].sort((a, b) => b[1] - a[1])[0];
console.log("most common:", top);

const orders = [
  { customer: "Sara", total: 50 },
  { customer: "Omar", total: 20 },
  { customer: "Sara", total: 30 },
];
const byCustomer = new Map();
for (const o of orders) {
  if (!byCustomer.has(o.customer)) byCustomer.set(o.customer, []);
  byCustomer.get(o.customer).push(o.total);
}
console.log(byCustomer.get("Sara"));

const mine = new Set(["js", "py", "go"]);
const yours = new Set(["go", "rust", "js"]);
const both = [...mine].filter((x) => yours.has(x));
console.log(both);

console.log(JSON.stringify(counts));
console.log(JSON.stringify(Object.fromEntries(counts)));
// try: count the words of your own sentence. Why does Map keep them in the order they first appeared?
`,
  },
  exercises: [
    {
      kind: "order",
      title: "عدّ الأصوات",
      prompt: "رتّب الأسطر: جدول فارغ، ثم حلقة تعدّ كل صوت، ثم اطبع أصوات yes. الناتج: 3",
      lines: [
        'const votes = ["yes", "no", "yes", "yes"];',
        "const tally = new Map();",
        "for (const v of votes) {",
        "  tally.set(v, (tally.get(v) ?? 0) + 1);",
        "}",
        'console.log(tally.get("yes"));',
      ],
      expected: "3",
    },
    {
      kind: "fill",
      title: "بلا تكرار",
      prompt: "أي بنية تجعل البرنامج يطبع عدد العناوين المختلفة: 3",
      template: `const emails = ["a@x.com", "b@x.com", "a@x.com", "c@x.com", "b@x.com"];
const unique = [...new ___(emails)];
console.log(unique.length);`,
      options: ["Set", "Map", "Array"],
      expected: "3",
    },
    {
      kind: "fix",
      title: "سلّة لكل مستخدم",
      prompt: "الكائن العادي حوّل المستخدمَين إلى المفتاح نفسه، فطُبعت 5 بدل 3. استعمل Map حتى يطبع: 3 5",
      code: `const sara = { name: "Sara" };
const omar = { name: "Omar" };
const cart = {};
cart[sara] = 3;
cart[omar] = 5;
console.log(cart[sara], cart[omar]);`,
      expected: "3 5",
      hint: "const cart = new Map(); ثم cart.set(sara, 3) و cart.get(sara).",
      solution: `const sara = { name: "Sara" };
const omar = { name: "Omar" };
const cart = new Map();
cart.set(sara, 3);
cart.set(omar, 5);
console.log(cart.get(sara), cart.get(omar));`,
    },
    {
      kind: "write",
      title: "أول تكرار",
      prompt: "اكتب firstRepeat(list) ترجع أول قيمة تظهر للمرة الثانية، أو null إذا لم يتكرر شيء. استعمل Set لتتذكر ما رأيت. اطبع firstRepeat([\"a\", \"b\", \"c\", \"b\", \"a\"]) ثم firstRepeat([1, 2, 3]).",
      starter: "// function firstRepeat(list) { ... }\n",
      expected: "b\nnull",
      hint: "const seen = new Set(); ثم لكل x: إذا seen.has(x) فأرجعه، وإلا seen.add(x). وبعد الحلقة return null.",
      solution: `function firstRepeat(list) {
  const seen = new Set();
  for (const x of list) {
    if (seen.has(x)) {
      return x;
    }
    seen.add(x);
  }
  return null;
}
console.log(firstRepeat(["a", "b", "c", "b", "a"]));
console.log(firstRepeat([1, 2, 3]));`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: 'console.log(new Set("hello").size);',
      options: ["4", "5", "1"],
      answer: 0,
      why: "Set تمرّ على النص حرفاً حرفاً: h e l l o. الـ l الثانية موجودة فتُتجاهل، فيبقى 4.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'const m = new Map([[2, "b"], [1, "a"]]);\nconst o = { 2: "b", 1: "a" };\nconsole.log([...m.keys()].join(), Object.keys(o).join());',
      options: ["2,1 1,2", "2,1 2,1", "1,2 1,2"],
      answer: 0,
      why: "Map تحفظ ترتيب الإضافة دائماً. الكائن العادي يرتّب المفاتيح التي تشبه أرقاماً صحيحة تصاعدياً قبل غيرها.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'const m = new Map();\nm.set(NaN, "x");\nconsole.log(m.get(NaN));',
      options: ["x", "undefined"],
      answer: 0,
      why: "NaN === NaN خطأ، لكن Map تستعمل قاعدة SameValueZero: مثل === إلا أن NaN يساوي NaN. فالمفتاح يوجد.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'const m = new Map([["a", 1]]);\nconsole.log(JSON.stringify(m));',
      options: ["{}", '{"a":1}', '[["a",1]]'],
      answer: 0,
      why: "JSON.stringify يقرأ خاصيات الكائن، و Map تحفظ أزواجها في جدولها الداخلي لا في خاصيات. حوّلها أولاً: Object.fromEntries(m).",
    },
    {
      question: "ماذا يطبع؟",
      code: "const s = new Set([1, 2, 3]);\ns.add(2);\ns.delete(5);\nconsole.log(s.size, s.has(3));",
      options: ["3 true", "4 true", "2 false"],
      answer: 0,
      why: "add(2) لا تفعل شيئاً لأن 2 موجودة، و delete(5) لا تجد شيئاً تحذفه (وترجع false). يبقى 3 أعضاء، و 3 منها.",
    },
  ],
  next: "js-iterators",
};
