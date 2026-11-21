import type { Lesson } from "@/lib/types";

export const jsFunctional: Lesson = {
  slug: "js-functional",
  stage: 0,
  number: "3.6",
  title: "الأسلوب الوظيفي",
  subtitle: "دوال نقية لا تلمس ما حولها، وقيم جديدة بدل تعديل المشترك، وآلات صغيرة تُركّب",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "زر التراجع المكسور",
    body: "سلة مشتريات تحفظ كل حالة في سجلّ حتى تستطيع التراجع. أضف ثلاثة أصناف بالطريقة الأولى وانظر إلى السجل، ثم أعد التجربة بالطريقة الثانية.",
    demo: "jsFunctional",
  },
  scene: {
    code: {
      js: `function addItem(cart, item) {
  const items = cart.items.slice();
  items.push(item);
  return { items: items };
}
const before = { items: ["tea"] };
const after = addItem(before, "cake");
console.log(before.items.length, after.items.length);`,
    },
    steps: [],
    trace: true,
    notes: {
      js: "في الكود الحقيقي تكتب النسخة بالنشر: return { ...cart, items: [...cart.items, item] }. والنتيجة في الذاكرة هي نفسها: كائن جديد ومصفوفة جديدة، والقديم كما هو.",
    },
  },
  playground: {
    kind: "trace",
    intro: "كل دالة هنا آلة صغيرة نقية. add و times دوال مُجزّأة (curried): تأخذ الوسيط الأول وتعيد آلة تنتظر الثاني وتتذكّر الأول في إغلاق. و pipe تركّب آلتين في آلة واحدة. تابع الإطارات: من يتذكّر 0.5 و 20؟",
    starter: `const add = (a) => (b) => a + b;
const times = (a) => (b) => a * b;
const pipe = (f, g) => (x) => g(f(x));
const half = times(0.5);
const plusShipping = add(20);
const finalPrice = pipe(half, plusShipping);
console.log(finalPrice(100));
console.log(finalPrice(40));`,
    challenges: [
      "قبل التشغيل: ما الذي تعيده times(0.5)؟ رقماً أم دالة؟",
      "بدّل الترتيب: pipe(plusShipping, half). توقّع الناتجين قبل التشغيل.",
      "أضف آلة ثالثة: const round = (n) => Math.round(n); وركّبها: pipe(finalPrice, round).",
      "اكتب let rate = 0.5; واجعل half = (b) => b * rate، ثم غيّر rate بين الطباعتين. لماذا لم تعد half نقية؟",
    ],
  },
  predict: [
    {
      question: "ماذا يُطبع؟",
      code: `function addItem(cart, item) {
  cart.items.push(item);
  return cart;
}
const a = { items: [] };
const b = addItem(a, "tea");
console.log(a.items.length, a === b);`,
      options: ["1 true", "0 false", "1 false"],
      answer: 0,
      why: "الدالة استلمت سهماً إلى كائن a نفسه، وعدّلت مصفوفته، ثم أعادت السهم نفسه. فـ a تغيّر، و b ليس كائناً جديداً بل a. هذه دالة غير نقية: أثرها خرج منها وغيّر ما يملكه غيرها.",
    },
    {
      question: "ماذا يُطبع؟",
      code: `const mult = (a) => (b) => a * b;
const double = mult(2);
const triple = mult(3);
console.log(double(5) + triple(5));`,
      options: ["25", "30", "خطأ: mult تحتاج وسيطين"],
      answer: 0,
      why: "mult(2) تعيد دالة تتذكّر a = 2 في إغلاقها، و mult(3) تعيد دالة أخرى تتذكّر a = 3. لكل منهما بيئتها. double(5) = 10 و triple(5) = 15، والمجموع 25.",
    },
    {
      question: "ماذا يُطبع؟",
      code: `const compose = (f, g) => (x) => f(g(x));
const inc = (n) => n + 1;
const dbl = (n) => n * 2;
console.log(compose(inc, dbl)(5));`,
      options: ["11", "12", "7"],
      answer: 0,
      why: "compose تطبّق من اليمين: g أولاً ثم f. dbl(5) = 10 ثم inc(10) = 11. لهذا تستعمل أغلب الأكواد pipe التي تقرأ من اليسار إلى اليمين بترتيب التنفيذ.",
    },
  ],
  code: {
    intro: "الأسلوب نفسه في كود حقيقي: خط معالجة طلبات مبني من آلات صغيرة مُجزّأة، وتحديث غير مُعدِّل يصنع مصفوفة جديدة ويعيد استعمال الكائنات التي لم تتغير (مشاركة البنية)، و curry عامة تجزّئ أي دالة.",
    runnerStarter: `const orders = Object.freeze([
  { id: 1, customer: "Sara", total: 120, status: "paid" },
  { id: 2, customer: "Omar", total: 80, status: "pending" },
  { id: 3, customer: "Lina", total: 200, status: "paid" },
]);

// Small curried machines.
const pipe = (...fns) => (x) => fns.reduce((value, fn) => fn(value), x);
const where = (pred) => (list) => list.filter(pred);
const sumBy = (key) => (list) => list.reduce((sum, item) => sum + item[key], 0);
const hasStatus = (status) => (order) => order.status === status;

const paidRevenue = pipe(where(hasStatus("paid")), sumBy("total"));
console.log("paid revenue", paidRevenue(orders));

// An immutable update: a new array, a new object for the changed order, the rest shared.
const markShipped = (id) => (list) => list.map((o) => (o.id === id ? { ...o, status: "shipped" } : o));
const next = markShipped(2)(orders);
console.log(orders[1].status, next[1].status, orders[0] === next[0]);

// A generic curry: collect arguments until there are as many as the function expects.
const curry = (fn) =>
  function curried(...args) {
    return args.length >= fn.length ? fn(...args) : (...more) => curried(...args, ...more);
  };
const volume = curry((l, w, h) => l * w * h);
console.log(volume(2)(3)(4), volume(2, 3)(4));
// try: add a step to paidRevenue that turns the sum into a string like "320 SAR"
`,
  },
  exercises: [
    {
      kind: "order",
      title: "آلة صراخ",
      prompt: "رتّب الأسطر: ثلاث آلات صغيرة تُركّب بـ pipe في آلة واحدة تطبع HI!",
      lines: [
        "const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);",
        "const trim = (s) => s.trim();",
        "const upper = (s) => s.toUpperCase();",
        'const exclaim = (s) => s + "!";',
        "const shout = pipe(trim, upper, exclaim);",
        'console.log(shout("  hi  "));',
      ],
      expected: "HI!",
    },
    {
      kind: "fill",
      title: "الترتيب يهمّ",
      prompt: "أي ترتيب للآلتين يجعل run(3) تطبع 8؟",
      template: `const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const inc = (n) => n + 1;
const double = (n) => n * 2;
const run = pipe(___);
console.log(run(3));`,
      options: ["inc, double", "double, inc", "inc, inc"],
      expected: "8",
    },
    {
      kind: "fix",
      title: "الترتيب يخرّب الأصل",
      prompt: "sorted تعيد قائمة مرتبة، لكنها رتّبت scores الأصلية أيضاً. أصلحها حتى يبقى الأصل كما هو: 3,1,2 1,2,3",
      code: `function sorted(list) {
  return list.sort((a, b) => a - b);
}
const scores = [3, 1, 2];
const ranked = sorted(scores);
console.log(scores.join(","), ranked.join(","));`,
      expected: "3,1,2 1,2,3",
      hint: "sort ترتّب المصفوفة في مكانها وتعيد السهم نفسه. رتّب نسخة: [...list] أو list.slice().",
      solution: `function sorted(list) {
  return [...list].sort((a, b) => a - b);
}
const scores = [3, 1, 2];
const ranked = sorted(scores);
console.log(scores.join(","), ranked.join(","));`,
    },
    {
      kind: "write",
      title: "خصم مُجزّأ",
      prompt: "اكتب discount(rate) التي تعيد دالة تأخذ سعراً وتعيده بعد خصم rate بالمئة. يُطبع 90,36 ثم 15.",
      starter: `// write discount(rate): returns a function price => price minus rate percent

const tenOff = discount(10);
const halfOff = discount(50);
console.log([100, 40].map(tenOff).join(","));
console.log(halfOff(30));`,
      expected: "90,36\n15",
      hint: "const discount = (rate) => (price) => price - (price * rate) / 100;",
      solution: `const discount = (rate) => (price) => price - (price * rate) / 100;

const tenOff = discount(10);
const halfOff = discount(50);
console.log([100, 40].map(tenOff).join(","));
console.log(halfOff(30));`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع؟",
      code: "let rate = 2;\nconst f = (x) => x * rate;\nconsole.log(f(5));\nrate = 3;\nconsole.log(f(5));",
      options: ["10 ثم 15", "10 ثم 10", "15 ثم 15"],
      answer: 0,
      why: "f تقرأ rate من خارجها عند كل استدعاء، لا عند تعريفها. المدخل نفسه أعطى ناتجين مختلفين، فـ f ليست نقية. الدالة النقية تعتمد على وسائطها فقط.",
    },
    {
      question: "ماذا يُطبع؟",
      code: "const cfg = Object.freeze({ db: { port: 1 } });\ncfg.db.port = 2;\nconsole.log(cfg.db.port);",
      options: ["2", "1", "TypeError"],
      answer: 0,
      why: "freeze تجمّد أدراج الكائن الخارجي فقط: لا تستطيع تغيير السهم cfg.db. لكن الكائن الداخلي الذي يشير إليه ليس مجمّداً، فكتابة port فيه تنجح. التجميد سطحي.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'const a = { tags: ["x"] };\nconst b = { ...a };\nb.tags.push("y");\nconsole.log(a.tags.length);',
      options: ["2", "1", "0"],
      answer: 0,
      why: "النشر ينسخ أدراج a إلى كائن جديد، ودرج tags فيه سهم، فيُنسخ السهم لا المصفوفة. a و b كائنان مختلفان يشيران إلى المصفوفة نفسها. لتحديث غير مُعدِّل اصنع مصفوفة جديدة: { ...a, tags: [...a.tags, \"y\"] }.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'console.log(["1", "2", "3"].map(parseInt).join(","));',
      options: ["1,NaN,NaN", "1,2,3", "NaN,NaN,NaN"],
      answer: 0,
      why: "map تستدعي الدالة بثلاثة وسائط: العنصر والفهرس والمصفوفة. parseInt تأخذ الثاني أساساً للعدّ: parseInt(\"2\", 1) و parseInt(\"3\", 2) تعطيان NaN. حين تمرّر دالة بلا غلاف تأكد من عدد وسائطها: map((s) => parseInt(s, 10)).",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'const greet = (g) => (n) => g + " " + n;\nconst hi = greet("Hi");\nconsole.log(hi("Sara") + ", " + hi("Omar"));',
      options: ["Hi Sara, Hi Omar", "Hi Sara, Omar", "undefined Sara, undefined Omar"],
      answer: 0,
      why: "greet(\"Hi\") انتهت، لكن الدالة التي أعادتها تحمل إغلاقاً فيه g = \"Hi\". كل استدعاء لـ hi يقرأ g من هذا الإغلاق، فتعمل hi مرات كثيرة بالتحية نفسها.",
    },
  ],
  next: "js-patterns",
};
