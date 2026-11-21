import type { Cell, Lesson, Scene, Step } from "@/lib/types";

const field = (name: string, value: string | number, mutable = true): Cell =>
  typeof value === "number" ? { name, value: String(value), type: "number", constant: !mutable } : { name, value, type: "string", constant: !mutable };
const check = (rust: string, steps: Step[]): Scene => ({ code: { rust }, steps });

const owner = field("acc.owner: String", 'ptr → heap "Sara"');
const bal = (v: number) => field("acc.balance: u32", v);
const self = (kind: string) => field(`self: ${kind}`, "→ acc", false);

export const rsStructs: Lesson = {
  slug: "rs-structs",
  stage: 0,
  number: "1.9",
  title: "structs",
  subtitle: "حقول متجاورة في كتلة واحدة، ودوال تعرف أي كتلة تعمل عليها",
  minutes: 20,
  singleLanguage: true,
  problem: {
    title: "أسماء ونتائج تفترق",
    body: "عندنا ثلاثة لاعبين: أسماؤهم في قائمة ونتائجهم في قائمة أخرى. رتّب النتائج، وقارن بما يحدث حين يكون كل لاعب كتلة واحدة فيها اسمه ونتيجته.",
    demo: "rsStructs",
  },
  scene: {
    code: {
      rust: `struct Account { owner: String, balance: u32 }
impl Account {
    fn deposit(&mut self, amount: u32) { self.balance += amount; }
    fn can_pay(&self, price: u32) -> bool { self.balance >= price }
}
fn main() {
    let mut acc = Account { owner: String::from("Sara"), balance: 0 };
    acc.deposit(50);
    println!("{} {} {}", acc.owner, acc.balance, acc.can_pay(30));
}`,
    },
    steps: [
      {
        line: null,
        say: "struct نوع جديد تصنعه أنت: عدة حقول بأسمائها وأنواعها، تعيش معاً في كتلة واحدة متجاورة. كل من يمسك الكتلة يمسك الحقول كلها.",
        memory: [],
      },
      {
        line: 1,
        say: "هذا تصميم فقط، لا يحجز شيئاً. منه يعرف المترجم شكل كل Account: درج String (عنوان وطول وسعة) ثم u32، أي 32 بايتاً مع الحشو.",
        memory: [],
      },
      {
        line: 7,
        say: "الآن تُحجز الكتلة على المكدّس: حقلان متجاوران باسم acc. owner يملك حروف \"Sara\" في الكومة. يجب أن تعطي كل حقل قيمة، فلا حقل ينسى أحد ملأه.",
        memory: [owner, bal(0)],
        changed: ["acc.owner: String", "acc.balance: u32"],
      },
      {
        line: 8,
        say: "acc.deposit(50) اختصار لـ Account::deposit(&mut acc, 50). self هنا استعارة قابلة للتغيير للكتلة كلها: لا نسخ ولا نقل.",
        memory: [owner, bal(0), self("&mut Account")],
        changed: ["self: &mut Account"],
        read: ["acc.balance: u32"],
      },
      {
        line: 3,
        say: "self.balance يتبع الاستعارة إلى الحقل في acc نفسه ويكتب فيه 50. هذا ممكن لأن acc مُعلن بـ mut، والدالة طلبت &mut self.",
        memory: [owner, bal(50), self("&mut Account")],
        changed: ["acc.balance: u32"],
      },
      {
        line: 9,
        say: "انتهت deposit وانتهت استعارتها. الآن can_pay(&acc, 30): &self استعارة للقراءة فقط، تكفي لأن الدالة لا تغيّر شيئاً.",
        memory: [owner, bal(50), self("&Account")],
        read: ["acc.balance: u32"],
      },
      {
        line: 4,
        say: "50 >= 30 صحيح: true. آخر تعبير بلا فاصلة منقوطة هو ما ترجعه الدالة.",
        memory: [owner, bal(50), self("&Account")],
        read: ["acc.balance: u32"],
      },
      {
        line: 9,
        say: "الطباعة تقرأ الحقلين ونتيجة can_pay.",
        memory: [owner, bal(50)],
        read: ["acc.owner: String", "acc.balance: u32"],
        output: ["Sara 50 true"],
      },
      {
        line: 10,
        say: "acc يخرج من نطاقه. تحرير struct يحرّر حقولها: owner مالك، فتُحرَّر حروف Sara من الكومة. لم تكتب أي كود تنظيف.",
        memory: [],
        output: ["Sara 50 true"],
      },
    ],
    notes: {
      rust: "ثلاثة أنواع لـ self: &self للقراءة (الأكثر شيوعاً)، &mut self للتعديل، و self لدالة تستهلك القيمة. ودالة بلا self مثل Account::new(...) تُسمّى associated function، وهي الطريقة المعتادة لصنع القيم.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة بـ JavaScript: كائن يمثّل struct، ودالة deposit تأخذه كما تأخذه &mut self. الحقل mutable يحاكي mut على المتغير: المترجم يرفض التعديل دونه.",
    starter: `function newAccount(owner, mutable) {
  return { owner: owner, balance: 0, mutable: mutable };
}
function deposit(acc, amount) {
  if (!acc.mutable) {
    console.log("error[E0596]: cannot borrow acc as mutable");
    return;
  }
  acc.balance = acc.balance + amount;
}
function canPay(acc, price) {
  return acc.balance >= price;
}
const acc = newAccount("Sara", true);
deposit(acc, 50);
console.log(acc.owner + " " + acc.balance + " " + canPay(acc, 30));`,
    challenges: [
      "قبل التشغيل: ما قيمة balance بعد deposit؟ وماذا ترجع canPay؟",
      "غيّر true إلى false في newAccount. ماذا يحدث؟ هذا ما يقوله المترجم حين تنسى let mut.",
      "أنشئ حساباً ثانياً other وأودع فيه 10. هل تغيّر acc؟ كل struct كتلة مستقلة.",
      "غيّر canPay(acc, 30) إلى canPay(acc, 80). لماذا لا تحتاج canPay أن يكون الحساب mutable؟",
    ],
  },
  predict: [
    {
      question: "هل يترجم هذا البرنامج؟",
      code: `struct Counter { count: u32 }
fn main() {
    let c = Counter { count: 0 };
    c.count += 1;
    println!("{}", c.count);
}`,
      options: ["نعم، ويطبع 1", "لا: c ليس mut، فلا يتغيّر أي حقل فيه", "لا: الحقول لا تُغيَّر أبداً"],
      answer: 1,
      why: "القفل على المتغير كله لا على حقل بعينه: let بلا mut تقفل الكتلة كلها بحقولها. الإصلاح let mut c. لا يوجد في Rust حقل mut وحده.",
      scene: check(
        `struct Counter { count: u32 }
fn main() {
    let c = Counter { count: 0 };
    c.count += 1;
    println!("{}", c.count);
}`,
        [
          { line: 3, say: "كتلة c مقفلة، فيها count = 0.", memory: [field("c.count: u32", 0, false)], changed: ["c.count: u32"] },
          {
            line: 4,
            say: "كتابة في حقل كتلة مقفلة: مرفوضة.",
            memory: [field("c.count: u32", 0, false)],
            read: ["c.count: u32"],
            error: "error[E0594]: cannot assign to `c.count`, as `c` is not declared as mutable",
          },
        ],
      ),
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: `#[derive(Debug)]
struct Point { x: i32, y: i32 }
fn main() {
    let p = Point { x: 1, y: 2 };
    println!("{:?}", p);
}`,
      options: ["Point { x: 1, y: 2 }", "(1, 2)", "خطأ: Point لا تُطبع"],
      answer: 0,
      why: "{} تحتاج أن تخبر Rust كيف يُعرض النوع للمستخدم (Display)، ولم نفعل. أما {:?} فعرض للمبرمج (Debug)، و #[derive(Debug)] يجعل المترجم يكتبه لك: اسم النوع وحقوله.",
      scene: check(
        `#[derive(Debug)]
struct Point { x: i32, y: i32 }
fn main() {
    let p = Point { x: 1, y: 2 };
    println!("{:?}", p);
}`,
        [
          { line: 1, say: "derive يولّد كود الطباعة Debug لهذا النوع أثناء الترجمة.", memory: [] },
          { line: 4, say: "كتلة p: حقلان متجاوران.", memory: [field("p.x: i32", 1, false), field("p.y: i32", 2, false)], changed: ["p.x: i32", "p.y: i32"] },
          { line: 5, say: "Debug يطبع الاسم والحقول.", memory: [field("p.x: i32", 1, false), field("p.y: i32", 2, false)], read: ["p.x: i32", "p.y: i32"], output: ["Point { x: 1, y: 2 }"] },
        ],
      ),
    },
    {
      question: "..a تعني «باقي الحقول من a». هل يترجم هذا؟",
      code: `struct User { name: String, age: u32 }
fn main() {
    let a = User { name: String::from("Sara"), age: 20 };
    let b = User { age: 21, ..a };
    println!("{} {}", a.name, b.age);
}`,
      options: ["نعم، ويطبع Sara 21", "لا: name انتقل من a إلى b", "نعم، ويطبع Sara 20"],
      answer: 1,
      why: "..a تنقل كل حقل لم تكتبه: age كتبناه، فبقي name، و String تُنقل لا تُنسخ. صار b.name المالك، و a.name منقولاً. لو كانت كل الحقول الباقية أرقاماً لنُسخت وبقي a صالحاً.",
      scene: check(
        `struct User { name: String, age: u32 }
fn main() {
    let a = User { name: String::from("Sara"), age: 20 };
    let b = User { age: 21, ..a };
    println!("{} {}", a.name, b.age);
}`,
        [
          { line: 3, say: "a يملك \"Sara\".", memory: [field("a.name", '"Sara"', false), field("a.age", 20, false)] },
          {
            line: 4,
            say: "name ينتقل إلى b، و age جديد. a.name صار منقولاً.",
            memory: [{ name: "a.name", value: "moved", type: "none" }, field("a.age", 20, false), field("b.name", '"Sara"', false), field("b.age", 21, false)],
            changed: ["b.name", "b.age", "a.name"],
          },
          {
            line: 5,
            say: "استعمال a.name بعد نقله.",
            memory: [{ name: "a.name", value: "moved", type: "none" }, field("a.age", 20, false), field("b.name", '"Sara"', false), field("b.age", 21, false)],
            read: ["a.name"],
            error: "error[E0382]: borrow of moved value: `a.name`",
          },
        ],
      ),
    },
  ],
  code: {
    intro: "شغّل البرنامج. ثم أضف دالة fn perimeter(&self) -> u32 واطبعها، وجرّب أن تحذف mut من سطر let mut box_a وتقرأ رسالة المترجم.",
    runnerLang: "rust",
    runnerStarter: `#[derive(Debug, Clone, PartialEq)]
struct Rect {
    width: u32,
    height: u32,
}

impl Rect {
    fn new(width: u32, height: u32) -> Self {
        Self { width, height } // field init shorthand
    }

    fn square(size: u32) -> Self {
        Self::new(size, size)
    }

    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn scale(&mut self, k: u32) {
        self.width *= k;
        self.height *= k;
    }
}

struct Meters(f64); // a tuple struct: one field, its own type

fn main() {
    let mut box_a = Rect::new(3, 4);
    let box_b = Rect::square(2);
    box_a.scale(2);
    println!("{:?} area {}", box_a, box_a.area());
    println!("{:?} same? {}", box_b, box_a == box_b);
    let run = Meters(5.5);
    println!("{} m", run.0);
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "rust",
      title: "حرّك النقطة",
      prompt: "رتّب الأسطر حتى يطبع البرنامج 13 4.",
      lines: ["struct Point { x: i32, y: i32 }", "fn main() {", "    let mut p = Point { x: 3, y: 4 };", "    p.x += 10;", '    println!("{} {}", p.x, p.y);', "}"],
      expected: "13 4",
    },
    {
      kind: "fill",
      lang: "rust",
      title: "أي self؟",
      prompt: "grow تغيّر حقلاً، والبرنامج يستعمل plant بعدها. أي معامل يجعله يترجم ويطبع 5؟",
      template: 'struct Plant {\n    size: u32,\n}\n\nimpl Plant {\n    fn grow(___, by: u32) {\n        self.size += by;\n    }\n}\n\nfn main() {\n    let mut plant = Plant { size: 1 };\n    plant.grow(4);\n    println!("{}", plant.size);\n}',
      options: ["&mut self", "&self", "self"],
      answer: "&mut self",
      expected: "5",
    },
    {
      kind: "fix",
      lang: "rust",
      title: "reset لا يكتب",
      prompt: "المترجم يرفض reset بـ E0594: self.count خلف مرجع للقراءة فقط. أصلحها ليطبع البرنامج 0.",
      code: 'struct Counter {\n    count: u32,\n}\n\nimpl Counter {\n    fn reset(&self) {\n        self.count = 0;\n    }\n}\n\nfn main() {\n    let mut c = Counter { count: 7 };\n    c.reset();\n    println!("{}", c.count);\n}',
      expected: "0",
      hint: "الدالة تكتب في حقل، فتحتاج استعارة قابلة للتغيير: &mut self.",
      solution: 'struct Counter {\n    count: u32,\n}\n\nimpl Counter {\n    fn reset(&mut self) {\n        self.count = 0;\n    }\n}\n\nfn main() {\n    let mut c = Counter { count: 7 };\n    c.reset();\n    println!("{}", c.count);\n}',
    },
    {
      kind: "write",
      lang: "rust",
      title: "مستطيل يعرف نفسه",
      prompt: "اكتب impl Rect فيها area(&self) -> u32 و is_square(&self) -> bool. يجب أن يطبع البرنامج 12 false ثم 9 true.",
      starter: 'struct Rect {\n    w: u32,\n    h: u32,\n}\n\n// impl Rect { ... }\n\nfn main() {\n    let a = Rect { w: 3, h: 4 };\n    let b = Rect { w: 3, h: 3 };\n    println!("{} {}", a.area(), a.is_square());\n    println!("{} {}", b.area(), b.is_square());\n}\n',
      expected: "12 false\n9 true",
      hint: "داخل الدالة تصل إلى الحقول بـ self.w و self.h.",
      solution: 'struct Rect {\n    w: u32,\n    h: u32,\n}\n\nimpl Rect {\n    fn area(&self) -> u32 {\n        self.w * self.h\n    }\n\n    fn is_square(&self) -> bool {\n        self.w == self.h\n    }\n}\n\nfn main() {\n    let a = Rect { w: 3, h: 4 };\n    let b = Rect { w: 3, h: 3 };\n    println!("{} {}", a.area(), a.is_square());\n    println!("{} {}", b.area(), b.is_square());\n}\n',
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let p = Point { x: 1, y: 2 };\nlet q = Point { x: 5, ..p };\nprintln!("{} {} {}", q.x, q.y, p.x);',
      options: ["5 2 1", "5 2 5", "خطأ: p منقول"],
      answer: 0,
      why: "q.x كتبناه، و y أُخذ من p. الحقول i32 من نوع Copy فتُنسخ، فيبقى p صالحاً كما هو.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'impl Counter {\n    fn new() -> Self {\n        Counter { count: 10 }\n    }\n}\nfn main() {\n    let c = Counter::new();\n    println!("{}", c.count);\n}',
      options: ["10", "0", "خطأ: new تحتاج self"],
      answer: 0,
      why: "new دالة بلا self: لا تعمل على كتلة موجودة بل تصنع واحدة جديدة. تُستدعى بـ Counter::new()، و Self اختصار لاسم النوع. new اسم متعارف عليه لا كلمة محجوزة.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let mut acc = Account { balance: 10 };\nAccount::deposit(&mut acc, 5);\nacc.deposit(5);\nprintln!("{}", acc.balance);',
      options: ["20", "15", "خطأ: لا تُستدعى الدالة بالشكل الأول"],
      answer: 0,
      why: "الصيغتان شيء واحد: acc.deposit(5) يكتبها المترجم Account::deposit(&mut acc, 5). كل استدعاء أضاف 5 إلى الكتلة نفسها: 10 ثم 15 ثم 20.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'struct Pair { a: u8, b: u32 }\nprintln!("{}", size_of::<Pair>());',
      options: ["8", "5", "2"],
      answer: 0,
      why: "u8 بايت و u32 أربعة، لكن المعالج يقرأ u32 أسرع حين يبدأ عند عنوان من مضاعفات 4. فيضع المترجم 3 بايتات حشو: 1 + 3 + 4 = 8. Rust حرّة في ترتيب الحقول لتقليل الحشو.",
    },
    {
      question: "Wallet فيه رقم فقط. هل يترجم هذا؟",
      code: 'struct Wallet { coins: u32 }\nfn main() {\n    let a = Wallet { coins: 3 };\n    let mut b = a;\n    b.coins += 1;\n    println!("{}", a.coins);\n}',
      options: ["لا: a انتقل إلى b", "نعم، ويطبع 3", "نعم، ويطبع 4"],
      answer: 0,
      why: "النوع الذي تصنعه ليس Copy إلا إذا طلبت ذلك (#[derive(Clone, Copy)])، حتى لو كانت حقوله أرقاماً. لذلك let b = a نقلٌ، و a.coins بعدها خطأ E0382.",
    },
  ],
  next: "rs-enums",
};
