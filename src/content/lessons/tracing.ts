import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

export const tracing: Lesson = {
  slug: "tracing",
  stage: 2,
  number: "2.2",
  title: "التتبّع اليدوي",
  subtitle: "كن أنت الجهاز: عمود لكل متغير، وصف لكل سطر يُنفَّذ",
  minutes: 15,
  problem: {
    title: "ماذا سيطبع؟ لا تشغّله",
    body: "حلقة قصيرة وجدول فارغ. نفّذها أنت سطراً سطراً واكتب ما يتغيّر في كل صف. كل خانة تُقارَن بالتشغيل الحقيقي.",
    demo: "tracing",
  },
  scene: {
    code: {
      js: `let total = 0;
let i = 1;
while (i <= 2) {
  total = total + i;
  i = i + 1;
}
console.log(total);`,
      ts: `let total: number = 0;
let i: number = 1;
while (i <= 2) {
  total = total + i;
  i = i + 1;
}
console.log(total);`,
      py: `total = 0
i = 1
while i <= 2:
    total = total + i
    i = i + 1

print(total)`,
      go: `total := 0
i := 1
for i <= 2 {
	total = total + i
	i = i + 1
}
fmt.Println(total)`,
      dart: `int total = 0;
int i = 1;
while (i <= 2) {
  total = total + i;
  i = i + 1;
}
print(total);`,
      rust: `let mut total = 0;
let mut i = 1;
while i <= 2 {
    total = total + i;
    i = i + 1;
}
println!("{}", total);`,
    },
    notes: {
      js: "الجدول لا يهتم باللغة: عمود لكل متغير، وصف لكل سطر يُنفَّذ. السطر 3 يظهر في الجدول كلما فُحص الشرط، لا مرة واحدة.",
      ts: "الأنواع لا تضيف صفوفاً للجدول: تُفحص قبل التشغيل، والتنفيذ نفسه مثل JavaScript تماماً.",
      py: "بايثون تحدد جسم الحلقة بالمسافة البادئة، لذلك السطر 6 فارغ. تتبّعها بالجدول نفسه بلا أي فرق.",
      go: "Go ليس فيها while: تكتب for مع شرط فقط، ويعمل مثل while تماماً في الجدول.",
      dart: "مثل JavaScript سطراً بسطر، مع نوع int قبل كل متغير.",
      rust: "في Rust يجب mut لأن total و i يتغيّران. لو نسيتها لرفض المترجم البرنامج قبل أن يبدأ الجدول.",
    },
    steps: [
      { line: null, say: "خذ ورقة وارسم جدولاً: عمود لكل متغير (total و i)، وصف لكل سطر يُنفَّذ. من الآن أنت الجهاز.", memory: [] },
      { line: 1, say: "الصف 1: السطر 1 يكتب 0 تحت total. خانة i ما زالت فارغة لأن الدرج لم يُنشأ بعد.", memory: [n("total", 0)], changed: ["total"] },
      { line: 2, say: "الصف 2: السطر 2 يكتب 1 تحت i. total لم يتغيّر، فتنقل قيمته 0 كما هي.", memory: [n("total", 0), n("i", 1)], changed: ["i"] },
      { line: 3, say: "الصف 3: الشرط i <= 2 يقرأ i من الصف السابق: 1 <= 2 صحيح (true)، فيدخل التنفيذ إلى السطر 4.", memory: [n("total", 0), n("i", 1)], read: ["i"] },
      { line: 4, say: "الصف 4: اقرأ total و i من الصف الذي فوقك: 0 + 1 = 1. اكتب 1 تحت total.", memory: [n("total", 1), n("i", 1)], changed: ["total"], read: ["total", "i"] },
      { line: 5, say: "الصف 5: i يصبح 1 + 1 = 2. الحلقة انتهت من جسمها، فيعود التنفيذ إلى الشرط.", memory: [n("total", 1), n("i", 2)], changed: ["i"], read: ["i"] },
      { line: 3, say: "الصف 6: السطر 3 مرة ثانية، بقيم جديدة: 2 <= 2 صحيح (true)، فيدخل مرة أخرى.", memory: [n("total", 1), n("i", 2)], read: ["i"] },
      { line: 4, say: "الصف 7: 1 + 2 = 3 تحت total. لاحظ أنك لا تحفظ شيئاً في رأسك: كل ما تحتاجه في الصف السابق.", memory: [n("total", 3), n("i", 2)], changed: ["total"], read: ["total", "i"] },
      { line: 5, say: "الصف 8: i يصبح 3، ويعود التنفيذ إلى الشرط.", memory: [n("total", 3), n("i", 3)], changed: ["i"], read: ["i"] },
      { line: 3, say: "الصف 9: 3 <= 2 خطأ (false). يقفز التنفيذ فوق جسم الحلقة إلى السطر 7.", memory: [n("total", 3), n("i", 3)], read: ["i"] },
      { line: 7, say: "الصف 10: الطباعة تقرأ آخر قيمة لـ total في الجدول: 3. عرفت الناتج قبل التشغيل، وهذه الأنميشن هي جدولك نفسه يتحرّك.", memory: [n("total", 3), n("i", 3)], read: ["total"], output: ["3"] },
    ],
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "هذه بايثون. قبل أن تضغط، ارسم الجدول على ورقة: عمودان n و fact، وصف لكل سطر. ثم شغّل وقارن صفّك بكل خطوة. أول صف يختلف هو المكان الذي أخطأت فيه.",
    starter: `n = 4
fact = 1
while n > 1:
    fact = fact * n
    n = n - 1
print(fact)`,
    challenges: [
      "غيّر 4 إلى 5. كم صفاً سيُضاف إلى جدولك، وما الناتج؟ توقّع قبل أن تضغط.",
      "كم مرة يظهر السطر 3 (الشرط) في الجدول عندما n = 4؟ عُدّها على ورقتك ثم تحقّق.",
      "بدّل السطرين داخل الحلقة (n = n - 1 أولاً). تتبّع الجدول بيدك: ما الناتج الجديد؟",
      "غيّر n > 1 إلى n > 0. هل يتغيّر الناتج؟ الجدول يجيب: انظر إلى الصف الإضافي.",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `let i = 0;
while (i < 3) {
  console.log(i);
  i = i + 1;
}`,
      options: ["0 ثم 1 ثم 2", "1 ثم 2 ثم 3", "0 ثم 1 ثم 2 ثم 3"],
      answer: 0,
      why: "في كل صف للسطر 3 اقرأ i قبل أن يزيد: 0 ثم 1 ثم 2. حين يصير i = 3 يفشل الشرط فلا تُطبع. من يجيب من رأسه يخطئ هنا كثيراً، ومن يملأ الجدول لا يخطئ.",
    },
    {
      question: "هذه بايثون. ماذا تطبع؟",
      lang: "py",
      code: `a = 5
b = 8
a = b
b = a
print(a, b)`,
      options: ["8 5", "8 8", "5 8"],
      answer: 1,
      why: "صف السطر 3: a يصبح 8، والقيمة 5 مُحيت. صف السطر 4 يقرأ a من الصف السابق فيجده 8. الجدول يُظهر أين ضاعت 5، والرأس يظنّ أن القيمتين تبادلتا.",
    },
    {
      question: "كود كتبه غيرك، بلا تعليقات. ماذا يطبع؟",
      code: `let n = 1234;
let s = 0;
while (n > 0) {
  s = s + (n % 10);
  n = Math.floor(n / 10);
}
console.log(s);`,
      options: ["10", "1234", "4"],
      answer: 0,
      why: "تتبّع الأعمدة n و s: n يفقد آخر رقم في كل دورة (1234، 123، 12، 1، 0)، و s يضيف ذلك الرقم (4، 7، 9، 10). الجدول كشف ما يفعله الكود: يجمع أرقام العدد.",
    },
  ],
  code: {
    intro: "حين يطول الجدول، اجعل البرنامج يكتب صفوفه بنفسه: سطر طباعة داخل الحلقة يطبع كل الأعمدة. هذا هو التتبّع نفسه، والجهاز يملأ الجدول بدلاً منك. عدّل الكود بالأسفل وشغّله.",
    runnerStarter: `let total = 0;
let i = 1;
while (i <= 4) {
  total = total + i;
  console.log("i =", i, "total =", total);
  i = i + 1;
}
console.log("final:", total);
// جرّب: غيّر total = total + i إلى total = total * i واحذر: ما قيمة total الأولى التي يجب أن تبدأ بها؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "العدّ التنازلي",
      lang: "py",
      prompt: "بايثون: رتّب الأسطر حتى يطبع البرنامج 3 ثم 2 ثم 1. تتبّع الجدول لترى أي ترتيب داخل الحلقة صحيح.",
      lines: ["n = 3", "while n > 0:", "    print(n)", "    n = n - 1"],
      expected: "3\n2\n1",
    },
    {
      kind: "fill",
      title: "من الجدول إلى السطر",
      prompt: "جدول التتبّع للحلقة يُظهر total = 1 ثم 3 ثم 6. أي سطر يصنع هذا الجدول فيطبع 6؟",
      template: "let total = 0;\nlet i = 1;\nwhile (i <= 3) {\n  ___;\n  i = i + 1;\n}\nconsole.log(total);",
      options: ["total = total + i", "total = i", "total = total + 1"],
      expected: "6",
    },
    {
      kind: "fix",
      title: "العدّاد الذي ينسى",
      lang: "py",
      prompt: "بايثون: البرنامج يجب أن يعدّ الأرقام الزوجية فيطبع 2، لكنه يطبع 0. تتبّع عمود count لتجد السبب، ثم أصلحه.",
      code: "nums = [2, 5, 8, 11]\nfor x in nums:\n    count = 0\n    if x % 2 == 0:\n        count = count + 1\nprint(count)",
      expected: "2",
      hint: "في جدولك، ماذا يحدث لعمود count في أول صف من كل دورة؟ هل يجب أن يحدث ذلك مرة واحدة أم في كل دورة؟",
      solution: `nums = [2, 5, 8, 11]
count = 0
for x in nums:
    if x % 2 == 0:
        count = count + 1
print(count)`,
    },
    {
      kind: "write",
      title: "اكتب ما يصنع الجدول",
      prompt: "هذا جدول تتبّع: x = 1، ثم x = 2، ثم 4، ثم 8، ثم 16 وتتوقف الحلقة. اكتب برنامجاً يبدأ x من 1 ويضاعفه ما دام أقل من 16، ويطبع x بعد كل مضاعفة: 2 ثم 4 ثم 8 ثم 16.",
      starter: "// x starts at 1, doubles while it is below 16, printing after each doubling\n",
      expected: "2\n4\n8\n16",
      hint: "let x = 1;  ثم while (x < 16) { x = x * 2; console.log(x); }",
      solution: `let x = 1;
while (x < 16) {
  x = x * 2;
  console.log(x);
}`,
    },
  ],
  quiz: [
    {
      question: "كم صفاً يأخذ السطر 2 (الشرط) في جدول التتبّع؟",
      code: "let i = 0;\nwhile (i < 3) {\n  i = i + 1;\n}",
      options: ["3", "4", "2"],
      answer: 1,
      why: "الشرط يُفحص عند i = 0 و 1 و 2 (صحيح) ثم عند i = 3 (خطأ). الفحص الأخير الفاشل صف أيضاً: هو الذي يخرج من الحلقة.",
    },
    {
      question: "ماذا يطبع؟",
      code: "let a = 2;\nlet b = a * 3;\na = b - a;\nconsole.log(a, b);",
      options: ["4 6", "2 6", "4 4"],
      answer: 0,
      why: "صف 1: a = 2. صف 2: b = 2 × 3 = 6. صف 3 يقرأ القيم من الصف السابق: 6 - 2 = 4 تحت a. وb لم يتغيّر.",
    },
    {
      question: "ماذا يطبع؟",
      code: "let i = 10;\nwhile (i > 1) {\n  i = Math.floor(i / 2);\n}\nconsole.log(i);",
      options: ["1", "0", "2"],
      answer: 0,
      why: "عمود i: 10، 5، 2، 1. عند 1 يفشل الشرط 1 > 1، فلا تحدث قسمة أخرى، ويُطبع 1.",
    },
    {
      question: "ماذا يطبع؟",
      code: "let nums = [1, 3, 5];\nlet c = 0;\nfor (let x of nums) {\n  if (x > 2) {\n    c = c + x;\n  }\n}\nconsole.log(c);",
      options: ["8", "9", "2"],
      answer: 0,
      why: "جدول بعمودين x و c: عند x = 1 يفشل الشرط ولا يتغيّر c. عند 3 يصبح c = 3، وعند 5 يصبح 8. الجدول يمنعك من جمع 1 خطأً أو من العدّ بدل الجمع.",
    },
    {
      question: "المقصود طباعة أكبر رقم. ماذا يطبع فعلاً؟",
      code: "let nums = [4, 9, 2];\nlet best = 0;\nfor (let x of nums) {\n  if (x < best) {\n    best = x;\n  }\n}\nconsole.log(best);",
      options: ["0، لأن الشرط في السطر 4 مقلوب", "9", "2، لأنه آخر رقم"],
      answer: 0,
      why: "تتبّع عمود best: يبدأ 0، و 4 < 0 خطأ، و 9 < 0 خطأ، و 2 < 0 خطأ. لم يُكتب فيه شيء أبداً. الجدول يدلّك على السطر المسؤول: الشرط يجب أن يكون x > best.",
    },
  ],
  next: "debugging",
};
