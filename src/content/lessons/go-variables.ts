import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number, constant = false): Cell => ({ name, value: String(value), type: "number", constant });
const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const b = (name: string, value: boolean): Cell => ({ name, value: String(value), type: "boolean" });

const base = [n("count", 0), s("name", ""), b("ready", false)];

export const goVariables: Lesson = {
  slug: "go-variables",
  stage: 0,
  number: "1.2",
  title: "المتغيرات والقيم الصفرية",
  subtitle: "في Go لكل درج نوع ثابت، ولا يوجد درج فارغ: كل متغير يولد بقيمة صفرية",
  minutes: 15,
  singleLanguage: true,
  problem: {
    title: "درج له شكل واحد",
    body: "افتح درجاً واختر نوعه، ثم حاول أن تضع فيه قيماً مختلفة. لاحظ ما يوجد في الدرج قبل أن تضع فيه أي شيء.",
    demo: "goVariables",
  },
  scene: {
    code: {
      go: `var count int
var name string
var ready bool
score := 10
count = score + 5
score = 50
const limit = 100
fmt.Println(count, name == "", ready, score, limit)`,
    },
    notes: {
      go: "var يعلن متغيراً في أي مكان، و := يعلن ويستنتج النوع داخل الدوال فقط، و = يكتب في درج موجود ولا ينشئ درجاً.",
    },
    steps: [
      { line: null, say: "هذه الأسطر داخل func main. في Go يعرف المترجم نوع كل درج وحجمه قبل التشغيل، فيحجز له مكانه بالضبط: int ثمانية بايتات على جهاز 64 بت.", memory: [] },
      { line: 1, say: "var count int يحجز درجاً من نوع int. لم نكتب قيمة، لكن الدرج ليس فارغاً: Go تملأ كل بايتاته بأصفار، والأصفار في int تعني 0.", memory: [n("count", 0)], changed: ["count"] },
      { line: 2, say: "نص بلا قيمة يولد نصاً فارغاً \"\". لا undefined ولا null في Go للأنواع الأساسية: هذه هي القيمة الصفرية.", memory: [n("count", 0), s("name", "")], changed: ["name"] },
      { line: 3, say: "و bool يولد false. القاعدة واحدة: ذاكرة بأصفار، وكل نوع يقرأ الأصفار بطريقته.", memory: base, changed: ["ready"] },
      { line: 4, say: ":= يعلن متغيراً جديداً ويضع فيه قيمة، ويستنتج المترجم النوع من القيمة: 10 عدد صحيح، فـ score من نوع int إلى الأبد.", memory: [...base, n("score", 10)], changed: ["score"] },
      { line: 5, say: "= بلا نقطتين يكتب في درج موجود. الطرف الأيمن أولاً: يقرأ score فيجد 10، ويحسب 15، ثم يكتب 15 فوق 0 في count.", memory: [n("count", 15), s("name", ""), b("ready", false), n("score", 10)], changed: ["count"], read: ["score"] },
      { line: 6, say: "نكتب 50 في score. وماذا عن count؟ يبقى 15: السطر السابق نسخ قيمة محسوبة إلى درج count، لا رابطاً إلى score.", memory: [n("count", 15), s("name", ""), b("ready", false), n("score", 50)], changed: ["score"] },
      { line: 7, say: "const قيمة يعرفها المترجم ويضعها مكان الاسم في كل سطر يستعمله. لا يمكن تغييرها، ومحاولة limit = 200 خطأ ترجمة.", memory: [n("count", 15), s("name", ""), b("ready", false), n("score", 50), n("limit", 100, true)], changed: ["limit"] },
      { line: 8, say: "نطبع: count هو 15، و name == \"\" صحيح، و ready هو false، ثم 50 و 100. كل متغير هنا مستعمل، وإلا لما تُرجم البرنامج.", memory: [n("count", 15), s("name", ""), b("ready", false), n("score", 50), n("limit", 100, true)], read: ["count", "name", "ready", "score", "limit"], output: ["15 true false 50 100"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "محاكاة لأدراج Go: كل درج يُعلن بنوع ويولد بقيمته الصفرية، والكتابة فيه بقيمة من نوع آخر يرفضها المترجم. غيّر الأسطر الأخيرة وتوقّع النتيجة قبل التشغيل.",
    starter: `let zero = { int: 0, string: "", bool: false };
let memory = {};
function declare(name, type) {
  memory[name] = { type: type, value: zero[type] };
  console.log("var", name, type, "starts as", memory[name].value);
}
function typeOf(value) {
  if (typeof value === "number") return "int";
  if (typeof value === "string") return "string";
  return "bool";
}
function assign(name, value) {
  let drawer = memory[name];
  if (typeOf(value) !== drawer.type) {
    console.log("compile error: cannot use", value, "as", drawer.type, "value");
    return;
  }
  drawer.value = value;
  console.log(name, "=", value);
}
declare("count", "int");
declare("ready", "bool");
assign("count", memory.count.value + 5);
assign("ready", "yes");
console.log(memory.count.value, memory.ready.value);`,
    challenges: [
      "قبل أن تضغط: ماذا يطبع السطر الأخير لـ ready بعد أن رُفضت \"yes\"؟",
      "أعلن درجاً من نوع string باسم city واطبع قيمته الصفرية بين علامتين: \"[\" + memory.city.value + \"]\".",
      "اكتب في count القيمة \"7\" بين علامتي تنصيص. هل يقبلها درج int؟",
      "أصلح سطر ready حتى يُقبل، وتوقّع السطر الأخير.",
    ],
  },
  predict: [
    {
      question: "لم نعطِ total قيمة قبل أن نجمع عليه. ماذا يطبع؟",
      code: `var total int
total = total + 5
fmt.Println(total)`,
      options: ["5", "خطأ ترجمة: total بلا قيمة", "NaN"],
      answer: 0,
      why: "لا يوجد في Go متغير بلا قيمة. var total int يولد 0، فـ 0 + 5 = 5. هذا مقصود: الكود الذي يجمع أو يعدّ يبدأ صحيحاً دون سطر تهيئة.",
      scene: {
        code: { go: `var total int
total = total + 5
fmt.Println(total)` },
        steps: [
          { line: 1, say: "درج int بأصفار: القيمة 0.", memory: [n("total", 0)], changed: ["total"] },
          { line: 2, say: "يقرأ 0، يحسب 5، يكتب 5.", memory: [n("total", 5)], changed: ["total"], read: ["total"] },
          { line: 3, say: "يطبع 5.", memory: [n("total", 5)], read: ["total"], output: ["5"] },
        ],
      },
    },
    {
      question: "نسخنا a إلى b ثم غيّرنا a. ماذا يطبع؟",
      code: `a := 10
b := a
a = 20
fmt.Println(a, b)`,
      options: ["20 10", "20 20", "10 10"],
      answer: 0,
      why: "b := a ينسخ القيمة 10 إلى درج جديد. بعدها الدرجان منفصلان: الكتابة في a لا تلمس b.",
      scene: {
        code: { go: `a := 10
b := a
a = 20
fmt.Println(a, b)` },
        steps: [
          { line: 1, say: "درج a فيه 10.", memory: [n("a", 10)], changed: ["a"] },
          { line: 2, say: "درج جديد b، ونسخة من 10 فيه.", memory: [n("a", 10), n("b", 10)], changed: ["b"], copy: { from: "a", to: "b" } },
          { line: 3, say: "20 تُكتب في a وحده.", memory: [n("a", 20), n("b", 10)], changed: ["a"] },
          { line: 4, say: "20 10.", memory: [n("a", 20), n("b", 10)], read: ["a", "b"], output: ["20 10"] },
        ],
      },
    },
    {
      question: "داخل if استعملنا := مع اسم موجود. ماذا يطبع؟",
      code: `n := 1
if true {
	n := 2
	fmt.Println(n)
}
fmt.Println(n)`,
      options: ["2 ثم 1", "2 ثم 2", "خطأ ترجمة: n معلن مرتين"],
      answer: 0,
      why: ":= يعلن دائماً متغيراً جديداً في الكتلة الحالية. داخل الأقواس صار عندنا درج ثانٍ اسمه n يحجب الأول، ويختفي عند }. هذا الحجب (shadowing) مصدر أخطاء شائع: لتعديل الأول اكتب n = 2.",
      scene: {
        code: { go: `n := 1
if true {
	n := 2
	fmt.Println(n)
}
fmt.Println(n)` },
        steps: [
          { line: 1, say: "درج n فيه 1.", memory: [n("n", 1)], changed: ["n"] },
          { line: 3, say: ":= داخل الكتلة يصنع درجاً جديداً بالاسم نفسه. الأول ما زال 1.", memory: [n("n", 1), n("n (inner)", 2)], changed: ["n (inner)"] },
          { line: 4, say: "الاسم n هنا يعني أقرب درج: الداخلي.", memory: [n("n", 1), n("n (inner)", 2)], read: ["n (inner)"], output: ["2"] },
          { line: 6, say: "بعد } زال الدرج الداخلي، و n يعني الأول: 1.", memory: [n("n", 1)], read: ["n"], output: ["2", "1"] },
        ],
      },
    },
  ],
  code: {
    intro: "برنامج يطبع القيم الصفرية لأنواع أساسية. %q يطبع النص بعلامتي تنصيص فترى النص الفارغ، و %v يطبع أي قيمة بشكلها الافتراضي. غيّر الأسطر وأعلن متغيرات أخرى.",
    runnerLang: "go",
    runnerStarter: `package main

import "fmt"

func main() {
	var count int
	var price float64
	var name string
	var ready bool
	fmt.Printf("%v %v %q %v\\n", count, price, name, ready)

	city := "Riyadh" // := infers the type: string
	count = count + 3
	fmt.Println(city, count)
	// try: count = "three"  and read the compiler's message
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "go",
      title: "اجمع من الصفر",
      prompt: "رتّب البرنامج حتى يطبع 7: متغير يولد بقيمته الصفرية، ثم نضيف إليه.",
      lines: ["package main", "import \"fmt\"", "func main() {", "\tvar total int", "\ttotal = total + 7", "\tfmt.Println(total)", "}"],
      expected: "7",
    },
    {
      kind: "fill",
      lang: "go",
      title: "أي قيمة صفرية؟",
      prompt: "البرنامج يطبع false. أي نوع يوضع في الفراغ؟",
      template: `package main

import "fmt"

func main() {
	var ready ___
	fmt.Println(ready)
}`,
      options: ["int", "bool", "string"],
      answer: "bool",
      expected: "false",
    },
    {
      kind: "fix",
      lang: "go",
      title: "الخصم لم يُحفظ",
      prompt: "نريد أن يبقى السعر 80 بعد الخصم، لكن السطر الأخير يطبع 100. السبب نقطتان زائدتان. أصلحه.",
      code: `package main

import "fmt"

func main() {
	price := 100
	discount := true
	if discount {
		price := price - 20
		fmt.Println("inside:", price)
	}
	fmt.Println("final:", price)
}`,
      expected: "inside: 80\nfinal: 80",
      hint: "داخل if، price := يعلن درجاً جديداً يختفي عند }. اكتب price = price - 20 لتكتب في الدرج الأول.",
      solution: `package main

import "fmt"

func main() {
	price := 100
	discount := true
	if discount {
		price = price - 20
		fmt.Println("inside:", price)
	}
	fmt.Println("final:", price)
}`,
    },
    {
      kind: "write",
      lang: "go",
      title: "بطاقة طالب",
      prompt: "أعلن name بالقيمة \"Sara\" و age بالقيمة 20 باستعمال :=، و city بـ var من نوع string بلا قيمة. زد age واحداً، ثم اطبع بـ fmt.Printf(\"%s %d %q\\n\", name, age, city).",
      starter: `package main

import "fmt"

func main() {
	// declare name, age and city, add 1 to age, then print
}`,
      expected: "Sara 21 \"\"",
      hint: "name := \"Sara\"، age := 20، var city string، ثم age = age + 1.",
      solution: `package main

import "fmt"

func main() {
	name := "Sara"
	age := 20
	var city string
	age = age + 1
	fmt.Printf("%s %d %q\\n", name, age, city)
}`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: `var price float64
var qty int
var label string
fmt.Println(price, qty, label == "")`,
      options: ["0 0 true", "0.0 0 false", "خطأ ترجمة: متغيرات بلا قيم"],
      answer: 0,
      why: "الثلاثة تولد بالقيم الصفرية: 0 للأعداد العشرية والصحيحة، و \"\" للنص. و Println يطبع float64 الذي قيمته صفر على شكل 0.",
    },
    {
      question: "هذا السطر خارج أي دالة، في أعلى الملف. ماذا يقول المترجم؟",
      code: `package main

count := 0

func main() {}`,
      options: ["خطأ: := لا يُستعمل خارج الدوال، استعمل var count = 0", "يُترجم، و count متغير عام", "يُترجم، و count ثابت"],
      answer: 0,
      why: "على مستوى الحزمة يجب أن يبدأ كل سطر بكلمة إعلان (var أو const أو func أو type). := اختصار للدوال فقط.",
    },
    {
      question: "ماذا يحدث؟",
      code: `count := 3
count = "three"`,
      options: ["خطأ ترجمة: لا يمكن وضع نص في متغير int", "count يصبح نصاً", "count يبقى 3 بلا خطأ"],
      answer: 0,
      why: ":= حدّد نوع الدرج int من القيمة 3، والنوع لا يتغيّر بعد ذلك. درج int يتسع لعدد صحيح فقط، والمترجم يرفض قبل التشغيل.",
    },
    {
      question: "ماذا يطبع؟",
      code: `a, b := 1, 2
a, b = b, a
fmt.Println(a, b)`,
      options: ["2 1", "2 2", "1 1"],
      answer: 0,
      why: "في الإسناد المتعدد تُقرأ كل قيم الطرف الأيمن أولاً (2 و 1)، ثم تُكتب في الأدراج. لذلك يتبادل المتغيران دون درج مؤقت.",
    },
    {
      question: "ماذا يقول المترجم؟",
      code: `const max = 10
max = 20
fmt.Println(max)`,
      options: ["خطأ: cannot assign to max", "يطبع 20", "يطبع 10"],
      answer: 0,
      why: "الثابت ليس درجاً تكتب فيه: هو قيمة يعرفها المترجم ويضعها مكان اسمها. لذلك لا يمكن الإسناد إليه، والخطأ يظهر قبل التشغيل.",
    },
  ],
  next: "go-types",
};
