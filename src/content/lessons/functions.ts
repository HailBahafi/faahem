import type { Lesson } from "@/lib/types";

export const functions: Lesson = {
  slug: "functions",
  stage: 1,
  number: "1.8",
  title: "الدوال ومكدّس الاستدعاء",
  subtitle: "وصفة تُكتب مرة، وكل استدعاء يفتح لها طاولة جديدة",
  minutes: 18,
  problem: {
    title: "ثلاثة أكواب، ثلاث نسخ",
    body: "تريد ثلاثة أكواب شاي. في الطريقة الأولى تنسخ التعليمات لكل كوب. جرّبها، ثم جرّب وصفة واحدة لها اسم.",
    demo: "functions",
  },
  scene: {
    trace: true,
    steps: [],
    code: {
      js: `function twice(n) {
  return n * 2;
}
function addThenTwice(a, b) {
  let total = a + b;
  return twice(total);
}
let result = addThenTwice(3, 4);
console.log(result);`,
      ts: `function twice(n: number): number {
  return n * 2;
}
function addThenTwice(a: number, b: number): number {
  let total: number = a + b;
  return twice(total);
}
let result: number = addThenTwice(3, 4);
console.log(result);`,
      py: `def twice(n):
    return n * 2

def add_then_twice(a, b):
    total = a + b
    return twice(total)

result = add_then_twice(3, 4)
print(result)`,
      go: `func twice(n int) int {
	return n * 2
}
func addThenTwice(a int, b int) int {
	total := a + b
	return twice(total)
}
result := addThenTwice(3, 4)
fmt.Println(result)`,
      dart: `int twice(int n) {
  return n * 2;
}
int addThenTwice(int a, int b) {
  int total = a + b;
  return twice(total);
}
int result = addThenTwice(3, 4);
print(result);`,
      rust: `fn twice(n: i32) -> i32 {
    return n * 2;
}
fn add_then_twice(a: i32, b: i32) -> i32 {
    let total = a + b;
    return twice(total);
}
let result = add_then_twice(3, 4);
println!("{}", result);`,
    },
    notes: {
      js: "function تكتب الوصفة وتعطيها اسماً، ولا تشغّلها. الأقواس بعد الاسم عند الاستدعاء twice(7) هي التي تشغّلها.",
      ts: "مثل JavaScript، مع نوع لكل معامل ونوع لما يرجع بعد القوسين: ‎): number يعني أن الدالة تعيد رقماً.",
      py: "def بدل function، والجسم بالمسافة البادئة بلا أقواس، لذلك السطران 3 و 7 فارغان. وتُكتب الأسماء بشرطة سفلية: add_then_twice.",
      go: "func بدل function، والنوع يأتي بعد اسم المعامل (n int)، ونوع ما يرجع بعد القوس. (في برنامج Go حقيقي يكون السطران الأخيران داخل func main.)",
      dart: "نوع ما ترجعه الدالة يُكتب قبل اسمها (int twice)، ونوع كل معامل قبل اسمه.",
      rust: "fn بدل function، و -> i32 نوع ما يرجع. في Rust يكثر حذف return: آخر تعبير بلا فاصلة منقوطة هو ما يرجع، مثل n * 2.",
    },
  },
  playground: {
    kind: "trace",
    intro: "وصفة شاي واحدة تُستدعى ثلاث مرات. شغّل وراقب المكدّس: كل استدعاء يضع إطاراً جديداً فوق، وفيه درج sugar خاص به، ثم يختفي الإطار عند النهاية.",
    starter: `function makeTea(sugar) {
  console.log("tea with " + sugar + " sugar");
}
makeTea(1);
makeTea(2);
makeTea(0);`,
    challenges: [
      "أضف استدعاءً رابعاً makeTea(3). كم إطاراً ستراه على المكدّس في أعلى لحظة؟ توقّع قبل أن تضغط.",
      "أضف معاملاً ثانياً milk واطبعه أيضاً، ثم مرّر قيمتين في كل استدعاء: makeTea(1, \"yes\")",
      "احذف أحد الاستدعاءات واترك الوصفة. هل يُطبع شيء من داخلها بلا استدعاء؟",
      "اجعل الدالة ترجع النص بـ return بدل طباعته، ثم اطبع: console.log(makeTea(2)). ماذا يحدث لو نسيت console.log؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `function add(a, b) {
  let s = a + b;
}
console.log(add(2, 3));`,
      options: ["5", "undefined", "خطأ"],
      answer: 1,
      why: "الدالة حسبت 5 ووضعتها في درج s داخل إطارها، لكنها لم تُرجع شيئاً بـ return. أُزيل الإطار ومعه s، فرجعت undefined.",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `function bump(x) {
  x = x + 1;
  return x;
}
let n = 5;
bump(n);
console.log(n);`,
      options: ["5", "6", "undefined"],
      answer: 0,
      why: "المعامل x درج جديد في إطار bump، وصلته نسخة من 5. تغيير x لا يمسّ n. والقيمة 6 التي رجعت لم توضع في أي درج، فضاعت.",
    },
    {
      question: "ما الذي يُطبع، وبأي ترتيب؟",
      code: `function greet() {
  console.log("A");
  return "B";
  console.log("C");
}
console.log(greet());`,
      options: ["A ثم B", "A ثم C ثم B", "B ثم A"],
      answer: 0,
      why: "السطر الأخير ينتظر حتى تنتهي greet. داخلها يُطبع A، ثم return تسلّم B وتزيل الإطار فوراً، فلا يصل التنفيذ إلى C أبداً. ثم يُطبع B.",
    },
  ],
  code: {
    intro: "الفكرة نفسها في كل اللغات: تعريف له اسم ومعاملات، واستدعاء يمرّر قيماً، و return تعيد قيمة واحدة. تختلف الكلمة (function، def، func، fn) ومكان كتابة الأنواع. بدّل اللغة فوق، ثم عدّل الكود بالأسفل وشغّله.",
    runnerStarter: `function area(width, height) {
  return width * height;
}
let room = area(4, 5);
let garden = area(10, 3);
console.log(room, garden, room + garden);
// جرّب: اكتب دالة perimeter(width, height) ترجع 2 * (width + height) واطبعها لنفس الغرفة
`,
  },
  exercises: [
    {
      kind: "order",
      title: "المربّع",
      prompt: "رتّب الأسطر حتى يعرّف البرنامج دالة square ثم يستدعيها ويطبع 16.",
      lines: ["function square(n) {", "  return n * n;", "}", "let r = square(4);", "console.log(r);"],
      expected: "16",
    },
    {
      kind: "fill",
      title: "النصف",
      prompt: "أي سطر داخل الدالة يجعل البرنامج يطبع 5 فقط؟",
      template: "function half(n) {\n  ___;\n}\nconsole.log(half(10));",
      options: ["return n / 2", "console.log(n / 2)", "n / 2"],
      expected: "5",
    },
    {
      kind: "fix",
      title: "المجموع الضائع",
      prompt: "هذا البرنامج يطبع undefined بدل 5. أصلحه.",
      code: "function add(a, b) {\n  let s = a + b;\n}\nconsole.log(add(2, 3));",
      expected: "5",
      hint: "الدرج s يختفي مع إطار الدالة. ما الكلمة التي تسلّم قيمته للسطر الذي استدعاها؟",
      solution: `function add(a, b) {
  let s = a + b;
  return s;
}
console.log(add(2, 3));`,
    },
    {
      kind: "write",
      title: "التحية",
      prompt: "اكتب دالة greet(name) ترجع النص \"Hi \" + name، ثم استدعها مرتين واطبع النتيجة: Hi Sara ثم Hi Omar.",
      starter: "// اكتب الدالة هنا، ثم استدعها مرتين\n",
      expected: "Hi Sara\nHi Omar",
      hint: "داخل الدالة: return \"Hi \" + name;  ثم console.log(greet(\"Sara\"));",
      solution: `function greet(name) {
  return "Hi " + name;
}
console.log(greet("Sara"));
console.log(greet("Omar"));`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع، وبأي ترتيب؟",
      code: 'function hello() {\n  console.log("hi");\n}\nconsole.log("start");\nhello();\nhello();',
      options: ["start ثم hi ثم hi", "hi ثم start ثم hi", "start ثم hi"],
      answer: 0,
      why: "التعريف يحفظ الوصفة باسمها فقط ولا يشغّلها. أول ما يُطبع start، ثم كل استدعاء يفتح إطاراً ويطبع hi.",
    },
    {
      question: "ماذا يُطبع؟",
      code: "function minus(a, b) {\n  return a - b;\n}\nlet b = 10;\nlet a = 3;\nconsole.log(minus(b, a));",
      options: ["7", "-7", "خطأ"],
      answer: 0,
      why: "القيم تُنسخ إلى المعاملات بالترتيب لا بالاسم: أول قيمة (10) تذهب إلى a في الإطار الجديد، والثانية (3) إلى b. فالنتيجة 10 - 3 = 7.",
    },
    {
      question: "في أعمق لحظة، كم إطاراً على المكدّس (مع الإطار العام)؟",
      code: "function c() {\n  return 1;\n}\nfunction b() {\n  return c() + 1;\n}\nfunction a() {\n  return b() + 1;\n}\nconsole.log(a());",
      options: ["3", "4", "2"],
      answer: 1,
      why: "الإطار العام ينتظر a، و a تنتظر b، و b تنتظر c. وهي داخل c تكون الإطارات أربعة فوق بعضها، ثم تُزال من الأعلى واحداً واحداً.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'function check(n) {\n  if (n > 0) {\n    return "positive";\n  }\n  return "not positive";\n}\nconsole.log(check(5));',
      options: ["positive", "positive ثم not positive", "not positive"],
      answer: 0,
      why: "return تسلّم قيمتها وتزيل الإطار في الحال. بعد أول return لا يعمل أي سطر آخر داخل الدالة.",
    },
    {
      question: "ماذا يحدث في السطر الأخير؟",
      code: "function f() {\n  let secret = 42;\n  return 1;\n}\nf();\nconsole.log(secret);",
      options: ["يطبع 42", "يطبع 1", "خطأ: secret غير موجود"],
      answer: 2,
      why: "درج secret كان في إطار f، والإطار أُزيل كله عند return. الإطار العام لم يكن فيه secret أصلاً.",
    },
  ],
  next: "scope",
};
