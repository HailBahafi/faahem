import type { Frame, HeapObj, Lesson, Scene, Slot } from "@/lib/types";

const fn = (name: string): Slot => ({ name, value: `ƒ ${name}`, type: "function" });
const str = (name: string, value: string): Slot => ({ name, value: `"${value}"`, type: "string" });
const glob = (vars: Slot[] = [fn("brew"), fn("order")]): Frame => ({ id: 0, name: "البرنامج", vars });
const receipt = (state: "pending" | "fulfilled", value?: string): HeapObj => ({
  id: 1,
  kind: "object",
  items: [
    { name: "state", value: `"${state}"`, type: "string" },
    value === undefined ? { name: "value", value: "undefined", type: "none" } : str("value", value),
  ],
});

/** A tiny hand-written scene for a predict answer (async code is not traced). */
const mini = (js: string, steps: Scene["steps"]): Scene => ({ code: { js }, steps });

export const asyncLesson: Lesson = {
  slug: "async",
  stage: 6,
  number: "6.7",
  title: "async و Promise",
  subtitle: "إيصال لقيمة لم تجهز بعد، و await تنتظره دون أن توقف أحداً",
  minutes: 22,
  problem: {
    title: "ثلاثة مشروبات في المقهى",
    body: "تطلب لاتيه وشاي وعصيراً. جرّب أن تنتظر كل مشروب حتى يجهز قبل أن تطلب الذي بعده، ثم جرّب أن تطلبها كلها معاً. راقب الخط الزمني والوقت الكلي.",
    demo: "async",
  },
  scene: {
    steps: [
      {
        line: null,
        say: "على المكدّس إطار البرنامج وفيه وصفتان: brew تحضّر القهوة ببطء، و order تطلبها. لم يُستدعَ شيء بعد.",
        memory: [],
        frames: [glob()],
        heap: [],
      },
      {
        line: 8,
        say: "استدعاء order يضع إطارها فوق المكدّس كأي دالة. الدالة async تعمل عادياً حتى أول await.",
        memory: [],
        frames: [glob(), { id: 1, name: "order", vars: [] }],
        heap: [],
      },
      {
        line: 2,
        say: "brew لا تملك القهوة الآن. فتصنع Promise: إيصالاً حالته pending، وتسلّم المؤقّت للمتصفح (3 ثوانٍ)، وتعيد الإيصال فوراً.",
        memory: [],
        frames: [glob(), { id: 1, name: "order", vars: [] }, { id: 2, name: "brew", vars: [] }],
        heap: [receipt("pending")],
        changedHeap: [1],
      },
      {
        line: 5,
        say: "await ترى إيصالاً ما زال pending. فتوقف order وحدها: يُرفع إطارها من المكدّس ويُحفظ جانباً، ويعود المكدّس لبقية البرنامج.",
        memory: [],
        frames: [glob()],
        heap: [receipt("pending")],
      },
      {
        line: 9,
        say: "البرنامج لم يتوقف. السطر التالي يعمل في الحال ويطبع: next customer. الكاشير حرّ بينما القهوة تُحضَّر.",
        memory: [],
        frames: [glob()],
        heap: [receipt("pending")],
      },
      {
        line: null,
        say: "انتهى البرنامج والمكدّس فارغ. بعد 3 ثوانٍ يرنّ مؤقّت المتصفح، فيُستدعى resolve(\"latte\"): الإيصال صار fulfilled وفيه القيمة، وبقية order تدخل الطابور.",
        memory: [],
        frames: [],
        heap: [receipt("fulfilled", "latte")],
        changedHeap: [1],
      },
      {
        line: 5,
        say: "حلقة الأحداث ترى المكدّس فارغاً فتعيد order من حيث توقفت. await تفتح الإيصال وتضع ما فيه في cup.",
        memory: [],
        frames: [{ id: 1, name: "order()", vars: [str("cup", "latte")] }],
        heap: [receipt("fulfilled", "latte")],
        changed: ["cup"],
      },
      {
        line: 6,
        say: "يُقرأ cup ويُطبع: latte ready. لاحظ الترتيب: next customer طُبع قبله، مع أنه مكتوب بعده.",
        memory: [],
        frames: [{ id: 1, name: "order()", vars: [str("cup", "latte")] }],
        heap: [receipt("fulfilled", "latte")],
        read: ["cup"],
      },
      {
        line: 7,
        say: "انتهت order وأُزيل إطارها. المكدّس فارغ من جديد، والمطبوع: next customer ثم latte ready.",
        memory: [],
        frames: [],
        heap: [receipt("fulfilled", "latte")],
      },
    ],
    code: {
      js: `function brew() {
  return new Promise((resolve) => setTimeout(() => resolve("latte"), 3000));
}
async function order() {
  const cup = await brew();
  console.log(cup + " ready");
}
order();
console.log("next customer");`,
      ts: `function brew(): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve("latte"), 3000));
}
async function order(): Promise<void> {
  const cup: string = await brew();
  console.log(cup + " ready");
}
order();
console.log("next customer");`,
      py: `async def brew():
    await asyncio.sleep(3)
    return "latte"
async def order():
    cup = await brew()
    print(cup + " ready")

task = asyncio.create_task(order())
print("next customer")`,
      go: `func brew(ready chan string) {
	time.Sleep(3 * time.Second); ready <- "latte"
}
func order(ready chan string) {
	cup := <-ready
	fmt.Println(cup + " ready")
}
ready := make(chan string); go brew(ready); go order(ready)
fmt.Println("next customer")`,
      dart: `Future<String> brew() {
  return Future.delayed(Duration(seconds: 3), () => "latte");
}
Future<void> order() async {
  String cup = await brew();
  print(cup + " ready");
}
order();
print("next customer");`,
      rust: `async fn brew() -> String {
    sleep(Duration::from_secs(3)).await; "latte".to_string()
}
async fn order() {
    let cup = brew().await;
    println!("{} ready", cup);
}
let task = tokio::spawn(order());
println!("next customer");`,
    },
    notes: {
      js: "Promise هو الإيصال، و resolve هو من يملؤه. await تُكتب فقط داخل دالة async، وكل دالة async تعيد هي نفسها Promise.",
      ts: "مثل JavaScript، مع نوع ما في الإيصال: Promise<string> يعني إيصالاً سيحمل نصاً، و await تعطيك string مباشرة.",
      py: "async و await بالمعنى نفسه، والانتظار asyncio.sleep. لكن استدعاء order() وحده لا يشغّلها: create_task تجدولها (والسطران الأخيران داخل async def main يشغّلها asyncio.run).",
      go: "لا async ولا await في Go: كل مهمة goroutine تبدأ بـ go، والقيمة تصل عبر قناة chan. ‎<-ready تنتظر في هذه الـ goroutine وحدها، كما تفعل await.",
      dart: "الإيصال اسمه Future بدل Promise، والباقي مطابق تقريباً: async و await، والدالة تعمل حتى أول await ثم تعيد المكدّس.",
      rust: "await تُكتب بعد القيمة: brew().await. والدوال async في Rust كسولة لا تبدأ حتى يشغّلها منفّذ مثل tokio::spawn.",
    },
  },
  playground: {
    kind: "html",
    intro: "مقهى صغير يطبع خطاً زمنياً على الصفحة: كم ميلي ثانية مرّت عند كل حدث. الطلبان الآن بالدور، واحد بعد الآخر.",
    starter: `<pre id="log"></pre>
<script>
const start = Date.now();
function show(text) {
  document.getElementById("log").textContent += (Date.now() - start) + "ms  " + text + "\\n";
}
function make(drink, ms) {
  return new Promise((resolve) => setTimeout(() => resolve(drink), ms));
}
async function cafe() {
  show("order taken");
  const a = await make("latte", 1000);
  show(a + " ready");
  const b = await make("tea", 1000);
  show(b + " ready");
  show("all done");
}
cafe();
show("cashier is free");
</script>`,
    challenges: [
      "قبل أي تعديل: لماذا يظهر cashier is free عند 0ms، قبل latte ready؟ أين كانت cafe في تلك اللحظة؟",
      "اطلب المشروبين معاً: const both = await Promise.all([make(\"latte\", 1000), make(\"tea\", 1000)]); ثم اطبع both[0] و both[1]. توقّع رقم all done قبل أن تحفظ.",
      "اجعل الشاي 3000ms مع Promise.all. متى تنتهي الآن؟ (الأبطأ هو من يحدد الوقت.)",
      "احذف await من سطر اللاتيه. ماذا يُطبع مكان اسم المشروب، ولماذا؟",
    ],
  },
  predict: [
    {
      question: "ماذا يُطبع، وبأي ترتيب؟",
      code: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function make() {
  console.log("start");
  await wait(100);
  console.log("done");
}
make();
console.log("meanwhile");`,
      options: ["start ثم done ثم meanwhile", "start ثم meanwhile ثم done", "meanwhile ثم start ثم done"],
      answer: 1,
      why: "الدالة async تعمل فوراً كأي دالة حتى أول await، فيُطبع start. عند await يُرفع إطارها ويعود المكدّس للبرنامج فيُطبع meanwhile. بعد 100ms تعود وتطبع done.",
      scene: mini(
        `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function make() {
  console.log("start");
  await wait(100);
  console.log("done");
}
make();
console.log("meanwhile");`,
        [
          { line: 7, say: "استدعاء make يضع إطارها على المكدّس.", memory: [] },
          { line: 3, say: "داخل make، قبل أي await: يُطبع start.", memory: [], output: ["start"] },
          { line: 4, say: "wait تعيد إيصالاً pending. await توقف make وحدها ويُرفع إطارها.", memory: [], output: ["start"] },
          { line: 8, say: "المكدّس عاد للبرنامج: يُطبع meanwhile.", memory: [], output: ["start", "meanwhile"] },
          { line: 5, say: "بعد 100ms امتلأ الإيصال والمكدّس فارغ، فتعود make وتطبع done.", memory: [], output: ["start", "meanwhile", "done"] },
        ],
      ),
    },
    {
      question: "ماذا يُطبع؟",
      code: `async function getPrice() {
  return 15;
}
const price = getPrice();
console.log(price);`,
      options: ["15", "Promise (إيصال وليس الرقم 15)", "undefined"],
      answer: 1,
      why: "كل دالة async تعيد إيصالاً دائماً، حتى لو كانت القيمة جاهزة. price هنا هو الإيصال نفسه. لتحصل على 15 تكتب await getPrice() داخل دالة async، أو getPrice().then(...).",
      scene: mini(
        `async function getPrice() {
  return 15;
}
const price = getPrice();
console.log(price);`,
        [
          { line: 4, say: "استدعاء getPrice. لأنها async فما ترجعه يُغلَّف في إيصال.", memory: [] },
          { line: 2, say: "return 15 تملأ الإيصال بالقيمة 15، لكن الذي يخرج من الدالة هو الإيصال.", memory: [] },
          { line: 4, say: "الدرج price يحمل الإيصال، لا الرقم.", memory: [{ name: "price", value: "Promise {15}", type: "none" }], changed: ["price"] },
          { line: 5, say: "طباعة price تطبع الإيصال كما هو.", memory: [{ name: "price", value: "Promise {15}", type: "none" }], read: ["price"], output: ["Promise {<fulfilled>: 15}"] },
        ],
      ),
    },
    {
      question: "كل مشروب يحتاج 300ms. كم ميلي ثانية تقريباً حتى يُطبع all ready؟",
      code: `const make = (d) => new Promise((resolve) => setTimeout(() => resolve(d), 300));
async function serve() {
  await Promise.all([make("latte"), make("tea"), make("juice")]);
  console.log("all ready");
}
serve();`,
      options: ["300", "900", "0"],
      answer: 0,
      why: "الاستدعاءات الثلاثة تبدأ كلها في السطر نفسه، فالمؤقّتات الثلاثة تعدّ معاً. Promise.all إيصال واحد يمتلئ حين يمتلئ آخر الثلاثة، أي بعد 300ms. الـ 900 تحدث لو كتبت ثلاث await متتالية.",
      scene: mini(
        `const make = (d) => new Promise((resolve) => setTimeout(() => resolve(d), 300));
async function serve() {
  await Promise.all([make("latte"), make("tea"), make("juice")]);
  console.log("all ready");
}
serve();`,
        [
          { line: 6, say: "استدعاء serve.", memory: [] },
          { line: 3, say: "make تُستدعى ثلاث مرات فوراً: ثلاثة إيصالات pending وثلاثة مؤقّتات تعدّ معاً.", memory: [{ name: "latte", value: "pending", type: "none" }, { name: "tea", value: "pending", type: "none" }, { name: "juice", value: "pending", type: "none" }] },
          { line: 3, say: "Promise.all تجمعها في إيصال واحد، و await تنتظره وتعيد المكدّس.", memory: [{ name: "latte", value: "pending", type: "none" }, { name: "tea", value: "pending", type: "none" }, { name: "juice", value: "pending", type: "none" }] },
          { line: 3, say: "عند 300ms تمتلئ الثلاثة تقريباً في اللحظة نفسها.", memory: [{ name: "latte", value: '"latte"', type: "string" }, { name: "tea", value: '"tea"', type: "string" }, { name: "juice", value: '"juice"', type: "string" }], changed: ["latte", "tea", "juice"] },
          { line: 4, say: "تعود serve وتطبع بعد نحو 300ms، لا 900.", memory: [{ name: "latte", value: '"latte"', type: "string" }, { name: "tea", value: '"tea"', type: "string" }, { name: "juice", value: '"juice"', type: "string" }], output: ["all ready"] },
        ],
      ),
    },
  ],
  code: {
    intro: "fetch(url) في المتصفح يعيد إيصالاً لاستجابة HTTP، تماماً مثل brew: ‎const res = await fetch(\"/menu\"); ثم const menu = await res.json();‎. لا يوجد خادم هنا، فـ fakeFetch تقلّده بمؤقّت، وترفض الطلب إن لم يكن الصنف في القائمة. الخطأ في كود async يُلتقط بـ try/catch حول await.",
    runnerLang: "html",
    runnerStarter: `<pre id="log"></pre>
<script>
function show(text) {
  document.getElementById("log").textContent += text + "\\n";
}
// fakeFetch works like fetch(): it returns a promise right away
function fakeFetch(item) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (item === "latte") resolve({ name: "latte", price: 15 });
      else reject(new Error(item + " is not on the menu"));
    }, 600);
  });
}
async function load(item) {
  show("loading " + item + "...");
  try {
    const data = await fakeFetch(item);
    show(data.name + " costs " + data.price);
  } catch (e) {
    show("error: " + e.message);
  }
}
load("latte");
load("pizza");
// try: remove try/catch around the pizza order and see what is lost
</script>`,
  },
  exercises: [
    {
      kind: "order",
      lang: "html",
      check: "__logs.join('\\n')",
      title: "الكاشير لا ينتظر",
      prompt: "رتّب الأسطر حتى يُطبع next customer أولاً ثم latte ready.",
      lines: [
        "<script>",
        "const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));",
        "async function order() {",
        "  await wait(50);",
        '  console.log("latte ready");',
        "}",
        "order();",
        'console.log("next customer");',
        "</script>",
      ],
      expected: "next customer\nlatte ready",
    },
    {
      kind: "fill",
      lang: "html",
      check: "__logs.join('\\n')",
      title: "انتظر الإيصال",
      prompt: "أي سطر يجعل الصفحة تطبع waiting أولاً ثم ready بعد 50ms؟",
      template: `<script>
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function order() {
  ___;
  console.log("ready");
}
order();
console.log("waiting");
</script>`,
      options: ["await wait(50)", "wait(50)", "setTimeout(wait, 50)"],
      expected: "waiting\nready",
    },
    {
      kind: "fix",
      lang: "html",
      check: "__logs.join('\\n')",
      title: "إيصال بدل القهوة",
      prompt: "الصفحة تطبع your [object Promise] بدل your latte. أصلحها.",
      code: `<script>
function brew() {
  return new Promise((resolve) => setTimeout(() => resolve("latte"), 50));
}
async function order() {
  const cup = brew();
  console.log("your " + cup);
}
order();
</script>`,
      expected: "your latte",
      hint: "brew تعيد إيصالاً فوراً. ما الكلمة التي تنتظر الإيصال وتفتحه قبل أن يوضع في cup؟",
      solution: `<script>
function brew() {
  return new Promise((resolve) => setTimeout(() => resolve("latte"), 50));
}
async function order() {
  const cup = await brew();
  console.log("your " + cup);
}
order();
</script>`,
    },
    {
      kind: "write",
      lang: "html",
      check: "__logs.join('\\n')",
      title: "الطلبان معاً",
      prompt: "اكتب دالة async تطلب tea و cake معاً بـ Promise.all، ثم تطبع: tea + cake",
      starter: `<script>
const make = (item, ms) => new Promise((resolve) => setTimeout(() => resolve(item), ms));
// write an async function that orders make("tea", 50) and make("cake", 80) at once,
// then prints: tea + cake
</script>`,
      expected: "tea + cake",
      hint: "داخل الدالة: const both = await Promise.all([make(\"tea\", 50), make(\"cake\", 80)]); ثم اطبع both[0] + \" + \" + both[1]، ولا تنسَ استدعاء الدالة.",
      solution: `<script>
const make = (item, ms) => new Promise((resolve) => setTimeout(() => resolve(item), ms));
async function serve() {
  const both = await Promise.all([make("tea", 50), make("cake", 80)]);
  console.log(both[0] + " + " + both[1]);
}
serve();
</script>`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع، وبأي ترتيب؟",
      code: 'const wait = (ms) => new Promise((r) => setTimeout(r, ms));\nasync function a() {\n  await wait(200);\n  console.log("A");\n}\nasync function b() {\n  await wait(100);\n  console.log("B");\n}\na();\nb();\nconsole.log("C");',
      options: ["C ثم B ثم A", "A ثم B ثم C", "C ثم A ثم B"],
      answer: 0,
      why: "a و b تبدآن وتتوقفان عند await، فيعود المكدّس ويُطبع C فوراً. مؤقّت b أقصر فيمتلئ إيصالها أولاً، فتُطبع B قبل A.",
    },
    {
      question: "ماذا يُطبع؟",
      code: "async function double(n) {\n  return n * 2;\n}\ndouble(5).then((v) => console.log(v + 1));",
      options: ["11", "Promise ثم 1", "NaN"],
      answer: 0,
      why: "double تعيد إيصالاً فيه 10. ‎.then تسجّل ما يُفعل عند امتلائه: تستلم v = 10 وتطبع 11.",
    },
    {
      question: "كل make يحتاج ثانية واحدة. كم ثانية تقريباً حتى يُطبع done؟",
      code: 'async function cafe() {\n  const a = await make("latte");\n  const b = await make("tea");\n  const c = await make("juice");\n  console.log("done");\n}\ncafe();',
      options: ["3", "1", "0"],
      answer: 0,
      why: "كل await توقف cafe حتى يمتلئ إيصالها، والطلب التالي لا يبدأ إلا بعدها. ثلاثة انتظارات متتالية = ثلاث ثوانٍ. مع Promise.all تكون ثانية واحدة.",
    },
    {
      question: "brew ترفض إيصالها بخطأ no milk. ماذا يُطبع؟",
      code: 'async function order() {\n  try {\n    const cup = await brew();\n    console.log(cup);\n  } catch (e) {\n    console.log("sorry: " + e.message);\n  }\n  console.log("bye");\n}\norder();',
      options: ["sorry: no milk ثم bye", "undefined ثم bye", "لا شيء، يتوقف البرنامج"],
      answer: 0,
      why: "الإيصال المرفوض يجعل await ترمي الخطأ في مكانها، كأن السطر نفسه فشل. فيقفز التنفيذ إلى catch ويُطبع sorry: no milk، ثم يكمل بعد try/catch ويطبع bye.",
    },
    {
      question: "ما الذي يكون في res بعد هذا السطر؟",
      code: 'async function load() {\n  const res = await fetch("/menu");\n}',
      options: ["كائن استجابة HTTP: الحالة والرؤوس، والجسم لم يُقرأ بعد", "بيانات القائمة جاهزة ككائن", "إيصال Promise ما زال pending"],
      answer: 0,
      why: "fetch تعيد إيصالاً فوراً، و await تنتظره وتفتحه، فيصل في res كائن الاستجابة نفسه. قراءة الجسم إيصال ثانٍ: await res.json().",
    },
  ],
  next: "typescript",
};
