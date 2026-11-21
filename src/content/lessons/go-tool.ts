import type { Cell, Lesson } from "@/lib/types";

const x = (name: string, value: string): Cell => ({ name, value, type: "none" });
const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });

const dir = x("folder", "hello/");
const src = x("main.go", "package main · func main()");
const mod = x("go.mod", "module example.com/hello · go 1.24");
const bin = x("hello.exe", "machine code, ~2 MB");

export const goTool: Lesson = {
  slug: "go-tool",
  stage: 0,
  number: "1.1",
  title: "الأداة go",
  subtitle: "من نص تكتبه إلى ملف ينفّذه المعالج: الأمر go يترجم البرنامج كله قبل أن يعمل سطر واحد",
  minutes: 14,
  singleLanguage: true,
  problem: {
    title: "المترجم يقرأ كل شيء أولاً",
    body: "في الطرفية مشروع Go صغير. شغّله، ثم أضف إليه خطأً صغيراً وشغّله مرة أخرى، ثم ابنِ منه ملفاً تنفيذياً. راقب متى يظهر الخطأ، ومتى يُطبع أي شيء.",
    demo: "goTool",
  },
  scene: {
    code: {
      shell: `mkdir hello && cd hello
go mod init example.com/hello
go run .
go run .
go build
./hello
gofmt -l .
go vet ./...`,
    },
    notes: {
      shell: "على Windows يصنع go build الملف hello.exe وتشغّله بالاسم .\\hello.exe؛ وعلى Linux و macOS اسمه hello بلا امتداد.",
    },
    steps: [
      { line: null, say: "المعالج لا يفهم نص Go. يفهم تعليمات آلة: أرقاماً تعني «اجمع» و«انقل» و«قارن». الأمر go أداة واحدة تترجم نصك إلى هذه التعليمات، وتفعل معها كل ما يحتاجه المشروع.", memory: [] },
      { line: 1, say: "مشروع Go يعيش في مجلد. ننشئ المجلد hello وندخله.", memory: [dir], changed: ["folder"] },
      { line: 2, say: "go mod init يكتب ملفاً واحداً: go.mod. فيه اسم الوحدة (module)، وهو مسار فريد لمشروعك، ونسخة Go التي كُتب لها. لا يُحمَّل شيء من الإنترنت.", memory: [dir, mod], changed: ["go.mod"], output: ["go: creating new go.mod: module example.com/hello"] },
      { line: 3, say: "كتبنا main.go وفيه name := \"Sara\" لم نستعمله. go run . يطلب الترجمة أولاً، والمترجم يقرأ الملف كله فيرفض: متغير معلن وغير مستعمل خطأ في Go، لا تحذير. لم يعمل سطر واحد من البرنامج.", memory: [dir, mod, src], changed: ["main.go"], error: "./main.go:6:2: declared and not used: name", output: ["go: creating new go.mod: module example.com/hello", "./main.go:6:2: declared and not used: name"] },
      { line: 4, say: "الرسالة دلّتنا على المكان بدقة: الملف main.go، السطر 6، العمود 2. استعملنا name في Println وشغّلنا مرة أخرى. الترجمة نجحت، فصنع go run ملفاً تنفيذياً في مجلد مؤقت، شغّله، ثم حذفه.", memory: [dir, mod, src], read: ["main.go"], output: ["go: creating new go.mod: module example.com/hello", "./main.go:6:2: declared and not used: name", "Hello, Sara"] },
      { line: 5, say: "go build يترجم مثل go run لكنه يحتفظ بالنتيجة: ملف تنفيذي باسم الوحدة بجانب الكود. لا يطبع شيئاً، وفي أدوات Go الصمت يعني النجاح.", memory: [dir, mod, src, bin], changed: ["hello.exe"], read: ["main.go", "go.mod"] },
      { line: 6, say: "نشغّل الملف مباشرة، بلا go وبلا ترجمة. هذا ما تنسخه إلى أي جهاز بنفس نظام التشغيل فيعمل وحده، وفيه برنامجك ومكتبة fmt معاً.", memory: [dir, mod, src, bin], read: ["hello.exe"], output: ["go: creating new go.mod: module example.com/hello", "./main.go:6:2: declared and not used: name", "Hello, Sara", "Hello, Sara"] },
      { line: 7, say: "gofmt -l يذكر الملفات التي يختلف تنسيقها عن التنسيق الرسمي. لم يذكر شيئاً، فـ main.go منسّق. كل كود Go في العالم بهذا الشكل الواحد، وأغلب المحرّرات تشغّل gofmt عند الحفظ.", memory: [dir, mod, src, bin], read: ["main.go"] },
      { line: 8, say: "go vet يبحث عن كود يُترجم لكنه مريب، مثل Printf بعلامة لا تناسب قيمتها. صمت مرة أخرى. المترجم و vet يمسكان الخطأ على جهازك قبل أن يراه أي مستخدم.", memory: [dir, mod, src, bin], read: ["main.go"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "محاكاة لما يفعله المترجم قبل التشغيل: يمرّ على البرنامج كله ويتأكد أن كل حزمة مستوردة وكل متغير معلن مستعمل. إن وجد خطأً واحداً لا يعمل أي سطر. البرنامج هنا قائمة أوامر بدل نص Go.",
    starter: `let program = [
  { line: 3, kind: "import", name: "fmt" },
  { line: 6, kind: "declare", name: "name" },
  { line: 7, kind: "print", name: "name", text: "Hello, Sara" },
  { line: 7, kind: "use", name: "fmt" },
];
let used = {};
for (let s of program) {
  if (s.kind === "use" || s.kind === "print") used[s.name] = true;
}
let errors = 0;
for (let s of program) {
  if (s.kind === "import" && !used[s.name]) {
    console.log("./main.go:" + s.line + ': "' + s.name + '" imported and not used');
    errors = errors + 1;
  }
  if (s.kind === "declare" && !used[s.name]) {
    console.log("./main.go:" + s.line + ": declared and not used: " + s.name);
    errors = errors + 1;
  }
}
if (errors === 0) {
  for (let s of program) {
    if (s.kind === "print") console.log(s.text);
  }
} else {
  console.log("build failed: nothing ran");
}`,
    challenges: [
      "احذف سطر print. ماذا يطبع المترجم، ولماذا لم يُطبع Hello؟ توقّع قبل أن تضغط.",
      "أضف { line: 4, kind: \"import\", name: \"os\" } إلى القائمة. كم خطأً يظهر؟",
      "اجعل في البرنامج خطأين ثم صحّح واحداً فقط. هل يعمل البرنامج الآن؟",
      "أضف سطر print ثانياً بنص آخر في آخر القائمة، وتأكد أن الطباعة تحدث بعد فحص كل الأسطر.",
    ],
  },
  predict: [
    {
      question: "في البرنامج متغير لم نستعمله. ماذا يظهر عند go run .؟",
      code: `package main

import "fmt"

func main() {
	fmt.Println("start")
	total := 10
	fmt.Println("end")
}`,
      options: ["خطأ ترجمة declared and not used: total، ولا يُطبع شيء", "start ثم end، مع تحذير عن total", "start ثم يتوقف البرنامج عند السطر 7"],
      answer: 0,
      why: "Go لا تنفّذ سطراً سطراً. المترجم يقرأ البرنامج كله أولاً، ومتغير غير مستعمل عنده خطأ لا تحذير. لا يُصنع ملف تنفيذي، فلا يعمل حتى السطر الأول.",
      scene: {
        code: {
          go: `package main

import "fmt"

func main() {
	fmt.Println("start")
	total := 10
	fmt.Println("end")
}`,
        },
        steps: [
          { line: null, say: "go run . يبدأ بالترجمة. لا شيء يعمل بعد.", memory: [] },
          { line: 6, say: "المترجم يقرأ السطر ولا ينفّذه: استدعاء صحيح لـ fmt.Println.", memory: [] },
          { line: 7, say: "total يُعلن هنا، ولن يُقرأ في أي سطر بعده.", memory: [x("total", "declared, never used")], changed: ["total"] },
          { line: 7, say: "نهاية الملف: total لم يُستعمل. خطأ، فلا ملف تنفيذي، ولا تُطبع start.", memory: [x("total", "declared, never used")], error: "./main.go:7:2: declared and not used: total" },
        ],
      },
    },
    {
      question: "بنينا البرنامج، ثم عدّلنا النص في main.go، ثم شغّلنا الملف التنفيذي مباشرة. ماذا يُطبع؟",
      code: `go build          # main.go prints "v1"
# edit main.go to print "v2" and save
./hello`,
      options: ["v1", "v2", "خطأ: الكود تغيّر"],
      answer: 0,
      why: "الملف التنفيذي نسخة مترجمة من الكود لحظة البناء، لا رابط بينه وبين main.go بعدها. ليرى التعديل يجب أن تبني من جديد. أما go run فيترجم في كل مرة، لذلك يرى آخر حفظ دائماً.",
      scene: {
        code: {
          shell: `go build          # main.go prints "v1"
# edit main.go to print "v2" and save
./hello`,
        },
        steps: [
          { line: 1, say: "الترجمة تنسخ ما في main.go الآن إلى تعليمات آلة داخل hello.exe.", memory: [s("main.go", "v1"), s("hello.exe", "v1")], changed: ["hello.exe"] },
          { line: 2, say: "تعديل main.go يغيّر النص فقط. الملف التنفيذي لم يُلمس.", memory: [s("main.go", "v2"), s("hello.exe", "v1")], changed: ["main.go"] },
          { line: 3, say: "نشغّل hello.exe، فيعمل الكود الذي تُرجم فيه: v1.", memory: [s("main.go", "v2"), s("hello.exe", "v1")], read: ["hello.exe"], output: ["v1"] },
        ],
      },
    },
    {
      question: "السطر الأول صحيح، والسطر الثاني يضع نصاً في متغير عددي. ماذا يحدث عند go run .؟",
      code: `package main

import "fmt"

func main() {
	fmt.Println("hello")
	var count int = "five"
	fmt.Println(count)
}`,
      options: ["خطأ ترجمة عند السطر 7، ولا تُطبع hello", "تُطبع hello ثم يتوقف البرنامج بخطأ", "تُطبع hello ثم five"],
      answer: 0,
      why: "نوع كل متغير معروف وقت الترجمة، فالمترجم يرى أن \"five\" لا يدخل درجاً من نوع int ويرفض البرنامج كله. في لغة تُفسَّر سطراً سطراً كانت hello ستُطبع أولاً.",
      scene: {
        code: {
          go: `package main

import "fmt"

func main() {
	fmt.Println("hello")
	var count int = "five"
	fmt.Println(count)
}`,
        },
        steps: [
          { line: 6, say: "المترجم يفحص السطر ولا ينفّذه.", memory: [] },
          { line: 7, say: "درج count نوعه int، والقيمة نص. لا يوجد ملف تنفيذي إذن، ولا hello.", memory: [x("count", "int")], error: "./main.go:7:18: cannot use \"five\" (untyped string constant) as int value in variable declaration" },
        ],
      },
    },
  ],
  code: {
    intro: "هذا برنامج Go كامل: package main يقول إن الحزمة تُبنى ملفاً تنفيذياً، و import يجلب حزمة fmt للطباعة، و main نقطة البداية. شغّله، ثم أضف متغيراً لا تستعمله وشغّل مرة أخرى لترى رسالة المترجم.",
    runnerLang: "go",
    runnerStarter: `package main

import "fmt"

func main() {
	name := "Sara"
	fmt.Println("Hello,", name)
	fmt.Printf("%s has %d letters\\n", name, len(name))
	// try: add  city := "Riyadh"  here without using it, then run
}`,
  },
  exercises: [
    {
      kind: "order",
      lang: "go",
      title: "أول برنامج",
      prompt: "رتّب أسطر برنامج Go كامل يطبع Hello, Go ثم Bye.",
      lines: ["package main", "import \"fmt\"", "func main() {", "\tfmt.Println(\"Hello, Go\")", "\tfmt.Println(\"Bye\")", "}"],
      expected: "Hello, Go\nBye",
    },
    {
      kind: "fill",
      lang: "go",
      title: "الحزمة الصحيحة",
      prompt: "البرنامج يستعمل fmt.Println. أي حزمة تُستورد حتى يُترجم؟",
      template: `package main

import "___"

func main() {
	fmt.Println("ready")
}`,
      options: ["fmt", "os", "strings"],
      answer: "fmt",
      expected: "ready",
    },
    {
      kind: "fix",
      lang: "go",
      title: "المترجم يرفض",
      prompt: "هذا البرنامج لا يُترجم: فيه حزمة مستوردة لا تُستعمل ومتغيران لا يُقرآن. أصلحه حتى يطبع Hello, Sara مستعملاً المتغيرين.",
      code: `package main

import (
	"fmt"
	"strings"
)

func main() {
	greeting := "Hello"
	name := "Sara"
	fmt.Println("Hello, Sara")
}`,
      expected: "Hello, Sara",
      hint: "احذف \"strings\" من الاستيراد، واطبع fmt.Println(greeting + \", \" + name).",
      solution: `package main

import "fmt"

func main() {
	greeting := "Hello"
	name := "Sara"
	fmt.Println(greeting + ", " + name)
}`,
    },
    {
      kind: "write",
      lang: "go",
      title: "خطوات المشروع",
      prompt: "اكتب برنامجاً يطبع أوامر بدء مشروع Go بترتيبها، كل أمر في سطر: go mod init example.com/app ثم go run . ثم go build.",
      starter: `package main

import "fmt"

func main() {
	// print the three commands, one per line
}`,
      expected: "go mod init example.com/app\ngo run .\ngo build",
      hint: "ثلاثة أسطر fmt.Println، كل واحد بنص أمر.",
      solution: `package main

import "fmt"

func main() {
	fmt.Println("go mod init example.com/app")
	fmt.Println("go run .")
	fmt.Println("go build")
}`,
    },
  ],
  quiz: [
    {
      question: "شغّلت go run . ونجح. أين الملف التنفيذي الآن؟",
      options: ["حُذف: go run بناه في مجلد مؤقت وشغّله ثم مسحه", "بجانب main.go باسم الوحدة", "لا يوجد ملف تنفيذي، go run يفسّر الكود سطراً سطراً"],
      answer: 0,
      why: "go run ترجمة كاملة مثل go build، والفرق أين تذهب النتيجة: مجلد مؤقت يُمسح بعد التشغيل. لتحتفظ بالملف استعمل go build.",
    },
    {
      question: "ظهرت هذه الرسالة. أين الخطأ بالضبط؟",
      code: `./main.go:12:5: undefined: totl`,
      options: ["في main.go، السطر 12، العمود 5: اسم totl غير معرّف", "في السطر 5، والبرنامج نفّذ 12 سطراً قبله", "خطأ وقت التشغيل بعد 12 ثانية"],
      answer: 0,
      why: "رسائل المترجم بالشكل ملف:سطر:عمود: رسالة. هذا خطأ إملائي في اسم متغير، والمترجم وجده قبل أن يعمل أي شيء. اقرأ الرسالة كخريطة إلى المكان.",
    },
    {
      question: "gofmt حوّل السطر الأول إلى الثاني. ماذا تغيّر في سلوك البرنامج؟",
      code: `total:=price*2+1
total := price*2 + 1`,
      options: ["لا شيء: gofmt يغيّر المسافات والمحاذاة فقط", "الأولوية تغيّرت: صار الجمع قبل الضرب", "صار البرنامج أسرع"],
      answer: 0,
      why: "gofmt يعيد كتابة الشكل لا المعنى. المسافات حول + دون * تُظهر لعينك أن الضرب يُحسب أولاً، وهي الأولوية نفسها التي يتبعها المترجم في الحالتين.",
    },
    {
      question: "ماذا يصنع الأمر go mod init example.com/shop في مجلد فارغ؟",
      options: ["ملف go.mod فيه اسم الوحدة ونسخة Go", "مجلداً فيه كل حزم Go المحمّلة من الإنترنت", "ملف main.go جاهزاً بدالة main"],
      answer: 0,
      why: "go.mod بطاقة تعريف المشروع: اسمه، ونسخة Go، ولاحقاً الحزم التي يعتمد عليها بنسخها الدقيقة. لا يكتب كوداً ولا يحمّل شيئاً.",
    },
    {
      question: "بنيت البرنامج على Windows بالأمر go build وأرسلت hello.exe إلى خادم Linux. هل يعمل هناك؟",
      options: ["لا: الملف بتعليمات Windows. ابنِ له بـ GOOS=linux go build", "نعم، الملف التنفيذي يعمل على أي نظام", "نعم، إن كان Go مثبتاً على الخادم"],
      answer: 0,
      why: "الملف التنفيذي مترجم لنظام تشغيل ومعالج بعينهما. Go يترجم لأي نظام من جهازك: GOOS=linux GOARCH=amd64 go build يصنع ملفاً يعمل على الخادم وحده بلا Go.",
    },
  ],
  next: "go-variables",
};
