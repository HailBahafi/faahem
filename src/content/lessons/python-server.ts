import type { Cell, Lesson } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const x = (name: string, value: string): Cell => ({ name, value, type: "none" });

const one = x("products", '[{"name": "Pen", "price": 3}]');
const two = x("products", "[Pen, Book]");
const getOnly = x("routes", "GET /products → list_products");
const both = x("routes", "GET → list_products, POST → add_product");

export const pythonServer: Lesson = {
  slug: "python-server",
  stage: 7,
  number: "7.4",
  title: "خادم Python",
  subtitle: "زخرفة @ تعلّق دالة على مسار، و FastAPI يقرأ الأنواع ليفحص المدخلات ويحوّل الرد إلى JSON",
  minutes: 15,
  singleLanguage: true,
  problem: {
    title: "ثلاث لغات، شكل واحد",
    body: "هذا API واحد للمنتجات مكتوب ثلاث مرات: Node و Go و Python. اختر طلباً وأرسله، وراقب أي سطر يضيء في كل لغة في كل مرحلة. ثم أرسل منتجاً سعره نص وقارن الردود.",
    demo: "pythonServer",
  },
  scene: {
    code: {
      py: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
products = [{"name": "Pen", "price": 3}]

class Product(BaseModel):
    name: str
    price: int

@app.get("/products")
def list_products():
    return products

@app.post("/products", status_code=201)
def add_product(p: Product):
    products.append(p.model_dump())
    return p`,
    },
    notes: {
      py: "في Flask الشكل نفسه: @app.route(\"/products\", methods=[\"POST\"]) فوق الدالة، لكنها تقرأ الجسم بنفسها بـ request.get_json() ولا تفحص الأنواع، فالفحص عليك كما في Express.",
    },
    steps: [
      { line: null, say: "نفس الحلقة التي رأيتها في Node و Go: طلب، ثم مطابقة مسار، ثم دالة، ثم رد. تتغير اللغة ويبقى الشكل. هنا نستعمل FastAPI، وهو حزمة نثبّتها بـ pip.", memory: [] },
      { line: 4, say: "app هو الخادم: كائن بداخله جدول مسارات فارغ الآن، مثل app = express()‎.", memory: [x("routes", "{}")], changed: ["routes"] },
      { line: 5, say: "قائمة المنتجات في الذاكرة، فيها قاموس واحد.", memory: [x("routes", "{}"), one], changed: ["products"] },
      { line: 7, say: "Product يصف شكل المنتج بتلميحات الأنواع: name نص و price عدد صحيح. Python وحدها لا تفحص هذه التلميحات، لكن FastAPI سيقرؤها.", memory: [x("routes", "{}"), one, x("Product", "{ name: str, price: int }")], changed: ["Product"] },
      { line: 11, say: "الزخرفة @ تقول: خذ الدالة التي تحتي وسجّلها في جدول app تحت GET /products. الدالة لا تُنفَّذ الآن، بل تُحفظ فقط.", memory: [getOnly, one, x("Product", "{ name: str, price: int }")], changed: ["routes"] },
      { line: 15, say: "والثانية تُسجَّل تحت POST /products، ومعها رقم الحالة 201 الذي يُرسل عند النجاح. الجدول جاهز، والخادم يستمع.", memory: [both, one, x("Product", "{ name: str, price: int }")], changed: ["routes"] },
      { line: 12, say: "وصل GET /products. يبحث FastAPI في الجدول عن الطريقة والمسار معاً، فيجد list_products ويستدعيها.", memory: [both, one, s("request", "GET /products")], changed: ["request"], read: ["routes"] },
      { line: 13, say: "الدالة ترجع قائمة Python عادية. FastAPI يحوّلها بنفسه إلى نص JSON ويرسلها بالحالة 200: لا json.dumps بيدك ولا res.json.", memory: [both, one, s("request", "GET /products"), n("status", 200)], changed: ["status"], read: ["products"] },
      { line: 16, say: "وصل POST وجسمه {\"name\":\"Book\",\"price\":5}. قبل أن تبدأ الدالة، يقرأ FastAPI التلميح p: Product، ويفحص الجسم: name نص؟ نعم. price عدد صحيح؟ نعم. فيبني p.", memory: [both, one, s("request", "POST /products"), s("p.name", "Book"), n("p.price", 5)], changed: ["request", "p.name", "p.price"] },
      { line: 17, say: "الآن فقط تعمل أسطرك: نضيف المنتج إلى القائمة.", memory: [both, two, s("request", "POST /products"), s("p.name", "Book"), n("p.price", 5)], changed: ["products"] },
      { line: 18, say: "نرجع p، فيحوّله FastAPI إلى JSON ويرسله بالحالة 201 المكتوبة في الزخرفة.", memory: [both, two, s("request", "POST /products"), s("p.name", "Book"), n("p.price", 5), n("status", 201)], changed: ["status"] },
      { line: 16, say: "طلب POST آخر سعره \"cheap\". الفحص يفشل عند price، فيرد FastAPI بنفسه 422 مع رسالة تشرح الحقل الخاطئ. السطر 17 لا يُنفَّذ أصلاً، والقائمة لم تتغير.", memory: [both, two, s("request", "POST /products"), n("status", 422)], changed: ["status"], error: "422: price: Input should be a valid integer" },
    ],
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "هذا قلب أي إطار خادم، مكتوباً بيدك: قاموس routes مفتاحه (الطريقة، المسار) وقيمته دالة، و handle تبحث فيه وتستدعي الدالة. شغّل وراقب القاموس على اليمين: قيمه دوال.",
    starter: `products = ["Pen"]

def list_products(request):
    return {"status": 200, "body": products}

def add_product(request):
    products.append(request["body"])
    return {"status": 201, "body": request["body"]}

routes = {
    ("GET", "/products"): list_products,
    ("POST", "/products"): add_product,
}

def handle(request):
    fn = routes.get((request["method"], request["path"]))
    if fn is None:
        return {"status": 404, "body": "not found"}
    return fn(request)

print(handle({"method": "POST", "path": "/products", "body": "Book"}))
print(handle({"method": "GET", "path": "/products"}))`,
    challenges: [
      "أرسل DELETE إلى /products. أي رقم حالة يعود، ومن أي سطر؟ توقّع قبل أن تضغط.",
      "أضف مساراً جديداً: دالة count ترجع عدد المنتجات، وسجّلها في routes تحت (\"GET\", \"/count\")، ثم اطلبها.",
      "اجعل add_product ترد 422 إن لم يكن request[\"body\"] نصاً (استعمل isinstance)، ثم أرسل body رقماً.",
      "بدّل ترتيب سطري print. هل تظهر Book في رد GET الآن؟ لماذا؟",
    ],
  },
  predict: [
    {
      question: "الزخرفة تسجّل دالة في القاموس. بأي ترتيب تُطبع الأسطر؟",
      lang: "py",
      code: `routes = {}

def register(fn):
    print("register", fn.__name__)
    routes["/hi"] = fn
    return fn

@register
def hi():
    print("hi runs")
    return "hello"

print("server ready")
print(routes["/hi"]())`,
      options: ["register hi / server ready / hi runs / hello", "server ready / hi runs / hello", "register hi / hi runs / server ready / hello"],
      answer: 0,
      why: "@register تعمل لحظة تعريف الدالة، لا لحظة الطلب: تسجّل hi في القاموس وترجعها كما هي. الدالة نفسها لا تعمل إلا حين يستدعيها أحد من القاموس، وهذا ما يفعله الإطار عند وصول طلب.",
    },
    {
      question: "سجّلنا GET فقط، ووصل POST على المسار نفسه. ماذا يُطبع؟",
      lang: "py",
      code: `def list_products(request):
    return 200

routes = {("GET", "/products"): list_products}

def handle(request):
    fn = routes.get((request["method"], request["path"]))
    if fn is None:
        return 404
    return fn(request)

print(handle({"method": "POST", "path": "/products"}))`,
      options: ["404", "200", "خطأ KeyError"],
      answer: 0,
      why: "المفتاح زوج: الطريقة والمسار معاً. (\"POST\", \"/products\") ليس في القاموس حتى لو كان المسار موجوداً بطريقة أخرى، و get ترجع None بدل أن ترمي خطأ، فيرجع الفرع 404.",
    },
    {
      question: "تلميح النوع يقول int. ماذا يُطبع؟",
      lang: "py",
      code: `def double(price: int):
    return price * 2

print(double("5"))`,
      options: ["55", "10", "خطأ: النوع خاطئ"],
      answer: 0,
      why: "Python نفسها لا تفحص التلميحات: هي ملاحظات للقارئ وللأدوات. \"5\" نص، وضرب النص في 2 يكرره. FastAPI هو من يقرأ التلميحات ويفحص المدخلات قبل استدعاء دالتك؛ دالة عادية لا يفحصها أحد.",
    },
  ],
  code: {
    intro: "كيف تصنع @app.get زخرفةً تسجّل في جدول؟ هذه نسخة صغيرة من الفكرة تعمل هنا: route دالة ترجع دالة، والدالة المرجعة تحفظ معالجك في القاموس ثم ترجعه كما هو. FastAPI و Flask يفعلان هذا، ثم يضيفان فوقه الاستماع على منفذ وقراءة HTTP والفحص.",
    runnerLang: "py",
    runnerStarter: `routes = {}

def route(method, path):
    def register(fn):
        routes[(method, path)] = fn
        return fn
    return register

products = ["Pen"]

@route("GET", "/products")
def list_products(request):
    return {"status": 200, "body": products}

@route("POST", "/products")
def add_product(request):
    products.append(request["body"])
    return {"status": 201, "body": request["body"]}

def handle(request):
    fn = routes.get((request["method"], request["path"]))
    if fn is None:
        return {"status": 404, "body": "not found"}
    return fn(request)

print(sorted(routes.keys()))
print(handle({"method": "POST", "path": "/products", "body": "Book"}))
print(handle({"method": "GET", "path": "/products"}))
# جرّب: أضف @route("DELETE", "/products") بدالة تفرغ القائمة، ثم اطلبها
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "py",
      title: "مسار في قاموس",
      prompt: "رتّب الأسطر: عرّف دالة المعالجة، ثم سجّلها في القاموس، ثم استدعها من القاموس واطبع الرد. يجب أن يطبع 200 hi.",
      lines: [
        "def hello(request):",
        '    return {"status": 200, "body": "hi"}',
        'routes = {("GET", "/"): hello}',
        'res = routes[("GET", "/")]({})',
        'print(res["status"], res["body"])',
      ],
      expected: "200 hi",
    },
    {
      kind: "fill",
      lang: "py",
      title: "مفتاح البحث",
      prompt: "بأي مفتاح تبحث handle في القاموس حتى يصل الطلب إلى دالته فيطبع 200؟",
      template: `def home(request):
    return 200

routes = {("GET", "/"): home}

def handle(request):
    fn = routes.get(___)
    if fn is None:
        return 404
    return fn(request)

print(handle({"method": "GET", "path": "/"}))`,
      options: ['(request["method"], request["path"])', 'request["path"]', 'request["method"]'],
      expected: "200",
    },
    {
      kind: "fix",
      lang: "py",
      title: "خادم يسقط عند مسار مجهول",
      prompt: "الطلب الثاني لمسار غير مسجّل يُسقط البرنامج بخطأ KeyError. أصلح handle حتى ترد 404 بدل أن تسقط، فيطبع 200 ثم 404.",
      code: `def home(request):
    return {"status": 200}

routes = {("GET", "/"): home}

def handle(request):
    fn = routes[(request["method"], request["path"])]
    return fn(request)

print(handle({"method": "GET", "path": "/"})["status"])
print(handle({"method": "GET", "path": "/blog"})["status"])`,
      expected: "200\n404",
      hint: "استعمل routes.get(...)‎ فترجع None بدل الخطأ، ثم: if fn is None: return {\"status\": 404}",
      solution: `def home(request):
    return {"status": 200}

routes = {("GET", "/"): home}

def handle(request):
    fn = routes.get((request["method"], request["path"]))
    if fn is None:
        return {"status": 404}
    return fn(request)

print(handle({"method": "GET", "path": "/"})["status"])
print(handle({"method": "GET", "path": "/blog"})["status"])`,
    },
    {
      kind: "write",
      lang: "py",
      title: "افحص قبل أن تحفظ",
      prompt: "اكتب add_product(body) كما يفعل FastAPI: إن لم يكن body[\"price\"] عدداً صحيحاً (isinstance(..., int)) فأرجع {\"status\": 422} دون إضافة شيء، وإلا أضف body إلى products وأرجع {\"status\": 201}.",
      starter: `products = [{"name": "Pen", "price": 3}]
# اكتب add_product(body) هنا

print(add_product({"name": "Book", "price": 5})["status"])
print(add_product({"name": "Bag", "price": "cheap"})["status"])
print(len(products))`,
      expected: "201\n422\n2",
      hint: "def add_product(body):  ثم  if not isinstance(body[\"price\"], int): return {\"status\": 422}  ثم append و return {\"status\": 201}",
      solution: `products = [{"name": "Pen", "price": 3}]

def add_product(body):
    if not isinstance(body["price"], int):
        return {"status": 422}
    products.append(body)
    return {"status": 201}

print(add_product({"name": "Book", "price": 5})["status"])
print(add_product({"name": "Bag", "price": "cheap"})["status"])
print(len(products))`,
    },
  ],
  quiz: [
    {
      question: "وصل الطلب GET /products/abc. ماذا يحدث؟",
      code: `@app.get("/products/{id}")
def get_product(id: int):
    return {"id": id}`,
      options: ["FastAPI يرد 422 ولا تُستدعى get_product", "تُستدعى الدالة و id يساوي \"abc\"", "404 لأن abc ليس منتجاً"],
      answer: 0,
      why: "{id} في المسار يلتقط abc، والتلميح id: int يطلب عدداً. FastAPI يفحص قبل الاستدعاء، فيرفض الطلب بـ 422 «المدخل لا يطابق النوع». دالتك لا ترى إلا مدخلات صحيحة.",
    },
    {
      question: "وصل الطلب GET /products/7. ماذا يحمل جسم الرد؟",
      code: `@app.get("/products/{id}")
def get_product(id: int):
    return {"next": id + 1}`,
      options: ["{\"next\": 8}", "{\"next\": \"71\"}", "خطأ لأن المسار نص"],
      answer: 0,
      why: "كل ما في المسار يصل نصاً \"7\"، لكن FastAPI يقرأ التلميح int فيحوّله إلى العدد 7 قبل أن يعطيه لدالتك. لذلك id + 1 جمع لا لصق.",
    },
    {
      question: "دالة POST نجحت. أي رقم حالة يصل للعميل؟",
      code: `@app.post("/products")
def add_product(p: Product):
    products.append(p)
    return p`,
      options: ["200", "201", "204"],
      answer: 0,
      why: "FastAPI يرسل 200 ما لم تقل غير ذلك. «أنشأت شيئاً جديداً» تحتاج status_code=201 في الزخرفة، كما كتبنا res.status(201) في Express و w.WriteHeader(201) في Go.",
    },
    {
      question: "الدالة ترجع قاموساً. ماذا يصل إلى العميل؟",
      code: `@app.get("/me")
def me():
    return {"name": "Sara", "admin": False}`,
      options: ["نص JSON فيه \"admin\": false مع Content-Type: application/json", "نص Python فيه 'admin': False", "لا شيء، لأن الدالة لم تكتب الرد"],
      answer: 0,
      why: "أنت ترجع قيمة Python، و FastAPI يكتب الرد: يحوّل القاموس إلى JSON (False تصير false) ويضع الترويسة المناسبة. في Node كتبت res.json بنفسك، وفي Go كتبت Encode.",
    },
    {
      question: "أي جزء هو نفسه في خوادم Node و Go و Python؟",
      options: ["طلب يُطابَق بطريقته ومساره مع دالة، والدالة تنتج ردّاً برقم حالة وجسم", "طريقة كتابة المسار: app.get في الثلاثة", "كلها تعالج الطلبات على خيط واحد"],
      answer: 0,
      why: "اللغة تغيّر الكتابة: app.get في Express، و HandleFunc في Go، و @app.get في FastAPI، ونموذج التنفيذ يختلف أيضاً. لكن الحلقة واحدة: جدول مسارات يوصل كل طلب إلى دالة، والدالة ترجع ردّاً.",
    },
  ],
  next: "auth",
};
