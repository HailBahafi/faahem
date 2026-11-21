import type { Frame, HeapObj, Lesson, Scene, Slot, Step } from "@/lib/types";

const num = (name: string, value: number): Slot => ({ name, value: String(value), type: "number" });
const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
const main = (vars: Slot[]): Frame => ({ id: 1, name: "main", vars });
/** A List on the heap: numbered slots. */
const list = (id: number, items: (string | number)[]): HeapObj => ({
  id,
  kind: "array",
  items: items.map((v, i) => (typeof v === "number" ? num(`[${i}]`, v) : { name: `[${i}]`, value: `"${v}"`, type: "string" })),
});
/** A Map on the heap: each key points at its value. */
const map = (id: number, entries: [string, number][]): HeapObj => ({ id, kind: "object", items: entries.map(([k, v]) => num(`"${k}"`, v)) });
/** A Set on the heap: members only, each one once, no positions. */
const set = (id: number, items: string[]): HeapObj => ({ id, kind: "object", items: items.map((v) => ({ name: "∈", value: `"${v}"`, type: "string" })) });
const at = (line: number | null, say: string, frames: Frame[], heap: HeapObj[], extra: Partial<Step> = {}): Step => ({ line, say, memory: [], frames, heap, ...extra });
const dart = (code: string, steps: Step[]): Scene => ({ code: { dart: code }, steps });

const cart3 = list(1, ["tea", "cake", "juice"]);
const prices = map(2, [["tea", 5], ["cake", 12], ["juice", 8]]);
const tags = set(3, ["hot", "sweet"]);
const vars = [ref("cart", 1), ref("copy", 1)];

export const dartCollections: Lesson = {
  slug: "dart-collections",
  stage: 0,
  number: "1.6",
  title: "المجموعات",
  subtitle: "List و Set و Map تعيش في الكومة، والمتغير يحمل سهماً إليها لا نسخة منها",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "ثلاثة صناديق لنفس الأسماء",
    body: "زوار يدخلون المقهى، وبعضهم يعود أكثر من مرة. أدخلهم واحداً واحداً، وراقب كيف يحفظهم كل صندوق، ثم أجب: كم زائراً مختلفاً جاء؟",
    demo: "dartCollections",
  },
  scene: {
    code: {
      dart: `void main() {
  final cart = ["tea", "cake"];
  final copy = cart;
  copy.add("juice");
  final prices = {"tea": 5, "cake": 12, "juice": 8};
  final tags = {"hot", "sweet", "hot"};
  final total = cart.map((item) => prices[item]!).reduce((a, b) => a + b);
  print("\${cart.length} \${tags.length} $total");
}`,
    },
    steps: [
      at(null, "المكدّس فيه أدراج صغيرة بحجم ثابت. المجموعة تكبر وتصغر، فتعيش في الكومة (heap)، والدرج يحمل سهماً إليها فقط.", [], []),
      at(2, "قائمة List<String>‎ تُبنى في الكومة: خانات مرقّمة من 0. الدرج cart يحمل سهماً إليها. المترجم استنتج النوع من العناصر: قائمة نصوص فقط.", [main([ref("cart", 1)])], [list(1, ["tea", "cake"])], { changed: ["cart"], changedHeap: [1] }),
      at(3, "copy = cart ينسخ السهم لا القائمة. الآن سهمان إلى قائمة واحدة. الاسم copy يكذب!", [main(vars)], [list(1, ["tea", "cake"])], { changed: ["copy"], copy: { from: "cart", to: "copy" } }),
      at(4, "add عبر copy يغيّر القائمة الوحيدة، فيراها cart أيضاً بثلاثة عناصر. final جمّد السهم لا ما في القائمة: لا تستطيع أن تجعل cart يشير إلى قائمة أخرى، لكنك تغيّر محتواها.", [main(vars)], [cart3], { read: ["copy"], changedHeap: [1] }),
      at(5, "Map<String, int>‎: كل مفتاح يشير إلى قيمة. البحث prices[\"cake\"] يقفز إلى المفتاح مباشرة (جدول تجزئة)، لا يمر على العناصر واحداً واحداً.", [main([...vars, ref("prices", 2)])], [cart3, prices], { changed: ["prices"], changedHeap: [2] }),
      at(6, "Set<String>‎: أعضاء بلا ترتيب رقمي، وكل عضو مرة واحدة. \"hot\" الثانية وجدت نفسها موجودة فلم تُضف.", [main([...vars, ref("prices", 2), ref("tags", 3)])], [cart3, prices, tags], { changed: ["tags"], changedHeap: [3] }),
      at(
        7,
        "map يحوّل كل عنصر في cart إلى سعره: 5 ثم 12 ثم 8. البحث في Map يرجع int?‎ لأن المفتاح قد لا يوجد، و ! تعد بأنه موجود. ثم reduce يجمعها اثنين اثنين: 5 + 12 = 17، ثم 17 + 8 = 25.",
        [main([...vars, ref("prices", 2), ref("tags", 3), num("total", 25)])],
        [cart3, prices, tags],
        { changed: ["total"], read: ["cart", "prices"] },
      ),
      at(8, "cart.length = 3 (أُضيف juice عبر copy)، و tags.length = 2، و total = 25.", [main([...vars, ref("prices", 2), ref("tags", 3), num("total", 25)])], [cart3, prices, tags], {
        read: ["cart", "tags", "total"],
        output: ["3 2 25"],
      }),
      at(
        null,
        "الصورة: List للترتيب والتكرار، Set للتفرّد والسؤال «هل هو موجود؟»، Map للبحث بمفتاح. وكلها في الكومة: نسخ المتغير ينسخ السهم، ولنسخة حقيقية اكتب [...cart] أو cart.toList()‎.",
        [],
        [],
        { output: ["3 2 25"] },
      ),
    ],
    notes: {
      dart: "المجموعات تحمل نوع عناصرها: List<int>‎ و Set<String>‎ و Map<String, int>‎. ‏{} الفارغة Map لا Set، فاكتب <String>{}‎ لمجموعة فارغة. و const تجمّد المجموعة كلها، أما final فتجمّد السهم فقط.",
    },
  },
  playground: {
    kind: "trace",
    intro: "الفكرة نفسها بمصفوفات JavaScript وكائناتها، وهنا ترى الكومة والأسهم. alias سهم ثانٍ إلى القائمة نفسها، و slice()‎ تصنع قائمة جديدة. الكائن seen يلعب دور Set: مفتاح لكل زائر مرة واحدة.",
    starter: `const cart = ["tea", "cake"];
const alias = cart;
alias.push("juice");
const copy = cart.slice();
copy.push("cookie");
console.log(cart.length, copy.length);
const prices = { tea: 5, cake: 12, juice: 8 };
let total = 0;
for (const item of cart) {
  total = total + prices[item];
}
console.log(total);
const seen = {};
let unique = 0;
const visitors = ["Sara", "Omar", "Sara"];
for (const v of visitors) {
  if (seen[v] !== true) {
    seen[v] = true;
    unique = unique + 1;
  }
}
console.log(unique);`,
    challenges: [
      "قبل التشغيل: كم عنصراً في cart في النهاية؟ ولماذا لا يصل cookie إليها؟",
      "غيّر const copy = cart.slice()‎ إلى const copy = cart. توقّع ثم شغّل، وراقب الأسهم في الكومة.",
      "أضف \"Lina\" و \"Omar\" إلى visitors. كم زائراً مختلفاً الآن؟",
      "أضف \"water\" إلى cart قبل حلقة المجموع. ماذا يحدث لـ total حين لا يجد prices المفتاح؟ هذا ما تمنعه ! و ?? في Dart.",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `final a = [1, 2];
final b = a;
b.add(3);
print(a);`,
      options: ["[1, 2, 3]", "[1, 2]", "خطأ: a من نوع final"],
      answer: 0,
      why: "b = a نسخ السهم، فـ a و b يشيران إلى قائمة واحدة في الكومة. الإضافة عبر b تُرى عبر a. و final تمنع تغيير السهم، لا محتوى القائمة.",
      scene: dart(
        `final a = [1, 2];
final b = a;
b.add(3);
print(a);`,
        [
          at(1, "قائمة في الكومة، و a يشير إليها.", [main([ref("a", 1)])], [list(1, [1, 2])], { changed: ["a"], changedHeap: [1] }),
          at(2, "b يأخذ نسخة من السهم.", [main([ref("a", 1), ref("b", 1)])], [list(1, [1, 2])], { changed: ["b"], copy: { from: "a", to: "b" } }),
          at(3, "add عبر b يغيّر القائمة الوحيدة.", [main([ref("a", 1), ref("b", 1)])], [list(1, [1, 2, 3])], { changedHeap: [1], read: ["b"] }),
          at(4, "a يشير إلى القائمة نفسها: [1, 2, 3].", [main([ref("a", 1), ref("b", 1)])], [list(1, [1, 2, 3])], { read: ["a"], output: ["[1, 2, 3]"] }),
        ],
      ),
    },
    {
      question: "ماذا يطبع هذا السطر؟",
      code: `print([1, 2, 3].map((n) => n * 2));`,
      options: ["(2, 4, 6)", "[2, 4, 6]", "Instance of 'List<int>'"],
      answer: 0,
      why: "map لا تصنع قائمة: ترجع Iterable كسولاً، وصفة تُحسب عناصرها حين يُطلب منها. print يطبعه بين قوسين عاديين. لتحصل على List اكتب ‎.toList()‎ في آخره.",
      scene: dart(`print([1, 2, 3].map((n) => n * 2));`, [
        at(1, "القائمة [1, 2, 3] تُبنى في الكومة.", [main([])], [list(1, [1, 2, 3])], { changedHeap: [1] }),
        at(1, "map ترجع Iterable: لا قائمة جديدة في الكومة، بل وصفة «ضاعف كل عنصر» مربوطة بالقائمة.", [main([])], [list(1, [1, 2, 3])]),
        at(1, "print يمر على الوصفة فتُحسب العناصر الآن: 2، 4، 6، ويكتبها بين قوسين لأنها Iterable لا List.", [main([])], [list(1, [1, 2, 3])], { output: ["(2, 4, 6)"] }),
      ]),
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `final a = [1, 2];
final b = [...a];
b.add(3);
print(a);`,
      options: ["[1, 2]", "[1, 2, 3]", "[[1, 2], 3]"],
      answer: 0,
      why: "‎...a‎ داخل [ ] تنشر عناصر a في قائمة جديدة تماماً. الآن قائمتان في الكومة، و b يشير إلى الجديدة، فالإضافة لا تصل إلى a.",
      scene: dart(
        `final a = [1, 2];
final b = [...a];
b.add(3);
print(a);`,
        [
          at(1, "قائمة في الكومة، و a يشير إليها.", [main([ref("a", 1)])], [list(1, [1, 2])], { changed: ["a"], changedHeap: [1] }),
          at(2, "[...a] تبني قائمة ثانية وتنسخ إليها العناصر. b يشير إلى الجديدة.", [main([ref("a", 1), ref("b", 2)])], [list(1, [1, 2]), list(2, [1, 2])], { changed: ["b"], changedHeap: [2] }),
          at(3, "add تغيّر القائمة الثانية فقط.", [main([ref("a", 1), ref("b", 2)])], [list(1, [1, 2]), list(2, [1, 2, 3])], { changedHeap: [2], read: ["b"] }),
          at(4, "a ما زالت [1, 2].", [main([ref("a", 1), ref("b", 2)])], [list(1, [1, 2]), list(2, [1, 2, 3])], { read: ["a"], output: ["[1, 2]"] }),
        ],
      ),
    },
  ],
  code: {
    intro: "برنامج Dart حقيقي على خادم التشغيل: سلة بـ List، وأسعار بـ Map، وتصنيفات بـ Set، و where و map و fold، وقائمة تُبنى بـ if و for داخلها. شغّله ثم جرّب ما في التعليق.",
    runnerLang: "dart",
    runnerStarter: `void main() {
  final cart = <String>["tea", "cake", "tea"];
  final prices = <String, double>{"tea": 5, "cake": 12.5, "juice": 8};
  final kinds = cart.toSet(); // duplicates gone

  final total = cart.fold<double>(0, (sum, item) => sum + (prices[item] ?? 0));
  print("items: \${cart.length}, kinds: \${kinds.length}, total: $total");

  final cheap = prices.entries.where((e) => e.value < 10).map((e) => e.key).toList();
  print("cheap: $cheap");

  final isMember = true;
  final receipt = [
    for (final item in kinds) "$item x\${cart.where((c) => c == item).length}",
    if (isMember) "member discount",
  ];
  print(receipt);

  prices["water"] = 2;
  prices.remove("cake");
  print(prices.keys);
  // try: add "juice" to cart, or set isMember to false
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "dart",
      title: "عدّاد الكلمات",
      prompt: "رتّب الأسطر: Map فارغة تعدّ كم مرة تظهر كل كلمة، ثم تُطبع ‎{tea: 2, cake: 1}‎.",
      lines: [
        "void main() {",
        '  final words = ["tea", "cake", "tea"];',
        "  final counts = <String, int>{};",
        "  for (final w in words) {",
        "    counts[w] = (counts[w] ?? 0) + 1;",
        "  }",
        "  print(counts);",
        "}",
      ],
      expected: "{tea: 2, cake: 1}",
    },
    {
      kind: "fill",
      lang: "dart",
      title: "كم رقماً مختلفاً؟",
      prompt: "أي مجموعة تحذف المكرر فيطبع البرنامج 3؟",
      template: `void main() {
  final unique = ___.from([3, 1, 3, 2]);
  print(unique.length);
}`,
      options: ["Set", "List", "Map"],
      answer: "Set",
      expected: "3",
    },
    {
      kind: "fix",
      lang: "dart",
      title: "قائمة لا تقبل الإضافة",
      prompt: "البرنامج يتوقف عند التشغيل بخطأ Unsupported operation. أصلحه حتى يطبع 3، مع بقاء المتغير لا يشير إلى قائمة أخرى أبداً.",
      code: `void main() {
  const menu = ["tea", "cake"];
  menu.add("juice");
  print(menu.length);
}`,
      expected: "3",
      hint: "const تجمّد القائمة كلها إلى الأبد. أي كلمة تجمّد السهم وحده وتترك المحتوى قابلاً للتغيير؟",
      solution: `void main() {
  final menu = ["tea", "cake"];
  menu.add("juice");
  print(menu.length);
}`,
    },
    {
      kind: "write",
      lang: "dart",
      title: "الأسعار المرتفعة مضاعفة",
      prompt: "من القائمة prices خذ الأسعار الأكبر من 10، وضاعف كلاً منها، واطبعها قائمة: ‎[24, 60]‎.",
      starter: `void main() {
  final prices = [12, 5, 30, 8];
  // keep prices above 10, double them, print as a List
}
`,
      expected: "[24, 60]",
      hint: "where يختار، و map يحوّل، و toList()‎ يصنع القائمة: prices.where((p) => p > 10).map((p) => p * 2).toList()‎",
      solution: `void main() {
  final prices = [12, 5, 30, 8];
  final high = prices.where((p) => p > 10).map((p) => p * 2).toList();
  print(high);
}
`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع هذا الكود؟",
      code: 'final names = ["Sara"];\nnames.add("Omar");\nprint(names.length);',
      options: ["2", "خطأ: names من نوع final", "1"],
      answer: 0,
      why: "final تقفل الدرج names: سيشير دائماً إلى القائمة نفسها. لكن القائمة في الكومة قابلة للتغيير، فالإضافة مقبولة. لتجميد المحتوى أيضاً استعمل const.",
    },
    {
      question: "ماذا يطبع هذا السطر؟",
      code: "print([1, if (false) 2, ...[3, 4]]);",
      options: ["[1, 3, 4]", "[1, 2, [3, 4]]", "[1, [3, 4]]"],
      answer: 0,
      why: "if داخل القائمة يضيف العنصر فقط حين يكون الشرط صحيحاً، و ... تنشر عناصر قائمة أخرى واحداً واحداً. النتيجة قائمة واحدة مسطّحة.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: "var x = {};\nprint(x is Map);",
      options: ["true", "false: هي Set", "خطأ: نوع غير معروف"],
      answer: 0,
      why: "‏{} الفارغة في Dart تعني Map فارغة، لأن الخرائط أقدم في اللغة. لمجموعة Set فارغة اكتب <String>{}‎.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: 'final s = {"b", "a", "b"};\nprint(s);',
      options: ["{b, a}", "{a, b}", "{b, a, b}"],
      answer: 0,
      why: "Set لا يحفظ المكرر، فـ \"b\" الثانية لا تُضاف. ومجموعة Dart الافتراضية تتذكر ترتيب الإدخال، فتظهر b قبل a.",
    },
    {
      question: "ماذا يحدث عند تشغيل هذا الكود؟",
      code: "final list = [10, 20];\nprint(list[2]);",
      options: ["يتوقف بخطأ RangeError", "يطبع null", "يطبع 0"],
      answer: 0,
      why: "الخانات مرقّمة من 0، فالقائمة فيها [0] و [1] فقط. Dart يفحص الرقم قبل أن يقرأ الذاكرة، ويوقف البرنامج بدل أن يقرأ ما بعد نهاية القائمة. قارن مع Map: مفتاح غير موجود يعطي null.",
    },
  ],
  next: "dart-strings",
};
