import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeProgress, sameProgress } from "../src/lib/mergeProgress.ts";

const p = (o) => ({ completed: [], quiz: {}, station: {}, review: {}, ...o });

test("merging never loses progress from either side", () => {
  const phone = p({ completed: ["variables"], quiz: { variables: 4 }, station: { variables: 6, types: 2 }, review: { variables: { level: 1, due: 500 } } });
  const laptop = p({ completed: ["types"], quiz: { variables: 5, types: 4 }, station: { types: 4 }, review: { variables: { level: 0, due: 900 }, types: { level: 0, due: 100 } } });
  const m = mergeProgress(phone, laptop);
  assert.deepEqual([...m.completed].sort(), ["types", "variables"]);
  assert.deepEqual(m.quiz, { variables: 5, types: 4 });
  assert.deepEqual(m.station, { variables: 6, types: 4 });
  assert.deepEqual(m.review.variables, { level: 1, due: 500 });
  assert.deepEqual(m.review.types, { level: 0, due: 100 });
  assert.ok(sameProgress(mergeProgress(m, phone), m));
  assert.ok(sameProgress(mergeProgress(laptop, phone), m));
});
