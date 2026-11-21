import type { Cell, Lesson, Scene } from "@/lib/types";

const box = (name: string, value: string): Cell => ({ name, value, type: "none" });

/** A hand-written scene for a predict answer. */
const mini = (js: string, steps: Scene["steps"]): Scene => ({ code: { js }, steps });

const files = (pkg: string, lock: string, modules: string, dist = "—"): Cell[] => [
  box("package.json", pkg),
  box("package-lock.json", lock),
  box("node_modules", modules),
  box("dist", dist),
];

export const jsTooling: Lesson = {
  slug: "js-tooling",
  stage: 0,
  number: "4.2",
  title: "الأدوات والحزم",
  subtitle: "package.json يقول ماذا تريد، وملف القفل يقول ماذا ثُبّت بالضبط",
  minutes: 26,
  singleLanguage: true,
  problem: {
    title: "«يعمل على جهازي»",
    body: "مشروعك يعتمد على حزمة. اختر كيف تكتب نطاق نسختها، وهل تحفظ ملف القفل، ثم انشر نسخاً جديدة من الحزمة وثبّت على الخادم. متى يأخذ الخادم نسخة غير التي جرّبتها؟",
    demo: "jsTooling",
  },
  scene: {
    code: {
      shell: `npm init -y
npm install date-fns@^3.6.0
npm install --save-dev vitest eslint prettier
git add package.json package-lock.json
npm ci
npm test
npm run build`,
    },
    steps: [
      {
        line: null,
        say: "مشروعك يعتمد على حزم كتبها غيرك، وهي تعتمد على حزم أخرى: شجرة من مئات الحزم. ملفان يمسكانها: package.json فيه ما تريده (نطاقات)، و package-lock.json فيه ما ثُبّت فعلاً (نسخ محددة).",
        memory: files("—", "—", "—"),
      },
      {
        line: 1,
        say: "init ينشئ package.json: اسم المشروع ونسخته وسكربتاته. هو بطاقة تعريف المشروع، ولا توجد حزم بعد.",
        memory: files('{ name, version: "1.0.0" }', "—", "—"),
        changed: ["package.json"],
      },
      {
        line: 2,
        say: "npm يسأل السجل (registry) عن نسخ date-fns، ويختار أعلى نسخة يقبلها النطاق ^3.6.0، أي أي 3.x.y من 3.6.0 فصاعداً. يكتب النطاق في dependencies، والنسخة المختارة مع بصمة محتواها (integrity) في ملف القفل.",
        memory: files('deps: { "date-fns": "^3.6.0" }', "date-fns 3.6.0 sha512-…", "date-fns@3.6.0"),
        changed: ["package.json", "package-lock.json", "node_modules"],
      },
      {
        line: 3,
        say: "--save-dev تضعها في devDependencies: أدوات تحتاجها لتطوّر وتختبر، لا ليعمل البرنامج. vitest وحده يجرّ عشرات الحزم الفرعية، وملف القفل يسجّل كل واحدة منها بنسختها وموقعها في الشجرة.",
        memory: files("deps + devDeps: vitest, eslint, prettier", "212 packages, each pinned", "212 folders"),
        changed: ["package.json", "package-lock.json", "node_modules"],
      },
      {
        line: 4,
        say: "تحفظ الملفين في Git، ولا تحفظ node_modules (هي في .gitignore). مجلد الحزم يُبنى من جديد في أي جهاز من ملف القفل، فلا داعي لحمله.",
        memory: files("committed", "committed", "ignored by git"),
        changed: ["package.json", "package-lock.json"],
      },
      {
        line: 5,
        say: "بعد شهر، على خادم CI: نُشرت date-fns 3.7.0. لكن npm ci لا يحلّ النطاقات من جديد: يحذف node_modules ويثبّت ما في ملف القفل حرفياً، ويفشل إن اختلف الملفان. الخادم يحصل على الشجرة نفسها التي جرّبتها.",
        memory: files('deps: { "date-fns": "^3.6.0" }', "date-fns 3.6.0 (3.7.0 ignored)", "same 212 folders"),
        changed: ["node_modules"],
        read: ["package-lock.json"],
      },
      {
        line: 6,
        say: 'npm test يشغّل scripts.test، مثلاً "vitest run". قبل التشغيل يضيف npm المجلد node_modules/.bin إلى PATH، فتعمل نسخة vitest المثبتة في المشروع، لا نسخة عامة قد تختلف.',
        memory: files('scripts: { test: "vitest run" }', "unchanged", "same 212 folders"),
        read: ["package.json"],
      },
      {
        line: 7,
        say: "build يشغّل المجمّع (bundler مثل esbuild أو Vite). يبدأ من ملف الدخول ويتبع كل import: هذا رسم الوحدات (module graph). ثم يحذف ما لم يُستورد (tree shaking)، ويضغط الكود (minify)، ويكتب ملفاً واحداً صغيراً.",
        memory: files("unchanged", "unchanged", "same 212 folders", "app.min.js 38KB"),
        changed: ["dist"],
      },
      {
        line: null,
        say: "الصورة: النطاق في package.json نيّة، وملف القفل حقيقة. التحديث قرار تتخذه أنت: npm outdated يريك الجديد، و npm update يرفع داخل النطاقات، ثم تراجع تغيّر ملف القفل وتشغّل الاختبارات وتحفظه.",
        memory: files("intent: ranges", "truth: exact tree", "rebuilt from lockfile", "app.min.js 38KB"),
      },
    ],
    notes: {
      shell: "pnpm و yarn يفعلان الشيء نفسه بملف قفل باسم آخر (pnpm-lock.yaml و yarn.lock). القاعدة واحدة: مدير حزم واحد، وملف قفل واحد في المستودع، وأمر تثبيت صارم على الخوادم.",
    },
  },
  playground: {
    kind: "trace",
    intro: "هكذا يختار npm نسخة من نطاق: يقرأ النسخ المنشورة من الأقدم إلى الأحدث، ويحتفظ بآخر نسخة يقبلها النطاق. ^ تقبل أي تغيير لا يمسّ الرقم الأول (major)، و ~ تقبل تغيير الرقم الأخير (patch) فقط، والرقم المجرّد يقبل نفسه فقط.",
    starter: `function parse(version) {
  const parts = version.split(".");
  return { major: Number(parts[0]), minor: Number(parts[1]), patch: Number(parts[2]) };
}
function satisfies(version, range) {
  const op = range.slice(0, 1);
  if (op !== "^" && op !== "~") return version === range;
  const v = parse(version);
  const base = parse(range.slice(1));
  if (v.major !== base.major) return false;
  if (op === "~" && v.minor !== base.minor) return false;
  if (v.minor !== base.minor) return v.minor > base.minor;
  return v.patch >= base.patch;
}
const published = ["4.17.20", "4.17.21", "4.18.0", "5.0.0"];
const range = "^4.17.20";
let picked = "none";
for (const version of published) {
  if (satisfies(version, range)) picked = version;
}
console.log("npm installs " + picked);`,
    challenges: [
      "قبل التشغيل: اجعل النطاق ~4.17.20. أي نسخة تُثبّت؟",
      "اجعله 4.17.20 بلا رمز. ما الثمن؟ (إصلاح أمني في 4.17.21 لن يصلك.)",
      "اجعله ^5.0.0، ثم ^6.0.0. ماذا يطبع حين لا تقبل أي نسخة؟",
      "أضف \"4.17.22\" في آخر القائمة واجعل النطاق ^4.17.20. لماذا لم يتغيّر الجواب؟ (القائمة لم تعد مرتّبة: npm يرتّب النسخ قبل أن يختار.)",
    ],
  },
  predict: [
    {
      question: "لا يوجد ملف قفل. المنشور من الحزمة: 4.17.0 و 4.17.21 و 4.18.0 و 5.0.0. أي نسخة يثبّت npm install؟",
      code: `// package.json
"dependencies": {
  "csv-kit": "^4.17.0"
}`,
      options: ["4.18.0", "4.17.0", "5.0.0"],
      answer: 0,
      why: "^ تعني «متوافق مع 4.17.0»: أي نسخة 4.x.y لا تقل عنها. فيأخذ npm أعلاها، 4.18.0. أما 5.0.0 فرقمها الأول تغيّر، أي فيها تغيير كاسر، فلا تُقبل. وبلا ملف قفل، الجهاز الذي يثبّت غداً قد يأخذ 4.19.0.",
      scene: mini(
        `"csv-kit": "^4.17.0"`,
        [
          { line: 1, say: "النطاق ^4.17.0 يعني: من 4.17.0 حتى ما قبل 5.0.0.", memory: [box("range", ">=4.17.0 <5.0.0")] },
          { line: 1, say: "npm يمرّ على المنشور: 4.17.0 مقبولة، 4.17.21 مقبولة، 4.18.0 مقبولة، 5.0.0 مرفوضة.", memory: [box("range", ">=4.17.0 <5.0.0"), box("accepted", "4.17.0, 4.17.21, 4.18.0")] },
          { line: 1, say: "يختار أعلى المقبول: 4.18.0، ويسجّله في ملف القفل.", memory: [box("range", ">=4.17.0 <5.0.0"), box("installed", "4.18.0")] },
        ],
      ),
    },
    {
      question: "التطبيق يستورد add فقط. ماذا يبقى في الملف الذي يخرجه المجمّع؟",
      code: `// math.js
export function add(a, b) { return a + b; }
export function mul(a, b) { return a * b; }
console.log("math loaded");

// app.js
import { add } from "./math.js";
console.log(add(2, 3));`,
      options: ["add وسطر math loaded والتطبيق، ويُحذف mul", "add والتطبيق فقط", "الملفان كاملان، فالمجمّع لا يحذف شيئاً"],
      answer: 0,
      why: "import في ESM ثابتة، فالمجمّع يعرف قبل التشغيل أن mul لا يستوردها أحد فيحذفها. لكن console.log في أعلى الوحدة أثر جانبي يحدث عند تحميلها، وحذفه يغيّر سلوك البرنامج، فيبقى. لهذا تعلن المكتبات \"sideEffects\": false في package.json حين لا تملك آثاراً كهذه.",
      scene: mini(
        `import { add } from "./math.js";`,
        [
          { line: 1, say: "المجمّع يقرأ app.js ويرى import { add }: من math.js يلزم add فقط.", memory: [box("used", "add")] },
          { line: 1, say: "mul مُصدَّرة ولا يستوردها أحد: كود ميت، فتُحذف.", memory: [box("used", "add"), box("dropped", "mul")] },
          { line: 1, say: "console.log في أعلى math.js يعمل عند التحميل، فهو جزء من سلوك البرنامج ويبقى.", memory: [box("used", "add"), box("dropped", "mul"), box("kept", "side effect")] },
        ],
      ),
    },
    {
      question: "الخادم يثبّت بـ npm ci --omit=dev. ماذا يحدث عند تشغيل التطبيق؟",
      code: `// package.json
"dependencies": { "express": "^4.19.2" },
"devDependencies": { "zod": "^3.23.8", "vitest": "^1.6.0" }

// server.js
import { z } from "zod";`,
      options: ["يتعطّل عند البدء: Cannot find package 'zod'", "يعمل، فـ npm ci يثبّت كل شيء دائماً", "يعمل، لكن بنسخة zod أقدم"],
      answer: 0,
      why: "devDependencies لا تُثبَّت على خادم الإنتاج حين تُحذف بـ --omit=dev (أو NODE_ENV=production). zod يستعمله الكود وقت التشغيل، فمكانه dependencies. القاعدة: ما يستورده كود التطبيق نفسه في dependencies، وما تستعمله أدواتك فقط في devDependencies.",
      scene: mini(
        `import { z } from "zod";`,
        [
          { line: 1, say: "على جهازك: npm install ثبّت النوعين، فكل شيء يعمل.", memory: [box("node_modules", "express, zod, vitest")] },
          { line: 1, say: "على الخادم: --omit=dev تتخطى devDependencies.", memory: [box("node_modules", "express")] },
          { line: 1, say: "Node يبحث عن zod في node_modules فلا يجده.", memory: [box("node_modules", "express")], error: "Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'zod'" },
        ],
      ),
    },
  ],
  code: {
    intro: "مجمّع صغير حقيقي الفكرة: الوحدات هنا كائنات بدل ملفات. يمرّ ثلاث مرات كما يفعل esbuild و Rollup: يبني رسم الوحدات من ملف الدخول، ثم يحتفظ فقط بالمصدَّرات التي يصل إليها التطبيق (tree shaking)، ثم يضغط الكود. وفي النهاية يشغّل الحزمة الناتجة فعلاً.",
    runnerStarter: `// Each module: what it imports (file -> names) and what it exports (name -> code + names it uses).
const modules = {
  "index.js": {
    imports: { "cart.js": ["total"], "format.js": ["price"] },
    body: "console.log(price(total([5, 10])));",
    exports: {},
  },
  "cart.js": {
    imports: {},
    exports: {
      total: { code: "function total(items) {\\n  return items.reduce((sum, x) => sum + x, 0);\\n}", uses: [] },
      clear: { code: "function clear(items) {\\n  items.length = 0;\\n}", uses: [] },
    },
  },
  "format.js": {
    imports: { "currency.js": ["symbol"] },
    exports: {
      price: { code: "function price(amount) {\\n  return amount.toFixed(2) + ' ' + symbol;\\n}", uses: ["symbol"] },
      date: { code: "function date(d) {\\n  return d.toISOString();\\n}", uses: [] },
    },
  },
  "currency.js": {
    imports: {},
    exports: {
      symbol: { code: "const symbol = 'SAR';", uses: [] },
      rates: { code: "const rates = { USD: 3.75, EUR: 4.1 };", uses: [] },
    },
  },
  "admin.js": { imports: {}, exports: { wipe: { code: "function wipe() {}", uses: [] } } },
};

// Pass 1: the module graph, following imports from the entry (admin.js is never reached).
function graph(entry) {
  const order = [];
  const visit = (file) => {
    if (order.includes(file)) return;
    order.push(file);
    for (const dep of Object.keys(modules[file].imports)) visit(dep);
  };
  visit(entry);
  return order;
}

// Pass 2: tree shaking. Keep an export only if something reachable uses it.
function shake(entry) {
  const kept = new Set();
  const need = (file, name) => {
    const key = file + ":" + name;
    if (kept.has(key)) return;
    kept.add(key);
    for (const used of modules[file].exports[name].uses) {
      const from = Object.keys(modules[file].imports).find((f) => modules[file].imports[f].includes(used));
      need(from, used);
    }
  };
  for (const [file, names] of Object.entries(modules[entry].imports)) names.forEach((n) => need(file, n));
  return kept;
}

const files = graph("index.js");
const kept = shake("index.js");
const all = files.flatMap((f) => Object.keys(modules[f].exports).map((n) => f + ":" + n));
console.log("graph:", files.join(" -> "));
console.log("kept:", [...kept].join(", "));
console.log("dropped:", all.filter((k) => !kept.has(k)).join(", "));

// Dependencies first, the entry last: every name exists before it is used.
const pieces = [...kept].reverse().map((k) => modules[k.split(":")[0]].exports[k.split(":")[1]].code);
const bundle = pieces.join("\\n") + "\\n" + modules["index.js"].body;

// Pass 3: minify (real minifiers also rename local variables to one letter).
const minified = bundle.replace(/\\s+/g, " ").replace(/ ?([{}();,=+]) ?/g, "$1");
const source = Object.values(modules).flatMap((m) => Object.values(m.exports).map((e) => e.code)).join("\\n");
console.log("size:", source.length, "->", minified.length, "characters");
console.log("running the bundle:");
new Function(minified)();
// try: make index.js also import "date" from format.js, and watch it move from dropped to kept
`,
  },
  exercises: [
    {
      kind: "order",
      title: "ارفع رقم النسخة",
      prompt: "رتّب الأسطر حتى ترفع bump الرقم المناسب حسب نوع التغيير، وتصفّر ما بعده: 1.5.0 2.0.0 1.4.3",
      lines: [
        "function bump(version, kind) {",
        '  const [major, minor, patch] = version.split(".").map(Number);',
        '  if (kind === "major") return `${major + 1}.0.0`;',
        '  if (kind === "minor") return `${major}.${minor + 1}.0`;',
        "  return `${major}.${minor}.${patch + 1}`;",
        "}",
        'console.log(bump("1.4.2", "minor"), bump("1.4.2", "major"), bump("1.4.2", "patch"));',
      ],
      expected: "1.5.0 2.0.0 1.4.3",
    },
    {
      kind: "fill",
      title: "ما يحتاجه الخادم",
      prompt: "الخادم يثبّت بـ npm ci --omit=dev. أكمل السطر ليطبع الحزم التي ستُثبَّت عليه.",
      template: `const pkg = {
  name: "shop-api",
  dependencies: { express: "^4.19.2", pg: "^8.11.0" },
  devDependencies: { vitest: "^1.6.0", eslint: "^9.3.0" },
};
console.log(Object.keys(pkg.___).join(", "));`,
      options: ["dependencies", "devDependencies", "peerDependencies"],
      expected: "express, pg",
    },
    {
      kind: "fix",
      title: "~ تقبل أكثر مما يجب",
      prompt: "~1.4.0 يجب أن تقبل إصلاحات 1.4.x فقط. الدالة تقبل 1.5.0 أيضاً. أصلحها حتى تطبع 1.4.2 1.4.9",
      code: `function satisfiesTilde(version, base) {
  const v = version.split(".").map(Number);
  const b = base.split(".").map(Number);
  return v[0] === b[0] && v[2] >= b[2];
}
const published = ["1.3.9", "1.4.2", "1.4.9", "1.5.0", "2.0.0"];
console.log(published.filter((v) => satisfiesTilde(v, "1.4.0")).join(" "));`,
      expected: "1.4.2 1.4.9",
      hint: "~ تثبّت الرقمين الأولين: يجب أن يتساوى major و minor، ثم يكون patch أكبر أو مساوياً.",
      solution: `function satisfiesTilde(version, base) {
  const v = version.split(".").map(Number);
  const b = base.split(".").map(Number);
  return v[0] === b[0] && v[1] === b[1] && v[2] >= b[2];
}
const published = ["1.3.9", "1.4.2", "1.4.9", "1.5.0", "2.0.0"];
console.log(published.filter((v) => satisfiesTilde(v, "1.4.0")).join(" "));`,
    },
    {
      kind: "write",
      title: "أعلى نسخة مقبولة",
      prompt: "اكتب maxSatisfying(versions, range) لنطاق ^ (major من 1 فأكثر): تعيد أعلى نسخة مقبولة، أو null إن لم تُقبل أي نسخة. انتبه: 1.10.0 أعلى من 1.9.3.",
      starter: `// write maxSatisfying(versions, range) for "^x.y.z" ranges

console.log(maxSatisfying(["1.2.0", "1.9.3", "1.10.0", "2.0.0"], "^1.2.0"));
console.log(maxSatisfying(["1.2.0", "2.1.0"], "^3.0.0"));`,
      expected: "1.10.0\nnull",
      hint: "حوّل كل نسخة إلى أعداد بـ split(\".\").map(Number) وقارن عدداً بعدد، لا نصاً بنص (\"1.10.0\" < \"1.9.3\" نصياً). المقبولة: major يساوي major النطاق، وهي ليست أقل من النطاق.",
      solution: `function compare(a, b) {
  const x = a.split(".").map(Number);
  const y = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i]) return x[i] - y[i];
  }
  return 0;
}

function maxSatisfying(versions, range) {
  const base = range.slice(1);
  const major = Number(base.split(".")[0]);
  let best = null;
  for (const v of versions) {
    const ok = Number(v.split(".")[0]) === major && compare(v, base) >= 0;
    if (ok && (best === null || compare(v, best) > 0)) best = v;
  }
  return best;
}

console.log(maxSatisfying(["1.2.0", "1.9.3", "1.10.0", "2.0.0"], "^1.2.0"));
console.log(maxSatisfying(["1.2.0", "2.1.0"], "^3.0.0"));`,
    },
  ],
  quiz: [
    {
      question: "المستودع فيه package-lock.json، ونُشرت نسخ أحدث داخل النطاقات. ماذا يفعل كل أمر على خادم CI؟",
      code: "npm install   # A\nnpm ci        # B",
      options: [
        "A قد يحدّث ملف القفل إلى نسخ أحدث، و B يثبّت الملف حرفياً ويفشل إن خالف package.json",
        "الاثنان يتجاهلان ملف القفل",
        "B أسرع فقط، والنتيجة واحدة دائماً",
      ],
      answer: 0,
      why: "install أمر تطوير: يحاول التوفيق بين النطاقات والقفل وقد يكتب القفل من جديد. ci أمر للآلات: يحذف node_modules، يقرأ القفل كما هو، ولا يكتب شيئاً. لهذا تستعمل الخوادم ci: الشجرة نفسها في كل مرة.",
    },
    {
      question: "ما النسخ التي يقبلها النطاق؟",
      code: '"tiny-lib": "^0.2.3"',
      options: [">=0.2.3 و <0.3.0", ">=0.2.3 و <1.0.0", "0.2.3 فقط"],
      answer: 0,
      why: "قبل 1.0.0 تعدّ semver الرقم الأوسط كاسراً، فـ ^ لا تتجاوز أول رقم غير صفري. 0.3.0 قد تغيّر الواجهة، فلا تُقبل. لهذا تُعدّ 1.0.0 وعداً: من بعدها لا كسر إلا برفع الرقم الأول.",
    },
    {
      question: "vitest غير مثبّت على جهازك عموماً، بل في devDependencies فقط. ماذا يحدث عند npm test؟",
      code: '// package.json\n"scripts": { "test": "vitest run" }',
      options: ["تعمل نسخة المشروع، لأن npm يضيف node_modules/.bin إلى PATH", "يفشل: vitest: command not found", "يثبّت npm نسخة عامة ثم يشغّلها"],
      answer: 0,
      why: "كل حزمة فيها أداة سطر أوامر تضع رابطاً في node_modules/.bin. سكربتات npm ترى هذا المجلد أولاً، فيعمل كل زميل وكل خادم بالنسخة المقفلة نفسها. و npx vitest يفعل الشيء نفسه خارج السكربتات.",
    },
    {
      question: "التطبيق يستعمل دالة واحدة من مكتبة كبيرة. في أي حالة يستطيع المجمّع حذف الباقي؟",
      code: '// A\nconst _ = require("lodash");\n_.chunk([1, 2, 3], 2);\n\n// B\nimport { chunk } from "lodash-es";\nchunk([1, 2, 3], 2);',
      options: ["B فقط", "A فقط", "الاثنان"],
      answer: 0,
      why: "require دالة تُستدعى وقت التشغيل وتعيد كائناً، وقد يُقرأ منه أي اسم بأي طريقة (_[name])، فلا يعرف المجمّع ما يلزم فيبقي المكتبة كلها. import ثابتة: الأسماء معروفة قبل التشغيل، فيُحذف ما لم يُسمَّ. لهذا تُنشر المكتبات الحديثة بصيغة ESM.",
    },
    {
      question: "أي أداة تنبّهك إلى هذا الخطأ؟",
      code: "if (user = null) {\n  redirect(\"/login\");\n}",
      options: ["ESLint، بقاعدة no-cond-assign", "Prettier", "المجمّع، فيرفض البناء"],
      answer: 0,
      why: "Prettier منسّق: يعيد ترتيب المسافات والأقواس ولا يفهم المعنى. ESLint يحلّل الكود ويعرف أن الإسناد داخل if غالباً خطأ (أردت ===). والمجمّع يبني أي كود صحيح نحوياً. الفرق مفيد: المنسّق ينهي الجدال في الشكل، والمدقّق يصطاد الأخطاء.",
    },
  ],
  next: "js-node-internals",
};
