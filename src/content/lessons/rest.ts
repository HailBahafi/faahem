import type { Cell, Lesson } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

const pen = s("/products/1", "Pen, 3");
const book = s("/products/2", "Book, 25");
const book20 = s("/products/2", "Book, 20");
const bag = s("/products/3", "Bag, 40");

export const rest: Lesson = {
  slug: "rest",
  stage: 7,
  number: "7.1",
  title: "REST",
  subtitle: "قائمة طعام للبرامج: أسماء أشياء في العنوان، وفعل واحد في الطريقة",
  minutes: 16,
  singleLanguage: true,
  problem: {
    title: "متجر بلا واجهة، لبرامج أخرى",
    body: "تطبيق الجوال وموقع المتجر ولوحة الإدارة كلها تحتاج المنتجات نفسها من خادم واحد. هذا الخادم لا يرسم صفحات، بل يجيب برامج. أرسل له طلبات: اختر طريقة وعنواناً، وراقب المخزن يتغيّر والرد يعود. حاول أن تُنشئ منتجاً ثم تعدّله ثم تحذفه.",
    demo: "rest",
  },
  scene: {
    code: {
      text: `GET    /products
GET    /products/2
POST   /products      {"name":"Bag","price":40}
PATCH  /products/2    {"price":20}
DELETE /products/1
GET    /products/1
POST   /products      {"price":5}
POST   /deleteProduct?id=2`,
    },
    notes: {
      text: "هذه ثمانية طلبات HTTP مختصرة: الطريقة، ثم المسار، ثم الجسم إن وُجد. الأدراج على اليمين هي مخزن الخادم: كل منتج «مورد» له عنوان خاص به.",
    },
    steps: [
      { line: null, say: "API هو قائمة بما يقدّمه الخادم لبرامج أخرى. REST يرتّب هذه القائمة حول «الموارد»: أشياء لها أسماء في العنوان. في المخزن الآن منتجان، ولكل واحد عنوانه.", memory: [pen, book] },
      { line: 1, say: "/products هو المجموعة كلها، و GET يعني «اقرأ ولا تغيّر شيئاً». الرد 200 ومعه مصفوفة JSON فيها المنتجان. المخزن كما هو.", memory: [pen, book, n("status", 200)], changed: ["status"], read: ["/products/1", "/products/2"] },
      { line: 2, say: "أضفنا رقماً إلى العنوان: /products/2 منتج واحد بعينه. الطريقة نفسها GET، والمورد مختلف. الرد 200 ومعه بطاقة الكتاب وحده.", memory: [pen, book, n("status", 200)], read: ["/products/2"] },
      { line: 3, say: "POST على المجموعة يعني «أنشئ عنصراً جديداً فيها». الخادم يعطيه رقماً جديداً 3، فيصير له عنوان /products/3، ويرد 201 Created.", memory: [pen, book, bag, n("status", 201)], changed: ["/products/3", "status"] },
      { line: 4, say: "PATCH يعدّل جزءاً من مورد موجود: السعر فقط، والاسم يبقى. (PUT يستبدل المنتج كله، فيجب أن ترسل كل حقوله.) الرد 200.", memory: [pen, book20, bag, n("status", 200)], changed: ["/products/2", "status"] },
      { line: 5, say: "DELETE على /products/1 يزيل القلم من المخزن. الرد 204: «تم، وليس عندي ما أرسله». لاحظ: العنوان نفسه، والطريقة هي التي قالت ماذا نفعل.", memory: [book20, bag, n("status", 204)], changed: ["status"] },
      { line: 6, say: "نطلب القلم مرة أخرى. الخادم لا يجد درجاً بهذا العنوان، فيرد 404 Not Found. ليس عطلاً: المورد غير موجود فعلاً.", memory: [book20, bag, n("status", 404)], changed: ["status"], read: ["/products/1"] },
      { line: 7, say: "إنشاء منتج بلا اسم. الخادم يفحص الجسم قبل أن يحفظ، فيرفض بـ 400 Bad Request ومعه سبب الرفض. المخزن لم يتغيّر.", memory: [book20, bag, n("status", 400)], changed: ["status"] },
      { line: 8, say: "هذا تصميم خاطئ: فعل داخل العنوان. لا يوجد مورد اسمه deleteProduct، فالرد 404. في REST العنوان اسم شيء، والفعل هو الطريقة: DELETE /products/2.", memory: [book20, bag, n("status", 404)], changed: ["status"] },
      { line: 2, say: "لو أرسلنا السطر 2 الآن، من أي برنامج وفي أي وقت، لوصله الرد نفسه: الكتاب بسعر 20. الخادم لا يتذكّر الطلبات السابقة (stateless)؛ كل طلب يحمل كل ما يلزم لفهمه.", memory: [book20, bag, n("status", 200)], changed: ["status"], read: ["/products/2"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذا خادم REST صغير مكتوب كدالة handle: يقسم المسار إلى أجزاء، فيعرف المورد (المجموعة أو منتجاً واحداً)، ثم ينظر إلى الطريقة. المخزن مصفوفة products على الكومة. غيّر الطلبات في الأسفل، وتوقّع رقم الحالة قبل أن تشغّل.",
    starter: `let products = [
  { id: 1, name: "Pen", price: 3 },
  { id: 2, name: "Book", price: 25 },
];
let nextId = 3;

function handle(req) {
  let parts = req.path.split("/");
  if (parts[1] !== "products") {
    return { status: 404, body: "no such resource" };
  }
  if (parts.length === 2) {
    if (req.method === "GET") {
      return { status: 200, body: products.length + " products" };
    }
    if (req.method === "POST") {
      if (req.body.name === undefined) {
        return { status: 400, body: "name is required" };
      }
      products.push({ id: nextId, name: req.body.name, price: req.body.price });
      nextId = nextId + 1;
      return { status: 201, body: "created" };
    }
    return { status: 405, body: "not allowed" };
  }
  let item = undefined;
  for (const p of products) {
    if (p.id === Number(parts[2])) {
      item = p;
    }
  }
  if (item === undefined) {
    return { status: 404, body: "not found" };
  }
  if (req.method === "GET") {
    return { status: 200, body: item.name + " " + item.price };
  }
  if (req.method === "PATCH") {
    item.price = req.body.price;
    return { status: 200, body: item.name + " " + item.price };
  }
  return { status: 405, body: "not allowed" };
}

let res = handle({ method: "POST", path: "/products", body: { name: "Bag", price: 40 } });
console.log(res.status, res.body);
res = handle({ method: "GET", path: "/products/3" });
console.log(res.status, res.body);`,
    challenges: [
      "غيّر الطلب الثاني إلى PATCH على /products/2 مع body: { price: 20 }. أي بطاقة على الكومة تتغيّر؟",
      "احذف name من جسم POST. ما رقم الحالة؟ وهل زاد طول المصفوفة products؟",
      "اطلب GET على /products/9. من أي سطر يخرج الرد؟",
      "أضف فرعاً لـ DELETE: ابنِ مصفوفة جديدة فيها كل منتج ليس هو item، ضعها في products، وأرجع 204.",
    ],
  },
  predict: [
    {
      question: "أرسلنا طلب POST نفسه مرتين (المستخدم ضغط «إضافة» مرتين). ماذا يُطبع؟",
      code: `let products = [{ id: 1, name: "Pen" }];
function handle(req) {
  if (req.method === "POST" && req.path === "/products") {
    products.push({ id: products.length + 1, name: req.body.name });
    return { status: 201 };
  }
  return { status: 405 };
}
let req = { method: "POST", path: "/products", body: { name: "Bag" } };
handle(req);
handle(req);
console.log(products.length);`,
      options: ["3", "2", "1"],
      answer: 0,
      why: "POST يعني «أنشئ عنصراً جديداً» في كل مرة يصل، حتى لو كان الطلب مطابقاً حرفاً بحرف. صار في المخزن حقيبتان برقمين مختلفين. أما GET و PUT و DELETE فتكرارها يترك المخزن على الحال نفسه.",
    },
    {
      question: "حذفنا المنتج 1، ثم طلبناه. ماذا يُطبع؟",
      code: `let products = [{ id: 1, name: "Pen" }, { id: 2, name: "Book" }];
function handle(req) {
  let id = Number(req.path.split("/")[2]);
  let kept = [];
  let found = false;
  for (const p of products) {
    if (p.id === id) {
      found = true;
    } else {
      kept.push(p);
    }
  }
  if (!found) {
    return { status: 404 };
  }
  if (req.method === "DELETE") {
    products = kept;
    return { status: 204 };
  }
  return { status: 200 };
}
let a = handle({ method: "DELETE", path: "/products/1" });
let b = handle({ method: "GET", path: "/products/1" });
console.log(a.status, b.status);`,
      options: ["204 404", "204 200", "200 200"],
      answer: 0,
      why: "الحذف غيّر المخزن على الخادم نفسه، لا نسخة عند العميل. الطلب الثاني يبحث في المخزن الجديد فلا يجد المنتج 1: الرد 404.",
    },
    {
      question: "أرسل تطبيق الجوال منتجاً بلا اسم. ماذا يُطبع؟",
      code: `let products = [{ id: 1, name: "Pen" }];
function handle(req) {
  if (req.body.name === undefined) {
    return { status: 400, body: "name is required" };
  }
  products.push({ id: 2, name: req.body.name });
  return { status: 201, body: "created" };
}
let res = handle({ method: "POST", path: "/products", body: { price: 5 } });
console.log(res.status, products.length);`,
      options: ["400 1", "201 2", "500 1"],
      answer: 0,
      why: "الخادم يفحص المدخلات قبل أن يلمس المخزن. 400 تعني «طلبك أنت فيه خطأ»، والمخزن بقي فيه منتج واحد. 500 كانت ستعني أن الخادم نفسه تعثّر.",
    },
  ],
  code: {
    intro: "في المتصفح يكلّم كود الواجهة الـ API بـ fetch، كما في درس async: fetch(\"/products\", { method: \"POST\", body: JSON.stringify(item) }). هنا نحاكي الخادم بدالة، ونرسل له قائمة طلبات. أضف طلباً أو غيّر طريقة، وتوقّع السطر المطبوع قبل أن تشغّل.",
    runnerStarter: `let products = [{ id: 1, name: "Pen", price: 3 }];
let nextId = 2;

function handle(method, path, body) {
  let id = Number(path.split("/")[2]);
  if (path === "/products" && method === "GET") return { status: 200, body: products };
  if (path === "/products" && method === "POST") {
    if (!body || !body.name) return { status: 400, body: { error: "name is required" } };
    let item = { id: nextId, name: body.name, price: body.price };
    nextId++;
    products.push(item);
    return { status: 201, body: item };
  }
  let item = products.find((p) => p.id === id);
  if (!item) return { status: 404, body: { error: "not found" } };
  if (method === "GET") return { status: 200, body: item };
  if (method === "PATCH") { Object.assign(item, body); return { status: 200, body: item }; }
  if (method === "DELETE") { products = products.filter((p) => p !== item); return { status: 204, body: null }; }
  return { status: 405, body: { error: "method not allowed" } };
}

// Try: change PATCH to DELETE, or add a GET /products/2 after the POST
let requests = [
  ["POST", "/products", { name: "Bag", price: 40 }],
  ["PATCH", "/products/1", { price: 5 }],
  ["GET", "/products"],
];
for (const [method, path, body] of requests) {
  let res = handle(method, path, body);
  console.log(method, path, "->", res.status, JSON.stringify(res.body));
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "حياة منتج",
      prompt: "منتج جديد يُنشأ، ثم يُقرأ، ثم يُعدَّل سعره، ثم يُحذف، ثم يُطلب مرة أخرى. رتّب الطلبات وردودها.",
      lines: [
        "POST /products {\"name\":\"Bag\"} → 201 (id 5)",
        "GET /products/5 → 200",
        "PATCH /products/5 {\"price\":30} → 200",
        "DELETE /products/5 → 204",
        "GET /products/5 → 404",
      ],
      expected: "",
    },
    {
      kind: "fill",
      lang: "text",
      title: "عدّل الاسم فقط",
      prompt: "تريد أن تغيّر اسم المنتج 7 إلى Pencil، وتترك سعره كما هو. أي طريقة تضع؟",
      template: "___ /products/7\n{\"name\":\"Pencil\"}",
      options: ["PATCH", "POST", "GET"],
      answer: "PATCH",
      expected: "",
    },
    {
      kind: "fix",
      title: "حذف لا يحذف",
      prompt: "الخادم يرد 204 على الحذف، لكن المنتج ما زال يُقرأ بعده (يُطبع 204 ثم 200). أصلح فرع DELETE حتى يُطبع 204 ثم 404.",
      code: `let products = [{ id: 1, name: "Pen" }, { id: 2, name: "Book" }];
function handle(req) {
  let id = Number(req.path.split("/")[2]);
  let item = products.find((p) => p.id === id);
  if (item === undefined) {
    return { status: 404 };
  }
  if (req.method === "DELETE") {
    let kept = products.filter((p) => p.id !== id);
    return { status: 204 };
  }
  return { status: 200 };
}
console.log(handle({ method: "DELETE", path: "/products/2" }).status);
console.log(handle({ method: "GET", path: "/products/2" }).status);`,
      expected: "204\n404",
      hint: "المصفوفة kept صُنعت ثم رُميت. المخزن الذي يقرأ منه الطلب التالي هو products: ضع kept فيه قبل أن ترد.",
      solution: `let products = [{ id: 1, name: "Pen" }, { id: 2, name: "Book" }];
function handle(req) {
  let id = Number(req.path.split("/")[2]);
  let item = products.find((p) => p.id === id);
  if (item === undefined) {
    return { status: 404 };
  }
  if (req.method === "DELETE") {
    products = products.filter((p) => p.id !== id);
    return { status: 204 };
  }
  return { status: 200 };
}
console.log(handle({ method: "DELETE", path: "/products/2" }).status);
console.log(handle({ method: "GET", path: "/products/2" }).status);`,
    },
    {
      kind: "write",
      title: "مجموعة المنتجات",
      prompt: "اكتب handle للمسار /products: GET يرد 200 وجسمه عدد المنتجات، و POST بلا name يرد 400، و POST فيه name يضيفه ويرد 201.",
      starter: `let products = ["Pen"];
// اكتب الدالة handle هنا

console.log(handle({ method: "POST", path: "/products", body: { price: 5 } }).status);
console.log(handle({ method: "POST", path: "/products", body: { name: "Bag" } }).status);
console.log(handle({ method: "GET", path: "/products" }).body);`,
      expected: "400\n201\n2",
      hint: "ابدأ بـ if (req.method === \"GET\"). في فرع POST افحص req.body.name === undefined أولاً، ثم products.push(req.body.name).",
      solution: `let products = ["Pen"];
function handle(req) {
  if (req.method === "GET") {
    return { status: 200, body: products.length };
  }
  if (req.method === "POST") {
    if (req.body.name === undefined) {
      return { status: 400, body: "name is required" };
    }
    products.push(req.body.name);
    return { status: 201, body: "created" };
  }
  return { status: 405, body: "not allowed" };
}
console.log(handle({ method: "POST", path: "/products", body: { price: 5 } }).status);
console.log(handle({ method: "POST", path: "/products", body: { name: "Bag" } }).status);
console.log(handle({ method: "GET", path: "/products" }).body);`,
    },
  ],
  quiz: [
    {
      question: "أي طلب يحذف المنتج 9 بأسلوب REST؟",
      options: ["DELETE /products/9", "GET /deleteProduct?id=9", "POST /products/9/remove"],
      answer: 0,
      why: "العنوان يسمّي الشيء (المنتج 9)، والطريقة تقول ماذا نفعل به. الفعل داخل العنوان يصنع عنواناً جديداً لكل عملية، و GET الذي يحذف خطير: المتصفحات ومحركات البحث ترسل GET بحرية لأنها تظنه قراءة فقط.",
    },
    {
      question: "مخزن الخادم فيه المنتجات 1 و 2 فقط. ما الرد؟",
      code: "PATCH /products/42\n{\"price\":10}",
      options: ["404 Not Found", "201 Created", "400 Bad Request"],
      answer: 0,
      why: "PATCH يعدّل موارد موجودة، والخادم يبحث أولاً عن /products/42 فلا يجده. الجسم سليم، لكن لا شيء يُعدَّل: 404.",
    },
    {
      question: "مستخدمان على جهازين. سارة ترسل الطلب الأول، ثم يرسل عمر الثاني. ماذا يرى عمر؟",
      code: "سارة: POST /products {\"name\":\"Bag\"} → 201\nعمر:  GET /products",
      options: ["القائمة ومعها Bag", "القائمة بدون Bag، فهي عند سارة فقط", "401 لأن عمر لم يُنشئها"],
      answer: 0,
      why: "المورد يعيش في مخزن الخادم، لا في جهاز سارة. كل من يسأل عن /products بعد ذلك يرى الحالة الجديدة نفسها.",
    },
    {
      question: "تطبيق يعرض المنتجات صفحة صفحة. أي طلب يناسب خادماً لا يتذكّر الطلبات السابقة؟",
      options: ["GET /products?page=2", "GET /products/next", "GET /products ثم يتذكّر الخادم أين توقفنا"],
      answer: 0,
      why: "الخادم stateless: لا يعرف أين توقّف هذا العميل. لذلك يحمل الطلب كل ما يلزم: رقم الصفحة في الاستعلام. «التالية» لا معنى لها بلا ذاكرة.",
    },
    {
      question: "أرسلنا هذا الطلب. ماذا يحدث للمنتج 2 الذي كان { name: \"Book\", price: 25 }؟",
      code: "PUT /products/2\n{\"name\":\"Novel\"}",
      options: ["يُرفض بـ 400 أو يُستبدل كله فيضيع السعر", "يتغيّر الاسم فقط ويبقى السعر 25", "يُنشأ منتج ثالث"],
      answer: 0,
      why: "PUT يعني «ضع هذا المورد كاملاً مكان القديم». الجسم بلا سعر، فإما أن يرفضه الخادم لنقص الحقول أو يحفظ المنتج بلا سعر. لتعديل الاسم وحده نستعمل PATCH.",
    },
  ],
  next: "node-server",
};
