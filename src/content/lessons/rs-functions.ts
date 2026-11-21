import type { Frame, Lesson, Scene, Slot, Step } from "@/lib/types";

const n = (name: string, value: number): Slot => ({ name, value: String(value), type: "number" });
const ch = (name: string, value: string): Slot => ({ name, value: `'${value}'`, type: "string" });
const main = (vars: Slot[]): Frame => ({ id: 1, name: "main", vars });
const grade = (score: number): Frame => ({ id: 2, name: "grade", vars: [n("score", score)] });
const at = (line: number | null, say: string, frames: Frame[], extra: Partial<Step> = {}): Step => ({ line, say, memory: [], frames, heap: [], ...extra });
const check = (rust: string, steps: Step[]): Scene => ({ code: { rust }, steps });

const out1 = ["95 -> A"];
const out2 = [...out1, "80 -> B"];
const out3 = [...out2, "60 -> C"];

export const rsFunctions: Lesson = {
  slug: "rs-functions",
  stage: 0,
  number: "1.4",
  title: "الدوال والتحكم",
  subtitle: "كل كتلة لها قيمة: آخر تعبير بلا فاصلة منقوطة هو ما ترجعه",
  minutes: 20,
  singleLanguage: true,
  problem: {
    title: "فاصلة منقوطة واحدة",
    body: "هذه دالة تضاعف رقماً. أضف فاصلة منقوطة في نهاية سطرها الوحيد واحذفها، وراقب ما ترجعه الدالة. كيف يغيّر حرف واحد معنى البرنامج؟",
    demo: "rsFunctions",
  },
  scene: {
    code: {
      rust: `fn grade(score: u32) -> char {
    if score >= 90 { 'A' } else if score >= 75 { 'B' } else { 'C' }
}
fn main() {
    for s in [95, 80, 60] {
        let g = grade(s);
        println!("{} -> {}", s, g);
    }
}`,
    },
    steps: [
      at(null, "دالة في Rust: اسم، ومدخلات بأنواعها، ونوع ما ترجعه بعد ->. المترجم يفحص كل استدعاء: لا يمكن أن تمرّر نصاً لـ score.", []),
      at(5, "main تبدأ بإطار على المكدّس. for تأخذ عناصر المصفوفة واحداً واحداً: s = 95.", [main([n("s", 95)])], { changed: ["s"] }),
      at(6, "استدعاء grade: إطار جديد فوق main، وتُنسخ 95 إلى score.", [main([n("s", 95)]), grade(95)], { changed: ["score"], read: ["s"] }),
      at(2, "score >= 90 صحيح، فيُختار الفرع الأول. الكتلة { 'A' } قيمتها 'A'، وهي قيمة if كلها. وهذا آخر تعبير في الدالة وبلا فاصلة منقوطة، فهو ما ترجعه. لا حاجة لـ return.", [main([n("s", 95)]), grade(95)], { read: ["score"] }),
      at(6, "إطار grade يُزال، والقيمة 'A' تصل إلى g.", [main([n("s", 95), ch("g", "A")])], { changed: ["g"] }),
      at(7, "يطبع السطر الأول.", [main([n("s", 95), ch("g", "A")])], { read: ["s", "g"], output: out1 }),
      at(5, "نهاية جسم الحلقة: g يُزال، و s يأخذ العنصر التالي: 80.", [main([n("s", 80)])], { changed: ["s"], output: out1 }),
      at(2, "إطار جديد لـ grade فيه 80. الشرط الأول خطأ، فينتقل إلى else if: 80 >= 75 صحيح، والقيمة 'B'.", [main([n("s", 80)]), grade(80)], { read: ["score"], output: out1 }),
      at(7, "رجعت 'B' إلى g، والطباعة.", [main([n("s", 80), ch("g", "B")])], { changed: ["g"], output: out2 }),
      at(2, "s = 60: الشرطان خطأ، فتصل إلى else الأخيرة: 'C'. كل فروع if ترجع char، وإلا رفض المترجم.", [main([n("s", 60)]), grade(60)], { read: ["score"], output: out2 }),
      at(7, "الطباعة الأخيرة.", [main([n("s", 60), ch("g", "C")])], { read: ["s", "g"], output: out3 }),
      at(9, "انتهت المصفوفة فتنتهي الحلقة، ثم main وإطارها.", [], { output: out3 }),
    ],
    notes: {
      rust: "في Rust تقريباً كل شيء تعبير له قيمة: الكتلة { }، و if، و match، و loop (بـ break قيمة). الفاصلة المنقوطة تحوّل التعبير إلى جملة قيمتها () أي «لا شيء».",
    },
  },
  playground: {
    kind: "trace",
    intro: "المنطق نفسه بـ JavaScript، لتراقب الإطارات على المكدّس. في JavaScript تحتاج return صريحة، أما Rust فترجع آخر تعبير في الدالة.",
    starter: `function grade(score) {
  if (score >= 90) {
    return "A";
  } else if (score >= 75) {
    return "B";
  }
  return "C";
}
const scores = [95, 80, 60];
for (const s of scores) {
  const g = grade(s);
  console.log(s + " -> " + g);
}`,
    challenges: [
      "قبل التشغيل: كم إطاراً لـ grade سيُفتح ويُغلق؟",
      "أضف 75 إلى المصفوفة. هل يحصل على B أم C؟ لماذا >= وليس >؟",
      "بدّل ترتيب الشرطين (75 أولاً ثم 90). ماذا يحصل 95 الآن؟ ولماذا ترتيب الشروط مهم؟",
      "احذف return من السطر الأخير. ماذا ترجع الدالة لـ 60 في JavaScript؟ في Rust كان المترجم سيرفض.",
    ],
  },
  predict: [
    {
      question: "هل يترجم هذا البرنامج؟",
      code: `fn double(n: i32) -> i32 {
    n * 2;
}
fn main() {
    println!("{}", double(4));
}`,
      options: ["نعم، ويطبع 8", "لا: الدالة لا ترجع i32", "نعم، ويطبع 0"],
      answer: 1,
      why: "الفاصلة المنقوطة جعلت n * 2 جملة تُحسب ثم تُرمى، فصار جسم الدالة بلا قيمة: (). والدالة وعدت بـ i32. المترجم يقول بالضبط: expected `i32`, found `()`، ويقترح: remove this semicolon.",
      scene: check(
        `fn double(n: i32) -> i32 {
    n * 2;
}
fn main() {
    println!("{}", double(4));
}`,
        [
          { line: 1, say: "الدالة تعد بإرجاع i32.", memory: [] },
          { line: 2, say: "n * 2; جملة. قيمتها تُرمى، والكتلة تنتهي بلا تعبير أخير، أي ().", memory: [] },
          { line: 1, say: "الوعد i32 والجسم يعطي (). المترجم يرفض قبل التشغيل.", memory: [], error: "error[E0308]: mismatched types: expected `i32`, found `()`" },
        ],
      ),
    },
    {
      question: "هل يترجم هذا البرنامج؟",
      code: `fn main() {
    let x = 5;
    let y = if x > 3 { "big" } else { 0 };
    println!("{}", y);
}`,
      options: ["نعم، ويطبع big", "لا: فرعا if بنوعين مختلفين", "نعم، ويطبع 0"],
      answer: 1,
      why: "if هنا تعبير يملأ درج y، والمترجم يجب أن يعرف نوع y قبل التشغيل، أياً كان الفرع. فرع نص وفرع رقم: لا نوع واحد يجمعهما.",
      scene: check(
        `fn main() {
    let x = 5;
    let y = if x > 3 { "big" } else { 0 };
    println!("{}", y);
}`,
        [
          { line: 2, say: "x = 5.", memory: [{ name: "x", value: "5", type: "number", constant: true }] },
          {
            line: 3,
            say: "الفرع الأول &str، والثاني عدد. نوع y مجهول، فيرفض المترجم.",
            memory: [{ name: "x", value: "5", type: "number", constant: true }],
            error: "error[E0308]: `if` and `else` have incompatible types: expected `&str`, found integer",
          },
        ],
      ),
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: `fn main() {
    let mut n = 1;
    let result = loop {
        if n >= 20 {
            break n;
        }
        n *= 3;
    };
    println!("{}", result);
}`,
      options: ["20", "27", "9"],
      answer: 1,
      why: "loop تدور بلا شرط حتى break، و break n تخرج وتجعل n قيمة الحلقة كلها. n: 1 ثم 3 ثم 9 ثم 27. أول قيمة تحقق n >= 20 هي 27.",
      scene: check(
        `fn main() {
    let mut n = 1;
    let result = loop {
        if n >= 20 {
            break n;
        }
        n *= 3;
    };
    println!("{}", result);
}`,
        [
          { line: 2, say: "n = 1.", memory: [{ name: "n", value: "1", type: "number" }] },
          { line: 7, say: "1 < 20، فيُضرب: 3.", memory: [{ name: "n", value: "3", type: "number" }], changed: ["n"] },
          { line: 7, say: "3 < 20: يصير 9.", memory: [{ name: "n", value: "9", type: "number" }], changed: ["n"] },
          { line: 7, say: "9 < 20: يصير 27.", memory: [{ name: "n", value: "27", type: "number" }], changed: ["n"] },
          { line: 5, say: "27 >= 20: break n تخرج، وقيمة الحلقة 27.", memory: [{ name: "n", value: "27", type: "number" }, { name: "result", value: "27", type: "number", constant: true }], changed: ["result"] },
          { line: 9, say: "يطبع 27.", memory: [{ name: "n", value: "27", type: "number" }, { name: "result", value: "27", type: "number", constant: true }], read: ["result"], output: ["27"] },
        ],
      ),
    },
  ],
  code: {
    intro: "شغّل البرنامج: يطبع الأعداد الأولية حتى 20. غيّر 20 إلى 50، ثم أضف ; بعد true في آخر is_prime واقرأ رسالة المترجم.",
    runnerLang: "rust",
    runnerStarter: `fn is_prime(n: u32) -> bool {
    if n < 2 {
        return false; // early return: leave the function now
    }
    let mut d = 2;
    while d * d <= n {
        if n % d == 0 {
            return false;
        }
        d += 1;
    }
    true // the last expression is the return value
}

fn main() {
    let mut count = 0;
    for n in 1..=20 {
        if is_prime(n) {
            print!("{} ", n);
            count += 1;
        }
    }
    println!();
    println!("{} primes", count);
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "rust",
      title: "دالة مربّع",
      prompt: "رتّب الأسطر: دالة square ترجع مربّع العدد، و main تطبع square(7).",
      lines: ["fn square(x: i32) -> i32 {", "    x * x", "}", "fn main() {", '    println!("{}", square(7));', "}"],
      expected: "49",
    },
    {
      kind: "fill",
      lang: "rust",
      title: "المدى الصحيح",
      prompt: "نريد جمع الأعداد من 1 إلى 4 بما فيها 4 (المجموع 10). أي مدى نكتب؟",
      template: 'fn main() {\n    let mut total = 0;\n    for i in 1___4 {\n        total += i;\n    }\n    println!("{}", total);\n}',
      options: ["..=", "..", "..."],
      answer: "..=",
      expected: "10",
    },
    {
      kind: "fix",
      lang: "rust",
      title: "المساحة الضائعة",
      prompt: "المترجم يرفض area بـ E0308. أصلحها ليطبع البرنامج 12.",
      code: 'fn area(w: u32, h: u32) -> u32 {\n    w * h;\n}\n\nfn main() {\n    println!("{}", area(3, 4));\n}',
      expected: "12",
      hint: "الفاصلة المنقوطة تحوّل القيمة إلى (). احذفها ليصير w * h آخر تعبير.",
      solution: 'fn area(w: u32, h: u32) -> u32 {\n    w * h\n}\n\nfn main() {\n    println!("{}", area(3, 4));\n}',
    },
    {
      kind: "write",
      lang: "rust",
      title: "ضمن الحدود",
      prompt: "أكمل clamp: ترجع n، لكن لا أقل من low ولا أكثر من high. استعمل if تعبيراً. يجب أن يطبع البرنامج 10 0 5.",
      starter: 'fn clamp(n: i32, low: i32, high: i32) -> i32 {\n    // never below low, never above high\n    n\n}\n\nfn main() {\n    println!("{} {} {}", clamp(15, 0, 10), clamp(-3, 0, 10), clamp(5, 0, 10));\n}\n',
      expected: "10 0 5",
      hint: "if n < low { low } else if n > high { high } else { n }",
      solution: 'fn clamp(n: i32, low: i32, high: i32) -> i32 {\n    if n < low {\n        low\n    } else if n > high {\n        high\n    } else {\n        n\n    }\n}\n\nfn main() {\n    println!("{} {} {}", clamp(15, 0, 10), clamp(-3, 0, 10), clamp(5, 0, 10));\n}\n',
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let mut total = 0;\nfor i in 0..5 {\n    total += i;\n}\nprintln!("{}", total);',
      options: ["10", "15", "5"],
      answer: 0,
      why: "0..5 مدى نصف مفتوح: 0 و 1 و 2 و 3 و 4، بلا 5. مجموعها 10. لتضمين 5 اكتب 0..=5.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let x = {\n    let a = 3;\n    a * 2\n};\nprintln!("{}", x);',
      options: ["6", "3", "()"],
      answer: 0,
      why: "الكتلة { } تعبير: تحجز a داخلها، ثم قيمتها آخر تعبير فيها، a * 2 = 6، فيذهب إلى x. ودرج a يُزال عند }.",
    },
    {
      question: "ماذا يطبع println!(\"{}\", f(4))؟",
      code: "fn f(n: u32) -> u32 {\n    if n == 0 {\n        return 1;\n    }\n    n * f(n - 1)\n}",
      options: ["24", "10", "0"],
      answer: 0,
      why: "كل استدعاء إطار جديد على المكدّس: f(4) ينتظر f(3) ... حتى f(0) يرجع 1 مبكراً بـ return. ثم تعود القيم: 1، 1، 2، 6، 24.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let mut n = 3;\nwhile n > 0 {\n    print!("{} ", n);\n    n -= 1;\n}\nprintln!("go");',
      options: ["3 2 1 go", "3 2 1 0 go", "2 1 0 go"],
      answer: 0,
      why: "الشرط يُفحص قبل كل دورة. حين يصير n صفراً يفشل الشرط فلا يُطبع 0. و print! تطبع دون سطر جديد، فيبقى الكل على سطر واحد.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'fn add_one(mut n: i32) {\n    n += 1;\n}\nfn main() {\n    let x = 5;\n    add_one(x);\n    println!("{}", x);\n}',
      options: ["5", "6", "خطأ: x مقفل"],
      answer: 0,
      why: "عند الاستدعاء تُنسخ 5 إلى درج n في إطار add_one. mut تخصّ ذلك الدرج وحده. يتغيّر n ثم يُزال مع إطاره، و x في main لم يمسّه أحد.",
    },
  ],
  next: "stack-heap",
};
