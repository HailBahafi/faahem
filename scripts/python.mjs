// Runs the course's Python tracer with the local Python (validator and tests), mirroring Pyodide.
import { spawnSync } from "node:child_process";
import { PY_TRACER } from "../src/lib/python/tracerSource.ts";

function call(fn, code) {
  const r = spawnSync("python", ["-c", `${PY_TRACER}\nimport sys\nsys.stdout.write(${fn}(sys.stdin.read()))`], {
    input: code,
    encoding: "utf8",
    timeout: 10000,
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
  });
  if (r.error || r.status !== 0) return null;
  return JSON.parse(r.stdout);
}

/** { out: string[], error: {name, message} | null } */
export const runPython = (code) => call("__faahem_run", code) ?? { out: [], error: { name: "PythonUnavailable", message: "python failed" } };
/** { steps, output, error } in the same shape as the JS tracer. */
export const tracePython = (code) => call("__faahem_trace", code) ?? { steps: [], output: [], error: "python failed" };
