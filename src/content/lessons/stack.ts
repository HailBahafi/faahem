import type { Lesson } from "@/lib/types";

export const stack: Lesson = {
  slug: "stack",
  stage: 3,
  number: "3.3",
  title: "المكدّس",
  subtitle: "كومة صحون: تضع فوقها وتأخذ من فوقها، فآخر الداخلين أول الخارجين",
  minutes: 15,
  problem: {
    title: "تراجع، ثم تراجع",
    body: "محرّر نصوص صغير. اكتب بعض الكلمات، ثم اضغط تراجع مرة بعد مرة. أي خطوة تُلغى أولاً؟ راقب كومة الصحون على اليمين.",
    demo: "stack",
  },
  scene: {
    trace: true,
    steps: [],
    code: {
      js: `let actions = [];
actions.push("type H");
actions.push("type i");
actions.push("bold");
let undo = actions[actions.length - 1];
actions.pop();
console.log("undo:", undo);
console.log("top:", actions[actions.length - 1]);`,
      py: `actions = []
actions.append("type H")
actions.append("type i")
actions.append("bold")
undo = actions[-1]
actions.pop()
print("undo:", undo)
print("top:", actions[-1])`,
      go: `actions := []string{}
actions = append(actions, "type H")
actions = append(actions, "type i")
actions = append(actions, "bold")
undo := actions[len(actions)-1]
actions = actions[:len(actions)-1]
fmt.Println("undo:", undo)
fmt.Println("top:", actions[len(actions)-1])`,
    },
    notes: {
      js: "لا نوع اسمه Stack في JavaScript: المصفوفة نفسها مكدّس إذا اكتفيت بـ push وpop، لأنهما يعملان في آخر الصف ولا يزحزحان شيئاً.",
      py: "القائمة list مكدّس جاهز: append تضع فوق، وpop()‎ بلا رقم تأخذ من فوق، وactions[-1] تنظر إلى القمة دون أن تأخذها.",
      go: "لا pop في Go: ننظر إلى القمة بـ actions[len(actions)-1] ثم نقصّ الشريحة بـ actions[:len(actions)-1]. الخانات تبقى في مكانها، والطول وحده يصغر.",
    },
  },
  playground: {
    kind: "trace",
    intro: "فاحص أقواس بمكدّس: كل قوس يُفتح يوضع فوق الكومة، وكل قوس يُغلق يأخذ الصحن الذي فوقها. شغّل وراقب stack وهو يكبر ويصغر مع كل حرف.",
    starter: `function balanced(text) {
  let stack = [];
  for (let i = 0; i < text.length; i++) {
    let ch = text[i];
    if (ch === "(") {
      stack.push(ch);
    } else if (ch === ")") {
      if (stack.length === 0) {
        return false;
      }
      stack.pop();
    }
  }
  return stack.length === 0;
}
console.log(balanced("(a(b))"));`,
    challenges: [
      "غيّر النص إلى \"((a)\". ما الذي سيبقى في stack بعد آخر حرف؟ وماذا ستُرجع الدالة؟ توقّع قبل أن تضغط.",
      "جرّب \"a)(\". عند أي حرف تتوقف الدالة، ولماذا لم يكن هناك صحن لتأخذه؟",
      "في أعلى لحظة، كم صحناً في stack للنص \"((()))\"؟ وكم إطاراً لـ balanced على مكدّس الاستدعاءات؟",
      "أضف console.log(stack) قبل return الأخيرة، وجرّب نصاً بلا أقواس أبداً. ماذا ترى؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `let s = [];
s.push(1);
s.push(2);
s.push(3);
s.pop();
s.push(4);
console.log(s.pop(), s.pop());`,
      options: ["4 2", "1 2", "4 3"],
      answer: 0,
      why: "pop تأخذ دائماً من القمة. الكومة صارت 1 و 2 و 3، ثم أُخذت 3، ثم وُضعت 4 فوق 2. أول pop تعطي 4، والثانية تعطي ما تحتها: 2. الصحن الأول (1) لا يُلمس.",
    },
    {
      question: "ماذا يطبع هذا البرنامج بلغة Python؟",
      lang: "py",
      code: `stack = []
for ch in ["a", "b", "c"]:
    stack.append(ch)
out = ""
while len(stack) > 0:
    out = out + stack.pop()
print(out)`,
      options: ["cba", "abc", "c"],
      answer: 0,
      why: "الحروف دخلت a ثم b ثم c، فصارت c في القمة. الخروج من القمة يعكس الترتيب: c ثم b ثم a. هذه أبسط طريقة لقلب أي شيء: ضعه في مكدّس ثم أفرغه.",
    },
    {
      question: "بأي ترتيب تُطبع الأسطر؟",
      code: `function inner() {
  console.log("inner");
}
function outer() {
  console.log("outer start");
  inner();
  console.log("outer end");
}
outer();`,
      options: ["outer start، inner، outer end", "outer start، outer end، inner", "inner، outer start، outer end"],
      answer: 0,
      why: "مكدّس الاستدعاءات مكدّس حقيقي: إطار inner يوضع فوق إطار outer، فينتظر outer تحته. لا يكمل outer سطره الأخير حتى يُزال inner من القمة.",
    },
  ],
  code: {
    intro: "المكدّس فكرة لا لغة: أي صفّ تضع في آخره وتأخذ من آخره فقط. في JavaScript وPython هو مصفوفة مع push/append وpop، وفي Go شريحة تقصّها من آخرها. هنا فاحص أقواس كامل يعرف ثلاثة أنواع: كل قوس يُغلق يجب أن يطابق الصحن الذي في القمة.",
    runnerStarter: `const pairs = { ")": "(", "]": "[", "}": "{" };

function balanced(text) {
  const stack = [];
  for (const ch of text) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else if (pairs[ch]) {
      const top = stack.pop();
      if (top !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}

console.log(balanced("{ a: [1, (2)] }"));
console.log(balanced("( [ ) ]"));
console.log(balanced("((("));
// جرّب: اطبع stack داخل الحلقة لترى الكومة مع كل حرف
`,
  },
  exercises: [
    {
      kind: "order",
      title: "زر الرجوع",
      prompt: "رتّب الأسطر: المتصفح زار ثلاث صفحات، ثم ضغطت رجوع مرة. يجب أن يطبع الصفحة التي رجعت إليها: news.",
      lines: [
        "let pages = [];",
        'pages.push("home");',
        'pages.push("news");',
        'pages.push("sports");',
        "pages.pop();",
        "console.log(pages[pages.length - 1]);",
      ],
      expected: "news",
    },
    {
      kind: "fill",
      title: "من القمة",
      lang: "py",
      prompt: "أي تعبير يأخذ الصحن الذي فوق الكومة، أي آخر ما وُضع؟",
      template: 'stack = []\nstack.append("x")\nstack.append("y")\nstack.append("z")\nprint(___)',
      options: ["stack.pop()", "stack.pop(0)", "stack[0]"],
      expected: "z",
    },
    {
      kind: "fix",
      title: "تراجع خاطئ",
      prompt: "زر التراجع يلغي أقدم خطوة بدل أحدثها. أصلحه حتى يطبع bold ثم يطبع عدد الخطوات الباقية 2.",
      code: 'let actions = ["type H", "type i", "bold"];\nlet undone = actions.shift();\nconsole.log(undone);\nconsole.log(actions.length);',
      expected: "bold\n2",
      hint: "shift تأخذ من أول الصف، أي من قاع الكومة. أي دالة تأخذ من آخره؟",
      solution: 'let actions = ["type H", "type i", "bold"];\nlet undone = actions.pop();\nconsole.log(undone);\nconsole.log(actions.length);',
    },
    {
      kind: "write",
      title: "اقلب الكلمة",
      prompt: "اكتب دالة reverse(word) تضع حروف الكلمة في مكدّس واحداً واحداً، ثم تُفرغه في نص جديد وترجعه. اطبع reverse(\"stack\") ثم reverse(\"abc\").",
      starter: "// ضع كل حرف بـ push، ثم خذها بـ pop حتى يفرغ المكدّس\n",
      expected: "kcats\ncba",
      hint: "حلقة على الحروف فيها stack.push(word[i])، ثم while (stack.length > 0) { out = out + stack.pop(); }",
      solution: `function reverse(word) {
  let stack = [];
  for (let i = 0; i < word.length; i++) {
    stack.push(word[i]);
  }
  let out = "";
  while (stack.length > 0) {
    out = out + stack.pop();
  }
  return out;
}
console.log(reverse("stack"));
console.log(reverse("abc"));`,
    },
  ],
  quiz: [
    {
      question: "ماذا يُطبع؟",
      code: 'let s = ["a", "b"];\ns.push("c");\nconsole.log(s[s.length - 1]);',
      options: ["c", "a", "b"],
      answer: 0,
      why: "القمة هي آخر خانة في الصف، وآخر ما وُضع هو c. النظر إلى القمة لا يأخذها من الكومة.",
    },
    {
      question: "كم صحناً في الكومة في النهاية؟",
      code: "let s = [];\ns.push(1);\ns.push(2);\ns.pop();\ns.push(3);\ns.push(4);\ns.pop();\nconsole.log(s.length);",
      options: ["2", "4", "1"],
      answer: 0,
      why: "عُدّ الصحون: 1، ثم 2، ثم 1 بعد pop، ثم 2، ثم 3، ثم 2 بعد pop الأخيرة. في الكومة 1 و 3.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'let s = [];\ns.push("x");\ns.pop();\nconsole.log(s.pop());',
      options: ["undefined", "x", "خطأ يوقف البرنامج"],
      answer: 0,
      why: "الكومة فارغة بعد أول pop. في JavaScript، pop على مصفوفة فارغة لا توقف البرنامج: ترجع undefined بهدوء. لذلك يفحص فاحص الأقواس الطول قبل أن يأخذ.",
    },
    {
      question: "لماذا push وpop سريعان مهما كبر المكدّس؟",
      options: ["لأنهما يعملان في آخر الصف فلا يتحرك أي عنصر آخر", "لأن المكدّس مرتّب دائماً", "لأن المكدّس يحفظ نسخة من كل عنصر"],
      answer: 0,
      why: "تذكّر المصفوفة في الذاكرة: الإضافة والحذف في أولها يزحزحان كل الخانات، أما في آخرها فلا شيء يتحرك. المكدّس يعمل في الآخر فقط، فكل عملية خطوة واحدة.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'function a() {\n  b();\n  console.log("a");\n}\nfunction b() {\n  c();\n  console.log("b");\n}\nfunction c() {\n  console.log("c");\n}\na();',
      options: ["c ثم b ثم a", "a ثم b ثم c", "a ثم c ثم b"],
      answer: 0,
      why: "الإطارات تُكدَّس: a ثم b فوقه ثم c في القمة. لا يطبع أحد قبل أن يُزال ما فوقه، فالقمة c تطبع أولاً، ثم b، ثم a في القاع. آخر من دخل أول من خرج.",
    },
  ],
  next: "queue",
};
