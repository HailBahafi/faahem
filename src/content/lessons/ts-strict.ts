import type { Cell, Lesson, Scene } from "@/lib/types";

/** What the checker believes about a name, next to what the drawer really holds. */
const ty = (name: string, expr: string): Cell => ({ name, value: expr, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

export const tsStrict: Lesson = {
  slug: "ts-strict",
  stage: 0,
  number: "4.1",
  title: "إعدادات strict",
  subtitle: "strict ليست مفتاحاً واحداً: كل علَم يسدّ ثقباً محدداً يتسرّب منه انهيار حقيقي",
  minutes: 28,
  problem: {
    title: "خمس ثغرات، خمسة أعلام",
    body: "برنامج صغير فيه خمسة أخطاء، و tsc بإعداداته الافتراضية يقول: لا شيء. شغّل الأعلام واحداً واحداً، وراقب أي سطر يحمرّ، وكم انهياراً بقي ينتظر المستخدم.",
    demo: "tsStrict",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `// tsconfig: "strict": true, "noUncheckedIndexedAccess": true
const prices: Record<string, number> = { tea: 5, coffee: 8 };
function priceOf(item: string): string {
  const p = prices[item];
  if (p === undefined) return "unknown";
  return p.toFixed(2);
}
console.log(priceOf("tea"));
console.log(priceOf("cake"));`,
    },
    steps: [
      {
        line: null,
        say: "المدقّق يحمل لكل اسم ملصقاً، والذاكرة تحمل القيمة الحقيقية. الخطأ الخطير هو حين يكذب الملصق: يقول number والدرج فيه undefined. كل علَم صارم يمنع نوعاً من هذه الكذبات.",
        memory: [],
      },
      {
        line: 1,
        say: "strict: true تشغّل عائلة كاملة: strictNullChecks و noImplicitAny و strictFunctionTypes وغيرها. أما noUncheckedIndexedAccess فليست منها، نشغّلها بيدنا.",
        memory: [ty("strict", "on"), ty("noUncheckedIndexedAccess", "on")],
        changed: ["strict", "noUncheckedIndexedAccess"],
      },
      {
        line: 2,
        say: "Record<string, number> وعد: «أي مفتاح نصي يعطيك رقماً». الكائن الحقيقي فيه مفتاحان فقط. الوعد أوسع من الواقع.",
        memory: [ty("prices", "Record<string, number>"), { name: "prices (heap)", value: "{ tea: 5, coffee: 8 }", type: "none" }],
        changed: ["prices"],
      },
      {
        line: 4,
        say: "قراءة بمفتاح عشوائي. بلا العلَم يكتب المدقّق على p الملصق number. مع noUncheckedIndexedAccess يكتب number | undefined، لأن المفتاح قد لا يكون موجوداً.",
        memory: [ty("prices", "Record<string, number>"), ty("tsc sees p as", "number | undefined")],
        changed: ["tsc sees p as"],
      },
      {
        line: 6,
        say: "لو حذفنا السطر 5، لقال tsc هنا: 'p' is possibly 'undefined'. هذا الخطأ هو الانهيار نفسه، اكتُشف قبل أن يعمل البرنامج.",
        memory: [ty("tsc sees p as", "number | undefined")],
        error: "TS18048: 'p' is possibly 'undefined'. (بلا السطر 5)",
      },
      {
        line: 5,
        say: "السطر 5 يضيّق النوع: بعد if (p === undefined) return، يعرف المدقّق أن ما تحته يرى p رقماً فقط.",
        memory: [ty("tsc sees p as (after line 5)", "number")],
        changed: ["tsc sees p as (after line 5)"],
      },
      {
        line: 8,
        say: "priceOf(\"tea\"): p يأخذ 5، الشرط خطأ، فيُطبع 5.00.",
        memory: [{ name: "item", value: '"tea"', type: "string" }, { name: "p", value: "5", type: "number" }],
        changed: ["p"],
        output: ["5.00"],
      },
      {
        line: 9,
        say: "priceOf(\"cake\"): المفتاح غير موجود، فالدرج p يحمل undefined فعلاً. الشرط صحيح، فترجع الدالة \"unknown\" بدل أن تنهار.",
        memory: [{ name: "item", value: '"cake"', type: "string" }, { name: "p", value: "undefined", type: "none" }],
        changed: ["p"],
        output: ["5.00", "unknown"],
      },
      {
        line: null,
        say: "بالإعدادات الافتراضية كان الكود بلا السطر 5 يمرّ بلا خطأ، ثم ينهار عند المستخدم: Cannot read properties of undefined (reading 'toFixed'). العلَم نقل الانهيار من وقت التشغيل إلى وقت الكتابة.",
        memory: [{ name: "p", value: "undefined", type: "none" }],
      },
    ],
    notes: {
      ts: "strict عائلة تكبر مع كل إصدار، و noUncheckedIndexedAccess و exactOptionalPropertyTypes خارجها لأنها تكسر كوداً كثيراً. المشاريع الجديدة تشغّل الثلاثة من اليوم الأول.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة للمدقّق: لكل خطأ في البرنامج علَم يكتشفه. شغّل الأعلام في الكائن flags وراقب: كم خطأ يُكتشف وقت الكتابة، وكم يصل إلى المستخدم.",
    starter: `const flags = {
  strictNullChecks: false,
  noImplicitAny: false,
  strictFunctionTypes: false,
  noUncheckedIndexedAccess: false,
  exactOptionalPropertyTypes: false,
};
const bugs = [
  { flag: "strictNullChecks", line: "users.find(...).name" },
  { flag: "noImplicitAny", line: "function total(items)" },
  { flag: "strictFunctionTypes", line: "const h: Handler = onlyStrings" },
  { flag: "noUncheckedIndexedAccess", line: "prices[item].toFixed(2)" },
  { flag: "exactOptionalPropertyTypes", line: "{ ...defaults, timeout: undefined }" },
];
let caught = 0;
for (const bug of bugs) {
  if (flags[bug.flag]) {
    caught++;
    console.log("tsc error: " + bug.line);
  } else {
    console.log("ships, may crash later: " + bug.line);
  }
}
console.log(caught + " of " + bugs.length + " caught before running");`,
    challenges: [
      "اجعل strictNullChecks true وحدها. أي سطر انتقل من «قد ينهار» إلى «خطأ tsc»؟",
      "strict: true تشغّل الثلاثة الأولى. اجعلها true وتوقّع العدد قبل التشغيل.",
      "شغّل الخمسة. هذه إعدادات مشروع جديد احترافي. كم بقي يصل إلى المستخدم من هذه القائمة؟",
    ],
  },
  predict: [
    {
      question: "مع strict: true، ماذا يقول tsc؟",
      code: `type Handler = (e: string | number) => void;
const onlyStrings = (e: string) => console.log(e.toUpperCase());
const h: Handler = onlyStrings;
h(42);`,
      options: ["خطأ في السطر 3: '(e: string) => void' is not assignable to type 'Handler'", "لا خطأ، وينهار h(42) وقت التشغيل", "خطأ في السطر 4: 42 ليس string"],
      answer: 0,
      why: "Handler يعد من يستدعيه أنه يستطيع تمرير رقم. onlyStrings لا تعرف إلا النصوص. strictFunctionTypes يفحص المعاملات بالاتجاه المعاكس: الدالة المخزّنة يجب أن تقبل كل ما قد يُمرّر لها. بلا العلَم يمرّ السطر 3، وينهار h(42) بـ toUpperCase is not a function.",
      scene: check(
        `type Handler = (e: string | number) => void;
const onlyStrings = (e: string) => console.log(e.toUpperCase());
const h: Handler = onlyStrings;
h(42);`,
        [
          { line: 1, say: "العقد: من يملك Handler يحق له أن يمرّر نصاً أو رقماً.", memory: [ty("Handler", "(e: string | number) => void")], changed: ["Handler"] },
          { line: 3, say: "هل تقبل onlyStrings كل ما يقبله العقد؟ لا: الرقم لا تقبله. المعاملات تُفحص بالعكس.", memory: [ty("onlyStrings", "(e: string) => void")], error: "TS2322: Type '(e: string) => void' is not assignable to type 'Handler'." },
          { line: 4, say: "لولا العلَم لوصلنا هنا: 42 يدخل دالة تنتظر نصاً، و (42).toUpperCase ليست دالة.", memory: [{ name: "e", value: "42", type: "number" }], error: "TypeError: e.toUpperCase is not a function (بلا strictFunctionTypes)" },
        ],
      ),
    },
    {
      question: "مع strict و exactOptionalPropertyTypes، أي سطر يحمرّ؟",
      code: `interface Options { timeout?: number }
const a: Options = {};
const b: Options = { timeout: undefined };`,
      options: ["السطر 3 فقط", "لا شيء: timeout اختياري في الحالتين", "السطران 2 و 3"],
      answer: 0,
      why: "timeout?: number يعني «المفتاح قد يغيب». بلا العلَم يعامله tsc كأنه number | undefined، فيقبل كتابة undefined صراحة. مع العلَم: غياب المفتاح شيء، ووجوده بقيمة undefined شيء آخر. الفرق حقيقي: { ...defaults, ...b } يمحو timeout الافتراضي، و \"timeout\" in b صحيح.",
      scene: check(
        `interface Options { timeout?: number }
const a: Options = {};
const b: Options = { timeout: undefined };`,
        [
          { line: 2, say: "كائن بلا مفتاح timeout: هذا ما تعنيه علامة ? بالضبط.", memory: [{ name: "a", value: "{}", type: "none" }], changed: ["a"] },
          { line: 3, say: "مفتاح موجود قيمته undefined. مع exactOptionalPropertyTypes هذا ليس «غياباً».", memory: [{ name: "b", value: "{ timeout: undefined }", type: "none" }], error: "TS2375: Type '{ timeout: undefined; }' is not assignable to type 'Options' with 'exactOptionalPropertyTypes: true'." },
        ],
      ),
    },
    {
      question: "مع strict: true، ماذا يقول tsc عن هذه الدالة؟",
      code: `function total(items) {
  return items.reduce((sum, n) => sum + n, 0);
}`,
      options: ["Parameter 'items' implicitly has an 'any' type.", "لا خطأ: items نوعه any", "لا خطأ: يستنتج tsc أن items مصفوفة أرقام"],
      answer: 0,
      why: "tsc لا يستنتج نوع معامل من طريقة استعماله داخل الدالة. بلا نوع يصبح any بصمت، و any يطفئ الفحص في كل مكان يصل إليه. noImplicitAny يرفض الصمت: اكتب items: number[]، أو any صراحة إن كنت تقصدها.",
      scene: check(
        `function total(items) {
  return items.reduce((sum, n) => sum + n, 0);
}`,
        [
          { line: 1, say: "معامل بلا ملصق. المدقّق لا يخمّن من الجسم.", memory: [ty("items", "any (implicit)")], error: "TS7006: Parameter 'items' implicitly has an 'any' type." },
          { line: 2, say: "لو مرّ any، لقبل tsc total(\"abc\") و total(null) بلا كلمة.", memory: [ty("items", "any")] },
        ],
      ),
    },
  ],
  code: {
    intro: "هذه هي الانهيارات نفسها وقت التشغيل، كل واحد بجانب العلَم الذي يمنعه. المحترف يقرأ رسالة tsc كتقرير عن انهيار لم يحدث بعد. شغّل وانظر ما يصل إلى المستخدم حين تكون الأعلام مطفأة.",
    runnerLang: "ts",
    runnerStarter: `// 1. noUncheckedIndexedAccess: an index read may miss.
const stock: Record<string, number> = { tea: 3 };
console.log("cake stock:", stock["cake"]); // undefined, though the type said number

// 2. exactOptionalPropertyTypes: present-but-undefined wipes a default.
const defaults = { timeout: 1000, retries: 3 };
const userOpts: { timeout?: number } = { timeout: undefined };
console.log("merged timeout:", { ...defaults, ...userOpts }.timeout); // undefined, not 1000

// 3. strictFunctionTypes: a narrow handler stored where a wide one is expected.
type Listener = (v: string | number) => void;
const shout = ((v: string) => v.toUpperCase()) as Listener; // the cast hides the tsc error
try {
  shout(42);
} catch (e) {
  // 4. useUnknownInCatchVariables (in strict): e is unknown, so narrow before reading .message.
  console.log("crash:", e instanceof Error ? e.message : String(e));
}

// 5. strictNullChecks: find can miss.
const users = [{ id: 1, name: "Sara" }];
const u = users.find((x) => x.id === 2);
console.log("name:", u?.name ?? "no such user");
// try: remove ?. and ?? above. What prints? What would tsc --strict say?
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "قراءة لا تنهار",
      prompt: "مع noUncheckedIndexedAccess، أول كلمة في النص نوعها string | undefined. رتّب الدالة لتطبع: Sara ثم (empty)",
      lines: [
        "function firstWord(text: string): string {",
        '  const word = text.trim().split(" ")[0];',
        '  if (word === undefined || word === "") return "(empty)";',
        "  return word;",
        "}",
        'console.log(firstWord("Sara Ahmed"));',
        'console.log(firstWord("   "));',
      ],
      expected: "Sara\n(empty)",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "إعداد غائب أو undefined",
      prompt: "المستخدم قد يمرّر timeout: undefined صراحة، وقد يمرّر 0 عمداً (بلا مهلة). أي تعبير يحترم الحالتين؟ الناتج: 1000 0",
      template: `const defaults = { timeout: 1000, retries: 3 };
function withDefaults(opts: { timeout?: number | undefined; retries?: number }) {
  return { timeout: ___, retries: opts.retries ?? defaults.retries };
}
console.log(withDefaults({ timeout: undefined }).timeout, withDefaults({ timeout: 0 }).timeout);`,
      options: ["opts.timeout ?? defaults.timeout", "opts.timeout || defaults.timeout", "{ ...defaults, ...opts }.timeout"],
      expected: "1000 0",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "as أخفى الخطأ",
      prompt: "tsc رفض تخزين دالة تقبل النصوص فقط في قائمة تستقبل نصوصاً وأرقاماً، فأسكته أحدهم بـ as. emit(42) ينهار. أزل as واجعل الدالة تقبل النوعين. الناتج: OK ثم 42",
      code: `type Listener = (value: string | number) => void;
const listeners: Listener[] = [];
function on(l: Listener) {
  listeners.push(l);
}
function emit(value: string | number) {
  for (const l of listeners) l(value);
}
on(((v: string) => console.log(v.toUpperCase())) as Listener);
emit("ok");
emit(42);`,
      expected: "OK\n42",
      hint: "اكتب on((v) => console.log(typeof v === \"string\" ? v.toUpperCase() : v)). المدقّق يعطي v النوع string | number من Listener، و typeof يضيّقه.",
      solution: `type Listener = (value: string | number) => void;
const listeners: Listener[] = [];
function on(l: Listener) {
  listeners.push(l);
}
function emit(value: string | number) {
  for (const l of listeners) l(value);
}
on((v) => console.log(typeof v === "string" ? v.toUpperCase() : v));
emit("ok");
emit(42);`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "سلة لا تقبل منتجاً بلا سعر",
      prompt: "اكتب totalPrice(cart: string[], prices: Record<string, number>): number. القراءة prices[item] نوعها number | undefined: إن كانت undefined ارمِ Error(\"no price: \" + item). اطبع totalPrice([\"tea\", \"coffee\"], prices)، ثم في try/catch اطبع رسالة totalPrice([\"tea\", \"cake\"], prices). الناتج: 13 ثم no price: cake",
      starter: `const prices: Record<string, number> = { tea: 5, coffee: 8 };
// write totalPrice here, then print the two results
`,
      expected: "13\nno price: cake",
      hint: "for (const item of cart) { const p = prices[item]; if (p === undefined) throw new Error(\"no price: \" + item); sum += p; }",
      solution: `const prices: Record<string, number> = { tea: 5, coffee: 8 };
function totalPrice(cart: string[], prices: Record<string, number>): number {
  let sum = 0;
  for (const item of cart) {
    const p = prices[item];
    if (p === undefined) throw new Error("no price: " + item);
    sum += p;
  }
  return sum;
}
console.log(totalPrice(["tea", "coffee"], prices));
try {
  totalPrice(["tea", "cake"], prices);
} catch (e) {
  console.log(e instanceof Error ? e.message : e);
}`,
    },
  ],
  quiz: [
    {
      question: "مع strict: true، ماذا يقول tsc؟",
      code: `try {
  JSON.parse("{");
} catch (e) {
  console.log(e.message);
}`,
      options: ["'e' is of type 'unknown'.", "لا خطأ: e نوعه Error", "لا خطأ: e نوعه any"],
      answer: 0,
      why: "أي شيء يمكن رميه في JavaScript: نص أو رقم أو null. strict تشمل useUnknownInCatchVariables، فيصبح e من نوع unknown، ولا تقرأ منه شيئاً حتى تضيّقه: e instanceof Error.",
    },
    {
      question: "مع strict: true فقط (بلا noUncheckedIndexedAccess)، ما نوع x عند tsc، وما قيمته عند التشغيل؟",
      code: `const scores: number[] = [];
const x = scores[0];`,
      options: ["tsc: number، والقيمة undefined", "tsc: number | undefined، والقيمة undefined", "tsc: خطأ، المصفوفة فارغة"],
      answer: 0,
      why: "strict لا تشمل noUncheckedIndexedAccess. tsc يفترض أن كل قراءة بفهرس تصيب، فيكتب number. الدرج الحقيقي فيه undefined. هذه الكذبة هي سبب تشغيل العلَم يدوياً في المشاريع الجادة.",
    },
    {
      question: "مع strict: true، هل يحمرّ السطر 2؟",
      code: `interface Box { set(v: string | number): void }
const b: Box = { set(v: string) { console.log(v.toUpperCase()); } };`,
      options: ["لا: الدوال المكتوبة بصيغة method مستثناة من strictFunctionTypes", "نعم: الخطأ نفسه كما مع Handler", "نعم، لكن فقط مع noImplicitAny"],
      answer: 0,
      why: "strictFunctionTypes تفحص الخصائص المكتوبة بصيغة سهم: set: (v: string | number) => void. صيغة method، set(v): void، تبقى بالفحص المتساهل القديم لأسباب توافق مع مكتبات DOM. لذلك يفضّل المحترفون صيغة السهم في الواجهات التي يملكونها.",
    },
    {
      question: "مع strict: true، ماذا يقول tsc؟",
      code: `class User {
  name: string;
  constructor() {}
}`,
      options: ["Property 'name' has no initializer and is not definitely assigned in the constructor.", "لا خطأ: name يأخذ \"\" تلقائياً", "لا خطأ: name يصبح string | undefined"],
      answer: 0,
      why: "strictPropertyInitialization: الملصق يقول string، لكن الكائن الجديد يخرج من constructor ودرج name فيه undefined. أعطه قيمة في constructor أو عند تعريفه.",
    },
    {
      question: "مع strict: true، ماذا يقول tsc عن السطر 2؟",
      code: `function double(n: number) { return n * 2; }
double.call(null, "x");`,
      options: ["Argument of type 'string' is not assignable to parameter of type 'number'.", "لا خطأ: call تقبل أي شيء", "لا خطأ، والناتج NaN"],
      answer: 0,
      why: "strictBindCallApply يجعل call و bind و apply تحمل توقيع الدالة الأصلية. بدونه ترجع any وتقبل أي وسيط، ويخرج NaN بصمت.",
    },
  ],
  next: "ts-library-types",
};
