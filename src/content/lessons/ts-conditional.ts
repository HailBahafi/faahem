import type { Cell, Lesson, Scene } from "@/lib/types";

/** A type the checker holds: its name and the expression it has rewritten it to so far. */
const ty = (name: string, expr: string): Cell => ({ name, value: expr, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const RULE = ty("IsText<T>", 'T extends string ? "text" : "other"');

export const tsConditional: Lesson = {
  slug: "ts-conditional",
  stage: 0,
  number: "3.1",
  title: "الأنواع الشرطية",
  subtitle: "if يعمل على الأنواع: المدقّق يسأل سؤالاً ويختار فرعاً، لكل عضو في الاتحاد وحده",
  minutes: 25,
  problem: {
    title: "نوع يتغيّر بحسب نوع آخر",
    body: "اختر أعضاء الاتحاد T، ثم اختر القاعدة، واضغط «قيّم». راقب الآلة: كل عضو يدخل السؤال وحده، والنتائج تُجمع في اتحاد جديد. ماذا يحدث لـ never؟",
    demo: "tsConditional",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `type IsText<T> = T extends string ? "text" : "other";
type A = IsText<"hi">;
type B = IsText<42>;
type C = IsText<string | number>;
type NoNull<T> = T extends null | undefined ? never : T;
type D = NoNull<string | null | undefined>;
function kind<T>(value: T): IsText<T> {
  return (typeof value === "string" ? "text" : "other") as IsText<T>;
}
console.log(kind("hi"), kind(42));`,
    },
    steps: [
      {
        line: null,
        say: "في هذا المستوى نبرمج المدقّق نفسه. المدقّق آلة تقيّم الأنواع كما تقيّم JavaScript التعابير: تعيد كتابة التعبير خطوة خطوة حتى يصير نوعاً بسيطاً. كل هذا يحدث قبل التشغيل، ثم يُمحى.",
        memory: [],
      },
      {
        line: 1,
        say: "هذه دالة على الأنواع: تأخذ T وترجع نوعاً. extends هنا سؤال: هل T يدخل في string؟ نعم يعطي الفرع الأول، لا يعطي الثاني. لا شيء يُقيَّم بعد.",
        memory: [RULE],
        changed: ["IsText<T>"],
      },
      {
        line: 2,
        say: "IsText<\"hi\">: يضع المدقّق \"hi\" مكان T في القاعدة، كما تضع الدالة قيمة مكان معاملها.",
        memory: [RULE, ty("A", '"hi" extends string ? "text" : "other"')],
        changed: ["A"],
        read: ["IsText<T>"],
      },
      {
        line: 2,
        say: "هل النص الحرفي \"hi\" يدخل في string؟ نعم. فيختار الفرع الأول: A صار \"text\".",
        memory: [RULE, ty("A", '"text"')],
        changed: ["A"],
      },
      {
        line: 3,
        say: "42 extends string؟ لا، الرقم ليس نصاً. الفرع الثاني: B صار \"other\".",
        memory: [RULE, ty("A", '"text"'), ty("B", '"other"')],
        changed: ["B"],
      },
      {
        line: 4,
        say: "الآن اتحاد. T معامل عارٍ (لم يُلفّ بشيء)، فالمدقّق لا يسأل عن الاتحاد كله: يوزّع القاعدة على كل عضو وحده.",
        memory: [RULE, ty("A", '"text"'), ty("B", '"other"'), ty("C", "IsText<string> | IsText<number>")],
        changed: ["C"],
      },
      {
        line: 4,
        say: "string يعطي \"text\"، و number يعطي \"other\". ثم تُجمع النتائج في اتحاد جديد.",
        memory: [RULE, ty("A", '"text"'), ty("B", '"other"'), ty("C", '"text" | "other"')],
        changed: ["C"],
      },
      {
        line: 6,
        say: "القاعدة NoNull توزَّع على الأعضاء الثلاثة: string يبقى، و null و undefined يصيران never.",
        memory: [ty("C", '"text" | "other"'), ty("D", "string | never | never")],
        changed: ["D"],
      },
      {
        line: 6,
        say: "never هو الاتحاد الفارغ: لا قيمة فيه. وجمع لا شيء مع string يعطي string. هكذا تحذف الأنواع الشرطية أعضاء من اتحاد.",
        memory: [ty("C", '"text" | "other"'), ty("D", "string")],
        changed: ["D"],
      },
      {
        line: 7,
        say: "نوع ما ترجعه kind يحسبه المدقّق عند كل استدعاء: kind(\"hi\") نوعها \"text\"، و kind(42) نوعها \"other\".",
        memory: [ty("kind(\"hi\")", '"text"'), ty("kind(42)", '"other"')],
        changed: ["kind(\"hi\")", "kind(42)"],
      },
      {
        line: 8,
        say: "وقت التشغيل لا أنواع. القاعدة اختفت، فنكتب فحصاً حقيقياً بـ typeof. و as تقول للمدقّق: ثق بي. المسؤولية الآن عليك: يجب أن يطابق الفحص القاعدة.",
        memory: [{ name: "value", value: '"hi"', type: "string" }],
        read: ["value"],
      },
      {
        line: 10,
        say: "يُطبع text other. القاعدة على الأنواع والفحص على القيم قالا الشيء نفسه.",
        memory: [],
        output: ["text other"],
      },
    ],
    notes: {
      ts: "T extends U ? X : Y هو if على الأنواع. إذا كان T معاملاً عارياً واستقبل اتحاداً، يوزَّع الشرط على كل عضو. لفّه بقوسين [T] extends [U] لتسأل عن الاتحاد كله مرة واحدة.",
    },
  },
  playground: {
    kind: "trace",
    intro: "المدقّق لا يعمل وقت التشغيل، لكن يمكنك محاكاة ما يفعله. هنا الاتحاد مصفوفة أسماء، والتوزيع حلقة تمر على كل عضو وحده. شغّل وراقب.",
    starter: `const union = ["string", "number", "null"];
const results = [];
for (const member of union) {
  const out = member === "null" ? "never" : member;
  console.log(member + " extends null ? never : " + member + "  ->  " + out);
  if (out !== "never") {
    results.push(out);
  }
}
console.log("NoNull = " + results.join(" | "));`,
    challenges: [
      "أضف \"undefined\" إلى الاتحاد، وغيّر الشرط ليحذف null و undefined معاً. ما الناتج؟",
      "اجعل الاتحاد [\"null\"] فقط. ماذا يبقى في results؟ المدقّق يكتب هذه النتيجة never.",
      "حوّل القاعدة إلى IsText: الناتج \"text\" إن كان member هو \"string\"، وإلا \"other\". لماذا يظهر \"other\" مرة واحدة في الاتحاد النهائي لو أضفت عضوين ليسا نصاً؟ (أضف شرطاً يمنع التكرار.)",
    ],
  },
  predict: [
    {
      question: "ما النوع R؟",
      code: `type ToArray<T> = T extends unknown ? T[] : never;
type R = ToArray<string | number>;`,
      options: ["string[] | number[]", "(string | number)[]", "never"],
      answer: 0,
      why: "T عارٍ، فالشرط يوزَّع: ToArray<string> | ToArray<number>، أي string[] | number[]. مصفوفة نصوص أو مصفوفة أرقام، لا مصفوفة تخلط بينهما. لتحصل على (string | number)[] لفّ T: [T] extends [unknown].",
      scene: check(
        `type ToArray<T> = T extends unknown ? T[] : never;
type R = ToArray<string | number>;`,
        [
          { line: 2, say: "T عارٍ واستقبل اتحاداً: التوزيع.", memory: [ty("R", "ToArray<string> | ToArray<number>")], changed: ["R"] },
          { line: 2, say: "كل عضو يدخل في unknown، فكل واحد يصير مصفوفته.", memory: [ty("R", "string[] | number[]")], changed: ["R"] },
        ],
      ),
    },
    {
      question: "ما النوع R؟",
      code: `type IsNever<T> = T extends never ? true : false;
type R = IsNever<never>;`,
      options: ["never", "true", "false"],
      answer: 0,
      why: "never اتحاد فارغ. التوزيع يمر على كل عضو، ولا أعضاء هنا، فلا سؤال يُسأل والنتيجة اتحاد فارغ: never. الطريقة الصحيحة: [T] extends [never] ? true : false.",
      scene: check(
        `type IsNever<T> = T extends never ? true : false;
type R = IsNever<never>;`,
        [
          { line: 2, say: "never هو الاتحاد الفارغ. التوزيع يمر على أعضائه: صفر عضو.", memory: [ty("R", "(no members)")], changed: ["R"] },
          { line: 2, say: "لا نتائج تُجمع، فالناتج اتحاد فارغ.", memory: [ty("R", "never")], changed: ["R"] },
        ],
      ),
    },
    {
      question: "ما النوع R؟",
      code: `type IsStr<T> = [T] extends [string] ? "yes" : "no";
type R = IsStr<string | number>;`,
      options: ['"no"', '"yes" | "no"', '"yes"'],
      answer: 0,
      why: "القوسان يلفّان T، فلم يعد عارياً ولا توزيع. يُسأل عن الاتحاد كله: هل [string | number] يدخل في [string]؟ لا، لأن number لا يدخل. فالجواب \"no\" مرة واحدة.",
      scene: check(
        `type IsStr<T> = [T] extends [string] ? "yes" : "no";
type R = IsStr<string | number>;`,
        [
          { line: 2, say: "T ملفوف في [ ]: لا توزيع. السؤال عن الاتحاد كاملاً.", memory: [ty("R", '[string | number] extends [string] ? "yes" : "no"')], changed: ["R"] },
          { line: 2, say: "الاتحاد فيه number، فلا يدخل كله في string. الفرع الثاني.", memory: [ty("R", '"no"')], changed: ["R"] },
        ],
      ),
    },
  ],
  code: {
    intro: "المحترفون يستعملون الأنواع الشرطية ليجعلوا نوع الناتج يتبع نوع المدخل. لاحظ الشيء الذي يتكرر: المدقّق لا يستطيع تضييق T داخل الدالة، فيُكتب as مرة واحدة، والفحص الحقيقي (typeof أو != null) يجب أن يقول ما تقوله القاعدة.",
    runnerLang: "ts",
    runnerStarter: `// The return type follows the argument type.
type Parsed<T extends string | number> = T extends string ? number : string;

function flip<T extends string | number>(value: T): Parsed<T> {
  return (typeof value === "string" ? Number(value) : String(value)) as Parsed<T>;
}
const n = flip("42"); // tsc: number
const s = flip(7); // tsc: string
console.log(n + 1, s + "!");

// Filtering a union: the type and the run-time check must agree.
type NoNull<T> = T extends null | undefined ? never : T;

function compact<T>(items: T[]): NoNull<T>[] {
  return items.filter((x): x is NoNull<T> => x != null);
}
const names = compact(["sara", null, "omar", undefined]); // tsc: string[]
console.log(names.length, names.join(","));
// try: add "" to the array. Does it stay? NoNull keeps every string, and != null keeps it too.
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "نوع يتبع المدخل",
      prompt: "رتّب الكود: flip تحوّل النص إلى رقم والرقم إلى نص. الناتج: 43 7!",
      lines: [
        "type Parsed<T extends string | number> = T extends string ? number : string;",
        "function flip<T extends string | number>(value: T): Parsed<T> {",
        '  return (typeof value === "string" ? Number(value) : String(value)) as Parsed<T>;',
        "}",
        'console.log(flip("42") + 1, flip(7) + "!");',
      ],
      expected: "43 7!",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "الفحص يطابق القاعدة",
      prompt: "NoNull يحذف null و undefined فقط، ويُبقي النص الفارغ. أي فحص يقول الشيء نفسه وقت التشغيل؟ الناتج: 2",
      template: `type NoNull<T> = T extends null | undefined ? never : T;
function compact<T>(items: T[]): NoNull<T>[] {
  return items.filter((x): x is NoNull<T> => ___);
}
console.log(compact(["a", null, "", undefined]).length);`,
      options: ["x != null", "x !== null", "!!x"],
      expected: "2",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "as لا يفحص شيئاً",
      prompt: "القاعدة تقول: الرقم \"number\" والنص \"text\". لكن الفحص مقلوب، و tsc صامت لأن as أسكته. أصلح الفحص ليُطبع: number text number",
      code: `type Kind<T> = T extends number ? "number" : "text";
function kindOf<T extends number | string>(value: T): Kind<T> {
  return (typeof value === "string" ? "number" : "text") as Kind<T>;
}
console.log(kindOf(5), kindOf("a"), kindOf(0));`,
      expected: "number text number",
      hint: "الفحص يجب أن يسأل ما تسأله القاعدة: typeof value === \"number\".",
      solution: `type Kind<T> = T extends number ? "number" : "text";
function kindOf<T extends number | string>(value: T): Kind<T> {
  return (typeof value === "number" ? "number" : "text") as Kind<T>;
}
console.log(kindOf(5), kindOf("a"), kindOf(0));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "العنصر أو القيمة",
      prompt: "النوع ElementOrSelf<T> جاهز: لمصفوفة يعطي نوع عناصرها، ولغيرها يعطي T نفسه. اكتب first<T>(x: T): ElementOrSelf<T> ترجع العنصر الأول إن كان x مصفوفة، وإلا ترجع x. ثم اطبع first([3, 4]) و first(9): 3 9",
      starter: `type ElementOrSelf<T> = T extends readonly unknown[] ? T[number] : T;
// write first here, then print first([3, 4]) and first(9)
`,
      expected: "3 9",
      hint: "Array.isArray(x) هو الفحص وقت التشغيل الذي يطابق T extends readonly unknown[]. ثم as ElementOrSelf<T>.",
      solution: `type ElementOrSelf<T> = T extends readonly unknown[] ? T[number] : T;
function first<T>(x: T): ElementOrSelf<T> {
  return (Array.isArray(x) ? x[0] : x) as ElementOrSelf<T>;
}
console.log(first([3, 4]), first(9));`,
    },
  ],
  quiz: [
    {
      question: "Exclude مكتوبة هكذا: T extends U ? never : T. ما النوع R؟",
      code: 'type R = Exclude<"a" | "b" | "c", "a" | "c">;',
      options: ['"b"', '"a" | "c"', "never"],
      answer: 0,
      why: "توزيع على ثلاثة أعضاء: \"a\" يدخل في U فيصير never، و \"b\" لا يدخل فيبقى، و \"c\" يصير never. يبقى \"b\". الأنواع المساعدة التي استعملتها في المستوى السابق أنواع شرطية بهذا الشكل.",
    },
    {
      question: "boolean في المدقّق هو الاتحاد true | false. ما النوع R؟",
      code: 'type Flag<T> = T extends boolean ? "flag" : "value";\ntype R = Flag<boolean>;',
      options: ['"flag"', '"flag" | "value"', "boolean"],
      answer: 0,
      why: "التوزيع على true ثم على false: كلاهما يدخل في boolean، فكلاهما \"flag\". والاتحاد \"flag\" | \"flag\" هو \"flag\" وحده.",
    },
    {
      question: "ما النوع R؟ (لا معامل هنا، الاتحاد مكتوب مباشرة.)",
      code: "type R = string | number extends string ? 1 : 2;",
      options: ["2", "1 | 2", "1"],
      answer: 0,
      why: "التوزيع يحدث فقط حين يكون المسؤول عنه معاملاً عارياً مثل T. هنا الاتحاد مكتوب مباشرة، فيُسأل عنه كله مرة واحدة: string | number لا يدخل كله في string، فالجواب 2.",
    },
    {
      question: "أي رسالة يكتبها tsc عن السطر 2؟",
      code: 'type IsText<T> = T extends string ? "text" : "other";\nconst a: IsText<42> = "text";',
      options: ["Type '\"text\"' is not assignable to type '\"other\"'.", "لا خطأ", "Type 'string' is not assignable to type 'number'."],
      answer: 0,
      why: "المدقّق يقيّم IsText<42> أولاً: 42 ليس نصاً فيصير \"other\". ثم يقارن القيمة \"text\" بالنوع \"other\" فيرفض.",
    },
    {
      question: "ما النوع R؟",
      code: "type Wrap<T> = T extends any ? { v: T } : never;\ntype R = Wrap<\"a\" | \"b\">;",
      options: ['{ v: "a" } | { v: "b" }', '{ v: "a" | "b" }', "never"],
      answer: 0,
      why: "T عارٍ: كل عضو يُلفّ وحده، فيخرج كائنان مختلفان في اتحاد. الشكل { v: \"a\" | \"b\" } يخرج فقط لو لم يكن توزيع، أي لو كتبت { v: T } بلا شرط.",
    },
  ],
  next: "ts-mapped",
};
