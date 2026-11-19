import type { Lesson } from "@/lib/types";

export const recursion: Lesson = {
  slug: "recursion",
  stage: 1,
  number: "1.14",
  title: "العودية",
  subtitle: "دالة تستدعي نفسها على مسألة أصغر، حتى تصل إلى القاع ثم ترجع",
  minutes: 18,
  problem: {
    title: "كم دمية في الداخل؟",
    body: "أمامك دمى متداخلة. لا تعرف عددها، لكنك تعرف قاعدة واحدة: افتح الدمية، واسأل من في داخلها. اضغط خطوة خطوة، ثم جرّب نسيان القاع.",
    demo: "recursion",
  },
  scene: {
    trace: true,
    steps: [],
    code: {
      js: `function sumTo(n) {
  if (n === 0) {
    return 0;
  }
  return n + sumTo(n - 1);
}
let total = sumTo(3);
console.log(total);`,
      ts: `function sumTo(n: number): number {
  if (n === 0) {
    return 0;
  }
  return n + sumTo(n - 1);
}
let total: number = sumTo(3);
console.log(total);`,
      py: `def sum_to(n):
    if n == 0:
        return 0

    return n + sum_to(n - 1)

total = sum_to(3)
print(total)`,
      go: `func sumTo(n int) int {
	if n == 0 {
		return 0
	}
	return n + sumTo(n-1)
}
total := sumTo(3)
fmt.Println(total)`,
      dart: `int sumTo(int n) {
  if (n == 0) {
    return 0;
  }
  return n + sumTo(n - 1);
}
int total = sumTo(3);
print(total);`,
      rust: `fn sum_to(n: i32) -> i32 {
    if n == 0 {
        return 0;
    }
    return n + sum_to(n - 1);
}
let total = sum_to(3);
println!("{}", total);`,
    },
    notes: {
      js: "لا كلمة خاصة للعودية: الدالة تذكر اسمها داخل جسمها فقط. كل استدعاء sumTo(n - 1) يضع إطاراً جديداً فيه n خاص به.",
      ts: "مثل JavaScript. نوع ما ترجعه ‎: number مهم هنا، لأن الدالة تستخدم ما ترجعه نفسها في حسابها.",
      py: "لا أقواس معقوفة، فالسطران 4 و 6 فارغان. وسمّيناها sum_to لأن sum اسم دالة جاهزة في Python. وPython توقف العودية بعد نحو ألف إطار بخطأ RecursionError.",
      go: "العودية تعمل كما هي، ونكتب n-1 بلا مسافات كما يرتّبها gofmt. مكدّس Go يكبر تلقائياً، لذلك يحتمل عمقاً كبيراً جداً قبل أن يمتلئ.",
      dart: "مثل JavaScript مع الأنواع. وفي Dart يُكتب الشرط بـ == لا ===.",
      rust: "يجب أن يُكتب نوع ما ترجعه الدالة (-> i32). وعند امتلاء المكدّس يتوقف البرنامج برسالة stack overflow.",
    },
  },
  playground: {
    kind: "trace",
    intro: "عدّ تنازلي بالعودية. شغّل وراقب المكدّس: إطار countdown فوق إطار، كل واحد بـ n أصغر، حتى يصل n إلى 0 فيطبع go!، ثم تُزال الإطارات من الأعلى.",
    starter: `function countdown(n) {
  if (n === 0) {
    console.log("go!");
    return;
  }
  console.log(n);
  countdown(n - 1);
}
countdown(3);`,
    challenges: [
      "غيّر countdown(3) إلى countdown(5). كم إطاراً لـ countdown ستراه في أعلى لحظة؟ توقّع قبل أن تضغط.",
      "انقل السطر console.log(n) إلى ما بعد countdown(n - 1). بأي ترتيب ستُطبع الأرقام الآن؟",
      "غيّر الشرط إلى n === 2. أين يقف البرج الآن، وما الذي لن يُطبع؟",
      "اكتب دالة factorial(n) ترجع 1 عندما n === 1، وإلا n * factorial(n - 1)، واطبع factorial(4).",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج، وبأي ترتيب؟",
      code: `function show(n) {
  if (n === 0) {
    return;
  }
  show(n - 1);
  console.log(n);
}
show(3);`,
      options: ["3 ثم 2 ثم 1", "1 ثم 2 ثم 3", "لا شيء"],
      answer: 1,
      why: "إطار show(3) لا يطبع قبل أن ينتهي show(2)، وهذا لا يطبع قبل show(1). البرج يُبنى أولاً بلا طباعة، ثم يطبع كل إطار وهو يُزال من الأعلى: 1 أولاً، ثم 2، ثم 3.",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `function fact(n) {
  if (n === 1) {
    return 1;
  }
  return n * fact(n - 1);
}
console.log(fact(4));`,
      options: ["24", "1", "10"],
      answer: 0,
      why: "القاع يرجع 1 لمن فوقه فقط، لا للبرنامج كله. ثم كل إطار يكمل عمله المعلّق بما وصله: 2 × 1 = 2، ثم 3 × 2 = 6، ثم 4 × 6 = 24.",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `function f(n) {
  if (n === 0) {
    return 0;
  }
  f(n - 1);
  return n;
}
console.log(f(3));`,
      options: ["3", "0", "6"],
      answer: 0,
      why: "كل إطار له درج n خاص به. الاستدعاءات فوقه أخذت 2 و 1 و 0 في أدراجها هي، ولم تلمس n في إطار f(3). وما رجع من f(n - 1) لم يُستخدم، فيرجع الإطار الأول 3.",
    },
  ],
  code: {
    intro: "العودية متشابهة في كل اللغات: شرط القاع أولاً، ثم استدعاء الدالة لنفسها على شيء أصغر. الاختلاف في عمق المكدّس المسموح: Python تتوقف بعد نحو ألف إطار، وغيرها يحتمل أكثر، لكن لكل مكدّس سقف. بدّل اللغة فوق، ثم عدّل الكود وشغّله.",
    runnerStarter: `function factorial(n) {
  if (n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}
function sumArray(arr, i) {
  if (i === arr.length) {
    return 0;
  }
  return arr[i] + sumArray(arr, i + 1);
}
console.log(factorial(5));
console.log(sumArray([4, 8, 15], 0));
// جرّب: احذف شرط القاع من factorial وشغّل. ما الخطأ الذي يظهر؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "العدّ التنازلي",
      prompt: "رتّب الأسطر حتى يطبع البرنامج 3 ثم 2 ثم 1 ثم go.",
      lines: [
        "function countdown(n) {",
        "  if (n === 0) {",
        '    console.log("go");',
        "    return;",
        "  }",
        "  console.log(n);",
        "  countdown(n - 1);",
        "}",
        "countdown(3);",
      ],
      expected: "3\n2\n1\ngo",
    },
    {
      kind: "fill",
      title: "خطوة نحو القاع",
      prompt: "أي قيمة تجعل البرنامج يطبع 10 (أي 4 + 3 + 2 + 1)؟",
      template: "function sum(n) {\n  if (n === 0) {\n    return 0;\n  }\n  return n + sum(___);\n}\nconsole.log(sum(4));",
      options: ["n + 1", "n - 1", "n"],
      expected: "10",
    },
    {
      kind: "fix",
      title: "البرج بلا قاع",
      prompt: "هذا البرنامج يملأ المكدّس ويتوقف بخطأ بدل أن يطبع 120. أصلحه.",
      code: "function fact(n) {\n  return n * fact(n - 1);\n}\nconsole.log(fact(5));",
      expected: "120",
      hint: "لا شيء يوقف نمو البرج. أضف في أول الدالة: إذا كان n يساوي 1 فارجع 1.",
      solution: `function fact(n) {
  if (n === 1) {
    return 1;
  }
  return n * fact(n - 1);
}
console.log(fact(5));`,
    },
    {
      kind: "write",
      title: "القوة",
      prompt: "اكتب دالة عودية power(base, exp) ترجع base مضروباً في نفسه exp مرة، ثم اطبع power(2, 10) و power(3, 3).",
      starter: "// القاع: إذا كان exp يساوي 0 فالنتيجة 1\n// غير ذلك: base * power(base, exp - 1)\n",
      expected: "1024\n27",
      hint: "if (exp === 0) { return 1; }  ثم  return base * power(base, exp - 1);",
      solution: `function power(base, exp) {
  if (exp === 0) {
    return 1;
  }
  return base * power(base, exp - 1);
}
console.log(power(2, 10));
console.log(power(3, 3));`,
    },
  ],
  quiz: [
    {
      question: "في أعمق لحظة، كم إطاراً لـ sumTo على المكدّس (بلا الإطار العام)؟",
      code: "function sumTo(n) {\n  if (n === 0) {\n    return 0;\n  }\n  return n + sumTo(n - 1);\n}\nconsole.log(sumTo(4));",
      options: ["4", "5", "1"],
      answer: 1,
      why: "إطار لكل قيمة من n: 4 و 3 و 2 و 1، ثم إطار القاع n = 0. خمسة إطارات فوق بعضها، ثم تُزال من الأعلى.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'function f(n) {\n  if (n === 0) {\n    return "";\n  }\n  return f(n - 1) + n;\n}\nconsole.log(f(3));',
      options: ["123", "321", "6"],
      answer: 0,
      why: "القاع يرجع نصاً فارغاً. ثم يضيف كل إطار رقمه بعد ما وصله من فوق: \"\" + 1، ثم \"1\" + 2، ثم \"12\" + 3. النتيجة نص 123.",
    },
    {
      question: "ماذا يحدث؟",
      code: "function f(n) {\n  if (n === 0) {\n    return 0;\n  }\n  return f(n);\n}\nconsole.log(f(2));",
      options: ["يطبع 0", "يطبع 2", "خطأ: امتلأ المكدّس"],
      answer: 2,
      why: "القاع موجود، لكن المسألة لا تصغر: كل إطار جديد يأخذ n = 2 من جديد، فلا يصل إلى 0 أبداً. البرج ينمو حتى يمتلئ المكدّس.",
    },
    {
      question: "ماذا يحدث؟",
      code: "function f(n) {\n  if (n === 0) {\n    return 0;\n  }\n  return f(n - 2);\n}\nconsole.log(f(3));",
      options: ["يطبع 0", "خطأ: امتلأ المكدّس", "يطبع 1"],
      answer: 1,
      why: "n يصغر فعلاً: 3 ثم 1 ثم -1 ثم -3... لكنه يقفز فوق 0 ولا يقف عليه. الشرط n === 0 لا يصدق أبداً، فلا قاع، والبرج ينمو حتى يمتلئ المكدّس.",
    },
    {
      question: "ماذا يُطبع، وبأي ترتيب؟",
      code: 'function g(n) {\n  if (n === 0) {\n    return;\n  }\n  console.log("in " + n);\n  g(n - 1);\n  console.log("out " + n);\n}\ng(2);',
      options: ["in 2، in 1، out 1، out 2", "in 2، out 2، in 1، out 1", "in 2، in 1، out 2، out 1"],
      answer: 0,
      why: "الطريق صعوداً يطبع in وهو يضع الإطارات: 2 ثم 1. وبعد القاع يكمل كل إطار ما بقي عليه وهو يُزال من الأعلى، فالأعلى (1) يطبع out أولاً.",
    },
  ],
  next: "errors",
};
