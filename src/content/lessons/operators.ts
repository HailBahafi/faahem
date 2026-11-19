import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const b = (name: string, value: boolean): Cell => ({ name, value: String(value), type: "boolean" });

export const operators: Lesson = {
  slug: "operators",
  stage: 1,
  number: "1.3",
  title: "العمليات والتعابير",
  subtitle: "كيف يتحوّل سطر مليء بالعلامات إلى قيمة واحدة؟",
  minutes: 15,
  problem: {
    title: "2 + 3 × 4 = ؟",
    body: "آلة حاسبة بسيطة. خمّن الناتج، ثم شاهد كيف يحسبه الجهاز.",
    demo: "operators",
  },
  scene: {
    code: {
      js: `let price = 10;
let qty = 3;
let total = price + qty * 2;
total += 4;
let isEven = total % 2 === 0;
let canBuy = total < 50 && isEven;
console.log(total, isEven, canBuy);`,
      ts: `let price: number = 10;
let qty: number = 3;
let total: number = price + qty * 2;
total += 4;
let isEven: boolean = total % 2 === 0;
let canBuy: boolean = total < 50 && isEven;
console.log(total, isEven, canBuy);`,
      py: `price = 10
qty = 3
total = price + qty * 2
total += 4
is_even = total % 2 == 0
can_buy = total < 50 and is_even
print(total, is_even, can_buy)`,
      go: `price := 10
qty := 3
total := price + qty*2
total += 4
isEven := total%2 == 0
canBuy := total < 50 && isEven
fmt.Println(total, isEven, canBuy)`,
      dart: `int price = 10;
int qty = 3;
int total = price + qty * 2;
total += 4;
bool isEven = total % 2 == 0;
bool canBuy = total < 50 && isEven;
print('$total $isEven $canBuy');`,
      rust: `let price = 10;
let qty = 3;
let mut total = price + qty * 2;
total += 4;
let is_even = total % 2 == 0;
let can_buy = total < 50 && is_even;
println!("{} {} {}", total, is_even, can_buy);`,
    },
    notes: {
      js: "JavaScript فيها == و ===. استخدم === دائماً: == تحوّل الأنواع قبل المقارنة، فتجعل 5 == \"5\" صحيحة.",
      ts: "TypeScript تعرف أن total < 50 ناتجها boolean، فتمنعك من وضعها في درج نوعه number.",
      py: "بايثون تكتب and و or و not بالكلمات بدل && و || و !، وتطبع True بحرف كبير. ولا يوجد فيها ++.",
      go: "Go لا تملك ===: المقارنة == صارمة أصلاً، ولا تقارن رقماً بنص أبداً. و ++ فيها جملة مستقلة لا تعبير.",
      dart: "Dart تستخدم == وهي صارمة: 5 == '5' خطأ (false) لأن النوعين مختلفان.",
      rust: "Rust ترفض حتى أن تقارن رقماً بنص؛ البرنامج لا يُترجم أصلاً. ولا يوجد فيها ++، استخدم += 1.",
    },
    steps: [
      { line: null, say: "التعبير هو أي شيء يُحسب ليعطي قيمة. سنرى كيف يُطوى سطر طويل قطعة قطعة حتى يصير قيمة واحدة.", memory: [] },
      { line: 1, say: "درج price فيه 10.", memory: [n("price", 10)], changed: ["price"] },
      { line: 2, say: "درج qty فيه 3.", memory: [n("price", 10), n("qty", 3)], changed: ["qty"] },
      { line: 3, say: "الطرف الأيمن: price + qty * 2. الضرب أعلى أولوية من الجمع، فيبدأ الجهاز بـ qty * 2: يقرأ 3 ويحسب 3 × 2 = 6. صار التعبير: price + 6.", memory: [n("price", 10), n("qty", 3)], read: ["qty"] },
      { line: 3, say: "بقيت قطعة واحدة: يقرأ price ويحسب 10 + 6 = 16. انطوى التعبير كله إلى قيمة واحدة: 16.", memory: [n("price", 10), n("qty", 3)], read: ["price"] },
      { line: 3, say: "الآن فقط يُنشأ درج total وتُكتب فيه 16. الدرج لا يحفظ المعادلة، يحفظ ناتجها فقط.", memory: [n("price", 10), n("qty", 3), n("total", 16)], changed: ["total"] },
      { line: 4, say: "total += 4 اختصار لـ total = total + 4: يقرأ 16، يحسب 16 + 4 = 20، ويكتب 20 فوقها.", memory: [n("price", 10), n("qty", 3), n("total", 20)], read: ["total"], changed: ["total"] },
      { line: 5, say: "% تعطي باقي القسمة. 20 % 2: عشرون تُقسم على اثنين بلا باقٍ، فالناتج 0. صار التعبير: 0 === 0.", memory: [n("price", 10), n("qty", 3), n("total", 20)], read: ["total"] },
      { line: 5, say: "المقارنة تعبير أيضاً، لكنها تنطوي إلى true أو false. 0 === 0 صحيحة، فيُكتب true في isEven.", memory: [n("price", 10), n("qty", 3), n("total", 20), b("isEven", true)], changed: ["isEven"] },
      { line: 6, say: "< أعلى أولوية من &&، فأولاً total < 50 ← 20 < 50 ← true. صار التعبير: true && isEven.", memory: [n("price", 10), n("qty", 3), n("total", 20), b("isEven", true)], read: ["total"] },
      { line: 6, say: "&& تعطي true فقط إذا كان الطرفان true. isEven هو true، إذن true && true ← true، ويُكتب في canBuy.", memory: [n("price", 10), n("qty", 3), n("total", 20), b("isEven", true), b("canBuy", true)], read: ["isEven"], changed: ["canBuy"] },
      { line: 7, say: "الطباعة تقرأ الأدراج: 20 و true و true. كل سطر قبلها كان تعبيراً انطوى إلى قيمة ثم حُفظ.", memory: [n("price", 10), n("qty", 3), n("total", 20), b("isEven", true), b("canBuy", true)], read: ["total", "isEven", "canBuy"], output: ["20 true true"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "صندوق تعبئة: 17 تفاحة، وكل علبة تأخذ 5. شغّل البرنامج وراقب كيف يُحسب كل سطر قبل أن يُكتب في درجه.",
    starter: `let apples = 17;
let perBox = 5;
let left = apples % perBox;
let boxes = (apples - left) / perBox;
let full = left === 0;
console.log(boxes, left, full);`,
    challenges: [
      "غيّر 17 إلى 20. توقّع قيمة left و full قبل أن تضغط.",
      "احذف الأقواس من السطر 4. لماذا تغيّر الناتج؟ أي قطعة حُسبت أولاً الآن؟",
      "أضف سطراً: apples += 3; قبل السطر 3، وتوقّع النتائج الجديدة.",
      "غيّر السطر 5 إلى: let full = left === 0 || boxes > 3; وجرّب بأرقام مختلفة.",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا السطر؟",
      code: `console.log(2 + 3 * 4);`,
      options: ["20", "14", "2 + 3 * 4"],
      answer: 1,
      why: "الضرب يُحسب أولاً: 3 * 4 = 12، ثم 2 + 12 = 14. الجهاز لا يقرأ من اليسار إلى اليمين، بل حسب الأولوية.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: `let x = 7;
console.log(x % 2);`,
      options: ["3.5", "1", "3"],
      answer: 1,
      why: "% لا تقسم، بل تعطي الباقي: 7 فيها 3 اثنينات (6) ويبقى 1. لذلك x % 2 تكون 1 لكل رقم فردي و 0 لكل زوجي.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: `let a = 5;
let b = "5";
console.log(a == b, a === b);`,
      options: ["true true", "true false", "false false"],
      answer: 1,
      why: "== تحوّل النص \"5\" إلى رقم قبل المقارنة فتقول true. === تقارن النوع أيضاً: رقم ونص مختلفان، فتقول false. لهذا نستخدم === دائماً.",
    },
  ],
  code: {
    intro: "العلامات تختلف قليلاً بين اللغات (and بدل && في بايثون مثلاً)، لكن الفكرة واحدة: التعبير يُطوى حسب الأولوية حتى يصير قيمة. بدّل اللغة فوق، ثم عدّل الكود بالأسفل وشغّله.",
    runnerStarter: `let price = 10;
let qty = 3;
let total = price + qty * 2;
total += 4;

console.log("total =", total);
console.log("even?", total % 2 === 0);
console.log("cheap?", total < 50 && total > 0);
// جرّب: ضع أقواساً حول price + qty وشغّل مرة أخرى
`,
  },
  exercises: [
    {
      kind: "order",
      title: "الفاتورة",
      prompt: "رتّب الأسطر: قطعتان بسعر 50، ثم أضف 10 للتوصيل، واطبع 110.",
      lines: ["let price = 50;", "let qty = 2;", "let total = price * qty;", "total += 10;", "console.log(total);"],
      expected: "110",
    },
    {
      kind: "fill",
      title: "الباقي",
      prompt: "نريد أن نعرف هل 9 فردي: البرنامج يجب أن يطبع 1. أي علامة تضع؟",
      template: "let n = 9;\nconsole.log(n ___ 2);",
      options: ["/", "%", "*"],
      expected: "1",
    },
    {
      kind: "fix",
      title: "الأقواس",
      prompt: "نريد جمع 2 و 3 أولاً ثم ضرب الناتج في 4، لكن البرنامج يطبع 14. أصلحه حتى يطبع 20.",
      code: "let result = 2 + 3 * 4;\nconsole.log(result);",
      expected: "20",
      hint: "الضرب يسبق الجمع. ما الذي يجبر الجهاز على حساب الجمع أولاً؟",
      solution: `let result = (2 + 3) * 4;
console.log(result);`,
    },
    {
      kind: "write",
      title: "العمر المناسب",
      prompt: "أنشئ متغيراً age قيمته 20، ثم اطبع هل العمر 18 أو أكثر وأقل من 60 معاً (يجب أن يظهر true).",
      starter: "// اكتب الكود هنا\n",
      expected: "true",
      hint: "سطران: let age = 20;  ثم console.log(age >= 18 && age < 60);",
      solution: `let age = 20;
console.log(age >= 18 && age < 60);`,
    },
  ],
  quiz: [
    { question: "ماذا يطبع البرنامج؟", code: "console.log(10 - 4 / 2);", options: ["3", "8", "6"], answer: 1, why: "القسمة أعلى أولوية من الطرح: 4 / 2 = 2 أولاً، ثم 10 - 2 = 8." },
    { question: "ماذا يطبع البرنامج؟", code: "console.log(15 % 4);", options: ["3", "3.75", "4"], answer: 0, why: "15 فيها 3 أربعات (12) ويبقى 3. علامة % تعطي هذا الباقي." },
    { question: "ما قيمة a في النهاية؟", code: "let a = 5;\na += 2;\na *= 3;", options: ["11", "21", "17"], answer: 1, why: "كل سطر يقرأ ثم يحسب ثم يكتب: 5 + 2 = 7، ثم 7 × 3 = 21." },
    { question: "ماذا يطبع البرنامج؟", code: "let x = 4;\nconsole.log(x > 2 && x < 3);", options: ["true", "false", "4"], answer: 1, why: "x > 2 تنطوي إلى true، و x < 3 تنطوي إلى false. && تحتاج الطرفين true، فالناتج false." },
    { question: "ماذا يطبع البرنامج؟", code: 'let n = 6;\nconsole.log(n % 2 === 0 || n > 100);', options: ["true", "false", "0"], answer: 0, why: "n % 2 تعطي 0، و 0 === 0 تنطوي إلى true. || يكفيها طرف واحد true، فالناتج true." },
  ],
  next: "if",
};
