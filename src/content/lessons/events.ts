import type { Lesson } from "@/lib/types";

export const events: Lesson = {
  slug: "events",
  stage: 6,
  number: "6.5",
  title: "الأحداث",
  subtitle: "الصفحة تنتظر؛ وحين ينقر المستخدم أو يكتب، ينادي المتصفح الدوال التي سجّلتها ويسلّمها ورقة الحدث",
  minutes: 18,
  problem: {
    title: "من نادى دالتك؟",
    body: "صناديق داخل صناديق، ولكل صندوق مستمع. انقر الصندوق الأعمق وراقب: لم تستدعِ أي دالة بنفسك، لكن النقرة صعدت من الداخل إلى الخارج ونادت كل مستمع على الطريق. أطفئ بعض المستمعين وانقر مرة أخرى.",
    demo: "events",
  },
  scene: {
    code: {
      html: `<div id="card">
  <button id="buy">Buy</button>
</div>
<script>
  const btn = document.querySelector("#buy");
  btn.addEventListener("click", (e) => console.log("button:", e.target.id));
  document.querySelector("#card").addEventListener("click", (e) => console.log("card:", e.target.id));
  console.log("ready");
</script>`,
    },
    steps: [
      {
        line: null,
        say: "المتصفح يبني الصفحة: صندوق card وبداخله زر buy. ثم يصل إلى السكربت فيشغّله من أعلى إلى أسفل.",
        memory: [],
      },
      {
        line: 5,
        say: "نبحث عن الزر ونضع مرجعه في الدرج btn. لا شيء آخر حدث بعد.",
        memory: [{ name: "btn", value: "<button>", type: "none", constant: true }],
        changed: ["btn"],
      },
      {
        line: 6,
        say: "addEventListener لا تشغّل الدالة! هي تسلّمها للمتصفح وتقول: «إذا نُقر هذا الزر، نادِ هذه». الدالة تُحفظ في قائمة مستمعي الزر.",
        memory: [
          { name: "btn", value: "<button>", type: "none", constant: true },
          { name: "buy: click", value: "1 دالة", type: "string" },
        ],
        changed: ["buy: click"],
      },
      {
        line: 7,
        say: "ومستمع ثانٍ، هذه المرة على الصندوق card الذي يحوي الزر. ما زال لم يُطبع شيء من الدالتين.",
        memory: [
          { name: "btn", value: "<button>", type: "none", constant: true },
          { name: "buy: click", value: "1 دالة", type: "string" },
          { name: "card: click", value: "1 دالة", type: "string" },
        ],
        changed: ["card: click"],
      },
      {
        line: 8,
        say: "السطر الأخير يطبع ready. انتهى السكربت كله، ولم تعمل أي دالة من المستمعَين.",
        memory: [
          { name: "btn", value: "<button>", type: "none", constant: true },
          { name: "buy: click", value: "1 دالة", type: "string" },
          { name: "card: click", value: "1 دالة", type: "string" },
        ],
        output: ["ready"],
      },
      {
        line: null,
        say: "الآن لا يعمل أي سطر. الصفحة تنتظر. قد تنتظر ثانية أو ساعة، والدوال محفوظة عند المتصفح.",
        memory: [
          { name: "btn", value: "<button>", type: "none", constant: true },
          { name: "buy: click", value: "1 دالة", type: "string" },
          { name: "card: click", value: "1 دالة", type: "string" },
        ],
        output: ["ready"],
      },
      {
        line: null,
        say: "المستخدم ينقر Buy. المتصفح يصنع كائن حدث e: نوعه click، وهدفه e.target هو الزر الذي نُقر فعلاً.",
        memory: [
          { name: "btn", value: "<button>", type: "none", constant: true },
          { name: "buy: click", value: "1 دالة", type: "string" },
          { name: "card: click", value: "1 دالة", type: "string" },
          { name: "e.type", value: '"click"', type: "string" },
          { name: "e.target", value: "#buy", type: "string" },
        ],
        changed: ["e.type", "e.target"],
        output: ["ready"],
      },
      {
        line: 6,
        say: "المتصفح يبدأ من الهدف: يجد مستمعاً على الزر فيناديه ويمرّر له e. الآن فقط يعمل سطر 6.",
        memory: [
          { name: "btn", value: "<button>", type: "none", constant: true },
          { name: "buy: click", value: "1 دالة", type: "string" },
          { name: "card: click", value: "1 دالة", type: "string" },
          { name: "e.type", value: '"click"', type: "string" },
          { name: "e.target", value: "#buy", type: "string" },
        ],
        read: ["buy: click", "e.target"],
        output: ["ready", "button: buy"],
      },
      {
        line: 7,
        say: "ثم يصعد الحدث (bubbling) إلى الأب: card له مستمع فيُنادى بنفس e. لاحظ أن e.target ما زال buy: من نُقر فعلاً، لا من يستمع.",
        memory: [
          { name: "btn", value: "<button>", type: "none", constant: true },
          { name: "buy: click", value: "1 دالة", type: "string" },
          { name: "card: click", value: "1 دالة", type: "string" },
          { name: "e.type", value: '"click"', type: "string" },
          { name: "e.target", value: "#buy", type: "string" },
        ],
        read: ["card: click", "e.target"],
        output: ["ready", "button: buy", "card: buy"],
      },
      {
        line: null,
        say: "يصعد الحدث حتى body والمستند ولا يجد مستمعين آخرين. تعود الصفحة إلى الانتظار، وكل نقرة جديدة تعيد القصة كلها.",
        memory: [
          { name: "btn", value: "<button>", type: "none", constant: true },
          { name: "buy: click", value: "1 دالة", type: "string" },
          { name: "card: click", value: "1 دالة", type: "string" },
        ],
        output: ["ready", "button: buy", "card: buy"],
      },
    ],
    notes: {
      html: "يمكنك أيضاً كتابة btn.onclick = f، لكنها خانة واحدة: تعيينها مرة ثانية يمسح الأولى. addEventListener تضيف إلى قائمة، فلكل عنصر عدد غير محدود من المستمعين.",
    },
  },
  singleLanguage: true,
  playground: {
    kind: "html",
    intro: "قائمة مشروبات بمستمع واحد على القائمة كلها، ونموذج يضيف مشروباً. انقر عناصر القائمة، وأضف مشروباً من النموذج، وراقب من يستجيب.",
    starter: `<!doctype html>
<html dir="rtl">
<body>
  <ul id="list">
    <li>شاي</li>
    <li>قهوة</li>
    <li>عصير</li>
  </ul>
  <p id="msg">اختر مشروباً</p>
  <form id="add">
    <input name="drink" placeholder="مشروب جديد">
    <button>أضف</button>
  </form>
  <script>
    const list = document.querySelector("#list");
    const msg = document.querySelector("#msg");
    list.addEventListener("click", (e) => {
      msg.textContent = e.target.textContent;
    });
    document.querySelector("#add").addEventListener("submit", (e) => {
      e.preventDefault();
      const li = document.createElement("li");
      li.textContent = e.target.drink.value;
      list.append(li);
    });
  </script>
</body>
</html>`,
    challenges: [
      "أضف مشروباً جديداً ثم انقر عليه. لم تكتب له أي مستمع، فلماذا يستجيب؟ (تذكّر: النقرة تصعد إلى ul).",
      "احذف سطر e.preventDefault();‎ وأضف مشروباً. ماذا حدث للمشروب الجديد؟ ولماذا اختفى؟",
      "انقر في الفراغ بين العناصر داخل القائمة. ماذا ظهر في الرسالة؟ أضف في أول المستمع: if (e.target.tagName !== \"LI\") return;",
      "أضف مستمعاً ثانياً على list يكتب console.log(e.target.tagName). هل ألغى المستمع الأول؟",
    ],
  },
  predict: [
    {
      question: "لا أحد ينقر بيده؛ السطر الأخير ينقر الزر برمجياً. ماذا يُطبع وبأي ترتيب؟",
      code: `const btn = document.querySelector("button");
btn.addEventListener("click", () => console.log("clicked"));
console.log("end");
btn.click();`,
      options: ["end ثم clicked", "clicked ثم end", "end فقط"],
      answer: 0,
      why: "سطر addEventListener يسلّم الدالة للمتصفح ولا يشغّلها. يُطبع end أولاً، ثم btn.click()‎ يصنع حدث نقرة، فينادي المتصفح الدالة المحفوظة.",
      scene: {
        code: {
          js: `const btn = document.querySelector("button");
btn.addEventListener("click", () => console.log("clicked"));
console.log("end");
btn.click();`,
        },
        steps: [
          { line: 1, say: "btn يشير إلى الزر.", memory: [{ name: "btn", value: "<button>", type: "none" }], changed: ["btn"] },
          {
            line: 2,
            say: "الدالة تُحفظ في قائمة مستمعي الزر. لم تعمل.",
            memory: [{ name: "btn", value: "<button>", type: "none" }, { name: "click", value: "1 دالة", type: "string" }],
            changed: ["click"],
          },
          {
            line: 3,
            say: "يُطبع end.",
            memory: [{ name: "btn", value: "<button>", type: "none" }, { name: "click", value: "1 دالة", type: "string" }],
            output: ["end"],
          },
          {
            line: 4,
            say: "click()‎ تصنع حدث نقرة، فينادي المتصفح المستمع المحفوظ الآن.",
            memory: [{ name: "btn", value: "<button>", type: "none" }, { name: "click", value: "1 دالة", type: "string" }],
            read: ["click"],
            output: ["end", "clicked"],
          },
        ],
      },
    },
    {
      question: "الزر داخل box. سُجّل مستمع box أولاً. ماذا يُطبع عند نقر الزر؟",
      code: `// <div id="box"><button>Go</button></div>
document.querySelector("#box").addEventListener("click", () => console.log("box"));
document.querySelector("button").addEventListener("click", () => console.log("button"));
document.querySelector("button").click();`,
      options: ["button ثم box", "box ثم button", "button فقط"],
      answer: 0,
      why: "ترتيب التسجيل لا يقرّر هنا. الحدث يبدأ من الهدف (الزر) ثم يصعد إلى أبيه box. من الداخل إلى الخارج دائماً.",
      scene: {
        code: {
          js: `// <div id="box"><button>Go</button></div>
document.querySelector("#box").addEventListener("click", () => console.log("box"));
document.querySelector("button").addEventListener("click", () => console.log("button"));
document.querySelector("button").click();`,
        },
        steps: [
          { line: 2, say: "مستمع على box يُحفظ.", memory: [{ name: "box: click", value: "1 دالة", type: "string" }], changed: ["box: click"] },
          {
            line: 3,
            say: "مستمع على الزر يُحفظ.",
            memory: [{ name: "box: click", value: "1 دالة", type: "string" }, { name: "button: click", value: "1 دالة", type: "string" }],
            changed: ["button: click"],
          },
          {
            line: 4,
            say: "نقرة على الزر: e.target هو الزر. المتصفح يبدأ من الهدف نفسه.",
            memory: [
              { name: "box: click", value: "1 دالة", type: "string" },
              { name: "button: click", value: "1 دالة", type: "string" },
              { name: "e.target", value: "<button>", type: "none" },
            ],
            read: ["button: click"],
            output: ["button"],
          },
          {
            line: 4,
            say: "ثم يصعد الحدث إلى الأب box وينادي مستمعه.",
            memory: [
              { name: "box: click", value: "1 دالة", type: "string" },
              { name: "button: click", value: "1 دالة", type: "string" },
              { name: "e.target", value: "<button>", type: "none" },
            ],
            read: ["box: click"],
            output: ["button", "box"],
          },
        ],
      },
    },
    {
      question: "مستمع واحد على القائمة كلها، والنقرة على العنصر الثاني. ماذا يُطبع؟",
      code: `// <ul><li>Tea</li><li>Coffee</li></ul>
const ul = document.querySelector("ul");
ul.addEventListener("click", (e) => console.log(e.target.textContent));
document.querySelectorAll("li")[1].click();`,
      options: ["Coffee", "TeaCoffee", "Tea"],
      answer: 0,
      why: "المستمع على ul، لكن e.target هو العنصر الذي نُقر فعلاً: li الثاني. النقرة صعدت إلى ul وحملت معها ورقة تقول من بدأها. هذا هو التفويض: مستمع واحد لكل الأبناء.",
      scene: {
        code: {
          js: `// <ul><li>Tea</li><li>Coffee</li></ul>
const ul = document.querySelector("ul");
ul.addEventListener("click", (e) => console.log(e.target.textContent));
document.querySelectorAll("li")[1].click();`,
        },
        steps: [
          { line: 2, say: "ul يشير إلى القائمة.", memory: [{ name: "ul", value: "<ul>", type: "none" }], changed: ["ul"] },
          {
            line: 3,
            say: "مستمع واحد على القائمة، لا على أي li.",
            memory: [{ name: "ul", value: "<ul>", type: "none" }, { name: "ul: click", value: "1 دالة", type: "string" }],
            changed: ["ul: click"],
          },
          {
            line: 4,
            say: "نقرة على li الثاني. الهدف هو Coffee، ولا مستمع عليه، فيصعد الحدث.",
            memory: [
              { name: "ul", value: "<ul>", type: "none" },
              { name: "ul: click", value: "1 دالة", type: "string" },
              { name: "e.target", value: '"Coffee"', type: "string" },
            ],
            changed: ["e.target"],
          },
          {
            line: 3,
            say: "وصل إلى ul فنودي مستمعه، وe.target ما زال li الذي نُقر.",
            memory: [
              { name: "ul", value: "<ul>", type: "none" },
              { name: "ul: click", value: "1 دالة", type: "string" },
              { name: "e.target", value: '"Coffee"', type: "string" },
            ],
            read: ["e.target"],
            output: ["Coffee"],
          },
        ],
      },
    },
  ],
  code: {
    intro: "ثلاثة أنواع من الأحداث في صفحة واحدة: input يحدث مع كل حرف تكتبه، وclick مع كل نقرة، وsubmit حين يُرسل النموذج. لاحظ preventDefault: بدونها يرسل المتصفح النموذج ويعيد تحميل الصفحة، فتضيع القائمة. اكتب في الحقول وراقب.",
    runnerLang: "html",
    runnerStarter: `<!doctype html>
<html dir="rtl">
<body>
  <input id="name" placeholder="اكتب اسمك">
  <p id="hello">...</p>
  <form id="todo-form">
    <input id="todo" placeholder="مهمة جديدة">
    <button>أضف</button>
  </form>
  <ol id="todos"></ol>
  <script>
    const hello = document.querySelector("#hello");
    document.querySelector("#name").addEventListener("input", (e) => {
      hello.textContent = "Hello " + e.target.value;
    });

    const todos = document.querySelector("#todos");
    document.querySelector("#todo-form").addEventListener("submit", (e) => {
      e.preventDefault(); // try deleting this line
      const li = document.createElement("li");
      li.textContent = document.querySelector("#todo").value;
      todos.append(li);
    });

    // One listener for every item, even ones added later: click an item to cross it out
    todos.addEventListener("click", (e) => {
      e.target.style.textDecoration = "line-through";
    });
  </script>
</body>
</html>`,
  },
  exercises: [
    {
      kind: "order",
      title: "زر الإعجاب",
      lang: "html",
      prompt: "رتّب الأسطر: زر يزيد عدّاده مع كل نقرة، فبعد نقرتين يكتب Like 2.",
      lines: [
        "<button>Like</button>",
        "<script>",
        "let likes = 0;",
        'const btn = document.querySelector("button");',
        'btn.addEventListener("click", () => {',
        "likes = likes + 1;",
        'btn.textContent = "Like " + likes;',
        "});",
        "</script>",
      ],
      check: '(document.querySelector("button").click(), document.querySelector("button").click(), document.querySelector("button").textContent)',
      expected: "Like 2",
    },
    {
      kind: "fill",
      title: "مع كل حرف",
      lang: "html",
      prompt: "نريد أن تتغير الفقرة مع كل حرف يكتبه المستخدم في الحقل. أي نوع حدث نستمع له؟",
      template: `<input id="name">
<p id="out"></p>
<script>
  const input = document.querySelector("#name");
  input.addEventListener("___", (e) => {
    document.querySelector("#out").textContent = e.target.value;
  });
</script>`,
      options: ["input", "click", "submit"],
      check: '(function () { const i = document.querySelector("#name"); i.value = "Sara"; i.dispatchEvent(new Event("input")); return document.querySelector("#out").textContent; })()',
      expected: "Sara",
    },
    {
      kind: "fix",
      title: "العدّاد العنيد",
      lang: "html",
      prompt: "يجب أن يكتب العدّاد clicks: 2 بعد نقرتين، لكنه يعرض clicks: 1 قبل أي نقرة ثم لا يتحرك. أصلح سطراً واحداً.",
      code: `<button>Count</button>
<p>clicks: 0</p>
<script>
  let count = 0;
  function onClick() {
    count = count + 1;
    document.querySelector("p").textContent = "clicks: " + count;
  }
  document.querySelector("button").addEventListener("click", onClick());
</script>`,
      check: '(document.querySelector("button").click(), document.querySelector("button").click(), document.querySelector("p").textContent)',
      expected: "clicks: 2",
      hint: "onClick()‎ بالقوسين تشغّل الدالة الآن وتعطي addEventListener نتيجتها (undefined). أعطِ المتصفح الدالة نفسها: onClick بلا قوسين.",
      solution: `<button>Count</button>
<p>clicks: 0</p>
<script>
  let count = 0;
  function onClick() {
    count = count + 1;
    document.querySelector("p").textContent = "clicks: " + count;
  }
  document.querySelector("button").addEventListener("click", onClick);
</script>`,
    },
    {
      kind: "write",
      title: "مستمع واحد للقائمة",
      lang: "html",
      prompt: "اكتب مستمعاً واحداً على #menu (لا على كل li): حين يُنقر أي عنصر، يُكتب نصه في #picked.",
      starter: `<ul id="menu">
  <li>Tea</li>
  <li>Coffee</li>
  <li>Juice</li>
</ul>
<p id="picked">none</p>
<script>
  // one listener on #menu, use e.target
</script>`,
      check: '(document.querySelectorAll("li")[2].click(), document.querySelector("#picked").textContent)',
      expected: "Juice",
      hint: 'document.querySelector("#menu").addEventListener("click", (e) => { ... e.target.textContent ... });',
      solution: `<ul id="menu">
  <li>Tea</li>
  <li>Coffee</li>
  <li>Juice</li>
</ul>
<p id="picked">none</p>
<script>
  document.querySelector("#menu").addEventListener("click", (e) => {
    document.querySelector("#picked").textContent = e.target.textContent;
  });
</script>`,
    },
  ],
  quiz: [
    {
      question: "الصفحة فُتحت ولم ينقر أحد شيئاً. ماذا يُطبع؟",
      code: `const btn = document.querySelector("button");
console.log("A");
btn.addEventListener("click", () => console.log("B"));
console.log("C");`,
      options: ["A C", "A B C", "A C B"],
      answer: 0,
      why: "تسجيل المستمع يسلّم الدالة للمتصفح فقط. B لن يُطبع إلا حين يقع حدث click، وقد لا يقع أبداً.",
    },
    {
      question: "ماذا يُطبع؟",
      code: `let n = 0;
btn.addEventListener("click", () => { n = n + 1; });
btn.addEventListener("click", () => { n = n + 10; });
btn.click();
btn.click();
console.log(n);`,
      options: ["22", "11", "20"],
      answer: 0,
      why: "addEventListener تضيف ولا تستبدل: للزر مستمعان، وكل نقرة تنادي الاثنين (1 + 10). نقرتان تعطيان 22.",
    },
    {
      question: "لكل عنصر مستمع يطبع اسمه. ماذا يُطبع عند نقر الزر؟",
      code: `// <section><div><button>Go</button></div></section>
section.addEventListener("click", () => console.log("section"));
div.addEventListener("click", () => console.log("div"));
button.addEventListener("click", () => console.log("button"));
button.click();`,
      options: ["button div section", "section div button", "button فقط"],
      answer: 0,
      why: "الحدث يبدأ من الهدف ثم يفقّع صاعداً إلى كل أب، كفقاعة تطلع من القاع: الزر، ثم div، ثم section.",
    },
    {
      question: "ينقر المستخدم «أرسل» في هذا النموذج. ماذا يرى؟",
      code: `form.addEventListener("submit", (e) => {
  list.append("new item");
});`,
      options: [
        "يظهر العنصر لحظة، ثم يُعاد تحميل الصفحة فيختفي",
        "يظهر العنصر ويبقى",
        "لا يحدث شيء لأن المستمع لا يعمل مع النماذج",
      ],
      answer: 0,
      why: "المستمع يعمل فعلاً، ثم ينفّذ المتصفح فعله الافتراضي: يرسل النموذج ويعيد تحميل الصفحة. e.preventDefault()‎ في المستمع يلغي هذا الفعل.",
    },
    {
      question: "قائمة ul فيها 100 عنصر li، وعليها مستمع click واحد. نقرت العنصر رقم 57. ماذا يكون e.target داخل المستمع؟",
      options: ["العنصر li رقم 57", "القائمة ul", "العناصر المئة كلها"],
      answer: 0,
      why: "e.target هو من بدأ الحدث، والمستمع على ul يسمعه لأن الحدث صعد إليه. لذلك يكفي مستمع واحد للمئة، وحتى لعناصر تُضاف لاحقاً.",
    },
  ],
  next: "event-loop",
};
