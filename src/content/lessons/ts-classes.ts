import type { Cell, Lesson, Scene } from "@/lib/types";

const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const owner = { name: "acc.owner", value: '"Sara"', type: "string" as const, constant: true };

export const tsClasses: Lesson = {
  slug: "ts-classes",
  stage: 0,
  number: "2.3",
  title: "الأصناف",
  subtitle: "صنف JavaScript عادي، فوقه ملصقات: بعضها يبقى عند التشغيل وبعضها يختفي",
  minutes: 24,
  problem: {
    title: "خزنتان: أيهما مقفلة حقاً؟",
    body: "حساب بنكي برصيد خاص. الخزنة الأولى تستعمل private والثانية #. حاول تغيير الرصيد من الخارج: مرة من TypeScript، ومرة من JavaScript لا يرى الأنواع. أي قفل يصمد؟",
    demo: "tsClasses",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `class Account {
  #balance = 0;
  constructor(public readonly owner: string) {}
  deposit(amount: number): void {
    this.#balance += amount;
  }
  get balance(): number { return this.#balance; }
}
const acc = new Account("Sara");
acc.deposit(50);
console.log(acc.owner, acc.balance);`,
    },
    steps: [
      {
        line: null,
        say: "الصنف في TypeScript هو صنف JavaScript نفسه: مصنع يبني كائنات تتشارك الدوال. TypeScript تضيف ملصقات: أنواع الحقول، و public و private و readonly.",
        memory: [],
      },
      {
        line: 1,
        say: "تعريف الصنف ينشئ دالة بانية اسمها Account، ومعها نموذج أولي فيه deposit و balance يتشاركه كل حساب.",
        memory: [label("Account.prototype", "deposit, get balance")],
      },
      {
        line: 9,
        say: "new Account(\"Sara\"): يُحجز كائن جديد فارغ في الذاكرة، ثم تُملأ حقوله بالترتيب.",
        memory: [label("Account.prototype", "deposit, get balance")],
      },
      {
        line: 2,
        say: "أولاً الحقل #balance = 0. علامة # حقيقية في JavaScript: حقل لا يصل إليه أحد خارج الصنف، حتى عند التشغيل.",
        memory: [{ name: "acc.#balance", value: "0", type: "number" }],
        changed: ["acc.#balance"],
      },
      {
        line: 3,
        say: "public readonly owner في المعاملات اختصار: يعلن حقلاً ويكتب this.owner = owner. و readonly ملصق للمدقّق: يمنع acc.owner = ... في الكود، ويختفي عند التشغيل.",
        memory: [{ name: "acc.#balance", value: "0", type: "number" }, owner],
        changed: ["acc.owner"],
      },
      {
        line: 10,
        say: "acc.deposit(50): المدقّق يفحص أن 50 رقم. ثم تُستدعى deposit من النموذج الأولي، و this يشير إلى acc.",
        memory: [{ name: "acc.#balance", value: "0", type: "number" }, owner],
      },
      {
        line: 5,
        say: "this.#balance += 50. نحن داخل الصنف، فالوصول إلى # مسموح.",
        memory: [{ name: "acc.#balance", value: "50", type: "number" }, owner],
        changed: ["acc.#balance"],
        read: ["acc.#balance"],
      },
      {
        line: 11,
        say: "acc.balance بلا أقواس: get يجعل الدالة تبدو حقلاً يُقرأ فقط. من الخارج تستطيع أن تقرأ الرصيد، لكن لا أن تكتبه.",
        memory: [{ name: "acc.#balance", value: "50", type: "number" }, owner],
        read: ["acc.#balance", "acc.owner"],
      },
      {
        line: 11,
        say: "يُطبع Sara 50.",
        memory: [{ name: "acc.#balance", value: "50", type: "number" }, owner],
        output: ["Sara 50"],
      },
      {
        line: null,
        say: "القاعدة: ما يختفي بعد حذف الأنواع (private و readonly و public و implements و abstract) حماية وقت الكتابة. و # وحدها حماية وقت التشغيل أيضاً.",
        memory: [],
      },
    ],
    notes: {
      ts: "TypeScript تقارن الأصناف بشكلها لا باسمها: أي كائن فيه الحقول نفسها يقبل مكان الصنف، إلا إذا كان للصنف حقل private أو #.",
    },
  },
  playground: {
    kind: "trace",
    intro: "الصنف مصنع كائنات. هنا مصنع بلا class: دالة تبني كائناً، والرصيد في متغير داخلها لا يصل إليه أحد من الخارج، مثل #. شغّل وراقب المكدّس.",
    starter: `function makeAccount(owner) {
  let balance = 0;
  return {
    owner: owner,
    deposit: function (amount) {
      balance = balance + amount;
    },
    getBalance: function () {
      return balance;
    },
  };
}
const acc = makeAccount("Sara");
acc.deposit(50);
acc.deposit(25);
console.log(acc.owner, acc.getBalance());
acc.balance = 1000000;
console.log(acc.getBalance());`,
    challenges: [
      "السطر 17 حاول أن يغيّر الرصيد من الخارج. هل نجح؟ ماذا أضاف إلى الكائن فعلاً؟",
      "أنشئ حساباً ثانياً makeAccount(\"Omar\") وأودع فيه 10. هل يتأثر رصيد Sara؟",
      "أضف withdraw(amount) ترفض السحب إن كان أكبر من الرصيد: if (amount > balance) { return false; }",
      "في TypeScript نكتب هذا كله class Account مع #balance. أي سطر هنا يقابل constructor؟",
    ],
  },
  predict: [
    {
      question: "tsc يرفض w.coins مباشرة، لكن (w as any) يُسكته. ماذا يطبع التشغيل؟",
      code: `class Wallet {
  private coins = 5;
}
const w = new Wallet();
console.log((w as any).coins);`,
      options: ["5", "undefined", "خطأ: coins خاص"],
      answer: 0,
      why: "private ملصق للمدقّق فقط. بعد حذف الأنواع يصير الحقل this.coins = 5 عادياً، يراه أي كود يتجاوز المدقّق (any، أو مكتبة JavaScript). لو كان #coins لكان مخفياً فعلاً.",
      scene: check(
        `class Wallet {
  private coins = 5;
}
const w = new Wallet();
console.log((w as any).coins);`,
        [
          { line: 2, say: "private: المدقّق سيرفض w.coins خارج الصنف.", memory: [label("coins", "private (tsc only)")] },
          { line: 4, say: "عند التشغيل: كائن فيه حقل عادي اسمه coins.", memory: [{ name: "w.coins", value: "5", type: "number" }] },
          { line: 5, say: "as any أطفأ المدقّق، والحقل موجود فعلاً: يُطبع 5.", memory: [{ name: "w.coins", value: "5", type: "number" }], read: ["w.coins"], output: ["5"] },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc عن السطر 5؟",
      code: `class User {
  constructor(public readonly id: number, public name: string) {}
}
const u = new User(7, "Sara");
u.id = 8;`,
      options: ["Cannot assign to 'id' because it is a read-only property", "لا خطأ: u ليس const", "Property 'id' is private"],
      answer: 0,
      why: "readonly على الحقل: يُكتب مرة واحدة في البانية، ثم يُقرأ فقط. name بلا readonly فـ u.name = \"Omar\" مسموح. والمعرّف شيء لا ينبغي أن يتغيّر، فهذا مكانه الطبيعي.",
      scene: check(
        `class User {
  constructor(public readonly id: number, public name: string) {}
}
const u = new User(7, "Sara");
u.id = 8;`,
        [
          { line: 2, say: "معاملا البانية يعلنان حقلين: id للقراءة فقط، و name عادي.", memory: [label("id", "readonly number"), label("name", "string")] },
          { line: 4, say: "البانية تكتب id = 7 مرة واحدة.", memory: [{ name: "u.id", value: "7", type: "number" }, { name: "u.name", value: '"Sara"', type: "string" }] },
          { line: 5, say: "كتابة ثانية على حقل readonly: خط أحمر.", memory: [{ name: "u.id", value: "7", type: "number" }], error: "Cannot assign to 'id' because it is a read-only property." },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc عن السطر 4؟",
      code: `interface Shape {
  area(): number;
}
class Square implements Shape {
  constructor(private side: number) {}
}`,
      options: ["Class 'Square' incorrectly implements interface 'Shape'", "لا خطأ: implements مجرد تعليق", "Cannot find name 'Shape'"],
      answer: 0,
      why: "implements وعد يفحصه المدقّق: الصنف يجب أن يملك كل ما في الـ interface. Square لا area لها، فيذكر السبب: Property 'area' is missing. ولا يبقى من implements شيء عند التشغيل.",
      scene: check(
        `interface Shape {
  area(): number;
}
class Square implements Shape {
  constructor(private side: number) {}
}`,
        [
          { line: 1, say: "العقد: كل Shape فيه area() ترجع رقماً.", memory: [label("Shape", "{ area(): number }")] },
          { line: 4, say: "Square تعد بالعقد، لكنها لا تملك area.", memory: [label("Square", "{ side }")], error: "Class 'Square' incorrectly implements interface 'Shape'.\n  Property 'area' is missing in type 'Square' but required in type 'Shape'." },
        ],
      ),
    },
  ],
  code: {
    intro: "صنف مجرد abstract يضع القالب، وأصناف ترثه وتملأ ما ينقصه، و protected لحقل يراه الأبناء فقط، و override للتأكد أنك تعيد كتابة دالة موجودة فعلاً، و static لما يخص الصنف كله.",
    runnerLang: "ts",
    runnerStarter: `abstract class Shape {
  static created = 0;
  constructor(protected readonly label: string) {
    Shape.created++;
  }
  abstract area(): number;
  describe(): string {
    return this.label + ": " + this.area().toFixed(2);
  }
}

class Circle extends Shape {
  constructor(private readonly radius: number) {
    super("circle");
  }
  override area(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rect extends Shape {
  constructor(private readonly width: number, private readonly height: number) {
    super("rect");
  }
  override area(): number {
    return this.width * this.height;
  }
}

const shapes: Shape[] = [new Circle(1), new Rect(3, 4)];
for (const s of shapes) {
  console.log(s.describe());
}
console.log("created:", Shape.created);
// try: add class Square extends Rect with a constructor(side: number).
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "عدّاد بحقل خاص",
      prompt: "رتّب صنف Counter: حقل #count يبدأ من 0، و increment ترجع القيمة الجديدة. الناتج: 1 2",
      lines: [
        "class Counter {",
        "  #count = 0;",
        "  increment(): number {",
        "    this.#count++;",
        "    return this.#count;",
        "  }",
        "}",
        "const c = new Counter();",
        "console.log(c.increment(), c.increment());",
      ],
      expected: "1 2",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "صوت الأب ثم صوت الابن",
      prompt: "Dog يعيد كتابة speak، ويريد أن يبدأ بما يقوله Animal. أي تعبير يطبع Rex makes a sound (woof)؟",
      template: `class Animal {
  constructor(public name: string) {}
  speak(): string {
    return this.name + " makes a sound";
  }
}
class Dog extends Animal {
  override speak(): string {
    return ___ + " (woof)";
  }
}
console.log(new Dog("Rex").speak());`,
      options: ["super.speak()", "this.name", "Animal.name"],
      expected: "Rex makes a sound (woof)",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "الحقل الذي لم يُحفظ",
      prompt: "يطبع hi undefined. tsc كان سيقول: Property 'name' does not exist on type 'User'. المعامل name لم يصبح حقلاً. أصلح سطراً واحداً ليُطبع hi Sara",
      code: `class User {
  constructor(name: string) {}
  greet(): string {
    return "hi " + this.name;
  }
}
console.log(new User("Sara").greet());`,
      expected: "hi Sara",
      hint: "أضف public قبل name في البانية: constructor(public name: string) {}",
      solution: `class User {
  constructor(public name: string) {}
  greet(): string {
    return "hi " + this.name;
  }
}
console.log(new User("Sara").greet());`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "مكدّس عام",
      prompt: "اكتب class Stack<T> فيها #items: T[] = []، و push(item: T): void، و pop(): T | undefined، و get size(): number. ثم ادفع 1 و 2 و 3، واسحب مرة، واطبع s.pop() و s.size: 2 1",
      starter: "// write class Stack<T> here\n",
      expected: "2 1",
      hint: "push: this.#items.push(item). pop: return this.#items.pop(). size: return this.#items.length.",
      solution: `class Stack<T> {
  #items: T[] = [];
  push(item: T): void {
    this.#items.push(item);
  }
  pop(): T | undefined {
    return this.#items.pop();
  }
  get size(): number {
    return this.#items.length;
  }
}
const s = new Stack<number>();
s.push(1);
s.push(2);
s.push(3);
s.pop();
console.log(s.pop(), s.size);`,
    },
  ],
  quiz: [
    {
      question: "ماذا يقول tsc عن السطر 5؟",
      code: "class Counter {\n  #count = 0;\n}\nconst k = new Counter();\nconsole.log(k.#count);",
      options: [
        "Property '#count' is not accessible outside class 'Counter' because it has a private identifier",
        "لا خطأ، ويطبع 0",
        "لا خطأ، ويطبع undefined",
      ],
      answer: 0,
      why: "# جزء من JavaScript نفسها: الوصول إليه خارج الصنف خطأ في المدقّق، وخطأ نحوي عند التشغيل أيضاً. لا any ولا مكتبة تستطيع قراءته.",
    },
    {
      question: "ماذا يقول tsc عن السطر 5؟",
      code: "class Temp {\n  constructor(private c: number) {}\n  get f(): number { return this.c * 9 / 5 + 32; }\n}\nconsole.log(new Temp(100).f());",
      options: [
        "This expression is not callable because it is a 'get' accessor. Did you mean to use it without '()'?",
        "لا خطأ، ويطبع 212",
        "Property 'f' is private",
      ],
      answer: 0,
      why: "get يجعل f تُقرأ كحقل: new Temp(100).f تعطي 212. إضافة () تحاول استدعاء الرقم 212 نفسه كدالة.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: "class Ticket {\n  static issued = 0;\n  readonly no: number;\n  constructor() {\n    Ticket.issued++;\n    this.no = Ticket.issued;\n  }\n}\nnew Ticket();\nconst t = new Ticket();\nconsole.log(t.no, Ticket.issued);",
      options: ["2 2", "1 1", "1 2"],
      answer: 0,
      why: "static حقل على الصنف نفسه، واحد يتشاركه الجميع، لا نسخة لكل كائن. بعد تذكرتين صار 2، والتذكرة الثانية أخذت رقمها 2.",
    },
    {
      question: "هل يقبل tsc السطر 4؟",
      code: "class Point {\n  constructor(public x: number, public y: number) {}\n}\nconst p: Point = { x: 1, y: 2 };",
      options: ["نعم: الكائن له شكل Point نفسه", "لا: يجب استعمال new Point", "لا: Point صنف وليس interface"],
      answer: 0,
      why: "المدقّق يقارن الأشكال لا الأسماء. { x, y } فيه كل ما في Point، فيُقبل. لكنه ليس من صنعه: p instanceof Point يعطي false عند التشغيل.",
    },
    {
      question: "ماذا يقول tsc عن السطر 4؟",
      code: "abstract class Shape {\n  abstract area(): number;\n}\nconst s = new Shape();",
      options: ["Cannot create an instance of an abstract class", "لا خطأ، و area ترجع undefined", "Shape is not a constructor"],
      answer: 0,
      why: "abstract قالب ناقص: area بلا جسم. المدقّق يمنع بناء كائن منه، ويُلزم كل ابن بأن يكتب area. وبعد حذف الأنواع يصير صنفاً عادياً، فالحماية وقت الكتابة فقط.",
    },
  ],
  next: "ts-guards",
};
