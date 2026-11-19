import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number, constant = false): Cell => ({ name, value: String(value), type: "number", constant });
const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });

export const variables: Lesson = {
  slug: "variables",
  stage: 1,
  number: "1.1",
  title: "المتغيرات والذاكرة",
  subtitle: "أين يضع البرنامج ما يريد تذكّره؟",
  minutes: 15,
  problem: {
    title: "البرنامج ينسى كل شيء",
    body: "لعبة تعطيك 10 نقاط كل مرة تضغط فيها. اضغط الزر عدة مرات وقارن بين الجهازين.",
    demo: "score",
  },
  scene: {
    code: {
      js: `let score = 0;
let name = "Sara";
score = score + 10;
let bonus = score;
score = 50;
console.log(score, bonus);`,
      ts: `let score: number = 0;
let name: string = "Sara";
score = score + 10;
let bonus: number = score;
score = 50;
console.log(score, bonus);`,
      py: `score = 0
name = "Sara"
score = score + 10
bonus = score
score = 50
print(score, bonus)`,
      go: `score := 0
name := "Sara"
score = score + 10
bonus := score
score = 50
fmt.Println(score, bonus)`,
      dart: `int score = 0;
String name = "Sara";
score = score + 10;
int bonus = score;
score = 50;
print('$score $bonus');`,
      rust: `let mut score = 0;
let name = "Sara";
score = score + 10;
let bonus = score;
score = 50;
println!("{} {}", score, bonus);`,
    },
    notes: {
      js: "let تُنشئ متغيراً يمكن تغييره، و const تُنشئ متغيراً لا يتغيّر.",
      ts: "TypeScript هي JavaScript مع أنواع: ‎: number تمنعك من وضع نص في درج مخصّص للأرقام، قبل أن يعمل البرنامج.",
      py: "بايثون لا تحتاج كلمة لإنشاء المتغير: أول إسناد يُنشئه. (تقنياً الاسم في بايثون بطاقة تشير إلى قيمة، لكن مع الأرقام النتيجة نفسها: bonus يبقى 10.)",
      go: ":= تُنشئ متغيراً جديداً وتستنتج نوعه، و = تغيّر متغيراً موجوداً.",
      dart: "في Dart تكتب النوع قبل الاسم: int للأعداد الصحيحة و String للنصوص.",
      rust: "في Rust المتغيرات ثابتة إذا لم تقل غير ذلك. كلمة mut تسمح بتغيير score لاحقاً.",
    },
    steps: [
      { line: null, say: "قبل التشغيل: الذاكرة صفّ من الأدراج الفارغة. لكل درج عنوان مثل 0x1000، والجهاز لا يعرف الأسماء، يعرف العناوين فقط.", memory: [] },
      { line: 1, say: "يحجز الجهاز درجاً، يلصق عليه الاسم score، ويضع فيه 0. هذا هو المتغير: درج له اسم.", memory: [n("score", 0)], changed: ["score"] },
      { line: 2, say: "درج ثانٍ اسمه name فيه نص. النص يُكتب بين علامتي تنصيص، ولونه هنا برتقالي لأن نوعه مختلف عن الرقم.", memory: [n("score", 0), s("name", "Sara")], changed: ["name"] },
      { line: 3, say: "انتبه للترتيب: الطرف الأيمن يُحسب أولاً. يفتح الجهاز درج score فيجد 0، ثم يحسب 0 + 10 = 10.", memory: [n("score", 0), s("name", "Sara")], read: ["score"] },
      { line: 3, say: "ثم يضع الناتج 10 في الدرج نفسه. القيمة القديمة 0 تُمحى، فالدرج يحمل قيمة واحدة فقط.", memory: [n("score", 10), s("name", "Sara")], changed: ["score"] },
      { line: 4, say: "درج جديد اسمه bonus. تُنسخ إليه القيمة 10 من score: نسخة مستقلة، وليس رابطاً بين الدرجين.", memory: [n("score", 10), s("name", "Sara"), n("bonus", 10)], changed: ["bonus"], read: ["score"], copy: { from: "score", to: "bonus" } },
      { line: 5, say: "score صار 50. انظر إلى bonus: ما زال 10، لأنه أخذ نسخة من القيمة ولم يرتبط بـ score.", memory: [n("score", 50), s("name", "Sara"), n("bonus", 10)], changed: ["score"] },
      { line: 6, say: "الطباعة تقرأ ما في الأدراج الآن وتعرضه: 50 و 10. لو فهمت لماذا bonus = 10، فقد فهمت أهم فكرة في الدرس.", memory: [n("score", 50), s("name", "Sara"), n("bonus", 10)], read: ["score", "bonus"], output: ["50 10"] },
    ],
  },
  playground: {
    kind: "sandbox",
    intro: "الآن أنت تتحكم في الذاكرة. اكتب سطراً واضغط نفّذ، وراقب الأدراج. جرّب أيضاً أن تخطئ: غيّر const، أو استخدم متغيراً قبل إنشائه.",
    examples: ["let age = 20", "age = age + 1", 'let city = "Riyadh"', "const pi = 3.14", "pi = 3", "let copy = age", "console.log(age)"],
  },
  predict: [
    {
      question: "ما قيمة b بعد تنفيذ هذه الأسطر؟",
      code: `let a = 3;
let b = a;
a = 7;`,
      options: ["3", "7", "10"],
      answer: 0,
      why: "السطر 2 ينسخ القيمة 3 إلى b. تغيير a بعد ذلك لا يلمس درج b.",
      scene: {
        code: { js: "let a = 3;\nlet b = a;\na = 7;" },
        steps: [
          { line: 1, say: "درج a فيه 3.", memory: [n("a", 3)], changed: ["a"] },
          { line: 2, say: "تُنسخ القيمة 3 إلى درج جديد اسمه b.", memory: [n("a", 3), n("b", 3)], changed: ["b"], copy: { from: "a", to: "b" } },
          { line: 3, say: "a يصبح 7، و b يبقى 3.", memory: [n("a", 7), n("b", 3)], changed: ["a"] },
        ],
      },
    },
    {
      question: "ما قيمة x في النهاية؟",
      code: `let x = 5;
x = x * 2;
x = x + 1;`,
      options: ["5", "10", "11", "6"],
      answer: 2,
      why: "كل سطر يقرأ القيمة الحالية ثم يكتب فوقها: 5، ثم 5 × 2 = 10، ثم 10 + 1 = 11.",
      scene: {
        code: { js: "let x = 5;\nx = x * 2;\nx = x + 1;" },
        steps: [
          { line: 1, say: "x = 5", memory: [n("x", 5)], changed: ["x"] },
          { line: 2, say: "يقرأ 5، يحسب 5 × 2 = 10، ويكتب 10.", memory: [n("x", 10)], changed: ["x"], read: ["x"] },
          { line: 3, say: "يقرأ 10، يحسب 10 + 1 = 11، ويكتب 11.", memory: [n("x", 11)], changed: ["x"], read: ["x"] },
        ],
      },
    },
    {
      question: "ماذا سيحدث عند تنفيذ السطر الثاني؟",
      code: `const max = 100;
max = 200;`,
      options: ["max يصبح 200", "خطأ: لا يمكن تغيير const", "يُنشأ درج جديد اسمه max"],
      answer: 1,
      why: "const تقفل الدرج بعد وضع القيمة الأولى. أي محاولة لتغييره توقف البرنامج بخطأ.",
      scene: {
        code: { js: "const max = 100;\nmax = 200;" },
        steps: [
          { line: 1, say: "درج max مقفل (const) وفيه 100.", memory: [n("max", 100, true)], changed: ["max"] },
          { line: 2, say: "محاولة الكتابة في درج مقفل: يتوقف البرنامج.", memory: [n("max", 100, true)], error: "TypeError: Assignment to constant variable" },
        ],
      },
    },
  ],
  code: {
    intro: "الفكرة واحدة في كل اللغات: درج له اسم وفيه قيمة. ما يختلف هو طريقة الكتابة فقط. بدّل اللغة فوق وشاهد نفس الأنميشن بكل لغة، ثم عدّل الكود بالأسفل وشغّله.",
    runnerStarter: `let score = 0;
score = score + 10;
let bonus = score;
score = 50;

console.log("score =", score);
console.log("bonus =", bonus);
// جرّب: غيّر let إلى const في السطر الأول وشغّل
`,
  },
  exercises: [
    {
      kind: "order",
      title: "سعر الطلب",
      prompt: "رتّب الأسطر حتى يحسب البرنامج سعر 3 قطع (20 ريالاً للقطعة) ويطبع 60.",
      lines: ["let price = 20;", "let qty = 3;", "let total = price * qty;", "console.log(total);"],
      expected: "60",
    },
    {
      kind: "fill",
      title: "الأرواح",
      prompt: "اللاعب يخسر روحاً واحدة. أي كلمة تجعل البرنامج يعمل ويطبع 2؟",
      template: "___ lives = 3;\nlives = lives - 1;\nconsole.log(lives);",
      options: ["const", "let"],
      expected: "2",
    },
    {
      kind: "fix",
      title: "العملات",
      prompt: "هذا البرنامج يتوقف بخطأ. أصلحه حتى يطبع 15.",
      code: "const coins = 10;\ncoins = coins + 5;\nconsole.log(coins);",
      expected: "15",
      hint: "الدرج coins يجب أن يقبل قيمة جديدة. أي كلمة تسمح بذلك؟",
      solution: `let coins = 10;
coins = coins + 5;
console.log(coins);`,
    },
    {
      kind: "write",
      title: "التفاح",
      prompt: "اكتب برنامجاً: أنشئ متغيراً اسمه apples قيمته 5، ثم أضف إليه 3، ثم اطبعه (يجب أن يظهر 8).",
      starter: "// اكتب الكود هنا\n",
      expected: "8",
      hint: "ثلاثة أسطر: let apples = 5;  ثم apples = apples + 3;  ثم console.log(apples);",
      solution: `let apples = 5;
apples = apples + 3;
console.log(apples);`,
    },
  ],
  quiz: [
    { question: "ما قيمة a بعد التنفيذ؟", code: "let a = 4;\na = a + 1;", options: ["4", "5", "a + 1", "1"], answer: 1, why: "يُحسب الطرف الأيمن أولاً بالقيمة الحالية 4، ثم يُكتب الناتج 5 في a." },
    { question: "ما قيمة q في النهاية؟", code: "let p = 10;\nlet q = p;\np = 0;", options: ["0", "10", "undefined"], answer: 1, why: "q أخذ نسخة من 10. تغيير p بعدها لا يؤثر عليه." },
    { question: "أي سطر يسبب خطأ؟", code: "const n = 1;\nlet m = n;\nm = 2;\nn = 3;", options: ["السطر 2", "السطر 3", "السطر 4", "لا يوجد خطأ"], answer: 2, why: "n أُنشئ بـ const، فلا يمكن الكتابة فيه في السطر 4. أما m فأُنشئ بـ let." },
    { question: "في السطر x = x + 2، ما الذي يحدث أولاً؟", options: ["يُكتب شيء في x", "يُحسب x + 2 بالقيمة الحالية لـ x", "يُنشأ x جديد"], answer: 1, why: "الإسناد يبدأ دائماً بالطرف الأيمن: يُقرأ x ويُحسب الناتج، ثم يُكتب الناتج في x." },
    { question: 'ما الفرق بين s و t؟', code: 'let s = "5";\nlet t = 5;', options: ["لا فرق", "s نص و t رقم", "s رقم و t نص"], answer: 1, why: "علامتا التنصيص تجعلان القيمة نصاً. \"5\" + 1 تعطي \"51\"، أما 5 + 1 فتعطي 6." },
  ],
  next: "types",
};
