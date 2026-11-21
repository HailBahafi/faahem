import type { Project } from "@/lib/types";

const data = `type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };

interface User {
  id: UserId;
  name: string;
  email: string;
}
interface Order {
  id: OrderId;
  userId: UserId;
  total: number; // halalas
}

// The API's contract: one entry per route, with what goes in and what comes back.
interface Routes {
  "GET /users/:id": { params: { id: UserId }; body: undefined; response: User };
  "GET /users/:id/orders": { params: { id: UserId }; body: undefined; response: Order[] };
  "POST /orders": { params: Record<string, never>; body: { userId: UserId; total: number }; response: Order };
}
type RouteKey = keyof Routes;

// A fake server in memory. It answers like a real HTTP API: a status and JSON text.
// One record is broken on purpose: real servers send bad data too.
const db: { users: unknown[]; orders: unknown[] } = {
  users: [
    { id: "u_1", name: "Sara", email: "sara@example.com" },
    { id: "u_2", name: "Omar", email: "omar@example.com" },
    { id: "u_3", name: 42, email: null },
  ],
  orders: [{ id: "o_1", userId: "u_1", total: 1250 }],
};

function fakeServer(method: string, path: string, body?: string): { status: number; text: string } {
  const parts = path.split("/");
  if (method === "GET" && parts[1] === "users" && parts.length === 3) {
    const user = db.users.find((u) => (u as { id: unknown }).id === parts[2]);
    return user === undefined ? { status: 404, text: "{}" } : { status: 200, text: JSON.stringify(user) };
  }
  if (method === "GET" && parts[1] === "users" && parts[3] === "orders") {
    const orders = db.orders.filter((o) => (o as { userId: unknown }).userId === parts[2]);
    return { status: 200, text: JSON.stringify(orders) };
  }
  if (method === "POST" && path === "/orders" && body !== undefined) {
    const input = JSON.parse(body) as { userId: string; total: number };
    const order = { id: "o_" + (db.orders.length + 1), userId: input.userId, total: input.total };
    db.orders.push(order);
    return { status: 201, text: JSON.stringify(order) };
  }
  return { status: 404, text: "{}" };
}
`;

const usage = `const sara = request("GET /users/:id", { id: userId("u_1") });
console.log(sara.ok ? sara.data.name : sara.error);
`;

export const tsTypedApiClient: Project = {
  slug: "ts-typed-api-client",
  stage: 0,
  track: "ts",
  level: 3,
  title: "عميل API آمن النوع",
  brief:
    "كل تطبيق يتكلم مع خادم، وأكثر الأخطاء تولد على هذا الحد: رابط مكتوب خطأ، أو معرّف مستخدم مكان معرّف طلب، أو خادم يرسل بيانات لا تشبه ما وعد به. تبني هنا عميلاً لـ API من خريطة مسارات واحدة (Routes): كل مسار يعرف معاملاته وجسم طلبه ونوع جوابه، والمدقّق يمنع أي استدعاء لا يطابقها. تجمع كل ما في المستوى: المعرّفات الموسومة وأبوابها، و infer مع template literal types لاستخراج أسماء المعاملات من نص المسار، و mapped type يجبرك على مدقّق لكل مسار، والأنواع الشرطية والفهرسة لنوع الجواب. ولأن الأنواع تُمحى وقت التشغيل، يفحص العميل كل جواب فعلاً قبل أن يسمّيه User. الخادم مزيف في الذاكرة، وفيه سجل معطوب عمداً. الاختبارات تفحص السلوك؛ وفي محررك سيفحص tsc --strict الأنواع.",
  lang: "ts",
  steps: [
    "اقرأ الأنواع والخادم المزيف. Routes هي العقد: مفتاحها \"الطريقة المسار\"، وقيمتها params و body و response. لاحظ أن fakeServer يرجع نصاً، لا كائنات مكتوبة الأنواع: هذا ما يصل من الشبكة فعلاً.",
    "اكتب البابين userId(raw) و orderId(raw): الأول يقبل فقط u_ ثم أرقام (/^u_\\d+$/)، والثاني o_ ثم أرقام، وإلا يرمي Error برسالة \"bad user id: \" + raw (أو \"bad order id: \"). ثم as مرة واحدة.",
    "اكتب النوع ParamNames<P> بـ infer: من \"/users/:id/orders\" يخرج \"id\"، ومن \"/a/:x/b/:y\" يخرج \"x\" | \"y\" (نوع عودي كما في درس infer). ثم buildPath(pattern, params): استبدل كل جزء يبدأ بـ : بقيمته (مع encodeURIComponent)، وارمِ Error(\"missing param: \" + name) إن غابت القيمة.",
    "اكتب حارسي الأنواع isUser(x: unknown): x is User و isOrder(x: unknown): x is Order. افحص كل حقل بـ typeof، وافحص صيغة المعرّفات بالتعبير نفسه الذي في البابين، و total عدد صحيح (Number.isInteger).",
    "أكمل validators: نوعه mapped type على RouteKey، فيجبرك المدقّق على مدقّق لكل مسار، ويعرف أن مدقّق \"GET /users/:id/orders\" يجب أن يثبت Order[]. اكتبه: Array.isArray(x) && x.every(isOrder).",
    "اكتب request(route, params, body?): افصل الطريقة عن المسار عند أول مسافة، وابنِ المسار بـ buildPath، واستدعِ fakeServer (body يُرسل JSON.stringify إن وُجد). إن لم تكن الحالة بين 200 و 299 أرجع { ok: false, error: \"HTTP \" + status }.",
    "ثم حلّل النص بـ JSON.parse إلى unknown، ومرّره على validators[route]. إن رفضه أرجع { ok: false, error: \"invalid response\" }، وإلا { ok: true, data }. لاحظ أن المدقّق يعرف نوع data من الحارس، بلا as.",
    "اضغط «شغّل الاختبارات». ثم جرّب في محررك: request(\"GET /users/:id\", { id: \"u_1\" }) بنص عادي، أو request(\"GET /user/:id\", ...) بمسار خاطئ. كلاهما خط أحمر قبل التشغيل.",
  ],
  starter: `${data}
function userId(raw: string): UserId {
  return raw as UserId; // check the format first
}

function orderId(raw: string): OrderId {
  return raw as OrderId;
}

// Replace with a type that pulls "id" out of "/users/:id" (infer + template literal types).
type ParamNames<P extends string> = string;

function buildPath<P extends string>(pattern: P, params: Record<ParamNames<P>, string>): string {
  return pattern;
}

function isUser(x: unknown): x is User {
  return false;
}

function isOrder(x: unknown): x is Order {
  return false;
}

const validators: { [K in RouteKey]: (x: unknown) => x is Routes[K]["response"] } = {
  "GET /users/:id": isUser,
  "GET /users/:id/orders": (x): x is Order[] => false,
  "POST /orders": isOrder,
};

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

function request<K extends RouteKey>(
  route: K,
  params: Routes[K]["params"],
  body?: Routes[K]["body"],
): Result<Routes[K]["response"]> {
  return { ok: false, error: "not implemented" };
}

${usage}`,
  solution: `${data}
function userId(raw: string): UserId {
  if (!/^u_\\d+$/.test(raw)) throw new Error("bad user id: " + raw);
  return raw as UserId;
}

function orderId(raw: string): OrderId {
  if (!/^o_\\d+$/.test(raw)) throw new Error("bad order id: " + raw);
  return raw as OrderId;
}

type ParamNames<P extends string> = P extends \`\${string}:\${infer N}/\${infer Rest}\`
  ? N | ParamNames<Rest>
  : P extends \`\${string}:\${infer N}\`
    ? N
    : never;

function buildPath<P extends string>(pattern: P, params: Record<ParamNames<P>, string>): string {
  const values = params as Record<string, string | undefined>;
  return pattern
    .split("/")
    .map((part) => {
      if (!part.startsWith(":")) return part;
      const value = values[part.slice(1)];
      if (value === undefined) throw new Error("missing param: " + part.slice(1));
      return encodeURIComponent(value);
    })
    .join("/");
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isUser(x: unknown): x is User {
  return (
    isRecord(x) &&
    typeof x.id === "string" &&
    /^u_\\d+$/.test(x.id) &&
    typeof x.name === "string" &&
    typeof x.email === "string"
  );
}

function isOrder(x: unknown): x is Order {
  return (
    isRecord(x) &&
    typeof x.id === "string" &&
    /^o_\\d+$/.test(x.id) &&
    typeof x.userId === "string" &&
    /^u_\\d+$/.test(x.userId) &&
    Number.isInteger(x.total)
  );
}

const validators: { [K in RouteKey]: (x: unknown) => x is Routes[K]["response"] } = {
  "GET /users/:id": isUser,
  "GET /users/:id/orders": (x): x is Order[] => Array.isArray(x) && x.every(isOrder),
  "POST /orders": isOrder,
};

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

function request<K extends RouteKey>(
  route: K,
  params: Routes[K]["params"],
  body?: Routes[K]["body"],
): Result<Routes[K]["response"]> {
  const space = route.indexOf(" ");
  const method = route.slice(0, space);
  const path = buildPath(route.slice(space + 1), params as Record<string, string>);
  const res = fakeServer(method, path, body === undefined ? undefined : JSON.stringify(body));
  if (res.status < 200 || res.status > 299) return { ok: false, error: "HTTP " + res.status };
  const data: unknown = JSON.parse(res.text);
  const valid = validators[route];
  if (!valid(data)) return { ok: false, error: "invalid response" };
  return { ok: true, data };
}

${usage}`,
  tests: [
    {
      name: "البابان يقبلان الصيغة الصحيحة فقط، ويرميان خطأ لغيرها",
      code: `{
  let threw = 0;
  for (const bad of ["12", "o_1", "u_"]) {
    try {
      userId(bad);
    } catch {
      threw++;
    }
  }
  console.log(userId("u_12") === "u_12" && orderId("o_5") === "o_5" && threw === 3);
}`,
    },
    {
      name: "buildPath يضع كل معامل مكانه، ويترك المسار بلا معاملات كما هو",
      code: `console.log(buildPath("/users/:id/orders", { id: "u_1" }) === "/users/u_1/orders" && buildPath("/orders", {}) === "/orders" && buildPath("/a/:x/b/:y", { x: "1", y: "2" }) === "/a/1/b/2");`,
    },
    {
      name: "buildPath يرمي missing param حين يغيب معامل",
      code: `try {
  buildPath("/users/:id", {} as Record<"id", string>);
  console.log(false);
} catch (e) {
  console.log((e as Error).message === "missing param: id");
}`,
    },
    {
      name: "isUser يقبل مستخدماً سليماً ويرفض المعطوب و null والمعرّف بصيغة خاطئة",
      code: `console.log(isUser({ id: "u_1", name: "Sara", email: "s@x.co" }) === true && isUser({ id: "u_3", name: 42, email: null }) === false && isUser(null) === false && isUser({ id: "x1", name: "A", email: "a@x.co" }) === false);`,
    },
    {
      name: "isOrder ومدقّق قائمة الطلبات يرفضان أي عنصر معطوب",
      code: `console.log(isOrder({ id: "o_1", userId: "u_1", total: 1250 }) === true && isOrder({ id: "o_1", userId: "u_1", total: "1250" }) === false && validators["GET /users/:id/orders"]([]) === true && validators["GET /users/:id/orders"]([{ id: "o_1", userId: "u_1", total: 1 }, { id: "bad" }]) === false);`,
    },
    {
      name: "request يجلب مستخدماً موجوداً بنجاح",
      code: `{
  const r = request("GET /users/:id", { id: userId("u_1") });
  console.log(r.ok && r.data.name === "Sara" && r.data.email === "sara@example.com");
}`,
    },
    {
      name: "request يرجع HTTP 404 لمستخدم غير موجود",
      code: `{
  const r = request("GET /users/:id", { id: userId("u_9") });
  console.log(!r.ok && r.error === "HTTP 404");
}`,
    },
    {
      name: "request يرفض جواباً لا يشبه User بدل أن يمرّره",
      code: `{
  const r = request("GET /users/:id", { id: userId("u_3") });
  console.log(!r.ok && r.error === "invalid response");
}`,
    },
    {
      name: "POST /orders ينشئ طلباً يظهر بعدها في قائمة طلبات المستخدم",
      code: `{
  const created = request("POST /orders", {}, { userId: userId("u_2"), total: 900 });
  const list = request("GET /users/:id/orders", { id: userId("u_2") });
  console.log(created.ok && created.data.total === 900 && /^o_\\d+$/.test(created.data.id) && list.ok && list.data.length === 1 && list.data[0].id === created.data.id);
}`,
    },
  ],
};
