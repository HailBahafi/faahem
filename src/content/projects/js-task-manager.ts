import type { Project } from "@/lib/types";

export const jsTaskManager: Project = {
  slug: "js-task-manager",
  stage: 0,
  track: "js",
  level: 2,
  title: "مدير مهام",
  brief:
    "قلب تطبيق مهام حقيقي، بلا واجهة: صنف TaskManager يحفظ المهام في Map خاصة به، ويعطي كل مهمة رقماً من مولّد أرقام مبني بـ closure، ويجيب عن الأسئلة بـ filter و map و reduce و Set. القاعدة الذهبية: لا أحد خارج الصنف يلمس المهام المخزّنة؛ كل ما يخرج منه نسخة. تجمع هنا كل المستوى: الإغلاق، والأصناف والحقول الخاصة، والتفكيك بقيم افتراضية، والنشر للنسخ، و Map و Set، ودوال المصفوفات.",
  lang: "js",
  steps: [
    "اكتب createIdGenerator(prefix) ترجع دالة. كل نداء لها يرجع المعرّف التالي: \"t1\" ثم \"t2\"... العدّاد متغير محلي داخل createIdGenerator، فلكل مولّد عدّاده المستقل.",
    "في class TaskManager: حقل خاص #tasks = new Map() (المفتاح id والقيمة المهمة)، وحقل خاص #nextId = createIdGenerator(\"t\"). واكتب دالة مساعدة copy(task) خارج الصنف ترجع { ...task, tags: [...task.tags] }: نسخة لا تشارك المصفوفة الداخلية.",
    "add(title, { priority = \"normal\", tags = [] } = {}): تبني { id, title, priority, tags, done: false } وتحفظها في #tasks، وترجع نسخة منها. انسخ tags عند الحفظ أيضاً، حتى لا يغيّر المستدعي مصفوفته فتتغير المهمة.",
    "get(id) ترجع نسخة من المهمة أو undefined. و complete(id) تجعل done = true وترجع true، أو false إن لم توجد المهمة. و remove(id) ترجع true إن حذفت شيئاً.",
    "list({ done, tag } = {}): كل المهام بترتيب إضافتها (Map تحفظه)، مصفّاة بـ filter: إن أُعطي done فقط المطابقة له، وإن أُعطي tag فقط التي فيها هذا الوسم. ترجع نسخاً.",
    "byPriority(): نسخ المهام مرتبة high ثم normal ثم low، ومع الأولوية نفسها بترتيب الإضافة (sort في JavaScript مستقرّ).",
    "stats(): كائن { total, done, open } بـ reduce واحدة. و tags(): كل الوسوم بلا تكرار (Set) مرتبة أبجدياً. ثم اضغط «شغّل الاختبارات».",
  ],
  starter: `function createIdGenerator(prefix) {
  // keep a counter here and return a function that uses it
}

function copy(task) {
  // a new object, and a new tags array
}

class TaskManager {
  // #tasks = new Map();
  // #nextId = createIdGenerator("t");

  add(title, { priority = "normal", tags = [] } = {}) {}

  get(id) {}

  complete(id) {}

  remove(id) {}

  list({ done, tag } = {}) {}

  byPriority() {}

  stats() {}

  tags() {}
}

const tm = new TaskManager();
console.log(tm.add("write tests", { priority: "high", tags: ["work"] }));
`,
  solution: `function createIdGenerator(prefix) {
  let count = 0;
  return () => {
    count += 1;
    return \`\${prefix}\${count}\`;
  };
}

function copy(task) {
  return { ...task, tags: [...task.tags] };
}

const RANK = { high: 0, normal: 1, low: 2 };

class TaskManager {
  #tasks = new Map();
  #nextId = createIdGenerator("t");

  add(title, { priority = "normal", tags = [] } = {}) {
    const task = { id: this.#nextId(), title, priority, tags: [...tags], done: false };
    this.#tasks.set(task.id, task);
    return copy(task);
  }

  get(id) {
    const task = this.#tasks.get(id);
    return task ? copy(task) : undefined;
  }

  complete(id) {
    const task = this.#tasks.get(id);
    if (!task) return false;
    task.done = true;
    return true;
  }

  remove(id) {
    return this.#tasks.delete(id);
  }

  list({ done, tag } = {}) {
    return [...this.#tasks.values()]
      .filter((t) => done === undefined || t.done === done)
      .filter((t) => tag === undefined || t.tags.includes(tag))
      .map(copy);
  }

  byPriority() {
    return this.list().sort((a, b) => RANK[a.priority] - RANK[b.priority]);
  }

  stats() {
    return this.list().reduce(
      (acc, t) => {
        acc.total += 1;
        if (t.done) acc.done += 1;
        else acc.open += 1;
        return acc;
      },
      { total: 0, done: 0, open: 0 },
    );
  }

  tags() {
    return [...new Set(this.list().flatMap((t) => t.tags))].sort();
  }
}

const tm = new TaskManager();
console.log(tm.add("write tests", { priority: "high", tags: ["work"] }));
`,
  tests: [
    {
      name: "createIdGenerator: كل مولّد له عدّاده المستقل",
      code: `const a = createIdGenerator("t");
const b = createIdGenerator("x");
console.log(a() === "t1" && a() === "t2" && b() === "x1" && a() === "t3");`,
    },
    {
      name: "add يعطي معرّفات متتالية وقيماً افتراضية",
      code: `const m = new TaskManager();
const t1 = m.add("buy milk");
const t2 = m.add("call Sara", { priority: "high", tags: ["home"] });
console.log(t1.id === "t1" && t2.id === "t2" && t1.priority === "normal" && t1.tags.length === 0 && t1.done === false && t2.priority === "high" && t2.tags[0] === "home");`,
    },
    {
      name: "ما يخرج من الصنف نسخة: تعديله لا يغيّر المهمة المخزّنة",
      code: `const m = new TaskManager();
const myTags = ["work"];
const t = m.add("report", { tags: myTags });
t.title = "changed";
t.tags.push("hacked");
myTags.push("later");
const again = m.get(t.id);
again.tags.push("x");
const stored = m.get(t.id);
console.log(stored.title === "report" && stored.tags.length === 1 && stored.tags[0] === "work");`,
    },
    {
      name: "complete و get: الإنجاز يُحفظ، والمهمة المجهولة ترجع false و undefined",
      code: `const m = new TaskManager();
const t = m.add("read");
console.log(m.complete(t.id) === true && m.get(t.id).done === true && m.complete("t99") === false && m.get("t99") === undefined);`,
    },
    {
      name: "remove يحذف مرة واحدة فقط",
      code: `const m = new TaskManager();
m.add("a");
const b = m.add("b");
console.log(m.remove(b.id) === true && m.remove(b.id) === false && m.list().length === 1);`,
    },
    {
      name: "list يصفّي بـ done و tag، ويحفظ ترتيب الإضافة",
      code: `const m = new TaskManager();
m.add("a", { tags: ["work"] });
const b = m.add("b", { tags: ["home"] });
m.add("c", { tags: ["work", "home"] });
m.complete(b.id);
const titles = (xs) => xs.map((t) => t.title).join("");
console.log(titles(m.list()) === "abc" && titles(m.list({ done: false })) === "ac" && titles(m.list({ done: true })) === "b" && titles(m.list({ tag: "home" })) === "bc" && titles(m.list({ tag: "home", done: false })) === "c");`,
    },
    {
      name: "byPriority: high ثم normal ثم low، والمتساوية بترتيب الإضافة",
      code: `const m = new TaskManager();
m.add("n1");
m.add("l1", { priority: "low" });
m.add("h1", { priority: "high" });
m.add("n2");
m.add("h2", { priority: "high" });
console.log(m.byPriority().map((t) => t.title).join(",") === "h1,h2,n1,n2,l1" && m.list()[0].title === "n1");`,
    },
    {
      name: "stats يعدّ الكل والمنجز والمفتوح",
      code: `const m = new TaskManager();
const empty = m.stats();
const a = m.add("a");
m.add("b");
m.add("c");
m.complete(a.id);
const s = m.stats();
console.log(empty.total === 0 && empty.done === 0 && empty.open === 0 && s.total === 3 && s.done === 1 && s.open === 2);`,
    },
    {
      name: "tags: كل الوسوم بلا تكرار ومرتبة",
      code: `const m = new TaskManager();
m.add("a", { tags: ["work", "urgent"] });
m.add("b", { tags: ["home", "work"] });
m.add("c");
console.log(m.tags().join(",") === "home,urgent,work");`,
    },
  ],
};
