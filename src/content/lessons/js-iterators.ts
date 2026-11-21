import type { Cell, Lesson } from "@/lib/types";

const c = (name: string, value: string): Cell => ({ name, value, type: "none" });
const num = (name: string, value: number): Cell => ({ name, value: String(value), type: "number" });
const state = (where: string, n: number, result: string): Cell[] => [c("it", `generator · ${where}`), num("n (inside it)", n), c("result", result)];

export const jsIterators: Lesson = {
  slug: "js-iterators",
  stage: 0,
  number: "2.9",
  title: "المكرّرات والمولّدات",
  subtitle: "دالة تتوقف في منتصفها وتكمل من حيث توقفت",
  minutes: 24,
  problem: {
    title: "دالة تتذكّر أين توقفت",
    body: "دالتان تعدّان تنازلياً من 3. اضغط كل واحدة عدة مرات: الدالة العادية تبدأ من أول سطر في كل نداء، والمولّد يكمل من السطر الذي توقف عنده.",
    demo: "jsIterators",
  },
  singleLanguage: true,
  scene: {
    code: {
      js: `function* countdown(n) {
  while (n > 0) {
    yield n;
    n = n - 1;
  }
}
const it = countdown(2);
console.log(it.next().value, it.next().value);
console.log(it.next().done, [...countdown(3)].join());`,
    },
    steps: [
      {
        line: null,
        say: "for-of لا تعرف المصفوفات ولا Map: تعرف بروتوكولاً واحداً. تطلب من الشيء مكرّراً، ثم تنادي next() مرة بعد مرة، وكل نداء يرجع { value, done }.",
        memory: [],
      },
      {
        line: 7,
        say: "النجمة في function* تجعلها مولّداً. نداؤها لا ينفّذ سطراً واحداً من جسمها: يبني إطاراً فيه n = 2، ويجمّده عند البداية، ويرجع كائن مكرّر.",
        memory: state("paused before line 2", 2, "—"),
        changed: ["it"],
      },
      {
        line: 2,
        say: "أول next(): يُستأنف الإطار. 2 > 0 صحيح، فيدخل الحلقة.",
        memory: state("running", 2, "—"),
        read: ["n (inside it)"],
      },
      {
        line: 3,
        say: "yield n: يسلّم 2 إلى من نادى next()، ويتجمّد الإطار هنا بكل متغيراته. next() ترجع { value: 2, done: false }.",
        memory: state("paused at line 3", 2, "{ value: 2, done: false }"),
        changed: ["result"],
      },
      {
        line: 4,
        say: "ثاني next(): يكمل الإطار من بعد yield بالضبط، لا من أول الدالة. n ما زال في درجه: 2، فيصير 1.",
        memory: state("running", 1, "{ value: 2, done: false }"),
        changed: ["n (inside it)"],
      },
      {
        line: 3,
        say: "يعود إلى الشرط: 1 > 0، ثم yield 1 فيتجمّد من جديد. ترجع next() القيمة 1.",
        memory: state("paused at line 3", 1, "{ value: 1, done: false }"),
        changed: ["result"],
      },
      {
        line: 8,
        say: "السطر طبع القيمتين اللتين سُلّمتا: 2 ثم 1. كل next() نقلت الإطار خطوة واحدة.",
        memory: state("paused at line 3", 1, "{ value: 1, done: false }"),
        output: ["2 1"],
      },
      {
        line: 5,
        say: "ثالث next(): n يصير 0، والشرط 0 > 0 خطأ، فتنتهي الحلقة ثم الدالة. الإطار يُرمى، و next() ترجع { value: undefined, done: true }.",
        memory: state("closed", 0, "{ value: undefined, done: true }"),
        changed: ["it", "result"],
      },
      {
        line: 9,
        say: "النشر [...] يتبع البروتوكول نفسه مع مولّد جديد: next() حتى done، ويضع كل value في مصفوفة: 3,2,1.",
        memory: [...state("closed", 0, "{ value: undefined, done: true }"), c("[...countdown(3)]", "[3, 2, 1]")],
        output: ["2 1", "true 3,2,1"],
      },
      {
        line: null,
        say: "الصورة: المولّد إطار دالة لا يُحذف بعد yield، بل ينتظر. لهذا يُنتج القيم واحدة واحدة عند الطلب، حتى لو كانت لا نهائية.",
        memory: [...state("closed", 0, "{ value: undefined, done: true }"), c("[...countdown(3)]", "[3, 2, 1]")],
      },
    ],
    notes: {
      js: "أي كائن له دالة [Symbol.iterator]() ترجع شيئاً فيه next() هو قابل للتكرار (iterable): المصفوفات والنصوص و Map و Set والمولّدات. لذلك تعمل معها كلها for-of و [...x] و Array.from.",
    },
  },
  playground: {
    kind: "trace",
    intro: "مكرّر مكتوب بيدك: كائن فيه دالة next() تتذكر موضعها في متغير مغلق (closure). وحلقة while تحته تفعل حرفياً ما تفعله for-of خلف الستار.",
    starter: `function makeRange(from, to) {
  let current = from;
  return {
    next: function () {
      if (current > to) {
        return { value: undefined, done: true };
      }
      const value = current;
      current = current + 1;
      return { value: value, done: false };
    },
  };
}
const it = makeRange(1, 3);
let step = it.next();
while (!step.done) {
  console.log(step.value);
  step = it.next();
}
console.log(it.next().done);`,
    challenges: [
      "قبل التشغيل: كم مرة ستُنادى next() كلها؟",
      "راقب current: في أي إطار يعيش؟ ولماذا لا يعود إلى 1 مع كل نداء؟",
      "أنشئ مكرّراً ثانياً makeRange(10, 11) وحرّك الاثنين بالتناوب. هل يتداخلان؟",
      "غيّر makeRange لتقفز اثنين اثنين، وتوقّع ما يُطبع قبل الضغط.",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `function* greet() {
  console.log("start");
  yield 1;
}
const it = greet();
console.log("made");`,
      options: ["made فقط", "start ثم made", "made ثم start"],
      answer: 0,
      why: "نداء المولّد يبني الإطار ويجمّده قبل أول سطر. لا شيء من جسمه يعمل حتى يُنادى next(). هنا لم يُنادَ أبداً.",
      scene: {
        code: { js: "function* greet() {\n  console.log(\"start\");\n  yield 1;\n}\nconst it = greet();\nconsole.log(\"made\");" },
        steps: [
          { line: 5, say: "إطار جديد متجمّد عند البداية. السطر 2 لم يعمل.", memory: [c("it", "generator · paused before line 2")], changed: ["it"] },
          { line: 6, say: "يُطبع made. ولأن أحداً لم ينادِ next()، لن تظهر start أبداً.", memory: [c("it", "generator · paused before line 2")], output: ["made"] },
        ],
      },
    },
    {
      question: "ماذا يطبع؟",
      code: `function* nums() {
  yield 1;
  yield 2;
}
const it = nums();
console.log([...it].length, [...it].length);`,
      options: ["2 0", "2 2", "0 0"],
      answer: 0,
      why: "المكرّر يمشي في اتجاه واحد. النشر الأول استهلكه حتى done، والثاني يجد إطاراً منتهياً. لتكرار جديد نادِ nums() من جديد.",
      scene: {
        code: { js: "function* nums() {\n  yield 1;\n  yield 2;\n}\nconst it = nums();\nconsole.log([...it].length, [...it].length);" },
        steps: [
          { line: 5, say: "مكرّر واحد.", memory: [c("it", "generator · paused at start")] },
          { line: 6, say: "النشر الأول: 1، 2، ثم done. طوله 2، والمكرّر أُغلق.", memory: [c("it", "generator · closed"), c("first spread", "[1, 2]")], changed: ["it"] },
          { line: 6, say: "النشر الثاني: أول next() ترجع done: true. مصفوفة فارغة.", memory: [c("it", "generator · closed"), c("first spread", "[1, 2]"), c("second spread", "[]")], output: ["2 0"] },
        ],
      },
    },
    {
      question: "المولّد فيه while (true). ماذا يحدث؟",
      code: `function* ids() {
  let id = 1;
  while (true) {
    yield id;
    id++;
  }
}
const gen = ids();
gen.next();
gen.next();
console.log(gen.next().value);`,
      options: ["يطبع 3", "حلقة لا نهائية يتجمّد فيها البرنامج", "يطبع 1"],
      answer: 0,
      why: "الحلقة لا تدور وحدها: كل next() تدفعها دورة واحدة حتى yield التالية ثم تتجمّد. ثلاث نداءات = ثلاث دورات.",
      scene: {
        code: { js: "function* ids() {\n  let id = 1;\n  while (true) {\n    yield id;\n    id++;\n  }\n}\nconst gen = ids();\ngen.next();\ngen.next();\nconsole.log(gen.next().value);" },
        steps: [
          { line: 9, say: "أول next(): id = 1، و yield 1، ثم توقف.", memory: [num("id", 1)] },
          { line: 10, say: "الثاني: id++ ثم yield 2، ثم توقف.", memory: [num("id", 2)], changed: ["id"] },
          { line: 11, say: "الثالث: yield 3. يُطبع 3، والإطار ينتظر بهدوء.", memory: [num("id", 3)], changed: ["id"], output: ["3"] },
        ],
      },
    },
  ],
  code: {
    intro: "مولّدات في عمل حقيقي: صفحات بيانات تُجلب عند الطلب، و take لأخذ أول n من تيار لا ينتهي، وتقطيع مصفوفة إلى دفعات، وصنف قابل للتكرار بـ [Symbol.iterator]. كلها تعمل مع for-of والنشر.",
    runnerStarter: `function* naturals() {
  let n = 1;
  while (true) yield n++;
}

function* take(iterable, count) {
  if (count <= 0) return;
  for (const x of iterable) {
    yield x;
    if (--count === 0) return;
  }
}
console.log([...take(naturals(), 5)]);

function* chunks(items, size) {
  for (let i = 0; i < items.length; i += size) {
    yield items.slice(i, i + size);
  }
}
for (const batch of chunks(["a", "b", "c", "d", "e"], 2)) {
  console.log("send batch:", batch);
}

function* pages(total, perPage) {
  for (let page = 1; (page - 1) * perPage < total; page++) {
    console.log("  fetching page", page);
    yield { page, rows: Math.min(perPage, total - (page - 1) * perPage) };
  }
}
for (const p of pages(25, 10)) {
  console.log("got", p.rows, "rows");
  if (p.page === 2) break;
}

class Playlist {
  #songs = [];
  add(song) {
    this.#songs.push(song);
    return this;
  }
  *[Symbol.iterator]() {
    yield* this.#songs;
  }
}
const list = new Playlist().add("intro").add("theme");
console.log([...list], Array.from(list).length);
// try: remove the break. How many pages are fetched now?
`,
  },
  exercises: [
    {
      kind: "order",
      title: "مولّد الألوان",
      prompt: "رتّب الأسطر: مولّد يسلّم ثلاثة ألوان، ثم حلقة تطبعها. الناتج: red ثم green ثم blue",
      lines: ["function* colors() {", '  yield "red";', '  yield "green";', '  yield "blue";', "}", "for (const c of colors()) {", "  console.log(c);", "}"],
      expected: "red\ngreen\nblue",
    },
    {
      kind: "fill",
      title: "الأعداد الزوجية",
      prompt: "ما الذي ينقص بعد function ليطبع البرنامج: 0 2 4 6",
      template: `function___ evens(limit) {
  for (let i = 0; i <= limit; i += 2) {
    yield i;
  }
}
console.log([...evens(6)].join(" "));`,
      options: ["*", "", " =>"],
      expected: "0 2 4 6",
    },
    {
      kind: "fix",
      title: "مكرّر مستهلَك",
      prompt: "النشر الثاني يجد المكرّر منتهياً فيطبع \"2 \". اجعله يطبع: 2 ab",
      code: `function* letters() {
  yield "a";
  yield "b";
}
const it = letters();
const count = [...it].length;
console.log(count, [...it].join(""));`,
      expected: "2 ab",
      hint: "المكرّر يُستهلك مرة واحدة. نادِ letters() من جديد في النشر الثاني.",
      solution: `function* letters() {
  yield "a";
  yield "b";
}
const count = [...letters()].length;
console.log(count, [...letters()].join(""));`,
    },
    {
      kind: "write",
      title: "أول خمسة",
      prompt: "اكتب مولّداً لا نهائياً naturals() يسلّم 1، 2، 3، ... ومولّداً take(iterable, n) يسلّم أول n قيم ثم يتوقف. اطبع [...take(naturals(), 5)].join(\" \"): 1 2 3 4 5",
      starter: "// function* naturals() { ... }\n// function* take(iterable, n) { ... }\n",
      expected: "1 2 3 4 5",
      hint: "في take: let left = n; ثم for (const x of iterable) { if (left === 0) return; yield x; left--; }",
      solution: `function* naturals() {
  let n = 1;
  while (true) {
    yield n;
    n++;
  }
}
function* take(iterable, n) {
  let left = n;
  for (const x of iterable) {
    if (left === 0) return;
    yield x;
    left--;
  }
}
console.log([...take(naturals(), 5)].join(" "));`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع؟",
      code: "const it = [10, 20][Symbol.iterator]();\nit.next();\nconst r = it.next();\nconsole.log(r.value, r.done);",
      options: ["20 false", "20 true", "10 false"],
      answer: 0,
      why: "مكرّر المصفوفة يسلّم 10 ثم 20 بـ done: false. لا يعرف أنها الأخيرة حتى يُنادى مرة ثالثة فيرجع done: true.",
    },
    {
      question: "ماذا يطبع؟",
      code: "function* g() {\n  yield 1;\n  return 2;\n}\nconsole.log([...g()].length);",
      options: ["1", "2", "0"],
      answer: 0,
      why: "return تعطي { value: 2, done: true }، و for-of والنشر يتوقفان عند done: true دون أن يأخذا قيمتها. فقط 1 دخلت.",
    },
    {
      question: "ماذا يطبع؟",
      code: "function* g() {\n  const x = yield 1;\n  yield x * 10;\n}\nconst it = g();\nit.next();\nconsole.log(it.next(5).value);",
      options: ["50", "NaN", "10"],
      answer: 0,
      why: "الإطار تجمّد عند yield 1. next(5) تستأنفه وتجعل تعبير yield نفسه يساوي 5، فيصير x = 5، ثم yield 50.",
    },
    {
      question: "ماذا يحدث؟",
      code: "for (const x of { a: 1, b: 2 }) {\n  console.log(x);\n}",
      options: ["TypeError: object is not iterable", "يطبع a و b", "يطبع 1 و 2"],
      answer: 0,
      why: "الكائن العادي ليس له [Symbol.iterator]، فلا تجد for-of من تطلب منه next(). استعمل Object.entries(obj) أو Object.keys(obj).",
    },
    {
      question: "بأي ترتيب تظهر السطور؟",
      code: 'function* g() {\n  console.log("A");\n  yield;\n  console.log("B");\n}\nconst it = g();\nconsole.log("1");\nit.next();\nconsole.log("2");\nit.next();',
      options: ["1 A 2 B", "A B 1 2", "1 2 A B"],
      answer: 0,
      why: "لا شيء من g يعمل حتى next(). أول next() تشغّل حتى yield فتطبع A، والثانية تكمل من بعد yield فتطبع B.",
    },
  ],
  next: "js-regex",
};
