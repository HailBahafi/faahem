import type { Lesson } from "@/lib/types";

export const pyTuples: Lesson = {
  slug: "py-tuples",
  stage: 0,
  number: "1.8",
  title: "tuples",
  subtitle: "tuple تسلسل مختوم: خاناته لا تتغير بعد بنائه، فإن أردت قيمة أخرى بنيت tuple جديداً",
  minutes: 15,
  singleLanguage: true,
  problem: {
    title: "إحداثيات لا يجب أن تتحرك",
    body: "موقع متجر محفوظ مرتين: في قائمة وفي tuple. دالة فيها خطأ تحاول تعديل الموقع. أيهما يحميك؟",
    demo: "pyTuples",
  },
  scene: {
    trace: "py",
    steps: [],
    code: {
      py: `point = (3, 4)
x, y = point
x, y = y, x
moved = (point[0] + 1, point[1])
print(point, moved)
print(x, y)
pair = ("Sara", [90])
pair[1].append(85)
print(pair)`,
    },
    notes: {
      py: "الفاصلة هي التي تصنع tuple لا الأقواس: point = 3, 4 تعطي tuple أيضاً. وx, y = y, x تبني tuple مؤقتاً من اليمين أولاً ثم تفكّه في الاسمين، لذلك يتبادلان دون متغير ثالث.",
    },
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "دالة ترجع قيمتين. في الحقيقة ترجع كائناً واحداً: tuple. راقب الكومة: متى يُبنى، ومتى يُفكّ إلى اسمين؟",
    starter: `def min_max(nums):
    return min(nums), max(nums)


low, high = min_max([7, 2, 9, 4])
print(low, high)
result = min_max([5, 1])
print(result, type(result).__name__)`,
    challenges: [
      "أضف في النهاية: result[0] = 0. ماذا يقول الخطأ؟ ولماذا لم يقله مع القائمة في الدرس السابق؟",
      "بدّل قيمتي low و high بسطر واحد: low, high = high, low. تتبّع الكومة: ما الكائن المؤقت الذي ظهر؟",
      "اكتب single = (5) ثم print(type(single).__name__). ثم جرّب (5,)‎. ما الفرق؟",
      "اجعل الدالة ترجع ثلاث قيم بإضافة sum(nums)‎، ثم أصلح سطر low, high حتى يعمل.",
    ],
  },
  predict: [
    {
      question: "ماذا يحدث؟",
      lang: "py",
      code: `t = (1, 2, 3)
t[0] = 9
print(t)`,
      options: ["TypeError: لا يمكن تعديل خانة في tuple", "يطبع (9, 2, 3)", "يطبع (1, 2, 3)"],
      answer: 0,
      why: "tuple مختوم بعد بنائه: لا تُضاف إليه خانة ولا تتغير خانة فيه. Python ترفض السطر الثاني فوراً، فلا يصل البرنامج إلى print.",
    },
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `x = (5)
y = (5,)
print(type(x).__name__, type(y).__name__)`,
      options: ["int tuple", "tuple tuple", "int int"],
      answer: 0,
      why: "الأقواس وحدها مجرد تجميع لتعبير، مثل (2 + 3). الفاصلة هي التي تصنع tuple، لذلك tuple بعنصر واحد يُكتب (5,)‎.",
    },
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `a = 1
b = 2
a, b = b, a
print(a, b)`,
      options: ["2 1", "2 2", "1 1"],
      answer: 0,
      why: "اليمين يُحسب كاملاً أولاً: يُبنى tuple (2, 1) من القيم الحالية. بعدها فقط يُفكّ في a ثم b. لا أحد يُكتب فوقه قبل أن يُقرأ.",
    },
  ],
  code: {
    intro: "يستعمل المحترفون tuple لكل مجموعة صغيرة ثابتة المعنى: نقطة (x, y)، سجل (name, score)، أو قيمتان ترجعهما دالة مثل divmod. وتفكيكه في حلقة for يجعل الكود يُقرأ كجملة.",
    runnerLang: "py",
    runnerStarter: `students = [("Sara", 92), ("Omar", 78), ("Huda", 85)]

for name, score in students:
    print(f"{name}: {score}")

best_name, best_score = students[0]
for name, score in students:
    if score > best_score:
        best_name, best_score = name, score
print("best:", best_name, best_score)

minutes, seconds = divmod(135, 60)
print(f"{minutes} min {seconds} s")
# Try: students[0][1] = 100 and read the error, then build a new tuple instead
`,
  },
  exercises: [
    {
      kind: "order",
      title: "تقسيم الوقت",
      lang: "py",
      prompt: "رتّب الأسطر: دالة ترجع الدقائق والثواني معاً، ثم نفكّ النتيجة ونطبعها.",
      lines: [
        "def split_time(total):",
        "    return total // 60, total % 60",
        "minutes, seconds = split_time(135)",
        "print(minutes, seconds)",
      ],
      expected: "2 15",
    },
    {
      kind: "fill",
      title: "تبادل بسطر واحد",
      lang: "py",
      prompt: "أكمل السطر حتى تتبادل القيمتان.",
      template: "a, b = 3, 8\na, b = ___\nprint(a, b)",
      options: ["b, a", "a, b", "b, b"],
      expected: "8 3",
    },
    {
      kind: "fix",
      title: "لون لا يتغير",
      lang: "py",
      prompt: "نريد ألواناً جديدة: الأول كما هو والثاني blue. البرنامج يتوقف بخطأ. أصلحه ببناء tuple جديد.",
      code: 'colors = ("red", "green")\ncolors[1] = "blue"\nprint(colors)',
      expected: "('red', 'blue')",
      hint: "لا تعدّل الخانة. ابنِ tuple جديداً من colors[0] و \"blue\" وانقل الاسم colors إليه.",
      solution: 'colors = ("red", "green")\ncolors = (colors[0], "blue")\nprint(colors)',
    },
    {
      kind: "write",
      title: "ثلاث قيم في رجعة واحدة",
      lang: "py",
      prompt: "اكتب stats(nums) التي ترجع أصغر قيمة وأكبر قيمة والمتوسط معاً. فكّ النتيجة لـ [4, 8, 6] في ثلاثة أسماء واطبعها في سطر واحد.",
      starter: "# write stats(nums) that returns (smallest, largest, average)\n",
      expected: "4 8 6.0",
      hint: "return min(nums), max(nums), sum(nums) / len(nums) ثم low, high, avg = stats([4, 8, 6])",
      solution: "def stats(nums):\n    return min(nums), max(nums), sum(nums) / len(nums)\n\n\nlow, high, avg = stats([4, 8, 6])\nprint(low, high, avg)",
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: "t = (1, 2)\nu = t + (3,)\nprint(t, u)",
      options: ["(1, 2) (1, 2, 3)", "(1, 2, 3) (1, 2, 3)", "خطأ: tuple لا يتغير"],
      answer: 0,
      why: "+ لا تلمس t؛ تبني tuple جديداً فيه خانات t ثم 3، ويُلصق عليه الاسم u. t المختوم بقي كما هو.",
    },
    {
      question: "ماذا يطبع؟",
      code: "pair = ([1], 2)\npair[0].append(5)\nprint(pair)",
      options: ["([1, 5], 2)", "TypeError", "([1], 2)"],
      answer: 0,
      why: "الختم على خانات tuple: الخانة 0 ستبقى تشير إلى تلك القائمة نفسها. لكن القائمة كائن قابل للتغيير، وappend تغيّرها في مكانها دون أن تمسّ الخانة.",
    },
    {
      question: "ماذا يطبع؟",
      code: "first, *rest = (1, 2, 3)\nprint(first, rest)",
      options: ["1 [2, 3]", "1 (2, 3)", "خطأ: عدد الأسماء لا يساوي العناصر"],
      answer: 0,
      why: "النجمة تجمع ما تبقى بعد first. وتجمعه دائماً في قائمة جديدة، حتى لو كان المصدر tuple.",
    },
    {
      question: "ماذا يطبع؟",
      code: "point = 3, 4\nprint(type(point).__name__, len(point))",
      options: ["tuple 2", "int 1", "خطأ"],
      answer: 0,
      why: "الفاصلة تبني tuple حتى بلا أقواس. هذا ما يحدث أيضاً في return a, b: ترجع الدالة tuple واحداً.",
    },
    {
      question: "أين يتوقف هذا البرنامج؟",
      code: 'places = {}\nplaces[(24, 46)] = "Riyadh"\nplaces[[21, 39]] = "Jeddah"\nprint(places)',
      options: ["في السطر الثالث: TypeError لأن القائمة لا تصلح مفتاحاً", "في السطر الثاني", "لا يتوقف، يطبع المكانين"],
      answer: 0,
      why: "مفتاح القاموس يجب ألا يتغير أبداً، لأن مكانه محسوب من قيمته. tuple من أرقام مختوم فيصلح، والقائمة قد تتغير فترفضها Python (unhashable type: 'list').",
    },
  ],
  next: "py-dicts",
};
