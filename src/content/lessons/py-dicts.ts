import type { Lesson } from "@/lib/types";

export const pyDicts: Lesson = {
  slug: "py-dicts",
  stage: 0,
  number: "1.9",
  title: "القواميس",
  subtitle: "القاموس جدول تجزئة: من المفتاح تحسب Python مكان القيمة وتقفز إليه مباشرة، بلا بحث",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "أين رقم Omar؟",
    body: "دفتر هاتف فيه 12 اسماً. ابحث عن رقم شخص مرة في قائمة ومرة في قاموس، وعُدّ الخطوات.",
    demo: "pyDicts",
  },
  scene: {
    trace: "py",
    steps: [],
    code: {
      py: `stock = {"apple": 5, "milk": 2}
stock["bread"] = 3
stock["milk"] = stock["milk"] - 1
print(stock["milk"])
print(stock.get("tea", 0))
print("apple" in stock)
for item, count in stock.items():
    print(item, count)`,
    },
    notes: {
      py: "لكل مفتاح تحسب Python رقماً اسمه hash، ومنه تعرف أي خانة في الجدول تفتح. لذلك البحث بالمفتاح خطوة واحدة تقريباً مهما كبر القاموس، ولذلك يجب أن يكون المفتاح ثابتاً لا يتغير (نص، رقم، tuple). والقاموس يحفظ ترتيب الإدخال منذ Python 3.7.",
    },
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "عدّ الكلمات: أشهر استعمال للقاموس. راقب الكائن في الكومة: مفتاح جديد يُضاف، ومفتاح موجود تتغير قيمته فقط.",
    starter: `text = "the cat and the hat and the bat"
counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1
print(counts)
print(counts["the"])`,
    challenges: [
      "استبدل counts.get(word, 0) بـ counts[word]. في أي دورة يتوقف البرنامج، ولماذا تلك الدورة بالذات؟",
      "أضف print(counts[\"dog\"]) في النهاية. ثم أصلحه بـ get وقيمة افتراضية.",
      "أضف: top = max(counts, key=counts.get) ثم print(top). ماذا تعطي max حين تمرّ على قاموس؟",
      "غيّر النص إلى \"The the THE\". كم مفتاحاً صار؟ أصلحه بـ text.lower().split()‎.",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `d = {"a": 1}
d["a"] = 2
d["b"] = 3
print(len(d), d["a"])`,
      options: ["2 2", "3 2", "3 1"],
      answer: 0,
      why: "المفتاح في القاموس لا يتكرر. d[\"a\"] = 2 وجدت خانة a وكتبت فوق قيمتها، وd[\"b\"] أضافت مفتاحاً جديداً. مفتاحان فقط.",
    },
    {
      question: "ماذا يحدث؟",
      lang: "py",
      code: `prices = {"tea": 5}
print(prices["coffee"])`,
      options: ["KeyError: 'coffee'", "يطبع None", "يطبع 0"],
      answer: 0,
      why: "الأقواس [] تعني: أنا متأكد أن المفتاح موجود. حين لا يوجد ترفع Python خطأ KeyError. إن كان الغياب متوقعاً فاستعمل prices.get(\"coffee\", 0)‎.",
    },
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `a = {"x": 1}
b = a
b["x"] = 9
print(a["x"])`,
      options: ["9", "1", "خطأ"],
      answer: 0,
      why: "القاموس كائن في الكومة مثل القائمة. b = a ألصقت اسماً ثانياً عليه، فالتعديل عبر b يراه a. للنسخ: a.copy()‎.",
    },
  ],
  code: {
    intro: "القاموس هو قلب Python: الكائنات والوحدات والإعدادات وردود JSON كلها قواميس من الداخل. هنا مخزن صغير: get بقيمة افتراضية لما قد يغيب، و items للمرور على الأزواج، و values للجمع، و del للحذف.",
    runnerLang: "py",
    runnerStarter: `inventory = {"apple": 12, "banana": 0, "milk": 4}


def restock(store, item, amount):
    store[item] = store.get(item, 0) + amount


restock(inventory, "banana", 6)
restock(inventory, "tea", 10)

for item, count in inventory.items():
    if count > 5:
        print(f"{item}: {count} ok")
    else:
        print(f"{item}: {count} low")

print("total items:", sum(inventory.values()))
del inventory["milk"]
print(list(inventory))
# Try: print(inventory["coffee"]), then fix it with .get
`,
  },
  exercises: [
    {
      kind: "order",
      title: "عيد ميلاد Sara",
      lang: "py",
      prompt: "رتّب الأسطر: أضف عمرين، ثم زد عمر Sara سنة، ثم اطبع القاموس.",
      lines: ["ages = {}", 'ages["Sara"] = 20', 'ages["Omar"] = 22', 'ages["Sara"] = ages["Sara"] + 1', "print(ages)"],
      expected: "{'Sara': 21, 'Omar': 22}",
    },
    {
      kind: "fill",
      title: "مفتاح غائب",
      lang: "py",
      prompt: "أي تعبير يطبع unknown بدل أن يتوقف البرنامج؟",
      template: 'colors = {"sky": "blue"}\nprint(___)',
      options: ['colors.get("grass", "unknown")', 'colors["grass"]', 'colors.get("sky", "unknown")'],
      expected: "unknown",
    },
    {
      kind: "fix",
      title: "عدّاد الحروف",
      lang: "py",
      prompt: "نريد عدد مرات كل حرف في banana. البرنامج يتوقف من أول حرف. أصلحه.",
      code: 'word = "banana"\ncounts = {}\nfor ch in word:\n    counts[ch] = counts[ch] + 1\nprint(counts)',
      expected: "{'b': 1, 'a': 3, 'n': 2}",
      hint: "أول مرة يظهر فيها الحرف لا يوجد مفتاحه بعد. counts.get(ch, 0) تعطي 0 في تلك الحالة.",
      solution: 'word = "banana"\ncounts = {}\nfor ch in word:\n    counts[ch] = counts.get(ch, 0) + 1\nprint(counts)',
    },
    {
      kind: "write",
      title: "حسب المدينة",
      lang: "py",
      prompt: "جمّع الأسماء حسب المدينة في قاموس by_city: المفتاح مدينة، والقيمة قائمة أسماء بترتيب ظهورها. ثم اطبع by_city.",
      starter: 'people = [("Sara", "Riyadh"), ("Omar", "Jeddah"), ("Huda", "Riyadh")]\n# build by_city: city -> list of names\n',
      expected: "{'Riyadh': ['Sara', 'Huda'], 'Jeddah': ['Omar']}",
      hint: "لكل (name, city): إن لم تكن city في by_city فضع لها قائمة فارغة، ثم append الاسم.",
      solution:
        'people = [("Sara", "Riyadh"), ("Omar", "Jeddah"), ("Huda", "Riyadh")]\nby_city = {}\nfor name, city in people:\n    if city not in by_city:\n        by_city[city] = []\n    by_city[city].append(name)\nprint(by_city)',
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: 'd = {}\nd[1] = "a"\nd[1.0] = "b"\nprint(d)',
      options: ["{1: 'b'}", "{1: 'a', 1.0: 'b'}", "{1.0: 'b'}"],
      answer: 0,
      why: "1 و 1.0 متساويان ولهما hash واحد، فيقودان إلى الخانة نفسها. الكتابة الثانية غيّرت القيمة فقط، وبقي المفتاح الأول كما هو: 1.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'scores = {"Sara": 90, "Omar": 80}\nfor k in scores:\n    print(k)',
      options: ["Sara ثم Omar", "90 ثم 80", "('Sara', 90) ثم ('Omar', 80)"],
      answer: 0,
      why: "المرور على قاموس مباشرة يعطي المفاتيح، بترتيب إدخالها. للقيم: scores.values()‎، وللأزواج: scores.items()‎.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'd = {"a": 1}\nprint(d.get("b"))',
      options: ["None", "KeyError", "0"],
      answer: 0,
      why: "get لا ترفع خطأ أبداً. بلا قيمة افتراضية ترجع None حين يغيب المفتاح.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'inventory = {"x": 1}\nsame = inventory\nsame.clear()\nprint(inventory)',
      options: ["{}", "{'x': 1}", "None"],
      answer: 0,
      why: "same و inventory اسمان لقاموس واحد. clear أفرغت ذلك الكائن، فيراه الاسمان فارغاً.",
    },
    {
      question: "قاموس فيه مليون مفتاح وقائمة فيها مليون اسم. لماذا \"Sara\" in d أسرع بكثير من \"Sara\" in names؟",
      options: [
        "القاموس يحسب hash المفتاح ويقفز إلى خانته مباشرة، والقائمة تقارن عنصراً عنصراً من البداية",
        "القاموس يحفظ مفاتيحه مرتّبة ويبحث بالتنصيف",
        "القائمة تُنسخ قبل كل بحث",
      ],
      answer: 0,
      why: "in على القائمة قد تمرّ على المليون كله. أما القاموس فمكان كل مفتاح محسوب من قيمته، فالسؤال خطوة واحدة تقريباً مهما كبر.",
    },
  ],
  next: "py-sets",
};
