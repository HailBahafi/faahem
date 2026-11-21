import type { Cell, Lesson, Scene, Step } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const nul = (name: string): Cell => ({ name, value: "null", type: "none" });
/** What the compiler knows about a drawer before anything runs: its type, written on the label. */
const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
/** A hand-written answer scene in Dart. */
const dart = (code: string, steps: Step[]): Scene => ({ code: { dart: code }, steps });

export const dartNullSafety: Lesson = {
  slug: "dart-null-safety",
  stage: 0,
  number: "1.2",
  title: "null safety",
  subtitle: "كل نوع له نسختان: واحدة لا تكون فارغة أبداً، وواحدة قد تكون فارغة، والمترجم يعرف الفرق",
  minutes: 20,
  singleLanguage: true,
  problem: {
    title: "الدرج الفارغ الذي ينفجر",
    body: "تطبيق يعرض طول الاسم الأوسط لكل شخص. أحدهم ليس له اسم أوسط. شغّله بلا حماية وانظر متى ينهار، ثم شغّله بعين مترجم Dart واختر طريقة الإصلاح.",
    demo: "dartNullSafety",
  },
  scene: {
    code: {
      dart: `int? findAge(String name) => name == "Sara" ? 20 : null;
void main() {
  int? age = findAge("Omar");
  print(age ?? 0);
  age ??= 18;
  print(age + 1);
  String? city;
  print(city?.length);
}`,
    },
    steps: [
      {
        line: null,
        say: "قبل التشغيل يقرأ المترجم الملف كله، ويكتب على كل درج نوعه. في Dart لكل نوع نسختان: int درج فيه عدد دائماً، و int?‎ درج قد يكون فيه عدد أو null.",
        memory: [],
      },
      {
        line: 1,
        say: "findAge ترجع int?‎: عدداً إن عرفت العمر، و null إن لم تعرفه. علامة ؟ في نوع الرجوع تحذير مكتوب لكل من يستدعيها: «قد لا تجد شيئاً».",
        memory: [label("findAge()", "int?")],
      },
      {
        line: 3,
        say: "الاسم ليس Sara، فترجع null. الدرج age مكتوب عليه int?‎، لذلك يقبل null بلا اعتراض.",
        memory: [nul("age")],
        changed: ["age"],
      },
      {
        line: 4,
        say: "‎??‎ تقرأ الدرج: فيه null، فتأخذ القيمة الاحتياطية 0. الدرج نفسه لم يتغير، والمطبوع 0.",
        memory: [nul("age")],
        read: ["age"],
        output: ["0"],
      },
      {
        line: 5,
        say: "‎??=‎ تعني: إن كان الدرج فارغاً فاكتب فيه 18، وإلا فاتركه. كان فارغاً، فصار فيه 18.",
        memory: [n("age", 18)],
        changed: ["age"],
        output: ["0"],
      },
      {
        line: 6,
        say: "لماذا قبل المترجم age + 1 هنا؟ لأنه تتبّع السطر 5 وعرف أن الدرج لم يعد فارغاً، فعامل age كأنه int. هذا اسمه الترقية (promotion). لو كتبنا age + 1 في السطر 4 لرفضه.",
        memory: [n("age", 18)],
        read: ["age"],
        output: ["0", "19"],
      },
      {
        line: 7,
        say: "String?‎ بلا قيمة تبدأ null تلقائياً. أما String بلا ؟ وبلا قيمة فلا يُسمح بقراءتها قبل أن تُكتب فيها قيمة.",
        memory: [n("age", 18), nul("city")],
        changed: ["city"],
        output: ["0", "19"],
      },
      {
        line: 8,
        say: "‎?.‎ تقول: إن كان city فارغاً فلا تكمل، وأعطني null بدل أن تنهار. لذلك يُطبع null، ولا تُقرأ length من درج فارغ أبداً.",
        memory: [n("age", 18), nul("city")],
        read: ["city"],
        output: ["0", "19", "null"],
      },
      {
        line: null,
        say: "الصورة كلها: المترجم يعرف أي الأدراج قد تكون فارغة، ويجبرك أن تقرر ماذا يحدث حينها (‎??‎ أو ‎??=‎ أو ‎?.‎ أو فحص if) قبل أن يعمل البرنامج. خطأ null انتقل من هاتف المستخدم إلى شاشتك.",
        memory: [n("age", 18), nul("city")],
        output: ["0", "19", "null"],
      },
    ],
    notes: {
      dart: "النوع بلا ؟ لا يقبل null أبداً، والنوع مع ؟ يقبله. المترجم يرقّي int?‎ إلى int بعد فحص أو إسناد يضمن قيمة، و ! تعني «أعدك أنها ليست null» وتنهار إن أخلفت الوعد.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة بـ JavaScript لما يفعله مترجم Dart: types يحفظ ما يعرفه المترجم عن كل درج. الدرج الذي ينتهي نوعه بـ ؟ لا يُستعمل في الحساب حتى يثبت أنه ليس null، وبعدها يُرقّى نوعه.",
    starter: `const types = { age: "int?" };
let age = null;
function use(name, value) {
  if (types[name].includes("?")) {
    return "compile error: " + name + " is " + types[name];
  }
  return "ok: " + (value + 1);
}
console.log(use("age", age));
console.log(age ?? 0);
if (age === null) {
  age = 18;
}
types.age = "int";
console.log(use("age", age));`,
    challenges: [
      "قبل التشغيل: ماذا يطبع أول console.log؟ ولماذا لا يحسب value + 1؟",
      "احذف السطر types.age = \"int\" وشغّل. هذا ما يحدث في Dart لو لم يستطع المترجم أن يثبت أن الدرج امتلأ.",
      "اجعل age = 30 في السطر الثاني. ماذا يطبع age ?? 0 الآن؟",
      "أضف درجاً جديداً name من نوع \"String\" (بلا ؟) وقيمته \"Sara\"، واستدعِ use له. هل يحتاج فحصاً؟",
    ],
  },
  predict: [
    {
      question: "هل يقبل المترجم السطر 3؟ وماذا يطبع؟",
      code: `int? stock = int.tryParse("12");
if (stock != null) {
  print(stock + 1);
}`,
      options: ["يقبله ويطبع 13", "يرفضه: stock من نوع int?", "يطبع null"],
      answer: 0,
      why: "int.tryParse ترجع int?‎ لأن النص قد لا يكون عدداً. لكن داخل if (stock != null) يعرف المترجم أن الدرج ممتلئ، فيرقّي stock إلى int ويقبل الجمع. الفحص نفسه هو ما يفتح القفل.",
      scene: dart(
        `int? stock = int.tryParse("12");
if (stock != null) {
  print(stock + 1);
}`,
        [
          { line: 1, say: "النص \"12\" عدد صالح، فيصير في الدرج 12. لكن نوع الدرج int?‎، فالمترجم لا يفترض شيئاً بعد.", memory: [n("stock", 12)], changed: ["stock"] },
          { line: 2, say: "الشرط stock != null صحيح. والأهم: المترجم يعرف أن كل ما داخل هذه الأقواس لا يصله إلا درج ممتلئ.", memory: [n("stock", 12)], read: ["stock"] },
          { line: 3, say: "هنا stock من نوع int (رُقّي)، فالجمع مقبول: 12 + 1 = 13.", memory: [n("stock", 12)], read: ["stock"], output: ["13"] },
        ],
      ),
    },
    {
      question: "هذا البرنامج يمر من المترجم. ماذا يحدث عند تشغيله؟",
      code: `late String token;
void main() {
  print(token);
}`,
      options: ["يتوقف بخطأ LateInitializationError", "يطبع null", "يطبع نصاً فارغاً"],
      answer: 0,
      why: "late وعد منك للمترجم: «سأملأ هذا الدرج قبل أن أقرأه». المترجم يصدّقك ويضع حارساً عند القراءة. حين تقرأ درجاً لم يُملأ، يوقف الحارس البرنامج. token ليس String?‎، فلا يمكن أن يكون null.",
      scene: dart(
        `late String token;
void main() {
  print(token);
}`,
        [
          { line: 1, say: "درج من نوع String، مع late: «سيُملأ لاحقاً». المترجم يسكت، ويضع حارساً يفحص الدرج عند كل قراءة.", memory: [label("token", "String (late)")] },
          { line: 2, say: "main تبدأ، ولم يكتب أحد في token.", memory: [label("token", "String (late)")] },
          {
            line: 3,
            say: "قراءة درج لم يُملأ: الحارس يوقف البرنامج. هذا خطأ وقت التشغيل لأنك طلبت من المترجم أن يثق بك.",
            memory: [label("token", "String (late)")],
            read: ["token"],
            error: "LateInitializationError: Field 'token' has not been initialized.",
          },
        ],
      ),
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `int? a;
a ??= 5;
a ??= 9;
print(a);`,
      options: ["5", "9", "null"],
      answer: 0,
      why: "‎??=‎ تكتب فقط في درج فارغ. السطر 2 وجده فارغاً فكتب 5. السطر 3 وجده ممتلئاً فلم يفعل شيئاً. هي «املأه إن كان فارغاً»، لا «اكتب فوقه».",
      scene: dart(
        `int? a;
a ??= 5;
a ??= 9;
print(a);`,
        [
          { line: 1, say: "int?‎ بلا قيمة: الدرج فيه null.", memory: [nul("a")], changed: ["a"] },
          { line: 2, say: "الدرج فارغ، فيكتب 5.", memory: [n("a", 5)], changed: ["a"], read: ["a"] },
          { line: 3, say: "الدرج فيه 5، ليس فارغاً، فلا يكتب 9.", memory: [n("a", 5)], read: ["a"] },
          { line: 4, say: "يطبع ما في الدرج: 5.", memory: [n("a", 5)], read: ["a"], output: ["5"] },
        ],
      ),
    },
  ],
  code: {
    intro: "برنامج Dart حقيقي يعمل على خادم التشغيل. فيه كل أدوات null: ‎??‎ و ‎??=‎ و ‎?.‎ والفحص بـ if و late. شغّله، ثم جرّب أن تكسره كما يقترح التعليق في آخره.",
    runnerLang: "dart",
    runnerStarter: `String? middleName(String name) => name == "Sara" ? "Noor" : null;

void main() {
  for (final name in ["Sara", "Omar"]) {
    final middle = middleName(name);
    // ?. stops at null, ?? gives a fallback
    print("$name: \${middle?.length ?? 0} letters");
    if (middle != null) {
      print("  upper: \${middle.toUpperCase()}"); // promoted to String here
    }
  }

  int? visits;
  visits ??= 1;
  print("visits: \${visits + 1}");

  late final String greeting;
  greeting = "hello";
  print(greeting);
  // try: remove "?? 0" on line 7, or write middle.length outside the if
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "dart",
      title: "فحص قبل الاستعمال",
      prompt: "رتّب الأسطر: دالة قد لا تجد لقباً، ثم main تفحص النتيجة قبل أن تستعملها وتطبع no nickname لـ Omar.",
      lines: [
        'String? nickname(String name) => name == "Sara" ? "Sa" : null;',
        "void main() {",
        '  final nick = nickname("Omar");',
        "  if (nick == null) {",
        '    print("no nickname");',
        "  } else {",
        "    print(nick.length);",
        "  }",
        "}",
      ],
      expected: "no nickname",
    },
    {
      kind: "fill",
      lang: "dart",
      title: "طول بلا انهيار",
      prompt: "city فارغة. أي عامل يجعل البرنامج يطبع 0 بلا خطأ في الترجمة ولا في التشغيل؟",
      template: `void main() {
  String? city;
  final len = city___length ?? 0;
  print(len);
}`,
      options: ["?.", ".", "!."],
      answer: "?.",
      expected: "0",
    },
    {
      kind: "fix",
      lang: "dart",
      title: "مفتاح غير موجود",
      prompt: "المترجم يرفض هذا البرنامج. أصلحه حتى يعامل الطالب الغائب كأن درجته 0 ويطبع 5.",
      code: `void main() {
  final scores = {"Sara": 90};
  int score = scores["Omar"];
  print(score + 5);
}`,
      expected: "5",
      hint: "scores[\"Omar\"] من نوع int?‎ لأن المفتاح قد لا يوجد. أعطه قيمة احتياطية بـ ??",
      solution: `void main() {
  final scores = {"Sara": 90};
  int score = scores["Omar"] ?? 0;
  print(score + 5);
}`,
    },
    {
      kind: "write",
      lang: "dart",
      title: "ترحيب بالضيف",
      prompt: "أكمل greet: تأخذ String?‎ وترجع Hello, Sara حين يوجد اسم، و Hello, guest حين يكون null. يجب أن يطبع البرنامج السطرين: Hello, guest ثم Hello, Sara.",
      starter: `String greet(String? name) {
  // return "Hello, " followed by the name, or "guest" when name is null
  return "";
}

void main() {
  print(greet(null));
  print(greet("Sara"));
}
`,
      expected: "Hello, guest\nHello, Sara",
      hint: "سطر واحد يكفي: return \"Hello, ${name ?? \"guest\"}\";",
      solution: `String greet(String? name) {
  return "Hello, \${name ?? "guest"}";
}

void main() {
  print(greet(null));
  print(greet("Sara"));
}
`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: 'String? a;\nString b = a ?? "x";\nprint(b.length);',
      options: ["1", "null", "خطأ: a فارغة"],
      answer: 0,
      why: "a فارغة، فيأخذ ‎??‎ القيمة \"x\". b من نوع String، فالمترجم يعرف أنها لا تكون فارغة، وطولها 1.",
    },
    {
      question: "ماذا يحدث هنا؟",
      code: "int count;\nprint(count);",
      options: ["المترجم يرفض: count لم تُكتب فيها قيمة قبل قراءتها", "يطبع 0", "يطبع null"],
      answer: 0,
      why: "int بلا ؟ لا يكون null أبداً، ولا يأخذ 0 تلقائياً. فدرج لم يُكتب فيه شيء لا يُقرأ. المترجم يتتبّع كل طريق إلى سطر القراءة ويرفضه قبل التشغيل.",
    },
    {
      question: "هل يقبل المترجم السطر الثاني؟",
      code: 'String? name = "Sara";\nprint(name.length);',
      options: ["نعم، ويطبع 4", "لا: name من نوع String?", "نعم، ويطبع null"],
      answer: 0,
      why: "الدرج من نوع String?‎، لكن المترجم رأى أن آخر ما كُتب فيه نص حقيقي، فيرقّيه إلى String حتى يُكتب فيه شيء آخر. الترقية تتبع ما حدث فعلاً في الكود، لا الاسم المكتوب على الدرج فقط.",
    },
    {
      question: "ماذا يطبع السطر الثاني؟",
      code: "String? s;\nprint(s?.toUpperCase().length);",
      options: ["null", "0", "يتوقف بخطأ عند length"],
      answer: 0,
      why: "‎?.‎ توقف السلسلة كلها عند أول null: لا تُستدعى toUpperCase ولا length، والنتيجة null. هذا اسمه القطع المبكر (short-circuit).",
    },
    {
      question: "ماذا يطبع هذا البرنامج، وبأي ترتيب؟",
      code: 'int compute() {\n  print("computing");\n  return 7;\n}\nvoid main() {\n  late final int big = compute();\n  print("start");\n  print(big);\n  print(big);\n}',
      options: ["start ثم computing ثم 7 ثم 7", "computing ثم start ثم 7 ثم 7", "start ثم computing ثم 7 ثم computing ثم 7"],
      answer: 0,
      why: "late مع قيمة ابتدائية تؤجّل الحساب إلى أول قراءة: لا يُستدعى compute عند السطر 6، بل عند أول print(big). بعدها تبقى 7 في الدرج، فالقراءة الثانية لا تحسب من جديد.",
    },
  ],
  next: "dart-types",
};
