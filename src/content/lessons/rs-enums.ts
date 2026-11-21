import type { Cell, Lesson, Scene, Step } from "@/lib/types";

const cmd = (value: string): Cell => ({ name: "cmd: Command", value, type: "string", constant: true });
const total = (v: number): Cell => ({ name: "total", value: String(v), type: "number" });
const bound = (name: string, v: number | string): Cell =>
  typeof v === "number" ? { name, value: String(v), type: "number", constant: true } : { name, value: v, type: "string", constant: true };
const check = (rust: string, steps: Step[]): Scene => ({ code: { rust }, steps });

const o1 = ["total = 5"];
const o2 = [...o1, "total = 0"];

export const rsEnums: Lesson = {
  slug: "rs-enums",
  stage: 0,
  number: "1.10",
  title: "enum و match",
  subtitle: "قيمة هي واحد من عدة أشكال، و match يفتح كل شكل ولا ينسى أحدها",
  minutes: 20,
  singleLanguage: true,
  problem: {
    title: "حالات مستحيلة",
    body: "طلب في متجر: هل دُفع؟ هل شُحن؟ هل أُلغي؟ جرّب الأزرار في اليسار حتى تصنع حالة لا معنى لها. ثم حاول أن تصنع واحدة في اليمين.",
    demo: "rsEnums",
  },
  scene: {
    code: {
      rust: `enum Command { Add(i32), Reset, Show }
fn main() {
    let mut total = 0;
    for cmd in [Command::Add(5), Command::Show, Command::Reset, Command::Show] {
        match cmd {
            Command::Add(n) => total += n,
            Command::Reset => total = 0,
            Command::Show => println!("total = {}", total),
        }
    }
}`,
    },
    steps: [
      {
        line: null,
        say: "enum نوع قيمته واحد فقط من عدة أشكال (variants)، وكل شكل قد يحمل بياناته. struct تعني «هذا و هذا»، و enum تعني «هذا أو هذا».",
        memory: [],
      },
      {
        line: 1,
        say: "تصميم فقط. منه يحسب المترجم الحجم: درج فيه وسم (tag) يقول أي شكل هذا، ومكان يتسع لأكبر البيانات (i32 في Add). المجموع 8 بايتات لكل Command.",
        memory: [],
      },
      { line: 3, say: "total درج مفتوح فيه 0.", memory: [total(0)], changed: ["total"] },
      {
        line: 4,
        say: "أول عنصر: الوسم Add، وفي المكان المجاور 5.",
        memory: [total(0), cmd("tag Add | 5")],
        changed: ["cmd: Command"],
      },
      {
        line: 5,
        say: "match يقرأ الوسم ويجرّب الفروع من الأعلى. الفرع الأول يطابق، و Command::Add(n) يربط n بالبيانات: n = 5.",
        memory: [total(0), cmd("tag Add | 5"), bound("n", 5)],
        read: ["cmd: Command"],
        changed: ["n"],
      },
      { line: 6, say: "total += n: صار 5.", memory: [total(5), cmd("tag Add | 5"), bound("n", 5)], changed: ["total"], read: ["n"] },
      {
        line: 8,
        say: "العنصر الثاني وسمه Show، بلا بيانات. فرعا Add و Reset لا يطابقان، والثالث يطابق فيطبع.",
        memory: [total(5), cmd("tag Show")],
        read: ["cmd: Command", "total"],
        output: o1,
      },
      { line: 7, say: "Reset: يصفّر total.", memory: [total(0), cmd("tag Reset")], changed: ["total"], read: ["cmd: Command"], output: o1 },
      { line: 8, say: "Show مرة أخرى: total = 0.", memory: [total(0), cmd("tag Show")], read: ["cmd: Command", "total"], output: o2 },
      {
        line: 11,
        say: "انتهى البرنامج. لو حذفت سطر Reset من match لرفض المترجم البرنامج: فرع ناقص يعني شكلاً لم تقرّر ماذا تفعل به.",
        memory: [],
        output: o2,
      },
    ],
    notes: {
      rust: "match شامل (exhaustive): المترجم يتحقق أن كل شكل له فرع. _ يطابق أي شيء، استعمله حين تقصد فعلاً «كل ما عدا ذلك». وكل فروع match ترجع النوع نفسه، لأن match تعبير له قيمة.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة بـ JavaScript: كل قيمة enum كائن فيه tag وبيانات. run تحاكي match بـ switch على الوسم. JavaScript لن تنبّهك إن نسيت شكلاً، أما مترجم Rust فيفعل.",
    starter: `function add(n) { return { tag: "Add", value: n }; }
const reset = { tag: "Reset" };
const show = { tag: "Show" };
let total = 0;
function run(cmd) {
  switch (cmd.tag) {
    case "Add":
      total += cmd.value;
      break;
    case "Reset":
      total = 0;
      break;
    case "Show":
      console.log("total = " + total);
      break;
  }
}
const program = [add(5), show, reset, show];
for (const cmd of program) {
  run(cmd);
}`,
    challenges: [
      "قبل التشغيل: ماذا يُطبع؟ تتبّع total عبر الأوامر الأربعة.",
      "غيّر البرنامج إلى [add(2), add(3), show, add(10), show]. ما السطران المطبوعان؟",
      "أضف شكلاً جديداً: function times(n) { return { tag: \"Times\", value: n }; } واستعمله دون أن تضيف case. ماذا يحدث بصمت؟ في Rust هذا خطأ E0004.",
      "أضف case \"Times\" يضرب total في value، وجرّب [add(3), times(4), show].",
    ],
  },
  predict: [
    {
      question: "هل يترجم هذا البرنامج؟",
      code: `enum Light { Red, Yellow, Green }
fn main() {
    let l = Light::Green;
    let s = match l {
        Light::Red => "stop",
        Light::Green => "go",
    };
    println!("{}", s);
}`,
      options: ["نعم، ويطبع go", "لا: Yellow بلا فرع", "نعم، لكنه يتوقف لو كان l أصفر"],
      answer: 1,
      why: "صحيح أن l أخضر هنا، لكن المترجم يفحص match لكل قيمة ممكنة للنوع، لا للقيمة الحالية فقط. Yellow بلا فرع، فما قيمة s لو جاء أصفر؟ المترجم يرفض ويسمّي الشكل الناقص.",
      scene: check(
        `enum Light { Red, Yellow, Green }
fn main() {
    let l = Light::Green;
    let s = match l {
        Light::Red => "stop",
        Light::Green => "go",
    };
    println!("{}", s);
}`,
        [
          { line: 1, say: "ثلاثة أشكال ممكنة.", memory: [] },
          { line: 3, say: "l وسمه Green.", memory: [bound("l: Light", "tag Green")] },
          {
            line: 4,
            say: "المترجم يعدّ الفروع: Red و Green. أين Yellow؟ يرفض البرنامج قبل التشغيل.",
            memory: [bound("l: Light", "tag Green")],
            error: "error[E0004]: non-exhaustive patterns: `Light::Yellow` not covered",
          },
        ],
      ),
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: `fn main() {
    let code = 404;
    let label = match code {
        200 => "ok",
        400..=499 => "client error",
        _ => "other",
    };
    println!("{}", label);
}`,
      options: ["other", "client error", "خطأ: 404 بلا فرع"],
      answer: 1,
      why: "match يعمل مع الأرقام أيضاً، والفرع قد يكون مدى. 404 ليس 200، لكنه داخل 400..=499، فيتوقف البحث هناك. و _ يغطي باقي الأعداد كلها، لذلك لا يشتكي المترجم.",
      scene: check(
        `fn main() {
    let code = 404;
    let label = match code {
        200 => "ok",
        400..=499 => "client error",
        _ => "other",
    };
    println!("{}", label);
}`,
        [
          { line: 2, say: "code = 404.", memory: [bound("code", 404)] },
          { line: 4, say: "404 == 200؟ لا.", memory: [bound("code", 404)], read: ["code"] },
          { line: 5, say: "404 بين 400 و 499؟ نعم. قيمة match كلها \"client error\".", memory: [bound("code", 404), bound("label", '"client error"')], changed: ["label"] },
          { line: 8, say: "يطبع.", memory: [bound("code", 404), bound("label", '"client error"')], read: ["label"], output: ["client error"] },
        ],
      ),
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: `enum Shape { Circle(f64), Rect(f64, f64) }
fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => 3.0 * r * r,
        Shape::Rect(w, h) => w * h,
    }
}
fn main() {
    let shapes = [Shape::Rect(2.0, 3.0), Shape::Circle(1.0)];
    println!("{}", area(&shapes[0]) + area(&shapes[1]));
}`,
      options: ["9", "6", "خطأ: أشكال بأحجام مختلفة في مصفوفة واحدة"],
      answer: 0,
      why: "Rect و Circle شكلان من نوع واحد Shape، فلكليهما الحجم نفسه (يتسع لأكبرهما، Rect)، فيصطفّان في مصفوفة. كل فرع يربط بيانات شكله: 2 × 3 = 6، و 3 × 1 × 1 = 3. المجموع 9.",
      scene: check(
        `enum Shape { Circle(f64), Rect(f64, f64) }
fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => 3.0 * r * r,
        Shape::Rect(w, h) => w * h,
    }
}
fn main() {
    let shapes = [Shape::Rect(2.0, 3.0), Shape::Circle(1.0)];
    println!("{}", area(&shapes[0]) + area(&shapes[1]));
}`,
        [
          { line: 9, say: "عنصران من النوع نفسه، بوسمين مختلفين.", memory: [bound("shapes[0]", "tag Rect | 2.0 3.0"), bound("shapes[1]", "tag Circle | 1.0")] },
          { line: 5, say: "الأول Rect: w = 2، h = 3، المساحة 6.", memory: [bound("shapes[0]", "tag Rect | 2.0 3.0"), bound("shapes[1]", "tag Circle | 1.0"), bound("w", 2), bound("h", 3)], read: ["shapes[0]"] },
          { line: 4, say: "الثاني Circle: r = 1، المساحة 3.", memory: [bound("shapes[0]", "tag Rect | 2.0 3.0"), bound("shapes[1]", "tag Circle | 1.0"), bound("r", 1)], read: ["shapes[1]"] },
          { line: 10, say: "6 + 3 = 9.", memory: [bound("shapes[0]", "tag Rect | 2.0 3.0"), bound("shapes[1]", "tag Circle | 1.0")], output: ["9"] },
        ],
      ),
    },
  ],
  code: {
    intro: "شغّل البرنامج. ثم أضف شكلاً جديداً Scroll(i32) إلى Event دون أن تعدّل describe، واقرأ ما يقوله المترجم. بعدها أضف له فرعاً.",
    runnerLang: "rust",
    runnerStarter: `#[derive(Debug)]
enum Event {
    KeyPress(char),
    Click { x: i32, y: i32 }, // a variant can have named fields
    Quit,
}

impl Event {
    fn describe(&self) -> String {
        match self {
            Event::KeyPress(c) => format!("key {}", c),
            Event::Click { x, y } if *x < 0 || *y < 0 => String::from("click outside"),
            Event::Click { x, y } => format!("click at {},{}", x, y),
            Event::Quit => String::from("quit"),
        }
    }
}

fn main() {
    let events = [
        Event::KeyPress('q'),
        Event::Click { x: 3, y: 7 },
        Event::Click { x: -1, y: 0 },
        Event::Quit,
    ];
    for e in &events {
        println!("{}", e.describe());
    }
    if let Event::KeyPress(c) = &events[0] {
        println!("first key was {}", c);
    }
    println!("{:?} is {} bytes", events[3], size_of::<Event>());
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "rust",
      title: "قيمة العملة",
      prompt: "رتّب الأسطر حتى يطبع البرنامج 11. انتبه: الفروع تُجرَّب من الأعلى، و _ تطابق أي شيء.",
      lines: [
        "enum Coin { Penny, Nickel, Dime }",
        "fn value(c: Coin) -> u32 {",
        "    match c {",
        "        Coin::Dime => 10,",
        "        _ => 1,",
        "    }",
        "}",
        "fn main() {",
        '    println!("{}", value(Coin::Dime) + value(Coin::Penny));',
        "}",
      ],
      expected: "11",
    },
    {
      kind: "fill",
      lang: "rust",
      title: "اربط البيانات",
      prompt: "الفرع يجب أن يعطي البيانات داخل Move اسماً يستعمله السطر نفسه. أي نمط يجعل البرنامج يطبع move 3؟",
      template: 'enum Msg {\n    Move(u32),\n    Stop,\n}\n\nfn main() {\n    let m = Msg::Move(3);\n    match m {\n        Msg::Move(___) => println!("move {}", steps),\n        Msg::Stop => println!("stop"),\n    }\n}',
      options: ["steps", "_", "n"],
      answer: "steps",
      expected: "move 3",
    },
    {
      kind: "fix",
      lang: "rust",
      title: "الاتجاه المنسي",
      prompt: "المترجم يرفض name بـ E0004. أضف الفرع الناقص ليطبع البرنامج right.",
      code: 'enum Dir {\n    Up,\n    Down,\n    Left,\n    Right,\n}\n\nfn name(d: Dir) -> &\'static str {\n    match d {\n        Dir::Up => "up",\n        Dir::Down => "down",\n        Dir::Left => "left",\n    }\n}\n\nfn main() {\n    println!("{}", name(Dir::Right));\n}',
      expected: "right",
      hint: "أضف Dir::Right => \"right\", إلى match. (&'static str تعني نصاً ثابتاً يعيش طوال البرنامج.)",
      solution: 'enum Dir {\n    Up,\n    Down,\n    Left,\n    Right,\n}\n\nfn name(d: Dir) -> &\'static str {\n    match d {\n        Dir::Up => "up",\n        Dir::Down => "down",\n        Dir::Left => "left",\n        Dir::Right => "right",\n    }\n}\n\nfn main() {\n    println!("{}", name(Dir::Right));\n}',
    },
    {
      kind: "write",
      lang: "rust",
      title: "عمليات الحاسبة",
      prompt: "أكمل apply بـ match على op: Add تجمع، Sub تطرح، Mul تضرب. يجب أن يطبع البرنامج 5 -1 6.",
      starter: 'enum Op {\n    Add,\n    Sub,\n    Mul,\n}\n\nfn apply(op: Op, a: i32, b: i32) -> i32 {\n    todo!() // match op { ... }\n}\n\nfn main() {\n    println!("{} {} {}", apply(Op::Add, 2, 3), apply(Op::Sub, 2, 3), apply(Op::Mul, 2, 3));\n}\n',
      expected: "5 -1 6",
      hint: "match op { Op::Add => a + b, Op::Sub => a - b, Op::Mul => a * b }",
      solution: 'enum Op {\n    Add,\n    Sub,\n    Mul,\n}\n\nfn apply(op: Op, a: i32, b: i32) -> i32 {\n    match op {\n        Op::Add => a + b,\n        Op::Sub => a - b,\n        Op::Mul => a * b,\n    }\n}\n\nfn main() {\n    println!("{} {} {}", apply(Op::Add, 2, 3), apply(Op::Sub, 2, 3), apply(Op::Mul, 2, 3));\n}\n',
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'enum Light { Red, Yellow, Green }\nprintln!("{}", Light::Green as i32);',
      options: ["2", "3", "Green"],
      answer: 0,
      why: "enum بلا بيانات هو وسم فقط، والوسم رقم يبدأ من 0 بترتيب الأشكال: Red 0، Yellow 1، Green 2.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let n = 7;\nlet s = match n {\n    1..=9 => "digit",\n    7 => "seven",\n    _ => "other",\n};\nprintln!("{}", s);',
      options: ["digit", "seven", "other"],
      answer: 0,
      why: "الفروع تُجرَّب بالترتيب ويفوز أول فرع يطابق. 7 داخل 1..=9، فلا يصل البحث إلى فرع 7 أبداً، والمترجم ينبّهك: warning: unreachable pattern.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'enum Msg { Write(String), Quit }\nlet m = Msg::Write(String::from("hello"));\nmatch m {\n    Msg::Write(text) => println!("{}", text.len()),\n    Msg::Quit => println!("bye"),\n}',
      options: ["5", "hello", "bye"],
      answer: 0,
      why: "وسم m هو Write، فيطابق الفرع الأول ويربط text بالنص الذي يحمله. text.len() عدد بايتاته: 5.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let c = Cmd::Add(4);\nif let Cmd::Add(n) = c {\n    println!("{}", n * 2);\n} else {\n    println!("no");\n}',
      options: ["8", "4", "no"],
      answer: 0,
      why: "if let اختصار لـ match بفرع واحد يهمّك وفرع else للباقي. الوسم Add يطابق، و n = 4، فيطبع 8.",
    },
    {
      question: "على جهاز 64 بت، ماذا يطبع البرنامج؟",
      code: 'enum Shape { Dot, Circle(f64) }\nprintln!("{}", size_of::<Shape>());',
      options: ["16", "8", "9"],
      answer: 0,
      why: "كل Shape يجب أن يتسع لأكبر شكل: f64 في 8 بايتات، زائد الوسم. والـ f64 يُقرأ أسرع على عنوان من مضاعفات 8، فيُحشى الوسم إلى 8: المجموع 16، حتى لـ Dot الذي لا يحمل شيئاً.",
    },
  ],
  next: "rs-option-result",
};
