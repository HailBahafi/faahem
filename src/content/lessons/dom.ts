import type { HeapObj, Lesson, Slot, Step } from "@/lib/types";

// The scene's page: the HTML file never changes; the tree (heap) and the screen (output) do.
const PAGE = `<h1>Hello</h1>
<ul><li>Bread</li></ul>
<p class="ad">Sale!</p>
<script>
  const title = document.querySelector("h1");
  title.textContent = "Welcome";
  title.classList.add("big");
  const li = document.createElement("li");
  li.textContent = "Milk";
  document.querySelector("ul").append(li);
  document.querySelector(".ad").remove();
</script>`;

const s = (name: string, value: string): Slot => ({ name, value, type: "string" });
const r = (name: string, ref: number): Slot => ({ name, value: "", type: "ref", ref });

// Builds the DOM tree as heap cards for one moment of the scene.
function tree(o: { h1: string; big?: boolean; milk?: "none" | "loose" | "empty" | "in"; ad?: boolean }): HeapObj[] {
  const bodyKids = [r("[0]", 2), r("[1]", 3)];
  if (o.ad !== false) bodyKids.push(r("[2]", 5));
  const ulKids = [r("[0]", 4)];
  if (o.milk === "in") ulKids.push(r("[1]", 6));
  const heap: HeapObj[] = [
    { id: 1, kind: "object", items: [s("tag", '"body"'), ...bodyKids] },
    { id: 2, kind: "object", items: [s("tag", '"h1"'), s("textContent", `"${o.h1}"`), ...(o.big ? [s("className", '"big"')] : [])] },
    { id: 3, kind: "object", items: [s("tag", '"ul"'), ...ulKids] },
    { id: 4, kind: "object", items: [s("tag", '"li"'), s("textContent", '"Bread"')] },
  ];
  if (o.ad !== false) heap.push({ id: 5, kind: "object", items: [s("tag", '"p"'), s("className", '"ad"'), s("textContent", '"Sale!"')] });
  if (o.milk && o.milk !== "none") heap.push({ id: 6, kind: "object", items: [s("tag", '"li"'), s("textContent", o.milk === "empty" ? '""' : '"Milk"')] });
  return heap;
}

const frame = (vars: Slot[]) => [{ id: 0, name: "global", vars }];

const steps: Step[] = [
  {
    line: null,
    say: "قرأ المتصفح ملف HTML من الأعلى، وبنى منه شجرة كائنات: body وأبناؤه h1 و ul (وفيه li) و p. هذه الشجرة هي الـ DOM، وهي ما يُرسم على الشاشة.",
    memory: [],
    frames: frame([]),
    heap: tree({ h1: "Hello" }),
    output: ["# Hello", "  • Bread", "Sale!"],
  },
  {
    line: 4,
    say: "وصل المتصفح إلى <script>. كل ما فوقه صار عقداً في الشجرة، فالكود يستطيع الوصول إليه.",
    memory: [],
    frames: frame([]),
    heap: tree({ h1: "Hello" }),
    output: ["# Hello", "  • Bread", "Sale!"],
  },
  {
    line: 5,
    say: "querySelector يبحث في الشجرة عن أول h1 ويعيد سهماً إليه. title ليس نسخة من العنوان: هو سهم إلى العقدة نفسها.",
    memory: [],
    frames: frame([r("title", 2)]),
    heap: tree({ h1: "Hello" }),
    changed: ["title"],
    output: ["# Hello", "  • Bread", "Sale!"],
  },
  {
    line: 6,
    say: "نتبع السهم ونكتب في درج textContent للعقدة. العقدة تغيّرت، فتغيّرت الشاشة فوراً. أما السطر 1 في الملف فما زال يقول Hello.",
    memory: [],
    frames: frame([r("title", 2)]),
    heap: tree({ h1: "Welcome" }),
    read: ["title"],
    changedHeap: [2],
    output: ["# Welcome", "  • Bread", "Sale!"],
  },
  {
    line: 7,
    say: "classList.add يضيف الصنف big إلى العقدة نفسها. أي قاعدة CSS مكتوبة لـ .big تنطبق عليها الآن.",
    memory: [],
    frames: frame([r("title", 2)]),
    heap: tree({ h1: "Welcome", big: true }),
    read: ["title"],
    changedHeap: [2],
    output: ["# Welcome  (.big)", "  • Bread", "Sale!"],
  },
  {
    line: 8,
    say: "createElement يصنع عقدة li جديدة على الكومة، و li سهم إليها. لكن لا أحد في الشجرة يشير إليها، فهي ليست على الشاشة.",
    memory: [],
    frames: frame([r("title", 2), r("li", 6)]),
    heap: tree({ h1: "Welcome", big: true, milk: "empty" }),
    changed: ["li"],
    changedHeap: [6],
    output: ["# Welcome  (.big)", "  • Bread", "Sale!"],
  },
  {
    line: 9,
    say: "نكتب Milk في العقدة الجديدة. ما زالت خارج الشجرة، فالشاشة لم تتغيّر.",
    memory: [],
    frames: frame([r("title", 2), r("li", 6)]),
    heap: tree({ h1: "Welcome", big: true, milk: "loose" }),
    read: ["li"],
    changedHeap: [6],
    output: ["# Welcome  (.big)", "  • Bread", "Sale!"],
  },
  {
    line: 10,
    say: "append يضيف سهماً من ul إلى العقدة الجديدة. صارت جزءاً من الشجرة، فظهرت على الشاشة تحت Bread.",
    memory: [],
    frames: frame([r("title", 2), r("li", 6)]),
    heap: tree({ h1: "Welcome", big: true, milk: "in" }),
    read: ["li"],
    changedHeap: [3],
    output: ["# Welcome  (.big)", "  • Bread", "  • Milk", "Sale!"],
  },
  {
    line: 11,
    say: "remove يقطع السهم من body إلى p. عقدة لا يصل إليها أحد تختفي من الشجرة ومن الشاشة.",
    memory: [],
    frames: frame([r("title", 2), r("li", 6)]),
    heap: tree({ h1: "Welcome", big: true, milk: "in", ad: false }),
    changedHeap: [1],
    output: ["# Welcome  (.big)", "  • Bread", "  • Milk"],
  },
  {
    line: 12,
    say: "انتهى السكربت. الملف ما زال Hello و Bread و Sale!، والشاشة تعرض الشجرة كما هي الآن. لو أعدت تحميل الصفحة، يُبنى الـ DOM من الملف من جديد.",
    memory: [],
    frames: frame([r("title", 2), r("li", 6)]),
    heap: tree({ h1: "Welcome", big: true, milk: "in", ad: false }),
    output: ["# Welcome  (.big)", "  • Bread", "  • Milk"],
  },
];

export const dom: Lesson = {
  slug: "dom",
  stage: 6,
  number: "6.4",
  title: "DOM",
  subtitle: "شجرة حيّة من الكائنات، و JavaScript يمسك أسهماً إليها",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "الصفحة تتغيّر والملف لا يتغيّر",
    body: "على اليسار الشجرة التي بناها المتصفح من ملف HTML، وعلى اليمين الصفحة المعروضة. اضغط أوامر JavaScript، وراقب العقدة نفسها تتغيّر في الشجرة وفي الصفحة معاً.",
    demo: "dom",
  },
  scene: {
    code: { html: PAGE },
    notes: {
      html: "ملف HTML نقطة البداية فقط: لا يتغيّر سطر منه أثناء العرض. ما تراه على الشاشة هو الـ DOM، شجرة كائنات على الكومة، والمتغيّرات في JavaScript تحمل أسهماً إلى عقدها كما في درس المراجع.",
    },
    steps,
  },
  playground: {
    kind: "html",
    intro: "صفحة صغيرة وسكربت يغيّرها بعد أن تُبنى. عدّل السكربت وشغّل: كل سطر يمسك عقدة بسهم ثم يغيّرها، والمعاينة تعرض الشجرة كما صارت.",
    starter: `<!doctype html>
<html dir="rtl">
<head>
<style>
  body { font-family: sans-serif; }
  .big { font-size: 40px; }
  .done { text-decoration: line-through; color: gray; }
</style>
</head>
<body>
  <h1>قائمة اليوم</h1>
  <ul id="tasks">
    <li>اقرأ</li>
    <li>اكتب كوداً</li>
  </ul>
  <p class="ad">إعلان</p>
  <script>
    const title = document.querySelector("h1");
    title.classList.add("big");
    const first = document.querySelector("#tasks li");
    first.classList.add("done");
    console.log(document.querySelectorAll("li").length);
  </script>
</body>
</html>`,
    challenges: [
      "اجعل لون العنوان أخضر بالسطر title.style.color = \"green\"; ثم أعد التحميل. هل تغيّر ملف HTML؟",
      "أنشئ li جديداً بـ createElement واكتب فيه نصاً، لكن لا تضفه. هل يظهر؟ كم يطبع console.log؟",
      "الآن أضفه بـ document.querySelector(\"#tasks\").append(...) قبل console.log. كم يطبع الآن؟",
      "احذف الإعلان بسطر واحد: document.querySelector(\".ad\").remove();",
    ],
  },
  predict: [
    {
      question: "ماذا يُطبع؟",
      code: `<p id="msg">Hi</p>
<script>
  const a = document.querySelector("#msg");
  const b = document.querySelector("#msg");
  a.textContent = "Bye";
  console.log(b.textContent);
</script>`,
      options: ["Bye", "Hi", "HiBye"],
      answer: 0,
      why: "querySelector لا ينسخ العقدة: يعيد سهماً إليها. a و b سهمان إلى العقدة نفسها، فالكتابة عبر a تُقرأ عبر b.",
      scene: {
        code: {
          html: `<p id="msg">Hi</p>
<script>
  const a = document.querySelector("#msg");
  const b = document.querySelector("#msg");
  a.textContent = "Bye";
  console.log(b.textContent);
</script>`,
        },
        steps: [
          { line: 3, say: "a سهم إلى عقدة p في الشجرة.", memory: [], frames: frame([r("a", 1)]), heap: [{ id: 1, kind: "object", items: [s("tag", '"p"'), s("textContent", '"Hi"')] }], changed: ["a"] },
          { line: 4, say: "b يبحث في الشجرة نفسها فيجد العقدة نفسها: سهم ثانٍ، لا نسخة ثانية.", memory: [], frames: frame([r("a", 1), r("b", 1)]), heap: [{ id: 1, kind: "object", items: [s("tag", '"p"'), s("textContent", '"Hi"')] }], changed: ["b"] },
          { line: 5, say: "نكتب Bye عبر a في العقدة الوحيدة.", memory: [], frames: frame([r("a", 1), r("b", 1)]), heap: [{ id: 1, kind: "object", items: [s("tag", '"p"'), s("textContent", '"Bye"')] }], read: ["a"], changedHeap: [1] },
          { line: 6, say: "b يتبع سهمه إلى العقدة نفسها فيقرأ Bye.", memory: [], frames: frame([r("a", 1), r("b", 1)]), heap: [{ id: 1, kind: "object", items: [s("tag", '"p"'), s("textContent", '"Bye"')] }], read: ["b"], output: ["Bye"] },
        ],
      },
    },
    {
      question: "ماذا يُطبع؟",
      code: `<ul><li>A</li></ul>
<script>
  const li = document.createElement("li");
  li.textContent = "B";
  console.log(document.querySelectorAll("li").length);
</script>`,
      options: ["1", "2", "0"],
      answer: 0,
      why: "createElement يصنع عقدة على الكومة فقط. لم نضفها بـ append، فلا يشير إليها أحد في الشجرة، و querySelectorAll يبحث في الشجرة وحدها.",
      scene: {
        code: {
          html: `<ul><li>A</li></ul>
<script>
  const li = document.createElement("li");
  li.textContent = "B";
  console.log(document.querySelectorAll("li").length);
</script>`,
        },
        steps: [
          { line: 1, say: "الشجرة: ul وفيه li واحد.", memory: [], frames: frame([]), heap: [{ id: 1, kind: "object", items: [s("tag", '"ul"'), r("[0]", 2)] }, { id: 2, kind: "object", items: [s("tag", '"li"'), s("textContent", '"A"')] }] },
          { line: 3, say: "عقدة li جديدة على الكومة، لا يشير إليها إلا المتغيّر li.", memory: [], frames: frame([r("li", 3)]), heap: [{ id: 1, kind: "object", items: [s("tag", '"ul"'), r("[0]", 2)] }, { id: 2, kind: "object", items: [s("tag", '"li"'), s("textContent", '"A"')] }, { id: 3, kind: "object", items: [s("tag", '"li"'), s("textContent", '""')] }], changed: ["li"], changedHeap: [3] },
          { line: 4, say: "نكتب B فيها. ما زالت خارج الشجرة.", memory: [], frames: frame([r("li", 3)]), heap: [{ id: 1, kind: "object", items: [s("tag", '"ul"'), r("[0]", 2)] }, { id: 2, kind: "object", items: [s("tag", '"li"'), s("textContent", '"A"')] }, { id: 3, kind: "object", items: [s("tag", '"li"'), s("textContent", '"B"')] }], changedHeap: [3] },
          { line: 5, say: "البحث يمشي في الشجرة من الجذر: يجد li واحداً فقط.", memory: [], frames: frame([r("li", 3)]), heap: [{ id: 1, kind: "object", items: [s("tag", '"ul"'), r("[0]", 2)] }, { id: 2, kind: "object", items: [s("tag", '"li"'), s("textContent", '"A"')] }, { id: 3, kind: "object", items: [s("tag", '"li"'), s("textContent", '"B"')] }], output: ["1"] },
        ],
      },
    },
    {
      question: "ماذا يُطبع؟",
      code: `<script>
  const t = document.querySelector("h1");
  console.log(t);
</script>
<h1>Hello</h1>`,
      options: ["null", "Hello", "<h1>Hello</h1>"],
      answer: 0,
      why: "المتصفح يبني الشجرة وهو يقرأ الملف من الأعلى، ويشغّل السكربت لحظة يصل إليه. عندها لم يُبنَ h1 بعد، فلا يجد البحث شيئاً: null.",
      scene: {
        code: {
          html: `<script>
  const t = document.querySelector("h1");
  console.log(t);
</script>
<h1>Hello</h1>`,
        },
        steps: [
          { line: 1, say: "المتصفح بدأ القراءة. الشجرة فيها body فارغ، وهذا أول سطر: سكربت.", memory: [], frames: frame([]), heap: [{ id: 1, kind: "object", items: [s("tag", '"body"')] }] },
          { line: 2, say: "البحث عن h1 في الشجرة الآن: لا يوجد. t لا يحمل سهماً، يحمل null.", memory: [], frames: frame([{ name: "t", value: "null", type: "none" }]), heap: [{ id: 1, kind: "object", items: [s("tag", '"body"')] }], changed: ["t"] },
          { line: 3, say: "يُطبع null.", memory: [], frames: frame([{ name: "t", value: "null", type: "none" }]), heap: [{ id: 1, kind: "object", items: [s("tag", '"body"')] }], output: ["null"] },
          { line: 5, say: "الآن فقط يُبنى h1، بعد أن انتهى السكربت. لذلك نضع السكربت في آخر الصفحة.", memory: [], frames: frame([{ name: "t", value: "null", type: "none" }]), heap: [{ id: 1, kind: "object", items: [s("tag", '"body"'), r("[0]", 2)] }, { id: 2, kind: "object", items: [s("tag", '"h1"'), s("textContent", '"Hello"')] }], changedHeap: [1, 2], output: ["null"] },
        ],
      },
    },
  ],
  code: {
    intro: "أربع حركات تكفي لأغلب العمل: ابحث بـ querySelector، غيّر بـ textContent و classList و style و setAttribute، أنشئ بـ createElement ثم append، واحذف بـ remove. والحلقة على مصفوفة مع createElement تبني قائمة كاملة من البيانات. في الدرس القادم: كيف نشغّل هذا الكود عندما يضغط المستخدم زراً؟",
    runnerLang: "html",
    runnerStarter: `<!doctype html>
<html dir="rtl">
<body>
  <h2 id="count"></h2>
  <ul id="products"></ul>
  <script>
    const products = ["Pen", "Book", "Bag"];
    const list = document.querySelector("#products");
    for (const name of products) {
      const li = document.createElement("li");
      li.textContent = name;
      list.append(li);
    }
    document.querySelector("#count").textContent = "Items: " + list.children.length;
    console.log(list.innerHTML);
    // جرّب: أضف "Cup" إلى المصفوفة، أو اجعل كل li باللون الأزرق بـ li.style.color
  </script>
</body>
</html>`,
  },
  exercises: [
    {
      kind: "order",
      lang: "html",
      title: "أضف إلى السلة",
      prompt: "رتّب الأسطر حتى يظهر عنصر Milk داخل السلة.",
      lines: [
        '<ul id="cart"></ul>',
        "<script>",
        '  const li = document.createElement("li");',
        '  li.textContent = "Milk";',
        '  document.querySelector("#cart").append(li);',
        "</script>",
      ],
      check: 'document.querySelector("#cart").innerHTML',
      expected: "<li>Milk</li>",
    },
    {
      kind: "fill",
      lang: "html",
      title: "غيّر العنوان",
      prompt: "أي درج في العقدة يغيّر النص الظاهر في العنوان إلى Welcome؟",
      template: `<h1>Hello</h1>
<script>
  document.querySelector("h1").___ = "Welcome";
</script>`,
      options: ["textContent", "tagName", "value"],
      check: 'document.querySelector("h1").textContent',
      expected: "Welcome",
    },
    {
      kind: "fix",
      lang: "html",
      title: "العنصر لا يظهر",
      prompt: "صنعنا li جديداً وكتبنا فيه Milk، لكن القائمة ما زالت فيها عنصر واحد. ما الناقص؟",
      code: `<ul id="list"><li>Bread</li></ul>
<script>
  const li = document.createElement("li");
  li.textContent = "Milk";
</script>`,
      check: 'document.querySelectorAll("#list li").length',
      expected: "2",
      hint: "العقدة موجودة على الكومة، لكن لا سهم إليها من الشجرة. اربطها بالأب: document.querySelector(\"#list\").append(li).",
      solution: `<ul id="list"><li>Bread</li></ul>
<script>
  const li = document.createElement("li");
  li.textContent = "Milk";
  document.querySelector("#list").append(li);
</script>`,
    },
    {
      kind: "write",
      lang: "html",
      title: "رتّب الصفحة",
      prompt: "بسكربت واحد: احذف الإعلان .ad، وأضف مهمة ثالثة Sleep إلى #tasks، ثم اكتب في #count عدد عناصر li في القائمة.",
      starter: `<h2 id="count">0</h2>
<ul id="tasks"><li>Read</li><li>Code</li></ul>
<p class="ad">Buy now!</p>
<script>
  // اكتب الكود هنا
</script>`,
      check: '[document.querySelectorAll(".ad").length, document.querySelector("#count").textContent, document.querySelectorAll("#tasks li").length].join(" ")',
      expected: "0 3 3",
      hint: "remove() للإعلان، ثم createElement و append للمهمة، ثم اقرأ document.querySelectorAll(\"#tasks li\").length واكتبه في textContent.",
      solution: `<h2 id="count">0</h2>
<ul id="tasks"><li>Read</li><li>Code</li></ul>
<p class="ad">Buy now!</p>
<script>
  document.querySelector(".ad").remove();
  const li = document.createElement("li");
  li.textContent = "Sleep";
  document.querySelector("#tasks").append(li);
  document.querySelector("#count").textContent = document.querySelectorAll("#tasks li").length;
</script>`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع؟",
      code: '<div class="box"></div>\n<script>\n  const el = document.querySelector(".box");\n  el.classList.add("on");\n  el.classList.add("on");\n  console.log(el.className);\n</script>',
      options: ["box on", "box on on", "on"],
      answer: 0,
      why: "classList مجموعة أصناف على العقدة: الإضافة الثانية لصنف موجود لا تفعل شيئاً، والصنف القديم box يبقى.",
    },
    {
      question: "ماذا يُطبع؟",
      code: '<ul><li>A</li><li>B</li><li>C</li></ul>\n<script>\n  const ul = document.querySelector("ul");\n  ul.append(document.createElement("li"));\n  document.querySelector("li").remove();\n  console.log(ul.children.length);\n</script>',
      options: ["3", "4", "2"],
      answer: 0,
      why: "ثلاثة في الشجرة، append يضيف رابعاً، و remove يقطع أول li (A). يبقى ثلاثة أبناء.",
    },
    {
      question: "سكربت غيّر العنوان إلى Welcome، ثم أعاد المستخدم تحميل الصفحة. ماذا يظهر؟",
      code: '<h1>Hello</h1>\n<script>\n  // runs later, after a click:\n  // document.querySelector("h1").textContent = "Welcome";\n</script>',
      options: ["Hello", "Welcome", "صفحة فارغة"],
      answer: 0,
      why: "السكربت غيّر الشجرة في الذاكرة، لا ملف HTML. إعادة التحميل تبني الـ DOM من الملف من جديد، والملف يقول Hello.",
    },
    {
      question: "كم li في القائمة بعد هذا الكود؟",
      code: '<ul id="list"></ul>\n<script>\n  const list = document.querySelector("#list");\n  const li = document.createElement("li");\n  list.append(li);\n  list.append(li);\n  console.log(list.children.length);\n</script>',
      options: ["1", "2", "0"],
      answer: 0,
      why: "createElement صنع عقدة واحدة، و li سهم إليها. append الثاني يضيف العقدة نفسها، والعقدة لا تقف في مكانين، فتبقى واحدة.",
    },
    {
      question: "ماذا يُطبع؟",
      code: '<p id="t">Hi</p>\n<script>\n  const p = document.querySelector("#t");\n  p.style.color = "red";\n  console.log(p.getAttribute("style"));\n</script>',
      options: ["color: red;", "null", "red"],
      answer: 0,
      why: "style يكتب في سمة style للعقدة نفسها. الملف لا يتغيّر، لكن العقدة في الشجرة صارت تحمل style=\"color: red;\".",
    },
  ],
  next: "events",
};
