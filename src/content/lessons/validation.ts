import type { Cell, Lesson } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const n = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const raw = (name: string, value: string): Cell => ({ name, value, type: "none" });

const bad = [s("name", ""), s("age", "15")];
const good = [s("name", "Sara"), n("age", 15)];

export const validation: Lesson = {
  slug: "validation",
  stage: 7,
  number: "7.6",
  title: "التحقق من المدخلات",
  subtitle: "كل طلب يأتي من غريب، فافحصه عند الباب قبل أن يدخل",
  minutes: 16,
  problem: {
    title: "النموذج يفحص… فهل يكفي؟",
    body: "سجّل مستخدماً عبر النموذج، ثم أطفئ فحص المتصفح، ثم اضغط «أرسل مباشرة» لتتجاوز النموذج كله. راقب قاعدة البيانات: أي صف أحمر هو بيانات فاسدة دخلت. ثم شغّل تحقق الخادم وأعد المحاولة.",
    demo: "validation",
  },
  scene: {
    code: {
      js: `let users = [];
function signUp(body) {
  let errors = [];
  if (typeof body.name !== "string" || body.name === "") errors.push("name is required");
  if (typeof body.age !== "number" || body.age < 13) errors.push("age must be a number, 13+");
  if (errors.length > 0) return { status: 400, errors: errors };
  users.push(body);
  return { status: 201, errors: [] };
}`,
      py: `users = []
def sign_up(body):
    errors = []
    if not isinstance(body.get("name"), str) or body["name"] == "": errors.append("name is required")
    if type(body.get("age")) is not int or body["age"] < 13: errors.append("age must be a number, 13+")
    if errors: return {"status": 400, "errors": errors}
    users.append(body)
    return {"status": 201, "errors": []}
`,
      go: `var users []map[string]any
func signUp(body map[string]any) Response {
	errors := []string{}
	if name, ok := body["name"].(string); !ok || name == "" { errors = append(errors, "name is required") }
	if age, ok := body["age"].(float64); !ok || age < 13 { errors = append(errors, "age must be a number, 13+") }
	if len(errors) > 0 { return Response{Status: 400, Errors: errors} }
	users = append(users, body)
	return Response{Status: 201}
}`,
    },
    notes: {
      js: "في Express يصل الجسم كائناً من JSON، ومكتبات مثل zod تكتب هذه الشروط كوصف للشكل المتوقع، لكنها تفعل الشيء نفسه: قائمة أخطاء، ثم 400.",
      py: "في Python نفحص النوع بـ isinstance أو type. و type(...) is not int ترفض True أيضاً، لأن True في Python عدد صحيح متنكّر. ومكتبة pydantic (في FastAPI) تفحص الشكل كله.",
      go: "Go يفرض الأنواع حين يفك JSON إلى struct، فنص في خانة رقم يرجع خطأ فوراً. لكنه لا يفحص الطول ولا المدى: نصاً فارغاً ورقماً سالباً يمرّان، فهذه الفحوص تبقى عليك. (هنا جسم عام map، والأرقام فيه float64.)",
    },
    steps: [
      { line: null, say: "النموذج في الصفحة يمنع حقلاً فارغاً. لكن هذا الطلب لم يمرّ بالنموذج: أرسله شخص مباشرة بأداة مثل curl. جسمه: name فارغ، و age بين علامتي تنصيص \"15\"، أي نص.", memory: bad },
      { line: 1, say: "users هي قاعدة بياناتنا: ما يدخلها يبقى، ويقرؤه كل كود بعدها.", memory: [...bad, n("users.length", 0)], changed: ["users.length"] },
      { line: 3, say: "قائمة أخطاء فارغة. لن نتوقف عند أول خطأ: نجمعها كلها ليعرف المرسل كل ما يصلحه مرة واحدة.", memory: [...bad, raw("errors", "[]"), n("users.length", 0)], changed: ["errors"] },
      { line: 4, say: "هل name نص غير فارغ؟ هو نص، لكنه فارغ. الشرط صحيح، فنضيف «name is required».", memory: [...bad, raw("errors", '["name is required"]'), n("users.length", 0)], changed: ["errors"], read: ["name"] },
      { line: 5, say: "هل age رقم؟ typeof \"15\" هو \"string\". يبدو رقماً لكنه نص، ولو خزّناه لصار age + 1 يساوي \"151\". الشرط صحيح: خطأ ثانٍ.", memory: [...bad, raw("errors", '["name is required", "age must be..."]'), n("users.length", 0)], changed: ["errors"], read: ["age"] },
      { line: 6, say: "في القائمة خطآن، فالشرط صحيح: نرد 400 ومعه الأخطاء، ونخرج من الدالة. السطر 7 لا يُنفَّذ، وقاعدة البيانات لم تُلمس.", memory: [...bad, raw("errors", '["name is required", "age must be..."]'), n("status", 400), n("users.length", 0)], changed: ["status"], read: ["errors"] },
      { line: 7, say: "تخيّل الخادم بلا الأسطر 4 إلى 6: كان سيصل التنفيذ إلى هنا ويحفظ مستخدماً بلا اسم وعمر نصي. صف فاسد في القاعدة، وكل كود يقرؤه لاحقاً قد يتعثر به.", memory: [...bad, n("users.length", 1)], changed: ["users.length"], error: "بيانات فاسدة دخلت القاعدة" },
      { line: 2, say: "طلب جديد، وهذه المرة سليم: name هو \"Sara\" و age الرقم 15 بلا تنصيص.", memory: [...good, n("users.length", 0)], changed: ["name", "age"] },
      { line: 4, say: "name نص غير فارغ: الشرط خاطئ. وفي السطر 5: age رقم و 15 ليست أقل من 13: خاطئ أيضاً. القائمة بقيت فارغة.", memory: [...good, raw("errors", "[]"), n("users.length", 0)], read: ["name", "age"] },
      { line: 7, say: "لا أخطاء، فنتجاوز السطر 6. الآن فقط، بعد الفحص عند الباب، تدخل البيانات القاعدة.", memory: [...good, raw("errors", "[]"), n("users.length", 1)], changed: ["users.length"] },
      { line: 8, say: "201 Created. كل ما بعد هذه الدالة يستطيع أن يثق أن name نص وأن age رقم 13 فأكثر، لأن الباب فحص كل داخل.", memory: [...good, n("status", 201), n("users.length", 1)], changed: ["status"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "validate تفحص الجسم وترجع قائمة أخطاء، و handle ترد 400 بالقائمة أو تحفظ وترد 201. الطلب في الأسفل أُرسل مباشرة، بلا نموذج. توقّع الرد قبل أن تشغّل.",
    starter: `let users = [];

function validate(body) {
  let errors = [];
  if (typeof body.name !== "string" || body.name.trim() === "") {
    errors.push("name is required");
  } else if (body.name.length > 20) {
    errors.push("name is too long (max 20)");
  }
  if (typeof body.email !== "string" || !body.email.includes("@")) {
    errors.push("email must contain @");
  }
  if (typeof body.age !== "number" || body.age < 13 || body.age > 120) {
    errors.push("age must be a number from 13 to 120");
  }
  return errors;
}

function handle(request) {
  let errors = validate(request.body);
  if (errors.length > 0) {
    return { status: 400, body: errors };
  }
  users.push(request.body);
  return { status: 201, body: "saved" };
}

let res = handle({ method: "POST", path: "/users", body: { name: "Sara", email: "sara@mail.com", age: "15" } });
console.log(res.status, res.body);
console.log(users.length);`,
    challenges: [
      "أصلح age إلى الرقم 15 بلا تنصيص. ما الحالة الآن، وكم صار طول users؟",
      "اجعل name مسافات فقط \"   \". لماذا رُفض رغم أنه ليس نصاً فارغاً؟",
      "احذف email من الجسم كله. هل ينهار الخادم أم يرد 400؟ تتبّع السطر الذي أنقذه.",
      "أضف فحصاً جديداً: email لا يتجاوز 50 حرفاً. ثم أرسل بريداً طويلاً بـ \"a\".repeat(60) + \"@x.com\".",
    ],
  },
  predict: [
    {
      question: "خادم بلا تحقق حفظ age كما وصل. بعد سنة نريد العمر الجديد. ماذا يُطبع؟",
      code: `let users = [];
function handle(request) {
  users.push(request.body);
  return 201;
}
handle({ body: { name: "Sara", age: "15" } });
console.log(users[0].age + 1);`,
      options: ["151", "16", "400"],
      answer: 0,
      why: "\"15\" نص، و + بين نص ورقم تلصق: \"151\". الخطأ لم يظهر وقت الحفظ، بل بعده في مكان آخر. التحقق عند الباب يمنع هذا من البداية.",
    },
    {
      question: "النموذج في الصفحة يفحص العمر. لكن أحدهم أرسل الطلب مباشرة. ماذا يُطبع؟",
      code: `function formCheck(body) {
  return body.age >= 13;
}
let users = [];
function handle(request) {
  users.push(request.body);
  return 201;
}
let status = handle({ body: { age: -5 } });
console.log(status, users.length);`,
      options: ["201 1", "400 0", "201 0"],
      answer: 0,
      why: "formCheck تعيش في المتصفح ولم يستدعها أحد، فالطلب لم يمرّ بالنموذج أصلاً. الخادم وحده يقرر ما يدخل، وهذا الخادم لا يفحص شيئاً، فدخل عمر سالب.",
    },
    {
      question: "ماذا يُطبع؟",
      lang: "py",
      code: `def validate(body):
    errors = []
    if not body.get("name"):
        errors.append("name is required")
    return errors

print(len(validate({"name": "   "})))`,
      options: ["0", "1", "خطأ"],
      answer: 0,
      why: "not \"   \" خاطئ، لأن نص المسافات ليس فارغاً في نظر Python. فمرّ اسم لا يُرى. افحص name.strip() == \"\" لتلتقط المسافات.",
    },
  ],
  code: {
    intro: "الخادم نفسه بـ Python، كما في درس خادم Python: validate تجمع الأخطاء، و handle ترد 400 أو تحفظ. لاحظ type(age) is not int التي ترفض النص \"15\" و True معاً.",
    runnerLang: "py",
    runnerStarter: `users = []

def validate(body):
    errors = []
    name = body.get("name")
    if not isinstance(name, str) or name.strip() == "":
        errors.append("name is required")
    elif len(name) > 20:
        errors.append("name is too long (max 20)")
    email = body.get("email")
    if not isinstance(email, str) or "@" not in email:
        errors.append("email must contain @")
    age = body.get("age")
    if type(age) is not int or age < 13 or age > 120:
        errors.append("age must be a number from 13 to 120")
    return errors

def handle(request):
    errors = validate(request["body"])
    if errors:
        return {"status": 400, "body": errors}
    users.append(request["body"])
    return {"status": 201, "body": "saved"}

# a stranger sends these directly, no form involved
print(handle({"method": "POST", "path": "/users", "body": {"name": "Sara", "email": "sara", "age": "15"}}))
print(handle({"method": "POST", "path": "/users", "body": {"name": "Sara", "email": "sara@mail.com", "age": 15}}))
print(len(users), "saved")
# جرّب: أرسل جسماً بلا name أصلاً، أو age = True. ماذا يرد الخادم؟
`,
  },
  exercises: [
    {
      kind: "order",
      title: "افحص ثم قرّر",
      prompt: "رتّب الأسطر حتى يفحص الخادم العمر، ثم يختار الحالة من قائمة الأخطاء، فيطبع 400 age must be a number.",
      lines: [
        "let errors = [];",
        'let age = "abc";',
        'if (typeof age !== "number") errors.push("age must be a number");',
        "let status = errors.length > 0 ? 400 : 201;",
        "console.log(status, errors[0]);",
      ],
      expected: "400 age must be a number",
    },
    {
      kind: "fill",
      title: "حدّ أعلى للعمر",
      lang: "py",
      prompt: "العمر يجب أن يكون من 13 إلى 120. أي مقارنة تجعل العمر 150 يُرفض فيُطبع 400؟",
      template: `age = 150
if age < 13 or age ___ 120:
    print(400)
else:
    print(201)`,
      options: [">", "<", "=="],
      expected: "400",
    },
    {
      kind: "fix",
      title: "عمر من حروف",
      prompt: "الخادم يفحص age < 13 فقط، فالعمر \"abc\" يمرّ ويُحفظ ويطبع 201. أصلحه حتى يرد 400 على أي عمر ليس رقماً.",
      code: `let users = [];
function handle(request) {
  let age = request.body.age;
  if (age < 13) {
    return 400;
  }
  users.push(request.body);
  return 201;
}
console.log(handle({ body: { name: "Sara", age: "abc" } }));`,
      expected: "400",
      hint: "\"abc\" < 13 خاطئ، لأن \"abc\" لا يتحول إلى رقم. افحص النوع أولاً: typeof age !== \"number\" || age < 13.",
      solution: `let users = [];
function handle(request) {
  let age = request.body.age;
  if (typeof age !== "number" || age < 13) {
    return 400;
  }
  users.push(request.body);
  return 201;
}
console.log(handle({ body: { name: "Sara", age: "abc" } }));`,
    },
    {
      kind: "write",
      title: "مدقّق التسجيل",
      lang: "py",
      prompt: "أكمل validate: الاسم نص طوله من 3 إلى 20 وإلا أضف \"name must be 3-20 letters\"، والبريد يحتوي @ وإلا أضف \"email must contain @\". أرجع القائمة.",
      starter: `def validate(body):
    errors = []
    # name: a string of 3 to 20 letters -> "name must be 3-20 letters"
    # email: must contain @ -> "email must contain @"
    return errors

print(validate({"name": "Sa", "email": "sara.mail.com"}))
print(validate({"name": "Sara", "email": "sara@mail.com"}))`,
      expected: "['name must be 3-20 letters', 'email must contain @']\n[]",
      hint: "name = body.get(\"name\") ثم: if not isinstance(name, str) or not 3 <= len(name) <= 20. وللبريد: \"@\" not in email.",
      solution: `def validate(body):
    errors = []
    name = body.get("name")
    if not isinstance(name, str) or not 3 <= len(name) <= 20:
        errors.append("name must be 3-20 letters")
    email = body.get("email")
    if not isinstance(email, str) or "@" not in email:
        errors.append("email must contain @")
    return errors

print(validate({"name": "Sa", "email": "sara.mail.com"}))
print(validate({"name": "Sara", "email": "sara@mail.com"}))`,
    },
  ],
  quiz: [
    {
      question: "في الصفحة: <input name=\"bio\" maxlength=\"100\">. الخادم لا يفحص الطول. أرسل أحدهم هذا الطلب. ماذا يُحفظ؟",
      code: 'curl -X POST https://shop.com/users \\\n  -d \'{"bio": "aaaa...(10000 letters)"}\'',
      options: ["النص كاملاً: 10000 حرف", "أول 100 حرف فقط", "لا شيء، المتصفح يمنعه"],
      answer: 0,
      why: "maxlength تعيش في المتصفح، و curl ليس متصفحاً. الطلب وصل الخادم مباشرة، والخادم وحده يستطيع أن يرفضه. فحوص المتصفح لراحة المستخدم الأمين، لا لحماية الخادم.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'function validate(body) {\n  let errors = [];\n  if (body.age < 0) errors.push("age can not be negative");\n  return errors;\n}\nlet errors = validate({ age: -3 });\nconsole.log(errors.length > 0 ? 400 : 201, errors[0]);',
      options: ["400 age can not be negative", "201 undefined", "400 undefined"],
      answer: 0,
      why: "-3 أقل من 0، فدخلت رسالة إلى القائمة. القائمة غير فارغة، فالحالة 400، والرد يحمل السبب ليعرف المرسل ماذا يصلح.",
    },
    {
      question: "خادم يبني جملة SQL بلصق ما كتبه المستخدم. كتب أحدهم هذا الاسم. ماذا يُطبع؟",
      code: 'let name = "x\' OR \'1\'=\'1";\nlet sql = "SELECT * FROM users WHERE name = \'" + name + "\'";\nconsole.log(sql);',
      options: ["SELECT * FROM users WHERE name = 'x' OR '1'='1'", "SELECT * FROM users WHERE name = 'x OR 1=1'", "خطأ: الاسم فيه علامات تنصيص"],
      answer: 0,
      why: "علامة التنصيص في الاسم أغلقت نص SQL مبكراً، فصار باقي الاسم أوامر: «أو 1 يساوي 1» صحيح دائماً، فتعود كل الصفوف. هذا حقن SQL، وعلاجه في دروس SQL: لا تلصق المدخلات في الجملة أبداً.",
    },
    {
      question: "صفحة الملف الشخصي تعرض الاسم بلصقه في HTML. سجّل أحدهم بهذا الاسم. ماذا يحدث لكل من يفتح صفحته؟",
      code: 'let name = "<script>steal(document.cookie)</script>";\nlet html = "<p>Hello " + name + "</p>";',
      options: ["يشغّل متصفحه السكربت", "يرى النص مكتوباً كما هو", "الخادم يرفض الطلب تلقائياً"],
      answer: 0,
      why: "المتصفح لا يعرف أن هذا «اسم»، يرى وسم script فينفّذه. هذا XSS. العلاج: حوّل < و > إلى رموز آمنة قبل اللصق (React يفعلها عنك)، وارفض الأسماء الغريبة عند الباب. و HttpOnly تحمي الكوكي هنا.",
    },
    {
      question: "طلب بلا name أصلاً. ماذا يحدث؟",
      code: 'function handle(request) {\n  let name = request.body.name.trim();\n  return { status: 201, body: name };\n}\nhandle({ body: { age: 20 } });',
      options: ["TypeError، فيرد الخادم 500", "201 بجسم فارغ", "400 name is required"],
      answer: 0,
      why: "request.body.name غير موجود، أي undefined، و undefined لا تملك trim، فينهار الكود ويرد الإطار 500: «المشكلة عندي». لكن المشكلة في الطلب! فحص الوجود أولاً يحوّلها إلى 400 بسبب واضح.",
    },
  ],
  next: "sql",
};
