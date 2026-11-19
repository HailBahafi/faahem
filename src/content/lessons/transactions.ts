import type { Lesson, Scene } from "@/lib/types";

const mini = (sql: string, steps: Scene["steps"]): Scene => ({ code: { sql }, steps });

const bank = `CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INT NOT NULL CHECK (balance >= 0));
INSERT INTO accounts (name, balance) VALUES ('Sara', 100), ('Ali', 50);`;

const bank3 = `CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INT NOT NULL CHECK (balance >= 0));
INSERT INTO accounts (name, balance) VALUES ('Sara', 100), ('Ali', 50), ('Omar', 20);`;

const sara = (v: string) => ({ name: "Sara", value: v, type: "number" as const });
const ali = (v: string) => ({ name: "Ali", value: v, type: "number" as const });
const total = (v: string) => ({ name: "total", value: v, type: "number" as const });

export const transactions: Lesson = {
  slug: "transactions",
  stage: 8,
  number: "8.4",
  title: "المعاملات",
  subtitle: "كل الخطوات تحدث، أو لا يحدث شيء منها",
  minutes: 20,
  singleLanguage: true,
  problem: {
    title: "اسحب القابس",
    body: "تحويل 30 ريالاً من سارة إلى علي خطوتان: اخصم ثم أضف. نفّذ الخطوات واحدة واحدة، واقطع الكهرباء في أي لحظة. راقب مجموع المال، مرة بلا معاملة ومرة معها.",
    demo: "transactions",
  },
  scene: {
    code: {
      sql: `CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INT CHECK (balance >= 0));
INSERT INTO accounts VALUES ('Sara', 100), ('Ali', 50);
BEGIN;
UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';
UPDATE accounts SET balance = balance + 30 WHERE name = 'Ali';
COMMIT;
BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE name = 'Sara';
ROLLBACK;`,
    },
    notes: {
      sql: "BEGIN يفتح المعاملة، COMMIT يثبّتها كلها دفعة واحدة، و ROLLBACK يمحوها كلها. بلا BEGIN، كل جملة معاملة وحدها تُثبَّت فور انتهائها.",
    },
    steps: [
      {
        line: null,
        say: "حسابان ومجموع مال. القاعدة الذهبية للبنك: التحويل ينقل المال، لا يصنعه ولا يحرقه. المجموع يجب أن يبقى ثابتاً.",
        memory: [],
      },
      {
        line: 1,
        say: "الجدول يحمل قاعدة: CHECK (balance >= 0). قاعدة البيانات سترفض أي رصيد سالب، مهما كان الكود.",
        memory: [],
      },
      {
        line: 2,
        say: "سارة معها 100 وعلي 50. المجموع 150.",
        memory: [sara("100"), ali("50"), total("150")],
        changed: ["Sara", "Ali", "total"],
      },
      {
        line: 3,
        say: "BEGIN: من هنا، كل تغيير مسودة. لن يراها أحد غيرنا، ولن تُحفظ نهائياً حتى COMMIT.",
        memory: [sara("100"), ali("50"), total("150")],
      },
      {
        line: 4,
        say: "الخطوة الأولى: سارة 70. الآن المجموع 120، 30 ريالاً في الهواء. لو انقطعت الكهرباء هنا، فالمسودة كلها تُرمى عند التشغيل، وتعود سارة 100.",
        memory: [sara("70"), ali("50"), total("120")],
        changed: ["Sara", "total"],
      },
      {
        line: 5,
        say: "الخطوة الثانية: علي 80. المجموع عاد 150، لكن ما زال مسودة.",
        memory: [sara("70"), ali("80"), total("150")],
        changed: ["Ali", "total"],
      },
      {
        line: 6,
        say: "COMMIT: الخطوتان تُكتبان معاً في سجل على القرص، ثم يراهما الجميع. بعد هذا السطر، انقطاع الكهرباء لا يمحوهما.",
        memory: [sara("70"), ali("80"), total("150")],
      },
      {
        line: 8,
        say: "معاملة جديدة تحاول خصم 500 من سارة. الرصيد سيصير -430، و CHECK ترفض: الجملة تفشل والمعاملة كلها صارت معطوبة.",
        memory: [sara("70"), ali("80"), total("150")],
        error: 'new row for relation "accounts" violates check constraint "accounts_balance_check"',
      },
      {
        line: 9,
        say: "ROLLBACK يرمي كل ما بعد BEGIN. لا شيء تغيّر: سارة 70، علي 80، والمجموع 150 كما كان.",
        memory: [sara("70"), ali("80"), total("150")],
        read: ["total"],
      },
    ],
  },
  playground: {
    kind: "sql",
    intro: "حسابان: سارة 100 وعلي 50، والرصيد لا يقبل السالب. المعاملة تبدأ بـ BEGIN وتنتهي بـ COMMIT أو ROLLBACK. السطر الأخير يطبع المجموع: يجب أن يبقى 150.",
    setup: bank,
    starter: `BEGIN;
UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';
UPDATE accounts SET balance = balance + 30 WHERE name = 'Ali';
COMMIT;
SELECT name, balance FROM accounts ORDER BY name;
SELECT SUM(balance) AS total FROM accounts;`,
    challenges: [
      "غيّر COMMIT إلى ROLLBACK وتوقّع الأرصدة قبل أن تشغّل.",
      "أضف SELECT name, balance FROM accounts ORDER BY name; بعد أول UPDATE، والمعاملة ما زالت مفتوحة. ماذا ترى؟ (المعاملة ترى مسودتها.)",
      "احذف سطر إضافة 30 لعلي واترك الباقي. ما المجموع الآن؟ المعاملة تحمي ما وضعته فيها فقط.",
      "غيّر 30 إلى 300 في السطرين. اقرأ رسالة الخطأ: أي قاعدة رفضت التحويل؟",
    ],
  },
  predict: [
    {
      question: "خصمنا داخل معاملة، ثم تراجعنا. ماذا يطبع آخر سطر؟",
      code: `BEGIN;
UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';
SELECT balance FROM accounts WHERE name = 'Sara';
ROLLBACK;
SELECT balance FROM accounts WHERE name = 'Sara';`,
      options: ["100", "70", "خطأ: الصف تغيّر"],
      answer: 0,
      why: "داخل المعاملة ترى مسودتك (70). ROLLBACK يرمي المسودة كلها، فيعود الرصيد كما كان قبل BEGIN: 100.",
      scene: mini(
        `BEGIN;
UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';
SELECT balance FROM accounts WHERE name = 'Sara';
ROLLBACK;
SELECT balance FROM accounts WHERE name = 'Sara';`,
        [
          { line: 1, say: "مسودة جديدة تبدأ.", memory: [sara("100")] },
          { line: 2, say: "في المسودة: سارة 70.", memory: [sara("70")], changed: ["Sara"] },
          { line: 3, say: "المعاملة ترى تغييراتها هي.", memory: [sara("70")], read: ["Sara"], output: ["balance", "70"] },
          { line: 4, say: "المسودة تُرمى كلها.", memory: [sara("100")], changed: ["Sara"], output: ["balance", "70"] },
          { line: 5, say: "القيمة المحفوظة لم تتغير قط.", memory: [sara("100")], read: ["Sara"], output: ["balance", "70", "balance", "100"] },
        ],
      ),
    },
    {
      question: "بلا BEGIN، انقطعت الكهرباء بعد السطر الأول مباشرة. كم مجموع المال بعد إعادة التشغيل؟",
      code: `-- Sara 100, Ali 50 (total 150)
UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';
-- power cut here
UPDATE accounts SET balance = balance + 30 WHERE name = 'Ali';`,
      options: ["120", "150", "180"],
      answer: 0,
      why: "بلا BEGIN، كل جملة تُثبَّت وحدها فور انتهائها. الخصم حُفظ، والإضافة لم تحدث قط: 30 ريالاً اختفت. داخل BEGIN كان الخصم سيبقى مسودة تُرمى، فيعود المجموع 150.",
      scene: mini(
        `-- Sara 100, Ali 50 (total 150)
UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';
-- power cut here
UPDATE accounts SET balance = balance + 30 WHERE name = 'Ali';`,
        [
          { line: 1, say: "البداية: 150.", memory: [sara("100"), ali("50"), total("150")] },
          { line: 2, say: "جملة وحدها، فهي معاملة كاملة: تُحفظ فوراً.", memory: [sara("70"), ali("50"), total("120")], changed: ["Sara", "total"] },
          { line: 3, say: "انقطاع. عند التشغيل، ما حُفظ يبقى.", memory: [sara("70"), ali("50"), total("120")], error: "power lost" },
          { line: 4, say: "هذا السطر لم يُنفَّذ أبداً. المجموع 120.", memory: [sara("70"), ali("50"), total("120")], read: ["total"] },
        ],
      ),
    },
    {
      question: "معاملة سارة مفتوحة ولم تصل إلى COMMIT. في اللحظة نفسها يقرأ علي رصيد سارة من جهازه. ماذا يرى؟",
      code: `-- Sara's connection:
BEGIN;
UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';
-- Ali's connection, at the same moment:
SELECT balance FROM accounts WHERE name = 'Sara';`,
      options: ["100", "70", "ينتظر إلى الأبد"],
      answer: 0,
      why: "المسودة لا يراها إلا صاحبها. علي يرى آخر قيمة ثُبّتت: 100. بعد COMMIT فقط يرى 70. هكذا لا يقرأ أحد عملاً نصف منجز.",
      scene: mini(
        `-- Sara's connection:
BEGIN;
UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';
-- Ali's connection, at the same moment:
SELECT balance FROM accounts WHERE name = 'Sara';`,
        [
          { line: 2, say: "اتصال سارة يفتح مسودة.", memory: [{ name: "saved", value: "100", type: "number" }, { name: "draft", value: "100", type: "number" }] },
          { line: 3, say: "المسودة صارت 70، والمحفوظ ما زال 100.", memory: [{ name: "saved", value: "100", type: "number" }, { name: "draft", value: "70", type: "number" }], changed: ["draft"] },
          { line: 5, say: "علي من اتصال آخر يقرأ المحفوظ، لا مسودة غيره.", memory: [{ name: "saved", value: "100", type: "number" }, { name: "draft", value: "70", type: "number" }], read: ["saved"], output: ["balance", "100"] },
        ],
      ),
    },
  ],
  code: {
    intro: "تحويل داخل معاملة، ثم الأرصدة والمجموع. جرّب أن تكسره: ROLLBACK بدل COMMIT، أو مبلغ أكبر من رصيد سارة.",
    runnerLang: "sql",
    runnerSetup: bank,
    runnerStarter: `BEGIN;
UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';
UPDATE accounts SET balance = balance + 30 WHERE name = 'Ali';
COMMIT;
SELECT name, balance FROM accounts ORDER BY name;
SELECT SUM(balance) AS total FROM accounts;
-- جرّب: 30 تصير 120، ثم شغّل واقرأ الخطأ
`,
  },
  exercises: [
    {
      kind: "order",
      title: "تحويل كامل",
      prompt: "رتّب الأسطر: افتح معاملة، انقل 30 من سارة إلى علي، ثبّتها، ثم اطبع الأرصدة.",
      lang: "sql",
      setup: bank,
      lines: [
        "BEGIN;",
        "UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';",
        "UPDATE accounts SET balance = balance + 30 WHERE name = 'Ali';",
        "COMMIT;",
        "SELECT name, balance FROM accounts ORDER BY name;",
      ],
      expected: "name | balance\nAli | 80\nSara | 70",
    },
    {
      kind: "fill",
      title: "حوّلت للشخص الخطأ",
      prompt: "سارة أرسلت 30 إلى عمر بدل علي، ولم تثبّت المعاملة بعد. أي كلمة تمحو التحويل كله فتعود الأرصدة كما كانت؟",
      lang: "sql",
      setup: bank3,
      template: `BEGIN;
UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';
UPDATE accounts SET balance = balance + 30 WHERE name = 'Omar';
___;
SELECT name, balance FROM accounts ORDER BY name;`,
      options: ["ROLLBACK", "COMMIT", "BEGIN"],
      expected: "name | balance\nAli | 50\nOmar | 20\nSara | 100",
    },
    {
      kind: "fix",
      title: "مال من العدم",
      prompt: "التحويل من سارة إلى علي داخل معاملة، لكن المجموع صار 180 بدل 150. المعاملة تحمي ما تضعه فيها فقط. أصلح التحويل حتى تُطبع الأرصدة الصحيحة والمجموع 150.",
      lang: "sql",
      setup: bank,
      code: `BEGIN;
UPDATE accounts SET balance = balance + 30 WHERE name = 'Ali';
COMMIT;
SELECT name, balance FROM accounts ORDER BY name;
SELECT SUM(balance) AS total FROM accounts;`,
      expected: "name | balance\nAli | 80\nSara | 70\ntotal\n150",
      hint: "التحويل خطوتان. أضف بعد BEGIN: UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';",
      solution: `BEGIN;
UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';
UPDATE accounts SET balance = balance + 30 WHERE name = 'Ali';
COMMIT;
SELECT name, balance FROM accounts ORDER BY name;
SELECT SUM(balance) AS total FROM accounts;`,
    },
    {
      kind: "write",
      title: "علي يرد الدين",
      prompt: "اكتب معاملة تنقل 20 من علي إلى عمر وتثبّتها، ثم اطبع name و balance لكل الحسابات مرتبة بالاسم، ثم المجموع باسم total.",
      lang: "sql",
      setup: bank3,
      starter: "-- BEGIN ... COMMIT\n-- then SELECT the balances and the total\n",
      expected: "name | balance\nAli | 30\nOmar | 40\nSara | 100\ntotal\n170",
      hint: "BEGIN; ثم UPDATE يخصم 20 من Ali و UPDATE يضيف 20 لـ Omar، ثم COMMIT; ثم SELECT name, balance ... ORDER BY name; و SELECT SUM(balance) AS total FROM accounts;",
      solution: `BEGIN;
UPDATE accounts SET balance = balance - 20 WHERE name = 'Ali';
UPDATE accounts SET balance = balance + 20 WHERE name = 'Omar';
COMMIT;
SELECT name, balance FROM accounts ORDER BY name;
SELECT SUM(balance) AS total FROM accounts;`,
    },
  ],
  quiz: [
    {
      question: "سارة 100 وعلي 50. ماذا يطبع آخر سطر؟",
      code: "BEGIN;\nUPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';\nUPDATE accounts SET balance = balance + 30 WHERE name = 'Ali';\nROLLBACK;\nSELECT SUM(balance) AS total FROM accounts;",
      options: ["150", "120", "180"],
      answer: 0,
      why: "ROLLBACK رمى الخطوتين معاً، فلم يتغير شيء: 150. وحتى لو ثبّتنا لكان 150، لأن التحويل الكامل ينقل المال ولا يغيّر المجموع.",
    },
    {
      question: "سارة 100. ماذا يحدث؟",
      code: "BEGIN;\nUPDATE accounts SET balance = balance + 500 WHERE name = 'Ali';\nUPDATE accounts SET balance = balance - 500 WHERE name = 'Sara';\nCOMMIT;",
      options: ["الجملة الثانية تفشل والمعاملة كلها تُلغى: علي لا يأخذ شيئاً", "علي يأخذ 500 وسارة تبقى 100", "سارة تصير -400"],
      answer: 0,
      why: "CHECK (balance >= 0) ترفض -400. فشل جملة يعطب المعاملة كلها، فلا تُثبَّت إضافة علي أيضاً. كل شيء أو لا شيء.",
    },
    {
      question: "انقطعت الكهرباء بعد COMMIT بثانية. ماذا نجد عند التشغيل؟",
      code: "BEGIN;\nUPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';\nUPDATE accounts SET balance = balance + 30 WHERE name = 'Ali';\nCOMMIT;\n-- power cut",
      options: ["التحويل محفوظ: سارة 70 وعلي 80", "التحويل ضاع: سارة 100 وعلي 50", "نصف التحويل فقط"],
      answer: 0,
      why: "COMMIT لا يعود إلا بعد أن يُكتب التحويل في سجل على القرص. ما ثُبّت يبقى بعد أي انقطاع؛ وما لم يُثبّت يُرمى كله.",
    },
    {
      question: "بلا BEGIN، انقطعت الكهرباء بين السطرين. ما رصيدا سارة وعلي؟",
      code: "UPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';\n-- power cut\nUPDATE accounts SET balance = balance + 30 WHERE name = 'Ali';",
      options: ["سارة 70 وعلي 50", "سارة 100 وعلي 50", "سارة 70 وعلي 80"],
      answer: 0,
      why: "كل جملة وحدها معاملة تُثبَّت فوراً. الخصم ثُبّت والإضافة لم تحدث: 30 ريالاً اختفت. لهذا نضع الخطوتين داخل BEGIN ... COMMIT.",
    },
    {
      question: "داخل المعاملة، قبل COMMIT، ماذا يطبع SELECT؟",
      code: "BEGIN;\nUPDATE accounts SET balance = balance - 30 WHERE name = 'Sara';\nSELECT balance FROM accounts WHERE name = 'Sara';",
      options: ["70", "100", "خطأ: المعاملة لم تنتهِ"],
      answer: 0,
      why: "المعاملة ترى مسودتها هي، فترى 70. الاتصالات الأخرى هي التي ترى 100 حتى COMMIT.",
    },
  ],
  next: "redis",
};
