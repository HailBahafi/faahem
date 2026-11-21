import type { Cell, Lesson, Scene } from "@/lib/types";

const box = (name: string, value: string): Cell => ({ name, value, type: "none" });

/** A hand-written scene for a predict answer. */
const mini = (js: string, steps: Scene["steps"]): Scene => ({ code: { js }, steps });

/** The machine as Node runs it: the main stack, libuv's pool and queues, and what was printed so far. */
const node = (o: { stack?: string; pool?: string; ticks?: string; micro?: string; timers?: string; check?: string; printed: string }): Cell[] => [
  box("call stack", o.stack ?? "empty"),
  box("thread pool", o.pool ?? "0 / 4 busy"),
  box("nextTick queue", o.ticks ?? "[]"),
  box("microtasks", o.micro ?? "[]"),
  box("timers", o.timers ?? "[]"),
  box("check (setImmediate)", o.check ?? "[]"),
  box("stdout", o.printed),
];

export const jsNodeInternals: Lesson = {
  slug: "js-node-internals",
  stage: 0,
  number: "4.3",
  title: "Node من الداخل",
  subtitle: "خيط واحد يشغّل كودك، وحوله libuv: حلقة بمراحل، ومجموعة خيوط تعمل في الخلفية",
  minutes: 28,
  singleLanguage: true,
  problem: {
    title: "خادم توقّف عن الرد",
    body: "خادم Node يرد على طلبات صغيرة (ping) طوال الوقت. اطلب منه تشفير 8 كلمات مرور: مرة بالدالة غير المتزامنة، ومرة بنسختها المتزامنة Sync. راقب الطلبات المنتظرة.",
    demo: "jsNodeInternals",
  },
  scene: {
    code: {
      js: `const fs = require("node:fs");
console.log("start");
fs.readFile("data.txt", () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
  process.nextTick(() => console.log("nextTick"));
});
Promise.resolve().then(() => console.log("promise"));
console.log("end");`,
    },
    steps: [
      {
        line: null,
        say: "Node جزءان: V8 يشغّل JavaScript على خيط واحد بمكدّس واحد، و libuv (مكتبة C) تدير حلقة الأحداث ومجموعة من 4 خيوط تقوم بأعمال الملفات والتشفير والضغط. الحلقة تمر بمراحل بالترتيب: timers ثم poll (الإدخال والإخراج) ثم check، وتعود.",
        memory: node({ printed: "" }),
      },
      {
        line: 2,
        say: "كود عادي على المكدّس: يُطبع start فوراً.",
        memory: node({ stack: "main script", printed: "start" }),
        changed: ["stdout"],
      },
      {
        line: 3,
        say: "readFile لا تقرأ بنفسها: تعطي المهمة لخيط من المجموعة وتعود فوراً. القرص يعمل في الخلفية، والخيط الرئيسي يكمل.",
        memory: node({ stack: "main script", pool: "1 / 4 busy: read data.txt", printed: "start" }),
        changed: ["thread pool"],
      },
      {
        line: 8,
        say: "الوعد محلول مسبقاً، فدالة then تدخل طابور المهام الصغيرة (microtasks). لن تعمل قبل أن يفرغ المكدّس.",
        memory: node({ stack: "main script", pool: "1 / 4 busy: read data.txt", micro: "[promise]", printed: "start" }),
        changed: ["microtasks"],
      },
      {
        line: 9,
        say: "يُطبع end، وينتهي الملف الرئيسي فيفرغ المكدّس. قبل أن تبدأ الحلقة، يفرّغ Node طابور nextTick ثم microtasks: يُطبع promise.",
        memory: node({ pool: "1 / 4 busy: read data.txt", printed: "start, end, promise" }),
        changed: ["stdout", "microtasks"],
      },
      {
        line: 3,
        say: "الحلقة تصل إلى مرحلة poll وتنتظر. الخيط أنهى قراءة الملف، فيدخل الـ callback طابور poll ويعمل على الخيط الرئيسي، لا على خيط المجموعة.",
        memory: node({ stack: "readFile callback", printed: "start, end, promise" }),
        changed: ["call stack", "thread pool"],
      },
      {
        line: 5,
        say: "السطران 4 و 5 يحجزان: المؤقت في طابور timers (مرحلة الدورة القادمة)، و setImmediate في طابور check (مرحلة تأتي بعد poll مباشرة في الدورة نفسها).",
        memory: node({ stack: "readFile callback", timers: "[timeout]", check: "[immediate]", printed: "start, end, promise" }),
        changed: ["timers", "check (setImmediate)"],
      },
      {
        line: 6,
        say: "nextTick لا تنتمي إلى أي مرحلة: طابورها يُفرَّغ بعد كل callback، قبل أي شيء آخر.",
        memory: node({ stack: "readFile callback", ticks: "[nextTick]", timers: "[timeout]", check: "[immediate]", printed: "start, end, promise" }),
        changed: ["nextTick queue"],
      },
      {
        line: 7,
        say: "انتهى الـ callback. قبل الانتقال، طابور nextTick يُفرَّغ: يُطبع nextTick.",
        memory: node({ timers: "[timeout]", check: "[immediate]", printed: "start, end, promise, nextTick" }),
        changed: ["stdout", "nextTick queue"],
      },
      {
        line: 5,
        say: "المرحلة التالية بعد poll هي check: يُطبع immediate.",
        memory: node({ timers: "[timeout]", printed: "start, end, promise, nextTick, immediate" }),
        changed: ["stdout", "check (setImmediate)"],
      },
      {
        line: 4,
        say: "الحلقة تدور إلى مرحلة timers: مرّ 0ms، فيُطبع timeout. لا شيء ينتظر بعدها، فتنتهي العملية.",
        memory: node({ printed: "start, end, promise, nextTick, immediate, timeout" }),
        changed: ["stdout", "timers"],
      },
      {
        line: null,
        say: "داخل callback إدخال وإخراج، immediate تسبق timeout دائماً، لأن check تلي poll. في الملف الرئيسي ترتيبهما غير مضمون. وأي كود متزامن طويل يوقف هذا كله: الحلقة لا تدور والمكدّس مشغول.",
        memory: node({ printed: "start, end, promise, nextTick, immediate, timeout" }),
      },
    ],
    notes: {
      js: "الشبكة (TCP و HTTP) لا تستعمل مجموعة الخيوط: libuv تسجّل المقابس عند نظام التشغيل (epoll و kqueue و IOCP) وتنتظرها كلها معاً في مرحلة poll. المجموعة للأعمال التي لا يقدّم لها النظام واجهة غير متزامنة: الملفات، و crypto، و zlib، و dns.lookup.",
    },
  },
  playground: {
    kind: "trace",
    intro: "حلقة أحداث مصغّرة: ثلاث مراحل بطوابيرها، وطابور nextTick يُفرَّغ بعد كل callback. الملف «انتهت قراءته» فوضعنا الـ callback في poll. تابع أي طابور يُفرَّغ متى.",
    starter: `const queues = { timers: [], poll: [], check: [] };
const ticks = [];
function drainTicks() {
  while (ticks.length > 0) {
    const cb = ticks.shift();
    cb();
  }
}
function runPhase(name) {
  const q = queues[name];
  while (q.length > 0) {
    const cb = q.shift();
    cb();
    drainTicks();
  }
}
console.log("start");
queues.poll.push(function () {
  console.log("file read");
  queues.timers.push(function () { console.log("timeout"); });
  queues.check.push(function () { console.log("immediate"); });
  ticks.push(function () { console.log("nextTick"); });
});
console.log("end");
drainTicks();
let loop = 0;
while (queues.timers.length + queues.poll.length + queues.check.length > 0) {
  loop++;
  console.log("-- loop " + loop);
  runPhase("timers");
  runPhase("poll");
  runPhase("check");
}`,
    challenges: [
      "قبل التشغيل: في أي دورة يُطبع timeout، الأولى أم الثانية؟",
      "اجعل callback الملف يضيف timeout إلى check بدل timers. كم دورة تحتاج الحلقة الآن؟",
      "داخل دالة nextTick أضف ticks.push لدالة أخرى تطبع again. متى تُطبع؟ (طابور nextTick يُفرَّغ حتى آخره، حتى ما أضيف إليه أثناء التفريغ.)",
      "احذف drainTicks() من داخل runPhase. أين ينتقل nextTick؟ هذا خطأ في المحاكاة: Node يفرّغه بعد كل callback.",
    ],
  },
  predict: [
    {
      question: "بأي ترتيب تُطبع الأسطر؟",
      code: `Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("tick"));
console.log("sync");`,
      options: ["sync ثم tick ثم promise", "sync ثم promise ثم tick", "tick ثم promise ثم sync"],
      answer: 0,
      why: "لا شيء غير متزامن يقطع كوداً متزامناً، فـ sync أولاً. حين يفرغ المكدّس يفرّغ Node طابور nextTick قبل طابور الوعود، حتى لو سُجّل الوعد أولاً. nextTick أداة داخلية الطابع؛ في كودك استعمل queueMicrotask أو الوعود.",
      scene: mini(
        `Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("tick"));
console.log("sync");`,
        [
          { line: 1, say: "then تدخل طابور الوعود.", memory: [box("nextTick queue", "[]"), box("microtasks", "[promise]")] },
          { line: 2, say: "nextTick تدخل طابورها الخاص.", memory: [box("nextTick queue", "[tick]"), box("microtasks", "[promise]")] },
          { line: 3, say: "يُطبع sync ويفرغ المكدّس.", memory: [box("nextTick queue", "[tick]"), box("microtasks", "[promise]"), box("stdout", "sync")] },
          { line: 2, say: "طابور nextTick أولاً: tick.", memory: [box("nextTick queue", "[]"), box("microtasks", "[promise]"), box("stdout", "sync, tick")] },
          { line: 1, say: "ثم الوعود: promise.", memory: [box("nextTick queue", "[]"), box("microtasks", "[]"), box("stdout", "sync, tick, promise")] },
        ],
      ),
    },
    {
      question: "كل تشفير يأخذ نحو 100ms على خيط واحد، وحجم المجموعة الافتراضي 4. متى ينتهي كل واحد من الستة تقريباً؟",
      code: `const crypto = require("node:crypto");
const start = Date.now();
for (let i = 1; i <= 6; i++) {
  crypto.pbkdf2("secret", "salt", 100000, 64, "sha512", () => {
    console.log(i, Date.now() - start + "ms");
  });
}`,
      options: ["أربعة عند 100ms تقريباً، واثنان عند 200ms", "الستة عند 100ms", "واحد كل 100ms: حتى 600ms"],
      answer: 0,
      why: "pbkdf2 تعمل على خيوط libuv، والخيوط 4. الأربعة الأولى تعمل معاً، والاثنان الباقيان ينتظران في الطابور حتى يفرغ خيط. الخيط الرئيسي حرّ طوال الوقت. UV_THREADPOOL_SIZE=8 (قبل بدء العملية) يجعل الستة تعمل معاً إن وُجدت أنوية كافية.",
      scene: mini(
        `crypto.pbkdf2(...) × 6`,
        [
          { line: 1, say: "ست مهام تُعطى للمجموعة. الخيوط الأربعة تأخذ الأربع الأولى، والبقية تنتظر.", memory: [box("threads", "#1 #2 #3 #4"), box("waiting", "#5 #6")] },
          { line: 1, say: "عند 100ms تنتهي الأربع معاً، وتأخذ الخيوط الحرة #5 و #6.", memory: [box("threads", "#5 #6"), box("waiting", "—"), box("done", "1 2 3 4 @ ~100ms")] },
          { line: 1, say: "عند 200ms تنتهي الاثنتان.", memory: [box("threads", "—"), box("done", "1-4 @ ~100ms, 5-6 @ ~200ms")] },
        ],
      ),
    },
    {
      question: "متى يُطبع fired؟",
      code: `const start = Date.now();
setTimeout(() => console.log("fired", Date.now() - start + "ms"), 10);
while (Date.now() - start < 300) {
  // busy: 300ms of synchronous work
}`,
      options: ["بعد 300ms تقريباً", "بعد 10ms، فالمؤقت دقيق", "لا يُطبع أبداً"],
      answer: 0,
      why: "المؤقت ينضج بعد 10ms، لكن callback يعمل على الخيط الرئيسي، والخيط مشغول بالحلقة. الحلقة لا تصل إلى مرحلة timers حتى يفرغ المكدّس. رقم المؤقت هو أقل انتظار، لا موعد مضمون. والطلبات الواردة كلها تنتظر معه.",
      scene: mini(
        `setTimeout(cb, 10);
while (Date.now() - start < 300) {}`,
        [
          { line: 1, say: "المؤقت يُسجَّل في timers: موعده بعد 10ms.", memory: [box("timers", "[cb @10ms]"), box("call stack", "main")] },
          { line: 2, say: "الحلقة المتزامنة تشغل المكدّس. عند 10ms المؤقت جاهز، لكن لا أحد يأخذه.", memory: [box("timers", "[cb ready]"), box("call stack", "main (busy)")] },
          { line: 1, say: "عند 300ms يفرغ المكدّس، فتدور الحلقة إلى timers: fired 300ms.", memory: [box("timers", "[]"), box("call stack", "cb"), box("stdout", "fired 300ms")] },
        ],
      ),
    },
  ],
  code: {
    intro: "مجموعة خيوط libuv بساعة افتراضية: كل مهمة تنتظر أول خيط يفرغ. غيّر POOL_SIZE إلى 2 ثم 8 وراقب متى ينتهي كل تشفير، ثم قارن بالنسخة المتزامنة التي تشغل الخيط الرئيسي.",
    runnerStarter: `// libuv's thread pool with a virtual clock. In Node: crypto.pbkdf2, fs.*, zlib and dns.lookup run here,
// and the size is UV_THREADPOOL_SIZE (default 4), read once when the pool starts.
const POOL_SIZE = 4;
const jobs = [1, 2, 3, 4, 5, 6].map((n) => ({ name: "hash#" + n, ms: 100 }));

function runPool(jobs, size) {
  const freeAt = new Array(size).fill(0); // when each thread becomes free
  return jobs.map((job) => {
    // the job waits in the queue until the earliest thread is free
    const thread = freeAt.indexOf(Math.min(...freeAt));
    const start = freeAt[thread];
    freeAt[thread] = start + job.ms;
    return { ...job, thread, start, end: freeAt[thread] };
  });
}

const timeline = runPool(jobs, POOL_SIZE);
for (const j of timeline) {
  const bar = " ".repeat(j.start / 20) + "#".repeat(j.ms / 20);
  console.log(\`\${j.name} thread \${j.thread} \${String(j.start).padStart(3)}-\${String(j.end).padStart(3)}ms |\${bar}\`);
}
const asyncDone = Math.max(...timeline.map((j) => j.end));
console.log("async: all done at " + asyncDone + "ms, main thread free the whole time");

// pbkdf2Sync runs the same work on the main thread, one after another.
const syncDone = jobs.reduce((t, j) => t + j.ms, 0);
console.log("sync:  all done at " + syncDone + "ms, every request waits until then");
// try: POOL_SIZE = 2, then 8. (In real Node, 8 helps only if the machine has the cores.)
`,
  },
  exercises: [
    {
      kind: "order",
      title: "من يعمل أولاً",
      prompt: "رتّب الأسطر حتى يُطبع A ثم B ثم C ثم D.",
      lines: [
        'console.log("A");',
        'setTimeout(() => console.log("D"), 0);',
        'Promise.resolve().then(() => console.log("C"));',
        'console.log("B");',
      ],
      expected: "A\nB\nC\nD",
    },
    {
      kind: "fill",
      title: "حجم المجموعة",
      prompt: "ثمانية تشفيرات، كل واحد 100ms. ما حجم مجموعة الخيوط الافتراضي في Node، الذي يجعلها تنتهي عند 200ms؟",
      template: `const POOL_SIZE = ___;
const jobs = 8;
const msEach = 100;
const rounds = Math.ceil(jobs / POOL_SIZE);
console.log(rounds * msEach + "ms");`,
      options: ["4", "2", "8"],
      expected: "200ms",
    },
    {
      kind: "fix",
      title: "دع الخادم يتنفس",
      prompt: "processAll تعمل على كل العناصر دفعة واحدة، فيتأخر ping حتى تنتهي. اجعلها تفسح المجال بعد كل عنصر، حتى يُطبع: work 1 ثم ping ثم work 2 ثم work 3. (في Node الحقيقي تُستعمل setImmediate لهذا.)",
      code: `function processAll(items) {
  for (const item of items) {
    console.log("work " + item);
  }
}
setTimeout(() => console.log("ping"), 0);
processAll([1, 2, 3]);`,
      expected: "work 1\nping\nwork 2\nwork 3",
      hint: "اجعل الدالة async، وبعد كل عنصر انتظر مؤقتاً: await new Promise((resolve) => setTimeout(resolve, 0)). كل انتظار يعيد الخيط إلى الحلقة، فيعمل ما ينتظر.",
      solution: `async function processAll(items) {
  for (const item of items) {
    console.log("work " + item);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}
setTimeout(() => console.log("ping"), 0);
processAll([1, 2, 3]);`,
    },
    {
      kind: "write",
      title: "كم بايتاً؟",
      prompt: "Buffer يعدّ البايتات بترميز UTF-8، لا الأحرف. اكتب utf8Length(text): الحرف حتى U+007F بايت واحد، وحتى U+07FF بايتان (الحروف العربية هنا)، وحتى U+FFFF ثلاثة، وما فوقه أربعة. يُطبع 3 8 4.",
      starter: `// write utf8Length(text): what Buffer.byteLength(text) returns

console.log(utf8Length("abc"), utf8Length("سلام"), utf8Length("😀"));`,
      expected: "3 8 4",
      hint: "for (const ch of text) يمرّ على المحارف كاملة (الرمز التعبيري محرف واحد هنا). ch.codePointAt(0) يعطي رقمه، فقارنه بـ 0x7f و 0x7ff و 0xffff.",
      solution: `function utf8Length(text) {
  let bytes = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code <= 0xffff) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

console.log(utf8Length("abc"), utf8Length("سلام"), utf8Length("😀"));`,
    },
  ],
  quiz: [
    {
      question: "resize تحسب البكسلات بـ JavaScript خالصة وتأخذ 2 ثانية. هل تحرّر async الخادم أثناءها؟",
      code: "async function resize(image) {\n  for (let i = 0; i < image.pixels.length; i++) {\n    image.pixels[i] = blend(image.pixels[i]);\n  }\n  return image;\n}",
      options: [
        "لا: async لا تنقل العمل إلى خيط آخر، والحل worker_threads",
        "نعم: كل دالة async تعمل في الخلفية",
        "نعم إذا استُدعيت بـ await",
      ],
      answer: 0,
      why: "async تغيّر ما تعيده الدالة (وعداً)، لا مكان تنفيذها. الحلقة تعمل على الخيط الرئيسي حتى آخرها. عمل JavaScript ثقيل يحتاج خيطاً آخر بمحرّك V8 خاص به: new Worker من node:worker_threads، يتبادل معه الرسائل بـ postMessage.",
    },
    {
      question: "الخادم يستقبل 1000 اتصال HTTP في اللحظة نفسها، والمجموعة 4 خيوط. ماذا يحدث؟",
      code: 'http.createServer((req, res) => res.end("ok")).listen(3000);',
      options: [
        "تُخدم كلها: المقابس لا تمر بمجموعة الخيوط، بل يراقبها نظام التشغيل",
        "تُخدم 4 في كل مرة، والبقية تنتظر",
        "يرفض Node ما زاد على 4",
      ],
      answer: 0,
      why: "libuv تسجّل كل مقبس عند النظام (epoll في Linux)، وفي مرحلة poll تسأل: من صار جاهزاً؟ ثم تشغّل callbacks الجاهزة على الخيط الرئيسي. لهذا يخدم Node آلاف الاتصالات بخيط واحد ما دام كل callback قصيراً.",
    },
    {
      question: "شُغّل الخادم بـ PORT=3000. ماذا يُطبع؟",
      code: "const next = process.env.PORT + 1;\nconsole.log(next);",
      options: ["30001", "3001", "NaN"],
      answer: 0,
      why: "متغيرات البيئة تصل نصوصاً دائماً، فـ + تلصق. حوّلها مرة واحدة عند البدء وتحقق منها: const port = Number(process.env.PORT)، ثم ارفض التشغيل إن كانت NaN.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'const text = "سلام";\nconsole.log(text.length, Buffer.from(text).length);',
      options: ["4 8", "4 4", "8 8"],
      answer: 0,
      why: "طول النص يعدّ وحدات UTF-16 (حرف عربي = وحدة)، و Buffer يحمل بايتات UTF-8 الخام (حرف عربي = بايتان). حدود الحجم في الشبكة والملفات بالبايت، فاحسبها بـ Buffer.byteLength لا بـ length.",
    },
    {
      question: "هل يُطبع hi؟",
      code: 'function again() {\n  process.nextTick(again);\n}\nagain();\nsetTimeout(() => console.log("hi"), 0);',
      options: ["لا: طابور nextTick لا يفرغ أبداً فلا تصل الحلقة إلى timers", "نعم بعد 0ms", "نعم، بعد أن يمتلئ المكدّس"],
      answer: 0,
      why: "Node يفرّغ طابور nextTick حتى آخره قبل أي مرحلة، و again تضيف نفسها كل مرة، فلا يفرغ. المكدّس لا يمتلئ لأن كل استدعاء ينتهي قبل التالي. لو استعملت setImmediate لدارت الحلقة بين كل استدعاء واستدعاء.",
    },
  ],
  next: "js-security",
};
