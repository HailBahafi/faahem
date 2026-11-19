import type { Lesson } from "@/lib/types";

export const references: Lesson = {
  slug: "references",
  stage: 1,
  number: "1.13",
  title: "القيمة مقابل المرجع",
  subtitle: "متى ينسخ b = a القيمة، ومتى ينسخ السهم فقط؟",
  minutes: 15,
  problem: {
    title: "جهازا تحكم أم تلفازان؟",
    body: "معك جهازا تحكم: a و b. اضغط على b وراقب ما يراه a. ثم بدّل السطر في الأعلى وجرّب من جديد.",
    demo: "references",
  },
  scene: {
    code: {
      js: `let a = [1, 2, 3];
let b = a;
b[0] = 9;
console.log(a);
let c = a.slice();
c[1] = 7;
console.log(a, c);
console.log(a === b, a === c);`,
      ts: `let a: number[] = [1, 2, 3];
let b: number[] = a;
b[0] = 9;
console.log(a);
let c: number[] = a.slice();
c[1] = 7;
console.log(a, c);
console.log(a === b, a === c);`,
      py: `a = [1, 2, 3]
b = a
b[0] = 9
print(a)
c = a.copy()
c[1] = 7
print(a, c)
print(a is b, a is c)`,
      go: `a := []int{1, 2, 3}
b := a
b[0] = 9
fmt.Println(a)
c := slices.Clone(a)
c[1] = 7
fmt.Println(a, c)
fmt.Println(&a[0] == &b[0], &a[0] == &c[0])`,
      dart: `var a = [1, 2, 3];
var b = a;
b[0] = 9;
print(a);
var c = a.toList();
c[1] = 7;
print('$a $c');
print('\${a == b} \${a == c}');`,
      rust: `let mut a = vec![1, 2, 3];
let b = &mut a;
b[0] = 9;
println!("{:?}", a);
let mut c = a.clone();
c[1] = 7;
println!("{:?} {:?}", a, c);
println!("{}", a.as_ptr() == c.as_ptr());`,
    },
    notes: {
      js: "الأرقام والنصوص والقيم المنطقية تُنسخ بقيمتها، أما المصفوفات والكائنات فيُنسخ سهمها. و === على مصفوفتين يسأل: هل السهمان إلى الشيء نفسه؟",
      ts: "مثل JavaScript تماماً: النوع number[] لا يغيّر شيئاً، b = a ما زال ينسخ السهم.",
      py: "في بايثون القوائم والقواميس مراجع أيضاً: b = a سهم ثانٍ. و is تسأل عن السهم (الشيء نفسه؟)، أما == فتقارن المحتوى. للنسخ: a.copy() أو a[:].",
      go: "الشريحة (slice) في Go تحمل سهماً إلى مصفوفة خلفها، فـ b := a يشارك المصفوفة نفسها. Go لا تقارن شريحتين بـ ==، فنقارن عنوان أول عنصر. slices.Clone تبني مصفوفة جديدة.",
      dart: "في Dart كل القوائم والكائنات مراجع، و == على قائمتين يسأل: هل هي القائمة نفسها؟ toList() تبني قائمة جديدة.",
      rust: "Rust تمنع مالكين اثنين: let b = a كانت ستنقل المصفوفة فيموت a. لذلك نستعير سهماً مؤقتاً بـ &mut a، ونطلب نسخة صريحة بـ clone(). هذه لمحة أولى عن الملكية.",
    },
    steps: [],
    trace: true,
  },
  playground: {
    kind: "trace",
    intro: "دالة تستلم مصفوفة. عندما تستدعيها لا تُرسل المصفوفة نفسها، بل نسخة من السهم. راقب السهم الثاني يظهر داخل الدالة ويشير إلى المصفوفة نفسها.",
    starter: `function addBonus(scores) {
  scores[0] = scores[0] + 10;
}
let mine = [50, 60];
addBonus(mine);
console.log(mine);`,
    challenges: [
      "استدعِ الدالة مرتين بدل مرة. كم سيصبح mine[0]؟ توقّع قبل أن تضغط.",
      "اكتب addBonus(mine.slice()); بدل addBonus(mine);  لماذا لم يتغيّر mine هذه المرة؟",
      "أضف في أول الدالة السطر scores = [0, 0];  هل تغيّر mine؟ راقب أي سهم تحرّك.",
      "اجعل mine رقماً: let mine = 50; وفي الدالة scores = scores + 10;  لماذا لا يتغيّر mine؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `let user = { name: "Sara", age: 20 };
let other = user;
other.age = 21;
console.log(user.age);`,
      options: ["20", "21", "خطأ"],
      answer: 1,
      why: "other = user نسخ السهم لا البطاقة. سهمان وبطاقة واحدة، فالتعديل عبر other يراه user.",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `let p = [1, 2];
let q = [1, 2];
console.log(p === q);`,
      options: ["true", "false", "خطأ"],
      answer: 1,
      why: "كل [1, 2] تبني مصفوفة جديدة في الكومة. سهما p و q يشيران إلى مصفوفتين مختلفتين، و === تقارن السهام لا المحتوى.",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `function reset(list) {
  list = [];
}
let nums = [1, 2];
reset(nums);
console.log(nums.length);`,
      options: ["0", "2", "خطأ"],
      answer: 1,
      why: "list = [] لا تمسح المصفوفة: تبني مصفوفة فارغة جديدة وتحرّك سهم list وحده إليها. سهم nums ما زال على [1, 2].",
    },
  ],
  code: {
    intro: "الصورة واحدة في كل اللغات: المصفوفات والكائنات في الكومة، والدرج يحمل سهماً إليها. Rust وحدها تمنع سهمين يملكان الشيء نفسه وتجبرك على clone. بدّل اللغة فوق، ثم عدّل الكود بالأسفل وشغّله.",
    runnerStarter: `let original = [3, 1, 2];
let copy = original;
copy[0] = 0;
console.log("original:", original[0], "copy:", copy[0]);
console.log("same array?", original === copy);
// جرّب: اكتب original.slice() بدل original في السطر الثاني
`,
  },
  exercises: [
    {
      kind: "order",
      title: "سهمان ومصفوفة واحدة",
      prompt: "رتّب الأسطر حتى يطبع البرنامج 3: إضافة عبر b تظهر في a.",
      lines: ["let a = [1, 2];", "let b = a;", "b.push(3);", "console.log(a.length);"],
      expected: "3",
    },
    {
      kind: "fill",
      title: "نسخة مستقلة",
      prompt: "أي شيء يجعل a[0] يبقى 1 بعد تعديل b؟",
      template: "let a = [1, 2, 3];\nlet b = ___;\nb[0] = 0;\nconsole.log(a[0]);",
      options: ["a", "a.slice()"],
      expected: "1",
    },
    {
      kind: "fix",
      title: "الأصل تغيّر",
      prompt: "أردنا تعديل نسخة دون لمس الأصل، لكن الأصل تغيّر. أصلحه حتى يطبع 3 0.",
      code: "let original = [3, 1, 2];\nlet copy = original;\ncopy[0] = 0;\nconsole.log(original[0], copy[0]);",
      expected: "3 0",
      hint: "copy = original ينسخ السهم فقط. ابنِ مصفوفة جديدة بـ original.slice().",
      solution: `let original = [3, 1, 2];
let copy = original.slice();
copy[0] = 0;
console.log(original[0], copy[0]);`,
    },
    {
      kind: "write",
      title: "دالة لا تلمس الأصل",
      prompt: "اكتب دالة withFirst(list, value) ترجع مصفوفة جديدة أول عنصر فيها value، دون أن تغيّر list. جرّبها على a = [1, 2, 3] و 9، واطبع a[0] ثم أول عنصر في الناتج: 1 9.",
      starter: "// اكتب الكود هنا\n",
      expected: "1 9",
      hint: "داخل الدالة: let copy = list.slice(); ثم copy[0] = value; ثم return copy;",
      solution: `function withFirst(list, value) {
  let copy = list.slice();
  copy[0] = value;
  return copy;
}
let a = [1, 2, 3];
let b = withFirst(a, 9);
console.log(a[0], b[0]);`,
    },
  ],
  quiz: [
    { question: "ماذا يُطبع؟", code: "let a = 5;\nlet b = a;\nb = 7;\nconsole.log(a);", options: ["5", "7", "خطأ"], answer: 0, why: "الرقم يعيش داخل الدرج نفسه، فـ b = a نسخ القيمة 5. تغيير b لا يلمس درج a." },
    { question: "ماذا يُطبع؟", code: "let a = [5];\nlet b = a;\nb[0] = 7;\nconsole.log(a[0]);", options: ["5", "7", "خطأ"], answer: 1, why: "المصفوفة في الكومة، والدرج يحمل سهماً. b = a نسخ السهم، فـ b[0] = 7 غيّر المصفوفة الوحيدة التي يراها a أيضاً." },
    { question: "ماذا يُطبع؟", code: "console.log([1] === [1]);", options: ["true", "false", "خطأ"], answer: 1, why: "كل [1] مصفوفة جديدة في مكان مختلف. === تسأل: هل السهمان إلى الشيء نفسه؟ والجواب لا." },
    { question: "ماذا يُطبع؟", code: "function grow(list) {\n  list.push(0);\n}\nlet n = [1];\ngrow(n);\ngrow(n);\nconsole.log(n.length);", options: ["1", "2", "3"], answer: 2, why: "كل استدعاء يستلم سهماً إلى مصفوفة n نفسها، و push يضيف إليها. استدعاءان أضافا عنصرين: الطول 3." },
    { question: "ماذا يُطبع؟", code: "let a = [1, 2];\nlet b = a.slice();\nb.push(3);\nconsole.log(a.length, a === b);", options: ["2 false", "3 true", "3 false"], answer: 0, why: "slice() بنت مصفوفة ثانية لها سهمها. push أضاف إلى مصفوفة b وحدها، والسهمان إلى شيئين مختلفين." },
  ],
  next: "recursion",
};
