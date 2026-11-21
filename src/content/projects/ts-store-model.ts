import type { Project } from "@/lib/types";

const data = `type Category = "drinks" | "food" | "merch";

interface Product {
  readonly id: number;
  name: string;
  price: number; // in halalas: 1250 means 12.50 SAR
  stock: number;
  category: Category;
}

const products: Product[] = [
  { id: 1, name: "tea", price: 800, stock: 10, category: "drinks" },
  { id: 2, name: "cake", price: 1550, stock: 2, category: "food" },
  { id: 3, name: "mug", price: 3000, stock: 0, category: "merch" },
];
`;

export const tsStoreModel: Project = {
  slug: "ts-store-model",
  stage: 0,
  track: "ts",
  level: 1,
  title: "نموذج متجر بأنواع",
  brief:
    "قلب أي متجر إلكتروني قبل الواجهة وقاعدة البيانات: أنواع تصف المنتجات وأسطر السلة والطلبات، ودوال صغيرة تعمل عليها. تجمع هنا كل ما في المستوى: interface و type، والاتحادات الحرفية، والمعاملات الاختيارية، و undefined حين يغيب الشيء، ومصفوفات لا تُعدَّل في مكانها. الأسعار أعداد صحيحة بالهللة (1250 تعني 12.50 ريال)، كما تفعل أنظمة الدفع الحقيقية، لأن الكسور العشرية في الحاسوب تقريبية. الاختبارات تفحص السلوك؛ وفي محررك سيفحص tsc الأنواع.",
  lang: "ts",
  steps: [
    "اقرأ Product والبيانات الجاهزة. ثم عرّف interface CartLine فيها productId رقم و qty رقم، و type OrderStatus = \"pending\" | \"paid\" | \"shipped\"، و interface Order فيها id نص و lines (مصفوفة CartLine) و total رقم و status من نوع OrderStatus.",
    "اكتب formatPrice(halalas: number): string: اقسم على 100 واكتب خانتين عشريتين ثم \" SAR\". مثلاً 1250 تصبح \"12.50 SAR\"، و 5 تصبح \"0.05 SAR\".",
    "اكتب findProduct(products: Product[], id: number): Product | undefined: المنتج صاحب id، أو undefined إن لم يوجد.",
    "اكتب addToCart(cart: CartLine[], productId: number, qty = 1): CartLine[]: ترجع مصفوفة جديدة ولا تغيّر القديمة. إن كان المنتج في السلة زِد كميته (في سطر جديد، لا في الكائن القديم)، وإلا أضف سطراً.",
    "اكتب cartTotal(products: Product[], cart: CartLine[]): number: مجموع السعر × الكمية بالهللة. السطر الذي لا يوجد منتجه لا يُحسب.",
    "اكتب canFulfil(products: Product[], cart: CartLine[]): boolean: صحيح فقط إن كان كل منتج في السلة موجوداً ومخزونه يكفي الكمية.",
    "اكتب placeOrder(id: string, products: Product[], cart: CartLine[]): Order | undefined: ترجع طلباً بحالة \"pending\" ومجموعه، أو undefined إن كانت السلة فارغة أو لا يمكن تلبيتها.",
    "اكتب advance(order: Order): Order: ترجع نسخة جديدة بالحالة التالية: pending ثم paid ثم shipped، و shipped تبقى shipped. ثم اضغط «شغّل الاختبارات».",
  ],
  starter: `${data}
// Write CartLine, OrderStatus and Order here.

function formatPrice(halalas: number): string {
  return "";
}

function findProduct(products: Product[], id: number): Product | undefined {
  return undefined;
}

function addToCart(cart: CartLine[], productId: number, qty = 1): CartLine[] {
  return cart;
}

function cartTotal(products: Product[], cart: CartLine[]): number {
  return 0;
}

function canFulfil(products: Product[], cart: CartLine[]): boolean {
  return false;
}

function placeOrder(id: string, products: Product[], cart: CartLine[]): Order | undefined {
  return undefined;
}

function advance(order: Order): Order {
  return order;
}

console.log(formatPrice(1250));
`,
  solution: `${data}
interface CartLine {
  productId: number;
  qty: number;
}

type OrderStatus = "pending" | "paid" | "shipped";

interface Order {
  id: string;
  lines: CartLine[];
  total: number;
  status: OrderStatus;
}

function formatPrice(halalas: number): string {
  return (halalas / 100).toFixed(2) + " SAR";
}

function findProduct(products: Product[], id: number): Product | undefined {
  return products.find((p) => p.id === id);
}

function addToCart(cart: CartLine[], productId: number, qty = 1): CartLine[] {
  const existing = cart.find((line) => line.productId === productId);
  if (existing === undefined) {
    return [...cart, { productId, qty }];
  }
  return cart.map((line) => (line.productId === productId ? { productId, qty: line.qty + qty } : line));
}

function cartTotal(products: Product[], cart: CartLine[]): number {
  let total = 0;
  for (const line of cart) {
    const product = findProduct(products, line.productId);
    if (product !== undefined) {
      total += product.price * line.qty;
    }
  }
  return total;
}

function canFulfil(products: Product[], cart: CartLine[]): boolean {
  return cart.every((line) => {
    const product = findProduct(products, line.productId);
    return product !== undefined && product.stock >= line.qty;
  });
}

function placeOrder(id: string, products: Product[], cart: CartLine[]): Order | undefined {
  if (cart.length === 0 || !canFulfil(products, cart)) {
    return undefined;
  }
  return { id, lines: cart, total: cartTotal(products, cart), status: "pending" };
}

function advance(order: Order): Order {
  let status: OrderStatus = "shipped";
  if (order.status === "pending") {
    status = "paid";
  }
  return { ...order, status };
}

console.log(formatPrice(1250));
`,
  tests: [
    {
      name: "formatPrice يكتب الهللات ريالات بخانتين عشريتين",
      code: `console.log(formatPrice(1250) === "12.50 SAR" && formatPrice(800) === "8.00 SAR" && formatPrice(5) === "0.05 SAR" && formatPrice(0) === "0.00 SAR");`,
    },
    {
      name: "findProduct يجد المنتج، ويرجع undefined لمعرّف غير موجود",
      code: `console.log(findProduct(products, 2)?.name === "cake" && findProduct(products, 99) === undefined);`,
    },
    {
      name: "addToCart يضيف سطراً جديداً بالكمية الافتراضية 1، ولا يغيّر السلة القديمة",
      code: `const empty: CartLine[] = [];
const one = addToCart(empty, 1);
console.log(empty.length === 0 && one.length === 1 && one[0].productId === 1 && one[0].qty === 1);`,
    },
    {
      name: "addToCart يزيد كمية منتج موجود بدل تكراره، ولا يغيّر السطر القديم",
      code: `const first = addToCart([], 1, 2);
const second = addToCart(first, 1, 3);
const third = addToCart(second, 2);
console.log(second.length === 1 && second[0].qty === 5 && first[0].qty === 2 && third.length === 2 && third[1].productId === 2);`,
    },
    {
      name: "cartTotal يجمع السعر × الكمية بالهللة، ويتجاهل منتجاً غير موجود",
      code: `console.log(cartTotal(products, [{ productId: 1, qty: 3 }, { productId: 2, qty: 1 }]) === 3950 && cartTotal(products, []) === 0 && cartTotal(products, [{ productId: 99, qty: 1 }]) === 0);`,
    },
    {
      name: "canFulfil يرفض كمية أكبر من المخزون ومنتجاً غير موجود",
      code: `console.log(canFulfil(products, [{ productId: 1, qty: 10 }, { productId: 2, qty: 2 }]) === true && canFulfil(products, [{ productId: 2, qty: 3 }]) === false && canFulfil(products, [{ productId: 3, qty: 1 }]) === false && canFulfil(products, [{ productId: 99, qty: 1 }]) === false);`,
    },
    {
      name: "placeOrder يرجع طلباً pending بمجموعه، أو undefined لسلة فارغة أو مستحيلة",
      code: `const order = placeOrder("A-1", products, [{ productId: 1, qty: 2 }]);
console.log(order !== undefined && order.id === "A-1" && order.total === 1600 && order.status === "pending" && order.lines.length === 1 && placeOrder("A-2", products, []) === undefined && placeOrder("A-3", products, [{ productId: 3, qty: 1 }]) === undefined);`,
    },
    {
      name: "advance ينقل الحالة pending ثم paid ثم shipped، ويرجع نسخة جديدة",
      code: `const o: Order = { id: "B-1", lines: [], total: 0, status: "pending" };
const paid = advance(o);
const shipped = advance(paid);
console.log(o.status === "pending" && paid.status === "paid" && shipped.status === "shipped" && advance(shipped).status === "shipped" && paid !== o);`,
    },
  ],
};
