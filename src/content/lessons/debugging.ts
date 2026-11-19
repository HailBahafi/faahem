import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

export const debugging: Lesson = {
  slug: "debugging",
  stage: 2,
  number: "2.3",
  title: "اصطياد الأخطاء",
  subtitle: "التصحيح عمل محقّق له طريقة، لا تخمين",
  minutes: 18,
  problem: {
    title: "أين انحرف الحساب؟",
    body: "البرنامج يطبع 132 والمطلوب 115. لا تخمّن: ضع المسبار على سطر لترى ما في الأدراج بعده، واعثر على أول سطر يختلف فيه الواقع عن المتوقع.",
    demo: "debugging",
  },
  scene: {
    code: {
      js: `let n = 4;
let total = 0;
for (let i = 1; i < n; i++) {
  total = total + i;
  console.log("probe:", i, total);
}
console.log("total:", total);`,
      ts: `let n: number = 4;
let total: number = 0;
for (let i = 1; i < n; i++) {
  total = total + i;
  console.log("probe:", i, total);
}
console.log("total:", total);`,
      py: `n = 4
total = 0
for i in range(1, n):
    total = total + i
    print("probe:", i, total)

print("total:", total)`,
      go: `n := 4
total := 0
for i := 1; i < n; i++ {
	total = total + i
	fmt.Println("probe:", i, total)
}
fmt.Println("total:", total)`,
      dart: `int n = 4;
int total = 0;
for (int i = 1; i < n; i++) {
  total = total + i;
  print("probe: $i $total");
}
print("total: $total");`,
      rust: `let n = 4;
let mut total = 0;
for i in 1..n {
    total = total + i;
    println!("probe: {} {}", i, total);
}
println!("total: {}", total);`,
    },
    notes: {
      js: "console.log هو المسبار الأسرع: سطر مؤقت يطبع الأدراج التي تشك فيها، ثم تحذفه بعد الإصلاح.",
      ts: "الأنواع تمنع بعض الأخطاء قبل التشغيل، لكنها لا ترى < بدل <=. الخطأ المنطقي يحتاج مسباراً هنا أيضاً.",
      py: "المسبار في بايثون هو print. و range(1, n) تتوقف قبل n، فهي تحمل الخطأ نفسه: الإصلاح range(1, n + 1).",
      go: "المسبار fmt.Println. و Go ترفض المتغير الذي أنشأته ولم تستعمله، فهي تلتقط بعض الأخطاء قبل التشغيل.",
      dart: "المسبار print مع $ داخل النص لعرض القيم. والحلقة تُكتب كما في JavaScript، فالإصلاح نفسه: i <= n.",
      rust: "المسبار println!، وهناك dbg!(total) الذي يطبع الاسم والقيمة ورقم السطر. و 1..n لا تشمل n، والإصلاح 1..=n.",
    },
    steps: [
      { line: null, say: "بلاغ: مجموع 1 + 2 + 3 + 4 يجب أن يكون 10، والبرنامج يطبع 6. المحقّق لا يخمّن: يكرّر الخطأ أولاً، ثم ينظر إلى الداخل. وضعنا مسباراً في السطر 5 يطبع i و total في كل دورة.", memory: [] },
      { line: 1, say: "n = 4. هذا يطابق المتوقع.", memory: [n("n", 4)], changed: ["n"] },
      { line: 2, say: "total = 0. صحيح أيضاً. فرضيتنا: total يكبر كل دورة هكذا 1 ثم 3 ثم 6 ثم 10.", memory: [n("n", 4), n("total", 0)], changed: ["total"] },
      { line: 3, say: "i يبدأ من 1. الشرط 1 < 4 صحيح، فندخل الحلقة.", memory: [n("n", 4), n("total", 0), n("i", 1)], changed: ["i"], read: ["n"] },
      { line: 4, say: "يقرأ total = 0 ويضيف i: الناتج 1.", memory: [n("n", 4), n("total", 1), n("i", 1)], changed: ["total"], read: ["total", "i"] },
      { line: 5, say: "المسبار يطبع probe: 1 1. توقّعنا 1، والواقع 1. لا شيء خاطئ حتى الآن.", memory: [n("n", 4), n("total", 1), n("i", 1)], read: ["i", "total"], output: ["probe: 1 1"] },
      { line: 5, say: "دورة ثانية: i = 2 و total = 3. المسبار يطابق المتوقع مرة أخرى.", memory: [n("n", 4), n("total", 3), n("i", 2)], changed: ["total", "i"], read: ["i", "total"], output: ["probe: 1 1", "probe: 2 3"] },
      { line: 5, say: "دورة ثالثة: i = 3 و total = 6. ما زال صحيحاً. إذن الجمع نفسه سليم، والشك ينتقل إلى مكان آخر.", memory: [n("n", 4), n("total", 6), n("i", 3)], changed: ["total", "i"], read: ["i", "total"], output: ["probe: 1 1", "probe: 2 3", "probe: 3 6"] },
      { line: 3, say: "هنا! i صار 4، والشرط 4 < 4 خاطئ، فتخرج الحلقة. توقّعنا دورة رابعة تضيف 4 ولم تحدث. هذا أول مكان يختلف فيه الواقع عن المتوقع: السبب < بدل <=.", memory: [n("n", 4), n("total", 6), n("i", 4)], changed: ["i"], read: ["i", "n"], error: "أول اختلاف: الحلقة توقفت قبل i = 4", output: ["probe: 1 1", "probe: 2 3", "probe: 3 6"] },
      { line: 7, say: "الطباعة تقرأ total = 6. الخطأ ظهر هنا، لكن سببه في السطر 3. نصلح شيئاً واحداً (i <= n)، ونشغّل من جديد فنرى 10، ثم نحذف المسبار.", memory: [n("n", 4), n("total", 6)], read: ["total"], output: ["probe: 1 1", "probe: 2 3", "probe: 3 6", "total: 6"] },
    ],
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "بلاغ جديد، بلغة بايثون: مجموع الأسعار يجب أن يكون 60، والبرنامج يطبع 30. المسبار print في مكانه. شغّل وراقب total عند كل دورة: متى يختلف عمّا تتوقع؟",
    starter: `prices = [10, 20, 30]
for p in prices:
    total = 0
    total = total + p
    print("probe:", p, total)
print("total:", total)`,
    challenges: [
      "قبل أن تشغّل، اكتب على ورقة ما تتوقعه من المسبار في كل دورة: 10 ثم 30 ثم 60. ثم شغّل: في أي دورة يختلف أول مرة؟",
      "أي سطر يُرجع total إلى الصفر في كل دورة؟ انقله فوق الحلقة وشغّل مرة أخرى.",
      "بعد الإصلاح احذف سطر المسبار. هل ما زال البرنامج يطبع total: 60؟",
      "أضف 40 إلى القائمة. توقّع المجموع قبل أن تضغط.",
    ],
  },
  predict: [
    {
      question: "أراد الكاتب أن يقارن score بـ 10. ماذا يُطبع؟",
      code: `let score = 3;
if (score = 10) {
  console.log("perfect");
} else {
  console.log("keep going");
}
console.log(score);`,
      options: ["keep going ثم 3", "perfect ثم 10", "perfect ثم 3"],
      answer: 1,
      why: "علامة = واحدة لا تقارن: تكتب 10 في درج score، والقيمة 10 تُعدّ صحيحة فيدخل if. المقارنة تُكتب ===. والمسبار على score بعد السطر 2 يفضح الخطأ فوراً.",
    },
    {
      question: "ماذا يُطبع؟",
      lang: "py",
      code: `def with_tax(price):
    return price + 15

price = 100
with_tax(price)
print(price)`,
      options: ["115", "100", "None"],
      answer: 1,
      why: "الدالة حسبت 115 وأرجعتها، لكن لا أحد استلمها: لم نكتبها في أي درج، فضاعت. درج price ما زال 100. الإصلاح: price = with_tax(price).",
    },
    {
      question: "المتوقع أن يُطبع 6 (نصف مساحة 4 × 3). يُطبع 8. ما أول سطر يختلف فيه الواقع عن المتوقع؟",
      code: `let width = 4;
let height = 3;
let area = width * width;
let half = area / 2;
console.log(half);`,
      options: ["السطر 5، لأن الطباعة أظهرت 8", "السطر 4، لأن القسمة أعطت 8", "السطر 3، لأن area صار 16 بدل 12"],
      answer: 2,
      why: "الرقم الخاطئ يظهر في الطباعة، لكنه وُلد قبلها. بعد السطر 3 نتوقع area = 12، والواقع 16: المتغير الخطأ width بدل height. السطر 4 يقسم صحيحاً قيمة خاطئة وصلته.",
    },
  ],
  code: {
    intro: "طريقة المحقّق في كل لغة: كرّر الخطأ بمثال صغير، ضع فرضية، اطبع الأدراج في السطر الذي تشك فيه، واقترب من أول سطر خاطئ، ثم أصلح سبباً واحداً وأعد التشغيل. شغّل الكود بالأسفل: الاستدعاء الثاني خاطئ.",
    runnerStarter: `function maxOf(nums) {
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    console.log("  probe i=" + i, "best=" + best);
    if (nums[i] > best) best = nums[i];
  }
  return best;
}
console.log("max:", maxOf([3, 9, 4]));
console.log("max:", maxOf([-5, -2, -8]));
// المتوقع للثاني -2، والمطبوع 0. اقرأ المسبار: هل best صحيح قبل الدورة الأولى؟
// جرّب: let best = nums[0]; ثم شغّل، ثم احذف سطر المسبار
`,
  },
  exercises: [
    {
      kind: "order",
      title: "مسبار داخل الحلقة",
      prompt: "رتّب الأسطر حتى يطبع المسبار i و total في كل دورة، ثم يطبع المجموع بعد الحلقة.",
      lines: [
        "let total = 0;",
        "for (let i = 1; i <= 3; i++) {",
        "  total = total + i;",
        '  console.log("probe:", i, total);',
        "}",
        'console.log("total:", total);',
      ],
      expected: "probe: 1 1\nprobe: 2 3\nprobe: 3 6\ntotal: 6",
    },
    {
      kind: "fill",
      title: "قارن ولا تكتب",
      prompt: "عندما تكون lives صفراً يجب أن يُطبع game over. أي علامة تقارن دون أن تغيّر الدرج؟",
      template: 'let lives = 0;\nif (lives ___ 0) {\n  console.log("game over");\n} else {\n  console.log("play");\n}',
      options: ["=", "===", "!=="],
      expected: "game over",
    },
    {
      kind: "fix",
      lang: "py",
      title: "العدّاد الذي يُصفَّر",
      prompt: "مجموع 5 و 10 و 15 هو 30، لكن البرنامج يطبع 15. ضع print داخل الحلقة إن احتجت، اعثر على السطر الذي يمحو المجموع، وأصلحه.",
      code: "nums = [5, 10, 15]\nfor n in nums:\n    total = 0\n    total = total + n\nprint(total)",
      expected: "30",
      hint: "total = 0 داخل الحلقة يعمل في كل دورة فيمحو ما جمعناه. التصفير يحدث مرة واحدة، قبل الحلقة.",
      solution: "nums = [5, 10, 15]\ntotal = 0\nfor n in nums:\n    total = total + n\nprint(total)",
    },
    {
      kind: "write",
      title: "استلم ما يرجع",
      prompt: "الدالة discount ترجع السعر بعد خصم 10. طبّقها مرتين على price واحفظ الناتج في price كل مرة، ثم اطبع price. المطلوب: 80.",
      starter: `function discount(price) {
  return price - 10;
}
let price = 100;
// طبّق الخصم مرتين واحفظ الناتج، ثم اطبع price
`,
      expected: "80",
      hint: "استدعاء discount(price) وحده يحسب ويرمي الناتج. اكتب price = discount(price); مرتين.",
      solution: `function discount(price) {
  return price - 10;
}
let price = 100;
price = discount(price);
price = discount(price);
console.log(price);`,
    },
  ],
  quiz: [
    {
      question: "أراد الكاتب طباعة عناصر القائمة الثلاثة. ماذا يُطبع؟",
      code: "let arr = [3, 5, 7];\nfor (let i = 0; i <= arr.length; i++) {\n  console.log(arr[i]);\n}",
      options: ["3 ثم 5 ثم 7", "3 ثم 5 ثم 7 ثم undefined", "5 ثم 7 ثم undefined"],
      answer: 1,
      why: "خطأ بفارق واحد: آخر خانة رقمها 2، لكن <= يسمح بدورة رابعة عند i = 3، فيُقرأ درج غير موجود: undefined. الإصلاح i < arr.length.",
    },
    {
      question: "المطلوب طباعة الأكبر بين a و b. ماذا يُطبع، وأين السبب؟",
      code: "let a = 2;\nlet b = 5;\nlet biggest = a;\nif (b > a) {\n  biggest = a;\n}\nconsole.log(biggest);",
      options: ["5، ولا خطأ", "2، والسبب السطر 5", "2، والسبب السطر 4"],
      answer: 1,
      why: "الشرط في السطر 4 صحيح (5 > 2) ودخلنا. لكن السطر 5 يكتب a بدل b: متغير خطأ. المسبار بعد السطر 5 يُظهر biggest = 2 حيث توقعنا 5.",
    },
    {
      question: "برنامج من 9 أسطر. المسبار بعد السطر 3 أظهر قيماً صحيحة، والمسبار بعد السطر 9 أظهر قيماً خاطئة. أين تضع المسبار التالي؟",
      options: ["بعد السطر 6، في منتصف المسافة", "بعد السطر 1", "بعد السطر 9 مرة أخرى"],
      answer: 0,
      why: "أول سطر خاطئ يقع بين 4 و 9. مسبار في المنتصف يقسم المسافة نصفين: إن كانت القيم بعد السطر 6 صحيحة فالخطأ في 7 إلى 9، وإلا ففي 4 إلى 6. كل مسبار يقطع الشك إلى النصف.",
    },
    {
      question: "ماذا يطبع هذا البرنامج بلغة بايثون؟",
      code: 'name = "sara"\nname.upper()\nprint(name)',
      options: ["SARA", "sara", "خطأ"],
      answer: 1,
      why: "upper() ترجع نصاً جديداً SARA ولا تغيّر الدرج. لم نستلم الناتج فضاع، و name ما زال sara. الإصلاح: name = name.upper().",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'let x = 5;\nif (x = 0) {\n  console.log("zero");\n} else {\n  console.log("not zero");\n}\nconsole.log(x);',
      options: ["not zero ثم 5", "zero ثم 0", "not zero ثم 0"],
      answer: 2,
      why: "= تكتب 0 في درج x، والقيمة 0 تُعدّ خاطئة فيذهب التنفيذ إلى else. والدرج نفسه تغيّر فيُطبع 0. خطآن من علامة واحدة؛ الصحيح x === 0.",
    },
  ],
  next: "array-ds",
};
