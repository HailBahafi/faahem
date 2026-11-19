import type { Cell, Lesson } from "@/lib/types";

// The products table every exercise starts with (a fresh database per run).
const SHOP = `CREATE TABLE products (id INT, name TEXT, price INT, category TEXT);
INSERT INTO products VALUES
  (1, 'Pen', 5, 'office'),
  (2, 'Bag', 80, 'travel'),
  (3, 'Cup', 15, 'kitchen'),
  (4, 'Lamp', 45, 'home'),
  (5, 'Mug', 12, 'kitchen');`;

const COLS: Cell = { name: "products", value: "id INT | name TEXT | price INT", type: "none", constant: true };
const row = (id: number, v: string): Cell => ({ name: `row ${id}`, value: v, type: "string" });
const PEN = row(1, "1 | Pen | 5");
const BAG = row(2, "2 | Bag | 80");
const CUP = row(3, "3 | Cup | 15");
const PEN6 = row(1, "1 | Pen | 6");

export const sql: Lesson = {
  slug: "sql",
  stage: 8,
  number: "8.1",
  title: "SQL",
  subtitle: "جدول بأعمدة صارمة، ولغة تصف فيها ما تريد فتجده القاعدة لك",
  minutes: 20,
  singleLanguage: true,
  problem: {
    title: "صِف ما تريد، لا كيف تبحث",
    body: "جدول منتجات. اضغط أجزاء الاستعلام لتبنيه: شرط، ترتيب، حدّ. لم تكتب حلقة واحدة، ومع ذلك تتصفّى الصفوف وتترتّب. ثم جرّب زر التعديل بلا شرط.",
    demo: "sql",
  },
  scene: {
    code: {
      sql: `CREATE TABLE products (id INT, name TEXT, price INT);
INSERT INTO products VALUES (1, 'Pen', 5), (2, 'Bag', 80), (3, 'Cup', 15);
SELECT name, price FROM products
WHERE price > 10
ORDER BY price;
UPDATE products SET price = 6 WHERE id = 1;
DELETE FROM products WHERE price > 50;
SELECT * FROM products ORDER BY id;`,
    },
    steps: [
      { line: null, say: "قاعدة بيانات فارغة. سنبني جدولاً، وكل صف فيه درج يحمل شيئاً واحداً كاملاً.", memory: [] },
      { line: 1, say: "CREATE TABLE يرسم الأعمدة وأنواعها. price عمود أرقام: لن يقبل نصاً أبداً.", memory: [COLS], changed: ["products"] },
      { line: 2, say: "INSERT يضيف ثلاثة صفوف. كل صف منتج واحد بقيمه الثلاث.", memory: [COLS, PEN, BAG, CUP], changed: ["row 1", "row 2", "row 3"] },
      { line: 3, say: "SELECT يصف النتيجة: عمودان من products. لا حلقة ولا عدّاد: القاعدة ستمرّ على الصفوف بنفسها.", memory: [COLS, PEN, BAG, CUP], read: ["row 1", "row 2", "row 3"] },
      { line: 4, say: "WHERE يُسأل لكل صف: هل price > 10؟ Pen سعره 5 فيسقط. Bag و Cup يبقيان.", memory: [COLS, PEN, BAG, CUP], read: ["row 2", "row 3"] },
      { line: 5, say: "ORDER BY يرتّب الباقي بالسعر تصاعدياً: Cup ثم Bag. هذه هي النتيجة المطبوعة.", memory: [COLS, PEN, BAG, CUP], read: ["row 3", "row 2"], output: ["name | price", "Cup | 15", "Bag | 80"] },
      { line: 6, say: "UPDATE يغيّر الصفوف التي يطابقها WHERE فقط: صف id = 1 وحده. لولا WHERE لصار سعر كل المنتجات 6.", memory: [COLS, PEN6, BAG, CUP], changed: ["row 1"], output: ["name | price", "Cup | 15", "Bag | 80"] },
      { line: 7, say: "DELETE يحذف كل صف يطابق الشرط. Bag سعره 80 فيختفي. الأمر لا يطبع شيئاً.", memory: [COLS, PEN6, CUP], output: ["name | price", "Cup | 15", "Bag | 80"] },
      { line: 8, say: "* تعني كل الأعمدة. بقي صفّان، بالترتيب الذي طلبناه.", memory: [COLS, PEN6, CUP], read: ["row 1", "row 3"], output: ["name | price", "Cup | 15", "Bag | 80", "id | name | price", "1 | Pen | 6", "3 | Cup | 15"] },
    ],
    notes: {
      sql: "الأوامر تنتهي بفاصلة منقوطة، والأمر الواحد قد يمتد على عدة أسطر (SELECT هنا من السطر 3 إلى 5). النصوص بين علامتين مفردتين 'Pen'، والكلمات المحجوزة تُكتب بأحرف كبيرة عادةً للوضوح فقط.",
    },
  },
  playground: {
    kind: "sql",
    intro: "قاعدة حقيقية (Postgres) تُبنى من جديد في كل تشغيل، وفيها جدول products بخمسة منتجات. عدّل الاستعلام واضغط تشغيل.",
    setup: SHOP,
    starter: `SELECT name, price, category
FROM products
WHERE price > 10
ORDER BY price;`,
    challenges: [
      "غيّر الشرط إلى category = 'kitchen'. كم صفاً تتوقّع قبل أن تضغط؟",
      "اجعل الترتيب ORDER BY price DESC LIMIT 2: من أغلى منتجين؟",
      "أضف قبل SELECT السطر UPDATE products SET price = price + 10 WHERE category = 'kitchen'; وراقب Cup و Mug.",
      "احذف WHERE من سطر UPDATE وشغّل. من تغيّر سعره هذه المرة؟",
    ],
  },
  predict: [
    {
      question: "نسي أحدهم WHERE. ماذا يطبع SELECT الأخير؟",
      code: `-- products: Pen 5, Bag 80, Cup 15
UPDATE products SET price = 0;
SELECT name, price FROM products ORDER BY name;`,
      options: ["الثلاثة وسعرها 0", "Bag 0 فقط", "خطأ: UPDATE يحتاج WHERE"],
      answer: 0,
      why: "UPDATE بلا WHERE يعني «كل الصفوف». القاعدة لا تسأل هل أنت متأكد: صار كل سعر 0. لهذا تكتب WHERE أولاً، وتجرّبه بـ SELECT قبل أن تحوّله إلى UPDATE.",
      scene: {
        code: {
          sql: `UPDATE products SET price = 0;
SELECT name, price FROM products ORDER BY name;`,
        },
        steps: [
          { line: null, say: "ثلاثة منتجات بأسعارها.", memory: [row(1, "Pen | 5"), row(2, "Bag | 80"), row(3, "Cup | 15")] },
          { line: 1, say: "لا شرط، فكل صف يطابق. الأسعار الثلاثة صارت 0.", memory: [row(1, "Pen | 0"), row(2, "Bag | 0"), row(3, "Cup | 0")], changed: ["row 1", "row 2", "row 3"] },
          { line: 2, say: "SELECT يقرأ ما بقي: كله أصفار، مرتّب بالاسم.", memory: [row(1, "Pen | 0"), row(2, "Bag | 0"), row(3, "Cup | 0")], output: ["name | price", "Bag | 0", "Cup | 0", "Pen | 0"] },
        ],
      },
    },
    {
      question: "ما الذي يطبعه هذا الاستعلام؟",
      code: `-- products: Pen 5, Bag 80, Cup 15
SELECT name FROM products
ORDER BY price DESC
LIMIT 1;`,
      options: ["Bag", "Pen", "Cup"],
      answer: 0,
      why: "LIMIT يقصّ بعد الترتيب، لا قبله. رُتّبت الصفوف من الأغلى إلى الأرخص (DESC) ثم أُخذ الأول: Bag. الصف الذي أُدخل أولاً لا يهمّ.",
      scene: {
        code: {
          sql: `SELECT name FROM products
ORDER BY price DESC
LIMIT 1;`,
        },
        steps: [
          { line: 1, say: "كل الصفوف مرشّحة.", memory: [row(1, "Pen | 5"), row(2, "Bag | 80"), row(3, "Cup | 15")] },
          { line: 2, say: "الترتيب من الأغلى: Bag ثم Cup ثم Pen.", memory: [row(2, "Bag | 80"), row(3, "Cup | 15"), row(1, "Pen | 5")], read: ["row 2", "row 3", "row 1"] },
          { line: 3, say: "LIMIT 1 يأخذ أول صف من المرتّب.", memory: [row(2, "Bag | 80"), row(3, "Cup | 15"), row(1, "Pen | 5")], read: ["row 2"], output: ["name", "Bag"] },
        ],
      },
    },
    {
      question: "نختار عمود name وحده. هل يستطيع WHERE أن يفحص price؟",
      code: `-- products: Pen 5, Bag 80, Cup 15
SELECT name FROM products
WHERE price < 20
ORDER BY name;`,
      options: ["نعم: يطبع Cup و Pen", "لا: خطأ لأن price غير مختار", "يطبع name و price معاً"],
      answer: 0,
      why: "WHERE يفحص الصف كاملاً بكل أعمدته، و SELECT يقرّر فقط أي أعمدة تظهر في النتيجة. الفحص على price والعرض لـ name.",
      scene: {
        code: {
          sql: `SELECT name FROM products
WHERE price < 20
ORDER BY name;`,
        },
        steps: [
          { line: 1, say: "النتيجة ستُظهر name فقط، لكن الصفوف كاملة ما زالت أمام القاعدة.", memory: [row(1, "Pen | 5"), row(2, "Bag | 80"), row(3, "Cup | 15")] },
          { line: 2, say: "الشرط يقرأ price في كل صف: Pen و Cup ينجحان، Bag يسقط.", memory: [row(1, "Pen | 5"), row(2, "Bag | 80"), row(3, "Cup | 15")], read: ["row 1", "row 3"] },
          { line: 3, say: "ترتيب بالاسم، ثم يظهر عمود name وحده.", memory: [row(1, "Pen | 5"), row(2, "Bag | 80"), row(3, "Cup | 15")], read: ["row 3", "row 1"], output: ["name", "Cup", "Pen"] },
        ],
      },
    },
  ],
  code: {
    intro: "هذه قاعدة Postgres حقيقية تعمل في متصفحك، وجدول products جاهز فيها. كل تشغيل يبدأ بجدول جديد، فجرّب ما شئت حتى الحذف.",
    runnerLang: "sql",
    runnerSetup: SHOP,
    runnerStarter: `INSERT INTO products VALUES (6, 'Book', 30, 'office');
UPDATE products SET price = 7 WHERE name = 'Pen';
DELETE FROM products WHERE category = 'travel';
SELECT id, name, price FROM products
WHERE price < 40
ORDER BY price DESC;
-- جرّب: احذف WHERE من سطر UPDATE وشغّل. ماذا حدث لكل الأسعار؟
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "sql",
      setup: SHOP,
      title: "رخيص أولاً",
      prompt: "رتّب أجزاء الاستعلام حتى يطبع أسماء المنتجات التي سعرها أقل من 20، من الأرخص.",
      lines: ["SELECT name", "FROM products", "WHERE price < 20", "ORDER BY price;"],
      expected: "name\nPen\nMug\nCup",
    },
    {
      kind: "fill",
      lang: "sql",
      setup: SHOP,
      title: "الأغلى",
      prompt: "أي كلمة تجعل الاستعلام يطبع أغلى منتج في الجدول؟",
      template: "SELECT name FROM products ORDER BY price ___ LIMIT 1;",
      options: ["DESC", "ASC"],
      expected: "name\nBag",
    },
    {
      kind: "fix",
      lang: "sql",
      setup: SHOP,
      title: "كوب واحد فقط",
      prompt: "أردنا رفع سعر Cup وحده إلى 20، لكن كل الأسعار صارت 20. أصلح أمر التعديل.",
      code: `UPDATE products SET price = 20;
SELECT name, price FROM products ORDER BY id;`,
      expected: "name | price\nPen | 5\nBag | 80\nCup | 20\nLamp | 45\nMug | 12",
      hint: "UPDATE بلا WHERE يغيّر كل الصفوف. أضف WHERE name = 'Cup' قبل الفاصلة المنقوطة.",
      solution: `UPDATE products SET price = 20 WHERE name = 'Cup';
SELECT name, price FROM products ORDER BY id;`,
    },
    {
      kind: "write",
      lang: "sql",
      setup: SHOP,
      title: "أفرغ المطبخ",
      prompt: "احذف كل منتجات الفئة kitchen، ثم اطبع أسماء ما بقي مرتّبة أبجدياً.",
      starter: `-- 1) DELETE ... WHERE category = 'kitchen';
-- 2) SELECT name ... ORDER BY name;
`,
      expected: "name\nBag\nLamp\nPen",
      hint: "DELETE FROM products WHERE category = 'kitchen'; ثم SELECT name FROM products ORDER BY name;",
      solution: `DELETE FROM products WHERE category = 'kitchen';
SELECT name FROM products ORDER BY name;`,
    },
  ],
  quiz: [
    {
      question: "الجدول فيه 5 منتجات، اثنان منها kitchen. كم صفاً يبقى؟",
      code: "DELETE FROM products WHERE category = 'kitchen';\nSELECT name FROM products;",
      options: ["3", "2", "0"],
      answer: 0,
      why: "DELETE يمرّ على كل صف ويحذف ما يطابق الشرط فقط: صفّا المطبخ. الثلاثة الباقية لم يطابقها الشرط فلم تُمسّ.",
    },
    {
      question: "ماذا يطبع؟ (Pen 5, Bag 80, Cup 15)",
      code: "SELECT name FROM products\nWHERE price > 10 AND price < 50\nORDER BY name;",
      options: ["Cup", "Bag و Cup", "لا شيء"],
      answer: 0,
      why: "AND يشترط أن يصدق الشرطان معاً للصف نفسه. Bag أكبر من 10 لكنه ليس أقل من 50، و Pen ليس أكبر من 10. يبقى Cup وحده.",
    },
    {
      question: "ماذا يحدث؟ (العمود price من نوع INT)",
      code: "INSERT INTO products (id, name, price) VALUES (9, 'Hat', 'cheap');",
      options: ["خطأ ولا يُضاف شيء", "يُضاف الصف وسعره cheap", "يُضاف الصف وسعره 0"],
      answer: 0,
      why: "العمود نوعه رقم، والجدول صارم: يرفض 'cheap' ويرفض الصف كله. هذا الفرق بين الجدول وورقة حسابات حرة يُكتب فيها أي شيء في أي خانة.",
    },
    {
      question: "كم صفاً تغيّر؟ (5 منتجات، id من 1 إلى 5)",
      code: "UPDATE products SET price = price * 2 WHERE id > 3;",
      options: ["2", "3", "5"],
      answer: 0,
      why: "id > 3 يصدق لـ 4 و 5 فقط. كل صف منهما يُحسب سعره الجديد من سعره القديم. والصفوف الثلاثة الأولى تبقى كما هي.",
    },
    {
      question: "ماذا يطبع؟ (Pen 5, Bag 80, Cup 15, Mug 12)",
      code: "SELECT name FROM products\nORDER BY price\nLIMIT 2;",
      options: ["Pen و Mug", "Pen و Bag", "Bag و Cup"],
      answer: 0,
      why: "ORDER BY price بلا DESC يرتّب تصاعدياً: 5 ثم 12 ثم 15 ثم 80. و LIMIT 2 يأخذ أول صفين من المرتّب: Pen ثم Mug.",
    },
  ],
  next: "relations",
};
