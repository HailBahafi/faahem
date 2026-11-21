import { clientKey, fail, json, readJson } from "@/lib/server/http";

// Runs Go, Rust and Dart on a Piston server (RUN_SERVICE_URL). Piston compiles and runs each
// program in an isolated container with time and memory limits and no network.
const PISTON_LANG = { go: "go", rust: "rust", dart: "dart" } as const;
type NativeLang = keyof typeof PISTON_LANG;
const FILE = { go: "main.go", rust: "main.rs", dart: "main.dart" };
const MAX_CODE = 50_000;

// At most 30 runs per minute per client (per server instance).
const hits = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > 30;
}

interface PistonStage { stdout: string; stderr: string; code: number | null; signal: string | null }

export async function POST(req: Request) {
  const base = process.env.RUN_SERVICE_URL;
  if (!base) return fail("runner-off", 503);
  const body = await readJson<{ lang?: string; code?: string }>(req);
  const lang = body?.lang as NativeLang;
  if (!body || !(lang in PISTON_LANG) || typeof body.code !== "string") return fail("bad-request");
  if (body.code.length > MAX_CODE) return fail("too-long");
  if (limited(clientKey(req))) return fail("rate-limited", 429);

  let r: Response;
  try {
    r = await fetch(`${base.replace(/\/$/, "")}/api/v2/execute`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(process.env.RUN_SERVICE_TOKEN ? { authorization: process.env.RUN_SERVICE_TOKEN } : {}) },
      body: JSON.stringify({
        language: PISTON_LANG[lang],
        version: "*",
        files: [{ name: FILE[lang], content: body.code }],
        compile_timeout: 20_000,
        run_timeout: 5_000,
        run_memory_limit: 256 * 1024 * 1024,
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return fail("runner-unreachable", 502);
  }
  if (!r.ok) return fail("runner-error", 502);
  const res = (await r.json()) as { compile?: PistonStage; run?: PistonStage };
  const lines = (s = "") => s.replace(/\n$/, "").split("\n").filter((l, k, a) => l !== "" || k < a.length - 1);
  if (res.compile && res.compile.code !== 0) {
    return json({ out: [], error: { name: "CompileError", message: (res.compile.stderr || res.compile.stdout).slice(0, 4000) } });
  }
  const run = res.run;
  if (!run) return fail("runner-error", 502);
  const out = lines(run.stdout);
  if (run.signal === "SIGKILL") return json({ out, timedOut: true });
  if (run.code !== 0) return json({ out, error: { name: "RuntimeError", message: run.stderr.slice(0, 4000) || `exit ${run.code}` } });
  return json({ out });
}
