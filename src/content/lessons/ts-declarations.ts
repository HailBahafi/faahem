import type { Cell, Lesson, Scene } from "@/lib/types";

const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const readers = [label("node runs", "money.js"), label("tsc reads", "money.d.ts")];

export const tsDeclarations: Lesson = {
  slug: "ts-declarations",
  stage: 0,
  number: "2.6",
  title: "ملفات التعريف d.ts",
  subtitle: "ورقة ملصقات بلا محتوى: تصف كوداً لا يراه المدقّق",
  minutes: 20,
  problem: {
    title: "مكتبة لا يرى المدقّق داخلها",
    body: "مكتبة tiny-slug مكتوبة بـ JavaScript. المدقّق لا يقرأ كودها، بل يقرأ ورقة تصفها. جرّب ثلاث حالات: بلا ورقة، بورقة صحيحة، بورقة كاذبة. ماذا يقول المدقّق؟ وماذا يحدث عند التشغيل؟",
    demo: "tsDeclarations",
  },
  singleLanguage: true,
  scene: {
    code: {
      js: `// money.js: the code that runs
export function formatSar(halalas) {
  return (halalas / 100).toFixed(2) + " SAR";
}
export const VAT_RATE = 0.15;
export class Cart {
  items = [];
  add(name, price) { this.items.push({ name, price }); return this; }
}`,
      ts: `// money.d.ts: only the labels
export declare function formatSar(halalas: number): string;


export declare const VAT_RATE: number;
export declare class Cart {
  items: { name: string; price: number }[];
  add(name: string, price: number): this;
}`,
    },
    steps: [
      {
        line: null,
        say: "مكتبة من ملفين بالاسم نفسه. بدّل بين JavaScript و TypeScript أعلى الكود: الأول هو ما يعمل، والثاني ورقة تصفه. كل سطر في الورقة يقابل سطراً في الكود.",
        memory: [],
      },
      {
        line: 1,
        say: "قاعدة الصورة كلها: Node يحمّل money.js ولا يعرف أن الورقة موجودة. و tsc يقرأ money.d.ts ولا يفتح money.js أبداً.",
        memory: readers,
      },
      {
        line: 2,
        say: "declare function: توقيع بلا جسم، ينتهي بفاصلة منقوطة. declare تعني \"هذا موجود عند التشغيل في مكان ما، وأنا أصفه فقط\".",
        memory: [...readers, label("formatSar", "(halalas: number) => string")],
        changed: ["formatSar"],
      },
      {
        line: 3,
        say: "الجسم يعيش في JavaScript وحدها. في الورقة لا شيء مقابل هذا السطر: ملف d.ts لا يحتوي كوداً يعمل، ولا يُنتج JavaScript.",
        memory: [...readers, label("formatSar", "(halalas: number) => string")],
      },
      {
        line: 5,
        say: "الثابت: الورقة تقول نوعه number فقط. القيمة 0.15 في الكود، والمدقّق لا يعرفها.",
        memory: [...readers, label("VAT_RATE", "number")],
        changed: ["VAT_RATE"],
      },
      {
        line: 8,
        say: "الصنف يُوصف بشكل كائناته: الحقل items ونوعه، و add ترجع this، فيُسمح بسلسلة cart.add(...).add(...).",
        memory: [...readers, label("Cart", "{ items; add(): this }")],
        changed: ["Cart"],
      },
      {
        line: 2,
        say: "الآن تطبيقك يستدعي formatSar(\"12\"). المدقّق يقارن بالورقة فقط: النص ليس رقماً، فخط أحمر، دون أن يقرأ سطراً من money.js.",
        memory: [...readers, label("formatSar", "(halalas: number) => string")],
        error: "Argument of type 'string' is not assignable to parameter of type 'number'.",
      },
      {
        line: null,
        say: "من يكتب الورقة؟ tsc نفسه مع \"declaration\": true من ملفات ts. أو متطوعو DefinitelyTyped في حزم @types لمكتبات JavaScript. أو أنت. وإن كذبت الورقة فالمدقّق لا يعرف: يصدّقها.",
        memory: readers,
      },
    ],
    notes: {
      ts: "ملف d.ts عقد بين كودين: يُشحن مع كل مكتبة TypeScript منشورة، ويقرؤه محررك ليكمل لك الأسماء ويعرض الأنواع حين تمرّر الفأرة.",
      js: "JavaScript وحدها لا تحمل أنواعاً: هذا الملف وحده لا يخبر المدقّق بشيء عن halalas.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة لما يفعله المدقّق مع ورقة التعريف: مكتبة فيها كود، وورقة فيها أنواع المعاملات فقط. checkCall يقارن الاستدعاء بالورقة دون أن يقرأ كود المكتبة.",
    starter: `const lib = {
  formatSar: function (halalas) {
    return (halalas / 100).toFixed(2) + " SAR";
  },
};
const dts = { formatSar: ["number"] };
function checkCall(name, args) {
  const want = dts[name];
  for (let i = 0; i < want.length; i++) {
    if (typeof args[i] !== want[i]) {
      return "error: argument " + (i + 1) + " should be " + want[i];
    }
  }
  return "ok";
}
console.log(checkCall("formatSar", [1250]), lib.formatSar(1250));
console.log(checkCall("formatSar", ["1250"]));`,
    challenges: [
      "شغّل lib.formatSar(\"1250\") بنفسك. هل تنهار JavaScript؟ ماذا تطبع؟ ولماذا يرفضها المدقّق مع ذلك؟",
      "اكذب في الورقة: غيّر \"number\" إلى \"string\". من يحكم الآن بأن formatSar(1250) خطأ؟ والكود لم يتغيّر!",
      "أضف إلى lib دالة vat(halalas) ترجع Math.round(halalas * 0.15)، وأضف سطرها في dts.",
    ],
  },
  predict: [
    {
      question: "tsc لا يعترض على app.ts. ماذا يحدث عند تشغيله؟",
      code: `// words.d.ts
export declare function wordCount(text: string): number;
// words.js (the real code)
export function wordCount(text) { return String(text.split(" ").length); }
// app.ts
import { wordCount } from "./words";
console.log(wordCount("a b c").toFixed(1));`,
      options: ["ينهار: toFixed is not a function", "يطبع 3.0", "tsc يكتشف أن الدالة ترجع نصاً"],
      answer: 0,
      why: "المدقّق يقرأ الورقة فقط، والورقة تقول number. الكود الحقيقي يرجع النص \"3\"، ولا toFixed للنصوص. الورقة الكاذبة أسوأ من غيابها: تعطيك ثقة لا أساس لها.",
      scene: check(
        `// words.d.ts
export declare function wordCount(text: string): number;
// words.js (the real code)
export function wordCount(text) { return String(text.split(" ").length); }
// app.ts
import { wordCount } from "./words";
console.log(wordCount("a b c").toFixed(1));`,
        [
          { line: 2, say: "الورقة تعد برقم.", memory: [label("tsc believes", "wordCount(): number")] },
          { line: 7, say: "المدقّق: رقم، و toFixed للأرقام. لا خط أحمر.", memory: [label("tsc believes", "wordCount(): number")] },
          { line: 4, say: "عند التشغيل يعمل هذا الكود، لا الورقة: يرجع النص \"3\".", memory: [{ name: "result", value: '"3"', type: "string" }] },
          { line: 7, say: "toFixed على نص: انهيار.", memory: [{ name: "result", value: '"3"', type: "string" }], error: "TypeError: wordCount(...).toFixed is not a function" },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc عن السطر 2 في هذا الملف math.d.ts؟",
      code: `// math.d.ts
export function add(a: number, b: number): number { return a + b; }`,
      options: ["An implementation cannot be declared in ambient contexts", "لا خطأ", "Missing return type"],
      answer: 0,
      why: "ملف d.ts كله \"سياق محيط\" (ambient): يصف ما هو موجود في مكان آخر. الأجسام ممنوعة فيه. التوقيع وحده: export function add(a: number, b: number): number;",
      scene: check(
        `// math.d.ts
export function add(a: number, b: number): number { return a + b; }`,
        [
          { line: 1, say: "ملف d.ts: أوصاف فقط.", memory: [label("file kind", "declarations only")] },
          { line: 2, say: "جسم دالة في ورقة أوصاف: مرفوض.", memory: [label("file kind", "declarations only")], error: "An implementation cannot be declared in ambient contexts." },
        ],
      ),
    },
    {
      question: "ثبّت مكتبة JavaScript لا تشحن أنواعاً. ماذا يقول tsc (في وضع strict) عن السطر 1؟",
      code: `import slug from "tiny-slug";
console.log(slug("Hello World"));`,
      options: [
        "Could not find a declaration file for module 'tiny-slug'. '.../index.js' implicitly has an 'any' type",
        "Cannot find module 'tiny-slug'",
        "لا خطأ: slug نوعه any بهدوء",
      ],
      answer: 0,
      why: "المكتبة موجودة وتعمل، لكن لا ورقة تصفها. strict يرفض أن يصير كل ما فيها any بصمت. الحل: npm i -D @types/tiny-slug إن وُجدت، أو ورقتك أنت: declare module \"tiny-slug\" { export default function slug(text: string): string; }",
      scene: check(
        `import slug from "tiny-slug";
console.log(slug("Hello World"));`,
        [
          { line: 1, say: "tsc يجد index.js في node_modules، ويبحث عن index.d.ts أو @types/tiny-slug. لا شيء.", memory: [label("tiny-slug types", "?")] },
          { line: 1, say: "بلا ورقة: كل شيء any، و strict يرفض ذلك.", memory: [label("tiny-slug types", "any")], error: "Could not find a declaration file for module 'tiny-slug'. '.../node_modules/tiny-slug/index.js' implicitly has an 'any' type." },
        ],
      ),
    },
  ],
  code: {
    intro: "declare في مشروع حقيقي: ثابت تحقنه أداة البناء (مثل رقم الإصدار)، ودالة يضيفها سكربت خارجي إلى الصفحة. نلعب هنا دور الأداة والسكربت لكي يعمل البرنامج. ولاحظ دمج interface: إعلانان بالاسم نفسه يصيران واحداً، وبهذا تضيف المكتبات حقولاً إلى أنواع غيرها.",
    runnerLang: "ts",
    runnerStarter: `// In a real project these two lines live in env.d.ts.
declare const APP_VERSION: string;
declare function track(event: string, data?: Record<string, unknown>): void;

// Here we play the bundler and the analytics script, so the values exist at run time:
const g = globalThis as any;
g.APP_VERSION = "1.4.0";
g.track = (event: string, data?: Record<string, unknown>) => console.log("tracked:", event, JSON.stringify(data ?? {}));

console.log("version", APP_VERSION);
track("app_open", { screen: "home" });

// Declaration merging: two interfaces with one name become one type.
interface Settings {
  theme: "dark" | "light";
}
interface Settings {
  fontSize: number;
}
const s: Settings = { theme: "dark", fontSize: 16 };
console.log(s.theme, s.fontSize);
// try: delete the line g.APP_VERSION = ... and run. tsc would still be happy. Why?
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "الوصف لا ينشئ القيمة",
      prompt: "رتّب الأسطر: declare يصف RATE فقط، فيجب أن تُعطى قيمته قبل أن تُستعمل. الناتج: 1150",
      lines: [
        "declare const RATE: number;",
        "(globalThis as any).RATE = 0.15;",
        "function withVat(halalas: number): number {",
        "  return Math.round(halalas * (1 + RATE));",
        "}",
        "console.log(withVat(1000));",
      ],
      expected: "1150",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "طبّق ما تعد به الورقة",
      prompt: "الورقة تقول: export declare function greet(name: string, excited?: boolean): string; والمتوقع \"!\" فقط حين excited صحيح. أي تعبير يطبع hi Sara hi Omar!؟",
      template: `function greet(name: string, excited = false): string {
  return "hi " + name + (___);
}
console.log(greet("Sara"), greet("Omar", true));`,
      options: ['excited ? "!" : ""', 'excited ? "" : "!"', '"!"'],
      expected: "hi Sara hi Omar!",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "الكود يخالف ورقته",
      prompt: "ورقة price.d.ts تقول: export declare function parsePrice(text: string): number; والمدقّق يصدّقها. لكن الكود يرجع نصاً، فيطبع 121 بدل 13. أصلح الكود ليفي بالورقة.",
      code: `function parsePrice(text: string) {
  return text.replace("SAR", "").trim();
}
console.log(parsePrice("12 SAR") + 1);`,
      expected: "13",
      hint: "حوّل الناتج إلى رقم: return Number(text.replace(\"SAR\", \"\").trim()); واكتب نوع الإرجاع : number ليحرسه المدقّق.",
      solution: `function parsePrice(text: string): number {
  return Number(text.replace("SAR", "").trim());
}
console.log(parsePrice("12 SAR") + 1);`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "اكتب ما وُصف",
      prompt: "الورقة تقول: export declare function chunk<T>(items: T[], size: number): T[][]; اكتب chunk التي تقسم المصفوفة إلى قطع بطول size (الأخيرة قد تكون أقصر). ثم اطبع JSON.stringify(chunk([1, 2, 3, 4, 5], 2)): [[1,2],[3,4],[5]]",
      starter: "// write chunk<T> here, then print JSON.stringify(chunk([1, 2, 3, 4, 5], 2))\n",
      expected: "[[1,2],[3,4],[5]]",
      hint: "for (let i = 0; i < items.length; i += size) { out.push(items.slice(i, i + size)); }",
      solution: `function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}
console.log(JSON.stringify(chunk([1, 2, 3, 4, 5], 2)));`,
    },
  ],
  quiz: [
    {
      question: "ما JavaScript الذي يكتبه tsc من هذا الملف؟",
      code: "// money.d.ts\nexport declare function formatSar(halalas: number): string;\nexport declare const VAT_RATE: number;",
      options: ["لا شيء: ملف d.ts لا يُنتج JavaScript", "export function formatSar(halalas) {}", "export const VAT_RATE = 0;"],
      answer: 0,
      why: "الورقة أنواع خالصة، وكل الأنواع تُحذف. الكود الذي يعمل موجود في ملف js آخر، والورقة تصفه فقط.",
    },
    {
      question: "tsc يقبل هذا الملف. ماذا يحدث عند التشغيل؟",
      code: "declare const API_URL: string;\nconsole.log(API_URL);",
      options: ["ReferenceError: API_URL is not defined", "يطبع undefined", "يطبع \"\""],
      answer: 0,
      why: "declare وعد بأن شيئاً آخر سيعرّف API_URL، لا تعريف له. إن لم تحقنه أداة البناء أو سكربت قبله، فالاسم غير موجود في الذاكرة أصلاً.",
    },
    {
      question: "مع \"declaration\": true، ماذا يكتب tsc في area.d.ts؟",
      code: "// area.ts\nexport function area(w: number, h: number) {\n  return w * h;\n}",
      options: [
        "export declare function area(w: number, h: number): number;",
        "export function area(w, h) { return w * h; }",
        "export declare function area(w: number, h: number): any;",
      ],
      answer: 0,
      why: "tsc يكتب ملفين: area.js بالكود بلا أنواع، و area.d.ts بالتوقيع بلا جسم. ونوع الإرجاع المستنتج number يُكتب صراحة. هكذا تُنشر مكتبات TypeScript.",
    },
    {
      question: "بعد أن أضفت هذه الورقة، ماذا يقول tsc عن slug(42) في app.ts؟",
      code: '// types.d.ts\ndeclare module "tiny-slug" {\n  export default function slug(text: string): string;\n}\n// app.ts: slug(42);',
      options: ["Argument of type 'number' is not assignable to parameter of type 'string'", "لا خطأ: المكتبة JavaScript", "Could not find a declaration file"],
      answer: 0,
      why: "declare module يكتب ورقة لمكتبة لا تشحن أنواعاً. من الآن يفحص المدقّق كل استدعاء لها بهذه الورقة، كما لو كانت مكتوبة بـ TypeScript.",
    },
    {
      question: "ماذا يقول tsc عن السطر 3؟",
      code: "interface Config { port: number }\ninterface Config { host: string }\nconst c: Config = { port: 80 };",
      options: [
        "Property 'host' is missing in type '{ port: number; }' but required in type 'Config'",
        "Duplicate identifier 'Config'",
        "لا خطأ: الثاني يستبدل الأول",
      ],
      answer: 0,
      why: "إعلانا interface بالاسم نفسه يندمجان في نوع واحد فيه port و host. بهذا تضيف مكتبة حقلاً إلى Window أو إلى نوع مكتبة أخرى من ورقتها. (type لا يندمج: تكراره خطأ.)",
    },
  ],
  next: "ts-conditional",
};
