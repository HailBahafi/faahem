import type { Cell, Lesson } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

const r1 = s("routes", "GET /products/:id");
const r2 = s("routes", "GET /products/:id, POST /products");
const port = n("port", 3000);
const idle = s("loop", "waiting");

export const nodeServer: Lesson = {
  slug: "node-server",
  stage: 7,
  number: "7.2",
  title: "خادم Node",
  subtitle: "برنامج لا ينتهي: يستمع، يطابق، يرد، ثم ينتظر",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "عملية واحدة، زبائن كثيرون",
    body: "كل برنامج كتبته حتى الآن يبدأ وينتهي. الخادم لا ينتهي أبداً: ينتظر الطلبات. أرسل طلبات من عدة مستخدمين، وراقب كيف تُطابَق مع جدول المسارات وتعود الردود. ثم جرّب الطلب البطيء وانظر ماذا يحدث للبقية.",
    demo: "nodeServer",
  },
  scene: {
    code: {
      js: `const app = express();
app.use(express.json());
app.get("/products/:id", (req, res) => {
  const p = products.find((x) => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: "not found" });
  res.json(p);
});
app.post("/products", (req, res) => res.status(201).json(add(req.body)));
app.listen(3000);`,
    },
    notes: {
      js: "هذا Express، أشهر مكتبة خوادم في Node. app.get و app.post لا تشغّلان شيئاً: تسجّلان سطراً في جدول المسارات. الدالة (req, res) تُستدعى لاحقاً، مرة لكل طلب يطابق.",
    },
    steps: [
      { line: null, say: "الخادم برنامج يبدأ مرة واحدة ولا ينتهي. يستمع على منفذ (port)، ولكل طلب يصل يجد الدالة المناسبة ويستدعيها. لنرَ كيف يُبنى، ثم كيف يعيش.", memory: [] },
      { line: 1, say: "app هو الخادم: بداخله جدول مسارات فارغ. لم يستمع لأحد بعد.", memory: [s("routes", "")], changed: ["routes"] },
      { line: 2, say: "use يضيف خطوة تمر بها كل الطلبات أولاً: express.json يحوّل نص JSON في الجسم إلى كائن حقيقي في req.body.", memory: [s("routes", "")] },
      { line: 3, say: "app.get لا يستدعي الدالة الآن. يسجّل سطراً في الجدول: «GET على /products/شيء → هذه الدالة». ‎:id‎ خانة فارغة تقبل أي قيمة.", memory: [r1], changed: ["routes"] },
      { line: 8, say: "سطر ثانٍ في الجدول: POST على /products. الأسطر 3 إلى 8 كلها تعريفات، ولم يصل أي طلب بعد.", memory: [r2], changed: ["routes"] },
      { line: 9, say: "listen يفتح المنفذ 3000. وصل البرنامج إلى آخر سطر، لكنه لا يخرج: حلقة الأحداث تنتظر طلبات، كما انتظرت نقرات المستخدم في درس Event loop.", memory: [r2, port, idle], changed: ["port", "loop"] },
      { line: 3, say: "وصل من سارة GET /products/2. الراوتر يمر على الجدول: الطريقة GET تطابق، و /products/2 يطابق /products/:id، فيضع \"2\" في req.params.id.", memory: [r2, port, s("loop", "Sara"), s("req.method", "GET"), s("req.params.id", "2")], changed: ["loop", "req.method", "req.params.id"], read: ["routes"] },
      { line: 4, say: "الدالة تعمل الآن، لأجل سارة. params دائماً نص (\"2\") لأن العنوان نص، فنحوّله بـ Number قبل المقارنة بالرقم 2. وُجد الكتاب.", memory: [r2, port, s("loop", "Sara"), s("req.method", "GET"), s("req.params.id", "2"), s("p", "Book")], changed: ["p"], read: ["req.params.id"] },
      { line: 6, say: "res.json يرسل ردّاً واحداً: 200 ومعه الكتاب بصيغة JSON. الدالة انتهت، والخادم عاد ينتظر.", memory: [r2, port, idle, n("status", 200)], changed: ["loop", "status"] },
      { line: 5, say: "وصل من عمر GET /products/9. السطر نفسه في الجدول، والدالة نفسها، لكن استدعاء جديد بمتغيرات جديدة. p لا شيء، فيرد 404 ويخرج من الدالة فوراً.", memory: [r2, port, s("loop", "Omar"), s("req.params.id", "9"), n("status", 404)], changed: ["loop", "req.params.id", "status"] },
      { line: 8, say: "وصل من لينا POST /products وجسمه {\"name\":\"Bag\"}. express.json حوّله إلى كائن في req.body، و add حفظه، والرد 201.", memory: [r2, port, s("loop", "Lina"), s("req.method", "POST"), s("req.body.name", "Bag"), n("status", 201)], changed: ["loop", "req.method", "req.body.name", "status"] },
      { line: 9, say: "ثلاثة مستخدمين خدمتهم عملية واحدة، دالة بعد دالة. كل دالة قصيرة، فالانتظار بين الطلبات هو ما يجعلها تتسع للجميع. لو علقت دالة في حلقة طويلة لانتظر الجميع خلفها.", memory: [r2, port, idle], changed: ["loop"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذا راوتر Express مصغّر: routes مصفوفة أسطر { method, path, handler }، و get و post تضيفان سطراً، و dispatch يمر على الجدول ويستدعي أول دالة تطابق الطريقة والمسار. راقب الدالة تدخل المكدّس لكل طلب ثم تخرج.",
    starter: `let products = [{ id: 1, name: "Pen" }, { id: 2, name: "Book" }];
let routes = [];

function get(path, handler) {
  routes.push({ method: "GET", path: path, handler: handler });
}
function post(path, handler) {
  routes.push({ method: "POST", path: path, handler: handler });
}

function match(pattern, path) {
  let a = pattern.split("/");
  let b = path.split("/");
  if (a.length !== b.length) {
    return undefined;
  }
  let params = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].slice(0, 1) === ":") {
      params[a[i].slice(1)] = b[i];
    } else if (a[i] !== b[i]) {
      return undefined;
    }
  }
  return params;
}

function dispatch(req) {
  for (const r of routes) {
    let params = match(r.path, req.path);
    if (r.method === req.method && params !== undefined) {
      req.params = params;
      return r.handler(req);
    }
  }
  return { status: 404, body: "Cannot " + req.method + " " + req.path };
}

get("/products/:id", (req) => {
  for (const p of products) {
    if (p.id === Number(req.params.id)) {
      return { status: 200, body: p.name };
    }
  }
  return { status: 404, body: "not found" };
});
post("/products", (req) => {
  products.push({ id: products.length + 1, name: req.body.name });
  return { status: 201, body: "created" };
});

let res = dispatch({ method: "GET", path: "/products/2" });
console.log(res.status, res.body);
res = dispatch({ method: "POST", path: "/products", body: { name: "Bag" } });
console.log(res.status, res.body);`,
    challenges: [
      "أرسل GET إلى /products/3 بعد طلب POST. ماذا يُطبع؟ ولماذا لم يكن ممكناً قبله؟",
      "أرسل DELETE إلى /products/1. لماذا لم تُستدعَ أي دالة من دوالك؟",
      "أضف مساراً get(\"/products\", ...) يرد بعدد المنتجات، وأرسل له طلباً. كم سطراً صار في routes؟",
      "أرسل GET إلى /products/abc. ماذا تصبح Number(\"abc\")، وأي ردّ يعود؟",
    ],
  },
  predict: [
    {
      question: "سجّلنا المسار ‎/products/:id‎ قبل ‎/products/top‎. وصل الطلب GET /products/top. ماذا يُطبع؟",
      code: `let routes = [];
routes.push({ path: "/products/:id", handler: (req) => "product " + req.id });
routes.push({ path: "/products/top", handler: (req) => "top sellers" });
function dispatch(path) {
  for (const r of routes) {
    let a = r.path.split("/");
    let b = path.split("/");
    if (a[1] === b[1] && (a[2] === b[2] || a[2] === ":id")) {
      return r.handler({ id: b[2] });
    }
  }
  return "404";
}
console.log(dispatch("/products/top"));`,
      options: ["product top", "top sellers", "404"],
      answer: 0,
      why: "الراوتر يمر على الجدول بالترتيب ويقف عند أول سطر يطابق. ‎:id‎ يقبل أي قيمة، حتى الكلمة top. لذلك تُسجَّل المسارات الثابتة قبل المسارات التي فيها خانات.",
    },
    {
      question: "طلب GET /products/2، والدالة تقارن بالرقم مباشرة. ماذا يُطبع؟",
      code: `let products = [{ id: 1, name: "Pen" }, { id: 2, name: "Book" }];
function handler(req) {
  for (const p of products) {
    if (p.id === req.params.id) {
      return p.name;
    }
  }
  return "not found";
}
let req = { method: "GET", path: "/products/2", params: { id: "2" } };
console.log(handler(req));`,
      options: ["not found", "Book", "Pen"],
      answer: 0,
      why: "كل ما في العنوان نص، فـ req.params.id هو \"2\" لا 2. و === لا يحوّل الأنواع: \"2\" === 2 خطأ. الإصلاح: Number(req.params.id).",
    },
    {
      question: "ثلاثة مستخدمين مختلفين أرسلوا طلباً إلى الخادم نفسه. ماذا يُطبع؟",
      code: `let visits = 0;
function handler(req) {
  visits = visits + 1;
  return "hello " + req.user;
}
handler({ user: "Sara" });
handler({ user: "Omar" });
handler({ user: "Lina" });
console.log(visits);`,
      options: ["3", "1", "0"],
      answer: 0,
      why: "عملية Node واحدة تخدم الجميع، والمتغيرات خارج الدالة يشترك فيها كل الطلبات. كل طلب يستدعي الدالة من جديد بمتغيرات req خاصة به، لكن visits واحد.",
    },
  ],
  code: {
    intro: "هذا خادم Express كامل. احفظه في مجلد باسم server.js، ثم في الطرفية: npm install express ثم node server.js. لاحظ أن الطرفية لا تعود إليك: البرنامج يعيش. افتح http://localhost:3000/products/1 في المتصفح، وأوقف الخادم بـ Ctrl+C.",
    runnerStarter: `const express = require("express");
const app = express();
app.use(express.json());

let products = [{ id: 1, name: "Pen", price: 3 }];

app.get("/products", (req, res) => {
  res.json(products);
});

app.get("/products/:id", (req, res) => {
  const p = products.find((x) => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: "not found" });
  res.json(p);
});

app.post("/products", (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: "name is required" });
  const p = { id: products.length + 1, name: req.body.name, price: req.body.price };
  products.push(p);
  res.status(201).json(p);
});

app.listen(3000, () => console.log("listening on http://localhost:3000"));`,
    runnerLang: "text",
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "حياة طلب داخل الخادم",
      prompt: "رتّب ما يحدث من تشغيل الخادم حتى يعود لينتظر بعد طلب واحد.",
      lines: [
        "app.listen(3000): الخادم يستمع على المنفذ",
        "يصل الطلب GET /products/2",
        "الراوتر يقارن الطريقة والمسار بأسطر الجدول",
        "تُستدعى الدالة المطابقة و req.params.id = \"2\"",
        "الدالة ترسل الرد بـ res.json",
        "الخادم يعود لينتظر الطلب التالي",
      ],
      expected: "",
    },
    {
      kind: "fill",
      title: "شرط المطابقة",
      prompt: "في الجدول ثلاثة مسارات. أكمل الشرط حتى يصل الطلب POST /products إلى الدالة الصحيحة فيُطبع created.",
      template: `let routes = [
  { method: "GET", path: "/products", handler: () => "list" },
  { method: "POST", path: "/orders", handler: () => "order" },
  { method: "POST", path: "/products", handler: () => "created" },
];
function dispatch(req) {
  for (const r of routes) {
    if (___) {
      return r.handler(req);
    }
  }
  return "404";
}
console.log(dispatch({ method: "POST", path: "/products" }));`,
      options: ["r.method === req.method && r.path === req.path", "r.path === req.path", "r.method === req.method"],
      expected: "created",
    },
    {
      kind: "fix",
      title: "المنتج موجود لكنه «غير موجود»",
      prompt: "الطلب /products/2 يرد not found مع أن الكتاب في القائمة. أصلح الدالة حتى يُطبع Book.",
      code: `let products = [{ id: 1, name: "Pen" }, { id: 2, name: "Book" }];
function handler(req) {
  for (const p of products) {
    if (p.id === req.params.id) {
      return p.name;
    }
  }
  return "not found";
}
console.log(handler({ method: "GET", path: "/products/2", params: { id: "2" } }));`,
      expected: "Book",
      hint: "req.params.id نص لأنه جاء من العنوان. حوّله إلى رقم قبل أن تقارنه بـ p.id.",
      solution: `let products = [{ id: 1, name: "Pen" }, { id: 2, name: "Book" }];
function handler(req) {
  for (const p of products) {
    if (p.id === Number(req.params.id)) {
      return p.name;
    }
  }
  return "not found";
}
console.log(handler({ method: "GET", path: "/products/2", params: { id: "2" } }));`,
    },
    {
      kind: "write",
      title: "اكتب الراوتر",
      prompt: "اكتب dispatch: تمر على routes وتستدعي handler أول سطر تطابق طريقته ومساره الطلب، وترجع ما يرجعه. إن لم يطابق شيء ترجع \"404\".",
      starter: `let routes = [
  { method: "GET", path: "/hello", handler: (req) => "hi " + req.query.name },
  { method: "POST", path: "/hello", handler: (req) => "saved" },
];
// اكتب الدالة dispatch هنا

console.log(dispatch({ method: "GET", path: "/hello", query: { name: "Sara" } }));
console.log(dispatch({ method: "POST", path: "/hello" }));
console.log(dispatch({ method: "GET", path: "/bye" }));`,
      expected: "hi Sara\nsaved\n404",
      hint: "for (const r of routes) ثم if (r.method === req.method && r.path === req.path) return r.handler(req); وبعد الحلقة return \"404\".",
      solution: `let routes = [
  { method: "GET", path: "/hello", handler: (req) => "hi " + req.query.name },
  { method: "POST", path: "/hello", handler: (req) => "saved" },
];
function dispatch(req) {
  for (const r of routes) {
    if (r.method === req.method && r.path === req.path) {
      return r.handler(req);
    }
  }
  return "404";
}
console.log(dispatch({ method: "GET", path: "/hello", query: { name: "Sara" } }));
console.log(dispatch({ method: "POST", path: "/hello" }));
console.log(dispatch({ method: "GET", path: "/bye" }));`,
    },
  ],
  quiz: [
    {
      question: "وصل الطلب GET /users/sara. ما قيمة req.params.name داخل الدالة؟",
      code: `app.get("/users/:name", (req, res) => {
  res.json({ hello: req.params.name });
});`,
      options: ["\"sara\"", "\":name\"", "undefined"],
      answer: 0,
      why: "الخانة ‎:name‎ في المسار المسجّل تلتقط الجزء المقابل من عنوان الطلب. الراوتر وضع \"sara\" في req.params.name قبل أن يستدعي الدالة.",
    },
    {
      question: "وصل الطلب GET /products?sort=price. أين تجد الكلمة price؟",
      code: `app.get("/products", (req, res) => {
  // ...
});`,
      options: ["req.query.sort", "req.params.sort", "req.body.sort"],
      answer: 0,
      why: "ما بعد ? هو الاستعلام (query) ويصل في req.query. params للخانات داخل المسار مثل ‎:id‎، و body لجسم طلبات POST و PATCH.",
    },
    {
      question: "نسي المبرمج أن يرسل ردّاً في هذه الدالة. ماذا يرى المستخدم الذي طلب /ping؟",
      code: `app.get("/ping", (req, res) => {
  console.log("got ping");
});`,
      options: ["المتصفح ينتظر حتى تنتهي المهلة", "ردّ 200 فارغ تلقائياً", "404 Not Found"],
      answer: 0,
      why: "الخادم يطبع في طرفيته got ping، لكن الرد لا يُرسل إلا حين تستدعي res.json أو res.send. لكل طلب ردّ واحد، ومن غيره يبقى العميل معلّقاً.",
    },
    {
      question: "سارة طلبت /report، ودالته تدور في حلقة حسابية خمس ثوانٍ. في الثانية الأولى طلب عمر /products/1. متى يصله الرد؟",
      code: `app.get("/report", (req, res) => {
  let x = 0;
  for (let i = 0; i < 5e9; i++) x += i;
  res.json({ x });
});`,
      options: ["بعد أن تنتهي حلقة سارة", "فوراً، لأن لكل مستخدم عملية خاصة", "لا يصله أبداً"],
      answer: 0,
      why: "عملية Node واحدة تنفّذ دالة واحدة في كل لحظة. حلقة الأحداث لا تأخذ الطلب التالي حتى تنتهي الدالة الحالية. لذلك تبقى الدوال قصيرة، والانتظار الطويل (قاعدة بيانات، ملف) يكون بـ await لا بحلقة.",
    },
    {
      question: "في الخادم مسار واحد فقط: app.get(\"/products/:id\", ...). وصل DELETE /products/2. ماذا يحدث؟",
      options: ["لا تُستدعى أي دالة، و Express يرد 404", "تُستدعى دالة GET لأن المسار يطابق", "يتوقف الخادم بخطأ"],
      answer: 0,
      why: "السطر في الجدول يطابق بالطريقة والمسار معاً. المسار يطابق لكن الطريقة لا، فلا سطر يطابق، ويرد Express من عنده: Cannot DELETE /products/2.",
    },
  ],
  next: "go-server",
};
