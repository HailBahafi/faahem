import type { Frame, HeapObj, Lesson, Slot } from "@/lib/types";

const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
const nul = (name: string): Slot => ({ name, value: "null", type: "none" });
const glob = (vars: Slot[]): Frame => ({ id: 0, name: "البرنامج", vars });
const person: HeapObj = { id: 1, kind: "object", items: [{ name: "name", value: '"Sara"', type: "string" }, ref("photo", 2)] };
const photo: HeapObj = { id: 2, kind: "object", items: [{ name: "size", value: "5000", type: "number" }] };
const emptyCache: HeapObj = { id: 3, kind: "array", items: [] };
const fullCache: HeapObj = { id: 3, kind: "array", items: [ref("0", 2)] };

export const jsMemory: Lesson = {
  slug: "js-memory",
  stage: 0,
  number: "3.4",
  title: "الذاكرة وجامع القمامة",
  subtitle: "ما يمكن الوصول إليه يبقى، وما انقطع عنه يُحرَّر، والتسريب سهم نسيته",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "من يبقى في الذاكرة؟",
    body: "هذه كائنات برنامج حقيقي والأسهم بينها. اقطع سهماً أو اثنين ثم شغّل جامع القمامة. أي الكائنات يُحرَّر، وأيها يبقى مع أنك «انتهيت منه»؟",
    demo: "jsMemory",
  },
  scene: {
    code: {
      js: `let user = { name: "Sara", photo: { size: 5000 } };
const cache = [];
cache.push(user.photo);
user = null;
// the garbage collector may run here
console.log(cache[0].size);`,
    },
    steps: [
      {
        line: null,
        say: "في JavaScript لا تحرّر الذاكرة بنفسك. المحرّك يملك جامع قمامة يسأل سؤالاً واحداً عن كل كائن: هل يمكن الوصول إليه من الجذور؟ الجذور هي المتغيرات العامة وإطارات المكدّس.",
        memory: [],
        frames: [glob([])],
        heap: [],
      },
      {
        line: 1,
        say: "كائنان يُبنيان في الكومة: الصورة أولاً ثم الشخص الذي يشير إليها. المتغير user لا يحمل الكائن، بل سهماً إليه.",
        memory: [],
        frames: [glob([ref("user", 1)])],
        heap: [person, photo],
        changedHeap: [1, 2],
        changed: ["user"],
      },
      {
        line: 2,
        say: "مصفوفة فارغة في الكومة، و cache سهم إليها.",
        memory: [],
        frames: [glob([ref("user", 1), ref("cache", 3)])],
        heap: [person, photo, emptyCache],
        changedHeap: [3],
        changed: ["cache"],
      },
      {
        line: 3,
        say: "user.photo يُقرأ: السهم نفسه يُنسخ إلى المصفوفة، لا الصورة. الآن يصل إلى الصورة طريقان: من user ومن cache.",
        memory: [],
        frames: [glob([ref("user", 1), ref("cache", 3)])],
        heap: [person, photo, fullCache],
        changedHeap: [3],
        read: ["user"],
      },
      {
        line: 4,
        say: "user = null يمسح السهم من الدرج فقط. الكائنان ما زالا في الكومة، لكن لا سهم من الجذور يصل إلى الشخص بعد الآن.",
        memory: [],
        frames: [glob([nul("user"), ref("cache", 3)])],
        heap: [person, photo, fullCache],
        changed: ["user"],
      },
      {
        line: 5,
        say: "مرحلة التعليم (mark): يبدأ الجامع من الجذور ويتبع كل سهم. cache يوصل إلى المصفوفة، والمصفوفة توصل إلى الصورة. الشخص لم يصله أحد، فلا علامة عليه.",
        memory: [],
        frames: [glob([nul("user"), ref("cache", 3)])],
        heap: [person, photo, fullCache],
        changedHeap: [3, 2],
      },
      {
        line: 5,
        say: "مرحلة الكنس (sweep): كل كائن بلا علامة يُحرَّر. الشخص اختفى. الصورة بقيت حيّة لأن cache ما زال يشير إليها، حتى لو لم يعد أحد يحتاجها.",
        memory: [],
        frames: [glob([nul("user"), ref("cache", 3)])],
        heap: [photo, fullCache],
      },
      {
        line: 6,
        say: "cache[0] يتبع السهم إلى الصورة الحيّة ويقرأ size. يُطبع 5000. لو كان cache لا يتوقف عن النمو، لكان هذا تسريباً: ذاكرة لا يحتاجها أحد ولا يحرّرها أحد.",
        memory: [],
        frames: [glob([nul("user"), ref("cache", 3)])],
        heap: [photo, fullCache],
        read: ["cache"],
        output: ["5000"],
      },
    ],
    notes: {
      js: "V8 يقسم الكومة إلى جيل صغير يُكنس كثيراً وبسرعة (أغلب الكائنات تموت صغيرة) وجيل قديم يُكنس أقل. وأنت لا تستدعي الجامع: هو يقرر متى يعمل.",
    },
  },
  playground: {
    kind: "trace",
    intro: "جامع قمامة مصغّر: كل كائن عقدة فيها أسهمه refs وعلامة marked، و roots هي ما يصل إليه البرنامج مباشرة. mark تتبع الأسهم من الجذور، ثم الحلقة الأخيرة تكنس ما لم يُعلَّم.",
    starter: `const avatar = { name: "avatar", refs: [], marked: false };
const profile = { name: "profile", refs: [avatar], marked: false };
const user = { name: "user", refs: [profile], marked: false };
const cache = { name: "cache", refs: [], marked: false };
const heap = [user, profile, avatar, cache];
const roots = [cache];
cache.refs.push(avatar);
function mark(obj) {
  if (obj.marked) return;
  obj.marked = true;
  for (const child of obj.refs) mark(child);
}
for (const root of roots) mark(root);
for (const obj of heap) {
  if (obj.marked) console.log("keep " + obj.name);
  else console.log("free " + obj.name);
}`,
    challenges: [
      "قبل التشغيل: لماذا يبقى avatar مع أن user خارج الجذور؟ من يمسكه؟",
      "احذف السطر cache.refs.push(avatar) وتوقّع: كم كائناً يُحرَّر الآن؟",
      "أضف user إلى roots. ماذا يبقى؟ (هذا ما يحدث حين يبقى متغير عام يشير إلى كائن انتهيت منه.)",
      "أضف حلقة: avatar.refs.push(user). هل تدخل mark في حلقة لا تنتهي؟ أي سطر يمنع ذلك؟",
    ],
  },
  predict: [
    {
      question: "بعد a = null، هل يستطيع جامع القمامة أن يحرّر الكائن؟ وماذا يُطبع؟",
      code: `let a = { v: 1 };
let b = a;
a = null;
console.log(b.v);`,
      options: ["لا يُحرَّر، و b ما زال يصل إليه، فيُطبع 1", "يُحرَّر، فيحدث خطأ عند b.v", "يُحرَّر، ويُطبع undefined"],
      answer: 0,
      why: "b = a نسخت السهم لا الكائن، فصار للكائن سهمان. a = null مسحت سهماً واحداً. الجامع لا يحرّر إلا ما لا يصل إليه أي سهم من الجذور.",
    },
    {
      question: "انتهت makeReport وأُزيل إطارها. هل تُحرَّر المصفوفة rows؟",
      code: `function makeReport() {
  const rows = [10, 20, 30];
  return () => rows.length;
}
const count = makeReport();
console.log(count());`,
      options: ["لا، الدالة count ما زالت تمسك بها، ويُطبع 3", "نعم، لأن إطار makeReport أُزيل", "نعم، ويحدث خطأ عند count()"],
      answer: 0,
      why: "الإغلاق سهم أيضاً: الدالة المعادة تحمل معها بيئة makeReport، وفيها rows. ما دام count يمكن الوصول إليه، تبقى rows حيّة. هذا مصدر شائع للتسريب: إغلاق صغير يمسك بيانات كبيرة.",
    },
    {
      question: "بعد هذه الاستدعاءات، كم كائناً يبقى في الذاكرة بسبب cache، ولمتى؟",
      code: `const cache = {};
function load(id) {
  if (!cache[id]) cache[id] = { id: id, data: "..." };
  return cache[id];
}
load(1);
load(2);
load(1);
load(3);
console.log("loaded");`,
      options: ["3 كائنات، ما دام البرنامج يعمل", "كائن واحد، الأخير فقط", "4 كائنات، ثم تُحرَّر بعد انتهاء load"],
      answer: 0,
      why: "load(1) الثانية وجدت الكائن فلم تصنع جديداً. cache متغير عام، أي جذر، فكل ما فيه يبقى إلى الأبد. ذاكرة مؤقتة بلا حد ولا حذف هي أشهر تسريب في خوادم Node.",
    },
  ],
  code: {
    intro: "ثلاث أدوات يستعملها المحترف ضد التسريب: ذاكرة مؤقتة لها حد (Map تحفظ ترتيب الإدخال، فأول مفتاح هو الأقدم)، و WeakMap تربط بيانات بكائن دون أن تبقيه حياً، ودالة إلغاء اشتراك تُعاد مع كل مستمع.",
    runnerStarter: `// 1) A cache with a limit (LRU): Map keeps insertion order, the first key is the oldest.
class LruCache {
  #map = new Map();
  constructor(limit) {
    this.limit = limit;
  }
  get(key) {
    if (!this.#map.has(key)) return undefined;
    const value = this.#map.get(key);
    this.#map.delete(key); // re-insert: now it is the newest
    this.#map.set(key, value);
    return value;
  }
  set(key, value) {
    this.#map.delete(key);
    this.#map.set(key, value);
    if (this.#map.size > this.limit) this.#map.delete(this.#map.keys().next().value);
  }
  keys() {
    return [...this.#map.keys()];
  }
}
const users = new LruCache(2);
users.set(1, "Sara");
users.set(2, "Omar");
users.get(1); // 1 is used, so 2 becomes the oldest
users.set(3, "Lina"); // over the limit: evicts 2
console.log("cache keeps", users.keys().join(","));

// 2) WeakMap: data attached to an object without keeping the object alive.
const clicks = new WeakMap();
function track(element) {
  clicks.set(element, (clicks.get(element) ?? 0) + 1);
  return clicks.get(element);
}
let button = { id: "buy" };
track(button);
console.log("clicks", track(button));
button = null; // the entry can now be collected together with the button

// 3) Listeners: subscribe returns the function that removes them.
const listeners = new Set();
function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
const unsubscribe = subscribe(() => console.log("tick"));
console.log("listeners", listeners.size);
unsubscribe();
console.log("listeners", listeners.size);

// 4) WeakRef: point at an object without holding it; deref() may return undefined later.
const ref = new WeakRef({ big: "report" });
console.log("still here?", ref.deref() !== undefined);
// try: make the cache limit 1 and predict what it keeps
`,
  },
  exercises: [
    {
      kind: "order",
      title: "اشتراك يمكن إلغاؤه",
      prompt: "رتّب الأسطر: مستمعان يشتركان، ثم يلغي الأول اشتراكه. يُطبع 2 ثم 1.",
      lines: [
        "const listeners = new Set();",
        "function subscribe(fn) {",
        "  listeners.add(fn);",
        "  return () => listeners.delete(fn);",
        "}",
        'const stopA = subscribe(() => "a");',
        'subscribe(() => "b");',
        "console.log(listeners.size);",
        "stopA();",
        "console.log(listeners.size);",
      ],
      expected: "2\n1",
    },
    {
      kind: "fill",
      title: "ذاكرة مؤقتة بحد",
      prompt: "الذاكرة المؤقتة تحفظ عنصرين فقط. أي تعبير يحذف الأقدم حين تتجاوز الحد؟",
      template: `const cache = new Map();
function remember(key, value) {
  cache.set(key, value);
  if (cache.size > 2) cache.delete(___);
}
remember("a", 1);
remember("b", 2);
remember("c", 3);
console.log([...cache.keys()].join(","));`,
      options: ["cache.keys().next().value", "key", "cache.size"],
      expected: "b,c",
    },
    {
      kind: "fix",
      title: "لافتة تُغلق ولا تُنسى",
      prompt: "اللافتة تُعرض ثم تُغلق ثلاث مرات، لكن مستمعيها يبقون، وكل واحد يمسك مصفوفة كبيرة. أصلح الحلقة حتى لا يبقى أي مستمع (يُطبع 0).",
      code: `const listeners = [];
function on(fn) {
  listeners.push(fn);
  return () => listeners.splice(listeners.indexOf(fn), 1);
}
function mountBanner() {
  const big = new Array(1000).fill("x");
  const off = on(() => big.length);
  return off;
}
for (let i = 0; i < 3; i++) {
  mountBanner(); // shown, then closed
}
console.log(listeners.length);`,
      expected: "0",
      hint: "mountBanner تعيد دالة الإلغاء، والحلقة ترميها. احفظها في متغير واستدعِها حين تُغلق اللافتة.",
      solution: `const listeners = [];
function on(fn) {
  listeners.push(fn);
  return () => listeners.splice(listeners.indexOf(fn), 1);
}
function mountBanner() {
  const big = new Array(1000).fill("x");
  const off = on(() => big.length);
  return off;
}
for (let i = 0; i < 3; i++) {
  const unmount = mountBanner(); // shown
  unmount(); // closed: the listener and its big array can be collected
}
console.log(listeners.length);`,
    },
    {
      kind: "write",
      title: "عدّاد زيارات لا يُسرّب",
      prompt: "اكتب visit(user) التي تعدّ زيارات كل كائن مستخدم في WeakMap وتعيد العدد الجديد. يُطبع 1 ثم 2 ثم 1.",
      starter: `// write visit(user): keep a count per user object in a WeakMap, return the new count

const alice = { name: "Alice" };
const bob = { name: "Bob" };
console.log(visit(alice));
console.log(visit(alice));
console.log(visit(bob));`,
      expected: "1\n2\n1",
      hint: "const visits = new WeakMap(); وداخل الدالة: const n = (visits.get(user) ?? 0) + 1; visits.set(user, n); return n;",
      solution: `const visits = new WeakMap();
function visit(user) {
  const n = (visits.get(user) ?? 0) + 1;
  visits.set(user, n);
  return n;
}

const alice = { name: "Alice" };
const bob = { name: "Bob" };
console.log(visit(alice));
console.log(visit(alice));
console.log(visit(bob));`,
    },
  ],
  quiz: [
    {
      question: "بعد هذه الأسطر، أي كائن يستطيع الجامع أن يحرّره؟",
      code: "let a = { v: 1 };\nlet b = { child: a };\na = null;",
      options: ["لا شيء: الكائنان يمكن الوصول إليهما", "الكائن الأول { v: 1 }", "الكائنان معاً"],
      answer: 0,
      why: "a = null مسحت سهم الدرج a، لكن b.child ما زال سهماً إلى الكائن الأول، و b نفسه جذر. ما دام هناك طريق من الجذور، يبقى الكائن.",
    },
    {
      question: "كائنان يشير كل منهما إلى الآخر، ثم نمسح المتغيرين. ماذا يحدث؟",
      code: "let x = {};\nlet y = {};\nx.other = y;\ny.other = x;\nx = null;\ny = null;",
      options: ["يُحرَّران معاً", "يبقيان إلى الأبد لأن كلاً منهما يشير إلى الآخر", "يُحرَّر x فقط"],
      answer: 0,
      why: "الجامع لا يعدّ الأسهم الداخلة؛ يبدأ من الجذور ويتبعها. لا طريق من الجذور إلى أيهما، فلا يُعلَّم أحدهما، فيُكنسان معاً رغم الحلقة.",
    },
    {
      question: "ما الذي يُبقي المصفوفة big في الذاكرة هنا؟",
      code: "const big = new Array(1e6).fill(0);\nsetInterval(() => console.log(big.length), 1000);",
      options: ["دالة المؤقّت المسجّلة، ما دام clearInterval لم يُستدعَ", "لا شيء، تُحرَّر بعد أول طباعة", "console.log تحفظ نسخة منها"],
      answer: 0,
      why: "البيئة تمسك دالة المؤقّت لأنها ستستدعيها كل ثانية، والدالة إغلاق يمسك big. المؤقّتات والمستمعون جذور خفية: ما لم تلغِها، يبقى كل ما تصل إليه.",
    },
    {
      question: "مسحنا el. هل يمكن تحرير الكائن { id: 1 }؟",
      code: 'const meta = new Map();\nlet el = { id: 1 };\nmeta.set(el, "seen");\nel = null;',
      options: ["لا، مفتاح Map سهم قوي يبقيه حياً", "نعم، لأن el أصبح null", "نعم، Map تحذف المفاتيح تلقائياً"],
      answer: 0,
      why: "Map تمسك مفاتيحها بأسهم عادية، فالكائن ما زال قابلاً للوصول عبر meta. مع WeakMap لا يُحسب المفتاح سهماً، فيُحرَّر الكائن ومدخله معاً.",
    },
    {
      question: "ref = new WeakRef(obj). ماذا يمكن أن تعيد ref.deref() بعد مدة، إن لم يبقَ سهم قوي إلى obj؟",
      options: ["الكائن، أو undefined إن كان الجامع قد حرّره", "الكائن دائماً", "خطأ ReferenceError"],
      answer: 0,
      why: "WeakRef سهم لا يحسبه الجامع. ما دام الكائن حياً لسبب آخر تعيده deref، وبعد تحريره تعيد undefined. لهذا تتحقق من النتيجة في كل مرة.",
    },
  ],
  next: "js-proxy",
};
