import type { Lesson } from "@/lib/types";

export const arrayDs: Lesson = {
  slug: "array-ds",
  stage: 3,
  number: "3.1",
  title: "المصفوفة في الذاكرة",
  subtitle: "خانات متجاورة: القفز إلى أي خانة فوري، والإدراج في الأول مكلف",
  minutes: 15,
  problem: {
    title: "في الأول أم في الآخر؟",
    body: "هذا صفّ خانات متجاورة في الذاكرة. أضف رقماً في أول الصف، ثم في آخره، وراقب عدّاد الحركات.",
    demo: "arrayDs",
  },
  scene: {
    code: {
      js: `let cells = [10, 20, 30, 40];
console.log(cells[2]);
cells.push(0);
for (let i = cells.length - 1; i > 0; i--) {
  cells[i] = cells[i - 1];
}
cells[0] = 5;
console.log(cells);`,
      ts: `let cells: number[] = [10, 20, 30, 40];
console.log(cells[2]);
cells.push(0);
for (let i = cells.length - 1; i > 0; i--) {
  cells[i] = cells[i - 1];
}
cells[0] = 5;
console.log(cells);`,
      py: `cells = [10, 20, 30, 40]
print(cells[2])
cells.append(0)
for i in range(len(cells) - 1, 0, -1):
    cells[i] = cells[i - 1]

cells[0] = 5
print(cells)`,
      go: `cells := []int{10, 20, 30, 40}
fmt.Println(cells[2])
cells = append(cells, 0)
for i := len(cells) - 1; i > 0; i-- {
	cells[i] = cells[i-1]
}
cells[0] = 5
fmt.Println(cells)`,
      dart: `var cells = [10, 20, 30, 40];
print(cells[2]);
cells.add(0);
for (var i = cells.length - 1; i > 0; i--) {
  cells[i] = cells[i - 1];
}
cells[0] = 5;
print(cells);`,
      rust: `let mut cells = vec![10, 20, 30, 40];
println!("{}", cells[2]);
cells.push(0);
for i in (1..cells.len()).rev() {
    cells[i] = cells[i - 1];
}
cells[0] = 5;
println!("{:?}", cells);`,
    },
    notes: {
      js: "المصفوفة في JavaScript تحاول أن تكون خانات متجاورة، و unshift(5) تقوم بهذه الإزاحة نيابة عنك: سطر واحد في الكود، لكن كل الخانات تتحرك خلفه.",
      ts: "مثل JavaScript تماماً: number[] يقول ما في الخانات، ولا يغيّر طريقة رصّها في الذاكرة.",
      py: "list في بايثون صفّ متجاور من الأسهم. insert(0, 5) تزيح كل العناصر مثل هذه الحلقة، أما append فرخيصة غالباً لأن بايثون تحجز خانات زائدة مسبقاً.",
      go: "الشريحة في Go تحمل سهماً إلى كتلة وطولاً (len) وسعة (cap). append تكتب في الخانة التالية إن بقيت سعة، وإلا نسخت كل شيء إلى كتلة أكبر.",
      dart: "List في Dart صفّ متجاور أيضاً. insert(0, 5) تزيح كل العناصر، و add تضيف في الآخر.",
      rust: "Vec في Rust كتلة متجاورة لها سعة (capacity). insert(0, 5) تزيح الكل، و push تنسخ إلى كتلة أكبر حين تمتلئ. حلقة (1..len).rev() تمشي من الآخر إلى 1.",
    },
    steps: [],
    trace: "py",
  },
  playground: {
    kind: "trace",
    intro: "صفّ من خمس خانات وعدّاد يحسب كم خانة تحركت لنُدخل 5 في أوله. عدّل وشغّل، وراقب moves.",
    starter: `let cells = [10, 20, 30, 40, 50];
let moves = 0;
cells.push(0);
for (let i = cells.length - 1; i > 0; i--) {
  cells[i] = cells[i - 1];
  moves = moves + 1;
}
cells[0] = 5;
console.log(cells, "moves:", moves);`,
    challenges: [
      "أضف رقمين إلى الصف في السطر الأول. كم ستصبح moves؟ توقّع قبل أن تضغط.",
      "احذف الحلقة كلها و cells[0] = 5، واكتب cells.push(5) بدلها. كم حركة احتجنا للإضافة في الآخر؟",
      "أدخل 5 في الخانة 2 بدل 0: غيّر الشرط إلى i > 2 والسطر الأخير إلى cells[2] = 5. لماذا قلّت الحركات؟",
      "اطبع cells[4] قبل الإدراج وبعده. هل احتاجت القراءة أي حلقة؟",
    ],
  },
  predict: [
    {
      question: "كم خانة تتحرك لنُدخل 0 في أول صف من ستة عناصر؟",
      code: `let a = [1, 2, 3, 4, 5, 6];
let moves = 0;
a.push(0);
for (let i = a.length - 1; i > 0; i--) {
  a[i] = a[i - 1];
  moves = moves + 1;
}
a[0] = 0;
console.log(moves);`,
      options: ["1", "6", "7"],
      answer: 1,
      why: "الخانات متجاورة ولا فراغ بينها. لتفرغ الخانة 0 يجب أن يتحرك كل عنصر من الستة خطوة إلى اليمين. الإدراج في الأول يكلف بقدر طول الصف.",
    },
    {
      question: "الصف يبدأ عند العنوان 1000، وكل خانة 4 بايتات. أين تقع الخانة 3؟",
      code: `start = 1000
size = 4
i = 3
print(start + i * size)`,
      lang: "py",
      options: ["1003", "1012", "1016"],
      answer: 1,
      why: "الخانة i تبعد i خانات عن البداية، وكل خانة 4 بايتات: 1000 + 3 × 4 = 1012. عملية حسابية واحدة، لذلك القفز إلى الخانة 3 أو 3000 يأخذ الوقت نفسه.",
    },
    {
      question: "الكتلة فيها 4 خانات وكلها ممتلئة. ماذا يحدث عند إضافة عنصر خامس؟",
      code: `let capacity = 4;
let length = 4;
let copied = 0;
if (length === capacity) {
  capacity = capacity * 2;
  copied = copied + length;
}
length = length + 1;
console.log(capacity, copied);`,
      options: ["5 0", "8 4", "8 0"],
      answer: 1,
      why: "الكتلة لا تتمدد في مكانها: الخانة التالية قد تكون لشيء آخر. تُحجز كتلة أكبر (ضعف الحجم عادة) وتُنسخ إليها العناصر الأربعة كلها، ثم يُكتب الخامس.",
    },
  ],
  code: {
    intro: "الصورة واحدة في كل اللغات: كتلة خانات متجاورة. القراءة قفزة واحدة، والإدراج في الأول يزيح الجميع. شغّل الكود وراقب كيف تكبر الحركات مع الطول.",
    runnerLang: "py",
    runnerStarter: `def insert_front(cells, value):
    moves = 0
    cells.append(None)
    for i in range(len(cells) - 1, 0, -1):
        cells[i] = cells[i - 1]
        moves += 1
    cells[0] = value
    return moves

for n in [10, 100, 1000]:
    cells = list(range(n))
    print(n, "items ->", insert_front(cells, -1), "moves")
# جرّب: اكتب دالة insert_back تضيف بـ append وتعدّ حركاتها
`,
  },
  exercises: [
    {
      kind: "order",
      title: "إزاحة يدوية",
      prompt: "رتّب الأسطر حتى يُدخل البرنامج 1 في أول الصف ويطبع 1 2 3. ابدأ الإزاحة من الآخر.",
      lines: ["let a = [2, 3];", "a.push(0);", "a[2] = a[1];", "a[1] = a[0];", "a[0] = 1;", 'console.log(a.join(" "));'],
      expected: "1 2 3",
    },
    {
      kind: "fill",
      title: "عنوان الخانة",
      lang: "py",
      prompt: "الصف يبدأ عند 100 وكل خانة 8 بايتات. أي تعبير يحسب عنوان الخانة 3؟",
      template: "start = 100\nsize = 8\ni = 3\nprint(___)",
      options: ["start + i", "start + i * size", "start * i + size"],
      expected: "124",
    },
    {
      kind: "fix",
      title: "الإزاحة التي تمسح",
      prompt: "أردنا إدخال 5 في أول الصف، لكن البرنامج يطبع 5 10 10 10. أصلحه حتى يطبع 5 10 20 30.",
      code: 'let a = [10, 20, 30];\na.push(0);\nfor (let i = 1; i < a.length; i++) {\n  a[i] = a[i - 1];\n}\na[0] = 5;\nconsole.log(a.join(" "));',
      expected: "5 10 20 30",
      hint: "حين تبدأ من اليسار تكتب 10 فوق 20 قبل أن تنقل 20. ابدأ من آخر خانة وامشِ إلى الخلف: i = a.length - 1 ثم i > 0 ثم i--.",
      solution: `let a = [10, 20, 30];
a.push(0);
for (let i = a.length - 1; i > 0; i--) {
  a[i] = a[i - 1];
}
a[0] = 5;
console.log(a.join(" "));`,
    },
    {
      kind: "write",
      title: "إدراج في المنتصف",
      lang: "py",
      prompt: "اكتب دالة insert_at(cells, index, value) تُدخل value في الخانة index بإزاحة يدوية (بدون insert)، وترجع عدد الحركات. جرّبها على [1, 2, 4, 5] والخانة 2 والقيمة 3، واطبع الصف ثم الحركات: [1, 2, 3, 4, 5] ثم 2.",
      starter: "# اكتب الكود هنا\n",
      expected: "[1, 2, 3, 4, 5]\n2",
      hint: "cells.append(None) ثم حلقة من len(cells) - 1 نزولاً حتى index + 1: cells[i] = cells[i - 1] و moves += 1. ثم cells[index] = value.",
      solution: `def insert_at(cells, index, value):
    moves = 0
    cells.append(None)
    for i in range(len(cells) - 1, index, -1):
        cells[i] = cells[i - 1]
        moves += 1
    cells[index] = value
    return moves

cells = [1, 2, 4, 5]
moves = insert_at(cells, 2, 3)
print(cells)
print(moves)`,
    },
  ],
  quiz: [
    { question: "صف يبدأ عند 200 وكل خانة 4 بايتات. ما عنوان الخانة 5؟", code: "let start = 200;\nlet size = 4;\nconsole.log(start + 5 * size);", options: ["205", "220", "224"], answer: 1, why: "الخانة 5 تبعد 5 خانات عن البداية، كل واحدة 4 بايتات: 200 + 20 = 220. لا مشي على الخانات، مجرد حساب." },
    { question: "صف فيه 1000 عنصر. كم عنصراً يتحرك لنُدخل رقماً في أوله؟", options: ["1", "500", "1000"], answer: 2, why: "الخانات متجاورة، فلتفرغ الخانة 0 يجب أن يتحرك كل عنصر خطوة. الكلفة تكبر مع طول الصف." },
    { question: "في الكتلة خانات فارغة بعد آخر عنصر. كم عنصراً قديماً يتحرك عند push؟", code: "let a = [1, 2, 3];\na.push(4);", options: ["0", "1", "3"], answer: 0, why: "الخانة التالية فارغة، فيُكتب 4 فيها مباشرة. لا أحد يتحرك: الإضافة في الآخر رخيصة ما دامت في الكتلة مساحة." },
    { question: "كم عنصراً يتحرك لنُدخل رقماً في الخانة 2 من صف فيه 5 عناصر؟", code: "let a = [1, 2, 3, 4, 5];\n// insert 9 at index 2", options: ["2", "3", "5"], answer: 1, why: "العناصر في الخانات 2 و 3 و 4 يجب أن تتحرك خطوة لتفرغ الخانة 2. ما قبلها لا يتحرك: 3 حركات." },
    { question: "كتلة سعتها 4 تبدأ فارغة، ونضيف 5 عناصر. كم عنصراً نُسخ إلى كتلة جديدة؟", code: "let capacity = 4;\nlet length = 0;\nlet copied = 0;\nfor (let k = 0; k < 5; k++) {\n  if (length === capacity) {\n    copied = copied + length;\n    capacity = capacity * 2;\n  }\n  length = length + 1;\n}\nconsole.log(copied);", options: ["0", "4", "5"], answer: 1, why: "الأربعة الأولى دخلت في خانات فارغة. الخامس وجد الكتلة ممتلئة، فحُجزت كتلة بسعة 8 ونُسخت إليها العناصر الأربعة." },
  ],
  next: "linked-list",
};
