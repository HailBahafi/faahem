import type { Cell, Lesson, Scene } from "@/lib/types";

const s = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });
/** The scene's two drawers: the image's stacked layers, and the containers running from it. */
const dk = (layers: string, containers: string): Cell[] => [s("image", layers), s("containers", containers)];

const mini = (code: string, steps: Scene["steps"]): Scene => ({ code: { shell: code }, steps });

const RECIPE = ["FROM node:22-alpine", "WORKDIR /app", "COPY package*.json ./", "RUN npm ci", "COPY . .", 'CMD ["node", "server.js"]'];
const RUNNING = [...RECIPE, "a1b2c3d4"];
const PS = [...RUNNING, "a1b2c3d4  shop  Up 3 seconds  0.0.0.0:3000->3000/tcp"];
const ALL = "FROM | WORKDIR | COPY pkg | npm ci | COPY code | CMD";

export const docker: Lesson = {
  slug: "docker",
  stage: 11,
  number: "11.2",
  title: "Docker",
  subtitle: "«يعمل على جهازي» لن تقولها بعد اليوم: احمل جهازك كله داخل صورة، وشغّلها في أي مكان",
  minutes: 16,
  singleLanguage: true,
  problem: {
    title: "ابنِ مرة، شغّل في كل مكان",
    body: "على اليسار وصفة Dockerfile. اضغط «ابنِ» وراقب الطبقات تتراكم. ثم عدّل الكود وابنِ ثانية: أي الطبقات أُعيد بناؤها؟ بعدها شغّل حاويات من الصورة، واقتل واحدة، واحمِ بيانات قاعدة البيانات بـ volume.",
    demo: "docker",
  },
  scene: {
    code: {
      shell: `$ cat Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node", "server.js"]
$ docker build -t shop .
$ docker run -d -p 3000:3000 shop
a1b2c3d4
$ docker ps
a1b2c3d4  shop  Up 3 seconds  0.0.0.0:3000->3000/tcp`,
    },
    notes: {
      shell: "Dockerfile واحد لأي لغة: FROM python:3.13 ثم RUN pip install -r requirements.txt، أو FROM golang ثم RUN go build، والفكرة نفسها. أمثلة حقيقية: انظر Dockerfile هذا الموقع نفسه.",
    },
    steps: [
      {
        line: null,
        say: "متجرك يعمل على حاسوبك، ويتعطّل على الخادم: هناك Node 18 لا 22، ومكتبة نظام ناقصة، وملف إعداد مختلف. الحواسيب تختلف، والبرنامج يعتمد على أكثر من كوده.",
        memory: dk("(none)", "(none)"),
      },
      {
        line: 1,
        say: "الحل: لا ترسل الكود وحده، بل كل ما يحتاجه. ملف Dockerfile وصفة لهذا: كل سطر خطوة تضيف شيئاً.",
        memory: dk("(none)", "(none)"),
        output: RECIPE,
      },
      {
        line: 8,
        say: "docker build يقرأ الوصفة سطراً سطراً، وينفّذ كل سطر ويحفظ نتيجته «طبقة»: لقطة مجمّدة للملفات التي أضافها. الطبقات فوق بعضها هي الصورة image، واسمها هنا shop.",
        memory: dk("(building)", "(none)"),
        output: RECIPE,
      },
      {
        line: 2,
        say: "FROM: ابدأ من صورة جاهزة: ملفات نظام Linux صغير (Alpine) ومعه Node 22 مثبّتاً. هذه الطبقة الأولى، ولا تحتاج أن تبنيها بنفسك.",
        memory: dk("FROM", "(none)"),
        changed: ["image"],
        output: RECIPE,
      },
      {
        line: 4,
        say: "WORKDIR يختار المجلد /app داخل الصورة. ثم COPY ينسخ package.json و package-lock.json فقط من حاسوبك إلى الصورة: طبقة جديدة صغيرة.",
        memory: dk("FROM | WORKDIR | COPY pkg", "(none)"),
        changed: ["image"],
        output: RECIPE,
      },
      {
        line: 5,
        say: "RUN npm ci يشغّل أمراً داخل الصورة: ينزّل الحزم من القفل (درس مدير الحزم). أبطأ طبقة وأثقلها، وتُحفظ مثل غيرها.",
        memory: dk("FROM | WORKDIR | COPY pkg | npm ci", "(none)"),
        changed: ["image"],
        output: RECIPE,
      },
      {
        line: 6,
        say: "الآن فقط ينسخ بقية الكود. ثم CMD لا يبني شيئاً: يكتب على الصورة «عندما تُشغَّل، شغّل node server.js».",
        memory: dk(ALL, "(none)"),
        changed: ["image"],
        output: RECIPE,
      },
      {
        line: 8,
        say: "عدّلت server.js وبنيت ثانية. Docker يقارن كل سطر ومدخلاته بالمحفوظ: الطبقات الأربع الأولى لم تتغيّر فتؤخذ من الذاكرة المؤقتة cache فوراً. أول تغيير عند COPY . . ، فيُبنى من هناك فقط. لهذا نسخنا package.json وحده قبل npm ci.",
        memory: dk(ALL, "(none)"),
        read: ["image"],
        output: RECIPE,
      },
      {
        line: 9,
        say: "docker run يصنع من الصورة حاوية container: نسخة تعمل منها، في صندوق معزول له ملفاته وشبكته. الصورة لا تتغيّر أبداً؛ الحاوية تكتب فوقها في طبقة خاصة بها. و -p 3000:3000 يصل منفذ الخادم بمنفذ الحاوية.",
        memory: dk(ALL, "a1b2c3d4 (running)"),
        changed: ["containers"],
        output: RUNNING,
      },
      {
        line: 11,
        say: "docker ps يعرض الحاويات العاملة. بدأت في ثوانٍ لأنها ليست حاسوباً كاملاً: عملية Linux معزولة تشارك نواة الخادم. من الصورة نفسها تشغّل عشر حاويات إن شئت.",
        memory: dk(ALL, "a1b2c3d4 (running)"),
        read: ["containers"],
        output: PS,
      },
      {
        line: 12,
        say: "الحاوية تُرمى وتُستبدل بلا حزن، ومعها كل ما كتبته داخلها. لهذا تحتاج قاعدة البيانات volume: مجلد خارج الحاوية تبقى فيه البيانات. و docker compose يشغّل التطبيق وقاعدته معاً بأمر واحد.",
        memory: dk(ALL, "a1b2c3d4 (running)"),
        output: PS,
      },
    ],
  },
  playground: {
    kind: "trace",
    intro: "هذه ذاكرة البناء المؤقتة بلغة تعرفها: Docker يمشي على الوصفة سطراً سطراً ويقارنه بما بناه آخر مرة. ما دام كل شيء مطابقاً يأخذ الطبقة جاهزة، وعند أول اختلاف يبني ذلك السطر وكل ما بعده.",
    starter: `let recipe = ["FROM node", "COPY package.json", "RUN npm ci", "COPY src v2", "CMD node"];
let cache = ["FROM node", "COPY package.json", "RUN npm ci", "COPY src v1", "CMD node"];
let reuse = true;
let built = 0;
for (let i = 0; i < recipe.length; i++) {
  if (reuse && cache[i] === recipe[i]) {
    console.log("CACHED " + recipe[i]);
  } else {
    reuse = false;
    built = built + 1;
    console.log("BUILD  " + recipe[i]);
  }
}
console.log(built + " layers rebuilt");`,
    challenges: [
      "قبل أن تشغّل: الكود تغيّر (v1 صارت v2). كم طبقة ستُبنى؟ لاحظ أن CMD مطابق، فهل يُؤخذ من الذاكرة؟",
      "أضفت حزمة جديدة: غيّر \"COPY package.json\" في recipe إلى \"COPY package.json v2\". كم طبقة تُبنى الآن؟ ومنها npm ci البطيئة.",
      "اجعل recipe و cache متطابقتين تماماً. هذا بناء ثانٍ بلا تغيير: كم يأخذ؟",
      "احذف السطر reuse = false وشغّل. لماذا صار الجواب خاطئاً؟ الطبقة مبنية فوق التي تحتها، فإن تغيّرت السفلى لا يصح أخذ العليا من الذاكرة.",
    ],
  },
  predict: [
    {
      question: "عدّلت سطراً في server.js فقط ثم بنيت. أي الخطوات تُنفَّذ من جديد؟",
      code: `$ cat Dockerfile
FROM node:22-alpine
COPY package*.json ./
RUN npm ci
COPY . .
$ docker build -t shop .`,
      scene: mini(
        `$ cat Dockerfile
FROM node:22-alpine
COPY package*.json ./
RUN npm ci
COPY . .
$ docker build -t shop .
CACHED FROM, COPY package*.json, RUN npm ci
BUILD  COPY . .`,
        [
          { line: 1, say: "الوصفة: أربع طبقات، وكلها مبنية من قبل.", memory: dk("FROM | COPY pkg | npm ci | COPY code", "(none)"), output: ["FROM node:22-alpine", "COPY package*.json ./", "RUN npm ci", "COPY . ."] },
          { line: 6, say: "FROM لم يتغيّر، و package.json لم يتغيّر، فـ npm ci مدخلاته كما هي: الثلاث من الذاكرة.", memory: dk("FROM | COPY pkg | npm ci | COPY code", "(none)"), read: ["image"], output: ["FROM node:22-alpine", "COPY package*.json ./", "RUN npm ci", "COPY . .", "CACHED FROM, COPY package*.json, RUN npm ci"] },
          { line: 8, say: "COPY . . ينسخ server.js، وقد تغيّر: هنا أول اختلاف، فتُبنى هذه الطبقة وما بعدها.", memory: dk("FROM | COPY pkg | npm ci | COPY code (new)", "(none)"), changed: ["image"], output: ["FROM node:22-alpine", "COPY package*.json ./", "RUN npm ci", "COPY . .", "CACHED FROM, COPY package*.json, RUN npm ci", "BUILD  COPY . ."] },
        ],
      ),
      options: ["كل الخطوات من FROM", "من COPY . . فقط", "RUN npm ci و COPY . ."],
      answer: 1,
      why: "Docker يعيد البناء من أول سطر تغيّرت مدخلاته. server.js يدخل في COPY . . وحدها، و npm ci لا ترى إلا package.json. لهذا ترتيب الوصفة: ما يتغيّر نادراً أولاً، والكود آخراً.",
    },
    {
      question: "حاويتان من الصورة نفسها. كتبت ملفاً في الأولى. ماذا يطبع البرنامج؟",
      code: `let image = { files: ["server.js"] };
function run(name) {
  return { name: name, image: image, extra: [] };
}
let a = run("a");
let b = run("b");
a.extra.push("log.txt");
console.log(b.extra.length);
console.log(a.image === b.image);`,
      options: ["1 ثم false", "0 ثم true", "1 ثم true"],
      answer: 1,
      why: "الحاويتان تشيران إلى الصورة نفسها (مرجع واحد، لا نسختان)، ولكل واحدة طبقة كتابة خاصة بها. ما كتبته a لا تراه b، والصورة لم تتغيّر.",
    },
    {
      question: "حاوية قاعدة بيانات بلا volume، فيها 50 مستخدماً. حذفتها وشغّلت واحدة جديدة من الصورة نفسها. كم مستخدماً؟",
      code: `$ docker exec db psql -c "select count(*) from users"
50
$ docker rm -f db
$ docker run -d --name db postgres:17
$ docker exec db psql -c "select count(*) from users"`,
      scene: mini(
        `$ docker exec db psql -c "select count(*) from users"
50
$ docker rm -f db
$ docker run -d --name db postgres:17
$ docker exec db psql -c "select count(*) from users"
ERROR: relation "users" does not exist`,
        [
          { line: 1, say: "البيانات مكتوبة داخل الحاوية، في طبقتها الخاصة.", memory: dk("postgres:17", "db (50 users)"), read: ["containers"], output: ["50"] },
          { line: 3, say: "rm تحذف الحاوية وطبقتها، ومعها كل ما كُتب فيها.", memory: dk("postgres:17", "(none)"), changed: ["containers"], output: ["50"] },
          { line: 4, say: "الحاوية الجديدة تبدأ من الصورة كما هي: قاعدة فارغة.", memory: dk("postgres:17", "db (empty)"), changed: ["containers"], output: ["50"] },
          { line: 5, say: "لا جدول أصلاً. لو شغّلناها بـ -v pgdata:/var/lib/postgresql/data لبقيت البيانات في الـ volume خارج الحاوية.", memory: dk("postgres:17", "db (empty)"), error: 'relation "users" does not exist', output: ["50", 'ERROR: relation "users" does not exist'] },
        ],
      ),
      options: ["50: الصورة نفسها", "لا شيء: الجدول نفسه غير موجود", "25: نصفها يبقى في الـ cache"],
      answer: 1,
      why: "الصورة مجمّدة لا تتغيّر، وكل ما يُكتب أثناء التشغيل يعيش في الحاوية ويموت معها. البيانات الدائمة مكانها volume: مجلد يُركّب داخل الحاوية ويعيش خارجها.",
    },
  ],
  code: {
    intro: "لا شيء يُشغَّل هنا: Docker يعمل على جهازك أو خادمك. ثبّت Docker Desktop وجرّب: docker run -it --rm alpine sh، فتجد نفسك في Linux صغير خلال ثانية. ثم اقرأ Dockerfile و docker-compose.yml لهذا الموقع: ستجد كل سطر من الدرس.",
    runnerStarter: "",
    runnerLang: "text",
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "وصفة سريعة البناء",
      prompt: "رتّب أسطر Dockerfile بحيث يعيد تعديلُ server.js بناءَ طبقة واحدة فقط، ولا تُعاد npm ci إلا إذا تغيّرت الحزم.",
      lines: ["FROM node:22-alpine", "WORKDIR /app", "COPY package*.json ./", "RUN npm ci", "COPY . .", 'CMD ["node", "server.js"]'],
      expected: "تعديل الكود يعيد بناء COPY . . فقط",
    },
    {
      kind: "fill",
      lang: "text",
      title: "من أي باب؟",
      prompt: "التطبيق داخل الحاوية يستمع على المنفذ 3000، وتريد فتحه من المتصفح على localhost:8080. الصيغة: -p منفذ_الجهاز:منفذ_الحاوية.",
      template: "$ docker run -d -p ___ shop",
      options: ["8080:3000", "3000:8080", "3000:3000"],
      answer: "8080:3000",
      expected: "http://localhost:8080 -> container port 3000",
    },
    {
      kind: "fix",
      title: "ذاكرة بناء تكذب",
      prompt: "غيّرنا package.json، فيجب أن يُبنى كل ما بعده. لكن البرنامج يقول إن npm ci و COPY src من الذاكرة. أصلح الحلقة حتى يُبنى كل سطر بعد أول تغيير.",
      code: `let recipe = ["FROM node", "COPY package.json v2", "RUN npm ci", "COPY src"];
let cache = ["FROM node", "COPY package.json v1", "RUN npm ci", "COPY src"];
let reuse = true;
for (let i = 0; i < recipe.length; i++) {
  if (reuse && cache[i] === recipe[i]) {
    console.log("CACHED " + recipe[i]);
  } else {
    console.log("BUILD " + recipe[i]);
  }
}`,
      expected: "CACHED FROM node\nBUILD COPY package.json v2\nBUILD RUN npm ci\nBUILD COPY src",
      hint: "المتغير reuse لا يتغيّر أبداً. عند أول BUILD يجب أن يصير false، فلا يُؤخذ شيء بعده من الذاكرة.",
      solution: `let recipe = ["FROM node", "COPY package.json v2", "RUN npm ci", "COPY src"];
let cache = ["FROM node", "COPY package.json v1", "RUN npm ci", "COPY src"];
let reuse = true;
for (let i = 0; i < recipe.length; i++) {
  if (reuse && cache[i] === recipe[i]) {
    console.log("CACHED " + recipe[i]);
  } else {
    reuse = false;
    console.log("BUILD " + recipe[i]);
  }
}`,
    },
    {
      kind: "write",
      title: "الحاوية تموت، والـ volume يبقى",
      prompt: "شغّل ثلاث حاويات بالدور في حلقة (i من 1 إلى 3). كل حاوية جديدة كائن { files: [] }، تكتب \"user\" + i في ملفاتها وفي المصفوفة volume التي تعيش خارجها. اطبع عدد ملفات آخر حاوية، ثم عدد ما في الـ volume.",
      starter: `let volume = [];
let container = null;
// run 3 containers one after another; each writes "user" + i
// into its own files and into the volume
`,
      expected: "container files: 1\nvolume users: 3",
      hint: "داخل for (let i = 1; i <= 3; i++) اكتب container = { files: [] } ثم push في الاثنين. وبعد الحلقة اطبع container.files.length و volume.length.",
      solution: `let volume = [];
let container = null;
for (let i = 1; i <= 3; i++) {
  container = { files: [] };
  container.files.push("user" + i);
  volume.push("user" + i);
}
console.log("container files: " + container.files.length);
console.log("volume users: " + volume.length);`,
    },
  ],
  quiz: [
    {
      question: "شغّلت ثلاث حاويات من الصورة shop (حجمها 200 MB). كم تشغل الصورة على القرص؟",
      code: "$ docker run -d shop\n$ docker run -d shop\n$ docker run -d shop",
      options: ["600 MB: نسخة لكل حاوية", "200 MB مرة واحدة، ولكل حاوية طبقة كتابة صغيرة", "لا شيء حتى تتوقف الحاويات"],
      answer: 1,
      why: "الصورة مجمّدة للقراءة فقط، فتشترك فيها كل الحاويات. ما تكتبه كل حاوية يذهب إلى طبقتها الرقيقة الخاصة. لهذا تبدأ الحاوية في ثوانٍ.",
    },
    {
      question: "في هذه الوصفة عدّلت README.md فقط. هل تعود npm ci للعمل؟",
      code: "FROM node:22-alpine\nWORKDIR /app\nCOPY . .\nRUN npm ci",
      options: ["لا، README لا علاقة له بالحزم", "نعم: COPY . . تغيّرت، فكل ما بعدها يُبنى", "فقط إن كان README في package.json"],
      answer: 1,
      why: "COPY . . تنسخ كل الملفات ومنها README، فتتغيّر الطبقة، وكل طبقة فوقها تُبنى من جديد، ومنها npm ci البطيئة. انسخ package*.json وحدها أولاً.",
    },
    {
      question: "بأي عنوان يصل التطبيق إلى قاعدة البيانات؟",
      code: "services:\n  db:\n    image: postgres:17\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n  app:\n    build: .\n    depends_on: [db]",
      options: ["localhost:5432", "db:5432", "عنوان IP الخادم"],
      answer: 1,
      why: "compose يضع الحاويات في شبكة واحدة، وكل خدمة يصلها الباقون باسمها. داخل حاوية app، كلمة localhost تعني app نفسها لا db.",
    },
    {
      question: "كتبت docker rm -f على حاوية shop. ماذا يبقى؟",
      code: "$ docker rm -f a1b2c3d4\n$ docker images",
      options: ["الصورة shop باقية، وتشغّل منها حاوية جديدة متى شئت", "الصورة حُذفت مع الحاوية", "لا شيء، حتى FROM node"],
      answer: 0,
      why: "الصورة كالوصفة المطبوخة المجمّدة، والحاوية وجبة منها. رمي الوجبة لا يمسّ المجمّد. docker run يصنع حاوية جديدة في ثانية.",
    },
    {
      question: "شغّلت قاعدة البيانات بـ volume، ثم حذفت الحاوية وشغّلت أخرى بالـ volume نفسه. ماذا تجد؟",
      code: "$ docker run -d --name db -v pgdata:/var/lib/postgresql/data postgres:17\n$ docker rm -f db\n$ docker run -d --name db -v pgdata:/var/lib/postgresql/data postgres:17",
      options: ["قاعدة فارغة", "البيانات كما تركتها", "خطأ: الاسم db مستعمل"],
      answer: 1,
      why: "pgdata مجلد يعيش خارج أي حاوية، ويُركّب داخلها في المسار الذي تكتب فيه Postgres. الحاوية القديمة ماتت، والمجلد بقي، فالجديدة تجد البيانات.",
    },
  ],
  next: "ci-cd",
};
