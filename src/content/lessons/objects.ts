import type { Lesson } from "@/lib/types";

export const objects: Lesson = {
  slug: "objects",
  stage: 1,
  number: "1.12",
  title: "الكائنات",
  subtitle: "بطاقة على الكومة، أدراجها لها أسماء بدل الأرقام",
  minutes: 15,
  problem: {
    title: "ثلاث قوائم تفترق",
    body: "خزّنّا جهات الاتصال في ثلاث مصفوفات: الأسماء والأرقام والمدن. الرابط الوحيد بينها هو رقم الخانة. رتّب الأسماء أو احذف اسماً، وراقب لمن صار كل رقم.",
    demo: "objects",
  },
  scene: {
    code: {
      js: `let user = { name: "Sara", age: 20 };
console.log(user.name);
user.age = 21;
user["city"] = "Riyadh";
console.log(user.age, user.city);
console.log(user.phone);`,
      ts: `let user: Record<string, any> = { name: "Sara", age: 20 };
console.log(user.name);
user.age = 21;
user["city"] = "Riyadh";
console.log(user.age, user.city);
console.log(user.phone);`,
      py: `user = {"name": "Sara", "age": 20}
print(user["name"])
user["age"] = 21
user["city"] = "Riyadh"
print(user["age"], user["city"])
print(user.get("phone"))`,
      go: `user := map[string]any{"name": "Sara", "age": 20}
fmt.Println(user["name"])
user["age"] = 21
user["city"] = "Riyadh"
fmt.Println(user["age"], user["city"])
fmt.Println(user["phone"])`,
      dart: `var user = <String, dynamic>{"name": "Sara", "age": 20};
print(user["name"]);
user["age"] = 21;
user["city"] = "Riyadh";
print("\${user["age"]} \${user["city"]}");
print(user["phone"]);`,
      rust: `let mut user = User { name: "Sara".to_string(), age: 20, city: None };
println!("{}", user.name);
user.age = 21;
user.city = Some("Riyadh".to_string());
println!("{} {:?}", user.age, user.city);
// user.phone: compile error, User has no phone field`,
    },
    notes: {
      js: "القوسان { } يصنعان بطاقة على الكومة، والمتغيّر يحمل سهماً إليها. user.age و user[\"age\"] يفتحان الدرج نفسه، والدرج الغائب يُقرأ undefined.",
      ts: "استعملنا Record<string, any> لأنه يسمح بإضافة أدراج جديدة كما في JavaScript. لو كتبنا شكل البطاقة بالضبط، لرفض TypeScript إضافة city وقراءة phone قبل التشغيل.",
      py: "في بايثون البطاقة اسمها dict، وتُفتح أدراجها بالأقواس المربعة فقط. قراءة مفتاح غائب بالأقواس توقف البرنامج بخطأ، لذلك استعملنا get التي تعطي None بدلها.",
      go: "استعملنا map لأنها تسمح بإضافة مفتاح جديد كما في السطر 4؛ الـ struct في Go أدراجه ثابتة. any تسمح بخلط نص ورقم، والمفتاح الغائب يعطي <nil>.",
      dart: "في Dart البطاقة Map، تُفتح بالأقواس المربعة، والمفتاح الغائب يعطي null. dynamic تسمح بخلط نص ورقم في البطاقة نفسها.",
      rust: "استعملنا struct (يُعرَّف User في مكان آخر) لأنه أسلوب Rust المعتاد: الأدراج كلها تُعلن مسبقاً، فلا يمكن إضافة درج جديد. لذلك city معلنة من البداية فارغة (None)، وقراءة درج غير معلن خطأ قبل التشغيل.",
    },
    steps: [],
    trace: true,
  },
  playground: {
    kind: "trace",
    intro: "هذه قائمة منتجات: مصفوفة خاناتها مرقّمة، في كل خانة سهم إلى بطاقة لها أدراج بأسماء. هكذا تبدو البيانات الحقيقية. عدّل وشغّل، وراقب السهام على الكومة.",
    starter: `let products = [
  { name: "Pen", price: 3 },
  { name: "Book", price: 25 },
];
let total = 0;
for (const p of products) {
  total = total + p.price;
}
console.log("Total:", total);`,
    challenges: [
      "أضف منتجاً ثالثاً { name: \"Bag\", price: 40 } داخل القائمة. كم سيصبح المجموع؟ توقّع قبل أن تضغط.",
      "داخل الحلقة اطبع اسم المنتج فقط إذا كان سعره أكثر من 10.",
      "قبل الحلقة أضف السطر products[0].price = 5; أي بطاقة تغيّرت على الكومة؟",
      "أضف بعد الحلقة console.log(products[1].stock); ما الذي سيُطبع، ولماذا لا يتوقف البرنامج؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `let car = { brand: "Kia", year: 2020 };
console.log(car.color);`,
      options: ["undefined", "خطأ يوقف البرنامج", "نص فارغ"],
      answer: 0,
      why: "البطاقة ليس فيها درج اسمه color. قراءة درج غائب لا توقف JavaScript: تعطي undefined، أي «لا شيء هنا».",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `let box = { a: 1 };
box.b = 2;
console.log(box.a + box.b);`,
      options: ["3", "خطأ: b غير موجود", "12"],
      answer: 0,
      why: "الكتابة في درج غير موجود لا تفشل: تضيف درجاً جديداً اسمه b إلى البطاقة. ثم 1 + 2 = 3.",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `let user = { name: "Sara", age: 20 };
let key = "age";
console.log(user[key]);
console.log(user.key);`,
      options: ["20 ثم undefined", "20 ثم 20", "undefined ثم 20"],
      answer: 0,
      why: "داخل الأقواس المربعة يُحسب المتغيّر key أولاً فيصير \"age\". أما بعد النقطة فالاسم يؤخذ حرفياً: user.key تبحث عن درج اسمه key، وهو غير موجود.",
    },
  ],
  code: {
    intro: "المصفوفة تجيب عن سؤال «في أي خانة؟»، والكائن يجيب عن «بأي اسم؟». وقد يحمل درج في البطاقة دالة، فتستدعيها بالنقطة. في الدرس القادم: ماذا يحدث لو حمل متغيّران السهم نفسه إلى البطاقة نفسها؟",
    runnerStarter: `let shop = {
  name: "Corner",
  open: true,
  welcome: function (visitor) {
    return "Welcome, " + visitor + "!";
  },
};
console.log(shop.name, shop.open);
console.log(shop.welcome("Sara"));
// جرّب: أضف درجاً جديداً shop.city = "Abha" ثم اطبعه
`,
  },
  exercises: [
    {
      kind: "order",
      title: "سعر القلم",
      prompt: "رتّب الأسطر حتى يُضاعف السعر ثم يزيد 1، فيطبع Pen: 7.",
      lines: [
        'let item = { name: "Pen", price: 3 };',
        "item.price = item.price * 2;",
        "item.price = item.price + 1;",
        'console.log(item.name + ": " + item.price);',
      ],
      expected: "Pen: 7",
    },
    {
      kind: "fill",
      title: "افتح الدرج الصحيح",
      prompt: "أي كتابة تفتح درج العمر فيُطبع 20؟",
      template: 'let user = { name: "Sara", age: 20 };\nconsole.log(user___);',
      options: [".age", "[age]", ".Age"],
      expected: "20",
    },
    {
      kind: "fix",
      title: "الاسم في متغيّر",
      prompt: "نريد درجة الطالب الذي اسمه في المتغيّر who، لكن البرنامج يطبع undefined. أصلحه حتى يطبع 75.",
      code: 'let scores = { sara: 90, ali: 75 };\nlet who = "ali";\nconsole.log(scores.who);',
      expected: "75",
      hint: "بعد النقطة يؤخذ الاسم حرفياً: scores.who تبحث عن درج اسمه who. ما الكتابة التي تحسب المتغيّر أولاً؟",
      solution: 'let scores = { sara: 90, ali: 75 };\nlet who = "ali";\nconsole.log(scores[who]);',
    },
    {
      kind: "write",
      title: "المنتجات الغالية",
      prompt: "عندك قائمة منتجات. مرّ عليها بحلقة واطبع اسم كل منتج سعره أكثر من 10، كل اسم في سطر.",
      starter: `let products = [
  { name: "Pen", price: 3 },
  { name: "Book", price: 25 },
  { name: "Bag", price: 40 },
];
// اكتب الحلقة هنا
`,
      expected: "Book\nBag",
      hint: "for (const p of products) يعطيك بطاقة في كل دورة. افحص p.price ثم اطبع p.name.",
      solution: `let products = [
  { name: "Pen", price: 3 },
  { name: "Book", price: 25 },
  { name: "Bag", price: 40 },
];
for (const p of products) {
  if (p.price > 10) console.log(p.name);
}`,
    },
  ],
  quiz: [
    { question: "ماذا يُطبع؟", code: "let p = { x: 1 };\np.x = 5;\np.y = 2;\nconsole.log(p.x + p.y);", options: ["7", "3", "خطأ: y غير موجود"], answer: 0, why: "p.x = 5 يكتب فوق درج x القديم، و p.y = 2 يضيف درجاً جديداً. 5 + 2 = 7." },
    { question: "ماذا يُطبع؟", code: 'let car = { brand: "Kia" };\nconsole.log(car.speed + 1);', options: ["NaN", "1", "خطأ يوقف البرنامج"], answer: 0, why: "لا يوجد درج speed، فقراءته تعطي undefined. و undefined + 1 ليس رقماً: NaN." },
    { question: "ماذا يُطبع؟", code: 'let list = [{ n: "A" }, { n: "B" }];\nconsole.log(list[1].n);', options: ["B", "A", "undefined"], answer: 0, why: "list[1] تتبع السهم في الخانة رقم 1 (الثانية) إلى بطاقتها، ثم .n تفتح درج n فيها: \"B\"." },
    { question: "ماذا يُطبع؟", code: "let calc = {\n  double: function (x) {\n    return x * 2;\n  },\n};\nconsole.log(calc.double(4));", options: ["8", "4", "undefined"], answer: 0, why: "درج double يحمل دالة. calc.double يفتح الدرج، والقوسان (4) يستدعيان الدالة التي فيه: 4 * 2 = 8." },
    { question: "ماذا يُطبع؟", code: 'let u = { name: "Sara" };\nu["name"] = "Huda";\nconsole.log(u.name);', options: ["Huda", "Sara", "Sara Huda"], answer: 0, why: "u[\"name\"] و u.name طريقتان لفتح الدرج نفسه. الكتابة بالأقواس غيّرت محتواه، فالقراءة بالنقطة تجد Huda." },
  ],
  next: "references",
};
