import type { Cell, Lesson, Scene } from "@/lib/types";

/** What the checker believes about a name. */
const ty = (name: string, expr: string): Cell => ({ name, value: expr, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const RAW = { name: "raw (heap)", value: '{ name: "Sara", age: "20" }', type: "none" as const };

export const tsRuntimeValidation: Lesson = {
  slug: "ts-runtime-validation",
  stage: 0,
  number: "4.3",
  title: "التحقق وقت التشغيل",
  subtitle: "الأنواع تختفي قبل التشغيل؛ على حدود البرنامج يقف حارس يفحص كل قيمة بيده",
  minutes: 30,
  problem: {
    title: "ختم as لا يفحص شيئاً",
    body: "الخادم يرسل بيانات مستخدم، والكود يحتاج age + 1. اختر ما يرسله الخادم، ثم بدّل بين طريقتين على الباب: ختم as User، أو محلّل يفحص كل حقل. أين ينكشف الخطأ في كل طريقة؟",
    demo: "tsRuntimeValidation",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `type User = { name: string; age: number };
const raw: unknown = JSON.parse('{"name":"Sara","age":"20"}');
const lied = raw as User;
console.log(lied.age + 1);
function isUser(x: unknown): x is User {
  if (typeof x !== "object" || x === null) return false;
  return "name" in x && typeof x.name === "string" && "age" in x && typeof x.age === "number";
}
console.log(isUser(raw) ? raw.age + 1 : "rejected: age is not a number");`,
    },
    steps: [
      {
        line: null,
        say: "عالمان: المدقّق يعمل على الملصقات قبل التشغيل، ثم تُمحى كل الأنواع ويعمل JavaScript على القيم. البيانات القادمة من الخارج تصل في العالم الثاني فقط، حيث لا ملصقات.",
        memory: [],
      },
      {
        line: 1,
        say: "type User وعد للمدقّق وحده. بعد محو الأنواع لا يبقى من هذا السطر شيء في البرنامج.",
        memory: [ty("User", "{ name: string; age: number }")],
        changed: ["User"],
      },
      {
        line: 2,
        say: "JSON.parse ترجع any. نكتب عليها unknown بصدق: «لا أعرف بعد». والكائن الحقيقي فيه age نص \"20\"، لا رقم.",
        memory: [ty("tsc sees raw as", "unknown"), RAW],
        changed: ["tsc sees raw as", "raw (heap)"],
      },
      {
        line: 3,
        say: "as User ختم: المدقّق يصدّقه ولا يفحص شيئاً، ولا يجري أي كود وقت التشغيل. lied والدرج raw يشيران إلى الكائن نفسه.",
        memory: [ty("tsc sees lied as", "User"), RAW],
        changed: ["tsc sees lied as"],
      },
      {
        line: 4,
        say: "المدقّق يرى number + 1. الواقع \"20\" + 1، أي دمج نصوص: يُطبع 201. tsc صامت، والخطأ سيظهر بعيداً، في فاتورة أو رسم بياني.",
        memory: [ty("tsc sees lied.age as", "number"), RAW],
        read: ["raw (heap)"],
        output: ["201"],
      },
      {
        line: 6,
        say: "الحارس يفحص بكود يعمل فعلاً. أولاً: هل هو كائن وليس null؟ نعم. والمدقّق يضيّق x إلى object.",
        memory: [ty("tsc sees x as", "object"), RAW],
        changed: ["tsc sees x as"],
      },
      {
        line: 7,
        say: "\"name\" in x و typeof نص: نعم. ثم typeof x.age === \"number\"؟ الدرج فيه \"20\"، فالنتيجة false. الحارس يرجع false.",
        memory: [ty("tsc sees x as", "object & Record<\"name\", unknown> ..."), RAW],
        read: ["raw (heap)"],
      },
      {
        line: 9,
        say: "x is User عقد: إن رجع الحارس true، صار raw من نوع User في فرع نعم. هنا رجع false، فيذهب التنفيذ إلى فرع لا.",
        memory: [ty("isUser(raw)", "false"), RAW],
        changed: ["isUser(raw)"],
        output: ["201", "rejected: age is not a number"],
      },
      {
        line: null,
        say: "القاعدة: داخل البرنامج تثق بالأنواع. على الحدود (شبكة، ملف، localStorage، متغيرات بيئة، نموذج) القيمة unknown حتى يفحصها كود يعمل وقت التشغيل.",
        memory: [RAW],
      },
    ],
    notes: {
      ts: "الحارس x is User وعد يكتبه المبرمج، والمدقّق يصدّقه كما يصدّق as. لذلك تبني الفرق الكبيرة الحراس من مخطط (schema) واحد يُستنتج منه النوع، كما في zod و valibot، فلا يختلف الفحص عن النوع أبداً.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محلّل على الباب: يفحص كل حقل، ويجمع كل الأخطاء مع مسار الحقل، ويبني كائناً جديداً بالحقول المعروفة فقط. غيّر المدخلات وراقب ما يمرّ وما يُرفض.",
    starter: `function parseUser(x) {
  if (typeof x !== "object" || x === null) {
    return { ok: false, errors: ["value: expected object"] };
  }
  const errors = [];
  if (typeof x.name !== "string") errors.push("name: expected string");
  if (typeof x.age !== "number") errors.push("age: expected number");
  if (errors.length > 0) return { ok: false, errors: errors };
  return { ok: true, value: { name: x.name, age: x.age } };
}
const inputs = [{ name: "Sara", age: 20 }, { name: "Omar", age: "20" }, null, { age: true }];
for (const input of inputs) {
  const r = parseUser(input);
  console.log(r.ok ? "ok: " + r.value.name : "rejected: " + r.errors.join(", "));
}`,
    challenges: [
      "أضف إلى المدخلات { name: \"Lina\", age: 30, isAdmin: true }. هل يصل isAdmin إلى الكائن الناتج؟ لماذا هذا مهم للأمان؟",
      "احذف x === null من السطر 2 وشغّل. ماذا يحدث مع المدخل null؟ (tsc كان سيقول: 'x' is possibly 'null')",
      "أضف فحصاً: age عدد صحيح بين 0 و 150 (Number.isInteger). جرّب age: 20.5 و age: -1.",
    ],
  },
  predict: [
    {
      question: "ماذا يقول tsc، وماذا يُطبع؟",
      code: `const n: number = JSON.parse('"5"');
console.log(n + 1);`,
      options: ["tsc صامت، ويُطبع 51", "tsc: Type 'string' is not assignable to type 'number'.", "tsc صامت، ويُطبع 6"],
      answer: 0,
      why: "tsc لا يعرف ما في النص: JSON.parse ترجع any، و any يقبل أي ملصق. وقت التشغيل n هو النص \"5\"، و \"5\" + 1 دمج: 51. لهذا يُكتب ما يرجع من الحدود unknown، فيجبرك المدقّق على الفحص.",
      scene: check(
        `const n: number = JSON.parse('"5"');
console.log(n + 1);`,
        [
          { line: 1, say: "any يُلصق عليه number بلا اعتراض. الدرج الحقيقي فيه نص.", memory: [ty("tsc sees n as", "number"), { name: "n", value: '"5"', type: "string" }], changed: ["n"] },
          { line: 2, say: "نص + رقم = دمج نصوص.", memory: [{ name: "n", value: '"5"', type: "string" }], read: ["n"], output: ["51"] },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc، وماذا يحدث عند التشغيل؟",
      code: `function isNumber(x: unknown): x is number {
  return x !== null;
}
const v: unknown = "hi";
if (isNumber(v)) console.log(v.toFixed(1));`,
      options: ["tsc صامت، والسطر 5 ينهار: v.toFixed is not a function", "tsc يرفض الحارس: الفحص لا يثبت number", "tsc صامت، ويُطبع hi"],
      answer: 0,
      why: "المدقّق لا يقرأ جسم الحارس ليتأكد منه. x is number وعد منك، ويصدّقه كما يصدّق as. الحارس الخاطئ أخطر من غيابه لأنه يبدو آمناً. اختبر حراسك بمدخلات سيئة.",
      scene: check(
        `function isNumber(x: unknown): x is number {
  return x !== null;
}
const v: unknown = "hi";
if (isNumber(v)) console.log(v.toFixed(1));`,
        [
          { line: 2, say: "\"hi\" ليس null، فيرجع الحارس true.", memory: [{ name: "x", value: '"hi"', type: "string" }], read: ["x"] },
          { line: 5, say: "في فرع نعم يصدّق المدقّق أن v رقم. الدرج فيه نص.", memory: [ty("tsc sees v as", "number"), { name: "v", value: '"hi"', type: "string" }], error: "TypeError: v.toFixed is not a function" },
        ],
      ),
    },
    {
      question: "النوع مستنتج من المخطط. أضاف زميلك email: z.string() إلى المخطط. ماذا يقول tsc عن السطر 3؟",
      code: `const User = z.object({ name: z.string(), age: z.number(), email: z.string() });
type User = z.infer<typeof User>;
const u: User = { name: "Sara", age: 20 };`,
      options: ["Property 'email' is missing in type '{ name: string; age: number; }'", "لا خطأ: المخطط يفحص وقت التشغيل فقط", "لا خطأ حتى نعدّل type User بيدنا"],
      answer: 0,
      why: "النوع لا يُكتب بيد، بل يُستخرج من المخطط بـ infer. تعديل واحد يغيّر الفحص وقت التشغيل والنوع وقت الكتابة معاً، فيرى tsc فوراً كل مكان يبني User ناقصاً.",
      scene: check(
        `const User = z.object({ name: z.string(), age: z.number(), email: z.string() });
type User = z.infer<typeof User>;
const u: User = { name: "Sara", age: 20 };`,
        [
          { line: 1, say: "المخطط كائن حقيقي يعمل وقت التشغيل، ونوعه يحمل شكل الحقول.", memory: [ty("typeof User", "Schema<{ name: string; age: number; email: string }>")], changed: ["typeof User"] },
          { line: 2, say: "infer يُخرج النوع من المخطط.", memory: [ty("User", "{ name: string; age: number; email: string }")], changed: ["User"] },
          { line: 3, say: "الكائن ينقصه email.", memory: [ty("User", "{ name: string; age: number; email: string }")], error: "TS2741: Property 'email' is missing in type '{ name: string; age: number; }'" },
        ],
      ),
    },
  ],
  code: {
    intro: "هذه مكتبة مخططات صغيرة بأسلوب zod، في 40 سطراً: كل مخطط كائن فيه parse يعمل وقت التشغيل، ونوعه يحمل T. ثم Infer يستخرج النوع من المخطط. المكتبات الحقيقية أكبر، والفكرة نفسها. لاحظ مسار الخطأ: user.tags[1].",
    runnerLang: "ts",
    runnerStarter: `type Result<T> = { ok: true; value: T } | { ok: false; error: string };
interface Schema<T> {
  parse(x: unknown, path?: string): Result<T>;
}
type Infer<S> = S extends Schema<infer T> ? T : never;

const z = {
  string: (): Schema<string> => ({
    parse: (x, path = "value") => (typeof x === "string" ? { ok: true, value: x } : { ok: false, error: \`\${path}: expected string\` }),
  }),
  number: (): Schema<number> => ({
    parse: (x, path = "value") =>
      typeof x === "number" && Number.isFinite(x) ? { ok: true, value: x } : { ok: false, error: \`\${path}: expected number\` },
  }),
  array<T>(item: Schema<T>): Schema<T[]> {
    return {
      parse(x, path = "value") {
        if (!Array.isArray(x)) return { ok: false, error: \`\${path}: expected array\` };
        const out: T[] = [];
        for (const [i, el] of x.entries()) {
          const r = item.parse(el, \`\${path}[\${i}]\`);
          if (!r.ok) return r;
          out.push(r.value);
        }
        return { ok: true, value: out };
      },
    };
  },
  object<S extends Record<string, Schema<unknown>>>(shape: S): Schema<{ [K in keyof S]: Infer<S[K]> }> {
    return {
      parse(x, path = "value") {
        if (typeof x !== "object" || x === null || Array.isArray(x)) return { ok: false, error: \`\${path}: expected object\` };
        const input = x as Record<string, unknown>;
        const out: Record<string, unknown> = {};
        for (const key of Object.keys(shape)) {
          const r = shape[key]!.parse(input[key], \`\${path}.\${key}\`);
          if (!r.ok) return r;
          out[key] = r.value; // only known keys are copied
        }
        return { ok: true, value: out as { [K in keyof S]: Infer<S[K]> } };
      },
    };
  },
};

// One schema; the type is derived from it, so they can never disagree.
const User = z.object({ name: z.string(), age: z.number(), tags: z.array(z.string()) });
type User = Infer<typeof User>; // { name: string; age: number; tags: string[] }

const bodies = ['{"name":"Sara","age":20,"tags":["admin"]}', '{"name":"Omar","age":"20","tags":[]}', '{"name":"Lina","age":30,"tags":["a",7]}', "null"];
for (const text of bodies) {
  const r = User.parse(JSON.parse(text), "user");
  console.log(r.ok ? \`ok: \${r.value.name} is \${r.value.age}\` : \`rejected: \${r.error}\`);
}
// try: add email: z.string() to the schema. Which bodies are rejected now?
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "محلّل للعمر",
      prompt: "رتّب parseAge: تقبل unknown، وترمي خطأً واضحاً لكل حالة سيئة، وترجع number. الناتج: 30 ثم age: expected integer",
      lines: [
        "function parseAge(input: unknown): number {",
        '  if (typeof input !== "number" || !Number.isInteger(input)) throw new Error("age: expected integer");',
        '  if (input < 0 || input > 150) throw new Error("age: out of range");',
        "  return input;",
        "}",
        'console.log(parseAge(JSON.parse("30")));',
        "try { parseAge(JSON.parse('\"30\"')); } catch (e) { console.log((e as Error).message); }",
      ],
      expected: "30\nage: expected integer",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "كمية صالحة",
      prompt: "الكمية من JSON يجب أن تكون عدداً صحيحاً من 1 فصاعداً. typeof وحده يقبل 2.5. أي فحص يكمل الحارس؟ الناتج: true false false false",
      template: `function isQty(x: unknown): x is number {
  return typeof x === "number" && ___ && x >= 1;
}
const inputs: unknown[] = JSON.parse('[3, 2.5, "3", null]');
console.log(inputs.map((x) => isQty(x)).join(" "));`,
      options: ["Number.isInteger(x)", "!Number.isNaN(x)", "x > 0"],
      expected: "true false false false",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "typeof null",
      prompt: "الحارس ينهار حين يصل null من الخادم. tsc حذّر منه أصلاً: 'x' is possibly 'null'. أصلحه ليُطبع: user Sara ثم rejected ثم rejected",
      code: `function isUser(x: unknown): x is { name: string } {
  return typeof x === "object" && "name" in x && typeof x.name === "string";
}
const inputs: unknown[] = JSON.parse('[{"name":"Sara"}, null, {"name":7}]');
for (const x of inputs) console.log(isUser(x) ? "user " + x.name : "rejected");`,
      expected: "user Sara\nrejected\nrejected",
      hint: "typeof null يساوي \"object\" في JavaScript، و \"name\" in null يرمي TypeError. أضف x !== null قبل in.",
      solution: `function isUser(x: unknown): x is { name: string } {
  return typeof x === "object" && x !== null && "name" in x && typeof x.name === "string";
}
const inputs: unknown[] = JSON.parse('[{"name":"Sara"}, null, {"name":7}]');
for (const x of inputs) console.log(isUser(x) ? "user " + x.name : "rejected");`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "محلّل يرجع نتيجة",
      prompt: "اكتب parseOrder(x: unknown): Result<Order>. إن لم يكن x كائناً (أو كان null أو مصفوفة): \"expected object\". إن لم يكن id نصاً: \"id: expected string\". إن لم تكن qty عدداً صحيحاً >= 1: \"qty: expected integer >= 1\". وإلا { ok: true, value: { id, qty } }. الناتج: o_1 x2 ثم qty: expected integer >= 1 ثم id: expected string ثم expected object",
      starter: `type Order = { id: string; qty: number };
type Result<T> = { ok: true; value: T } | { ok: false; error: string };
function parseOrder(x: unknown): Result<Order> {
  return { ok: false, error: "todo" }; // check x here
}
for (const text of ['{"id":"o_1","qty":2}', '{"id":"o_2","qty":0}', '{"qty":1}', "[1]"]) {
  const r = parseOrder(JSON.parse(text));
  console.log(r.ok ? r.value.id + " x" + r.value.qty : r.error);
}`,
      expected: "o_1 x2\nqty: expected integer >= 1\nid: expected string\nexpected object",
      hint: "بعد فحص الكائن: const o = x as Record<string, unknown>; ثم typeof o.id و Number.isInteger(o.qty). المدقّق يضيّق o.id و o.qty بعد كل فحص.",
      solution: `type Order = { id: string; qty: number };
type Result<T> = { ok: true; value: T } | { ok: false; error: string };
function parseOrder(x: unknown): Result<Order> {
  if (typeof x !== "object" || x === null || Array.isArray(x)) return { ok: false, error: "expected object" };
  const o = x as Record<string, unknown>;
  if (typeof o.id !== "string") return { ok: false, error: "id: expected string" };
  if (typeof o.qty !== "number" || !Number.isInteger(o.qty) || o.qty < 1) {
    return { ok: false, error: "qty: expected integer >= 1" };
  }
  return { ok: true, value: { id: o.id, qty: o.qty } };
}
for (const text of ['{"id":"o_1","qty":2}', '{"id":"o_2","qty":0}', '{"qty":1}', "[1]"]) {
  const r = parseOrder(JSON.parse(text));
  console.log(r.ok ? r.value.id + " x" + r.value.qty : r.error);
}`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع؟",
      code: `const x: unknown = JSON.parse("null");
console.log(typeof x === "object");`,
      options: ["true", "false", "TypeError"],
      answer: 0,
      why: "خطأ قديم في JavaScript: typeof null يساوي \"object\". لذلك يرافق كل فحص typeof === \"object\" فحص x !== null، و tsc يذكّرك به: 'x' is possibly 'null'.",
    },
    {
      question: "ماذا يقول tsc، وماذا يُطبع؟",
      code: `type User = { name: string };
const u = JSON.parse('{"name":7}') satisfies User;
console.log(typeof u.name);`,
      options: ["tsc صامت، ويُطبع number", "tsc: Type 'number' is not assignable to type 'string'.", "tsc صامت، ويُطبع string"],
      answer: 0,
      why: "satisfies فحص وقت الكتابة مثل كل الأنواع، و any يرضيه دائماً. لا شيء من as أو satisfies أو : User يجري وقت التشغيل. الفحص الحقيقي كود: typeof و in و Array.isArray.",
    },
    {
      question: "أي قيمة تحتاج فحصاً وقت التشغيل؟",
      code: `// a) await res.json() from your own API
// b) an argument passed between two of your typed functions
// c) a constant object literal written in your code`,
      options: ["a وحدها", "a و b", "الثلاث"],
      answer: 0,
      why: "b و c داخل البرنامج: المدقّق رأى كل سطر أنتجهما. a تعبر حداً: الخادم قد يُحدَّث أو يتعطل أو يُخترق، حتى لو كان خادمك. الفحص مكانه الباب، مرة واحدة، ثم تثق بالأنواع في الداخل.",
    },
    {
      question: "parseUser تبني كائناً جديداً: { name: x.name, age: x.age }. ماذا يُطبع؟",
      code: `const r = parseUser(JSON.parse('{"name":"Sara","age":20,"isAdmin":true}'));
if (r.ok) console.log(Object.keys(r.value).length);`,
      options: ["2", "3", "0"],
      answer: 0,
      why: "المحلّل ينسخ الحقول التي يعرفها فقط، فيسقط isAdmin. لو أرجع x نفسه لعبر الحقل الزائد إلى قاعدة البيانات، وهذا باب هجوم معروف. المحلّل يحرس الشكل والمحتوى معاً.",
    },
    {
      question: "متغير البيئة PORT غير موجود. ما قيمة port، وماذا يقول tsc؟",
      code: `const port: number = Number(process.env.PORT);
server.listen(port);`,
      options: ["NaN، و tsc صامت", "undefined، و tsc يحذّر", "3000 تلقائياً"],
      answer: 0,
      why: "Number(undefined) يساوي NaN، و NaN نوعه number، فالمدقّق راضٍ. متغيرات البيئة حدّ آخر: افحصها كلها عند بدء التشغيل بمحلّل، وأوقف البرنامج برسالة واضحة إن نقص شيء.",
    },
  ],
  next: "ts-migration",
};
