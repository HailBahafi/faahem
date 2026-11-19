import type { Lesson, Scene } from "@/lib/types";

const altScene: Scene = {
  code: {
    html: `<img src="cat.jpg" alt="قطة نائمة">`,
  },
  steps: [
    { line: null, say: "قارئ الشاشة لا يرى الصورة. هو يقرأ الشجرة فقط.", memory: [] },
    { line: 1, say: "المتصفح يصنع عقدة img لها خاصيتان: src يقول من أين تُجلب الصورة، و alt يصفها بالكلمات.", memory: [{ name: "img", value: 'src="cat.jpg"', type: "none" }, { name: "img.alt", value: '"قطة نائمة"', type: "string" }], changed: ["img", "img.alt"] },
    { line: 1, say: "قارئ الشاشة يصل إلى العقدة، فيقرأ نوعها ثم alt: «صورة: قطة نائمة». اسم الملف لا يعني شيئاً لمن لا يرى.", memory: [{ name: "img", value: 'src="cat.jpg"', type: "none" }, { name: "img.alt", value: '"قطة نائمة"', type: "string" }], read: ["img.alt"], output: ["صورة: قطة نائمة"] },
  ],
};

const parentScene: Scene = {
  code: {
    html: `<nav>
  <ul>
    <li><a href="/">الرئيسية</a></li>
  </ul>
</nav>`,
  },
  steps: [
    { line: null, say: "كل وسم يُفتح ولا يُغلق بعد، يصير كل ما بعده داخله.", memory: [] },
    { line: 1, say: "nav يُفتح: عقدة جديدة.", memory: [{ name: "nav", value: "تنقّل", type: "none" }], changed: ["nav"] },
    { line: 2, say: "ul يُفتح و nav ما زال مفتوحاً، فيصير ul ابناً لـ nav.", memory: [{ name: "nav", value: "تنقّل", type: "none" }, { name: "nav>ul", value: "قائمة", type: "none" }], changed: ["nav>ul"] },
    { line: 3, say: "li يُفتح داخل ul، ثم a داخل li. الأب المباشر لـ a هو li، أقرب وسم مفتوح حوله.", memory: [{ name: "nav", value: "تنقّل", type: "none" }, { name: "nav>ul", value: "قائمة", type: "none" }, { name: "nav>ul>li", value: "عنصر", type: "none" }, { name: "nav>ul>li>a", value: '"الرئيسية"', type: "string" }], changed: ["nav>ul>li", "nav>ul>li>a"] },
    { line: 5, say: "الإغلاقات ترجعنا خطوة خطوة إلى الأعلى. الشجرة اكتملت: nav ← ul ← li ← a.", memory: [{ name: "nav", value: "تنقّل", type: "none" }, { name: "nav>ul", value: "قائمة", type: "none" }, { name: "nav>ul>li", value: "عنصر", type: "none" }, { name: "nav>ul>li>a", value: '"الرئيسية"', type: "string" }], read: ["nav>ul>li"] },
  ],
};

const buttonScene: Scene = {
  code: {
    html: `<div class="btn">اشترِ</div>
<button class="btn">اشترِ</button>`,
  },
  steps: [
    { line: null, say: "العنصران يبدوان متطابقين بعد التنسيق. لكن الشجرة تعرف عنهما أشياء مختلفة.", memory: [] },
    { line: 1, say: "div صندوق بلا معنى. المتصفح لا يعرف أنه زر، فلا يضعه في محطات Tab ولا يضغطه Enter.", memory: [{ name: "div.btn", value: "لا معنى", type: "none" }], changed: ["div.btn"] },
    { line: 2, say: "button يقول «أنا زر». المتصفح يعطيه مجاناً: يصله Tab، ويضغطه Enter والمسافة، ويقرؤه القارئ «زر: اشترِ».", memory: [{ name: "div.btn", value: "لا معنى", type: "none" }, { name: "button.btn", value: "زر", type: "string" }], changed: ["button.btn"], output: ["Tab يصل إلى: button فقط"] },
  ],
};

export const html: Lesson = {
  slug: "html",
  stage: 6,
  number: "6.1",
  title: "HTML",
  subtitle: "وسوم داخل وسوم تصنع شجرة، وكل وسم يقول ما هو",
  minutes: 18,
  problem: {
    title: "صفحتان متطابقتان في الشكل",
    body: "الصفحتان تبدوان واحدة للعين. بدّل بينهما، وشغّل قارئ الشاشة الذي يستعمله المكفوفون، وانظر إلى الشجرة التي يبنيها المتصفح من كل واحدة.",
    demo: "html",
  },
  scene: {
    code: {
      html: `<body dir="rtl">
  <header>
    <h1>متجر فاهم</h1>
  </header>
  <main>
    <img src="pen.png" alt="قلم أزرق">
    <a href="/cart">السلة</a>
  </main>
</body>`,
    },
    notes: {
      html: "HTML لا يرسم شيئاً ولا يحسب شيئاً: هو وصف لبنية المحتوى ومعناه. الشكل مهمة CSS، والسلوك مهمة JavaScript. المسافات البادئة للقارئ البشري فقط؛ المتصفح يبني الشجرة من الفتح والإغلاق.",
    },
    steps: [
      {
        line: null,
        say: "المتصفح يقرأ الملف من أعلى إلى أسفل، ويبني منه شجرة DOM كما رأيت في درس المتصفح. لنراقب الشجرة تنمو.",
        memory: [],
      },
      {
        line: 1,
        say: "وسم فتح body: عقدة جديدة هي جذع الصفحة. dir=\"rtl\" خاصية تضيف معلومة: النص من اليمين.",
        memory: [{ name: "body", value: 'dir="rtl"', type: "none" }],
        changed: ["body"],
      },
      {
        line: 2,
        say: "header يُفتح و body ما زال مفتوحاً، فيصير header ابناً لـ body. معناه: ترويسة الصفحة.",
        memory: [
          { name: "body", value: 'dir="rtl"', type: "none" },
          { name: "body>header", value: "ترويسة", type: "none" },
        ],
        changed: ["body>header"],
      },
      {
        line: 3,
        say: "h1 يُفتح ويُغلق في السطر نفسه، وبينهما نص. h1 يقول: هذا أهم عنوان في الصفحة.",
        memory: [
          { name: "body", value: 'dir="rtl"', type: "none" },
          { name: "body>header", value: "ترويسة", type: "none" },
          { name: "body>header>h1", value: '"متجر فاهم"', type: "string" },
        ],
        changed: ["body>header>h1"],
      },
      {
        line: 4,
        say: "إغلاق header يعيدنا خطوة إلى الأعلى: ما يأتي بعده ابن لـ body، لا لـ header.",
        memory: [
          { name: "body", value: 'dir="rtl"', type: "none" },
          { name: "body>header", value: "ترويسة", type: "none" },
          { name: "body>header>h1", value: '"متجر فاهم"', type: "string" },
        ],
        read: ["body"],
      },
      {
        line: 5,
        say: "main أخ لـ header، كلاهما ابن لـ body. معناه: المحتوى الرئيسي هنا.",
        memory: [
          { name: "body", value: 'dir="rtl"', type: "none" },
          { name: "body>header", value: "ترويسة", type: "none" },
          { name: "body>header>h1", value: '"متجر فاهم"', type: "string" },
          { name: "body>main", value: "المحتوى", type: "none" },
        ],
        changed: ["body>main"],
      },
      {
        line: 6,
        say: "img لا محتوى له ولا إغلاق. كل معلوماته في خصائصه: src من أين تُجلب الصورة، و alt وصفها لمن لا يراها.",
        memory: [
          { name: "body", value: 'dir="rtl"', type: "none" },
          { name: "body>header", value: "ترويسة", type: "none" },
          { name: "body>header>h1", value: '"متجر فاهم"', type: "string" },
          { name: "body>main", value: "المحتوى", type: "none" },
          { name: "body>main>img", value: 'alt="قلم أزرق"', type: "string" },
        ],
        changed: ["body>main>img"],
      },
      {
        line: 7,
        say: "a رابط، و href خاصيته التي تقول إلى أين يذهب. بدونها يصير نصاً عادياً لا يُضغط.",
        memory: [
          { name: "body", value: 'dir="rtl"', type: "none" },
          { name: "body>header", value: "ترويسة", type: "none" },
          { name: "body>header>h1", value: '"متجر فاهم"', type: "string" },
          { name: "body>main", value: "المحتوى", type: "none" },
          { name: "body>main>img", value: 'alt="قلم أزرق"', type: "string" },
          { name: "body>main>a", value: 'href="/cart"', type: "string" },
        ],
        changed: ["body>main>a"],
      },
      {
        line: 9,
        say: "الشجرة اكتملت. قارئ الشاشة يمشي عليها ويعلن كل عقدة بمعناها، لا بشكلها.",
        memory: [
          { name: "body", value: 'dir="rtl"', type: "none" },
          { name: "body>header", value: "ترويسة", type: "none" },
          { name: "body>header>h1", value: '"متجر فاهم"', type: "string" },
          { name: "body>main", value: "المحتوى", type: "none" },
          { name: "body>main>img", value: 'alt="قلم أزرق"', type: "string" },
          { name: "body>main>a", value: 'href="/cart"', type: "string" },
        ],
        read: ["body>header>h1", "body>main>img", "body>main>a"],
        output: ["عنوان 1: متجر فاهم", "صورة: قلم أزرق", "رابط: السلة"],
      },
    ],
  },
  singleLanguage: true,
  playground: {
    kind: "html",
    intro: "صفحة متجر صغيرة. عدّل الوسوم وراقب المعاينة. لاحظ أن أغلب التعديلات لا تغيّر الشكل كثيراً: HTML يغيّر المعنى والبنية.",
    starter: `<!doctype html>
<html lang="ar" dir="rtl">
  <body>
    <header>
      <h1>متجر فاهم</h1>
      <nav>
        <a href="#pens">أقلام</a>
        <a href="#books">كتب</a>
      </nav>
    </header>
    <main>
      <article id="pens">
        <h2>قلم أزرق</h2>
        <p>قلم حبر جاف، <strong>3 ريالات</strong>.</p>
        <button>أضف إلى السلة</button>
      </article>
    </main>
  </body>
</html>`,
    challenges: [
      "أضف article ثانياً بعد الأول فيه h2 «دفتر» وزر. أين يظهر، ولماذا تحت الأول؟",
      "ضع الرابطين داخل قائمة: ul وفي كل li رابط. ماذا تغيّر في المعاينة؟",
      "احذف href من الرابط الأول. هل ما زال يبدو رابطاً ويُضغط؟",
      "أضف صورة <img src=\"pen.png\" alt=\"قلم أزرق\"> داخل المقالة. الملف غير موجود: ماذا يُعرض مكانها؟",
    ],
  },
  predict: [
    {
      question: "ماذا يقول قارئ الشاشة عند هذه الصورة؟",
      code: `<img src="cat.jpg" alt="قطة نائمة">`,
      options: ["صورة: قطة نائمة", "صورة: cat.jpg", "لا شيء، لأنه لا يرى الصور"],
      answer: 0,
      why: "القارئ لا يرى البكسلات؛ يقرأ عقدة img في الشجرة. alt هو الوصف الذي كتبته له، ولهذا وُجد.",
      scene: altScene,
    },
    {
      question: "من هو الأب المباشر للرابط a في الشجرة؟",
      code: `<nav>
  <ul>
    <li><a href="/">الرئيسية</a></li>
  </ul>
</nav>`,
      options: ["li", "ul", "nav"],
      answer: 0,
      why: "الأب هو أقرب وسم مفتوح لم يُغلق بعد حين ظهر a. ذلك li؛ ul جدّه و nav جدّ أبيه.",
      scene: parentScene,
    },
    {
      question: "ضغطتَ Tab على هذه الصفحة. كم عنصراً يصل إليه التركيز؟",
      code: `<div class="btn">اشترِ</div>
<button class="btn">اشترِ</button>`,
      options: ["واحد: button", "اثنان: كلاهما", "لا شيء"],
      answer: 0,
      why: "الشكل لا يصنع زراً. div بلا معنى، فالمتصفح لا يعامله كشيء يُضغط. button يحمل معناه، فيأخذ التركيز ولوحة المفاتيح مجاناً.",
      scene: buttonScene,
    },
  ],
  code: {
    intro: "الصفحة شجرة حقيقية يمكن لـ JavaScript أن تسألها. هذا الكود يمشي على أبناء main ويطبع اسم كل وسم وخصائصه. في الدرس القادم نعطي هذه العقد شكلاً: كل عنصر صندوق.",
    runnerLang: "html",
    runnerStarter: `<!doctype html>
<html lang="ar" dir="rtl">
  <body>
    <main>
      <h2>قلم أزرق</h2>
      <img src="pen.png" alt="قلم أزرق">
      <a href="/cart">السلة</a>
      <button>اشترِ</button>
    </main>
    <script>
      const main = document.querySelector("main");
      for (const child of main.children) {
        console.log(child.tagName, child.getAttribute("alt") || child.getAttribute("href") || child.textContent);
      }
      // جرّب: أضف داخل main عنصر <p> وانظر كيف يظهر في الطباعة
    </script>
  </body>
</html>`,
  },
  exercises: [
    {
      kind: "order",
      lang: "html",
      title: "ترويسة المتجر",
      prompt: "رتّب الأسطر حتى يكون داخل header عنوان h1، وبعده nav فيه رابط إلى /lessons.",
      lines: [
        "<header>",
        "  <h1>فاهم</h1>",
        "  <nav>",
        '    <a href="/lessons">الدروس</a>',
        "  </nav>",
        "</header>",
      ],
      check: 'document.querySelector("header > h1").textContent + " " + document.querySelector("header > nav > a").getAttribute("href")',
      expected: "فاهم /lessons",
    },
    {
      kind: "fill",
      lang: "html",
      title: "صف الصورة",
      prompt: "أي خاصية تجعل قارئ الشاشة يقول «صورة: شعار فاهم»؟",
      template: '<img src="logo.png" ___="شعار فاهم">',
      options: ["alt", "title", "src"],
      check: 'document.querySelector("img").alt',
      expected: "شعار فاهم",
    },
    {
      kind: "fix",
      lang: "html",
      title: "زر لا يصله Tab",
      prompt: "زر الشراء مبني من div، فلا تصله لوحة المفاتيح ولا يعلنه القارئ زراً. أصلحه ليصير زراً حقيقياً واحتفظ بالكلاس btn.",
      code: '<div class="btn">اشترِ</div>',
      check: 'document.querySelector(".btn").tagName',
      expected: "BUTTON",
      hint: "الشكل يأتي من CSS، أما المعنى فمن اسم الوسم. ما الوسم الذي يقول «أنا زر»؟",
      solution: '<button class="btn">اشترِ</button>',
    },
    {
      kind: "write",
      lang: "html",
      title: "قائمة التنقّل",
      prompt: "داخل nav اكتب قائمة ul فيها ثلاثة عناصر li، في كل واحد رابط a له href (مثلاً / و /cart و /about).",
      starter: `<nav>
  <!-- اكتب القائمة هنا -->
</nav>`,
      check: 'document.querySelectorAll("nav > ul > li > a[href]").length',
      expected: "3",
      hint: "ul تحمل العناصر، وكل li يحمل رابطاً واحداً: <li><a href=\"/\">الرئيسية</a></li>",
      solution: `<nav>
  <ul>
    <li><a href="/">الرئيسية</a></li>
    <li><a href="/cart">السلة</a></li>
    <li><a href="/about">من نحن</a></li>
  </ul>
</nav>`,
    },
  ],
  quiz: [
    {
      question: "كم ابناً مباشراً لـ ul في هذه الشجرة؟",
      code: "<ul>\n  <li>شاي</li>\n  <li>قهوة <b>حارة</b></li>\n  <li>ماء</li>\n</ul>",
      options: ["3", "4", "1"],
      answer: 0,
      why: "أبناء ul المباشرون هم ما فُتح وهي مفتوحة مباشرة: ثلاثة li. أما b فابن لـ li الثاني، أي حفيد لـ ul.",
    },
    {
      question: "ماذا يحدث عند الضغط على هذا النص؟",
      code: "<a>اذهب إلى السلة</a>",
      options: ["لا شيء: لا يوجد href يقول إلى أين", "يذهب إلى صفحة السلة", "يعيد تحميل الصفحة"],
      answer: 0,
      why: "الوسم a يقول «رابط»، لكن الوجهة معلومة إضافية مكانها الخاصية href. بلا href لا وجهة.",
    },
    {
      question: "أي الصفحتين يفهم منها محرك البحث عنوان الصفحة الرئيسي؟",
      code: '<!-- A -->\n<div class="title">متجر فاهم</div>\n<!-- B -->\n<h1>متجر فاهم</h1>',
      options: ["B فقط", "A فقط", "كلتاهما بالقدر نفسه"],
      answer: 0,
      why: "اسم الكلاس للمبرمج، لا معنى له عند المتصفح ولا المحرك. h1 وسم معناه المعروف: أهم عنوان في الصفحة.",
    },
    {
      question: "ما ابن header الثاني؟",
      code: "<header>\n  <h1>فاهم</h1>\n</header>\n<nav>\n  <a href=\"/\">الرئيسية</a>\n</nav>",
      options: ["لا يوجد: nav أخ لـ header لا ابنه", "nav", "a"],
      answer: 0,
      why: "header أُغلق قبل أن يُفتح nav، فرجعنا خطوة إلى الأعلى. nav و header أخوان تحت الأب نفسه.",
    },
    {
      question: "لماذا يُكتب label مع input هكذا؟",
      code: '<label for="email">البريد</label>\n<input id="email" type="email">',
      options: ["ليربط الكلمة بالحقل: الضغط عليها يركّز فيه والقارئ يعلن الحقل باسمها", "ليكبّر الخط", "لا فائدة، النص وحده يكفي"],
      answer: 0,
      why: "for تشير إلى id الحقل، فتصير في الشجرة علاقة بين العقدتين. القارئ يقول «البريد، حقل بريد»، والضغط على الكلمة يركّز في الحقل.",
    },
  ],
  next: "box-model",
};
