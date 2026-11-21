import type { Frame, HeapObj, Lesson, Scene, Slot, Step } from "@/lib/types";

const num = (name: string, value: number | string): Slot => ({ name, value: String(value), type: "number" });
const str = (name: string, value: string): Slot => ({ name, value: `"${value}"`, type: "string" });
const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
const main = (vars: Slot[]): Frame => ({ id: 1, name: "main", vars });
const call = (name: string, vars: Slot[]): Frame => ({ id: 2, name, vars });
/** An Account object on the heap: its own copy of every field. */
const account = (id: number, owner: string, balance: number): HeapObj => ({ id, kind: "object", items: [str("owner", owner), num("_balance", balance)] });
const point = (id: number, x: number, y: number): HeapObj => ({ id, kind: "object", items: [num("x", x), num("y", y)] });
const at = (line: number | null, say: string, frames: Frame[], heap: HeapObj[], extra: Partial<Step> = {}): Step => ({ line, say, memory: [], frames, heap, ...extra });
const dart = (code: string, steps: Step[]): Scene => ({ code: { dart: code }, steps });

const both = [ref("sara", 1), ref("omar", 2)];

export const dartClasses: Lesson = {
  slug: "dart-classes",
  stage: 0,
  number: "1.8",
  title: "الأصناف",
  subtitle: "الصنف قالب في الكود، وكل كائن كتلة في الكومة بحقولها الخاصة، والدوال تعمل على الكائن الذي استُدعيت عليه",
  minutes: 24,
  singleLanguage: true,
  problem: {
    title: "حساب بلا حارس",
    body: "حسابان بنكيان: واحد خريطة مفتوحة يكتب فيها أي كود ما يشاء، وواحد كائن من صنف يحرس رصيده. جرّب الأزرار على الاثنين، وحاول أن تجعل الرصيد سالباً.",
    demo: "dartClasses",
  },
  scene: {
    code: {
      dart: `class Account {
  final String owner;
  int _balance = 0;
  Account(this.owner);
  int get balance => _balance;
  void deposit(int amount) => _balance += amount;
}
void main() {
  final sara = Account("Sara");
  final omar = Account("Omar");
  sara.deposit(50);
  print("\${sara.balance} \${omar.balance}");
}`,
    },
    steps: [
      at(null, "الصنف ليس في الذاكرة: هو قالب يقرؤه المترجم. يقول إن كل Account سيكون كتلة في الكومة فيها حقلان: owner و _balance.", [], []),
      at(
        1,
        "الدوال deposit و balance لا تُنسخ إلى كل كائن: كودها موجود مرة واحدة، ويعرف عند كل استدعاء على أي كائن يعمل. والشرطة _ في أول الاسم تجعل الحقل خاصاً بهذا الملف: لا يراه كود في ملف آخر.",
        [],
        [],
      ),
      at(9, "Account(\"Sara\")‎ يحجز كتلة جديدة في الكومة. ‏_balance تأخذ قيمتها الأولى 0، ثم يملأ الباني this.owner بـ \"Sara\". و sara يحمل سهماً إلى الكتلة.", [main([ref("sara", 1)])], [account(1, "Sara", 0)], {
        changed: ["sara"],
        changedHeap: [1],
      }),
      at(10, "كتلة ثانية بحقولها الخاصة. القالب واحد، والكائنات اثنان مستقلان تماماً.", [main(both)], [account(1, "Sara", 0), account(2, "Omar", 0)], { changed: ["omar"], changedHeap: [2] }),
      at(
        11,
        "sara.deposit(50)‎: إطار جديد على المكدّس، وفيه درج خفي اسمه this يحمل سهم الكائن الذي قبل النقطة، أي كائن Sara، ودرج amount = 50.",
        [main(both), call("deposit", [ref("this", 1), num("amount", 50)])],
        [account(1, "Sara", 0), account(2, "Omar", 0)],
        { changed: ["this", "amount"] },
      ),
      at(
        6,
        "_balance تعني this._balance: يتبع السهم إلى كتلة Sara ويزيد حقلها 50. كتلة Omar لا يلمسها شيء.",
        [main(both), call("deposit", [ref("this", 1), num("amount", 50)])],
        [account(1, "Sara", 50), account(2, "Omar", 0)],
        { changedHeap: [1], read: ["amount"] },
      ),
      at(
        12,
        "balance getter: يُقرأ كأنه حقل بلا أقواس، لكنه دالة تعمل عند كل قراءة وترجع _balance. من خارج الملف تُقرأ balance ولا تُكتب: الطريق الوحيد لتغيير الرصيد هو deposit.",
        [main(both)],
        [account(1, "Sara", 50), account(2, "Omar", 0)],
        { read: ["sara", "omar"], output: ["50 0"] },
      ),
      at(
        null,
        "الصورة: الصنف يجمع البيانات والدوال التي تحرسها في مكان واحد. owner لأنه final لا يتغير بعد الباني، و _balance يتغير فقط عبر الدوال التي كتبتها أنت، فلا يصير الحساب في حالة غير منطقية.",
        [main(both)],
        [account(1, "Sara", 50), account(2, "Omar", 0)],
        { output: ["50 0"] },
      ),
    ],
    notes: {
      dart: "الباني اسمه اسم الصنف، و this.owner في معاملاته تملأ الحقل مباشرة. لا حاجة لـ new. الحقل بلا ؟ يجب أن يأخذ قيمة قبل أن ينتهي الباني. و _ تعني خاص بالملف (المكتبة) لا بالصنف.",
    },
  },
  playground: {
    kind: "trace",
    intro: "المتتبّع لا يدعم class، فنبني الفكرة بأيدينا: makeAccount تصنع كتلة في الكومة، و deposit تأخذ الكائن صراحة في معامل self. هذا بالضبط ما يفعله this الخفي في Dart.",
    starter: `function makeAccount(owner) {
  return { owner: owner, balance: 0 };
}
function deposit(self, amount) {
  if (amount <= 0) {
    return "rejected";
  }
  self.balance = self.balance + amount;
  return "ok";
}
const sara = makeAccount("Sara");
const omar = makeAccount("Omar");
deposit(sara, 50);
const same = sara;
deposit(same, 25);
console.log(sara.balance, omar.balance);
console.log(deposit(omar, -10), omar.balance);
omar.balance = -999;
console.log(omar.balance);`,
    challenges: [
      "قبل التشغيل: كم رصيد sara؟ و same ليس حساباً ثالثاً: راقب الأسهم في الكومة.",
      "deposit ترفض المبلغ السالب، لكن السطر omar.balance = -999 تجاوزها. هذا ما يمنعه _balance في Dart: لا يُكتب الحقل إلا من داخل الملف.",
      "اكتب دالة withdraw(self, amount) ترفض السحب إذا كان أكبر من الرصيد، وجرّبها.",
      "اصنع حساباً ثالثاً واطبع أرصدة الثلاثة. كم كتلة في الكومة الآن؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا الكود؟",
      code: `final a = Account("Sara");
final b = a;
b.deposit(50);
print(a.balance);`,
      options: ["50", "0", "خطأ: a من نوع final"],
      answer: 0,
      why: "Account(\"Sara\")‎ صنع كائناً واحداً. b = a نسخ السهم فقط، فـ deposit عبر b غيّرت الكائن الوحيد، وتراه عبر a. final تمنع تغيير السهم، لا حقول الكائن.",
      scene: dart(
        `final a = Account("Sara");
final b = a;
b.deposit(50);
print(a.balance);`,
        [
          at(1, "كائن واحد في الكومة، و a يشير إليه.", [main([ref("a", 1)])], [account(1, "Sara", 0)], { changed: ["a"], changedHeap: [1] }),
          at(2, "b يأخذ نسخة من السهم: لا كائن جديد.", [main([ref("a", 1), ref("b", 1)])], [account(1, "Sara", 0)], { changed: ["b"], copy: { from: "a", to: "b" } }),
          at(3, "deposit تعمل على this = الكائن الوحيد.", [main([ref("a", 1), ref("b", 1)])], [account(1, "Sara", 50)], { changedHeap: [1], read: ["b"] }),
          at(4, "a يشير إلى الكائن نفسه: 50.", [main([ref("a", 1), ref("b", 1)])], [account(1, "Sara", 50)], { read: ["a"], output: ["50"] }),
        ],
      ),
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `class Point {
  final int x, y;
  Point(this.x, this.y);
}
void main() {
  print(Point(1, 2) == Point(1, 2));
}`,
      options: ["false", "true", "خطأ: لا يُقارن كائنان بـ =="],
      answer: 0,
      why: "كل Point(...)‎ يحجز كتلة جديدة. == الافتراضية تسأل: هل السهمان إلى الكتلة نفسها؟ وهما كتلتان. لمقارنة الحقول اكتب operator == و hashCode في الصنف (أو استعمل record).",
      scene: dart(
        `class Point {
  final int x, y;
  Point(this.x, this.y);
}
void main() {
  print(Point(1, 2) == Point(1, 2));
}`,
        [
          at(6, "Point(1, 2)‎ الأول: كتلة في الكومة.", [main([])], [point(1, 1, 2)], { changedHeap: [1] }),
          at(6, "Point(1, 2)‎ الثاني: كتلة أخرى بالقيم نفسها في مكان آخر.", [main([])], [point(1, 1, 2), point(2, 1, 2)], { changedHeap: [2] }),
          at(6, "== الموروثة من Object تقارن الهوية: كتلتان مختلفتان، فالنتيجة false.", [main([])], [point(1, 1, 2), point(2, 1, 2)], { output: ["false"] }),
        ],
      ),
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `class Temp {
  double c = 20;
  double get f => c * 9 / 5 + 32;
}
void main() {
  final t = Temp();
  print(t.f);
  t.c = 30;
  print(t.f);
}`,
      options: ["68.0 ثم 86.0", "68.0 ثم 68.0", "خطأ: f بلا أقواس"],
      answer: 0,
      why: "f ليس حقلاً مخزّناً بل getter: دالة تُحسب من c عند كل قراءة. في الكائن حقل واحد c، فحين يتغير تتغير f تلقائياً. لا قيمة قديمة محفوظة تحتاج تحديثاً.",
      scene: dart(
        `class Temp {
  double c = 20;
  double get f => c * 9 / 5 + 32;
}
void main() {
  final t = Temp();
  print(t.f);
  t.c = 30;
  print(t.f);
}`,
        [
          at(6, "كائن Temp فيه حقل واحد: c = 20.0. لا حقل اسمه f.", [main([ref("t", 1)])], [{ id: 1, kind: "object", items: [num("c", "20.0")] }], { changed: ["t"], changedHeap: [1] }),
          at(7, "t.f تشغّل الـ getter: ‏20 × 9 / 5 + 32 = 68.0.", [main([ref("t", 1)]), call("get f", [ref("this", 1)])], [{ id: 1, kind: "object", items: [num("c", "20.0")] }], { read: ["t"], output: ["68.0"] }),
          at(8, "c يصبح 30.0.", [main([ref("t", 1)])], [{ id: 1, kind: "object", items: [num("c", "30.0")] }], { changedHeap: [1], output: ["68.0"] }),
          at(9, "f تُحسب من جديد: ‏30 × 9 / 5 + 32 = 86.0.", [main([ref("t", 1)]), call("get f", [ref("this", 1)])], [{ id: 1, kind: "object", items: [num("c", "30.0")] }], { read: ["t"], output: ["68.0", "86.0"] }),
        ],
      ),
    },
  ],
  code: {
    intro: "برنامج Dart حقيقي على خادم التشغيل: صنف Account يحرس رصيده، وباني مسمّى، و toString، وحقل static مشترك بين كل الكائنات. شغّله ثم جرّب ما في التعليق.",
    runnerLang: "dart",
    runnerStarter: `class Account {
  static int opened = 0; // one drawer shared by the class, not per object

  final String owner;
  int _balance;

  Account(this.owner, {int initial = 0}) : _balance = initial {
    opened++;
  }

  int get balance => _balance;

  bool withdraw(int amount) {
    if (amount <= 0 || amount > _balance) return false;
    _balance -= amount;
    return true;
  }

  void deposit(int amount) {
    if (amount <= 0) throw ArgumentError("amount must be positive");
    _balance += amount;
  }

  @override
  String toString() => "$owner: $_balance SAR";
}

void main() {
  final sara = Account("Sara", initial: 100);
  final omar = Account("Omar");
  omar.deposit(40);
  print(sara.withdraw(30)); // true
  print(omar.withdraw(90)); // false: not enough
  print(sara);
  print(omar);
  print("accounts opened: \${Account.opened}");
  // try: omar.deposit(-5), or remove the toString method
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "dart",
      title: "مستطيل يعرف مساحته",
      prompt: "رتّب الأسطر: صنف Rect له عرض وارتفاع وباني قصير و getter للمساحة، ثم main تطبع مساحة مستطيل 3 × 4: ‏12.0.",
      lines: ["class Rect {", "  final double w, h;", "  Rect(this.w, this.h);", "  double get area => w * h;", "}", "void main() {", "  print(Rect(3, 4).area);", "}"],
      expected: "12.0",
    },
    {
      kind: "fill",
      lang: "dart",
      title: "كائن يعرّف نفسه",
      prompt: "print على كائن تستدعي دالة معيّنة فيه. أي اسم يجعله يطبع (2, 3) بدل Instance of 'Point'؟",
      template: `class Point {
  final int x, y;
  Point(this.x, this.y);

  @override
  String ___() => "($x, $y)";
}

void main() => print(Point(2, 3));`,
      options: ["toString", "print", "show"],
      answer: "toString",
      expected: "(2, 3)",
    },
    {
      kind: "fix",
      lang: "dart",
      title: "عدّاد لا يعدّ",
      prompt: "المترجم يرفض هذا الصنف. أصلحه حتى تزيد tick العدد ويطبع البرنامج 2.",
      code: `class Counter {
  final int value = 0;
  void tick() => value++;
}

void main() {
  final c = Counter();
  c.tick();
  c.tick();
  print(c.value);
}`,
      expected: "2",
      hint: "final تعني أن الحقل يُكتب مرة واحدة. الحقل هنا يجب أن يتغير. أما final في main فصحيحة: c يشير دائماً إلى الكائن نفسه.",
      solution: `class Counter {
  int value = 0;
  void tick() => value++;
}

void main() {
  final c = Counter();
  c.tick();
  c.tick();
  print(c.value);
}`,
    },
    {
      kind: "write",
      lang: "dart",
      title: "سلة بمجموع",
      prompt: "اكتب صنف Cart فيه قائمة خاصة _prices من نوع List<double>‎، ودالة add(double price)‎، و getter اسمه total يرجع المجموع. ثم أضف 5 و 7.5 واطبع total: ‏12.5.",
      starter: `class Cart {
  // a private list of prices, add(price), and a total getter
}

void main() {
  final cart = Cart();
  // add 5 and 7.5, then print cart.total
}
`,
      expected: "12.5",
      hint: "final _prices = <double>[];‎ و void add(double price) => _prices.add(price);‎ و double get total => _prices.fold(0, (sum, p) => sum + p);‎",
      solution: `class Cart {
  final _prices = <double>[];

  void add(double price) => _prices.add(price);

  double get total => _prices.fold(0, (sum, p) => sum + p);
}

void main() {
  final cart = Cart();
  cart.add(5);
  cart.add(7.5);
  print(cart.total);
}
`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: "class Order {\n  static int count = 0;\n  Order() {\n    count++;\n  }\n}\nvoid main() {\n  Order();\n  Order();\n  print(Order.count);\n}",
      options: ["2", "1", "0"],
      answer: 0,
      why: "static يعني أن الدرج للصنف نفسه لا لكل كائن: درج واحد يتشاركه الجميع. كل باني يزيده، فبعد كائنين صار 2. ولو لم يكن static لكان لكل كائن count خاص يبدأ من 0.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: "final list = <int>[]..add(1)..add(2);\nprint(list);",
      options: ["[1, 2]", "null", "خطأ: add ترجع void"],
      answer: 0,
      why: "‎..‎ (cascade) تستدعي الدالة على الكائن ثم ترجع الكائن نفسه، لا ما ترجعه الدالة. فالسلسلة كلها قيمتها القائمة بعد الإضافتين.",
    },
    {
      question: "ماذا يحدث في السطر الثاني؟",
      code: 'final a = Account("Sara");\na.owner = "Omar";',
      options: ["المترجم يرفض: owner حقل final", "يصبح المالك Omar", "خطأ لأن a من نوع final"],
      answer: 0,
      why: "owner في Account معرّف final: يُكتب مرة واحدة في الباني ثم يُقفل. أما final في a فتقفل السهم فقط، وكانت ستسمح بتغيير حقل غير final.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: "class Point {\n  final int x, y;\n  Point(this.x, this.y);\n}\nvoid main() => print(Point(1, 2));",
      options: ["Instance of 'Point'", "Point(1, 2)", "(1, 2)"],
      answer: 0,
      why: "print تستدعي toString()‎ على الكائن، و toString الموروثة من Object لا تعرف حقولك، فتكتب نوع الكائن فقط. اكتب @override String toString()‎ لتعرض ما تريد.",
    },
    {
      question: "لماذا يرفض المترجم هذا الصنف؟",
      code: "class User {\n  String name;\n}",
      options: ["name من نوع String بلا قيمة ولا باني يملؤه", "الصنف يحتاج باني دائماً", "String لا تصلح نوعاً لحقل"],
      answer: 0,
      why: "كل كائن User جديد سيكون له حقل name، و String لا يقبل null. بلا قيمة ابتدائية أو باني يملؤه، سيولد الكائن وحقله فارغ. الحلول: String name = \"\"‎، أو User(this.name)‎، أو String?‎ name.",
    },
  ],
  next: "dart-constructors",
};
