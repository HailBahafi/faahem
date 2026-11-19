import type { Cell, Lesson } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

/** A toy hash the tracer can run. It only shows the idea; it is not secure. */
const TOY = `// toyHash is a TOY to show the idea. NOT secure: real servers use scrypt, bcrypt or argon2
function toyHash(text) {
  let ABC = "abcdefghijklmnopqrstuvwxyz0123456789";
  let h = 7;
  for (const ch of text) {
    h = (h * 31 + ABC.indexOf(ch) + 1) % 9973;
  }
  return h;
}`;

const row = [s("user.salt", "q4"), s("user.hash", "8f3a")];
const req = [s("name", "sara"), s("password", "pass1")];

export const auth: Lesson = {
  slug: "auth",
  stage: 7,
  number: "7.5",
  title: "المصادقة",
  subtitle: "الخادم ينسى بعد كل طلب، فيعطيك تذكرة تحملها في كل طلب بعده",
  minutes: 18,
  problem: {
    title: "كيف يعرفك خادم بلا ذاكرة؟",
    body: "سجّل الدخول وراقب كلمة المرور: يُضاف إليها ملح، ثم تُفرم، ثم تُقارَن. خذ التذكرة واطلب صفحاتك. ثم افتح «قاعدة بيانات مسرّبة» وانظر ماذا يجد السارق.",
    demo: "auth",
  },
  scene: {
    code: {
      js: `function login(request) {
  let user = users[request.name];
  if (!user || hash(user.salt + request.password) !== user.hash) {
    return { status: 401, body: "wrong name or password" };
  }
  let token = randomToken();
  sessions[token] = user.name;
  return { status: 200, cookie: token };
}`,
      py: `def login(request):
    user = users.get(request["name"])
    if user is None or hash(user["salt"] + request["password"]) != user["hash"]:
        return {"status": 401, "body": "wrong name or password"}

    token = random_token()
    sessions[token] = user["name"]
    return {"status": 200, "cookie": token}
`,
      go: `func login(r Request) Response {
	user, ok := users[r.Name]
	if !ok || hash(user.Salt+r.Password) != user.Hash {
		return Response{Status: 401, Body: "wrong name or password"}
	}
	token := randomToken()
	sessions[token] = user.Name
	return Response{Status: 200, Cookie: token}
}`,
    },
    notes: {
      js: "في Node تأتي hash من مكتبة مثل node:crypto (scrypt) أو bcrypt، و randomToken من crypto.randomBytes. والكوكي تُرسل بترويسة Set-Cookie مع HttpOnly.",
      py: "في Python تجد hashlib.scrypt و secrets.token_urlsafe جاهزتين. وأطر مثل Flask و Django تدير جدول الجلسات والكوكي عنك، لكن الفكرة نفسها تحت الغطاء.",
      go: "في Go تأتي الأدوات من golang.org/x/crypto (bcrypt أو scrypt) و crypto/rand، والكوكي تُكتب بـ http.SetCookie مع HttpOnly: true.",
    },
    steps: [
      { line: null, say: "قاعدة البيانات لا تحفظ كلمة مرور سارة. تحفظ ملحاً عشوائياً q4، ونتيجة فرم (ملح + كلمة المرور): 8f3a. الفرم باتجاه واحد: من 8f3a لا طريق رجوع إلى pass1.", memory: row },
      { line: 1, say: "وصل طلب دخول: اسم وكلمة مرور، مكتوبتان كما هما. الخادم لا يعرف من المرسل، هذا ما سيتحقق منه الآن.", memory: [...req, ...row], changed: ["name", "password"] },
      { line: 2, say: "يبحث عن صف sara في جدول المستخدمين. وجده، ومعه الملح والفرم المخزّنان.", memory: [...req, ...row], read: ["name", "user.salt", "user.hash"] },
      { line: 3, say: "لا يفكّ شيئاً، فالفرم لا يُفكّ. يكرر الوصفة نفسها: q4 + pass1 ثم يفرمها فتخرج 8f3a. المدخل نفسه يعطي الفرم نفسه دائماً. 8f3a تساوي 8f3a، فالشرط خاطئ ونتجاوز إلى السطر 6.", memory: [...req, ...row, s("computed", "8f3a")], changed: ["computed"], read: ["password", "user.salt", "user.hash"] },
      { line: 6, say: "صحّت كلمة المرور، فيصنع الخادم تذكرة: نص عشوائي طويل لا يُخمَّن. كلمة المرور لم تعد تلزم، ولن تُرسل مرة أخرى.", memory: [s("name", "sara"), s("token", "k29qX7")], changed: ["token"] },
      { line: 7, say: "يكتب في ذاكرته: «صاحب التذكرة k29qX7 هو sara». هذا جدول الجلسات، وهو عند الخادم لا عند المستخدم.", memory: [s("name", "sara"), s("token", "k29qX7"), s("sessions[k29qX7]", "sara")], changed: ["sessions[k29qX7]"] },
      { line: 8, say: "يرد 200 ومعه Set-Cookie: session=k29qX7; HttpOnly. المتصفح يحفظها ويرفقها بكل طلب بعدها، و HttpOnly تمنع أي سكربت في الصفحة من قراءتها.", memory: [s("sessions[k29qX7]", "sara"), n("status", 200), s("cookie", "k29qX7")], changed: ["status", "cookie"] },
      { line: 3, say: "لو كتبت pass2 بدلها: q4 + pass2 تُفرم إلى رقم مختلف تماماً، c41e. لا تساوي 8f3a، فالشرط صحيح وندخل إلى السطر 4.", memory: [s("name", "sara"), s("password", "pass2"), ...row, s("computed", "c41e")], changed: ["computed"], read: ["user.hash"] },
      { line: 4, say: "401 برسالة واحدة لا تقول أيهما الخطأ، الاسم أم كلمة المرور، حتى لا يعرف المخمّن أن sara موجودة. وخادم حقيقي يعدّ المحاولات الفاشلة ويرد 429 بعد عدد منها.", memory: [s("name", "sara"), s("password", "pass2"), n("status", 401)], changed: ["status"] },
      { line: 7, say: "بعد دقيقة: طلب GET /orders ومعه Cookie: session=k29qX7. الخادم نسي الدخول، لكنه يقرأ sessions[k29qX7] فيجد sara. هذه المصادقة: من أنت. ثم يسأل سؤالاً ثانياً: هل يحق لـ sara هذا المسار؟ هذا التفويض.", memory: [s("cookie", "k29qX7"), s("sessions[k29qX7]", "sara"), s("who", "sara")], changed: ["who"], read: ["cookie", "sessions[k29qX7]"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "خادم صغير بثلاثة أجزاء: toyHash (فرم لعبة، ليس آمناً)، و login يتحقق ويعطي تذكرة، و me يقرأ التذكرة ويعرف من أنت. شغّل وراقب users و sessions في الكومة.",
    starter: `${TOY}

let users = { sara: { salt: "q4", hash: toyHash("q4" + "pass1") } };
let sessions = {};

function login(request) {
  let user = users[request.name];
  if (user === undefined || toyHash(user.salt + request.password) !== user.hash) {
    return { status: 401, body: "wrong name or password" };
  }
  let token = "t" + Math.floor(Math.random() * 100000);
  sessions[token] = request.name;
  return { status: 200, cookie: token };
}

function me(request) {
  let name = sessions[request.cookie];
  if (name === undefined) {
    return { status: 401, body: "who are you?" };
  }
  return { status: 200, body: "hello " + name };
}

let res = login({ name: "sara", password: "pass1" });
console.log(res.status);
console.log(me({ cookie: res.cookie }).body);`,
    challenges: [
      "غيّر كلمة المرور في طلب الدخول إلى \"pass2\". أي رقم حالة يعود؟ وماذا يرد me بلا تذكرة صالحة؟",
      "اطبع users.sara.hash. هل ترى pass1 في أي مكان من قاعدة البيانات؟",
      "أضف omar بملح \"z9\" وكلمة المرور \"pass1\" نفسها، واطبع فرم الاثنين. لماذا اختلفا رغم أن كلمة المرور واحدة؟",
      "استدعِ me({ cookie: \"t123\" }) بتذكرة مخترعة. ماذا يحدث، ولماذا لا تكفي أي تذكرة؟",
    ],
  },
  predict: [
    {
      question: "نفرم نصين متطابقين ونصاً يختلف بحرف واحد. ماذا يُطبع؟",
      code: `${TOY}
console.log(toyHash("abc") === toyHash("abc"), toyHash("abc") === toyHash("abd"));`,
      options: ["true false", "false false", "true true"],
      answer: 0,
      why: "الفرم وصفة ثابتة بلا عشوائية: المدخل نفسه يعطي الناتج نفسه دائماً، ولهذا يستطيع الخادم أن يتحقق بإعادة الفرم. وحرف واحد مختلف يعطي ناتجاً آخر.",
    },
    {
      question: "سارة وعمر اختارا كلمة المرور نفسها 123456، لكن لكل منهما ملح. ماذا يُطبع؟",
      code: `${TOY}
let saraHash = toyHash("q4" + "123456");
let omarHash = toyHash("z9" + "123456");
console.log(saraHash === omarHash);`,
      options: ["false", "true", "خطأ: لا يمكن فرم الأرقام"],
      answer: 0,
      why: "الملح يغيّر المدخل نفسه: q4123456 غير z9123456، فيخرج فرمان مختلفان. من يسرق القاعدة لا يرى أن الاثنين يتشاركان كلمة المرور، ولا تنفعه قائمة فروم جاهزة لكلمات المرور الشائعة.",
    },
    {
      question: "سارة سجّلت الدخول، وتذكرتها صالحة. طلبت صفحة المدير. ماذا يُطبع؟",
      code: `let sessions = { k29q: "sara" };
let roles = { sara: "member", huda: "admin" };
function handle(request) {
  let name = sessions[request.cookie];
  if (name === undefined) return 401;
  if (request.path === "/admin" && roles[name] !== "admin") return 403;
  return 200;
}
console.log(handle({ path: "/admin", cookie: "k29q" }));`,
      options: ["403", "200", "401"],
      answer: 0,
      why: "عرف الخادم من هي (المصادقة نجحت، فلا 401). لكن السؤال الثاني: هل يحق لها /admin؟ دورها member، فالجواب لا: 403 تعني «أعرفك، لكن هذا ممنوع عليك».",
    },
  ],
  code: {
    intro: "الخادم كاملاً بفرم لعبة: الدخول بملح، وجدول جلسات، وعدّاد محاولات يرد 429، وسؤالا المصادقة والتفويض في handle. في عملك استبدل toyHash بـ scrypt أو bcrypt، والتذكرة بـ crypto.randomBytes.",
    runnerStarter: `${TOY}

let users = {
  sara: { salt: "q4", hash: toyHash("q4" + "pass1"), role: "member" },
  huda: { salt: "m2", hash: toyHash("m2" + "123456"), role: "admin" },
};
let sessions = {};
let failures = {};

function login(name, password) {
  if ((failures[name] || 0) >= 3) return { status: 429, body: "too many tries, wait" };
  let user = users[name];
  if (!user || toyHash(user.salt + password) !== user.hash) {
    failures[name] = (failures[name] || 0) + 1;
    return { status: 401, body: "wrong name or password" };
  }
  failures[name] = 0;
  let token = Math.random().toString(36).slice(2, 10);
  sessions[token] = name;
  return { status: 200, cookie: token };
}

function handle(request) {
  let name = sessions[request.cookie];
  if (!name) return { status: 401, body: "who are you?" }; // authentication
  if (request.path === "/admin" && users[name].role !== "admin") {
    return { status: 403, body: "not allowed" }; // authorization
  }
  return { status: 200, body: "hello " + name };
}

let res = login("sara", "pass1");
console.log("login:", res.status, "cookie:", res.cookie);
console.log(handle({ path: "/orders", cookie: res.cookie }));
console.log(handle({ path: "/admin", cookie: res.cookie }));
console.log(handle({ path: "/orders" }));
console.log("database row:", users.sara);
// جرّب: سجّل دخول huda بكلمة خاطئة أربع مرات واطبع الحالة في كل مرة
`,
  },
  exercises: [
    {
      kind: "order",
      title: "من التذكرة إلى الاسم",
      prompt: "رتّب الأسطر: الخادم يحفظ تذكرة sara، ثم يصل طلب يحمل التذكرة، فيعرف صاحبها ويطبع sara.",
      lines: [
        "let sessions = {};",
        'let token = "k29q";',
        'sessions[token] = "sara";',
        'let request = { path: "/orders", cookie: "k29q" };',
        "console.log(sessions[request.cookie]);",
      ],
      expected: "sara",
    },
    {
      kind: "fill",
      title: "قارن بالطريقة الصحيحة",
      prompt: "القاعدة تحفظ الملح والفرم فقط. ماذا تفرم حتى تقارن بـ user.hash فيُطبع 200؟",
      template: `${TOY}
let user = { salt: "q4", hash: toyHash("q4" + "pass1") };
let password = "pass1";
if (___ === user.hash) {
  console.log(200);
} else {
  console.log(401);
}`,
      options: ["toyHash(user.salt + password)", "toyHash(password)", "password"],
      expected: "200",
    },
    {
      kind: "fix",
      title: "تذكرة مخترعة تفتح الباب",
      prompt: "me تقبل أي تذكرة ما دامت موجودة، فمن يخترع تذكرة يدخل ويطبع 200 hello undefined. أصلحها حتى ترد 401 who are you? على تذكرة ليست في الجلسات.",
      code: `let sessions = { k29q: "sara" };
function me(request) {
  if (request.cookie === undefined) {
    return { status: 401, body: "who are you?" };
  }
  let name = sessions[request.cookie];
  return { status: 200, body: "hello " + name };
}
let res = me({ cookie: "made-up" });
console.log(res.status, res.body);`,
      expected: "401 who are you?",
      hint: "وجود التذكرة لا يكفي. ابحث عنها في sessions، فإن كان name يساوي undefined فهي ليست تذكرة أعطاها الخادم.",
      solution: `let sessions = { k29q: "sara" };
function me(request) {
  let name = sessions[request.cookie];
  if (name === undefined) {
    return { status: 401, body: "who are you?" };
  }
  return { status: 200, body: "hello " + name };
}
let res = me({ cookie: "made-up" });
console.log(res.status, res.body);`,
    },
    {
      kind: "write",
      title: "فرامل التخمين",
      prompt: "اكتب login(name, password): بعد 3 محاولات فاشلة للاسم نفسه ترد 429 دون أن تفحص كلمة المرور أصلاً. غير ذلك: كلمة صحيحة 200، وخاطئة تُعَدّ في attempts وترد 401.",
      starter: `let attempts = {};
function checkPassword(name, password) {
  return name === "sara" && password === "pass1";
}
// اكتب الدالة login هنا

console.log(login("sara", "a"));
console.log(login("sara", "b"));
console.log(login("sara", "c"));
console.log(login("sara", "pass1"));`,
      expected: "401\n401\n401\n429",
      hint: "اقرأ attempts[name] (أو 0 إن كانت undefined). إن كانت 3 أو أكثر أرجع 429 أولاً. ثم إن صحّت كلمة المرور أرجع 200، وإلا زِد العدّاد وأرجع 401.",
      solution: `let attempts = {};
function checkPassword(name, password) {
  return name === "sara" && password === "pass1";
}
function login(name, password) {
  let failed = attempts[name];
  if (failed === undefined) failed = 0;
  if (failed >= 3) return 429;
  if (checkPassword(name, password)) return 200;
  attempts[name] = failed + 1;
  return 401;
}
console.log(login("sara", "a"));
console.log(login("sara", "b"));
console.log(login("sara", "c"));
console.log(login("sara", "pass1"));`,
    },
  ],
  quiz: [
    {
      question: "سُرق جدول المستخدمين من خادم يتبع هذا الدرس. ماذا يجد السارق في صف سارة؟",
      code: "name  | salt | password_hash\nsara  | q4   | 8f3a91c0...",
      options: ["ملحاً وفرماً لا يرجعان إلى كلمة المرور مباشرة", "كلمة المرور pass1 مكتوبة", "كلمة المرور مشفّرة، يفكّها بمفتاح الخادم"],
      answer: 0,
      why: "الفرم ليس تشفيراً له مفتاح: هو اتجاه واحد. ليس أمام السارق إلا أن يخمّن كلمة، ويضيف الملح، ويفرم، ويقارن، واحدة واحدة. scrypt و bcrypt بطيئتان عمداً حتى يصير كل تخمين مكلفاً.",
    },
    {
      question: "خادم يفرم بلا ملح. ماذا يُطبع؟",
      code: 'let sara = toyHash("123456");\nlet omar = toyHash("123456");\nconsole.log(sara === omar);',
      options: ["true", "false", "يعتمد على الوقت"],
      answer: 0,
      why: "المدخل نفسه يعطي الفرم نفسه. بلا ملح يرى السارق صفين متطابقين فيعرف أنهما كلمة واحدة، ويكفيه أن يكسر واحدة. الملح العشوائي لكل مستخدم يجعل الصفين مختلفين.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'let sessions = { k29q: "sara" };\nfunction handle(request) {\n  let name = sessions[request.cookie];\n  if (name === undefined) return 401;\n  return 200;\n}\ndelete sessions["k29q"]; // logout\nconsole.log(handle({ cookie: "k29q" }));',
      options: ["401", "200", "خطأ يوقف البرنامج"],
      answer: 0,
      why: "تسجيل الخروج يمحو سطر التذكرة من ذاكرة الخادم. المتصفح ربما ما زال يرسل k29q، لكن الخادم لم يعد يجد صاحبها، فهي ورقة بلا قيمة.",
    },
    {
      question: "في JWT يحمل الرمز نفسه الاسم والدور، مع توقيع صنعه الخادم بسرّ لا يعرفه غيره. عدّلت سارة دورها في الرمز إلى admin. ماذا يحدث؟",
      code: 'payload:   {"name":"sara","role":"admin"}   ← عدّلته سارة\nsignature: 7c1e...                         ← محسوب للنسخة "member"',
      options: ["يرفضه الخادم: يعيد حساب التوقيع بسرّه فلا يطابق", "تصير مديرة، فالرمز عندها", "يقبله الخادم لأن التوقيع موجود"],
      answer: 0,
      why: "الخادم لا يحفظ جدول جلسات مع JWT، لكنه يتحقق من التوقيع في كل طلب. أي تعديل على المحتوى يغيّر التوقيع المطلوب، ولا أحد يصنع توقيعاً صحيحاً بلا السرّ.",
    },
    {
      question: "مخمّن يجرّب كلمات مرور على حساب سارة. ماذا يرى في المحاولة الخامسة إن كان الحدّ 3 محاولات؟",
      code: 'if (failures["sara"] >= 3) return { status: 429 };\n// ... check the password',
      options: ["429 حتى لو كانت كلمته صحيحة", "200 إن أصاب", "401 كالعادة"],
      answer: 0,
      why: "الفحص يحدث قبل مقارنة كلمة المرور، فالخادم لا ينظر إلى الكلمة أصلاً بعد الحد. هكذا يصير تجريب ملايين الكلمات يحتاج سنوات بدل دقائق.",
    },
  ],
  next: "validation",
};
