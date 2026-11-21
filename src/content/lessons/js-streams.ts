import type { Cell, Lesson, Scene } from "@/lib/types";

const box = (name: string, value: string): Cell => ({ name, value, type: "none" });
const bool = (name: string, value: boolean): Cell => ({ name, value: String(value), type: "boolean" });

/** A hand-written scene for a predict answer. */
const mini = (js: string, steps: Scene["steps"]): Scene => ({ code: { js }, steps });

const state = (src: string, buffer: string, extra: Cell[] = []): Cell[] => [box("src", src), box("dest buffer", buffer), ...extra];

export const jsStreams: Lesson = {
  slug: "js-streams",
  stage: 0,
  number: "3.8",
  title: "Streams في Node",
  subtitle: "البيانات تمرّ قطعة قطعة، والكاتب البطيء يقول للقارئ: انتظر",
  minutes: 24,
  singleLanguage: true,
  problem: {
    title: "نسخ ملف أكبر من الذاكرة",
    body: "خادم ذاكرته 512MB ينسخ ملفاً حجمه 2GB، والقرص الذي يكتب أبطأ من الذي يقرأ. جرّب الطرق الثلاث وراقب شريط الذاكرة.",
    demo: "jsStreams",
  },
  scene: {
    code: {
      js: `const fs = require("node:fs");
const src = fs.createReadStream("big.log");
const dest = fs.createWriteStream("copy.log");
src.on("data", (chunk) => {
  const ok = dest.write(chunk);
  if (!ok) src.pause();
});
dest.on("drain", () => src.resume());
src.on("end", () => dest.end());`,
    },
    steps: [
      {
        line: null,
        say: "readFile تضع الملف كله في الذاكرة قبل أن تعطيك أي شيء: 2GB لملف حجمه 2GB. الـ stream يعطيك الملف قطعة بعد قطعة، فلا يبقى في الذاكرة إلا قطع قليلة.",
        memory: [],
      },
      {
        line: 2,
        say: "تيار قراءة: لم يُقرأ شيء بعد. سيقرأ من القرص قطعاً حجم كل منها 64KB (هذا highWaterMark للقراءة).",
        memory: [box("src", "paused, 0 read")],
        changed: ["src"],
      },
      {
        line: 3,
        say: "تيار كتابة له مخزن داخلي (buffer) حدّه 16KB. ما يُكتب ينتظر فيه حتى يكتبه القرص فعلاً.",
        memory: state("paused, 0 read", "0 / 16KB"),
        changed: ["dest buffer"],
      },
      {
        line: 4,
        say: "تسجيل مستمع data يحوّل src إلى وضع التدفق: بدأت القطع تصل، كل واحدة Buffer من 64KB.",
        memory: state("flowing", "0 / 16KB", [box("chunk", "Buffer 64KB")]),
        changed: ["src", "chunk"],
      },
      {
        line: 5,
        say: "write تضع القطعة في المخزن وتعيد جواباً: هل ما زال تحت حدّه؟ المخزن صار 64KB وحدّه 16KB، فتعيد false. القطعة لم تُرفض؛ الجواب طلب: «توقف قليلاً».",
        memory: state("flowing", "64KB / 16KB", [box("chunk", "Buffer 64KB"), bool("ok", false)]),
        changed: ["dest buffer", "ok"],
      },
      {
        line: 6,
        say: "ok هي false، فالشرط true: src.pause() يوقف القراءة من القرص. هذا هو الضغط العكسي (backpressure): الأبطأ يضبط سرعة الأسرع.",
        memory: state("paused", "64KB / 16KB", [box("chunk", "Buffer 64KB"), bool("ok", false)]),
        changed: ["src"],
      },
      {
        line: 8,
        say: "القرص أنهى كتابة ما في المخزن فصار فارغاً، فيطلق dest حدث drain. المستمع يستدعي src.resume() وتعود القراءة.",
        memory: state("flowing", "0 / 16KB"),
        changed: ["src", "dest buffer"],
      },
      {
        line: 4,
        say: "القطعة التالية تصل والدورة تتكرر: كتابة، فإيقاف، فتفريغ، فاستئناف. الذاكرة لا تتجاوز قطعة أو اثنتين مهما كبر الملف.",
        memory: state("flowing", "64KB / 16KB", [box("chunk", "Buffer 64KB")]),
        changed: ["chunk", "dest buffer"],
      },
      {
        line: 9,
        say: "بعد آخر قطعة يطلق src حدث end، فيستدعي dest.end() التي تكتب ما بقي في المخزن وتغلق الملف.",
        memory: state("ended", "0 / 16KB"),
        changed: ["src"],
      },
      {
        line: null,
        say: "في الكود الحقيقي لا تكتب الأسطر 4 إلى 9 بيدك: ‎await pipeline(src, dest)‎ تفعلها كلها، وتغلق التيارين وتنقل الخطأ إليك إن فشل أحدهما.",
        memory: state("ended", "closed"),
      },
    ],
    notes: {
      js: "‎src.pipe(dest)‎ تربط الضغط العكسي أيضاً، لكنها لا تغلق dest إذا فشل src. لذلك يُفضَّل pipeline من node:stream/promises، ومعها for await (const chunk of src) لقراءة القطع داخل دالة async.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة الضغط العكسي: القارئ يضع قطعة كل دورة، والقرص يكتب قطعة كل دورتين فقط. حين تعيد write القيمة false يتوقف القارئ، وحين يفرغ المخزن يستأنف (drain). تابع buffer: لا يتجاوز الحد بكثير أبداً.",
    starter: `const highWaterMark = 3;
const buffer = [];
let paused = false;
function write(chunk) {
  buffer.push(chunk);
  return buffer.length < highWaterMark;
}
function diskWritesOne() {
  const done = buffer.shift();
  console.log("disk wrote " + done);
  if (buffer.length === 0 && paused) {
    paused = false;
    console.log("drain, resume");
  }
}
const file = ["c1", "c2", "c3", "c4", "c5"];
let next = 0;
let tick = 0;
while (next < file.length || buffer.length > 0) {
  tick++;
  if (!paused && next < file.length) {
    const ok = write(file[next]);
    console.log("read " + file[next] + ", buffer " + buffer.length);
    next++;
    if (!ok) {
      paused = true;
      console.log("pause");
    }
  }
  if (tick % 2 === 0) diskWritesOne();
}`,
    challenges: [
      "قبل التشغيل: بعد أي قطعة يُطبع pause أول مرة؟",
      "اجعل highWaterMark = 10. هل يحدث pause أصلاً؟ ما ثمن ذلك في الذاكرة لو كان الملف ألف قطعة؟",
      "احذف السطر paused = true وشغّل. كم يصل طول buffer؟ هذا ما يحدث حين تتجاهل ما تعيده write.",
      "اجعل القرص يكتب كل دورة: tick % 1. هل يتوقف القارئ الآن؟",
    ],
  },
  predict: [
    {
      question: "ماذا يُطبع؟",
      code: `const highWaterMark = 2;
const buffer = [];
function write(chunk) {
  buffer.push(chunk);
  return buffer.length < highWaterMark;
}
console.log(write("a"), write("b"), write("c"));
console.log(buffer.length);`,
      options: ["true false false ثم 3", "true true false ثم 2", "true false false ثم 2"],
      answer: 0,
      why: "write تقبل القطعة دائماً وتضعها في المخزن، ثم تخبرك هل ما زال تحت حدّه. false ليست رفضاً؛ هي طلب أن تتوقف حتى drain. لذلك c دخلت المخزن، ومن يتجاهل false يملأ الذاكرة بلا حد.",
    },
    {
      question: "الملف فيه ثلاثة أسطر: one و two و three. وصل في قطعتين. ماذا يُطبع؟",
      code: `const chunks = ["one\\ntw", "o\\nthree\\n"];
let count = 0;
for (const chunk of chunks) {
  const parts = chunk.split("\\n");
  for (const p of parts) {
    if (p !== "") count++;
  }
}
console.log(count);`,
      options: ["4", "3", "2"],
      answer: 0,
      why: "القطع تُقطع حسب الحجم بالبايت لا حسب الأسطر. السطر two انقسم بين القطعتين: tw في الأولى و o في الثانية، فعُدّ سطرين. الحل أن تحمل آخر جزء غير مكتمل إلى القطعة التالية.",
    },
    {
      question: "ملف السجلات حجمه 3GB، والخادم يملك 1GB. ماذا يحدث لكل برنامج؟",
      code: `// A
const data = await fs.promises.readFile("huge.log", "utf8");
console.log(data.split("\\n").length);

// B
let lines = 0;
for await (const chunk of fs.createReadStream("huge.log")) {
  for (const byte of chunk) if (byte === 10) lines++;
}
console.log(lines);`,
      options: ["A يفشل بنفاد الذاكرة، و B يعدّ الأسطر بذاكرة صغيرة ثابتة", "كلاهما ينجح لكن B أبطأ بكثير", "كلاهما يفشل لأن الملف أكبر من الذاكرة"],
      answer: 0,
      why: "A يطلب الملف كله نصاً واحداً في الذاكرة قبل أن يبدأ، وهذا مستحيل هنا (وللنص في V8 حد أقصى أصلاً). B يمسك قطعة 64KB في كل لحظة، و for await تنتظر جسم الحلقة قبل أن تطلب القطعة التالية.",
      scene: mini(
        `const a = readFile("huge.log");
const b = createReadStream("huge.log");`,
        [
          { line: 1, say: "A: الذاكرة تمتلئ بالملف كله قبل أي سطر بعده: 3GB في خادم ذاكرته 1GB.", memory: [box("A memory", "3GB → crash")] },
          { line: 2, say: "B: قطعة واحدة في كل مرة، تُعدّ ثم تُترك للجامع.", memory: [box("A memory", "3GB → crash"), box("B memory", "~64KB")] },
          { line: 2, say: "B ينتهي بعد مرور الملف كله، والذاكرة لم تكبر.", memory: [box("A memory", "3GB → crash"), box("B memory", "~64KB")] },
        ],
      ),
    },
  ],
  code: {
    intro: "Node نفسه لا يعمل هنا، فهذه الفكرة بدوال عادية: مراحل تحويل (transform) لكل منها transform و flush، مثل Transform في Node. أهمها مقسّم الأسطر: يحمل نصف السطر الأخير إلى القطعة التالية، و flush تخرجه عند النهاية. السطر المعلّق في الأعلى هو الكود نفسه بـ pipeline الحقيقية.",
    runnerStarter: `// In Node the same program is:
//   import { pipeline } from "node:stream/promises";
//   await pipeline(fs.createReadStream("app.log"), lineSplitter, errorsOnly, lowerCase, process.stdout);
// Here each stage is { transform(item, push), flush(push) }, like a Node Transform stream.

function createLineSplitter() {
  let carry = "";
  return {
    transform(chunk, push) {
      const parts = (carry + chunk).split("\\n");
      carry = parts.pop(); // the last piece may be half a line: keep it for the next chunk
      for (const line of parts) push(line);
    },
    flush(push) {
      if (carry !== "") push(carry);
    },
  };
}
const filter = (pred) => ({ transform: (item, push) => pred(item) && push(item), flush() {} });
const map = (fn) => ({ transform: (item, push) => push(fn(item)), flush() {} });

function pipeline(source, stages, sink) {
  const feed = (i, item) => {
    if (i === stages.length) return sink(item);
    stages[i].transform(item, (out) => feed(i + 1, out));
  };
  for (const chunk of source) feed(0, chunk);
  // end of input: flush each stage in order, so carried data moves on
  stages.forEach((stage, i) => stage.flush((out) => feed(i + 1, out)));
}

// The chunks cut lines anywhere, like real 64KB reads do.
const chunks = ["INFO boot\\nERR disk fu", "ll\\nINFO ok\\nERR time", "out"];
pipeline(
  chunks,
  [createLineSplitter(), filter((line) => line.startsWith("ERR")), map((line) => line.toLowerCase())],
  (line) => console.log(line),
);
// try: remove the flush call in pipeline and predict which line disappears
`,
  },
  exercises: [
    {
      kind: "order",
      title: "احمل نصف السطر",
      prompt: "رتّب الأسطر حتى تُجمع الأسطر الكاملة من قطع مقطوعة في أي مكان: a,bc,d",
      lines: [
        'let carry = "";',
        "const lines = [];",
        'for (const chunk of ["a\\nb", "c\\nd\\n"]) {',
        '  const parts = (carry + chunk).split("\\n");',
        "  carry = parts.pop();",
        "  for (const line of parts) lines.push(line);",
        "}",
        'console.log(lines.join(","));',
      ],
      expected: "a,bc,d",
    },
    {
      kind: "fill",
      title: "استمع لجواب write",
      prompt: "ماذا يفعل القارئ حين تعيد write القيمة false، حتى يتوقف عند حدّ المخزن؟",
      template: `const highWaterMark = 2;
const buffer = [];
let paused = false;
function write(chunk) {
  buffer.push(chunk);
  return buffer.length < highWaterMark;
}
for (const chunk of ["a", "b", "c"]) {
  if (paused) break;
  const ok = write(chunk);
  if (!ok) ___;
}
console.log(buffer.join(""), paused);`,
      options: ["paused = true", "paused = false", "buffer.length = 0"],
      expected: "ab true",
    },
    {
      kind: "fix",
      title: "أربعة أسطر من ثلاثة",
      prompt: "الملف فيه ثلاثة أسطر، لكن الكود يعدّ أربعة لأن سطراً انقسم بين قطعتين. أصلحه حتى يطبع 3 one|two|three.",
      code: `const chunks = ["one\\ntw", "o\\nthree\\n"];
const lines = [];
for (const chunk of chunks) {
  for (const line of chunk.split("\\n")) {
    if (line !== "") lines.push(line);
  }
}
console.log(lines.length, lines.join("|"));`,
      expected: "3 one|two|three",
      hint: "احفظ آخر جزء من كل قطعة في carry، والصقه أمام القطعة التالية: (carry + chunk).split(\"\\n\")، ثم carry = parts.pop(). وبعد الحلقة أضف carry إن لم يكن فارغاً.",
      solution: `const chunks = ["one\\ntw", "o\\nthree\\n"];
const lines = [];
let carry = "";
for (const chunk of chunks) {
  const parts = (carry + chunk).split("\\n");
  carry = parts.pop();
  for (const line of parts) {
    if (line !== "") lines.push(line);
  }
}
if (carry !== "") lines.push(carry);
console.log(lines.length, lines.join("|"));`,
    },
    {
      kind: "write",
      title: "قطّع كما يقطّع القارئ",
      prompt: "اكتب toChunks(text, size) التي تقطّع النص إلى قطع طول كل منها size على الأكثر، كما يفعل تيار قراءة بـ highWaterMark. يُطبع abc|def|g ثم 0.",
      starter: `// write toChunks(text, size): an array of pieces, each at most size characters

console.log(toChunks("abcdefg", 3).join("|"));
console.log(toChunks("", 3).length);`,
      expected: "abc|def|g\n0",
      hint: "حلقة تبدأ من 0 وتقفز size في كل دورة: for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));",
      solution: `function toChunks(text, size) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return chunks;
}

console.log(toChunks("abcdefg", 3).join("|"));
console.log(toChunks("", 3).length);`,
    },
  ],
  quiz: [
    {
      question: "حدّ المخزن 4 بايتات. ماذا يُطبع؟",
      code: 'const ws = fs.createWriteStream("out.txt", { highWaterMark: 4 });\nconsole.log(ws.write("abc"), ws.write("de"));',
      options: ["true false", "true true", "false false"],
      answer: 0,
      why: "بعد abc في المخزن 3 بايتات، أقل من 4، فالجواب true. بعد de صار 5، فوق الحد، فالجواب false. والبايتات كلها قُبلت، و false طلب أن تنتظر drain قبل الكتابة التالية.",
    },
    {
      question: "فشلت قراءة الملف في المنتصف (القرص فُصل). ما الفرق بين السطرين؟",
      code: "// A\nsrc.pipe(dest);\n\n// B\nawait pipeline(src, dest);",
      options: [
        "A يترك dest مفتوحاً ولا يصلك الخطأ إلا بمستمع على src، و B يغلق الاثنين ويرمي الخطأ في await",
        "كلاهما يغلق التيارين ويرمي الخطأ",
        "A يعيد المحاولة تلقائياً، و B لا",
      ],
      answer: 0,
      why: "pipe تربط تدفق البيانات والضغط العكسي فقط، لا الأخطاء: الملف الهدف يبقى مفتوحاً (تسريب مقبض ملف). pipeline تراقب كل التيارات، وتدمّرها كلها عند أول خطأ، وترفض وعدها به فيصل إلى try/catch.",
    },
    {
      question: "ماذا يحدث للقراءة من القرص بينما تنتظر saveToDb؟",
      code: 'for await (const chunk of fs.createReadStream("big.csv")) {\n  await saveToDb(chunk); // slow: 1 second\n}',
      options: [
        "تتوقف بعد أن يمتلئ مخزن القراءة، ثم تستأنف حين تطلب الحلقة القطعة التالية",
        "تستمر حتى يُقرأ الملف كله إلى الذاكرة",
        "تقرأ قطعة واحدة كل ثانية بالضبط، دون أي مخزن",
      ],
      answer: 0,
      why: "for await تطلب القطعة التالية فقط بعد أن ينتهي جسم الحلقة. التيار يقرأ مسبقاً حتى يملأ مخزنه (highWaterMark) ثم يتوقف. هذا ضغط عكسي مجاني، دون pause و resume بيدك.",
    },
    {
      question: "ملف نصي حجمه 10 بايتات. ماذا يُطبع؟",
      code: 'fs.createReadStream("a.txt").on("data", (chunk) => {\n  console.log(typeof chunk, chunk.length);\n});',
      options: ["object 10", "string 10", "number 10"],
      answer: 0,
      why: "بلا ترميز، القطع هي Buffer: كائن بايتات خام، و typeof أي كائن هو object. والطول بالبايت. مع { encoding: \"utf8\" } تصل نصوصاً، وقد يختلف عدد الأحرف عن عدد البايتات في العربية.",
    },
    {
      question: "مراحل التحويل الثلاث متصلة بـ pipeline، والأخيرة تكتب إلى قرص بطيء. أي مرحلة تتباطأ؟",
      code: "await pipeline(readLog, parseLines, toJson, slowDiskWriter);",
      options: ["كلها، لأن الضغط العكسي ينتقل للخلف من مرحلة إلى التي قبلها", "slowDiskWriter فقط، والبقية تعمل بأقصى سرعتها", "readLog فقط"],
      answer: 0,
      why: "حين يمتلئ مخزن الكاتب البطيء، تتوقف toJson عن الدفع إليه، فيمتلئ مخزنها، فتتوقف parseLines، ثم readLog. السلسلة كلها تسير بسرعة أبطأ حلقة، وذاكرتها محدودة بمجموع المخازن الصغيرة.",
    },
  ],
  next: "testing",
};
