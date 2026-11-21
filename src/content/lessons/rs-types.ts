import type { Cell, Lesson, Scene, Step } from "@/lib/types";

const num = (name: string, value: string): Cell => ({ name, value, type: "number", constant: true });
const flag = (name: string, value: boolean): Cell => ({ name, value: String(value), type: "boolean", constant: true });
const check = (rust: string, steps: Step[]): Scene => ({ code: { rust }, steps });

const age = num("age: u8", "30");
const big = num("big: i64", "3000000000");
const ratio = num("ratio: i32", "3");
const exact = num("exact: f64", "3.5");
const total = num("total: i64", "3000000030");

export const rsTypes: Lesson = {
  slug: "rs-types",
  stage: 0,
  number: "1.3",
  title: "الأنواع",
  subtitle: "لكل درج حجم ثابت يعرفه المترجم، ولا تحويل يحدث من وراء ظهرك",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "عدّاد بثمانية مصابيح",
    body: "هذا الدرج نوعه u8: ثمانية بتات فقط. زِده واحداً واحداً حتى يمتلئ، ثم زِده مرة أخرى. ماذا يجب أن يحدث للرقم الذي لا مكان له؟",
    demo: "rsTypes",
  },
  scene: {
    code: {
      rust: `fn main() {
    let age: u8 = 30;
    let big: i64 = 3_000_000_000;
    let ratio = 7 / 2;
    let exact = 7.0 / 2.0;
    let total = big + age as i64;
    let ok: bool = total > big;
    println!("{} {} {} {}", total, ratio, exact, ok);
}`,
    },
    steps: [
      {
        line: null,
        say: "المترجم يجب أن يعرف حجم كل درج قبل التشغيل، ليرتّب أدراج المكدّس متجاورة. لذلك لكل قيمة نوع ثابت، والنوع يحدّد الحجم والقيم الممكنة.",
        memory: [],
      },
      {
        line: 2,
        say: "u8: عدد بلا إشارة (unsigned) في 8 بتات، أي بايت واحد. يحمل من 0 إلى 255، وهذا يكفي للعمر.",
        memory: [age],
        changed: ["age: u8"],
      },
      {
        line: 3,
        say: "ثلاثة مليارات لا تدخل في i32 (أقصاه نحو 2.1 مليار)، فنطلب i64: ثمانية بايتات. الشرطة السفلية _ لتسهيل القراءة فقط.",
        memory: [age, big],
        changed: ["big: i64"],
      },
      {
        line: 4,
        say: "7 و 2 عددان صحيحان، فالقسمة صحيحة: 3، ويُرمى الكسر. لم نكتب نوعاً، فاختار المترجم الافتراضي للأعداد الصحيحة: i32.",
        memory: [age, big, ratio],
        changed: ["ratio: i32"],
      },
      {
        line: 5,
        say: "النقطة تجعلهما عددين عشريين، والافتراضي لهما f64 (ثمانية بايتات). الآن 3.5.",
        memory: [age, big, ratio, exact],
        changed: ["exact: f64"],
      },
      {
        line: 6,
        say: "big من نوع i64 و age من نوع u8: درجان بحجمين مختلفين. Rust لا تحوّل أحدهما بصمت أبداً. as i64 تحويل صريح: نسخة من 30 في ثمانية بايتات.",
        memory: [age, big, ratio, exact],
        read: ["big: i64", "age: u8"],
      },
      {
        line: 6,
        say: "الآن النوعان متطابقان، فالجمع مسموح. total نوعه i64 استنتجه المترجم من الطرف الأيمن.",
        memory: [age, big, ratio, exact, total],
        changed: ["total: i64"],
      },
      {
        line: 7,
        say: "المقارنة تنتج bool: true أو false فقط، في بايت واحد. ولا يُعامل الرقم في Rust كأنه bool: if 1 مرفوضة.",
        memory: [age, big, ratio, exact, total, flag("ok: bool", true)],
        changed: ["ok: bool"],
        read: ["total: i64", "big: i64"],
      },
      {
        line: 8,
        say: "الطباعة تقرأ أربعة أدراج من أربعة أنواع مختلفة.",
        memory: [age, big, ratio, exact, total, flag("ok: bool", true)],
        read: ["total: i64", "ratio: i32", "exact: f64", "ok: bool"],
        output: ["3000000030 3 3.5 true"],
      },
    ],
    notes: {
      rust: "الأعداد الصحيحة: i8 إلى i128 بإشارة، u8 إلى u128 بلا إشارة، و usize بحجم عنوان الجهاز (للفهارس والأطوال). العشرية: f32 و f64. ثم bool و char (حرف Unicode في 4 بايتات). والمركّبة: tuple مثل (i32, bool) و array مثل [i32; 3].",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة بـ JavaScript لدرج u8: كل قيمة تُقصّ إلى 8 بتات. addU8 تتصرف مثل Rust: في debug تتوقف البرامج (panic) عند الفيضان، وفي release تلتف القيمة إلى البداية. asU8 تحاكي as u8 التي تحتفظ بأدنى 8 بتات فقط.",
    starter: `function addU8(a, b, mode) {
  const sum = a + b;
  if (sum > 255) {
    if (mode === "debug") {
      console.log("panicked: attempt to add with overflow");
      return null;
    }
    return sum % 256;
  }
  return sum;
}
function asU8(n) {
  return n % 256;
}
console.log(addU8(250, 3, "debug"));
console.log(addU8(250, 10, "release"));
console.log(addU8(250, 10, "debug"));
console.log(asU8(300));`,
    challenges: [
      "قبل التشغيل: ماذا يطبع كل سطر من الأربعة؟ لماذا 300 تصبح 44؟ (300 - 256)",
      "جرّب addU8(255, 1, \"release\"). لماذا يكون الناتج 0؟ تخيّل عدّاد سيارة قديم.",
      "اكتب asU8(256) و asU8(511). أي قيم u8 تأتي منهما؟",
      "في Rust الحقيقية ما الحل حين تحتاج أعداداً أكبر؟ غيّر 255 في الشرط إلى 65535 لتحاكي u16.",
    ],
  },
  predict: [
    {
      question: "هل يترجم هذا البرنامج؟",
      code: `fn main() {
    let a: i32 = 5;
    let b: i64 = 10;
    println!("{}", a + b);
}`,
      options: ["نعم، ويطبع 15", "لا: لا جمع بين i32 و i64 دون تحويل صريح", "نعم، ويطبع 15 من نوع i64"],
      answer: 1,
      why: "درج من 4 بايتات ودرج من 8. لغات كثيرة توسّع الأصغر بصمت، و Rust ترفض: التحويل الصامت مصدر أخطاء خفية. اكتب a as i64 + b، وأنت تعرف تماماً ما حدث.",
      scene: check(
        `fn main() {
    let a: i32 = 5;
    let b: i64 = 10;
    println!("{}", a + b);
}`,
        [
          { line: 2, say: "a في 4 بايتات.", memory: [num("a: i32", "5")], changed: ["a: i32"] },
          { line: 3, say: "b في 8 بايتات.", memory: [num("a: i32", "5"), num("b: i64", "10")], changed: ["b: i64"] },
          {
            line: 4,
            say: "نوعان مختلفان في عملية واحدة: المترجم يرفض.",
            memory: [num("a: i32", "5"), num("b: i64", "10")],
            read: ["a: i32", "b: i64"],
            error: "error[E0308]: mismatched types: expected `i32`, found `i64`",
          },
        ],
      ),
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: `fn main() {
    let x: i32 = 300;
    let y = x as u8;
    println!("{}", y);
}`,
      options: ["300", "255", "44"],
      answer: 2,
      why: "as بين أعداد صحيحة لا تفحص ولا تتوقف: تحتفظ بأدنى 8 بتات وتقصّ الباقي. 300 = 256 + 44، فيبقى 44. لذلك as للتوسيع آمنة، وللتضييق تحتاج حذراً (أو u8::try_from التي ترجع خطأً).",
      scene: check(
        `fn main() {
    let x: i32 = 300;
    let y = x as u8;
    println!("{}", y);
}`,
        [
          { line: 2, say: "300 في i32: 00000001 00101100 في البايتين الأدنى.", memory: [num("x: i32", "300")], changed: ["x: i32"] },
          { line: 3, say: "u8 يتسع لبايت واحد: يبقى 00101100 فقط، أي 44.", memory: [num("x: i32", "300"), num("y: u8", "44")], changed: ["y: u8"], read: ["x: i32"] },
          { line: 4, say: "يطبع 44.", memory: [num("x: i32", "300"), num("y: u8", "44")], read: ["y: u8"], output: ["44"] },
        ],
      ),
    },
    {
      question: "ماذا يحدث عند تشغيل هذا البرنامج بـ cargo run (نسخة debug)؟",
      code: `fn main() {
    let mut level: u8 = 255;
    level += 1;
    println!("{}", level);
}`,
      options: ["يطبع 256", "يطبع 0", "يتوقف البرنامج: attempt to add with overflow"],
      answer: 2,
      why: "256 لا تدخل في u8. في نسخة debug تفحص Rust كل عملية حسابية وتوقف البرنامج (panic) بدل أن تعطيك رقماً خاطئاً. في --release تُحذف هذه الفحوص للسرعة فتلتف القيمة إلى 0، ولهذا تختار نوعاً يتسع لقيمك.",
      scene: check(
        `fn main() {
    let mut level: u8 = 255;
    level += 1;
    println!("{}", level);
}`,
        [
          { line: 2, say: "level في أقصى ما يحمله u8: 11111111.", memory: [{ name: "level: u8", value: "255", type: "number" }], changed: ["level: u8"] },
          {
            line: 3,
            say: "255 + 1 تحتاج بتاً تاسعاً غير موجود. البرنامج يتوقف هنا، ولا يصل إلى الطباعة.",
            memory: [{ name: "level: u8", value: "255", type: "number" }],
            read: ["level: u8"],
            error: "thread 'main' panicked: attempt to add with overflow",
          },
        ],
      ),
    },
  ],
  code: {
    intro: "شغّل البرنامج. ثم غيّر 200 في سطر bump إلى 255 وشغّل: الفيضان يوقف البرنامج. جرّب أيضاً أن تحذف as f64 وتقرأ رسالة المترجم.",
    runnerLang: "rust",
    runnerStarter: `fn bump(level: u8) -> u8 {
    level + 1
}

fn main() {
    let letter: char = 'ع'; // char is any Unicode letter, 4 bytes
    let point: (i32, bool) = (5, true); // a tuple: values side by side
    let temps: [i32; 3] = [21, 25, 19]; // an array: 3 i32s, contiguous

    let sum = temps[0] + temps[1] + temps[2];
    let avg = sum as f64 / temps.len() as f64;

    println!("{} {} {}", letter, point.0, point.1);
    println!("sum {} avg {:.2}", sum, avg);
    println!("bump {}", bump(200));
    println!("u8 max {}, i32 max {}", u8::MAX, i32::MAX);
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "rust",
      title: "فكّ tuple",
      prompt: "رتّب الأسطر حتى يطبع البرنامج 7 3: مجموع الإحداثيين، ثم الأول منهما.",
      lines: ["fn main() {", "    let point: (i32, i32) = (3, 4);", "    let (x, y) = point;", '    println!("{} {}", x + y, point.0);', "}"],
      expected: "7 3",
    },
    {
      kind: "fill",
      lang: "rust",
      title: "قسمة بكسور",
      prompt: "total عدد صحيح، ونريد المتوسط بالكسر. إلى أي نوع نحوّله ليترجم البرنامج ويطبع 3.5؟",
      template: 'fn main() {\n    let total: i32 = 7;\n    let avg = total as ___ / 2.0;\n    println!("{}", avg);\n}',
      options: ["f64", "u8", "i64"],
      answer: "f64",
      expected: "3.5",
    },
    {
      kind: "fix",
      lang: "rust",
      title: "درجان بحجمين",
      prompt: "المترجم يرفض جمع i32 مع i64. أصلح السطر الثالث ليطبع 30 دون أن تغيّر أنواع a و b.",
      code: 'fn main() {\n    let a: i32 = 10;\n    let b: i64 = 20;\n    let sum = a + b;\n    println!("{}", sum);\n}',
      expected: "30",
      hint: "وسّع الأصغر إلى نوع الأكبر: a as i64 + b.",
      solution: 'fn main() {\n    let a: i32 = 10;\n    let b: i64 = 20;\n    let sum = a as i64 + b;\n    println!("{}", sum);\n}',
    },
    {
      kind: "write",
      lang: "rust",
      title: "أول وآخر",
      prompt: "عندك المصفوفة temps = [21, 25, 19]. اطبع أول عنصر وآخر عنصر وعدد العناصر في سطر واحد: 21 19 3. استعمل temps.len() لتصل إلى الأخير.",
      starter: "fn main() {\n    let temps = [21, 25, 19];\n    // print first, last and length\n}\n",
      expected: "21 19 3",
      hint: "الأخير فهرسه temps.len() - 1، لأن الفهارس تبدأ من 0.",
      solution: 'fn main() {\n    let temps = [21, 25, 19];\n    let last = temps[temps.len() - 1];\n    println!("{} {} {}", temps[0], last, temps.len());\n}',
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'println!("{} {}", 10 / 3, 10 % 3);',
      options: ["3 1", "3.33 1", "3 0"],
      answer: 0,
      why: "عددان صحيحان: القسمة صحيحة ترمي الكسر (3)، و % يعطي الباقي (1). للكسور اكتب 10.0 / 3.0.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: "let c = 'A';\nprintln!(\"{}\", c as u32);",
      options: ["65", "A", "خطأ: لا تحويل من char"],
      answer: 0,
      why: "char في الذاكرة رقم Unicode في 4 بايتات. as u32 تعطيك ذلك الرقم: 'A' هو 65.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'println!("{} {} {}", size_of::<u8>(), size_of::<i64>(), size_of::<char>());',
      options: ["1 8 4", "1 8 1", "8 8 8"],
      answer: 0,
      why: "الحجم جزء من النوع ويعرفه المترجم: u8 بايت، i64 ثمانية، و char أربعة لأنه يحمل أي حرف Unicode، لا ASCII فقط.",
    },
    {
      question: "ماذا يحدث مع هذا البرنامج؟",
      code: 'let a = [1, 2, 3];\nlet i = 5;\nprintln!("{}", a[i]);',
      options: [
        "المترجم يرفضه: index out of bounds: the length is 3 but the index is 5",
        "يطبع قيمة عشوائية من الذاكرة",
        "يطبع 0",
      ],
      answer: 0,
      why: "طول المصفوفة جزء من نوعها ([i32; 3])، والفهرس هنا ثابت معروف، فيرى المترجم الخطأ قبل التشغيل. ولو جاء الفهرس من المستخدم لتوقّف البرنامج عند التشغيل (panic)، ولم يقرأ أبداً خارج المصفوفة كما في C.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let t: (i32, f64, bool) = (2, 0.5, false);\nprintln!("{}", t.0 as f64 * t.1);',
      options: ["1", "خطأ: لا ضرب بين i32 و f64", "0"],
      answer: 0,
      why: "tuple ثلاثة أدراج متجاورة بأنواع مختلفة، تصل إليها بـ .0 و .1 و .2. t.0 حُوّل صراحة إلى f64، فصار الضرب بين نوعين متطابقين: 2.0 × 0.5 = 1، و f64 تطبع 1 دون كسور.",
    },
  ],
  next: "rs-functions",
};
