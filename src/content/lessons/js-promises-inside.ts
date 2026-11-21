import type { Cell, Lesson, Scene } from "@/lib/types";

const box = (name: string, value: string): Cell => ({ name, value, type: "none" });

/** A hand-written scene for a predict answer (Promise code is not traced). */
const mini = (js: string, steps: Scene["steps"]): Scene => ({ code: { js }, steps });

export const jsPromisesInside: Lesson = {
  slug: "js-promises-inside",
  stage: 0,
  number: "3.3",
  title: "الوعود من الداخل",
  subtitle: "كائن له حالة وقائمة انتظار، و then تصنع وعداً جديداً في كل مرة",
  minutes: 25,
  singleLanguage: true,
  problem: {
    title: "صندوق الوعد",
    body: "أمامك وعد واحد. سجّل عليه دالة then، ثم استدعِ resolve، ثم جرّب resolve مرة ثانية، ثم شغّل طابور المهام الصغيرة. راقب متى تعمل الدالة فعلاً، وماذا يحدث للقيمة الثانية.",
    demo: "jsPromisesInside",
  },
  scene: {
    code: {
      js: `const p = new Promise((resolve) => {
  console.log("executor");
  resolve(1);
  resolve(2);
});
const q = p.then((v) => v + 10);
q.then((v) => console.log("got " + v));
setTimeout(() => console.log("timer"), 0);
console.log("sync end");`,
    },
    steps: [
      {
        line: null,
        say: "الوعد ليس سحراً: كائن عادي فيه ثلاثة أشياء: حالة (pending ثم fulfilled أو rejected)، وقيمة، وقائمة دوال تنتظره. سنتابعها هنا مع طابورين: microtasks للوعود، و tasks للمؤقّتات.",
        memory: [],
      },
      {
        line: 1,
        say: "new Promise يصنع الكائن p بحالة pending، ثم يستدعي الدالة التي أعطيناها له (المنفّذ executor) فوراً، في السطر نفسه، قبل أن يكمل.",
        memory: [box("p", "pending"), box("microtasks", "[]"), box("tasks", "[]")],
        changed: ["p"],
      },
      {
        line: 2,
        say: "المنفّذ يعمل الآن، متزامناً. يُطبع executor أولاً. لا شيء غير متزامن في المنفّذ نفسه.",
        memory: [box("p", "pending"), box("microtasks", "[]"), box("tasks", "[]")],
      },
      {
        line: 3,
        say: "resolve(1) تغيّر حالة p إلى fulfilled وتحفظ القيمة 1. لا أحد ينتظر p بعد، فلا شيء يُجدول.",
        memory: [box("p", "fulfilled: 1"), box("microtasks", "[]"), box("tasks", "[]")],
        changed: ["p"],
      },
      {
        line: 4,
        say: "resolve(2) تسأل أولاً: هل الحالة ما زالت pending؟ لا، فتعود دون أي أثر. الوعد يستقر مرة واحدة فقط، والقيمة 2 تضيع.",
        memory: [box("p", "fulfilled: 1"), box("microtasks", "[]"), box("tasks", "[]")],
        read: ["p"],
      },
      {
        line: 6,
        say: "p.then تصنع وعداً جديداً q. و p مستقر أصلاً، لكن الدالة v + 10 لا تعمل الآن: تدخل طابور microtasks. then لا تستدعي دالتها في السطر نفسه أبداً.",
        memory: [box("p", "fulfilled: 1"), box("q", "pending"), box("microtasks", "[v + 10]"), box("tasks", "[]")],
        changed: ["q", "microtasks"],
      },
      {
        line: 7,
        say: "q ما زال pending، فالدالة التي تطبع تُضاف إلى قائمة انتظار q نفسه، لا إلى الطابور. ستنتقل إلى الطابور حين يستقر q.",
        memory: [box("p", "fulfilled: 1"), box("q", "pending, waiting: [print]"), box("microtasks", "[v + 10]"), box("tasks", "[]")],
        changed: ["q"],
      },
      {
        line: 8,
        say: "setTimeout تسلّم المؤقّت للبيئة. بعد 0ms تدخل دالته طابور tasks، وهو طابور آخر أبطأ من طابور الوعود.",
        memory: [box("p", "fulfilled: 1"), box("q", "pending, waiting: [print]"), box("microtasks", "[v + 10]"), box("tasks", "[timer]")],
        changed: ["tasks"],
      },
      {
        line: 9,
        say: "سطر عادي: يُطبع sync end. انتهى السكربت والمكدّس فارغ. حتى الآن طُبع: executor ثم sync end.",
        memory: [box("p", "fulfilled: 1"), box("q", "pending, waiting: [print]"), box("microtasks", "[v + 10]"), box("tasks", "[timer]")],
      },
      {
        line: 6,
        say: "المكدّس فارغ، فالمحرّك يفرّغ microtasks كله قبل أي task. تعمل v + 10 بـ v = 1، والناتج 11 يحلّ q. انتظار q يُنقل الآن إلى الطابور.",
        memory: [box("p", "fulfilled: 1"), box("q", "fulfilled: 11"), box("microtasks", "[print]"), box("tasks", "[timer]")],
        changed: ["q", "microtasks"],
      },
      {
        line: 7,
        say: "الطابور الصغير لم يفرغ بعد، فتعمل print فوراً: يُطبع got 11. هكذا تسير السلسلة: كل حلقة تحلّ الوعد التالي فتجدول ما ينتظره.",
        memory: [box("p", "fulfilled: 1"), box("q", "fulfilled: 11"), box("microtasks", "[]"), box("tasks", "[timer]")],
        changed: ["microtasks"],
      },
      {
        line: 8,
        say: "الآن فقط، وطابور الوعود فارغ، تأخذ الحلقة مهمة واحدة من tasks: يُطبع timer. الناتج كاملاً: executor، sync end، got 11، timer.",
        memory: [box("p", "fulfilled: 1"), box("q", "fulfilled: 11"), box("microtasks", "[]"), box("tasks", "[]")],
        changed: ["tasks"],
      },
    ],
    notes: {
      js: "في المواصفة الحالة اسمها [[PromiseState]] والقائمة [[PromiseFulfillReactions]]، ولا تراها من الكود؛ ما تراه هو then و catch و finally فقط.",
    },
  },
  playground: {
    kind: "trace",
    intro: "هذا وعد مبني بيدك من كائن عادي: حالة، وقيمة، وقائمة انتظار، ومصفوفة jobs تلعب دور طابور microtasks. الحلقة الأخيرة تفرّغ الطابور كما يفعل المحرّك حين يفرغ المكدّس. شغّله وتابع الكومة.",
    starter: `const jobs = [];
function makePromise() {
  return { state: "pending", value: null, waiting: [] };
}
function resolve(p, value) {
  if (p.state !== "pending") return;
  p.state = "fulfilled";
  p.value = value;
  for (const cb of p.waiting) jobs.push(() => cb(value));
  p.waiting = [];
}
function then(p, cb) {
  const next = makePromise();
  const run = (v) => resolve(next, cb(v));
  if (p.state === "fulfilled") jobs.push(() => run(p.value));
  else p.waiting.push(run);
  return next;
}
const p = makePromise();
const q = then(p, (v) => v * 2);
then(q, (v) => console.log("got " + v));
resolve(p, 21);
resolve(p, 99);
console.log("sync code done");
while (jobs.length > 0) {
  const job = jobs.shift();
  job();
}`,
    challenges: [
      "قبل أن تشغّل: لماذا يُطبع sync code done قبل got 42، مع أن resolve(p, 21) جاء قبله؟",
      "انقل السطر resolve(p, 21) إلى ما قبل const q. هل تتغير النتيجة؟ تابع أين ذهبت الدالة هذه المرة: waiting أم jobs؟",
      "احذف السطر if (p.state !== \"pending\") return; وتوقّع ما سيُطبع الآن بعد resolve(p, 99).",
      "أضف حلقة ثالثة: then(q, (v) => v + 1) واحفظ ما تعيده في r، ثم then(r, ...) تطبع r. كم مرة يدور الطابور؟",
    ],
  },
  predict: [
    {
      question: "ماذا يُطبع، وبأي ترتيب؟",
      code: `setTimeout(() => console.log("T"), 0);
Promise.resolve().then(() => console.log("P"));
console.log("S");`,
      options: ["S ثم P ثم T", "T ثم P ثم S", "S ثم T ثم P"],
      answer: 0,
      why: "السطر العادي يعمل أولاً. بعد أن يفرغ المكدّس يفرّغ المحرّك طابور الوعود كله (P)، ثم يأخذ مهمة واحدة من طابور المؤقّتات (T). مؤقّت 0ms لا يعني «الآن»، بل «في أقرب دورة».",
      scene: mini(
        `setTimeout(() => console.log("T"), 0);
Promise.resolve().then(() => console.log("P"));
console.log("S");`,
        [
          { line: 1, say: "دالة المؤقّت تذهب إلى طابور tasks.", memory: [box("microtasks", "[]"), box("tasks", "[T]")] },
          { line: 2, say: "الوعد محلول أصلاً، فدالة then تذهب إلى طابور microtasks.", memory: [box("microtasks", "[P]"), box("tasks", "[T]")] },
          { line: 3, say: "سطر عادي: يُطبع S.", memory: [box("microtasks", "[P]"), box("tasks", "[T]")] },
          { line: 2, say: "المكدّس فارغ: microtasks أولاً. يُطبع P.", memory: [box("microtasks", "[]"), box("tasks", "[T]")] },
          { line: 1, say: "ثم مهمة واحدة من tasks: يُطبع T. الناتج: S، P، T.", memory: [box("microtasks", "[]"), box("tasks", "[]")] },
        ],
      ),
    },
    {
      question: "ماذا يُطبع، وبأي ترتيب؟",
      code: `const p = new Promise((resolve) => {
  console.log("A");
  resolve();
});
p.then(() => console.log("C"));
console.log("B");`,
      options: ["A ثم B ثم C", "B ثم A ثم C", "A ثم C ثم B"],
      answer: 0,
      why: "المنفّذ داخل new Promise يعمل فوراً ومتزامناً، فيُطبع A. أما دالة then فلا تعمل في السطر نفسه حتى لو كان الوعد محلولاً: تنتظر في الطابور حتى يفرغ المكدّس بعد B.",
      scene: mini(
        `const p = new Promise((resolve) => {
  console.log("A");
  resolve();
});
p.then(() => console.log("C"));
console.log("B");`,
        [
          { line: 1, say: "new Promise يستدعي المنفّذ فوراً.", memory: [box("p", "pending")] },
          { line: 2, say: "يُطبع A، والوعد ما زال يُبنى.", memory: [box("p", "pending")] },
          { line: 3, say: "resolve تجعل p محلولاً.", memory: [box("p", "fulfilled")], changed: ["p"] },
          { line: 5, say: "p محلول، لكن then تضع دالتها في الطابور ولا تستدعيها.", memory: [box("p", "fulfilled"), box("microtasks", "[C]")] },
          { line: 6, say: "يُطبع B.", memory: [box("p", "fulfilled"), box("microtasks", "[C]")] },
          { line: 5, say: "المكدّس فارغ: تعمل دالة then ويُطبع C.", memory: [box("p", "fulfilled"), box("microtasks", "[]")] },
        ],
      ),
    },
    {
      question: "ماذا يُطبع؟",
      code: `new Promise((resolve) => {
  resolve(1);
  resolve(2);
})
  .then((v) => v * 10)
  .then((v) => console.log(v));`,
      options: ["10", "20", "10 ثم 20"],
      answer: 0,
      why: "الوعد يستقر مرة واحدة: resolve(1) تثبّت القيمة، و resolve(2) تجد الحالة لم تعد pending فلا تفعل شيئاً. ثم كل then تصنع وعداً جديداً يحمل ما أعادته دالتها: 1 × 10 = 10.",
      scene: mini(
        `new Promise((resolve) => {
  resolve(1);
  resolve(2);
})
  .then((v) => v * 10)
  .then((v) => console.log(v));`,
        [
          { line: 2, say: "الحالة تصبح fulfilled والقيمة 1.", memory: [box("p1", "fulfilled: 1")] },
          { line: 3, say: "الحالة ليست pending، فـ resolve(2) لا تفعل شيئاً.", memory: [box("p1", "fulfilled: 1")] },
          { line: 5, say: "then الأولى تصنع p2 وتجدول v * 10.", memory: [box("p1", "fulfilled: 1"), box("p2", "pending")] },
          { line: 6, say: "then الثانية تصنع p3 وتنتظر p2.", memory: [box("p1", "fulfilled: 1"), box("p2", "pending"), box("p3", "pending")] },
          { line: 5, say: "الطابور: 1 × 10 = 10 تحلّ p2.", memory: [box("p1", "fulfilled: 1"), box("p2", "fulfilled: 10"), box("p3", "pending")], changed: ["p2"] },
          { line: 6, say: "تعمل الدالة المنتظرة على p2 فيُطبع 10.", memory: [box("p1", "fulfilled: 1"), box("p2", "fulfilled: 10"), box("p3", "fulfilled")] },
        ],
      ),
    },
  ],
  code: {
    intro: "هذا وعد كامل مكتوب بيدك كصنف MyPromise: حالة تستقر مرة واحدة، ورفض، و then تصنع وعداً جديداً وتمرّر الأخطاء، وتبنّي وعد آخر إن أعادته الدالة (هذا ما يجعل السلسلة مسطّحة). ليس هنا محرّك يفرّغ الطابور تلقائياً، فالدالة drain تفعل ذلك في آخر الكود.",
    runnerStarter: `// The engine keeps a microtask queue and drains it whenever the stack is empty.
// Here the queue is an array, and drain() at the end plays the engine.
const microtasks = [];
const queueJob = (job) => microtasks.push(job);
function drain() {
  while (microtasks.length > 0) microtasks.shift()();
}

class MyPromise {
  #state = "pending";
  #value = undefined;
  #reactions = [];

  constructor(executor) {
    let done = false; // resolve/reject work once, even when adopting a thenable
    const resolve = (value) => {
      if (done) return;
      done = true;
      this.#resolveWith(value);
    };
    const reject = (reason) => {
      if (done) return;
      done = true;
      this.#settle("rejected", reason);
    };
    try {
      executor(resolve, reject); // runs now, synchronously
    } catch (err) {
      reject(err);
    }
  }

  #resolveWith(value) {
    if (value !== null && typeof value === "object" && typeof value.then === "function") {
      // adopt the other promise's result: this is what flattens chains
      queueJob(() => value.then((v) => this.#resolveWith(v), (e) => this.#settle("rejected", e)));
    } else {
      this.#settle("fulfilled", value);
    }
  }

  #settle(state, value) {
    this.#state = state;
    this.#value = value;
    for (const react of this.#reactions) queueJob(react);
    this.#reactions = [];
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const react = () => {
        const ok = this.#state === "fulfilled";
        const handler = ok ? onFulfilled : onRejected;
        if (typeof handler !== "function") return ok ? resolve(this.#value) : reject(this.#value);
        try {
          resolve(handler(this.#value));
        } catch (err) {
          reject(err);
        }
      };
      if (this.#state === "pending") this.#reactions.push(react);
      else queueJob(react);
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  static resolve(value) {
    return new MyPromise((resolve) => resolve(value));
  }
}

MyPromise.resolve(2)
  .then((v) => v * 3)
  .then((v) => new MyPromise((resolve) => resolve(v + 1))) // returns a promise: adopted
  .then((v) => {
    console.log("value " + v);
    throw new Error("too big");
  })
  .then(() => console.log("skipped: the chain is rejected"))
  .catch((e) => console.log("caught " + e.message))
  .then(() => console.log("recovered"));

console.log("sync code first");
drain();
// try: remove the throw and predict the new output, then check
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "html",
      check: "__logs.join('\\n')",
      title: "سلسلة من ثلاث حلقات",
      prompt: "رتّب الأسطر حتى يُطبع result 7: الوعد يحمل 2، ثم يُضرب في 3، ثم يُضاف 1.",
      lines: [
        "<script>",
        "const p = new Promise((resolve) => resolve(2));",
        "const q = p.then((v) => v * 3);",
        "const r = q.then((v) => v + 1);",
        'r.then((v) => console.log("result " + v));',
        "</script>",
      ],
      expected: "result 7",
    },
    {
      kind: "fill",
      title: "يستقر مرة واحدة",
      prompt: "أكمل شرط الحارس حتى تثبت القيمة الأولى ويتجاهل الوعد أي resolve بعدها.",
      template: `function makePromise() {
  return { state: "pending", value: null };
}
function resolve(p, value) {
  if (___) return;
  p.state = "fulfilled";
  p.value = value;
}
const p = makePromise();
resolve(p, "first");
resolve(p, "second");
console.log(p.value);`,
      options: ['p.state !== "pending"', 'p.state === "pending"', "p.value === null"],
      expected: "first",
    },
    {
      kind: "fix",
      title: "then المتأخرة لا تعمل",
      prompt: "من يسجّل then بعد أن استقر الوعد لا يحصل على شيء: لا يُطبع late 5. أصلح then حتى تعمل في الحالتين.",
      code: `const jobs = [];
function makePromise() {
  return { state: "pending", value: null, waiting: [] };
}
function resolve(p, value) {
  if (p.state !== "pending") return;
  p.state = "fulfilled";
  p.value = value;
  for (const cb of p.waiting) jobs.push(() => cb(value));
}
function then(p, cb) {
  p.waiting.push(cb);
}
const p = makePromise();
resolve(p, 5);
then(p, (v) => console.log("late " + v));
while (jobs.length > 0) jobs.shift()();`,
      expected: "late 5",
      hint: "حين يكون p.state هو fulfilled فلن يُستدعى resolve مرة أخرى، وقائمة waiting لن تُقرأ. في هذه الحالة ضع الدالة في jobs مباشرة مع p.value.",
      solution: `const jobs = [];
function makePromise() {
  return { state: "pending", value: null, waiting: [] };
}
function resolve(p, value) {
  if (p.state !== "pending") return;
  p.state = "fulfilled";
  p.value = value;
  for (const cb of p.waiting) jobs.push(() => cb(value));
}
function then(p, cb) {
  if (p.state === "fulfilled") jobs.push(() => cb(p.value));
  else p.waiting.push(cb);
}
const p = makePromise();
resolve(p, 5);
then(p, (v) => console.log("late " + v));
while (jobs.length > 0) jobs.shift()();`,
    },
    {
      kind: "write",
      title: "then تصنع وعداً جديداً",
      prompt: "اكتب then(p, cb) التي تعيد وعداً جديداً يُحلّ بما تعيده cb، حتى تعمل السلسلة وتطبع 12.",
      starter: `const jobs = [];
function makePromise() {
  return { state: "pending", value: null, waiting: [] };
}
function resolve(p, value) {
  if (p.state !== "pending") return;
  p.state = "fulfilled";
  p.value = value;
  for (const cb of p.waiting) jobs.push(() => cb(value));
}
// write then(p, cb): make a new promise, resolve it with cb's result, return it
// (if p is already fulfilled, queue the work in jobs; otherwise add it to p.waiting)

const start = makePromise();
const doubled = then(start, (v) => v * 2);
then(doubled, (v) => console.log(v));
resolve(start, 6);
while (jobs.length > 0) jobs.shift()();`,
      expected: "12",
      hint: "داخل then: const next = makePromise(); ثم دالة run = (v) => resolve(next, cb(v)). ضع run في jobs أو في p.waiting حسب الحالة، وأعد next.",
      solution: `const jobs = [];
function makePromise() {
  return { state: "pending", value: null, waiting: [] };
}
function resolve(p, value) {
  if (p.state !== "pending") return;
  p.state = "fulfilled";
  p.value = value;
  for (const cb of p.waiting) jobs.push(() => cb(value));
}
function then(p, cb) {
  const next = makePromise();
  const run = (v) => resolve(next, cb(v));
  if (p.state === "fulfilled") jobs.push(() => run(p.value));
  else p.waiting.push(run);
  return next;
}

const start = makePromise();
const doubled = then(start, (v) => v * 2);
then(doubled, (v) => console.log(v));
resolve(start, 6);
while (jobs.length > 0) jobs.shift()();`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع، وبأي ترتيب؟",
      code: 'setTimeout(() => console.log("1"), 0);\nPromise.resolve()\n  .then(() => console.log("2"))\n  .then(() => console.log("3"));\nconsole.log("4");',
      options: ["4 ثم 2 ثم 3 ثم 1", "4 ثم 1 ثم 2 ثم 3", "2 ثم 3 ثم 4 ثم 1"],
      answer: 0,
      why: "4 سطر عادي فيُطبع أولاً. ثم يُفرَّغ طابور الوعود حتى آخره، بما فيه ما يُضاف إليه أثناء التفريغ: 2 تحلّ الوعد التالي فتدخل 3 الطابور نفسه وتعمل قبل أي مؤقّت. ثم 1.",
    },
    {
      question: "ما قيمة p1 === p2؟",
      code: "const p1 = Promise.resolve(5);\nconst p2 = p1.then((v) => v);\nconsole.log(p1 === p2);",
      options: ["false", "true", "خطأ لأن then لا تعيد شيئاً"],
      answer: 0,
      why: "then تصنع كائن وعد جديداً في كل استدعاء وتعيده، حتى لو أعادت الدالة القيمة نفسها. لهذا تستطيع أن تبني سلسلة: كل حلقة وعد مستقل ينتظر الذي قبله.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'Promise.resolve(1)\n  .then((v) => {\n    throw new Error("bad " + v);\n  })\n  .then(() => console.log("A"))\n  .catch((e) => console.log(e.message))\n  .then(() => console.log("B"));',
      options: ["bad 1 ثم B", "A ثم B", "bad 1 فقط"],
      answer: 0,
      why: "الرمي داخل then يرفض الوعد الذي صنعته. then التالية ليس لها دالة رفض، فتمرّر الرفض كما هو دون أن تطبع A. catch تلتقطه وتعيد undefined، فوعدها محلول، والسلسلة تكمل إلى B.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'const p = new Promise((resolve, reject) => {\n  reject(new Error("no"));\n  resolve("yes");\n});\np.then(\n  (v) => console.log("ok " + v),\n  (e) => console.log("fail " + e.message),\n);',
      options: ["fail no", "ok yes", "fail no ثم ok yes"],
      answer: 0,
      why: "الاستقرار الأول هو الأخير: reject جعلت الحالة rejected، فـ resolve تجد الحالة ليست pending وتعود. then تختار دالة الرفض لأن الحالة rejected.",
    },
    {
      question: "دالة then تعيد وعداً آخر يحمل 3. ماذا تستلم الحلقة التالية؟",
      code: "Promise.resolve(1)\n  .then((v) => Promise.resolve(v + 2))\n  .then((x) => console.log(x));",
      options: ["3", "كائن Promise", "undefined"],
      answer: 0,
      why: "حين تُحلّ وعداً بوعد آخر، لا يُخزَّن الوعد كقيمة: يتبنّاه الوعد الأول وينتظره ويأخذ نتيجته. لهذا لا ترى Promise داخل Promise في السلاسل، وتصل 3 كرقم.",
    },
  ],
  next: "js-memory",
};
