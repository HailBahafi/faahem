import type { Lesson } from "@/lib/types";

export const jsPatterns: Lesson = {
  slug: "js-patterns",
  stage: 0,
  number: "3.7",
  title: "أنماط التصميم",
  subtitle: "أشكال متكررة للأسهم بين الدوال والكائنات: وحدة، ومراقب، ومصنع، واستراتيجية، وسلسلة وسطاء",
  minutes: 24,
  singleLanguage: true,
  problem: {
    title: "ميزة جديدة دون أن تفتح المعالج",
    body: "طلب HTTP يمرّ على سلسلة من الدوال قبل أن يصل إلى المعالج. شغّل وأطفئ الحلقات، وغيّر حالة الدخول، وأرسل طلبات. أين يتوقف الطلب في كل مرة؟",
    demo: "jsPatterns",
  },
  scene: {
    code: {
      js: `function createEmitter() {
  const listeners = [];
  const on = (fn) => listeners.push(fn);
  const emit = (data) => { for (const fn of listeners) fn(data); };
  return { on: on, emit: emit };
}
const orders = createEmitter();
orders.on((id) => console.log("email " + id));
orders.on((id) => console.log("stock " + id));
orders.emit("A12");`,
    },
    steps: [],
    trace: true,
    notes: {
      js: "هذا نمطان معاً: وحدة (module) تخفي listeners في إغلاق ولا تكشف إلا on و emit، ومراقب (observer) يحفظ دوال ويستدعيها عند الحدث. في Node هو EventEmitter، وفي المتصفح addEventListener.",
    },
  },
  playground: {
    kind: "trace",
    intro: "سلسلة وسطاء (middleware) كما في Express: كل دالة تستلم الطلب ودالة next. إن استدعت next مرّ الطلب إلى التالية، وإن لم تستدعها توقّف عندها. تابع المكدّس: كل next إطار جديد فوق الذي قبله.",
    starter: `function runPipeline(middlewares, req) {
  function next(i) {
    if (i < middlewares.length) {
      const mw = middlewares[i];
      mw(req, () => next(i + 1));
    }
  }
  next(0);
}
function logger(req, next) {
  console.log("-> " + req.path);
  next();
}
function auth(req, next) {
  if (req.user) next();
  else console.log("401 " + req.path);
}
function handler(req, next) {
  console.log("200 hello " + req.user);
}
runPipeline([logger, auth, handler], { path: "/home", user: "Sara" });
runPipeline([logger, auth, handler], { path: "/admin", user: null });`,
    challenges: [
      "قبل التشغيل: كم سطراً يُطبع للطلب الثاني، ولماذا لا يصل إلى handler؟",
      "بدّل ترتيب logger و auth في المصفوفة. ماذا يتغير في طباعة الطلب الثاني؟",
      "اكتب وسيطاً timer يطبع \"start\" ثم يستدعي next ثم يطبع \"end\". ضعه أولاً، وتوقّع أين تظهر end.",
      "احذف next() من logger. ماذا يحدث للطلبين؟",
    ],
  },
  predict: [
    {
      question: "ماذا يُطبع؟",
      code: `function createCounter() {
  let count = 0;
  return {
    increment: () => {
      count = count + 1;
    },
    value: () => count,
  };
}
const counter = createCounter();
counter.count = 100;
counter.increment();
console.log(counter.value());`,
      options: ["1", "101", "100"],
      answer: 0,
      why: "count متغير في إطار createCounter، تمسكه الدالتان في إغلاقهما، ولا يصل إليه أحد غيرهما. counter.count = 100 أضافت درجاً جديداً اسمه count في الكائن المعاد، لا علاقة له بالمتغير المخفي. هذا نمط الوحدة: حالة خاصة وواجهة صغيرة.",
    },
    {
      question: "ماذا يحدث؟",
      code: `const shipping = {
  standard: (kg) => 10,
  express: (kg) => 10 + kg * 5,
};
function cost(method, kg) {
  const strategy = shipping[method];
  return strategy(kg);
}
console.log(cost("express", 2));
console.log(cost("drone", 1));`,
      options: ["20 ثم TypeError: strategy is not a function", "20 ثم 10", "20 ثم undefined"],
      answer: 0,
      why: "نمط الاستراتيجية: الطريقة تُختار من جدول بدل سلسلة if. \"express\" وجدت دالتها: 10 + 2 × 5 = 20. \"drone\" ليست في الجدول، فـ strategy هي undefined، واستدعاؤها يرمي TypeError. لهذا يحتاج الجدول قيمة افتراضية أو خطأً واضحاً.",
    },
    {
      question: "ماذا يُطبع؟",
      code: `function run(mws) {
  function next(i) {
    if (i < mws.length) {
      const mw = mws[i];
      mw(() => next(i + 1));
    }
  }
  next(0);
}
const a = (next) => {
  console.log("a");
  next();
};
const b = (next) => {
  console.log("b");
};
const c = (next) => {
  console.log("c");
  next();
};
run([a, b, c]);`,
      options: ["a ثم b", "a ثم b ثم c", "a فقط"],
      answer: 0,
      why: "السلسلة لا تتقدم وحدها: كل وسيط يقرر هل يستدعي next. b طبع ولم يستدعِها، فلم يصل أحد إلى c. وهذا مقصود أحياناً (رفض الدخول، رد من الذاكرة المؤقتة)، وخطأ شائع أحياناً أخرى (طلب معلّق لا يُرد عليه).",
    },
  ],
  code: {
    intro: "الأنماط كما تراها في مكتبات حقيقية: EventEmitter يعيد دالة إلغاء الاشتراك ويدعم once، ومصنع يبني مسجّلاً مضبوطاً، وجدول استراتيجيات للتسعير، و compose تبني سلسلة وسطاء مثل Express.",
    runnerStarter: `// Observer: an event emitter (Node's EventEmitter works the same way).
class Emitter {
  #listeners = new Map(); // event -> Set of functions
  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event).add(fn);
    return () => this.#listeners.get(event).delete(fn); // unsubscribe
  }
  once(event, fn) {
    const off = this.on(event, (data) => {
      off();
      fn(data);
    });
    return off;
  }
  emit(event, data) {
    for (const fn of [...(this.#listeners.get(event) ?? [])]) fn(data);
  }
}

// Factory: a function that builds configured objects (no "new", no shared state).
function createLogger(prefix, minLevel = 0) {
  const levels = ["debug", "info", "error"];
  const log = (level) => (msg) => {
    if (levels.indexOf(level) >= minLevel) console.log(prefix + " " + level + ": " + msg);
  };
  return { debug: log("debug"), info: log("info"), error: log("error") };
}

// Strategy: pick behaviour from a table instead of an if-chain.
const pricing = {
  regular: (total) => total,
  member: (total) => total * 0.9,
  coupon: (total) => Math.max(0, total - 20),
};
const priceFor = (plan, total) => (pricing[plan] ?? pricing.regular)(total);

// Middleware: compose a chain where each step decides whether to call next().
function compose(middlewares) {
  return (ctx) => {
    const dispatch = (i) => {
      const mw = middlewares[i];
      if (mw) mw(ctx, () => dispatch(i + 1));
    };
    dispatch(0);
  };
}

const log = createLogger("[shop]", 1);
const events = new Emitter();
events.once("order", (o) => log.info("first order ever: " + o.id));
events.on("order", (o) => log.info(o.id + " costs " + priceFor(o.plan, o.total)));

const handle = compose([
  (ctx, next) => {
    log.debug("never printed: below minLevel");
    next();
  },
  (ctx, next) => (ctx.order.total > 0 ? next() : log.error("empty order " + ctx.order.id)),
  (ctx) => events.emit("order", ctx.order),
]);
handle({ order: { id: "A1", plan: "member", total: 100 } });
handle({ order: { id: "A2", plan: "coupon", total: 50 } });
handle({ order: { id: "A3", plan: "vip", total: 0 } });
// try: add a "vip" strategy to pricing, and a middleware that blocks orders over 1000
`,
  },
  exercises: [
    {
      kind: "order",
      title: "جدول استراتيجيات",
      prompt: "رتّب الأسطر: جدول دوال تنسيق، و format تختار منه بالاسم. يُطبع Hello.",
      lines: [
        "const formatters = {",
        "  upper: (s) => s.toUpperCase(),",
        "  title: (s) => s[0].toUpperCase() + s.slice(1),",
        "};",
        "function format(text, style) {",
        "  return formatters[style](text);",
        "}",
        'console.log(format("hello", "title"));',
      ],
      expected: "Hello",
    },
    {
      kind: "fill",
      title: "مرّر الطلب",
      prompt: "ماذا يكتب auth حتى يصل الطلب إلى handler؟",
      template: `function run(mws, req) {
  const next = (i) => {
    if (i < mws.length) mws[i](req, () => next(i + 1));
  };
  next(0);
}
const auth = (req, next) => {
  console.log("auth");
  ___;
};
const handler = (req, next) => console.log("handler " + req.user);
run([auth, handler], { user: "Sara" });`,
      options: ["next()", "next", "return"],
      expected: "auth\nhandler Sara",
    },
    {
      kind: "fix",
      title: "مصنع يوزّع الكائن نفسه",
      prompt: "كل عدّاد يجب أن يكون مستقلاً: a زاد مرتين و b مرة، فالمتوقع 2 1. لكن يُطبع 3 3. أصلح المصنع.",
      code: `const defaults = { count: 0 };
function createCounter() {
  const state = defaults;
  return {
    increment: () => {
      state.count++;
    },
    value: () => state.count,
  };
}
const a = createCounter();
const b = createCounter();
a.increment();
a.increment();
b.increment();
console.log(a.value(), b.value());`,
      expected: "2 1",
      hint: "state = defaults ينسخ السهم، فكل العدّادات تشير إلى الكائن نفسه. المصنع يجب أن يصنع كائناً جديداً في كل استدعاء: { ...defaults }.",
      solution: `const defaults = { count: 0 };
function createCounter() {
  const state = { ...defaults };
  return {
    increment: () => {
      state.count++;
    },
    value: () => state.count,
  };
}
const a = createCounter();
const b = createCounter();
a.increment();
a.increment();
b.increment();
console.log(a.value(), b.value());`,
    },
    {
      kind: "write",
      title: "مخزن حالة صغير",
      prompt: "اكتب createStore(reducer, initial) التي تعيد getState و dispatch و subscribe. dispatch تستبدل الحالة بـ reducer(state, action) ثم تستدعي كل مشترك. يُطبع now 2 ثم now 5.",
      starter: `// write createStore(reducer, initial): returns { getState, dispatch, subscribe }
// dispatch(action): state = reducer(state, action), then call every subscriber

function counter(state, action) {
  if (action.type === "add") return state + action.by;
  return state;
}
const store = createStore(counter, 0);
store.subscribe(() => console.log("now " + store.getState()));
store.dispatch({ type: "add", by: 2 });
store.dispatch({ type: "add", by: 3 });`,
      expected: "now 2\nnow 5",
      hint: "داخل المصنع: let state = initial; const subscribers = []; ثم أعد كائناً فيه getState: () => state، و subscribe: (fn) => subscribers.push(fn)، و dispatch تحدّث state ثم تمرّ على subscribers.",
      solution: `function createStore(reducer, initial) {
  let state = initial;
  const subscribers = [];
  return {
    getState: () => state,
    subscribe: (fn) => {
      subscribers.push(fn);
      return () => subscribers.splice(subscribers.indexOf(fn), 1);
    },
    dispatch: (action) => {
      state = reducer(state, action);
      for (const fn of subscribers) fn();
    },
  };
}

function counter(state, action) {
  if (action.type === "add") return state + action.by;
  return state;
}
const store = createStore(counter, 0);
store.subscribe(() => console.log("now " + store.getState()));
store.dispatch({ type: "add", by: 2 });
store.dispatch({ type: "add", by: 3 });`,
    },
  ],
  quiz: [
    {
      question: "كم مرة يُطبع hi؟",
      code: 'const listeners = [];\nconst on = (fn) => listeners.push(fn);\nconst emit = () => listeners.forEach((fn) => fn());\nfunction once(fn) {\n  let done = false;\n  on(() => {\n    if (!done) {\n      done = true;\n      fn();\n    }\n  });\n}\nonce(() => console.log("hi"));\nemit();\nemit();',
      options: ["مرة واحدة", "مرتين", "ولا مرة"],
      answer: 0,
      why: "once تسجّل غلافاً يتذكّر done في إغلاقه. أول emit تجعله true وتستدعي fn، والثانية تجده true فلا تفعل شيئاً. (الغلاف يبقى في القائمة؛ النسخة الأفضل تلغي اشتراكها أيضاً.)",
    },
    {
      question: "ماذا يُطبع، وبأي ترتيب؟",
      code: 'const listeners = [];\nlisteners.push(() => console.log("A"));\nlisteners.push(() => console.log("B"));\nfor (const fn of listeners) fn();\nconsole.log("after");',
      options: ["A ثم B ثم after", "after ثم A ثم B", "B ثم A ثم after"],
      answer: 0,
      why: "emit في نمط المراقب مجرد حلقة تستدعي الدوال الآن، بترتيب تسجيلها، على المكدّس نفسه. لا طوابير ولا انتظار: لن يصل التنفيذ إلى after حتى ينتهي كل مستمع. مستمع بطيء يبطئ من أطلق الحدث.",
    },
    {
      question: "ملفان يستوردان العدّاد نفسه. ماذا تطبع b.js؟",
      code: '// counter.js\nexport const counter = { n: 0 };\n\n// a.js\nimport { counter } from "./counter.js";\ncounter.n++;\n\n// b.js (runs after a.js)\nimport { counter } from "./counter.js";\nconsole.log(counter.n);',
      options: ["1", "0", "خطأ: لا يمكن تعديل ما استُورد"],
      answer: 0,
      why: "الوحدة تُنفَّذ مرة واحدة فقط، وكل من يستوردها يحصل على السهم نفسه إلى الكائن نفسه. لهذا تعمل الوحدة كنسخة وحيدة (singleton) دون أي كود إضافي. الممنوع هو إعادة إسناد counter نفسه، لا تعديل ما بداخله.",
    },
    {
      question: "ماذا يطبع هذا الخادم لطلب بلا مستخدم؟",
      code: 'app.use((req, res, next) => {\n  console.log("log " + req.path);\n  next();\n});\napp.use((req, res, next) => {\n  if (!req.user) return res.status(401).send("login");\n  next();\n});\napp.get("/orders", (req, res) => res.send("orders"));\n// request: GET /orders with no user',
      options: ["log /orders ثم يرد 401", "يرد orders", "يرد 401 دون أن يطبع شيئاً"],
      answer: 0,
      why: "Express يمرّر الطلب بالترتيب الذي سجّلت به الوسطاء. المسجّل أولاً فيطبع ثم يستدعي next. الثاني يرد بـ 401 ولا يستدعي next، فلا يصل الطلب إلى معالج /orders.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'const handlers = {\n  click: (e) => "clicked " + e.id,\n  default: (e) => "ignored " + e.type,\n};\nconst handle = (e) => (handlers[e.type] ?? handlers.default)(e);\nconsole.log(handle({ type: "scroll", id: 1 }));',
      options: ["ignored scroll", "clicked 1", "TypeError"],
      answer: 0,
      why: "handlers[\"scroll\"] غير موجود فيعطي undefined، و ?? تختار handlers.default بدلاً منه. الاستراتيجية الافتراضية تجعل الجدول آمناً، وإضافة حدث جديد تعني سطراً في الجدول دون لمس handle.",
    },
  ],
  next: "js-streams",
};
