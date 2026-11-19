import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });

export const ifLesson: Lesson = {
  slug: "if",
  stage: 1,
  number: "1.4",
  title: "الشروط if",
  subtitle: "كيف يختار البرنامج طريقاً دون آخر؟",
  minutes: 15,
  problem: {
    title: "نصيحة واحدة لكل الأجواء",
    body: "برنامج يعطيك نصيحة حسب الحرارة. حرّك المؤشر من البرد إلى الحر وراقب ما يقوله. ثم أضف له مفترق طرق.",
    demo: "if",
  },
  scene: {
    code: {
      js: `let score = 72;
let grade = "C";
if (score >= 90) {
  grade = "A";
} else if (score >= 70) {
  grade = "B";
}
console.log(grade);`,
      ts: `let score: number = 72;
let grade: string = "C";
if (score >= 90) {
  grade = "A";
} else if (score >= 70) {
  grade = "B";
}
console.log(grade);`,
      py: `score = 72
grade = "C"
if score >= 90:
    grade = "A"
elif score >= 70:
    grade = "B"

print(grade)`,
      go: `score := 72
grade := "C"
if score >= 90 {
	grade = "A"
} else if score >= 70 {
	grade = "B"
}
fmt.Println(grade)`,
      dart: `int score = 72;
String grade = "C";
if (score >= 90) {
  grade = "A";
} else if (score >= 70) {
  grade = "B";
}
print(grade);`,
      rust: `let score = 72;
let mut grade = "C";
if score >= 90 {
    grade = "A";
} else if score >= 70 {
    grade = "B";
}
println!("{}", grade);`,
    },
    notes: {
      js: "else if ليست كلمة جديدة: هي else يتبعها if آخر، أي مفترق جديد على الطريق الذي رفضه الأول. الأقواس { } ترسم حدود كل طريق.",
      ts: "مثل JavaScript تماماً: الأنواع لا تغيّر طريقة التفرّع، فقط تتأكد أن score رقم و grade نص.",
      py: "بايثون لا تستخدم أقواساً: المسافة في بداية السطر هي التي ترسم الطريق، و elif اختصار لـ else if.",
      go: "Go لا تضع أقواساً حول الشرط، لكنها تُلزمك بالأقواس { } حول الطريق، والشرط يجب أن يكون true أو false فعلاً.",
      dart: "مثل JavaScript في الشكل، لكن Dart ترفض أي شرط ليس bool حقيقياً، فلا يمكن أن تكتب if (score) وحدها.",
      rust: "Rust لا تضع أقواساً حول الشرط، و grade يحتاج mut لأن أحد الطريقين سيغيّره. ويمكن أن يعطي if قيمة مباشرة: let grade = if score >= 90 { \"A\" } else { \"B\" };",
    },
    steps: [
      { line: null, say: "البرنامج طريق يمشي عليه الجهاز سطراً بعد سطر من الأعلى. اليوم سنصل إلى مفترق: نقطة يختار عندها طريقاً واحداً ويترك الآخر.", memory: [] },
      { line: 1, say: "درج score فيه 72، وهي درجة طالب.", memory: [n("score", 72)], changed: ["score"] },
      { line: 2, say: "درج grade فيه \"C\". هذه هي القيمة التي ستبقى إذا لم يُفتح أي طريق.", memory: [n("score", 72), s("grade", "C")], changed: ["grade"] },
      { line: 3, say: "أول مفترق. قبل أن يختار، يحسب الجهاز الشرط: يقرأ 72 ويسأل 72 >= 90؟ الجواب قيمة واحدة: false.", memory: [n("score", 72), s("grade", "C")], read: ["score"] },
      { line: 5, say: "false تعني: لا تدخل. لاحظ أن السطر 4 لم يُضأ أبداً، فـ grade لم يصبح \"A\". القفز مباشرة إلى المفترق التالي: 72 >= 70؟ true.", memory: [n("score", 72), s("grade", "C")], read: ["score"] },
      { line: 6, say: "true تعني: ادخل هذا الطريق. يُكتب \"B\" في درج grade فوق \"C\".", memory: [n("score", 72), s("grade", "B")], changed: ["grade"] },
      { line: 8, say: "وجدنا أول طريق صحيح، فتُترك بقية السلسلة دون فحص، وتلتقي الطرق من جديد هنا. ما كُتب داخل الطريق باقٍ: grade ما زال \"B\".", memory: [n("score", 72), s("grade", "B")], read: ["grade"], output: ["B"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذه سلسلة من ثلاثة طرق. غيّر الحرارة، وقبل أن تضغط، توقّع أي سطر سيُضاء وأي أسطر سيقفز فوقها الجهاز.",
    starter: `let temp = 35;
let advice = "";
if (temp < 15) {
  advice = "coat";
} else if (temp < 30) {
  advice = "shirt";
} else {
  advice = "water";
}
console.log(advice);`,
    challenges: [
      "غيّر 35 إلى 10. كم مفترقاً سيفحص الجهاز قبل أن يدخل طريقاً؟",
      "جرّب 15 بالضبط. هل 15 < 15 صحيح؟ توقّع النصيحة قبل التشغيل.",
      "غيّر الشرط الثاني إلى temp < 50 واجعل temp = 5. لماذا لم تتغيّر النتيجة رغم أن الشرطين صحيحان؟",
      "احذف else وطريقها كاملاً، ثم شغّل مع temp = 35. ماذا يُطبع ولماذا؟",
    ],
  },
  predict: [
    {
      question: "الشرطان صحيحان هنا. ماذا يُطبع؟",
      code: `let x = 15;
if (x > 5) {
  console.log("big");
} else if (x > 10) {
  console.log("bigger");
}`,
      options: ["big", "bigger", "big ثم bigger"],
      answer: 0,
      why: "في سلسلة else if يدخل الجهاز أول طريق شرطه true فقط، ثم يترك بقية السلسلة دون أن يفحصها. x > 10 لم يُسأل أصلاً.",
    },
    {
      question: "هنا مفترقان منفصلان، لا سلسلة. ماذا يُطبع؟",
      code: `let x = 15;
let msg = "";
if (x > 5) {
  msg = msg + "A";
}
if (x > 10) {
  msg = msg + "B";
}
console.log(msg);`,
      options: ["A", "B", "AB"],
      answer: 2,
      why: "كل if بلا else قبله مفترق جديد على الطريق الرئيسي. بعد الأول تلتقي الطرق، ثم يصل الجهاز إلى المفترق الثاني ويفحصه أيضاً.",
    },
    {
      question: "ما قيمة level المطبوعة؟",
      code: `let level = "low";
let hp = 80;
if (hp > 50) {
  level = "high";
}
console.log(level);`,
      options: ['"low"، لأن التغيير داخل { } يضيع', '"high"', "خطأ"],
      answer: 1,
      why: "الطريق لا يملك أدراجاً خاصة به هنا: السطر 4 كتب في درج level نفسه. بعد التقاء الطرق يبقى فيه \"high\".",
    },
  ],
  code: {
    intro: "المفترق نفسه في كل اللغات: شرط يصبح true أو false، ثم طريق واحد. ما يختلف هو الأقواس والكلمات (elif في بايثون). بدّل اللغة فوق، ثم عدّل الدرجة بالأسفل وشغّل.",
    runnerStarter: `let score = 72;
let grade = "";

if (score >= 90) {
  grade = "A";
} else if (score >= 70) {
  grade = "B";
} else {
  grade = "C";
}

console.log("grade =", grade);
// جرّب: غيّر 72 إلى 95 ثم إلى 40، وتوقّع النتيجة قبل كل تشغيل
`,
  },
  exercises: [
    {
      kind: "order",
      title: "بوابة العمر",
      prompt: "رتّب الأسطر حتى يطبع البرنامج adult لشخص عمره 20.",
      lines: ["let age = 20;", "if (age >= 18) {", '  console.log("adult");', "} else {", '  console.log("minor");', "}"],
      expected: "adult",
    },
    {
      kind: "fill",
      title: "يوم حار",
      prompt: "الحرارة 35. أي علامة تجعل البرنامج يطبع hot؟",
      template: 'let t = 35;\nif (t ___ 30) {\n  console.log("hot");\n} else {\n  console.log("ok");\n}',
      options: [">", "<"],
      expected: "hot",
    },
    {
      kind: "fix",
      title: "الدرجة الخاطئة",
      prompt: "الطالب حصل على 95 لكن البرنامج يطبع B. أصلحه حتى يطبع A.",
      code: `let score = 95;
let grade = "";
if (score >= 70) {
  grade = "B";
} else if (score >= 90) {
  grade = "A";
}
console.log(grade);`,
      expected: "A",
      hint: "95 >= 70 صحيح، فيدخل الجهاز أول طريق ويترك الباقي. أي شرط يجب أن يُفحص أولاً؟",
      solution: `let score = 95;
let grade = "";
if (score >= 90) {
  grade = "A";
} else if (score >= 70) {
  grade = "B";
}
console.log(grade);`,
    },
    {
      kind: "write",
      title: "بارد أم دافئ",
      prompt: "temp قيمته 5. اكتب if و else: إذا كانت الحرارة أقل من 10 اطبع cold، وإلا اطبع warm.",
      starter: "let temp = 5;\n// اكتب الشرط هنا\n",
      expected: "cold",
      hint: 'if (temp < 10) { console.log("cold"); } else { console.log("warm"); }',
      solution: `let temp = 5;
if (temp < 10) {
  console.log("cold");
} else {
  console.log("warm");
}`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع البرنامج؟",
      code: "let x = 3;\nif (x > 5) {\n  x = 100;\n}\nconsole.log(x);",
      options: ["100", "3", "خطأ"],
      answer: 1,
      why: "3 > 5 تصبح false، فيقفز الجهاز فوق السطر 3 كأنه غير موجود. درج x لم يُلمس.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let n = 50;\nif (n > 100) {\n  console.log("big");\n} else if (n > 10) {\n  console.log("mid");\n} else {\n  console.log("small");\n}',
      options: ["big", "mid", "small", "mid ثم small"],
      answer: 1,
      why: "المفترق الأول false، الثاني true فيدخله. بعد أول طريق صحيح لا يصل الجهاز إلى else أبداً.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let s = 90;\nif (s > 90) {\n  console.log("A");\n} else {\n  console.log("B");\n}',
      options: ["A", "B", "A ثم B"],
      answer: 1,
      why: "يُحسب الشرط أولاً: 90 > 90 تعطي false، لأن 90 ليست أكبر من نفسها. false تعني طريق else.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let t = 25;\nlet out = "";\nif (t > 20) {\n  out = "warm";\n}\nif (t > 10) {\n  out = "mild";\n}\nconsole.log(out);',
      options: ["warm", "mild", "warmmild"],
      answer: 1,
      why: "هذان مفترقان منفصلان، فيُفحص الاثنان ويدخل الجهاز كليهما. الثاني يكتب \"mild\" فوق \"warm\" في الدرج نفسه.",
    },
    {
      question: "عند السطر if (a === 2)، ما الذي يحدث أولاً؟",
      code: 'let a = 1;\nif (a === 2) {\n  console.log("two");\n} else {\n  console.log("other");\n}',
      options: ["يُطبع two ثم يُفحص الشرط", "يُحسب a === 2 فيصبح false، ثم يُختار طريق else", "يُنفَّذ الطريقان ويُعرض الصحيح"],
      answer: 1,
      why: "المفترق يحسب الشرط أولاً إلى قيمة واحدة (هنا false)، ثم يمشي في طريق واحد فقط. السطر الذي يطبع two لا يعمل أبداً.",
    },
  ],
  next: "switch",
};
