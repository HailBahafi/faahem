import type { Lesson } from "@/lib/types";

export const sorting: Lesson = {
  slug: "sorting",
  stage: 3,
  number: "3.8",
  title: "الترتيب",
  subtitle: "مئات القرارات الصغيرة: قارن اثنين، وبدّلهما إن لزم",
  minutes: 18,
  problem: {
    title: "رتّبها بيدك",
    body: "أعمدة بأطوال مختلفة. اضغط بين عمودين متجاورين لتقارنهما: إن كان الأيسر أطول تبادلا. رتّبها من الأقصر إلى الأطول، وراقب عدّاد المقارنات.",
    demo: "sorting",
  },
  scene: {
    code: {
      js: `let a = [3, 2, 1];
for (let end = 2; end > 0; end--) {
  for (let i = 0; i < end; i++) {
    if (a[i] > a[i + 1]) {
      let t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
    }
  }
}
console.log(a);`,
      py: `a = [3, 2, 1]
for end in range(2, 0, -1):
    for i in range(end):
        if a[i] > a[i + 1]:
            a[i], a[i + 1] = a[i + 1], a[i]



print(a)`,
      go: `a := []int{3, 2, 1}
for end := 2; end > 0; end-- {
	for i := 0; i < end; i++ {
		if a[i] > a[i+1] {
			a[i], a[i+1] = a[i+1], a[i]
		}
	}
}
fmt.Println(a)`,
    },
    notes: {
      js: "التبديل يحتاج درجاً ثالثاً مؤقتاً t: لو كتبت a[i] = a[i + 1] مباشرة لضاعت القيمة القديمة قبل أن تنقلها.",
      py: "بايثون تبدّل خانتين في سطر واحد: الطرف الأيمن يُحسب كاملاً أولاً، ثم يُكتب في الخانتين، فلا حاجة لدرج مؤقت. range(2, 0, -1) تعدّ 2 ثم 1.",
      go: "مثل بايثون: a[i], a[i+1] = a[i+1], a[i] يحسب القيمتين قبل الكتابة. والحلقة for هي نفسها في الحلقتين.",
    },
    trace: true,
    steps: [],
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "الترتيب الفقاعي نفسه، مع عدّاد يزيد عند كل مقارنة. شغّل وراقب الصف: بعد كل جولة يستقر أكبر الباقي في آخره.",
    starter: `a = [4, 3, 2, 1]
count = 0
for end in range(len(a) - 1, 0, -1):
    for i in range(end):
        count += 1
        if a[i] > a[i + 1]:
            a[i], a[i + 1] = a[i + 1], a[i]
print(a, count)`,
    challenges: [
      "غيّر الصف إلى [1, 2, 3, 4] وهو مرتب أصلاً. كم مقارنة ستحدث؟ توقّع قبل أن تضغط.",
      "أضف رقماً خامساً: [5, 4, 3, 2, 1]. هل تزيد المقارنات بواحدة فقط؟",
      "غيّر > إلى < في الشرط. بأي ترتيب يخرج الصف الآن؟",
      "اطبع a داخل الحلقة الخارجية بعد كل جولة، وتأكد أن أكبر رقم باقٍ يصل إلى مكانه في كل جولة.",
    ],
  },
  predict: [
    {
      question: "جولة واحدة فقط من الترتيب الفقاعي. ماذا يُطبع؟",
      code: `let a = [4, 3, 2, 1];
for (let i = 0; i < a.length - 1; i++) {
  if (a[i] > a[i + 1]) {
    let t = a[i];
    a[i] = a[i + 1];
    a[i + 1] = t;
  }
}
console.log(a.join(" "));`,
      options: ["3 2 1 4", "1 2 3 4", "3 4 1 2"],
      answer: 0,
      why: "الجولة الواحدة تحمل أكبر رقم إلى آخر الصف، كفقاعة تصعد. الأربعة وصلت إلى مكانها، والباقي ما زال مقلوباً ويحتاج جولات أخرى.",
    },
    {
      question: "الصف مرتب أصلاً. كم مقارنة يقوم بها هذا الترتيب؟",
      code: `let a = [1, 2, 3];
let count = 0;
for (let end = 2; end > 0; end--) {
  for (let i = 0; i < end; i++) {
    count++;
    if (a[i] > a[i + 1]) {
      let t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
    }
  }
}
console.log(count);`,
      options: ["3", "0", "1"],
      answer: 0,
      why: "الجهاز لا يرى الصف كله بنظرة كما تراه أنت. لا يعرف أنه مرتب إلا إذا قارن، فيقارن 2 ثم 1 مقارنة كالعادة، حتى لو لم يبدّل شيئاً.",
    },
    {
      question: "دمج كومتين مرتبتين في كومة واحدة. ماذا يُطبع؟",
      lang: "py",
      code: `left = [1, 4]
right = [2, 3]
out = []
i = 0
j = 0
count = 0
while i < len(left) and j < len(right):
    count += 1
    if left[i] <= right[j]:
        out.append(left[i])
        i += 1
    else:
        out.append(right[j])
        j += 1
out = out + left[i:] + right[j:]
print(out, count)`,
      options: ["[1, 2, 3, 4] 3", "[1, 4, 2, 3] 2", "[1, 2, 3, 4] 6"],
      answer: 0,
      why: "لأن كل كومة مرتبة، يكفي أن تقارن رأسي الكومتين فقط وتأخذ الأصغر. بعد 3 مقارنات فرغت الكومة اليمنى، فأُلصق الباقي (4) كما هو دون مقارنة.",
    },
  ],
  code: {
    intro: "الترتيب الفقاعي سهل لكنه يقارن كثيراً. الترتيب بالدمج يقسم الصف نصفين، يرتب كل نصف، ثم يدمج الكومتين. هذا البرنامج يعدّ مقارنات كل واحد على صفوف معكوسة بأحجام مختلفة. شغّله وقارن.",
    runnerStarter: `function bubbleCount(a) {
  let count = 0;
  for (let end = a.length - 1; end > 0; end--) {
    for (let i = 0; i < end; i++) {
      count++;
      if (a[i] > a[i + 1]) { let t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; }
    }
  }
  return count;
}

let mergeComparisons = 0;
function mergeSort(a) {
  if (a.length <= 1) return a;
  let mid = Math.floor(a.length / 2);
  let left = mergeSort(a.slice(0, mid));
  let right = mergeSort(a.slice(mid));
  let out = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    mergeComparisons++;
    if (left[i] <= right[j]) out.push(left[i++]);
    else out.push(right[j++]);
  }
  return out.concat(left.slice(i), right.slice(j));
}

for (let n of [8, 16, 32, 1000]) {
  let a = [];
  for (let k = n; k > 0; k--) a.push(k);
  mergeComparisons = 0;
  mergeSort(a.slice());
  console.log(n, "items: bubble", bubbleCount(a), "merge", mergeComparisons);
}
// جرّب: أضف 2000 إلى القائمة. كم مرة تضاعفت مقارنات الفقاعي حين تضاعف الحجم؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "جولة واحدة",
      prompt: "رتّب الأسطر حتى تقوم جولة واحدة من الترتيب الفقاعي على [2, 3, 1]، فيطبع 2 1 3: أكبر رقم وصل إلى آخر الصف.",
      lines: [
        "let a = [2, 3, 1];",
        "for (let i = 0; i < a.length - 1; i++) {",
        "  if (a[i] > a[i + 1]) {",
        "    let t = a[i];",
        "    a[i] = a[i + 1];",
        "    a[i + 1] = t;",
        "  }",
        "}",
        'console.log(a.join(" "));',
      ],
      expected: "2 1 3",
    },
    {
      kind: "fill",
      title: "من الأكبر إلى الأصغر",
      prompt: "أي شرط يجعل الصف يخرج مرتباً من الأكبر إلى الأصغر؟",
      lang: "py",
      template: `a = [5, 2, 4, 1]
for end in range(len(a) - 1, 0, -1):
    for i in range(end):
        if ___:
            a[i], a[i + 1] = a[i + 1], a[i]
print(a)`,
      options: ["a[i] > a[i + 1]", "a[i] < a[i + 1]", "a[i] == a[i + 1]"],
      expected: "[5, 4, 2, 1]",
    },
    {
      kind: "fix",
      title: "التبديل الذي يضيّع رقماً",
      prompt: "هذا الترتيب يطبع 1 1 2 بدل 1 2 3: رقم 3 اختفى. أصلح التبديل.",
      code: `let a = [3, 1, 2];
for (let end = a.length - 1; end > 0; end--) {
  for (let i = 0; i < end; i++) {
    if (a[i] > a[i + 1]) {
      a[i] = a[i + 1];
      a[i + 1] = a[i];
    }
  }
}
console.log(a.join(" "));`,
      expected: "1 2 3",
      hint: "بعد السطر الأول من التبديل صار في الخانتين الرقم نفسه، والقيمة القديمة ضاعت. احفظها في درج مؤقت قبل أن تكتب فوقها.",
      solution: `let a = [3, 1, 2];
for (let end = a.length - 1; end > 0; end--) {
  for (let i = 0; i < end; i++) {
    if (a[i] > a[i + 1]) {
      let t = a[i];
      a[i] = a[i + 1];
      a[i + 1] = t;
    }
  }
}
console.log(a.join(" "));`,
    },
    {
      kind: "write",
      title: "الترتيب بالاختيار",
      prompt: "رتّب [3, 4, 1, 2] كما ترتب أوراق اللعب: في كل جولة ابحث عن أصغر رقم في الجزء الباقي، وبدّله مع أول خانة فيه. عدّ المقارنات، ثم اطبع الصف ثم العدد: [1, 2, 3, 4] ثم 6.",
      lang: "py",
      starter: "a = [3, 4, 1, 2]\n# اكتب الكود هنا\n",
      expected: "[1, 2, 3, 4]\n6",
      hint: "حلقة خارجية start من 0 إلى len(a) - 1. بداخلها small = start، ثم حلقة j من start + 1 تقارن a[j] < a[small] (وتزيد العدّاد). بعدها بدّل a[start] و a[small].",
      solution: `a = [3, 4, 1, 2]
count = 0
for start in range(len(a) - 1):
    small = start
    for j in range(start + 1, len(a)):
        count += 1
        if a[j] < a[small]:
            small = j
    a[start], a[small] = a[small], a[start]
print(a)
print(count)`,
    },
  ],
  quiz: [
    {
      question: "كم مقارنة يقوم بها الترتيب الفقاعي على 5 أرقام؟",
      code: "let n = 5;\nlet count = 0;\nfor (let end = n - 1; end > 0; end--) {\n  for (let i = 0; i < end; i++) count++;\n}\nconsole.log(count);",
      options: ["10", "5", "25"],
      answer: 0,
      why: "الجولة الأولى تقارن 4 أزواج متجاورة، ثم 3 لأن الأكبر استقر في آخره، ثم 2 ثم 1: المجموع 10.",
    },
    {
      question: "جولة واحدة من الترتيب بالاختيار. ماذا يُطبع؟",
      code: 'let a = [4, 1, 3, 2];\nlet small = 0;\nfor (let j = 1; j < a.length; j++) {\n  if (a[j] < a[small]) small = j;\n}\nlet t = a[0]; a[0] = a[small]; a[small] = t;\nconsole.log(a.join(" "));',
      options: ["1 4 3 2", "1 2 3 4", "4 1 3 2"],
      answer: 0,
      why: "الجولة تمسح الصف كله لتجد أصغر رقم (1 في الخانة 1)، ثم تبدّله مع الخانة 0. خانة واحدة فقط استقرت؛ الباقي ينتظر جولاته.",
    },
    {
      question: "الترتيب بالإدراج: ورقة جديدة تدخل يداً مرتبة. ماذا يُطبع؟",
      code: 'let hand = [1, 4, 6];\nlet card = 3;\nlet i = hand.length - 1;\nhand.push(card);\nwhile (i >= 0 && hand[i] > card) {\n  hand[i + 1] = hand[i];\n  i--;\n}\nhand[i + 1] = card;\nconsole.log(hand.join(" "));',
      options: ["1 3 4 6", "1 4 6 3", "3 1 4 6"],
      answer: 0,
      why: "كل ورقة أكبر من 3 تُزاح خانة إلى اليمين (6 ثم 4)، حتى نصل إلى 1 وهو أصغر، فتنزل 3 في الفراغ الذي بعده.",
    },
    {
      question: "الترتيب بالدمج يقسم الصف نصفين مرة بعد مرة. كم مرة يُقسم صف من 8 حتى تصير القطع عنصراً واحداً؟",
      code: "let size = 8;\nlet splits = 0;\nwhile (size > 1) {\n  size = size / 2;\n  splits++;\n}\nconsole.log(splits);",
      options: ["3", "8", "4"],
      answer: 0,
      why: "8 تصير 4 ثم 2 ثم 1: ثلاث طبقات فقط. في كل طبقة يمرّ الدمج على كل العناصر مرة، ولهذا يحتاج مقارنات أقل بكثير من الفقاعي على الصفوف الكبيرة.",
    },
    {
      question: "ماذا يُطبع؟ (عدد مقارنات الفقاعي لصف من 10 ولصف من 20)",
      code: "function bubbleComparisons(n) {\n  let count = 0;\n  for (let end = n - 1; end > 0; end--) count += end;\n  return count;\n}\nconsole.log(bubbleComparisons(10), bubbleComparisons(20));",
      options: ["45 190", "45 90", "10 20"],
      answer: 0,
      why: "ضاعفنا الحجم فتضاعف عدد الجولات وتضاعف طول كل جولة معاً، فصارت المقارنات أربعة أضعاف تقريباً. هذا ما يجعل الفقاعي بطيئاً على القوائم الكبيرة.",
    },
  ],
  next: "searching",
};
