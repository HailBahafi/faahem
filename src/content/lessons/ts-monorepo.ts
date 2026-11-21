import type { Cell, Lesson, Scene } from "@/lib/types";

/** A project and what tsc -b knows about it. */
const pj = (name: string, state: string): Cell => ({ name, value: state, type: "none" });
const sh = (shell: string, steps: Scene["steps"]): Scene => ({ code: { shell }, steps });

export const tsMonorepo: Lesson = {
  slug: "ts-monorepo",
  stage: 0,
  number: "4.5",
  title: "monorepo",
  subtitle: "حزم كثيرة في مستودع واحد: كل حزمة مشروع مستقل، و tsc -b يبنيها بترتيب اعتمادها ويتخطى ما لم يتغير",
  minutes: 30,
  problem: {
    title: "غيّرت سطراً، فلماذا يُبنى كل شيء؟",
    body: "أربع حزم في مستودع واحد: shared يستعملها الجميع. عدّل شيئاً، ثم اضغط بناء. أي الحزم يعيد tsc بناءها؟ قارن تعديل جسم دالة بتعديل توقيعها.",
    demo: "tsMonorepo",
  },
  singleLanguage: true,
  scene: {
    code: {
      shell: `$ cat packages/api/tsconfig.json
{ "compilerOptions": { "composite": true, "rootDir": "src", "outDir": "dist" }, "references": [{ "path": "../shared" }] }
$ tsc -b packages/api --verbose
Project 'packages/shared' is out of date because output file 'tsconfig.tsbuildinfo' does not exist. Building...
Project 'packages/api' is out of date because output file 'tsconfig.tsbuildinfo' does not exist. Building...
$ tsc -b packages/api --verbose
Project 'packages/shared' is up to date. Project 'packages/api' is up to date.
$ vim packages/shared/src/index.ts && tsc -b packages/api --verbose   # edit a function body only
Project 'packages/shared' is out of date. Building... Project 'packages/api' is up to date with .d.ts files from its dependencies`,
    },
    steps: [
      {
        line: null,
        say: "مستودع واحد فيه حزمتان: shared (أدوات مشتركة) و api تستعملها. لو كانتا مشروع tsc واحداً لفحص tsc كل ملف في كل مرة. مع project references تصبح كل حزمة مشروعاً له مخرجاته.",
        memory: [pj("shared", "never built"), pj("api", "never built")],
      },
      {
        line: 2,
        say: "composite: true تجعل الحزمة قابلة للإشارة إليها: يُجبر tsc على كتابة d.ts وملف tsbuildinfo. و references تقول: api تعتمد على shared، فابنِ shared أولاً.",
        memory: [pj("shared", "never built"), pj("api", "never built"), pj("api → shared", "reference")],
        changed: ["api → shared"],
      },
      {
        line: 3,
        say: "tsc -b (build) لا يبني مشروعاً واحداً: يقرأ الشجرة، ويرتّب المشاريع بحيث تُبنى كل حزمة بعد ما تعتمد عليه.",
        memory: [pj("shared", "never built"), pj("api", "never built"), pj("order", "shared, api")],
        changed: ["order"],
      },
      {
        line: 4,
        say: "shared أولاً: لا مخرجات لها بعد. تُبنى، فتظهر dist/index.js و dist/index.d.ts، و tsbuildinfo الذي يحفظ بصمة كل ملف دخل البناء.",
        memory: [pj("shared", "built: index.d.ts + tsbuildinfo"), pj("api", "never built")],
        changed: ["shared"],
      },
      {
        line: 5,
        say: "ثم api. حين تستورد من shared لا يقرأ tsc مصدر shared، بل shared/dist/index.d.ts. هذا ما يجعل الفحص سريعاً: توقيعات فقط.",
        memory: [pj("shared", "built"), pj("api", "built (read shared's .d.ts)")],
        changed: ["api"],
      },
      {
        line: 7,
        say: "بناء ثانٍ بلا تغيير: يقارن tsc أزمنة المدخلات بـ tsbuildinfo، فلا شيء يُبنى. في مستودع من 50 حزمة، هذا الفرق بين ثانية ودقائق.",
        memory: [pj("shared", "up to date"), pj("api", "up to date")],
        changed: ["shared", "api"],
      },
      {
        line: 8,
        say: "تعديل جسم دالة في shared. مدخلات shared تغيّرت، فتُبنى من جديد. لكن هل تغيّر ما تراه api؟",
        memory: [pj("shared", "rebuilding"), pj("api", "?")],
        changed: ["shared"],
      },
      {
        line: 9,
        say: "d.ts الجديد مطابق للقديم: التوقيعات لم تتغير. api إذن لا تحتاج فحصاً، فيحدّث tsc أزمنتها فقط. لو عدّلت توقيعاً لأعاد بناء api أيضاً.",
        memory: [pj("shared", "rebuilt, same .d.ts"), pj("api", "up to date (timestamps only)")],
        changed: ["api"],
      },
    ],
    notes: {
      shell: "مدير الحزم (npm أو pnpm workspaces) يربط @acme/shared في node_modules بمجلد الحزمة، و package.json فيها يشير إلى dist/index.d.ts. references تخبر tsc بترتيب البناء، و workspaces تخبر Node أين يجد الحزمة.",
    },
  },
  playground: {
    kind: "trace",
    intro: "محاكاة لـ tsc -b: كل حزمة تُبنى بعد ما تعتمد عليه، وتُبنى من جديد فقط إن تغيّر مصدرها، أو تغيّر d.ts في إحدى حزمها المعتمَد عليها.",
    starter: `const deps = { shared: [], ui: ["shared"], api: ["shared"], web: ["ui", "shared"] };
const edited = { shared: "body" };
const dtsChanged = {};
const visited = {};
function build(p) {
  if (visited[p]) return;
  visited[p] = true;
  for (const d of deps[p]) build(d);
  if (edited[p]) {
    dtsChanged[p] = edited[p] === "signature";
    console.log(p + ": rebuilt" + (dtsChanged[p] ? ", its .d.ts changed" : ", same .d.ts"));
    return;
  }
  let needs = false;
  for (const d of deps[p]) {
    if (dtsChanged[d]) needs = true;
  }
  console.log(p + (needs ? ": rebuilt, a dependency's .d.ts changed" : ": up to date"));
}
build("web");
build("api");`,
    challenges: [
      "غيّر \"body\" إلى \"signature\". توقّع قبل التشغيل: كم حزمة تُبنى؟",
      "اجعل edited = { ui: \"signature\" }. هل تتأثر api؟ لماذا؟",
      "احذف السطر if (visited[p]) return. كم مرة تُطبع shared؟ tsc -b يبني كل مشروع مرة واحدة مهما كثر من يشير إليه.",
    ],
  },
  predict: [
    {
      question: "لم تُبنَ shared بعد. شغّلنا tsc -p (لا -b) على api التي تشير إليها. ماذا يحدث؟",
      code: `$ tsc -p packages/api
# api/src/index.ts imports from "../../shared/src/index.js"`,
      options: [
        "error TS6305: Output file 'shared/dist/index.d.ts' has not been built from source file 'shared/src/index.ts'.",
        "يبني tsc الحزمة shared تلقائياً ثم api",
        "يفحص tsc مصدر shared مباشرة بلا خطأ",
      ],
      answer: 0,
      why: "مع references لا يقرأ tsc مصدر الحزمة المعتمَد عليها، بل d.ts المبني منها. tsc -p يبني مشروعاً واحداً ولا يتبع الشجرة، فلا يجد d.ts. tsc -b هو من يبني الشجرة بترتيبها.",
      scene: sh(
        `$ tsc -p packages/api
# api/src/index.ts imports from "../../shared/src/index.js"`,
        [
          { line: 1, say: "-p: مشروع واحد فقط. لا أحد يبني shared.", memory: [pj("shared", "never built"), pj("api", "checking")], changed: ["api"] },
          { line: 2, say: "الاستيراد يُحوَّل إلى shared/dist/index.d.ts، وهو غير موجود.", memory: [pj("shared/dist/index.d.ts", "missing")], error: "TS6305: Output file '.../shared/dist/index.d.ts' has not been built from source file '.../shared/src/index.ts'." },
        ],
      ),
    },
    {
      question: "أضاف أحدهم إلى shared إشارة إلى api، وapi تشير إلى shared. ماذا يقول tsc -b؟",
      code: `// packages/shared/tsconfig.json: "references": [{ "path": "../api" }]
// packages/api/tsconfig.json:    "references": [{ "path": "../shared" }]
$ tsc -b packages/api`,
      options: ["error TS6202: Project references may not form a circular graph.", "يبني shared ثم api كالعادة", "يبنيهما مرتين"],
      answer: 0,
      why: "البناء بالترتيب يحتاج حزمة تُبنى أولاً. في الدائرة كل حزمة تنتظر الأخرى. الحل في التصميم: انقل ما تحتاجه الحزمتان معاً إلى حزمة ثالثة تعتمدان عليها.",
      scene: sh(
        `// packages/shared/tsconfig.json: "references": [{ "path": "../api" }]
// packages/api/tsconfig.json:    "references": [{ "path": "../shared" }]
$ tsc -b packages/api`,
        [
          { line: 3, say: "tsc يبدأ من api: يحتاج shared أولاً. و shared تحتاج api أولاً.", memory: [pj("api", "waits for shared"), pj("shared", "waits for api")] },
          { line: 3, say: "لا ترتيب ممكن.", memory: [pj("api", "waits for shared"), pj("shared", "waits for api")], error: "TS6202: Project references may not form a circular graph." },
        ],
      ),
    },
    {
      question: "بعد بناء ناجح، غيّرنا التوقيع في shared: أضفنا معاملاً. ماذا يبني tsc -b packages/api؟",
      code: `// before: export function price(n: number): string
// after:  export function price(n: number, currency?: string): string
$ tsc -b packages/api --verbose`,
      options: ["shared ثم api: d.ts تغيّر", "shared وحدها: api لم تتغير ملفاتها", "لا شيء: البناء السابق صالح"],
      answer: 0,
      why: "d.ts الجديد لـ shared مختلف، و api مبنية على d.ts القديم، فقد يكون فيها استدعاء صار خاطئاً. يقول tsc: api is out of date because output is older than input 'packages/shared'، ويبنيها. هذا عكس تعديل الجسم وحده.",
      scene: sh(
        `// before: export function price(n: number): string
// after:  export function price(n: number, currency?: string): string
$ tsc -b packages/api --verbose`,
        [
          { line: 3, say: "مدخلات shared تغيّرت: تُبنى، و d.ts فيه توقيع جديد.", memory: [pj("shared", "rebuilt, .d.ts changed"), pj("api", "?")], changed: ["shared"] },
          { line: 3, say: "api اعتمدت على d.ts القديم: تُفحص وتُبنى من جديد.", memory: [pj("shared", "rebuilt"), pj("api", "rebuilt")], changed: ["api"] },
        ],
      ),
    },
  ],
  code: {
    intro: "هذا ما يحسبه tsc -b وأدوات المستودعات (Turborepo و Nx) قبل أي عمل: ترتيب البناء من الشجرة، مع كشف الدوائر، ثم «الحزم المتأثرة» بتغيير: كل من يعتمد عليها مباشرة أو عبر غيره. CI يبني ويختبر هذه فقط.",
    runnerLang: "ts",
    runnerStarter: `type Graph = Record<string, string[]>; // package -> packages it references
const graph: Graph = { shared: [], ui: ["shared"], api: ["shared"], web: ["ui", "shared"], admin: ["ui", "api"] };

function buildOrder(g: Graph): string[] {
  const order: string[] = [];
  const state = new Map<string, "visiting" | "done">();
  function visit(p: string, path: string[]): void {
    const s = state.get(p);
    if (s === "done") return;
    if (s === "visiting") throw new Error("cycle: " + [...path, p].join(" -> "));
    state.set(p, "visiting");
    for (const dep of g[p] ?? []) visit(dep, [...path, p]);
    state.set(p, "done");
    order.push(p); // after all its dependencies
  }
  for (const p of Object.keys(g)) visit(p, []);
  return order;
}

function affected(g: Graph, changed: string): string[] {
  const hit = new Set<string>([changed]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const [p, deps] of Object.entries(g)) {
      if (!hit.has(p) && deps.some((d) => hit.has(d))) {
        hit.add(p);
        grew = true;
      }
    }
  }
  return buildOrder(g).filter((p) => hit.has(p));
}

console.log("build order:", buildOrder(graph).join(" -> "));
console.log("ui changed, rebuild and test:", affected(graph, "ui").join(", "));
graph.shared = ["admin"]; // someone makes shared import admin
try {
  buildOrder(graph);
} catch (e) {
  console.log(e instanceof Error ? e.message : e);
}
// try: affected(graph, "shared") before the cycle line. Why is it every package?
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "ts",
      title: "ترتيب البناء",
      prompt: "رتّب الدالة التي تضع كل حزمة بعد ما تعتمد عليه، مرة واحدة فقط. الناتج: shared ui web api",
      lines: [
        'const graph: Record<string, string[]> = { web: ["ui", "shared"], ui: ["shared"], api: ["shared"], shared: [] };',
        "const done = new Set<string>();",
        "const order: string[] = [];",
        "function visit(p: string): void {",
        "  if (done.has(p)) return;",
        "  done.add(p);",
        "  for (const dep of graph[p] ?? []) visit(dep);",
        "  order.push(p);",
        "}",
        "for (const p of Object.keys(graph)) visit(p);",
        'console.log(order.join(" "));',
      ],
      expected: "shared ui web api",
    },
    {
      kind: "fill",
      lang: "ts",
      title: "هل يحتاج بناءً؟",
      prompt: "shared أعيد بناؤها و d.ts فيها تغيّر. المشروع يُبنى إن تغيّرت مدخلاته، أو تغيّر d.ts في حزمة يعتمد عليها. أي شرط؟ الناتج: api:true web:true ui:false",
      template: `type Project = { name: string; inputsChanged: boolean; deps: string[] };
const dtsChanged = new Set<string>(["shared"]);
function needsBuild(p: Project): boolean {
  return ___;
}
const projects: Project[] = [
  { name: "api", inputsChanged: false, deps: ["shared"] },
  { name: "web", inputsChanged: true, deps: ["ui"] },
  { name: "ui", inputsChanged: false, deps: [] },
];
console.log(projects.map((p) => p.name + ":" + needsBuild(p)).join(" "));`,
      options: ["p.inputsChanged || p.deps.some((d) => dtsChanged.has(d))", "p.inputsChanged", "p.deps.some((d) => dtsChanged.has(d))"],
      expected: "api:true web:true ui:false",
    },
    {
      kind: "fix",
      lang: "ts",
      title: "shared تُبنى مرتين",
      prompt: "web تعتمد على ui و shared، و ui تعتمد على shared. هذا الكود يضع shared في الترتيب مرتين. tsc -b يبني كل مشروع مرة واحدة. أصلحه ليُطبع: shared ui web",
      code: `const graph: Record<string, string[]> = { web: ["ui", "shared"], ui: ["shared"], shared: [] };
const order: string[] = [];
function visit(p: string): void {
  for (const dep of graph[p] ?? []) visit(dep);
  order.push(p);
}
visit("web");
console.log(order.join(" "));`,
      expected: "shared ui web",
      hint: "احفظ ما زرته في Set: const seen = new Set<string>(); وفي أول visit: if (seen.has(p)) return; seen.add(p);",
      solution: `const graph: Record<string, string[]> = { web: ["ui", "shared"], ui: ["shared"], shared: [] };
const order: string[] = [];
const seen = new Set<string>();
function visit(p: string): void {
  if (seen.has(p)) return;
  seen.add(p);
  for (const dep of graph[p] ?? []) visit(dep);
  order.push(p);
}
visit("web");
console.log(order.join(" "));`,
    },
    {
      kind: "write",
      lang: "ts",
      title: "من يتأثر؟",
      prompt: "اكتب dependentsOf(graph, changed): string[] ترجع كل حزمة تعتمد على changed مباشرة أو عبر غيرها (دون changed نفسها)، مرتّبة أبجدياً. اطبع النتيجة لـ \"shared\" ثم لـ \"ui\" مفصولة بمسافات. الناتج: api ui web ثم web",
      starter: `const graph: Record<string, string[]> = { shared: [], ui: ["shared"], api: ["shared"], web: ["ui"], docs: [] };
// write dependentsOf here
`,
      expected: "api ui web\nweb",
      hint: "ابدأ بـ Set فيها changed، وكرّر: كل حزمة لها dep داخل المجموعة تدخلها، حتى لا تكبر المجموعة. ثم احذف changed ورتّب.",
      solution: `const graph: Record<string, string[]> = { shared: [], ui: ["shared"], api: ["shared"], web: ["ui"], docs: [] };
function dependentsOf(g: Record<string, string[]>, changed: string): string[] {
  const hit = new Set<string>([changed]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const [p, deps] of Object.entries(g)) {
      if (!hit.has(p) && deps.some((d) => hit.has(d))) {
        hit.add(p);
        grew = true;
      }
    }
  }
  hit.delete(changed);
  return [...hit].sort();
}
console.log(dependentsOf(graph, "shared").join(" "));
console.log(dependentsOf(graph, "ui").join(" "));`,
    },
  ],
  quiz: [
    {
      question: "api تشير إلى shared، و tsconfig في shared بلا composite. ماذا يقول tsc -b packages/api؟",
      code: `// packages/shared/tsconfig.json
{ "compilerOptions": { "strict": true, "outDir": "dist" } }`,
      options: ["error TS6306: Referenced project must have setting \"composite\": true.", "يبني بلا خطأ، أبطأ فقط", "يتجاهل الإشارة ويفحص مصدر shared"],
      answer: 0,
      why: "composite وعد بأن الحزمة تكتب ما يحتاجه من يعتمد عليها: d.ts و tsbuildinfo، وأن كل ملفاتها مذكورة. بدونه لا يضمن tsc أن هناك d.ts يقرؤه، فيرفض الإشارة.",
    },
    {
      question: "ما ترتيب البناء في tsc -b packages/web؟",
      code: `// web    -> ui, api
// ui     -> shared
// api    -> shared
// shared -> (nothing)`,
      options: ["shared، ثم ui و api، ثم web", "web، ثم ui و api، ثم shared", "بالترتيب الأبجدي: api, shared, ui, web"],
      answer: 0,
      why: "كل مشروع يُبنى بعد كل ما يشير إليه، لأنه يقرأ d.ts منها. shared لا تعتمد على شيء فتبدأ، و web تعتمد على الجميع فتنتهي. ui و api مستقلتان عن بعضهما.",
    },
    {
      question: "ماذا يقول tsc -b لهذا الإعداد؟",
      code: `// packages/shared/tsconfig.json
{ "compilerOptions": { "composite": true, "declaration": false } }`,
      options: ["error TS6304: Composite projects may not disable declaration emit.", "لا خطأ: declaration يغلب composite", "يبني بلا d.ts"],
      answer: 0,
      why: "d.ts هو الجسر بين الحزم: من يعتمد على shared يقرأ توقيعاتها منه، لا من مصدرها. حزمة مشار إليها بلا d.ts لا معنى لها.",
    },
    {
      question: "حذفنا packages/shared/tsconfig.tsbuildinfo وحده. ماذا يفعل tsc -b packages/shared؟",
      code: `$ rm packages/shared/tsconfig.tsbuildinfo
$ tsc -b packages/shared --verbose`,
      options: ["يبنيها من جديد: out of date because output file 'tsconfig.tsbuildinfo' does not exist", "لا شيء: dist ما زال موجوداً", "خطأ: الملف مطلوب"],
      answer: 0,
      why: "tsbuildinfo ذاكرة البناء التزايدي: بصمات المدخلات والتوقيعات. بدونه لا يعرف tsc ما تغيّر، فيعيد البناء كاملاً. لذلك يُحفظ في ذاكرة CI المؤقتة مع dist، ولا يُرفع إلى git.",
    },
    {
      question: "مستودع فيه 40 حزمة. عدّلت جسم دالة داخلية في حزمة ورقة لا يعتمد عليها أحد. كم مشروعاً يفحصه tsc -b؟",
      code: `$ tsc -b   # root tsconfig.json references all 40 packages`,
      options: ["مشروعاً واحداً: الباقي up to date", "40: الجذر يشير إلى الجميع", "الحزمة وكل الحزم التي تعتمد عليها هي"],
      answer: 0,
      why: "tsc -b يقارن مدخلات كل مشروع بـ tsbuildinfo. مشروع واحد تغيّر، ولا أحد يعتمد عليه، فالباقي يُتخطى. والحزم التي تعتمد عليها الورقة لا تتأثر بتعديلها أصلاً: الاعتماد يسري في اتجاه واحد.",
    },
  ],
};
