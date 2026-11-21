import type { Lesson } from "@/lib/types";

export const pyStrings: Lesson = {
  slug: "py-strings",
  stage: 0,
  number: "1.11",
  title: "النصوص",
  subtitle: "النص كائن لا يتغير: كل دالة عليه تبني نصاً جديداً وترجعه، والأصل يبقى كما هو",
  minutes: 16,
  singleLanguage: true,
  problem: {
    title: "لماذا لم يتغير الاسم؟",
    body: "عندك نص. اضغط على الدوال لتعدّله. راقب: أين يظهر الناتج، وهل يتغير النص الأصلي؟",
    demo: "pyStrings",
  },
  scene: {
    trace: "py",
    steps: [],
    code: {
      py: `name = "  sara ahmed "
clean = name.strip()
print(clean.title())
print(clean)
first = clean[:4]
print(first, len(clean))
parts = clean.split(" ")
print(parts)
print(f"{first.upper()}-{len(parts)}")`,
    },
    notes: {
      py: "النص في Python غير قابل للتغيير مثل tuple: لا يوجد name[0] = \"S\". لذلك strip و title و upper و replace كلها ترجع نصاً جديداً، ولا يتغير شيء حتى تربط الناتج باسم: name = name.strip()‎.",
    },
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "استدعاء دالة على نص دون أن تحفظ ناتجها يشبه أن تكتب جواباً ثم ترميه. راقب أي سطر يغيّر اسماً فعلاً.",
    starter: `word = "python"
word.upper()
print(word)
shout = word.upper()
print(shout)
print(word[0], word[-1], word[1:4])
backwards = word[::-1]
print(backwards)`,
    challenges: [
      "أضف word[0] = \"P\" في النهاية. اقرأ الخطأ، ثم حقق الهدف بسطر آخر: word = \"P\" + word[1:]‎.",
      "غيّر السطر الثاني إلى word = word.upper()‎. ماذا يطبع print(word) الآن؟",
      "اطبع word.count(\"o\") و word.find(\"th\") و \"y\" in word. توقّع كل واحدة قبل التشغيل.",
      "جرّب word[1:4] و word[:2] و word[3:]. أين يبدأ كل جزء وأين يتوقف؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `s = "hello"
s.upper()
print(s)`,
      options: ["hello", "HELLO", "None"],
      answer: 0,
      why: "upper بنت نصاً جديداً \"HELLO\" ورجعته، لكن لم يُربط باسم فضاع. s ما زال يشير إلى النص الأصلي الذي لا يتغير.",
    },
    {
      question: "ماذا يحدث؟",
      lang: "py",
      code: `s = "abc"
s[0] = "x"
print(s)`,
      options: ["TypeError: لا يمكن تعديل حرف في نص", "يطبع xbc", "يطبع abc"],
      answer: 0,
      why: "النص كائن مختوم. يمكنك قراءة s[0]، لكن لا الكتابة فيه. لتغييره ابنِ نصاً جديداً: s = \"x\" + s[1:]‎.",
    },
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `print("3" + "4", "3" * 2, 3 * 2)`,
      options: ["34 33 6", "7 6 6", "34 6 6"],
      answer: 0,
      why: "‎+ بين نصين تلصقهما، و* بين نص ورقم تكرّره. \"3\" ليس رقماً، بل حرف يشبه الرقم. للحساب: int(\"3\")‎.",
    },
  ],
  code: {
    intro: "أغلب البيانات تصل نصاً: سطر من ملف، حقل من نموذج، رد من خادم. هنا سجل خام يُقسم بـ split، ويُنظف، ثم يُبنى تقرير بـ f-string وتنسيق الأعمدة، ويُجمع بـ join مرة واحدة بدل لصق متكرر.",
    runnerLang: "py",
    runnerStarter: String.raw`raw = "Sara,92;Omar,78;Huda,85"

lines = []
for record in raw.split(";"):
    name, score = record.split(",")
    lines.append(f"{name:<6}{int(score):>4}")

print("\n".join(lines))
print(raw.count(","), raw.find("Omar"), "Huda" in raw)
# Try: change ";" to " | " in raw and in split, then add a fourth student
`,
  },
  exercises: [
    {
      kind: "order",
      title: "تنظيف بريد",
      lang: "py",
      prompt: "رتّب الأسطر: أزل المسافات، ثم صغّر الحروف، ثم افصل الاسم عن النطاق واطبعهما.",
      lines: ['email = " Sara@Example.COM "', "email = email.strip()", "email = email.lower()", 'user, domain = email.split("@")', "print(user, domain)"],
      expected: "sara example.com",
    },
    {
      kind: "fill",
      title: "لصق الكلمات",
      lang: "py",
      prompt: "أي تعبير يلصق الكلمات بشرطة بينها؟",
      template: 'words = ["learn", "python", "daily"]\nprint(___)',
      options: ['"-".join(words)', 'words.join("-")', '"-" + words'],
      expected: "learn-python-daily",
    },
    {
      kind: "fix",
      title: "العنوان لم يتغير",
      lang: "py",
      prompt: "نريد أن تبدأ كل كلمة بحرف كبير. البرنامج يطبع النص كما هو. أصلحه.",
      code: 'title = "hello world"\ntitle.title()\nprint(title)',
      expected: "Hello World",
      hint: "title()‎ ترجع نصاً جديداً. اربطه بالاسم.",
      solution: 'title = "hello world"\ntitle = title.title()\nprint(title)',
    },
    {
      kind: "write",
      title: "الأحرف الأولى",
      lang: "py",
      prompt: "من الاسم \"sara bint ahmed\" اطبع الأحرف الأولى كبيرة وبعد كل منها نقطة: S.B.A.‎ اجمع الأحرف في قائمة ثم استعمل join.",
      starter: 'name = "sara bint ahmed"\n# split the name, collect first letters, then join\n',
      expected: "S.B.A.",
      hint: "لكل part في name.split()‎: letters.append(part[0].upper()) ثم \".\".join(letters) + \".\"",
      solution:
        'name = "sara bint ahmed"\nletters = []\nfor part in name.split():\n    letters.append(part[0].upper())\nprint(".".join(letters) + ".")',
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: 's = "Python"\nprint(s[1:3], s[-2:])',
      options: ["yt on", "Pyt hon", "yth on"],
      answer: 0,
      why: "[1:3] تبدأ من الخانة 1 (y) وتتوقف قبل 3. و[-2:] تبدأ من ثاني حرف من الآخر حتى النهاية.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'a = "hi"\nb = a\na += "!"\nprint(b)',
      options: ["hi", "hi!", "خطأ"],
      answer: 0,
      why: "النص لا يتغير، لذلك += هنا تبني نصاً جديداً \"hi!\" وتنقل الاسم a إليه. b ما زال على \"hi\". قارنها بالقوائم حيث += تعدّل في المكان.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'print("10" < "9", 10 < 9)',
      options: ["True False", "False False", "True True"],
      answer: 0,
      why: "النصوص تُقارن حرفاً حرفاً من اليسار كترتيب القاموس: \"1\" قبل \"9\" فتنتهي المقارنة. لذلك تحوّل الأرقام القادمة نصاً بـ int قبل مقارنتها.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'print("-".join("abc"))',
      options: ["a-b-c", "-abc-", "abc"],
      answer: 0,
      why: "join تمرّ على أي تسلسل من النصوص. النص نفسه تسلسل حروف، فتضع \"-\" بين كل حرفين.",
    },
    {
      question: "ماذا يحدث؟",
      code: 'count = 5\nprint("count: " + count)',
      options: ["TypeError: لا يُلصق نص برقم", "يطبع count: 5", "يطبع count: count"],
      answer: 0,
      why: "‎+ لا تحوّل الرقم إلى نص من تلقاء نفسها. اكتب f\"count: {count}\" أو \"count: \" + str(count).",
    },
  ],
  next: "py-errors",
};
