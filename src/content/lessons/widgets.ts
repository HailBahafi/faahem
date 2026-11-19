import type { Cell, Lesson, Scene } from "@/lib/types";

/** A node of the widget tree as the scene draws it: the widget's name and what it holds. */
const w = (name: string, holds: string): Cell => ({ name, value: holds, type: "none" });
const txt = (name: string, value: string): Cell => ({ name, value: `"${value}"`, type: "string" });

/** A hand-written answer scene in Dart. */
const flutter = (dart: string, steps: Scene["steps"]): Scene => ({ code: { dart }, steps });

const card = w("TeaCard", "StatelessWidget");
const padding = w("└ Padding", "16 · child: 1");
const column = w("  └ Column", "children: 2");
const tea = txt("    ├ Text", "Tea");
const button = w("    └ ElevatedButton", "child: 1");
const label = txt("      └ Text", "Add");

export const widgets: Lesson = {
  slug: "widgets",
  stage: 9,
  number: "9.2",
  title: "Widgets",
  subtitle: "كل ما على الشاشة widget، والشاشة شجرة منها يرسمها Flutter بنفسه",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "شاشة من صناديق داخل صناديق",
    body: "على اليمين شجرة، وعلى اليسار هاتف. اختر عقدة في الشجرة وأضف إليها Column أو Row أو Text أو زراً، أو احذفها. الهاتف يعيد رسم الشاشة كلها من الشجرة في كل مرة. حاول أن تضع الزر بجانب النص بدل تحته.",
    demo: "widgets",
  },
  scene: {
    code: {
      dart: `class TeaCard extends StatelessWidget {
  Widget build(BuildContext context) => Padding(
    padding: EdgeInsets.all(16),
    child: Column(children: [
      Text("Tea"),
      ElevatedButton(onPressed: () {}, child: Text("Add")),
    ]),
  );
}`,
    },
    steps: [
      {
        line: null,
        say: "في Flutter لا يوجد HTML ولا DOM. كل شيء على الشاشة widget: النص، والزر، وحتى المسافة حول الزر. وكل شاشة شجرة من widgets، مثل شجرة DOM التي عرفتها.",
        memory: [],
      },
      {
        line: 1,
        say: "TeaCard صنف يرث StatelessWidget: قطعة واجهة لا تتغير بعد رسمها. هي مثل مكوّن React بلا useState.",
        memory: [card],
        changed: ["TeaCard"],
      },
      {
        line: 2,
        say: "build دالة ترجع شجرة. لا ترسم شيئاً بنفسها، بل تصف: «هذه هي الشاشة». و Flutter هو من يستدعيها، كما يستدعي React مكوّناتك.",
        memory: [card],
      },
      {
        line: 3,
        say: "الجذر Padding: widget تخطيط لا يُرى، يضيف 16 بكسل حول ابن واحد فقط (child)، مثل padding في درس الصندوق.",
        memory: [card, padding],
        changed: ["└ Padding"],
      },
      {
        line: 4,
        say: "ابنه Column: يضع أبناءه (children، قائمة) فوق بعض، مثل flex-direction: column. و Row يضعهم جنباً إلى جنب.",
        memory: [card, padding, column],
        changed: ["  └ Column"],
      },
      {
        line: 5,
        say: "أول أبناء Column: ‏Text، ورقة في الشجرة لا أبناء لها. يرسم كلمة Tea.",
        memory: [card, padding, column, tea],
        changed: ["    ├ Text"],
      },
      {
        line: 6,
        say: "الابن الثاني ElevatedButton. لاحظ: الكلمة على الزر ليست نصاً عادياً بل widget أخرى Text في child. الزر صندوق يحمل widget.",
        memory: [card, padding, column, tea, button, label],
        changed: ["    └ ElevatedButton", "      └ Text"],
      },
      {
        line: 6,
        say: "onPressed: () {}‎ دالة سهمية فارغة تُستدعى عند الضغط، مثل onClick في React. فارغة الآن: StatelessWidget لا يملك حالة يغيّرها.",
        memory: [card, padding, column, tea, button, label],
        read: ["    └ ElevatedButton"],
      },
      {
        line: 8,
        say: "build تعيد الشجرة كاملة: ست عقد. هي كائنات Dart صغيرة رخيصة، مجرد وصف، لا بكسلات بعد.",
        memory: [card, padding, column, tea, button, label],
      },
      {
        line: null,
        say: "الآن يمشي Flutter في الشجرة: يحسب مكان كل صندوق من الأب إلى الأبناء، ثم يرسم البكسلات بنفسه على الشاشة. لا يستعير أزرار أندرويد أو iOS، ولهذا يبدو التطبيق متطابقاً على الاثنين.",
        memory: [card, padding, column, tea, button, label],
        output: ["Tea", "[ Add ]"],
      },
    ],
    notes: {
      dart: "الشجرة تُكتب كاستدعاءات متداخلة: Padding(child: Column(children: [...]))‎. ‏child لابن واحد و children لقائمة أبناء. الفاصلة بعد آخر ابن تجعل المحرر يرتّب الشجرة سطراً سطراً.",
    },
  },
  playground: {
    kind: "trace",
    intro: "Flutter لا يعمل هنا، فهذه محاكاة بـ JavaScript: كل widget كائن صغير فيه نوعه وأبناؤه، و paint دالة تمشي في الشجرة بالعودية وترسمها أسطراً. Column يضع أبناءه في أسطر، و Row يضعهم في سطر واحد.",
    starter: `function Text(s) {
  return { type: "Text", text: s, children: [] };
}
function Column(children) {
  return { type: "Column", children: children };
}
function Row(children) {
  return { type: "Row", children: children };
}
function paint(w) {
  if (w.type === "Text") {
    return w.text;
  }
  const parts = [];
  for (const child of w.children) {
    parts.push(paint(child));
  }
  if (w.type === "Row") {
    return parts.join("  ");
  }
  return parts.join("\\n");
}
const screen = Column([Text("My Shop"), Row([Text("Tea"), Text("[Add]")])]);
console.log(paint(screen));`,
    challenges: [
      "قبل التشغيل: كم سطراً سيُطبع؟ وماذا في كل سطر؟",
      "بدّل Row إلى Column في السطر قبل الأخير. كيف تتغير الشاشة؟ لم نلمس paint.",
      "أضف Text(\"15 SAR\") داخل Row بين Tea و [Add]. أين يظهر؟",
      "راقب المكدّس: كم إطاراً لـ paint يكون مفتوحاً حين يُرسم Tea؟ هذا عمق العقدة في الشجرة.",
    ],
  },
  predict: [
    {
      question: "كيف تظهر الكلمتان على الشاشة؟",
      code: `Row(children: [
  Text("Tea"),
  Text("Coffee"),
])`,
      options: ["جنباً إلى جنب: Tea Coffee", "فوق بعض: Tea ثم Coffee تحتها", "Coffee فقط، لأن الثانية تغطي الأولى"],
      answer: 0,
      why: "Row مثل flex-direction: row: يضع أبناءه أفقياً بالترتيب. لو أردتهما فوق بعض لكتبت Column. الأبناء أنفسهم لم يتغيروا، الأب وحده يقرر التخطيط.",
      scene: flutter(
        `Row(children: [
  Text("Tea"),
  Text("Coffee"),
])`,
        [
          { line: 1, say: "Row يأخذ قائمة أبناء ويصفّهم أفقياً.", memory: [w("Row", "children: 2")] },
          { line: 2, say: "الأول Tea يأخذ مكانه في أول الصف.", memory: [w("Row", "children: 2"), txt("├ Text", "Tea")], changed: ["├ Text"] },
          {
            line: 3,
            say: "الثاني Coffee بجانبه، لا تحته.",
            memory: [w("Row", "children: 2"), txt("├ Text", "Tea"), txt("└ Text", "Coffee")],
            changed: ["└ Text"],
            output: ["Tea Coffee"],
          },
        ],
      ),
    },
    {
      question: "أردنا نصّين داخل Padding. ماذا يقول المترجم؟",
      code: `Padding(
  padding: EdgeInsets.all(8),
  child: [Text("Tea"), Text("15 SAR")],
)`,
      options: ["يرفضه: child يقبل widget واحدة لا قائمة", "يقبله ويضع النصين فوق بعض", "يقبله ويرسم الأول فقط"],
      answer: 0,
      why: "Padding صندوق لابن واحد، ونوع child هو Widget. القائمة ليست Widget، فيرفضها المترجم. الحل: لفّ النصين في Column ثم اجعل Column هو الابن الوحيد.",
      scene: flutter(
        `Padding(
  padding: EdgeInsets.all(8),
  child: [Text("Tea"), Text("15 SAR")],
)`,
        [
          { line: 1, say: "Padding: ابن واحد فقط، اسمه child.", memory: [w("Padding", "child: Widget")] },
          { line: 2, say: "8 بكسل من كل جهة.", memory: [w("Padding", "child: Widget")] },
          {
            line: 3,
            say: "child يُعطى قائمة، والمطلوب Widget واحدة. خط أحمر قبل التشغيل.",
            memory: [w("Padding", "child: Widget")],
            error: "The argument type 'List<Text>' can't be assigned to the parameter type 'Widget?'.",
          },
        ],
      ),
    },
    {
      question: "اضغط الزر 3 مرات. ماذا يظهر في Text؟",
      code: `class Counter extends StatelessWidget {
  int count = 0;
  Widget build(BuildContext context) => Column(children: [
    Text("clicked $count"),
    ElevatedButton(onPressed: () { count++; }, child: Text("+")),
  ]);
}`,
      options: ["clicked 0", "clicked 3", "clicked 1"],
      answer: 0,
      why: "تماماً كـ let count في مكوّن React: الدرج تغيّر إلى 3، لكن لا أحد أخبر Flutter أن يستدعي build من جديد، فالشجرة القديمة باقية. StatelessWidget لا يعيد البناء أبداً. الحل في الدرس القادم: StatefulWidget و setState.",
      scene: flutter(
        `class Counter extends StatelessWidget {
  int count = 0;
  Widget build(BuildContext context) => Column(children: [
    Text("clicked $count"),
    ElevatedButton(onPressed: () { count++; }, child: Text("+")),
  ]);
}`,
        [
          { line: 2, say: "count درج عادي في الكائن.", memory: [{ name: "count", value: "0", type: "number" }] },
          {
            line: 4,
            say: "build يصف Text بالنص clicked 0، و Flutter يرسمه.",
            memory: [{ name: "count", value: "0", type: "number" }, txt("screen", "clicked 0")],
            read: ["count"],
            changed: ["screen"],
          },
          {
            line: 5,
            say: "ثلاث ضغطات: count صار 3. لكن build لم يُستدعَ، فالشجرة لم تتغير.",
            memory: [{ name: "count", value: "3", type: "number" }, txt("screen", "clicked 0")],
            changed: ["count"],
          },
          {
            line: 4,
            say: "الشاشة ما زالت clicked 0.",
            memory: [{ name: "count", value: "3", type: "number" }, txt("screen", "clicked 0")],
            read: ["screen"],
            output: ["clicked 0"],
          },
        ],
      ),
    },
  ],
  code: {
    intro: "Flutter لا يعمل داخل هذا الدرس. هذا تطبيق كامل من ملف واحد main.dart: انسخه إلى dartpad.dev (اختر Flutter) أو أنشئ مشروعاً بـ flutter create shop وضعه في lib/main.dart ثم flutter run. ارسم الشجرة على ورقة قبل أن تشغّله.",
    runnerLang: "text",
    runnerStarter: `import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: ShopScreen()));

class ShopScreen extends StatelessWidget {
  const ShopScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("My Shop")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Today", style: TextStyle(fontSize: 24)),
            Row(children: [
              const Icon(Icons.local_cafe),
              const Expanded(child: Text("Tea  15 SAR")),
              ElevatedButton(onPressed: () {}, child: const Text("Add")),
            ]),
            // try: copy the Row above and make a second product
          ],
        ),
      ),
    );
  }
}
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "text",
      title: "عنوان فوق زر",
      prompt: "رتّب الأسطر لتصنع Column فيه النص Menu ثم تحته زر مكتوب عليه Order.",
      lines: ["Column(", "  children: [", '    Text("Menu"),', '    ElevatedButton(onPressed: () {}, child: Text("Order")),', "  ],", ")"],
      expected: "Menu\n[ Order ]",
    },
    {
      kind: "fill",
      lang: "text",
      title: "جنباً إلى جنب",
      prompt: "أي widget تضع الأيقونة والسعر في سطر واحد، الأيقونة يساراً والسعر بجانبها؟",
      template: '___(children: [\n  Icon(Icons.local_cafe),\n  Text("15 SAR"),\n])',
      options: ["Row", "Column", "Padding"],
      answer: "Row",
      expected: "☕ 15 SAR",
    },
    {
      kind: "order",
      lang: "text",
      title: "widget لا تتغير",
      prompt: "رتّب الأسطر: صنف Greeting يرث StatelessWidget، دالته build ترجع Center فيه النص Hello.",
      lines: ["class Greeting extends StatelessWidget {", "  Widget build(BuildContext context) {", "    return Center(", '      child: Text("Hello"),', "    );", "  }", "}"],
      expected: "Hello",
    },
    {
      kind: "fill",
      lang: "text",
      title: "ابن واحد أم أبناء؟",
      prompt: "Padding صندوق لابن واحد. أي اسم يأخذ الابن؟",
      template: 'Padding(\n  padding: EdgeInsets.all(16),\n  ___: Text("Tea"),\n)',
      options: ["child", "children", "text"],
      answer: "child",
      expected: "Tea",
    },
  ],
  quiz: [
    {
      question: "كم widget في هذه الشجرة؟",
      code: 'Center(\n  child: Column(children: [\n    Text("Tea"),\n    Icon(Icons.star),\n  ]),\n)',
      options: ["4", "2", "3"],
      answer: 0,
      why: "Center و Column widgets تخطيط لا تُرى، لكنها عقد في الشجرة مثل Text و Icon تماماً. في Flutter كل شيء widget، حتى الترتيب والمسافات.",
    },
    {
      question: "في هذا الصف، أي نص يتمدد ليأخذ المساحة الباقية؟",
      code: 'Row(children: [\n  Text("A"),\n  Expanded(child: Text("B")),\n  Text("C"),\n])',
      options: ["B", "A", "C"],
      answer: 0,
      why: "A و C يأخذان عرض نصّيهما فقط، و Expanded يعطي ابنه ما بقي من الصف، مثل flex: 1 في CSS. لذلك يُدفع C إلى آخر الصف.",
    },
    {
      question: "ماذا تعيد build؟",
      code: 'Widget build(BuildContext context) {\n  return Text("Hi");\n}',
      options: ["وصفاً صغيراً للشاشة، يحوّله Flutter إلى بكسلات", "بكسلات مرسومة جاهزة", "زراً حقيقياً من أندرويد"],
      answer: 0,
      why: "Text(\"Hi\") كائن Dart خفيف يقول «هنا نص Hi». build تُستدعى كثيراً، لذلك صُمّمت الـ widgets رخيصة. الرسم الحقيقي يفعله Flutter بعدها.",
    },
    {
      question: "الكلمة Buy على الزر، ما هي في الشجرة؟",
      code: 'ElevatedButton(\n  onPressed: () {},\n  child: Text("Buy"),\n)',
      options: ["widget من نوع Text، ابن الزر", "خاصية نصية في الزر", "لا شيء، الزر يرسمها بنفسه"],
      answer: 0,
      why: "الزر صندوق له child واحد، والابن هنا Text. لهذا تستطيع وضع Row فيه أيقونة ونص بدل Text: أي widget تصلح ابناً.",
    },
    {
      question: "كيف تبدو هذه الشاشة؟",
      code: 'Column(children: [\n  Text("1"),\n  Row(children: [\n    Text("2"),\n    Text("3"),\n  ]),\n])',
      options: ["1 في الأعلى، وتحته 2 و 3 جنباً إلى جنب", "1 2 3 في سطر واحد", "1 ثم 2 ثم 3 كل واحد في سطر"],
      answer: 0,
      why: "Column يضع ابنيه فوق بعض: Text(\"1\") ثم Row. و Row يضع ابنيه في سطر واحد. كل أب يقرر تخطيط أبنائه المباشرين فقط.",
    },
  ],
  next: "state",
};
