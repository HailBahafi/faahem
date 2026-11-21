import type { Frame, HeapObj, Lesson, Slot, Step } from "@/lib/types";

// Numbers are written beside their name (the arrow is still there); the list lives on the heap.
const num = (name: string, v: number): Slot => ({ name, value: String(v), type: "number" });
const at = (name: string, id: number): Slot => ({ name, value: "", type: "ref", ref: id });
const main = (...vars: Slot[]): Frame[] => [{ id: 0, name: "البرنامج", vars }];
const step = (line: number | null, say: string, vars: Slot[], extra: Partial<Step> = {}): Step => ({
  line,
  say,
  memory: [],
  frames: main(...vars),
  heap,
  ...extra,
});

const heap: HeapObj[] = [
  {
    id: 1,
    kind: "array",
    items: [72, 45, 90].map((v, i) => ({ name: String(i), value: String(v), type: "number" as const })),
  },
];
const vars = (total: number, g?: number): Slot[] => [at("grades", 1), num("total", total), ...(g === undefined ? [] : [num("g", g)])];

export const pyLoops: Lesson = {
  slug: "py-loops",
  stage: 0,
  number: "1.5",
  title: "الحلقات",
  subtitle: "for تنقل بطاقة واحدة على عناصر القائمة، و while تكرّر ما دام الشرط صادقاً",
  minutes: 17,
  singleLanguage: true,
  problem: {
    title: "سطر لكل طالب؟",
    body: "نريد تحية كل طالب في الصف. أضف طلاباً وراقب الكود اليدوي يطول، بينما تبقى الحلقة سطرين. ثم شغّل الحلقة وراقب البطاقة name تنتقل.",
    demo: "pyLoops",
  },
  scene: {
    code: {
      py: `grades = [72, 45, 90]
total = 0
for g in grades:
    g = g + 5
    total += g
print(grades, total)`,
    },
    notes: {
      py: "for في بايثون تمرّ على عناصر أي مجموعة مباشرة، بلا عدّاد. وإذا احتجت الموقع فاستعمل enumerate(grades)، وللأعداد المتتالية range(n). و while تكرّر ما دام شرطها صادقاً، و break تخرج من الحلقة، و continue تقفز إلى الدورة التالية.",
    },
    steps: [
      step(null, "القائمة في الكومة فيها ثلاث درجات. سنضيف 5 لكل درجة ونجمعها. راقب: هل ستتغيّر القائمة؟", []),
      step(1, "القائمة في الكومة، والبطاقة grades عليها.", [at("grades", 1)], { changed: ["grades"], changedHeap: [1] }),
      step(2, "total يبدأ من 0.", vars(0), { changed: ["total"] }),
      step(3, "for تلصق البطاقة g على أول عنصر في القائمة: الكائن 72 نفسه، لا نسخة منه.", vars(0, 72), { changed: ["g"] }),
      step(4, "g + 5 تصنع كائناً جديداً 77، و = تنقل البطاقة g إليه. العنصر 72 في القائمة لم يتحرّك: g بطاقة، لا خانة في القائمة.", vars(0, 77), {
        read: ["g"],
        changed: ["g"],
      }),
      step(5, "total يصير 77.", vars(77, 77), { read: ["g"], changed: ["total"] }),
      step(3, "نهاية الكتلة المزاحة: نعود إلى رأس الحلقة. البطاقة g تنتقل إلى العنصر التالي: 45.", vars(77, 45), { changed: ["g"] }),
      step(5, "السطر 4 نقل g إلى 50، والسطر 5 أضافه: total يصير 127.", vars(127, 50), { read: ["g"], changed: ["total", "g"] }),
      step(3, "العنصر الأخير: g على 90.", vars(127, 90), { changed: ["g"] }),
      step(5, "g صار 95، و total يصير 222.", vars(222, 95), { read: ["g"], changed: ["total", "g"] }),
      step(3, "لا عناصر أخرى، فتنتهي الحلقة ويقفز التنفيذ إلى أول سطر غير مزاح. البطاقة g تبقى بعد الحلقة على آخر قيمة.", vars(222, 95)),
      step(6, "القائمة كما كانت تماماً: [72, 45, 90]. نقل البطاقة g لا يغيّر القائمة. لتغيير عنصر اكتب في خانته: grades[i] = ...", vars(222, 95), {
        read: ["grades", "total"],
        output: ["[72, 45, 90] 222"],
      }),
    ],
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "حلقة for تجمع الأسعار الكبيرة، ثم حلقة while تعدّ تنازلياً. راقب p تنتقل على عناصر القائمة، و count ينقص حتى يكذب الشرط.",
    starter: `prices = [12, 30, 7, 25]
total = 0
for p in prices:
    if p > 10:
        total += p
print(total)
count = 3
while count > 0:
    print("tick", count)
    count -= 1
print("go")`,
    challenges: [
      "غيّر 10 إلى 20. أي أسعار ستُجمع؟ توقّع المجموع قبل أن تضغط.",
      "أضف break تحت total += p. كم دورة ستعمل الحلقة الآن؟",
      "احذف count -= 1 وشغّل. لماذا يتوقف المتتبّع؟ هذه حلقة لا تنتهي: شرطها لا يكذب أبداً.",
      "استبدل الحلقة الأولى بـ for i in range(len(prices)): واطبع i و prices[i]. ثم جرّب for i, p in enumerate(prices):",
    ],
  },
  predict: [
    {
      question: "نضاعف كل عنصر داخل الحلقة. ماذا يطبع؟",
      lang: "py",
      code: `nums = [1, 2, 3]
for n in nums:
    n = n * 10
print(nums)`,
      options: ["[1, 2, 3]", "[10, 20, 30]", "خطأ"],
      answer: 0,
      why: "n بطاقة تُلصق على كل عنصر بدوره. n * 10 يصنع كائناً جديداً وينقل n إليه، والقائمة لم يلمسها أحد. لتغيير القائمة اكتب nums[i] = ...",
    },
    {
      question: "ماذا تطبع هذه الحلقة؟",
      lang: "py",
      code: `for i in range(3):
    print(i)`,
      options: ["0 و 1 و 2", "1 و 2 و 3", "0 و 1 و 2 و 3"],
      answer: 0,
      why: "range(3) تعطي 3 أعداد تبدأ من 0 وتقف قبل 3. القاعدة: البداية داخلة والنهاية خارجة.",
    },
    {
      question: "while True مع break. ماذا يطبع؟",
      lang: "py",
      code: `n = 0
while True:
    n += 3
    if n > 10:
        break
print(n)`,
      options: ["10", "12", "9"],
      answer: 1,
      why: "n يصير 3 ثم 6 ثم 9 ثم 12. عند 12 يصدق الشرط n > 10، فتخرج break من الحلقة. الفحص بعد الزيادة، فلا تقف عند 9.",
    },
  ],
  code: {
    intro: "الأدوات التي يستعملها المحترف: enumerate للموقع والعنصر معاً، و range بخطوة، و while حين لا تعرف عدد الدورات مسبقاً. شغّل وجرّب.",
    runnerLang: "py",
    runnerStarter: `names = ["Sara", "Omar", "Lina"]
for i, name in enumerate(names, start=1):
    print(i, name)

for n in range(10, 0, -3):
    print(n)

total = 0
n = 1
while total < 20:
    total += n
    n += 1
print(total, n)
# جرّب: أضف داخل الحلقة الأولى if name == "Omar": continue
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "py",
      title: "مجموع 1 إلى 4",
      prompt: "رتّب الأسطر حتى يجمع البرنامج 1 و 2 و 3 و 4 ويطبع 10. انتبه للإزاحة.",
      lines: ["total = 0", "for n in range(1, 5):", "    total += n", "print(total)"],
      expected: "10",
    },
    {
      kind: "fill",
      lang: "py",
      title: "عدّ الزوجي",
      prompt: "نريد عدد الأعداد الزوجية في القائمة. أي عملية تكمل العدّاد فيطبع 2؟",
      template: "count = 0\nfor n in [3, 8, 6, 5]:\n    if n % 2 == 0:\n        count ___ 1\nprint(count)",
      options: ["+=", "=", "-="],
      expected: "2",
    },
    {
      kind: "fix",
      lang: "py",
      title: "الأسعار لم تتضاعف",
      prompt: "أردنا مضاعفة كل سعر في القائمة، لكنها تُطبع كما هي. أصلح الحلقة حتى يطبع [20, 40, 60].",
      code: "prices = [10, 20, 30]\nfor p in prices:\n    p = p * 2\nprint(prices)",
      expected: "[20, 40, 60]",
      hint: "p بطاقة تنتقل، لا خانة في القائمة. استعمل for i, p in enumerate(prices): واكتب في الخانة: prices[i] = p * 2",
      solution: `prices = [10, 20, 30]
for i, p in enumerate(prices):
    prices[i] = p * 2
print(prices)`,
    },
    {
      kind: "write",
      lang: "py",
      title: "أول درجة حرارة عالية",
      prompt: "في القائمة [31, 38, 44, 29, 47]: اطبع أول درجة تزيد على 40 ثم أوقف الحلقة، وبعد الحلقة اطبع done. يجب أن يظهر 44 ثم done.",
      starter: "temps = [31, 38, 44, 29, 47]\n# اكتب الحلقة هنا\n",
      expected: "44\ndone",
      hint: "for t in temps: وفيها if t > 40: ثم print(t) و break. و print(\"done\") بعد الحلقة بلا إزاحة.",
      solution: `temps = [31, 38, 44, 29, 47]
for t in temps:
    if t > 40:
        print(t)
        break
print("done")`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: 'for i in range(2, 8, 2):\n    print(i, end=" ")',
      options: ["2 4 6", "2 4 6 8", "2 3 4 5 6 7"],
      answer: 0,
      why: "range(2, 8, 2): ابدأ من 2، وزد 2 كل مرة، وقف قبل 8. فتعطي 2 و 4 و 6.",
    },
    {
      question: "ماذا يطبع؟",
      code: "x = 0\nwhile x < 5:\n    x += 2\nprint(x)",
      options: ["4", "5", "6"],
      answer: 2,
      why: "x: 0 ثم 2 ثم 4 ثم 6. الشرط يُفحص قبل كل دورة: 4 < 5 صادق فيزيد إلى 6، ثم 6 < 5 كاذب فتنتهي الحلقة.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'for c in "abc":\n    last = c\nprint(last)',
      options: ["a", "c", "خطأ: last غير معرّف"],
      answer: 1,
      why: "النص مجموعة حروف، والحلقة تمرّ عليها. كل دورة تنقل last إلى الحرف الحالي، فتبقى على c بعد الحلقة. الأسماء التي تُنشأ في الحلقة تبقى بعدها.",
    },
    {
      question: "ماذا يطبع؟",
      code: "total = 0\nfor n in [1, 2, 3, 4]:\n    if n == 3:\n        continue\n    total += n\nprint(total)",
      options: ["10", "7", "3"],
      answer: 1,
      why: "continue تقفز فوق بقية الدورة الحالية إلى الدورة التالية. فيُجمع 1 و 2 و 4 فقط: 7.",
    },
    {
      question: "ماذا يطبع؟",
      code: "items = [1, 2]\nfor x in items:\n    x = 0\nprint(items)",
      options: ["[1, 2]", "[0, 0]", "[0, 2]"],
      answer: 0,
      why: "x = 0 تنقل البطاقة x إلى الكائن 0، ولا تكتب في خانات القائمة. القائمة لم تتغيّر.",
    },
  ],
  next: "py-functions",
};
