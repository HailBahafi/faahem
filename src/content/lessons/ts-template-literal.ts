import type { Cell, Lesson, Scene } from "@/lib/types";

/** A type the checker holds: its name and the expression it has rewritten it to so far. */
const ty = (name: string, expr: string): Cell => ({ name, value: expr, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const SIZE = ty("Size", '"sm" | "lg"');
const COLOR = ty("Color", '"red" | "blue"');
const CLASS = ty("ClassName", '"btn-sm-red" | "btn-sm-blue" | "btn-lg-red" | "btn-lg-blue"');

export const tsTemplateLiteral: Lesson = {
  slug: "ts-template-literal",
  stage: 0,
  number: "3.3",
  title: "template literal types",
  subtitle: "نصوص تُبنى من نصوص: كل ثقب في القالب يمر على كل عضو في الاتحاد",
  minutes: 25,
  problem: {
    title: "أسماء تُكتب بيد فتُخطئ",
    body: "أزرار الموقع لها أحجام وألوان، واسم كل صنف CSS يُركّب منهما. اختر الأحجام والألوان، ثم اكتب اسماً في الخانة. المدقّق يعرف كل الأسماء الممكنة مسبقاً، فيلتقط الخطأ قبل أن يصل إلى المتصفح.",
    demo: "tsTemplateLiteral",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `type Size = "sm" | "lg";
type Color = "red" | "blue";
type ClassName = \`btn-\${Size}-\${Color}\`;
type Action = "click" | "focus";
type Handler = \`on\${Capitalize<Action>}\`;
type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
type G = Getters<{ name: string; age: number }>;
const cls: ClassName = "btn-lg-red";
console.log(cls.split("-").length);`,
    },
    steps: [
      {
        line: null,
        say: "القالب `...${x}...` في JavaScript يركّب نصاً من قيم. وفي الأنواع يركّب نوع نص من أنواع. الفرق: الثقب في النوع قد يحمل اتحاداً، فيُركّب المدقّق كل الاحتمالات.",
        memory: [],
      },
      {
        line: 2,
        say: "اتحادان من نصوص حرفية: حجمان ولونان.",
        memory: [SIZE, COLOR],
        changed: ["Size", "Color"],
      },
      {
        line: 3,
        say: "يضع المدقّق الاتحادين في الثقبين.",
        memory: [SIZE, COLOR, ty("ClassName", '`btn-${"sm" | "lg"}-${"red" | "blue"}`')],
        changed: ["ClassName"],
        read: ["Size", "Color"],
      },
      {
        line: 3,
        say: "الثقب الأول يوزَّع: نسخة لـ sm ونسخة لـ lg. الثقب الثاني ما زال اتحاداً في كل نسخة.",
        memory: [SIZE, COLOR, ty("ClassName", '`btn-sm-${"red" | "blue"}` | `btn-lg-${"red" | "blue"}`')],
        changed: ["ClassName"],
      },
      {
        line: 3,
        say: "ثم الثقب الثاني في كل نسخة. النتيجة 2 × 2 = 4 نصوص حرفية، ولا شيء غيرها مقبول.",
        memory: [SIZE, COLOR, CLASS],
        changed: ["ClassName"],
      },
      {
        line: 5,
        say: "Capitalize دالة نصوص مبنية في المدقّق: تكبّر الحرف الأول. وتوزَّع على الاتحاد: \"click\" ثم \"focus\".",
        memory: [CLASS, ty("Handler", '"onClick" | "onFocus"')],
        changed: ["Handler"],
      },
      {
        line: 6,
        say: "القالب يعمل داخل mapped type أيضاً: as يعيد تسمية كل مفتاح. و string & K لأن المفاتيح قد تكون أرقاماً أو symbol، والقالب يقبل النصوص.",
        memory: [CLASS, ty("K", '"name"'), ty("new key", '`get${Capitalize<"name">}` → "getName"')],
        changed: ["K", "new key"],
      },
      {
        line: 7,
        say: "دورتان: name صار getName، و age صار getAge، وكل قيمة دالة ترجع نوع الحقل الأصلي.",
        memory: [CLASS, ty("G", "{ getName: () => string; getAge: () => number }")],
        changed: ["G"],
      },
      {
        line: 8,
        say: "\"btn-lg-red\" أحد النصوص الأربعة، فيُقبل. لو كتبت \"btn-md-red\" لرفضه المدقّق واقترح أقرب اسم صحيح.",
        memory: [CLASS, { name: "cls", value: '"btn-lg-red"', type: "string" }],
        changed: ["cls"],
        read: ["ClassName"],
      },
      {
        line: 9,
        say: "وقت التشغيل cls نص عادي. split يقطعه عند كل - فتخرج 3 قطع. يُطبع 3.",
        memory: [{ name: "cls", value: '"btn-lg-red"', type: "string" }],
        read: ["cls"],
        output: ["3"],
      },
    ],
    notes: {
      ts: "`a-${X}-${Y}` يبني نوع نص. إذا كان X أو Y اتحاداً خرج كل تركيب ممكن (حاصل ضرب). ومعه أربع دوال مبنية: Uppercase و Lowercase و Capitalize و Uncapitalize. و `${number}px` يقبل أي نص يبدأ برقم وينتهي بـ px.",
    },
  },
  playground: {
    kind: "trace",
    intro: "هذا ما يفعله المدقّق بالثقبين: حلقة داخل حلقة تركّب كل الاحتمالات. شغّل، ثم كبّر الاتحادات وراقب العدد يتضاعف.",
    starter: `const sizes = ["sm", "lg"];
const colors = ["red", "blue"];
const names = [];
for (const s of sizes) {
  for (const c of colors) {
    names.push("btn-" + s + "-" + c);
  }
}
console.log(names.length);
console.log(names.join(" | "));`,
    challenges: [
      "أضف \"md\" إلى sizes و \"green\" إلى colors. كم اسماً يخرج قبل أن تضغط؟",
      "أضف ثقباً ثالثاً: مصفوفة states فيها \"hover\" و \"active\" وحلقة ثالثة. هكذا ينفجر اتحاد كبير بسرعة، ولهذا يحدّ المدقّق عدد الأعضاء (نحو 100,000).",
      "اكتب حلقة تصنع \"on\" + الكلمة بحرف أول كبير لكل عنصر في [\"click\", \"focus\"]. هذا Capitalize موزّعاً.",
    ],
  },
  predict: [
    {
      question: "ما النوع R؟",
      code: 'type R = `${"a" | "b"}${"1" | "2"}`;',
      options: ['"a1" | "a2" | "b1" | "b2"', '"a1" | "b2"', '"ab12"'],
      answer: 0,
      why: "كل عضو في الثقب الأول يلتقي كل عضو في الثاني: 2 × 2 = 4. ليس اقتراناً بالترتيب، وليس لصقاً للاتحادين.",
      scene: check('type R = `${"a" | "b"}${"1" | "2"}`;', [
        { line: 1, say: "الثقب الأول: نسخة لـ a ونسخة لـ b.", memory: [ty("R", '`a${"1" | "2"}` | `b${"1" | "2"}`')], changed: ["R"] },
        { line: 1, say: "الثقب الثاني في كل نسخة.", memory: [ty("R", '"a1" | "a2" | "b1" | "b2"')], changed: ["R"] },
      ]),
    },
    {
      question: "أي سطر يرفضه tsc؟",
      code: 'type Route = `/users/${number}`;\nconst a: Route = "/users/42";\nconst b: Route = "/users/abc";',
      options: ["السطر 3", "السطر 2", "لا شيء"],
      answer: 0,
      why: "${number} ثقب لا يقبل إلا نصاً يُقرأ رقماً. \"42\" رقم، و \"abc\" ليس رقماً: Type '\"/users/abc\"' is not assignable to type '`/users/${number}`'.",
      scene: check('type Route = `/users/${number}`;\nconst a: Route = "/users/42";\nconst b: Route = "/users/abc";', [
        { line: 2, say: "يطابق /users/ ثم يسأل: هل \"42\" رقم؟ نعم.", memory: [ty("Route", "`/users/${number}`"), { name: "a", value: '"/users/42"', type: "string" }], changed: ["a"] },
        { line: 3, say: "\"abc\" لا يُقرأ رقماً.", memory: [ty("Route", "`/users/${number}`")], error: "Type '\"/users/abc\"' is not assignable to type '`/users/${number}`'." },
      ]),
    },
    {
      question: "ما النوع R؟",
      code: 'type R = Capitalize<"hello world">;',
      options: ['"Hello world"', '"Hello World"', '"HELLO WORLD"'],
      answer: 0,
      why: "Capitalize تكبّر الحرف الأول من النص كله فقط، ولا تعرف الكلمات. لكل الحروف استعمل Uppercase.",
      scene: check('type R = Capitalize<"hello world">;', [
        { line: 1, say: "الحرف الأول h يصير H. الباقي كما هو، والمسافة لا تعني شيئاً.", memory: [ty("R", '"Hello world"')], changed: ["R"] },
      ]),
    },
  ],
  code: {
    intro: "ثلاثة استعمالات حقيقية: أسماء معالِجات الأحداث (onClick)، ووحدات CSS ('12px')، و getters تُبنى من مفاتيح كائن. في كل مرة يُبنى النص وقت التشغيل بالطريقة نفسها التي يصفها النوع، وإلا كذب النوع.",
    runnerLang: "ts",
    runnerStarter: `function capitalize<S extends string>(s: S): Capitalize<S> {
  return (s.charAt(0).toUpperCase() + s.slice(1)) as Capitalize<S>;
}
function handlerName<E extends string>(event: E): \`on\${Capitalize<E>}\` {
  return \`on\${capitalize(event)}\`;
}
console.log(handlerName("click")); // tsc: "onClick"

type Px = \`\${number}px\`;
function px(n: number): Px {
  return \`\${n}px\`;
}
function addPx(a: Px, b: Px): Px {
  return px(parseFloat(a) + parseFloat(b));
}
console.log(addPx("12.5px", "4px"));

type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
function makeGetters<T extends object>(obj: T): Getters<T> {
  const out: Record<string, () => unknown> = {};
  for (const key of Object.keys(obj) as (keyof T & string)[]) {
    out["get" + capitalize(key)] = () => obj[key];
  }
  return out as Getters<T>;
}
const user = makeGetters({ name: "Sara", age: 20 });
console.log(user.getName(), user.getAge());
// try: addPx("12.5px", "4em") is rejected by tsc. What does it print here, where nobody checks?
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "وحدات CSS",
      prompt: "رتّب الكود: نوع Px، ودالة تصنعه، ودالة تجمع قيمتين. الناتج: 15px",
      lines: [
        "type Px = `${number}px`;",
        "function px(n: number): Px {",
        "  return `${n}px`;",
        "}",
        "function addPx(a: Px, b: Px): Px {",
        "  return px(parseFloat(a) + parseFloat(b));",
        "}",
        'console.log(addPx("10px", "5px"));',
      ],
      expected: "15px",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "Capitalize وقت التشغيل",
      prompt: "النوع Capitalize<S> يكبّر الحرف الأول فقط. أي تعبير يفعل الشيء نفسه بالنص؟ الناتج: onClick onFocus",
      template: `function capitalize<S extends string>(s: S): Capitalize<S> {
  return (___) as Capitalize<S>;
}
function handlerName<E extends string>(event: E): \`on\${Capitalize<E>}\` {
  return \`on\${capitalize(event)}\`;
}
console.log(handlerName("click"), handlerName("focus"));`,
      options: ["s.charAt(0).toUpperCase() + s.slice(1)", "s.toUpperCase()", "s.charAt(0).toUpperCase()"],
      expected: "onClick onFocus",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "getName ليست موجودة",
      prompt: "النوع يعد بـ getName و getAge، و tsc راضٍ. لكن الحلقة تصنع \"getname\" و \"getage\"، فينهار الاستدعاء. أصلح اسم المفتاح ليُطبع: Sara 20",
      code: `type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
function makeGetters<T extends object>(obj: T): Getters<T> {
  const out: Record<string, () => unknown> = {};
  for (const key of Object.keys(obj) as (keyof T & string)[]) {
    out["get" + key] = () => obj[key];
  }
  return out as Getters<T>;
}
const g = makeGetters({ name: "Sara", age: 20 });
console.log(g.getName(), g.getAge());`,
      expected: "Sara 20",
      hint: "النوع يكتب `get${Capitalize<K>}`. اكتب الشيء نفسه: \"get\" + key.charAt(0).toUpperCase() + key.slice(1).",
      solution: `type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
function makeGetters<T extends object>(obj: T): Getters<T> {
  const out: Record<string, () => unknown> = {};
  for (const key of Object.keys(obj) as (keyof T & string)[]) {
    out["get" + key.charAt(0).toUpperCase() + key.slice(1)] = () => obj[key];
  }
  return out as Getters<T>;
}
const g = makeGetters({ name: "Sara", age: 20 });
console.log(g.getName(), g.getAge());`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "كل الأسماء الممكنة",
      prompt: "الأنواع جاهزة. اكتب className(size: Size, color: Color): ClassName ترجع `btn-${size}-${color}`. ثم اطبع الأسماء الأربعة بحلقتين على sizes و colors في سطر واحد بينها مسافة: btn-sm-red btn-sm-blue btn-lg-red btn-lg-blue",
      starter: `type Size = "sm" | "lg";
type Color = "red" | "blue";
type ClassName = \`btn-\${Size}-\${Color}\`;
const sizes: Size[] = ["sm", "lg"];
const colors: Color[] = ["red", "blue"];
// write className, collect all four names, print them joined by " "
`,
      expected: "btn-sm-red btn-sm-blue btn-lg-red btn-lg-blue",
      hint: "const names: ClassName[] = []; حلقة على sizes وداخلها حلقة على colors، و names.push(className(s, c)). ثم names.join(\" \").",
      solution: `type Size = "sm" | "lg";
type Color = "red" | "blue";
type ClassName = \`btn-\${Size}-\${Color}\`;
const sizes: Size[] = ["sm", "lg"];
const colors: Color[] = ["red", "blue"];
function className(size: Size, color: Color): ClassName {
  return \`btn-\${size}-\${color}\`;
}
const names: ClassName[] = [];
for (const s of sizes) {
  for (const c of colors) {
    names.push(className(s, c));
  }
}
console.log(names.join(" "));`,
    },
  ],
  quiz: [
    {
      question: "ما النوع R؟",
      code: 'type R = Uppercase<"ok" | "no">;',
      options: ['"OK" | "NO"', '"OK"', "string"],
      answer: 0,
      why: "Uppercase توزَّع على الاتحاد كأي قالب: كل عضو يُكبَّر وحده، وتبقى النتيجة اتحاداً من نصوص حرفية.",
    },
    {
      question: "كم نصاً حرفياً في النوع T؟",
      code: 'type T = `${"a" | "b" | "c"}-${"x" | "y"}`;',
      options: ["6", "5", "2"],
      answer: 0,
      why: "3 احتمالات في الثقب الأول × 2 في الثاني = 6: a-x و a-y و b-x و b-y و c-x و c-y.",
    },
    {
      question: "أي قيمة يرفضها tsc للنوع Px؟",
      code: 'type Px = `${number}px`;\nconst a: Px = "12.5px";\nconst b: Px = "-3px";\nconst c: Px = "px";',
      options: ['"px" في السطر 4', '"-3px" في السطر 3', '"12.5px" في السطر 2'],
      answer: 0,
      why: "${number} يقبل أي نص يُقرأ رقماً، بالكسور والسالب. أما \"px\" فثقب الرقم فيه فارغ، والنص الفارغ ليس رقماً.",
    },
    {
      question: "ما النوع R؟",
      code: "type K = keyof { a: 1 };\ntype R = `get${K}`;",
      options: ['"geta"', '"getA"', "string"],
      answer: 0,
      why: "القالب يلصق النص كما هو. لا أحد كبّر الحرف: لتحصل على getA اكتب `get${Capitalize<K>}`.",
    },
    {
      question: "ماذا يقول tsc عن السطر 3؟",
      code: 'type Evt = `on${string}`;\nfunction listen(e: Evt) {}\nlisten("click");',
      options: ["Argument of type '\"click\"' is not assignable to parameter of type '`on${string}`'.", "لا خطأ: \"click\" نص", "لا خطأ: on تُضاف تلقائياً"],
      answer: 0,
      why: "`on${string}` يعني: نص يبدأ بـ on ثم أي شيء. القالب نوع يفحص، لا دالة تضيف: \"click\" لا يبدأ بـ on فيُرفض.",
    },
  ],
  next: "ts-infer",
};
