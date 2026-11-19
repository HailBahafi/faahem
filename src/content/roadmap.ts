export interface RoadmapLesson {
  slug: string;
  title: string;
}

export interface Stage {
  id: number;
  title: string;
  goal: string;
  color: string;
  langs: string;
  project?: string;
  lessons: RoadmapLesson[];
}

const L = (slug: string, title: string): RoadmapLesson => ({ slug, title });

export const stages: Stage[] = [
  { id: 0, title: "كيف يعمل الحاسوب", goal: "الصورة التي تفهم بها كل ما بعدها", color: "#94a3b8", langs: "—", lessons: [L("bits", "البت والبايت"), L("ram", "الذاكرة RAM"), L("cpu", "المعالج ودورة التنفيذ"), L("code-to-run", "من الكود إلى التنفيذ")] },
  { id: 1, title: "أساسيات البرمجة", goal: "تتبّع أي برنامج صغير في رأسك", color: "#2dd4bf", langs: "JS + مقارنة بالست لغات", project: "آلة حاسبة ولعبة تخمين", lessons: [L("variables", "المتغيرات والذاكرة"), L("types", "أنواع البيانات"), L("operators", "العمليات والتعابير"), L("if", "الشروط if"), L("switch", "switch"), L("while", "حلقة while"), L("for", "حلقة for"), L("functions", "الدوال ومكدّس الاستدعاء"), L("scope", "النطاق"), L("arrays", "المصفوفات"), L("strings", "النصوص"), L("objects", "الكائنات"), L("references", "القيمة مقابل المرجع"), L("recursion", "العودية"), L("errors", "الأخطاء")] },
  { id: 2, title: "التفكير كمبرمج", goal: "من مسألة إلى خطوات إلى كود", color: "#a78bfa", langs: "JS + Python", project: "حل 30 مسألة", lessons: [L("decompose", "تفكيك المشكلة"), L("tracing", "التتبّع اليدوي"), L("debugging", "اصطياد الأخطاء")] },
  { id: 3, title: "هياكل البيانات والخوارزميات", goal: "اختر البنية الصحيحة وقِس سرعتها", color: "#f472b6", langs: "JS + Python + Go", project: "مستكشف المسارات", lessons: [L("array-ds", "المصفوفة في الذاكرة"), L("linked-list", "القائمة المترابطة"), L("stack", "المكدّس"), L("queue", "الطابور"), L("hash", "جدول التجزئة"), L("tree", "الشجرة"), L("graph", "الرسم البياني"), L("sorting", "الترتيب"), L("searching", "البحث"), L("big-o", "Big-O")] },
  { id: 4, title: "الأدوات", goal: "تعمل كمبرمج محترف", color: "#fbbf24", langs: "Terminal", project: "أول مستودع على GitHub", lessons: [L("terminal", "الطرفية"), L("git", "Git من الداخل"), L("packages", "مدير الحزم")] },
  { id: 5, title: "كيف يعمل الويب", goal: "ماذا يحدث بين ضغطة الرابط وظهور الصفحة", color: "#60a5fa", langs: "—", lessons: [L("internet", "الإنترنت والحزم"), L("dns", "DNS"), L("http", "HTTP"), L("browser", "كيف يرسم المتصفح الصفحة")] },
  { id: 6, title: "الواجهة الأمامية", goal: "واجهات حقيقية تتفاعل مع المستخدم", color: "#fb923c", langs: "HTML · CSS · JS · TS · React", project: "متجر صغير", lessons: [L("html", "HTML"), L("box-model", "CSS: الصندوق"), L("flex-grid", "Flex و Grid"), L("dom", "DOM"), L("events", "الأحداث"), L("event-loop", "Event loop"), L("async", "async و Promise"), L("typescript", "TypeScript"), L("react", "React")] },
  { id: 7, title: "الخادم", goal: "API آمن وسريع", color: "#4ade80", langs: "Node · Go · Python", project: "API كامل", lessons: [L("rest", "REST"), L("node-server", "خادم Node"), L("go-server", "خادم Go"), L("python-server", "خادم Python"), L("auth", "المصادقة"), L("validation", "التحقق من المدخلات")] },
  { id: 8, title: "قواعد البيانات", goal: "تخزين البيانات واسترجاعها بكفاءة", color: "#38bdf8", langs: "SQL · Redis", project: "ربط المتجر بقاعدة بيانات", lessons: [L("sql", "SQL"), L("relations", "العلاقات"), L("indexes", "الفهارس"), L("transactions", "المعاملات"), L("redis", "Redis")] },
  { id: 9, title: "تطبيقات الجوال", goal: "تطبيق واحد لأندرويد و iOS", color: "#22d3ee", langs: "Dart · Flutter", project: "تطبيق للمتجر", lessons: [L("dart", "Dart"), L("widgets", "Widgets"), L("state", "إدارة الحالة"), L("flutter-api", "الاتصال بالـ API")] },
  { id: 10, title: "Rust والعمق", goal: "تحكم كامل في الذاكرة بأمان", color: "#f87171", langs: "Rust", project: "أداة سطر أوامر", lessons: [L("stack-heap", "Stack و Heap"), L("ownership", "الملكية"), L("borrowing", "الاستعارة"), L("concurrency", "التزامن")] },
  { id: 11, title: "النشر", goal: "مشروعك على الإنترنت ويعمل دائماً", color: "#c084fc", langs: "Linux · Docker", project: "نشر المشروع", lessons: [L("linux", "Linux"), L("docker", "Docker"), L("ci-cd", "CI/CD"), L("monitoring", "المراقبة")] },
  { id: 12, title: "هندسة البرمجيات", goal: "كود يعيش سنوات ويكبر بأمان", color: "#e2e8f0", langs: "كل اللغات", project: "مشروع التخرج", lessons: [L("testing", "الاختبارات"), L("clean-code", "الكود النظيف"), L("security", "الأمان"), L("system-design", "تصميم الأنظمة")] },
];

export function findStage(slug: string) {
  return stages.find((s) => s.lessons.some((l) => l.slug === slug));
}

export function lessonTitle(slug: string) {
  for (const s of stages) for (const l of s.lessons) if (l.slug === slug) return l.title;
  return slug;
}
