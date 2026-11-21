import type { Frame, HeapObj, Lesson, Scene, Slot, Step } from "@/lib/types";

const str = (name: string, value: string): Slot => ({ name, value: `"${value}"`, type: "string" });
const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
const fnv = (name: string, label = name): Slot => ({ name, value: `ƒ ${label}`, type: "function" });
const nil = (name: string): Slot => ({ name, value: "null", type: "none" });
const proto = (to: number | null): Slot => (to === null ? nil("[[Prototype]]") : ref("[[Prototype]]", to));
const prog = (vars: Slot[]): Frame => ({ id: 1, name: "البرنامج", vars });
const call = (name: string, vars: Slot[]): Frame => ({ id: 2, name, vars });
const obj = (id: number, items: Slot[]): HeapObj => ({ id, kind: "object", items });
const at = (line: number | null, say: string, frames: Frame[], heap: HeapObj[], extra: Partial<Step> = {}): Step => ({ line, say, memory: [], frames, heap, ...extra });
const js = (code: string, steps: Step[]): Scene => ({ code: { js: code }, steps });

/** Object.prototype, the end of almost every chain. */
const root = obj(1, [fnv("toString"), fnv("hasOwnProperty"), proto(null)]);
const animal = obj(2, [fnv("eat"), proto(1)]);
const rabbit = (...own: Slot[]) => obj(3, [...own, proto(2)]);
const v = [ref("animal", 2), ref("rabbit", 3)];

export const jsPrototypes: Lesson = {
  slug: "js-prototypes",
  stage: 0,
  number: "2.3",
  title: "النماذج الأولية",
  subtitle: "كل كائن يحمل رابطاً مخفياً إلى كائن آخر، والقراءة تمشي على هذه السلسلة",
  minutes: 24,
  singleLanguage: true,
  problem: {
    title: "ألف نسخة من الدالة نفسها",
    body: "متجر فيه مستخدمون، ولكل مستخدم ثلاث طرق. حرّك المؤشر لتزيد عددهم وقارن عدد الدوال في الذاكرة. ثم أضف طريقة جديدة للجميع.",
    demo: "jsPrototypes",
  },
  scene: {
    code: {
      js: `const animal = {
  eat() { return this.name + " eats"; },
};
const rabbit = Object.create(animal);
rabbit.name = "Bunny";
console.log(rabbit.eat());
console.log(rabbit.fly);
rabbit.eat = () => "carrots";
console.log(rabbit.eat(), animal.eat());`,
    },
    notes: {
      js: "كل كائن في JavaScript له رابط مخفي [[Prototype]] إلى كائن آخر أو null (تقرؤه بـ Object.getPrototypeOf). القراءة تبحث في الكائن، ثم تتبع السلسلة حتى null. الكتابة تذهب دائماً إلى الكائن نفسه. المصفوفات تشير إلى Array.prototype، ولهذا تملك كل مصفوفة map و push دون أن تحملها.",
    },
    steps: [
      at(null, "على الكومة كائن موجود قبل أي سطر: Object.prototype #1. فيه toString و hasOwnProperty، ورابطه [[Prototype]] هو null: نهاية السلسلة.", [prog([])], [root]),
      at(1, "animal #2 فيه الدالة eat، ورابطه المخفي يشير إلى Object.prototype. كل كائن تكتبه بالأقواس { } يُولد بهذا الرابط.", [prog([ref("animal", 2)])], [root, animal], { changedHeap: [2] }),
      at(4, "Object.create(animal) تصنع كائناً فارغاً #3، رابطه المخفي يشير إلى animal. لا يُنسخ شيء من animal: رابط فقط.", [prog(v)], [root, animal, rabbit()], { changed: ["rabbit"], changedHeap: [3] }),
      at(5, "الكتابة rabbit.name تذهب دائماً إلى الكائن نفسه: name الآن خاصية خاصة (own) بـ #3.", [prog(v)], [root, animal, rabbit(str("name", "Bunny"))], { changedHeap: [3] }),
      at(6, "rabbit.eat: يبحث المحرّك في #3 فلا يجد eat، فيتبع [[Prototype]] إلى #2 ويجدها هناك.", [prog(v)], [root, animal, rabbit(str("name", "Bunny"))], { read: ["rabbit"] }),
      at(2, "الاستدعاء كان rabbit.eat()، فـ this هو rabbit (#3) وليس animal. الدالة تعيش في animal وتعمل على بيانات rabbit: \"Bunny eats\".", [prog(v), call("eat", [ref("this", 3)])], [root, animal, rabbit(str("name", "Bunny"))], { output: ["Bunny eats"] }),
      at(7, "rabbit.fly: لا في #3، ولا في #2، ولا في #1، ثم null. السلسلة انتهت، فالنتيجة undefined دون خطأ.", [prog(v)], [root, animal, rabbit(str("name", "Bunny"))], { output: ["Bunny eats", "undefined"] }),
      at(8, "كتابة eat على rabbit تضعها في #3 نفسه. animal لم يتغير، لكن eat الجديدة تحجب (shadow) القديمة لأن البحث يجدها أولاً.", [prog(v)], [root, animal, rabbit(str("name", "Bunny"), fnv("eat", "arrow"))], { changedHeap: [3] }),
      at(9, "rabbit.eat() تجد السهمية في #3 فوراً. أما animal.eat() فتجد الأصلية، و this هنا animal الذي لا يملك name، فتصير \"undefined eats\".", [prog(v)], [root, animal, rabbit(str("name", "Bunny"), fnv("eat", "arrow"))], { output: ["Bunny eats", "undefined", "carrots undefined eats"] }),
    ],
  },
  playground: {
    kind: "trace",
    intro: "المتتبّع لا يعرض [[Prototype]]، فلنبنِ السلسلة بأيدينا: كل كائن فيه own (خصائصه الخاصة) و proto (رابطه). الدالة lookup تفعل ما يفعله المحرّك عند كل قراءة: تبحث، ثم تقفز إلى الرابط، حتى null.",
    starter: `const objectProto = { proto: null, own: { toString: "built-in" } };
const animal = { proto: objectProto, own: { eats: true } };
const rabbit = { proto: animal, own: { jumps: true } };
function lookup(obj, key) {
  let cur = obj;
  let hops = 0;
  while (cur !== null) {
    if (cur.own[key] !== undefined) {
      return key + " found after " + hops + " hops";
    }
    cur = cur.proto;
    hops = hops + 1;
  }
  return key + " is undefined";
}
console.log(lookup(rabbit, "jumps"));
console.log(lookup(rabbit, "eats"));
console.log(lookup(rabbit, "toString"));
console.log(lookup(rabbit, "fly"));`,
    challenges: [
      "توقّع عدد القفزات لكل سطر قبل أن تضغط، ثم تحقق.",
      "أضف rabbit.own.eats = false قبل الطباعة. كم قفزة تحتاج eats الآن؟ هذا هو الحجب (shadowing).",
      "أضف animal.own.fly = true بعد إنشاء rabbit. هل يجد rabbit الخاصية؟ الرابط حيّ، لا نسخة.",
      "اكتب دالة set(obj, key, value) تكتب في obj.own دائماً، كما يفعل المحرّك مع الإسناد، واستعملها على rabbit.",
    ],
  },
  predict: [
    {
      question: "مصفوفة في النموذج الأولي، وكائنان مبنيان عليه. ماذا يطبع؟",
      code: `const proto = { tags: [] };
const a = Object.create(proto);
const b = Object.create(proto);
a.tags.push("new");
console.log(b.tags.length);`,
      options: ["0", "1", "TypeError"],
      answer: 1,
      why: "a.tags قراءة، لا كتابة: لا تجد tags في a فتصل إلى مصفوفة proto، و push تغيّر تلك المصفوفة المشتركة. b يقرأ المصفوفة نفسها. البيانات الخاصة بكل كائن توضع فيه هو، والطرق المشتركة في النموذج.",
      scene: js("const proto = { tags: [] };\nconst a = Object.create(proto);\nconst b = Object.create(proto);\na.tags.push(\"new\");\nconsole.log(b.tags.length);", [
        at(3, "a و b كائنان فارغان، وكلاهما يشير إلى proto. المصفوفة #4 واحدة فقط.", [prog([ref("proto", 1), ref("a", 2), ref("b", 3)])], [obj(1, [ref("tags", 4)]), obj(2, [proto(1)]), obj(3, [proto(1)]), { id: 4, kind: "array", items: [] }]),
        at(4, "a.tags: ليست في a، فيصل البحث إلى proto ويجد المصفوفة #4. push تضيف إليها.", [prog([ref("proto", 1), ref("a", 2), ref("b", 3)])], [obj(1, [ref("tags", 4)]), obj(2, [proto(1)]), obj(3, [proto(1)]), { id: 4, kind: "array", items: [str("0", "new")] }], { changedHeap: [4] }),
        at(5, "b.tags يصل إلى المصفوفة نفسها #4، وطولها 1.", [prog([ref("proto", 1), ref("a", 2), ref("b", 3)])], [obj(1, [ref("tags", 4)]), obj(2, [proto(1)]), obj(3, [proto(1)]), { id: 4, kind: "array", items: [str("0", "new")] }], { output: ["1"] }),
      ]),
    },
    {
      question: "إعدادات افتراضية، ونسخة مبنية عليها تغيّر قيمة. ماذا يطبع؟",
      code: `const defaults = { theme: "light" };
const mine = Object.create(defaults);
mine.theme = "dark";
console.log(defaults.theme, mine.theme);`,
      options: ["light dark", "dark dark", "light light"],
      answer: 0,
      why: "الإسناد يكتب دائماً في الكائن نفسه. mine.theme صارت خاصية خاصة بـ mine تحجب قيمة defaults، و defaults لم يتغير.",
      scene: js("const defaults = { theme: \"light\" };\nconst mine = Object.create(defaults);\nmine.theme = \"dark\";\nconsole.log(defaults.theme, mine.theme);", [
        at(2, "mine فارغ ويشير إلى defaults. قراءة mine.theme الآن تعطي \"light\" من defaults.", [prog([ref("defaults", 1), ref("mine", 2)])], [obj(1, [str("theme", "light")]), obj(2, [proto(1)])]),
        at(3, "الكتابة تذهب إلى mine نفسه: خاصية theme جديدة في #2.", [prog([ref("defaults", 1), ref("mine", 2)])], [obj(1, [str("theme", "light")]), obj(2, [str("theme", "dark"), proto(1)])], { changedHeap: [2] }),
        at(4, "defaults.theme ما زالت \"light\"، و mine.theme تجد \"dark\" في #2 قبل أن تحتاج إلى السلسلة.", [prog([ref("defaults", 1), ref("mine", 2)])], [obj(1, [str("theme", "light")]), obj(2, [str("theme", "dark"), proto(1)])], { output: ["light dark"] }),
      ]),
    },
    {
      question: "أضفنا دالة إلى النموذج بعد إنشاء الكائن. ماذا يطبع؟",
      code: `const base = {};
const x = Object.create(base);
base.hello = () => "hi";
console.log(x.hello());`,
      options: ["hi", "TypeError: x.hello is not a function", "undefined"],
      answer: 0,
      why: "x لا يحمل نسخة من base، بل رابطاً إليه. البحث يحدث لحظة القراءة، و hello موجودة في base حينها.",
      scene: js("const base = {};\nconst x = Object.create(base);\nbase.hello = () => \"hi\";\nconsole.log(x.hello());", [
        at(2, "x فارغ ورابطه يشير إلى base الفارغ.", [prog([ref("base", 1), ref("x", 2)])], [obj(1, []), obj(2, [proto(1)])]),
        at(3, "hello تُضاف إلى base بعد إنشاء x.", [prog([ref("base", 1), ref("x", 2)])], [obj(1, [fnv("hello", "arrow")]), obj(2, [proto(1)])], { changedHeap: [1] }),
        at(4, "x.hello: لا شيء في x، فيتبع الرابط إلى base ويجدها الآن.", [prog([ref("base", 1), ref("x", 2)])], [obj(1, [fnv("hello", "arrow")]), obj(2, [proto(1)])], { output: ["hi"] }),
      ]),
    },
  ],
  code: {
    intro: "قبل الأصناف كان المحترفون يكتبون هكذا، وما زال هذا ما يحدث تحت كل class: دالة بانية (constructor) تضع البيانات في كل كائن، وطرق توضع مرة واحدة في Product.prototype. new تربط كل كائن جديد بهذا النموذج. شغّل، ثم جرّب التعليق.",
    runnerStarter: `function Product(name, price) {
  this.name = name; // data: one copy per object
  this.price = price;
}
Product.prototype.withTax = function (rate) {
  return Math.round(this.price * (1 + rate)); // behaviour: one function for all
};

const tea = new Product("tea", 10);
const milk = new Product("milk", 20);
console.log(tea.withTax(0.15), milk.withTax(0.15));
console.log(tea.withTax === milk.withTax);
console.log(Object.getPrototypeOf(tea) === Product.prototype);
console.log(Object.hasOwn(tea, "name"), Object.hasOwn(tea, "withTax"));

const list = [3, 1, 2];
console.log(Object.getPrototypeOf(list) === Array.prototype, Object.hasOwn(list, "map"));

const dict = Object.create(null); // no chain at all: a clean dictionary
dict.toString = "just a key";
console.log(Object.getPrototypeOf(dict), dict.toString);
// جرّب: أضف Product.prototype.label بعد إنشاء tea (دالة تُرجع this.name + " " + this.price) واستدعها على tea
`,
  },
  exercises: [
    {
      kind: "order",
      title: "السيارة ترث العجلات",
      prompt: "رتّب الأسطر: car يُبنى على vehicle، وله خاصيته الخاصة. يجب أن يطبع Kia 4.",
      lines: ["const vehicle = { wheels: 4 };", "const car = Object.create(vehicle);", 'car.brand = "Kia";', "console.log(car.brand, car.wheels);"],
      expected: "Kia 4",
    },
    {
      kind: "fill",
      title: "خاصة أم موروثة؟",
      prompt: "item مبني على base. أي اسم خاصية يجعل Object.hasOwn تطبع true؟",
      template: 'const base = { kind: "base" };\nconst item = Object.create(base);\nitem.id = 7;\nconsole.log(Object.hasOwn(item, ___));',
      options: ['"kind"', '"id"', '"toString"'],
      expected: "true",
    },
    {
      kind: "fix",
      title: "السلّة المشتركة",
      prompt: "sara أضافت شاياً و omar أضاف حليباً، لكن كل سلّة تقول إن فيها عنصرين. أصلح البرنامج حتى يطبع 1 1، دون أن تغيّر basket.",
      code: `const basket = {
  items: [],
  add(item) {
    this.items.push(item);
  },
};
const sara = Object.create(basket);
const omar = Object.create(basket);
sara.add("tea");
omar.add("milk");
console.log(sara.items.length, omar.items.length);`,
      expected: "1 1",
      hint: "this.items قراءة تصل إلى مصفوفة basket الوحيدة. أعطِ كل كائن مصفوفته الخاصة بعد إنشائه: sara.items = [];",
      solution: `const basket = {
  items: [],
  add(item) {
    this.items.push(item);
  },
};
const sara = Object.create(basket);
sara.items = [];
const omar = Object.create(basket);
omar.items = [];
sara.add("tea");
omar.add("milk");
console.log(sara.items.length, omar.items.length);`,
    },
    {
      kind: "write",
      title: "طول السلسلة",
      prompt: "اكتب دالة depth(obj) تُرجع عدد روابط [[Prototype]] من obj حتى null، باستعمال Object.getPrototypeOf. ثم اطبع depth({}) و depth(Object.create(null)) و depth(Object.create({})). يجب أن يظهر 1 ثم 0 ثم 2.",
      starter: "// function depth(obj) {\n",
      expected: "1\n0\n2",
      hint: "let count = 0; let cur = Object.getPrototypeOf(obj); ثم while (cur !== null) { count++; cur = Object.getPrototypeOf(cur); } و return count.",
      solution: `function depth(obj) {
  let count = 0;
  let cur = Object.getPrototypeOf(obj);
  while (cur !== null) {
    count++;
    cur = Object.getPrototypeOf(cur);
  }
  return count;
}
console.log(depth({}));
console.log(depth(Object.create(null)));
console.log(depth(Object.create({})));`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: "const a = { x: 1 };\nconst b = Object.create(a);\nb.x = 2;\ndelete b.x;\nconsole.log(b.x);",
      options: ["2", "1", "undefined"],
      answer: 1,
      why: "b.x = 2 صنعت خاصية خاصة تحجب x في a. delete حذفت تلك الخاصية من b فقط، فعادت القراءة تصل إلى a: القيمة 1.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'const person = { greet() { return "hi " + this.n; } };\nconst o = Object.create(person);\no.n = "Ali";\nconsole.log(o.greet());',
      options: ["hi Ali", "hi undefined", "TypeError"],
      answer: 0,
      why: "greet وُجدت في person عبر السلسلة، لكن الاستدعاء كان o.greet()، فـ this هو o الذي يملك n.",
    },
    {
      question: "ماذا يطبع؟",
      code: "const d = Object.create(null);\nconsole.log(typeof d.toString);",
      options: ["function", "undefined", "TypeError"],
      answer: 1,
      why: "رابط d هو null من البداية، فلا يوجد Object.prototype في سلسلته. البحث عن toString ينتهي فوراً بـ undefined.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'const arr = [1, 2];\nconsole.log(Object.getPrototypeOf(arr) === Array.prototype, Object.hasOwn(arr, "map"));',
      options: ["true true", "true false", "false false"],
      answer: 1,
      why: "المصفوفة لا تحمل map. تجدها عبر رابطها إلى Array.prototype، حيث تعيش نسخة واحدة تشترك فيها كل المصفوفات.",
    },
    {
      question: "أنشأت 1000 كائن بـ new Product(...)، و withTax معرّفة على Product.prototype. كم دالة withTax في الذاكرة؟",
      options: ["1000", "1", "2"],
      answer: 1,
      why: "الطريقة تعيش مرة واحدة في Product.prototype، وكل كائن يصل إليها عبر رابطه المخفي. لو كتبتها داخل الدالة البانية بـ this.withTax = ... لصار عندك 1000 نسخة.",
    },
  ],
  next: "js-classes",
};
