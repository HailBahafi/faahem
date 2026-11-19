import assert from "node:assert/strict";
import { test } from "node:test";
import { runPython, tracePython } from "../scripts/python.mjs";

test("python runner captures output and errors", () => {
  assert.deepEqual(runPython("x = 2\nprint(x * 3)\nprint('hi', x)").out, ["6", "hi 2"]);
  assert.equal(runPython("print(y)").error.name, "NameError");
});

test("python tracer shows frames, heap and changes", () => {
  const r = tracePython("def square(n):\n    result = n * n\n    return result\n\nnums = [1, 2]\nb = nums\nb.append(square(3))\nprint(nums)");
  assert.equal(r.error, null);
  assert.deepEqual(r.output, ["[1, 2, 9]"]);
  assert.equal(Math.max(...r.steps.map((s) => s.frames.length)), 2);
  const inside = r.steps.find((s) => s.frames.length === 2 && s.frames[1].vars.some((v) => v.name === "result"));
  assert.equal(inside.frames[1].name, "square");
  const last = r.steps[r.steps.length - 1];
  const vars = Object.fromEntries(last.frames[0].vars.map((v) => [v.name, v]));
  assert.equal(vars.nums.ref, vars.b.ref);
  assert.equal(last.heap.find((h) => h.id === vars.nums.ref).items.length, 3);
  const assign = r.steps.find((s) => s.line === 5);
  assert.match(assign.say, /nums/);
  assert.match(tracePython("while True:\n    pass").error, /حلقة/);
  assert.match(tracePython("print(1/0)").error, /ZeroDivisionError/);
});
