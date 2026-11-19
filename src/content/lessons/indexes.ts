import type { Lesson, Scene } from "@/lib/types";

const mini = (sql: string, steps: Scene["steps"]): Scene => ({ code: { sql }, steps });

const usersSetup = `CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT, name TEXT);
INSERT INTO users (email, name)
SELECT 'user' || g || '@mail.com', 'User' || g FROM generate_series(1, 30000) AS g;
INSERT INTO users (email, name) VALUES ('sara@mail.com', 'Sara');`;

export const indexes: Lesson = {
  slug: "indexes",
  stage: 8,
  number: "8.3",
  title: "الفهارس",
  subtitle: "فهرس آخر الكتاب: قفزات قليلة بدل قراءة كل صفحة",
  minutes: 20,
  singleLanguage: true,
  problem: {
    title: "مكتبة من مليون بطاقة",
    body: "ابحث عن بطاقة واحدة بين مليون: مرة بقراءة البطاقات واحدة واحدة، ومرة بالنزول في شجرة مرتبة. ثم أضف فهارس، وراقب سرعة الكتابة.",
    demo: "indexes",
  },
  scene: {
    code: {
      sql: `CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT, name TEXT);
-- imagine 1,000,000 users already inserted
SELECT name FROM users WHERE email = 'sara@mail.com';
CREATE INDEX users_email_idx ON users (email);
SELECT name FROM users WHERE email = 'sara@mail.com';
SELECT name FROM users WHERE id = 500000;
INSERT INTO users (email, name) VALUES ('omar@mail.com', 'Omar');
EXPLAIN SELECT name FROM users WHERE email = 'sara@mail.com';`,
    },
    notes: {
      sql: "الفهرس لا يغيّر لغة الاستعلام ولا نتيجته: تكتب SELECT كما هي، وقاعدة البيانات تقرر وحدها هل تقرأ الجدول كله أم تنزل في الفهرس. EXPLAIN يريك قرارها.",
    },
    steps: [
      {
        line: null,
        say: "الجدول في القرص صفوف مكدّسة بترتيب وصولها، كرف كتب مبعثر. لنرَ كم صفاً تقرأ قاعدة البيانات لتجد صفاً واحداً.",
        memory: [],
      },
      {
        line: 1,
        say: "جدول جديد. PRIMARY KEY يصنع فهرساً تلقائياً اسمه users_pkey: شجرة مرتبة على id.",
        memory: [
          { name: "rows", value: "0", type: "number" },
          { name: "indexes", value: '"users_pkey (id)"', type: "string" },
        ],
        changed: ["rows", "indexes"],
      },
      {
        line: 2,
        say: "مليون مستخدم في الجدول، مرتبين بترتيب التسجيل، لا بالبريد.",
        memory: [
          { name: "rows", value: "1000000", type: "number" },
          { name: "indexes", value: '"users_pkey (id)"', type: "string" },
        ],
        changed: ["rows"],
      },
      {
        line: 3,
        say: "لا فهرس على email، فلا طريق مختصر: تقرأ كل صف وتقارن بريده. هذا بحث خطي اسمه Seq Scan. حتى بعد أن تجد Sara تكمل، فقد يكون هناك صف آخر بالبريد نفسه.",
        memory: [
          { name: "rows", value: "1000000", type: "number" },
          { name: "indexes", value: '"users_pkey (id)"', type: "string" },
          { name: "rows_read", value: "1000000", type: "number" },
        ],
        changed: ["rows_read"],
        output: ["name", "Sara"],
      },
      {
        line: 4,
        say: "نبني فهرساً: تُقرأ عناوين البريد كلها مرة واحدة وتُرتب في شجرة B-tree. كل عقدة فيها مئات المفاتيح لا مفتاحان، فمليون مفتاح يكفيه ثلاثة مستويات. وكل مفتاح في الورقة يحمل عنوان صفه في الجدول.",
        memory: [
          { name: "rows", value: "1000000", type: "number" },
          { name: "indexes", value: '"users_pkey (id), users_email_idx (email)"', type: "string" },
        ],
        changed: ["indexes"],
        output: ["name", "Sara"],
      },
      {
        line: 5,
        say: "الاستعلام نفسه حرفياً. لكن الآن: الجذر يقول إن s بين r و t فانزل هنا، ثم عقدة وسطى، ثم ورقة فيها sara وعنوان صفها. ثلاث قفزات، ثم قراءة صف واحد.",
        memory: [
          { name: "rows", value: "1000000", type: "number" },
          { name: "indexes", value: '"users_pkey (id), users_email_idx (email)"', type: "string" },
          { name: "hops", value: "3", type: "number" },
          { name: "rows_read", value: "1", type: "number" },
        ],
        changed: ["hops", "rows_read"],
        read: ["indexes"],
        output: ["name", "Sara", "name", "Sara"],
      },
      {
        line: 6,
        say: "البحث بـ id سريع منذ البداية: فهرس المفتاح الأساسي يعمل وحده. قفزات قليلة وصف واحد.",
        memory: [
          { name: "rows", value: "1000000", type: "number" },
          { name: "indexes", value: '"users_pkey (id), users_email_idx (email)"', type: "string" },
          { name: "hops", value: "3", type: "number" },
          { name: "rows_read", value: "1", type: "number" },
        ],
        read: ["indexes"],
        output: ["name", "Sara", "name", "Sara", "name", "User500000"],
      },
      {
        line: 7,
        say: "هنا الثمن: إضافة صف واحد تكتب في ثلاثة أماكن. الصف في الجدول، و id في شجرة users_pkey، و omar في مكانه المرتب في شجرة users_email_idx. كل فهرس إضافي يبطئ كل كتابة، ويأخذ مساحة.",
        memory: [
          { name: "rows", value: "1000001", type: "number" },
          { name: "indexes", value: '"users_pkey (id), users_email_idx (email)"', type: "string" },
          { name: "writes", value: "3", type: "number" },
        ],
        changed: ["rows", "writes", "indexes"],
        output: ["name", "Sara", "name", "Sara", "name", "User500000"],
      },
      {
        line: 8,
        say: "EXPLAIN لا ينفّذ الاستعلام، بل يطبع خطته: Index Scan using users_email_idx يعني أنه سينزل في الفهرس. لو رأيت Seq Scan لعرفت أنه سيقرأ الجدول كله.",
        memory: [
          { name: "rows", value: "1000001", type: "number" },
          { name: "indexes", value: '"users_pkey (id), users_email_idx (email)"', type: "string" },
        ],
        output: [
          "name",
          "Sara",
          "name",
          "Sara",
          "name",
          "User500000",
          "QUERY PLAN",
          "Index Scan using users_email_idx on users",
          "  Index Cond: (email = 'sara@mail.com'::text)",
        ],
      },
    ],
  },
  playground: {
    kind: "sql",
    intro: "جدول فيه 30 ألف مستخدم وفهرس واحد: المفتاح الأساسي. EXPLAIN يطبع خطة كل استعلام. ابحث عن Seq Scan (قراءة الجدول كله) و Index Scan (نزول في الفهرس).",
    setup: usersSetup,
    starter: `EXPLAIN SELECT name FROM users WHERE id = 42;
EXPLAIN SELECT name FROM users WHERE email = 'sara@mail.com';
-- add a CREATE INDEX line between them, then run again`,
    challenges: [
      "شغّل كما هو: أي الاستعلامين يقرأ الجدول كله؟ ولماذا الأول لا يفعل؟",
      "أضف قبل السطر الثاني: CREATE INDEX users_email_idx ON users (email); وتوقّع كيف تتغير خطته قبل أن تشغّل.",
      "غيّر EXPLAIN إلى EXPLAIN ANALYZE في السطر الثاني، بلا فهرس ثم معه. ابحث عن Rows Removed by Filter: كم صفاً قرأ ورماه؟",
      "مع فهرس email، جرّب WHERE name = 'Sara'. هل يساعد فهرس email هنا؟",
    ],
  },
  predict: [
    {
      question: "أضفنا فهرساً على email. ماذا يطبع الاستعلام بعده؟",
      code: `SELECT name FROM users WHERE email = 'sara@mail.com';
-- before: name | Sara
CREATE INDEX users_email_idx ON users (email);
SELECT name FROM users WHERE email = 'sara@mail.com';`,
      options: ["Sara، النتيجة نفسها", "لا شيء حتى نكتب USE INDEX", "خطأ: البريد صار مفهرساً"],
      answer: 0,
      why: "الفهرس طريق أسرع إلى الصفوف نفسها، لا جدول جديد. النتيجة لا تتغير أبداً؛ يتغير فقط عدد الصفوف التي تُقرأ للوصول إليها. وقاعدة البيانات تختار الفهرس وحدها.",
      scene: mini(
        `SELECT name FROM users WHERE email = 'sara@mail.com';
-- before: name | Sara
CREATE INDEX users_email_idx ON users (email);
SELECT name FROM users WHERE email = 'sara@mail.com';`,
        [
          { line: 1, say: "بلا فهرس: قراءة كل الصفوف، ونتيجة واحدة.", memory: [{ name: "rows_read", value: "1000000", type: "number" }], output: ["name", "Sara"] },
          { line: 3, say: "شجرة مرتبة جديدة بجانب الجدول. الجدول نفسه لم يتغير.", memory: [{ name: "indexes", value: '"users_pkey, users_email_idx"', type: "string" }], changed: ["indexes"], output: ["name", "Sara"] },
          { line: 4, say: "ثلاث قفزات في الشجرة ثم الصف نفسه: Sara مرة أخرى.", memory: [{ name: "indexes", value: '"users_pkey, users_email_idx"', type: "string" }, { name: "rows_read", value: "1", type: "number" }], read: ["indexes"], changed: ["rows_read"], output: ["name", "Sara", "name", "Sara"] },
        ],
      ),
    },
    {
      question: "لم ننشئ أي فهرس. ماذا تقول خطة هذا الاستعلام؟",
      code: `CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT);
-- 30,000 rows inserted
EXPLAIN SELECT email FROM users WHERE id = 42;`,
      options: ["Index Scan using users_pkey", "Seq Scan on users", "خطأ: لا فهرس على id"],
      answer: 0,
      why: "المفتاح الأساسي يأتي ومعه فهرس تلقائي، لأن قاعدة البيانات تحتاج أن تتأكد بسرعة أن كل id جديد غير مكرر. فالبحث بـ id سريع دائماً.",
      scene: mini(
        `CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT);
-- 30,000 rows inserted
EXPLAIN SELECT email FROM users WHERE id = 42;`,
        [
          { line: 1, say: "PRIMARY KEY: قاعدة البيانات تبني شجرة users_pkey على id بنفسها.", memory: [{ name: "indexes", value: '"users_pkey (id)"', type: "string" }], changed: ["indexes"] },
          { line: 2, say: "كل صف يُضاف يدخل الجدول، ويدخل id ـه في الشجرة.", memory: [{ name: "indexes", value: '"users_pkey (id)"', type: "string" }, { name: "rows", value: "30000", type: "number" }], changed: ["rows"] },
          { line: 3, say: "الخطة تنزل في الشجرة ولا تقرأ الجدول كله.", memory: [{ name: "indexes", value: '"users_pkey (id)"', type: "string" }, { name: "rows", value: "30000", type: "number" }], read: ["indexes"], output: ["QUERY PLAN", "Index Scan using users_pkey on users", "  Index Cond: (id = 42)"] },
        ],
      ),
    },
    {
      question: "الجدول عليه مفتاح أساسي وثلاثة فهارس أخرى. كم بنية تُكتب عند إضافة صف واحد؟",
      code: `CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT, name TEXT, city TEXT);
CREATE INDEX ON users (email);
CREATE INDEX ON users (name);
CREATE INDEX ON users (city);
INSERT INTO users (email, name, city) VALUES ('ali@mail.com', 'Ali', 'Riyadh');`,
      options: ["5", "1", "4"],
      answer: 0,
      why: "الصف في الجدول (1)، ثم مفتاح في كل شجرة: users_pkey و email و name و city (4). خمس كتابات لصف واحد. لهذا لا نفهرس كل عمود: الفهرس يسرّع القراءة ويبطئ كل كتابة.",
      scene: mini(
        `CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT, name TEXT, city TEXT);
CREATE INDEX ON users (email);
CREATE INDEX ON users (name);
CREATE INDEX ON users (city);
INSERT INTO users (email, name, city) VALUES ('ali@mail.com', 'Ali', 'Riyadh');`,
        [
          { line: 1, say: "جدول وفهرس تلقائي على id.", memory: [{ name: "structures", value: "2", type: "number" }], changed: ["structures"] },
          { line: 4, say: "ثلاث أشجار أخرى: email و name و city.", memory: [{ name: "structures", value: "5", type: "number" }], changed: ["structures"] },
          { line: 5, say: "الصف يُكتب في الجدول، ومفتاحه يُدخل في مكانه المرتب في كل شجرة من الأربع.", memory: [{ name: "structures", value: "5", type: "number" }, { name: "writes", value: "5", type: "number" }], changed: ["writes"] },
        ],
      ),
    },
  ],
  code: {
    intro: "30 ألف مستخدم. EXPLAIN ANALYZE ينفّذ الاستعلام ويطبع خطته ووقته الفعلي. شغّل وقارن السطرين: Rows Removed by Filter و Execution Time.",
    runnerLang: "sql",
    runnerSetup: usersSetup,
    runnerStarter: `EXPLAIN ANALYZE SELECT name FROM users WHERE email = 'sara@mail.com';
CREATE INDEX users_email_idx ON users (email);
EXPLAIN ANALYZE SELECT name FROM users WHERE email = 'sara@mail.com';
-- جرّب: ابحث بـ name بدل email في السطر الأخير، أو احذف سطر CREATE INDEX
`,
  },
  exercises: [
    {
      kind: "order",
      title: "فهرس للعناوين",
      prompt: "رتّب الأسطر: أنشئ فهرساً على عنوان الكتاب، ثم اطبع أسماء فهارس الجدول books. لاحظ أن هناك فهرساً لم تنشئه أنت.",
      lang: "sql",
      setup: `CREATE TABLE books (id SERIAL PRIMARY KEY, title TEXT, author TEXT);
INSERT INTO books (title, author) VALUES ('Dune', 'Herbert'), ('Emma', 'Austen');`,
      lines: [
        "CREATE INDEX books_title_idx",
        "ON books (title);",
        "SELECT indexname FROM pg_indexes",
        "WHERE tablename = 'books'",
        "ORDER BY indexname;",
      ],
      expected: "indexname\nbooks_pkey\nbooks_title_idx",
    },
    {
      kind: "fill",
      title: "فهرس للعمود الذي نبحث به",
      prompt: "التطبيق يبحث في الطلبات طوال اليوم بـ WHERE customer = '...'. أي عمود نفهرس حتى تصير الخطة نزولاً في شجرة؟ (btree في الناتج هي الشجرة.)",
      lang: "sql",
      setup: `CREATE TABLE orders (id SERIAL PRIMARY KEY, customer TEXT, total INT);
INSERT INTO orders (customer, total) VALUES ('Sara', 40), ('Ali', 15);`,
      template: `CREATE INDEX orders_customer_idx ON orders (___);
SELECT indexdef FROM pg_indexes WHERE indexname = 'orders_customer_idx';`,
      options: ["customer", "id", "total"],
      expected: "indexdef\nCREATE INDEX orders_customer_idx ON public.orders USING btree (customer)",
    },
    {
      kind: "fix",
      title: "فهرس مكرر",
      prompt: "كل فهرس يُحدَّث مع كل INSERT. هنا فهرسان على العمود نفسه: الثاني لا يسرّع شيئاً ويبطئ كل كتابة. أصلح الكود حتى لا يبقى إلا فهرس المفتاح الأساسي وفهرس email واحد، فيطبع 2.",
      lang: "sql",
      setup: `CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT, name TEXT);`,
      code: `CREATE INDEX users_email_idx ON users (email);
CREATE INDEX users_email_idx2 ON users (email);
SELECT COUNT(*) AS indexes FROM pg_indexes WHERE tablename = 'users';`,
      expected: "indexes\n2",
      hint: "احذف السطر الذي ينشئ users_email_idx2 (أو أضف بعده DROP INDEX users_email_idx2;).",
      solution: `CREATE INDEX users_email_idx ON users (email);
SELECT COUNT(*) AS indexes FROM pg_indexes WHERE tablename = 'users';`,
    },
    {
      kind: "write",
      title: "ابحث بالرمز",
      prompt: "المتجر يبحث عن المنتجات برمزها sku. أنشئ فهرساً اسمه products_sku_idx على sku، ثم اطبع name للمنتج الذي رمزه 'P-200'.",
      lang: "sql",
      setup: `CREATE TABLE products (id SERIAL PRIMARY KEY, sku TEXT, name TEXT, price INT);
INSERT INTO products (sku, name, price) VALUES ('P-100', 'Red Pen', 5), ('P-200', 'Blue Pen', 6), ('P-300', 'Notebook', 12);`,
      starter: "-- 1) CREATE INDEX ...\n-- 2) SELECT name ...\n",
      expected: "name\nBlue Pen",
      hint: "CREATE INDEX products_sku_idx ON products (sku); ثم SELECT name FROM products WHERE sku = 'P-200';",
      solution: `CREATE INDEX products_sku_idx ON products (sku);
SELECT name FROM products WHERE sku = 'P-200';`,
    },
  ],
  quiz: [
    {
      question: "جدول فيه مليون صف ولا فهرس على phone. كم صفاً يُقرأ تقريباً؟",
      code: "SELECT name FROM users WHERE phone = '0500000000';",
      options: ["كل المليون", "صف واحد", "نحو 20 صفاً"],
      answer: 0,
      why: "بلا فهرس لا يعرف أين الصف، ولا يعرف أنه الوحيد، فيقرأ الجدول كله: Seq Scan، أي بحث خطي.",
    },
    {
      question: "أنشأنا فهرساً على email. أي استعلام يستفيد منه؟",
      code: "CREATE INDEX users_email_idx ON users (email);",
      options: ["WHERE email = 'ali@mail.com'", "WHERE name = 'Ali'", "كل استعلام على users"],
      answer: 0,
      why: "الشجرة مرتبة بالبريد وحده، كفهرس كتاب مرتب بالكلمات. البحث بالاسم لا يجد فيها ترتيباً يساعده، فيعود إلى قراءة الجدول.",
    },
    {
      question: "شجرة B-tree في كل عقدة منها نحو 100 مفتاح. كم مستوى تحتاج لمليون مفتاح؟",
      code: "-- level 1: 100 keys\n-- level 2: 100 * 100 = 10,000\n-- level 3: 100 * 100 * 100 = ?",
      options: ["3", "20", "1000"],
      answer: 0,
      why: "كل مستوى يضرب السعة في 100: 100 ثم 10 آلاف ثم مليون. ثلاث قفزات من الجذر إلى الورقة. شجرة ثنائية كانت ستحتاج نحو 20، لأن كل عقدة فيها تقسم على 2 فقط.",
    },
    {
      question: "على الجدول ستة فهارس. ماذا يحدث لـ INSERT؟",
      code: "INSERT INTO users (email, name, city, phone, age) VALUES (...);",
      options: ["يصير أبطأ: يكتب في الجدول وفي الأشجار الست", "يصير أسرع: الفهارس تعرف مكانه", "لا يتغير شيء"],
      answer: 0,
      why: "كل فهرس شجرة مرتبة يجب أن يدخل فيها المفتاح الجديد في مكانه الصحيح. فهارس أكثر تعني قراءات أسرع على أعمدتها، وكتابات أبطأ ومساحة أكبر.",
    },
    {
      question: "ماذا يطبع EXPLAIN هنا؟",
      code: "CREATE TABLE posts (id SERIAL PRIMARY KEY, title TEXT);\n-- 50,000 rows\nEXPLAIN SELECT title FROM posts WHERE title = 'Hello';",
      options: ["Seq Scan on posts", "Index Scan using posts_pkey", "Index Scan using posts_title_idx"],
      answer: 0,
      why: "الفهرس الوحيد هو posts_pkey على id، والبحث بـ title. لا شجرة مرتبة بالعنوان، فالخطة قراءة كاملة. posts_title_idx غير موجود لأن أحداً لم ينشئه.",
    },
  ],
  next: "transactions",
};
