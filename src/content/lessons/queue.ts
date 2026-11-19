import type { Lesson } from "@/lib/types";

export const queue: Lesson = {
  slug: "queue",
  stage: 3,
  number: "3.4",
  title: "الطابور",
  subtitle: "صفّ أمام شبّاك: تنضم من الخلف وتخرج من الأمام، فأول الواصلين أول المخدومين",
  minutes: 15,
  problem: {
    title: "من يُخدم أولاً؟",
    body: "أنت موظف في شبّاك البنك. أدخل العملاء ثم اخدمهم، مرة بطابور ومرة بمكدّس. راقب كم ينتظر أول من وصل.",
    demo: "queue",
  },
  scene: {
    trace: "py",
    steps: [],
    code: {
      py: `line = ["Ali", "Sara", "Omar"]
front = 0
line.append("Huda")
served = line[front]
front = front + 1
print("serve:", served)
print("next:", line[front])
print("waiting:", len(line) - front)`,
      js: `let line = ["Ali", "Sara", "Omar"];
let front = 0;
line.push("Huda");
let served = line[front];
front = front + 1;
console.log("serve:", served);
console.log("next:", line[front]);
console.log("waiting:", line.length - front);`,
      go: `line := []string{"Ali", "Sara", "Omar"}
front := 0
line = append(line, "Huda")
served := line[front]
front = front + 1
fmt.Println("serve:", served)
fmt.Println("next:", line[front])
fmt.Println("waiting:", len(line)-front)`,
    },
    notes: {
      py: "line.pop(0)‎ تخدم الأول أيضاً، لكنها تزحزح كل من خلفه خانة. لذلك يمشي front على الصف بدل أن يتحرك الصف، وفي المكتبة collections.deque طابور جاهز سريع من الطرفين.",
      js: "line.shift()‎ تأخذ الأول، لكنها تنقل كل العناصر الباقية خانة إلى الأمام: مع مليون عميل، مليون نقلة لكل خدمة. رقم front يجعل الخدمة خطوة واحدة.",
      go: "append تضيف في آخر الشريحة، وfront رقم عادي. ويمكن أيضاً قصّ الشريحة بـ line = line[1:]‎ دون نقل أي عنصر: الشريحة تبدأ من خانة أبعد فقط.",
    },
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "طابور بنك بقائمة Python ورقم front. شغّل وراقب: القائمة لا تفقد أحداً، لكن front يتقدم خانة مع كل عميل يُخدم.",
    starter: `line = []
front = 0
for name in ["Ali", "Sara", "Omar"]:
    line.append(name)
while front < len(line):
    print("serving", line[front])
    front = front + 1
print("done")`,
    challenges: [
      "أضف بعد الحلقة الأولى: line.append(\"Huda\"). أين ستقف Huda، ومتى ستُخدم؟ توقّع قبل أن تضغط.",
      "داخل while، أضف: if line[front] == \"Ali\": line.append(\"Zaid\"). هل يُخدم Zaid في هذه الحلقة نفسها؟",
      "استبدل line[front] وسطر front كله بـ line.pop(0)، والشرط بـ len(line) > 0. ماذا يتغير في القائمة على اليمين مع كل خدمة؟",
      "بدّل pop(0) إلى pop()‎. بأي ترتيب يُخدم العملاء الآن؟ هل ما زال طابوراً؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج بلغة Python؟",
      lang: "py",
      code: `q = [1, 2, 3]
q.append(4)
print(q.pop(0), q.pop(0))`,
      options: ["1 2", "4 3", "1 4"],
      answer: 0,
      why: "append تضيف في الخلف، وpop(0) تأخذ من الأمام. 1 و 2 كانا أول الواصلين فيخرجان أولاً، و4 تنتظر خلف 3.",
    },
    {
      question: "نفس العمليات على صفّين: أحدهما مكدّس والآخر طابور. ماذا يُطبع؟",
      code: `let s = [];
let q = [];
for (let i = 1; i <= 3; i++) {
  s.push(i);
  q.push(i);
}
console.log(s.pop(), q.shift());`,
      options: ["3 1", "3 3", "1 1"],
      answer: 0,
      why: "الدخول متطابق، والفرق كله في جهة الخروج. المكدّس يُخرج من نفس الطرف الذي دخل منه آخر واحد (3)، والطابور من الطرف الآخر حيث ينتظر أول واحد (1).",
    },
    {
      question: "ماذا يُطبع؟",
      code: `let line = ["A", "B", "C"];
let front = 0;
front = front + 1;
front = front + 1;
line.push("D");
console.log(line.length, line.length - front);`,
      options: ["4 2", "2 2", "4 4"],
      answer: 0,
      why: "تقدّم front لا يحذف شيئاً من الصف: A و B ما زالا في خانتيهما، والطول 4. لكن المنتظرين فعلاً هم من عند front فما بعد: C و D، أي 2.",
    },
  ],
  code: {
    intro: "الطابور فكرة واحدة في كل اللغات: أضف في الخلف، وخذ من الأمام. الفخ واحد أيضاً: الأخذ من أول مصفوفة يزحزح كل ما بعده. لذلك يحفظ الطابور الحقيقي رقماً للأمام، أو يستعمل قائمة مترابطة، أو بنية جاهزة مثل deque في Python. هنا طابور طباعة بالطريقتين: رقم front، وdeque.",
    runnerLang: "py",
    runnerStarter: `from collections import deque

jobs = ["report.pdf", "photo.png", "cv.docx"]
front = 0
jobs.append("ticket.pdf")
while front < len(jobs):
    print("printing", jobs[front])
    front = front + 1

waiting = deque(["a.txt", "b.txt"])
waiting.append("c.txt")
print(waiting.popleft(), "->", list(waiting))
# جرّب: أضف ملفاً جديداً داخل الحلقة الأولى، وانظر هل يُطبع في نفس الدورة
`,
  },
  exercises: [
    {
      kind: "order",
      title: "طابور الرسائل",
      lang: "py",
      prompt: "رتّب الأسطر: رسالتان تصلان، ثم تُعالج الأولى منهما. يجب أن يطبع hi ثم عدد الرسائل الباقية 1.",
      lines: [
        "inbox = []",
        'inbox.append("hi")',
        'inbox.append("bye")',
        "first = inbox.pop(0)",
        "print(first)",
        "print(len(inbox))",
      ],
      expected: "hi\n1",
    },
    {
      kind: "fill",
      title: "الأول في الصف",
      prompt: "أي تعبير يُخرج أول من وصل إلى الطابور؟",
      template: 'let line = ["Ali", "Sara", "Omar"];\nconsole.log(___);',
      options: ["line.shift()", "line.pop()", "line[line.length - 1]"],
      expected: "Ali",
    },
    {
      kind: "fix",
      title: "الشبّاك الظالم",
      lang: "py",
      prompt: "هذا الشبّاك يخدم آخر من وصل أولاً. أصلحه حتى يخدم بترتيب الوصول: Ali ثم Sara ثم Omar.",
      code: 'line = ["Ali", "Sara", "Omar"]\nwhile len(line) > 0:\n    print(line.pop())',
      expected: "Ali\nSara\nOmar",
      hint: "pop()‎ بلا رقم تأخذ من الخلف. أعطها رقم الخانة الأولى.",
      solution: 'line = ["Ali", "Sara", "Omar"]\nwhile len(line) > 0:\n    print(line.pop(0))',
    },
    {
      kind: "write",
      title: "طابور بلا زحزحة",
      prompt: "عندك طابور طباعة jobs = [\"a\", \"b\", \"c\"]. استعمل رقماً front يبدأ من 0 (بلا shift) لتطبع كل مهمة بترتيبها، ثم اطبع done.",
      starter: 'let jobs = ["a", "b", "c"];\n// front يشير إلى أول من ينتظر\n',
      expected: "a\nb\nc\ndone",
      hint: "let front = 0;  ثم while (front < jobs.length) { console.log(jobs[front]); front = front + 1; }",
      solution: `let jobs = ["a", "b", "c"];
let front = 0;
while (front < jobs.length) {
  console.log(jobs[front]);
  front = front + 1;
}
console.log("done");`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع؟",
      code: 'let q = [];\nq.push("x");\nq.push("y");\nq.push("z");\nq.shift();\nconsole.log(q[0]);',
      options: ["y", "x", "z"],
      answer: 0,
      why: "x وصل أولاً فخرج أولاً. الأمام الآن هو y، وz ما زال في الخلف.",
    },
    {
      question: "طابور فيه مليون عميل في مصفوفة. ماذا يحدث عند كل q.shift()‎؟",
      options: ["يُنقل كل العملاء الباقين خانة إلى الأمام", "يُحذف الأول فقط دون أن يتحرك أحد", "تُنسخ المصفوفة إلى مكان جديد"],
      answer: 0,
      why: "المصفوفة خانات متجاورة تبدأ من 0. حين تخرج الخانة 0، يجب أن يصير الثاني في الخانة 0، والثالث في 1... مليون نقلة لخدمة واحدة. لذلك يمشي رقم front بدل أن يمشي الصف.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'let line = ["A", "B"];\nlet front = 0;\nline.push("C");\nfront = front + 1;\nconsole.log(line[front]);',
      options: ["B", "A", "C"],
      answer: 0,
      why: "front تقدّم من 0 إلى 1، فالأمام الآن الخانة 1 وفيها B. وC انضمت في الخلف ولم تؤثر على الأمام.",
    },
    {
      question: "عملاء وصلوا بالترتيب 1، 2، 3، 4. الشبّاك يخدم دائماً آخر من وصل. من ينتظر أطول؟",
      options: ["العميل 1", "العميل 4", "ينتظرون كلهم بالتساوي"],
      answer: 0,
      why: "هذا مكدّس لا طابور: آخر الداخلين أول الخارجين. العميل 1 في القاع، ولا يُخدم حتى يُخدم كل من جاء بعده، وكلما وصل جديد تأخر أكثر.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'let q = ["a"];\nlet out = "";\nwhile (q.length > 0) {\n  let x = q.shift();\n  out = out + x;\n  if (x === "a") {\n    q.push("b");\n    q.push("c");\n  }\n}\nconsole.log(out);',
      options: ["abc", "acb", "a"],
      answer: 0,
      why: "a يُخدم ويُدخل b ثم c في الخلف، فيُخدمان بترتيب دخولهما. هكذا يستكشف الطابور الأقرب أولاً ثم الأبعد، وستراه في الرسوم البيانية باسم البحث بالعرض.",
    },
  ],
  next: "hash",
};
