import type { Cell, Lesson } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });

const m1 = [s("name", "  sara ")];
const m3 = [...m1, s("clean", "sara")];
const m4 = [...m3, s("big", "SARA")];
const m5 = [...m4, s("first", "s")];
const m6 = [...m5, s("part", "ar")];

export const strings: Lesson = {
  slug: "strings",
  stage: 1,
  number: "1.11",
  title: "النصوص",
  subtitle: "لماذا لا يتغيّر الاسم بعد name.trim()؟",
  minutes: 15,
  problem: {
    title: "الاسم الذي لا يُنظَّف",
    body: "الموقع يقبل الدخول باسم sara فقط، لكن المستخدم كتب اسمه بمسافات وحروف كبيرة. نظّف الاسم بالأزرار، وراقب الدرج name. ثم شغّل خيار «احفظ الناتج» وأعد المحاولة.",
    demo: "strings",
  },
  scene: {
    code: {
      js: `let name = "  sara ";
name.toUpperCase();
let clean = name.trim();
let big = clean.toUpperCase();
let first = clean[0];
let part = clean.slice(1, 3);
console.log(name.length, clean.length, big, first, part);
console.log(\`Hi \${big}!\`);`,
      ts: `let name: string = "  sara ";
name.toUpperCase();
let clean: string = name.trim();
let big: string = clean.toUpperCase();
let first: string = clean[0];
let part: string = clean.slice(1, 3);
console.log(name.length, clean.length, big, first, part);
console.log(\`Hi \${big}!\`);`,
      py: `name = "  sara "
name.upper()
clean = name.strip()
big = clean.upper()
first = clean[0]
part = clean[1:3]
print(len(name), len(clean), big, first, part)
print(f"Hi {big}!")`,
      go: `name := "  sara "
strings.ToUpper(name)
clean := strings.TrimSpace(name)
big := strings.ToUpper(clean)
first := string(clean[0])
part := clean[1:3]
fmt.Println(len(name), len(clean), big, first, part)
fmt.Printf("Hi %s!\\n", big)`,
      dart: `String name = "  sara ";
name.toUpperCase();
String clean = name.trim();
String big = clean.toUpperCase();
String first = clean[0];
String part = clean.substring(1, 3);
print('\${name.length} \${clean.length} $big $first $part');
print('Hi $big!');`,
      rust: `let name = "  sara ";
name.to_uppercase();
let clean = name.trim();
let big = clean.to_uppercase();
let first = &clean[0..1];
let part = &clean[1..3];
println!("{} {} {} {} {}", name.len(), clean.len(), big, first, part);
println!("Hi {}!", big);`,
    },
    notes: {
      js: "النص في JavaScript لا يتغيّر في مكانه أبداً: كل دالة عليه تبني نصاً جديداً وتعيده، وعليك أن تضعه في درج.",
      ts: "TypeScript نفسها، مع ‎: string بجانب كل درج. لا تحذّرك إن نسيت حفظ ناتج toUpperCase()، فالسطر الثاني يمرّ بصمت.",
      py: "بايثون تسمّي الدوال upper و strip، وتقطع النص بـ [1:3] بدل slice، و len(name) بدل name.length. والنص فيها أيضاً لا يتغيّر في مكانه.",
      go: "في Go الدوال في حزمة strings وتأخذ النص معاملاً: strings.ToUpper(name). و len تعدّ البايتات، وهي هنا تساوي عدد الحروف لأنها لاتينية.",
      dart: "Dart تشبه JavaScript، لكن القطع بـ substring(1, 3)، والقالب يُكتب بـ $big داخل النص.",
      rust: "Rust تفرّق بين &str (نص للقراءة) و String (نص جديد يملكه البرنامج). to_uppercase تبني String جديداً، والقطع &clean[1..3].",
    },
    steps: [
      { line: null, say: "النص صف من الحروف، لكل حرف رقم يبدأ من 0 كما في المصفوفة. الفرق: هذا الصف للقراءة فقط، لا يُغيَّر في مكانه.", memory: [] },
      { line: 1, say: "درج name فيه نص من 7 حروف: مسافتان، ثم s a r a، ثم مسافة. المسافة حرف مثل أي حرف.", memory: m1, changed: ["name"] },
      { line: 2, say: "toUpperCase تقرأ name وتبني نصاً جديداً \"  SARA \". لكن لا يوجد = ولا درج يستقبله، فيضيع. name لم يتغيّر حرفاً واحداً.", memory: m1, read: ["name"] },
      { line: 3, say: "trim تقرأ name وتبني نصاً جديداً بلا مسافات على الطرفين: \"sara\". هذه المرة = يضعه في درج جديد clean. أما name فبقي كما هو.", memory: m3, changed: ["clean"], read: ["name"] },
      { line: 4, say: "toUpperCase على clean تبني \"SARA\" وتضعه في big. clean ما زال \"sara\": الدالة نسخت ولم تعدّل.", memory: m4, changed: ["big"], read: ["clean"] },
      { line: 5, say: "clean[0] يقرأ الحرف في الخانة 0، وهي أول حرف: \"s\". القراءة بالرقم مثل المصفوفة تماماً.", memory: m5, changed: ["first"], read: ["clean"] },
      { line: 6, say: "slice(1, 3) تنسخ من الخانة 1 حتى قبل الخانة 3: الخانتان 1 و 2، أي \"ar\". الرقم الثاني لا يدخل في النسخة.", memory: m6, changed: ["part"], read: ["clean"] },
      { line: 7, say: "length يعدّ الحروف: name فيه 7 لأن المسافات تُعدّ، و clean فيه 4. ثم تُطبع القيم الثلاث الأخرى.", memory: m6, read: ["name", "clean", "big", "first", "part"], output: ["7 4 SARA s ar"] },
      { line: 8, say: "القالب بعلامة ` يبني نصاً جديداً: يضع قيمة big مكان ${big}. والناتج \"Hi SARA!\".", memory: m6, read: ["big"], output: ["7 4 SARA s ar", "Hi SARA!"] },
    ],
  },
  playground: {
    kind: "trace",
    intro: "مستخدم كتب بريده بمسافات وحروف كبيرة. شغّل البرنامج وراقب: أي سطر يغيّر الدرج فعلاً، وأي سطر يبني نصاً ثم يرميه؟",
    starter: `let email = "  Ali@Mail.com ";
email.trim();
console.log(email.length);
let clean = email.trim().toLowerCase();
console.log(clean, clean.length);
console.log(clean.includes("@"), clean.indexOf("@"));`,
    challenges: [
      "شغّل البرنامج. لماذا طبع السطر الثالث 15 وليس 12؟",
      "غيّر السطر الثاني إلى email = email.trim(); وتوقّع ما يطبعه السطر الثالث قبل أن تضغط.",
      "أضف سطراً يطبع clean.slice(0, 3). توقّع الحروف الثلاثة أولاً.",
      "أضف let user = clean.slice(0, clean.indexOf(\"@\")); واطبعه. ماذا يأخذ من البريد؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع البرنامج؟",
      code: `let word = "hello";
word.toUpperCase();
console.log(word);`,
      options: ["hello", "HELLO", "خطأ"],
      answer: 0,
      why: "toUpperCase بنت نصاً جديداً \"HELLO\" ولم يضعه أحد في درج فضاع. درج word لم يُكتب فيه شيء، فبقي \"hello\".",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: `let w = "code";
console.log(w.length, w[w.length - 1]);`,
      options: ["4 e", "4 undefined", "3 e", "5 e"],
      answer: 0,
      why: "length يعدّ 4 حروف، لكن الخانات تبدأ من 0 فآخرها رقم 3. w[3] هو \"e\". لو كتبت w[4] لخرجت من الصف وحصلت على undefined.",
    },
    {
      question: "ماذا يطبع البرنامج؟",
      code: `let lang = "javascript";
let piece = lang.slice(1, 4);
console.log(piece, lang);`,
      options: ["ava javascript", "avas javascript", "ava j", "jav javascript"],
      answer: 0,
      why: "slice تنسخ من الخانة 1 حتى قبل الخانة 4: a v a. والنسخة جديدة، فـ lang بقي كاملاً.",
    },
  ],
  code: {
    intro: "كل اللغات الست تعامل النص كصف حروف لا يتغيّر في مكانه، وتختلف فقط في أسماء الدوال. هنا: نمرّ على الحروف بـ for...of، ونقسم الجملة إلى مصفوفة بـ split ونعيدها نصاً بـ join.",
    runnerStarter: `let word = "banana";
let count = 0;
for (const ch of word) {
  if (ch === "a") {
    count = count + 1;
  }
}
console.log(\`\${word} has \${count} a\`);

let words = "learn js today".split(" ");
console.log(words, words.length);
console.log(words.join("_"));
// جرّب: غيّر "a" إلى "n"، أو غيّر "_" في join إلى " + ".
`,
  },
  exercises: [
    {
      kind: "order",
      title: "تنظيف الاسم",
      prompt: "رتّب الأسطر حتى يُنظَّف الاسم من المسافات ثم يُكبَّر، ويُطبع SARA 4.",
      lines: ['let raw = "  sara ";', "let clean = raw.trim();", "let upper = clean.toUpperCase();", "console.log(upper, upper.length);"],
      expected: "SARA 4",
    },
    {
      kind: "fill",
      title: "البريد بحروف صغيرة",
      prompt: "أي دالة تجعل البرنامج يطبع ali@mail.com؟",
      template: 'let email = "Ali@Mail.com";\nlet low = email.___();\nconsole.log(low);',
      options: ["toLowerCase", "toUpperCase", "trim"],
      expected: "ali@mail.com",
    },
    {
      kind: "fix",
      title: "المسافات لم تختفِ",
      prompt: "البرنامج يطبع 8 بدل 4. لماذا لم تحذف trim المسافات؟ أصلحه.",
      code: 'let name = "  omar  ";\nname.trim();\nconsole.log(name.length);',
      expected: "4",
      hint: "trim تبني نصاً جديداً ولا تغيّر name. ضع الناتج في الدرج: name = name.trim();",
      solution: 'let name = "  omar  ";\nname = name.trim();\nconsole.log(name.length);',
    },
    {
      kind: "write",
      title: "الحروف الأولى",
      prompt: 'لديك full = "sara ali". قسّمه إلى كلمات بـ split(" ")، ثم مرّ على الكلمات بـ for...of وخذ أول حرف من كل كلمة مكبّراً، واطبع SA.',
      starter: '// اكتب الكود هنا\nlet full = "sara ali";\n',
      expected: "SA",
      hint: 'let parts = full.split(" ");  ثم let initials = "";  وفي الحلقة: initials = initials + p[0].toUpperCase();',
      solution: `let full = "sara ali";
let parts = full.split(" ");
let initials = "";
for (const p of parts) {
  initials = initials + p[0].toUpperCase();
}
console.log(initials);`,
    },
  ],
  quiz: [
    { question: "ماذا يطبع البرنامج؟", code: 'let a = "cat";\nlet b = a.toUpperCase();\nconsole.log(a, b);', options: ["cat CAT", "CAT CAT", "cat cat", "CAT cat"], answer: 0, why: "toUpperCase بنت نصاً جديداً \"CAT\" ووُضع في b. أما a فلم يُكتب فيه شيء، فبقي \"cat\"." },
    { question: "ماذا يطبع البرنامج؟", code: 'let t = "hello";\nconsole.log(t[1], t.length);', options: ["e 5", "h 5", "e 4", "h 4"], answer: 0, why: "الخانات تبدأ من 0: الخانة 0 هي h والخانة 1 هي e. و length يعدّ كل الحروف: 5." },
    { question: "ماذا يطبع البرنامج؟", code: 'let parts = "a-b-c".split("-");\nconsole.log(parts.length, parts.join(""));', options: ["3 abc", "5 abc", "3 a-b-c", "1 abc"], answer: 0, why: "split قطع النص عند كل - فصنع مصفوفة من 3 خانات [\"a\", \"b\", \"c\"]. و join(\"\") ألصقها نصاً واحداً بلا فاصل: \"abc\"." },
    { question: "ماذا يطبع البرنامج؟", code: 'let s = "hi";\nlet n = 3;\nconsole.log(`${s} x${n} = ${s.repeat(n)}`);', options: ["hi x3 = hihihi", "${s} x${n} = ${s.repeat(n)}", "hi x3 = hi", "hi x3 = 3hi"], answer: 0, why: "القالب يضع قيمة كل ${...} مكانها: s هو hi، و n هو 3، و s.repeat(3) يبني نصاً جديداً hihihi." },
    { question: "ماذا يطبع البرنامج؟", code: 'let word = "level";\nlet count = 0;\nfor (const ch of word) {\n  if (ch === "e") {\n    count = count + 1;\n  }\n}\nconsole.log(count, word.indexOf("e"));', options: ["2 1", "2 2", "1 1", "2 3"], answer: 0, why: "for...of يمرّ على الحروف واحداً واحداً: l e v e l، فيجد e مرتين. و indexOf يعيد رقم خانة أول e: الخانة 1." },
  ],
  next: "objects",
};
