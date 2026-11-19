import type { Cell, Lesson, Scene } from "@/lib/types";

const str = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const box = (name: string, value: string): Cell => ({ name, value, type: "none" });

/** A tiny hand-written scene for a predict answer (Dart does not run in the course). */
const mini = (dart: string, steps: Scene["steps"]): Scene => ({ code: { dart }, steps });

const BODY = '[{"name":"tea","price":5},{"name":"cake","price":12}]';

const NO_AWAIT = `Future<void> load() async {
  final res = http.get(Uri.parse("https://shop.test/products"));
  print(res);
}`;

const DECODE = `final body = '{"name":"tea","price":5}';
final m = jsonDecode(body);
print(m["price"] + 1);`;

const FIRST_FRAME = `FutureBuilder(future: load(), builder: (context, snap) {
  if (snap.hasError) return Text("error");
  if (!snap.hasData) return CircularProgressIndicator();
  return ListView(children: [for (final p in snap.data!) Text(p.name)]);
})
// the network is fast: the answer arrives after 50 ms`;

export const flutterApi: Lesson = {
  slug: "flutter-api",
  stage: 9,
  number: "9.4",
  title: "الاتصال بالـ API",
  subtitle: "التطبيق عميل لخادمك: طلب يعيد Future، والشاشة تتبدّل مع كل مرحلة",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "الإنترنت في الجيب ليس مضموناً",
    body: "التطبيق يجلب المنتجات من الخادم الذي بنيته في المرحلة 7. حرّك مؤشر الشبكة: سريعة، ثم بطيئة، ثم مقطوعة، وافتح التطبيق في كل مرة. ماذا يرى المستخدم وهو ينتظر؟ وماذا يرى حين يفشل الطلب؟",
    demo: "flutterApi",
  },
  scene: {
    code: {
      dart: `Future<List<Product>> load() async {
  final res = await http.get(Uri.parse("https://shop.test/products"));
  final List data = jsonDecode(res.body);
  return [for (final m in data) Product.fromJson(m)];
}
FutureBuilder(future: load(), builder: (context, snap) {
  if (snap.hasError) return Text("error: \${snap.error}");
  if (!snap.hasData) return CircularProgressIndicator();
  return ListView(children: [for (final p in snap.data!) Text(p.name)]); });`,
    },
    notes: {
      dart: "http.get من حزمة http، و jsonDecode من dart:convert. و Product.fromJson مصنع (factory) تكتبه أنت: يأخذ Map ويعيد كائناً له أنواع، فتكتب p.name بدل m[\"name\"] ويكشف المترجم أخطاء الأسماء.",
    },
    steps: [
      {
        line: null,
        say: "خادمك من المرحلة 7 يعمل على shop.test، و GET /products يعيد JSON. التطبيق على الهاتف عميل له، تماماً مثل المتصفح.",
        memory: [],
      },
      {
        line: 6,
        say: "FutureBuilder يستدعي load مرة واحدة ويحفظ ما تعيده: Future، إيصال لقائمة لم تصل بعد.",
        memory: [box("future", "pending"), box("snap", "no data")],
        changed: ["future", "snap"],
      },
      {
        line: 2,
        say: "داخل load: http.get ترسل الطلب وتعيد Future فوراً. await توقف load وحدها، والتطبيق لا يتجمّد.",
        memory: [box("future", "pending"), box("snap", "no data")],
      },
      {
        line: 8,
        say: "FutureBuilder لا ينتظر: يستدعي builder الآن. لا خطأ ولا بيانات، فالشرط الثاني صحيح ويعيد دائرة تحميل.",
        memory: [box("future", "pending"), box("snap", "no data"), str("screen", "spinner")],
        changed: ["screen"],
        read: ["snap"],
      },
      {
        line: 2,
        say: "وصل الرد بعد قليل: status 200، و res.body نص طويل. مجرد حروف، لا قائمة بعد.",
        memory: [box("future", "pending"), box("snap", "no data"), str("screen", "spinner"), str("res.body", BODY)],
        changed: ["res.body"],
      },
      {
        line: 3,
        say: "jsonDecode يقرأ النص ويبني منه قائمة فيها Map لكل منتج. الآن price رقم 5، لا حرف \"5\".",
        memory: [box("future", "pending"), box("snap", "no data"), str("screen", "spinner"), box("data", "[{name: tea, price: 5}, {name: cake, price: 12}]")],
        changed: ["data"],
        read: ["res.body"],
      },
      {
        line: 4,
        say: "fromJson يحوّل كل Map إلى كائن Product. return تملأ الإيصال بالقائمة.",
        memory: [box("future", "done"), box("snap", "no data"), str("screen", "spinner"), box("products", "[Product(tea, 5), Product(cake, 12)]")],
        changed: ["products", "future"],
        read: ["data"],
      },
      {
        line: 6,
        say: "امتلأ الإيصال، فيضع FutureBuilder القائمة في snap ويستدعي builder من جديد، كأنه setState.",
        memory: [box("future", "done"), box("snap", "data: 2 products"), str("screen", "spinner"), box("products", "[Product(tea, 5), Product(cake, 12)]")],
        changed: ["snap"],
      },
      {
        line: 9,
        say: "لا خطأ، وفيه بيانات: يصل builder إلى السطر الأخير ويعيد قائمة. الشاشة: tea و cake.",
        memory: [box("future", "done"), box("snap", "data: 2 products"), str("screen", "tea, cake"), box("products", "[Product(tea, 5), Product(cake, 12)]")],
        changed: ["screen"],
        read: ["snap"],
      },
      {
        line: 7,
        say: "ولو كان الهاتف بلا شبكة: http.get ترمي خطأ، فيمتلئ الإيصال بالخطأ بدل القائمة، ويعيد builder رسالة الخطأ. ثلاث شاشات لثلاث مراحل، وكلها جزء من التصميم.",
        memory: [box("future", "failed"), box("snap", "error: SocketException"), str("screen", "error: SocketException")],
        changed: ["future", "snap", "screen"],
      },
    ],
  },
  playground: {
    kind: "trace",
    intro: "Flutter لا يعمل هنا، فهذه محاكاة بـ JavaScript: fakeGet تقلّد الطلب وتفشل إن كانت الشبكة offline، و fromJson تحوّل كل Map إلى منتج، و builder تختار الشاشة من snap كما يفعل FutureBuilder.",
    starter: `function fakeGet(network) {
  if (network === "offline") {
    throw new Error("no connection");
  }
  return [{ name: "tea", price: 5 }, { name: "cake", price: 12 }];
}
function fromJson(m) {
  return { name: m.name, price: m.price };
}
function builder(snap) {
  if (snap.error) return "error: " + snap.error + " [retry]";
  if (!snap.data) return "spinner";
  let rows = [];
  for (const p of snap.data) rows.push(p.name + " " + p.price);
  return rows.join(", ");
}
let snap = { data: null, error: null };
console.log(builder(snap));
try {
  const maps = fakeGet("fast");
  let products = [];
  for (const m of maps) products.push(fromJson(m));
  snap = { data: products, error: null };
} catch (e) {
  snap = { data: null, error: e.message };
}
console.log(builder(snap));`,
    challenges: [
      "قبل التشغيل: ما أول سطر يُطبع، ولماذا يظهر حتى لو كانت الشبكة سريعة؟",
      "غيّر \"fast\" إلى \"offline\". توقّع السطر الثاني قبل أن تضغط، وتتبّع أين يقفز التنفيذ.",
      "اجعل fromJson تعيد name فقط. ماذا يُطبع مكان السعر؟ (هذا ما يمنعه fromJson مكتوب بأنواع في Dart.)",
      "بدّل ترتيب أول سطرين في builder، ثم جرّب offline. لماذا تبقى الدائرة إلى الأبد ولا يظهر الخطأ؟",
    ],
  },
  predict: [
    {
      question: "نسينا await. ماذا يُطبع؟",
      code: NO_AWAIT,
      options: ["Instance of 'Future<Response>'", "Instance of 'Response'", "قائمة المنتجات"],
      answer: 0,
      why: "http.get لا تملك الرد لحظة استدعائها، فتعيد Future فوراً: إيصالاً. بلا await يوضع الإيصال نفسه في res. مع await تنتظره وتفتحه فيصير res هو الرد.",
      scene: mini(NO_AWAIT, [
        { line: 2, say: "http.get ترسل الطلب وتعيد Future فوراً، والرد لم يصل.", memory: [box("res", "Future (pending)")], changed: ["res"] },
        { line: 3, say: "بلا await لا أحد ينتظر. res هو الإيصال، فيُطبع كما هو.", memory: [box("res", "Future (pending)")], read: ["res"], output: ["Instance of 'Future<Response>'"] },
      ]),
    },
    {
      question: "ماذا يُطبع؟",
      code: DECODE,
      options: ["6", "51", "خطأ: لا يمكن جمع نص ورقم"],
      answer: 0,
      why: "body نص، لكن jsonDecode يبني منه Map حقيقية. في JSON القيمة 5 مكتوبة بلا علامات تنصيص، فتصير رقماً int، و 5 + 1 = 6.",
      scene: mini(DECODE, [
        { line: 1, say: "body نص من حروف، كما يصل من الشبكة.", memory: [str("body", '{"name":"tea","price":5}')], changed: ["body"] },
        { line: 2, say: "jsonDecode يقرأ النص ويبني Map: name نص، و price رقم.", memory: [str("body", '{"name":"tea","price":5}'), box("m", "{name: tea, price: 5}")], changed: ["m"], read: ["body"] },
        { line: 3, say: "m[\"price\"] هو الرقم 5، و 5 + 1 = 6.", memory: [str("body", '{"name":"tea","price":5}'), box("m", "{name: tea, price: 5}")], read: ["m"], output: ["6"] },
      ]),
    },
    {
      question: "الشبكة سريعة جداً. ماذا يرسم builder في أول مرة يُستدعى فيها؟",
      code: FIRST_FRAME,
      options: ["دائرة التحميل، ولو للحظة", "القائمة مباشرة", "شاشة فارغة حتى يصل الرد"],
      answer: 0,
      why: "FutureBuilder يستدعي builder فوراً ليرسم الإطار الأول، والرد لم يصل بعد مهما كانت الشبكة سريعة. فحالة الانتظار تُرسم دائماً، ثم يُعاد البناء حين يمتلئ الإيصال.",
      scene: mini(FIRST_FRAME, [
        { line: 1, say: "load() تُستدعى وتعيد Future فوراً. snap بلا بيانات.", memory: [box("snap", "no data")] },
        { line: 3, say: "builder يُستدعى الآن: لا خطأ ولا بيانات، فيعيد الدائرة.", memory: [box("snap", "no data"), str("screen", "spinner")], changed: ["screen"], read: ["snap"] },
        { line: 4, say: "بعد 50ms يمتلئ الإيصال، فيُعاد البناء وتظهر القائمة.", memory: [box("snap", "data"), str("screen", "list")], changed: ["snap", "screen"] },
      ]),
    },
  ],
  code: {
    intro: "هذه الشاشة كاملة كما تكتبها في تطبيق Flutter حقيقي: نموذج Product مع fromJson، ودالة load تتحقق من statusCode، و FutureBuilder بثلاث شاشات، وزر retry يطلب من جديد. لاحظ أن الـ Future يُصنع في initState مرة واحدة، لا داخل build. Flutter لا يعمل داخل الدرس، فاقرأ الكود وتتبّع مراحله.",
    runnerLang: "text",
    runnerStarter: `class Product {
  final String name;
  final int price;
  Product({required this.name, required this.price});
  factory Product.fromJson(Map<String, dynamic> j) =>
      Product(name: j["name"], price: j["price"]);
}

Future<List<Product>> load() async {
  final res = await http.get(Uri.parse("https://shop.test/products"));
  if (res.statusCode != 200) throw Exception("HTTP \${res.statusCode}");
  final List data = jsonDecode(res.body);
  return [for (final m in data) Product.fromJson(m)];
}

class _ProductsState extends State<ProductsScreen> {
  late Future<List<Product>> future;
  @override
  void initState() {
    super.initState();
    future = load(); // once, not inside build
  }
  @override
  Widget build(BuildContext context) {
    return FutureBuilder(future: future, builder: (context, snap) {
      if (snap.hasError) {
        return Column(children: [
          Text("could not load: \${snap.error}"),
          ElevatedButton(
            onPressed: () => setState(() { future = load(); }), // retry
            child: const Text("retry"),
          ),
        ]);
      }
      if (!snap.hasData) return const CircularProgressIndicator();
      return ListView(children: [
        for (final p in snap.data!) ListTile(title: Text(p.name), trailing: Text("\${p.price} SAR")),
      ]);
    });
  }
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "من الشبكة إلى الكائنات",
      prompt: "رتّب أسطر load: اطلب، ثم حوّل النص إلى Maps، ثم Maps إلى منتجات.",
      lines: [
        "Future<List<Product>> load() async {",
        '  final res = await http.get(Uri.parse("https://shop.test/products"));',
        "  final List data = jsonDecode(res.body);",
        "  return [for (final m in data) Product.fromJson(m)];",
        "}",
      ],
      expected: "[Product(tea, 5), Product(cake, 12)]",
    },
    {
      kind: "fill",
      lang: "text",
      title: "انتظر الرد",
      prompt: "أي كلمة تجعل res هو الرد نفسه لا الإيصال؟",
      template: 'final res = ___ http.get(Uri.parse("https://shop.test/products"));',
      options: ["await", "async", "return"],
      answer: "await",
      expected: "200",
    },
    {
      kind: "order",
      lang: "text",
      title: "ثلاث شاشات",
      prompt: "رتّب فروع builder حتى يظهر الخطأ حين يفشل الطلب، والدائرة وهو ينتظر، والقائمة حين تصل.",
      lines: [
        "builder: (context, snap) {",
        '  if (snap.hasError) return Text("error: ${snap.error}");',
        "  if (!snap.hasData) return CircularProgressIndicator();",
        "  return ListView(children: [for (final p in snap.data!) Text(p.name)]);",
        "}",
      ],
      expected: "spinner, then list or error",
    },
    {
      kind: "fill",
      lang: "text",
      title: "من نص إلى Map",
      prompt: "res.body نص. أي دالة تبني منه قائمة Maps؟",
      template: "final List data = ___(res.body);",
      options: ["jsonDecode", "Uri.parse", "Product.fromJson"],
      answer: "jsonDecode",
      expected: "[{name: tea, price: 5}]",
    },
  ],
  quiz: [
    {
      question: "الهاتف في وضع الطيران. ماذا يعرض FutureBuilder بعد أن يفشل الطلب؟",
      code: 'if (snap.hasError) return Text("error: ${snap.error}");\nif (!snap.hasData) return CircularProgressIndicator();\nreturn ListView(...);',
      options: ["رسالة الخطأ", "دائرة التحميل إلى الأبد", "قائمة فارغة"],
      answer: 0,
      why: "http.get ترمي خطأ، فيمتلئ الإيصال بالخطأ بدل القائمة. يُعاد بناء builder و snap.hasError صحيح، فيعيد الفرع الأول. لهذا نتحقق من الخطأ قبل غياب البيانات.",
    },
    {
      question: "الخادم أعاد 500 وصفحة HTML. ماذا تفعل http.get؟",
      code: 'final res = await http.get(Uri.parse(url));\nprint(res.statusCode);',
      options: ["تعيد الرد عادياً ويُطبع 500، والتحقق عليك", "ترمي خطأ تلقائياً", "تعيد null"],
      answer: 0,
      why: "http.get ترمي فقط حين لا يصل رد أصلاً (لا شبكة). 500 رد كامل وصل، فيوضع في res. لذلك نكتب if (res.statusCode != 200) throw ... قبل jsonDecode، وإلا حاول قراءة HTML كـ JSON.",
    },
    {
      question: "صاحب هذه الشاشة يستدعي setState كل ثانية لتحديث ساعة. كم طلباً يذهب إلى الخادم في دقيقة؟",
      code: "Widget build(BuildContext context) {\n  return FutureBuilder(future: load(), builder: ...);\n}",
      options: ["نحو 60: طلب مع كل build", "طلب واحد", "لا شيء"],
      answer: 0,
      why: "load() مكتوبة داخل build، فكل build يستدعيها ويصنع Future جديداً وطلباً جديداً، وتعود الدائرة كل مرة. اصنع الـ Future مرة في initState واحفظه، وأعطِ FutureBuilder المحفوظ.",
    },
    {
      question: "رتّبنا builder هكذا، والشبكة مقطوعة. ماذا يرى المستخدم؟",
      code: 'if (!snap.hasData) return CircularProgressIndicator();\nif (snap.hasError) return Text("error");\nreturn ListView(...);',
      options: ["دائرة التحميل إلى الأبد", "رسالة error", "القائمة"],
      answer: 0,
      why: "حين يفشل الطلب لا بيانات أبداً، فالشرط الأول صحيح في كل بناء ويعود قبل أن يصل إلى فحص الخطأ. المستخدم ينتظر شيئاً لن يأتي. تحقّق من الخطأ أولاً.",
    },
    {
      question: "jsonDecode أعاد Map فيها \"nmae\" بدل \"name\" بسبب خطأ في الخادم. أين يظهر الخطأ أولاً؟",
      code: 'factory Product.fromJson(Map<String, dynamic> j) =>\n    Product(name: j["name"], price: j["price"]);',
      options: [
        "في fromJson: j[\"name\"] يعطي null والحقل name نص لا يقبل null",
        "في الشاشة: يظهر اسم فارغ بصمت",
        "لا خطأ أبداً",
      ],
      answer: 0,
      why: "fromJson هي البوابة بين JSON غير الموثوق وكائنات لها أنواع. null لا يدخل حقلاً من نوع String (أمان null من درس Dart)، فيفشل التحويل في مكان واحد واضح، ويصل الخطأ إلى snap.hasError بدل أن تعرض الشاشة بيانات ناقصة.",
    },
  ],
  next: "stack-heap",
};
