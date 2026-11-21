import type { Lesson } from "@/lib/types";

export const pyFiles: Lesson = {
  slug: "py-files",
  stage: 0,
  number: "1.13",
  title: "الملفات",
  subtitle: "الملف يعيش على القرص خارج ذاكرة البرنامج، فيبقى بعد أن ينتهي. open تعطيك مقبضاً له مؤشر يتقدم مع كل قراءة",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "أين ذهبت ملاحظاتي؟",
    body: "تطبيق ملاحظات بنسختين: واحدة تحفظ في الذاكرة فقط، وواحدة تكتب في ملف. أضف ملاحظات، ثم أغلق البرنامج وأعد تشغيله.",
    demo: "pyFiles",
  },
  scene: {
    trace: "py",
    steps: [],
    code: {
      py: String.raw`import os
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("buy milk\n")
    f.write("call Sara\n")
with open("notes.txt", encoding="utf-8") as f:
    first = f.readline()
    rest = f.read()
print(repr(first), repr(rest), f.closed)
os.remove("notes.txt")`,
    },
    notes: {
      py: "open ترجع كائن ملف، لا نص الملف. with تغلقه عند نهاية الكتلة حتى لو وقع خطأ، والإغلاق يدفع إلى القرص ما بقي في الذاكرة المؤقتة. واكتب encoding=\"utf-8\" دائماً، فالقرص لا يحفظ حروفاً بل بايتات، والترميز هو قاعدة التحويل بينهما.",
    },
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "سجل أحداث يُكتب على ثلاث مراحل. الوضع \"w\" يبدأ ملفاً فارغاً، و\"a\" يضيف في آخره، و\"r\" (الافتراضي) يقرأ. راقب ما يُطبع في النهاية.",
    starter: String.raw`import os

with open("log.txt", "w", encoding="utf-8") as f:
    f.write("start\n")
with open("log.txt", "a", encoding="utf-8") as f:
    f.write("step 1\n")
    f.write("step 2\n")
with open("log.txt", encoding="utf-8") as f:
    for number, line in enumerate(f, start=1):
        print(number, line.strip())
os.remove("log.txt")`,
    challenges: [
      "غيّر \"a\" في الـ open الثاني إلى \"w\". أي سطر اختفى من الملف، ولماذا؟",
      "احذف .strip()‎ من سطر الطباعة. من أين جاءت الأسطر الفارغة؟",
      "احذف \\n من f.write(\"step 1\\n\"). كم سطراً صار في الملف؟",
      "احذف سطر os.remove، ثم أضف في البداية سطراً يفتح الملف بـ \"r\" قبل أن يُكتب. أي خطأ يظهر في أول تشغيل؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `import os

with open("t.txt", "w", encoding="utf-8") as f:
    f.write("A")
with open("t.txt", "w", encoding="utf-8") as f:
    f.write("B")
with open("t.txt", encoding="utf-8") as f:
    print(f.read())
os.remove("t.txt")`,
      options: ["B", "AB", "A"],
      answer: 0,
      why: "الوضع \"w\" يفرغ الملف لحظة فتحه، قبل أي كتابة. الـ open الثاني محا A ثم كتب B. للإضافة في الآخر استعمل \"a\".",
    },
    {
      question: "io.StringIO كائن يتصرف تماماً كملف مفتوح، لكنه في الذاكرة. ماذا يطبع؟",
      lang: "py",
      code: String.raw`import io

f = io.StringIO("one\ntwo\n")
first = f.read()
second = f.read()
print(len(first), repr(second))`,
      options: ["8 ''", "8 'one\\ntwo\\n'", "4 'two\\n'"],
      answer: 0,
      why: "لكل ملف مفتوح مؤشر. read الأولى قرأت حتى النهاية وتركت المؤشر هناك، فلم يبقَ للثانية شيء: نص فارغ. لتقرأ من جديد أعد المؤشر بـ f.seek(0)‎.",
    },
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: String.raw`import io

f = io.StringIO("a\nb\n")
lines = f.readlines()
print(lines)`,
      options: ["['a\\n', 'b\\n']", "['a', 'b']", "['a\\nb\\n']"],
      answer: 0,
      why: "كل سطر يُقرأ مع رمز نهاية السطر \\n الذي في آخره، لأنه جزء من محتوى الملف. لذلك نكتب line.strip()‎ قبل استعمال السطر.",
    },
  ],
  code: {
    intro: "أغلب البرامج الحقيقية تحفظ شيئاً بين تشغيل وآخر: إعدادات، سجلات، بيانات. هنا تُحفظ الدرجات في ملف نصي، سطر لكل طالب، ثم تُقرأ من جديد إلى قاموس. في آخر البرنامج نحذف الملف حتى لا نترك أثراً.",
    runnerLang: "py",
    runnerStarter: String.raw`import os

scores = {"Sara": 92, "Omar": 78, "Huda": 85}

with open("scores.txt", "w", encoding="utf-8") as f:
    for name, score in scores.items():
        f.write(f"{name},{score}\n")

loaded = {}
with open("scores.txt", encoding="utf-8") as f:
    for line in f:
        name, score = line.strip().split(",")
        loaded[name] = int(score)

print(loaded)
print("average:", sum(loaded.values()) / len(loaded))
os.remove("scores.txt")
# Try: before reading, open the file in "a" mode and write "Ali,60\n"
`,
  },
  exercises: [
    {
      kind: "order",
      title: "قائمة المهام",
      lang: "py",
      prompt: "رتّب الأسطر: اكتب مهمة في ملف، ثم اقرأه واطبعه، ثم احذف الملف.",
      lines: [
        "import os",
        'with open("todo.txt", "w", encoding="utf-8") as f:',
        '    f.write("read\\n")',
        'with open("todo.txt", encoding="utf-8") as f:',
        "    print(f.read().strip())",
        'os.remove("todo.txt")',
      ],
      expected: "read",
    },
    {
      kind: "fill",
      title: "السطر الثاني",
      lang: "py",
      prompt: "قرأنا السطر الأول. أي تعبير يطبع السطر الثاني نظيفاً؟",
      template: 'import io\n\nf = io.StringIO("first\\nsecond\\n")\nf.readline()\nprint(___)',
      options: ["f.readline().strip()", "f.readlines()", "f.getvalue().strip()"],
      expected: "second",
    },
    {
      kind: "fix",
      title: "الأسماء الملتصقة",
      lang: "py",
      prompt: "كتبنا اسمين في ملف، لكن عند القراءة نجد سطراً واحداً. أصلح الكتابة حتى يطبع 2.",
      code: 'import os\n\nwith open("names.txt", "w", encoding="utf-8") as f:\n    for name in ["Sara", "Omar"]:\n        f.write(name)\nwith open("names.txt", encoding="utf-8") as f:\n    print(len(f.readlines()))\nos.remove("names.txt")',
      expected: "2",
      hint: "write لا تضيف نهاية سطر من تلقاء نفسها. أضف \"\\n\" بعد كل اسم.",
      solution:
        'import os\n\nwith open("names.txt", "w", encoding="utf-8") as f:\n    for name in ["Sara", "Omar"]:\n        f.write(name + "\\n")\nwith open("names.txt", encoding="utf-8") as f:\n    print(len(f.readlines()))\nos.remove("names.txt")',
    },
    {
      kind: "write",
      title: "عدّاد الأخطاء في السجل",
      lang: "py",
      prompt: "اكتب count_errors(file) التي تمرّ على أسطر ملف مفتوح وترجع عدد الأسطر التي فيها ERROR. جرّبها على log الجاهز (StringIO يتصرف كملف) واطبع النتيجة.",
      starter: 'import io\n\nlog = io.StringIO("INFO start\\nERROR disk full\\nINFO retry\\nERROR timeout\\n")\n# write count_errors(file), then print(count_errors(log))\n',
      expected: "2",
      hint: "for line in file: if \"ERROR\" in line: count += 1",
      solution:
        'import io\n\n\ndef count_errors(file):\n    count = 0\n    for line in file:\n        if "ERROR" in line:\n            count += 1\n    return count\n\n\nlog = io.StringIO("INFO start\\nERROR disk full\\nINFO retry\\nERROR timeout\\n")\nprint(count_errors(log))',
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: String.raw`with open("x.txt", "w", encoding="utf-8") as f:
    f.write("1\n")
with open("x.txt", "a", encoding="utf-8") as f:
    f.write("2\n")
with open("x.txt", encoding="utf-8") as f:
    print(f.read().split())`,
      options: ["['1', '2']", "['2']", "['1\\n2\\n']"],
      answer: 0,
      why: "\"w\" أنشأ الملف وكتب 1، و\"a\" فتحه ووضع المؤشر في آخره فأضاف 2. وsplit بلا وسيط تقسم عند المسافات ونهايات الأسطر.",
    },
    {
      question: "ماذا يحدث إن لم يوجد الملف؟",
      code: 'with open("missing.txt", encoding="utf-8") as f:\n    print(f.read())',
      options: ["FileNotFoundError", "يطبع نصاً فارغاً", "يُنشأ ملف فارغ ثم يُطبع لا شيء"],
      answer: 0,
      why: "وضع القراءة لا يُنشئ شيئاً: يطلب من نظام التشغيل ملفاً موجوداً. \"w\" و\"a\" هما اللذان يُنشئان الملف إن غاب.",
    },
    {
      question: "لماذا with open(...) as f بدل f = open(...) وحدها؟",
      options: [
        "with تغلق الملف عند نهاية الكتلة حتى لو وقع خطأ، فيُدفع ما بقي من الكتابة إلى القرص",
        "with أسرع في القراءة",
        "بدون with لا يمكن الكتابة في الملف",
      ],
      answer: 0,
      why: "الكتابة تُجمع أولاً في ذاكرة مؤقتة ولا تصل كلها إلى القرص إلا عند الإغلاق. لو توقف البرنامج قبل close لضاع آخرها، وبقي الملف مفتوحاً. with تضمن الإغلاق في كل طريق خروج.",
    },
    {
      question: "ملف فيه سطران a و b. ماذا يطبع هذا؟",
      code: 'with open("ab.txt", encoding="utf-8") as f:\n    for line in f:\n        print(line)',
      options: ["a ثم سطر فارغ ثم b ثم سطر فارغ", "a ثم b", "ab"],
      answer: 0,
      why: "كل line ينتهي بـ \\n من الملف، وprint تضيف \\n ثانياً. لذلك نكتب print(line.strip())‎ أو print(line, end=\"\").",
    },
    {
      question: "ماذا يحدث؟",
      code: 'with open("n.txt", "w", encoding="utf-8") as f:\n    f.write(42)',
      options: ["TypeError: write تقبل نصاً فقط", "يكتب 42 في الملف", "يكتب البايت 42"],
      answer: 0,
      why: "الملف النصي يحوّل نصوصاً إلى بايتات بالترميز. الرقم ليس نصاً، فحوّله أولاً: f.write(str(42)) أو f.write(f\"{n}\\n\").",
    },
  ],
  next: "py-comprehensions",
};
