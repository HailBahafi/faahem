import type { Frame, HeapObj, Lesson, Scene, Slot, Step } from "@/lib/types";

const num = (name: string, value: number): Slot => ({ name, value: String(value), type: "number" });
const str = (name: string, value: string): Slot => ({ name, value: `"${value}"`, type: "string" });
const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
const fnv = (name: string, label = name): Slot => ({ name, value: `ƒ ${label}`, type: "function" });
const undef = (name: string): Slot => ({ name, value: "undefined", type: "none" });
const prog = (vars: Slot[]): Frame => ({ id: 1, name: "البرنامج", vars });
const call = (name: string, vars: Slot[]): Frame => ({ id: 2, name, vars });
const obj = (id: number, items: Slot[]): HeapObj => ({ id, kind: "object", items });
const at = (line: number | null, say: string, frames: Frame[], heap: HeapObj[], extra: Partial<Step> = {}): Step => ({ line, say, memory: [], frames, heap, ...extra });
const js = (code: string, steps: Step[]): Scene => ({ code: { js: code }, steps });

const sara = obj(1, [str("name", "Sara"), fnv("greet")]);
const omar = obj(2, [str("name", "Omar")]);
const vars = [ref("sara", 1), fnv("greet")];

export const jsThis: Lesson = {
  slug: "js-this",
  stage: 0,
  number: "2.2",
  title: "this",
  subtitle: "this معامل مخفي يُملأ لحظة الاستدعاء، حسب طريقة الاستدعاء لا مكان الكتابة",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "الدالة نسيت صاحبها",
    body: "الدالة greet واحدة لا تتغير، تقرأ this.name. استدعها بطرق مختلفة وراقب: من يصير this في كل مرة؟",
    demo: "jsThis",
  },
  scene: {
    code: {
      js: `"use strict";
const sara = {
  name: "Sara",
  greet() {
    return "hi " + this.name;
  },
};
const greet = sara.greet;
console.log(sara.greet());
console.log(greet.call({ name: "Omar" }));
console.log(greet());`,
    },
    notes: {
      js: "this ليس متغيراً تحدده مكان كتابة الدالة، بل معامل مخفي يملؤه المحرّك عند كل استدعاء: obj.f() تعطي obj، و f() وحدها تعطي undefined في الوضع الصارم (الوحدات والأصناف دائماً صارمة)، و call/apply/bind تحدده صراحة، و new تعطي الكائن الجديد. الدالة السهمية لا تملك this خاصاً بها: تقرأه من النطاق المحيط كأي متغير ملتقط.",
    },
    steps: [
      at(null, "\"use strict\" يشغّل الوضع الصارم، كما تعمل الوحدات والأصناف دائماً. فكرة الدرس: this لا يُحدَّد حين تُكتب الدالة، بل في كل استدعاء من جديد.", [prog([])], []),
      at(2, "كائن sara على الكومة #1. الخاصية greet تحمل مرجع دالة. الدالة نفسها لا تعرف أنها داخل sara: الكائن يشير إليها، لا العكس.", [prog([ref("sara", 1)])], [sara], { changedHeap: [1] }),
      at(8, "greet الآن مرجع ثانٍ إلى الدالة نفسها. لم يُنسخ معها أي شيء عن sara.", [prog(vars)], [sara], { changed: ["greet"] }),
      at(9, "sara.greet(): الاستدعاء فيه نقطة، والكائن قبل النقطة هو sara. يصنع المحرّك إطاراً لـ greet ويضع فيه this يشير إلى #1.", [prog(vars), call("greet", [ref("this", 1)])], [sara]),
      at(5, "this.name: يتبع this إلى #1 ويقرأ \"Sara\". تُرجع الدالة \"hi Sara\".", [prog(vars), call("greet", [ref("this", 1)])], [sara], { output: ["hi Sara"] }),
      at(10, "call تحدد this صراحة: أول وسيط لها يصير this. يُصنع كائن جديد #2، والإطار يشير إليه.", [prog(vars), call("greet", [ref("this", 2)])], [sara, omar], { changedHeap: [2] }),
      at(5, "الدالة نفسها، و this مختلف: تقرأ name من #2 وتُرجع \"hi Omar\".", [prog(vars), call("greet", [ref("this", 2)])], [sara, omar], { output: ["hi Sara", "hi Omar"] }),
      at(11, "greet(): لا نقطة ولا call. لا يوجد كائن يُعطى، ففي الوضع الصارم this = undefined.", [prog(vars), call("greet", [undef("this")])], [sara]),
      at(5, "this.name تحاول القراءة من undefined، فيتوقف البرنامج. هذا ما يحدث حين تُمرَّر دالة كائن إلى مكان آخر وتُستدعى وحدها.", [prog(vars), call("greet", [undef("this")])], [sara], { output: ["hi Sara", "hi Omar"], error: "TypeError: Cannot read properties of undefined (reading 'name')" }),
    ],
  },
  playground: {
    kind: "trace",
    intro: "المتتبّع لا يعرض this، فلنكتب ما يفعله المحرّك بأيدينا: this معامل مخفي، فنسمّيه self ونمرّره صراحة. sara.greet() عند المحرّك تعني greet مع self = sara. راقب الإطارات: الدالة واحدة، والكائن الذي يصلها يتغيّر.",
    starter: `function greet(self) {
  return "hi " + self.name;
}
const sara = { name: "Sara", greet: greet };
const omar = { name: "Omar", greet: greet };
console.log(greet(sara));
console.log(greet(omar));
const detached = sara.greet;
console.log(detached(omar));`,
    challenges: [
      "السطر الأخير يستدعي دالة أُخذت من sara، لكنه يطبع hi Omar. لماذا؟ (هكذا بالضبط تعمل call: أنت تختار self.)",
      "اكتب console.log(detached()) بلا وسيط. ماذا يحدث؟ هذا ما يحدث لـ this حين تُستدعى الدالة وحدها.",
      "أضف دالة rename(self, newName) تكتب self.name = newName، ثم استدعها على omar واطبع greet(omar).",
      "اصنع كائناً ثالثاً بلا خاصية name ومرّره إلى greet. ماذا يُطبع ولماذا؟",
    ],
  },
  predict: [
    {
      question: "omar استعار دالة sara. ماذا يطبع؟",
      code: `const sara = { name: "Sara", hi() { return this.name; } };
const omar = { name: "Omar", hi: sara.hi };
console.log(omar.hi());`,
      options: ["Sara", "Omar", "undefined"],
      answer: 1,
      why: "this يُحدَّد بالكائن قبل النقطة لحظة الاستدعاء، لا بمكان كتابة الدالة. الاستدعاء omar.hi() يعطي this = omar.",
      scene: js("const sara = { name: \"Sara\", hi() { return this.name; } };\nconst omar = { name: \"Omar\", hi: sara.hi };\nconsole.log(omar.hi());", [
        at(1, "sara على الكومة #1، وفيه مرجع إلى الدالة hi.", [prog([ref("sara", 1)])], [obj(1, [str("name", "Sara"), fnv("hi")])]),
        at(2, "omar #2 يأخذ مرجعاً إلى الدالة نفسها. صار للدالة الواحدة مكانان يشيران إليها.", [prog([ref("sara", 1), ref("omar", 2)])], [obj(1, [str("name", "Sara"), fnv("hi")]), obj(2, [str("name", "Omar"), fnv("hi")])], { changedHeap: [2] }),
        at(3, "omar.hi(): الكائن قبل النقطة omar، فـ this يشير إلى #2 والنتيجة \"Omar\".", [prog([ref("sara", 1), ref("omar", 2)]), call("hi", [ref("this", 2)])], [obj(1, [str("name", "Sara"), fnv("hi")]), obj(2, [str("name", "Omar"), fnv("hi")])], { output: ["Omar"] }),
      ]),
    },
    {
      question: "دالة سهمية داخل طريقة. ماذا يطبع؟",
      code: `const timer = {
  seconds: 0,
  start() {
    [1, 2, 3].forEach(() => {
      this.seconds++;
    });
    return this.seconds;
  },
};
console.log(timer.start());`,
      options: ["3", "0", "TypeError"],
      answer: 0,
      why: "الدالة السهمية لا تملك this خاصاً بها. تقرأه من الدالة المحيطة start كما تقرأ أي متغير ملتقط، و this هناك هو timer.",
      scene: js("const timer = {\n  seconds: 0,\n  start() {\n    [1, 2, 3].forEach(() => {\n      this.seconds++;\n    });\n    return this.seconds;\n  },\n};\nconsole.log(timer.start());", [
        at(10, "timer.start(): الكائن قبل النقطة timer، فـ this في إطار start يشير إلى #1.", [prog([ref("timer", 1)]), call("start", [ref("this", 1)])], [obj(1, [num("seconds", 0), fnv("start")])]),
        at(5, "forEach تستدعي السهمية ثلاث مرات دون أي كائن. السهمية لا تأخذ this من الاستدعاء، بل تلتقطه من start: إنه #1.", [prog([ref("timer", 1)]), call("start", [ref("this", 1)])], [obj(1, [num("seconds", 3), fnv("start")])], { changedHeap: [1] }),
        at(7, "start تُرجع this.seconds، وهو 3.", [prog([ref("timer", 1)]), call("start", [ref("this", 1)])], [obj(1, [num("seconds", 3), fnv("start")])], { output: ["3"] }),
      ]),
    },
    {
      question: "هذا الملف وحدة (ES module). الطريقة get مكتوبة كدالة سهمية. ماذا يحدث؟",
      code: `const counter = {
  count: 5,
  get: () => this.count,
};
console.log(counter.get());`,
      options: ["5", "undefined", "TypeError"],
      answer: 2,
      why: "السهمية تأخذ this من المكان الذي كُتبت فيه، وهو أعلى الوحدة حيث this = undefined. النقطة في counter.get() لا تغيّر this السهمية، فالقراءة من undefined توقف البرنامج. للطرق استعمل الصيغة get() { ... }.",
      scene: js("const counter = {\n  count: 5,\n  get: () => this.count,\n};\nconsole.log(counter.get());", [
        at(1, "السهمية تُنشأ في أعلى الوحدة. this هناك undefined، فتلتقطه كما هو.", [prog([undef("this"), ref("counter", 1)])], [obj(1, [num("count", 5), fnv("get", "arrow")])]),
        at(5, "counter.get(): النقطة تعطي this للدوال العادية فقط. السهمية تبقى على this الذي التقطته: undefined.", [prog([undef("this"), ref("counter", 1)]), call("get", [undef("this")])], [obj(1, [num("count", 5), fnv("get", "arrow")])]),
        at(3, "this.count تقرأ من undefined.", [prog([undef("this"), ref("counter", 1)]), call("get", [undef("this")])], [obj(1, [num("count", 5), fnv("get", "arrow")])], { error: "TypeError: Cannot read properties of undefined (reading 'count')" }),
      ]),
    },
  ],
  code: {
    intro: "أشهر خطأ مع this في الكود الحقيقي: تمرير طريقة كائن كدالة رد (callback) إلى forEach أو مستمع حدث، فتُستدعى وحدها وتفقد كائنها. الحلّان المعتمدان: دالة سهمية تستدعي الطريقة بنقطتها، أو bind تصنع دالة مربوطة دائماً. شغّل، ثم جرّب التعليق.",
    runnerStarter: `"use strict";
const cart = {
  items: [],
  add(item) {
    this.items.push(item);
  },
};

const picked = ["tea", "milk"];
picked.forEach((item) => cart.add(item)); // the arrow calls add with cart before the dot
console.log(cart.items);

const addLater = cart.add.bind(cart); // a new function whose this is always cart
addLater("bread");
console.log(cart.items.length);

function describe(prefix) {
  return prefix + ": " + this.items.join(", ");
}
console.log(describe.call(cart, "cart"));
console.log(describe.apply(cart, ["basket"]));
// جرّب: اكتب picked.forEach(cart.add) بدل السطر 10 وشغّل. ما قيمة this داخل add؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "التحية",
      prompt: "رتّب الأسطر: كائن له طريقة تقرأ this.name، ثم استدعاء الطريقة بنقطة. يجب أن يطبع hello Lina.",
      lines: [
        "const user = {",
        '  name: "Lina",',
        "  hello() {",
        '    return "hello " + this.name;',
        "  },",
        "};",
        "console.log(user.hello());",
      ],
      expected: "hello Lina",
    },
    {
      kind: "fill",
      title: "اختر this بنفسك",
      prompt: "الدالة show أُخذت من player. أي طريقة تستدعيها فوراً مع this = player، فيطبع البرنامج Ali؟",
      template: 'const player = { name: "Ali", show() { return this.name; } };\nconst show = player.show;\nconsole.log(show.___(player));',
      options: ["bind", "call", "name"],
      expected: "Ali",
    },
    {
      kind: "fix",
      title: "العدّاد الذي لا يعدّ",
      prompt: "البرنامج يتوقف بخطأ بدل أن يطبع 3. الطريقة inc تُمرَّر إلى forEach فتُستدعى وحدها. أصلحه.",
      code: `"use strict";
const counter = {
  count: 0,
  inc() {
    this.count++;
  },
};
[1, 2, 3].forEach(counter.inc);
console.log(counter.count);`,
      expected: "3",
      hint: "forEach تستدعي ما تعطيها بلا نقطة. أعطها دالة سهمية تستدعي counter.inc() بنقطتها، أو counter.inc.bind(counter).",
      solution: `"use strict";
const counter = {
  count: 0,
  inc() {
    this.count++;
  },
};
[1, 2, 3].forEach(() => counter.inc());
console.log(counter.count);`,
    },
    {
      kind: "write",
      title: "محفظة بسلسلة استدعاءات",
      prompt: "اكتب كائناً wallet فيه balance = 100، وطريقة spend(amount) تنقص this.balance ثم تُرجع this، وطريقة report() تُرجع \"balance: \" ثم الرصيد. ثم اطبع wallet.spend(30).spend(20).report(). يجب أن يظهر balance: 50.",
      starter: "// const wallet = {\n",
      expected: "balance: 50",
      hint: "return this في spend تُرجع الكائن نفسه، فيصير الاستدعاء التالي .spend(20) على wallet أيضاً.",
      solution: `const wallet = {
  balance: 100,
  spend(amount) {
    this.balance -= amount;
    return this;
  },
  report() {
    return "balance: " + this.balance;
  },
};
console.log(wallet.spend(30).spend(20).report());`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: "const o = { v: 1, get() { return this.v; } };\nconst p = { v: 2, get: o.get };\nconsole.log(o.get(), p.get());",
      options: ["1 1", "1 2", "2 2"],
      answer: 1,
      why: "الدالة واحدة، و this في كل استدعاء هو الكائن قبل النقطة: o ثم p.",
    },
    {
      question: "ماذا يطبع؟",
      code: "const o = { v: 1, get() { return this.v; } };\nconst bound = o.get.bind(o);\nconst q = { v: 3, bound: bound };\nconsole.log(q.bound());",
      options: ["1", "3", "undefined"],
      answer: 0,
      why: "bind تصنع دالة جديدة this فيها مثبّت على o إلى الأبد. النقطة في q.bound() لا تستطيع تغييره.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'const team = {\n  name: "A",\n  members: ["x", "y"],\n  list() {\n    return this.members.map((m) => m + "@" + this.name);\n  },\n};\nconsole.log(team.list().join(","));',
      options: ["x@A,y@A", "x@undefined,y@undefined", "TypeError"],
      answer: 0,
      why: "السهمية داخل map لا تملك this، فتقرأ this من list، وهو team لأن الاستدعاء team.list().",
    },
    {
      question: "ماذا يطبع؟",
      code: 'function User(name) {\n  this.name = name;\n}\nconst u = new User("Sara");\nconsole.log(u.name);',
      options: ["Sara", "undefined", "TypeError"],
      answer: 0,
      why: "new تصنع كائناً جديداً فارغاً، وتستدعي User و this يشير إليه، ثم تُرجعه. لذلك this.name كتبت في الكائن الجديد.",
    },
    {
      question: "في الاستدعاء shop.cart.add(\"tea\")، من يكون this داخل add؟",
      options: ["shop", "shop.cart", "add نفسها"],
      answer: 1,
      why: "this هو الكائن الذي قبل النقطة الأخيرة مباشرة، أي القيمة التي قُرئت منها add: shop.cart.",
    },
  ],
  next: "js-prototypes",
};
