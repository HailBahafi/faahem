import type { Cell, Lesson, Scene, Step } from "@/lib/types";

const box = (name: string, value: string): Cell => ({ name, value, type: "string", constant: true });
const none = (name: string): Cell => ({ name, value: "None", type: "none", constant: true });
const check = (rust: string, steps: Step[]): Scene => ({ code: { rust }, steps });

const scores = box("scores: Vec<i32>", "[90, 75]");
const first = box("first: Option<&i32>", "Some(→ scores[0])");
const third = none("third: Option<&i32>");
const age = box("age: Result<u32, _>", "Ok(30)");
const bad = box("bad: Result<u32, _>", "Err(InvalidDigit)");
const line1 = "Some(90) None Ok(30)";

export const rsOptionResult: Lesson = {
  slug: "rs-option-result",
  stage: 0,
  number: "1.11",
  title: "Option و Result",
  subtitle: "لا null في Rust: الغياب والفشل قيمتان في صندوق يجب أن تفتحه",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "مستخدم غير موجود",
    body: "ابحث عن مستخدم برقمه في النسختين. جرّب رقماً موجوداً، ثم رقماً غير موجود. أي نسخة تنهار عند التشغيل، وأي نسخة لا تسمح لك أصلاً أن تنسى هذه الحالة؟",
    demo: "rsOptionResult",
  },
  scene: {
    code: {
      rust: `fn main() {
    let scores = vec![90, 75];
    let first = scores.get(0);
    let third = scores.get(2);
    let age = "30".parse::<u32>();
    let bad = "3o".parse::<u32>();
    println!("{:?} {:?} {:?}", first, third, age);
    match bad { Ok(n) => println!("{}", n), Err(e) => println!("error: {}", e) }
}`,
    },
    steps: [
      {
        line: null,
        say: "لغات كثيرة تعطيك null حين لا توجد قيمة، فينهار البرنامج حين تنسى الفحص. Rust بلا null. بدلها enum عادي من الدرس السابق: Option فيه Some(قيمة) أو None، و Result فيه Ok(قيمة) أو Err(سبب).",
        memory: [],
      },
      { line: 2, say: "Vec فيه عددان.", memory: [scores], changed: ["scores: Vec<i32>"] },
      {
        line: 3,
        say: "get(0) لا ترجع رقماً، بل صندوقاً: الوسم Some ومعه مرجع إلى scores[0]. نوعه Option<&i32>، لا i32، فلن تستطيع أن تجمعه مع رقم قبل أن تفتحه.",
        memory: [scores, first],
        changed: ["first: Option<&i32>"],
        read: ["scores: Vec<i32>"],
      },
      {
        line: 4,
        say: "الفهرس 2 غير موجود. scores[2] كانت ستوقف البرنامج، أما get فترجع None بهدوء: «لا يوجد»، كقيمة عادية تتعامل معها.",
        memory: [scores, first, third],
        changed: ["third: Option<&i32>"],
        read: ["scores: Vec<i32>"],
      },
      {
        line: 5,
        say: "parse قد تفشل، فترجع Result. هنا نجحت: Ok(30).",
        memory: [scores, first, third, age],
        changed: ["age: Result<u32, _>"],
      },
      {
        line: 6,
        say: "\"3o\" فيها حرف o. لا انهيار ولا استثناء يطير: Err ومعه سبب الفشل، قيمة يمكن أن تمرّرها وتفحصها.",
        memory: [scores, first, third, age, bad],
        changed: ["bad: Result<u32, _>"],
      },
      {
        line: 7,
        say: "{:?} تطبع الصناديق كما هي، بوسومها.",
        memory: [scores, first, third, age, bad],
        read: ["first: Option<&i32>", "third: Option<&i32>", "age: Result<u32, _>"],
        output: [line1],
      },
      {
        line: 8,
        say: "لنستعمل ما في الصندوق نفتحه بـ match. الوسم Err، فيُربط e بالسبب ويُطبع. والمترجم يجبرك أن تكتب فرع Err: لا طريق لتنسى الفشل.",
        memory: [scores, first, third, age, bad, box("e: ParseIntError", "InvalidDigit")],
        read: ["bad: Result<u32, _>"],
        changed: ["e: ParseIntError"],
        output: [line1, "error: invalid digit found in string"],
      },
      {
        line: 9,
        say: "النهاية. لا فحص null نسيته، لأن النوع نفسه كان يذكّرك في كل سطر.",
        memory: [],
        output: [line1, "error: invalid digit found in string"],
      },
    ],
    notes: {
      rust: "طرق فتح الصندوق: match و if let (تتعامل مع الحالتين)، و unwrap_or(بديل)، و ? (أرجع الفشل لمن استدعاني)، و unwrap()/expect(\"...\") (أوقف البرنامج إن فشل، للنماذج والاختبارات أو حين يكون الفشل مستحيلاً فعلاً).",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة بـ JavaScript: some و none و ok و err كائنات بوسم، و parseAge ترجع Result. total تحاكي ?: أول Err يُرجَع فوراً، ولا يُكمل الباقي.",
    starter: `function ok(v) { return { tag: "Ok", value: v }; }
function err(e) { return { tag: "Err", error: e }; }
function parseAge(text) {
  if (text.length === 0) return err("not a number: " + text);
  let n = 0;
  for (const ch of text) {
    const digit = "0123456789".indexOf(ch);
    if (digit === -1) return err("not a number: " + text);
    n = n * 10 + digit;
  }
  if (n > 150) return err("too old: " + n);
  return ok(n);
}
function total(a, b) {
  const x = parseAge(a);
  if (x.tag === "Err") return x;
  const y = parseAge(b);
  if (y.tag === "Err") return y;
  return ok(x.value + y.value);
}
console.log(total("30", "12"));
console.log(total("abc", "12"));
console.log(total("30", "200"));`,
    challenges: [
      "قبل التشغيل: ماذا يطبع كل سطر؟ في السطر الثاني، هل تُستدعى parseAge(\"12\") أصلاً؟",
      "هذان السطران if (x.tag === \"Err\") return x; هما بالضبط ما يكتبه ? في Rust: let x = parse_age(a)?;",
      "أضف دالة unwrapOr(r, fallback) ترجع r.value إن كان Ok وإلا fallback، وجرّبها على total(\"abc\", \"1\").",
      "اجعل parseAge ترجع err(\"age must be positive\") إن كان العمر 0، وجرّب total(\"0\", \"10\").",
    ],
  },
  predict: [
    {
      question: "هل يترجم هذا البرنامج؟",
      code: `fn main() {
    let age: Option<u32> = Some(20);
    println!("{}", age + 1);
}`,
      options: ["نعم، ويطبع 21", "لا: age صندوق Option وليس رقماً", "نعم، ويطبع Some(21)"],
      answer: 1,
      why: "Option<u32> نوع مختلف عن u32: قد يكون فيه رقم وقد يكون None، فلا معنى لـ None + 1. المترجم يجبرك أن تفتحه أولاً، مثلاً age.unwrap_or(0) + 1، أو match.",
      scene: check(
        `fn main() {
    let age: Option<u32> = Some(20);
    println!("{}", age + 1);
}`,
        [
          { line: 2, say: "صندوق وسمه Some وفيه 20.", memory: [box("age: Option<u32>", "Some(20)")], changed: ["age: Option<u32>"] },
          {
            line: 3,
            say: "جمع صندوق مع رقم: لا تعريف لهذه العملية.",
            memory: [box("age: Option<u32>", "Some(20)")],
            read: ["age: Option<u32>"],
            error: "error[E0369]: cannot add `{integer}` to `Option<u32>`",
          },
        ],
      ),
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: `use std::num::ParseIntError;
fn total(a: &str, b: &str) -> Result<i32, ParseIntError> {
    let x = a.parse::<i32>()?;
    let y = b.parse::<i32>()?;
    Ok(x + y)
}
fn main() {
    println!("{:?}", total("4", "5"));
    println!("{:?}", total("x", "5"));
}`,
      options: [
        "Ok(9) ثم Err(ParseIntError { kind: InvalidDigit })",
        "Ok(9) ثم ينهار البرنامج",
        "9 ثم 5",
      ],
      answer: 0,
      why: "? تفتح الصندوق: إن كان Ok أخذت القيمة وأكملت، وإن كان Err خرجت من الدالة فوراً وأرجعت الخطأ نفسه لمن استدعاها. في الاستدعاء الثاني لم يصل التنفيذ إلى y أصلاً.",
      scene: check(
        `use std::num::ParseIntError;
fn total(a: &str, b: &str) -> Result<i32, ParseIntError> {
    let x = a.parse::<i32>()?;
    let y = b.parse::<i32>()?;
    Ok(x + y)
}
fn main() {
    println!("{:?}", total("4", "5"));
    println!("{:?}", total("x", "5"));
}`,
        [
          { line: 3, say: "\"4\": Ok(4)، و ? تعطي x = 4.", memory: [box("x", "4")] },
          { line: 4, say: "\"5\": y = 5.", memory: [box("x", "4"), box("y", "5")] },
          { line: 8, say: "Ok(9).", memory: [], output: ["Ok(9)"] },
          { line: 3, say: "\"x\": Err. ? تخرج فوراً بهذا الخطأ، و y لا تُحسب.", memory: [box("result", "Err(InvalidDigit)")] },
          { line: 9, say: "يُطبع الخطأ بـ {:?}.", memory: [], output: ["Ok(9)", "Err(ParseIntError { kind: InvalidDigit })"] },
        ],
      ),
    },
    {
      question: "ماذا يحدث عند تشغيل هذا البرنامج؟",
      code: `fn main() {
    let v: Vec<i32> = Vec::new();
    let x = v.first().unwrap();
    println!("{}", x);
}`,
      options: ["يطبع 0", "يتوقف البرنامج: called `Option::unwrap()` on a `None` value", "المترجم يرفضه"],
      answer: 1,
      why: "first() على Vec فارغ يرجع None بأمان. لكن unwrap() تعني «أنا متأكد أن فيه قيمة، وإلا أوقف البرنامج». المترجم يقبلها لأنك طلبتها صراحة. لهذا تبحث عن unwrap عند مراجعة الكود: كل واحدة وعد يجب أن يكون صحيحاً.",
      scene: check(
        `fn main() {
    let v: Vec<i32> = Vec::new();
    let x = v.first().unwrap();
    println!("{}", x);
}`,
        [
          { line: 2, say: "Vec فارغ.", memory: [box("v: Vec<i32>", "[]")] },
          {
            line: 3,
            say: "first() ترجع None، و unwrap على None توقف البرنامج.",
            memory: [box("v: Vec<i32>", "[]")],
            read: ["v: Vec<i32>"],
            error: "thread 'main' panicked: called `Option::unwrap()` on a `None` value",
          },
        ],
      ),
    },
  ],
  code: {
    intro: "شغّل البرنامج، ثم أضف مدخلاً جديداً إلى المصفوفة مثل \"-4\" وتوقّع النتيجة. جرّب أيضاً أن تحذف فرع Err من match في main.",
    runnerLang: "rust",
    runnerStarter: `fn parse_age(text: &str) -> Result<u32, String> {
    let n: u32 = match text.trim().parse() {
        Ok(n) => n,
        Err(_) => return Err(format!("not a number: {:?}", text)),
    };
    if n > 150 {
        return Err(format!("too old: {}", n));
    }
    Ok(n)
}

fn find_user(id: u32) -> Option<&'static str> {
    match id {
        1 => Some("Sara"),
        2 => Some("Omar"),
        _ => None,
    }
}

fn main() {
    for input in ["30", " 42 ", "abc", "200"] {
        match parse_age(input) {
            Ok(age) => println!("age {}", age),
            Err(e) => println!("error: {}", e),
        }
    }
    let name = find_user(3).unwrap_or("guest");
    println!("hello {}", name);
    if let Some(user) = find_user(1) {
        println!("found {}", user);
    }
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "rust",
      title: "عنصر غير موجود",
      prompt: "رتّب الأسطر: نطلب العنصر 5 من Vec فيه عنصران، ونطبع no item إن لم يوجد.",
      lines: [
        "fn main() {",
        "    let nums = vec![4, 8];",
        "    if let Some(n) = nums.get(5) {",
        '        println!("{}", n);',
        "    } else {",
        '        println!("no item");',
        "    }",
        "}",
      ],
      expected: "no item",
    },
    {
      kind: "fill",
      lang: "rust",
      title: "قيمة بديلة",
      prompt: "\"x12\" ليس رقماً. أي دالة تفتح الـ Result وتعطي 0 بدل الفشل، فيطبع البرنامج 0؟",
      template: 'fn main() {\n    let n: i32 = "x12".parse().___(0);\n    println!("{}", n);\n}',
      options: ["unwrap_or", "unwrap", "expect"],
      answer: "unwrap_or",
      expected: "0",
    },
    {
      kind: "fix",
      lang: "rust",
      title: "? تحتاج Result",
      prompt: "المترجم يرفض ? هنا: الدالة ترجع i32، فلا مكان تُرجَع إليه الأخطاء. غيّر نوع ما ترجعه إلى Result<i32, ParseIntError> وأرجع Ok(...)، ليطبع البرنامج Ok(10).",
      code: 'use std::num::ParseIntError;\n\nfn double(text: &str) -> i32 {\n    let n: i32 = text.parse()?;\n    n * 2\n}\n\nfn main() {\n    println!("{:?}", double("5"));\n}',
      expected: "Ok(10)",
      hint: "fn double(text: &str) -> Result<i32, ParseIntError> { ... Ok(n * 2) }",
      solution: 'use std::num::ParseIntError;\n\nfn double(text: &str) -> Result<i32, ParseIntError> {\n    let n: i32 = text.parse()?;\n    Ok(n * 2)\n}\n\nfn main() {\n    println!("{:?}", double("5"));\n}',
    },
    {
      kind: "write",
      lang: "rust",
      title: "قسمة آمنة",
      prompt: "أكمل divide: ترجع None إذا كان b صفراً، وإلا Some(a / b). يجب أن يطبع البرنامج Some(5) None.",
      starter: 'fn divide(a: i32, b: i32) -> Option<i32> {\n    todo!()\n}\n\nfn main() {\n    println!("{:?} {:?}", divide(10, 2), divide(1, 0));\n}\n',
      expected: "Some(5) None",
      hint: "if b == 0 { None } else { Some(a / b) }",
      solution: 'fn divide(a: i32, b: i32) -> Option<i32> {\n    if b == 0 {\n        None\n    } else {\n        Some(a / b)\n    }\n}\n\nfn main() {\n    println!("{:?} {:?}", divide(10, 2), divide(1, 0));\n}\n',
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let v = vec![1, 2, 3];\nprintln!("{:?} {:?}", v.get(1), v.get(9));',
      options: ["Some(2) None", "2 0", "Some(2) ثم ينهار"],
      answer: 0,
      why: "get لا توقف البرنامج أبداً: ترجع Some بمرجع إلى العنصر إن وُجد، و None إن لم يوجد. أما v[9] فكانت ستوقفه.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let x: Option<i32> = None;\nprintln!("{}", x.unwrap_or(7) + 1);',
      options: ["8", "1", "خطأ: x فارغ"],
      answer: 0,
      why: "unwrap_or تفتح الصندوق: القيمة إن كانت Some، والبديل إن كانت None. هنا None فالقيمة 7، ثم + 1 على رقم عادي.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'println!("{} {}", "42".parse::<i32>().is_ok(), "4 2".parse::<i32>().is_ok());',
      options: ["true false", "true true", "false false"],
      answer: 0,
      why: "is_ok() تسأل عن الوسم فقط دون أن تفتح الصندوق. \"4 2\" فيها مسافة، فهي ليست عدداً: Err.",
    },
    {
      question: "على جهاز 64 بت، ماذا يطبع البرنامج؟",
      code: 'println!("{} {}", size_of::<&i32>(), size_of::<Option<&i32>>());',
      options: ["8 8", "8 16", "8 9"],
      answer: 0,
      why: "المرجع في Rust لا يكون صفراً أبداً، فيستعمل المترجم العنوان 0 ليعني None، دون وسم إضافي. Option<&T> بحجم مرجع عادي: أمان null بلا أي تكلفة.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'fn first_upper(s: &str) -> Option<char> {\n    let c = s.chars().next()?;\n    Some(c.to_ascii_uppercase())\n}\nfn main() {\n    println!("{:?} {:?}", first_upper("rust"), first_upper(""));\n}',
      options: ["Some('R') None", "Some('R') Some(' ')", "'R' ثم ينهار"],
      answer: 0,
      why: "? تعمل مع Option أيضاً: next() على نص فارغ ترجع None، فتخرج الدالة فوراً بـ None. ومع \"rust\" تأخذ 'r' وتكمل.",
    },
  ],
  next: "rs-collections",
};
