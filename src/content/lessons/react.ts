import type { Lesson } from "@/lib/types";

// React, ReactDOM and Babel (which turns JSX into plain JS inside the page), pinned to exact versions.
const LIBS = `<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.26.4/babel.min.js"></script>`;
const LIBS_ONE_LINE = LIBS.replace(/\n/g, "");

// Checks press a button through ReactDOM.flushSync so React finishes the update before the check reads the page.
const press = (times: number, read: string) =>
  `(() => { const b = document.querySelector("button"); for (let i = 0; i < ${times}; i++) ReactDOM.flushSync(() => b.click()); return ${read}; })()`;

export const react: Lesson = {
  slug: "react",
  stage: 6,
  number: "6.9",
  title: "React",
  subtitle: "صِف الشاشة لكل حالة، واترك React يعدّل الصفحة",
  minutes: 22,
  singleLanguage: true,
  problem: {
    title: "ثلاثة أماكن تتغير معاً",
    body: "قائمة مهام بنيناها مرتين. على اليمين نعدّل DOM بأيدينا: عند كل تغيير يجب أن نتذكر القائمة والعدّاد ورسالة «لا مهام». وعلى اليسار React يعيد حساب الشاشة من الحالة. أضف مهام ثم احذف واحدة، وراقب الجهتين.",
    demo: "react",
  },
  scene: {
    code: {
      js: `function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      clicked {count}
    </button>
  );
}
root.render(<Counter />);`,
    },
    steps: [
      {
        line: null,
        say: "في درس DOM كنا نغيّر الصفحة بأيدينا خطوة خطوة. هنا لن نلمس DOM أبداً: سنكتب دالة تصف شكل الزر لكل قيمة من count.",
        memory: [],
      },
      {
        line: 9,
        say: "render تسلّم React المكوّن Counter. المكوّن دالة عادية، لكن React هو من يستدعيها، لا نحن.",
        memory: [],
      },
      {
        line: 2,
        say: "useState(0) تحفظ الحالة 0 عند React، خارج الدالة. وتعيد شيئين نسمّيهما: count لقراءة القيمة، و setCount لطلب تغييرها.",
        memory: [
          { name: "state (React)", value: "0", type: "number" },
          { name: "count", value: "0", type: "number", constant: true },
        ],
        changed: ["state (React)", "count"],
      },
      {
        line: 4,
        say: "return لا يغيّر الصفحة. يعيد وصفاً فقط (JSX): زر مكتوب عليه clicked 0.",
        memory: [
          { name: "state (React)", value: "0", type: "number" },
          { name: "count", value: "0", type: "number", constant: true },
          { name: "UI", value: '"<button>clicked 0</button>"', type: "string" },
        ],
        changed: ["UI"],
        read: ["count"],
      },
      {
        line: 9,
        say: "أول مرة: لا يوجد شيء في الصفحة، فيبني React من الوصف عقدة button حقيقية في DOM.",
        memory: [
          { name: "state (React)", value: "0", type: "number" },
          { name: "count", value: "0", type: "number", constant: true },
          { name: "UI", value: '"<button>clicked 0</button>"', type: "string" },
          { name: "DOM", value: '"<button>clicked 0</button>"', type: "string" },
        ],
        changed: ["DOM"],
        read: ["UI"],
      },
      {
        line: 4,
        say: "ضغطة! onClick يستدعي setCount(0 + 1). React يحفظ 1 عنده، و count في هذا التشغيل يبقى 0. الشاشة لم تتغير بعد.",
        memory: [
          { name: "state (React)", value: "1", type: "number" },
          { name: "count", value: "0", type: "number", constant: true },
          { name: "UI", value: '"<button>clicked 0</button>"', type: "string" },
          { name: "DOM", value: '"<button>clicked 0</button>"', type: "string" },
        ],
        changed: ["state (React)"],
        read: ["count"],
      },
      {
        line: 1,
        say: "تغيّرت الحالة، فيستدعي React الدالة Counter من جديد، من أولها. تشغيل جديد يعني أدراجاً جديدة.",
        memory: [
          { name: "state (React)", value: "1", type: "number" },
          { name: "DOM", value: '"<button>clicked 0</button>"', type: "string" },
        ],
      },
      {
        line: 2,
        say: "useState هذه المرة لا تبدأ من 0: تعيد ما حفظه React. فيصير count = 1.",
        memory: [
          { name: "state (React)", value: "1", type: "number" },
          { name: "count", value: "1", type: "number", constant: true },
          { name: "DOM", value: '"<button>clicked 0</button>"', type: "string" },
        ],
        changed: ["count"],
        read: ["state (React)"],
      },
      {
        line: 5,
        say: "وصف جديد للحالة الجديدة: clicked 1. لاحظ أننا لم نكتب أي سطر يعدّل الزر.",
        memory: [
          { name: "state (React)", value: "1", type: "number" },
          { name: "count", value: "1", type: "number", constant: true },
          { name: "UI", value: '"<button>clicked 1</button>"', type: "string" },
          { name: "DOM", value: '"<button>clicked 0</button>"', type: "string" },
        ],
        changed: ["UI"],
        read: ["count"],
      },
      {
        line: 5,
        say: "React يقارن الوصف الجديد بالقديم: الفرق نص واحد. فيغيّر عقدة النص داخل الزر فقط، ويبقى الزر نفسه كما هو.",
        memory: [
          { name: "state (React)", value: "1", type: "number" },
          { name: "count", value: "1", type: "number", constant: true },
          { name: "UI", value: '"<button>clicked 1</button>"', type: "string" },
          { name: "DOM", value: '"<button>clicked 1</button>"', type: "string" },
        ],
        changed: ["DOM"],
        read: ["UI"],
      },
    ],
    notes: {
      js: "الوسوم داخل JavaScript اسمها JSX، وليست HTML: أداة مثل Babel تحوّل <button> إلى استدعاء React.createElement(\"button\", ...)، وكل {...} داخلها تعبير JS يُحسب.",
    },
  },
  playground: {
    kind: "html",
    intro: "صفحة React حقيقية: مكوّن App يملك الحالة todos، ومكوّن Item يستقبل نصّه من props. البيانات تنزل من App إلى Item، والشاشة كلها محسوبة من todos. عدّل وراقب المعاينة.",
    starter: `<div id="root"></div>
${LIBS}
<script type="text/babel">
const { useState } = React; // like: import { useState } from "react"

function Item(props) {
  return <li>{props.text}</li>;
}

function App() {
  const [todos, setTodos] = useState(["milk", "bread"]);
  return (
    <div>
      <h1>{todos.length} tasks</h1>
      <ul>
        {todos.map((t) => <Item key={t} text={t} />)}
      </ul>
      <button onClick={() => setTodos(todos.concat("task " + (todos.length + 1)))}>Add</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
</script>`,
    challenges: [
      "اضغط Add ثلاث مرات. كم سطراً كتبنا لتحديث العنوان h1؟ لا شيء: هو محسوب من todos.length في كل تشغيل.",
      "اجعل القائمة الأولى فارغة useState([]) وأضف تحت العنوان: {todos.length === 0 && <p>No tasks</p>}. اضغط Add: من أخفى الرسالة؟",
      "أضف عدّاداً ثانياً: const [count, setCount] = useState(0) وزراً يعرض clicked {count}. هل يتأثر أحدهما بالآخر؟",
      "مرّر لكل Item دالة onRemove={() => setTodos(todos.filter((x) => x !== t))}، وفي Item أضف زراً onClick={props.onRemove}. الحدث يصعد للأب، والأب هو من يغيّر الحالة.",
    ],
  },
  predict: [
    {
      question: "view تحسب الشاشة من الحالة. ماذا يُطبع؟",
      code: `function view(count) {
  return "clicked " + count;
}
let state = 0;
let screen = view(state);
state = 5;
console.log(screen);`,
      options: ["clicked 5", "clicked 0", "clicked 05"],
      answer: 1,
      why: "screen نتيجة استدعاء view مع 0، حُسبت مرة واحدة. تغيير state بعدها لا يعيد الحساب وحده. لهذا يوجد setCount: هو الذي يخبر React أن يستدعي المكوّن من جديد.",
    },
    {
      question: "اضغط الزر 3 مرات. ماذا يظهر عليه؟",
      code: `function Counter() {
  let count = 0;
  return (
    <button onClick={() => { count = count + 1; }}>
      clicked {count}
    </button>
  );
}`,
      options: ["clicked 3", "clicked 0", "خطأ"],
      answer: 1,
      why: "count درج عادي داخل تشغيل واحد للدالة. الضغطات غيّرته، لكن لا أحد أخبر React، فلم يُعِد تشغيل Counter ولم يتغير DOM. ولو أعاده لبدأ count من 0 من جديد.",
      scene: {
        code: {
          js: `function Counter() {
  let count = 0;
  return (
    <button onClick={() => { count = count + 1; }}>
      clicked {count}
    </button>
  );
}`,
        },
        steps: [
          { line: null, say: "React يستدعي Counter أول مرة.", memory: [] },
          {
            line: 2,
            say: "count هنا درج عادي، لا حالة عند React.",
            memory: [{ name: "count", value: "0", type: "number" }],
            changed: ["count"],
          },
          {
            line: 5,
            say: "الوصف: clicked 0، فيبني React الزر في DOM.",
            memory: [
              { name: "count", value: "0", type: "number" },
              { name: "DOM", value: '"clicked 0"', type: "string" },
            ],
            changed: ["DOM"],
            read: ["count"],
          },
          {
            line: 4,
            say: "ثلاث ضغطات: الدرج count صار 3. لكن React لا يعلم شيئاً، فلا يعيد تشغيل الدالة.",
            memory: [
              { name: "count", value: "3", type: "number" },
              { name: "DOM", value: '"clicked 0"', type: "string" },
            ],
            changed: ["count"],
          },
          {
            line: 5,
            say: "الشاشة ما زالت clicked 0. لا تتغير الصفحة إلا إذا تغيرت حالة React.",
            memory: [
              { name: "count", value: "3", type: "number" },
              { name: "DOM", value: '"clicked 0"', type: "string" },
            ],
            read: ["DOM"],
          },
        ],
      },
    },
    {
      question: "اضغط الزر مرة واحدة. ماذا يظهر عليه؟",
      code: `function Counter() {
  const [count, setCount] = useState(0);
  function addTwo() {
    setCount(count + 1);
    setCount(count + 1);
  }
  return <button onClick={addTwo}>{count}</button>;
}`,
      options: ["2", "1", "0"],
      answer: 1,
      why: "count في هذا التشغيل ثابت على 0، فالسطران يطلبان الشيء نفسه: اجعلها 0 + 1. React يعيد التشغيل مرة بعد الحدث، فيظهر 1.",
      scene: {
        code: {
          js: `function Counter() {
  const [count, setCount] = useState(0);
  function addTwo() {
    setCount(count + 1);
    setCount(count + 1);
  }
  return <button onClick={addTwo}>{count}</button>;
}`,
        },
        steps: [
          {
            line: 2,
            say: "التشغيل الأول: الحالة 0، و count = 0.",
            memory: [
              { name: "state (React)", value: "0", type: "number" },
              { name: "count", value: "0", type: "number", constant: true },
            ],
            changed: ["state (React)", "count"],
          },
          {
            line: 4,
            say: "ضغطة. setCount(0 + 1): اجعل الحالة 1.",
            memory: [
              { name: "state (React)", value: "1", type: "number" },
              { name: "count", value: "0", type: "number", constant: true },
            ],
            changed: ["state (React)"],
            read: ["count"],
          },
          {
            line: 5,
            say: "count ما زال 0 في هذا التشغيل، فهذا أيضاً setCount(0 + 1). الحالة تبقى 1.",
            memory: [
              { name: "state (React)", value: "1", type: "number" },
              { name: "count", value: "0", type: "number", constant: true },
            ],
            read: ["count"],
          },
          {
            line: 2,
            say: "بعد الحدث يعيد React تشغيل Counter: count = 1.",
            memory: [
              { name: "state (React)", value: "1", type: "number" },
              { name: "count", value: "1", type: "number", constant: true },
            ],
            changed: ["count"],
          },
          {
            line: 7,
            say: "الوصف الجديد: زر مكتوب عليه 1.",
            memory: [
              { name: "state (React)", value: "1", type: "number" },
              { name: "count", value: "1", type: "number", constant: true },
              { name: "DOM", value: '"1"', type: "string" },
            ],
            changed: ["DOM"],
            read: ["count"],
          },
        ],
      },
    },
  ],
  code: {
    intro: "مصباح ومفتاح: App يملك الحالة on. البيانات تنزل إلى Lamp عبر props، والحدث يصعد من Switch عبر الدالة onToggle التي أعطاها له App. لا أحد غير App يغيّر on. شغّل الصفحة واضغط المفتاح.",
    runnerLang: "html",
    runnerStarter: `<div id="root"></div>
${LIBS}
<script type="text/babel">
const { useState } = React;

function Lamp(props) {
  return <p>{props.on ? "light: ON" : "light: off"}</p>;
}

function Switch(props) {
  return <button onClick={props.onToggle}>switch</button>;
}

function App() {
  const [on, setOn] = useState(false);
  return (
    <div>
      <Lamp on={on} />
      <Switch onToggle={() => setOn(!on)} />
      {/* try: add a second <Lamp on={on} />. One state, two lamps, both always agree. */}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
</script>
`,
  },
  exercises: [
    {
      kind: "order",
      lang: "html",
      title: "أول مكوّن",
      prompt: "رتّب الأسطر حتى تعرض الصفحة عنواناً فيه Hi Sara. المكوّن Hello يأخذ الاسم من props.",
      lines: [
        '<div id="root"></div>',
        LIBS_ONE_LINE,
        '<script type="text/babel">',
        "function Hello(props) {",
        "  return <h1>Hi {props.name}</h1>;",
        "}",
        'ReactDOM.createRoot(document.getElementById("root")).render(<Hello name="Sara" />);',
        "</script>",
      ],
      check: 'document.querySelector("h1").textContent',
      expected: "Hi Sara",
    },
    {
      kind: "fill",
      lang: "html",
      title: "العدّاد",
      prompt: "أي تعبير في onClick يجعل الرقم يصير 2 بعد ضغطتين؟",
      template: `<div id="root"></div>
${LIBS}
<script type="text/babel">
function Counter() {
  const [count, setCount] = React.useState(0);
  return <button onClick={() => ___}>{count}</button>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);
</script>`,
      options: ["setCount(count + 1)", "count + 1", "setCount(count)"],
      check: press(2, 'document.querySelector("button").textContent'),
      expected: "2",
    },
    {
      kind: "fix",
      lang: "html",
      title: "الزر الذي لا يتحرك",
      prompt: "الزر يبقى على Clicked 0 مهما ضغطت. أصلحه حتى يعرض Clicked 3 بعد ثلاث ضغطات.",
      code: `<div id="root"></div>
${LIBS}
<script type="text/babel">
function Counter() {
  let count = 0;
  return <button onClick={() => { count = count + 1; }}>Clicked {count}</button>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);
</script>`,
      hint: "React لا يعيد رسم المكوّن إلا إذا تغيرت حالته. استبدل الدرج العادي بـ const [count, setCount] = React.useState(0) واستدعِ setCount في onClick.",
      solution: `<div id="root"></div>
${LIBS}
<script type="text/babel">
function Counter() {
  const [count, setCount] = React.useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count}</button>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<Counter />);
</script>`,
      check: press(3, 'document.querySelector("button").textContent'),
      expected: "Clicked 3",
    },
    {
      kind: "write",
      lang: "html",
      title: "قائمة الفواكه",
      prompt: "اكتب مكوّناً Fruit يعرض <li> فيه props.name، ثم اجعل App يرسم Fruit لكل عنصر في fruits داخل <ul> باستخدام map و key.",
      starter: `<div id="root"></div>
${LIBS}
<script type="text/babel">
const fruits = ["apple", "banana", "kiwi"];

// write Fruit here

function App() {
  return <ul></ul>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
</script>`,
      hint: "function Fruit(props) { return <li>{props.name}</li>; } ثم داخل ul: {fruits.map((f) => <Fruit key={f} name={f} />)}",
      solution: `<div id="root"></div>
${LIBS}
<script type="text/babel">
const fruits = ["apple", "banana", "kiwi"];

function Fruit(props) {
  return <li>{props.name}</li>;
}

function App() {
  return <ul>{fruits.map((f) => <Fruit key={f} name={f} />)}</ul>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
</script>`,
      check: 'Array.from(document.querySelectorAll("li")).map((li) => li.textContent).join(",")',
      expected: "apple,banana,kiwi",
    },
  ],
  quiz: [
    {
      question: "بعد تحميل الصفحة وضغطتين على الزر، كم مرة استُدعيت الدالة Counter؟",
      code: `function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`,
      options: ["مرة واحدة", "3 مرات", "مرتين"],
      answer: 1,
      why: "مرة لأول رسم، ثم مرة بعد كل تغيير في الحالة. كل تشغيل يحسب وصفاً جديداً من الحالة الحالية.",
    },
    {
      question: "count تتغير من 0 إلى 1. ما الذي يغيّره React في DOM؟",
      code: `<div>
  <h1>Shop</h1>
  <p>{count} items</p>
</div>`,
      options: ["يعيد بناء div وكل ما فيه", "النص داخل p فقط", "h1 و p"],
      answer: 1,
      why: "React يقارن الوصف الجديد بالقديم. div و h1 لم يتغيرا، والفرق الوحيد نص الرقم داخل p، فيلمس تلك العقدة وحدها.",
    },
    {
      question: "ضغطنا زر AddButton مرتين. ماذا يعرض p؟",
      code: `function AddButton(props) {
  return <button onClick={props.onAdd}>+</button>;
}
function Parent() {
  const [n, setN] = useState(0);
  return (
    <div>
      <p>{n}</p>
      <AddButton onAdd={() => setN(n + 1)} />
    </div>
  );
}`,
      options: ["2", "0", "خطأ: الابن لا يملك n"],
      answer: 0,
      why: "الابن لا يغيّر n بنفسه، بل يستدعي الدالة التي نزلت إليه في props. هي دالة الأب، فتغيّر حالة الأب، فيعيد React رسم Parent: الحدث يصعد والبيانات تنزل.",
    },
    {
      question: "القائمة [\"tea\", \"milk\"] صارت [\"sugar\", \"tea\", \"milk\"]. ماذا يفعل React بعناصر li؟",
      code: `<ul>
  {items.map((x) => <li key={x}>{x}</li>)}
</ul>`,
      options: ["يعيد بناء li الثلاثة", "ينشئ li واحداً لـ sugar ويُبقي الاثنين", "يغيّر نص أول li إلى sugar ويضيف li في الآخر"],
      answer: 1,
      why: "key اسم ثابت لكل عنصر. React يطابق القديم بالجديد بالمفتاح: tea و milk موجودان من قبل فيبقيان، و sugar جديد فيُنشأ له li واحد في أول القائمة.",
    },
    {
      question: "loggedIn كانت false، ثم ضغط المستخدم الزر. ماذا يبقى على الشاشة؟",
      code: `function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  return loggedIn
    ? <p>Welcome</p>
    : <button onClick={() => setLoggedIn(true)}>Log in</button>;
}`,
      options: ["Welcome والزر معاً", "Welcome فقط", "الزر فقط"],
      answer: 1,
      why: "الشاشة دالة في الحالة: مع true يصف App فقرة Welcome وحدها. React يرى أن الزر لم يعد في الوصف فيزيله، ويضيف p. لم نكتب سطر إخفاء واحداً.",
    },
  ],
  next: "rest",
};
