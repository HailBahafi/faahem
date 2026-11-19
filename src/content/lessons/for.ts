import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

export const forLesson: Lesson = {
  slug: "for",
  stage: 1,
  number: "1.7",
  title: "حلقة for",
  subtitle: "العدّاد كله في سطر واحد، وبترتيب ثابت",
  minutes: 15,
  problem: {
    title: "ثلاثة أجزاء في ثلاثة أماكن",
    body: "في حلقة while يعيش العدّاد في ثلاثة أماكن: البداية فوق الحلقة، والشرط في رأسها، والتغيير في أسفل الجسم. ركّب الحلقة وشغّلها.",
    demo: "for",
  },
  scene: {
    code: {
      js: `let total = 0;
for (let i = 1; i <= 3; i++) {
  total = total + i;
}
console.log(total);`,
      ts: `let total: number = 0;
for (let i = 1; i <= 3; i++) {
  total = total + i;
}
console.log(total);`,
      py: `total = 0
for i in range(1, 4):
    total = total + i

print(total)`,
      go: `total := 0
for i := 1; i <= 3; i++ {
	total = total + i
}
fmt.Println(total)`,
      dart: `int total = 0;
for (int i = 1; i <= 3; i++) {
  total = total + i;
}
print(total);`,
      rust: `let mut total = 0;
for i in 1..=3 {
    total = total + i;
}
println!("{}", total);`,
    },
    notes: {
      js: "داخل القوسين ثلاثة أجزاء بينها فاصلة منقوطة: البداية; الشرط; التغيير. و let i يجعل i يعيش داخل الحلقة فقط.",
      ts: "مثل JavaScript تماماً. لا تحتاج أن تكتب نوع i: البداية 1 تجعله number.",
      py: "بايثون ليس فيها ثلاثة أجزاء: range(1, 4) تعطي 1 و 2 و 3 (الرقم 4 غير داخل)، و i يأخذ الرقم التالي في كل دورة، فالتغيير مخفي داخل range. السطر 4 فارغ لأن بايثون لا تحتاج قوس إغلاق.",
      go: "Go ليس فيها while أصلاً: for هي الحلقة الوحيدة، وتُكتب أجزاؤها الثلاثة بلا أقواس.",
      dart: "مثل JavaScript، مع كتابة النوع int قبل i.",
      rust: "Rust مثل بايثون: 1..=3 مدى من 1 إلى 3 (علامة = تُدخل 3)، و i يأخذ الرقم التالي كل دورة، فلا يوجد جزء تغيير تكتبه بيدك.",
    },
    steps: [
      { line: null, say: "هذه حلقة while من الدرس السابق، لكن مضغوطة: البداية والشرط والتغيير صاروا في سطر for واحد. السؤال كله: بأي ترتيب تعمل؟", memory: [] },
      { line: 1, say: "درج total فيه 0. هنا سنجمع 1 + 2 + 3.", memory: [n("total", 0)], changed: ["total"] },
      { line: 2, say: "الجزء الأول let i = 1 يعمل مرة واحدة فقط، قبل كل شيء. يظهر درج i وفيه 1.", memory: [n("total", 0), n("i", 1)], changed: ["i"] },
      { line: 2, say: "الجزء الثاني: الشرط i <= 3. القيمة 1 <= 3 صحيحة (true)، فيدخل الجهاز إلى الجسم.", memory: [n("total", 0), n("i", 1)], read: ["i"] },
      { line: 3, say: "الجسم يعمل: 0 + 1 = 1، فيصبح total هو 1.", memory: [n("total", 1), n("i", 1)], changed: ["total"], read: ["total", "i"] },
      { line: 2, say: "وصل إلى قوس الإغلاق فقفز إلى سطر for. الجزء الثالث i++ يعمل بعد الجسم: i يصبح 2.", memory: [n("total", 1), n("i", 2)], changed: ["i"] },
      { line: 2, say: "ثم الشرط من جديد (لا البداية، فهي مرة واحدة فقط): 2 <= 3 صحيح، إلى الجسم.", memory: [n("total", 1), n("i", 2)], read: ["i"] },
      { line: 3, say: "1 + 2 = 3. total يصبح 3.", memory: [n("total", 3), n("i", 2)], changed: ["total"], read: ["total", "i"] },
      { line: 2, say: "انتهى الجسم، فيعمل الجزء الثالث i++: i يصبح 3.", memory: [n("total", 3), n("i", 3)], changed: ["i"] },
      { line: 2, say: "الشرط: 3 <= 3 صحيح، فالرقم 3 داخل. إلى الجسم.", memory: [n("total", 3), n("i", 3)], read: ["i"] },
      { line: 3, say: "3 + 3 = 6. total يصبح 6.", memory: [n("total", 6), n("i", 3)], changed: ["total"], read: ["total", "i"] },
      { line: 2, say: "الجزء الثالث i++ مرة أخرى: i يصبح 4. لاحظ أن التغيير يحدث دائماً قبل الفحص التالي.", memory: [n("total", 6), n("i", 4)], changed: ["i"] },
      { line: 2, say: "الشرط: 4 <= 3 خطأ (false). لا يدخل الجسم، بل يقفز إلى ما بعد قوس الإغلاق.", memory: [n("total", 6), n("i", 4)], read: ["i"] },
      { line: 5, say: "درج i اختفى: عاش داخل الحلقة فقط. total بقي لأنه أُنشئ قبلها. يطبع 6.", memory: [n("total", 6)], read: ["total"], output: ["6"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذا صفّ من جدول الضرب: 7 مضروبة في كل رقم من 1 إلى 5. عدّل وشغّل، وراقب السهم وهو يزور البداية مرة واحدة، ثم الشرط والجسم والتغيير بالتناوب.",
    starter: `for (let i = 1; i <= 5; i++) {
  console.log(7 * i);
}`,
    challenges: [
      "غيّر 5 إلى 10. كم سطراً سيُطبع؟ توقّع قبل أن تضغط.",
      "غيّر i++ إلى i = i + 2. أي أرقام ستضرب في 7 الآن؟",
      "اجعل الحلقة تعدّ تنازلياً: let i = 5; i >= 1; i--",
      "أضف داخل الجسم في أوله: if (i === 3) continue;  أي سطر سيختفي، ولماذا لم تتوقف الحلقة؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `for (let i = 0; i < 3; i++) {
  console.log(i);
}`,
      options: ["0 1 2", "1 2 3", "0 1 2 3"],
      answer: 0,
      why: "البداية 0، فأول دورة تطبع 0. بعد 2 يجعل i++ القيمة 3، والشرط 3 < 3 خطأ، فلا يُطبع 3.",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `for (let i = 1; i <= 5; i++) {
  if (i % 2 === 0) continue;
  console.log(i);
}`,
      options: ["1 3 5", "1", "2 4"],
      answer: 0,
      why: "continue لا توقف الحلقة: تقفز فوق باقي الجسم إلى الجزء الثالث i++ ثم الشرط. فالأرقام الزوجية فقط تُتخطّى.",
    },
    {
      question: "ما الذي يُطبع؟",
      code: `let sum = 0;
for (let i = 1; i <= 10; i++) {
  if (i === 4) break;
  sum = sum + i;
}
console.log(sum);`,
      options: ["6", "10", "55"],
      answer: 0,
      why: "break تخرج من الحلقة كلها فوراً، بلا تغيير ولا شرط. جُمع 1 + 2 + 3 = 6 فقط، ثم خرجت عند 4 قبل أن تُضاف.",
    },
  ],
  code: {
    intro: "الترتيب واحد في كل اللغات: البداية مرة، ثم شرط، جسم، تغيير، وتكرار. بايثون و Rust تخفيان التغيير داخل المدى، لكن الآلة هي نفسها. بدّل اللغة فوق، ثم عدّل الكود بالأسفل وشغّله.",
    runnerStarter: `let total = 0;
for (let i = 1; i <= 10; i++) {
  total = total + i;
}
console.log("1 + 2 + ... + 10 =", total);
// جرّب: اجعل الحلقة تجمع الأرقام الفردية فقط باستخدام continue
`,
  },
  exercises: [
    {
      kind: "order",
      title: "مجموع حتى 4",
      prompt: "رتّب الأسطر حتى يجمع البرنامج 1 + 2 + 3 + 4 ويطبع 10.",
      lines: ["let total = 0;", "for (let i = 1; i <= 4; i++) {", "  total = total + i;", "}", "console.log(total);"],
      expected: "10",
    },
    {
      kind: "fill",
      title: "الأعداد الزوجية",
      prompt: "أي شرط يجعل البرنامج يطبع 2 و 4 و 6 فقط؟",
      template: "for (let i = 1; ___; i++) {\n  console.log(i * 2);\n}",
      options: ["i < 3", "i <= 3", "i <= 6"],
      expected: "2\n4\n6",
    },
    {
      kind: "fix",
      title: "المجموع المفقود",
      prompt: "هذا البرنامج يتوقف بخطأ. أصلحه حتى يطبع مجموع 1 إلى 5، أي 15.",
      code: "for (let i = 1; i <= 5; i++) {\n  let total = 0;\n  total = total + i;\n}\nconsole.log(total);",
      expected: "15",
      hint: "درج يُنشأ داخل الحلقة يُصنع من جديد كل دورة ويختفي بعدها. أين يجب أن يُنشأ total ليبقى بعد الحلقة؟",
      solution: `let total = 0;
for (let i = 1; i <= 5; i++) {
  total = total + i;
}
console.log(total);`,
    },
    {
      kind: "write",
      title: "الفردية فقط",
      prompt: "اكتب حلقة for تمرّ على الأرقام من 1 إلى 9، وتتخطّى الزوجية بـ continue، وتطبع الفردية كل رقم في سطر: 1 3 5 7 9.",
      starter: "// اكتب الكود هنا\n",
      expected: "1\n3\n5\n7\n9",
      hint: "داخل الجسم: if (i % 2 === 0) continue;  ثم console.log(i);",
      solution: `for (let i = 1; i <= 9; i++) {
  if (i % 2 === 0) continue;
  console.log(i);
}`,
    },
  ],
  quiz: [
    { question: "كم مرة تُطبع كلمة hi؟", code: 'for (let i = 0; i < 5; i++) {\n  console.log("hi");\n}', options: ["4", "5", "6"], answer: 1, why: "i يأخذ 0 و 1 و 2 و 3 و 4: خمس دورات. عند 5 يكون الشرط 5 < 5 خطأ فتتوقف." },
    { question: "ماذا يُطبع؟", code: "for (let i = 3; i > 0; i--) {\n  console.log(i);\n}", options: ["3 2 1", "3 2 1 0", "1 2 3"], answer: 0, why: "البداية 3، والتغيير ينقص 1 بعد كل جسم. عند 0 يكون الشرط 0 > 0 خطأ، فلا يُطبع 0." },
    { question: "أي جزء من هذا السطر يعمل مرة واحدة فقط؟", code: "for (let i = 0; i < 3; i++) {", options: ["let i = 0", "i < 3", "i++"], answer: 0, why: "البداية تعمل مرة واحدة قبل كل شيء. الشرط يعمل قبل كل دورة، والتغيير بعد كل جسم." },
    { question: "ماذا يحدث في السطر الأخير؟", code: "for (let i = 0; i < 3; i++) {\n}\nconsole.log(i);", options: ["يطبع 3", "يطبع 2", "خطأ: i غير موجود"], answer: 2, why: "i أُنشئ بـ let داخل سطر for، فهو يعيش داخل الحلقة فقط ويختفي درجه عند الخروج منها." },
    { question: "كم مرة يُفحص الشرط i < 3 في هذه الحلقة؟", code: "for (let i = 0; i < 3; i++) {\n  console.log(i);\n}", options: ["3", "4", "2"], answer: 1, why: "يُفحص عند 0 و 1 و 2 (صحيح، ثلاث دورات)، ثم مرة رابعة عند 3 (خطأ) وهي التي تُخرج من الحلقة." },
  ],
  next: "functions",
};
