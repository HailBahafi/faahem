import type { Project } from "@/lib/types";

export const calculator: Project = {
  slug: "calculator",
  stage: 1,
  title: "آلة حاسبة ولعبة تخمين",
  brief:
    "تجمع هنا كل أساسيات المرحلة: متغيرات، شروط، switch، حلقات، دوال، مصفوفات وأخطاء. تبني دالتين صغيرتين يستعملهما برنامج حقيقي: آلة حاسبة، ولعبة تخمين رقم تعطي تلميحاً بعد كل محاولة.",
  lang: "js",
  steps: [
    "اكتب الدالة calculate(a, op, b) التي ترجع ناتج العملية op على الرقمين: \"+\" و \"-\" و \"*\" و \"/\". استعمل switch.",
    "إذا كانت العملية قسمة والرقم الثاني صفراً، أرجع النص \"error\" بدل أن تقسم.",
    "إذا كانت op عملية غير معروفة، أرجع \"error\" أيضاً (الحالة default).",
    "اكتب الدالة hint(secret, guess) التي ترجع \"higher\" إذا كان الرقم السري أكبر من التخمين، و \"lower\" إذا كان أصغر، و \"correct\" إذا تساويا.",
    "اكتب الدالة countGuesses(secret, guesses) التي تمر على مصفوفة التخمينات بحلقة، وترجع رقم المحاولة التي أصاب فيها اللاعب (أول محاولة = 1)، أو -1 إذا لم يصب أبداً.",
    "اضغط «شغّل الاختبارات» وأصلح ما يفشل حتى تنجح كلها.",
  ],
  starter: `function calculate(a, op, b) {
  // اكتب switch هنا
}

function hint(secret, guess) {
  // "higher" أو "lower" أو "correct"
}

function countGuesses(secret, guesses) {
  // مرّ على guesses بحلقة
}

console.log(calculate(6, "*", 7));
console.log(hint(50, 30));
`,
  solution: `function calculate(a, op, b) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      if (b === 0) {
        return "error";
      }
      return a / b;
    default:
      return "error";
  }
}

function hint(secret, guess) {
  if (secret > guess) {
    return "higher";
  }
  if (secret < guess) {
    return "lower";
  }
  return "correct";
}

function countGuesses(secret, guesses) {
  for (let i = 0; i < guesses.length; i++) {
    if (guesses[i] === secret) {
      return i + 1;
    }
  }
  return -1;
}
`,
  tests: [
    { name: "الجمع والطرح: calculate(2, \"+\", 3) = 5 و calculate(10, \"-\", 4) = 6", code: `console.log(calculate(2, "+", 3) === 5 && calculate(10, "-", 4) === 6);` },
    { name: "الضرب والقسمة: 6 * 7 = 42 و 9 / 3 = 3", code: `console.log(calculate(6, "*", 7) === 42 && calculate(9, "/", 3) === 3);` },
    { name: "القسمة على صفر ترجع \"error\"", code: `console.log(calculate(5, "/", 0) === "error");` },
    { name: "عملية غير معروفة ترجع \"error\"", code: `console.log(calculate(5, "%", 2) === "error");` },
    { name: "hint يعطي التلميح الصحيح في الحالات الثلاث", code: `console.log(hint(50, 30) === "higher" && hint(50, 80) === "lower" && hint(50, 50) === "correct");` },
    { name: "countGuesses يجد رقم المحاولة الصحيحة", code: `console.log(countGuesses(7, [3, 9, 7, 7]) === 3 && countGuesses(1, [1]) === 1);` },
    { name: "countGuesses يرجع -1 إذا لم يصب اللاعب", code: `console.log(countGuesses(4, [1, 2, 3]) === -1 && countGuesses(4, []) === -1);` },
  ],
};
