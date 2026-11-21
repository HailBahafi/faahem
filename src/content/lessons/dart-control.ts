import type { Cell, Lesson, Scene, Step } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const b = (name: string, value: boolean): Cell => ({ name, value: String(value), type: "boolean" });
const dart = (code: string, steps: Step[]): Scene => ({ code: { dart: code }, steps });

const out1 = ["18 cool"];
const out2 = [...out1, "31 warm"];
const out3 = [...out2, "44 hot"];

export const dartControl: Lesson = {
  slug: "dart-control",
  stage: 0,
  number: "1.4",
  title: "التحكم",
  subtitle: "المعالج يمشي سطراً بعد سطر، والشرط يختار الطريق، والحلقة تعيده إلى الخلف",
  minutes: 20,
  singleLanguage: true,
  problem: {
    title: "ثمانية طلبات بيدك",
    body: "عليك أن تصنّف كل طرد: صغير أو متوسط أو كبير حسب وزنه. صنّفها بيدك واحداً واحداً، ثم اكتب القاعدة مرة واحدة ودع الحلقة تمرّ عليها كلها.",
    demo: "dartControl",
  },
  scene: {
    code: {
      dart: `void main() {
  for (final t in [18, 31, 44, 25]) {
    final label = switch (t) { < 20 => "cool", < 40 => "warm", _ => "hot" };
    print("$t $label");
    if (label == "hot") break;
  }
  print("done");
}`,
    },
    steps: [
      {
        line: null,
        say: "المعالج لا يرى البرنامج كله: يحمل عدّاداً اسمه «السطر الحالي». عادةً يزيد واحداً، والشرط والحلقة هما ما يقفز به إلى مكان آخر.",
        memory: [],
      },
      {
        line: 2,
        say: "for-in تمرّ على عناصر القائمة بالترتيب. في الدورة الأولى t = 18، و final تعني أن t لا يتغير داخل الدورة الواحدة.",
        memory: [n("t", 18)],
        changed: ["t"],
      },
      {
        line: 3,
        say: "switch هنا تعبير يرجع قيمة. يجرّب الأنماط من اليسار: هل 18 < 20؟ نعم، فيأخذ \"cool\" ولا يفحص الباقي.",
        memory: [n("t", 18), s("label", "cool")],
        changed: ["label"],
        read: ["t"],
      },
      {
        line: 4,
        say: "يطبع 18 cool.",
        memory: [n("t", 18), s("label", "cool")],
        read: ["t", "label"],
        output: out1,
      },
      {
        line: 5,
        say: "الشرط label == \"hot\" قيمته false، فلا break. نهاية جسم الحلقة: يقفز المعالج إلى السطر 2 للعنصر التالي.",
        memory: [n("t", 18), s("label", "cool"), b("label == hot", false)],
        read: ["label"],
        output: out1,
      },
      {
        line: 3,
        say: "الدورة الثانية: t = 31، و label درج جديد لهذه الدورة. ‏31 < 20؟ لا. ‏31 < 40؟ نعم: \"warm\".",
        memory: [n("t", 31), s("label", "warm")],
        changed: ["t", "label"],
        read: ["t"],
        output: out1,
      },
      {
        line: 5,
        say: "طُبع 31 warm، والشرط false مرة أخرى، فنعود إلى السطر 2.",
        memory: [n("t", 31), s("label", "warm"), b("label == hot", false)],
        read: ["label"],
        output: out2,
      },
      {
        line: 3,
        say: "t = 44: ليس أقل من 20 ولا من 40، فيصل إلى _ الذي يطابق كل شيء: \"hot\". المترجم يرفض switch بلا _ هنا، لأن بعض الأعداد لن يجد لها نتيجة.",
        memory: [n("t", 44), s("label", "hot")],
        changed: ["t", "label"],
        read: ["t"],
        output: out2,
      },
      {
        line: 4,
        say: "يطبع 44 hot.",
        memory: [n("t", 44), s("label", "hot")],
        read: ["t", "label"],
        output: out3,
      },
      {
        line: 5,
        say: "الشرط true هذه المرة: break يخرج من الحلقة كلها فوراً. العنصر 25 لن يُزار أبداً.",
        memory: [n("t", 44), s("label", "hot"), b("label == hot", true)],
        read: ["label"],
        output: out3,
      },
      {
        line: 7,
        say: "يكمل المعالج بعد الحلقة. أدراج t و label انتهت مع الحلقة، فهي لا توجد خارجها. يطبع done.",
        memory: [],
        output: [...out3, "done"],
      },
    ],
    notes: {
      dart: "الشرط في Dart يجب أن يكون bool حقيقياً (لا يُقبل if (count)‎ كما في JavaScript). و switch في Dart 3 تعبير بأنماط، يجب أن يغطي كل الحالات، ولا يسقط من حالة إلى التي بعدها.",
    },
  },
  playground: {
    kind: "trace",
    intro: "برنامج المشهد بـ JavaScript، وفيه تشاهد قفزات السطر الحالي. JavaScript ليس فيها switch كتعبير، فالقاعدة دالة فيها if و else if. عدّل القائمة والحدود وتوقّع قبل أن تشغّل.",
    starter: `function label(t) {
  if (t < 20) {
    return "cool";
  } else if (t < 40) {
    return "warm";
  }
  return "hot";
}
const temps = [18, 31, 44, 25];
for (const t of temps) {
  const l = label(t);
  console.log(t + " " + l);
  if (l === "hot") break;
}
console.log("done");`,
    challenges: [
      "قبل التشغيل: لماذا لا يُطبع 25؟ ضع 25 قبل 44 في القائمة وتوقّع الناتج.",
      "بدّل ترتيب الشرطين في label (اسأل عن ‎t < 40‎ أولاً). ماذا يحدث للعدد 18؟",
      "غيّر break إلى continue. كم سطراً يُطبع الآن؟",
      "احذف return \"hot\". ماذا تُرجع label للعدد 44؟ هذا ما يمنعه Dart حين يطلب أن يغطي switch كل الحالات.",
    ],
  },
  predict: [
    {
      question: "هل يقبل المترجم هذه الدالة؟",
      code: `String kind(bool done) => switch (done) {
  true => "done",
};`,
      options: ["لا: الحالة false غير مغطاة", "نعم، وترجع null للحالة false", "نعم، وتوقف البرنامج حين تصل false"],
      answer: 0,
      why: "switch التعبير يجب أن يرجع قيمة في كل حالة ممكنة. bool له قيمتان، وغُطّيت واحدة. المترجم يعدّ الحالات قبل التشغيل ويرفض الناقص، فلا تصل أبداً إلى حالة بلا جواب.",
      scene: dart(
        `String kind(bool done) => switch (done) {
  true => "done",
};`,
        [
          { line: 1, say: "الدالة ترجع String، والقيمة هي ناتج switch على done.", memory: [] },
          { line: 2, say: "حالة واحدة: true. المترجم يسأل: وماذا لو كانت done هي false؟", memory: [] },
          {
            line: 1,
            say: "لا جواب لـ false، فيُرفض البرنامج كله. أضف false => \"todo\"‎ أو ‎_ => \"todo\"‎.",
            memory: [],
            error: "The type 'bool' is not exhaustively matched by the switch cases since it doesn't match 'false'.",
          },
        ],
      ),
    },
    {
      question: "day هو \"fri\". ماذا يطبع هذا الكود؟",
      code: `switch (day) {
  case "fri":
    print("weekend");
  case "sat":
    print("weekend too");
}`,
      options: ["weekend فقط", "weekend ثم weekend too", "لا شيء: ينقص break"],
      answer: 0,
      why: "في Dart 3 لا تسقط الحالة إلى التي بعدها: كل case تنتهي وحدها بلا break. في JavaScript كان سيطبع السطرين. هذا يحميك من خطأ شائع: نسيان break.",
      scene: dart(
        `switch (day) {
  case "fri":
    print("weekend");
  case "sat":
    print("weekend too");
}`,
        [
          { line: 1, say: "يقرأ day فيجد \"fri\".", memory: [s("day", "fri")], read: ["day"] },
          { line: 2, say: "الحالة الأولى تطابق.", memory: [s("day", "fri")] },
          { line: 3, say: "يطبع weekend.", memory: [s("day", "fri")], output: ["weekend"] },
          { line: 6, say: "نهاية الحالة: يقفز إلى ما بعد switch، ولا يدخل case \"sat\".", memory: [s("day", "fri")], output: ["weekend"] },
        ],
      ),
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: `var n = 10;
do {
  print(n);
  n++;
} while (n < 5);`,
      options: ["10", "لا شيء", "10 ثم 11 ثم 12 بلا توقف"],
      answer: 0,
      why: "do-while تنفّذ الجسم أولاً ثم تسأل. لذلك يعمل مرة واحدة على الأقل حتى لو كان الشرط خاطئاً من البداية. while العادية كانت لن تطبع شيئاً.",
      scene: dart(
        `var n = 10;
do {
  print(n);
  n++;
} while (n < 5);`,
        [
          { line: 1, say: "n = 10.", memory: [n("n", 10)], changed: ["n"] },
          { line: 3, say: "do تدخل الجسم بلا سؤال: يطبع 10.", memory: [n("n", 10)], read: ["n"], output: ["10"] },
          { line: 4, say: "n يصبح 11.", memory: [n("n", 11)], changed: ["n"], output: ["10"] },
          { line: 5, say: "الآن فقط يُسأل: 11 < 5؟ false، فتنتهي الحلقة.", memory: [n("n", 11)], read: ["n"], output: ["10"] },
        ],
      ),
    },
  ],
  code: {
    intro: "برنامج Dart حقيقي يعمل على خادم التشغيل: يصنّف طلبات بـ switch بأنماط، ويتخطى ويتوقف بـ continue و break. شغّله ثم عدّل كما يقترح التعليق.",
    runnerLang: "dart",
    runnerStarter: `String size(int grams) => switch (grams) {
  < 250 => "small",
  < 1000 => "medium",
  _ => "large",
};

void main() {
  final orders = [120, 0, 900, 4000, 300];
  var shipped = 0;
  for (final g in orders) {
    if (g == 0) continue; // an empty order: skip it
    print("$g g -> \${size(g)}");
    shipped++;
    if (shipped == 3) break; // the van holds 3 parcels
  }
  print("shipped $shipped");

  var countdown = 3;
  while (countdown > 0) {
    print(countdown--);
  }
  // try: let the van hold 4, or remove the "_" case and run
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "dart",
      title: "مجموع الزوجي",
      prompt: "رتّب الأسطر: اجمع الأعداد الزوجية من 1 إلى 6 بتخطي الفردية بـ continue، واطبع 12.",
      lines: [
        "void main() {",
        "  var sum = 0;",
        "  for (var i = 1; i <= 6; i++) {",
        "    if (i.isOdd) continue;",
        "    sum += i;",
        "  }",
        "  print(sum);",
        "}",
      ],
      expected: "12",
    },
    {
      kind: "fill",
      lang: "dart",
      title: "الحالة الباقية",
      prompt: "كل وزن يجب أن يجد تصنيفاً. ماذا تكتب في الحالة الأخيرة ليقبل المترجم switch ويطبع large؟",
      template: `String size(int g) => switch (g) {
  < 250 => "small",
  < 1000 => "medium",
  ___ => "large",
};

void main() => print(size(1500));`,
      options: ["_", "default", "else"],
      answer: "_",
      expected: "large",
    },
    {
      kind: "fix",
      lang: "dart",
      title: "دورة زائدة",
      prompt: "الحلقة يجب أن تعمل 5 مرات بالضبط، لكن البرنامج يطبع 6. أصلح الشرط.",
      code: `void main() {
  var count = 0;
  for (var i = 0; i <= 5; i++) {
    count++;
  }
  print(count);
}`,
      expected: "5",
      hint: "i يبدأ من 0. اكتب القيم التي يمر بها i حتى يفشل الشرط: كم قيمة هي؟",
      solution: `void main() {
  var count = 0;
  for (var i = 0; i < 5; i++) {
    count++;
  }
  print(count);
}`,
    },
    {
      kind: "write",
      lang: "dart",
      title: "فردي أم زوجي",
      prompt: "اكتب حلقة من 1 إلى 5 تطبع كل عدد ومعه odd أو even، هكذا: 1 odd ثم 2 even ... حتى 5 odd.",
      starter: `void main() {
  // loop from 1 to 5 and print "<n> odd" or "<n> even"
}
`,
      expected: "1 odd\n2 even\n3 odd\n4 even\n5 odd",
      hint: "for (var i = 1; i <= 5; i++)‎، وداخلها: print(\"$i ${i.isEven ? \"even\" : \"odd\"}\");",
      solution: `void main() {
  for (var i = 1; i <= 5; i++) {
    print("$i \${i.isEven ? "even" : "odd"}");
  }
}
`,
    },
  ],
  quiz: [
    {
      question: "ماذا يحدث هنا؟",
      code: "var count = 3;\nif (count) {\n  print(\"has items\");\n}",
      options: ["المترجم يرفض: الشرط يجب أن يكون bool", "يطبع has items", "لا يطبع شيئاً"],
      answer: 0,
      why: "Dart لا يعامل الأعداد أو النصوص كأنها true أو false كما تفعل JavaScript. الشرط يجب أن يكون قيمة bool: اكتب if (count > 0)‎.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: 'for (var i = 0; i < 3; i++) {\n  for (var j = 0; j < 3; j++) {\n    if (j == 1) break;\n    print("$i$j");\n  }\n}',
      options: ["00 ثم 10 ثم 20", "00 فقط", "00 ثم 01 ثم 02"],
      answer: 0,
      why: "break يخرج من أقرب حلقة فقط، أي حلقة j. الحلقة الخارجية تكمل: لكل i يُطبع j = 0 ثم تنكسر حلقة j عند 1.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: 'final score = 85;\nfinal grade = switch (score) {\n  >= 90 => "A",\n  >= 80 when score.isOdd => "B+",\n  >= 80 => "B",\n  _ => "C",\n};\nprint(grade);',
      options: ["B+", "B", "A"],
      answer: 0,
      why: "الحالات تُجرَّب بالترتيب. ‏85 ليست ≥ 90. ثم ≥ 80 مع الحارس when: هل 85 فردي؟ نعم، فالنتيجة B+ ويتوقف البحث.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: "var i = 0;\nwhile (i < 5) {\n  i++;\n  if (i == 3) continue;\n  print(i);\n}",
      options: ["1 2 4 5", "1 2", "0 1 2 4"],
      answer: 0,
      why: "continue تتخطى ما بقي من الدورة الحالية وتعود إلى الشرط. حين i = 3 لا يُطبع، والباقي يُطبع. i يزيد قبل الطباعة، فأول ما يُطبع 1.",
    },
    {
      question: "t = 35. ماذا يُطبع؟",
      code: 'final t = 35;\nif (t > 20) {\n  print("warm");\n} else if (t > 30) {\n  print("hot");\n}',
      options: ["warm", "hot", "warm ثم hot"],
      answer: 0,
      why: "سلسلة if / else if تدخل أول فرع شرطه صحيح ثم تتخطى الباقي. ‏35 > 20 صحيح، فلا يُسأل الشرط الثاني أبداً. لذلك ضع الشرط الأضيق (t > 30) أولاً.",
    },
  ],
  next: "dart-functions",
};
