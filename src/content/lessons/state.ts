import type { Cell, Lesson, Scene } from "@/lib/types";

const num = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const ui = (name: string, text: string): Cell => ({ name, value: `"${text}"`, type: "string" });
const dirty = (on: boolean): Cell => ({ name: "dirty", value: String(on), type: "boolean" });

/** A tiny hand-written scene for a predict answer (Dart does not run in the course). */
const mini = (dart: string, steps: Scene["steps"]): Scene => ({ code: { dart }, steps });

const LOCAL_IN_BUILD = `class _CounterState extends State<Counter> {
  Widget build(BuildContext context) {
    int count = 0;
    return ElevatedButton(
      onPressed: () => setState(() { count++; }),
      child: Text("clicked $count"),
    );
  }
}`;

const NO_SETSTATE = `class _CounterState extends State<Counter> {
  int count = 0;
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () { count++; },
      child: Text("clicked $count"),
    );
  }
}`;

const NO_NOTIFY = `class Cart extends ChangeNotifier {
  int count = 0;
  void add() {
    count++;
  }
}
// CartBadge: Text("\${context.watch<Cart>().count}")
// tap "add" twice`;

export const state: Lesson = {
  slug: "state",
  stage: 9,
  number: "9.3",
  title: "إدارة الحالة",
  subtitle: "غيّر الحالة وقل لـ Flutter، وهو يعيد رسم الشاشة منها",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "السلة لا تُرى في الأعلى",
    body: "متجر صغير: قائمة منتجات، وشارة السلة في الأعلى، وشاشة السلة. أضف منتجات والعدد محفوظ داخل القائمة وحدها، وراقب الشارة. ثم انقل العدد إلى متجر مشترك وأضف من جديد: من يُعاد بناؤه الآن؟",
    demo: "state",
  },
  scene: {
    code: {
      dart: `class _CounterState extends State<Counter> {
  int count = 0;
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () => setState(() { count++; }),
      child: Text("clicked $count"),
    );
  }
}`,
    },
    notes: {
      dart: "الـ Widget نفسه (Counter) يُصنع من جديد كثيراً ولا يحفظ شيئاً، لذلك تعيش الحالة في كائن State منفصل يبقى حياً بين مرات البناء. هذا ما يجعل StatefulWidget اثنين: الـ Widget و State<Counter> الذي تراه هنا.",
    },
    steps: [
      {
        line: null,
        say: "هذا مثل useState في React تماماً. الشاشة ستُحسب من الحالة، ولن نعدّل الزر بأيدينا أبداً. Flutter أنشأ كائن State لعدّادنا، وهو الذي يبقى حياً.",
        memory: [],
      },
      {
        line: 2,
        say: "داخل كائن State درج اسمه count يبدأ بـ 0. هذا الدرج يبقى ما بقي العدّاد على الشاشة.",
        memory: [num("count", 0)],
        changed: ["count"],
      },
      {
        line: 3,
        say: "Flutter يستدعي build ليعرف شكل الشاشة. build لا يرسم شيئاً بنفسه: يعيد وصفاً.",
        memory: [num("count", 0)],
      },
      {
        line: 6,
        say: "يقرأ count ويصف زراً مكتوباً عليه clicked 0. يرسم Flutter الوصف على الشاشة.",
        memory: [num("count", 0), ui("screen", "clicked 0"), dirty(false)],
        changed: ["screen"],
        read: ["count"],
      },
      {
        line: 5,
        say: "ضغطة! onPressed يستدعي setState ومعه دالة صغيرة. setState تشغّلها أولاً: count++ فيصير 1.",
        memory: [num("count", 1), ui("screen", "clicked 0"), dirty(false)],
        changed: ["count"],
      },
      {
        line: 5,
        say: "ثم تقول setState لـ Flutter: هذا الجزء تغيّر. يُعلَّم العدّاد dirty. الشاشة ما زالت تقول clicked 0، فلا شيء يُرسم مباشرة.",
        memory: [num("count", 1), ui("screen", "clicked 0"), dirty(true)],
        changed: ["dirty"],
      },
      {
        line: 3,
        say: "في الإطار التالي يرى Flutter أن العدّاد dirty، فيستدعي build من جديد. count لم يرجع إلى 0: هو في كائن State، لا داخل build.",
        memory: [num("count", 1), ui("screen", "clicked 0"), dirty(true)],
        read: ["dirty"],
      },
      {
        line: 6,
        say: "وصف جديد من الحالة الجديدة: clicked 1. يقارنه Flutter بالقديم ويغيّر النص وحده على الشاشة.",
        memory: [num("count", 1), ui("screen", "clicked 1"), dirty(false)],
        changed: ["screen", "dirty"],
        read: ["count"],
      },
      {
        line: 5,
        say: "لو كتبنا count++ وحدها بلا setState لتغيّر الدرج إلى 2، لكن لا أحد يقول لـ Flutter، فلا يُستدعى build وتبقى الشاشة clicked 1. القاعدة: غيّر الحالة داخل setState، ولا تلمس الشاشة.",
        memory: [num("count", 2), ui("screen", "clicked 1"), dirty(false)],
        changed: ["count"],
      },
    ],
  },
  playground: {
    kind: "trace",
    intro: "Flutter لا يعمل هنا، فهذه محاكاة بـ JavaScript لمتجر مشترك مثل ChangeNotifier: الحالة في مكان واحد، وكل شاشة تريدها تسجّل نفسها مستمعة. add تغيّر الحالة ثم تنادي كل المستمعين ليعيدوا بناء أنفسهم.",
    starter: `const cart = { count: 0, listeners: [] };
function build(name) {
  console.log(name + " shows " + cart.count);
}
function listen(name) {
  cart.listeners.push(name);
  build(name);
}
function add() {
  cart.count = cart.count + 1;
  for (const name of cart.listeners) {
    build(name);
  }
}
listen("ProductList");
listen("CartBadge");
add();
add();`,
    challenges: [
      "قبل التشغيل: كم سطراً سيُطبع؟ عُدّ مرات build لكل شاشة.",
      "أضف listen(\"CartScreen\") بعد سطر CartBadge. توقّع ما تطبعه CartScreen بعد كل add.",
      "احذف حلقة for من add (هذا مثل نسيان notifyListeners). ماذا يبقى مطبوعاً، ولماذا لا تتغير الأرقام؟",
      "انقل listen(\"CartBadge\") إلى ما بعد أول add. ما أول رقم تراه الشارة؟",
    ],
  },
  predict: [
    {
      question: "اضغط الزر ثلاث مرات. ماذا يظهر عليه؟",
      code: LOCAL_IN_BUILD,
      options: ["clicked 3", "clicked 0", "clicked 1"],
      answer: 1,
      why: "count هنا درج داخل build، و build يُستدعى من جديد بعد كل setState، فيُصنع درج جديد يبدأ بـ 0. الحالة التي يجب أن تبقى تعيش في كائن State، خارج build.",
      scene: mini(LOCAL_IN_BUILD, [
        { line: 3, say: "build يصنع درجاً جديداً count = 0.", memory: [num("count", 0)], changed: ["count"] },
        { line: 6, say: "الشاشة: clicked 0.", memory: [num("count", 0), ui("screen", "clicked 0")], read: ["count"] },
        { line: 5, say: "ضغطة: count++ فيصير 1، و setState تطلب إعادة البناء.", memory: [num("count", 1), ui("screen", "clicked 0")], changed: ["count"] },
        { line: 3, say: "build من أوله: درج جديد count = 0. الواحد ضاع مع التشغيل السابق.", memory: [num("count", 0), ui("screen", "clicked 0")], changed: ["count"] },
        { line: 6, say: "الشاشة: clicked 0 مرة أخرى، ومع كل ضغطة يتكرر هذا.", memory: [num("count", 0), ui("screen", "clicked 0")], read: ["count"] },
      ]),
    },
    {
      question: "اضغط الزر ثلاث مرات. ماذا يظهر عليه؟",
      code: NO_SETSTATE,
      options: ["clicked 3", "clicked 0", "خطأ: لا يمكن تغيير count"],
      answer: 1,
      why: "count++ تغيّر الدرج فعلاً حتى 3، لكن لا أحد أخبر Flutter، فلا يُستدعى build والشاشة ما زالت الوصف القديم. setState هي التي تقول: هذا الجزء تغيّر، أعد بناءه.",
      scene: mini(NO_SETSTATE, [
        { line: 6, say: "أول build: الشاشة clicked 0.", memory: [num("count", 0), ui("screen", "clicked 0")], read: ["count"] },
        { line: 5, say: "ضغطة: count++ فيصير 1. لا setState.", memory: [num("count", 1), ui("screen", "clicked 0")], changed: ["count"] },
        { line: 5, say: "ضغطتان أخريان: count = 3.", memory: [num("count", 3), ui("screen", "clicked 0")], changed: ["count"] },
        { line: null, say: "لم يُطلب أي بناء، فلم يُستدعَ build. الشاشة ما زالت clicked 0.", memory: [num("count", 3), ui("screen", "clicked 0")] },
      ]),
    },
    {
      question: "الشارة تقرأ السلة بـ context.watch<Cart>(). أضفت منتجين. ماذا تعرض الشارة؟",
      code: NO_NOTIFY,
      options: ["2", "0", "1"],
      answer: 1,
      why: "count في السلة صار 2، لكن add لم تستدعِ notifyListeners، فلم يُبلَّغ أي مستمع ولم تُعِد الشارة بناء نفسها. في المتجر المشترك notifyListeners هي setState.",
      scene: mini(NO_NOTIFY, [
        { line: 2, say: "سلة واحدة مشتركة، و CartBadge مسجّلة مستمعة لها وتعرض 0.", memory: [num("count", 0), ui("badge", "0")] },
        { line: 4, say: "add: count++ فيصير 1. لا notifyListeners.", memory: [num("count", 1), ui("badge", "0")], changed: ["count"] },
        { line: 4, say: "add مرة ثانية: count = 2.", memory: [num("count", 2), ui("badge", "0")], changed: ["count"] },
        { line: null, say: "لم يُبلَّغ أحد، فالشارة لم تُبنَ من جديد وما زالت 0.", memory: [num("count", 2), ui("badge", "0")] },
      ]),
    },
  ],
  code: {
    intro: "هذا متجر Flutter حقيقي بحزمة provider: السلة Cart حالة مشتركة واحدة فوق الشاشات كلها، وتُعلن تغيّرها بـ notifyListeners. watch تسجّل الـ Widget مستمعاً فيُعاد بناؤه، و read تقرأ مرة دون اشتراك (مناسبة داخل onPressed). Flutter لا يعمل داخل هذا الدرس، فاقرأ الكود وتتبّع: من يُعاد بناؤه عند ضغطة add؟",
    runnerLang: "text",
    runnerStarter: `class Cart extends ChangeNotifier {
  final List<String> items = [];
  int get count => items.length;
  void add(String item) {
    items.add(item);
    notifyListeners(); // every widget that watches Cart rebuilds
  }
}

void main() => runApp(
  ChangeNotifierProvider(create: (_) => Cart(), child: const ShopApp()),
);

class CartBadge extends StatelessWidget {
  const CartBadge({super.key});
  @override
  Widget build(BuildContext context) {
    final cart = context.watch<Cart>(); // subscribe: rebuild on change
    return Badge(label: Text("\${cart.count}"), child: const Icon(Icons.shopping_cart));
  }
}

class ProductTile extends StatelessWidget {
  const ProductTile({super.key, required this.name});
  final String name;
  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(name),
      trailing: IconButton(
        icon: const Icon(Icons.add),
        onPressed: () => context.read<Cart>().add(name), // read: no subscription
      ),
    );
  }
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "عدّاد يتذكّر",
      prompt: "رتّب أسطر كائن State حتى يزيد العدّاد مع كل ضغطة وتتحدّث الشاشة.",
      lines: [
        "class _CounterState extends State<Counter> {",
        "  int count = 0;",
        "  Widget build(BuildContext context) {",
        "    return ElevatedButton(",
        "      onPressed: () => setState(() { count++; }),",
        '      child: Text("clicked $count"),',
        "    );",
        "  }",
        "}",
      ],
      expected: "clicked 1, clicked 2, clicked 3",
    },
    {
      kind: "fill",
      lang: "text",
      title: "قل لـ Flutter",
      prompt: "أي استدعاء يغيّر count ويطلب من Flutter إعادة بناء هذا الجزء؟",
      template: 'onPressed: () => ___(() { count++; }),\nchild: Text("clicked $count"),',
      options: ["setState", "build", "print"],
      answer: "setState",
      expected: "clicked 1",
    },
    {
      kind: "order",
      lang: "text",
      title: "سلة تُبلغ مستمعيها",
      prompt: "رتّب الأسطر: السلة تغيّر عددها أولاً، ثم تُبلغ المستمعين ليعيدوا البناء من القيمة الجديدة.",
      lines: [
        "class Cart extends ChangeNotifier {",
        "  int count = 0;",
        "  void add() {",
        "    count++;",
        "    notifyListeners();",
        "  }",
        "}",
      ],
      expected: "badge: 1",
    },
    {
      kind: "fill",
      lang: "text",
      title: "اشترك في السلة",
      prompt: "الشارة يجب أن تُعاد بناؤها كلما تغيّرت السلة. أي كلمة تجعلها مستمعة؟",
      template: 'final cart = context.___<Cart>();\nreturn Text("${cart.count}");',
      options: ["watch", "read", "build"],
      answer: "watch",
      expected: "badge: 2",
    },
  ],
  quiz: [
    {
      question: "ضغطت زر add ثلاث مرات (بلا setState)، ثم ضغطت زر refresh. ماذا يظهر؟",
      code: 'int count = 0;\n// add button:\nonPressed: () { count++; },\n// refresh button:\nonPressed: () => setState(() {}),\n// build shows:\nText("clicked $count")',
      options: ["clicked 3", "clicked 0", "clicked 1"],
      answer: 0,
      why: "الدرج count وصل إلى 3 بصمت. setState الفارغة لا تغيّر شيئاً لكنها تطلب build، و build يقرأ الحالة كما هي الآن: 3. الشاشة دائماً صورة للحالة في آخر بناء.",
    },
    {
      question: "العدد محفوظ في State داخل ProductList، والشارة CartBadge في الأعلى لها State خاص بها فيه count = 0. أضفت منتجين من القائمة. ماذا تعرض الشارة؟",
      options: ["0", "2", "خطأ"],
      answer: 0,
      why: "كل State درج خاص بـ Widget واحد. setState في ProductList تعيد بناء ProductList وما تحته فقط، والشارة في فرع آخر بدرجها الخاص. الحل رفع الحالة إلى أب مشترك أو متجر مشترك.",
    },
    {
      question: "ماذا يُطبع؟",
      code: "setState(() { count++; });\nprint(count);   // count was 4",
      options: ["5", "4", "لا شيء حتى يُعاد البناء"],
      answer: 0,
      why: "setState تشغّل الدالة التي أعطيتها في الحال، فـ count صار 5 قبل السطر التالي. الذي يتأخر هو build فقط: يُطلب الآن ويحدث في الإطار التالي.",
    },
    {
      question: "زر add يستدعي context.read<Cart>().add() والشارة تستخدم context.read<Cart>().count أيضاً. أضفت منتجاً. ماذا تعرض الشارة؟",
      options: ["العدد القديم، لأنها لم تشترك", "العدد الجديد", "خطأ في التشغيل"],
      answer: 0,
      why: "notifyListeners تُبلغ المستمعين فقط. read تقرأ مرة دون اشتراك، فالشارة ليست مستمعة ولا تُعاد بناؤها. داخل build استخدم watch، وداخل onPressed استخدم read.",
    },
    {
      question: "السلة في متجر مشترك، و ProductList و CartBadge و CartScreen كلها تستخدم watch. ضغطت add مرة. من يُعاد بناؤه؟",
      options: ["الثلاثة", "ProductList فقط لأن الضغطة فيه", "لا أحد حتى تفتح شاشة السلة"],
      answer: 0,
      why: "الحالة في مكان واحد، والثلاثة مسجّلة مستمعة. notifyListeners تنادي كل مستمع، فيعيد كل واحد build من القيمة الجديدة نفسها، فلا تختلف شاشتان أبداً.",
    },
  ],
  next: "flutter-api",
};
