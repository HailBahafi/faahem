import type { Cell, Lesson } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const nil = (name: string): Cell => ({ name, value: "(nil)", type: "none" });

const lamp = s("product:7", "Lamp 120");

export const redis: Lesson = {
  slug: "redis",
  stage: 8,
  number: "8.5",
  title: "Redis",
  subtitle: "جدول تجزئة عملاق في الذاكرة RAM، تتشاركه كل خوادمك: سريع جداً، ومحدود، ومؤقت",
  minutes: 15,
  singleLanguage: true,
  problem: {
    title: "قاعدة البيانات بطيئة، والزوار كثيرون",
    body: "اطلب صفحة منتج عدة مرات بلا Redis وراقب طول الأشرطة، ثم شغّل Redis واطلبها مجدداً. بعدها غيّر السعر في Postgres واطلب الصفحة: أي سعر يراه الزائر؟",
    demo: "redis",
  },
  scene: {
    code: {
      shell: `$ redis-cli
> SET product:7 "Lamp 120"
OK
> GET product:7
"Lamp 120"
> EXPIRE product:7 60
(integer) 1
> TTL product:7
(integer) 58
> INCR visits
(integer) 1
> GET product:9
(nil)
> SET product:9 "Desk 450" EX 60
OK`,
    },
    notes: {
      shell: "السطر الذي يبدأ بـ > أمر تكتبه لخادم Redis، والسطر بعده ردّه. في تطبيقك لا تكتبها يدوياً: مكتبة مثل redis في Node أو redis-py في Python ترسل الأوامر نفسها تماماً.",
    },
    steps: [
      {
        line: null,
        say: "Redis خادم مستقل وظيفته واحدة: جدول تجزئة ضخم، مفتاح ← قيمة، يعيش كله في الذاكرة RAM لا على القرص. كل خوادم تطبيقك تتصل به وتقرأ الجدول نفسه.",
        memory: [],
      },
      {
        line: 1,
        say: "redis-cli يفتح اتصالاً بخادم Redis (المنفذ 6379 عادة). الجدول الآن فارغ.",
        memory: [],
      },
      {
        line: 2,
        say: "SET يضع قيمة تحت مفتاح، تماماً كـ cache[key] = value في درس جدول التجزئة. اسم المفتاح نص حر، والعادة أن يُكتب نوع:رقم مثل product:7.",
        memory: [lamp],
        changed: ["product:7"],
        output: ["OK"],
      },
      {
        line: 4,
        say: "GET يحسب hash للمفتاح ويقفز إلى درجه مباشرة، والدرج في RAM لا على القرص. الجواب يصل في أقل من جزء من الألف من الثانية، بينما استعلام Postgres يأخذ عشرات الأجزاء.",
        memory: [lamp],
        read: ["product:7"],
        output: ["OK", '"Lamp 120"'],
      },
      {
        line: 6,
        say: "EXPIRE يعطي المفتاح عمراً: 60 ثانية. الـ RAM محدودة، فلا نريد أن تبقى النسخ القديمة للأبد. الرد 1 يعني: وُجد المفتاح وضُبط عمره.",
        memory: [lamp, n("TTL product:7", 60)],
        changed: ["TTL product:7"],
        output: ["OK", '"Lamp 120"', "(integer) 1"],
      },
      {
        line: 8,
        say: "بعد ثانيتين نسأل: كم بقي؟ 58. العداد ينقص وحده، وعند الصفر يحذف Redis المفتاح بنفسه، كأنه لم يكن.",
        memory: [lamp, n("TTL product:7", 58)],
        changed: ["TTL product:7"],
        read: ["TTL product:7"],
        output: ["OK", '"Lamp 120"', "(integer) 1", "(integer) 58"],
      },
      {
        line: 10,
        say: "INCR يزيد عدداً بواحد. المفتاح visits غير موجود، فيعامله Redis كأنه 0 ويجعله 1. Redis ينفّذ الأوامر واحداً تلو الآخر، فلو أرسل عشرة خوادم INCR في اللحظة نفسها لن تضيع زيادة واحدة.",
        memory: [lamp, n("TTL product:7", 58), n("visits", 1)],
        changed: ["visits"],
        output: ["OK", '"Lamp 120"', "(integer) 1", "(integer) 58", "(integer) 1"],
      },
      {
        line: 12,
        say: "GET لمفتاح غير موجود يرد (nil): هذا miss. Redis لا يعرف شيئاً عن Postgres؛ تطبيقك هو من يقرر: اذهب إلى قاعدة البيانات واقرأ المنتج 9.",
        memory: [lamp, n("TTL product:7", 58), n("visits", 1), nil("product:9")],
        read: ["product:9"],
        output: ["OK", '"Lamp 120"', "(integer) 1", "(integer) 58", "(integer) 1", "(nil)"],
      },
      {
        line: 14,
        say: "جاء الجواب من Postgres، فيحفظه التطبيق في Redis مع عمره في أمر واحد: EX 60. الزائر التالي يجده هنا. هذا هو نمط cache-aside: اسأل Redis، وعند miss اقرأ القاعدة واحفظ النسخة.",
        memory: [lamp, n("TTL product:7", 58), n("visits", 1), s("product:9", "Desk 450"), n("TTL product:9", 60)],
        changed: ["product:9", "TTL product:9"],
        output: ["OK", '"Lamp 120"', "(integer) 1", "(integer) 58", "(integer) 1", "(nil)", "OK"],
      },
      {
        line: 14,
        say: "تذكّر: Postgres يبقى صاحب الحقيقة على القرص، و Redis نسخة سريعة مؤقتة منها. إن تغيّر السعر في Postgres تبقى النسخة القديمة هنا حتى يُحذف المفتاح (DEL) أو ينتهي عمره.",
        memory: [lamp, n("TTL product:7", 58), n("visits", 1), s("product:9", "Desk 450"), n("TTL product:9", 60)],
        read: ["product:9"],
        output: ["OK", '"Lamp 120"', "(integer) 1", "(integer) 58", "(integer) 1", "(nil)", "OK"],
      },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هنا Redis كائن JavaScript، و Postgres كائن آخر. getPrice تتبع cache-aside: تسأل redis أولاً، وعند miss تقرأ db وتحفظ النسخة مع وقت انتهاء. now هو الوقت بالثواني.",
    starter: `let db = { "7": 120 };
let redis = {};
let dbReads = 0;
function getPrice(id, now) {
  let key = "product:" + id;
  let hit = redis[key];
  if (hit && now < hit.expires) {
    return hit.value;
  }
  dbReads = dbReads + 1;
  let price = db[id];
  redis[key] = { value: price, expires: now + 60 };
  return price;
}
console.log(getPrice(7, 0), dbReads);
console.log(getPrice(7, 10), dbReads);
db["7"] = 99;
console.log(getPrice(7, 20), dbReads);
console.log(getPrice(7, 70), dbReads);`,
    challenges: [
      "قبل أن تشغّل: أي سعر يُطبع عند الوقت 20، بعد أن صار السعر في db يساوي 99؟",
      "بعد السطر db[\"7\"] = 99 أضف redis[\"product:7\"] = null (هذا هو DEL). كيف تتغير النتيجة عند الوقت 20؟",
      "غيّر 60 إلى 5. كم مرة تُقرأ db الآن؟ ما ثمن العمر القصير وما فائدته؟",
      "أضف طلباً للمنتج 8 (أضفه إلى db أولاً). هل يستفيد من وجود product:7 في redis؟",
    ],
  },
  predict: [
    {
      question: "خُزّن السعر في Redis، ثم تغيّر في قاعدة البيانات. ماذا يُطبع؟",
      code: `let db = { "7": 120 };
let redis = {};
function getPrice(id) {
  let key = "product:" + id;
  if (redis[key]) return redis[key];
  redis[key] = db[id];
  return db[id];
}
getPrice(7);
db["7"] = 99;
console.log(getPrice(7));`,
      options: ["120", "99", "undefined"],
      answer: 0,
      why: "Redis لا يراقب Postgres. فيه نسخة قديمة قيمتها 120، و getPrice تجدها فلا تسأل القاعدة أصلاً. ما لم يُحذف المفتاح عند التحديث، يرى الزوار السعر القديم حتى ينتهي عمره. هذه أصعب نقطة في الكاش: الإبطال.",
    },
    {
      question: "طلبان لصفحة المنتج نفسه، الأول وصل إلى الخادم A والثاني إلى الخادم B. ماذا يُطبع؟",
      code: `let redis = {};
let dbReads = 0;
function handle(server, key) {
  if (redis[key]) return server + " hit";
  dbReads = dbReads + 1;
  redis[key] = "Lamp 120";
  return server + " miss";
}
console.log(handle("A", "product:7"));
console.log(handle("B", "product:7"));
console.log(dbReads);`,
      options: ["A miss ثم B hit ثم 1", "A miss ثم B miss ثم 2", "A hit ثم B hit ثم 0"],
      answer: 0,
      why: "redis كائن واحد خارج الخادمين، يتشاركانه. ما حفظه A يجده B فوراً. لو احتفظ كل خادم بكاش داخل ذاكرته الخاصة لقرأ كل واحد القاعدة بنفسه، ولما رأى أحدهما حذف الآخر.",
    },
    {
      question: "INCR يزيد عدّاداً، وإن لم يوجد المفتاح يبدأ من 0. ماذا يُطبع؟",
      code: `let redis = {};
function incr(key) {
  let n = redis[key] || 0;
  redis[key] = n + 1;
  return redis[key];
}
incr("ip:5");
incr("ip:5");
console.log(incr("ip:5"), incr("ip:9"));`,
      options: ["3 1", "3 4", "خطأ: المفتاح غير موجود"],
      answer: 0,
      why: "كل مفتاح درج مستقل في الجدول. ip:5 زاد ثلاث مرات فصار 3، و ip:9 درج جديد بدأ من 0 فصار 1. لا خطأ عند المفتاح المفقود: INCR يعامله كصفر.",
    },
  ],
  code: {
    intro: "محاكاة لخادم أمامه Redis: كاش للمنتجات بعمر 60 ثانية، وحذف المفتاح عند تحديث السعر، وحدّ لمحاولات الدخول (INCR + EXPIRE لكل IP) مثل حدّ تسجيل الدخول في هذا التطبيق. الأزمنة بالمللي ثانية تقريبية: RAM مقابل قرص وشبكة.",
    runnerStarter: `const db = new Map([[7, { name: "Lamp", price: 120 }]]);
const redis = new Map(); // key -> { value, expires }
let now = 0;

function GET(key) {
  const e = redis.get(key);
  if (!e || now >= e.expires) { redis.delete(key); return null; }
  return e.value;
}
function SET(key, value, ex) { redis.set(key, { value, expires: now + ex }); }
function INCR(key) { const v = (GET(key) ?? 0) + 1; const e = redis.get(key); redis.set(key, { value: v, expires: e ? e.expires : Infinity }); return v; }
function EXPIRE(key, sec) { redis.get(key).expires = now + sec; }

function productPage(id) {
  const cached = GET("product:" + id);
  if (cached) return { ms: 0.5, product: cached, from: "redis" };
  const product = { ...db.get(id) };              // slow: disk + query, ~120 ms
  SET("product:" + id, product, 60);
  return { ms: 120, product, from: "postgres" };
}
function updatePrice(id, price) {
  db.get(id).price = price;
  redis.delete("product:" + id);                  // DEL: invalidate the copy
}
function login(ip) {
  const tries = INCR("login:" + ip);
  if (tries === 1) EXPIRE("login:" + ip, 60);
  return tries <= 5 ? "try password" : "blocked for a minute";
}

console.log(productPage(7));
now = 5;  console.log(productPage(7));
updatePrice(7, 99);
now = 6;  console.log(productPage(7));
for (let i = 0; i < 6; i++) console.log("login", i + 1, login("1.2.3.4"));
now = 70; console.log("after 60 s:", login("1.2.3.4"));
// جرّب: احذف سطر redis.delete في updatePrice. أي سعر يظهر عند now = 6؟
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "cache-aside خطوة خطوة",
      prompt: "زائر يطلب صفحة المنتج 5 ولا نسخة منه في Redis. رتّب ما يفعله الخادم.",
      lines: [
        "GET product:5",
        "(nil)  -> cache miss",
        "SELECT name, price FROM products WHERE id = 5",
        'SET product:5 "Mug 35" EX 60',
        "send the page to the visitor",
        "next visitor: GET product:5 -> \"Mug 35\" (hit)",
      ],
      expected: "",
    },
    {
      kind: "fill",
      lang: "text",
      title: "عدّاد يختفي وحده",
      prompt: "نعدّ محاولات الدخول من هذا الـ IP. أي أمر يجعل العدّاد يُحذف بعد 60 ثانية لتبدأ نافذة جديدة؟",
      template: "INCR login:5.6.7.8   then   ___ login:5.6.7.8 60",
      options: ["EXPIRE", "GET", "INCR"],
      answer: "EXPIRE",
      expected: "EXPIRE",
    },
    {
      kind: "fix",
      title: "حذفٌ لا يصيب",
      prompt: "updatePrice يغيّر السعر ويحاول حذف النسخة من الكاش، لكن الزائر ما زال يرى 120. أصلحه حتى يطبع 120 ثم 99.",
      code: `let db = { "7": 120 };
let redis = {};
function getPrice(id) {
  let key = "product:" + id;
  if (redis[key]) return redis[key];
  redis[key] = db[id];
  return db[id];
}
function updatePrice(id, price) {
  db[id] = price;
  redis["product" + id] = null; // DEL the cached copy
}
console.log(getPrice(7));
updatePrice(7, 99);
console.log(getPrice(7));`,
      expected: "120\n99",
      hint: "قارن المفتاح الذي يُكتب في getPrice بالمفتاح الذي يُحذف في updatePrice، حرفاً حرفاً. Redis لا يعرف أن product7 و product:7 الشيء نفسه.",
      solution: `let db = { "7": 120 };
let redis = {};
function getPrice(id) {
  let key = "product:" + id;
  if (redis[key]) return redis[key];
  redis[key] = db[id];
  return db[id];
}
function updatePrice(id, price) {
  db[id] = price;
  redis["product:" + id] = null; // DEL the cached copy
}
console.log(getPrice(7));
updatePrice(7, 99);
console.log(getPrice(7));`,
    },
    {
      kind: "write",
      title: "حدّ المحاولات",
      prompt: "اكتب allow(ip, now) مثل INCR + EXPIRE: المفتاح \"rate:\" + ip يحمل { count, expires }. إن لم يوجد أو انتهى عمره يبدأ من جديد بعمر 60 ثانية. أعد \"ok\" ما دام العدد 3 أو أقل، وإلا \"blocked\".",
      starter: `let redis = {};
let LIMIT = 3;
function allow(ip, now) {
  // read redis["rate:" + ip]; start a new { count: 0, expires: now + 60 } if missing or expired
  // add 1 to count, then return "ok" or "blocked"
}
let times = [0, 5, 10, 15, 70];
for (const t of times) console.log(allow("1.2.3.4", t));
`,
      expected: "ok\nok\nok\nblocked\nok",
      hint: "let e = redis[key]; if (!e || now >= e.expires) { e = { count: 0, expires: now + 60 }; redis[key] = e; } ثم e.count = e.count + 1 وقارن بـ LIMIT.",
      solution: `let redis = {};
let LIMIT = 3;
function allow(ip, now) {
  let key = "rate:" + ip;
  let e = redis[key];
  if (!e || now >= e.expires) {
    e = { count: 0, expires: now + 60 };
    redis[key] = e;
  }
  e.count = e.count + 1;
  if (e.count <= LIMIT) return "ok";
  return "blocked";
}
let times = [0, 5, 10, 15, 70];
for (const t of times) console.log(allow("1.2.3.4", t));
`,
    },
  ],
  quiz: [
    {
      question: "عمر النسخة 60 ثانية. وصلت طلبات المنتج نفسه عند الثواني 0 ثم 30 ثم 90. كم مرة قُرئت قاعدة البيانات؟",
      code: `let redis = {};
let dbReads = 0;
function get(key, now) {
  let e = redis[key];
  if (e && now < e.expires) return e.value;
  dbReads = dbReads + 1;
  redis[key] = { value: "Lamp", expires: now + 60 };
  return "Lamp";
}
get("product:7", 0);
get("product:7", 30);
get("product:7", 90);
console.log(dbReads);`,
      options: ["2", "1", "3"],
      answer: 0,
      why: "عند 0 لا نسخة: قراءة. عند 30 النسخة حية (30 < 60): hit. عند 90 انتهى عمرها وحذفها Redis: قراءة ثانية، ونسخة جديدة تعيش حتى 150.",
    },
    {
      question: "خادمان يزيدان عدّاد الزيارات بـ GET ثم SET بدل INCR، في اللحظة نفسها. ماذا يُطبع؟",
      code: `let redis = { visits: 10 };
let a = redis.visits; // server A reads
let b = redis.visits; // server B reads at the same moment
redis.visits = a + 1;
redis.visits = b + 1;
console.log(redis.visits);`,
      options: ["11", "12", "10"],
      answer: 0,
      why: "كلاهما قرأ 10 قبل أن يكتب أحدهما، فكتب كل منهما 11، وضاعت زيارة. INCR يجعل القراءة والزيادة والكتابة أمراً واحداً ينفّذه Redis كاملاً قبل غيره، فالنتيجة 12 دائماً.",
    },
    {
      question: "حدّ الدخول 5 محاولات في الدقيقة. ماذا تطبع آخر محاولة (عند الثانية 61)؟",
      code: `let redis = {};
function attempt(ip, now) {
  let e = redis[ip];
  if (!e || now >= e.expires) {
    e = { count: 0, expires: now + 60 };
    redis[ip] = e;
  }
  e.count = e.count + 1;
  return e.count <= 5 ? "ok" : "blocked";
}
for (const t of [0, 1, 2, 3, 4, 5]) attempt("9.9.9.9", t);
console.log(attempt("9.9.9.9", 61));`,
      options: ["ok", "blocked", "undefined"],
      answer: 0,
      why: "المحاولة السادسة عند الثانية 5 حُجبت. لكن المفتاح عاش حتى الثانية 60 فقط، ثم اختفى، فعند 61 تبدأ نافذة جديدة والعدّاد 1. EXPIRE هو ما يفكّ الحجب وحده دون أي كود تنظيف.",
    },
    {
      question: "أُعيد تشغيل خادم Redis ففقد كل مفاتيحه (كانت في RAM). ماذا يحدث لصفحات المنتجات؟",
      options: ["تعمل، لكن أول الطلبات بطيئة حتى يمتلئ الكاش من Postgres من جديد", "تختفي المنتجات من الموقع", "لا يتغير شيء أبداً، ولا حتى السرعة"],
      answer: 0,
      why: "Redis كان يحمل نسخاً فقط، والحقيقة على قرص Postgres. كل طلب يجد (nil) فيقرأ القاعدة ويعيد الحفظ، فيعود الكاش تدريجياً. لهذا Redis يكمل قاعدة البيانات ولا يحل محلها.",
    },
    {
      question: "جلسات الدخول محفوظة في Redis بعمر ساعة. ماذا يُطبع؟",
      code: `let sessions = {};
function login(user, now) {
  let token = "t-" + user;
  sessions[token] = { user: user, expires: now + 3600 };
  return token;
}
function whoIs(token, now) {
  let s = sessions[token];
  if (s && now < s.expires) return s.user;
  return "guest";
}
let t = login("sara", 0);
console.log(whoIs(t, 100), whoIs(t, 4000));`,
      options: ["sara guest", "sara sara", "guest guest"],
      answer: 0,
      why: "عند الثانية 100 الجلسة حية فيُعرف المستخدم، وأي خادم يسأل Redis يجدها. عند 4000 تجاوز الوقت 3600 فانتهت الجلسة، فيصبح زائراً ويُطلب منه الدخول من جديد.",
    },
  ],
  next: "dart",
};
