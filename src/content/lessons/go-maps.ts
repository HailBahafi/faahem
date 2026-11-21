import type { Cell, Lesson } from "@/lib/types";

const x = (name: string, value: string): Cell => ({ name, value, type: "none" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const b = (name: string, value: boolean): Cell => ({ name, value: String(value), type: "boolean" });
const e = (key: string, value: number): Cell => n(`table#1["${key}"]`, value);

const stock = x("stock", "→ table#1");

export const goMaps: Lesson = {
  slug: "go-maps",
  stage: 0,
  number: "1.7",
  title: "maps",
  subtitle: "جدول تجزئة: المفتاح يُحوَّل إلى رقم دلو، فتصل إلى القيمة بخطوة واحدة مهما كبر الجدول",
  minutes: 16,
  singleLanguage: true,
  problem: {
    title: "ابحث عن السعر",
    body: "مخزن فيه 16 منتجاً. اختر منتجاً، وقارن: كم مقارنة تحتاج القائمة، وكم يحتاج الجدول الذي يحسب مكان المفتاح مباشرة؟",
    demo: "goMaps",
  },
  scene: {
    code: {
      go: `stock := map[string]int{"pen": 3}
stock["book"] = 5
stock["pen"] += 2
n := stock["cup"]
c, ok := stock["cup"]
same := stock
same["cup"] = 1
delete(stock, "book")
fmt.Println(len(stock), stock["cup"], n, c, ok)`,
    },
    notes: {
      go: "map في Go مثل dict في Python و Map في JavaScript، لكن نوع المفتاح ونوع القيمة ثابتان (map[string]int)، والمفتاح المفقود لا يعطي خطأ ولا undefined بل القيمة الصفرية لنوع القيمة.",
    },
    steps: [
      { line: null, say: "map جدول تجزئة يعيش في الذاكرة الديناميكية (heap). المتغير نفسه صغير: مؤشر إلى الجدول. وفي الجدول دلاء (buckets)، لكل مفتاح دلو يُحسب من المفتاح.", memory: [] },
      { line: 1, say: "يُنشأ الجدول #1، ويُحسب hash(\"pen\") فيعطي رقم دلو، فيُخزَّن الزوج pen → 3 هناك. و stock يحمل عنوان الجدول فقط.", memory: [stock, e("pen", 3)], changed: ["stock", 'table#1["pen"]'] },
      { line: 2, say: "مفتاح جديد: hash(\"book\") يدل على دلو، فيُضاف الزوج book → 5. لا بحث في المفاتيح الأخرى: الرقم يقود إلى المكان مباشرة.", memory: [stock, e("pen", 3), e("book", 5)], changed: ['table#1["book"]'] },
      { line: 3, say: "+= يقرأ ثم يكتب: يجد pen بالحساب نفسه، يقرأ 3، ويكتب 5 في المكان نفسه.", memory: [stock, e("pen", 5), e("book", 5)], changed: ['table#1["pen"]'], read: ['table#1["pen"]'] },
      { line: 4, say: "cup غير موجود. Go لا تتوقف ولا ترجع nil: ترجع القيمة الصفرية لـ int، أي 0. و n درج عادي فيه 0.", memory: [stock, e("pen", 5), e("book", 5), n("n", 0)], changed: ["n"] },
      { line: 5, say: "لكن كيف نفرّق بين «غير موجود» و«موجود وقيمته 0»؟ بالصيغة comma ok: القيمة الثانية ok تقول هل وُجد المفتاح. هنا false.", memory: [stock, e("pen", 5), e("book", 5), n("n", 0), n("c", 0), b("ok", false)], changed: ["c", "ok"] },
      { line: 6, say: "same := stock ينسخ المؤشر وحده، لا الجدول. الآن اسمان يشيران إلى الجدول #1 نفسه.", memory: [stock, e("pen", 5), e("book", 5), n("n", 0), n("c", 0), b("ok", false), x("same", "→ table#1")], changed: ["same"], copy: { from: "stock", to: "same" } },
      { line: 7, say: "الكتابة عبر same تذهب إلى الجدول المشترك، فيظهر cup → 1 لـ stock أيضاً.", memory: [stock, e("pen", 5), e("book", 5), e("cup", 1), n("n", 0), n("c", 0), b("ok", false), x("same", "→ table#1")], changed: ['table#1["cup"]'] },
      { line: 8, say: "delete يزيل الزوج book من دلوه. ولو لم يكن موجوداً لما حدث شيء: لا خطأ.", memory: [stock, e("pen", 5), e("cup", 1), n("n", 0), n("c", 0), b("ok", false), x("same", "→ table#1")], changed: ["stock"] },
      { line: 9, say: "في الجدول زوجان، و cup صار 1. أما n و c فأخذا 0 قبل أن يُضاف cup: كل منهما نسخة، لا رابط بالجدول.", memory: [stock, e("pen", 5), e("cup", 1), n("n", 0), n("c", 0), b("ok", false), x("same", "→ table#1")], read: ["stock", 'table#1["cup"]', "n", "c", "ok"], output: ["2 1 0 0 false"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "محاكاة لجدول تجزئة بـ JavaScript: أربعة دلاء، ودالة hash تجمع ترتيب الحروف في الأبجدية (a = 1) وتأخذ الباقي على عدد الدلاء. set تضع الزوج في دلوه، و get تبحث في دلو واحد فقط وترجع القيمة ومعها ok كما في Go.",
    starter: `let buckets = [[], [], [], []];
let letters = "abcdefghijklmnopqrstuvwxyz";
function hash(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = h + letters.indexOf(key[i]) + 1;
  }
  return h % buckets.length;
}
function set(key, value) {
  let bucket = buckets[hash(key)];
  for (let pair of bucket) {
    if (pair.key === key) {
      pair.value = value;
      return;
    }
  }
  bucket.push({ key: key, value: value });
}
function get(key) {
  let bucket = buckets[hash(key)];
  for (let pair of bucket) {
    if (pair.key === key) return { value: pair.value, ok: true };
  }
  return { value: 0, ok: false };
}
set("pen", 3);
set("book", 5);
set("pen", 4);
let r = get("cup");
console.log("pen in bucket", hash("pen"), "book in bucket", hash("book"));
console.log("cup:", r.value, r.ok);`,
    challenges: [
      "قبل أن تضغط: كم زوجاً سيكون في الجدول بعد set(\"pen\", 4)؟ اثنان أم ثلاثة؟",
      "أضف set(\"nep\", 9). في أي دلو يقع؟ لماذا وقع مع pen؟ (الحروف نفسها، فالمجموع نفسه)",
      "أضف مفاتيح كثيرة حتى يطول أحد الدلاء. ماذا يحدث لعدد المقارنات في get؟ لهذا يكبّر Go الجدول حين تمتلئ دلاؤه.",
      "غيّر عدد الدلاء إلى 8 بإضافة أربعة [] وتوقّع أين ينتقل pen.",
    ],
  },
  predict: [
    {
      question: "Omar غير موجود في الجدول، ونزيده بواحد. ماذا يطبع؟",
      code: `ages := map[string]int{"Sara": 20}
ages["Omar"]++
fmt.Println(ages["Omar"], len(ages))`,
      options: ["1 2", "panic: key not found", "0 1"],
      answer: 0,
      why: "قراءة مفتاح مفقود تعطي 0، ثم ++ تكتب 1 تحت المفتاح Omar فيُضاف إلى الجدول. هذا هو أسلوب العدّ المعتاد في Go: counts[word]++ دون أي فحص.",
      scene: {
        code: {
          go: `ages := map[string]int{"Sara": 20}
ages["Omar"]++
fmt.Println(ages["Omar"], len(ages))`,
        },
        steps: [
          { line: 1, say: "جدول فيه زوج واحد.", memory: [x("ages", "→ table#1"), n('table#1["Sara"]', 20)], changed: ["ages"] },
          { line: 2, say: "ages[\"Omar\"] تُقرأ 0 (قيمة صفرية)، ثم يُكتب 0 + 1 تحت مفتاح جديد.", memory: [x("ages", "→ table#1"), n('table#1["Sara"]', 20), n('table#1["Omar"]', 1)], changed: ['table#1["Omar"]'] },
          { line: 3, say: "زوجان في الجدول: 1 2.", memory: [x("ages", "→ table#1"), n('table#1["Sara"]', 20), n('table#1["Omar"]', 1)], read: ['table#1["Omar"]'], output: ["1 2"] },
        ],
      },
    },
    {
      question: "b := a ثم نكتب في b. ماذا يطبع a[\"x\"]؟",
      code: `a := map[string]int{"x": 1}
b := a
b["x"] = 9
fmt.Println(a["x"])`,
      options: ["9", "1", "خطأ ترجمة: لا يمكن نسخ map"],
      answer: 0,
      why: "متغير map يحمل مؤشراً إلى الجدول. الإسناد ينسخ المؤشر، فـ a و b اسمان لجدول واحد. لنسخة مستقلة تُنشئ جدولاً جديداً وتنسخ الأزواج بحلقة (أو maps.Clone).",
      scene: {
        code: {
          go: `a := map[string]int{"x": 1}
b := a
b["x"] = 9
fmt.Println(a["x"])`,
        },
        steps: [
          { line: 2, say: "b يأخذ نسخة من المؤشر: الجدول واحد.", memory: [x("a", "→ table#1"), n('table#1["x"]', 1), x("b", "→ table#1")], changed: ["b"], copy: { from: "a", to: "b" } },
          { line: 3, say: "الكتابة تذهب إلى الجدول #1.", memory: [x("a", "→ table#1"), n('table#1["x"]', 9), x("b", "→ table#1")], changed: ['table#1["x"]'] },
          { line: 4, say: "a يقرأ من الجدول نفسه: 9.", memory: [x("a", "→ table#1"), n('table#1["x"]', 9), x("b", "→ table#1")], read: ['table#1["x"]'], output: ["9"] },
        ],
      },
    },
    {
      question: "m معرَّف بـ var ولم يُنشأ له جدول. ماذا يحدث؟",
      code: `var m map[string]int
fmt.Println(m["k"], len(m))
m["k"] = 1`,
      options: ["يطبع 0 0 ثم panic: assignment to entry in nil map", "يطبع 0 0 ثم يضيف k بهدوء", "panic عند السطر 2"],
      answer: 0,
      why: "القيمة الصفرية لـ map مؤشر nil: لا جدول أصلاً. القراءة منه آمنة وتعطي القيم الصفرية، لكن الكتابة تحتاج جدولاً حقيقياً تكتب فيه. أنشئه بـ make(map[string]int) أو map[string]int{}.",
      scene: {
        code: {
          go: `var m map[string]int
fmt.Println(m["k"], len(m))
m["k"] = 1`,
        },
        steps: [
          { line: 1, say: "m مؤشر nil: لا جدول في الذاكرة.", memory: [x("m", "nil")], changed: ["m"] },
          { line: 2, say: "القراءة من لا شيء تعطي الصفر، والطول 0.", memory: [x("m", "nil")], read: ["m"], output: ["0 0"] },
          { line: 3, say: "الكتابة تبحث عن دلو في جدول غير موجود.", memory: [x("m", "nil")], output: ["0 0"], error: "panic: assignment to entry in nil map" },
        ],
      },
    },
  ],
  code: {
    intro: "عدّاد كلمات حقيقي: counts[w]++ لكل كلمة. وبما أن ترتيب الدوران على map عشوائي عمداً، نجمع المفاتيح في شريحة ونرتّبها قبل الطباعة. شغّله، ثم غيّر النص.",
    runnerLang: "go",
    runnerStarter: `package main

import (
	"fmt"
	"sort"
	"strings"
)

func main() {
	text := "go is fun and go is fast"
	counts := make(map[string]int)
	for _, w := range strings.Fields(text) {
		counts[w]++ // a missing word reads as 0
	}
	keys := make([]string, 0, len(counts))
	for k := range counts {
		keys = append(keys, k)
	}
	sort.Strings(keys) // map order is random: sort to print in a fixed order
	for _, k := range keys {
		fmt.Println(k, counts[k])
	}
	if n, ok := counts["slow"]; !ok {
		fmt.Println("slow is missing, n =", n)
	}
	// try: print inside the "for k := range counts" loop and run twice
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "go",
      title: "مخزن صغير",
      prompt: "رتّب الأسطر لبرنامج يُنشئ map، يضع pen بكمية 3، ثم يزيدها 2، فيطبع 5 1.",
      lines: [
        "package main",
        "import \"fmt\"",
        "func main() {",
        "\tstock := map[string]int{}",
        "\tstock[\"pen\"] = 3",
        "\tstock[\"pen\"] += 2",
        "\tfmt.Println(stock[\"pen\"], len(stock))",
        "}",
      ],
      expected: "5 1",
    },
    {
      kind: "fill",
      lang: "go",
      title: "موجود وقيمته صفر",
      prompt: "cup موجود في الجدول لكن سعره 0. أي شرط يطبع cup is listed؟",
      template: `package main

import "fmt"

func main() {
	prices := map[string]int{"pen": 3, "cup": 0}
	if _, ok := prices["cup"]; ___ {
		fmt.Println("cup is listed")
	} else {
		fmt.Println("no cup")
	}
}`,
      options: ["ok", "!ok", "prices[\"cup\"] > 0"],
      answer: "ok",
      expected: "cup is listed",
    },
    {
      kind: "fix",
      lang: "go",
      title: "عدّاد الزيارات ينهار",
      prompt: "البرنامج يعدّ زيارات كل صفحة لكنه يتوقف بـ panic. أصلحه ليطبع 2 1.",
      code: `package main

import "fmt"

func main() {
	var visits map[string]int
	for _, page := range []string{"home", "about", "home"} {
		visits[page]++
	}
	fmt.Println(visits["home"], visits["about"])
}`,
      expected: "2 1",
      hint: "var visits map[string]int يترك المؤشر nil. أنشئ الجدول: visits := make(map[string]int).",
      solution: `package main

import "fmt"

func main() {
	visits := make(map[string]int)
	for _, page := range []string{"home", "about", "home"} {
		visits[page]++
	}
	fmt.Println(visits["home"], visits["about"])
}`,
    },
    {
      kind: "write",
      lang: "go",
      title: "الفائز في التصويت",
      prompt: "عُدّ أصوات كل اسم في map، ثم ابحث عن صاحب أكثر الأصوات واطبع اسمه وعدد أصواته: Sara 3.",
      starter: `package main

import "fmt"

func main() {
	votes := []string{"Sara", "Omar", "Sara", "Lina", "Sara", "Omar"}
	// 1. count votes in a map[string]int
	// 2. loop over the map and keep the best name and count
	fmt.Println(votes[0], 0)
}`,
      expected: "Sara 3",
      hint: "counts := map[string]int{}; for _, v := range votes { counts[v]++ }. ثم best, most := \"\", 0 وحلقة for name, c := range counts { if c > most { best, most = name, c } }.",
      solution: `package main

import "fmt"

func main() {
	votes := []string{"Sara", "Omar", "Sara", "Lina", "Sara", "Omar"}
	counts := map[string]int{}
	for _, v := range votes {
		counts[v]++
	}
	best, most := "", 0
	for name, c := range counts {
		if c > most {
			best, most = name, c
		}
	}
	fmt.Println(best, most)
}`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `m := map[string]int{"a": 1, "b": 2, "c": 3}
for k := range m {
	fmt.Print(k)
}`,
      options: ["الأحرف الثلاثة بترتيب قد يختلف من تشغيل لآخر", "abc دائماً", "cba دائماً"],
      answer: 0,
      why: "الدلاء مرتّبة حسب hash لا حسب الإدخال، و Go تبدأ الدوران من موضع عشوائي عمداً حتى لا يعتمد أحد على ترتيب. إن احتجت ترتيباً فرتّب المفاتيح في شريحة.",
    },
    {
      question: "ماذا يطبع؟",
      code: `m := map[string]int{"a": 1}
delete(m, "zzz")
delete(m, "a")
fmt.Println(len(m), m["a"])`,
      options: ["0 0", "panic لأن zzz غير موجود", "1 1"],
      answer: 0,
      why: "حذف مفتاح غير موجود لا يفعل شيئاً. بعد حذف a يصبح الجدول فارغاً، وقراءة a تعطي القيمة الصفرية 0.",
    },
    {
      question: "الدالة تكتب في map مُمرَّر إليها. ماذا يطبع main؟",
      code: `func reset(m map[string]int) {
	m["x"] = 0
}

scores := map[string]int{"x": 7}
reset(scores)
fmt.Println(scores["x"])`,
      options: ["0", "7", "خطأ ترجمة"],
      answer: 0,
      why: "الاستدعاء ينسخ المتغير، والمتغير مؤشر إلى الجدول. m في الدالة و scores في main يشيران إلى الجدول نفسه، فالكتابة تُرى من الطرفين.",
    },
    {
      question: "ماذا يطبع عدّاد الحروف هذا؟",
      code: `counts := map[rune]int{}
for _, r := range "banana" {
	counts[r]++
}
fmt.Println(counts['a'], counts['n'], len(counts))`,
      options: ["3 2 3", "3 2 6", "1 1 3"],
      answer: 0,
      why: "كل حرف مفتاح، والتكرار يزيد العدد تحت المفتاح نفسه. في banana ثلاثة a واثنان n وواحد b، فثلاثة مفاتيح مختلفة.",
    },
    {
      question: "أي سطر لا يُترجَم؟",
      code: `type Grid map[[2]int]string   // 1
type Tags map[string][]int    // 2
type Bad map[[]int]string     // 3`,
      options: ["السطر 3", "السطر 1", "السطر 2"],
      answer: 0,
      why: "المفتاح يجب أن يُقارن بـ == حتى يُعرف إن كان موجوداً. المصفوفة [2]int تُقارن خانة بخانة، أما slice فلا تُقارن، فلا تصلح مفتاحاً. والقيمة يمكن أن تكون أي نوع، حتى slice.",
    },
  ],
  next: "go-strings",
};
