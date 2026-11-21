import type { Project } from "@/lib/types";

/** The fixed test bench: fake downloads with timers, run against the learner's loader. */
const BENCH = `
// ---- test bench: keep it below your code. It runs your loader; the tests read \`report\`. ----
const report = { done: false };
function makeFetcher(plan) {
  const stats = { active: 0, maxActive: 0, calls: {} };
  function fetchFile(name) {
    stats.calls[name] = (stats.calls[name] || 0) + 1;
    stats.active++;
    stats.maxActive = Math.max(stats.maxActive, stats.active);
    const { ms, fails = 0 } = plan[name];
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        stats.active--;
        if (stats.calls[name] <= fails) reject(new Error(name + " failed"));
        else resolve(name.toUpperCase());
      }, ms);
    });
  }
  return { fetchFile, stats };
}
async function bench() {
  const basic = makeFetcher({ a: { ms: 40 }, b: { ms: 5 }, c: { ms: 20 }, d: { ms: 5 }, e: { ms: 10 } });
  const wide = makeFetcher({ x: { ms: 10 }, y: { ms: 10 }, z: { ms: 10 }, w: { ms: 10 } });
  const flaky = makeFetcher({ ok: { ms: 5 }, flaky: { ms: 5, fails: 2 }, broken: { ms: 5, fails: 99 } });
  const none = makeFetcher({});
  const [r1, r2, r3, r4] = await Promise.all([
    loadAll(["a", "b", "c", "d", "e"], basic.fetchFile, { limit: 2, retries: 0 }),
    loadAll(["x", "y", "z", "w"], wide.fetchFile, { limit: 3, retries: 0 }),
    loadAll(["ok", "flaky", "broken"], flaky.fetchFile, { limit: 3, retries: 2 }),
    loadAll([], none.fetchFile, { limit: 2 }),
  ]);
  Object.assign(report, { basic: r1, basicStats: basic.stats, wide: r2, wideStats: wide.stats, flaky: r3, flakyStats: flaky.stats, empty: r4 });
}
bench()
  .catch((e) => (report.error = String(e && e.message)))
  .finally(() => {
    report.done = true;
    document.getElementById("out").textContent = JSON.stringify(report, null, 2);
  });
</script>
</body>
</html>`;

const HEAD = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Parallel loader</title>
</head>
<body>
<pre id="out">running...</pre>
<script>
`;

export const jsParallelLoader: Project = {
  slug: "js-parallel-loader",
  stage: 0,
  track: "js",
  level: 3,
  title: "محمّل ملفات متوازي",
  brief:
    "كل تطبيق حقيقي يحمّل أشياء كثيرة معاً: صور، ملفات، ردود API. إن حمّلتها واحداً بعد الآخر كان بطيئاً، وإن أطلقتها كلها معاً أغرقت الخادم. ستبني loadAll: تحمّل قائمة ملفات بحد أقصى من التحميلات المتزامنة، وتعيد المحاولة حين يفشل ملف، وتعيد النتائج بترتيب الطلب لا بترتيب الوصول، ولا يوقف فشل ملف واحد البقية. التحميل هنا مُحاكى بـ setTimeout، والصفحة تعرض تقرير المقعد التجريبي أسفلها.",
  lang: "html",
  steps: [
    "اقرأ المقعد التجريبي أسفل الكود: fetchFile(name) تعيد وعداً يُحلّ بعد ms ميلي ثانية باسم الملف بحروف كبيرة، وبعض الملفات ترفض أول fails مرة. المقعد يعدّ كم تحميلاً يعمل في اللحظة نفسها (maxActive) وكم مرة طُلب كل ملف (calls). لا تعدّل ما تحت سطر test bench.",
    "اكتب withRetry(task, retries): تستدعي task() وتنتظرها؛ إن رمت خطأً تحاول مرة أخرى، حتى retries محاولة إضافية. إن نجحت أعادت القيمة، وإن فشلت كل المحاولات رمت آخر خطأ. (retries = 2 تعني ثلاث محاولات كحد أقصى.)",
    "اجعل كل نتيجة كائناً: { name, ok: true, data } عند النجاح، أو { name, ok: false, error } حيث error هو err.message. التقط الخطأ لكل ملف على حدة، حتى لا يُسقط ملف واحد المجموعة كلها.",
    "اجعل النتائج بترتيب القائمة: احجز مصفوفة results بطول names واكتب كل نتيجة في results[index]، بدل push التي ترتّب حسب من وصل أولاً.",
    "الحد الأقصى: شغّل limit عاملاً (worker)، كل عامل حلقة تأخذ الفهرس التالي غير المحجوز (const index = next++) ثم تنتظر تحميله ثم تأخذ غيره. حجز الفهرس يحدث قبل أي await، وJavaScript خيط واحد، فلا يأخذ عاملان الملف نفسه أبداً. انتظر العمال كلهم بـ Promise.all.",
    "الحالات الحدّية: قائمة فارغة تعيد [] فوراً، و limit أكبر من عدد الملفات لا يصنع عمالاً بلا عمل.",
    "اضغط «شغّل الاختبارات». ثم انظر إلى التقرير في المعاينة: كم كان maxActive في كل سيناريو، وكم مرة طُلب flaky و broken؟",
  ],
  starter: `${HEAD}// Retry a failing task: at most \`retries\` extra attempts.
async function withRetry(task, retries) {
  // TODO: if task() throws, try again (up to retries more times), then rethrow the last error
  return task();
}

// Load every file with at most \`limit\` downloads at once.
// Result i belongs to names[i]: { name, ok: true, data } or { name, ok: false, error }.
async function loadAll(names, fetchFile, { limit = 3, retries = 0 } = {}) {
  // TODO: this loads one file at a time; run up to \`limit\` at once and keep the results in order
  const results = [];
  for (const name of names) {
    try {
      const data = await withRetry(() => fetchFile(name), retries);
      results.push({ name, ok: true, data });
    } catch (err) {
      results.push({ name, ok: false, error: err.message });
    }
  }
  return results;
}
${BENCH}`,
  solution: `${HEAD}// Retry a failing task: at most \`retries\` extra attempts.
async function withRetry(task, retries) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await task();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// Load every file with at most \`limit\` downloads at once.
// Result i belongs to names[i]: { name, ok: true, data } or { name, ok: false, error }.
async function loadAll(names, fetchFile, { limit = 3, retries = 0 } = {}) {
  const results = new Array(names.length);
  let next = 0;

  async function worker() {
    while (next < names.length) {
      const index = next++; // claimed before any await: no two workers take the same file
      const name = names[index];
      try {
        const data = await withRetry(() => fetchFile(name), retries);
        results[index] = { name, ok: true, data };
      } catch (err) {
        results[index] = { name, ok: false, error: err.message };
      }
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(limit, names.length); i++) workers.push(worker());
  await Promise.all(workers);
  return results;
}
${BENCH}`,
  tests: [
    {
      name: "المقعد انتهى دون خطأ، وكل ملف من الخمسة له نتيجة",
      code: `report.done && !report.error && report.basic.length === 5`,
    },
    {
      name: "النتائج بترتيب القائمة، لا بترتيب وصولها",
      code: `report.basic.map((r) => r.name + ":" + r.data).join(",") === "a:A,b:B,c:C,d:D,e:E" && report.basic.every((r) => r.ok === true)`,
    },
    {
      name: "لا يتجاوز الحد أبداً (2 ثم 3)",
      code: `report.basicStats.maxActive <= 2 && report.wideStats.maxActive <= 3`,
    },
    {
      name: "يستعمل الحد كاملاً: تحميلات متزامنة فعلاً",
      code: `report.basicStats.maxActive === 2 && report.wideStats.maxActive === 3`,
    },
    {
      name: "يعيد المحاولة حتى ينجح الملف المتقلّب (3 طلبات)",
      code: `(() => { const f = report.flaky[1]; return f.name === "flaky" && f.ok === true && f.data === "FLAKY" && report.flakyStats.calls.flaky === 3; })()`,
    },
    {
      name: "يستسلم بعد retries محاولة ويحفظ رسالة الخطأ",
      code: `(() => { const b = report.flaky[2]; return b.name === "broken" && b.ok === false && b.error === "broken failed" && report.flakyStats.calls.broken === 3; })()`,
    },
    {
      name: "فشل ملف لا يوقف البقية",
      code: `report.flaky[0].ok === true && report.flaky[0].data === "OK" && report.flaky.length === 3`,
    },
    {
      name: "القائمة الفارغة تعطي مصفوفة فارغة",
      code: `Array.isArray(report.empty) && report.empty.length === 0`,
    },
  ],
};
