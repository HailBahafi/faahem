import type { Cell, Lesson } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const num = (name: string, value: string): Cell => ({ name, value, type: "number" });
const flag = (name: string, value: string): Cell => ({ name, value, type: "none" });

/** The dashboard after each moment: clock, health check, three metrics, the alert. */
const dash = (time: string, health: string, rps: string, err: string, p95: string, alert: string): Cell[] => [
  s("time", time),
  s("health", health),
  num("rps", rps),
  num("error_rate", err),
  num("p95_ms", p95),
  flag("alert", alert),
];

const L1 = "10:00 INFO  GET /products 200 84ms";
const L2 = "10:03 INFO  deploy shop:c9d started";
const L3 = "10:04 ERROR POST /checkout 500 TypeError: Cannot read 'price' of undefined (cart.js:42)";

export const monitoring: Lesson = {
  slug: "monitoring",
  stage: 11,
  number: "11.4",
  title: "المراقبة",
  subtitle: "اعرف أن التطبيق معطوب قبل أن يخبرك المستخدمون: سجلات، وأرقام، وفحص صحة، وتنبيه",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "شيء ما خطأ. ما هو؟",
    body: "هذه لوحة خدمة حقيقية الشكل. حرّك الأشرطة: ازدحام، قاعدة بيانات بطيئة، انهيار. راقب الرسوم وانتظر التنبيه. ثم اضغط «حادث غامض»: السبب مخفي، وعليك أن تجده في السجلات.",
    demo: "monitoring",
  },
  scene: {
    code: {
      text: `health_check:
  url: https://shop.example/api/health
  every: 1m
  expect: 200
metrics:
  - requests_per_second
  - error_rate
  - latency_p95
alert:
  when: error_rate > 5% for 5m
  notify: phone`,
    },
    notes: {
      text: "هذا ملف إعداد لخدمة مراقبة خيالية بصيغة YAML. الأدوات الحقيقية (Prometheus و Grafana، أو خدمات مثل UptimeRobot و Sentry) تكتب الأفكار نفسها بأسماء مختلفة: ماذا تفحص، كل كم، ومتى توقظك.",
    },
    steps: [
      {
        line: null,
        say: "المتجر يعمل على الخادم، والمستخدمون يشترون. أنت نائم. هذا الملف يقول لخدمة مراقبة خارجية ماذا تراقب نيابة عنك. الساعة 10:00 وكل شيء هادئ.",
        memory: dash("10:00", "?", "40", "0.5", "180", "off"),
      },
      {
        line: 2,
        say: "فحص الصحة: كل دقيقة يطلب المراقب /api/health من خارج الخادم، كما يفعل أي زائر. هذا المسار في تطبيقنا يسأل قاعدة البيانات SELECT 1 ثم يجيب.",
        memory: dash("10:00", "200 ok", "40", "0.5", "180", "off"),
        changed: ["health"],
        output: ["10:00 CHECK /api/health 200 {ok: true, db: up}"],
      },
      {
        line: 6,
        say: "المقاييس أرقام تُسجَّل كل دقيقة لتصير خطاً عبر الزمن: 40 طلباً في الثانية، ونصف بالمئة أخطاء، و 95% من الطلبات تنتهي في أقل من 180ms.",
        memory: dash("10:00", "200 ok", "40", "0.5", "180", "off"),
        read: ["rps", "error_rate", "p95_ms"],
        output: ["10:00 CHECK /api/health 200 {ok: true, db: up}"],
      },
      {
        line: 7,
        say: "وكل طلب يكتب سطراً في السجل (درس Linux): الوقت، المستوى، وما حدث. السجل يقول «ماذا» بالتفصيل، والمقياس يقول «كم» باختصار.",
        memory: dash("10:00", "200 ok", "40", "0.5", "180", "off"),
        output: ["10:00 CHECK /api/health 200 {ok: true, db: up}", L1],
      },
      {
        line: 10,
        say: "10:04، بعد نشر جديد: error_rate قفز إلى 8%. الشرط 8 > 5 صحيح، لكن for 5m يطلب أن يبقى صحيحاً خمس دقائق. لا تنبيه بعد: قفزة لحظية لا تستحق أن توقظك.",
        memory: dash("10:04", "200 ok", "40", "8", "190", "pending 1m"),
        changed: ["time", "error_rate", "alert"],
        read: ["error_rate"],
        output: ["10:00 CHECK /api/health 200 {ok: true, db: up}", L1, L2],
      },
      {
        line: 10,
        say: "10:09: خمس دقائق والنسبة فوق 5% بلا انقطاع. الشرط تحقق كاملاً، فينتقل التنبيه من الانتظار إلى الإطلاق.",
        memory: dash("10:09", "200 ok", "40", "8", "190", "firing"),
        changed: ["time", "alert"],
        read: ["error_rate"],
        output: ["10:00 CHECK /api/health 200 {ok: true, db: up}", L1, L2],
      },
      {
        line: 11,
        say: "رسالة تصل إلى هاتفك. لاحظ أن فحص الصحة ما زال 200: الخادم حيّ وقاعدة البيانات تجيب، لكن الدفع معطوب. فحص الصحة يرى «هل هو حيّ؟» لا «هل كل شيء صحيح؟».",
        memory: dash("10:09", "200 ok", "40", "8", "190", "firing"),
        read: ["health", "alert"],
        output: ["10:00 CHECK /api/health 200 {ok: true, db: up}", L1, L2, "10:09 ALERT error_rate 8% > 5% for 5m → phone"],
      },
      {
        line: 7,
        say: "التشخيص يبدأ من التنبيه إلى المقياس: لوحة error_rate تُظهر أن الصعود بدأ عند 10:04 تماماً، وأن الأخطاء كلها على /checkout. p95 لم يتغيّر، فالمشكلة ليست بطئاً.",
        memory: dash("10:09", "200 ok", "40", "8", "190", "firing"),
        read: ["error_rate", "p95_ms"],
        output: ["10:00 CHECK /api/health 200 {ok: true, db: up}", L1, L2, "10:09 ALERT error_rate 8% > 5% for 5m → phone"],
      },
      {
        line: null,
        say: "ثم من المقياس إلى السجلات: نصفّي المستوى ERROR حول 10:04، فنجد السبب بالسطر ورقم الملف، وقبله بدقيقة سطر النشر. الحل الأسرع: التراجع إلى النسخة السابقة (درس CI/CD).",
        memory: dash("10:09", "200 ok", "40", "8", "190", "firing"),
        output: ["10:00 CHECK /api/health 200 {ok: true, db: up}", L1, L2, "10:09 ALERT error_rate 8% > 5% for 5m → phone", L3],
      },
      {
        line: 10,
        say: "10:12 بعد التراجع: error_rate عاد إلى 0.5%، والشرط 0.5 > 5 خاطئ، فيُحلّ التنبيه وحده. عرفت بالعطل قبل أن يكتب لك أي مستخدم.",
        memory: dash("10:12", "200 ok", "40", "0.5", "180", "resolved"),
        changed: ["time", "error_rate", "alert"],
        read: ["error_rate"],
        output: ["10:00 CHECK /api/health 200 {ok: true, db: up}", L1, L2, "10:09 ALERT error_rate 8% > 5% for 5m → phone", L3, "10:12 RESOLVED error_rate 0.5%"],
      },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذه دقيقة من حياة الخادم: قائمة طلبات، لكل منها مسار وحالة ومدة. الكود يحوّل السجل إلى مقاييس كما تفعل أدوات المراقبة: نسبة الأخطاء، و p95 (الزمن الذي لا يتجاوزه 95% من الطلبات؛ مع طلبات قليلة هو أبطؤها)، ثم يقرّر هل يطلق التنبيه.",
    starter: `let requests = [
  { path: "/products", status: 200, ms: 80 },
  { path: "/cart", status: 200, ms: 120 },
  { path: "/checkout", status: 500, ms: 95 },
  { path: "/products", status: 200, ms: 70 },
  { path: "/checkout", status: 200, ms: 900 }
];
let errors = 0;
let p95 = 0; // under 20 requests, p95 is simply the slowest one
for (let i = 0; i < requests.length; i++) {
  if (requests[i].status >= 500) errors = errors + 1;
  if (requests[i].ms > p95) p95 = requests[i].ms;
}
let errorRate = (errors / requests.length) * 100;
console.log("error_rate", errorRate, "p95", p95);
if (errorRate > 5) {
  console.log("ALERT: error rate", errorRate);
}`,
    challenges: [
      "غيّر حالة طلب /checkout الأول إلى 200. توقّع قبل أن تضغط: هل يُطلق التنبيه؟",
      "أضف أربعة طلبات سريعة ناجحة (status: 200, ms: 50). هل تغيّر p95؟ لماذا يبقى البطيء ظاهراً؟",
      "اطبع المتوسط أيضاً: اجمع ms في متغير sum داخل الحلقة واقسم على requests.length. قارنه بـ p95: أيهما يُخبرك عن المستخدم الذي انتظر 900ms؟",
      "غيّر الحدّ من 5 إلى 25. كم خطأ يحتاج الآن ليوقظك؟ هل هذا حدّ جيد لمتجر؟",
    ],
  },
  predict: [
    {
      question: "التنبيه يطلب error_rate > 5 لثلاث دقائق متتالية. هل يُطلق مع هذه القراءات؟",
      code: `let readings = [2, 9, 3, 7, 1];
let streak = 0;
let fired = false;
for (let i = 0; i < readings.length; i++) {
  if (readings[i] > 5) streak = streak + 1;
  else streak = 0;
  if (streak >= 3) fired = true;
}
console.log(fired, streak);`,
      options: ["true 0", "false 0", "true 2"],
      answer: 1,
      why: "قفزتان فوق 5، لكن كل واحدة تبعتها قراءة هادئة تعيد العدّاد إلى صفر. شرط المدة يتجاهل القفزات اللحظية ولا يوقظك إلا لمشكلة مستمرة.",
    },
    {
      question: "فحص الصحة يسأل قاعدة البيانات فقط. نصف طلبات الدفع تفشل. ماذا يرى المراقب؟",
      code: `function health(db) {
  if (db === "up") return 200;
  return 503;
}
let checkoutFailures = 12;
let db = "up";
console.log(health(db));`,
      options: ["503", "200", "500"],
      answer: 1,
      why: "الفحص يجيب عن السؤال الذي كُتب له: هل الخادم حيّ وقاعدة البيانات تجيب؟ نعم. أخطاء الدفع لا يراها إلا مقياس error_rate أو السجلات. لذلك نحتاج الأدوات معاً.",
    },
    {
      question: "تسعة طلبات أخذت 100ms وطلب واحد 3000ms. ماذا يُطبع؟",
      code: `let times = [100, 100, 100, 100, 100, 100, 100, 100, 100, 3000];
let sum = 0;
for (let i = 0; i < times.length; i++) sum = sum + times[i];
let avg = sum / times.length;
let p95 = times[Math.ceil(times.length * 0.95) - 1];
console.log(avg, p95);`,
      options: ["100 100", "390 3000", "390 100"],
      answer: 1,
      why: "المتوسط 390 رقم لم يعشه أي مستخدم: تسعة انتظروا 100، وواحد انتظر 3 ثوانٍ. p95 يقول «أبطأ 5% انتظروا هذا على الأقل»، فيكشف البطء الذي يخفيه المتوسط.",
    },
  ],
  code: {
    intro: "المراقبة تبدأ من تطبيقك: مسار صحة يفحص ما يحتاجه فعلاً، وسجلات منظّمة بمستوى واضح. هذا مسار /api/health في هذا التطبيق نفسه، وتحته أسطر سجل كما يجب أن تبدو، وأوامر تقرؤها على الخادم.",
    runnerLang: "text",
    runnerStarter: `// src/app/api/health/route.ts  (this app's real health check)
export async function GET() {
  try {
    await db()\`SELECT 1\`;                         // can we reach the database?
    return json({ ok: true, db: "up" });
  } catch {
    return json({ ok: false, db: "down" }, 503);  // the monitor sees 503 and counts a failure
  }
}

// structured log lines: time, level, what happened, with numbers
// 10:04:12 INFO  POST /checkout 200 132ms user=81
// 10:04:13 WARN  slow query 1840ms orders by user_id
// 10:04:15 ERROR POST /checkout 500 TypeError at cart.js:42

# on the server (Linux lesson)
curl -i https://shop.example/api/health      # what the monitor sees
journalctl -u shop -p err --since "10 min ago" # only the errors, recent
docker compose logs --tail 50 web              # the last lines of the container
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "من التنبيه إلى السبب",
      prompt: "رنّ هاتفك في منتصف الليل. رتّب ما تفعله حتى يعود كل شيء طبيعياً.",
      lines: [
        "اقرأ التنبيه: أي مقياس تجاوز أي حدّ",
        "افتح لوحة ذلك المقياس: متى بدأ، وعلى أي مسار",
        "صفِّ السجلات على ERROR حول تلك الدقيقة",
        "أصلح أو تراجع إلى النسخة السابقة",
        "راقب المقياس حتى يعود تحت الحدّ ويُحلّ التنبيه",
      ],
      expected: "RESOLVED",
    },
    {
      kind: "fill",
      lang: "text",
      title: "مستوى السطر",
      prompt: "فشل دفع مستخدم بخطأ 500. أي مستوى يستحقه هذا السطر في السجل؟",
      template: '___ POST /checkout 500 "payment failed" user=81',
      options: ["INFO", "ERROR", "DEBUG"],
      answer: "ERROR",
      expected: "ERROR POST /checkout 500",
    },
    {
      kind: "fix",
      title: "تنبيه يوقظ على كل قفزة",
      prompt: "هذا التنبيه يُطلق لأن قراءة واحدة تجاوزت 5. أصلحه حتى يُطلق فقط إذا بقيت النسبة فوق 5 لثلاث قراءات متتالية. مع هذه القراءات يجب أن يطبع quiet.",
      code: `let readings = [1, 8, 2, 1, 2];
let fired = false;
for (let i = 0; i < readings.length; i++) {
  if (readings[i] > 5) fired = true;
}
console.log(fired ? "ALERT" : "quiet");`,
      expected: "quiet",
      hint: "عُدّ القراءات المتتالية في streak: زِده عند > 5، وأرجعه إلى 0 غير ذلك، وأطلق حين يبلغ 3.",
      solution: `let readings = [1, 8, 2, 1, 2];
let fired = false;
let streak = 0;
for (let i = 0; i < readings.length; i++) {
  if (readings[i] > 5) streak = streak + 1;
  else streak = 0;
  if (streak >= 3) fired = true;
}
console.log(fired ? "ALERT" : "quiet");`,
    },
    {
      kind: "write",
      title: "من الحالات إلى نسبة",
      prompt: "statuses رموز حالة عشرين طلباً. احسب نسبة الأخطاء (كل رمز 500 فأكثر) كنسبة مئوية، واطبعها هكذا: error_rate: 15 ثم اطبع ALERT إن كانت أكبر من 5.",
      starter: `let statuses = [200, 200, 500, 200, 200, 503, 200, 200, 200, 200,
                200, 404, 200, 200, 500, 200, 200, 200, 200, 200];
// احسب نسبة الأخطاء، اطبعها، ثم اطبع ALERT إن تجاوزت 5
`,
      expected: "error_rate: 15\nALERT",
      hint: "404 خطأ من المستخدم لا من الخادم، فلا يُعدّ. عُدّ ما كان >= 500، ثم (errors / statuses.length) * 100.",
      solution: `let statuses = [200, 200, 500, 200, 200, 503, 200, 200, 200, 200,
                200, 404, 200, 200, 500, 200, 200, 200, 200, 200];
let errors = 0;
for (let i = 0; i < statuses.length; i++) {
  if (statuses[i] >= 500) errors = errors + 1;
}
let rate = (errors / statuses.length) * 100;
console.log("error_rate:", rate);
if (rate > 5) console.log("ALERT");`,
    },
  ],
  quiz: [
    {
      question: "فحص الصحة أخضر طوال الليل، لكن المستخدمين لم يستطيعوا الدفع ساعتين. ما الذي كان سيكشف ذلك؟",
      options: ["فحص صحة كل 10 ثوانٍ بدل كل دقيقة", "تنبيه على error_rate لمسار /checkout", "زيادة ذاكرة الخادم"],
      answer: 1,
      why: "فحص الصحة يجيب «هل الخادم حيّ؟» وكان حيّاً. الخطأ كان في مسار واحد، ولا يظهر إلا في مقياس الأخطاء أو في السجلات. تكرار الفحص نفسه لا يرى ما لا يسأل عنه.",
    },
    {
      question: "عند 10:15 قفز p95 من 200ms إلى 2400ms، وبقي error_rate ثابتاً، والطلبات في الثانية ثابتة. وفي السجلات: WARN slow query 2300ms. أين المشكلة الأرجح؟",
      options: ["ازدحام مفاجئ في الزوار", "قاعدة البيانات بطيئة", "خطأ برمجي في آخر نشر يرمي 500"],
      answer: 1,
      why: "الزوار لم يزيدوا (rps ثابت)، والأخطاء لم تزد، فلا ازدحام ولا استثناءات. الطلبات تنجح لكن ببطء، والسجل يشير إلى استعلام. كل مقياس يستبعد احتمالاً، والسجل يسمّي المتهم.",
    },
    {
      question: "أي سطر سجل هو الأنفع حين تبحث عن سبب عطل؟",
      options: [
        "ERROR something went wrong",
        "10:04:15 ERROR POST /checkout 500 TypeError at cart.js:42 user=81",
        "10:04:15 checkout",
      ],
      answer: 1,
      why: "السطر النافع يجيب: متى، بأي خطورة، على أي مسار، بأي خطأ، وأين في الكود. بهذا تربط السطر بدقيقة القفزة في اللوحة وتقفز مباشرة إلى cart.js.",
    },
    {
      question: "تنبيه: CPU > 80% لدقيقة. يرنّ هاتفك عشرين مرة في اليوم، والموقع سليم في كل مرة. ما المشكلة؟",
      options: ["لا مشكلة، التنبيهات الكثيرة أأمن", "التنبيه يراقب سبباً محتملاً لا أثراً يشعر به المستخدم، وبلا مدة كافية", "يجب حذف كل التنبيهات"],
      answer: 1,
      why: "تنبيه يرنّ بلا عطل يعلّمك أن تتجاهله، فتتجاهل الحقيقي حين يأتي. نبّه على ما يؤذي المستخدم (أخطاء، بطء، فحص صحة فاشل) مع مدة، واجعل CPU لوحة تنظر إليها أثناء التشخيص.",
    },
    {
      question: "الذاكرة ترتفع ببطء منذ يومين: 40% ثم 60% ثم 85%، ثم يسقط الخادم ويعود إلى 40%، وتتكرر الدورة. ما الذي يكشف هذا النمط؟",
      options: ["سطر سجل واحد", "رسم الذاكرة عبر الزمن في اللوحة", "فحص الصحة"],
      answer: 1,
      why: "كل قراءة وحدها تبدو عادية. النمط (صعود منتظم ثم سقوط ثم صعود) لا يظهر إلا في رسم عبر الزمن: هذا تسرّب ذاكرة. لهذا تحفظ المقاييس تاريخها، واللوحات تُظهر الاتجاه.",
    },
  ],
  next: "testing",
};
