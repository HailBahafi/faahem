import type { Cell, Lesson, Scene, Step } from "@/lib/types";

const str = (name: string, value: string): Cell => ({ name, value, type: "string", constant: true });
const arr = (name: string, value: string): Cell => ({ name, value, type: "number", constant: true });
const check = (rust: string, steps: Step[]): Scene => ({ code: { rust }, steps });

const text = str("text: String", 'ptr → heap "hello world", len 11');
const hello = str("hello: &str", 'ptr = text+0, len 5 → "hello"');
const world = str("world: &str", 'ptr = text+6, len 5 → "world"');
const nums = arr("nums: [i32; 4]", "[10, 20, 30, 40]");
const mid = arr("mid: &[i32]", "ptr = nums+1, len 2 → [20, 30]");

export const rsSlices: Lesson = {
  slug: "rs-slices",
  stage: 0,
  number: "1.8",
  title: "slices",
  subtitle: "نافذة مستعارة على جزء من بيانات غيرك: عنوان وطول، بلا نسخ",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "نافذة على الحروف",
    body: "حرّك طرفي النافذة لتختار جزءاً من النص، ثم حاول أن تغيّر النص الأصلي والنافذة ما زالت مفتوحة. لماذا يجب أن يمنعك أحد؟",
    demo: "rsSlices",
  },
  scene: {
    code: {
      rust: `fn main() {
    let text = String::from("hello world");
    let hello = &text[0..5];
    let world = &text[6..];
    let nums = [10, 20, 30, 40];
    let mid = &nums[1..3];
    println!("{} {} {:?} {}", hello, world, mid, mid.len());
}`,
    },
    steps: [
      {
        line: null,
        say: "slice نافذة على جزء متصل من بيانات يملكها غيرك. في الذاكرة هو رقمان فقط: عنوان أول عنصر في النافذة، وعدد العناصر. لا يملك شيئاً، ولا ينسخ شيئاً.",
        memory: [],
      },
      {
        line: 2,
        say: "text يملك 11 بايتاً متجاورة في الكومة. في درجه على المكدّس: عنوانها وطولها وسعتها (درس Stack و Heap).",
        memory: [text],
        changed: ["text: String"],
      },
      {
        line: 3,
        say: "&text[0..5] لا تنسخ حروفاً: تصنع درجاً فيه عنوان البايت 0 من text والطول 5. المدى يشمل 0 ولا يشمل 5. النوع &str: استعارة لنص.",
        memory: [text, hello],
        changed: ["hello: &str"],
        read: ["text: String"],
      },
      {
        line: 4,
        say: "[6..] بلا نهاية يعني حتى آخر النص. عنوان text + 6، وطول 11 - 6 = 5. نافذتان على الصندوق نفسه، ولا حرف منسوخ.",
        memory: [text, hello, world],
        changed: ["world: &str"],
        read: ["text: String"],
      },
      {
        line: 5,
        say: "مصفوفة من أربعة i32 متجاورة، هذه المرة على المكدّس مباشرة.",
        memory: [text, hello, world, nums],
        changed: ["nums: [i32; 4]"],
      },
      {
        line: 6,
        say: "الفكرة نفسها مع أي بيانات متجاورة: &nums[1..3] عنوان nums[1] وطول 2. نوعه &[i32]: slice من i32، طوله يُعرف عند التشغيل لا في النوع.",
        memory: [text, hello, world, nums, mid],
        changed: ["mid: &[i32]"],
        read: ["nums: [i32; 4]"],
      },
      {
        line: 7,
        say: "الطباعة تتبع كل عنوان وتقرأ عدد العناصر المكتوب بجانبه. {:?} تطبع slice الأرقام بين أقواس.",
        memory: [text, hello, world, nums, mid],
        read: ["hello: &str", "world: &str", "mid: &[i32]"],
        output: ["hello world [20, 30] 2"],
      },
      {
        line: 8,
        say: "النهاية: النوافذ لا تملك شيئاً فلا تحرّر شيئاً. text وحده المالك، فيُحرَّر صندوقه مرة واحدة. والمترجم ضمن أن لا نافذة تعيش بعد صاحبها.",
        memory: [],
        output: ["hello world [20, 30] 2"],
      },
    ],
    notes: {
      rust: "اكتب معاملات دوالك بـ &str بدل &String، وبـ &[T] بدل &Vec<T>: تقبل الدالة حينها النص كله أو جزءاً منه أو نصاً ثابتاً مثل \"hi\" (وهو &str أصلاً).",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة بـ JavaScript: slice كائن فيه start و len فقط، يقرأ من مصفوفة غيره. read يتبع النافذة إلى البيانات الأصلية. لاحظ ما يحدث إذا تغيّرت البيانات والنافذة مفتوحة.",
    starter: `const data = [10, 20, 30, 40, 50];
function slice(start, end) {
  if (end > data.length) {
    console.log("panicked: range end index " + end + " out of range for slice of length " + data.length);
    return null;
  }
  return { start: start, len: end - start };
}
function read(s) {
  const out = [];
  for (let i = 0; i < s.len; i++) {
    out.push(data[s.start + i]);
  }
  return out;
}
const mid = slice(1, 4);
console.log(read(mid));
data[2] = 99;
console.log(read(mid));`,
    challenges: [
      "قبل التشغيل: ماذا تطبع read(mid) في المرتين؟ لماذا تغيّرت النتيجة دون أن نلمس mid؟",
      "في Rust، data[2] = 99 والنافذة ما زالت مستعملة بعدها يرفضه المترجم (E0506). لماذا هذا أكثر أماناً؟",
      "جرّب slice(3, 7). ماذا يحدث؟ هذا ما تفعله Rust عند التشغيل بدل قراءة ذاكرة خارج المصفوفة.",
      "اكتب data.length = 2; قبل read الثانية. النافذة تشير الآن إلى عناصر لم تعد موجودة: هذا بالضبط ما تمنعه قواعد الاستعارة.",
    ],
  },
  predict: [
    {
      question: "هل يترجم هذا البرنامج؟",
      code: `fn main() {
    let mut s = String::from("hello world");
    let word = &s[0..5];
    s.clear();
    println!("{}", word);
}`,
      options: ["نعم، ويطبع hello", "نعم، ويطبع سطراً فارغاً", "لا: s مستعار بنافذة word ثم نحاول تغييره"],
      answer: 2,
      why: "word نافذة على بايتات s. clear تحتاج استعارة قابلة للتغيير، والسطر 5 ما زال يستعمل word. قاعدة الاستعارة: إمّا قرّاء كثيرون وإمّا كاتب واحد. لو سُمح بها لقرأت word بايتات ممسوحة.",
      scene: check(
        `fn main() {
    let mut s = String::from("hello world");
    let word = &s[0..5];
    s.clear();
    println!("{}", word);
}`,
        [
          { line: 2, say: "s يملك النص.", memory: [str("s: String", '"hello world"')], changed: ["s: String"] },
          { line: 3, say: "word نافذة على أول 5 بايتات من s: استعارة للقراءة.", memory: [str("s: String", '"hello world"'), str("word: &str", "ptr = s+0, len 5")], changed: ["word: &str"] },
          {
            line: 4,
            say: "clear يريد أن يكتب في s والنافذة ما زالت ستُقرأ في السطر 5. المترجم يرفض.",
            memory: [str("s: String", '"hello world"'), str("word: &str", "ptr = s+0, len 5")],
            read: ["s: String"],
            error: "error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable",
          },
        ],
      ),
    },
    {
      question: "ماذا يحدث عند تشغيل هذا البرنامج؟",
      code: `fn main() {
    let v = [1, 2, 3, 4];
    let end = 5;
    let s = &v[2..end];
    println!("{:?}", s);
}`,
      options: ["يطبع [3, 4]", "يتوقف البرنامج: range end index 5 out of range", "يطبع [3, 4, 0]"],
      answer: 1,
      why: "عند صنع النافذة تفحص Rust أن نهايتها داخل البيانات. 5 أكبر من الطول 4، فيتوقف البرنامج (panic) بدل أن يقرأ ما بعد المصفوفة. القراءة خارج الحدود في C ثغرة أمنية مشهورة.",
      scene: check(
        `fn main() {
    let v = [1, 2, 3, 4];
    let end = 5;
    let s = &v[2..end];
    println!("{:?}", s);
}`,
        [
          { line: 2, say: "أربعة عناصر.", memory: [arr("v: [i32; 4]", "[1, 2, 3, 4]")] },
          { line: 3, say: "end = 5.", memory: [arr("v: [i32; 4]", "[1, 2, 3, 4]"), arr("end", "5")] },
          {
            line: 4,
            say: "فحص الحدود: 5 > 4. البرنامج يتوقف ولا يصل إلى الطباعة.",
            memory: [arr("v: [i32; 4]", "[1, 2, 3, 4]"), arr("end", "5")],
            read: ["v: [i32; 4]", "end"],
            error: "thread 'main' panicked: range end index 5 out of range for slice of length 4",
          },
        ],
      ),
    },
    {
      question: "sum تأخذ &[i32]. ماذا يطبع البرنامج؟",
      code: `fn sum(xs: &[i32]) -> i32 {
    let mut total = 0;
    for x in xs {
        total += x;
    }
    total
}
fn main() {
    let v = vec![1, 2, 3, 4];
    println!("{} {}", sum(&v), sum(&v[2..]));
}`,
      options: ["10 7", "10 10", "خطأ: &v ليس slice"],
      answer: 0,
      why: "&v تعطي نافذة على الـ Vec كله، و &v[2..] نافذة على آخر عنصرين. الدالة نفسها تقبل الاثنين لأنها لا تهتم بمن يملك البيانات، فقط بعنوان وطول. 1+2+3+4 = 10، و 3+4 = 7.",
      scene: check(
        `fn sum(xs: &[i32]) -> i32 {
    let mut total = 0;
    for x in xs {
        total += x;
    }
    total
}
fn main() {
    let v = vec![1, 2, 3, 4];
    println!("{} {}", sum(&v), sum(&v[2..]));
}`,
        [
          { line: 9, say: "v يملك أربعة أعداد في الكومة.", memory: [arr("v: Vec<i32>", "[1, 2, 3, 4]")] },
          { line: 10, say: "sum(&v): نافذة على الكل، len 4. المجموع 10.", memory: [arr("v: Vec<i32>", "[1, 2, 3, 4]"), arr("xs: &[i32]", "ptr = v+0, len 4")], read: ["v: Vec<i32>"] },
          { line: 10, say: "sum(&v[2..]): نافذة تبدأ من v[2]، len 2. المجموع 7.", memory: [arr("v: Vec<i32>", "[1, 2, 3, 4]"), arr("xs: &[i32]", "ptr = v+2, len 2")], read: ["v: Vec<i32>"], output: ["10 7"] },
        ],
      ),
    },
  ],
  code: {
    intro: "شغّل البرنامج، ثم احذف // من سطر sentence.clear() واقرأ رسالة E0502: يشير المترجم إلى مكان الاستعارة ومكان التغيير ومكان الاستعمال.",
    runnerLang: "rust",
    runnerStarter: `fn first_word(s: &str) -> &str {
    for (i, b) in s.bytes().enumerate() {
        if b == b' ' {
            return &s[..i];
        }
    }
    s
}

fn main() {
    let sentence = String::from("borrow checker rocks");
    let word = first_word(&sentence);
    let literal = first_word("slices everywhere"); // a literal is already a &str

    let scores = [90, 75, 60, 88];
    let top_two = &scores[..2];

    println!("{} | {} | {:?}", word, literal, top_two);
    // sentence.clear(); // remove the // to see E0502
    println!("{} has {} letters", word, word.len());
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "rust",
      title: "أول أربعة",
      prompt: "رتّب الأسطر حتى يطبع البرنامج rust: نافذة على أول أربعة بايتات.",
      lines: ["fn main() {", '    let s = String::from("rustacean");', "    let part = &s[0..4];", '    println!("{}", part);', "}"],
      expected: "rust",
    },
    {
      kind: "fill",
      lang: "rust",
      title: "آخر عنصرين",
      prompt: "أي مدى يعطي نافذة على آخر عنصرين، فيطبع البرنامج [4, 5]؟",
      template: 'fn main() {\n    let nums = [1, 2, 3, 4, 5];\n    let last_two = &nums[___];\n    println!("{:?}", last_two);\n}',
      options: ["3..", "2..", "..3"],
      answer: "3..",
      expected: "[4, 5]",
    },
    {
      kind: "fix",
      lang: "rust",
      title: "معامل أوسع",
      prompt: "shout تأخذ &String، فلا تقبل النص الثابت \"hi\" (نوعه &str). أصلح توقيعها ليطبع البرنامج HI!",
      code: 'fn shout(s: &String) {\n    println!("{}!", s.to_uppercase());\n}\n\nfn main() {\n    shout("hi");\n}',
      expected: "HI!",
      hint: "غيّر نوع المعامل إلى &str: يقبل النصوص الثابتة، ويقبل &String أيضاً.",
      solution: 'fn shout(s: &str) {\n    println!("{}!", s.to_uppercase());\n}\n\nfn main() {\n    shout("hi");\n}',
    },
    {
      kind: "write",
      lang: "rust",
      title: "الوسط",
      prompt: "أكمل middle: ترجع نافذة على كل العناصر ما عدا الأول والأخير. يجب أن يطبع البرنامج [2, 3, 4].",
      starter: 'fn middle(xs: &[i32]) -> &[i32] {\n    // skip the first and the last element\n    xs\n}\n\nfn main() {\n    let v = [1, 2, 3, 4, 5];\n    println!("{:?}", middle(&v));\n}\n',
      expected: "[2, 3, 4]",
      hint: "النافذة تبدأ من 1 وتنتهي قبل xs.len() - 1.",
      solution: 'fn middle(xs: &[i32]) -> &[i32] {\n    &xs[1..xs.len() - 1]\n}\n\nfn main() {\n    let v = [1, 2, 3, 4, 5];\n    println!("{:?}", middle(&v));\n}\n',
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let s = String::from("hello");\nlet t = &s[1..3];\nprintln!("{}", t);',
      options: ["el", "ell", "he"],
      answer: 0,
      why: "المدى يبدأ من البايت 1 ويتوقف قبل 3: البايتان 1 و 2، أي e و l.",
    },
    {
      question: "على جهاز 64 بت، ماذا يطبع البرنامج؟",
      code: 'println!("{} {}", size_of::<&i32>(), size_of::<&str>());',
      options: ["8 16", "8 8", "4 11"],
      answer: 0,
      why: "مرجع عادي عنوان واحد: 8 بايتات. أما &str فمرجع «سمين»: عنوان + طول، رقمان من 8 بايتات. طول النص نفسه لا يدخل في الحجم، فالحروف عند مالكها.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: 'let a = [1, 2, 3, 4, 5];\nlet s = &a[1..4];\nprintln!("{} {}", s.len(), s[0]);',
      options: ["3 2", "4 1", "3 1"],
      answer: 0,
      why: "النافذة تبدأ عند a[1] وطولها 4 - 1 = 3. الفهرسة داخل النافذة تبدأ من بدايتها هي: s[0] هو a[1]، أي 2.",
    },
    {
      question: "ماذا يحدث عند تشغيل هذا البرنامج؟",
      code: 'let t = String::from("été");\nprintln!("{}", &t[0..1]);',
      options: [
        "يتوقف البرنامج: byte index 1 is not a char boundary",
        "يطبع é",
        "يطبع e",
      ],
      answer: 0,
      why: "الفهارس في &str بايتات لا حروف، والنص مخزّن بـ UTF-8: é تأخذ بايتين (0..2). نافذة تقطع حرفاً من نصفه ليست نصاً صالحاً، فتتوقف Rust بدل أن تعطيك نصفه. لهذا تمرّ على الحروف بـ chars().",
    },
    {
      question: "هل يترجم هذا البرنامج؟",
      code: 'let mut v = vec![1, 2, 3];\nlet first = &v[0..1];\nv.push(4);\nprintln!("{:?}", first);',
      options: [
        "لا: push قد ينقل عناصر v إلى مكان جديد والنافذة ما زالت تشير إلى القديم",
        "نعم، ويطبع [1]",
        "نعم، ويطبع [1, 4]",
      ],
      answer: 0,
      why: "push قد لا يجد سعة فيحجز صندوقاً أكبر وينقل العناصر ويحرّر القديم. عندها تشير first إلى ذاكرة محرّرة. المترجم يمنع ذلك بقاعدة الاستعارة نفسها: E0502.",
    },
  ],
  next: "rs-structs",
};
