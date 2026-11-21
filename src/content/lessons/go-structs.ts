import type { Cell, Lesson } from "@/lib/types";

const x = (name: string, value: string): Cell => ({ name, value, type: "none" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

const T = x("Point", "struct{ X int; Y int } (16 bytes)");
const P = [n("p.X", 1), n("p.Y", 2)];
const Q = [n("q.X", 10), n("q.Y", 2)];

export const goStructs: Lesson = {
  slug: "go-structs",
  stage: 0,
  number: "1.9",
  title: "structs",
  subtitle: "struct يجمع الحقول المترابطة في كتلة واحدة متجاورة في الذاكرة، ويُنسخ كاملاً كأي قيمة",
  minutes: 16,
  singleLanguage: true,
  problem: {
    title: "رتّبت الأعمار فاختلطت البيانات",
    body: "بيانات الطلاب في ثلاث شرائح منفصلة: الأسماء والأعمار والمدن. رتّبها حسب العمر، ثم جرّب الشيء نفسه وكل طالب في struct واحد.",
    demo: "goStructs",
  },
  scene: {
    code: {
      go: `type Point struct{ X, Y int }
p := Point{X: 1, Y: 2}
q := p
q.X = 10
pts := []Point{p, q}
for _, pt := range pts {
	pt.Y = 0
}
pts[1].Y = 7
fmt.Println(p, q, pts)`,
    },
    notes: {
      go: "struct في Go قيمة مثل int، لا كائن مرجعي كما في JavaScript أو Python: الإسناد والتمرير إلى دالة ينسخان الحقول كلها. لا أصناف ولا وراثة؛ الدوال المرتبطة بالنوع (methods) تأتي في الدرس التالي.",
    },
    steps: [
      { line: null, say: "struct نوع جديد تصنعه من حقول. والقيمة منه كتلة واحدة: الحقول متجاورة في الذاكرة، بلا مؤشرات بينها.", memory: [] },
      { line: 1, say: "Point قالب: حقلان int، كل واحد 8 بايتات، فكل Point كتلة من 16 بايتاً. لا شيء حُجز بعد.", memory: [T], changed: ["Point"] },
      { line: 2, say: "p كتلة من 16 بايتاً: X في أولها و Y بعدها مباشرة. كتابة أسماء الحقول (X: 1) تجعل الكود واضحاً ولا ينكسر إن أضفت حقلاً لاحقاً.", memory: [T, ...P], changed: ["p.X", "p.Y"] },
      { line: 3, say: "q := p ينسخ الكتلة كلها، 16 بايتاً، إلى مكان جديد. q ليس اسماً آخر لـ p: إنه نقطة ثانية مستقلة.", memory: [T, ...P, n("q.X", 1), n("q.Y", 2)], changed: ["q.X", "q.Y"], copy: { from: "p.X", to: "q.X" } },
      { line: 4, say: "q.X = 10 يكتب في كتلة q وحدها. p ما زالت {1 2}.", memory: [T, ...P, ...Q], changed: ["q.X"] },
      { line: 5, say: "الشريحة تحجز مصفوفة من نقطتين متجاورتين (32 بايتاً)، وتُنسخ p و q إلى خاناتها. pts[0] نسخة ثالثة من p.", memory: [T, ...P, ...Q, x("pts", "[{1 2} {10 2}]")], changed: ["pts"] },
      { line: 7, say: "range ينسخ كل عنصر إلى المتغير pt. الكتابة pt.Y = 0 تصيب النسخة، لا الخانة في الشريحة.", memory: [T, ...P, ...Q, x("pts", "[{1 2} {10 2}]"), x("pt", "{10 0} (copy of pts[1])")], changed: ["pt"] },
      { line: 8, say: "انتهت الحلقة واختفى pt، ومعه كل ما كتبناه فيه. pts لم تتغير.", memory: [T, ...P, ...Q, x("pts", "[{1 2} {10 2}]")], read: ["pts"] },
      { line: 9, say: "pts[1].Y يكتب في الخانة نفسها داخل مصفوفة الشريحة. هكذا تعدّل عنصراً في شريحة: بالفهرس.", memory: [T, ...P, ...Q, x("pts", "[{1 2} {10 7}]")], changed: ["pts"] },
      { line: 10, say: "أربع كتل مستقلة: p و q والخانتان. لم تتغير واحدة منها بسبب أخرى.", memory: [T, ...P, ...Q, x("pts", "[{1 2} {10 7}]")], read: ["p.X", "p.Y", "q.X", "q.Y", "pts"], output: ["{1 2} {10 2} [{1 2} {10 7}]"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "في JavaScript يشير المتغيران إلى الكائن نفسه، أما struct في Go فيُنسخ. هذه المحاكاة تكتب copyPoint التي تفعل ما يفعله q := p في Go، وتقارنها بالإسناد العادي في JavaScript.",
    starter: `function copyPoint(p) {
  return { X: p.X, Y: p.Y };
}
let p = { X: 1, Y: 2 };
let q = copyPoint(p); // Go: q := p copies every field
q.X = 10;
let shared = p; // JS sharing: Go needs a pointer for this (next lesson)
shared.Y = 99;
let pts = [copyPoint(p), copyPoint(q)];
for (let i = 0; i < pts.length; i++) {
  let pt = copyPoint(pts[i]); // Go: for _, pt := range pts
  pt.Y = 0;
}
console.log(p.X, p.Y, q.X, q.Y);
console.log(pts[0].Y, pts[1].Y);`,
    challenges: [
      "قبل أن تضغط: ما قيمة p.Y في السطر الأول من الناتج؟ ولماذا لم يتأثر q؟",
      "داخل الحلقة استبدل let pt = copyPoint(pts[i]) بـ let pt = pts[i]. ماذا يتغير في السطر الثاني؟ هذا ما لا يحدث في Go مع range.",
      "أضف حقلاً ثالثاً Z إلى p، وعدّل copyPoint حتى تنسخه أيضاً. في Go لا تحتاج هذا: الإسناد ينسخ كل الحقول تلقائياً.",
    ],
  },
  predict: [
    {
      question: "الحلقة تزيد عمر كل مستخدم. ماذا يطبع؟",
      code: `type User struct {
	Name string
	Age  int
}
users := []User{{"Sara", 20}, {"Omar", 30}}
for _, u := range users {
	u.Age++
}
fmt.Println(users)`,
      options: ["[{Sara 20} {Omar 30}]", "[{Sara 21} {Omar 31}]", "خطأ ترجمة"],
      answer: 0,
      why: "u نسخة من العنصر، تُكتب فيها الزيادة ثم تُرمى. للتعديل اكتب بالفهرس: for i := range users { users[i].Age++ }.",
      scene: {
        code: {
          go: `type User struct {
	Name string
	Age  int
}
users := []User{{"Sara", 20}, {"Omar", 30}}
for _, u := range users {
	u.Age++
}
fmt.Println(users)`,
        },
        steps: [
          { line: 5, say: "مصفوفة الشريحة فيها كتلتان User متجاورتان.", memory: [x("users", "[{Sara 20} {Omar 30}]")], changed: ["users"] },
          { line: 7, say: "u نسخة من users[0]، تصبح 21. الخانة الأصلية ما زالت 20.", memory: [x("users", "[{Sara 20} {Omar 30}]"), x("u", "{Sara 21}")], changed: ["u"] },
          { line: 7, say: "الدورة الثانية: u نسخة من users[1]، تصبح 31.", memory: [x("users", "[{Sara 20} {Omar 30}]"), x("u", "{Omar 31}")], changed: ["u"] },
          { line: 9, say: "الشريحة لم تُلمس.", memory: [x("users", "[{Sara 20} {Omar 30}]")], read: ["users"], output: ["[{Sara 20} {Omar 30}]"] },
        ],
      },
    },
    {
      question: "نمرّر struct إلى دالة تزيد العمر. ماذا يطبع main؟",
      code: `func birthday(u User) {
	u.Age++
}

u := User{Name: "Lina", Age: 25}
birthday(u)
fmt.Println(u.Age)`,
      options: ["25", "26", "خطأ ترجمة"],
      answer: 0,
      why: "التمرير إسناد: الدالة تأخذ نسخة من الكتلة كلها. لتعدّل الأصل تمرّر عنوانه، وهذا موضوع الدرس التالي (المؤشرات).",
      scene: {
        code: {
          go: `func birthday(u User) {
	u.Age++
}

u := User{Name: "Lina", Age: 25}
birthday(u)
fmt.Println(u.Age)`,
        },
        steps: [
          { line: 6, say: "الاستدعاء ينسخ {Lina 25} إلى إطار الدالة.", memory: [x("main.u", "{Lina 25}"), x("birthday.u", "{Lina 25}")], changed: ["birthday.u"], copy: { from: "main.u", to: "birthday.u" } },
          { line: 2, say: "الزيادة في نسخة الدالة.", memory: [x("main.u", "{Lina 25}"), x("birthday.u", "{Lina 26}")], changed: ["birthday.u"] },
          { line: 7, say: "انتهت الدالة واختفت نسختها. u في main: 25.", memory: [x("main.u", "{Lina 25}")], read: ["main.u"], output: ["25"] },
        ],
      },
    },
    {
      question: "نقطتان منفصلتان بالقيم نفسها. ماذا تطبع المقارنة؟",
      code: `type Point struct{ X, Y int }
a := Point{1, 2}
b := Point{1, 2}
fmt.Println(a == b)`,
      options: ["true", "false", "خطأ ترجمة: لا تُقارن structs"],
      answer: 0,
      why: "في JavaScript يقارن == بين عنوانين فيعطي false، أما في Go فـ struct قيمة: == يقارن الحقول حقلاً حقلاً. يعمل هذا ما دامت كل الحقول قابلة للمقارنة (لا slices ولا maps).",
      scene: {
        code: {
          go: `type Point struct{ X, Y int }
a := Point{1, 2}
b := Point{1, 2}
fmt.Println(a == b)`,
        },
        steps: [
          { line: 3, say: "كتلتان في مكانين مختلفين بالمحتوى نفسه.", memory: [n("a.X", 1), n("a.Y", 2), n("b.X", 1), n("b.Y", 2)], changed: ["b.X", "b.Y"] },
          { line: 4, say: "X مع X و Y مع Y: متساويان، فالنتيجة true.", memory: [n("a.X", 1), n("a.Y", 2), n("b.X", 1), n("b.Y", 2)], read: ["a.X", "a.Y", "b.X", "b.Y"], output: ["true"] },
        ],
      },
    },
  ],
  code: {
    intro: "نوع Product حقيقي، وشريحة منه، ودالة تحسب قيمة المخزون. لاحظ items[0].Stock -= 4 بالفهرس، و %+v الذي يطبع أسماء الحقول مع قيمها، والقيمة الصفرية لـ struct كامل.",
    runnerLang: "go",
    runnerStarter: `package main

import "fmt"

type Product struct {
	Name  string
	Price int
	Stock int
}

func totalValue(items []Product) int {
	total := 0
	for _, p := range items {
		total += p.Price * p.Stock
	}
	return total
}

func main() {
	items := []Product{
		{Name: "Pen", Price: 3, Stock: 10},
		{Name: "Book", Price: 25, Stock: 2},
	}
	items[0].Stock -= 4 // writes into the slice's own element

	var empty Product // every field starts at its zero value
	fmt.Printf("%+v\\n", empty)
	fmt.Printf("%+v\\n", items[0])
	fmt.Println(totalValue(items))
	// try: inside totalValue set p.Stock = 0 and check that items is unchanged
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "go",
      title: "كتاب",
      prompt: "رتّب الأسطر لبرنامج يعرّف النوع Book، وينشئ كتاباً، ويزيد صفحاته 20، فيطبع Go 320.",
      lines: [
        "package main",
        "import \"fmt\"",
        "type Book struct {",
        "\tTitle string",
        "\tPages int",
        "}",
        "func main() {",
        "\tb := Book{Title: \"Go\", Pages: 300}",
        "\tb.Pages += 20",
        "\tfmt.Println(b.Title, b.Pages)",
        "}",
      ],
      expected: "Go 320",
    },
    {
      kind: "fill",
      lang: "go",
      title: "عدّل داخل الشريحة",
      prompt: "نريد زيادة عمر كل مستخدم في الشريحة نفسها، فيطبع 21 31. ماذا يوضع في الفراغ؟",
      template: `package main

import "fmt"

type User struct {
	Name string
	Age  int
}

func main() {
	users := []User{{"Sara", 20}, {"Omar", 30}}
	for i := range users {
		___ += 1
	}
	fmt.Println(users[0].Age, users[1].Age)
}`,
      options: ["users[i].Age", "i", "User.Age"],
      answer: "users[i].Age",
      expected: "21 31",
    },
    {
      kind: "fix",
      lang: "go",
      title: "الخصم لم يُطبَّق",
      prompt: "نريد خصم 10% من سعر كل منتج في السلة، لكن البرنامج يطبع الأسعار كما هي. أصلحه ليطبع [{Pen 9} {Book 45}].",
      code: `package main

import "fmt"

type Item struct {
	Name  string
	Price int
}

func main() {
	cart := []Item{{"Pen", 10}, {"Book", 50}}
	for _, it := range cart {
		it.Price = it.Price * 9 / 10
	}
	fmt.Println(cart)
}`,
      expected: "[{Pen 9} {Book 45}]",
      hint: "it نسخة. اكتب في الخانة نفسها بالفهرس: for i := range cart { cart[i].Price = cart[i].Price * 9 / 10 }.",
      solution: `package main

import "fmt"

type Item struct {
	Name  string
	Price int
}

func main() {
	cart := []Item{{"Pen", 10}, {"Book", 50}}
	for i := range cart {
		cart[i].Price = cart[i].Price * 9 / 10
	}
	fmt.Println(cart)
}`,
    },
    {
      kind: "write",
      lang: "go",
      title: "أكبر مستطيل",
      prompt: "أكمل area لتحسب مساحة المستطيل، ثم احفظ في best المستطيل صاحب أكبر مساحة، فيطبع البرنامج 12 {3 4}.",
      starter: `package main

import "fmt"

type Rect struct {
	W, H int
}

func area(r Rect) int {
	// width times height
	return 0
}

func main() {
	rects := []Rect{{2, 3}, {3, 4}, {1, 5}}
	best := rects[0]
	// loop over rects and keep the one with the largest area in best
	fmt.Println(area(best), best)
}`,
      expected: "12 {3 4}",
      hint: "return r.W * r.H. ثم for _, r := range rects { if area(r) > area(best) { best = r } }: هنا النسخ هو ما نريده بالضبط.",
      solution: `package main

import "fmt"

type Rect struct {
	W, H int
}

func area(r Rect) int {
	return r.W * r.H
}

func main() {
	rects := []Rect{{2, 3}, {3, 4}, {1, 5}}
	best := rects[0]
	for _, r := range rects {
		if area(r) > area(best) {
			best = r
		}
	}
	fmt.Println(area(best), best)
}`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: `var u User // struct{ Name string; Age int }
fmt.Println(u.Name == "", u.Age)`,
      options: ["true 0", "panic: u is nil", "false 0"],
      answer: 0,
      why: "var يحجز الكتلة كاملة ويملأ كل حقل بقيمته الصفرية: نص فارغ وصفر. struct ليس مؤشراً، فلا يوجد struct يساوي nil.",
    },
    {
      question: "مصفوفة structs تُنسخ. ماذا يطبع؟",
      code: `a := [2]Point{{1, 1}, {2, 2}}
b := a
b[0].X = 9
fmt.Println(a[0].X)`,
      options: ["1", "9", "خطأ ترجمة"],
      answer: 0,
      why: "المصفوفة قيمة، وعناصرها structs قيم: b := a ينسخ 32 بايتاً كاملة. الكتابة في b لا تصل إلى a.",
    },
    {
      question: "شريحة structs. ماذا يطبع؟",
      code: `s := []Point{{1, 1}}
t := s
t[0].X = 9
fmt.Println(s[0].X)`,
      options: ["9", "1", "خطأ ترجمة"],
      answer: 0,
      why: "t := s ينسخ رأس الشريحة فقط، والرأسان يشيران إلى المصفوفة نفسها. t[0] و s[0] خانة واحدة.",
    },
    {
      question: "struct فيه شريحة. نسخناه وعدّلنا النسخة. ماذا يطبع؟",
      code: `type Team struct {
	Name   string
	Scores []int
}
a := Team{"A", []int{1, 2}}
b := a
b.Name = "B"
b.Scores[0] = 100
fmt.Println(a.Name, a.Scores)`,
      options: ["A [100 2]", "A [1 2]", "B [100 2]"],
      answer: 0,
      why: "النسخ ينسخ الحقول كما هي: Name نص مستقل، أما Scores فرأس شريحة يُنسخ ومؤشره ما زال يدل على المصفوفة نفسها. النسخة «سطحية»: الكتلة جديدة، وما تشير إليه مشترك.",
    },
    {
      question: "ماذا تطبع %+v؟",
      code: `type Point struct{ X, Y int }
fmt.Printf("%+v\\n", Point{X: 1})`,
      options: ["{X:1 Y:0}", "{1}", "{X:1}"],
      answer: 0,
      why: "الحقل الذي لا تذكره يأخذ قيمته الصفرية، فـ Y موجود وقيمته 0. و %+v يطبع اسم كل حقل بجانب قيمته، وهو مفيد جداً عند تتبّع الأخطاء.",
    },
  ],
  next: "go-pointers",
};
