import type { Frame, HeapObj, Lesson, Slot, Step } from "@/lib/types";

const num = (name: string, value: number): Slot => ({ name, value: String(value), type: "number" });
const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
const main = (vars: Slot[]): Frame => ({ id: 1, name: "main", vars });
const make = (vars: Slot[]): Frame => ({ id: 2, name: "make", vars });
const vec = (id: number, items: number[]): HeapObj => ({ id, kind: "array", items: items.map((x, i) => num(`[${i}]`, x)) });

const steps: Step[] = [
  {
    line: null,
    say: "برنامج Rust صغير. Rust لا تعمل داخل الدرس، فهذه الخطوات مكتوبة باليد، لكنها ما يحدث في الذاكرة فعلاً. راقب العمودين: المكدّس على اليمين والكومة على اليسار.",
    memory: [],
    frames: [],
    heap: [],
  },
  {
    line: 4,
    say: "البرنامج يبدأ من main، فيُدفع إطارها على المكدّس. الدفع سريع جداً: المعالج يحرّك مؤشر قمة المكدّس فقط.",
    memory: [],
    frames: [main([])],
    heap: [],
  },
  {
    line: 5,
    say: "x رقم من نوع i32: أربعة بايتات بالضبط، والمترجم يعرف ذلك قبل التشغيل. فمكانه محجوز في إطار main نفسه، على المكدّس.",
    memory: [],
    frames: [main([num("x", 3)])],
    heap: [],
    changed: ["x"],
  },
  {
    line: 6,
    say: "استدعاء make(x): إطار جديد فوق main. المعامل n يأخذ نسخة من قيمة x، كما في درس الدوال.",
    memory: [],
    frames: [main([num("x", 3)]), make([num("n", 3)])],
    heap: [],
    changed: ["n"],
  },
  {
    line: 2,
    say: "vec! يصنع قائمة قد تكبر لاحقاً، فحجمها غير معروف قبل التشغيل. لذلك تُحجز عناصرها في الكومة، وفي المكدّس يبقى مقبض ثابت الحجم: مؤشر إلى الكومة مع الطول والسعة.",
    memory: [],
    frames: [main([num("x", 3)]), make([num("n", 3), ref("result", 1)])],
    heap: [vec(1, [1, 2, 3])],
    changed: ["result"],
    read: ["n"],
    changedHeap: [1],
  },
  {
    line: 3,
    say: "make تنتهي: إطارها يُزال دفعة واحدة، فيختفي n بلا أي عمل. أما القائمة في الكومة فتبقى، لأن المؤشر إليها نُسخ إلى v في main. الكومة للبيانات التي يجب أن تعيش بعد الاستدعاء.",
    memory: [],
    frames: [main([num("x", 3), ref("v", 1)])],
    heap: [vec(1, [1, 2, 3])],
    changed: ["v"],
  },
  {
    line: 7,
    say: "push يضيف 4. القائمة كبرت في الكومة، ومقبض v في المكدّس بقي بالحجم نفسه. لو امتلأت السعة لحجزت Rust صندوقاً أكبر ونقلت العناصر إليه، وحدّثت المؤشر.",
    memory: [],
    frames: [main([num("x", 3), ref("v", 1)])],
    heap: [vec(1, [1, 2, 3, 4])],
    read: ["v"],
    changedHeap: [1],
  },
  {
    line: 8,
    say: "الطباعة تقرأ x من المكدّس مباشرة، وتتبع سهم v إلى الكومة لتقرأ العناصر. القفز عبر المؤشر أبطأ قليلاً من القراءة من الإطار.",
    memory: [],
    frames: [main([num("x", 3), ref("v", 1)])],
    heap: [vec(1, [1, 2, 3, 4])],
    read: ["x", "v"],
    output: ["3 [1, 2, 3, 4]"],
  },
  {
    line: 9,
    say: "main تنتهي فيُزال إطارها. لكن من يحرّر القائمة في الكومة؟ المكدّس ينظّف نفسه، والكومة لا. Rust حرّرتها هنا عند القوس } بلا جامع قمامة وبلا free يدوي. كيف عرفت؟ هذا هو الدرس القادم.",
    memory: [],
    frames: [],
    heap: [],
    output: ["3 [1, 2, 3, 4]"],
  },
];

export const stackHeap: Lesson = {
  slug: "stack-heap",
  stage: 10,
  number: "10.1",
  title: "Stack و Heap",
  subtitle: "لماذا ذاكرتان؟ ومن ينظّف الكومة بعدك؟",
  minutes: 20,
  singleLanguage: true,
  problem: {
    title: "من ينظّف الكومة؟",
    body: "هذا مكدّس وكومة حقيقيان مصغّران. استدعِ دالة، احجز صناديق في الكومة، ثم ارجع من الدالة وانظر ماذا يبقى بلا سهم. جرّب جامع القمامة، ثم بدّل إلى الوضع اليدوي وحرّر صندوقاً واستعمله بعد التحرير.",
    demo: "stackHeap",
  },
  scene: {
    code: {
      rust: `fn make(n: i32) -> Vec<i32> {
    vec![1, 2, n]
}
fn main() {
    let x = 3;
    let mut v = make(x);
    v.push(4);
    println!("{} {:?}", x, v);
}`,
    },
    steps,
    notes: {
      rust: "الأرقام والقيم ثابتة الحجم تعيش في الإطار على المكدّس. Vec و String تضع محتواها في الكومة، وتحفظ في المكدّس مقبضاً صغيراً: مؤشر وطول وسعة. vec! تصنع Vec، و {:?} تطبعها كاملة.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة بـ JavaScript لكومة تُدار باليد، كما في لغة C: heap مصفوفة صناديق، و alloc تحجز صندوقاً وترجع رقمه (المؤشر)، و free تحرّره. راقب ما يحدث حين نقرأ صندوقاً محرّراً.",
    starter: `const heap = [];
function alloc(value) {
  heap.push({ value: value, freed: false });
  return heap.length - 1;
}
function free(p) {
  if (heap[p].freed) {
    console.log("crash: double free #" + p);
  }
  heap[p].freed = true;
}
function read(p) {
  if (heap[p].freed) {
    return "crash: use after free #" + p;
  }
  return heap[p].value;
}
let p = alloc("Sara");
console.log(read(p));
free(p);
console.log(read(p));
let q = alloc("Omar");
q = alloc("Lina");
let live = 0;
for (const box of heap) {
  if (!box.freed) {
    live = live + 1;
  }
}
console.log("still allocated:", live);`,
    challenges: [
      "قبل التشغيل: كم صندوقاً سيبقى محجوزاً في النهاية؟ ومن منها لم يعد أي متغير يشير إليه؟",
      "الصندوق \"Omar\" تسرّب: لا سهم إليه ولم يُحرَّر. أضف free(q); قبل q = alloc(\"Lina\"); وشغّل من جديد.",
      "استدعِ free(p); مرة ثانية بعد الأولى. ماذا يقول البرنامج؟ في C الحقيقية قد لا تُطبع رسالة أصلاً، بل يفسد البرنامج بصمت.",
      "احذف السطر free(p); الأول. ماذا تغيّر في الطباعة الثانية وفي العدد الأخير؟",
    ],
  },
  predict: [
    {
      question: "أين يعيش كل شيء بعد السطر الثاني؟",
      code: `fn main() {
    let a = 5;
    let b = vec![5];
}`,
      options: [
        "a في المكدّس، و b مقبض في المكدّس يشير إلى [5] في الكومة",
        "الاثنان في الكومة",
        "الاثنان في المكدّس، لأن فيهما الرقم 5 نفسه",
      ],
      answer: 0,
      why: "السؤال ليس عن القيمة بل عن الحجم: a رقم حجمه معروف قبل التشغيل، فيُحفظ في الإطار. b قائمة قد تكبر، فعناصرها في الكومة، وفي الإطار مقبض فيه المؤشر.",
      scene: {
        code: {
          rust: `fn main() {
    let a = 5;
    let b = vec![5];
}`,
        },
        steps: [
          { line: 1, say: "إطار main على المكدّس.", memory: [], frames: [main([])], heap: [] },
          { line: 2, say: "a رقم i32: أربعة بايتات في الإطار نفسه.", memory: [], frames: [main([num("a", 5)])], heap: [], changed: ["a"] },
          {
            line: 3,
            say: "vec![5] قائمة قد تكبر: العنصر في الكومة، و b في الإطار يحمل المؤشر إليه.",
            memory: [],
            frames: [main([num("a", 5), ref("b", 1)])],
            heap: [vec(1, [5])],
            changed: ["b"],
            changedHeap: [1],
          },
        ],
      },
    },
    {
      question: "list صُنعت داخل الدالة، وإطار الدالة يختفي عند return. ماذا يطبع البرنامج؟",
      code: `function makeList() {
  let count = 2;
  let list = [1, 2];
  return list;
}
let saved = makeList();
console.log(saved.length);`,
      options: ["2", "خطأ: list ماتت مع إطار الدالة", "undefined"],
      answer: 0,
      why: "الإطار اختفى ومعه count والدرج list. لكن المصفوفة نفسها في الكومة، والدالة أرجعت السهم إليها فصار في saved. هذا سبب وجود الكومة: بيانات تعيش بعد انتهاء الاستدعاء.",
    },
    {
      question: "بعد السطر 3، كم سهماً يشير إلى المصفوفة [1, 2, 3]؟",
      code: `let a = [1, 2, 3];
let b = a;
a = null;
b = [9];
console.log(b[0]);`,
      options: ["سهم واحد: b", "صفر", "سهمان"],
      answer: 0,
      why: "a = null حرّك سهم a وحده، فبقي b. وبعد السطر 4 لم يبقَ أي سهم: صارت المصفوفة قمامة لا يصل إليها أحد. JavaScript لا تحذفها فوراً، بل يمرّ جامع القمامة لاحقاً ويجدها.",
    },
  ],
  code: {
    intro: "Rust لا تعمل داخل هذا الدرس. انسخ البرنامج إلى play.rust-lang.org (يعمل في المتصفح) وشغّله. فيه ما رأيته: أرقام في المكدّس، و Vec و String محتواهما في الكومة، وعنوان الكومة الحقيقي.",
    runnerLang: "text",
    runnerStarter: `fn make(n: i32) -> Vec<i32> {
    let mut v = Vec::new(); // an empty list: pointer, length 0, capacity 0
    for i in 1..=n {
        v.push(i); // may move the items to a bigger box on the heap
    }
    v // the frame of make is popped, the heap items live on
}

fn main() {
    let x = 3; // on the stack
    let v = make(x);
    let name = String::from("Sara"); // the letters are on the heap
    println!("x = {}, v = {:?}, name = {}", x, v, name);
    println!("v lives on the heap at {:p}", v.as_ptr());
    println!("len {} capacity {}", v.len(), v.capacity());
    // try: make(10) and watch the capacity grow
} // v and name are freed here, automatically
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "قائمة تعيش بعد الدالة",
      prompt: "رتّب الأسطر: make تصنع قائمة في الكومة وترجعها، و main تستلمها وتطبعها [1, 2].",
      lines: ["fn make() -> Vec<i32> {", "    let v = vec![1, 2];", "    v", "}", "fn main() {", "    let list = make();", '    println!("{:?}", list);', "}"],
      expected: "[1, 2]",
    },
    {
      kind: "fill",
      lang: "text",
      title: "لا تنسَ التحرير",
      prompt: "برنامج بلغة C يحجز صندوقاً في الكومة بـ malloc. أي دالة تعيده حتى لا يتسرّب؟",
      template: "int *p = malloc(sizeof(int));\n*p = 7;\nprintf(\"%d\\n\", *p);\n___(p);",
      options: ["free", "delete", "drop"],
      answer: "free",
      expected: "7",
    },
    {
      kind: "order",
      lang: "text",
      title: "قائمة تكبر",
      prompt: "رتّب الأسطر: قائمة فارغة تكبر في الكومة بعنصرين، ثم يُطبع طولها وعنصرها الثاني: 2 20.",
      lines: ["fn main() {", "    let mut v = Vec::new();", "    v.push(10);", "    v.push(20);", '    println!("{} {}", v.len(), v[1]);', "}"],
      expected: "2 20",
    },
    {
      kind: "fill",
      lang: "text",
      title: "النوع الذي يعيش في الكومة",
      prompt: "أي نوع يناسب قائمة من ثلاثة أرقام يمكن أن تكبر لاحقاً؟",
      template: 'let v: ___ = vec![1, 2, 3];\nprintln!("{:?}", v);',
      options: ["Vec<i32>", "i32", "[i32; 2]"],
      answer: "Vec<i32>",
      expected: "[1, 2, 3]",
    },
  ],
  quiz: [
    {
      question: "بعد أن تنتهي f، ماذا يبقى منها في الذاكرة؟",
      code: "fn f() {\n    let n = 5;\n    let v = vec![n, n];\n}\nfn main() {\n    f();\n}",
      options: [
        "لا شيء: إطار f أُزيل، و Rust حرّرت القائمة عند القوس }",
        "n يبقى في المكدّس حتى ينتهي البرنامج",
        "القائمة تبقى في الكومة حتى يمرّ جامع القمامة",
      ],
      answer: 0,
      why: "n كان في إطار f، والإطار يُزال كله عند الرجوع. القائمة في الكومة لا يشير إليها شيء بعد f، و Rust تحرّرها في اللحظة نفسها عند } بلا جامع قمامة.",
    },
    {
      question: "load انتهت. ماذا يحدث للمصفوفة الكبيرة في JavaScript؟",
      code: "function load() {\n  let big = new Array(1000000).fill(0);\n  return big.length;\n}\nload();",
      options: [
        "صارت بلا سهم، وسيحذفها جامع القمامة لاحقاً حين يتوقف ليبحث",
        "تُحذف فوراً عند return",
        "تبقى في الكومة حتى يُغلق البرنامج",
      ],
      answer: 0,
      why: "الإطار اختفى ومعه السهم الوحيد إليها. لكن JavaScript لا تعرف ذلك في اللحظة نفسها: جامع القمامة يمرّ بين حين وآخر، يوقف البرنامج قليلاً، ويحذف كل ما لا يصل إليه سهم.",
    },
    {
      question: "برنامج بلغة C. ماذا يطبع السطر الأخير؟",
      code: "char *name = malloc(5);\nstrcpy(name, \"Sara\");\nfree(name);\nprintf(\"%s\\n\", name);",
      options: [
        "لا أحد يعرف: قد يطبع Sara أو حروفاً عشوائية أو ينهار البرنامج",
        "يطبع Sara دائماً",
        "المترجم يرفض البرنامج",
      ],
      answer: 0,
      why: "free أعاد الصندوق إلى الكومة، لكن السهم في name ما زال يشير إلى مكانه. القراءة بعد التحرير (use after free) تقرأ صندوقاً قد يملكه شيء آخر الآن. المترجم لا يلاحظ، وهذا من أشهر الثغرات الأمنية.",
    },
    {
      question: "كم بايتاً تسرّبت بعد هذه الحلقة في C؟",
      code: "for (int i = 0; i < 1000; i++) {\n    int *p = malloc(400);\n}",
      options: ["400000: كل لفّة حجزت صندوقاً ولم تحرّره", "400: الصندوق الأخير فقط", "0: p يختفي فيتحرّر صندوقه معه"],
      answer: 0,
      why: "p في المكدّس، فيختفي في نهاية كل لفّة. لكن اختفاء السهم لا يحرّر الصندوق في C. ألف صندوق بلا سهم ولا free: تسرّب يأكل الذاكرة حتى يُغلق البرنامج.",
    },
    {
      question: "أي القائمتين عناصرها في الكومة؟",
      code: "let a: [i32; 3] = [1, 2, 3];\nlet v: Vec<i32> = vec![1, 2, 3];",
      options: [
        "v وحدها: Vec قد تكبر، أما [i32; 3] فحجمها ثابت معروف قبل التشغيل",
        "الاثنتان، لأن كلتيهما قائمة",
        "a وحدها",
      ],
      answer: 0,
      why: "القاعدة هي الحجم: [i32; 3] ثلاثة أرقام دائماً (12 بايتاً)، فتوضع في الإطار. Vec تسمح بـ push، فلا يعرف المترجم حجمها النهائي، فتضع عناصرها في الكومة.",
    },
  ],
  next: "ownership",
};
