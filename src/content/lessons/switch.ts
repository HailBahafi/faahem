import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

export const switchLesson: Lesson = {
  slug: "switch",
  stage: 1,
  number: "1.5",
  title: "switch",
  subtitle: "قيمة واحدة تُقرأ مرة، وقفزة مباشرة إلى الحالة المطابقة",
  minutes: 15,
  problem: {
    title: "سؤال بعد سؤال بعد سؤال",
    body: "آلة بيع فيها 6 منتجات. اختر منتجاً، ويُفضّل الأخير، وقارن بين الطريقتين: الأولى تسأل سؤالاً بعد سؤال، والثانية تذهب إلى الجواب مباشرة.",
    demo: "switch",
  },
  scene: {
    code: {
      js: `let floor = 2;
switch (floor) {
  case 1: console.log("Lobby");
    break;
  case 2: console.log("Gym");
    break;
  default: console.log("Roof");
}
console.log("Doors open");`,
      ts: `let floor: number = 2;
switch (floor) {
  case 1: console.log("Lobby");
    break;
  case 2: console.log("Gym");
    break;
  default: console.log("Roof");
}
console.log("Doors open");`,
      py: `floor = 2
match floor:
    case 1: print("Lobby")
        # no break needed
    case 2: print("Gym")
        # no break needed
    case _: print("Roof")

print("Doors open")`,
      go: `floor := 2
switch floor {
case 1: fmt.Println("Lobby")
    // stops here by itself
case 2: fmt.Println("Gym")
    // stops here by itself
default: fmt.Println("Roof")
}
fmt.Println("Doors open")`,
      dart: `int floor = 2;
switch (floor) {
  case 1: print('Lobby');
    break;
  case 2: print('Gym');
    break;
  default: print('Roof');
}
print('Doors open');`,
      rust: `let floor = 2;
match floor {
    1 => println!("Lobby"),
    // each arm ends by itself
    2 => println!("Gym"),
    // each arm ends by itself
    _ => println!("Roof"),
}
println!("Doors open");`,
    },
    notes: {
      js: "في JavaScript المقارنة صارمة (===)، والتنفيذ يكمل إلى الحالة التالية إذا نسيت break. هذا السقوط مقصود في اللغة وليس خطأ منها.",
      ts: "مثل JavaScript تماماً، لكن TypeScript تعرف أن floor رقم، فتعترض إذا كتبت case \"2\" لأنها لن تطابق أبداً.",
      py: "بايثون (منذ 3.10) تكتب match و case، ولا يوجد سقوط: كل حالة تنتهي وحدها، و case _ هي default.",
      go: "في Go كل case ينتهي وحده بلا break. وإذا أردت السقوط إلى الحالة التالية تكتب كلمة fallthrough صراحة.",
      dart: "Dart لا تسقط أبداً إلى حالة فيها كود: في الإصدارات القديمة كان نسيان break خطأ يرفضه المترجم، ومنذ Dart 3 صار break اختيارياً.",
      rust: "Rust تكتب match وكل فرع بعد =>، ولا سقوط فيها. وتُلزمك بتغطية كل القيم الممكنة، لذلك الفرع _ ضروري هنا.",
    },
    steps: [
      { line: null, say: "تخيّل مصعداً. سلسلة if/else-if تقف عند كل طابق وتسأل: هل هذا هو؟ أما switch فتضغط رقم الطابق، والمصعد يذهب إليه مباشرة.", memory: [] },
      { line: 1, say: "درج floor فيه 2. هذا هو الطابق الذي نريده.", memory: [n("floor", 2)], changed: ["floor"] },
      { line: 2, say: "switch تقرأ floor مرة واحدة فقط: القيمة 2. لن تعود لقراءتها مرة أخرى.", memory: [n("floor", 2)], read: ["floor"] },
      { line: 5, say: "تطابق 2 === 2 مع عنوان case 2، فيقفز التنفيذ إليه مباشرة. لاحظ أن السطر 3 لم يُنفَّذ إطلاقاً: المصعد لم يتوقف عند الطابق 1.", memory: [n("floor", 2)] },
      { line: 5, say: "العنوان case 2 مجرد نقطة هبوط. التنفيذ يبدأ من بعده سطراً سطراً: يطبع Gym.", memory: [n("floor", 2)], output: ["Gym"] },
      { line: 6, say: "break تعني: اخرج من switch الآن. لولاها لأكمل التنفيذ نزولاً إلى السطر 7 وطبع Roof أيضاً.", memory: [n("floor", 2)], output: ["Gym"] },
      { line: 9, say: "خرجنا من switch إلى ما بعد القوس. سطر default لم يُنفَّذ، لأنه مكان الهبوط فقط حين لا يطابق أي case.", memory: [n("floor", 2)], output: ["Gym", "Doors open"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "آلة بيع صغيرة. عدّل الكود وشغّله، وراقب أين يهبط التنفيذ بعد سطر switch، وأين يتوقف.",
    starter: `let code = "B";
switch (code) {
  case "A":
    console.log("Water");
    break;
  case "B":
    console.log("Juice");
    break;
  default:
    console.log("Unknown code");
}`,
    challenges: [
      "غيّر \"B\" إلى \"Z\". قبل أن تضغط: أين سيهبط التنفيذ؟",
      "احذف break الذي بعد Juice. توقّع كم سطراً سيُطبع، ثم شغّل.",
      "غيّر \"B\" إلى \"b\" الصغيرة. لماذا لم يطابق case \"B\"؟",
      "أضف case \"C\" يطبع Chips مع break، ثم جرّبه.",
    ],
  },
  predict: [
    {
      question: "نسي المبرمج break في حالتين. ماذا سيُطبع؟",
      code: `let day = 2;
switch (day) {
  case 1:
    console.log("Sun");
  case 2:
    console.log("Mon");
  case 3:
    console.log("Tue");
    break;
  default:
    console.log("?");
}`,
      options: ["Mon", "Mon ثم Tue", "Mon ثم Tue ثم ?", "Sun ثم Mon ثم Tue"],
      answer: 1,
      why: "يقفز التنفيذ إلى case 2 ويطبع Mon. لا يوجد break، فيكمل نزولاً عبر عنوان case 3 كأنه غير موجود ويطبع Tue، ثم يجد break فيخرج. Sun لم يُطبع لأن الهبوط كان بعده.",
    },
    {
      question: "x هنا نص \"2\". ماذا سيُطبع؟",
      code: `let x = "2";
switch (x) {
  case 2:
    console.log("number");
    break;
  default:
    console.log("other");
}`,
      options: ["number", "other", "number ثم other"],
      answer: 1,
      why: "switch تقارن بـ === الصارمة. النص \"2\" لا يساوي الرقم 2 بهذه المقارنة، فلا يطابق أي case ويهبط التنفيذ في default.",
    },
    {
      question: "داخل case 1 نغيّر n إلى 2. ماذا سيُطبع؟",
      code: `let n = 1;
switch (n) {
  case 1:
    n = 2;
    console.log("one");
    break;
  case 2:
    console.log("two");
    break;
}`,
      options: ["one", "one ثم two", "two"],
      answer: 0,
      why: "switch قرأت n مرة واحدة في البداية (1) وقفزت إلى case 1. تغيير n بعد ذلك لا يجعلها تعيد المقارنة، و break تُخرجها قبل أن تصل إلى case 2.",
    },
  ],
  code: {
    intro: "الفكرة واحدة: قيمة تُقرأ مرة، ثم قفزة إلى العنوان المطابق، ثم نزول حتى break. بدّل اللغة فوق لترى أن بايثون و Go و Rust و Dart لا تسقط أصلاً. وهنا استخدام مقصود للسقوط: عدة عناوين تشترك في كود واحد.",
    runnerStarter: `let day = 6;

switch (day) {
  case 6:
  case 7:
    console.log("Weekend");
    break;
  case 1:
    console.log("Start of the week");
    break;
  default:
    console.log("Workday");
}
// جرّب: غيّر day إلى 7 ثم إلى 3، ثم احذف break الأول وشغّل
`,
  },
  exercises: [
    {
      kind: "order",
      title: "مقاس القميص",
      prompt: "رتّب الأسطر حتى يطبع البرنامج Medium.",
      lines: [
        'let size = "M";',
        "switch (size) {",
        '  case "S": console.log("Small"); break;',
        '  case "M": console.log("Medium"); break;',
        '  default: console.log("Other");',
        "}",
      ],
      expected: "Medium",
    },
    {
      kind: "fill",
      title: "إشارة المرور",
      prompt: "الإشارة حمراء. أي سطر يجعل البرنامج يطبع Stop فقط؟",
      template: `let light = "red";
switch (light) {
  case "red":
    console.log("Stop");
    ___
  case "green":
    console.log("Go");
}`,
      options: ["break;", "// done", "default:"],
      expected: "Stop",
    },
    {
      kind: "fix",
      title: "المستوى السهل",
      prompt: "اللاعب اختار المستوى 1، لكن البرنامج يطبع Easy ثم Hard. أصلحه حتى يطبع Easy فقط.",
      code: `let level = 1;
switch (level) {
  case 1:
    console.log("Easy");
  case 2:
    console.log("Hard");
    break;
}`,
      expected: "Easy",
      hint: "بعد أن يطبع Easy، ما الذي يمنع التنفيذ من النزول إلى السطر التالي؟",
      solution: `let level = 1;
switch (level) {
  case 1:
    console.log("Easy");
    break;
  case 2:
    console.log("Hard");
    break;
}`,
    },
    {
      kind: "write",
      title: "أسهم اللعبة",
      prompt: 'اكتب switch على المتغير key: إذا كان "up" اطبع Move up، وإذا كان "down" اطبع Move down، وغير ذلك اطبع Stay. القيمة الآن "down"، فيجب أن يظهر Move down.',
      starter: `let key = "down";
// اكتب switch هنا
`,
      expected: "Move down",
      hint: 'case "up": ثم console.log ثم break، والشيء نفسه لـ "down"، ثم default.',
      solution: `let key = "down";
switch (key) {
  case "up":
    console.log("Move up");
    break;
  case "down":
    console.log("Move down");
    break;
  default:
    console.log("Stay");
}`,
    },
  ],
  quiz: [
    {
      question: "ماذا سيُطبع؟",
      code: `let c = 3;
switch (c) {
  case 1: console.log("a"); break;
  case 3: console.log("c"); break;
  default: console.log("d");
}`,
      options: ["a", "c", "d", "c ثم d"],
      answer: 1,
      why: "تُقرأ c مرة (3)، فيقفز التنفيذ إلى case 3 ويطبع c، ثم break يُخرجه قبل default.",
    },
    {
      question: "ماذا سيُطبع؟",
      code: `let c = 9;
switch (c) {
  case 1: console.log("a"); break;
  case 3: console.log("c"); break;
  default: console.log("d");
}`,
      options: ["a", "c", "d", "لا شيء"],
      answer: 2,
      why: "لا يوجد عنوان 9، فيهبط التنفيذ في default. default هو مكان الهبوط حين لا يطابق شيء.",
    },
    {
      question: "ماذا سيُطبع؟",
      code: `let m = 2;
switch (m) {
  case 2:
    console.log("two");
  default:
    console.log("other");
}`,
      options: ["two", "other", "two ثم other"],
      answer: 2,
      why: "يهبط في case 2 ويطبع two. لا break، فيكمل نزولاً عبر default ويطبع other أيضاً. العناوين لا توقف التنفيذ، break وحده يوقفه.",
    },
    {
      question: "ماذا سيُطبع؟",
      code: `switch ("1") {
  case 1: console.log("number"); break;
  case "1": console.log("text"); break;
}`,
      options: ["number", "text", "number ثم text"],
      answer: 1,
      why: "المقارنة صارمة (===): النص \"1\" لا يطابق الرقم 1، ويطابق case \"1\" فقط.",
    },
    {
      question: "ماذا سيُطبع؟",
      code: `let d = "sat";
switch (d) {
  case "fri":
  case "sat":
    console.log("weekend");
    break;
  default:
    console.log("workday");
}`,
      options: ["weekend", "workday", "لا شيء", "weekend ثم workday"],
      answer: 0,
      why: "يقفز إلى عنوان case \"sat\" ويطبع weekend ثم break. وضع عنوانين متتاليين بلا كود بينهما طريقة لجعل حالتين تشتركان في نفس الكود.",
    },
  ],
  next: "while",
};
