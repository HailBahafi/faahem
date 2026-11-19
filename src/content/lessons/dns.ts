import type { Cell, Lesson } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const none = (name: string): Cell => ({ name, value: "undefined", type: "none" });

const IP = "93.184.216.34";

export const dns: Lesson = {
  slug: "dns",
  stage: 5,
  number: "5.2",
  title: "DNS",
  subtitle: "دليل هاتف الإنترنت: من اسم تتذكره إلى رقم يفهمه الجهاز",
  minutes: 14,
  singleLanguage: true,
  problem: {
    title: "أنت تتذكر أسماء، والإنترنت يعرف أرقاماً",
    body: "اكتب اسم موقع واضغط ابحث، وشاهد من يُسأل وبأي ترتيب حتى يظهر الرقم. ثم ابحث عن الاسم نفسه مرة ثانية وقارن عدد الرحلات.",
    demo: "dns",
  },
  scene: {
    code: {
      text: `browser  -> resolver:  example.com ?
resolver cache:  no example.com
resolver -> root:  who handles .com ?    <- "ask the .com servers"
resolver -> .com:  who handles example.com ?  <- "ask ns1.example.com"
resolver -> ns1.example.com:  IP of example.com ?  <- 93.184.216.34
resolver cache:  example.com = 93.184.216.34  (TTL 300 s)
browser  -> 93.184.216.34  (now the packets can go)
browser  -> resolver:  example.com ?  <- cache hit, 0 trips`,
    },
    notes: {
      text: "هذا سجلّ بحث DNS واحد، ليس برنامجاً يُشغَّل. كل سطر سؤال وجواب بين جهازين، والأدراج هي ما يعرفه الـ resolver بعد كل سطر.",
    },
    steps: [
      {
        line: null,
        say: "في الدرس السابق احتاجت كل حزمة عنوان IP مثل 93.184.216.34. لكنك تكتب example.com. لا بد من أحد يحوّل الاسم إلى رقم: هذا هو DNS، دليل هاتف الإنترنت.",
        memory: [],
      },
      {
        line: 1,
        say: "المتصفح لا يبحث بنفسه. يسأل الـ resolver، وهو خادم قريب (عند مزوّد الإنترنت أو 8.8.8.8) وظيفته أن يجد الجواب نيابة عنك.",
        memory: [s("name", "example.com"), n("trips", 0)],
        changed: ["name", "trips"],
      },
      {
        line: 2,
        say: "أول شيء: ينظر في ذاكرته المؤقتة (cache)، وهي جدول تجزئة: الاسم مفتاح والـ IP قيمة. المفتاح غير موجود، فلا بد من الرحلة.",
        memory: [s("name", "example.com"), n("trips", 0), none("cache[name]")],
        read: ["cache[name]"],
      },
      {
        line: 3,
        say: "يسأل خادم الجذر (root). الجذر لا يعرف IP أي موقع، يعرف فقط من يدير كل نهاية: .com و .org و .sa. فيرد: اسأل خوادم .com.",
        memory: [s("name", "example.com"), n("trips", 1), none("cache[name]"), s("next", ".com servers")],
        changed: ["trips", "next"],
      },
      {
        line: 4,
        say: "خوادم .com لا تعرف الرقم أيضاً، لكنها تعرف من يدير example.com: خادمه الخاص ns1.example.com. كل مستوى يدلّك على المستوى الأدنى، كالشجرة.",
        memory: [s("name", "example.com"), n("trips", 2), none("cache[name]"), s("next", "ns1.example.com")],
        changed: ["trips", "next"],
        read: ["next"],
      },
      {
        line: 5,
        say: "خادم الموقع نفسه (authoritative) هو صاحب الجواب الأكيد: الرقم 93.184.216.34. ثلاث رحلات بين خوادم في قارات مختلفة.",
        memory: [s("name", "example.com"), n("trips", 3), none("cache[name]"), s("ip", IP)],
        changed: ["trips", "ip"],
        read: ["next"],
      },
      {
        line: 6,
        say: "يحفظ الـ resolver الجواب في جدوله مع عمر محدود TTL، هنا 300 ثانية. الجواب نفسه قال كم يجوز الاحتفاظ به.",
        memory: [s("name", "example.com"), n("trips", 3), s("cache[name]", IP), s("ip", IP), n("ttl", 300)],
        changed: ["cache[name]", "ttl"],
      },
      {
        line: 7,
        say: "الآن فقط يعرف المتصفح أين يرسل حزمه. كل ما تعلمته في درس الحزم يبدأ بعد هذا السطر.",
        memory: [s("name", "example.com"), n("trips", 3), s("cache[name]", IP), s("ip", IP), n("ttl", 300)],
        read: ["ip"],
      },
      {
        line: 8,
        say: "بحث ثانٍ عن الاسم نفسه خلال 300 ثانية: الـ resolver يقفز إلى المفتاح في جدوله فيجده. صفر رحلات، جواب فوري. لهذا معظم عمليات DNS لا تكلّف شيئاً تقريباً.",
        memory: [s("name", "example.com"), n("trips", 3), s("cache[name]", IP), s("ip", IP), n("ttl", 300)],
        read: ["cache[name]"],
      },
    ],
  },
  playground: {
    kind: "trace",
    intro: "ذاكرة الـ resolver المؤقتة ككائن JavaScript: الاسم مفتاح، والقيمة الرقم ووقت انتهاء صلاحيته. askServers تمثّل الرحلات الثلاث إلى الجذر ثم .com ثم خادم الموقع.",
    starter: `let cache = {};
let trips = 0;
function askServers(name) {
  trips = trips + 3; // root, then .com, then the site's own server
  return "93.184.216.34";
}
function resolve(name, now) {
  let hit = cache[name];
  if (hit && now < hit.expires) {
    return hit.ip;
  }
  let ip = askServers(name);
  cache[name] = { ip: ip, expires: now + 300 };
  return ip;
}
console.log(resolve("example.com", 0), trips);
console.log(resolve("example.com", 10), trips);
console.log(resolve("example.com", 400), trips);`,
    challenges: [
      "قبل أن تشغّل: كم ستكون trips بعد كل سطر من الأسطر الثلاثة الأخيرة؟",
      "غيّر 400 إلى 299. هل يبقى الجواب في الذاكرة؟ وماذا عن 300 بالضبط؟",
      "أضف سطراً يبحث عن \"news.com\" عند الوقت 20. هل يفيده أن example.com محفوظ؟",
      "غيّر 300 إلى 0 في السطر 13. ماذا يحدث للذاكرة المؤقتة؟",
    ],
  },
  predict: [
    {
      question: "بحثنا عن الاسم نفسه ثلاث مرات متتالية. ماذا يُطبع؟",
      code: `let cache = {};
let trips = 0;
function resolve(name) {
  if (cache[name]) return cache[name];
  trips = trips + 3;
  cache[name] = "93.184.216.34";
  return cache[name];
}
resolve("example.com");
resolve("example.com");
resolve("example.com");
console.log(trips);`,
      options: ["3", "9", "0"],
      answer: 0,
      why: "أول بحث فقط يمشي إلى الجذر ثم .com ثم خادم الموقع. بعدها الاسم مفتاح في الجدول، والبحثان التاليان يجدانه مباشرة بلا أي رحلة.",
    },
    {
      question: "نسأل الجذر مباشرة عن رقم example.com. ماذا يُطبع؟",
      code: `let root = { com: "ask .com servers", org: "ask .org servers", sa: "ask .sa servers" };
let name = "example.com";
let parts = name.split(".");
let ending = parts[parts.length - 1];
console.log(root[name], root[ending]);`,
      options: ["undefined ask .com servers", "93.184.216.34 ask .com servers", "ask .com servers ask .com servers"],
      answer: 0,
      why: "الجذر لا يحفظ أسماء المواقع، فهي مليارات. يعرف النهايات فقط (com و org و sa)، فلا جواب عنده لـ example.com، لكن عنده من تسأل بعده. كل مستوى يعرف القليل ويدلّك على من يعرف أكثر.",
    },
    {
      question: "حُفظ الجواب عند الثانية 0 مع TTL قدره 60. ماذا يُطبع عند الثانية 100؟",
      code: `let entry = { ip: "93.184.216.34", expires: 0 + 60 };
let now = 100;
if (now < entry.expires) {
  console.log("from cache", entry.ip);
} else {
  console.log("expired, ask again");
}`,
      options: ["expired, ask again", "from cache 93.184.216.34", "لا شيء"],
      answer: 0,
      why: "الجواب في الذاكرة له عمر. 100 ليس أصغر من 60، فقد انتهت صلاحيته ولا بد من رحلة جديدة. لهذا إذا غيّر موقع رقمه، يصلك الرقم الجديد بعد أن ينتهي TTL القديم.",
    },
  ],
  code: {
    intro: "هنا الشجرة كاملة: الجذر يدلّ على خادم النهاية، وخادم النهاية يدلّ على خادم الموقع، وخادم الموقع يعطي الرقم. شغّل وراقب الرحلات، ثم لاحظ أن البحث الثاني لا يمشي أي خطوة. وفي الطرفية الحقيقية جرّب: nslookup example.com",
    runnerStarter: `let root = { com: "tld-com", sa: "tld-sa" };
let servers = {
  "tld-com": { "example.com": "ns1.example.com", "news.com": "ns.news.com" },
  "tld-sa": { "faahem.sa": "ns.faahem.sa" },
  "ns1.example.com": { "example.com": "93.184.216.34" },
  "ns.news.com": { "news.com": "151.101.1.1" },
  "ns.faahem.sa": { "faahem.sa": "185.20.30.40" },
};
let cache = new Map();

function resolve(name) {
  if (cache.has(name)) {
    console.log(name, "from cache:", cache.get(name));
    return cache.get(name);
  }
  let ending = name.split(".").pop();
  let tld = root[ending];
  console.log("  root says: ask", tld);
  let ns = servers[tld][name];
  console.log("  " + tld, "says: ask", ns);
  let ip = servers[ns][name];
  console.log("  " + ns, "says:", ip);
  cache.set(name, ip);
  return ip;
}

console.log("example.com =", resolve("example.com"));
console.log("faahem.sa =", resolve("faahem.sa"));
resolve("example.com");
// جرّب: ابحث عن news.com. أي خادم نهاية سيُسأل؟
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "من يُسأل أولاً؟",
      prompt: "الذاكرة المؤقتة فارغة. رتّب خطوات البحث عن رقم shop.com.",
      lines: [
        "browser asks the resolver: shop.com ?",
        "resolver checks its cache: not there",
        "root: ask the .com servers",
        ".com servers: ask ns1.shop.com",
        "ns1.shop.com: 104.18.2.7",
        "resolver saves it with its TTL and answers the browser",
      ],
      expected: "",
    },
    {
      kind: "fill",
      lang: "text",
      title: "من يعرف من؟",
      prompt: "الـ resolver يريد أن يعرف من يدير النهاية .sa. من يسأل؟",
      template: "resolver -> ___ :  who handles .sa ?",
      options: ["root", "ns1.example.com", "the browser"],
      answer: "root",
      expected: "root",
    },
    {
      kind: "fix",
      title: "ذاكرة لا تُستعمل",
      prompt: "الـ resolver يحفظ الجواب لكنه يمشي الرحلة كل مرة، فيطبع 6. أصلحه حتى يطبع 3 (رحلة واحدة كاملة، ثم الذاكرة).",
      code: `let cache = {};
let trips = 0;
function resolve(name) {
  if (cache["name"]) return cache["name"];
  trips = trips + 3;
  cache[name] = "93.184.216.34";
  return cache[name];
}
resolve("example.com");
resolve("example.com");
console.log(trips);`,
      expected: "3",
      hint: "انظر إلى المفتاح الذي يُقرأ والمفتاح الذي يُكتب. \"name\" بين علامتي تنصيص نص ثابت، لا قيمة المتغير.",
      solution: `let cache = {};
let trips = 0;
function resolve(name) {
  if (cache[name]) return cache[name];
  trips = trips + 3;
  cache[name] = "93.184.216.34";
  return cache[name];
}
resolve("example.com");
resolve("example.com");
console.log(trips);`,
    },
    {
      kind: "write",
      title: "عدّاد الرحلات",
      prompt: "names قائمة بحث. كل اسم يُبحث عنه أول مرة يكلّف 3 رحلات، والمكرر يأتي من الذاكرة بلا رحلات. اطبع مجموع الرحلات (يجب أن يظهر 6).",
      starter: `let names = ["a.com", "b.sa", "a.com", "a.com", "b.sa"];
let cache = {};
let trips = 0;
// لكل اسم: إن لم يكن في cache أضف 3 واحفظه
`,
      expected: "6",
      hint: "for (const name of names) ثم if (!cache[name]) { trips = trips + 3; cache[name] = true; } وبعد الحلقة console.log(trips).",
      solution: `let names = ["a.com", "b.sa", "a.com", "a.com", "b.sa"];
let cache = {};
let trips = 0;
for (const name of names) {
  if (!cache[name]) {
    trips = trips + 3;
    cache[name] = true;
  }
}
console.log(trips);`,
    },
  ],
  quiz: [
    {
      question: "الذاكرة المؤقتة فارغة. من يعطي الـ resolver رقم IP الخاص بـ news.sa في النهاية؟",
      options: ["خادم news.sa نفسه (authoritative)", "خادم الجذر", "خوادم .sa"],
      answer: 0,
      why: "الجذر يدلّ على خوادم .sa، وخوادم .sa تدلّ على خادم news.sa، وهو وحده يعرف رقمه. كل مستوى يعرف من تحته فقط.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'let cache = { "example.com": "93.184.216.34" };\nlet trips = 0;\nfor (const name of ["example.com", "new.sa", "example.com"]) {\n  if (!cache[name]) {\n    trips = trips + 3;\n    cache[name] = "1.2.3.4";\n  }\n}\nconsole.log(trips);',
      options: ["3", "9", "6"],
      answer: 0,
      why: "example.com موجود في الجدول من قبل، فيُقرأ مرتين بلا رحلة. new.sa وحده جديد فيكلّف 3 رحلات ثم يُحفظ.",
    },
    {
      question: "موقع غيّر خادمه إلى IP جديد، و TTL القديم كان 3600 ثانية. صديقك زار الموقع قبل دقيقة من التغيير. ماذا يرى الآن؟",
      options: ["قد يذهب إلى الرقم القديم حتى ينتهي الـ TTL", "يرى الرقم الجديد فوراً", "لا يفتح الموقع أبداً"],
      answer: 0,
      why: "الـ resolver حفظ الجواب القديم وصلاحيته ساعة، فيعطيه من الذاكرة دون أن يسأل. لن يمشي الرحلة من جديد حتى ينتهي عمره.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'let root = { com: "tld-com", sa: "tld-sa" };\nlet name = "faahem.sa";\nconsole.log(root[name.split(".").pop()]);',
      options: ["tld-sa", "undefined", "faahem.sa"],
      answer: 0,
      why: "split(\".\") يقطع الاسم إلى faahem و sa، و pop يعطي النهاية sa. الجذر يعرف النهايات فقط، فيدلّك على خوادم sa.",
    },
    {
      question: "كتبت example.com في المتصفح. أيهما يحدث أولاً؟",
      options: ["بحث DNS عن الرقم، ثم إرسال الحزم إليه", "إرسال الحزم، ثم بحث DNS", "يحدثان معاً"],
      answer: 0,
      why: "الحزم تحتاج عنوان وجهة رقمياً على كل واحدة منها. قبل أن يُعرف الرقم لا يعرف أي موجّه أين يدفع الحزمة، لذلك DNS أول خطوة في كل زيارة.",
    },
  ],
  next: "http",
};
