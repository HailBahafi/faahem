import type { Lesson } from "@/lib/types";

export const decompose: Lesson = {
  slug: "decompose",
  stage: 2,
  number: "2.1",
  title: "تفكيك المشكلة",
  subtitle: "مهمة كبيرة تصير خطوات صغيرة، وكل خطوة سطراً أو سطرين",
  minutes: 16,
  problem: {
    title: "من أين أبدأ؟",
    body: "المطلوب: متوسط الدرجات الناجحة. لا يوجد سطر واحد يفعل هذا. اسحب البطاقة إلى المقص وقسّمها حتى تصير كل بطاقة شيئاً يفعله الجهاز في سطر.",
    demo: "decompose",
  },
  scene: {
    trace: true,
    steps: [],
    code: {
      js: `let grades = [72, 45, 90, 58, 81];
let total = 0, count = 0;
for (let g of grades) {
  if (g >= 60) {
    total = total + g;
    count = count + 1;
  }
}
console.log(total / count);`,
      ts: `let grades: number[] = [72, 45, 90, 58, 81];
let total: number = 0, count: number = 0;
for (let g of grades) {
  if (g >= 60) {
    total = total + g;
    count = count + 1;
  }
}
console.log(total / count);`,
      py: `grades = [72, 45, 90, 58, 81]
total, count = 0, 0
for g in grades:
    if g >= 60:
        total = total + g
        count = count + 1


print(total / count)`,
      go: `grades := []int{72, 45, 90, 58, 81}
total, count := 0, 0
for _, g := range grades {
	if g >= 60 {
		total = total + g
		count = count + 1
	}
}
fmt.Println(float64(total) / float64(count))`,
      dart: `List<int> grades = [72, 45, 90, 58, 81];
int total = 0, count = 0;
for (int g in grades) {
  if (g >= 60) {
    total = total + g;
    count = count + 1;
  }
}
print(total / count);`,
      rust: `let grades = vec![72, 45, 90, 58, 81];
let (mut total, mut count) = (0, 0);
for g in grades {
    if g >= 60 {
        total = total + g;
        count = count + 1;
    }
}
println!("{}", total as f64 / count as f64);`,
    },
    notes: {
      js: "كل بطاقة من الخطة صارت سطراً: السطران 3 و 4 «اختر الناجحة»، والسطر 5 «اجمع»، والسطر 6 «عُدّ»، والسطر 9 «اقسم». السطر 2 يجهّز درجي الجمع والعدّ من صفر.",
      ts: "الخطة نفسها، مع نوع لكل درج: number[] قائمة أرقام. الأنواع تكتب دخل البرنامج بوضوح قبل أول خطوة.",
      py: "total, count = 0, 0 تُنشئ درجين في سطر. والقسمة / في بايثون تعطي دائماً عدداً عشرياً، فيُطبع 81.0 لا 81.",
      go: "range يعطي موقع العنصر وقيمته، و _ تعني «لا أحتاج الموقع». قسمة int على int تقطع الكسر، فنحوّل إلى float64 أولاً.",
      dart: "int total = 0, count = 0 درجان من النوع نفسه في سطر. وقسمة int على int بـ / تعطي double، فيُطبع 81.0.",
      rust: "الدرجان يحتاجان mut لأنهما يتغيّران في الحلقة. و as f64 تحوّل العددين قبل القسمة العشرية.",
    },
  },
  playground: {
    kind: "trace",
    intro: "الخطة مكتوبة بالكلمات في التعليقات، وتحت كل تعليق السطر الذي ينفّذه. شغّل وراقب: كل خطوة تملأ درجاً تقرؤه الخطوة التي بعدها.",
    starter: `// input: the prices in the basket
let prices = [12, 30, 7, 25];
// step 1: keep the prices above 10
let big = [];
for (let p of prices) {
  if (p > 10) {
    big.push(p);
  }
}
// step 2: add them up
let total = 0;
for (let p of big) {
  total = total + p;
}
// output
console.log(total);`,
    challenges: [
      "غيّر 10 في الخطوة 1 إلى 20. أي أسعار ستبقى، وما المجموع؟ توقّع قبل أن تضغط.",
      "أضف خطوة 3: «اقسم المجموع على عدد الأسعار المختارة» واطبع المتوسط بدل المجموع.",
      "اجعل حلقة الخطوة 2 تمرّ على prices بدل big. ما الذي تغيّر في النتيجة؟ ولماذا لا يظهر خطأ؟",
      "اجعل الخطوة 2 دالة sum(list) ترجع المجموع، ثم استدعها: console.log(sum(big)).",
    ],
  },
  predict: [
    {
      question: "المطلوب متوسط الدرجات الناجحة فقط (60 أو أكثر). ماذا يطبع هذا البرنامج؟",
      code: `let grades = [80, 40, 100];
let total = 0;
for (let g of grades) {
  total = total + g;
}
console.log(total / grades.length);`,
      options: ["90", "73.33333333333333", "220"],
      answer: 1,
      why: "الخطة فيها أربع خطوات: اختر، اجمع، عُدّ، اقسم. البرنامج نسي «اختر»، فجمع 40 أيضاً وقسم على 3. لا خطأ يظهر: الجهاز ينفّذ ما كُتب، والخطوة الناقصة لا تحتج.",
    },
    {
      question: "كل الخطوات موجودة، لكن بترتيب آخر. ماذا يطبع؟",
      code: `let grades = [80, 100];
let total = 0;
let count = 0;
let avg = total / count;
for (let g of grades) {
  total = total + g;
  count = count + 1;
}
console.log(avg);`,
      options: ["90", "0", "NaN"],
      answer: 2,
      why: "السطر 4 يقسم قبل أن يجمع شيئاً: 0 / 0 تعطي NaN، وتوضع في avg. الحلقة بعدها تغيّر total و count، لكن avg أخذ قيمته وانتهى. الخطة تُكتب بترتيب: كل خطوة تقرأ ما أنتجته التي قبلها.",
    },
    {
      question: "هذه بايثون. ماذا تطبع؟",
      lang: "py",
      code: `grades = [80, 40, 100]
passing = []
for g in grades:
    if g >= 60:
        passing.append(g)
total = 0
for g in passing:
    total = total + g
count = len(grades)
print(total / count)`,
      options: ["90.0", "60.0", "73.33333333333333"],
      answer: 1,
      why: "خطوة «اختر» صنعت passing فيها 80 و 100، والمجموع 180. لكن خطوة «عُدّ» عدّت grades لا passing، فقسمت 180 على 3. كل خطوة يجب أن تقرأ خرج الخطوة الصحيحة.",
    },
  ],
  code: {
    intro: "الشكل الأوضح للتفكيك: دالة لكل خطوة، واسمها هو الخطوة بالكلمات. السطر الأخير يقرأ مثل الخطة: متوسط الناجحة. وكل دالة صغيرة تختبرها وحدها. بدّل اللغة فوق لترى الخطة نفسها في كل لغة، ثم عدّل الكود بالأسفل وشغّله.",
    runnerStarter: `function passing(grades) {
  let kept = [];
  for (let g of grades) {
    if (g >= 60) {
      kept.push(g);
    }
  }
  return kept;
}
function sum(list) {
  let total = 0;
  for (let x of list) {
    total = total + x;
  }
  return total;
}
function average(list) {
  return sum(list) / list.length;
}
console.log(average(passing([72, 45, 90, 58, 81])));
// جرّب: اكتب دالة highest(list) ترجع أكبر درجة، واطبع أعلى درجة ناجحة
`,
  },
  exercises: [
    {
      kind: "order",
      title: "الخطة سطراً سطراً",
      prompt: "رتّب الأسطر حتى يطبع البرنامج متوسط الأرقام الأكبر من 10: جهّز، مرّ واختر، اجمع وعُدّ، ثم اقسم. يجب أن يطبع 20.",
      lines: [
        "let nums = [4, 15, 25, 8];",
        "let total = 0, count = 0;",
        "for (let n of nums) {",
        "  if (n > 10) {",
        "    total = total + n;",
        "    count = count + 1;",
        "  }",
        "}",
        "console.log(total / count);",
      ],
      expected: "20",
    },
    {
      kind: "fill",
      title: "خطوة العدّ",
      lang: "py",
      prompt: "بايثون: الخطة «اجمع الناجحة، عُدّها، اقسم». أي تعبير يكمل خطوة العدّ فيطبع 80.0؟",
      template: "grades = [50, 70, 90]\ntotal = 0\ncount = 0\nfor g in grades:\n    if g >= 60:\n        total = total + g\n        count = ___\nprint(total / count)",
      options: ["count + 1", "count + g", "1"],
      expected: "80.0",
    },
    {
      kind: "fix",
      title: "القسمة المبكرة",
      prompt: "هذا البرنامج يطبع NaN بدل 90. الخطوات كلها موجودة، لكن واحدة في غير مكانها. أصلحه.",
      code: "let grades = [80, 100];\nlet total = 0;\nlet count = 0;\nlet avg = total / count;\nfor (let g of grades) {\n  total = total + g;\n  count = count + 1;\n}\nconsole.log(avg);",
      expected: "90",
      hint: "القسمة تقرأ total و count. متى يكون فيهما المجموع والعدد الحقيقيان؟",
      solution: `let grades = [80, 100];
let total = 0;
let count = 0;
for (let g of grades) {
  total = total + g;
  count = count + 1;
}
let avg = total / count;
console.log(avg);`,
    },
    {
      kind: "write",
      title: "الأيام الحارّة",
      prompt: "الحرارة في خمسة أيام: [31, 44, 38, 47, 29]. اطبع عدد الأيام التي تجاوزت 40، ثم متوسط حرارتها. يجب أن يظهر 2 ثم 45.5. الخطة مكتوبة لك في البداية.",
      starter: "let temps = [31, 44, 38, 47, 29];\n// step 1: start a total and a count at zero\n// step 2: walk every day; if it is above 40, add it and count it\n// step 3: print the count\n// step 4: divide and print the average\n",
      expected: "2\n45.5",
      hint: "let total = 0, count = 0;  ثم for (let t of temps) وفيها if (t > 40) تزيد total و count. بعد الحلقة اطبع count ثم total / count.",
      solution: `let temps = [31, 44, 38, 47, 29];
let total = 0, count = 0;
for (let t of temps) {
  if (t > 40) {
    total = total + t;
    count = count + 1;
  }
}
console.log(count);
console.log(total / count);`,
    },
  ],
  quiz: [
    {
      question: "البرنامج يتبع الخطة: (1) اختر الأرقام الزوجية (2) اجمعها. ماذا يطبع؟",
      code: "let nums = [1, 2, 3, 4];\nlet even = [];\nfor (let n of nums) {\n  if (n % 2 === 0) {\n    even.push(n);\n  }\n}\nlet total = 0;\nfor (let n of even) {\n  total = total + n;\n}\nconsole.log(total);",
      options: ["6", "10", "4"],
      answer: 0,
      why: "الخطوة 1 تصنع قائمة جديدة فيها 2 و 4 فقط. الخطوة 2 تقرأ هذه القائمة لا الأصلية، فالمجموع 6.",
    },
    {
      question: "دالة لكل خطوة. ماذا يطبع السطر الأخير؟",
      code: "function double(n) {\n  return n * 2;\n}\nfunction addOne(n) {\n  return n + 1;\n}\nconsole.log(addOne(double(5)));",
      options: ["11", "12", "10"],
      answer: 0,
      why: "يُقرأ من الداخل إلى الخارج: double تنفّذ أولاً وتعطي 10، ثم addOne تأخذ خرجها: 11. خرج كل خطوة هو دخل التي بعدها، والترتيب يغيّر النتيجة: addOne أولاً كانت ستعطي 12.",
    },
    {
      question: "الخطة: «عُدّ الطلاب الناجحين». ماذا يطبع هذا التنفيذ لها؟",
      code: "let grades = [90, 55, 60, 30];\nlet count = 0;\nfor (let g of grades) {\n  if (g >= 60) {\n    count = count + 1;\n  }\n}\nconsole.log(count);",
      options: ["2", "3", "4"],
      answer: 0,
      why: "الحلقة هي «مرّ على كل درجة»، و if هي «هل نجح؟»، والسطر داخلها «زِد العدّاد». 90 و 60 فقط تجتازان الشرط، فالعدّاد 2.",
    },
    {
      question: "خطوتان بترتيب مقلوب: جمع ثم اختيار. ماذا يطبع؟",
      code: "let prices = [5, 20, 30];\nlet total = 0;\nfor (let p of prices) {\n  total = total + p;\n}\nlet big = [];\nfor (let p of prices) {\n  if (p > 10) {\n    big.push(p);\n  }\n}\nconsole.log(total);",
      options: ["50", "55", "خطأ"],
      answer: 1,
      why: "الجمع حدث على القائمة كلها قبل أن يُختار شيء. الاختيار بعده صنع big، لكن لا أحد قرأها. الخطوة تؤثر فقط فيما يأتي بعدها ويقرأ خرجها.",
    },
    {
      question: "أي خطة بالكلمات تحلّ «ما أطول اسم في القائمة»؟",
      options: [
        "ابدأ بأول اسم كأطول اسم، مرّ على كل اسم، إن كان أطول من الأطول فاحفظه، اطبع الأطول",
        "اجمع أطوال الأسماء ثم اقسم على عددها",
        "مرّ على كل اسم واطبعه",
      ],
      answer: 0,
      why: "الدخل قائمة أسماء والخرج اسم واحد. الخطة الأولى تحمل درجاً يتذكّر الأطول حتى الآن، وكل خطوة فيها سطر واحد. الثانية تحسب متوسط الطول، والثالثة لا تختار شيئاً.",
    },
  ],
  next: "tracing",
};
