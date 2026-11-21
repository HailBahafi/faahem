import type { Cell, Lesson, Scene } from "@/lib/types";

/** A drawer that holds a function or a description: drawn as plain text. */
const fn = (name: string, what: string): Cell => ({ name, value: what, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const ORIGINAL = fn("method", "add (original)");
const CTX = fn("context", '{ kind: "method", name: "add" }');

export const tsDecorators: Lesson = {
  slug: "ts-decorators",
  stage: 0,
  number: "3.6",
  title: "decorators",
  subtitle: "دالة تستقبل method عند تعريف الصنف، وترجع method جديدة تلفّها",
  minutes: 25,
  problem: {
    title: "السلوك نفسه حول كل method",
    body: "تريد تسجيل كل استدعاء، ورفض الأسعار السالبة، وتقريب الكسور، في عشرات الدوال. فعّل الطبقات ورتّبها، ثم استدعِ add. راقب الاستدعاء يعبر الطبقات من الخارج إلى الداخل.",
    demo: "tsDecorators",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `function logged(method: (...args: number[]) => number, context: ClassMethodDecoratorContext) {
  return function (this: unknown, ...args: number[]): number {
    console.log(\`\${String(context.name)}(\${args.join(", ")})\`);
    return method.apply(this, args);
  };
}
class Cart {
  total = 0;
  @logged add(price: number): number { this.total += price; return this.total; }
}
console.log(new Cart().add(800));`,
    },
    steps: [
      {
        line: null,
        say: "هذه decorators القياسية (TC39)، المدعومة منذ TypeScript 5.0 بلا الخيار experimentalDecorators. ومشغّل الموقع لا يفهم صيغة @ بعد، فسنرى الآلة هنا، وننفّذ الشيء نفسه بدوال عادية في المحطات القادمة.",
        memory: [],
      },
      {
        line: 1,
        say: "logged دالة عادية. تأخذ شيئين: الـ method الأصلية، وكائن context يصف ما زُيِّن (نوعه واسمه).",
        memory: [fn("logged", "function")],
        changed: ["logged"],
      },
      {
        line: 7,
        say: "JavaScript يبدأ تعريف الصنف Cart. يصنع الدالة add الأصلية. لا كائن Cart موجود بعد.",
        memory: [fn("logged", "function"), fn("Cart.prototype.add", "add (original)")],
        changed: ["Cart.prototype.add"],
      },
      {
        line: 9,
        say: "يصل إلى @logged، فيستدعي logged مرة واحدة: المعامل الأول add الأصلية، والثاني context اسمه \"add\".",
        memory: [fn("logged", "function"), ORIGINAL, CTX],
        changed: ["method", "context"],
      },
      {
        line: 2,
        say: "logged تصنع دالة جديدة (غلافاً) وترجعها. الغلاف closure: يتذكر method و context بعد انتهاء logged.",
        memory: [ORIGINAL, CTX, fn("returned", "wrapper")],
        changed: ["returned"],
      },
      {
        line: 9,
        say: "الصنف يضع الغلاف مكان add. من الآن Cart.prototype.add هي الغلاف، والأصلية محفوظة داخله. حدث هذا مرة واحدة، عند التعريف.",
        memory: [fn("Cart.prototype.add", "wrapper → add (original)")],
        changed: ["Cart.prototype.add"],
      },
      {
        line: 11,
        say: "new Cart() يصنع كائناً فيه total = 0. ثم .add(800): من يُستدعى فعلاً هو الغلاف.",
        memory: [fn("Cart.prototype.add", "wrapper → add (original)"), { name: "cart.total", value: "0", type: "number" }],
        changed: ["cart.total"],
      },
      {
        line: 3,
        say: "الغلاف يطبع add(800) أولاً. context.name قيمته \"add\"، فالسطر نفسه يعمل مع أي method.",
        memory: [{ name: "cart.total", value: "0", type: "number" }, { name: "args", value: "[800]", type: "none" }],
        read: ["args"],
      },
      {
        line: 4,
        say: "method.apply(this, args) يستدعي الأصلية بالـ this نفسه (الكائن cart) وبالمعاملات نفسها. total يصير 800، وترجع 800.",
        memory: [{ name: "cart.total", value: "800", type: "number" }],
        changed: ["cart.total"],
      },
      {
        line: 11,
        say: "يُطبع سطران: add(800) من الغلاف، ثم 800 من console.log. والمدقّق فحص الأنواع قبل كل هذا: الـ method يجب أن تناسب (...args: number[]) => number.",
        memory: [{ name: "cart.total", value: "800", type: "number" }],
      },
      {
        line: null,
        say: "الخلاصة: @logged add يساوي add = logged(add, context)، مرة واحدة عند تعريف الصنف. هذه دالة من رتبة أعلى، وهي ما سنكتبه بأيدينا.",
        memory: [],
      },
    ],
    notes: {
      ts: "decorator القياسي يأخذ (value, context) ويرجع بديلاً أو لا شيء. القديم في experimentalDecorators يأخذ (target, key, descriptor) ويختلف في التوقيت والأنواع، فلا تخلط بينهما. مشغّل الموقع (sucrase ثم المتصفح) لا يشغّل @ بعد، فالتمارين تكتب الدوال نفسها يدوياً.",
    },
  },
  playground: {
    kind: "trace",
    intro: "هذا ما يفعله @logged، بلا صنف وبلا @: دالة تأخذ دالة وترجع غلافاً. شغّل وراقب من يُستدعى أولاً.",
    starter: `function logged(method, name) {
  return function (price) {
    console.log("call " + name + "(" + price + ")");
    return method(price);
  };
}
let total = 0;
function add(price) {
  total = total + price;
  return total;
}
const loggedAdd = logged(add, "add");
console.log(loggedAdd(800));
console.log(loggedAdd(1550));`,
    challenges: [
      "كم مرة تُستدعى logged نفسها؟ وكم مرة يُستدعى الغلاف؟ هذا الفرق بين وقت التعريف ووقت الاستدعاء.",
      "اكتب positive(method) ترمي خطأ إن كان price أصغر من 1، ثم لفّ: logged(positive(add), \"add\"). استدعِ بـ -5: هل يُطبع call قبل الخطأ؟",
      "بدّل الترتيب: positive(logged(add, \"add\")). ماذا تغيّر في الناتج مع -5؟",
    ],
  },
  predict: [
    {
      question: "لا أحد يستدعي m. ماذا يُطبع عند تعريف الصنف؟",
      code: `function tag(label: string) {
  return function (method: unknown, context: ClassMethodDecoratorContext) {
    console.log("apply " + label);
  };
}
class A {
  @tag("outer") @tag("inner") m() {}
}`,
      options: ["apply inner ثم apply outer", "apply outer ثم apply inner", "لا شيء حتى يُستدعى m"],
      answer: 0,
      why: "الـ decorators تُطبَّق من الأقرب إلى الـ method نحو الخارج: inner يلفّ m أولاً، ثم outer يلفّ الناتج. فـ outer هو الطبقة الخارجية، وعند الاستدعاء يعمل أولاً.",
      scene: check(
        `function tag(label: string) {
  return function (method: unknown, context: ClassMethodDecoratorContext) {
    console.log("apply " + label);
  };
}
class A {
  @tag("outer") @tag("inner") m() {}
}`,
        [
          { line: 7, say: "tag(\"outer\") ثم tag(\"inner\") تُقيَّمان من اليسار، فتعطيان دالتين.", memory: [fn("outer", "decorator"), fn("inner", "decorator")] },
          { line: 7, say: "التطبيق يبدأ بالأقرب إلى m: inner.", memory: [fn("m", "inner(m)")], changed: ["m"], output: ["apply inner"] },
          { line: 7, say: "ثم outer على ما رجع من inner.", memory: [fn("m", "outer(inner(m))")], changed: ["m"], output: ["apply inner", "apply outer"] },
        ],
      ),
    },
    {
      question: "ماذا يُطبع؟",
      code: `function mark(method: unknown, context: ClassMethodDecoratorContext) {
  console.log("mark " + String(context.name));
}
class Greeter {
  @mark hi() { return "hi"; }
}
console.log("ready");`,
      options: ["mark hi ثم ready", "ready فقط", "ready ثم mark hi"],
      answer: 0,
      why: "الـ decorator يعمل عند تعريف الصنف، قبل أي new وقبل أي استدعاء. ولأن mark لا ترجع شيئاً، تبقى hi الأصلية كما هي.",
      scene: check(
        `function mark(method: unknown, context: ClassMethodDecoratorContext) {
  console.log("mark " + String(context.name));
}
class Greeter {
  @mark hi() { return "hi"; }
}
console.log("ready");`,
        [
          { line: 5, say: "تعريف الصنف يستدعي mark فوراً.", memory: [CTX], output: ["mark hi"] },
          { line: 7, say: "ثم يكمل البرنامج.", memory: [], output: ["mark hi", "ready"] },
        ],
      ),
    },
    {
      question: "بلا experimentalDecorators، ماذا يقول tsc عن السطر 5؟",
      code: `function old(target: any, key: string, descriptor: PropertyDescriptor) {
  return descriptor;
}
class A {
  @old m() {}
}`,
      options: ["Unable to resolve signature of method decorator when called as an expression.", "لا خطأ", "Cannot find name 'old'."],
      answer: 0,
      why: "هذا توقيع الـ decorators القديمة. القياسية تُستدعى بمعاملين (value, context)، و tsc يشرح: The runtime will invoke the decorator with 2 arguments, but the decorator expects 3. كود قديم يحتاج ترحيلاً، أو الخيار القديم.",
      scene: check(
        `function old(target: any, key: string, descriptor: PropertyDescriptor) {
  return descriptor;
}
class A {
  @old m() {}
}`,
        [
          { line: 5, say: "tsc يقارن: سيُستدعى بمعاملين، والدالة تطلب ثلاثة.", memory: [fn("old", "(target, key, descriptor)")], error: "Unable to resolve signature of method decorator when called as an expression." },
        ],
      ),
    },
  ],
  code: {
    intro: "المشغّل هنا لا يفهم @، فنكتب ما يفعله الصنف بنفسه: add = logged(positive(add)). هذه الدوال هي decorators حرفياً بلا السكّر. لاحظ method.apply(this, args): الغلاف يمرّر this نفسه، وإلا ضاع الكائن.",
    runnerLang: "ts",
    runnerStarter: `// With standard decorators (TS 5+):  class Cart { @logged @positive add(price: number) {...} }
// The class runs that as:  add = logged(positive(add)). Here we do it by hand.
type Method<This, A extends unknown[], R> = (this: This, ...args: A) => R;

function logged<This, A extends unknown[], R>(method: Method<This, A, R>, name: string): Method<This, A, R> {
  return function (this: This, ...args: A): R {
    console.log(\`\${name}(\${args.join(", ")})\`);
    return method.apply(this, args);
  };
}

function positive<This, R>(method: Method<This, [number], R>): Method<This, [number], R> {
  return function (this: This, n: number): R {
    if (n <= 0) throw new RangeError("must be positive: " + n);
    return method.call(this, n);
  };
}

const cart = {
  total: 0,
  add(price: number): number {
    this.total += price;
    return this.total;
  },
};
cart.add = logged(positive(cart.add), "add");
console.log(cart.add(800));
try {
  cart.add(-5);
} catch (e) {
  console.log((e as Error).message);
}
// try: swap the order to positive(logged(cart.add, "add")). Is add(-5) still logged?
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "غلاف يسجّل",
      prompt: "رتّب logged ثم لفّ بها دالة. الناتج سطران: double(4) ثم 8",
      lines: [
        "function logged<A extends unknown[], R>(fn: (...args: A) => R, name: string): (...args: A) => R {",
        "  return (...args: A): R => {",
        "    console.log(`${name}(${args.join(\", \")})`);",
        "    return fn(...args);",
        "  };",
        "}",
        'const double = logged((n: number) => n * 2, "double");',
        "console.log(double(4));",
      ],
      expected: "double(4)\n8",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "لا تُضِع this",
      prompt: "الغلاف يلفّ method تستعمل this.total. أي استدعاء يمرّر الكائن نفسه؟ الناتج سطران: call 800 ثم 800",
      template: `function logged<This, A extends unknown[], R>(method: (this: This, ...args: A) => R) {
  return function (this: This, ...args: A): R {
    console.log("call", args.join(","));
    return ___;
  };
}
const cart = { total: 0, add(price: number) { this.total += price; return this.total; } };
cart.add = logged(cart.add);
console.log(cart.add(800));`,
      options: ["method.apply(this, args)", "method(...args)", "method"],
      expected: "call 800\n800",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "مرة واحدة فقط",
      prompt: "once (مثل @once) يجب أن تستدعي الدالة مرة واحدة وتعيد النتيجة نفسها بعدها. لكنها تتصل في كل مرة. أصلحها ليُطبع: 1",
      code: `function once<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  let done = false;
  let result: R | undefined;
  return (...args: A) => {
    if (!done) {
      result = fn(...args);
    }
    return result as R;
  };
}
let connections = 0;
const connect = once(() => ++connections);
connect();
connect();
console.log(connections);`,
      expected: "1",
      hint: "بعد result = fn(...args); اكتب done = true; وإلا بقي done خطأً إلى الأبد.",
      solution: `function once<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  let done = false;
  let result: R | undefined;
  return (...args: A) => {
    if (!done) {
      result = fn(...args);
      done = true;
    }
    return result as R;
  };
}
let connections = 0;
const connect = once(() => ++connections);
connect();
connect();
console.log(connections);`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "أعد المحاولة",
      prompt: "اكتب retry<R>(fn: () => R, times: number): R: تستدعي fn حتى تنجح، بحد أقصى times مرة، وإن فشلت كلها ترمي آخر خطأ. flaky تفشل مرتين ثم تنجح. اطبع retry(flaky, 5) و attempts: ok 3",
      starter: `let attempts = 0;
function flaky(): string {
  attempts++;
  if (attempts < 3) throw new Error("network down");
  return "ok";
}
// write retry here, then print retry(flaky, 5) and attempts
`,
      expected: "ok 3",
      hint: "let lastError: unknown; حلقة for من 0 إلى times، وفيها try { return fn(); } catch (e) { lastError = e; }. بعد الحلقة throw lastError.",
      solution: `let attempts = 0;
function flaky(): string {
  attempts++;
  if (attempts < 3) throw new Error("network down");
  return "ok";
}
function retry<R>(fn: () => R, times: number): R {
  let lastError: unknown;
  for (let i = 0; i < times; i++) {
    try {
      return fn();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}
console.log(retry(flaky, 5), attempts);`,
    },
  ],
  quiz: [
    {
      question: "@a @b m() {}: أي طبقة تعمل أولاً حين يُستدعى m؟",
      options: ["a", "b", "m الأصلية"],
      answer: 0,
      why: "b يلفّ m أولاً لأنه الأقرب، ثم a يلفّ الناتج. فالنتيجة a(b(m)): الاستدعاء يدخل من a، ثم b، ثم يصل إلى m.",
    },
    {
      question: "ماذا يُطبع عند تعريف الصنف؟",
      code: 'function show(method: unknown, context: ClassMethodDecoratorContext) {\n  console.log(context.kind, String(context.name));\n}\nclass Cart {\n  @show add() {}\n}',
      options: ["method add", "function add", "add method"],
      answer: 0,
      why: "context يصف ما زُيِّن: kind هنا \"method\" (وقد يكون \"field\" أو \"getter\" أو \"class\")، و name اسمه. بهما يكتب decorator واحد رسائل صحيحة لكل method.",
    },
    {
      question: "@counted يزيد العدّاد runs كلما عمل. بعد new Cart() ثلاث مرات، كم runs؟",
      code: "let runs = 0;\nfunction counted(method: unknown, context: ClassMethodDecoratorContext) {\n  runs++;\n}\nclass Cart {\n  @counted go() {}\n}\nnew Cart(); new Cart(); new Cart();\nconsole.log(runs);",
      options: ["1", "3", "0"],
      answer: 0,
      why: "الـ decorator يعمل مرة واحدة عند تعريف الصنف، لا عند كل new. الكائنات الثلاثة تتشارك الغلاف نفسه على prototype.",
    },
    {
      question: "@bound يستعمل context.addInitializer ليربط inc بكل كائن جديد. ماذا يُطبع؟",
      code: "class Counter {\n  count = 0;\n  @bound inc() { this.count++; return this.count; }\n}\nconst c = new Counter();\nconst inc = c.inc;\nconsole.log(inc(), inc());",
      options: ["1 2", "TypeError: Cannot read properties of undefined", "NaN NaN"],
      answer: 0,
      why: "addInitializer يشغّل دالة عند إنشاء كل كائن، وهنا يضع على الكائن نسخة مربوطة: this.inc = this.inc.bind(this). فـ inc المنفصلة تبقى تعرف c. بلا @bound، this داخلها undefined وينهار السطر.",
    },
    {
      question: "tsconfig فيه \"experimentalDecorators\": true. بأي معاملات يتوقع tsc أن يُستدعى decorator على method؟",
      options: ["(target, propertyKey, descriptor)", "(value, context)", "(context) فقط"],
      answer: 0,
      why: "الخيار يعيد الـ decorators القديمة (قبل TC39): ثلاثة معاملات وسلوك مختلف. احذفه في مشروع جديد لتحصل على القياسية (value, context). بعض المكتبات المعروفة مثل NestJS و TypeORM ما زالت مبنية على القديمة وتطلب الخيار.",
    },
  ],
  next: "ts-strict",
};
