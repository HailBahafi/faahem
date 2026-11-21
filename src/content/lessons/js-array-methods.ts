import type { Frame, HeapObj, Lesson, Slot } from "@/lib/types";

const n = (name: string, value: number): Slot => ({ name, value: String(value), type: "number" });
const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
const nums = (id: number, values: number[]): HeapObj => ({ id, kind: "array", items: values.map((v, i) => n(String(i), v)) });
const frames = (globals: Slot[], callback?: { name: string; vars: Slot[] }): Frame[] =>
  callback ? [{ id: 0, name: "global", vars: globals }, { id: 1, name: callback.name, vars: callback.vars }] : [{ id: 0, name: "global", vars: globals }];

const cart = nums(1, [12, 30, 8]);

export const jsArrayMethods: Lesson = {
  slug: "js-array-methods",
  stage: 0,
  number: "2.6",
  title: "map و filter و reduce",
  subtitle: "حلقات جاهزة تنادي دالتك عند كل خانة",
  minutes: 22,
  problem: {
    title: "ثلاث حلقات في كل تقرير",
    body: "قائمة طلبات. شغّل المراحل الثلاث واحدة واحدة: اختر الطلبات، ثم حوّل أسعارها، ثم اجمعها. كل مرحلة حلقة كاملة كنت ستكتبها بيدك.",
    demo: "jsArrayMethods",
  },
  singleLanguage: true,
  scene: {
    code: {
      js: `const cart = [12, 30, 8];
const doubled = cart.map((p) => p * 2);
const big = cart.filter((p) => p >= 10);
const total = cart.reduce((sum, p) => sum + p, 0);
console.log(\`\${doubled} | \${big} | \${total}\`);
console.log(cart.length, cart[2]);`,
    },
    steps: [
      {
        line: null,
        say: "map و filter و reduce ليست سحراً: كل واحدة حلقة for مكتوبة داخل JavaScript. تمرّ على الخانات بالترتيب، وتنادي الدالة التي أعطيتها عند كل خانة.",
        memory: [],
      },
      {
        line: 1,
        say: "المصفوفة تُبنى في الكومة (#1)، و cart يحمل عنوانها.",
        memory: [],
        frames: frames([ref("cart", 1)]),
        heap: [cart],
        changedHeap: [1],
      },
      {
        line: 2,
        say: "map تنشئ أولاً مصفوفة جديدة فارغة (#2). ثم تنادي دالتك مع الخانة 0: إطار جديد فيه p = 12. الدالة ترجع 24، فتدفعه map إلى #2.",
        memory: [],
        frames: frames([ref("cart", 1)], { name: "(p) => p * 2", vars: [n("p", 12)] }),
        heap: [cart, nums(2, [24])],
        changedHeap: [2],
      },
      {
        line: 2,
        say: "الحلقة تكمل: p = 30 ثم p = 8، وفي كل مرة إطار جديد يرجع قيمة تُدفع. النتيجة بطول الأصل دائماً: 3 خانات دخلت، 3 خرجت.",
        memory: [],
        frames: frames([ref("cart", 1)], { name: "(p) => p * 2", vars: [n("p", 8)] }),
        heap: [cart, nums(2, [24, 60, 16])],
        changedHeap: [2],
      },
      {
        line: 2,
        say: "انتهت الحلقة، فتُرجع map عنوان #2 ويحمله doubled. لاحظ #1: لم تُكتب فيه خانة واحدة.",
        memory: [],
        frames: frames([ref("cart", 1), ref("doubled", 2)]),
        heap: [cart, nums(2, [24, 60, 16])],
      },
      {
        line: 3,
        say: "filter: دالتك هنا تجيب بنعم أو لا. 12 >= 10 نعم فتُنسخ الخانة، 30 نعم، 8 لا فتُترك. المصفوفة الجديدة #3 فيها خانتان فقط.",
        memory: [],
        frames: frames([ref("cart", 1), ref("doubled", 2), ref("big", 3)]),
        heap: [cart, nums(2, [24, 60, 16]), nums(3, [12, 30])],
        changedHeap: [3],
      },
      {
        line: 4,
        say: "reduce تحمل قيمة واحدة تتراكم اسمها هنا sum، وتبدأ بالـ 0 الذي أعطيته. أول نداء: sum = 0 و p = 12، فترجع الدالة 12.",
        memory: [],
        frames: frames([ref("cart", 1), ref("doubled", 2), ref("big", 3)], { name: "(sum, p) => sum + p", vars: [n("sum", 0), n("p", 12)] }),
        heap: [cart, nums(2, [24, 60, 16]), nums(3, [12, 30])],
      },
      {
        line: 4,
        say: "ما ترجعه الدالة يصير sum في النداء التالي: 12 + 30 = 42، ثم 42 + 8 = 50. هذا آخر نداء، و 50 هي النتيجة: قيمة واحدة لا مصفوفة.",
        memory: [],
        frames: frames([ref("cart", 1), ref("doubled", 2), ref("big", 3)], { name: "(sum, p) => sum + p", vars: [n("sum", 42), n("p", 8)] }),
        heap: [cart, nums(2, [24, 60, 16]), nums(3, [12, 30])],
      },
      {
        line: 5,
        say: "القالب يحوّل كل مصفوفة إلى نص بفواصل. ثلاث نتائج من مصفوفة واحدة.",
        memory: [],
        frames: frames([ref("cart", 1), ref("doubled", 2), ref("big", 3), n("total", 50)]),
        heap: [cart, nums(2, [24, 60, 16]), nums(3, [12, 30])],
        output: ["24,60,16 | 12,30 | 50"],
      },
      {
        line: 6,
        say: "cart ما زالت 3 خانات و cart[2] ما زالت 8. الدوال الثلاث تقرأ الأصل وتبني شيئاً جديداً، وهذا ما يجعلها آمنة لتسلسل الخطوات.",
        memory: [],
        frames: frames([ref("cart", 1), ref("doubled", 2), ref("big", 3), n("total", 50)]),
        heap: [cart, nums(2, [24, 60, 16]), nums(3, [12, 30])],
        output: ["24,60,16 | 12,30 | 50", "3 8"],
      },
      {
        line: null,
        say: "الصورة: map = حلقة تجمع كل ما ترجعه دالتك. filter = حلقة تنسخ الخانة حين ترجع دالتك قيمة صادقة. reduce = حلقة تمرّر ما ترجعه دالتك إلى النداء التالي.",
        memory: [],
        frames: frames([ref("cart", 1), ref("doubled", 2), ref("big", 3), n("total", 50)]),
        heap: [cart, nums(2, [24, 60, 16]), nums(3, [12, 30])],
      },
    ],
    notes: {
      js: "الدالة التي تعطيها لـ map تسمّى callback: أنت لا تناديها، الحلقة تناديها بثلاثة وسائط (الخانة، رقمها، المصفوفة). والسهم القصير (p) => p * 2 يُرجع ما بعده تلقائياً.",
    },
  },
  playground: {
    kind: "trace",
    intro: "هذه map و reduce مكتوبتان بيدك: حلقة عادية تنادي الدالة التي وصلتها كوسيط. شغّل وراقب الإطارات: كل نداء لـ fn إطار جديد فوق myMap، يرجع قيمة ثم يختفي.",
    starter: `function myMap(arr, fn) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(fn(arr[i], i));
  }
  return out;
}
function myReduce(arr, fn, start) {
  let acc = start;
  for (const x of arr) {
    acc = fn(acc, x);
  }
  return acc;
}
const prices = [12, 30, 8];
const withTax = myMap(prices, (p) => p * 2);
const total = myReduce(prices, (sum, p) => sum + p, 0);
console.log(withTax, total);`,
    challenges: [
      "قبل التشغيل: كم مرة سيظهر إطار (p) => p * 2 فوق myMap؟",
      "اكتب myFilter(arr, fn) بالحلقة نفسها، لكن ادفع arr[i] فقط إذا كانت fn(arr[i]) صادقة، وجرّبها بـ (p) => p >= 10.",
      "غيّر 0 في سطر total إلى 100 وتوقّع الناتج قبل أن تضغط.",
      "غيّر دالة map إلى (p, i) => p * i. من أين جاءت i؟ ابحث عنها في سطر fn(arr[i], i).",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا الكود؟",
      code: `const prices = [10, 20];
const doubled = prices.map((p) => {
  p * 2;
});
console.log(doubled);`,
      options: ["[undefined, undefined]", "[20, 40]", "[10, 20]"],
      answer: 0,
      why: "مع الأقواس {} يصير جسم الدالة كتلة، والكتلة لا تُرجع شيئاً إلا بكلمة return. فكل نداء يرجع undefined، و map تجمع ما يرجع بأمانة.",
      scene: {
        code: { js: "const prices = [10, 20];\nconst doubled = prices.map((p) => {\n  p * 2;\n});\nconsole.log(doubled);" },
        steps: [
          { line: 1, say: "مصفوفة بخانتين.", memory: [{ name: "prices", value: "[10, 20]", type: "none" }] },
          { line: 3, say: "النداء الأول: p = 10. يُحسب 20 ثم يُرمى، فلا return.", memory: [{ name: "prices", value: "[10, 20]", type: "none" }, { name: "p", value: "10", type: "number" }] },
          { line: 4, say: "الدالة انتهت بلا return فرجعت undefined، و map دفعتها. والشيء نفسه مع 20.", memory: [{ name: "prices", value: "[10, 20]", type: "none" }, { name: "doubled", value: "[undefined, undefined]", type: "none" }], changed: ["doubled"] },
          { line: 5, say: "يُطبع [undefined, undefined]. الحل: return p * 2، أو احذف الأقواس: (p) => p * 2.", memory: [{ name: "prices", value: "[10, 20]", type: "none" }, { name: "doubled", value: "[undefined, undefined]", type: "none" }], output: ["[undefined, undefined]"] },
        ],
      },
    },
    {
      question: "ماذا يطبع السطر الأخير؟",
      code: `const scores = [1, 2, 3];
const tens = scores.map((s) => s * 10);
console.log(scores[0], tens[0]);`,
      options: ["1 10", "10 10", "1 1"],
      answer: 0,
      why: "map تبني مصفوفة جديدة في الكومة وتملؤها بما ترجعه دالتك. الأصل يُقرأ فقط، فـ scores[0] ما زالت 1.",
      scene: {
        code: { js: "const scores = [1, 2, 3];\nconst tens = scores.map((s) => s * 10);\nconsole.log(scores[0], tens[0]);" },
        steps: [
          { line: 1, say: "المصفوفة #1.", memory: [{ name: "scores", value: "#1 [1, 2, 3]", type: "none" }] },
          { line: 2, say: "map تبني #2 جديدة وتدفع فيها 10 و 20 و 30. #1 تُقرأ فقط.", memory: [{ name: "scores", value: "#1 [1, 2, 3]", type: "none" }, { name: "tens", value: "#2 [10, 20, 30]", type: "none" }], changed: ["tens"] },
          { line: 3, say: "سهمان إلى مصفوفتين مختلفتين: 1 و 10.", memory: [{ name: "scores", value: "#1 [1, 2, 3]", type: "none" }, { name: "tens", value: "#2 [10, 20, 30]", type: "none" }], read: ["scores", "tens"], output: ["1 10"] },
        ],
      },
    },
    {
      question: "مثال شهير. ماذا يطبع؟",
      code: `const parsed = ["1", "2", "3"].map(parseInt);
console.log(parsed);`,
      options: ["[1, NaN, NaN]", "[1, 2, 3]", "خطأ"],
      answer: 0,
      why: "map تنادي دالتك بثلاثة وسائط: الخانة ورقمها والمصفوفة. و parseInt تفهم الوسيط الثاني أساساً للعدّ: parseInt(\"2\", 1) و parseInt(\"3\", 2) تعطيان NaN. اكتب (s) => parseInt(s, 10) أو استعمل Number.",
      scene: {
        code: { js: "const parsed = [\"1\", \"2\", \"3\"].map(parseInt);\nconsole.log(parsed);" },
        steps: [
          { line: 1, say: "النداء الأول: parseInt(\"1\", 0). الأساس 0 يعني: خمّن، فيكون 10. الناتج 1.", memory: [{ name: "call", value: 'parseInt("1", 0)', type: "none" }, { name: "returns", value: "1", type: "number" }] },
          { line: 1, say: "الثاني: parseInt(\"2\", 1). لا يوجد نظام عدّ أساسه 1: NaN.", memory: [{ name: "call", value: 'parseInt("2", 1)', type: "none" }, { name: "returns", value: "NaN", type: "number" }] },
          { line: 1, say: "الثالث: parseInt(\"3\", 2). في النظام الثنائي لا يوجد رقم 3: NaN.", memory: [{ name: "call", value: 'parseInt("3", 2)', type: "none" }, { name: "returns", value: "NaN", type: "number" }] },
          { line: 2, say: "يُطبع [1, NaN, NaN]. map أعطت الدالة رقم الخانة، و parseInt استعملته.", memory: [{ name: "parsed", value: "[1, NaN, NaN]", type: "none" }], output: ["[1, NaN, NaN]"] },
        ],
      },
    },
  ],
  code: {
    intro: "تقرير طلبات كما يُكتب في مشروع حقيقي: filter ثم map ثم reduce في سلسلة، و find و some و every للأسئلة السريعة، والتجميع حسب العميل بـ reduce. كل سطر يقرأ orders ولا يغيّرها.",
    runnerStarter: `const orders = [
  { id: 1, customer: "Sara", total: 120, paid: true },
  { id: 2, customer: "Omar", total: 45, paid: false },
  { id: 3, customer: "Sara", total: 80, paid: true },
  { id: 4, customer: "Huda", total: 200, paid: true },
];

const revenue = orders
  .filter((o) => o.paid)
  .map((o) => o.total)
  .reduce((sum, t) => sum + t, 0);
console.log("revenue:", revenue);

const firstUnpaid = orders.find((o) => !o.paid);
console.log("first unpaid:", firstUnpaid.id);
console.log("any over 150?", orders.some((o) => o.total > 150));
console.log("all paid?", orders.every((o) => o.paid));

const byCustomer = orders.reduce((acc, o) => {
  acc[o.customer] = (acc[o.customer] ?? 0) + o.total;
  return acc;
}, {});
console.log(byCustomer);

// sort changes the array in place, so sort a copy:
const biggest = [...orders].sort((a, b) => b.total - a.total);
console.log(biggest.map((o) => o.id).join(","), orders[0].id);
// try: mark order 2 as paid. Which lines print something different?
`,
  },
  exercises: [
    {
      kind: "order",
      title: "إيراد المدفوع",
      prompt: "رتّب السلسلة: اختر المدفوع، خذ المبلغ، اجمع. الناتج: 150",
      lines: [
        "const orders = [{ total: 100, paid: true }, { total: 30, paid: false }, { total: 50, paid: true }];",
        "const revenue = orders",
        "  .filter((o) => o.paid)",
        "  .map((o) => o.total)",
        "  .reduce((sum, t) => sum + t, 0);",
        "console.log(revenue);",
      ],
      expected: "150",
    },
    {
      kind: "fill",
      title: "القيمة الأولى",
      prompt: "أي قيمة أولى تجعل reduce تطبع 45؟",
      template: `const items = [{ price: 10 }, { price: 20 }, { price: 15 }];
const total = items.reduce((sum, item) => sum + item.price, ___);
console.log(total);`,
      options: ["0", "1", '""'],
      expected: "45",
    },
    {
      kind: "fix",
      title: "أسماء بأحرف كبيرة",
      prompt: "النتيجة فارغة لأن الدالة لا ترجع شيئاً. أصلحها لتطبع: SARA, OMAR",
      code: `const users = [{ name: "Sara" }, { name: "Omar" }];
const names = users.map((u) => {
  u.name.toUpperCase();
});
console.log(names.join(", "));`,
      expected: "SARA, OMAR",
      hint: "داخل الأقواس {} لا يرجع شيء إلا بـ return. أضف return، أو اكتب (u) => u.name.toUpperCase() بلا أقواس.",
      solution: `const users = [{ name: "Sara" }, { name: "Omar" }];
const names = users.map((u) => u.name.toUpperCase());
console.log(names.join(", "));`,
    },
    {
      kind: "write",
      title: "filter بيدك",
      prompt: "اكتب myFilter(arr, fn) بحلقة for عادية (بلا filter): ترجع مصفوفة جديدة فيها كل خانة جعلت fn ترجع قيمة صادقة. ثم اطبع مجموع myFilter([5, 30, 15, 2], (x) => x >= 10) بحلقة أو reduce، ثم طولها. الناتج: 45 ثم 2",
      starter: "// function myFilter(arr, fn) { ... }\n",
      expected: "45\n2",
      hint: "ابدأ بـ const out = []; ثم for (const x of arr) { if (fn(x)) out.push(x); } ثم return out;",
      solution: `function myFilter(arr, fn) {
  const out = [];
  for (const x of arr) {
    if (fn(x)) {
      out.push(x);
    }
  }
  return out;
}
const big = myFilter([5, 30, 15, 2], (x) => x >= 10);
console.log(big.reduce((sum, x) => sum + x, 0));
console.log(big.length);`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: "const r = [1, 2, 3].map((x, i) => x * i);\nconsole.log(r.join(\",\"));",
      options: ["0,2,6", "1,4,9", "2,4,6"],
      answer: 0,
      why: "الوسيط الثاني رقم الخانة: 1 × 0 = 0، و 2 × 1 = 2، و 3 × 2 = 6.",
    },
    {
      question: "ماذا يطبع؟",
      code: "const r = [3, 0, 5, \"\", 2].filter((x) => x);\nconsole.log(r.length);",
      options: ["3", "5", "4"],
      answer: 0,
      why: "filter تحتفظ بالخانة حين ترجع الدالة قيمة صادقة. 0 و \"\" كاذبتان، فتبقى 3 و 5 و 2.",
    },
    {
      question: "ما قيمة acc بعد كل نداء، وما الناتج؟",
      code: "const r = [2, 3, 4].reduce((acc, x) => acc * x, 1);\nconsole.log(r);",
      options: ["24", "9", "10"],
      answer: 0,
      why: "acc يبدأ 1، ثم 1 × 2 = 2، ثم 2 × 3 = 6، ثم 6 × 4 = 24. ما ترجعه الدالة يصير acc للنداء التالي.",
    },
    {
      question: "ماذا يطبع؟",
      code: "const nums = [10, 1, 5];\nnums.sort();\nconsole.log(nums.join(\",\"));",
      options: ["1,10,5", "1,5,10", "10,5,1"],
      answer: 0,
      why: "sort بلا دالة مقارنة يقارن النصوص حرفاً حرفاً: \"10\" تأتي قبل \"5\" لأن \"1\" قبل \"5\". للأرقام اكتب sort((a, b) => a - b). وانتبه: sort تغيّر المصفوفة نفسها.",
    },
    {
      question: "ماذا يطبع؟",
      code: "const r = [1, 2].forEach((x) => x * 2);\nconsole.log(r);",
      options: ["undefined", "[2, 4]", "[1, 2]"],
      answer: 0,
      why: "forEach حلقة تنادي دالتك وترمي ما ترجعه، ولا تبني شيئاً. استعملها للأفعال (طباعة، حفظ)، و map حين تريد مصفوفة النتائج.",
    },
  ],
  next: "js-destructuring",
};
