import type { Cell, Lesson, Scene } from "@/lib/types";

/** A type the checker holds: its name and what it currently is. */
const ty = (name: string, expr: string): Cell => ({ name, value: expr, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const USER_ID = ty("UserId", 'string & { __brand: "UserId" }');
const ORDER_ID = ty("OrderId", 'string & { __brand: "OrderId" }');
const ID: Cell = { name: "id", value: '"u_7"', type: "string" };

export const tsBranded: Lesson = {
  slug: "ts-branded",
  stage: 0,
  number: "3.5",
  title: "الأنواع الموسومة",
  subtitle: "ملصق يراه المدقّق وحده: نصّان متطابقان في الذاكرة، ومختلفان في النوع",
  minutes: 25,
  problem: {
    title: "معرّفان من النوع نفسه",
    body: "الدالة charge تأخذ معرّف مستخدم ومعرّف طلب، وكلاهما نص. بدّل ترتيبهما بالزر، ثم شغّل الوسوم وأطفئها. متى يلتقط المدقّق الخطأ قبل أن يُخصم المبلغ من الحساب الخطأ؟",
    demo: "tsBranded",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };
function userId(raw: string): UserId {
  if (!/^u_\\d+$/.test(raw)) throw new Error("bad user id: " + raw);
  return raw as UserId;
}
function loadUser(id: UserId): string { return "user " + id; }
const id = userId("u_7");
console.log(loadUser(id), typeof id);`,
    },
    steps: [
      {
        line: null,
        say: "المدقّق يقارن الأشكال لا الأسماء. type UserId = string و type OrderId = string اسمان لشيء واحد، فيقبل أحدهما مكان الآخر بصمت. نريد نصاً يحمل ملصقاً.",
        memory: [],
      },
      {
        line: 1,
        say: "& تعني \"و\": نص، وله أيضاً حقل __brand قيمته \"UserId\". لا يوجد نص بهذا الحقل وقت التشغيل: هو ملصق يراه المدقّق فقط.",
        memory: [USER_ID],
        changed: ["UserId"],
      },
      {
        line: 2,
        say: "OrderId له الشكل نفسه بملصق آخر. لأن \"UserId\" و \"OrderId\" نصان حرفيان مختلفان، صار النوعان مختلفين.",
        memory: [USER_ID, ORDER_ID],
        changed: ["OrderId"],
      },
      {
        line: 3,
        say: "لا قيمة تحمل الملصق من تلقاء نفسها، فنصنع باباً واحداً يدخل منه النص: دالة تفحص ثم تلصق. اسمها smart constructor.",
        memory: [USER_ID, ORDER_ID, { name: "raw", value: '"u_7"', type: "string" }],
        changed: ["raw"],
      },
      {
        line: 4,
        say: "الفحص حقيقي، وقت التشغيل: هل يبدأ بـ u_ ثم أرقام؟ \"u_7\" يمر. نص مثل \"7\" كان سيرمي خطأ هنا، عند الباب.",
        memory: [USER_ID, ORDER_ID, { name: "raw", value: '"u_7"', type: "string" }],
        read: ["raw"],
      },
      {
        line: 5,
        say: "as UserId يلصق الملصق. هذا المكان الوحيد في البرنامج الذي يُكتب فيه as UserId، وبعد فحص.",
        memory: [USER_ID, ORDER_ID, ty("tsc sees raw as", "UserId")],
        changed: ["tsc sees raw as"],
      },
      {
        line: 8,
        say: "في الذاكرة id نص عادي \"u_7\". والمدقّق يكتب عليه UserId.",
        memory: [USER_ID, ty("tsc sees id as", "UserId"), ID],
        changed: ["id", "tsc sees id as"],
      },
      {
        line: 7,
        say: "لو كتبنا loadUser(\"u_7\") مباشرة لرُفض: النص بلا ملصق، فلم يمر من الباب.",
        memory: [USER_ID, ty("tsc sees id as", "UserId"), ID],
        error: "Argument of type 'string' is not assignable to parameter of type 'UserId'.",
      },
      {
        line: 7,
        say: "ولو مررنا OrderId لقارن المدقّق الملصقين ورفض: Type '\"OrderId\"' is not assignable to type '\"UserId\"'. هذا هو الخطأ الذي كان يمر بصمت.",
        memory: [USER_ID, ORDER_ID, ty("tsc sees id as", "UserId"), ID],
        error: "Type '\"OrderId\"' is not assignable to type '\"UserId\"'.",
      },
      {
        line: 9,
        say: "loadUser(id) مقبول. وtypeof id يقول string: الملصق لم يصل إلى الذاكرة. الأمان كله وقت الكتابة، والتكلفة وقت التشغيل صفر.",
        memory: [ID],
        read: ["id"],
        output: ["user u_7 string"],
      },
    ],
    notes: {
      ts: "TypeScript يقارن الأشكال (structural)، فالوسم يضيف إلى الشكل حقلاً وهمياً: T & { readonly __brand: \"Name\" }. القيمة لا تتغير، و as يُكتب مرة واحدة فقط داخل دالة تفحص.",
    },
  },
  playground: {
    kind: "trace",
    intro: "الملصق لا يوجد وقت التشغيل، لكن الباب يوجد: دالة تفحص كل نص قبل أن تقبله. شغّل وراقب أي القيم تمر.",
    starter: `function userId(raw) {
  if (raw.slice(0, 2) !== "u_") {
    throw new Error("bad user id: " + raw);
  }
  return raw;
}
const inputs = ["u_1", "o_2", "u_3"];
for (const raw of inputs) {
  try {
    console.log("ok " + userId(raw));
  } catch (e) {
    console.log(e.message);
  }
}`,
    challenges: [
      "أضف \"u_\" وحده إلى inputs. هل يمر؟ هل هذا ما تريده؟ شدّد الفحص: الطول أكبر من 2.",
      "اكتب orderId بالطريقة نفسها للبادئة \"o_\". في TypeScript ترجع OrderId، فلا يختلط الاثنان بعدها أبداً.",
      "أين يقع الخطأ لو جاء النص من رابط فيه \"o_2\"؟ عند الباب، مرة واحدة، لا في عمق البرنامج.",
    ],
  },
  predict: [
    {
      question: "ماذا يُطبع، وما نوع total عند المدقّق؟",
      code: `type Usd = number & { readonly __brand: "Usd" };
const price = 5 as Usd;
const total = price + 1;
console.log(total);`,
      options: ["6، ونوعه number", "6، ونوعه Usd", "NaN، لأن __brand ليس رقماً"],
      answer: 0,
      why: "وقت التشغيل price الرقم 5 فقط، فالجمع عادي. والمدقّق يعرف أن + على رقمين يعطي number، فالملصق يسقط. هذا مقصود: الناتج لم يمر من الباب، فلا يحمل الملصق حتى تمرّره.",
      scene: check(
        `type Usd = number & { readonly __brand: "Usd" };
const price = 5 as Usd;
const total = price + 1;
console.log(total);`,
        [
          { line: 2, say: "في الذاكرة 5. المدقّق يرى Usd.", memory: [ty("tsc sees price as", "Usd"), { name: "price", value: "5", type: "number" }], changed: ["price"] },
          { line: 3, say: "رقم + رقم يعطي number عند المدقّق، بلا ملصق.", memory: [ty("tsc sees total as", "number"), { name: "total", value: "6", type: "number" }], changed: ["total"] },
          { line: 4, say: "يُطبع 6.", memory: [{ name: "total", value: "6", type: "number" }], read: ["total"], output: ["6"] },
        ],
      ),
    },
    {
      question: "هل يرفض tsc السطر 5؟",
      code: `type UserId = string;
type OrderId = string;
function load(id: UserId) {}
const order: OrderId = "o_1";
load(order);`,
      options: ["لا، يقبله", "نعم: OrderId ليس UserId", "نعم: o_1 لا يبدأ بـ u_"],
      answer: 0,
      why: "type يعطي اسماً جديداً فقط. UserId و OrderId كلاهما string بالشكل نفسه، والمدقّق يقارن الأشكال. لهذا نحتاج الوسم.",
      scene: check(
        `type UserId = string;
type OrderId = string;
function load(id: UserId) {}
const order: OrderId = "o_1";
load(order);`,
        [
          { line: 2, say: "اسمان، والشيء واحد: string.", memory: [ty("UserId", "string"), ty("OrderId", "string")] },
          { line: 5, say: "string مكان string: مقبول، والخطأ يمر.", memory: [ty("UserId", "string"), ty("OrderId", "string"), { name: "order", value: '"o_1"', type: "string" }], read: ["order"] },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc عن السطر 2؟",
      code: `type UserId = string & { readonly __brand: "UserId" };
const id: UserId = "u_1";`,
      options: ["Type 'string' is not assignable to type 'UserId'.", "لا خطأ: \"u_1\" نص", "Property '__brand' is missing"],
      answer: 0,
      why: "النص الحرفي ليس فيه الملصق، والطريقة الوحيدة للحصول عليه هي المرور من الباب userId(\"u_1\"). الرسالة الكاملة تكمل: Type 'string' is not assignable to type '{ readonly __brand: \"UserId\"; }'.",
      scene: check(
        `type UserId = string & { readonly __brand: "UserId" };
const id: UserId = "u_1";`,
        [
          { line: 2, say: "المدقّق يطلب نصاً وملصقاً. \"u_1\" نص بلا ملصق.", memory: [ty("UserId", 'string & { __brand: "UserId" }')], error: "Type 'string' is not assignable to type 'UserId'." },
        ],
      ),
    },
  ],
  code: {
    intro: "الصيغة المحترفة: نوع مساعد Brand واحد، والملصق مفتاحه unique symbol حتى لا يظهر حقل __brand في الإكمال التلقائي ولا يتصادم مع حقل حقيقي. declare const لا يُنتج كوداً، فلا شيء منه يبقى وقت التشغيل. لاحظ أن الباب يطبّع القيمة أيضاً، فكل Email في البرنامج مكتوب بحروف صغيرة بلا مسافات.",
    runnerLang: "ts",
    runnerStarter: `declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

type Email = Brand<string, "Email">;
type Halalas = Brand<number, "Halalas">;

function email(raw: string): Email {
  const value = raw.trim().toLowerCase();
  if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(value)) throw new Error("bad email: " + raw);
  return value as Email;
}
function halalas(n: number): Halalas {
  if (!Number.isInteger(n) || n < 0) throw new RangeError("bad amount: " + n);
  return n as Halalas;
}
function sendReceipt(to: Email, amount: Halalas): string {
  return \`\${to}: \${(amount / 100).toFixed(2)} SAR\`;
}

console.log(sendReceipt(email("  Sara@Example.com "), halalas(1250)));
// sendReceipt("sara@example.com", 1250) is rejected by tsc: a raw string is not an Email.
try {
  halalas(12.5);
} catch (e) {
  console.log((e as Error).message);
}
// try: email("sara.example.com"). Where does it fail, and why is that the best place?
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "الباب",
      prompt: "رتّب النوع الموسوم وبابه واستعماله. الناتج: sara@example.com",
      lines: [
        'type Email = string & { readonly __brand: "Email" };',
        "function email(raw: string): Email {",
        "  const value = raw.trim().toLowerCase();",
        '  if (!value.includes("@")) throw new Error("bad email: " + raw);',
        "  return value as Email;",
        "}",
        'console.log(email("  Sara@Example.com "));',
      ],
      expected: "sara@example.com",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "نسبة مئوية حقيقية",
      prompt: "Percent يعد بأن الرقم بين 0 و 100. أي فحص يحفظ الوعد؟ الناتج: ok ok bad bad",
      template: `type Percent = number & { readonly __brand: "Percent" };
function percent(n: number): Percent {
  if (!(___)) throw new RangeError("not a percent: " + n);
  return n as Percent;
}
const results: string[] = [];
for (const n of [0, 100, 101, -5]) {
  try {
    percent(n);
    results.push("ok");
  } catch {
    results.push("bad");
  }
}
console.log(results.join(" "));`,
      options: ["n >= 0 && n <= 100", "n > 0", "n <= 100"],
      expected: "ok ok bad bad",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "ملصق بلا فحص",
      prompt: "slug يلصق الملصق دون أن يجعل النص slug حقيقياً، فيمر \"  Hello World \" كما هو. اجعل الباب يطبّع: بلا مسافات في الطرفين، بحروف صغيرة، والمسافات الداخلية شرطات. الناتج: /articles/hello-world",
      code: `type Slug = string & { readonly __brand: "Slug" };
function slug(raw: string): Slug {
  return raw as Slug;
}
function articleUrl(s: Slug): string {
  return "/articles/" + s;
}
console.log(articleUrl(slug("  Hello World ")));`,
      expected: "/articles/hello-world",
      hint: "return raw.trim().toLowerCase().replace(/\\s+/g, \"-\") as Slug;",
      solution: `type Slug = string & { readonly __brand: "Slug" };
function slug(raw: string): Slug {
  return raw.trim().toLowerCase().replace(/\\s+/g, "-") as Slug;
}
function articleUrl(s: Slug): string {
  return "/articles/" + s;
}
console.log(articleUrl(slug("  Hello World ")));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "عدد صحيح موجب",
      prompt: "اكتب positiveInt(n: number): PositiveInt: ترمي RangeError برسالة \"not a positive integer: \" + n إلا إذا كان n عدداً صحيحاً أكبر من 0. اطبع positiveInt(3)، ثم داخل try/catch اطبع رسالة خطأ positiveInt(-1). الناتج سطران: 3 ثم not a positive integer: -1",
      starter: `type PositiveInt = number & { readonly __brand: "PositiveInt" };
// write positiveInt here, print positiveInt(3), then print the message from positiveInt(-1)
`,
      expected: "3\nnot a positive integer: -1",
      hint: "if (!Number.isInteger(n) || n <= 0) throw new RangeError(...); return n as PositiveInt; وفي catch: console.log((e as Error).message).",
      solution: `type PositiveInt = number & { readonly __brand: "PositiveInt" };
function positiveInt(n: number): PositiveInt {
  if (!Number.isInteger(n) || n <= 0) throw new RangeError("not a positive integer: " + n);
  return n as PositiveInt;
}
console.log(positiveInt(3));
try {
  positiveInt(-1);
} catch (e) {
  console.log((e as Error).message);
}`,
    },
  ],
  quiz: [
    {
      question: "id = userId(\"u_7\") من المشهد. ماذا يطبع console.log(typeof id)؟",
      options: ["string", "UserId", "object"],
      answer: 0,
      why: "الملصق موجود في المدقّق فقط. في الذاكرة id نص عادي، و typeof يسأل الذاكرة.",
    },
    {
      question: "هل يقبل tsc السطر 3؟",
      code: 'type UserId = string & { readonly __brand: "UserId" };\ndeclare const id: UserId;\nconst plain: string = id;',
      options: ["نعم: UserId نص وأكثر", "لا: الملصق يمنع", "لا: يحتاج as string"],
      answer: 0,
      why: "UserId هو string و ملصق، فكل UserId نص. الاتجاه من الموسوم إلى العادي آمن دائماً. الممنوع هو العكس: نص عادي مكان UserId.",
    },
    {
      question: "loadUser تأخذ UserId، و orderId من النوع OrderId. ما آخر سطر في رسالة tsc عن loadUser(orderId)؟",
      options: ["Type '\"OrderId\"' is not assignable to type '\"UserId\"'.", "لا خطأ: كلاهما نص", "Property '__brand' is missing in type 'OrderId'."],
      answer: 0,
      why: "الحقل __brand موجود في الاثنين، فيقارن المدقّق قيمتيه: نصان حرفيان مختلفان. هكذا يصير شكلان متطابقان نوعين مختلفين.",
    },
    {
      question: "ماذا يطبع هذا؟ (userId من المشهد.)",
      code: 'console.log(JSON.stringify({ id: userId("u_1") }));',
      options: ['{"id":"u_1"}', '{"id":{"__brand":"UserId"}}', '{"id":"u_1","__brand":"UserId"}'],
      answer: 0,
      why: "لا حقل __brand في الذاكرة أبداً. الكائن فيه نص واحد، فيخرج كما هو. لهذا الوسم آمن في الطلبات والقواعد: لا شيء يتسرب.",
    },
    {
      question: "يمر من tsc. ماذا يُطبع؟ (loadUser من المشهد.)",
      code: 'const x = "nope" as UserId;\nconsole.log(loadUser(x));',
      options: ["user nope", "Error: bad user id: nope", "خطأ tsc في السطر 1"],
      answer: 0,
      why: "as يلصق الملصق دون أي فحص، وبابك userId لم يُستدعَ. لهذا القاعدة: as UserId يُكتب في مكان واحد فقط، داخل الدالة التي تفحص.",
    },
  ],
  next: "ts-decorators",
};
