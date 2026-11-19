import type { Lesson } from "@/lib/types";

export const linkedList: Lesson = {
  slug: "linked-list",
  stage: 3,
  number: "3.2",
  title: "القائمة المترابطة",
  subtitle: "عقد متفرقة في الذاكرة، كل واحدة تحمل سهماً إلى التالية",
  minutes: 15,
  problem: {
    title: "أدخل 20 دون أن تحرّك أحداً",
    body: "العقد متفرقة في الذاكرة، وكل واحدة تشير إلى التالية. أدخل 20 بين 10 و 30 بتغيير الأسهم فقط. انتبه للترتيب!",
    demo: "linkedList",
  },
  scene: {
    code: {
      js: `let head = { value: 30, next: null };
head = { value: 20, next: head };
head = { value: 10, next: head };
head = { value: 5, next: head };
let cur = head;
while (cur !== null) {
  console.log(cur.value);
  cur = cur.next;
}`,
      ts: `let head: ListNode = { value: 30, next: null };
head = { value: 20, next: head };
head = { value: 10, next: head };
head = { value: 5, next: head };
let cur: ListNode | null = head;
while (cur !== null) {
  console.log(cur.value);
  cur = cur.next;
}`,
      py: `head = {"value": 30, "next": None}
head = {"value": 20, "next": head}
head = {"value": 10, "next": head}
head = {"value": 5, "next": head}
cur = head
while cur is not None:
    print(cur["value"])
    cur = cur["next"]
`,
      go: `head := &Node{Value: 30, Next: nil}
head = &Node{Value: 20, Next: head}
head = &Node{Value: 10, Next: head}
head = &Node{Value: 5, Next: head}
cur := head
for cur != nil {
	fmt.Println(cur.Value)
	cur = cur.Next
}`,
      dart: `Node? head = Node(30, null);
head = Node(20, head);
head = Node(10, head);
head = Node(5, head);
var cur = head;
while (cur != null) {
  print(cur.value);
  cur = cur.next;
}`,
      rust: `let mut head = Box::new(Node { value: 30, next: None });
head = Box::new(Node { value: 20, next: Some(head) });
head = Box::new(Node { value: 10, next: Some(head) });
head = Box::new(Node { value: 5, next: Some(head) });
let mut cur = Some(&head);
while let Some(node) = cur {
    println!("{}", node.value);
    cur = node.next.as_ref();
}`,
    },
    notes: {
      js: "كل { value, next } كائن مستقل في الكومة، و next سهم إليه. السطر head = { value: 5, next: head } يُدخل في الأول بسهمين فقط مهما طالت القائمة.",
      ts: "نعرّف شكل العقدة مرة واحدة: type ListNode = { value: number; next: ListNode | null }. و | null تقول إن آخر عقدة لا تشير إلى شيء.",
      py: "هنا العقدة قاموس، وفي الكود الحقيقي غالباً صنف صغير class Node. None في بايثون تقابل null: نهاية السلسلة.",
      go: "نعرّف type Node struct { Value int; Next *Node } فوق البرنامج. &Node{...} تبني عقدة وتعطي سهمها، و nil نهاية السلسلة.",
      dart: "نعرّف class Node { int value; Node? next; Node(this.value, this.next); }. و Node? تعني: سهم قد يكون null.",
      rust: "Rust لا تقبل سهماً فارغاً، فنكتب next: Option<Box<Node>>: إما Some(عقدة) أو None. Box يضع العقدة في الكومة ويملكها.",
    },
    steps: [],
    trace: true,
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "قائمة من عقدتين: 10 ثم 30. نُدخل 20 بينهما بسهمين: أولاً تشير العقدة الجديدة إلى 30، ثم تشير 10 إلى الجديدة. راقب الأسهم في الكومة.",
    starter: `c = {"value": 30, "next": None}
b = {"value": 10, "next": c}
head = b
node = {"value": 20, "next": b["next"]}
b["next"] = node
cur = head
while cur is not None:
    print(cur["value"])
    cur = cur["next"]`,
    challenges: [
      "أضف قبل الحلقة سطراً يُدخل 5 في أول القائمة: head = {\"value\": 5, \"next\": head}. كم سهماً تغيّر؟",
      "احذف 20 من جديد بسطر واحد قبل الحلقة: b[\"next\"] = b[\"next\"][\"next\"]. أين ذهبت العقدة 20؟",
      "اجعل السطر الرابع node = {\"value\": 20, \"next\": None} وضع بعد السطر الخامس node[\"next\"] = b[\"next\"]. ماذا يحدث، ولماذا؟",
      "أضف عدّاداً steps داخل الحلقة واطبعه في النهاية. كم خطوة احتجنا لنصل إلى آخر عقدة؟",
    ],
  },
  predict: [
    {
      question: "أدخلنا العقدة 2 لكن بترتيب معكوس. ماذا يُطبع؟",
      code: `let a = { value: 1, next: null };
let b = { value: 3, next: null };
a.next = b;
let fresh = { value: 2, next: null };
a.next = fresh;
fresh.next = a.next;
console.log(fresh.next.value);`,
      options: ["3", "2", "خطأ"],
      answer: 1,
      why: "بعد a.next = fresh لم يعد a.next يشير إلى 3، بل إلى fresh نفسها. فـ fresh.next = a.next جعلت العقدة تشير إلى نفسها، و 3 لم يعد يصل إليها سهم من القائمة. اربط الجديدة أولاً ثم غيّر القديمة.",
    },
    {
      question: "كم خطوة نمشي من الرأس حتى نصل إلى العقدة 4؟",
      lang: "py",
      code: `head = None
for v in [4, 3, 2, 1]:
    head = {"value": v, "next": head}
cur = head
steps = 0
while cur["value"] != 4:
    cur = cur["next"]
    steps += 1
print(steps)`,
      options: ["1", "3", "4"],
      answer: 1,
      why: "القائمة 1 ثم 2 ثم 3 ثم 4. لا توجد معادلة عنوان: العقد متفرقة، والطريق الوحيد هو اتباع الأسهم من الرأس. ثلاثة أسهم حتى نصل إلى العنصر رقم 3.",
    },
    {
      question: "ماذا يُطبع بعد الإدراج في الأول؟",
      code: `let head = { value: 1, next: null };
let saved = head;
head = { value: 0, next: head };
console.log(saved.value, head.next === saved);`,
      options: ["0 false", "1 true", "0 true"],
      answer: 1,
      why: "الإدراج في الأول لم يحرّك العقدة 1 ولم ينسخها. بُنيت عقدة جديدة سهمها إلى العقدة 1 نفسها، ثم انتقل سهم head إليها. saved ما زال يشير إلى 1.",
    },
  ],
  code: {
    intro: "الصورة واحدة في كل اللغات: عقد متفرقة وسهم من كل واحدة إلى التالية، والقائمة نفسها مجرد سهم إلى الرأس. شغّل الكود وقارن الخطوات للوصول إلى أول عنصر وآخره.",
    runnerStarter: `function get(head, i) {
  let cur = head;
  let steps = 0;
  while (steps < i) {
    cur = cur.next;
    steps = steps + 1;
  }
  console.log("item", i, "=", cur.value, "after", steps, "steps");
}
let head = null;
for (let v = 9; v >= 0; v--) {
  head = { value: v, next: head };
}
get(head, 0);
get(head, 9);
// جرّب: أدخل 99 في أول القائمة بسطر واحد، ثم اقرأ get(head, 0) من جديد
`,
  },
  exercises: [
    {
      kind: "order",
      title: "ابنِ وامشِ",
      prompt: "رتّب الأسطر حتى يبني البرنامج القائمة 1 ثم 2 ثم 3 بالإدراج في الأول، ثم يطبعها.",
      lines: [
        "let head = { value: 3, next: null };",
        "head = { value: 2, next: head };",
        "head = { value: 1, next: head };",
        "let cur = head;",
        "while (cur !== null) {",
        "  console.log(cur.value);",
        "  cur = cur.next;",
        "}",
      ],
      expected: "1\n2\n3",
    },
    {
      kind: "fill",
      title: "تخطَّ العقدة",
      lang: "py",
      prompt: "أي سهم يحذف العقدة 2 فتطبع القائمة 1 ثم 3؟",
      template:
        'c = {"value": 3, "next": None}\nb = {"value": 2, "next": c}\na = {"value": 1, "next": b}\na["next"] = ___\ncur = a\nwhile cur is not None:\n    print(cur["value"])\n    cur = cur["next"]',
      options: ['b["next"]', "b", "None"],
      expected: "1\n3",
    },
    {
      kind: "fix",
      title: "القائمة التي ضاعت",
      prompt: "أردنا إدخال 0 في أول القائمة، لكن البرنامج يطبع 0 وحده. أصلحه حتى يطبع 0 ثم 1 ثم 2.",
      code: "let head = { value: 1, next: { value: 2, next: null } };\nhead = { value: 0, next: null };\nlet cur = head;\nwhile (cur !== null) {\n  console.log(cur.value);\n  cur = cur.next;\n}",
      expected: "0\n1\n2",
      hint: "العقدة الجديدة يجب أن تشير إلى الرأس القديم قبل أن يتحرك head إليها: next: head.",
      solution: `let head = { value: 1, next: { value: 2, next: null } };
head = { value: 0, next: head };
let cur = head;
while (cur !== null) {
  console.log(cur.value);
  cur = cur.next;
}`,
    },
    {
      kind: "write",
      title: "عدّ العقد",
      lang: "py",
      prompt: "اكتب دالة count_nodes(head) تمشي على الأسهم من الرأس وترجع عدد العقد. ابنِ قائمة من 4 عقد واطبع عددها: 4.",
      starter: "# اكتب الكود هنا\n",
      expected: "4",
      hint: "cur = head و count = 0، ثم while cur is not None: زد count وانتقل cur = cur[\"next\"].",
      solution: `def count_nodes(head):
    count = 0
    cur = head
    while cur is not None:
        count += 1
        cur = cur["next"]
    return count

head = None
for v in [4, 3, 2, 1]:
    head = {"value": v, "next": head}
print(count_nodes(head))`,
    },
  ],
  quiz: [
    { question: "قائمة مترابطة فيها 1000 عقدة. كم سهماً نغيّر لندخل عقدة في أولها؟", options: ["1000", "سهمين", "500"], answer: 1, why: "سهم العقدة الجديدة إلى الرأس القديم، ثم سهم head إليها. لا عقدة تتحرك مهما طالت القائمة، بخلاف المصفوفة التي تزيح الجميع." },
    { question: "كم سهماً نتبع من الرأس لنصل إلى العنصر رقم 499؟", options: ["1", "499", "500"], answer: 1, why: "العقد متفرقة ولا معادلة تعطي عنوان العنصر 499. نبدأ من الرأس (العنصر 0) ونتبع سهماً لكل خطوة: 499 سهماً." },
    { question: "ماذا يُطبع؟", code: "let c = { value: 3, next: null };\nlet b = { value: 2, next: c };\nlet a = { value: 1, next: b };\na.next = a.next.next;\nconsole.log(a.next.value);", options: ["2", "3", "خطأ"], answer: 1, why: "a.next.next هو سهم b إلى c. صار سهم a يقفز فوق b مباشرة إلى c. هكذا يُحذف عنصر: سهم واحد يتغيّر." },
    { question: "ماذا يُطبع؟", code: "let head = null;\nhead = { value: 1, next: head };\nhead = { value: 2, next: head };\nconsole.log(head.value, head.next.value);", options: ["1 2", "2 1", "2 null"], answer: 1, why: "كل إدراج في الأول يضع العقدة الجديدة أمام الرأس القديم. آخر ما أُدخل هو 2، فهو الرأس، وسهمه إلى 1." },
    { question: "ماذا يُطبع؟ وماذا حدث للعقدة 1؟", code: "let head = { value: 1, next: { value: 2, next: null } };\nhead = head.next;\nconsole.log(head.value);", options: ["1، والعقدة 1 ما زالت أول القائمة", "2، ولم يعد يصل إلى العقدة 1 أي سهم", "خطأ"], answer: 1, why: "القائمة مجرد سهم إلى الرأس. حين تحرّك head إلى العقدة 2 لم يعد شيء يشير إلى العقدة 1، فخرجت من القائمة." },
  ],
  next: "stack",
};
