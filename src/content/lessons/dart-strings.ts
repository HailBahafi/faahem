import type { Frame, HeapObj, Lesson, Scene, Slot, Step } from "@/lib/types";

const ref = (name: string, to: number): Slot => ({ name, value: "", type: "ref", ref: to });
const main = (vars: Slot[]): Frame => ({ id: 1, name: "main", vars });
/** A String on the heap: its UTF-16 code units, numbered from 0. */
const text = (id: number, s: string): HeapObj => ({
  id,
  kind: "array",
  items: [...s].map((ch, i) => ({ name: `[${i}]`, value: `'${ch}'`, type: "string" })),
});
const at = (line: number | null, say: string, frames: Frame[], heap: HeapObj[], extra: Partial<Step> = {}): Step => ({ line, say, memory: [], frames, heap, ...extra });
const dart = (code: string, steps: Step[]): Scene => ({ code: { dart: code }, steps });

const sara = text(1, "sara");
const SARA = text(2, "SARA");
const hi = text(3, "Hi, Sara!");
const v3 = [ref("name", 1), ref("upper", 2), ref("greeting", 3)];
/** A StringBuffer: a growable area that pieces are written into, turned into one String at the end. */
const buffer = text;

export const dartStrings: Lesson = {
  slug: "dart-strings",
  stage: 0,
  number: "1.7",
  title: "النصوص",
  subtitle: "النص صفّ من الحروف في الكومة لا يتغير أبداً، وكل تعديل يصنع نصاً جديداً",
  minutes: 20,
  singleLanguage: true,
  problem: {
    title: "كم مرة نُسخت الحروف؟",
    body: "تريد أن تبني نصاً طويلاً من كلمات كثيرة. اختر عدد الكلمات، ثم ابنِ النص بطريقتين وقارن كم حرفاً نسخه الجهاز في كل طريقة.",
    demo: "dartStrings",
  },
  scene: {
    code: {
      dart: `void main() {
  final name = "sara";
  final upper = name.toUpperCase();
  final greeting = "Hi, \${upper[0]}\${name.substring(1)}!";
  final buf = StringBuffer();
  for (final w in ["a", "b", "c"]) buf.write(w);
  print("$name $greeting $buf \${"😀".length}");
}`,
    },
    steps: [
      at(null, "النص في Dart كائن في الكومة: صفّ من وحدات UTF-16 مرقّمة من 0. وله قاعدة واحدة مهمة: لا يتغير بعد أن يُصنع (immutable).", [], []),
      at(2, "\"sara\" أربع وحدات في الكومة، و name يحمل سهماً إليها.", [main([ref("name", 1)])], [sara], { changed: ["name"], changedHeap: [1] }),
      at(
        3,
        "toUpperCase لا تعدّل \"sara\": تبني نصاً جديداً \"SARA\" في مكان آخر وترجع سهمه. name ما زال يشير إلى الحروف الصغيرة.",
        [main([ref("name", 1), ref("upper", 2)])],
        [sara, SARA],
        { changed: ["upper"], changedHeap: [2], read: ["name"] },
      ),
      at(
        4,
        "upper[0] تقرأ الخانة 0 وترجع نصاً من حرف واحد \"S\". و substring(1) تنسخ من الخانة 1 إلى النهاية: \"ara\". ثم يبني القالب نصاً ثالثاً جديداً: \"Hi, Sara!\".",
        [main(v3)],
        [sara, SARA, hi],
        { changed: ["greeting"], changedHeap: [3], read: ["upper", "name"] },
      ),
      at(5, "StringBuffer ليس نصاً: هو مساحة قابلة للنمو في الكومة، نكتب فيها قطعاً دون أن نصنع نصاً جديداً كل مرة.", [main([...v3, ref("buf", 4)])], [sara, SARA, hi, buffer(4, "")], {
        changed: ["buf"],
        changedHeap: [4],
      }),
      at(6, "الحلقة تكتب a ثم b ثم c في المساحة نفسها. لو كتبنا s = s + w لصُنع نص جديد كامل في كل دورة، ونُسخت كل الحروف السابقة من جديد.", [main([...v3, ref("buf", 4)])], [sara, SARA, hi, buffer(4, "abc")], {
        changedHeap: [4],
        read: ["buf"],
      }),
      at(
        7,
        "‎$buf‎ في القالب تستدعي toString()‎ مرة واحدة فتصنع \"abc\". و \"😀\".length تعطي 2 لا 1: الوجه الضاحك خارج أول 65536 رمزاً، فيحتاج وحدتي UTF-16. الطول يعدّ الوحدات لا ما تراه العين.",
        [main([...v3, ref("buf", 4)])],
        [sara, SARA, hi, buffer(4, "abc")],
        { read: ["name", "greeting", "buf"], output: ["sara Hi, Sara! abc 2"] },
      ),
      at(
        null,
        "الصورة: كل عملية على نص (toUpperCase و substring و trim و replaceAll و +) ترجع نصاً جديداً وتترك القديم كما هو. لذلك تُكتب name = name.trim()‎ لا name.trim()‎ وحدها، ولبناء نص من قطع كثيرة استعمل StringBuffer أو join.",
        [main([...v3, ref("buf", 4)])],
        [sara, SARA, hi, buffer(4, "abc")],
        { output: ["sara Hi, Sara! abc 2"] },
      ),
    ],
    notes: {
      dart: "علامة تنصيص مفردة أو مزدوجة سيّان. ‎$name‎ تدرج متغيراً، و ‎${expr}‎ تدرج تعبيراً. ‏\"\"\" لنص من أسطر عدة، و r\"...\" لنص خام لا تُفسَّر فيه \\n. و == تقارن الحروف لا العناوين.",
    },
  },
  playground: {
    kind: "trace",
    intro: "نصوص JavaScript لا تتغير أيضاً، فالفكرة نفسها تماماً. راقب: toUpperCase لا تلمس name، و joined تُبنى من جديد في كل دورة، بينما parts تجمع القطع ثم تُلصق مرة واحدة بـ join، كما يفعل StringBuffer.",
    starter: `let name = "sara";
const upper = name.toUpperCase();
console.log(name, upper);
const greeting = "Hi, " + upper[0] + name.slice(1) + "!";
console.log(greeting);
let joined = "";
const parts = [];
const words = ["a", "b", "c"];
for (const w of words) {
  joined = joined + w;
  parts.push(w);
}
console.log(joined, parts.join(""));
console.log("😀".length);`,
    challenges: [
      "قبل التشغيل: ماذا يطبع السطر الثالث؟ هل غيّرت toUpperCase ما في name؟",
      "أضف السطر name.toUpperCase();‎ وحده ثم console.log(name). لماذا لم يتغير؟ اكتبه بطريقة تغيّر name فعلاً.",
      "أضف كلمات إلى words. كم نصاً جديداً تصنع joined في كل دورة؟ وكم تصنع parts.join؟",
      "جرّب \"سارة\".length و \"é\".length. أيها يعدّ ما تراه العين؟",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `var a = "hi";
final b = a;
a += "!";
print(b);`,
      options: ["hi", "hi!", "خطأ: b من نوع final"],
      answer: 0,
      why: "b = a نسخ السهم إلى \"hi\". و a += \"!\" لا تضيف إلى ذلك النص (النصوص لا تتغير)، بل تبني نصاً جديداً \"hi!\" وتنقل سهم a إليه. b ما زال يشير إلى القديم.",
      scene: dart(
        `var a = "hi";
final b = a;
a += "!";
print(b);`,
        [
          at(1, "\"hi\" في الكومة، و a يشير إليه.", [main([ref("a", 1)])], [text(1, "hi")], { changed: ["a"], changedHeap: [1] }),
          at(2, "b يأخذ نسخة من السهم.", [main([ref("a", 1), ref("b", 1)])], [text(1, "hi")], { changed: ["b"], copy: { from: "a", to: "b" } }),
          at(3, "a + \"!\" تبني نصاً جديداً، ثم يتحول سهم a إليه. \"hi\" لم يُلمس.", [main([ref("a", 2), ref("b", 1)])], [text(1, "hi"), text(2, "hi!")], { changed: ["a"], changedHeap: [2] }),
          at(4, "b يشير إلى \"hi\".", [main([ref("a", 2), ref("b", 1)])], [text(1, "hi"), text(2, "hi!")], { read: ["b"], output: ["hi"] }),
        ],
      ),
    },
    {
      question: "ماذا يطبع السطر الثاني؟",
      code: `final name = "sara";
print("$name.length");`,
      options: ["sara.length", "4", "خطأ في الترجمة"],
      answer: 0,
      why: "‎$‎ بلا أقواس تأخذ اسم متغير واحد فقط وتتوقف عند النقطة. الباقي \".length\" حروف عادية. لإدراج تعبير كامل استعمل الأقواس: ‎${name.length}‎.",
      scene: dart(
        `final name = "sara";
print("$name.length");`,
        [
          at(1, "name يشير إلى \"sara\".", [main([ref("name", 1)])], [sara], { changed: ["name"], changedHeap: [1] }),
          at(2, "القالب يرى ‎$name‎ فيضع \"sara\"، ثم يرى \".length\" حروفاً عادية فيضعها كما هي.", [main([ref("name", 1)])], [sara], { read: ["name"], output: ["sara.length"] }),
        ],
      ),
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: `final a = "dart";
final b = "da" + "rt";
print(a == b);`,
      options: ["true", "false: هما كائنان مختلفان", "خطأ: لا تُقارن النصوص بـ =="],
      answer: 0,
      why: "== في نصوص Dart تقارن الحروف واحداً واحداً، لا العناوين في الكومة. لذلك لا تحتاج equals كما في Java: نصّان بالحروف نفسها متساويان.",
      scene: dart(
        `final a = "dart";
final b = "da" + "rt";
print(a == b);`,
        [
          at(1, "\"dart\" في الكومة.", [main([ref("a", 1)])], [text(1, "dart")], { changed: ["a"], changedHeap: [1] }),
          at(2, "الجمع يبني نصاً بالحروف نفسها. قد يكون في مكان آخر من الكومة.", [main([ref("a", 1), ref("b", 2)])], [text(1, "dart"), text(2, "dart")], { changed: ["b"], changedHeap: [2] }),
          at(3, "== تقارن الطول ثم الحروف: d=d، a=a، r=r، t=t. متساويان: true.", [main([ref("a", 1), ref("b", 2)])], [text(1, "dart"), text(2, "dart")], { read: ["a", "b"], output: ["true"] }),
        ],
      ),
    },
  ],
  code: {
    intro: "برنامج Dart حقيقي على خادم التشغيل: تنظيف مدخلات، وتقسيم ودمج، وقالب نص، ونص من أسطر عدة، و StringBuffer لبناء فاتورة. شغّله ثم جرّب ما في التعليق.",
    runnerLang: "dart",
    runnerStarter: `void main() {
  final raw = "  Sara@Mail.COM ";
  final email = raw.trim().toLowerCase();
  print("[$email] user=\${email.split("@").first}");

  final tags = "tea, cake ,juice".split(",").map((t) => t.trim()).toList();
  print(tags.join(" | "));

  final receipt = StringBuffer();
  final items = {"tea": 5.0, "cake": 12.5};
  items.forEach((name, price) {
    receipt.writeln("\${name.padRight(6)}\${price.toStringAsFixed(2).padLeft(7)}");
  });
  print(receipt);

  const poem = """
first line
second line""";
  print(poem.split("\\n").length);
  print("Riyadh".contains("yad") && "Riyadh".startsWith("R"));
  // try: change padRight(6) to padRight(10), or print raw.length vs email.length
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "dart",
      title: "اسم المستخدم من البريد",
      prompt: "رتّب الأسطر: نظّف البريد من المسافات وحوّله إلى حروف صغيرة، ثم خذ ما قبل @ واطبع sara.",
      lines: ["void main() {", '  final email = "  Sara@Mail.com ";', "  final clean = email.trim().toLowerCase();", '  final user = clean.split("@").first;', "  print(user);", "}"],
      expected: "sara",
    },
    {
      kind: "fill",
      lang: "dart",
      title: "رقم الطلب",
      prompt: "أرقام الطلبات تُعرض بثلاث خانات: 7 تصبح 007. أي دالة تفعل ذلك؟",
      template: `void main() {
  print("7".___(3, "0"));
}`,
      options: ["padLeft", "padRight", "pad"],
      answer: "padLeft",
      expected: "007",
    },
    {
      kind: "fix",
      lang: "dart",
      title: "الحرف الأول كبير",
      prompt: "المترجم يرفض هذا البرنامج لأن النص لا يتغير من الداخل. أصلحه ببناء نص جديد حتى يطبع Sara.",
      code: `void main() {
  var name = "sara";
  name[0] = "S";
  print(name);
}`,
      expected: "Sara",
      hint: "ابنِ نصاً جديداً من الحرف الأول كبيراً وباقي الحروف: name[0].toUpperCase() + name.substring(1)",
      solution: `void main() {
  var name = "sara";
  name = name[0].toUpperCase() + name.substring(1);
  print(name);
}`,
    },
    {
      kind: "write",
      lang: "dart",
      title: "الأحرف الأولى",
      prompt: "من الاسم الكامل \"sara al noor\" اطبع الحرف الأول من كل كلمة كبيراً، ملصقة معاً: SAN.",
      starter: `void main() {
  final fullName = "sara al noor";
  // split into words, take each first letter in upper case, join them
}
`,
      expected: "SAN",
      hint: "fullName.split(\" \") ثم map((w) => w[0].toUpperCase())‎ ثم join()‎.",
      solution: `void main() {
  final fullName = "sara al noor";
  final initials = fullName.split(" ").map((w) => w[0].toUpperCase()).join();
  print(initials);
}
`,
    },
  ],
  quiz: [
    {
      question: "ماذا يطبع هذا السطر؟",
      code: 'print("ab" * 3);',
      options: ["ababab", "خطأ: لا يُضرب نص في عدد", "ab3"],
      answer: 0,
      why: "عامل * على نص يكرره: يبني نصاً جديداً فيه \"ab\" ثلاث مرات. مفيد لرسم الخطوط مثل \"-\" * 20.",
    },
    {
      question: "ماذا يحدث هنا؟",
      code: 'print("10" + 5);',
      options: ["المترجم يرفض: + على نص تحتاج نصاً", "يطبع 105", "يطبع 15"],
      answer: 0,
      why: "JavaScript كانت ستلصق 5 كنص وتطبع 105 بصمت. Dart لا يحوّل بنفسه: + على String تقبل String فقط. اكتب \"10\" + 5.toString()‎ أو القالب ‎\"10$x\"‎، أو int.parse(\"10\") + 5 إن أردت الجمع.",
    },
    {
      question: "ماذا يطبع هذا السطر؟",
      code: 'print("Riyadh".substring(1, 3));',
      options: ["iy", "iya", "Ri"],
      answer: 0,
      why: "substring(start, end) تنسخ من الخانة start حتى ما قبل end. الخانات: R=0، i=1، y=2، a=3. من 1 إلى ما قبل 3: \"iy\".",
    },
    {
      question: "ماذا يطبع هذا السطر؟",
      code: 'print("a,b,,c".split(",").length);',
      options: ["4", "3", "5"],
      answer: 0,
      why: "split تقطع عند كل فاصلة. بين الفاصلتين المتتاليتين نص فارغ \"\"، وهو عنصر أيضاً: [\"a\", \"b\", \"\", \"c\"].",
    },
    {
      question: "ماذا يطبع هذا البرنامج؟",
      code: 'var city = "  Jeddah ";\ncity.trim();\nprint(city.length);',
      options: ["9", "6", "7"],
      answer: 0,
      why: "trim لا تغيّر النص (لا شيء يغيّر نصاً)، بل ترجع نصاً جديداً بلا مسافات. لم نحفظه في أي درج فضاع، و city ما زال 9 وحدات. الصحيح: city = city.trim();‎.",
    },
  ],
  next: "dart-classes",
};
