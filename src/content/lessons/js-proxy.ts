import type { Cell, Lesson, Scene } from "@/lib/types";

const num = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const str = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const box = (name: string, value: string): Cell => ({ name, value, type: "none" });

/** A hand-written scene for a predict answer (the tracer has no Proxy). */
const mini = (js: string, steps: Scene["steps"]): Scene => ({ code: { js }, steps });

const before = [str("user.name", "Sara"), num("user.age", 20)];
const withProxy = [...before, box("guarded", "Proxy → user")];

export const jsProxy: Lesson = {
  slug: "js-proxy",
  stage: 0,
  number: "3.5",
  title: "Proxy و Reflect",
  subtitle: "حارس يقف أمام الكائن: كل قراءة وكتابة تمرّ عليه أولاً",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "كائن بلا حارس",
    body: "هذا كائن مستخدم. اكتب فيه عمراً سالباً، ونصاً مكان رقم، وحقلاً باسم مكتوب خطأ. ثم فعّل الحارس وكرّر الشيء نفسه.",
    demo: "jsProxy",
  },
  scene: {
    code: {
      js: `const user = { name: "Sara", age: 20 };
const guarded = new Proxy(user, {
  set(target, key, value) {
    if (key === "age" && value < 0) throw new RangeError("age < 0");
    return Reflect.set(target, key, value);
  },
});
guarded.age = 21;
console.log(user.age);`,
    },
    steps: [
      {
        line: null,
        say: "كل عملية على كائن (قراءة، كتابة، حذف، in) هي في الحقيقة استدعاء لعملية داخلية في المحرّك. Proxy يسمح لك أن تضع دالتك مكان أي منها.",
        memory: [],
      },
      {
        line: 1,
        say: "كائن عادي في الذاكرة فيه حقلان.",
        memory: before,
        changed: ["user.name", "user.age"],
      },
      {
        line: 2,
        say: "new Proxy يصنع كائناً جديداً بلا بيانات خاصة به: يحفظ سهماً إلى الهدف user، وسهماً إلى المعالج handler الذي فيه الفخاخ (traps). هنا فخ واحد: set.",
        memory: withProxy,
        changed: ["guarded"],
      },
      {
        line: 8,
        say: "guarded.age = 21 لا تكتب في أي درج مباشرة. المحرّك يرى أن guarded وكيل، فيبحث في المعالج عن set ويستدعيها: target هو user، و key هو \"age\"، و value هو 21.",
        memory: withProxy,
        read: ["guarded"],
      },
      {
        line: 4,
        say: "الحارس يفحص: المفتاح age والقيمة 21 ليست سالبة، فالشرط false ولا يُرمى خطأ. لو كتبنا ‎-5 لتوقف كل شيء هنا بـ RangeError ولم يتغير user.",
        memory: withProxy,
      },
      {
        line: 5,
        say: "Reflect.set تفعل الكتابة العادية التي كانت ستحدث بلا وكيل، وتعيد true. فخ set يجب أن يعيد true حين ينجح.",
        memory: [str("user.name", "Sara"), num("user.age", 21), box("guarded", "Proxy → user")],
        changed: ["user.age"],
      },
      {
        line: 9,
        say: "نقرأ user مباشرة: 21. الوكيل لم يحتفظ بنسخة؛ التغيير وصل إلى الهدف نفسه. يُطبع 21.",
        memory: [str("user.name", "Sara"), num("user.age", 21), box("guarded", "Proxy → user")],
        read: ["user.age"],
        output: ["21"],
      },
    ],
    notes: {
      js: "لكل عملية داخلية فخ باسمها: get و set و has و deleteProperty و ownKeys و apply... ولكل فخ دالة في Reflect بالاسم والوسائط نفسها، تفعل السلوك الافتراضي.",
    },
  },
  playground: {
    kind: "trace",
    intro: "المتتبّع لا يشغّل Proxy الحقيقي، فهذه محاكاة للفكرة نفسها: guard تعيد كائناً لا يُكتب فيه إلا عبر set، و set تمرّ على القواعد أولاً ثم تكتب في الهدف. في Proxy الحقيقي تكتب safe.age = 21 عادياً، والمحرّك يستدعي الفخ عنك.",
    starter: `function guard(target, rules) {
  return {
    get: (key) => target[key],
    set: (key, value) => {
      const rule = rules[key];
      if (rule && !rule(value)) {
        console.log("rejected " + key + " = " + value);
        return false;
      }
      target[key] = value;
      console.log("set " + key + " = " + value);
      return true;
    },
  };
}
const user = { name: "Sara", age: 20 };
const rules = { age: (v) => v >= 0 && v < 150 };
const safe = guard(user, rules);
safe.set("age", 21);
safe.set("age", -5);
safe.set("name", "Lina");
console.log(user.age, user.name);`,
    challenges: [
      "قبل التشغيل: ما قيمة user.age في السطر الأخير؟ هل وصلت ‎-5 إلى الكائن؟",
      "أضف قاعدة للاسم: name: (v) => v.length > 1، ثم جرّب safe.set(\"name\", \"L\").",
      "اكتب user.age = -5 مباشرة على الهدف، لا عبر safe. ماذا يُطبع؟ لماذا لا يحمي الحارس من يملك سهماً إلى الهدف نفسه؟",
      "عدّل get حتى تعيد \"unknown\" لأي مفتاح غير موجود، ثم اطبع safe.get(\"city\").",
    ],
  },
  predict: [
    {
      question: "ماذا يُطبع؟",
      code: `const user = { age: 20 };
const p = new Proxy(user, {});
p.age = 30;
console.log(user.age);`,
      options: ["30", "20", "undefined"],
      answer: 0,
      why: "معالج فارغ يعني لا فخاخ، فكل عملية تمرّ إلى الهدف كما هي. الوكيل لا يحمل نسخة من البيانات، بل سهماً إلى user، فالكتابة تصل إليه.",
      scene: mini(
        `const user = { age: 20 };
const p = new Proxy(user, {});
p.age = 30;
console.log(user.age);`,
        [
          { line: 1, say: "كائن فيه age = 20.", memory: [num("user.age", 20)] },
          { line: 2, say: "وكيل بلا فخاخ يشير إلى user.", memory: [num("user.age", 20), box("p", "Proxy → user")] },
          { line: 3, say: "لا فخ set، فتحدث الكتابة الافتراضية على الهدف.", memory: [num("user.age", 30), box("p", "Proxy → user")], changed: ["user.age"] },
          { line: 4, say: "يُطبع 30.", memory: [num("user.age", 30), box("p", "Proxy → user")], output: ["30"] },
        ],
      ),
    },
    {
      question: "ماذا يُطبع؟",
      code: `const prices = new Proxy({ tea: 5 }, {
  get(target, key) {
    return key in target ? target[key] : 0;
  },
});
console.log(prices.tea + prices.cake);`,
      options: ["5", "NaN", "TypeError"],
      answer: 0,
      why: "كل قراءة تمرّ على فخ get. tea موجود فيعيد 5. cake غير موجود، وبدل undefined يعيد الفخ 0. والمجموع 5. بلا الوكيل كانت النتيجة 5 + undefined = NaN.",
      scene: mini(
        `const prices = new Proxy({ tea: 5 }, {
  get(target, key) {
    return key in target ? target[key] : 0;
  },
});
console.log(prices.tea + prices.cake);`,
        [
          { line: 1, say: "وكيل أمام كائن فيه tea = 5، ومعه فخ get.", memory: [box("prices", "Proxy → { tea: 5 }")] },
          { line: 3, say: "prices.tea تستدعي get بالمفتاح \"tea\": موجود، فيعود 5.", memory: [box("prices", "Proxy → { tea: 5 }"), num("tea", 5)] },
          { line: 3, say: "prices.cake تستدعي get: غير موجود، فيعود 0.", memory: [box("prices", "Proxy → { tea: 5 }"), num("tea", 5), num("cake", 0)] },
          { line: 6, say: "5 + 0 = 5.", memory: [box("prices", "Proxy → { tea: 5 }"), num("tea", 5), num("cake", 0)], output: ["5"] },
        ],
      ),
    },
    {
      question: "كم قراءة يعدّها الفخ؟",
      code: `let reads = 0;
const obj = { a: 1, b: 2 };
const p = new Proxy(obj, {
  get(target, key) {
    reads++;
    return Reflect.get(target, key);
  },
});
const sum = p.a + p.b + obj.a;
console.log(reads);`,
      options: ["2", "3", "0"],
      answer: 0,
      why: "الفخ لا يرى إلا ما يمرّ عبر الوكيل: p.a و p.b. أما obj.a فقراءة مباشرة من الهدف لا تمرّ على أحد. لهذا تُسلّم الوكيل للكود الآخر وتُخفي الهدف عنه.",
      scene: mini(
        `let reads = 0;
const obj = { a: 1, b: 2 };
const p = new Proxy(obj, {
  get(target, key) {
    reads++;
    return Reflect.get(target, key);
  },
});
const sum = p.a + p.b + obj.a;
console.log(reads);`,
        [
          { line: 1, say: "العدّاد يبدأ بصفر.", memory: [num("reads", 0)] },
          { line: 5, say: "p.a تمرّ على الفخ: reads = 1.", memory: [num("reads", 1)], changed: ["reads"] },
          { line: 5, say: "p.b تمرّ على الفخ: reads = 2.", memory: [num("reads", 2)], changed: ["reads"] },
          { line: 9, say: "obj.a قراءة مباشرة من الهدف: الفخ لا يعلم بها.", memory: [num("reads", 2), num("sum", 4)] },
          { line: 10, say: "يُطبع 2.", memory: [num("reads", 2), num("sum", 4)], output: ["2"] },
        ],
      ),
    },
  ],
  code: {
    intro: "استعمالان حقيقيان: تحقّق من مخطط في كل كتابة (ما تفعله مكتبات النماذج)، وتفاعلية: القراءة تسجّل من يعتمد على أي مفتاح، والكتابة تعيد تشغيله. هذه بالضبط فكرة reactive في Vue 3.",
    runnerStarter: `// 1) Validation: every write is checked against a schema.
function validated(target, schema) {
  return new Proxy(target, {
    set(obj, key, value, receiver) {
      const check = schema[key];
      if (!check) throw new TypeError("unknown field " + String(key));
      if (!check(value)) throw new RangeError("bad value for " + String(key) + ": " + value);
      return Reflect.set(obj, key, value, receiver);
    },
  });
}
const product = validated(
  { name: "Mug", price: 25 },
  {
    name: (v) => typeof v === "string" && v.length > 0,
    price: (v) => Number.isFinite(v) && v >= 0,
  },
);
product.price = 30;
const attempts = [() => (product.price = -1), () => (product.colour = "red")];
for (const attempt of attempts) {
  try {
    attempt();
  } catch (e) {
    console.log(e.name + ": " + e.message);
  }
}
console.log("price", product.price);

// 2) Reactivity: reads record which effect depends on which key; writes re-run those effects.
function reactive(target) {
  const deps = new Map(); // key -> Set of effects
  let running = null;
  const state = new Proxy(target, {
    get(obj, key, receiver) {
      if (running) {
        if (!deps.has(key)) deps.set(key, new Set());
        deps.get(key).add(running);
      }
      return Reflect.get(obj, key, receiver);
    },
    set(obj, key, value, receiver) {
      const ok = Reflect.set(obj, key, value, receiver);
      for (const effect of deps.get(key) ?? []) effect();
      return ok;
    },
  });
  const effect = (fn) => {
    running = fn;
    fn();
    running = null;
  };
  return { state, effect };
}
const { state, effect } = reactive({ count: 1, title: "cart" });
effect(() => console.log("render: count is " + state.count));
state.count = 2; // re-renders
state.title = "basket"; // nobody read title inside an effect: nothing re-runs
// try: read state.title inside the effect too, then predict what the last line prints
`,
  },
  exercises: [
    {
      kind: "order",
      title: "وكيل يسجّل القراءات",
      prompt: "رتّب الأسطر حتى يُطبع get name ثم Sara.",
      lines: [
        'const user = { name: "Sara" };',
        "const logged = new Proxy(user, {",
        "  get(target, key) {",
        '    console.log("get " + key);',
        "    return Reflect.get(target, key);",
        "  },",
        "});",
        "console.log(logged.name);",
      ],
      expected: "get name\nSara",
    },
    {
      kind: "fill",
      title: "قيمة افتراضية",
      prompt: "أكمل الفخ: المفتاح الموجود يعيد قيمته الحقيقية، وغير الموجود يعيد unknown.",
      template: `const user = new Proxy({ name: "Sara" }, {
  get(target, key) {
    return key in target ? ___ : "unknown";
  },
});
console.log(user.name);
console.log(user.city);`,
      options: ["Reflect.get(target, key)", "key", "target"],
      expected: "Sara\nunknown",
    },
    {
      kind: "fix",
      title: "الحارس ينسى أن يكتب",
      prompt: "الحارس يرفض الأعمار السالبة كما يجب، لكن الأعمار الصحيحة لا تُحفظ أيضاً: يُطبع 20 بدل 21. أصلح الفخ.",
      code: `const user = { age: 20 };
const safe = new Proxy(user, {
  set(target, key, value) {
    if (value < 0) throw new RangeError("negative");
    return true;
  },
});
safe.age = 21;
console.log(user.age);`,
      expected: "21",
      hint: "الفخ يحلّ محل الكتابة كلها. إن لم يكتب هو، لن يكتب أحد. ما الدالة التي تفعل الكتابة الافتراضية وتعيد true؟",
      solution: `const user = { age: 20 };
const safe = new Proxy(user, {
  set(target, key, value) {
    if (value < 0) throw new RangeError("negative");
    return Reflect.set(target, key, value);
  },
});
safe.age = 21;
console.log(user.age);`,
    },
    {
      kind: "write",
      title: "إعدادات للقراءة فقط",
      prompt: "اكتب readOnly(obj) التي تعيد وكيلاً يرمي TypeError عند أي كتابة. يُطبع blocked ثم 80.",
      starter: `// write readOnly(obj): a Proxy whose set trap throws a TypeError

const config = readOnly({ port: 80 });
try {
  config.port = 8080;
} catch (e) {
  console.log("blocked");
}
console.log(config.port);`,
      expected: "blocked\n80",
      hint: "return new Proxy(obj, { set(target, key) { throw new TypeError(\"read-only: \" + String(key)); } });",
      solution: `function readOnly(obj) {
  return new Proxy(obj, {
    set(target, key) {
      throw new TypeError("read-only: " + String(key));
    },
  });
}

const config = readOnly({ port: 80 });
try {
  config.port = 8080;
} catch (e) {
  console.log("blocked");
}
console.log(config.port);`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع؟",
      code: 'const arr = new Proxy([], {\n  set(target, key, value) {\n    console.log("set " + String(key));\n    return Reflect.set(target, key, value);\n  },\n});\narr.push("x");',
      options: ["set 0 ثم set length", "set push", "set 0 فقط"],
      answer: 0,
      why: "push ليست عملية داخلية واحدة: تكتب العنصر في المفتاح \"0\" ثم تكتب length. كل كتابة منهما تمرّ على فخ set. الوكيل يرى العمليات الأساسية، لا أسماء الدوال.",
    },
    {
      question: "ماذا يُطبع؟",
      code: "const user = { age: 20 };\nconst p = new Proxy(user, {});\np.age = 25;\nconsole.log(p === user, user.age);",
      options: ["false 25", "true 25", "false 20"],
      answer: 0,
      why: "الوكيل كائن مختلف عن الهدف، فالمقارنة false. لكنه بلا بيانات خاصة، والكتابة عبره تصل إلى الهدف، فـ user.age صار 25.",
    },
    {
      question: "الوكيل يرفض الأعمار السالبة. ماذا يُطبع؟",
      code: 'const user = { age: 20 };\nconst safe = new Proxy(user, {\n  set(t, k, v) {\n    if (v < 0) throw new RangeError("negative");\n    return Reflect.set(t, k, v);\n  },\n});\nuser.age = -5;\nconsole.log(safe.age);',
      options: ["-5", "20", "RangeError"],
      answer: 0,
      why: "الكتابة كانت على user مباشرة، فلم تمرّ على الوكيل ولا على فخه. والقراءة عبر safe بلا فخ get تعيد ما في الهدف: ‎-5. الحماية تعمل فقط حين لا يملك أحد غير الوكيل سهماً إلى الهدف.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'const t = Object.freeze({ a: 1 });\nconsole.log(Reflect.set(t, "a", 2), t.a);',
      options: ["false 1", "true 2", "TypeError"],
      answer: 0,
      why: "Reflect.set لا ترمي حين تفشل الكتابة، بل تعيد false. لهذا يعيد فخ set نتيجتها كما هي: true يعني نجحت الكتابة، و false يجعل المحرّك يرمي TypeError في الوضع الصارم.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'const api = new Proxy({}, {\n  get(target, name) {\n    return (id) => "/" + name + "/" + id;\n  },\n});\nconsole.log(api.users(7));',
      options: ["/users/7", "TypeError: api.users is not a function", "undefined"],
      answer: 0,
      why: "api.users قراءة تمرّ على get بالمفتاح \"users\"، والفخ يعيد دالة جديدة، ثم تُستدعى بـ 7. بهذه الطريقة تبني مكتبات العملاء دوالاً لكل مسار دون أن تكتبها واحدة واحدة.",
    },
  ],
  next: "js-functional",
};
