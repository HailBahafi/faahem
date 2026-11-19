import type { Lesson, Scene } from "@/lib/types";

const widthScene: Scene = {
  code: {
    css: `.box {
  width: 100px;
  padding: 10px;
  border: 2px solid;
}`,
  },
  steps: [
    { line: null, say: "العرض الظاهر يُبنى من الداخل إلى الخارج، طبقة فوق طبقة.", memory: [] },
    { line: 2, say: "width يضبط المحتوى وحده: 100.", memory: [{ name: "content", value: "100", type: "number" }, { name: "visible", value: "100", type: "number" }], changed: ["content", "visible"] },
    { line: 3, say: "الحشو 10 من اليمين و 10 من اليسار: يضاف 20.", memory: [{ name: "content", value: "100", type: "number" }, { name: "padding", value: "10 + 10", type: "number" }, { name: "visible", value: "120", type: "number" }], changed: ["padding", "visible"] },
    { line: 4, say: "الإطار 2 من كل جهة: يضاف 4. العرض الظاهر 124px، لا 100.", memory: [{ name: "content", value: "100", type: "number" }, { name: "padding", value: "10 + 10", type: "number" }, { name: "border", value: "2 + 2", type: "number" }, { name: "visible", value: "124", type: "number" }], changed: ["border", "visible"], output: ["124px"] },
  ],
};

const cascadeScene: Scene = {
  code: {
    css: `/* <p class="note" id="tip"> */
#tip { color: blue; }
p.note { color: red; }
.note { color: green; }`,
  },
  steps: [
    { line: null, say: "الفقرة تطابقها القواعد الثلاث. المتصفح يقارن الدقة أولاً، والترتيب ثانياً فقط.", memory: [] },
    { line: 2, say: "#tip يختار بالمعرّف id: أدق محدّد. اللون أزرق.", memory: [{ name: "color", value: "blue", type: "string" }, { name: "from", value: "#tip", type: "none" }], changed: ["color", "from"] },
    { line: 3, say: "p.note وسم وكلاس: أدق من وسم وحده، لكنه أقل من id. يخسر رغم أنه بعده.", memory: [{ name: "color", value: "blue", type: "string" }, { name: "from", value: "#tip", type: "none" }], read: ["from"] },
    { line: 4, say: "‎.note كلاس فقط: أضعف من p.note، فكيف يغلب id؟ يبقى الأزرق.", memory: [{ name: "color", value: "blue", type: "string" }, { name: "from", value: "#tip", type: "none" }], read: ["from"], output: ["blue"] },
  ],
};

const borderBoxScene: Scene = {
  code: {
    css: `.box {
  box-sizing: border-box;
  width: 100px;
  padding: 10px;
  border: 2px solid;
}`,
  },
  steps: [
    { line: null, say: "border-box يقلب الحساب: width صار العرض الظاهر كله، والمحتوى يأخذ ما يتبقى.", memory: [] },
    { line: 3, say: "العرض الظاهر ثابت: 100.", memory: [{ name: "visible", value: "100", type: "number" }, { name: "content", value: "100", type: "number" }], changed: ["visible", "content"] },
    { line: 4, say: "الحشو يأخذ 20 من الداخل: يبقى للمحتوى 80.", memory: [{ name: "visible", value: "100", type: "number" }, { name: "content", value: "80", type: "number" }], changed: ["content"] },
    { line: 5, say: "الإطار يأخذ 4 أخرى: يبقى للمحتوى 76. الصندوق لم يكبر، المحتوى هو الذي ضاق.", memory: [{ name: "visible", value: "100", type: "number" }, { name: "content", value: "76", type: "number" }], changed: ["content"], output: ["76px"] },
  ],
};

const card = (extra: { name: string; value: string; type: "number" | "string" | "none" }[]) => [
  { name: "color", value: "green", type: "string" as const },
  ...extra,
];

export const boxModel: Lesson = {
  slug: "box-model",
  stage: 6,
  number: "6.2",
  title: "CSS: الصندوق",
  subtitle: "محدّد يختار، والأدق يفوز، وكل عنصر صندوق من أربع طبقات",
  minutes: 20,
  problem: {
    title: "لماذا صار الصندوق أعرض؟",
    body: "كتبنا width: 200px، فظهر الصندوق أعرض من 200. حرّك المنزلقات وراقب الطبقات الأربع والعرض الكلي، ثم حلّ لغز الألوان: أي قاعدة تفوز؟",
    demo: "boxModel",
  },
  scene: {
    code: {
      css: `p { color: gray; }
.note { color: green; }
p { color: red; }
.note {
  width: 200px;
  padding: 20px;
  border: 5px solid;
  margin: 10px;
}`,
    },
    notes: {
      css: "كل قاعدة محدّد ثم خصائص بين قوسين. المحدّد p يختار بالوسم، و ‎.note بالكلاس، و ‎#tip بالمعرّف id. عند التعارض يفوز الأدق، وعند التساوي يفوز الأخير.",
    },
    steps: [
      {
        line: null,
        say: "في الصفحة فقرة واحدة: <p class=\"note\">. المتصفح يمرّ على القواعد ويحسب لكل خاصية قيمة واحدة فائزة.",
        memory: [],
      },
      {
        line: 1,
        say: "المحدّد p يطابق الفقرة لأنها وسم p. اللون رمادي، حتى الآن.",
        memory: [{ name: "color", value: "gray", type: "string" }, { name: "from", value: "p", type: "none" }],
        changed: ["color", "from"],
      },
      {
        line: 2,
        say: "‎.note يطابقها أيضاً لأن لها class=\"note\". الكلاس أدق من الوسم، فيفوز: أخضر.",
        memory: [{ name: "color", value: "green", type: "string" }, { name: "from", value: ".note", type: "none" }],
        changed: ["color", "from"],
      },
      {
        line: 3,
        say: "p تعود باللون الأحمر وهي متأخرة. لكن الدقة تُقارن قبل الترتيب: الوسم أضعف من الكلاس، فيبقى الأخضر.",
        memory: [{ name: "color", value: "green", type: "string" }, { name: "from", value: ".note", type: "none" }],
        read: ["from"],
      },
      {
        line: 5,
        say: "الآن الصندوق. width يضبط طبقة المحتوى وحدها: 200.",
        memory: card([{ name: "content", value: "200", type: "number" }, { name: "visible", value: "200", type: "number" }]),
        changed: ["content", "visible"],
      },
      {
        line: 6,
        say: "padding مسافة داخل الإطار، يملؤها لون الخلفية. 20 من كل جهة، فيزيد العرض 40.",
        memory: card([{ name: "content", value: "200", type: "number" }, { name: "padding", value: "20 + 20", type: "number" }, { name: "visible", value: "240", type: "number" }]),
        changed: ["padding", "visible"],
      },
      {
        line: 7,
        say: "border خطّ يحيط بالحشو. 5 من كل جهة، فيزيد 10.",
        memory: card([{ name: "content", value: "200", type: "number" }, { name: "padding", value: "20 + 20", type: "number" }, { name: "border", value: "5 + 5", type: "number" }, { name: "visible", value: "250", type: "number" }]),
        changed: ["border", "visible"],
      },
      {
        line: 8,
        say: "margin مسافة خارج الإطار، شفافة، تدفع الجيران بعيداً. لا تزيد الصندوق الظاهر، لكن الصندوق يشغل 270 من الصفحة.",
        memory: card([{ name: "content", value: "200", type: "number" }, { name: "padding", value: "20 + 20", type: "number" }, { name: "border", value: "5 + 5", type: "number" }, { name: "visible", value: "250", type: "number" }, { name: "margin", value: "10 + 10", type: "number" }, { name: "occupies", value: "270", type: "number" }]),
        changed: ["margin", "occupies"],
      },
      {
        line: 9,
        say: "النتيجة: كتبنا 200 فظهر 250. لو أضفنا box-sizing: border-box لصار 200 هو العرض الظاهر، وضاق المحتوى إلى 150.",
        memory: card([{ name: "content", value: "200", type: "number" }, { name: "padding", value: "20 + 20", type: "number" }, { name: "border", value: "5 + 5", type: "number" }, { name: "visible", value: "250", type: "number" }, { name: "margin", value: "10 + 10", type: "number" }, { name: "occupies", value: "270", type: "number" }]),
        read: ["visible"],
        output: ["color: green", "visible width: 250px"],
      },
    ],
  },
  singleLanguage: true,
  playground: {
    kind: "html",
    intro: "بطاقتان بإطار برتقالي، وبينهما كلمات داخل span. غيّر الأرقام وراقب: الحشو يكبّر البطاقة من الداخل، والهامش يبعدها عن جيرانها. الكتل تتراصّ عمودياً، والكلمات تجري في السطر.",
    starter: `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <style>
      .card {
        width: 200px;
        padding: 20px;
        border: 5px solid orange;
        margin: 20px;
        background: lightyellow;
      }
      span { background: lightblue; padding: 4px; }
    </style>
  </head>
  <body>
    <div class="card">بطاقة أولى</div>
    <div class="card">بطاقة ثانية</div>
    <p>كلمة <span>داخل</span> السطر <span>نفسه</span>.</p>
  </body>
</html>`,
    challenges: [
      "غيّر padding إلى 40px. هل كبرت البطاقة أم ضاق النص؟ ثم أضف box-sizing: border-box إلى ‎.card وقارن.",
      "اجعل margin صفراً. ماذا حدث للمسافة بين البطاقتين؟",
      "أضف قاعدة div { border-color: blue; } في آخر style. لماذا لم يتغيّر لون الإطار؟",
      "أضف width: 300px إلى span. هل تغيّر عرضه؟ ثم أضف display: inline-block وجرّب مرة أخرى.",
    ],
  },
  predict: [
    {
      question: "كم العرض الظاهر لهذا الصندوق؟",
      code: `.box {
  width: 100px;
  padding: 10px;
  border: 2px solid;
}`,
      options: ["124px", "100px", "112px"],
      answer: 0,
      why: "width يضبط المحتوى وحده. الحشو والإطار يضافان من الجهتين: 100 + 10 + 10 + 2 + 2 = 124.",
      scene: widthScene,
    },
    {
      question: "بأي لون تظهر الفقرة <p class=\"note\" id=\"tip\">؟",
      code: `#tip { color: blue; }
p.note { color: red; }
.note { color: green; }`,
      options: ["أزرق", "أحمر", "أخضر"],
      answer: 0,
      why: "الدقة تُقارن قبل الترتيب. id أدق من أي مزيج من وسم وكلاس، فيفوز رغم أنه أول قاعدة.",
      scene: cascadeScene,
    },
    {
      question: "كم عرض المحتوى (مكان النص) داخل هذا الصندوق؟",
      code: `.box {
  box-sizing: border-box;
  width: 100px;
  padding: 10px;
  border: 2px solid;
}`,
      options: ["76px", "100px", "124px"],
      answer: 0,
      why: "مع border-box صار width العرض الظاهر كله. الحشو والإطار يُقتطعان منه: 100 − 20 − 4 = 76.",
      scene: borderBoxScene,
    },
  ],
  code: {
    intro: "المتصفح يعطيك القيم الفائزة بـ getComputedStyle، ويعطيك العرض الظاهر بعد الحساب بـ offsetWidth (المحتوى + الحشو + الإطار). في الدرس القادم: كيف نضع صناديق كثيرة جنباً إلى جنب بـ Flex و Grid.",
    runnerLang: "html",
    runnerStarter: `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <style>
      .box {
        width: 200px;
        padding: 20px;
        border: 5px solid teal;
        margin: 10px;
      }
    </style>
  </head>
  <body>
    <div class="box">صندوق</div>
    <script>
      const box = document.querySelector(".box");
      const s = getComputedStyle(box);
      console.log("padding:", s.paddingLeft, "border:", s.borderLeftWidth, "margin:", s.marginLeft);
      console.log("visible width:", box.offsetWidth);
      // جرّب: أضف box-sizing: border-box إلى .box وشغّل مرة أخرى
    </script>
  </body>
</html>`,
  },
  exercises: [
    {
      kind: "order",
      lang: "html",
      title: "الأخير يفوز",
      prompt: "القاعدتان متساويتان في الدقة. رتّب الأسطر حتى يفوز حشو 20px.",
      lines: [
        "<style>",
        "  .card { padding: 10px; }",
        "  .card { padding: 20px; }",
        "</style>",
        '<div class="card">بطاقة</div>',
      ],
      check: 'getComputedStyle(document.querySelector(".card")).paddingTop',
      expected: "20px",
    },
    {
      kind: "fill",
      lang: "html",
      title: "مسافة في الداخل",
      prompt: "نريد مسافة 16px بين نص الزر وحافته، داخل الإطار، يملؤها لون الزر. أي خاصية؟",
      template: '<style>\n  .btn { ___: 16px; border: 2px solid; }\n</style>\n<button class="btn">اشترِ</button>',
      options: ["padding", "margin", "border-width"],
      check: 'getComputedStyle(document.querySelector(".btn")).paddingTop',
      expected: "16px",
    },
    {
      kind: "fix",
      lang: "html",
      title: "المحدّد لا يختار شيئاً",
      prompt: "أردنا إطاراً حول البطاقة، لكن لا إطار يظهر. المشكلة في المحدّد. أصلحه.",
      code: '<style>\n  card { border: 2px solid; }\n</style>\n<div class="card">بطاقة</div>',
      check: 'getComputedStyle(document.querySelector(".card")).borderTopStyle',
      expected: "solid",
      hint: "card بلا نقطة يبحث عن وسم اسمه <card>. ما الذي يجعل المحدّد يختار بالكلاس؟",
      solution: '<style>\n  .card { border: 2px solid; }\n</style>\n<div class="card">بطاقة</div>',
    },
    {
      kind: "write",
      lang: "html",
      title: "بطاقة بعرض 200 تماماً",
      prompt: "اكتب قاعدة ‎.card تعطيها حشواً 20px وإطاراً 5px solid، ويبقى عرضها الظاهر 200px بالضبط.",
      starter: `<style>
  .card {
    /* اكتب الخصائص هنا */
  }
</style>
<div class="card">بطاقة</div>`,
      check: '(s => [s.boxSizing, s.width, s.paddingLeft, s.borderLeftWidth].join(" "))(getComputedStyle(document.querySelector(".card")))',
      expected: "border-box 200px 20px 5px",
      hint: "width وحده يضبط المحتوى فيصير الظاهر 250. أي خاصية تجعل width يشمل الحشو والإطار؟",
      solution: `<style>
  .card {
    box-sizing: border-box;
    width: 200px;
    padding: 20px;
    border: 5px solid;
  }
</style>
<div class="card">بطاقة</div>`,
    },
  ],
  quiz: [
    {
      question: "كم المساحة الأفقية التي يشغلها الصندوق في الصفحة؟",
      code: ".box {\n  width: 50px;\n  padding: 5px;\n  border: 1px solid;\n  margin: 10px;\n}",
      options: ["82px", "62px", "50px"],
      answer: 0,
      why: "من الداخل إلى الخارج: 50 + 5×2 + 1×2 = 62 ظاهرة، ثم الهامش 10×2 خارجها: 82.",
    },
    {
      question: "بأي لون يظهر <p class=\"note\">؟",
      code: ".note { color: green; }\n.note { color: blue; }",
      options: ["أزرق", "أخضر", "مزيج منهما"],
      answer: 0,
      why: "المحدّدان متساويان في الدقة، فيُحكم بالترتيب: القاعدة الأخيرة تفوز.",
    },
    {
      question: "بأي لون يظهر <p class=\"note\">؟",
      code: ".note { color: green; }\np { color: red; }",
      options: ["أخضر", "أحمر", "أسود"],
      answer: 0,
      why: "الكلاس أدق من الوسم. الترتيب لا يُستشار إلا عند التساوي في الدقة.",
    },
    {
      question: "أين يظهر لون الخلفية؟",
      code: ".box {\n  background: yellow;\n  padding: 10px;\n  margin: 10px;\n}",
      options: ["في المحتوى والحشو، لا في الهامش", "في المحتوى فقط", "في الطبقات كلها مع الهامش"],
      answer: 0,
      why: "الحشو داخل الإطار فهو جزء من الصندوق ويملؤه لونه. الهامش خارج الإطار، شفاف دائماً.",
    },
    {
      question: "كيف تُرتّب هذه العناصر؟",
      code: "<div>A</div>\n<div>B</div>\n<span>C</span>\n<span>D</span>",
      options: ["A فوق B، ثم C و D في سطر واحد تحتهما", "الأربعة في سطر واحد", "كل واحد في سطر"],
      answer: 0,
      why: "div صندوق كتلة: يأخذ السطر كله فيتراصّ عمودياً. span صندوق سطري: يجري مع النص بجانب جيرانه.",
    },
  ],
  next: "flex-grid",
};
