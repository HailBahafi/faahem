/** Ready-made programs for the visualizer, each showing one idea of the machine. */
export const EXAMPLES: { title: string; idea: string; code: string }[] = [
  {
    title: "الدوال والمكدّس",
    idea: "كل استدعاء يضع إطاراً جديداً فوق المكدّس، و return يزيله.",
    code: `function square(n) {
  let result = n * n;
  return result;
}

function sumOfSquares(a, b) {
  return square(a) + square(b);
}

let total = sumOfSquares(2, 3);
console.log(total);`,
  },
  {
    title: "حلقة for",
    idea: "الشرط يُفحص قبل كل جولة، و i++ يعمل بعد كل جولة.",
    code: `let sum = 0;
for (let i = 1; i <= 4; i++) {
  sum = sum + i;
}
console.log(sum);`,
  },
  {
    title: "المراجع والمصفوفات",
    idea: "المتغير لا يحمل المصفوفة نفسها، بل سهماً إليها. سهمان = مصفوفة واحدة.",
    code: `let a = [1, 2, 3];
let b = a;
b.push(4);
console.log(a);

let c = [1, 2, 3];
console.log(a === c);`,
  },
  {
    title: "الكائنات",
    idea: "الكائن مجموعة أدراج بأسماء، يعيش في الكومة.",
    code: `let user = { name: "Sara", age: 20 };
let same = user;
same.age = 21;
console.log(user.age);
user.city = "Riyadh";`,
  },
  {
    title: "العودية",
    idea: "الدالة تستدعي نفسها، فتتراكم الإطارات ثم تُزال واحداً واحداً.",
    code: `function fact(n) {
  if (n <= 1) {
    return 1;
  }
  return n * fact(n - 1);
}

console.log(fact(4));`,
  },
  {
    title: "switch",
    idea: "switch يقفز إلى الحالة المطابقة، وبدون break يكمل إلى ما بعدها.",
    code: `let day = 5;
let name;
switch (day) {
  case 5:
    name = "الجمعة";
    break;
  case 6:
    name = "السبت";
    break;
  default:
    name = "يوم عمل";
}
console.log(name);`,
  },
  {
    title: "while وأعلى درجة",
    idea: "حلقة تمشي على المصفوفة بفهرس وتحتفظ بأكبر قيمة رأتها.",
    code: `let scores = [70, 95, 82];
let best = scores[0];
let i = 1;
while (i < scores.length) {
  if (scores[i] > best) {
    best = scores[i];
  }
  i++;
}
console.log(best);`,
  },
];

/** Python versions for the visualizer's Python mode (traced in the browser by Pyodide). */
export const PY_EXAMPLES: { title: string; idea: string; code: string }[] = [
  {
    title: "الدوال والمكدّس",
    idea: "في بايثون أيضاً: كل استدعاء إطار جديد فوق المكدّس، و return يزيله.",
    code: `def square(n):
    result = n * n
    return result

def sum_of_squares(a, b):
    return square(a) + square(b)

total = sum_of_squares(2, 3)
print(total)`,
  },
  {
    title: "القوائم والمراجع",
    idea: "القائمة تعيش في الكومة، والمتغير يحمل سهماً إليها: b = a لا ينسخ القائمة.",
    code: `a = [1, 2, 3]
b = a
b.append(4)
print(a)
c = a.copy()
c.append(5)
print(a, c)`,
  },
  {
    title: "القواميس",
    idea: "القاموس أدراج بأسماء، مثل الكائن في JavaScript.",
    code: `user = {"name": "Sara", "age": 20}
user["age"] = 21
user["city"] = "Riyadh"
for key in user:
    print(key, user[key])`,
  },
  {
    title: "العودية",
    idea: "الإطارات تتراكم حتى الحالة الأساسية ثم تُزال واحداً واحداً.",
    code: `def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)

print(fact(4))`,
  },
];
