import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number | string): Cell => ({ name, value: String(value), type: "number" });
const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });

export const testing: Lesson = {
  slug: "testing",
  stage: 12,
  number: "12.1",
  title: "الاختبارات",
  subtitle: "برنامج صغير يفحص برنامجك، فتغيّر الكود دون خوف",
  minutes: 20,
  problem: {
    title: "دالة فيها خطأ مخبّأ",
    body: "القاعدة: الشحن مجاني للطلبات من 100 فأكثر، وإلا فهو 15. الدالة تبدو سليمة. اكتب صفوفاً: مدخل والناتج الذي تتوقعه، وشغّلها. هل تجد المدخل الذي يفضح الخطأ؟",
    demo: "testing",
  },
  scene: {
    code: {
      js: `function average(nums) {
  let sum = 0;
  for (const n of nums) sum = sum + n;
  return sum / nums.length;
}
function check(name, actual, expected) {
  console.log((actual === expected ? "PASS " : "FAIL ") + name);
}
check("three numbers", average([2, 4, 6]), 4);
check("empty list", average([]), 0);`,
      ts: `function average(nums: number[]): number {
  let sum: number = 0;
  for (const n of nums) sum = sum + n;
  return sum / nums.length;
}
function check(name: string, actual: number, expected: number): void {
  console.log((actual === expected ? "PASS " : "FAIL ") + name);
}
check("three numbers", average([2, 4, 6]), 4);
check("empty list", average([]), 0);`,
      py: `def average(nums):
    total = 0
    for n in nums: total = total + n
    return total / len(nums)

def check(name, actual, expected):
    print(("PASS " if actual == expected else "FAIL ") + name)

check("three numbers", average([2, 4, 6]), 4)
check("empty list", average([]), 0)`,
      go: `func average(nums []float64) float64 {
	sum := 0.0
	for _, n := range nums { sum = sum + n }
	return sum / float64(len(nums))
}
func check(name string, actual, expected float64) {
	if actual == expected { fmt.Println("PASS " + name) } else { fmt.Println("FAIL " + name) }
}
check("three numbers", average([]float64{2, 4, 6}), 4)
check("empty list", average([]float64{}), 0)`,
      dart: `double average(List<double> nums) {
  double sum = 0;
  for (var n in nums) sum = sum + n;
  return sum / nums.length;
}
void check(String name, double actual, double expected) {
  print((actual == expected ? "PASS " : "FAIL ") + name);
}
check("three numbers", average([2, 4, 6]), 4);
check("empty list", average([]), 0);`,
      rust: `fn average(nums: &[f64]) -> f64 {
    let mut sum = 0.0;
    for n in nums { sum = sum + n; }
    return sum / nums.len() as f64;
}
fn check(name: &str, actual: f64, expected: f64) {
    println!("{}{}", if actual == expected { "PASS " } else { "FAIL " }, name);
}
check("three numbers", average(&[2.0, 4.0, 6.0]), 4.0);
check("empty list", average(&[]), 0.0);`,
    },
    notes: {
      js: "في مشروع حقيقي لا تكتب check بنفسك: Node فيه node:test و node:assert جاهزان، واختبارات هذا التطبيق نفسه مكتوبة بهما وتعمل بأمر واحد.",
      ts: "مثل JavaScript، وأشهر الأدوات vitest و jest: test(\"name\", () => expect(actual).toBe(expected)). الأنواع لا تغني عن الاختبار: average([]) نوعها صحيح وناتجها خاطئ.",
      py: "بايثون تقسم على صفر فترمي ZeroDivisionError بدل NaN، فيتوقف الاختبار الثاني بخطأ. أداة pytest تجمع كل دالة اسمها test_ وتفحص بـ assert عادية.",
      go: "الاختبارات في ملف ينتهي بـ _test.go، وكل دالة TestXxx(t *testing.T) تنادي t.Errorf عند الفشل. الأمر go test يشغّلها كلها.",
      dart: "حزمة test تعطيك test('name', () { expect(actual, expected); }) والأمر dart test. و 0 / 0 في Dart يعطي NaN كما في JavaScript.",
      rust: "تضع #[test] فوق دالة وتفحص بـ assert_eq!(actual, expected)، والأمر cargo test يجمعها ويشغّلها. 0.0 / 0.0 يعطي NaN هنا أيضاً.",
    },
    steps: [
      { line: null, say: "الاختبار برنامج صغير يشغّل كودك بمدخل معروف ويفحص الناتج. ثلاث خطوات دائماً: جهّز المدخل، شغّل الدالة، تأكّد من الناتج. هنا اختباران للدالة average.", memory: [] },
      { line: 9, say: "الاختبار الأول. التجهيز: المدخل [2, 4, 6]، ونحن نعرف بأيدينا أن المتوسط 4. التشغيل: نستدعي average.", memory: [s("name", "three numbers")], changed: ["name"] },
      { line: 3, say: "الحلقة تجمع الأعداد الثلاثة: sum صار 12.", memory: [n("sum", 12)], changed: ["sum"] },
      { line: 4, say: "12 ÷ 3 = 4. هذا هو الناتج الفعلي، ويرجع إلى الاختبار.", memory: [n("sum", 12)], read: ["sum"] },
      { line: 7, say: "التأكّد: actual = 4 و expected = 4. المقارنة 4 === 4 صحيحة، فيطبع PASS مع اسم الاختبار.", memory: [s("name", "three numbers"), n("actual", 4), n("expected", 4)], changed: ["actual", "expected"], read: ["actual", "expected"], output: ["PASS three numbers"] },
      { line: 10, say: "الاختبار الثاني حالة طرفية: قائمة فارغة. قررنا أن متوسط لا شيء هو 0. الحالات الطرفية (فارغ، صفر، سالب، كبير جداً) هي حيث تختبئ الأخطاء.", memory: [s("name", "empty list")], changed: ["name"], output: ["PASS three numbers"] },
      { line: 3, say: "الحلقة لا تدور ولا مرة: لا أعداد. sum يبقى 0.", memory: [n("sum", 0)], changed: ["sum"], output: ["PASS three numbers"] },
      { line: 4, say: "0 ÷ 0 ليس عدداً: الناتج NaN. الدالة لم تتعطل، بل أرجعت قيمة خاطئة بهدوء. هذا أخطر من التعطل.", memory: [n("sum", 0)], read: ["sum"], error: "0 / 0 = NaN", output: ["PASS three numbers"] },
      { line: 7, say: "التأكّد: NaN === 0 خاطئة، فيطبع FAIL واسم الاختبار. الاختبار الأحمر يسمّي الحالة التي انكسرت، فتعرف أين تبحث دون تخمين.", memory: [s("name", "empty list"), n("actual", "NaN"), n("expected", 0)], changed: ["actual", "expected"], read: ["actual", "expected"], output: ["PASS three numbers", "FAIL empty list"] },
      { line: 4, say: "الإصلاح سطر قبل القسمة: if (nums.length === 0) return 0. نشغّل الاختبارين من جديد فيصبحان أخضرين، ويبقى الاختبار الثاني حارساً: لو عاد الخطأ يوماً سيحمرّ فوراً.", memory: [], output: ["PASS three numbers", "FAIL empty list"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذا إطار اختبارات كامل في 13 سطراً: assertEqual ترمي خطأ عند الاختلاف، و test تلتقطه وتطبع الاسم. لا سحر في أي أداة اختبار حقيقية، هي هذه الفكرة نفسها. شغّل وراقب: أي اختبار يحمرّ؟",
    starter: `function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error("expected " + expected + ", got " + actual);
  }
}
function test(name, fn) {
  try {
    fn();
    console.log("PASS " + name);
  } catch (e) {
    console.log("FAIL " + name + ": " + e.message);
  }
}
function isOdd(n) {
  return n % 2 === 1;
}
test("7 is odd", () => assertEqual(isOdd(7), true));
test("4 is not odd", () => assertEqual(isOdd(4), false));
test("-3 is odd", () => assertEqual(isOdd(-3), true));`,
    challenges: [
      "قبل التشغيل: ما ناتج -3 % 2 في JavaScript؟ توقّع، ثم شغّل وانظر إلى رسالة الاختبار الأحمر.",
      "أصلح isOdd بـ n % 2 !== 0 وشغّل: هل صارت الثلاثة خضراء؟",
      "أضف اختباراً لحالة طرفية أخرى: الصفر. ما الذي تتوقعه isOdd(0)؟",
      "اكسر الدالة عمداً (اكتب return true;) وشغّل: كم اختباراً يحمرّ، وهل الأسماء تخبرك بما انكسر؟",
    ],
  },
  predict: [
    {
      question: "اختبار للدالة double. ماذا يُطبع، وأين الخطأ؟",
      code: `function double(n) {
  return n * 2;
}
let actual = double(5);
let expected = 25;
console.log(actual === expected ? "PASS" : "FAIL");`,
      options: ["PASS، لا خطأ", "FAIL، والخطأ في الدالة double", "FAIL، والخطأ في الاختبار نفسه"],
      answer: 2,
      why: "double(5) أرجعت 10، وهذا صحيح. لكن من كتب الاختبار توقّع 25 (خلط بين الضعف والتربيع). الاختبار الأحمر يقول: الواقع يخالف التوقع. أحياناً يكون التوقع هو الخاطئ، فاقرأ الاختبار قبل أن تغيّر الكود.",
    },
    {
      question: "الدالة add تطرح بدل أن تجمع. ماذا يطبع الاختبار؟",
      code: `function test(name, fn) {
  try {
    fn();
    console.log("PASS " + name);
  } catch (e) {
    console.log("FAIL " + name);
  }
}
function add(a, b) {
  return a - b;
}
test("adds", () => {
  add(2, 3);
});`,
      options: ["FAIL adds", "PASS adds", "لا شيء"],
      answer: 1,
      why: "الاختبار شغّل add ورمى ناتجها -1 دون أن يقارنه بشيء. لم يُرمَ أي خطأ، فطبع PASS. تشغيل الكود ليس اختباراً له: بلا خطوة التأكّد (assertEqual(add(2, 3), 5)) يبقى الاختبار أخضر مهما فسدت الدالة.",
    },
    {
      question: "ماذا يطبع هذا البرنامج بلغة بايثون؟",
      lang: "py",
      code: `def add(a, b):
    return a + b

assert add(2, 2) == 4
print("first ok")
assert add(2, 3) == 6
print("second ok")`,
      options: ["first ok ثم second ok", "first ok ثم خطأ AssertionError", "خطأ AssertionError فقط"],
      answer: 1,
      why: "assert تسكت عندما يصح الشرط. 2 + 2 == 4 فيمضي البرنامج ويطبع first ok. لكن 2 + 3 هو 5 لا 6، فترمي assert خطأ AssertionError ويتوقف البرنامج قبل second ok. (التوقع 6 هو الخاطئ هنا.)",
    },
  ],
  code: {
    intro: "الإطار نفسه: test و assertEqual في سطرين، ثم اختبارات لدالة تأخذ الحرفين الأولين من الاسم. أحد الاختبارات يكشف حالة طرفية. شغّل، ثم أصلح الدالة وأضف حالاتك.",
    runnerStarter: `function test(name, fn) { try { fn(); console.log("PASS " + name); } catch (e) { console.log("FAIL " + name + ": " + e.message); } }
function assertEqual(actual, expected) { if (actual !== expected) throw new Error("expected " + expected + ", got " + actual); }

function initials(fullName) {
  let parts = fullName.split(" ");
  return parts[0][0] + parts[1][0];
}

test("two names", () => assertEqual(initials("Sara Ali"), "SA"));
test("three names", () => assertEqual(initials("Omar Bin Saad"), "OB"));
test("one name", () => assertEqual(initials("Sara"), "S"));
// الاسم الواحد يحمرّ: parts[1] غير موجود. أصلح الدالة حتى يصبح الثلاثة خضراء
// ثم أضف حالة طرفية: initials("") ماذا تتوقع أن ترجع؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "جهّز، شغّل، تأكّد",
      prompt: "رتّب الأسطر: الدالة أولاً، ثم المدخل، ثم التشغيل، ثم الناتج المتوقع، ثم المقارنة التي تطبع PASS.",
      lines: [
        "function triple(n) {",
        "  return n * 3;",
        "}",
        "let input = 4;",
        "let actual = triple(input);",
        "let expected = 12;",
        'console.log(actual === expected ? "PASS" : "FAIL");',
      ],
      expected: "PASS",
    },
    {
      kind: "fill",
      title: "المدخل الذي يفضح الخطأ",
      prompt: "القاعدة: من عمره 18 فأكثر بالغ. الدالة فيها خطأ عند حدّ واحد. أي مدخل يجعل الاختبار يحمرّ؟",
      template: `function isAdult(age) {
  return age > 18;
}
function check(name, actual, expected) {
  console.log((actual === expected ? "PASS " : "FAIL ") + name);
}
let age = ___;
check("age " + age, isAdult(age), age >= 18);`,
      options: ["30", "18", "10"],
      expected: "FAIL age 18",
    },
    {
      kind: "fix",
      lang: "py",
      title: "اختبار أحمر يشير إلى الخطأ",
      prompt: "الاختبارات بـ assert تتوقف عند الحالة ALI: الدالة لا تعدّ الحروف الكبيرة. أصلح الدالة نفسها، ولا تغيّر أي سطر assert، حتى يُطبع all tests passed.",
      code: `def count_vowels(word):
    count = 0
    for ch in word:
        if ch in "aeiou":
            count = count + 1
    return count

assert count_vowels("sara") == 2
assert count_vowels("") == 0
assert count_vowels("ALI") == 2
print("all tests passed")`,
      expected: "all tests passed",
      hint: '"A" ليس في "aeiou". حوّل الحرف إلى صغير قبل الفحص: ch.lower() in "aeiou".',
      solution: `def count_vowels(word):
    count = 0
    for ch in word:
        if ch.lower() in "aeiou":
            count = count + 1
    return count

assert count_vowels("sara") == 2
assert count_vowels("") == 0
assert count_vowels("ALI") == 2
print("all tests passed")`,
    },
    {
      kind: "write",
      title: "ابنِ assertEqual بنفسك",
      prompt: 'اكتب الدالة assertEqual(actual, expected): إذا اختلفت القيمتان ترمي new Error برسالة "expected X, got Y". الدالة test جاهزة. المطلوب أن يُطبع PASS للأول و FAIL مع الرسالة للثاني.',
      starter: `function test(name, fn) {
  try {
    fn();
    console.log("PASS " + name);
  } catch (e) {
    console.log("FAIL " + name + ": " + e.message);
  }
}
// اكتب assertEqual هنا

test("2 + 2", () => assertEqual(2 + 2, 4));
test("10 / 4", () => assertEqual(10 / 4, 2));
`,
      expected: "PASS 2 + 2\nFAIL 10 / 4: expected 2, got 2.5",
      hint: 'if (actual !== expected) throw new Error("expected " + expected + ", got " + actual);',
      solution: `function test(name, fn) {
  try {
    fn();
    console.log("PASS " + name);
  } catch (e) {
    console.log("FAIL " + name + ": " + e.message);
  }
}
function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error("expected " + expected + ", got " + actual);
  }
}

test("2 + 2", () => assertEqual(2 + 2, 4));
test("10 / 4", () => assertEqual(10 / 4, 2));`,
    },
  ],
  quiz: [
    {
      question: "ماذا تطبع هذه الاختبارات الثلاثة؟",
      code: `function check(name, actual, expected) {
  console.log((actual === expected ? "PASS " : "FAIL ") + name);
}
function lastItem(arr) {
  return arr[arr.length - 1];
}
check("three", lastItem([1, 2, 3]), 3);
check("one", lastItem([7]), 7);
check("empty", lastItem([]), null);`,
      options: ["PASS ثلاث مرات", "PASS three ثم PASS one ثم FAIL empty", "FAIL three ثم PASS one ثم PASS empty"],
      answer: 1,
      why: "الحالتان العاديتان صحيحتان. القائمة الفارغة حالة طرفية: arr[-1] لا يوجد فيرجع undefined، والاختبار توقّع null، و undefined === null خاطئة. الحالة الطرفية كشفت سؤالاً لم يقرّره أحد: ماذا ترجع الدالة عند الفراغ؟",
    },
    {
      question: "مستخدم أبلغ: «مجموع سلة فارغة يعطي خطأ». ما أول ما تفعله؟",
      options: [
        "تصلح الدالة فوراً ثم تجرّب بيدك",
        "تكتب اختباراً بسلة فارغة وتراه يحمرّ، ثم تصلح حتى يخضرّ",
        "تحذف حالة السلة الفارغة من الواجهة",
      ],
      answer: 1,
      why: "الاختبار الأحمر يثبت أنك أعدت إنتاج الخطأ، والأخضر بعدها يثبت أن إصلاحك هو الذي عالجه. ويبقى الاختبار في المشروع: لو أعاد أحد الخطأ بعد سنة، يحمرّ قبل أن يصل إلى المستخدم.",
    },
    {
      question: "ماذا يطبع هذا البرنامج بلغة بايثون؟",
      code: `def is_even(n):
    return n % 2 == 0

assert is_even(4)
assert is_even(0)
print("done")`,
      options: ["done", "AssertionError عند is_even(0)", "لا شيء"],
      answer: 0,
      why: "0 % 2 يساوي 0، فالصفر زوجي و is_even(0) صحيحة. كل assert صحيحة تسكت، فيصل البرنامج إلى print. الصفر حالة طرفية تستحق اختباراً، حتى عندما تنجح.",
    },
    {
      question: "اختبار في هذا التطبيق يرسل طلب تسجيل حقيقياً إلى الخادم، فيكتب الخادم في قاعدة البيانات، ثم يتحقق الاختبار أن الرد 201. ما نوعه؟",
      options: ["اختبار وحدة: يفحص دالة واحدة", "اختبار تكامل: يفحص قطعاً تعمل معاً", "اختبار من طرف إلى طرف: روبوت يضغط في الواجهة"],
      answer: 1,
      why: "لا يفحص دالة معزولة، بل الخادم والمسار وقاعدة البيانات معاً، ولا يفتح متصفحاً. اختبارات الوحدة كثيرة وسريعة جداً، والتكامل أقل وأبطأ، ومن طرف إلى طرف قليلة لأنها الأبطأ والأكثر هشاشة.",
    },
    {
      question: "في مشروعك 400 اختبار تعمل في 5 ثوانٍ. أعدت كتابة دالة، فاحمرّ اختبار واحد اسمه \"empty cart total is 0\". ماذا تعرف الآن؟",
      options: [
        "أن إعادة الكتابة كسرت حالة السلة الفارغة، والباقي يعمل كما كان",
        "أن الاختبار قديم ويجب حذفه",
        "لا شيء حتى تجرّب التطبيق كله بيدك",
      ],
      answer: 0,
      why: "399 اختباراً أخضر تقول إن ما تفحصه لم يتغير، والاختبار الأحمر يسمّي بالضبط ما انكسر. هذا ما يجعلك تغيّر الكود دون خوف: الخطأ يُكتشف في ثوانٍ وعلى جهازك، لا عند المستخدم.",
    },
  ],
  next: "clean-code",
};
