import type { Frame, HeapObj, Lesson, Slot } from "@/lib/types";

const fn: Slot = { name: "parse_age", value: "ƒ parse_age", type: "function" };
const prog = (...vars: Slot[]): Frame => ({ id: 0, name: "البرنامج", vars });
const call = (...vars: Slot[]): Frame => ({ id: 1, name: "parse_age", vars });
const str = (name: string, v: string): Slot => ({ name, value: `"${v}"`, type: "string" });
const MSG = "invalid literal for int() with base 10: 'abc'";
const exc: HeapObj = {
  id: 1,
  kind: "object",
  items: [
    { name: "type", value: '"ValueError"', type: "string" },
    { name: "message", value: JSON.stringify(MSG), type: "string" },
  ],
};

export const pyErrors: Lesson = {
  slug: "py-errors",
  stage: 0,
  number: "1.12",
  title: "الأخطاء",
  subtitle: "الخطأ كائن يُرفع: يوقف الإطار الحالي وينزل في المكدّس إطاراً إطاراً حتى يلتقطه except مناسب",
  minutes: 18,
  singleLanguage: true,
  problem: {
    title: "مدخل واحد سيّئ يوقف كل شيء",
    body: "آلة تقسم 100 على رقم يكتبه المستخدم. أدخل قيماً مختلفة، مرة بلا حماية ومرة مع try. ماذا يحدث لبقية البرنامج؟",
    demo: "pyErrors",
  },
  scene: {
    code: {
      py: `def parse_age(text):
    age = int(text)
    if age < 0:
        raise ValueError("negative age")
    return age


try:
    print(parse_age("21"))
    print(parse_age("abc"))
except ValueError as err:
    print("bad input:", err)
print("still running")`,
    },
    steps: [
      {
        line: null,
        say: "دالة تحوّل نصاً إلى عمر، نستدعيها مرتين: بنص سليم، ثم بنص لا يصلح رقماً. راقب المكدّس حين يقع الخطأ.",
        memory: [],
        frames: [prog()],
        heap: [],
      },
      {
        line: 1,
        say: "def تبني كائن دالة ويُلصق عليه الاسم parse_age. لا يعمل شيء داخلها بعد.",
        memory: [],
        frames: [prog(fn)],
        heap: [],
        changed: ["parse_age"],
      },
      {
        line: 8,
        say: "try تفتح منطقة محمية: إن رُفع داخلها خطأ من نوع ValueError، يقفز التنفيذ إلى except.",
        memory: [],
        frames: [prog(fn)],
        heap: [],
      },
      {
        line: 9,
        say: "استدعاء parse_age(\"21\"): إطار جديد فوق المكدّس، فيه الاسم text.",
        memory: [],
        frames: [prog(fn), call(str("text", "21"))],
        heap: [],
        changed: ["text"],
      },
      {
        line: 2,
        say: "int(\"21\") نجحت، فصار age يشير إلى 21.",
        memory: [],
        frames: [prog(fn), call(str("text", "21"), { name: "age", value: "21", type: "number" })],
        heap: [],
        changed: ["age"],
      },
      {
        line: 3,
        say: "age < 0 تعطي False، فنتخطى raise وننزل إلى return.",
        memory: [],
        frames: [prog(fn), call(str("text", "21"), { name: "age", value: "21", type: "number" })],
        heap: [],
        read: ["age"],
      },
      {
        line: 5,
        say: "return تُرجع 21 ويُزال الإطار. print في السطر 9 تطبع 21.",
        memory: [],
        frames: [prog(fn)],
        heap: [],
        output: ["21"],
      },
      {
        line: 10,
        say: "استدعاء parse_age(\"abc\"): إطار جديد، وtext هذه المرة \"abc\".",
        memory: [],
        frames: [prog(fn), call(str("text", "abc"))],
        heap: [],
        changed: ["text"],
        output: ["21"],
      },
      {
        line: 2,
        say: "int(\"abc\") لا تستطيع. تبني Python كائن خطأ ValueError وترفعه: السطر يتوقف هنا، ولا except داخل الدالة، فيُزال إطارها كله دون أن تُرجع شيئاً.",
        memory: [],
        frames: [prog(fn), call(str("text", "abc"))],
        heap: [exc],
        changedHeap: [1],
        error: `ValueError: ${MSG}`,
        output: ["21"],
      },
      {
        line: 11,
        say: "الخطأ نزل إلى إطار البرنامج فوجد try. نوعه ValueError يطابق except، فيُلصق عليه الاسم err. أما print في السطر 10 فلم تكتمل أبداً.",
        memory: [],
        frames: [prog(fn, { name: "err", value: "", type: "ref", ref: 1 })],
        heap: [exc],
        changed: ["err"],
        output: ["21"],
      },
      {
        line: 12,
        say: "نطبع رسالة الخطأ من الكائن err بدل أن يتوقف البرنامج.",
        memory: [],
        frames: [prog(fn, { name: "err", value: "", type: "ref", ref: 1 })],
        heap: [exc],
        read: ["err"],
        output: ["21", `bad input: ${MSG}`],
      },
      {
        line: 13,
        say: "انتهت except، وحُذف الاسم err معها. البرنامج يكمل طبيعياً. لولا try لتوقف كله عند السطر 2 وطبعت Python تقرير الخطأ (traceback).",
        memory: [],
        frames: [prog(fn)],
        heap: [],
        output: ["21", `bad input: ${MSG}`, "still running"],
      },
    ],
    notes: {
      py: "في Python يُكتب الكود المتفائل أولاً ثم يُلتقط الخطأ (أسلوب EAFP: أسهل أن تطلب السماح من أن تستأذن). التقط دائماً النوع الذي تتوقعه، مثل except ValueError، لا except فارغة تبتلع أخطاء كل شيء.",
    },
  },
  playground: {
    kind: "trace",
    lang: "py",
    intro: "سحب من رصيد. الدالة ترفع خطأها بنفسها بـ raise حين يكون الطلب مستحيلاً. تتبّع: أي سطر يُتخطى، ومتى يعمل else و finally؟",
    starter: `def withdraw(balance, amount):
    if amount > balance:
        raise ValueError("not enough money")
    return balance - amount


balance = 100
try:
    balance = withdraw(balance, 30)
    balance = withdraw(balance, 500)
except ValueError as err:
    print("refused:", err)
else:
    print("all done")
finally:
    print("balance:", balance)`,
    challenges: [
      "توقّع قبل التشغيل: كم يكون الرصيد في النهاية، 70 أم 100 أم -430؟",
      "غيّر 500 إلى 50. أي سطر يُطبع الآن بدل refused؟",
      "اجعل الطلب الثاني withdraw(balance, \"ten\"). أي خطأ يُرفع؟ هل التقطه except ValueError؟ وهل عمل finally مع ذلك؟",
      "أضف except TypeError: print(\"amount must be a number\") بعد except الأول، وأعد التشغيل.",
    ],
  },
  predict: [
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `try:
    print("A")
    x = 1 / 0
    print("B")
except ZeroDivisionError:
    print("C")
print("D")`,
      options: ["A C D", "A B C D", "A D"],
      answer: 0,
      why: "حين يُرفع الخطأ في السطر الثالث يتوقف الباقي من try فوراً، فلا تُطبع B. ينتقل التنفيذ إلى except، ثم يكمل بعدها.",
    },
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `try:
    total = int("7") + "1"
except ValueError:
    print("bad number")
print("end")`,
      options: ["لا شيء: يتوقف البرنامج بخطأ TypeError", "bad number ثم end", "end فقط"],
      answer: 0,
      why: "int(\"7\") نجحت. الخطأ من جمع رقم ونص، ونوعه TypeError. except ValueError لا تطابقه، فيتابع الخطأ نزوله حتى يخرج من البرنامج.",
    },
    {
      question: "ماذا يطبع؟",
      lang: "py",
      code: `def f():
    try:
        return "try"
    finally:
        print("cleanup")


print(f())`,
      options: ["cleanup ثم try", "try ثم cleanup", "try فقط"],
      answer: 0,
      why: "finally تعمل قبل أن يغادر التنفيذ try بأي طريقة، حتى عبر return. القيمة محجوزة للرجوع، فتطبع finally أولاً، ثم يطبع print المستدعي القيمة.",
    },
  ],
  code: {
    intro: "برامج حقيقية تقرأ مدخلات لا تثق بها. النمط المحترف: دالة صغيرة ترفع خطأً واضحاً بنوع ورسالة، والمستدعي يقرر ماذا يفعل: يتخطى المدخل، ويسجّله، ويكمل.",
    runnerLang: "py",
    runnerStarter: `def read_score(text):
    score = int(text)
    if not 0 <= score <= 100:
        raise ValueError(f"score out of range: {score}")
    return score


inputs = ["95", "abc", "120", "70"]
valid = []
for raw in inputs:
    try:
        valid.append(read_score(raw))
    except ValueError as err:
        print(f"skipped {raw!r}: {err}")
print("valid:", valid)
# Try: add "" and None to inputs. Which one is not a ValueError?
`,
  },
  exercises: [
    {
      kind: "order",
      title: "قيمة احتياطية",
      lang: "py",
      prompt: "رتّب الأسطر: حاول التحويل، وإن فشل فاجعل القيمة 0، ثم اطبعها.",
      lines: ["try:", '    value = int("x1")', "except ValueError:", "    value = 0", "print(value)"],
      expected: "0",
    },
    {
      kind: "fill",
      title: "النوع الصحيح",
      lang: "py",
      prompt: "أي نوع خطأ يلتقط هذه القسمة؟",
      template: 'try:\n    print(10 / 0)\nexcept ___:\n    print("cannot divide")',
      options: ["ZeroDivisionError", "ValueError", "KeyError"],
      expected: "cannot divide",
    },
    {
      kind: "fix",
      title: "صنف غير موجود",
      lang: "py",
      prompt: "البرنامج يتوقف حين لا يجد الصنف. اجعله يطبع not found ثم يكمل ويطبع done.",
      code: 'prices = {"tea": 5}\nitem = "coffee"\nprint(prices[item])\nprint("done")',
      expected: "not found\ndone",
      hint: "ضع print(prices[item]) داخل try، والتقط KeyError.",
      solution: 'prices = {"tea": 5}\nitem = "coffee"\ntry:\n    print(prices[item])\nexcept KeyError:\n    print("not found")\nprint("done")',
    },
    {
      kind: "write",
      title: "كلمة مرور قصيرة",
      lang: "py",
      prompt: "اكتب check_password(pw) التي ترفع ValueError(\"too short\") إذا كان الطول أقل من 8، وإلا ترجع \"ok\". جرّبها على \"abc\" ثم \"secret123\" داخل try، واطبع الرجوع أو رسالة الخطأ.",
      starter: '# write check_password(pw), then call it on "abc" and "secret123"\n',
      expected: "too short\nok",
      hint: "if len(pw) < 8: raise ValueError(\"too short\"). وفي الحلقة: except ValueError as err: print(err)",
      solution:
        'def check_password(pw):\n    if len(pw) < 8:\n        raise ValueError("too short")\n    return "ok"\n\n\nfor pw in ["abc", "secret123"]:\n    try:\n        print(check_password(pw))\n    except ValueError as err:\n        print(err)',
    },
  ],
  quiz: [
    {
      question: "الخطأ يقع داخل a، و try في البرنامج. ماذا يطبع؟",
      code: 'def a():\n    return int("z")\n\n\ndef b():\n    return a() + 1\n\n\ntry:\n    print(b())\nexcept ValueError:\n    print("caught")',
      options: ["caught", "لا شيء، يتوقف البرنامج", "1"],
      answer: 0,
      why: "الخطأ يُزيل إطار a، ثم إطار b لأنه بلا try، ثم يصل إلى إطار البرنامج فيجد except مطابقة. لا يهمّ عمق المكان الذي رُفع فيه.",
    },
    {
      question: "ماذا يطبع؟",
      code: 'try:\n    x = int("5")\nexcept ValueError:\n    print("bad")\nelse:\n    print("good", x)',
      options: ["good 5", "bad", "bad ثم good 5"],
      answer: 0,
      why: "else تعمل فقط إن انتهت try بلا خطأ. هنا نجح التحويل، فتُتخطى except وتعمل else.",
    },
    {
      question: "ماذا يطبع قبل أن يتوقف؟",
      code: 'try:\n    print(1)\n    raise KeyError("k")\nfinally:\n    print(2)\nprint(3)',
      options: ["1 ثم 2، ثم يتوقف بـ KeyError", "1 ثم 2 ثم 3", "1 ثم يتوقف"],
      answer: 0,
      why: "لا except هنا، فالخطأ لن يُلتقط. لكن finally تعمل دائماً في طريق الخروج، ثم يتابع الخطأ نزوله ويوقف البرنامج قبل السطر الأخير.",
    },
    {
      question: "ماذا يطبع؟",
      code: "try:\n    nums = [1, 2]\n    print(nums[5])\nexcept Exception as e:\n    print(type(e).__name__)",
      options: ["IndexError", "Exception", "KeyError"],
      answer: 0,
      why: "الخطأ كائن له صنف. Exception أصل عام تلتقط به أصنافاً كثيرة، لكن الكائن نفسه يبقى IndexError: خانة غير موجودة في قائمة.",
    },
    {
      question: "لماذا يكتب المحترفون except ValueError بدل except فارغة؟",
      options: [
        "الفارغة تبتلع كل خطأ، حتى خطأ إملائي في اسم متغير، فيختفي العيب بصمت",
        "الفارغة أبطأ في التنفيذ",
        "الفارغة لا تلتقط ValueError",
      ],
      answer: 0,
      why: "التقط فقط ما تعرف كيف تعالجه. NameError من اسم مكتوب خطأ يجب أن يظهر فوراً لتصلحه، لا أن يتحول إلى رسالة \"bad input\".",
    },
  ],
  next: "py-files",
};
