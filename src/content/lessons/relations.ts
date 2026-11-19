import type { Cell, Lesson } from "@/lib/types";

// Customers and their orders (one-to-many), students and courses (many-to-many).
const SHOP = `CREATE TABLE customers (id INT PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT REFERENCES customers(id), item TEXT);
INSERT INTO customers VALUES (1, 'Sara'), (2, 'Omar'), (3, 'Huda');
INSERT INTO orders VALUES (10, 1, 'Pen'), (11, 1, 'Cup'), (12, 2, 'Bag'), (13, 1, 'Lamp');`;

const SCHOOL = `CREATE TABLE students (id INT PRIMARY KEY, name TEXT);
CREATE TABLE courses (id INT PRIMARY KEY, title TEXT);
CREATE TABLE enrollments (
  student_id INT REFERENCES students(id),
  course_id INT REFERENCES courses(id),
  PRIMARY KEY (student_id, course_id)
);
INSERT INTO students VALUES (1, 'Ali'), (2, 'Mona'), (3, 'Fahd');
INSERT INTO courses VALUES (1, 'SQL'), (2, 'Go');
INSERT INTO enrollments VALUES (1, 1), (1, 2), (2, 1), (3, 2);`;

const c = (id: number, name: string): Cell => ({ name: `customers ${id}`, value: `${id} | ${name}`, type: "string" });
const o = (id: number, cid: number, item: string): Cell => ({ name: `orders ${id}`, value: `${id} | → ${cid} | ${item}`, type: "number" });
const CUST = [c(1, "Sara"), c(2, "Omar")];
const CUST2 = [c(1, "Sarah"), c(2, "Omar")];
const ORD = [o(10, 1, "Pen"), o(11, 1, "Cup"), o(12, 2, "Bag")];

export const relations: Lesson = {
  slug: "relations",
  stage: 8,
  number: "8.2",
  title: "العلاقات",
  subtitle: "كل شيء يُخزَّن مرة واحدة، والجداول الأخرى تشير إليه برقمه",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "اسم مكرّر في كل طلب",
    body: "جدول طلبات يحمل اسم العميل وهاتفه في كل صف. غيّر هاتف Sara وراقب ماذا يبقى قديماً. ثم قسّم الجدول إلى جدولين، واضغط JOIN لترى الصفوف تلتقي برقمها.",
    demo: "relations",
  },
  scene: {
    code: {
      sql: `CREATE TABLE customers (id INT PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT REFERENCES customers(id), item TEXT);
INSERT INTO customers VALUES (1, 'Sara'), (2, 'Omar');
INSERT INTO orders VALUES (10, 1, 'Pen'), (11, 1, 'Cup'), (12, 2, 'Bag');
INSERT INTO orders VALUES (13, 9, 'Hat');
UPDATE customers SET name = 'Sarah' WHERE id = 1;
SELECT orders.item, customers.name
FROM orders JOIN customers ON orders.customer_id = customers.id
ORDER BY orders.id;`,
    },
    steps: [
      { line: null, say: "بدل جدول واحد يكرّر الاسم في كل طلب، سنبني جدولين: واحد للعملاء وواحد للطلبات.", memory: [] },
      { line: 1, say: "customers: كل عميل صف واحد. PRIMARY KEY يعني أن id لا يتكرر أبداً، فهو عنوان العميل.", memory: [{ name: "customers", value: "id PK | name", type: "none", constant: true }], changed: ["customers"] },
      { line: 2, say: "orders لا يحمل الاسم. يحمل customer_id: سهم إلى رقم عميل. REFERENCES يجعل القاعدة تتحقّق أن السهم يشير إلى عميل موجود.", memory: [{ name: "customers", value: "id PK | name", type: "none", constant: true }, { name: "orders", value: "id PK | customer_id → customers | item", type: "none", constant: true }], changed: ["orders"] },
      { line: 3, say: "عميلان. اسم Sara مكتوب في مكان واحد فقط.", memory: CUST, changed: ["customers 1", "customers 2"] },
      { line: 4, say: "ثلاثة طلبات. طلبان يشيران إلى 1 (Sara) وطلب إلى 2 (Omar). هذه علاقة واحد إلى كثير.", memory: [...CUST, ...ORD], changed: ["orders 10", "orders 11", "orders 12"] },
      { line: 5, say: "طلب يشير إلى العميل 9، ولا عميل بهذا الرقم. القاعدة ترفض الصف كله: لا سهم إلى فراغ.", memory: [...CUST, ...ORD], error: "insert or update on table \"orders\" violates foreign key constraint" },
      { line: 6, say: "تغيّر الاسم في درج واحد. الطلبات لم تُمسّ، لأنها تحمل الرقم 1 لا الاسم.", memory: [...CUST2, ...ORD], changed: ["customers 1"] },
      { line: 7, say: "نطلب عمودين من جدولين مختلفين. نكتب اسم الجدول قبل العمود حتى لا نخلط بين id هنا و id هناك.", memory: [...CUST2, ...ORD] },
      { line: 8, say: "JOIN يتبع كل سهم: لكل طلب يبحث عن العميل الذي id له يساوي customer_id، ويلصق الصفين معاً.", memory: [...CUST2, ...ORD], read: ["orders 10", "customers 1", "orders 11", "orders 12", "customers 2"] },
      { line: 9, say: "النتيجة صفوف ملصوقة مرتّبة برقم الطلب، والاسم الجديد Sarah يظهر في الطلبين معاً.", memory: [...CUST2, ...ORD], output: ["item | name", "Pen | Sarah", "Cup | Sarah", "Bag | Omar"] },
    ],
    notes: {
      sql: "JOIN وحدها تعني INNER JOIN: الصف الذي لا يجد شريكاً لا يظهر. وإن كان اسم العمود واحداً في الجدولين (مثل id) فيجب أن تكتب الجدول قبله: orders.id أو customers.id.",
    },
  },
  playground: {
    kind: "sql",
    intro: "ثلاثة عملاء وأربعة طلبات، ومعها مدرسة: طلاب ومواد وجدول تسجيل يربطهما. عدّل الاستعلام واضغط تشغيل.",
    setup: `${SHOP}\n${SCHOOL}`,
    starter: `SELECT orders.id, orders.item, customers.name
FROM orders
JOIN customers ON orders.customer_id = customers.id
ORDER BY orders.id;`,
    challenges: [
      "أضف WHERE customers.name = 'Sara' قبل ORDER BY. كم طلباً لها؟",
      "Huda ليس لها طلبات. هل تظهر في النتيجة؟ لماذا؟",
      "جرّب INSERT INTO orders VALUES (14, 7, 'Hat'); قبل SELECT. اقرأ رسالة الخطأ.",
      "اكتب: SELECT students.name, courses.title FROM enrollments JOIN students ON enrollments.student_id = students.id JOIN courses ON enrollments.course_id = courses.id ORDER BY students.name, courses.title;",
    ],
  },
  predict: [
    {
      question: "Sara لها طلبان، و Huda بلا طلبات. كم صفاً يطبع JOIN؟",
      code: `-- customers: 1 Sara, 3 Huda
-- orders: 10 → 1 Pen, 11 → 1 Cup
SELECT customers.name, orders.item
FROM customers JOIN orders ON orders.customer_id = customers.id;`,
      options: ["2", "3", "1"],
      answer: 0,
      why: "JOIN ينتج صفاً لكل زوج متطابق. Sara تطابق طلبين فتظهر مرتين، و Huda لا يشير إليها أي سهم فلا تظهر أصلاً.",
      scene: {
        code: {
          sql: `SELECT customers.name, orders.item
FROM customers JOIN orders ON orders.customer_id = customers.id;`,
        },
        steps: [
          { line: 1, say: "عميلتان وطلبان، والطلبان يشيران إلى 1.", memory: [c(1, "Sara"), c(3, "Huda"), o(10, 1, "Pen"), o(11, 1, "Cup")] },
          { line: 2, say: "Sara تلتقي بالطلبين فتظهر مرتين. Huda لا سهم إليها فتسقط.", memory: [c(1, "Sara"), c(3, "Huda"), o(10, 1, "Pen"), o(11, 1, "Cup")], read: ["customers 1", "orders 10", "orders 11"], output: ["name | item", "Sara | Pen", "Sara | Cup"] },
        ],
      },
    },
    {
      question: "غيّرنا اسم العميل 1. ماذا يطبع الاستعلام؟",
      code: `-- orders 10 and 11 both point to customer 1 (Sara)
UPDATE customers SET name = 'Sarah' WHERE id = 1;
SELECT orders.id, customers.name
FROM orders JOIN customers ON orders.customer_id = customers.id
ORDER BY orders.id;`,
      options: ["Sarah في الطلبين", "Sarah في الطلب الأول و Sara في الثاني", "Sara في الطلبين"],
      answer: 0,
      why: "الاسم مخزّن مرة واحدة في customers. الطلبان يحملان الرقم 1 فقط، و JOIN يقرأ الاسم وقت الاستعلام، فيجد الاسم الجديد للطلبين معاً.",
      scene: {
        code: {
          sql: `UPDATE customers SET name = 'Sarah' WHERE id = 1;
SELECT orders.id, customers.name
FROM orders JOIN customers ON orders.customer_id = customers.id
ORDER BY orders.id;`,
        },
        steps: [
          { line: null, say: "اسم واحد، وطلبان يشيران إليه.", memory: [c(1, "Sara"), o(10, 1, "Pen"), o(11, 1, "Cup")] },
          { line: 1, say: "تغيير في درج واحد.", memory: [c(1, "Sarah"), o(10, 1, "Pen"), o(11, 1, "Cup")], changed: ["customers 1"] },
          { line: 3, say: "كل طلب يتبع سهمه إلى الدرج نفسه، فيقرأ Sarah.", memory: [c(1, "Sarah"), o(10, 1, "Pen"), o(11, 1, "Cup")], read: ["orders 10", "orders 11", "customers 1"] },
          { line: 4, say: "الطلبان باسم واحد جديد.", memory: [c(1, "Sarah"), o(10, 1, "Pen"), o(11, 1, "Cup")], output: ["id | name", "10 | Sarah", "11 | Sarah"] },
        ],
      },
    },
    {
      question: "لا يوجد عميل رقمه 5. ماذا يحدث؟",
      code: `-- orders.customer_id REFERENCES customers(id)
INSERT INTO orders VALUES (20, 5, 'Hat');`,
      options: ["خطأ، ولا يُضاف الطلب", "يُضاف الطلب ويبقى بلا عميل", "يُنشأ عميل رقمه 5 تلقائياً"],
      answer: 0,
      why: "FOREIGN KEY وعد بأن كل سهم يشير إلى صف موجود. القاعدة تبحث عن العميل 5 قبل أن تحفظ، فلا تجده، فترفض الصف كله.",
      scene: {
        code: {
          sql: `INSERT INTO orders VALUES (20, 5, 'Hat');`,
        },
        steps: [
          { line: null, say: "عميلان فقط: 1 و 2.", memory: CUST },
          { line: 1, say: "السهم يشير إلى 5، وهو غير موجود. رُفض الصف.", memory: CUST, error: "violates foreign key constraint \"orders_customer_id_fkey\"" },
        ],
      },
    },
  ],
  code: {
    intro: "قاعدة Postgres حقيقية فيها العملاء والطلبات والمدرسة. لاحظ في آخر استعلام كيف يمرّ JOIN مرتين عبر جدول التسجيل ليربط طالباً بمادة.",
    runnerLang: "sql",
    runnerSetup: `${SHOP}\n${SCHOOL}`,
    runnerStarter: `-- One-to-many: every order points to one customer
SELECT orders.item, customers.name
FROM orders
JOIN customers ON orders.customer_id = customers.id
ORDER BY orders.id;

-- Many-to-many: enrollments holds pairs (student, course)
SELECT students.name, courses.title
FROM enrollments
JOIN students ON enrollments.student_id = students.id
JOIN courses ON enrollments.course_id = courses.id
ORDER BY students.name, courses.title;
-- جرّب: أضف WHERE courses.title = 'SQL' قبل ORDER BY الأخيرة.
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "sql",
      setup: SHOP,
      title: "طلبات Sara",
      prompt: "رتّب الأسطر حتى يطبع أصناف طلبات Sara بترتيب رقم الطلب.",
      lines: [
        "SELECT orders.item",
        "FROM orders",
        "JOIN customers ON orders.customer_id = customers.id",
        "WHERE customers.name = 'Sara'",
        "ORDER BY orders.id;",
      ],
      expected: "item\nPen\nCup\nLamp",
    },
    {
      kind: "fill",
      lang: "sql",
      setup: SHOP,
      title: "اتبع السهم",
      prompt: "أي عمود يُكمل شرط الربط حتى يظهر كل طلب مع صاحبه؟",
      template: "SELECT orders.item, customers.name FROM orders JOIN customers ON orders.customer_id = ___ ORDER BY orders.id;",
      options: ["customers.id", "orders.id", "customers.name"],
      expected: "item | name\nPen | Sara\nCup | Sara\nBag | Omar\nLamp | Sara",
    },
    {
      kind: "fix",
      lang: "sql",
      setup: SHOP,
      title: "الربط الخطأ",
      prompt: "الاستعلام لا يطبع إلا العناوين: الشرط يقارن رقم الطلب برقم العميل. أصلحه ليتبع customer_id.",
      code: `SELECT orders.item, customers.name
FROM orders
JOIN customers ON orders.id = customers.id
ORDER BY orders.id;`,
      expected: "item | name\nPen | Sara\nCup | Sara\nBag | Omar\nLamp | Sara",
      hint: "السهم في orders اسمه customer_id، وهو يشير إلى customers.id.",
      solution: `SELECT orders.item, customers.name
FROM orders
JOIN customers ON orders.customer_id = customers.id
ORDER BY orders.id;`,
    },
    {
      kind: "write",
      lang: "sql",
      setup: SCHOOL,
      title: "من يدرس SQL؟",
      prompt: "students و courses مربوطان بجدول enrollments (student_id, course_id). اطبع أسماء طلاب مادة SQL مرتّبة أبجدياً.",
      starter: `-- FROM enrollments
-- JOIN students ON ...
-- JOIN courses ON ...
-- WHERE courses.title = 'SQL'
`,
      expected: "name\nAli\nMona",
      hint: "JOIN students ON enrollments.student_id = students.id ثم JOIN courses ON enrollments.course_id = courses.id، ثم WHERE و ORDER BY students.name.",
      solution: `SELECT students.name
FROM enrollments
JOIN students ON enrollments.student_id = students.id
JOIN courses ON enrollments.course_id = courses.id
WHERE courses.title = 'SQL'
ORDER BY students.name;`,
    },
  ],
  quiz: [
    {
      question: "كم صفاً يطبع؟ (العملاء: 1 Sara، 2 Omar، 3 Huda. الطلبات: ثلاثة لـ Sara وواحد لـ Omar)",
      code: "SELECT customers.name, orders.item\nFROM orders JOIN customers ON orders.customer_id = customers.id;",
      options: ["4", "3", "7"],
      answer: 0,
      why: "JOIN يبدأ من كل طلب ويتبع سهمه إلى عميل واحد: أربعة طلبات تعطي أربعة صفوف. Huda بلا طلبات فلا يصل إليها سهم.",
    },
    {
      question: "طلبات Sara مخزّنة هكذا. كم مكاناً يجب أن نعدّل لنغيّر هاتفها؟",
      code: "-- orders (no customers table)\n-- 10 | Sara | 0551 | Pen\n-- 11 | Sara | 0551 | Cup\n-- 13 | Sara | 0551 | Lamp",
      options: ["3، وإن نسينا واحداً صار لها رقمان", "1", "0، القاعدة تعدّلها وحدها"],
      answer: 0,
      why: "النسخ يعني أن كل صف يحمل نسخته الخاصة. هذا ما تحلّه الجداول المرتبطة: الهاتف في صف عميل واحد، والطلبات تحمل رقمه فقط.",
    },
    {
      question: "ماذا يحدث؟ (يوجد عميلان: 1 و 2)",
      code: "CREATE TABLE customers (id INT PRIMARY KEY, name TEXT);\nINSERT INTO customers VALUES (1, 'Sara'), (2, 'Omar');\nINSERT INTO customers VALUES (2, 'Huda');",
      options: ["خطأ: id 2 موجود من قبل", "يُضاف صف ثانٍ رقمه 2", "يُستبدل Omar بـ Huda"],
      answer: 0,
      why: "PRIMARY KEY عنوان فريد. لو قبلت القاعدة عميلين برقم 2 لما عرف أي طلب يشير إلى أيهما. فترفض الصف الجديد ويبقى Omar.",
    },
    {
      question: "طالب يدرس مواد كثيرة، والمادة فيها طلاب كثيرون. أين تُخزّن العلاقة؟",
      code: "-- students (id, name)\n-- courses  (id, title)",
      options: ["في جدول ثالث فيه أزواج (student_id, course_id)", "عمود course_id في students", "عمود student_id في courses"],
      answer: 0,
      why: "عمود واحد في students يحمل سهماً واحداً فقط، أي مادة واحدة. الجدول الثالث يحمل صفاً لكل زوج، فيستطيع الطالب أن يملك أي عدد من الأسهم، والمادة كذلك.",
    },
    {
      question: "ماذا يطبع؟ (التسجيلات: Ali في SQL و Go، Mona في SQL)",
      code: "SELECT courses.title, students.name\nFROM enrollments\nJOIN students ON enrollments.student_id = students.id\nJOIN courses ON enrollments.course_id = courses.id\nWHERE students.name = 'Ali'\nORDER BY courses.title;",
      options: ["Go | Ali ثم SQL | Ali", "SQL | Ali فقط", "SQL | Ali ثم SQL | Mona"],
      answer: 0,
      why: "كل صف في enrollments زوج واحد. لـ Ali زوجان، فيتبع JOIN سهمي كل زوج ويُخرج صفين. الترتيب بالعنوان يضع Go قبل SQL.",
    },
  ],
  next: "indexes",
};
