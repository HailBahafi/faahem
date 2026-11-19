import type { Lesson } from "@/lib/types";

export const bigO: Lesson = {
  slug: "big-o",
  stage: 3,
  number: "3.10",
  title: "Big-O",
  subtitle: "كيف يكبر العمل عندما تكبر المدخلات",
  minutes: 16,
  problem: {
    title: "عند عشرة عناصر لا فرق",
    body: "خمس طرق لمعالجة n عنصراً. عند 10 عناصر تبدو كلها سريعة. حرّك المؤشر نحو الألف، أو اضغط السباق، وراقب عدّاد الخطوات لكل طريقة وشكل خطها.",
    demo: "bigO",
  },
  scene: {
    code: {
      js: `let n = 3;
let single = 0;
for (let i = 0; i < n; i++) {
  single++;
}
let pairs = 0;
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    pairs++;
  }
}
console.log(single, pairs);`,
      py: `n = 3
single = 0
for i in range(n):
    single += 1

pairs = 0
for i in range(n):
    for j in range(n):
        pairs += 1


print(single, pairs)`,
      go: `n := 3
single := 0
for i := 0; i < n; i++ {
	single++
}
pairs := 0
for i := 0; i < n; i++ {
	for j := 0; j < n; j++ {
		pairs++
	}
}
fmt.Println(single, pairs)`,
    },
    notes: {
      js: "العدّادان لا يقيسان ثواني، بل كم مرة عملت الجملة الداخلية. هذا ما يقيسه Big-O: عدد الخطوات بدلالة n.",
      py: "range(n) تعطي n دورة. الحلقة الداخلية تُكتب بإزاحة أعمق، وتعمل n مرة في كل دورة من دورات الخارجية.",
      go: "Go ليس فيها إلا for، والشكل نفسه: حلقة داخل حلقة تعني n × n. الدالة لا تتغير بتغير اللغة، والنمو كذلك.",
    },
    steps: [],
    trace: true,
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "هذا قلب البحث الثنائي والشجرة المتوازنة: في كل خطوة يبقى نصف ما كان. عدّ الخطوات وراقب كم يكبر العدد حين يتضاعف n.",
    starter: `n = 16
steps = 0
while n > 1:
    n = n // 2
    steps += 1
print("steps:", steps)`,
    challenges: [
      "غيّر 16 إلى 32. كم خطوة؟ ثم 1024. توقّع قبل أن تضغط.",
      "جرّب n = 1000000. مليون عنصر، كم خطوة تكفي؟",
      "استبدل n // 2 بـ n - 1. صار البحث خطياً: كم خطوة عند 16 الآن؟",
      "أعدها n // 2 وجرّب n = 17 و n = 31. لماذا لا يتغير العدد كثيراً؟",
    ],
  },
  predict: [
    {
      question: "كم مرة يزيد العدّاد؟",
      code: `let n = 4;
let count = 0;
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    count++;
  }
}
console.log(count);`,
      options: ["16", "8", "4"],
      answer: 0,
      why: "الحلقة الداخلية تعمل كاملة، 4 مرات، في كل دورة من دورات الخارجية الأربع: 4 × 4 = 16. حلقة داخل حلقة هي n²، لا 2n.",
    },
    {
      question: "كم خطوة حتى يبقى عنصر واحد؟",
      lang: "py",
      code: `n = 8
steps = 0
while n > 1:
    n = n // 2
    steps += 1
print(steps)`,
      options: ["3", "8", "4"],
      answer: 0,
      why: "8 ثم 4 ثم 2 ثم 1: ثلاث قسمات. 2 × 2 × 2 = 8، لذلك الخطوات = log₂ 8 = 3. ضاعف n فتزيد خطوة واحدة فقط.",
    },
    {
      question: "حلقتان متتاليتان، لا متداخلتان. كم خطوة؟",
      code: `let n = 5;
let steps = 0;
for (let i = 0; i < n; i++) {
  steps++;
}
for (let i = 0; i < n; i++) {
  steps++;
}
console.log(steps);`,
      options: ["10", "25", "5"],
      answer: 0,
      why: "الثانية تبدأ بعد انتهاء الأولى، فالخطوات n + n = 2n = 10. وهذا ما زال O(n): الثابت 2 يُحذف لأن الخط يبقى مستقيماً مهما كبر n.",
    },
  ],
  code: {
    intro: "كل بنية رأيتها في هذه المرحلة لها عدّاد: المصفوفة تصل الخانة في خطوة، والقائمة المترابطة تمشي n عقدة، وجدول التجزئة يقفز إلى المفتاح، والشجرة المتوازنة تنصّف. شغّل وقارن الأعمدة حين يكبر n عشر مرات.",
    runnerStarter: `function halving(n) {
  let s = 0;
  while (n > 1) {
    n = Math.floor(n / 2);
    s++;
  }
  return s;
}
function linear(n) {
  let s = 0;
  for (let i = 0; i < n; i++) s++;
  return s;
}
function allPairs(n) {
  let s = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) s++;
  }
  return s;
}
for (const n of [10, 100, 1000]) {
  console.log("n =", n, "| log n:", halving(n), "| n:", linear(n), "| n^2:", allPairs(n));
}
// جرّب: أضف 5000 إلى القائمة. أي عمود يجعلك تنتظر؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "عدّاد البحث الخطي",
      prompt: "رتّب الأسطر حتى يعدّ البحث الخطي خطواته حتى يجد 16، فيطبع 4.",
      lines: [
        "let list = [4, 8, 15, 16, 23];",
        "let steps = 0;",
        "for (const x of list) {",
        "  steps++;",
        "  if (x === 16) break;",
        "}",
        "console.log(steps);",
      ],
      expected: "4",
    },
    {
      kind: "fill",
      lang: "py",
      title: "حلقة داخل حلقة",
      prompt: "نريد مقارنة كل عنصر بكل عنصر، أي n × n خطوة. عند n = 4 يجب أن يُطبع 16.",
      template: `n = 4
steps = 0
for i in range(n):
    for j in range(___):
        steps += 1
print(steps)`,
      options: ["n", "1", "i"],
      expected: "16",
    },
    {
      kind: "fix",
      title: "تنصيف لا ينصّف",
      prompt: "البحث الثنائي في 64 عنصراً يحتاج 6 خطوات: يبقى نصف الباقي في كل خطوة. لكن العدّاد يطبع 32. أصلحه.",
      code: `let n = 64;
let steps = 0;
while (n > 1) {
  n = n - 2;
  steps++;
}
console.log(steps);`,
      expected: "6",
      hint: "n - 2 يطرح عددين ثابتين في كل خطوة، فهو ما زال خطياً. التنصيف يقسم: Math.floor(n / 2).",
      solution: `let n = 64;
let steps = 0;
while (n > 1) {
  n = Math.floor(n / 2);
  steps++;
}
console.log(steps);`,
    },
    {
      kind: "write",
      lang: "py",
      title: "كل الأزواج",
      prompt: "خمسة أصدقاء، ونريد مقارنة كل اثنين مرة واحدة فقط. عدّ الأزواج بحلقتين واطبع العدد.",
      starter: `names = ["Sara", "Ali", "Huda", "Omar", "Laila"]
# عدّ كل زوج (i, j) حيث j بعد i، ثم اطبع العدد
`,
      expected: "10",
      hint: "الحلقة الداخلية تبدأ بعد i: for j in range(i + 1, len(names)). العدد n(n-1)/2، وهو ما زال O(n²).",
      solution: `names = ["Sara", "Ali", "Huda", "Omar", "Laila"]
count = 0
for i in range(len(names)):
    for j in range(i + 1, len(names)):
        count += 1
print(count)`,
    },
  ],
  quiz: [
    {
      question: "المصفوفة فيها مليون عنصر. كم خطوة تحتاج هذه القراءة؟",
      code: "let arr = [5, 9, 2, 7];\nconsole.log(arr[2]);",
      options: ["خطوة واحدة: O(1)", "مليون خطوة: O(n)", "20 خطوة: O(log n)"],
      answer: 0,
      why: "الخانات متجاورة في الذاكرة، فعنوان الخانة يُحسب مباشرة: البداية + الرقم × الحجم. لا مرور على ما قبلها، مهما طالت المصفوفة.",
    },
    {
      question: "كم مرة تُطبع Hi؟",
      code: 'let n = 3;\nfor (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j++) {\n    console.log("Hi");\n  }\n}',
      options: ["9", "6", "3"],
      answer: 0,
      why: "3 دورات خارجية، في كل واحدة 3 داخلية: 3 × 3 = 9. لو صار n = 300 لصارت 90,000: هذا شكل n².",
    },
    {
      question: "ماذا يُطبع؟",
      code: "let n = 1024;\nlet steps = 0;\nwhile (n > 1) {\n  n = n / 2;\n  steps++;\n}\nconsole.log(steps);",
      options: ["10", "512", "1024"],
      answer: 0,
      why: "1024 = 2 مضروبة في نفسها 10 مرات، فعشر قسمات تصل إلى 1. هذا O(log n): البحث الثنائي في 1024 عنصراً يحتاج 10 خطوات.",
    },
    {
      question: "ماذا يُطبع؟",
      code: "let n = 1000;\nlet a = 100 * n;\nlet b = n * n;\nconsole.log(a, b);",
      options: ["100000 1000000", "100000 100000", "1000000 100000"],
      answer: 0,
      why: "100n أكبر عند n صغير، لكن n² يلحقه عند 100 ويتجاوزه بعدها بلا رجعة. لذلك يحذف Big-O الثابت 100: عند n كبير يحكم الشكل.",
    },
    {
      question: "أيهما أقل خطوات للوصول إلى رقم Sara بين مليون اسم؟",
      code: 'let book = { Sara: "0501", Ali: "0502" };\nconsole.log(book["Sara"]);',
      options: ["الكائن (جدول تجزئة): O(1)", "مصفوفة أسماء نمشي عليها: O(1)", "الاثنان O(n)"],
      answer: 0,
      why: "جدول التجزئة يحوّل المفتاح إلى رقم خانة ويقفز إليها، مهما كثرت المفاتيح. المصفوفة تحتاج المرور على الأسماء واحداً واحداً: O(n).",
    },
  ],
  next: "terminal",
};
