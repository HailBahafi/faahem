import type { Cell, Lesson } from "@/lib/types";

const x = (name: string, value: string): Cell => ({ name, value, type: "none" });
/** A slice header: three words (pointer, length, capacity) and what it lets you see. */
const h = (name: string, ptr: string, len: number, cap: number, view: string): Cell =>
  x(name, `{ptr: ${ptr}, len: ${len}, cap: ${cap}} → ${view}`);

const a0 = x("arr", "[10 20 30 40]");
const a1 = x("arr", "[10 99 30 40]");
const a2 = x("arr", "[10 99 7 40]");

export const goSlices: Lesson = {
  slug: "go-slices",
  stage: 0,
  number: "1.6",
  title: "المصفوفات و slices",
  subtitle: "المصفوفة صفّ ثابت من الخانات، و slice نافذة من ثلاث كلمات تطلّ عليه",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "أضفت إلى a فتغيّر b",
    body: "شريحتان a و b تطلّان على المصفوفة نفسها. أضف عناصر إلى a وراقب b والمصفوفة التي تحتهما، حتى تمتلئ السعة.",
    demo: "goSlices",
  },
  scene: {
    code: {
      go: `arr := [4]int{10, 20, 30, 40}
a := arr[0:2]
b := arr[1:3]
b[0] = 99
a = append(a, 7)
a = append(a, 8, 9)
a[0] = 1
fmt.Println(arr, a, b)`,
    },
    notes: {
      go: "المصفوفة [4]int قيمة طولها جزء من نوعها وتُنسخ كاملة عند الإسناد، أما slice ([]int) فرأس صغير من ثلاث كلمات: مؤشر وطول وسعة. لهذا تكتب Go في الكود الحقيقي slices في كل مكان تقريباً.",
    },
    steps: [
      { line: null, say: "في Go نوعان للصفوف: المصفوفة، وهي الخانات نفسها، و slice، وهي نافذة على مصفوفة. تابع أين تُكتب كل قيمة فعلاً.", memory: [] },
      { line: 1, say: "arr مصفوفة: أربع خانات int متجاورة في الذاكرة، 8 بايتات لكل خانة. الطول 4 جزء من النوع [4]int ولا يتغير أبداً.", memory: [a0], changed: ["arr"] },
      { line: 2, say: "a لا تنسخ شيئاً. هي رأس من ثلاث كلمات: مؤشر إلى arr[0]، وطول 2 (ما تراه)، وسعة 4 (الخانات المتاحة حتى نهاية المصفوفة).", memory: [a0, h("a", "&arr[0]", 2, 4, "[10 20]")], changed: ["a"] },
      { line: 3, say: "b نافذة ثانية تبدأ من arr[1]، طولها 2 وسعتها 3. الآن a و b تتشاركان الخانة arr[1].", memory: [a0, h("a", "&arr[0]", 2, 4, "[10 20]"), h("b", "&arr[1]", 2, 3, "[20 30]")], changed: ["b"] },
      { line: 4, say: "b[0] تعني: اتبع مؤشر b ثم الخانة 0. هذه هي arr[1]، فتصبح 99. و a ترى التغيير لأنها تطلّ على الخانة نفسها.", memory: [a1, h("a", "&arr[0]", 2, 4, "[10 99]"), h("b", "&arr[1]", 2, 3, "[99 30]")], changed: ["arr", "a", "b"] },
      { line: 5, say: "append يسأل: هل الطول 2 أقل من السعة 4؟ نعم، فيكتب 7 في الخانة التالية arr[2] مكانها، ويرجع رأساً طوله 3. لم يُحجز شيء جديد.", memory: [a2, h("a", "&arr[0]", 3, 4, "[10 99 7]"), h("b", "&arr[1]", 2, 3, "[99 30]")], changed: ["arr", "a"] },
      { line: 5, say: "لكن arr[2] هي أيضاً b[1]! أضفنا إلى a فتغيّر b من [99 30] إلى [99 7]. هذا ما يحدث حين تتشارك شريحتان مصفوفة واحدة.", memory: [a2, h("a", "&arr[0]", 3, 4, "[10 99 7]"), h("b", "&arr[1]", 2, 3, "[99 7]")], changed: ["b"] },
      { line: 6, say: "نريد عنصرين: الطول سيصبح 5 والسعة 4. لا مكان. يحجز append مصفوفة جديدة أكبر (سعتها 8 هنا)، وينسخ إليها 10 99 7، ثم يضيف 8 و 9.", memory: [a2, x("new array", "[10 99 7 8 9 0 0 0]"), h("a", "&new[0]", 5, 8, "[10 99 7 8 9]"), h("b", "&arr[1]", 2, 3, "[99 7]")], changed: ["new array", "a"] },
      { line: 6, say: "انظر إلى المؤشر: a صارت تطلّ على المصفوفة الجديدة، و arr و b بقيتا كما هما. لهذا نكتب دائماً a = append(a, ...): الرأس الراجع قد يشير إلى مكان آخر.", memory: [a2, x("new array", "[10 99 7 8 9 0 0 0]"), h("a", "&new[0]", 5, 8, "[10 99 7 8 9]"), h("b", "&arr[1]", 2, 3, "[99 7]")], read: ["a"] },
      { line: 7, say: "a[0] = 1 يكتب في المصفوفة الجديدة. arr[0] ما زالت 10: الرابط بين a و arr انقطع لحظة النقل.", memory: [a2, x("new array", "[1 99 7 8 9 0 0 0]"), h("a", "&new[0]", 5, 8, "[1 99 7 8 9]"), h("b", "&arr[1]", 2, 3, "[99 7]")], changed: ["new array", "a"] },
      { line: 8, say: "كل slice تطبع ما يقع بين مؤشرها وطولها فقط. السعة الزائدة في المصفوفة الجديدة لا تظهر.", memory: [a2, x("new array", "[1 99 7 8 9 0 0 0]"), h("a", "&new[0]", 5, 8, "[1 99 7 8 9]"), h("b", "&arr[1]", 2, 3, "[99 7]")], read: ["arr", "a", "b"], output: ["[10 99 7 40] [1 99 7 8 9] [99 7]"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "محاكاة لـ slice بـ JavaScript: الرأس كائن فيه arr (المصفوفة التي تحته) و off (أين يبدأ) و len و cap. والدالة append تكتب في المكان إن كان هناك سعة، وإلا تحجز مصفوفة بضعف السعة وتنسخ إليها.",
    starter: `function slice(arr, lo, hi) {
  return { arr: arr, off: lo, len: hi - lo, cap: arr.length - lo };
}
function append(s, v) {
  if (s.len < s.cap) {
    s.arr[s.off + s.len] = v;
    return { arr: s.arr, off: s.off, len: s.len + 1, cap: s.cap };
  }
  let newCap = s.cap * 2;
  if (newCap === 0) newCap = 1;
  let bigger = [];
  for (let i = 0; i < newCap; i++) bigger.push(0);
  for (let i = 0; i < s.len; i++) bigger[i] = s.arr[s.off + i];
  bigger[s.len] = v;
  return { arr: bigger, off: 0, len: s.len + 1, cap: newCap };
}
function show(s) {
  let seen = [];
  for (let i = 0; i < s.len; i++) seen.push(s.arr[s.off + i]);
  return "[" + seen.join(" ") + "] len=" + s.len + " cap=" + s.cap;
}
let backing = [10, 20, 30, 40];
let a = slice(backing, 0, 2);
let b = slice(backing, 1, 3);
a = append(a, 7);
console.log(show(a), show(b));
a = append(a, 8);
a = append(a, 9);
console.log(show(a), show(b));`,
    challenges: [
      "قبل أن تضغط: بعد أول append، ماذا سيرى b؟ ثم شغّل وتحقّق من السطر الأول.",
      "عند أي append انتقلت a إلى مصفوفة جديدة؟ راقب backing في الذاكرة بعد كل سطر.",
      "اجعل a = slice(backing, 0, 4) بدل (0, 2). هل ما زال b يتغيّر بعد append؟ لماذا؟",
      "ابدأ من slice فارغة: let c = slice([], 0, 0)، ثم أضف خمسة عناصر. اكتب السعة بعد كل append قبل أن تشغّل.",
    ],
  },
  predict: [
    {
      question: "b نسخة من المصفوفة a، و s شريحة منها. ماذا يطبع؟",
      code: `a := [3]int{1, 2, 3}
b := a
b[0] = 9
s := a[:]
s[1] = 8
fmt.Println(a, b)`,
      options: ["[1 8 3] [9 2 3]", "[9 8 3] [9 8 3]", "[1 2 3] [9 2 3]"],
      answer: 0,
      why: "إسناد مصفوفة ينسخ خاناتها كلها، فـ b مصفوفة مستقلة. أما a[:] فرأس slice يشير إلى خانات a نفسها، فالكتابة عبر s تصل إلى a.",
      scene: {
        code: {
          go: `a := [3]int{1, 2, 3}
b := a
b[0] = 9
s := a[:]
s[1] = 8
fmt.Println(a, b)`,
        },
        steps: [
          { line: 2, say: "b تأخذ نسخة كاملة من الخانات الثلاث: مصفوفة ثانية في مكان آخر.", memory: [x("a", "[1 2 3]"), x("b", "[1 2 3]")], changed: ["b"], copy: { from: "a", to: "b" } },
          { line: 3, say: "الكتابة في b لا تلمس a.", memory: [x("a", "[1 2 3]"), x("b", "[9 2 3]")], changed: ["b"] },
          { line: 4, say: "s رأس يشير إلى a[0]، طوله 3 وسعته 3. لا نسخ.", memory: [x("a", "[1 2 3]"), x("b", "[9 2 3]"), h("s", "&a[0]", 3, 3, "[1 2 3]")], changed: ["s"] },
          { line: 5, say: "s[1] هي a[1] نفسها، فتصبح 8.", memory: [x("a", "[1 8 3]"), x("b", "[9 2 3]"), h("s", "&a[0]", 3, 3, "[1 8 3]")], changed: ["a", "s"] },
          { line: 6, say: "يطبع [1 8 3] [9 2 3].", memory: [x("a", "[1 8 3]"), x("b", "[9 2 3]"), h("s", "&a[0]", 3, 3, "[1 8 3]")], read: ["a", "b"], output: ["[1 8 3] [9 2 3]"] },
        ],
      },
    },
    {
      question: "head شريحة من أول عنصرين. أضفنا إليها 99. ماذا أصبح في nums؟",
      code: `nums := []int{1, 2, 3, 4}
head := nums[:2]
head = append(head, 99)
fmt.Println(nums)`,
      options: ["[1 2 99 4]", "[1 2 3 4]", "[1 2 3 4 99]"],
      answer: 0,
      why: "head طولها 2 لكن سعتها 4، لأن المصفوفة تحتها تمتد بعدها. append وجد سعة، فكتب 99 في الخانة التالية، وهي nums[2] نفسها. لا شيء يُحجز ولا شيء يُنسخ.",
      scene: {
        code: {
          go: `nums := []int{1, 2, 3, 4}
head := nums[:2]
head = append(head, 99)
fmt.Println(nums)`,
        },
        steps: [
          { line: 2, say: "head رأس يشير إلى الخانة 0، طوله 2 وسعته 4.", memory: [h("nums", "&arr[0]", 4, 4, "[1 2 3 4]"), h("head", "&arr[0]", 2, 4, "[1 2]")], changed: ["head"] },
          { line: 3, say: "الطول 2 أقل من السعة 4، فيُكتب 99 في الخانة 2 مكانها.", memory: [h("nums", "&arr[0]", 4, 4, "[1 2 99 4]"), h("head", "&arr[0]", 3, 4, "[1 2 99]")], changed: ["nums", "head"] },
          { line: 4, say: "nums ترى الخانة نفسها: [1 2 99 4].", memory: [h("nums", "&arr[0]", 4, 4, "[1 2 99 4]"), h("head", "&arr[0]", 3, 4, "[1 2 99]")], read: ["nums"], output: ["[1 2 99 4]"] },
        ],
      },
    },
    {
      question: "الدالة add تكتب في s[0] ثم تضيف عنصراً. ماذا يطبع main؟",
      code: `func add(s []int) {
	s[0] = 100
	s = append(s, 4)
}

nums := []int{1, 2, 3}
add(nums)
fmt.Println(nums, len(nums))`,
      options: ["[100 2 3] 3", "[100 2 3 4] 4", "[1 2 3] 3"],
      answer: 0,
      why: "الدالة تأخذ نسخة من الرأس (مؤشر وطول وسعة)، والمؤشر يدل على المصفوفة نفسها، فـ s[0] = 100 يصل إلى nums. أما append فيغيّر رأس s المحلي فقط (ويحجز مصفوفة جديدة لأن السعة 3 ممتلئة)، ورأس nums في main ما زال طوله 3.",
      scene: {
        code: {
          go: `func add(s []int) {
	s[0] = 100
	s = append(s, 4)
}

nums := []int{1, 2, 3}
add(nums)
fmt.Println(nums, len(nums))`,
        },
        steps: [
          { line: 7, say: "الاستدعاء ينسخ رأس nums إلى s: ثلاث كلمات، والمصفوفة واحدة.", memory: [h("nums", "&arr[0]", 3, 3, "[1 2 3]"), h("s", "&arr[0]", 3, 3, "[1 2 3]")], changed: ["s"], copy: { from: "nums", to: "s" } },
          { line: 2, say: "s[0] هي arr[0]، فيراها nums أيضاً.", memory: [h("nums", "&arr[0]", 3, 3, "[100 2 3]"), h("s", "&arr[0]", 3, 3, "[100 2 3]")], changed: ["nums", "s"] },
          { line: 3, say: "السعة ممتلئة، فيحجز append مصفوفة جديدة. التغيير في رأس s وحده.", memory: [h("nums", "&arr[0]", 3, 3, "[100 2 3]"), h("s", "&new[0]", 4, 6, "[100 2 3 4]")], changed: ["s"] },
          { line: 8, say: "انتهت add واختفى s. رأس nums لم يتغير: [100 2 3] وطول 3.", memory: [h("nums", "&arr[0]", 3, 3, "[100 2 3]")], read: ["nums"], output: ["[100 2 3] 3"] },
        ],
      },
    },
  ],
  code: {
    intro: "شغّل البرنامج وراقب العمودين الأولين: الطول يزيد واحداً كل مرة، والسعة تقفز حين تمتلئ، أي حين يحجز append مصفوفة جديدة وينسخ. ثم جرّب التعديل المقترح في التعليق.",
    runnerLang: "go",
    runnerStarter: `package main

import "fmt"

func main() {
	var s []int // nil slice: no array yet, len 0, cap 0
	for i := 1; i <= 10; i++ {
		s = append(s, i)
		fmt.Println(len(s), cap(s), s)
	}
	// try: s := make([]int, 0, 10) instead of var s []int
	// the capacity is reserved once, so append never has to copy
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "go",
      title: "اجمع الدرجات",
      prompt: "رتّب الأسطر لبرنامج يضيف درجة إلى الشريحة ثم يطبع عدد الدرجات ومجموعها: 3 245.",
      lines: [
        "package main",
        "import \"fmt\"",
        "func main() {",
        "\tscores := []int{70, 85}",
        "\tscores = append(scores, 90)",
        "\ttotal := 0",
        "\tfor _, s := range scores {",
        "\t\ttotal += s",
        "\t}",
        "\tfmt.Println(len(scores), total)",
        "}",
      ],
      expected: "3 245",
    },
    {
      kind: "fill",
      lang: "go",
      title: "اقطع النافذة",
      prompt: "نريد شريحة تبدأ من arr[1] وتطلّ على عنصرين، فيطبع البرنامج [2 3] 2 4. ما الرقم في الفراغ؟",
      template: `package main

import "fmt"

func main() {
	arr := [5]int{1, 2, 3, 4, 5}
	s := arr[1:___]
	fmt.Println(s, len(s), cap(s))
}`,
      options: ["3", "4", "2"],
      answer: "3",
      expected: "[2 3] 2 4",
    },
    {
      kind: "fix",
      lang: "go",
      title: "الخصم أفسد الأسعار الأصلية",
      prompt: "نريد قائمة أسعار مخفّضة دون أن نلمس الأسعار الأصلية، لكن البرنامج يطبع [5 10 15] [5 10 15]. أصلحه ليطبع [10 20 30] [5 10 15].",
      code: `package main

import "fmt"

func main() {
	prices := []int{10, 20, 30}
	discounted := prices
	for i := range discounted {
		discounted[i] = discounted[i] / 2
	}
	fmt.Println(prices, discounted)
}`,
      expected: "[10 20 30] [5 10 15]",
      hint: "discounted := prices تنسخ الرأس فقط، والمصفوفة واحدة. احجز مصفوفة خاصة: discounted := make([]int, len(prices)) ثم copy(discounted, prices).",
      solution: `package main

import "fmt"

func main() {
	prices := []int{10, 20, 30}
	discounted := make([]int, len(prices))
	copy(discounted, prices)
	for i := range discounted {
		discounted[i] = discounted[i] / 2
	}
	fmt.Println(prices, discounted)
}`,
    },
    {
      kind: "write",
      lang: "go",
      title: "مربعات بسعة محجوزة",
      prompt: "الشريحة squares محجوزة بسعة 5 مسبقاً. أضف إليها مربعات الأعداد من 1 إلى 5 بـ append، فيطبع البرنامج [1 4 9 16 25] 5 5.",
      starter: `package main

import "fmt"

func main() {
	squares := make([]int, 0, 5)
	// append i*i for i from 1 to 5
	fmt.Println(squares, len(squares), cap(squares))
}`,
      expected: "[1 4 9 16 25] 5 5",
      hint: "for i := 1; i <= 5; i++ { squares = append(squares, i*i) }. لاحظ أن السعة تبقى 5: لا نسخ أبداً.",
      solution: `package main

import "fmt"

func main() {
	squares := make([]int, 0, 5)
	for i := 1; i <= 5; i++ {
		squares = append(squares, i*i)
	}
	fmt.Println(squares, len(squares), cap(squares))
}`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع هذا الكود؟",
      code: `var s []int
fmt.Println(s == nil, len(s))
s = append(s, 5)
fmt.Println(s, len(s))`,
      options: ["true 0 ثم [5] 1", "البرنامج يتوقف عند append لأن s تساوي nil", "false 0 ثم [5] 1"],
      answer: 0,
      why: "القيمة الصفرية لـ slice رأس فارغ: مؤشر nil وطول 0 وسعة 0. append لا يحتاج مصفوفة موجودة: يرى السعة 0 فيحجز واحدة جديدة.",
    },
    {
      question: "السعة 10 والطول 2. ماذا يحدث؟",
      code: `s := make([]int, 2, 10)
s[5] = 1`,
      options: ["panic: index out of range [5] with length 2", "يكتب 1 في الخانة 5 لأن السعة تتسع لها", "يكبر الطول إلى 6"],
      answer: 0,
      why: "الفهرسة تفحص الطول لا السعة. الخانات بعد الطول محجوزة لكنها خارج النافذة، والطريق الوحيد إليها هو append أو قطع جديد مثل s[:6].",
    },
    {
      question: "نمرّر مصفوفة (لا slice) إلى دالة. ماذا يطبع؟",
      code: `func zero(a [3]int) {
	a[0] = 0
}

arr := [3]int{7, 8, 9}
zero(arr)
fmt.Println(arr)`,
      options: ["[7 8 9]", "[0 8 9]", "خطأ ترجمة"],
      answer: 0,
      why: "المصفوفة قيمة: الاستدعاء ينسخ الخانات الثلاث كلها إلى a. الدالة تعدّل نسختها، و arr في main لم تُلمس.",
    },
    {
      question: "ما طول s وسعتها؟",
      code: `nums := []int{0, 1, 2, 3, 4}
s := nums[1:3]
fmt.Println(len(s), cap(s))`,
      options: ["2 4", "2 5", "3 4"],
      answer: 0,
      why: "الطول = 3 − 1 = 2 (العنصران 1 و 2). والسعة تُعدّ من بداية النافذة حتى نهاية المصفوفة: 5 − 1 = 4.",
    },
    {
      question: "التعبير a[:2:2] يحدّد السعة أيضاً. ماذا يطبع؟",
      code: `a := []int{1, 2, 3, 4}
b := a[:2:2]
b = append(b, 9)
fmt.Println(a, b)`,
      options: ["[1 2 3 4] [1 2 9]", "[1 2 9 4] [1 2 9]", "[1 2 3 4 9] [1 2 9]"],
      answer: 0,
      why: "الرقم الثالث يجعل سعة b تساوي 2. append لا يجد مكاناً فيحجز مصفوفة جديدة، و a تبقى سليمة. هكذا يحمي المحترفون المصفوفة الأصلية حين يسلّمون جزءاً منها لغيرهم.",
    },
  ],
  next: "go-maps",
};
