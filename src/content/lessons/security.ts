import type { Cell, Lesson } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const raw = (name: string, value: string): Cell => ({ name, value, type: "none" });

const PAYLOAD = "' OR '1'='1";
const GLUED = "SELECT * FROM users WHERE name = 'sara' AND password = '' OR '1'='1'";
const SAFE = "SELECT * FROM users WHERE name = $1 AND password = $2";

const inputs = [s("name", "sara"), s("password", PAYLOAD)];
const glued = [...inputs, s("sql", GLUED)];
const safe = [...glued, s("safe", SAFE)];
const withParams = [...safe, raw("params", `["sara", "${PAYLOAD}"]`)];

const USERS = `CREATE TABLE users (id int PRIMARY KEY, name text, password text, role text);
INSERT INTO users VALUES
  (1, 'admin', 'Adm1n-2026', 'admin'),
  (2, 'sara', 'sara123', 'user'),
  (3, 'omar', 'omar456', 'user');`;

const LOGIN_UNSAFE = `CREATE FUNCTION login_unsafe(n text, p text) RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY EXECUTE
    'SELECT * FROM users WHERE name = ''' || n || ''' AND password = ''' || p || '''';
END $$ LANGUAGE plpgsql;`;

export const security: Lesson = {
  slug: "security",
  stage: 12,
  number: "12.3",
  title: "الأمان",
  subtitle: "فكّر كمهاجم: كل مدخل قد يكون هجوماً، والبيانات يجب ألا تصير أوامر أبداً",
  minutes: 18,
  problem: {
    title: "اخترق موقعك قبل أن يخترقه غيرك",
    body: "هذا نموذج دخول وصندوق تعليقات لموقع حقيقي الشكل. اختر هجوماً من القائمة وأرسله، وراقب ماذا يصير الاستعلام في الخادم، وماذا يصير الـ HTML في صفحة الزوار. ثم شغّل كل دفاع وأعد الهجوم نفسه.",
    demo: "security",
  },
  scene: {
    code: {
      js: `let name = "sara";
let password = "' OR '1'='1";
let sql = "SELECT * FROM users WHERE name = '" + name + "' AND password = '" + password + "'";
console.log(sql);
let safe = "SELECT * FROM users WHERE name = $1 AND password = $2";
let params = [name, password];
console.log(safe);`,
      ts: `let name: string = "sara";
let password: string = "' OR '1'='1";
let sql: string = "SELECT * FROM users WHERE name = '" + name + "' AND password = '" + password + "'";
console.log(sql);
let safe: string = "SELECT * FROM users WHERE name = $1 AND password = $2";
let params: string[] = [name, password];
console.log(safe);`,
      py: `name = "sara"
password = "' OR '1'='1"
sql = "SELECT * FROM users WHERE name = '" + name + "' AND password = '" + password + "'"
print(sql)
safe = "SELECT * FROM users WHERE name = $1 AND password = $2"
params = (name, password)
print(safe)`,
      go: `name := "sara"
password := "' OR '1'='1"
sql := "SELECT * FROM users WHERE name = '" + name + "' AND password = '" + password + "'"
fmt.Println(sql)
safe := "SELECT * FROM users WHERE name = $1 AND password = $2"
params := []any{name, password}
fmt.Println(safe)`,
      dart: `var name = "sara";
var password = "' OR '1'='1";
var sql = "SELECT * FROM users WHERE name = '" + name + "' AND password = '" + password + "'";
print(sql);
var safe = r"SELECT * FROM users WHERE name = $1 AND password = $2";
var params = [name, password];
print(safe);`,
      rust: `let name = "sara";
let password = "' OR '1'='1";
let sql = format!("SELECT * FROM users WHERE name = '{}' AND password = '{}'", name, password);
println!("{}", sql);
let safe = "SELECT * FROM users WHERE name = $1 AND password = $2";
let params = [name, password];
println!("{}", safe);`,
    },
    notes: {
      js: "مع مكتبة pg في Node ترسل الاثنين معاً: pool.query(safe, params). المكتبة تبعث القالب والقيم في رسالتين منفصلتين إلى Postgres.",
      ts: "الأنواع لا تحميك هنا: sql و safe كلاهما string في نظر TypeScript. الفرق في طريقة الإرسال، لا في النوع.",
      py: "مع asyncpg تكتب ‎$1‎ كما هنا: await conn.fetch(safe, name, password). ومكتبة psycopg تكتب الثقب ‎%s‎ بدل ‎$1‎، والفكرة نفسها.",
      go: "في Go تمرر القيم بعد القالب: db.Query(safe, name, password). ولو استعملت fmt.Sprintf لبناء الجملة لعدت إلى اللصق الخطِر.",
      dart: "r قبل النص تعني نصاً خاماً، لأن $ في Dart تُدخل متغيراً. مع حزمة postgres: conn.execute(Sql.indexed(safe), parameters: params).",
      rust: "format! يلصق تماماً مثل +، فهو خطِر هنا. مع sqlx: sqlx::query(safe).bind(name).bind(password)، ويفحص sqlx الجملة وقت البناء أيضاً.",
    },
    steps: [
      {
        line: null,
        say: "صفحة دخول عادية. لكن الذي يكتب الآن مهاجم: في خانة الاسم كتب sara، وفي خانة كلمة المرور كتب نصاً غريباً فيه علامات تنصيص. فكّر مثله: ماذا لو لم يكن المدخل «بيانات» كما توقعت؟",
        memory: [],
      },
      { line: 1, say: "name نص عادي: \"sara\". لا مشكلة فيه.", memory: [inputs[0]], changed: ["name"] },
      {
        line: 2,
        say: "password هو ما كتبه المهاجم حرفاً حرفاً. للخادم هو مجرد نص، لكنه يحمل علامة ' التي تعني في SQL «انتهى النص هنا».",
        memory: inputs,
        changed: ["password"],
      },
      {
        line: 3,
        say: "الخادم يلصق المدخلات داخل جملة SQL. لا يعرف أن هذا النص فيه أوامر: يلصقه كما هو، فتختلط البيانات بالكود في نص واحد.",
        memory: glued,
        changed: ["sql"],
        read: ["name", "password"],
      },
      {
        line: 4,
        say: "انظر الجملة التي ستصل إلى Postgres: علامة المهاجم أغلقت كلمة المرور فارغة، ثم صار باقي ما كتبه أمراً: OR '1'='1'. و AND تُحسب قبل OR، فالشرط صار: (اسم وكلمة مرور فارغة) أو (1 يساوي 1). وهذا صحيح لكل صف.",
        memory: glued,
        read: ["sql"],
        output: [GLUED],
        error: "حقن SQL: كل المستخدمين يُرجَعون، والمهاجم يدخل كأولهم، وغالباً هو المدير",
      },
      {
        line: 5,
        say: "العلاج: جملة يكتبها المبرمج وحده، فيها ثقوب مرقّمة ‎$1‎ و ‎$2‎ مكان القيم. لا شيء مما كتبه المستخدم يدخل هذا النص أبداً.",
        memory: safe,
        changed: ["safe"],
        output: [GLUED],
      },
      {
        line: 6,
        say: "القيم تسافر وحدها في قائمة منفصلة. ستصل إلى قاعدة البيانات في رسالة غير رسالة الجملة.",
        memory: withParams,
        changed: ["params"],
        read: ["name", "password"],
        output: [GLUED],
      },
      {
        line: 7,
        say: "Postgres يقرأ الجملة أولاً ويفهم بنيتها كاملة: شرطان لا أكثر. بعدها فقط يضع القيم في الثقوب كبيانات. نص المهاجم صار كلمة مرور غريبة يُبحث عنها حرفياً، ولا أحد يملكها، فلا صف يعود.",
        memory: withParams,
        read: ["safe", "params"],
        output: [GLUED, SAFE],
      },
      {
        line: 7,
        say: "هذه هي الصورة: في الاستعلام المُجزّأ لا تستطيع البيانات أن تصير كوداً، مهما كتب المهاجم. ونفس الفكرة تحمي HTML: اعرض ما كتبه المستخدم كنص، لا كوسوم.",
        memory: withParams,
        output: [GLUED, SAFE],
      },
    ],
  },
  playground: {
    kind: "html",
    intro: "صفحة تعليقات تعرض ما كتبه الزوار بـ innerHTML، أي كـ HTML. التعليق الثالث كتبه مهاجم: إن نجح يصبغ الصفحة بالأحمر. شاهد المعاينة، ثم بدّل إلى textContent.",
    starter: `<h3>Comments</h3>
<div id="list"></div>
<script>
  let comments = [
    "Great shop!",
    "<b>Fast</b> delivery",
    "<img src=x onerror=\\"document.body.style.background='tomato'\\">",
  ];
  for (const c of comments) {
    let p = document.createElement("p");
    p.innerHTML = c; // try: p.textContent = c;
    document.getElementById("list").appendChild(p);
  }
</script>`,
    challenges: [
      "قبل أن تغيّر شيئاً: لماذا صار «Fast» عريضاً؟ من قرر ذلك، أنت أم الزائر؟",
      "بدّل innerHTML إلى textContent. ماذا حدث للون الصفحة وللكلمة العريضة؟",
      "أضف تعليقاً رابعاً: \"<h1>FREE PRIZE</h1>\". جرّبه مع innerHTML ثم مع textContent.",
      "اكتب دالة escape تحوّل < إلى &lt; و > إلى &gt;، واستعملها مع innerHTML. هل تساوي textContent في النتيجة؟",
    ],
  },
  predict: [
    {
      question: "المهاجم كتب هذا في خانة الاسم، وأي شيء في كلمة المرور. ماذا يُطبع؟",
      code: `let name = "admin' --";
let password = "nothing";
let sql = "SELECT * FROM users WHERE name = '" + name + "' AND password = '" + password + "'";
console.log(sql);`,
      options: [
        "SELECT * FROM users WHERE name = 'admin' --' AND password = 'nothing'",
        "SELECT * FROM users WHERE name = 'admin -- ' AND password = 'nothing'",
        "خطأ: الاسم فيه علامة تنصيص",
      ],
      answer: 0,
      why: "اللصق لا يفهم شيئاً، فالعلامة ' أغلقت الاسم مبكراً. و -- في SQL تعني «ما بعدي تعليق»، فصار فحص كلمة المرور كله تعليقاً لا يُنفَّذ. دخل المهاجم كمدير بلا كلمة مرور. الاستعلام المُجزّأ يبحث عن مستخدم اسمه حرفياً admin' -- فلا يجده.",
    },
    {
      question: "الخادم «يهرّب» التعليق قبل أن يضعه في HTML. ماذا يُطبع؟",
      code: `function escape(text) {
  return text.split("<").join("&lt;").split(">").join("&gt;");
}
let comment = "<script>steal()</script>";
let html = "<p>" + escape(comment) + "</p>";
console.log(html);`,
      options: [
        "<p>&lt;script&gt;steal()&lt;/script&gt;</p>",
        "<p><script>steal()</script></p>",
        "<p>steal()</p>",
      ],
      answer: 0,
      why: "كل < صارت &lt; وكل > صارت &gt;. المتصفح يرسم &lt; كعلامة < على الشاشة، لكنه لا يراها بداية وسم. فيرى الزوار التعليق نصاً كما كُتب، ولا يُنفَّذ أي سكربت. React و textContent يفعلان هذا عنك.",
    },
    {
      question: "مبرمج رفع ملف .env بالخطأ، ثم حذفه في الـ commit التالي. ماذا يُطبع؟",
      code: `let history = [];
history.push({ msg: "add config", env: "API_KEY=sk_live_42" });
history.push({ msg: "remove .env", env: "" });
let latest = history[history.length - 1];
console.log(latest.env === "", history[0].env);`,
      options: ["true API_KEY=sk_live_42", "true (فارغ)", "false API_KEY=sk_live_42"],
      answer: 0,
      why: "Git لا يمحو الماضي: كل commit لقطة محفوظة للأبد. الملف غائب عن آخر لقطة، لكنه في الأولى، وكل من نسخ المستودع يملكها. السر المرفوع سرّ محروق: غيّره فوراً، وضع .env في .gitignore من البداية.",
    },
  ],
  code: {
    intro: "هذا Postgres حقيقي داخل متصفحك، وفيه جدول users. login_unsafe تلصق المدخلات في نص الجملة ثم تنفّذه، و login_safe ترسل الجملة بثقوب ‎$1‎ و ‎$2‎ والقيم منفصلة. للتبسيط كلمات المرور مخزّنة كما هي؛ في تطبيقك تُخزّن مجزّأة (hash) كما في درس الدخول.",
    runnerLang: "sql",
    runnerSetup: USERS,
    runnerStarter: `-- the query the unsafe login builds from what the attacker typed
SELECT 'SELECT * FROM users WHERE name = ''' || 'sara' || ''' AND password = ''' || 'x'' OR ''1''=''1' || '''' AS glued_query;

${LOGIN_UNSAFE}

CREATE FUNCTION login_safe(n text, p text) RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY EXECUTE
    'SELECT * FROM users WHERE name = $1 AND password = $2' USING n, p;
END $$ LANGUAGE plpgsql;

-- in SQL, '' inside a string is one quote: 'x'' OR ''1''=''1' is the text x' OR '1'='1
SELECT name, role FROM login_unsafe('sara', 'x'' OR ''1''=''1') ORDER BY id;
SELECT count(*) AS safe_found FROM login_safe('sara', 'x'' OR ''1''=''1');
SELECT name, role FROM login_safe('sara', 'sara123');
-- جرّب: أرسل الاسم 'admin'' --' إلى login_unsafe ثم إلى login_safe. من يدخل في كل مرة؟
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "sql",
      setup: USERS,
      title: "جملة بثقوب",
      prompt: "رتّب الأسطر: جهّز جملة دخول بثقبين ‎$1‎ و ‎$2‎ (PREPARE)، ثم نفّذها مرة بهجوم ومرة بكلمة المرور الصحيحة. الهجوم يجد 0، وسارة تجد 1.",
      lines: [
        "PREPARE login(text, text) AS",
        "SELECT count(*) AS found FROM users",
        "WHERE name = $1 AND password = $2;",
        "EXECUTE login('sara', 'x'' OR ''1''=''1');",
        "EXECUTE login('sara', 'sara123');",
      ],
      expected: "found\n0\nfound\n1",
    },
    {
      kind: "fill",
      lang: "sql",
      setup: `${USERS}\n${LOGIN_UNSAFE}`,
      title: "فكّر كمهاجم",
      prompt: "login_unsafe تلصق كلمة المرور داخل جملة SQL (كما في محطة الكود). أي كلمة مرور تجعلها تُرجع المستخدمين الثلاثة كلهم؟ تذكّر: '' داخل نص SQL علامة تنصيص واحدة.",
      template: "SELECT count(*) AS found FROM login_unsafe('sara', ___);",
      options: ["'wrong'", "'sara123'", "'x'' OR ''1''=''1'"],
      expected: "found\n3",
    },
    {
      kind: "fix",
      lang: "sql",
      setup: USERS,
      title: "سدّ الثغرة",
      prompt: "دالة login تلصق n و p في نص الجملة، فالهجوم يجد 3 مستخدمين. أصلحها لترسل الجملة بثقوب ‎$1‎ و ‎$2‎ والقيم بـ USING، فيجد الهجوم 0 وتجد سارة 1.",
      code: `CREATE FUNCTION login(n text, p text) RETURNS bigint AS $$
DECLARE found bigint;
BEGIN
  EXECUTE 'SELECT count(*) FROM users WHERE name = ''' || n || ''' AND password = ''' || p || ''''
    INTO found;
  RETURN found;
END $$ LANGUAGE plpgsql;

SELECT login('sara', 'x'' OR ''1''=''1') AS attack, login('sara', 'sara123') AS sara;`,
      expected: "attack | sara\n0 | 1",
      hint: "اكتب الجملة بثقوب بدل اللصق: EXECUTE 'SELECT count(*) FROM users WHERE name = $1 AND password = $2' INTO found USING n, p;",
      solution: `CREATE FUNCTION login(n text, p text) RETURNS bigint AS $$
DECLARE found bigint;
BEGIN
  EXECUTE 'SELECT count(*) FROM users WHERE name = $1 AND password = $2'
    INTO found USING n, p;
  RETURN found;
END $$ LANGUAGE plpgsql;

SELECT login('sara', 'x'' OR ''1''=''1') AS attack, login('sara', 'sara123') AS sara;`,
    },
    {
      kind: "write",
      lang: "html",
      title: "تعليق لا يُنفَّذ",
      prompt: "مهاجم كتب تعليقاً فيه وسم img يشغّل كوداً. أكمل السكربت ليظهر التعليق داخل p كنص كما كُتب، لا كـ HTML.",
      check: 'document.getElementById("comments").innerHTML',
      starter: `<div id="comments"></div>
<script>
  let comment = "<img src=x onerror=\\"steal(document.cookie)\\">";
  let p = document.createElement("p");
  // show the comment as text, never as HTML
  document.getElementById("comments").appendChild(p);
</script>`,
      expected: '<p>&lt;img src=x onerror="steal(document.cookie)"&gt;</p>',
      hint: "p.textContent = comment; يضع النص كما هو، والمتصفح يحفظ < كرمز &lt; لا كبداية وسم.",
      solution: `<div id="comments"></div>
<script>
  let comment = "<img src=x onerror=\\"steal(document.cookie)\\">";
  let p = document.createElement("p");
  p.textContent = comment;
  document.getElementById("comments").appendChild(p);
</script>`,
    },
  ],
  quiz: [
    {
      question: "الخادم يخزّن hash كلمة المرور لا الكلمة نفسها. عند الدخول ماذا يُطبع؟",
      code: `function hash(text) {
  let h = 7;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 1000003;
  return h;
}
let stored = hash("sara123");
console.log(stored === hash("sara123"), stored === hash("Sara123"));`,
      options: ["true false", "true true", "false false"],
      answer: 0,
      why: "الخادم لا يفك الـ hash أبداً: يجزّئ ما كتبته الآن ويقارن الناتجين. الكلمة نفسها تعطي الناتج نفسه، وحرف واحد مختلف يعطي ناتجاً آخر. ولو سُرقت القاعدة يجد اللص أرقاماً لا كلمات. في الحقيقة استعمل bcrypt أو argon2: بطيئة ومملّحة عمداً.",
    },
    {
      question: "التطبيق يتصل بقاعدة البيانات بمستخدم لا يملك إلا القراءة. نجح مهاجم في حقن أمر حذف. ماذا يُطبع؟",
      code: `let grants = { app_reader: ["SELECT"], owner: ["SELECT", "INSERT", "DROP"] };
function run(user, command) {
  return grants[user].includes(command) ? command + " done" : "permission denied";
}
console.log(run("app_reader", "DROP"));`,
      options: ["permission denied", "DROP done", "undefined"],
      answer: 0,
      why: "هذا أقل الصلاحيات: أعطِ كل جزء ما يحتاجه فقط. الحقن نجح، لكن الحساب الذي نفّذه لا يملك DROP، فالضرر محدود. خطأ واحد لم يصر كارثة لأن طبقة ثانية صدّته.",
    },
    {
      question: "مهاجم يجرّب كلمات مرور. الخادم يسمح بـ 5 محاولات في الدقيقة لكل حساب. كم دقيقة يحتاج ليجرّب 1000 كلمة؟",
      code: `let guesses = 1000;
let perMinute = 5;
let minutes = guesses / perMinute;
console.log(minutes, Math.round(minutes / 60));`,
      options: ["200 3", "1000 17", "5 0"],
      answer: 0,
      why: "بلا حدّ يجرّب الآلة آلاف الكلمات في الثانية. مع الحدّ صارت 1000 كلمة تأخذ 200 دقيقة، أي نحو 3 ساعات، وقائمة كلمات المرور الشائعة فيها ملايين. تحديد المعدل لا يمنع الهجوم، لكنه يجعله بطيئاً إلى حدّ لا يستحق.",
    },
    {
      question: "دفاع متعدد الطبقات: الهجوم ينجح فقط إن فشلت كل طبقة. ماذا يُطبع؟",
      code: `let layers = [
  { name: "validation", stops: false },
  { name: "parameterised query", stops: true },
  { name: "least privilege", stops: true },
];
let blocked = layers.filter((l) => l.stops).map((l) => l.name);
console.log(blocked.length > 0 ? "attack stopped by " + blocked[0] : "breach");`,
      options: ["attack stopped by parameterised query", "breach", "attack stopped by validation"],
      answer: 0,
      why: "التحقق من المدخلات فاته هذا الهجوم، وهذا يحدث. لكن الاستعلام المُجزّأ صدّه، ولو فاته أيضاً لصدّته الصلاحيات. لا تعتمد على جدار واحد: كل طبقة تفترض أن التي قبلها قد تخطئ.",
    },
    {
      question: "مستخدم في مقهى يرسل كلمة مروره. شخص على شبكة الـ Wi-Fi نفسها يرى ما يمرّ. ماذا يرى في كل حالة؟",
      code: `function onTheWire(body, https) {
  return https ? "x9#Lq0..." : body;
}
let body = "password=sara123";
console.log(onTheWire(body, false), "|", onTheWire(body, true));`,
      options: ["password=sara123 | x9#Lq0...", "x9#Lq0... | x9#Lq0...", "password=sara123 | password=sara123"],
      answer: 0,
      why: "HTTP نص مكشوف يقرؤه كل جهاز في الطريق. HTTPS يشفّر الطلب كله، فلا يرى المتلصص إلا رموزاً بلا معنى. لهذا HTTPS في كل صفحة، لا في صفحة الدخول وحدها: الكوكي يسافر مع كل طلب.",
    },
  ],
  next: "system-design",
};
