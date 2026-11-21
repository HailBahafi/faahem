// Language tracks: one path per language, from the basics to professional level (docs/TRACKS_PLAN.md).
// Each level is a Stage (id 1-4) so the roadmap map, progress and certificates work unchanged.
// A lesson already taught in the general roadmap is linked here by its slug, not rewritten.
import type { RoadmapLesson, Stage } from "./roadmap";

export type TrackId = "js" | "ts" | "py" | "go" | "rust" | "dart";

export interface Track {
  id: TrackId;
  name: string;
  tagline: string;
  color: string;
  levels: Stage[];
}

const L = (slug: string, title: string): RoadmapLesson => ({ slug, title });

export const LEVEL_NAMES = ["", "الأساسيات", "المتوسط", "المتقدم", "الاحتراف"];

function level(track: TrackId, color: string, langs: string, id: number, goal: string, project: string, lessons: RoadmapLesson[], key?: string): Stage {
  return { id, title: LEVEL_NAMES[id], goal, color, langs, project, lessons, key: key ?? `${track}:${id}` };
}

export const tracks: Track[] = [
  {
    id: "js",
    name: "JavaScript",
    tagline: "لغة الويب: من أول متغير إلى مشروع Node كبير",
    color: "#facc15",
    levels: [
      level("js", "#facc15", "JavaScript", 1, "تتبّع أي برنامج صغير في رأسك", "آلة حاسبة", [
        L("variables", "المتغيرات والذاكرة"), L("types", "أنواع البيانات"), L("operators", "العمليات والتعابير"), L("if", "الشروط if"),
        L("switch", "switch"), L("while", "حلقة while"), L("for", "حلقة for"), L("functions", "الدوال ومكدّس الاستدعاء"),
        L("scope", "النطاق"), L("arrays", "المصفوفات"), L("strings", "النصوص"), L("objects", "الكائنات"),
        L("references", "القيمة مقابل المرجع"), L("recursion", "العودية"), L("errors", "الأخطاء"),
      ], "1"),
      level("js", "#facc15", "JavaScript", 2, "تكتب كوداً منظّماً يستعمل قوة اللغة", "مدير مهام", [
        L("js-closures", "الإغلاق closures"), L("js-this", "this"), L("js-prototypes", "النماذج الأولية"), L("js-classes", "الأصناف"),
        L("js-modules", "الوحدات ESM"), L("js-array-methods", "map و filter و reduce"), L("js-destructuring", "التفكيك والنشر"),
        L("js-map-set", "Map و Set"), L("js-iterators", "المكرّرات والمولّدات"), L("js-regex", "التعابير النمطية"),
      ]),
      level("js", "#facc15", "JavaScript · Node", 3, "تفهم ما يحدث تحت اللغة: الوقت والذاكرة", "محمّل ملفات متوازي", [
        L("event-loop", "حلقة الأحداث"), L("async", "async و Promise"), L("js-promises-inside", "الوعود من الداخل"),
        L("js-memory", "الذاكرة وجامع القمامة"), L("js-proxy", "Proxy و Reflect"), L("js-functional", "الأسلوب الوظيفي"),
        L("js-patterns", "أنماط التصميم"), L("js-streams", "Streams في Node"),
      ]),
      level("js", "#facc15", "JavaScript · Node", 4, "تبني وتختبر وتشحن مشروعاً حقيقياً", "مكتبة منشورة مع اختباراتها", [
        L("testing", "الاختبارات"), L("js-tooling", "الأدوات والحزم"), L("js-node-internals", "Node من الداخل"),
        L("js-security", "أمان JavaScript"), L("js-performance", "القياس والتحسين"), L("js-architecture", "تنظيم مشروع كبير"),
      ]),
    ],
  },
  {
    id: "ts",
    name: "TypeScript",
    tagline: "JavaScript بأنواع: أخطاء تُكتشف قبل أن تعمل",
    color: "#60a5fa",
    levels: [
      level("ts", "#60a5fa", "TypeScript", 1, "تكتب أنواعاً تصف بياناتك", "نموذج متجر بأنواع", [
        L("typescript", "TypeScript"), L("ts-annotations", "التعليقات النوعية"), L("ts-objects", "interface و type"),
        L("ts-unions", "الاتحادات والتضييق"), L("ts-functions", "الدوال"), L("ts-arrays", "المصفوفات و tuples"),
        L("ts-literals", "الأنواع الحرفية و enum"), L("ts-config", "tsconfig"),
      ]),
      level("ts", "#60a5fa", "TypeScript", 2, "أنواع تُعاد استعمالها مع أي بيانات", "مخزن بيانات عام", [
        L("ts-generics", "Generics"), L("ts-utility", "الأنواع المساعدة"), L("ts-classes", "الأصناف"),
        L("ts-guards", "حراس الأنواع"), L("ts-discriminated", "الاتحادات المميّزة"), L("ts-declarations", "ملفات التعريف d.ts"),
      ]),
      level("ts", "#60a5fa", "TypeScript", 3, "تبرمج نظام الأنواع نفسه", "عميل API آمن النوع", [
        L("ts-conditional", "الأنواع الشرطية"), L("ts-mapped", "mapped types"), L("ts-template-literal", "template literal types"),
        L("ts-infer", "infer"), L("ts-branded", "الأنواع الموسومة"), L("ts-decorators", "decorators"),
      ]),
      level("ts", "#60a5fa", "TypeScript", 4, "قواعد كود كبيرة بأنواع صارمة", "ترحيل مشروع JS إلى TS", [
        L("ts-strict", "إعدادات strict"), L("ts-library-types", "أنواع لمكتبة"), L("ts-runtime-validation", "التحقق وقت التشغيل"),
        L("ts-migration", "ترحيل مشروع JS"), L("ts-monorepo", "monorepo"),
      ]),
    ],
  },
  {
    id: "py",
    name: "Python",
    tagline: "لغة واضحة لكل شيء: من سكربت صغير إلى خادم وبيانات",
    color: "#34d399",
    levels: [
      level("py", "#34d399", "Python", 1, "تتبّع أي برنامج Python وتكتبه", "دفتر درجات", [
        L("py-names", "المتغيرات أسماء لكائنات"), L("py-types", "الأنواع"), L("py-operators", "العمليات"), L("py-if", "الشروط"),
        L("py-loops", "الحلقات"), L("py-functions", "الدوال"), L("py-lists", "القوائم"), L("py-tuples", "tuples"),
        L("py-dicts", "القواميس"), L("py-sets", "المجموعات"), L("py-strings", "النصوص"), L("py-errors", "الأخطاء"), L("py-files", "الملفات"),
      ]),
      level("py", "#34d399", "Python", 2, "كود Pythonic منظّم في أصناف ووحدات", "مكتبة كتب", [
        L("py-comprehensions", "comprehensions"), L("py-classes", "الأصناف"), L("py-dunder", "الدوال الخاصة dunder"),
        L("py-inheritance", "الوراثة"), L("py-modules", "الوحدات والحزم"), L("py-generators", "المكرّرات والمولّدات"),
        L("py-exceptions", "الاستثناءات المخصّصة"), L("py-stdlib", "المكتبة القياسية"), L("py-venv", "venv و pip"),
      ]),
      level("py", "#34d399", "Python", 3, "تفهم كيف تعمل Python من الداخل", "زاحف متوازي", [
        L("py-decorators", "decorators"), L("py-context-managers", "context managers"), L("py-dataclasses", "dataclasses"),
        L("py-typing", "typing"), L("py-asyncio", "asyncio"), L("py-concurrency", "threads و processes و GIL"),
        L("py-memory", "الذاكرة وعدّ المراجع"), L("py-descriptors", "descriptors"),
      ]),
      level("py", "#34d399", "Python", 4, "مشاريع Python تُختبر وتُحزم وتُشحن", "خدمة API كاملة", [
        L("py-pytest", "pytest"), L("py-packaging", "التحزيم pyproject"), L("py-profiling", "القياس والتحسين"),
        L("py-logging", "logging والإعدادات"), L("python-server", "خادم Python"), L("py-fastapi", "FastAPI بعمق"),
        L("py-cli", "أداة CLI"), L("py-quality", "جودة الكود ruff و mypy"),
      ]),
    ],
  },
  {
    id: "go",
    name: "Go",
    tagline: "بسيطة وسريعة: خوادم تخدم آلاف المستخدمين معاً",
    color: "#22d3ee",
    levels: [
      level("go", "#22d3ee", "Go", 1, "تكتب برامج Go وترى ذاكرتها", "محلّل سجلات", [
        L("go-tool", "الأداة go"), L("go-variables", "المتغيرات والقيم الصفرية"), L("go-types", "الأنواع"), L("go-control", "التحكم"),
        L("go-functions", "الدوال وتعدّد القيم"), L("go-slices", "المصفوفات و slices"), L("go-maps", "maps"),
        L("go-strings", "النصوص و runes"), L("go-structs", "structs"), L("go-pointers", "المؤشرات"),
      ]),
      level("go", "#22d3ee", "Go", 2, "كود Go منظّم بالواجهات والأخطاء كقيم", "مخزن مفاتيح", [
        L("go-methods", "methods"), L("go-interfaces", "interfaces"), L("go-errors", "الأخطاء كقيم"), L("go-modules", "الحزم و modules"),
        L("go-defer", "defer و panic"), L("go-generics", "generics"), L("go-testing", "الاختبارات"),
      ]),
      level("go", "#22d3ee", "Go", 3, "التزامن: آلاف المهام معاً بأمان", "معالج مهام متوازي", [
        L("go-goroutines", "goroutines"), L("go-channels", "channels"), L("go-select", "select"), L("go-sync", "sync و mutex"),
        L("go-context", "context"), L("go-memory", "الذاكرة و escape analysis"),
      ]),
      level("go", "#22d3ee", "Go", 4, "خدمات Go حقيقية تُقاس وتُشحن", "خدمة HTTP كاملة", [
        L("go-server", "خادم Go"), L("go-database", "database/sql"), L("go-pprof", "القياس pprof"),
        L("go-benchmarks", "benchmarks"), L("go-patterns", "أنماط التزامن"), L("go-project", "تنظيم المشروع والنشر"),
      ]),
    ],
  },
  {
    id: "rust",
    name: "Rust",
    tagline: "سرعة C بأمان: المترجم يمنع أخطاء الذاكرة قبل التشغيل",
    color: "#fb923c",
    levels: [
      level("rust", "#fb923c", "Rust", 1, "تكتب Rust وتفهم الملكية", "حاسبة سطر أوامر", [
        L("rs-cargo", "cargo"), L("rs-variables", "المتغيرات والتغيّر"), L("rs-types", "الأنواع"), L("rs-functions", "الدوال والتحكم"),
        L("stack-heap", "Stack و Heap"), L("ownership", "الملكية"), L("borrowing", "الاستعارة"), L("rs-slices", "slices"),
        L("rs-structs", "structs"), L("rs-enums", "enum و match"), L("rs-option-result", "Option و Result"),
      ]),
      level("rust", "#fb923c", "Rust", 2, "كود Rust عام وآمن بالـ traits", "محرّك بحث نصي", [
        L("rs-collections", "المجموعات"), L("rs-strings", "النصوص"), L("rs-errors", "معالجة الأخطاء و ?"), L("rs-modules", "الوحدات و crates"),
        L("rs-traits", "traits"), L("rs-generics", "generics"), L("rs-lifetimes", "lifetimes"), L("rs-iterators", "iterators و closures"),
        L("rs-testing", "الاختبارات"),
      ]),
      level("rust", "#fb923c", "Rust", 3, "مؤشرات ذكية وتزامن وكود غير متزامن", "خادم دردشة", [
        L("rs-smart-pointers", "Box و Rc"), L("rs-refcell", "RefCell و interior mutability"), L("concurrency", "التزامن"),
        L("rs-send-sync", "Send و Sync"), L("rs-async", "async و tokio"), L("rs-macros", "macros"), L("rs-unsafe", "unsafe و FFI"),
      ]),
      level("rust", "#fb923c", "Rust", 4, "برامج Rust سريعة تُصمَّم لتدوم", "أداة CLI منشورة", [
        L("rs-performance", "الأداء و zero-cost"), L("rs-api-design", "تصميم API"), L("rs-workspaces", "workspaces"),
        L("rs-web", "خدمة ويب axum"), L("rs-cli", "أداة CLI مع clap"), L("rs-wasm", "WebAssembly"),
      ], "10"),
    ],
  },
  {
    id: "dart",
    name: "Dart و Flutter",
    tagline: "تطبيق واحد لأندرويد و iOS بلغة Dart",
    color: "#a78bfa",
    levels: [
      level("dart", "#a78bfa", "Dart", 1, "تكتب Dart بأمان null", "قائمة تسوّق", [
        L("dart", "Dart"), L("dart-null-safety", "null safety"), L("dart-types", "الأنواع"), L("dart-control", "التحكم"),
        L("dart-functions", "الدوال"), L("dart-collections", "المجموعات"), L("dart-strings", "النصوص"), L("dart-classes", "الأصناف"),
      ]),
      level("dart", "#a78bfa", "Dart · Flutter", 2, "تبني شاشات Flutter تتفاعل", "تطبيق ملاحظات", [
        L("dart-constructors", "المُنشئات"), L("dart-mixins", "الوراثة و mixins"), L("dart-generics", "generics"),
        L("dart-async", "Future و Stream"), L("dart-isolates", "isolates"), L("widgets", "Widgets"), L("dart-layout", "التخطيط"),
        L("state", "إدارة الحالة"), L("dart-navigation", "التنقّل"), L("dart-forms", "النماذج"),
      ]),
      level("dart", "#a78bfa", "Flutter", 3, "تطبيقات تتصل بالإنترنت وتتحرك بسلاسة", "تطبيق متجر", [
        L("dart-state-mgmt", "Riverpod و Bloc"), L("flutter-api", "الاتصال بالـ API"), L("dart-storage", "التخزين المحلي"),
        L("dart-animations", "الأنميشن"), L("dart-custom-paint", "الرسم المخصّص"), L("dart-platform-channels", "platform channels"),
      ], "9"),
      level("dart", "#a78bfa", "Flutter", 4, "تطبيق جاهز للمتاجر ويعيش طويلاً", "تطبيق منشور على المتجر", [
        L("dart-testing", "الاختبارات"), L("dart-architecture", "معمارية التطبيق"), L("dart-performance", "الأداء"),
        L("dart-i18n", "RTL والترجمة"), L("dart-release", "النشر على المتاجر"),
      ]),
    ],
  },
];

export const trackById = (id: string) => tracks.find((t) => t.id === id);

/** The track and level a lesson belongs to (first match), for breadcrumbs. */
export function findTrackLevel(slug: string) {
  for (const t of tracks) for (const lv of t.levels) if (lv.lessons.some((l) => l.slug === slug)) return { track: t, level: lv };
  return undefined;
}
