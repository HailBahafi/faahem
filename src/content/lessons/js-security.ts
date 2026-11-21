import type { Cell, Lesson, Scene } from "@/lib/types";

const box = (name: string, value: string): Cell => ({ name, value, type: "none" });
const str = (name: string, value: string): Cell => ({ name, value: JSON.stringify(value), type: "string" });

/** A hand-written scene for a predict answer. */
const mini = (js: string, steps: Scene["steps"]): Scene => ({ code: { js }, steps });

const PAYLOAD = '<img src=x onerror="steal()">';
const UNSAFE = `<p>${PAYLOAD}</p>`;
const SAFE = "<p>&lt;img src=x onerror=&quot;steal()&quot;&gt;</p>";

export const jsSecurity: Lesson = {
  slug: "js-security",
  stage: 0,
  number: "4.4",
  title: "أمان JavaScript",
  subtitle: "كل ما يأتي من الخارج بيانات، والثغرة لحظة تتحول فيها البيانات إلى كود",
  minutes: 28,
  singleLanguage: true,
  problem: {
    title: "تعليق يسرق الجلسة",
    body: "صفحة تعرض تعليقات الزوار. اختر تعليقاً وطريقة العرض، وراقب ما يحدث في متصفح كل من يفتح الصفحة. ثم فعّل سياسة CSP وجرّب من جديد.",
    demo: "jsSecurity",
  },
  scene: {
    code: {
      js: `function escapeHtml(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
const comment = '<img src=x onerror="steal()">';
const unsafe = "<p>" + comment + "</p>";
const safe = "<p>" + escapeHtml(comment) + "</p>";
console.log(unsafe);
console.log(safe);`,
    },
    steps: [
      {
        line: null,
        say: "محلّل HTML في المتصفح يقرأ الحرف > بداية وسم، والكلمة onerror= أمراً يُنفَّذ. حين تلصق نص زائر داخل HTML، فأنت تترك الزائر يكتب جزءاً من صفحتك.",
        memory: [],
      },
      {
        line: 5,
        say: "التعليق وصل من قاعدة البيانات، وكتبه زائر. في الذاكرة هو مجرد حروف، لا خطر فيه بعد.",
        memory: [str("comment", PAYLOAD)],
        changed: ["comment"],
      },
      {
        line: 6,
        say: "الربط ينتج نصاً فيه حروف التعليق كما هي. ما زال نصاً، لكنه سيُعطى لمحلّل HTML.",
        memory: [str("comment", PAYLOAD), str("unsafe", UNSAFE)],
        changed: ["unsafe"],
      },
      {
        line: 8,
        say: "حين يصل هذا إلى المتصفح (أو إلى innerHTML)، يرى المحلّل وسم img حقيقياً بمصدر مكسور، فيطلق onerror، فتعمل steal() في صفحة الضحية بصلاحياته: تقرأ ما في الصفحة وترسل طلبات باسمه. هذا XSS.",
        memory: [str("comment", PAYLOAD), str("unsafe", UNSAFE)],
        read: ["unsafe"],
        error: "XSS: steal() runs in every visitor's browser",
        output: [UNSAFE],
      },
      {
        line: 2,
        say: "الحل: الهروب (escaping). & أولاً، وإلا لأفسدت الكيانات التي ستضيفها بعدها. ثم < و > تصبح &lt; و &gt;: يعرضها المحلّل حرفين ولا يقرأها وسماً أبداً.",
        memory: [str("comment", PAYLOAD), str("unsafe", UNSAFE)],
        read: ["comment"],
        output: [UNSAFE],
      },
      {
        line: 3,
        say: "وعلامتا الاقتباس، حتى لا يخرج النص من قيمة خاصية مثل title=\"...\" إن وُضع داخلها.",
        memory: [str("comment", PAYLOAD), str("unsafe", UNSAFE)],
        output: [UNSAFE],
      },
      {
        line: 7,
        say: "النتيجة نص آمن: كل حرف خطر استُبدل بكيان يرسم الحرف نفسه على الشاشة.",
        memory: [str("comment", PAYLOAD), str("unsafe", UNSAFE), str("safe", SAFE)],
        changed: ["safe"],
      },
      {
        line: 9,
        say: "المتصفح يعرض الآن التعليق كما كتبه الزائر، حرفاً حرفاً، ولا يُنفَّذ منه شيء.",
        memory: [str("comment", PAYLOAD), str("unsafe", UNSAFE), str("safe", SAFE)],
        read: ["safe"],
        output: [UNSAFE, SAFE],
      },
      {
        line: null,
        say: "القاعدة واحدة في كل الثغرات: أبقِ البيانات في مسارها. اهرب عند الإخراج حسب السياق، وفي DOM استعمل textContent بدل innerHTML، ومرّر قيم SQL معاملات لا نصاً ملصوقاً، وأضف CSP جداراً ثانياً.",
        memory: [str("comment", PAYLOAD), str("safe", SAFE)],
        output: [UNSAFE, SAFE],
      },
    ],
    notes: {
      js: "React و Vue وغيرها تهرب كل قيمة تعرضها تلقائياً، لذلك تحمل الطرق التي تتجاوز ذلك أسماء تحذيرية: dangerouslySetInnerHTML و v-html. وإن كان لا بد من HTML من زائر، فمرّره على منقٍّ مثل DOMPurify.",
    },
  },
  playground: {
    kind: "trace",
    intro: "دالة هروب تمرّ على التعليق حرفاً حرفاً، وقائمة مفاتيح ممنوعة تحمي الكائنات من تلوّث النموذج الأولي. تابع out وهو يُبنى.",
    starter: `function escapeHtml(text) {
  let out = "";
  for (const ch of text) {
    if (ch === "&") out = out + "&amp;";
    else if (ch === "<") out = out + "&lt;";
    else if (ch === ">") out = out + "&gt;";
    else if (ch === '"') out = out + "&quot;";
    else out = out + ch;
  }
  return out;
}
const comments = ["Great post!", "<b>Thanks</b>", "Tom & Jerry"];
for (const c of comments) {
  console.log(escapeHtml(c));
}
const blocked = ["__proto__", "constructor", "prototype"];
function isSafeKey(key) {
  return blocked.indexOf(key) === -1;
}
console.log(isSafeKey("theme"), isSafeKey("__proto__"));`,
    challenges: [
      "قبل التشغيل: ماذا يصبح Tom & Jerry؟",
      "انقل سطر & ليكون آخر شرط بدل أولها. هل تغيّر شيء هنا؟ لماذا؟ (هنا كل حرف يُفحص مرة واحدة، أما سلسلة replaceAll فتعالج ناتج ما قبلها.)",
      "أضف إلى التعليقات '<img onerror=\"x()\">' وتأكد أن علامات الاقتباس هربت أيضاً.",
      "جرّب isSafeKey(\"Constructor\"). المقارنة حساسة لحالة الحروف، وهذا صحيح هنا: المفتاح الخطر في JavaScript هو constructor بالضبط.",
    ],
  },
  predict: [
    {
      question: "الخادم يدمج إعدادات أرسلها المستخدم. ماذا يُطبع في السطر الأخير؟",
      code: `function merge(target, source) {
  for (const key in source) {
    const value = source[key];
    if (typeof value === "object" && value !== null) {
      if (target[key] === undefined) target[key] = {};
      merge(target[key], value);
    } else {
      target[key] = value;
    }
  }
}
merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));
const guest = {};
console.log(guest.isAdmin);`,
      options: ["true", "undefined", "TypeError"],
      answer: 0,
      why: "JSON.parse تنشئ مفتاحاً حقيقياً اسمه __proto__. لكن target[\"__proto__\"] في الكائن العادي ليست خانة: هي الطريق إلى Object.prototype، النموذج الذي ترثه كل الكائنات. merge كتبت isAdmin فيه، فصار كل كائن في العملية «مديراً». هذا تلوّث النموذج الأولي (prototype pollution).",
      scene: mini(
        `merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));
const guest = {};
console.log(guest.isAdmin);`,
        [
          { line: 1, say: "المفتاح __proto__ قيمته كائن، فتنزل merge إلى target[\"__proto__\"]، وهي Object.prototype نفسها.", memory: [box("target.__proto__", "Object.prototype")] },
          { line: 1, say: "تكتب isAdmin = true في Object.prototype.", memory: [box("Object.prototype", "{ isAdmin: true, ... }")] },
          { line: 2, say: "guest كائن فارغ، لكنه يرث من Object.prototype.", memory: [box("Object.prototype", "{ isAdmin: true, ... }"), box("guest", "{} → Object.prototype")] },
          { line: 3, say: "guest لا يملك isAdmin، فيبحث المحرك في نموذجه: true.", memory: [box("Object.prototype", "{ isAdmin: true, ... }"), box("guest", "{} → Object.prototype")], output: ["true"] },
        ],
      ),
    },
    {
      question: "جدول users فيه 3 صفوف، ولا أحد اسمه x. كم صفاً يعيد الاستعلام؟",
      code: `const name = "x' OR '1'='1"; // typed into a search box
const sql = "SELECT * FROM users WHERE name = '" + name + "'";
db.query(sql);`,
      options: ["3: كل الصفوف", "0", "خطأ في صياغة SQL"],
      answer: 0,
      why: "علامة الاقتباس في المدخل أغلقت النص الذي فتحه الكود، فصار الباقي SQL: WHERE name = 'x' OR '1'='1'. والشرط الثاني صحيح دائماً. البيانات صارت كوداً، كما في XSS تماماً.",
      scene: mini(
        `const sql = "SELECT * FROM users WHERE name = '" + name + "'";`,
        [
          { line: 1, say: "الربط ينتج نص الاستعلام الذي ستحلّله قاعدة البيانات:", memory: [box("sql", "... WHERE name = 'x' OR '1'='1'")] },
          { line: 1, say: "المحلّل يرى شرطين: name = 'x' (خطأ) أو '1'='1' (صح). الناتج صح لكل صف.", memory: [box("sql", "... WHERE name = 'x' OR '1'='1'"), box("rows", "3")] },
        ],
      ),
    },
    {
      question: "ماذا يُطبع؟",
      code: `function escapeHtml(s) {
  return s.replaceAll("<", "&lt;").replaceAll("&", "&amp;");
}
console.log(escapeHtml("<b>"));`,
      options: ["&amp;lt;b>", "&lt;b&gt;", "&lt;b>"],
      answer: 0,
      why: "السلسلة تعالج ناتج الخطوة السابقة. < صارت &lt;، ثم استبدلت الخطوة الثانية & التي أضافتها الأولى، فصارت &amp;lt;. والمتصفح سيعرض &lt;b بدل <b. ولم يُهرب > أصلاً. لهذا & أولاً دائماً.",
      scene: mini(
        `s.replaceAll("<", "&lt;").replaceAll("&", "&amp;")`,
        [
          { line: 1, say: "الخطوة الأولى:", memory: [str("s", "&lt;b>")] },
          { line: 1, say: "الثانية تستبدل كل &، حتى التي أضفناها للتو:", memory: [str("s", "&amp;lt;b>")], output: ["&amp;lt;b>"] },
        ],
      ),
    },
  ],
  code: {
    intro: "الهجوم والدفاع كاملين: تلوّث النموذج الأولي من جسم طلب JSON، ثم ثلاثة دفاعات: تخطي المفاتيح الخطرة، وكائنات بلا نموذج، والتحقق من شكل المدخل. وفي الأسفل الفرق بين استعلام ملصوق واستعلام بمعاملات.",
    runnerStarter: `// 1. The attack: a JSON body from a request, merged into settings.
const body = JSON.parse('{"theme": "dark", "__proto__": {"isAdmin": true}}');

function naiveMerge(target, source) {
  for (const key in source) {
    const value = source[key];
    if (typeof value === "object" && value !== null) {
      if (target[key] === undefined) target[key] = {};
      naiveMerge(target[key], value);
    } else target[key] = value;
  }
  return target;
}
naiveMerge({}, body);
console.log("after naive merge, ({}).isAdmin =", ({}).isAdmin);
delete Object.prototype.isAdmin; // undo the damage for the rest of the demo

// 2. Defense: own keys only, and never the three keys that reach a prototype.
const BLOCKED = new Set(["__proto__", "constructor", "prototype"]);
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (BLOCKED.has(key)) continue;
    const value = source[key];
    if (typeof value === "object" && value !== null) {
      if (!Object.hasOwn(target, key)) target[key] = {};
      safeMerge(target[key], value);
    } else target[key] = value;
  }
  return target;
}
const settings = safeMerge({}, body);
console.log("after safe merge, ({}).isAdmin =", ({}).isAdmin, "theme =", settings.theme);

// 3. Defense: a dictionary with no prototype at all (or a Map) has nothing to pollute.
const byName = Object.create(null);
byName["__proto__"] = "just a key";
console.log("prototype-free object:", Object.keys(byName));

// 4. Injection: SQL built by gluing text, versus a parameterized query.
const name = "x' OR '1'='1";
console.log("glued:", "SELECT * FROM users WHERE name = '" + name + "'");
const users = [{ name: "sara" }, { name: "omar" }, { name: "lina" }];
function query(sql, params) {
  // A real driver sends sql and params separately: the database never parses params as SQL.
  return users.filter((u) => u.name === params[0]);
}
console.log("parameterized rows:", query("SELECT * FROM users WHERE name = $1", [name]).length);
// try: change safeMerge's loop back to for...in and remove the BLOCKED check
`,
  },
  exercises: [
    {
      kind: "order",
      title: "ابنِ ترويسة CSP",
      prompt: "رتّب الأسطر حتى تُبنى ترويسة Content-Security-Policy من كائن السياسة: default-src 'self'; script-src 'self' https://cdn.example.com; object-src 'none'",
      lines: [
        "const policy = {",
        `  "default-src": ["'self'"],`,
        `  "script-src": ["'self'", "https://cdn.example.com"],`,
        `  "object-src": ["'none'"],`,
        "};",
        "const header = Object.entries(policy)",
        '  .map(([directive, sources]) => directive + " " + sources.join(" "))',
        '  .join("; ");',
        "console.log(header);",
      ],
      expected: "default-src 'self'; script-src 'self' https://cdn.example.com; object-src 'none'",
    },
    {
      kind: "fill",
      title: "اعرض التعليق نصاً",
      prompt: "اعرض تعليق الزائر بحيث لا يتحول أي جزء منه إلى عناصر في الصفحة.",
      lang: "html",
      template: `<div id="comment"></div>
<script>
  const comment = '<b onclick="steal()">hi</b>';
  document.querySelector("#comment").___ = comment;
</script>`,
      options: ["textContent", "innerHTML", "outerHTML"],
      check: 'document.querySelectorAll("b").length',
      expected: "0",
    },
    {
      kind: "fix",
      title: "هروب مزدوج",
      prompt: "الدالة تفسد النص لأن ترتيب الاستبدال خاطئ. أصلحها حتى تطبع: &lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/a&gt;",
      code: `function escapeHtml(text) {
  return text
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;");
}
console.log(escapeHtml('<a href="x">Tom & Jerry</a>'));`,
      expected: "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/a&gt;",
      hint: "كل replaceAll تعالج ناتج ما قبلها. اجعل & أول استبدال، حتى لا تمسّ الكيانات التي تضيفها الخطوات التالية.",
      solution: `function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
console.log(escapeHtml('<a href="x">Tom & Jerry</a>'));`,
    },
    {
      kind: "write",
      title: "دمج لا يلوّث",
      prompt: "اكتب safeMerge(target, source) التي تدمج الكائنات المتداخلة، وتتخطى __proto__ و constructor و prototype، وتمرّ على مفاتيح source الخاصة فقط. يُطبع dark 16 undefined.",
      starter: `// write safeMerge(target, source): deep merge that cannot reach a prototype

const body = JSON.parse(
  '{"theme": "dark", "font": {"size": 16}, "__proto__": {"isAdmin": true}, "constructor": {"prototype": {"isAdmin": true}}}',
);
const settings = safeMerge({}, body);
console.log(settings.theme, settings.font.size, ({}).isAdmin);`,
      expected: "dark 16 undefined",
      hint: "for (const key of Object.keys(source)) يمرّ على المفاتيح الخاصة فقط. تخطَّ المفتاح إن كان في قائمة ممنوعة، وإن كانت القيمة كائناً فأنشئ كائناً في target (إن لم يوجد) وادمج فيه بالدالة نفسها.",
      solution: `const BLOCKED = ["__proto__", "constructor", "prototype"];

function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (BLOCKED.includes(key)) continue;
    const value = source[key];
    if (typeof value === "object" && value !== null) {
      if (!Object.hasOwn(target, key)) target[key] = {};
      safeMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

const body = JSON.parse(
  '{"theme": "dark", "font": {"size": 16}, "__proto__": {"isAdmin": true}, "constructor": {"prototype": {"isAdmin": true}}}',
);
const settings = safeMerge({}, body);
console.log(settings.theme, settings.font.size, ({}).isAdmin);`,
    },
  ],
  quiz: [
    {
      question: "الجدول فيه 3 مستخدمين، والمدخل خبيث. كم صفاً يعيد الاستعلام؟",
      code: "const name = \"x' OR '1'='1\";\nconst rows = await db.query(\"SELECT * FROM users WHERE name = $1\", [name]);",
      options: ["0", "3", "خطأ في صياغة SQL"],
      answer: 0,
      why: "مع المعاملات يصل نص الاستعلام إلى قاعدة البيانات وحده فيُحلَّل، ثم تصل القيمة منفصلة وتُقارن قيمةً. الاقتباس داخلها حرف عادي، ولا مستخدم اسمه هكذا. المعاملات تعمل في كل محرك: pg و mysql2 و ORMs.",
    },
    {
      question: "أين يجد المهاجم هذا المفتاح؟",
      code: '// src/payments.js in a React app\nconst PAYMENT_SECRET = "pk_secret_4f9a...";\nfetch(API, { headers: { Authorization: PAYMENT_SECRET } });',
      options: ["في ملف JavaScript الذي يحمّله كل زائر", "لا يجده: المجمّع يضغط الكود ويخفيه", "فقط إن رأى مستودع Git"],
      answer: 0,
      why: "كل ما في كود الواجهة يصل إلى متصفح الزائر، والضغط لا يخفي النصوص. المفاتيح السرية تبقى على الخادم، تُقرأ من متغيرات البيئة، وملف .env في .gitignore. والواجهة تطلب من خادمك، وخادمك يكلّم الخدمة. وإن تسرّب مفتاح فبدّله فوراً: الحذف من Git لا يمحو التاريخ.",
    },
    {
      question: "الصفحة تُرسل بالترويسة أدناه، ونجح مهاجم في حقن الوسمين. ماذا يعمل؟",
      code: "Content-Security-Policy: script-src 'self'\n\n<script>steal()</script>\n<img src=x onerror=\"steal()\">",
      options: ["لا شيء منهما", "الأول فقط", "الثاني فقط"],
      answer: 0,
      why: "script-src 'self' تسمح فقط بملفات سكربت من نطاقك (<script src=\"/app.js\">). الكود المكتوب داخل الصفحة ومعالجات الأحداث مثل onerror ممنوعة ما لم تُضف 'unsafe-inline'. CSP لا تصلح الثغرة، لكنها تمنعها من العمل: جدار ثانٍ.",
    },
    {
      question: "كتبتَ اسم حزمة بخطأ إملائي، فثبّتَّ حزمة مزيفة. متى يعمل كودها على جهازك؟",
      code: 'npm install expresss\n\n// its package.json\n"scripts": { "postinstall": "node collect.js" }',
      options: ["فور انتهاء التثبيت، بصلاحياتك، قبل أن تستوردها", "فقط حين تستوردها في كودك", "لا يعمل: npm يفحص كل الحزم"],
      answer: 0,
      why: "سكربتات install و postinstall تعمل تلقائياً عند التثبيت، وتقرأ ما تقرؤه أنت: مفاتيح SSH ومتغيرات البيئة. الدفاع: تحقق من الاسم والناشر قبل الإضافة، وملف قفل يُراجع في كل تغيير، و npm audit، و --ignore-scripts حين لا تحتاجها.",
    },
    {
      question: "خادم آلة حاسبة يحسب ما يرسله المستخدم. ماذا يحدث مع الطلب ?expr=process.exit(1)؟",
      code: "app.get(\"/calc\", (req, res) => {\n  res.send(String(eval(req.query.expr)));\n});",
      options: ["يتوقف الخادم: eval نفّذت كود المستخدم بصلاحيات الخادم", "يرد بخطأ لأن النص ليس رقماً", "لا شيء: eval تعمل في بيئة معزولة"],
      answer: 0,
      why: "eval و new Function تحوّلان النص إلى كود حرفياً، بكل صلاحيات العملية: إيقافها، قراءة الملفات، تشغيل أوامر. لا تعطِهما مدخلاً من الخارج أبداً. الآلة الحاسبة تحتاج محلّل تعابير يفهم الأرقام والعمليات الأربع فقط.",
    },
  ],
  next: "js-performance",
};
