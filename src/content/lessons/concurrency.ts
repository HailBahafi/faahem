import type { Cell, Lesson, Scene } from "@/lib/types";

const num = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const note = (name: string, value: string): Cell => ({ name, value, type: "none" });

/** The machine for the scene: the shared number behind its lock, the Arc handles and the spawned thread. */
function box(value: number, lock: string, owners: number, c2: string, t: string): Cell[] {
  return [num("counter (in Mutex)", value), note("lock held by", lock), note("Arc owners", String(owners)), note("c2", c2), note("thread t", t)];
}

/** A hand-written answer scene in Rust or Go. */
const rust = (code: string, steps: Scene["steps"]): Scene => ({ code: { rust: code }, steps });

export const concurrency: Lesson = {
  slug: "concurrency",
  stage: 10,
  number: "10.4",
  title: "التزامن",
  subtitle: "خيطان يعملان معاً على نواتين قد يضيّعان تحديثات بعضهما؛ والحل: لا تتشارك، أو أرسل رسائل، أو اقفل. وRust تجعل النسيان خطأ ترجمة",
  minutes: 24,
  singleLanguage: true,
  problem: {
    title: "2000 أم أقل؟",
    body: "عاملان يزيدان العدّاد نفسه، كل واحد 1000 مرة. شغّلهما عدة مرات وانظر إلى الرقم النهائي. ثم شغّل القفل Mutex وأعد التجربة. وإن ضاعت زيادة، شاهدها تضيع ببطء.",
    demo: "concurrency",
  },
  scene: {
    code: {
      rust: `let counter = Arc::new(Mutex::new(0));
let c2 = Arc::clone(&counter);
let t = thread::spawn(move || {
    *c2.lock().unwrap() += 1;
});
*counter.lock().unwrap() += 1;
t.join().unwrap();
println!("{}", *counter.lock().unwrap());`,
    },
    steps: [
      {
        line: null,
        say: "الهدف: خيطان (threads) يزيد كل منهما رقماً مشتركاً بواحد، على نواتين في اللحظة نفسها. في JavaScript لا يحدث هذا: خيط واحد وحلقة أحداث. هنا يحدث فعلاً.",
        memory: [],
      },
      {
        line: 1,
        say: "الرقم 0 داخل Mutex: صندوق له قفل، لا يُفتح إلا لحامل واحد. وحول الصندوق Arc: ملكية مشتركة تعدّ مالكيها، لأن خيطين سيملكانه معاً.",
        memory: box(0, "nobody", 1, "—", "—"),
        changed: ["counter (in Mutex)", "Arc owners"],
      },
      {
        line: 2,
        say: "Arc::clone لا ينسخ الرقم. يصنع مقبضاً ثانياً إلى الصندوق نفسه، ويصير عدد المالكين 2.",
        memory: box(0, "nobody", 2, "→ same box", "—"),
        changed: ["Arc owners", "c2"],
      },
      {
        line: 3,
        say: "thread::spawn يبدأ خيطاً جديداً يعمل بالتوازي مع main. وmove تنقل c2 إلى داخله: صار ملكاً للخيط، وmain لم يعد يستطيع لمسه.",
        memory: box(0, "nobody", 2, "moved into t", "running"),
        changed: ["c2", "thread t"],
      },
      {
        line: 6,
        say: "main و t وصلا إلى القفل معاً. main أخذه أولاً: يقرأ 0 ويكتب 1. وt، في السطر 4، ينتظر عند الباب.",
        memory: box(1, "main", 2, "moved into t", "waiting for lock"),
        changed: ["counter (in Mutex)", "lock held by", "thread t"],
      },
      {
        line: 6,
        say: "نهاية السطر: المقبض الذي أعادته lock يموت، فيُفتح القفل تلقائياً. لا أحد ينسى أن يفتحه.",
        memory: box(1, "nobody", 2, "moved into t", "waiting for lock"),
        changed: ["lock held by"],
      },
      {
        line: 4,
        say: "t يأخذ القفل الآن. يقرأ 1، لا 0، لأن main أنهى كتابته قبل أن يُسمح لـ t بالقراءة. ويكتب 2.",
        memory: box(2, "t", 2, "moved into t", "running"),
        changed: ["counter (in Mutex)", "lock held by", "thread t"],
      },
      {
        line: 5,
        say: "انتهى الخيط: فُتح القفل، ومات c2 فنقص عدد المالكين إلى 1.",
        memory: box(2, "nobody", 1, "freed", "finished"),
        changed: ["lock held by", "Arc owners", "c2", "thread t"],
      },
      {
        line: 7,
        say: "join: main ينتظر حتى ينتهي t. بدونه قد يطبع main قبل أن يكتب t، أو ينتهي البرنامج والخيط في منتصف عمله.",
        memory: box(2, "nobody", 1, "freed", "joined"),
        changed: ["thread t"],
      },
      {
        line: 8,
        say: "main يأخذ القفل ليقرأ: 2. دائماً 2، أياً كان الخيط الذي سبق.",
        memory: box(2, "main", 1, "freed", "joined"),
        read: ["counter (in Mutex)"],
        output: ["2"],
      },
      {
        line: null,
        say: "ولو حاولنا بلا قفل: let mut n = 0، ثم خيط يكتب n += 1 وmain يكتب أيضاً؟ هذا كاتبان معاً، أي ما منعه درس الاستعارة. المترجم يرفض ولا يُبنى البرنامج.",
        memory: [num("n", 0)],
        error: "error[E0373]: closure may outlive the current function, but it borrows `n`, which is owned by the current function",
        output: ["2"],
      },
    ],
    notes: {
      rust: "Arc تعطي ملكية مشتركة آمنة بين الخيوط، وMutex تعطي كاتباً واحداً في كل لحظة. ‎Arc<Mutex<T>>‎ هي قاعدة «قرّاء كثيرون أو كاتب واحد» نفسها، لكنها تُفحص أثناء التشغيل بالقفل لأن المترجم لا يعرف أي خيط سيسبق.",
    },
  },
  playground: {
    kind: "trace",
    intro: "الخيوط الحقيقية لا تعمل في هذا المتصفح، فهذه محاكاة: خيطان A وB، كل منهما يزيد counter بثلاث خطوات (يقرأ، يضيف 1، يكتب). الحلقة تبدّل الدور بينهما خطوة خطوة، كما يفعل نظام التشغيل. راقب ماذا يقرأ كل خيط.",
    starter: `let counter = 5;
const useLock = false;
let lockHolder = "";
const a = { name: "A", step: 0, local: 0 };
const b = { name: "B", step: 0, local: 0 };

function run(t) {
  if (useLock && lockHolder !== "" && lockHolder !== t.name) {
    console.log(t.name + " waits for the lock");
    return;
  }
  if (t.step === 0) {
    if (useLock) lockHolder = t.name;
    t.local = counter;
    console.log(t.name + " reads " + t.local);
  } else if (t.step === 1) {
    t.local = t.local + 1;
  } else {
    counter = t.local;
    lockHolder = "";
    console.log(t.name + " writes " + counter);
  }
  t.step = t.step + 1;
}

const order = [a, b];
let turn = 0;
while (a.step < 3 || b.step < 3) {
  const t = order[turn % 2];
  if (t.step < 3) run(t);
  turn = turn + 1;
}
console.log("counter: " + counter);`,
    challenges: [
      "قبل أن تشغّل: الخيطان زادا العدّاد مرة لكل منهما. هل يطبع 7؟ شغّل وانظر ماذا قرأ كل خيط.",
      "اجعل const order = [a, a, a, b] (وغيّر turn % 2 إلى turn % 4). هل ضاعت الزيادة الآن؟ ما الفرق؟",
      "أعد order إلى [a, b] واجعل useLock = true. من ينتظر، ومتى يُفتح القفل؟ وكم صار counter؟",
      "أضف خيطاً ثالثاً c، وضعه في order، وغيّر شرط while ليشمله. كم زيادة تضيع بلا قفل؟",
    ],
  },
  predict: [
    {
      question: "هذه محاكاة لخيطين يزيدان counter. كل خيط يقرأ أولاً ثم يكتب. ماذا يُطبع؟",
      code: `let counter = 5;
let a = counter; // thread A reads
let b = counter; // thread B reads
counter = a + 1; // A writes
counter = b + 1; // B writes
console.log(counter);`,
      options: ["6", "7", "5"],
      answer: 0,
      why: "كلاهما قرأ 5 قبل أن يكتب أي منهما. A كتب 6، ثم كتب B 6 فوقها. زيادتان، والعدّاد زاد واحداً: هذا تحديث ضائع (lost update)، وهو أشهر سباق.",
    },
    {
      question: "خيط جديد يزيد count بلا Arc ولا Mutex. ماذا يحدث؟",
      code: `let mut count = 0;
let t = thread::spawn(|| {
    count += 1;
});
t.join().unwrap();
println!("{}", count);`,
      options: ["المترجم يرفض: الخيط يستعير count وقد يعيش بعده", "يطبع 1", "يطبع 0 أو 1 حسب الحظ"],
      answer: 0,
      why: "الخيط قد يستمر بعد أن تنتهي الدالة التي تملك count، فسهمه إليها قد يصير معلّقاً، وmain يمكنه أيضاً أن يكتب فيها في الوقت نفسه. Rust لا تراهن: E0373. الحل move لنقل نسخة، أو ‎Arc<Mutex<i32>>‎ لمشاركتها.",
      scene: rust(
        `let mut count = 0;
let t = thread::spawn(|| {
    count += 1;
});
t.join().unwrap();
println!("{}", count);`,
        [
          { line: 1, say: "count يملكه main.", memory: [num("count", 0)], changed: ["count"] },
          {
            line: 2,
            say: "الدالة المغلقة تستعير count بقلم (‎&mut‎) وتُسلَّم لخيط آخر. المترجم لا يستطيع أن يثبت أن الخيط سينتهي قبل count، ولا أن main لن يكتب فيه معه. يرفض.",
            memory: [num("count", 0)],
            read: ["count"],
            error: "error[E0373]: closure may outlive the current function, but it borrows `count`",
          },
        ],
      ),
    },
    {
      question: "عشرة خيوط، كل واحد يقفل ويزيد 1. ماذا يُطبع؟",
      code: `let c = Arc::new(Mutex::new(0));
let mut hs = vec![];
for _ in 0..10 {
    let c = Arc::clone(&c);
    hs.push(thread::spawn(move || *c.lock().unwrap() += 1));
}
for h in hs { h.join().unwrap(); }
println!("{}", *c.lock().unwrap());`,
      options: ["10، في كل مرة", "رقم بين 1 و10 يتغير", "0، لأن الخيوط لم تبدأ بعد"],
      answer: 0,
      why: "الخيوط تتسابق على القفل بترتيب مختلف كل مرة، لكن من يحمل القفل وحده يقرأ ويكتب. لا أحد يقرأ رقماً قديماً، فلا زيادة تضيع. وjoin يضمن أن الطباعة بعد أن ينتهي الجميع.",
      scene: rust(
        `let c = Arc::new(Mutex::new(0));
let mut hs = vec![];
for _ in 0..10 {
    let c = Arc::clone(&c);
    hs.push(thread::spawn(move || *c.lock().unwrap() += 1));
}
for h in hs { h.join().unwrap(); }
println!("{}", *c.lock().unwrap());`,
        [
          { line: 1, say: "صندوق بقفل فيه 0.", memory: [num("c (in Mutex)", 0), note("threads", "0")], changed: ["c (in Mutex)"] },
          { line: 5, say: "عشرة خيوط، كل واحد بمقبض Arc خاص به، تبدأ كلها وتتسابق على القفل.", memory: [num("c (in Mutex)", 0), note("threads", "10 running")], changed: ["threads"] },
          { line: 5, say: "واحد فقط يحمل القفل في كل لحظة: يقرأ ويكتب ويفتح. الباقون ينتظرون.", memory: [num("c (in Mutex)", 4), note("threads", "6 waiting")], changed: ["c (in Mutex)"] },
          { line: 7, say: "main ينتظر الخيوط العشرة حتى تنتهي.", memory: [num("c (in Mutex)", 10), note("threads", "all joined")], changed: ["c (in Mutex)", "threads"] },
          { line: 8, say: "10، دائماً.", memory: [num("c (in Mutex)", 10), note("threads", "all joined")], read: ["c (in Mutex)"], output: ["10"] },
        ],
      ),
    },
  ],
  code: {
    intro: "Rust لا يعمل داخل هذا الدرس. انسخ البرنامج إلى play.rust-lang.org وشغّله عدة مرات: ترتيب أسطر worker يتغير بين التشغيلات (الخيوط تعمل فعلاً بالتوازي)، لكن المجموع 4000 دائماً. ثم جرّب الحل الآخر في الأسفل: قناة (channel) بدل المشاركة، كما في Go.",
    runnerLang: "text",
    runnerStarter: `use std::sync::{mpsc, Arc, Mutex};
use std::thread;

fn main() {
    // 1) share one counter behind a lock
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    for id in 0..4 {
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            for _ in 0..1000 {
                *counter.lock().unwrap() += 1; // only the lock holder can touch it
            }
            println!("worker {} done", id);
        }));
    }
    for h in handles {
        h.join().unwrap();
    }
    println!("total: {}", *counter.lock().unwrap());

    // 2) don't share: send messages through a channel
    let (tx, rx) = mpsc::channel();
    for id in 0..3 {
        let tx = tx.clone();
        thread::spawn(move || tx.send(id * 10).unwrap());
    }
    drop(tx); // close our copy so the loop below ends
    let sum: i32 = rx.iter().sum(); // only main adds: no lock needed
    println!("sum: {}", sum);
    // try: replace Arc::new(Mutex::new(0)) with a plain let mut counter = 0 and read the error
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "عدّاد مشترك",
      prompt: "رتّب الأسطر: صندوق بقفل، مقبض ثانٍ للخيط، خيط يزيد 1، ثم main ينتظره ويطبع 1.",
      lines: [
        "let counter = Arc::new(Mutex::new(0));",
        "let c = Arc::clone(&counter);",
        "let t = thread::spawn(move || {",
        "    *c.lock().unwrap() += 1;",
        "});",
        "t.join().unwrap();",
        'println!("{}", *counter.lock().unwrap());',
      ],
      expected: "1",
    },
    {
      kind: "fill",
      lang: "text",
      title: "انقلها إلى الخيط",
      prompt: "الخيط يطبع name. أي كلمة تنقل name إلى داخل الخيط حتى يملكه، فيقبل المترجم البرنامج؟",
      template: `let name = String::from("Sara");
let t = thread::spawn(___ || {
    println!("{}", name);
});
t.join().unwrap();`,
      options: ["move", "&", "mut"],
      answer: "move",
      expected: "Sara",
    },
    {
      kind: "order",
      lang: "text",
      title: "رسالة بدل المشاركة",
      prompt: "بلغة Go من درس خادم Go: رتّب الأسطر حتى ترسل goroutine الرقم 42 عبر قناة، ويستلمه main ويطبعه.",
      lines: ["func main() {", "    ch := make(chan int)", "    go func() {", "        ch <- 42", "    }()", "    fmt.Println(<-ch)", "}"],
      expected: "42",
    },
    {
      kind: "fill",
      lang: "text",
      title: "ملكية بين الخيوط",
      prompt: "أي غلاف يسمح لعدة خيوط أن تملك الصندوق نفسه؟ (أحد الخيارات يعمل في خيط واحد فقط، ويرفضه المترجم هنا بالخطأ E0277.)",
      template: `let c = ___::new(Mutex::new(0));
let c2 = ___::clone(&c);
thread::spawn(move || *c2.lock().unwrap() += 1).join().unwrap();
println!("{}", *c.lock().unwrap());`,
      options: ["Arc", "Rc", "Box"],
      answer: "Arc",
      expected: "1",
    },
  ],
  quiz: [
    {
      question: "بلغة تسمح بذلك (مثل C أو Go بلا قفل): خيطان، كل منهما يكتب counter++ ألف مرة على المتغير نفسه. ما الناتج؟",
      options: ["2000 أو أقل، ويتغير من تشغيل إلى آخر", "2000 دائماً", "1000 دائماً"],
      answer: 0,
      why: "counter++ ثلاث خطوات: قراءة، جمع، كتابة. إن قرأ الخيطان القيمة نفسها قبل أن يكتب أحدهما، تضيع زيادة. وكم مرة يحدث هذا يعتمد على توقيت النواتين، فيختلف كل تشغيل.",
    },
    {
      question: "في JavaScript، ماذا يطبع هذا؟",
      code: `let counter = 0;
function work() {
  for (let i = 0; i < 1000; i++) counter++;
}
setTimeout(work, 0);
setTimeout(work, 0);
setTimeout(() => console.log(counter), 10);`,
      options: ["2000 دائماً", "2000 أو أقل", "1000"],
      answer: 0,
      why: "في JavaScript مكدّس واحد وحلقة أحداث. الدالة الثانية لا تبدأ حتى تنتهي الأولى تماماً، فلا يقرأ أحد counter في منتصف كتابة غيره. التزامن هنا تناوب، لا توازٍ حقيقي.",
    },
    {
      question: "الخيط A يحمل قفل Mutex. الخيط B يستدعي lock()‎ على القفل نفسه. ماذا يحدث لـ B؟",
      options: ["ينتظر حتى يُفتح القفل (حين يموت مقبض A)، ثم يأخذه", "يقرأ القيمة القديمة ويكمل", "يتوقف البرنامج كله بخطأ"],
      answer: 0,
      why: "القفل حامل واحد فقط. B يتوقف عند الباب حتى ينتهي A ويموت مقبضه فيُفتح القفل تلقائياً. لذلك لا يقرأ B رقماً سيُكتب فوقه.",
    },
    {
      question: "استبدلنا Arc بـ Rc لنشارك عدّاداً بين خيطين. ماذا يقول المترجم؟",
      code: `let c = Rc::new(Mutex::new(0));
let c2 = Rc::clone(&c);
thread::spawn(move || *c2.lock().unwrap() += 1);`,
      options: [
        "يرفض: Rc لا يمكن إرساله بين الخيوط بأمان (E0277)",
        "يقبل، فالقفل Mutex يكفي",
        "يقبل، ويطبع 1",
      ],
      answer: 0,
      why: "Rc يعدّ مالكيه بعدّاد عادي، وخيطان يزيدانه معاً قد يضيّعان زيادة، فيُحرَّر الصندوق مبكراً. Arc يعدّ بعمليات ذرية (atomic) آمنة. المترجم يعرف الفرق ويرفض Rc قبل التشغيل.",
    },
    {
      question: "بلغة Go: ثلاث goroutines ترسل كل منها 1 إلى قناة، وmain يجمع. ماذا يُطبع؟",
      code: `ch := make(chan int)
for i := 0; i < 3; i++ {
    go func() { ch <- 1 }()
}
total := 0
for i := 0; i < 3; i++ {
    total += <-ch
}
fmt.Println(total)`,
      options: ["3 دائماً", "بين 1 و3", "0"],
      answer: 0,
      why: "لا أحد يتشارك total: main وحده يقرؤه ويكتبه. الـ goroutines ترسل رسائل فقط، والقناة تسلّمها واحدة واحدة. «لا تتواصل بمشاركة الذاكرة، بل شارك الذاكرة بالتواصل».",
    },
  ],
  next: "linux",
};
