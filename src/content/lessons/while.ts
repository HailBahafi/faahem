import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

export const whileLesson: Lesson = {
  slug: "while",
  stage: 1,
  number: "1.6",
  title: "حلقة while",
  subtitle: "كيف تكرّر عملاً دون أن تكتبه مئة مرة؟",
  minutes: 15,
  problem: {
    title: "مئة ختم بيدك",
    body: "عليك أن تختم الأرقام من 1 إلى 100. جرّب أن تختمها بيدك ضغطةً ضغطة، ثم دع الحلقة تفعلها عنك.",
    demo: "while",
  },
  scene: {
    code: {
      js: `let i = 0;
while (i < 3) {
  console.log(i);
  i = i + 1;
}
console.log("done");`,
      ts: `let i: number = 0;
while (i < 3) {
  console.log(i);
  i = i + 1;
}
console.log("done");`,
      py: `i = 0
while i < 3:
    print(i)
    i = i + 1

print("done")`,
      go: `i := 0
for i < 3 {
    fmt.Println(i)
    i = i + 1
}
fmt.Println("done")`,
      dart: `int i = 0;
while (i < 3) {
  print(i);
  i = i + 1;
}
print('done');`,
      rust: `let mut i = 0;
while i < 3 {
    println!("{}", i);
    i = i + 1;
}
println!("done");`,
    },
    notes: {
      js: "while تفحص الشرط قبل كل جولة. وتوجد do...while التي تنفّذ الجسم أولاً ثم تفحص، فتعمل مرة واحدة على الأقل.",
      ts: "الحلقة نفسها كما في JavaScript؛ الفرق فقط أن i مُعلن كرقم ‎: number.",
      py: "بايثون لا تستخدم أقواساً: الجسم هو الأسطر المُزاحة تحت while، وينتهي حين تعود الإزاحة. ولا يوجد do...while فيها.",
      go: "Go ليس فيها كلمة while أصلاً: تكتب for مع شرط فقط، وتعمل تماماً مثل while.",
      dart: "while و do...while في Dart تُكتبان كما في JavaScript.",
      rust: "في Rust يجب أن يكون i قابلاً للتغيير (mut)، وإلا لا يمكن للجسم أن يغيّره فلن تنتهي الحلقة. ولها أيضاً loop للتكرار بلا شرط.",
    },
    steps: [
      { line: null, say: "الحلقة هي if ترجع إلى فوق: تفحص الشرط، فإن كان صحيحاً نفّذت الجسم ثم عادت لتفحص من جديد. راقب السهم وهو يقفز.", memory: [] },
      { line: 1, say: "درج i فيه 0. هذا هو العدّاد: سنغيّره في كل جولة.", memory: [n("i", 0)], changed: ["i"] },
      { line: 2, say: "الجولة 1: i = 0، الشرط 0 < 3 صحيح، فندخل الجسم.", memory: [n("i", 0)], read: ["i"] },
      { line: 3, say: "يطبع قيمة i الحالية: 0.", memory: [n("i", 0)], read: ["i"], output: ["0"] },
      { line: 4, say: "i يصبح 1. هذا السطر هو ما سيوقف الحلقة يوماً ما. الجسم انتهى، فنقفز إلى سطر while.", memory: [n("i", 1)], changed: ["i"], read: ["i"], output: ["0"] },
      { line: 2, say: "قفزنا إلى فوق. الجولة 2: i = 1، الشرط 1 < 3 صحيح، فندخل مرة أخرى.", memory: [n("i", 1)], read: ["i"], output: ["0"] },
      { line: 3, say: "يطبع 1.", memory: [n("i", 1)], read: ["i"], output: ["0", "1"] },
      { line: 4, say: "i يصبح 2، ثم نقفز إلى سطر while.", memory: [n("i", 2)], changed: ["i"], read: ["i"], output: ["0", "1"] },
      { line: 2, say: "الجولة 3: i = 2، الشرط 2 < 3 صحيح.", memory: [n("i", 2)], read: ["i"], output: ["0", "1"] },
      { line: 3, say: "يطبع 2.", memory: [n("i", 2)], read: ["i"], output: ["0", "1", "2"] },
      { line: 4, say: "i يصبح 3، ونقفز إلى سطر while للمرة الأخيرة.", memory: [n("i", 3)], changed: ["i"], read: ["i"], output: ["0", "1", "2"] },
      { line: 2, say: "الفحص الرابع: i = 3، الشرط 3 < 3 خاطئ. لا ندخل الجسم، بل نقفز إلى ما بعد القوس }.", memory: [n("i", 3)], read: ["i"], output: ["0", "1", "2"] },
      { line: 6, say: "البرنامج يكمل بعد الحلقة ويطبع done. ثلاث جولات، وأربعة فحوص: الفحص الأخير هو الذي أخرجنا.", memory: [n("i", 3)], output: ["0", "1", "2", "done"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذه حلقة تجمع: total يكبر في كل جولة بقيمة n (نمط المُجمِّع)، و n هو العدّاد. عدّل ثم شغّل، وتوقّع النتيجة قبل أن تضغط.",
    starter: `let total = 0;
let n = 1;
while (n <= 4) {
  total = total + n;
  n = n + 1;
}
console.log(total);`,
    challenges: [
      "غيّر 4 إلى 10. كم سيطبع؟ توقّع ثم شغّل.",
      "غيّر <= إلى <. كم جولة ستنقص؟ ولماذا يتغيّر المجموع؟",
      "غيّر let n = 1 إلى let n = 5. هل يدخل الجسم ولو مرة؟",
      "احذف السطر n = n + 1 وشغّل. ماذا يحدث للشرط؟ ولماذا لا تنتهي الحلقة؟",
    ],
  },
  predict: [
    {
      question: "كم مرة سيُطبع hi؟",
      code: `let i = 5;
while (i < 3) {
  console.log("hi");
  i = i + 1;
}
console.log("end");`,
      options: ["0 مرة", "مرة واحدة", "3 مرات"],
      answer: 0,
      why: "الشرط يُفحص قبل الجسم. 5 < 3 خاطئ من البداية، فتقفز الحلقة مباشرة إلى ما بعدها ولا يُطبع إلا end.",
    },
    {
      question: "والآن مع do...while والشرط نفسه: كم مرة سيُطبع hi؟",
      code: `let i = 5;
do {
  console.log("hi");
  i = i + 1;
} while (i < 3);
console.log("end");`,
      options: ["0 مرة", "مرة واحدة", "3 مرات"],
      answer: 1,
      why: "do...while تنفّذ الجسم أولاً ثم تفحص في الأسفل. الجسم يعمل مرة، ثم 6 < 3 خاطئ فتخرج.",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `let i = 0;
while (i < 3) {
  i = i + 1;
  console.log(i);
}`,
      options: ["0 1 2", "1 2 3", "0 1 2 3"],
      answer: 1,
      why: "الزيادة تحدث قبل الطباعة داخل الجسم، فأول ما يُطبع هو 1. وفي الجولة الثالثة يصبح i = 3 ويُطبع، ثم يفشل الفحص 3 < 3.",
    },
  ],
  code: {
    intro: "كل حلقة while لها ثلاثة أجزاء: بداية العدّاد، الشرط، والتغيير داخل الجسم. بدّل اللغة فوق لترى أن Go تكتبها for، ثم عدّل الكود وشغّله.",
    runnerStarter: `let count = 1;
let total = 0;

while (count <= 5) {
  total = total + count;
  console.log("round", count, "total =", total);
  count = count + 1;
}

console.log("after the loop, count =", count);
// جرّب: غيّر 5 إلى 100، ثم اجعل الحلقة تعدّ بخطوات 2
`,
  },
  exercises: [
    {
      kind: "order",
      title: "العدّ التنازلي",
      prompt: "رتّب الأسطر حتى يطبع البرنامج 3 ثم 2 ثم 1.",
      lines: ["let n = 3;", "while (n > 0) {", "  console.log(n);", "  n = n - 1;", "}"],
      expected: "3\n2\n1",
    },
    {
      kind: "fill",
      title: "من 1 إلى 5",
      prompt: "أي رمز يجعل الحلقة تطبع الأرقام من 1 إلى 5 كلها؟",
      template: "let i = 1;\nwhile (i ___ 5) {\n  console.log(i);\n  i = i + 1;\n}",
      options: ["<", "<=", ">"],
      expected: "1\n2\n3\n4\n5",
    },
    {
      kind: "fix",
      title: "المجموع الناقص",
      prompt: "هذا البرنامج يريد مجموع الأرقام من 1 إلى 5 (أي 15)، لكنه يطبع 10. أصلحه.",
      code: "let total = 0;\nlet i = 1;\nwhile (i < 5) {\n  total = total + i;\n  i = i + 1;\n}\nconsole.log(total);",
      expected: "15",
      hint: "تتبّع الفحص الأخير: حين يصبح i = 5، هل يدخل الجسم؟ يجب أن يدخل.",
      solution: "let total = 0;\nlet i = 1;\nwhile (i <= 5) {\n  total = total + i;\n  i = i + 1;\n}\nconsole.log(total);",
    },
    {
      kind: "write",
      title: "الأعداد الزوجية",
      prompt: "اكتب حلقة while تطبع الأعداد الزوجية من 2 إلى 10، كل عدد في سطر.",
      starter: "// اكتب الكود هنا\n",
      expected: "2\n4\n6\n8\n10",
      hint: "ابدأ العدّاد من 2، والشرط n <= 10، وغيّره في كل جولة بـ n = n + 2.",
      solution: "let n = 2;\nwhile (n <= 10) {\n  console.log(n);\n  n = n + 2;\n}",
    },
  ],
  quiz: [
    {
      question: "ما قيمة i بعد انتهاء الحلقة؟",
      code: "let i = 0;\nwhile (i < 5) {\n  i = i + 2;\n}\nconsole.log(i);",
      options: ["4", "5", "6"],
      answer: 2,
      why: "i يمرّ بـ 0 ثم 2 ثم 4 ثم 6. عند 4 الشرط صحيح فيدخل ويصبح 6، ثم الفحص 6 < 5 خاطئ فيخرج و i = 6.",
    },
    {
      question: "كم مرة يُنفَّذ جسم الحلقة؟",
      code: "let k = 10;\nwhile (k > 7) {\n  k = k - 1;\n}",
      options: ["2", "3", "4"],
      answer: 1,
      why: "الفحوص: 10 > 7 صحيح، 9 > 7 صحيح، 8 > 7 صحيح، 7 > 7 خاطئ. ثلاث جولات وأربعة فحوص.",
    },
    {
      question: "ماذا يحدث عند تشغيل هذا البرنامج؟",
      code: "let x = 1;\nwhile (x < 3) {\n  console.log(x);\n}",
      options: ["يطبع 1 ثم 2", "يطبع 1 مرة واحدة", "يطبع 1 بلا نهاية"],
      answer: 2,
      why: "لا شيء في الجسم يغيّر x، فالشرط 1 < 3 صحيح في كل فحص والحلقة ترجع إلى فوق إلى الأبد. هذه حلقة لا نهائية.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: "let sum = 0;\nlet n = 1;\nwhile (n <= 3) {\n  sum = sum + n * 10;\n  n = n + 1;\n}\nconsole.log(sum);",
      options: ["30", "60", "10"],
      answer: 1,
      why: "المُجمِّع sum يكبر في كل جولة: 0 + 10 = 10، ثم 10 + 20 = 30، ثم 30 + 30 = 60. بعدها 4 <= 3 خاطئ.",
    },
    {
      question: "كم مرة يُطبع go؟",
      code: "let t = 0;\ndo {\n  console.log(\"go\");\n  t = t + 1;\n} while (t > 5);",
      options: ["0 مرة", "مرة واحدة", "5 مرات"],
      answer: 1,
      why: "do...while تنفّذ الجسم قبل أن تفحص. يُطبع go مرة، ثم t = 1 والفحص 1 > 5 خاطئ فتخرج.",
    },
  ],
  next: "for",
};
