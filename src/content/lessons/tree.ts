import type { Lesson } from "@/lib/types";

export const tree: Lesson = {
  slug: "tree",
  stage: 3,
  number: "3.6",
  title: "الشجرة",
  subtitle: "عقد بأسهم إلى أبنائها، والأصغر يساراً والأكبر يميناً",
  minutes: 20,
  problem: {
    title: "أين 42؟",
    body: "أدخل أرقاماً وراقب الطريق الذي يسلكه كل رقم حتى يجد مكانه: أصغر فيساراً، أكبر فيميناً. ثم ابحث عن رقم، وقارن عدد الخطوات في الشجرة وفي قائمة عادية.",
    demo: "tree",
  },
  scene: {
    trace: "py",
    steps: [],
    code: {
      js: `let root = { value: 50, left: null, right: null };
root.left = { value: 30, left: null, right: null };
root.right = { value: 70, left: null, right: null };
root.right.left = { value: 60, left: null, right: null };
let node = root;
while (node.value !== 60) {
  node = 60 < node.value ? node.left : node.right;
}
console.log(node.value);`,
      py: `root = {"value": 50, "left": None, "right": None}
root["left"] = {"value": 30, "left": None, "right": None}
root["right"] = {"value": 70, "left": None, "right": None}
root["right"]["left"] = {"value": 60, "left": None, "right": None}
node = root
while node["value"] != 60:
    node = node["left"] if 60 < node["value"] else node["right"]

print(node["value"])`,
      go: `root := &Node{Value: 50}
root.Left = &Node{Value: 30}
root.Right = &Node{Value: 70}
root.Right.Left = &Node{Value: 60}
node := root
for node.Value != 60 {
	if 60 < node.Value { node = node.Left } else { node = node.Right }
}
fmt.Println(node.Value)`,
    },
    notes: {
      js: "كل عقدة كائن على الكومة فيه قيمة وسهمان: left و right. null تعني «لا ابن هنا». والمتغيّر node سهم يمشي من عقدة إلى أخرى، لا نسخة منها.",
      py: "في Python العقدة dict، و None مكان null. لاحظ أن البحث لم يزر 30 أبداً: مقارنة واحدة عند 50 استبعدت الفرع الأيسر كله.",
      go: "في Go العقدة struct اسمه Node (مُعرَّف في مكان آخر، فيه Value و Left و Right من نوع *Node)، و & تصنع العقدة وتعطي سهماً إليها. الأسهم الفارغة nil تلقائياً.",
    },
  },
  playground: {
    kind: "trace",
    intro: "insert دالة عودية: إن وصلت إلى مكان فارغ (null) صنعت عقدة جديدة، وإلا سألت: أصغر أم أكبر؟ ونزلت يساراً أو يميناً. شغّل وراقب الإطارات على المكدّس والعقد على الكومة.",
    starter: `function insert(node, value) {
  if (node === null) {
    return { value: value, left: null, right: null };
  }
  if (value < node.value) {
    node.left = insert(node.left, value);
  } else {
    node.right = insert(node.right, value);
  }
  return node;
}
let root = null;
root = insert(root, 50);
root = insert(root, 30);
root = insert(root, 70);
root = insert(root, 40);
console.log(root.left.right.value);`,
    challenges: [
      "أضف root = insert(root, 60). أي طريق سيسلك؟ توقّع: يمين ثم يسار؟ ثم اطبع root.right.left.value.",
      "أدخل الأرقام 10 ثم 20 ثم 30 ثم 40 بهذا الترتيب بدل الأرقام الحالية. ما شكل الشجرة على الكومة؟",
      "اكتب دالة walk(node) تطبع الشجرة: إن كان node فارغاً ارجع، وإلا walk(node.left) ثم اطبع node.value ثم walk(node.right). بأي ترتيب خرجت الأرقام؟",
      "كم إطاراً لـ insert ستراه في أعلى لحظة عند إدخال 40؟ توقّع قبل أن تضغط.",
    ],
  },
  predict: [
    {
      question: "أدخلنا 10 ثم 20 ثم 30. ماذا يطبع البرنامج؟",
      code: `function insert(node, value) {
  if (node === null) {
    return { value: value, left: null, right: null };
  }
  if (value < node.value) {
    node.left = insert(node.left, value);
  } else {
    node.right = insert(node.right, value);
  }
  return node;
}
let root = null;
root = insert(root, 10);
root = insert(root, 20);
root = insert(root, 30);
console.log(root.right.right.value);`,
      options: ["30", "20", "خطأ: root.right.right غير موجود"],
      answer: 0,
      why: "الشجرة لا توازن نفسها. 20 أكبر من 10 فذهب يميناً، و 30 أكبر من 10 ثم من 20 فذهب يميناً مرتين. صارت الشجرة خطاً مستقيماً كالقائمة، وضاعت ميزة استبعاد النصف.",
    },
    {
      question: "بأي ترتيب تُطبع القيم؟",
      lang: "py",
      code: `def walk(node):
    if node is None:
        return
    walk(node["left"])
    print(node["value"])
    walk(node["right"])

leaf30 = {"value": 30, "left": None, "right": None}
leaf70 = {"value": 70, "left": None, "right": None}
root = {"value": 50, "left": leaf30, "right": leaf70}
walk(root)`,
      options: ["30 ثم 50 ثم 70", "50 ثم 30 ثم 70", "70 ثم 50 ثم 30"],
      answer: 0,
      why: "walk(root) لا تطبع 50 أولاً: تنزل يساراً قبل أي طباعة، فيطبع 30، ثم ترجع فتطبع 50، ثم تنزل يميناً فتطبع 70. يسار ثم العقدة ثم يمين يعطي القيم مرتّبة دائماً.",
    },
    {
      question: "في الشجرة 5 عقد. كم مقارنة للوصول إلى 80؟",
      code: `let n60 = { value: 60, left: null, right: null };
let n80 = { value: 80, left: null, right: null };
let n70 = { value: 70, left: n60, right: n80 };
let n30 = { value: 30, left: null, right: null };
let root = { value: 50, left: n30, right: n70 };
let node = root;
let checks = 0;
while (node !== null) {
  checks = checks + 1;
  if (node.value === 80) break;
  node = 80 < node.value ? node.left : node.right;
}
console.log(checks);`,
      options: ["3", "5", "1"],
      answer: 0,
      why: "البحث لا يزور كل العقد: 50 (أكبر، يميناً)، 70 (أكبر، يميناً)، 80 وجدناه. ثلاث مقارنات. 30 و 60 لم تُلمسا، لأن كل مقارنة تستبعد فرعاً كاملاً.",
    },
  ],
  code: {
    intro: "الأشجار حولك في كل مكان: المجلدات على قرصك (مجلد فيه مجلدات)، وصفحة HTML (عنصر فيه عناصر)، وشجرة العائلة. هنا شجرة بحث ثنائية كاملة في Python: إدخال وبحث وطباعة مرتّبة، وكلها عودية لأن كل فرع شجرة صغيرة.",
    runnerLang: "py",
    runnerStarter: `def insert(node, value):
    if node is None:
        return {"value": value, "left": None, "right": None}
    if value < node["value"]:
        node["left"] = insert(node["left"], value)
    else:
        node["right"] = insert(node["right"], value)
    return node

def contains(node, x):
    if node is None:
        return False
    if x == node["value"]:
        return True
    if x < node["value"]:
        return contains(node["left"], x)
    return contains(node["right"], x)

def walk(node):
    if node is None:
        return
    walk(node["left"])
    print(node["value"], end=" ")
    walk(node["right"])

root = None
for v in [50, 30, 70, 20, 40, 60, 80]:
    root = insert(root, v)
walk(root)
print()
print(contains(root, 60), contains(root, 65))
# جرّب: اكتب دالة height(node) ترجع 0 للفارغ، وإلا 1 + أكبر ارتفاع بين الفرعين
`,
  },
  exercises: [
    {
      kind: "order",
      title: "ابنِ شجرة صغيرة",
      prompt: "رتّب الأسطر حتى تُبنى الجذر ثم ابناه، ويطبع البرنامج 3 8 10.",
      lines: [
        "let root = { value: 8, left: null, right: null };",
        "root.left = { value: 3, left: null, right: null };",
        "root.right = { value: 10, left: null, right: null };",
        "console.log(root.left.value, root.value, root.right.value);",
      ],
      expected: "3 8 10",
    },
    {
      kind: "fill",
      title: "إلى أي جهة؟",
      prompt: "نبحث عن 30 وهو أصغر من الجذر. أي سهم نتبع حتى يطبع البرنامج found؟",
      template: `let root = { value: 50, left: { value: 30, left: null, right: null }, right: { value: 70, left: null, right: null } };
let node = root;
while (node !== null && node.value !== 30) {
  node = 30 < node.value ? node.___ : node.right;
}
console.log(node === null ? "not found" : "found");`,
      options: ["left", "right", "value"],
      expected: "found",
    },
    {
      kind: "fix",
      title: "يبحث في جهة واحدة",
      lang: "py",
      prompt: "contains لا تجد 70 مع أنه في الشجرة. أصلحها حتى تطبع True ثم False.",
      code: `def contains(node, x):
    if node is None:
        return False
    if node["value"] == x:
        return True
    if x < node["value"]:
        return contains(node["left"], x)
    return contains(node["left"], x)

root = {"value": 50,
        "left": {"value": 30, "left": None, "right": None},
        "right": {"value": 70, "left": None, "right": None}}
print(contains(root, 70))
print(contains(root, 65))`,
      expected: "True\nFalse",
      hint: "حين يكون x أكبر من قيمة العقدة، في أي فرع يجب أن يكون؟ انظر إلى السطر الأخير في الدالة.",
      solution: `def contains(node, x):
    if node is None:
        return False
    if node["value"] == x:
        return True
    if x < node["value"]:
        return contains(node["left"], x)
    return contains(node["right"], x)

root = {"value": 50,
        "left": {"value": 30, "left": None, "right": None},
        "right": {"value": 70, "left": None, "right": None}}
print(contains(root, 70))
print(contains(root, 65))`,
    },
    {
      kind: "write",
      title: "عُدّ العقد",
      prompt: "اكتب دالة عودية count(node) ترجع عدد العقد: 0 للفارغ، وإلا 1 + عدد عقد اليسار + عدد عقد اليمين. ثم اطبع count(root).",
      starter: `let root = {
  value: 50,
  left: { value: 30, left: null, right: null },
  right: {
    value: 70,
    left: { value: 60, left: null, right: null },
    right: null,
  },
};
// اكتب count هنا ثم اطبع count(root)
`,
      expected: "4",
      hint: "if (node === null) { return 0; }  ثم  return 1 + count(node.left) + count(node.right);",
      solution: `let root = {
  value: 50,
  left: { value: 30, left: null, right: null },
  right: {
    value: 70,
    left: { value: 60, left: null, right: null },
    right: null,
  },
};
function count(node) {
  if (node === null) {
    return 0;
  }
  return 1 + count(node.left) + count(node.right);
}
console.log(count(root));`,
    },
  ],
  quiz: [
    {
      question: "أدخلنا 5 ثم 3 ثم 8 ثم 1 في شجرة بحث. ماذا يُطبع؟",
      code: "function insert(node, v) {\n  if (node === null) {\n    return { value: v, left: null, right: null };\n  }\n  if (v < node.value) {\n    node.left = insert(node.left, v);\n  } else {\n    node.right = insert(node.right, v);\n  }\n  return node;\n}\nlet root = null;\nfor (const v of [5, 3, 8, 1]) {\n  root = insert(root, v);\n}\nconsole.log(root.left.left.value);",
      options: ["1", "3", "8"],
      answer: 0,
      why: "5 صار الجذر. 3 أصغر فذهب يساراً. 8 أكبر فذهب يميناً. 1 أصغر من 5 ثم من 3، فنزل يساراً مرتين: root.left.left.",
    },
    {
      question: "أين يقع 65 في الشجرة 50 (يسارها 30، يمينها 70)؟",
      code: "let root = { value: 50, left: { value: 30, left: null, right: null }, right: { value: 70, left: null, right: null } };\nlet node = root;\nlet path = \"\";\nwhile (node !== null) {\n  path = path + node.value + \" \";\n  node = 65 < node.value ? node.left : node.right;\n}\nconsole.log(path);",
      options: ["50 70", "50 30", "50 30 70"],
      answer: 0,
      why: "65 أكبر من 50 فيميناً إلى 70، و 65 أصغر من 70 فيساراً، وهناك null فيتوقف. الطريق 50 ثم 70 فقط، و 30 لا يُزار. مكان 65 الجديد سيكون يسار 70.",
    },
    {
      question: "شجرة بُنيت بإدخال 1 ثم 2 ثم 3 ثم 4 ثم 5. كم مقارنة لإيجاد 5؟",
      code: "let n5 = { value: 5, left: null, right: null };\nlet n4 = { value: 4, left: null, right: n5 };\nlet n3 = { value: 3, left: null, right: n4 };\nlet n2 = { value: 2, left: null, right: n3 };\nlet root = { value: 1, left: null, right: n2 };\nlet node = root;\nlet checks = 1;\nwhile (node.value !== 5) {\n  node = 5 < node.value ? node.left : node.right;\n  checks = checks + 1;\n}\nconsole.log(checks);",
      options: ["5", "3", "1"],
      answer: 0,
      why: "الأرقام دخلت مرتّبة، فكل واحد ذهب يمين الذي قبله، وصارت الشجرة خطاً. لا نصف يُستبعد: نزور 1 و 2 و 3 و 4 و 5. خمس مقارنات، كالقائمة تماماً.",
    },
    {
      question: "ماذا يُطبع؟",
      code: "function height(node) {\n  if (node === null) {\n    return 0;\n  }\n  return 1 + Math.max(height(node.left), height(node.right));\n}\nlet root = { value: 50, left: { value: 30, left: { value: 20, left: null, right: null }, right: null }, right: { value: 70, left: null, right: null } };\nconsole.log(height(root));",
      options: ["3", "4", "2"],
      answer: 0,
      why: "أطول طريق من الجذر إلى الأسفل هو 50 ثم 30 ثم 20: ثلاث عقد. كل إطار يرجع 1 زائد أطول فرع تحته، والفارغ يرجع 0.",
    },
    {
      question: "ماذا يُطبع؟",
      code: "function walk(node) {\n  if (node === null) {\n    return;\n  }\n  walk(node.right);\n  console.log(node.value);\n  walk(node.left);\n}\nlet root = { value: 5, left: { value: 2, left: null, right: null }, right: { value: 9, left: null, right: null } };\nwalk(root);",
      options: ["9 ثم 5 ثم 2", "2 ثم 5 ثم 9", "5 ثم 9 ثم 2"],
      answer: 0,
      why: "هذه المرة تنزل الدالة يميناً أولاً، فتطبع الأكبر قبل غيره: 9، ثم العقدة 5، ثم اليسار 2. قلبُ الجهتين يعطي ترتيباً تنازلياً.",
    },
  ],
  next: "graph",
};
