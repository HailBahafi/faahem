import type { Cell, Lesson, Scene } from "@/lib/types";

const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const shape = "{ kind: \"circle\"; radius } | { kind: \"rect\"; width; height }";

export const tsDiscriminated: Lesson = {
  slug: "ts-discriminated",
  stage: 0,
  number: "2.5",
  title: "الاتحادات المميّزة",
  subtitle: "حقل وسم في كل كائن يقول من هو، فيعرف المدقّق بقية الحقول",
  minutes: 22,
  problem: {
    title: "حالات مستحيلة",
    body: "شاشة تحمّل طلباً من الخادم. النموذج الأول يصف الحالة بحقول اختيارية منفصلة، والثاني بحقل وسم واحد. شغّل المفاتيح في الأول: كم حالة يسمح بها لا معنى لها؟",
    demo: "tsDiscriminated",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };
function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "rect": return s.width * s.height;
    default: { const unreachable: never = s; return unreachable; }
  }
}
console.log(area({ kind: "rect", width: 3, height: 4 }), area({ kind: "circle", radius: 1 }).toFixed(2));`,
    },
    steps: [
      {
        line: null,
        say: "اتحاد كائنات، وفي كل عضو حقل kind بقيمة حرفية مختلفة. هذا الحقل هو الوسم: بطاقة الهوية التي يقرؤها البرنامج والمدقّق معاً.",
        memory: [],
      },
      {
        line: 1,
        say: "Shape إما دائرة لها radius، وإما مستطيل له width و height. لا يوجد شكل له الاثنان، ولا شكل بلا kind.",
        memory: [label("Shape", shape)],
      },
      {
        line: 11,
        say: "الاستدعاء الأول: كائن حقيقي في الذاكرة، وسمه \"rect\". الوسم قيمة عادية، تبقى عند التشغيل وتمر في JSON.",
        memory: [label("tsc sees s as", "Shape"), { name: "s.kind", value: '"rect"', type: "string" }, { name: "s.width", value: "3", type: "number" }, { name: "s.height", value: "4", type: "number" }],
        changed: ["s.kind", "s.width", "s.height"],
      },
      {
        line: 5,
        say: "switch يقرأ s.kind وقت التشغيل: \"rect\". والمدقّق يعرف أن كل case يطابق عضواً واحداً من الاتحاد.",
        memory: [label("tsc sees s as", "Shape"), { name: "s.kind", value: '"rect"', type: "string" }, { name: "s.width", value: "3", type: "number" }, { name: "s.height", value: "4", type: "number" }],
        read: ["s.kind"],
      },
      {
        line: 7,
        say: "في case \"rect\" ضيّق المدقّق s إلى المستطيل وحده، فيسمح بـ width و height. النتيجة 12.",
        memory: [label("tsc sees s as", "{ kind: \"rect\"; width; height }"), { name: "s.width", value: "3", type: "number" }, { name: "s.height", value: "4", type: "number" }],
        changed: ["tsc sees s as"],
        read: ["s.width", "s.height"],
      },
      {
        line: 6,
        say: "الاستدعاء الثاني وسمه \"circle\": هنا s دائرة، و radius مسموح. π × 1² ≈ 3.14.",
        memory: [label("tsc sees s as", "{ kind: \"circle\"; radius }"), { name: "s.kind", value: '"circle"', type: "string" }, { name: "s.radius", value: "1", type: "number" }],
        changed: ["tsc sees s as", "s.kind", "s.radius"],
        read: ["s.radius"],
      },
      {
        line: 8,
        say: "default لا يصله أحد: كل وسم له case. المدقّق شطب الدائرة والمستطيل، فبقي never: النوع الفارغ. لذلك تُقبل const unreachable: never = s.",
        memory: [label("tsc sees s as", "never")],
        changed: ["tsc sees s as"],
      },
      {
        line: 11,
        say: "يُطبع 12 3.14.",
        memory: [],
        output: ["12 3.14"],
      },
      {
        line: 8,
        say: "قيمة السطر 8 تظهر يوم تضيف | { kind: \"tri\"; base: number; height: number } وتنسى case له: يبقى المثلث في default، فيرفض المدقّق إسناده إلى never، ويريك كل switch نسيته.",
        memory: [label("tsc sees s as", "{ kind: \"tri\"; base; height }")],
        error: "Type '{ kind: \"tri\"; base: number; height: number; }' is not assignable to type 'never'.",
      },
    ],
    notes: {
      ts: "يسمّى هذا أيضاً الاتحاد الموسوم (tagged union). أي حقل بقيم حرفية يصلح وسماً: kind أو type أو status أو ok: true / ok: false.",
    },
  },
  playground: {
    kind: "trace",
    intro: "الأشكال كقيم JavaScript عادية: الوسم kind حقل يُقرأ في switch. شغّل، ثم أضف شكلاً جديداً وانسَ أن تعلّم area عنه.",
    starter: `function area(s) {
  switch (s.kind) {
    case "circle":
      return 3.14 * s.radius * s.radius;
    case "rect":
      return s.width * s.height;
  }
}
const shapes = [
  { kind: "rect", width: 3, height: 4 },
  { kind: "circle", radius: 2 },
];
for (const s of shapes) {
  console.log(s.kind, area(s));
}`,
    challenges: [
      "أضف إلى المصفوفة { kind: \"tri\", base: 4, height: 3 }. ماذا تطبع area؟ هل اشتكى أحد؟",
      "في TypeScript مع default: { const unreachable: never = s; } أين كان سيظهر الخط الأحمر؟",
      "أضف case \"tri\" يرجع s.base * s.height / 2، وشغّل مرة أخرى.",
      "غيّر \"rect\" في البيانات إلى \"Rect\". ماذا يحدث؟ وهل كان المدقّق سيقبل هذا الكائن؟",
    ],
  },
  predict: [
    {
      question: "ماذا يقول tsc عن السطر 5؟",
      code: `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };
function radiusOf(s: Shape): number {
  return s.radius;
}`,
      options: ["Property 'radius' does not exist on type 'Shape'", "لا خطأ، ويرجع undefined للمستطيل", "لا خطأ: radius في أحد الأعضاء"],
      answer: 0,
      why: "قبل فحص الوسم، s قد يكون مستطيلاً، ولا radius للمستطيل. افحص أولاً: if (s.kind === \"circle\") return s.radius;",
      scene: check(
        `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };
function radiusOf(s: Shape): number {
  return s.radius;
}`,
        [
          { line: 4, say: "s ما زال اتحاداً كاملاً.", memory: [label("tsc sees s as", "Shape")] },
          { line: 5, say: "radius ليس مشتركاً بين العضوين: خط أحمر.", memory: [label("tsc sees s as", "Shape")], error: "Property 'radius' does not exist on type 'Shape'.\n  Property 'radius' does not exist on type '{ kind: \"rect\"; width: number; height: number; }'." },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc عن السطر 4؟",
      code: `type Status =
  | { kind: "paid"; amount: number }
  | { kind: "refunded"; amount: number; reason: string };
function label(s: Status): string {
  switch (s.kind) {
    case "paid": return "paid " + s.amount;
  }
}`,
      options: ["Function lacks ending return statement and return type does not include 'undefined'", "لا خطأ", "Property 'reason' is missing"],
      answer: 0,
      why: "نسينا \"refunded\". المدقّق يعرف أن switch لم يغطِّ كل الوسوم، فقد تنتهي الدالة بلا return، وهي وعدت بـ string. حتى بلا default مع never، نوع الإرجاع يكشف النسيان.",
      scene: check(
        `type Status =
  | { kind: "paid"; amount: number }
  | { kind: "refunded"; amount: number; reason: string };
function label(s: Status): string {
  switch (s.kind) {
    case "paid": return "paid " + s.amount;
  }
}`,
        [
          { line: 6, say: "case \"paid\" يغطي عضواً واحداً.", memory: [label("still possible", "{ kind: \"refunded\"; ... }")] },
          { line: 4, say: "المسترد يخرج من switch بلا return، والدالة وعدت بنص.", memory: [label("still possible", "{ kind: \"refunded\"; ... }")], error: "Function lacks ending return statement and return type does not include 'undefined'." },
        ],
      ),
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };
const sent: Shape = { kind: "rect", width: 2, height: 5 };
const received: Shape = JSON.parse(JSON.stringify(sent));
console.log(received.kind === "rect" ? received.width * received.height : 0);`,
      options: ["10", "0", "خطأ: فقد الكائن نوعه"],
      answer: 0,
      why: "الوسم بيانات عادية، لا ملصق يُحذف. يعبر JSON والشبكة وقاعدة البيانات، ويُقرأ في الطرف الآخر. لهذا تُبنى رسائل الـ API والأحداث بالاتحادات المميّزة لا بالأصناف.",
      scene: check(
        `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };
const sent: Shape = { kind: "rect", width: 2, height: 5 };
const received: Shape = JSON.parse(JSON.stringify(sent));
console.log(received.kind === "rect" ? received.width * received.height : 0);`,
        [
          { line: 4, say: "كائن فيه الوسم \"rect\".", memory: [{ name: "sent.kind", value: '"rect"', type: "string" }] },
          { line: 5, say: "يتحوّل إلى نص ثم يعود كائناً جديداً. الوسم نص في البيانات، فيعود معه.", memory: [{ name: "received.kind", value: '"rect"', type: "string" }, { name: "received.width", value: "2", type: "number" }, { name: "received.height", value: "5", type: "number" }] },
          { line: 6, say: "الوسم \"rect\": 2 × 5.", memory: [{ name: "received.kind", value: '"rect"', type: "string" }], read: ["received.kind"], output: ["10"] },
        ],
      ),
    },
  ],
  code: {
    intro: "نمطان يستعملهما المحترفون كل يوم: Result لدالة قد تفشل دون أن ترمي، و reducer يطبّق أحداثاً موسومة على الحالة. و assertNever يحرس default عند التشغيل أيضاً، لو وصلت بيانات غريبة.",
    runnerLang: "ts",
    runnerStarter: `type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function parseAge(text: string): Result<number> {
  const n = Number(text);
  if (!Number.isInteger(n) || n < 0) {
    return { ok: false, error: "not an age: " + text };
  }
  return { ok: true, value: n };
}
for (const input of ["31", "-4", "abc"]) {
  const r = parseAge(input);
  console.log(r.ok ? "age " + r.value : r.error);
}

function assertNever(x: never): never {
  throw new Error("unexpected: " + JSON.stringify(x));
}

type CartEvent =
  | { type: "added"; item: string; qty: number }
  | { type: "removed"; item: string }
  | { type: "cleared" };

function apply(cart: Map<string, number>, e: CartEvent): Map<string, number> {
  const next = new Map(cart);
  switch (e.type) {
    case "added":
      next.set(e.item, (next.get(e.item) ?? 0) + e.qty);
      return next;
    case "removed":
      next.delete(e.item);
      return next;
    case "cleared":
      return new Map();
    default:
      return assertNever(e);
  }
}
const events: CartEvent[] = [
  { type: "added", item: "tea", qty: 2 },
  { type: "added", item: "cake", qty: 1 },
  { type: "removed", item: "tea" },
];
const cart = events.reduce(apply, new Map<string, number>());
console.log([...cart]);
// try: add a "qtyChanged" event to CartEvent, then let assertNever guide you.
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "اقرأ النتيجة",
      prompt: "رتّب الكود: Result ثم دالة تقرؤه حسب الوسم ok. الناتج: value 5 ثم error empty",
      lines: [
        "type Result = { ok: true; value: number } | { ok: false; error: string };",
        "function show(r: Result): string {",
        '  return r.ok ? "value " + r.value : "error " + r.error;',
        "}",
        "console.log(show({ ok: true, value: 5 }));",
        'console.log(show({ ok: false, error: "empty" }));',
      ],
      expected: "value 5\nerror empty",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "الوسم الصحيح",
      prompt: "أي وسم في الـ case الثاني يطبع waiting ثم done in 3s؟",
      template: `type Job =
  | { state: "queued" }
  | { state: "finished"; seconds: number };
function describe(j: Job): string {
  switch (j.state) {
    case "queued": return "waiting";
    case ___: return "done in " + j.seconds + "s";
  }
}
console.log(describe({ state: "queued" }));
console.log(describe({ state: "finished", seconds: 3 }));`,
      options: ['"finished"', '"done"', '"seconds"'],
      expected: "waiting\ndone in 3s",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "الحدث المنسي",
      prompt: "الحدث \"reset\" لا case له، فيرجع apply قيمة undefined. وكان tsc سيقول: Function lacks ending return statement and return type does not include 'undefined'. أضف الحالة لتعيد العدّاد إلى 0، فيُطبع 0",
      code: `type CounterEvent = { type: "add"; by: number } | { type: "reset" };
function apply(count: number, e: CounterEvent): number {
  switch (e.type) {
    case "add":
      return count + e.by;
  }
}
const events: CounterEvent[] = [{ type: "add", by: 5 }, { type: "reset" }];
console.log(events.reduce(apply, 0));`,
      expected: "0",
      hint: "أضف داخل switch: case \"reset\": return 0;",
      solution: `type CounterEvent = { type: "add"; by: number } | { type: "reset" };
function apply(count: number, e: CounterEvent): number {
  switch (e.type) {
    case "add":
      return count + e.by;
    case "reset":
      return 0;
  }
}
const events: CounterEvent[] = [{ type: "add", by: 5 }, { type: "reset" }];
console.log(events.reduce(apply, 0));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "رسائل الإشعارات",
      prompt: "عرّف type Notice = { kind: \"like\"; by: string } | { kind: \"follow\"; by: string } | { kind: \"system\"; text: string }، واكتب message(n: Notice): string ترجع \"Sara liked your post\" و \"Omar followed you\" و نص النظام كما هو. ثم اطبع الثلاثة كل واحد في سطر.",
      starter: "// write Notice and message here, then print the three messages\n",
      expected: "Sara liked your post\nOmar followed you\nmaintenance at 2am",
      hint: "switch (n.kind) { case \"like\": return n.by + \" liked your post\"; ... }",
      solution: `type Notice =
  | { kind: "like"; by: string }
  | { kind: "follow"; by: string }
  | { kind: "system"; text: string };
function message(n: Notice): string {
  switch (n.kind) {
    case "like":
      return n.by + " liked your post";
    case "follow":
      return n.by + " followed you";
    case "system":
      return n.text;
  }
}
console.log(message({ kind: "like", by: "Sara" }));
console.log(message({ kind: "follow", by: "Omar" }));
console.log(message({ kind: "system", text: "maintenance at 2am" }));`,
    },
  ],
  quiz: [
    {
      question: "ما نوع r عند المدقّق في السطر 4؟",
      code: 'type Result = { ok: true; value: number } | { ok: false; error: string };\nfunction f(r: Result) {\n  if (!r.ok) return;\n  console.log(r);\n}',
      options: ["{ ok: true; value: number }", "Result", "{ ok: false; error: string }"],
      answer: 0,
      why: "ok هنا وسم بقيمتين حرفيتين: true و false. من كان ok عنده false رجع في السطر 3، فبقي العضو الناجح، و r.value مسموحة.",
    },
    {
      question: "ماذا يقول tsc عن السطر 3؟",
      code: 'type Loose = { kind: string; radius: number } | { kind: string; width: number };\nfunction f(s: Loose) {\n  if (s.kind === "circle") return s.radius;\n}',
      options: ["Property 'radius' does not exist on type 'Loose'", "لا خطأ: kind يساوي circle", "لا خطأ، ويرجع undefined"],
      answer: 0,
      why: "الوسم يجب أن يكون قيمة حرفية مختلفة في كل عضو. هنا kind من نوع string في الاثنين، فلا يعرف المدقّق أي عضو يملك \"circle\". اكتب kind: \"circle\" و kind: \"rect\".",
    },
    {
      question: "بيانات غريبة وصلت من الخادم. ماذا يحدث عند التشغيل؟",
      code: 'type Msg = { type: "ping" } | { type: "text"; body: string };\nfunction assertNever(x: never): never {\n  throw new Error("unexpected: " + JSON.stringify(x));\n}\nfunction handle(m: Msg): string {\n  switch (m.type) {\n    case "ping": return "pong";\n    case "text": return m.body;\n    default: return assertNever(m);\n  }\n}\nconsole.log(handle(JSON.parse(\'{"type":"video"}\')));',
      options: ['Error: unexpected: {"type":"video"}', "يطبع undefined", "يطبع pong"],
      answer: 0,
      why: "المدقّق لا يرى ما في JSON، فقبل الكائن. لكن assertNever كود حقيقي: حين يصل وسم غير معروف يرمي خطأ واضحاً يذكر البيانات، بدل أن يمضي البرنامج بقيمة undefined.",
    },
    {
      question: "كم حالة مختلفة يسمح بها كل نوع؟",
      code: 'type A = { loading: boolean; data?: string; error?: string };\ntype B =\n  | { status: "loading" }\n  | { status: "done"; data: string }\n  | { status: "failed"; error: string };',
      options: ["A يسمح بثمانٍ (من حيث الوجود)، و B بثلاث فقط", "كلاهما ثلاث", "A ثلاث و B ثمانٍ"],
      answer: 0,
      why: "في A ثلاثة أشياء مستقلة: loading صح أو خطأ، و data موجود أو لا، و error موجود أو لا: 2×2×2. منها loading مع data مع error معاً، وهذا لا معنى له. B يجعل الحالات المستحيلة غير قابلة للكتابة أصلاً.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: 'type Ev = { type: "in"; n: number } | { type: "out"; n: number };\nconst log: Ev[] = [{ type: "in", n: 5 }, { type: "out", n: 2 }, { type: "in", n: 1 }];\nlet stock = 0;\nfor (const e of log) {\n  stock += e.type === "in" ? e.n : -e.n;\n}\nconsole.log(stock);',
      options: ["4", "8", "6"],
      answer: 0,
      why: "سجل أحداث موسومة يُعاد تشغيله لحساب الحالة: +5 ثم -2 ثم +1 = 4. هكذا تُبنى أنظمة المخازن والمحاسبة: الأحداث هي الحقيقة، والرصيد يُحسب منها.",
    },
  ],
  next: "ts-declarations",
};
