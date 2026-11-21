import type { Cell, Frame, HeapObj, Lesson, Slot } from "@/lib/types";

const n = (name: string, value: number): Slot => ({ name, value: String(value), type: "number" });
const s = (name: string, value: string): Slot => ({ name, value: `"${value}"`, type: "string" });
const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
const obj = (id: number, items: Slot[]): HeapObj => ({ id, kind: "object", items });
const arr = (id: number, items: Slot[]): HeapObj => ({ id, kind: "array", items });
const global = (vars: Slot[]): Frame[] => [{ id: 0, name: "global", vars }];
const cell = (name: string, value: string): Cell => ({ name, value, type: "none" });

const user = obj(1, [s("name", "Sara"), ref("tags", 2)]);
const tags1 = arr(2, [s("0", "admin")]);
const tags2 = arr(2, [s("0", "admin"), s("1", "dev")]);
const copy = obj(3, [s("name", "Omar"), ref("tags", 2)]);
const rest = arr(4, [n("0", 20), n("1", 30)]);
const base = [ref("user", 1), s("name", "Sara"), n("age", 30)];

export const jsDestructuring: Lesson = {
  slug: "js-destructuring",
  stage: 0,
  number: "2.7",
  title: "التفكيك والنشر",
  subtitle: "قراءات كثيرة في سطر واحد، ونسخة من طبقة واحدة",
  minutes: 22,
  problem: {
    title: "نسخة تغيّر الأصل",
    body: "أخذنا نسخة من إعدادات المستخدم بـ { ...user }. غيّر الاسم في النسخة، ثم غيّر المدينة فيها. راقب الأصل في كل مرة.",
    demo: "jsDestructuring",
  },
  singleLanguage: true,
  scene: {
    code: {
      js: `const user = { name: "Sara", tags: ["admin"] };
const { name, age = 30 } = user;
const copy = { ...user, name: "Omar" };
copy.tags.push("dev");
const [first, ...rest] = [10, 20, 30];
console.log(name, age, user.tags.length, first, rest.length);`,
    },
    steps: [
      {
        line: null,
        say: "التفكيك والنشر لا يضيفان شيئاً جديداً إلى الذاكرة: هما طريقة مختصرة لكتابة قراءات ونسخ كنت ستكتبها سطراً سطراً.",
        memory: [],
      },
      {
        line: 1,
        say: "كائن في الكومة (#1)، وداخله مصفوفة مستقلة (#2). الخاصية tags لا تحوي المصفوفة: تحوي سهماً إليها.",
        memory: [],
        frames: global([ref("user", 1)]),
        heap: [user, tags1],
        changedHeap: [1, 2],
      },
      {
        line: 2,
        say: "هذا السطر يساوي: const name = user.name. فيُنسخ النص \"Sara\" إلى درج جديد اسمه name.",
        memory: [],
        frames: global([ref("user", 1), s("name", "Sara")]),
        heap: [user, tags1],
      },
      {
        line: 2,
        say: "ثم age = user.age. لا توجد خاصية age، فالقراءة تعطي undefined، و undefined وحدها تفعّل القيمة الافتراضية: age = 30.",
        memory: [],
        frames: global(base),
        heap: [user, tags1],
      },
      {
        line: 3,
        say: "النشر ...user يبني كائناً جديداً (#3) وينسخ إليه كل خاصية بالترتيب: name = \"Sara\"، ثم tags. ثم name: \"Omar\" يأتي بعده فيكتب فوقه: الأخير يفوز.",
        memory: [],
        frames: global([...base, ref("copy", 3)]),
        heap: [user, tags1, copy],
        changedHeap: [3],
      },
      {
        line: 3,
        say: "انظر إلى tags في #3: نُسخ السهم لا المصفوفة. صار للمصفوفة #2 سهمان، من #1 ومن #3. هذه نسخة سطحية: طبقة واحدة فقط.",
        memory: [],
        frames: global([...base, ref("copy", 3)]),
        heap: [user, tags1, copy],
      },
      {
        line: 4,
        say: "copy.tags يتبع السهم إلى #2 ويضيف \"dev\". المصفوفة واحدة، فـ user.tags تغيّرت أيضاً.",
        memory: [],
        frames: global([...base, ref("copy", 3)]),
        heap: [user, tags2, copy],
        changedHeap: [2],
      },
      {
        line: 5,
        say: "تفكيك المصفوفة يقرأ بالموضع: first = الخانة 0. و ...rest تجمع الباقي في مصفوفة جديدة (#4).",
        memory: [],
        frames: global([...base, ref("copy", 3), n("first", 10), ref("rest", 4)]),
        heap: [user, tags2, copy, rest],
        changedHeap: [4],
      },
      {
        line: 6,
        say: "Sara 30، ثم 2 لأن user.tags هي المصفوفة التي أضاف إليها copy، ثم 10، ثم 2 خانتان في rest.",
        memory: [],
        frames: global([...base, ref("copy", 3), n("first", 10), ref("rest", 4)]),
        heap: [user, tags2, copy, rest],
        output: ["Sara 30 2 10 2"],
      },
      {
        line: null,
        say: "الصورة: التفكيك = قراءات تنسخ القيم إلى أدراج جديدة. النشر = صندوق جديد تُنسخ إليه الخانات، والأسهم داخلها تبقى تشير إلى الأشياء نفسها.",
        memory: [],
        frames: global([...base, ref("copy", 3), n("first", 10), ref("rest", 4)]),
        heap: [user, tags2, copy, rest],
      },
    ],
    notes: {
      js: "{ } على يسار = تقرأ بالاسم، و [ ] تقرأ بالموضع. ... على يسار = تجمع الباقي (rest)، وعلى يمين = تنشر الخانات (spread). للنسخة العميقة استعمل structuredClone(user).",
    },
  },
  playground: {
    kind: "trace",
    intro: "المتتبّع لا يعرف صيغة التفكيك، وهذه فرصة: هذا ما تفعله JavaScript فعلاً خلف السطرين 2 و 3، مكتوباً بالقراءات العادية. شغّل وراقب الأسهم في الكومة.",
    starter: `const user = { name: "Sara", tags: ["admin"] };
// const { name, age = 30 } = user;
const name = user.name;
let age = user.age;
if (age === undefined) {
  age = 30;
}
// const copy = { ...user, name: "Omar" };
const copy = { name: user.name, tags: user.tags };
copy.name = "Omar";
copy.tags.push("dev");
console.log(user.name, user.tags.length, age);`,
    challenges: [
      "قبل التشغيل: هل سيطبع user.tags.length الرقم 1 أم 2؟",
      "أضف age: 0 إلى user. هل تعمل القيمة الافتراضية؟ لماذا؟",
      "اجعلها نسخة أعمق: tags: user.tags.slice(). كم سهماً يصل الآن إلى المصفوفة الأولى؟",
      "جرّب age: null بدل 0. الافتراضية تفحص undefined فقط، فماذا يُطبع؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع؟",
      code: `const { a = 5, b = 5 } = { a: 0, b: undefined };
console.log(a, b);`,
      options: ["0 5", "5 5", "0 undefined"],
      answer: 0,
      why: "القيمة الافتراضية تعمل حين تكون القراءة undefined فقط. 0 قيمة حقيقية فتبقى، و b قُرئت undefined فأخذت 5.",
      scene: {
        code: { js: "const { a = 5, b = 5 } = { a: 0, b: undefined };\nconsole.log(a, b);" },
        steps: [
          { line: 1, say: "a = الخاصية a = 0. ليست undefined، فلا افتراضية.", memory: [cell("a", "0")], changed: ["a"] },
          { line: 1, say: "b = undefined، فتعمل الافتراضية: b = 5.", memory: [cell("a", "0"), cell("b", "5")], changed: ["b"] },
          { line: 2, say: "يُطبع 0 5.", memory: [cell("a", "0"), cell("b", "5")], output: ["0 5"] },
        ],
      },
    },
    {
      question: "ماذا يطبع السطر الأخير؟",
      code: `const a = { list: [1] };
const b = { ...a };
b.list.push(2);
console.log(a.list.length);`,
      options: ["2", "1", "خطأ"],
      answer: 0,
      why: "النشر نسخ الخاصية list، وقيمتها سهم إلى المصفوفة. b.list و a.list سهمان إلى المصفوفة نفسها.",
      scene: {
        code: { js: "const a = { list: [1] };\nconst b = { ...a };\nb.list.push(2);\nconsole.log(a.list.length);" },
        steps: [
          { line: 1, say: "الكائن #1 فيه سهم إلى المصفوفة #2.", memory: [cell("a", "#1 { list: → #2 }"), cell("#2", "[1]")] },
          { line: 2, say: "كائن جديد #3، نُسخ إليه السهم نفسه.", memory: [cell("a", "#1 { list: → #2 }"), cell("b", "#3 { list: → #2 }"), cell("#2", "[1]")], changed: ["b"] },
          { line: 3, say: "الدفع يحدث في #2.", memory: [cell("a", "#1 { list: → #2 }"), cell("b", "#3 { list: → #2 }"), cell("#2", "[1, 2]")], changed: ["#2"] },
          { line: 4, say: "a.list هي #2: طولها 2.", memory: [cell("a", "#1 { list: → #2 }"), cell("b", "#3 { list: → #2 }"), cell("#2", "[1, 2]")], output: ["2"] },
        ],
      },
    },
    {
      question: "ماذا يطبع؟",
      code: `const defaults = { size: 1, color: "red" };
const options = { size: 3 };
const a = { ...defaults, ...options };
const b = { ...options, ...defaults };
console.log(a.size, b.size);`,
      options: ["3 1", "3 3", "1 1"],
      answer: 0,
      why: "النشر يكتب الخاصيات بالترتيب، والكتابة الأخيرة على الاسم نفسه تفوز. لذلك تُكتب الافتراضيات أولاً ثم خيارات المستخدم.",
      scene: {
        code: { js: "const defaults = { size: 1, color: \"red\" };\nconst options = { size: 3 };\nconst a = { ...defaults, ...options };\nconst b = { ...options, ...defaults };\nconsole.log(a.size, b.size);" },
        steps: [
          { line: 3, say: "a: من defaults size = 1، ثم من options size = 3 فوقه.", memory: [cell("a", '{ size: 3, color: "red" }')], changed: ["a"] },
          { line: 4, say: "b: من options size = 3، ثم defaults تكتب size = 1 فوقه.", memory: [cell("a", '{ size: 3, color: "red" }'), cell("b", '{ size: 1, color: "red" }')], changed: ["b"] },
          { line: 5, say: "يُطبع 3 1.", memory: [cell("a", '{ size: 3, color: "red" }'), cell("b", '{ size: 1, color: "red" }')], output: ["3 1"] },
        ],
      },
    },
  ],
  code: {
    intro: "كيف يستعملها المحترفون: دالة تأخذ كائن خيارات مفكّكاً بقيم افتراضية، ودمج إعدادات، وإعادة تسمية عند القراءة من رد API، وتبديل متغيرين، ونسخة عميقة لطبقتين حين تحتاجها.",
    runnerStarter: `function createUser({ name, role = "member", active = true } = {}) {
  return { name, role, active };
}
console.log(createUser({ name: "Sara" }));
console.log(createUser({ name: "Omar", role: "admin" }));

const defaults = { theme: "light", lang: "en", page: 20 };
const saved = { lang: "ar" };
const settings = { ...defaults, ...saved };
console.log(settings);

const response = { data: { user: { id: 7, full_name: "Huda" } }, status: 200 };
const { data: { user: { id, full_name: fullName } }, status } = response;
console.log(id, fullName, status);

let a = 1;
let b = 2;
[a, b] = [b, a];
console.log(a, b);

const cart = { items: ["tea"], owner: "Sara" };
const safeCopy = { ...cart, items: [...cart.items] };
safeCopy.items.push("cake");
console.log(cart.items.length, safeCopy.items.length);

const [winner, ...others] = ["Sara", "Omar", "Huda"];
console.log(winner, others);
// try: call createUser() with no argument. What does "= {}" protect you from?
`,
  },
  exercises: [
    {
      kind: "order",
      title: "المسافة",
      prompt: "رتّب الأسطر: نقطة، ثم فكّك x و y، ثم احسب المسافة من الصفر. الناتج: 5",
      lines: ["const point = { x: 3, y: 4 };", "const { x, y } = point;", "const dist = Math.sqrt(x * x + y * y);", "console.log(dist);"],
      expected: "5",
    },
    {
      kind: "fill",
      title: "الأول والباقي",
      prompt: "أي صيغة تجعل البرنامج يطبع: 5 3",
      template: `const [first, ___] = [5, 6, 7, 8];
console.log(first, others.length);`,
      options: ["...others", "others", "others..."],
      expected: "5 3",
    },
    {
      kind: "fix",
      title: "إعداداتي غيّرت الافتراضية",
      prompt: "غيّرنا لون النسخة فتغيّر لون الافتراضيات أيضاً. اجعل النسخة تنسخ theme كذلك حتى يطبع: blue red",
      code: `const defaults = { theme: { color: "blue" }, size: 1 };
const mine = { ...defaults };
mine.theme.color = "red";
console.log(defaults.theme.color, mine.theme.color);`,
      expected: "blue red",
      hint: "النشر نسخ السهم إلى theme. انشر theme أيضاً: { ...defaults, theme: { ...defaults.theme } }.",
      solution: `const defaults = { theme: { color: "blue" }, size: 1 };
const mine = { ...defaults, theme: { ...defaults.theme } };
mine.theme.color = "red";
console.log(defaults.theme.color, mine.theme.color);`,
    },
    {
      kind: "write",
      title: "بطاقة مستخدم",
      prompt: "اكتب formatUser التي تفكّك وسيطها مباشرة: { name, city = \"Riyadh\" }، وترجع name + \" from \" + city. اطبع formatUser({ name: \"Sara\", city: \"Jeddah\" }) ثم formatUser({ name: \"Omar\" }).",
      starter: "// function formatUser({ ... }) { ... }\n",
      expected: "Sara from Jeddah\nOmar from Riyadh",
      hint: "function formatUser({ name, city = \"Riyadh\" }) { return `${name} from ${city}`; }",
      solution: `function formatUser({ name, city = "Riyadh" }) {
  return \`\${name} from \${city}\`;
}
console.log(formatUser({ name: "Sara", city: "Jeddah" }));
console.log(formatUser({ name: "Omar" }));`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: 'const { length } = "hello";\nconsole.log(length);',
      options: ["5", "undefined", "خطأ"],
      answer: 0,
      why: "التفكيك قراءة خاصية: const length = \"hello\".length. والنص له خاصية length = 5.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'const { name: title } = { name: "Tea" };\nconsole.log(title);',
      options: ["Tea", "undefined", "name"],
      answer: 0,
      why: "name: title تعني: اقرأ الخاصية name وضعها في درج اسمه title. لا يُنشأ درج اسمه name.",
    },
    {
      question: "ماذا يطبع؟",
      code: "function f({ x = 1 } = {}) {\n  return x;\n}\nconsole.log(f(), f({ x: null }));",
      options: ["1 null", "1 1", "خطأ ثم 1"],
      answer: 0,
      why: "f() بلا وسيط: الوسيط undefined فيأخذ {}، ثم x تُقرأ undefined فتصير 1. أما null فقيمة حقيقية، والافتراضية لا تعمل إلا مع undefined.",
    },
    {
      question: "ماذا يطبع؟",
      code: "const arr = [1, 2];\nconst more = [...arr, 3];\nconsole.log(arr.length, more.length);",
      options: ["2 3", "3 3", "2 2"],
      answer: 0,
      why: "[...arr, 3] مصفوفة جديدة: تُنسخ إليها خانتا arr ثم 3. الأصل لم يُلمس.",
    },
    {
      question: "ماذا يطبع؟",
      code: "const [a, , c] = [1, 2, 3];\nconsole.log(a, c);",
      options: ["1 3", "1 2", "1 undefined"],
      answer: 0,
      why: "التفكيك بالموضع: الفاصلة الفارغة تتخطى الخانة 1، فـ c تقرأ الخانة 2.",
    },
  ],
  next: "js-map-set",
};
