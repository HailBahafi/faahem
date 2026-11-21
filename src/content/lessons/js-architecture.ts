import type { Cell, Lesson, Scene } from "@/lib/types";

const box = (name: string, value: string): Cell => ({ name, value, type: "none" });
const num = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

/** A hand-written scene for a predict answer. */
const mini = (js: string, steps: Scene["steps"]): Scene => ({ code: { js }, steps });

const LAYERS = [box("domain", "totalOf: pure rules"), box("application", "placeOrder(deps)"), box("adapters", "orders.save → ?")];

export const jsArchitecture: Lesson = {
  slug: "js-architecture",
  stage: 0,
  number: "4.6",
  title: "تنظيم مشروع كبير",
  subtitle: "طبقات أسهمها تشير إلى الداخل: القواعد في المركز، والعالم الخارجي على الحافة",
  minutes: 30,
  singleLanguage: true,
  problem: {
    title: "كم ملفاً يتغيّر؟",
    body: "نفس المتجر مكتوب بطريقتين. اختر تغييراً يطلبه العمل، وانظر كم ملفاً تحتاج أن تفتح في كل طريقة.",
    demo: "jsArchitecture",
  },
  scene: {
    code: {
      js: `const totalOf = (items) => items.reduce((sum, it) => sum + it.price * it.qty, 0);
const makePlaceOrder = (deps) => (items) => {
  const order = { id: deps.newId(), total: totalOf(items) };
  deps.orders.save(order);
  return order;
};
const saved = [];
const placeOrder = makePlaceOrder({ newId: () => "o1", orders: { save: (o) => saved.push(o) } });
console.log(placeOrder([{ price: 5, qty: 2 }]).total, saved.length);`,
    },
    steps: [
      {
        line: null,
        say: "قبل: معالج HTTP واحد من 200 سطر يقرأ الطلب و process.env، ويحسب السعر، ويكتب SQL، ويطبع نصوصاً، ويرد 500 على كل خطأ. لتختبر السعر تحتاج خادماً وقاعدة بيانات. بعد: ثلاث طبقات، وكل اعتماد يشير إلى الداخل.",
        memory: [],
      },
      {
        line: 1,
        say: "الطبقة الداخلية (domain): قاعدة العمل وحدها. دالة نقية لا تعرف HTTP ولا قاعدة بيانات، فتُختبر بسطر واحد وتعيش سنوات.",
        memory: [LAYERS[0]],
        changed: ["domain"],
      },
      {
        line: 2,
        say: "طبقة التطبيق (use case): «اطلب طلباً». تستلم ما تحتاجه معاملاتٍ (deps): من يولّد المعرّف، ومن يحفظ. تعرف ماذا تحتاج، لا من يقدّمه. هذه منافذ (ports).",
        memory: [LAYERS[0], LAYERS[1]],
        changed: ["application"],
      },
      {
        line: 8,
        say: "جذر التركيب (composition root): المكان الوحيد الذي يعرف القطع الحقيقية ويوصلها. هنا مخزن في الذاكرة لاختبار؛ في الإنتاج يكون orders: postgresOrders(pool). الأسطر 1 إلى 6 لا تتغيّر أبداً.",
        memory: [...LAYERS.slice(0, 2), box("adapters", "orders.save → saved.push"), box("saved", "[]")],
        changed: ["adapters", "saved"],
      },
      {
        line: 3,
        say: "الاستدعاء: المعرّف من المنفذ (o1)، والمجموع من قاعدة الـ domain: 5 × 2 = 10.",
        memory: [...LAYERS.slice(0, 2), box("adapters", "orders.save → saved.push"), box("saved", "[]"), box("order", '{ id: "o1", total: 10 }')],
        changed: ["order"],
      },
      {
        line: 4,
        say: "الحفظ عبر المنفذ: placeOrder لا تعرف أن الحفظ مصفوفة. لو كان Postgres لكان السطر نفسه.",
        memory: [...LAYERS.slice(0, 2), box("adapters", "orders.save → saved.push"), box("saved", "[order]"), box("order", '{ id: "o1", total: 10 }')],
        changed: ["saved"],
      },
      {
        line: 9,
        say: "يُطبع 10 و 1: السعر صحيح وحُفظ طلب واحد. اختبار كامل للـ use case بلا خادم ولا قاعدة بيانات، في جزء من الألف من الثانية.",
        memory: [...LAYERS.slice(0, 2), box("adapters", "orders.save → saved.push"), num("saved.length", 1), box("order", '{ id: "o1", total: 10 }')],
        read: ["order", "saved.length"],
        output: ["10 1"],
      },
      {
        line: null,
        say: "الحافة تتولى العالم: تقرأ الإعدادات مرة عند البدء وتتحقق منها، وتترجم أخطاء الـ domain المسمّاة إلى رموز HTTP في مكان واحد، وتسجّل سجلات منظّمة. تبديل قاعدة البيانات = محوّل جديد وسطر في الجذر.",
        memory: [box("domain", "rules + named errors"), box("application", "use cases + ports"), box("adapters", "HTTP, DB, logs, config")],
      },
    ],
    notes: {
      js: "في مشروع حقيقي: src/domain و src/app و src/adapters و src/main.js (الجذر)، أو مجلد لكل ميزة (orders/ و users/) وداخل كل واحد الطبقات نفسها. والقاعدة تُفرض آلياً: قاعدة no-restricted-imports في ESLint أو أداة مثل dependency-cruiser تمنع domain من استيراد adapters.",
    },
  },
  playground: {
    kind: "trace",
    intro: "مدقق اتجاه الاعتماد: لكل طبقة رتبة، والاستيراد مسموح فقط نحو رتبة مساوية أو أدنى (نحو الداخل). في القائمة خطأ واحد مخبّأ.",
    starter: `const rank = { domain: 0, application: 1, adapters: 2 };
const modules = [
  { name: "pricing", layer: "domain", imports: [] },
  { name: "placeOrder", layer: "application", imports: ["pricing"] },
  { name: "postgresOrders", layer: "adapters", imports: ["placeOrder"] },
  { name: "httpRoutes", layer: "adapters", imports: ["placeOrder"] },
  { name: "discounts", layer: "domain", imports: ["postgresOrders"] },
];
function layerOf(name) {
  for (const m of modules) {
    if (m.name === name) return m.layer;
  }
  return "unknown";
}
let violations = 0;
for (const m of modules) {
  for (const dep of m.imports) {
    const from = rank[m.layer];
    const to = rank[layerOf(dep)];
    if (to > from) {
      violations++;
      console.log("violation: " + m.name + " (" + m.layer + ") imports " + dep + " (" + layerOf(dep) + ")");
    }
  }
}
console.log(violations + " violation(s)");`,
    challenges: [
      "قبل التشغيل: أي استيراد سيُطبع مخالفاً، ولماذا هو خطر؟",
      "أصلح discounts: اجعلها تستورد pricing بدل postgresOrders. كم مخالفة تبقى؟",
      "أضف وحدة { name: \"refund\", layer: \"application\", imports: [\"httpRoutes\"] }. هل يجب أن تعرف حالة الاستخدام شيئاً عن HTTP؟",
    ],
  },
  predict: [
    {
      question: "الحافة تترجم الأخطاء إلى رموز HTTP. ماذا يُطبع؟",
      code: `function toHttp(err) {
  if (err.code === "NOT_FOUND") return 404;
  if (err.code === "INVALID") return 400;
  return 500;
}
const invalid = { code: "INVALID", message: "qty must be positive" };
const crash = { message: "connection reset" };
console.log(toHttp(invalid), toHttp(crash));`,
      options: ["400 500", "400 400", "500 500"],
      answer: 0,
      why: "الأخطاء المتوقعة لها أسماء يعرفها الـ domain (INVALID)، فتُترجم إلى ما يفهمه العميل. وما لا نعرفه (انقطاع الاتصال) لا نخمّن معناه: 500، مع سجل كامل للخطأ للمطوّرين، ورسالة عامة للعميل لا تكشف التفاصيل الداخلية.",
    },
    {
      question: "التطبيق يبدأ بهذه البيئة. ماذا يُطبع؟",
      code: `const env = { PORT: "8080", DB_URL: "" };
function loadConfig(env) {
  const port = Number(env.PORT);
  if (!env.DB_URL) throw new Error("DB_URL is required");
  return { port: port, dbUrl: env.DB_URL };
}
try {
  console.log(loadConfig(env).port);
} catch (e) {
  console.log("startup failed: " + e.message);
}`,
      options: ["startup failed: DB_URL is required", "8080", "undefined"],
      answer: 0,
      why: "الإعدادات تُقرأ مرة عند البدء وتُفحص كلها، فيفشل التطبيق فوراً برسالة واضحة. البديل أسوأ: يبدأ «سليماً» ثم ينهار عند أول طلب يحتاج قاعدة البيانات، في الثالثة فجراً. بعد الفحص يُمرَّر كائن config إلى من يحتاجه، ولا أحد يقرأ process.env غير هذه الدالة.",
    },
    {
      question: "أي سطر يكسر اتجاه الاعتماد؟",
      code: `// src/domain/pricing.js
import { round2 } from "./money.js";        // A
import { pool } from "../adapters/db.js";   // B

// src/app/placeOrder.js
import { priceOrder } from "../domain/pricing.js"; // C`,
      options: ["B", "A", "C"],
      answer: 0,
      why: "الـ domain في المركز ولا يعرف شيئاً خارجه. B تجعل قاعدة السعر تعتمد على قاعدة البيانات: لا تُختبر بلا قاعدة، وتبديل القاعدة يمسّ قواعد العمل. A داخل الطبقة نفسها، و C تشير إلى الداخل: مسموحان. إن احتاج السعر بيانات، تجلبها حالة الاستخدام عبر منفذ وتمرّرها له.",
      scene: mini(
        `domain/pricing.js → adapters/db.js`,
        [
          { line: 1, say: "الأسهم المسموحة: adapters ← app ← domain، أي من الخارج إلى الداخل.", memory: [box("A", "domain → domain ✓"), box("C", "app → domain ✓")] },
          { line: 1, say: "B سهم من المركز إلى الحافة: الطبقة الأكثر ثباتاً صارت تعتمد على الأكثر تغيّراً.", memory: [box("A", "domain → domain ✓"), box("C", "app → domain ✓"), box("B", "domain → adapters ✗")], error: "dependency points outward" },
        ],
      ),
    },
  ],
  code: {
    intro: "إعادة هيكلة كاملة قبل وبعد. «قبل» دالة تفعل كل شيء. «بعد»: إعدادات تُفحص عند البدء، و domain نقي بأخطاء مسمّاة، و use case يستلم منافذه، ومحوّلات (مخزن، سجل JSON، ترجمة HTTP)، وجذر تركيب يوصلها. لاحظ الفرق في الردود والسجلات.",
    runnerStarter: `// ---------- BEFORE: one handler does everything ----------
const db = { rows: [], insert(row) { this.rows.push(row); } }; // stands for a pg client
const env = { VAT_RATE: "0.15" };
function handleBefore(req) {
  try {
    if (!req.body.items || req.body.items.length === 0) throw new Error("no items");
    let total = 0;
    for (const it of req.body.items) total += it.price * it.qty;
    total = total * (1 + Number(env.VAT_RATE)); // config read on every request
    db.insert({ total }); // SQL inside the handler: untestable without a database
    console.log("order placed " + total); // a sentence, not a record
    return { status: 200, body: { total } };
  } catch (e) {
    return { status: 500, body: "error" }; // the client's mistake looks like our crash
  }
}
console.log("before:", JSON.stringify(handleBefore({ body: { items: [] } })));

// ---------- AFTER ----------
// config: read once at startup, validated, frozen, passed down
function loadConfig(env) {
  const vatRate = Number(env.VAT_RATE);
  if (!(vatRate >= 0 && vatRate < 1)) throw new Error("VAT_RATE must be a number in [0, 1)");
  return Object.freeze({ vatRate });
}

// domain: pure rules and named errors
class ValidationError extends Error {
  name = "ValidationError";
}
function priceOrder(items, vatRate) {
  if (items.length === 0) throw new ValidationError("order has no items");
  const net = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  return Math.round(net * (1 + vatRate) * 100) / 100;
}

// application: the use case, given its ports
function makePlaceOrder({ orders, logger, config }) {
  return (items) => {
    const order = orders.save({ total: priceOrder(items, config.vatRate) });
    logger.info("order placed", { orderId: order.id, total: order.total });
    return order;
  };
}

// adapters: storage, logging, HTTP
function memoryOrders() {
  const rows = [];
  return { save: (o) => { const row = { id: "o" + (rows.length + 1), ...o }; rows.push(row); return row; } };
}
function jsonLogger(base) {
  const write = (level) => (msg, fields = {}) => console.log(JSON.stringify({ level, msg, ...base, ...fields }));
  return { info: write("info"), error: write("error") };
}
function httpHandler(placeOrder, logger) {
  return (req) => {
    try {
      return { status: 201, body: placeOrder(req.body.items ?? []) };
    } catch (err) {
      if (err instanceof ValidationError) return { status: 400, body: { error: err.message } };
      logger.error("unexpected error", { error: err.message }); // full detail in the log...
      return { status: 500, body: { error: "internal error" } }; // ...nothing internal to the client
    }
  };
}

// composition root: the one place that knows every concrete piece
const config = loadConfig(env);
const logger = jsonLogger({ service: "shop" });
const handle = httpHandler(makePlaceOrder({ orders: memoryOrders(), logger, config }), logger);

console.log("after:", JSON.stringify(handle({ body: { items: [{ price: 10, qty: 2 }] } })));
console.log("after:", JSON.stringify(handle({ body: { items: [] } })));
// try: set env.VAT_RATE = "15" and run: the app now refuses to start instead of charging 1600% VAT
`,
  },
  exercises: [
    {
      kind: "order",
      title: "وصّل القطع",
      prompt: "رتّب الأسطر: مخزن، ثم حالة استخدام تستلمه، ثم الجذر يوصلهما ويستدعي. يُطبع 1.",
      lines: [
        "function makeRepo() {",
        "  const rows = [];",
        "  return { save: (row) => rows.push(row), count: () => rows.length };",
        "}",
        "function makePlaceOrder(repo) {",
        "  return (total) => repo.save({ total });",
        "}",
        "const repo = makeRepo();",
        "const placeOrder = makePlaceOrder(repo);",
        "placeOrder(30);",
        "console.log(repo.count());",
      ],
      expected: "1",
    },
    {
      kind: "fill",
      title: "ترجم الخطأ المسمّى",
      prompt: "الحافة ترد 404 لخطأ «غير موجود» فقط، و 500 لأي شيء آخر. أكمل الشرط.",
      template: `class NotFoundError extends Error {}
function toStatus(err) {
  if (err instanceof ___) return 404;
  return 500;
}
console.log(toStatus(new NotFoundError("no order 7")), toStatus(new Error("db down")));`,
      options: ["NotFoundError", "Error", "TypeError"],
      expected: "404 500",
    },
    {
      kind: "fix",
      title: "اختبار يحتاج قاعدة بيانات",
      prompt: "placeOrder مربوطة بـ Postgres مباشرة، فالاختبار يتعطّل على جهاز بلا قاعدة. اجعلها تستلم مخزنها (makePlaceOrder(orders))، واجعل الاختبار يمرّر memoryOrders. يُطبع 10 1.",
      code: `const postgresOrders = {
  save(order) {
    throw new Error("connect ECONNREFUSED 127.0.0.1:5432");
  },
};
function placeOrder(items) {
  const order = { total: items.reduce((sum, it) => sum + it.price, 0) };
  postgresOrders.save(order);
  return order;
}
// unit test: no database on this machine
const saved = [];
const memoryOrders = { save: (order) => saved.push(order) };
console.log(placeOrder([{ price: 4 }, { price: 6 }]).total, saved.length);`,
      expected: "10 1",
      hint: "function makePlaceOrder(orders) { return (items) => { ...; orders.save(order); return order; }; } ثم في الاختبار: const placeOrder = makePlaceOrder(memoryOrders). والإنتاج يمرّر postgresOrders في جذر التركيب.",
      solution: `const postgresOrders = {
  save(order) {
    throw new Error("connect ECONNREFUSED 127.0.0.1:5432");
  },
};
function makePlaceOrder(orders) {
  return (items) => {
    const order = { total: items.reduce((sum, it) => sum + it.price, 0) };
    orders.save(order);
    return order;
  };
}
// unit test: no database on this machine
const saved = [];
const memoryOrders = { save: (order) => saved.push(order) };
const placeOrder = makePlaceOrder(memoryOrders);
console.log(placeOrder([{ price: 4 }, { price: 6 }]).total, saved.length);`,
    },
    {
      kind: "write",
      title: "سجل منظّم",
      prompt: "اكتب createLogger(base) التي تعيد { info, error, child }. كل سجل سطر JSON واحد بالترتيب: level ثم msg ثم حقول base ثم الحقول الممررة. و child(extra) تعيد مسجّلاً جديداً base فيه base و extra معاً.",
      starter: `// write createLogger(base): structured JSON logs, one line per event

const log = createLogger({ service: "shop" });
log.info("order placed", { orderId: "o1", total: 46 });
const reqLog = log.child({ requestId: "r-9" });
reqLog.error("payment failed", { orderId: "o1" });`,
      expected:
        '{"level":"info","msg":"order placed","service":"shop","orderId":"o1","total":46}\n{"level":"error","msg":"payment failed","service":"shop","requestId":"r-9","orderId":"o1"}',
      hint: "JSON.stringify({ level, msg, ...base, ...fields }) يحفظ ترتيب المفاتيح كما كتبتها. و child تستدعي createLogger({ ...base, ...extra }).",
      solution: `function createLogger(base) {
  const write = (level) => (msg, fields = {}) => console.log(JSON.stringify({ level, msg, ...base, ...fields }));
  return {
    info: write("info"),
    error: write("error"),
    child: (extra) => createLogger({ ...base, ...extra }),
  };
}

const log = createLogger({ service: "shop" });
log.info("order placed", { orderId: "o1", total: 46 });
const reqLog = log.child({ requestId: "r-9" });
reqLog.error("payment failed", { orderId: "o1" });`,
    },
  ],
  quiz: [
    {
      question: "قاعدة البيانات متوقفة. ماذا يرى المستخدم؟",
      code: "// adapters/orders.js\nasync function findOrder(id) {\n  try {\n    return await db.query(\"SELECT ...\", [id]);\n  } catch (e) {\n    return null;\n  }\n}\n\n// http: if (!order) return res.status(404).send(\"Order not found\");",
      options: ["«Order not found»، ولا أثر للعطل في أي سجل", "خطأ 500 والسجل يذكر العطل", "ينتظر الطلب للأبد"],
      answer: 0,
      why: "catch ابتلع الخطأ وحوّله إلى «لا يوجد»: معلومة خاطئة للمستخدم، وصمت تام للمطوّرين. التقط فقط ما تعرف كيف تعالجه، ودع الباقي يصعد إلى الحافة، حيث يُسجَّل كاملاً ويُترجم مرة واحدة إلى 500.",
    },
    {
      question: "ما مشكلة هذا السجل في الإنتاج؟",
      code: 'console.log("user " + user.email + " paid with card " + card.number);',
      options: [
        "يكشف بيانات حساسة، ونصّه الحر لا يُبحث فيه ولا يُعدّ",
        "لا مشكلة: console.log سريع",
        "فقط أنه يجب أن يكون console.error",
      ],
      answer: 0,
      why: "السجلات تُحفظ وتُنسخ وتراها فرق كثيرة: لا أرقام بطاقات ولا كلمات مرور ولا رموز دخول. وسجل منظّم ‎{ level, msg, userId, orderId }‎ يمكن البحث فيه («كل أخطاء الطلب o1») وعدّه وربطه بطلب واحد عبر requestId.",
    },
    {
      question: "TIMEOUT_MS غير موجودة في بيئة الإنتاج. ماذا يحدث؟",
      code: "function callPayment(req) {\n  const ms = Number(process.env.TIMEOUT_MS);\n  return fetch(PAY_URL, { signal: AbortSignal.timeout(ms) });\n}",
      options: [
        "يبدأ التطبيق سليماً، ثم يفشل أول طلب دفع بخطأ عند Number(undefined) = NaN",
        "يرفض التطبيق البدء",
        "يُستعمل 30 ثانية افتراضياً",
      ],
      answer: 0,
      why: "الإعداد يُقرأ متأخراً، داخل الدالة، فلا يظهر الخطأ إلا حين يأتي أول عميل ليدفع. اقرأ الإعدادات كلها مرة عند البدء، وتحقق منها (رقم؟ ضمن المدى؟ موجود؟)، وافشل فوراً قبل أن تستقبل أي طلب.",
    },
    {
      question: "ماذا يحتاج اختبار هذه الحالة؟",
      code: "const placeOrder = makePlaceOrder({ orders, payments, clock });",
      options: [
        "كائنات مزيفة بسيطة لـ orders و payments و clock، بلا قاعدة ولا شبكة",
        "قاعدة بيانات اختبار وحساب دفع تجريبي",
        "لا يمكن اختبارها دون تشغيل الخادم",
      ],
      answer: 0,
      why: "لأن حالة الاستخدام تستلم منافذها، يمرّر الاختبار ما يشاء: مخزناً في مصفوفة، ودفعاً يرفض ليختبر مسار الفشل، وساعة ثابتة ليكون الوقت متوقعاً. آلاف الاختبارات في ثوانٍ. والمحوّلات الحقيقية لها اختبارات تكامل قليلة خاصة بها.",
    },
    {
      question: "المشروع منظّم حسب الميزة. طُلب تعديل في الاسترداد. أين تعمل غالباً؟",
      code: "src/\n  orders/    domain.js  app.js  http.js  db.js\n  refunds/   domain.js  app.js  http.js  db.js\n  users/     domain.js  app.js  http.js  db.js\n  main.js",
      options: ["داخل refunds/ فقط، إلا إن احتجت منفذاً جديداً", "في كل المجلدات، لأن كل طبقة مشتركة", "في main.js فقط"],
      answer: 0,
      why: "التنظيم حسب الميزة يضع ما يتغيّر معاً في مكان واحد، والطبقات داخل كل ميزة تحفظ اتجاه الاعتماد. الميزات تتكلم عبر حالات استخدام بعضها، لا عبر جداول بعضها. هكذا يعمل فريقان على ميزتين دون أن يتصادما.",
    },
  ],
};
