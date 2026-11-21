import type { Frame, HeapObj, Lesson, Slot, Step } from "@/lib/types";

// From here on, numbers and strings are written beside their name (the tracer's shortcut); lists stay on the heap.
const num = (name: string, v: number): Slot => ({ name, value: String(v), type: "number" });
const str = (name: string, v: string): Slot => ({ name, value: `"${v}"`, type: "string" });
const at = (name: string, id: number): Slot => ({ name, value: "", type: "ref", ref: id });
const main = (...vars: Slot[]): Frame[] => [{ id: 0, name: "البرنامج", vars }];
const step = (line: number | null, say: string, vars: Slot[], heap: HeapObj[], extra: Partial<Step> = {}): Step => ({
  line,
  say,
  memory: [],
  frames: main(...vars),
  heap,
  ...extra,
});

const cart: HeapObj = { id: 1, kind: "array", items: [] };
const base = [num("grade", 72), at("cart", 1)];
const done = [...base, str("label", "B")];

export const pyIf: Lesson = {
  slug: "py-if",
  stage: 0,
  number: "1.4",
  title: "الشروط",
  subtitle: "الشرط يُحسب إلى كائن، والإزاحة تحدّد ما يُنفَّذ وما يُتخطّى",
  minutes: 15,
  singleLanguage: true,
  problem: {
    title: "أي تقدير يستحق؟",
    body: "حرّك الدرجة وراقب أي سطر ينفّذ. ثم بدّل إلى «الترتيب المقلوب» وأعطِ الطالب 95. ماذا حدث؟",
    demo: "pyIf",
  },
  scene: {
    code: {
      py: `grade = 72
cart = []
if grade >= 90:
    label = "A"
elif grade >= 70:
    label = "B"
else:
    label = "C"
if not cart:
    print(label, "cart is empty")`,
    },
    notes: {
      py: "بايثون لا تستعمل الأقواس المعقوفة: الكتلة هي الأسطر المزاحة بأربع مسافات بعد النقطتين. و elif اختصار else if. والقيم الكاذبة (falsy): False و None و 0 و 0.0 و \"\" والقوائم والقواميس الفارغة؛ كل ما سواها صادق.",
    },
    steps: [
      step(
        null,
        "من هذا الدرس نكتب العدد أو النص بجانب اسمه اختصاراً، كما يرسم المتتبّع؛ في الحقيقة ما زال الاسم يشير بسهم إلى كائن. القوائم تبقى في الكومة.",
        [],
        [],
      ),
      step(1, "grade يشير إلى 72.", [num("grade", 72)], [], { changed: ["grade"] }),
      step(2, "قائمة فارغة في الكومة، والبطاقة cart عليها.", base, [cart], { changed: ["cart"], changedHeap: [1] }),
      step(3, "يُحسب الشرط أولاً: 72 >= 90 تعطي كائناً قيمته False. فتُتخطّى الكتلة المزاحة تحت if كلها، ويقفز التنفيذ إلى elif.", base, [cart], { read: ["grade"] }),
      step(5, "الشرط الثاني: 72 >= 70 تعطي True. ندخل كتلته. وبمجرد أن ينفَّذ فرع واحد، تُتخطّى بقية السلسلة كلها.", base, [cart], { read: ["grade"] }),
      step(6, "label يشير إلى \"B\". بعد هذا السطر يقفز التنفيذ فوق else وكتلتها إلى السطر 9. السطر 8 لا يعمل أبداً في هذا التشغيل.", done, [cart], { changed: ["label"] }),
      step(9, "if جديدة مستقلة عن السلسلة الأولى. not cart: القائمة الفارغة كاذبة (falsy)، فـ not cart تعطي True. هكذا يسأل المحترف «هل القائمة فارغة؟».", done, [cart], { read: ["cart"] }),
      step(10, "الشرط صادق، فينفَّذ السطر المزاح تحته.", done, [cart], { read: ["label"], output: ["B cart is empty"] }),
    ],
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "سلسلة شروط ثم شرط على نص. راقب الخطوات: أي الأسطر يزورها التنفيذ، وأيها يقفز فوقها؟",
    starter: `temp = 38
raining = False
if temp >= 40:
    advice = "stay inside"
elif temp >= 30 and not raining:
    advice = "drink water"
else:
    advice = "enjoy"
print(advice)
name = ""
if name:
    print("hello", name)
else:
    print("no name yet")`,
    challenges: [
      "غيّر temp إلى 45 ثم 20. توقّع في كل مرة: أي فرع ينفَّذ؟",
      "اجعل raining = True و temp = 35. لماذا لم يعد الفرع الثاني ينفَّذ؟",
      "غيّر name إلى \"Sara\". ثم جرّب \" \" (مسافة واحدة). هل النص الذي فيه مسافة صادق؟",
      "اعكس ترتيب أول شرطين (اجعل temp >= 30 أولاً) و temp = 45. ماذا تغيّر؟",
    ],
  },
  predict: [
    {
      question: "الدرجة 95. ماذا يطبع؟",
      lang: "py",
      code: `score = 95
if score >= 60:
    print("pass")
elif score >= 90:
    print("excellent")`,
      options: ["pass", "excellent", "pass ثم excellent"],
      answer: 0,
      why: "السلسلة تُفحص من الأعلى، وأول شرط صادق يفوز ويُتخطّى الباقي. 95 >= 60 صادق، فلا يُفحص الشرط الثاني أصلاً. ضع الشرط الأضيق أولاً.",
    },
    {
      question: "القائمة فيها عنصر واحد قيمته 0. ماذا يطبع؟",
      lang: "py",
      code: `items = [0]
if items:
    print("has items")
else:
    print("empty")`,
      options: ["has items", "empty", "خطأ"],
      answer: 0,
      why: "الشرط يسأل عن القائمة نفسها لا عن عناصرها. القائمة غير فارغة، فهي صادقة، حتى لو كان عنصرها الوحيد 0.",
    },
    {
      question: "انتبه للإزاحة. ماذا يطبع؟",
      lang: "py",
      code: `x = 5
if x > 10:
    print("big")
    print("checked")
print("done")`,
      options: ["done", "checked ثم done", "big ثم checked ثم done"],
      answer: 0,
      why: "السطران المزاحان كتلة واحدة تحت if، فيُتخطّيان معاً لأن الشرط كاذب. السطر الأخير غير مزاح، فهو خارج الكتلة وينفَّذ دائماً.",
    },
  ],
  code: {
    intro: "سلسلة if و elif و else، ثم الطريقة الصحيحة للسؤال عن None: is None لا == None، لأن None كائن واحد في البرنامج كله. شغّل وجرّب.",
    runnerLang: "py",
    runnerStarter: `score = 85
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
else:
    print("try again")

value = None
if value is None:
    print("no value yet")
# جرّب: score = 90 ثم 69، و value = 0. هل 0 هو None؟
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "py",
      title: "بالغ أم قاصر",
      prompt: "رتّب الأسطر حتى يطبع البرنامج minor للعمر 15. انتبه للإزاحة: هي جزء من السطر.",
      lines: ["age = 15", "if age >= 18:", '    print("adult")', "else:", '    print("minor")'],
      expected: "minor",
    },
    {
      kind: "fill",
      lang: "py",
      title: "الصفر كاذب",
      prompt: "أي شرط يجعل البرنامج يطبع zero؟",
      template: 'n = 0\nif ___:\n    print("zero")\nelse:\n    print("not zero")',
      options: ["n", "not n", "n is None"],
      expected: "zero",
    },
    {
      kind: "fix",
      lang: "py",
      title: "الامتياز الضائع",
      prompt: "الطالب حصل على 95 لكن البرنامج يطبع pass. أصلح ترتيب الشروط حتى يطبع excellent.",
      code: 'score = 95\nif score >= 60:\n    print("pass")\nelif score >= 90:\n    print("excellent")\nelse:\n    print("fail")',
      expected: "excellent",
      hint: "أول شرط صادق يفوز. أي الشرطين أضيق؟ ضعه أولاً.",
      solution: `score = 95
if score >= 90:
    print("excellent")
elif score >= 60:
    print("pass")
else:
    print("fail")`,
    },
    {
      kind: "write",
      lang: "py",
      title: "وصف الطقس",
      prompt: "temp = 33. إذا كانت 40 أو أكثر اطبع hot، وإذا كانت 25 أو أكثر اطبع warm، وإلا اطبع cool. يجب أن يطبع warm.",
      starter: "temp = 33\n# اكتب الشروط هنا\n",
      expected: "warm",
      hint: "if temp >= 40: ثم elif temp >= 25: ثم else:، وتحت كل واحد print مزاح بأربع مسافات.",
      solution: `temp = 33
if temp >= 40:
    print("hot")
elif temp >= 25:
    print("warm")
else:
    print("cool")`,
    },
  ],
  quiz: [
    {
      question: "شرطان منفصلان لا سلسلة. ماذا يطبع؟",
      code: "x = 7\nif x > 5:\n    x = x - 5\nif x > 5:\n    x = 0\nprint(x)",
      options: ["2", "0", "7"],
      answer: 0,
      why: "كل if تُفحص وحدها بقيمة x في لحظتها. الأولى نقلت x إلى 2، فالثانية (2 > 5) كاذبة.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'if "False":\n    print("yes")\nelse:\n    print("no")',
      options: ["yes", "no", "خطأ"],
      answer: 0,
      why: "\"False\" نص غير فارغ، والنص غير الفارغ صادق أياً كانت حروفه. الكاذب هو False بلا علامتي تنصيص.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'a = 3\nif a > 1:\n    print("one")\nelif a > 2:\n    print("two")',
      options: ["one", "two", "one ثم two"],
      answer: 0,
      why: "الشرطان صادقان، لكن في السلسلة ينفَّذ أول فرع صادق فقط، ثم تُتخطّى elif.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'x = None\nif x is None:\n    print("empty")\nelif x == 0:\n    print("zero")',
      options: ["empty", "zero", "لا شيء"],
      answer: 0,
      why: "x تشير إلى الكائن None، و is None تسأل: هل هو ذلك الكائن نفسه؟ نعم. فيُطبع empty وتُتخطّى elif.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'age = 20\nmember = False\nif age >= 18 and member:\n    print("enter")\nelse:\n    print("stop")',
      options: ["enter", "stop", "خطأ"],
      answer: 1,
      why: "and تحتاج الطرفين صادقين. age >= 18 صادق، لكن member كاذب، فالشرط كله كاذب ويذهب التنفيذ إلى else.",
    },
  ],
  next: "py-loops",
};
