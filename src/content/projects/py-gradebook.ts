import type { Project } from "@/lib/types";

export const pyGradebook: Project = {
  slug: "py-gradebook",
  stage: 0,
  track: "py",
  level: 1,
  title: "دفتر درجات",
  brief:
    "دفتر درجات حقيقي لفصل دراسي. الدرجات تصل أسطراً نصية مثل \"Sara, 92\"، بعضها سليم وبعضها فيه أخطاء. ستقرأها إلى قاموس كل قيمة فيه قائمة درجات، وترفض المدخلات الفاسدة بأخطاء واضحة، ثم تحسب المتوسطات والتقديرات وتكتب تقريراً. كل دالة صغيرة وتُختبر وحدها، وكلها تستعمل ما تعلمته في هذا المستوى: القوائم والقواميس والنصوص والأخطاء والملفات.",
  lang: "py",
  steps: [
    "اكتب add_score(book, name, score) التي تضيف الدرجة إلى قائمة الطالب في القاموس book (وتنشئ القائمة إن لم يكن له واحدة). الدرجة يجب أن تكون int بين 0 و 100، وإلا ارفع ValueError. الدالة تعدّل book في مكانه ولا ترجع شيئاً.",
    "اكتب average(scores) التي ترجع متوسط القائمة مقرّباً إلى منزلة عشرية واحدة بـ round، و None للقائمة الفارغة.",
    "اكتب letter(avg) التي ترجع التقدير: A من 90، و B من 80، و C من 70، و D من 60، وإلا F.",
    "اكتب parse_line(line) التي تحوّل \"Sara, 92\" إلى tuple (\"Sara\", 92): قسّم عند الفاصلة، ونظّف المسافات، وحوّل الدرجة إلى int. إن لم يكن في السطر جزءان بالضبط، أو كان الاسم فارغاً، ارفع ValueError. (int نفسها ترفع ValueError لدرجة غير رقمية.)",
    "اكتب load_book(lines) التي تمرّ على أسطر (ملف مفتوح أو قائمة نصوص)، وتتخطى الأسطر الفارغة، وتضيف كل سطر سليم بـ parse_line و add_score، وتعدّ الأسطر المرفوضة بدل أن تتوقف. ترجع tuple: (book, rejected).",
    "اكتب report(book) التي ترجع قائمة أسطر مرتّبة بالاسم، كل سطر بالشكل \"Huda: 85.0 B\".",
    "اكتب top_student(book) التي ترجع اسم صاحب أعلى متوسط، أو None إن كان الدفتر فارغاً.",
    "اضغط «شغّل الاختبارات». لكل اختبار يفشل: تتبّع الدالة بيدك على مدخلاته، أو اطبع القيم داخلها، حتى تجد السطر المخطئ.",
  ],
  starter: `def add_score(book, name, score):
    # create the student's list if needed; reject scores outside 0..100
    pass


def average(scores):
    # rounded to one decimal place, None for an empty list
    pass


def letter(avg):
    # A >= 90, B >= 80, C >= 70, D >= 60, else F
    pass


def parse_line(line):
    # "Sara, 92" -> ("Sara", 92)
    pass


def load_book(lines):
    # skip blank lines, count rejected lines, return (book, rejected)
    pass


def report(book):
    # ["Huda: 85.0 B", ...] sorted by name
    pass


def top_student(book):
    # the name with the highest average, or None
    pass


print(load_book(["Sara, 92", "Omar, abc", "Sara, 88"]))
`,
  solution: `def add_score(book, name, score):
    if not isinstance(score, int) or not 0 <= score <= 100:
        raise ValueError(f"invalid score for {name}: {score!r}")
    if name not in book:
        book[name] = []
    book[name].append(score)


def average(scores):
    if not scores:
        return None
    return round(sum(scores) / len(scores), 1)


def letter(avg):
    if avg >= 90:
        return "A"
    if avg >= 80:
        return "B"
    if avg >= 70:
        return "C"
    if avg >= 60:
        return "D"
    return "F"


def parse_line(line):
    parts = line.split(",")
    if len(parts) != 2:
        raise ValueError(f"expected 'name, score': {line!r}")
    name = parts[0].strip()
    if not name:
        raise ValueError(f"missing name: {line!r}")
    return name, int(parts[1].strip())


def load_book(lines):
    book = {}
    rejected = 0
    for line in lines:
        if not line.strip():
            continue
        try:
            name, score = parse_line(line)
            add_score(book, name, score)
        except ValueError:
            rejected += 1
    return book, rejected


def report(book):
    lines = []
    for name in sorted(book):
        avg = average(book[name])
        lines.append(f"{name}: {avg} {letter(avg)}")
    return lines


def top_student(book):
    best_name = None
    best_avg = None
    for name, scores in book.items():
        avg = average(scores)
        if best_avg is None or avg > best_avg:
            best_name, best_avg = name, avg
    return best_name
`,
  tests: [
    {
      name: "add_score ينشئ قائمة الطالب ويضيف إليها في المكان نفسه",
      code: `b = {}
add_score(b, "Sara", 90)
add_score(b, "Sara", 80)
add_score(b, "Omar", 70)
print(str(b == {"Sara": [90, 80], "Omar": [70]}).lower())`,
    },
    {
      name: "add_score يرفض الدرجات خارج 0..100 بـ ValueError ولا يغيّر الدفتر",
      code: `b = {"Sara": [90]}
fails = 0
for bad in [101, -1, "95"]:
    try:
        add_score(b, "Sara", bad)
    except ValueError:
        fails += 1
print(str(fails == 3 and b == {"Sara": [90]}).lower())`,
    },
    {
      name: "average يقرّب إلى منزلة واحدة، و None للقائمة الفارغة",
      code: `print(str(average([90, 85, 80]) == 85.0 and average([70, 75, 75]) == 73.3 and average([]) is None).lower())`,
    },
    {
      name: "letter يعطي التقدير الصحيح عند الحدود",
      code: `print(str([letter(x) for x in [100, 90, 89.9, 80, 70, 60, 59.9, 0]] == ["A", "A", "B", "B", "C", "D", "F", "F"]).lower())`,
    },
    {
      name: "parse_line ينظّف المسافات ويرجع tuple",
      code: `print(str(parse_line("Sara, 92") == ("Sara", 92) and parse_line("  Omar ,70 \\n") == ("Omar", 70)).lower())`,
    },
    {
      name: "parse_line يرفع ValueError للأسطر الفاسدة",
      code: `fails = 0
for bad in ["Sara 92", "Sara, 9, 2", ", 80", "Sara, abc"]:
    try:
        parse_line(bad)
    except ValueError:
        fails += 1
print(str(fails == 4).lower())`,
    },
    {
      name: "load_book يقرأ ملفاً (StringIO)، يتخطى الفارغ ويعدّ المرفوض",
      code: `import io
f = io.StringIO("Sara, 92\\nOmar, abc\\n\\nSara, 88\\nHuda, 150\\nOmar, 75\\n")
b, rejected = load_book(f)
print(str(b == {"Sara": [92, 88], "Omar": [75]} and rejected == 2).lower())`,
    },
    {
      name: "report مرتّب بالاسم وبالشكل الصحيح",
      code: `b = {"Sara": [92, 88], "Huda": [85], "Omar": [50, 60]}
print(str(report(b) == ["Huda: 85.0 B", "Omar: 55.0 F", "Sara: 90.0 A"]).lower())`,
    },
    {
      name: "top_student يجد صاحب أعلى متوسط، و None لدفتر فارغ",
      code: `b = {"Sara": [92, 88], "Huda": [95, 70], "Omar": [91]}
print(str(top_student(b) == "Omar" and top_student({}) is None).lower())`,
    },
  ],
};
