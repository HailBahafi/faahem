// Integration test for accounts and progress sync against a running server with a database.
// Run: npm run dev (with .env.local), then BASE_URL=http://localhost:3000 npm run test:api
// Every run creates a throwaway account with a random email and password.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

function client() {
  let cookie = "";
  return async (path, method = "GET", body) => {
    const r = await fetch(BASE + path, {
      method,
      headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const set = r.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0].endsWith("=") ? "" : set.split(";")[0];
    return { status: r.status, data: await r.json().catch(() => null) };
  };
}

test("register, sync progress, log out, log back in", async () => {
  const email = `test-${randomBytes(6).toString("hex")}@example.test`;
  const password = randomBytes(12).toString("base64url");
  const a = client();

  assert.equal((await a("/api/auth/me")).data.enabled, true, "server has no DATABASE_URL");
  const reg = await a("/api/auth/register", "POST", { name: "Test Learner", email, password });
  assert.equal(reg.status, 201);
  assert.equal((await a("/api/auth/me")).data.user.email, email);
  assert.equal((await client()("/api/auth/register", "POST", { name: "Again", email, password })).status, 409);
  assert.equal((await a("/api/auth/register", "POST", { name: "x", email: "bad", password: "1" })).status, 400);

  const first = { completed: ["variables"], quiz: { variables: 5 }, station: { variables: 6 }, review: { variables: { level: 0, due: 1 } } };
  assert.deepEqual((await a("/api/progress", "PUT", { progress: first })).data.progress.completed, ["variables"]);

  // A second device signs in with older, different progress: the server merges both.
  const b = client();
  assert.equal((await b("/api/auth/login", "POST", { email, password: password + "x" })).status, 401);
  assert.equal((await b("/api/auth/login", "POST", { email: email.toUpperCase(), password })).status, 200);
  const second = { completed: ["types"], quiz: { variables: 3 }, station: {}, review: {} };
  const merged = (await b("/api/progress", "PUT", { progress: second })).data.progress;
  assert.deepEqual([...merged.completed].sort(), ["types", "variables"]);
  assert.equal(merged.quiz.variables, 5);
  assert.deepEqual((await a("/api/progress")).data.progress.completed.sort(), ["types", "variables"]);

  await b("/api/auth/logout", "POST");
  assert.equal((await b("/api/auth/me")).data.user, null);
  assert.equal((await b("/api/progress")).status, 401);
  assert.equal((await a("/api/progress", "PUT", { progress: { completed: "nope" } })).status, 400);
});
