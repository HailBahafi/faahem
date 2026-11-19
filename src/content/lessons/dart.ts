import type { Cell, Lesson, Scene } from "@/lib/types";

/** A label the Dart compiler writes on a drawer before anything runs. */
const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const nul = (name: string): Cell => ({ name, value: "null", type: "none" });

/** A hand-written answer scene in Dart: the compiler reads the program, and stops at the bad line. */
const check = (dart: string, steps: Scene["steps"]): Scene => ({ code: { dart }, steps });

const latte = [s("latte.name", "latte"), n("latte.price", 15)];

export const dart: Lesson = {
  slug: "dart",
  stage: 9,
  number: "9.1",
  title: "Dart",
  subtitle: "لغة Flutter: TypeScript تعرفها بلهجة جديدة، تُترجم إلى لغة آلة الهاتف",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "أنت تعرف أغلبها",
    body: "على اليمين أسطر JavaScript و TypeScript كتبتها في المراحل السابقة. اضغط سطراً لترى كيف يُكتب بلغة Dart، والفرق ملوّن. ثم العب لعبة القيم الفارغة: أي الأسطر سيرفضها Dart قبل أن يعمل البرنامج؟",
    demo: "dart",
  },
  scene: {
    code: {
      dart: `class Drink {
  final String name;
  final int price;
  Drink(this.name, this.price);
}
int total(Drink d, int cups) => d.price * cups;
final latte = Drink("latte", 15);
String? note;
void main() => print("\${latte.name} \${total(latte, 2)} \${note ?? "plain"}");`,
      ts: `class Drink {
  readonly name: string;
  readonly price: number;
  constructor(name: string, price: number) { this.name = name; this.price = price; }
}
const total = (d: Drink, cups: number): number => d.price * cups;
const latte = new Drink("latte", 15);
let note: string | null = null;
console.log(\`\${latte.name} \${total(latte, 2)} \${note ?? "plain"}\`);`,
    },
    steps: [
      {
        line: null,
        say: "البرنامج نفسه مرتين: Dart و TypeScript، والسطر N يعني الشيء نفسه في الاثنين. بدّل بين اللغتين وأنت تتابع. مثل TypeScript، يقرأ مترجم Dart الملف كله قبل أي تشغيل.",
        memory: [],
      },
      {
        line: 1,
        say: "class Drink: كما في TypeScript تماماً. الصنف قالب، وكل Drink نصنعه كائن بالشكل نفسه.",
        memory: [label("Drink", "{ name: String, price: int }")],
      },
      {
        line: 2,
        say: "الفرق الأول: النوع يُكتب قبل الاسم، String name بدل name: string. و final تعني «يُكتب مرة واحدة» مثل readonly في TS و const في JS.",
        memory: [label("Drink", "{ name: String, price: int }")],
      },
      {
        line: 3,
        say: "number في TS صار هنا نوعين: int للأعداد الصحيحة و double للكسور. السعر 15 صحيح، فهو int.",
        memory: [label("Drink", "{ name: String, price: int }")],
      },
      {
        line: 4,
        say: "الباني اسمه اسم الصنف، و this.name داخل القوسين تعني «ضع المعامل الأول في name مباشرة». سطر واحد بدل جسم constructor كامل في TS.",
        memory: [label("Drink", "{ name: String, price: int }")],
      },
      {
        line: 6,
        say: "دالة سهمية بـ ‎=>‎ كما في JS، لكن نوع ما ترجعه يُكتب أولاً: int total(...)‎. ‎=> d.price * cups‎ تعني return d.price * cups.",
        memory: [label("Drink", "{ name: String, price: int }"), label("total()", "int")],
      },
      {
        line: 7,
        say: "لا حاجة لـ new: ‏Drink(\"latte\", 15) يصنع الكائن. و final بلا نوع تجعل المترجم يستنتجه: latte من نوع Drink، كما استنتج TS نوع count من قيمته.",
        memory: [...latte],
        changed: ["latte.name", "latte.price"],
      },
      {
        line: 8,
        say: "علامة ؟ بعد النوع: String?‎ تعني «نص أو null». هي string | null في TS. لم نعطها قيمة، فتبدأ null. ولو كتبنا String بلا ؟ لرفض المترجم أن تبقى فارغة.",
        memory: [...latte, nul("note")],
        changed: ["note"],
      },
      {
        line: 9,
        say: "برنامج Dart يبدأ دائماً من main. ‎\"${...}\"‎ داخل علامتي تنصيص عاديتين هي قالب النص ‎`${...}`‎ في JS. ‏total(latte, 2) = 15 × 2 = 30.",
        memory: [...latte, nul("note"), n("cups", 2)],
        read: ["latte.name", "latte.price", "cups"],
      },
      {
        line: 9,
        say: "note ?? \"plain\": إن كانت note فارغة خذ \"plain\"، تماماً كما في JS. print هي console.log. يُطبع: latte 30 plain.",
        memory: [...latte, nul("note")],
        read: ["note"],
        output: ["latte 30 plain"],
      },
      {
        line: null,
        say: "الفرق الكبير غير مرئي: TypeScript تمحو أنواعها وتصير JavaScript، أما Dart فيترجمها المترجم إلى لغة آلة المعالج في الهاتف مباشرة (درس من الكود إلى التنفيذ). لهذا تطبيقات Flutter سريعة.",
        memory: [...latte, nul("note")],
        output: ["latte 30 plain"],
      },
    ],
    notes: {
      dart: "النوع قبل الاسم (int cups)، و ؟ بعد النوع تسمح بـ null، و final للقيمة التي لا تتغير. الأنواع لا تُمحى: المترجم يستعملها ليصنع لغة آلة سريعة للهاتف.",
      ts: "ما تعرفه: النوع بعد الاسم ونقطتين، و string | null لما قد يكون فارغاً، و new لصنع الكائن. هذا السطر يعمل فعلاً ويطبع النتيجة نفسها.",
    },
  },
  playground: {
    kind: "trace",
    intro: "Dart لا يعمل هنا، فهذه محاكاة بـ JavaScript لما يفعله مترجمه مع null: كل سطر كائن فيه الاسم والنوع والقيمة. النوع الذي ينتهي بـ ؟ يقبل null، والذي بلا ؟ يرفضها قبل التشغيل.",
    starter: `function check(line) {
  const nullable = line.type.includes("?");
  if (line.value === null && !nullable) {
    return "rejected: " + line.name + " cannot be null";
  }
  return "ok: " + line.type + " " + line.name;
}
const lines = [
  { name: "name", type: "String", value: "Sara" },
  { name: "note", type: "String?", value: null },
  { name: "city", type: "String", value: null },
];
for (const line of lines) {
  console.log(check(line));
}
const note = null;
console.log(note ?? "no note");`,
    challenges: [
      "قبل التشغيل: أي الأسطر الثلاثة سيُرفض؟ ولماذا لا تُرفض note مع أن قيمتها null أيضاً؟",
      "غيّر نوع city إلى \"String?\" وشغّل. ماذا تغيّر؟ هذا ما تفعله ؟ في Dart.",
      "أضف سطراً { name: \"age\", type: \"int\", value: null }. ماذا يقول المدقّق؟",
      "اجعل note = \"hot\" بدل null. ماذا يطبع السطر الأخير الآن؟ ‎??‎ في Dart تعمل بالطريقة نفسها.",
    ],
  },
  predict: [
    {
      question: "أي سطر سيرفضه مترجم Dart قبل التشغيل؟",
      code: `String? note;
String title = "menu";
title = note;
print(title);`,
      options: ["السطر 3", "السطر 1", "لا شيء، يطبع null"],
      answer: 0,
      why: "note من نوع String?‎ (قد تكون فارغة)، و title من نوع String (لا تكون فارغة أبداً). وضع «ربما فارغ» في «أبداً فارغ» مرفوض. الحل: title = note ?? \"menu\"‎. JavaScript كانت ستطبع null بصمت.",
      scene: check(
        `String? note;
String title = "menu";
title = note;
print(title);`,
        [
          { line: 1, say: "note تُكتب String?‎: نص أو null. تبدأ null.", memory: [label("note", "String?")] },
          { line: 2, say: "title تُكتب String: نص دائماً، ولا يُسمح لها أن تكون null.", memory: [label("note", "String?"), label("title", "String")] },
          {
            line: 3,
            say: "قيمة قد تكون null تدخل درجاً لا يقبل null: خط أحمر، والبرنامج لا يُترجم.",
            memory: [label("note", "String?"), label("title", "String")],
            read: ["note"],
            error: "A value of type 'String?' can't be assigned to a variable of type 'String'.",
          },
        ],
      ),
    },
    {
      question: "لم نكتب نوعاً، استعملنا var. هل يقبل Dart السطر 2؟",
      code: `var price = 15;
price = "free";
print(price);`,
      options: ["لا: var استنتج أن price من نوع int", "نعم: var تعني أي نوع", "نعم، ويطبع free"],
      answer: 0,
      why: "var في Dart ليست let في JavaScript. هي مثل استنتاج TypeScript: المترجم يرى 15 فيكتب على الدرج int، ولا يقبل نصاً فيه بعد ذلك.",
      scene: check(
        `var price = 15;
price = "free";
print(price);`,
        [
          { line: 1, say: "var بلا نوع، لكن القيمة 15 عدد صحيح، فيستنتج المترجم: price من نوع int.", memory: [label("price", "int")], changed: ["price"] },
          {
            line: 2,
            say: "نص في درج int: مرفوض قبل التشغيل.",
            memory: [label("price", "int")],
            error: "A value of type 'String' can't be assigned to a variable of type 'int'.",
          },
        ],
      ),
    },
    {
      question: "loadName دالة async. ماذا يطبع هذا البرنامج؟",
      code: `Future<String> loadName() async {
  return "Sara";
}
void main() {
  final name = loadName();
  print(name);
}`,
      options: ["Instance of 'Future<String>'", "Sara", "خطأ: لا يمكن استدعاء async بلا await"],
      answer: 0,
      why: "Future في Dart هي Promise في JavaScript: وعد بقيمة ستأتي. بدون await نطبع الوعد نفسه لا ما بداخله، كما تطبع JS ‎Promise { 'Sara' }‎. الصحيح: void main() async { final name = await loadName(); ... }‎.",
      scene: check(
        `Future<String> loadName() async {
  return "Sara";
}
void main() {
  final name = loadName();
  print(name);
}`,
        [
          { line: 4, say: "البرنامج يبدأ من main.", memory: [] },
          {
            line: 5,
            say: "loadName()‎ بلا await تعيد فوراً Future: صندوق مغلق سيحمل \"Sara\" لاحقاً. name هي الصندوق نفسه.",
            memory: [label("name", "Future<String>")],
            changed: ["name"],
          },
          {
            line: 6,
            say: "print تطبع الصندوق، لا ما بداخله.",
            memory: [label("name", "Future<String>")],
            read: ["name"],
            output: ["Instance of 'Future<String>'"],
          },
        ],
      ),
    },
  ],
  code: {
    intro: "Dart لا يعمل داخل هذا الدرس. انسخ البرنامج إلى dartpad.dev (يعمل في المتصفح) أو ثبّت Flutter وشغّله بـ dart run. فيه كل ما رأيته: أنواع، صنف، null، دالة سهمية، و async مع Future.",
    runnerLang: "text",
    runnerStarter: `class Drink {
  final String name;
  final double price;
  Drink(this.name, this.price);
}

double total(List<Drink> cart) {
  var sum = 0.0;
  for (final d in cart) {
    sum += d.price;
  }
  return sum;
}

Future<String> loadUser() async {
  await Future.delayed(Duration(seconds: 1)); // like setTimeout in a Promise
  return "Sara";
}

void main() async {
  final cart = [Drink("latte", 15), Drink("tea", 7.5)];
  final Map<String, int> stock = {"latte": 3, "tea": 0};
  String? note;
  print("total: \${total(cart)}");
  print("tea left: \${stock["tea"]}");
  print("cake left: \${stock["cake"] ?? 0}"); // a missing key gives null
  print(note ?? "no note");
  final user = await loadUser();
  print("hi $user");
  // try: give note a value, add a third drink, or remove the ?? 0
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "صنف بباني قصير",
      prompt: "رتّب الأسطر: صنف User فيه name نصي و age صحيح، بانيه يملأ الحقلين مباشرة، ثم main تطبع Sara 20.",
      lines: ["class User {", "  final String name;", "  final int age;", "  User(this.name, this.age);", "}", "void main() {", '  final u = User("Sara", 20);', '  print("${u.name} ${u.age}");', "}"],
      expected: "Sara 20",
    },
    {
      kind: "fill",
      lang: "text",
      title: "قيمة احتياطية",
      prompt: "city قد تكون null. أي عامل يطبع Riyadh حين تكون فارغة، بلا أي خطأ؟",
      template: 'String? city;\nprint(city ___ "Riyadh");',
      options: ["??", "!", "?"],
      answer: "??",
      expected: "Riyadh",
    },
    {
      kind: "order",
      lang: "text",
      title: "انتظر الوعد",
      prompt: "رتّب الأسطر: دالة async ترجع Future<int>، ثم main تنتظرها بـ await وتطبع 42.",
      lines: ["Future<int> loadScore() async {", "  return 42;", "}", "void main() async {", "  final score = await loadScore();", "  print(score);", "}"],
      expected: "42",
    },
    {
      kind: "fill",
      lang: "text",
      title: "النوع المناسب",
      prompt: "سعر القهوة 7.5. أي نوع يقبله Dart لهذا الدرج؟",
      template: "___ price = 7.5;\nprint(price * 2);",
      options: ["double", "int", "number"],
      answer: "double",
      expected: "15.0",
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: 'String? city;\nprint(city ?? "Riyadh");\ncity = "Jeddah";\nprint(city ?? "Riyadh");',
      options: ["Riyadh ثم Jeddah", "null ثم Jeddah", "خطأ: city لم تُعطَ قيمة"],
      answer: 0,
      why: "String?‎ تبدأ null، فيأخذ ‎??‎ القيمة الاحتياطية Riyadh. بعد أن صار في الدرج Jeddah، يأخذ ‎??‎ ما في الدرج. مثل JavaScript تماماً.",
    },
    {
      question: "ماذا يطبع print(a / 2)؟",
      code: "int a = 7;\nprint(a / 2);\nprint(a ~/ 2);",
      options: ["3.5 ثم 3", "3 ثم 3.5", "3.5 ثم 3.5"],
      answer: 0,
      why: "في Dart القسمة / تعطي double دائماً، كما في JS: 3.5. أما ‎~/‎ فقسمة صحيحة تعطي int وترمي الكسر: 3. هذا ثمن تقسيم number إلى int و double.",
    },
    {
      question: "هذا الكود يمر من المترجم. ماذا يحدث عند التشغيل؟",
      code: "String? name;\nprint(name!.length);",
      options: ["يتوقف بخطأ: Null check operator used on a null value", "يطبع 0", "يطبع null"],
      answer: 0,
      why: "! تعني «أعدك أن القيمة ليست null». المترجم يصدّقك ويسكت، لكن الدرج فيه null فعلاً، فينهار البرنامج أثناء التشغيل. استعمل ! فقط حين تكون متأكداً، وإلا ‎??‎ أو ‎?.‎",
    },
    {
      question: "أي سطر يرفضه المترجم؟",
      code: 'List<int> nums = [1, 2, 3];\nnums.add(4);\nnums.add("5");\nprint(nums);',
      options: ["السطر 3", "السطر 2", "لا شيء، يطبع [1, 2, 3, 4, 5]"],
      answer: 0,
      why: "List<int> مثل number[] في TS: قائمة لا تقبل إلا أعداداً صحيحة. 4 مقبول، و \"5\" نص فيرفضه المترجم قبل التشغيل. JS كانت ستخلط الأنواع في المصفوفة بصمت.",
    },
    {
      question: "ماذا يطبع السطر الثاني؟",
      code: 'final ages = {"Sara": 20};\nprint(ages["Omar"]);',
      options: ["null", "0", "يتوقف بخطأ: المفتاح غير موجود"],
      answer: 0,
      why: "ages من نوع Map<String, int>، والبحث عن مفتاح غير موجود يعطي null، تماماً كما يعطي كائن JS قيمة undefined. لذلك نوع ages[\"Omar\"] هو int?‎ لا int، والمترجم سيطلب منك ‎??‎ قبل أن تحسب به.",
    },
  ],
  next: "widgets",
};
