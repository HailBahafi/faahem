import type { Lesson } from "@/lib/types";

const ROW_CSS = `.row {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}
.row .b { flex-grow: 1; }
.gallery { display: grid; gap: 8px; }
.gallery { grid-template-columns: repeat(3, 1fr); }`;

export const flexGrid: Lesson = {
  slug: "flex-grid",
  stage: 6,
  number: "6.3",
  title: "Flex و Grid",
  subtitle: "الأب يرتّب أبناءه: في خط واحد، أو في شبكة",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "صناديق لا تعرف أين تقف",
    body: "كل div يأخذ سطراً كاملاً وحده، فتتكدّس الصناديق فوق بعضها. لا تحرّك صندوقاً واحداً: اضغط خصائص الأب، وحاول أن تجعل الصناديق تشبه الشكل المطلوب.",
    demo: "flexGrid",
  },
  scene: {
    code: { css: ROW_CSS },
    notes: {
      css: "كل الخصائص هنا مكتوبة على الأب (.row و .gallery) إلا flex-grow: الأب يقرّر الترتيب، والابن يقرّر فقط كم يأخذ من المساحة الزائدة. والصفحة dir=\"rtl\"، لذلك «البداية» على اليمين.",
    },
    steps: [
      {
        line: null,
        say: "صفحة عربية dir=\"rtl\" فيها أب .row وثلاثة أبناء 1 و 2 و 3. بلا أي CSS، كل div يأخذ سطراً كاملاً، فتتكدّس الصناديق.",
        memory: [{ name: ".row display", value: "block", type: "string" }],
        output: ["[1]", "[2]", "[3]"],
      },
      {
        line: 1,
        say: "المحدِّد يختار الأب .row، لا الأبناء. الترتيب مهمة الأب: هو يقرّر أين يقف كل ابن داخله.",
        memory: [{ name: ".row display", value: "block", type: "string" }],
        read: [".row display"],
        output: ["[1]", "[2]", "[3]"],
      },
      {
        line: 2,
        say: "display: flex يصفّ الأبناء في خط واحد: المحور الرئيسي أفقي. والصفحة من اليمين، فالابن الأول يقف في أقصى اليمين.",
        memory: [{ name: ".row display", value: "flex", type: "string" }],
        changed: [".row display"],
        output: ["|            [3][2][1]|"],
      },
      {
        line: 3,
        say: "gap يضع فراغاً ثابتاً بين كل ابنين، دون أن نلمس أي ابن.",
        memory: [
          { name: ".row display", value: "flex", type: "string" },
          { name: ".row gap", value: "8px", type: "string" },
        ],
        changed: [".row gap"],
        output: ["|          [3] [2] [1]|"],
      },
      {
        line: 4,
        say: "justify-content يوزّع الأبناء على المحور الرئيسي (الأفقي هنا). center يجمعهم في المنتصف، والمساحة الزائدة تتقسّم على الطرفين.",
        memory: [
          { name: ".row display", value: "flex", type: "string" },
          { name: ".row gap", value: "8px", type: "string" },
          { name: ".row justify-content", value: "center", type: "string" },
        ],
        changed: [".row justify-content"],
        output: ["|     [3] [2] [1]     |"],
      },
      {
        line: 5,
        say: "align-items يعمل على المحور العرضي (العمودي هنا). كان الأبناء ممدودين لارتفاع الصف كله؛ الآن كل ابن بطوله الحقيقي، في منتصف الارتفاع.",
        memory: [
          { name: ".row display", value: "flex", type: "string" },
          { name: ".row gap", value: "8px", type: "string" },
          { name: ".row justify-content", value: "center", type: "string" },
          { name: ".row align-items", value: "center", type: "string" },
        ],
        changed: [".row align-items"],
        output: ["|     [3] [2] [1]     |", "  (centered vertically)"],
      },
      {
        line: 7,
        say: "flex-grow: 1 على الابن 2 وحده: كل المساحة الزائدة في الصف تذهب إليه فيتمدّد. لم يبقَ شيء يوزّعه justify-content.",
        memory: [
          { name: ".row display", value: "flex", type: "string" },
          { name: ".row gap", value: "8px", type: "string" },
          { name: ".row justify-content", value: "center", type: "string" },
          { name: ".row align-items", value: "center", type: "string" },
          { name: ".b flex-grow", value: "1", type: "number" },
        ],
        changed: [".b flex-grow"],
        output: ["|[3] [2=============] [1]|"],
      },
      {
        line: 8,
        say: "أب جديد: .gallery فيه ستة أبناء. display: grid يجعله شبكة، لكن لم نعرّف أعمدة بعد، فالشبكة عمود واحد.",
        memory: [
          { name: ".gallery display", value: "grid", type: "string" },
          { name: ".gallery gap", value: "8px", type: "string" },
        ],
        changed: [".gallery display", ".gallery gap"],
        output: ["[1]", "[2]", "[3]", "[4]", "[5]", "[6]"],
      },
      {
        line: 9,
        say: "repeat(3, 1fr) يرسم ثلاثة أعمدة، كل عمود حصة متساوية (fr) من العرض. الأبناء يملؤون الخلايا صفاً بعد صف، من اليمين. هذا بُعدان: أعمدة وصفوف.",
        memory: [
          { name: ".gallery display", value: "grid", type: "string" },
          { name: ".gallery gap", value: "8px", type: "string" },
          { name: ".gallery columns", value: "repeat(3, 1fr)", type: "string" },
        ],
        changed: [".gallery columns"],
        output: ["[ 3 ][ 2 ][ 1 ]", "[ 6 ][ 5 ][ 4 ]"],
      },
    ],
  },
  playground: {
    kind: "html",
    intro: "صفحة فيها شريط .bar مرتّب بـ flex، ومعرض .gallery مرتّب بـ grid. عدّل خصائص الأب وراقب الأبناء يتحرّكون في المعاينة.",
    starter: `<!doctype html>
<html dir="rtl">
<head>
<style>
  body { font-family: sans-serif; }
  .bar { display: flex; gap: 8px; justify-content: flex-start; align-items: center; background: #eef; padding: 8px; }
  .bar div { background: #fb923c; color: white; padding: 8px 14px; border-radius: 8px; }
  .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 16px; }
  .gallery div { background: #60a5fa; color: white; padding: 24px; text-align: center; border-radius: 8px; }
</style>
</head>
<body>
  <div class="bar">
    <div>الشعار</div>
    <div class="search">بحث</div>
    <div>السلة</div>
  </div>
  <div class="gallery">
    <div class="wide">1</div><div>2</div><div>3</div>
    <div>4</div><div>5</div><div>6</div>
  </div>
</body>
</html>`,
    challenges: [
      "غيّر justify-content في .bar إلى space-between. أين يقف «الشعار»، ولماذا على اليمين؟",
      "أضف القاعدة .search { flex-grow: 1; } وتوقّع: أي صندوق سيتمدّد، وماذا يحدث لـ justify-content؟",
      "غيّر repeat(3, 1fr) إلى repeat(2, 1fr). كم صفاً صار في المعرض؟",
      "أضف .wide { grid-column: span 2; }. كم خلية يأخذ الصندوق 1، وأين ذهب الصندوق 3؟",
    ],
  },
  predict: [
    {
      question: "الصفحة dir=\"rtl\". أين يقف الصندوق 1؟",
      code: `/* <div class="row"><div>1</div><div>2</div><div>3</div></div> */
.row { display: flex; }`,
      options: ["في أقصى اليمين", "في أقصى اليسار", "فوق الصندوقين الآخرين"],
      answer: 0,
      why: "flex يصفّ الأبناء على المحور الرئيسي من «البداية». في صفحة عربية البداية هي اليمين، فالأول يقف يميناً ثم 2 ثم 3 نحو اليسار.",
      scene: {
        code: {
          css: `.row {
  display: flex;
}`,
        },
        steps: [
          { line: null, say: "ثلاثة أبناء في صفحة rtl، مكدّسون لأن كل div يأخذ سطراً.", memory: [{ name: ".row display", value: "block", type: "string" }], output: ["[1]", "[2]", "[3]"] },
          { line: 2, say: "flex: خط واحد يبدأ من اليمين. الأول في أقصى اليمين.", memory: [{ name: ".row display", value: "flex", type: "string" }], changed: [".row display"], output: ["|            [3][2][1]|"] },
          { line: 3, say: "لو كانت الصفحة dir=\"ltr\" لبدأ الخط من اليسار: [1][2][3].", memory: [{ name: ".row display", value: "flex", type: "string" }], output: ["|            [3][2][1]|"] },
        ],
      },
    },
    {
      question: "قلبنا المحور إلى عمود. ماذا يفعل justify-content: center الآن؟",
      code: `.col {
  display: flex;
  flex-direction: column;
  height: 300px;
  justify-content: center;
}`,
      options: ["يضع الأبناء في منتصف الارتفاع", "يضع الأبناء في منتصف العرض", "لا شيء، لأنه للصفوف فقط"],
      answer: 0,
      why: "justify-content يعمل دائماً على المحور الرئيسي. column جعل المحور الرئيسي عمودياً، فصار التوسيط عمودياً. التوسيط الأفقي الآن مهمة align-items.",
      scene: {
        code: {
          css: `.col {
  display: flex;
  flex-direction: column;
  height: 300px;
  justify-content: center;
}`,
        },
        steps: [
          { line: 2, say: "flex: المحور الرئيسي أفقي في البداية.", memory: [{ name: "main axis", value: "row", type: "string" }], changed: ["main axis"] },
          { line: 3, say: "column يدير المحور الرئيسي ليصبح من الأعلى إلى الأسفل. الأبناء فوق بعض، لكن ما زالوا مرتّبين بـ flex.", memory: [{ name: "main axis", value: "column", type: "string" }], changed: ["main axis"], output: ["[1]", "[2]", "[3]"] },
          { line: 5, say: "justify-content يوزّع على المحور الرئيسي، وهو العمودي الآن: الأبناء في منتصف الارتفاع.", memory: [{ name: "main axis", value: "column", type: "string" }, { name: "justify-content", value: "center", type: "string" }], changed: ["justify-content"], output: ["", "", "[1]", "[2]", "[3]", "", ""] },
        ],
      },
    },
    {
      question: "شبكة بثلاثة أعمدة وفيها سبعة أبناء. ماذا يحدث للابن السابع؟",
      code: `.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
/* 7 children inside .grid */`,
      options: ["يبدأ صفاً ثالثاً وحده", "يختفي لأن الخلايا امتلأت", "تصبح الشبكة سبعة أعمدة"],
      answer: 0,
      why: "نحن عرّفنا الأعمدة فقط؛ الصفوف تُنشأ تلقائياً كلما احتاج ابن إلى خلية. الصفان الأولان يمتلئان بستة، والسابع يفتح صفاً ثالثاً.",
      scene: {
        code: {
          css: `.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
/* 7 children inside .grid */`,
        },
        steps: [
          { line: 3, say: "ثلاثة أعمدة متساوية. الأبناء 1 و 2 و 3 يملؤون الصف الأول من اليمين.", memory: [{ name: "columns", value: "3", type: "number" }, { name: "rows", value: "1", type: "number" }], output: ["[3][2][1]"] },
          { line: 3, say: "الرابع لا يجد خلية، فتنشئ الشبكة صفاً ثانياً.", memory: [{ name: "columns", value: "3", type: "number" }, { name: "rows", value: "2", type: "number" }], changed: ["rows"], output: ["[3][2][1]", "[6][5][4]"] },
          { line: 3, say: "والسابع يفتح صفاً ثالثاً ويجلس في أول خلية منه، على اليمين.", memory: [{ name: "columns", value: "3", type: "number" }, { name: "rows", value: "3", type: "number" }], changed: ["rows"], output: ["[3][2][1]", "[6][5][4]", "      [7]"] },
        ],
      },
    },
  ],
  code: {
    intro: "القاعدة العملية: flex لخط من الأشياء (شريط علوي، أزرار، بطاقة فيها صورة ونص)، و grid لصفحة أو معرض (أعمدة وصفوف). وكثيراً ما يجتمعان: شبكة، وداخل كل خلية خط flex. في الدرس القادم: كيف يغيّر JavaScript هذه الصفحة وهي معروضة؟",
    runnerLang: "html",
    runnerStarter: `<!doctype html>
<html dir="rtl">
<head>
<style>
  body { font-family: sans-serif; }
  .page { display: grid; grid-template-columns: 1fr 3fr; gap: 12px; }
  header { grid-column: span 2; display: flex; justify-content: space-between; align-items: center; background: #fde68a; padding: 8px; }
  aside { background: #ddd6fe; padding: 8px; }
  main { background: #bfdbfe; padding: 8px; }
</style>
</head>
<body>
  <div class="page">
    <header><b>متجري</b><span>السلة (2)</span></header>
    <aside>الأقسام</aside>
    <main>المنتجات</main>
  </div>
  <!-- جرّب: غيّر 1fr 3fr إلى 1fr 1fr، أو احذف grid-column: span 2 من header -->
</body>
</html>`,
  },
  exercises: [
    {
      kind: "order",
      lang: "html",
      title: "شريط تنقّل",
      prompt: "رتّب الأسطر حتى تصبح الروابط الثلاثة في خط واحد، موزّعة بين طرفي الشريط.",
      lines: [
        "<style>",
        "  .nav {",
        "    display: flex;",
        "    justify-content: space-between;",
        "  }",
        "</style>",
        '<nav class="nav"><a>Home</a><a>Shop</a><a>Cart</a></nav>',
      ],
      check: 'getComputedStyle(document.querySelector(".nav")).display + " " + getComputedStyle(document.querySelector(".nav")).justifyContent',
      expected: "flex space-between",
    },
    {
      kind: "fill",
      lang: "html",
      title: "وسّط عمودياً",
      prompt: "الصف أفقي، والأبناء أطوالهم مختلفة. أي خاصية تضعهم في منتصف ارتفاع الصف (المحور العرضي)؟",
      template: `<style>
  .row { display: flex; height: 120px; ___: center; }
</style>
<div class="row"><div>A</div><div>B</div></div>`,
      options: ["align-items", "justify-content", "text-align"],
      check: 'getComputedStyle(document.querySelector(".row")).alignItems',
      expected: "center",
    },
    {
      kind: "fix",
      lang: "html",
      title: "المعرض لا يصير أعمدة",
      prompt: "نريد المعرض ثلاثة أعمدة، لكن البطاقات ما زالت عموداً واحداً. القاعدة مكتوبة على العنصر الخطأ. أصلحها.",
      code: `<style>
  .gallery { display: grid; }
  .card { grid-template-columns: repeat(3, 1fr); }
</style>
<div class="gallery">
  <div class="card">1</div><div class="card">2</div><div class="card">3</div>
</div>`,
      check: 'getComputedStyle(document.querySelector(".gallery")).display + " " + getComputedStyle(document.querySelector(".gallery")).gridTemplateColumns',
      expected: "grid repeat(3, 1fr)",
      hint: "من يرتّب الأبناء؟ الأعمدة تُعرَّف على الأب الذي يحمل display: grid، لا على البطاقات.",
      solution: `<style>
  .gallery { display: grid; grid-template-columns: repeat(3, 1fr); }
</style>
<div class="gallery">
  <div class="card">1</div><div class="card">2</div><div class="card">3</div>
</div>`,
    },
    {
      kind: "write",
      lang: "html",
      title: "خانة البحث تتمدّد",
      prompt: "اجعل .bar خطاً من ثلاثة أبناء (flex)، واجعل خانة .search وحدها تأخذ كل المساحة الزائدة.",
      starter: `<style>
  /* اكتب القواعد هنا */
</style>
<div class="bar">
  <div class="logo">Logo</div>
  <input class="search">
  <button>Go</button>
</div>`,
      check: 'getComputedStyle(document.querySelector(".bar")).display + " " + getComputedStyle(document.querySelector(".search")).flexGrow',
      expected: "flex 1",
      hint: "قاعدتان: display: flex على الأب .bar، و flex-grow: 1 على الابن .search.",
      solution: `<style>
  .bar { display: flex; gap: 8px; }
  .search { flex-grow: 1; }
</style>
<div class="bar">
  <div class="logo">Logo</div>
  <input class="search">
  <button>Go</button>
</div>`,
    },
  ],
  quiz: [
    {
      question: "الصفحة dir=\"rtl\". أين يتجمّع الأبناء؟",
      code: ".row {\n  display: flex;\n  justify-content: flex-end;\n}",
      options: ["على اليسار", "على اليمين", "في المنتصف"],
      answer: 0,
      why: "flex-end تعني «نهاية المحور الرئيسي». في صفحة عربية يبدأ المحور من اليمين، فنهايته اليسار.",
    },
    {
      question: "في الصف 200px زائدة. كم يأخذ .b منها؟",
      code: ".a { flex-grow: 1; }\n.b { flex-grow: 3; }\n.c { }",
      options: ["150px", "100px", "200px"],
      answer: 0,
      why: "المساحة الزائدة تُقسَّم بنسبة الأرقام: 1 + 3 = 4 حصص، لكل حصة 50px. .b يأخذ 3 حصص = 150px، و .c بلا flex-grow فلا يأخذ شيئاً.",
    },
    {
      question: "عرض الشبكة 600px بلا gap. كم عرض العمود الثاني؟",
      code: ".grid {\n  display: grid;\n  grid-template-columns: 200px 1fr;\n}",
      options: ["400px", "300px", "200px"],
      answer: 0,
      why: "العمود الأول ثابت 200px. و 1fr يعني «حصة من الباقي»، والباقي 400px وهو حصة واحدة، فيأخذه كله.",
    },
    {
      question: "أين تقع البطاقة 3؟",
      code: ".grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}\n.c1 { grid-column: span 2; }\n/* children: c1, c2, c3 */",
      options: ["في بداية الصف الثاني", "في آخر الصف الأول", "فوق البطاقة 1"],
      answer: 0,
      why: "c1 يأخذ خليتين من الصف الأول، و c2 يأخذ الخلية الثالثة. امتلأ الصف، فتفتح c3 صفاً جديداً.",
    },
    {
      question: "هل يتوسّط الأبناء داخل .row؟",
      code: ".row { display: flex; }\n.row div { justify-content: center; }",
      options: ["لا، لا يتغيّر ترتيبهم", "نعم، يتوسّطون في الصف", "يتوسّطون عمودياً فقط"],
      answer: 0,
      why: "justify-content يرتّب أبناء العنصر الذي كُتب عليه. كتبناه على الأبناء، وهم لا أبناء لهم يرتّبونهم. يجب أن يُكتب على الأب .row.",
    },
  ],
  next: "dom",
};
