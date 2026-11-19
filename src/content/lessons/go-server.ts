import type { Cell, Lesson } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const x = (name: string, value: string): Cell => ({ name, value, type: "none" });

const route = x("routes", "POST /products → addProduct");
const port = n("port", 8080);
const g1 = [route, port, x("goroutine", "#1"), s("r.Body", '{"name":"Pen","price":3}')];
const g2 = [route, port, x("goroutine", "#2"), s("r.Body", '{"name":"Pen","price":"cheap"}')];

export const goServer: Lesson = {
  slug: "go-server",
  stage: 7,
  number: "7.3",
  title: "خادم Go",
  subtitle: "نفس الخادم بلغة مُترجمة ذات أنواع: كل طلب في goroutine خاصة به، والخطأ قيمة تفحصها بيدك",
  minutes: 16,
  singleLanguage: true,
  problem: {
    title: "ستة طلبات في اللحظة نفسها",
    body: "خادم Node له خيط واحد، وخادم Go يفتح لكل طلب مساراً خاصاً به. أرسل دفعة طلبات إلى الاثنين وراقب الخطوط الزمنية: مرة طلبات تنتظر قاعدة البيانات، ومرة طلبات تحسب كثيراً.",
    demo: "goServer",
  },
  scene: {
    code: {
      go: `type Product struct{ Name string; Price int }

func main() {
	http.HandleFunc("POST /products", addProduct)
	http.ListenAndServe(":8080", nil)
}

func addProduct(w http.ResponseWriter, r *http.Request) {
	var p Product
	err := json.NewDecoder(r.Body).Decode(&p)
	if err != nil {
		http.Error(w, "bad json", 400)
		return
	}
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(p)
}`,
    },
    notes: {
      go: "net/http في المكتبة القياسية نفسها، فلا Express ولا حزم: الأمر go build يحوّل هذا الملف إلى ملف تنفيذي واحد تنسخه إلى الخادم وتشغّله، بلا Node وبلا node_modules.",
    },
    steps: [
      { line: null, say: "نفس فكرة خادم Node: عملية تستمع، وجدول مسارات، ودالة لكل مسار. الفرق أن Go لغة مُترجمة ذات أنواع: يُترجم الملف كله مرة واحدة قبل التشغيل، ويبدأ التنفيذ من main.", memory: [] },
      { line: 1, say: "Product نوع، أي قالب: كل منتج له Name نص و Price عدد صحيح. Go تعرف شكل البيانات قبل أن يصل أي طلب.", memory: [x("Product", "{ Name string, Price int }")], changed: ["Product"] },
      { line: 4, say: "نسجّل الدالة addProduct في جدول المسارات تحت POST /products. لا شيء يُنفَّذ بعد: هذا مثل app.post في Express.", memory: [route], changed: ["routes"] },
      { line: 5, say: "العملية تفتح المنفذ 8080 وتنتظر. هذا السطر لا ينتهي ما دام الخادم يعمل.", memory: [route, port], changed: ["port"] },
      { line: 8, say: "وصل طلب POST /products. يفتح Go له goroutine: خيطاً خفيفاً خاصاً به يستدعي addProduct. r هو الطلب، و w قلم نكتب به الرد.", memory: g1, changed: ["goroutine", "r.Body"] },
      { line: 9, say: "var p Product يحجز درجاً بشكل Product. في Go لا يوجد undefined: كل نوع يبدأ بقيمته الصفرية، فـ Name نص فارغ و Price صفر.", memory: [...g1, s("p.Name", ""), n("p.Price", 0)], changed: ["p.Name", "p.Price"] },
      { line: 10, say: "Decode يقرأ نص JSON ويملأ p. نعطيه &p، أي عنوان الدرج لا نسخة منه، فيكتب فيه مباشرة. والنتيجة الثانية err: لا خطأ، فهي nil.", memory: [...g1, s("p.Name", "Pen"), n("p.Price", 3), x("err", "nil")], changed: ["p.Name", "p.Price", "err"], read: ["r.Body"] },
      { line: 11, say: "err != nil خطأ (false) لأن err تساوي nil. يتخطى التنفيذ الفرع كله ويقفز إلى السطر 15.", memory: [...g1, s("p.Name", "Pen"), n("p.Price", 3), x("err", "nil")], read: ["err"] },
      { line: 15, say: "نكتب سطر الحالة 201 Created، ثم في السطر التالي يحوّل Encode الدرج p إلى JSON في جسم الرد. تنتهي الدالة وتنتهي الـ goroutine معها.", memory: [...g1, s("p.Name", "Pen"), n("p.Price", 3), x("err", "nil"), n("status", 201)], changed: ["status"] },
      { line: 10, say: "طلب ثانٍ في goroutine #2 بمتغيرات p و err خاصة بها. السعر هنا نص \"cheap\" والنوع يقول int. Decode لا يُسقط البرنامج: يرجع الخطأ قيمةً في err، ويترك Price صفراً.", memory: [...g2, s("p.Name", "Pen"), n("p.Price", 0), s("err", "cannot unmarshal string into int")], changed: ["err", "p.Name"], read: ["r.Body"] },
      { line: 12, say: "err != nil صحيح هذه المرة، فندخل الفرع ونكتب ردّ 400 «طلبك خاطئ». لا try ولا catch: الخطأ متغير عادي فحصناه بأيدينا.", memory: [...g2, s("p.Name", "Pen"), n("p.Price", 0), s("err", "cannot unmarshal string into int"), n("status", 400)], changed: ["status"], read: ["err"] },
      { line: 13, say: "return يخرج من الدالة قبل سطر 201. ولو وصل ألف طلب معاً لفتح Go ألف goroutine، كلٌّ بدرجيه p و err، موزّعة على كل أنوية المعالج في الوقت نفسه.", memory: [...g2, s("p.Name", "Pen"), n("p.Price", 0), s("err", "cannot unmarshal string into int"), n("status", 400)] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "محاكاة لجدولة الطلبات: كل طلب يحتاج وقتاً من المعالج (cpu بالملّي ثانية)، والطلب يذهب إلى أول نواة تفرغ. cores = 4 مثل Go على جهاز بأربع أنوية، و cores = 1 مثل خيط Node الوحيد حين يكون العمل حساباً لا انتظاراً.",
    starter: `let requests = [
  { id: 1, cpu: 30 },
  { id: 2, cpu: 30 },
  { id: 3, cpu: 30 },
  { id: 4, cpu: 30 },
];
let cores = 4;
let freeAt = [];
for (let i = 0; i < cores; i++) {
  freeAt.push(0);
}
for (let req of requests) {
  let best = 0;
  for (let i = 1; i < cores; i++) {
    if (freeAt[i] < freeAt[best]) best = i;
  }
  freeAt[best] = freeAt[best] + req.cpu;
  console.log("request", req.id, "done at", freeAt[best], "on core", best);
}`,
    challenges: [
      "غيّر cores إلى 1. متى ينتهي الطلب الرابع الآن؟ توقّع قبل أن تضغط.",
      "أرجع cores إلى 4 وأضف طلبين آخرين. أي نواة تأخذ الطلب الخامس، ومتى ينتهي؟",
      "اجعل cpu الطلب الأول 120 والباقي 30، مع cores = 1. كم ينتظر الطلب الثاني بسبب الأول؟ ثم جرّب cores = 4.",
      "مع cores = 2 وستة طلبات كلٌّ منها 30: احسب في رأسك متى يُرسل آخر رد، ثم تحقّق.",
    ],
  },
  predict: [
    {
      question: "السعر في الجسم نص، والنوع int. ماذا يطبع هذا الكود بلغة Go؟",
      code: `var p Product // struct{ Name string; Price int }
body := \`{"name":"Pen","price":"cheap"}\`
err := json.Unmarshal([]byte(body), &p)
fmt.Println(p.Name, p.Price, err != nil)`,
      options: ["Pen 0 true", "البرنامج يتوقف عند السطر 3 بخطأ", "Pen cheap false"],
      answer: 0,
      why: "في Go لا يطير الخطأ ليوقف البرنامج: Unmarshal يملأ ما استطاع (Name)، ويترك Price بقيمته الصفرية 0، ويرجع الخطأ قيمةً في err. إن لم تفحص err بنفسك، يكمل البرنامج بمنتج سعره صفر.",
      scene: {
        code: {
          go: `var p Product // struct{ Name string; Price int }
body := \`{"name":"Pen","price":"cheap"}\`
err := json.Unmarshal([]byte(body), &p)
fmt.Println(p.Name, p.Price, err != nil)`,
        },
        steps: [
          { line: 1, say: "p يبدأ بالقيم الصفرية: نص فارغ وصفر.", memory: [s("p.Name", ""), n("p.Price", 0)], changed: ["p.Name", "p.Price"] },
          { line: 3, say: "name يناسب النوع فيُكتب. price نص لا يدخل في درج int، فيبقى 0 ويُرجَع خطأ في err.", memory: [s("p.Name", "Pen"), n("p.Price", 0), s("err", "cannot unmarshal string into int")], changed: ["p.Name", "err"] },
          { line: 4, say: "البرنامج لم يتوقف. يطبع ما في الأدراج: Pen 0 true.", memory: [s("p.Name", "Pen"), n("p.Price", 0), s("err", "cannot unmarshal string into int")], read: ["p.Name", "p.Price", "err"], output: ["Pen 0 true"] },
        ],
      },
    },
    {
      question: "أربعة طلبات، كل منها يحتاج 50ms من المعالج، على نواتين. متى يُرسل آخر رد؟",
      code: `let freeAt = [0, 0];
let last = 0;
for (let k = 0; k < 4; k++) {
  let c = freeAt[0] <= freeAt[1] ? 0 : 1;
  freeAt[c] = freeAt[c] + 50;
  last = freeAt[c];
}
console.log(last);`,
      options: ["100", "50", "200"],
      answer: 0,
      why: "الطلبات الأربعة تتوزع على النواتين: اثنان من 0 إلى 50، واثنان من 50 إلى 100. التوازي يقسم العمل على الأنوية، لكنه لا يجعل الطلبات كلها تنتهي في 50ms إن كانت الأنوية أقل من الطلبات.",
    },
    {
      question: "سجّلنا المسار لطريقة POST فقط، ثم أرسل المتصفح GET /products. بماذا يرد الخادم؟",
      code: `http.HandleFunc("POST /products", addProduct)
http.ListenAndServe(":8080", nil)
// client: GET /products`,
      options: ["405 Method Not Allowed", "404 Not Found", "200 مع جسم فارغ"],
      answer: 0,
      why: "جدول المسارات في Go (منذ الإصدار 1.22) يطابق الطريقة والمسار معاً. المسار /products موجود لكن بطريقة أخرى، فيرد 405 «هذا المسار لا يقبل هذه الطريقة» دون أن يستدعي addProduct.",
      scene: {
        code: {
          go: `http.HandleFunc("POST /products", addProduct)
http.ListenAndServe(":8080", nil)
// client: GET /products`,
        },
        steps: [
          { line: 1, say: "الجدول فيه سطر واحد: POST /products.", memory: [x("routes", "POST /products → addProduct")], changed: ["routes"] },
          { line: 3, say: "وصل GET /products. المسار يطابق، والطريقة لا تطابق: 405، ولا تُستدعى addProduct.", memory: [x("routes", "POST /products → addProduct"), s("method", "GET"), n("status", 405)], changed: ["status"], read: ["routes"] },
        ],
      },
    },
  ],
  code: {
    intro: "هذا خادم Go كامل في ملف main.go. لتجربته على جهازك: ثبّت Go، ثم go run main.go، ثم من طرفية أخرى أرسل طلباً بالأمر curl في السطر الأخير. و go build يصنع ملفاً تنفيذياً واحداً تنقله إلى أي خادم.",
    runnerLang: "text",
    runnerStarter: `package main

import (
	"encoding/json"
	"net/http"
)

type Product struct {
	Name  string \`json:"name"\`
	Price int    \`json:"price"\`
}

var products = []Product{{Name: "Pen", Price: 3}}

func listProducts(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(products)
}

func addProduct(w http.ResponseWriter, r *http.Request) {
	var p Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "bad json", 400)
		return
	}
	products = append(products, p) // في خادم حقيقي: احمها بـ sync.Mutex لأن الطلبات متوازية
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(p)
}

func main() {
	http.HandleFunc("GET /products", listProducts)
	http.HandleFunc("POST /products", addProduct)
	http.ListenAndServe(":8080", nil)
}

// curl -X POST localhost:8080/products -d '{"name":"Book","price":5}'`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "دالة المعالجة",
      prompt: "رتّب أسطر دالة Go التي تقرأ منتجاً من جسم الطلب، وترد 400 إن فشلت القراءة، وإلا 201.",
      lines: [
        "func addProduct(w http.ResponseWriter, r *http.Request) {",
        "\tvar p Product",
        "\terr := json.NewDecoder(r.Body).Decode(&p)",
        "\tif err != nil {",
        "\t\thttp.Error(w, \"bad json\", 400)",
        "\t\treturn",
        "\t}",
        "\tw.WriteHeader(201)",
        "}",
      ],
      expected: "",
    },
    {
      kind: "fill",
      lang: "text",
      title: "افحص الخطأ",
      prompt: "نريد الدخول إلى الفرع حين يوجد خطأ فعلاً. أي عامل يوضع في الفراغ؟",
      template: "err := json.NewDecoder(r.Body).Decode(&p)\nif err ___ nil {\n\thttp.Error(w, \"bad json\", 400)\n\treturn\n}",
      options: ["!=", "==", ":="],
      answer: "!=",
      expected: "",
    },
    {
      kind: "fix",
      title: "خطأ لم يُفحص",
      prompt: "هذه محاكاة بـ JavaScript لأسلوب Go: decode ترجع { p, err } بدل أن ترمي خطأ. الخادم يتجاهل err فيرد 201 بمنتج سعره 0. أصلحه حتى يطبع 400 bad json.",
      code: `function decode(body) {
  if (typeof body.price !== "number") {
    return { p: { name: body.name, price: 0 }, err: "price is not a number" };
  }
  return { p: body, err: null };
}
function addProduct(request) {
  let result = decode(request.body);
  return { status: 201, body: result.p.name + " " + result.p.price };
}
let res = addProduct({ body: { name: "Pen", price: "cheap" } });
console.log(res.status, res.body);`,
      expected: "400 bad json",
      hint: "بعد سطر decode مباشرة: if (result.err !== null) { return { status: 400, body: \"bad json\" }; }",
      solution: `function decode(body) {
  if (typeof body.price !== "number") {
    return { p: { name: body.name, price: 0 }, err: "price is not a number" };
  }
  return { p: body, err: null };
}
function addProduct(request) {
  let result = decode(request.body);
  if (result.err !== null) {
    return { status: 400, body: "bad json" };
  }
  return { status: 201, body: result.p.name + " " + result.p.price };
}
let res = addProduct({ body: { name: "Pen", price: "cheap" } });
console.log(res.status, res.body);`,
    },
    {
      kind: "write",
      title: "خيط واحد أم مسارات كثيرة",
      prompt: "ثلاثة طلبات كل منها يحتاج 20ms حساباً. خيط واحد (مثل Node) ينفّذها واحداً بعد الآخر، و Go بثلاث أنوية ينفّذها معاً. احسب متى يُرسل آخر رد في كل حالة واطبع node 60 ثم go 20.",
      starter: `let cpu = [20, 20, 20];
// node: مجموع الأوقات. go: أطول وقت (لكل طلب نواة)
`,
      expected: "node 60\ngo 20",
      hint: "حلقة واحدة: total = total + c، و longest = Math.max(longest, c). ثم console.log(\"node\", total) و console.log(\"go\", longest).",
      solution: `let cpu = [20, 20, 20];
let total = 0;
let longest = 0;
for (let c of cpu) {
  total = total + c;
  longest = Math.max(longest, c);
}
console.log("node", total);
console.log("go", longest);`,
    },
  ],
  quiz: [
    {
      question: "نسي المبرمج return بعد http.Error. أرسل العميل جسماً خاطئاً. ماذا يصل إليه؟",
      code: `err := json.NewDecoder(r.Body).Decode(&p)
if err != nil {
	http.Error(w, "bad json", 400)
}
w.WriteHeader(201)
json.NewEncoder(w).Encode(p)`,
      options: ["400، وفي الجسم bad json ثم منتج فارغ {\"Name\":\"\",\"Price\":0}", "400 وفي الجسم bad json فقط", "201 مع منتج فارغ"],
      answer: 0,
      why: "http.Error يكتب الحالة والرسالة، لكنه لا يوقف الدالة. التنفيذ يكمل: سطر الحالة أُرسل فعلاً فيُتجاهل WriteHeader(201)، أما Encode فيضيف p بقيمه الصفرية إلى الجسم. return هي ما يوقف الدالة.",
    },
    {
      question: "ألف طلب في اللحظة نفسها، كل طلب ينتظر قاعدة البيانات 100ms ولا يحسب تقريباً شيئاً. كم يستغرق آخر رد؟",
      options: ["قرابة 100ms في Node وفي Go كليهما", "100ms في Go و100 ثانية في Node", "100 ثانية في كليهما"],
      answer: 0,
      why: "الانتظار لا يشغل المعالج. خيط Node الوحيد يرسل الاستعلامات كلها ويتفرغ لغيرها حتى تعود الردود، و goroutines في Go تنتظر معاً. الفرق يظهر حين يكون العمل حساباً يشغل المعالج نفسه.",
    },
    {
      question: "ثمانية طلبات، كل طلب يحسب 100ms على المعالج، والجهاز بأربع أنوية. متى يُرسل آخر رد تقريباً؟",
      options: ["Node بعد 800ms و Go بعد 200ms", "كلاهما بعد 100ms", "Node بعد 200ms و Go بعد 800ms"],
      answer: 0,
      why: "خيط Node الوحيد يحسب طلباً بعد طلب: 8 × 100. أما goroutines فتتوزع على الأنوية الأربع: دفعتان من أربعة طلبات، 2 × 100.",
    },
    {
      question: "انتهيت من خادم Go وتريد تشغيله على خادم Linux. ماذا تنقل إليه؟",
      options: ["ملفاً تنفيذياً واحداً صنعه go build", "ملفات .go مع Go نفسه ومجلد الحزم", "ملفات .go فقط، فالخادم يترجمها عند كل طلب"],
      answer: 0,
      why: "Go لغة مُترجمة: الترجمة تحدث مرة واحدة على جهازك، وتنتج ملفاً فيه البرنامج ومكتبة net/http معاً بتعليمات المعالج مباشرة. على الخادم لا يلزم Go ولا node_modules.",
    },
    {
      question: "الجسم فيه حقل لا يعرفه النوع Product. ماذا يطبع؟",
      code: `var p Product // struct{ Name string; Price int }
body := \`{"name":"Pen","price":3,"color":"red"}\`
err := json.Unmarshal([]byte(body), &p)
fmt.Println(p.Name, p.Price, err == nil)`,
      options: ["Pen 3 true", "Pen 3 false", "Pen 3 red true"],
      answer: 0,
      why: "النوع هو الذي يحدد ما يُقرأ: Product له درجان فقط، فيُملآن ويُتجاهل color بلا خطأ. البيانات الزائدة لا تدخل برنامجك أصلاً لأنه لا درج لها.",
    },
  ],
  next: "python-server",
};
