import type { Cell, Frame, HeapObj, Lesson, Scene, Slot, Step } from "@/lib/types";

const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
/** A variable whose value was moved away: the drawer is still there, but it owns nothing. */
const moved = (name: string): Slot => ({ name, value: "moved", type: "none" });
const main = (vars: Slot[]): Frame => ({ id: 1, name: "main", vars });
const shout = (vars: Slot[]): Frame => ({ id: 2, name: "shout", vars });
const text = (id: number, s: string): HeapObj => ({
  id,
  kind: "array",
  items: [...s].map((ch, i) => ({ name: `[${i}]`, value: `'${ch}'`, type: "string" })),
});

const str = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const num = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const gone = (name: string): Cell => ({ name, value: "moved", type: "none" });
/** A hand-written answer scene: the Rust compiler reads the program and stops at the bad line. */
const check = (rust: string, steps: Step[]): Scene => ({ code: { rust }, steps });
const E0382 = (v: string) => `error[E0382]: borrow of moved value: \`${v}\``;

const steps: Step[] = [
  {
    line: null,
    say: "قبل أن يعمل هذا البرنامج، قرأه مترجم Rust كله وتأكد أن لكل قيمة في الكومة مالكاً واحداً في كل لحظة. لم يجد خطأ، فصار برنامجاً يعمل. نشاهده الآن.",
    memory: [],
    frames: [],
    heap: [],
  },
  {
    line: 2,
    say: "main تبدأ: إطار على المكدّس.",
    memory: [],
    frames: [main([])],
    heap: [],
  },
  {
    line: 3,
    say: "String::from يحجز الحروف \"hi\" في الكومة. a هو المالك: السهم الوحيد إليها.",
    memory: [],
    frames: [main([ref("a", 1)])],
    heap: [text(1, "hi")],
    changed: ["a"],
    changedHeap: [1],
  },
  {
    line: 4,
    say: "let b = a: في JavaScript كان هذا سيصنع سهمين إلى الشيء نفسه. في Rust تنتقل الملكية: المقبض يُنسخ إلى b، و a يُعلَّم «منقول» ولا يعود صالحاً. سهم واحد دائماً.",
    memory: [],
    frames: [main([moved("a"), ref("b", 1)])],
    heap: [text(1, "hi")],
    changed: ["a", "b"],
    read: ["a"],
  },
  {
    line: 5,
    say: "clone() يصنع نسخة حقيقية: حروف جديدة في مكان آخر من الكومة، ومالكها c. الآن قيمتان، ولكل واحدة مالك واحد.",
    memory: [],
    frames: [main([moved("a"), ref("b", 1), ref("c", 2)])],
    heap: [text(1, "hi"), text(2, "hi")],
    changed: ["c"],
    read: ["b"],
    changedHeap: [2],
  },
  {
    line: 6,
    say: "تمرير c إلى دالة ينقل الملكية إليها أيضاً: s في إطار shout صار المالك، و c صار منقولاً.",
    memory: [],
    frames: [main([moved("a"), ref("b", 1), moved("c")]), shout([ref("s", 2)])],
    heap: [text(1, "hi"), text(2, "hi")],
    changed: ["s", "c"],
  },
  {
    line: 1,
    say: "shout تطبع ما يملكه s.",
    memory: [],
    frames: [main([moved("a"), ref("b", 1), moved("c")]), shout([ref("s", 2)])],
    heap: [text(1, "hi"), text(2, "hi")],
    read: ["s"],
    output: ["hi!"],
  },
  {
    line: 1,
    say: "عند } يخرج s من نطاقه. هو المالك، فتُحرَّر قيمته فوراً، ثم يُزال الإطار. لا جامع قمامة، ولا free كتبته أنت: المترجم وضع التحرير هنا بنفسه.",
    memory: [],
    frames: [main([moved("a"), ref("b", 1), moved("c")])],
    heap: [text(1, "hi")],
    output: ["hi!"],
  },
  {
    line: 7,
    say: "b ما زال المالك، فيطبع hi.",
    memory: [],
    frames: [main([moved("a"), ref("b", 1), moved("c")])],
    heap: [text(1, "hi")],
    read: ["b"],
    output: ["hi!", "hi"],
  },
  {
    line: 8,
    say: "main تنتهي: b مالك فتُحرَّر قيمته. a و c منقولان فلا يحرّران شيئاً. كل صندوق حُرِّر مرة واحدة بالضبط: لا تسرّب، ولا تحرير مزدوج.",
    memory: [],
    frames: [],
    heap: [],
    output: ["hi!", "hi"],
  },
];

export const ownership: Lesson = {
  slug: "ownership",
  stage: 10,
  number: "10.2",
  title: "الملكية",
  subtitle: "لكل قيمة مالك واحد، وتُحرَّر حين يخرج من نطاقه",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "مفتاح واحد لكل صندوق",
    body: "كل صندوق في الكومة له مفتاح واحد فقط. أعطِ المفتاح لمتغير آخر، أو انسخ الصندوق، ثم حاول أن تستعمل متغيراً لم يعد معه مفتاح. من يمنعك، ومتى؟",
    demo: "ownership",
  },
  scene: {
    code: {
      rust: `fn shout(s: String) { println!("{}!", s); }
fn main() {
    let a = String::from("hi");
    let b = a;
    let c = b.clone();
    shout(c);
    println!("{}", b);
}`,
    },
    steps,
    notes: {
      rust: "ثلاث قواعد: لكل قيمة مالك واحد، والإسناد أو التمرير لدالة ينقل الملكية، وحين يخرج المالك من نطاقه تُحرَّر القيمة. الأرقام (Copy) تُنسخ ولا تُنقل.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة بـ JavaScript لما يفعله مترجم Rust قبل التشغيل: owners يحفظ ما يملكه كل متغير. move ينقل الملكية ويترك المصدر فارغاً، و clone يصنع قيمة جديدة، و use يرفض متغيراً منقولاً.",
    starter: `const owners = {};
function letNew(name, value) {
  owners[name] = value;
}
function use(name) {
  if (owners[name] === "moved") {
    console.log("error[E0382]: borrow of moved value: " + name);
    return;
  }
  console.log(name + " = " + owners[name]);
}
function move(from, to) {
  owners[to] = owners[from];
  owners[from] = "moved";
}
function clone(from, to) {
  owners[to] = owners[from] + " (copy)";
}
letNew("a", "hi");
move("a", "b");
use("b");
use("a");`,
    challenges: [
      "قبل التشغيل: أي سطر سيطبع الخطأ E0382؟ ولماذا لا يطبعه use(\"b\")؟",
      "بدّل move(\"a\", \"b\"); بـ clone(\"a\", \"b\");  هل ما زال use(\"a\") خطأ؟ ماذا يملك b الآن؟",
      "أضف move(\"b\", \"c\"); ثم use(\"c\"); و use(\"b\");  تتبّع المفتاح وهو يمرّ من a إلى b إلى c.",
      "في Rust الحقيقية، الخطأ يوقف الترجمة فلا يعمل أي سطر. في المحاكاة يكمل البرنامج. لماذا الأول أفضل؟",
    ],
  },
  predict: [
    {
      question: "هل يترجم Rust هذا البرنامج؟",
      code: `let a = String::from("hi");
let b = a;
println!("{}", a);`,
      options: ["نعم، ويطبع hi", "لا: borrow of moved value: `a`", "يعمل ثم ينهار عند السطر 3"],
      answer: 1,
      why: "let b = a نقلت الملكية إلى b، فـ a لم يعد يملك شيئاً. في JavaScript كان a و b سهمين للشيء نفسه، أما Rust فتسمح بسهم مالك واحد. والمترجم يكتشف ذلك قبل أن يعمل أي سطر.",
      scene: check(
        `let a = String::from("hi");
let b = a;
println!("{}", a);`,
        [
          { line: 1, say: "a يملك النص \"hi\" في الكومة.", memory: [str("a", "hi")], changed: ["a"] },
          { line: 2, say: "الملكية تنتقل إلى b، و a يصبح منقولاً.", memory: [gone("a"), str("b", "hi")], changed: ["a", "b"], copy: { from: "a", to: "b" } },
          { line: 3, say: "استعمال a بعد نقله: المترجم يرفض البرنامج كله، ولا يعمل منه شيء.", memory: [gone("a"), str("b", "hi")], read: ["a"], error: E0382("a") },
        ],
      ),
    },
    {
      question: "والأرقام؟ ماذا يحدث هنا؟",
      code: `let x = 5;
let y = x;
println!("{} {}", x, y);`,
      options: ["يطبع 5 5", "لا: borrow of moved value: `x`", "يطبع 0 5"],
      answer: 0,
      why: "الرقم يعيش داخل الدرج نفسه في المكدّس، لا في الكومة، فلا يوجد صندوق يُخاف عليه من تحرير مزدوج. Rust تنسخه كما في درس المتغيرات. هذه الأنواع اسمها Copy.",
      scene: check(
        `let x = 5;
let y = x;
println!("{} {}", x, y);`,
        [
          { line: 1, say: "x رقم في المكدّس.", memory: [num("x", 5)], changed: ["x"] },
          { line: 2, say: "i32 من نوع Copy: القيمة تُنسخ، و x يبقى صالحاً.", memory: [num("x", 5), num("y", 5)], changed: ["y"], copy: { from: "x", to: "y" } },
          { line: 3, say: "الاثنان صالحان.", memory: [num("x", 5), num("y", 5)], read: ["x", "y"], output: ["5 5"] },
        ],
      ),
    },
    {
      question: "count تحسب طول النص فقط. هل يترجم البرنامج؟",
      code: `fn count(s: String) -> usize { s.len() }
fn main() {
    let name = String::from("Sara");
    let n = count(name);
    println!("{} {}", name, n);
}`,
      options: ["نعم، ويطبع Sara 4", "لا: السطر 5 يستعمل name بعد نقله", "يعمل ثم ينهار لأن name حُرِّر"],
      answer: 1,
      why: "تمرير String إلى دالة ينقلها كما ينقلها الإسناد: s صار المالك، وحين انتهت count حُرِّر النص. لو سمح المترجم بالسطر 5 لقرأ صندوقاً محرّراً: use after free من الدرس السابق. الحل هنا أن ترجع count النص، أو أن تستعير، وهذا الدرس القادم.",
      scene: check(
        `fn count(s: String) -> usize { s.len() }
fn main() {
    let name = String::from("Sara");
    let n = count(name);
    println!("{} {}", name, n);
}`,
        [
          { line: 3, say: "name يملك \"Sara\".", memory: [str("name", "Sara")], changed: ["name"] },
          { line: 4, say: "الملكية تنتقل إلى s داخل count. عند نهايتها يُحرَّر النص. n = 4.", memory: [gone("name"), num("n", 4)], changed: ["name", "n"], read: ["name"] },
          { line: 5, say: "name منقول، والنص الذي كان يملكه حُرِّر. المترجم يرفض.", memory: [gone("name"), num("n", 4)], read: ["name"], error: E0382("name") },
        ],
      ),
    },
  ],
  code: {
    intro: "Rust لا تعمل داخل هذا الدرس. انسخ البرنامج إلى play.rust-lang.org وشغّله، ثم احذف علامة التعليق من السطر الذي فيه E0382 واقرأ رسالة المترجم كاملة: يشير إلى مكان النقل ومكان الاستعمال.",
    runnerLang: "text",
    runnerStarter: `fn shout(s: String) -> String {
    println!("{}!", s);
    s // give ownership back to the caller
}

fn main() {
    let a = String::from("hi");
    let b = a; // move: a is no longer usable
    let c = b.clone(); // a real copy on the heap
    let c = shout(c); // moved in, moved back out
    let n = 5;
    let m = n; // numbers are Copy
    println!("{} {} {} {}", b, c, n, m);
    // println!("{}", a); // remove the // to see error E0382
} // b and c are freed here, each exactly once
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "نسخة حقيقية",
      prompt: "رتّب الأسطر حتى يطبع البرنامج hi hi: a يبقى صالحاً لأن b نسخة.",
      lines: ["fn main() {", '    let a = String::from("hi");', "    let b = a.clone();", '    println!("{} {}", a, b);', "}"],
      expected: "hi hi",
    },
    {
      kind: "fill",
      lang: "text",
      title: "اسمح للسطر الأخير",
      prompt: "أي شيء يجعل البرنامج يترجم ويطبع Sara Sara؟",
      template: 'let name = String::from("Sara");\nlet other = ___;\nprintln!("{} {}", name, other);',
      options: ["name.clone()", "name", "*name"],
      answer: "name.clone()",
      expected: "Sara Sara",
    },
    {
      kind: "order",
      lang: "text",
      title: "أرجِع الملكية",
      prompt: "رتّب الأسطر: الدالة تستلم النص، تضيف إليه علامة تعجب، وترجعه، فيطبع البرنامج hi!",
      lines: ["fn excite(mut s: String) -> String {", "    s.push('!');", "    s", "}", "fn main() {", '    let word = String::from("hi");', "    let word = excite(word);", '    println!("{}", word);', "}"],
      expected: "hi!",
    },
    {
      kind: "fill",
      lang: "text",
      title: "من يُنسخ ولا يُنقل؟",
      prompt: "أي قيمة تجعل السطر الأخير مقبولاً دون clone؟",
      template: 'let a = ___;\nlet b = a;\nprintln!("{:?} {:?}", a, b);',
      options: ["42", 'String::from("42")', "vec![42]"],
      answer: "42",
      expected: "42 42",
    },
  ],
  quiz: [
    {
      question: "كم مرة يُحرَّر النص \"hi\" في هذا البرنامج؟",
      code: 'fn main() {\n    let a = String::from("hi");\n    let b = a;\n    let c = b;\n}',
      options: ["مرة واحدة، عند } حين يخرج c", "ثلاث مرات، مرة لكل متغير", "لا يُحرَّر حتى يمرّ جامع القمامة"],
      answer: 0,
      why: "صندوق واحد ومفتاح واحد انتقل من a إلى b إلى c. a و b منقولان فلا يحرّران شيئاً، و c وحده المالك عند النهاية. هذا ما يمنع التحرير المزدوج.",
    },
    {
      question: "أي سطر يرفضه المترجم؟",
      code: 'let v = vec![1, 2, 3];\nlet w = v;\nlet total = w.len();\nprintln!("{}", v.len());',
      options: ["السطر 4", "السطر 2", "لا شيء، يطبع 3"],
      answer: 0,
      why: "Vec محتواها في الكومة، فـ let w = v نقلت الملكية. السطر 3 يستعمل w المالك، فهو سليم. السطر 4 يستعمل v المنقول: error[E0382]: borrow of moved value: `v`.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let a = String::from("hi");\nlet mut b = a.clone();\nb.push(\'!\');\nprintln!("{} {}", a, b);',
      options: ["hi hi!", "hi! hi!", "خطأ: a منقول"],
      answer: 0,
      why: "clone() صنع صندوقاً ثانياً بمالك جديد. push غيّر صندوق b وحده، وصندوق a كما هو. قارن بدرس المرجع: هناك كان سهمان لشيء واحد، وهنا شيئان لكل منهما سهم.",
    },
    {
      question: "متى يجد Rust الخطأ في هذا البرنامج؟",
      code: 'fn main() {\n    println!("start");\n    let s = String::from("x");\n    drop(s);\n    println!("{}", s);\n}',
      options: [
        "قبل التشغيل: المترجم يرفضه، فلا يُطبع حتى start",
        "عند التشغيل: يطبع start ثم ينهار",
        "لا يجده أبداً، ويطبع حروفاً عشوائية",
      ],
      answer: 0,
      why: "drop(s) تأخذ الملكية وتحرّر النص. استعمال s بعدها نقل خطأ يراه المترجم وهو يقرأ الملف، قبل أي تشغيل (درس من الكود إلى التنفيذ). في C كان هذا use after free صامتاً.",
    },
    {
      question: "هل يترجم هذا البرنامج؟",
      code: 'fn show(n: i32) {\n    println!("{}", n);\n}\nfn main() {\n    let x = 7;\n    show(x);\n    show(x);\n}',
      options: ["نعم، ويطبع 7 مرتين", "لا: x نُقل في الاستدعاء الأول", "نعم، لكن يطبع 7 ثم 0"],
      answer: 0,
      why: "i32 من نوع Copy: يعيش في المكدّس وكل تمرير ينسخ القيمة إلى إطار show، و x يبقى كما هو. النقل يخصّ القيم التي تملك شيئاً في الكومة، مثل String و Vec.",
    },
  ],
  next: "borrowing",
};
