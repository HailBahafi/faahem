import type { Frame, HeapObj, Lesson, Scene, Slot, Step } from "@/lib/types";

const num = (name: string, value: number): Slot => ({ name, value: String(value), type: "number" });
const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
const fnv = (name: string): Slot => ({ name, value: `ƒ ${name}`, type: "function" });
const tdz = (name: string): Slot => ({ name, value: "<uninitialized>", type: "none" });
const obj = (id: number, items: Slot[]): HeapObj => ({ id, kind: "object", items });
const at = (line: number | null, say: string, frames: Frame[], heap: HeapObj[], extra: Partial<Step> = {}): Step => ({ line, say, memory: [], frames, heap, ...extra });
const js = (code: string, steps: Step[]): Scene => ({ code: { js: code }, steps });

/** The module map: one entry (one instance) per module URL. */
const map = (...entries: Slot[]): Frame => ({ id: 1, name: "module map", vars: entries });
const running = (file: string): Frame => ({ id: 2, name: file, vars: [] });
const all = map(ref("./counter.js", 1), ref("./stats.js", 2), ref("./main.js", 3));
const counter = (count: Slot) => obj(1, [count, fnv("increment")]);
const stats = obj(2, [ref("increment", 1)]);
const main = obj(3, [ref("count", 1), ref("increment", 1)]);
const records = (count: Slot) => [counter(count), stats, main];

export const jsModules: Lesson = {
  slug: "js-modules",
  stage: 0,
  number: "2.5",
  title: "الوحدات ESM",
  subtitle: "لكل ملف نطاقه، والاستيراد نافذة حيّة على متغير في ملف آخر، وكل وحدة تعمل مرة واحدة",
  minutes: 24,
  singleLanguage: true,
  problem: {
    title: "ملفان واسم واحد",
    body: "ملفان يعرّف كل منهما دالة اسمها format. في الطريقة القديمة يُحمَّلان كسكربتين في نطاق عام واحد. غيّر ترتيب التحميل وراقب ماذا يطبع السعر، ثم جرّب الوحدات.",
    demo: "jsModules",
  },
  scene: {
    code: {
      js: `// counter.js
export let count = 0;
export function increment() { count = count + 1; }

// stats.js
import { increment } from "./counter.js";
increment();

// main.js
import { count, increment } from "./counter.js";
import "./stats.js";
increment();
console.log(count);`,
    },
    notes: {
      js: "الوحدة (ES module) ملف له نطاق خاص، يعمل في الوضع الصارم، و this في أعلاه undefined. يحمّلها المتصفح بـ <script type=\"module\">، و Node حين يكون الملف ‎.mjs أو \"type\": \"module\" في package.json. الاستيراد ربط حيّ للقراءة فقط وليس نسخة، بعكس require في CommonJS الذي يعطيك نسخة من قيمة exports لحظة الطلب.",
    },
    steps: [
      at(null, "المرحلة الأولى قبل تنفيذ أي سطر: يقرأ المحرّك main.js ويجد استيراد counter.js و stats.js، ثم يقرأ stats.js فيجد counter.js مرة أخرى. العنوان نفسه يعني الوحدة نفسها، فيُحمَّل مرة واحدة. في خريطة الوحدات ثلاثة سجلات.", [all], [obj(1, []), obj(2, []), obj(3, [])]),
      at(10, "المرحلة الثانية، الربط: كل import يصير رابطاً إلى متغير المصدّر نفسه، لا نسخة منه. count في counter.js لم يُهيّأ بعد، و increment جاهزة لأن تعريفات الدوال تُرفع.", [all], records(tdz("count")), { changedHeap: [1, 2, 3] }),
      at(2, "المرحلة الثالثة، التنفيذ: التبعيات أولاً، بالترتيب، عمقاً قبل عرض. أول استيراد في main هو counter.js، ولا يستورد شيئاً، فيعمل جسمه: count = 0.", [all, running("counter.js")], records(num("count", 0)), { changedHeap: [1] }),
      at(7, "الاستيراد الثاني في main هو stats.js. تبعيته counter.js عملت من قبل، فلا تعمل ثانية. increment() تكتب في count داخل سجل counter.js: صار 1.", [all, running("stats.js")], records(num("count", 1)), { changedHeap: [1] }),
      at(12, "تبعيات main كلها انتهت، فيعمل جسم main.js أخيراً. increment() هي الدالة نفسها، وتكتب في المتغير نفسه: 2.", [all, running("main.js")], records(num("count", 2)), { changedHeap: [1] }),
      at(13, "count في main ليس درجاً خاصاً به، بل نافذة على count في counter.js. القراءة تمر عبر الرابط فتجد 2، فيطبع البرنامج 2 لا 0.", [all, running("main.js")], records(num("count", 2)), { read: ["count"] }),
      at(null, "ما لا تستطيعه main: لو كتبت count = 5 لتوقف البرنامج بـ TypeError: Assignment to constant variable. النافذة للقراءة فقط، والمتغير يغيّره ملفه وحده عبر الدوال التي يصدّرها.", [all], records(num("count", 2))),
    ],
  },
  playground: {
    kind: "trace",
    intro: "المتتبّع يعمل على ملف واحد، فلنبنِ محمّل وحدات صغيراً بأيدينا: define تسجّل وحدة بتبعياتها، و load تشغّل التبعيات أولاً، وتحفظ كل وحدة في instances فلا تعمل مرتين. counter.count تُقرأ من كائن الوحدة لحظة الطباعة، كما يفعل import * as counter.",
    starter: `const modules = {};
const instances = {};
let order = "";
function define(name, deps, body) {
  modules[name] = { deps: deps, body: body };
}
function load(name) {
  if (instances[name] !== undefined) {
    return instances[name];
  }
  const exports = {};
  instances[name] = exports;
  const imports = [];
  for (const dep of modules[name].deps) {
    imports.push(load(dep));
  }
  order = order + name + " ";
  modules[name].body(exports, imports);
  return exports;
}
define("counter", [], (exports, imports) => {
  exports.count = 0;
  exports.increment = () => {
    exports.count = exports.count + 1;
  };
});
define("stats", ["counter"], (exports, imports) => {
  const counter = imports[0];
  counter.increment();
});
define("main", ["counter", "stats"], (exports, imports) => {
  const counter = imports[0];
  counter.increment();
  console.log(counter.count);
});
load("main");
console.log(order);`,
    challenges: [
      "توقّع السطرين المطبوعين قبل أن تضغط. لماذا يظهر counter مرة واحدة في order مع أن وحدتين تستوردانه؟",
      "احذف سطر if (instances[name] ...) وما يُرجعه. كم مرة يعمل counter الآن؟ وماذا يطبع main؟ هذا ما تمنعه خريطة الوحدات.",
      "اجعل تبعيات main هي [\"stats\", \"counter\"]. هل تغيّر order؟ ولماذا لا يتغير الناتج 2؟",
      "أضف وحدة \"logger\" بلا تبعيات تكتب exports.log = (m) => console.log(\"[log] \" + m)، واجعل stats تستوردها وتستعملها.",
    ],
  },
  predict: [
    {
      question: "main تستورد ticks وقيمته 0، ثم تستدعي tick مرتين. ماذا يطبع؟",
      code: `// clock.js
export let ticks = 0;
export function tick() { ticks++; }

// main.js
import { ticks, tick } from "./clock.js";
tick();
tick();
console.log(ticks);`,
      options: ["0", "2", "TypeError"],
      answer: 1,
      why: "ticks في main رابط حيّ إلى المتغير في clock.js، لا نسخة أُخذت لحظة الاستيراد. tick تغيّر ذلك المتغير، والقراءة تمر عبر الرابط فتجد 2.",
      scene: js("// clock.js\nexport let ticks = 0;\nexport function tick() { ticks++; }\n\n// main.js\nimport { ticks, tick } from \"./clock.js\";\ntick();\ntick();\nconsole.log(ticks);", [
        at(2, "clock.js يعمل أولاً لأنه تبعية: ticks = 0 في سجله.", [map(ref("./clock.js", 1), ref("./main.js", 2))], [obj(1, [num("ticks", 0), fnv("tick")]), obj(2, [ref("ticks", 1), ref("tick", 1)])]),
        at(8, "tick مرتين تكتب في ticks داخل سجل clock.js: صار 2.", [map(ref("./clock.js", 1), ref("./main.js", 2))], [obj(1, [num("ticks", 2), fnv("tick")]), obj(2, [ref("ticks", 1), ref("tick", 1)])], { changedHeap: [1] }),
        at(9, "ticks في main نافذة على ذلك المتغير، فيطبع 2.", [map(ref("./clock.js", 1), ref("./main.js", 2))], [obj(1, [num("ticks", 2), fnv("tick")]), obj(2, [ref("ticks", 1), ref("tick", 1)])], { output: ["2"] }),
      ]),
    },
    {
      question: "ملفان يستوردان config.js، وأحدهما يغيّر الكائن. ماذا يظهر عند تشغيل main.js؟",
      code: `// config.js
console.log("loading config");
export const config = { debug: false };

// a.js
import { config } from "./config.js";
config.debug = true;

// main.js
import "./a.js";
import { config } from "./config.js";
console.log(config.debug);`,
      options: ["loading config ثم true", "loading config مرتين ثم false", "loading config مرتين ثم true"],
      answer: 0,
      why: "الوحدة تعمل مرة واحدة فقط مهما استوردها، وكل من يستوردها يأخذ النسخة نفسها. a.js غيّر الكائن الوحيد، فيراه main.js. لهذا تصلح الوحدة مكاناً لحالة مشتركة، ولهذا أيضاً تحتاج الحذر معها.",
      scene: js("// config.js\nconsole.log(\"loading config\");\nexport const config = { debug: false };\n\n// a.js\nimport { config } from \"./config.js\";\nconfig.debug = true;\n\n// main.js\nimport \"./a.js\";\nimport { config } from \"./config.js\";\nconsole.log(config.debug);", [
        at(2, "أول تبعية لـ main هي a.js، وتبعيتها config.js، فيعمل config.js أولاً ويطبع مرة واحدة.", [map(ref("./config.js", 1), ref("./a.js", 2), ref("./main.js", 3))], [obj(1, [ref("config", 4)]), obj(4, [{ name: "debug", value: "false", type: "boolean" }])], { output: ["loading config"] }),
        at(7, "a.js يغيّر الكائن #4 عبر رابطه.", [map(ref("./config.js", 1), ref("./a.js", 2), ref("./main.js", 3))], [obj(1, [ref("config", 4)]), obj(4, [{ name: "debug", value: "true", type: "boolean" }])], { changedHeap: [4], output: ["loading config"] }),
        at(11, "استيراد config.js في main لا يشغّله مرة ثانية: السجل موجود في الخريطة.", [map(ref("./config.js", 1), ref("./a.js", 2), ref("./main.js", 3))], [obj(1, [ref("config", 4)]), obj(4, [{ name: "debug", value: "true", type: "boolean" }])], { output: ["loading config"] }),
        at(12, "main يقرأ الكائن نفسه: true.", [map(ref("./config.js", 1), ref("./a.js", 2), ref("./main.js", 3))], [obj(1, [ref("config", 4)]), obj(4, [{ name: "debug", value: "true", type: "boolean" }])], { output: ["loading config", "true"] }),
      ]),
    },
    {
      question: "main تحاول تغيير متغير استوردته. ماذا يحدث؟",
      code: `// counter.js
export let count = 0;

// main.js
import { count } from "./counter.js";
count = 10;`,
      options: ["count يصير 10 في counter.js أيضاً", "تتغير نسخة main وحدها", "TypeError"],
      answer: 2,
      why: "الاسم المستورد نافذة للقراءة فقط، يعامله المحرّك كأنه const. المتغير يملكه counter.js، ويغيّره فقط كود داخله، مثل دالة increment يصدّرها.",
      scene: js("// counter.js\nexport let count = 0;\n\n// main.js\nimport { count } from \"./counter.js\";\ncount = 10;", [
        at(2, "count = 0 في سجل counter.js.", [map(ref("./counter.js", 1), ref("./main.js", 2))], [obj(1, [num("count", 0)]), obj(2, [ref("count", 1)])]),
        at(6, "الكتابة عبر رابط استيراد ممنوعة.", [map(ref("./counter.js", 1), ref("./main.js", 2))], [obj(1, [num("count", 0)]), obj(2, [ref("count", 1)])], { error: "TypeError: Assignment to constant variable." }),
      ]),
    },
  ],
  code: {
    intro: "محطة التشغيل ملف واحد، فهذا محمّل وحدات صغير يتصرف كالحقيقي: كل وحدة تعمل مرة واحدة والتبعيات أولاً، والمستورد يأخذ كائناً للقراءة فقط بروابط حيّة (getters). شكل الملفات الحقيقي مكتوب في التعليقات فوق كل define. شغّل، ثم جرّب التعليق.",
    runnerStarter: `"use strict";
// A tiny module loader: one instance per module, dependencies first,
// and importers get a frozen namespace whose properties are live bindings.
const registry = new Map();
const instances = new Map();

function define(name, deps, body) {
  registry.set(name, { deps, body });
}

function load(name) {
  if (instances.has(name)) return instances.get(name); // already evaluated
  const { deps, body } = registry.get(name);
  const namespace = {};
  instances.set(name, namespace);
  const imports = deps.map(load); // dependencies first
  const exported = body(...imports) ?? {}; // the module body runs once
  for (const [key, read] of Object.entries(exported)) {
    Object.defineProperty(namespace, key, { get: read, enumerable: true });
  }
  return Object.freeze(namespace);
}

// money.js:  export function format(halalas) { ... }
define("money", [], () => {
  function format(halalas) {
    return (halalas / 100).toFixed(2) + " SAR";
  }
  return { format: () => format };
});

// cart.js:  let total = 0; export { total }; export function add(price) { ... }
define("cart", [], () => {
  let total = 0; // private to the module unless exported
  function add(price) {
    total += price;
  }
  return { total: () => total, add: () => add };
});

// main.js:  import * as money from "./money.js"; import * as cart from "./cart.js";
define("main", ["money", "cart"], (money, cart) => {
  console.log(money.format(cart.total));
  cart.add(1250);
  cart.add(399);
  console.log(money.format(cart.total)); // live: sees the new total
  try {
    cart.total = 0; // imports are read-only
  } catch (e) {
    console.log(e.name);
  }
});

load("main");
// جرّب: أضف وحدة "discount" تعتمد على "cart" وتصدّر دالة apply(percent)، واجعل main تستوردها
`,
  },
  exercises: [
    {
      kind: "order",
      title: "نمط الوحدة القديم",
      prompt: "قبل import و export كان المحترفون يصنعون وحدة بدالة تُستدعى فوراً: متغير خاص، وكائن يصدّر ما يريد، مع getter يقرأ القيمة الحية. رتّب الأسطر حتى يطبع 1.",
      lines: [
        "const counter = (() => {",
        "  let count = 0;",
        "  const increment = () => { count++; };",
        "  return { increment, get count() { return count; } };",
        "})();",
        "counter.increment();",
        "console.log(counter.count);",
      ],
      expected: "1",
    },
    {
      kind: "fill",
      title: "مرة واحدة فقط",
      prompt: "load يجب أن يشغّل الوحدة أول مرة فقط، ثم يُرجع النسخة المحفوظة. أي طريقة من Map تجعل البرنامج يطبع 1 true؟",
      template: 'const cache = new Map();\nlet runs = 0;\nfunction load(name) {\n  if (cache.___(name)) return cache.get(name);\n  runs++;\n  const mod = { name };\n  cache.set(name, mod);\n  return mod;\n}\nload("config");\nconsole.log(runs, load("config") === load("config"));',
      options: ["set", "has", "delete"],
      expected: "1 true",
    },
    {
      kind: "fix",
      title: "العدّاد المجمَّد",
      prompt: "الوحدة تصدّر count، لكن المستورد يرى 0 دائماً لأنه أخذ نسخة من القيمة لحظة التصدير (كما في CommonJS). أصلح التصدير ليصير رابطاً حياً، فيطبع البرنامج 2.",
      code: `const counter = (() => {
  let count = 0;
  return {
    count,
    increment() { count++; },
  };
})();
counter.increment();
counter.increment();
console.log(counter.count);`,
      expected: "2",
      hint: "count, في الكائن تنسخ القيمة 0 مرة واحدة. getter يقرأ المتغير في كل مرة: get count() { return count; },",
      solution: `const counter = (() => {
  let count = 0;
  return {
    get count() { return count; },
    increment() { count++; },
  };
})();
counter.increment();
counter.increment();
console.log(counter.count);`,
    },
    {
      kind: "write",
      title: "ترتيب التنفيذ",
      prompt: "اكتب evaluationOrder(graph, entry): graph كائن يربط اسم كل وحدة بمصفوفة ما تستورده بالترتيب. أرجع مصفوفة بترتيب تنفيذ الوحدات كما يفعل المحرّك: التبعيات أولاً بترتيبها، وكل وحدة مرة واحدة. اطبع النتيجة مفصولة بمسافات للرسمين في البداية. يجب أن يظهر b a main ثم utils ui db app.",
      starter: `const graph = { main: ["a", "b"], a: ["b"], b: [] };
const graph2 = { app: ["ui", "db"], ui: ["utils"], db: ["utils"], utils: [] };
// function evaluationOrder(graph, entry) {
`,
      expected: "b a main\nutils ui db app",
      hint: "استعمل Set للوحدات التي زرتها، ودالة visit(name) داخلية: إذا زرتها فارجع، وإلا علّمها، وزُر كل تبعية، ثم أضف name إلى النتيجة.",
      solution: `const graph = { main: ["a", "b"], a: ["b"], b: [] };
const graph2 = { app: ["ui", "db"], ui: ["utils"], db: ["utils"], utils: [] };
function evaluationOrder(graph, entry) {
  const visited = new Set();
  const order = [];
  function visit(name) {
    if (visited.has(name)) return;
    visited.add(name);
    for (const dep of graph[name]) visit(dep);
    order.push(name);
  }
  visit(entry);
  return order;
}
console.log(evaluationOrder(graph, "main").join(" "));
console.log(evaluationOrder(graph2, "app").join(" "));`,
    },
  ],
  quiz: [
    {
      question: "ما هو sum في main.js؟",
      code: '// math.js\nexport default function add(a, b) { return a + b; }\nexport const PI = 3.14;\n\n// main.js\nimport sum, { PI } from "./math.js";',
      options: ["الدالة add نفسها", "undefined لأن لا شيء اسمه sum", "كائن فيه add و PI"],
      answer: 0,
      why: "التصدير الافتراضي (default) واحد لكل وحدة، والمستورد يختار له أي اسم. أما التصديرات المسمّاة مثل PI فتُستورد باسمها بين قوسين.",
    },
    {
      question: "utils.js فيه console.log(\"ready\")، وتستورده ثلاثة ملفات في البرنامج. كم مرة تظهر ready؟",
      options: ["3", "1", "0"],
      answer: 1,
      why: "خريطة الوحدات تحفظ سجلاً واحداً لكل عنوان. الوحدة تُنفَّذ مرة واحدة، والاستيرادات الأخرى تربط بالسجل نفسه.",
    },
    {
      question: "main.js تستورد a.js ثم b.js، و a.js تستورد c.js. بأي ترتيب تعمل أجسام الملفات؟",
      options: ["main a c b", "c a b main", "a b c main"],
      answer: 1,
      why: "التبعيات أولاً، عمقاً قبل عرض: لتعمل a يجب أن تعمل c قبلها، ثم a، ثم b، وفي النهاية main التي تنتظر تبعياتها كلها.",
    },
    {
      question: "ماذا تطبع main.js؟",
      code: '// store.js\nexport let n = 1;\nexport function set(v) { n = v; }\n\n// main.js\nimport { n, set } from "./store.js";\nset(5);\nconsole.log(n);',
      options: ["1", "5", "TypeError"],
      answer: 1,
      why: "set تغيّر n داخل store.js، وهذا مسموح لأن الملف يملك متغيره. و n في main رابط حيّ يرى القيمة الجديدة.",
    },
    {
      question: "ماذا تطبع main.js؟",
      code: '// a.js\nconst secret = 42;\n\n// main.js\nimport "./a.js";\nconsole.log(typeof secret);',
      options: ["number", "undefined", "خطأ في الاستيراد"],
      answer: 1,
      why: "لكل وحدة نطاقها الخاص. secret تعيش في سجل a.js ولم تُصدَّر، فلا تصل إلى النطاق العام ولا إلى main. typeof لاسم غير موجود تُرجع \"undefined\".",
    },
  ],
  next: "js-array-methods",
};
