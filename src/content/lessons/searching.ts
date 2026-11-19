import type { Lesson } from "@/lib/types";

export const searching: Lesson = {
  slug: "searching",
  stage: 3,
  number: "3.9",
  title: "البحث",
  subtitle: "واحداً واحداً، أو نصف الباقي في كل خطوة",
  minutes: 16,
  problem: {
    title: "أكبر أم أصغر؟",
    body: "الحاسوب اختار رقماً من 1 إلى 100، ولا يقول لك إلا: أكبر أو أصغر. كم تخميناً تحتاج؟ ثم ابحث عن كتاب في رف مبعثر، وفي رف مرتب.",
    demo: "searching",
  },
  scene: {
    code: {
      js: `let nums = [2, 5, 8, 12, 16, 23, 38];
let low = 0, high = nums.length - 1;
let mid = Math.floor((low + high) / 2);
while (nums[mid] !== 23) {
  if (nums[mid] < 23) low = mid + 1;
  else high = mid - 1;
  mid = Math.floor((low + high) / 2);
}
console.log(mid);`,
      py: `nums = [2, 5, 8, 12, 16, 23, 38]
low, high = 0, len(nums) - 1
mid = (low + high) // 2
while nums[mid] != 23:
    if nums[mid] < 23: low = mid + 1
    else: high = mid - 1
    mid = (low + high) // 2

print(mid)`,
      go: `nums := []int{2, 5, 8, 12, 16, 23, 38}
low, high := 0, len(nums)-1
mid := (low + high) / 2
for nums[mid] != 23 {
	if nums[mid] < 23 { low = mid + 1 }
	if nums[mid] > 23 { high = mid - 1 }
	mid = (low + high) / 2
}
fmt.Println(mid)`,
    },
    notes: {
      js: "القسمة في JavaScript تعطي كسوراً (3 / 2 = 1.5)، فنستعمل Math.floor لنحصل على رقم خانة صحيح.",
      py: "العلامة // قسمة صحيحة تحذف الكسر مباشرة، و low, high = 0, 6 تملأ درجين في سطر واحد.",
      go: "قسمة رقمين صحيحين في Go صحيحة دائماً. و Go تفرض الأقواس { } حول كل if، فكتبنا else شرطاً ثانياً: mid لم يتغير بينهما، فالنتيجة واحدة.",
    },
    trace: "py",
    steps: [],
  },
  playground: {
    kind: "trace",
    intro: "البحث الخطي: امشِ على الصف خانة خانة حتى تجد ما تبحث عنه. لا يحتاج صفاً مرتباً. عدّل الهدف وراقب عدّاد الفحوص.",
    starter: `let books = [42, 7, 19, 88, 3, 56, 71, 25];
let target = 56;
let checks = 0;
let found = -1;
for (let i = 0; i < books.length; i++) {
  checks++;
  if (books[i] === target) {
    found = i;
    break;
  }
}
console.log("found at", found, "after", checks, "checks");`,
    challenges: [
      "غيّر target إلى 42. كم فحصاً يحتاج الآن؟",
      "غيّر target إلى 99، وهو غير موجود. توقّع عدد الفحوص وقيمة found قبل أن تضغط.",
      "احذف سطر break، وابحث عن 56. هل تغيّر found؟ وهل تغيّر checks؟",
      "أضف أربعة كتب جديدة إلى الصف، وابحث عن رقم غير موجود. بكم زادت الفحوص؟",
    ],
  },
  predict: [
    {
      question: "بحث ثنائي على صف غير مرتب، والرقم 23 موجود فيه. ماذا يُطبع؟",
      lang: "py",
      code: `nums = [8, 2, 23, 5, 16, 12, 38]
low = 0
high = len(nums) - 1
found = -1
while low <= high:
    mid = (low + high) // 2
    if nums[mid] == 23:
        found = mid
        break
    elif nums[mid] < 23:
        low = mid + 1
    else:
        high = mid - 1
print(found)`,
      options: ["-1", "2", "خطأ IndexError"],
      answer: 0,
      why: "رأى 5 في المنتصف فقرّر أن 23 في النصف الأيمن، ورمى النصف الأيسر كله، و 23 كانت هناك. البحث الثنائي يثق بأن الصف مرتب؛ إن لم يكن، فقراراته خاطئة.",
    },
    {
      question: "كم مرة نستطيع قسمة 1000 عنصر إلى نصفين حتى لا يبقى شيء؟",
      code: `let size = 1000;
let checks = 0;
while (size >= 1) {
  size = Math.floor(size / 2);
  checks++;
}
console.log(checks);`,
      options: ["10", "500", "100"],
      answer: 0,
      why: "كل فحص في البحث الثنائي يرمي نصف الباقي: 1000 ثم 500 ثم 250 ... ثم 1. عشر خطوات فقط. والبحث الخطي قد يحتاج 1000.",
    },
    {
      question: "الرقم 5 موجود مرتين. ماذا يُطبع؟",
      code: `let a = [5, 3, 5];
let found = -1;
for (let i = 0; i < a.length; i++) {
  if (a[i] === 5) {
    found = i;
    break;
  }
}
console.log(found);`,
      options: ["0", "2", "0 2"],
      answer: 0,
      why: "البحث الخطي يقف عند أول تطابق: break يخرج من الحلقة فوراً، فلا يرى الخامسة الثانية أصلاً.",
    },
  ],
  code: {
    intro: "صف من مليون رقم زوجي مرتب، وهدف في آخره. البحث الخطي يمشي عليه كله، والثنائي يقصّ نصفه في كل خطوة. شغّل وقارن عدد الفحوص.",
    runnerLang: "py",
    runnerStarter: `nums = list(range(0, 2000000, 2))
target = 1999998

checks = 0
for x in nums:
    checks += 1
    if x == target:
        break
print("linear:", checks, "checks")

low, high = 0, len(nums) - 1
checks = 0
while low <= high:
    mid = (low + high) // 2
    checks += 1
    if nums[mid] == target:
        break
    elif nums[mid] < target:
        low = mid + 1
    else:
        high = mid - 1
print("binary:", checks, "checks")
# جرّب: غيّر target إلى 0، ثم إلى 1001 (رقم فردي غير موجود)
`,
  },
  exercises: [
    {
      kind: "order",
      title: "أين عمر؟",
      prompt: "رتّب الأسطر حتى يبحث البرنامج عن Omar خانة خانة، ويطبع رقم خانته 2.",
      lang: "py",
      lines: [
        'names = ["Ali", "Sara", "Omar", "Huda"]',
        "for i in range(len(names)):",
        '    if names[i] == "Omar":',
        "        print(i)",
        "        break",
      ],
      expected: "2",
    },
    {
      kind: "fill",
      title: "انقل الحدّ الأدنى",
      prompt: "الرقم في المنتصف أصغر من الهدف، فالهدف في النصف الأيمن. إلى أين ينتقل low حتى يطبع البرنامج 5؟",
      template: `let nums = [3, 8, 15, 21, 30, 42, 57];
let target = 42;
let low = 0;
let high = nums.length - 1;
let found = -1;
while (low <= high) {
  let mid = Math.floor((low + high) / 2);
  if (nums[mid] === target) { found = mid; break; }
  if (nums[mid] < target) low = ___;
  else high = mid - 1;
}
console.log(found);`,
      options: ["mid + 1", "high", "target"],
      expected: "5",
    },
    {
      kind: "fix",
      title: "الرف المبعثر",
      prompt: "الرقم 9 موجود في الصف، لكن البرنامج يطبع False. لا تغيّر خطوات البحث: أضف سطراً واحداً قبلها.",
      lang: "py",
      code: `nums = [30, 4, 18, 9, 25, 12]
target = 9
low = 0
high = len(nums) - 1
found = False
while low <= high:
    mid = (low + high) // 2
    if nums[mid] == target:
        found = True
        break
    elif nums[mid] < target:
        low = mid + 1
    else:
        high = mid - 1
print(found)`,
      expected: "True",
      hint: "البحث الثنائي يحتاج صفاً مرتباً. في بايثون: nums.sort()",
      solution: `nums = [30, 4, 18, 9, 25, 12]
nums.sort()
target = 9
low = 0
high = len(nums) - 1
found = False
while low <= high:
    mid = (low + high) // 2
    if nums[mid] == target:
        found = True
        break
    elif nums[mid] < target:
        low = mid + 1
    else:
        high = mid - 1
print(found)`,
    },
    {
      kind: "write",
      title: "الحاسوب يخمّن",
      prompt: "الرقم السري 73 بين 1 و 100. اكتب لاعباً يخمّن دائماً منتصف المدى الباقي (Math.floor((low + high) / 2))، ويطبع كل تخمين، حتى يصيب: 50 ثم 75 ثم 62 ثم 68 ثم 71 ثم 73.",
      starter: "let secret = 73;\n// اكتب الكود هنا\n",
      expected: "50\n75\n62\n68\n71\n73",
      hint: "low = 1 و high = 100. في حلقة: احسب guess واطبعه. إن ساوى secret فاخرج بـ break، وإن كان أصغر فـ low = guess + 1، وإلا high = guess - 1.",
      solution: `let secret = 73;
let low = 1;
let high = 100;
while (low <= high) {
  let guess = Math.floor((low + high) / 2);
  console.log(guess);
  if (guess === secret) break;
  if (guess < secret) low = guess + 1;
  else high = guess - 1;
}`,
    },
  ],
  quiz: [
    {
      question: "بحث خطي عن رقم غير موجود في صف من 50 رقماً. كم فحصاً يحدث؟",
      code: "let a = [];\nfor (let k = 0; k < 50; k++) a.push(k * 2);\nlet checks = 0;\nfor (let i = 0; i < a.length; i++) {\n  checks++;\n  if (a[i] === 7) break;\n}\nconsole.log(checks);",
      options: ["50", "1", "25"],
      answer: 0,
      why: "البحث الخطي لا يعرف أن الرقم غير موجود إلا بعد أن يفحص كل خانة. أسوأ حالة له أن ينظر إلى كل شيء.",
    },
    {
      question: "بحث ثنائي عن 13. كم فحصاً يحدث؟",
      code: "let nums = [1, 3, 5, 7, 9, 11, 13, 15];\nlet low = 0, high = nums.length - 1, checks = 0;\nwhile (low <= high) {\n  let mid = Math.floor((low + high) / 2);\n  checks++;\n  if (nums[mid] === 13) break;\n  if (nums[mid] < 13) low = mid + 1;\n  else high = mid - 1;\n}\nconsole.log(checks);",
      options: ["3", "7", "1"],
      answer: 0,
      why: "المنتصف 7 أصغر، فيُرمى النصف الأيسر. المنتصف التالي 11 أصغر، فيُرمى ما قبله. الثالث 13: وجدناه. البحث الخطي كان سيحتاج 7.",
    },
    {
      question: "كم قسمة إلى نصفين تحتاجها مليون عنصر حتى يبقى عنصر واحد؟",
      code: "let n = 1000000;\nlet steps = 0;\nwhile (n > 1) {\n  n = Math.ceil(n / 2);\n  steps++;\n}\nconsole.log(steps);",
      options: ["20", "1000", "500000"],
      answer: 0,
      why: "كل خطوة ترمي نصف الباقي، فمليون عنصر يصير عنصراً واحداً بعد 20 خطوة فقط. ضاعف الصف إلى مليونين، ولن تزيد إلا خطوة واحدة.",
    },
    {
      question: "لعبة أكبر أم أصغر بين 1 و 100. التخمين الأول 50، والجواب: أصغر. ما التخمين الثاني؟",
      code: "let low = 1;\nlet high = 100;\nlet guess = Math.floor((low + high) / 2);\nhigh = guess - 1;\nguess = Math.floor((low + high) / 2);\nconsole.log(guess);",
      options: ["25", "49", "40"],
      answer: 0,
      why: "أصغر من 50 يعني أن 50 وكل ما فوقها خرج من المدى، فبقي 1 إلى 49. أفضل تخمين هو منتصف الباقي: 25.",
    },
    {
      question: "بحث خطي بلا break. ماذا يُطبع؟",
      code: "let a = [7, 2, 7, 4];\nlet pos = -1;\nfor (let i = 0; i < a.length; i++) {\n  if (a[i] === 7) pos = i;\n}\nconsole.log(pos);",
      options: ["2", "0", "-1"],
      answer: 0,
      why: "بلا break تمشي الحلقة إلى النهاية، وكل تطابق يكتب فوق pos. آخر 7 في الخانة 2، فهي ما بقي في الدرج.",
    },
  ],
  next: "big-o",
};
