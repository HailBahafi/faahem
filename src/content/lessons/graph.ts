import type { Lesson } from "@/lib/types";

export const graph: Lesson = {
  slug: "graph",
  stage: 3,
  number: "3.7",
  title: "الرسم البياني",
  subtitle: "أماكن تصلها طرق، بأي شكل، حتى الدوائر",
  minutes: 18,
  problem: {
    title: "أقصر طريق في المدينة",
    body: "الشجرة لها جذر وفروع لا تعود. المدينة ليست كذلك: الطرق تتشابك وتدور. اختر مكاناً، واضغط «خطوة»، وراقب البحث ينتشر حلقة بعد حلقة والطابور بجانبه. ثم جرّب المكدّس وقارن.",
    demo: "graph",
  },
  scene: {
    code: {
      js: `let graph = { A: ["B", "C"], B: ["D"], C: ["D", "E"], D: [], E: [] };
let dist = { A: 0 };
let queue = ["A"];
while (queue.length > 0) {
  let node = queue.shift();
  for (const nb of graph[node]) {
    if (dist[nb] === undefined) {
      dist[nb] = dist[node] + 1;
      queue.push(nb);
    }
  }
}`,
      py: `graph = {"A": ["B", "C"], "B": ["D"], "C": ["D", "E"], "D": [], "E": []}
dist = {"A": 0}
queue = ["A"]
while queue:
    node = queue.pop(0)
    for nb in graph[node]:
        if nb not in dist:
            dist[nb] = dist[node] + 1
            queue.append(nb)


`,
      go: `graph := map[string][]string{"A": {"B", "C"}, "B": {"D"}, "C": {"D", "E"}, "D": {}, "E": {}}
dist := map[string]int{"A": 0}
queue := []string{"A"}
for len(queue) > 0 {
	node := queue[0]; queue = queue[1:]
	for _, nb := range graph[node] {
		if _, ok := dist[nb]; !ok {
			dist[nb] = dist[node] + 1
			queue = append(queue, nb)
		}
	}
}`,
    },
    notes: {
      js: "الرسم البياني كائن: كل مفتاح مكان، وقيمته مصفوفة جيرانه. shift تأخذ من أول الطابور و push تضيف إلى آخره، و dist[nb] === undefined تعني «لم نصل هذا المكان بعد».",
      py: "الرسم dict قيمه قوائم. pop(0) تأخذ من أول القائمة، و not in تسأل هل وصلنا المكان من قبل. في البرامج الكبيرة يُستعمل collections.deque لأن الأخذ من أوله لا يزحزح الباقي.",
      go: "الرسم map مفاتيحه نصوص وقيمه شرائح جيران. نقرأ أول الطابور queue[0] ثم نقصّه queue[1:]، و _, ok := dist[nb] تسأل هل المفتاح موجود.",
    },
    steps: [],
    trace: "py",
  },
  playground: {
    kind: "trace",
    intro: "هذا بحث بالعمق: نفس الحلقة، لكن بمكدّس بدل الطابور، ومعه seen يتذكر ما رأيناه. شغّل وراقب المكدّس على الكومة: آخر من دخل أول من يخرج.",
    starter: `let graph = { A: ["B", "C"], B: ["D"], C: ["E"], D: [], E: [] };
let stack = ["A"];
let seen = { A: true };
while (stack.length > 0) {
  let node = stack.pop();
  console.log(node);
  for (const nb of graph[node]) {
    if (!seen[nb]) {
      seen[nb] = true;
      stack.push(nb);
    }
  }
}`,
    challenges: [
      "غيّر stack.pop() إلى stack.shift(). صار المكدّس طابوراً: بأي ترتيب ستُطبع الأماكن الآن؟ توقّع قبل أن تضغط.",
      "أضف طريقاً يصنع دائرة: اجعل D: [\"A\"]. هل يزور البرنامج A مرة ثانية؟ ولماذا؟",
      "مع الدائرة نفسها، احذف السطر if (!seen[nb]) وقوسه. ماذا يحدث للتتبّع؟",
      "أضف مكاناً جديداً F لا يصله أي طريق. هل سيُطبع؟",
    ],
  },
  predict: [
    {
      question: "في هذا الرسم دائرة: A إلى B إلى C ثم عودة إلى A. ماذا يطبع البرنامج؟",
      code: `let graph = { A: ["B"], B: ["C"], C: ["A"] };
let queue = ["A"];
let seen = { A: true };
while (queue.length > 0) {
  let node = queue.shift();
  console.log(node);
  for (const nb of graph[node]) {
    if (!seen[nb]) {
      seen[nb] = true;
      queue.push(nb);
    }
  }
}`,
      options: ["A ثم B ثم C، ويتوقف", "A B C A B C بلا نهاية", "A فقط"],
      answer: 0,
      why: "عندما يعود الطريق من C إلى A نجد seen.A صحيحاً، فلا نضيفه للطابور مرة أخرى. seen هي ما يمنع الدوران في دائرة إلى الأبد.",
    },
    {
      question: "من A إلى D طريقان: مباشر، أو عبر B ثم C. ماذا يطبع؟",
      lang: "py",
      code: `graph = {"A": ["B", "D"], "B": ["C"], "C": ["D"], "D": []}
dist = {"A": 0}
queue = ["A"]
while queue:
    node = queue.pop(0)
    for nb in graph[node]:
        if nb not in dist:
            dist[nb] = dist[node] + 1
            queue.append(nb)
print(dist["D"])`,
      options: ["1", "3", "2"],
      answer: 0,
      why: "البحث بالعرض يفرغ الحلقة الأولى كلها (B و D) قبل أن يتقدم. D وُصل من A مباشرة بمسافة 1، وعندما يأتي من C لاحقاً يجده في dist فيتركه. أول وصول هو أقصر وصول.",
    },
    {
      question: "هذا بحث بالمكدّس. بأي ترتيب تُطبع الأماكن؟",
      code: `let graph = { A: ["B", "C"], B: ["D"], C: [], D: [] };
let stack = ["A"];
while (stack.length > 0) {
  let node = stack.pop();
  console.log(node);
  for (const nb of graph[node]) {
    stack.push(nb);
  }
}`,
      options: ["A C B D", "A B C D", "A B D C"],
      answer: 0,
      why: "بعد A يصير المكدّس [B, C]. pop تأخذ الأحدث، أي C. ثم B، فيدخل D ويخرج فوراً. المكدّس يغوص في آخر ما دخل، والطابور كان سيعطي A B C D.",
    },
  ],
  code: {
    intro: "هذا هو البحث بالعرض في مدينة حقيقية، مع درج إضافي came_from يتذكر من أين وصلنا كل مكان. منه نرسم الطريق بالعكس من الهدف إلى البداية. هكذا تعمل الخرائط، واقتراح «أصدقاء أصدقائك»، وروابط صفحات الويب.",
    runnerLang: "py",
    runnerStarter: `city = {
    "Home": ["Mosque", "Park"],
    "Mosque": ["Home", "Market"],
    "Park": ["Home", "School"],
    "Market": ["Mosque", "School"],
    "School": ["Park", "Market", "Library"],
    "Library": ["School"],
}
start, goal = "Home", "Library"
came_from = {start: None}
queue = [start]
while queue:
    place = queue.pop(0)
    if place == goal:
        break
    for nb in city[place]:
        if nb not in came_from:
            came_from[nb] = place
            queue.append(nb)

path = []
step = goal
while step is not None:
    path.append(step)
    step = came_from[step]
path.reverse()
print(" -> ".join(path))
print("roads:", len(path) - 1)
# جرّب: أضف طريقاً من "Home" إلى "School" (في القائمتين) وشغّل من جديد
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "py",
      title: "طابور صغير",
      prompt: "رتّب الأسطر حتى يزور البحث بالعرض A ثم جيرانه، فيطبع A ثم B ثم C.",
      lines: [
        'graph = {"A": ["B", "C"], "B": [], "C": []}',
        'queue = ["A"]',
        "while queue:",
        "    node = queue.pop(0)",
        "    print(node)",
        "    queue.extend(graph[node])",
      ],
      expected: "A\nB\nC",
    },
    {
      kind: "fill",
      title: "طابور أم مكدّس؟",
      prompt: "نريد البحث بالعرض: الحلقة الأولى كلها قبل الثانية، فيُطبع A B C D. ماذا نكتب؟",
      template: `let graph = { A: ["B", "C"], B: ["D"], C: [], D: [] };
let queue = ["A"];
let seen = { A: true };
while (queue.length > 0) {
  let node = queue.___;
  console.log(node);
  for (const nb of graph[node]) {
    if (!seen[nb]) {
      seen[nb] = true;
      queue.push(nb);
    }
  }
}`,
      options: ["shift()", "pop()", "length"],
      expected: "A\nB\nC\nD",
    },
    {
      kind: "fix",
      lang: "py",
      title: "مسافة خاطئة",
      prompt: "الطريق المباشر من A إلى D طوله 1، لكن البرنامج يطبع 3. أصلحه حتى يطبع 1.",
      code: `graph = {"A": ["B", "D"], "B": ["C"], "C": ["D"], "D": []}
dist = {"A": 0}
queue = ["A"]
while queue:
    node = queue.pop(0)
    for nb in graph[node]:
        dist[nb] = dist[node] + 1
        queue.append(nb)
print(dist["D"])`,
      expected: "1",
      hint: "D وُصل أولاً من A بمسافة 1، ثم جاء من C فكُتب فوقه 3. أول وصول هو الأقصر: لا تكتب مسافة مكان موجود في dist.",
      solution: `graph = {"A": ["B", "D"], "B": ["C"], "C": ["D"], "D": []}
dist = {"A": 0}
queue = ["A"]
while queue:
    node = queue.pop(0)
    for nb in graph[node]:
        if nb not in dist:
            dist[nb] = dist[node] + 1
            queue.append(nb)
print(dist["D"])`,
    },
    {
      kind: "write",
      title: "كم مكاناً نصل؟",
      prompt: "ابدأ من A وابحث بالعرض أو بالعمق، ثم اطبع عدد الأماكن التي وصلتها، ومنها A نفسه. انتبه: في الرسم دائرة، و D لا يصله طريق.",
      starter: `let graph = { A: ["B"], B: ["C"], C: ["A"], D: ["A"] };
// اكتب البحث هنا واطبع العدد
`,
      expected: "3",
      hint: "طابور يبدأ بـ A، و seen = { A: true }، وعدّاد يزيد كلما أخرجت مكاناً من الطابور.",
      solution: `let graph = { A: ["B"], B: ["C"], C: ["A"], D: ["A"] };
let queue = ["A"];
let seen = { A: true };
let count = 0;
while (queue.length > 0) {
  let node = queue.shift();
  count++;
  for (const nb of graph[node]) {
    if (!seen[nb]) {
      seen[nb] = true;
      queue.push(nb);
    }
  }
}
console.log(count);`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع؟",
      code: 'let g = { A: ["B", "C"], B: ["A"], C: ["A"] };\nconsole.log(g.A.length);',
      options: ["2", "3", "1"],
      answer: 0,
      why: "g.A هي قائمة جيران A: طريقان، إلى B و C. طول القائمة هو عدد الطرق الخارجة من المكان.",
    },
    {
      question: "ثلاثة أماكن على خط: A - B - C، والطرق في الاتجاهين. ماذا يُطبع؟",
      code: 'let g = { A: ["B"], B: ["A", "C"], C: ["B"] };\nlet total = 0;\nfor (const k of ["A", "B", "C"]) {\n  total = total + g[k].length;\n}\nconsole.log(total);',
      options: ["4", "2", "3"],
      answer: 0,
      why: "في الرسم ذي الاتجاهين يُكتب كل طريق مرتين: في قائمة طرفيه. طريقان × 2 = 4.",
    },
    {
      question: "بحث بالعرض من A في الرسم { A: [B, C], B: [D], C: [E] }. بأي ترتيب تخرج الأماكن من الطابور؟",
      options: ["A B C D E", "A B D C E", "A C E B D"],
      answer: 0,
      why: "الطابور يخدم الأقدم أولاً: الحلقة الأولى B و C تخرج كلها قبل الحلقة الثانية D و E. ينتشر البحث حلقات حول البداية.",
    },
    {
      question: "الرسم نفسه { A: [B, C], B: [D], C: [E] } لكن بمكدّس (pop). بأي ترتيب تخرج الأماكن؟",
      options: ["A C E B D", "A B C D E", "A B D C E"],
      answer: 0,
      why: "المكدّس يخدم الأحدث أولاً. بعد A يكون فيه [B, C]، فيخرج C ويدخل E فوقه، فيخرج E. يغوص في فرع إلى آخره قبل أن يعود إلى B ثم D.",
    },
    {
      question: "حذفنا seen من البحث، والرسم فيه دائرة { A: [B], B: [A] }. ماذا يحدث؟",
      code: 'let g = { A: ["B"], B: ["A"] };\nlet queue = ["A"];\nwhile (queue.length > 0) {\n  let node = queue.shift();\n  console.log(node);\n  for (const nb of g[node]) queue.push(nb);\n}',
      options: ["يطبع A B A B ... ولا يتوقف", "يطبع A B ويتوقف", "خطأ قبل التشغيل"],
      answer: 0,
      why: "كل مكان يضيف جاره للطابور، والجار يعيد الأول، فلا يفرغ الطابور أبداً. على عكس الشجرة، الرسم قد يدور، لذلك نحتاج ذاكرة لما زرناه.",
    },
  ],
  next: "sorting",
};
