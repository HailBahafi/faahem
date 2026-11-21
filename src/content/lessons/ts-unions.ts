import type { Cell, Lesson, Scene } from "@/lib/types";

const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

/** The checker's view of id at this point, and the value id holds at run time. */
const view = (sees: string, value: string, type: Cell["type"]): Cell[] => [
  label("tsc sees id as", sees),
  { name: "id", value, type },
];

export const tsUnions: Lesson = {
  slug: "ts-unions",
  stage: 0,
  number: "1.4",
  title: "الاتحادات والتضييق",
  subtitle: "ملصق بعدة احتمالات، وكل if يشطب منها ما لا يمكن أن يكون",
  minutes: 20,
  problem: {
    title: "قيمة قد تكون أكثر من شيء",
    body: "المعرّف id قد يكون نصاً أو رقماً أو null. اختر عملية لتطبّقها عليه، ثم أضف فحوصاً قبلها. راقب بطاقات الاحتمالات: متى يسمح لك المدقّق؟",
    demo: "tsUnions",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `function label(id: string | number | null): string {
  if (id === null) {
    return "guest";
  }
  if (typeof id === "number") {
    return "#" + id.toFixed(0);
  }
  return id.toUpperCase();
}
console.log(label(7), label("ab"), label(null));`,
    },
    steps: [
      {
        line: null,
        say: "| تعني \"أو\". الملصق string | number | null قائمة احتمالات. سنتابع شيئين: القيمة الحقيقية في الدرج، وما يعرفه المدقّق عنها في كل سطر.",
        memory: [],
      },
      {
        line: 1,
        say: "المعامل id قد يكون أياً من الثلاثة. داخل الدالة يبدأ المدقّق بالقائمة كاملة.",
        memory: [label("tsc sees id as", "string | number | null")],
      },
      {
        line: 10,
        say: "الاستدعاء الأول label(7): الدرج id يحمل 7. المدقّق لا يعرف القيمة، يعرف القائمة فقط.",
        memory: view("string | number | null", "7", "number"),
        changed: ["id"],
      },
      {
        line: 2,
        say: "id === null؟ لا، 7 ليست null. ننتقل إلى السطر 5. والمدقّق يستنتج: من يصل إلى ما بعد هذا الـ if فليس null، لأن الـ if ينتهي بـ return.",
        memory: view("string | number", "7", "number"),
        read: ["id"],
        changed: ["tsc sees id as"],
      },
      {
        line: 5,
        say: "typeof id === \"number\"؟ نعم. داخل هذا الفرع شُطب string أيضاً: المدقّق متأكد أن id رقم.",
        memory: view("number", "7", "number"),
        read: ["id"],
        changed: ["tsc sees id as"],
      },
      {
        line: 6,
        say: "toFixed موجودة للأرقام فقط، والمدقّق يسمح بها لأن القائمة صارت number وحده. ترجع \"#7\".",
        memory: view("number", "7", "number"),
        read: ["id"],
      },
      {
        line: 8,
        say: "الاستدعاء الثاني label(\"ab\"): الفحصان كلاهما خطأ، فنصل إلى هنا. شُطب null ثم number، فبقي string: toUpperCase مسموحة وترجع \"AB\".",
        memory: view("string", '"ab"', "string"),
        read: ["id"],
        changed: ["id", "tsc sees id as"],
      },
      {
        line: 3,
        say: "الاستدعاء الثالث label(null): الفحص الأول صحيح، فترجع \"guest\" فوراً.",
        memory: view("null", "null", "none"),
        read: ["id"],
        changed: ["id", "tsc sees id as"],
      },
      {
        line: 10,
        say: "يُطبع #7 AB guest.",
        memory: [],
        output: ["#7 AB guest"],
      },
      {
        line: null,
        say: "لا شيء سحري وقت التشغيل: الـ if فحوص JavaScript عادية. المدقّق يقرؤها فقط، ويعرف في كل سطر ما بقي من القائمة. هذا اسمه التضييق.",
        memory: [],
      },
    ],
    notes: {
      ts: "الاتحاد A | B يقبل قيمة من أي منهما، لكنه لا يسمح إلا بما يصلح للجميع، حتى تضيّقه بفحص: typeof أو === أو in أو return مبكر.",
    },
  },
  playground: {
    kind: "trace",
    intro: "الدالة نفسها في JavaScript بلا أنواع. الفحوص هي نفسها، لكن لا أحد يتأكد أنك غطّيت كل الاحتمالات. شغّل، ثم جرّب قيمة لم تخطر للدالة.",
    starter: `function label(id) {
  if (id === null) {
    return "guest";
  }
  if (typeof id === "number") {
    return "#" + id;
  }
  return id.toUpperCase();
}
console.log(label(7));
console.log(label("ab"));
console.log(label(null));`,
    challenges: [
      "أضف console.log(label(undefined)). ماذا يحدث؟ وأي سطر انهار؟",
      "TypeScript كان سيرفض label(undefined) عند الاستدعاء، لأن undefined ليست في القائمة. أين كان سيظهر الخط الأحمر؟",
      "احذف الفحص الأول (الأسطر 2 إلى 4) وشغّل label(null). المدقّق كان سيقول: 'id' is possibly 'null'. ماذا تفعل JavaScript؟",
      "أصلح الدالة لتعامل undefined مثل null: غيّر id === null إلى id == null (يساويان معاً null و undefined).",
    ],
  },
  predict: [
    {
      question: "ماذا يقول tsc عن السطر 2؟",
      code: `function len(x: string | number) {
  return x.length;
}`,
      options: ["Property 'length' does not exist on type 'string | number'", "لا خطأ: النص له length", "لا خطأ، والرقم يرجع undefined"],
      answer: 0,
      why: "على الاتحاد لا يُسمح إلا بما يصلح لكل احتمال. للنص length وللرقم لا، فالمدقّق يرفض حتى تضيّق: if (typeof x === \"string\") return x.length;",
      scene: check(
        `function len(x: string | number) {
  return x.length;
}`,
        [
          { line: 1, say: "x قد يكون نصاً أو رقماً.", memory: [label("tsc sees x as", "string | number")] },
          { line: 2, say: "length للنص فقط. لم يُشطب number بعد، فخط أحمر.", memory: [label("tsc sees x as", "string | number")], error: "Property 'length' does not exist on type 'string | number'." },
        ],
      ),
    },
    {
      question: "يمر من tsc بلا خطأ. ماذا يُطبع؟",
      code: `function show(count: number | null): string {
  if (!count) {
    return "no data";
  }
  return "count: " + count;
}
console.log(show(0));`,
      options: ["no data", "count: 0", "خطأ عند التشغيل"],
      answer: 0,
      why: "!count صحيح لـ null، لكنه صحيح أيضاً لـ 0 لأن 0 قيمة \"كاذبة\" في JavaScript. المدقّق راضٍ (شُطب null)، والمنطق خاطئ. الفحص الدقيق: if (count === null).",
      scene: check(
        `function show(count: number | null): string {
  if (!count) {
    return "no data";
  }
  return "count: " + count;
}
console.log(show(0));`,
        [
          { line: 7, say: "show(0): الدرج count يحمل 0.", memory: [label("tsc sees count as", "number | null"), { name: "count", value: "0", type: "number" }] },
          { line: 2, say: "!0 صحيح، لأن 0 كاذبة. ندخل الفرع.", memory: [label("tsc sees count as", "number | null"), { name: "count", value: "0", type: "number" }], read: ["count"] },
          { line: 3, say: "ترجع \"no data\" مع أن عندنا رقماً حقيقياً: صفر.", memory: [{ name: "count", value: "0", type: "number" }], output: ["no data"] },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc عن السطر 3؟",
      code: `const names: string[] = ["sara", "omar"];
const found = names.find((n) => n.startsWith("z"));
console.log(found.toUpperCase());`,
      options: ["'found' is possibly 'undefined'", "لا خطأ: found نص", "لا خطأ، لكن يُطبع undefined"],
      answer: 0,
      why: "find قد لا تجد شيئاً، فنوع ما ترجعه string | undefined. المدقّق يجبرك على الاحتمال الثاني قبل التشغيل: found?.toUpperCase() أو if (found).",
      scene: check(
        `const names: string[] = ["sara", "omar"];
const found = names.find((n) => n.startsWith("z"));
console.log(found.toUpperCase());`,
        [
          { line: 2, say: "find ترجع العنصر أو undefined، فيكتب المدقّق على found: string | undefined.", memory: [label("found", "string | undefined")] },
          { line: 3, say: "toUpperCase على قيمة قد تكون undefined: خط أحمر. ولو عمل الكود لانهار، لأن لا اسم يبدأ بـ z.", memory: [label("found", "string | undefined")], error: "'found' is possibly 'undefined'." },
        ],
      ),
    },
  ],
  code: {
    intro: "أدوات التضييق التي يستعملها المحترفون كل يوم: typeof، و == null (يشمل null و undefined معاً)، و ?. التي تتوقف بهدوء عند غياب القيمة، و ?? التي تعطي بديلاً عند null أو undefined فقط.",
    runnerLang: "ts",
    runnerStarter: `function describe(value: string | number | null | undefined): string {
  if (value == null) {
    return "missing";
  }
  if (typeof value === "string") {
    return "text of length " + value.length;
  }
  return "number " + value.toFixed(2);
}
console.log(describe("tea"), "|", describe(3.5), "|", describe(null));

interface User {
  name: string;
  phone?: string;
}
const sara: User = { name: "Sara", phone: "0551234567" };
const omar: User = { name: "Omar" };
console.log(sara.phone?.slice(0, 3) ?? "no phone");
console.log(omar.phone?.slice(0, 3) ?? "no phone");
// try: describe(0) and describe(""). Are they "missing"? Why not?
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "ضيّق ثم استعمل",
      prompt: "رتّب الدالة: للنص ترجع طوله، وللرقم ترجعه كما هو. الناتج: 3 10",
      lines: ["function size(x: string | number): number {", '  if (typeof x === "string") {', "    return x.length;", "  }", "  return x;", "}", 'console.log(size("tea"), size(10));'],
      expected: "3 10",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "الصفر ليس غياباً",
      prompt: "أي فحص يطبع count: 0 لـ show(0)، و no data لـ show(null)؟",
      template: `function show(count: number | null): string {
  if (___) {
    return "no data";
  }
  return "count: " + count;
}
console.log(show(0));
console.log(show(null));`,
      options: ["!count", "count === null", "count === 0"],
      expected: "count: 0\nno data",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "الاسم الغائب",
      prompt: "الدالة تنهار حين يكون name غائباً. tsc كان سيقول: 'name' is possibly 'undefined'. أصلحها لترجع \"?\" عند الغياب، فيُطبع S ثم ?",
      code: `function initial(name: string | undefined): string {
  return name.slice(0, 1).toUpperCase();
}
console.log(initial("sara"));
console.log(initial(undefined));`,
      expected: "S\n?",
      hint: "أضف قبل return: if (name === undefined) { return \"?\"; }",
      solution: `function initial(name: string | undefined): string {
  if (name === undefined) {
    return "?";
  }
  return name.slice(0, 1).toUpperCase();
}
console.log(initial("sara"));
console.log(initial(undefined));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "رقم من أي مكان",
      prompt: "اكتب toNumber(v: string | number): number: إن كان v نصاً أرجع Number(v)، وإلا أرجع v. ثم اطبع toNumber(\"12\") + toNumber(3): 15",
      starter: "// write toNumber here, then print toNumber(\"12\") + toNumber(3)\n",
      expected: "15",
      hint: "if (typeof v === \"string\") { return Number(v); } return v;",
      solution: `function toNumber(v: string | number): number {
  if (typeof v === "string") {
    return Number(v);
  }
  return v;
}
console.log(toNumber("12") + toNumber(3));`,
    },
  ],
  quiz: [
    {
      question: "v نوعه string | number | boolean. ما نوعه عند المدقّق في السطر 5؟",
      code: 'function f(v: string | number | boolean) {\n  if (typeof v === "string") {\n    return v;\n  }\n  return v;\n}',
      options: ["number | boolean", "string | number | boolean", "string"],
      answer: 0,
      why: "السطر 5 بعد الـ if، والـ if ينتهي بـ return، فمن وصل هنا ليس نصاً. السطر يشبه السطر 3 تماماً، لكن القائمة مختلفة: string شُطب.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: "const a = 0 ?? 5;\nconst b = 0 || 5;\nconsole.log(a, b);",
      options: ["0 5", "5 5", "0 0"],
      answer: 0,
      why: "?? يستبدل null و undefined فقط، و 0 رقم حقيقي فيبقى. أما || فيستبدل كل قيمة كاذبة، و 0 منها. لهذا ?? هي الصحيحة للأرقام التي قد تكون صفراً.",
    },
    {
      question: "أي سطر يرفضه tsc؟",
      code: 'let id: string | number = 5;\nid = "A5";\nid = true;',
      options: ["السطر 3", "السطر 2", "لا شيء"],
      answer: 0,
      why: "الملصق قائمة من احتمالين: نص أو رقم. \"A5\" نص فيدخل، و true منطقية ليست في القائمة: Type 'boolean' is not assignable to type 'string | number'.",
    },
    {
      question: "في السطر 5، ما نوع a عند المدقّق؟",
      code: 'type Cat = { meow: () => string };\ntype Dog = { bark: () => string };\nfunction speak(a: Cat | Dog): string {\n  if ("meow" in a) return a.meow();\n  return a.bark();\n}',
      options: ["Dog", "Cat | Dog", "Cat"],
      answer: 0,
      why: "\"meow\" in a يسأل وقت التشغيل: هل في الكائن حقل اسمه meow؟ إن كان نعم فهو Cat ونرجع. من وصل إلى السطر 5 ليس فيه meow، فبقي Dog، و bark مسموحة.",
    },
    {
      question: "في السطر 5، ما نوع p عند المدقّق؟",
      code: 'function double(p: number | undefined): number {\n  if (p === undefined) {\n    throw new Error("no price");\n  }\n  return p * 2;\n}',
      options: ["number", "number | undefined", "any"],
      answer: 0,
      why: "throw ينهي الدالة مثل return. فمن وصل إلى السطر 5 ليس undefined. المدقّق يتتبّع كل طرق الخروج، فيسمح بـ p * 2 بلا شكوى.",
    },
  ],
  next: "ts-functions",
};
