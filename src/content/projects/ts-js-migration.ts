import type { Project } from "@/lib/types";

/** Runs `f` and returns the message it throws, or "no error". Tests use it to check boundary messages. */
const msg = `const msg = (f: () => unknown): string => {
  try {
    f();
    return "no error";
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
};`;

const valid = `'{"customer":"Sara","items":[{"sku":"tea","qty":2},{"sku":"cup","qty":1}],"coupon":"SAVE10"}'`;
const noCoupon = `'{"customer":"Sara","items":[{"sku":"tea","qty":2},{"sku":"cup","qty":1}]}'`;

export const tsJsMigration: Project = {
  slug: "ts-js-migration",
  stage: 0,
  track: "ts",
  level: 4,
  title: "ترحيل مشروع JS إلى TS",
  brief:
    "وحدة طلبات من متجر حقيقي، مكتوبة بـ JavaScript قبل سنوات: تقرأ الطلب من نموذج الموقع بصيغة JSON، وتحسب المجموع بالهللات، وتطبّق القسيمة. تعمل منذ زمن، والعملاء لم يشتكوا كثيراً. أُعيدت تسميتها .ts، والكود كما كان تماماً. فيها خطأ مختبئ كانت الأنواع ستكشفه من اليوم الأول، وباب مفتوح يُدخل أي بيانات. ترحّلها هنا كما تفعل الفرق المحترفة: واجهات للبيانات، ثم أعلام strict علَماً علَماً، وكل علَم يكشف شيئاً تصلحه، ثم محلّل على الباب لأن الأنواع تختفي وقت التشغيل. الاختبارات تفحص السلوك؛ وفي محررك سيفحص tsc الأنواع.",
  lang: "ts",
  steps: [
    "اقرأ الوحدة واضغط «شغّل الاختبارات» قبل أي تعديل. أيها يفشل؟ لاحظ أن الطلب العادي مع قسيمة يعمل. في مشروع حقيقي تبدأ الخطوة صفر بـ \"allowJs\": true، ثم // @ts-check أو \"checkJs\": true، فيفحص tsc ملفات JS نفسها قبل إعادة تسميتها.",
    "صِف البيانات: interface Item { sku: string; qty: number }، و interface Order { customer: string; items: Item[]; coupon?: string }، و interface Summary { customer: string; items: number; total: number }. الأنواع لا تغيّر السلوك بعد، والاختبارات كما هي.",
    "علَم noImplicitAny: اكتب نوع كل معامل وكل نوع رجوع (lineTotal(item: Item): number، وهكذا). سيشتكي tsc من COUPONS[coupon]: Element implicitly has an 'any' type. أعطِ PRICES و COUPONS النوع Record<string, number>.",
    "علَم strictNullChecks: الآن order.coupon نوعه string | undefined، ويقول tsc عند COUPONS[order.coupon]: Type 'undefined' cannot be used as an index type. هذا هو الخطأ المختبئ: طلب بلا قسيمة يعطي COUPONS[undefined] أي undefined، والمجموع NaN. اجعل applyCoupon(subtotal: number, coupon: string | undefined) ترجع subtotal كما هو حين لا توجد قسيمة.",
    "علَم noUncheckedIndexedAccess: PRICES[item.sku] و COUPONS[coupon] تصبحان number | undefined. في lineTotal ارمِ Error(\"unknown sku: \" + item.sku) حين لا يوجد سعر، وفي applyCoupon تجاهل القسيمة المجهولة (أرجع subtotal).",
    "الباب: parseOrder(text: string): Order. ضع JSON.parse في متغير من نوع unknown، وافحص كل حقل، وارمِ Error بهذه الرسائل بالضبط: \"order: expected object\"، \"customer: expected a non-empty string\"، \"items: expected an array\"، \"items[i]: expected object\"، \"items[i].sku: expected a string\"، \"items[i].qty: expected a positive integer\" (عدد صحيح >= 1، و i رقم العنصر)، \"coupon: expected a string\" (إن وُجدت ولم تكن نصاً). ابنِ كائناً جديداً بالحقول المعروفة فقط.",
    "اضغط «شغّل الاختبارات» حتى تنجح كلها. ثم في محررك: tsc --noEmit --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes. صفر أخطاء يعني أن الترحيل اكتمل. لاحظ: كمية \"1\" نصاً كانت ستجعل itemCount ترجع \"021\" بدمج النصوص؛ المحلّل يوقفها على الباب.",
  ],
  starter: `// orders.js, renamed to orders.ts. The code is exactly as it was in JavaScript.
const PRICES = { tea: 1500, cup: 3000, kettle: 12000 }; // halalas
const COUPONS = { SAVE10: 10, WELCOME: 25 }; // percent off

function parseOrder(text) {
  return JSON.parse(text);
}

function lineTotal(item) {
  return PRICES[item.sku] * item.qty;
}

function applyCoupon(subtotal, coupon) {
  return subtotal - (subtotal * COUPONS[coupon]) / 100;
}

function itemCount(order) {
  return order.items.reduce((n, item) => n + item.qty, 0);
}

function summarize(order) {
  const subtotal = order.items.reduce((sum, item) => sum + lineTotal(item), 0);
  return { customer: order.customer, items: itemCount(order), total: Math.round(applyCoupon(subtotal, order.coupon)) };
}

function formatMoney(halalas) {
  return "SAR " + (halalas / 100).toFixed(2);
}
`,
  solution: `interface Item {
  sku: string;
  qty: number;
}
interface Order {
  customer: string;
  items: Item[];
  coupon?: string;
}
interface Summary {
  customer: string;
  items: number;
  total: number;
}

const PRICES: Record<string, number> = { tea: 1500, cup: 3000, kettle: 12000 }; // halalas
const COUPONS: Record<string, number> = { SAVE10: 10, WELCOME: 25 }; // percent off

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function parseItem(raw: unknown, i: number): Item {
  if (!isRecord(raw)) throw new Error(\`items[\${i}]: expected object\`);
  if (typeof raw.sku !== "string") throw new Error(\`items[\${i}].sku: expected a string\`);
  if (typeof raw.qty !== "number" || !Number.isInteger(raw.qty) || raw.qty < 1) {
    throw new Error(\`items[\${i}].qty: expected a positive integer\`);
  }
  return { sku: raw.sku, qty: raw.qty };
}

function parseOrder(text: string): Order {
  const data: unknown = JSON.parse(text);
  if (!isRecord(data)) throw new Error("order: expected object");
  const { customer, items, coupon } = data;
  if (typeof customer !== "string" || customer === "") throw new Error("customer: expected a non-empty string");
  if (!Array.isArray(items)) throw new Error("items: expected an array");
  const parsed = items.map((raw: unknown, i: number) => parseItem(raw, i));
  if (coupon === undefined) return { customer, items: parsed };
  if (typeof coupon !== "string") throw new Error("coupon: expected a string");
  return { customer, items: parsed, coupon };
}

function lineTotal(item: Item): number {
  const price = PRICES[item.sku];
  if (price === undefined) throw new Error("unknown sku: " + item.sku);
  return price * item.qty;
}

function applyCoupon(subtotal: number, coupon: string | undefined): number {
  if (coupon === undefined) return subtotal;
  const percent = COUPONS[coupon];
  if (percent === undefined) return subtotal;
  return subtotal - (subtotal * percent) / 100;
}

function itemCount(order: Order): number {
  return order.items.reduce((n, item) => n + item.qty, 0);
}

function summarize(order: Order): Summary {
  const subtotal = order.items.reduce((sum, item) => sum + lineTotal(item), 0);
  return { customer: order.customer, items: itemCount(order), total: Math.round(applyCoupon(subtotal, order.coupon)) };
}

function formatMoney(halalas: number): string {
  return "SAR " + (halalas / 100).toFixed(2);
}
`,
  tests: [
    {
      name: "formatMoney يكتب الهللات ريالات",
      code: `console.log(formatMoney(4500) === "SAR 45.00" && formatMoney(5) === "SAR 0.05");`,
    },
    {
      name: "طلب صحيح مع قسيمة SAVE10: 6000 هللة ناقص 10%",
      code: `{
  const s = summarize(parseOrder(${valid}));
  console.log(s.customer === "Sara" && s.items === 3 && s.total === 5400);
}`,
    },
    {
      name: "طلب بلا قسيمة يدفع المجموع كاملاً، لا NaN",
      code: `console.log(summarize(parseOrder(${noCoupon})).total === 6000);`,
    },
    {
      name: "قسيمة غير معروفة تُتجاهل",
      code: `console.log(summarize(parseOrder('{"customer":"Sara","items":[{"sku":"kettle","qty":1}],"coupon":"FREE"}')).total === 12000);`,
    },
    {
      name: "منتج بلا سعر يرمي unknown sku بدل NaN",
      code: `${msg}
console.log(msg(() => lineTotal({ sku: "mug", qty: 1 })) === "unknown sku: mug");`,
    },
    {
      name: "الكمية نصاً أو كسراً أو صفراً تُرفض على الباب مع مسارها",
      code: `${msg}
console.log(
  msg(() => parseOrder('{"customer":"Sara","items":[{"sku":"tea","qty":2},{"sku":"cup","qty":"1"}]}')) === "items[1].qty: expected a positive integer" &&
    msg(() => parseOrder('{"customer":"Sara","items":[{"sku":"tea","qty":1.5}]}')) === "items[0].qty: expected a positive integer" &&
    msg(() => parseOrder('{"customer":"Sara","items":[{"sku":"tea","qty":0}]}')) === "items[0].qty: expected a positive integer",
);`,
    },
    {
      name: "الطلب نفسه والعميل والعناصر تُفحص",
      code: `${msg}
console.log(
  msg(() => parseOrder("null")) === "order: expected object" &&
    msg(() => parseOrder('{"items":[]}')) === "customer: expected a non-empty string" &&
    msg(() => parseOrder('{"customer":"","items":[]}')) === "customer: expected a non-empty string" &&
    msg(() => parseOrder('{"customer":"Sara","items":{}}')) === "items: expected an array" &&
    msg(() => parseOrder('{"customer":"Sara","items":[7]}')) === "items[0]: expected object" &&
    msg(() => parseOrder('{"customer":"Sara","items":[{"qty":1}]}')) === "items[0].sku: expected a string",
);`,
    },
    {
      name: "قسيمة ليست نصاً تُرفض",
      code: `${msg}
console.log(msg(() => parseOrder('{"customer":"Sara","items":[],"coupon":10}')) === "coupon: expected a string");`,
    },
    {
      name: "المحلّل يبني كائناً جديداً بالحقول المعروفة فقط",
      code: `{
  const o = parseOrder('{"customer":"Sara","items":[{"sku":"tea","qty":1,"price":1}],"isAdmin":true}');
  console.log(Object.keys(o).join(",") === "customer,items" && Object.keys(o.items[0] ?? {}).join(",") === "sku,qty");
}`,
    },
    {
      name: "itemCount يرجع رقماً",
      code: `{
  const n = itemCount(parseOrder(${valid}));
  console.log(typeof n === "number" && n === 3);
}`,
    },
  ],
};
