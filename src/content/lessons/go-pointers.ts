import type { Cell, Lesson } from "@/lib/types";

const x = (name: string, value: string): Cell => ({ name, value, type: "none" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });

const X = (v: number) => n("x @0xc010", v);
const P = x("p @0xc018", "0xc010 (→ x)");
const Q = x("q @0xc020", "0xc010 (→ x)");
const N = x("n @0xc028", "nil");

export const goPointers: Lesson = {
  slug: "go-pointers",
  stage: 0,
  number: "1.10",
  title: "المؤشرات",
  subtitle: "المؤشر متغير قيمته عنوان متغير آخر: به تعطي الدالة الدرج نفسه لا نسخة منه",
  minutes: 17,
  singleLanguage: true,
  problem: {
    title: "الدالة عدّلت نسختها فقط",
    body: "الدالة addPoints تزيد النقاط 10. استدعها مرة بإعطائها القيمة، ومرة بإعطائها العنوان، وراقب درج score في main.",
    demo: "goPointers",
  },
  scene: {
    code: {
      go: `x := 5
p := &x
*p = 8
q := p
*q += 1
var n *int
fmt.Println(x, *p, p == q, n == nil)`,
    },
    notes: {
      go: "في Go المؤشرات صريحة: &x تعطي العنوان، و *p تتبعه، والنوع *int يعني «عنوان int». لكن لا حساب على العناوين (لا p + 1 كما في C)، وجامع القمامة يحرّر الذاكرة، فالمؤشر في Go آمن.",
    },
    steps: [
      { line: null, say: "كل درج في الذاكرة له عنوان، رقم مثل 0xc010. حتى الآن تعاملنا مع الأسماء. المؤشر يجعل العنوان نفسه قيمة تحفظها وتمرّرها.", memory: [] },
      { line: 1, say: "درج x عند العنوان 0xc010 وفيه 5.", memory: [X(5)], changed: ["x @0xc010"] },
      { line: 2, say: "&x تعني «عنوان x». p درج آخر نوعه *int، وقيمته الرقم 0xc010. p لا يحمل 5، يحمل مكان 5.", memory: [X(5), P], changed: ["p @0xc018"], read: ["x @0xc010"] },
      { line: 3, say: "*p تعني «اذهب إلى العنوان الذي في p». يقرأ 0xc010، يذهب إلى ذلك الدرج، ويكتب 8. x تغيّر دون أن نذكر اسمه.", memory: [X(8), P], changed: ["x @0xc010"], read: ["p @0xc018"] },
      { line: 4, say: "q := p ينسخ قيمة p كما ينسخ أي رقم. القيمة عنوان، فصار عندنا مؤشران إلى الدرج نفسه.", memory: [X(8), P, Q], changed: ["q @0xc020"], copy: { from: "p @0xc018", to: "q @0xc020" } },
      { line: 5, say: "*q += 1 يتبع q إلى x، يقرأ 8 ويكتب 9. أي مؤشر يحمل العنوان نفسه يصل إلى الدرج نفسه.", memory: [X(9), P, Q], changed: ["x @0xc010"], read: ["q @0xc020"] },
      { line: 6, say: "القيمة الصفرية لأي مؤشر nil: لا عنوان. القراءة عبره (*n) توقف البرنامج بـ panic، فافحص المؤشر قبل أن تتبعه إن كان قد يكون nil.", memory: [X(9), P, Q, N], changed: ["n @0xc028"] },
      { line: 7, say: "x و *p يقرآن الدرج نفسه: 9 و 9. و p == q يقارن العنوانين: متساويان. و n == nil صحيح.", memory: [X(9), P, Q, N], read: ["x @0xc010", "p @0xc018", "q @0xc020", "n @0xc028"], output: ["9 9 true true"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "محاكاة للذاكرة بـ JavaScript: memory صفّ من الأدراج، والعنوان رقم الخانة. المؤشر عندها مجرد رقم تحفظه في متغير، و memory[p] هي *p في Go.",
    starter: `let memory = [0, 0, 0, 0];
let addrX = 0; // x lives in cell 0
memory[addrX] = 5; // x := 5
let p = addrX; // p := &x (p holds an address: a plain number)
memory[p] = 8; // *p = 8
function inc(ptr) {
  memory[ptr] = memory[ptr] + 1; // *ptr++
}
function incCopy(v) {
  v = v + 1; // only the function's copy changes
}
inc(p); // inc(&x)
incCopy(memory[addrX]); // incCopy(x)
console.log("x =", memory[addrX], "p =", p);`,
    challenges: [
      "قبل أن تضغط: ما قيمة x في النهاية؟ هل غيّرت incCopy شيئاً؟",
      "أضف متغيراً ثانياً y في الخانة 1، ومؤشراً إليه، ثم استدعِ inc عليه مرتين.",
      "اكتب swap(a, b) تأخذ عنوانين وتبدّل محتوى الخانتين، كما تفعل func swap(a, b *int) في Go.",
    ],
  },
  predict: [
    {
      question: "دالتان: واحدة تأخذ قيمة والأخرى عنواناً. ماذا يطبع؟",
      code: `func double(n int) { n *= 2 }
func doublePtr(n *int) { *n *= 2 }

x := 3
double(x)
doublePtr(&x)
fmt.Println(x)`,
      options: ["6", "12", "3"],
      answer: 0,
      why: "double تأخذ نسخة من 3 فتضاعف نسختها وحدها. doublePtr تأخذ عنوان x، فتكتب 6 في درج x نفسه. مرة واحدة فقط وصلت إلى x.",
      scene: {
        code: {
          go: `func double(n int) { n *= 2 }
func doublePtr(n *int) { *n *= 2 }

x := 3
double(x)
doublePtr(&x)
fmt.Println(x)`,
        },
        steps: [
          { line: 5, say: "n نسخة من 3 تصبح 6 ثم تختفي.", memory: [X(3), n("double.n", 6)], changed: ["double.n"] },
          { line: 6, say: "n يحمل 0xc010، و *n *= 2 يكتب 6 في x.", memory: [X(6), x("doublePtr.n", "0xc010 (→ x)")], changed: ["x @0xc010"] },
          { line: 7, say: "x = 6.", memory: [X(6)], read: ["x @0xc010"], output: ["6"] },
        ],
      },
    },
    {
      question: "p مؤشر إلى struct، ثم نسخنا u إلى v. ماذا يطبع؟",
      code: `u := User{Name: "Sara", Age: 20}
p := &u
p.Age = 21
v := u
v.Age = 30
fmt.Println(u.Age, p.Age)`,
      options: ["21 21", "30 30", "21 30"],
      answer: 0,
      why: "p.Age اختصار لـ (*p).Age، فهو يكتب في u. أما v := u فنسخة كاملة من الكتلة، والكتابة فيها لا تصل إلى u ولا إلى p.",
      scene: {
        code: {
          go: `u := User{Name: "Sara", Age: 20}
p := &u
p.Age = 21
v := u
v.Age = 30
fmt.Println(u.Age, p.Age)`,
        },
        steps: [
          { line: 2, say: "p يحمل عنوان الكتلة u.", memory: [x("u @0xc040", "{Sara 20}"), x("p", "0xc040 (→ u)")], changed: ["p"] },
          { line: 3, say: "Go تتبع المؤشر تلقائياً عند الوصول إلى حقل: u صار عمره 21.", memory: [x("u @0xc040", "{Sara 21}"), x("p", "0xc040 (→ u)")], changed: ["u @0xc040"] },
          { line: 5, say: "v كتلة جديدة منسوخة من u، والكتابة فيها وحدها.", memory: [x("u @0xc040", "{Sara 21}"), x("p", "0xc040 (→ u)"), x("v @0xc060", "{Sara 30}")], changed: ["v @0xc060"] },
          { line: 6, say: "u.Age و p.Age الدرج نفسه: 21 21.", memory: [x("u @0xc040", "{Sara 21}"), x("p", "0xc040 (→ u)"), x("v @0xc060", "{Sara 30}")], read: ["u @0xc040", "p"], output: ["21 21"] },
        ],
      },
    },
    {
      question: "مؤشر لم يُعطَ عنواناً. ماذا يحدث؟",
      code: `var p *int
fmt.Println(p == nil)
fmt.Println(*p)`,
      options: ["يطبع true ثم panic: nil pointer dereference", "يطبع true ثم 0", "خطأ ترجمة"],
      answer: 0,
      why: "المترجم يقبل البرنامج، فالخطأ يظهر عند التشغيل. p قيمته nil، و *p تطلب الذهاب إلى «لا عنوان». القيمة الصفرية 0 تخص int، أما المؤشر فقيمته الصفرية nil ولا int خلفه.",
      scene: {
        code: {
          go: `var p *int
fmt.Println(p == nil)
fmt.Println(*p)`,
        },
        steps: [
          { line: 1, say: "p درج نوعه *int، فيه nil.", memory: [x("p", "nil")], changed: ["p"] },
          { line: 2, say: "المقارنة بـ nil آمنة: true.", memory: [x("p", "nil")], read: ["p"], output: ["true"] },
          { line: 3, say: "لا عنوان نذهب إليه.", memory: [x("p", "nil")], output: ["true"], error: "panic: runtime error: invalid memory address or nil pointer dereference" },
        ],
      },
    },
  ],
  code: {
    intro: "المؤشرات في كود Go حقيقي: دالة بناء ترجع *Counter، ودالة تعدّل struct عبر عنوانه. لاحظ أن إرجاع &c من دالة آمن: المترجم يرى أن c يعيش بعد انتهاء الدالة فيضعه في الـ heap بدل المكدّس.",
    runnerLang: "go",
    runnerStarter: `package main

import "fmt"

type Counter struct {
	Name string
	N    int
}

func newCounter(name string) *Counter {
	c := Counter{Name: name}
	return &c // safe: c moves to the heap because it outlives the call
}

func bump(c *Counter, by int) {
	c.N += by // same as (*c).N += by
}

func main() {
	x := 10
	p := &x
	*p = 20
	fmt.Println(x, *p, p != nil)

	c := newCounter("visits")
	bump(c, 3)
	bump(c, 2)
	fmt.Println(c.Name, c.N)
	// try: change bump to take c Counter (no *) and predict the output first
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "go",
      title: "اكتب عبر العنوان",
      prompt: "رتّب الأسطر لبرنامج يأخذ عنوان score ويزيد الدرج 5 عبره، فيطبع 15.",
      lines: [
        "package main",
        "import \"fmt\"",
        "func main() {",
        "\tscore := 10",
        "\tp := &score",
        "\t*p = *p + 5",
        "\tfmt.Println(score)",
        "}",
      ],
      expected: "15",
    },
    {
      kind: "fill",
      lang: "go",
      title: "نوع المعامل",
      prompt: "reset يجب أن تصفّر متغير المستدعي، فيطبع البرنامج 0. ما نوع n؟",
      template: `package main

import "fmt"

func reset(n ___) {
	*n = 0
}

func main() {
	lives := 3
	reset(&lives)
	fmt.Println(lives)
}`,
      options: ["*int", "int", "&int"],
      answer: "*int",
      expected: "0",
    },
    {
      kind: "fix",
      lang: "go",
      title: "التبديل لم يحدث",
      prompt: "swap تبدّل نسختيها فقط، فيطبع البرنامج 1 2. أصلحه حتى تبدّل متغيري main فيطبع 2 1.",
      code: `package main

import "fmt"

func swap(a, b int) {
	a, b = b, a
}

func main() {
	x, y := 1, 2
	swap(x, y)
	fmt.Println(x, y)
}`,
      expected: "2 1",
      hint: "اجعل المعاملين عنوانين: func swap(a, b *int) { *a, *b = *b, *a }، واستدعها بـ swap(&x, &y).",
      solution: `package main

import "fmt"

func swap(a, b *int) {
	*a, *b = *b, *a
}

func main() {
	x, y := 1, 2
	swap(&x, &y)
	fmt.Println(x, y)
}`,
    },
    {
      kind: "write",
      lang: "go",
      title: "الإيداع",
      prompt: "اكتب deposit(acc *Account, amount int) التي تضيف المبلغ إلى رصيد الحساب نفسه، ثم استدعها مرتين (50 ثم 25)، فيطبع البرنامج Sara 175.",
      starter: `package main

import "fmt"

type Account struct {
	Owner   string
	Balance int
}

// write deposit here: it adds amount to the account the pointer points at

func main() {
	acc := Account{Owner: "Sara", Balance: 100}
	// call deposit twice: 50, then 25
	fmt.Println(acc.Owner, acc.Balance)
}`,
      expected: "Sara 175",
      hint: "func deposit(acc *Account, amount int) { acc.Balance += amount }، ثم deposit(&acc, 50) و deposit(&acc, 25).",
      solution: `package main

import "fmt"

type Account struct {
	Owner   string
	Balance int
}

func deposit(acc *Account, amount int) {
	acc.Balance += amount
}

func main() {
	acc := Account{Owner: "Sara", Balance: 100}
	deposit(&acc, 50)
	deposit(&acc, 25)
	fmt.Println(acc.Owner, acc.Balance)
}`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: `a := 1
p := &a
b := *p
b = 5
fmt.Println(a)`,
      options: ["1", "5", "خطأ ترجمة"],
      answer: 0,
      why: "b := *p يقرأ القيمة التي في العنوان (1) وينسخها إلى درج جديد b. b ليس مؤشراً، فالكتابة فيه لا تصل إلى a.",
    },
    {
      question: "مؤشر إلى عنصر في شريحة، ثم append. ماذا يطبع؟",
      code: `s := []int{1, 2} // len 2, cap 2
p := &s[0]
s = append(s, 3)
*p = 100
fmt.Println(s[0])`,
      options: ["1", "100", "panic"],
      answer: 0,
      why: "السعة ممتلئة، فنقل append العناصر إلى مصفوفة جديدة. p ما زال يحمل عنوان الخانة في المصفوفة القديمة، فالكتابة تذهب إلى هناك، و s[0] الجديدة ما زالت 1.",
    },
    {
      question: "دالة ترجع عنوان متغير محلي. ماذا يحدث؟",
      code: `func seven() *int {
	v := 7
	return &v
}

p := seven()
fmt.Println(*p)`,
      options: ["يطبع 7", "panic لأن v اختفى مع انتهاء الدالة", "يطبع قيمة عشوائية"],
      answer: 0,
      why: "في C هذا خطأ خطير، أما Go فتحلّل الكود (escape analysis): ترى أن عنوان v يخرج من الدالة فتضعه في الـ heap، ويبقى حياً ما دام مؤشر يدل عليه.",
    },
    {
      question: "ماذا يطبع؟",
      code: `p := new(int)
*p++
fmt.Println(*p)`,
      options: ["1", "panic لأن p تساوي nil", "خطأ ترجمة"],
      answer: 0,
      why: "new(int) يحجز درج int جديداً بقيمته الصفرية 0 ويرجع عنوانه، فـ p ليس nil. *p++ يزيد الدرج إلى 1.",
    },
    {
      question: "ماذا يطبع؟",
      code: `a, b := 1, 1
fmt.Println(&a == &b, a == b)`,
      options: ["false true", "true true", "false false"],
      answer: 0,
      why: "a و b درجان مختلفان فيهما القيمة نفسها. مقارنة العناوين تسأل «هل هما الدرج نفسه؟» فتعطي false، ومقارنة القيم تعطي true.",
    },
  ],
  next: "go-methods",
};
