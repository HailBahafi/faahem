import type { Cell, Lesson } from "@/lib/types";

const x = (name: string, value: string): Cell => ({ name, value, type: "none" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });

const str = x("s", "{ptr: &bytes[0], len: 5}");
const bytes = x("bytes (read-only)", "63 61 66 C3 A9");
const base = [str, bytes];
const loop = (i: number, r: string, out: string[]) => ({
  memory: [...base, n("i", i), s("r", r)],
  output: out,
});

export const goStrings: Lesson = {
  slug: "go-strings",
  stage: 0,
  number: "1.8",
  title: "النصوص و runes",
  subtitle: "النص صفّ بايتات UTF-8 لا يتغيّر، والحرف الواحد قد يشغل أكثر من بايت",
  minutes: 17,
  singleLanguage: true,
  problem: {
    title: "كم حرفاً في الكلمة؟",
    body: "اختر كلمة وانظر إلى بايتاتها الحقيقية في الذاكرة. ثم اعكسها مرة بايتاً بايتاً ومرة حرفاً حرفاً، وقارن النتيجتين.",
    demo: "goStrings",
  },
  scene: {
    code: {
      go: `s := "café"
fmt.Println(len(s))
fmt.Println(s[3])
for i, r := range s {
	fmt.Println(i, string(r))
}
rs := []rune(s)
fmt.Println(len(rs), string(rs[3]))`,
    },
    notes: {
      go: "النص في Go بايتات UTF-8، و len يعدّ البايتات. الحرف بمعناه البشري هو rune (اسم آخر لـ int32): رقم رمزه في Unicode. range على نص يفكّ البايتات إلى runes، والفهرسة s[i] تعطي بايتاً واحداً.",
    },
    steps: [
      { line: null, say: "الحاسوب لا يخزّن حروفاً بل أرقاماً. Go تخزّن النص بترميز UTF-8: الحروف الإنجليزية بايت واحد، و é بايتان، والحروف العربية بايتان، والرموز التعبيرية أربعة.", memory: [] },
      { line: 1, say: "تُكتب البايتات الخمسة في منطقة للقراءة فقط: c a f ثم C3 A9 معاً تعني é. و s رأس من كلمتين: مؤشر إلى البايتات وطول.", memory: base, changed: ["s", "bytes (read-only)"] },
      { line: 2, say: "len يقرأ الطول من الرأس مباشرة: 5 بايتات، لا 4 حروف. لا عدّ ولا مرور على النص.", memory: base, read: ["s"], output: ["5"] },
      { line: 3, say: "s[3] بايت واحد، لا حرف: أول بايتي é، وقيمته C3 أي 195. الفهرسة في Go بالبايت دائماً.", memory: base, read: ["bytes (read-only)"], output: ["5", "195"] },
      { line: 5, say: "range يفكّ UTF-8: في كل دورة يقرأ حرفاً كاملاً. i موضع أول بايت فيه، و r رقمه (rune). أول حرف c عند 0.", ...loop(0, "c", ["5", "195", "0 c"]), changed: ["i", "r"] },
      { line: 5, say: "ثم a عند 1، ثم f عند 2. كل منها بايت واحد، فيتقدم i بواحد.", ...loop(2, "f", ["5", "195", "0 c", "1 a", "2 f"]), changed: ["i", "r"] },
      { line: 5, say: "عند 3 يجد C3 فيعرف أن الحرف بايتان: يقرأ C3 A9 معاً فتصبح r = 233 أي é. الدورة التالية كانت ستبدأ عند 5، وهي النهاية.", ...loop(3, "é", ["5", "195", "0 c", "1 a", "2 f", "3 é"]), changed: ["i", "r"] },
      { line: 7, say: "[]rune(s) يحجز مصفوفة جديدة ويفكّ فيها كل حرف إلى rune بأربعة بايتات. هذه نسخة: النص الأصلي لا يتغيّر أبداً.", memory: [...base, x("rs", "[99 97 102 233] (len 4)")], changed: ["rs"], output: ["5", "195", "0 c", "1 a", "2 f", "3 é"] },
      { line: 8, say: "الآن كل خانة حرف كامل: الطول 4، و rs[3] هو é. عدد الحروف شيء وعدد البايتات شيء آخر.", memory: [...base, x("rs", "[99 97 102 233] (len 4)")], read: ["rs"], output: ["5", "195", "0 c", "1 a", "2 f", "3 é", "4 é"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "محاكاة لترميز UTF-8 بـ JavaScript: كل حرف رقم (rune)، والدالة utf8 تحوّله إلى بايت أو اثنين أو ثلاثة حسب حجمه. 99 هو c و 233 هو é و 1605 هو حرف الميم العربي.",
    starter: `function utf8(r) {
  if (r < 128) return [r];
  if (r < 2048) return [192 + Math.floor(r / 64), 128 + (r % 64)];
  return [224 + Math.floor(r / 4096), 128 + (Math.floor(r / 64) % 64), 128 + (r % 64)];
}
let runes = [99, 97, 102, 233];
let bytes = [];
for (let r of runes) {
  for (let b of utf8(r)) {
    bytes.push(b);
  }
}
console.log("runes:", runes.length, "bytes:", bytes.length);
console.log(bytes.join(" "));`,
    challenges: [
      "كم بايتاً سيشغل 233 (é)؟ توقّع، ثم شغّل وتحقّق أن البايتين 195 169 (أي C3 A9).",
      "أضف 1605 (م) إلى runes. كم صار عدد البايتات؟ هذا ما يرجعه len في Go لكلمة عربية.",
      "أضف 8364 (رمز اليورو €). كم بايتاً يحتاج؟ أي فرع من الدالة يأخذ؟",
      "الرمز 128640 (🚀) يحتاج أربعة بايتات، والدالة لا تعرف ذلك بعد. أضف فرعاً لـ r >= 65536 يبدأ بـ 240 + Math.floor(r / 262144).",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع len وعدّاد الحروف؟",
      code: `s := "olé"
fmt.Println(len(s), utf8.RuneCountInString(s))`,
      options: ["4 3", "3 3", "4 4"],
      answer: 0,
      why: "o و l بايت لكل منهما، و é بايتان، فالمجموع 4. أما RuneCountInString فيمرّ على البايتات ويعدّ الحروف: 3. لاحظ أن len فوري، والعدّ يمرّ على النص كله.",
      scene: {
        code: {
          go: `s := "olé"
fmt.Println(len(s), utf8.RuneCountInString(s))`,
        },
        steps: [
          { line: 1, say: "البايتات: 6F 6C C3 A9. أربعة.", memory: [x("s", "{ptr, len: 4}"), x("bytes", "6F 6C C3 A9")], changed: ["s"] },
          { line: 2, say: "len من الرأس 4، والعدّاد يفكّ: o، l، é. ثلاثة.", memory: [x("s", "{ptr, len: 4}"), x("bytes", "6F 6C C3 A9")], read: ["s", "bytes"], output: ["4 3"] },
        ],
      },
    },
    {
      question: "نريد تكبير أول حرف بالكتابة فيه مباشرة. ماذا يحدث؟",
      code: `s := "go"
s[0] = 'G'
fmt.Println(s)`,
      options: ["خطأ ترجمة: cannot assign to s[0]", "Go", "go"],
      answer: 0,
      why: "بايتات النص للقراءة فقط، والمترجم يرفض الكتابة فيها. لتعديل نص تنسخه إلى []byte أو []rune، تعدّل النسخة، ثم تصنع منها نصاً جديداً: b := []byte(s); b[0] = 'G'; s = string(b).",
      scene: {
        code: {
          go: `s := "go"
s[0] = 'G'
fmt.Println(s)`,
        },
        steps: [
          { line: 1, say: "البايتات 67 6F في منطقة لا تُكتب.", memory: [x("s", "{ptr, len: 2}"), x("bytes (read-only)", "67 6F")], changed: ["s"] },
          { line: 2, say: "المترجم يرفض البرنامج قبل أن يعمل.", memory: [x("s", "{ptr, len: 2}"), x("bytes (read-only)", "67 6F")], error: "cannot assign to s[0] (neither addressable nor a map index expression)" },
        ],
      },
    },
    {
      question: "نقطع أول 4 بايتات من café. ماذا يُطبع؟",
      code: `s := "café"
fmt.Println(s[:4])`,
      options: ["caf متبوعة ببايت مكسور (caf�)", "café", "caf"],
      answer: 0,
      why: "القطع s[:4] يعمل بالبايتات، فيأخذ c a f ونصف é فقط (البايت C3). البايت وحده ليس حرفاً صالحاً، فتظهر علامة الاستبدال �. لا تقطع النص إلا عند حدود الحروف التي يعطيك إياها range.",
      scene: {
        code: {
          go: `s := "café"
fmt.Println(s[:4])`,
        },
        steps: [
          { line: 1, say: "خمسة بايتات: 63 61 66 C3 A9.", memory: [x("s", "{ptr, len: 5}"), x("bytes", "63 61 66 C3 A9")], changed: ["s"] },
          { line: 2, say: "s[:4] رأس جديد بطول 4 على البايتات نفسها: 63 61 66 C3. البايت C3 بلا شريكه لا يُفكّ.", memory: [x("s", "{ptr, len: 5}"), x("bytes", "63 61 66 C3 A9"), x("s[:4]", "{ptr, len: 4} → 63 61 66 C3")], read: ["bytes"], output: ["caf�"] },
        ],
      },
    },
  ],
  code: {
    intro: "أدوات النص التي يستعملها المحترفون: عكس صحيح عبر []rune، وبناء نص طويل بـ strings.Builder بدل += في حلقة (كل += ينسخ النص كله إلى مكان جديد). شغّل وجرّب كلمات أخرى.",
    runnerLang: "go",
    runnerStarter: `package main

import (
	"fmt"
	"strings"
	"unicode/utf8"
)

func reverse(s string) string {
	rs := []rune(s)
	for i, j := 0, len(rs)-1; i < j; i, j = i+1, j-1 {
		rs[i], rs[j] = rs[j], rs[i]
	}
	return string(rs)
}

func main() {
	word := "café"
	fmt.Println(len(word), utf8.RuneCountInString(word))
	fmt.Println(reverse(word))

	var b strings.Builder
	for i := 0; i < 3; i++ {
		b.WriteString(strings.ToUpper(word))
		b.WriteByte(' ')
	}
	fmt.Println(strings.TrimSpace(b.String()))
	fmt.Println(strings.Contains(word, "fé"), strings.Index(word, "é"))
	// try: word := "naïve" or an emoji, and compare len with the rune count
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "go",
      title: "قسّم سطر الطلب",
      prompt: "رتّب الأسطر لبرنامج يقسم السطر إلى كلمات (Fields يتجاهل المسافات الزائدة في الطرفين وبين الكلمات)، ويطبع عددها وأول كلمة بحروف صغيرة: 2 get.",
      lines: [
        "package main",
        "import (",
        "\t\"fmt\"",
        "\t\"strings\"",
        ")",
        "func main() {",
        "\tline := \"  GET /home  \"",
        "\tparts := strings.Fields(line)",
        "\tfmt.Println(len(parts), strings.ToLower(parts[0]))",
        "}",
      ],
      expected: "2 get",
    },
    {
      kind: "fill",
      lang: "go",
      title: "عدد الحروف",
      prompt: "نريد عدد الحروف في café، أي 4. أي تعبير يوضع في الفراغ؟",
      template: `package main

import (
	"fmt"
	"unicode/utf8"
)

func main() {
	s := "café"
	fmt.Println(___)
}`,
      options: ["len(s)", "utf8.RuneCountInString(s)", "len([]byte(s))"],
      answer: "utf8.RuneCountInString(s)",
      expected: "4",
    },
    {
      kind: "fix",
      lang: "go",
      title: "العكس أفسد الحرف",
      prompt: "الدالة تعكس النص بايتاً بايتاً، فتقلب بايتي é وتطبع حرفاً مكسوراً. أصلحها لتطبع élo.",
      code: `package main

import "fmt"

func reverse(s string) string {
	b := []byte(s)
	for i, j := 0, len(b)-1; i < j; i, j = i+1, j-1 {
		b[i], b[j] = b[j], b[i]
	}
	return string(b)
}

func main() {
	fmt.Println(reverse("olé"))
}`,
      expected: "élo",
      hint: "اعكس الحروف لا البايتات: استعمل []rune(s) بدل []byte(s). كل خانة عندها حرف كامل.",
      solution: `package main

import "fmt"

func reverse(s string) string {
	rs := []rune(s)
	for i, j := 0, len(rs)-1; i < j; i, j = i+1, j-1 {
		rs[i], rs[j] = rs[j], rs[i]
	}
	return string(rs)
}

func main() {
	fmt.Println(reverse("olé"))
}`,
    },
    {
      kind: "write",
      lang: "go",
      title: "الأحرف الأولى",
      prompt: "اكتب initials التي تأخذ أول حرف من كل كلمة بحرف كبير. يجب أن تطبع SAA ثم ÉZ (انتبه: É بايتان، فخذ أول rune لا أول بايت).",
      starter: `package main

import "fmt"

// add the imports you need: "strings", "unicode"
func initials(name string) string {
	// for each word: take its first rune, upper-case it, add it to a strings.Builder
	return ""
}

func main() {
	fmt.Println(initials("sara al ahmad"))
	fmt.Println(initials("émile zola"))
}`,
      expected: "SAA\nÉZ",
      hint: "for _, w := range strings.Fields(name) { r := []rune(w)[0]; b.WriteRune(unicode.ToUpper(r)) } مع var b strings.Builder، ثم return b.String().",
      solution: `package main

import (
	"fmt"
	"strings"
	"unicode"
)

func initials(name string) string {
	var b strings.Builder
	for _, w := range strings.Fields(name) {
		r := []rune(w)[0]
		b.WriteRune(unicode.ToUpper(r))
	}
	return b.String()
}

func main() {
	fmt.Println(initials("sara al ahmad"))
	fmt.Println(initials("émile zola"))
}`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: `s := "go"
fmt.Println(s[0])`,
      options: ["103", "g", "\"g\""],
      answer: 0,
      why: "s[0] بايت (uint8)، والطباعة تعرض رقمه: g هو 103. لترى الحرف اكتب string(s[0]) أو استعمل %c.",
    },
    {
      question: "ماذا تطبع الحلقة؟",
      code: `for i := range "héé" {
	fmt.Print(i, " ")
}`,
      options: ["0 1 3", "0 1 2", "0 1 2 3 4"],
      answer: 0,
      why: "range يقفز حرفاً كاملاً كل دورة، و i موضع أول بايت في الحرف. h بايت واحد عند 0، و é الأولى تبدأ عند 1 وتشغل بايتين، فالثانية تبدأ عند 3.",
    },
    {
      question: "ماذا يطبع؟",
      code: `n := 65
fmt.Println(string(rune(n)), strconv.Itoa(n))`,
      options: ["A 65", "65 65", "A A"],
      answer: 0,
      why: "string(rune(n)) يعامل الرقم رمزاً في Unicode: 65 هو A. أما strconv.Itoa فيكتب أرقام العدد نصاً: \"65\". لتحويل عدد إلى نص الأرقام استعمل strconv دائماً.",
    },
    {
      question: "ماذا يحدث في الذاكرة عند s += \"!\" ؟",
      code: `s := "hi"
s += "!"`,
      options: ["تُحجز بايتات جديدة، يُنسخ إليها hi ثم !، ويشير s إليها", "يُضاف ! في آخر البايتات القديمة مكانها", "s يصبح slice من نصين"],
      answer: 0,
      why: "بايتات النص لا تتغيّر، فكل += يصنع نصاً جديداً وينسخ القديم كله. في حلقة من ألف دورة هذا ألف نسخة متزايدة الطول؛ strings.Builder يكتب في مخزن واحد يكبر عند الحاجة.",
    },
    {
      question: "مقارنة النصوص في Go بايتاً بايتاً. ماذا يطبع؟",
      code: `fmt.Println("apple" < "banana", "Zebra" < "apple")`,
      options: ["true true", "true false", "false false"],
      answer: 0,
      why: "تُقارن البايتات من الأول: a (97) قبل b (98). و Z رقمه 90، أصغر من a (97)، فكل الحروف الكبيرة تأتي قبل الصغيرة. للمقارنة دون حالة الأحرف استعمل strings.EqualFold أو حوّل الطرفين إلى حروف صغيرة.",
    },
  ],
  next: "go-structs",
};
