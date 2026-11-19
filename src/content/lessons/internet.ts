import type { Cell, Lesson } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
const empty = (name: string): Cell => ({ name, value: "undefined", type: "none" });

const addr = [s("from", "192.168.1.5:51000"), s("to", "93.184.216.34:443")];

export const internet: Lesson = {
  slug: "internet",
  stage: 5,
  number: "5.1",
  title: "الإنترنت والحزم",
  subtitle: "رسالتك تُقطَّع إلى حزم مرقّمة، وكل حزمة تجد طريقها وحدها",
  minutes: 15,
  singleLanguage: true,
  problem: {
    title: "لا يوجد سلك بينك وبين الخادم",
    body: "هذه خريطة موجّهات. أرسل رسالة وشاهدها تتقطّع إلى حزم مرقّمة تسلك طرقاً مختلفة. ثم اضغط على أي خط لتقطعه أثناء الطريق، وراقب ماذا يحدث للحزمة الضائعة.",
    demo: "internet",
  },
  scene: {
    code: {
      text: `you:    192.168.1.5    port 51000
server: 93.184.216.34  port 443
"HELLO WORLD" -> #1 "HELL"  #2 "O WO"  #3 "RLD"
#2: you -> R1 -> R4 -> server
#1: you -> R2 -> R5 -> server
#3: you -> R1 -> R4 -X  (link down, lost)
server: has #1 #2, no #3 -> "send #3 again"
#3: you -> R2 -> R5 -> server
#1 + #2 + #3 = "HELLO WORLD" -> program on port 443`,
    },
    notes: {
      text: "هذا ليس برنامجاً يُشغَّل، بل سجلّ رحلة رسالة واحدة عبر الإنترنت. كل سطر حدث واحد، والأدراج على اليمين هي ما يعرفه الطرفان بعد الحدث.",
    },
    steps: [
      {
        line: null,
        say: "الإنترنت ليس سلكاً واحداً بينك وبين الخادم، بل ملايين الموجّهات (راوترات) متصلة ببعضها: رسم بياني ضخم كالذي رسمناه في درس الرسم البياني. الرسالة تقفز من موجّه إلى جاره حتى تصل.",
        memory: [],
      },
      {
        line: 1,
        say: "جهازك له عنوان IP، مثل عنوان بيت في شارع. والرقم 51000 منفذ (port) اختاره جهازك لهذه المحادثة، ليعرف أي برنامج عنده ينتظر الرد.",
        memory: [addr[0]],
        changed: ["from"],
      },
      {
        line: 2,
        say: "للخادم عنوانه أيضاً. الـ IP يوصلك إلى الجهاز، والمنفذ 443 يختار البرنامج داخله: خادم الويب. جهاز واحد فيه برامج كثيرة، ولكل برنامج منفذه.",
        memory: addr,
        changed: ["to"],
      },
      {
        line: 3,
        say: "الرسالة لا تُرسل قطعة واحدة. تُقطَّع إلى حزم صغيرة، وعلى كل حزمة رقمها وعنوان الوجهة. عند الخادم ثلاث خانات فارغة تنتظر.",
        memory: [...addr, empty("#1"), empty("#2"), empty("#3")],
        changed: ["#1", "#2", "#3"],
      },
      {
        line: 4,
        say: "الحزمة #2 تخرج أولاً. كل موجّه لا يعرف الطريق كله؛ يعرف فقط أي جار أقرب إلى الوجهة، فيدفعها خطوة. وصلت #2 قبل #1!",
        memory: [...addr, empty("#1"), s("#2", "O WO"), empty("#3")],
        changed: ["#2"],
      },
      {
        line: 5,
        say: "الحزمة #1 سلكت طريقاً آخر تماماً عبر R2 و R5، ووصلت بعد #2. لا بأس: الرقم على الحزمة يقول أين مكانها.",
        memory: [...addr, s("#1", "HELL"), s("#2", "O WO"), empty("#3")],
        changed: ["#1"],
      },
      {
        line: 6,
        say: "الرابط بين R4 والخادم انقطع والحزمة #3 في الطريق. ضاعت. الإنترنت نفسه لا يعيدها، ولا أحد يخبرك فوراً.",
        memory: [...addr, s("#1", "HELL"), s("#2", "O WO"), empty("#3")],
        error: "#3 lost",
      },
      {
        line: 7,
        say: "هنا يعمل TCP: الخادم يرى أن الخانة #3 فارغة بعد وقت، والمرسل لم يصله إيصال باستلامها، فيُعيد إرسالها.",
        memory: [...addr, s("#1", "HELL"), s("#2", "O WO"), empty("#3")],
        read: ["#3"],
      },
      {
        line: 8,
        say: "النسخة الجديدة من #3 تسلك طريقاً سليماً حول الرابط المقطوع. الشبكة رسم بياني فيه طرق كثيرة، فلا يوقفها رابط واحد.",
        memory: [...addr, s("#1", "HELL"), s("#2", "O WO"), s("#3", "RLD")],
        changed: ["#3"],
      },
      {
        line: 9,
        say: "اكتملت الخانات، فيضعها TCP بترتيب أرقامها ويسلّم الرسالة كاملة للبرنامج على المنفذ 443. البرنامج لا يرى حزماً ولا طرقاً، يرى HELLO WORLD فقط.",
        memory: [...addr, s("#1", "HELL"), s("#2", "O WO"), s("#3", "RLD"), s("message", "HELLO WORLD")],
        changed: ["message"],
        read: ["#1", "#2", "#3"],
      },
    ],
  },
  playground: {
    kind: "trace",
    intro: "محاكاة صغيرة: نقطّع الرسالة إلى حزم مرقّمة، ثم تصل بترتيب مختلف، ونضع كل حزمة في خانتها حسب رقمها كما يفعل TCP.",
    starter: `let message = "HELLO WORLD";
let packets = [];
for (let i = 0; i < message.length; i = i + 4) {
  packets.push({ n: packets.length + 1, data: message.slice(i, i + 4) });
}
// different routes: they arrive in a different order
let arrived = [packets[2], packets[0], packets[1]];
let slots = ["?", "?", "?"];
for (const p of arrived) {
  slots[p.n - 1] = p.data;
}
console.log(slots.join(""));`,
    challenges: [
      "غيّر ترتيب arrived إلى [packets[1], packets[2], packets[0]]. هل تتغيّر النتيجة؟ توقّع قبل أن تشغّل.",
      "احذف packets[0] من arrived (حزمة ضاعت). ماذا يُطبع؟ وأي خانة بقيت ?",
      "غيّر 4 إلى 3 في السطرين 3 و 4. كم حزمة تصير؟ (ستحتاج خانات أكثر في slots)",
      "بدّل الحلقة الثانية لتجمع p.data بترتيب الوصول بدل وضعها في الخانات. ماذا يحدث للرسالة؟",
    ],
  },
  predict: [
    {
      question: "الحزم وصلت بهذا الترتيب، ونجمعها كما وصلت دون النظر إلى أرقامها. ماذا يُطبع؟",
      code: `let arrived = [
  { n: 3, data: "RLD" },
  { n: 1, data: "HELL" },
  { n: 2, data: "O WO" }
];
let text = "";
for (const p of arrived) {
  text = text + p.data;
}
console.log(text);`,
      options: ["RLDHELLO WO", "HELLO WORLD", "خطأ يوقف البرنامج"],
      answer: 0,
      why: "الحزم سلكت طرقاً مختلفة فوصلت بترتيب مختلف. من يجمعها بترتيب الوصول يحصل على كلام مقلوب. لهذا تحمل كل حزمة رقماً، ويعيد TCP ترتيبها قبل أن يسلّمها للبرنامج.",
    },
    {
      question: "وصلت الحزم 1 و 2 و 4 من خمس حزم. ماذا يطبع المستقبِل؟",
      code: `let received = [1, 2, 4];
for (let n = 1; n <= 5; n++) {
  if (!received.includes(n)) {
    console.log("resend", n);
  }
}`,
      options: ["resend 3 ثم resend 5", "resend 3 فقط", "لا شيء، الحزم وصلت"],
      answer: 0,
      why: "الأرقام هي ما يكشف الضائع: المستقبِل يعرف أن الرسالة خمس حزم، فكل رقم غائب يُطلب من جديد. الحزمة 5 الأخيرة ضائعة أيضاً، لا الوسطى فقط.",
    },
    {
      question: "كل موجّه يعرف جاره التالي فقط نحو الخادم. كم قفزة تقطعها الحزمة؟",
      code: `let nextHop = { you: "R1", R1: "R3", R3: "R6", R6: "server" };
let at = "you";
let hops = 0;
while (at !== "server") {
  at = nextHop[at];
  hops = hops + 1;
}
console.log(hops);`,
      options: ["4", "1", "3"],
      answer: 0,
      why: "لا أحد يحمل الخريطة كلها. كل موجّه يسلّم الحزمة لجاره التالي فقط: you ثم R1 ثم R3 ثم R6 ثم server. أربع قفزات، كل قفزة قرار صغير في موجّه واحد.",
    },
  ],
  code: {
    intro: "هنا تخرج الحزم بترتيب عشوائي في كل تشغيل، وتضيع واحدة أحياناً. شغّل أكثر من مرة: الترتيب يتغيّر، والرسالة النهائية لا تتغيّر لأن الضائع يُعاد والكل يُرتَّب بالأرقام. وفي الطرفية الحقيقية جرّب: traceroute example.com (أو tracert في ويندوز) لترى الموجّهات التي تمر بها حزمك.",
    runnerStarter: `let message = "HELLO WORLD, FROM RIYADH";
let size = 5;
let packets = [];
for (let i = 0; i < message.length; i = i + size) {
  packets.push({ n: packets.length + 1, data: message.slice(i, i + size) });
}

// Each packet takes its own route: shuffle the arrival order
let arrived = packets.slice();
for (let i = arrived.length - 1; i > 0; i--) {
  let j = Math.floor(Math.random() * (i + 1));
  let t = arrived[i]; arrived[i] = arrived[j]; arrived[j] = t;
}
// Sometimes one is lost on the way
let lost = Math.random() < 0.5 ? arrived.pop() : null;
console.log("arrival order:", arrived.map((p) => p.n).join(" "));

let slots = packets.map(() => null);
for (const p of arrived) slots[p.n - 1] = p.data;
for (let k = 0; k < slots.length; k++) {
  if (slots[k] === null) {
    console.log("missing #" + (k + 1) + ", asking again");
    slots[k] = packets[k].data; // TCP resend
  }
}
console.log(slots.join(""));
// جرّب: غيّر size إلى 2. كم حزمة صارت؟
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "رحلة رسالة",
      prompt: "رتّب ما يحدث لرسالة من لحظة إرسالها حتى يقرأها البرنامج.",
      lines: [
        "split the message into numbered packets",
        "each router passes each packet to its next hop",
        "the receiver notices a missing number",
        "the sender sends that packet again",
        "packets are put back in order by number",
        "the program on the port gets the whole message",
      ],
      expected: "",
    },
    {
      kind: "fill",
      lang: "text",
      title: "أي برنامج؟",
      prompt: "الحزمة وصلت إلى الجهاز الصحيح بالـ IP. ما الذي يحدّد أي برنامج في الجهاز يستلمها؟",
      template: "93.184.216.34 : ___  -> web server program",
      options: ["443", "192.168.1.5", "#3"],
      answer: "443",
      expected: "443",
    },
    {
      kind: "fix",
      title: "رسالة مقلوبة",
      prompt: "المستقبِل يجمع الحزم بترتيب وصولها فتخرج الرسالة مقلوبة. أصلحه ليضع كل حزمة في خانة رقمها، فيطبع HELLO WORLD.",
      code: `let arrived = [
  { n: 2, data: "O WO" },
  { n: 3, data: "RLD" },
  { n: 1, data: "HELL" }
];
let slots = ["", "", ""];
for (let k = 0; k < arrived.length; k++) {
  slots[k] = arrived[k].data;
}
console.log(slots.join(""));`,
      expected: "HELLO WORLD",
      hint: "مكان الحزمة يحدّده رقمها n، لا موقعها في قائمة الوصول. الحزمة رقم 1 تذهب إلى الخانة 0.",
      solution: `let arrived = [
  { n: 2, data: "O WO" },
  { n: 3, data: "RLD" },
  { n: 1, data: "HELL" }
];
let slots = ["", "", ""];
for (let k = 0; k < arrived.length; k++) {
  slots[arrived[k].n - 1] = arrived[k].data;
}
console.log(slots.join(""));`,
    },
    {
      kind: "write",
      title: "قطّع الرسالة",
      prompt: "قطّع message إلى حزم من 3 حروف، واطبع كل حزمة في سطر برقمها: #1 SAU ثم #2 DI ثم... حتى النهاية.",
      starter: `let message = "SAUDI";
// اطبع: #1 SAU  ثم  #2 DI
`,
      expected: "#1 SAU\n#2 DI",
      hint: "حلقة تبدأ من 0 وتزيد 3 كل مرة، و message.slice(i, i + 3) يعطي القطعة. رقم الحزمة يزيد واحداً كل دورة.",
      solution: `let message = "SAUDI";
let n = 1;
for (let i = 0; i < message.length; i = i + 3) {
  console.log("#" + n, message.slice(i, i + 3));
  n = n + 1;
}`,
    },
  ],
  quiz: [
    {
      question: "أُرسلت الحزم #1 ثم #2 ثم #3، فوصلت إلى الخادم بالترتيب #3 ثم #1 ثم #2. ماذا يستلم البرنامج على المنفذ 443؟",
      options: ["الرسالة بترتيبها الأصلي #1 #2 #3", "الحزم بترتيب وصولها #3 #1 #2", "لا شيء، فالترتيب خطأ"],
      answer: 0,
      why: "TCP ينتظر الحزم في خانات مرقّمة ويسلّمها للبرنامج بترتيب أرقامها. ترتيب الوصول تفصيل من تفاصيل الطرق، لا يراه البرنامج.",
    },
    {
      question: "جهاز واحد عنوانه 10.0.0.7 يشغّل خادم ويب على 443 وخادم بريد على 25. وصلت حزمة إلى 10.0.0.7:25. من يستلمها؟",
      options: ["خادم البريد", "خادم الويب", "الاثنان معاً"],
      answer: 0,
      why: "الـ IP أوصلها إلى البيت الصحيح، والمنفذ رقم الغرفة. 25 هو باب خادم البريد، فلا يراها خادم الويب أبداً.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'let slots = ["HELL", "?", "RLD"];\nlet got = { n: 2, data: "O WO" };\nslots[got.n - 1] = got.data;\nconsole.log(slots.join(""));',
      options: ["HELLO WORLD", "HELLRLDO WO", "HELL?RLD"],
      answer: 0,
      why: "الحزمة المعادة تحمل رقمها 2، فتسقط في الخانة 1 (الثانية) مكان علامة ?، ولو وصلت آخر الكل. الرقم لا ترتيب الوصول هو ما يحدد المكان.",
    },
    {
      question: "أثناء التحميل انقطع رابط بين موجّهين على الطريق. ماذا يحدث غالباً؟",
      options: ["الحزم التالية تسلك طريقاً آخر، والضائعة يعيد TCP إرسالها", "يتوقف التحميل حتى يُصلح الرابط", "تصل الرسالة ناقصة"],
      answer: 0,
      why: "الإنترنت رسم بياني فيه طرق كثيرة بين أي نقطتين. الموجّهات تتجاوز الرابط الميت، وما ضاع عليه يكتشفه TCP من الأرقام الناقصة فيعيد إرساله.",
    },
    {
      question: "ماذا يُطبع؟",
      code: 'let nextHop = { you: "R2", R2: "R5", R5: "R7", R7: "server" };\nlet at = "you";\nlet path = at;\nwhile (at !== "server") {\n  at = nextHop[at];\n  path = path + ">" + at;\n}\nconsole.log(path);',
      options: ["you>R2>R5>R7>server", "you>server", "server"],
      answer: 0,
      why: "كل موجّه يعرف جاره التالي فقط، فتقفز الحزمة قفزة قفزة: من you إلى R2 إلى R5 إلى R7 حتى server. الطريق كله لم يكن مكتوباً في مكان واحد.",
    },
  ],
  next: "dns",
};
