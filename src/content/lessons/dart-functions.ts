import type { Frame, HeapObj, Lesson, Scene, Slot, Step } from "@/lib/types";

const num = (name: string, value: number | string): Slot => ({ name, value: String(value), type: "number" });
const bool = (name: string, value: boolean): Slot => ({ name, value: String(value), type: "boolean" });
const str = (name: string, value: string): Slot => ({ name, value: `"${value}"`, type: "string" });
const fn = (name: string): Slot => ({ name, value: "fn", type: "function" });
const main = (vars: Slot[]): Frame => ({ id: 1, name: "main", vars });
const call = (name: string, vars: Slot[], id = 2): Frame => ({ id, name, vars });
/** A step in the stack view: the drawers live in frames, so `memory` stays empty. */
const at = (line: number | null, say: string, frames: Frame[], extra: Partial<Step> = {}, heap: HeapObj[] = []): Step => ({
  line,
  say,
  memory: [],
  frames,
  heap,
  ...extra,
});
const dart = (code: string, steps: Step[]): Scene => ({ code: { dart: code }, steps });

export const dartFunctions: Lesson = {
  slug: "dart-functions",
  stage: 0,
  number: "1.5",
  title: "الدوال",
  subtitle: "كل استدعاء يبني إطاراً جديداً على المكدّس، بأدراج جديدة لمعاملاته، ثم يزول حين ترجع الدالة",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "ماذا تعني true هنا؟",
    body: "زميلك كتب استدعاء دالة لطلب قهوة. انظر إلى القيم وخمّن معنى كل واحدة منها، ثم اكشف كيف يكتبها Dart بأسماء.",
    demo: "dartFunctions",
  },
  scene: {
    code: {
      dart: `double price(double base, {int qty = 1, bool vip = false}) {
  final total = base * qty;
  return vip ? total * 0.9 : total;
}
void main() {
  final a = price(10, qty: 3);
  final b = price(10, vip: true);
  print("$a $b");
}`,
    },
    steps: [
      at(null, "الدالة وصفة مكتوبة مرة واحدة. لا شيء يحدث حين تُعرَّف، بل حين تُستدعى. نراقب الآن المكدّس: كل استدعاء يضع فوقه إطاراً فيه أدراجه الخاصة.", []),
      at(5, "البرنامج يبدأ من main: إطار أول على المكدّس، فارغ الآن.", [main([])]),
      at(
        6,
        "استدعاء price: إطار جديد فوق main. القيمة 10 تُنسخ إلى base (وتصير 10.0 لأن base من نوع double)، و qty: 3 تذهب إلى qty باسمها، و vip لم تُعطَ فتأخذ قيمتها الافتراضية false.",
        [main([]), call("price", [num("base", "10.0"), num("qty", 3), bool("vip", false)])],
        { changed: ["base", "qty", "vip"] },
      ),
      at(
        2,
        "total درج داخل إطار price وحده: ‏10.0 × 3 = 30.0. لا يراه main، ولا يبقى بعد رجوع الدالة.",
        [main([]), call("price", [num("base", "10.0"), num("qty", 3), bool("vip", false), num("total", "30.0")])],
        { changed: ["total"], read: ["base", "qty"] },
      ),
      at(
        3,
        "vip قيمتها false، فيرجع total كما هو: 30.0. return تحمل القيمة إلى من استدعى، ثم يُزال الإطار كله بأدراجه.",
        [main([num("a", "30.0")])],
        { changed: ["a"] },
      ),
      at(
        7,
        "استدعاء ثانٍ: إطار جديد تماماً، لا يتذكر شيئاً من الأول. هذه المرة vip: true، و qty لم تُعطَ فتأخذ 1.",
        [main([num("a", "30.0")]), call("price", [num("base", "10.0"), num("qty", 1), bool("vip", true)], 3)],
        { changed: ["base", "qty", "vip"] },
      ),
      at(
        2,
        "total = 10.0 × 1 = 10.0.",
        [main([num("a", "30.0")]), call("price", [num("base", "10.0"), num("qty", 1), bool("vip", true), num("total", "10.0")], 3)],
        { changed: ["total"], read: ["base", "qty"] },
      ),
      at(
        3,
        "vip قيمتها true، فيرجع total × 0.9 = 9.0. يُزال الإطار، والقيمة تذهب إلى b.",
        [main([num("a", "30.0"), num("b", "9.0")])],
        { changed: ["b"], read: ["vip", "total"] },
      ),
      at(8, "يطبع 30.0 9.0.", [main([num("a", "30.0"), num("b", "9.0")])], { read: ["a", "b"], output: ["30.0 9.0"] }),
      at(
        null,
        "الصورة: الوسائط تُنسخ إلى أدراج جديدة في إطار جديد، والمعاملات المسمّاة بين { } تُمرَّر بأسمائها ولها قيم افتراضية، و return ترجع قيمة واحدة ثم يختفي الإطار.",
        [],
        { output: ["30.0 9.0"] },
      ),
    ],
    notes: {
      dart: "نوع الرجوع قبل اسم الدالة، و void حين لا ترجع شيئاً. المعاملات الموضعية بالترتيب، والاختيارية الموضعية بين [ ]، والمسمّاة بين { } مع قيمة افتراضية أو required. ‎=> expr‎ اختصار لـ { return expr; }‎.",
    },
  },
  playground: {
    kind: "trace",
    intro: "الدالة نفسها بـ JavaScript، وفيها ترى الإطارات على المكدّس. JavaScript ليس فيها معاملات مسمّاة، فنمرر كائناً opts ونأخذ القيم الافتراضية بـ ??. في آخره دالة ترجع دالة: راقب كيف يبقى count حياً.",
    starter: `function price(base, opts) {
  const qty = opts.qty ?? 1;
  const vip = opts.vip ?? false;
  const total = base * qty;
  return vip ? total * 0.9 : total;
}
const a = price(10, { qty: 3 });
const b = price(10, { vip: true });
console.log(a, b);
function makeCounter() {
  let count = 0;
  return function () {
    count = count + 1;
    return count;
  };
}
const next = makeCounter();
next();
console.log(next());`,
    challenges: [
      "قبل التشغيل: كم إطاراً لـ price يُبنى؟ هل يتذكر الإطار الثاني total من الأول؟",
      "استدعِ price(10, {}) واطبعها. أي القيم الافتراضية استُعملت؟",
      "أضف next(); مرة أخرى قبل الطباعة. ماذا يطبع؟ أين يعيش count بعد أن رجعت makeCounter؟",
      "اصنع عدّاداً ثانياً const other = makeCounter(); واطبع other(). هل يشارك count مع next؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `void addTen(int n) {
  n = n + 10;
}
void main() {
  var score = 5;
  addTen(score);
  print(score);
}`,
      options: ["5", "15", "خطأ: لا يمكن تغيير n"],
      answer: 0,
      why: "n درج جديد في إطار addTen، نُسخت إليه القيمة 5. تغييره لا يلمس score في إطار main، ثم يختفي مع إطاره. لتغيير score، اجعل الدالة ترجع القيمة: score = addTen(score)‎.",
      scene: dart(
        `void addTen(int n) {
  n = n + 10;
}
void main() {
  var score = 5;
  addTen(score);
  print(score);
}`,
        [
          at(5, "score = 5 في إطار main.", [main([num("score", 5)])], { changed: ["score"] }),
          at(6, "الاستدعاء ينسخ 5 إلى درج جديد n في إطار addTen.", [main([num("score", 5)]), call("addTen", [num("n", 5)])], { changed: ["n"], copy: { from: "score", to: "n" } }),
          at(2, "n يصبح 15. هذا درج addTen، لا درج main.", [main([num("score", 5)]), call("addTen", [num("n", 15)])], { changed: ["n"], read: ["n"] }),
          at(3, "الدالة تنتهي: يُزال إطارها ومعه n.", [main([num("score", 5)])]),
          at(7, "score لم يتغير: 5.", [main([num("score", 5)])], { read: ["score"], output: ["5"] }),
        ],
      ),
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `String tag(String word, [String sign = "#"]) => "$sign$word";
void main() {
  print(tag("dart"));
  print(tag("go", "@"));
}`,
      options: ["‎#dart ثم ‎@go", "dart ثم go", "خطأ: tag تحتاج معاملين"],
      answer: 0,
      why: "المعامل بين [ ] اختياري موضعي: إن لم تعطه أخذ قيمته الافتراضية \"#\"، وإن أعطيته أخذ ما أعطيت. كل استدعاء يبني إطاراً جديداً بقيمه.",
      scene: dart(
        `String tag(String word, [String sign = "#"]) => "$sign$word";
void main() {
  print(tag("dart"));
  print(tag("go", "@"));
}`,
        [
          at(3, "tag(\"dart\")‎: لم يُعطَ sign، فيأخذ \"#\".", [main([]), call("tag", [str("word", "dart"), str("sign", "#")])], { changed: ["word", "sign"] }),
          at(1, "ترجع \"#dart\" ويُزال الإطار.", [main([])], { output: ["#dart"] }),
          at(4, "هذه المرة sign = \"@\".", [main([]), call("tag", [str("word", "go"), str("sign", "@")], 3)], { changed: ["word", "sign"], output: ["#dart"] }),
          at(1, "ترجع \"@go\".", [main([])], { output: ["#dart", "@go"] }),
        ],
      ),
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `void main() {
  var x = 1;
  final show = () => print(x);
  x = 2;
  show();
}`,
      options: ["2", "1", "خطأ: x تغيّر بعد صنع الدالة"],
      answer: 0,
      why: "الدالة المجهولة لا تنسخ قيمة x حين تُصنع، بل تمسك بالدرج x نفسه (هذا هو الإغلاق، closure). حين تُستدعى تقرأ ما فيه الآن: 2.",
      scene: dart(
        `void main() {
  var x = 1;
  final show = () => print(x);
  x = 2;
  show();
}`,
        [
          at(2, "x = 1.", [main([num("x", 1)])], { changed: ["x"] }),
          at(3, "show دالة تشير إلى الدرج x، لا إلى القيمة 1. لم تعمل بعد.", [main([num("x", 1), fn("show")])], { changed: ["show"] }),
          at(4, "x يصبح 2.", [main([num("x", 2), fn("show")])], { changed: ["x"] }),
          at(5, "show تعمل الآن وتقرأ الدرج x: فيه 2.", [main([num("x", 2), fn("show")]), call("show", [])], { read: ["x"], output: ["2"] }),
        ],
      ),
    },
  ],
  code: {
    intro: "برنامج Dart حقيقي على خادم التشغيل: معاملات مسمّاة و required، ومعامل اختياري، ودالة تُمرَّر كقيمة، ودالة ترجع دالة. شغّله ثم جرّب ما في التعليق.",
    runnerLang: "dart",
    runnerStarter: `double price(double base, {int qty = 1, bool vip = false}) {
  final total = base * qty;
  return vip ? total * 0.9 : total;
}

String greet(String name, [String greeting = "Hello"]) => "$greeting, $name";

int applyTwice(int x, int Function(int) op) => op(op(x));

int Function() makeCounter() {
  var count = 0;
  return () => ++count;
}

void main() {
  print(price(10, qty: 3));
  print(price(10, vip: true, qty: 2)); // named: any order
  print(greet("Sara"));
  print(greet("Omar", "Welcome"));
  print(applyTwice(3, (n) => n * n));
  final next = makeCounter();
  next();
  print(next());
  // try: call price(10, 3) without the name qty, and read the error
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "dart",
      title: "معامل مطلوب بالاسم",
      prompt: "رتّب الأسطر: دالة greet لها معامل مسمّى مطلوب name، ومعامل title افتراضيه Ms، ثم main تطبع Hello Ms Sara.",
      lines: [
        'String greet({required String name, String title = "Ms"}) {',
        '  return "Hello $title $name";',
        "}",
        "void main() {",
        '  print(greet(name: "Sara"));',
        "}",
      ],
      expected: "Hello Ms Sara",
    },
    {
      kind: "fill",
      lang: "dart",
      title: "دالة في سطر",
      prompt: "أي رمز يجعل square دالة من سطر واحد ترجع n × n، فيطبع البرنامج 49؟",
      template: `int square(int n) ___ n * n;

void main() => print(square(7));`,
      options: ["=>", "->", ":"],
      answer: "=>",
      expected: "49",
    },
    {
      kind: "fix",
      lang: "dart",
      title: "مساحة بأسماء",
      prompt: "المترجم يرفض هذا الاستدعاء. أصلحه (لا الدالة) حتى يطبع 12.0.",
      code: `double area({required double w, required double h}) => w * h;

void main() {
  print(area(3, 4));
}`,
      expected: "12.0",
      hint: "المعاملات بين { } تُمرَّر بأسمائها: w: 3",
      solution: `double area({required double w, required double h}) => w * h;

void main() {
  print(area(w: 3, h: 4));
}`,
    },
    {
      kind: "write",
      lang: "dart",
      title: "عدّاد يتذكر",
      prompt: "أكمل makeCounter: تصنع درجاً count يبدأ من 0، وترجع دالة كل استدعاء لها يزيد count واحداً ويرجعه. البرنامج يستدعيها ثلاث مرات ويطبع 3.",
      starter: `int Function() makeCounter() {
  // keep a count here, and return a function that adds 1 and returns it
  return () => 0;
}

void main() {
  final next = makeCounter();
  next();
  next();
  print(next());
}
`,
      expected: "3",
      hint: "var count = 0; ثم return () => ++count;‎. الدالة المُرجعة تمسك بالدرج count فيبقى حياً بعد رجوع makeCounter.",
      solution: `int Function() makeCounter() {
  var count = 0;
  return () => ++count;
}

void main() {
  final next = makeCounter();
  next();
  next();
  print(next());
}
`,
    },
  ],
  quiz: [
    {
      question: "ماذا يحدث هنا؟",
      code: 'void log(String m) {\n  print(m);\n}\nvoid main() {\n  print(log("hi"));\n}',
      options: ["المترجم يرفض: قيمة void لا تُستعمل", "يطبع hi ثم null", "يطبع hi فقط"],
      answer: 0,
      why: "void تعني «هذه الدالة لا ترجع شيئاً يُستعمل». المترجم يمنعك من وضع ناتجها في print أو في متغير، فلا تحسب بقيمة لا معنى لها.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: 'String pair({required String a, required String b}) => "$a$b";\nprint(pair(b: "1", a: "2"));',
      options: ["21", "12", "خطأ: الترتيب خاطئ"],
      answer: 0,
      why: "المعاملات المسمّاة تذهب إلى أدراجها بأسمائها لا بترتيبها: a = \"2\" و b = \"1\"، والدالة تكتب a ثم b.",
    },
    {
      question: "ماذا يطبع print(f(4))؟",
      code: "int f(int n) => n == 0 ? 1 : n * f(n - 1);\nprint(f(4));",
      options: ["24", "4", "10"],
      answer: 0,
      why: "كل استدعاء يبني إطاراً فوق الآخر: f(4)، f(3)، f(2)، f(1)، f(0). ‏f(0) ترجع 1، ثم ترجع الإطارات واحداً واحداً تضرب: 1 × 2 × 3 × 4 = 24.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: "int apply(int x, int Function(int) op) => op(x);\nprint(apply(3, (n) => n * n));",
      options: ["9", "6", "خطأ: لا تُمرَّر الدوال كقيم"],
      answer: 0,
      why: "في Dart الدالة قيمة مثل أي قيمة، ونوعها هنا int Function(int)‎. apply تستدعي ما أُعطي لها على 3: ‏3 × 3 = 9.",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: 'void addTea(List<String> cart) {\n  cart.add("tea");\n}\nvoid main() {\n  final cart = <String>[];\n  addTea(cart);\n  addTea(cart);\n  print(cart.length);\n}',
      options: ["2", "0", "1"],
      answer: 0,
      why: "الدرج cart لا يحمل القائمة نفسها بل عنوانها في الكومة. التمرير ينسخ العنوان، فالدالة والمستدعي يشيران إلى القائمة نفسها، وكل add يضيف إليها. قارن مع int في addTen: هناك نُسخت القيمة نفسها.",
    },
  ],
  next: "dart-collections",
};
