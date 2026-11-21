import type { Lesson } from "@/lib/types";

export const pyLists: Lesson = {
  slug: "py-lists",
  stage: 0,
  number: "1.7",
  title: "القوائم",
  subtitle: "القائمة كائن واحد في الكومة، خاناته مراجع إلى كائنات أخرى، ويمكن تغييره في مكانه",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "قائمة واحدة باسمين",
    body: "شاركت قائمة أغانيك مع صديقك. اختر طريقة المشاركة، ثم دع صديقك يضيف أغنية. هل تغيّرت قائمتك أنت؟",
    demo: "pyLists",
  },
  scene: {
    trace: "py",
    steps: [],
    code: {
      py: `scores = [70, 85]
backup = scores
scores.append(90)
print(backup)
backup = scores.copy()
scores[0] = 75
print(scores, backup)
print(len(scores), scores[-1])`,
    },
    notes: {
      py: "القائمة لا تحفظ الأرقام داخلها، بل تحفظ في كل خانة مرجعاً إلى كائن. لذلك backup = scores لا تنسخ شيئاً: تلصق اسماً ثانياً على القائمة نفسها. أما scores.copy()‎ فتبني قائمة جديدة، خاناتها تشير إلى الكائنات نفسها (نسخة سطحية).",
    },
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "سلة مشتريات باسمين. راقب الكومة على اليمين: كم قائمة توجد فعلاً، وأي اسم يشير إلى أيها بعد كل سطر؟",
    starter: `cart = ["milk", "bread"]
saved = cart
cart.append("eggs")
print(saved)
cart = cart + ["tea"]
print(cart)
print(saved)`,
    challenges: [
      "قبل أن تشغّل: كم قائمة ستكون في الكومة في النهاية؟ شغّل وتحقق.",
      "استبدل cart = cart + [\"tea\"] بـ cart += [\"tea\"]. هل يرى saved الشاي الآن؟ لماذا تختلف += عن + مع القوائم؟",
      "غيّر السطر الثاني إلى saved = cart.copy()‎. ماذا يطبع print(saved) الأول؟",
      "أضف في النهاية: last = cart.pop() ثم print(last, cart). ماذا أخرجت pop، ومن أي طرف؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      lang: "py",
      code: `a = [1, 2, 3]
b = a
b.append(4)
print(len(a))`,
      options: ["4", "3", "خطأ: a لم يتغير"],
      answer: 0,
      why: "b = a لم تبنِ قائمة ثانية؛ ألصقت اسماً ثانياً على القائمة نفسها. append عبر b غيّرت ذلك الكائن الوحيد، وa يشير إليه أيضاً.",
    },
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `nums = [3, 1, 2]
result = nums.sort()
print(result)`,
      options: ["None", "[1, 2, 3]", "[3, 1, 2]"],
      answer: 0,
      why: "sort ترتّب القائمة في مكانها ولا تبني قائمة جديدة، فترجع None. إن أردت قائمة مرتّبة جديدة وتبقى الأصلية كما هي فاستعمل sorted(nums).",
    },
    {
      question: "نسخنا قائمة داخلها قوائم. ماذا يطبع؟",
      lang: "py",
      code: `grid = [[0, 0], [0, 0]]
twin = grid.copy()
twin[0][0] = 9
print(grid[0][0])`,
      options: ["9", "0", "خطأ"],
      answer: 0,
      why: "copy بنت قائمة خارجية جديدة، لكن خاناتها تشير إلى الصفوف الداخلية نفسها. twin[0] و grid[0] كائن واحد، فالتعديل يظهر من الاسمين. هذه نسخة سطحية.",
    },
  ],
  code: {
    intro: "القوائم هي البنية التي ستستعملها أكثر من غيرها في Python: قائمة مهام، صفوف ملف، نتائج بحث. هنا قائمة مهام حقيقية: تضيف في الآخر بـ append، وفي أي مكان بـ insert، وتُخرج بـ pop، وتقطع جزءاً بالشرائح [:2]، وتمرّ عليها مع أرقامها بـ enumerate.",
    runnerLang: "py",
    runnerStarter: `tasks = ["write report", "call Sara"]
tasks.append("buy milk")
tasks.insert(0, "check email")
done = tasks.pop(1)
print("done:", done)
print("left:", tasks)
print("count:", len(tasks))
print("first two:", tasks[:2])

for number, task in enumerate(tasks, start=1):
    print(number, task)

# Try: remove "call Sara" with tasks.remove(...), then print tasks again
`,
  },
  exercises: [
    {
      kind: "order",
      title: "ترتيب الدرجات",
      lang: "py",
      prompt: "رتّب الأسطر حتى يطبع البرنامج الدرجات مرتّبة، ثم أعلاها.",
      lines: ["scores = [80, 95]", "scores.append(70)", "scores.sort()", "print(scores)", "print(scores[-1])"],
      expected: "[70, 80, 95]\n95",
    },
    {
      kind: "fill",
      title: "نسخة مستقلة",
      lang: "py",
      prompt: "أي تعبير يجعل b قائمة مستقلة، فلا يتأثر a حين نضيف إلى b؟",
      template: "a = [1, 2]\nb = ___\nb.append(3)\nprint(a, b)",
      options: ["a", "a.copy()", "a.append(3)"],
      expected: "[1, 2] [1, 2, 3]",
    },
    {
      kind: "fix",
      title: "الترتيب أفسد الأصل",
      lang: "py",
      prompt: "نريد نسخة مرتّبة ونُبقي الأصل كما جاء. لكن الأصل تغيّر أيضاً. أصلحه.",
      code: "original = [3, 1, 2]\nordered = original\nordered.sort()\nprint(original, ordered)",
      expected: "[3, 1, 2] [1, 2, 3]",
      hint: "ordered = original تلصق اسماً ثانياً على القائمة نفسها. sorted(original) تبني قائمة جديدة مرتّبة.",
      solution: "original = [3, 1, 2]\nordered = sorted(original)\nprint(original, ordered)",
    },
    {
      kind: "write",
      title: "الأيام الحارة",
      lang: "py",
      prompt: "عندك temps = [30, 35, 28, 41, 33]. ابنِ قائمة جديدة hot فيها كل درجة أعلى من 32 بحلقة و append، ثم اطبع hot ثم عددها.",
      starter: "temps = [30, 35, 28, 41, 33]\n# build hot with a loop and append\n",
      expected: "[35, 41, 33]\n3",
      hint: "hot = [] ثم for t in temps: if t > 32: hot.append(t)",
      solution: "temps = [30, 35, 28, 41, 33]\nhot = []\nfor t in temps:\n    if t > 32:\n        hot.append(t)\nprint(hot)\nprint(len(hot))",
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: "a = [1, 2]\nb = a\na = a + [3]\nprint(b)",
      options: ["[1, 2]", "[1, 2, 3]", "[3]"],
      answer: 0,
      why: "a + [3] تبني قائمة جديدة، ثم ينتقل الاسم a إليها. b ما زال ملصقاً على القائمة القديمة التي لم يلمسها أحد.",
    },
    {
      question: "والآن مع += بدل +. ماذا يطبع؟",
      code: "a = [1, 2]\nb = a\na += [3]\nprint(b)",
      options: ["[1, 2, 3]", "[1, 2]", "خطأ"],
      answer: 0,
      why: "مع القوائم، += تمدّ القائمة في مكانها (مثل extend) ولا تبني كائناً جديداً. a و b ما زالا على الكائن نفسه، فيرى b الإضافة.",
    },
    {
      question: "ماذا يطبع؟",
      code: "rows = [[0] * 2] * 2\nrows[0][0] = 1\nprint(rows)",
      options: ["[[1, 0], [1, 0]]", "[[1, 0], [0, 0]]", "[[1, 1], [0, 0]]"],
      answer: 0,
      why: "‎* 2 على القائمة الخارجية تكرّر المرجع نفسه مرتين: خانتان تشيران إلى صف واحد. التعديل عبر rows[0] يظهر في rows[1] لأنهما الكائن نفسه.",
    },
    {
      question: "ماذا يطبع؟",
      code: "nums = [10, 20, 30, 40]\nprint(nums[1:3], nums[-1])",
      options: ["[20, 30] 40", "[10, 20, 30] 40", "[20, 30, 40] 10"],
      answer: 0,
      why: "الشريحة [1:3] تبدأ من الخانة 1 وتتوقف قبل 3، فتأخذ 20 و 30 في قائمة جديدة. والفهرس -1 يعدّ من الآخر.",
    },
    {
      question: "ماذا يطبع؟",
      code: "def add_bonus(scores):\n    scores.append(5)\n\n\nmarks = [90]\nadd_bonus(marks)\nprint(marks)",
      options: ["[90, 5]", "[90]", "None"],
      answer: 0,
      why: "عند الاستدعاء صار scores اسماً ثانياً للقائمة نفسها التي يشير إليها marks. append غيّرت ذلك الكائن، فبقي التغيير بعد انتهاء الدالة.",
    },
  ],
  next: "py-tuples",
};
