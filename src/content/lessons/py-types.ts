import type { Frame, HeapObj, Lesson, Slot, Step, ValType } from "@/lib/types";

// The type lives on the object, not on the name: every heap card shows its object's type.
const at = (name: string, id: number): Slot => ({ name, value: "", type: "ref", ref: id });
const obj = (id: number, type: string, value: string, kind: ValType): HeapObj => ({
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

const n42 = obj(1, "int", "42", "number");
const s42 = obj(2, "str", '"42"', "string");
const parsed = obj(3, "int", "42", "number");
const n43 = obj(4, "int", "43", "number");
const twice = obj(5, "str", '"4242"', "string");
const out4 = ["<class 'int'>", "<class 'str'>", "43 4242", "0.30000000000000004"];

export const pyTypes: Lesson = {
  slug: "py-types",
  stage: 0,
  number: "1.2",
  title: "الأنواع",
  subtitle: "النوع يسكن في الكائن، وهو الذي يقرّر معنى كل عملية",
  minutes: 15,
  singleLanguage: true,
  problem: {
    title: "الاسم نفسه، والمعنى مختلف",
    body: "اربط البطاقة x بكائن، وانظر ماذا تعطي x + 1 و x * 2. جرّب ثلاثة كائنات على الأقل.",
    demo: "pyTypes",
  },
  scene: {
    code: {
      py: `x = 42
print(type(x))
x = "42"
print(type(x))
y = int(x) + 1
z = x * 2
print(y, z)
print(0.1 + 0.2)`,
    },
    notes: {
      py: "النوع صفة الكائن لا الاسم: type(x) تسأل الكائن الذي تشير إليه x الآن. وتلميحات الأنواع مثل age: int (ستراها لاحقاً) لا تغيّر هذا؛ بايثون لا تفحصها وقت التشغيل، والأدوات مثل mypy هي التي تقرؤها.",
    },
    steps: [
      step(null, "كل كائن في الكومة يحمل نوعه معه. الاسم لا نوع له: هو بطاقة يمكن نقلها إلى أي كائن.", [], []),
      step(1, "كائن نوعه int وقيمته 42، والبطاقة x عليه. الأعداد الصحيحة في بايثون لا حدّ لحجمها: 2 ** 100 تعمل بلا مشكلة.", [at("x", 1)], [n42], {
        changed: ["x"],
        changedHeap: [1],
      }),
      step(2, "type(x) لا تسأل الاسم؛ تتبع السهم وتقرأ نوع الكائن: int.", [at("x", 1)], [n42], { read: ["x"], output: out4.slice(0, 1) }),
      step(3, "\"42\" بين علامتي تنصيص: كائن جديد نوعه str. تنتقل إليه x. الكائن 42 لم يعد يصل إليه أي اسم، فنزيله من الرسم.", [at("x", 2)], [s42], {
        changed: ["x"],
        changedHeap: [2],
        output: out4.slice(0, 1),
      }),
      step(4, "الاسم نفسه، والجواب تغيّر: النوع ليس صفة x، بل صفة الكائن الذي تشير إليه الآن.", [at("x", 2)], [s42], { read: ["x"], output: out4.slice(0, 2) }),
      step(5, "\"42\" + 1 كانت ستوقف البرنامج بخطأ TypeError: بايثون لا تخمّن. لذلك نحوّل صراحة: int(x) تقرأ أرقام النص وتصنع كائن int جديداً. النص نفسه لا يتغيّر.", [at("x", 2)], [s42, parsed], {
        read: ["x"],
        changedHeap: [3],
        output: out4.slice(0, 2),
      }),
      step(5, "ثم + 1 بين عددين: كائن جديد 43، والبطاقة y عليه. الكائن المؤقت 42 لم يأخذ اسماً، فيختفي.", [at("x", 2), at("y", 4)], [s42, n43], {
        changed: ["y"],
        changedHeap: [4],
        output: out4.slice(0, 2),
      }),
      step(6, "النوع يقرّر معنى العملية: * بين نص وعدد تعني التكرار. النتيجة نص جديد \"4242\"، لا 84.", [at("x", 2), at("y", 4), at("z", 5)], [s42, n43, twice], {
        read: ["x"],
        changed: ["z"],
        changedHeap: [5],
        output: out4.slice(0, 2),
      }),
      step(7, "الطباعة تتبع السهمين: 43 عدد، و 4242 نص. على الشاشة يبدوان متشابهين، لكن نوعيهما مختلفان.", [at("x", 2), at("y", 4), at("z", 5)], [s42, n43, twice], {
        read: ["y", "z"],
        output: out4.slice(0, 3),
      }),
      step(8, "float تُخزَّن بالنظام الثنائي، و 0.1 لا تُكتب فيه بالضبط، فيظهر خطأ صغير في آخر الأرقام. للمال استعمل أعداداً صحيحة (بالهللة) أو الوحدة decimal.", [at("x", 2), at("y", 4), at("z", 5)], [s42, n43, twice], {
        output: out4,
      }),
    ],
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "هنا نصّ يأتي من المستخدم ويتحوّل إلى عدد. راقب قيمة age: مرة بين علامتي تنصيص (str) ومرة بدونها (int). كل تحويل يصنع كائناً جديداً وينقل البطاقة إليه.",
    starter: `age = "19"
print(type(age))
age = int(age)
print(type(age), age + 1)
price = 9.99
print(int(price), round(price))
adult = age >= 18
print(type(adult), adult)
print(True + True)`,
    challenges: [
      "احذف السطر 3 (age = int(age)) وتوقّع: في أي سطر سيتوقف البرنامج، وبأي خطأ؟",
      "int(9.99) و round(9.99): توقّع الناتجين قبل أن تضغط. أيهما يقطع وأيهما يقرّب؟",
      "غيّر \"19\" إلى \"nineteen\". ما الخطأ الذي يظهر؟ int لا تفهم إلا أرقاماً.",
      "لماذا True + True تعطي 2؟ (bool نوع فرعي من int: True تساوي 1.) جرّب True * 10.",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `a = "5"
b = 5
print(a + a, b + b)`,
      options: ["55 10", "10 10", "55 55"],
      answer: 0,
      why: "a تشير إلى كائن str، فـ + تلصق النصين: \"55\". و b تشير إلى int، فـ + تجمع: 10. العملية واحدة والمعنى من نوع الكائن.",
    },
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `x = "3"
print(x * 3)`,
      options: ["9", "333", "خطأ"],
      answer: 1,
      why: "x نص، و * بين نص وعدد تعني «كرّر النص». النتيجة \"333\". لو أردت 9 فحوّل أولاً: int(x) * 3.",
    },
    {
      question: "وهذا؟",
      lang: "py",
      code: `count = "5"
print(count + 5)`,
      options: ["55", "10", "خطأ TypeError"],
      answer: 2,
      why: "بايثون قويّة الأنواع: لا تحوّل النص إلى عدد ولا العدد إلى نص من تلقاء نفسها. نص + عدد لا معنى له، فيتوقف البرنامج بـ TypeError. التحويل قرارك: int(count) + 5 أو count + str(5).",
    },
  ],
  code: {
    intro: "الأنواع الأساسية: int و float و str و bool و NoneType. ودوال التحويل int و float و str و bool تصنع كائناً جديداً من النوع المطلوب. شغّل، ثم جرّب التعليق.",
    runnerLang: "py",
    runnerStarter: `print(type(10), type(10.0), type("10"))
print(type(True), type(None))
print(int("10") + 5)
print(float("2.5") * 2)
print(str(10) + "5")
print(bool(0), bool(""), bool("0"))
print(2 ** 100)
# جرّب: print(int("ten")) واقرأ رسالة الخطأ
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "py",
      title: "من نص إلى عدد",
      prompt: "رتّب الأسطر: النص \"41\" يتحوّل إلى عدد، يزيد واحداً، ثم يُطبع هو واسم نوعه. يجب أن يظهر 42 ثم int.",
      lines: ['text = "41"', "n = int(text)", "n = n + 1", "print(n)", "print(type(n).__name__)"],
      expected: "42\nint",
    },
    {
      kind: "fill",
      lang: "py",
      title: "الجمع الصحيح",
      prompt: "a نص و b عدد. أي تعبير يطبع 6؟",
      template: 'a = "4"\nb = 2\nprint(___)',
      options: ["a + b", "int(a) + b", "a * b"],
      expected: "6",
    },
    {
      kind: "fix",
      lang: "py",
      title: "العمر في السنة القادمة",
      prompt: "العمر وصل نصاً من نموذج تسجيل، والبرنامج يتوقف بخطأ. أصلحه حتى يطبع 18.",
      code: 'age = "17"\nnext_year = age + 1\nprint(next_year)',
      expected: "18",
      hint: "age تشير إلى كائن str. حوّله إلى int قبل الجمع.",
      solution: `age = "17"
next_year = int(age) + 1
print(next_year)`,
    },
    {
      kind: "write",
      lang: "py",
      title: "سعر الطلب",
      prompt: "السعر وصل نصاً \"12.5\" والكمية عدد 4. احسب الإجمالي واطبعه (50.0)، ثم اطبع اسم نوعه (float).",
      starter: 'price = "12.5"\nqty = 4\n# اكتب الحل هنا\n',
      expected: "50.0\nfloat",
      hint: "float(price) تصنع عدداً عشرياً من النص. واسم النوع: type(total).__name__.",
      solution: `price = "12.5"
qty = 4
total = float(price) * qty
print(total)
print(type(total).__name__)`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: "print(True + True)",
      options: ["2", "TrueTrue", "خطأ"],
      answer: 0,
      why: "bool نوع فرعي من int: True كائن قيمته العددية 1. لذلك True + True تساوي 2.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'x = 10\nx = "ten"\nprint(type(x).__name__)',
      options: ["int", "str", "خطأ: x عدد"],
      answer: 1,
      why: "الاسم لا نوع له. السطر 2 نقل البطاقة x إلى كائن str، و type تسأل الكائن الحالي.",
    },
    {
      question: "ماذا يطبع؟",
      code: "print(int(3.9))",
      options: ["4", "3", "3.9"],
      answer: 1,
      why: "int تقطع الجزء العشري ولا تقرّب: 3.9 تصير 3. للتقريب استعمل round(3.9) فتعطي 4.",
    },
    {
      question: "ماذا يطبع؟",
      code: "print(0.1 + 0.2 == 0.3)",
      options: ["True", "False", "خطأ"],
      answer: 1,
      why: "float ثنائية: 0.1 + 0.2 تعطي 0.30000000000000004، وهي لا تساوي 0.3 تماماً. قارن الأعداد العشرية بـ math.isclose.",
    },
    {
      question: "ماذا يطبع؟",
      code: "r = 10 / 5\nprint(r, type(r).__name__)",
      options: ["2 int", "2.0 float", "2.0 int"],
      answer: 1,
      why: "/ في بايثون تعطي دائماً كائن float، حتى لو كانت القسمة بلا باقٍ. لقسمة صحيحة استعمل //.",
    },
  ],
  next: "py-operators",
};
