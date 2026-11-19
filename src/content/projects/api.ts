import type { Project } from "@/lib/types";

export const api: Project = {
  slug: "api",
  stage: 7,
  title: "API كامل",
  brief:
    "تبني خادم REST لمنتجات المتجر، لكن بلا شبكة: الخادم دالة handle(request) تأخذ طلباً { method, path, body } وترجع رداً { status, body }، والبيانات مصفوفة في الذاكرة. هكذا يعمل كل خادم حقيقي من الداخل: يقرأ الطريقة والمسار، يتحقق من المدخلات، ويرجع رمز الحالة المناسب.",
  lang: "js",
  steps: [
    "لاحظ المصفوفة products ومتغير nextId. كل منتج { id, name, price }. الدالة handle هي الخادم كله: كل طلب يمر منها.",
    "GET /products: أرجع { status: 200, body: products } (القائمة كاملة).",
    "GET /products/:id: افصل الرقم من آخر المسار (مثلاً \"/products/2\" تعطي 2) وابحث عن المنتج. إذا وجدته أرجع 200 والمنتج، وإلا أرجع { status: 404, body: { error: \"not found\" } }.",
    "اكتب validate(body) التي ترجع رسالة خطأ نصية أو null: الاسم name يجب أن يكون نصاً غير فارغ، والسعر price رقماً أكبر من أو يساوي 0. الجسم الناقص (undefined) خطأ أيضاً.",
    "POST /products: إذا رجعت validate رسالة، أرجع { status: 400, body: { error: الرسالة } }. وإلا أنشئ منتجاً جديداً بـ id = nextId (ثم زِد nextId)، أضفه إلى المصفوفة وأرجع 201 والمنتج الجديد.",
    "PUT /products/:id: إذا لم يوجد المنتج فـ 404، وإذا فشل التحقق فـ 400، وإلا حدّث name و price وأرجع 200 والمنتج بعد التحديث.",
    "DELETE /products/:id: إذا لم يوجد فـ 404، وإلا احذفه من المصفوفة (splice) وأرجع { status: 204, body: null }.",
    "أي طريقة أو مسار آخر يرجع 404 أيضاً. ثم اضغط «شغّل الاختبارات».",
  ],
  starter: `const products = [
  { id: 1, name: "Keyboard", price: 120 },
  { id: 2, name: "Mouse", price: 45 },
];
let nextId = 3;

function validate(body) {
  // أرجع رسالة خطأ نصية، أو null إذا كان الجسم سليماً
  return null;
}

function handle(request) {
  const { method, path, body } = request;
  // GET /products
  // GET /products/:id
  // POST /products
  // PUT /products/:id
  // DELETE /products/:id
  return { status: 404, body: { error: "not found" } };
}

console.log(handle({ method: "GET", path: "/products" }));
`,
  solution: `const products = [
  { id: 1, name: "Keyboard", price: 120 },
  { id: 2, name: "Mouse", price: 45 },
];
let nextId = 3;

function validate(body) {
  if (!body || typeof body.name !== "string" || body.name.trim() === "") {
    return "name is required";
  }
  if (typeof body.price !== "number" || body.price < 0) {
    return "price must be a number >= 0";
  }
  return null;
}

function notFound() {
  return { status: 404, body: { error: "not found" } };
}

function handle(request) {
  const { method, path, body } = request;
  const parts = path.split("/").filter((p) => p !== "");
  if (parts[0] !== "products" || parts.length > 2) {
    return notFound();
  }

  if (parts.length === 1) {
    if (method === "GET") {
      return { status: 200, body: products };
    }
    if (method === "POST") {
      const error = validate(body);
      if (error) {
        return { status: 400, body: { error } };
      }
      const product = { id: nextId, name: body.name, price: body.price };
      nextId++;
      products.push(product);
      return { status: 201, body: product };
    }
    return notFound();
  }

  const id = Number(parts[1]);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return notFound();
  }
  if (method === "GET") {
    return { status: 200, body: products[index] };
  }
  if (method === "PUT") {
    const error = validate(body);
    if (error) {
      return { status: 400, body: { error } };
    }
    products[index].name = body.name;
    products[index].price = body.price;
    return { status: 200, body: products[index] };
  }
  if (method === "DELETE") {
    products.splice(index, 1);
    return { status: 204, body: null };
  }
  return notFound();
}
`,
  tests: [
    { name: "GET /products يرجع 200 والقائمة كاملة", code: `const r = handle({ method: "GET", path: "/products" });
console.log(r.status === 200 && Array.isArray(r.body) && r.body.length === 2 && r.body[1].name === "Mouse");` },
    { name: "GET /products/2 يرجع المنتج المطلوب", code: `const r = handle({ method: "GET", path: "/products/2" });
console.log(r.status === 200 && r.body.id === 2 && r.body.name === "Mouse" && r.body.price === 45);` },
    { name: "GET لمنتج غير موجود يرجع 404 ورسالة خطأ", code: `const r = handle({ method: "GET", path: "/products/99" });
console.log(r.status === 404 && typeof r.body.error === "string");` },
    { name: "POST ينشئ منتجاً بـ id جديد (201) ويظهر في القائمة", code: `const r = handle({ method: "POST", path: "/products", body: { name: "Screen", price: 800 } });
const all = handle({ method: "GET", path: "/products" });
console.log(r.status === 201 && r.body.id === 3 && r.body.name === "Screen" && all.body.length === 3 && handle({ method: "GET", path: "/products/3" }).body.price === 800);` },
    { name: "POST بلا اسم أو باسم فارغ يرجع 400 ورسالة خطأ", code: `const a = handle({ method: "POST", path: "/products", body: { price: 10 } });
const b = handle({ method: "POST", path: "/products", body: { name: "  ", price: 10 } });
const c = handle({ method: "POST", path: "/products" });
console.log(a.status === 400 && typeof a.body.error === "string" && b.status === 400 && c.status === 400 && handle({ method: "GET", path: "/products" }).body.length === 2);` },
    { name: "POST بسعر سالب أو غير رقمي يرجع 400", code: `const a = handle({ method: "POST", path: "/products", body: { name: "Pen", price: -5 } });
const b = handle({ method: "POST", path: "/products", body: { name: "Pen", price: "5" } });
console.log(a.status === 400 && b.status === 400 && typeof b.body.error === "string");` },
    { name: "PUT يحدّث المنتج ويرجع 200 والقيم الجديدة", code: `const r = handle({ method: "PUT", path: "/products/1", body: { name: "Keyboard Pro", price: 150 } });
const g = handle({ method: "GET", path: "/products/1" });
console.log(r.status === 200 && r.body.name === "Keyboard Pro" && g.body.price === 150);` },
    { name: "PUT يرجع 404 لمنتج غير موجود و 400 لبيانات خاطئة", code: `const a = handle({ method: "PUT", path: "/products/99", body: { name: "X", price: 1 } });
const b = handle({ method: "PUT", path: "/products/1", body: { name: "", price: 1 } });
console.log(a.status === 404 && b.status === 400 && handle({ method: "GET", path: "/products/1" }).body.name === "Keyboard");` },
    { name: "DELETE يحذف المنتج (204) ثم يصبح 404", code: `const r = handle({ method: "DELETE", path: "/products/1" });
console.log(r.status === 204 && handle({ method: "GET", path: "/products/1" }).status === 404 && handle({ method: "GET", path: "/products" }).body.length === 1 && handle({ method: "DELETE", path: "/products/1" }).status === 404);` },
    { name: "مسار غير معروف يرجع 404", code: `console.log(handle({ method: "GET", path: "/users" }).status === 404);` },
  ],
};
