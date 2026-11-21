import type { Frame, HeapObj, Lesson, Scene, Slot, Step } from "@/lib/types";

const num = (name: string, value: number): Slot => ({ name, value: String(value), type: "number" });
const str = (name: string, value: string): Slot => ({ name, value: `"${value}"`, type: "string" });
const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
const fnv = (name: string, label = name): Slot => ({ name, value: `ƒ ${label}`, type: "function" });
const undef = (name: string): Slot => ({ name, value: "undefined", type: "none" });
const prog = (vars: Slot[]): Frame => ({ id: 1, name: "البرنامج", vars });
const call = (name: string, vars: Slot[]): Frame => ({ id: 2, name, vars });
const obj = (id: number, items: Slot[]): HeapObj => ({ id, kind: "object", items });
const at = (line: number | null, say: string, frames: Frame[], heap: HeapObj[], extra: Partial<Step> = {}): Step => ({ line, say, memory: [], frames, heap, ...extra });
const js = (code: string, steps: Step[]): Scene => ({ code: { js: code }, steps });

const account = obj(1, [fnv("[[Code]]", "constructor"), ref("prototype", 2)]);
const accountProto = obj(2, [ref("constructor", 1), fnv("deposit")]);
const savings = obj(3, [ref("prototype", 4), ref("[[Prototype]]", 1)]);
const savingsProto = obj(4, [fnv("addInterest"), ref("[[Prototype]]", 2)]);
const inst = (...own: Slot[]) => obj(5, [...own, ref("[[Prototype]]", 4)]);
const classes = [account, accountProto, savings, savingsProto];
const g = (...more: Slot[]) => prog([ref("Account", 1), ref("Savings", 3), ...more]);

export const jsClasses: Lesson = {
  slug: "js-classes",
  stage: 0,
  number: "2.4",
  title: "الأصناف",
  subtitle: "class تكتب لك الدالة البانية والنموذج الأولي، وتضيف حقولاً خاصة لا يلمسها أحد",
  minutes: 25,
  singleLanguage: true,
  problem: {
    title: "رصيد يكتبه أي أحد",
    body: "حسابان بنكيان: كائن عادي، وكائن من صنف يخفي رصيده في حقل خاص. أودع واسحب، ثم دع كوداً خارجياً يكتب في الرصيد مباشرة.",
    demo: "jsClasses",
  },
  scene: {
    code: {
      js: `class Account {
  #balance = 0;
  constructor(owner) { this.owner = owner; }
  deposit(amount) { this.#balance += amount; return this.#balance; }
}
class Savings extends Account {
  addInterest() { return this.deposit(10); }
}
const s = new Savings("Sara");
s.deposit(100);
console.log(s.addInterest(), typeof Account);`,
    },
    notes: {
      js: "class صياغة فوق النماذج الأولية: Account دالة بانية، وطرقها في Account.prototype، و extends تربط Savings.prototype بـ Account.prototype. ما تضيفه الأصناف فعلاً: الحقول الخاصة #، و super، و static، وجسم صارم دائماً، ومنع استدعاء الصنف بلا new.",
    },
    steps: [
      at(null, "سنرى ما تبنيه class في الذاكرة. لا شيء سحري: دوال وكائنات وروابط [[Prototype]] كما في الدرس السابق.", [prog([])], []),
      at(1, "class Account تصنع دالة بانية #1، وكائناً #2 هو Account.prototype. الطريقة deposit توضع في #2 مرة واحدة، لا في كل حساب.", [prog([ref("Account", 1)])], [account, accountProto], { changedHeap: [1, 2] }),
      at(6, "extends تصنع Savings #3 ونموذجها #4، وتربط #4 بـ #2. لذلك ستجد كائنات Savings طرق Account عبر السلسلة. (و Savings نفسها مربوطة بـ Account، فترث الطرق الساكنة static أيضاً.)", [g()], classes, { changedHeap: [3, 4] }),
      at(9, "new Savings(\"Sara\"): لا constructor في Savings، فتُستعمل الافتراضية التي تستدعي super(\"Sara\"). يُصنع الكائن #5، ورابطه يشير إلى Savings.prototype، ويدخل constructor الخاص بـ Account و this يشير إليه.", [g(), call("constructor", [ref("this", 5), str("owner", "Sara")])], [...classes, inst()], { changedHeap: [5] }),
      at(2, "قبل جسم الـ constructor تُهيَّأ الحقول: #balance = 0 داخل الكائن نفسه. الحقل الخاص لا يصل إليه إلا كود مكتوب داخل جسم الصنف.", [g(), call("constructor", [ref("this", 5), str("owner", "Sara")])], [...classes, inst(num("#balance", 0))], { changedHeap: [5] }),
      at(3, "this.owner = owner يكتب خاصية عامة في #5.", [g(), call("constructor", [ref("this", 5), str("owner", "Sara")])], [...classes, inst(num("#balance", 0), str("owner", "Sara"))], { changedHeap: [5] }),
      at(9, "new تُرجع الكائن، ويختفي الإطار. s يشير إلى #5. الكائن يحمل بياناته فقط: لا deposit فيه ولا addInterest.", [g(ref("s", 5))], [...classes, inst(num("#balance", 0), str("owner", "Sara"))], { changed: ["s"] }),
      at(4, "s.deposit(100): ليست في #5، ولا في #4، فيجدها البحث في #2. this هو s، فيصير #balance في #5 مئة.", [g(ref("s", 5)), call("deposit", [ref("this", 5), num("amount", 100)])], [...classes, inst(num("#balance", 100), str("owner", "Sara"))], { changedHeap: [5] }),
      at(7, "s.addInterest() موجودة في #4، و this ما زال s. بداخلها this.deposit(10) تمشي السلسلة إلى #2 من جديد، فيصير الرصيد 110.", [g(ref("s", 5)), call("addInterest", [ref("this", 5)])], [...classes, inst(num("#balance", 110), str("owner", "Sara"))], { changedHeap: [5] }),
      at(11, "الطباعة: 110 و function. الصنف في النهاية دالة لها prototype، لكنها ترفض أن تُستدعى بلا new.", [g(ref("s", 5))], [...classes, inst(num("#balance", 110), str("owner", "Sara"))], { output: ["110 function"] }),
    ],
  },
  playground: {
    kind: "trace",
    intro: "المتتبّع لا يدعم class، فلنصنع ما تصنعه بأيدينا: كائن نموذج لكل صنف، ورابط parent يمثّل extends، و newObject تمثّل new، و callMethod تبحث عن الطريقة في السلسلة ثم تستدعيها و self هو الكائن (أي this).",
    starter: `const accountProto = {
  parent: null,
  deposit: function (self, amount) {
    self.balance = self.balance + amount;
    return self.balance;
  },
};
const savingsProto = {
  parent: accountProto,
  addInterest: function (self) {
    return callMethod(self, "deposit", 10);
  },
};
function newObject(proto, owner) {
  return { proto: proto, owner: owner, balance: 0 };
}
function callMethod(self, name, arg) {
  let cur = self.proto;
  while (cur !== null) {
    if (cur[name] !== undefined) {
      const method = cur[name];
      return method(self, arg);
    }
    cur = cur.parent;
  }
  return "no method " + name;
}
const s = newObject(savingsProto, "Sara");
callMethod(s, "deposit", 100);
console.log(callMethod(s, "addInterest"), callMethod(s, "fly"));`,
    challenges: [
      "تابع callMethod(s, \"deposit\", 100): في أي نموذج وُجدت deposit، وبعد كم قفزة؟",
      "أضف إلى savingsProto طريقة deposit خاصة تضيف المبلغ مضاعفاً. ماذا يطبع البرنامج الآن؟ هذا هو التجاوز (override).",
      "أنشئ حساباً عادياً const a = newObject(accountProto, \"Omar\") واستدعِ عليه addInterest. لماذا لا يجدها؟",
      "أين تعيش balance في هذه المحاكاة؟ وهل يمنع شيء كوداً خارجياً من كتابة s.balance = -500؟ (هذا ما يحله #balance في الأصناف الحقيقية.)",
    ],
  },
  predict: [
    {
      question: "أخذنا طريقة من كائن صنف واستدعيناها وحدها. ماذا يحدث؟",
      code: `class Timer {
  ticks = 0;
  tick() { this.ticks++; }
}
const t = new Timer();
const tick = t.tick;
tick();`,
      options: ["t.ticks يصير 1", "لا شيء يحدث", "TypeError"],
      answer: 2,
      why: "جسم الصنف صارم دائماً. الاستدعاء tick() بلا نقطة يعطي this = undefined، فقراءة this.ticks توقف البرنامج. الطريقة لا تتذكر الكائن الذي أُخذت منه.",
      scene: js("class Timer {\n  ticks = 0;\n  tick() { this.ticks++; }\n}\nconst t = new Timer();\nconst tick = t.tick;\ntick();", [
        at(5, "t كائن #2 فيه ticks، ورابطه إلى Timer.prototype #1 حيث tick.", [prog([ref("t", 2)])], [obj(1, [fnv("tick")]), obj(2, [num("ticks", 0), ref("[[Prototype]]", 1)])]),
        at(6, "tick مرجع إلى الدالة وحدها. لا يُحفظ معها t.", [prog([ref("t", 2), fnv("tick")])], [obj(1, [fnv("tick")]), obj(2, [num("ticks", 0), ref("[[Prototype]]", 1)])], { changed: ["tick"] }),
        at(7, "tick() بلا نقطة: this = undefined، و this.ticks++ تقرأ من undefined.", [prog([ref("t", 2), fnv("tick")]), call("tick", [undef("this")])], [obj(1, [fnv("tick")]), obj(2, [num("ticks", 0), ref("[[Prototype]]", 1)])], { error: "TypeError: Cannot read properties of undefined (reading 'ticks')" }),
      ]),
    },
    {
      question: "الصنف المشتق يكتب في this قبل super. ماذا يحدث؟",
      code: `class Animal {
  constructor(name) { this.name = name; }
}
class Dog extends Animal {
  constructor(name) {
    this.sound = "woof";
    super(name);
  }
}
new Dog("Rex");`,
      options: ["يُصنع الكلب بالخاصيتين", "ReferenceError", "sound تضيع ويبقى name"],
      answer: 1,
      why: "في الصنف المشتق، الكائن يصنعه الصنف الأب داخل super(). قبل استدعاء super لا يوجد this بعد، فأي استعمال له يوقف البرنامج. اكتب super(name) أولاً.",
      scene: js("class Animal {\n  constructor(name) { this.name = name; }\n}\nclass Dog extends Animal {\n  constructor(name) {\n    this.sound = \"woof\";\n    super(name);\n  }\n}\nnew Dog(\"Rex\");", [
        at(10, "new Dog(\"Rex\") يدخل constructor الخاص بـ Dog. this لم يُهيّأ بعد: الأب هو من سيصنع الكائن.", [prog([ref("Animal", 1), ref("Dog", 2)]), call("Dog constructor", [{ name: "this", value: "<uninitialized>", type: "none" }, str("name", "Rex")])], [obj(1, [ref("prototype", 3)]), obj(2, [ref("prototype", 4)])]),
        at(6, "this.sound قبل super: لا يوجد كائن ليُكتب فيه.", [prog([ref("Animal", 1), ref("Dog", 2)]), call("Dog constructor", [{ name: "this", value: "<uninitialized>", type: "none" }, str("name", "Rex")])], [obj(1, [ref("prototype", 3)]), obj(2, [ref("prototype", 4)])], { error: "ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor" }),
      ]),
    },
    {
      question: "كود خارجي يكتب w.balance، والصنف يحفظ رصيده في #balance. ماذا يطبع؟",
      code: `class Wallet {
  #balance = 50;
  show() { return this.#balance; }
}
const w = new Wallet();
w.balance = 0;
console.log(w.show(), w.balance);`,
      options: ["0 0", "50 0", "50 undefined"],
      answer: 1,
      why: "#balance و balance اسمان مختلفان تماماً. الإسناد صنع خاصية عامة جديدة اسمها balance، والحقل الخاص لم يتغير: لا يصل إليه إلا كود داخل جسم الصنف.",
      scene: js("class Wallet {\n  #balance = 50;\n  show() { return this.#balance; }\n}\nconst w = new Wallet();\nw.balance = 0;\nconsole.log(w.show(), w.balance);", [
        at(5, "الكائن #2 فيه الحقل الخاص #balance = 50.", [prog([ref("w", 2)])], [obj(1, [fnv("show")]), obj(2, [num("#balance", 50), ref("[[Prototype]]", 1)])]),
        at(6, "w.balance = 0 يضيف خاصية عامة جديدة بجانبه. #balance لم يُلمس.", [prog([ref("w", 2)])], [obj(1, [fnv("show")]), obj(2, [num("#balance", 50), num("balance", 0), ref("[[Prototype]]", 1)])], { changedHeap: [2] }),
        at(7, "show() تقرأ #balance: 50. و w.balance هي الخاصية العامة: 0.", [prog([ref("w", 2)])], [obj(1, [fnv("show")]), obj(2, [num("#balance", 50), num("balance", 0), ref("[[Prototype]]", 1)])], { output: ["50 0"] }),
      ]),
    },
  ],
  code: {
    intro: "صنف كما يكتبه المحترفون: حقل خاص يحمي الرصيد، وطرق ترفض المدخلات الخاطئة بأخطاء واضحة، و getter للقراءة فقط، وعدّاد معرّفات ساكن خاص بالصنف، وصنف مشتق يستعمل super. شغّل، ثم جرّب التعليق.",
    runnerStarter: `class Account {
  static #nextId = 1; // shared by the class, not by each account
  #balance = 0; // only code inside this class body can reach it

  constructor(owner) {
    this.id = Account.#nextId++;
    this.owner = owner;
  }

  get balance() {
    return this.#balance; // read-only from outside
  }

  deposit(amount) {
    if (amount <= 0) throw new RangeError("amount must be positive");
    this.#balance += amount;
    return this;
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new RangeError("insufficient funds");
    this.#balance -= amount;
    return this;
  }

  toString() {
    return \`#\${this.id} \${this.owner}: \${this.#balance}\`;
  }
}

class Savings extends Account {
  constructor(owner, rate) {
    super(owner); // the parent builds the object first
    this.rate = rate;
  }

  addInterest() {
    return this.deposit(Math.round(this.balance * this.rate));
  }
}

const sara = new Account("Sara").deposit(50);
const omar = new Savings("Omar", 0.1);
omar.deposit(200).addInterest();
console.log(String(sara), "|", String(omar));
try {
  omar.withdraw(1000);
} catch (e) {
  console.log(e.name + ": " + e.message);
}
console.log(omar instanceof Account, Object.getPrototypeOf(Savings.prototype) === Account.prototype);
// جرّب: أضف إلى Savings طريقة withdraw تمنع سحب أكثر من 100 ثم تستدعي super.withdraw(amount)
`,
  },
  exercises: [
    {
      kind: "order",
      title: "مساحة المستطيل",
      prompt: "رتّب الأسطر: صنف له constructor يحفظ البعدين، وطريقة area، ثم كائن منه. يجب أن يطبع 12.",
      lines: [
        "class Rect {",
        "  constructor(w, h) { this.w = w; this.h = h; }",
        "  area() { return this.w * this.h; }",
        "}",
        "const r = new Rect(3, 4);",
        "console.log(r.area());",
      ],
      expected: "12",
    },
    {
      kind: "fill",
      title: "القطة ترث الاسم",
      prompt: "Cat مشتق من Animal. أي سطر يجعل البرنامج يطبع Mimi meow؟",
      template: 'class Animal {\n  constructor(name) { this.name = name; }\n}\nclass Cat extends Animal {\n  constructor(name) {\n    ___;\n    this.sound = "meow";\n  }\n}\nconst c = new Cat("Mimi");\nconsole.log(c.name, c.sound);',
      options: ["this.name = name", "super(name)", "Animal(name)"],
      expected: "Mimi meow",
    },
    {
      kind: "fix",
      title: "السلّة لا ترى عناصرها",
      prompt: "البرنامج يتوقف بخطأ بدل أن يطبع 2. أصلح الطريقة add.",
      code: `class Cart {
  constructor() {
    this.items = [];
  }
  add(item) {
    items.push(item);
    return this;
  }
}
const cart = new Cart().add("tea").add("milk");
console.log(cart.items.length);`,
      expected: "2",
      hint: "items ليست متغيراً في نطاق الطريقة. إنها خاصية في الكائن، والكائن داخل الطريقة اسمه this.",
      solution: `class Cart {
  constructor() {
    this.items = [];
  }
  add(item) {
    this.items.push(item);
    return this;
  }
}
const cart = new Cart().add("tea").add("milk");
console.log(cart.items.length);`,
    },
    {
      kind: "write",
      title: "درجة الحرارة",
      prompt: "اكتب صنفاً Temperature: الـ constructor يحفظ celsius في حقل خاص #celsius، و getter اسمه fahrenheit يُرجع celsius * 9 / 5 + 32. ثم اطبع new Temperature(100).fahrenheit و new Temperature(0).fahrenheit. يجب أن يظهر 212 ثم 32.",
      starter: "// class Temperature {\n",
      expected: "212\n32",
      hint: "اكتب #celsius; في جسم الصنف، ثم this.#celsius = celsius; في الـ constructor، ثم get fahrenheit() { return this.#celsius * 9 / 5 + 32; }.",
      solution: `class Temperature {
  #celsius;
  constructor(celsius) {
    this.#celsius = celsius;
  }
  get fahrenheit() {
    return this.#celsius * 9 / 5 + 32;
  }
}
console.log(new Temperature(100).fahrenheit);
console.log(new Temperature(0).fahrenheit);`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: 'class A {\n  hi() { return "A"; }\n}\nclass B extends A {\n  hi() { return "B" + super.hi(); }\n}\nconsole.log(new B().hi());',
      options: ["B", "BA", "AB"],
      answer: 1,
      why: "البحث يجد hi في B.prototype أولاً فتحجب نسخة A. وداخلها super.hi() تبدأ البحث من A.prototype صراحة.",
    },
    {
      question: "ماذا يطبع؟",
      code: "class P {}\nconsole.log(typeof P, typeof P.prototype);",
      options: ["class object", "function object", "object object"],
      answer: 1,
      why: "الصنف دالة بانية، ومعها كائن prototype تعيش فيه الطرق. class صياغة جديدة للبنية القديمة نفسها.",
    },
    {
      question: "ماذا يطبع؟",
      code: "class C {\n  count = 0;\n  inc() { this.count++; }\n}\nconst a = new C();\nconst b = new C();\na.inc();\na.inc();\nconsole.log(a.count, b.count, a.inc === b.inc);",
      options: ["2 0 true", "2 2 true", "2 0 false"],
      answer: 0,
      why: "الحقل count يُنشأ في كل كائن على حدة، أما inc فواحدة في C.prototype يصل إليها الكائنان.",
    },
    {
      question: "ماذا يطبع؟",
      code: "class M {\n  static twice(n) { return n * 2; }\n}\nconst m = new M();\nconsole.log(M.twice(4), typeof m.twice);",
      options: ["8 function", "8 undefined", "TypeError"],
      answer: 1,
      why: "static تضع الطريقة على الصنف نفسه (الدالة M)، لا على M.prototype. سلسلة الكائن m تمر بـ M.prototype فقط، فلا تجدها.",
    },
    {
      question: "ماذا يطبع؟",
      code: "class A {}\nclass B extends A {}\nconst b = new B();\nconsole.log(b instanceof A, Object.getPrototypeOf(B.prototype) === A.prototype);",
      options: ["true true", "false true", "true false"],
      answer: 0,
      why: "extends ربطت B.prototype بـ A.prototype. و instanceof A تمشي سلسلة b وتسأل: هل مررت بـ A.prototype؟ نعم.",
    },
  ],
  next: "js-modules",
};
