import type { Lesson } from "@/lib/types";

export const hash: Lesson = {
  slug: "hash",
  stage: 3,
  number: "3.5",
  title: "جدول التجزئة",
  subtitle: "دالة تحوّل المفتاح إلى رقم، والرقم يدلّك على الدلو مباشرة",
  minutes: 18,
  problem: {
    title: "دفتر هاتف بلا فهرس",
    body: "اكتب أسماء وأضفها. ثم ابحث عن اسم مرتين: مرة في قائمة عادية تُفحص اسماً اسماً، ومرة في دلاء تقفز إليها مباشرة. قارن عدد الفحوص.",
    demo: "hash",
  },
  scene: {
    trace: true,
    steps: [],
    code: {
      js: `let buckets = [[], [], []];
function put(key, value) {
  buckets[key % 3].push({ key: key, value: value });
}
put(10, "Sara");
put(5, "Omar");
put(7, "Huda");
let b = buckets[7 % 3];
console.log(b[0].value, b[1].value);`,
      py: `buckets = [[], [], []]
def put(key, value):
    buckets[key % 3].append({"key": key, "value": value})

put(10, "Sara")
put(5, "Omar")
put(7, "Huda")
b = buckets[7 % 3]
print(b[0]["value"], b[1]["value"])`,
      go: `buckets := make([][]Entry, 3)
put := func(key int, value string) {
	buckets[key%3] = append(buckets[key%3], Entry{key, value})
}
put(10, "Sara")
put(5, "Omar")
put(7, "Huda")
b := buckets[7%3]
fmt.Println(b[0].Value, b[1].Value)`,
    },
    notes: {
      js: "الجدول هنا مصفوفة دلاء، وكل دلو مصفوفة صغيرة. key % 3 هي دالة التجزئة: باقي القسمة على عدد الدلاء يعطي رقماً بين 0 و 2 دائماً. 10 و 7 باقيهما 1، فوقعا في الدلو نفسه: هذا تصادم.",
      py: "في Python الدلو قائمة نضيف إليها بـ append، وكل مدخل dict فيه المفتاح والقيمة. والـ dict نفسه الذي تكتبه كل يوم مبني على هذه الفكرة من الداخل.",
      go: "Go يحتاج نوعاً معلناً للمدخل (Entry فيه Key و Value، مُعرَّف في مكان آخر). append ترجع الشريحة الجديدة فنعيد تخزينها في الدلو. و map في Go جدول تجزئة جاهز.",
    },
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "جدول تجزئة حقيقي للأسماء. hash_key تجمع رموز الحروف (ord يعطي رقم الحرف) ثم تأخذ الباقي على 5. put تضع الاسم في دلوه، و get تقفز إلى الدلو نفسه وتفحص ما فيه فقط. شغّل وراقب الكومة.",
    starter: `buckets = [[], [], [], [], []]

def hash_key(name):
    total = 0
    for ch in name:
        total = total + ord(ch)
    return total % 5

def put(name, phone):
    buckets[hash_key(name)].append([name, phone])

def get(name):
    for pair in buckets[hash_key(name)]:
        if pair[0] == name:
            return pair[1]
    return None

put("Sara", "0551")
put("Omar", "0552")
print(get("Omar"))`,
    challenges: [
      "رمز S هو 83 و a هو 97 و r هو 114. احسب hash_key(\"Sara\") بيدك، ثم شغّل وتحقّق من الدلو الذي وقع فيه.",
      "أضف put(\"Huda\", \"0553\"). في أي دلو ستقع؟ توقّع قبل أن تضغط، ثم انظر من يشاركها الدلو.",
      "اطبع get(\"Ali\"). كم دلواً ستفحص get قبل أن ترجع None؟",
      "غيّر عدد الدلاء إلى 2 (في القائمة وفي % 5). ماذا يحدث للدلاء حين تكثر التصادمات؟",
    ],
  },
  predict: [
    {
      question: "4 و 7 يقعان في الدلو نفسه. ماذا يطبع البرنامج؟",
      code: `let buckets = [[], [], []];
function put(key, value) {
  buckets[key % 3].push(value);
}
put(4, "A");
put(7, "B");
console.log(buckets[1].length);`,
      options: ["2", "1", "0"],
      answer: 0,
      why: "4 % 3 = 1 و 7 % 3 = 1، فالمفتاحان لهما الدلو نفسه. التصادم لا يمسح القديم: الدلو قائمة صغيرة، فيُضاف B بجانب A ويصير فيه عنصران.",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      lang: "py",
      code: `ages = {}
ages["Sara"] = 20
ages["Sara"] = 21
print(len(ages), ages["Sara"])`,
      options: ["1 21", "2 21", "2 20"],
      answer: 0,
      why: "المفتاح نفسه يعطي الرقم نفسه دائماً، فيقود إلى الدلو نفسه والمدخل نفسه. الكتابة الثانية تجد Sara موجودة فتغيّر قيمتها. المفاتيح في الجدول لا تتكرر.",
    },
    {
      question: "نبحث عن Sara في قائمة عادية. كم مقارنة تحدث؟",
      code: `let names = ["Ali", "Huda", "Omar", "Sara"];
let checks = 0;
for (const n of names) {
  checks = checks + 1;
  if (n === "Sara") break;
}
console.log(checks);`,
      options: ["4", "1", "0"],
      answer: 0,
      why: "القائمة لا تعرف أين Sara، فتبدأ من الأول وتقارن واحداً واحداً حتى تجدها في الآخر: 4 مقارنات. مع مليون اسم قد تصير مليون مقارنة، والتجزئة تقفز إلى دلو واحد.",
    },
  ],
  code: {
    intro: "مع النصوص تحتاج دالة التجزئة أن تحوّل الحروف إلى رقم أولاً. هنا نجمع رموز الحروف بـ charCodeAt ثم نأخذ الباقي. لا تبنِ هذا في عملك: كائنات JavaScript و Map و dict في Python و map في Go كلها جداول تجزئة جاهزة، بدوال تجزئة أذكى بكثير.",
    runnerStarter: `function hash(name, size) {
  let total = 0;
  for (let i = 0; i < name.length; i++) {
    total = total + name.charCodeAt(i);
  }
  return total % size;
}
let buckets = [[], [], [], [], []];
function put(name, phone) {
  buckets[hash(name, 5)].push([name, phone]);
}
function get(name) {
  for (const pair of buckets[hash(name, 5)]) {
    if (pair[0] === name) return pair[1];
  }
  return undefined;
}
put("Sara", "0551");
put("Omar", "0552");
put("Huda", "0553");
console.log(hash("Sara", 5), hash("Omar", 5), hash("Huda", 5));
console.log(get("Huda"));

// The built-in hash table does all of this for you
let phones = new Map();
phones.set("Sara", "0551");
console.log(phones.get("Sara"), phones.has("Ali"));
// جرّب: اطبع hash("ab", 5) و hash("ba", 5). لماذا يتساويان؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "إلى أي دلو؟",
      prompt: "رتّب الأسطر حتى يحسب البرنامج دلو المفتاح 8 ويضع فيه Sara، فيطبع 2 Sara.",
      lines: [
        "let buckets = [[], [], []];",
        "let key = 8;",
        "let i = key % 3;",
        'buckets[i].push("Sara");',
        "console.log(i, buckets[i][0]);",
      ],
      expected: "2 Sara",
    },
    {
      kind: "fill",
      title: "افتح بالمفتاح",
      lang: "py",
      prompt: "أي كتابة تقرأ رقم Ali من الجدول فيُطبع 0554؟",
      template: 'phones = {"Sara": "0551", "Ali": "0554"}\nprint(phones___)',
      options: ['["Ali"]', "[1]", ".Ali"],
      expected: "0554",
    },
    {
      kind: "fix",
      title: "الدلو الخطأ",
      prompt: "put تضع Omar، لكن get لا تجده وتطبع missing. أصلحها حتى تطبع Omar.",
      code: `let buckets = [[], [], []];
function put(key, value) {
  buckets[key % 3].push({ key: key, value: value });
}
function get(key) {
  for (const e of buckets[key % 4]) {
    if (e.key === key) return e.value;
  }
  return "missing";
}
put(5, "Omar");
console.log(get(5));`,
      expected: "Omar",
      hint: "put و get يجب أن تحسبا الدلو بالدالة نفسها تماماً. 5 % 3 لا يساوي 5 % 4.",
      solution: `let buckets = [[], [], []];
function put(key, value) {
  buckets[key % 3].push({ key: key, value: value });
}
function get(key) {
  for (const e of buckets[key % 3]) {
    if (e.key === key) return e.value;
  }
  return "missing";
}
put(5, "Omar");
console.log(get(5));`,
    },
    {
      kind: "write",
      title: "عدّاد الكلمات",
      lang: "py",
      prompt: "عُدّ كم مرة تظهر كل كلمة باستخدام dict، ثم اطبع كل كلمة وعددها في سطر، بترتيب أول ظهور: tea 3 ثم milk 1.",
      starter: `words = ["tea", "milk", "tea", "tea"]
counts = {}
# لكل كلمة: زد counts[w] بواحد (ابدأ من 0 إن لم تكن موجودة)
# ثم اطبع كل كلمة وعددها
`,
      expected: "tea 3\nmilk 1",
      hint: "counts.get(w, 0) يعطي العدد الحالي أو 0. ثم for w in counts: print(w, counts[w]).",
      solution: `words = ["tea", "milk", "tea", "tea"]
counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1
for w in counts:
    print(w, counts[w])`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع؟",
      code: 'let b = [[], [], [], []];\nb[13 % 4].push("X");\nconsole.log(b[1].length, b[3].length);',
      options: ["1 0", "0 1", "13 0"],
      answer: 0,
      why: "13 % 4 = 1 (لأن 13 = 3 × 4 + 1). فالسهم يقفز إلى الدلو 1 مباشرة ويضع فيه X، والدلو 3 يبقى فارغاً.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'function h(s) {\n  let t = 0;\n  for (let i = 0; i < s.length; i++) {\n    t = t + s.charCodeAt(i);\n  }\n  return t % 10;\n}\nconsole.log(h("ab"), h("ba"));',
      options: ["5 5", "5 6", "195 195"],
      answer: 0,
      why: "a رمزها 97 و b رمزها 98، والجمع لا يهتم بالترتيب: 195 في الحالتين، والباقي على 10 هو 5. مفتاحان مختلفان في دلو واحد: تصادم سببه دالة تجزئة ساذجة.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'd = {"a": 1}\nd["a"] = 2\nd["b"] = 3\nprint(len(d), d["a"])',
      options: ["2 2", "3 2", "2 1"],
      answer: 0,
      why: "\"a\" يقود دائماً إلى المدخل نفسه، فالكتابة الثانية تغيّر قيمته من 1 إلى 2 ولا تضيف مدخلاً. \"b\" مفتاح جديد. مفتاحان فقط.",
    },
    {
      question: "ماذا يُطبع؟",
      code: "let buckets = [[], [], []];\nfor (const k of [3, 6, 9, 12]) {\n  buckets[k % 3].push(k);\n}\nconsole.log(buckets[0].length);",
      options: ["4", "1", "0"],
      answer: 0,
      why: "كل المفاتيح من مضاعفات 3، فباقيها كلها 0. وقعت الأربعة في دلو واحد، وصار البحث فيه فحصاً واحداً واحداً كالقائمة. لهذا تهتم الجداول الحقيقية بدالة تجزئة تفرّق المفاتيح.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'let phones = {};\nphones["Sara"] = "0551";\nconsole.log(phones["sara"]);',
      options: ["undefined", "0551", "خطأ يوقف البرنامج"],
      answer: 0,
      why: "\"sara\" بحرف صغير مفتاح آخر تماماً، فرقمه مختلف ويقود إلى مكان لا شيء فيه. الجدول يطابق المفتاح حرفاً بحرف، والمفتاح الغائب يعطي undefined.",
    },
  ],
  next: "tree",
};
