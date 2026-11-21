import type { Frame, HeapObj, Lesson, Slot, Step } from "@/lib/types";

// Every value is an object on the heap; a name is a label with an arrow to one object.
const at = (name: string, id: number): Slot => ({ name, value: "", type: "ref", ref: id });
const int = (id: number, value: number): HeapObj => ({
  id,
  kind: "object",
  items: [
    { name: "type", value: "int", type: "none" },
    { name: "value", value: String(value), type: "number" },
  ],
});
const strs = (id: number, values: string[]): HeapObj => ({
  id,
  kind: "array",
  items: values.map((v, i) => ({ name: String(i), value: `"${v}"`, type: "string" })),
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

const ten = int(1, 10);
const fifteen = int(2, 15);
const sara = strs(3, ["Sara"]);
const both = strs(3, ["Sara", "Omar"]);

export const pyNames: Lesson = {
  slug: "py-names",
  stage: 0,
  number: "1.1",
  title: "المتغيرات أسماء لكائنات",
  subtitle: "الاسم في بايثون بطاقة مربوطة بكائن، لا درج يحمل قيمة",
  minutes: 16,
  singleLanguage: true,
  problem: {
    title: "نسخة أم بطاقة ثانية؟",
    body: "في كل لوحة كتبنا b = a ثم سنغيّر a. توقّع قبل أن تضغط: هل يتغيّر b؟ جرّب لوحة الأعداد ثم لوحة القوائم.",
    demo: "pyNames",
  },
  scene: {
    code: {
      py: `score = 10
bonus = score
score = score + 5
names = ["Sara"]
team = names
team.append("Omar")
print(score, bonus)
print(names)`,
    },
    notes: {
      py: "الاسم في بايثون لا نوع له ولا حجم: هو مرجع إلى كائن، لذلك يمكن ربط الاسم نفسه بعدد ثم بنص. و id(x) يعطي هوية الكائن الذي تشير إليه x الآن، و a is b تسأل: هل البطاقتان على الكائن نفسه؟",
    },
    steps: [
      step(
        null,
        "يساراً المكدّس: إطار البرنامج وفيه الأسماء. يميناً الكومة: كل قيمة في بايثون كائن يعيش هنا، له نوع وقيمة. الاسم بطاقة تشير بسهم إلى كائن.",
        [],
        [],
      ),
      step(1, "الطرف الأيمن أولاً: تصنع بايثون في الكومة كائناً نوعه int وقيمته 10، ثم تلصق عليه البطاقة score. الاسم لا يحمل 10؛ هو يشير إليه.", [at("score", 1)], [ten], {
        changed: ["score"],
        changedHeap: [1],
      }),
      step(2, "bonus = score لا تنسخ شيئاً. تتبع بايثون سهم score إلى كائنه، وتلصق عليه بطاقة ثانية. سهمان الآن إلى الكائن نفسه.", [at("score", 1), at("bonus", 1)], [ten], {
        changed: ["bonus"],
        read: ["score"],
      }),
      step(3, "الطرف الأيمن أولاً: score + 5. الكائن 10 لا يتغيّر أبداً، فالأعداد في بايثون غير قابلة للتغيير (immutable). لذلك تصنع بايثون كائناً جديداً قيمته 15.", [at("score", 1), at("bonus", 1)], [ten, fifteen], {
        read: ["score"],
        changedHeap: [2],
      }),
      step(3, "ثم تنتقل البطاقة score إلى الكائن الجديد. bonus ما زالت على 10 لأن أحداً لم يلمسها. الإسناد = يحرّك بطاقة، ولا يغيّر كائناً.", [at("score", 2), at("bonus", 1)], [ten, fifteen], {
        changed: ["score"],
      }),
      step(4, "القائمة كائن في الكومة أيضاً، والبطاقة names تشير إليها.", [at("score", 2), at("bonus", 1), at("names", 3)], [ten, fifteen, sara], {
        changed: ["names"],
        changedHeap: [3],
      }),
      step(5, "team = names: بطاقة ثانية على القائمة نفسها، لا قائمة ثانية. انظر إلى الكومة: قائمة واحدة وسهمان.", [at("score", 2), at("bonus", 1), at("names", 3), at("team", 3)], [ten, fifteen, sara], {
        changed: ["team"],
        read: ["names"],
      }),
      step(6, "append لا تحرّك أي بطاقة؛ تغيّر الكائن نفسه. القوائم قابلة للتغيير (mutable): تكبر في مكانها.", [at("score", 2), at("bonus", 1), at("names", 3), at("team", 3)], [ten, fifteen, both], {
        read: ["team"],
        changedHeap: [3],
      }),
      step(7, "print تتبع كل سهم إلى كائنه: score إلى 15، و bonus إلى 10.", [at("score", 2), at("bonus", 1), at("names", 3), at("team", 3)], [ten, fifteen, both], {
        read: ["score", "bonus"],
        output: ["15 10"],
      }),
      step(
        8,
        "السطر 6 لم يذكر names، ومع ذلك ترى Omar: لأن team و names بطاقتان على كائن واحد. هذه صورة الدرس كله: = تربط بطاقة، والتعديل يصيب الكائن.",
        [at("score", 2), at("bonus", 1), at("names", 3), at("team", 3)],
        [ten, fifteen, both],
        { read: ["names"], output: ["15 10", "['Sara', 'Omar']"] },
      ),
    ],
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "المتتبّع يرسم القوائم في الكومة ويمدّ إليها سهماً من كل اسم. أما الأعداد والنصوص فيكتب قيمتها بجانب الاسم اختصاراً: هي كائنات أيضاً، لكنها لا تتغيّر أبداً، فلا يستطيع اسم آخر أن يغيّرها من خلفك.",
    starter: `cart = ["tea", "bread"]
saved = cart
saved.append("milk")
fresh = cart.copy()
fresh.append("eggs")
print(cart)
print(saved is cart, fresh is cart)`,
    challenges: [
      "قبل أن تضغط: أي القوائم ستحمل eggs؟ ثم عُدّ القوائم في الكومة. كم سهماً يصل إلى كل واحدة؟",
      "غيّر السطر 3 إلى saved = saved + [\"milk\"]. هل يرى cart الحليب الآن؟ لماذا ظهرت قائمة جديدة في الكومة؟",
      "أضف في النهاية: count = 3 ثم other = count ثم count = count + 1، واطبع other. توقّع أولاً: هل تحرّك other مع count؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      lang: "py",
      code: `a = [1, 2]
b = a
b.append(3)
print(a)`,
      options: ["[1, 2]", "[1, 2, 3]", "خطأ"],
      answer: 1,
      why: "b = a لم تصنع قائمة ثانية؛ ألصقت بطاقة ثانية على القائمة نفسها. append عدّلت ذلك الكائن، و a تشير إليه، فترى 3.",
    },
    {
      question: "وماذا عن الأعداد؟",
      lang: "py",
      code: `x = 5
y = x
x = x + 1
print(x, y)`,
      options: ["6 6", "6 5", "5 5"],
      answer: 1,
      why: "x + 1 لا تغيّر الكائن 5؛ تصنع كائناً جديداً 6، ثم ينقل = البطاقة x إليه. y بقيت على 5.",
    },
    {
      question: "b تبدأ على قائمة a، ثم يأتي سطر فيه + لا append. ماذا يُطبع؟",
      lang: "py",
      code: `a = [1, 2]
b = a
b = b + [3]
print(a, b)`,
      options: ["[1, 2] [1, 2, 3]", "[1, 2, 3] [1, 2, 3]", "[1, 2] [1, 2]"],
      answer: 0,
      why: "b + [3] تصنع قائمة جديدة في الكومة، و = تنقل البطاقة b إليها. القائمة القديمة لم يلمسها أحد، فـ a ما زالت [1, 2]. الإسناد يحرّك بطاقة، والدوال مثل append تغيّر الكائن.",
    },
  ],
  code: {
    intro: "سؤالان مختلفان: == تسأل «هل القيمتان متساويتان؟»، و is تسأل «هل البطاقتان على الكائن نفسه؟». و id(x) يعطي هوية الكائن. شغّل، ثم جرّب التعليق في آخر الكود.",
    runnerLang: "py",
    runnerStarter: `a = [1, 2, 3]
b = a
c = [1, 2, 3]

print(a == b, a is b)
print(a == c, a is c)
print(id(a) == id(b))

b.append(4)
print(a)
print(c)
# جرّب: اجعل c = a.copy() ثم c.append(5)، واطبع a و c
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "py",
      title: "بطاقتان على سلّة واحدة",
      prompt: "رتّب الأسطر: أنشئ القائمة، ألصق عليها اسماً ثانياً، أضف إليها من الاسم الأول، ثم اطبع طولها من الاسم الثاني وهل الاسمان على كائن واحد. يجب أن يطبع 2 ثم True.",
      lines: ['cart = ["tea"]', "saved = cart", 'cart.append("milk")', "print(len(saved))", "print(saved is cart)"],
      expected: "2\nTrue",
    },
    {
      kind: "fill",
      lang: "py",
      title: "قائمة مستقلة",
      prompt: "نريد أن تكبر b وحدها وتبقى a كما هي. أي تعبير يحقق ذلك؟",
      template: "a = [1, 2]\nb = ___\nb.append(3)\nprint(a)\nprint(b)",
      options: ["a", "a.copy()", "[1, 2, 3]"],
      expected: "[1, 2]\n[1, 2, 3]",
    },
    {
      kind: "fix",
      lang: "py",
      title: "الإعدادات الافتراضية",
      prompt: "أردنا قائمة خاصة بنا تبدأ من الافتراضية، لكن الافتراضية تغيّرت أيضاً. أصلح سطراً واحداً.",
      code: 'default = ["home"]\nmine = default\nmine.append("work")\nprint(default)\nprint(mine)',
      expected: "['home']\n['home', 'work']",
      hint: "mine = default تلصق بطاقة ثانية على القائمة نفسها. أنت تحتاج كائناً جديداً فيه العناصر نفسها.",
      solution: `default = ["home"]
mine = default.copy()
mine.append("work")
print(default)
print(mine)`,
    },
    {
      kind: "write",
      lang: "py",
      title: "البطاقة التي تحرّكت",
      prompt: "أنشئ price = 20 ثم old = price، واطبع price is old. ثم اجعل price = price + 5، واطبع price is old، ثم اطبع old. يجب أن يظهر True ثم False ثم 20.",
      starter: "# اكتب الكود هنا\n",
      expected: "True\nFalse\n20",
      hint: "بعد old = price البطاقتان على كائن واحد. price + 5 تصنع كائناً جديداً وتنتقل إليه price وحدها.",
      solution: `price = 20
old = price
print(price is old)
price = price + 5
print(price is old)
print(old)`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: "a = [0]\nb = a\na.append(1)\nb.append(2)\nprint(a)",
      options: ["[0, 1]", "[0, 1, 2]", "[0, 2]"],
      answer: 1,
      why: "في الكومة قائمة واحدة عليها بطاقتان. كل append أضافت إلى ذلك الكائن نفسه، أياً كان الاسم الذي استُعمل.",
    },
    {
      question: "ماذا يطبع؟",
      code: 's = "hi"\nt = s\ns = s + "!"\nprint(t)',
      options: ["hi!", "hi", "خطأ"],
      answer: 1,
      why: "النصوص لا تتغيّر. s + \"!\" صنعت نصاً جديداً وانتقلت إليه s. أما t فبقيت على \"hi\".",
    },
    {
      question: "ماذا يطبع؟",
      code: "a = [1]\nb = [1]\nprint(a == b, a is b)",
      options: ["True True", "True False", "False False"],
      answer: 1,
      why: "كل [1] تصنع قائمة جديدة، ففي الكومة كائنان. قيمتاهما متساويتان (==)، لكنهما ليسا الكائن نفسه (is).",
    },
    {
      question: "ماذا يطبع؟",
      code: "x = [5]\ny = x\nx = [6]\nprint(y)",
      options: ["[6]", "[5]", "[5, 6]"],
      answer: 1,
      why: "السطر 3 لا يغيّر القائمة [5]؛ يصنع قائمة جديدة وينقل البطاقة x إليها. y ما زالت على القائمة الأولى.",
    },
    {
      question: "بعد هذه الأسطر، كم قائمة في الكومة؟",
      code: "a = [1, 2]\nb = a\nc = a.copy()",
      options: ["1", "2", "3"],
      answer: 1,
      why: "a و b بطاقتان على كائن واحد، و copy صنعت كائناً ثانياً عليه c. ثلاث بطاقات وقائمتان.",
    },
  ],
  next: "py-types",
};
