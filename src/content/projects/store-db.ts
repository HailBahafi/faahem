import type { Project } from "@/lib/types";

export const storeDb: Project = {
  slug: "store-db",
  stage: 8,
  title: "ربط المتجر بقاعدة بيانات",
  brief:
    "المتجر الصغير الذي بنيته يحتاج مكاناً دائماً لبياناته. تصمم هنا قاعدة بياناته كاملة: أربعة جداول مترابطة بمفاتيح أساسية وأجنبية وقيود تحمي البيانات، ثم استعلامات تجيب عن أسئلة المتجر الحقيقية، وفهرساً يسرّعها، ومعاملة تسجّل طلباً جديداً كاملاً أو لا شيء.",
  lang: "sql",
  steps: [
    "أنشئ جدول customers بالأعمدة: id (SERIAL PRIMARY KEY) و name (TEXT NOT NULL) و email (TEXT UNIQUE NOT NULL). وأنشئ جدول products بالأعمدة: id و name و price (NUMERIC(10,2) NOT NULL) و stock (INT NOT NULL). أضف على price قيد CHECK يرفض أي سعر صفر أو أقل، وعلى stock قيداً يرفض الكمية السالبة.",
    "أنشئ جدول orders بالأعمدة: id و customer_id (يشير إلى customers(id) بـ REFERENCES) و created_at (TIMESTAMP DEFAULT now()). ثم جدول order_items بالأعمدة: order_id (يشير إلى orders) و product_id (يشير إلى products) و quantity (أكبر من صفر) و unit_price، ومفتاحه الأساسي مركّب: PRIMARY KEY (order_id, product_id). نحفظ unit_price في البند لأن سعر المنتج قد يتغير لاحقاً، والفاتورة القديمة يجب ألا تتغير.",
    "أدخل العملاء الثلاثة بالترتيب: Ahmed و Sara و Khalid (بريد كل منهم مثل ahmed@example.com). ثم المنتجات الأربعة بالترتيب: Keyboard بسعر 150 ومخزون 10، Mouse بسعر 80 ومخزون 20، Monitor بسعر 900 ومخزون 5، Cable بسعر 25 ومخزون 50.",
    "أدخل طلبين: الطلب 1 للعميل Ahmed فيه Keyboard × 1 و Mouse × 2، والطلب 2 للعميل Khalid فيه Cable × 4 و Mouse × 1. انسخ سعر المنتج في unit_price لكل بند.",
    "أنشئ VIEW اسمه order_details يربط الجداول الأربعة بـ JOIN ويعرض: order_id و customer_name و product_name و quantity و unit_price. هكذا ترى طلبات أي عميل باستعلام واحد: SELECT * FROM order_details WHERE customer_name = 'Ahmed';",
    "أنشئ VIEW اسمه order_totals يعرض لكل طلب: order_id و total، حيث total هو مجموع quantity × unit_price لبنوده. استعمل SUM مع GROUP BY.",
    "أنشئ VIEW اسمه best_seller يعرض صفاً واحداً فقط: name و sold للمنتج الأكثر مبيعاً بعدد القطع. اجمع الكميات لكل منتج ثم رتّب تنازلياً وخذ الأول بـ LIMIT 1.",
    "صفحة «طلباتي» تبحث في orders حسب customer_id في كل زيارة. أنشئ فهرساً على orders(customer_id) حتى لا يمر البحث على كل الطلبات.",
    "سجّل الطلب الثالث داخل معاملة BEGIN ... COMMIT: العميلة Sara تشتري Monitor × 1 و Cable × 2. أدخل الطلب، ثم بنوده (رقم الطلب الجديد تعطيك إياه currval('orders_id_seq'))، ثم أنقص المخزون بالكميات المشتراة. إذا فشلت أي خطوة لا يُحفظ شيء منها.",
    "اضغط «شغّل الاختبارات» وأصلح ما يفشل حتى تنجح كلها.",
  ],
  starter: `-- 1) الجداول
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

-- CREATE TABLE products (...);
-- CREATE TABLE orders (...);
-- CREATE TABLE order_items (...);

-- 2) البيانات
-- INSERT INTO customers (name, email) VALUES ...;

-- 3) الاستعلامات: order_details و order_totals و best_seller

-- 4) الفهرس

-- 5) معاملة الطلب الثالث
-- BEGIN;
-- ...
-- COMMIT;
`,
  solution: `CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  stock INT NOT NULL CHECK (stock >= 0)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE order_items (
  order_id INT NOT NULL REFERENCES orders(id),
  product_id INT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

INSERT INTO customers (name, email) VALUES
  ('Ahmed', 'ahmed@example.com'),
  ('Sara', 'sara@example.com'),
  ('Khalid', 'khalid@example.com');

INSERT INTO products (name, price, stock) VALUES
  ('Keyboard', 150, 10),
  ('Mouse', 80, 20),
  ('Monitor', 900, 5),
  ('Cable', 25, 50);

INSERT INTO orders (customer_id) VALUES (1), (3);

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (1, 1, 1, 150),
  (1, 2, 2, 80),
  (2, 4, 4, 25),
  (2, 2, 1, 80);

CREATE VIEW order_details AS
SELECT o.id AS order_id, c.name AS customer_name, p.name AS product_name, i.quantity, i.unit_price
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items i ON i.order_id = o.id
JOIN products p ON p.id = i.product_id;

CREATE VIEW order_totals AS
SELECT order_id, SUM(quantity * unit_price) AS total
FROM order_items
GROUP BY order_id;

CREATE VIEW best_seller AS
SELECT p.name, SUM(i.quantity) AS sold
FROM order_items i
JOIN products p ON p.id = i.product_id
GROUP BY p.name
ORDER BY sold DESC
LIMIT 1;

CREATE INDEX idx_orders_customer ON orders (customer_id);

BEGIN;
INSERT INTO orders (customer_id) VALUES (2);
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (currval('orders_id_seq'), 3, 1, 900),
  (currval('orders_id_seq'), 4, 2, 25);
UPDATE products SET stock = stock - 1 WHERE id = 3;
UPDATE products SET stock = stock - 2 WHERE id = 4;
COMMIT;

SELECT * FROM order_details WHERE customer_name = 'Ahmed';
SELECT * FROM order_totals ORDER BY order_id;
SELECT * FROM best_seller;
`,
  tests: [
    {
      name: "الجداول الأربعة موجودة ولكل منها مفتاح أساسي",
      code: `SELECT count(*) = 4 AS ok FROM pg_constraint WHERE contype = 'p' AND conrelid::regclass::text IN ('customers', 'products', 'orders', 'order_items');`,
    },
    {
      name: "المفاتيح الأجنبية الثلاثة: orders ← customers و order_items ← orders و products",
      code: `SELECT count(*) = 3 AS ok FROM pg_constraint WHERE contype = 'f' AND (conrelid::regclass::text, confrelid::regclass::text) IN (('orders', 'customers'), ('order_items', 'orders'), ('order_items', 'products'));`,
    },
    {
      name: "قيد CHECK يرفض منتجاً بسعر سالب",
      code: `DO $$
BEGIN
  INSERT INTO products (name, price, stock) VALUES ('Bad', -5, 1);
  RAISE EXCEPTION 'negative price was accepted';
EXCEPTION WHEN check_violation THEN
  NULL;
END $$;
SELECT true AS ok;`,
    },
    {
      name: "طلب لعميل غير موجود مرفوض (المفتاح الأجنبي يعمل)",
      code: `DO $$
BEGIN
  INSERT INTO orders (customer_id) VALUES (999);
  RAISE EXCEPTION 'order for a missing customer was accepted';
EXCEPTION WHEN foreign_key_violation THEN
  NULL;
END $$;
SELECT true AS ok;`,
    },
    {
      name: "البيانات: 3 عملاء و 4 منتجات بأسعارها",
      code: `SELECT (SELECT count(*) FROM customers) = 3 AND (SELECT count(*) FROM products) = 4 AND (SELECT price FROM products WHERE name = 'Monitor') = 900 AS ok;`,
    },
    {
      name: "order_details يعرض منتجات طلب Ahmed: Keyboard و Mouse",
      code: `SELECT string_agg(product_name, ',' ORDER BY product_name) = 'Keyboard,Mouse' AS ok FROM order_details WHERE customer_name = 'Ahmed';`,
    },
    {
      name: "order_totals: الطلب 1 مجموعه 310 والطلب 2 مجموعه 180",
      code: `SELECT (SELECT total FROM order_totals WHERE order_id = 1) = 310 AND (SELECT total FROM order_totals WHERE order_id = 2) = 180 AS ok;`,
    },
    {
      name: "best_seller صف واحد: Cable بـ 6 قطع",
      code: `SELECT count(*) = 1 AND min(name) = 'Cable' AND min(sold) = 6 AS ok FROM best_seller;`,
    },
    {
      name: "يوجد فهرس على orders(customer_id)",
      code: `SELECT count(*) >= 1 AS ok FROM pg_indexes WHERE tablename = 'orders' AND indexdef LIKE '%(customer_id)%';`,
    },
    {
      name: "المعاملة سجّلت طلب Sara (مجموعه 950) وأنقصت المخزون",
      code: `SELECT (SELECT count(*) FROM orders WHERE customer_id = 2) = 1
  AND (SELECT t.total FROM order_totals t JOIN orders o ON o.id = t.order_id WHERE o.customer_id = 2) = 950
  AND (SELECT stock FROM products WHERE name = 'Monitor') = 4
  AND (SELECT stock FROM products WHERE name = 'Cable') = 48 AS ok;`,
    },
  ],
};
