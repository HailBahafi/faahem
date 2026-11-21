import type { Cell, Lesson, Scene, Step } from "@/lib/types";

const file = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const bin = (name: string, value: string): Cell => ({ name, value, type: "none" });
const check = (code: Scene["code"], steps: Step[]): Scene => ({ code, steps });

const toml = file("Cargo.toml", "hello 0.1.0, edition 2021");
const mainRs = file("src/main.rs", "fn main() {...}");
const debug = bin("target/debug/hello", "binary (debug)");
const release = bin("target/release/hello", "binary (release)");

const created = ["Creating binary (application) `hello` package"];
const firstRun = [...created, "Compiling hello v0.1.0", "Finished `dev` profile [unoptimized + debuginfo]", "Running `target/debug/hello`"];

export const rsCargo: Lesson = {
  slug: "rs-cargo",
  stage: 0,
  number: "1.1",
  title: "cargo",
  subtitle: "من ملف نصي إلى برنامج يعمل: المترجم أولاً، ثم التشغيل",
  minutes: 14,
  singleLanguage: true,
  problem: {
    title: "من يقف بين الكود والتشغيل؟",
    body: "أنشئ مشروعاً، شغّله، ثم اكسر سطراً في main.rs وشغّله مرة أخرى. راقب مجلد target: متى يظهر البرنامج، ومتى لا يظهر أبداً؟",
    demo: "rsCargo",
  },
  scene: {
    code: {
      shell: `cargo new hello
cd hello
cat src/main.rs
cargo run
cargo run
cargo build --release
./target/release/hello`,
    },
    steps: [
      {
        line: null,
        say: "Rust لغة مترجَمة: ملف نصي يتحوّل أولاً إلى برنامج آلة، ثم يعمل البرنامج. cargo هو مدير المشروع الذي ينظّم هذا كله. الأدراج هنا ملفات المشروع.",
        memory: [],
      },
      {
        line: 1,
        say: "cargo new يصنع مجلداً فيه ملفان مهمان: Cargo.toml يصف المشروع (اسمه، نسخته، إصدار اللغة 2021، مكتباته)، و src/main.rs فيه الكود.",
        memory: [toml, mainRs],
        changed: ["Cargo.toml", "src/main.rs"],
        output: created,
      },
      {
        line: 3,
        say: "main.rs فيه دالة واحدة: main. منها يبدأ كل برنامج Rust، و println! يطبع سطراً. علامة ! تعني أنه macro، نعود إليه لاحقاً.",
        memory: [toml, mainRs],
        read: ["src/main.rs"],
        output: [...created, "fn main() {", '    println!("Hello, world!");', "}"],
      },
      {
        line: 4,
        say: "cargo run يقرأ Cargo.toml ويستدعي المترجم rustc على المشروع كله. المترجم يفحص كل سطر قبل أن يعمل أي سطر، ثم يكتب ملفاً تنفيذياً في target/debug.",
        memory: [toml, mainRs, debug],
        changed: ["target/debug/hello"],
        read: ["Cargo.toml", "src/main.rs"],
        output: firstRun,
      },
      {
        line: 4,
        say: "الآن فقط يعمل البرنامج: cargo يشغّل الملف التنفيذي، فيُطبع Hello, world!. الترجمة والتشغيل خطوتان منفصلتان.",
        memory: [toml, mainRs, debug],
        read: ["target/debug/hello"],
        output: [...firstRun, "Hello, world!"],
      },
      {
        line: 5,
        say: "مرة ثانية دون تعديل: cargo يرى أن main.rs لم يتغيّر منذ آخر ترجمة، فلا يترجم. يشغّل الملف الموجود مباشرة، لذلك لا يظهر سطر Compiling.",
        memory: [toml, mainRs, debug],
        read: ["target/debug/hello"],
        output: [...firstRun, "Hello, world!", "Finished `dev` profile [unoptimized + debuginfo]", "Running `target/debug/hello`", "Hello, world!"],
      },
      {
        line: 6,
        say: "--release يترجم مرة أخرى مع التحسينات: ترجمة أبطأ، وبرنامج أسرع بكثير. ملفه في مجلد آخر: target/release.",
        memory: [toml, mainRs, debug, release],
        changed: ["target/release/hello"],
        output: ["Compiling hello v0.1.0", "Finished `release` profile [optimized]"],
      },
      {
        line: 7,
        say: "الملف التنفيذي برنامج مستقل: يعمل دون cargo ودون المترجم، على أي جهاز من النوع نفسه. هذا ما تشحنه للمستخدمين.",
        memory: [toml, mainRs, debug, release],
        read: ["target/release/hello"],
        output: ["Compiling hello v0.1.0", "Finished `release` profile [optimized]", "Hello, world!"],
      },
    ],
    notes: {
      shell: "cargo check يفحص الكود دون أن يصنع ملفاً تنفيذياً، فهو أسرع وتستعمله كثيراً أثناء الكتابة. cargo build يترجم فقط، و cargo run يترجم ثم يشغّل.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة بـ JavaScript لما يفعله cargo run: يترجم فقط إذا تغيّر الكود، ولا يشغّل شيئاً إذا وجد المترجم خطأ. source هو محتوى main.rs، و hasError يمثّل خطأً يجده المترجم.",
    starter: `let built = "";
function compile(source, hasError) {
  if (hasError) {
    console.log("error[E0308]: mismatched types");
    return false;
  }
  console.log("Compiling hello");
  built = source;
  return true;
}
function cargoRun(source, hasError) {
  if (source !== built) {
    const ok = compile(source, hasError);
    if (!ok) {
      console.log("could not compile: nothing runs");
      return;
    }
  }
  console.log("Running: " + built);
}
cargoRun("Hello", false);
cargoRun("Hello", false);
cargoRun("Hi", true);`,
    challenges: [
      "قبل التشغيل: كم مرة سيُطبع Compiling hello؟ ولماذا لا يُطبع في الاستدعاء الثاني؟",
      "في الاستدعاء الثالث فيه خطأ. هل يعمل البرنامج القديم \"Hello\"؟ تتبّع المسار داخل cargoRun.",
      "أضف cargoRun(\"Hi\", false); في النهاية. هل يترجم الآن؟ ماذا يطبع؟",
      "غيّر الاستدعاء الثاني إلى cargoRun(\"Hello!\", false);  لماذا عادت الترجمة رغم أن الفرق حرف واحد؟",
    ],
  },
  predict: [
    {
      question: "شغّلنا هذا البرنامج بـ cargo run. ماذا يظهر؟",
      code: `fn main() {
    println!("start");
    let n: i32 = "five";
    println!("{}", n);
}`,
      options: ["start ثم خطأ عند السطر 3", "لا يُطبع شيء: المترجم يرفض البرنامج قبل تشغيله", "start ثم five"],
      answer: 1,
      why: "المترجم يقرأ الملف كله أولاً. السطر 3 يضع نصاً في درج نوعه i32، فيتوقف بـ error[E0308]: mismatched types. لا يُصنع ملف تنفيذي، فلا يعمل حتى السطر 2.",
      scene: check(
        {
          rust: `fn main() {
    println!("start");
    let n: i32 = "five";
    println!("{}", n);
}`,
        },
        [
          { line: null, say: "cargo run يبدأ بالترجمة: rustc يقرأ الملف من أوله، ولا يشغّل شيئاً بعد.", memory: [] },
          { line: 2, say: "سطر سليم. المترجم يحوّله إلى تعليمات ويكمل القراءة. لم يُطبع شيء.", memory: [] },
          {
            line: 3,
            say: "n درج لعدد صحيح، والقيمة نص. المترجم يرفض البرنامج كله. لا ملف تنفيذي، ولا start.",
            memory: [],
            error: "error[E0308]: mismatched types: expected `i32`, found `&str`",
          },
        ],
      ),
    },
    {
      question: "شغّلنا cargo run مرتين متتاليتين دون أن نغيّر main.rs. ماذا يفعل cargo في المرة الثانية؟",
      code: `cargo run
cargo run`,
      options: ["يترجم من جديد ثم يشغّل", "لا يترجم: يشغّل الملف التنفيذي الموجود مباشرة", "يرفض لأن البرنامج يعمل مسبقاً"],
      answer: 1,
      why: "cargo يقارن الملفات بآخر ترجمة. لم يتغيّر شيء، فالملف في target/debug ما زال صالحاً. لذلك المرة الثانية فورية، ولا يظهر سطر Compiling.",
      scene: check(
        { shell: "cargo run\ncargo run" },
        [
          { line: 1, say: "أول مرة: ترجمة ثم تشغيل.", memory: [mainRs, debug], changed: ["target/debug/hello"], output: ["Compiling hello v0.1.0", "Running `target/debug/hello`", "Hello, world!"] },
          { line: 2, say: "main.rs كما هو: لا ترجمة، تشغيل مباشر.", memory: [mainRs, debug], read: ["target/debug/hello"], output: ["Compiling hello v0.1.0", "Running `target/debug/hello`", "Hello, world!", "Running `target/debug/hello`", "Hello, world!"] },
        ],
      ),
    },
    {
      question: "شغّلنا cargo check على مشروع جديد. هل يوجد الآن ملف تنفيذي في target/debug؟",
      code: `cargo check
./target/debug/hello`,
      options: ["نعم، check و build الشيء نفسه", "لا: check يفحص الأخطاء فقط ولا يصنع برنامجاً", "نعم، لكنه نسخة release"],
      answer: 1,
      why: "cargo check يمرّ بمراحل الفحص في المترجم (الأنواع، الملكية) ويتوقف قبل توليد كود الآلة. لذلك هو أسرع، ولذلك لا يوجد برنامج لتشغيله.",
      scene: check(
        { shell: "cargo check\n./target/debug/hello" },
        [
          { line: 1, say: "الفحص نجح: لا أخطاء. لكن لم يُكتب ملف تنفيذي.", memory: [toml, mainRs], output: ["Checking hello v0.1.0", "Finished `dev` profile"] },
          { line: 2, say: "لا يوجد ملف بهذا الاسم بعد.", memory: [toml, mainRs], error: "No such file or directory", output: ["Checking hello v0.1.0", "Finished `dev` profile"] },
        ],
      ),
    },
  ],
  code: {
    intro: "هذا محتوى src/main.rs. شغّله، ثم غيّر الاسم وأضف سطر println! جديداً. جرّب أيضاً أن تحذف فاصلة منقوطة وتقرأ رسالة المترجم: تشير إلى السطر والعمود بالضبط.",
    runnerLang: "rust",
    runnerStarter: `// src/main.rs: the file \`cargo new\` creates for you.
// Change the name, add a line, then run again.
fn main() {
    let name = "Sara";
    println!("Hello, {}!", name);
    println!("{} + {} = {}", 2, 3, 2 + 3);
    println!("{name} has {} letters", name.len());
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "rust",
      title: "أول main",
      prompt: "رتّب الأسطر حتى يطبع البرنامج السطرين كما يطبعهما cargo. المتغير يجب أن يوجد قبل أن يُستعمل.",
      lines: ["fn main() {", '    let name = "hello";', '    println!("Compiling {}", name);', '    println!("Running target/debug/{}", name);', "}"],
      expected: "Compiling hello\nRunning target/debug/hello",
    },
    {
      kind: "fill",
      lang: "rust",
      title: "الطباعة macro",
      prompt: "ما الذي ينقص حتى يترجم البرنامج ويطبع Hello, Rust!؟",
      template: 'fn main() {\n    let lang = "Rust";\n    println___("Hello, {}!", lang);\n}',
      options: ["!", "", "?"],
      answer: "!",
      expected: "Hello, Rust!",
    },
    {
      kind: "fix",
      lang: "rust",
      title: "قوسان ومتغير واحد",
      prompt: "المترجم يرفض هذا البرنامج: في النص مكانان {} وأعطيناه قيمة واحدة. أصلحه ليطبع Sara is 20 years old.",
      code: 'fn main() {\n    let name = "Sara";\n    let age = 20;\n    println!("{} is {} years old", name);\n}',
      expected: "Sara is 20 years old",
      hint: "كل {} يأخذ قيمة بالترتيب بعد النص. أضف age بعد name.",
      solution: 'fn main() {\n    let name = "Sara";\n    let age = 20;\n    println!("{} is {} years old", name, age);\n}',
    },
    {
      kind: "write",
      lang: "rust",
      title: "فاتورة صغيرة",
      prompt: "اكتب برنامجاً فيه price = 15 و count = 3، ويطبع سطرين: tea x3 ثم total: 45 (احسب المجموع في الكود).",
      starter: "fn main() {\n    // let price = ...\n    // let count = ...\n}\n",
      expected: "tea x3\ntotal: 45",
      hint: 'println!("tea x{}", count); ثم println!("total: {}", price * count);',
      solution: 'fn main() {\n    let price = 15;\n    let count = 3;\n    println!("tea x{}", count);\n    println!("total: {}", price * count);\n}',
    },
  ],
  quiz: [
    {
      question: "أين يكتب cargo اسم المشروع وإصدار اللغة ومكتباته؟",
      options: ["Cargo.toml", "src/main.rs", "target/debug"],
      answer: 0,
      why: "Cargo.toml وصف المشروع: [package] فيه الاسم والنسخة و edition = \"2021\"، و [dependencies] فيه المكتبات. cargo يقرؤه في كل أمر.",
    },
    {
      question: "في main.rs عشرون سطراً، والسطر 15 فيه خطأ نوع. عند cargo run، كم سطراً يعمل؟",
      options: ["لا شيء", "14 سطراً ثم يتوقف", "كل الأسطر إلا 15"],
      answer: 0,
      why: "الترجمة تسبق التشغيل. خطأ واحد يمنع صنع الملف التنفيذي، فلا يوجد برنامج ليعمل أصلاً. هذا عكس JavaScript و Python اللتين تنفّذان حتى السطر المخطئ.",
    },
    {
      question: "ماذا يطبع هذا الأمر؟",
      code: "cargo run\n# edit src/main.rs\ncargo run",
      options: ["Compiling مرتين، لأن الملف تغيّر", "Compiling مرة واحدة فقط", "لا Compiling أبداً"],
      answer: 0,
      why: "cargo يترجم من جديد كلما تغيّر ملف من ملفات المشروع منذ آخر ترجمة، ولو حرفاً واحداً. إن لم يتغيّر شيء، يشغّل الملف الموجود.",
    },
    {
      question: "أي ملف تنفيذي أسرع عند التشغيل؟",
      options: ["target/release/hello", "target/debug/hello", "متساويان دائماً"],
      answer: 0,
      why: "--release يطلب من المترجم أن يحسّن الكود (يدمج الدوال، يحذف الفحوص الزائدة)، فتطول الترجمة ويسرع البرنامج، أحياناً عشرات المرات. debug يترجم بسرعة ويحتفظ بمعلومات التتبّع.",
    },
    {
      question: "أضفنا هذا إلى Cargo.toml. ماذا يحدث في cargo build التالي؟",
      code: '[dependencies]\nrand = "0.8"',
      options: [
        "يحمّل cargo مكتبة rand من crates.io ويترجمها مع مشروعك",
        "لا شيء حتى تنسخ كود rand بيدك",
        "يفشل لأن المكتبات تُثبَّت للنظام كله",
      ],
      answer: 0,
      why: "cargo مدير حزم أيضاً: يحمّل الـ crate ويثبّت نسختها الدقيقة في Cargo.lock، ويترجمها مرة واحدة ويعيد استعمالها. كل مشروع له مكتباته الخاصة.",
    },
  ],
  next: "rs-variables",
};
