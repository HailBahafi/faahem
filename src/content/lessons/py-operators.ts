import type { Frame, HeapObj, Lesson, Slot, Step, ValType } from "@/lib/types";

// Each operator builds a new object; = then binds a name to it.
const at = (name: string, id: number): Slot => ({ name, value: "", type: "ref", ref: id });
const obj = (id: number, type: string, value: string, kind: ValType = "number"): HeapObj => ({
  id,
  kind: "object",
  items: [
    { name: "type", value: type, type: "none" },
    { name: "value", value, type: kind },
  ],
});
const main = (...vars: Slot[]): Frame[] => [{ id: 0, name: "البرنامج", vars }];
const step = (line: number | null, say: string, vars: Slot[], heap: HeapObj[], extra: Partial<Step> = {}): Step => ({
  line,
  say,
  memory: [],
  frames: main(...vars),
  heap,
  ...extra,
});

const n17 = obj(1, "int", "17");
const n3 = obj(2, "int", "3");
const n2 = obj(3, "int", "2");
const f34 = obj(4, "float", "3.4");
const n20 = obj(5, "int", "20");
const yes = obj(6, "bool", "True", "boolean");
const four = [at("total", 1), at("boxes", 2), at("left", 3), at("avg", 4)];
const after = [at("total", 5), at("boxes", 2), at("left", 3), at("avg", 4)];
const all = [...after, at("ok", 6)];

export const pyOperators: Lesson = {
  slug: "py-operators",
  stage: 0,
  number: "1.3",
  title: "العمليات",
  subtitle: "كل عملية تصنع كائناً جديداً، و = تلصق عليه اسماً",
  minutes: 15,
  singleLanguage: true,
  problem: {
    title: "17 قطعة حلوى",
    body: "عندنا 17 قطعة نضعها في علب. اختر حجم العلبة وانظر: كم علبة تمتلئ، وكم قطعة تبقى خارجها؟ ثلاث عمليات قسمة، ولكل واحدة سؤال مختلف.",
    demo: "pyOperators",
  },
  scene: {
    code: {
      py: `total = 17
boxes = total // 5
left = total % 5
avg = total / 5
total += 3
ok = 0 < left <= 2
print(boxes, left, avg)
print(total, ok)`,
    },
    notes: {
      py: "بايثون فيها ثلاث قسمات: / تعطي float دائماً، و // تقرّب إلى الأسفل (floor)، و % الباقي. و // و % مع الأعداد السالبة تقرّبان نحو الأسفل: ‎-7 // 2 تعطي ‎-4. والمقارنات تتسلسل: a < b <= c تعني a < b and b <= c.",
    },
    steps: [
      step(null, "17 قطعة، وعلب تتسع لخمس. كل سطر سيطرح سؤالاً بعملية، وكل جواب كائن جديد في الكومة.", [], []),
      step(1, "كائن int قيمته 17، والبطاقة total عليه.", [at("total", 1)], [n17], { changed: ["total"], changedHeap: [1] }),
      step(2, "// قسمة صحيحة: كم علبة كاملة؟ 17 // 5 تعطي 3. كائن جديد، و boxes عليه. الكائن 17 لم يتغيّر.", four.slice(0, 2), [n17, n3], {
        read: ["total"],
        changed: ["boxes"],
        changedHeap: [2],
      }),
      step(3, "% الباقي: ما يبقى خارج العلب. 17 = 3 × 5 + 2، فالباقي 2.", four.slice(0, 3), [n17, n3, n2], {
        read: ["total"],
        changed: ["left"],
        changedHeap: [3],
      }),
      step(4, "/ القسمة العادية تعطي float دائماً: 3.4. حتى 10 / 5 تعطي 2.0 لا 2.", four, [n17, n3, n2, f34], {
        read: ["total"],
        changed: ["avg"],
        changedHeap: [4],
      }),
      step(5, "مع الأعداد، total += 3 اختصار لـ total = total + 3: كائن جديد 20، وتنتقل إليه البطاقة. الكائن 17 لم يبق عليه اسم، فنزيله من الرسم.", after, [n3, n2, f34, n20], {
        read: ["total"],
        changed: ["total"],
        changedHeap: [5],
      }),
      step(6, "مقارنة متسلسلة: 0 < left و left <= 2. القيمتان 0 < 2 و 2 <= 2 صحيحتان، فالنتيجة كائن bool قيمته True.", all, [n3, n2, f34, n20, yes], {
        read: ["left"],
        changed: ["ok"],
        changedHeap: [6],
      }),
      step(7, "الطباعة تتبع الأسهم: 3 علب، وقطعتان باقيتان، والمتوسط 3.4.", all, [n3, n2, f34, n20, yes], {
        read: ["boxes", "left", "avg"],
        output: ["3 2 3.4"],
      }),
      step(8, "total يشير الآن إلى 20. من الدرس القادم سنكتب العدد بجانب اسمه اختصاراً كما يرسم المتتبّع، والسهم إلى الكائن ما زال موجوداً.", all, [n3, n2, f34, n20, yes], {
        read: ["total", "ok"],
        output: ["3 2 3.4", "20 True"],
      }),
    ],
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "تحويل 3725 ثانية إلى ساعات ودقائق وثوانٍ: // تعطي العدد الكامل، و % تعطي ما يبقى للخطوة التالية. راقب كل اسم جديد يظهر.",
    starter: `seconds = 3725
hours = seconds // 3600
rest = seconds % 3600
minutes = rest // 60
secs = rest % 60
print(hours, minutes, secs)
print(2 ** 10, -7 // 2, -7 % 2)`,
    challenges: [
      "غيّر 3725 إلى 7322. توقّع الساعات والدقائق والثواني قبل أن تضغط.",
      "‎-7 // 2 تعطي ‎-4 لا ‎-3. لماذا؟ (// تقرّب نحو الأسفل دائماً.) جرّب ‎7 // -2.",
      "أضف سطراً: print(divmod(seconds, 60)). ماذا تعطي divmod؟",
      "أضف: name = \"\" ثم print(name or \"guest\"). ثم اجعل name = \"Sara\". ماذا تُرجع or؟",
    ],
  },
  predict: [
    {
      question: "ثلاث قسمات على 7 و 2. ماذا يطبع؟",
      lang: "py",
      code: "print(7 / 2, 7 // 2, 7 % 2)",
      options: ["3.5 3 1", "3 3 1", "3.5 3.5 1"],
      answer: 0,
      why: "/ تعطي float دائماً: 3.5. و // عدد العلب الكاملة: 3. و % الباقي: 1.",
    },
    {
      question: "قسمة صحيحة لعدد سالب. ماذا يطبع؟",
      lang: "py",
      code: "print(-7 // 2)",
      options: ["-3", "-4", "-3.5"],
      answer: 1,
      why: "// في بايثون تقرّب نحو الأسفل (floor)، لا نحو الصفر. ‎-3.5 أسفلها ‎-4. ولهذا ‎-7 % 2 تعطي 1: لأن ‎-4 × 2 + 1 = ‎-7.",
    },
    {
      question: "b على قائمة a، ثم += على a. ماذا يطبع؟",
      lang: "py",
      code: `a = [1]
b = a
a += [2]
print(b)`,
      options: ["[1]", "[1, 2]", "خطأ"],
      answer: 1,
      why: "مع الأعداد += تصنع كائناً جديداً لأن العدد لا يتغيّر. أما القائمة فتتغيّر، فـ += عليها تمدّ الكائن نفسه في مكانه. b على الكائن نفسه فترى 2. (a = a + [2] كانت ستصنع قائمة جديدة.)",
    },
  ],
  code: {
    intro: "ترتيب العمليات: ** أولاً (ومن اليمين)، ثم * و / و // و %، ثم + و -، ثم المقارنات، ثم not و and و or. و and و or تُرجعان أحد الطرفين نفسه، لا True أو False بالضرورة. شغّل وجرّب.",
    runnerLang: "py",
    runnerStarter: `print(2 + 3 * 4, (2 + 3) * 4)
print(2 ** 3 ** 2)
print(17 // 5, 17 % 5, divmod(17, 5))
print(1 < 2 < 3, 3 > 2 > 2)
print(0 or "default", 3 and 5)

name = ""
print(name or "guest")
# جرّب: اجعل name = "Sara" وشغّل
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "py",
      title: "الدقائق إلى ساعات",
      prompt: "135 دقيقة: كم ساعة كاملة، وكم دقيقة تبقى؟ رتّب الأسطر حتى يطبع 2 15.",
      lines: ["total = 135", "hours = total // 60", "minutes = total % 60", "print(hours, minutes)"],
      expected: "2 15",
    },
    {
      kind: "fill",
      lang: "py",
      title: "زوجي أم لا؟",
      prompt: "العدد زوجي إذا كان باقي قسمته على 2 صفراً. أي عملية تجعل البرنامج يطبع True؟",
      template: "n = 14\nprint(n ___ 2 == 0)",
      options: ["%", "//", "/"],
      expected: "True",
    },
    {
      kind: "fix",
      lang: "py",
      title: "المتوسط المقطوع",
      prompt: "المتوسط الحقيقي للدرجات 7.666666666666667، لكن البرنامج يطبع 7. أصلح العملية.",
      code: "scores = 7 + 8 + 8\navg = scores // 3\nprint(avg)",
      expected: "7.666666666666667",
      hint: "// تقطع الكسر. أي قسمة تعطي float كاملاً؟",
      solution: `scores = 7 + 8 + 8
avg = scores / 3
print(avg)`,
    },
    {
      kind: "write",
      lang: "py",
      title: "السيارات والرحلة",
      prompt: "23 طالباً، وكل سيارة تتسع لـ 4. اطبع عدد السيارات الممتلئة، ثم عدد الطلاب الباقين، ثم عدد السيارات اللازمة للجميع. يجب أن يظهر 5 ثم 3 ثم 6.",
      starter: "students = 23\nseats = 4\n# اكتب الحل هنا\n",
      expected: "5\n3\n6",
      hint: "students // seats و students % seats. وللسيارات اللازمة: سيارة إضافية إذا بقي طلاب، أو (students + seats - 1) // seats.",
      solution: `students = 23
seats = 4
print(students // seats)
print(students % seats)
print((students + seats - 1) // seats)`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: "print(10 - 2 * 3)",
      options: ["24", "4", "6"],
      answer: 1,
      why: "* قبل -: يُحسب 2 * 3 = 6 أولاً، ثم 10 - 6 = 4.",
    },
    {
      question: "ماذا يطبع؟",
      code: "x = 5\nx += 2\nx *= 3\nprint(x)",
      options: ["21", "11", "15"],
      answer: 0,
      why: "كل سطر يصنع كائناً جديداً وينقل x إليه: 5، ثم 7، ثم 21.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'print(0 or "none", 3 and 5)',
      options: ["False True", "none 5", "none 3"],
      answer: 1,
      why: "or تُرجع أول طرف صادق: 0 كاذب فتُرجع \"none\". و and تُرجع أول طرف كاذب، أو الأخير إن صدق الجميع: 5.",
    },
    {
      question: "ماذا يطبع؟",
      code: "print(1 < 3 < 2)",
      options: ["True", "False", "خطأ"],
      answer: 1,
      why: "المقارنة المتسلسلة تعني 1 < 3 and 3 < 2. الثانية كاذبة، فالنتيجة False. (ليست (1 < 3) < 2.)",
    },
    {
      question: "قارن بالسؤال عن += في التوقّعات. ماذا يطبع؟",
      code: "a = [1]\nb = a\na = a + [2]\nprint(b)",
      options: ["[1]", "[1, 2]", "خطأ"],
      answer: 0,
      why: "a + [2] تصنع قائمة جديدة، و = تنقل a إليها. b ما زالت على القائمة الأولى التي لم يغيّرها أحد.",
    },
  ],
  next: "py-if",
};
