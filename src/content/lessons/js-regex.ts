import type { Cell, Lesson } from "@/lib/types";

const c = (name: string, value: string): Cell => ({ name, value, type: "none" });
const str = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const num = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

const text = str("text", "call 0551234567 now");
const phone = c("phone", "/05\\d{8}/");
const engine = (start: number, matched: string, note: string): Cell[] => [text, phone, num("start", start), c("matched", matched), c("engine", note)];
const found = [text, phone, c("m", '["0551234567"], index 5')];

export const jsRegex: Lesson = {
  slug: "js-regex",
  stage: 0,
  number: "2.10",
  title: "التعابير النمطية",
  subtitle: "برنامج صغير يمشي على النص حرفاً حرفاً",
  minutes: 25,
  problem: {
    title: "ابحث عن شكل، لا عن نص",
    body: "في الرسائل أرقام جوال كثيرة. indexOf تجد نصاً تعرفه بالضبط، لكنك لا تعرف الأرقام. جرّب الأنماط الجاهزة، أو اكتب نمطك، وراقب ما يُلوَّن.",
    demo: "jsRegex",
  },
  singleLanguage: true,
  scene: {
    code: {
      js: `const text = "call 0551234567 now";
const phone = /05\\d{8}/;
const m = text.match(phone);
console.log(m[0], m.index);
const tag = "<b>hi</b>";
console.log(tag.match(/<.+>/)[0]);
console.log(tag.match(/<.+?>/)[0]);`,
    },
    steps: [
      {
        line: null,
        say: "التعبير النمطي برنامج صغير. المحرّك يجرّبه عند كل موضع في النص من اليسار، ومن كل موضع يمشي على النمط رمزاً رمزاً. أول موضع ينجح منه يفوز.",
        memory: [],
      },
      {
        line: 2,
        say: "النمط ثلاثة رموز: الحرف 0، ثم الحرف 5، ثم \\d{8}: أي رقم من 0 إلى 9، ثماني مرات.",
        memory: [text, phone],
        changed: ["phone"],
      },
      {
        line: 3,
        say: "الموضع 0: الحرف c. النمط يريد 0. فشل، فلا داعي لفحص الباقي: ينتقل المحرّك إلى الموضع 1.",
        memory: engine(0, "", "c ≠ 0 → fail"),
        changed: ["start"],
      },
      {
        line: 3,
        say: "الموضع 1 (a) و 2 (l) و 3 (l) و 4 (مسافة): كلها تفشل عند الرمز الأول. خمس محاولات قصيرة.",
        memory: engine(4, "", '" " ≠ 0 → fail'),
        changed: ["start"],
      },
      {
        line: 3,
        say: "الموضع 5: الحرف 0 يطابق 0 ✓، والحرف 5 يطابق 5 ✓. ننتقل إلى \\d{8}.",
        memory: engine(5, '"05"', "0 ✓ 5 ✓"),
        changed: ["matched"],
      },
      {
        line: 3,
        say: "\\d{8} يأخذ رقماً، ثم رقماً... ثمانية: 5 1 2 3 4 5 6 7. انتهى النمط كله بنجاح، فالمطابقة من الموضع 5 بطول 10.",
        memory: engine(5, '"0551234567"', "\\d × 8 ✓ → match"),
        changed: ["matched"],
      },
      {
        line: 4,
        say: "match بلا g ترجع مصفوفة: الخانة 0 النص المطابق، والخاصية index موضع البداية.",
        memory: found,
        output: ["0551234567 5"],
      },
      {
        line: 6,
        say: ".+ جشع: من بعد < يأكل كل حرف حتى نهاية النص: b>hi</b>. ثم يحتاج النمط > ولم يبقَ حرف، فيتراجع المحرّك حرفاً واحداً: آخر حرف هو >، فتنجح.",
        memory: [...found, str("tag", "<b>hi</b>"), c(".+ took", '"b>hi</b" → back off 1 → "b>hi</b"')],
        changed: [".+ took"],
        output: ["0551234567 5", "<b>hi</b>"],
      },
      {
        line: 7,
        say: ".+? كسول: يأخذ حرفاً واحداً، ثم يسأل بعد كل حرف هل يطابق > الآن؟ بعد b نعم. فتكون المطابقة <b> فقط.",
        memory: [...found, str("tag", "<b>hi</b>"), c(".+? took", '"b" → next is > ✓')],
        changed: [".+? took"],
        output: ["0551234567 5", "<b>hi</b>", "<b>"],
      },
      {
        line: null,
        say: "الصورة: موضع بداية بعد موضع، ومن كل موضع خطوات على النمط. الجشع يأخذ الأكثر ثم يتراجع، والكسول يأخذ الأقل ثم يزيد. وكثرة التراجع هي سبب بطء الأنماط السيئة.",
        memory: [...found, str("tag", "<b>hi</b>")],
      },
    ],
    notes: {
      js: "/.../ تكتب النمط مباشرة، و new RegExp(text) تبنيه من نص. بعد الشرطة الأخيرة تأتي الأعلام: g (كل المطابقات)، i (تجاهل حالة الحروف)، m (^ و $ لكل سطر)، u (يونيكود كامل).",
    },
  },
  playground: {
    kind: "trace",
    intro: "المتتبّع لا ينفّذ التعابير النمطية، فهذا محرّك صغير بيدك ينفّذ النمط /05\\d{8}/: حلقة على مواضع البداية، ومن كل موضع فحص رمز برمز. شغّل وعدّ المحاولات.",
    starter: `function isDigit(ch) {
  return ch >= "0" && ch <= "9";
}
function matchAt(text, start) {
  if (text[start] !== "0") return false;
  if (text[start + 1] !== "5") return false;
  for (let k = 2; k < 10; k++) {
    if (!isDigit(text[start + k])) return false;
  }
  return true;
}
function search(text) {
  for (let i = 0; i + 10 <= text.length; i++) {
    if (matchAt(text, i)) return i;
  }
  return -1;
}
console.log(search("call 0551234567 now"));`,
    challenges: [
      "قبل التشغيل: كم مرة ستُنادى matchAt حتى تنجح؟",
      "جرّب النص \"05 0512345678\": الموضع 0 يبدأ بـ 05 ثم يفشل. أين يكمل المحرّك؟",
      "جرّب رقماً قصيراً مثل \"call 05512 now\". ماذا ترجع search؟",
      "عدّل matchAt لتقبل 9 أرقام أو 10 (كأن النمط \\d{7,8}). أيهما تختار حين يتوفر الاثنان؟ هذا هو الجشع.",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع؟",
      code: `const date = "2026-11-21";
console.log(date.replace("-", "/"));`,
      options: ["2026/11-21", "2026/11/21", "2026-11-21"],
      answer: 0,
      why: "replace مع نص يستبدل أول ظهور فقط. لكل الظهورات: replace(/-/g, \"/\") أو replaceAll(\"-\", \"/\").",
      scene: {
        code: { js: "const date = \"2026-11-21\";\nconsole.log(date.replace(\"-\", \"/\"));" },
        steps: [
          { line: 1, say: "نص فيه شرطتان.", memory: [str("date", "2026-11-21")] },
          { line: 2, say: "أول - في الموضع 4 تُستبدل، ثم يتوقف. النص الأصلي لا يتغير: replace ترجع نصاً جديداً.", memory: [str("date", "2026-11-21"), str("result", "2026/11-21")], output: ["2026/11-21"] },
        ],
      },
    },
    {
      question: "ماذا يطبع؟",
      code: `console.log(/\\d+/.test("12a"), /^\\d+$/.test("12a"));`,
      options: ["true false", "true true", "false false"],
      answer: 0,
      why: "بلا مراسٍ يكفي أن يوجد رقم في أي مكان. ^ تعني بداية النص و $ نهايته، فالثاني يطلب أن يكون النص كله أرقاماً. هذا ما تحتاجه في التحقق من المدخلات.",
      scene: {
        code: { js: "console.log(/\\d+/.test(\"12a\"), /^\\d+$/.test(\"12a\"));" },
        steps: [
          { line: 1, say: "الأول: من الموضع 0، \\d+ تأخذ 12. نجاح.", memory: [c("/\\d+/", "matched \"12\" → true")] },
          { line: 1, say: "الثاني: ^ ثم 12، ثم $ تطلب النهاية لكن بقي a. يتراجع \\d+ إلى 1، فـ $ تفشل أيضاً. ولا موضع آخر يحقق ^.", memory: [c("/\\d+/", "matched \"12\" → true"), c("/^\\d+$/", "no match → false")], output: ["true false"] },
        ],
      },
    },
    {
      question: "مثال يفاجئ الكثيرين. ماذا يطبع؟",
      code: `const re = /a/g;
console.log(re.test("a"), re.test("a"));`,
      options: ["true false", "true true", "false false"],
      answer: 0,
      why: "مع g يحفظ النمط حالة: lastIndex، موضع بداية البحث التالي. بعد النجاح الأول صار 1، فالبحث الثاني يبدأ بعد نهاية النص ويفشل، ثم يعود lastIndex إلى 0. لا تُعِد استعمال نمط فيه g مع test.",
      scene: {
        code: { js: "const re = /a/g;\nconsole.log(re.test(\"a\"), re.test(\"a\"));" },
        steps: [
          { line: 1, say: "نمط بالعلم g، و lastIndex = 0.", memory: [c("re", "/a/g"), num("re.lastIndex", 0)] },
          { line: 2, say: "الأول يبحث من 0: يجد a. ينجح ويحفظ lastIndex = 1.", memory: [c("re", "/a/g"), num("re.lastIndex", 1)], changed: ["re.lastIndex"] },
          { line: 2, say: "الثاني يبحث من 1، ولا حرف هناك: false، ويعود lastIndex إلى 0.", memory: [c("re", "/a/g"), num("re.lastIndex", 0)], changed: ["re.lastIndex"], output: ["true false"] },
        ],
      },
    },
  ],
  code: {
    intro: "استعمالات حقيقية: التحقق من رقم جوال بمراسٍ، واستخراج كل المبالغ بـ g، والمجموعات المسمّاة لقراءة تاريخ، و replace بدالة، و matchAll، والتقسيم على فواصل غير منتظمة.",
    runnerStarter: `const isMobile = (s) => /^(?:\\+966|0)5\\d{8}$/.test(s);
console.log(isMobile("0551234567"), isMobile("+966551234567"), isMobile("055123"));

const receipt = "tea 12 SAR, cake 30 SAR, mug 45 SAR";
const amounts = receipt.match(/\\d+/g).map(Number);
console.log(amounts, amounts.reduce((a, b) => a + b, 0));

const dateRe = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;
const { year, month, day } = "due: 2026-11-21".match(dateRe).groups;
console.log(day, month, year);

const shout = "hello world".replace(/\\b\\w/g, (ch) => ch.toUpperCase());
console.log(shout);

for (const m of "a=1; b=22; c=333".matchAll(/(\\w)=(\\d+)/g)) {
  console.log(m[1], "->", m[2], "at", m.index);
}

console.log("red ,green,  blue".split(/\\s*,\\s*/));
// try: make isMobile accept spaces like "055 123 4567" by removing them first with replace(/\\s/g, "")
`,
  },
  exercises: [
    {
      kind: "order",
      title: "مجموع الأرقام في نص",
      prompt: "رتّب الأسطر: استخرج كل الأرقام بـ g، حوّلها، اجمعها. الناتج: 20",
      lines: [
        'const text = "3 apples, 12 pears, 5 figs";',
        "const found = text.match(/\\d+/g);",
        "const total = found.map(Number).reduce((a, b) => a + b, 0);",
        "console.log(total);",
      ],
      expected: "20",
    },
    {
      kind: "fill",
      title: "كم رقماً متتالياً",
      prompt: "أي مكمّم يطبع كل مجموعة أرقام متتالية كاملة: 1,22,333",
      template: `const found = "a1b22c333".match(/\\d___/g);
console.log(found.join(","));`,
      options: ["+", "*", "?"],
      expected: "1,22,333",
    },
    {
      kind: "fix",
      title: "رمز من أربعة أرقام",
      prompt: "الرمز يجب أن يكون أربعة أرقام بالضبط، لكن \"12345\" تمرّ. اربط النمط ببداية النص ونهايته حتى يطبع: true ثم false ثم false",
      code: `const isPin = (s) => /\\d{4}/.test(s);
console.log(isPin("1234"));
console.log(isPin("12345"));
console.log(isPin("12a4"));`,
      expected: "true\nfalse\nfalse",
      hint: "^ تثبّت البداية و $ تثبّت النهاية: /^\\d{4}$/.",
      solution: `const isPin = (s) => /^\\d{4}$/.test(s);
console.log(isPin("1234"));
console.log(isPin("12345"));
console.log(isPin("12a4"));`,
    },
    {
      kind: "write",
      title: "عنوان إلى رابط",
      prompt: "اكتب slugify(title): حروف صغيرة، وكل تتابع من غير الحروف والأرقام يصير شرطة واحدة، ولا شرطات في الطرفين. اطبع slugify(\"Hello, World! 2026\") ثم slugify(\"  JS -- Regex  \").",
      starter: "// function slugify(title) { ... }\n",
      expected: "hello-world-2026\njs-regex",
      hint: "toLowerCase()، ثم replace(/[^a-z0-9]+/g, \"-\")، ثم replace(/^-|-$/g, \"\").",
      solution: `function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
console.log(slugify("Hello, World! 2026"));
console.log(slugify("  JS -- Regex  "));`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: 'console.log("aXbxc".split(/x/i).length);',
      options: ["3", "2", "1"],
      answer: 0,
      why: "العلم i يجعل x تطابق X و x معاً، فالنص يُقطع في موضعين إلى a و b و c.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'const m = "price: 120 SAR".match(/\\d+/);\nconsole.log(m[0], m.index);',
      options: ["120 7", "120 0", "1 7"],
      answer: 0,
      why: "المحرّك يجرّب المواضع من 0، وأول رقم في الموضع 7. ومن هناك \\d+ تأخذ كل الأرقام المتتالية: 120.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'console.log("<a><b>".match(/<.*>/)[0]);',
      options: ["<a><b>", "<a>", "<b>"],
      answer: 0,
      why: ".* جشعة: تأكل حتى نهاية النص، ثم تتراجع حتى تجد > لتكمل النمط، وأقرب > من النهاية هي الأخيرة. للأقصر استعمل .*?.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'console.log("2026-11-21".replace(/(\\d+)-(\\d+)-(\\d+)/, "$3/$2/$1"));',
      options: ["21/11/2026", "2026/11/21", "$3/$2/$1"],
      answer: 0,
      why: "الأقواس تلتقط ثلاث مجموعات: 2026 و 11 و 21، و $1 و $2 و $3 في نص الاستبدال تعني محتواها بترتيب فتح الأقواس.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'console.log("a.b".replace(/./g, "x"));',
      options: ["xxx", "axb", "a.b"],
      answer: 0,
      why: "النقطة في النمط تعني: أي حرف (عدا نهاية السطر). للنقطة الحرفية اكتب \\. فيصير الناتج axb.",
    },
  ],
  next: "event-loop",
};
