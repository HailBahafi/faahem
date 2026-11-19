import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });

export const bits: Lesson = {
  slug: "bits",
  stage: 0,
  number: "0.1",
  title: "البت والبايت",
  subtitle: "كيف يحفظ جهاز من مفاتيح فقط رقماً وحرفاً وصورة؟",
  minutes: 12,
  problem: {
    title: "ثمانية مفاتيح فقط",
    body: "الحاسوب لا يرى أرقاماً ولا حروفاً، يرى مفاتيح: مضاء أو مطفأ. اضغط المفاتيح وحاول أن تصنع الرقم المطلوب.",
    demo: "bits",
  },
  scene: {
    code: {
      js: `let n = 13;
console.log(n.toString(2));
let bits = "1101";
console.log(parseInt(bits, 2));
let code = "A".charCodeAt(0);
console.log(code);
console.log(String.fromCharCode(66));`,
      ts: `let n: number = 13;
console.log(n.toString(2));
let bits: string = "1101";
console.log(parseInt(bits, 2));
let code: number = "A".charCodeAt(0);
console.log(code);
console.log(String.fromCharCode(66));`,
      py: `n = 13
print(format(n, "b"))
bits = "1101"
print(int(bits, 2))
code = ord("A")
print(code)
print(chr(66))`,
      go: `n := 13
fmt.Printf("%b\\n", n)
bits := "1101"
v, _ := strconv.ParseInt(bits, 2, 64); fmt.Println(v)
code := int('A')
fmt.Println(code)
fmt.Println(string(rune(66)))`,
      dart: `int n = 13;
print(n.toRadixString(2));
String bits = "1101";
print(int.parse(bits, radix: 2));
int code = "A".codeUnitAt(0);
print(code);
print(String.fromCharCode(66));`,
      rust: `let n = 13;
println!("{:b}", n);
let bits = "1101";
println!("{}", i32::from_str_radix(bits, 2).unwrap());
let code = 'A' as u32;
println!("{}", code);
println!("{}", 66u8 as char);`,
    },
    notes: {
      js: "toString(2) تكتب الرقم بالثنائي، و parseInt(..., 2) تقرأ نصاً ثنائياً وتعيده رقماً عادياً.",
      ts: "مثل JavaScript تماماً، مع ذكر النوع: number للرقم و string للنص.",
      py: "format(n, \"b\") تكتب الرقم بالثنائي، و ord و chr تحوّلان بين الحرف ورقمه المتّفق عليه.",
      go: "%b في Printf تعني: اطبع بالثنائي. و 'A' بعلامة تنصيص مفردة هي حرف واحد، أي رقمه 65.",
      dart: "toRadixString(2) تكتب بالثنائي، و codeUnitAt(0) تعطي رقم أول حرف.",
      rust: "{:b} تعني: اطبع بالثنائي. و as u32 تكشف الرقم المخفي خلف الحرف 'A'.",
    },
    steps: [
      { line: null, say: "هذا أول كود تراه. الكود أوامر تُقرأ من الأعلى إلى الأسفل، سطراً بعد سطر. وتحت كل درج في الذاكرة لا يوجد إلا مفاتيح: 1 مضاء و 0 مطفأ.", memory: [] },
      { line: 1, say: "let n = 13 تعني: احجز درجاً، سمّه n، وضع فيه 13. في الداخل لا يُحفظ \"13\"، بل ثمانية مفاتيح: 00001101.", memory: [n("n", 13)], changed: ["n"] },
      { line: 2, say: "console.log تعني: اطبع على الشاشة. و n.toString(2) تعني: اكتب n بنظام الرقمين. المفاتيح المضاءة قيمها 8 و 4 و 1، و 8 + 4 + 1 = 13.", memory: [n("n", 13)], read: ["n"], output: ["1101"] },
      { line: 3, say: "درج جديد اسمه bits فيه النص \"1101\". علامتا التنصيص تعنيان أنه مجرد رموز مكتوبة، وليس رقماً بعد.", memory: [n("n", 13), s("bits", "1101")], changed: ["bits"] },
      { line: 4, say: "parseInt(bits, 2) تقرأ الرموز كأرقام ثنائية: من اليمين قيم المواقع 1 و 2 و 4 و 8، كل موقع ضعف الذي على يمينه. 8 + 4 + 0 + 1 = 13.", memory: [n("n", 13), s("bits", "1101")], read: ["bits"], output: ["1101", "13"] },
      { line: 5, say: "والحروف؟ اتفق الناس أن لكل حرف رقماً. charCodeAt(0) تسأل: ما رقم الحرف A؟ الجواب 65، فيُحفظ في درج code.", memory: [n("n", 13), s("bits", "1101"), n("code", 65)], changed: ["code"] },
      { line: 6, say: "نطبع ما في درج code: 65. الحرف A في الذاكرة ليس إلا المفاتيح 01000001.", memory: [n("n", 13), s("bits", "1101"), n("code", 65)], read: ["code"], output: ["1101", "13", "65"] },
      { line: 7, say: "والعكس: String.fromCharCode(66) تقول: اعرض الرقم 66 كحرف. فيظهر B، الحرف الذي بعد A.", memory: [n("n", 13), s("bits", "1101"), n("code", 65)], output: ["1101", "13", "65", "B"] },
      { line: 7, say: "الخلاصة: المفاتيح نفسها قد تكون رقماً أو حرفاً أو لون نقطة في صورة. البرنامج هو من يقرّر كيف يقرأها.", memory: [n("n", 13), s("bits", "1101"), n("code", 65)], output: ["1101", "13", "65", "B"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذه أربعة مفاتيح، وكل سطر يحفظ حالة مفتاح: 1 مضاء و 0 مطفأ. البرنامج يضرب كل مفتاح في قيمة موقعه ثم يجمع. غيّر المفاتيح وشاهد الناتج.",
    starter: `let s8 = 1;
let s4 = 1;
let s2 = 0;
let s1 = 1;
let value = s8 * 8 + s4 * 4 + s2 * 2 + s1 * 1;
console.log(value);`,
    challenges: [
      "قبل أن تضغط: ماذا سيطبع البرنامج كما هو؟ ثم شغّله وتأكّد.",
      "اجعل البرنامج يطبع 6. أي مفاتيح تضيء؟",
      "أضئ كل المفاتيح الأربعة. ما أكبر رقم تصنعه أربعة مفاتيح؟",
      "أطفئ كلها. هل الصفر نمط أيضاً؟ كم نمطاً تصنع أربعة مفاتيح إذن؟",
    ],
  },
  predict: [
    {
      question: "المفاتيح 1010 (القيم من اليسار 8 و 4 و 2 و 1). ماذا يطبع البرنامج؟",
      code: `let value = 8 * 1 + 4 * 0 + 2 * 1 + 1 * 0;
console.log(value);`,
      options: ["1010", "10", "4"],
      answer: 1,
      why: "1010 ليس ألفاً وعشرة. المضاء هو مفتاح الـ 8 ومفتاح الـ 2، و 8 + 2 = 10.",
    },
    {
      question: "مفتاح واحد له نمطان (0 و 1). كل مفتاح نضيفه يضاعف عدد الأنماط. كم نمطاً لثلاثة مفاتيح؟",
      code: `let one = 2;
let two = one * 2;
let three = two * 2;
console.log(three);`,
      options: ["3", "6", "8"],
      answer: 2,
      why: "المفتاح الجديد يمكن أن يكون مطفأ أو مضاء مع كل نمط سابق، فيتضاعف العدد: 2 ثم 4 ثم 8. ولهذا البايت (8 مفاتيح) له 256 نمطاً.",
    },
    {
      question: "بايت كل مفاتيحه الثمانية مضاءة. ما الرقم الذي يمثّله؟",
      code: `let max = 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1;
console.log(max);`,
      options: ["256", "255", "8"],
      answer: 1,
      why: "البايت له 256 نمطاً، لكن العدّ يبدأ من الصفر (كل المفاتيح مطفأة). فالأنماط من 0 إلى 255.",
    },
  ],
  code: {
    intro: "الفكرة واحدة في كل اللغات: الرقم والحرف مفاتيح في الذاكرة، واللغة تعطيك طريقة لرؤيتها بالثنائي. بدّل اللغة فوق، ثم عدّل الكود بالأسفل وشغّله.",
    runnerStarter: `let n = 13;
console.log(n.toString(2));
console.log(parseInt("1101", 2));
console.log("A".charCodeAt(0));
console.log(String.fromCharCode(66));
// Try: change 13 to 255, then to 256, and count the digits
`,
  },
  exercises: [
    {
      kind: "order",
      title: "المفتاحان",
      prompt: "المفاتيح 0101: المضاء مفتاح الـ 4 ومفتاح الـ 1. رتّب الأسطر حتى يطبع البرنامج 5.",
      lines: ["let s4 = 1;", "let s1 = 1;", "let value = s4 * 4 + s1 * 1;", "console.log(value);"],
      expected: "5",
    },
    {
      kind: "fill",
      title: "كل المفاتيح",
      prompt: "أربعة مفاتيح كلها مضاءة (1111). أي رقم يكمل السطر حتى يطبع 15؟",
      template: "let value = 8 * 1 + 4 * 1 + 2 * 1 + 1 * ___;\nconsole.log(value);",
      options: ["0", "1", "2"],
      expected: "15",
    },
    {
      kind: "fix",
      title: "الستة",
      prompt: "المفاتيح 110 (القيم 4 و 2 و 1) يجب أن تعطي 6، لكن البرنامج يطبع 3. أصلح حالة المفاتيح.",
      code: "let value = 4 * 0 + 2 * 1 + 1 * 1;\nconsole.log(value);",
      expected: "6",
      hint: "في 110 المضاء هما المفتاحان على اليسار: الـ 4 والـ 2. أما مفتاح الـ 1 فمطفأ.",
      solution: "let value = 4 * 1 + 2 * 1 + 1 * 0;\nconsole.log(value);",
    },
    {
      kind: "write",
      title: "الحرف C",
      prompt: "رقم الحرف A هو 65، والحروف بعده متتالية: B هو 66. اكتب برنامجاً يحفظ 65 في درج اسمه a، ثم يحسب رقم الحرف C ويطبعه (يجب أن يظهر 67).",
      starter: "// write your code here\n",
      expected: "67",
      hint: "C بعد A بحرفين: let a = 65;  ثم let c = a + 2;  ثم console.log(c);",
      solution: "let a = 65;\nlet c = a + 2;\nconsole.log(c);",
    },
  ],
  quiz: [
    { question: "المفاتيح 0011. ماذا يطبع البرنامج؟", code: "let value = 8 * 0 + 4 * 0 + 2 * 1 + 1 * 1;\nconsole.log(value);", options: ["11", "3", "2"], answer: 1, why: "المضاء مفتاح الـ 2 ومفتاح الـ 1 فقط، و 2 + 1 = 3. الثنائي يُقرأ بقيم المواقع، لا كأنه رقم عادي." },
    { question: "كم نمطاً مختلفاً يستطيع بايت واحد (8 مفاتيح) أن يعرضه؟", options: ["8", "16", "256", "255"], answer: 2, why: "كل مفتاح يضاعف عدد الأنماط: 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 256، من 0 إلى 255." },
    { question: "رقم A هو 65. أي حرف يمثّله ما يطبعه هذا البرنامج؟", code: "let code = 65;\nconsole.log(code + 1);", options: ["A", "B", "لا يمكن أن يكون حرفاً"], answer: 1, why: "البرنامج يطبع 66. لو قرأنا المفاتيح نفسها كحرف لظهر B، لأن الحروف أرقام متّفق عليها ومتتالية." },
    { question: "في درج من الذاكرة المفاتيح 01000001. ماذا يعني هذا؟", options: ["الرقم 65 دائماً", "الحرف A دائماً", "حسب البرنامج: يقرؤه رقماً 65 أو حرفاً A"], answer: 2, why: "الذاكرة لا تعرف المعنى، فيها مفاتيح فقط. البرنامج هو من يقرّر: رقم أو حرف أو لون." },
    { question: "أضفنا مفتاحاً تاسعاً على يسار مفتاح الـ 128. ما قيمته؟", options: ["9", "129", "256"], answer: 2, why: "كل موقع ضعف الذي على يمينه: 128 × 2 = 256." },
  ],
  next: "ram",
};
