import type { Cell, Frame, Lesson, Scene, Slot } from "@/lib/types";

const label = (name: string, type: string): Cell => ({ name, value: type, type: "none" });
const check = (ts: string, steps: Scene["steps"]): Scene => ({ code: { ts }, steps });

const fn = (name: string): Slot => ({ name, value: `ƒ ${name}`, type: "function" });
const num = (name: string, value: number | string): Slot => ({ name, value: String(value), type: "number" });
const global: Frame = { id: 0, name: "global", vars: [fn("vat"), fn("finalPrice")] };
const call = (vars: Slot[]): Frame[] => [global, { id: 1, name: "finalPrice", vars }];

export const tsFunctions: Lesson = {
  slug: "ts-functions",
  stage: 0,
  number: "1.5",
  title: "الدوال",
  subtitle: "توقيع الدالة عقد: يُفحص عند كل باب دخول وخروج",
  minutes: 20,
  problem: {
    title: "العقد عند الباب",
    body: "هذا توقيع دالة خصم. اختر الوسائط التي تمرّرها لها، واحداً واحداً. من يمر من الباب؟ ومن يوقفه المدقّق قبل أن يدخل؟",
    demo: "tsFunctions",
  },
  singleLanguage: true,
  scene: {
    code: {
      ts: `type Rule = (price: number) => number;
const vat: Rule = (p) => p * 1.15;
function finalPrice(price: number, rule: Rule, discount = 0): number {
  const after = price - discount;
  return Math.round(rule(after));
}
console.log(finalPrice(100, vat));
console.log(finalPrice(100, vat, 20));`,
    },
    steps: [
      {
        line: null,
        say: "الدالة في TypeScript لها توقيع: ما تقبله وما ترجعه. المدقّق يفحصه عند بابين: حين تستدعيها، وحين ترجع.",
        memory: [],
      },
      {
        line: 1,
        say: "type Rule يصف دالة لا كائناً: تأخذ رقماً وترجع رقماً. الدوال قيم، فلها أنواع أيضاً.",
        memory: [label("Rule", "(price: number) => number")],
      },
      {
        line: 2,
        say: "p بلا تعليق، ومع ذلك يعرف المدقّق أنه number: أخذه من Rule. هذا الاستنتاج من السياق. وعند التشغيل: درج vat يحمل دالة.",
        memory: [],
        frames: [{ id: 0, name: "global", vars: [fn("vat")] }],
      },
      {
        line: 3,
        say: "التوقيع: price رقم، rule من نوع Rule، و discount له قيمة افتراضية 0، فنوعه number ويصير اختيارياً للمستدعي. وتعِد الدالة برقم.",
        memory: [],
        frames: [global],
      },
      {
        line: 7,
        say: "باب الدخول: 100 رقم ✓، vat من نوع Rule ✓، والثالث غائب فيأخذ 0. يُفتح إطار جديد في المكدّس بنسخ هذه القيم.",
        memory: [],
        frames: call([num("price", 100), fn("rule"), num("discount", 0)]),
      },
      {
        line: 4,
        say: "after = 100 − 0 = 100، والمدقّق يستنتج أن after رقم.",
        memory: [],
        frames: call([num("price", 100), fn("rule"), num("discount", 0), num("after", 100)]),
      },
      {
        line: 5,
        say: "rule(after) يستدعي vat: ‎100 × 1.15 تعطي 114.99999999999999 (الكسور العشرية في الحاسوب تقريبية)، و Math.round تجعلها 115. باب الخروج: رقم كما وعدت ✓.",
        memory: [],
        frames: call([num("price", 100), fn("rule"), num("discount", 0), num("after", 100)]),
      },
      {
        line: 7,
        say: "يُغلق الإطار ويُطبع 115.",
        memory: [],
        frames: [global],
        output: ["115"],
      },
      {
        line: 8,
        say: "الاستدعاء الثاني بخصم 20: after = 80، و ‎80 × 1.15 تقريباً 92. يُطبع 92.",
        memory: [],
        frames: [global],
        output: ["115", "92"],
      },
      {
        line: null,
        say: "الأنواع فُحصت عند الأبواب ثم مُحيت. ما عمل هو مكدّس الاستدعاء نفسه في JavaScript: إطار لكل استدعاء، ونسخ للوسائط.",
        memory: [],
        frames: [global],
      },
    ],
    notes: {
      ts: "اكتب أنواع المعاملات دائماً، ونوع الإرجاع حين تريد أن يمسك المدقّق خطأ داخل الدالة. والدالة التي تُمرَّر لغيرها تأخذ أنواع معاملاتها من السياق.",
    },
  },
  playground: {
    kind: "trace",
    intro: "الدالة نفسها بلا عقد. JavaScript تقبل أي عدد من الوسائط وأي نوع، ولا تشتكي. شغّل وراقب الإطار في كل استدعاء.",
    starter: `function finalPrice(price, discount) {
  return price - discount;
}
console.log(finalPrice(100, 20));
console.log(finalPrice(100));
console.log(finalPrice("100", 20));
console.log(finalPrice(20, 100));`,
    challenges: [
      "قبل التشغيل: ماذا يطبع السطر 5؟ ما قيمة discount في الإطار؟",
      "السطر 6 يطبع 80 بالصدفة، لأن - تحوّل النص إلى رقم. غيّر - إلى + في الدالة. ماذا يطبع الآن؟",
      "السطر 7 يعطي رقماً سالباً: الوسائط بترتيب خاطئ. هل كان TypeScript سيمسك هذا الخطأ؟ (كلاهما رقم!)",
      "أعط discount قيمة افتراضية: function finalPrice(price, discount = 0). ماذا يطبع السطر 5 الآن؟",
    ],
  },
  predict: [
    {
      question: "ماذا يقول tsc عن السطر 4؟",
      code: `function area(w: number, h: number): number {
  return w * h;
}
console.log(area(5));`,
      options: ["Expected 2 arguments, but got 1", "لا خطأ، ويُطبع NaN", "لا خطأ، و h تأخذ 0"],
      answer: 0,
      why: "في TypeScript كل معامل بلا ؟ وبلا قيمة افتراضية إلزامي. JavaScript كانت ستضع undefined في h وتطبع NaN بصمت؛ المدقّق يوقفك عند الباب.",
      scene: check(
        `function area(w: number, h: number): number {
  return w * h;
}
console.log(area(5));`,
        [
          { line: 1, say: "العقد: معاملان إلزاميان، كلاهما رقم.", memory: [label("area", "(w: number, h: number) => number")] },
          { line: 4, say: "وصل وسيط واحد فقط. الباب لا يُفتح.", memory: [label("area", "(w: number, h: number) => number")], error: "Expected 2 arguments, but got 1." },
        ],
      ),
    },
    {
      question: "ماذا يقول tsc عن هذه الدالة؟",
      code: `function discount(price: number): number {
  if (price > 100) {
    return price * 0.9;
  }
}`,
      options: ["خطأ: طريق يصل إلى النهاية بلا return", "لا خطأ: الدالة ترجع رقماً", "لا خطأ، وترجع 0 للأسعار الصغيرة"],
      answer: 0,
      why: "باب الخروج وُعد برقم. لكن سعر 50 يتخطى الـ if ويخرج من الدالة بلا return، أي يرجع undefined. المدقّق يفحص كل الطرق: Function lacks ending return statement and return type does not include 'undefined'.",
      scene: check(
        `function discount(price: number): number {
  if (price > 100) {
    return price * 0.9;
  }
}`,
        [
          { line: 1, say: "الدالة تعِد برقم في كل الأحوال.", memory: [label("discount", "(price: number) => number")] },
          { line: 3, say: "طريق السعر الكبير يرجع رقماً ✓.", memory: [label("discount", "(price: number) => number")] },
          { line: 5, say: "طريق السعر الصغير يصل إلى } بلا return: يرجع undefined. خط أحمر على نوع الإرجاع.", memory: [label("discount", "(price: number) => number")], error: "Function lacks ending return statement and return type does not include 'undefined'." },
        ],
      ),
    },
    {
      question: "لم نكتب أي نوع للدالة داخل map. ماذا يقول tsc عن السطر 3؟",
      code: `const prices = [10, 20, 30];
const labels = prices.map((p) => p.toFixed(2));
console.log(labels[0].toFixed(1));`,
      options: ["Property 'toFixed' does not exist on type 'string'", "لا خطأ: labels أرقام", "لا خطأ: labels نوعها any"],
      answer: 0,
      why: "المدقّق يتتبّع الأنواع عبر الدوال: prices أرقام، فـ p رقم من السياق، و toFixed ترجع نصاً، فـ labels مصفوفة نصوص. و toFixed للأرقام فقط.",
      scene: check(
        `const prices = [10, 20, 30];
const labels = prices.map((p) => p.toFixed(2));
console.log(labels[0].toFixed(1));`,
        [
          { line: 1, say: "مصفوفة أرقام: number[].", memory: [label("prices", "number[]")] },
          { line: 2, say: "map تعطي الدالة كل عنصر، فـ p رقم. و toFixed ترجع string، فالنتيجة string[].", memory: [label("prices", "number[]"), label("labels", "string[]")] },
          { line: 3, say: "labels[0] نص، والنص ليس فيه toFixed. خط أحمر.", memory: [label("prices", "number[]"), label("labels", "string[]")], error: "Property 'toFixed' does not exist on type 'string'." },
        ],
      ),
    },
  ],
  code: {
    intro: "أشكال التوقيع التي ستراها في كل مشروع: معامل اختياري بـ ?، وقيمة افتراضية، ومعاملات باقية ...nums، و void لدالة لا ترجع شيئاً مفيداً، ونوع دالة يُمرَّر لدالة أخرى.",
    runnerLang: "ts",
    runnerStarter: `function greet(name: string, title?: string): string {
  return title === undefined ? "Hi " + name : "Hi " + title + " " + name;
}
function sum(...nums: number[]): number {
  let total = 0;
  for (const n of nums) total += n;
  return total;
}
function logLine(message: string): void {
  console.log("> " + message);
}
type Formatter = (n: number) => string;
const sar: Formatter = (n) => n.toFixed(2) + " SAR";
logLine(greet("Sara"));
logLine(greet("Omar", "Dr"));
logLine(sar(sum(10, 2.5, 7)));
// try: write a Formatter called percent that prints 0.15 as "15%"
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "دالة تُمرَّر لدالة",
      prompt: "رتّب الأسطر: نوع القاعدة، ثم قاعدة نصف السعر، ثم الدالة التي تطبّقها. الناتج: 20",
      lines: ["type Rule = (price: number) => number;", "const half: Rule = (p) => p / 2;", "function apply(price: number, rule: Rule): number {", "  return rule(price);", "}", "console.log(apply(40, half));"],
      expected: "20",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "القيمة الافتراضية",
      prompt: "نريد أن تكون النسبة 0.15 حين لا يمرّرها أحد، فيُطبع 30. ماذا نكتب بعد rate؟",
      template: `function fee(amount: number, rate___): number {
  return amount * rate;
}
console.log(fee(200));`,
      options: [" = 0.15", "?: number", ": number"],
      expected: "30",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "الطريق بلا return",
      prompt: "الشحن مجاني من 200 فأكثر، وإلا فهو 25. الدالة ترجع undefined للطلبات الصغيرة، و tsc كان سيقول: Function lacks ending return statement. أصلحها لتطبع 0 ثم 25.",
      code: `function shipping(total: number): number {
  if (total >= 200) {
    return 0;
  }
}
console.log(shipping(250));
console.log(shipping(80));`,
      expected: "0\n25",
      hint: "أضف return 25; بعد الـ if، قبل القوس الأخير.",
      solution: `function shipping(total: number): number {
  if (total >= 200) {
    return 0;
  }
  return 25;
}
console.log(shipping(250));
console.log(shipping(80));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "مجموع بقاعدة اختيارية",
      prompt: "اكتب total(prices: number[], rule?: (p: number) => number): number تجمع الأسعار، ثم تطبّق rule على المجموع إن مُرّرت. اطبع total([10, 20]) ثم total([10, 20], (p) => p * 2): 30 ثم 60",
      starter: "// write total here, then print the two calls\n",
      expected: "30\n60",
      hint: "اجمع بحلقة for...of، ثم: if (rule) { return rule(sum); } return sum;",
      solution: `function total(prices: number[], rule?: (p: number) => number): number {
  let sum = 0;
  for (const p of prices) {
    sum += p;
  }
  if (rule) {
    return rule(sum);
  }
  return sum;
}
console.log(total([10, 20]));
console.log(total([10, 20], (p) => p * 2));`,
    },
  ],
  quiz: [
    {
      question: "لم نكتب نوع الإرجاع. ماذا يستنتج المدقّق؟",
      code: "function half(n: number) {\n  return n / 2;\n}",
      options: ["يرجع number", "يرجع any", "خطأ: نوع الإرجاع إلزامي"],
      answer: 0,
      why: "n رقم، ورقم / رقم = رقم، فيستنتج المدقّق نوع الإرجاع من الـ return. كتابته صراحة اختيارية، وتفيد حين تريد أن يمسك المدقّق خطأ داخل الدالة بدل أن يقبل ما ترجعه.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: 'function logLine(m: string): void {\n  console.log(m);\n}\nconst r = logLine("hi");\nconsole.log(r);',
      options: ["hi ثم undefined", "hi فقط", "خطأ: لا يُخزَّن void في متغير"],
      answer: 0,
      why: "void تعني للمدقّق: لا تعتمد على ما ترجعه هذه الدالة. وعند التشغيل، كل دالة بلا return ترجع undefined، فيُطبع hi ثم undefined.",
    },
    {
      question: "أي استدعاء يرفضه tsc؟",
      code: 'function greet(name: string, title?: string): string {\n  return name;\n}\ngreet("Sara");        // 1\ngreet("Sara", "Dr");  // 2\ngreet();              // 3',
      options: ["3", "1", "2"],
      answer: 0,
      why: "title عليه ؟ فهو اختياري، و name إلزامي. الاستدعاء 3 بلا أي وسيط: Expected 1-2 arguments, but got 0.",
    },
    {
      question: "ماذا يقول tsc عن السطر 2؟",
      code: 'type Rule = (p: number) => number;\nconst free: Rule = (p) => "free";',
      options: ["Type 'string' is not assignable to type 'number'", "لا خطأ: p رقم", "Parameter 'p' implicitly has an 'any' type"],
      answer: 0,
      why: "Rule وعد بأن الدالة ترجع رقماً، وهذه ترجع نصاً. و p ليس any ضمنياً: نوعه جاء من Rule.",
    },
    {
      question: "ماذا يطبع هذا الكود؟",
      code: "function pick(x: number | null = 5): number | null {\n  return x;\n}\nconsole.log(pick(undefined), pick(null));",
      options: ["5 null", "5 5", "undefined null"],
      answer: 0,
      why: "القيمة الافتراضية تُستعمل حين يصل undefined فقط (أو حين يغيب الوسيط). null قيمة حقيقية مرّرتها بنفسك، فتبقى null.",
    },
  ],
  next: "ts-arrays",
};
