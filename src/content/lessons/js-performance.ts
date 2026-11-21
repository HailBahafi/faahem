import type { Cell, Lesson, Scene } from "@/lib/types";

const box = (name: string, value: string): Cell => ({ name, value, type: "none" });
const num = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

/** A hand-written scene for a predict answer. */
const mini = (js: string, steps: Scene["steps"]): Scene => ({ code: { js }, steps });

const IDS = box("ids", "[4, 8, 4, 15, 8]");

export const jsPerformance: Lesson = {
  slug: "js-performance",
  stage: 0,
  number: "4.5",
  title: "القياس والتحسين",
  subtitle: "قِس أولاً، فالوقت كله غالباً في مكان واحد لم تكن تتوقعه",
  minutes: 26,
  singleLanguage: true,
  problem: {
    title: "أي جزء تحسّن؟",
    body: "طلب يأخذ ثانية كاملة، ويمر بأربع مراحل. لديك وقت لتسريع مرحلة واحدة عشر مرات. خمّن أيها، ثم شغّل المحلّل (profiler) وقارن.",
    demo: "jsPerformance",
  },
  scene: {
    code: {
      js: `function dupsSlow(ids) {
  return ids.filter((id, i) => ids.indexOf(id) !== i).length;
}
function dupsFast(ids) {
  const seen = new Set(ids);
  return ids.length - seen.size;
}
const ids = [4, 8, 4, 15, 8];
console.log(dupsSlow(ids), dupsFast(ids));`,
    },
    steps: [
      {
        line: null,
        say: "المحلّل قال: 92% من وقت الطلب في دالة واحدة تعدّ المعرّفات المكررة. قبل أي تغيير، نفهم لماذا هي بطيئة: نعدّ العمليات، لا الأسطر.",
        memory: [],
      },
      {
        line: 8,
        say: "خمسة معرّفات هنا؛ في الإنتاج 100,000.",
        memory: [IDS],
        changed: ["ids"],
      },
      {
        line: 2,
        say: "filter تزور كل عنصر، و indexOf تبحث عنه من أول المصفوفة حتى تجده. العنصر الأول: مقارنة واحدة. الثاني: اثنتان. id = 4 في الموضع 2: تجده في الموضع 0، و 0 ≠ 2، فهو مكرر.",
        memory: [IDS, num("comparisons", 4)],
        changed: ["comparisons"],
      },
      {
        line: 2,
        say: "بعد العناصر الخمسة: 1 + 2 + 1 + 4 + 2 = 10 مقارنات. ومع n عنصراً مختلفاً تصبح نحو n²/2: لـ 100,000 عنصر، خمسة مليارات مقارنة. هذا O(n²): ضاعف المدخل يتضاعف الوقت أربع مرات.",
        memory: [IDS, num("comparisons", 10)],
        changed: ["comparisons"],
      },
      {
        line: 5,
        say: "new Set(ids) يمرّ مرة واحدة. كل إضافة تحسب بصمة (hash) القيمة وتذهب إلى خانتها مباشرة، دون بحث. المكرر يقع في الخانة نفسها فلا يُضاف. 5 خطوات لـ 5 عناصر: O(n).",
        memory: [IDS, num("comparisons", 10), box("seen", "Set {4, 8, 15}"), num("steps", 5)],
        changed: ["seen", "steps"],
      },
      {
        line: 6,
        say: "المكررات = الطول ناقص عدد القيم المختلفة: 5 − 3 = 2.",
        memory: [IDS, num("comparisons", 10), box("seen", "Set {4, 8, 15}"), num("steps", 5)],
        read: ["seen"],
      },
      {
        line: 9,
        say: "الجواب نفسه: 2 و 2. قسناهما على 100,000 معرّف بـ performance.now(): البطيئة نحو ثانيتين، والسريعة بضعة أجزاء من الألف (الأرقام تختلف من جهاز لجهاز، والنسبة لا).",
        memory: [IDS, box("slow, n=100k", "≈ 2000ms"), box("fast, n=100k", "≈ 3ms")],
        changed: ["slow, n=100k", "fast, n=100k"],
        output: ["2 2"],
      },
      {
        line: null,
        say: "الطريقة: قِس، جد النقطة الساخنة، غيّر الخوارزمية أولاً، ثم قِس من جديد. حيل المحرك (أشكال الكائنات) والمتصفح (تجميع القراءات) تأتي بعدها، وبالقياس أيضاً.",
        memory: [box("slow, n=100k", "≈ 2000ms"), box("fast, n=100k", "≈ 3ms")],
        output: ["2 2"],
      },
    ],
    notes: {
      js: "في Node و المتصفح: performance.now() ساعة دقيقة لا تتأثر بتغيير ساعة النظام. للتحليل: تبويب Performance في أدوات المطوّر، و node --cpu-prof (أو --inspect مع Chrome) لملف تحليل تفتحه وترى أين ذهب كل جزء من الثانية.",
    },
  },
  playground: {
    kind: "trace",
    intro: "عدّاد عمليات بدل الساعة: الطريقتان تبحثان عن المكرر، والأحجام تتضاعف. راقب كيف يكبر كل عمود.",
    starter: `function countSlow(ids) {
  let ops = 0;
  for (let i = 0; i < ids.length; i++) {
    for (let j = 0; j < i; j++) {
      ops++;
      if (ids[j] === ids[i]) break;
    }
  }
  return ops;
}
function countFast(ids) {
  let ops = 0;
  const seen = {};
  for (let i = 0; i < ids.length; i++) {
    ops++;
    if (seen[ids[i]] === true) continue;
    seen[ids[i]] = true;
  }
  return ops;
}
const sizes = [2, 4, 8];
for (const n of sizes) {
  const ids = [];
  for (let i = 0; i < n; i++) ids.push(i);
  console.log("n=" + n + " slow=" + countSlow(ids) + " fast=" + countFast(ids));
}`,
    challenges: [
      "قبل التشغيل: slow عند n=4 يساوي 6. كم تتوقعه عند n=8؟",
      "أضف 16 إلى sizes. كم مرة كبر slow حين تضاعف n؟ وكم مرة كبر fast؟",
      "اجعل كل المعرّفات متساوية: ids.push(0). ماذا يحدث لـ slow؟ (break توقف البحث مبكراً: أفضل حالة ليست أسوأ حالة.)",
    ],
  },
  predict: [
    {
      question: "شغّلت القياس ثلاث مرات على المدخل نفسه. لماذا الأولى أبطأ بكثير؟",
      code: `const t0 = performance.now();
parseReport(bigJson);
console.log(performance.now() - t0);
// run 1: 48ms, run 2: 9ms, run 3: 9ms`,
      options: [
        "المحرك يفسّر الكود أولاً، ثم يترجم ما يتكرر إلى آلة محسّنة (JIT)",
        "performance.now() غير دقيقة في أول استدعاء",
        "الذاكرة تمتلئ بعد المرة الأولى فتسرع",
      ],
      answer: 0,
      why: "V8 يبدأ بمفسّر سريع البدء، ويراقب الدوال الساخنة، ثم يترجمها بمترجم محسِّن يفترض أشكال القيم التي رآها. لذلك القياس الصادق: تشغيل تحمية أولاً، ثم عدة مرات، ثم الوسيط لا مرة واحدة. والمرة الأولى مهمة أيضاً لكنها سؤال آخر: زمن بدء التشغيل.",
      scene: mini(
        `parseReport(bigJson);`,
        [
          { line: 1, say: "المرة الأولى: المفسّر (Ignition) ينفّذ الكود ويجمع ملاحظات عن الأنواع.", memory: [box("tier", "interpreter"), box("time", "48ms")] },
          { line: 1, say: "الدالة ساخنة: المترجم المحسِّن (TurboFan) يحوّلها إلى كود آلة مخصّص لما رآه.", memory: [box("tier", "optimized machine code"), box("time", "9ms")] },
          { line: 1, say: "من الآن كل استدعاء بالشكل نفسه يأخذ المسار السريع.", memory: [box("tier", "optimized machine code"), box("time", "9ms")] },
        ],
      ),
    },
    {
      question: "كم «شكلاً» مختلفاً (hidden class) ترى lengthOf؟",
      code: `function lengthOf(p) {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}
const a = { x: 3, y: 4 };
const b = { y: 4, x: 3 };
const c = { x: 3, y: 4, z: 0 };
lengthOf(a); lengthOf(b); lengthOf(c);`,
      options: ["3", "1", "2"],
      answer: 0,
      why: "V8 يعطي كل كائن شكلاً يصف خصائصه بترتيب إضافتها ومكان كل واحدة. a و b لهما الخصائص نفسها بترتيب مختلف: شكلان. و c فيها z: شكل ثالث. الوصول p.x يحفظ (inline cache) «في هذا الشكل، x في الخانة 0»، فإن رأى شكلاً واحداً كان سريعاً جداً، وكلما زادت الأشكال تباطأ. اصنع الكائنات المتشابهة بالخصائص نفسها وبالترتيب نفسه.",
      scene: mini(
        `lengthOf(a); lengthOf(b); lengthOf(c);`,
        [
          { line: 1, say: "a: الشكل S1 = {x @0, y @1}. الوصول p.x يحفظ: S1 ← الخانة 0.", memory: [box("p.x cache", "S1→0")] },
          { line: 1, say: "b: الترتيب y ثم x، فهو شكل آخر S2 = {y @0, x @1}.", memory: [box("p.x cache", "S1→0, S2→1")] },
          { line: 1, say: "c: S3 = {x, y, z}. ثلاثة أشكال: الوصول صار متعدد الأشكال (polymorphic) وأبطأ.", memory: [box("p.x cache", "S1→0, S2→1, S3→0")] },
        ],
      ),
    },
    {
      question: "في الصفحة 100 عنصر. كم مرة يحسب المتصفح التخطيط (layout) في هذه الحلقة تقريباً؟",
      code: `for (const el of items) {
  el.style.height = el.offsetHeight * 2 + "px";
}`,
      options: ["نحو 100 مرة", "مرة واحدة بعد الحلقة", "ولا مرة"],
      answer: 0,
      why: "الكتابة إلى style تجعل التخطيط قديماً. قراءة offsetHeight بعدها تجبر المتصفح أن يحسب التخطيط فوراً ليعطيك رقماً صحيحاً. قراءة، كتابة، قراءة، كتابة: حساب في كل دورة. هذا layout thrashing. الحل: اقرأ كل القيم أولاً، ثم اكتب كلها، فيُحسب مرة واحدة.",
      scene: mini(
        `el.style.height = el.offsetHeight * 2 + "px";`,
        [
          { line: 1, say: "العنصر 1: القراءة تحتاج تخطيطاً حديثاً. الكتابة تجعله قديماً.", memory: [num("layouts", 1), box("layout", "stale")] },
          { line: 1, say: "العنصر 2: القراءة تجد التخطيط قديماً فتحسبه من جديد، ثم تفسده الكتابة.", memory: [num("layouts", 2), box("layout", "stale")] },
          { line: 1, say: "وهكذا حتى العنصر 100.", memory: [num("layouts", 100), box("layout", "stale")] },
        ],
      ),
    },
  ],
  code: {
    intro: "أداة قياس كما يكتبها المحترفون: تحمية، ثم عدة تشغيلات، ثم الوسيط. نقيس بها includes مقابل Set، ثم نعدّ استدعاءات fib قبل التذكّر (memoization) وبعده. أرقام الوقت تختلف بين تشغيل وآخر، وهذا سبب أخذ الوسيط.",
    runnerStarter: `const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

function measure(label, fn, runs = 7) {
  fn(); // warm-up: let the JIT see the code first
  const times = [];
  for (let r = 0; r < runs; r++) {
    const t0 = now();
    fn();
    times.push(now() - t0);
  }
  times.sort((a, b) => a - b);
  console.log(label.padEnd(24), "median", times[Math.floor(runs / 2)].toFixed(2) + "ms");
}

const ids = Array.from({ length: 20000 }, (_, i) => i);
const wanted = Array.from({ length: 2000 }, (_, i) => i * 7);
measure("array.includes x 2000", () => wanted.filter((w) => ids.includes(w)).length);
const idSet = new Set(ids);
measure("set.has x 2000", () => wanted.filter((w) => idSet.has(w)).length);

// Memoization: remember answers of a pure function instead of recomputing them.
let calls = 0;
function fib(n) {
  calls++;
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
console.log("fib(25) =", fib(25), "plain:", calls, "calls");

const memo = new Map();
calls = 0;
function fibMemo(n) {
  calls++;
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);
  const value = fibMemo(n - 1) + fibMemo(n - 2);
  memo.set(n, value);
  return value;
}
console.log("fib(25) =", fibMemo(25), "memoized:", calls, "calls");
// try: make ids 40000 long. Which measurement doubles, and which barely moves?
`,
  },
  exercises: [
    {
      kind: "order",
      title: "الوسيط لا المتوسط",
      prompt: "خمس قياسات، إحداها توقف فيها جامع القمامة. رتّب الأسطر حتى يُطبع: median 4, mean 14.6",
      lines: [
        "const samples = [12, 3, 4, 50, 4];",
        "const sorted = samples.slice().sort((a, b) => a - b);",
        "const median = sorted[Math.floor(sorted.length / 2)];",
        "const mean = samples.reduce((sum, x) => sum + x, 0) / samples.length;",
        'console.log("median " + median + ", mean " + mean);',
      ],
      expected: "median 4, mean 14.6",
    },
    {
      kind: "fill",
      title: "بحث بخطوة واحدة",
      prompt: "ابنِ فهرساً تجد فيه المستخدم بمعرّفه مباشرة بدل البحث في المصفوفة كلها.",
      template: `const users = [{ id: 7, name: "Sara" }, { id: 9, name: "Omar" }];
const byId = new ___(users.map((u) => [u.id, u]));
console.log(byId.get(9).name, byId.size);`,
      options: ["Map", "Set", "WeakMap"],
      expected: "Omar 2",
    },
    {
      kind: "fix",
      title: "تخطيط في كل دورة",
      prompt: "هذه محاكاة للمتصفح: قراءة offsetHeight بعد كتابة تحسب التخطيط من جديد. الحلقة تحسبه 3 مرات. اجعله مرة واحدة دون تغيير النتيجة: layouts: 1 ثم 20 40 60.",
      code: `let layouts = 0;
let dirty = true;
function makeBox(h) {
  let height = h;
  return {
    get offsetHeight() {
      if (dirty) { layouts++; dirty = false; }
      return height;
    },
    setHeight(px) { height = px; dirty = true; },
  };
}
const boxes = [makeBox(10), makeBox(20), makeBox(30)];
for (const box of boxes) {
  box.setHeight(box.offsetHeight * 2);
}
console.log("layouts: " + layouts);
console.log(boxes.map((b) => b.offsetHeight).join(" "));`,
      expected: "layouts: 1\n20 40 60",
      hint: "اقرأ كل الارتفاعات أولاً في مصفوفة (boxes.map((b) => b.offsetHeight))، ثم في حلقة ثانية اكتب كل واحد مضاعفاً.",
      solution: `let layouts = 0;
let dirty = true;
function makeBox(h) {
  let height = h;
  return {
    get offsetHeight() {
      if (dirty) { layouts++; dirty = false; }
      return height;
    },
    setHeight(px) { height = px; dirty = true; },
  };
}
const boxes = [makeBox(10), makeBox(20), makeBox(30)];
const heights = boxes.map((b) => b.offsetHeight);
boxes.forEach((box, i) => box.setHeight(heights[i] * 2));
console.log("layouts: " + layouts);
console.log(boxes.map((b) => b.offsetHeight).join(" "));`,
    },
    {
      kind: "write",
      title: "تذكّر الأجوبة",
      prompt: "اكتب memoize(fn) التي تعيد دالة تحفظ جواب كل مدخل (مدخل واحد) في Map، ولا تستدعي fn إلا لمدخل لم تره. يُطبع 16 16 25 2.",
      starter: `// write memoize(fn): calls fn once per distinct argument

let calls = 0;
function slowSquare(n) {
  calls++;
  return n * n;
}
const fastSquare = memoize(slowSquare);
console.log(fastSquare(4), fastSquare(4), fastSquare(5), calls);`,
      expected: "16 16 25 2",
      hint: "أنشئ const cache = new Map() داخل memoize، وأعد دالة: إن كان cache.has(x) فأعد cache.get(x)، وإلا احسب fn(x) واحفظه ثم أعده.",
      solution: `function memoize(fn) {
  const cache = new Map();
  return (x) => {
    if (cache.has(x)) return cache.get(x);
    const value = fn(x);
    cache.set(x, value);
    return value;
  };
}

let calls = 0;
function slowSquare(n) {
  calls++;
  return n * n;
}
const fastSquare = memoize(slowSquare);
console.log(fastSquare(4), fastSquare(4), fastSquare(5), calls);`,
    },
  ],
  quiz: [
    {
      question: "المحلّل يقول: render 70% من الوقت، و formatDate 5%. جعلت formatDate أسرع 10 مرات. كم يتحسن الطلب كله؟",
      code: "// profile of one request (1000ms)\n// render      700ms\n// formatDate   50ms\n// other       250ms",
      options: ["نحو 4.5% فقط", "نحو 90%", "نحو 50%"],
      answer: 0,
      why: "formatDate كانت 50ms فصارت 5ms: وفّرت 45ms من 1000. تسريع جزء لا يوفّر أكثر من حصته من الوقت (قانون أمدال). لهذا يأتي المحلّل قبل التحسين: render هي المكان الذي يستحق الجهد.",
    },
    {
      question: "دالة ساخنة تقرأ user.name ملايين المرات. أي طريقة لبناء المستخدمين تبقيها أسرع؟",
      code: "// A\nconst user = { name, email: email ?? null, phone: phone ?? null };\n\n// B\nconst user = { name };\nif (email) user.email = email;\nif (phone) user.phone = phone;",
      options: ["A: كل المستخدمين بشكل واحد", "B: كائنات أصغر فهي أسرع", "لا فرق في V8"],
      answer: 0,
      why: "في A كل كائن له الخصائص نفسها بالترتيب نفسه: شكل واحد، والوصول user.name يبقى أحادي الشكل وسريعاً. في B قد تظهر أربعة أشكال حسب البيانات، فيبطؤ كل وصول في الدالة الساخنة. قيمة null أرخص من خاصية مفقودة.",
    },
    {
      question: "50,000 طلب و 10,000 عميل مميز. كم مقارنة في أسوأ حالة؟",
      code: "const vipOrders = orders.filter((o) => vipIds.includes(o.userId));",
      options: ["500 مليون", "60 ألفاً", "50 ألفاً"],
      answer: 0,
      why: "includes تبحث في المصفوفة كلها لكل طلب: 50,000 × 10,000. مع const vip = new Set(vipIds) ثم vip.has(o.userId) يصبح كل بحث خطوة واحدة تقريباً: 50,000 خطوة وبناء المجموعة 10,000. كود يبدو بريئاً، وحلقة مخفية داخل حلقة.",
    },
    {
      question: "ماذا يُطبع في السطر الأخير؟",
      code: "const rates = { USD: 3.75 };\nconst toSar = memoize((usd) => usd * rates.USD);\nconsole.log(toSar(100)); // 375\nrates.USD = 3.8;\nconsole.log(toSar(100));",
      options: ["375: الجواب القديم المحفوظ", "380", "undefined"],
      answer: 0,
      why: "التذكّر يفترض أن الجواب يعتمد على المدخل وحده. هذه الدالة تقرأ rates من الخارج، فهي ليست نقية، والمخزن لا يعرف أن السعر تغيّر. تذكّر الدوال النقية فقط، أو اجعل كل ما تعتمد عليه جزءاً من المفتاح، أو امسح المخزن عند التغيير.",
    },
    {
      question: "هذا القياس طبع 4ms لعشرة ملايين ضرب. ما المشكلة فيه؟",
      code: 'console.time("loop");\nfor (let i = 0; i < 1e7; i++) {\n  const y = i * 2;\n}\nconsole.timeEnd("loop");',
      options: [
        "y لا يُستعمل، فالمترجم المحسِّن قد يحذف العمل كله: القياس لا يقيس ما تظن",
        "console.time غير دقيقة دائماً",
        "لا مشكلة: الضرب بهذه السرعة فعلاً",
      ],
      answer: 0,
      why: "المترجم المحسِّن يحذف الحسابات التي لا يُستعمل ناتجها. القياسات الدقيقة لسطر واحد تكذب بسهولة: المحرك يحسّن أو يحذف أو يحمّي بطرق لا تحدث في برنامجك الحقيقي. قِس الكود الحقيقي ببيانات حقيقية، واستعمل الناتج.",
    },
  ],
  next: "js-architecture",
};
