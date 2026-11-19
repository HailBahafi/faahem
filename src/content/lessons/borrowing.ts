import type { Cell, Lesson, Scene } from "@/lib/types";

/** The owner drawer: the String itself, on the heap, owned by `name`. */
const own = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
/** A borrow: an arrow to the owner, read-only (&) or with a pen (&mut). */
const shared = (name: string, to = "book"): Cell => ({ name, value: `&${to}  (read)`, type: "none" });
const mutable = (name: string, to = "book"): Cell => ({ name, value: `&mut ${to}  (write)`, type: "none" });
/** A borrow whose last use has passed: the book is back with its owner. */
const ended = (name: string): Cell => ({ name, value: "returned", type: "none" });
const gone = (name: string): Cell => ({ name, value: "freed", type: "none" });

/** A hand-written answer scene in Rust: the borrow checker reads the program before it runs. */
const check = (rust: string, steps: Scene["steps"]): Scene => ({ code: { rust }, steps });

export const borrowing: Lesson = {
  slug: "borrowing",
  stage: 10,
  number: "10.3",
  title: "الاستعارة",
  subtitle: "أعِر القيمة بدل أن تنقلها: قرّاء كثيرون أو كاتب واحد، ومدقق الاستعارة يثبت ذلك قبل أن يعمل البرنامج",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "كتاب واحد، ومن يستعيره؟",
    body: "عندك كتاب واحد في المكتبة. أعِره لقارئ، ثم لقارئ ثانٍ، ثم حاول أن تعطي أحداً قلماً ليكتب فيه وهم يقرؤون. مدقق الاستعارة يقبل أو يرفض كل محاولة برسالته الحقيقية، والخط الزمني يُظهر متى تبدأ كل استعارة ومتى تنتهي.",
    demo: "borrowing",
  },
  scene: {
    code: {
      rust: `fn main() {
    let mut book = String::from("Dune");
    let r1 = &book;
    let r2 = &book;
    println!("{} {}", r1, r2);
    let w = &mut book;
    w.push_str("!");
    println!("{}", book);
}`,
    },
    steps: [
      {
        line: null,
        say: "في درس الملكية رأيت أن تمرير قيمة ينقلها، فيموت المالك القديم. لو نقلنا الكتاب إلى كل دالة تقرؤه لما بقي معنا. الحل: نُعيره ويبقى ملكنا.",
        memory: [],
      },
      {
        line: 2,
        say: "book يملك النص \"Dune\" على الـ heap. وmut تعني أن المالك يسمح بتعديله لاحقاً.",
        memory: [own("book", "Dune")],
        changed: ["book"],
      },
      {
        line: 3,
        say: "‎&book‎ استعارة مشتركة: r1 سهم إلى الكتاب، يقرأ ولا يكتب. الملكية لم تنتقل، وbook ما زال المالك.",
        memory: [own("book", "Dune"), shared("r1")],
        changed: ["r1"],
      },
      {
        line: 4,
        say: "قارئ ثانٍ في الوقت نفسه؟ مقبول. القراءة لا تغيّر شيئاً، فلا يضرّ أن يقرأ كثيرون معاً.",
        memory: [own("book", "Dune"), shared("r1"), shared("r2")],
        changed: ["r2"],
      },
      {
        line: 5,
        say: "r1 وr2 يقرآن الكتاب عبر السهمين. وهذا آخر سطر يستعملهما، فاستعارتهما تنتهي هنا، لا عند نهاية الدالة.",
        memory: [own("book", "Dune"), shared("r1"), shared("r2")],
        read: ["r1", "r2"],
        output: ["Dune Dune"],
      },
      {
        line: 6,
        say: "‎&mut book‎ استعارة بقلم: w وحده يكتب. المدقق يسأل: هل يقرأ أحد الآن؟ لا، r1 وr2 انتهيا. فيقبل.",
        memory: [own("book", "Dune"), ended("r1"), ended("r2"), mutable("w")],
        changed: ["r1", "r2", "w"],
        output: ["Dune Dune"],
      },
      {
        line: 7,
        say: "w يكتب في الكتاب نفسه عبر السهم. لا نسخة: النص الذي يملكه book تغيّر.",
        memory: [own("book", "Dune!"), ended("r1"), ended("r2"), mutable("w")],
        changed: ["book"],
        read: ["w"],
        output: ["Dune Dune"],
      },
      {
        line: 8,
        say: "آخر استعمال لـ w كان السطر 7، فالقلم عاد. المالك يقرأ كتابه من جديد.",
        memory: [own("book", "Dune!"), ended("r1"), ended("r2"), ended("w")],
        changed: ["w"],
        read: ["book"],
        output: ["Dune Dune", "Dune!"],
      },
      {
        line: 9,
        say: "نهاية النطاق: المالك book يموت ويُحرَّر النص. لا سهم ما زال يشير إليه، فلا يوجد مرجع معلّق.",
        memory: [gone("book"), ended("r1"), ended("r2"), ended("w")],
        changed: ["book"],
        output: ["Dune Dune", "Dune!"],
      },
      {
        line: null,
        say: "لو كتبنا println!(\"{}\", r1) بعد السطر 7، لكان r1 يقرأ والقلم مع w في اللحظة نفسها. المدقق يرفض قبل التشغيل، ولا يُبنى البرنامج أصلاً.",
        memory: [own("book", "Dune"), shared("r1"), mutable("w")],
        error: "error[E0502]: cannot borrow `book` as mutable because it is also borrowed as immutable",
        output: ["Dune Dune", "Dune!"],
      },
    ],
    notes: {
      rust: "القاعدة كلها: في أي لحظة، إما عدد من ‎&T‎ (قرّاء)، أو ‎&mut T‎ واحد (كاتب)، لا الاثنان معاً. وكل سهم يجب أن يموت قبل مالكه. الاستعارة تنتهي عند آخر استعمال لها.",
    },
  },
  playground: {
    kind: "trace",
    intro: "مدقق الاستعارة الحقيقي يعمل وقت الترجمة، لا وقت التشغيل. هنا محاكاة له بـ JavaScript: الكتاب كائن يعدّ قرّاءه ويعرف إن كان معه قلم. كل طلب استعارة يُقبل أو يُرفض بالقاعدة نفسها: قرّاء كثيرون أو كاتب واحد.",
    starter: `const book = { title: "Dune", readers: 0, writer: false };

function borrowRead(b) {
  if (b.writer) {
    console.log("E0502: a writer has the pen");
    return false;
  }
  b.readers = b.readers + 1;
  console.log("&book ok, readers: " + b.readers);
  return true;
}

function borrowWrite(b) {
  if (b.writer) {
    console.log("E0499: only one writer at a time");
    return false;
  }
  if (b.readers > 0) {
    console.log("E0502: " + b.readers + " still reading");
    return false;
  }
  b.writer = true;
  console.log("&mut book ok");
  return true;
}

function giveBack(b, kind) {
  if (kind === "read") b.readers = b.readers - 1;
  else b.writer = false;
}

borrowRead(book);
borrowRead(book);
borrowWrite(book);
giveBack(book, "read");
giveBack(book, "read");
borrowWrite(book);
borrowRead(book);`,
    challenges: [
      "قبل أن تشغّل: أي الطلبات السبعة سيُرفض؟ اكتبها ثم قارن.",
      "احذف سطري giveBack. كم طلباً يُرفض الآن؟ لماذا لا يحصل الكاتب على القلم أبداً؟",
      "أضف giveBack(book, \"write\") قبل آخر سطر. هل يُقبل القارئ الأخير الآن؟",
      "اكتب سطراً يطلب كاتباً ثانياً والقلم ما زال مع الأول. ما رقم الخطأ الذي يطبعه؟",
    ],
  },
  predict: [
    {
      question: "first تقرأ أول عنصر، ثم نضيف عنصراً إلى المصفوفة. ماذا يحدث؟",
      code: `let mut v = vec![1, 2, 3];
let first = &v[0];
v.push(4);
println!("{}", first);`,
      options: ["المدقق يرفض السطر 3: E0502", "يطبع 1", "يتعطل البرنامج أثناء التشغيل"],
      answer: 0,
      why: "push تحتاج ‎&mut v‎ (كاتب)، وfirst ما زال قارئاً لأنه يُستعمل في السطر 4. وليس هذا تشدداً: إن امتلأت المصفوفة تنقلها push إلى مكان أكبر على الـ heap وتحرّر القديم، فيصير first سهماً إلى ذاكرة محرّرة.",
      scene: check(
        `let mut v = vec![1, 2, 3];
let first = &v[0];
v.push(4);
println!("{}", first);`,
        [
          { line: 1, say: "v يملك مصفوفة من ثلاثة عناصر على الـ heap.", memory: [own("v", "[1, 2, 3]")], changed: ["v"] },
          { line: 2, say: "first قارئ: سهم إلى أول عنصر داخل مصفوفة v.", memory: [own("v", "[1, 2, 3]"), shared("first", "v[0]")], changed: ["first"] },
          {
            line: 3,
            say: "push تطلب القلم، وfirst ما زال قارئاً (سيُستعمل في السطر 4). قارئ وكاتب معاً: مرفوض، والبرنامج لا يُبنى.",
            memory: [own("v", "[1, 2, 3]"), shared("first", "v[0]")],
            read: ["first"],
            error: "error[E0502]: cannot borrow `v` as mutable because it is also borrowed as immutable",
          },
        ],
      ),
    },
    {
      question: "r يستعير s داخل قوسين، ثم نطبع r بعدهما. ماذا يحدث؟",
      code: `let r;
{
    let s = String::from("hi");
    r = &s;
}
println!("{}", r);`,
      options: ["المدقق يرفض: s لا يعيش طويلاً بما يكفي", "يطبع hi", "يطبع نصاً عشوائياً من الذاكرة"],
      answer: 0,
      why: "s يموت عند القوس في السطر 5 ويُحرَّر نصه، لكن r سيُستعمل في السطر 6. سهم يعيش أطول من مالكه هو المرجع المعلّق، وهو ما يسبب في C قراءة ذاكرة محرّرة. Rust ترفضه قبل التشغيل (E0597).",
      scene: check(
        `let r;
{
    let s = String::from("hi");
    r = &s;
}
println!("{}", r);`,
        [
          { line: 1, say: "r درج سيحمل سهماً لاحقاً.", memory: [{ name: "r", value: "—", type: "none" }] },
          { line: 3, say: "داخل القوسين: s يملك \"hi\".", memory: [{ name: "r", value: "—", type: "none" }, own("s", "hi")], changed: ["s"] },
          { line: 4, say: "r يستعير s.", memory: [shared("r", "s"), own("s", "hi")], changed: ["r"] },
          {
            line: 5,
            say: "القوس يُغلق: s يموت ويُحرَّر النص. لكن r سيُقرأ في السطر 6، فهو سهم إلى لا شيء. المدقق يرفض.",
            memory: [shared("r", "s"), gone("s")],
            changed: ["s"],
            error: "error[E0597]: `s` does not live long enough",
          },
        ],
      ),
    },
    {
      question: "r يقرأ n، ثم نأخذ قلماً بـ ‎&mut n‎. هل يُبنى البرنامج؟",
      code: `let mut n = String::from("a");
let r = &n;
println!("{}", r);
let w = &mut n;
w.push('b');
println!("{}", n);`,
      options: ["نعم، ويطبع a ثم ab", "لا: n مستعار للقراءة ثم للكتابة", "لا: r ما زال حياً حتى نهاية الدالة"],
      answer: 0,
      why: "الاستعارة تنتهي عند آخر استعمال لها، لا عند نهاية النطاق. آخر استعمال لـ r في السطر 3، والقلم يُطلب في السطر 4. لا لحظة فيها قارئ وكاتب معاً، فالمدقق يقبل.",
      scene: check(
        `let mut n = String::from("a");
let r = &n;
println!("{}", r);
let w = &mut n;
w.push('b');
println!("{}", n);`,
        [
          { line: 1, say: "n يملك \"a\".", memory: [own("n", "a")], changed: ["n"] },
          { line: 2, say: "r قارئ.", memory: [own("n", "a"), shared("r", "n")], changed: ["r"] },
          { line: 3, say: "آخر استعمال لـ r: تنتهي استعارته هنا.", memory: [own("n", "a"), shared("r", "n")], read: ["r"], output: ["a"] },
          { line: 4, say: "لا قارئ الآن، فالقلم متاح.", memory: [own("n", "a"), ended("r"), mutable("w", "n")], changed: ["r", "w"], output: ["a"] },
          { line: 5, say: "w يكتب b في نص n نفسه.", memory: [own("n", "ab"), ended("r"), mutable("w", "n")], changed: ["n"], output: ["a"] },
          { line: 6, say: "القلم عاد، والمالك يقرأ.", memory: [own("n", "ab"), ended("r"), ended("w")], read: ["n"], output: ["a", "ab"] },
        ],
      ),
    },
  ],
  code: {
    intro: "Rust لا يعمل داخل هذا الدرس. انسخ البرنامج إلى play.rust-lang.org وشغّله. فيه دالة تقرأ باستعارة ‎&‎ ودالة تكتب باستعارة ‎&mut‎، والمالك يبقى صالحاً بعد الاستدعاءين. ثم جرّب السطر المعلّق في الأسفل وأزل علامة التعليق لترى رسالة E0502.",
    runnerLang: "text",
    runnerStarter: `fn count_words(text: &String) -> usize {
    text.split(' ').count() // reads only: a shared borrow is enough
}

fn add_signature(text: &mut String) {
    text.push_str(" -- Sara"); // writes: needs the pen
}

fn main() {
    let mut note = String::from("see you soon");

    let n = count_words(&note); // lend it to read; note is still ours
    println!("{} words", n);

    add_signature(&mut note); // lend it to write; the borrow ends when the call returns
    println!("{}", note);

    let a = &note;
    let b = &note; // many readers at once: fine
    println!("{} | {}", a, b);

    // let w = &mut note; println!("{}", a); // try this: E0502
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "أعِر ولا تنقل",
      prompt: "رتّب الأسطر: دالة count تستعير نصاً للقراءة وترجع طوله، ثم main تعيرها name وتبقى name صالحة بعدها، فيُطبع Sara 4.",
      lines: [
        "fn count(s: &String) -> usize {",
        "    s.len()",
        "}",
        "fn main() {",
        '    let name = String::from("Sara");',
        "    let n = count(&name);",
        '    println!("{} {}", name, n);',
        "}",
      ],
      expected: "Sara 4",
    },
    {
      kind: "fill",
      lang: "text",
      title: "استعارة بقلم",
      prompt: "shout تضيف ! إلى النص الذي تستعيره. أي نوع للمعامل يجعل البرنامج يُبنى ويطبع hi!؟",
      template: `fn shout(s: ___String) {
    s.push_str("!");
}
fn main() {
    let mut msg = String::from("hi");
    shout(&mut msg);
    println!("{}", msg);
}`,
      options: ["&mut ", "&", "mut "],
      answer: "&mut ",
      expected: "hi!",
    },
    {
      kind: "order",
      lang: "text",
      title: "اقرأ ثم اكتب",
      prompt: "رتّب الأسطر حتى يقبلها المدقق: القارئ first يجب أن ينتهي (آخر استعمال له) قبل أن تطلب push القلم. المخرج 1 ثم [1, 2, 3].",
      lines: ["let mut list = vec![1, 2];", "let first = &list[0];", 'println!("{}", first);', "list.push(3);", 'println!("{:?}", list);'],
      expected: "1\n[1, 2, 3]",
    },
    {
      kind: "fill",
      lang: "text",
      title: "قارئان معاً",
      prompt: "a وb يقرآن الكتاب في اللحظة نفسها. أي استعارة يقبلها المدقق في الفراغ؟",
      template: `let book = String::from("Dune");
let a = ___book;
let b = &book;
println!("{} {}", a, b);`,
      options: ["&", "&mut ", "*"],
      answer: "&",
      expected: "Dune Dune",
    },
  ],
  quiz: [
    {
      question: "أي سطر يرفضه المدقق؟",
      code: `let mut s = String::from("hi");
let a = &mut s;
let b = &mut s;
a.push('!');
println!("{}", b);`,
      options: ["السطر 3: E0499، قلمان معاً", "السطر 4", "لا شيء، يطبع hi!"],
      answer: 0,
      why: "a ما زال يحمل القلم (يُستعمل في السطر 4) حين يطلب b قلماً ثانياً. كاتبان على الشيء نفسه في الوقت نفسه هو بالضبط ما يُفسد البيانات، فالرسالة: cannot borrow `s` as mutable more than once at a time.",
    },
    {
      question: "ماذا يطبع؟ كل استدعاء لـ add يستعير v بقلم.",
      code: `fn add(v: &mut Vec<i32>) {
    v.push(9);
}
fn main() {
    let mut v = vec![1];
    add(&mut v);
    add(&mut v);
    println!("{:?}", v);
}`,
      options: ["[1, 9, 9]", "خطأ E0499: استعارتان بقلم", "[1, 9]"],
      answer: 0,
      why: "استعارة الاستدعاء الأول تنتهي حين تعود add. فالثاني يجد القلم متاحاً. كاتب واحد في كل لحظة، لا كاتب واحد للأبد. والاثنان كتبا في مصفوفة v نفسها.",
    },
    {
      question: "متى يكشف Rust خطأ قارئ وكاتب في اللحظة نفسها؟",
      options: [
        "عند الترجمة، قبل أن يعمل البرنامج، بلا أي كلفة وقت التشغيل",
        "أثناء التشغيل، حين يحاول السطر الكتابة",
        "لا يكشفه، بل جامع القمامة يصلحه",
      ],
      answer: 0,
      why: "المدقق يقرأ الكود ويحسب أين تبدأ كل استعارة وأين تنتهي. إن وجد لحظة تخالف القاعدة يرفض البناء. لذلك لا يحتاج البرنامج جامع قمامة ولا فحوصاً أثناء التشغيل: الأمان ثابت قبل أن يبدأ.",
    },
    {
      question: "make ترجع سهماً إلى نص أنشأته بنفسها. لماذا يرفضها Rust؟",
      code: `fn make() -> &String {
    let s = String::from("hi");
    &s
}`,
      options: [
        "s يموت عند نهاية الدالة، فالسهم المُعاد سيشير إلى ذاكرة محرّرة",
        "الدوال لا يمكن أن ترجع سهماً أبداً",
        "لأن s ليست mut",
      ],
      answer: 0,
      why: "المالك s يعيش داخل make فقط، ويُحرَّر نصه عند القوس الأخير. سهم يخرج من الدالة سيعيش أطول من مالكه: مرجع معلّق. رسالة المترجم (E0106) تقول ذلك: القيمة المُعادة مستعارة، ولا يوجد شيء تُستعار منه. الحل أن ترجع String نفسها فتنتقل ملكيتها إلى المستدعي.",
    },
    {
      question: "لماذا تكفي قاعدة «قرّاء كثيرون أو كاتب واحد» لمنع سباق البيانات (data race)؟",
      options: [
        "السباق يحتاج كاتباً وشخصاً آخر يصل إلى البيانات نفسها في الوقت نفسه، والقاعدة تمنع هذه اللحظة بالضبط",
        "لأن Rust تشغّل كل شيء على خيط واحد",
        "لأن القرّاء ينسخون البيانات قبل قراءتها",
      ],
      answer: 0,
      why: "قراءات كثيرة معاً لا تغيّر شيئاً فلا تتعارض. المشكلة فقط حين يكتب أحد ويقرأ أو يكتب غيره في اللحظة نفسها. القاعدة تجعل الكاتب وحيداً دائماً، وهذا ما ستراه في درس التزامن مع الخيوط.",
    },
  ],
  next: "concurrency",
};
