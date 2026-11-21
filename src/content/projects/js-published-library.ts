import type { Project } from "@/lib/types";

const HEADER = `// tiny-money: money as integers of minor units (halalas, cents): parse, format, allocate.
// In the published package this is src/index.js and each public function starts with \`export\`:
//   export function parseAmount(text) { ... }
// The course runner has no module system, so the export keywords are left out here.
`;

export const jsPublishedLibrary: Project = {
  slug: "js-published-library",
  stage: 0,
  track: "js",
  level: 4,
  title: "مكتبة منشورة مع اختباراتها",
  brief:
    "ستبني مكتبة صغيرة حقيقية للمال، كالتي تُنشر على npm ويستعملها غيرك: tiny-money. المال لا يُخزَّن كسوراً عشرية (0.1 + 0.2 ليست 0.3 في الحاسوب)، بل أعداداً صحيحة من الهللات. المكتبة ثلاث دوال عامة: parseAmount تقرأ نصاً كتبه إنسان، و formatAmount تعرض المبلغ، و allocate تقسم مبلغاً على حصص دون أن تضيع هللة. ومعها ما يجعلها قابلة للنشر: اختباراتها الخاصة، و package.json صحيح، وخطة لأرقام النسخ، و README.",
  lang: "js",
  steps: [
    "صمّم الواجهة العامة أولاً: كل المبالغ أعداد صحيحة من الهللات (1250 تعني 12.50). الدوال الثلاث نقية: لا تقرأ متغيرات عامة ولا تطبع، وتأخذ مدخلات وتعيد ناتجاً أو ترمي خطأً واضحاً. ما ليس في الواجهة يبقى داخلياً، فتستطيع تغييره دون أن تكسر أحداً.",
    "parseAmount(text): تقبل \"12.5\" و \"0.07\" و \"1,234.56\" و \"-3\"، وتعيد الهللات عدداً صحيحاً (1250، 7، 123456، -300). لا تضرب كسراً في 100: \"1.15\" × 100 تعطي 114.99999999999999. افصل الجزء الصحيح عن الكسر بتعبير نمطي، وأكمل الكسر إلى رقمين (\"5\" تصبح \"50\"). ارفض كل ما سواه (\"abc\"، \"1.234\"، \"\"، \"1,2,3\") بخطأ رسالته تبدأ بـ invalid amount.",
    "formatAmount(minor, currency = \"SAR\"): تعرض 123456 بالشكل \"1,234.56 SAR\"، و -500 مع \"USD\" بالشكل \"-5.00 USD\"، و 7 بالشكل \"0.07 SAR\". اقسم على 100 بالعدد الصحيح (Math.floor و %) لا بالكسور، وافصل كل ثلاثة أرقام بفاصلة. ارمِ TypeError إن لم يكن minor عدداً صحيحاً.",
    "allocate(minor, ratios): تقسم المبلغ حسب النسب، ومجموع الحصص يساوي المبلغ دائماً. 1000 على [1, 1, 1] تعطي [334, 333, 333]: خذ الجزء الصحيح لكل حصة، ثم وزّع الهللات الباقية واحدة واحدة من الأول. ارمِ RangeError لمبلغ سالب أو غير صحيح، ولقائمة نسب فارغة أو سالبة أو كلها أصفار.",
    "اكتب runOwnTests(): مقعد اختبار صغير مثل node:test، فيه test(name, fn) تعدّ الناجح والفاشل وتطبع اسم كل اختبار فاشل، و equal و throws. ست حالات على الأقل، أغلبها حدّية: صفر، سالب، كسر من رقم واحد، فواصل الآلاف، مبلغ لا ينقسم بالتساوي، مدخل مرفوض. تعيد { passed, failed }.",
    "أكمل packageJson: name، و version بصيغة semver الكاملة (\"1.0.0\")، و type: \"module\" (الملفات ESM)، و exports: { \".\": \"./src/index.js\" } (المدخل الوحيد المسموح، فلا يستورد أحد ملفاتك الداخلية)، و files: [\"src\"] (ما يُنشر فقط، لا الاختبارات)، و engines، و scripts.test. المكتبة بلا dependencies وقت التشغيل: كل حزمة تضيفها تصبح حزمة عند كل مستخدم.",
    "خطة النسخ (semver): إصلاح خطأ في allocate يرفع الرقم الأخير (1.0.1). إضافة دالة subtract جديدة ترفع الأوسط (1.1.0). تغيير اسم parseAmount أو ما تعيده يرفع الأول (2.0.0)، لأن كود المستخدمين سينكسر. المستخدم الذي كتب ^1.0.0 يأخذ الأولين تلقائياً، ولن يصله الثالث إلا بقراره.",
    "README: سطر يقول ما المكتبة، ثم npm install tiny-money، ثم مثال قصير بـ import { parseAmount, formatAmount, allocate } from \"tiny-money\"، ثم كل دالة بمدخلاتها ومخرجاتها والأخطاء التي ترميها. قبل النشر: npm pack --dry-run يريك الملفات التي ستُنشر بالضبط، ثم npm publish.",
    "اضغط «شغّل الاختبارات». كل اختبار يفشل يسمّي حالة: شغّلها بيدك واطبع القيم حتى تجد السطر المخطئ.",
  ],
  starter: `${HEADER}
function parseAmount(text) {
  // TODO: integers only. 1.15 * 100 is 114.99999999999999 in floating point.
  return parseFloat(text.replaceAll(",", "")) * 100;
}

function formatAmount(minor, currency = "SAR") {
  // TODO: thousands separators, and integer math instead of division
  return (minor / 100).toFixed(2) + " " + currency;
}

function allocate(minor, ratios) {
  // TODO: the parts must always add up to minor; reject bad input
  const total = ratios.reduce((sum, r) => sum + r, 0);
  return ratios.map((r) => Math.round((minor * r) / total));
}

const packageJson = {
  name: "tiny-money",
  version: "1.0",
  main: "index.js",
  // TODO: type, exports, files, engines, scripts
};

function runOwnTests() {
  const results = { passed: 0, failed: 0 };
  const test = (name, fn) => {
    try {
      fn();
      results.passed++;
    } catch (err) {
      results.failed++;
      console.log("FAIL " + name + ": " + err.message);
    }
  };
  test("parses a whole number", () => {
    if (parseAmount("12") !== 1200) throw new Error("expected 1200");
  });
  // TODO: at least six cases, most of them edge cases
  return results;
}
`,
  solution: `${HEADER}
const AMOUNT = /^(-)?(\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.(\\d{1,2}))?$/;

function parseAmount(text) {
  const match = typeof text === "string" ? AMOUNT.exec(text.trim()) : null;
  if (!match) throw new Error("invalid amount: " + JSON.stringify(text));
  const [, minus, whole, fraction = ""] = match;
  const minor = Number(whole.replaceAll(",", "")) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor)) throw new RangeError("amount too large: " + text);
  return minus && minor !== 0 ? -minor : minor;
}

function formatAmount(minor, currency = "SAR") {
  if (!Number.isSafeInteger(minor)) throw new TypeError("minor units must be a safe integer, got " + minor);
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  const whole = String(Math.floor(abs / 100)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
  const cents = String(abs % 100).padStart(2, "0");
  return \`\${sign}\${whole}.\${cents} \${currency}\`;
}

function allocate(minor, ratios) {
  if (!Number.isSafeInteger(minor) || minor < 0) throw new RangeError("minor must be a non-negative integer");
  if (!Array.isArray(ratios) || ratios.length === 0) throw new RangeError("ratios must be a non-empty array");
  if (ratios.some((r) => !Number.isFinite(r) || r < 0)) throw new RangeError("ratios must be non-negative numbers");
  const total = ratios.reduce((sum, r) => sum + r, 0);
  if (total === 0) throw new RangeError("ratios must not all be zero");

  const shares = ratios.map((r) => Math.floor((minor * r) / total));
  let left = minor - shares.reduce((sum, s) => sum + s, 0);
  // fewer halalas are left than there are parts: hand them out one by one, skipping zero ratios
  for (let i = 0; left > 0; i = (i + 1) % shares.length) {
    if (ratios[i] > 0) {
      shares[i]++;
      left--;
    }
  }
  return shares;
}

const packageJson = {
  name: "tiny-money",
  version: "1.0.0",
  description: "Money as integer minor units: parse, format and allocate without losing a halala.",
  type: "module",
  exports: { ".": "./src/index.js" },
  files: ["src"],
  engines: { node: ">=18" },
  scripts: { test: "node --test" },
  keywords: ["money", "currency", "sar", "allocate"],
  license: "MIT",
};

function runOwnTests() {
  const results = { passed: 0, failed: 0 };
  const test = (name, fn) => {
    try {
      fn();
      results.passed++;
    } catch (err) {
      results.failed++;
      console.log("FAIL " + name + ": " + err.message);
    }
  };
  const equal = (actual, expected) => {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) throw new Error("expected " + e + ", got " + a);
  };
  const throws = (fn) => {
    try {
      fn();
    } catch {
      return;
    }
    throw new Error("expected an error");
  };

  test("parses whole and decimal amounts", () => equal([parseAmount("12"), parseAmount("12.5"), parseAmount("0.07")], [1200, 1250, 7]));
  test("1.15 does not become 114.999...", () => equal(parseAmount("1.15"), 115));
  test("thousands separators and negatives", () => equal([parseAmount("1,234.56"), parseAmount("-3")], [123456, -300]));
  test("rejects what is not an amount", () => ["abc", "", "1.234", "1,2,3", "12."].forEach((t) => throws(() => parseAmount(t))));
  test("formats with separators and sign", () => equal([formatAmount(123456), formatAmount(-500, "USD"), formatAmount(0)], ["1,234.56 SAR", "-5.00 USD", "0.00 SAR"]));
  test("allocate never loses a halala", () => equal(allocate(1000, [1, 1, 1]), [334, 333, 333]));
  test("allocate follows the ratios", () => equal(allocate(100, [70, 30]), [70, 30]));
  test("allocate rejects bad input", () => [() => allocate(100, []), () => allocate(100, [0, 0]), () => allocate(-5, [1])].forEach(throws));
  return results;
}
`,
  tests: [
    {
      name: "تقرأ المبالغ بالهللات، و 1.15 تعطي 115 بالضبط",
      code: `console.log(parseAmount("12.5") === 1250 && parseAmount("0.07") === 7 && parseAmount("1.15") === 115 && parseAmount("12") === 1200);`,
    },
    {
      name: "تفهم فواصل الآلاف والسالب",
      code: `console.log(parseAmount("1,234.56") === 123456 && parseAmount("-3") === -300 && parseAmount("1,000,000") === 100000000);`,
    },
    {
      name: "ترفض ما ليس مبلغاً برسالة invalid amount",
      code: `console.log(["abc", "", "1.234", "1,2,3", "12."].every((t) => {
  try {
    parseAmount(t);
    return false;
  } catch (e) {
    return e.message.startsWith("invalid amount");
  }
}));`,
    },
    {
      name: "تعرض المبلغ بفواصل وإشارة وعملة",
      code: `console.log(formatAmount(123456) === "1,234.56 SAR" && formatAmount(-500, "USD") === "-5.00 USD" && formatAmount(7) === "0.07 SAR" && formatAmount(0) === "0.00 SAR");`,
    },
    {
      name: "القراءة ثم العرض ترجع النص نفسه",
      code: `console.log(["0.01", "999.99", "1,000,000.00", "-42.10"].every((t) => formatAmount(parseAmount(t)) === t + " SAR"));`,
    },
    {
      name: "القسمة لا تضيّع هللة وتتبع النسب",
      code: `const a = allocate(1000, [1, 1, 1]);
const b = allocate(100, [70, 30]);
const c = allocate(5, [1, 0, 1]);
console.log(a.join() === "334,333,333" && b.join() === "70,30" && c.join() === "3,0,2" && allocate(10001, [1, 2, 3, 4]).reduce((s, x) => s + x, 0) === 10001);`,
    },
    {
      name: "القسمة ترفض المدخلات الخاطئة",
      code: `console.log([() => allocate(100, []), () => allocate(100, [0, 0]), () => allocate(-5, [1]), () => allocate(1.5, [1])].every((f) => {
  try {
    f();
    return false;
  } catch (e) {
    return e instanceof RangeError;
  }
}));`,
    },
    {
      name: "package.json جاهز للنشر: ESM، و exports، و semver، وبلا اعتماديات تشغيل",
      code: `const p = packageJson;
console.log(p.type === "module" && typeof p.exports === "object" && typeof p.exports["."] === "string" && /^\\d+\\.\\d+\\.\\d+$/.test(p.version) && Array.isArray(p.files) && p.files.includes("src") && typeof (p.scripts && p.scripts.test) === "string" && Object.keys(p.dependencies || {}).length === 0);`,
    },
    {
      name: "اختبارات المكتبة نفسها: ست حالات على الأقل، كلها تنجح",
      code: `const r = runOwnTests();
console.log(r.failed === 0 && r.passed >= 6);`,
    },
  ],
};
