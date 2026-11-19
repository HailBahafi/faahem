import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const b = (name: string, value: boolean): Cell => ({ name, value: String(value), type: "boolean" });
const none = (name: string, value: "undefined" | "null"): Cell => ({ name, value, type: "none" });

const m1 = [s("age", "20")];
const m2 = [...m1, s("glued", "201")];
const m3 = [...m2, n("years", 20)];
const m4 = [...m3, n("fixed", 21)];
const m5 = [...m4, b("ok", true)];
const m6 = [...m5, none("nick", "undefined")];

export const types: Lesson = {
  slug: "types",
  stage: 1,
  number: "1.2",
  title: "أنواع البيانات",
  subtitle: "لماذا يصبح 20 + 1 أحياناً 201؟",
  minutes: 15,
  problem: {
    title: "النموذج الذي لا يعرف الحساب",
    body: "نموذج يسألك عن عمرك ويخبرك كم سيكون عمرك بعد سنة. اكتب عمرك وانظر إلى الجواب، ثم شغّل التحويل.",
    demo: "types",
  },
  scene: {
    code: {
      js: `let age = "20";
let glued = age + 1;
let years = Number(age);
let fixed = years + 1;
let ok = fixed > 18;
let nick;
console.log(typeof age, typeof years, typeof ok, typeof nick);
console.log(glued, fixed);`,
      ts: `let age: string = "20";
let glued: string = age + 1;
let years: number = Number(age);
let fixed: number = years + 1;
let ok: boolean = fixed > 18;
let nick: string | undefined;
console.log(typeof age, typeof years, typeof ok, typeof nick);
console.log(glued, fixed);`,
      py: `age = "20"
glued = age + str(1)
years = int(age)
fixed = years + 1
ok = fixed > 18
nick = None
print(type(age), type(years), type(ok), type(nick))
print(glued, fixed)`,
      go: `age := "20"
glued := age + "1"
years, _ := strconv.Atoi(age)
fixed := years + 1
ok := fixed > 18
var nick *string
fmt.Printf("%T %T %T %T\\n", age, years, ok, nick)
fmt.Println(glued, fixed)`,
      dart: `String age = "20";
String glued = age + 1.toString();
int years = int.parse(age);
int fixed = years + 1;
bool ok = fixed > 18;
String? nick;
print('\${age.runtimeType} \${years.runtimeType} \${ok.runtimeType} \${nick.runtimeType}');
print('$glued $fixed');`,
      rust: `let age = "20";
let glued = format!("{}{}", age, 1);
let years: i32 = age.parse().unwrap();
let fixed = years + 1;
let ok = fixed > 18;
let nick: Option<&str> = None;
println!("{} {} {} {}", type_name_of_val(&age), type_name_of_val(&years), type_name_of_val(&ok), type_name_of_val(&nick));
println!("{} {}", glued, fixed);`,
    },
    notes: {
      js: "JavaScript تحاول أن تساعدك: إذا جمعت نصاً مع رقم حوّلت الرقم إلى نص بصمت وألصقتهما. لهذا يجب أن تحوّل بنفسك بـ Number().",
      ts: "TypeScript تكتب النوع بجانب الاسم، فتعرف قبل التشغيل أن age نص وأن age + 1 سيعطي نصاً لا رقماً.",
      py: "بايثون ترفض \"20\" + 1 وتتوقف بخطأ TypeError، لذلك تكتب str(1) للإلصاق أو int(age) للجمع. والفراغ فيها اسمه None.",
      go: "Go لا تقبل جمع نص مع رقم أبداً. التحويل يتم بـ strconv.Atoi، والفراغ قيمة اسمها nil.",
      dart: "Dart ترفض جمع String مع int، فتكتب ‎.toString()‎ أو int.parse()‎. علامة ? بعد النوع تعني: قد يكون فارغاً (null).",
      rust: "Rust لا تحوّل شيئاً بصمت: parse() للتحويل إلى رقم، و None داخل Option بدل الفراغ.",
    },
    steps: [
      { line: null, say: "في الدرس السابق وضعنا قيماً في أدراج. اليوم ننظر إلى القيمة نفسها: لكل قيمة نوع، والنوع يقرّر ماذا تعني العمليات عليها.", memory: [] },
      { line: 1, say: "درج age فيه \"20\" بين علامتي تنصيص: هذا نص (string)، وليس رقماً. هكذا تصل كل قيمة يكتبها المستخدم في نموذج.", memory: m1, changed: ["age"] },
      { line: 2, say: "الجهاز يقرأ age فيجد نصاً. علامة + مع النص لا تعني الجمع، بل الإلصاق: يُلصق 1 في آخر النص.", memory: m1, read: ["age"] },
      { line: 2, say: "الناتج \"201\": نص جديد في درج glued. لم يحدث أي حساب، فقط حرف بعد حرف.", memory: m2, changed: ["glued"] },
      { line: 3, say: "Number() تأخذ النص \"20\" وتصنع منه رقماً حقيقياً 20. لاحظ اختفاء علامتي التنصيص وتغيّر اللون: النوع تغيّر.", memory: m3, changed: ["years"], read: ["age"] },
      { line: 4, say: "الآن الطرفان رقمان، فعلامة + نفسها تعني الجمع: 20 + 1 = 21. نفس الرمز، معنى مختلف، والنوع هو من يقرّر.", memory: m4, changed: ["fixed"], read: ["years"] },
      { line: 5, say: "هل 21 أكبر من 18؟ نعم. الجواب ليس رقماً ولا نصاً، بل نوع ثالث (boolean) له قيمتان فقط: true أو false.", memory: m5, changed: ["ok"], read: ["fixed"] },
      { line: 6, say: "درج nick بلا قيمة. JavaScript تضع فيه undefined: «لم يُعطَ شيئاً بعد». وهناك null: «فارغ عمداً». كلاهما يعني لا قيمة.", memory: m6, changed: ["nick"] },
      { line: 7, say: "typeof تسأل القيمة عن نوعها. الأدراج الأربعة تجيب: string و number و boolean و undefined.", memory: m6, read: ["age", "years", "ok", "nick"], output: ["string number boolean undefined"] },
      { line: 8, say: "النتيجة: 201 من النص، و 21 من الرقم. القيمتان بدأتا من نفس \"20\"، والفرق كله في النوع.", memory: m6, read: ["glued", "fixed"], output: ["string number boolean undefined", "201 21"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "عدّل البرنامج وشغّله، وراقب لون كل درج: النص برتقالي والرقم بلون آخر. قبل كل تشغيل، توقّع ما سيُطبع.",
    starter: `let price = "50";
let extra = 10;
let total = price + extra;
console.log(total, typeof total);`,
    challenges: [
      "شغّل البرنامج كما هو. لماذا ظهر 5010 وليس 60؟",
      "غيّر السطر الثالث إلى Number(price) + extra وتوقّع الناتج قبل أن تضغط.",
      "احذف علامتي التنصيص من \"50\" في السطر الأول. هل ما زلت تحتاج Number؟",
      "جرّب String(extra) + String(extra). ماذا تتوقع؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع البرنامج؟",
      code: `let a = "5";
let b = a + 1;
console.log(b);`,
      options: ["6", "51", "خطأ"],
      answer: 1,
      why: "a نص لأنه بين علامتي تنصيص. + مع النص تعني الإلصاق، فيُلصق 1 بعد \"5\" ويصبح \"51\".",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: `let code = "42";
console.log(typeof code);`,
      options: ["number", "string", "42"],
      answer: 1,
      why: "النص الذي يشبه رقماً يبقى نصاً. علامتا التنصيص هما ما يحدد النوع، لا شكل الحروف.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: `let city;
console.log(city);`,
      options: ["0", "\"\" (نص فارغ)", "undefined", "خطأ"],
      answer: 2,
      why: "الدرج أُنشئ ولم يُعطَ قيمة، فيحمل undefined. ليس صفراً ولا نصاً فارغاً: صفر رقم، والنص الفارغ نص، أما undefined فلا قيمة أصلاً.",
    },
  ],
  code: {
    intro: "كل اللغات تفرّق بين الرقم والنص، لكن بعضها يرفض الخلط بينهما بخطأ (Python و Go و Rust)، وJavaScript تخلطهما بصمت. بدّل اللغة فوق لترى الفرق، ثم جرّب هنا.",
    runnerStarter: `let input = "20";
let wrong = input + 1;
let right = Number(input) + 1;

console.log("wrong =", wrong, typeof wrong);
console.log("right =", right, typeof right);
// جرّب: اكتب String(right) + 1 واطبعه. ماذا تتوقع؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "نقاط إضافية",
      prompt: "النقاط وصلت نصاً \"15\". رتّب الأسطر حتى تُحوَّل إلى رقم ثم تُضاف إليها 5 ويُطبع 20.",
      lines: ['let input = "15";', "let points = Number(input);", "let total = points + 5;", "console.log(total);"],
      expected: "20",
    },
    {
      kind: "fill",
      title: "السعر مع التوصيل",
      prompt: "السعر وصل من نموذج كنص. أي كلمة تجعل البرنامج يطبع 40؟",
      template: 'let price = "30";\nlet total = ___(price) + 10;\nconsole.log(total);',
      options: ["Number", "String"],
      expected: "40",
    },
    {
      kind: "fix",
      title: "مجموع الدرجات",
      prompt: "البرنامج يطبع 46 بدل 10. أصلحه حتى يجمع الدرجتين.",
      code: 'let a = "4";\nlet b = "6";\nconsole.log(a + b);',
      expected: "10",
      hint: "الدرجتان نصان، فـ + تلصقهما. حوّل كل واحدة إلى رقم قبل الجمع.",
      solution: 'let a = "4";\nlet b = "6";\nconsole.log(Number(a) + Number(b));',
    },
    {
      kind: "write",
      title: "العمر بعد سنة",
      prompt: 'أنشئ متغيراً age قيمته النص "19". حوّله إلى رقم وأضف 1، ثم اطبع الناتج، ثم اطبع نوعه بـ typeof (يجب أن يظهر 20 ثم number).',
      starter: "// اكتب الكود هنا\n",
      expected: "20\nnumber",
      hint: 'let age = "19";  ثم let next = Number(age) + 1;  ثم console.log(next);  و console.log(typeof next);',
      solution: `let age = "19";
let next = Number(age) + 1;
console.log(next);
console.log(typeof next);`,
    },
  ],
  quiz: [
    { question: "ماذا يطبع البرنامج؟", code: 'console.log(5 + 1, "5" + 1);', options: ["6 6", "6 51", "51 51", "51 6"], answer: 1, why: "الأول رقمان فـ + تجمع: 6. الثاني فيه نص فـ + تلصق: \"51\". نفس الرمز، والنوع يقرّر المعنى." },
    { question: "ماذا يطبع البرنامج؟", code: "let done = 3 > 2;\nconsole.log(typeof done);", options: ["number", "boolean", "true", "string"], answer: 1, why: "3 > 2 سؤال جوابه true، و true من نوع boolean. typeof تسأل عن النوع لا عن القيمة." },
    { question: "ماذا يطبع البرنامج؟", code: "let s = String(7);\nconsole.log(s + 3);", options: ["10", "73", "خطأ"], answer: 1, why: "String(7) حوّلت الرقم إلى النص \"7\". النص + 3 إلصاق، فيصبح \"73\"." },
    { question: "ماذا يطبع البرنامج؟", code: "let v;\nconsole.log(typeof v);", options: ["undefined", "null", "string", "خطأ"], answer: 0, why: "v لم يُعطَ قيمة، فيحمل undefined، ونوعه أيضاً undefined." },
    { question: "ماذا يطبع البرنامج؟", code: 'let price = "50";\nlet n = Number(price);\nconsole.log(n + n, price + price);', options: ["100 100", "5050 5050", "100 5050", "5050 100"], answer: 2, why: "n رقم فـ n + n = 100. أما price فما زال نصاً (التحويل صنع قيمة جديدة في n ولم يغيّر price)، فـ price + price = \"5050\"." },
  ],
  next: "operators",
};
