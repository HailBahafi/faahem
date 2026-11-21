import type { Project } from "@/lib/types";

const head = `type StoreEvent<T> =
  | { type: "added"; item: T }
  | { type: "updated"; before: T; after: T }
  | { type: "removed"; item: T };

type Listener<T> = (event: StoreEvent<T>) => void;
type Patch<T> = Partial<Omit<T, "id">>;
`;

const demo = `
interface Product {
  id: string;
  name: string;
  price: number; // in halalas
  stock: number;
}

const products = new Store<Product>();
products.add({ id: "p1", name: "tea", price: 800, stock: 10 });
console.log(products.size);
`;

export const tsGenericStore: Project = {
  slug: "ts-generic-store",
  stage: 0,
  track: "ts",
  level: 2,
  title: "مخزن بيانات عام",
  brief:
    "صنف واحد يحفظ أي نوع من السجلات: منتجات، مستخدمين، طلبات. هذا قلب كل مكتبة إدارة حالة وكل طبقة بيانات في تطبيق ويب. Store<T extends { id: string }> يقبل أي نوع فيه معرّف نصي، ويحفظ سجلاته في Map خاص بـ #، ويُعلم من يشترك فيه بكل تغيير عبر أحداث من اتحاد مميّز. تجمع هنا كل المستوى: generics بقيود، و Partial و Omit و keyof، والأصناف وحقولها الخاصة، والأحداث الموسومة. الاختبارات تفحص السلوك؛ وفي محررك سيفحص tsc الأنواع.",
  lang: "ts",
  steps: [
    "اقرأ الأنواع الجاهزة: StoreEvent<T> اتحاد مميّز بالوسم type، و Listener<T> دالة تستقبل حدثاً، و Patch<T> كل حقول T عدا id، اختيارية.",
    "في Store أضف حقلين خاصين: #items = new Map<string, T>() و #listeners: Listener<T>[] = []. ثم get size(): number ترجع عدد السجلات.",
    "اكتب add(item: T): boolean: إن كان المعرّف موجوداً أرجع false ولا تغيّر شيئاً. وإلا احفظ السجل وأرسل الحدث { type: \"added\", item } وأرجع true.",
    "اكتب get(id: string): T | undefined و all(): T[] (مصفوفة جديدة، فتغييرها لا يغيّر المخزن).",
    "اكتب update(id: string, patch: Patch<T>): T | undefined: ابنِ كائناً جديداً { ...before, ...patch }، واحفظه مكان القديم، وأرسل { type: \"updated\", before, after }. والمعرّف غير الموجود يرجع undefined بلا حدث.",
    "اكتب remove(id: string): boolean: يحذف ويرسل { type: \"removed\", item }، أو يرجع false إن لم يجد السجل.",
    "اكتب where(test: (item: T) => boolean): T[] و sortBy<K extends keyof T>(key: K): T[]: نسخة مرتّبة تصاعدياً حسب الحقل (لا تغيّر الترتيب الداخلي).",
    "اكتب subscribe(listener: Listener<T>): () => void: يضيف المستمع ويرجع دالة تلغي الاشتراك. ثم اكتب خارج الصنف describe<T extends { id: string }>(e: StoreEvent<T>): string بـ switch على e.type: \"added p1\" و \"updated p1\" و \"removed p1\". ثم اضغط «شغّل الاختبارات».",
  ],
  starter: `${head}
class Store<T extends { id: string }> {
  // add #items and #listeners here

  get size(): number {
    return 0;
  }

  add(item: T): boolean {
    return false;
  }

  get(id: string): T | undefined {
    return undefined;
  }

  all(): T[] {
    return [];
  }

  update(id: string, patch: Patch<T>): T | undefined {
    return undefined;
  }

  remove(id: string): boolean {
    return false;
  }

  where(test: (item: T) => boolean): T[] {
    return [];
  }

  sortBy<K extends keyof T>(key: K): T[] {
    return [];
  }

  subscribe(listener: Listener<T>): () => void {
    return () => {};
  }
}

function describe<T extends { id: string }>(e: StoreEvent<T>): string {
  return "";
}
${demo}`,
  solution: `${head}
class Store<T extends { id: string }> {
  #items = new Map<string, T>();
  #listeners: Listener<T>[] = [];

  get size(): number {
    return this.#items.size;
  }

  add(item: T): boolean {
    if (this.#items.has(item.id)) {
      return false;
    }
    this.#items.set(item.id, item);
    this.#emit({ type: "added", item });
    return true;
  }

  get(id: string): T | undefined {
    return this.#items.get(id);
  }

  all(): T[] {
    return [...this.#items.values()];
  }

  update(id: string, patch: Patch<T>): T | undefined {
    const before = this.#items.get(id);
    if (before === undefined) {
      return undefined;
    }
    const after: T = { ...before, ...patch };
    this.#items.set(id, after);
    this.#emit({ type: "updated", before, after });
    return after;
  }

  remove(id: string): boolean {
    const item = this.#items.get(id);
    if (item === undefined) {
      return false;
    }
    this.#items.delete(id);
    this.#emit({ type: "removed", item });
    return true;
  }

  where(test: (item: T) => boolean): T[] {
    return this.all().filter(test);
  }

  sortBy<K extends keyof T>(key: K): T[] {
    return this.all().sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0));
  }

  subscribe(listener: Listener<T>): () => void {
    this.#listeners.push(listener);
    return () => {
      this.#listeners = this.#listeners.filter((l) => l !== listener);
    };
  }

  #emit(event: StoreEvent<T>): void {
    for (const listener of this.#listeners) {
      listener(event);
    }
  }
}

function describe<T extends { id: string }>(e: StoreEvent<T>): string {
  switch (e.type) {
    case "added":
      return "added " + e.item.id;
    case "updated":
      return "updated " + e.after.id;
    case "removed":
      return "removed " + e.item.id;
  }
}
${demo}`,
  tests: [
    {
      name: "add يحفظ السجل ويزيد size، ويرفض معرّفاً مكرراً",
      code: `const s = new Store<Product>();
const a = s.add({ id: "x", name: "cake", price: 1500, stock: 2 });
const b = s.add({ id: "x", name: "other", price: 1, stock: 1 });
console.log(a === true && b === false && s.size === 1 && s.get("x")?.name === "cake");`,
    },
    {
      name: "get يرجع undefined لمعرّف غير موجود، و all يرجع نسخة جديدة",
      code: `const list = products.all();
list.pop();
console.log(products.get("nope") === undefined && list.length === 0 && products.all().length === 1 && products.all() !== products.all());`,
    },
    {
      name: "update يبني كائناً جديداً ويحفظه، ولا يغيّر الكائن القديم",
      code: `const before = products.get("p1")!;
const after = products.update("p1", { price: 900 });
console.log(after !== undefined && after.price === 900 && after.name === "tea" && before.price === 800 && products.get("p1")?.price === 900 && after !== before);`,
    },
    {
      name: "update و remove لمعرّف غير موجود: undefined و false",
      code: `console.log(products.update("nope", { price: 1 }) === undefined && products.remove("nope") === false && products.size === 1);`,
    },
    {
      name: "remove يحذف السجل",
      code: `const ok = products.remove("p1");
console.log(ok === true && products.size === 0 && products.get("p1") === undefined);`,
    },
    {
      name: "where و sortBy يرجعان نسخاً مصفّاة ومرتّبة",
      code: `const s = new Store<Product>();
s.add({ id: "a", name: "mug", price: 3000, stock: 0 });
s.add({ id: "b", name: "cake", price: 1500, stock: 2 });
s.add({ id: "c", name: "tea", price: 800, stock: 10 });
const inStock = s.where((p) => p.stock > 0).map((p) => p.id).join(",");
const byPrice = s.sortBy("price").map((p) => p.id).join(",");
const byName = s.sortBy("name").map((p) => p.id).join(",");
console.log(inStock === "b,c" && byPrice === "c,b,a" && byName === "b,a,c" && s.all()[0].id === "a");`,
    },
    {
      name: "المستمع يتلقى الأحداث added و updated و removed بالترتيب",
      code: `const s = new Store<Product>();
const seen: string[] = [];
s.subscribe((e) => seen.push(describe(e)));
s.add({ id: "p1", name: "tea", price: 800, stock: 10 });
s.add({ id: "p1", name: "dup", price: 1, stock: 1 });
s.update("p1", { stock: 9 });
s.update("zz", { stock: 1 });
s.remove("p1");
console.log(seen.join("|") === "added p1|updated p1|removed p1");`,
    },
    {
      name: "حدث updated يحمل before و after، وإلغاء الاشتراك يوقف الأحداث",
      code: `const s = new Store<Product>();
const log: number[] = [];
const stop = s.subscribe((e) => {
  if (e.type === "updated") log.push(e.before.stock, e.after.stock);
});
s.add({ id: "p1", name: "tea", price: 800, stock: 10 });
s.update("p1", { stock: 4 });
stop();
s.update("p1", { stock: 1 });
console.log(log.join(",") === "10,4" && s.get("p1")?.stock === 1);`,
    },
    {
      name: "المخزن عام: يعمل مع نوع آخر تماماً",
      code: `interface User { id: string; name: string; age: number }
const users = new Store<User>();
users.add({ id: "u1", name: "Sara", age: 31 });
users.add({ id: "u2", name: "Omar", age: 24 });
console.log(users.sortBy("age")[0].name === "Omar" && users.where((u) => u.name.startsWith("S")).length === 1);`,
    },
  ],
};
