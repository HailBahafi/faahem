import type { Cell, Lesson, Scene } from "@/lib/types";

const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const user = label("User", "{ id; name; email }");

export const tsUtility: Lesson = {
  slug: "ts-utility",
  stage: 0,
  number: "2.2",
  title: "الأنواع المساعدة",
  subtitle: "دوال تعمل على الأنواع: تأخذ ملصقاً وتصنع منه ملصقاً جديداً",
  minutes: 20,
  problem: {
    title: "نوع جديد من نوع موجود",
    body: "عندك User واحد. نموذج التعديل يحتاج حقولاً اختيارية، والقائمة العامة لا تعرض البريد، والإنشاء لا يملك id بعد. هل تكتب كل نوع من جديد؟ اضغط الأدوات وراقب النوع يتحوّل.",
    demo: "tsUtility",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `interface User { id: number; name: string; email: string }
type UserPatch = Partial<Omit<User, "id">>;
function update(user: User, patch: UserPatch): User {
  return { ...user, ...patch };
}
const sara: User = { id: 1, name: "Sara", email: "s@mail.io" };
const next = update(sara, { email: "sara@mail.io" });
console.log(next.id, next.email, sara.email);`,
    },
    steps: [
      {
        line: null,
        say: "الأنواع المساعدة دوال، لكن مدخلها نوع ومخرجها نوع. يحسبها المدقّق وحده، ولا يبقى منها شيء عند التشغيل.",
        memory: [],
      },
      {
        line: 1,
        say: "النوع الأصل: User بثلاثة حقول، كلها مطلوبة.",
        memory: [user],
      },
      {
        line: 2,
        say: "تُقرأ من الداخل إلى الخارج. أولاً Omit<User, \"id\">: انسخ User واحذف id، فيبقى { name; email }.",
        memory: [user, label("Omit<User, \"id\">", "{ name; email }")],
        changed: ["Omit<User, \"id\">"],
      },
      {
        line: 2,
        say: "ثم Partial على الناتج: كل حقل صار اختيارياً. UserPatch = { name?; email? }. لا حاجة لكتابته بيدنا، ولو أضفنا حقلاً إلى User لظهر هنا وحده.",
        memory: [user, label("UserPatch", "{ name?; email? }")],
        changed: ["UserPatch"],
      },
      {
        line: 6,
        say: "عند التشغيل: كائن عادي في الذاكرة، والمتغير sara يشير إليه.",
        memory: [label("UserPatch", "{ name?; email? }"), { name: "sara.email", value: '"s@mail.io"', type: "string" }],
        changed: ["sara.email"],
      },
      {
        line: 7,
        say: "المدقّق يفحص الوسيط الثاني: { email } يطابق UserPatch. ولو كتبنا { id: 9 } لرفضه، لأن Omit حذف id من التعديل.",
        memory: [label("UserPatch", "{ name?; email? }"), { name: "sara.email", value: '"s@mail.io"', type: "string" }],
        read: ["UserPatch"],
      },
      {
        line: 4,
        say: "داخل update: كائن جديد. ننسخ حقول user، ثم حقول patch فوقها. الترتيب مهم: الأخير يكتب فوق الأول.",
        memory: [
          { name: "sara.email", value: '"s@mail.io"', type: "string" },
          { name: "next.id", value: "1", type: "number" },
          { name: "next.email", value: '"sara@mail.io"', type: "string" },
        ],
        changed: ["next.id", "next.email"],
      },
      {
        line: 8,
        say: "يُطبع 1 sara@mail.io s@mail.io: الكائن الجديد فيه التعديل، والقديم لم يُمس.",
        memory: [
          { name: "sara.email", value: '"s@mail.io"', type: "string" },
          { name: "next.id", value: "1", type: "number" },
          { name: "next.email", value: '"sara@mail.io"', type: "string" },
        ],
        read: ["next.id", "next.email", "sara.email"],
        output: ["1 sara@mail.io s@mail.io"],
      },
      {
        line: null,
        say: "بعد حذف الأنواع يختفي السطران 1 و 2 تماماً. Omit لم يحذف حقلاً من أي كائن: غيّر الملصق فقط.",
        memory: [],
      },
    ],
    notes: {
      ts: "Partial و Required و Readonly و Pick و Omit و Record و ReturnType و Parameters كلها مبنية في TypeScript نفسها من أدوات ستتعلمها في المستوى 3 (mapped و conditional types).",
    },
  },
  playground: {
    kind: "trace",
    intro: "Pick و Omit تعملان على الملصقات فقط. هنا نفعل الشيء نفسه بيدنا على القيم، لترى ما تصفه الأنواع. شغّل وراقب الكائن الجديد يُبنى حقلاً حقلاً.",
    starter: `function pick(obj, keys) {
  const out = {};
  for (const key of keys) {
    out[key] = obj[key];
  }
  return out;
}
const sara = { id: 1, name: "Sara", email: "s@mail.io" };
const card = pick(sara, ["name", "email"]);
console.log(card.name, card.email, card.id);`,
    challenges: [
      "ما نوع card عند المدقّق لو كتبنا pick بأنواع؟ إنه Pick<User, \"name\" | \"email\">. لماذا يطبع card.id قيمة undefined؟",
      "اكتب omit(obj, keys) تنسخ كل الحقول إلا المذكورة. تلميح: for (const key in obj) مع keys.includes(key).",
      "اكتب partialCheck(obj): يطبع لكل حقل هل هو موجود. أي حقل يجعله Partial غير مضمون؟",
    ],
  },
  predict: [
    {
      question: "ماذا يقول tsc عن السطر 3؟",
      code: `interface User { id: number; name: string; email: string }
const draft: Partial<User> = {};
console.log(draft.name.toUpperCase());`,
      options: ["'draft.name' is possibly 'undefined'", "لا خطأ: name نص في User", "Property 'name' does not exist"],
      answer: 0,
      why: "Partial جعل كل حقل اختيارياً، فصار name من نوع string | undefined. السطر 2 مقبول لأن الكائن الفارغ يطابق، لكنه يعني أن name قد يغيب، والمدقّق يذكّرك.",
      scene: check(
        `interface User { id: number; name: string; email: string }
const draft: Partial<User> = {};
console.log(draft.name.toUpperCase());`,
        [
          { line: 2, say: "Partial<User> = { id?; name?; email? }. الكائن الفارغ يطابقه.", memory: [label("draft", "{ id?; name?; email? }")] },
          { line: 3, say: "name اختياري، فقد يكون undefined. خط أحمر قبل التشغيل.", memory: [label("draft.name", "string | undefined")], error: "'draft.name' is possibly 'undefined'." },
        ],
      ),
    },
    {
      question: "يمر من tsc بلا خطأ. ماذا يطبع؟",
      code: `interface Config { port: number }
const config: Config = { port: 80 };
const frozen: Readonly<Config> = config;
config.port = 8080;
console.log(frozen.port);`,
      options: ["8080", "80", "خطأ عند التشغيل"],
      answer: 0,
      why: "Readonly ملصق، لا قفل. frozen و config سهمان إلى الكائن نفسه. الملصق يمنعك من الكتابة عبر frozen فقط، والكتابة عبر config مسموحة، فيرى frozen القيمة الجديدة. للقفل الحقيقي وقت التشغيل: Object.freeze.",
      scene: check(
        `interface Config { port: number }
const config: Config = { port: 80 };
const frozen: Readonly<Config> = config;
config.port = 8080;
console.log(frozen.port);`,
        [
          { line: 2, say: "كائن واحد في الذاكرة، port = 80.", memory: [{ name: "port", value: "80", type: "number" }] },
          { line: 3, say: "frozen لا ينسخ الكائن: سهم ثانٍ إلى المكان نفسه، بملصق readonly.", memory: [label("frozen", "→ same object (readonly label)"), { name: "port", value: "80", type: "number" }] },
          { line: 4, say: "الكتابة عبر config مسموحة: ملصقه عادي.", memory: [label("frozen", "→ same object (readonly label)"), { name: "port", value: "8080", type: "number" }], changed: ["port"] },
          { line: 5, say: "frozen يقرأ الكائن نفسه: 8080.", memory: [{ name: "port", value: "8080", type: "number" }], read: ["port"], output: ["8080"] },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc عن السطر 1؟",
      code: `const prices: Record<"tea" | "cake", number> = { tea: 8 };`,
      options: [
        "Property 'cake' is missing in type '{ tea: number; }' but required in type 'Record<\"tea\" | \"cake\", number>'",
        "لا خطأ: cake سيكون undefined",
        "لا خطأ: Record يقبل أي مفاتيح",
      ],
      answer: 0,
      why: "Record<K, V> كائن له كل مفتاح من K، وقيمة كل منها V. المفاتيح هنا قائمة مغلقة من اثنين، فنسيان cake خطأ. هذا يجعل Record مع اتحاد حرفي جدولاً لا ينقصه صف.",
      scene: check(
        `const prices: Record<"tea" | "cake", number> = { tea: 8 };`,
        [
          { line: 1, say: "Record<\"tea\" | \"cake\", number> = { tea: number; cake: number }.", memory: [label("prices must be", "{ tea: number; cake: number }")] },
          { line: 1, say: "الكائن فيه tea فقط: ينقصه حقل مطلوب.", memory: [label("prices must be", "{ tea: number; cake: number }")], error: "Property 'cake' is missing in type '{ tea: number; }' but required in type 'Record<\"tea\" | \"cake\", number>'." },
        ],
      ),
    },
  ],
  code: {
    intro: "الأنواع المساعدة كما تظهر في مشروع حقيقي: Omit لمدخلات الإنشاء (لا id بعد)، و Partial للتعديل، و Pick للعرض العام، و Record لجدول ثابت المفاتيح، و ReturnType لتسمية ما ترجعه دالة دون تكراره.",
    runnerLang: "ts",
    runnerStarter: `interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "member";
}

type NewUser = Omit<User, "id">;
type UserPatch = Partial<Omit<User, "id">>;
type PublicUser = Pick<User, "id" | "name">;

let nextId = 1;
function create(input: NewUser): User {
  return { id: nextId++, ...input };
}
function update(user: User, patch: UserPatch): User {
  return { ...user, ...patch };
}
function toPublic(user: User): PublicUser {
  return { id: user.id, name: user.name };
}

const sara = create({ name: "Sara", email: "s@mail.io", role: "member" });
const promoted = update(sara, { role: "admin" });
console.log(promoted.role, sara.role);
console.log(JSON.stringify(toPublic(promoted)));

const limits: Record<User["role"], number> = { admin: 100, member: 10 };
console.log(limits[promoted.role]);

type Summary = ReturnType<typeof toPublic>; // the same as PublicUser
const s: Summary = toPublic(sara);
console.log(s.name);
// try: add a field "phone" to User. Which types change by themselves?
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "عدّاد بجدول Record",
      prompt: "رتّب الكود الذي يعدّ الكلمات في جدول Record<string, number>. الناتج: 2 1",
      lines: [
        "const counts: Record<string, number> = {};",
        'for (const word of ["tea", "cake", "tea"]) {',
        "  counts[word] = (counts[word] ?? 0) + 1;",
        "}",
        "console.log(counts.tea, counts.cake);",
      ],
      expected: "2 1",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "الافتراضي ثم ما يختاره المستخدم",
      prompt: "withDefaults تأخذ إعدادات جزئية وتكمل الباقي من defaults. ما يمرّره المستخدم يجب أن يغلب. أي سطر يطبع 8080 true؟",
      template: `interface Options { port: number; secure: boolean }
const defaults: Options = { port: 80, secure: true };
function withDefaults(opts: Partial<Options>): Options {
  return { ___ };
}
const o = withDefaults({ port: 8080 });
console.log(o.port, o.secure);`,
      options: ["...defaults, ...opts", "...opts, ...defaults", "...opts"],
      expected: "8080 true",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "لا تعدّل الأصل",
      prompt: "rename تغيّر الكائن الأصلي، فيتغيّر sara أيضاً. لو كان المعامل Readonly<User> لقال tsc: Cannot assign to 'name' because it is a read-only property. أصلحها لترجع كائناً جديداً، فيُطبع Sara Omar",
      code: `interface User { id: number; name: string }
function rename(user: Readonly<User>, name: string): User {
  (user as User).name = name;
  return user;
}
const sara: User = { id: 1, name: "Sara" };
const omar = rename(sara, "Omar");
console.log(sara.name, omar.name);`,
      expected: "Sara Omar",
      hint: "انسخ ثم غيّر: return { ...user, name };",
      solution: `interface User { id: number; name: string }
function rename(user: Readonly<User>, name: string): User {
  return { ...user, name };
}
const sara: User = { id: 1, name: "Sara" };
const omar = rename(sara, "Omar");
console.log(sara.name, omar.name);`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "بطاقة عامة بـ Pick",
      prompt: "عرّف type Card = Pick<Product, \"name\" | \"price\">، واكتب toCard(p: Product): Card ترجع كائناً فيه الحقلان فقط. ثم اطبع JSON.stringify(toCard(tea)): {\"name\":\"tea\",\"price\":8}",
      starter: `interface Product { id: number; name: string; price: number; stock: number }
const tea: Product = { id: 1, name: "tea", price: 8, stock: 40 };
// write Card and toCard here, then print JSON.stringify(toCard(tea))
`,
      expected: '{"name":"tea","price":8}',
      hint: "return { name: p.name, price: p.price };",
      solution: `interface Product { id: number; name: string; price: number; stock: number }
const tea: Product = { id: 1, name: "tea", price: 8, stock: 40 };
type Card = Pick<Product, "name" | "price">;
function toCard(p: Product): Card {
  return { name: p.name, price: p.price };
}
console.log(JSON.stringify(toCard(tea)));`,
    },
  ],
  quiz: [
    {
      question: "ماذا يقول tsc عن السطر 2؟",
      code: 'interface User { id: number; name: string }\nconst card: Pick<User, "name"> = { name: "Sara", id: 1 };',
      options: [
        "Object literal may only specify known properties, and 'id' does not exist in type 'Pick<User, \"name\">'",
        "لا خطأ: id موجود في User",
        "Property 'id' is missing",
      ],
      answer: 0,
      why: "Pick<User, \"name\"> نوع جديد فيه name وحده. والكائن الحرفي المكتوب مباشرة يُفحص بدقة: حقل زائد غالباً خطأ إملائي أو تسريب بيانات، فيرفضه المدقّق.",
    },
    {
      question: "يمر من tsc بلا خطأ. ماذا يطبع؟",
      code: 'interface User { id: number; name: string; email: string }\nconst sara: User = { id: 1, name: "Sara", email: "s@mail.io" };\nconst safe: Omit<User, "email"> = sara;\nconsole.log(Object.keys(safe).length);',
      options: ["3", "2", "خطأ عند التشغيل"],
      answer: 0,
      why: "Omit غيّر الملصق فقط، و safe سهم إلى كائن sara نفسه، وفيه email. المدقّق لا يرى email عبر safe، لكنه ما زال في الذاكرة. لو أرسلت safe إلى API لخرج البريد معه. لحذفه فعلاً ابنِ كائناً جديداً.",
    },
    {
      question: "ماذا يقول tsc عن السطر 2؟",
      code: "type Settings = Required<{ theme?: string }>;\nconst s: Settings = {};",
      options: [
        "Property 'theme' is missing in type '{}' but required in type 'Required<{ theme?: string | undefined; }>'",
        "لا خطأ: theme اختياري",
        "Type '{}' is not generic",
      ],
      answer: 0,
      why: "Required عكس Partial: يمحو علامة ? عن كل حقل. فصار theme مطلوباً، والكائن الفارغ ينقصه.",
    },
    {
      question: "ما النوع Row عند المدقّق؟",
      code: "function loadRow(id: number) {\n  return { id, title: \"tea\", done: false };\n}\ntype Row = ReturnType<typeof loadRow>;",
      options: ["{ id: number; title: string; done: boolean }", "number", "() => object"],
      answer: 0,
      why: "typeof loadRow يعطي نوع الدالة نفسها، و ReturnType يستخرج منه ما ترجعه. هكذا يبقى النوع مصدره واحداً: إن غيّرت الدالة تغيّر Row معها.",
    },
    {
      question: "ماذا يقول tsc عن السطر 3؟",
      code: "interface Point { x: number; y: number }\nconst p: Readonly<Point> = { x: 1, y: 2 };\np.x = 5;",
      options: ["Cannot assign to 'x' because it is a read-only property", "لا خطأ: p ثابت لكن حقوله لا", "Cannot assign to 'p' because it is a constant"],
      answer: 0,
      why: "const يمنع إعادة توجيه السهم p فقط، أما الحقول فقابلة للتغيير عادة. Readonly<Point> يضيف readonly إلى كل حقل، فيمنع الكتابة عبر هذا الملصق.",
    },
  ],
  next: "ts-classes",
};
