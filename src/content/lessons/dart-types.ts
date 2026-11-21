import type { Cell, Lesson, Scene, Step } from "@/lib/types";

const n = (name: string, value: number | string): Cell => ({ name, value: String(value), type: "number" });
const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const b = (name: string, value: boolean): Cell => ({ name, value: String(value), type: "boolean" });
/** What the compiler knows about a drawer before anything runs: its type, written on the label. */
const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const dart = (code: string, steps: Step[]): Scene => ({ code: { dart: code }, steps });

const base = [n("cups", 3), n("price", 7.5)];

export const dartTypes: Lesson = {
  slug: "dart-types",
  stage: 0,
  number: "1.3",
  title: "الأنواع",
  subtitle: "كل قيمة كائن يحمل نوعه، والتحويل بين الأنواع تكتبه أنت لا يخمّنه البرنامج",
  minutes: 20,
  singleLanguage: true,
  problem: {
    title: "سلة تجمع النصوص",
    body: "الأسعار تصل من نموذج على الشاشة، والنموذج يعطي نصوصاً دائماً. أضف بعض المنتجات إلى السلة وراقب المجموع في البرنامجين.",
    demo: "dartTypes",
  },
  scene: {
    code: {
      dart: `void main() {
  int cups = 3;
  double price = 7.5;
  double total = cups * price;
  int whole = total.toInt();
  String label = "$whole SAR";
  int parsed = int.parse("42");
  print("$total $label \${parsed + 1} \${total is double}");
}`,
    },
    steps: [
      {
        line: null,
        say: "في Dart كل قيمة كائن، وكل كائن يعرف نوعه. والأدراج أيضاً عليها أنواع: درج int لا يقبل إلا عدداً صحيحاً. الأنواع الأساسية: int و double و num و String و bool.",
        memory: [],
      },
      {
        line: 2,
        say: "int عدد صحيح في 64 بتاً، دقيق تماماً: 3 هو 3 بلا كسور ولا تقريب.",
        memory: [n("cups", 3)],
        changed: ["cups"],
      },
      {
        line: 3,
        say: "double عدد بفاصلة عشرية في 64 بتاً (نظام IEEE 754). يحفظ الكسور، لكن بعضها تقريبياً لأن الجهاز يكتبها بالثنائي.",
        memory: [...base],
        changed: ["price"],
      },
      {
        line: 4,
        say: "int × double: يحسب المعالج الضرب بالفاصلة العشرية، والنتيجة double: ‏3 × 7.5 = 22.5. الدرج total من نوع double فيقبلها.",
        memory: [...base, n("total", 22.5)],
        changed: ["total"],
        read: ["cups", "price"],
      },
      {
        line: 5,
        say: "لا يتحول double إلى int وحده أبداً. أنت تطلب ذلك بـ toInt()‎، وهي ترمي الكسر ولا تقرّب: 22.5 تصبح 22.",
        memory: [...base, n("total", 22.5), n("whole", 22)],
        changed: ["whole"],
        read: ["total"],
      },
      {
        line: 6,
        say: "قالب النص يستدعي toString()‎ على العدد 22، فيصنع كائن String جديداً: \"22 SAR\". العدد في whole لم يتغير.",
        memory: [...base, n("total", 22.5), n("whole", 22), s("label", "22 SAR")],
        changed: ["label"],
        read: ["whole"],
      },
      {
        line: 7,
        say: "\"42\" نص من حرفين، لا عدد. int.parse يقرأ الحروف ويصنع العدد 42. لو كان النص \"4x\" لتوقف البرنامج بخطأ FormatException.",
        memory: [...base, n("total", 22.5), n("whole", 22), s("label", "22 SAR"), n("parsed", 42)],
        changed: ["parsed"],
      },
      {
        line: 8,
        say: "parsed + 1 = 43 لأنه عدد حقاً. و total is double تسأل الكائن نفسه عن نوعه وقت التشغيل: true.",
        memory: [...base, n("total", 22.5), n("whole", 22), s("label", "22 SAR"), n("parsed", 42), b("total is double", true)],
        read: ["total", "label", "parsed"],
        output: ["22.5 22 SAR 43 true"],
      },
      {
        line: null,
        say: "الصورة: كل تحويل بين نص وعدد، أو بين double و int، سطر تكتبه أنت (toInt و int.parse و toString). لهذا لا يجمع Dart النصوص بدل الأعداد كما تفعل JavaScript.",
        memory: [...base, n("total", 22.5), n("whole", 22), s("label", "22 SAR"), n("parsed", 42)],
        output: ["22.5 22 SAR 43 true"],
      },
    ],
    notes: {
      dart: "int و double كلاهما num. لا تحويل ضمني بين الأنواع: نص إلى عدد بـ int.parse أو double.parse، و double إلى int بـ toInt()‎ أو round()‎، وأي شيء إلى نص بـ toString()‎ أو القالب ‎$x‎.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة بـ JavaScript لما يفعله مترجم Dart: typeOf تقرأ نوع القيمة كما يعرفه Dart، و assign تقبل القيمة في الدرج أو ترفضها. JavaScript نفسها لا تفرّق بين int و double، فنحن نصنع الفرق بأيدينا.",
    starter: `function typeOf(v) {
  if (typeof v === "string") return "String";
  if (typeof v === "boolean") return "bool";
  return v % 1 === 0 ? "int" : "double";
}
function assign(declared, value) {
  const t = typeOf(value);
  const isNum = t === "int" || t === "double";
  if (declared === t || (declared === "num" && isNum)) {
    return "ok: " + declared + " = " + value;
  }
  return "compile error: " + t + " can't go in " + declared;
}
console.log(assign("int", 3));
console.log(assign("double", 7.5));
console.log(assign("int", "42"));
console.log(assign("int", parseInt("42")));
console.log(assign("num", 2.5));
console.log(assign("int", 22.5));
console.log(assign("int", Math.floor(22.5)));`,
    challenges: [
      "قبل التشغيل: أي الأسطر سيُرفض؟ لماذا يُقبل \"42\" بعد parseInt فقط؟",
      "السطر الأخير يقلّد toInt()‎ (للأعداد الموجبة). غيّر Math.floor إلى Math.round وغيّر القيمة إلى 22.7. ما الفرق بين الترك والتقريب؟",
      "أضف assign(\"bool\", 1). JavaScript تعامل 1 كأنه true في الشروط، فماذا يقول Dart؟",
      "أضف assign(\"String\", 5 + \"\"). هذا ما يفعله القالب ‎\"$x\"‎ في Dart: تحويل صريح إلى نص.",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع السطر 3؟",
      code: `final sum = 0.1 + 0.2;
print(sum);
print(sum == 0.3);`,
      options: ["false", "true", "خطأ: لا تقارن double بـ =="],
      answer: 0,
      why: "0.1 و 0.2 لا تُكتبان بالثنائي بدقة، كما لا يُكتب ثلث بالعشري بدقة (0.333…). المجموع المخزّن 0.30000000000000004، فيختلف عن 0.3. للأموال احسب بأصغر وحدة كأعداد int (هللات)، أو قارن بفرق صغير.",
      scene: dart(
        `final sum = 0.1 + 0.2;
print(sum);
print(sum == 0.3);`,
        [
          { line: 1, say: "كل من 0.1 و 0.2 مخزّن كأقرب كسر ثنائي ممكن، لا بالضبط. مجموعهما يحمل الخطأ الصغير.", memory: [n("sum", "0.30000000000000004")], changed: ["sum"] },
          { line: 2, say: "print يُظهر القيمة الحقيقية المخزّنة في الدرج.", memory: [n("sum", "0.30000000000000004")], read: ["sum"], output: ["0.30000000000000004"] },
          { line: 3, say: "== تقارن البتات كما هي: القيمتان مختلفتان، فالنتيجة false.", memory: [n("sum", "0.30000000000000004")], read: ["sum"], output: ["0.30000000000000004", "false"] },
        ],
      ),
    },
    {
      question: "n فيها 5، وهو عدد صحيح. هل يقبل المترجم السطر 2؟",
      code: `num n = 5;
int i = n;
print(i);`,
      options: ["لا: num قد يكون double", "نعم، ويطبع 5", "نعم، ويطبع 5.0"],
      answer: 0,
      why: "المترجم يحكم بنوع الدرج لا بما فيه الآن: درج num قد يحمل 2.5 في برنامج آخر، فلا يُسكب في درج int بلا كلام. اكتب ما تريد صراحة: n.toInt()‎ أو n as int.",
      scene: dart(
        `num n = 5;
int i = n;
print(i);`,
        [
          { line: 1, say: "درج من نوع num: يقبل int أو double. فيه الآن 5.", memory: [n("n", 5)], changed: ["n"] },
          {
            line: 2,
            say: "المترجم لا يشغّل البرنامج ليرى القيمة. يرى فقط: num يذهب إلى int. قد يكون كسراً، فيرفض.",
            memory: [n("n", 5), label("i", "int")],
            read: ["n"],
            error: "A value of type 'num' can't be assigned to a variable of type 'int'.",
          },
        ],
      ),
    },
    {
      question: "أي سطر يرفضه المترجم؟",
      code: `Object o = "hi";
if (o is String) {
  print(o.length);
}
print(o.length);`,
      options: ["السطر 5", "السطر 3", "لا شيء، يطبع 2 مرتين"],
      answer: 0,
      why: "o درج من نوع Object، و Object ليس له length. داخل if (o is String) سأل البرنامج الكائن عن نوعه، فيرقّي المترجم o إلى String هناك فقط. خارج الأقواس عاد Object، فالسطر 5 مرفوض.",
      scene: dart(
        `Object o = "hi";
if (o is String) {
  print(o.length);
}
print(o.length);`,
        [
          { line: 1, say: "الكائن نص \"hi\"، لكن الدرج مكتوب عليه Object: أي شيء.", memory: [s("o", "hi")], changed: ["o"] },
          { line: 2, say: "is تسأل الكائن عن نوعه الحقيقي. داخل الأقواس يعرف المترجم أنه String.", memory: [s("o", "hi")], read: ["o"] },
          { line: 3, say: "هنا o يُعامل String، فـ length مقبولة.", memory: [s("o", "hi")], read: ["o"] },
          {
            line: 5,
            say: "خارج الأقواس لا ضمان، فيعود o إلى Object. ليس لكل كائن length، فيُرفض السطر قبل التشغيل.",
            memory: [s("o", "hi")],
            read: ["o"],
            error: "The getter 'length' isn't defined for the type 'Object'.",
          },
        ],
      ),
    },
  ],
  code: {
    intro: "برنامج Dart حقيقي على خادم التشغيل: يحوّل نصوصاً من نموذج إلى أعداد، ويحسب بـ int و double، ويسأل الكائنات عن أنواعها. شغّله ثم جرّب ما في التعليق الأخير.",
    runnerLang: "dart",
    runnerStarter: `void main() {
  final inputs = ["3", "7.5", "abc"];
  for (final text in inputs) {
    final value = num.tryParse(text); // null when the text is not a number
    print("$text -> $value (\${value.runtimeType})");
  }

  int halalas = 1999; // money as whole units avoids rounding errors
  final cents = (halalas % 100).toString().padLeft(2, "0");
  print("price: \${halalas ~/ 100}.$cents SAR");

  double avg = 7 / 2;
  print("avg: $avg, rounded: \${avg.round()}, cut: \${avg.toInt()}");

  num n = 4;
  print(n is int);
  // try: change "abc" to "12", or write int x = 7 / 2;
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "dart",
      title: "من نص إلى حساب",
      prompt: "رتّب الأسطر: الكمية تصل نصاً \"4\"، حوّلها إلى int، اضربها في السعر 2.5، واطبع 10.0.",
      lines: ["void main() {", '  final qty = int.parse("4");', "  final price = 2.5;", "  final total = qty * price;", "  print(total);", "}"],
      expected: "10.0",
    },
    {
      kind: "fill",
      lang: "dart",
      title: "قسمة الصناديق",
      prompt: "7 أكواب في علب تتسع لكوبين. كم علبة ممتلئة؟ أي عامل يطبع 3؟",
      template: `void main() {
  print(7 ___ 2);
}`,
      options: ["~/", "/", "%"],
      answer: "~/",
      expected: "3",
    },
    {
      kind: "fix",
      lang: "dart",
      title: "نصف في درج صحيح",
      prompt: "المترجم يرفض هذا البرنامج. أصلحه ليطبع عدد الأزواج الكاملة في 9، أي 4، مع بقاء half من نوع int.",
      code: `void main() {
  int half = 9 / 2;
  print(half);
}`,
      expected: "4",
      hint: "/ تعطي double دائماً. أي عامل يقسم ويعطي int؟",
      solution: `void main() {
  int half = 9 ~/ 2;
  print(half);
}`,
    },
    {
      kind: "write",
      lang: "dart",
      title: "سعر ثلاث قطع",
      prompt: "السعر يصل نصاً raw = \"19.99\". حوّله إلى double، اضربه في 3، واطبع الناتج بخانتين عشريتين: 59.97.",
      starter: `void main() {
  final raw = "19.99";
  // parse raw, multiply by 3, print with 2 decimal places
}
`,
      expected: "59.97",
      hint: "double.parse(raw) ثم ‎* 3‎، ثم toStringAsFixed(2) لتحويله إلى نص بخانتين.",
      solution: `void main() {
  final raw = "19.99";
  final total = double.parse(raw) * 3;
  print(total.toStringAsFixed(2));
}
`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع print(5 / 5)؟",
      code: "print(5 / 5);",
      options: ["1.0", "1", "خطأ: القسمة على int"],
      answer: 0,
      why: "/ في Dart تعطي double دائماً، حتى لو كانت القسمة بلا باقٍ. لذلك يُطبع 1.0. للقسمة الصحيحة استعمل ‎~/‎.",
    },
    {
      question: "ماذا يطبع هذا السطر؟",
      code: 'print(int.tryParse("abc") ?? -1);',
      options: ["-1", "0", "يتوقف بخطأ FormatException"],
      answer: 0,
      why: "tryParse لا توقف البرنامج: ترجع int?‎، أي null حين لا يكون النص عدداً. ثم يعطي ‎??‎ القيمة الاحتياطية -1. أما int.parse فكانت ستوقفه بخطأ.",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: "double d = 5;\nprint(d);",
      options: ["5.0", "5", "خطأ: 5 ليس double"],
      answer: 0,
      why: "الرقم المكتوب حرفياً 5 في مكان يُنتظر فيه double يُصنع double من البداية. الدرج double، فيُطبع 5.0. لكن متغير int لا يُسكب في double بلا toDouble()‎.",
    },
    {
      question: "هذا الكود يمر من المترجم. ماذا يحدث عند التشغيل؟",
      code: 'dynamic x = "hi";\nprint(x.foo);',
      options: ["يتوقف بخطأ NoSuchMethodError", "يطبع null", "يطبع hi"],
      answer: 0,
      why: "dynamic تطفئ فحص المترجم: يقبل أي شيء ويؤجّل السؤال إلى وقت التشغيل. عندها يُسأل الكائن \"hi\" عن foo فلا يجدها. لذلك يفضّل المحترفون Object?‎ مع is بدل dynamic.",
    },
    {
      question: "ماذا يطبع هذا السطر؟",
      code: "print(7 % 3 + 7 ~/ 3);",
      options: ["3", "3.33", "4"],
      answer: 0,
      why: "‎7 % 3‎ هو الباقي 1، و ‎7 ~/ 3‎ هو ناتج القسمة الصحيحة 2. كلاهما int، والمجموع 3.",
    },
  ],
  next: "dart-control",
};
