import type { Cell, Lesson } from "@/lib/types";

/** The machine as drawers: one call stack, the browser's waiting area, the two queues, and what was printed. */
function drawers(stack: string, web: string, micro: string, tasks: string, printed: string): Cell[] {
  const d = (name: string, value: string): Cell => ({ name, value: value || "—", type: value ? "string" : "none" });
  return [d("call stack", stack), d("Web APIs", web), d("microtasks", micro), d("tasks", tasks), d("console", printed)];
}

export const eventLoop: Lesson = {
  slug: "event-loop",
  stage: 6,
  number: "6.6",
  title: "Event loop",
  subtitle: "مكدّس واحد يفعل شيئاً واحداً في كل لحظة؛ وما ينتهي في الخلفية ينتظر في طابور حتى يفرغ المكدّس",
  minutes: 20,
  problem: {
    title: "لماذا تجمّدت الصفحة؟",
    body: "خطوة خطوة، راقب أين تذهب كل دالة: المكدّس، أم المتصفح، أم أحد الطابورين. ثم اضغط «جمّد الصفحة» وانقر الزر الصغير أثناء التجميد. أين تذهب نقراتك؟",
    demo: "eventLoop",
  },
  singleLanguage: true,
  scene: {
    code: {
      js: `console.log("A");
setTimeout(function () {
  console.log("B");
}, 0);
Promise.resolve().then(function () {
  console.log("C");
});
console.log("D");`,
    },
    steps: [
      {
        line: null,
        say: "خمسة أدراج: مكدّس الاستدعاء (ما يعمل الآن)، ومنطقة انتظار المتصفح، وطابوران للدوال الجاهزة، والشاشة. السكربت كله يدخل المكدّس كدالة واحدة: main.",
        memory: drawers("main", "", "", "", ""),
      },
      {
        line: 1,
        say: "سطر عادي: يعمل فوراً ويطبع A.",
        memory: drawers("main", "", "", "", "A"),
        changed: ["console"],
      },
      {
        line: 2,
        say: "setTimeout لا تنتظر. تسلّم المتصفح مؤقتاً ودالة، وتعود في الحال. المؤقت يعدّ في منطقة المتصفح، لا في JavaScript.",
        memory: drawers("main", "timer 0ms", "", "", "A"),
        changed: ["Web APIs"],
      },
      {
        line: 4,
        say: "0 ملّي ثانية مرّت فوراً. لكن الدالة لا تقفز إلى المكدّس، فهو مشغول بـ main. تنزل إلى طابور المهام tasks وتنتظر.",
        memory: drawers("main", "", "", "fn B", "A"),
        changed: ["Web APIs", "tasks"],
      },
      {
        line: 5,
        say: "الوعد محلول مسبقاً، فدالة then جاهزة. لكنها هي أيضاً لا تعمل الآن: تدخل طابوراً آخر، طابور المهام الصغيرة microtasks.",
        memory: drawers("main", "", "fn C", "fn B", "A"),
        changed: ["microtasks"],
      },
      {
        line: 8,
        say: "السطر الأخير يعمل فوراً ويطبع D. لاحظ: D قبل B مع أن مؤقت B كان صفراً.",
        memory: drawers("main", "", "fn C", "fn B", "A D"),
        changed: ["console"],
      },
      {
        line: null,
        say: "انتهى main وخرج من المكدّس. المكدّس فارغ الآن، وهذه هي اللحظة الوحيدة التي تتحرك فيها حلقة الأحداث (event loop). أول ما تفعله: تفرغ طابور microtasks كله.",
        memory: drawers("", "", "fn C", "fn B", "A D"),
        changed: ["call stack"],
      },
      {
        line: 6,
        say: "دالة C تنتقل من microtasks إلى المكدّس وتعمل، فتطبع C.",
        memory: drawers("fn C", "", "", "fn B", "A D C"),
        changed: ["call stack", "microtasks", "console"],
      },
      {
        line: null,
        say: "انتهت C. المكدّس فارغ وmicrotasks فارغ. الآن فقط تأخذ الحلقة مهمة واحدة من tasks.",
        memory: drawers("", "", "", "fn B", "A D C"),
        changed: ["call stack"],
      },
      {
        line: 3,
        say: "دالة B تصعد إلى المكدّس وتطبع B. كان مؤقتها صفراً، لكنها انتظرت حتى فرغ كل ما قبلها.",
        memory: drawers("fn B", "", "", "", "A D C B"),
        changed: ["call stack", "tasks", "console"],
      },
      {
        line: null,
        say: "كل شيء فارغ. الحلقة تدور وتنتظر: نقرة، أو مؤقت، أو رد من الشبكة. كل واحد منها سيضع دالة في طابور، وتعمل حين يفرغ المكدّس.",
        memory: drawers("", "", "", "", "A D C B"),
        changed: ["call stack"],
      },
    ],
    notes: {
      js: "المتصفح وNode يعملان بنفس الفكرة: مكدّس واحد وحلقة أحداث. queueMicrotask(f)‎ تضع f في microtasks مباشرة، وsetTimeout(f, 0)‎ تضعها في tasks بعد أن ينتهي المؤقت.",
    },
  },
  playground: {
    kind: "html",
    intro: "زر يشغّل سطرين عاديين، ومؤقتاً بصفر، ووعداً. كل سطر يُكتب في القائمة بترتيب تنفيذه الحقيقي. توقّع الترتيب قبل أن تنقر.",
    starter: `<!doctype html>
<html dir="rtl">
<body>
  <button id="go">شغّل</button>
  <ol id="log"></ol>
  <script>
    function log(text) {
      const li = document.createElement("li");
      li.textContent = text;
      document.querySelector("#log").append(li);
      console.log(text);
    }
    document.querySelector("#go").addEventListener("click", () => {
      log("click: start");
      setTimeout(() => log("timeout"), 0);
      Promise.resolve().then(() => log("promise"));
      log("click: end");
    });
    log("script done");
  </script>
</body>
</html>`,
    challenges: [
      "قبل أن تنقر: اكتب على ورقة ترتيب الأسطر الأربعة. ثم انقر وقارن.",
      "غيّر 0 في setTimeout إلى 1000، وانقر الزر ثلاث مرات بسرعة. لماذا تأتي أسطر timeout كلها في النهاية؟",
      "أضف داخل المستمع قبل click: end حلقة تشغل المكدّس ثانيتين: const stop = Date.now() + 2000; while (Date.now() < stop) {} ثم انقر مرتين بسرعة. هل ضاعت النقرة الثانية؟",
      "داخل دالة then، أضف setTimeout(() => log(\"late\"), 0). أين يظهر late بالنسبة إلى timeout؟",
    ],
  },
  predict: [
    {
      question: "ماذا يُطبع؟",
      code: `console.log("1");
setTimeout(() => console.log("2"), 0);
console.log("3");`,
      options: ["1 3 2", "1 2 3", "2 1 3"],
      answer: 0,
      why: "صفر لا يعني «الآن». الدالة تنتظر في طابور المهام، ولا تصعد إلى المكدّس إلا بعد أن ينتهي السكربت كله، أي بعد 3.",
      scene: {
        code: {
          js: `console.log("1");
setTimeout(() => console.log("2"), 0);
console.log("3");`,
        },
        steps: [
          { line: 1, say: "يعمل فوراً: 1.", memory: drawers("main", "", "", "", "1"), changed: ["console"] },
          { line: 2, say: "المؤقت ينتهي فوراً، لكن الدالة تنتظر في tasks لأن المكدّس مشغول.", memory: drawers("main", "", "", "fn 2", "1"), changed: ["tasks"] },
          { line: 3, say: "يعمل فوراً: 3.", memory: drawers("main", "", "", "fn 2", "1 3"), changed: ["console"] },
          { line: null, say: "انتهى السكربت، فرغ المكدّس.", memory: drawers("", "", "", "fn 2", "1 3"), changed: ["call stack"] },
          { line: 2, say: "الحلقة تنقل الدالة من tasks إلى المكدّس: 2.", memory: drawers("fn 2", "", "", "", "1 3 2"), changed: ["call stack", "tasks", "console"] },
        ],
      },
    },
    {
      question: "مؤقت بصفر سُجّل أولاً، ثم وعد. ماذا يُطبع؟",
      code: `setTimeout(() => console.log("timeout"), 0);
Promise.resolve().then(() => console.log("promise"));
console.log("sync");`,
      options: ["sync promise timeout", "sync timeout promise", "timeout promise sync"],
      answer: 0,
      why: "sync أولاً لأنه في المكدّس الآن. وحين يفرغ المكدّس، تفرغ الحلقة طابور microtasks كله قبل أن تأخذ أي مهمة من tasks، مهما كان ترتيب التسجيل.",
      scene: {
        code: {
          js: `setTimeout(() => console.log("timeout"), 0);
Promise.resolve().then(() => console.log("promise"));
console.log("sync");`,
        },
        steps: [
          { line: 1, say: "دالة timeout إلى tasks.", memory: drawers("main", "", "", "fn timeout", ""), changed: ["tasks"] },
          { line: 2, say: "دالة promise إلى microtasks.", memory: drawers("main", "", "fn promise", "fn timeout", ""), changed: ["microtasks"] },
          { line: 3, say: "يعمل فوراً: sync.", memory: drawers("main", "", "fn promise", "fn timeout", "sync"), changed: ["console"] },
          { line: 2, say: "المكدّس فرغ. microtasks أولاً: promise.", memory: drawers("fn promise", "", "", "fn timeout", "sync promise"), changed: ["call stack", "microtasks", "console"] },
          { line: 1, say: "microtasks فارغ، فالآن مهمة من tasks: timeout.", memory: drawers("fn timeout", "", "", "", "sync promise timeout"), changed: ["call stack", "tasks", "console"] },
        ],
      },
    },
    {
      question: "متى يُطبع timer؟",
      code: `setTimeout(() => console.log("timer"), 0);
const stop = Date.now() + 3000;
while (Date.now() < stop) {}
console.log("loop done");`,
      options: ["بعد نحو 3 ثوانٍ، بعد loop done", "فوراً، قبل أن تبدأ الحلقة", "في منتصف الحلقة، حين ينتهي المؤقت"],
      answer: 0,
      why: "المؤقت ينتهي فوراً، لكن دالته تنتظر في tasks، ولا شيء يقاطع المكدّس. الحلقة تحتل المكدّس 3 ثوانٍ، وخلالها لا ترسم الصفحة ولا تستجيب للنقرات: إنها متجمّدة.",
      scene: {
        code: {
          js: `setTimeout(() => console.log("timer"), 0);
const stop = Date.now() + 3000;
while (Date.now() < stop) {}
console.log("loop done");`,
        },
        steps: [
          { line: 1, say: "دالة timer تنتظر في tasks.", memory: drawers("main", "", "", "fn timer", ""), changed: ["tasks"] },
          { line: 3, say: "الحلقة تدور 3 ثوانٍ والمكدّس مشغول. لا شيء آخر يمكن أن يعمل، ولا حتى رسم الصفحة.", memory: drawers("main", "", "", "fn timer", ""), read: ["call stack"] },
          { line: 3, say: "نقرة من المستخدم أثناء الحلقة؟ تُحفظ في tasks خلف timer، ولا تُخدم.", memory: drawers("main", "", "", "timer, click", ""), changed: ["tasks"] },
          { line: 4, say: "انتهت الحلقة: loop done.", memory: drawers("main", "", "", "timer, click", "loop done"), changed: ["console"] },
          { line: 1, say: "فرغ المكدّس أخيراً، فتعمل timer، ثم دالة النقرة بعدها.", memory: drawers("fn timer", "", "", "click", "loop done timer"), changed: ["call stack", "tasks", "console"] },
        ],
      },
    },
  ],
  code: {
    intro: "صفحة فيها زران. «Ping» يزيد عدّاداً. «Freeze» يشغل المكدّس ثانيتين بحلقة. اضغط Freeze ثم Ping ثلاث مرات بسرعة: لا يتحرك العدّاد أثناء التجميد، ثم يقفز 3 دفعة واحدة، لأن النقرات انتظرت في الطابور. وفي الكونسول، ترتيب sync ثم promise ثم timeout.",
    runnerLang: "html",
    runnerStarter: `<!doctype html>
<html dir="rtl">
<body>
  <button id="freeze">Freeze 2s</button>
  <button id="ping">Ping</button>
  <p id="count">pings: 0</p>
  <script>
    let pings = 0;
    document.querySelector("#ping").addEventListener("click", () => {
      pings = pings + 1;
      document.querySelector("#count").textContent = "pings: " + pings;
    });
    document.querySelector("#freeze").addEventListener("click", () => {
      const stop = Date.now() + 2000;
      while (Date.now() < stop) {} // the stack is busy: nothing else can run
    });

    setTimeout(() => console.log("timeout"), 0);
    Promise.resolve().then(() => console.log("promise"));
    console.log("sync");
    // Try: wrap the while loop in setTimeout(() => { ... }, 0). Does Ping still wait?
  </script>
</body>
</html>`,
  },
  exercises: [
    {
      kind: "order",
      title: "A B C D",
      lang: "html",
      prompt: "رتّب الأسطر حتى تطبع الصفحة A ثم B ثم C ثم D.",
      lines: [
        "<script>",
        'console.log("A");',
        'setTimeout(() => console.log("D"), 0);',
        'Promise.resolve().then(() => console.log("C"));',
        'console.log("B");',
        "</script>",
      ],
      check: '__logs.join("\\n")',
      expected: "A\nB\nC\nD",
    },
    {
      kind: "fill",
      title: "قبل المؤقت",
      lang: "html",
      prompt: "أي استدعاء يجعل first يُطبع بعد sync مباشرة، وقبل timer؟",
      template: `<script>
  setTimeout(() => console.log("timer"), 0);
  ___(() => console.log("first"));
  console.log("sync");
</script>`,
      options: ["Promise.resolve().then", "setTimeout", "console.log"],
      check: '__logs.join("\\n")',
      expected: "sync\nfirst\ntimer",
    },
    {
      kind: "fix",
      title: "الاسم الذي لم يصل",
      lang: "html",
      prompt: "الاسم Sara يصل بعد مؤقت، لكن الفقرة تعرض none. أصلح البرنامج حتى تعرض الفقرة Sara.",
      code: `<p id="out">?</p>
<script>
  let user = "none";
  setTimeout(() => {
    user = "Sara";
  }, 0);
  document.querySelector("#out").textContent = user;
</script>`,
      check: 'document.querySelector("#out").textContent',
      expected: "Sara",
      hint: "السطر الأخير يعمل والمكدّس ما زال في main، قبل أن تعمل دالة المؤقت. انقل كتابة الفقرة إلى داخل دالة المؤقت، بعد user = \"Sara\".",
      solution: `<p id="out">?</p>
<script>
  let user = "none";
  setTimeout(() => {
    user = "Sara";
    document.querySelector("#out").textContent = user;
  }, 0);
</script>`,
    },
    {
      kind: "write",
      title: "ثلاثة طوابير",
      lang: "html",
      prompt: "أضف فوق سطر sync: مؤقتاً بصفر يطبع task، ووعداً محلولاً يطبع micro، بحيث تطبع الصفحة sync ثم micro ثم task.",
      starter: `<script>
  // add one setTimeout and one Promise.resolve().then here

  console.log("sync");
</script>`,
      check: '__logs.join("\\n")',
      expected: "sync\nmicro\ntask",
      hint: 'setTimeout(() => console.log("task"), 0);  و  Promise.resolve().then(() => console.log("micro"));',
      solution: `<script>
  setTimeout(() => console.log("task"), 0);
  Promise.resolve().then(() => console.log("micro"));
  console.log("sync");
</script>`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع؟",
      code: `setTimeout(() => console.log("A"), 0);
console.log("B");
setTimeout(() => console.log("C"), 0);
console.log("D");`,
      options: ["B D A C", "A B C D", "B D C A"],
      answer: 0,
      why: "B وD في المكدّس الآن فيعملان أولاً. A وC تنتظران في طابور tasks بترتيب دخولهما، والطابور يُخدم من أوله: A ثم C.",
    },
    {
      question: "مستمع نقرة يشغّل حلقة تستغرق 5 ثوانٍ. نقر المستخدم زراً آخر في الثانية الثانية. ماذا يحدث لتلك النقرة؟",
      options: [
        "تنتظر في الطابور، ويعمل مستمعها بعد انتهاء الحلقة",
        "تضيع ولا يعمل مستمعها أبداً",
        "تتوقف الحلقة لحظة ليعمل مستمعها ثم تكمل",
      ],
      answer: 0,
      why: "لا شيء يقاطع دالة في المكدّس. المتصفح يسجّل النقرة ويضع دالتها في tasks، والحلقة لا تأخذها حتى يفرغ المكدّس. لذلك تبدو الصفحة متجمّدة ثم «تلحق» دفعة واحدة.",
    },
    {
      question: "ماذا يُطبع؟",
      code: `setTimeout(() => console.log("t"), 0);
Promise.resolve()
  .then(() => console.log("p1"))
  .then(() => console.log("p2"));
console.log("s");`,
      options: ["s p1 p2 t", "s p1 t p2", "s t p1 p2"],
      answer: 0,
      why: "حين تنتهي p1 تضع p2 في microtasks. والحلقة تفرغ microtasks كله، حتى ما أُضيف أثناء التفريغ، قبل أن تلمس tasks. فـ t آخراً.",
    },
    {
      question: "setTimeout(f, 1000) سُجّل، ثم شغل كود المكدّس 3 ثوانٍ متواصلة. متى تعمل f؟",
      options: ["بعد نحو 3 ثوانٍ، حين يفرغ المكدّس", "بعد ثانية بالضبط", "لا تعمل أبداً لأن وقتها فات"],
      answer: 0,
      why: "بعد ثانية ينتهي المؤقت وتنزل f إلى tasks، لكنها تنتظر هناك حتى يفرغ المكدّس. الرقم في setTimeout حدّ أدنى للانتظار، لا موعد مضمون.",
    },
    {
      question: "ماذا يُطبع؟",
      code: `function a() {
  console.log("a");
  b();
}
function b() {
  setTimeout(() => console.log("x"), 0);
  console.log("b");
}
a();
console.log("end");`,
      options: ["a b end x", "a x b end", "a b x end"],
      answer: 0,
      why: "a ثم b تُستدعيان في المكدّس فوق main. دالة x تذهب إلى tasks، ولا تصعد حتى تخرج b ثم a ثم يكمل main ويطبع end ويخرج.",
    },
  ],
  next: "async",
};
