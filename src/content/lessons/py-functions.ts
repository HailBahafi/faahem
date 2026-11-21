import type { Lesson } from "@/lib/types";

export const pyFunctions: Lesson = {
  slug: "py-functions",
  stage: 0,
  number: "1.6",
  title: "الدوال",
  subtitle: "كل استدعاء إطار جديد بأسماء جديدة، تُلصق على الكائنات نفسها",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "النسبة تغيّرت",
    body: "الضريبة في ثلاثة أماكن من البرنامج. غيّر النسبة، ثم أصلح النسخ واحدة واحدة. قارن بالدالة: تعديل واحد يكفي.",
    demo: "pyFunctions",
  },
  scene: {
    trace: "py",
    steps: [],
    code: {
      py: `def add_bonus(marks, extra):
    marks.append(extra)
    extra = 0
    return len(marks)


grades = [70, 85]
bonus = 10
count = add_bonus(grades, bonus)
print(grades, count, bonus)`,
    },
    notes: {
      py: "الاستدعاء يصنع إطاراً جديداً، ويلصق كل معامل (marks و extra) على الكائن الذي أُرسل، دون نسخ. لذلك append على marks تغيّر قائمة grades نفسها، أما extra = 0 فتنقل البطاقة المحلية وحدها. الدالة بلا return تُرجع None.",
    },
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "دالة لها معامل بقيمة افتراضية، تُستدعى ثلاث مرات بثلاث طرق. راقب المكدّس: إطار جديد مع كل استدعاء، ويختفي عند return.",
    starter: `def area(width, height=1):
    result = width * height
    return result


a = area(3, 4)
b = area(5)
c = area(height=2, width=6)
print(a, b, c)`,
    challenges: [
      "توقّع قيمة b قبل أن تضغط: من أين جاء height؟",
      "احذف سطر return result. ماذا تصير a و b و c؟ (الدالة بلا return تُرجع None.)",
      "أضف print(result) في آخر البرنامج. لماذا يظهر NameError؟ result اسم في إطار area، والإطار اختفى.",
      "أضف دالة perimeter(width, height=1) ترجع 2 * (width + height)، واطبع perimeter(3, 4).",
    ],
  },
  predict: [
    {
      question: "الدالة تطبع ولا تُرجع. ماذا يظهر؟",
      lang: "py",
      code: `def greet(name):
    print("hi", name)


x = greet("Sara")
print(x)`,
      options: ["hi Sara ثم None", "hi Sara ثم hi Sara", "hi Sara فقط"],
      answer: 0,
      why: "greet تطبع، لكنها لا تُرجع شيئاً، فيُرجع الاستدعاء None ويُلصق x عليه. الطباعة تُظهر للإنسان، و return تعطي البرنامج قيمة.",
    },
    {
      question: "الدالة تعيد ربط معاملها. ماذا يطبع؟",
      lang: "py",
      code: `def reset(n):
    n = 0


count = 5
reset(count)
print(count)`,
      options: ["0", "5", "None"],
      answer: 1,
      why: "n بطاقة في إطار reset، أُلصقت على الكائن 5 نفسه. n = 0 تنقل n وحدها، وبطاقة count في إطار البرنامج لم تتحرك.",
    },
    {
      question: "الدالة تغيّر الكائن نفسه. ماذا يطبع؟",
      lang: "py",
      code: `def clear(items):
    items.clear()


cart = ["tea", "milk"]
clear(cart)
print(cart)`,
      options: ["['tea', 'milk']", "[]", "None"],
      answer: 1,
      why: "items و cart بطاقتان على القائمة نفسها في الكومة. clear تفرّغ ذلك الكائن، فيراه cart فارغاً بعد عودة الدالة.",
    },
  ],
  code: {
    intro: "دوال صغيرة بأسماء واضحة، وسلسلة توثيق (docstring) تشرح ما تُرجعه، ومعامل بقيمة افتراضية يُمرَّر بالاسم. هكذا يكتبها المحترفون. شغّل، ثم جرّب التعليق.",
    runnerLang: "py",
    runnerStarter: `def average(numbers):
    """Return the mean of a non-empty list of numbers."""
    return sum(numbers) / len(numbers)


def status(score, passing=60):
    """Return "pass" or "fail" for one score."""
    if score >= passing:
        return "pass"
    return "fail"


marks = [72, 45, 90]
print(average(marks))
print(status(45), status(45, passing=40))
# جرّب: اكتب دالة highest(numbers) ترجع أكبر عدد، واطبع highest(marks)
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "py",
      title: "متوسط عددين",
      prompt: "رتّب الأسطر: عرّف الدالة وجسمها المزاح، ثم استدعها خارجها. يجب أن يطبع 8.5.",
      lines: ["def average(a, b):", "    total = a + b", "    return total / 2", "print(average(7, 10))"],
      expected: "8.5",
    },
    {
      kind: "fill",
      lang: "py",
      title: "أعطني النتيجة",
      prompt: "أي كلمة تجعل الدالة تعطي الناتج لمن استدعاها، فيطبع البرنامج 8؟",
      template: "def double(n):\n    ___ n * 2\n\n\nprint(double(4))",
      options: ["return", "print", "n ="],
      expected: "8",
    },
    {
      kind: "fix",
      lang: "py",
      title: "الرسوم التي لا تُجمع",
      prompt: "البرنامج يطبع 15 و 25 ثم يتوقف بخطأ بدل أن يطبع 40. أصلح الدالة.",
      code: "def add_fee(price):\n    print(price + 5)\n\n\ntotal = add_fee(10) + add_fee(20)\nprint(total)",
      expected: "40",
      hint: "الدالة تطبع لكنها تُرجع None، و None + None لا معنى لها. اجعلها تُرجع الناتج.",
      solution: `def add_fee(price):
    return price + 5


total = add_fee(10) + add_fee(20)
print(total)`,
    },
    {
      kind: "write",
      lang: "py",
      title: "عدد الناجحين",
      prompt: "اكتب دالة count_passing(grades, passing=60) تُرجع عدد الدرجات التي تساوي passing أو تزيد. ثم اطبع count_passing([72, 45, 90, 58]) و count_passing([72, 45, 90, 58], passing=50). يجب أن يظهر 2 ثم 3.",
      starter: "# def count_passing(grades, passing=60):\n",
      expected: "2\n3",
      hint: "داخل الدالة: count = 0، ثم for g in grades: و if g >= passing: count += 1، ثم return count.",
      solution: `def count_passing(grades, passing=60):
    count = 0
    for g in grades:
        if g >= passing:
            count += 1
    return count


print(count_passing([72, 45, 90, 58]))
print(count_passing([72, 45, 90, 58], passing=50))`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: "def f(x):\n    x = x + 1\n    return x\n\n\na = 1\nb = f(a)\nprint(a, b)",
      options: ["1 2", "2 2", "1 1"],
      answer: 0,
      why: "x في إطار f أُلصق على 1، ثم x + 1 صنع 2 ونقل x إليه وحده. return أعطت 2 لـ b، و a ما زال على 1.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'def greet(name, greeting="hi"):\n    return greeting + " " + name\n\n\nprint(greet("Sara", "salam"))',
      options: ["hi Sara", "salam Sara", "Sara salam"],
      answer: 1,
      why: "القيمة الافتراضية تُستعمل فقط إذا لم يُرسل شيء. هنا أُرسل \"salam\" في موضع greeting.",
    },
    {
      question: "ماذا يطبع؟",
      code: "def set_total():\n    total = 100\n\n\ntotal = 5\nset_total()\nprint(total)",
      options: ["100", "5", "خطأ"],
      answer: 1,
      why: "total = 100 داخل الدالة تصنع بطاقة جديدة في إطارها هي. بطاقة total في إطار البرنامج مختلفة ولم تتحرّك، والإطار المحلي اختفى عند العودة.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'def add(item, bag):\n    bag.append(item)\n    return bag\n\n\nmine = []\nadd("pen", mine)\nadd("cup", mine)\nprint(mine)',
      options: ["[]", "['cup']", "['pen', 'cup']"],
      answer: 2,
      why: "في كل استدعاء أُلصقت bag على القائمة نفسها التي عليها mine، و append غيّرت ذلك الكائن مرتين.",
    },
    {
      question: "ماذا يطبع؟",
      code: "def show(n):\n    print(n * 2)\n\n\nx = show(3)\nprint(x)",
      options: ["6 ثم 6", "6 ثم None", "None فقط"],
      answer: 1,
      why: "show تطبع 6 أثناء عملها، لكنها لا تُرجع شيئاً، فتُرجع None ويُلصق x عليه.",
    },
  ],
  next: "py-lists",
};
