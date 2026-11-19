import type { Cell, Lesson } from "@/lib/types";

const node = (name: string, value: string): Cell => ({ name, value, type: value.startsWith('"') ? "string" : "none" });

const tree = [
  node("html", "—"),
  node("html › body", "—"),
  node("body › h1", '"Shop"'),
  node("body › p", '"Open "'),
  node("p › b", '"now"'),
  node("body › button", '"Buy"'),
];

export const browser: Lesson = {
  slug: "browser",
  stage: 5,
  number: "5.4",
  title: "كيف يرسم المتصفح الصفحة",
  subtitle: "من نص HTML إلى بكسلات: خط إنتاج من خمس محطات",
  minutes: 15,
  singleLanguage: true,
  problem: {
    title: "نص يصير صورة",
    body: "الخادم أرسل نصاً فيه وسوم مثل <h1>. لكن الشاشة لا تعرف إلا البكسلات. اضغط «الخطوة التالية» وراقب المتصفح وهو يحوّل النص إلى شجرة، ثم إلى صناديق، ثم إلى ألوان. ثم غيّر الصفحة بـ JavaScript.",
    demo: "browser",
  },
  scene: {
    code: {
      html: `<html>
  <body>
    <h1>Shop</h1>
    <p class="note">Open <b>now</b></p>
    <button>Buy</button>
  </body>
</html>`,
      css: `/* style.css */
body { margin: 16px; }
h1 { color: teal; }
.note { color: gray; }
button { padding: 8px; }

`,
    },
    notes: {
      html: "المحلّل يقرأ الوسوم من الأعلى إلى الأسفل، وكل وسم يُفتح داخل وسم آخر يصير ابناً له في الشجرة.",
      css: "قاعدة CSS لا تُكتب على عنصر بعينه: المتصفح يبحث في الشجرة عن كل عقدة تطابق المحدِّد (h1 أو .note) ويعطيها الخاصية.",
    },
    steps: [
      { line: null, say: "جسم ردّ HTTP وصل، و Content-Type يقول text/html. بالنسبة للمتصفح هذا الآن مجرد حروف. المحطة الأولى: التحليل، أي قراءة الوسوم وبناء شجرة.", memory: [] },
      { line: 1, say: "<html> تصنع العقدة الأولى: جذر الشجرة. كل ما يأتي بعدها سيكون بداخلها.", memory: tree.slice(0, 1), changed: ["html"] },
      { line: 2, say: "<body> فُتح قبل أن يُغلق html، فصار ابناً له.", memory: tree.slice(0, 2), changed: ["html › body"] },
      { line: 3, say: "<h1> ابن body، والنص Shop بداخله. </h1> أغلقته، فالعقدة التالية لن تكون بداخله بل أختاً له.", memory: tree.slice(0, 3), changed: ["body › h1"] },
      { line: 4, say: "<p> أخت لـ h1 وابن body. و <b> فُتح داخل p قبل أن يُغلق، فصار حفيداً لـ body. هذه شجرة كما في درس الشجرة.", memory: tree.slice(0, 5), changed: ["body › p", "p › b"] },
      { line: 5, say: "<button> ابن ثالث لـ body. ثم أُغلق كل شيء في السطرين 6 و 7: الشجرة اكتملت. اسمها DOM.", memory: tree, changed: ["body › button"] },
      { line: 3, say: "المحطة الثانية: الأنماط. المتصفح نزّل style.css ويطابق كل قاعدة مع العقد: h1 لونه teal، و .note تجعل p رمادياً. و b لا قاعدة له، فيرث لون أبيه p.", memory: [tree[0], tree[1], node("body › h1", '"Shop" teal'), node("body › p", '"Open " gray'), node("p › b", '"now" gray'), tree[5]], changed: ["body › h1", "body › p", "p › b"] },
      { line: 2, say: "المحطة الثالثة: التخطيط. body عرضه عرض النافذة ناقص 16px من كل جانب. h1 و p و button صناديق تُرصّ تحت بعضها، و b يجري داخل سطر p.", memory: [tree[0], tree[1], node("body › h1", '"Shop" teal'), node("body › p", '"Open " gray'), node("p › b", '"now" gray'), tree[5]], read: ["body › h1", "body › p", "body › button"] },
      { line: 7, say: "المحطة الرابعة: الرسم. لكل صندوق يلوّن المتصفح بكسلاته بالترتيب: الخلفية ثم النص. الآن فقط ترى الصفحة.", memory: [tree[0], tree[1], node("body › h1", '"Shop" teal'), node("body › p", '"Open " gray'), node("p › b", '"now" gray'), tree[5]], output: ["Shop", "Open now", "[ Buy ]"] },
      { line: 3, say: "سكربت ينفّذ h1.textContent = \"Big Sale\". تغيّرت عقدة في الشجرة، فيعيد المتصفح الأنماط والتخطيط والرسم لما تأثّر. لهذا يتغير ما تراه دون تحميل جديد.", memory: [tree[0], tree[1], node("body › h1", '"Big Sale" teal'), node("body › p", '"Open " gray'), node("p › b", '"now" gray'), tree[5]], changed: ["body › h1"], output: ["Big Sale", "Open now", "[ Buy ]"] },
    ],
  },
  playground: {
    kind: "html",
    intro: "صفحة صغيرة تُرسم أمامك. كل تعديل يمرّ بالمحطات كلها من جديد: تحليل، أنماط، تخطيط، رسم. والزر يغيّر الشجرة بـ JavaScript وأنت تنظر.",
    starter: `<style>
  h1 { color: teal; }
  .note { color: gray; }
</style>
<h1>Shop</h1>
<p class="note">Open <b>now</b></p>
<button onclick="add()">Add item</button>
<ul id="list"></ul>
<script>
  function add() {
    const li = document.createElement("li");
    li.textContent = "Item " + (document.querySelectorAll("li").length + 1);
    document.getElementById("list").appendChild(li);
  }
</script>`,
    challenges: [
      "غيّر لون h1 إلى red. أي محطة تغيّر ناتجها: التخطيط أم الرسم؟",
      "اضغط الزر ثلاث مرات. كل ضغطة تضيف عقدة li إلى الشجرة، فيعيد المتصفح التخطيط. ماذا حدث للمساحة تحت الزر؟",
      "احذف </b> وانظر: هل توقفت الصفحة؟ المحلّل متسامح، لكن إلى أين امتد الخط العريض؟",
      "أضف قاعدة .note { display: none; } داخل style. هل ما زال p في الشجرة رغم أنه لم يُرسم؟",
    ],
  },
  predict: [
    {
      question: "هذه شجرة DOM مكتوبة ككائنات. كم ابناً مباشراً لـ body؟",
      code: `let body = {
  tag: "body",
  children: [
    { tag: "h1", children: [] },
    { tag: "p", children: [{ tag: "b", children: [] }] },
  ],
};
console.log(body.children.length);`,
      options: ["2", "3", "1"],
      answer: 0,
      why: "b فُتح داخل p، فهو ابن p وحفيد body. الأبناء المباشرون لـ body هما h1 و p فقط.",
    },
    {
      question: "هذه محاكاة لمحطة الأنماط: العقدة تأخذ لونها من قاعدتها، أو ترث لون أبيها. ما لون b؟",
      code: `let rules = { body: "black", p: "gray" };
function colorOf(tag, parentColor) {
  if (rules[tag] !== undefined) {
    return rules[tag];
  }
  return parentColor;
}
let body = colorOf("body", "black");
let p = colorOf("p", body);
let b = colorOf("b", p);
console.log(b);`,
      options: ["gray", "black", "undefined"],
      answer: 0,
      why: "لا قاعدة لـ b، فيرث لون أبيه المباشر p، و p رمادي. الوراثة تمشي في الشجرة من الأب إلى الابن.",
    },
    {
      question: "ثلاثة صناديق مرصوصة تحت بعضها. سكربت كبّر الأول من 40 إلى 80. أين يبدأ الصندوق الثالث الآن؟",
      code: `let heights = [40, 20, 30];
heights[0] = 80;
let y = 0;
for (let i = 0; i < 2; i++) {
  y = y + heights[i];
}
console.log(y);`,
      options: ["100", "60", "50"],
      answer: 0,
      why: "مكان كل صندوق يُحسب من أحجام ما فوقه: 80 + 20 = 100. تغيير صندوق واحد يحرّك كل ما تحته، لذلك يعيد المتصفح التخطيط بعد هذا التغيير.",
    },
  ],
  code: {
    intro: "الصفحة نفسها تستطيع أن تمشي على شجرتها. هذا السكربت يطبع كل عقدة تحت body بمسافة تناسب عمقها. لاحظ أن وسم script نفسه عقدة في الشجرة.",
    runnerStarter: `<h1>Shop</h1>
<p>Open <b>now</b></p>
<script>
  function show(node, depth) {
    console.log("  ".repeat(depth) + node.tagName.toLowerCase());
    for (const child of node.children) show(child, depth + 1);
  }
  show(document.body, 0);
  // جرّب: أضف <ul><li>Pen</li></ul> فوق السكربت وشغّل
</script>`,
    runnerLang: "html",
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "خط الإنتاج",
      prompt: "رتّب محطات المتصفح من وصول النص إلى ظهور الصورة.",
      lines: [
        "تنزيل HTML (جسم ردّ HTTP)",
        "التحليل: بناء شجرة DOM",
        "الأنماط: مطابقة CSS مع كل عقدة",
        "التخطيط: حجم كل صندوق ومكانه",
        "الرسم: تلوين البكسلات",
      ],
      expected: "",
    },
    {
      kind: "fill",
      lang: "html",
      title: "طابق العقدة",
      prompt: "أي محدِّد يجعل الفقرة (وليس العنوان) حمراء؟",
      template: `<style>
  ___ { color: red; }
</style>
<h1>Shop</h1>
<p class="note">Open now</p>`,
      options: [".note", "note", "h1"],
      check: 'getComputedStyle(document.querySelector("p")).color',
      expected: "rgb(255, 0, 0)",
    },
    {
      kind: "fix",
      lang: "html",
      title: "سكربت سبق الشجرة",
      prompt: "السكربت يريد أن يغيّر العنوان إلى Sale!، لكنه يعمل قبل أن يصل المحلّل إلى h1، فلا يجده. أصلح الصفحة.",
      code: `<script>
  document.querySelector("h1").textContent = "Sale!";
</script>
<h1>Shop</h1>`,
      check: 'document.querySelector("h1").textContent',
      expected: "Sale!",
      hint: "المحلّل يبني الشجرة من الأعلى إلى الأسفل، والسكربت يعمل لحظة الوصول إليه. انقل السكربت إلى ما بعد h1.",
      solution: `<h1>Shop</h1>
<script>
  document.querySelector("h1").textContent = "Sale!";
</script>`,
    },
    {
      kind: "write",
      lang: "html",
      title: "أضف عقدة",
      prompt: "اكتب داخل السكربت ما يضيف <li>Book</li> في آخر القائمة cart، فتصير فيها عقدتان.",
      starter: `<ul id="cart"><li>Pen</li></ul>
<script>
  // أضف li نصها Book إلى #cart
</script>`,
      check: 'document.querySelectorAll("#cart li").length + " " + document.querySelector("#cart").lastElementChild.textContent',
      expected: "2 Book",
      hint: "document.createElement(\"li\") يصنع عقدة، و textContent يضع نصها، و appendChild يعلّقها في الشجرة تحت #cart.",
      solution: `<ul id="cart"><li>Pen</li></ul>
<script>
  const li = document.createElement("li");
  li.textContent = "Book";
  document.getElementById("cart").appendChild(li);
</script>`,
    },
  ],
  quiz: [
    {
      question: "كم ابناً مباشراً لـ body في شجرة DOM؟",
      code: "<body>\n  <div>\n    <p>A</p>\n    <p>B</p>\n  </div>\n  <p>C</p>\n</body>",
      options: ["2", "3", "4"],
      answer: 0,
      why: "A و B داخل div، فهما حفيدان لـ body. الأبناء المباشرون: div و p الذي فيه C.",
    },
    {
      question: "ماذا يطبع هذا السكربت؟",
      code: "<script>\n  console.log(document.querySelector(\"h1\"));\n</script>\n<h1>Shop</h1>",
      options: ["null", "<h1>Shop</h1>", "Shop"],
      answer: 0,
      why: "المحلّل يبني الشجرة وهو يقرأ، ويوقف القراءة لينفّذ السكربت فور وصوله إليه. في تلك اللحظة لم تُصنع عقدة h1 بعد.",
    },
    {
      question: "سكربت غيّر لون كلمة واحدة من رمادي إلى أحمر. أي محطات يعيدها المتصفح؟",
      options: ["الأنماط ثم الرسم، دون التخطيط", "كل شيء من التنزيل", "التخطيط فقط"],
      answer: 0,
      why: "اللون لا يغيّر حجم أي صندوق ولا مكانه، فلا داعي للتخطيط. يكفي حساب النمط الجديد وإعادة تلوين البكسلات.",
    },
    {
      question: "سكربت غيّر نص h1 إلى جملة طويلة صارت سطرين. ماذا يحدث للزر تحته؟",
      options: ["ينزل إلى الأسفل", "يبقى مكانه ويتداخل مع النص", "يختفي"],
      answer: 0,
      why: "تغيّر حجم صندوق h1، فيعيد المتصفح التخطيط: مكان كل صندوق تحته يُحسب من جديد، فينزل الزر.",
    },
    {
      question: "صورة في أعلى الصفحة ليس لها عرض وارتفاع مكتوبان، ووصلت بعد ظهور النص. ماذا يرى المستخدم؟",
      options: ["النص يقفز إلى الأسفل لحظة وصول الصورة", "لا يظهر شيء حتى تصل الصورة", "الصورة تظهر فوق النص"],
      answer: 0,
      why: "قبل وصول الصورة لم يعرف المتصفح حجمها، فخطّط لها صندوقاً صغيراً. حين وصلت عرف حجمها، فأعاد التخطيط ونزل كل ما تحتها.",
    },
  ],
  next: "html",
};
