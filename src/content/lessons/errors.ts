import type { Lesson } from "@/lib/types";

export const errors: Lesson = {
  slug: "errors",
  stage: 1,
  number: "1.15",
  title: "الأخطاء",
  subtitle: "الخطأ ليس حاسوباً غاضباً، بل رسالة تخبرك ماذا حدث وأين",
  minutes: 16,
  problem: {
    title: "طرد يسقط بين الطوابق",
    body: "دالة في الطابق العلوي رمت خطأً. ضع شبكة (catch) في أحد الطوابق ثم أسقط الطرد. وجرّب مرة بلا شبكة.",
    demo: "errors",
  },
  scene: {
    trace: true,
    steps: [],
    code: {
      js: `function divide(a, b) {
  if (b === 0) throw new Error("cannot divide by zero");
  return a / b;
}
try {
  console.log(divide(10, 0));
} catch (e) {
  console.log("Oops: " + e.message);
}`,
      ts: `function divide(a: number, b: number): number {
  if (b === 0) throw new Error("cannot divide by zero");
  return a / b;
}
try {
  console.log(divide(10, 0));
} catch (e) {
  console.log("Oops: " + (e as Error).message);
}`,
      py: `def divide(a, b):
    if b == 0: raise ValueError("cannot divide by zero")
    return a / b

try:
    print(divide(10, 0))
except ValueError as e:
    print("Oops: " + str(e))
`,
      go: `func divide(a, b float64) (float64, error) {
	if b == 0 { return 0, errors.New("cannot divide by zero") }
	return a / b, nil
}
if result, err := divide(10, 0); err == nil {
	fmt.Println(result)
} else {
	fmt.Println("Oops: " + err.Error())
}`,
      dart: `double divide(double a, double b) {
  if (b == 0) throw Exception("cannot divide by zero");
  return a / b;
}
try {
  print(divide(10, 0));
} catch (e) {
  print("Oops: $e");
}`,
      rust: `fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 { return Err("cannot divide by zero".to_string()); }
    Ok(a / b)
}
match divide(10.0, 0.0) {
    Ok(v) => println!("{}", v),
    Err(e) =>
        println!("Oops: {}", e),
}`,
    },
    notes: {
      js: "throw يرمي الخطأ فيقفز التنفيذ فوراً خارج الإطار إلى أقرب catch. new Error يصنع كائناً فيه name و message.",
      ts: "مثل JavaScript، لكن e في catch نوعه unknown، فنقول للمترجم إنه Error بـ (e as Error) قبل قراءة message.",
      py: "raise بدل throw، و except بدل catch، ويُذكر نوع الخطأ الذي نلتقطه (ValueError). الرسالة نقرؤها بـ str(e).",
      go: "Go لا ترمي الأخطاء: الدالة ترجع الخطأ كقيمة ثانية بجانب النتيجة، والمستدعي يفحص err بـ if بنفسه.",
      dart: "throw و try/catch كما في JavaScript، وغالباً يُرمى Exception. طباعة $e تعطي Exception: cannot divide by zero.",
      rust: "Rust لا ترمي أيضاً: الدالة ترجع Result، إما Ok(قيمة) أو Err(خطأ)، و match يفرّق بينهما. وعلامة ? بعد الاستدعاء تمرّر Err إلى المستدعي، كخطأ يصعد إطاراً.",
    },
  },
  playground: {
    kind: "trace",
    intro: "خطأ يولد في checkAge، أعلى المكدّس. شغّل وراقب: يخرج من إطار checkAge، ثم من إطار register، حتى يصل إلى catch في الإطار العام. و finally تعمل في النهاية دائماً.",
    starter: `function checkAge(age) {
  if (age < 0) throw new Error("age cannot be negative");
  return age;
}
function register(name, age) {
  let a = checkAge(age);
  return name + " is " + a;
}
try {
  console.log(register("Sara", -3));
} catch (e) {
  console.log("Sorry: " + e.message);
} finally {
  console.log("done");
}`,
    challenges: [
      "غيّر -3 إلى 20. توقّع قبل أن تضغط: هل يعمل catch؟ وهل يعمل finally؟",
      "احذف try و catch و finally واترك السطر console.log(register(\"Sara\", -3)) وحده. ماذا يحدث للبرنامج؟",
      "اطبع e.name بجانب e.message في catch. ما اسم نوع الخطأ؟",
      "انقل try/catch إلى داخل register حول السطر let a = checkAge(age). في أي إطار يُلتقط الخطأ الآن؟",
    ],
  },
  predict: [
    {
      question: "ماذا يُطبع، وبأي ترتيب؟",
      code: `try {
  console.log("A");
  throw new Error("boom");
  console.log("B");
} catch (e) {
  console.log("C");
}
console.log("D");`,
      options: ["A ثم C ثم D", "A ثم B ثم C ثم D", "A ثم C ويتوقف البرنامج"],
      answer: 0,
      why: "throw يقفز فوراً إلى catch، فلا يصل التنفيذ إلى B أبداً. وبعد catch يكمل البرنامج طبيعياً، فيُطبع D.",
    },
    {
      question: "outer لا تحتوي catch. ماذا يُطبع؟",
      code: `function inner() {
  throw new Error("deep");
}
function outer() {
  inner();
  console.log("after inner");
}
try {
  outer();
} catch (e) {
  console.log("caught: " + e.message);
}`,
      options: ["caught: deep", "after inner ثم caught: deep", "يتوقف البرنامج لأن outer لا تحتوي catch"],
      answer: 0,
      why: "الخطأ يسقط من إطار inner إلى إطار outer، ولا شبكة هناك فيكمل سقوطه ويُزال إطار outer قبل أن تطبع، حتى يصل إلى catch في الإطار العام.",
    },
    {
      question: "أردنا مجموع 1 و 2 و 3. ماذا يُطبع؟",
      code: `let total = 0;
for (let i = 1; i < 3; i++) {
  total = total + i;
}
console.log(total);`,
      options: ["6", "3", "خطأ في السطر 2"],
      answer: 1,
      why: "لا رسالة خطأ هنا: البرنامج صحيح الكتابة ويعمل، لكن i < 3 يتوقف قبل 3. هذا خطأ منطقي، لا يكتشفه إلا من يتتبّع القيم خطوة خطوة.",
    },
  ],
  code: {
    intro: "الالتقاط يجعل البرنامج يكمل بأدب بدل أن يتوقف عند أول إدخال سيئ. بعض اللغات ترمي الخطأ (JavaScript و Python و Dart)، وبعضها يرجعه قيمةً (Go و Rust). بدّل اللغة فوق، ثم شغّل الكود بالأسفل.",
    runnerStarter: `function parseAge(text) {
  let n = Number(text);
  if (isNaN(n)) throw new Error("not a number: " + text);
  if (n < 0) throw new Error("negative age: " + n);
  return n;
}
let inputs = ["25", "abc", "-4", "40"];
for (let text of inputs) {
  try {
    console.log("ok " + parseAge(text));
  } catch (e) {
    console.log("skipped (" + e.message + ")");
  }
}
// جرّب: احذف try و catch واترك console.log وحده. عند أي إدخال يتوقف البرنامج؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "الشبكة",
      prompt: "رتّب الأسطر حتى يُلتقط الخطأ ويكمل البرنامج: يطبع empty name ثم still running.",
      lines: ["try {", '  throw new Error("empty name");', "} catch (e) {", "  console.log(e.message);", "}", 'console.log("still running");'],
      expected: "empty name\nstill running",
    },
    {
      kind: "fill",
      title: "اقرأ الرسالة",
      prompt: "ماذا نطبع داخل catch حتى يظهر نص الخطأ فقط: odd number؟",
      template: 'function half(n) {\n  if (n % 2 !== 0) throw new Error("odd number");\n  return n / 2;\n}\ntry {\n  console.log(half(7));\n} catch (e) {\n  console.log(___);\n}',
      options: ["e.message", "e", "half(7)"],
      expected: "odd number",
    },
    {
      kind: "fix",
      title: "اسم غير موجود",
      prompt: "هذا البرنامج يتوقف برسالة ReferenceError. اقرأ الرسالة: أي اسم غير موجود؟ أصلحه ليطبع 60.",
      code: "let price = 20;\nlet count = 3;\nconsole.log(price * cuont);",
      expected: "60",
      hint: "الرسالة تقول cuont is not defined. قارن هذا الاسم بالدرج الذي أنشأته فعلاً.",
      solution: "let price = 20;\nlet count = 3;\nconsole.log(price * count);",
    },
    {
      kind: "write",
      title: "قسمة آمنة",
      prompt: "اكتب دالة safeDivide(a, b) ترمي Error برسالة cannot divide by zero إذا كان b صفراً، وإلا ترجع a / b. ثم داخل try اطبع safeDivide(10, 2) ثم safeDivide(1, 0)، وفي catch اطبع \"error: \" + e.message. المطلوب: 5 ثم error: cannot divide by zero.",
      starter: "// اكتب الدالة، ثم try/catch حول الاستدعاءين\n",
      expected: "5\nerror: cannot divide by zero",
      hint: 'داخل الدالة: if (b === 0) throw new Error("cannot divide by zero");  ثم return a / b;',
      solution: `function safeDivide(a, b) {
  if (b === 0) throw new Error("cannot divide by zero");
  return a / b;
}
try {
  console.log(safeDivide(10, 2));
  console.log(safeDivide(1, 0));
} catch (e) {
  console.log("error: " + e.message);
}`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع؟",
      code: 'console.log("A");\nconsole.log("B";',
      options: ["A ثم رسالة خطأ", "لا شيء، فقط SyntaxError", "A ثم B"],
      answer: 1,
      why: "خطأ الكتابة (قوس ناقص) يمنع قراءة البرنامج كله قبل أن يبدأ. لا يعمل أي سطر، حتى السطر الأول السليم.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'console.log("A");\nconsole.log(score);\nconsole.log("B");',
      options: ["A ثم ReferenceError ويتوقف", "A ثم B", "ReferenceError فقط"],
      answer: 0,
      why: "هذا خطأ تشغيل: البرنامج قُرئ وبدأ، فطبع A. عند السطر 2 لم يجد درجاً اسمه score فتوقف هناك، ولم يصل إلى B.",
    },
    {
      question: "ظهرت هذه الرسالة: TypeError: Cannot read properties of undefined (reading 'length') في السطر 4. ماذا تخبرك؟",
      options: [
        "في السطر 4 قيمة ما هي undefined، وحاولنا أن نقرأ منها length",
        "كلمة length مكتوبة خطأً في السطر 4",
        "الحاسوب لا يعرف ما هي length",
      ],
      answer: 0,
      why: "اقرأ الرسالة بأجزائها الثلاثة: النوع TypeError (عملية على قيمة لا تناسبها)، والنص (قراءة length من undefined)، والسطر 4. ابحث في ذلك السطر عن المتغير الذي لم يأخذ قيمة.",
    },
    {
      question: "ماذا يُطبع، وبأي ترتيب؟",
      code: 'function f() {\n  try {\n    return "from try";\n  } finally {\n    console.log("finally");\n  }\n}\nconsole.log(f());',
      options: ["from try", "finally ثم from try", "from try ثم finally"],
      answer: 1,
      why: "finally تعمل دائماً قبل أن يُغادر التنفيذ try، حتى مع return. فتطبع finally أولاً، ثم يُزال الإطار ويطبع السطر الأخير from try.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'function a() {\n  throw new Error("x");\n}\nfunction b() {\n  try {\n    a();\n  } catch (e) {\n    console.log("b caught");\n  }\n  console.log("b continues");\n}\nb();\nconsole.log("end");',
      options: ["b caught ثم b continues ثم end", "b caught ثم end", "end فقط"],
      answer: 0,
      why: "الخطأ سقط من إطار a إلى إطار b، وهناك وجد شبكة. بعد catch تكمل b عملها كأن شيئاً لم يحدث، ثم يكمل الإطار العام.",
    },
  ],
  next: "decompose",
};
