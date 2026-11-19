import type { Lesson } from "@/lib/types";

export const arrays: Lesson = {
  slug: "arrays",
  stage: 1,
  number: "1.10",
  title: "المصفوفات",
  subtitle: "صفّ واحد من الخانات المرقّمة بدل مئة درج",
  minutes: 15,
  problem: {
    title: "مئة طالب، مئة متغير؟",
    body: "أنت معلّم، ولكل طالب درجة. أضف الطلاب واحداً واحداً، وراقب الكود وهو يكبر.",
    demo: "arrays",
  },
  scene: {
    code: {
      js: `let scores = [70, 85, 90];
console.log(scores[0]);
scores.push(60);
let total = 0;
for (let i = 0; i < scores.length; i++) {
  total = total + scores[i];
}
console.log(total);`,
      ts: `let scores: number[] = [70, 85, 90];
console.log(scores[0]);
scores.push(60);
let total: number = 0;
for (let i = 0; i < scores.length; i++) {
  total = total + scores[i];
}
console.log(total);`,
      py: `scores = [70, 85, 90]
print(scores[0])
scores.append(60)
total = 0
for i in range(len(scores)):
    total = total + scores[i]

print(total)`,
      go: `scores := []int{70, 85, 90}
fmt.Println(scores[0])
scores = append(scores, 60)
total := 0
for i := 0; i < len(scores); i++ {
	total = total + scores[i]
}
fmt.Println(total)`,
      dart: `List<int> scores = [70, 85, 90];
print(scores[0]);
scores.add(60);
int total = 0;
for (int i = 0; i < scores.length; i++) {
  total = total + scores[i];
}
print(total);`,
      rust: `let mut scores = vec![70, 85, 90];
println!("{}", scores[0]);
scores.push(60);
let mut total = 0;
for i in 0..scores.len() {
    total = total + scores[i];
}
println!("{}", total);`,
    },
    notes: {
      js: "المصفوفة تُكتب بين قوسين مربعين، والخانة تُقرأ بـ scores[i]. وقراءة خانة غير موجودة مثل scores[4] لا توقف البرنامج: تعطي undefined بهدوء.",
      ts: "مثل JavaScript، و number[] تعني: صفّ كل خاناته أرقام. لن يقبل المترجم أن تضع فيه نصاً.",
      py: "اسمها في بايثون list، والإضافة في آخرها append بدل push. len(scores) هو الطول. وقراءة خانة غير موجودة توقف البرنامج بخطأ IndexError.",
      go: "اسمها slice، والإضافة بـ append التي تُرجع الصف الجديد فنضعه في scores من جديد. خانة غير موجودة توقف البرنامج (index out of range).",
      dart: "اسمها List، و List<int> تعني: صفّ أرقام صحيحة. الإضافة في آخرها add. خانة غير موجودة توقف البرنامج بخطأ RangeError.",
      rust: "اسمها Vec وتُصنع بـ vec![...]، وتحتاج mut لأننا سنضيف إليها. 0..scores.len() مدى من 0 حتى الطول دون أن يدخله. خانة غير موجودة توقف البرنامج (panic).",
    },
    trace: true,
    steps: [],
  },
  playground: {
    kind: "trace",
    intro: "صفّ من أربع درجات، وحلقة تمشي عليه خانة خانة. عدّل وشغّل، وراقب i وهو يشير إلى رقم الخانة، لا إلى ما فيها.",
    starter: `let scores = [70, 85, 90, 60];
for (let i = 0; i < scores.length; i++) {
  console.log(i, scores[i]);
}
console.log(scores[scores.length - 1]);`,
    challenges: [
      "أضف قبل الحلقة: scores.push(100);  كم سطراً ستطبع الحلقة الآن؟ توقّع قبل أن تضغط.",
      "غيّر الشرط إلى i <= scores.length. ماذا يُطبع في الدورة الأخيرة، ولماذا؟",
      "أضف قبل الحلقة: scores.pop();  أي رقم سيطبعه السطر الأخير الآن؟",
      "اكتب داخل الحلقة: scores[i] = scores[i] + 5;  ثم اطبع scores بعد الحلقة. ماذا تغيّر في الصف؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `let names = ["Ali", "Sara", "Omar"];
console.log(names[1]);`,
      options: ["Sara", "Ali", "Omar"],
      answer: 0,
      why: "الترقيم يبدأ من 0: الخانة 0 فيها Ali، والخانة 1 فيها Sara. رقم الخانة هو كم خطوة تبعد عن أول الصف.",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `let nums = [4, 8, 15];
console.log(nums[nums.length]);`,
      options: ["undefined", "15", "3"],
      answer: 0,
      why: "الطول 3، لكن الخانات مرقّمة 0 و 1 و 2. الخانة 3 بعد نهاية الصف، فلا شيء فيها: undefined. آخر خانة دائماً هي length - 1.",
    },
    {
      question: "ما الذي يُطبع؟",
      code: `let stack = [1, 2, 3];
stack.push(4);
stack.pop();
stack.pop();
console.log(stack.length, stack[stack.length - 1]);`,
      options: ["2 2", "3 3", "2 4"],
      answer: 0,
      why: "push وpop يعملان في آخر الصف فقط. الصف صار [1, 2, 3, 4]، ثم أُزيلت 4 ثم 3، فبقي [1, 2]: طوله 2 وآخر خانة فيه 2.",
    },
  ],
  code: {
    intro: "الصورة واحدة في كل اللغات: صفّ واحد من خانات مرقّمة من 0، والمتغير يشير إليه. تختلف الأسماء (list، slice، List، Vec) وتختلف اللغات فيما يحدث عند خانة غير موجودة. بدّل اللغة فوق، ثم عدّل الكود بالأسفل وشغّله.",
    runnerStarter: `let scores = [70, 85, 90, 60, 95];
let best = scores[0];
for (let i = 1; i < scores.length; i++) {
  if (scores[i] > best) best = scores[i];
}
console.log("Best:", best);
console.log("Last:", scores[scores.length - 1]);
// جرّب: أضف درجة بـ push قبل الحلقة، أو اطبع أقل درجة بدل أعلاها
`,
  },
  exercises: [
    {
      kind: "order",
      title: "مجموع الصف",
      prompt: "رتّب الأسطر حتى يجمع البرنامج كل خانات الصف ويطبع 12.",
      lines: [
        "let nums = [3, 4, 5];",
        "let sum = 0;",
        "for (let i = 0; i < nums.length; i++) {",
        "  sum = sum + nums[i];",
        "}",
        "console.log(sum);",
      ],
      expected: "12",
    },
    {
      kind: "fill",
      title: "آخر خانة",
      prompt: "أي رقم خانة يطبع آخر لون في الصف، أي blue؟",
      template: 'let colors = ["red", "green", "blue"];\nconsole.log(colors[___]);',
      options: ["colors.length", "colors.length - 1", "3 - 2"],
      expected: "blue",
    },
    {
      kind: "fix",
      title: "الدورة الزائدة",
      prompt: "هذا البرنامج يطبع سطراً زائداً فيه undefined. أصلحه حتى يطبع الأسماء الثلاثة فقط.",
      code: 'let names = ["Ali", "Sara", "Omar"];\nfor (let i = 0; i <= names.length; i++) {\n  console.log(names[i]);\n}',
      expected: "Ali\nSara\nOmar",
      hint: "الطول 3، والخانات 0 و 1 و 2. هل يجب أن تدخل i = 3 إلى الجسم؟",
      solution: `let names = ["Ali", "Sara", "Omar"];
for (let i = 0; i < names.length; i++) {
  console.log(names[i]);
}`,
    },
    {
      kind: "write",
      title: "صفّ يكبر",
      prompt: "ابدأ بصف فارغ []. أضف إليه بـ push الأرقام 10 و 20 و 30، ثم اطبع طوله، ثم اطبع آخر خانة فيه، كل واحد في سطر: 3 ثم 30.",
      starter: "// اكتب الكود هنا\n",
      expected: "3\n30",
      hint: "let nums = [];  ثم nums.push(10); ثلاث مرات بأرقام مختلفة. آخر خانة: nums[nums.length - 1].",
      solution: `let nums = [];
nums.push(10);
nums.push(20);
nums.push(30);
console.log(nums.length);
console.log(nums[nums.length - 1]);`,
    },
  ],
  quiz: [
    { question: "ماذا يُطبع؟", code: "let a = [5, 6, 7];\nconsole.log(a[0] + a[2]);", options: ["12", "11", "13"], answer: 0, why: "الخانة 0 فيها 5 والخانة 2 فيها 7، والمجموع 12. الرقم بين القوسين رقم الخانة، لا ترتيبها في العدّ البشري." },
    { question: "ما طول الصف بعد هذه الأسطر؟", code: "let a = [1, 2];\na.push(3);\na.push(4);\na.pop();\nconsole.log(a.length);", options: ["3", "4", "2"], answer: 0, why: "الصف يكبر بكل push خانة في آخره، ويصغر بكل pop خانة من آخره: 2 ثم 3 ثم 4 ثم 3." },
    { question: "كم مرة يعمل جسم الحلقة؟", code: "let a = [9, 8, 7, 6];\nfor (let i = 0; i < a.length; i++) {\n  console.log(a[i]);\n}", options: ["4", "3", "5"], answer: 0, why: "i يمرّ على 0 و 1 و 2 و 3، وهي أرقام الخانات الأربع. عند 4 يكون الشرط 4 < 4 خطأ فتتوقف قبل أن تخرج من الصف." },
    { question: "ماذا يُطبع؟", code: 'let a = ["x", "y"];\na[1] = "z";\nconsole.log(a[0], a[1]);', options: ["x z", "x y", "z y"], answer: 0, why: "الخانة 1 مثل درج: الكتابة فيها تمسح ما كان فيه (y) وتضع z. الخانة 0 لم تُلمس." },
    { question: "ماذا يطبع هذا البرنامج؟", code: "let total = 0;\nfor (const n of [2, 4, 6]) {\n  total = total + n;\n}\nconsole.log(total);", options: ["12", "3", "6"], answer: 0, why: "for...of تعطيك ما في الخانات مباشرة (2 ثم 4 ثم 6) بدل أرقامها، فتمشي على الصف نفسه دون i. المجموع 12." },
  ],
  next: "strings",
};
