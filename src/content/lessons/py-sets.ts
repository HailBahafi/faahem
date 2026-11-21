import type { Lesson } from "@/lib/types";

export const pySets: Lesson = {
  slug: "py-sets",
  stage: 0,
  number: "1.10",
  title: "المجموعات",
  subtitle: "المجموعة قاموس بمفاتيح فقط: كل عنصر في خانة يحددها hash، فلا يتكرر، ويُسأل عنه بقفزة واحدة",
  minutes: 15,
  singleLanguage: true,
  problem: {
    title: "كم ضيفاً حضر فعلاً؟",
    body: "على باب الحفل تسجّل كل من يدخل، وبعضهم يخرج ويعود. سجّل الدخول في قائمة وفي مجموعة، وقارن العددين.",
    demo: "pySets",
  },
  scene: {
    trace: "py",
    steps: [],
    code: {
      py: `visits = ["sara", "omar", "sara", "huda", "omar"]
unique = set(visits)
print(len(visits), len(unique))
unique.add("sara")
print(len(unique))
print("huda" in unique)
admins = {"omar", "zaid"}
print(sorted(unique & admins))
print(sorted(admins - unique))`,
    },
    notes: {
      py: "المجموعة لا تحفظ ترتيباً: مكان العنصر يحدده hash قيمته، وقد يتغير الترتيب الظاهر بين تشغيل وآخر. لذلك نطبعها عبر sorted()‎ حين يهمّ الترتيب، ولا يوجد unique[0]. والمجموعة الفارغة تُكتب set()‎، لأن {} قاموس فارغ.",
    },
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "اكتشاف المكرر: مجموعة seen تتذكر ما رأيناه. راقب: كل سؤال in قفزة إلى خانة واحدة، لا مرور على كل ما سبق.",
    starter: `seen = set()
duplicates = []
for n in [4, 7, 4, 1, 7, 4]:
    if n in seen:
        duplicates.append(n)
    else:
        seen.add(n)
print(sorted(seen), duplicates)`,
    challenges: [
      "توقّع قبل التشغيل: كم مرة يظهر 4 في duplicates؟",
      "اجعل duplicates مجموعة أيضاً: duplicates = set() و duplicates.add(n). ماذا تغيّر في الناتج؟",
      "أضف في النهاية: print(seen[0]). ماذا يقول الخطأ، ولماذا لا معنى لـ \"الخانة الأولى\" هنا؟",
      "أضف: print(seen | {9}, seen & {1, 9}). ما الذي يجمعه | وما الذي يُبقيه &؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `s = {1, 2, 2, 3, 3, 3}
print(len(s))`,
      options: ["3", "6", "4"],
      answer: 0,
      why: "كل 2 يقود إلى خانة 2 نفسها، وكل 3 إلى خانة 3. التكرار يقع على المكان نفسه فلا يضيف شيئاً.",
    },
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `empty = {}
print(type(empty).__name__)`,
      options: ["dict", "set", "خطأ"],
      answer: 0,
      why: "{} كانت قاموساً فارغاً قبل أن توجد المجموعات في Python، وبقيت كذلك. المجموعة الفارغة: set()‎.",
    },
    {
      question: "ماذا يحدث؟",
      lang: "py",
      code: `s = {3, 1, 2}
print(s[0])`,
      options: ["TypeError: المجموعة لا تُفهرس", "يطبع 3", "يطبع 1"],
      answer: 0,
      why: "المجموعة ليست صفاً مرتّباً، بل خانات يحددها hash. لا يوجد \"العنصر رقم 0\". تسألها فقط: هل x فيك؟ أو تمرّ عليها بـ for.",
    },
  ],
  code: {
    intro: "المجموعات تحلّ كل سؤال من نوع: من في الاثنين؟ من في أحدهما فقط؟ هل هذا محظور؟ عمليات & و | و - و ^ هي عمليات المجموعات في الرياضيات، وسؤال in فيها سريع مهما كبرت.",
    runnerLang: "py",
    runnerStarter: `math_class = {"Sara", "Omar", "Huda", "Ali"}
art_class = {"Huda", "Zaid", "Sara"}

print("both:", sorted(math_class & art_class))
print("any:", sorted(math_class | art_class))
print("only math:", sorted(math_class - art_class))
print("exactly one:", sorted(math_class ^ art_class))

blocked = set(["spam@x.com", "bot@y.com"])
for email in ["sara@z.com", "bot@y.com"]:
    if email in blocked:
        print(email, "blocked")
    else:
        print(email, "allowed")
# Try: add a student to both classes with .add(), and predict each line before running
`,
  },
  exercises: [
    {
      kind: "order",
      title: "وسوم بلا تكرار",
      lang: "py",
      prompt: "رتّب الأسطر: حوّل الوسوم إلى مجموعة، ثم اطبع عددها، ثم اطبعها مرتّبة.",
      lines: ['tags = ["py", "go", "py", "js", "go"]', "unique = set(tags)", "print(len(unique))", "print(sorted(unique))"],
      expected: "3\n['go', 'js', 'py']",
    },
    {
      kind: "fill",
      title: "المشترك",
      lang: "py",
      prompt: "أي عملية تعطي العناصر الموجودة في المجموعتين معاً؟",
      template: "a = {1, 2, 3}\nb = {2, 3, 4}\nprint(sorted(___))",
      options: ["a & b", "a | b", "a - b"],
      expected: "[2, 3]",
    },
    {
      kind: "fix",
      title: "المجموعة الفارغة",
      lang: "py",
      prompt: "نريد عدد الأسماء المختلفة. البرنامج يتوقف بخطأ. أصلحه.",
      code: 'names = ["Sara", "Omar", "Sara"]\nunique = {}\nfor n in names:\n    unique.add(n)\nprint(len(unique))',
      expected: "2",
      hint: "{} قاموس فارغ، والقاموس ليس فيه add. المجموعة الفارغة تُكتب بدالة.",
      solution: 'names = ["Sara", "Omar", "Sara"]\nunique = set()\nfor n in names:\n    unique.add(n)\nprint(len(unique))',
    },
    {
      kind: "write",
      title: "الواجبات",
      lang: "py",
      prompt: "hw1 و hw2 أرقام الطلاب الذين سلّموا كل واجب. اطبع (مرتّبة) أرقام من سلّم الاثنين، ثم أرقام من سلّم الأول ونسي الثاني.",
      starter: "hw1 = [101, 102, 103, 104]\nhw2 = [102, 104, 105]\n# turn them into sets, then use & and -\n",
      expected: "[102, 104]\n[101, 103]",
      hint: "first = set(hw1) و second = set(hw2) ثم sorted(first & second) و sorted(first - second).",
      solution:
        "hw1 = [101, 102, 103, 104]\nhw2 = [102, 104, 105]\nfirst = set(hw1)\nsecond = set(hw2)\nprint(sorted(first & second))\nprint(sorted(first - second))",
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: 's = set("banana")\nprint(len(s))',
      options: ["3", "6", "1"],
      answer: 0,
      why: "set تمرّ على النص حرفاً حرفاً. الحروف المختلفة b و a و n فقط؛ كل تكرار يقع على خانته الموجودة.",
    },
    {
      question: "ماذا يطبع؟",
      code: "s = {1, 2}\ns.add(2)\ns.add(3)\nprint(len(s))",
      options: ["3", "4", "2"],
      answer: 0,
      why: "add(2) وجدت 2 في خانته فلم تفعل شيئاً، ولم ترفع خطأ. add(3) أضافت عنصراً جديداً.",
    },
    {
      question: "ماذا يحدث؟",
      code: "s = {[1, 2], [3]}",
      options: ["TypeError: unhashable type: 'list'", "مجموعة فيها قائمتان", "مجموعة فيها 1 و 2 و 3"],
      answer: 0,
      why: "مكان العنصر محسوب من قيمته. لو تغيّرت القائمة بعد إدخالها لصار مكانها خطأ، لذلك ترفض Python العناصر القابلة للتغيير. tuple من أرقام يصلح.",
    },
    {
      question: "ماذا يطبع؟",
      code: "print({1, 2, 3} == {3, 2, 1}, [1, 2, 3] == [3, 2, 1])",
      options: ["True False", "True True", "False False"],
      answer: 0,
      why: "المجموعتان فيهما العناصر نفسها، والترتيب لا معنى له في المجموعة. أما القائمة فصفّ مرتّب: الخانة 0 تختلف بين القائمتين.",
    },
    {
      question: "عندك مليون رقم محظور. ستسأل عن 1000 رقم: هل هو محظور؟ ماذا تختار؟",
      options: [
        "مجموعة: كل سؤال قفزة إلى خانة واحدة",
        "قائمة: كل سؤال يمرّ عليها من البداية",
        "لا فرق، كلاهما يبحث بالطريقة نفسها",
      ],
      answer: 0,
      why: "في القائمة قد يكلّف السؤال الواحد مليون مقارنة، فالألف سؤال مليار. في المجموعة hash الرقم يدلّ على خانته مباشرة: ألف سؤال تقريباً ألف خطوة.",
    },
  ],
  next: "py-strings",
};
