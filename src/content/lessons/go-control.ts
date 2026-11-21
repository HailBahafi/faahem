import type { Cell, Lesson } from "@/lib/types";

const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

export const goControl: Lesson = {
  slug: "go-control",
  stage: 0,
  number: "1.4",
  title: "التحكم",
  subtitle: "if بلا أقواس، و switch لا يسقط إلى الحالة التالية، وحلقة واحدة اسمها for تكفي لكل التكرار",
  minutes: 16,
  singleLanguage: true,
  problem: {
    title: "كلمة واحدة لكل الحلقات",
    body: "ثلاث حلقات بأشكال مختلفة، وكلها for. اختر شكلاً واضغط «خطوة» لترى أي جزء يعمل الآن: البداية، الشرط، الجسم، أم الخطوة التالية.",
    demo: "goControl",
  },
  scene: {
    code: {
      go: `total := 0
for i := 1; i <= 4; i++ {
	if i%2 == 0 {
		continue
	}
	total += i
}
fmt.Println(total)`,
    },
    notes: {
      go: "لا أقواس حول الشرط، والأقواس المعقوفة إلزامية حتى لسطر واحد. والشرط يجب أن يكون bool: لا تُقبل if n كما في JavaScript و Python.",
    },
    steps: [
      { line: null, say: "نجمع الأعداد الفردية من 1 إلى 4. المعالج لا يعرف «حلقة»: يعرف «قارن» و«اقفز إلى عنوان». for و if و continue كلها قفزات يرتّبها المترجم.", memory: [] },
      { line: 1, say: "درج total فيه 0.", memory: [n("total", 0)], changed: ["total"] },
      { line: 2, say: "الجزء الأول من for يعمل مرة واحدة: i := 1. ثم الشرط i <= 4 صحيح (1 <= 4)، فندخل الجسم. i يعيش داخل الحلقة فقط.", memory: [n("total", 0), n("i", 1)], changed: ["i"], read: ["i"] },
      { line: 3, say: "i%2 هو باقي قسمة 1 على 2: 1. والشرط 1 == 0 خطأ (false)، فنتخطى الكتلة إلى السطر 6.", memory: [n("total", 0), n("i", 1)], read: ["i"] },
      { line: 6, say: "total += i اختصار لـ total = total + i: يصبح 1. نصل إلى } فنعود إلى رأس الحلقة.", memory: [n("total", 1), n("i", 1)], changed: ["total"], read: ["i"] },
      { line: 2, say: "الجزء الثالث i++ يعمل بعد كل دورة: i يصبح 2. ثم الشرط 2 <= 4 صحيح.", memory: [n("total", 1), n("i", 2)], changed: ["i"], read: ["i"] },
      { line: 3, say: "2%2 هو 0، والشرط صحيح هذه المرة، فندخل الكتلة.", memory: [n("total", 1), n("i", 2)], read: ["i"] },
      { line: 4, say: "continue يقفز إلى i++ مباشرة ويتخطى بقية الجسم: total لا يتغيّر.", memory: [n("total", 1), n("i", 2)] },
      { line: 2, say: "i يصبح 3، و 3 <= 4 صحيح. 3%2 هو 1 فلا continue.", memory: [n("total", 1), n("i", 3)], changed: ["i"], read: ["i"] },
      { line: 6, say: "total يصبح 1 + 3 = 4.", memory: [n("total", 4), n("i", 3)], changed: ["total"], read: ["i"] },
      { line: 2, say: "i يصبح 4، زوجي فيتخطاه continue. ثم i يصبح 5، والشرط 5 <= 4 خطأ: نخرج من الحلقة ويختفي درج i.", memory: [n("total", 4)] },
      { line: 8, say: "يطبع 4: مجموع 1 و 3.", memory: [n("total", 4)], read: ["total"], output: ["4"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "الحلقة نفسها بـ JavaScript، فـ for فيها بالأجزاء الثلاثة ذاتها: بداية، وشرط، وخطوة. الفرق في Go أن الأقواس حول الأجزاء تُحذف. شاهد i و total يتغيّران سطراً سطراً.",
    starter: `let total = 0;
for (let i = 1; i <= 4; i++) {
  if (i % 2 === 0) {
    continue;
  }
  total += i;
}
console.log(total);

let n = 100;
let steps = 0;
while (n > 1) {
  n = Math.floor(n / 2);
  steps++;
}
console.log(steps);`,
    challenges: [
      "غيّر 4 إلى 10. ما المجموع الآن؟ احسبه قبل أن تضغط.",
      "ضع break مكان continue. كم دورة تكتمل، وماذا يُطبع؟",
      "الحلقة الثانية في Go تُكتب for n > 1 { ... }: نفس for بشرط فقط. كم خطوة لـ n = 1000؟",
      "اجعل الحلقة الأولى تجمع الأعداد الزوجية بدل الفردية بتغيير حرف واحد في الشرط.",
    ],
  },
  predict: [
    {
      question: "day هو 2. ماذا يطبع switch في Go؟",
      code: `day := 2
switch day {
case 1:
	fmt.Println("one")
case 2:
	fmt.Println("two")
case 3:
	fmt.Println("three")
}`,
      options: ["two", "two ثم three", "one ثم two ثم three"],
      answer: 0,
      why: "في Go تنتهي كل حالة وحدها، دون break. السقوط إلى الحالة التالية لا يحدث إلا إن كتبت fallthrough صراحة، فخطأ break المنسية في C و JavaScript غير موجود هنا.",
      scene: {
        code: { go: `day := 2
switch day {
case 1:
	fmt.Println("one")
case 2:
	fmt.Println("two")
case 3:
	fmt.Println("three")
}` },
        steps: [
          { line: 1, say: "day فيه 2.", memory: [n("day", 2)], changed: ["day"] },
          { line: 3, say: "هل day == 1؟ لا. ننتقل إلى الحالة التالية.", memory: [n("day", 2)], read: ["day"] },
          { line: 5, say: "هل day == 2؟ نعم.", memory: [n("day", 2)], read: ["day"] },
          { line: 6, say: "يطبع two، ثم يقفز إلى ما بعد } مباشرة.", memory: [n("day", 2)], output: ["two"] },
        ],
      },
    },
    {
      question: "ماذا يحدث؟",
      code: `count := 3
if count {
	fmt.Println("has items")
}`,
      options: ["خطأ ترجمة: non-boolean condition in if statement", "يطبع has items", "لا يطبع شيئاً"],
      answer: 0,
      why: "في Go شرط if يجب أن يكون bool، ولا يوجد «صحيح ضمنياً» لعدد غير صفري أو نص غير فارغ. اكتب الشرط الذي تقصده: if count > 0.",
      scene: {
        code: { go: `count := 3
if count {
	fmt.Println("has items")
}` },
        steps: [
          { line: 1, say: "count من نوع int.", memory: [n("count", 3)], changed: ["count"] },
          { line: 2, say: "الشرط من نوع int لا bool: المترجم يرفض.", memory: [n("count", 3)], read: ["count"], error: "non-boolean condition in if statement" },
        ],
      },
    },
    {
      question: "for بشرط فقط، مثل while. كم مرة يدور؟",
      code: `n := 10
steps := 0
for n > 1 {
	n /= 2
	steps++
}
fmt.Println(steps)`,
      options: ["3", "5", "4"],
      answer: 0,
      why: "n يمر بـ 10 ثم 5 ثم 2 ثم 1 (القسمة صحيحة تقطع الكسر). ثلاث قسمات، وعند 1 يصبح الشرط خطأ. هذه for نفسها بلا جزء بداية ولا جزء خطوة.",
      scene: {
        code: { go: `n := 10
steps := 0
for n > 1 {
	n /= 2
	steps++
}
fmt.Println(steps)` },
        steps: [
          { line: 2, say: "n = 10، steps = 0.", memory: [n("n", 10), n("steps", 0)], changed: ["n", "steps"] },
          { line: 3, say: "10 > 1 صحيح: ندخل. n يصبح 5.", memory: [n("n", 5), n("steps", 1)], changed: ["n", "steps"] },
          { line: 3, say: "5 > 1 صحيح: n يصبح 2.", memory: [n("n", 2), n("steps", 2)], changed: ["n", "steps"] },
          { line: 3, say: "2 > 1 صحيح: n يصبح 1.", memory: [n("n", 1), n("steps", 3)], changed: ["n", "steps"] },
          { line: 3, say: "1 > 1 خطأ: نخرج.", memory: [n("n", 1), n("steps", 3)], read: ["n"] },
          { line: 7, say: "يطبع 3.", memory: [n("n", 1), n("steps", 3)], read: ["steps"], output: ["3"] },
        ],
      },
    },
  ],
  code: {
    intro: "switch بلا قيمة بعده يعمل مثل سلسلة if/else if: أول حالة شرطها صحيح تعمل. غيّر الحدود أو أضف حالة، ثم شغّل.",
    runnerLang: "go",
    runnerStarter: `package main

import "fmt"

func main() {
	for i := 1; i <= 15; i++ {
		switch {
		case i%15 == 0:
			fmt.Println(i, "FizzBuzz")
		case i%3 == 0:
			fmt.Println(i, "Fizz")
		case i%5 == 0:
			fmt.Println(i, "Buzz")
		}
	}
	// try: move the i%15 case to the bottom. Why does 15 change?
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "go",
      title: "عدّ تنازلي",
      prompt: "رتّب البرنامج حتى يطبع 3 ثم 2 ثم 1 ثم go.",
      lines: ["package main", "import \"fmt\"", "func main() {", "\tfor n := 3; n > 0; n-- {", "\t\tfmt.Println(n)", "\t}", "\tfmt.Println(\"go\")", "}"],
      expected: "3\n2\n1\ngo",
    },
    {
      kind: "fill",
      lang: "go",
      title: "الشرط الصحيح",
      prompt: "البرنامج يطبع 012. أي عامل يوضع في الفراغ؟",
      template: `package main

import "fmt"

func main() {
	for i := 0; i ___ 3; i++ {
		fmt.Print(i)
	}
	fmt.Println()
}`,
      options: ["<", "<=", ">"],
      answer: "<",
      expected: "012",
    },
    {
      kind: "fix",
      lang: "go",
      title: "التقدير الخاطئ",
      prompt: "الدرجة 85 تقديرها B، لكن البرنامج يطبع C. switch ينفّذ أول حالة صحيحة. أصلح الترتيب.",
      code: `package main

import "fmt"

func main() {
	score := 85
	switch {
	case score >= 60:
		fmt.Println("C")
	case score >= 80:
		fmt.Println("B")
	case score >= 90:
		fmt.Println("A")
	default:
		fmt.Println("F")
	}
}`,
      expected: "B",
      hint: "85 >= 60 صحيح، فتعمل الحالة الأولى وحدها. ابدأ بالشرط الأضيق: 90 ثم 80 ثم 60.",
      solution: `package main

import "fmt"

func main() {
	score := 85
	switch {
	case score >= 90:
		fmt.Println("A")
	case score >= 80:
		fmt.Println("B")
	case score >= 60:
		fmt.Println("C")
	default:
		fmt.Println("F")
	}
}`,
    },
    {
      kind: "write",
      lang: "go",
      title: "مضاعفات 3",
      prompt: "اجمع كل مضاعفات 3 الأصغر من 20 (3 و 6 ... 18) واطبع المجموع.",
      starter: `package main

import "fmt"

func main() {
	sum := 0
	// loop and add the multiples of 3 below 20
	fmt.Println(sum)
}`,
      expected: "63",
      hint: "for i := 1; i < 20; i++ { if i%3 == 0 { sum += i } }. أو ابدأ من 3 وزد 3 كل مرة: i += 3.",
      solution: `package main

import "fmt"

func main() {
	sum := 0
	for i := 3; i < 20; i += 3 {
		sum += i
	}
	fmt.Println(sum)
}`,
    },
  ],
  quiz: [
    {
      question: "if مع جملة قصيرة قبل الشرط. ماذا يقول المترجم؟",
      code: `if x := 10; x > 5 {
	fmt.Println("big")
}
fmt.Println(x)`,
      options: ["خطأ: undefined: x في السطر 4", "big ثم 10", "big فقط"],
      answer: 0,
      why: "المتغير المعلن في رأس if يعيش داخل if و else فقط، ويختفي درجه عند }. هذا مقصود: المتغير المؤقت لا يتسرّب إلى بقية الدالة. ستراه كثيراً مع الأخطاء: if err := f(); err != nil.",
    },
    {
      question: "ماذا يطبع؟",
      code: `for i := 0; i < 5; i++ {
	if i == 3 {
		break
	}
	fmt.Print(i)
}`,
      options: ["012", "0124", "0123"],
      answer: 0,
      why: "break يخرج من الحلقة كلها فوراً، قبل أن يُطبع 3. لو كانت continue لتخطّت 3 وحدها وطبعت 0124.",
    },
    {
      question: "ماذا يطبع؟",
      code: `n := 0
for {
	n++
	if n*n > 20 {
		break
	}
}
fmt.Println(n)`,
      options: ["5", "4", "الحلقة لا تنتهي"],
      answer: 0,
      why: "for بلا أي جزء حلقة لا نهائية، والخروج منها بـ break. 4×4 = 16 لا يتجاوز 20، و 5×5 = 25 يتجاوزه فنخرج و n هو 5. بهذا الشكل تُكتب حلقات الخوادم التي تنتظر الطلبات.",
    },
    {
      question: "ماذا يطبع؟",
      code: `day := "fri"
switch day {
case "fri", "sat":
	fmt.Println("weekend")
default:
	fmt.Println("workday")
}`,
      options: ["weekend", "workday", "خطأ ترجمة: حالتان في سطر واحد"],
      answer: 0,
      why: "الحالة الواحدة تقبل عدة قيم مفصولة بفاصلة، و switch يقارن day بكل منها. هذا بديل Go عن كتابة حالتين متتاليتين تسقط الأولى إلى الثانية.",
    },
    {
      question: "ماذا يطبع؟",
      code: `n := 1
switch n {
case 1:
	fmt.Println("one")
	fallthrough
case 2:
	fmt.Println("two")
case 3:
	fmt.Println("three")
}`,
      options: ["one ثم two", "one فقط", "one ثم two ثم three"],
      answer: 0,
      why: "fallthrough ينقل التنفيذ إلى جسم الحالة التالية دون فحص شرطها، مرة واحدة فقط. حالة 2 لا تحوي fallthrough، فيتوقف عندها.",
    },
  ],
  next: "go-functions",
};
