import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

const base = [n("users", 100000), n("perSecond", 1000), n("servers", 3)];

export const systemDesign: Lesson = {
  slug: "system-design",
  stage: 12,
  number: "12.4",
  title: "تصميم الأنظمة",
  subtitle: "كل القطع التي بنيتها، مرتّبة لتحتمل مليون مستخدم: أين يختنق النظام، وماذا تضيف",
  minutes: 20,
  singleLanguage: true,
  problem: {
    title: "موقعك نجح… والآن يغرق",
    body: "على اللوحة نظام صغير: خادم واحد وقاعدة بيانات. حرّك شريط المستخدمين من 100 إلى مليون، وراقب أي قطعة تحمرّ أولاً. اسحب القطع من الصندوق (أو اضغطها) لتضيفها حتى يخضرّ كل شيء، وعينك على الكلفة الشهرية.",
    demo: "systemDesign",
  },
  scene: {
    code: {
      js: `let users = 100000;
let perSecond = users / 100;
let servers = Math.ceil(perSecond / 400);
let hitPercent = 0;
let dbQueries = perSecond * (100 - hitPercent) / 100;
console.log(servers, dbQueries, dbQueries > 300 ? "db overloaded" : "db ok");
hitPercent = 90;
dbQueries = perSecond * (100 - hitPercent) / 100;
console.log(servers, dbQueries, dbQueries > 300 ? "db overloaded" : "db ok");`,
    },
    notes: {
      js: "هذا حساب على ظهر ورقة، لا كود يعمل في الخادم. المهندسون يبدؤون كل تصميم بأرقام تقريبية كهذه قبل أن يرسموا أي صندوق.",
    },
    steps: [
      {
        line: null,
        say: "أنت بنيت كل القطع: خوادم بـ Node و Go و Python، و Postgres بفهارس، و Redis، وطوابير، و Docker، و CI/CD، ومراقبة. تصميم النظام هو ترتيبها. والسؤال الأول دائماً: كم؟",
        memory: [],
      },
      { line: 1, say: "كم مستخدماً؟ نفترض 100 ألف مستخدم نشط في ساعة الذروة.", memory: [base[0]], changed: ["users"] },
      {
        line: 2,
        say: "كم طلباً في الثانية؟ نفترض أن كل مستخدم يرسل طلباً كل 100 ثانية تقريباً. الناتج 1000 طلب في الثانية. الرقم تقريبي، وهذا يكفي.",
        memory: base.slice(0, 2),
        changed: ["perSecond"],
        read: ["users"],
      },
      {
        line: 3,
        say: "خادم الـ API الواحد يتحمل نحو 400 طلب في الثانية. 1000 ÷ 400 = 2.5، و Math.ceil يرفعها إلى 3. ثلاثة خوادم تحتاج أمامها موزّع حمل (load balancer) يوزّع الطلبات عليها.",
        memory: base,
        changed: ["servers"],
        read: ["perSecond"],
      },
      {
        line: 4,
        say: "لا كاش بعد: نسبة الإصابة (hit) صفر، فكل طلب يذهب إلى قاعدة البيانات.",
        memory: [...base, n("hitPercent", 0)],
        changed: ["hitPercent"],
      },
      {
        line: 5,
        say: "كل الـ 1000 طلب تصير 1000 استعلام في الثانية على Postgres. إضافة خوادم API لا تخفف عن القاعدة شيئاً: كلها تسأل القاعدة نفسها.",
        memory: [...base, n("hitPercent", 0), n("dbQueries", 1000)],
        changed: ["dbQueries"],
        read: ["perSecond", "hitPercent"],
      },
      {
        line: 6,
        say: "قاعدتنا تتحمل نحو 300 استعلام في الثانية. 1000 أكبر من 300: الشرط صحيح. الخوادم بخير، لكن عنق الزجاجة هو القاعدة.",
        memory: [...base, n("hitPercent", 0), n("dbQueries", 1000)],
        read: ["dbQueries"],
        output: ["3 1000 db overloaded"],
        error: "قاعدة البيانات مختنقة: الطلبات تنتظر، والصفحات تبطئ ثم تفشل",
      },
      {
        line: 7,
        say: "نسأل: ماذا يقبل أن يكون قديماً قليلاً؟ صفحة المنتج تُقرأ آلاف المرات وتتغير نادراً. نضع Redis أمام القاعدة، فتُجاب 90% من القراءات من الذاكرة.",
        memory: [...base, n("hitPercent", 90), n("dbQueries", 1000)],
        changed: ["hitPercent"],
        output: ["3 1000 db overloaded"],
      },
      {
        line: 8,
        say: "الآن 10% فقط تصل إلى Postgres: 1000 × 10 ÷ 100 = 100 استعلام في الثانية.",
        memory: [...base, n("hitPercent", 90), n("dbQueries", 100)],
        changed: ["dbQueries"],
        read: ["perSecond", "hitPercent"],
        output: ["3 1000 db overloaded"],
      },
      {
        line: 9,
        say: "100 أقل من 300: كل شيء أخضر. لكن لا شيء مجاني: صار عندنا قطعة تُدار، وثمنها أن السعر قد يظهر قديماً دقيقة. هذا هو التصميم: مقايضات، لا جواب كامل.",
        memory: [...base, n("hitPercent", 90), n("dbQueries", 100)],
        read: ["dbQueries"],
        output: ["3 1000 db overloaded", "3 100 db ok"],
      },
    ],
  },
  playground: {
    kind: "trace",
    intro: "نموذج صغير للنظام كله: design يصف ما بنيت، و check يحسب حمل كل قطعة ويطبع أين الاختناق. غيّر الأرقام في design أو عدد المستخدمين، وتوقّع النتيجة قبل أن تشغّل.",
    starter: `let design = { servers: 2, cache: false, replicas: 0, queue: false };

function check(users) {
  let perSecond = users / 100;
  let serverLoad = perSecond / (design.servers * 400);
  let reads = perSecond * 0.9;
  let writes = perSecond * 0.1;
  if (design.cache) reads = reads * 0.1;
  let dbLoad = (writes + reads / (design.replicas + 1)) / 300;
  if (!design.queue) serverLoad = serverLoad * 2;
  let parts = [["api", serverLoad], ["db", dbLoad]];
  for (const p of parts) {
    console.log(p[0], Math.round(p[1] * 100) + "%", p[1] > 1 ? "RED" : "ok");
  }
}

check(10000);`,
    challenges: [
      "قبل أن تشغّل: لماذا يتضاعف حمل الخوادم حين queue = false؟ (إرسال البريد وتصغير الصور داخل الطلب نفسه.)",
      "ارفع المستخدمين إلى 100000. أي قطعة تحمرّ؟ أصلحها بأقل تغيير ممكن في design.",
      "عند مليون مستخدم: جرّب replicas: 3 بلا cache، ثم cache: true بلا replicas. أيهما يكفي؟ ولماذا لا تساعد النسخ في الكتابة؟",
      "أضف قطعة ثالثة \"cache\" إلى parts بحمل reads الأصلية ÷ 50000. متى تحمرّ هي أيضاً؟",
    ],
  },
  predict: [
    {
      question: "خادمان خلف موزّع حمل يتناوبان على الطلبات. كل خادم يحفظ الجلسات في ذاكرته هو. ماذا يُطبع؟",
      code: `let servers = [{ sessions: {} }, { sessions: {} }];
let turn = 0;
function next() {
  let s = servers[turn];
  turn = (turn + 1) % 2;
  return s;
}
next().sessions["t1"] = "sara";
console.log(next().sessions["t1"] || "guest");`,
      options: ["guest", "sara", "undefined"],
      answer: 0,
      why: "طلب الدخول وصل إلى الخادم الأول فحفظ الجلسة عنده، والطلب التالي ذهب إلى الثاني فلم يجدها. لهذا خوادم الـ API عديمة الحالة (stateless): الجلسات في Redis المشترك، فأي خادم يجيب أي طلب، ويمكن إضافة خوادم أو إسقاطها بلا خسارة.",
    },
    {
      question: "الكتابة تذهب إلى القاعدة الأساسية، والقراءة من نسخة (replica) تتأخر عنها قليلاً. ماذا يرى المستخدم بعد الدفع مباشرة؟",
      code: `let primary = { order7: "unpaid" };
let replica = { order7: "unpaid" };
primary.order7 = "paid";
console.log(replica.order7);
replica.order7 = primary.order7;
console.log(replica.order7);`,
      options: ["unpaid ثم paid", "paid ثم paid", "unpaid ثم unpaid"],
      answer: 0,
      why: "النسخة تنسخ التغييرات بعد جزء من الثانية، وفي تلك اللحظة تجيب بالقديم. هذا مقبول لقائمة المنتجات، لا لصفحة «تم الدفع». القرار: ما يجب أن يكون دقيقاً يُقرأ من الأساسية، وما يقبل التأخير من النسخ.",
    },
    {
      question: "التسجيل يرسل بريد ترحيب يأخذ 2000 ملي ثانية. كم ينتظر المستخدم في كل تصميم؟",
      code: `let saveUser = 30;
let sendEmail = 2000;
let addToQueue = 5;
let inline = saveUser + sendEmail;
let withQueue = saveUser + addToQueue;
console.log(inline, withQueue);`,
      options: ["2030 35", "2030 2035", "35 35"],
      answer: 0,
      why: "مع الطابور يضع الخادم مهمة «أرسل بريداً» ويرد فوراً، وعامل في الخلفية (worker) يرسله بعدها. المستخدم لا ينتظر العمل البطيء، والخادم يتفرغ لطلبات غيره. والبريد قد يصل بعد ثوانٍ، وهذا مقبول.",
    },
  ],
  code: {
    intro: "مخطِّط سعة صغير: يحسب لكل عدد مستخدمين ما تحتاجه من خوادم ونسخ وعمّال، والكلفة الشهرية. الأرقام تقريبية كأي تقدير حقيقي. لاحظ كيف تضاعف الكلفة لا يتبع تضاعف المستخدمين خطوة بخطوة.",
    runnerStarter: `const SERVER_RPS = 400;      // one API server
const DB_QPS = 300;          // one Postgres primary
const REPLICA_QPS = 500;     // one read replica
const WORKER_JOBS = 50;      // one background worker, jobs per second
const PRICE = { server: 40, db: 60, replica: 60, cache: 30, lb: 20, queue: 10, worker: 25 };

function plan(users) {
  const perSecond = users / 100;
  const servers = Math.max(1, Math.ceil(perSecond / SERVER_RPS));
  const useCache = perSecond > 200;
  const reads = perSecond * 0.9 * (useCache ? 0.1 : 1);
  const writes = perSecond * 0.1;
  const replicas = writes + reads <= DB_QPS ? 0 : Math.ceil(reads / REPLICA_QPS);
  const jobs = perSecond * 0.05;                // emails, image resizing...
  const workers = jobs >= 1 ? Math.ceil(jobs / WORKER_JOBS) : 0;
  const lb = servers > 1;
  const cost = servers * PRICE.server + PRICE.db + replicas * PRICE.replica
    + (useCache ? PRICE.cache : 0) + (lb ? PRICE.lb : 0)
    + (workers ? PRICE.queue + workers * PRICE.worker : 0);
  return { users, perSecond, servers, lb, useCache, replicas, workers, cost: "$" + cost + "/month" };
}

for (const users of [100, 10000, 100000, 1000000]) console.log(plan(users));
// جرّب: اجعل SERVER_RPS = 800 (كود أسرع، أو Go بدل Python). كم توفّر عند مليون مستخدم؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "موزّع الحمل بالتناوب",
      prompt: "رتّب الأسطر ليوزّع الموزّع أربعة طلبات على ثلاثة خوادم بالدور (round robin)، فيعود الرابع إلى A.",
      lines: [
        'let servers = ["A", "B", "C"];',
        "let next = 0;",
        "for (let i = 1; i <= 4; i++) {",
        '  console.log("request " + i + " -> " + servers[next]);',
        "  next = (next + 1) % servers.length;",
        "}",
      ],
      expected: "request 1 -> A\nrequest 2 -> B\nrequest 3 -> C\nrequest 4 -> A",
    },
    {
      kind: "fill",
      title: "من أين أقرأ؟",
      prompt: "المستخدم دفع للتو، والصفحة التالية يجب أن تقول paid بلا أي تأخير. النسخة لم تلحق بعد. من أين نقرأ؟",
      template: `let primary = { order7: "unpaid" };
let replica = { order7: "unpaid" };
primary.order7 = "paid";
console.log(___.order7);`,
      options: ["primary", "replica"],
      expected: "paid",
    },
    {
      kind: "fix",
      title: "جلسة تضيع",
      prompt: "سارة سجّلت دخولها، لكن الطلب التالي وصل إلى خادم آخر فصارت guest. اجعل الخوادم عديمة الحالة: احفظ الجلسات في مخزن واحد مشترك (redis) بدل ذاكرة كل خادم.",
      code: `let redis = {};
let servers = [{ name: "A", sessions: {} }, { name: "B", sessions: {} }];
let turn = 0;
function pick() {
  let s = servers[turn];
  turn = (turn + 1) % servers.length;
  return s;
}
function login(user) {
  let s = pick();
  s.sessions["t1"] = user;
  return "t1";
}
function whoAmI(token) {
  let s = pick();
  return s.sessions[token] || "guest";
}
let t = login("sara");
console.log(whoAmI(t));`,
      expected: "sara",
      hint: "الخادم ما زال يُختار بـ pick()، لكن اكتب واقرأ redis[token] بدل s.sessions[token].",
      solution: `let redis = {};
let servers = [{ name: "A", sessions: {} }, { name: "B", sessions: {} }];
let turn = 0;
function pick() {
  let s = servers[turn];
  turn = (turn + 1) % servers.length;
  return s;
}
function login(user) {
  let s = pick();
  redis["t1"] = user;
  return "t1";
}
function whoAmI(token) {
  let s = pick();
  return redis[token] || "guest";
}
let t = login("sara");
console.log(whoAmI(t));`,
    },
    {
      kind: "write",
      title: "أين عنق الزجاجة؟",
      prompt: "اكتب bottleneck(parts): لكل قطعة احسب load ÷ capacity، وأرجع اسم القطعة صاحبة أعلى نسبة إن كانت أكبر من 1، وإلا أرجع \"none\".",
      starter: `function bottleneck(parts) {
  // ratio = load / capacity; keep the biggest
  // return its name if the biggest ratio is above 1, else "none"
}
let parts = [
  { name: "api", load: 1000, capacity: 1200 },
  { name: "db", load: 1000, capacity: 300 },
  { name: "cache", load: 900, capacity: 50000 },
];
console.log(bottleneck(parts));
parts[1].load = 100; // a cache now answers 90% of reads
console.log(bottleneck(parts));`,
      expected: "db\nnone",
      hint: "ابدأ بـ let worst = null; let top = 0; ثم for (const p of parts) { let r = p.load / p.capacity; if (r > top) { top = r; worst = p.name; } }، وفي النهاية top > 1 ? worst : \"none\".",
      solution: `function bottleneck(parts) {
  let worst = null;
  let top = 0;
  for (const p of parts) {
    let r = p.load / p.capacity;
    if (r > top) {
      top = r;
      worst = p.name;
    }
  }
  return top > 1 ? worst : "none";
}
let parts = [
  { name: "api", load: 1000, capacity: 1200 },
  { name: "db", load: 1000, capacity: 300 },
  { name: "cache", load: 900, capacity: 50000 },
];
console.log(bottleneck(parts));
parts[1].load = 100; // a cache now answers 90% of reads
console.log(bottleneck(parts));`,
    },
  ],
  quiz: [
    {
      question: "ثلاثة خوادم خلف موزّع حمل، وسقط الخادم B. الموزّع يفحص صحة كل خادم (health check) قبل أن يرسل إليه. ماذا يُطبع؟",
      code: `let servers = [{ name: "A", up: true }, { name: "B", up: false }, { name: "C", up: true }];
let alive = servers.filter((s) => s.up);
let out = [];
for (let i = 0; i < 4; i++) out.push(alive[i % alive.length].name);
console.log(out.join(" "));`,
      options: ["A C A C", "A B C A", "خطأ: الخادم B ساقط"],
      answer: 0,
      why: "الموزّع يتجاوز الخادم الساقط ويوزّع على الباقين، فلا يرى المستخدمون أي عطل. هذا سبب وجود أكثر من خادم: لا قطعة واحدة إن سقطت أسقطت النظام كله. والمراقبة تنبّهك لتصلح B.",
    },
    {
      question: "1000 قراءة في الثانية، والكاش يجيب 95% منها. كم قراءة تصل إلى Postgres؟",
      code: `let reads = 1000;
let hitPercent = 95;
console.log(reads * (100 - hitPercent) / 100);`,
      options: ["50", "950", "100"],
      answer: 0,
      why: "5% فقط تفوت الكاش وتذهب إلى القاعدة. رفع نسبة الإصابة من 90% إلى 95% نصّف حمل القاعدة (من 100 إلى 50). الكاش أرخص أداة تخفيف في الصندوق، وثمنها بيانات قد تكون قديمة قليلاً.",
    },
    {
      question: "تصل 60 مهمة تصغير صور في الثانية إلى الطابور، وكل عامل ينهي 20 في الثانية، وعندنا عاملان. كم مهمة تنتظر بعد 10 ثوانٍ؟",
      code: `let arrive = 60;
let workers = 2;
let perWorker = 20;
let waiting = 0;
for (let sec = 0; sec < 10; sec++) waiting = waiting + arrive - workers * perWorker;
console.log(waiting);`,
      options: ["200", "0", "600"],
      answer: 0,
      why: "يدخل 60 ويخرج 40 كل ثانية، فيكبر الطابور 20 كل ثانية. الطابور لا يُسقط الخادم، لكنه يكشف النقص: راقب طوله، وأضف عاملاً ثالثاً فيتوقف عن النمو. هذا دور المراقبة في التصميم.",
    },
    {
      question: "أضفنا 4 نسخ قراءة (replicas). الكتابة كلها ما زالت تذهب إلى القاعدة الأساسية. كم كتابة في الثانية على الأساسية؟",
      code: `let writes = 400;
let replicas = 4;
let onPrimary = writes;
let readsPerReplica = 2000 / replicas;
console.log(onPrimary, readsPerReplica);`,
      options: ["400 500", "100 500", "80 400"],
      answer: 0,
      why: "النسخ توزّع القراءة فقط؛ كل كتابة يجب أن تصل إلى الأساسية ثم تُنسخ إلى كل نسخة. إن كان الاختناق في الكتابة فالنسخ لا تنفع: تحتاج طابوراً يجمع الكتابات، أو تقسيم البيانات على قواعد عدة (sharding).",
    },
    {
      question: "موقع فيه 100 مستخدم. صمّمه أحدهم بعشرة خوادم وثلاث نسخ وطابور. ماذا يُطبع؟",
      code: `let perSecond = 100 / 100;
let capacity = 10 * 400;
let monthly = 10 * 40 + 3 * 60 + 60 + 20 + 10;
console.log(Math.round(perSecond / capacity * 100) + "%", "$" + monthly);`,
      options: ["0% $670", "100% $670", "0% $100"],
      answer: 0,
      why: "طلب واحد في الثانية على سعة 4000: الخوادم شبه نائمة، والفاتورة 670 دولاراً شهرياً، وكل قطعة إضافية شيء آخر قد يتعطل. ابدأ بخادم وقاعدة بيانات، وقِس، وأضف القطعة حين يحمرّ مكانها فقط.",
    },
  ],
};
