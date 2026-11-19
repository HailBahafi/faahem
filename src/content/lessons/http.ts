import type { Cell, Lesson } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

const req = [s("method", "GET"), s("path", "/orders"), s("host", "shop.com"), s("cookie", "a91f")];

export const http: Lesson = {
  slug: "http",
  stage: 5,
  number: "5.3",
  title: "HTTP",
  subtitle: "محادثة نصية مهذّبة: طلب واحد، ثم ردّ واحد",
  minutes: 14,
  singleLanguage: true,
  problem: {
    title: "ماذا تقول للخادم بالضبط؟",
    body: "عندك الآن اتصال بالخادم. لكن بأي كلمات تطلب منه شيئاً؟ ركّب طلباً: اختر الطريقة والمسار، وأرفق بطاقة الدخول أو لا، ثم أرسله. حاول أن تجمع كل أرقام الحالة.",
    demo: "http",
  },
  scene: {
    code: {
      text: `GET /orders HTTP/1.1
Host: shop.com
Cookie: session=a91f

HTTP/1.1 200 OK
Content-Type: application/json

[{"id":7,"item":"Pen"},{"id":9,"item":"Book"}]`,
    },
    notes: {
      text: "هذا هو النص كما يمرّ فعلاً داخل اتصال TCP. في HTTPS المحادثة نفسها بالحرف، لكنها تُشفَّر قبل أن تخرج من جهازك، فمن يرى الحزم في الطريق لا يقرأ إلا عنوان IP الخادم.",
    },
    steps: [
      { line: null, say: "من الدرسين السابقين: DNS أعطانا عنوان IP، و TCP فتح اتصالاً موثوقاً بالخادم. الآن يتكلم المتصفح والخادم بنص عادي، سطراً سطراً. الأسطر 1 إلى 4 طلب، والباقي ردّ.", memory: [] },
      { line: 1, say: "سطر الطلب: الطريقة GET تعني «أريد أن أقرأ»، ثم المسار /orders أي ماذا أريد، ثم نسخة اللغة.", memory: req.slice(0, 2), changed: ["method", "path"] },
      { line: 2, say: "الترويسات تبدأ هنا: اسم ثم نقطتان ثم قيمة. Host يقول أي موقع نقصد، لأن خادماً واحداً بعنوان IP واحد قد يستضيف مواقع كثيرة.", memory: req.slice(0, 3), changed: ["host"] },
      { line: 3, say: "الخادم ينسى كل شيء بعد كل ردّ. لذلك يرفق المتصفح «بطاقة» أعطاه إياها الخادم عند تسجيل الدخول: الكوكي. بها يعرف الخادم من أنت في كل طلب.", memory: req, changed: ["cookie"] },
      { line: 4, say: "سطر فارغ يعني «انتهت الترويسات». طلب GET لا جسم له، فالطلب انتهى. يُقطَّع إلى حزم ويسافر عبر TCP.", memory: req },
      { line: 5, say: "الخادم قرأ الطلب كله، وجد طلبات صاحب البطاقة a91f، فبدأ ردّه بسطر الحالة: 200 OK أي «تمام، هذا ما طلبت».", memory: [...req, n("status", 200)], changed: ["status"], read: ["method", "path", "cookie"] },
      { line: 6, say: "Content-Type يخبر المتصفح كيف يقرأ الجسم: هنا JSON وليس صفحة HTML. لو كان text/html لرسمه المتصفح صفحةً.", memory: [...req, n("status", 200), s("type", "application/json")], changed: ["type"] },
      { line: 7, say: "سطر فارغ مرة أخرى: بعده يبدأ الجسم.", memory: [...req, n("status", 200), s("type", "application/json")] },
      { line: 8, say: "الجسم بصيغة JSON: مصفوفة فيها بطاقات بأدراج لها أسماء، كما في درس الكائنات، لكنها هنا نص يسافر. الرد انتهى، والمحادثة تمت: طلب واحد، ردّ واحد.", memory: [...req, n("status", 200), s("type", "application/json"), s("body", "[{...},{...}]")], changed: ["body"] },
      { line: 3, say: "لو حذفنا السطر 3 وأرسلنا الطلب نفسه مرة ثانية، لن يتذكّر الخادم أننا سألنا قبل لحظة. سيرد 401: «من أنت؟». كل طلب مستقل، والكوكي هي الذاكرة.", memory: [s("method", "GET"), s("path", "/orders"), s("host", "shop.com"), n("status", 401)], changed: ["status"], read: ["cookie"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذا خادم صغير مكتوب كدالة: يأخذ طلباً (بطاقة فيها method و path و cookie) ويرجع ردّاً (بطاقة فيها status و body). غيّر الطلب في السطر قبل الأخير وتوقّع رقم الحالة قبل أن تشغّل.",
    starter: `let orders = { a91f: ["Pen", "Book"] };

function handle(request) {
  if (request.path !== "/orders") {
    return { status: 404, body: "not found" };
  }
  if (request.method !== "GET") {
    return { status: 405, body: "method not allowed" };
  }
  let list = orders[request.cookie];
  if (list === undefined) {
    return { status: 401, body: "who are you?" };
  }
  return { status: 200, body: list.join(",") };
}

let res = handle({ method: "GET", path: "/orders", cookie: "a91f" });
console.log(res.status, res.body);`,
    challenges: [
      "احذف cookie من الطلب. أي رقم حالة سيعود؟ توقّع ثم شغّل.",
      "غيّر المسار إلى \"/order\" (بلا s). من أي سطر يخرج الرد؟",
      "غيّر الطريقة إلى \"DELETE\". لماذا لم يصل التنفيذ إلى سطر الكوكي أصلاً؟",
      "استدعِ handle مرتين: مرة بالكوكي ومرة بدونها، واطبع الحالتين. هل تذكّر الخادم الطلب الأول؟",
    ],
  },
  predict: [
    {
      question: "أرسلنا طلبين متتاليين. الأول معه الكوكي، والثاني بدونها. ماذا يُطبع؟",
      code: `function handle(request) {
  if (request.cookie === "a91f") {
    return { status: 200, body: "Sara's orders" };
  }
  return { status: 401, body: "who are you?" };
}
let first = handle({ path: "/orders", cookie: "a91f" });
let second = handle({ path: "/orders" });
console.log(first.status, second.status);`,
      options: ["200 401", "200 200", "401 401"],
      answer: 0,
      why: "الخادم لا يتذكّر الطلب الأول. كل استدعاء لـ handle يرى طلبه فقط. الطلب الثاني بلا بطاقة، فهو غريب بالنسبة للخادم: 401.",
    },
    {
      question: "طلبنا صفحة غير موجودة. ماذا يُطبع؟",
      code: `let pages = { "/": "Home", "/about": "About us" };
function handle(request) {
  let page = pages[request.path];
  if (page === undefined) {
    return { status: 404, body: "Not Found" };
  }
  return { status: 200, body: page };
}
let res = handle({ method: "GET", path: "/contact" });
console.log(res.status, res.body);`,
      options: ["404 Not Found", "خطأ يوقف البرنامج", "200 undefined"],
      answer: 0,
      why: "404 ليس عطلاً في الخادم. الخادم يعمل جيداً وردّ بأدب: «لا شيء عندي بهذا المسار». ما زال هناك ردّ كامل بسطر حالة وجسم.",
    },
    {
      question: "جسم الرد وصل وفيه 5. ماذا يُطبع؟",
      code: `let res = { status: 200, body: "5" };
console.log(res.body + 1);`,
      options: ["51", "6", "خطأ"],
      answer: 0,
      why: "كل ما يسافر في HTTP نص، حتى الأرقام. الجسم \"5\" حرف وليس رقماً، فإضافة 1 تلصقه به: \"51\". لذلك يحوّل البرنامج نص JSON إلى قيم حقيقية بعد وصوله.",
    },
  ],
  code: {
    intro: "في المتصفح افتح أدوات المطوّر (F12) ثم تبويب Network وحدّث أي صفحة: سترى كل طلب أرسله المتصفح، وطريقته، ورقم حالته، وترويساته. وهذا طلب POST يرسل بيانات في الجسم، كما يحدث حين تضغط «شراء».",
    runnerStarter: `POST /orders HTTP/1.1
Host: shop.com
Cookie: session=a91f
Content-Type: application/json

{"item":"Bag","qty":1}`,
    runnerLang: "text",
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "من الرابط إلى الصفحة",
      prompt: "كتبت shop.com وضغطت Enter. رتّب ما يحدث من الأول إلى الأخير.",
      lines: [
        "DNS: shop.com يصير 93.184.216.34",
        "TCP: فتح اتصال مع 93.184.216.34",
        "المتصفح يرسل: GET / HTTP/1.1",
        "الخادم يرد: HTTP/1.1 200 OK",
        "المتصفح يقرأ جسم الرد (HTML)",
      ],
      expected: "",
    },
    {
      kind: "fill",
      lang: "text",
      title: "الصفحة غير موجودة",
      prompt: "طلبت /blog والخادم لا يملك صفحة بهذا المسار. أي رقم يضعه في سطر الحالة؟",
      template: "HTTP/1.1 ___ Not Found",
      options: ["200", "404", "500"],
      answer: "404",
      expected: "",
    },
    {
      kind: "fix",
      title: "خادم يقول «تمام» دائماً",
      prompt: "هذا الخادم يرد 200 حتى لصفحة غير موجودة، فيطبع 200 undefined. أصلحه حتى يرد 404 Not Found على المسار المفقود.",
      code: `let pages = { "/": "Home", "/shop": "Shop" };
function handle(request) {
  let page = pages[request.path];
  return { status: 200, body: page };
}
let res = handle({ method: "GET", path: "/blog" });
console.log(res.status, res.body);`,
      expected: "404 Not Found",
      hint: "قبل أن ترد 200، افحص: هل page تساوي undefined؟ إن كانت كذلك أرجع { status: 404, body: \"Not Found\" }.",
      solution: `let pages = { "/": "Home", "/shop": "Shop" };
function handle(request) {
  let page = pages[request.path];
  if (page === undefined) {
    return { status: 404, body: "Not Found" };
  }
  return { status: 200, body: page };
}
let res = handle({ method: "GET", path: "/blog" });
console.log(res.status, res.body);`,
    },
    {
      kind: "write",
      title: "سلة تفهم الطرق",
      prompt: "اكتب الدالة handle: GET يرد 200 وجسمه أسماء السلة مفصولة بفاصلة، و POST يضيف request.body إلى السلة ويرد 201، وأي طريقة أخرى ترد 405.",
      starter: `let cart = ["Pen"];
// اكتب الدالة handle هنا

console.log(handle({ method: "POST", path: "/cart", body: "Book" }).status);
console.log(handle({ method: "GET", path: "/cart" }).body);
console.log(handle({ method: "DELETE", path: "/cart" }).status);`,
      expected: "201\nPen,Book\n405",
      hint: "ثلاثة فروع على request.method. في فرع POST استعمل cart.push(request.body) ثم أرجع { status: 201, body: \"added\" }.",
      solution: `let cart = ["Pen"];
function handle(request) {
  if (request.method === "GET") {
    return { status: 200, body: cart.join(",") };
  }
  if (request.method === "POST") {
    cart.push(request.body);
    return { status: 201, body: "added" };
  }
  return { status: 405, body: "not allowed" };
}
console.log(handle({ method: "POST", path: "/cart", body: "Book" }).status);
console.log(handle({ method: "GET", path: "/cart" }).body);
console.log(handle({ method: "DELETE", path: "/cart" }).status);`,
    },
  ],
  quiz: [
    {
      question: "وصل هذا الرد إلى المتصفح. ماذا يفعل المتصفح بعده؟",
      code: "HTTP/1.1 301 Moved Permanently\nLocation: https://shop.com/new",
      options: ["يرسل طلب GET جديداً إلى /new", "يعرض صفحة خطأ", "ينتظر حتى يرسل الخادم الصفحة"],
      answer: 0,
      why: "301 تعني «انتقلت». الرد يحمل العنوان الجديد في ترويسة Location، فيبدأ المتصفح محادثة جديدة: طلب جديد وردّ جديد.",
    },
    {
      question: "في كود الخادم خطأ يجعله يتوقف كلما طُلب /checkout. أي ردّ يصل غالباً؟",
      code: "GET /checkout HTTP/1.1\nHost: shop.com",
      options: ["500 Internal Server Error", "404 Not Found", "200 OK"],
      answer: 0,
      why: "الأرقام التي تبدأ بـ 4 تعني «المشكلة في طلبك»، والتي تبدأ بـ 5 تعني «المشكلة عندي». المسار موجود، لكن الخادم تعثّر وهو يجهّز الرد.",
    },
    {
      question: "سجّلت الدخول ثم فتحت صفحة طلباتك. كيف عرف الخادم أنه أنت في الطلب الثاني؟",
      options: ["أرفق المتصفح الكوكي في ترويسات الطلب الثاني", "الخادم تذكّر اتصالك من الطلب الأول", "من عنوان IP جهازك"],
      answer: 0,
      why: "HTTP بلا ذاكرة: كل طلب يقف وحده. عند الدخول أعطاك الخادم بطاقة (Set-Cookie)، والمتصفح يرفقها في كل طلب بعدها.",
    },
    {
      question: "أنت في مقهى على شبكة مفتوحة وتفتح https://bank.com/balance. ماذا يرى من يلتقط حزمك؟",
      options: ["عنوان IP الخادم فقط، والباقي نص مشفّر", "المسار /balance والكوكي", "كل شيء، فالمحادثة نص عادي"],
      answer: 0,
      why: "HTTPS هي المحادثة نفسها داخل نفق مشفّر. الحزم يجب أن تحمل عنوان IP لتصل، أما سطر الطلب والترويسات والجسم فتسافر مشفّرة.",
    },
    {
      question: "أي طريقة تناسب هذا الطلب الذي يرسل طلب شراء جديداً؟",
      code: "___ /orders HTTP/1.1\nContent-Type: application/json\n\n{\"item\":\"Bag\"}",
      options: ["POST", "GET", "DELETE"],
      answer: 0,
      why: "GET تقرأ فقط ولا جسم لها، و DELETE تحذف. POST ترسل بيانات جديدة في الجسم ليُنشئ الخادم شيئاً بها.",
    },
  ],
  next: "browser",
};
