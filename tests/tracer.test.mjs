// Run: node --test tests/
import assert from "node:assert/strict";
import { test } from "node:test";
import { trace } from "../src/lib/tracer/tracer.ts";

const last = (r) => r.steps[r.steps.length - 1];
const vars = (step, frame = 0) => Object.fromEntries(step.frames[frame].vars.map((v) => [v.name, v.value]));

test("variables copy values", () => {
  const r = trace('let score = 0;\nlet name = "Sara";\nscore = score + 10;\nlet bonus = score;\nscore = 50;\nconsole.log(score, bonus);');
  assert.equal(r.error, undefined);
  assert.deepEqual(r.output, ["50 10"]);
  assert.deepEqual(vars(last(r)), { score: "50", name: '"Sara"', bonus: "10" });
  assert.equal(r.steps[3].line, 3);
  assert.deepEqual(r.steps[3].changed, ["score"]);
});

test("function calls push and pop frames", () => {
  const r = trace("function square(n) {\n  let result = n * n;\n  return result;\n}\nfunction sum(a, b) {\n  return square(a) + square(b);\n}\nlet total = sum(2, 3);\nconsole.log(total);");
  assert.equal(r.error, undefined);
  assert.deepEqual(r.output, ["13"]);
  const deepest = Math.max(...r.steps.map((s) => s.frames.length));
  assert.equal(deepest, 3);
  const inSquare = r.steps.find((s) => s.frames.length === 3 && s.frames[2].vars.some((v) => v.name === "result"));
  assert.equal(inSquare.frames[2].name, "square");
  assert.equal(last(r).frames.length, 1);
});

test("arrays are shared by reference", () => {
  const r = trace("let a = [1, 2, 3];\nlet b = a;\nb.push(4);\nconsole.log(a);\nlet user = { name: \"Sara\", age: 20 };\nuser.age = 21;");
  assert.equal(r.error, undefined);
  assert.deepEqual(r.output, ["[1, 2, 3, 4]"]);
  const s = last(r);
  const [a, b] = s.frames[0].vars;
  assert.equal(a.ref, b.ref);
  const arr = s.heap.find((h) => h.id === a.ref);
  assert.equal(arr.items.length, 4);
  const obj = s.heap.find((h) => h.kind === "object");
  assert.equal(obj.items.find((i) => i.name === "age").value, "21");
  assert.ok(r.steps.some((st) => st.changedHeap.includes(a.ref)));
});

test("loops, recursion and switch", () => {
  assert.deepEqual(trace("let sum = 0;\nfor (let i = 1; i <= 4; i++) {\n  sum += i;\n}\nconsole.log(sum);").output, ["10"]);
  const f = trace("function fact(n) {\n  if (n <= 1) return 1;\n  return n * fact(n - 1);\n}\nconsole.log(fact(4));");
  assert.deepEqual(f.output, ["24"]);
  assert.equal(Math.max(...f.steps.map((s) => s.frames.length)), 5);
  const sw = trace('let d = 2;\nswitch (d) {\n  case 1:\n    console.log("one");\n    break;\n  case 2:\n    console.log("two");\n  default:\n    console.log("fall");\n}');
  assert.deepEqual(sw.output, ["two", "fall"]);
  const w = trace("let i = 0;\nwhile (true) {\n  i++;\n  if (i === 3) break;\n}\nfor (const x of [5, 6]) { console.log(x); }\nconsole.log(i, `i=${i}`);");
  assert.deepEqual(w.output, ["5", "6", "3 i=3"]);
  const cl = trace("const add = (a, b) => a + b;\nconst user = { greet(n) { return 'hi ' + n; } };\nconsole.log(add(1, 2), user.greet('x'), 'abc'.toUpperCase(), [1,2].join('-'));");
  assert.equal(cl.error, undefined);
  assert.deepEqual(cl.output, ["3 hi x ABC 1-2"]);
});

test("try, catch, throw and finally", () => {
  const r = trace('function div(a, b) {\n  if (b === 0) {\n    throw new Error("cannot divide by zero");\n  }\n  return a / b;\n}\ntry {\n  console.log(div(6, 2));\n  console.log(div(1, 0));\n} catch (e) {\n  console.log("caught: " + e.message);\n} finally {\n  console.log("done");\n}');
  assert.equal(r.error, undefined);
  assert.deepEqual(r.output, ["3", "caught: cannot divide by zero", "done"]);
  assert.equal(last(r).frames.length, 1);
  const js = trace("try {\n  let x = y;\n} catch (err) {\n  console.log(err.name);\n}");
  assert.deepEqual(js.output, ["ReferenceError"]);
  assert.match(trace('throw new Error("boom");').error, /لم يُلتقط.*boom/);
});

test("errors are explained in Arabic", () => {
  assert.match(trace("const x = 1;\nx = 2;").error, /const/);
  assert.match(trace("console.log(y);").error, /غير موجود/);
  assert.match(trace("let i = 0;\nwhile (true) { i++; }").error, /حلقة/);
  assert.match(trace("class A {}").error, /class/);
  assert.match(trace("let = ;").error, /خطأ في كتابة/);
  const r = trace("const x = 1;\nx = 2;");
  assert.ok(last(r).error);
  assert.equal(last(r).line, 2);
});

test("for-let gives each iteration its own binding; arr[i]() calls; method on undefined", () => {
  const r = trace("const fs = [];\nfor (let i = 0; i < 3; i++) {\n  fs.push(function () { return i; });\n}\nconsole.log(fs[0](), fs[1](), fs[2]());");
  assert.deepEqual(last(r).output, ["0 1 2"]);
  assert.match(trace("let u;\nu.trim();").error ?? last(trace("let u;\nu.trim();")).error ?? "", /TypeError|Cannot read/);
});
