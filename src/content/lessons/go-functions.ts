import type { Cell, Frame, Lesson, Slot } from "@/lib/types";

const num = (name: string, value: number): Slot => ({ name, value: String(value), type: "number" });
const nil = (name: string): Slot => ({ name, value: "nil", type: "none" });
const errv = (name: string, msg: string): Slot => ({ name, value: `error("${msg}")`, type: "string" });
const main = (vars: Slot[]): Frame => ({ id: 1, name: "main", vars });
const div = (id: number, a: number, b: number): Frame => ({ id, name: "divide", vars: [num("a", a), num("b", b)] });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

export const goFunctions: Lesson = {
  slug: "go-functions",
  stage: 0,
  number: "1.5",
  title: "الدوال وتعدّد القيم",
  subtitle: "كل استدعاء يفتح إطاراً جديداً على المكدّس بنسخ من المعاملات، والدالة ترجع أكثر من قيمة: النتيجة والخطأ معاً",
  minutes: 17,
  singleLanguage: true,
  problem: {
    title: "آلة القسمة ومخرجان",
    body: "آلتان تقسمان عدداً على آخر. الأولى لها مخرج واحد، والثانية لها مخرجان: النتيجة والخطأ. جرّب القسمة على صفر في الاثنتين.",
    demo: "goFunctions",
  },
  scene: {
    code: {
      go: `func divide(a, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("divide by zero")
	}
	return a / b, nil
}

func main() {
	q, err := divide(17, 5)
	fmt.Println(q, err)
	_, err = divide(1, 0)
	fmt.Println(err)
}`,
    },
    notes: {
      go: "النوع يأتي بعد الاسم، و a, b int تعني أن الاثنين int. وأنواع النتائج بين قوسين بعد المعاملات: (int, error). و error نوع مدمج قيمته nil حين لا يوجد خطأ.",
    },
    steps: [
      { line: null, say: "البرنامج يبدأ من main. كل دالة تعمل تأخذ إطاراً (frame) على المكدّس: مساحة لمتغيراتها وحدها، تُحجز عند الاستدعاء وتُزال عند الرجوع.", memory: [], frames: [], heap: [] },
      { line: 8, say: "إطار main على المكدّس، فارغ بعد.", memory: [], frames: [main([])], heap: [] },
      { line: 9, say: "استدعاء divide(17, 5) يفتح إطاراً جديداً فوق main، وينسخ 17 و 5 إلى درجين جديدين a و b. هذه نسخ: الدالة لا ترى متغيرات main.", memory: [], frames: [main([]), div(2, 17, 5)], heap: [], changed: ["a", "b"] },
      { line: 2, say: "b == 0؟ b هو 5، فالشرط خطأ (false). نتخطى الكتلة إلى السطر 5.", memory: [], frames: [main([]), div(2, 17, 5)], heap: [], read: ["b"] },
      { line: 5, say: "return يرجع قيمتين: 17 / 5 = 3 (قسمة صحيحة)، و nil أي «لا خطأ». إطار divide يُزال بكل ما فيه.", memory: [], frames: [main([]), div(2, 17, 5)], heap: [], read: ["a", "b"] },
      { line: 9, say: "القيمتان تصلان إلى main بالترتيب: الأولى في q والثانية في err. := يعلن الاثنين معاً.", memory: [], frames: [main([num("q", 3), nil("err")])], heap: [], changed: ["q", "err"] },
      { line: 10, say: "Println يطبع 3 و nil، وشكل nil المطبوع <nil>.", memory: [], frames: [main([num("q", 3), nil("err")])], heap: [], read: ["q", "err"], output: ["3 <nil>"] },
      { line: 11, say: "استدعاء ثانٍ: إطار جديد تماماً، و a = 1 و b = 0. لا شيء باقٍ من الاستدعاء الأول.", memory: [], frames: [main([num("q", 3), nil("err")]), div(3, 1, 0)], heap: [], changed: ["a", "b"] },
      { line: 2, say: "b == 0 صحيح هذه المرة: ندخل الكتلة.", memory: [], frames: [main([num("q", 3), nil("err")]), div(3, 1, 0)], heap: [], read: ["b"] },
      { line: 3, say: "لا نقسم على صفر. نرجع 0 مكان النتيجة، وقيمة خطأ فيها الرسالة. الدالة لم تتوقف بانهيار: أخبرت من استدعاها.", memory: [], frames: [main([num("q", 3), nil("err")]), div(3, 1, 0)], heap: [] },
      { line: 11, say: "الشرطة السفلية _ ترمي القيمة الأولى عمداً، و = (لا :=) يكتب الخطأ في err الموجود. q لم يتغيّر.", memory: [], frames: [main([num("q", 3), errv("err", "divide by zero")])], heap: [], changed: ["err"] },
      { line: 12, say: "يطبع رسالة الخطأ. هذا نمط Go في كل مكان: النتيجة ومعها error، والمستدعي يفحص err قبل أن يثق بالنتيجة.", memory: [], frames: [main([num("q", 3), errv("err", "divide by zero")])], heap: [], read: ["err"], output: ["3 <nil>", "divide by zero"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "JavaScript لا ترجع قيمتين، فنحاكي أسلوب Go بمصفوفة من عنصرين: [النتيجة، الخطأ]. وشاهد في المكدّس أن كل استدعاء يأخذ إطاراً جديداً بنسخ من المعاملات.",
    starter: `function divide(a, b) {
  if (b === 0) {
    return [0, "divide by zero"];
  }
  return [Math.floor(a / b), null];
}
function double(n) {
  n = n * 2;
  return n;
}
let r = divide(17, 5);
console.log(r[0], r[1]);
r = divide(1, 0);
if (r[1] !== null) {
  console.log("error:", r[1]);
}
let x = 5;
let y = double(x);
console.log(x, y);`,
    challenges: [
      "قبل أن تضغط: لماذا يبقى x خمسة بعد double(x)؟ راقب إطار double في المكدّس.",
      "استدعِ divide(20, 6) واطبع الناتج والخطأ. توقّع الاثنين قبل أن تضغط.",
      "احذف الشرط if (r[1] !== null) واطبع r[0] مباشرة بعد divide(1, 0). ما الخطر في ذلك؟",
      "اكتب دالة minMax(a, b) ترجع [الأصغر، الأكبر] واطبع نتيجتها لـ 9 و 4.",
    ],
  },
  predict: [
    {
      question: "الدالة تغيّر معاملها. ماذا يطبع؟",
      code: `func double(n int) {
	n = n * 2
}

func main() {
	x := 5
	double(x)
	fmt.Println(x)
}`,
      options: ["5", "10", "خطأ ترجمة"],
      answer: 0,
      why: "في Go تُمرَّر القيم نسخاً: n درج في إطار double فيه نسخة من 5. مضاعفته لا تلمس x في إطار main، ويزول n مع الإطار. لتغيير x أرجع القيمة الجديدة (x = double(x))، أو مرّر عنوانه بمؤشر، وهذا درس لاحق.",
      scene: {
        code: { go: `func double(n int) {
	n = n * 2
}

func main() {
	x := 5
	double(x)
	fmt.Println(x)
}` },
        steps: [
          { line: 6, say: "x في إطار main.", memory: [], frames: [main([num("x", 5)])], heap: [], changed: ["x"] },
          { line: 1, say: "إطار double، و n نسخة من 5.", memory: [], frames: [main([num("x", 5)]), { id: 2, name: "double", vars: [num("n", 5)] }], heap: [], changed: ["n"] },
          { line: 2, say: "n يصبح 10، في إطار double وحده.", memory: [], frames: [main([num("x", 5)]), { id: 2, name: "double", vars: [num("n", 10)] }], heap: [], changed: ["n"] },
          { line: 8, say: "الإطار زال، و x ما زال 5.", memory: [], frames: [main([num("x", 5)])], heap: [], read: ["x"], output: ["5"] },
        ],
      },
    },
    {
      question: "divide ترجع قيمتين، ونحن نستقبل واحدة. ماذا يقول المترجم؟",
      code: `func divide(a, b int) (int, error) {
	// ...
}

func main() {
	q := divide(7, 2)
	fmt.Println(q)
}`,
      options: ["خطأ: assignment mismatch: 1 variable but divide returns 2 values", "يطبع 3 ويُهمل الخطأ", "يطبع 3 <nil>"],
      answer: 0,
      why: "Go لا تسمح بنسيان قيمة راجعة دون أن تقرر ذلك. استقبل الاثنتين (q, err :=)، أو ارمِ الخطأ صراحة بـ q, _ := فيرى كل قارئ للكود أنك تجاهلته عمداً.",
      scene: {
        code: { go: `func divide(a, b int) (int, error) {
	// ...
}

func main() {
	q := divide(7, 2)
	fmt.Println(q)
}` },
        steps: [
          { line: 1, say: "توقيع divide يقول: قيمتان.", memory: [n("results", 2)] },
          { line: 6, say: "الطرف الأيسر فيه متغير واحد: لا يتطابقان، والمترجم يرفض.", memory: [n("results", 2), n("variables", 1)], error: "assignment mismatch: 1 variable but divide returns 2 values" },
        ],
      },
    },
    {
      question: "نتائج بأسماء، و return وحدها. ماذا يطبع؟",
      code: `func split(sum int) (x, y int) {
	x = sum * 4 / 9
	y = sum - x
	return
}

func main() {
	fmt.Println(split(17))
}`,
      options: ["7 10", "0 0", "خطأ ترجمة: return بلا قيم"],
      answer: 0,
      why: "x و y في رأس الدالة درجان حقيقيان في إطارها، يولدان بالقيمة الصفرية 0. السطران يكتبان فيهما 7 (68 / 9 قسمة صحيحة) و 10، و return وحدها ترجع ما فيهما. استعملها في الدوال القصيرة فقط حتى يبقى الكود واضحاً.",
      scene: {
        code: { go: `func split(sum int) (x, y int) {
	x = sum * 4 / 9
	y = sum - x
	return
}

func main() {
	fmt.Println(split(17))
}` },
        steps: [
          { line: 1, say: "إطار split: sum = 17، و x و y بقيمتهما الصفرية.", memory: [], frames: [main([]), { id: 2, name: "split", vars: [num("sum", 17), num("x", 0), num("y", 0)] }], heap: [], changed: ["sum", "x", "y"] },
          { line: 2, say: "17 × 4 = 68، و 68 / 9 = 7.", memory: [], frames: [main([]), { id: 2, name: "split", vars: [num("sum", 17), num("x", 7), num("y", 0)] }], heap: [], changed: ["x"] },
          { line: 3, say: "y = 17 - 7 = 10.", memory: [], frames: [main([]), { id: 2, name: "split", vars: [num("sum", 17), num("x", 7), num("y", 10)] }], heap: [], changed: ["y"] },
          { line: 8, say: "return رجعت x و y، و Println طبعهما.", memory: [], frames: [main([])], heap: [], output: ["7 10"] },
        ],
      },
    },
  ],
  code: {
    intro: "strconv.Atoi يحوّل نصاً إلى عدد، ويرجع (int, error) لأن النص قد لا يكون عدداً. هذا الشكل if err != nil ستكتبه في كل برنامج Go حقيقي. جرّب نصوصاً أخرى.",
    runnerLang: "go",
    runnerStarter: `package main

import (
	"fmt"
	"strconv"
)

func parseAge(text string) (int, error) {
	age, err := strconv.Atoi(text)
	if err != nil {
		return 0, err
	}
	return age, nil
}

func main() {
	age, err := parseAge("42")
	fmt.Println(age, err)

	age, err = parseAge("4x2")
	if err != nil {
		fmt.Println("bad input:", err)
	}
	// try: parseAge("-5"), then make parseAge return an error for negative ages
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "go",
      title: "الأصغر والأكبر",
      prompt: "رتّب البرنامج: دالة ترجع قيمتين، الأصغر ثم الأكبر، و main تطبعهما.",
      lines: [
        "package main",
        "import \"fmt\"",
        "func minMax(a, b int) (int, int) {",
        "\tif a < b {",
        "\t\treturn a, b",
        "\t}",
        "\treturn b, a",
        "}",
        "func main() {",
        "\tlo, hi := minMax(9, 4)",
        "\tfmt.Println(lo, hi)",
        "}",
      ],
      expected: "4 9",
    },
    {
      kind: "fill",
      lang: "go",
      title: "الناتج والباقي",
      prompt: "divmod ترجع ناتج القسمة الصحيحة وباقيها. البرنامج يطبع 3 2. أي عامل يوضع في الفراغ؟",
      template: `package main

import "fmt"

func divmod(a, b int) (int, int) {
	return a / b, a ___ b
}

func main() {
	fmt.Println(divmod(17, 5))
}`,
      options: ["%", "/", "*"],
      answer: "%",
      expected: "3 2",
    },
    {
      kind: "fix",
      lang: "go",
      title: "الضريبة لم تُضف",
      prompt: "addTax تضيف 10% إلى السعر، لكن البرنامج يطبع 100 بدل 110: الدالة تعدّل نسختها فقط. اجعلها ترجع السعر الجديد واكتبه في price.",
      code: `package main

import "fmt"

func addTax(price int) {
	price = price + price/10
}

func main() {
	price := 100
	addTax(price)
	fmt.Println(price)
}`,
      expected: "110",
      hint: "func addTax(price int) int { return price + price/10 }، ثم في main: price = addTax(price).",
      solution: `package main

import "fmt"

func addTax(price int) int {
	return price + price/10
}

func main() {
	price := 100
	price = addTax(price)
	fmt.Println(price)
}`,
    },
    {
      kind: "write",
      lang: "go",
      title: "قسمة آمنة",
      prompt: "اكتب safeDivide(a, b int) (int, error) ترجع خطأ errors.New(\"divide by zero\") حين b صفر. في main اطبع ناتج safeDivide(10, 2)، ثم لـ safeDivide(5, 0) اطبع \"error:\" والخطأ.",
      starter: `package main

import (
	"errors"
	"fmt"
)

// write safeDivide here

func main() {
	// call it twice and print as described
}`,
      expected: "5\nerror: divide by zero",
      hint: "if b == 0 { return 0, errors.New(\"divide by zero\") }، ثم return a / b, nil. وفي main: if err != nil { fmt.Println(\"error:\", err) }.",
      solution: `package main

import (
	"errors"
	"fmt"
)

func safeDivide(a, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("divide by zero")
	}
	return a / b, nil
}

func main() {
	q, err := safeDivide(10, 2)
	if err == nil {
		fmt.Println(q)
	}
	_, err = safeDivide(5, 0)
	if err != nil {
		fmt.Println("error:", err)
	}
}`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: `func pair() (int, string) {
	return 1, "a"
}

func main() {
	n, _ := pair()
	fmt.Println(n)
}`,
      options: ["1", "1 a", "خطأ ترجمة: _ غير معرّف"],
      answer: 0,
      why: "_ ليس متغيراً: هو مكان ترمي فيه قيمة لا تحتاجها، ولا يُحجز له درج. يبقى n وحده بقيمة 1.",
    },
    {
      question: "ماذا يطبع؟",
      code: `n, err := strconv.Atoi("12a")
fmt.Println(n, err != nil)`,
      options: ["0 true", "12 true", "البرنامج ينهار بخطأ"],
      answer: 0,
      why: "Atoi لم يستطع التحويل فرجع القيمة الصفرية 0 ومعها خطأ. لا انهيار: الخطأ قيمة عادية في err، ومسؤوليتك أن تفحصها قبل أن تستعمل n.",
    },
    {
      question: "ماذا يطبع؟",
      code: `func swap(a, b int) {
	a, b = b, a
}

func main() {
	x, y := 1, 2
	swap(x, y)
	fmt.Println(x, y)
}`,
      options: ["1 2", "2 1", "خطأ ترجمة"],
      answer: 0,
      why: "swap بدّلت نسختيها a و b في إطارها، ثم زال الإطار. x و y في main لم يُلمسا. الدالة الصحيحة ترجع القيمتين: func swap(a, b int) (int, int) { return b, a }، و x, y = swap(x, y).",
    },
    {
      question: "ماذا يطبع؟",
      code: `square := func(x int) int {
	return x * x
}
fmt.Println(square(square(3)))`,
      options: ["81", "9", "خطأ ترجمة: دالة داخل متغير"],
      answer: 0,
      why: "الدالة في Go قيمة تُحفظ في متغير وتُمرَّر. الاستدعاء الداخلي أولاً: square(3) = 9، ثم square(9) = 81. كل استدعاء إطار خاص به.",
    },
    {
      question: "main تستدعي greet، و greet مكتوبة تحتها في الملف. ماذا يحدث؟",
      code: `func main() {
	greet("Sara")
}

func greet(name string) {
	fmt.Println("Hi,", name)
}`,
      options: ["يطبع Hi, Sara", "خطأ ترجمة: greet غير معرّفة بعد", "لا يطبع شيئاً"],
      answer: 0,
      why: "المترجم يقرأ الحزمة كلها قبل أن يربط الأسماء، فترتيب الدوال في الملف لا يهم. رتّبها بما يسهّل القراءة: main أولاً ثم ما تستدعيه، أو العكس.",
    },
  ],
  next: "go-slices",
};
