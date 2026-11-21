import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number | string): Cell => ({ name, value: String(value), type: "number" });

export const goTypes: Lesson = {
  slug: "go-types",
  stage: 0,
  number: "1.3",
  title: "الأنواع",
  subtitle: "النوع يحدد حجم الدرج بالبايت وطريقة قراءة البتات فيه، و Go لا تحوّل بين الأنواع إلا إن طلبت ذلك صراحة",
  minutes: 16,
  singleLanguage: true,
  problem: {
    title: "عدّاد من ثمانية بتات",
    body: "هذا درج من نوع int8: ثمانية بتات فقط. اضغط +1 مرات قليلة وراقب البتات والرقم حين يصل إلى 127. ثم جرّب الأنواع الأخرى.",
    demo: "goTypes",
  },
  scene: {
    code: {
      go: `var small int8 = 127
small = small + 1
big := 7 / 2
ratio := 7.0 / 2
price := 19.99
whole := int(price)
total := float64(big) + ratio
fmt.Println(small, big, ratio, whole, total)`,
    },
    notes: {
      go: "الأنواع الصحيحة: int8 و int16 و int32 و int64 ونظائرها بلا إشارة uint8 (واسمها byte) إلى uint64، و int بحجم كلمة المعالج (8 بايتات على 64 بت). والعشرية float32 و float64.",
    },
    steps: [
      { line: null, say: "الذاكرة بايتات، وكل بايت ثمانية بتات. النوع يقول للمعالج كم بايتاً يأخذ الدرج وكيف يقرأ البتات: عدداً صحيحاً بإشارة، أو بلا إشارة، أو عدداً عشرياً.", memory: [] },
      { line: 1, say: "int8 درج من بايت واحد: 8 بتات تتسع لـ 256 قيمة، من -128 إلى 127. وضعنا فيه أكبر قيمة: 01111111.", memory: [n("small", 127)], changed: ["small"] },
      { line: 2, say: "127 + 1 = 128 لا يتسع في 8 بتات بإشارة. البتات تصبح 10000000، وهي في int8 تعني -128. لا خطأ ولا تحذير: العدد يلتف (overflow)، فاختر نوعاً يتسع لقيمك.", memory: [n("small", -128)], changed: ["small"], read: ["small"] },
      { line: 3, say: "7 و 2 عددان صحيحان، فالقسمة صحيحة: الناتج 3 ويُرمى الكسر (يُقطع نحو الصفر). big نوعه int.", memory: [n("small", -128), n("big", 3)], changed: ["big"] },
      { line: 4, say: "7.0 عدد عشري، فالقسمة عشرية: 3.5، و ratio نوعه float64، ثمانية بايتات بصيغة الفاصلة العائمة.", memory: [n("small", -128), n("big", 3), n("ratio", 3.5)], changed: ["ratio"] },
      { line: 5, say: "19.99 عدد عشري، فـ price من نوع float64. وفي الحقيقة يُخزَّن أقرب عدد ثنائي إليه، لا 19.99 بالضبط.", memory: [n("small", -128), n("big", 3), n("ratio", 3.5), n("price", 19.99)], changed: ["price"] },
      { line: 6, say: "int(price) تحويل صريح: يصنع int جديداً من القيمة بقطع الكسر، فـ whole هو 19 لا 20. price نفسه لم يتغيّر.", memory: [n("small", -128), n("big", 3), n("ratio", 3.5), n("price", 19.99), n("whole", 19)], changed: ["whole"], read: ["price"] },
      { line: 7, say: "big + ratio وحدهما خطأ ترجمة: int و float64 نوعان مختلفان، و Go لا تخمّن. float64(big) يحوّل 3 إلى 3.0 بطلبك، فالجمع 6.5.", memory: [n("small", -128), n("big", 3), n("ratio", 3.5), n("price", 19.99), n("whole", 19), n("total", 6.5)], changed: ["total"], read: ["big", "ratio"] },
      { line: 8, say: "يطبع الخمسة. كل رقم هنا نتيجة حجم الدرج وطريقة قراءته، لا رياضيات مدرسية.", memory: [n("small", -128), n("big", 3), n("ratio", 3.5), n("price", 19.99), n("whole", 19), n("total", 6.5)], read: ["small", "big", "ratio", "whole", "total"], output: ["-128 3 3.5 19 6.5"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "محاكاة درج عدد صحيح بعدد محدود من البتات: wrap يفعل ما يفعله المعالج حين لا يتسع الناتج. bits = 8 مع signed = true هو int8، و signed = false هو uint8 (byte).",
    starter: `let bits = 8;
let signed = true;
let min = signed ? -Math.pow(2, bits - 1) : 0;
let max = signed ? Math.pow(2, bits - 1) - 1 : Math.pow(2, bits) - 1;
function wrap(v) {
  let range = max - min + 1;
  return ((v - min) % range + range) % range + min;
}
console.log("range", min, "to", max);
let x = 125;
for (let i = 0; i < 5; i++) {
  x = wrap(x + 1);
  console.log(x);
}`,
    challenges: [
      "اجعل signed = false. ما مدى uint8، وماذا يطبع الآن؟ توقّع أولاً.",
      "اجعل bits = 16. هل يحدث التفاف خلال خمس زيادات؟",
      "مع uint8 ابدأ من x = 0 واطرح 1 بدل أن تجمع. ماذا تصبح القيمة؟",
      "مع int8 احسب wrap(100 + 100) في رأسك، ثم اطبعه وتحقّق.",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع؟",
      code: `a := 10
b := 4
fmt.Println(a / b)`,
      options: ["2", "2.5", "3"],
      answer: 0,
      why: "a و b من نوع int، فالقسمة صحيحة وناتجها int: يُقطع الكسر نحو الصفر. لتحصل على 2.5 حوّل قبل القسمة: float64(a) / float64(b).",
      scene: {
        code: { go: `a := 10
b := 4
fmt.Println(a / b)` },
        steps: [
          { line: 1, say: "a درج int فيه 10.", memory: [n("a", 10)], changed: ["a"] },
          { line: 2, say: "b درج int فيه 4.", memory: [n("a", 10), n("b", 4)], changed: ["b"] },
          { line: 3, say: "int / int = int: 2.5 يُقطع إلى 2.", memory: [n("a", 10), n("b", 4)], read: ["a", "b"], output: ["2"] },
        ],
      },
    },
    {
      question: "نضرب int في float64. ماذا يحدث؟",
      code: `var count int = 3
var price float64 = 1.5
fmt.Println(count * price)`,
      options: ["خطأ ترجمة: mismatched types int and float64", "4.5", "4"],
      answer: 0,
      why: "Go لا تحوّل بين الأنواع وحدها، لأن التحويل الخفي يُخفي فقداً في الدقة. اكتب float64(count) * price، فيظهر في الكود أنك قررت التحويل.",
      scene: {
        code: { go: `var count int = 3
var price float64 = 1.5
fmt.Println(count * price)` },
        steps: [
          { line: 1, say: "count درج int.", memory: [n("count", 3)], changed: ["count"] },
          { line: 2, say: "price درج float64.", memory: [n("count", 3), n("price", 1.5)], changed: ["price"] },
          { line: 3, say: "نوعان مختلفان في عملية واحدة: المترجم يرفض.", memory: [n("count", 3), n("price", 1.5)], read: ["count", "price"], error: "invalid operation: count * price (mismatched types int and float64)" },
        ],
      },
    },
    {
      question: "byte (أي uint8) فيه 255، ثم زدناه واحداً. ماذا يطبع؟",
      code: `var b uint8 = 255
b++
fmt.Println(b)`,
      options: ["0", "256", "خطأ وقت التشغيل: overflow"],
      answer: 0,
      why: "uint8 ثمانية بتات بلا إشارة: من 0 إلى 255. البتات 11111111 + 1 تصبح 100000000، والبت التاسع لا مكان له فيسقط، فيبقى 00000000 أي 0.",
      scene: {
        code: { go: `var b uint8 = 255
b++
fmt.Println(b)` },
        steps: [
          { line: 1, say: "ثمانية بتات كلها 1: القيمة 255.", memory: [n("b", 255)], changed: ["b"] },
          { line: 2, say: "+1 يحتاج بتاً تاسعاً غير موجود. يبقى 00000000.", memory: [n("b", 0)], changed: ["b"], read: ["b"] },
          { line: 3, say: "يطبع 0.", memory: [n("b", 0)], read: ["b"], output: ["0"] },
        ],
      },
    },
  ],
  code: {
    intro: "unsafe.Sizeof يقول كم بايتاً يأخذ الدرج في الذاكرة، و %T يطبع نوع القيمة. لاحظ أن النص 16 بايتاً مهما طال: عنوان الحروف وطولها، أما الحروف نفسها فمكانها في موضع آخر من الذاكرة.",
    runnerLang: "go",
    runnerStarter: `package main

import (
	"fmt"
	"math"
	"unsafe"
)

func main() {
	fmt.Println("int8:", unsafe.Sizeof(int8(0)), "bytes, max", math.MaxInt8)
	fmt.Println("int:", unsafe.Sizeof(int(0)), "bytes, max", math.MaxInt)
	fmt.Println("float64:", unsafe.Sizeof(float64(0)), "bytes")
	fmt.Println("string:", unsafe.Sizeof("hello, world"), "bytes")

	x := 7 / 2
	y := 7.0 / 2
	fmt.Printf("%v %T, %v %T\\n", x, x, y, y)
	// try: var tiny int8 = 100, then tiny = tiny * 2, and print it
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "go",
      title: "متوسط صحيح",
      prompt: "رتّب البرنامج حتى يطبع المتوسط 3.5: حوّل العددين قبل القسمة.",
      lines: ["package main", "import \"fmt\"", "func main() {", "\tsum := 7", "\tcount := 2", "\tavg := float64(sum) / float64(count)", "\tfmt.Println(avg)", "}"],
      expected: "3.5",
    },
    {
      kind: "fill",
      lang: "go",
      title: "اقطع الكسر",
      prompt: "نريد الجزء الصحيح من السعر: 9. أي تحويل يوضع في الفراغ؟",
      template: `package main

import "fmt"

func main() {
	price := 9.99
	fmt.Println(___(price))
}`,
      options: ["int", "float64", "string"],
      answer: "int",
      expected: "9",
    },
    {
      kind: "fix",
      lang: "go",
      title: "المتوسط ضاع كسره",
      prompt: "متوسط 10 على 4 هو 2.5، لكن البرنامج يطبع 2. أصلحه.",
      code: `package main

import "fmt"

func main() {
	total := 10
	count := 4
	avg := total / count
	fmt.Println(avg)
}`,
      expected: "2.5",
      hint: "القسمة بين int و int تقطع الكسر. حوّل الاثنين: float64(total) / float64(count).",
      solution: `package main

import "fmt"

func main() {
	total := 10
	count := 4
	avg := float64(total) / float64(count)
	fmt.Println(avg)
}`,
    },
    {
      kind: "write",
      lang: "go",
      title: "من مئوية إلى فهرنهايت",
      prompt: "celsius عدد صحيح 37. احسب fahrenheit = celsius × 9 / 5 + 32 عدداً عشرياً، واطبعه برقم واحد بعد الفاصلة: fmt.Printf(\"%.1f\\n\", fahrenheit).",
      starter: `package main

import "fmt"

func main() {
	celsius := 37
	// convert, compute and print with one decimal
	fmt.Println(celsius)
}`,
      expected: "98.6",
      hint: "fahrenheit := float64(celsius)*9/5 + 32. لو بقي int لقُطع 66.6 إلى 66.",
      solution: `package main

import "fmt"

func main() {
	celsius := 37
	fahrenheit := float64(celsius)*9/5 + 32
	fmt.Printf("%.1f\\n", fahrenheit)
}`,
    },
  ],
  quiz: [
    {
      question: "ما نوع x وقيمته؟",
      code: `x := 5 / 2.0
fmt.Printf("%v %T\\n", x, x)`,
      options: ["2.5 float64", "2 int", "2.5 float32"],
      answer: 0,
      why: "5 و 2.0 ثابتان بلا نوع بعد، والمترجم يحسبهما بدقة: وجود 2.0 يجعل الناتج عشرياً. ثم يأخذ x النوع الافتراضي للعشري: float64.",
    },
    {
      question: "ماذا يطبع؟",
      code: `var a int8 = -128
a--
fmt.Println(a)`,
      options: ["127", "-129", "خطأ وقت التشغيل"],
      answer: 0,
      why: "-128 أصغر قيمة في int8 (10000000). طرح 1 يلتف إلى الطرف الآخر: 01111111 أي 127. الالتفاف يحدث في الاتجاهين.",
    },
    {
      question: "ماذا يطبع؟",
      code: `a := 0.1
b := 0.2
fmt.Println(a+b == 0.3)`,
      options: ["false", "true", "خطأ ترجمة"],
      answer: 0,
      why: "float64 يخزّن أقرب كسر ثنائي، و 0.1 و 0.2 لا يُكتبان بدقة في النظام الثنائي، فمجموعهما 0.30000000000000004. لهذا لا تُحفظ المبالغ المالية في float: احفظها بالهللات في int.",
    },
    {
      question: "ماذا يطبع؟",
      code: `var big int64 = 300
small := int8(big)
fmt.Println(small)`,
      options: ["44", "127", "300"],
      answer: 0,
      why: "التحويل إلى int8 يحتفظ بالبايت الأدنى فقط من 300. و 300 = 256 + 44، فالبايت الأدنى 44. التحويل الصريح لا يفحص المدى: أنت طلبته، فأنت المسؤول عنه.",
    },
    {
      question: "ماذا يطبع؟",
      code: `price := 65
half := float64(price) / 2
fmt.Println(int(half))`,
      options: ["32", "33", "32.5"],
      answer: 0,
      why: "القسمة العشرية تعطي 32.5، ثم int(half) يقطع الكسر ولا يقرّب، فالناتج 32. للتقريب استعمل math.Round قبل التحويل.",
    },
  ],
  next: "go-control",
};
