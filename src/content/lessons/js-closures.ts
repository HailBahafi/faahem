import type { Cell, Frame, HeapObj, Lesson, Slot, Step } from "@/lib/types";

const num = (name: string, value: number): Slot => ({ name, value: String(value), type: "number" });
const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
const fnv = (name: string): Slot => ({ name, value: `ƒ ${name}`, type: "function" });
const prog = (vars: Slot[]): Frame => ({ id: 1, name: "البرنامج", vars });
const call = (id: number, name: string, vars: Slot[]): Frame => ({ id, name, vars });
/** A context object: the variables a call shares with the functions it created. */
const ctx = (id: number, count: number): HeapObj => ({ id, kind: "object", items: [num("count", count)] });
/** A function object: its code and the hidden link to the context it was born in. */
const fobj = (id: number, env: number): HeapObj => ({
  id,
  kind: "object",
  items: [{ name: "[[Code]]", value: "ƒ anonymous", type: "function" }, ref("[[Environment]]", env)],
});
const at = (line: number | null, say: string, frames: Frame[], heap: HeapObj[], extra: Partial<Step> = {}): Step => ({ line, say, memory: [], frames, heap, ...extra });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

const mk = fnv("makeCounter");

export const jsClosures: Lesson = {
  slug: "js-closures",
  stage: 0,
  number: "2.1",
  title: "الإغلاق closures",
  subtitle: "الدالة تحمل معها البيئة التي وُلدت فيها، فتبقى حيّة على الكومة",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "عدّاد يعبث به الجميع",
    body: "ثلاثة أزرار، ولكل زر عدّاد. في اليسار عدّاد واحد مشترك في متغير عام، وفي اليمين كل زر يملك عدّاده المخفي داخل إغلاق. اضغط الأزرار، ثم دع «كوداً آخر» يصفّر المتغير العام.",
    demo: "jsClosures",
  },
  scene: {
    code: {
      js: `function makeCounter() {
  let count = 0;
  return function () {
    count = count + 1;
    return count;
  };
}
const a = makeCounter();
const b = makeCounter();
a();
console.log(a(), b());`,
    },
    notes: {
      js: "كل دالة في JavaScript إغلاق: تحفظ رابطاً إلى النطاق الذي أُنشئت فيه، وتقرأ متغيراته الحالية (لا نسخة منها) في كل استدعاء. المتغيرات التي تلتقطها دالة داخلية يضعها المحرّك (V8 مثلاً) في كائن سياق على الكومة، فتعيش ما دام شيء يشير إليها.",
    },
    steps: [
      at(null, "قبل التشغيل: في إطار البرنامج دالة واحدة اسمها makeCounter. الكومة فارغة.", [prog([mk])], []),
      at(2, "استدعاء makeCounter() يصنع إطاراً جديداً. المحرّك يلاحظ أن count تستعملها دالة داخلية، فيضعها في كائن سياق (context) على الكومة #1، لا في الإطار.", [prog([mk]), call(2, "makeCounter", [ref("context", 1)])], [ctx(1, 0)], { changedHeap: [1] }),
      at(3, "تُصنع دالة جديدة على الكومة #2. معها رابط مخفي اسمه [[Environment]] يشير إلى السياق #1 الذي وُلدت فيه. هذا الرابط هو الإغلاق.", [prog([mk]), call(2, "makeCounter", [ref("context", 1)])], [ctx(1, 0), fobj(2, 1)], { changedHeap: [2] }),
      at(8, "return تُرجع مرجع الدالة، ويختفي إطار makeCounter من المكدّس. لكن السياق #1 لم يُمحَ: الدالة #2 ما زالت تشير إليه، و a يشير إلى الدالة.", [prog([mk, ref("a", 2)])], [ctx(1, 0), fobj(2, 1)], { changed: ["a"] }),
      at(9, "استدعاء ثانٍ يصنع كل شيء من جديد: سياق #3 فيه count = 0، ودالة #4 مرتبطة به، و b يشير إليها. لكل استدعاء بيئته الخاصة.", [prog([mk, ref("a", 2), ref("b", 4)])], [ctx(1, 0), fobj(2, 1), ctx(3, 0), fobj(4, 3)], { changed: ["b"], changedHeap: [3, 4] }),
      at(4, "a() يدخل الدالة #2. لا يوجد count في إطارها، فيتبع المحرّك الرابط [[Environment]] إلى #1، ويقرأ 0 ويكتب 1 هناك.", [prog([mk, ref("a", 2), ref("b", 4)]), call(3, "a", [ref("[[Environment]]", 1)])], [ctx(1, 1), fobj(2, 1), ctx(3, 0), fobj(4, 3)], { changedHeap: [1] }),
      at(11, "استدعاء a() الثاني يمرّ بالطريق نفسه إلى #1: القيمة الحالية 1، فتصير 2. الإغلاق يقرأ المتغير الحي، لا نسخة قديمة منه.", [prog([mk, ref("a", 2), ref("b", 4)]), call(3, "a", [ref("[[Environment]]", 1)])], [ctx(1, 2), fobj(2, 1), ctx(3, 0), fobj(4, 3)], { changedHeap: [1] }),
      at(11, "b() يتبع رابطه هو إلى #3، فيصير count هناك 1. السياق #1 لم يتأثر.", [prog([mk, ref("a", 2), ref("b", 4)]), call(4, "b", [ref("[[Environment]]", 3)])], [ctx(1, 2), fobj(2, 1), ctx(3, 1), fobj(4, 3)], { changedHeap: [3] }),
      at(11, "الطباعة: 2 1. الكود واحد، والبيئتان منفصلتان على الكومة. لا أحد خارج الدالتين يستطيع الوصول إلى count.", [prog([mk, ref("a", 2), ref("b", 4)])], [ctx(1, 2), fobj(2, 1), ctx(3, 1), fobj(4, 3)], { output: ["2 1"] }),
      at(null, "متى يُمحى السياق؟ حين لا يبقى مرجع يصل إليه. لو كتبنا a = null لصارت #2 و #1 غير قابلتين للوصول، فيحررهما جامع القمامة.", [prog([mk, ref("a", 2), ref("b", 4)])], [ctx(1, 2), fobj(2, 1), ctx(3, 1), fobj(4, 3)]),
    ],
  },
  playground: {
    kind: "trace",
    intro: "حساب بنكي رصيده مخفي في إغلاق. لاحظ أن balance يختفي من المكدّس بعد عودة createAccount، ومع ذلك deposit تجده: إنه في السياق الذي تحمله الدالتان. والكائن المُرجع نفسه لا يملك balance.",
    starter: `function createAccount(owner) {
  let balance = 0;
  function deposit(amount) {
    balance = balance + amount;
    return balance;
  }
  function getBalance() {
    return balance;
  }
  return { owner: owner, deposit: deposit, getBalance: getBalance };
}
const acc = createAccount("Sara");
acc.deposit(50);
acc.deposit(25);
console.log(acc.owner, acc.getBalance(), acc.balance);`,
    challenges: [
      "توقّع السطر المطبوع قبل أن تضغط: لماذا acc.balance هو undefined بينما getBalance() تعطي 75؟",
      "أنشئ حساباً ثانياً const acc2 = createAccount(\"Omar\") وأودع فيه 10. هل تغيّر رصيد acc؟ كم سياقاً صار على الكومة؟",
      "أضف دالة withdraw(amount) داخل createAccount ترفض السحب إذا كان أكبر من الرصيد (تُرجع false)، وأضفها إلى الكائن المُرجع.",
      "اكتب acc.balance = 1000 قبل الطباعة. هل تغيّر ما تُرجعه getBalance()؟ ولماذا؟",
    ],
  },
  predict: [
    {
      question: "الدالة تُنشأ والمتغير x قيمته 1، ثم يتغير x. ماذا يطبع؟",
      code: `let x = 1;
function show() {
  return x;
}
x = 2;
console.log(show());`,
      options: ["1", "2", "undefined"],
      answer: 1,
      why: "الإغلاق يحفظ رابطاً إلى المتغير نفسه، لا صورة عن قيمته لحظة إنشاء الدالة. عند الاستدعاء تقرأ show قيمة x الحالية: 2.",
    },
    {
      question: "عدّادان من المصنع نفسه. ماذا يطبع؟",
      code: `function makeCounter() {
  let count = 0;
  return () => {
    count = count + 1;
    return count;
  };
}
const c1 = makeCounter();
const c2 = makeCounter();
c1();
c1();
console.log(c1(), c2());`,
      options: ["3 1", "4 4", "3 4"],
      answer: 0,
      why: "كل استدعاء لـ makeCounter يصنع سياقاً جديداً فيه count خاص. c1 زاد سياقه ثلاث مرات، و c2 زاد سياقه مرة واحدة.",
    },
    {
      question: "دوال تُصنع داخل حلقة let. ماذا يطبع؟",
      code: `const fns = [];
for (let i = 0; i < 3; i++) {
  fns.push(() => i);
}
const first = fns[0];
console.log(first());`,
      options: ["0", "3", "undefined"],
      answer: 0,
      why: "let في رأس الحلقة تصنع ربطاً جديداً لـ i في كل دورة، فتلتقط كل دالة i الخاص بدورتها. لو كانت var لكان i واحداً مشتركاً، ولطبعت 3.",
      scene: {
        code: { js: "const fns = [];\nfor (let i = 0; i < 3; i++) {\n  fns.push(() => i);\n}\nconst first = fns[0];\nconsole.log(first());" },
        steps: [
          { line: 2, say: "الدورة الأولى: let تصنع i جديداً قيمته 0، والدالة الأولى تلتقطه.", memory: [n("i (دورة 1)", 0)], changed: ["i (دورة 1)"] },
          { line: 2, say: "الدورة الثانية: i جديد آخر قيمته 1، والدالة الثانية تلتقطه هو.", memory: [n("i (دورة 1)", 0), n("i (دورة 2)", 1)], changed: ["i (دورة 2)"] },
          { line: 2, say: "الدورة الثالثة: i جديد قيمته 2. ثلاثة متغيرات منفصلة، ولكل دالة واحد منها.", memory: [n("i (دورة 1)", 0), n("i (دورة 2)", 1), n("i (دورة 3)", 2)], changed: ["i (دورة 3)"] },
          { line: 6, say: "first هي الدالة الأولى، فتقرأ i الخاص بالدورة الأولى: 0.", memory: [n("i (دورة 1)", 0), n("i (دورة 2)", 1), n("i (دورة 3)", 2)], read: ["i (دورة 1)"], output: ["0"] },
        ],
      },
    },
  ],
  code: {
    intro: "الإغلاق في عمل المحترفين: ذاكرة مؤقتة (memoize) تحفظ النتائج في Map لا يراها أحد غير الدالة، ومولّد أرقام فريدة لا يمكن تصفيره من الخارج. شغّل، ثم جرّب التعليق.",
    runnerStarter: `// memoize wraps a slow function and remembers its answers in a private cache.
function memoize(fn) {
  const cache = new Map();
  let misses = 0;
  const wrapped = (n) => {
    if (!cache.has(n)) {
      misses++;
      cache.set(n, fn(n));
    }
    return cache.get(n);
  };
  wrapped.stats = () => \`cache size \${cache.size}, misses \${misses}\`;
  return wrapped;
}

function slowSquare(n) {
  let total = 0;
  for (let i = 0; i < n; i++) total += n;
  return total;
}

const square = memoize(slowSquare);
console.log(square(12), square(12), square(5));
console.log(square.stats());

function createIdGenerator(prefix) {
  let next = 1;
  return () => \`\${prefix}-\${next++}\`;
}
const userId = createIdGenerator("user");
const orderId = createIdGenerator("order");
console.log(userId(), userId(), orderId());
// جرّب: أنشئ square2 = memoize(slowSquare) واستدعها بـ 12. هل تشارك square ذاكرتها؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "مصنع المضاعِفات",
      prompt: "رتّب الأسطر: دالة تصنع دالة تضرب في factor الذي التقطته. يجب أن يطبع 10 15.",
      lines: [
        "function makeMultiplier(factor) {",
        "  return (n) => n * factor;",
        "}",
        "const double = makeMultiplier(2);",
        "const triple = makeMultiplier(3);",
        "console.log(double(5), triple(5));",
      ],
      expected: "10 15",
    },
    {
      kind: "fill",
      title: "العدّاد يتذكّر",
      prompt: "الدالة المُرجعة يجب أن تزيد count الملتقط وتُرجع قيمته الجديدة. أي تعبير يجعل البرنامج يطبع 2؟",
      template: "function makeCounter() {\n  let count = 0;\n  return () => ___;\n}\nconst next = makeCounter();\nnext();\nconsole.log(next());",
      options: ["count + 1", "count++", "++count"],
      expected: "2",
    },
    {
      kind: "fix",
      title: "كل الأزرار تقول 4",
      prompt: "ثلاثة أزرار، ولكل زر دالة تُرجع رقمه. لكن الزر الأول يقول button 4. أصلح البرنامج حتى يطبع button 1.",
      code: `const buttons = [];
for (var i = 1; i <= 3; i++) {
  buttons.push(() => "button " + i);
}
console.log(buttons[0]());`,
      expected: "button 1",
      hint: "var تصنع متغيراً واحداً للحلقة كلها، فتلتقطه الدوال الثلاث وقيمته في النهاية 4. أي كلمة تصنع i جديداً في كل دورة؟",
      solution: `const buttons = [];
for (let i = 1; i <= 3; i++) {
  buttons.push(() => "button " + i);
}
console.log(buttons[0]());`,
    },
    {
      kind: "write",
      title: "مولّد المعرّفات",
      prompt: "اكتب createIdGenerator(prefix): تُرجع دالة، كل استدعاء لها يُرجع prefix ثم - ثم رقماً يبدأ من 1 ويزيد. أنشئ مولّداً لـ \"user\" واطبع منه مرتين، ثم مولّداً لـ \"order\" واطبع منه مرة. يجب أن يظهر user-1 ثم user-2 ثم order-1.",
      starter: "// function createIdGenerator(prefix) {\n",
      expected: "user-1\nuser-2\norder-1",
      hint: "داخل الدالة: let next = 1; ثم return () => prefix + \"-\" + next++; كل مولّد يملك next خاصاً به.",
      solution: `function createIdGenerator(prefix) {
  let next = 1;
  return () => prefix + "-" + next++;
}
const userId = createIdGenerator("user");
const orderId = createIdGenerator("order");
console.log(userId());
console.log(userId());
console.log(orderId());`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: "function makeAdder(x) {\n  return (y) => x + y;\n}\nconst add10 = makeAdder(10);\nconsole.log(add10(5));",
      options: ["5", "15", "خطأ: x انتهى مع إطار makeAdder"],
      answer: 1,
      why: "إطار makeAdder اختفى، لكن x محفوظ في السياق الذي تشير إليه الدالة المُرجعة. 10 + 5 = 15.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'function makeGreeter() {\n  let name = "Sara";\n  const greet = () => "hi " + name;\n  name = "Omar";\n  return greet;\n}\nconsole.log(makeGreeter()());',
      options: ["hi Sara", "hi Omar", "hi undefined"],
      answer: 1,
      why: "greet لا تأخذ صورة عن name وقت إنشائها. هي تشير إلى المتغير نفسه، وقيمته عند الاستدعاء \"Omar\".",
    },
    {
      question: "بعد أن تعود makeCounter وتُرجع دالتها، أين يعيش count؟",
      options: ["في إطار makeCounter على المكدّس", "في كائن سياق على الكومة، تبقيه الدالة المُرجعة حيّاً", "نُسخت قيمته داخل كود الدالة"],
      answer: 1,
      why: "الإطار يختفي عند return. المتغيرات التي التقطتها دالة داخلية تعيش في سياق على الكومة، ويبقى ما دامت الدالة (أو أي شيء آخر) يشير إليه.",
    },
    {
      question: "ماذا يطبع؟",
      code: "function pair() {\n  let n = 0;\n  return { inc: () => ++n, get: () => n };\n}\nconst p = pair();\np.inc();\np.inc();\nconst q = pair();\nq.inc();\nconsole.log(p.get(), q.get());",
      options: ["2 1", "3 3", "1 1"],
      answer: 0,
      why: "inc و get من الاستدعاء نفسه تشتركان في سياق واحد. أما q فجاء من استدعاء آخر بسياق مستقل.",
    },
    {
      question: "دالة تلتقط مصفوفة ضخمة. ماذا يحدث للمصفوفة بعد هذا السطر الأخير؟",
      code: "function makeReport() {\n  const rows = new Array(1000000).fill(0);\n  return () => rows.length;\n}\nlet report = makeReport();\nreport = null;",
      options: ["تبقى في الذاكرة إلى نهاية البرنامج", "تصير غير قابلة للوصول، فيحررها جامع القمامة", "تُحذف فوراً عند return"],
      answer: 1,
      why: "ما دامت report تشير إلى الدالة، يبقى سياقها والمصفوفة حيّين. حين صارت report = null لم يبق مرجع يصل إليهما، فيحق لجامع القمامة تحريرهما.",
    },
  ],
  next: "js-this",
};
