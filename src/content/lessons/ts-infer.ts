import type { Cell, Lesson, Scene } from "@/lib/types";

/** A type the checker holds: its name and the expression it has rewritten it to so far. */
const ty = (name: string, expr: string): Cell => ({ name, value: expr, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const A = ty("A", "string");
const B = ty("B", "Promise<number>");

export const tsInfer: Lesson = {
  slug: "ts-infer",
  stage: 0,
  number: "3.4",
  title: "infer",
  subtitle: "قالب فيه ثقب: يضع المدقّق النوع فوقه، وما يملأ الثقب يأخذ اسماً",
  minutes: 25,
  problem: {
    title: "أخرج نوعاً من داخل نوع",
    body: "عندك نوع جاهز، وتريد جزءاً منه: نوع عناصر المصفوفة، أو ما ترجعه دالة، أو ما في داخل Promise. اختر نوعاً وقالباً، وراقب المدقّق يطابقهما: هل يجد شيئاً يملأ الثقب؟",
    demo: "tsInfer",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `type ElementOf<T> = T extends (infer E)[] ? E : never;
type A = ElementOf<string[]>;
type Ret<F> = F extends (...args: any[]) => infer R ? R : never;
type B = Ret<() => Promise<number>>;
type Unwrap<T> = T extends Promise<infer V> ? Unwrap<V> : T;
type C = Unwrap<B>;
type IdOf<S> = S extends \`user-\${infer N}\` ? N : never;
const id: IdOf<"user-42"> = "42";
console.log(Number(id) + 1);`,
    },
    steps: [
      {
        line: null,
        say: "في الدرس 3.1 كان extends سؤالاً بنعم أو لا. infer يجعله مطابقة قالب: اكتب شكلاً فيه ثقب، فإن طابق النوع الشكل أخذ الثقب اسماً تستعمله في فرع نعم.",
        memory: [],
      },
      {
        line: 1,
        say: "القالب (infer E)[] يعني: مصفوفة من شيء ما، سمِّ هذا الشيء E. E لا يوجد قبل المطابقة.",
        memory: [ty("pattern", "(infer E)[]")],
        changed: ["pattern"],
      },
      {
        line: 2,
        say: "يضع المدقّق string[] فوق القالب: مصفوفة؟ نعم. ما في مكان الثقب؟ string. فـ E = string، والفرع الأول يرجع E.",
        memory: [ty("pattern", "(infer E)[]"), ty("E", "string"), A],
        changed: ["E", "A"],
      },
      {
        line: 3,
        say: "قالب لدالة: أي معاملات، وثقب في مكان نوع الرجوع اسمه R.",
        memory: [A, ty("pattern", "(...args: any[]) => infer R")],
        changed: ["pattern"],
      },
      {
        line: 4,
        say: "() => Promise<number> دالة، وما ترجعه Promise<number>. فـ R = Promise<number>. هكذا تُكتب ReturnType في المكتبة.",
        memory: [A, ty("R", "Promise<number>"), B],
        changed: ["R", "B"],
      },
      {
        line: 6,
        say: "Unwrap<Promise<number>>: القالب Promise<infer V> يطابق، و V = number. لكن فرع نعم يستدعي Unwrap مرة أخرى: نوع عودي.",
        memory: [A, B, ty("V", "number"), ty("C", "Unwrap<number>")],
        changed: ["V", "C"],
      },
      {
        line: 6,
        say: "Unwrap<number>: هل number يطابق Promise<...>؟ لا. فرع لا يرجع T كما هو. C = number. هذا ما تفعله Awaited المبنية مع الوعود المتداخلة.",
        memory: [A, B, ty("C", "number")],
        changed: ["C"],
      },
      {
        line: 7,
        say: "القالب يعمل على النصوص أيضاً: `user-${infer N}` يعني نصاً يبدأ بـ user- ، وما بعدها اسمه N.",
        memory: [ty("C", "number"), ty("pattern", "`user-${infer N}`")],
        changed: ["pattern"],
      },
      {
        line: 8,
        say: "\"user-42\" يبدأ بـ user- ، فما بعده \"42\" يملأ الثقب: N = \"42\". النوع الوحيد المقبول لـ id هو النص الحرفي \"42\".",
        memory: [ty("N", '"42"'), { name: "id", value: '"42"', type: "string" }],
        changed: ["N", "id"],
      },
      {
        line: 9,
        say: "وقت التشغيل لا قوالب ولا ثقوب: id نص عادي. Number(\"42\") + 1 يطبع 43.",
        memory: [{ name: "id", value: '"42"', type: "string" }],
        read: ["id"],
        output: ["43"],
      },
    ],
    notes: {
      ts: "infer X يُكتب فقط داخل الجزء الذي بعد extends، ويُستعمل فقط في فرع نعم. منه تُبنى ReturnType و Parameters و Awaited، ومطابقة النصوص مع template literal types.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة لـ Unwrap: النوع هنا نص، والمطابقة فحص لبدايته ونهايته، والثقب هو ما بينهما. والدالة تستدعي نفسها كما يستدعي النوع نفسه.",
    starter: `function unwrap(type) {
  if (type.slice(0, 8) === "Promise<" && type[type.length - 1] === ">") {
    const inner = type.slice(8, type.length - 1);
    console.log(type + " matches Promise<infer V>, V = " + inner);
    return unwrap(inner);
  }
  console.log(type + " does not match, keep it");
  return type;
}
console.log("C = " + unwrap("Promise<Promise<number>>"));`,
    challenges: [
      "جرّب unwrap(\"number\"). كم مرة تُستدعى الدالة؟",
      "أضف طبقة ثالثة: \"Promise<Promise<Promise<string>>>\". توقّع عدد الأسطر قبل التشغيل.",
      "اكتب دالة elementOf تطابق \"...[]\": إن انتهى النص بـ \"[]\" أرجع ما قبله، وإلا أرجع \"never\". جرّبها على \"string[][]\": كم طبقة تنزع؟",
    ],
  },
  predict: [
    {
      question: "ما النوع R؟",
      code: `function parse(s: string) {
  return { ok: true, value: Number(s) };
}
type R = ReturnType<typeof parse>;`,
      options: ["{ ok: boolean; value: number }", "{ ok: true; value: number }", "{ ok: true; value: string }"],
      answer: 0,
      why: "ReturnType تلتقط ما استنتجه المدقّق لنوع الرجوع، و true في كائن قابل للتعديل يتسع إلى boolean. لتحفظ true اكتب ok: true as const، أو اكتب نوع الرجوع بيدك.",
      scene: check(
        `function parse(s: string) {
  return { ok: true, value: Number(s) };
}
type R = ReturnType<typeof parse>;`,
        [
          { line: 2, say: "المدقّق يستنتج نوع الكائن: حقول قابلة للتعديل، فـ true يتسع إلى boolean.", memory: [ty("typeof parse", "(s: string) => { ok: boolean; value: number }")], changed: ["typeof parse"] },
          { line: 4, say: "القالب (...args) => infer R يلتقط نوع الرجوع كما هو.", memory: [ty("R", "{ ok: boolean; value: number }")], changed: ["R"] },
        ],
      ),
    },
    {
      question: "ما النوع R؟",
      code: `type First<T> = T extends [infer H, ...unknown[]] ? H : never;
type R = First<[]>;`,
      options: ["never", "undefined", "unknown"],
      answer: 0,
      why: "القالب يطلب عنصراً أول على الأقل. المصفوفة الفارغة [] لا تطابقه، فلا شيء يملأ الثقب H، ويذهب المدقّق إلى فرع لا: never.",
      scene: check(
        `type First<T> = T extends [infer H, ...unknown[]] ? H : never;
type R = First<[]>;`,
        [
          { line: 2, say: "القالب: عنصر H ثم أي شيء. [] ليس فيها عنصر أول.", memory: [ty("H", "(no match)")], changed: ["H"] },
          { line: 2, say: "لا مطابقة، فرع لا.", memory: [ty("R", "never")], changed: ["R"] },
        ],
      ),
    },
    {
      question: "ما النوع R؟",
      code: `type Split<S> = S extends \`\${infer H},\${infer T}\` ? [H, ...Split<T>] : [S];
type R = Split<"a,b,c">;`,
      options: ['["a", "b", "c"]', '["a", "b,c"]', '["a,b,c"]'],
      answer: 0,
      why: "H يأخذ أقصر ما قبل أول فاصلة: \"a\"، و T الباقي \"b,c\". ثم يستدعي Split نفسه على الباقي حتى لا تبقى فاصلة. هذه حلقة مكتوبة بالعودية، لأن المدقّق لا يملك حلقات.",
      scene: check(
        `type Split<S> = S extends \`\${infer H},\${infer T}\` ? [H, ...Split<T>] : [S];
type R = Split<"a,b,c">;`,
        [
          { line: 2, say: "أول فاصلة: H = \"a\"، T = \"b,c\".", memory: [ty("R", '["a", ...Split<"b,c">]')], changed: ["R"] },
          { line: 2, say: "مرة أخرى: H = \"b\"، T = \"c\".", memory: [ty("R", '["a", "b", ...Split<"c">]')], changed: ["R"] },
          { line: 2, say: "\"c\" بلا فاصلة: لا مطابقة، فرع لا يرجع [\"c\"].", memory: [ty("R", '["a", "b", "c"]')], changed: ["R"] },
        ],
      ),
    },
  ],
  code: {
    intro: "المحترفون يستعملون infer في الأدوات التي تلفّ دوال غيرهم: Parameters و ReturnType تجعل الغلاف يقبل ويرجع ما تقبله الدالة الأصلية وترجعه بالضبط، دون أن تكتب نوعاً واحداً بيدك. ثم مطابقة النصوص: أسماء المعاملات تُستخرج من مسار الرابط نفسه.",
    runnerLang: "ts",
    runnerStarter: `function logged<F extends (...args: any[]) => any>(name: string, fn: F) {
  return (...args: Parameters<F>): ReturnType<F> => {
    const result = fn(...args);
    console.log(\`\${name}(\${args.join(", ")}) = \${result}\`);
    return result;
  };
}
const add = logged("add", (a: number, b: number) => a + b); // tsc: (a: number, b: number) => number
add(2, 3);

// "/users/:id/posts/:postId" -> "id" | "postId", computed by the checker from the string itself.
type Param<S extends string> = S extends \`\${string}:\${infer P}/\${infer Rest}\`
  ? P | Param<Rest>
  : S extends \`\${string}:\${infer P}\`
    ? P
    : never;

function params<S extends string>(pattern: S, path: string): Record<Param<S>, string> {
  const out: Record<string, string> = {};
  const values = path.split("/");
  pattern.split("/").forEach((part, i) => {
    if (part.startsWith(":")) out[part.slice(1)] = values[i];
  });
  return out as Record<Param<S>, string>;
}
const p = params("/users/:id/posts/:postId", "/users/42/posts/7");
console.log(p.id, p.postId);
// try: p.userId. tsc rejects it (Property 'userId' does not exist). What does it print here?
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "غلاف بنفس التوقيع",
      prompt: "رتّب logged: يقبل معاملات الدالة الأصلية ويرجع ما ترجعه. الناتج: add(2, 3) = 5",
      lines: [
        "function logged<F extends (...args: any[]) => any>(name: string, fn: F) {",
        "  return (...args: Parameters<F>): ReturnType<F> => {",
        "    const result = fn(...args);",
        "    console.log(`${name}(${args.join(\", \")}) = ${result}`);",
        "    return result;",
        "  };",
        "}",
        'logged("add", (a: number, b: number) => a + b)(2, 3);',
      ],
      expected: "add(2, 3) = 5",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "ذاكرة لا تنسى الصفر",
      prompt: "memoize تحفظ النتائج: ReturnType<F> هو نوع ما في الذاكرة. أي فحص يحسب كل قيمة مرة واحدة، حتى لو كانت النتيجة 0؟ الناتج: 0 0 9 2",
      template: `let calls = 0;
function slowSquare(n: number): number {
  calls++;
  return n * n;
}
function memoize<F extends (arg: number) => number>(fn: F) {
  const cache = new Map<number, ReturnType<F>>();
  return (arg: Parameters<F>[0]): ReturnType<F> => {
    if (!___) {
      cache.set(arg, fn(arg) as ReturnType<F>);
    }
    return cache.get(arg)!;
  };
}
const sq = memoize(slowSquare);
console.log(sq(0), sq(0), sq(3), calls);`,
      options: ["cache.has(arg)", "cache.get(arg)", "cache.size"],
      expected: "0 0 9 2",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "المفتاح بلا نقطتين",
      prompt: "النوع Param يستخرج \"id\" و \"postId\" بلا النقطتين، لكن الكود يحفظ \":id\" و \":postId\". tsc لا يرى ذلك بسبب as. أصلح المفتاح ليُطبع: 42 7",
      code: `type Param<S extends string> = S extends \`\${string}:\${infer P}/\${infer Rest}\` ? P | Param<Rest> : S extends \`\${string}:\${infer P}\` ? P : never;
function params<S extends string>(pattern: S, path: string): Record<Param<S>, string> {
  const out: Record<string, string> = {};
  const values = path.split("/");
  pattern.split("/").forEach((part, i) => {
    if (part.startsWith(":")) out[part] = values[i];
  });
  return out as Record<Param<S>, string>;
}
const p = params("/users/:id/posts/:postId", "/users/42/posts/7");
console.log(p.id, p.postId);`,
      expected: "42 7",
      hint: "الثقب infer P يلتقط ما بعد النقطتين. افعل مثله: part.slice(1).",
      solution: `type Param<S extends string> = S extends \`\${string}:\${infer P}/\${infer Rest}\` ? P | Param<Rest> : S extends \`\${string}:\${infer P}\` ? P : never;
function params<S extends string>(pattern: S, path: string): Record<Param<S>, string> {
  const out: Record<string, string> = {};
  const values = path.split("/");
  pattern.split("/").forEach((part, i) => {
    if (part.startsWith(":")) out[part.slice(1)] = values[i];
  });
  return out as Record<Param<S>, string>;
}
const p = params("/users/:id/posts/:postId", "/users/42/posts/7");
console.log(p.id, p.postId);`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "غلاف لا ينهار",
      prompt: "اكتب safe<F extends (...args: any[]) => any>(fn: F) ترجع دالة تقبل Parameters<F> وترجع ReturnType<F> | undefined: تستدعي fn، وإن رمت خطأ ترجع undefined. parseAge جاهزة. اطبع safeAge(\"20\") و safeAge(\"x\"): 20 undefined",
      starter: `function parseAge(s: string): number {
  const n = Number(s);
  if (Number.isNaN(n)) throw new Error("not a number: " + s);
  return n;
}
// write safe here, then: const safeAge = safe(parseAge); print safeAge("20") and safeAge("x")
`,
      expected: "20 undefined",
      hint: "return (...args: Parameters<F>): ReturnType<F> | undefined => { try { return fn(...args); } catch { return undefined; } };",
      solution: `function parseAge(s: string): number {
  const n = Number(s);
  if (Number.isNaN(n)) throw new Error("not a number: " + s);
  return n;
}
function safe<F extends (...args: any[]) => any>(fn: F) {
  return (...args: Parameters<F>): ReturnType<F> | undefined => {
    try {
      return fn(...args);
    } catch {
      return undefined;
    }
  };
}
const safeAge = safe(parseAge);
console.log(safeAge("20"), safeAge("x"));`,
    },
  ],
  quiz: [
    {
      question: "ElementOf<T> = T extends (infer E)[] ? E : never. ما النوع R؟",
      code: "type R = ElementOf<number[][]>;",
      options: ["number[]", "number", "never"],
      answer: 0,
      why: "number[][] مصفوفة عناصرها number[]. الثقب يلتقط طبقة واحدة فقط، فـ E = number[]. لتنزع كل الطبقات يجب أن يستدعي النوع نفسه، مثل Unwrap.",
    },
    {
      question: "ما النوع R؟",
      code: "type R = Awaited<Promise<Promise<string>>>;",
      options: ["string", "Promise<string>", "Promise<Promise<string>>"],
      answer: 0,
      why: "Awaited عودية مثل Unwrap: تطابق Promise<infer V> وتعيد المحاولة على V حتى لا يبقى وعد. وهذا ما يحدث وقت التشغيل أيضاً: await على وعد يرجع وعداً يكمل حتى القيمة.",
    },
    {
      question: "ما النوع R؟",
      code: 'type R = "a-b" extends `${infer X}-${infer Y}` ? [X, Y] : never;',
      options: ['["a", "b"]', '["a-b", ""]', "never"],
      answer: 0,
      why: "النص يطابق القالب: ما قبل الشرطة يملأ X، وما بعدها يملأ Y. ثقبان في قالب واحد يلتقطان قطعتين معاً.",
    },
    {
      question: "ماذا يقول tsc؟",
      code: "type Bad<T> = T extends Array<infer E> ? E : E;",
      options: ["Cannot find name 'E'. (في فرع لا)", "لا خطأ: E يساوي unknown في فرع لا", "لا خطأ: E يساوي never في فرع لا"],
      answer: 0,
      why: "E يُولد فقط حين تنجح المطابقة، فيوجد في فرع نعم وحده. في فرع لا لم يُملأ أي ثقب، فالاسم غير موجود.",
    },
    {
      question: "Ret<F> = F extends (...args: any[]) => infer R ? R : never. ما النوع R2؟",
      code: "type R2 = Ret<string>;",
      options: ["never", "string", "unknown"],
      answer: 0,
      why: "string ليس دالة، فلا يطابق القالب ولا شيء يملأ الثقب. فرع لا يرجع never. ReturnType المبنية تمنع هذا مسبقاً بقيد: T extends (...args: any) => any.",
    },
  ],
  next: "ts-branded",
};
