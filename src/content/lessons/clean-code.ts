import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number, constant?: boolean): Cell => ({ name, value: String(value), type: "number", constant });
const FREE = n("FREE_SHIPPING_FROM", 100, true);
const FEE = n("SHIPPING_FEE", 15, true);

export const cleanCode: Lesson = {
  slug: "clean-code",
  stage: 12,
  number: "12.2",
  title: "الكود النظيف",
  subtitle: "الكود يُقرأ أكثر بكثير مما يُكتب، فليشرح نفسه",
  minutes: 18,
  problem: {
    title: "دالة لا يفهمها أحد",
    body: "هذه دالة حقيقية تعمل، لكن فهمها يأخذ دقيقة ونصفاً. نظّفها بالتحسينات من القائمة. راقب الاختبارات: يجب أن تبقى خضراء، لأن التنظيف يغيّر الشكل لا السلوك.",
    demo: "cleanCode",
  },
  scene: {
    code: {
      js: `const FREE_SHIPPING_FROM = 100;
const SHIPPING_FEE = 15;
function shippingCost(cartTotal) {
  if (cartTotal >= FREE_SHIPPING_FROM) return 0;
  return SHIPPING_FEE;
}
let cartTotal = 80;
let cost = shippingCost(cartTotal);
console.log("shipping:", cost);`,
      ts: `const FREE_SHIPPING_FROM: number = 100;
const SHIPPING_FEE: number = 15;
function shippingCost(cartTotal: number): number {
  if (cartTotal >= FREE_SHIPPING_FROM) return 0;
  return SHIPPING_FEE;
}
let cartTotal: number = 80;
let cost: number = shippingCost(cartTotal);
console.log("shipping:", cost);`,
      py: `FREE_SHIPPING_FROM = 100
SHIPPING_FEE = 15
def shipping_cost(cart_total):
    if cart_total >= FREE_SHIPPING_FROM: return 0
    return SHIPPING_FEE

cart_total = 80
cost = shipping_cost(cart_total)
print("shipping:", cost)`,
      go: `const FreeShippingFrom = 100
const ShippingFee = 15
func shippingCost(cartTotal int) int {
	if cartTotal >= FreeShippingFrom { return 0 }
	return ShippingFee
}
cartTotal := 80
cost := shippingCost(cartTotal)
fmt.Println("shipping:", cost)`,
      dart: `const freeShippingFrom = 100;
const shippingFee = 15;
int shippingCost(int cartTotal) {
  if (cartTotal >= freeShippingFrom) return 0;
  return shippingFee;
}
int cartTotal = 80;
int cost = shippingCost(cartTotal);
print("shipping: $cost");`,
      rust: `const FREE_SHIPPING_FROM: i32 = 100;
const SHIPPING_FEE: i32 = 15;
fn shipping_cost(cart_total: i32) -> i32 {
    if cart_total >= FREE_SHIPPING_FROM { return 0; }
    SHIPPING_FEE
}
let cart_total = 80;
let cost = shipping_cost(cart_total);
println!("shipping: {}", cost);`,
    },
    notes: {
      js: "العرف في JavaScript: camelCase للمتغيرات والدوال، و UPPER_SNAKE_CASE للثوابت التي تمثّل قاعدة عمل.",
      ts: "مثل JavaScript، والأنواع جزء من الشرح: ‎(cartTotal: number): number تقول للقارئ ما يدخل وما يخرج دون أن يقرأ الجسم.",
      py: "بايثون تكتب snake_case للمتغيرات والدوال، والثوابت بحروف كبيرة. لا توجد const، فالحروف الكبيرة وعد بين المبرمجين ألا يغيّرها أحد.",
      go: "Go تكتب الأسماء بـ camelCase، والحرف الأول الكبير (FreeShippingFrom) يعني أن الاسم مرئي خارج الحزمة. والأداة gofmt توحّد شكل الكود كله تلقائياً.",
      dart: "Dart تكتب الثوابت بـ lowerCamelCase أيضاً (freeShippingFrom)، و dart format تنسّق الكود فلا يتجادل الفريق في المسافات.",
      rust: "Rust تكتب snake_case للدوال و UPPER_SNAKE_CASE للثوابت، ويحذّرك المترجم إن خالفت. وآخر سطر بلا فاصلة منقوطة هو ما يرجع، و cargo clippy يقترح تحسينات.",
    },
    steps: [
      { line: null, say: "النسخة القديمة كانت: function s(t) { if (t < 100) { return 15; } else { return 0; } }. تعمل، لكن ما s؟ ما t؟ ما 100 و 15؟ هذه النسخة تفعل الشيء نفسه وتشرح نفسها.", memory: [] },
      { line: 1, say: "الرقم 100 صار له اسم: الحد الذي يبدأ عنده الشحن المجاني. ثابت لا يتغير، ومكانه الوحيد هنا: لو تغيّرت القاعدة غداً تعدّل سطراً واحداً.", memory: [FREE], changed: ["FREE_SHIPPING_FROM"] },
      { line: 2, say: "والرقم 15 صار رسوم الشحن. لم يعد رقماً سحرياً يتساءل القارئ عن معناه.", memory: [FREE, FEE], changed: ["SHIPPING_FEE"] },
      { line: 3, say: "اسم الدالة يقول ما ترجعه: تكلفة الشحن. واسم المعامل يقول ما هو: مجموع السلة. تقرأ السطر فتعرف العقد دون أن تقرأ الجسم.", memory: [FREE, FEE] },
      { line: 7, say: "مجموع السلة 80.", memory: [FREE, FEE, n("cartTotal", 80)], changed: ["cartTotal"] },
      { line: 4, say: "شرط حارس: 80 >= 100 خاطئ، فلا نرجع 0 ونكمل إلى السطر التالي. الحالة الخاصة تخرج مبكراً في سطر واحد، بلا else وبلا تداخل.", memory: [FREE, FEE, n("cartTotal", 80)], read: ["cartTotal", "FREE_SHIPPING_FROM"] },
      { line: 5, say: "ما تبقى هو الطريق العادي: نرجع رسوم الشحن 15.", memory: [FREE, FEE, n("cartTotal", 80)], read: ["SHIPPING_FEE"] },
      { line: 8, say: "cost = 15. الاسم يقول ما القيمة، لا كيف حُسبت.", memory: [FREE, FEE, n("cartTotal", 80), n("cost", 15)], changed: ["cost"] },
      { line: 9, say: "يُطبع shipping: 15، وهو بالضبط ما كانت تطبعه النسخة القديمة. هذه إعادة الهيكلة: شكل جديد، سلوك واحد. والاختبارات هي ما يثبت أن السلوك لم يتغير.", memory: [FREE, FEE, n("cartTotal", 80), n("cost", 15)], read: ["cost"], output: ["shipping: 15"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "دالة تعمل وتطبع 145 ثم 0، لكنها لا تشرح نفسها. نظّفها خطوة خطوة، وبعد كل خطوة شغّل: يجب أن يبقى المطبوع 145 ثم 0 تماماً. هذا هو الاختبار الذي يحميك.",
    starter: `function c(a, b) {
  if (a > 0) {
    if (b > 0) {
      return a * b + 25;
    }
  }
  return 0;
}
console.log(c(3, 40));
console.log(c(0, 40));`,
    challenges: [
      "أعد التسمية: الدالة orderTotal والمعاملان quantity و unitPrice (في الاستدعاء أيضاً). شغّل: هل المطبوع كما هو؟",
      "الرقم 25 رسوم توصيل. ضعه في const DELIVERY_FEE = 25; فوق الدالة واستعمل الاسم.",
      "استبدل الشرطين المتداخلين بشرط حارس: if (quantity <= 0 || unitPrice <= 0) return 0; ثم return quantity * unitPrice + DELIVERY_FEE;",
      "اكسرها عمداً: اكتب quantity < 0 بدل <= 0. أي سطر مطبوع يتغير؟ هذا ما يحدث حين تعيد الهيكلة بلا اختبار.",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `// adds 10% tax
function withTax(price) {
  return price * 1.2;
}
console.log(withTax(100));`,
      options: ["110", "120", "خطأ"],
      answer: 1,
      why: "التعليق لا يعمل، الكود هو الذي يعمل. أحدهم غيّر الضريبة إلى 20% ونسي التعليق، فصار يكذب. التعليق الذي يكرر ما يفعله الكود يشيخ؛ الأفضل اسم وثابت: TAX_RATE = 0.2، وتعليق يشرح لماذا فقط.",
    },
    {
      question: "ماذا يُطبع؟",
      code: `function label(age) {
  if (age < 0) return "invalid";
  if (age < 18) return "minor";
  return "adult";
}
console.log(label(-4));
console.log(label(30));`,
      options: ["invalid ثم adult", "invalid ثم minor ثم adult", "minor ثم adult"],
      answer: 0,
      why: "return يخرج من الدالة فوراً، فلا يصل -4 إلى السطر الثاني أبداً. لهذا تُغني الشروط الحارسة عن else والتداخل: كل حالة خاصة تخرج في سطرها، وما يبقى في الأسفل هو الطريق العادي.",
    },
    {
      question: "قاعدة الشحن المجاني تغيّرت من 100 إلى 150. ماذا يُطبع لسلة مجموعها 120؟",
      code: `function cartPageFee(total) {
  if (total >= 100) return 0;
  return 15;
}
function checkoutFee(total) {
  if (total >= 150) return 0;
  return 15;
}
console.log(cartPageFee(120), checkoutFee(120));`,
      options: ["0 0", "15 15", "0 15"],
      answer: 2,
      why: "القاعدة منسوخة في مكانين، فعُدّلت في واحد ونُسيت في الآخر: صفحة السلة تعد العميل بشحن مجاني، والدفع يأخذ منه 15. لو كانت القاعدة ثابتاً واحداً FREE_SHIPPING_FROM ودالة واحدة، لكان التعديل سطراً واحداً ولا تناقض.",
    },
  ],
  code: {
    intro: "دالة فوضوية مع اختبارين يثبتان سلوكها. أعد هيكلتها (أسماء، ثابت، شرط حارس) وشغّل بعد كل خطوة: إن بقي الاختباران PASS فأنت غيّرت الشكل وحده.",
    runnerStarter: `function check(name, actual, expected) {
  console.log((actual === expected ? "PASS " : "FAIL ") + name);
}

function f(x) {
  let r = "";
  if (x != "") {
    if (x.length >= 3) {
      r = "@" + x.toLowerCase();
    } else {
      r = "";
    }
  }
  return r;
}

check("normal", f("SaraAli"), "@saraali");
check("too short", f("Al"), "");
check("empty", f(""), "");
// سمّها toHandle(name)، اجعل 3 ثابتاً MIN_NAME_LENGTH، واستعمل شرطاً حارساً
// ثم شغّل: هل ما زال الثلاثة PASS؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "شروط حارسة بالترتيب",
      prompt: "رتّب الأسطر: الثابت، ثم الدالة بشرطيها الحارسين، ثم الطريق العادي، ثم ثلاثة استدعاءات.",
      lines: [
        "const MIN_PASSWORD_LENGTH = 8;",
        "function passwordProblem(password) {",
        '  if (password.length < MIN_PASSWORD_LENGTH) return "too short";',
        '  if (password === password.toLowerCase()) return "needs a capital letter";',
        '  return "ok";',
        "}",
        'console.log(passwordProblem("abc"));',
        'console.log(passwordProblem("abcdefgh"));',
        'console.log(passwordProblem("Abcdefgh"));',
      ],
      expected: "too short\nneeds a capital letter\nok",
    },
    {
      kind: "fill",
      title: "الاسم يقول ما يجب أن يكون",
      prompt: "الثابت اسمه يشرح نفسه. اختر قيمته حتى تُطبع عدد ثواني ساعتين: 7200.",
      template: "const SECONDS_PER_HOUR = ___;\nlet hours = 2;\nconsole.log(hours * SECONDS_PER_HOUR);",
      options: ["60", "3600", "24"],
      expected: "7200",
    },
    {
      kind: "fix",
      lang: "py",
      title: "إعادة هيكلة غيّرت السلوك",
      prompt: "النسخة القديمة كانت متداخلة: إذا stock > 0 وليس محظوراً ترجع can buy، وإلا cannot buy. أحدهم حوّلها إلى شروط حارسة فأخطأ. أصلحها حتى تطبع ما كانت تطبعه القديمة: can buy ثم cannot buy مرتين.",
      code: `def can_buy(stock, is_banned):
    if stock > 0:
        return "cannot buy"
    if is_banned:
        return "cannot buy"
    return "can buy"

print(can_buy(5, False))
print(can_buy(0, False))
print(can_buy(5, True))`,
      expected: "can buy\ncannot buy\ncannot buy",
      hint: "الشرط الحارس يخرج في الحالة السيئة. الحالة السيئة هنا: المخزون صفر أو أقل، أي stock <= 0.",
      solution: `def can_buy(stock, is_banned):
    if stock <= 0:
        return "cannot buy"
    if is_banned:
        return "cannot buy"
    return "can buy"

print(can_buy(5, False))
print(can_buy(0, False))
print(can_buy(5, True))`,
    },
    {
      kind: "write",
      title: "أعد كتابتها نظيفة",
      prompt: "الدالة القديمة في التعليق تعمل لكنها غامضة. اكتب daysUntilExpiry(expiresAt, now) بثابت MS_PER_DAY = 86400000 وشرط حارس: إن انتهت الصلاحية (expiresAt <= now) ترجع 0، وإلا Math.ceil((expiresAt - now) / MS_PER_DAY). المطلوب: 3 ثم 0.",
      starter: `// القديمة:
// function d(x, y) { if (x > y) { return Math.ceil((x - y) / 86400000); } else { return 0; } }
// اكتب daysUntilExpiry هنا

console.log(daysUntilExpiry(3 * 86400000, 0));
console.log(daysUntilExpiry(2 * 86400000, 5 * 86400000));
`,
      expected: "3\n0",
      hint: "const MS_PER_DAY = 86400000; ثم function daysUntilExpiry(expiresAt, now) { if (expiresAt <= now) return 0; return Math.ceil((expiresAt - now) / MS_PER_DAY); }",
      solution: `const MS_PER_DAY = 86400000;
function daysUntilExpiry(expiresAt, now) {
  if (expiresAt <= now) return 0;
  return Math.ceil((expiresAt - now) / MS_PER_DAY);
}

console.log(daysUntilExpiry(3 * 86400000, 0));
console.log(daysUntilExpiry(2 * 86400000, 5 * 86400000));`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع؟",
      code: `function isEmpty(list) {
  return list.length > 0;
}
console.log(isEmpty([]));`,
      options: ["true", "false", "0"],
      answer: 1,
      why: "الطول 0، و 0 > 0 خاطئة، فيُطبع false: الدالة تقول إن القائمة الفارغة ليست فارغة. اسمها يكذب، فهي تفحص «هل فيها عناصر». الاسم الكاذب أسوأ من الغامض، لأن القارئ يصدّقه ولا يقرأ الجسم.",
    },
    {
      question: "استخرجنا جزءاً من الكود إلى دالة. ماذا تطبع النسخة الجديدة؟",
      code: `const VAT_RATE = 15;
function vatOf(amount) {
  return amount * VAT_RATE / 100;
}
let price = 200;
console.log(price + vatOf(price));`,
      options: ["200", "215", "230"],
      answer: 2,
      why: "vatOf(200) = 200 × 15 ÷ 100 = 30، والمجموع 230، كما كان السطر القديم price + price * 15 / 100. استخراج دالة يغيّر الشكل لا الحساب، ويعطي الحساب اسماً يُعاد استعماله في كل مكان.",
    },
    {
      question: "ماذا يُطبع؟",
      code: `function access(user) {
  if (!user) return "guest";
  if (!user.verified) return "pending";
  return "member";
}
console.log(access({ verified: false }));`,
      options: ["guest", "pending", "member"],
      answer: 1,
      why: "المستخدم موجود، فالحارس الأول لا يخرج. الحارس الثاني: !false صحيحة، فيرجع pending ويخرج. كل حارس سؤال واحد وجوابه في سطره، فتتبّع الحالة لا يحتاج عدّ الأقواس.",
    },
    {
      question: "ماذا يُطبع؟",
      code: `const STATUS = { PAID: 2, SHIPPED: 3 };
let order = { status: 3 };
if (order.status === STATUS.SHIPPED) {
  console.log("on the way");
} else {
  console.log("not yet");
}`,
      options: ["on the way", "not yet", "خطأ"],
      answer: 0,
      why: "STATUS.SHIPPED يساوي 3، والطلب حالته 3، فيُطبع on the way. لو كتبنا order.status === 3 لعمل الشيء نفسه، لكن القارئ يسأل: ما 3؟ الاسم يجيب دون أن يبحث في مكان آخر.",
    },
    {
      question: "أحدهم «نظّف» الدالة فغيّر > إلى >=. ماذا تطبع الاختبارات؟",
      code: `function check(name, actual, expected) {
  console.log((actual === expected ? "PASS " : "FAIL ") + name);
}
function bonus(orders) {
  return orders >= 10 ? 50 : 0;
}
check("12 orders", bonus(12), 50);
check("10 orders", bonus(10), 0);`,
      options: ["PASS 12 orders ثم PASS 10 orders", "PASS 12 orders ثم FAIL 10 orders", "FAIL 12 orders ثم PASS 10 orders"],
      answer: 1,
      why: "عند 12 لا فرق بين > و >=. لكن عند الحد 10 صارت المكافأة 50 والاختبار يتوقع 0، فيحمرّ. هذا تغيير في السلوك لا في الشكل، والاختبار التقطه قبل أن يصل إلى المستخدم. إعادة الهيكلة آمنة فقط حين تحرسها الاختبارات.",
    },
  ],
  next: "security",
};
