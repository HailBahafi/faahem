import type { Lesson } from "@/lib/types";

export const scope: Lesson = {
  slug: "scope",
  stage: 1,
  number: "1.9",
  title: "النطاق",
  subtitle: "أي الأدراج يستطيع هذا السطر أن يراها؟",
  minutes: 15,
  problem: {
    title: "غرف بنوافذ في اتجاه واحد",
    body: "البرنامج بيت: الصالة فيها أدراج، وداخلها غرفة، وداخل الغرفة خزانة. من الداخل ترى الخارج، ومن الخارج لا ترى الداخل. اضغط على أي سطر وانظر أي الأدراج تضيء له.",
    demo: "scope",
  },
  scene: {
    code: {
      js: `let count = 10;
function add() {
  let count = 1;
  count = count + 1;
  return count;
}
let result = add();
console.log(result, count);`,
      ts: `let count: number = 10;
function add(): number {
  let count: number = 1;
  count = count + 1;
  return count;
}
let result: number = add();
console.log(result, count);`,
      py: `count = 10
def add():
    count = 1
    count = count + 1
    return count

result = add()
print(result, count)`,
      go: `count := 10
add := func() int {
	count := 1
	count = count + 1
	return count
}
result := add()
fmt.Println(result, count)`,
      dart: `int count = 10;
int add() {
  int count = 1;
  count = count + 1;
  return count;
}
int result = add();
print('$result $count');`,
      rust: `let count = 10;
fn add() -> i32 {
    let mut count = 1;
    count = count + 1;
    return count;
}
let result = add();
println!("{} {}", result, count);`,
    },
    notes: {
      js: "let داخل الدالة يصنع درجاً جديداً في إطارها، حتى لو كان الاسم نفسه موجوداً في الخارج. بدون let يكتب السطر في درج الخارج.",
      ts: "مثل JavaScript تماماً: النطاق لا علاقة له بالأنواع.",
      py: "في بايثون أي إسناد داخل الدالة يصنع درجاً محلياً. لتكتب في درج الصالة تحتاج أن تقول global count صراحة. والكتلة if أو for لا تصنع نطاقاً في بايثون، الدالة فقط تفعل.",
      go: ":= داخل الدالة يصنع درجاً جديداً يحجب الخارجي، أما = وحدها فتكتب في درج الخارج. فرق حرف واحد يغيّر المعنى.",
      dart: "مثل JavaScript: كتابة النوع int قبل الاسم تصنع درجاً جديداً في النطاق الحالي.",
      rust: "دالة fn في Rust لا ترى متغيرات let الخارجية أبداً، فـ count في الداخل لا يمكن أن يلمس الخارجي. (الدوال التي ترى الخارج اسمها closures، وستأتي لاحقاً.)",
    },
    steps: [],
    trace: true,
  },
  playground: {
    kind: "trace",
    intro: "total في الصالة، و bonus في غرفة الدالة. شغّل وراقب: الدالة تكتب في درج الصالة لأنها تراه، ودرج bonus يختفي كلما انتهت الدالة.",
    starter: `let total = 0;
function addPoints(points) {
  let bonus = 5;
  total = total + points + bonus;
}
addPoints(10);
addPoints(20);
console.log(total);`,
    challenges: [
      "أضف console.log(bonus); في آخر البرنامج. توقّع: هل سيطبع 5 أم خطأ؟",
      "غيّر سطر الجمع داخل الدالة إلى: let total = points + bonus;  كم يطبع السطر الأخير الآن، ولماذا؟",
      "انقل let bonus = 5; إلى الصالة فوق الدالة. هل ما زالت الدالة تراه؟",
      "أضف let points = 100; في الصالة. هل يتغيّر شيء؟ أي points تقرأ الدالة؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `let city = "Riyadh";
function show() {
  console.log(city);
}
show();`,
      options: ["Riyadh", "خطأ: city غير موجود", "undefined"],
      answer: 0,
      why: "الدالة لا تجد city في إطارها، فتنظر للخارج: إلى الصالة. من الداخل ترى الخارج دائماً.",
    },
    {
      question: "ماذا يحدث في السطر الأخير؟",
      code: `function make() {
  let secret = 42;
}
make();
console.log(secret);`,
      options: ["يطبع 42", "يطبع undefined", "خطأ: secret غير موجود"],
      answer: 2,
      why: "درج secret كان في إطار make. حين انتهت الدالة اختفى إطارها بكل أدراجه، والصالة لم تكن تراه أصلاً.",
    },
    {
      question: "ماذا يُطبع؟",
      code: `let x = 1;
if (true) {
  let x = 2;
  console.log(x);
}
console.log(x);`,
      options: ["2 ثم 1", "2 ثم 2", "1 ثم 1"],
      answer: 0,
      why: "let داخل الكتلة يصنع درج x جديداً يحجب الخارجي. الداخل يقرأ أقرب درج: 2. بعد القوس يختفي، فيعود x الخارجي: 1.",
    },
  ],
  code: {
    intro: "الصورة واحدة في كل اللغات: كل دالة لها أدراجها، والسطر يبحث في درجه أولاً ثم يخرج للخارج. الفرق في التفاصيل: بايثون تحتاج global لتكتب في الصالة، و Rust لا تسمح للدالة بالنظر للخارج أصلاً. بدّل اللغة فوق، ثم جرّب بالأسفل.",
    runnerStarter: `function countApples() {
  let count = 3;
  return count;
}
function countOranges() {
  let count = 7;
  return count;
}
console.log(countApples(), countOranges());
// جرّب: أضف let count = 100; في أول البرنامج واطبعه في آخره. هل غيّرته الدالتان؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "عدّاد في الصالة",
      prompt: "رتّب الأسطر حتى تضيف الدالة إلى درج الصالة total مرتين، ويطبع البرنامج 10.",
      lines: ["let total = 0;", "function add(n) {", "  total = total + n;", "}", "add(4);", "add(6);", "console.log(total);"],
      expected: "10",
    },
    {
      kind: "fill",
      title: "صفّر النتيجة",
      prompt: "أي اختيار يجعل الدالة تكتب في درج score الخارجي فيطبع البرنامج 0؟",
      template: "let score = 5;\nfunction reset() {\n  ___ = 0;\n}\nreset();\nconsole.log(score);",
      options: ["let score", "score", "const score"],
      expected: "0",
    },
    {
      kind: "fix",
      title: "النتيجة الضائعة",
      prompt: "هذا البرنامج يتوقف بخطأ. أصلحه حتى يطبع 8.",
      code: "function double(n) {\n  let result = n * 2;\n}\ndouble(4);\nconsole.log(result);",
      expected: "8",
      hint: "درج result يختفي مع إطار الدالة. أخرج القيمة بـ return، واحفظها في درج في الصالة.",
      solution: `function double(n) {
  let result = n * 2;
  return result;
}
let result = double(4);
console.log(result);`,
    },
    {
      kind: "write",
      title: "اسمان لا يتصادمان",
      prompt: "في الصالة let name = \"Sara\". اكتب دالة greet فيها درج محلي name قيمته \"Omar\" تطبعه، ثم استدعها، ثم اطبع name من الصالة. الناتج: Omar ثم Sara.",
      starter: 'let name = "Sara";\n// اكتب الدالة greet هنا، ثم استدعها، ثم اطبع name\n',
      expected: "Omar\nSara",
      hint: "داخل الدالة: let name = \"Omar\"; ثم console.log(name);  وبعدها greet(); ثم console.log(name);",
      solution: `let name = "Sara";
function greet() {
  let name = "Omar";
  console.log(name);
}
greet();
console.log(name);`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع؟",
      code: "let count = 0;\nfunction tick() {\n  count = count + 1;\n}\ntick();\ntick();\nconsole.log(count);",
      options: ["0", "2", "خطأ"],
      answer: 1,
      why: "لا يوجد let داخل tick، فالسطر يبحث عن count فيجده في الصالة ويكتب فيه. كل استدعاء يغيّر الدرج نفسه.",
    },
    {
      question: "والآن مع let داخل الدالة، ماذا يُطبع؟",
      code: "let count = 0;\nfunction tick() {\n  let count = 0;\n  count = count + 1;\n}\ntick();\ntick();\nconsole.log(count);",
      options: ["2", "1", "0"],
      answer: 2,
      why: "let صنع درج count جديداً في إطار tick يحجب درج الصالة. الزيادة تحدث فيه، ثم يختفي مع الإطار. درج الصالة بقي 0.",
    },
    {
      question: "ماذا يحدث في السطر الأخير؟",
      code: 'if (true) {\n  let msg = "hi";\n}\nconsole.log(msg);',
      options: ["يطبع hi", "خطأ: msg غير موجود", "يطبع undefined"],
      answer: 1,
      why: "درج msg عاش داخل كتلة if فقط واختفى عند قوس الإغلاق. السطر الأخير في الخارج، ولا يرى الداخل.",
    },
    {
      question: "ماذا يُطبع؟",
      code: "let n = 5;\nfunction grow(n) {\n  n = n + 1;\n  return n;\n}\nconsole.log(grow(n), n);",
      options: ["6 6", "6 5", "5 5"],
      answer: 1,
      why: "المعامل n درج في إطار grow، نُسخت إليه القيمة 5. الزيادة غيّرت درج الإطار فقط، ودرج n في الصالة بقي 5.",
    },
    {
      question: "ماذا يُطبع؟",
      code: "let a = 1;\nfunction outer() {\n  let b = 2;\n  function inner() {\n    return a + b;\n  }\n  return inner();\n}\nconsole.log(outer());",
      options: ["3", "خطأ: b غير موجود", "1"],
      answer: 0,
      why: "inner يبحث في درجه فلا يجد a ولا b، فيخرج إلى outer فيجد b، ثم إلى الصالة فيجد a. النظر يمرّ عبر السلسلة كلها نحو الخارج.",
    },
  ],
  next: "arrays",
};
